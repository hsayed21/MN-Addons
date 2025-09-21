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
  // 此时只是加载类定义，实例会在需要时通过 pinnerController.new() 创建
  JSB.require('webviewController');
  // 使用 JSB.defineClass 定义一个继承自 JSExtension 的插件类
  // 格式：'类名 : 父类名'
  let MNPinnerClass = JSB.defineClass('MNPinner : JSExtension', 
  
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
          MNUtil.addObserver(self, 'onAddonBroadcast:', 'AddonBroadcast');
          // MNUtil.addObserver(self, 'onPopupMenuOnNote:', 'PopupMenuOnNote')
        } catch (error) {
          pinnerUtils.addErrorLog(error, "sceneWillConnect")
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
          MNUtil.removeObserver(self, 'AddonBroadcast')
          // MNUtil.removeObserver(self,'PopupMenuOnNote')
        } catch (error) {
          pinnerUtils.addErrorLog(error, "sceneDidDisconnect")
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
        // 确保 pinnerConfig 已初始化
        if (!self.initialized) {
          self.init(mainPath)
        }
        
        pinnerUtils.log("Notebook opened: " + notebookid, "notebookWillOpen")
      } catch (error) {
        pinnerUtils.addErrorLog(error, "notebookWillOpen")
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
      // 每次查询时都确保控制器已初始化
      // 这是必要的，因为可能在不同的时机被调用
      pinnerUtils.checkPinnerController()
      if (MNUtil.studyMode < 3) {
        // 返回按钮配置，告诉 MarginNote 如何显示插件按钮
        return {
          image: 'logo.png',          // 按钮图标
          object: self,               // 响应对象（this）
          selector: 'toggleAddon:',   // 点击时调用的方法
          checked: self.toggled       // 是否显示选中状态
        };
      } else {
        if (pinnerUtils.pinnerController) {
          pinnerUtils.pinnerController.view.hidden = true
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
          pinnerUtils.addonBar = self.addonBar
        }
        self.toggled = !self.toggled
        MNUtil.refreshAddonCommands()

        let commandTable = [
          self.tableItem('⚙️   Setting', 'openSetting:'),
          // self.tableItem('🗄️   卡片固定库', 'openPinnerLibrary:'),
          self.tableItem('📥   导入配置', 'importConfig:'),
          self.tableItem('📤   导出配置', 'exportConfig:'),
          self.tableItem('🗑️   清空临时固定', 'clearTemporaryPins:'),
          self.tableItem('🗑️   清空永久固定', 'clearPermanentPins:'),
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
        pinnerUtils.addErrorLog(error, "toggleAddon")
      }
    },

    onAddonBroadcast: async function (sender) {
      try {
        let message = "marginnote4app://addon/"+sender.userInfo.message
        let config = MNUtil.parseURL(message)
        let addon = config.pathComponents[0]
        // MNUtil.copyJSON(config)
        if (addon === "mnpinner") {
          let action = config.params.action
          switch (action) {
            case "temporarilyPin":
              let noteId = decodeURIComponent(config.params.id)
              let pinNote = MNNote.new(noteId)
              let title
              if (config.params.title) {
                title = decodeURIComponent(config.params.title)
              } else {
                title = pinNote ? pinNote.title : "未命名卡片"
              }
              if (pinNote && pinnerConfig.addPin(noteId, title)) {
                if (pinnerUtils.pinnerController) {
                  pinnerUtils.pinnerController.refreshView("temporaryPinView")
                }
                MNUtil.showHUD("已临时固定: " + title)
              }
              break;
            case "permanentlyPin":
            //   let permanentNoteId = decodeURIComponent(config.params.id)
            //   let permanentNote = MNNote.new(permanentNoteId)
            //   if (permanentNote && pinnerConfig.addPin(permanentNoteId, permanentNote.title, false)) {
            //     MNUtil.showHUD("已永久固定: " + permanentNote.title)
            //   }
              MNUtil.showHUD("永久固定功能待开发")
              break;
            case "showPinBoard":
              self.openPinnerLibrary()
              break;
            default:
              MNUtil.showHUD('Unsupported action: '+action)
              break;
          }
        }
      } catch (error) {
        pinnerUtils.addErrorLog(error, "onAddonBroadcast")
      }
    },

    /**
     * 打开设置面板
     * 这是整个视图显示流程的入口
     * @param {UIButton} button - 菜单中的设置按钮
     */
    openSetting: function(button) {
      // MNUtil.showHUD("打开设置界面")
      // 重置插件图标的选中状态
      self.toggled = false
      // 刷新插件栏，更新图标状态
      MNUtil.refreshAddonCommands()
      self.closeMenu()
      try {
        // 确保视图控制器已创建并添加到 studyView 中
        // 这是一个单例模式的实现，只会创建一次实例
        pinnerUtils.checkPinnerController()
        // 初始化时隐藏面板，等待用户手动打开
        pinnerUtils.pinnerController.view.hidden = true;
        // 设置面板的初始位置和大小
        // frame 是 iOS 中视图的位置和大小属性：{x, y, width, height}
        // pinnerUtils.pinnerController.view.frame = { x: 50, y: 100, width: 260, height: 345 }
        // currentFrame 是自定义属性，用于记录当前位置（动画时使用）
        // pinnerUtils.pinnerController.currentFrame = { x: 50, y: 100, width: 260, height: 345 }
        // 延迟 0.2 秒后让 studyView 成为第一响应者
        // 这是 iOS 的机制，用于确保键盘正确隐藏
        MNUtil.delay(0.2).then(()=>{
          MNUtil.studyView.becomeFirstResponder(); //For dismiss keyboard on iOS
        })

        // 确保视图在正确的父视图中
        pinnerUtils.ensureView(pinnerUtils.pinnerController.view)
        
        // 第一次打开时，设置面板的初始位置
        if (self.isFirst) {
          let buttonFrame = self.addonBar.frame
          // 根据插件栏的位置决定面板显示在左侧还是右侧
          // 如果插件栏在左边（x < 100），面板显示在右边
          // 如果插件栏在右边，面板显示在左边（x - 面板宽度）
          let frame = buttonFrame.x < 100 ? 
            {x:40, y:buttonFrame.y, width:260, height: 345} : 
            {x:buttonFrame.x-260, y:buttonFrame.y, width:260, height:345}
          // 设置面板的位置（同时设置 frame 和 currentFrame）
          pinnerUtils.setFrame(pinnerUtils.pinnerController, frame)
          self.isFirst = false;
        }
        
        // 判断面板的显示状态，执行显示或隐藏
        if (pinnerUtils.pinnerController.view.hidden) {
          // 显示面板（带动画效果）
          // 传入 addonBar.frame 作为动画的起始位置参考
          pinnerUtils.pinnerController.show(self.addonBar.frame)
        } else {
          // 如果面板已显示，则隐藏它（带动画效果）
          // 传入 addonBar.frame 作为动画的终点位置参考
          pinnerUtils.pinnerController.hide(self.addonBar.frame)
        }
      } catch (error) {
        pinnerUtils.addErrorLog(error, "openSetting")
      }
    },

    // 生命周期测试

    onPopupMenuOnNote: async function (sender) {
      MNUtil.undoGrouping(()=>{
        try {
          self.note = MNNote.new(sender.userInfo.note.noteId)
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

  MNPinnerClass.prototype.openPinnerLibrary = function() {
    // TODO: 要在当前卡片的位置处出现
    if (!this.addonBar) {
      MNUtil.showHUD("请先点击插件图标以初始化")
      return
    }
    if (pinnerUtils.pinnerController) {
      pinnerUtils.pinnerController.show(this.addonBar.frame)
      pinnerUtils.pinnerController.refreshView("temporaryPinView")
    }
  }

  MNPinnerClass.prototype.init = function(mainPath) {
    // 插件栏图标的选中状态
    this.toggled = false
    if (!this.initialized) {
      pinnerUtils.init(mainPath)
      pinnerConfig.init(mainPath)
      this.initialized = true
    }
  }

  MNPinnerClass.prototype.closeMenu = function() {
    // 关闭菜单
    if (this.menuPopoverController) {
      this.menuPopoverController.dismissPopoverAnimated(true);
    }
  }
  
  /**
   * 导入配置
   */
  MNPinnerClass.prototype.importConfig = function() {
    this.closeMenu()
    pinnerConfig.importFromFile()
  }
  
  /**
   * 导出配置
   */
  MNPinnerClass.prototype.exportConfig = function() {
    this.closeMenu()
    pinnerConfig.exportToFile()
  }
  
  /**
   * 清空临时固定
   */
  MNPinnerClass.prototype.clearTemporaryPins = function() {
    this.closeMenu()
    MNUtil.confirm("清空临时固定", "确定要清空所有临时固定的卡片吗？", ["取消", "确定"]).then((result) => {
      if (result) {
        pinnerConfig.clearPins(true)
      }
    })
  }
  
  /**
   * 清空永久固定
   */
  MNPinnerClass.prototype.clearPermanentPins = function() {
    this.closeMenu()
    MNUtil.confirm("清空永久固定", "确定要清空所有永久固定的卡片吗？", ["取消", "确定"]).then((result) => {
      if (result) {
        pinnerConfig.clearPins(false)
      }
    })
  }

  MNPinnerClass.prototype.tableItem = function (title, selector, param = "", checked = false) {
    return {
      title: title,        // 菜单项显示的文字
      object: this,        // 执行方法的对象（重要！）
      selector: selector,  // 点击后要调用的方法名
      param: param,        // 传递给方法的参数
      checked: checked     // 是否显示勾选状态
    }
  }
  
  // 返回定义的插件类，MarginNote 会自动实例化这个类
  return MNPinnerClass;
};

