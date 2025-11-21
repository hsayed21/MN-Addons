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
        self.preExcerptRootNote = MNNote.new("marginnote4app://note/B48C92CF-A5FD-442A-BF8C-53E1E801F05D")
        self.classInputRootNote = MNNote.new("marginnote4app://note/9F2D24D3-5348-4677-9DCD-01A6C9C1303A")
        if (self.classInputRootNote) {
          KnowledgeBaseUtils.log("上课输入根卡片存在:", "sceneWillConnect", self.classInputRootNote.noteTitle)
          self.classDateNotes = self.classInputRootNote.childNotes
          if (self.classDateNotes.length > 0) {
            KnowledgeBaseUtils.log(`上课输入根卡片下有 ${self.classDateNotes.length} 个日期分类卡片`, "sceneWillConnect", self.classDateNotes.map(n=>n.noteTitle).join(", ") )
          }
        }
        self.dateObj = MNUtil.getDateObject()
        self.todayDateStr = `${self.dateObj.year}.${self.dateObj.month}.${self.dateObj.day}`
        KnowledgeBaseUtils.log("今日日期", "sceneWillConnect", self.todayDateStr)
        // MNUtil.showHUD(self.todayDateStr)

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
        self.preExcerptMode = false  // 预摘录模式
        self.classAutoMoveMode = false
        MNUtil.addObserver(self, 'onPopupMenuOnNote:', 'PopupMenuOnNote')
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
            'UITextViewTextDidEndEditingNotification',
            'PopupMenuOnNote',
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

          // MNUtil.log("【新卡片检测】noteId: " + focusNote.noteId);
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
          if (KnowledgeBaseConfig.config.classificationMode) {
            KnowledgeBaseClassUtils.createClassificationNoteAfterTextEditingInMindMap(note)
          }
          if (KnowledgeBaseConfig.config.classAutoPinMode) {
            pinnerUtils.pinCard(note.noteId, { section: "class"})
          }
          if (self.classAutoMoveMode) {
            MNUtil.undoGrouping(()=>{
              switch (note.colorIndex) {
                case 2:  // 定义
                  self.classTodayDefClassificationNote.addChild(note) 
                  break;
                case 10: // 命题
                  self.classTodayThmClassificationNote.addChild(note)
                  break;
                default:
                  self.classTodayNote.addChild(note)
                  break;
              }
              note.focusInMindMap(0.3)
            })
          }
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
        const startTime = Date.now();
        const noteId = sender.userInfo.noteid
        const note = MNNote.new(noteId)
        if (!note) return

        // KnowledgeBaseUtils.log("开始执行 onProcessNewExcerpt", "onProcessNewExcerpt", {
        //   noteId: noteId,
        //   excerptOCRMode: KnowledgeBaseConfig.config.excerptOCRMode,
        //   classificationMode: KnowledgeBaseConfig.config.classificationMode,
        //   preExcerptMode: self.preExcerptMode,
        //   classAutoMoveMode: self.classAutoMoveMode,
        //   timestamp: startTime
        // })

        if (KnowledgeBaseConfig.config.excerptOCRMode > 0) {
          // const ocrStartTime = Date.now();
          // KnowledgeBaseUtils.log("开始 OCR 处理", "onProcessNewExcerpt", {
          //   noteId: noteId,
          //   mode: KnowledgeBaseConfig.config.excerptOCRMode,
          //   preExcerptMode: self.preExcerptMode
          // })

          let OCRResult = await KnowledgeBaseNetwork.OCRToTitle(note, KnowledgeBaseConfig.config.excerptOCRMode, self.preExcerptMode)

          // KnowledgeBaseUtils.log("OCR 处理完成", "onProcessNewExcerpt", {
          //   noteId: noteId,
          //   success: !!OCRResult,
          //   durationMs: Date.now() - ocrStartTime
          // })

          if (OCRResult) {
            IntermediateKnowledgeIndexer.addToIncrementalIndex(note)
            // KnowledgeBaseUtils.log("已添加到增量索引", "onProcessNewExcerpt", { noteId: noteId })
          }
        }

        if (KnowledgeBaseConfig.config.classificationMode) {  // 归类模式
          // KnowledgeBaseUtils.log("进入归类模式", "onProcessNewExcerpt", {
          //   noteId: noteId,
          //   elapsedMs: Date.now() - startTime
          // })

          MNUtil.undoGrouping(()=>{
            // const classificationStartTime = Date.now();
            KnowledgeBaseClassUtils.makeNoteAfterProcessNewExcerpt(note, false)
            // KnowledgeBaseUtils.log("归类模式处理完成", "onProcessNewExcerpt", {
            //   noteId: noteId,
            //   durationMs: Date.now() - classificationStartTime
            // })
          })

          // KnowledgeBaseUtils.log("归类模式执行完成", "onProcessNewExcerpt", {
          //   noteId: noteId,
          //   totalDurationMs: Date.now() - startTime
          // })
          return
        }

        if (self.preExcerptMode && self.preExcerptRootNote) {
          // 预摘录模式：自动移动到预备知识库
          // KnowledgeBaseUtils.log("进入预摘录模式", "onProcessNewExcerpt", {
          //   noteId: noteId,
          //   elapsedMs: Date.now() - startTime
          // })

          MNUtil.undoGrouping(()=>{
            // const preExcerptStartTime = Date.now();
            self.preExcerptRootNote.addChild(note)
            KnowledgeBaseTemplate.toNoExcerptVersion(note)
            // KnowledgeBaseUtils.log("预摘录模式处理完成", "onProcessNewExcerpt", {
            //   noteId: noteId,
            //   durationMs: Date.now() - preExcerptStartTime
            // })
          })

          // KnowledgeBaseUtils.log("预摘录模式执行完成", "onProcessNewExcerpt", {
          //   noteId: noteId,
          //   totalDurationMs: Date.now() - startTime
          // })
          return
        }

        if (self.classAutoMoveMode && self.classTodayNote) {
          // KnowledgeBaseUtils.log("进入上课模式", "onProcessNewExcerpt", {
          //   noteId: noteId,
          //   noteColor: note.colorIndex,
          //   elapsedMs: Date.now() - startTime
          // })

          MNUtil.undoGrouping(()=>{
            // const classAutoMoveModeStartTime = Date.now();
            switch (note.colorIndex) {
              case 2:  // 定义
                self.classTodayDefClassificationNote.addChild(note)
                // KnowledgeBaseUtils.log("上课模式：添加到定义分类", "onProcessNewExcerpt", { noteId: noteId })
                break;
              case 10: // 命题
                self.classTodayThmClassificationNote.addChild(note)
                // KnowledgeBaseUtils.log("上课模式：添加到命题分类", "onProcessNewExcerpt", { noteId: noteId })
                break;
              default:
                self.classTodayNote.addChild(note)
                // KnowledgeBaseUtils.log("上课模式：添加到今日卡片", "onProcessNewExcerpt", { noteId: noteId })
                break;
            }
            // KnowledgeBaseUtils.log("上课模式处理完成", "onProcessNewExcerpt", {
            //   noteId: noteId,
            //   durationMs: Date.now() - classAutoMoveModeStartTime
            // })
          })
          // return
        }

        if (KnowledgeBaseTemplate.getNoteType(note, true) == "命题" && KnowledgeBaseConfig.config.excerptOCRMode > 0) {
          // KnowledgeBaseUtils.log("检测到命题卡片，开始处理", "onProcessNewExcerpt", {
          //   noteId: noteId,
          //   noteType: "命题",
          //   elapsedMs: Date.now() - startTime
          // })

          // const propositionStartTime = Date.now();
          let processedNote = KnowledgeBaseTemplate.toNoExcerptVersion(note)
          let brotherIndex = processedNote.indexInBrotherNotes
          let targetParentNote = processedNote.indexInBrotherNotes>0 ? (
            KnowledgeBaseTemplate.getNoteType(processedNote.parentNote.childNotes[brotherIndex - 1]) == "归类"?processedNote.parentNote.childNotes[brotherIndex - 1]: processedNote.parentNote
          ): processedNote.parentNote;

          // KnowledgeBaseUtils.log("目标父卡片", "onProcessNewExcerpt", {
          //   noteId: processedNote.noteId,
          //   targetParentType: KnowledgeBaseTemplate.getNoteType(targetParentNote),
          //   targetParentTitle: targetParentNote.noteTitle
          // })

          if (KnowledgeBaseTemplate.getNoteType(targetParentNote) == "归类"  && KnowledgeBaseTemplate.parseNoteTitle(targetParentNote).type == "命题") {
            processedNote.moveTo(targetParentNote)
            KnowledgeBaseTemplate.changeTitle(processedNote, true)
            KnowledgeBaseTemplate.mergeTemplateAndAutoMoveNoteContent(processedNote, true)
            // KnowledgeBaseUtils.log("命题处理完成（归类父卡片）", "onProcessNewExcerpt", {
            //   noteId: processedNote.noteId,
            //   durationMs: Date.now() - propositionStartTime
            // })
            if (KnowledgeBaseConfig.config.classAutoPinMode) {
              pinnerUtils.pinCard(processedNote.noteId, { section: "class"})
            }
          } 
          // else {
            // KnowledgeBaseUtils.log("目标卡片不是归类卡片", "onProcessNewExcerpt",
            //   {
            //     type: KnowledgeBaseTemplate.getNoteType(targetParentNote, true)||"No?" + KnowledgeBaseTemplate.getNoteType(targetParentNote),
            //     title: targetParentNote.noteTitle
            //   }
            // )
            // KnowledgeBaseTemplate.mergeTemplateAndAutoMoveNoteContent(processedNote, true)
            // KnowledgeBaseUtils.log("命题处理完成（非归类父卡片）", "onProcessNewExcerpt", {
            //   noteId: processedNote.noteId,
            //   durationMs: Date.now() - propositionStartTime
            // })
          // }
          processedNote.focusInMindMap(0.3)

          // KnowledgeBaseUtils.log("命题处理流程完成", "onProcessNewExcerpt", {
          //   noteId: processedNote.noteId,
          //   totalDurationMs: Date.now() - startTime
          // })
        } 
        // else {
        //   KnowledgeBaseUtils.log("未能一键制卡", "onProcessNewExcerpt",
        //     {
        //       type: KnowledgeBaseTemplate.getNoteType(note, true)||"No?" + KnowledgeBaseTemplate.getNoteType(note),
        //       excerptOCRMode: KnowledgeBaseConfig.config.excerptOCRMode,
        //       parentType: KnowledgeBaseTemplate.getNoteType(note.parentNote)
        //     }
        //   )
        // }

        // KnowledgeBaseUtils.log("onProcessNewExcerpt 执行完成", "onProcessNewExcerpt", {
        //   noteId: noteId,
        //   totalDurationMs: Date.now() - startTime
        // })
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
          // === 中间知识库管理 ===
          self.tableItem('📝   索引中间知识库', 'updateIntermediateKnowledgeIndex:'),
          self.tableItem('-------------------------------',''),
          // === 可视化工具 ===
          self.tableItem('🌐   可视化搜索', 'openSearchWebView:'),
          self.tableItem('💬   评论管理器', 'openCommentManager:'),
          self.tableItem('-------------------------------',''),
          self.tableItem('🤖  模式','closeOCRMode'),
          self.tableItem('    🤖 摘录自动 OCR', 'excerptOCRModeSetting:', button, !KnowledgeBaseConfig.config.excerptOCRMode==0),
          self.tableItem('    🤖 预摘录卡片', 'preExcerptModeToggled:', undefined, self.preExcerptMode),
          self.tableItem('    🤖 卡片预处理', 'preProcessModeToggled:', undefined, KnowledgeBaseConfig.config.preProcessMode),
          self.tableItem('    🤖 上课-自动移动', 'classAutoMoveModeToggled:', undefined, self.classAutoMoveMode),
          self.tableItem('    🤖 上课-自动 Pin', 'classAutoPinModeToggled:', undefined, KnowledgeBaseConfig.config.classAutoPinMode),
          self.tableItem('    🤖 归类', 'classificationModeToggled:', undefined, KnowledgeBaseConfig.config.classificationMode),
          self.tableItem('-------------------------------',''),
          self.tableItem('⚙️  OCR 模型设置', 'excerptOCRModelSetting:', button),
          self.tableItem('    ⚙️ Unicode OCR 模型', 'excerptOCRModelSettingForMode1:', button),
          self.tableItem('    ⚙️ Markdown OCR 模型', 'excerptOCRModelSettingForMode2:', button),
          self.tableItem('    ⚙️ OCR 概念提取 模型', 'excerptOCRModelSettingForMode3:', button),
          self.tableItem('-------------------------------',''),
          // self.tableItem('🤖   测试 AI', 'testAI:'),
          // self.tableItem('🎯   AI 推荐卡片', 'askAIForRelevantCards:'),
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

    askAIForRelevantCards: async function() {
      self.askAIForRelevantCards()
    },

    testAI: async function() {
      self.testAI()
    },

    closeOCRMode: function() {
      self.checkPopover()
      KnowledgeBaseConfig.config.excerptOCRMode = 0
      KnowledgeBaseConfig.save()
      MNUtil.showHUD("已关闭摘录 OCR 模式", 1)
    },

    openCommentManager: async function() {
      self.openCommentManager()
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
          self.tableItem(name, 'setExcerptOCRMode:', index, KnowledgeBaseConfig.config.excerptOCRMode === index)
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

    classificationModeToggled: function() {
      self.checkPopover()
      // KnowledgeBaseConfig.config.classificationMode = !KnowledgeBaseConfig.config.classificationMode
      KnowledgeBaseConfig.config.classificationMode = !KnowledgeBaseConfig.config.classificationMode
      KnowledgeBaseConfig.save()

      MNUtil.showHUD(KnowledgeBaseConfig.config.classificationMode ? "已开启归类模式" : "已关闭归类模式", 1)

      // KnowledgeBaseConfig.config.lastClassificationNoteId = null
      // KnowledgeBaseConfig.save()
    },

    preExcerptModeToggled: function() {
      self.checkPopover()
      self.preExcerptMode = !self.preExcerptMode

      MNUtil.showHUD(self.preExcerptMode ? "已开启预摘录模式" : "已关闭预摘录模式", 1)
    },

    preProcessModeToggled: function() {
      self.checkPopover()
      KnowledgeBaseConfig.config.preProcessMode = !KnowledgeBaseConfig.config.preProcessMode
      KnowledgeBaseConfig.save()
      MNUtil.showHUD(KnowledgeBaseConfig.config.preProcessMode ? "已开启卡片预处理模式" : "已关闭卡片预处理模式", 1)
    },

    classAutoPinModeToggled: function() {
      self.checkPopover()
      KnowledgeBaseConfig.config.classAutoPinMode = !KnowledgeBaseConfig.config.classAutoPinMode
      KnowledgeBaseConfig.save()
      MNUtil.showHUD(KnowledgeBaseConfig.config.classAutoPinMode ? "已开启「上课-自动 Pin」模式" : "已关闭「上课-自动 Pin」模式", 1)
    },

    classAutoMoveModeToggled: function() {
      self.checkPopover()
      self.classAutoMoveMode = !self.classAutoMoveMode
      MNUtil.showHUD(self.classAutoMoveMode ? "已开启「上课-自动移动」模式" : "已关闭「上课-自动移动」模式", 1)
      self.classTodayNote = self.classDateNotes.find(note => {
        return note.noteTitle.includes(self.todayDateStr)
      })
      if (self.classTodayNote) {
        KnowledgeBaseUtils.log("有今日上课卡片", "classAutoMoveModeToggled")
        self.classTodayDefClassificationNote = self.classTodayNote.childNotes.find(note => {
          return KnowledgeBaseTemplate.getNoteType(note) === "归类" && note.noteTitle.includes(self.todayDateStr) && note.noteTitle.includes("定义")
        })
        if (!self.classTodayDefClassificationNote) {
          KnowledgeBaseUtils.log("没有今日上课定义归类卡片", "classAutoMoveModeToggled")
          self.classTodayDefClassificationNote = KnowledgeBaseTemplate.createClassificationNoteAsChildNote(self.classTodayNote, self.todayDateStr, "定义", true, true)
          self.classTodayNote.addChild(self.classTodayDefClassificationNote)
        } else {
          KnowledgeBaseUtils.log("找到今日上课定义归类卡片", "classAutoMoveModeToggled", self.classTodayDefClassificationNote.noteTitle)
        }
        self.classTodayThmClassificationNote = self.classTodayNote.childNotes.find(note => {
          return KnowledgeBaseTemplate.getNoteType(note) === "归类" && note.noteTitle.includes(self.todayDateStr) && note.noteTitle.includes("命题")
        })
        if (!self.classTodayThmClassificationNote) {
          KnowledgeBaseUtils.log("没有今日上课命题归类卡片", "classAutoMoveModeToggled")
          self.classTodayThmClassificationNote = KnowledgeBaseTemplate.createClassificationNoteAsChildNote(self.classTodayNote, self.todayDateStr, "命题", true, true)
          self.classTodayNote.addChild(self.classTodayThmClassificationNote)
        } else {
          KnowledgeBaseUtils.log("找到今日上课命题归类卡片", "classAutoMoveModeToggled", self.classTodayThmClassificationNote.noteTitle)
        }
      } else {
        KnowledgeBaseUtils.log("没有今日上课卡片", "classAutoMoveModeToggled")
        self.classTodayNote = MNNote.clone("marginnote4app://note/B6F95A90-7565-4479-94E3-CA7BFAE8C58F")
        self.classTodayNote.title = "📥 上课输入 - " + self.todayDateStr
        self.classInputRootNote.addChild(self.classTodayNote)
        self.classTodayDefClassificationNote = KnowledgeBaseTemplate.createClassificationNoteAsChildNote(self.classTodayNote, self.todayDateStr, "定义", true, true)
        self.classTodayThmClassificationNote = KnowledgeBaseTemplate.createClassificationNoteAsChildNote(self.classTodayNote, self.todayDateStr, "命题", true, true)
      }
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

        // 🆕 显示索引模式选择对话框
        // UIAlertView.showWithTitleButtonsCallback(
          
        //   async (alert, buttonIndex) => {
            
        //   }
        // );

        let result = await MNUtil.userSelect(
          "选择索引模式",
          "",
          ["🚀 轻量索引", "💪 全量索引（含同义词）"]
        )

        if (result === 0) return; // 取消

        // 确定模式
        const mode = result === 1 ? "light" : "full";
        const modeText = mode === "light" ? "轻量" : "全量";

        let focusNote = MNNote.getFocusNote()
        let rootNote
        if (focusNote) {
          rootNote = focusNote
        } else {
          rootNote = MNNote.new("marginnote4app://note/B2A5D567-909C-44E8-BC08-B1532D3D0AA1")
        }
        // let rootNote = MNNote.new("marginnote4app://note/B2A5D567-909C-44E8-BC08-B1532D3D0AA1")

        if (!rootNote) {
          MNUtil.showHUD("知识库不存在！");
          return;
        }

        // 显示开始提示
        MNUtil.showHUD(`开始构建${modeText}索引，请稍候...`);

        // 延迟执行以确保 UI 更新
        await MNUtil.delay(0.1);

        // 🆕 异步构建索引（传入 mode 参数）
        const manifest = await KnowledgeBaseIndexer.buildSearchIndex([rootNote], undefined, mode);

        // 🆕 记录本次构建的模式
        KnowledgeBaseConfig.recordLastIndexMode(mode);

        // 检查结果
        if (manifest && manifest.metadata && manifest.metadata.totalCards > 0) {
          MNUtil.showHUD(`${modeText}索引构建成功！共 ${manifest.metadata.totalCards} 张卡片，${manifest.metadata.totalParts} 个分片`);
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

        MNLog.log("=== 中间知识库索引构建开始 ===");

        // 中间知识库根卡片ID数组
        // TODO: 这里需要配置你的中间知识库根卡片ID
        const intermediateRootIds = [
          "marginnote4app://note/FC6181AF-1BAC-4D1D-9B86-7FAB3391F3EC",
          "marginnote4app://note/9D234BE6-9A7C-4BEC-8924-F18132FB6E64",
          "marginnote4app://note/74785805-661C-4836-AFA6-C85697056B0C",
          "marginnote4app://note/B48C92CF-A5FD-442A-BF8C-53E1E801F05D", // 预备知识库
        ];

        MNLog.log(`配置的根卡片ID: ${intermediateRootIds.length} 个`);

        // 验证根卡片
        const rootNotes = [];
        for (const rootId of intermediateRootIds) {
          const note = MNNote.new(rootId);
          if (note) {
            rootNotes.push(note);
          }
        }

        MNLog.log(`验证通过的根卡片: ${rootNotes.length} 个`);

        if (rootNotes.length === 0) {
          MNUtil.showHUD("中间知识库根卡片未配置或不存在！");
          MNLog.log("❌ 所有根卡片验证失败");
          return;
        }

        // 显示开始提示
        MNUtil.showHUD("开始构建中间知识库索引，请稍候...");

        // 延迟执行以确保 UI 更新
        await MNUtil.delay(0.1);

        // 异步构建索引
        const manifest = await IntermediateKnowledgeIndexer.buildSearchIndex(rootNotes);

        // 检查结果
        MNLog.log(`索引构建结果: totalCards=${manifest?.metadata?.totalCards || 0}, totalParts=${manifest?.metadata?.totalParts || 0}`);

        if (manifest && manifest.metadata && manifest.metadata.totalCards > 0) {
          MNUtil.showHUD(`中间知识库索引构建成功！共 ${manifest.metadata.totalCards} 张卡片，${manifest.metadata.totalParts} 个分片`);
          MNLog.log("✅ 中间知识库索引构建成功");
        } else {
          MNUtil.showHUD("没有找到可索引的卡片");
          MNLog.log("❌ 没有找到可索引的卡片");
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







    // 生命周期测试

    onPopupMenuOnNote: async function (sender) {
      if (KnowledgeBaseConfig.config.classificationMode && sender.userInfo.note.noteId) {
        let note = MNNote.new(sender.userInfo.note.noteId, false)
        if (!note) { return }
        if (KnowledgeBaseTemplate.getNoteType(note) && KnowledgeBaseTemplate.parseNoteTitle(note)) {
          // KnowledgeBaseUtils.log("复制前的类型"+ KnowledgeBaseTemplate.getNoteType(note), "onPopupMenuOnNote")
          switch (KnowledgeBaseTemplate.getNoteType(note)) {
            case "归类":
              MNUtil.copy(
                KnowledgeBaseTemplate.parseNoteTitle(note).content || ""
              )
              break;
            default:
              MNUtil.copy(
                KnowledgeBaseTemplate.parseNoteTitle(note).prefixContent + "｜" + KnowledgeBaseTemplate.parseNoteTitle(note).content || ""
              )
              break;
          }
          // KnowledgeBaseUtils.log("复制后的类型"+ KnowledgeBaseTemplate.getNoteType(note), "onPopupMenuOnNote")
        }

      }
    },
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
            case "openCommentManager":
              await self.openCommentManager()
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
   * 测试 AI 功能
   *
   * 功能流程：
   * 1. 获取用户输入的问题
   * 2. 调用 MNAI 插件进行处理
   * 3. 将结果添加到当前焦点卡片的评论中，如果没有焦点卡片则复制到剪贴板
   *
   * @requires MNAI 插件必须已安装并运行
   */
  MNKnowledgeBaseClass.prototype.testAI = async function() {
    try {
      this.checkPopover() // 关闭菜单

      // 1. 获取用户输入
      let question = await MNUtil.input("请输入问题","")

      if (!question || question.button !== 1 || !question.input || question.input.trim() === "") {
        return;
      }

      // 2. 调用 MNAI 并等待结果
      const output = await KnowledgeBaseNetwork.callMNAIWithNotification(question.input)

      // 3. 处理结果
      if (output) {
        KnowledgeBaseUtils.log("AI 结果: " + output)

        const focusNote = MNNote.getFocusNote()
        if (focusNote) {
          MNUtil.undoGrouping(() => {
            focusNote.appendMarkdownComment(output)
          })
          MNUtil.showHUD("✅ 已添加到卡片评论")
        } else {
          // 如果没有焦点卡片，复制结果到剪贴板
          MNUtil.copy(output)
          MNUtil.showHUD("✅ 已复制到剪贴板")
        }
      } else {
        MNUtil.showHUD("❌ 未获取到 AI 结果")
      }
    } catch (error) {
      KnowledgeBaseUtils.addErrorLog(error, "testAI")
      MNUtil.showHUD("❌ 调用失败: " + error.message)
    }
  }

  /**
   * 从问题中提取关键词（简单分词 + 停用词过滤）
   * @param {string} question - 用户输入的问题
   * @returns {Array<string>} 关键词数组
   */
  MNKnowledgeBaseClass.prototype.extractKeywords = function(question) {
    // 停用词列表（中文常见停用词）
    const stopwords = new Set([
      '的', '是', '在', '了', '和', '与', '或', '有', '对', '为', '以',
      '及', '等', '中', '也', '就', '都', '而', '要', '可以', '这', '那',
      '什么', '怎么', '如何', '哪', '谁', '吗', '呢', '吧', '啊', '呀'
    ]);

    // 简单分词：按空格、标点分割
    const words = question
      .replace(/[，。！？；：、""''（）【】《》\s]+/g, ' ')
      .split(' ')
      .map(w => w.trim())
      .filter(w => w.length > 0 && !stopwords.has(w));

    return words;
  }

  /**
   * 根据关键词搜索候选卡片（基于标题匹配）
   * 使用渐进式搜索：优先返回全部匹配的卡片，如果结果不足则降级搜索
   * @param {Array<string>} keywords - 关键词数组
   * @returns {Promise<Array>} 候选卡片数组，包含 {id, title, type, score}
   */
  MNKnowledgeBaseClass.prototype.searchCardsByKeywords = async function(keywords) {
    try {
      // 加载知识库索引数据
      let allCards = [];
      let manifestPath = MNUtil.dbFolder + "/data/kb-search-index-manifest.json";
      let manifest = MNUtil.readJSON(manifestPath);

      if (manifest && manifest.parts) {
        // 加载所有分片
        for (const partInfo of manifest.parts) {
          let partPath = MNUtil.dbFolder + "/data/" + partInfo.filename;
          let partData = MNUtil.readJSON(partPath);
          if (partData && partData.data) {
            allCards = allCards.concat(partData.data);
          }
        }
      }

      // 加载增量索引
      let incrementalPath = MNUtil.dbFolder + "/data/kb-incremental-index.json";
      if (MNUtil.isfileExists(incrementalPath)) {
        let incrementalData = MNUtil.readJSON(incrementalPath);
        if (incrementalData && incrementalData.cards) {
          const existingIds = new Set(allCards.map(card => card.id));
          for (const card of incrementalData.cards) {
            if (!existingIds.has(card.id)) {
              allCards.push(card);
            }
          }
        }
      }

      if (allCards.length === 0) {
        return [];
      }

      // 渐进式搜索：逐步降低匹配要求直到找到足够的结果
      const minResultCount = 5;  // 每轮至少需要 5 张卡片
      const maxResultCount = 20; // 最多返回 20 张卡片

      // 定义搜索轮次（从严格到宽松）
      const searchRounds = [
        { name: "全部匹配", minMatch: keywords.length },
        { name: "2/3 匹配", minMatch: Math.ceil(keywords.length * 2 / 3) },
        { name: "1/2 匹配", minMatch: Math.ceil(keywords.length * 1 / 2) },
        { name: "任意匹配", minMatch: 1 }
      ];

      // 按关键词匹配并评分
      const allResults = [];
      for (const card of allCards) {
        const title = (card.title || "").toLowerCase();
        let matchCount = 0;

        // 计算匹配的关键词数量
        for (const keyword of keywords) {
          if (title.includes(keyword.toLowerCase())) {
            matchCount++;
          }
        }

        // 至少匹配一个关键词才加入候选
        if (matchCount > 0) {
          allResults.push({
            id: card.id,
            title: card.title,
            type: card.type,
            matchCount: matchCount,
            score: matchCount * 10 + (card.score || 0)  // 匹配数量 × 10 + 原始评分
          });
        }
      }

      // 按评分排序（评分越高越相关）
      allResults.sort((a, b) => b.score - a.score);

      // 渐进式搜索：从严格到宽松
      for (const round of searchRounds) {
        // 过滤符合当前轮次要求的卡片
        const roundResults = allResults.filter(card => card.matchCount >= round.minMatch);

        if (roundResults.length >= minResultCount) {
          // 找到足够的结果，返回 top 20
          const finalResults = roundResults.slice(0, maxResultCount);
          KnowledgeBaseUtils.log(
            `搜索成功（${round.name}）：找到 ${roundResults.length} 张卡片，返回前 ${finalResults.length} 张`,
            "searchCardsByKeywords"
          );
          return finalResults;
        }
      }

      // 如果所有轮次都没有找到足够的结果，返回所有匹配的卡片
      const finalResults = allResults.slice(0, maxResultCount);
      KnowledgeBaseUtils.log(
        `搜索完成：共找到 ${allResults.length} 张卡片，返回前 ${finalResults.length} 张`,
        "searchCardsByKeywords"
      );
      return finalResults;

    } catch (error) {
      KnowledgeBaseUtils.addErrorLog(error, "searchCardsByKeywords");
      return [];
    }
  }

  /**
   * 构建 AI 提示词（包含原始问题和卡片标题）
   * @param {string} question - 用户的原始问题
   * @param {Array} candidateCards - 候选卡片数组
   * @returns {string} AI 提示词
   */
  MNKnowledgeBaseClass.prototype.buildAIPromptForCardRecommendation = function(question, candidateCards) {
    let prompt = "# 任务\n";
    prompt += "请分析以下候选卡片，找出与用户问题最相关的卡片。\n\n";

    prompt += "# 用户的原始问题\n";
    prompt += `"${question}"\n\n`;

    prompt += "# 候选卡片列表\n";
    candidateCards.forEach((card, index) => {
      prompt += `${index + 1}. [ID: ${card.id}] ${card.title}`;
      if (card.type) {
        prompt += ` (类型: ${card.type})`;
      }
      prompt += "\n";
    });

    prompt += "\n# 输出要求\n";
    prompt += "请返回最相关的 5-8 张卡片的 ID，用逗号分隔。\n";
    prompt += "分析时请重点关注卡片标题与原始问题的**语义相关性**，而不仅仅是关键词匹配。\n";
    prompt += "格式示例：card-1001, card-1005, card-1012\n\n";
    prompt += "推荐的卡片 ID：";

    return prompt;
  }

  /**
   * 从 AI 响应中解析卡片 ID 列表
   * @param {string} response - AI 响应文本
   * @returns {Array<string>} 卡片 ID 数组
   */
  MNKnowledgeBaseClass.prototype.parseCardIdsFromAIResponse = function(response) {
    try {
      // 尝试提取 ID 列表（支持多种格式）
      const idPattern = /\b[A-F0-9]{8}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{12}\b/gi;
      const matches = response.match(idPattern);

      if (matches && matches.length > 0) {
        // 去重并返回
        return [...new Set(matches)];
      }

      // 备用：尝试按逗号分割
      const parts = response.split(/[,，\s]+/).map(s => s.trim()).filter(s => s.length > 0);
      return parts.slice(0, 10);  // 最多返回 10 个

    } catch (error) {
      KnowledgeBaseUtils.addErrorLog(error, "parseCardIdsFromAIResponse");
      return [];
    }
  }

  /**
   * 在 search.html 中展示 AI 推荐的卡片（简化版）
   *
   * 架构说明：
   * - 不再尝试在主搜索结果中高亮卡片（受分页限制）
   * - 改为使用独立的底部推荐面板展示
   * - 面板会自动查找完整卡片数据并渲染
   *
   * @param {Array<string>} cardIds - 推荐的卡片 ID 数组
   */
  MNKnowledgeBaseClass.prototype.showRecommendedCardsInWebView = async function(cardIds) {
    try {
      // 1. 打开 WebView
      await this.openSearchWebView();

      // 2. 强制刷新数据（解决数据陈旧问题）
      MNUtil.showHUD("正在刷新数据...");
      await MNUtil.delay(0.3); // 确保 WebView 完全显示

      const controller = KnowledgeBaseUtils.webViewController;
      if (controller && controller.webViewLoaded) {
        await controller.refreshAllData();
      }

      // 3. 等待数据加载完成并验证卡片存在（最多10秒）
      const maxWaitTime = 10000;
      const checkInterval = 300;
      let elapsedTime = 0;

      while (elapsedTime < maxWaitTime) {
        const checkScript = `
          (function() {
            if (!window.state || !window.state.cards || window.state.cards.length === 0) {
              return "loading";
            }

            // 检查推荐的卡片是否在当前数据集中
            const cardIds = ${JSON.stringify(cardIds)};
            const existingIds = window.state.cards.map(c => c.id);
            const foundCount = cardIds.filter(id => existingIds.includes(id)).length;

            if (foundCount === 0) {
              return "cards_not_found";
            }

            return "ready";
          })();
        `;

        try {
          const status = await controller.runJavaScript(checkScript);

          if (status === "ready") {
            break;
          } else if (status === "cards_not_found") {
            MNUtil.showHUD("⚠️ 推荐的卡片不在当前索引中");
            return;
          }
        } catch (e) {
          // 继续等待
        }

        await MNUtil.delay(checkInterval / 1000);
        elapsedTime += checkInterval;
      }

      if (elapsedTime >= maxWaitTime) {
        MNUtil.showHUD("⚠️ 数据加载超时");
        return;
      }

      // 3. 调用 Bridge 方法显示推荐卡片
      const showScript = `
        (function() {
          try {
            if (window.Bridge && typeof window.Bridge.showAIRecommendations === 'function') {
              window.Bridge.showAIRecommendations(${JSON.stringify(cardIds)});
              return { success: true };
            } else {
              return { error: 'Bridge.showAIRecommendations 方法不存在' };
            }
          } catch (e) {
            return { error: e.message };
          }
        })();
      `;

      const result = await KnowledgeBaseUtils.webViewController.runJavaScript(showScript);

      if (result.error) {
        MNUtil.showHUD("❌ " + result.error);
      } else {
        MNUtil.showHUD(`✅ 已展示 ${cardIds.length} 张推荐卡片`);
      }

    } catch (error) {
      KnowledgeBaseUtils.addErrorLog(error, "showRecommendedCardsInWebView");
      MNUtil.showHUD("❌ 展示推荐卡片失败");
    }
  }

  /**
   * AI 推荐相关卡片（RAG 模式）
   *
   * 功能流程：
   * 1. 获取用户问题
   * 2. 提取关键词并搜索候选卡片
   * 3. 将候选卡片的标题发送给 AI 分析
   * 4. AI 返回最相关的卡片 ID
   * 5. 在 search.html 中可视化展示推荐卡片
   */
  MNKnowledgeBaseClass.prototype.askAIForRelevantCards = async function() {
    try {
      this.checkPopover();

      // 1. 获取用户问题
      let question = await MNUtil.input("请输入您的问题", "");
      if (!question || question.button !== 1 || !question.input || question.input.trim() === "") {
        return;
      }
      const userQuestion = question.input.trim();

      // 2. 提取关键词（简单分词）
      const keywords = this.extractKeywords(userQuestion);
      KnowledgeBaseUtils.log("提取的关键词: " + keywords.join(", "), "askAIForRelevantCards");

      // 3. 在知识库中搜索候选卡片（基于标题）
      MNUtil.showHUD("正在搜索知识库...");
      const candidateCards = await this.searchCardsByKeywords(keywords);

      if (candidateCards.length === 0) {
        MNUtil.showHUD("未找到相关卡片");
        return;
      }

      KnowledgeBaseUtils.log(`找到 ${candidateCards.length} 张候选卡片`, "askAIForRelevantCards");

      // 4. 构建 AI 提示词（只包含卡片ID和标题）
      const prompt = this.buildAIPromptForCardRecommendation(userQuestion, candidateCards);

      // 5. 调用 AI 获取推荐的卡片 ID
      MNUtil.showHUD("正在分析相关性...");
      const aiResponse = await KnowledgeBaseNetwork.callMNAIWithNotification(prompt);

      if (!aiResponse) {
        MNUtil.showHUD("AI 分析失败");
        return;
      }

      // 6. 解析 AI 返回的卡片 ID 列表
      const recommendedCardIds = this.parseCardIdsFromAIResponse(aiResponse);

      if (recommendedCardIds.length === 0) {
        MNUtil.showHUD("AI 未找到相关卡片");
        return;
      }

      KnowledgeBaseUtils.log("AI 推荐的卡片 ID: " + recommendedCardIds.join(", "), "askAIForRelevantCards");

      // 7. 在 search.html 中展示推荐的卡片
      await this.showRecommendedCardsInWebView(recommendedCardIds);

    } catch (error) {
      KnowledgeBaseUtils.addErrorLog(error, "askAIForRelevantCards");
      MNUtil.showHUD("AI 推荐失败: " + error.message);
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





  /**
   * 加载搜索数据到 WebView（合并主知识库和中间知识库）
   */
  MNKnowledgeBaseClass.prototype.loadSearchDataToWebView = async function() {
    try {
      let allCards = [];
      let metadata = {};

      // ========== 第1部分：加载主知识库 ==========
      MNUtil.log("=== 开始加载主知识库 ===");

      let manifest = null;
      let actualMode = null;

      // 🆕 智能选择：比较时间戳，加载最新的索引
      let fullManifest = null;
      let lightManifest = null;

      // 读取全量索引 manifest（如果存在）
      let fullManifestPath = `${MNUtil.dbFolder}/data/kb-search-index-full-manifest.json`;
      if (MNUtil.isfileExists(fullManifestPath)) {
        fullManifest = MNUtil.readJSON(fullManifestPath);
        KnowledgeBaseUtils.log(
          "📖 找到全量索引",
          "loadSearchDataToWebView",
          {
            updateTime: fullManifest?.metadata?.updateTime,
            lastUpdated: fullManifest?.metadata?.lastUpdated,
            totalCards: fullManifest?.metadata?.totalCards
          }
        );
      }

      // 读取轻量索引 manifest（如果存在）
      let lightManifestPath = `${MNUtil.dbFolder}/data/kb-search-index-light-manifest.json`;
      if (MNUtil.isfileExists(lightManifestPath)) {
        lightManifest = MNUtil.readJSON(lightManifestPath);
        KnowledgeBaseUtils.log(
          "📖 找到轻量索引",
          "loadSearchDataToWebView",
          {
            updateTime: lightManifest?.metadata?.updateTime,
            lastUpdated: lightManifest?.metadata?.lastUpdated,
            totalCards: lightManifest?.metadata?.totalCards
          }
        );
      }

      // 🆕 智能选择：优先使用配置中的模式，再比较时间戳
      const preferredMode = KnowledgeBaseConfig.config.searchIndexMode || "light";

      // 第一优先级：使用配置中的模式
      if (preferredMode === "full" && fullManifest) {
        manifest = fullManifest;
        actualMode = "full";
        KnowledgeBaseUtils.log(
          "✅ 使用全量索引（配置优先）",
          "loadSearchDataToWebView",
          {updateTime: fullManifest.metadata?.updateTime}
        );
      } else if (preferredMode === "light" && lightManifest) {
        manifest = lightManifest;
        actualMode = "light";
        KnowledgeBaseUtils.log(
          "✅ 使用轻量索引（配置优先）",
          "loadSearchDataToWebView",
          {updateTime: lightManifest.metadata?.updateTime}
        );
      } else if (fullManifest && lightManifest) {
        // 第二优先级：配置模式不可用，比较时间戳
        const fullTime = fullManifest.metadata?.updateTime || 0;
        const lightTime = lightManifest.metadata?.updateTime || 0;

        if (fullTime >= lightTime) {
          manifest = fullManifest;
          actualMode = "full";
          KnowledgeBaseUtils.log(
            "✅ 使用全量索引（时间戳较新）",
            "loadSearchDataToWebView",
            {fullTime, lightTime}
          );
        } else {
          manifest = lightManifest;
          actualMode = "light";
          KnowledgeBaseUtils.log(
            "✅ 使用轻量索引（时间戳较新）",
            "loadSearchDataToWebView",
            {lightTime, fullTime}
          );
        }
      } else if (fullManifest) {
        // 只有全量索引
        manifest = fullManifest;
        actualMode = "full";
        KnowledgeBaseUtils.log(
          "✅ 使用全量索引（仅此可用）",
          "loadSearchDataToWebView"
        );
      } else if (lightManifest) {
        // 只有轻量索引
        manifest = lightManifest;
        actualMode = "light";
        KnowledgeBaseUtils.log(
          "✅ 使用轻量索引（仅此可用）",
          "loadSearchDataToWebView"
        );
      } else {
        // 都不存在，后续会尝试 legacy
        KnowledgeBaseUtils.log(
          "⚠️ 未找到分片索引",
          "loadSearchDataToWebView",
          {message: "将尝试旧版单文件索引"}
        );
      }

      // 1.3 加载分片索引数据
      if (manifest && manifest.parts) {
        MNUtil.log(`加载 ${actualMode} 模式分片索引数据（${manifest.parts.length} 个分片）`);

        for (const partInfo of manifest.parts) {
          let partPath = MNUtil.dbFolder + "/data/" + partInfo.filename;
          let partData = MNUtil.readJSON(partPath);

          if (partData && partData.data) {
            allCards = allCards.concat(partData.data);
          }
        }

        metadata = manifest.metadata || {};
        KnowledgeBaseUtils.log(
          "📊 主知识库 manifest 已加载",
          "loadSearchDataToWebView",
          {
            mode: actualMode,
            metadata: metadata
          }
        );

      } else {
        // 1.4 尝试加载旧版单文件索引
        MNUtil.log("[3/3] 分片索引不存在，尝试加载旧版单文件索引");
        let indexPath = MNUtil.dbFolder + "/data/kb-search-index.json"
        let indexData = MNUtil.readJSON(indexPath);

        if (!indexData || !indexData.cards) {
          // 全部加载失败，提示用户构建索引
          MNUtil.showHUD("❌ 未找到任何索引文件\n请先执行「🔄 索引知识库」");
          MNUtil.log("错误：未找到任何可用的索引文件（full/light/旧版）");
          return
        }

        MNUtil.log("✅ 找到旧版单文件索引");
        actualMode = "legacy";
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
          mode: actualMode,  // 🆕 记录实际加载的索引模式（full/light/legacy）
          ...metadata
        }
      };

      MNUtil.log(`=== 数据准备完成：共 ${allCards.length} 张卡片 ===`);
      KnowledgeBaseUtils.log(
        "📤 发送数据到前端",
        "loadSearchDataToWebView",
        {
          totalCards: fullIndexData.cards.length,
          metadata: fullIndexData.metadata
        }
      );

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

      // 检查是否需要重新加载 HTML
      const needReload = controller.currentHTMLType !== 'search' || !controller.webViewLoaded
      MNLog.log("【HTML类型检查】currentHTMLType=" + controller.currentHTMLType +
                ", webViewLoaded=" + controller.webViewLoaded +
                ", needReload=" + needReload)

      // 如果正在动画中,等待动画完成后重新调用
      if (controller.onAnimate) {
        MNLog.log("【进入分支】正在动画中 - 等待 0.5s 后重新调用")
        await MNUtil.delay(0.5)
        MNLog.log("【重新调用】递归调用 openSearchWebView")
        return this.openSearchWebView()
      }

      // 如果 HTML 已正确加载，直接显示窗口（无需重新加载）
      if (!needReload) {
        MNLog.log("【优化分支】search.html 已加载，直接显示窗口")

        // 不传 endFrame，让 show() 方法自动恢复上次保存的大小
        await controller.show()
        MNLog.log("【显示完成】窗口已显示")
        return
      }

      // 需要重新加载 HTML
      MNLog.log("【加载分支】需要重新加载 HTML")
      MNUtil.showHUD("正在加载搜索界面,请稍候...")
      controller.loadHTMLFile()
      MNLog.log("【加载HTML】loadHTMLFile 调用完成")

      // 显示窗口
      MNLog.log("【显示窗口】调用 show() 方法")

      // 不传 endFrame，让 show() 方法自动恢复上次保存的大小
      await controller.show()
      MNLog.log("【显示完成】show() 方法返回")

      MNLog.log("【openSearchWebView 结束】成功")

    } catch (error) {
      MNLog.log("【错误】openSearchWebView 发生异常: " + error)
      MNUtil.showHUD("打开可视化搜索失败")
      KnowledgeBaseUtils.addErrorLog(error, "openSearchWebView")
    }
  }

  // ============================================
  // AI 助手功能 - 与 MNAI 插件集成
  // ============================================

  /**
   * 基于知识库上下文向 AI 提问
   * @param {string} question - 用户的问题
   * @param {Array} contextCards - 上下文卡片数组（最多 5 张）
   * @returns {Promise<string|null>} AI 的响应文本，失败返回 null
   */
  MNKnowledgeBaseClass.prototype.askAIWithContext = async function(question, contextCards) {
    try {
      KnowledgeBaseUtils.log("========================================")
      KnowledgeBaseUtils.log("【Native】askAIWithContext 方法被调用")
      KnowledgeBaseUtils.log("【Native】📝 问题: " + question)
      KnowledgeBaseUtils.log("【Native】📚 卡片数: " + (contextCards ? contextCards.length : 0))

      if (contextCards && contextCards.length > 0) {
        KnowledgeBaseUtils.log("【Native】📋 上下文卡片列表:")
        contextCards.forEach((card, idx) => {
          KnowledgeBaseUtils.log(`【Native】  ${idx + 1}. [${card.type || '无类型'}] ${card.title}`)
        })
      }

      // 1. 检查 MNAI 插件是否可用
      KnowledgeBaseUtils.log("【Native】🔍 检查 chatAIUtils 是否存在...")
      const chatAIUtilsExists = typeof chatAIUtils !== 'undefined'
      KnowledgeBaseUtils.log("【Native】chatAIUtils 存在: " + chatAIUtilsExists)

      if (!chatAIUtilsExists) {
        KnowledgeBaseUtils.log("【Native】❌ chatAIUtils 未定义，MNAI 插件可能未安装或未启动")
        MNUtil.showHUD("❌ 请先安装并打开 MNAI 插件");
        return null;
      }

      KnowledgeBaseUtils.log("【Native】✅ chatAIUtils 可用")

      // 检查 notifyController
      const hasNotifyController = chatAIUtils.notifyController !== undefined
      KnowledgeBaseUtils.log("【Native】notifyController 存在: " + hasNotifyController)

      if (hasNotifyController) {
        const hasLastResponse = chatAIUtils.notifyController.lastResponse !== undefined
        const hasCheckAutoClose = typeof chatAIUtils.notifyController.checkAutoClose === 'function'
        KnowledgeBaseUtils.log("【Native】lastResponse 属性存在: " + hasLastResponse)
        KnowledgeBaseUtils.log("【Native】checkAutoClose 方法存在: " + hasCheckAutoClose)
      }

      // 2. 构建包含知识库上下文的完整提示词
      KnowledgeBaseUtils.log("【Native】⏳ 开始构建上下文...")
      const context = this.buildContextFromCards(contextCards || []);
      KnowledgeBaseUtils.log("【Native】上下文长度: " + context.length + " 字符")

      const fullPrompt = context
        ? `基于以下知识库内容回答问题：\n\n${context}\n\n问题：${question}`
        : question;

      KnowledgeBaseUtils.log("【Native】完整提示词长度: " + fullPrompt.length + " 字符")
      KnowledgeBaseUtils.log("【Native】提示词前100字符: " + fullPrompt.substring(0, 100))

      // 3. 发送通知到 MNAI 插件
      KnowledgeBaseUtils.log("【Native】⏳ 准备发送 postNotification...")
      KnowledgeBaseUtils.log("【Native】通知名称: customChat")

      MNUtil.postNotification("customChat", { user: fullPrompt });
      KnowledgeBaseUtils.log("【Native】✅ postNotification 执行完成")

      // 4. 等待初始延迟
      KnowledgeBaseUtils.log("【Native】⏳ 等待初始延迟 0.5 秒...")
      await MNUtil.delay(0.5);
      KnowledgeBaseUtils.log("【Native】✅ 初始延迟完成，开始轮询...")

      // 5. 轮询获取响应（最多 30 秒，60 次尝试 × 0.5 秒）
      for (let i = 0; i < 60; i++) {
        // 每 10 次打印一次进度
        if (i % 10 === 0) {
          KnowledgeBaseUtils.log(`【Native】⏳ 轮询第 ${i + 1} 次 / 60`)
        }

        // 检查 lastResponse
        const hasResponse = chatAIUtils?.notifyController?.lastResponse
        if (hasResponse) {
          KnowledgeBaseUtils.log("【Native】✅ 在第 " + (i + 1) + " 次轮询中发现 lastResponse!")
          const result = chatAIUtils.notifyController.lastResponse;
          KnowledgeBaseUtils.log("【Native】响应长度: " + result.length + " 字符")
          KnowledgeBaseUtils.log("【Native】响应前100字符: " + result.substring(0, 100))

          // 清空响应，避免下次重复读取
          chatAIUtils.notifyController.lastResponse = "";
          KnowledgeBaseUtils.log("【Native】✅ 已清空 lastResponse")

          // 触发 MNAI 的自动关闭检查
          if (chatAIUtils.notifyController.checkAutoClose) {
            KnowledgeBaseUtils.log("【Native】⏳ 调用 checkAutoClose...")
            chatAIUtils.notifyController.checkAutoClose(true, 0.5);
            KnowledgeBaseUtils.log("【Native】✅ checkAutoClose 完成")
          } else {
            KnowledgeBaseUtils.log("【Native】⚠️ checkAutoClose 方法不存在")
          }

          KnowledgeBaseUtils.log("【Native】✅ 成功返回 AI 响应")
          return result;
        }

        // 每 0.5 秒检查一次
        await MNUtil.delay(0.5);
      }

      // 6. 超时处理
      KnowledgeBaseUtils.log("【Native】❌ 轮询 60 次后超时（30 秒）")
      KnowledgeBaseUtils.log("【Native】最终 chatAIUtils 状态:")
      KnowledgeBaseUtils.log("【Native】  chatAIUtils 存在: " + (typeof chatAIUtils !== 'undefined'))
      if (typeof chatAIUtils !== 'undefined') {
        KnowledgeBaseUtils.log("【Native】  notifyController 存在: " + (chatAIUtils.notifyController !== undefined))
        if (chatAIUtils.notifyController) {
          KnowledgeBaseUtils.log("【Native】  lastResponse 值: " + (chatAIUtils.notifyController.lastResponse || "(空)"))
        }
      }

      MNUtil.showHUD("⏱️ AI 响应超时，请稍后重试");
      return null;

    } catch (error) {
      KnowledgeBaseUtils.log("【Native】❌ 发生异常: " + error.message)
      KnowledgeBaseUtils.log("【Native】❌ 错误堆栈: " + error.stack)

      MNUtil.showHUD("AI 调用失败: " + error.message);
      KnowledgeBaseUtils.addErrorLog(error, "askAIWithContext");
      return null;
    }
  }

  /**
   * 将卡片数组转换为结构化的上下文文本
   * @param {Array} cards - 卡片对象数组，每个对象包含 {id, title, type, searchText}
   * @returns {string} 格式化的 Markdown 文本
   */
  MNKnowledgeBaseClass.prototype.buildContextFromCards = function(cards) {
    if (!cards || cards.length === 0) {
      return "";
    }

    // 限制最多 5 张卡片，避免上下文过长
    const limitedCards = cards.slice(0, 5);

    let context = "【知识库相关内容】\n\n";

    limitedCards.forEach((card, index) => {
      context += `${index + 1}. **${card.title || "(无标题)"}**\n`;

      if (card.type) {
        context += `   - 类型：${card.type}\n`;
      }

      if (card.searchText) {
        // 截取搜索文本的前 300 个字符，避免过长
        const preview = card.searchText.length > 300
          ? card.searchText.substring(0, 300) + "..."
          : card.searchText;
        context += `   - 内容：${preview}\n`;
      }

      context += "\n";
    });

    return context;
  }

  /**
   * 为评论管理器准备数据
   *
   * @param {MNNote} note - 要处理的卡片
   * @returns {Object} 包含完整评论数据、字段信息和摘录区信息的对象
   *
   * @description
   * 此函数为可视化评论管理器准备所有必要的数据，包括：
   * 1. 所有评论的详细数据（含 Base64 图片）
   * 2. 字段结构信息（含插入索引）
   * 3. 摘录区信息
   *
   * @example
   * const data = this.prepareCommentDataForManager(note);
   * // 返回格式：
   * // {
   * //   noteId: "xxx",
   * //   noteTitle: "卡片标题",
   * //   comments: [{index, type, text, imageBase64, ...}],
   * //   fields: [{name, topInsertIndex, bottomInsertIndex, ...}],
   * //   excerptArea: {name, insertIndex}
   * // }
   */
  MNKnowledgeBaseClass.prototype.prepareCommentDataForManager = function(note) {
    try {
      KnowledgeBaseUtils.log("开始准备评论数据", "prepareCommentDataForManager", {
        noteId: note.noteId,
        noteTitle: note.noteTitle
      });

      // 1. 解析卡片的字段结构
      const parsedComments = KnowledgeBaseTemplate.parseNoteComments(note);

      // 2. 准备评论数据（参考 mnsnipaste 的实现）
      const commentsData = [];
      note.comments.forEach((rawComment, index) => {
        const commentData = {
          index: index,
          originalType: rawComment.type  // 保留原始类型（5种基础类型）
        };

        // 根据类型添加必要字段（参考 mnsnipaste webviewController.js:1913-1959）
        try {
          switch (rawComment.type) {
            case "TextNote":
              commentData.text = rawComment.text || "";
              commentData.markdown = rawComment.markdown;

              // 检查是否是链接到其他笔记的特殊情况
              if (/^marginnote\dapp:\/\//.test(commentData.text)) {
                const noteid = commentData.text.split("note/")[1];
                if (noteid) {
                  try {
                    const linkedNote = MNNote.new(noteid);
                    if (linkedNote) {
                      commentData.linkedNoteTitle = linkedNote.noteTitle || "(无标题)";
                    }
                  } catch (e) {
                    KnowledgeBaseUtils.log("获取链接笔记失败", "prepareCommentDataForManager", {
                      index, noteid, error: e.message
                    });
                  }
                }
              }
              break;

            case "PaintNote":
              // 手写/图片评论
              if (rawComment.paint) {
                try {
                  const imageData = MNUtil.getMediaByHash(rawComment.paint);
                  if (imageData) {
                    commentData.imageBase64 = imageData.base64Encoding();  // 纯 Base64 字符串
                  } else {
                    KnowledgeBaseUtils.log("图片数据为空", "prepareCommentDataForManager", {index});
                  }
                } catch (error) {
                  KnowledgeBaseUtils.log("获取图片失败", "prepareCommentDataForManager", {
                    index, error: error.message
                  });
                }
              }
              break;

            case "HtmlNote":
              commentData.text = rawComment.text || "";
              commentData.htmlText = rawComment.html || rawComment.text;
              break;

            case "LinkNote":
              // 合并评论：可能包含文本或图片
              if (rawComment.q_htext) {
                commentData.text = rawComment.q_htext;
              }

              if (rawComment.q_hpic && rawComment.q_hpic.paint) {
                try {
                  const imageData = MNUtil.getMediaByHash(rawComment.q_hpic.paint);
                  if (imageData) {
                    commentData.imageBase64 = imageData.base64Encoding();
                  }
                } catch (error) {
                  KnowledgeBaseUtils.log("获取合并图片失败", "prepareCommentDataForManager", {
                    index, error: error.message
                  });
                }
              }

              // 存储 textFirst 标志（用于判断优先显示文本还是图片）
              commentData.textFirst = note.textFirst;

              // 尝试获取链接目标卡片的标题（如果是链接评论）
              if (rawComment.note) {
                try {
                  const linkedNote = MNNote.new(rawComment.note);
                  if (linkedNote) {
                    commentData.linkedNoteTitle = linkedNote.noteTitle || "(无标题)";
                  }
                } catch (error) {
                  KnowledgeBaseUtils.log("获取链接卡片标题失败", "prepareCommentDataForManager", {
                    index, error: error.message
                  });
                }
              }
              break;

            case "AudioNote":
              // 音频评论（暂不处理）
              commentData.text = "(音频评论)";
              break;

            default:
              commentData.text = rawComment.text || "";
          }
        } catch (error) {
          KnowledgeBaseUtils.log("处理评论数据失败", "prepareCommentDataForManager", {
            index, type: rawComment.type, error: error.message
          });
        }

        commentsData.push(commentData);
      });

      // 3. 准备字段摘要数组
      const fieldsData = parsedComments.htmlCommentsObjArr.map(fieldObj => {
        // 提取字段名称：去除 HTML 标签和冒号
        const fieldName = fieldObj.text.replace(/<\/?[^>]+>/g, '').replace(/[：:]/g, '').trim();

        return {
          name: fieldName,  // 纯文本字段名
          text: fieldObj.text,  // 原始 HTML 文本
          index: fieldObj.index,
          topInsertIndex: fieldObj.excludingFieldBlockIndexArr.length > 0
            ? fieldObj.excludingFieldBlockIndexArr[0]
            : fieldObj.index + 1,  // 字段下方第一个位置
          bottomInsertIndex: fieldObj.excludingFieldBlockIndexArr.length > 0
            ? fieldObj.excludingFieldBlockIndexArr[fieldObj.excludingFieldBlockIndexArr.length - 1] + 1
            : fieldObj.index + 1,  // 字段下方最后一个位置的下一个位置
          includingFieldBlockIndexArr: fieldObj.includingFieldBlockIndexArr,
          excludingFieldBlockIndexArr: fieldObj.excludingFieldBlockIndexArr
        };
      });

      // 4. 准备摘录区信息
      const excerptArea = {
        name: "摘录区",
        insertIndex: parsedComments.htmlCommentsObjArr.length > 0
          ? parsedComments.htmlCommentsObjArr[0].index  // 第一个字段之前
          : note.comments.length  // 如果没有字段，则是卡片最底端
      };

      // 5. 构建完整数据
      const fullData = {
        noteId: note.noteId,
        noteTitle: note.noteTitle || "(无标题)",
        comments: commentsData,
        fields: fieldsData,
        excerptArea: excerptArea
      };

      KnowledgeBaseUtils.log("评论数据准备完成", "prepareCommentDataForManager", {
        noteId: note.noteId,
        commentsCount: commentsData.length,
        fieldsCount: fieldsData.length
      });

      return fullData;

    } catch (error) {
      KnowledgeBaseUtils.addErrorLog(error, "prepareCommentDataForManager");
      MNUtil.showHUD("准备评论数据失败: " + error.message);
      return null;
    }
  }

  /**
   * 打开评论管理器
   *
   * @param {MNNote} note - 要管理评论的卡片（可选，不传则使用当前焦点卡片）
   *
   * @description
   * 此函数打开可视化评论管理器界面，支持：
   * 1. 查看所有评论（含图片、手写等）
   * 2. 选择评论
   * 3. 移动评论到字段
   * 4. 提取和删除评论
   *
   * @example
   * this.openCommentManager(note);
   * this.openCommentManager();  // 使用当前焦点卡片
   */
  MNKnowledgeBaseClass.prototype.openCommentManager = async function(note) {
    try {
      KnowledgeBaseUtils.log("开始", "openCommentManager")

      // 1. 获取目标卡片（参数或当前焦点卡片）
      const targetNote = note || MNNote.getFocusNote()
      if (!targetNote) {
        MNUtil.showHUD("请先选中一个卡片")
        KnowledgeBaseUtils.log("未找到目标卡片", "openCommentManager")
        return
      }

      KnowledgeBaseUtils.log("目标卡片: " + targetNote.noteTitle, "openCommentManager")

      // 2. 保存当前操作的卡片引用（供 Bridge 使用）
      self.currentManagedNote = targetNote
      KnowledgeBaseUtils.log("已保存 currentManagedNote", "openCommentManager")

      // 3. 确保控制器已初始化
      KnowledgeBaseUtils.checkWebViewController()
      const controller = KnowledgeBaseUtils.webViewController

      KnowledgeBaseUtils.log("控制器状态", "openCommentManager", {
        hidden: controller.view.hidden,
        onAnimate: controller.onAnimate,
        currentHTMLType: controller.currentHTMLType
      })

      // 4. 检查是否需要重新加载 HTML
      const needReload = controller.currentHTMLType !== 'comment-manager' || !controller.webViewLoaded
      KnowledgeBaseUtils.log("HTML类型检查", "openCommentManager", {
        currentHTMLType: controller.currentHTMLType,
        webViewLoaded: controller.webViewLoaded,
        needReload: needReload
      })

      // 5. 如果正在动画中，等待动画完成后重新调用
      if (controller.onAnimate) {
        KnowledgeBaseUtils.log("正在动画中，延迟 0.5s 后重试", "openCommentManager")
        await MNUtil.delay(0.5)
        return this.openCommentManager(targetNote)
      }

      // 6. 如果 HTML 已正确加载，直接显示窗口并加载数据
      if (!needReload) {
        KnowledgeBaseUtils.log("【优化分支】comment-manager.html 已加载，直接显示窗口", "openCommentManager")
        await controller.show(
          null,
          { x: 50, y: 50, width: 720, height: 720 }
        )
        await controller.loadCommentData(targetNote.noteId)
        KnowledgeBaseUtils.log("数据已刷新", "openCommentManager")
        return
      }

      // 7. 需要重新加载 HTML
      KnowledgeBaseUtils.log("【加载分支】需要重新加载 HTML", "openCommentManager")
      MNUtil.showHUD("正在加载评论管理器,请稍候...")
      controller.loadCommentManagerHTML()
      KnowledgeBaseUtils.log("loadCommentManagerHTML 调用完成", "openCommentManager")

      // 8. 显示窗口
      await controller.show(
        null,
        { x: 50, y: 50, width: 720, height: 720 }
      )
      KnowledgeBaseUtils.log("窗口显示完成", "openCommentManager")

      // 9. 等待 WebView 加载完成后加载数据
      await MNUtil.delay(0.5)
      await controller.loadCommentData(targetNote.noteId)
      KnowledgeBaseUtils.log("数据已发送到 HTML 端", "openCommentManager")

    } catch (error) {
      KnowledgeBaseUtils.log("发生异常: " + error.message, "openCommentManager")
      MNUtil.showHUD("打开评论管理器失败: " + error.message)
      KnowledgeBaseUtils.addErrorLog(error, "openCommentManager")
    }
  }


  // 返回定义的插件类，MarginNote 会自动实例化这个类
  return MNKnowledgeBaseClass;
};
