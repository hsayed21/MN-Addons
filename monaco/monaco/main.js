
JSB.newAddon = function (mainPath) {
  JSB.require('utils');
  if (!monacoUtils.checkMNUtilsFolder(mainPath)) {
    Application.sharedInstance().showHUD("Monaco: Please install 'MN Utils' first!",Application.sharedInstance().focusWindow,5)
    return undefined
  }
  JSB.require('webviewController');
  JSB.require('settingController');
  JSB.require('network');
  
  /** @return {MonacoClass} */
  const getMonacoClass = ()=>self

  var MonacoClass = JSB.defineClass(
    'Monaco : JSExtension',
    { /* Instance members */
      sceneWillConnect: async function () { //Window initialize
        await monacoUtils.delay(0.01)
        if (typeof MNUtil === 'undefined') {
          Application.sharedInstance().showHUD("Monaco: Please install 'MN Utils' first!",Application.sharedInstance().focusWindow,5)
          return
        }
        monacoUtils.init(mainPath)
        monacoConfig.init()
        let self = getMonacoClass()
        self.watchMode = false;
        self.textSelected = ""
        self.textProcessed = false;
        self.dateGetText = Date.now();
        self.dateNow = Date.now();
        self.rect = '{{0, 0}, {10, 10}}';
        self.arrow = 1;
        self.isFirst = true;
        self.linkDetected = false
        self.monacoInitialized = false
        MNUtil.addObserver(self, 'onPopupMenuOnNote:', 'PopupMenuOnNote');
        MNUtil.addObserver(self, 'onPopupMenuOnSelection:', 'PopupMenuOnSelection');
        MNUtil.addObserver(self, 'receivedOpenInEditor:', 'openInMonaco');
        // MNUtil.addObserver(self, 'receivedEditorInsert:', 'editorInsert');
      },

      sceneDidDisconnect: function () { // Window disconnect
        MNUtil.removeObservers(self, [
          'PopupMenuOnSelection','PopupMenuOnNote','openInMonaco'
        ])
      },

      sceneWillResignActive: function () { // Window resign active
      },

      sceneDidBecomeActive: function () { // Window become active
      },

      notebookWillOpen: async function (notebookid) {
        await monacoUtils.delay(0.01)
        if (typeof MNUtil === 'undefined') {
          return
        }

        try {
        self.appInstance = Application.sharedInstance();
        // self.addonController = monacoController.new();
        if (!self.addonController) {
          self.addonController = monacoController.new();
        }
        MNUtil.currentWindow.addSubview(self.addonController.view)
        MNUtil.refreshAddonCommands()
        self.addonController.view.hidden = true;
        self.addonController.notebookid = notebookid
        if (!self.monacoInitialized) {
          self.addonController.webview.loadFileURLAllowingReadAccessToURL(
            NSURL.fileURLWithPath(monacoUtils.bufferFolder + 'index.html'),
            NSURL.fileURLWithPath(monacoUtils.bufferFolder)
          );
          self.monacoInitialized = true
          self.addonController.sidebarView.loadFileURLAllowingReadAccessToURL(
            NSURL.fileURLWithPath(monacoUtils.bufferFolder + 'sidebar.html'),
            NSURL.fileURLWithPath(monacoUtils.bufferFolder)
          );
        }


        self.addonController.headingButton.hidden = false
        self.addonController.goBackButton.hidden = false
        self.addonController.goForwardButton.hidden = false
        self.addonController.refreshButton.hidden = false
        self.addonController.saveButton.hidden = false
        var viewFrame = self.addonController.view.bounds;
        self.addonController.webview.frame = MNUtil.genFrame(viewFrame.x + 1, viewFrame.y + 10, viewFrame.width - 2, viewFrame.height - 40)
        } catch (error) {
          monacoUtils.addErrorLog(error, "notebookWillOpen")

        }
      },
      notebookWillClose: function (notebookid) {
        if (typeof MNUtil === 'undefined') {
          return
        }
        // Application.sharedInstance().showHUD("close",self.window,2)
        if (self.addonController.miniMode) {
          let preFrame = self.addonController.view.frame
          self.addonController.view.hidden = true
          self.addonController.showAllButton()
          let windowFrame = MNUtil.currentWindow.bounds
          if (self.addonController.view.frame.x < windowFrame.width*0.5) {
            self.addonController.lastFrame.x = 0
          }else{
            self.addonController.lastFrame.x = windowFrame.width-self.addonController.lastFrame.width
          }
          self.addonController.setFrame(self.addonController.lastFrame)
          self.addonController.show(preFrame)
        }
        self.addonController.view.removeFromSuperview()
        self.newWindowController.view.removeFromSuperview()

        
        self.watchMode = false;
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
        if (self.addonController.onAnimate) {
         return; 
        }
        if (!self.addonController.view.hidden) {
          let windowFrame = MNUtil.currentWindow.bounds
          if (self.addonController.miniMode) {
            let oldFrame = self.addonController.view.frame
            if (oldFrame.x < windowFrame.width*0.5) {
            // self.addonController.view.frame = self.addonController.currentFrame
              self.addonController.view.frame = { x: 0, y: oldFrame.y, width: 40, height: 40 }
            } else {
              self.addonController.view.frame = { x: windowFrame.width - 40, y: oldFrame.y, width: 40, height: 40 }
            }
          }else{
            let currentFrame = self.addonController.currentFrame
            if (currentFrame.x+currentFrame.width*0.5 >= windowFrame.width) {
              currentFrame.x = windowFrame.width-currentFrame.width*0.5              
            }
            if (currentFrame.y >= windowFrame.height) {
              currentFrame.y = windowFrame.height-20              
            }
            self.addonController.setFrame(currentFrame)
          }
        }
      },
      queryAddonCommandStatus: function () {
        if (!monacoUtils.checkLogo()) {
          return null
        }
        return {
          image: 'logo.png',
          object: self,
          selector: 'toggleAddon:',
          checked: self.watchMode
        };
      },
      onPopupMenuOnNote: async function (sender) {
        if (typeof MNUtil === 'undefined') {
          return
        }
        if (self.window!==MNUtil.currentWindow) {
          return
        }
        self.addonController.blur()
      },
      receivedOpenInEditor: async function (sender) {
        if (typeof MNUtil === 'undefined') {
          return
        }
        if (self.window!==MNUtil.currentWindow) {
          return
        }
        // MNUtil.showHUD("message:"+(Date.now()-MNUtil.beginTime))
    try {
        if (self.addonController.view.hidden) {
          if (sender.userInfo.beginFrame) {
            if (sender.userInfo.endFrame) {
              let endFrame = sender.userInfo.endFrame
              if (endFrame.y<0) {
                endFrame.y = 0
              }
              self.addonController.show(sender.userInfo.beginFrame,endFrame)
            }else{
              self.addonController.show(sender.userInfo.beginFrame)
            }
          }else{
            self.addonController.show()
          }
        }
        // return
        await MNUtil.delay(0.01)
        if (sender.userInfo.html) {
          self.addonController.openWithHtmlContent(sender.userInfo.html)
          // if (sender.userInfo.fileURL) {
          //   self.addonController.targetURL = sender.userInfo.fileURL
          //   self.addonController.setBackgroundColor("#b6d2bc")
          // }else{
          //   self.addonController.targetURL = undefined
          //   self.addonController.setBackgroundColor("#9bb2d6")
          // }
          self.addonController.editorNoteId = undefined
        }
        // MNUtil.copyJSON(sender.userInfo)
        if (sender.userInfo.noteId) {
          let note = MNNote.new(sender.userInfo.noteId)
          if (note) {
            self.addonController.setContent(note)
            // self.addonController.view.hidden = false;
            self.addonController.miniMode = false
            self.textProcessed = true
          }
        }


    } catch (error) {
      monacoUtils.addErrorLog(error, "receivedOpenInEditor")
    }
      },
      receivedEditorInsert: async function (sender) {
        if (typeof MNUtil === 'undefined') {
          return
        }
        if (self.window!==MNUtil.currentWindow) {
          return
        }
        try {
          
        if (self.addonController.view.hidden) {
          if (sender.userInfo.beginFrame && sender.userInfo.endFrame) {
            let endFrame = sender.userInfo.endFrame
            if (endFrame.y<0) {
              endFrame.y = 0
            }
            self.addonController.show(sender.userInfo.beginFrame,endFrame)
          }else if (self.addonBar) {
            self.addonController.show(self.addonBar.frame)
          }else{
            self.addonController.show()
          }
        }
        await MNUtil.delay(0.01)
        if (sender.userInfo.contents && sender.userInfo.contents.length) {
          let contents = sender.userInfo.contents.map(content=>{
            if (content.type === "image") {
              let url = monacoUtils.getLocalBufferFromBase64(content.content)
              return `![image](${url})`
            }
            if (content.type === "text") {
              // MNUtil.copy(content.content)
              return content.content
            }
          }).join("\n")+"\n"
          // let replacedContent = await self.addonController.replaceBase64ImagesWithR2(contents)
          // MNUtil.copy(replacedContent)
          self.addonController.runJavaScript(`insertValue(\`${encodeURIComponent(contents)}\`,true)`)

        }
                } catch (error) {
         MNUtil.showHUD(error) 
        }
      },
      toggleAddon: async function (sender) {
        if (typeof MNUtil === 'undefined') {
          return
        }
        // MNUtil.copy(MNUtil.dbFolder)
        try {
          

        if (!self.addonBar) {
          self.addonBar = sender.superview.superview
          self.addonController.addonBar = self.addonBar
        }
        self.addonController.endFrame = undefined
        if (self.checkWatchMode()) { return }

        if (self.addonController.view.hidden) {
          if (self.isFirst) {
            // Application.sharedInstance().showHUD("first",self.window,2)

            let buttonFrame = self.addonBar.frame
            let width = MNUtil.app.osType !== 1 ? 500 : 365
            if (buttonFrame.x === 0) {
              self.addonController.setFrame(40,buttonFrame.y,width,500)
            }else{
              self.addonController.setFrame(buttonFrame.x-width,buttonFrame.y,width,500)
            }
            self.isFirst = false;
          }
          MNUtil.currentWindow.bringSubviewToFront(self.addonBar)
          // MNUtil.copyJSON(self.addonController.view.frame)
          self.addonController.show()
          // self.addonController.view.hidden = false
          // self.addonController.webview.hidden = false
        } else {
            // self.addonController.view.hidden = true;
            if (self.addonController.miniMode) {
              let preFrame = self.addonController.view.frame
              self.addonController.view.hidden = true
              self.addonController.showAllButton()
              let windowFrame = MNUtil.currentWindow.bounds
              if (self.addonController.view.frame.x < windowFrame.width*0.5) {
                self.addonController.lastFrame.x = 0
              }else{
                self.addonController.lastFrame.x = windowFrame.width-self.addonController.lastFrame.width
              }
              self.addonController.setFrame(self.addonController.lastFrame)
              MNUtil.currentWindow.bringSubviewToFront(self.addonBar)
              self.addonController.show(preFrame)
            }else{
              self.addonController.hide()
            }
            self.watchMode = false;
            MNUtil.refreshAddonCommands()
            return;
          }
        if (!self.addonController.view.window) return;
        if (self.viewTimer) self.viewTimer.invalidate();
        self.textProcessed = true
} catch (error) {
        MNUtil.showHUD("Error in toggleAddon: "+error)
  
}
      },
    },
    { /* Class members */
      addonDidConnect: function () {
      },

      addonWillDisconnect: async function () {
      },

      applicationWillEnterForeground: function () {
      },

      applicationDidEnterBackground: function () {
      },

      applicationDidReceiveLocalNotification: function (notify) {
      }
    }
  );

  MonacoClass.prototype.layoutAddonController = function (rectStr, arrowNum) {

    this.rect = rectStr || this.rect;
    this.arrow = arrowNum || this.arrow;
    var x, y
    w = (MNUtil.app.osType !== 1) ? 419 : 365, // this.addonController.view.frame.width
      h = 500, // this.addonController.view.frame.height
      fontSize = 15,
      margin = 10,
      padding = 20,
      frame = MNUtil.currentWindow.bounds,
      W = frame.width,
      H = frame.height,
      rectArr = this.rect.replace(/{/g, '').replace(/}/g, '').replace(/\s/g, '').split(','),
      X = Number(rectArr[0]),
      Y = Number(rectArr[1]),
      studyMode = MNUtil.studyMode,
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
    this.addonController.setFrame(x,y,w,h)

  };
  MonacoClass.prototype.checkWatchMode = function () {
    if (Date.now() - this.dateNow < 300) {
      this.watchMode = true;
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
  MonacoClass.prototype.getNoteList = function (note) {
    let noteList = []
    if (note.noteTitle) {
      noteList.push(note.noteTitle)
    }
    if (note.excerptText && !note.excerptPic) {
      noteList.push(note.excerptText)
    }
    return noteList.concat(note.comments.filter(comment=>comment.type==="TextNote").map(comment=>comment.text))
  };
  MonacoClass.prototype.getTextForSearch = function (note) {
    let order = monacoConfig.searchOrder
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
  return MonacoClass;
};

