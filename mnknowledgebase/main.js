/**
 * MarginNote 4 插件入口函数
 * 
 * 这是每个 MarginNote 插件都必须实现的核心函数。
 * JSB (JavaScript Bridge) 是 MarginNote 提供的桥接系统，
 * 用于 JavaScript 与 Objective-C/Swift 之间的通信。
 * 
 * @param {String} mainPath 插件的主目录路径，用于访问插件内的资源文件
 * @returns {Class} 返回定义的插件类
 */
JSB.newAddon = function(mainPath){
  JSB.require('utils');
  JSB.require('knowledgebaseWebController');
  // 使用 JSB.defineClass 定义一个继承自 JSExtension 的插件类
  // 格式：'类名 : 父类名'
  var MNKnowledgeBaseClass = JSB.defineClass('MNKnowledgeBase : JSExtension', 
  
  /*=== 实例成员（Instance members）===
   * 这些方法对应每个窗口实例的生命周期
   * MarginNote 支持多窗口，每个窗口都有独立的插件实例
   */
  {
    /**
     * 窗口初始化方法 - 每当有新窗口打开时调用
     * 
     * 这是插件最重要的初始化时机，通常在这里：
     * - 初始化插件的 UI 组件
     * - 设置插件的基本配置
     * - 显示欢迎信息
     * 
     * 注意：此时可能还没有笔记本或文档打开
     */
    sceneWillConnect: function() {
      try {
        KnowledgeBaseConfig.init(mainPath)

        // 保存插件实例引用，供 knowledgebaseWebController 调用
        if (typeof MNKnowledgeBaseInstance === 'undefined') {
          global.MNKnowledgeBaseInstance = self
        }

        // 注册插件通信观察者
        MNUtil.addObserver(self, 'onAddonBroadcast:', 'AddonBroadcast')
        // MNUtil.addObserver(self, 'onOpenKnowledgeBaseSearch:', 'openKnowledgeBaseSearch')

        // 注册文本编辑生命周期观察者（用于检测新卡片创建）
        MNUtil.addObserver(self, 'onTextDidBeginEditing:', 'UITextViewTextDidBeginEditingNotification')
        MNUtil.addObserver(self, 'onTextDidEndEditing:', 'UITextViewTextDidEndEditingNotification')

        self.toggled = false
        self.excerptOCRMode = KnowledgeBaseConfig.config.excerptOCRMode || 0  // 摘录 OCR 模式：0=关闭, 1=直接OCR, 2=Markdown格式, 3=概念提取
        self.preExcerptMode = false  // 预摘录模式
        // MNUtil.addObserver(self, 'onPopupMenuOnNote:', 'PopupMenuOnNote')
        MNUtil.addObserver(self, 'onProcessNewExcerpt:', 'ProcessNewExcerpt')
      } catch (error) {
        KnowledgeBaseUtils.addErrorLog(error, "sceneWillConnect")
      }
    },
    
    /**
     * 窗口断开方法 - 窗口关闭时调用
     * 
     * 在这里进行清理工作：
     * - 移除添加的 UI 组件
     * - 取消定时器和事件监听
     * - 释放占用的资源
     */
    sceneDidDisconnect: function() {
      MNUtil.undoGrouping(()=>{
        try {
          MNUtil.removeObservers(self, [
            'AddonBroadcast',
            'ProcessNewExcerpt',
            'UITextViewTextDidBeginEditingNotification',
            'UITextViewTextDidEndEditingNotification'
          ])
        } catch (error) {
          MNUtil.showHUD(error);
        }
      })
    },
    
    /**
     * 窗口失去焦点时调用
     * 
     * 适用场景：
     * - 暂停动画或定时任务
     * - 保存用户的临时操作状态
     * - 释放一些临时资源
     */
    sceneWillResignActive: function() {
      // 示例中为空实现
    },
    
    /**
     * 窗口获得焦点时调用
     * 
     * 适用场景：
     * - 恢复暂停的任务
     * - 刷新 UI 状态
     * - 重新获取最新数据
     */
    sceneDidBecomeActive: function() {
      // 示例中为空实现
    },
    
    /**
     * 笔记本即将打开时调用
     * 
     * 这是一个重要的时机，可以在这里：
     * - 初始化与笔记本相关的功能
     * - 读取笔记本的配置信息
     * - 准备插件的主要功能界面
     * 
     * @param {String} notebookid 笔记本的唯一标识符
     */
    notebookWillOpen: function(notebookid) {
      // 笔记本打开时的处理（控制器已在 queryAddonCommandStatus 中延迟初始化）
    },
    
    /**
     * 笔记本即将关闭时调用
     * 
     * 在这里进行笔记本相关的清理：
     * - 保存用户在该笔记本中的操作
     * - 清理笔记本相关的临时数据
     * - 隐藏相关的 UI 组件
     * 
     * @param {String} notebookid 笔记本的唯一标识符
     */
    notebookWillClose: function(notebookid) {
      JSB.log('MNLOG Close Notebook: %@',notebookid);
    },
    
    /**
     * 文档打开后调用
     * 
     * 文档包括 PDF、EPUB 等格式的文件。
     * 可以在这里：
     * - 分析文档内容
     * - 准备文档相关的功能
     * - 显示文档特定的工具
     * 
     * @param {String} docmd5 文档的 MD5 哈希值，用作唯一标识
     */
    documentDidOpen: function(docmd5) {
      // 示例中为空实现
    },
    
    /**
     * 文档即将关闭时调用
     * 
     * 进行文档相关的清理工作：
     * - 保存文档的阅读进度
     * - 清理文档相关的缓存
     * - 隐藏文档工具界面
     * 
     * @param {String} docmd5 文档的 MD5 哈希值
     */
    documentWillClose: function(docmd5) {
      // 示例中为空实现
    },

    /**
     * 检测在脑图中开始编辑文本（新卡片创建检测）
     *
     * 监听文本编辑开始事件，用于检测用户在脑图中创建的新卡片
     * 利用三要素判定（无标题、无摘录、无评论）来识别新卡片
     *
     * @param {{object:UITextView}} param 通知参数，包含触发编辑的文本框引用
     */
    onTextDidBeginEditing: function(param) {
      try {
        // 1. 窗口隔离：多窗口环境下只处理当前活跃窗口
        if (self.window !== MNUtil.currentWindow) {
          return;
        }

        // 2. 学习模式过滤：复习模式(3)下不处理
        if (MNUtil.studyMode === 3) {
          return;
        }

        // 3. 获取触发编辑的文本框
        let textView = param.object;
        if (!textView) {
          return;
        }

        // 4. 检查文本框是否在脑图中
        if (!textView.isDescendantOfView(MNUtil.mindmapView)) {
          return;
        }

        // 5. 获取脑图视图
        let mindmapView = MNUtil.mindmapView;
        if (!mindmapView || mindmapView.selViewLst.length !== 1) {
          return;
        }

        // 6. 获取焦点卡片
        let focusNote = MNNote.new(mindmapView.selViewLst[0].note.note);
        if (!focusNote) {
          return;
        }

        // 7. 🔑 三要素判定：检测是否为新卡片（无标题、无摘录、无评论）
        if (!focusNote.noteTitle && !focusNote.excerptText && !focusNote.comments.length) {
          // 标记为新创建的卡片
          self.newNoteCreatedFromMindMap = focusNote;
          self.isCreatingNewNote = true;

          MNUtil.log("【新卡片检测】noteId: " + focusNote.noteId);
        } else {
          // 清除标记（用户在编辑已有卡片）
          self.isCreatingNewNote = false;
        }

      } catch (error) {
        KnowledgeBaseUtils.addErrorLog(error, "onTextDidBeginEditing");
      }
    },

    /**
     * 处理文本编辑结束（新卡片处理）
     *
     * 当用户完成编辑（按回车或点击完成）时触发
     * 此时卡片已有标题，进行自动化处理
     *
     * @param {{object:UITextView}} param 通知参数
     */
    onTextDidEndEditing: function(param) {
      try {
        // 1. 窗口隔离
        if (self.window !== MNUtil.currentWindow) {
          return;
        }

        // 2. 检查是否是新卡片编辑结束
        if (!self.isCreatingNewNote || !self.newNoteCreatedFromMindMap) {
          return;
        }

        // 3. 获取最新的卡片数据（因为用户已经输入了内容）
        let note = MNNote.new(self.newNoteCreatedFromMindMap.noteId);

        if (note && note.noteTitle) {
          // 4. 显示卡片标题（测试）
          MNUtil.showHUD("新卡片创建: " + note.noteTitle);

          // 5. 记录日志
          MNUtil.log("【新卡片创建完成】标题: " + note.noteTitle + ", ID: " + note.noteId);

          // 6. 这里可以添加后续的自动化处理
          // 例如: 自动添加标签、移动到特定位置等
        }

      } catch (error) {
        KnowledgeBaseUtils.addErrorLog(error, "onTextDidEndEditing");
      } finally {
        // 7. 清理标志位
        self.isCreatingNewNote = false;
      }
    },

    /**
     *
     * @param {{userInfo:{noteid:String}}} sender
     * @returns
     */
    onProcessNewExcerpt: async function (sender) {
      /**
       * 1. 自动移动到预备知识库
       * 2. 调用 MNOCR 插件进行 OCR 到标题，方便后续索引
       */
      if (typeof MNUtil === 'undefined') return
      if (self.window !== MNUtil.currentWindow) return; 
      try {
        const noteId = sender.userInfo.noteid
        const note = MNNote.new(noteId)
        if (!note) return
        if (self.preExcerptMode) {
          // 预摘录模式：自动移动到预备知识库
          const preExcerptRootNote = MNNote.new("marginnote4app://note/B48C92CF-A5FD-442A-BF8C-53E1E801F05D")
          if (preExcerptRootNote) {
            preExcerptRootNote.addChild(note)
          }
        }

        if (self.excerptOCRMode > 0) {
          let OCRResult = await KnowledgeBaseNetwork.OCRToTitle(note, self.excerptOCRMode, self.preExcerptMode)
          if (OCRResult) {
            IntermediateKnowledgeIndexer.addToIncrementalIndex(note)
          }
        }
      } catch (error) {
        KnowledgeBaseUtils.addErrorLog(error, "onProcessNewExcerpt")
      }
    },

    queryAddonCommandStatus: function() {
      // 延迟初始化控制器（参考 mnliterature）
      KnowledgeBaseUtils.checkWebViewController()

      if (MNUtil.studyMode < 3) {
        return {
          image: "logo.png",
          object: self,
          selector: "toggleAddon:",
          checked: self.toggled
        }
      } else {
        // 复习模式下隐藏控制器
        if (KnowledgeBaseUtils.webViewController) {
          KnowledgeBaseUtils.webViewController.view.hidden = true
        }
        return null
      }
    },

    // 点击插件图标执行的方法。
    toggleAddon: async function(button) {
      try {
        if (!self.addonBar) {
          self.addonBar = button.superview.superview
          KnowledgeBaseUtils.addonBar = self.addonBar
        }
        self.toggled = !self.toggled
        MNUtil.refreshAddonCommands()

        let commandTable = [
          // === 索引管理 ===
          self.tableItem('🔄   索引知识库', 'updateSearchIndex:'),
          // self.tableItem('📋   搜索知识库', 'searchForMarkdown:'),
          // self.tableItem('-------------------------------',''),
          // === 中间知识库管理 ===
          self.tableItem('📝   索引中间知识库', 'updateIntermediateKnowledgeIndex:'),
          // self.tableItem('🔎   搜索中间知识库', 'searchInIntermediateKB:'),
          self.tableItem('-------------------------------',''),
          // === 通用搜索（支持自定义类型）===
          self.tableItem('🌐   可视化搜索', 'openSearchWebView:'),
          // self.tableItem('🔍   全部搜索', 'searchInKB:'),

          // === 快捷搜索 ===
          // self.tableItem('    📚  知识卡片', 'searchWithPreset:', 'knowledge'),
          // self.tableItem('    📘  仅定义', 'searchWithPreset:', 'definitions'),
          // self.tableItem('    📁  仅归类', 'searchWithPreset:', 'classifications'),
          // self.tableItem('    📒  定义与归类', 'searchWithPreset:', 'definitionsAndClassifications'),
          self.tableItem('-------------------------------',''),
          self.tableItem('🤖  模式',''),
          self.tableItem('    🤖 摘录自动 OCR', 'excerptOCRModeSetting:', button, !self.excerptOCRMode==0),
          self.tableItem('    🤖 预摘录', 'preExcerptModeToggled:', undefined, self.preExcerptMode),
          // === 配置管理 ===
          // self.tableItem('📜   搜索历史', 'showSearchHistory:'),
          // self.tableItem('🔍   搜索模式设置', 'configureSearchMode:'),
          self.tableItem('-------------------------------',''),
          self.tableItem('⚙️  OCR 模型设置', 'excerptOCRModelSetting:', button),
          self.tableItem('    ⚙️ Unicode OCR 模型', 'excerptOCRModelSettingForMode1:', button),
          self.tableItem('    ⚙️ Markdown OCR 模型', 'excerptOCRModelSettingForMode2:', button),
          self.tableItem('    ⚙️ OCR 概念提取 模型', 'excerptOCRModelSettingForMode3:', button),
        ];

        // 显示菜单
        self.popoverController = MNUtil.getPopoverAndPresent(
          button,        // 触发按钮
          commandTable,  // 菜单项
          250,          // 宽度（增加到250以适应更长的菜单项）
          0             // 箭头方向（0=自动）
        );
      } catch (error) {
        MNUtil.showHUD(error);
        MNLog.error({
          message:error,
          source:"MNKnowledgeBase: toggleAddon",
        })
      }
    },

    excerptOCRModelSetting: function(button) {
      try {
        self.checkPopover()
        let commandTable = []
        for (let source of KnowledgeBaseConfig.excerptOCRSources) {
          commandTable.push(self.tableItem(source, 'setExcerptOCRModel:', source, KnowledgeBaseConfig.config.excerptOCRModelIndex === KnowledgeBaseConfig.excerptOCRSources.indexOf(source)))
        }
        self.popoverController = MNUtil.getPopoverAndPresent(
          button,        // 触发按钮
          commandTable,  // 菜单项
          250,          // 宽度（增加到250以适应更长的菜单项）
          0             // 箭头方向（0=自动）
        );
      } catch (error) {
        KnowledgeBaseUtils.addErrorLog(error, "excerptOCRModelSetting")
      }
    },

    setExcerptOCRModel: function(source) {
      try {
        self.checkPopover()
        MNUtil.showHUD("已设置摘录 OCR 模型为 " + source, 1)
        KnowledgeBaseConfig.config.excerptOCRModel = source
        KnowledgeBaseConfig.config.excerptOCRModelIndex = KnowledgeBaseConfig.excerptOCRSources.indexOf(source)
        KnowledgeBaseConfig.save()
      } catch (error) {
        KnowledgeBaseUtils.addErrorLog(error, "setExcerptOCRModel")
      }
    },

    excerptOCRModeSetting: function(button) {
      try {
        self.checkPopover()
        const modeNames = ['❌ 关闭', '📝 直接OCR', '🔤 Markdown格式', '🎯 概念提取']
        let commandTable = modeNames.map((name, index) =>
          self.tableItem(name, 'setExcerptOCRMode:', index, self.excerptOCRMode === index)
        )
        self.popoverController = MNUtil.getPopoverAndPresent(
          button,
          commandTable,
          250,
          0
        )
      } catch (error) {
        KnowledgeBaseUtils.addErrorLog(error, "excerptOCRModeSetting")
      }
    },

    setExcerptOCRMode: function(mode) {
      try {
        self.checkPopover()
        self.excerptOCRMode = mode
        KnowledgeBaseConfig.config.excerptOCRMode = mode
        KnowledgeBaseConfig.save()
        const modeNames = ['关闭', '直接OCR', 'Markdown格式', '概念提取']
        MNUtil.showHUD(`摘录 OCR 模式已设置为: ${modeNames[mode]}`, 1)
      } catch (error) {
        KnowledgeBaseUtils.addErrorLog(error, "setExcerptOCRMode")
      }
    },

    excerptOCRModelSettingForMode1: function(button) {
      try {
        self.checkPopover()
        let commandTable = []
        for (let source of KnowledgeBaseConfig.excerptOCRSources) {
          const currentModel = KnowledgeBaseConfig.config.excerptOCRModelForMode1 || KnowledgeBaseConfig.config.excerptOCRModel
          commandTable.push(self.tableItem(source, 'setExcerptOCRModelForMode1:', source, currentModel === source))
        }
        self.popoverController = MNUtil.getPopoverAndPresent(
          button,
          commandTable,
          250,
          0
        )
      } catch (error) {
        KnowledgeBaseUtils.addErrorLog(error, "excerptOCRModelSettingForMode1")
      }
    },

    setExcerptOCRModelForMode1: function(source) {
      try {
        self.checkPopover()
        MNUtil.showHUD("模式1（直接OCR）模型已设置为 " + source, 1)
        KnowledgeBaseConfig.config.excerptOCRModelForMode1 = source
        KnowledgeBaseConfig.save()
      } catch (error) {
        KnowledgeBaseUtils.addErrorLog(error, "setExcerptOCRModelForMode1")
      }
    },

    excerptOCRModelSettingForMode2: function(button) {
      try {
        self.checkPopover()
        let commandTable = []
        for (let source of KnowledgeBaseConfig.excerptOCRSources) {
          const currentModel = KnowledgeBaseConfig.config.excerptOCRModelForMode2 || KnowledgeBaseConfig.config.excerptOCRModel
          commandTable.push(self.tableItem(source, 'setExcerptOCRModelForMode2:', source, currentModel === source))
        }
        self.popoverController = MNUtil.getPopoverAndPresent(
          button,
          commandTable,
          250,
          0
        )
      } catch (error) {
        KnowledgeBaseUtils.addErrorLog(error, "excerptOCRModelSettingForMode2")
      }
    },

    setExcerptOCRModelForMode2: function(source) {
      try {
        self.checkPopover()
        MNUtil.showHUD("模式2（Markdown格式）模型已设置为 " + source, 1)
        KnowledgeBaseConfig.config.excerptOCRModelForMode2 = source
        KnowledgeBaseConfig.save()
      } catch (error) {
        KnowledgeBaseUtils.addErrorLog(error, "setExcerptOCRModelForMode2")
      }
    },

    excerptOCRModelSettingForMode3: function(button) {
      try {
        self.checkPopover()
        let commandTable = []
        for (let source of KnowledgeBaseConfig.excerptOCRSources) {
          const currentModel = KnowledgeBaseConfig.config.excerptOCRModelForMode3 || KnowledgeBaseConfig.config.excerptOCRModel
          commandTable.push(self.tableItem(source, 'setExcerptOCRModelForMode3:', source, currentModel === source))
        }
        self.popoverController = MNUtil.getPopoverAndPresent(
          button,
          commandTable,
          250,
          0
        )
      } catch (error) {
        KnowledgeBaseUtils.addErrorLog(error, "excerptOCRModelSettingForMode3")
      }
    },

    setExcerptOCRModelForMode3: function(source) {
      try {
        self.checkPopover()
        MNUtil.showHUD("模式3（概念提取）模型已设置为 " + source, 1)
        KnowledgeBaseConfig.config.excerptOCRModelForMode3 = source
        KnowledgeBaseConfig.save()
      } catch (error) {
        KnowledgeBaseUtils.addErrorLog(error, "setExcerptOCRModelForMode3")
      }
    },

    preExcerptModeToggled: function() {
      self.checkPopover()
      self.preExcerptMode = !self.preExcerptMode
      MNUtil.showHUD(self.preExcerptMode ? "已开启预摘录模式" : "已关闭预摘录模式", 1)
    },
    
    /**
     * 更新搜索索引（异步版本）
     */
    updateSearchIndex: async function() {
      try {
        // 关闭菜单
        if (self.popoverController) {
          self.popoverController.dismissPopoverAnimated(true);
        }
        
        // let focusNote = MNNote.getFocusNote()
        // let rootNote
        // if (focusNote) {
        //   rootNote = focusNote
        // } else {
        //   rootNote = MNNote.new("marginnote4app://note/B2A5D567-909C-44E8-BC08-B1532D3D0AA1")
        // }
        let rootNote = MNNote.new("marginnote4app://note/B2A5D567-909C-44E8-BC08-B1532D3D0AA1")
        
        if (!rootNote) {
          MNUtil.showHUD("知识库不存在！");
          return;
        }
        
        // 显示开始提示
        MNUtil.showHUD("开始构建索引，请稍候...");
        
        // 延迟执行以确保 UI 更新
        await MNUtil.delay(0.1);
        
        // 异步构建索引（内部会显示进度）
        const manifest = await KnowledgeBaseIndexer.buildSearchIndex([rootNote]);
        
        // 检查结果
        if (manifest && manifest.metadata && manifest.metadata.totalCards > 0) {
          MNUtil.showHUD(`索引构建成功！共 ${manifest.metadata.totalCards} 张卡片，${manifest.metadata.totalParts} 个分片`);
        } else {
          MNUtil.showHUD("没有找到可索引的卡片");
        }
        
      } catch (error) {
        MNUtil.showHUD("更新索引失败: " + error.message);
        MNLog.error(error, "MNKnowledgeBase: updateSearchIndex");
      }
    },
    
    /**
     * 搜索知识库（通用搜索，支持自定义类型）
     */
    searchInKB: async function() {
      try {
        self.checkPopover()

        // 异步加载搜索器
        const searcher = await KnowledgeBaseSearcher.loadFromFile();
        if (!searcher) {
          MNUtil.showHUD("索引未找到，请先更新搜索索引");
          return;
        }

        // 显示搜索对话框（允许类型选择）
        KnowledgeBaseSearcher.showSearchDialog(searcher, {});

      } catch (error) {
        MNUtil.showHUD("快速搜索失败: " + error.message);
        MNLog.error(error, "MNKnowledgeBase: searchInKB");
      }
    },

    /**
     * 打开可视化搜索 WebView
     *
     * 注意：数据加载由 show() 方法自动处理，无需手动加载
     */
    openSearchWebView: async function() {
      self.openSearchWebView()
    },

    /**
     * 更新中间知识库索引
     */
    updateIntermediateKnowledgeIndex: async function() {
      try {
        // 关闭菜单
        if (self.popoverController) {
          self.popoverController.dismissPopoverAnimated(true);
        }

        // 中间知识库根卡片ID数组
        // TODO: 这里需要配置你的中间知识库根卡片ID
        const intermediateRootIds = [
          "marginnote4app://note/FC6181AF-1BAC-4D1D-9B86-7FAB3391F3EC",
          "marginnote4app://note/9D234BE6-9A7C-4BEC-8924-F18132FB6E64",
          "marginnote4app://note/74785805-661C-4836-AFA6-C85697056B0C",
          "marginnote4app://note/B48C92CF-A5FD-442A-BF8C-53E1E801F05D", // 预备知识库
        ];

        // 验证根卡片
        const rootNotes = [];
        for (const rootId of intermediateRootIds) {
          const note = MNNote.new(rootId);
          if (note) {
            rootNotes.push(note);
          }
        }

        if (rootNotes.length === 0) {
          MNUtil.showHUD("中间知识库根卡片未配置或不存在！");
          return;
        }

        // 显示开始提示
        MNUtil.showHUD("开始构建中间知识库索引，请稍候...");

        // 延迟执行以确保 UI 更新
        await MNUtil.delay(0.1);

        // 异步构建索引
        const manifest = await IntermediateKnowledgeIndexer.buildSearchIndex(rootNotes);

        // 检查结果
        if (manifest && manifest.metadata && manifest.metadata.totalCards > 0) {
          MNUtil.showHUD(`中间知识库索引构建成功！共 ${manifest.metadata.totalCards} 张卡片，${manifest.metadata.totalParts} 个分片`);
        } else {
          MNUtil.showHUD("没有找到可索引的卡片");
        }

      } catch (error) {
        MNUtil.showHUD("更新中间知识库索引失败: " + error.message);
        MNLog.error({
          message: "更新中间知识库索引失败",
          error: error.message,
          stack: error.stack,
          detail: JSON.stringify({
            intermediateRootIds: intermediateRootIds,
            errorType: error.name || "UnknownError"
          })
        }, "MNKnowledgeBase.updateIntermediateKnowledgeIndex");
      }
    },

    /**
     * 搜索中间知识库
     */
    searchInIntermediateKB: async function() {
      try {
        self.checkPopover()

        // 检查缓存
        if (!self.intermediateSearchCache || !self.intermediateSearchCache.data) {
          // 加载中间知识库索引
          const manifest = IntermediateKnowledgeIndexer.loadIndexManifest();
          if (!manifest) {
            MNUtil.showHUD("中间知识库索引未找到，请先更新索引");
            return;
          }

          // 加载索引数据
          const searchData = [];
          for (const partInfo of manifest.parts) {
            const part = IntermediateKnowledgeIndexer.loadIndexPart(partInfo.filename);
            if (part && part.data) {
              searchData.push(...part.data);
            }
          }

          if (searchData.length === 0) {
            MNUtil.showHUD("中间知识库索引为空");
            return;
          }

          // 缓存数据（有效期5分钟）
          self.intermediateSearchCache = {
            data: searchData,
            timestamp: Date.now(),
            expiry: 5 * 60 * 1000 // 5分钟
          };
        } else {
          // 检查缓存是否过期
          if (Date.now() - self.intermediateSearchCache.timestamp > self.intermediateSearchCache.expiry) {
            self.intermediateSearchCache = null;
            self.searchInIntermediateKB(); // 重新加载
            return;
          }
        }

        // 显示搜索对话框（使用缓存的数据）
        self.showIntermediateSearchDialog(self.intermediateSearchCache.data);

      } catch (error) {
        MNUtil.showHUD("搜索中间知识库失败: " + error.message);
        MNLog.error(error, "MNKnowledgeBase: searchInIntermediateKB");
      }
    },
    
    /**
     * 分享索引文件（支持新版分片索引）
     */
    shareIndexFile: async function() {
      try {
        // 关闭菜单
        if (self.popoverController) {
          self.popoverController.dismissPopoverAnimated(true);
        }
        
        // 生成时间戳
        const date = new Date();
        const timestamp = date.toISOString().replace(/[:.]/g, '-').slice(0, -5);
        
        // 首先尝试加载新版分片索引
        const manifest = KnowledgeBaseIndexer.loadIndexManifest();
        if (manifest && manifest.metadata) {
          // 新版分片索引：合并所有分片到一个文件（用于分享）
          const mergedIndex = {
            metadata: manifest.metadata,
            searchData: []
          };
          
          // 加载并合并所有分片
          for (const partInfo of manifest.parts) {
            const part = KnowledgeBaseIndexer.loadIndexPart(partInfo.filename);
            if (part && part.data) {
              mergedIndex.searchData = mergedIndex.searchData.concat(part.data);
            }
          }
          
          // 导出合并后的索引
          const filename = `kb-search-index-merged-${timestamp}.json`;
          const filepath = MNUtil.mainPath + "/" + filename;
          MNUtil.writeJSON(filepath, mergedIndex);
          MNUtil.saveFile(filepath, "public.json");
          
          MNUtil.showHUD(`索引文件已导出（${mergedIndex.searchData.length} 条记录）`);
          return;
        }
        
        // 向后兼容：尝试加载旧版单文件索引
        const index = KnowledgeBaseIndexer.loadIndex();
        if (index) {
          const filename = `kb-search-index-${timestamp}.json`;
          const filepath = MNUtil.mainPath + "/" + filename;
          MNUtil.writeJSON(filepath, index);
          MNUtil.saveFile(filepath, "public.json");
          
          MNUtil.showHUD("索引文件已导出");
          return;
        }
        
        // 没有找到任何索引
        MNUtil.showHUD("未找到索引，请先更新搜索索引");
        
      } catch (error) {
        MNUtil.showHUD("分享失败: " + error.message);
        MNLog.error(error, "MNKnowledgeBase: shareIndexFile");
      }
    },

    /**
     * 显示搜索历史
     */
    showSearchHistory: async function() {
      try {
        // 关闭菜单
        if (self.popoverController) {
          self.popoverController.dismissPopoverAnimated(true);
        }
        
        // 检查是否有搜索历史
        if (!KnowledgeBaseSearcher.searchHistory || KnowledgeBaseSearcher.searchHistory.length === 0) {
          MNUtil.showHUD("暂无搜索历史");
          return;
        }
        
        // 格式化时间显示
        const formatTime = (timestamp) => {
          const now = Date.now();
          const diff = now - timestamp;
          const seconds = Math.floor(diff / 1000);
          const minutes = Math.floor(seconds / 60);
          const hours = Math.floor(minutes / 60);
          const days = Math.floor(hours / 24);
          
          if (days > 0) return `${days}天前`;
          if (hours > 0) return `${hours}小时前`;
          if (minutes > 0) return `${minutes}分钟前`;
          return `刚刚`;
        };
        
        // 构建历史列表选项
        const options = KnowledgeBaseSearcher.searchHistory.map((entry, index) => {
          const typeInfo = entry.types ? `[${entry.types.join(",")}]` : "[全部]";
          const timeInfo = formatTime(entry.timestamp);
          return `${index + 1}. ${timeInfo} - "${entry.keyword}" ${typeInfo} (${entry.results.length}个结果)`;
        });
        
        // 添加清空历史选项
        options.push("🗑️ 清空搜索历史");
        
        // 显示历史列表
        const choice = await MNUtil.userSelect(
          `搜索历史 (最近${KnowledgeBaseSearcher.searchHistory.length}条)`,
          "选择要查看的历史记录：",
          options
        );
        
        if (choice === 0) {
          // 用户取消
          return;
        } else if (choice === options.length) {
          // 清空历史
          self.clearSearchHistory();
        } else {
          // 显示选中的历史记录结果
          const selectedHistory = KnowledgeBaseSearcher.searchHistory[choice - 1];

          // 尝试加载搜索器（用于返回搜索功能）
          const searcher = await KnowledgeBaseSearcher.loadFromFile();

          // 重用之前的搜索结果
          const searchOptions = {
            types: selectedHistory.types,
            searchModeConfig: selectedHistory.searchModeConfig,
            originalKeyword: selectedHistory.keyword,
            isFromHistory: true
          };

          // 显示历史搜索结果（用户在点击卡片时通过菜单选择操作）
          KnowledgeBaseSearcher.showSearchResults(
            selectedHistory.results,
            searcher,
            searchOptions
          );
        }
        
      } catch (error) {
        MNUtil.showHUD("显示搜索历史失败: " + error.message);
        MNLog.error(error, "MNKnowledgeBase: showSearchHistory");
      }
    },
    
    /**
     * 清空搜索历史
     */
    clearSearchHistory: async function() {
      self.clearSearchHistory()
    },

    /**
     * 配置搜索模式
     */
    configureSearchMode: async function() {
      try {
        // 关闭菜单
        if (self.popoverController) {
          self.popoverController.dismissPopoverAnimated(true);
        }
        
        // 调用搜索模式配置界面
        await KnowledgeBaseTemplate.configureSearchMode();
      } catch (error) {
        MNUtil.showHUD("配置搜索模式失败: " + error.message);
      }
    },

    /**
     * 管理排除词
     */
    manageExclusions: async function() {
      try {
        // 关闭菜单
        if (self.popoverController) {
          self.popoverController.dismissPopoverAnimated(true);
        }
        
        // 调用排除词管理界面
        await KnowledgeBaseTemplate.manageExclusionGroups();
      } catch (error) {
        MNUtil.showHUD("管理排除词失败: " + error.message);
        MNLog.error(error, "MNKnowledgeBase: manageExclusions");
      }
    },

    /**
     * 使用预设类型进行快捷搜索
     * @param {String} preset - 预设类型键名（如 'knowledge', 'definitions' 等）
     */
    searchWithPreset: async function(preset) {
      try {
        self.checkPopover();

        // 异步加载搜索器
        const searcher = await KnowledgeBaseSearcher.loadFromFile();
        if (!searcher) {
          MNUtil.showHUD("索引未找到，请先更新搜索索引");
          return;
        }

        // 获取预设类型
        const types = SearchConfig.getTypesByPreset(preset);
        if (!types) {
          MNUtil.showHUD("无效的搜索预设");
          return;
        }

        // 显示搜索对话框，跳过类型选择
        const searchConfig = {
          enableTypeSelection: false,  // 禁用类型选择
          defaultTypes: types,         // 使用预设类型
          presetKey: preset            // 传递预设键用于显示
        };

        KnowledgeBaseSearcher.showSearchDialog(searcher, searchConfig);

      } catch (error) {
        MNUtil.showHUD("快捷搜索失败: " + error.message);
        MNLog.error(error, "MNKnowledgeBase: searchWithPreset");
      }
    },

    /**
     * 搜索并复制 Markdown 链接
     */
    searchForMarkdown: async function() {
      try {
        self.checkPopover();

        // 异步加载搜索器
        const searcher = await KnowledgeBaseSearcher.loadFromFile();
        if (!searcher) {
          MNUtil.showHUD("索引未找到，请先更新搜索索引");
          return;
        }

        // 获取知识卡片类型
        const types = SearchConfig.getTypesByPreset('knowledge');

        // 显示搜索对话框，使用知识卡片类型
        KnowledgeBaseSearcher.showSearchDialog(searcher, {
          enableTypeSelection: false,  // 禁用类型选择
          defaultTypes: types,         // 使用知识卡片类型
          presetKey: 'knowledge'       // 使用知识卡片预设
        });

      } catch (error) {
        MNUtil.showHUD("搜索失败: " + error.message);
        MNLog.error(error, "MNKnowledgeBase: searchForMarkdown");
      }
    },


    // 生命周期测试

    // onPopupMenuOnNote: async function (sender) {
    //   MNUtil.undoGrouping(()=>{
    //     try {
    //     } catch (error) {
    //       MNUtil.showHUD(error);
    //     }
    //   })
    // }
    /**
     * 处理来自其他插件的通信消息
     * @param {Object} sender - 消息发送者信息,包含 userInfo.message
     *
     * 消息协议格式:
     * marginnote4app://addon/mnknowledgebase?action=ACTION&param1=value1&param2=value2
     *
     * 支持的 actions:
     * - openSearchWebView: 打开可视化搜索界面
     *
     * 使用示例:
     * marginnote4app://addon/mnknowledgebase?action=openSearchWebView
     */
    onAddonBroadcast: async function (sender) {
      try {
        // 只在当前窗口响应
        if (self.window !== MNUtil.currentWindow) return;

        let message = "marginnote4app://addon/" + sender.userInfo.message
        let config = MNUtil.parseURL(message)
        let addon = config.pathComponents[0]

        if (addon === "mnknowledgebase") {
          let action = config.params.action
          switch (action) {
            case "openSearchWebView":
              await self.openSearchWebView()
              break;
            default:
              MNUtil.showHUD('不支持的操作: ' + action)
              break;
          }
        }
      } catch (error) {
        KnowledgeBaseUtils.addErrorLog(error, "onAddonBroadcast")
      }
    },
  }, 
  
  /*=== 类成员（Class members）===
   * 这些方法对应整个插件的全局生命周期
   * 无论有多少个窗口，这些方法只会被调用一次
   */
  {
    /**
     * 插件连接时调用 - 插件首次加载时
     * 
     * 这是插件的全局初始化时机，适合：
     * - 注册全局事件监听器
     * - 初始化全局配置
     * - 设置插件的基础服务
     */
    addonDidConnect: function() {
      // 示例中为空实现
    },
    
    /**
     * 插件即将断开时调用 - 插件卸载前
     * 
     * 进行全局清理工作：
     * - 取消全局事件监听
     * - 保存插件配置
     * - 释放全局资源
     */
    addonWillDisconnect: function() {
      // 示例中为空实现
    },
    
    /**
     * 应用程序即将进入前台时调用
     * 
     * 适用于 iOS/iPadOS 平台，当用户从后台切换回 MarginNote 时触发
     */
    applicationWillEnterForeground: function() {
      // 示例中为空实现
    },
    
    /**
     * 应用程序进入后台时调用
     * 
     * 适用于 iOS/iPadOS 平台，当用户切换到其他应用时触发
     */
    applicationDidEnterBackground: function() {
      // 示例中为空实现
    },
    
    /**
     * 收到本地通知时调用
     * 
     * 处理系统通知或定时提醒
     * 
     * @param {Object} notify 通知对象
     */
    applicationDidReceiveLocalNotification: function(notify) {
      // 示例中为空实现
    },
  });

  MNKnowledgeBaseClass.prototype.init = function(){
    KnowledgeBaseConfig.init(mainPath)
  }

  MNKnowledgeBaseClass.prototype.checkPopover = function(){
    // 关闭菜单
    if (this.popoverController) {
      this.popoverController.dismissPopoverAnimated(true);
    }
  }

  MNKnowledgeBaseClass.prototype.tableItem = function (title, selector, param = "", checked = false) {
    return {
      title: title,        // 菜单项显示的文字
      object: this,        // 执行方法的对象（重要！）
      selector: selector,  // 点击后要调用的方法名
      param: param,        // 传递给方法的参数
      checked: checked     // 是否显示勾选状态
    }
  }

  /**
   * 显示中间知识库搜索对话框
   */
  MNKnowledgeBaseClass.prototype.showIntermediateSearchDialog = async function(searchData) {
    try {
      const searchModeConfig = KnowledgeBaseTemplate.getSearchConfig();

      const userInput = await MNUtil.userInput(
        `搜索中间知识库 (共 ${searchData.length} 张卡片)`,
        "请输入搜索关键词：",
        ["取消", "搜索"]
      );

      if (userInput.button !== 1) {
        return;
      }

      const rawKeyword = userInput.input.trim();
      if (!rawKeyword) {
        return;
      }

      // 根据配置扩展查询（同义词）
      let expandedKeyword = rawKeyword;
      if (searchModeConfig.useSynonyms) {
        expandedKeyword = KnowledgeBaseIndexer.expandSearchQuery(rawKeyword, true);
      }

      const parsedQuery = KnowledgeBaseSearcher.parseSearchQuery(expandedKeyword);
      const hasConditions = parsedQuery.andGroups.length > 0 ||
        parsedQuery.orGroups.length > 0 ||
        parsedQuery.exactPhrases.length > 0;

      if (!hasConditions) {
        MNUtil.showHUD("请输入有效的搜索条件");
        return;
      }

      const results = [];
      for (const entry of searchData) {
        if (!entry.searchText) continue;

        if (KnowledgeBaseSearcher.matchesQuery(entry.searchText, parsedQuery)) {
          const score = this.calculateIntermediateSearchScore(parsedQuery, entry);

          results.push({
            id: entry.id,
            title: entry.title || "(无标题)",
            isTemplated: entry.isTemplated,
            type: entry.type,
            searchText: entry.searchText,
            score: score
          });
        }
      }

      // 应用排除词过滤
      const filteredResults = KnowledgeBaseIndexer.filterSearchResults(
        results,
        searchModeConfig.useExclusion
      );

      if (!filteredResults || filteredResults.length === 0) {
        MNUtil.showHUD("未找到匹配的卡片");
        return;
      }

      filteredResults.sort((a, b) => (b.score || 0) - (a.score || 0));

      await this.showIntermediateSearchResults(filteredResults, rawKeyword);
    } catch (error) {
      MNUtil.showHUD("搜索失败: " + error.message);
      MNLog.error(error, "MNKnowledgeBase: showIntermediateSearchDialog");
    }
  }

  MNKnowledgeBaseClass.prototype.calculateIntermediateSearchScore = function(parsedQuery, entry) {
    let score = 0;

    if (parsedQuery.exactPhrases && parsedQuery.exactPhrases.length > 0) {
      for (const phrase of parsedQuery.exactPhrases) {
        if (entry.searchText.includes(phrase)) {
          score += 80;
        }
      }
    }

    if (parsedQuery.andGroups && parsedQuery.andGroups.length > 0) {
      for (const group of parsedQuery.andGroups) {
        if (entry.searchText.includes(group)) {
          score += 30;
        }
      }
    }

    if (parsedQuery.orGroups && parsedQuery.orGroups.length > 0) {
      const matched = parsedQuery.orGroups.filter(term => entry.searchText.includes(term));
      score += matched.length * 25;
    }

    if (score === 0 && entry.searchText) {
      score = 10;
    }

    return score;
  }

  /**
   * 显示中间知识库搜索结果
   */
  MNKnowledgeBaseClass.prototype.showIntermediateSearchResults = async function(results, keyword) {
    try {
      // 构建结果选项列表
      const options = ["🔙 返回搜索"];

      // 添加搜索结果（最多显示50个）
      const displayResults = results.slice(0, 50);
      displayResults.forEach((result, index) => {
        const typeInfo = result.isTemplated ? `[${result.type || "已制卡"}]` : "[未制卡]";
        const title = result.title || "(无标题)";
        options.push(`${index + 1}. ${typeInfo} ${title}`);
      });

      if (results.length > 50) {
        options.push(`... 还有 ${results.length - 50} 个结果未显示`);
      }

      // 显示结果列表
      const choice = await MNUtil.userSelect(
        `搜索结果：${keyword} (${results.length} 个)`,
        "选择要查看的卡片：",
        options
      );

      if (choice === 0) {
        // 用户取消
        return;
      } else if (choice === 1) {
        // 返回搜索（使用缓存的数据）
        if (self.intermediateSearchCache && self.intermediateSearchCache.data) {
          this.showIntermediateSearchDialog(self.intermediateSearchCache.data);
        } else {
          // 如果缓存不存在，重新触发搜索
          self.searchInIntermediateKB();
        }
      } else if (choice > 1 && choice <= displayResults.length + 1) {
        // 查看选中的卡片
        const selectedResult = displayResults[choice - 2];
        const note = MNNote.new(selectedResult.id);
        if (note) {
          if (MNUtil.mindmapView) {
            note.focusInMindMap();
          } else {
            MNUtil.showHUD("已选择卡片：" + selectedResult.title);
          }
        }
      }
    } catch (error) {
      MNUtil.showHUD("显示结果失败: " + error.message);
      MNLog.error(error, "MNKnowledgeBase: showIntermediateSearchResults");
    }
  }




  MNKnowledgeBaseClass.prototype.clearSearchHistory = async function() {
    try {
      const confirm = await MNUtil.userSelect(
        "确认清空",
        "确定要清空所有搜索历史吗？此操作不可恢复。",
        ["取消", "确认清空"]
      );

      if (confirm === 1) {
        this.searchHistory = [];
        MNUtil.showHUD("搜索历史已清空");
      }
    } catch (error) {
      MNUtil.showHUD("清空历史失败: " + error.message);
      MNLog.error(error, "MNKnowledgeBase: clearSearchHistory");
    }
  }

  /**
   * 加载搜索数据到 WebView（合并主知识库和中间知识库）
   */
  MNKnowledgeBaseClass.prototype.loadSearchDataToWebView = async function() {
    try {
      let allCards = [];
      let metadata = {};

      // ========== 第1部分：加载主知识库 ==========
      MNUtil.log("=== 开始加载主知识库 ===");

      // 1.1 尝试加载分片索引（新版模式）
      let manifestPath = MNUtil.dbFolder + "/data/kb-search-index-manifest.json"
      let manifest = MNUtil.readJSON(manifestPath);

      if (manifest && manifest.parts) {
        // 分片模式：加载所有分片
        MNUtil.log("加载主知识库分片索引数据");

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
        MNUtil.log("尝试加载旧版主知识库单文件索引");
        let indexPath = MNUtil.dbFolder + "/data/kb-search-index.json"
        let indexData = MNUtil.readJSON(indexPath);

        if (!indexData || !indexData.cards) {
          MNUtil.showHUD("索引未找到，请先更新搜索索引")
          return
        }

        allCards = indexData.cards;
        metadata = indexData.metadata || {};
      }

      MNUtil.log(`主知识库加载完成：${allCards.length} 张卡片`);

      // 1.2 加载主知识库增量索引（如果存在）
      let incrementalPath = MNUtil.dbFolder + "/data/kb-incremental-index.json";
      if (MNUtil.isfileExists(incrementalPath)) {
        let incrementalData = MNUtil.readJSON(incrementalPath);
        if (incrementalData && incrementalData.cards) {
          MNUtil.log(`加载主知识库增量索引：${incrementalData.cards.length} 张卡片`);

          // 合并并去重（基于 noteId）
          const existingIds = new Set(allCards.map(card => card.id));
          for (const card of incrementalData.cards) {
            if (!existingIds.has(card.id)) {
              allCards.push(card);
            }
          }
        }
      }

      // ========== 第2部分：加载中间知识库 ==========
      MNUtil.log("=== 开始加载中间知识库 ===");

      let intermediateCards = [];

      // 2.1 尝试加载中间知识库的分片索引
      let intermediateManifestPath = MNUtil.dbFolder + "/data/intermediate-kb-index-manifest.json"
      let intermediateManifest = MNUtil.readJSON(intermediateManifestPath);

      if (intermediateManifest && intermediateManifest.parts) {
        // 分片模式：加载所有分片
        MNUtil.log("加载中间知识库分片索引数据");

        for (const partInfo of intermediateManifest.parts) {
          let partPath = MNUtil.dbFolder + "/data/" + partInfo.filename;
          let partData = MNUtil.readJSON(partPath);

          if (partData && partData.data) {
            intermediateCards = intermediateCards.concat(partData.data);
          }
        }

      } else {
        // 旧版模式：尝试加载单文件
        MNUtil.log("尝试加载旧版中间知识库单文件索引");
        let intermediateIndexPath = MNUtil.dbFolder + "/data/intermediate-kb-index.json"
        let intermediateIndexData = MNUtil.readJSON(intermediateIndexPath);

        if (intermediateIndexData && intermediateIndexData.cards) {
          intermediateCards = intermediateIndexData.cards;
        } else {
          MNUtil.log("中间知识库索引未找到（跳过）");
        }
      }

      // 2.2 加载中间知识库的增量索引（如果存在）
      let intermediateIncrementalPath = MNUtil.dbFolder + "/data/intermediate-kb-incremental-index.json";
      if (MNUtil.isfileExists(intermediateIncrementalPath)) {
        let intermediateIncrementalData = MNUtil.readJSON(intermediateIncrementalPath);
        if (intermediateIncrementalData && intermediateIncrementalData.cards) {
          MNUtil.log(`加载中间知识库增量索引：${intermediateIncrementalData.cards.length} 张卡片`);

          // 合并并去重（基于 noteId）
          const existingIntermediateIds = new Set(intermediateCards.map(card => card.id));
          for (const card of intermediateIncrementalData.cards) {
            if (!existingIntermediateIds.has(card.id)) {
              intermediateCards.push(card);
            }
          }
        }
      }

      if (intermediateCards.length > 0) {
        MNUtil.log(`中间知识库加载完成：${intermediateCards.length} 张卡片`);

        // ========== 第3部分：合并两个知识库 ==========
        // 使用 Set 去重，以主知识库的卡片为准
        const mainCardIds = new Set(allCards.map(card => card.id));
        let addedCount = 0;

        for (const card of intermediateCards) {
          if (!mainCardIds.has(card.id)) {
            allCards.push(card);
            addedCount++;
          }
        }

        MNUtil.log(`合并完成：主知识库 ${allCards.length - addedCount} 张，中间知识库新增 ${addedCount} 张`);
      } else {
        MNUtil.log("中间知识库为空，仅使用主知识库数据");
      }

      // ========== 第4部分：构建完整的索引数据并发送到前端 ==========
      const fullIndexData = {
        cards: allCards,
        metadata: {
          totalCards: allCards.length,
          updateTime: metadata.updateTime || Date.now(),
          ...metadata
        }
      };

      MNUtil.log(`=== 数据准备完成：共 ${allCards.length} 张卡片 ===`);

      // 等待 WebView 加载完成
      await MNUtil.delay(0.5)

      // 调用 Bridge 方法加载数据（只调用一次，传递合并后的数据）
      let script = `window.Bridge.loadSearchIndex(${JSON.stringify(fullIndexData)})`
      let input = await KnowledgeBaseUtils.webViewController.runJavaScript(script)

      if (input) {
        MNUtil.showHUD(`加载成功：${allCards.length} 张卡片`)
      }

    } catch (error) {
      MNUtil.showHUD("加载索引失败：" + error.message)
      KnowledgeBaseUtils.addErrorLog(error, "loadSearchDataToWebView")
    }
  }

  /**
   * 响应其他插件的打开请求（插件通信）
   */
  MNKnowledgeBaseClass.prototype.onOpenKnowledgeBaseSearch = function(sender) {
    if (typeof MNUtil === 'undefined') return
    if (self.window !== self.appInstance.focusWindow) return

    try {
      let userInfo = sender.userInfo || {}

      // 确保控制器已初始化（使用新的延迟初始化方法）
      KnowledgeBaseUtils.checkWebViewController()

      // 如果已显示，直接返回前台
      if (!KnowledgeBaseUtils.webViewController.view.hidden) {
        MNUtil.studyView.bringSubviewToFront(KnowledgeBaseUtils.webViewController.view)
        return
      }

      // 显示窗口（支持自定义位置）
      let beginFrame = userInfo.beginFrame
      let endFrame = userInfo.endFrame
      KnowledgeBaseUtils.webViewController.show(beginFrame, endFrame)

      // 加载数据
      this.loadSearchDataToWebView()

    } catch (error) {
      KnowledgeBaseUtils.addErrorLog(error, "onOpenKnowledgeBaseSearch")
    }
  }

  // ============================================
  // Prototype 方法 - 用于插件通信
  // ============================================

  /**
   * 打开可视化搜索 WebView (Prototype 版本)
   *
   * 此方法为插件通信专用,通过 self.openSearchWebView() 调用
   * 显示可视化搜索界面
   */
  MNKnowledgeBaseClass.prototype.openSearchWebView = async function() {
    try {
      MNLog.log("【openSearchWebView 开始】")
      this.checkPopover()

      // 确保控制器已初始化
      KnowledgeBaseUtils.checkWebViewController()
      MNLog.log("【检查点1】控制器已初始化")

      const controller = KnowledgeBaseUtils.webViewController
      MNLog.log("【检查点2】view.hidden=" + controller.view.hidden + ", onAnimate=" + controller.onAnimate)

      // 如果已显示且不在动画中,直接置于前台
      if (!controller.view.hidden && !controller.onAnimate) {
        MNLog.log("【进入分支】已显示且不在动画中 - bring to front")
        MNUtil.studyView.bringSubviewToFront(controller.view)
        MNLog.log("【返回】从已显示分支返回")
        return
      }

      // 如果正在动画中,等待动画完成后重新调用
      if (controller.onAnimate) {
        MNLog.log("【进入分支】正在动画中 - 等待 0.5s 后重新调用")
        await MNUtil.delay(0.5)
        MNLog.log("【重新调用】递归调用 openSearchWebView")
        return this.openSearchWebView()
      }

      MNLog.log("【进入分支】首次打开流程")

      // 根据 WebView 加载状态决定处理方式
      if (!controller.webViewLoaded) {
        // WebView 未加载:加载 HTML 并显示窗口
        MNLog.log("【加载HTML】webViewLoaded=false，开始加载")
        MNUtil.showHUD("正在加载搜索界面,请稍候...")
        controller.loadHTMLFile()
        MNLog.log("【加载HTML】loadHTMLFile 调用完成")

        // 显示窗口
        MNLog.log("【显示窗口】调用 show() 方法")
        await controller.show(
          null,
          { x: 50, y: 50, width: 800, height: 800 }
        )
        MNLog.log("【显示完成】show() 方法返回")

      } else {
        // WebView 已加载:直接显示窗口
        MNLog.log("【跳过HTML】webViewLoaded=true，HTML 已加载")

        // 显示窗口
        MNLog.log("【显示窗口】调用 show() 方法")
        await controller.show(
          null,
          { x: 50, y: 50, width: 800, height: 800 }
        )
        MNLog.log("【显示完成】show() 方法返回")
      }

      MNLog.log("【openSearchWebView 结束】成功")

    } catch (error) {
      MNLog.log("【错误】openSearchWebView 发生异常: " + error)
      MNUtil.showHUD("打开可视化搜索失败")
      KnowledgeBaseUtils.addErrorLog(error, "openSearchWebView")
    }
  }


  // 返回定义的插件类，MarginNote 会自动实例化这个类
  return MNKnowledgeBaseClass;
};
