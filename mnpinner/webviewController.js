/**
 * 文献管理视图控制器（精简版）
 *
 * 保留 main.js 实际使用的功能：
 * - WebView 管理
 * - 关闭按钮和拖动手势
 * - 显示/隐藏动画
 * - WebView 与 JavaScript 交互
 */

// UI 布局常量
const UI_CONSTANTS = {
  PAGE_ROW_HEIGHT: 55,        // 页面行高度
  CARD_ROW_HEIGHT: 55,        // 卡片行高度
  BUTTON_WIDTH: 35,           // 按钮宽度
  BUTTON_HEIGHT: 30,          // 按钮高度
  TAB_SPACING: 5,             // 标签间距
  EDGE_SNAP_DISTANCE: 40,     // 边缘吸附距离
  MIN_WIDTH: 180,             // 最小宽度
  MIN_HEIGHT: 150             // 最小高度
}

// 页面标题预设短语
const PAGE_TITLE_PRESETS = [
  "Conway 泛函",
  "Rudin 泛函"
];

let pinnerController = JSB.defineClass('pinnerController : UIViewController <NSURLConnectionDelegate, UIWebViewDelegate>', {
  /**
   * 视图加载完成的生命周期方法
   */
  viewDidLoad: function() {
    try {
      self.init()
      self.view.frame = {x:50, y:30, width:450, height: 200}  // TODO: 适配不同的宽度
      self.lastFrame = self.view.frame;
      self.currentFrame = self.view.frame
      if (!self.settingView) {
        self.createSettingView()  // 创建设置视图和所有子视图
        self.settingView.hidden = false  // 加载主 view 的时候就显示 settingView
      }
      self.settingViewLayout()  // 布局设置视图


      /**
       * 开始创建按钮
       */
      // TODO: 为什么 moveButton 要放在这创建，而 closeButton 放在 createSettingView 里创建？
      self.createButton("moveButton","moveButtonTapped:")  // 创建移动按钮
      self.moveButton.clickDate = 0  // 用于点击时间跟踪
      MNButton.setColor(self.moveButton, "#3a81fb",0.5)
      MNButton.addPanGesture(self.moveButton, self, "onMoveGesture:")  // 为移动按钮添加拖动手势
    
    } catch (error) {
      pinnerUtils.addErrorLog(error, "viewDidLoad")
    }
  },
  
  viewWillAppear: function(animated) {
  },
  
  viewWillDisappear: function(animated) {
  },
  
  /**
   * 视图即将布局子视图
   */
  viewWillLayoutSubviews: function() {
    try {
      // 关键：mini 模式时不要重新布局（照抄 mnbrowser）
      if (self.miniMode) {
        return
      }
      
      let viewFrame = self.view.bounds;
      let width    = viewFrame.width
      let height   = viewFrame.height
      self.moveButton.frame = {x: width*0.5-75, y: 0, width: 150, height: 16};
      // TODO: 这个 -36 是有什么用吗？
      height = height-36
      self.settingViewLayout()
      self.refreshLayout()
    } catch (error) {
      pinnerUtils.addErrorLog(error, "viewWillLayoutSubviews")
    }
  },
  
  scrollViewDidScroll: function(scrollview) {
    // // 只在非 minimode 时处理滚动刷新，避免频繁刷新导致手写消失
    // if (!self.miniMode && scrollview.id && self.currentSection) {
    //   let expectedId = self.currentSection + "CardScrollView"
    //   if (scrollview.id === expectedId) {
    //     // MNUtil.showHUD("分区视图滚动: " + self.currentSection)
    //     self.refreshSectionCards(self.currentSection)
    //   }
    // }
  },
  
  /**
   * 关闭按钮的响应方法
   */
  closeButtonTapped: function() {
    if (self.addonBar) {
      self.hide(self.addonBar.frame) // 以插件栏为终点进行消失动画
    } else {
      self.hide()
    }
  },
  
  /**
   * 处理拖动手势（带边缘吸附功能）
   */
  onMoveGesture: function (gesture) {
    // 如果正在动画中，忽略拖动操作
    if (self.onAnimate) {
      return
    }
    
    // 获取当前位置
    let locationToMN = gesture.locationInView(MNUtil.studyView)
    
    // 双击检测和位置计算初始化
    if (!self.locationToButton || !self.miniMode && (Date.now() - self.moveDate) > 100) {
      let translation = gesture.translationInView(MNUtil.studyView)
      let locationToBrowser = gesture.locationInView(self.view)
      let locationToButton = gesture.locationInView(gesture.view)
      let newY = locationToButton.y - translation.y 
      let newX = locationToButton.x - translation.x
      
      if (gesture.state === 1) {
        self.lastFrame = self.view.frame
        self.locationToBrowser = {x: locationToBrowser.x - translation.x, y: locationToBrowser.y - translation.y}
        self.locationToButton = {x: newX, y: newY}
      }
    }
    self.moveDate = Date.now()
    
    // Mini 模式下不需要双击检测，因为单击按钮就能恢复
    
    // 计算新位置
    let location = {
      x: locationToMN.x - self.locationToButton.x - gesture.view.frame.x,
      y: locationToMN.y - self.locationToButton.y - gesture.view.frame.y
    }
    
    let frame = self.view.frame
    let studyFrame = MNUtil.studyView.bounds
    let y = MNUtil.constrain(location.y, 0, studyFrame.height - 15)
    let x = location.x
    
    // 照抄 mnbrowser 的边缘检测逻辑（1983-2033）
    if (!self.miniMode) {
      // 非 mini 模式：靠近边缘触发吸附
      if (locationToMN.x < UI_CONSTANTS.EDGE_SNAP_DISTANCE) {
        self.toMinimode(MNUtil.genFrame(0, locationToMN.y, UI_CONSTANTS.EDGE_SNAP_DISTANCE, UI_CONSTANTS.EDGE_SNAP_DISTANCE), self.lastFrame)
        return
      }
      if (locationToMN.x > studyFrame.width - UI_CONSTANTS.EDGE_SNAP_DISTANCE) {
        self.toMinimode(MNUtil.genFrame(studyFrame.width - UI_CONSTANTS.EDGE_SNAP_DISTANCE, locationToMN.y, UI_CONSTANTS.EDGE_SNAP_DISTANCE, UI_CONSTANTS.EDGE_SNAP_DISTANCE), self.lastFrame)
        return
      }
    } else {
      // mini 模式的处理（照抄 mnbrowser 1995-2032）
      if (locationToMN.x < 50) {
        self.view.frame = MNUtil.genFrame(0, locationToMN.y - 20, 40, 40)
        return
      } else if (locationToMN.x > studyFrame.width - 50) {
        self.view.frame = MNUtil.genFrame(studyFrame.width - 40, locationToMN.y - 20, 40, 40)
        return
      } else if (locationToMN.x > 50) {
        // 从 mini 模式恢复（照抄 mnbrowser 2002-2032）
        let preOpacity = self.view.layer.opacity
        self.view.layer.opacity = 0
        self.setAllButton(true)  // 先隐藏所有按钮
        self.onAnimate = true
        let color = "#9bb2d6"
        self.view.layer.backgroundColor = MNUtil.hexColorAlpha(color, 0.8)
        self.view.layer.borderColor = MNUtil.hexColorAlpha(color, 0.8)
        
        MNUtil.animate(() => {
          self.view.layer.opacity = preOpacity
          self.setFrame(x, y, self.lastFrame.width, self.lastFrame.height)
        }).then(() => {
          self.onAnimate = false
          let viewFrame = self.view.bounds
          self.moveButton.frame = {x: viewFrame.width * 0.5 - 75, y: 5, width: 150, height: 10}
          self.view.layer.borderWidth = 0
          self.view.layer.borderColor = MNUtil.hexColorAlpha(color, 0.0)
          self.view.layer.backgroundColor = MNUtil.hexColorAlpha(color, 0.0)
          self.view.hidden = false
          if (self.settingView) {
            self.settingView.hidden = false
          }
          self.setAllButton(false)  // 显示所有按钮
          self.moveButton.setTitleForState("", 0)  // 清除图标
        })
        self.miniMode = false
        return
      }
    }
    
    // 正常拖动
    self.setFrame(x, y, frame.width, frame.height)
    // MNUtil.studyView.bringSubviewToFront(self.view)
    // 只在非 minimode 时刷新，避免频繁刷新导致手写消失
    if (!self.miniMode && self.currentSection) {
      // ✅ 修复：pages 视图使用正确的刷新方法
      if (self.currentSection === "pages") {
        self.refreshPageCards()
      } else {
        self.refreshSectionCards(self.currentSection)
      }
    }
  },

  onResizeGesture:function (gesture) {
    try {
      // 如果正在动画中，忽略调整大小操作
      if (self.onAnimate) {
        return
      }
      
      if (gesture.state === 1) {
        self.originalLocationToMN = gesture.locationInView(MNUtil.studyView)
        self.originalFrame = self.view.frame
      }
      if (gesture.state === 2) {
        let locationToMN = gesture.locationInView(MNUtil.studyView)
        let locationDiff = {x:locationToMN.x - self.originalLocationToMN.x,y:locationToMN.y - self.originalLocationToMN.y}
        let frame = self.view.frame
        let studyFrame = MNUtil.studyView.bounds
        
        // 计算新的宽度和高度
        frame.width = self.originalFrame.width + locationDiff.x
        frame.height = self.originalFrame.height + locationDiff.y
        
        // 最小尺寸限制
        if (frame.width <= UI_CONSTANTS.MIN_WIDTH) {
          frame.width = UI_CONSTANTS.MIN_WIDTH
        }
        if (frame.height <= UI_CONSTANTS.MIN_HEIGHT) {
          frame.height = UI_CONSTANTS.MIN_HEIGHT
        }
        
        // 确保调整大小后不超出屏幕右边界
        if (frame.x + frame.width > studyFrame.width) {
          frame.width = studyFrame.width - frame.x
        }
        
        // 确保调整大小后不超出屏幕底部
        if (frame.y + frame.height > studyFrame.height - 20) {
          frame.height = studyFrame.height - frame.y - 20
        }
        
        self.setFrame(frame)
      }
      if (gesture.state === 3) {
        MNUtil.studyView.bringSubviewToFront(self.view)

        // 只在非 minimode 时刷新，避免频繁刷新导致手写消失
        if (!self.miniMode && self.currentSection) {
          // ✅ 修复：pages 视图使用正确的刷新方法
          if (self.currentSection === "pages") {
            self.refreshPageCards()
          } else {
            self.refreshSectionCards(self.currentSection)
          }
        }
      }
    } catch (error) {
      pinnerUtils.addErrorLog(error, "onResizeGesture")
    }
  },

  /**
   * WebView 即将开始加载请求时调用
   */
  webViewShouldStartLoadWithRequestNavigationType: function(webView, request, navigationType) {
    try {
      let config = MNUtil.parseURL(request)
      
      if (!config) {
        return true
      }
      
      MNUtil.log("WebView 请求 URL 配置: " + JSON.stringify(config))

      if (config.scheme === "mnpinner") {
        MNUtil.log("检测到自定义协议，action: " + config.host)
        
        switch (config.host) {
          // case "updateTitle":
          //   MNUtil.log("准备更新标题，参数: " + JSON.stringify(config.params))
          //   self.updateCardTitle(config.params.id, config.params.title)
          //   break;
          default:
            MNUtil.showHUD("未知的方法: " + config.action)
        }
        
        return false
      }
      
      return true
      
    } catch (error) {
      MNUtil.showHUD("处理 URL 时出错: " + error)
      MNUtil.log("URL 处理错误: " + error)
      return true
    }
  },
  
  /**
   * WebView 开始加载页面时调用
   */
  webViewDidStartLoad: function(webView) {
    MNUtil.log("WebView 开始加载")
  },
  
  /**
   * WebView 完成加载时调用
   */
  webViewDidFinishLoad: function(webView) {
    MNUtil.log("WebView 加载完成")
    self.webViewLoaded = true
  },
  
  /**
   * WebView 加载失败时调用
   */
  webViewDidFailLoadWithError: function(webView, error) {
    MNUtil.showHUD("WebView 加载失败: " + error.localizedDescription)
    MNUtil.log("WebView 加载错误: " + JSON.stringify(error))
  },


  moveButtonTapped: async function (button) {
    try {
      // Mini 模式下单击恢复
      // 吸附本质上就是 moveButton 变成了正方形
      if (self.miniMode) {
        MNUtil.log("Mini 模式点击，准备恢复")
        // 直接恢复，不需要额外动画
        self.fromMinimode()
        return
      }
      
      // 正常模式下显示功能菜单
      let commandTable = [
        {title:'🔧  菜单栏待丰富中', object:self, selector:'', param:""},
      ];
      self.popoverController = MNUtil.getPopoverAndPresent(button, commandTable, 200, 1)
    } catch (error) {
      pinnerUtils.addErrorLog(error, "moveButtonTapped")
      MNUtil.showHUD("操作失败")
    }
  },
  
  focusTabTapped: function(button) {
    self.switchView("focusView")
  },

  midwayTabTapped: function(button) {
    self.switchView("midwayView")
  },

  toOrganizeTabTapped: function(button) {
    self.switchView("toOrganizeView")
  },

  dailyTaskTabTapped: function(button) {
    self.switchView("dailyTaskView")
  },

  pagesTabTapped: function(button) {
    self.switchView("pagesView")
  },

  // === 分区视图的事件处理方法 ===
  clearCards: async function(button) {
    try {
      // 从按钮获取分区信息
      let section = button.section || self.currentSection
      if (!section) {
        MNUtil.showHUD("无法确定分区")
        return
      }

      let success = await pinnerConfig.clearPins(section)

      if (success) {
        // 刷新视图显示
        self.refreshSectionCards(section)
      }
    } catch (error) {
      pinnerUtils.addErrorLog(error, "clearCards")
      MNUtil.showHUD("清空失败: " + error)
    }
  },

  /**
   * Pin 当前聚焦的卡片到指定分区
   */
  pinFocusNote: function(button) {
    try {
      let section = button.section || self.currentSection

      // 获取当前聚焦的卡片
      let focusNote = MNNote.getFocusNote()

      if (!focusNote) {
        MNUtil.showHUD("请先选择一个卡片")
        return
      }

      // 获取卡片信息
      let noteId = focusNote.noteId
      let title = focusNote.noteTitle || "未命名卡片"

      // 添加到指定分区（默认添加到顶部）
      let success = pinnerConfig.addPinAtPosition(noteId, title, section, "top")

      if (success) {
        MNUtil.showHUD(`已 Pin 到 ${pinnerConfig.getSectionDisplayName(section)}`)
        // 刷新视图
        self.refreshSectionCards(section)
      } else {
        MNUtil.showHUD("该卡片已存在")
      }

    } catch (error) {
      pinnerUtils.addErrorLog(error, "pinFocusNote")
      MNUtil.showHUD("Pin 失败: " + error.message)
    }
  },

  /**
   * 创建空白占位卡片
   */
  createBlankCard: async function(button) {
    try {
      let section = button.section || self.currentSection

      // 弹出输入框让用户输入标题
      let result = await MNUtil.userInput(
        "创建空白卡片",
        "请输入卡片标题",
        ["取消", "确定"]
      )

      if (result.button === 0) return  // 点击取消

      let title = result.input
      if (!title || title.trim() === "") {
        MNUtil.showHUD("标题不能为空")
        return
      }

      // 创建空白 pin 数据
      let blankPin = {
        noteId: "BLANK_" + Date.now(),  // 特殊前缀标识
        title: title.trim()
      }

      // 直接操作 sections 数据（因为空白卡片没有真实的 noteId）
      if (!pinnerConfig.sections[section]) {
        pinnerConfig.sections[section] = []
      }

      // 添加到顶部
      pinnerConfig.sections[section].unshift(blankPin)

      // 保存数据
      pinnerConfig.save()

      // 刷新界面
      self.refreshSectionCards(section)
      MNUtil.showHUD("已添加空白卡片")

    } catch (error) {
      pinnerUtils.addErrorLog(error, "createBlankCard")
      MNUtil.showHUD("创建失败: " + error.message)
    }
  },

  /**
   * 删除单个卡片
   */
  deleteCard: function(button) {
    try {
      // ✅ 如果是 pages 分区，转发到 deletePage
      if (button.section === "pages") {
        return self.deletePage(button)
      }

      let noteId = button.noteId
      let section = button.section || self.currentSection

      if (!noteId) {
        MNUtil.showHUD("无法获取卡片ID")
        return
      }

      // 调用数据层删除方法
      let success = pinnerConfig.removePin(noteId, section)

      if (success) {
        // 刷新视图
        self.refreshSectionCards(section)
        MNUtil.showHUD("已删除")
      } else {
        MNUtil.showHUD("删除失败")
      }
    } catch (error) {
      pinnerUtils.addErrorLog(error, "deleteCard")
      MNUtil.showHUD("删除失败: " + error)
    }
  },
  
  /**
   * 单击定位卡片
   *
   * 目前是脑图定位
   */
  focusCardTapped: function(button) {
    try {
      // ✅ 如果是 pages 分区，转发到 jumpToPage
      if (button.section === "pages") {
        return self.jumpToPage(button)
      }

      let noteId = button.noteId
      let section = button.section || self.currentSection

      if (!noteId) {
        MNUtil.showHUD("无法获取卡片ID")
        return
      }

      // 检测是否为空白卡片
      if (noteId.startsWith("BLANK_")) {
        // 获取当前 focusNote 作为父节点
        let focusNote = MNNote.getFocusNote()

        if (!focusNote) {
          MNUtil.showHUD("请选中一个卡片作为父节点")
          return
        }

        // 获取空白卡片的标题
        let pins = pinnerConfig.sections[section]
        if (!pins) {
          MNUtil.showHUD("找不到空白卡片数据")
          return
        }

        let blankPin = pins.find(p => p.noteId === noteId)
        if (!blankPin) {
          MNUtil.showHUD("找不到空白卡片数据")
          return
        }

        // 创建真实子卡片
        let newNote = focusNote.createChildNote({
          title: blankPin.title
        })

        // 聚焦到新卡片
        newNote.focusInMindMap(0.3)

        if (newNote) {
          // 更新 pin 数据，替换为真实 ID
          let success = pinnerConfig.updatePinId(section, noteId, newNote.noteId)

          if (success) {
            // 刷新界面
            self.refreshSectionCards(section)
          } else {
            MNUtil.showHUD("更新卡片数据失败")
          }
        } else {
          MNUtil.showHUD("创建卡片失败")
        }
      } else {
        // 原有逻辑：直接定位到真实卡片
        let note = MNNote.new(noteId)
        if (note) {
          note.focusInMindMap()
          // MNUtil.showHUD("已跳转到卡片")

          // 隐藏面板（可选）
          // self.hide()
        } else {
          MNUtil.showHUD("找不到该卡片")
        }
      }
    } catch (error) {
      pinnerUtils.addErrorLog(error, "focusCardTapped")
      MNUtil.showHUD("查看失败: " + error)
    }
  },
  
  /**
   * 点击卡片标题
   * 显示操作菜单
   */
  cardTapped: function(button) {
    try {
      // 创建菜单选项
      let commandTable = [
        self.tableItem("🔄 更新为当前卡片", "updatePinToFocusNote:", button),
        self.tableItem("✏️  修改标题", "renameCard:", button),
        self.tableItem("↔️  转移到...", "showTransferMenu:", button)
      ]

      // 显示弹出菜单
      self.popoverController = MNUtil.getPopoverAndPresent(
        button,
        commandTable,
        150,  // 宽度
        1     // 箭头方向
      )
    } catch (error) {
      pinnerUtils.addErrorLog(error, "cardTapped")
      MNUtil.showHUD("操作失败")
    }
  },
  
  /**
   * 显示转移菜单
   */
  showTransferMenu: function(button) {
    try {
      self.checkPopover()  // 关闭当前菜单

      let noteId = button.noteId
      let currentSection = button.section || self.currentSection

      if (!noteId || !currentSection) {
        MNUtil.showHUD("无法获取卡片信息")
        return
      }

      // 获取所有分区，排除当前分区和 pages 分区（pages 存储的是文档页面，不是卡片）
      let sections = pinnerConfig.getSectionNames()
      let targetSections = sections.filter(s => s !== currentSection && s !== 'pages')

      if (targetSections.length === 0) {
        MNUtil.showHUD("没有可转移的分区")
        return
      }

      // 创建转移菜单
      let commandTable = targetSections.map(section => {
        let displayName = pinnerConfig.getSectionDisplayName(section)
        let param = { noteId: noteId, fromSection: currentSection, toSection: section }
        return self.tableItem(`➡️  ${displayName}`, "transferCard:", param)
      })

      // 显示菜单
      self.popoverController = MNUtil.getPopoverAndPresent(
        button,
        commandTable,
        150,
        1
      )
    } catch (error) {
      pinnerUtils.addErrorLog(error, "showTransferMenu")
      MNUtil.showHUD("显示转移菜单失败")
    }
  },

  /**
   * 执行卡片转移
   */
  transferCard: function(param) {
    try {
      self.checkPopover()

      let { noteId, fromSection, toSection } = param

      if (pinnerConfig.transferPin(noteId, fromSection, toSection)) {
        // 刷新源分区视图
        self.refreshSectionCards(fromSection)

        // 根据参数决定是否切换到目标分区
        // 默认不切换（可以后续添加参数控制）
        // if (switchToTarget) {
        //   self.switchView(toSection + "View")
        // }
      }
    } catch (error) {
      pinnerUtils.addErrorLog(error, "transferCard")
      MNUtil.showHUD("转移失败")
    }
  },

  /**
   * 重命名卡片
   */
  renameCard: async function(button) {
    try {
      self.checkPopover()  // 关闭菜单

      let noteId = button.noteId
      let section = button.section || self.currentSection

      if (!noteId) {
        MNUtil.showHUD("无法获取卡片ID")
        return
      }

      // 显示输入对话框
      let result = await MNUtil.userInput(
        "修改卡片标题",
        "请输入新的标题：",
        ["取消", "确定"]
      )

      if (result.button === 0) return  // 取消

      let newTitle = result.input
      if (!newTitle || newTitle.trim() === "") {
        MNUtil.showHUD("标题不能为空")
        return
      }

      // 更新数据
      if (pinnerConfig.updatePinTitle(noteId, newTitle.trim(), section)) {
        self.refreshSectionCards(section)
        MNUtil.showHUD("标题已更新")
      } else {
        MNUtil.showHUD("更新失败")
      }

    } catch (error) {
      pinnerUtils.addErrorLog(error, "renameCard")
      MNUtil.showHUD("更新标题失败: " + error)
    }
  },

  /**
   * 更新 Pin 为当前聚焦的卡片
   */
  updatePinToFocusNote: function(button) {
    try {
      self.checkPopover()  // 关闭菜单

      // 获取当前聚焦的卡片
      let focusNote = MNNote.getFocusNote()
      if (!focusNote) {
        MNUtil.showHUD("请先选择一个卡片")
        return
      }

      let oldNoteId = button.noteId
      let newNoteId = focusNote.noteId
      let section = button.section || self.currentSection

      if (!oldNoteId || !section) {
        MNUtil.showHUD("无法获取卡片信息")
        return
      }

      // 检查是否是同一个卡片
      if (oldNoteId === newNoteId) {
        MNUtil.showHUD("已经是当前卡片")
        return
      }

      // 调用数据更新方法
      let result = pinnerConfig.updatePinNoteId(section, oldNoteId, newNoteId)

      // 显示结果
      MNUtil.showHUD(result.message)

      // 如果成功，刷新视图
      if (result.success) {
        self.refreshSectionCards(section)
      }

    } catch (error) {
      pinnerUtils.addErrorLog(error, "updatePinToFocusNote")
      MNUtil.showHUD("更新失败: " + error.message)
    }
  },

  /**
   * 上移卡片
   */
  moveCardUp: function(button) {
    try {
      let index = button.tag
      let section = button.section || self.currentSection
      let pins = pinnerConfig.getPins(section)

      if (index > 0) {
        // 使用 pinnerConfig 的 movePin 方法
        pinnerConfig.movePin(index, index - 1, section)
        // 刷新视图
        self.refreshSectionCards(section)
        MNUtil.showHUD("已上移")
      }
    } catch (error) {
      pinnerUtils.addErrorLog(error, "moveCardUp")
      MNUtil.showHUD("上移失败")
    }
  },

  /**
   * 下移卡片
   */
  moveCardDown: function(button) {
    try {
      let index = button.tag
      let section = button.section || self.currentSection
      let pins = pinnerConfig.getPins(section)

      if (index < pins.length - 1) {
        // 使用 pinnerConfig 的 movePin 方法
        pinnerConfig.movePin(index, index + 1, section)
        // 刷新视图
        self.refreshSectionCards(section)
        MNUtil.showHUD("已下移")
      }
    } catch (error) {
      pinnerUtils.addErrorLog(error, "moveCardDown")
      MNUtil.showHUD("下移失败")
    }
  },

  /**
   * 长按上移按钮 - 置顶
   */
  onLongPressUpButton: function(gesture) {
    try {
      // 只在手势开始时执行一次
      if (gesture.state !== 1) return

      let button = gesture.view
      let index = button.tag
      let section = button.section || self.currentSection

      if (index > 0) {
        // 将卡片移动到第一位
        pinnerConfig.movePin(index, 0, section)
        // 刷新视图
        self.refreshSectionCards(section)
        MNUtil.showHUD("已置顶")
      }
    } catch (error) {
      pinnerUtils.addErrorLog(error, "onLongPressUpButton")
      MNUtil.showHUD("置顶失败")
    }
  },

  /**
   * 长按下移按钮 - 置底
   */
  onLongPressDownButton: function(gesture) {
    try {
      // 只在手势开始时执行一次
      if (gesture.state !== 1) return

      let button = gesture.view
      let index = button.tag
      let section = button.section || self.currentSection
      let pins = pinnerConfig.getPins(section)

      if (index < pins.length - 1) {
        // 将卡片移动到最后一位
        pinnerConfig.movePin(index, pins.length - 1, section)
        // 刷新视图
        self.refreshSectionCards(section)
        MNUtil.showHUD("已置底")
      }
    } catch (error) {
      pinnerUtils.addErrorLog(error, "onLongPressDownButton")
      MNUtil.showHUD("置底失败")
    }
  },

  /**
   * 页面项点击（显示操作菜单）
   */
  pageItemTapped: function(button) {
    try {
      // 使用 tag 获取索引，然后从数据源获取页面数据
      let index = button.tag
      let pages = pinnerConfig.getPagePins()
      let page = pages[index]

      if (!page) {
        MNUtil.showHUD("页面不存在")
        return
      }

      // 创建参数对象传递给菜单项
      let param = {
        index: index,
        page: page
      }

      // 创建菜单选项
      let commandTable = [
        self.tableItem("📍 跳转到页面", "jumpToPageFromMenu:", param),
        self.tableItem("✏️ 重命名", "renamePage:", param),
        self.tableItem("🔄 更新进度", "updatePageProgress:", param)
      ]

      // 显示弹出菜单
      self.popoverController = MNUtil.getPopoverAndPresent(
        button,
        commandTable,
        150,  // 宽度
        1     // 箭头方向
      )

    } catch (error) {
      pinnerUtils.addErrorLog(error, "pageItemTapped")
      MNUtil.showHUD(error)
    }
  },

  /**
   * 从菜单跳转到页面
   */
  jumpToPageFromMenu: async function(param) {
    try {
      self.checkPopover()  // 关闭菜单

      let page = param.page

      if (!page) {
        MNUtil.showHUD("页面不存在")
        return
      }

      let docMd5 = page.docMd5
      let pageIndex = page.pageIndex

      // 验证文档存在
      let docInfo = pinnerConfig.getDocInfo(docMd5)
      if (!docInfo.doc) {
        MNUtil.showHUD("文档不存在")
        return
      }

      // 验证页码范围
      if (pageIndex < 0 || pageIndex > docInfo.lastPageIndex) {
        MNUtil.showHUD(`页码超出范围(0-${docInfo.lastPageIndex})`)
        return
      }

      // 打开文档（如果不是当前文档）
      if (docMd5 !== MNUtil.currentDocMd5) {
        MNUtil.openDoc(docMd5)

        // 确保文档视图可见
        if (MNUtil.docMapSplitMode === 0) {
          MNUtil.docMapSplitMode = 1
        }

        await MNUtil.delay(0.1)
      }

      // 跳转到指定页面
      let docController = MNUtil.currentDocController
      if (!docController) {
        MNUtil.showHUD("无法获取文档控制器")
        return
      }

      if (docController.currPageIndex !== pageIndex) {
        docController.setPageAtIndex(pageIndex)
      }

      MNUtil.showHUD(`已跳转到第 ${pageIndex + 1} 页`)

    } catch (error) {
      pinnerUtils.addErrorLog(error, "jumpToPageFromMenu")
      MNUtil.showHUD("跳转失败: " + error.message)
    }
  },

  /**
   * 重命名页面（支持输入框 + 预设短语）
   */
  renamePage: function(param) {
    try {
      self.checkPopover()  // 关闭菜单

      let page = param.page

      if (!page) {
        MNUtil.showHUD("页面不存在")
        return
      }

      let currentTitle = page.title || ""

      // 构建菜单选项：确定按钮 + 预设短语
      let menuOptions = ["✅ 确定"]
      PAGE_TITLE_PRESETS.forEach(preset => {
        menuOptions.push(`📝 ${preset}`)
      })

      // 显示带输入框的对话框
      const alert = UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
        "修改页面标题",
        "输入标题或选择预设短语",
        2,  // alertViewStyle = 2（文本输入框）
        "取消",
        menuOptions,
        (alert, buttonIndex) => {
          try {
            if (buttonIndex === 0) return  // 取消

            const inputText = alert.textFieldAtIndex(0).text.trim()
            const selectedIndex = buttonIndex - 1
            let finalTitle = ""

            if (selectedIndex === 0) {
              // ✅ 确定按钮 - 使用输入框内容
              finalTitle = inputText
            } else {
              // 选择了预设短语
              const preset = PAGE_TITLE_PRESETS[selectedIndex - 1]
              // 拼接逻辑：预设在前，输入在后
              finalTitle = inputText ? `${preset} - ${inputText}` : preset
            }

            // 验证标题不为空
            if (!finalTitle) {
              MNUtil.showHUD("⚠️ 标题不能为空")
              return
            }

            // 更新数据并刷新
            if (finalTitle !== currentTitle) {
              pinnerConfig.updatePagePinTitle(page.docMd5, page.pageIndex, finalTitle)
              self.refreshPageCards()
              MNUtil.showHUD("✅ 标题已更新")
            }

          } catch (error) {
            pinnerUtils.addErrorLog(error, "renamePage callback")
            MNUtil.showHUD("更新失败: " + error.message)
          }
        }
      )

      // 设置输入框默认值
      MNUtil.delay(0.1).then(() => {
        const textField = alert.textFieldAtIndex(0)
        if (textField) {
          textField.text = currentTitle
        }
      })

    } catch (error) {
      pinnerUtils.addErrorLog(error, "renamePage")
    }
  },

  /**
   * 更新页面进度（将页码更新为当前文档的当前页面）
   */
  updatePageProgress: function(param) {
    try {
      self.checkPopover()  // 关闭菜单

      let page = param.page

      if (!page) {
        MNUtil.showHUD("页面不存在")
        return
      }

      // 获取当前文档控制器
      let docController = MNUtil.currentDocController
      if (!docController) {
        MNUtil.showHUD("当前没有打开的文档")
        return
      }

      // 获取当前文档的 MD5
      let currentDocMd5 = docController.document.docMd5
      if (!currentDocMd5) {
        MNUtil.showHUD("无法获取当前文档信息")
        return
      }

      // 检查当前文档是否与 pin 的文档一致
      if (currentDocMd5 !== page.docMd5) {
        MNUtil.showHUD("请先打开对应的文档")
        return
      }

      // 获取当前页面索引
      let currentPageIndex = docController.currPageIndex
      if (currentPageIndex === undefined || currentPageIndex === null) {
        MNUtil.showHUD("无法获取当前页码")
        return
      }

      // 调用更新方法
      let result = pinnerConfig.updatePagePinPageIndex(
        page.docMd5,
        page.pageIndex,
        currentPageIndex
      )

      // 显示结果
      MNUtil.showHUD(result.message)

    } catch (error) {
      pinnerUtils.addErrorLog(error, "updatePageProgress")
      MNUtil.showHUD("更新失败: " + error.message)
    }
  },

  /**
   * Pin 当前页面到 Pages 分区
   */
  pinCurrentPage: function(button) {
    try {
      // 获取当前文档控制器
      let docController = MNUtil.currentDocController
      if (!docController) {
        MNUtil.showHUD("当前没有打开的文档")
        return
      }

      // 获取当前文档的 MD5
      let docMd5 = docController.document.docMd5
      if (!docMd5) {
        MNUtil.showHUD("无法获取当前文档信息")
        return
      }

      // 获取当前页面索引
      let pageIndex = docController.currPageIndex
      if (pageIndex === undefined || pageIndex === null) {
        MNUtil.showHUD("无法获取当前页码")
        return
      }

      // 添加到 pages 分区（使用 undefined 让其自动生成标题）
      let success = pinnerConfig.addPagePin(docMd5, pageIndex, undefined, undefined)

      if (success) {
        MNUtil.showHUD(`已 Pin 第 ${pageIndex + 1} 页`)
        // 刷新 pages 视图
        self.refreshPageCards()
      } else {
        MNUtil.showHUD("该页面已存在")
      }

    } catch (error) {
      pinnerUtils.addErrorLog(error, "pinCurrentPage")
      MNUtil.showHUD("Pin 失败: " + error.message)
    }
  },

  /**
   * 清空 Pages 分区
   */
  clearPages: async function(button) {
    try {
      let confirm = await MNUtil.confirm("清空 Pages 分区的所有页面？", "")
      if (!confirm) return

      pinnerConfig.sections.pages = []
      pinnerConfig.save()

      self.refreshPageCards()
      MNUtil.showHUD("已清空 Pages")

    } catch (error) {
      pinnerUtils.addErrorLog(error, "clearPages")
      MNUtil.showHUD("清空失败")
    }
  },

  /**
   * 跳转到文档页面（参考 mnsnipaste 的文档定位实现）
   */
  jumpToPage: async function(button) {
    try {
      // 使用 tag 获取索引，然后从数据源获取页面数据
      let index = button.tag
      let pages = pinnerConfig.getPagePins()
      let page = pages[index]

      // 验证页面数据
      if (!page) {
        MNUtil.showHUD("页面不存在")
        return
      }

      let docMd5 = page.docMd5
      let pageIndex = page.pageIndex

      // 验证文档存在
      let docInfo = pinnerConfig.getDocInfo(docMd5)
      if (!docInfo.doc) {
        MNUtil.showHUD("文档不存在")
        return
      }

      // 验证页码范围
      if (pageIndex < 0 || pageIndex > docInfo.lastPageIndex) {
        MNUtil.showHUD(`页码超出范围(0-${docInfo.lastPageIndex})`)
        return
      }

      // 打开文档（如果不是当前文档）
      if (docMd5 !== MNUtil.currentDocMd5) {
        MNUtil.openDoc(docMd5)

        // 确保文档视图可见（参考 mnsnipaste 的实现）
        if (MNUtil.docMapSplitMode === 0) {
          MNUtil.docMapSplitMode = 1  // 从纯脑图切换到分割模式
        }

        // 等待文档加载（优化：参考 mnsnipaste 使用 0.01 秒）
        await MNUtil.delay(0.01)
      }

      // 跳转到指定页面
      let docController = MNUtil.currentDocController
      if (!docController) {
        MNUtil.showHUD("无法获取文档控制器")
        return
      }

      if (docController.currPageIndex !== pageIndex) {
        docController.setPageAtIndex(pageIndex)
      }

      MNUtil.showHUD(`已跳转到第 ${pageIndex + 1} 页`)

    } catch (error) {
      pinnerUtils.addErrorLog(error, "jumpToPage")
      MNUtil.showHUD("跳转失败: " + error.message)
    }
  },
  /**
   * 删除页面
   */
  deletePage: async function(button) {
    try {
      // 使用 tag 获取索引，然后从数据源获取页面数据
      let index = button.tag
      let pages = pinnerConfig.getPagePins()
      let page = pages[index]

      if (!page) {
        MNUtil.showHUD("页面不存在")
        return
      }

      pinnerConfig.removePagePin(page.docMd5, page.pageIndex)
      self.refreshPageCards()
      MNUtil.showHUD("已删除")

    } catch (error) {
      pinnerUtils.addErrorLog(error, "deletePage")
    }
  },

  /**
   * 上移页面
   */
  movePageUp: async function(button) {
    try {
      let oldIndex = button.tag
      let newIndex = oldIndex - 1

      if (newIndex >= 0) {
        pinnerConfig.movePagePin(oldIndex, newIndex)
        // refreshPageCards 会在 movePagePin 中自动调用
      }

    } catch (error) {
      pinnerUtils.addErrorLog(error, "movePageUp")
    }
  },

  /**
   * 下移页面
   */
  movePageDown: async function(button) {
    try {
      let oldIndex = button.tag
      let newIndex = oldIndex + 1

      let totalPages = pinnerConfig.getPagePins().length
      if (newIndex < totalPages) {
        pinnerConfig.movePagePin(oldIndex, newIndex)
        // refreshPageCards 会在 movePagePin 中自动调用
      }

    } catch (error) {
      pinnerUtils.addErrorLog(error, "movePageDown")
    }
  },
});

// ========== 原型方法 ==========

/**
 * 显示面板（带动画效果）
 * 
 * 动画流程：
 * 1. 记录目标位置和当前透明度
 * 2. 设置初始状态（半透明、起始位置）
 * 3. 执行动画（淡入 + 位置移动）
 * 4. 动画完成后恢复正常状态
 * 
 * @param {Object} frame - 动画的起始位置（通常是插件栏的位置）
 * @this {pinnerController}
 */
pinnerController.prototype.show = function (frame) {
  // 保存目标位置（面板的正常显示位置）
  let preFrame = this.view.frame
  
  // 动态计算宽度，而不是硬编码（参考成熟插件的实现）
  if (preFrame.width < 200) {
    // 最小宽度保证，但保持现有宽度的灵活性
    preFrame.width = Math.max(preFrame.width, 260)
  }
  
  // 获取屏幕边界，确保显示位置合理
  let studyFrame = MNUtil.studyView.bounds
  
  // 检查并调整目标位置，确保不会显示在屏幕外
  if (preFrame.x < 0) {
    preFrame.x = 20  // 左边缘留出空间
  } else if (preFrame.x + preFrame.width > studyFrame.width) {
    preFrame.x = studyFrame.width - preFrame.width - 20  // 右边缘留出空间
  }
  
  if (preFrame.y < 20) {
    preFrame.y = 20  // 顶部留出空间
  } else if (preFrame.y + preFrame.height > studyFrame.height - 20) {
    preFrame.y = studyFrame.height - preFrame.height - 20  // 底部留出空间
  }
  
  // 标记动画状态，防止动画期间的用户操作干扰
  this.onAnimate = true
  
  // 保存当前透明度，并设置初始透明度为 0.2（半透明）
  let preOpacity = this.view.layer.opacity
  this.view.layer.opacity = 0.2
  
  // 如果传入了起始位置，先将视图移动到该位置
  if (frame) {
    this.view.frame = frame
    this.currentFrame = frame
  }
  
  // 设置初始状态
  this.view.hidden = false              // 显示主视图
  // this.setAllButton(true)               // 隐藏所有按钮（动画期间）
  
  // 将视图移动到最前面
  MNUtil.studyView.bringSubviewToFront(this.view)
  
  MNUtil.animate(
    () => {
      this.view.layer.opacity = preOpacity  // 恢复透明度
      this.view.frame = preFrame             // 移动到目标位置
      this.currentFrame = preFrame
    }, 0.3
  ).then(
    () => {
      this.onAnimate = false  // 重置动画状态
      this.view.layer.borderWidth = 0
      this.refreshView(pinnerConfig.config.source)  // 刷新视图内容
    }
  )
}
pinnerController.prototype.setAllButton = function (hidden) {
  // 关键：必须隐藏 moveButton（来自 mnbrowser）
  if (this.moveButton) {
    this.moveButton.hidden = hidden
  }
  if (this.closeButton) {
    this.closeButton.hidden = hidden
  }
  if (this.resizeButton) {
    this.resizeButton.hidden = hidden
  }
  if (this.tabView) {
    this.tabView.hidden = hidden
  }
}
/**
 * 隐藏面板（带动画效果）
 * 
 * 动画流程（与 show 相反）：
 * 1. 记录当前位置和透明度
 * 2. 隐藏所有子视图
 * 3. 执行动画（淡出 + 位置移动）
 * 4. 动画完成后完全隐藏视图
 * 
 * @param {Object} frame - 动画的终点位置（通常是插件栏的位置）
 */
pinnerController.prototype.hide = function (frame) {
  // 保存当前位置（用于下次显示时恢复）
  let preFrame = this.view.frame
  
  // 移除硬编码，保持当前宽度的灵活性
  if (preFrame.width < 200) {
    preFrame.width = Math.max(preFrame.width, 260)
  }
  this.view.frame = preFrame
  
  // 标记动画状态
  this.onAnimate = true
  
  // 保存当前透明度
  let preOpacity = this.view.layer.opacity

  MNUtil.animate(
    () => {
      this.view.layer.opacity = 0.2  // 淡出到半透明
      if (frame) {
        // 如果指定了终点位置，移动到该位置
        this.view.frame = frame
        this.currentFrame = frame
      }
    }, 0.3
  ).then(
    () => {
      this.onAnimate = false
      this.view.hidden = true;           // 完全隐藏视图
      this.view.layer.opacity = preOpacity  // 恢复透明度（为下次显示准备）
      this.view.frame = preFrame         // 恢复位置
      this.currentFrame = preFrame
    }
  )
}

/**
 * @this {pinnerController}
 * @returns {UITextView}
 */
pinnerController.prototype.creatTextView = function (superview="view", color="#c0bfbf", alpha=0.9) {
  /** @type {UITextView} */
  let view = UITextView.new()
  view.font = UIFont.systemFontOfSize(15);
  view.layer.cornerRadius = 8
  view.backgroundColor = MNUtil.hexColorAlpha(color,alpha)
  view.textColor = UIColor.blackColor()
  view.delegate = this
  view.bounces = true
  this[superview].addSubview(view)
  return view
}

pinnerController.prototype.createView = function (viewName, superview="view", color="#9bb2d6", alpha=0.8) {
  this[viewName] = UIView.new()
  this[viewName].backgroundColor = MNUtil.hexColorAlpha(color,alpha)
  this[viewName].layer.cornerRadius = 12
  this[superview].addSubview(this[viewName])
}

pinnerController.prototype.setFrame = function (frame) {
  // 支持对象参数或分离参数（像 mnbrowser 那样）
  if (typeof frame === "object") {
    this.view.frame = frame
  } else if (arguments.length === 4) {
    // 支持 setFrame(x, y, width, height) 形式
    this.view.frame = MNUtil.genFrame(arguments[0], arguments[1], arguments[2], arguments[3])
  }
  this.currentFrame = this.view.frame
  // 不要在这里更新 lastFrame，lastFrame 应该在特定时机保存
}

pinnerController.prototype.init = function () {
  this.isFirst = true      // 标记是否是第一次显示
  this.miniMode = false    // 迷你模式状态
  this.onAnimate = false   // 动画状态控制
  this.lastTapTime = 0     // 双击检测时间
  this.currentSection = "focus"  // 当前显示的分区，默认focus

  // 初始化 frame 状态（在 viewDidLoad 中会设置具体值）
  if (!this.lastFrame) {
    this.lastFrame = this.view.frame
  }
  if (!this.currentFrame) {
    this.currentFrame = this.view.frame
  }

  this.view.layer.shadowOffset = {width: 0, height: 0};
  this.view.layer.shadowRadius = 15;
  this.view.layer.shadowOpacity = 0.5;
  this.view.layer.shadowColor = UIColor.colorWithWhiteAlpha(0.5, 1);
  this.view.layer.cornerRadius = 11
  this.view.layer.opacity = 1.0
  this.view.layer.borderColor = MNUtil.hexColorAlpha("#9bb2d6",0.8)
  this.view.layer.borderWidth = 0
  this.highlightColor = UIColor.blendedColor( MNUtil.hexColorAlpha("#2c4d81",0.8),
    MNUtil.app.defaultTextColor,
    0.8
  );
}

pinnerController.prototype.settingViewLayout = function () {
  try {
    let viewFrame = this.view.bounds
    let width = viewFrame.width+10
    let height = viewFrame.height
    this.settingView.frame = MNUtil.genFrame(-5, 55, width, height-65)
    this.focusView.frame = MNUtil.genFrame(0, 0,width, height-65)
    this.midwayView.frame = MNUtil.genFrame(0, 0,width, height-65)
    this.toOrganizeView.frame = MNUtil.genFrame(0, 0,width, height-65)
    this.dailyTaskView.frame = MNUtil.genFrame(0, 0,width, height-65)
    this.pagesView.frame = MNUtil.genFrame(0, 0,width, height-65)

    let settingFrame = this.settingView.bounds
    settingFrame.x = 0
    settingFrame.y = 20
    settingFrame.height = 30
    settingFrame.width = settingFrame.width-45
    this.tabView.frame = settingFrame

    // 布局 tab 按钮（使用 ScrollView，支持自动滚动）
    let tabX = 10
    if (this.focusTabButton) {
      this.focusTabButton.frame = {x: tabX, y: 2, width: this.focusTabButton.width, height: 26}
      tabX += this.focusTabButton.width + UI_CONSTANTS.TAB_SPACING
    }
    if (this.midwayTabButton) {
      this.midwayTabButton.frame = {x: tabX, y: 2, width: this.midwayTabButton.width, height: 26}
      tabX += this.midwayTabButton.width + UI_CONSTANTS.TAB_SPACING
    }
    if (this.toOrganizeTabButton) {
      this.toOrganizeTabButton.frame = {x: tabX, y: 2, width: this.toOrganizeTabButton.width, height: 26}
      tabX += this.toOrganizeTabButton.width + UI_CONSTANTS.TAB_SPACING
    }
    if (this.dailyTaskTabButton) {
      this.dailyTaskTabButton.frame = {x: tabX, y: 2, width: this.dailyTaskTabButton.width, height: 26}
      tabX += this.dailyTaskTabButton.width + UI_CONSTANTS.TAB_SPACING
    }
    if (this.pagesTabButton) {
      this.pagesTabButton.frame = {x: tabX, y: 2, width: this.pagesTabButton.width, height: 26}
      tabX += this.pagesTabButton.width + UI_CONSTANTS.TAB_SPACING
    }

    // 设置内容大小（超出 frame 时自动启用滚动）
    this.tabView.contentSize = {width: tabX + 10, height: 30}

    // 布局关闭按钮
    settingFrame.y = 20
    settingFrame.x = this.tabView.frame.width + 5
    settingFrame.width = 30
    this.closeButton.frame = settingFrame

    // 布局调整大小按钮
    this.resizeButton.frame = {x: this.view.bounds.width - 30, y: this.view.bounds.height - 40, width: 30, height: 30}

    // 根据当前显示的视图布局子视图
    if (!this.focusView.hidden) {
      this.layoutSectionView("focus")
    }
    if (!this.midwayView.hidden) {
      this.layoutSectionView("midway")
    }
    if (!this.toOrganizeView.hidden) {
      this.layoutSectionView("toOrganize")
    }
    if (!this.dailyTaskView.hidden) {
      this.layoutSectionView("dailyTask")
    }
    if (!this.pagesView.hidden) {
      this.layoutSectionView("pages")
    }
  } catch (error) {
    pinnerUtils.addErrorLog(error, "settingViewLayout")
  }
}
pinnerController.prototype.refreshLayout = function () {
  // 刷新当前显示的分区视图
  if (!this.focusView.hidden) {
    this.layoutSectionView("focus")
  }
  if (!this.midwayView.hidden) {
    this.layoutSectionView("midway")
  }
  if (!this.toOrganizeView.hidden) {
    this.layoutSectionView("toOrganize")
  }
  if (!this.dailyTaskView.hidden) {
    this.layoutSectionView("dailyTask")
  }
  if (!this.pagesView.hidden) {
    this.layoutSectionView("pages")
  }
}
pinnerController.prototype.createSettingView = function () {
  try {
    /**
     * settingView 配置
     */
    this.createView("settingView", "view","#f1f6ff",0.9)
    this.settingView.hidden = true
    this.settingView.layer.cornerRadius = 15
    this.tabView = this.createScrollview("view","#ffffff", 0)  // settingView 和 tabView 是兄弟视图，隶属于 this.view
    this.tabView.alwaysBounceHorizontal = true
    this.tabView.showsHorizontalScrollIndicator = false

    // === 创建 tab 切换按钮 ===
    let radius = 10
    this.createButton("focusTabButton","focusTabTapped:","tabView")
    this.focusTabButton.layer.cornerRadius = radius;
    this.focusTabButton.isSelected = true  // 默认选中第一个 tab
    MNButton.setConfig(this.focusTabButton,
      {color:"#457bd3",alpha:0.9,opacity:1.0,title:"Focus",font:17,bold:true}  // 使用选中颜色
    )
    let size = this.focusTabButton.sizeThatFits({width:100,height:100})
    this.focusTabButton.width = size.width+15

    this.createButton("midwayTabButton","midwayTabTapped:","tabView")
    this.midwayTabButton.layer.cornerRadius = radius;
    this.midwayTabButton.isSelected = false
    MNButton.setConfig(this.midwayTabButton,
      {color:"#9bb2d6",alpha:0.9,opacity:1.0,title:"中间知识",font:17,bold:true}
    )
    size = this.midwayTabButton.sizeThatFits({width:120,height:100})
    this.midwayTabButton.width = size.width+15

    this.createButton("toOrganizeTabButton","toOrganizeTabTapped:","tabView")
    this.toOrganizeTabButton.layer.cornerRadius = radius;
    this.toOrganizeTabButton.isSelected = false
    MNButton.setConfig(this.toOrganizeTabButton,
      {color:"#9bb2d6",alpha:0.9,opacity:1.0,title:"待整理",font:17,bold:true}
    )
    size = this.toOrganizeTabButton.sizeThatFits({width:120,height:100})
    this.toOrganizeTabButton.width = size.width+15

    this.createButton("dailyTaskTabButton","dailyTaskTabTapped:","tabView")
    this.dailyTaskTabButton.layer.cornerRadius = radius;
    this.dailyTaskTabButton.isSelected = false
    MNButton.setConfig(this.dailyTaskTabButton,
      {color:"#9bb2d6",alpha:0.9,opacity:1.0,title:"日拱一卒",font:17,bold:true}
    )
    size = this.dailyTaskTabButton.sizeThatFits({width:120,height:100})
    this.dailyTaskTabButton.width = size.width+15

    this.createButton("pagesTabButton","pagesTabTapped:","tabView")
    this.pagesTabButton.layer.cornerRadius = radius;
    this.pagesTabButton.isSelected = false
    MNButton.setConfig(this.pagesTabButton,
      {color:"#9bb2d6",alpha:0.9,opacity:1.0,title:"Pages",font:17,bold:true}
    )
    size = this.pagesTabButton.sizeThatFits({width:120,height:100})
    this.pagesTabButton.width = size.width+15

    // === 创建各个分页===
    this.createView("focusView","settingView","#9bb2d6",0)
    this.focusView.hidden = false  // 默认显示第一个视图

    this.createView("midwayView","settingView","#9bb2d6",0)
    this.midwayView.hidden = true  // 隐藏其他视图

    this.createView("toOrganizeView","settingView","#9bb2d6",0)
    this.toOrganizeView.hidden = true  // 隐藏其他视图

    this.createView("dailyTaskView","settingView","#9bb2d6",0)
    this.dailyTaskView.hidden = true  // 隐藏其他视图

    this.createView("pagesView","settingView","#9bb2d6",0)
    this.pagesView.hidden = true  // 隐藏其他视图

    // === 为每个分区创建子视图 ===
    this.createSectionViews()

    // 初始化当前分区
    this.currentSection = "focus"


    // === 创建关闭按钮 ===
    this.createButton("closeButton", "closeButtonTapped:")
    this.closeButton.layer.cornerRadius = 10;
    MNButton.setImage(this.closeButton, pinnerConfig.closeImage)
    MNButton.setColor(this.closeButton, "#e06c75")
  // 为关闭按钮添加拖动手势（用于调整面板大小）
    MNButton.addPanGesture(this.closeButton, this, "onResizeGesture:")

    // == 右下角的调整大小按钮 ==
    this.createButton("resizeButton")
    this.resizeButton.layer.cornerRadius = 10;
    this.resizeButton.backgroundColor = UIColor.clearColor()
    MNButton.setImage(this.resizeButton, pinnerConfig.resizeImage)
    MNButton.setColor(this.resizeButton, "#457bd3")
    MNButton.addPanGesture(this.resizeButton, this, "onResizeGesture:") 
    
  } catch (error) {
    pinnerUtils.addErrorLog(error, "createSettingView")
  }
}

pinnerController.prototype.createButton = function (buttonName, targetAction, superview) {
  this[buttonName] = UIButton.buttonWithType(0);
  this[buttonName].autoresizingMask = (1 << 0 | 1 << 3);
  this[buttonName].setTitleColorForState(UIColor.whiteColor(),0);
  this[buttonName].setTitleColorForState(this.highlightColor, 1);
  this[buttonName].backgroundColor = MNUtil.hexColorAlpha("#9bb2d6",0.8)
  this[buttonName].layer.cornerRadius = 8;
  this[buttonName].layer.masksToBounds = true;
  this[buttonName].titleLabel.font = UIFont.systemFontOfSize(16);

  if (targetAction) {
    this[buttonName].addTargetActionForControlEvents(this, targetAction, 1 << 6);
  }
  if (superview) {
    this[superview].addSubview(this[buttonName])
  } else {
    this.view.addSubview(this[buttonName]);
  }
}
/**
 * 关闭弹出菜单
 */
pinnerController.prototype.checkPopover = function () {
  if (this.popoverController) {
    this.popoverController.dismissPopoverAnimated(true)
  }
}
pinnerController.prototype.createScrollview = function (superview="view", color="#c0bfbf", alpha=0.8) {
  let scrollview = UIScrollView.new()
  scrollview.hidden = false
  scrollview.delegate = this
  scrollview.bounces = true
  scrollview.layer.cornerRadius = 8
  scrollview.backgroundColor = MNUtil.hexColorAlpha(color,alpha)
  this[superview].addSubview(scrollview)
  return scrollview
}
pinnerController.prototype.switchView = function (targetView) {
  let allViews = ["focusView", "midwayView", "toOrganizeView", "dailyTaskView", "pagesView"]
  let allButtons = ["focusTabButton","midwayTabButton","toOrganizeTabButton","dailyTaskTabButton","pagesTabButton"]
  let sectionMap = {
    "focusView": "focus",
    "midwayView": "midway",
    "toOrganizeView": "toOrganize",
    "dailyTaskView": "dailyTask",
    "pagesView": "pages"
  }

  allViews.forEach((k, index) => {
    let isTargetView = k === targetView
    this[k].hidden = !isTargetView
    this[allButtons[index]].isSelected = isTargetView
    this[allButtons[index]].backgroundColor = MNUtil.hexColorAlpha(isTargetView?"#457bd3":"#9bb2d6",0.8)
  })

  // 更新当前分区
  this.currentSection = sectionMap[targetView]
  // 先布局再刷新,确保子视图 frame 正确
  this.layoutSectionView(this.currentSection)
  this.refreshView(targetView)
}

pinnerController.prototype.refreshView = function (targetView) {
  try {
    switch (targetView) {
      case "focusView":
        MNUtil.log("refresh focusView")
        this.refreshSectionCards("focus")
        break;
      case "midwayView":
        MNUtil.log("refresh midwayView")
        this.refreshSectionCards("midway")
        break;
      case "toOrganizeView":
        MNUtil.log("refresh toOrganizeView")
        this.refreshSectionCards("toOrganize")
        break;
      case "dailyTaskView":
        MNUtil.log("refresh dailyTaskView")
        this.refreshSectionCards("dailyTask")
        break;
      case "pagesView":
        MNUtil.log("refresh pagesView")
        this.refreshPageCards()
        break;
      default:
        break;
    }
  } catch (error) {
    pinnerUtils.addErrorLog(error, "refreshView")
  }
}
/**
 * 创建各分区的子视图
 */
pinnerController.prototype.createSectionViews = function() {
  // 为每个分区创建相同的结构
  ["focus", "midway", "toOrganize", "dailyTask", "pages"].forEach(section => {
    let viewName = section + "View"

    // 创建顶部按钮的滚动容器
    let buttonScrollView = UIScrollView.new()
    buttonScrollView.alwaysBounceHorizontal = true
    buttonScrollView.showsHorizontalScrollIndicator = false
    buttonScrollView.backgroundColor = UIColor.clearColor()
    buttonScrollView.bounces = false
    this[viewName].addSubview(buttonScrollView)
    this[section + "ButtonScrollView"] = buttonScrollView

    // 创建清空按钮
    let clearButton = UIButton.buttonWithType(0)
    clearButton.addTargetActionForControlEvents(this, section === "pages" ? "clearPages:" : "clearCards:", 1 << 6)
    clearButton.section = section  // 保存分区信息
    buttonScrollView.addSubview(clearButton)
    MNButton.setConfig(clearButton, {
      color: "#e06c75", alpha: 0.8, opacity: 1.0, title: "🗑 清空", radius: 10, font: 15
    })
    this[section + "ClearButton"] = clearButton

    // 所有分区都创建 Pin 按钮
    let pinButton = UIButton.buttonWithType(0)
    if (section === "pages") {
      // Pages 分区：Pin 当前页面
      pinButton.addTargetActionForControlEvents(this, "pinCurrentPage:", 1 << 6)
    } else {
      // 其他分区：Pin 当前 focusNote
      pinButton.addTargetActionForControlEvents(this, "pinFocusNote:", 1 << 6)
    }
    pinButton.section = section
    buttonScrollView.addSubview(pinButton)
    MNButton.setConfig(pinButton, {
      color: "#457bd3", alpha: 0.8, opacity: 1.0, title: "📌 Pin", radius: 10, font: 15
    })
    this[section + "PinButton"] = pinButton

    // 创建 Add 按钮（除了 pages 分区）
    if (section !== "pages") {
      let addButton = UIButton.buttonWithType(0)
      addButton.addTargetActionForControlEvents(this, "createBlankCard:", 1 << 6)
      addButton.section = section
      buttonScrollView.addSubview(addButton)
      MNButton.setConfig(addButton, {
        color: "#61afef", alpha: 0.8, opacity: 1.0, title: "➕ Add", radius: 10, font: 15
      })
      this[section + "AddButton"] = addButton
    }

    // 创建卡片滚动视图
    let cardScrollView = this.createScrollview(viewName, "#f5f5f5", 0.9)
    cardScrollView.layer.cornerRadius = 12
    cardScrollView.alwaysBounceVertical = true
    cardScrollView.showsVerticalScrollIndicator = true
    cardScrollView.id = section + "CardScrollView"
    this[section + "CardScrollView"] = cardScrollView

    // 初始化卡片行数组
    this[section + "CardRows"] = []
  })
}

/**
 * 刷新指定分区的卡片
 */
pinnerController.prototype.refreshSectionCards = function(section) {
  try {
    let cardRowsKey = section + "CardRows"
    let scrollViewKey = section + "CardScrollView"

    // 初始化卡片行数组
    if (!this[cardRowsKey]) {
      this[cardRowsKey] = []
    }

    // 从 pinnerConfig 获取数据
    let cards = pinnerConfig.getPins(section) || []

    // 清空现有卡片
    this[cardRowsKey].forEach(view => {
      view.removeFromSuperview()
    })
    this[cardRowsKey] = []

    // 检查滚动视图是否存在
    let scrollView = this[scrollViewKey]
    if (!scrollView) return

    // 如果没有卡片，显示提示
    if (cards.length === 0) {
      let emptyLabel = UIButton.buttonWithType(0)
      emptyLabel.setTitleForState("暂无固定的卡片", 0)
      emptyLabel.titleLabel.font = UIFont.systemFontOfSize(14)
      emptyLabel.frame = {x: 10, y: 10, width: scrollView.frame.width - 20, height: 40}
      emptyLabel.enabled = false
      emptyLabel.setTitleColorForState(MNUtil.hexColorAlpha("#999999", 1.0), 0)
      scrollView.addSubview(emptyLabel)
      this[cardRowsKey].push(emptyLabel)
      scrollView.contentSize = {width: 0, height: 100}
      return
    }

    // 添加卡片行
    let yOffset = 10
    let scrollWidth = scrollView.frame.width

    cards.forEach((card, index) => {
      let cardRow = this.createCardRow(card, index, scrollWidth - 20, section)
      scrollView.addSubview(cardRow)
      this[cardRowsKey].push(cardRow)
      yOffset += UI_CONSTANTS.CARD_ROW_HEIGHT
    })

    // 设置滚动区域
    scrollView.contentSize = {width: 0, height: yOffset + 10}

  } catch (error) {
    pinnerUtils.addErrorLog(error, "refreshSectionCards")
    MNUtil.showHUD("刷新卡片列表失败")
  }
}

/**
 * 布局指定分区的子视图
 */
pinnerController.prototype.layoutSectionView = function(section) {
  let viewName = section + "View"
  let view = this[viewName]
  if (!view || view.hidden) return

  let scrollViewKey = section + "CardScrollView"
  let buttonScrollViewKey = section + "ButtonScrollView"
  let clearButtonKey = section + "ClearButton"
  // 所有分区都使用 PinButton
  let secondButtonKey = section + "PinButton"
  let addButtonKey = section + "AddButton"

  if (!this[scrollViewKey]) return

  let frame = view.bounds
  let width = frame.width
  let height = frame.height

  // 设置按钮滚动容器
  if (this[buttonScrollViewKey]) {
    // pages 分区只有 2 个按钮，其他分区有 3 个按钮
    let buttonCount = section === "pages" ? 2 : 3
    let containerWidth = buttonCount === 3 ? 240 : 160

    this[buttonScrollViewKey].frame = {x: 10, y: 10, width: Math.min(width - 20, containerWidth), height: 32}
    this[buttonScrollViewKey].contentSize = {width: containerWidth, height: 32}

    if (this[clearButtonKey]) {
      this[clearButtonKey].frame = {x: 0, y: 0, width: 70, height: 32}
    }
    if (this[secondButtonKey]) {
      this[secondButtonKey].frame = {x: 75, y: 0, width: 70, height: 32}
    }
    if (this[addButtonKey]) {
      this[addButtonKey].frame = {x: 150, y: 0, width: 70, height: 32}
    }
  }

  // 设置卡片滚动视图
  this[scrollViewKey].frame = {x: 10, y: 50, width: width - 50, height: height - 65}
}



/**
 * 创建单个卡片行视图（新版本）
 */
pinnerController.prototype.createCardRow = function(card, index, width, section) {
  // 创建卡片行容器
  let rowView = UIView.new()
  rowView.frame = {x: 10, y: 10 + index * UI_CONSTANTS.CARD_ROW_HEIGHT, width: width, height: 45}
  rowView.backgroundColor = MNUtil.hexColorAlpha("#ffffff", 0.95)
  rowView.layer.cornerRadius = 8
  rowView.layer.borderWidth = 1
  rowView.layer.borderColor = MNUtil.hexColorAlpha("#9bb2d6", 0.3)

  // 保存卡片信息
  rowView.noteId = card.noteId
  rowView.section = section

  // 获取卡片总数，用于判断是否禁用按钮
  let totalCards = pinnerConfig.getPins(section).length

  // 上移按钮
  let moveUpButton = UIButton.buttonWithType(0)
  moveUpButton.setTitleForState("⬆️", 0)
  moveUpButton.frame = {x: 5, y: 7, width: 30, height: 30}
  moveUpButton.layer.cornerRadius = 5
  moveUpButton.tag = index
  moveUpButton.noteId = card.noteId
  moveUpButton.section = section
  moveUpButton.addTargetActionForControlEvents(this, "moveCardUp:", 1 << 6)
  // 第一个卡片禁用上移
  if (index === 0) {
    moveUpButton.enabled = false
    moveUpButton.backgroundColor = MNUtil.hexColorAlpha("#cccccc", 0.5)
  } else {
    moveUpButton.backgroundColor = MNUtil.hexColorAlpha("#457bd3", 0.8)
    // 添加长按手势 - 置顶
    MNButton.addLongPressGesture(moveUpButton, this, "onLongPressUpButton:", 0.3)
  }
  rowView.addSubview(moveUpButton)

  // 下移按钮
  let moveDownButton = UIButton.buttonWithType(0)
  moveDownButton.setTitleForState("⬇️", 0)
  moveDownButton.frame = {x: 40, y: 7, width: 30, height: 30}
  moveDownButton.layer.cornerRadius = 5
  moveDownButton.tag = index
  moveDownButton.noteId = card.noteId
  moveDownButton.section = section
  moveDownButton.addTargetActionForControlEvents(this, "moveCardDown:", 1 << 6)
  // 最后一个卡片禁用下移
  if (index === totalCards - 1) {
    moveDownButton.enabled = false
    moveDownButton.backgroundColor = MNUtil.hexColorAlpha("#cccccc", 0.5)
  } else {
    moveDownButton.backgroundColor = MNUtil.hexColorAlpha("#457bd3", 0.8)
    // 添加长按手势 - 置底
    MNButton.addLongPressGesture(moveDownButton, this, "onLongPressDownButton:", 0.3)
  }
  rowView.addSubview(moveDownButton)

  // 定位按钮
  let focusButton = UIButton.buttonWithType(0)
  focusButton.setTitleForState("📍", 0)
  focusButton.frame = {x: 75, y: 7, width: UI_CONSTANTS.BUTTON_HEIGHT, height: UI_CONSTANTS.BUTTON_HEIGHT}
  focusButton.backgroundColor = MNUtil.hexColorAlpha("#457bd3", 0.8)
  focusButton.layer.cornerRadius = 5
  focusButton.tag = index
  focusButton.noteId = card.noteId
  focusButton.section = section
  focusButton.addTargetActionForControlEvents(this, "focusCardTapped:", 1 << 6)
  rowView.addSubview(focusButton)

  // 添加标题
  let titleButton = UIButton.buttonWithType(0)
  titleButton.setTitleForState(`${card.title || "未命名卡片"}`, 0)
  titleButton.titleLabel.font = UIFont.systemFontOfSize(15)
  titleButton.frame = {x: 110, y: 5, width: width - 160, height: 35}
  titleButton.addTargetActionForControlEvents(this, "cardTapped:", 1 << 6)
  titleButton.noteId = card.noteId
  titleButton.section = section
  titleButton.cardTitle = card.title
  // 设置颜色表示可点击
  titleButton.setTitleColorForState(MNUtil.hexColorAlpha("#007AFF", 1.0), 0)
  titleButton.setTitleColorForState(MNUtil.hexColorAlpha("#0051D5", 1.0), 1)
  titleButton.contentHorizontalAlignment = 1  // 左对齐
  rowView.addSubview(titleButton)

  // 删除按钮
  let deleteButton = UIButton.buttonWithType(0)
  deleteButton.setTitleForState("🗑", 0)
  deleteButton.frame = {x: width - 40, y: 7, width: 30, height: 30}
  deleteButton.backgroundColor = MNUtil.hexColorAlpha("#e06c75", 0.8)
  deleteButton.layer.cornerRadius = 5
  deleteButton.tag = index
  deleteButton.noteId = card.noteId
  deleteButton.section = section
  deleteButton.addTargetActionForControlEvents(this, "deleteCard:", 1 << 6)
  rowView.addSubview(deleteButton)

  return rowView
}

// ========== Pages 分区相关方法 ==========

/**
 * 刷新页面列表
 */
pinnerController.prototype.refreshPageCards = function() {
  try {
    let cardRowsKey = "pagesCardRows"
    let scrollViewKey = "pagesCardScrollView"

    // 初始化卡片行数组
    if (!this[cardRowsKey]) {
      this[cardRowsKey] = []
    }

    // 从 pinnerConfig 获取数据
    let pages = pinnerConfig.getPagePins() || []

    // 清空现有卡片
    this[cardRowsKey].forEach(view => {
      view.removeFromSuperview()
    })
    this[cardRowsKey] = []

    // 检查滚动视图是否存在
    let scrollView = this[scrollViewKey]
    if (!scrollView) return

    // 如果没有页面，显示提示
    if (pages.length === 0) {
      let emptyLabel = UIButton.buttonWithType(0)
      emptyLabel.setTitleForState("暂无固定的页面", 0)
      emptyLabel.titleLabel.font = UIFont.systemFontOfSize(14)
      emptyLabel.frame = {x: 10, y: 10, width: scrollView.frame.width - 20, height: 40}
      emptyLabel.enabled = false
      emptyLabel.setTitleColorForState(MNUtil.hexColorAlpha("#999999", 1.0), 0)
      scrollView.addSubview(emptyLabel)
      this[cardRowsKey].push(emptyLabel)
      scrollView.contentSize = {width: 0, height: 100}
      return
    }

    // 添加页面行
    let yOffset = 10
    let scrollWidth = scrollView.frame.width

    pages.forEach((page, index) => {
      let pageRow = this.createPageRow(page, index, scrollWidth - 20, "pages")  // ✅ 传入 section 参数
      scrollView.addSubview(pageRow)
      this[cardRowsKey].push(pageRow)
      yOffset += UI_CONSTANTS.PAGE_ROW_HEIGHT
    })

    // 设置滚动区域
    scrollView.contentSize = {width: 0, height: yOffset + 10}

  } catch (error) {
    pinnerUtils.addErrorLog(error, "refreshPageCards")
    MNUtil.showHUD("刷新页面列表失败")
  }
}

/**
 * 创建单个页面行视图
 */
pinnerController.prototype.createPageRow = function(page, index, width, section = "pages") {
  // 创建页面行容器
  let rowView = UIView.new()
  rowView.frame = {x: 10, y: 10 + index * UI_CONSTANTS.PAGE_ROW_HEIGHT, width: width, height: 45}
  rowView.backgroundColor = MNUtil.hexColorAlpha("#ffffff", 0.95)
  rowView.layer.cornerRadius = 8
  rowView.layer.borderWidth = 1
  rowView.layer.borderColor = MNUtil.hexColorAlpha("#9bb2d6", 0.3)

  // 保存页面信息
  rowView.docMd5 = page.docMd5
  rowView.pageIndex = page.pageIndex
  rowView.section = section  // ✅ 添加 section 属性

  // 获取页面总数
  let totalPages = pinnerConfig.getPagePins().length

  // 上移按钮
  let moveUpButton = UIButton.buttonWithType(0)
  moveUpButton.setTitleForState("⬆️", 0)
  moveUpButton.frame = {x: 5, y: 7, width: 30, height: 30}
  moveUpButton.layer.cornerRadius = 5
  moveUpButton.tag = index
  moveUpButton.docMd5 = page.docMd5
  moveUpButton.pageIndex = page.pageIndex
  moveUpButton.addTargetActionForControlEvents(this, "movePageUp:", 1 << 6)
  if (index === 0) {
    moveUpButton.enabled = false
    moveUpButton.backgroundColor = MNUtil.hexColorAlpha("#cccccc", 0.5)
  } else {
    moveUpButton.backgroundColor = MNUtil.hexColorAlpha("#457bd3", 0.8)
  }
  rowView.addSubview(moveUpButton)

  // 下移按钮
  let moveDownButton = UIButton.buttonWithType(0)
  moveDownButton.setTitleForState("⬇️", 0)
  moveDownButton.frame = {x: 40, y: 7, width: 30, height: 30}
  moveDownButton.layer.cornerRadius = 5
  moveDownButton.tag = index
  moveDownButton.docMd5 = page.docMd5
  moveDownButton.pageIndex = page.pageIndex
  moveDownButton.addTargetActionForControlEvents(this, "movePageDown:", 1 << 6)
  if (index === totalPages - 1) {
    moveDownButton.enabled = false
    moveDownButton.backgroundColor = MNUtil.hexColorAlpha("#cccccc", 0.5)
  } else {
    moveDownButton.backgroundColor = MNUtil.hexColorAlpha("#457bd3", 0.8)
  }
  rowView.addSubview(moveDownButton)

  // 定位按钮（跳转到页面）
  let focusButton = UIButton.buttonWithType(0)
  focusButton.setTitleForState("📍", 0)
  focusButton.frame = {x: 75, y: 7, width: 30, height: 30}
  focusButton.backgroundColor = MNUtil.hexColorAlpha("#457bd3", 0.8)
  focusButton.layer.cornerRadius = 5
  focusButton.tag = index
  focusButton.docMd5 = page.docMd5
  focusButton.pageIndex = page.pageIndex
  focusButton.section = section  // ✅ 添加 section 属性
  focusButton.addTargetActionForControlEvents(this, "jumpToPage:", 1 << 6)
  rowView.addSubview(focusButton)

  // 添加标题
  let titleButton = UIButton.buttonWithType(0)
  titleButton.setTitleForState(`${page.title || "未命名页面"}`, 0)
  titleButton.titleLabel.font = UIFont.systemFontOfSize(15)
  titleButton.frame = {x: 110, y: 5, width: width - 160, height: 35}
  titleButton.tag = index  // ✅ 设置 tag 属性，用于 pageItemTapped 获取页面数据
  titleButton.addTargetActionForControlEvents(this, "pageItemTapped:", 1 << 6)
  titleButton.docMd5 = page.docMd5
  titleButton.pageIndex = page.pageIndex
  titleButton.pageTitle = page.title
  // 设置颜色表示可点击
  titleButton.setTitleColorForState(MNUtil.hexColorAlpha("#007AFF", 1.0), 0)
  titleButton.setTitleColorForState(MNUtil.hexColorAlpha("#0051D5", 1.0), 1)
  titleButton.contentHorizontalAlignment = 1  // 左对齐
  rowView.addSubview(titleButton)

  // 删除按钮
  let deleteButton = UIButton.buttonWithType(0)
  deleteButton.setTitleForState("🗑", 0)
  deleteButton.frame = {x: width - 40, y: 7, width: 30, height: 30}
  deleteButton.backgroundColor = MNUtil.hexColorAlpha("#e06c75", 0.8)
  deleteButton.layer.cornerRadius = 5
  deleteButton.tag = index
  deleteButton.docMd5 = page.docMd5
  deleteButton.pageIndex = page.pageIndex
  deleteButton.section = section  // ✅ 添加 section 属性
  deleteButton.addTargetActionForControlEvents(this, "deletePage:", 1 << 6)
  rowView.addSubview(deleteButton)

  return rowView
}


/**
 * 转换到迷你模式
 * @param {Object} frame - 迷你模式的目标位置
 */
pinnerController.prototype.toMinimode = function(frame, lastFrame) {
  // 参考 mnbrowser 的实现（line 4333-4354）
  this.miniMode = true
  if (lastFrame) {
    this.lastFrame = lastFrame
  } else {
    this.lastFrame = this.view.frame
  }
  if (this.settingView) {
    this.settingView.hidden = true
  }
  
  this.currentFrame = this.view.frame
  
  // 隐藏所有按钮（包括 moveButton）
  this.setAllButton(true)
  
  // 设置背景色
  this.view.layer.borderWidth = 0
  let color = "#9bb2d6"  // 使用 mnbrowser 的颜色
  this.view.layer.backgroundColor = MNUtil.hexColorAlpha(color, 0.8)
  this.view.layer.borderColor = MNUtil.hexColorAlpha(color, 0.8)
  
  // 执行动画
  MNUtil.animate(() => {
    this.setFrame(frame)
  }).then(() => {
    // 动画完成后，重新设置 moveButton
    this.moveButton.frame = MNUtil.genFrame(0, 0, 40, 40)
    this.moveButton.hidden = false
    this.moveButton.enabled = true  // 确保按钮可点击
    
    // 设置图标并居中
    this.moveButton.setTitleForState("📌", 0)
    this.moveButton.titleLabel.font = UIFont.systemFontOfSize(20)
    this.moveButton.titleLabel.textAlignment = 1  // 文字居中对齐
    
    // 确保按钮在最上层
    this.view.bringSubviewToFront(this.moveButton)
  })
}

/**
 * 从迷你模式恢复
 */
pinnerController.prototype.fromMinimode = function() {
  try {
    if (!this.miniMode) return
    
    // 确保 lastFrame 在屏幕范围内
    let studyFrame = MNUtil.studyView.bounds
    if (this.lastFrame) {
      this.lastFrame.x = MNUtil.constrain(this.lastFrame.x, 0, studyFrame.width - this.lastFrame.width)
      this.lastFrame.y = MNUtil.constrain(this.lastFrame.y, 20, studyFrame.height - this.lastFrame.height - 20)
    } else {
      // 如果没有 lastFrame，使用默认位置
      this.lastFrame = {x: 50, y: 30, width: 450, height: 200}
    }
    
    // 完全照抄拖拽恢复的代码（lines 147-176）
    let preOpacity = this.view.layer.opacity
    this.view.layer.opacity = 0
    this.setAllButton(true)  // 先隐藏所有按钮
    this.onAnimate = true
    let color = "#9bb2d6"
    this.view.layer.backgroundColor = MNUtil.hexColorAlpha(color, 0.8)
    this.view.layer.borderColor = MNUtil.hexColorAlpha(color, 0.8)
    
    MNUtil.animate(() => {
      this.view.layer.opacity = preOpacity
      this.setFrame(this.lastFrame.x, this.lastFrame.y, this.lastFrame.width, this.lastFrame.height)
    }).then(() => {
      this.onAnimate = false
      let viewFrame = this.view.bounds
      this.moveButton.frame = {x: viewFrame.width * 0.5 - 75, y: 5, width: 150, height: 10}
      this.view.layer.borderWidth = 0
      this.view.layer.borderColor = MNUtil.hexColorAlpha(color, 0.0)
      this.view.layer.backgroundColor = MNUtil.hexColorAlpha(color, 0.0)
      this.view.hidden = false
      if (this.settingView) {
        this.settingView.hidden = false
      }
      this.setAllButton(false)  // 显示所有按钮
      this.moveButton.setTitleForState("", 0)  // 清除图标
      if (this.currentSection) {
        this.refreshSectionCards(this.currentSection)
      }
    })
    this.miniMode = false
    
    // 确保视图在最前面
    MNUtil.studyView.bringSubviewToFront(this.view)
  } catch (error) {
    pinnerUtils.addErrorLog(error, "fromMinimode")
    // 确保重置状态，防止界面卡死
    this.onAnimate = false
    this.miniMode = false
    MNUtil.showHUD("恢复正常模式失败")
  }
}

/**
 * 
 * @param {string} title 
 * @param {string} selector 
 * @param {any} param 
 * @param {boolean|undefined} checked 
 * @this {pinnerController}
 * @returns 
 */
pinnerController.prototype.tableItem = function (title, selector, param = "", checked = false) {
  return {
    title: title,        // 菜单项显示的文字
    object: this,        // 执行方法的对象（重要！）
    selector: selector,  // 点击后要调用的方法名
    param: param,        // 传递给方法的参数
    checked: checked     // 是否显示勾选状态
  }
}