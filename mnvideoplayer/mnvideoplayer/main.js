
if (typeof MNOnAlert === 'undefined') {
  var MNOnAlert = false
}
JSB.newAddon = function (mainPath) {
  JSB.require('utils');
  if (!videoPlayerUtils.checkMNUtilsFolder(mainPath)) {return undefined}
  JSB.require('webviewController');
  JSB.require('settingController');
    // NSUserDefaults.standardUserDefaults().removeObjectForKey("MNVideoPlayer_config")
    // NSUserDefaults.standardUserDefaults().removeObjectForKey("MNVideoPlayer_entrieNames")
    // NSUserDefaults.standardUserDefaults().removeObjectForKey("MNVideoPlayer_entries")
    // NSUserDefaults.standardUserDefaults().removeObjectForKey('MNVideoPlayer_engine');
    // NSUserDefaults.standardUserDefaults().removeObjectForKey("MNVideoPlayer_webAppEntrieNames")
    // NSUserDefaults.standardUserDefaults().removeObjectForKey("MNVideoPlayer_webAppEntries")
    // NSUserDefaults.standardUserDefaults().removeObjectForKey('MNVideoPlayer_webApp');
    // NSUserDefaults.standardUserDefaults().removeObjectForKey('MNVideoPlayer_toolbar');
    // NSUserDefaults.standardUserDefaults().removeObjectForKey('MNVideoPlayer_onNewExcerpt');
    // NSUserDefaults.standardUserDefaults().removeObjectForKey('MNVideoPlayer_dynamic');
  var temSender;
  
  /** @return {MNVideoPlayerClass} */
  const getMNVideoPlayerClass = ()=>self
  var MNVideoPlayerClass = JSB.defineClass(
    'MNVideoPlayer : JSExtension',
    { /* Instance members */
      sceneWillConnect: async function () { //Window initialize
        if (!(await videoPlayerUtils.checkMNUtil(true))) return
        let self = getMNVideoPlayerClass()
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
        // self.addObserver( 'onPopupMenuOnSelection:', 'PopupMenuOnSelection')
        // self.addObserver( 'onPopupMenuOnNote:', 'PopupMenuOnNote');
        // self.addObserver( 'receivedSearchInBrowser:', 'searchInBrowser');
        // self.addObserver( 'receivedOpenInBrowser:', 'openInBrowser');
        // self.addObserver( 'receivedCustomAction:', 'browserCustomAction');
        // self.addObserver( 'receivedOpenWebAppInBrowser:', 'openWebAppInBrowser');

        // self.addObserver( 'onNewWindow:', 'newWindow');
        // self.addObserver( 'onSetVideo:', 'browserVideo');
        self.addObserver( 'onAddonBroadcast:', 'AddonBroadcast');
        // self.addObserver( 'onCloudConfigChange:', 'NSUbiquitousKeyValueStoreDidChangeExternallyNotificationUI')
      },

      sceneDidDisconnect: function () { // Window disconnect
        // MNUtil.copy("sceneDidDisconnect")
        if (typeof MNUtil === 'undefined') return
        let self = getMNVideoPlayerClass()
        self.addonController.homePage()
        let names = [
          'PopupMenuOnSelection',
          'PopupMenuOnNote',
          'close', 
          'searchInBrowser',
          'openInBrowser',
          'newWindow',
          'browserVideo',
          'AddonBroadcast',
          'NSUbiquitousKeyValueStoreDidChangeExternallyNotificationUI',
          'browserVideoFrameAction',
          'browserVideoControl'
        ]
        // self.removeObservers(names)
        self.removeObservers(['AddonBroadcast'])
      },

      sceneWillResignActive: function () { // Window resign active
        // MNUtil.copy("sceneWillResignActive")
      },

      sceneDidBecomeActive: function () { // Window become active
        // MNUtil.copy("sceneDidBecomeActive")
      },

      notebookWillOpen: async function (notebookid) {
        if (!(await videoPlayerUtils.checkMNUtil(true,0.1))) return
      try {
        let self = getMNVideoPlayerClass()
        self.init(mainPath)
        self.ensureView()
        // if (self.appInstance.studyController(self.window).studyMode < 3) {
        self.appInstance = Application.sharedInstance();
        MNUtil.studyView.addSubview(self.addonController.view)
        MNUtil.refreshAddonCommands()
        if (self.addonController.miniMode) {
          MNUtil.showHUD("miniMode")
          self.addonController.view.hidden = false;
        }else{
          self.addonController.view.hidden = true;
        }
        self.addonController.notebookid = notebookid

        if (videoPlayerConfig.dynamic) {
          videoPlayerConfig.toolbar = false
        }
        self.addonController.buttonScrollview.hidden = !videoPlayerConfig.toolbar
        var viewFrame = self.addonController.view.bounds;
        if (videoPlayerConfig.toolbar) {
          self.addonController.webview.frame = MNUtil.genFrame(viewFrame.x + 1, viewFrame.y + 10, viewFrame.width - 2, viewFrame.height - 40)
        } else {
          self.addonController.webview.frame = MNUtil.genFrame(viewFrame.x + 1, viewFrame.y + 10, viewFrame.width - 2, viewFrame.height)
        }
        MNUtil.delay(0.1).then(()=>{
          MNUtil.studyView.becomeFirstResponder()
        })
        } catch (error) {
          videoPlayerUtils.addErrorLog(error, "notebookWillOpen")
        }
      },

      notebookWillClose: function (notebookid) {
        if (typeof MNUtil === 'undefined') {
          return
        }
        // MNUtil.copy("notebookWillClose")

        // Application.sharedInstance().showHUD("close",self.window,2)
        if (self.addonController.miniMode) {
          // self.addonController.homePage()
          // let preFrame = self.addonController.view.frame
          // self.addonController.view.hidden = true
          // self.addonController.showAllButton()
          // let studyFrame = Application.sharedInstance().studyController(self.window).view.bounds
          // if (self.addonController.view.frame.x < studyFrame.width*0.5) {
          //   self.addonController.lastFrame.x = 0
          // }else{
          //   self.addonController.lastFrame.x = studyFrame.width-self.addonController.lastFrame.width
          // }
          // self.addonController.setFrame(self.addonController.lastFrame)
          // self.addonController.show(preFrame)
        }
        self.addonController.view.removeFromSuperview()
        self.newWindowController.view.removeFromSuperview()

        // self.appInstance.studyController(self.window).view.remov(self.addonController.view);
        if (videoPlayerConfig.getConfig("autoExitWatchMode")) {
          self.addonController.watchMode = false;
        }
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
        // MNUtil.mindmapView.superview.subviews.at(-4).hidden = true
        
        // MNUtil.mindmapView.superview.subviews.at(-6).hidden = true
        // MNUtil.mindmapView.superview.subviews.at(-7).hidden = true
        // MNUtil.mindmapView.superview.subviews.at(-8).hidden = true
        // let tem = MNUtil.mindmapView.superview.subviews.at(-1)
        // tem.hidden = tem.subviews.length === 9
        // MNUtil.mindmapView.superview.subviews.at(-1).subviews[3].hidden = true
        // MNUtil.mindmapView.superview.subviews.at(-1).subviews[4].hidden = true
        // MNUtil.mindmapView.superview.subviews.at(-1).subviews[5].hidden = true

        if (controller !== MNUtil.studyController) {
          return;
        };
        // MNUtil.showHUD("message"+self.addonController.currentFrame.width)

        if (!self.addonController.view.hidden && !self.addonController.onAnimate) {
          let studyFrame = MNUtil.studyView.bounds
            let currentFrame = self.addonController.currentFrame
            if (currentFrame.x+currentFrame.width*0.5 >= studyFrame.width) {
              currentFrame.x = studyFrame.width-currentFrame.width*0.5              
            }
            if (currentFrame.y >= studyFrame.height) {
              currentFrame.y = studyFrame.height-20              
            }
            currentFrame.width = MNUtil.constrain(currentFrame.width, 265, studyFrame.width-currentFrame.x)
            currentFrame.height = MNUtil.constrain(currentFrame.height, 150, studyFrame.height-currentFrame.y)
            self.addonController.setFrame(currentFrame)
        }
      },

      queryAddonCommandStatus: function () {
        if (!videoPlayerUtils.checkLogo()) {
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
      onPopupMenuOnSelection: function (sender) { // Selecting text on pdf or epub
        if (typeof MNUtil === 'undefined') {
          return
        }

          //  Application.sharedInstance().showHUD(sender.userInfo.winRect, self.window, 2);

        if (!self.appInstance.checkNotifySenderInWindow(sender, self.window)) return; // Don't process message from other window
        isOnSelection = true
        let textSelected = sender.userInfo.documentController.selectionText
        self.textSelected = encodeURIComponent(sender.userInfo.documentController.selectionText.replaceAll('/', '\\/'));
        let addonController = self.addonController
        addonController.selectedText = self.textSelected
        if (addonController && !addonController.view.hidden) {
          addonController.blur(0.01)
        }
        if (self.newWindowController) {
          self.newWindowController.selectedText = self.textSelected
          if (!self.newWindowController.view.hidden) {
            self.newWindowController.blur(0.01)
          }
        }
        self.dateGetText = Date.now();
        self.textProcessed = false
        temSender = sender
        if (!addonController.view.window) return;
        if (self.viewTimer) self.viewTimer.invalidate();
        if (self.linkDetected) { 
            // self.appInstance.showHUD("link", self.window, 2);

          self.linkDetected = /^https?:\/\/\w+/.test(textSelected.trim())
          if (self.linkDetected) {
            self.linkTimer.invalidate();
          }else{
            MNUtil.refreshAddonCommands()
          }
        }else{
          self.linkDetected = /^https?:\/\/\w+/.test(textSelected.trim())
            // self.appInstance.showHUD("link", self.window, 2);
          if (self.linkDetected) {
            self.link = textSelected.trim()
            MNUtil.refreshAddonCommands()
            self.linkTimer = NSTimer.scheduledTimerWithTimeInterval(2.5, false, function () {
              self.linkTimer.invalidate()
              self.linkDetected = false
              MNUtil.refreshAddonCommands()
            });
          }
        }
        if (!self.addonController.watchMode) {
          let color = self.addonController.getColor(true)
          if (!addonController.view.hidden) {
            MNButton.setColor(addonController.engineButton, color,0.8)
          }
          if (self.newWindowController) {
            MNButton.setColor(self.newWindowController.engineButton, color,0.8)
          }

          self.viewTimer = NSTimer.scheduledTimerWithTimeInterval(5, false, function () {
            let color = self.addonController.getColor()
            MNButton.setColor(addonController.engineButton, color,0.8)
            addonController.selectedText = ""
            if (self.newWindowController) {
              MNButton.setColor(self.newWindowController.engineButton, color,0.8)
            }
            self.viewTimer.invalidate()
          });
          return
        }
        //watch mode

        // var text = sender.userInfo.documentController.selectionText;
        if (self.textSelected && self.textSelected.length) {
          self.addonController.search(self.textSelected);
          if (videoPlayerConfig.dynamic) {
            // MNUtil.animate(()=>{
            //   self.layoutAddonController(sender.userInfo.winRect, sender.userInfo.arrow);
            // })
            let popupFrame = MNUtil.parseWinRect(sender.userInfo.winRect)
            let targetFrame = videoPlayerUtils.getTargetFrame(popupFrame, sender.userInfo.arrow)
            self.addonController.animateTo(targetFrame)
            self.addonController.view.hidden = false;
            return
          }
          self.addonController.view.hidden = false;
        }
      },
      onPopupMenuOnNote: function (sender) { // Clicking note
        if (typeof MNUtil === 'undefined') {
          return
        }
        if (!self.appInstance.checkNotifySenderInWindow(sender, self.window)) return; // Don't process message from other window
        try {
        if (videoPlayerConfig.getConfig("autoOpenVideoExcerpt")) {
          let focusNote = MNNote.new(sender.userInfo.note.noteId)
          let allText = focusNote.allText
          let result = videoPlayerUtils.extractBilibiliLinks(allText)
          if (result && result.length) {
            if (!videoPlayerUtils.checkSubscribe(true)) {
              return undefined
            }
            // MNUtil.copy(result)
            if (self.addonController.view.hidden) {
              self.addonController.show()
            }
            // if (arguments.length > 2) {
            //   let p = arguments[2].match(/(?<=p\=).*/)[0]
            //   self.addonController.openOrJump(id,time,parseInt(p))
            // }else{
            //   self.addonController.openOrJump(id,time,0)
            // }
            if ("p" in result[0]) {
              self.addonController.openOrJump(result[0].videoId,result[0].t,result[0].p)
            }else{
              self.addonController.openOrJump(result[0].videoId,result[0].t,0)
            }
            MNUtil.studyView.bringSubviewToFront(self.addonController.view)
          }
        }
        let currentNoteId = sender.userInfo.note.noteId
        let note = sender.userInfo.note
        // UIPasteboard.generalPasteboard().string = note.notesText
        let text = self.getTextForSearch(note)
        // Application.sharedInstance().showHUD(text,self.window,2)

        self.textSelected = encodeURIComponent(text.replaceAll('/', '\\/'))
        // self.textSelected = encodeURIComponent(note.excerptText ?? note.noteTitle.replaceAll('/', '\\/'))

        self.addonController.selectedText = self.textSelected
        self.addonController.currentNoteId = currentNoteId
        if (self.addonController && !self.addonController.view.hidden) {
          self.addonController.blur(0.01)
        }
        if (self.newWindowController) {
          self.newWindowController.selectedText = self.textSelected
          if (!self.newWindowController.view.hidden) {
            self.newWindowController.blur(0.01)
          }
        }
        self.dateGetText = Date.now();
        self.textProcessed = false
        temSender = sender
        // Application.sharedInstance().showHUD(sender.userInfo.note,self.window,2)
        if (!self.addonController.view.window) return;

        if (self.viewTimer) self.viewTimer.invalidate();
        if (self.linkDetected) {

          let allNotes = self.getNoteList(note)
          self.linkDetected = allNotes.some(note=>/^https:\/\//.test(note.trim()))
          if (self.linkDetected) {
            self.linkTimer.invalidate();
          }else{
            MNUtil.refreshAddonCommands()
          }
        }else{
          let allNotes = self.getNoteList(note)
          self.linkDetected = allNotes.some(note=>/^https:\/\//.test(note.trim()))
          if (self.linkDetected) {
            self.link = allNotes.filter(note=>/^https:\/\//.test(note.trim()))[0].trim()
            MNUtil.refreshAddonCommands()
            self.linkTimer = NSTimer.scheduledTimerWithTimeInterval(2.5, false, function () {
              self.linkTimer.invalidate()
              self.linkDetected = false
              MNUtil.refreshAddonCommands()
            });
          }
        }
        if (!self.addonController.watchMode) {
          let color = self.addonController.getColor(true)
          if (!self.addonController.view.hidden) {
            self.addonController.engineButton.backgroundColor = MNUtil.hexColorAlpha(color, 0.8)
          }
          if (self.newWindowController) {
            self.newWindowController.engineButton.backgroundColor = MNUtil.hexColorAlpha(color, 0.8)
          }
          self.viewTimer = NSTimer.scheduledTimerWithTimeInterval(5, false, function () {
            let color = self.addonController.getColor()
            self.addonController.engineButton.backgroundColor = MNUtil.hexColorAlpha(color, 0.8)
            // self.addonController.webAppButton.backgroundColor = UIColor.colorWithHexString(color).colorWithAlphaComponent(0.8);
            self.addonController.selectedText = ""
            if (self.newWindowController) {
              self.newWindowController.engineButton.backgroundColor = MNUtil.hexColorAlpha(color, 0.8)
            }
            self.viewTimer.invalidate()
          });
          return
        }
        if (self.textSelected && self.textSelected.length) {
          self.addonController.search(self.textSelected);
          if (videoPlayerConfig.dynamic) {
            let popupFrame = MNUtil.parseWinRect(sender.userInfo.winRect)
            let targetFrame = videoPlayerUtils.getTargetFrame(popupFrame, sender.userInfo.arrow)
            self.addonController.animateTo(targetFrame)
            // MNUtil.copyJSON(targetFrame)
            // videoPlayerUtils.animateToFrame(self.addonController.view, targetFrame)
            // MNUtil.animate(()=>{
            //   self.addonController.view.frame = targetFrame
            //   self.addonController.currentFrame = targetFrame
            // })
            self.addonController.view.hidden = false;
            return
          }

          self.addonController.view.hidden = false;
        }
        } catch (error) {
            videoPlayerUtils.addErrorLog(error, "onPopupMenuOnNote")
        }
        // self.addonController.view.frame = {x:0,y:0,width:100,height:100}
      },

      onNewWindow: function (sender) {
        if (typeof MNUtil === 'undefined') {
          return
        }
        MNUtil.log("onNewWindow")
        if (self.window !== MNUtil.currentWindow) {
          MNUtil.showHUD("reject")
          return
        }
        try {
        let userInfo = sender.userInfo
        videoPlayerUtils.log("userInfo",userInfo)
        if (!self.newWindowController) {
          self.newWindowController = videoPlayerController.new();
          if (self.addonController.addonBar) {
            self.newWindowController.addonBar = self.addonController.addonBar
          }
          self.newWindowController.view.hidden = true
          MNUtil.studyView.addSubview(self.newWindowController.view);
          self.newWindowController.setFrame(50,100,419,450)
        }
        let newWindowController = self.newWindowController
        if (!MNUtil.isDescendantOfStudyView(newWindowController.view)) {
          MNUtil.studyView.addSubview(newWindowController.view)
        }
        if (newWindowController.view.hidden) {
          if (newWindowController.addonBar) {
            newWindowController.show(newWindowController.addonBar.frame)
          }else{
            newWindowController.show()
          }
        }
        newWindowController.setWebMode(userInfo.desktop)
        let toolbar = videoPlayerConfig.toolbar
        newWindowController.buttonScrollview.hidden = !toolbar
        var viewFrame = newWindowController.view.bounds;
        if (videoPlayerConfig.toolbar) {
          newWindowController.webview.frame = { x: viewFrame.x + 1, y: viewFrame.y + 10, width: viewFrame.width - 2, height: viewFrame.height - 40 }
        } else {
          newWindowController.webview.frame = { x: viewFrame.x + 1, y: viewFrame.y + 10, width: viewFrame.width - 2, height: viewFrame.height }
        }
        newWindowController.isMainWindow = false
        newWindowController.webview.hidden = false;
        // Application.sharedInstance().showHUD(userInfo.url, self.window, 5);
        if (userInfo.homePage) {
          newWindowController.homePage()
        }else{
          if (userInfo.url === "about:blank") {
            newWindowController.homePage()
          }else{
            MNConnection.loadRequest(newWindowController.webview, userInfo.url)
          }
        }
        // newWindowController.webview.loadRequest(MNUtil.requestWithURL(sender.userInfo.url));
        } catch (error) {
          videoPlayerUtils.addErrorLog(error, "onNewWindow")
        }
      },
      onPasteboardChange: function () {
        if (typeof MNUtil === 'undefined') {
          return
        }
        MNUtil.showHUD("check:")

      },
      onAddonBroadcast: function (sender) {
        if (self.window!==MNUtil.currentWindow) {
          return
        }
        if (!videoPlayerUtils.checkSubscribe(false,true,true)) {
          return
        }
        try {
        let tem = sender.userInfo.message
        let message = tem.startsWith("marginnote4app://addon/") ? tem : "marginnote4app://addon/"+tem
        let config = MNUtil.parseURL(message)
        let addon = config.pathComponents[0]
        if (addon === "VideoExcerpt") {
          // MNUtil.copy(config)
          let id = config.params.videoId
          let time = parseFloat(config.params.t)
          if (self.addonController.view.hidden) {
            // MNUtil.showHUD("message")
            self.addonController.show()
          }
          self.addonController.openOrJump(id,time,0)
          MNUtil.studyView.bringSubviewToFront(self.addonController.view)
        }
        // let message = sender.userInfo.message
        // if (/BilibiliExcerpt\?/.test(message) && (typeof biliUtils === 'undefined')) {
        //   let arguments = message.match(/(?<=BilibiliExcerpt\?).*/)[0].split("&")
        //   let id = arguments[0].match(/(?<=videoId\=)\w+/)[0]
        //   let time = arguments[1].match(/(?<=t\=).*/)[0]
        //   if (self.addonController.view.hidden) {
        //     // MNUtil.showHUD("message")
        //     self.addonController.show()
        //   }
        //   if (arguments.length > 2) {
        //     let p = arguments[2].match(/(?<=p\=).*/)[0]
        //     self.addonController.openOrJump(id,time,parseInt(p))
        //   }else{
        //     self.addonController.openOrJump(id,time,0)
        //   }
        //   MNUtil.studyView.bringSubviewToFront(self.addonController.view)
        // }
        // if (/YoutubeExcerpt\?/.test(message)) {
        //   let arguments = message.match(/(?<=YoutubeExcerpt\?).*/)[0].split("&")
        //   let id = arguments[0].match(/(?<=videoId\=)\w+/)[0]
        //   let time = arguments[1].match(/(?<=t\=).*/)[0]
        //   if (self.addonController.view.hidden) {
        //     // MNUtil.showHUD("message")
        //     self.addonController.show()
        //   }
        //   self.addonController.openOrJumpForYT(id,time)
        //   MNUtil.studyView.bringSubviewToFront(self.addonController.view)
        // }
        } catch (error) {
          videoPlayerUtils.addErrorLog(error, "onAddonBroadcast")
        }
      },
      receivedSearchInBrowser: function (sender) {
        if (typeof MNUtil === 'undefined') {
          return
        }
        // Application.sharedInstance().showHUD("check:",self.appInstance.focusWindow,2)
        if (self.window!==self.appInstance.focusWindow) {
          return
        }
        let info = sender.userInfo
        // MNUtil.copyJSON(sender.userInfo)
        if (info.noteid) {
          let note = MNNote.new(info.noteid)
          let result = videoPlayerUtils.extractBilibiliLinks(note.allNoteText())
          if (result && result.length) {
            let delay = 0
            if (self.addonController.view.hidden) {
              delay = 0.5
            }
            MNUtil.delay(0).then(()=>{
              if ("p" in result[0]) {
                self.addonController.openOrJump(result[0].videoId,result[0].t,result[0].p)
              }else{
                self.addonController.openOrJump(result[0].videoId,result[0].t,0)
              }
            })
          }else{
            let text = encodeURIComponent(self.getTextForSearch(note))
            self.addonController.selectedText = text
            if ("engine" in info) {
              let engine = Object.keys(videoPlayerConfig.entries).find(key=>videoPlayerConfig.entries[key].engine===info.engine)
              self.addonController.search(text,engine)
            }else{
              self.addonController.search(text)
            }
          }
        }else if(info.text){
          self.textSelected = encodeURIComponent(info.text.replaceAll('/', '\\/'));
          self.addonController.selectedText = self.textSelected
          if ("engine" in info) {
            let engine = Object.keys(videoPlayerConfig.entries).find(key=>videoPlayerConfig.entries[key].engine===info.engine)
            self.addonController.search(self.textSelected,info.engine)
          }else{
            self.addonController.search(self.textSelected)
          }
        }

        if (!self.addonController.view.hidden) {
          if (videoPlayerConfig.dynamic) {
            self.addonController.show(self.addonController.view.frame,info.endFrame)
          }
          return
        }
        if (info.beginFrame && info.endFrame) {
          self.addonController.show(info.beginFrame,info.endFrame)
          MNUtil.studyView.bringSubviewToFront(self.addonController.view)
          return
        }
        self.addonController.show()
        MNUtil.studyView.bringSubviewToFront(self.addonController.view)
      },
      receivedOpenInBrowser: function (sender) {
        if (typeof MNUtil === 'undefined') {
          return
        }
        if (self.window!==self.appInstance.focusWindow) {
          return
        }
        let userInfo = sender.userInfo
        if ("desktop" in userInfo) {
          MNConnection.loadRequest(self.addonController.webview, userInfo.url, userInfo.desktop)
          self.addonController.setWebMode(userInfo.desktop)
        }else{
          MNConnection.loadRequest(self.addonController.webview, userInfo.url)
        }
        // MNUtil.showHUD("receivedOpenInBrowser")
        // self.addonController.webview.loadRequest(
        //     NSURLRequest.requestWithURL(NSURL.URLWithString(sender.userInfo.url))
        //   );
        if (!self.addonController.view.hidden) {
          return
        }
        if (userInfo.beginFrame && userInfo.endFrame) {
          self.addonController.show(userInfo.beginFrame,userInfo.endFrame)
          return
        }
        self.addonController.show()
      },
      receivedCustomAction: function (sender) {
        if (typeof MNUtil === 'undefined') {
          return
        }
        if (self.window!==self.appInstance.focusWindow) {
          return
        } 
        try {
        if (!("action" in sender.userInfo)) {
          MNUtil.showHUD("Action not found")
          return
        }
        let info = sender.userInfo
        let action = info.action.trim()
        self.addonController.executeCustomAction(action)

        if (!self.addonController.view.hidden) {
          return
        }
        if (info.beginFrame && info.endFrame) {
          self.addonController.show(info.beginFrame,info.endFrame)
          MNUtil.studyView.bringSubviewToFront(self.addonController.view)
          return
        }
        } catch (error) {
          videoPlayerUtils.addErrorLog(error, "receivedCustomAction")
        }
      },
      receivedOpenWebAppInBrowser: function (sender) {
        if (typeof MNUtil === 'undefined') {
          return
        }
        if (self.window!==self.appInstance.focusWindow) {
          return
        }
        try {
        if (!("webapp" in sender.userInfo)) {
          MNUtil.showHUD("WebApp not found")
          return
        }
        let info = sender.userInfo
        let webappName = info.webapp.trim()
        let webapp = videoPlayerConfig.webAppEntrieNames.find(key=>videoPlayerConfig.webAppEntries[key].title===webappName)
        if (webapp === undefined) {
          MNUtil.showHUD("WebApp not found: "+webappName)
          return
        }
        self.addonController.changeWebAppTo(webapp)
        if (!self.addonController.view.hidden) {
          self.addonController.show(self.addonController.view.frame,info.endFrame)
          return
        }
        if (info.beginFrame && info.endFrame) {
          self.addonController.show(info.beginFrame,info.endFrame)
          MNUtil.studyView.bringSubviewToFront(self.addonController.view)
          return
        }
        self.addonController.show()
        MNUtil.studyView.bringSubviewToFront(self.addonController.view)
        } catch (error) {
          videoPlayerUtils.addErrorLog(error, "receivedOpenWebAppInBrowser")
        }
      },
      onSetVideo: function (sender) {
        if (typeof MNUtil === 'undefined') {
          return
        }
        if (self.window!==self.appInstance.focusWindow) {
          return
        }
        // MNUtil.copyJSON(sender.userInfo)
        self.addonController.runJavaScript(`document.getElementsByTagName('video')[0].currentTime = `+sender.userInfo.time)
      },
      toggleAddon: async function (sender) {
        // MNUtil.mindmapView.hidden = true
        // MNUtil.mindmapView.superview.subviews.at(-4).hidden = true

        // let tem = MNUtil.mindmapView.superview.subviews.at(-1)
        // MNUtil.showHUD("message"+tem.subviews.length)
        // MNUtil.openURL("file://"+videoPlayerUtils.mainPath+"/test.pdf")
        if (typeof MNUtil === 'undefined') {
          return
        }
        try {
        if (!videoPlayerUtils.checkSubscribe(false,true,true)) {
          return
        }

          
        self.ensureView()
        if (!self.addonBar) {
          self.addonBar = sender.superview.superview
          self.addonController.addonBar = self.addonBar
        }
        if (self.addonController.currentNote()) {//自动提取哔哩哔哩链接
          // let text = self.getTextForSearch(self.addonController.currentNoteId)
          // MNUtil.copy(text)
          let result = videoPlayerUtils.extractVideoLinks(self.addonController.currentNote().allNoteText())
          // videoPlayerUtils.log("links",result)
          if (result && result.length) {
            // MNUtil.copy(result)
            if (result.length === 1) {
              if (self.addonController.view.hidden) {
                self.addonController.show()
              }
              self.addonController.openOrJump(result[0].videoId,result[0].t)
            }else{
              let menu = new Menu(sender,self)
              let selector = "openBilibiliLink:"
              menu.preferredPosition = 0
              result.forEach(item=>{
                let formatedVideoTime = videoPlayerUtils.formatSeconds(parseFloat(item.t))
                if (!item.p) {
                  delete item.p
                }
                menu.addItem(formatedVideoTime+" | "+item.videoId,selector,item)
              })
              menu.show()
              return
              // MNUtil.showHUD("multiple link")
            }
            // if (arguments.length > 2) {
            //   let p = arguments[2].match(/(?<=p\=).*/)[0]
            //   self.addonController.openOrJump(id,time,parseInt(p))
            // }else{
            //   self.addonController.openOrJump(id,time,0)
            // }

            return
          }
        }
        if (self.addonController.view.hidden) {
          if (self.isFirst) {
            // Application.sharedInstance().showHUD("first",self.window,2)
            let buttonFrame = self.addonBar.frame
            let size = videoPlayerConfig.getConfig("size")
            let width = MNUtil.app.osType !== 1 ? size.width : 365
            if (buttonFrame.x === 0) {
              self.addonController.setFrame(40,buttonFrame.y,width,size.height)
            }else{
              self.addonController.setFrame(buttonFrame.x-width,buttonFrame.y,width,size.height)
            }
            self.isFirst = false;
          }
        // MNUtil.showHUD("message"+videoPlayerConfig.toolbar)
          MNUtil.studyView.bringSubviewToFront(self.addonBar)
          self.addonController.show(self.addonBar.frame)
          if (!self.addonController.currentVideoId) {
            self.addonController.homePage()
          }
          // self.addonController.homePage()
          // self.addonController.view.hidden = false
          // self.addonController.webview.hidden = false
        } else {
          if (self.textProcessed || self.addonController.watchMode) {
            // self.addonController.view.hidden = true;
            if (self.addonController.miniMode) {
              let preFrame = self.addonController.view.frame
              self.addonController.view.hidden = true
              self.addonController.showAllButton()
              let studyFrame = MNUtil.studyView.bounds
              if (self.addonController.view.frame.x < studyFrame.width*0.5) {
                self.addonController.lastFrame.x = 0
              }else{
                self.addonController.lastFrame.x = studyFrame.width-self.addonController.lastFrame.width
              }
              self.addonController.setFrame(self.addonController.lastFrame)
              MNUtil.studyView.bringSubviewToFront(self.addonBar)
              self.addonController.show(preFrame)
            }else{
              self.addonController.hide(self.addonBar.frame)
            }
            if (videoPlayerConfig.getConfig("autoExitWatchMode")) {
              self.addonController.watchMode = false;
            }
            MNUtil.refreshAddonCommands()
            return;
          }
        }
        MNUtil.delay(0.2).then(()=>{
          MNUtil.studyView.becomeFirstResponder()
        })
        if (!self.addonController.view.window) return;
        if (self.viewTimer) self.viewTimer.invalidate();



        // Application.sharedInstance().showHUD("process:1",self.window,2)
        var text = self.textSelected;
        //五秒内点击了logo
        if (text && text.length  && (Date.now() - self.dateGetText < 5000)) {
        // Application.sharedInstance().showHUD("process:2",self.window,2)

          // self.addonController.view.frame = {x:0,y:0,width:100,height:100}
          self.addonController.search(text);
          // self.addonController.homePage(text);
          if (videoPlayerConfig.dynamic && temSender) {
            let popupFrame = MNUtil.parseWinRect(temSender.userInfo.winRect)
            let targetFrame = videoPlayerUtils.getTargetFrame(popupFrame, temSender.userInfo.arrow)
            self.addonController.animateTo(targetFrame)
            // self.layoutAddonController(temSender.userInfo.winRect, temSender.userInfo.arrow);
          }
          // self.addonController.view.hidden = false;
          self.addonController.miniMode = false
          // self.addonController.searchButton.hidden = false

          if (videoPlayerConfig.dynamic) {
            videoPlayerConfig.toolbar = false
            self.addonController.custom = false;
            self.addonController.customMode = "None"
            self.addonController.buttonScrollview.hidden = true
            // self.addonController.webAppEntriesButton.hidden = true
            // MNUtil.showHUD("message0")
            var viewFrame = self.addonController.view.bounds;
            // MNUtil.animate(()=>{
              self.addonController.webview.frame = {x:viewFrame.x+1,y:viewFrame.y+10,width:viewFrame.width-2,height:viewFrame.height}
            // })
          }
          self.textProcessed = true
        } else {
        // Application.sharedInstance().showHUD("process:3",self.window,2)

          self.textProcessed = true
          // self.addonController.homePage(text);
          if (videoPlayerConfig.dynamic && temSender) {
        // Application.sharedInstance().showHUD("process:3",self.window,2)
            self.layoutAddonController(temSender.userInfo.winRect, temSender.userInfo.arrow);
          }
        }
  
} catch (error) {
    videoPlayerUtils.addErrorLog(error, "toggleAddon")
}
      },
      openBilibiliLink: function (params) {
        Menu.dismissCurrentMenu()
        if (self.addonController.view.hidden) {
          self.addonController.show()
        }
        // videoPlayerUtils.log("openBilibiliLink", params)
        self.addonController.openOrJump(params.videoId,params.t,params.p)
      },
    },
    { /* Class members */
      addonDidConnect: function () {
      },

      addonWillDisconnect: async function () {
        let confirm = await MNUtil.confirm("MN Browser: Remove all config?\n删除所有配置？", "")
        if (!confirm) {
          return
        }
        videoPlayerConfig.entries = videoPlayerConfig.defaultEntries
        videoPlayerConfig.entrieNames = Object.keys(videoPlayerConfig.entries)
        videoPlayerConfig.engine = videoPlayerConfig.entrieNames[0]
        videoPlayerConfig.webAppEntries = videoPlayerConfig.defaultWebAppEntries
        videoPlayerConfig.webAppEntrieNames = Object.keys(videoPlayerConfig.webAppEntries)
        videoPlayerConfig.toolbar = true
        videoPlayerConfig.engine = "Bing"
        videoPlayerConfig.dynamic = false
        videoPlayerConfig.remove("MNVideoPlayer_entrieNames")
        videoPlayerConfig.remove("MNVideoPlayer_entries")
        videoPlayerConfig.remove('MNVideoPlayer_engine');
        videoPlayerConfig.remove("MNVideoPlayer_webAppEntrieNames")
        videoPlayerConfig.remove("MNVideoPlayer_webAppEntries")
        videoPlayerConfig.remove('MNVideoPlayer_webApp');
        videoPlayerConfig.remove('MNVideoPlayer_toolbar');
        videoPlayerConfig.remove('MNVideoPlayer_onNewExcerpt');
        videoPlayerConfig.remove('MNVideoPlayer_dynamic');
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

  MNVideoPlayerClass.prototype.layoutAddonController = function (rectStr, arrowNum) {
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
  MNVideoPlayerClass.prototype.checkWatchMode = function () {

    if (Date.now() - this.dateNow < 500) {
      this.addonController.watchMode = true;
      MNUtil.showHUD("Watch mode")
      MNUtil.refreshAddonCommands()
      this.addonController.webview.hidden = false
      this.addonController.view.hidden = false
      this.addonController.showAllButton()

      // if (this.addonController.view.hidden) {
      //   this.addonController.show(this.addonBar.frame)
      // }
      return true;
    }else{
      this.dateNow = Date.now()
      return false
    }
  };
  MNVideoPlayerClass.prototype.checkLink = function () {
     if (this.linkDetected) {
      MNConnection.loadRequest(this.addonController.webview, this.link)
      if (this.addonController.view.hidden) {
        this.addonController.show(this.addonBar.frame)
      }
      return true
    }
    return false
  }
  MNVideoPlayerClass.prototype.getNoteList = function (note) {
    let noteList = []
    if (note.noteTitle) {
      noteList.push(note.noteTitle)
    }
    if (note.excerptText && !note.excerptPic) {
      noteList.push(note.excerptText)
    }
    return noteList.concat(note.comments.filter(comment=>comment.type==="TextNote").map(comment=>comment.text))
  };
  MNVideoPlayerClass.prototype.getTextForSearch = function (note) {
    try {

    if (typeof note === "string") {
      note = MNNote.new(note)
    }
    if (!note) {
      return ""
    }
    let order = videoPlayerConfig.searchOrder
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
      
    } catch (error) {
      videoPlayerUtils.addErrorLog(error, "getTextForSearch")
      return ""
    }
  }
  MNVideoPlayerClass.prototype.init = function(mainPath){ 
  try {
    if (!this.initialized) {
      videoPlayerUtils.init(mainPath)
      videoPlayerConfig.init()
      this.initialized = true
    }
    if (!this.addonController) {
      this.addonController = videoPlayerController.new();
    }
  } catch (error) {
    videoPlayerUtils.addErrorLog(error, "init")
  }
  }
  /**
   * 
   * @param {string} selector 
   * @param {string} name 
   * @this {MNVideoPlayerClass}
   * @returns 
   */
  MNVideoPlayerClass.prototype.addObserver = function (selector,name) {
    NSNotificationCenter.defaultCenter().addObserverSelectorName(this, selector, name);
  }
  /**
   * 
   * @param {string[]} names
   * @this {MNVideoPlayerClass}
   * @returns 
   */
  MNVideoPlayerClass.prototype.removeObservers = function (names) {
    names.forEach(name=>{
      NSNotificationCenter.defaultCenter().removeObserverName(this, name);
    })
  }
  /**
   * 
   * @param {boolean} refresh 
   * @this {MNVideoPlayerClass}
   * @returns 
   */
  MNVideoPlayerClass.prototype.ensureView = function (refresh = true) {
  try {
    if (!MNUtil.isDescendantOfStudyView(this.addonController.view)) {
      MNUtil.studyView.addSubview(this.addonController.view)
      this.addonController.view.hidden = true
      if (refresh) {
        MNUtil.refreshAddonCommands()
      }
      if (!this.addonController.miniMode && !this.addonController.inHomePage) {
        this.addonController.homePage()
      }
    }
      } catch (error) {
        videoPlayerUtils.addErrorLog(error, "ensureView")
  }
  }
  MNVideoPlayerClass.prototype.checkUpdate = async function () {
    // videoPlayerUtils.addErrorLog("not implemented", "checkUpdate")
    let success = await videoPlayerConfig.readCloudConfig(false)
    if (success) {
      this.addonController.refreshLastSyncTime()
    }
  }
  return MNVideoPlayerClass;
};

