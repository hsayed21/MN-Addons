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
          self.tableItem('⚙️   Setting', 'openSetting:'),
          self.tableItem('🗄️   文献数据库', 'openKnowledgeBaseLibrary:'),
          self.tableItem('🔄   更新搜索索引', 'updateSearchIndex:'),
          self.tableItem('🔍   快速搜索', 'showFastSearch:'),
          self.tableItem('✍️   JSON 写入测试', 'writeJSON:'),
          self.tableItem('✍️   JSON 读取测试', 'readJSON:'),
        ];

        // 显示菜单
        self.popoverController = MNUtil.getPopoverAndPresent(
          button,        // 触发按钮
          commandTable,  // 菜单项
          200,          // 宽度
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
     * 更新搜索索引
     */
    updateSearchIndex: function() {
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
        
        
        // 显示进度提示
        MNUtil.showHUD("正在构建索引，请稍候...");
        
        // 延迟执行以确保 HUD 显示
        MNUtil.delay(0.1).then(() => {
          // 构建索引
          let index = KnowledgeBaseIndexer.buildSearchIndex([rootNote]);
          
          // 保存索引
          if (index && index.searchData.length > 0) {
            KnowledgeBaseIndexer.saveIndex(index);
          } else {
            MNUtil.showHUD("没有找到可索引的卡片");
          }
        });
        
      } catch (error) {
        MNUtil.showHUD("更新索引失败: " + error.message);
        MNLog.error(error, "MNKnowledgeBase: updateSearchIndex");
      }
    },
    
    /**
     * 显示快速搜索对话框
     */
    showFastSearch: function() {
      try {
        // 关闭菜单
        if (self.popoverController) {
          self.popoverController.dismissPopoverAnimated(true);
        }
        
        // 加载搜索器
        const searcher = FastSearcher.loadFromFile();
        if (!searcher) {
          MNUtil.showHUD("索引未找到，请先更新搜索索引");
          return;
        }
        
        // 显示搜索输入框
        UIAlertView.show(
          "快速搜索",
          "请输入搜索关键词：",
          ["取消", "搜索"],
          2,  // 文本输入模式
          (alert, buttonIndex) => {
            if (buttonIndex === 1) {
              const keyword = alert.textFieldAtIndex(0).text;
              if (keyword && keyword.trim()) {
                self.performFastSearch(searcher, keyword.trim());
              }
            }
          }
        );
        
      } catch (error) {
        MNUtil.showHUD("快速搜索失败: " + error.message);
        MNLog.error(error, "MNKnowledgeBase: showFastSearch");
      }
    },
    
    /**
     * 执行快速搜索
     */
    performFastSearch: function(searcher, keyword) {
      try {
        // 执行搜索
        const results = searcher.search(keyword, { limit: 50 });
        
        if (results.length === 0) {
          MNUtil.showHUD(`未找到包含 "${keyword}" 的卡片`);
          return;
        }
        
        // 显示搜索结果
        self.showSearchResults(results, searcher);
        
      } catch (error) {
        MNUtil.showHUD("搜索执行失败: " + error.message);
        MNLog.error(error, "MNKnowledgeBase: performFastSearch");
      }
    },
    
    /**
     * 显示搜索结果
     */
    showSearchResults: function(results, searcher) {
      try {
        // 构建结果选项
        const options = results.map((result, index) => {
          const typeLabel = result.classificationSubtype 
            ? `[${result.type}-${result.classificationSubtype}]`
            : `[${result.type}]`;
          // 截取标题避免过长
          const titlePreview = result.title.length > 40 
            ? result.title.substring(0, 40) + "..."
            : result.title;
          return `${index + 1}. ${typeLabel} ${titlePreview}`;
        });
        
        // 添加返回选项
        options.unshift("🔙 返回搜索");
        
        // 显示结果列表
        UIAlertView.show(
          `搜索结果 (${results.length} 个)`,
          "选择要查看的卡片：",
          options,
          0,  // 默认样式
          (alert, buttonIndex) => {
            if (buttonIndex === 0) {
              // 返回搜索
              self.showFastSearch();
            } else if (buttonIndex > 0) {
              // 查看选中的卡片
              const selectedResult = results[buttonIndex - 1];
              const note = MNNote.getNoteById(selectedResult.id, false);
              if (note) {
                // 在脑图中定位
                if (MNUtil.mindmapView) {
                  note.focusInMindMap(0.3);
                } else {
                  MNUtil.showHUD("已选择卡片：" + selectedResult.title);
                }
              }
            }
          }
        );
        
      } catch (error) {
        MNUtil.showHUD("显示结果失败: " + error.message);
        MNLog.error(error, "MNKnowledgeBase: showSearchResults");
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
    },

    writeJSON: function() {
      try {
        let obj = MNNote.getFocusNote()
        MNUtil.writeJSON(MNUtil.dbFolder+"/"+"kb-test"+".json", obj)
      } catch (error) {
        MNUtil.showHUD(error);
      }
    },

    readJSON: function() {
      try {
        MNUtil.copy(MNUtil.readJSON(MNUtil.dbFolder+"/"+"kb-test"+".json"))
      } catch (error) {
        MNUtil.showHUD(error);
      }
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

  MNKnowledgeBaseClass.prototype.tableItem = function (title, selector, param = "", checked = false) {
    return {
      title: title,        // 菜单项显示的文字
      object: this,        // 执行方法的对象（重要！）
      selector: selector,  // 点击后要调用的方法名
      param: param,        // 传递给方法的参数
      checked: checked     // 是否显示勾选状态
    }
  }
  
  // 返回定义的插件类，MarginNote 会自动实例化这个类
  return MNKnowledgeBaseClass;
};

