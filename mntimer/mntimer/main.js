
if (typeof MNOnAlert === 'undefined') {
  var MNOnAlert = false
}
JSB.newAddon = function (mainPath) {
  JSB.require('utils');
  if (!timerUtils.checkMNUtilsFolder(mainPath)) {return undefined}
  JSB.require('webviewController');
  JSB.require('settingController');
  // NSUserDefaults.standardUserDefaults().removeObjectForKey("MNTimer_config")
  /** @return {MNTimerClass} */
  const getMNTimerClass = ()=>self
  var MNTimerClass = JSB.defineClass(
    'MNTimer : JSExtension',
    { /* Instance members */
      sceneWillConnect: async function () { //Window initialize
        if (!(await timerUtils.checkMNUtil(true))) return
        try {
          let self = getMNTimerClass()
          self.init(mainPath)
          self.watchMode = false;
          self.textSelected = ""
          self.textProcessed = false;
          self.dateGetText = Date.now();
          self.dateNow = Date.now();
          self.rect = '{{0, 0}, {10, 10}}';
          self.arrow = 1;
          self.isFirst = true;
          self.linkDetected = false
        MNUtil.addObserver(self, 'onSetTimer:', 'setTimer');
        MNUtil.addObserver(self, 'onRefreshSubview:', 'refreshSubview');
        MNUtil.addObserver(self, 'onRefreshTimerObject:', 'refreshTimerObject');
        } catch (error) {
          timerUtils.addErrorLog(error, "sceneWillConnect")
        }
      },

      sceneDidDisconnect: function () { // Window disconnect
        MNUtil.removeObserver(self, 'onSetTimer:');
        MNUtil.removeObserver(self, 'onRefreshSubview:');
      },

      sceneWillResignActive: function () { // Window resign active
      },

      sceneDidBecomeActive: function () { // Window become active
      },

      notebookWillOpen: async function (notebookid) {
        if (!(await timerUtils.checkMNUtil(true,0.1))) return
      try {
        let self = getMNTimerClass()
        self.init(mainPath)
        self.ensureView()
        // if (self.appInstance.studyController(self.window).studyMode < 3) {
        self.appInstance = Application.sharedInstance();
        MNUtil.currentWindow.addSubview(self.addonController.view)
        // self.addonController = timerController.new();
        // MNUtil.refreshAddonCommands()
        // self.addonController.view.hidden = true;
        self.addonController.notebookid = notebookid
        // MNUtil.addObserver(self, 'onPopupMenuOnSelection:', 'PopupMenuOnSelection')
        // MNUtil.addObserver(self, 'onPopupMenuOnNote:', 'PopupMenuOnNote');
        // MNUtil.addObserver(self, 'onProcessNewExcerpt:', 'ProcessNewExcerpt');
        // MNUtil.addObserver(self, 'receivedSearchInBrowser:', 'searchInBrowser');
        // MNUtil.addObserver(self, 'receivedOpenInBrowser:', 'openInBrowser');

        // MNUtil.addObserver(self, 'onAddonBroadcast:', 'AddonBroadcast');
        // MNUtil.addObserver(self, 'onPasteboardChange:', 'UIPasteboardChangedNotification');
        // MNUtil.addObserver(self, 'onPasteboardChange:', 'UIPasteboardChangedTypesAddedKey');
        // MNUtil.addObserver(self, 'onPasteboardChange:', 'UIPasteboardChangedTypesRemovedKey');
        // MNUtil.addObserver(self, 'onPasteboardChange:', 'UIPasteboardRemovedNotification');
        self.addonController.homeButton.hidden = true
        self.addonController.goBackButton.hidden = true
        self.addonController.goForwardButton.hidden = true
        self.addonController.refreshButton.hidden = true
        MNUtil.delay(0.1).then(()=>{
          MNUtil.studyView.becomeFirstResponder()
        })
        } catch (error) {
          timerUtils.addErrorLog(error, "notebookWillOpen")
        }
      },

      notebookWillClose: function (notebookid) {
        // if (typeof MNUtil === 'undefined') {
        //   return
        // }
        // MNUtil.showHUD("notebookWillClose")
        // Application.sharedInstance().showHUD("close",self.window,2)
        // if (self.addonController.miniMode) {
        //   // self.addonController.clearContent()
        //   self.addonController.homePage()
        //   let preFrame = self.addonController.view.frame
        //   self.addonController.view.hidden = true
        //   self.addonController.showAllButton()
        //   let studyFrame = Application.sharedInstance().studyController(self.window).view.bounds
        //   if (self.addonController.view.frame.x < studyFrame.width*0.5) {
        //     self.addonController.lastFrame.x = 0
        //   }else{
        //     self.addonController.lastFrame.x = studyFrame.width-self.addonController.lastFrame.width
        //   }
        //   self.addonController.setFrame(self.addonController.lastFrame)
        //   self.addonController.show(preFrame)
        // }
        // self.addonController.view.removeFromSuperview()
        // self.newWindowController.view.removeFromSuperview()
      },

      documentDidOpen: function (docmd5) {
      },

      documentWillClose: function (docmd5) {
      },

      controllerWillLayoutSubviews: function (controller) {
        if (typeof MNUtil === 'undefined') {
          return
        }
        if (self.window !== MNUtil.currentWindow) {
            // MNUtil.showHUD("reject")
          return;
        };

        if (!self.addonController.view.hidden && !self.addonController.onAnimate) {
          let studyFrame = MNUtil.currentWindow.bounds
          if (self.addonController.miniMode) {
            let oldFrame = self.addonController.view.frame
            // MNUtil.showHUD("message")
            let miniWidth = timerConfig.miniWidth
            if (self.addonController.hasTodoText) {
              self.addonController.view.frame = { x: oldFrame.x, y: oldFrame.y, width: miniWidth, height: 110 }
            }else{

              self.addonController.view.frame = { x: oldFrame.x, y: oldFrame.y, width: miniWidth, height: 70 }
            }
          } else{
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
        if (!timerUtils.checkLogo()) {
          return null
        }
        return {
          image: 'logo.png',
          object: self,
          selector: 'toggleAddon:',
          checked: self.watchMode
        };
      },
      onPasteboardChange: function () {
        if (typeof MNUtil === 'undefined') {
          return
        }
        MNUtil.showHUD("check:")

      },
      onSetTimer: async function (sender) {
        if (typeof MNUtil === 'undefined') {
          return
        }
        if (self.window!==MNUtil.currentWindow) {
          return
        }
        let info = sender.userInfo
        if (info.timerMode) {
          self.ensureView()
          if (self.addonController.view.hidden) {
            await self.addonController.show()
          }
          if (info.annotation) {
            self.addonController.setAnnotation(info.annotation)
          }
          switch (info.timerMode) {
            case "clock":
              if (self.addonController.miniMode) {
                await MNUtil.animate(()=>{ 
                  self.addonController.view.layer.opacity = 0.5
                },0.5)
              }
              self.addonController.beginClockMode()
              break;
            case "pauseOrResume":
              self.addonController.startStop()
              break;
            case "countUp":
              if (self.addonController.miniMode) {
                await MNUtil.animate(()=>{ 
                  self.addonController.view.layer.opacity = 0.5
                },0.5)
              }
              self.addonController.stopWatch()
              break;
            case "countdown":
              if (self.addonController.miniMode) {
                await MNUtil.animate(()=>{ 
                  self.addonController.view.layer.opacity = 0.5
                },0.5)
              }
              if (info.minutes) {
                let mins = info.minutes
                self.addonController.getTimer(mins)
              }else{
                MNUtil.showHUD("Missing argument: minutes")
              }
              break;
            default:
              break;
          }
        }
        // if (info === "start") {
        //   self.addonController.startTimer()
        // }else if (info === "stop") {
        //   self.addonController.stopTimer()
        // }

      },
      onRefreshTimerObject: function (sender) {
        if (typeof MNUtil === 'undefined') {
          return
        }
        if (self.window!==MNUtil.currentWindow) {
          return
        }
        self.addonController.getTimerStatus()
        // self.refreshTimerObject()
      },
      onRefreshSubview: function (sender) {
        if (typeof MNUtil === 'undefined') {
          return
        }
        if (self.window!==MNUtil.currentWindow) {
          return
        }
        // MNUtil.copyJSON(sender.userInfo)
        self.refreshSubview()
      },
      toClockMode: async function(){
        let self = getMNTimerClass()
        if (self.popoverController) {self.popoverController.dismissPopoverAnimated(true);}
        self.ensureView()
        if (self.addonController.view.hidden) {
          await self.addonController.show()
        }
        if (self.addonController.miniMode) {
          self.addonController.view.hidden = false
          MNUtil.animate(()=>{ 
            self.addonController.view.layer.opacity = 0.5
          },0.5).then(()=>{
            self.addonController.beginClockMode()
          })
        }else{
          self.addonController.view.hidden = false
          self.addonController.beginClockMode()
        }
      },
      beginCountUp: async function(){
        let self = getMNTimerClass()
        if (self.popoverController) {self.popoverController.dismissPopoverAnimated(true);}
        self.ensureView()
        if (self.addonController.view.hidden) {
          await self.addonController.show()
        }
        if (self.addonController.miniMode) {
          self.addonController.view.hidden = false
          MNUtil.animate(()=>{ 
            self.addonController.view.layer.opacity = 0.5
          },0.5).then(()=>{
            self.addonController.stopWatch()
          })
        }else{
          self.addonController.view.hidden = false
          self.addonController.stopWatch()
        }
      },
      beginCountDown: async function(mins){
        let self = getMNTimerClass()
        if (self.popoverController) {self.popoverController.dismissPopoverAnimated(true);}
        self.ensureView()
        if (mins >0 && self.addonController.view.hidden) {
          await self.addonController.show()
        }
        if (self.addonController.miniMode) {
          MNUtil.animate(()=>{ 
            self.addonController.view.layer.opacity = 0.5
          },0.5).then(()=>{
            self.addonController.getTimer(mins)
          })
        }else{
          self.addonController.getTimer(mins)
        }
      },
      inputAnnotation: async function(){
        let self = getMNTimerClass()
        if (self.popoverController) {self.popoverController.dismissPopoverAnimated(true);}
        self.addonController.inputAnnotation()
      },
      openSetting: async function(){
        let self = getMNTimerClass()
        if (self.popoverController) {self.popoverController.dismissPopoverAnimated(true);}
        self.ensureView()
        let controller = self.addonController
        if (controller.miniMode) {
          let viewFrame = controller.view.frame
          let preFrame = viewFrame
          controller.view.hidden = true
          controller.showAllButton()
          controller.setFrame(controller.lastFrame)
          await controller.show(preFrame)
        }else{
          await controller.show()
        }
        try {
          
        if (!controller.settingView) {
          controller.createSettingView()
        }
        controller.view.bringSubviewToFront(controller.settingView)
        controller.settingView.hidden = false
        controller.settingViewLayout()
        } catch (error) {
          timerUtils.addErrorLog(error, "openSetting")
        }
        // self.addonController.openSetting()
      },
      toggleAddon: async function (button) {
        if (typeof MNUtil === 'undefined') {
          return
        }
        try {
          let self = getMNTimerClass()
          if (!self.addonBar) {
            self.addonBar = button.superview.superview
            self.addonController.addonBar = self.addonBar
          }
          var commandTable = [
            {title:'📝  Annotation',object:self,selector:'inputAnnotation:',param:'left'},
            {title:'⚙️  Setting',object:self,selector:'openSetting:',param:'left'},
            {title:'⏰  Clock Mode',object:self,selector:'toClockMode:',param:'left'},
            {title:'⏱️  Count Up',object:self,selector:'beginCountUp:',param:'left'},
            {title:'⌛  Countdown: 5mins',object:self,selector:'beginCountDown:',param:5},
            {title:'⌛  Countdown: 10mins',object:self,selector:'beginCountDown:',param:10},
            {title:'⌛  Countdown: 15mins',object:self,selector:'beginCountDown:',param:15},
            {title:'🍅  Countdown: 25mins',object:self,selector:'beginCountDown:',param:25},
            {title:'⌛  Countdown: 40mins',object:self,selector:'beginCountDown:',param:40},
            {title:'⌛  Countdown: 60mins',object:self,selector:'beginCountDown:',param:60},
            {title:'⌛  Countdown: Custom',object:self,selector:'beginCountDown:',param:-1},
          ];
          if (self.addonBar.frame.x < 100) {
            self.popoverController = MNUtil.getPopoverAndPresent(button,commandTable,200,4)
          }else{
            self.popoverController = MNUtil.getPopoverAndPresent(button,commandTable,200,0)
          }
        } catch (error) {
          timerUtils.addErrorLog(error, "toggleAddon")
        }
      },
    },
    { /* Class members */
      addonDidConnect: function () {
      },

      addonWillDisconnect: async function () {
        let confirm = await MNUtil.confirm("MN Timer: Remove all config?\n删除所有配置？", "")
        if (!confirm) {
          return
        }
        timerConfig.remove("MNTimer_config")
      },

      applicationWillEnterForeground: function () {
        // MNUtil.postNotification("refreshSubview", {})
      },

      applicationDidEnterBackground: function () {
      },

      applicationDidReceiveLocalNotification: function (notify) {
      }
    }
  );

  MNTimerClass.prototype.getNoteList = function (note) {
    let noteList = []
    if (note.noteTitle) {
      noteList.push(note.noteTitle)
    }
    if (note.excerptText && !note.excerptPic) {
      noteList.push(note.excerptText)
    }
    return noteList.concat(note.comments.filter(comment=>comment.type==="TextNote").map(comment=>comment.text))
  };
  MNTimerClass.prototype.getTextForSearch = function (note) {
    let order = timerConfig.searchOrder
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
  MNTimerClass.prototype.init = function(mainPath){ 
  try {
    if (!this.initialized) {
      timerUtils.init(mainPath)
      timerConfig.init()
      this.initialized = true
    }
    if (!this.addonController) {
      this.addonController = timerController.new();
    }
  } catch (error) {
    timerUtils.addErrorLog(error, "init")
  }
  }
  MNTimerClass.prototype.ensureView = function (refresh = true) {
  try {
    if (!this.addonController || !this.addonController.view.isDescendantOfView(MNUtil.currentWindow)) {
      MNUtil.currentWindow.addSubview(this.addonController.view)
      this.addonController.view.hidden = !this.addonController.timerOn
      this.addonController.webview.loadFileURLAllowingReadAccessToURL(
        NSURL.fileURLWithPath(timerUtils.mainPath + '/index.html'),
        NSURL.fileURLWithPath(timerUtils.mainPath + '/')
      );
      // this.addonController.homePage()
    }
      } catch (error) {
    timerUtils.showHUD(error,5)
  }
  }
  MNTimerClass.prototype.refreshSubview = function (params) {
    MNUtil.showHUD("refreshSubview")
    if (!this.addonController.view.hidden && !this.addonController.onAnimate) {
      let studyFrame = MNUtil.currentWindow.bounds
      if (this.addonController.miniMode) {
        let oldFrame = this.addonController.view.frame
        this.addonController.view.frame = { x: oldFrame.x, y: oldFrame.y, width: timerConfig.miniWidth, height: 70 }
      }else{
        let currentFrame = this.addonController.currentFrame
        if (currentFrame.x+currentFrame.width*0.5 >= studyFrame.width) {
          currentFrame.x = studyFrame.width-currentFrame.width*0.5              
        }
        if (currentFrame.y >= studyFrame.height) {
          currentFrame.y = studyFrame.height-20              
        }
        this.addonController.setFrame(currentFrame)
      }
    }
  }
  return MNTimerClass;
};

