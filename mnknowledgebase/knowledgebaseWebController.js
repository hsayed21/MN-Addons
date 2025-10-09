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
    let self = this

    // 设置浮动窗口样式（参考 mnbrowser）
    self.view.frame = { x: 50, y: 50, width: 420, height: 600 }
    self.view.backgroundColor = UIColor.whiteColor()

    // 设置阴影效果
    self.view.layer.shadowOffset = {width: 0, height: 0}
    self.view.layer.shadowRadius = 15
    self.view.layer.shadowOpacity = 0.5
    self.view.layer.shadowColor = UIColor.colorWithWhiteAlpha(0.5, 1)
    self.view.layer.cornerRadius = 11
    self.view.layer.opacity = 1.0

    // 创建 WebView
    self.webview = new UIWebView({
      frame: self.view.bounds,
      autoresizingMask: (1 << 1) | (1 << 4) // flexible width and height
    })
    self.webview.delegate = self
    self.view.addSubview(self.webview)

    try {
      // 加载本地 HTML
      let htmlPath = KnowledgeBaseConfig.mainPath + "/search.html"
      let htmlURL = NSURL.fileURLWithPath(htmlPath)
      let request = NSURLRequest.requestWithURL(htmlURL)
      self.webview.loadRequest(request)
    } catch (error) {
      MNUtil.showHUD("加载 HTML 失败: " + error)
    }
  },

  viewWillDisappear: function(animated) {
    let self = this
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
      let self = this
      let config = MNUtil.parseURL(request)

      // 拦截自定义 scheme
      if (config && config.scheme === "mnknowledgebase") {
        self.executeAction(config)  // 委托给集中处理方法
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
    let self = this
    // WebView 加载完成后初始化数据
    self.loadSearchData()
  },

  webViewDidFailLoadWithError: function(webView, error) {
    MNUtil.showHUD("页面加载失败")
  }
})

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
knowledgebaseWebController.prototype.executeAction = async function(config) {
  try {
    switch (config.host) {
      case "locateInMindMap":
        // 定位卡片到脑图
        await this.locateCardInMindMap(config.params.id)
        break

      case "focusInDocument":
        // 聚焦到文档位置
        await this.focusCardInDocument(config.params.id)
        break

      case "addToReview":
        // 添加到复习
        await this.addCardToReview(config.params.id)
        break

      case "copyContent":
        // 复制内容
        MNUtil.copy(config.params.content)
        MNUtil.showHUD("已复制")
        break

      case "ready":
        // HTML 初始化完成信号
        MNUtil.showHUD("知识库搜索已就绪")
        break

      default:
        MNUtil.showHUD("未知动作: " + config.host)
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
  if (!this.webview || !this.webview.window) {
    return undefined
  }

  return new Promise((resolve, reject) => {
    if (delay) {
      // 使用定时器延迟执行
      this.viewTimer = NSTimer.scheduledTimerWithTimeInterval(delay, true, () => {
        this.webview.evaluateJavaScript(script, (result) => {
          if (MNUtil.isNSNull(result)) {
            resolve(undefined)
          } else {
            resolve(result)
          }
        })
      })
    } else {
      // 立即执行
      this.webview.evaluateJavaScript(script, (result) => {
        if (MNUtil.isNSNull(result)) {
          resolve(undefined)
        } else {
          resolve(result)
        }
      })
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
    let allCards = [];
    let metadata = {};
    
    // 1. 尝试加载分片索引（新版模式）
    let manifestPath = MNUtil.dbFolder + "/data/kb-search-index-manifest.json"
    let manifest = MNUtil.readJSON(manifestPath);
    
    if (manifest && manifest.parts) {
      // 分片模式：加载所有分片
      MNUtil.log("WebView: 加载分片索引数据");
      
      for (const partInfo of manifest.parts) {
        let partPath = MNUtil.dbFolder + "/data/" + partInfo.filename;
        let partData = MNUtil.readJSON(partPath);
        
        if (partData && partData.data) {
          allCards = allCards.concat(partData.data);
        }
      }
      
      metadata = manifest.metadata || {};
      
    } else {
      // 旧版模式：尝试加载单文件
      MNUtil.log("WebView: 尝试加载旧版单文件索引");
      let indexPath = MNUtil.dbFolder + "/data/kb-search-index.json"
      let indexData = MNUtil.readJSON(indexPath);
      
      if (!indexData || !indexData.cards) {
        MNUtil.showHUD("索引未找到，请先更新搜索索引")
        return
      }
      
      allCards = indexData.cards;
      metadata = indexData.metadata || {};
    }
    
    // 2. 加载增量索引（如果存在）
    let incrementalPath = MNUtil.dbFolder + "/data/kb-incremental-index.json";
    if (MNUtil.isfileExists(incrementalPath)) {
      let incrementalData = MNUtil.readJSON(incrementalPath);
      if (incrementalData && incrementalData.cards) {
        MNUtil.log(`WebView: 加载增量索引：${incrementalData.cards.length} 张卡片`);
        
        // 合并并去重（基于 noteId）
        const existingIds = new Set(allCards.map(card => card.id));
        for (const card of incrementalData.cards) {
          if (!existingIds.has(card.id)) {
            allCards.push(card);
          }
        }
      }
    }
    
    // 3. 构建完整的索引数据
    const fullIndexData = {
      cards: allCards,
      metadata: {
        totalCards: allCards.length,
        updateTime: metadata.updateTime || Date.now(),
        ...metadata
      }
    };
    
    MNUtil.log(`WebView: 数据准备完成：共 ${allCards.length} 张卡片`);
    
    // 将数据传递给 HTML
    let script = `window.Bridge.loadSearchIndex(${JSON.stringify(fullIndexData)})`
    await this.runJavaScript(script)
    
    MNUtil.showHUD(`已加载 ${allCards.length} 张卡片`)

  } catch (error) {
    MNUtil.showHUD("加载数据失败: " + error)
    MNUtil.copyJSON(error)
  }
}

/**
 * 定位卡片到脑图
 * @param {string} noteId - 卡片 ID
 */
knowledgebaseWebController.prototype.locateCardInMindMap = async function(noteId) {
  try {
    if (!noteId) {
      MNUtil.showHUD("卡片ID为空")
      return
    }

    let note = MNNote.getFocusNote()
    if (!note || note.noteId !== noteId) {
      note = MNNote.getNoteById(noteId)
    }

    if (!note) {
      MNUtil.showHUD("未找到卡片")
      return
    }

    // 切换到脑图模式
    MNUtil.studyMode = 2

    // 延迟以确保模式切换完成
    await MNUtil.delay(0.3)

    // 聚焦到卡片
    MNNote.focusNote(note)

    MNUtil.showHUD("已定位")

  } catch (error) {
    MNUtil.showHUD("定位失败: " + error)
    MNUtil.copyJSON(error)
  }
}

/**
 * 聚焦卡片到文档位置
 * @param {string} noteId - 卡片 ID
 */
knowledgebaseWebController.prototype.focusCardInDocument = async function(noteId) {
  try {
    if (!noteId) {
      MNUtil.showHUD("卡片ID为空")
      return
    }

    let note = MNNote.getNoteById(noteId)
    if (!note) {
      MNUtil.showHUD("未找到卡片")
      return
    }

    // 切换到文档模式
    MNUtil.studyMode = 1

    // 延迟以确保模式切换完成
    await MNUtil.delay(0.3)

    // 聚焦到文档位置
    MNNote.focusNote(note)

    MNUtil.showHUD("已定位到文档")

  } catch (error) {
    MNUtil.showHUD("文档定位失败: " + error)
  }
}

/**
 * 添加卡片到复习
 * @param {string} noteId - 卡片 ID
 */
knowledgebaseWebController.prototype.addCardToReview = async function(noteId) {
  try {
    if (!noteId) {
      MNUtil.showHUD("卡片ID为空")
      return
    }

    let note = MNNote.getNoteById(noteId)
    if (!note) {
      MNUtil.showHUD("未找到卡片")
      return
    }

    // 添加到复习
    MNNote.addNoteToReview(note)

    MNUtil.showHUD("已添加到复习")

  } catch (error) {
    MNUtil.showHUD("添加复习失败: " + error)
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
 * @param {Object} beginFrame - 动画起始位置（可选）
 * @param {Object} endFrame - 最终位置和大小（可选）
 */
knowledgebaseWebController.prototype.show = function(beginFrame, endFrame) {
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

  // 动画显示
  MNUtil.animate(() => {
    this.view.layer.opacity = 1.0
    this.view.frame = targetFrame
  }).then(() => {
    MNUtil.studyView.bringSubviewToFront(this.view)
  })
}

/**
 * 隐藏浮动窗口
 */
knowledgebaseWebController.prototype.hide = function() {
  MNUtil.animate(() => {
    this.view.layer.opacity = 0.2
  }).then(() => {
    this.view.hidden = true
  })
}
