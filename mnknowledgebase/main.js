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
          self.toggled = false
          // 初始化搜索历史（最多保存5条）
          self.searchHistory = []
          self.maxSearchHistory = 5
          MNUtil.addObserver(self, 'onPopupMenuOnNote:', 'PopupMenuOnNote')
        } catch (error) {
          MNUtil.showHUD(error);
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
          MNUtil.removeObserver(self,'PopupMenuOnNote')
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
          self.tableItem('📋   搜索知识库(复制链接)', 'searchForMarkdown:'),
          self.tableItem('-------------------------------',''),
          // === 通用搜索（支持自定义类型）===
          self.tableItem('🔍   全部搜索(脑图定位)', 'searchInKB:', true),
          
          // === 快捷搜索 - 脑图定位 ===
          self.tableItem('    📚  知识卡片(脑图)', 'searchWithPreset:', {preset: 'knowledge', mode: 'mindmap'}),
          self.tableItem('    📘  仅定义(脑图)', 'searchWithPreset:', {preset: 'definitions', mode: 'mindmap'}),
          self.tableItem('    📁  仅归类(脑图)', 'searchWithPreset:', {preset: 'classifications', mode: 'mindmap'}),
          self.tableItem('    📒  定义与归类(脑图)', 'searchWithPreset:', {preset: 'definitionsAndClassifications', mode: 'mindmap'}),

          // === 快捷搜索 - 浮窗定位 ===
          self.tableItem('🔍   全部搜索(浮窗定位)', 'searchInKB:', false),
          self.tableItem('    📚  知识卡片(浮窗)', 'searchWithPreset:', {preset: 'knowledge', mode: 'float'}),
          self.tableItem('    📘  仅定义(浮窗)', 'searchWithPreset:', {preset: 'definitions', mode: 'float'}),
          self.tableItem('    📁  仅归类(浮窗)', 'searchWithPreset:', {preset: 'classifications', mode: 'float'}),
          self.tableItem('    📒  定义与归类(浮窗)', 'searchWithPreset:', {preset: 'definitionsAndClassifications', mode: 'float'}),
          self.tableItem('-------------------------------',''),
          // === 配置管理 ===
          self.tableItem('📜   搜索历史', 'showSearchHistory:'),
          self.tableItem('🔍   搜索模式设置', 'configureSearchMode:'),
          self.tableItem('🔤   同义词管理', 'manageSynonyms:'),
          self.tableItem('🚫   排除词管理', 'manageExclusions:'),
          self.tableItem('📤   分享索引文件', 'shareIndexFile:'),
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
        
        let rootNote = MNNote.getFocusNote();
        if (!rootNote) {
          MNUtil.showHUD("请先选择一个根卡片");
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
    
    searchInKB: async function(focusInMindMap = true) {
      try {
        self.checkPopover()
        
        // 异步加载搜索器
        const searcher = await FastSearcher.loadFromFile();
        if (!searcher) {
          MNUtil.showHUD("索引未找到，请先更新搜索索引");
          return;
        }

        // 注意：showSearchDialog 内部也需要支持异步搜索
        self.showSearchDialog(searcher, {}, focusInMindMap);
        
      } catch (error) {
        MNUtil.showHUD("快速搜索失败: " + error.message);
        MNLog.error(error, "MNKnowledgeBase: searchInKB");
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
        if (!self.searchHistory || self.searchHistory.length === 0) {
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
        const options = self.searchHistory.map((entry, index) => {
          const typeInfo = entry.types ? `[${entry.types.join(",")}]` : "[全部]";
          const timeInfo = formatTime(entry.timestamp);
          return `${index + 1}. ${timeInfo} - "${entry.keyword}" ${typeInfo} (${entry.results.length}个结果)`;
        });
        
        // 添加清空历史选项
        options.push("🗑️ 清空搜索历史");
        
        // 显示历史列表
        const choice = await MNUtil.userSelect(
          `搜索历史 (最近${self.searchHistory.length}条)`,
          "选择要查看的历史记录：",
          options
        );
        
        if (choice === 0) {
          // 用户取消
          return;
        } else if (choice === options.length) {
          // 清空历史
          this.clearSearchHistory();
        } else {
          // 显示选中的历史记录结果
          const selectedHistory = self.searchHistory[choice - 1];
          
          // 根据保存的模式确定 focusMode
          let focusMode = true;  // 默认脑图定位
          if (selectedHistory.mode === "浮窗定位") {
            focusMode = false;
          } else if (selectedHistory.mode === "复制链接") {
            focusMode = 'markdown';
          }
          
          // 尝试加载搜索器（用于返回搜索功能）
          const searcher = await FastSearcher.loadFromFile();
          
          // 重用之前的搜索结果
          const searchOptions = {
            types: selectedHistory.types,
            searchModeConfig: selectedHistory.searchModeConfig,
            originalKeyword: selectedHistory.keyword,
            isFromHistory: true
          };
          
          // 显示历史搜索结果
          this.showSearchResults(
            selectedHistory.results, 
            searcher, 
            searchOptions, 
            focusMode
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
      try {
        const confirm = await MNUtil.userSelect(
          "确认清空",
          "确定要清空所有搜索历史吗？此操作不可恢复。",
          ["取消", "确认清空"]
        );
        
        if (confirm === 2) {
          self.searchHistory = [];
          MNUtil.showHUD("搜索历史已清空");
        }
      } catch (error) {
        MNUtil.showHUD("清空历史失败: " + error.message);
        MNLog.error(error, "MNKnowledgeBase: clearSearchHistory");
      }
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
        await knowledgeBaseTemplate.configureSearchMode();
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
        await knowledgeBaseTemplate.manageSynonymGroups();
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
        await knowledgeBaseTemplate.manageExclusionGroups();
      } catch (error) {
        MNUtil.showHUD("管理排除词失败: " + error.message);
        MNLog.error(error, "MNKnowledgeBase: manageExclusions");
      }
    },

    /**
     * 使用预设类型进行快捷搜索
     * @param {Object} config - 配置对象 {preset: string, mode: string}
     */
    searchWithPreset: async function(config) {
      try {
        self.checkPopover();
        
        const { preset, mode } = config;
        
        // 异步加载搜索器
        const searcher = await FastSearcher.loadFromFile();
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
        
        // 根据 mode 确定定位方式
        const focusMode = mode === 'mindmap' ? true : false;
        
        // 显示搜索对话框，跳过类型选择
        const searchConfig = {
          enableTypeSelection: false,  // 禁用类型选择
          defaultTypes: types,         // 使用预设类型
          presetKey: preset            // 传递预设键用于显示
        };
        
        self.showSearchDialog(searcher, searchConfig, focusMode);
        
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
        const searcher = await FastSearcher.loadFromFile();
        if (!searcher) {
          MNUtil.showHUD("索引未找到，请先更新搜索索引");
          return;
        }
        
        // 获取知识卡片类型
        const types = SearchConfig.getTypesByPreset('knowledge');
        
        // 显示搜索对话框，使用知识卡片类型，使用 markdown 模式
        self.showSearchDialog(searcher, {
          enableTypeSelection: false,  // 禁用类型选择
          defaultTypes: types,         // 使用知识卡片类型
          presetKey: 'knowledge'       // 使用知识卡片预设
        }, 'markdown');
        
      } catch (error) {
        MNUtil.showHUD("搜索失败: " + error.message);
        MNLog.error(error, "MNKnowledgeBase: searchForMarkdown");
      }
    },


    // 生命周期测试

    onPopupMenuOnNote: async function (sender) {
      MNUtil.undoGrouping(()=>{
        try {
        } catch (error) {
          MNUtil.showHUD(error);
        }
      })
    }
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

  MNKnowledgeBaseClass.prototype.showSearchDialog = async function(searcher, config = {}, focusMode) {
    try {
      // 默认配置
      const defaultConfig = {
        enableTypeSelection: true,      // 是否允许选择类型
        defaultTypes: null,              // 默认搜索类型（null表示全部）
        showAdvancedOptions: false,     // 是否显示高级选项
        presetKey: null                  // 预设键名
      };
      
      const searchConfig = Object.assign({}, defaultConfig, config);
      
      // 步骤1：类型选择（如果启用）
      let selectedTypes = searchConfig.defaultTypes;
      if (searchConfig.enableTypeSelection && !selectedTypes) {
        selectedTypes = await this.selectSearchTypes();
        if (selectedTypes === "cancel") return; // 用户取消
      }
      
      // 步骤2：获取搜索模式配置
      const searchModeConfig = knowledgeBaseTemplate.getSearchConfig();
      const modeNames = {
        exact: "精确",
        synonym: "同义词",
        exclude: "排除词",
        full: "完整"
      };
      const modeText = modeNames[searchModeConfig.mode] || "精确";
      
      // 步骤3：构建标题信息
      let typeInfo = "(全部类型)";
      if (searchConfig.presetKey) {
        const preset = SearchConfig.typePresets[searchConfig.presetKey];
        typeInfo = preset ? `${preset.icon} ${preset.name}` : `(${selectedTypes.length}种类型)`;
      } else if (selectedTypes) {
        typeInfo = `(${selectedTypes.length}种类型)`;
      }
      
      // 步骤4：关键词输入
      let userInput = await MNUtil.userInput(
        `快速搜索 ${typeInfo} [${modeText}模式]`,
        "请输入搜索关键词：",
        ["取消", "搜索"]
      );
      
      if (userInput.button === 1) {
        let keyword = userInput.input.trim();
        if (!keyword) return;
        
        // 步骤5：根据配置扩展查询词
        let expandedKeyword = keyword;
        if (searchModeConfig.useSynonyms) {
          expandedKeyword = KnowledgeBaseIndexer.expandSearchQuery(keyword, true);
          MNUtil.log(`扩展后的查询: ${expandedKeyword}`);
        }
        
        // 步骤6：执行搜索
        this.performFastSearch(searcher, expandedKeyword, {
          types: selectedTypes,
          config: searchConfig,
          searchModeConfig: searchModeConfig,
          originalKeyword: keyword
        }, focusMode);
      }
    } catch (error) {
      MNUtil.showHUD("搜索对话框错误: " + error.message);
      MNLog.error(error, "MNKnowledgeBase: showSearchDialog");
    }
  }

  /**
   * 选择搜索类型
   */
  MNKnowledgeBaseClass.prototype.selectSearchTypes = async function() {
    try {
      const options = SearchConfig.getSearchTypeOptions();
      const displayOptions = options.map(opt => opt.name);
      displayOptions.push("⚙️ 自定义选择...");
      
      const choice = await MNUtil.userSelect(
        "选择搜索范围",
        "请选择要搜索的卡片类型：",
        displayOptions
      );
      
      if (choice === 0) return "cancel";
      
      if (choice < options.length + 1) {
        // 选择了预设
        return options[choice - 1].types;
      } else {
        // 自定义选择
        return await this.selectCustomTypes();
      }
    } catch (error) {
      MNLog.error(error, "MNKnowledgeBase: selectSearchTypes");
      return null; // 返回null表示搜索全部
    }
  }

  /**
   * 自定义类型选择
   */
  MNKnowledgeBaseClass.prototype.selectCustomTypes = async function() {
    const allTypes = ["定义", "命题", "例子", "反例", "归类", "思想方法", "问题", "思路", "总结"];
    const selectedTypes = [];
    
    // 使用多次单选来模拟多选
    for (let type of allTypes) {
      const choice = await MNUtil.userSelect(
        "自定义类型选择",
        `是否包含"${type}"类型？\n已选择：${selectedTypes.join(", ") || "无"}`,
        ["跳过", "选择", "完成选择"]
      );

      if (choice === 0 || choice === 3)  return;
      
      if (choice === 2) {
        selectedTypes.push(type);
      } else if (choice === 1) {
        break; 
      } 
    }
    
    return selectedTypes.length > 0 ? selectedTypes : null;
  }

  /**
   * 执行快速搜索（增强版）
   */
  MNKnowledgeBaseClass.prototype.performFastSearch = async function(searcher, keyword, options = {}, focusMode = true) {
    try {
      // 构建搜索参数
      const searchOptions = {
        limit: 50,
        types: options.types || null
      };
      
      // 记录搜索历史（使用原始关键词）
      this.lastSearchKeyword = options.originalKeyword || keyword;
      this.lastSearchTypes = options.types;
      
      // 执行搜索
      let results = await searcher.search(keyword, searchOptions);
      
      // 根据配置应用排除词过滤
      if (options.searchModeConfig && options.searchModeConfig.useExclusion) {
        const beforeCount = results.length;
        results = KnowledgeBaseIndexer.filterSearchResults(results, true);
        const afterCount = results.length;
        if (beforeCount > afterCount) {
          MNUtil.log(`排除词过滤: ${beforeCount} → ${afterCount} 个结果`);
        }
      }
      
      if (results.length === 0) {
        const typeInfo = options.types ? `(${options.types.join(", ")})` : "(全部类型)";
        const originalKeyword = options.originalKeyword || keyword;
        MNUtil.showHUD(`未找到匹配 "${originalKeyword}" 的卡片 ${typeInfo}`);
        return;
      }
      
      // 保存搜索历史（根据 focusMode 确定模式名称）
      let modeName = "脑图定位";
      if (focusMode === false) {
        modeName = "浮窗定位";
      } else if (focusMode === 'markdown') {
        modeName = "复制链接";
      }
      
      const historyEntry = {
        keyword: options.originalKeyword || keyword,
        types: options.types || null,
        results: results.slice(0, 50), // 只保存前50条结果
        timestamp: Date.now(),
        mode: modeName,
        searchModeConfig: options.searchModeConfig || {}
      };
      
      // 添加到历史记录开头
      self.searchHistory.unshift(historyEntry);
      
      // 限制历史记录数量
      if (self.searchHistory.length > self.maxSearchHistory) {
        self.searchHistory = self.searchHistory.slice(0, self.maxSearchHistory);
      }
      
      // 显示搜索结果
      this.showSearchResults(results, searcher, options, focusMode);
      
    } catch (error) {
      MNUtil.showHUD("搜索执行失败: " + error.message);
      MNLog.error(error, "MNKnowledgeBase: performFastSearch");
    }
  }

  /**
   * 显示搜索结果
   */
  MNKnowledgeBaseClass.prototype.showSearchResults = async function(results, searcher, searchOptions = {}, focusMode = true) {
    try {
      // 构建结果选项
      const options = results.map((result, index) => {
        const typeLabel = result.classificationSubtype 
          ? `[${result.type}-${result.classificationSubtype}]`
          : `[${result.type}-${result.prefix}]`;
        
        // 获取显示的标题（优先用简短形式）
        // let displayTitle = result.title;
        let displayTitle = result.classificationSubtype 
          ? `${result.content}`
          : ``;
        // MNLog.log(index + "第一次截取", Object.entries(result));
        
        // 截取标题避免过长
        // TODO MNUtil 有计算字符的
        if (displayTitle.length > 40) {
          displayTitle = displayTitle.substring(0, 40) + "...";
          // MNLog.log(index + "第二次截取" + displayTitle);
        }

        if (!result.classificationSubtype){
          displayTitle = displayTitle + result.titleLinkWords
        }
        // MNLog.log(index + "第三次截取" + displayTitle);
        return `${index + 1}. ${typeLabel} ${displayTitle}`;
      });
      
      // 添加返回和分享选项
      options.unshift("🔙 返回搜索");
      
      // 显示结果列表
      // TODO：宽度能否调
      let selectResult = await MNUtil.userSelect(
        `搜索结果 (${results.length} 个)`,
        "选择要查看的卡片：",
        options,
      );

      if (selectResult === 0) {
        // 返回搜索，保留之前的配置
        const config = {
          defaultTypes: searchOptions.types,
          enableTypeSelection: searchOptions.config ? searchOptions.config.enableTypeSelection : true
        };
        this.showSearchDialog(searcher, config, focusMode);
      } else if (selectResult > 0) {
        // 查看选中的卡片（注意索引偏移，因为第一个是"返回搜索"）
        const selectedResult = results[selectResult - 2];
        const note = MNNote.new(selectedResult.id);
        if (note) {
          if (focusMode === 'markdown') {
            // 复制 Markdown 链接
            knowledgeBaseTemplate.copyMarkdownLinkWithQuickPhrases(note);
          } else if (MNUtil.mindmapView) {
            // 脑图或浮窗定位
            focusMode ? note.focusInMindMap() : note.focusInFloatMindMap();
          } else {
            MNUtil.showHUD("已选择卡片：" + selectedResult.title);
          }
        }
      }
      
    } catch (error) {
      MNUtil.showHUD("显示结果失败: " + error.message);
      MNLog.error(error, "MNKnowledgeBase: showSearchResults");
    }
  }
  
  // 返回定义的插件类，MarginNote 会自动实例化这个类
  return MNKnowledgeBaseClass;
};

