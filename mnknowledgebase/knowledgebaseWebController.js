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
    self.view.layer.shadowOffset = {width: 0, height: 0};
    self.view.layer.shadowRadius = 15;
    self.view.layer.shadowOpacity = 0.5;
    self.view.layer.shadowColor = UIColor.colorWithWhiteAlpha(0.5, 1);
    
    self.view.layer.opacity = 1.0
    self.view.layer.cornerRadius = 15
    self.view.backgroundColor = UIColor.whiteColor().colorWithAlphaComponent(0.8)
    self.highlightColor = UIColor.blendedColor(MNUtil.hexColorAlpha("#2c4d81", 0.8),
      MNUtil.app.defaultTextColor,
      0.8
    );

    // 创建 WebView
    self.webView = new UIWebView({x: 10, y: 10, width: 700, height: 700})
    self.webView.backgroundColor = UIColor.whiteColor()
    self.webView.delegate = self
    self.webView.scalesPageToFit = true
    self.view.addSubview(self.webView)
    self.webViewLoaded = false

    // try {
    //   // 加载本地 HTML
    //   let htmlPath = KnowledgeBaseConfig.mainPath + "/search.html"
    //   let htmlURL = NSURL.fileURLWithPath(htmlPath)
    //   let request = NSURLRequest.requestWithURL(htmlURL)
    //   self.webview.loadRequest(request)
    // } catch (error) {
    //   MNUtil.showHUD("加载 HTML 失败: " + error)
    // }
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
    MNUtil.log("=== webViewDidFinishLoad 被调用 ===")
    MNUtil.log("webView URL: " + webView.request.URL())

    // WebView 加载完成后初始化数据
    try {
      self.loadSearchData()
      MNUtil.log("loadSearchData 调用成功")
    } catch (error) {
      MNUtil.log("loadSearchData 调用失败: " + error)
      MNUtil.copyJSON(error)
    }

    self.webViewLoaded = true
    MNUtil.log("webViewLoaded 设置为 true")
  },

  webViewDidFailLoadWithError: function(webView, error) {
    MNUtil.showHUD("页面加载失败")
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
      }
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
      note = MNNote.new(noteId)
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
    note.focusInMindMap()

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

    let note = MNNote.new(noteId)
    if (!note) {
      MNUtil.showHUD("未找到卡片")
      return
    }

    // 切换到文档模式
    MNUtil.studyMode = 1

    // 延迟以确保模式切换完成
    await MNUtil.delay(0.3)

    // 聚焦到文档位置
    note.focusInMindMap()

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

    let note = MNNote.new(noteId)
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
