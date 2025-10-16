// ========================================
// Knowledge Base Web Controller
// 知识库 WebView 控制器
// ========================================

// 定义控制器类
var knowledgebaseWebController = JSB.defineClass('knowledgebaseWebController : UIViewController <UIWebViewDelegate>', {
  // ========================================
  // 生命周期方法
  // ========================================

  viewDidLoad: function() {
    try {
      // 初始化状态
      self.init()

      // 设置初始 frame
      self.view.frame = {x: 50, y: 30, width: 720, height: 720}
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
      MNButton.setImage(self.closeButton, self.closeImage)
      MNButton.setColor(self.closeButton, "#e06c75")

      // 创建调整大小按钮
      self.createButton("resizeButton")
      self.resizeButton.layer.cornerRadius = 10
      self.resizeButton.backgroundColor = UIColor.clearColor()
      MNButton.setImage(self.resizeButton, self.resizeImage)
      MNButton.setColor(self.resizeButton, "#457bd3")
      MNButton.addPanGesture(self.resizeButton, self, "onResizeGesture:")

    } catch (error) {
      MNUtil.showHUD("初始化失败: " + error)
      MNUtil.copyJSON(error)
    }
  },

  viewWillLayoutSubviews: function() {
    try {
      // miniMode 时不重新布局
      if (self.miniMode) {
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
      if (config && config.scheme === "mnknowledgebase") {
        self.executeAction(config, true)  // 委托给集中处理方法
        return false
      }

      return true;
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

    // 🆕 新增：如果窗口已经显示，立即刷新数据
    // 这解决了首次打开时数据不刷新的问题
    if (!self.view.hidden) {
      MNUtil.log("窗口已显示，立即刷新数据")
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
      self.popoverController = MNUtil.getPopoverAndPresent(button, commandTable, 200, 1)
    } catch (error) {
      MNUtil.showHUD("操作失败")
      MNUtil.copyJSON(error)
    }
  },

  /**
   * 关闭按钮响应
   */
  closeButtonTapped: function() {
    if (self.addonBar) {
      self.hide(self.addonBar.frame)
    } else {
      self.hide()
    }
  },

  // ========================================
  // 手势处理方法
  // ========================================

  /**
   * 拖动手势处理（带边缘吸附功能）
   */
  onMoveGesture: function(gesture) {
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

    // 计算新位置
    let location = {
      x: locationToMN.x - self.locationToButton.x - gesture.view.frame.x,
      y: locationToMN.y - self.locationToButton.y - gesture.view.frame.y
    }

    let frame = self.view.frame
    let studyFrame = MNUtil.studyView.bounds
    let y = MNUtil.constrain(location.y, 0, studyFrame.height - 15)
    let x = location.x

    // 边缘检测逻辑
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
      // mini 模式的处理
      if (locationToMN.x < 50) {
        self.view.frame = MNUtil.genFrame(0, locationToMN.y - 20, 40, 40)
        return
      } else if (locationToMN.x > studyFrame.width - 50) {
        self.view.frame = MNUtil.genFrame(studyFrame.width - 40, locationToMN.y - 20, 40, 40)
        return
      } else if (locationToMN.x > 50) {
        // 从 mini 模式恢复
        let preOpacity = self.view.layer.opacity
        self.view.layer.opacity = 0
        self.setAllButton(true)
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
          self.setAllButton(false)
          self.moveButton.setTitleForState("", 0)
        })
        self.miniMode = false
        return
      }
    }

    // 正常拖动
    self.setFrame(x, y, frame.width, frame.height)
  },

  /**
   * 调整大小手势处理
   */
  onResizeGesture: function(gesture) {
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
        let locationDiff = {x: locationToMN.x - self.originalLocationToMN.x, y: locationToMN.y - self.originalLocationToMN.y}
        let frame = self.view.frame
        let studyFrame = MNUtil.studyView.bounds

        // 计算新的宽度和高度
        frame.width = self.originalFrame.width + locationDiff.x
        frame.height = self.originalFrame.height + locationDiff.y

        // 最小尺寸限制
        if (frame.width <= 300) {
          frame.width = 300
        }
        if (frame.height <= 200) {
          frame.height = 200
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
      }
    } catch (error) {
      MNUtil.showHUD("调整大小失败: " + error)
      MNUtil.copyJSON(error)
    }
  }
})

knowledgebaseWebController.prototype.loadHTMLFile = function() {
  try {
    MNUtil.log("=== loadHTMLFile 开始 ===")
    let htmlPath = KnowledgeBaseConfig.mainPath + "/search.html"
    MNUtil.log("HTML 路径: " + htmlPath)

    // 检查文件是否存在
    if (!MNUtil.isfileExists(htmlPath)) {
      MNUtil.log("错误: HTML 文件不存在!")
      MNUtil.showHUD("HTML 文件不存在: " + htmlPath)
      return
    }

    let htmlURL = NSURL.fileURLWithPath(htmlPath)
    MNUtil.log("HTML URL: " + htmlURL)

    let request = NSURLRequest.requestWithURL(htmlURL)
    MNUtil.log("NSURLRequest 创建成功")

    this.webView.loadRequest(request)
    MNUtil.log("loadRequest 调用成功,等待加载完成...")
  } catch (error) {
    MNUtil.showHUD("加载 HTML 失败: " + error)
    MNUtil.log("加载 HTML 错误: " + error)
    MNUtil.copyJSON(error)
  }
}

// ========================================
// 核心方法 - 动作执行器
// ========================================

/**
 * 集中处理所有来自 HTML 的动作请求
 * @param {Object} config - MNUtil.parseURL 解析的配置对象
 * @param {string} config.scheme - URL scheme (mnknowledgebase)
 * @param {string} config.host - 动作名称
 * @param {Object} config.params - 参数对象
 */
knowledgebaseWebController.prototype.executeAction = async function(config, closedWebView = false) {
  try {
    let targetNoteId = config.params.id
    let targetNote = MNNote.new(targetNoteId)
    let focusNote = MNNote.getFocusNote()
    let success = false
    if (!targetNote) { return }
    switch (config.host) {
      case "focusCardInMindMap":
        // 定位卡片到脑图
        await this.focusCardInMindMap(targetNoteId)
        success = true
        break

      case "focusCardInFloatMindMap":
        // 聚焦到文档位置
        await this.focusCardInFloatMindMap(targetNoteId)
        success = true
        break

      case "copyMarkdownLink":  // 调用 copyMarkdownLinkWithQuickPhrases 复制卡片行内链接
        await this.copyMarkdownLink(targetNoteId)
        success = true
        break;

      case "copyNoteURL":  // 复制卡片 URL
        await this.copyNoteURL(targetNoteId)
        success = true
        break;

      case 'mergeFocusNoteToTargetNoteExcerptPart':
        MNUtil.undoGrouping(()=>{
          if (!focusNote) {
            MNUtil.showHUD("请先选中一个卡片")
            return 
          }
          KnowledgeBaseTemplate.mergeTitleLinkWords(targetNote, focusNote); // 合并标题(去重)
          focusNote.title = ""
          focusNote.mergeInto(targetNote);
          KnowledgeBaseTemplate.autoMoveNewContentToField(targetNote, "摘录");
          success = true
        })
        break;

      case 'clearTitleAndMergeFocusNoteToTargetNoteExcerptPart':
        MNUtil.undoGrouping(()=>{
          if (!focusNote) {
            MNUtil.showHUD("请先选中一个卡片")
            return 
          }
          focusNote.title = ""
          focusNote.mergeInto(targetNote);
          KnowledgeBaseTemplate.autoMoveNewContentToField(targetNote, "摘录");
          success = true
        })
        break;

      case 'bidirectionalLinkFromeFocusNoteToTargetNote':
        MNUtil.undoGrouping(()=>{
          if (!focusNote) {
            MNUtil.showHUD("请先选中一个卡片")
            return 
          }
          focusNote.appendNoteLink(targetNote, "Both")
          KnowledgeBaseTemplate.removeDuplicateLinksInLastField(targetNote)  // 链接去重
          focusNote.focusInMindMap(0.5)
          success = true
        })
        break;

      case 'moveFocusNoteToTargetNoteAsChild':
        MNUtil.undoGrouping(()=>{
          if (!focusNote) {
            MNUtil.showHUD("请先选中一个卡片")
            return 
          }
          targetNote.addChild(focusNote);
          success = true
        })
        break;

      case 'moveFocusNoteToTargetNoteAsChildAndLocate':
         MNUtil.undoGrouping(()=>{
          if (!focusNote) {
            MNUtil.showHUD("请先选中一个卡片")
            return 
          }
          targetNote.addChild(focusNote);
          focusNote.focusInMindMap(0.5)
          success = true
        })
        break;

      case 'addTemplateToTargetNoteAndMoveFocusNoteAsChild':
        try {
          if (!focusNote) {
            MNUtil.showHUD("请先选中一个卡片")
            return 
          }
          let classificationNote = await KnowledgeBaseTemplate.addTemplate(targetNote, false);
          // await MNUtil.delay(2)
          if (classificationNote) {
            classificationNote.addChild(focusNote);
            success = true
          } else {
            MNLog.log("未找到新卡片");
          }
        } catch (error) {
          MNLog.error("新建模板失败: " + error.message);
        }
        break;

      case 'addTemplateToTargetNoteAndMoveFocusNoteAsChildAndLocate':
        try {
          if (!focusNote) {
            MNUtil.showHUD("请先选中一个卡片")
            return 
          }
          let classificationNote = await KnowledgeBaseTemplate.addTemplate(targetNote, false);
          if (classificationNote) {
            classificationNote.addChild(focusNote);
            success = true
            focusNote.focusInMindMap(0.5)
          } else {
            MNLog.log("未找到新卡片");
          }
        } catch (error) {
          MNLog.error("新建模板失败: " + error.message);
        }
        break;
      case "refreshAllData":
        // 刷新所有数据
        MNUtil.showHUD("正在刷新数据...")
        await this.refreshAllData()
        MNUtil.showHUD("数据刷新完成")
        break;
      case "ready":
        // HTML 初始化完成信号
        MNUtil.showHUD("知识库搜索已就绪")
        break

      case "htmlLog":
        // HTML 前端发送的日志
        let message = config.params.message || "无消息"
        MNLog.log(message)
        break

      default:
        MNUtil.showHUD("未知动作: " + config.host)
    }
    if (closedWebView && success) {
      if (this.addonBar) {
        this.hide(this.addonBar.frame)
      } else {
        this.hide()
      }
    }
  } catch (error) {
    MNUtil.showHUD("执行动作失败: " + error)
    MNUtil.copyJSON(error)
  }
}

// ========================================
// Native → JS 通信
// ========================================

/**
 * 执行 JavaScript 代码
 * @param {string} script - 要执行的 JS 代码
 * @param {number} delay - 延迟执行时间(秒),可选
 * @returns {Promise} 返回执行结果
 */
knowledgebaseWebController.prototype.runJavaScript = async function(script, delay) {
  MNUtil.log("=== runJavaScript 被调用 ===")
  MNUtil.log("脚本前100个字符: " + script.substring(0, 100))
  MNUtil.log("延迟执行: " + (delay || "否"))

  if (!this.webView || !this.webView.window) {
    MNUtil.log("错误: webView 或 webView.window 不存在!")
    MNUtil.log("webView: " + this.webView)
    MNUtil.log("webView.window: " + (this.webView ? this.webView.window : "N/A"))
    return undefined
  }

  MNUtil.log("webView 状态正常,准备执行 JavaScript")

  return new Promise((resolve, reject) => {
    if (delay) {
      // 使用定时器延迟执行
      MNUtil.log("使用定时器延迟 " + delay + " 秒执行")
      this.viewTimer = NSTimer.scheduledTimerWithTimeInterval(delay, true, () => {
        MNUtil.log("定时器触发,执行 JavaScript")
        this.webView.evaluateJavaScript(script, (result) => {
          MNUtil.log("evaluateJavaScript 回调执行")
          MNUtil.log("返回结果: " + result)
          if (MNUtil.isNSNull(result)) {
            MNUtil.log("结果为 null")
            resolve(undefined)
          } else {
            MNUtil.log("结果非 null: " + JSON.stringify(result))
            resolve(result)
          }
        })
      })
    } else {
      // 立即执行
      MNUtil.log("立即执行 JavaScript")
      try {
        this.webView.evaluateJavaScript(script, (result) => {
          MNUtil.log("evaluateJavaScript 回调执行")
          MNUtil.log("返回结果类型: " + typeof result)
          MNUtil.log("返回结果: " + result)
          if (MNUtil.isNSNull(result)) {
            MNUtil.log("结果为 null,返回 undefined")
            resolve(undefined)
          } else {
            MNUtil.log("结果非 null: " + JSON.stringify(result))
            resolve(result)
          }
        })
        MNUtil.log("evaluateJavaScript 调用完成")
      } catch (error) {
        MNUtil.log("evaluateJavaScript 发生错误: " + error)
        MNUtil.copyJSON(error)
        reject(error)
      }
    }
  })
}

// ========================================
// 业务逻辑方法
// ========================================

/**
 * 加载搜索数据到 HTML
 */
knowledgebaseWebController.prototype.loadSearchData = async function() {
  try {
    MNUtil.log("=== loadSearchData 开始执行 ===")
    let allCards = [];
    let metadata = {};

    // 1. 尝试加载分片索引（新版模式）
    let manifestPath = MNUtil.dbFolder + "/data/kb-search-index-manifest.json"
    MNUtil.log("检查 manifest 文件: " + manifestPath)
    let manifest = MNUtil.readJSON(manifestPath);

    if (manifest && manifest.parts) {
      // 分片模式：加载所有分片
      MNUtil.log("发现分片索引,共 " + manifest.parts.length + " 个分片");

      for (const partInfo of manifest.parts) {
        let partPath = MNUtil.dbFolder + "/data/" + partInfo.filename;
        MNUtil.log("加载分片: " + partInfo.filename);
        let partData = MNUtil.readJSON(partPath);

        if (partData && partData.data) {
          allCards = allCards.concat(partData.data);
          MNUtil.log("分片加载成功,当前总卡片数: " + allCards.length);
        }
      }

      metadata = manifest.metadata || {};

    } else {
      // 旧版模式：尝试加载单文件
      MNUtil.log("未找到分片索引,尝试加载旧版单文件索引");
      let indexPath = MNUtil.dbFolder + "/data/kb-search-index.json"
      MNUtil.log("索引文件路径: " + indexPath)

      if (!MNUtil.isfileExists(indexPath)) {
        MNUtil.log("错误: 索引文件不存在!")
        MNUtil.showHUD("索引未找到，请先更新搜索索引")
        return
      }

      let indexData = MNUtil.readJSON(indexPath);
      MNUtil.log("索引文件读取完成")

      if (!indexData || !indexData.cards) {
        MNUtil.log("错误: 索引数据格式不正确!")
        MNUtil.showHUD("索引未找到，请先更新搜索索引")
        return
      }

      allCards = indexData.cards;
      metadata = indexData.metadata || {};
      MNUtil.log("旧版索引加载成功,卡片数: " + allCards.length);
    }

    // 2. 加载增量索引（如果存在）
    let incrementalPath = MNUtil.dbFolder + "/data/kb-incremental-index.json";
    MNUtil.log("检查增量索引: " + incrementalPath);

    if (MNUtil.isfileExists(incrementalPath)) {
      let incrementalData = MNUtil.readJSON(incrementalPath);
      if (incrementalData && incrementalData.cards) {
        MNUtil.log(`发现增量索引：${incrementalData.cards.length} 张卡片`);

        // 合并并去重（基于 noteId）
        const existingIds = new Set(allCards.map(card => card.id));
        let addedCount = 0;
        for (const card of incrementalData.cards) {
          if (!existingIds.has(card.id)) {
            allCards.push(card);
            addedCount++;
          }
        }
        MNUtil.log(`增量索引合并完成,新增 ${addedCount} 张卡片`);
      }
    } else {
      MNUtil.log("未发现增量索引文件");
    }

    // 3. 构建完整的索引数据
    const fullIndexData = {
      cards: allCards,
      metadata: {
        totalCards: allCards.length,
        updateTime: metadata.updateTime || Date.now(),
        ...metadata
      },
      // 传递排除词组配置到前端
      exclusionGroups: ExclusionManager.getExclusionGroups(),
      // 传递同义词组配置到前端
      synonymGroups: SynonymManager.getSynonymGroups()
    };

    MNUtil.log(`数据准备完成：共 ${allCards.length} 张卡片`);
    MNUtil.log("准备调用 JavaScript...");

    // 检查 webView 状态
    MNUtil.log("webView 存在: " + (this.webView ? "是" : "否"));
    MNUtil.log("webView.window 存在: " + (this.webView && this.webView.window ? "是" : "否"));

    // 将数据传递给 HTML
    let script = `window.Bridge.loadSearchIndex(${JSON.stringify(fullIndexData)})`
    MNUtil.log("JavaScript 脚本长度: " + script.length + " 字符");

    let result = await this.runJavaScript(script)
    MNUtil.log("runJavaScript 返回结果: " + result);

    MNUtil.showHUD(`已加载 ${allCards.length} 张卡片`)
    MNUtil.log("=== loadSearchData 执行完成 ===")

  } catch (error) {
    MNUtil.log("loadSearchData 发生错误: " + error)
    MNUtil.showHUD("加载数据失败: " + error)
    MNUtil.copyJSON(error)
  }
}


/**
 * 刷新搜索结果
 * @param {Array} results - 搜索结果数组
 */
knowledgebaseWebController.prototype.refreshSearchResults = async function(results) {
  try {
    let script = `window.Bridge.updateResults(${JSON.stringify(results)})`
    await this.runJavaScript(script)
  } catch (error) {
    MNUtil.showHUD("刷新结果失败: " + error)
  }
}

// ========================================
// 浮动窗口显示/隐藏
// ========================================

/**
 * 显示浮动窗口（参考 mnbrowser）
 * 增强功能：每次显示时自动刷新所有数据
 * @param {Object} beginFrame - 动画起始位置（可选）
 * @param {Object} endFrame - 最终位置和大小（可选）
 */
knowledgebaseWebController.prototype.show = async function(beginFrame, endFrame) {
  MNLog.log("【show() 开始】beginFrame=" + (beginFrame ? "有" : "无") + ", endFrame=" + (endFrame ? "有" : "无"))
  
  let targetFrame = endFrame || { x: 50, y: 50, width: 420, height: 600 }
  let studyFrame = MNUtil.studyView.frame

  // 约束 frame 在屏幕范围内
  targetFrame.height = MNUtil.constrain(targetFrame.height, 100, studyFrame.height)
  targetFrame.width = MNUtil.constrain(targetFrame.width, 300, studyFrame.width)
  targetFrame.x = MNUtil.constrain(targetFrame.x, 0, studyFrame.width - targetFrame.width)
  targetFrame.y = MNUtil.constrain(targetFrame.y, 0, studyFrame.height - targetFrame.height)

  // 设置起始位置和透明度
  if (beginFrame) {
    this.view.frame = beginFrame
  }
  this.view.layer.opacity = 0.2
  this.view.hidden = false
  MNLog.log("【show()】设置 hidden=false，开始动画")

  // 动画显示
  MNUtil.animate(() => {
    this.view.layer.opacity = 1.0
    this.view.frame = targetFrame
  }).then(async () => {
    MNLog.log("【show()】动画完成，触发 bringSubviewToFront")
    MNUtil.studyView.bringSubviewToFront(this.view)

    // 显示完成后自动刷新数据（确保 WebView 已加载）
    if (this.webViewLoaded) {
      MNLog.log("【show()】WebView 已加载，开始自动刷新数据")
      await this.refreshAllData()
      MNLog.log("【show()】refreshAllData 完成")
    } else {
      MNLog.log("【show()】WebView 尚未加载，跳过自动刷新")
    }
  })
  
  MNLog.log("【show() 返回】异步操作已启动")
}

/**
 * 隐藏浮动窗口（增强版）
 */
knowledgebaseWebController.prototype.hide = function(frame) {
  // 保存当前位置
  let preFrame = this.view.frame

  if (preFrame.width < 200) {
    preFrame.width = Math.max(preFrame.width, 300)
  }
  this.view.frame = preFrame

  // 标记动画状态
  this.onAnimate = true

  // 保存当前透明度
  let preOpacity = this.view.layer.opacity

  MNUtil.animate(() => {
    this.view.layer.opacity = 0.2
    if (frame) {
      this.view.frame = frame
      this.currentFrame = frame
    }
  }, 0.3).then(() => {
    this.onAnimate = false
    this.view.hidden = true
    this.view.layer.opacity = preOpacity
    this.view.frame = preFrame
    this.currentFrame = preFrame
  })
}

/**
 * 初始化状态和样式
 */
knowledgebaseWebController.prototype.init = function() {
  this.isFirst = true
  this.miniMode = false
  this.onAnimate = false
  this.lastTapTime = 0
  this.moveDate = 0

  if (!this.lastFrame) {
    this.lastFrame = this.view.frame
  }
  if (!this.currentFrame) {
    this.currentFrame = this.view.frame
  }

  this.view.layer.shadowOffset = {width: 0, height: 0}
  this.view.layer.shadowRadius = 15
  this.view.layer.shadowOpacity = 0.5
  this.view.layer.shadowColor = UIColor.colorWithWhiteAlpha(0.5, 1)
  this.view.layer.cornerRadius = 15
  this.view.layer.opacity = 1.0
  this.view.backgroundColor = UIColor.whiteColor().colorWithAlphaComponent(0.8)
  this.view.layer.borderColor = MNUtil.hexColorAlpha("#9bb2d6", 0.8)
  this.view.layer.borderWidth = 0

  this.highlightColor = UIColor.blendedColor(
    MNUtil.hexColorAlpha("#2c4d81", 0.8),
    MNUtil.app.defaultTextColor,
    0.8
  )

  // 设置图片路径
  this.closeImage = KnowledgeBaseConfig.mainPath + "/close.png"
  this.resizeImage = KnowledgeBaseConfig.mainPath + "/resize.png"
}

/**
 * 设置面板位置
 */
knowledgebaseWebController.prototype.setFrame = function(frame) {
  if (typeof frame === "object") {
    this.view.frame = frame
  } else if (arguments.length === 4) {
    this.view.frame = MNUtil.genFrame(arguments[0], arguments[1], arguments[2], arguments[3])
  }
  this.currentFrame = this.view.frame
}

/**
 * 显示/隐藏所有按钮
 */
knowledgebaseWebController.prototype.setAllButton = function(hidden) {
  if (this.moveButton) {
    this.moveButton.hidden = hidden
  }
  if (this.closeButton) {
    this.closeButton.hidden = hidden
  }
  if (this.resizeButton) {
    this.resizeButton.hidden = hidden
  }
  if (this.webView) {
    this.webView.hidden = hidden
  }
}

/**
 * 创建按钮辅助方法
 */
knowledgebaseWebController.prototype.createButton = function(buttonName, targetAction, superview) {
  this[buttonName] = UIButton.buttonWithType(0)
  this[buttonName].autoresizingMask = (1 << 0 | 1 << 3)
  this[buttonName].setTitleColorForState(UIColor.whiteColor(), 0)
  this[buttonName].setTitleColorForState(this.highlightColor, 1)
  this[buttonName].backgroundColor = MNUtil.hexColorAlpha("#9bb2d6", 0.8)
  this[buttonName].layer.cornerRadius = 8
  this[buttonName].layer.masksToBounds = true
  this[buttonName].titleLabel.font = UIFont.systemFontOfSize(16)

  if (targetAction) {
    this[buttonName].addTargetActionForControlEvents(this, targetAction, 1 << 6)
  }
  if (superview) {
    this[superview].addSubview(this[buttonName])
  } else {
    this.view.addSubview(this[buttonName])
  }
}

/**
 * 转换到迷你模式
 */
knowledgebaseWebController.prototype.toMinimode = function(frame, lastFrame) {
  this.miniMode = true
  if (lastFrame) {
    this.lastFrame = lastFrame
  } else {
    this.lastFrame = this.view.frame
  }

  this.currentFrame = this.view.frame

  // 隐藏所有按钮和 WebView
  this.setAllButton(true)

  // 设置背景色
  this.view.layer.borderWidth = 0
  let color = "#9bb2d6"
  this.view.layer.backgroundColor = MNUtil.hexColorAlpha(color, 0.8)
  this.view.layer.borderColor = MNUtil.hexColorAlpha(color, 0.8)

  // 执行动画
  MNUtil.animate(() => {
    this.setFrame(frame)
  }).then(() => {
    // 动画完成后，重新设置 moveButton
    this.moveButton.frame = MNUtil.genFrame(0, 0, 40, 40)
    this.moveButton.hidden = false
    this.moveButton.enabled = true

    // 设置图标并居中
    this.moveButton.setTitleForState("📌", 0)
    this.moveButton.titleLabel.font = UIFont.systemFontOfSize(20)
    this.moveButton.titleLabel.textAlignment = 1

    // 确保按钮在最上层
    this.view.bringSubviewToFront(this.moveButton)
  })
}

/**
 * 从迷你模式恢复
 */
knowledgebaseWebController.prototype.fromMinimode = function() {
  try {
    if (!this.miniMode) return

    // 确保 lastFrame 在屏幕范围内
    let studyFrame = MNUtil.studyView.bounds
    if (this.lastFrame) {
      this.lastFrame.x = MNUtil.constrain(this.lastFrame.x, 0, studyFrame.width - this.lastFrame.width)
      this.lastFrame.y = MNUtil.constrain(this.lastFrame.y, 20, studyFrame.height - this.lastFrame.height - 20)
    } else {
      // 如果没有 lastFrame，使用默认位置
      this.lastFrame = {x: 50, y: 30, width: 720, height: 720}
    }

    // 完全照抄拖拽恢复的代码
    let preOpacity = this.view.layer.opacity
    this.view.layer.opacity = 0
    this.setAllButton(true)
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
      this.setAllButton(false)
      this.moveButton.setTitleForState("", 0)
    })
    this.miniMode = false

    // 确保视图在最前面
    MNUtil.studyView.bringSubviewToFront(this.view)
  } catch (error) {
    // 确保重置状态，防止界面卡死
    this.onAnimate = false
    this.miniMode = false
    MNUtil.showHUD("恢复正常模式失败")
    MNUtil.copyJSON(error)
  }
}


// ========================================
// 对卡片进行操作
// ========================================

/**
 * 定位卡片到脑图
 * @param {string} noteId - 卡片 ID
 */
knowledgebaseWebController.prototype.focusCardInMindMap = async function(noteId) {
  try {
    if (!noteId) {
      MNUtil.showHUD("卡片ID为空")
      return
    }

    let note = MNNote.new(noteId)
    if (!note) {
      MNUtil.showHUD("未找到卡片")
      return
    }

    // 聚焦到卡片
    note.focusInMindMap()

    MNUtil.showHUD("已定位到主脑图")
  } catch (error) {
    MNUtil.showHUD("定位失败: " + error)
    MNUtil.copyJSON(error)
  }
}

/**
 * 聚焦卡片到浮窗
 * @param {string} noteId - 卡片 ID
 */
knowledgebaseWebController.prototype.focusCardInFloatMindMap = async function(noteId) {
  try {
    if (!noteId) {
      MNUtil.showHUD("卡片ID为空")
      return
    }

    let note = MNNote.new(noteId)
    if (!note) {
      MNUtil.showHUD("未找到卡片")
      return
    }

    // 聚焦到卡片
    note.focusInFloatMindMap()

    MNUtil.showHUD("已定位到浮窗")

  } catch (error) {
    MNUtil.showHUD("文档定位失败: " + error)
  }
}

/**
 * 复制行内链接
 * @param {string} noteId - 卡片 ID
 */
knowledgebaseWebController.prototype.copyMarkdownLink = async function(noteId) {
  try {
    if (!noteId) {
      MNUtil.showHUD("卡片ID为空")
      return
    }

    let note = MNNote.new(noteId)
    if (!note) {
      MNUtil.showHUD("未找到卡片")
      return
    }

    KnowledgeBaseTemplate.copyMarkdownLinkWithQuickPhrases(note)
  } catch (error) {
    KnowledgeBaseUtils.addErrorLog()
  }
}

/**
 * 复制卡片 URL
 * @param {string} noteId - 卡片 ID
 */
knowledgebaseWebController.prototype.copyNoteURL = async function(noteId) {
  try {
    if (!noteId) {
      MNUtil.showHUD("卡片ID为空")
      return
    }

    let note = MNNote.new(noteId)
    if (!note) {
      MNUtil.showHUD("未找到卡片")
      return
    }

    MNUtil.copy(note.noteURL)
    MNUtil.showHUD("已复制卡片 URL", 0.5)
  } catch (error) {
    MNUtil.showHUD("复制失败: " + error)
    KnowledgeBaseUtils.addErrorLog(error, "copyNoteURL")
  }
}

// ========================================
// 数据刷新方法（供外部调用）
// ========================================

/**
 * 刷新主知识库数据
 * 调用 main.js 中的 loadSearchDataToWebView 方法
 */
knowledgebaseWebController.prototype.refreshKnowledgeData = async function() {
  try {
    MNUtil.log("=== refreshKnowledgeData 开始执行 ===")

    // 调用 main.js 中的数据加载方法（注意使用 global 前缀访问）
    if (typeof global.MNKnowledgeBaseInstance !== 'undefined' && global.MNKnowledgeBaseInstance.loadSearchDataToWebView) {
      await global.MNKnowledgeBaseInstance.loadSearchDataToWebView()
      MNUtil.log("主知识库数据刷新成功")
    } else {
      MNUtil.log("错误: MNKnowledgeBaseInstance 或 loadSearchDataToWebView 方法不存在")
    }
  } catch (error) {
    MNUtil.log("refreshKnowledgeData 发生错误: " + error)
    MNUtil.showHUD("刷新主知识库数据失败: " + error)
    KnowledgeBaseUtils.addErrorLog(error, "refreshKnowledgeData")
  }
}

/**
 * 刷新所有知识库数据（主知识库 + 中间知识库，已合并）
 * 这是推荐的统一刷新接口
 */
knowledgebaseWebController.prototype.refreshAllData = async function() {
  try {
    MNUtil.log("=== refreshAllData 开始执行 ===")

    // 只需刷新主知识库，其中已包含中间知识库数据
    await this.refreshKnowledgeData()

    MNUtil.log("=== refreshAllData 执行完成 ===")
  } catch (error) {
    MNUtil.log("refreshAllData 发生错误: " + error)
    MNUtil.showHUD("刷新数据失败: " + error)
    KnowledgeBaseUtils.addErrorLog(error, "refreshAllData")
  }
}

