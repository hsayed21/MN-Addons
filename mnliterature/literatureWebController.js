// ========================================
// Literature Web Controller
// 文献管理 WebView 控制器
// 参考 mnknowledgebase 的架构实现
// ========================================

var literatureWebController = JSB.defineClass('literatureWebController : UIViewController <UIWebViewDelegate>', {
  // ========================================
  // 生命周期方法
  // ========================================

  viewDidLoad: function() {
    try {
      MNUtil.log("[literatureWebController] viewDidLoad start")
      // 初始化状态
      self.init()

      // 恢复窗口位置（从 NSUserDefaults 读取）
      let savedFrameStr = NSUserDefaults.standardUserDefaults().objectForKey("Literature_WindowFrame")
      let initialFrame = savedFrameStr
        ? JSON.parse(savedFrameStr)
        : {x: 50, y: 30, width: 720, height: 720}

      self.view.frame = initialFrame
      self.lastFrame = self.view.frame
      self.currentFrame = self.view.frame

      // 创建 WebView（调整位置给顶部按钮留空间）
      self.webView = new UIWebView({x: 10, y: 25, width: 700, height: 685})
      self.webView.backgroundColor = UIColor.whiteColor()
      self.webView.delegate = self
      self.webView.scalesPageToFit = true
      self.view.addSubview(self.webView)
      self.webViewLoaded = false

      // 创建移动按钮
      self.createButton("moveButton", "moveButtonTapped:")
      self.moveButton.clickDate = 0
      MNButton.setColor(self.moveButton, "#3a81fb", 0.5)
      MNButton.addPanGesture(self.moveButton, self, "onMoveGesture:")

      // 创建关闭按钮
      self.createButton("closeButton", "closeButtonTapped:")
      self.closeButton.layer.cornerRadius = 10
      MNButton.setColor(self.closeButton, "#e06c75")

      // 创建调整大小按钮
      self.createButton("resizeButton")
      self.resizeButton.layer.cornerRadius = 10
      self.resizeButton.backgroundColor = UIColor.clearColor()
      MNButton.addPanGesture(self.resizeButton, self, "onResizeGesture:")

      // 初始化 Mini 模式状态
      self.miniMode = false

      MNUtil.log("[literatureWebController] viewDidLoad end")
    } catch (error) {
      // 记录更详细的错误，避免实例创建时静默返回 undefined
      MNUtil.showHUD("初始化失败: " + error)
      try {
        literatureUtils.addErrorLog(error, "literatureWebController.viewDidLoad")
      } catch (_) {}
      MNUtil.copyJSON(error)
    }
  },

  viewWillLayoutSubviews: function() {
    try {
      // miniMode 时不重新布局
      if (self.miniMode) {
        return
      }

      // 如果按钮还未创建，跳过布局
      if (!self.moveButton || !self.closeButton || !self.resizeButton || !self.webView) {
        return
      }

      let viewFrame = self.view.bounds
      let width = viewFrame.width
      let height = viewFrame.height

      // 布局移动按钮
      self.moveButton.frame = {x: width * 0.5 - 75, y: 0, width: 150, height: 16}

      // 布局关闭按钮（右上角）
      self.closeButton.frame = {x: width - 40, y: 5, width: 30, height: 30}

      // 布局调整大小按钮（右下角）
      self.resizeButton.frame = {x: width - 30, y: height - 40, width: 30, height: 30}

      // 布局 WebView
      self.webView.frame = {x: 10, y: 25, width: width - 20, height: height - 35}

    } catch (error) {
      MNUtil.showHUD("布局失败: " + error)
    }
  },

  viewWillDisappear: function(animated) {
    // 清理定时器
    if (self.viewTimer) {
      self.viewTimer.invalidate()
      self.viewTimer = undefined
    }
  },

  // ========================================
  // UIWebViewDelegate - URL 拦截
  // ========================================

  webViewShouldStartLoadWithRequestNavigationType: function(webView, request, type) {
    try {
      let config = MNUtil.parseURL(request)

      // 拦截自定义 scheme
      if (config && config.scheme === "mnliterature") {
        self.executeAction(config, true)
        return false
      }

      return true
    } catch (error) {
      MNUtil.showHUD("URL处理错误: " + error)
      return false
    }
  },

  // ========================================
  // WebView 加载事件
  // ========================================

  webViewDidFinishLoad: function(webView) {
    MNUtil.log("=== webViewDidFinishLoad 被调用 ===")
    MNUtil.log("webView URL: " + webView.request.URL())

    // 标记 WebView 已加载完成
    self.webViewLoaded = true
    MNUtil.log("webViewLoaded 设置为 true")

    // 同步状态到 WebView
    MNUtil.delay(0.15).then(() => {
      try {
        let script = `
          if (typeof state !== 'undefined') {
            console.log('[Literature] WebView 已加载');
          }
        `
        self.webView.evaluateJavaScript(script)
        MNUtil.log("【同步状态】已向 WebView 发送同步脚本")
      } catch (error) {
        MNUtil.log("【同步状态】失败: " + error)
      }
    })

    // 如果窗口已经显示，立即刷新数据
    if (!self.view.hidden && self.currentHTMLType === 'manager') {
      MNUtil.log("文献管理界面已显示，立即刷新数据")
      MNUtil.delay(0.1).then(async () => {
        await self.refreshAllData()
      })
    }
  },

  webViewDidFailLoadWithError: function(webView, error) {
    MNUtil.showHUD("页面加载失败")
  },

  // ========================================
  // 按钮响应方法
  // ========================================

  /**
   * 移动按钮点击响应
   */
  moveButtonTapped: async function(button) {
    try {
      // Mini 模式下单击恢复
      if (self.miniMode) {
        MNUtil.log("Mini 模式点击，准备恢复")
        self.fromMinimode()
        return
      }

      // 正常模式下显示功能菜单
      let commandTable = [
        {title: '🔧  菜单栏待丰富中', object: self, selector: '', param: ""},
      ]

      MNUtil.showMenu(commandTable, self.moveButton)

    } catch (error) {
      MNUtil.showHUD("移动按钮点击失败: " + error)
    }
  },

  /**
   * 关闭按钮点击响应
   */
  closeButtonTapped: function() {
    try {
      self.hide()
    } catch (error) {
      MNUtil.showHUD("关闭失败: " + error)
    }
  },

  // ========================================
  // 手势处理
  // ========================================

  /**
   * 移动手势处理
   */
  onMoveGesture: function(gesture) {
    try {
      // 忽略动画中的手势
      if (self.onAnimate) return

      let locationToMN = gesture.locationInView(MNUtil.studyView)

      // 手势开始
      if (gesture.state === 1) {
        self.lastFrame = self.view.frame
        let locationToButton = gesture.locationInView(self.moveButton)
        self.locationToBrowser = {
          x: self.view.frame.x + locationToButton.x,
          y: self.view.frame.y + locationToButton.y
        }
      }

      let frame = self.view.frame

      // 边缘吸附检测（转为 Mini 模式）
      let studyFrame = MNUtil.studyView.bounds
      if (!self.miniMode) {
        // 左边缘
        if (locationToMN.x < 40) {
          self.toMinimode(
            MNUtil.genFrame(0, locationToMN.y - 20, 40, 40),
            self.lastFrame
          )
          return
        }
        // 右边缘
        if (locationToMN.x > studyFrame.width - 40) {
          self.toMinimode(
            MNUtil.genFrame(studyFrame.width - 40, locationToMN.y - 20, 40, 40),
            self.lastFrame
          )
          return
        }
      }

      // 正常拖动
      let x = locationToMN.x - self.locationToBrowser.x + self.lastFrame.x
      let y = locationToMN.y - self.locationToBrowser.y + self.lastFrame.y
      self.setFrame(x, y, frame.width, frame.height)

      // 手势结束，保存位置
      if (gesture.state === 3) {
        self.saveWindowFrame()
      }

    } catch (error) {
      MNUtil.showHUD("移动手势处理失败: " + error)
    }
  },

  /**
   * 调整大小手势处理
   */
  onResizeGesture: function(gesture) {
    try {
      // 忽略动画中的手势
      if (self.onAnimate) return

      // 手势开始
      if (gesture.state === 1) {
        self.lastFrame = self.view.frame
      }

      let locationToMN = gesture.locationInView(MNUtil.studyView)
      let frame = self.view.frame

      // 计算新的宽高
      let newWidth = Math.max(400, locationToMN.x - frame.x + 20)
      let newHeight = Math.max(300, locationToMN.y - frame.y + 20)

      self.setFrame(frame.x, frame.y, newWidth, newHeight)

      // 手势结束，保存位置
      if (gesture.state === 3) {
        self.saveWindowFrame()
      }

    } catch (error) {
      MNUtil.showHUD("调整大小失败: " + error)
    }
  },

  // ========================================
  // Mini 模式
  // ========================================

  /**
   * 缩小为 mini 模式
   */
  toMinimode: function(targetFrame, previousFrame) {
    try {
      self.miniMode = true
      self.lastFrame = previousFrame

      // 隐藏所有控件
      self.webView.hidden = true
      self.closeButton.hidden = true
      self.resizeButton.hidden = true

      // 动画
      self.onAnimate = true
      MNUtil.animate(() => {
        self.view.frame = targetFrame
      }).then(() => {
        self.onAnimate = false

        // 显示小图标按钮
        self.moveButton.frame = MNUtil.genFrame(0, 0, 40, 40)
        self.moveButton.hidden = false
        self.moveButton.setTitleForState("📚", 0)
      })

    } catch (error) {
      MNUtil.showHUD("Mini 模式失败: " + error)
    }
  },

  /**
   * 从 mini 模式恢复
   */
  fromMinimode: function() {
    try {
      if (!self.miniMode) return

      // 动画恢复
      let preOpacity = self.view.layer.opacity
      self.view.layer.opacity = 0
      self.onAnimate = true

      MNUtil.animate(() => {
        self.view.layer.opacity = preOpacity
        self.view.frame = self.lastFrame
      }).then(() => {
        self.onAnimate = false

        // 显示所有控件
        self.webView.hidden = false
        self.closeButton.hidden = false
        self.resizeButton.hidden = false
        self.miniMode = false

        // 重新布局
        self.viewWillLayoutSubviews()

        // 刷新数据
        MNUtil.delay(0.1).then(async () => {
          await self.refreshAllData()
        })
      })

    } catch (error) {
      MNUtil.showHUD("恢复失败: " + error)
    }
  },

  // ========================================
  // HTML 文件加载
  // ========================================

  /**
   * 加载 HTML 文件
   */
  loadHTMLFile: function(type) {
    try {
      // 防止重复加载（性能优化）
      if (self.currentHTMLType === type && self.webViewLoaded) {
        MNUtil.log("【优化】" + type + ".html 已加载，跳过重复加载")
        return
      }

      // 构建 HTML 文件路径
      let htmlPath = literatureUtils.mainPath + "/" + type + ".html"

      // 检查文件存在
      if (!MNUtil.isfileExists(htmlPath)) {
        MNUtil.showHUD("HTML 文件不存在: " + htmlPath)
        return
      }

      // 创建 URL 请求
      let htmlURL = NSURL.fileURLWithPath(htmlPath)
      let request = NSURLRequest.requestWithURL(htmlURL)

      // 加载 HTML
      self.webView.loadRequest(request)
      self.currentHTMLType = type
      self.webViewLoaded = false

      MNUtil.log("开始加载 HTML: " + htmlPath)

    } catch (error) {
      MNUtil.showHUD("加载 HTML 失败: " + error)
      MNUtil.copyJSON(error)
    }
  },

  // ========================================
  // JavaScript 执行
  // ========================================

  /**
   * 执行 JavaScript 代码
   */
  runJavaScript: async function(script, delay) {
    // 检查 WebView 状态
    if (!self.webView || !self.webView.window) {
      MNUtil.log("错误: webView 未就绪!")
      return undefined
    }

    return new Promise((resolve, reject) => {
      if (delay) {
        // 延迟执行
        self.viewTimer = NSTimer.scheduledTimerWithTimeInterval(delay, true, () => {
          self.webView.evaluateJavaScript(script, (result) => {
            resolve(MNUtil.isNSNull(result) ? undefined : result)
          })
        })
      } else {
        // 立即执行
        self.webView.evaluateJavaScript(script, (result) => {
          resolve(MNUtil.isNSNull(result) ? undefined : result)
        })
      }
    })
  },

  // ========================================
  // 动作执行器（处理 URL Scheme 请求）
  // ========================================

  /**
   * 执行来自 WebView 的动作请求
   */
  executeAction: async function(config, closedWebView) {
    try {
      MNUtil.log("执行动作: " + config.host)

      switch (config.host) {
        case "refreshData":
          // 刷新所有数据
          await self.refreshAllData()
          break

        case "openLiterature":
          // 打开文献详情
          let litId = config.params.id
          // TODO: 实现打开文献详情的逻辑
          MNUtil.showHUD("打开文献: " + litId)
          break

        case "log":
          // 记录日志
          let message = decodeURIComponent(config.params.message || "")
          MNUtil.log("[HTML] " + message)
          break

        default:
          MNUtil.log("未知动作: " + config.host)
          break
      }

    } catch (error) {
      MNUtil.showHUD("执行动作失败: " + error)
      MNUtil.copyJSON(error)
    }
  },

  // ========================================
  // 数据刷新（TODO: 待实现具体逻辑）
  // ========================================

  /**
   * 刷新所有数据
   */
  refreshAllData: async function() {
    try {
      MNUtil.log("开始刷新文献数据...")

      // TODO: 加载文献数据
      // 1. 读取索引清单
      // 2. 加载分片数据
      // 3. 加载增量索引
      // 4. 合并数据
      // 5. 发送到 WebView

      // 暂时使用占位数据
      let placeholderData = {
        metadata: {
          totalEntries: 0,
          updateTime: Date.now()
        },
        entries: []
      }

      // 发送到 WebView
      let script = `
        if (typeof window.LiteratureBridge !== 'undefined' && window.LiteratureBridge.loadData) {
          window.LiteratureBridge.loadData(${JSON.stringify(placeholderData)});
        }
      `

      await self.runJavaScript(script)

      MNUtil.log("文献数据刷新完成")

    } catch (error) {
      MNUtil.showHUD("刷新数据失败: " + error)
      MNUtil.copyJSON(error)
    }
  },

  // ========================================
  // 辅助方法
  // ========================================

  /**
   * 设置窗口大小和位置
   */
  setFrame: function(x, y, width, height) {
    if (arguments.length === 1) {
      self.view.frame = x
    } else {
      self.view.frame = {x: x, y: y, width: width, height: height}
    }
  },

  /**
   * 保存窗口位置到 NSUserDefaults
   */
  saveWindowFrame: function() {
    try {
      let frame = self.view.frame
      let frameData = {
        x: frame.x,
        y: frame.y,
        width: frame.width,
        height: frame.height
      }

      NSUserDefaults.standardUserDefaults().setObjectForKey(
        JSON.stringify(frameData),
        "Literature_WindowFrame"
      )

      MNUtil.log("窗口位置已保存")

    } catch (error) {
      MNUtil.log("保存窗口位置失败: " + error)
    }
  },

  /**
   * 显示浮动窗口（参考 mnknowledgebase/knowledgebaseWebController.js:1003-1056）
   * @param {Object} beginFrame - 动画起始位置（可选）
   * @param {Object} endFrame - 最终位置和大小（可选）
   */
  show: async function(beginFrame, endFrame) {
    try {
      MNUtil.log("【show() 开始】beginFrame=" + (beginFrame ? "有" : "无") + ", endFrame=" + (endFrame ? "有" : "无"))

      // 如果没有指定 endFrame，尝试加载上次保存的窗口位置
      let savedFrame = null
      if (!endFrame) {
        try {
          let savedFrameStr = NSUserDefaults.standardUserDefaults().objectForKey("Literature_WindowFrame")
          if (savedFrameStr) {
            savedFrame = JSON.parse(savedFrameStr)
          }
        } catch (error) {
          MNUtil.log("【show()】加载窗口 frame 失败: " + error)
        }
      }

      // 确定最终位置：传入的 > 保存的 > 默认的
      let targetFrame = endFrame || savedFrame || { x: 50, y: 50, width: 720, height: 720 }
      let studyFrame = MNUtil.studyView.frame

      // 约束 frame 在屏幕范围内
      targetFrame.height = MNUtil.constrain(targetFrame.height, 100, studyFrame.height)
      targetFrame.width = MNUtil.constrain(targetFrame.width, 300, studyFrame.width)
      targetFrame.x = MNUtil.constrain(targetFrame.x, 0, studyFrame.width - targetFrame.width)
      targetFrame.y = MNUtil.constrain(targetFrame.y, 0, studyFrame.height - targetFrame.height)

      // 设置起始位置和透明度
      if (beginFrame) {
        self.view.frame = beginFrame
      }
      self.view.layer.opacity = 0.2
      self.view.hidden = false  // 关键：设置为显示

      // 动画显示
      MNUtil.animate(() => {
        self.view.layer.opacity = 1.0
        self.view.frame = targetFrame
      }).then(async () => {
        MNUtil.studyView.bringSubviewToFront(self.view)  // 置顶

        // 显示完成后自动刷新数据
        if (self.webViewLoaded) {
          await self.refreshAllData()
        }
      })

    } catch (error) {
      MNUtil.showHUD("显示失败: " + error)
      MNUtil.copyJSON(error)
    }
  },

  /**
   * 隐藏浮动窗口（参考 mnknowledgebase/knowledgebaseWebController.js:1061-1105）
   * @param {Object} frame - 动画终点位置（可选）
   */
  hide: function(frame) {
    try {
      // 保存当前位置
      let preFrame = self.view.frame

      if (preFrame.width < 200) {
        preFrame.width = Math.max(preFrame.width, 300)
      }
      self.view.frame = preFrame

      // 保存窗口 frame 到 userDefaults
      try {
        let frameToSave = {
          x: preFrame.x,
          y: preFrame.y,
          width: preFrame.width,
          height: preFrame.height
        }
        NSUserDefaults.standardUserDefaults().setObjectForKey(
          JSON.stringify(frameToSave),
          "Literature_WindowFrame"
        )
      } catch (error) {
        MNUtil.log("【hide()】保存窗口 frame 失败: " + error)
      }

      // 标记动画状态
      self.onAnimate = true
      let preOpacity = self.view.layer.opacity

      // 动画隐藏
      MNUtil.animate(() => {
        self.view.layer.opacity = 0.2
        if (frame) {
          self.view.frame = frame
          self.currentFrame = frame
        }
      }, 0.3).then(() => {
        self.onAnimate = false
        self.view.hidden = true  // 设置为隐藏
        self.view.layer.opacity = preOpacity
        self.view.frame = preFrame
        self.currentFrame = preFrame
      })

    } catch (error) {
      MNUtil.showHUD("隐藏失败: " + error)
    }
  },

  /**
   * 初始化状态
   */
  init: function() {
    try {
      MNUtil.log("[literatureWebController] init")
    } catch (_) {}
    // 初始化变量
    self.webViewLoaded = false
    self.currentHTMLType = null
    self.miniMode = false
    self.onAnimate = false
  },

  /**
   * 创建按钮
   */
  createButton: function(buttonName, action) {
    self[buttonName] = UIButton.buttonWithType(0)
    self[buttonName].setTitleForState(buttonName, 0)
    self[buttonName].titleLabel.font = UIFont.systemFontOfSize(14)

    if (action) {
      self[buttonName].addTargetActionForControlEvents(self, action, 1 << 6)
    }

    self.view.addSubview(self[buttonName])
  }
})

// ========================================
// 导出控制器
// ========================================
if (typeof module !== 'undefined') {
  module.exports = literatureWebController
}
