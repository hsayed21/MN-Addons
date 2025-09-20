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
      self.view.frame = {x:50, y:50, width:400, height: 450}  // TODO: 适配不同的宽度
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
  
  scrollViewDidScroll: function() {
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
   * 处理拖动手势
   */
  onMoveGesture: function (gesture) {
    if (gesture.state === 1) {
      self.originalLocationToMN = gesture.locationInView(MNUtil.studyView)
      self.originalFrame = self.view.frame
    }
    if (gesture.state === 2) {
      let locationToMN = gesture.locationInView(MNUtil.studyView)
      let locationDiff = {x:locationToMN.x - self.originalLocationToMN.x,y:locationToMN.y - self.originalLocationToMN.y}
      let frame = self.view.frame
      frame.x = self.originalFrame.x + locationDiff.x
      frame.y = self.originalFrame.y + locationDiff.y
      self.setFrame(frame)
    }
    if (gesture.state === 3) {
      MNUtil.studyView.bringSubviewToFront(self.view)
    }
  },

  onResizeGesture:function (gesture) {
    try {
      if (gesture.state === 1) {
        self.originalLocationToMN = gesture.locationInView(MNUtil.studyView)
        self.originalFrame = self.view.frame
      }
      if (gesture.state === 2) {
        let locationToMN = gesture.locationInView(MNUtil.studyView)
        let locationDiff = {x:locationToMN.x - self.originalLocationToMN.x,y:locationToMN.y - self.originalLocationToMN.y}
        let frame = self.view.frame
        frame.width = self.originalFrame.width + locationDiff.x
        frame.height = self.originalFrame.height + locationDiff.y
        if (frame.width <= 330) {
          frame.width = 330
        }
        if (frame.height <= 465) {
          frame.height = 465
        }
        self.setFrame(frame)
      }
      if (gesture.state === 3) {
        MNUtil.studyView.bringSubviewToFront(self.view)
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
    let commandTable = [
      {title:'😄 我是?', object:self, selector:'', param:""}
    ];
    self.popoverController = MNUtil.getPopoverAndPresent(button,commandTable,200,1)
    return
  },
  
  temporaryPinTabTapped: function(button) {
    self.switchView("temporaryPinView")
  },

  permanentPinTabTapped: function (button) {
    self.switchView("permanentPinView")
  },

  // === temporaryPinView 的事件处理方法 ===
  tempClearCards: function() {
    // 清空卡片行（使用维护的数组）
    if (self.tempCardRows) {
      self.tempCardRows.forEach(view => {
        view.removeFromSuperview()
      })
      self.tempCardRows = []
    }
    
    // 更新计数显示（使用按钮的方法）
    if (self.tempCountLabel) {
      self.tempCountLabel.setTitleForState("共 0 张卡片", 0)
    }
    MNUtil.showHUD("已清空")
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
    // 收集所有卡片标题
    let titles = []
    for (let i = 0; i < 3; i++) {
      titles.push(`${i+1}. 示例卡片${i+1}`)
    }
    MNUtil.copy(titles.join("\n"))
    MNUtil.showHUD("已复制卡片列表")
  },

  /**
   * 查看卡片方法
   */
  viewTempCard: function(button) {
    MNUtil.showHUD(`查看卡片 ${button.tag + 1}`)
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
  preFrame.width = 260  // 确保宽度正确
  
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
    0.2,  // 动画时长 0.2 秒
    ()=>{
      // 动画块：这里的变化会以动画形式呈现
      this.view.layer.opacity = preOpacity  // 恢复透明度
      this.view.frame = preFrame             // 移动到目标位置
      this.currentFrame = preFrame
    },
    ()=>{
      // 动画完成回调
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
  // this.moveButton.hidden = hidden
  this.closeButton.hidden = hidden
  // this.settingButton.hidden = hidden
  
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
  preFrame.width = 260
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
    .25,  // 动画时长 0.25 秒
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
/**
 * @this {pinnerController}
 */
pinnerController.prototype.refreshView = function (source){
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
 * @param {string} title 
 * @param {string} selector 
 * @param {any} param 
 * @param {boolean|undefined} checked 
 * @this {pinnerController}
 * @returns 
 */
pinnerController.prototype.tableItem = function (title,selector,param = "",checked = false) {
  return {title:title,object:this,selector:selector,param:param,checked:checked}
}
/**
 * 
 * @this {pinnerController}
 */
pinnerController.prototype.checkPopover = function () {
  if (this.popoverController) {this.popoverController.dismissPopoverAnimated(true);}
}
/** 
 * 更新卡片标题
 * 
 * 这个方法由 WebView 通过自定义 URL 调用
 * 负责更新 MarginNote 中卡片的标题
 * 
 * @param {string} cardId - 卡片的唯一标识符
 * @param {string} newTitle - 新的标题
 */
pinnerController.prototype.updateCardTitle = function(cardId, newTitle) {
  try {
    MNUtil.log("开始更新卡片标题: " + cardId + " -> " + newTitle)
    
    // 检查参数
    if (!cardId || !newTitle) {
      MNUtil.showHUD("参数不完整")
      return
    }
    
    // 获取卡片对象
    // 使用 MNNote.new 创建卡片对象
    let note = MNNote.new(cardId)
    
    if (!note) {
      MNUtil.showHUD("找不到卡片: " + cardId)
      
      // 通知网页显示错误
      // 使用 runJavaScript 替代 evaluateJavaScript
      self.runJavaScript(
        "showResult('找不到卡片', false)",
        self.webView
      )
      return
    }
    
    // 使用 undoGrouping 包装，使操作可以撤销
    MNUtil.undoGrouping(() => {
      // 更新卡片标题
      note.title = newTitle
      
      // 显示成功提示
      MNUtil.showHUD("标题已更新")
      
      // 通知网页显示成功信息
      // 注意：需要转义特殊字符
      let escapedTitle = newTitle.replace(/\\/g, '\\\\')  // 反斜杠要先转义
      escapedTitle = escapedTitle.replace(/'/g, "\\'")     // 单引号
      escapedTitle = escapedTitle.replace(/"/g, '\\"')     // 双引号
      escapedTitle = escapedTitle.replace(/\n/g, '\\n')    // 换行符
      
      let jsCode = `showResult('标题已更新为: ${escapedTitle}', true)`
      
      // 使用 runJavaScript 替代 evaluateJavaScript
      self.runJavaScript(jsCode, self.webView).then(() => {
        MNUtil.log("JavaScript 执行完成，标题更新成功")
      })
    })
    
  } catch (error) {
    MNUtil.showHUD("更新失败: " + error)
    MNUtil.log("更新卡片标题错误: " + error)
    
    // 通知网页显示错误
    // 转义错误信息中的特殊字符
    let escapedError = String(error).replace(/'/g, "\\'")
    
    // 使用 runJavaScript 替代 evaluateJavaScript
    self.runJavaScript(
      `showResult('更新失败: ${escapedError}', false)`,
      self.webView
    )
  }
}

pinnerController.prototype.setFrame = function (frame) {
  let lastFrame = frame
  this.view.frame = lastFrame
  this.currentFrame = lastFrame
}

pinnerController.prototype.init = function () {
  this.isFirst = true      // 标记是否是第一次显示
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

    // === 为 temporaryPinView 添加子视图 ===
    // 顶部操作按钮
    this.createButton("tempClearButton", "tempClearCards:", "temporaryPinView")
    MNButton.setConfig(this.tempClearButton, {
      color: "#e06c75", alpha: 0.8, opacity: 1.0, title: "🗑 清空", radius: 10, font: 15
    })

    this.createButton("tempRefreshButton", "tempRefreshCards:", "temporaryPinView")  
    MNButton.setConfig(this.tempRefreshButton, {
      color: "#457bd3", alpha: 0.8, opacity: 1.0, title: "🔄 刷新", radius: 10, font: 15
    })

    // 计数标签 - 使用禁用的按钮代替 UILabel
    this.createButton("tempCountLabel", "", "temporaryPinView")
    this.tempCountLabel.enabled = false  // 禁用交互
    this.tempCountLabel.backgroundColor = UIColor.clearColor()
    this.tempCountLabel.setTitleForState("共 0 张卡片", 0)
    MNButton.setConfig(this.tempCountLabel, {
      color: "#666666", alpha: 1.0, opacity: 1.0, font: 14
    })

    // 中间滚动视图 - 注意接收返回值
    this.tempCardScrollView = this.createScrollview("temporaryPinView", "#f5f5f5", 0.9)
    this.tempCardScrollView.layer.cornerRadius = 12
    this.tempCardScrollView.alwaysBounceVertical = true
    this.tempCardScrollView.showsVerticalScrollIndicator = true
    
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
        break;
      case "temporaryPinView":
        MNUtil.log("refresh temporaryPinView")
        this.refreshTemporaryPinCards()  // 刷新卡片列表
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
  
  // 顶部按钮和标签（检查存在性）
  if (this.tempClearButton) {
    this.tempClearButton.frame = {x: 10, y: 10, width: 70, height: 32}
  }
  if (this.tempRefreshButton) {
    this.tempRefreshButton.frame = {x: 85, y: 10, width: 70, height: 32}
  }
  if (this.tempCountLabel) {
    this.tempCountLabel.frame = {x: 165, y: 10, width: 120, height: 32}
  }
  
  // 中间滚动视图（留出右侧按钮空间）
  this.tempCardScrollView.frame = {x: 10, y: 50, width: width - 70, height: height - 65}
  
  // 右侧按钮（垂直排列，检查存在性）
  let rightX = width - 50
  if (this.tempSelectAllButton) {
    this.tempSelectAllButton.frame = {x: rightX, y: 50, width: 40, height: 40}
  }
  if (this.tempDeleteButton) {
    this.tempDeleteButton.frame = {x: rightX, y: 100, width: 40, height: 40}
  }
  if (this.tempCopyButton) {
    this.tempCopyButton.frame = {x: rightX, y: 150, width: 40, height: 40}
  }
}

/**
 * 刷新临时固定卡片列表
 */
pinnerController.prototype.refreshTemporaryPinCards = function() {
  // 初始化卡片行数组
  if (!this.tempCardRows) {
    this.tempCardRows = []
  }
  
  // 模拟数据
  let mockCards = [
    {id: "note001", title: "JavaScript 异步编程基础"},
    {id: "note002", title: "React Hooks 最佳实践"},
    {id: "note003", title: "TypeScript 类型体操入门"}
  ]
  
  // 更新计数（使用按钮的方法）
  if (this.tempCountLabel) {
    this.tempCountLabel.setTitleForState(`共 ${mockCards.length} 张卡片`, 0)
  }
  
  // 清空现有卡片（使用维护的数组）
  this.tempCardRows.forEach(view => {
    view.removeFromSuperview()
  })
  this.tempCardRows = []
  
  // 检查滚动视图是否存在
  if (!this.tempCardScrollView) return
  
  // 添加卡片行
  let yOffset = 10
  let scrollWidth = this.tempCardScrollView.frame.width
  
  mockCards.forEach((card, index) => {
    let cardRow = this.createTempCardRow(card, index, scrollWidth - 20)
    this.tempCardScrollView.addSubview(cardRow)
    this.tempCardRows.push(cardRow)  // 保存引用
    yOffset += 55
  })
  
  // 设置滚动区域
  this.tempCardScrollView.contentSize = {width: 0, height: yOffset + 10}
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
  
  // 添加序号和标题（使用禁用的按钮代替 UILabel）
  let titleButton = UIButton.buttonWithType(0)
  titleButton.setTitleForState(`${index + 1}. ${card.title || "未命名卡片"}`, 0)
  titleButton.titleLabel.font = UIFont.systemFontOfSize(15)
  titleButton.frame = {x: 10, y: 5, width: width - 70, height: 35}
  titleButton.enabled = false  // 禁用以模拟标签效果
  titleButton.setTitleColorForState(UIColor.blackColor(), 0)
  titleButton.contentHorizontalAlignment = 1  // 左对齐
  rowView.addSubview(titleButton)
  
  // 查看按钮
  let viewBtn = UIButton.buttonWithType(0)
  viewBtn.setTitleForState("👁", 0)
  viewBtn.frame = {x: width - 50, y: 7, width: 30, height: 30}
  viewBtn.backgroundColor = MNUtil.hexColorAlpha("#457bd3", 0.8)
  viewBtn.layer.cornerRadius = 5
  viewBtn.tag = index  // 用 tag 存储索引
  viewBtn.addTargetActionForControlEvents(this, "viewTempCard:", 1 << 6)
  rowView.addSubview(viewBtn)
  
  return rowView
}

