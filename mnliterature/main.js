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
  JSB.require('webviewController');
  // 使用 JSB.defineClass 定义一个继承自 JSExtension 的插件类
  // 格式：'类名 : 父类名'
  var MNLiteratureClass = JSB.defineClass('MNLiterature : JSExtension', 
  
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
          self.appInstance = Application.sharedInstance();
          self.toggled = false
          self.ifFirst = true
          MNUtil.addObserver(self, 'onPopupMenuOnNote:', 'PopupMenuOnNote')
          MNUtil.addObserver(self, 'onNoteTitleContainsXDYY:', 'NoteTitleContainsXDYY')
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
      // 目前为空，但建议在实际项目中添加清理代码
      MNUtil.undoGrouping(()=>{
        try {
          MNUtil.removeObserver(self,'NoteTitleContainsXDYY')
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
      literatureUtils.checkLiteratureController()
      try {
        if (MNUtil.studyMode < 3) {
          literatureUtils.literatureController.view.hidden = true;
          literatureUtils.literatureController.view.frame = { x: 50, y: 100, width: 260, height: 345 }
          literatureUtils.literatureController.currentFrame = { x: 50, y: 100, width: 260, height: 345 }
          MNUtil.delay(0.2).then(()=>{
            MNUtil.studyView.becomeFirstResponder(); //For dismiss keyboard on iOS
          })
        } else{
          if (literatureUtils.literatureController) {
            literatureUtils.literatureController.view.hidden = true
          }
        }
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
      literatureUtils.checkLiteratureController()
      if (MNUtil.studyMode < 3) {
        return {
          image: 'logo.png',
          object: self,
          selector: 'toggleAddon:',
          checked: self.toggled
        };
      } else {
        if (literatureUtils.literatureController) {
          literatureUtils.literatureController.view.hidden = true
        }
        return null;
      }
    },

    // 点击插件图标执行的方法。
    toggleAddon: async function(button) {
      try {
        // 获取插件栏对象
        if (!self.addonBar) {
          self.addonBar = button.superview.superview
          literatureUtils.addonBar = self.addonBar
        }
        self.toggled = !self.toggled
        MNUtil.refreshAddonCommands()
        MNLog.log({
          message: "点击文献管理插件",
          source: "MNLiterature: toggleAddon",
        })

        let commandTable = [
          self.tableItem('⚙️   Setting', 'openSetting:'),
          self.tableItem('🗄️   文献数据库', 'openLiteratureLibrary:'),
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
          source:"MNLiterature: toggleAddon",
        })
      }
    },

    openSetting: function(button) {
      MNUtil.showHUD("打开设置界面")
      self.toggled = false
      MNUtil.refreshAddonCommands()
      // 关闭菜单
      if (self.popoverController) {
        self.popoverController.dismissPopoverAnimated(true);
      }
      try {
        literatureUtils.checkLiteratureController()
        if (self.isFirst) {
          let buttonFrame = self.addonBar.frame
          let frame = buttonFrame.x < 100 ? {x:40, y:buttonFrame.y, width:260, height: 345} : {x:buttonFrame.x-260,y:buttonFrame.y, width:260, height:345}
          literatureUtils.setFrame(literatureUtils.literatureController, frame)
          self.isFirst = false;
        }
        if (literatureUtils.literatureController.view.hidden || !MNUtil.isDescendantOfStudyView(literatureUtils.literatureController.view)) {
          literatureUtils.ensureView(literatureUtils.literatureController.view)
          literatureUtils.literatureController.show(self.addonBar.frame)
        } else{
          literatureUtils.literatureController.hide(self.addonBar.frame)
        }
      } catch (error) {
        MNUtil.showHUD(error);
      }
    },

    openLiteratureLibrary: function() {
      MNUtil.showHUD("打开文献数据库")
      // 关闭菜单
      if (self.popoverController) {
        self.popoverController.dismissPopoverAnimated(true);
      }
    },


    // 生命周期测试

    onPopupMenuOnNote: async function (sender) {
      MNUtil.undoGrouping(()=>{
        try {
          self.note = MNNote.getFocusNote()
          if (self.note){
            self.noteTitle = self.note.title
            if (self.noteTitle.includes("夏大鱼羊")) {
              MNUtil.postNotification('NoteTitleContainsXDYY', {title: self.noteTitle})
              MNUtil.log("发送了")
            } else {
              MNUtil.showHUD("我在找！")
              MNUtil.log("没发送，但点击了")
            }
          }
        } catch (error) {
          MNUtil.showHUD(error);
        }
      })
    },

    /**
     * 卡片标题包含“夏大鱼羊”时
     */
    onNoteTitleContainsXDYY: async function(sender) {
      MNUtil.undoGrouping(()=>{
        try {
          MNUtil.postNotification("openInBrowser", {
            url: "https://www.marginnote.com.cn/"
          })
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

  MNLiteratureClass.prototype.tableItem = function (title, selector, param = "", checked = false) {
    return {
      title: title,        // 菜单项显示的文字
      object: this,        // 执行方法的对象（重要！）
      selector: selector,  // 点击后要调用的方法名
      param: param,        // 传递给方法的参数
      checked: checked     // 是否显示勾选状态
    }
  }
  
  // 返回定义的插件类，MarginNote 会自动实例化这个类
  return MNLiteratureClass;
};

