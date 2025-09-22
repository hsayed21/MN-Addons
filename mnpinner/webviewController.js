/**
 * 文献管理视图控制器（精简版）
 * 
 * 保留 main.js 实际使用的功能：
 * - WebView 管理
 * - 关闭按钮和拖动手势
 * - 显示/隐藏动画
 * - WebView 与 JavaScript 交互
 */
let pinnerController = JSB.defineClass('pinnerController : UIViewController <NSURLConnectionDelegate, UIWebViewDelegate>', {
  /**
   * 视图加载完成的生命周期方法
   */
  viewDidLoad: function() {
    try {
      self.init()
      self.view.frame = {x:50, y:50, width:450, height: 200}  // TODO: 适配不同的宽度
      self.lastFrame = self.view.frame;
      self.currentFrame = self.view.frame
      if (!self.settingView) {
        self.createSettingView()  // 创建设置视图和所有子视图
        self.settingView.hidden = false  // 加载主 view 的时候就显示 settingView
      }
      self.settingViewLayout()  // 布局设置视图
      self.setButtonText()  // 设置按钮文本
      self.setTextview()  // 设置文本视图


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
    if (scrollview.id && scrollview.id === "tempCardScrollView") {
      // MNUtil.showHUD("临时固定视图滚动")
      self.refreshTemporaryPinCards()
    }
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
      // 非 mini 模式：靠近边缘 40px 内触发吸附
      if (locationToMN.x < 40) {
        self.toMinimode(MNUtil.genFrame(0, locationToMN.y, 40, 40), self.lastFrame)
        return
      }
      if (locationToMN.x > studyFrame.width - 40) {
        self.toMinimode(MNUtil.genFrame(studyFrame.width - 40, locationToMN.y, 40, 40), self.lastFrame)
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
          if (self.webviewInput) {
            self.webviewInput.hidden = false
          }
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
    self.refreshTemporaryPinCards()
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
        if (frame.width <= 180) {  // 提升最小宽度，确保按钮不会溢出
          frame.width = 180
        }
        if (frame.height <= 150) {
          frame.height = 150
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
        
        self.refreshTemporaryPinCards()
      }
    } catch (error) {
      pinnerUtils.addErrorLog(error, "onResizeGesture")
    }
  },

  onResizeGesture0:function (gesture) {
    let baseframe = gesture.view.frame
    let locationToBrowser = gesture.locationInView(self.view)
    let frame = self.view.frame
    let width = locationToBrowser.x+baseframe.width*0.5
    let height = self.view.frame.height
    if (width <= 330) {
      width = 330
    }
    self.view.frame = {x:frame.x, y:frame.y, width:width, height:height}
    self.currentFrame = self.view.frame
    if (gesture.state === 3) {
      MNUtil.studyView.bringSubviewToFront(self.view)
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
          case "updateTitle":
            MNUtil.log("准备更新标题，参数: " + JSON.stringify(config.params))
            self.updateCardTitle(config.params.id, config.params.title)
            break;
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
      if (self.miniMode) {
        MNUtil.log("Mini 模式点击，准备恢复")
        // 直接恢复，不需要额外动画
        self.fromMinimode()
        return
      }
      
      // 正常模式下显示功能菜单
      let commandTable = [
        {title:'🔧  设置选项', object:self, selector:'showSettings:', param:""},
        {title:'📍  固定位置', object:self, selector:'togglePinPosition:', param:""},
        {title:'➖  最小化', object:self, selector:'manualMiniMode:', param:""},
        {title:'🔄  刷新视图', object:self, selector:'refreshCurrentView:', param:""}
      ];
      self.popoverController = MNUtil.getPopoverAndPresent(button, commandTable, 200, 1)
    } catch (error) {
      pinnerUtils.addErrorLog(error, "moveButtonTapped")
      MNUtil.showHUD("操作失败")
    }
  },
  
  temporaryPinTabTapped: function(button) {
    self.switchView("temporaryPinView")
  },

  permanentPinTabTapped: function (button) {
    self.switchView("permanentPinView")
  },
  
  // === permanentPinView 的事件处理方法 ===
  permClearCards: function() {
    try {
      // 调用数据层清空方法
      let success = pinnerConfig.clearPins(false)  // false = 永久固定
      
      if (success) {
        // 刷新视图显示
        self.refreshPermanentPinCards()
        MNUtil.showHUD("已清空永久固定卡片")
      } else {
        MNUtil.showHUD("清空失败")
      }
    } catch (error) {
      pinnerUtils.addErrorLog(error, "permClearCards")
      MNUtil.showHUD("清空失败: " + error)
    }
  },
  
  permRefreshCards: function() {
    self.refreshView("permanentPinView")
    MNUtil.showHUD("已刷新")
  },
  
  permCopyCardList: function() {
    try {
      // 从 pinnerConfig 获取永久固定数据
      let realCards = pinnerConfig.getPins(false) || []  // false = 永久固定
      
      if (realCards.length === 0) {
        MNUtil.showHUD("没有可复制的卡片")
        return
      }
      
      // 收集所有卡片标题
      let titles = realCards.map((card, index) => {
        return `${index + 1}. ${card.title || "未命名卡片"}`
      })
      
      MNUtil.copy(titles.join("\n"))
      MNUtil.showHUD(`已复制 ${titles.length} 张卡片列表`)
    } catch (error) {
      pinnerUtils.addErrorLog(error, "permCopyCardList")
      MNUtil.showHUD("复制失败: " + error)
    }
  },
  
  deletePermanentCard: function(button) {
    try {
      let noteId = button.noteId
      if (!noteId) {
        MNUtil.showHUD("无法获取卡片ID")
        return
      }
      
      // 调用数据层删除方法
      let success = pinnerConfig.removePin(noteId, false)  // false = 永久固定
      
      if (success) {
        // 刷新视图
        self.refreshPermanentPinCards()
        MNUtil.showHUD("已删除")
      } else {
        MNUtil.showHUD("删除失败")
      }
    } catch (error) {
      pinnerUtils.addErrorLog(error, "deletePermanentCard")
      MNUtil.showHUD("删除失败: " + error)
    }
  },
  
  viewPermanentCard: function(button) {
    try {
      let noteId = button.noteId
      if (!noteId) {
        MNUtil.showHUD("无法获取卡片ID")
        return
      }
      
      // 使用 MNNote 跳转到卡片
      let note = MNNote.new(noteId)
      if (note) {
        note.focusInMindMap()
        // MNUtil.showHUD("已跳转到卡片")
      } else {
        MNUtil.showHUD("找不到该卡片")
      }
    } catch (error) {
      pinnerUtils.addErrorLog(error, "viewPermanentCard")
      MNUtil.showHUD("查看失败: " + error)
    }
  },
  
  makePermanentFromTemp: function(button) {
    try {
      let noteId = button.noteId
      if (!noteId) {
        MNUtil.showHUD("无法获取卡片ID")
        return
      }
      
      // 调用数据层转换方法
      let success = pinnerConfig.makePermanent(noteId)
      
      if (success) {
        // 刷新视图
        self.refreshTemporaryPinCards()
        MNUtil.showHUD("已转为永久固定")
      } else {
        MNUtil.showHUD("转换失败")
      }
    } catch (error) {
      pinnerUtils.addErrorLog(error, "makePermanentFromTemp")
      MNUtil.showHUD("转换失败: " + error)
    }
  },

  // === temporaryPinView 的事件处理方法 ===
  tempClearCards: async function() {
    try {
      // 调用数据层清空方法
      let success = await pinnerConfig.clearPins(true)
      
      if (success) {
        // 刷新视图显示
        self.refreshTemporaryPinCards()
        MNUtil.showHUD("已清空临时固定卡片")
      } else {
        MNUtil.showHUD("清空失败")
      }
    } catch (error) {
      pinnerUtils.addErrorLog(error, "tempClearCards")
      MNUtil.showHUD("清空失败: " + error)
    }
  },

  tempRefreshCards: function() {
    // 触发 refreshView 机制，而不是直接调用 prototype 方法
    self.refreshView("temporaryPinView")
    MNUtil.showHUD("已刷新")
  },

  tempSelectAllCards: function() {
    MNUtil.showHUD("全选功能开发中...")
  },

  tempDeleteSelectedCards: function() {
    MNUtil.showHUD("删除功能开发中...")
  },

  tempCopyCardList: function() {
    try {
      // 从 pinnerConfig 获取真实数据
      let realCards = pinnerConfig.getPins(true) || []
      
      if (realCards.length === 0) {
        MNUtil.showHUD("没有可复制的卡片")
        return
      }
      
      // 收集所有卡片标题
      let titles = realCards.map((card, index) => {
        return `${index + 1}. ${card.title || "未命名卡片"}`
      })
      
      MNUtil.copy(titles.join("\n"))
      MNUtil.showHUD(`已复制 ${titles.length} 张卡片列表`)
    } catch (error) {
      pinnerUtils.addErrorLog(error, "tempCopyCardList")
      MNUtil.showHUD("复制失败: " + error)
    }
  },

  /**
   * 删除单个卡片
   */
  deleteTempCard: function(button) {
    try {
      let noteId = button.noteId
      if (!noteId) {
        MNUtil.showHUD("无法获取卡片ID")
        return
      }
      
      // 调用数据层删除方法
      let success = pinnerConfig.removePin(noteId, true)
      
      if (success) {
        // 刷新视图
        self.refreshTemporaryPinCards()
        MNUtil.showHUD("已删除")
      } else {
        MNUtil.showHUD("删除失败")
      }
    } catch (error) {
      pinnerUtils.addErrorLog(error, "deleteTempCard")
      MNUtil.showHUD("删除失败: " + error)
    }
  },
  
  /**
   * 单击定位卡片
   * 
   * 目前是脑图定位
   */
  viewTempCardTapped: function(button) {
    try {
      let noteId = button.noteId
      if (!noteId) {
        MNUtil.showHUD("无法获取卡片ID")
        return
      }
      
      // 使用 MNNote 跳转到卡片
      let note = MNNote.new(noteId)
      if (note) {
        note.focusInMindMap()
        // MNUtil.showHUD("已跳转到卡片")
        
        // 隐藏面板（可选）
        // self.hide()
      } else {
        MNUtil.showHUD("找不到该卡片")
      }
    } catch (error) {
      pinnerUtils.addErrorLog(error, "viewTempCardTapped")
      MNUtil.showHUD("查看失败: " + error)
    }
  },
  
  /**
   * 点击临时卡片标题
   * 显示操作菜单
   */
  tempCardTitleTapped: function(button) {
    try {
      // 创建菜单选项
      let commandTable = [
        self.tableItem("✏️  修改标题", "renameTempCard:", button)
      ]
      
      // 显示弹出菜单
      self.popoverController = MNUtil.getPopoverAndPresent(
        button, 
        commandTable, 
        120,  // 宽度
        1     // 箭头方向
      )
    } catch (error) {
      pinnerUtils.addErrorLog(error, "tempCardTitleTapped")
      MNUtil.showHUD("操作失败")
    }
  },
  
  /**
   * 重命名临时卡片
   */
  renameTempCard: function(button) {
    try {
      self.checkPopover()  // 关闭菜单
      let noteId = button.noteId
      
      // 显示输入对话框
      UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
        "修改卡片标题",
        "请输入新的标题：",
        2,  // alertViewStyle: 2 = 文本输入框
        "确定",
        ["取消"],
        (alertView, buttonIndex) => {
          if (buttonIndex === 0) {  // 确定按钮
            let textField = alertView.textFieldAtIndex(0)
            let newTitle = textField.text
            
            // 验证输入
            if (!newTitle || newTitle.trim() === "") {
              MNUtil.showHUD("标题不能为空")
              return
            }
            
            // 更新数据
            if (pinnerConfig.updatePinTitle(noteId, newTitle.trim())) {
              // 刷新视图
              self.refreshTemporaryPinCards()
              MNUtil.showHUD("标题已更新")
            } else {
              MNUtil.showHUD("更新失败")
            }
          }
        }
      )
    } catch (error) {
      pinnerUtils.addErrorLog(error, "renameTempCard")
      MNUtil.showHUD("改名失败: " + error)
    }
  },

  /**
   * 双击定位卡片
   * 
   * 目前是定位
   */
  viewTempCardDoubleTapped: function(button) {
    try {
      let noteId = button.noteId
      if (!noteId) {
        MNUtil.showHUD("无法获取卡片ID")
        return
      }
      
      // 使用 MNNote 跳转到卡片
      let note = MNNote.new(noteId)
      if (note) {
        note.focusInFloatMindMap()
      } else {
        MNUtil.showHUD("找不到该卡片")
      }
    } catch (error) {
      pinnerUtils.addErrorLog(error, "viewTempCardTapped")
      MNUtil.showHUD("查看失败: " + error)
    }
  },
});

// ========== 原型方法 ==========


/**
 * 加载 HTML 文件到 WebView
 */
pinnerController.prototype.loadHTMLFile = function() {
  try {
    let htmlPath = pinnerUtils.mainPath + "/index.html"
    let htmlURL = NSURL.fileURLWithPath(htmlPath)
    let request = NSURLRequest.requestWithURL(htmlURL)
    this.webView.loadRequest(request)
    MNUtil.log("开始加载 HTML 文件: " + htmlPath)
  } catch (error) {
    MNUtil.showHUD("加载 HTML 失败: " + error)
    MNUtil.log("加载 HTML 错误: " + error)
  }
}

/**
 * 向 WebView 发送卡片信息
 */
pinnerController.prototype.sendCardInfoToWebView = function(note) {
  try {
    if (!note) {
      MNUtil.log("没有选中的卡片")
      this.runJavaScript("clearCardInfo()", this.webView)
      return
    }
    
    if (!this.webViewLoaded) {
      MNUtil.log("WebView 尚未加载完成")
      return
    }
    
    let cardInfo = {
      id: note.noteId,
      title: note.title || "",
      excerpt: note.excerptText || ""
    }
    
    // 使用双重编码：JSON.stringify + encodeURIComponent
    let encodedData = encodeURIComponent(JSON.stringify(cardInfo))
    let jsCode = `updateCardInfo('${encodedData}')`
    
    this.runJavaScript(jsCode, this.webView).then(() => {
      MNUtil.log("卡片信息已发送到网页")
    })
    
  } catch (error) {
    MNUtil.showHUD("发送卡片信息失败: " + error)
    MNUtil.log("发送卡片信息错误: " + error)
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
  // this.pinnerView.hidden = true     // 隐藏子视图
  // this.settingView.hidden = true
  
  // 将视图移动到最前面
  MNUtil.studyView.bringSubviewToFront(this.view)
  
  // 执行 iOS 动画
  UIView.animateWithDurationAnimationsCompletion(
    0.3,  // 动画时长 0.3 秒（统一动画时长）
    ()=>{
      // 动画块：这里的变化会以动画形式呈现
      this.view.layer.opacity = preOpacity  // 恢复透明度
      this.view.frame = preFrame             // 移动到目标位置
      this.currentFrame = preFrame
    },
    ()=>{
      // 动画完成回调
      this.onAnimate = false  // 重置动画状态
      this.view.layer.borderWidth = 0
      // this.setAllButton(false)                // 显示所有按钮
      // this.pinnerView.hidden = false      // 显示主功能视图
      // this.settingView.hidden = true          // 确保设置视图隐藏
      // MNButton.setColor(this.settingButton, "#89a6d5")  // 重置设置按钮颜色
      // this.settingButton.open = false         // 重置设置按钮状态
      this.refreshView(pinnerConfig.config.source)  // 刷新视图内容
    }
  )
}
pinnerController.prototype.setAllButton = function (hidden) {
  // 关键：必须隐藏 moveButton（照抄 mnbrowser）
  if (this.moveButton) {
    this.moveButton.hidden = hidden
  }
  if (this.closeButton) {
    this.closeButton.hidden = hidden
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
  // Application.sharedInstance().showHUD(JSON.stringify(frame),this.view.window,2)
  
  // 隐藏所有子视图（动画前）
  // this.setAllButton(true)        // 隐藏所有按钮
  // this.pinnerView.hidden = true
  // this.settingView.hidden = true
  
  // 执行 iOS 动画
  UIView.animateWithDurationAnimationsCompletion(
    0.3,  // 动画时长 0.3 秒（统一动画时长）
    ()=>{
      // 动画块
      this.view.layer.opacity = 0.2  // 淡出到半透明
      if (frame) {
        // 如果指定了终点位置，移动到该位置
        this.view.frame = frame
        this.currentFrame = frame
      }
    },
    ()=>{
      // 动画完成回调
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
pinnerController.prototype.creatTextView = function (superview="view",color="#c0bfbf",alpha=0.9) {
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

/**
 * @this {pinnerController}
 */
pinnerController.prototype.createWebviewInput = function (superView, content) {
  try {
    this.webviewInput = new UIWebView(this.view.bounds);
    this.webviewInput.backgroundColor = MNUtil.hexColorAlpha("#c0bfbf",0.8)
    this.webviewInput.scalesPageToFit = false;
    this.webviewInput.autoresizingMask = (1 << 1 | 1 << 4);
    this.webviewInput.delegate = this;
    this.webviewInput.scrollView.delegate = this;
    this.webviewInput.layer.cornerRadius = 8;
    this.webviewInput.layer.masksToBounds = true;
    this.webviewInput.layer.borderColor = MNUtil.hexColorAlpha("#9bb2d6",0.8);
    this.webviewInput.layer.borderWidth = 0
    this.webviewInput.layer.opacity = 0.9
    this.webviewInput.loadHTMLStringBaseURL(pinnerUtils.html(content))
  } catch (error) {
    MNUtil.showHUD(error)
  }
  if (superView) {
    this[superView].addSubview(this.webviewInput)
  }
}


/** @this {pinnerController} */
pinnerController.prototype.runJavaScript = async function(script,webview) {
  return new Promise((resolve, reject) => {
    try {
    if (webview) {
      // webview 参数是一个 UIWebView 对象，直接使用它
      // 不要使用 this[webview]，那是把 webview 当成字符串属性名
      webview.evaluateJavaScript(script, (result) => {
        if (MNUtil.isNSNull(result)) {
          resolve(undefined)
        } else {
          resolve(result)
        }
      });
    }else{
      // 默认使用 webviewResponse
      this.webviewResponse.evaluateJavaScript(script, (result) => {
        if (MNUtil.isNSNull(result)) {
          resolve(undefined)
        }else{
          resolve(result)
        }
      });
    }
    } catch (error) {
      MNLog.error(error, "runJavaScript")
      resolve(undefined)
    }
  })
};

/**
 * @this {pinnerController}
 */
pinnerController.prototype.setWebviewContent = function (content) {
  this.webviewInput.loadHTMLStringBaseURL(pinnerUtils.html(content))
}
/**
 * @this {pinnerController}
 */
pinnerController.prototype.getWebviewContent = async function () {
  let content = await this.runJavaScript(`updateContent(); document.body.innerText`)
  this.webviewInput.endEditing(true)
  return content
}

/**
 * 
 * @this {pinnerController}
 */
pinnerController.prototype.checkPopover = function () {
  if (this.popoverController) {this.popoverController.dismissPopoverAnimated(true);}
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
    this.temporaryPinView.frame = MNUtil.genFrame(0, 0,width, height-65)
    this.permanentPinView.frame = MNUtil.genFrame(0, 0,width, height-65)

    let settingFrame = this.settingView.bounds
    settingFrame.x = 0
    settingFrame.y = 20
    settingFrame.height = 30
    settingFrame.width = settingFrame.width-45
    this.tabView.frame = settingFrame
    
    // 布局 tab 按钮
    let tabX = 10
    if (this.temporaryPinTab) {
      this.temporaryPinTab.frame = {x: tabX, y: 2, width: this.temporaryPinTab.width, height: 26}
      tabX += this.temporaryPinTab.width + 5
    }
    if (this.permanentPinTab) {
      this.permanentPinTab.frame = {x: tabX, y: 2, width: this.permanentPinTab.width, height: 26}
      tabX += this.permanentPinTab.width + 5
    }
    
    this.tabView.contentSize = {width: tabX + 10, height: 30}
    
    // 布局关闭按钮
    settingFrame.y = 20
    settingFrame.x = this.tabView.frame.width + 5
    settingFrame.width = 30
    this.closeButton.frame = settingFrame
    
    // 布局 temporaryPinView 的子视图
    if (!this.temporaryPinView.hidden) {
      this.layoutTemporaryPinView()
    }
  } catch (error) {
    pinnerUtils.addErrorLog(error, "settingViewLayout")
  }
}
pinnerController.prototype.refreshLayout = function () {
  // 添加临时固定视图的布局刷新
  if (!this.temporaryPinView.hidden) {
    this.layoutTemporaryPinView()
  }
  // 添加永久固定视图的布局刷新
  if (!this.permanentPinView.hidden) {
    this.layoutPermanentPinView()
  }
}
pinnerController.prototype.setButtonText = function () {
}
pinnerController.prototype.setTextview = function () {
}
pinnerController.prototype.createSettingView = function () {
  try {
    /**
     * settingView 配置
     */
    let targetView = "settingView"
    this.createView(targetView, "view","#f1f6ff",0.9)
    this.settingView.hidden = true
    this.settingView.layer.cornerRadius = 15
    this.tabView = this.createScrollview("view","#ffffff", 0)  // settingView 和 tabView 是兄弟视图，隶属于 this.view
    this.tabView.alwaysBounceHorizontal = true
    this.tabView.showsHorizontalScrollIndicator = false

    // === 创建 tab 切换按钮 ===
    let radius = 10
    this.createButton("temporaryPinTab","temporaryPinTabTapped:","tabView")
    this.temporaryPinTab.layer.cornerRadius = radius;
    this.temporaryPinTab.isSelected = true  // 默认选中第一个 tab
    MNButton.setConfig(this.temporaryPinTab, 
      {color:"#457bd3",alpha:0.9,opacity:1.0,title:"temporary",font:17,bold:true}  // 使用选中颜色
    )
    let size = this.temporaryPinTab.sizeThatFits({width:100,height:100})
    this.temporaryPinTab.width = size.width+15
    
    this.createButton("permanentPinTab","permanentPinTabTapped:","tabView")
    this.permanentPinTab.layer.cornerRadius = radius;
    this.permanentPinTab.isSelected = false
    MNButton.setConfig(this.permanentPinTab, 
      {color:"#9bb2d6",alpha:0.9,opacity:1.0,title:"permanent",font:17,bold:true}
    )
    size = this.permanentPinTab.sizeThatFits({width:120,height:100})
    this.permanentPinTab.width = size.width+15

    // === 创建各个分页===
    this.createView("temporaryPinView","settingView","#9bb2d6",0)
    this.temporaryPinView.hidden = false  // 默认显示第一个视图

    this.createView("permanentPinView","settingView","#9bb2d6",0)
    this.permanentPinView.hidden = true  // 隐藏其他视图
    
    // === 为 permanentPinView 添加子视图 ===
    // 顶部操作按钮
    this.createButton("permClearButton", "permClearCards:", "permanentPinView")
    MNButton.setConfig(this.permClearButton, {
      color: "#e06c75", alpha: 0.8, opacity: 1.0, title: "🗑 清空", radius: 10, font: 15
    })
    
    this.createButton("permRefreshButton", "permRefreshCards:", "permanentPinView")
    MNButton.setConfig(this.permRefreshButton, {
      color: "#457bd3", alpha: 0.8, opacity: 1.0, title: "🔄 刷新", radius: 10, font: 15
    })
    
    // 计数标签
    this.createButton("permCountLabel", "", "permanentPinView")
    this.permCountLabel.enabled = false
    this.permCountLabel.backgroundColor = UIColor.clearColor()
    this.permCountLabel.setTitleForState("共 0 张卡片", 0)
    MNButton.setConfig(this.permCountLabel, {
      color: "#666666", alpha: 1.0, opacity: 1.0, font: 14
    })
    
    // 中间滚动视图
    this.permCardScrollView = this.createScrollview("permanentPinView", "#f5f5f5", 0.9)
    this.permCardScrollView.layer.cornerRadius = 12
    this.permCardScrollView.alwaysBounceVertical = true
    this.permCardScrollView.showsVerticalScrollIndicator = true
    
    // 初始化卡片行数组
    this.permCardRows = []
    
    // 右侧复制按钮
    this.createButton("permCopyButton", "permCopyCardList:", "permanentPinView")
    MNButton.setConfig(this.permCopyButton, {
      title: "📋", color: "#9bb2d6", alpha: 0.8, radius: 15, font: 20
    })

    // === 为 temporaryPinView 添加子视图 ===
    // 创建顶部按钮的滚动容器
    this.tempButtonScrollView = UIScrollView.new()
    this.tempButtonScrollView.alwaysBounceHorizontal = true
    this.tempButtonScrollView.showsHorizontalScrollIndicator = false
    this.tempButtonScrollView.backgroundColor = UIColor.clearColor()
    this.tempButtonScrollView.bounces = false
    this.temporaryPinView.addSubview(this.tempButtonScrollView)
    
    // 顶部操作按钮 - 添加到滚动容器中
    this.createButton("tempClearButton", "tempClearCards:", "tempButtonScrollView")
    MNButton.setConfig(this.tempClearButton, {
      color: "#e06c75", alpha: 0.8, opacity: 1.0, title: "🗑 清空", radius: 10, font: 15
    })

    this.createButton("tempRefreshButton", "tempRefreshCards:", "tempButtonScrollView")  
    MNButton.setConfig(this.tempRefreshButton, {
      color: "#457bd3", alpha: 0.8, opacity: 1.0, title: "🔄 刷新", radius: 10, font: 15
    })

    // // 计数标签 - 使用禁用的按钮代替 UILabel
    // this.createButton("tempCountLabel", "", "temporaryPinView")
    // this.tempCountLabel.enabled = false  // 禁用交互
    // this.tempCountLabel.backgroundColor = UIColor.clearColor()
    // this.tempCountLabel.setTitleForState("共 0 张卡片", 0)
    // MNButton.setConfig(this.tempCountLabel, {
    //   color: "#666666", alpha: 1.0, opacity: 1.0, font: 14
    // })

    // 中间滚动视图 - 注意接收返回值
    this.tempCardScrollView = this.createScrollview("temporaryPinView", "#f5f5f5", 0.9)
    this.tempCardScrollView.layer.cornerRadius = 12
    this.tempCardScrollView.alwaysBounceVertical = true
    this.tempCardScrollView.showsVerticalScrollIndicator = true
    this.tempCardScrollView.id = "tempCardScrollView"
    
    // 初始化卡片行数组
    this.tempCardRows = []

    // 右侧操作按钮
    this.createButton("tempSelectAllButton", "tempSelectAllCards:", "temporaryPinView")
    MNButton.setConfig(this.tempSelectAllButton, {
      title: "☑️", color: "#457bd3", alpha: 0.8, radius: 15, font: 20
    })

    this.createButton("tempDeleteButton", "tempDeleteSelectedCards:", "temporaryPinView")  
    MNButton.setConfig(this.tempDeleteButton, {
      title: "🗑", color: "#e06c75", alpha: 0.8, radius: 15, font: 20
    })

    this.createButton("tempCopyButton", "tempCopyCardList:", "temporaryPinView")
    MNButton.setConfig(this.tempCopyButton, {
      title: "📋", color: "#9bb2d6", alpha: 0.8, radius: 15, font: 20
    })

    this.refreshView(targetView)


    // === 创建关闭按钮 ===
    this.createButton("closeButton","closeButtonTapped:")
    this.closeButton.layer.cornerRadius = 10;
    MNButton.setImage(this.closeButton, pinnerConfig.closeImage)
    MNButton.setColor(this.closeButton, "#e06c75")
    
    // 为关闭按钮添加拖动手势（用于调整面板大小）
    MNButton.addPanGesture(this.closeButton, this, "onResizeGesture:")
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
  let allViews = ["temporaryPinView", "permanentPinView"]
  let allButtons = ["temporaryPinTab","permanentPinTab"]
  allViews.forEach((k, index) => {
    let isTargetView = k === targetView
    this[k].hidden = !isTargetView
    this[allButtons[index]].isSelected = isTargetView
    this[allButtons[index]].backgroundColor = MNUtil.hexColorAlpha(isTargetView?"#457bd3":"#9bb2d6",0.8)
  })
  this.refreshView(targetView)
}
pinnerController.prototype.refreshView = function (targetView) {
  try {
    switch (targetView) {
      case "permanentPinView":
        MNUtil.log("refresh permanentPinView")
        this.refreshPermanentPinCards()  // 刷新永久固定卡片列表
        break;
      case "temporaryPinView":
        MNUtil.log("refresh temporaryPinView")
        this.refreshTemporaryPinCards()  // 刷新临时固定卡片列表
        break;
      default:
        break;
    }
  } catch (error) {
    pinnerUtils.addErrorLog(error, "chatglmController.refreshView")
  }
}
/**
 * 布局 temporaryPinView 的子视图
 */
pinnerController.prototype.layoutTemporaryPinView = function() {
  // 增强防御性检查
  if (!this.temporaryPinView || this.temporaryPinView.hidden) return
  if (!this.tempCardScrollView) return
  
  let frame = this.temporaryPinView.bounds
  let width = frame.width
  let height = frame.height
  
  // 设置按钮滚动容器的frame
  if (this.tempButtonScrollView) {
    // 容器占据顶部区域，宽度自适应，最多显示160px内容
    this.tempButtonScrollView.frame = {x: 10, y: 10, width: Math.min(width - 20, 160), height: 32}
    // 设置内容大小，允许滚动查看所有按钮
    this.tempButtonScrollView.contentSize = {width: 160, height: 32}
    
    // 按钮相对于滚动容器的位置
    if (this.tempClearButton) {
      this.tempClearButton.frame = {x: 0, y: 0, width: 70, height: 32}
    }
    if (this.tempRefreshButton) {
      this.tempRefreshButton.frame = {x: 75, y: 0, width: 70, height: 32}
    }
  }
  
  // 中间滚动视图（留出右侧按钮空间）
  this.tempCardScrollView.frame = {x: 10, y: 50, width: width - 70, height: height - 65}
  
  // 右侧按钮（垂直排列，检查存在性）
  // 暂时隐藏右侧按钮
  // let rightX = width - 50
  // if (this.tempSelectAllButton) {
  //   this.tempSelectAllButton.frame = {x: rightX, y: 50, width: 40, height: 40}
  // }
  // if (this.tempDeleteButton) {
  //   this.tempDeleteButton.frame = {x: rightX, y: 100, width: 40, height: 40}
  // }
  // if (this.tempCopyButton) {
  //   this.tempCopyButton.frame = {x: rightX, y: 150, width: 40, height: 40}
  // }
}

/**
 * 刷新临时固定卡片列表
 */
pinnerController.prototype.refreshTemporaryPinCards = function() {
  try {
    // 初始化卡片行数组
    if (!this.tempCardRows) {
      this.tempCardRows = []
    }
    
    // 从 pinnerConfig 获取真实数据
    let realCards = pinnerConfig.getPins(true) || []
    
    // // 更新计数（使用按钮的方法）
    // if (this.tempCountLabel) {
    //   this.tempCountLabel.setTitleForState(`共 ${realCards.length} 张卡片`, 0)
    // }
    
    // 清空现有卡片（使用维护的数组）
    this.tempCardRows.forEach(view => {
      view.removeFromSuperview()
    })
    this.tempCardRows = []
    
    // 检查滚动视图是否存在
    if (!this.tempCardScrollView) return
    
    // 如果没有卡片，显示提示
    if (realCards.length === 0) {
      // 创建空状态提示
      let emptyLabel = UIButton.buttonWithType(0)
      emptyLabel.setTitleForState("暂无固定的卡片", 0)
      emptyLabel.titleLabel.font = UIFont.systemFontOfSize(14)
      emptyLabel.frame = {x: 10, y: 10, width: this.tempCardScrollView.frame.width - 20, height: 40}
      emptyLabel.enabled = false
      emptyLabel.setTitleColorForState(MNUtil.hexColorAlpha("#999999", 1.0), 0)
      this.tempCardScrollView.addSubview(emptyLabel)
      this.tempCardRows.push(emptyLabel)
      this.tempCardScrollView.contentSize = {width: 0, height: 100}
      return
    }
    
    // 添加卡片行
    let yOffset = 10
    let scrollWidth = this.tempCardScrollView.frame.width
    
    realCards.forEach((card, index) => {
      let cardRow = this.createTempCardRow(card, index, scrollWidth - 20)
      this.tempCardScrollView.addSubview(cardRow)
      this.tempCardRows.push(cardRow)  // 保存引用
      yOffset += 55
    })
    
    // 设置滚动区域
    this.tempCardScrollView.contentSize = {width: 0, height: yOffset + 10}
    
  } catch (error) {
    pinnerUtils.addErrorLog(error, "refreshTemporaryPinCards")
    MNUtil.showHUD("刷新卡片列表失败")
  }
}

/**
 * 刷新永久固定卡片列表
 */
pinnerController.prototype.refreshPermanentPinCards = function() {
  try {
    // 初始化卡片行数组
    if (!this.permCardRows) {
      this.permCardRows = []
    }
    
    // 从 pinnerConfig 获取真实数据
    let realCards = pinnerConfig.getPins(false) || []  // false = 永久固定
    
    // 更新计数（使用按钮的方法）
    if (this.permCountLabel) {
      this.permCountLabel.setTitleForState(`共 ${realCards.length} 张卡片`, 0)
    }
    
    // 清空现有卡片（使用维护的数组）
    this.permCardRows.forEach(view => {
      view.removeFromSuperview()
    })
    this.permCardRows = []
    
    // 检查滚动视图是否存在
    if (!this.permCardScrollView) return
    
    // 如果没有卡片，显示提示
    if (realCards.length === 0) {
      // 创建空状态提示
      let emptyLabel = UIButton.buttonWithType(0)
      emptyLabel.setTitleForState("暂无永久固定的卡片", 0)
      emptyLabel.titleLabel.font = UIFont.systemFontOfSize(14)
      emptyLabel.frame = {x: 10, y: 50, width: this.permCardScrollView.frame.width - 20, height: 40}
      emptyLabel.enabled = false
      emptyLabel.setTitleColorForState(MNUtil.hexColorAlpha("#999999", 1.0), 0)
      this.permCardScrollView.addSubview(emptyLabel)
      this.permCardRows.push(emptyLabel)
      this.permCardScrollView.contentSize = {width: 0, height: 100}
      return
    }
    
    // 添加卡片行
    let yOffset = 10
    let scrollWidth = this.permCardScrollView.frame.width
    
    realCards.forEach((card, index) => {
      let cardRow = this.createPermCardRow(card, index, scrollWidth - 20)
      this.permCardScrollView.addSubview(cardRow)
      this.permCardRows.push(cardRow)  // 保存引用
      yOffset += 55
    })
    
    // 设置滚动区域
    this.permCardScrollView.contentSize = {width: 0, height: yOffset + 10}
    
  } catch (error) {
    pinnerUtils.addErrorLog(error, "refreshPermanentPinCards")
    MNUtil.showHUD("刷新永久固定卡片失败")
  }
}

/**
 * 创建永久固定卡片行视图
 */
pinnerController.prototype.createPermCardRow = function(card, index, width) {
  // 创建卡片行容器
  let rowView = UIView.new()
  rowView.frame = {x: 10, y: 10 + index * 55, width: width, height: 45}
  rowView.backgroundColor = MNUtil.hexColorAlpha("#fffff0", 0.95)  // 淡黄色区分
  rowView.layer.cornerRadius = 8
  rowView.layer.borderWidth = 1
  rowView.layer.borderColor = MNUtil.hexColorAlpha("#d4af37", 0.3)  // 金色边框
  
  // 保存 noteId 到 rowView（供删除时使用）
  rowView.noteId = card.noteId
  
  // 添加序号和标题（使用禁用的按钮代替 UILabel）
  let titleButton = UIButton.buttonWithType(0)
  titleButton.setTitleForState(`⭐ ${index + 1}. ${card.title || "未命名卡片"}`, 0)
  titleButton.titleLabel.font = UIFont.systemFontOfSize(15)
  titleButton.frame = {x: 10, y: 5, width: width - 100, height: 35}
  titleButton.enabled = false  // 禁用以模拟标签效果
  titleButton.setTitleColorForState(UIColor.blackColor(), 0)
  titleButton.contentHorizontalAlignment = 1  // 左对齐
  rowView.addSubview(titleButton)
  
  // 删除按钮
  let deleteBtn = UIButton.buttonWithType(0)
  deleteBtn.setTitleForState("🗑", 0)
  deleteBtn.frame = {x: width - 80, y: 7, width: 30, height: 30}
  deleteBtn.backgroundColor = MNUtil.hexColorAlpha("#e06c75", 0.8)
  deleteBtn.layer.cornerRadius = 5
  deleteBtn.tag = index  // 用 tag 存储索引
  deleteBtn.noteId = card.noteId  // 直接保存 noteId
  deleteBtn.addTargetActionForControlEvents(this, "deletePermanentCard:", 1 << 6)
  rowView.addSubview(deleteBtn)
  
  // 查看按钮
  let viewBtn = UIButton.buttonWithType(0)
  viewBtn.setTitleForState("👁", 0)
  viewBtn.frame = {x: width - 40, y: 7, width: 30, height: 30}
  viewBtn.backgroundColor = MNUtil.hexColorAlpha("#457bd3", 0.8)
  viewBtn.layer.cornerRadius = 5
  viewBtn.tag = index  // 用 tag 存储索引
  viewBtn.noteId = card.noteId  // 保存 noteId
  viewBtn.addTargetActionForControlEvents(this, "viewPermanentCard:", 1 << 6)
  rowView.addSubview(viewBtn)
  
  return rowView
}

/**
 * 布局 permanentPinView 的子视图
 */
pinnerController.prototype.layoutPermanentPinView = function() {
  // 增强防御性检查
  if (!this.permanentPinView || this.permanentPinView.hidden) return
  if (!this.permCardScrollView) return
  
  let frame = this.permanentPinView.bounds
  let width = frame.width
  let height = frame.height
  
  // 顶部按钮和标签（检查存在性）
  if (this.permClearButton) {
    this.permClearButton.frame = {x: 10, y: 10, width: 70, height: 32}
  }
  if (this.permRefreshButton) {
    this.permRefreshButton.frame = {x: 85, y: 10, width: 70, height: 32}
  }
  if (this.permCountLabel) {
    this.permCountLabel.frame = {x: 165, y: 10, width: 120, height: 32}
  }
  
  // 中间滚动视图（留出右侧按钮空间）
  this.permCardScrollView.frame = {x: 10, y: 50, width: width - 70, height: height - 65}
  
  // 右侧复制按钮
  let rightX = width - 50
  if (this.permCopyButton) {
    this.permCopyButton.frame = {x: rightX, y: 50, width: 40, height: 40}
  }
}

/**
 * 创建单个卡片行视图
 */
pinnerController.prototype.createTempCardRow = function(card, index, width) {
  // 创建卡片行容器
  let rowView = UIView.new()
  rowView.frame = {x: 10, y: 10 + index * 55, width: width, height: 45}
  rowView.backgroundColor = MNUtil.hexColorAlpha("#ffffff", 0.95)
  rowView.layer.cornerRadius = 8
  rowView.layer.borderWidth = 1
  rowView.layer.borderColor = MNUtil.hexColorAlpha("#9bb2d6", 0.3)
  
  // 保存 noteId 到 rowView（供删除时使用）
  rowView.noteId = card.noteId
  
  // 添加序号和标题（可点击的按钮）
  let titleButton = UIButton.buttonWithType(0)
  titleButton.setTitleForState(`${card.title || "未命名卡片"}`, 0)
  titleButton.titleLabel.font = UIFont.systemFontOfSize(15)
  titleButton.frame = {x: 40, y: 5, width: width - 80, height: 35}  // 调整宽度给按钮留空间
  // 改为可点击，添加点击事件
  titleButton.addTargetActionForControlEvents(this, "tempCardTitleTapped:", 1 << 6)
  titleButton.noteId = card.noteId  // 保存卡片ID
  titleButton.cardTitle = card.title  // 保存当前标题
  // 设置颜色表示可点击
  titleButton.setTitleColorForState(MNUtil.hexColorAlpha("#007AFF", 1.0), 0)  // 蓝色
  titleButton.setTitleColorForState(MNUtil.hexColorAlpha("#0051D5", 1.0), 1)  // 按下时深蓝色
  titleButton.contentHorizontalAlignment = 1  // 左对齐
  rowView.addSubview(titleButton)
  
  // // 转为永久按钮
  // let permanentBtn = UIButton.buttonWithType(0)
  // permanentBtn.setTitleForState("⭐", 0)
  // permanentBtn.frame = {x: width - 110, y: 7, width: 30, height: 30}
  // permanentBtn.backgroundColor = MNUtil.hexColorAlpha("#d4af37", 0.8)  // 金色
  // permanentBtn.layer.cornerRadius = 5
  // permanentBtn.tag = index
  // permanentBtn.noteId = card.noteId
  // permanentBtn.addTargetActionForControlEvents(this, "makePermanentFromTemp:", 1 << 6)
  // rowView.addSubview(permanentBtn)
  
  // 删除按钮
  let deleteBtn = UIButton.buttonWithType(0)
  deleteBtn.setTitleForState("🗑", 0)
  deleteBtn.frame = {x: width - 40, y: 7, width: 30, height: 30}
  deleteBtn.backgroundColor = MNUtil.hexColorAlpha("#e06c75", 0.8)
  deleteBtn.layer.cornerRadius = 5
  deleteBtn.tag = index  // 用 tag 存储索引
  deleteBtn.noteId = card.noteId  // 直接保存 noteId
  deleteBtn.addTargetActionForControlEvents(this, "deleteTempCard:", 1 << 6)
  rowView.addSubview(deleteBtn)
  
  // 定位按钮
  let viewBtn = UIButton.buttonWithType(0)
  viewBtn.setTitleForState("📍", 0)
  viewBtn.frame = {x: 5, y: 7, width: 30, height: 30}
  viewBtn.backgroundColor = MNUtil.hexColorAlpha("#457bd3", 0.8)
  viewBtn.layer.cornerRadius = 5
  viewBtn.tag = index  // 用 tag 存储索引
  viewBtn.noteId = card.noteId  // 保存 noteId
  viewBtn.addTargetActionForControlEvents(this, "viewTempCardTapped:", 1 << 6)
  // viewBtn.addTargetActionForControlEvents(this, "viewTempCardDoubleTapped:", 1 << 1)
  rowView.addSubview(viewBtn)
  
  return rowView
}

/**
 * 转换到迷你模式
 * @param {Object} frame - 迷你模式的目标位置
 */
pinnerController.prototype.toMinimode = function(frame, lastFrame) {
  // 完全照抄 mnbrowser 的实现（line 4333-4354）
  this.miniMode = true
  if (lastFrame) {
    this.lastFrame = lastFrame
  } else {
    this.lastFrame = this.view.frame
  }
  
  // 隐藏 webview 和其他视图
  if (this.webviewInput) {
    this.webviewInput.hidden = true
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
      this.lastFrame = {x: 50, y: 50, width: 450, height: 200}
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
      if (this.webviewInput) {
        this.webviewInput.hidden = false
      }
      if (this.settingView) {
        this.settingView.hidden = false
      }
      this.setAllButton(false)  // 显示所有按钮
      this.moveButton.setTitleForState("", 0)  // 清除图标
      this.refreshTemporaryPinCards()
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
 * 手动触发 mini 模式
 */
pinnerController.prototype.manualMiniMode = function() {
  try {
    if (this.miniMode) return // 已经是 mini 模式
    
    // 在屏幕右边缘生成 mini 模式位置
    let studyFrame = MNUtil.studyView.bounds
    let miniFrame = MNUtil.genFrame(studyFrame.width - 40, this.view.frame.y, 40, 40)
    this.toMinimode(miniFrame)
  } catch (error) {
    pinnerUtils.addErrorLog(error, "manualMiniMode")
    MNUtil.showHUD("最小化失败")
  }
}

/**
 * 切换位置固定状态
 */
pinnerController.prototype.togglePinPosition = function() {
  try {
    // 这里可以实现位置记忆功能
    MNUtil.showHUD("位置固定功能开发中...")
  } catch (error) {
    pinnerUtils.addErrorLog(error, "togglePinPosition")
  }
}

/**
 * 显示设置选项
 */
pinnerController.prototype.showSettings = function() {
  try {
    // 这里可以扩展更多设置选项
    MNUtil.showHUD("设置功能开发中...")
  } catch (error) {
    pinnerUtils.addErrorLog(error, "showSettings")
  }
}

/**
 * 刷新当前视图
 */
pinnerController.prototype.refreshCurrentView = function() {
  try {
    this.refreshView(pinnerConfig.config.source)
    MNUtil.showHUD("已刷新")
  } catch (error) {
    pinnerUtils.addErrorLog(error, "refreshCurrentView")
    MNUtil.showHUD("刷新失败")
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

pinnerController.prototype.checkPopover = function () {
  if (this.popoverController) {
    this.popoverController.dismissPopoverAnimated(true)
  }
}