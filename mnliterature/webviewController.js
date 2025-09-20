/**
 * 文献管理视图控制器（精简版）
 * 
 * 保留 main.js 实际使用的功能：
 * - WebView 管理
 * - 关闭按钮和拖动手势
 * - 显示/隐藏动画
 * - WebView 与 JavaScript 交互
 */
let literatureController = JSB.defineClass('literatureController : UIViewController <NSURLConnectionDelegate, UIWebViewDelegate>', {
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
        self.createSettingView()  // TOOD: 待写
        // self.settingView.hidden = false  // 加载主 view 的时候就显示 settingView
      }
      self.settingViewLayout()  // TODO: 待写
      self.setButtonText()  // TODO: 待写
      self.setTextview()  // TODO: 待写


      /**
       * 开始创建按钮
       */
      self.createButton("moveButton","moveButtonTapped:")  // 创建移动按钮
      self.moveButton.clickDate = 0  // 用于点击时间跟踪
      MNButton.setColor(self.moveButton, "#3a81fb",0.5)
      MNButton.addPanGesture(self.moveButton, self, "onMoveGesture:")  // 为移动按钮添加拖动手势

      // === 关闭按钮 ===
      self.closeButton = MNButton.new({
        image: literatureUtils.mainPath + `/close.png`,
        radius: 12,
        color: "#e06c75",
        opacity: .8,
      }, self.view)
      self.closeButton.addClickAction(self, "closeButtonTapped:")
      
      // 为关闭按钮添加拖动手势
      self.moveGesture = new UIPanGestureRecognizer(self, "onMoveGesture:")
      self.closeButton.addGestureRecognizer(self.moveGesture)
      self.moveGesture.view.hidden = false
      self.moveGesture.addTargetAction(self, "onMoveGesture:")

    
      // === 创建 WebView ===
      self.webView = new UIWebView({x: 10, y: 50, width: 240, height: 280})
      self.webView.backgroundColor = UIColor.whiteColor()
      self.webView.delegate = self
      self.webView.scalesPageToFit = true
      self.view.addSubview(self.webView)
      self.webViewLoaded = false
    
    } catch (error) {
      MNUtil.showHUD("Error in viewDidLoad: "+error)  
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
    let viewFrame = self.view.bounds;
    let xLeft = viewFrame.x
    let width    = viewFrame.width
    let height   = viewFrame.height
    self.closeButton.frame = {x: xLeft+225,y: 5,width: 30, height: 30};
    self.moveButton.frame = {x: width*0.5-75, y: 0,  width: 150, height: 16,};
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

      if (config.scheme === "mnliterature") {
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
        {title:'😄 我是?', object:self, selector:'showName:', param:"夏康玮"}
      ];
      self.popoverController = MNUtil.getPopoverAndPresent(button,commandTable,200,1)
    return
  },

  showName: function(name) {
    MNUtil.showHUD("我是" + name)
  },
  
});

// ========== 原型方法 ==========

/**
 * 加载 HTML 文件到 WebView
 */
literatureController.prototype.loadHTMLFile = function() {
  try {
    let htmlPath = literatureUtils.mainPath + "/index.html"
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
literatureController.prototype.sendCardInfoToWebView = function(note) {
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
 * @this {literatureController}
 */
literatureController.prototype.show = function (frame) {
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
  // this.literatureView.hidden = true     // 隐藏子视图
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
      // this.literatureView.hidden = false      // 显示主功能视图
      // this.settingView.hidden = true          // 确保设置视图隐藏
      // MNButton.setColor(this.settingButton, "#89a6d5")  // 重置设置按钮颜色
      // this.settingButton.open = false         // 重置设置按钮状态
      this.refreshView(literatureConfig.config.source)  // 刷新视图内容
    }
  )
}
literatureController.prototype.setAllButton = function (hidden) {
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
literatureController.prototype.hide = function (frame) {
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
  // this.literatureView.hidden = true
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
 * @this {literatureController}
 * @returns {UITextView}
 */
literatureController.prototype.creatTextView = function (superview="view",color="#c0bfbf",alpha=0.9) {
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
 * @this {literatureController}
 */
literatureController.prototype.refreshView = function (source){
}

literatureController.prototype.createView = function (superview="view",color="#9bb2d6",alpha=0.8) {
  let view = UIView.new()
  view.backgroundColor = MNUtil.hexColorAlpha(color,alpha)
  view.layer.cornerRadius = 12
  this[superview].addSubview(view)
  return view
}

/**
 * @this {literatureController}
 */
literatureController.prototype.createWebviewInput = function (superView,content) {
  try {
    this.webviewInput = new UIWebView(this.view.bounds);
    this.webviewInput.backgroundColor = MNUtil.hexColorAlpha("#c0bfbf",0.8)
    this.webviewInput.scalesPageToFit = false;
    this.webviewInput.autoresizingMask = (1 << 1 | 1 << 4);
    this.webviewInput.delegate = this;
    // this.webviewInput.setValueForKey("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1.1 Safari/605.1.15","User-Agent")
    this.webviewInput.scrollView.delegate = this;
    this.webviewInput.layer.cornerRadius = 8;
    this.webviewInput.layer.masksToBounds = true;
    this.webviewInput.layer.borderColor = MNUtil.hexColorAlpha("#9bb2d6",0.8);
    this.webviewInput.layer.borderWidth = 0
    this.webviewInput.layer.opacity = 0.9
    // this.webviewInput.loadFileURLAllowingReadAccessToURL(
    //   NSURL.fileURLWithPath(this.mainPath + '/test.html'),
    //   NSURL.fileURLWithPath(this.mainPath + '/')
    // );
    this.webviewInput.loadHTMLStringBaseURL(literatureUtils.html(content))
  } catch (error) {
    MNUtil.showHUD(error)
  }
  if (superView) {
    this[superView].addSubview(this.webviewInput)
  }
}


/** @this {literatureController} */
literatureController.prototype.runJavaScript = async function(script,webview) {
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
 * @this {literatureController}
 */
literatureController.prototype.setWebviewContent = function (content) {
  this.webviewInput.loadHTMLStringBaseURL(literatureUtils.html(content))
}
/**
 * @this {literatureController}
 */
literatureController.prototype.getWebviewContent = async function () {
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
 * @this {literatureController}
 * @returns 
 */
literatureController.prototype.tableItem = function (title,selector,param = "",checked = false) {
  return {title:title,object:this,selector:selector,param:param,checked:checked}
}
/**
 * 
 * @this {literatureController}
 */
literatureController.prototype.checkPopover = function () {
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
literatureController.prototype.updateCardTitle = function(cardId, newTitle) {
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

literatureController.prototype.setFrame = function (frame) {
  let lastFrame = frame
  this.view.frame = lastFrame
  this.currentFrame = lastFrame
}

literatureController.prototype.init = function () {
  // === 初始化状态变量 ===
  self.moveDate = Date.now()  // 用于拖动手势的时间跟踪
}

literatureController.prototype.settingViewLayout = function () {
}
literatureController.prototype.refreshLayout = function () {
}
literatureController.prototype.setButtonText = function () {
}
literatureController.prototype.setTextview = function () {
}
literatureController.prototype.createSettingView = function () {
}

literatureController.prototype.createButton = function (buttonName, targetAction, superview) {
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
// literatureController.prototype. = function () {
// }