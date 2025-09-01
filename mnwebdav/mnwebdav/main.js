
JSB.newAddon = function (mainPath) {
  JSB.require('utils');
  JSB.require('webdav');
  JSB.require('fxp');
  if (!webdavUtil.checkMNUtilsFolder(mainPath)) {return undefined}
  JSB.require('webviewController');
  var temSender;
  
  /** @return {MNWebdavClass} */
  const getMNWebdavClass = ()=>self
  var MNWebdavClass = JSB.defineClass(
    'MNWebdav : JSExtension',
    { /* Instance members */
      sceneWillConnect: async function () { //Window initialize
        if (!(await webdavUtil.checkMNUtil(true))) return
        let self = getMNWebdavClass()
        self.init(mainPath)
        self.textSelected = ""
        self.textProcessed = false;
        self.dateGetText = Date.now();
        self.dateNow = Date.now();
        self.rect = '{{0, 0}, {10, 10}}';
        self.arrow = 1;
        self.isFirst = true;
        self.linkDetected = false
        self.addObserver( 'onPopupMenuOnSelection:', 'PopupMenuOnSelection')
        self.addObserver( 'onPopupMenuOnNote:', 'PopupMenuOnNote');
        // self.addObserver( 'onCloseView:', 'close');
        // self.addObserver( 'onNewWindow:', 'newWindow');
        // self.addObserver( 'onCloudConfigChange:', 'NSUbiquitousKeyValueStoreDidChangeExternallyNotificationUI')
      },

      sceneDidDisconnect: function () { // Window disconnect
        // MNUtil.copy("sceneDidDisconnect")
        // if (typeof MNUtil === 'undefined') return
        // let self = getMNWebdavClass()
        // self.addonController.homePage()
        // let names = [
        //   'PopupMenuOnSelection','PopupMenuOnNote','NSUbiquitousKeyValueStoreDidChangeExternallyNotificationUI'
        // ]
        // self.removeObservers(names)
      },

      sceneWillResignActive: function () { // Window resign active
        // MNUtil.copy("sceneWillResignActive")
      },

      sceneDidBecomeActive: function () { // Window become active
        // MNUtil.copy("sceneDidBecomeActive")
      },
      onPopupMenuOnNote: function (sender) {
        // if (typeof MNUtil === 'undefined') {
        //   return
        // }
        self.addonController.blur()//webview取消焦点,不然用不了快捷键
      },
      onPopupMenuOnSelection:function (params) {
        self.addonController.blur()//webview取消焦点,不然用不了快捷键
      },

      notebookWillOpen: async function (notebookid) {
        if (!(await webdavUtil.checkMNUtil(true,0.1))) return
      try {
        let self = getMNWebdavClass()
        self.init(mainPath)
        self.ensureView()
        // if (self.appInstance.studyController(self.window).studyMode < 3) {
        self.appInstance = Application.sharedInstance();
        // self.addonController = webdavController.new();
        MNUtil.studyView.addSubview(self.addonController.view)
        // MNUtil.refreshAddonCommands()
        self.addonController.view.hidden = true;
        self.addonController.notebookid = notebookid

        if (webdavConfig.dynamic) {
          webdavConfig.toolbar = false
        }
        self.addonController.buttonScrollview.hidden = !webdavConfig.toolbar
        var viewFrame = self.addonController.view.bounds;
        if (webdavConfig.toolbar) {
          self.addonController.webview.frame = MNUtil.genFrame(viewFrame.x + 1, viewFrame.y + 10, viewFrame.width - 2, viewFrame.height - 40)
        } else {
          self.addonController.webview.frame = MNUtil.genFrame(viewFrame.x + 1, viewFrame.y + 10, viewFrame.width - 2, viewFrame.height)
        }
        MNUtil.delay(0.1).then(()=>{
          MNUtil.studyView.becomeFirstResponder()
        })
        } catch (error) {
          webdavUtil.addErrorLog(error, "notebookWillOpen")
        }
      },

      notebookWillClose: function (notebookid) {
        if (typeof MNUtil === 'undefined') {
          return
        }
        // MNUtil.copy("notebookWillClose")

        // Application.sharedInstance().showHUD("close",self.window,2)
        if (self.addonController.miniMode) {
          self.addonController.homePage()
          let preFrame = self.addonController.view.frame
          self.addonController.view.hidden = true
          self.addonController.showAllButton()
          let studyFrame = Application.sharedInstance().studyController(self.window).view.bounds
          if (self.addonController.view.frame.x < studyFrame.width*0.5) {
            self.addonController.lastFrame.x = 0
          }else{
            self.addonController.lastFrame.x = studyFrame.width-self.addonController.lastFrame.width
          }
          self.addonController.setFrame(self.addonController.lastFrame)
          self.addonController.show(preFrame)
        }
        self.addonController.view.removeFromSuperview()

        // self.appInstance.studyController(self.window).view.remov(self.addonController.view);
        
        self.textSelected = '';
      },

      documentDidOpen: function (docmd5) {
      },

      documentWillClose: function (docmd5) {
      },

      controllerWillLayoutSubviews: function (controller) {
        if (typeof MNUtil === 'undefined') {
          return
        }

        if (controller !== MNUtil.studyController) {
          return;
        };
        // MNUtil.showHUD("message"+self.addonController.currentFrame.width)

        if (!self.addonController.view.hidden && !self.addonController.onAnimate) {
          let studyFrame = MNUtil.studyView.bounds
          if (self.addonController.miniMode) {
            let oldFrame = self.addonController.view.frame
            if (oldFrame.x < studyFrame.width*0.5) {
            // self.addonController.view.frame = self.addonController.currentFrame
              self.addonController.view.frame = { x: 0, y: oldFrame.y, width: 40, height: 40 }
            } else {
              self.addonController.view.frame = { x: studyFrame.width - 40, y: oldFrame.y, width: 40, height: 40 }
            }
          } else if (self.addonController.custom) {
            self.addonController.setSplitScreenFrame(self.addonController.customMode)
            self.addonController.webview.frame = self.addonController.view.bounds
          }else{
            let currentFrame = self.addonController.currentFrame
            if (currentFrame.x+currentFrame.width*0.5 >= studyFrame.width) {
              currentFrame.x = studyFrame.width-currentFrame.width*0.5              
            }
            if (currentFrame.y >= studyFrame.height) {
              currentFrame.y = studyFrame.height-20              
            }
            self.addonController.setFrame(currentFrame)
          }
        }
      },

      queryAddonCommandStatus: function () {
        if (!webdavUtil.checkLogo()) {
          return null
        }
        self.ensureView(false)
          return {
            image: 'logo.png',
            object: self,
            selector: 'toggleAddon:',
            checked: false
          };
      },
      onCloudConfigChange: async function (sender) {
        let self = getMNWebdavClass()
        if (typeof MNUtil === 'undefined') return
        if (self.window !== MNUtil.currentWindow) {
          return
        }
        if (!webdavUtil.checkSubscribe(false,false,true)) {
          return
        }
        let iCloudSync = webdavConfig.getConfig("syncSource") === "iCloud"
        if(!iCloudSync || !webdavConfig.autoImport(true)){
          return
        }

        self.checkUpdate()
      },
      onPasteboardChange: function () {
        if (typeof MNUtil === 'undefined') {
          return
        }
        MNUtil.showHUD("check:")

      },
      toggleAddon: async function (sender) {
        // MNUtil.mindmapView.hidden = true
        // MNUtil.mindmapView.superview.subviews.at(-4).hidden = true

        // let tem = MNUtil.mindmapView.superview.subviews.at(-1)
        // MNUtil.showHUD("message"+tem.subviews.length)
        // MNUtil.openURL("file://"+webdavUtil.mainPath+"/test.pdf")
        if (typeof MNUtil === 'undefined') {
          return
        }
        // let url = "https://webdav-1836303614.pd1.123pan.cn/webdav/dl/icon/"
        // let username = "13128589351"
        // let password = "w6i0c001000d4g5j87hsr1sb40uo4a7p"
        // let res = await WebDAV.listWebDAVFile(url, username, password,depth = 1)
        // MNUtil.copy(res)
        // return
        try {

          
        self.ensureView()
        if (!self.addonBar) {
          self.addonBar = sender.superview.superview
          self.addonController.addonBar = self.addonBar
        }

        if (self.addonController.view.hidden) {
          if (self.isFirst) {
            // Application.sharedInstance().showHUD("first",self.window,2)
            let buttonFrame = self.addonBar.frame
            let width = MNUtil.app.osType !== 1 ? 419 : 365
            if (buttonFrame.x === 0) {
              self.addonController.setFrame(40,buttonFrame.y,width,450)
            }else{
              self.addonController.setFrame(buttonFrame.x-width,buttonFrame.y,width,450)
            }
            self.isFirst = false;
          }
        // MNUtil.showHUD("message"+webdavConfig.toolbar)
          MNUtil.studyView.bringSubviewToFront(self.addonBar)
          self.addonController.show(self.addonBar.frame)
          // self.addonController.view.hidden = false
          // self.addonController.webview.hidden = false
        } else {
          self.addonController.hide(self.addonBar.frame)
          MNUtil.refreshAddonCommands()
          return;
        }
  
} catch (error) {
    webdavUtil.addErrorLog(error, "toggleAddon")
}
      },
    },
    { /* Class members */
      addonDidConnect: function () {
      },

      addonWillDisconnect: async function () {
      },

      applicationWillEnterForeground: function () {
        // MNUtil.copy("applicationWillEnterForeground")

      },

      applicationDidEnterBackground: function () {
        // MNUtil.copy("applicationDidEnterBackground")
      },

      applicationDidReceiveLocalNotification: function (notify) {
      }
    }
  );

  MNWebdavClass.prototype.layoutAddonController = function (rectStr, arrowNum) {
    this.rect = rectStr || this.rect;
    this.arrow = arrowNum || this.arrow;
    var x, y
    w = (MNUtil.app.osType !== 1) ? 419 : 365, // this.addonController.view.frame.width
      h = 500, // this.addonController.view.frame.height
      fontSize = 15,
      margin = 10,
      padding = 20,
      frame = MNUtil.studyView.bounds,
      W = frame.width,
      H = frame.height,
      rectArr = this.rect.replace(/{/g, '').replace(/}/g, '').replace(/\s/g, '').split(','),
      X = Number(rectArr[0]),
      Y = Number(rectArr[1]),
      studyMode = MNUtil.studyController.studyMode,
      contextMenuWidth = studyMode === 0 ? 225 : 435,
      contextMenuHeight = 35,
      textMenuPadding = 40;

    // this.addonController.view.frame.x
    if (w >= contextMenuWidth) {
      if (X - w / 2 - margin <= 0) {
        x = margin;
      } else if (X + w / 2 + margin >= W) {
        x = W - margin - w;
      } else {
        x = X - w / 2;
      }
    } else {
      if (X - contextMenuWidth / 2 - margin <= 0) {
        x = margin + contextMenuWidth / 2 - w / 2;
      } else if (X + contextMenuWidth / 2 + margin >= W) {
        x = W - margin - contextMenuWidth / 2 - w / 2;
      } else {
        x = X - w / 2;
      }
    }

    // this.addonController.view.frame.[y, height]
    if (this.arrow === 1) {
      let upperBlankHeight = Y - textMenuPadding - fontSize - padding,
        lowerBlankHeight = H - Y - contextMenuHeight - padding;
      if (upperBlankHeight >= lowerBlankHeight) {
        h = (upperBlankHeight >= h) ? h : upperBlankHeight;
        y = upperBlankHeight - h;
      } else {
        y = H - lowerBlankHeight;
        h = (H - y >= h) ? h : H - y;
    // this.appInstance.showHUD('x:'+x+';y:'+Y,this.window,2)
      }
    } else {
      let upperBlankHeight = Y - textMenuPadding - contextMenuHeight - padding,
        lowerBlankHeight = H - Y - fontSize - padding;
      if (upperBlankHeight >= lowerBlankHeight) {
        h = (upperBlankHeight >= h) ? h : upperBlankHeight;
        y = upperBlankHeight - h;
      } else {
        y = H - lowerBlankHeight;
        h = (H - y >= h) ? h : H - y;
      }
    }
    MNUtil.animate(()=>{
      this.addonController.setFrame(x,y,w,h)
    })
  };
  MNWebdavClass.prototype.getNoteList = function (note) {
    let noteList = []
    if (note.noteTitle) {
      noteList.push(note.noteTitle)
    }
    if (note.excerptText && !note.excerptPic) {
      noteList.push(note.excerptText)
    }
    return noteList.concat(note.comments.filter(comment=>comment.type==="TextNote").map(comment=>comment.text))
  };
  MNWebdavClass.prototype.getTextForSearch = function (note) {
    let order = webdavConfig.searchOrder
    if (!order) {
      order = [2,1,3]
    }
    let text
    for (let index = 0; index < order.length; index++) {
      const element = order[index];
      switch (element) {
        case 1:
          if (note.noteTitle && note.noteTitle !== "") {
            text = note.noteTitle
          }
          break;
        case 2:
          if (note.excerptText && note.excerptText !== "" && (!note.excerptPic || note.textFirst)) {
            text = note.excerptText
          }
          break;
        case 3:
          let noteText  = note.comments.filter(comment=>comment.type === "TextNote" && !/^marginnote3app:\/\//.test(comment.text))
          if (noteText.length) {
            text =  noteText[0].text
          }
          break;
        default:
          break;
      }
      if (text) {
        return text
      }
    }
  return ""
  }
  MNWebdavClass.prototype.init = function(mainPath){ 
  try {
    if (!this.initialized) {
      webdavUtil.init(mainPath)
      webdavConfig.init()
      this.initialized = true
    }
    if (!this.addonController) {
      this.addonController = webdavController.new();
    }
  } catch (error) {
    webdavUtil.addErrorLog(error, "MNWebdavClass.init")
  }
  }
  /**
   * 
   * @param {string} selector 
   * @param {string} name 
   * @this {MNWebdavClass}
   * @returns 
   */
  MNWebdavClass.prototype.addObserver = function (selector,name) {
    NSNotificationCenter.defaultCenter().addObserverSelectorName(this, selector, name);
  }
  /**
   * 
   * @param {string[]} names
   * @this {MNWebdavClass}
   * @returns 
   */
  MNWebdavClass.prototype.removeObservers = function (names) {
    names.forEach(name=>{
      NSNotificationCenter.defaultCenter().removeObserverName(self, name);
    })
  }
  /**
   * 
   * @param {boolean} refresh 
   * @this {MNWebdavClass}
   * @returns 
   */
  MNWebdavClass.prototype.ensureView = function (refresh = true) {
  try {
    if (!MNUtil.isDescendantOfStudyView(this.addonController.view)) {
      MNUtil.studyView.addSubview(this.addonController.view)
      this.addonController.view.hidden = true
      if (refresh) {
        MNUtil.refreshAddonCommands()
      }
      if (!this.addonController.inHomePage) {
        this.addonController.homePage()
        // let path = "/"
        MNUtil.delay(1).then(()=>{
        this.addonController.handleConnect()
        })
      }
    }
      } catch (error) {
    webdavUtil.showHUD(error,5)
  }
  }
  MNWebdavClass.prototype.checkUpdate = async function () {
    // webdavUtil.addErrorLog("not implemented", "checkUpdate")
    let success = await webdavConfig.readCloudConfig(false)
    if (success) {
      self.addonController.refreshLastSyncTime()
    }
  }
  return MNWebdavClass;
};

