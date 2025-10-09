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
      MNUtil.undoGrouping(()=>{
        try {
          KnowledgeBaseConfig.init(mainPath)
          self.toggled = false
          self.newExcerptWithOCRToTitle = false  // 新摘录 OCR 到标题
          self.preExcerptMode = false  // 预摘录模式
          // MNUtil.addObserver(self, 'onPopupMenuOnNote:', 'PopupMenuOnNote')
          MNUtil.addObserver(self, 'onProcessNewExcerpt:', 'ProcessNewExcerpt')
        } catch (error) {
          KnowledgeBaseUtils.addErrorLog(error, "sceneWillConnect")
        }
      })
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
          MNUtil.removeObserver(self, 'ProcessNewExcerpt')
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
      // JSB.log 用于调试输出，类似于 console.log
      // %@ 是 Objective-C 风格的字符串占位符
      JSB.log('MNLOG Open Notebook: %@',notebookid);
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

        if (self.newExcerptWithOCRToTitle) {
          await KnowledgeBaseNetwork.OCRToTitle(note)
        }
      } catch (error) {
        KnowledgeBaseUtils.addErrorLog(error, "onProcessNewExcerpt")
      }
    },

    queryAddonCommandStatus: function() {
      return MNUtil.studyMode !== 3
        ? {
            image: "logo.png",
            object: self,
            selector: "toggleAddon:",
            checked: self.toggled
          }
        : null
    },

    // 点击插件图标执行的方法。
    toggleAddon: async function(button) {
      try {
        self.toggled = !self.toggled
        MNUtil.refreshAddonCommands()

        let commandTable = [
          // === 索引管理 ===
          self.tableItem('🔄   索引知识库', 'updateSearchIndex:'),
          self.tableItem('📋   搜索知识库', 'searchForMarkdown:'),
          self.tableItem('-------------------------------',''),
          // === 中间知识库管理 ===
          self.tableItem('📝   索引中间知识库', 'updateIntermediateKnowledgeIndex:'),
          self.tableItem('🔎   搜索中间知识库', 'searchInIntermediateKB:'),
          self.tableItem('-------------------------------',''),
          // === 通用搜索（支持自定义类型）===
          self.tableItem('🔍   全部搜索', 'searchInKB:'),

          // === 快捷搜索 ===
          self.tableItem('    📚  知识卡片', 'searchWithPreset:', 'knowledge'),
          self.tableItem('    📘  仅定义', 'searchWithPreset:', 'definitions'),
          self.tableItem('    📁  仅归类', 'searchWithPreset:', 'classifications'),
          self.tableItem('    📒  定义与归类', 'searchWithPreset:', 'definitionsAndClassifications'),
          self.tableItem('-------------------------------',''),
          // === 配置管理 ===
          self.tableItem('📜   搜索历史', 'showSearchHistory:'),
          self.tableItem('🔍   搜索模式设置', 'configureSearchMode:'),
          self.tableItem('🔤   同义词管理', 'manageSynonyms:'),
          self.tableItem('-------------------------------',''),
          self.tableItem('⚙️   摘录 OCR 模型设置', 'excerptOCRModelSetting:', button),
          self.tableItem("🤖   摘录自动 OCR 到标题", 'newExcerptWithOCRToTitleToggled:', undefined, self.newExcerptWithOCRToTitle),
          self.tableItem('🤖   预摘录模式', 'preExcerptModeToggled:', undefined, self.preExcerptMode),
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

    newExcerptWithOCRToTitleToggled: function() {
      self.checkPopover()
      self.newExcerptWithOCRToTitle = !self.newExcerptWithOCRToTitle
      MNUtil.showHUD(self.newExcerptWithOCRToTitle ? "已开启摘录自动 OCR 到标题" : "已关闭摘录自动 OCR 到标题", 1)
    },

    preExcerptModeToggled: function() {
      self.checkPopover()
      self.preExcerptMode = !self.preExcerptMode
      MNUtil.showHUD(self.preExcerptMode ? "已开启预摘录模式" : "已关闭预摘录模式", 1)
    },
    openSetting: function() {
      MNUtil.showHUD("打开设置界面")
      // 关闭菜单
      if (self.popoverController) {
        self.popoverController.dismissPopoverAnimated(true);
      }
    },

    openKnowledgeBaseLibrary: function() {
      MNUtil.showHUD("打开文献数据库")
      // 关闭菜单
      if (self.popoverController) {
        self.popoverController.dismissPopoverAnimated(true);
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
     * 管理同义词
     */
    manageSynonyms: async function() {
      try {
        // 关闭菜单
        if (self.popoverController) {
          self.popoverController.dismissPopoverAnimated(true);
        }
        
        // 调用同义词管理界面
        await KnowledgeBaseTemplate.manageSynonymGroups();
      } catch (error) {
        MNUtil.showHUD("管理同义词失败: " + error.message);
        MNLog.error(error, "MNKnowledgeBase: manageSynonyms");
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
  
  // 返回定义的插件类，MarginNote 会自动实例化这个类
  return MNKnowledgeBaseClass;
};
