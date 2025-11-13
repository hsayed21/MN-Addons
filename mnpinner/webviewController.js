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

      // ========== 创建底部工具栏 ==========
      // 创建工具栏容器
      self.toolbar = UIView.new()
      self.toolbar.backgroundColor = MNUtil.hexColorAlpha("#f1f6ff", 0.9)
      self.toolbar.layer.cornerRadius = 8
      self.view.addSubview(self.toolbar)

      // 创建可滚动按钮区域
      self.toolbarScrollView = UIScrollView.new()
      self.toolbarScrollView.alwaysBounceHorizontal = true
      self.toolbarScrollView.showsHorizontalScrollIndicator = false
      self.toolbarScrollView.backgroundColor = UIColor.clearColor()
      self.toolbar.addSubview(self.toolbarScrollView)

      // 创建工具栏按钮
      self.createToolbarButtons()

      // 调试日志
      // MNUtil.log("📊 工具栏组件信息:")
      // MNUtil.log("  toolbar: " + self.toolbar)
      // MNUtil.log("  toolbar.frame: " + JSON.stringify(self.toolbar.frame))
      // MNUtil.log("  toolbarScrollView: " + self.toolbarScrollView)
      // if (self.viewModeButton) {
      //   MNUtil.log("  viewModeButton: " + self.viewModeButton)
      //   MNUtil.log("  viewModeButton.frame: " + JSON.stringify(self.viewModeButton.frame))
      //   MNUtil.log("  viewModeButton.superview: " + self.viewModeButton.superview)
      // }

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
      let buttonHeight = 28  // 工具栏高度

      // 顶部 moveButton（原有）
      self.moveButton.frame = {x: width*0.5-75, y: 0, width: 150, height: 16};

      // ========== 底部工具栏布局 ==========
      // 工具栏容器（底部）
      self.toolbar.frame = {x: 5, y: height - buttonHeight - 8, width: width - 40, height: buttonHeight}

      // 可滚动区域（填满工具栏宽度）
      self.toolbarScrollView.frame = {x: 0, y: 0, width: width - 40, height: buttonHeight}

      // ✅ 恢复：重新布局所有工具栏按钮（响应式布局需要）
      let buttonX = 5
      if (self.viewModeButton) {
        self.viewModeButton.frame = {x: buttonX, y: 0, width: 70, height: buttonHeight}
        buttonX += 75
      }

      if (self.toolbarClearButton) {
        self.toolbarClearButton.frame = {x: buttonX, y: 0, width: 70, height: buttonHeight}
        buttonX += 75
      }

      if (self.toolbarPinCardButton) {
        self.toolbarPinCardButton.frame = {x: buttonX, y: 0, width: 95, height: buttonHeight}
        buttonX += 100
      }

      if (self.toolbarPinPageButton) {
        self.toolbarPinPageButton.frame = {x: buttonX, y: 0, width: 95, height: buttonHeight}
        buttonX += 100
      }

      if (self.toolbarPinClipboardButton) {
        self.toolbarPinClipboardButton.frame = {x: buttonX, y: 0, width: 95, height: buttonHeight}
        buttonX += 100
      }

      if (self.toolbarAddButton) {
        self.toolbarAddButton.frame = {x: buttonX, y: 0, width: 95, height: buttonHeight}
        buttonX += 100
      }

      if (self.toolbarExportURLButton) {
        self.toolbarExportURLButton.frame = {x: buttonX, y: 0, width: 95, height: buttonHeight}
        buttonX += 100
      }

      if (self.toolbarExportMarkdownButton) {
        self.toolbarExportMarkdownButton.frame = {x: buttonX, y: 0, width: 95, height: buttonHeight}
        buttonX += 100
      }

      // 更新滚动内容大小
      self.toolbarScrollView.contentSize = {width: buttonX + 10, height: buttonHeight}

      // ========== 调整内容区域高度 ==========
      // 为底部工具栏腾出空间（减去工具栏高度 + 间距）
      height = height - buttonHeight - 15

      self.settingViewLayout()
      self.refreshLayout()

      // 布局设置窗口（如果已创建）
      if (self.preferencesView) {
        self.preferencesViewLayout()
      }
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
      self.refreshSectionCards(self.currentSection)
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
          self.refreshSectionCards(self.currentSection)
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
      let commandTable = []

      // 根据当前视图模式添加切换选项
      if (self.currentViewMode === "pin") {
        commandTable.push({title:'🔄  切换到 Task 视图', object:self, selector:'switchViewMode:', param:"task"})
        commandTable.push({title:'🎨  切换到自定义视图', object:self, selector:'switchViewMode:', param:"custom"})
      } else if (self.currentViewMode === "task") {
        commandTable.push({title:'🔄  切换到 Pin 视图', object:self, selector:'switchViewMode:', param:"pin"})
        commandTable.push({title:'🎨  切换到自定义视图', object:self, selector:'switchViewMode:', param:"custom"})
      } else if (self.currentViewMode === "custom") {
        commandTable.push({title:'🔄  切换到 Pin 视图', object:self, selector:'switchViewMode:', param:"pin"})
        commandTable.push({title:'🔄  切换到 Task 视图', object:self, selector:'switchViewMode:', param:"task"})
      }

      // 添加设置入口
      commandTable.push({title:'⚙️  偏好设置', object:self, selector:'openSettings:', param:button})

      // 添加导出/导入配置选项
      commandTable.push({title:'📤  导出配置', object:self, selector:'exportConfigTapped:', param:button})
      commandTable.push({title:'📥  导入配置', object:self, selector:'importConfigTapped:', param:button})

      // 添加管理预设短语入口
      commandTable.push({title:'✏️  管理预设短语', object:self, selector:'managePresets:', param:button})

      self.popoverController = MNUtil.getPopoverAndPresent(button, commandTable, 200, 1)
    } catch (error) {
      pinnerUtils.addErrorLog(error, "moveButtonTapped")
      MNUtil.showHUD("操作失败")
    }
  },

  /**
   * 导出配置 - 二级菜单
   */
  exportConfigTapped: function(button) {
    try {
      let commandTable = [
        {title:'📋   导出到剪贴板', object:self, selector:'exportConfig:', param:"clipboard"},
        {title:'📁   导出到文件', object:self, selector:'exportConfig:', param:"file"},
        {title:'📝   导出到当前卡片', object:self, selector:'exportConfig:', param:"currentNote"},
      ];
      self.popoverController = MNUtil.getPopoverAndPresent(button, commandTable, 250, 2)
    } catch (error) {
      pinnerUtils.addErrorLog(error, "exportConfigTapped")
      MNUtil.showHUD("操作失败")
    }
  },

  /**
   * 执行导出配置
   */
  exportConfig: function(param) {
    try {
      // 关闭 popover
      if (self.popoverController) {
        self.popoverController.dismissPopoverAnimated(true)
        self.popoverController = null
      }

      switch (param) {
        case "clipboard":
          pinnerConfig.exportToClipboard()
          break;
        case "file":
          pinnerConfig.exportToFile()
          break;
        case "currentNote":
          pinnerConfig.exportToCurrentNote()
          break;
      }
    } catch (error) {
      pinnerUtils.addErrorLog(error, "exportConfig")
      MNUtil.showHUD("导出失败")
    }
  },

  /**
   * 导入配置 - 二级菜单
   */
  importConfigTapped: function(button) {
    try {
      let commandTable = [
        {title:'📋   从剪贴板导入', object:self, selector:'importConfig:', param:"clipboard"},
        {title:'📁   从文件导入', object:self, selector:'importConfig:', param:"file"},
        {title:'📝   从当前卡片导入', object:self, selector:'importConfig:', param:"currentNote"},
      ];
      self.popoverController = MNUtil.getPopoverAndPresent(button, commandTable, 250, 2)
    } catch (error) {
      pinnerUtils.addErrorLog(error, "importConfigTapped")
      MNUtil.showHUD("操作失败")
    }
  },

  /**
   * 执行导入配置
   */
  importConfig: async function(param) {
    try {
      // 关闭 popover
      if (self.popoverController) {
        self.popoverController.dismissPopoverAnimated(true)
        self.popoverController = null
      }

      let success = false
      switch (param) {
        case "clipboard":
          success = pinnerConfig.importFromClipboard()
          break;
        case "file":
          success = await pinnerConfig.importFromFile()
          break;
        case "currentNote":
          success = pinnerConfig.importFromCurrentNote()
          break;
      }

      // 导入成功后刷新 UI
      if (success && !self.view.hidden) {
        // ✅ 新增：保存配置到存储
        SectionRegistry.saveToStorage()

        // ✅ 新增：重新创建标签按钮
        self.recreateSectionTabs()

        // ✅ 新增：重新布局
        self.settingViewLayout()
      }
    } catch (error) {
      pinnerUtils.addErrorLog(error, "importConfig")
      MNUtil.showHUD("导入失败")
    }
  },

  // ========== 预设短语管理方法 ==========

  /**
   * 管理预设短语主菜单
   */
  managePresets: function(button) {
    try {
      // 关闭当前菜单
      if (self.popoverController) {
        self.popoverController.dismissPopoverAnimated(true)
        self.popoverController = null
      }

      let presets = pinnerConfig.getPageTitlePresets()
      let commandTable = [
        {title:'➕ 添加新预设', object:self, selector:'addPreset:', param:button},
        {title:'🗑 删除预设', object:self, selector:'deletePreset:', param:button},
        {title:'✏️ 编辑预设', object:self, selector:'editPreset:', param:button},
        {title:`📋 当前: ${presets.length} 个预设`, object:null, selector:'', param:null}
      ]

      self.popoverController = MNUtil.getPopoverAndPresent(button, commandTable, 200, 2)
    } catch (error) {
      pinnerUtils.addErrorLog(error, "managePresets")
      MNUtil.showHUD("操作失败")
    }
  },

  /**
   * 添加新预设
   */
  addPreset: async function(button) {
    try {
      // 关闭菜单
      self.checkPopover()

      let result = await MNUtil.userInput(
        "添加预设短语",
        "请输入新的预设短语",
        ["取消", "确定"]
      )

      if (result.button === 0) return  // 取消

      let inputText = result.input.trim()
      if (!inputText) {
        MNUtil.showHUD("⚠️ 预设内容不能为空")
        return
      }

      // 检查是否已存在
      let presets = pinnerConfig.getPageTitlePresets()
      if (presets.includes(inputText)) {
        MNUtil.showHUD("⚠️ 该预设已存在")
        return
      }

      pinnerConfig.addPageTitlePreset(inputText)
      MNUtil.showHUD("✅ 已添加预设")
    } catch (error) {
      pinnerUtils.addErrorLog(error, "addPreset")
      MNUtil.showHUD("操作失败")
    }
  },

  /**
   * 删除预设
   */
  deletePreset: function(button) {
    try {
      // 关闭菜单
      self.checkPopover()

      let presets = pinnerConfig.getPageTitlePresets()
      if (presets.length === 0) {
        MNUtil.showHUD("⚠️ 当前没有预设短语")
        return
      }

      UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
        "删除预设短语",
        "选择要删除的预设",
        0,  // 普通按钮
        "取消",
        presets,
        (alert, buttonIndex) => {
          try {
            if (buttonIndex === 0) return  // 取消

            let index = buttonIndex - 1
            let deletedPreset = presets[index]
            pinnerConfig.removePageTitlePreset(index)
            MNUtil.showHUD(`✅ 已删除: ${deletedPreset}`)
          } catch (error) {
            pinnerUtils.addErrorLog(error, "deletePreset:callback")
            MNUtil.showHUD("删除失败")
          }
        }
      )
    } catch (error) {
      pinnerUtils.addErrorLog(error, "deletePreset")
      MNUtil.showHUD("操作失败")
    }
  },

  /**
   * 编辑预设
   */
  editPreset: function(button) {
    try {
      // 关闭菜单
      self.checkPopover()

      let presets = pinnerConfig.getPageTitlePresets()
      if (presets.length === 0) {
        MNUtil.showHUD("⚠️ 当前没有预设短语")
        return
      }

      // 第一步：选择要编辑的预设
      UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
        "编辑预设短语",
        "选择要编辑的预设",
        0,  // 普通按钮
        "取消",
        presets,
        async (alert, buttonIndex) => {
          try {
            if (buttonIndex === 0) return  // 取消

            let index = buttonIndex - 1
            let currentPreset = presets[index]

            // 第二步：使用 MNUtil.userInput 显示输入框并设置默认值
            let result = await MNUtil.userInput(
              "编辑预设短语",
              `原内容: ${currentPreset}`,
              ["取消", "确定"],
              { default: currentPreset }  // ✅ 使用 options.default 设置默认值
            )

            if (result.button === 0) return  // 取消

            let newText = result.input.trim()
            if (!newText) {
              MNUtil.showHUD("⚠️ 预设内容不能为空")
              return
            }

            pinnerConfig.updatePageTitlePreset(index, newText)
            MNUtil.showHUD("✅ 已更新预设")
          } catch (error) {
            pinnerUtils.addErrorLog(error, "editPreset:callback")
            MNUtil.showHUD("操作失败")
          }
        }
      )
    } catch (error) {
      pinnerUtils.addErrorLog(error, "editPreset")
      MNUtil.showHUD("操作失败")
    }
  },

  /**
   * 打开设置视图（嵌入式）
   */
  openSettings: function(button) {
    try {
      // 关闭当前的弹出菜单
      if (self.popoverController) {
        self.popoverController.dismissPopoverAnimated(true)
        self.popoverController = null
      }

      // 延迟创建设置窗口（参考 mneditor 架构）
      if (!self.preferencesView) {
        self.createPreferencesView()
        // 创建后立即布局
        self.preferencesViewLayout()
      }

      // 显示设置窗口
      self.preferencesView.hidden = false

    } catch (error) {
      pinnerUtils.addErrorLog(error, "openSettings")
      MNUtil.showHUD("打开设置失败: " + error.message)
    }
  },

  /**
   * 关闭设置窗口（事件处理）
   */
  closePreferencesView: function() {
    try {
      self.closePreferencesView()  // 调用原型方法
    } catch (error) {
      pinnerUtils.addErrorLog(error, "closePreferencesView")
    }
  },

  /**
   * 修改默认视图模式
   */
  changeDefaultViewMode: function() {
    try {
      let currentMode = pinnerConfig.settings.defaultViewMode || "pin"
      let modes = ["pin", "task", "custom"]
      let modeNames = ["Pin 视图", "Task 视图", "自定义视图"]

      UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
        "选择默认视图模式",
        "打开插件时默认显示的视图",
        0,  // 普通按钮
        "取消",
        modeNames,
        (alert, buttonIndex) => {
          try {
            if (buttonIndex === 0) return  // 取消

            let selectedMode = modes[buttonIndex - 1]
            pinnerConfig.settings.defaultViewMode = selectedMode
            pinnerConfig.save()

            // 更新按钮文字
            let modeText = modeNames[buttonIndex - 1]
            self.defaultViewModeButton.setTitleForState(`默认视图: ${modeText}`, 0)

            MNUtil.showHUD(`已设置为: ${modeText}`)
          } catch (error) {
            pinnerUtils.addErrorLog(error, "changeDefaultViewMode:callback")
          }
        }
      )
    } catch (error) {
      pinnerUtils.addErrorLog(error, "changeDefaultViewMode")
    }
  },

  /**
   * 修改默认分区
   */
  changeDefaultSection: function() {
    try {
      let currentMode = pinnerConfig.settings.defaultViewMode || "pin"

      // 根据当前默认视图模式获取可用分区
      let configs = SectionRegistry.getAllByMode(currentMode)
      let sectionKeys = configs.map(c => c.key)
      let sectionNames = configs.map(c => c.icon ? `${c.icon} ${c.displayName}` : c.displayName)

      UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
        "选择默认分区",
        "打开插件时默认显示的分区",
        0,
        "取消",
        sectionNames,
        (alert, buttonIndex) => {
          try {
            if (buttonIndex === 0) return  // 取消

            let selectedSection = sectionKeys[buttonIndex - 1]
            pinnerConfig.settings.defaultSection = selectedSection
            pinnerConfig.save()

            // 更新按钮文字
            let sectionText = sectionNames[buttonIndex - 1]
            self.defaultSectionButton.setTitleForState(`默认分区: ${sectionText}`, 0)

            MNUtil.showHUD(`已设置为: ${sectionText}`)
          } catch (error) {
            pinnerUtils.addErrorLog(error, "changeDefaultSection:callback")
          }
        }
      )
    } catch (error) {
      pinnerUtils.addErrorLog(error, "changeDefaultSection")
    }
  },

  /**
   * 切换启动视图模式（记住上次 vs 固定默认）
   */
  changeStartupViewMode: function() {
    try {
      let options = [
        "记住上次视图（推荐）",
        "固定默认视图"
      ]

      UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
        "选择启动行为",
        "下次打开插件时如何选择视图",
        0,
        "取消",
        options,
        (alert, buttonIndex) => {
          try {
            if (buttonIndex === 0) return  // 取消

            let rememberLast = (buttonIndex === 1)  // 1=记住上次, 2=固定默认
            pinnerConfig.settings.rememberLastView = rememberLast
            pinnerConfig.save()

            // 更新按钮文字
            let modeText = rememberLast ? "启动: 记住上次视图 ✅" : "启动: 固定默认视图 📌"
            self.startupViewModeButton.setTitleForState(modeText, 0)

            // 切换其他按钮的显示/隐藏
            if (self.defaultViewModeButton) {
              self.defaultViewModeButton.hidden = rememberLast
            }
            if (self.defaultSectionButton) {
              self.defaultSectionButton.hidden = rememberLast
            }

            // 重新布局（因为按钮显示状态改变）
            self.preferencesViewLayout()

            MNUtil.showHUD(`已切换到: ${options[buttonIndex - 1]}`)
          } catch (error) {
            pinnerUtils.addErrorLog(error, "changeStartupViewMode:callback")
          }
        }
      )
    } catch (error) {
      pinnerUtils.addErrorLog(error, "changeStartupViewMode")
    }
  },

  /**
   * 切换"Pin 卡片时询问标题"开关
   */
  toggleAlwaysAskCardTitle: function() {
    try {
      let currentValue = pinnerConfig.settings.alwaysAskCardTitle || false
      let newValue = !currentValue

      pinnerConfig.settings.alwaysAskCardTitle = newValue
      pinnerConfig.save()

      // 更新按钮文字
      self.alwaysAskCardTitleButton.setTitleForState(
        `Pin 卡片时询问标题: ${newValue ? "✅" : "❌"}`,
        0
      )

      MNUtil.showHUD(newValue ? "已开启询问" : "已关闭询问")
    } catch (error) {
      pinnerUtils.addErrorLog(error, "toggleAlwaysAskCardTitle")
    }
  },

  /**
   * 切换"Pin 页面时询问标题"开关
   */
  toggleAlwaysAskPageTitle: function() {
    try {
      let currentValue = pinnerConfig.settings.alwaysAskPageTitle || false
      let newValue = !currentValue

      pinnerConfig.settings.alwaysAskPageTitle = newValue
      pinnerConfig.save()

      // 更新按钮文字
      self.alwaysAskPageTitleButton.setTitleForState(
        `Pin 页面时询问标题: ${newValue ? "✅" : "❌"}`,
        0
      )

      MNUtil.showHUD(newValue ? "已开启询问" : "已关闭询问")
    } catch (error) {
      pinnerUtils.addErrorLog(error, "toggleAlwaysAskPageTitle")
    }
  },

  /**
   * 切换"Pin 剪贴板时询问标题"开关
   */
  toggleAlwaysAskClipboardTitle: function() {
    try {
      let currentValue = pinnerConfig.settings.alwaysAskClipboardTitle || false
      let newValue = !currentValue

      pinnerConfig.settings.alwaysAskClipboardTitle = newValue
      pinnerConfig.save()

      // 更新按钮文字
      self.alwaysAskClipboardTitleButton.setTitleForState(
        `Pin 剪贴板时询问标题: ${newValue ? "✅" : "❌"}`,
        0
      )

      MNUtil.showHUD(newValue ? "已开启询问" : "已关闭询问")
    } catch (error) {
      pinnerUtils.addErrorLog(error, "toggleAlwaysAskClipboardTitle")
    }
  },

  /**
   * 统一的标签页切换处理方法（配置驱动）
   * 替代所有重复的 xxxTabTapped 方法
   * @param {UIButton} button - 点击的按钮，包含 viewName 元数据
   */
  genericTabTapped: function(button) {
    try {
      // 从按钮获取目标视图名称（在 createSectionTabButton 中设置）
      let targetView = button.viewName
      if (targetView) {
        self.switchView(targetView)
      } else {
        pinnerUtils.log("按钮缺少 viewName 属性", "genericTabTapped")
      }
    } catch (error) {
      pinnerUtils.addErrorLog(error, "genericTabTapped")
    }
  },

  // === 分区视图的事件处理方法 ===
  clearCards: async function(button) {
    try {
      // ✅ 直接使用 currentSection（工具栏按钮）
      let section = self.currentSection
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
   * Pin 当前卡片到指定分区
   */
  pinCurrentCard: async function(param) {
    try {
      // ✅ 直接使用 currentSection（工具栏按钮）
      let section = self.currentSection

      // 获取当前聚焦的卡片
      let focusNote = MNNote.getFocusNote()

      if (!focusNote) {
        MNUtil.showHUD("请先选择一个卡片")
        return
      }

      // 获取卡片信息
      let noteId = focusNote.noteId
      let defaultTitle = focusNote.noteTitle || "未命名卡片"
      let title = defaultTitle

      // 检查设置：是否总是询问标题
      let settings = pinnerConfig.settings || pinnerConfig.getDefaultSettings()
      if (settings.alwaysAskCardTitle) {
        // 弹出输入框让用户自定义标题
        let result = await MNUtil.userInput(
          "自定义卡片标题",
          "请输入卡片标题",
          ["取消", "确定"],
          { default: defaultTitle }  // 设置默认值
        )

        if (result.button === 0) return  // 点击取消

        title = result.input.trim() || defaultTitle
      }

      // 使用工厂方法创建 Card Pin，然后使用统一的 addPin 方法
      let cardPin = pinnerConfig.createCardPin(noteId, title)
      let success = pinnerConfig.addPin(cardPin, section, "top")

      if (success) {
        MNUtil.showHUD(`已 Pin 卡片到 ${pinnerConfig.getSectionDisplayName(section)}`)
        // 刷新视图
        self.refreshSectionCards(section)
      }

    } catch (error) {
      pinnerUtils.addErrorLog(error, "pinCurrentCard")
      MNUtil.showHUD("Pin 卡片失败: " + error.message)
    }
  },

  /**
   * Pin 当前页面到指定分区
   */
  pinCurrentPageToSection: async function(param) {
    try {
      // ✅ 直接使用 currentSection（工具栏按钮）
      let section = self.currentSection

      // 获取当前文档控制器
      let docController = MNUtil.currentDocController
      if (!docController) {
        MNUtil.showHUD("当前没有打开的文档")
        return
      }

      // 获取当前文档的 MD5 和页码
      let docMd5 = docController.document.docMd5
      let pageIndex = docController.currPageIndex
      let doc = docController.document
      // 优先使用文件路径，兜底使用文档标题
      let docName = (doc.pathFile && doc.pathFile.lastPathComponent) || doc.docTitle || "未知文档"
      let defaultTitle = `${docName} - 第${pageIndex + 1}页`
      let title = defaultTitle

      // 检查设置：是否总是询问标题
      let settings = pinnerConfig.settings || pinnerConfig.getDefaultSettings()
      if (settings.alwaysAskPageTitle) {
        // 弹出输入框让用户自定义标题
        let result = await MNUtil.userInput(
          "自定义页面标题",
          "请输入页面标题",
          ["取消", "确定"],
          { default: defaultTitle }  // 设置默认值
        )

        if (result.button === 0) return  // 点击取消

        title = result.input.trim() || defaultTitle
      }

      // 使用工厂方法创建 Page Pin，然后使用统一的 addPin 方法
      let pagePin = pinnerConfig.createPagePin(docMd5, pageIndex, title, "")
      let success = pinnerConfig.addPin(pagePin, section, "top")

      if (success) {
        MNUtil.showHUD(`已 Pin 页面到 ${pinnerConfig.getSectionDisplayName(section)}`)
        // 刷新视图
        self.refreshSectionCards(section)
      }

    } catch (error) {
      pinnerUtils.addErrorLog(error, "pinCurrentPageToSection")
      MNUtil.showHUD("Pin 页面失败: " + error.message)
    }
  },

  /**
   * Pin 当前剪贴板内容到当前分区
   */
  pinCurrentClipboard: async function(button) {
    try {
      // 获取系统剪贴板文本
      let clipboardText = UIPasteboard.generalPasteboard().string

      if (!clipboardText || clipboardText.trim().length === 0) {
        MNUtil.showHUD("剪贴板为空")
        return
      }

      // 获取当前分区
      let section = button.section || self.currentSection

      let title = null

      // 检查是否需要询问标题
      if (pinnerConfig.settings.alwaysAskClipboardTitle) {
        // 弹出输入框让用户自定义标题（可选）
        let result = await MNUtil.userInput(
          "Pin 剪贴板文本",
          "请输入标题（留空自动生成）",
          ["取消", "确定"]
        )

        if (result.button === 0) return  // 点击取消

        title = result.input.trim() || null  // 空字符串转为 null，让工厂方法自动生成
      }
      // 否则直接使用 null，让工厂方法自动生成标题

      // 调用工具方法添加剪贴板 Pin
      if (pinnerUtils.pinClipboard(clipboardText, {
        section: section,
        position: "top",
        title: title
      })) {
        // MNUtil.showHUD(`✅ 已添加到 ${pinnerConfig.getSectionDisplayName(section)}`)
        // 刷新当前分区视图
        self.refreshSectionCards(section)
      }

    } catch (error) {
      pinnerUtils.addErrorLog(error, "pinCurrentClipboard")
      MNUtil.showHUD("Pin 剪贴板失败: " + error.message)
    }
  },

  /**
   * 创建空白占位卡片
   */
  createBlankCard: async function(button) {
    try {
      // ✅ 直接使用 currentSection（工具栏按钮）
      let section = self.currentSection

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
        type: "card",  // 添加类型字段，确保与其他卡片数据结构一致
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
   * 删除单个 Pin（支持 Card 和 Page 类型）
   */
  deleteCard: function(button) {
    try {
      // ✅ 通过 tag 获取索引，从数据源回溯完整信息
      let index = button.tag
      let section = button.section || self.currentSection

      // 从 pinnerConfig 获取完整数据
      let pins = pinnerConfig.getPins(section)
      if (!pins || pins.length === 0) {
        MNUtil.showHUD("分区数据为空")
        return
      }

      let card = pins[index]
      if (!card) {
        MNUtil.showHUD("卡片数据已失效，正在刷新...")
        self.refreshSectionCards(section)
        return
      }

      // 调用数据层统一删除方法
      let success = pinnerConfig.removePin(card, section)

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
   * 单击定位卡片或跳转页面（根据 type 区分）
   *
   * 支持 Card 类型（脑图定位）和 Page 类型（文档跳转）
   */
  focusCardTapped: function(button) {
    try {
      // ✅ 通过 tag 获取索引，从数据源回溯完整信息
      let index = button.tag
      let section = button.section || self.currentSection

      // 从 pinnerConfig 获取完整数据
      let pins = pinnerConfig.getPins(section)
      if (!pins || pins.length === 0) {
        MNUtil.showHUD("分区数据为空")
        return
      }

      let card = pins[index]
      if (!card) {
        MNUtil.showHUD("卡片数据已失效，正在刷新...")
        self.refreshSectionCards(section)
        return
      }

      // ✅ 根据 type 字段判断类型（从数据源获取）
      if (card.type === "page") {
        return self.jumpToPageByData(card)
      }

      let noteId = card.noteId
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

        // 创建真实子卡片
        let newNote = focusNote.createChildNote({
          title: card.title
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
      // ✅ 通过 tag 获取索引，从数据源回溯完整信息
      let index = button.tag
      let section = button.section || self.currentSection

      // 从 pinnerConfig 获取完整数据
      let pins = pinnerConfig.getPins(section)
      if (!pins || pins.length === 0) {
        MNUtil.showHUD("分区数据为空")
        return
      }

      let card = pins[index]
      if (!card) {
        MNUtil.showHUD("卡片数据已失效，正在刷新...")
        self.refreshSectionCards(section)
        return
      }

      // ✅ 创建包含完整数据的参数对象
      let param = {
        index: index,
        card: card,
        section: section,
        button: button  // 保留 button 引用用于弹窗定位
      }

      // 创建菜单选项
      let commandTable = [
        self.tableItem("🔄 更新为当前卡片", "updatePinToFocusNote:", param),
        self.tableItem("✏️  修改标题", "renameCard:", param),
        self.tableItem("↔️  转移到...", "showTransferMenu:", param)
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
  showTransferMenu: function(param) {
    try {
      self.checkPopover()  // 关闭当前菜单

      // ✅ 从 param 对象获取数据
      let card = param.card
      let currentSection = param.section || self.currentSection
      let button = param.button  // 用于弹窗定位

      let noteId = card.noteId
      if (!noteId) {
        MNUtil.showHUD("无法获取卡片ID")
        return
      }

      // 获取所有分区，排除当前分区
      let sections = pinnerConfig.getSectionNames()
      let targetSections = sections.filter(s => s !== currentSection)

      if (targetSections.length === 0) {
        MNUtil.showHUD("没有可转移的分区")
        return
      }

      // 创建转移菜单
      let commandTable = targetSections.map(section => {
        let displayName = pinnerConfig.getSectionDisplayName(section)
        let transferParam = { noteId: noteId, fromSection: currentSection, toSection: section }
        return self.tableItem(`➡️  ${displayName}`, "transferCard:", transferParam)
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
   * 显示页面转移菜单
   */
  showTransferMenuForPage: function(param) {
    try {
      self.checkPopover()  // 关闭当前菜单

      // ✅ 从 param 对象获取数据
      let page = param.page
      let currentSection = param.section || self.currentSection
      let button = param.button  // 用于弹窗定位

      let docMd5 = page.docMd5
      let pageIndex = page.pageIndex

      if (!docMd5 || pageIndex === undefined || !currentSection) {
        MNUtil.showHUD("无法获取页面信息")
        return
      }

      // 获取所有分区，排除当前分区
      let sections = pinnerConfig.getSectionNames()
      let targetSections = sections.filter(s => s !== currentSection)

      if (targetSections.length === 0) {
        MNUtil.showHUD("没有可转移的分区")
        return
      }

      // 创建转移菜单
      let commandTable = targetSections.map(section => {
        let displayName = pinnerConfig.getSectionDisplayName(section)
        let transferParam = {
          docMd5: docMd5,
          pageIndex: pageIndex,
          fromSection: currentSection,
          toSection: section
        }
        return self.tableItem(`➡️  ${displayName}`, "transferPagePin:", transferParam)
      })

      // 显示菜单
      self.popoverController = MNUtil.getPopoverAndPresent(
        button,
        commandTable,
        150,
        1
      )
    } catch (error) {
      pinnerUtils.addErrorLog(error, "showTransferMenuForPage")
      MNUtil.showHUD("显示转移菜单失败")
    }
  },

  /**
   * 执行页面转移
   */
  transferPagePin: function(param) {
    try {
      self.checkPopover()

      let { docMd5, pageIndex, fromSection, toSection } = param

      // 创建 Page Pin 对象
      let pagePin = {
        type: "page",
        docMd5: docMd5,
        pageIndex: pageIndex
      }

      if (pinnerConfig.transferPin(pagePin, fromSection, toSection)) {
        // 刷新源分区视图（使用统一的刷新方法）
        self.refreshSectionCards(fromSection)
        MNUtil.showHUD(`已转移到${pinnerConfig.getSectionDisplayName(toSection)}`)
      }
    } catch (error) {
      pinnerUtils.addErrorLog(error, "transferPagePin")
      MNUtil.showHUD("转移失败")
    }
  },

  /**
   * 重命名卡片
   */
  renameCard: async function(param) {
    try {
      self.checkPopover()  // 关闭菜单

      // ✅ 从 param 对象获取数据
      let card = param.card
      let section = param.section || self.currentSection

      let noteId = card.noteId
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
  updatePinToFocusNote: function(param) {
    try {
      self.checkPopover()  // 关闭菜单

      // 获取当前聚焦的卡片
      let focusNote = MNNote.getFocusNote()
      if (!focusNote) {
        MNUtil.showHUD("请先选择一个卡片")
        return
      }

      // ✅ 从 param 对象获取数据
      let card = param.card
      let section = param.section || self.currentSection

      let oldNoteId = card.noteId
      let newNoteId = focusNote.noteId

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
      // ⚠️ 立即禁用按钮，防止重复点击
      if (button.enabled === false) return
      button.enabled = false

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
      // ⚠️ 立即禁用按钮，防止重复点击
      if (button.enabled === false) return
      button.enabled = false

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
   * 长按定位按钮 - 在浮窗显示卡片或跳转到页面
   */
  onLongPressFocusButton: function(gesture) {
    try {
      // 只在手势开始时执行一次
      if (gesture.state !== 1) return

      let button = gesture.view
      let index = button.tag
      let section = button.section || self.currentSection

      // 从 pinnerConfig 获取完整数据
      let pins = pinnerConfig.getPins(section)
      if (!pins || pins.length === 0) {
        MNUtil.showHUD("分区数据为空")
        return
      }

      let card = pins[index]
      if (!card) {
        MNUtil.showHUD("卡片数据已失效")
        return
      }

      // ✅ 处理页面类型 - 长按也跳转到页面（与短按相同）
      if (card.type === "page") {
        return self.jumpToPageByData(card)
      }

      let noteId = card.noteId
      if (!noteId) {
        MNUtil.showHUD("无法获取卡片ID")
        return
      }

      // 检测空白卡片
      if (noteId.startsWith("BLANK_")) {
        MNUtil.showHUD("空白卡片无法在浮窗显示")
        return
      }

      // 在浮窗中聚焦卡片
      let note = MNNote.new(noteId)
      if (note) {
        note.focusInFloatMindMap(0.1)  // 0.1秒延迟确保浮窗打开
        // MNUtil.showHUD("已在浮窗显示")
      } else {
        MNUtil.showHUD("找不到该卡片")
      }
    } catch (error) {
      pinnerUtils.addErrorLog(error, "onLongPressFocusButton")
      MNUtil.showHUD("显示失败")
    }
  },

  /**
   * 页面项点击（显示操作菜单）
   */
  pageItemTapped: function(button) {
    try {
      // ✅ 从按钮获取分区和索引信息
      let section = button.section || "pages"
      let index = button.tag

      // ✅ 从正确的分区获取页面数据
      let pins = pinnerConfig.getPins(section)
      let page = pins[index]

      if (!page) {
        MNUtil.showHUD("页面不存在")
        return
      }

      // 创建参数对象传递给菜单项，包含 section 信息
      let param = {
        index: index,
        page: page,
        section: section,
        button: button  // ✅ 添加 button 引用用于弹窗定位
      }

      // 创建菜单选项
      let commandTable = [
        self.tableItem("📍 跳转到页面", "jumpToPageFromMenu:", param),
        self.tableItem("✏️ 重命名", "renamePage:", param),
        self.tableItem("🔄 更新进度", "updatePageProgress:", param),
        self.tableItem("↔️  转移到...", "showTransferMenuForPage:", param)  // ✅ 改为 param
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

  // ========== 剪贴板 Pin 事件处理方法 ==========
  
  /**
   * 复制剪贴板文本到系统剪贴板
   */
  copyClipboardText: function(button) {
    try {
      let index = button.tag
      let section = button.section || self.currentSection
      
      let pins = pinnerConfig.getPins(section)
      let clipboard = pins[index]
      
      if (clipboard && clipboard.text) {
        MNUtil.copy(clipboard.text)
        MNUtil.showHUD("✅ 已复制到剪贴板")
      }
    } catch (error) {
      pinnerUtils.addErrorLog(error, "copyClipboardText")
      MNUtil.showHUD("复制失败")
    }
  },
  
  /**
   * 预览剪贴板文本（弹窗显示完整内容）
   */
  previewClipboardText: function(button) {
    try {
      let index = button.tag
      let section = button.section || self.currentSection

      let pins = pinnerConfig.getPins(section)
      let clipboard = pins[index]

      if (!clipboard || !clipboard.text) {
        MNUtil.showHUD("数据已失效")
        return
      }

      // 使用正确的 UIAlertView API 显示完整文本
      UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
        clipboard.title || "文本内容",
        clipboard.text,
        0,  // alertViewStyle: 0 = 普通对话框（无输入框）
        "关闭",
        null,  // 没有其他按钮
        null   // 没有回调
      )
    } catch (error) {
      pinnerUtils.addErrorLog(error, "previewClipboardText")
      MNUtil.showHUD("预览失败")
    }
  },
  
  /**
   * 编辑剪贴板文本
   */
  editClipboardText: async function(button) {
    try {
      let index = button.tag
      let section = button.section || self.currentSection

      let pins = pinnerConfig.getPins(section)
      let clipboard = pins[index]

      if (!clipboard || !clipboard.text) {
        MNUtil.showHUD("数据已失效")
        return
      }

      // 使用 MNUtil.userInput 并设置默认值（前100个字符）
      let defaultText = clipboard.text.length > 100
        ? clipboard.text.substring(0, 100) + "..."
        : clipboard.text

      let result = await MNUtil.userInput(
        "编辑文本",
        "请输入新的文本内容",
        ["取消", "保存"],
        {default: defaultText}
      )

      if (result.button === 0) return  // 点击取消

      let newText = result.input.trim()
      if (!newText || newText.length === 0) {
        MNUtil.showHUD("文本内容不能为空")
        return
      }

      // 更新文本内容
      clipboard.text = newText

      // 保存
      pinnerConfig.save()

      // 刷新视图
      self.refreshView(section + "View")

      MNUtil.showHUD("✅ 已更新")

    } catch (error) {
      pinnerUtils.addErrorLog(error, "editClipboardText")
      MNUtil.showHUD("编辑失败")
    }
  },
  
  /**
   * 点击剪贴板文本标题，显示菜单
   */
  clipboardItemTapped: function(button) {
    try {
      let index = button.tag
      let section = button.section || self.currentSection
      
      let pins = pinnerConfig.getPins(section)
      let clipboard = pins[index]
      
      if (!clipboard) {
        MNUtil.showHUD("数据已失效，正在刷新...")
        self.refreshSectionCards(section)
        return
      }
      
      let param = {
        index: index,
        clipboard: clipboard,
        section: section,
        button: button
      }
      
      // 创建菜单选项
      let commandTable = [
        self.tableItem("📋 复制文本", "copyClipboardTextFromMenu:", param),
        self.tableItem("👁️ 查看完整内容", "previewClipboardTextFromMenu:", param),
        self.tableItem("✏️ 编辑文本", "editClipboardTextFromMenu:", param),
        self.tableItem("✏️ 修改标题", "renameClipboard:", param),
        self.tableItem("↔️ 转移到...", "showTransferMenu:", param)
      ]
      
      // 显示弹出菜单
      self.popoverController = MNUtil.getPopoverAndPresent(
        button,
        commandTable,
        150,
        35 * commandTable.length
      )
    } catch (error) {
      pinnerUtils.addErrorLog(error, "clipboardItemTapped")
      MNUtil.showHUD("菜单显示失败")
    }
  },
  
  /**
   * 从菜单中复制文本
   */
  copyClipboardTextFromMenu: function(param) {
    try {
      self.checkPopover()  // 关闭菜单
      let clipboard = param.clipboard
      if (clipboard && clipboard.text) {
        MNUtil.copy(clipboard.text)
        MNUtil.showHUD("✅ 已复制到剪贴板")
      }
    } catch (error) {
      pinnerUtils.addErrorLog(error, "copyClipboardTextFromMenu")
      MNUtil.showHUD("复制失败")
    }
  },
  
  /**
   * 从菜单中预览文本
   */
  previewClipboardTextFromMenu: function(param) {
    try {
      self.checkPopover()  // 关闭菜单
      let clipboard = param.clipboard
      if (!clipboard || !clipboard.text) {
        MNUtil.showHUD("数据已失效")
        return
      }

      // 使用正确的 UIAlertView API 显示完整文本
      UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
        clipboard.title || "文本内容",
        clipboard.text,
        0,  // alertViewStyle: 0 = 普通对话框（无输入框）
        "关闭",
        null,  // 没有其他按钮
        null   // 没有回调
      )
    } catch (error) {
      pinnerUtils.addErrorLog(error, "previewClipboardTextFromMenu")
      MNUtil.showHUD("预览失败")
    }
  },
  
  /**
   * 从菜单中编辑文本
   */
  editClipboardTextFromMenu: async function(param) {
    try {
      self.checkPopover()  // 关闭菜单
      let section = param.section
      let index = param.index  // ✅ 使用索引而不是对象引用
      
      // ✅ 重新获取最新的对象
      let pins = pinnerConfig.getPins(section)
      let clipboard = pins[index]

      if (!clipboard || !clipboard.text) {
        MNUtil.showHUD("数据已失效")
        return
      }

      // 使用 MNUtil.userInput 并设置默认值（前100个字符）
      let defaultText = clipboard.text.length > 100
        ? clipboard.text.substring(0, 100) + "..."
        : clipboard.text

      let result = await MNUtil.userInput(
        "编辑文本",
        "请输入新的文本内容",
        ["取消", "保存"],
        {default: defaultText}
      )

      if (result.button === 0) return  // 点击取消

      let newText = result.input.trim()
      if (!newText || newText.length === 0) {
        MNUtil.showHUD("文本内容不能为空")
        return
      }

      // 更新文本内容
      clipboard.text = newText

      pinnerConfig.save()
      self.refreshView(section + "View")
      MNUtil.showHUD("✅ 已更新")

    } catch (error) {
      pinnerUtils.addErrorLog(error, "editClipboardTextFromMenu")
      MNUtil.showHUD("编辑失败")
    }
  },
  
  /**
   * 修改剪贴板 Pin 的标题
   */
  renameClipboard: async function(param) {
    try {
      self.checkPopover()  // 关闭菜单
      let section = param.section
      let index = param.index  // ✅ 使用索引而不是对象引用
      
      // ✅ 重新获取最新的对象
      let pins = pinnerConfig.getPins(section)
      let clipboard = pins[index]

      if (!clipboard) {
        MNUtil.showHUD("数据已失效")
        return
      }

      // 使用 MNUtil.userInput 并设置当前标题为默认值
      let result = await MNUtil.userInput(
        "修改标题",
        "请输入新标题",
        ["取消", "确定"],
        {default: clipboard.title || ""}
      )

      if (result.button === 0) return  // 点击取消

      let newTitle = result.input.trim()
      if (!newTitle || newTitle.length === 0) {
        MNUtil.showHUD("标题不能为空")
        return
      }

      // 更新标题
      clipboard.title = newTitle
      pinnerConfig.save()

      // 刷新视图
      self.refreshView(section + "View")

      MNUtil.showHUD("✅ 标题已更新")

    } catch (error) {
      pinnerUtils.addErrorLog(error, "renameClipboard")
      MNUtil.showHUD("修改标题失败")
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
      let section = param.section || "pages"  // ✅ 获取分区信息

      if (!page) {
        MNUtil.showHUD("页面不存在")
        return
      }

      let currentTitle = page.title || ""

      // 获取预设短语（从配置中读取）
      let presets = pinnerConfig.getPageTitlePresets()

      // 构建菜单选项：确定按钮 + 预设短语
      let menuOptions = ["✅ 确定"]
      presets.forEach(preset => {
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
              const preset = presets[selectedIndex - 1]
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
              // ✅ 传入 section 参数并检查返回值
              let success = pinnerConfig.updatePagePinTitle(page.docMd5, page.pageIndex, finalTitle, section)

              if (success) {
                // ✅ 刷新对应的视图
                self.refreshSectionCards(section)
                MNUtil.showHUD("✅ 标题已更新")
              } else {
                MNUtil.showHUD("❌ 更新失败")
              }
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
        currentPageIndex,
        param.section || "pages"
      )

      // 显示结果
      MNUtil.showHUD(result.message)

      // ✅ 如果更新成功，刷新视图显示
      if (result.success) {
        self.refreshSectionCards(param.section || "pages")
      }

    } catch (error) {
      pinnerUtils.addErrorLog(error, "updatePageProgress")
      MNUtil.showHUD("更新失败: " + error.message)
    }
  },

  /**
   * Pin 当前页面到当前分区
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

      // 获取当前分区
      let section = button.section || self.currentSection

      // 创建 Page Pin 对象
      let pagePin = pinnerConfig.createPagePin(docMd5, pageIndex)

      // 添加到当前分区
      let success = pinnerConfig.addPin(pagePin, section)

      if (success) {
        MNUtil.showHUD(`已 Pin 第 ${pageIndex + 1} 页`)
        // 刷新当前分区视图
        self.refreshSectionCards(section)
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

      // pages 分区已废弃，刷新当前视图
      self.refreshSectionCards(self.currentSection)
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
    self.checkPopover()  // 关闭菜单
    self.jumpToPage(button)
    // try {
    //   // 使用 tag 获取索引，然后从数据源获取页面数据
    //   let index = button.tag
    //   let pages = pinnerConfig.getPagePins()
    //   let page = pages[index]

    //   // 验证页面数据
    //   if (!page) {
    //     MNUtil.showHUD("页面不存在")
    //     return
    //   }

    //   let docMd5 = page.docMd5
    //   let pageIndex = page.pageIndex

    //   // 验证文档存在
    //   let docInfo = pinnerConfig.getDocInfo(docMd5)
    //   if (!docInfo.doc) {
    //     MNUtil.showHUD("文档不存在")
    //     return
    //   }

    //   // 验证页码范围
    //   if (pageIndex < 0 || pageIndex > docInfo.lastPageIndex) {
    //     MNUtil.showHUD(`页码超出范围(0-${docInfo.lastPageIndex})`)
    //     return
    //   }

    //   // 打开文档（如果不是当前文档）
    //   if (docMd5 !== MNUtil.currentDocMd5) {
    //     MNUtil.openDoc(docMd5)

    //     // 确保文档视图可见（参考 mnsnipaste 的实现）
    //     if (MNUtil.docMapSplitMode === 0) {
    //       MNUtil.docMapSplitMode = 1  // 从纯脑图切换到分割模式
    //     }

    //     // 等待文档加载（优化：参考 mnsnipaste 使用 0.01 秒）
    //     await MNUtil.delay(0.01)
    //   }

    //   // 跳转到指定页面
    //   let docController = MNUtil.currentDocController
    //   if (!docController) {
    //     MNUtil.showHUD("无法获取文档控制器")
    //     return
    //   }

    //   if (docController.currPageIndex !== pageIndex) {
    //     docController.setPageAtIndex(pageIndex)
    //   }

    //   MNUtil.showHUD(`已跳转到第 ${pageIndex + 1} 页`)

    // } catch (error) {
    //   pinnerUtils.addErrorLog(error, "jumpToPage")
    //   MNUtil.showHUD("跳转失败: " + error.message)
    // }
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
      // pages 分区已废弃，刷新当前视图
      self.refreshSectionCards(self.currentSection)
      MNUtil.showHUD("已删除")

    } catch (error) {
      pinnerUtils.addErrorLog(error, "deletePage")
    }
  },

  /**
   * 上移页面
   */
  movePageUp: function(button) {
    try {
      // ⚠️ 立即禁用按钮，防止重复点击
      if (button.enabled === false) {
        return
      }
      button.enabled = false

      let index = button.tag
      let section = button.section || "pages"
      let pins = pinnerConfig.getPins(section)

      if (index > 0) {
        pinnerConfig.movePin(index, index - 1, section)
        // 刷新分区视图
        self.refreshSectionCards(section)
        MNUtil.showHUD("已上移")
      } else {
        MNUtil.showHUD("已经是第一个")
      }
    } catch (error) {
      pinnerUtils.addErrorLog(error, "movePageUp")
      MNUtil.showHUD("上移失败: " + error.message)
    }
  },

  /**
   * 下移页面
   */
  movePageDown: function(button) {
    try {
      // ⚠️ 立即禁用按钮，防止重复点击
      if (button.enabled === false) {
        return
      }
      button.enabled = false

      let index = button.tag
      let section = button.section || "pages"
      let pins = pinnerConfig.getPins(section)

      if (index < pins.length - 1) {
        pinnerConfig.movePin(index, index + 1, section)
        // 刷新分区视图
        self.refreshSectionCards(section)
        MNUtil.showHUD("已下移")
      } else {
        MNUtil.showHUD("已经是最后一个")
      }
    } catch (error) {
      pinnerUtils.addErrorLog(error, "movePageDown")
      MNUtil.showHUD("下移失败: " + error.message)
    }
  },

  switchViewMode: function(targetMode) {
    self.checkPopover()  // 关闭菜单
    self.switchViewMode(targetMode)
  },

  // ========== 多选功能相关方法 ==========

  /**
   * 切换卡片选择状态
   */
  toggleCardSelection: function(button) {
    try {
      let index = button.tag
      let section = button.section || self.currentSection

      // 从 pinnerConfig 获取完整数据
      let pins = pinnerConfig.getPins(section)
      if (!pins || pins.length === 0) {
        MNUtil.showHUD("分区数据为空")
        return
      }

      let card = pins[index]
      if (!card) {
        MNUtil.showHUD("卡片数据已失效")
        return
      }

      // 使用复合 key 存储选择状态
      let key = section + "-" + card.noteId

      if (self.selectedCards.has(key)) {
        // 已选中，取消选择
        self.selectedCards.delete(key)
        button.setTitleForState("☐", 0)
      } else {
        // 未选中，添加选择
        self.selectedCards.set(key, {
          noteId: card.noteId,
          title: card.title || "未命名卡片",
          section: section
        })
        button.setTitleForState("☑️", 0)
      }

      // 更新导出按钮的状态和显示文本
      self.updateExportButtonsState()

    } catch (error) {
      pinnerUtils.addErrorLog(error, "toggleCardSelection")
    }
  },

  // ========== 多选导出功能 ==========

  /**
   * 导出选中的卡片为纯 URL 列表
   * 格式：每行一个 URL
   * marginnote4app://note/{noteId}
   */
  exportSelectedCardsAsURL: function(button) {
    try {
      // 检查是否有选中卡片
      let selectedCards = self.getSelectedCards()
      if (selectedCards.length === 0) {
        MNUtil.showHUD("请先选中至少一张卡片")
        return
      }

      // 默认标题
      let defaultTitle = `链接集合 (${selectedCards.length} 个)`

      // 显示带输入框和选项的对话框
      const alert = UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
        "导出为 URL",
        "请选择导出方式",
        2,  // alertViewStyle = 2（文本输入框）
        "取消",
        ["✅ 创建新卡片", "📌 添加到当前卡片"],
        (alert, buttonIndex) => {
          try {
            if (buttonIndex === 0) return  // 取消

            if (buttonIndex === 1) {
              // ✅ 创建新卡片
              let focusNote = MNNote.getFocusNote()
              if (!focusNote) {
                MNUtil.showHUD("请先聚焦一张卡片作为容器")
                return
              }

              let title = alert.textFieldAtIndex(0).text.trim()
              if (!title) {
                title = defaultTitle
              }

              // 创建新卡片
              let newNote = focusNote.createChildNote({
                title: title
              })

              if (!newNote) {
                MNUtil.showHUD("创建卡片失败")
                return
              }

              // 添加 URL 列表作为文本评论
              MNUtil.undoGrouping(()=>{
                selectedCards.forEach(card => {
                  newNote.appendTextComment("marginnote4app://note/" + card.noteId)
                })

                newNote.refresh()
              })

              // 聚焦到新卡片
              newNote.focusInMindMap(0.3)

              MNUtil.showHUD(`✅ 已导出 ${selectedCards.length} 个链接`)

            } else if (buttonIndex === 2) {
              // 📌 添加到当前卡片
              let focusNote = MNNote.getFocusNote()
              if (!focusNote) {
                MNUtil.showHUD("请先聚焦一张卡片")
                return
              }

              MNUtil.undoGrouping(()=>{
                // 生成 URL 列表并添加到当前卡片评论
                selectedCards.forEach(card => {
                  focusNote.appendTextComment("marginnote4app://note/" + card.noteId)
                })

                focusNote.refresh()
              })

              MNUtil.showHUD(`✅ 已添加 ${selectedCards.length} 个链接到当前卡片`)
            }

            // 清空选择状态并刷新界面
            let affectedSections = new Set()
            selectedCards.forEach(card => {
              affectedSections.add(card.section)
            })

            self.clearSelection()

            // 刷新受影响的分区（更新勾选框状态）
            affectedSections.forEach(section => {
              self.refreshSectionCards(section)
            })

          } catch (error) {
            pinnerUtils.addErrorLog(error, "exportSelectedCardsAsURL callback")
            MNUtil.showHUD("导出失败: " + error.message)
          }
        }
      )

      // 设置输入框默认值
      MNUtil.delay(0.1).then(() => {
        const textField = alert.textFieldAtIndex(0)
        if (textField) {
          textField.text = defaultTitle
        }
      })

    } catch (error) {
      pinnerUtils.addErrorLog(error, "exportSelectedCardsAsURL")
      MNUtil.showHUD("导出失败: " + error.message)
    }
  },

  /**
   * 导出选中的卡片为 Markdown 链接列表
   * 格式：
   * 1. [卡片标题](marginnote4app://note/{noteId})
   * 2. [卡片标题](marginnote4app://note/{noteId})
   */
  exportSelectedCardsAsMarkdown: function(button) {
    try {
      // 检查是否有选中卡片
      let selectedCards = self.getSelectedCards()
      if (selectedCards.length === 0) {
        MNUtil.showHUD("请先选中至少一张卡片")
        return
      }

      // 默认标题
      let defaultTitle = `链接集合 (${selectedCards.length} 个)`

      // 显示带输入框和选项的对话框
      const alert = UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
        "导出为 Markdown",
        "请选择导出方式",
        2,  // alertViewStyle = 2（文本输入框）
        "取消",
        ["✅ 创建新卡片", "📌 添加到当前卡片"],
        (alert, buttonIndex) => {
          try {
            if (buttonIndex === 0) return  // 取消

            // 生成 Markdown 链接列表内容
            let markdownLines = []
            selectedCards.forEach((card, index) => {
              let url = "marginnote4app://note/" + card.noteId
              let displayTitle = card.title || "未命名卡片"
              let line = `${index + 1}. [${displayTitle}](${url})`
              markdownLines.push(line)
            })
            let content = markdownLines.join("\n")

            if (buttonIndex === 1) {
              // ✅ 创建新卡片
              let focusNote = MNNote.getFocusNote()
              if (!focusNote) {
                MNUtil.showHUD("请先聚焦一张卡片作为容器")
                return
              }

              let title = alert.textFieldAtIndex(0).text.trim()
              if (!title) {
                title = defaultTitle
              }

              // 创建新卡片
              let newNote = focusNote.createChildNote({
                title: title
              })

              if (!newNote) {
                MNUtil.showHUD("创建卡片失败")
                return
              }

              MNUtil.undoGrouping(()=>{
                // 添加 Markdown 链接列表作为 Markdown 评论
                newNote.appendMarkdownComment(content)

                newNote.refresh()
              })
              // 聚焦到新卡片
              newNote.focusInMindMap(0.3)

              MNUtil.showHUD(`✅ 已导出 ${selectedCards.length} 个链接`)

            } else if (buttonIndex === 2) {
              // 📌 添加到当前卡片
              let focusNote = MNNote.getFocusNote()
              if (!focusNote) {
                MNUtil.showHUD("请先聚焦一张卡片")
                return
              }

              MNUtil.undoGrouping(()=>{
                // 添加 Markdown 链接列表到当前卡片评论
                focusNote.appendMarkdownComment(content)
                focusNote.refresh()
              })

              MNUtil.showHUD(`✅ 已添加 ${selectedCards.length} 个链接到当前卡片`)
            }

            // 清空选择状态并刷新界面
            let affectedSections = new Set()
            selectedCards.forEach(card => {
              affectedSections.add(card.section)
            })

            self.clearSelection()

            // 刷新受影响的分区（更新勾选框状态）
            affectedSections.forEach(section => {
              self.refreshSectionCards(section)
            })

          } catch (error) {
            pinnerUtils.addErrorLog(error, "exportSelectedCardsAsMarkdown callback")
            MNUtil.showHUD("导出失败: " + error.message)
          }
        }
      )

      // 设置输入框默认值
      MNUtil.delay(0.1).then(() => {
        const textField = alert.textFieldAtIndex(0)
        if (textField) {
          textField.text = defaultTitle
        }
      })

    } catch (error) {
      pinnerUtils.addErrorLog(error, "exportSelectedCardsAsMarkdown")
      MNUtil.showHUD("导出失败: " + error.message)
    }
  },

  // ========== Toolbar 按钮方法（selector 绑定） ==========

  /**
   * 视图模式切换菜单（底部工具栏按钮）
   */
  changeViewMode: function(sender) {
    try {
      pinnerUtils.log("🔔 changeViewMode 被调用", "changeViewMode")
      self.checkPopover()

      let commandTable = [
        {
          title: '📌 Pin 视图',
          object: self,
          selector: 'switchViewModeTo:',
          param: 'pin',
          checked: self.currentViewMode === 'pin'
        },
        {
          title: '✅ Task 视图',
          object: self,
          selector: 'switchViewModeTo:',
          param: 'task',
          checked: self.currentViewMode === 'task'
        },
        {
          title: '🎨 自定义视图',
          object: self,
          selector: 'switchViewModeTo:',
          param: 'custom',
          checked: self.currentViewMode === 'custom'
        }
      ]

      self.popoverController = MNUtil.getPopoverAndPresent(sender, commandTable, 200, 1)
    } catch (error) {
      pinnerUtils.addErrorLog(error, "changeViewMode")
    }
  },

  /**
   * 切换到指定视图模式
   */
  switchViewModeTo: function(mode) {
    try {
      self.checkPopover()
      // 调用现有的 switchViewMode 方法
      self.switchViewMode(mode)
    } catch (error) {
      pinnerUtils.addErrorLog(error, "switchViewModeTo")
    }
  },

  /**
   * 刷新当前视图
   */
  refreshCurrentView: function(sender) {
    try {
      pinnerUtils.log("🔔 refreshCurrentView 被调用", "refreshCurrentView")
      if (self.currentSection) {
        self.refreshSectionCards(self.currentSection)
        MNUtil.showHUD("✓ 已刷新")
      } else {
        MNUtil.showHUD("未选择分区")
      }
    } catch (error) {
      pinnerUtils.addErrorLog(error, "refreshCurrentView")
    }
  },

  /**
   * 显示排序菜单
   */
  showSortMenu: function(sender) {
    try {
      pinnerUtils.log("🔔 showSortMenu 被调用", "showSortMenu")
      self.checkPopover()

      let commandTable = [
        {title: '📅 按添加时间排序', object: self, selector: 'sortCards:', param: 'time'},
        {title: '🔤 按标题排序', object: self, selector: 'sortCards:', param: 'title'},
        {title: '🔄 反转顺序', object: self, selector: 'sortCards:', param: 'reverse'}
      ]

      self.popoverController = MNUtil.getPopoverAndPresent(sender, commandTable, 180, 1)
    } catch (error) {
      pinnerUtils.addErrorLog(error, "showSortMenu")
    }
  },

  /**
   * 排序卡片
   */
  sortCards: function(mode) {
    try {
      self.checkPopover()

      if (!self.currentSection) {
        MNUtil.showHUD("未选择分区")
        return
      }

      let pins = pinnerConfig.sections[self.currentSection]
      if (!pins || pins.length === 0) {
        MNUtil.showHUD("当前分区为空")
        return
      }

      // 执行排序
      if (mode === 'time') {
        // 按添加时间排序（使用 pinnedAt 字段）
        pins.sort((a, b) => (a.pinnedAt || 0) - (b.pinnedAt || 0))
        MNUtil.showHUD("✓ 已按时间排序")
      } else if (mode === 'title') {
        // 按标题排序
        pins.sort((a, b) => {
          let titleA = a.title || ""
          let titleB = b.title || ""
          return titleA.localeCompare(titleB)
        })
        MNUtil.showHUD("✓ 已按标题排序")
      } else if (mode === 'reverse') {
        // 反转顺序
        pins.reverse()
        MNUtil.showHUD("✓ 已反转顺序")
      }

      // 保存并刷新
      pinnerConfig.save("MNPinner_sections")
      self.refreshSectionCards(self.currentSection)

    } catch (error) {
      pinnerUtils.addErrorLog(error, "sortCards")
      MNUtil.showHUD("排序失败")
    }
  }
});

// ========== 原型方法 ==========

// ========== 多选功能辅助方法 ==========

/**
 * 清空所有选择
 */
pinnerController.prototype.clearSelection = function() {
  this.selectedCards.clear()
  this.updateExportButtonsState()
}

/**
 * 获取已选数量
 */
pinnerController.prototype.getSelectedCount = function() {
  return this.selectedCards.size
}

/**
 * 获取所有选中的卡片（按 section 分组）
 */
pinnerController.prototype.getSelectedCards = function() {
  let result = []
  this.selectedCards.forEach((card) => {
    result.push(card)
  })
  return result
}

/**
 * 更新导出按钮的状态（只更新工具栏的导出按钮）
 */
pinnerController.prototype.updateExportButtonsState = function() {
  try {
    let count = this.getSelectedCount()

    // ✅ 只更新工具栏的导出按钮（不再遍历所有分区）
    if (this.toolbarExportURLButton) {
      this.toolbarExportURLButton.enabled = count > 0
      let title = count > 0 ? `🔗 导出 (${count})` : "🔗 导出"
      this.toolbarExportURLButton.setTitleForState(title, 0)
    }

    if (this.toolbarExportMarkdownButton) {
      this.toolbarExportMarkdownButton.enabled = count > 0
      let title = count > 0 ? `📝 导出 (${count})` : "📝 导出"
      this.toolbarExportMarkdownButton.setTitleForState(title, 0)
    }
  } catch (error) {
    pinnerUtils.addErrorLog(error, "updateExportButtonsState")
  }
}

/**
 * ✅ 通过数据对象跳转页面（新方法，支持从 card 对象获取数据）
 */
pinnerController.prototype.jumpToPageByData = async function (card) {
  try {
    let docMd5 = card.docMd5
    let pageIndex = card.pageIndex

    // 验证参数存在
    if (!docMd5 || pageIndex === undefined) {
      MNUtil.showHUD("缺少页面信息")
      return
    }

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
    pinnerUtils.addErrorLog(error, "jumpToPageByData")
    MNUtil.showHUD("跳转失败: " + error.message)
  }
}

/**
 * ✅ 通过按钮跳转页面（兼容旧方法，通过 tag 回溯数据）
 */
pinnerController.prototype.jumpToPage = async function (button) {
  try {
    // ✅ 通过 tag 获取索引，从数据源回溯数据
    let index = button.tag
    let section = button.section || self.currentSection

    // 从 pinnerConfig 获取完整数据
    let pins = pinnerConfig.getPins(section)
    if (!pins || pins.length === 0) {
      MNUtil.showHUD("分区数据为空")
      return
    }

    let card = pins[index]
    if (!card) {
      MNUtil.showHUD("页面数据已失效，正在刷新...")
      self.refreshSectionCards(section)
      return
    }

    // 调用新方法
    return await self.jumpToPageByData(card)

  } catch (error) {
    pinnerUtils.addErrorLog(error, "jumpToPage")
    MNUtil.showHUD("跳转失败: " + error.message)
  }
}

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

      // 使用设置的默认视图和分区
      let settings = pinnerConfig.settings || pinnerConfig.getDefaultSettings()

      // 根据设置决定使用默认值还是上次的值
      let viewMode, section

      if (settings.rememberLastView !== false) {
        // 使用上次的视图（默认行为）
        viewMode = settings.lastViewMode || "pin"
        section = settings.lastSection || "focus"
      } else {
        // 使用固定的默认视图
        viewMode = settings.defaultViewMode || "pin"
        section = settings.defaultSection || "focus"
      }

      // 检查是否需要切换视图模式
      if (this.currentViewMode !== viewMode) {
        // 需要切换视图模式（如 Pin → Task）
        this.switchViewMode(viewMode)

        // switchViewMode 会切换到该模式的第一个分区
        // 如果目标分区不是第一个，需要再次切换
        if (this.currentSection !== section) {
          this.switchView(section + "View")
        }
      } else {
        // 只需要切换分区
        this.switchView(section + "View")
      }
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
  if (this.toolbar) {
    this.toolbar.hidden = hidden
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

      // 保存上次的视图状态（如果启用了记住上次视图）
      if (pinnerConfig.settings.rememberLastView !== false) {
        pinnerConfig.settings.lastViewMode = this.currentViewMode
        pinnerConfig.settings.lastSection = this.currentSection
        pinnerConfig.save()  // 保存到 NSUserDefaults
      }
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

  // ✅ 初始化多选功能
  this.selectedCards = new Map()  // 存储选中的卡片，key: "section-noteId", value: {noteId, title, section}

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
    let height = viewFrame.height  // 恢复原始逻辑，不在这里减去工具栏高度
    this.settingView.frame = MNUtil.genFrame(-5, 55, width, height-65)

    // 配置驱动：为所有分区视图设置 frame
    let allSectionKeys = SectionRegistry.getOrderedKeys()
    let sectionFrame = MNUtil.genFrame(0, 0, width, height-65)

    allSectionKeys.forEach(key => {
      let viewName = key + "View"
      if (this[viewName]) {
        this[viewName].frame = sectionFrame
      }
    })

    let settingFrame = this.settingView.bounds
    settingFrame.x = 0
    settingFrame.y = 20
    settingFrame.height = 30
    settingFrame.width = settingFrame.width-45
    this.tabView.frame = settingFrame

    // 布局 tab 按钮（使用 ScrollView，支持自动滚动）
    // 根据当前视图模式决定显示哪些标签
    let tabX = 10;  // 添加分号，避免自动分号插入问题

    // 配置驱动：先隐藏所有标签按钮
    allSectionKeys.forEach(key => {
      let buttonName = key + "TabButton"
      if (this[buttonName]) {
        this[buttonName].hidden = true
      }
    })

    // 配置驱动：显示并布局当前模式的标签按钮
    let configs = SectionRegistry.getAllByMode(this.currentViewMode)

    configs.forEach(config => {
      let buttonName = config.key + "TabButton"
      let button = this[buttonName]

      if (button) {
        button.hidden = false
        button.frame = {x: tabX, y: 2, width: button.width, height: 26}
        tabX += button.width + UI_CONSTANTS.TAB_SPACING
      }
    })

    // 设置内容大小（超出 frame 时自动启用滚动）
    this.tabView.contentSize = {width: tabX + 10, height: 30}

    // 布局关闭按钮
    settingFrame.y = 20
    settingFrame.x = this.tabView.frame.width + 5
    settingFrame.width = 30
    this.closeButton.frame = settingFrame

    // 布局调整大小按钮
    // resizeButton 自身高度 30
    this.resizeButton.frame = {x: this.view.bounds.width - 30, y: this.view.bounds.height - 40, width: 30, height: 30}

    // 配置驱动：根据当前显示的视图布局子视图
    allSectionKeys.forEach(key => {
      let viewName = key + "View"
      if (this[viewName] && !this[viewName].hidden) {
        this.layoutSectionView(key)
      }
    })
  } catch (error) {
    pinnerUtils.addErrorLog(error, "settingViewLayout")
  }
}
pinnerController.prototype.refreshLayout = function () {
  // 刷新当前显示的分区视图
  // Pin 视图分区
  if (!this.focusView.hidden) {
    this.layoutSectionView("focus")
  }
  if (!this.midwayView.hidden) {
    this.layoutSectionView("midway")
  }
  if (!this.toOrganizeView.hidden) {
    this.layoutSectionView("toOrganize")
  }
  // Task 视图分区
  if (!this.taskTodayView.hidden) {
    this.layoutSectionView("taskToday")
  }
  if (!this.taskTomorrowView.hidden) {
    this.layoutSectionView("taskTomorrow")
  }
  if (!this.taskThisWeekView.hidden) {
    this.layoutSectionView("taskThisWeek")
  }
  if (!this.taskTodoView.hidden) {
    this.layoutSectionView("taskTodo")
  }
  if (!this.taskDailyTaskView.hidden) {
    this.layoutSectionView("taskDailyTask")
  }
}
/**
 * 创建单个分区的标签按钮（工厂方法）
 * @param {Object} config - 分区配置对象
 * @param {number} radius - 圆角半径
 * @param {boolean} isFirst - 是否为第一个按钮（默认选中）
 */
pinnerController.prototype.createSectionTabButton = function (config, radius, isFirst) {
  let buttonName = config.key + "TabButton"
  let viewName = config.key + "View"

  // 创建按钮
  this.createButton(buttonName, "genericTabTapped:", "tabView")
  let button = this[buttonName]

  // 存储元数据，用于统一响应方法
  button.sectionKey = config.key
  button.viewName = viewName

  // 设置样式
  button.layer.cornerRadius = radius
  button.isSelected = isFirst

  // 根据选中状态设置颜色
  let buttonColor = isFirst ? config.color : "#9bb2d6"

  // 构建按钮标题（包含 emoji 图标）
  let title = config.icon ? (config.icon + " " + config.displayName) : config.displayName

  MNButton.setConfig(button, {
    color: buttonColor,
    alpha: 0.9,
    opacity: 1.0,
    title: title,
    font: 17,
    bold: true
  })

  // 计算并设置宽度
  let size = button.sizeThatFits({width: 150, height: 100})
  button.width = size.width + 15
}

/**
 * 创建所有分区的标签按钮（配置驱动）
 */
pinnerController.prototype.createAllSectionTabs = function () {
  let radius = 10

  // 获取所有分区配置（按 order 排序）
  let pinConfigs = SectionRegistry.getAllByMode("pin")
  let taskConfigs = SectionRegistry.getAllByMode("task")
  let customConfigs = SectionRegistry.getAllByMode("custom")

  // 创建 Pin 视图的标签按钮
  pinConfigs.forEach((config, index) => {
    this.createSectionTabButton(config, radius, index === 0)
  })

  // 创建 Task 视图的标签按钮
  taskConfigs.forEach((config, index) => {
    this.createSectionTabButton(config, radius, false)
  })

  // 创建 Custom 视图的标签按钮
  customConfigs.forEach((config, index) => {
    this.createSectionTabButton(config, radius, false)
  })
}

/**
 * 创建所有分区的视图容器（配置驱动）
 */
pinnerController.prototype.createAllSectionViewContainers = function () {
  // 获取所有分区配置
  let allConfigs = [
    ...SectionRegistry.getAllByMode("pin"),
    ...SectionRegistry.getAllByMode("task"),
    ...SectionRegistry.getAllByMode("custom")
  ]

  // 创建每个分区的视图容器
  allConfigs.forEach((config, index) => {
    let viewName = config.key + "View"
    this.createView(viewName, "settingView", "#9bb2d6", 0)
    this[viewName].hidden = (index !== 0)  // 第一个视图默认显示，其他隐藏
  })
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

    // === 使用配置驱动创建所有标签按钮 ===
    this.createAllSectionTabs()

    // === 使用配置驱动创建所有视图容器 ===
    this.createAllSectionViewContainers()

    // === 为每个分区创建子视图 ===
    this.createSectionViews()

    // 初始化当前分区和视图模式
    this.currentSection = "focus"
    this.currentViewMode = "pin"  // 默认 Pin 视图模式

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

/**
 * 创建底部工具栏按钮
 */
pinnerController.prototype.createToolbarButtons = function() {
  try {
    let buttonHeight = 28
    let buttonX = 5

    // ========== 左侧可滚动按钮区域 ==========

    // 1. 视图模式切换按钮（保留）
    this.createButton("viewModeButton", "changeViewMode:", "toolbarScrollView")
    this.viewModeButton.frame = {x: buttonX, y: 0, width: 70, height: buttonHeight}
    MNButton.setConfig(this.viewModeButton, {
      color: "#457bd3", alpha: 0.8, opacity: 1.0, title: "📌 视图", radius: 6, font: 14
    })
    buttonX += 75

    // 2. 清空按钮（新增）
    this.createButton("toolbarClearButton", "clearCards:", "toolbarScrollView")
    this.toolbarClearButton.frame = {x: buttonX, y: 0, width: 70, height: buttonHeight}
    MNButton.setConfig(this.toolbarClearButton, {
      color: "#e06c75", alpha: 0.8, opacity: 1.0, title: "🗑 清空", radius: 6, font: 14
    })
    buttonX += 75

    // 3. Pin 卡片按钮（新增）
    this.createButton("toolbarPinCardButton", "pinCurrentCard:", "toolbarScrollView")
    this.toolbarPinCardButton.frame = {x: buttonX, y: 0, width: 95, height: buttonHeight}
    MNButton.setConfig(this.toolbarPinCardButton, {
      color: "#457bd3", alpha: 0.8, opacity: 1.0, title: "📌 Pin 卡片", radius: 6, font: 14
    })
    buttonX += 100

    // 4. Pin 页面按钮（新增）
    this.createButton("toolbarPinPageButton", "pinCurrentPageToSection:", "toolbarScrollView")
    this.toolbarPinPageButton.frame = {x: buttonX, y: 0, width: 95, height: buttonHeight}
    MNButton.setConfig(this.toolbarPinPageButton, {
      color: "#61afef", alpha: 0.8, opacity: 1.0, title: "📄 Pin 页面", radius: 6, font: 14
    })
    buttonX += 100

    // 4.5. Pin 剪贴板按钮（新增）
    this.createButton("toolbarPinClipboardButton", "pinCurrentClipboard:", "toolbarScrollView")
    this.toolbarPinClipboardButton.frame = {x: buttonX, y: 0, width: 110, height: buttonHeight}
    MNButton.setConfig(this.toolbarPinClipboardButton, {
      color: "#98c379", alpha: 0.8, opacity: 1.0, title: "📋 Pin 剪贴板", radius: 6, font: 14
    })
    buttonX += 115

    // 5. Add 按钮（新增）
    this.createButton("toolbarAddButton", "createBlankCard:", "toolbarScrollView")
    this.toolbarAddButton.frame = {x: buttonX, y: 0, width: 95, height: buttonHeight}
    MNButton.setConfig(this.toolbarAddButton, {
      color: "#61afef", alpha: 0.8, opacity: 1.0, title: "➕ Add", radius: 6, font: 14
    })
    buttonX += 100

    // 6. 导出 URL 按钮（新增）
    this.createButton("toolbarExportURLButton", "exportSelectedCardsAsURL:", "toolbarScrollView")
    this.toolbarExportURLButton.frame = {x: buttonX, y: 0, width: 95, height: buttonHeight}
    this.toolbarExportURLButton.enabled = false  // 初始禁用
    MNButton.setConfig(this.toolbarExportURLButton, {
      color: "#98c379", alpha: 0.8, opacity: 1.0, title: "🔗 导出", radius: 6, font: 14
    })
    buttonX += 100

    // 7. 导出 Markdown 按钮（新增）
    this.createButton("toolbarExportMarkdownButton", "exportSelectedCardsAsMarkdown:", "toolbarScrollView")
    this.toolbarExportMarkdownButton.frame = {x: buttonX, y: 0, width: 95, height: buttonHeight}
    this.toolbarExportMarkdownButton.enabled = false  // 初始禁用
    MNButton.setConfig(this.toolbarExportMarkdownButton, {
      color: "#98c379", alpha: 0.8, opacity: 1.0, title: "📝 导出", radius: 6, font: 14
    })
    buttonX += 100

    // 设置滚动视图的内容大小（支持水平滚动）
    this.toolbarScrollView.contentSize = {width: buttonX + 10, height: buttonHeight}

    pinnerUtils.log("✅ 工具栏按钮创建完成，总宽度: " + buttonX, "createToolbarButtons")
  } catch (error) {
    pinnerUtils.addErrorLog(error, "createToolbarButtons")
    MNUtil.showHUD("❌ 工具栏创建失败: " + error)
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
/**
 * 切换到目标视图（配置驱动）
 * @param {string} targetView - 目标视图名称（如 "focusView"）
 */
pinnerController.prototype.switchView = function (targetView) {
  try {
    // 根据当前视图模式选择对应的视图和按钮列表
    let allViews, allButtons, sectionMap

    // 配置驱动：从 SectionRegistry 获取当前模式的所有分区
    let configs = SectionRegistry.getAllByMode(this.currentViewMode)

    allViews = configs.map(c => c.key + "View")
    allButtons = configs.map(c => c.key + "TabButton")

    // 构建 viewName → sectionKey 的映射
    sectionMap = {}
    configs.forEach(c => {
      sectionMap[c.key + "View"] = c.key
    })

    // 切换视图和按钮状态
    allViews.forEach((viewName, index) => {
      let isTargetView = viewName === targetView

      // 切换视图显示/隐藏
      if (this[viewName]) {
        this[viewName].hidden = !isTargetView
      }

      // 切换按钮选中状态和颜色
      let buttonName = allButtons[index]
      if (this[buttonName]) {
        this[buttonName].isSelected = isTargetView

        // 获取按钮的配置颜色（如果是配置的分区）
        let sectionKey = sectionMap[viewName]
        let config = SectionRegistry.getConfig(sectionKey)
        let selectedColor = config ? config.color : "#457bd3"

        this[buttonName].backgroundColor = MNUtil.hexColorAlpha(
          isTargetView ? selectedColor : "#9bb2d6",
          0.8
        )
      }
    })

    // 更新当前分区
    this.currentSection = sectionMap[targetView]

    // ✅ 新增：更新工具栏按钮状态
    this.updateToolbarButtonsForSection(this.currentSection)

    // 先布局再刷新,确保子视图 frame 正确
    if (this.currentSection) {
      this.layoutSectionView(this.currentSection)
    }
    this.refreshView(targetView)
  } catch (error) {
    pinnerUtils.addErrorLog(error, "switchView")
  }
}

/**
 * 刷新视图内容（配置驱动）
 * @param {string} targetView - 视图名称（如 "focusView"）
 */
pinnerController.prototype.refreshView = function (targetView) {
  try {
    // 从视图名称提取分区键（移除 "View" 后缀）
    let sectionKey = targetView.replace(/View$/, '')

    // 检查是否为有效的分区
    if (SectionRegistry.has(sectionKey)) {
      MNUtil.log(`refresh ${targetView}`)
      this.refreshSectionCards(sectionKey)
    } else {
      // 不是标准分区
      pinnerUtils.log(`refreshView: ${targetView} 不需要刷新或不存在`, "refreshView")
    }
  } catch (error) {
    pinnerUtils.addErrorLog(error, "refreshView")
  }
}

/**
 * 切换视图模式（Pin ↔ Task ↔ Custom）（配置驱动）
 * @param {string} targetMode - 目标模式："pin" | "task" | "custom"
 */
pinnerController.prototype.switchViewMode = function (targetMode) {
  try {
    if (this.currentViewMode === targetMode) {
      return  // 已经是目标模式，无需切换
    }

    // 隐藏当前模式的所有视图和按钮
    let currentViews, currentButtons

    if (this.currentViewMode === "pin" || this.currentViewMode === "task") {
      // 从 SectionRegistry 获取当前模式的所有分区
      let currentConfigs = SectionRegistry.getAllByMode(this.currentViewMode)
      currentViews = currentConfigs.map(c => c.key + "View")
      currentButtons = currentConfigs.map(c => c.key + "TabButton")
    } else if (this.currentViewMode === "custom") {
      let currentConfigs = SectionRegistry.getAllByMode("custom")
      currentViews = currentConfigs.map(c => c.key + "View")
      currentButtons = currentConfigs.map(c => c.key + "TabButton")
    }

    // 隐藏当前模式的所有视图和按钮
    if (currentViews && currentButtons) {
      currentViews.forEach(viewName => {
        if (this[viewName]) {
          this[viewName].hidden = true
        }
      })
      currentButtons.forEach(buttonName => {
        if (this[buttonName]) {
          this[buttonName].isSelected = false
          this[buttonName].hidden = true  // 隐藏旧视图的按钮
        }
      })
    }

    // 切换到目标模式
    this.currentViewMode = targetMode

    // 显示目标模式的默认视图
    let targetView
    if (targetMode === "pin") {
      // Pin 模式默认显示第一个分区
      let firstConfig = SectionRegistry.getAllByMode("pin")[0]
      targetView = firstConfig ? firstConfig.key + "View" : "focusView"
    } else if (targetMode === "task") {
      // Task 模式默认显示第一个分区
      let firstConfig = SectionRegistry.getAllByMode("task")[0]
      targetView = firstConfig ? firstConfig.key + "View" : "taskTodayView"
    } else if (targetMode === "custom") {
      // Custom 模式默认显示第一个分区
      let firstConfig = SectionRegistry.getAllByMode("custom")[0]
      targetView = firstConfig ? firstConfig.key + "View" : "custom1View"
    }

    // 切换到目标视图
    this.switchView(targetView)

    // 重新布局（因为标签按钮会改变）
    this.settingViewLayout()

    let modeText = targetMode === "pin" ? "Pin 视图" : (targetMode === "task" ? "Task 视图" : "自定义视图")
    // MNUtil.showHUD(`切换到 ${modeText}`)
  } catch (error) {
    pinnerUtils.addErrorLog(error, "switchViewMode")
    MNUtil.showHUD("切换视图失败")
  }
}

/**
 * 创建各分区的子视图（配置驱动）
 */
pinnerController.prototype.createSectionViews = function() {
  // 从 SectionRegistry 获取所有分区键名
  let allSectionKeys = SectionRegistry.getOrderedKeys()

  // 为每个分区创建卡片滚动视图
  allSectionKeys.forEach(section => {
    let viewName = section + "View"

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
    MNLog.log(`=== refreshSectionCards(${section}) 开始刷新 ===`)
    MNLog.log(`共有 ${cards.length} 个 pins`)

    // 清空现有卡片
    MNLog.log(`清空 ${this[cardRowsKey].length} 个旧视图`)
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

    // 添加卡片行（支持混合渲染 Card 和 Page）
    let yOffset = 10
    let scrollWidth = scrollView.frame.width

    cards.forEach((pin, index) => {
      let row
      // 根据 type 字段选择渲染方法
      if (pin.type === "page") {
        row = this.createPageRow(pin, index, scrollWidth - 20, section, cards.length)
      } else if (pin.type === "clipboard") {
        // 剪贴板文本类型
        row = this.createClipboardRow(pin, index, scrollWidth - 20, section)
      } else {
        // type === "card" 或没有 type 字段（兼容旧数据，默认为 card）
        row = this.createCardRow(pin, index, scrollWidth - 20, section)
      }
      scrollView.addSubview(row)
      this[cardRowsKey].push(row)
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

  if (!this[scrollViewKey]) return

  let frame = view.bounds
  let width = frame.width
  let height = frame.height

  // 设置卡片滚动视图（从顶部开始，因为按钮已移到工具栏）
  this[scrollViewKey].frame = {x: 10, y: 10, width: width - 50, height: height - 25}
}



/**
 * 创建单个卡片行视图（新版本，支持多选）
 */
pinnerController.prototype.createCardRow = function(card, index, width, section) {
  // 创建卡片行容器
  let rowView = UIView.new()
  rowView.frame = {x: 10, y: 10 + index * UI_CONSTANTS.CARD_ROW_HEIGHT, width: width, height: 45}
  rowView.backgroundColor = MNUtil.hexColorAlpha("#ffffff", 0.95)
  rowView.layer.cornerRadius = 8
  rowView.layer.borderWidth = 1
  rowView.layer.borderColor = MNUtil.hexColorAlpha("#9bb2d6", 0.3)

  // ✅ 只保存 tag（索引）和 section，避免自定义属性被 GC 清除
  // tag 是 iOS 原生属性，不会丢失
  rowView.tag = index
  rowView.section = section

  // 获取卡片总数，用于判断是否禁用按钮
  let totalCards = pinnerConfig.getPins(section).length

  // ========== 左侧勾选框（新增） ==========
  let checkboxButton = UIButton.buttonWithType(0)
  let key = section + "-" + card.noteId
  let isSelected = this.selectedCards.has(key)
  checkboxButton.setTitleForState(isSelected ? "☑️" : "☐", 0)
  checkboxButton.frame = {x: 5, y: 7, width: 32, height: 30}
  checkboxButton.titleLabel.font = UIFont.systemFontOfSize(18)
  checkboxButton.backgroundColor = UIColor.clearColor()
  checkboxButton.setTitleColorForState(UIColor.blackColor(), 0)       // 正常状态
  checkboxButton.setTitleColorForState(this.highlightColor, 1)    // 高亮状态
  checkboxButton.tag = index
  checkboxButton.section = section
  checkboxButton.addTargetActionForControlEvents(this, "toggleCardSelection:", 1 << 6)
  rowView.addSubview(checkboxButton)

  // 上移按钮（右移 40px）
  let moveUpButton = UIButton.buttonWithType(0)
  moveUpButton.setTitleForState("⬆️", 0)
  moveUpButton.frame = {x: 45, y: 7, width: 30, height: 30}
  moveUpButton.layer.cornerRadius = 5
  moveUpButton.tag = index  // ✅ 只保存索引
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

  // 下移按钮（右移 40px）
  let moveDownButton = UIButton.buttonWithType(0)
  moveDownButton.setTitleForState("⬇️", 0)
  moveDownButton.frame = {x: 80, y: 7, width: 30, height: 30}
  moveDownButton.layer.cornerRadius = 5
  moveDownButton.tag = index  // ✅ 只保存索引
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

  // 定位按钮（右移 40px）
  let focusButton = UIButton.buttonWithType(0)
  focusButton.setTitleForState("📍", 0)
  focusButton.frame = {x: 115, y: 7, width: UI_CONSTANTS.BUTTON_HEIGHT, height: UI_CONSTANTS.BUTTON_HEIGHT}
  focusButton.backgroundColor = MNUtil.hexColorAlpha("#457bd3", 0.8)
  focusButton.layer.cornerRadius = 5
  focusButton.tag = index  // ✅ 只保存索引，点击时通过索引回溯数据
  focusButton.section = section
  focusButton.addTargetActionForControlEvents(this, "focusCardTapped:", 1 << 6)
  // ✅ 添加长按手势 - 在浮窗显示卡片
  MNButton.addLongPressGesture(focusButton, this, "onLongPressFocusButton:", 0.4)
  rowView.addSubview(focusButton)

  // 添加标题（右移 40px）
  let titleButton = UIButton.buttonWithType(0)
  titleButton.setTitleForState(`💳 ${card.title || "未命名卡片"}`, 0)
  titleButton.titleLabel.font = UIFont.systemFontOfSize(15)
  titleButton.frame = {x: 150, y: 5, width: width - 200, height: 35}
  titleButton.addTargetActionForControlEvents(this, "cardTapped:", 1 << 6)
  titleButton.tag = index  // ✅ 只保存索引
  titleButton.section = section
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
  deleteButton.tag = index  // ✅ 只保存索引
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
    MNLog.log(`=== refreshPageCards 开始刷新 ===`)
    MNLog.log(`共有 ${pages.length} 个页面`)

    // 清空现有卡片
    MNLog.log(`清空 ${this[cardRowsKey].length} 个旧视图`)
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
      let pageRow = this.createPageRow(page, index, scrollWidth - 20, "pages", pages.length)  // ✅ 传入 section 和 totalCount 参数
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
pinnerController.prototype.createPageRow = function(page, index, width, section = "pages", totalCount) {
  // 创建页面行容器
  let rowView = UIView.new()
  rowView.frame = {x: 10, y: 10 + index * UI_CONSTANTS.PAGE_ROW_HEIGHT, width: width, height: 45}
  rowView.backgroundColor = MNUtil.hexColorAlpha("#ffffff", 0.95)
  rowView.layer.cornerRadius = 8
  rowView.layer.borderWidth = 1
  rowView.layer.borderColor = MNUtil.hexColorAlpha("#9bb2d6", 0.3)

  // ✅ 只保存 tag（索引）和 section，避免自定义属性被 GC 清除
  rowView.tag = index
  rowView.section = section

  // 获取总数：如果传入了 totalCount 使用它，否则根据 section 获取
  let total = totalCount !== undefined ? totalCount : pinnerConfig.getPins(section).length
  // MNLog.log(`createPageRow: index=${index}, section=${section}, totalCount传入=${totalCount}, 实际total=${total}`)
  // MNLog.log(`  创建的是: docMd5=${page.docMd5.substring(0,8)}, pageIndex=${page.pageIndex}`)

  // 上移按钮
  let moveUpButton = UIButton.buttonWithType(0)
  moveUpButton.setTitleForState("⬆️", 0)
  moveUpButton.frame = {x: 5, y: 7, width: 30, height: 30}
  moveUpButton.layer.cornerRadius = 5
  moveUpButton.tag = index  // ✅ 只保存索引
  moveUpButton.section = section
  moveUpButton.addTargetActionForControlEvents(this, "movePageUp:", 1 << 6)

  // 验证按钮属性
  // MNLog.log(`创建上移按钮: tag=${moveUpButton.tag}, section=${moveUpButton.section}`)

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
  moveDownButton.tag = index  // ✅ 只保存索引
  moveDownButton.section = section
  moveDownButton.addTargetActionForControlEvents(this, "movePageDown:", 1 << 6)

  // 验证按钮属性
  // MNLog.log(`创建下移按钮: tag=${moveDownButton.tag}, section=${moveDownButton.section}`)
  if (index === total - 1) {
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
  focusButton.tag = index  // ✅ 只保存索引
  focusButton.section = section
  focusButton.addTargetActionForControlEvents(this, "focusCardTapped:", 1 << 6)  // ✅ 统一使用 focusCardTapped
  // ✅ 添加长按手势 - 页面长按也跳转到页面（与短按相同）
  MNButton.addLongPressGesture(focusButton, this, "onLongPressFocusButton:", 0.5)
  rowView.addSubview(focusButton)

  // 添加标题
  let titleButton = UIButton.buttonWithType(0)
  titleButton.setTitleForState(`📄 ${page.title || "未命名页面"}`, 0)
  titleButton.titleLabel.font = UIFont.systemFontOfSize(15)
  titleButton.frame = {x: 110, y: 5, width: width - 160, height: 35}
  titleButton.tag = index  // ✅ 只保存索引
  titleButton.section = section
  titleButton.addTargetActionForControlEvents(this, "pageItemTapped:", 1 << 6)
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
  deleteButton.tag = index  // ✅ 只保存索引
  deleteButton.section = section
  deleteButton.addTargetActionForControlEvents(this, "deleteCard:", 1 << 6)  // ✅ 统一使用 deleteCard
  rowView.addSubview(deleteButton)

  return rowView
}

/**
 * 创建剪贴板文本 Pin 的行视图
 * @param {Object} clipboard - 剪贴板 Pin 对象
 * @param {Number} index - 索引
 * @param {Number} width - 宽度
 * @param {String} section - 分区
 * @returns {UIView} 行视图
 */
pinnerController.prototype.createClipboardRow = function(clipboard, index, width, section) {
    const UI_CONSTANTS = {
      ROW_HEIGHT: 50,  // 剪贴板行高度（比 Card 稍高，因为按钮更多）
      BUTTON_SIZE: 30,
      BUTTON_SPACING: 35
    }
    
    // 创建行容器
    let rowView = UIView.new()
    rowView.frame = {
      x: 10,
      y: 10 + index * UI_CONSTANTS.ROW_HEIGHT,
      width: width,
      height: 45
    }
    rowView.backgroundColor = MNUtil.hexColorAlpha("#ffffff", 0.95)
    rowView.layer.cornerRadius = 8
    rowView.layer.borderWidth = 1
    rowView.layer.borderColor = MNUtil.hexColorAlpha("#9bb2d6", 0.3)
    
    rowView.tag = index
    rowView.section = section
    
    let xOffset = 5
    
    // 1. 上移按钮
    let moveUpButton = UIButton.buttonWithType(0)
    moveUpButton.setTitleForState("⬆️", 0)
    moveUpButton.frame = {x: xOffset, y: 7, width: UI_CONSTANTS.BUTTON_SIZE, height: UI_CONSTANTS.BUTTON_SIZE}
    moveUpButton.layer.cornerRadius = 5
    moveUpButton.tag = index
    moveUpButton.section = section
    moveUpButton.addTargetActionForControlEvents(this, "moveCardUp:", 1 << 6)
    if (index === 0) {
      moveUpButton.enabled = false
      moveUpButton.backgroundColor = MNUtil.hexColorAlpha("#cccccc", 0.5)
    } else {
      moveUpButton.backgroundColor = MNUtil.hexColorAlpha("#457bd3", 0.8)
    }
    rowView.addSubview(moveUpButton)
    xOffset += UI_CONSTANTS.BUTTON_SPACING
    
    // 2. 下移按钮
    let moveDownButton = UIButton.buttonWithType(0)
    moveDownButton.setTitleForState("⬇️", 0)
    moveDownButton.frame = {x: xOffset, y: 7, width: UI_CONSTANTS.BUTTON_SIZE, height: UI_CONSTANTS.BUTTON_SIZE}
    moveDownButton.layer.cornerRadius = 5
    moveDownButton.tag = index
    moveDownButton.section = section
    moveDownButton.addTargetActionForControlEvents(this, "moveCardDown:", 1 << 6)
    let totalCards = pinnerConfig.getPins(section).length
    if (index === totalCards - 1) {
      moveDownButton.enabled = false
      moveDownButton.backgroundColor = MNUtil.hexColorAlpha("#cccccc", 0.5)
    } else {
      moveDownButton.backgroundColor = MNUtil.hexColorAlpha("#457bd3", 0.8)
    }
    rowView.addSubview(moveDownButton)
    xOffset += UI_CONSTANTS.BUTTON_SPACING
    
    // 3. 复制按钮
    let copyButton = UIButton.buttonWithType(0)
    copyButton.setTitleForState("📋", 0)
    copyButton.frame = {x: xOffset, y: 7, width: UI_CONSTANTS.BUTTON_SIZE, height: UI_CONSTANTS.BUTTON_SIZE}
    copyButton.backgroundColor = MNUtil.hexColorAlpha("#61afef", 0.8)
    copyButton.layer.cornerRadius = 5
    copyButton.tag = index
    copyButton.section = section
    copyButton.addTargetActionForControlEvents(this, "copyClipboardText:", 1 << 6)
    rowView.addSubview(copyButton)
    xOffset += UI_CONSTANTS.BUTTON_SPACING
    
    // 4. 预览按钮
    let previewButton = UIButton.buttonWithType(0)
    previewButton.setTitleForState("👁", 0)
    previewButton.frame = {x: xOffset, y: 7, width: UI_CONSTANTS.BUTTON_SIZE, height: UI_CONSTANTS.BUTTON_SIZE}
    previewButton.backgroundColor = MNUtil.hexColorAlpha("#98c379", 0.8)
    previewButton.layer.cornerRadius = 5
    previewButton.tag = index
    previewButton.section = section
    previewButton.addTargetActionForControlEvents(this, "previewClipboardText:", 1 << 6)
    rowView.addSubview(previewButton)
    xOffset += UI_CONSTANTS.BUTTON_SPACING
    
    // 5. 编辑按钮
    let editButton = UIButton.buttonWithType(0)
    editButton.setTitleForState("✏️", 0)
    editButton.frame = {x: xOffset, y: 7, width: UI_CONSTANTS.BUTTON_SIZE, height: UI_CONSTANTS.BUTTON_SIZE}
    editButton.backgroundColor = MNUtil.hexColorAlpha("#e5c07b", 0.8)
    editButton.layer.cornerRadius = 5
    editButton.tag = index
    editButton.section = section
    editButton.addTargetActionForControlEvents(this, "editClipboardText:", 1 << 6)
    rowView.addSubview(editButton)
    xOffset += UI_CONSTANTS.BUTTON_SPACING + 5
    
    // 6. 标题按钮（显示标题，点击弹出菜单）
    let titleButton = UIButton.buttonWithType(0)
    titleButton.setTitleForState(`📝 ${clipboard.title || "未命名文本"}`, 0)
    titleButton.titleLabel.font = UIFont.systemFontOfSize(15)
    titleButton.frame = {x: xOffset, y: 5, width: width - xOffset - 50, height: 35}
    titleButton.tag = index
    titleButton.section = section
    titleButton.addTargetActionForControlEvents(this, "clipboardItemTapped:", 1 << 6)
    titleButton.setTitleColorForState(MNUtil.hexColorAlpha("#007AFF", 1.0), 0)
    titleButton.setTitleColorForState(MNUtil.hexColorAlpha("#0051D5", 1.0), 1)
    titleButton.contentHorizontalAlignment = 1  // 左对齐
    rowView.addSubview(titleButton)
    
    // 7. 删除按钮
    let deleteButton = UIButton.buttonWithType(0)
    deleteButton.setTitleForState("🗑", 0)
    deleteButton.frame = {x: width - 40, y: 7, width: UI_CONSTANTS.BUTTON_SIZE, height: UI_CONSTANTS.BUTTON_SIZE}
    deleteButton.backgroundColor = MNUtil.hexColorAlpha("#e06c75", 0.8)
    deleteButton.layer.cornerRadius = 5
    deleteButton.tag = index
    deleteButton.section = section
    deleteButton.addTargetActionForControlEvents(this, "deleteCard:", 1 << 6)
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
 * 根据当前分区更新工具栏按钮状态
 * @param {string} section - 当前分区键名
 */
pinnerController.prototype.updateToolbarButtonsForSection = function(section) {
  try {
    if (!section) return

    // 1. 更新 Add 按钮可见性（pages 分区隐藏）
    if (this.toolbarAddButton) {
      this.toolbarAddButton.hidden = (section === "pages")
    }

    // 2. 更新导出按钮状态（从选择状态获取计数）
    let selectedCount = this.getSelectedCount()

    if (this.toolbarExportURLButton) {
      this.toolbarExportURLButton.enabled = selectedCount > 0
      let title = selectedCount > 0 ? `🔗 导出 (${selectedCount})` : "🔗 导出"
      this.toolbarExportURLButton.setTitleForState(title, 0)
    }

    if (this.toolbarExportMarkdownButton) {
      this.toolbarExportMarkdownButton.enabled = selectedCount > 0
      let title = selectedCount > 0 ? `📝 导出 (${selectedCount})` : "📝 导出"
      this.toolbarExportMarkdownButton.setTitleForState(title, 0)
    }

    pinnerUtils.log(`工具栏按钮已更新（分区：${section}）`, "updateToolbarButtonsForSection")
  } catch (error) {
    pinnerUtils.addErrorLog(error, "updateToolbarButtonsForSection")
  }
}

/**
 * 创建设置窗口（嵌入式，参考 mneditor 架构）
 */
pinnerController.prototype.createPreferencesView = function() {
  try {
    // 1. 创建设置视图容器（半透明白色背景，覆盖主视图）
    this.preferencesView = UIView.new()
    this.preferencesView.backgroundColor = UIColor.whiteColor().colorWithAlphaComponent(0.9)
    this.preferencesView.layer.cornerRadius = 13
    this.preferencesView.hidden = true  // 默认隐藏
    this.view.addSubview(this.preferencesView)

    // 2. 创建标签栏背景
    this.preferencesTabView = UIView.new()
    this.preferencesTabView.backgroundColor = MNUtil.hexColorAlpha("#9bb2d6", 0.8)
    this.preferencesTabView.layer.cornerRadius = 10
    this.preferencesView.addSubview(this.preferencesTabView)

    // 3. 创建内容区域
    this.preferencesContentView = UIView.new()
    this.preferencesContentView.backgroundColor = UIColor.clearColor()
    this.preferencesView.addSubview(this.preferencesContentView)

    // 4. 创建标签按钮（简化版，只有一个"常规"标签）
    this.createButton("generalTabButton", null, "preferencesTabView")
    MNButton.setConfig(this.generalTabButton, {
      color: "#457bd3",
      alpha: 0.8,
      opacity: 1.0,
      title: "⚙️ 常规",
      font: 17,
      bold: true
    })
    this.generalTabButton.enabled = false  // 不可点击（只有一个标签）

    // 5. 创建关闭按钮
    this.createButton("closePreferencesButton", "closePreferencesView:", "preferencesTabView")
    MNButton.setConfig(this.closePreferencesButton, {
      color: "#e06c75",
      alpha: 0.8,
      opacity: 1.0,
      title: "✕",
      font: 18,
      bold: true
    })

    // 6. 创建设置项按钮
    let yOffset = 20  // 起始 Y 坐标
    let buttonHeight = 40
    let buttonSpacing = 15

    // 启动视图设置（记住上次 vs 固定默认）
    this.createButton("startupViewModeButton", "changeStartupViewMode:", "preferencesContentView")
    let rememberLast = pinnerConfig.settings.rememberLastView !== false  // 默认 true
    MNButton.setConfig(this.startupViewModeButton, {
      color: "#e06c75",
      alpha: 0.8,
      opacity: 1.0,
      title: rememberLast ? "启动: 记住上次视图 ✅" : "启动: 固定默认视图 📌",
      font: 15
    })

    // 默认视图模式（仅在固定模式下显示）
    this.createButton("defaultViewModeButton", "changeDefaultViewMode:", "preferencesContentView")
    let currentViewMode = pinnerConfig.settings.defaultViewMode || "pin"
    let viewModeText = currentViewMode === "pin" ? "Pin 视图" : (currentViewMode === "task" ? "Task 视图" : "自定义视图")
    MNButton.setConfig(this.defaultViewModeButton, {
      color: "#457bd3",
      alpha: 0.8,
      opacity: 1.0,
      title: `默认视图: ${viewModeText}`,
      font: 15
    })
    this.defaultViewModeButton.hidden = rememberLast  // 记住模式时隐藏

    // 默认分区（仅在固定模式下显示）
    this.createButton("defaultSectionButton", "changeDefaultSection:", "preferencesContentView")
    let currentSection = pinnerConfig.settings.defaultSection || "focus"
    let sectionText = pinnerConfig.getSectionDisplayName(currentSection)
    MNButton.setConfig(this.defaultSectionButton, {
      color: "#61afef",
      alpha: 0.8,
      opacity: 1.0,
      title: `默认分区: ${sectionText}`,
      font: 15
    })
    this.defaultSectionButton.hidden = rememberLast  // 记住模式时隐藏

    // 卡片标题询问开关
    this.createButton("alwaysAskCardTitleButton", "toggleAlwaysAskCardTitle:", "preferencesContentView")
    let askCardTitle = pinnerConfig.settings.alwaysAskCardTitle || false
    MNButton.setConfig(this.alwaysAskCardTitleButton, {
      color: "#98c379",
      alpha: 0.8,
      opacity: 1.0,
      title: `Pin 卡片时询问标题: ${askCardTitle ? "✅" : "❌"}`,
      font: 15
    })

    // 页面标题询问开关
    this.createButton("alwaysAskPageTitleButton", "toggleAlwaysAskPageTitle:", "preferencesContentView")
    let askPageTitle = pinnerConfig.settings.alwaysAskPageTitle || false
    MNButton.setConfig(this.alwaysAskPageTitleButton, {
      color: "#c678dd",
      alpha: 0.8,
      opacity: 1.0,
      title: `Pin 页面时询问标题: ${askPageTitle ? "✅" : "❌"}`,
      font: 15
    })

    // 剪贴板标题询问开关
    this.createButton("alwaysAskClipboardTitleButton", "toggleAlwaysAskClipboardTitle:", "preferencesContentView")
    let askClipboardTitle = pinnerConfig.settings.alwaysAskClipboardTitle || false
    MNButton.setConfig(this.alwaysAskClipboardTitleButton, {
      color: "#56b6c2",
      alpha: 0.8,
      opacity: 1.0,
      title: `Pin 剪贴板时询问标题: ${askClipboardTitle ? "✅" : "❌"}`,
      font: 15
    })

    pinnerUtils.log("设置窗口创建完成", "createPreferencesView")
  } catch (error) {
    pinnerUtils.addErrorLog(error, "createPreferencesView")
  }
}

/**
 * 布局设置窗口
 */
pinnerController.prototype.preferencesViewLayout = function() {
  try {
    if (!this.preferencesView) return

    let viewFrame = this.view.bounds
    let width = viewFrame.width
    let height = viewFrame.height

    // 设置视图覆盖整个主视图（留边距）
    this.preferencesView.frame = {x: 1, y: 20, width: width - 2, height: height - 50}

    // 标签栏布局（顶部）
    this.preferencesTabView.frame = {x: 10, y: 10, width: width - 22, height: 35}

    // 标签按钮布局
    if (this.generalTabButton) {
      this.generalTabButton.frame = {x: 5, y: 2, width: 100, height: 30}
    }

    // 关闭按钮布局（右侧）
    if (this.closePreferencesButton) {
      this.closePreferencesButton.frame = {x: width - 50, y: 2, width: 35, height: 30}
    }

    // 内容区域布局
    this.preferencesContentView.frame = {x: 10, y: 55, width: width - 22, height: height - 95}

    // 设置项按钮布局（自动跳过 hidden 的按钮）
    let yOffset = 20
    let buttonHeight = 40
    let buttonSpacing = 15
    let buttonWidth = width - 42

    // 启动视图设置
    if (this.startupViewModeButton) {
      this.startupViewModeButton.frame = {x: 10, y: yOffset, width: buttonWidth, height: buttonHeight}
      yOffset += buttonHeight + buttonSpacing
    }

    // 默认视图模式（可能隐藏）
    if (this.defaultViewModeButton && !this.defaultViewModeButton.hidden) {
      this.defaultViewModeButton.frame = {x: 10, y: yOffset, width: buttonWidth, height: buttonHeight}
      yOffset += buttonHeight + buttonSpacing
    }

    // 默认分区（可能隐藏）
    if (this.defaultSectionButton && !this.defaultSectionButton.hidden) {
      this.defaultSectionButton.frame = {x: 10, y: yOffset, width: buttonWidth, height: buttonHeight}
      yOffset += buttonHeight + buttonSpacing
    }

    // 卡片标题询问开关
    if (this.alwaysAskCardTitleButton) {
      this.alwaysAskCardTitleButton.frame = {x: 10, y: yOffset, width: buttonWidth, height: buttonHeight}
      yOffset += buttonHeight + buttonSpacing
    }

    // 页面标题询问开关
    if (this.alwaysAskPageTitleButton) {
      this.alwaysAskPageTitleButton.frame = {x: 10, y: yOffset, width: buttonWidth, height: buttonHeight}
      yOffset += buttonHeight + buttonSpacing
    }

    // 剪贴板标题询问开关
    if (this.alwaysAskClipboardTitleButton) {
      this.alwaysAskClipboardTitleButton.frame = {x: 10, y: yOffset, width: buttonWidth, height: buttonHeight}
      yOffset += buttonHeight + buttonSpacing
    }

  } catch (error) {
    pinnerUtils.addErrorLog(error, "preferencesViewLayout")
  }
}

/**
 * 关闭设置窗口（带淡出动画）
 */
pinnerController.prototype.closePreferencesView = function() {
  try {
    if (!this.preferencesView) return

    let preOpacity = this.preferencesView.layer.opacity
    UIView.animateWithDurationAnimationsCompletion(0.2, () => {
      this.preferencesView.layer.opacity = 0  // 淡出动画
    }, () => {
      this.preferencesView.layer.opacity = preOpacity
      this.preferencesView.hidden = true  // 隐藏
    })
  } catch (error) {
    pinnerUtils.addErrorLog(error, "closePreferencesView")
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

/**
 * 重新创建所有分区标签按钮（用于配置更新后的 UI 刷新）
 *
 * 使用场景：
 * - 导入配置后更新 UI
 * - 用户修改分区配置（名称、颜色、图标、顺序）后刷新
 *
 * 工作流程：
 * 1. 删除所有旧的标签按钮（从 superview 移除并清空引用）
 * 2. 从 SectionRegistry 读取最新配置
 * 3. 调用 createAllSectionTabs() 重新创建按钮
 */
pinnerController.prototype.recreateSectionTabs = function() {
  try {
    // 1. 删除旧的标签按钮
    let allConfigs = [
      ...SectionRegistry.getAllByMode("pin"),
      ...SectionRegistry.getAllByMode("task"),
      ...SectionRegistry.getAllByMode("custom")
    ]

    allConfigs.forEach(config => {
      let buttonName = config.key + "TabButton"
      if (this[buttonName]) {
        // 从父视图移除
        this[buttonName].removeFromSuperview()
        // 清空引用（释放内存）
        this[buttonName] = null
      }
    })

    // 2. 重新创建标签按钮（复用现有逻辑）
    this.createAllSectionTabs()

    pinnerUtils.log("标签按钮已重新创建", "recreateSectionTabs")
  } catch (error) {
    pinnerUtils.addErrorLog(error, "recreateSectionTabs")
    MNUtil.showHUD("刷新标签失败: " + error.message)
  }
}

