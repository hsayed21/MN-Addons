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
  // 加载工具类，提供视图管理的辅助函数
  JSB.require('utils');

  // 加载视图控制器类定义（iOS UIViewController 的 JavaScript 实现）
  // 此时只是加载类定义，实例会在需要时通过 literatureController.new() 创建
  JSB.require('webviewController');

  // 加载新的 WebView 控制器和索引系统
  JSB.require('literatureWebController');
  JSB.require('literatureIndexer');

  // 加载插件集成模块
  JSB.require('literature_plugin_integration');
  // 使用 JSB.defineClass 定义一个继承自 JSExtension 的插件类
  // 格式：'类名 : 父类名'
  let MNLiteratureClass = JSB.defineClass('MNLiterature : JSExtension', 
  
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
          self.init(mainPath)

          // ⭐ 保存插件实例引用（供 WebView 控制器使用）
          // 参考：mnknowledgebase/main.js
          if (typeof MNLiteratureInstance === 'undefined') {
            global.MNLiteratureInstance = self
          }

          // 插件栏图标的选中状态
          self.toggled = false
          // 标记是否是第一次打开设置面板（用于设置初始位置）
          self.ifFirst = true
          // MNUtil.addObserver(self, 'onPopupMenuOnNote:', 'PopupMenuOnNote')
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
          // MNUtil.removeObserver(self,'PopupMenuOnNote')
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
      try {

      } catch (error) {
        MNLog.error(error, "notebookWillOpen")
      }
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

    },


    /**
     * 插件栏按钮状态查询
     * MarginNote 会定期调用此方法，确定是否显示插件按钮及其状态
     */
    queryAddonCommandStatus: function() {
      // 优先初始化新版 Web 控制器（参考 mnknowledgebase）
      literatureUtils.checkWebViewController()

      if (MNUtil.studyMode < 3) {
        // 返回按钮配置，告诉 MarginNote 如何显示插件按钮
        return {
          image: 'logo.png',          // 按钮图标
          object: self,               // 响应对象（this）
          selector: 'toggleAddon:',   // 点击时调用的方法
          checked: self.toggled       // 是否显示选中状态
        };
      } else {
        // 复习模式下隐藏控制器
        if (literatureUtils.webViewController && literatureUtils.webViewController.view) {
          literatureUtils.webViewController.view.hidden = true
        }
        return null;
      }
    },

    /**
     * 点击插件图标时的响应方法
     * @param {UIButton} button - 被点击的按钮对象
     */
    toggleAddon: async function(button) {
      try {
        // 获取插件栏对象（通过视图层级向上查找）
        // button.superview 是按钮的父视图
        // button.superview.superview 是插件栏本身
        // 保存这个引用，用于后续定位面板的显示位置
        if (!self.addonBar) {
          self.addonBar = button.superview.superview
          literatureUtils.addonBar = self.addonBar
        }
        self.toggled = !self.toggled
        MNUtil.refreshAddonCommands()

        let commandTable = [
          self.tableItem('⚙️   Setting', 'openSetting:'),
          self.tableItem('🗄️   文献数据库', 'openLiteratureLibrary:'),
          self.tableItem('🤖   测试 AI', 'testAI:'),
        ];

        // 显示菜单
        self.menuPopoverController = MNUtil.getPopoverAndPresent(
          button,        // 触发按钮
          commandTable,  // 菜单项
          200,          // 宽度
          0             // 箭头方向（0=自动）
        );
      } catch (error) {
        MNUtil.showHUD(error);
        literatureUtils.addErrorLog(error, "toggleAddon")
      }
    },

    /**
     * 打开设置面板
     * ⚠️ 已废弃：此方法使用旧版控制器 API（literatureController）
     * 建议使用 openLiteratureLibrary 方法替代
     * @deprecated
     */
    // openSetting: function(button) {
    //   MNUtil.showHUD("打开设置界面")
    //   // 重置插件图标的选中状态
    //   self.toggled = false
    //   // 刷新插件栏，更新图标状态
    //   MNUtil.refreshAddonCommands()
    //   self.closeMenu()
    //   try {
    //     // 确保视图控制器已创建并添加到 studyView 中
    //     // 这是一个单例模式的实现，只会创建一次实例
    //     literatureUtils.checkLiteratureController()
    //     // 初始化时隐藏面板，等待用户手动打开
    //     literatureUtils.literatureController.view.hidden = true;
    //     // 设置面板的初始位置和大小
    //     // frame 是 iOS 中视图的位置和大小属性：{x, y, width, height}
    //     literatureUtils.literatureController.view.frame = { x: 50, y: 100, width: 260, height: 345 }
    //     // currentFrame 是自定义属性，用于记录当前位置（动画时使用）
    //     literatureUtils.literatureController.currentFrame = { x: 50, y: 100, width: 260, height: 345 }
    //     // 延迟 0.2 秒后让 studyView 成为第一响应者
    //     // 这是 iOS 的机制，用于确保键盘正确隐藏
    //     MNUtil.delay(0.2).then(()=>{
    //       MNUtil.studyView.becomeFirstResponder(); //For dismiss keyboard on iOS
    //     })

    //     // 确保视图在正确的父视图中
    //     literatureUtils.ensureView(literatureUtils.literatureController.view)
    //
    //     // 第一次打开时，设置面板的初始位置
    //     if (self.isFirst) {
    //       let buttonFrame = self.addonBar.frame
    //       // 根据插件栏的位置决定面板显示在左侧还是右侧
    //       // 如果插件栏在左边（x < 100），面板显示在右边
    //       // 如果插件栏在右边，面板显示在左边（x - 面板宽度）
    //       let frame = buttonFrame.x < 100 ?
    //         {x:40, y:buttonFrame.y, width:260, height: 345} :
    //         {x:buttonFrame.x-260, y:buttonFrame.y, width:260, height:345}
    //       // 设置面板的位置（同时设置 frame 和 currentFrame）
    //       literatureUtils.setFrame(literatureUtils.literatureController, frame)
    //       self.isFirst = false;
    //     }
    //
    //     // 判断面板的显示状态，执行显示或隐藏
    //     if (literatureUtils.literatureController.view.hidden) {
    //       // 显示面板（带动画效果）
    //       // 传入 addonBar.frame 作为动画的起始位置参考
    //       literatureUtils.literatureController.show(self.addonBar.frame)
    //     } else {
    //       // 如果面板已显示，则隐藏它（带动画效果）
    //       // 传入 addonBar.frame 作为动画的终点位置参考
    //       literatureUtils.literatureController.hide(self.addonBar.frame)
    //     }
    //   } catch (error) {
    //     literatureUtils.addErrorLog(error, "openSetting")
    //   }
    // },

    /**
     * 打开文献数据库界面
     * 参考：mnknowledgebase/main.js 的 openSearchWebView
     */
    openLiteratureLibrary: async function(button) {
      try {
        self.toggled = false
        MNUtil.refreshAddonCommands()
        self.checkPopover()

        const controller = literatureUtils.checkWebViewController()
        if (!controller) {
          MNUtil.showHUD("加载界面失败，请查看日志")
          return
        }

        const needReload = controller.currentHTMLType !== 'literatureManager' || !controller.webViewLoaded

        if (controller.onAnimate) {
          await MNUtil.delay(0.5)
          return self.openLiteratureLibrary(button)
        }

        if (!needReload) {
          await controller.show()
          return
        }

        controller.loadHTMLFile('literatureManager')
        await controller.show()
      } catch (error) {
        literatureUtils.addErrorLog(error, "openLiteratureLibrary")
      }
    },

    testAI: function() {
      try {
        self.closeMenu()
        self.testAI()
      } catch (error) {
        literatureUtils.addErrorLog(error, "testAI")
      }
    },

    // 生命周期测试

    onPopupMenuOnNote: async function (sender) {
      MNUtil.undoGrouping(()=>{
        try {
          self.note = MNNote.new(sender.userInfo.note.noteId)
          if (!literatureUtils.literatureController.view.hidden) {
            // 立即发送卡片信息（不需要延迟）
            if (self.note) {
              literatureUtils.literatureController.sendCardInfoToWebView(self.note)
              MNUtil.log("卡片标题：" + self.note.title)
            }
          }
        } catch (error) {
          MNUtil.showHUD(error);
        }
      })
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

    },
    
    /**
     * 应用程序即将进入前台时调用
     * 
     * 适用于 iOS/iPadOS 平台，当用户从后台切换回 MarginNote 时触发
     */
    applicationWillEnterForeground: function() {

    },
    
    /**
     * 应用程序进入后台时调用
     * 
     * 适用于 iOS/iPadOS 平台，当用户切换到其他应用时触发
     */
    applicationDidEnterBackground: function() {

    },
    
    /**
     * 收到本地通知时调用
     * 
     * 处理系统通知或定时提醒
     * 
     * @param {Object} notify 通知对象
     */
    applicationDidReceiveLocalNotification: function(notify) {

    },
  });

  MNLiteratureClass.prototype.init = function(mainPath) {
    if (!this.initialized) {
      literatureUtils.init(mainPath)
      literatureConfig.init(mainPath)
      this.initialized = true
    }
  }

  MNLiteratureClass.prototype.closeMenu = function() {
    // 关闭菜单
    if (this.menuPopoverController) {
      this.menuPopoverController.dismissPopoverAnimated(true);
      this.menuPopoverController = undefined;
    }
  }

  // checkPopover 作为 closeMenu 的别名，与 mnknowledgebase 保持一致
  MNLiteratureClass.prototype.checkPopover = function() {
    this.closeMenu();
  }

  MNLiteratureClass.prototype.tableItem = function (title, selector, param = "", checked = false) {
    return {
      title: title,        // 菜单项显示的文字
      object: this,        // 执行方法的对象（重要！）
      selector: selector,  // 点击后要调用的方法名
      param: param,        // 传递给方法的参数
      checked: checked     // 是否显示勾选状态
    }
  }

  MNLiteratureClass.prototype.testAI = async function() {
    try {
      let question = await MNUtil.input("请输入问题","")

      if (!question || question.button !== 1 || !question.input || question.input.trim() === "") {
        return;
      }
      // 调用 MNAI 并等待结果
      const output = await literatureNetwork.callMNAIWithNotification(question.input)
      
      if (output) {
        // 记录结果
        literatureUtils.log("AI 结果: " + output)
        
        // 可选：设置为当前卡片的标题
        const focusNote = MNNote.getFocusNote()
        if (focusNote) {
          MNUtil.undoGrouping(() => {
            focusNote.appendMarkdownComment(output) 
          })
          MNUtil.showHUD("✅ 已添加到卡片评论")
        }
      } else {
        MNUtil.showHUD("❌ 未获取到 AI 结果")
      }
    } catch (error) {
      literatureUtils.addErrorLog(error, "testAI")
      MNUtil.showHUD("❌ 调用失败: " + error.message)
    }
  }
  
  // 返回定义的插件类，MarginNote 会自动实例化这个类
  return MNLiteratureClass;
};
