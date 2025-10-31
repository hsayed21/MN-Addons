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
          pinnerUtils.checkPinnerController()
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
          // MNUtil.removeObserver(self, 'PopupMenuOnNote')
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
          self.tableItem('🗄️   卡片固定库', 'openPinnerLibrary:'),
          self.tableItem('📥   导入配置', 'importConfig:'),
          self.tableItem('📤   导出配置', 'exportConfig:'),
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

    /**
   * 处理来自其他插件的通信消息
   * @param {Object} sender - 消息发送者信息，包含 userInfo.message
   *
   * 消息协议格式：
   * marginnote4app://addon/mnpinner?action=ACTION&param1=value1&param2=value2
   *
   * 支持的 actions：
   *
   * 1. pin - 添加卡片到指定分区
   *    @param {string} id - 卡片ID（必需，需要URL编码）
   *    @param {string} title - 显示标题（可选，需要URL编码，默认使用卡片原标题）
   *    @param {string} section - 分区名称（可选，默认"midway"）
   *                             可选值："focus"（聚焦）、"midway"（中间知识）
   *    @param {string} position - 插入位置（可选，默认"bottom"）
   *                              可选值："top"（顶部）、"bottom"（底部）、数字索引
   *
   * 2. temporarilyPin - 添加到中间知识（兼容旧版本）
   *    @param {string} id - 卡片ID（必需，需要URL编码）
   *    @param {string} title - 显示标题（可选，需要URL编码）
   *
   * 3. showPinBoard - 显示置顶面板
   *    无参数
   *
   * 4. moveToTop - 将已存在的卡片移动到顶部
   *    @param {string} id - 卡片ID（必需，需要URL编码）
   *    @param {string} section - 分区名称（必需）
   *
   * 5. moveToBottom - 将已存在的卡片移动到底部
   *    @param {string} id - 卡片ID（必需，需要URL编码）
   *    @param {string} section - 分区名称（必需）
   *
   * 6. pinAtPosition - 在指定位置添加新卡片
   *    @param {string} id - 卡片ID（必需，需要URL编码）
   *    @param {string} title - 显示标题（可选，需要URL编码）
   *    @param {string} section - 分区名称（可选，默认"midway"）
   *    @param {string|number} position - 位置（必需）
   *                                      可选值："top"、"bottom"、具体索引数字
   *
   * 7. pinPage - 添加文档页面到 Pages 分区
   *    @param {string} docMd5 - 文档MD5（必需，需要URL编码）
   *    @param {number} pageIndex - 页码，从0开始（必需）
   *    @param {string} title - 自定义标题（可选，需要URL编码，默认为"文档名 - 第X页"）
   *    @param {string} note - 备注（可选，需要URL编码）
   *
   * 使用示例：
   *
   * // 添加卡片到focus分区顶部
   * marginnote4app://addon/mnpinner?action=pin&id=NOTE123&title=重要笔记&section=focus&position=top
   *
   * // 移动现有卡片到底部
   * marginnote4app://addon/mnpinner?action=moveToBottom&id=NOTE456&section=midway
   *
   * // 在指定位置插入新卡片
   * marginnote4app://addon/mnpinner?action=pinAtPosition&id=NOTE789&title=新卡片&section=focus&position=2
   *
   * // 兼容旧版本的临时置顶
   * marginnote4app://addon/mnpinner?action=temporarilyPin&id=NOTE111&title=临时卡片
   *
   * // 添加文档页面到 Pages 分区
   * marginnote4app://addon/mnpinner?action=pinPage&docMd5=ABC123DEF456&pageIndex=5&title=重要章节&note=需要复习的内容
   *
   * 注意事项：
   * 1. 所有包含中文或特殊字符的参数必须使用 encodeURIComponent 进行URL编码
   * 2. section 参数如果传入无效值，将返回错误提示
   * 3. position 参数如果是数字，必须在有效范围内（0 到 当前卡片数量）
   * 4. 重复添加相同ID的卡片将被拒绝并提示"卡片已存在"
   */
  onAddonBroadcast: async function (sender) {
      try {
        let message = "marginnote4app://addon/"+sender.userInfo.message
        let config = MNUtil.parseURL(message)
        let addon = config.pathComponents[0]
        // MNUtil.copyJSON(config)
        if (addon === "mnpinner") {
          let action = config.params.action
          switch (action) {
            case "pin":  // 统一的添加卡片action（支持position参数）
              let noteId = decodeURIComponent(config.params.id)
              let section = config.params.section || "midway"  // 默认添加到中间知识
              let position = config.params.position || "bottom"  // 默认添加到底部
              let pinNote = MNNote.new(noteId)
              let title
              if (config.params.title) {
                title = decodeURIComponent(config.params.title)
              } else {
                title = pinNote ? pinNote.title : "未命名卡片"
              }

              if (pinNote && pinnerConfig.addPinAtPosition(noteId, title, section, position)) {
                if (pinnerUtils.pinnerController) {
                  pinnerUtils.pinnerController.refreshView(section + "View")
                }
                let sectionName = pinnerConfig.getSectionDisplayName(section)
                let positionText = position === "top" ? "顶部" : (position === "bottom" ? "底部" : `位置${position}`)
                MNUtil.showHUD(`已添加到${sectionName}${positionText}: ${title}`)
              }
              break;

            case "moveToTop":  // 移动卡片到顶部
              let moveTopId = decodeURIComponent(config.params.id)
              let moveTopSection = config.params.section
              if (!moveTopSection) {
                MNUtil.showHUD("缺少section参数")
                break;
              }
              if (pinnerConfig.movePinToPosition(moveTopId, moveTopSection, "top")) {
                MNUtil.showHUD("已移动到顶部")
              }
              break;

            case "moveToBottom":  // 移动卡片到底部
              let moveBottomId = decodeURIComponent(config.params.id)
              let moveBottomSection = config.params.section
              if (!moveBottomSection) {
                MNUtil.showHUD("缺少section参数")
                break;
              }
              if (pinnerConfig.movePinToPosition(moveBottomId, moveBottomSection, "bottom")) {
                MNUtil.showHUD("已移动到底部")
              }
              break;

            case "pinAtPosition":  // 在指定位置添加新卡片
              let posId = decodeURIComponent(config.params.id)
              let posSection = config.params.section || "midway"
              let posPosition = config.params.position
              if (!posPosition) {
                MNUtil.showHUD("缺少position参数")
                break;
              }
              let posNote = MNNote.new(posId)
              let posTitle
              if (config.params.title) {
                posTitle = decodeURIComponent(config.params.title)
              } else {
                posTitle = posNote ? posNote.title : "未命名卡片"
              }

              if (posNote && pinnerConfig.addPinAtPosition(posId, posTitle, posSection, posPosition)) {
                if (pinnerUtils.pinnerController) {
                  pinnerUtils.pinnerController.refreshView(posSection + "View")
                }
                let posSectionName = pinnerConfig.getSectionDisplayName(posSection)
                let posText = posPosition === "top" ? "顶部" : (posPosition === "bottom" ? "底部" : `位置${posPosition}`)
                MNUtil.showHUD(`已添加到${posSectionName}${posText}: ${posTitle}`)
              }
              break;

            case "pinPage":  // 添加文档页面到 Pages 分区
              try {
                let docMd5 = decodeURIComponent(config.params.docMd5 || config.params.docmd5 || "")
                let pageIndex = parseInt(config.params.pageIndex || config.params.pageindex || "0")
                let pageTitle = config.params.title ? decodeURIComponent(config.params.title) : ""
                let pageNoteText = config.params.note ? decodeURIComponent(config.params.note) : ""

                // 验证 docMd5 参数
                if (!docMd5) {
                  MNUtil.showHUD("缺少docMd5参数")
                  break
                }

                // 验证页码是否为有效数字
                if (isNaN(pageIndex) || pageIndex < 0) {
                  MNUtil.showHUD("页码无效")
                  break
                }

                // 验证文档和页码范围
                let docInfo = pinnerConfig.getDocInfo(docMd5)
                if (!docInfo.doc) {
                  MNUtil.showHUD("文档不存在")
                  break
                }
                if (pageIndex > docInfo.lastPageIndex) {
                  MNUtil.showHUD(`页码超出范围(0-${docInfo.lastPageIndex})`)
                  break
                }

                // 添加页面
                if (pinnerConfig.addPagePin(docMd5, pageIndex, pageTitle, pageNoteText)) {
                  if (pinnerUtils.pinnerController) {
                    pinnerUtils.pinnerController.refreshView("pagesView")
                  }
                  MNUtil.showHUD(`已添加到 Pages: ${pageTitle || `第${pageIndex+1}页`}`)
                }
              } catch (error) {
                pinnerUtils.addErrorLog(error, "onAddonBroadcast:pinPage")
                MNUtil.showHUD("添加页面失败: " + error.message)
              }
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
    openPinnerLibrary: function(button) {
      // MNUtil.showHUD("打开设置界面")
      // 重置插件图标的选中状态
      self.toggled = false
      // 刷新插件栏，更新图标状态
      MNUtil.refreshAddonCommands()
      self.closeMenu()
      try {
        // 这是 iOS 的机制，用于确保键盘正确隐藏
        MNUtil.delay(0.2).then(()=>{
          MNUtil.studyView.becomeFirstResponder(); //For dismiss keyboard on iOS
        })
        pinnerUtils.ensureView(pinnerUtils.pinnerController.view)
        

        // 第一次打开时，设置面板的初始位置和大小
        if (self.isFirst) {
          // MNUtil.showHUD("First")
          // 设置面板的位置（同时设置 frame 和 currentFrame）
          pinnerUtils.setFrame(pinnerUtils.pinnerController, self.firstFrame)
          pinnerUtils.pinnerController.show(self.firstFrame)
          self.isFirst = false;
        } else {
          // MNUtil.showHUD("Not First")
          pinnerUtils.pinnerController.show(pinnerUtils.pinnerController.lastFrame)
        }
        // 默认显示focus分区
        pinnerUtils.pinnerController.switchView("focusView")
      } catch (error) {
        pinnerUtils.addErrorLog(error, "openSetting")
      }
    },

    // 生命周期测试

    onPopupMenuOnNote: async function (sender) {
      MNUtil.undoGrouping(()=>{
        try {
          // self.note = MNNote.new(sender.userInfo.note.noteId)
          if (pinnerUtils.pinnerController && !pinnerUtils.pinnerController.view.hidden) {
            // 刷新当前显示的分区
            let currentSection = pinnerUtils.pinnerController.currentSection || "focus"
            pinnerUtils.pinnerController.refreshView(currentSection + "View")
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

  MNPinnerClass.prototype.openPinnerLibrary = function() {
    if (pinnerUtils.pinnerController.lastFrame) {
      pinnerUtils.pinnerController.show(pinnerUtils.pinnerController.lastFrame)
      // 显示默认分区
      pinnerUtils.pinnerController.switchView("focusView")
    }
  }

  MNPinnerClass.prototype.init = function(mainPath) {
    // 插件栏图标的选中状态
    this.toggled = false
    this.isFirst = true
    this.firstFrame = {x:50, y:50, width:450, height: 200} 
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

