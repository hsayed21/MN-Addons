
JSB.newAddon = function (mainPath) {
  JSB.require('utils');
  if (!editorUtils.checkMNUtilsFolder(mainPath)) {return undefined}
  JSB.require('webviewController');
  JSB.require('settingController');
  JSB.require('network');
  
  /** @return {MNEditorClass} */
  const getMNEditorClass = ()=>self

  var MNEditorClass = JSB.defineClass(
    'MNEditor : JSExtension',
    { /* Instance members */
      sceneWillConnect: async function () { //Window initialize
        if (!(await editorUtils.checkMNUtil(true))) return
        let self = getMNEditorClass()
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
        MNUtil.addObserver(self, 'onPopupMenuOnNote:', 'PopupMenuOnNote');
        MNUtil.addObserver(self, 'onPopupMenuOnSelection:', 'PopupMenuOnSelection');
        MNUtil.addObserver(self, 'receivedOpenInEditor:', 'openInEditor');
        MNUtil.addObserver(self, 'receivedEditorInsert:', 'editorInsert');
        MNUtil.addObserver(self, 'onTextDidBeginEditing:', 'UITextViewTextDidBeginEditingNotification')
      },

      sceneDidDisconnect: function () { // Window disconnect
        MNUtil.removeObservers(self, [
          'PopupMenuOnSelection','PopupMenuOnNote','openInEditor','editorInsert','UITextViewTextDidBeginEditingNotification'
        ])
      },

      sceneWillResignActive: function () { // Window resign active
      },

      sceneDidBecomeActive: function () { // Window become active
      },

      notebookWillOpen: async function (notebookid) {
        if (!(await editorUtils.checkMNUtil(false,0.1))) return
        try {
        let self = getMNEditorClass()
        self.init(mainPath)
        self.editorNoteId = undefined
        self.targetURL = undefined
        // if (self.appInstance.studyController(self.window).studyMode < 3) {
        self.appInstance = Application.sharedInstance();
        // self.addonController = editorController.new();

        self.ensureView()

        self.addonController.notebookid = notebookid
        MNUtil.refreshAddonCommands()


        self.addonController.headingButton.hidden = false
        self.addonController.goBackButton.hidden = false
        self.addonController.goForwardButton.hidden = false
        self.addonController.refreshButton.hidden = false
        self.addonController.saveButton.hidden = false
        var viewFrame = self.addonController.view.bounds;
        self.addonController.webview.frame = MNUtil.genFrame(viewFrame.x + 1, viewFrame.y + 10, viewFrame.width - 2, viewFrame.height - 40)
        // MNUtil.delay(0.1).then(()=>{
        //   MNUtil.studyView.becomeFirstResponder()
        // })
        // self.addonController.webview.loadFileURLAllowingReadAccessToURL(
        //   NSURL.fileURLWithPath(editorUtils.bufferFolder + 'veditor.html'),
        //   NSURL.fileURLWithPath(editorUtils.bufferFolder)
        // );
        } catch (error) {
          MNUtil.showHUD("Error in notebookWillOpen: "+error)

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
          let studyFrame = MNUtil.studyView.bounds
          if (self.addonController.view.frame.x < studyFrame.width*0.5) {
            self.addonController.lastFrame.x = 0
          }else{
            self.addonController.lastFrame.x = studyFrame.width-self.addonController.lastFrame.width
          }
          self.addonController.setFrame(self.addonController.lastFrame)
          self.addonController.show(preFrame)
        }
        self.addonController.view.removeFromSuperview()
        self.newWindowController.view.removeFromSuperview()

        // self.appInstance.studyController(self.window).view.remov(self.addonController.view);
        
        self.watchMode = false;
        self.textSelected = '';
      },

      documentDidOpen: function (docmd5) {
      },

      documentWillClose: function (docmd5) {
      },
onClosePopupMenuOnNote: function (params) {
      if (self.window !== MNUtil.currentWindow) {
        return
      }
  // MNUtil.showHUD("message")
},
      controllerWillLayoutSubviews: function (controller) {
        if (typeof MNUtil === 'undefined') {
          return
        }
        if (controller !== MNUtil.studyController) {
          return;
        };
        if (!self.addonController.view.hidden) {
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
        // if (!self.newWindowController || self.newWindowController.view.hidden) {return}
        // let studyFrame = MNUtil.studyView.bounds
        // if (self.newWindowController.miniMode) {
        //   let oldFrame = self.newWindowController.view.frame
        //   if (oldFrame.x < studyFrame.width*0.5) {
        //     self.newWindowController.view.frame = { x: 0, y: oldFrame.y, width: 40, height: oldFrame.height }
        //   } else {
        //     self.newWindowController.view.frame = { x: studyFrame.width - 40, y: oldFrame.y, width: 40, height: oldFrame.height }
        //   }
        // } else if (self.newWindowController.custom) {
        //   self.addonController.setSplitScreenFrame(self.addonController.customMode)
        //   self.newWindowController.webview.frame = self.newWindowController.view.bounds
        // }else{
        //   let currentFrame = self.newWindowController.currentFrame
        //   if (currentFrame.x+currentFrame.width*0.5 >= studyFrame.width) {
        //     currentFrame.x = studyFrame.width-currentFrame.width*0.5              
        //   }
        //   if (currentFrame.y >= studyFrame.height) {
        //     currentFrame.y = studyFrame.height-20              
        //   }
        //   self.newWindowController.setFrame(currentFrame)
        // }
      },

      queryAddonCommandStatus: function () {
      if (!editorUtils.checkLogo()) {
        return null
      }
        self.ensureView(false)
        if (self.linkDetected) {
          return {
            image: 'link.png',
            object: self,
            selector: 'toggleAddon:',
            checked: true
          };
        }else{
          return {
            image: 'logo.png',
            object: self,
            selector: 'toggleAddon:',
            checked: self.watchMode
          };
        }
      },
      onPopupMenuOnNote: function (sender) { // Clicking note
        if (typeof MNUtil === 'undefined') {
          return
        }
        if (self.window !== MNUtil.currentWindow) {
          return
        }
        if (!self.addonController.view.hidden) {
          self.addonController.blur(0.1);
        }
        // if (Date.now() - self.dateGetText < 100) {
        //   return
        // }
        // try {
        //   NSNotificationCenter.defaultCenter().addObserverSelectorName(self, 'onPasteboardChange:', 'UIPasteboardChangdNotification');
          
        // } catch (error) {
        // Application.sharedInstance().showHUD(error,self.window,2)
          
        // }
        // const frame = self.addonController.view.frame
        // const frameText = `{x:${frame.x},y:${frame.y},width:${frame.width},height:${frame.height}}`
        try {
          // MNUtil.copyJSON(sender.userInfo)

        // MNUtil.studyView.subviews.at(-2).subviews[0].hidden = true
        // MNUtil.studyView.subviews.at(-3).subviews[0].hidden = true
        // MNUtil.studyView.subviews.at(-4).subviews[0].hidden = true
        // MNUtil.studyView.subviews.at(-5).subviews[0].hidden = true
        // let subviews = MNUtil.studyView.subviews.map(subview=>subview.subviews.length)
        // MNUtil.copyJSON(subviews)
        let currentNoteId = sender.userInfo.note.noteId
        let note = sender.userInfo.note
        // UIPasteboard.generalPasteboard().string = note.notesText
        let text = self.getTextForSearch(note)
        // Application.sharedInstance().showHUD(text,self.window,2)

        self.textSelected = encodeURIComponent(text.replaceAll('/', '\\/'))
        // self.textSelected = encodeURIComponent(note.excerptText ?? note.noteTitle.replaceAll('/', '\\/'))

        self.addonController.selectedText = self.textSelected
        self.addonController.currentNoteId = currentNoteId
        self.dateGetText = Date.now();
        self.textProcessed = false
        // Application.sharedInstance().showHUD(sender.userInfo.note,self.window,2)
        if (!self.addonController.view.window) return;

        if (self.viewTimer) self.viewTimer.invalidate();
        if (!self.watchMode) {
          return
        }
          self.addonController.setContent(MNNote.new(currentNoteId))
          if (editorConfig.dynamic) {
            MNUtil.animate(()=>{
              self.layoutAddonController(sender.userInfo.winRect, sender.userInfo.arrow);
            },0.5)
          }else{
            if (self.addonController.view.hidden) {
              self.addonController.show()
            }
          }
          self.addonController.view.hidden = false;
        } catch (error) {
          editorUtils.addErrorLog(error, "onPopupMenuOnNote")
        }
        // self.addonController.view.frame = {x:0,y:0,width:100,height:100}
      },
      onPopupMenuOnSelection: function (params) {
        if (typeof MNUtil === 'undefined') {
          return
        }
        if (self.window !== MNUtil.currentWindow) {
          return
        }
        if (!self.addonController.view.hidden) {
          self.addonController.blur(0.1);
        }
      },
      // onCloseView: function (params) {
      //   if (typeof MNUtil === 'undefined') {
      //     return
      //   }
      //   // Application.sharedInstance().showHUD("trst",self.window,2)
      //   if (self.window !== MNUtil.currentWindow) return; // Don't process message from other window
      //   self.watchMode = false;
      //   MNUtil.refreshAddonCommands()
      // },
      onNewWindow: function (sender) {
        if (typeof MNUtil === 'undefined') {
          return
        }
        if (self.window !== MNUtil.currentWindow) {
          // MNUtil.showHUD("reject")
          return
        }
        if (!self.newWindowController) {
          self.newWindowController = editorController.new();
          self.newWindowController.addonBar = self.addonController.addonBar
          self.newWindowController.view.hidden = true
          MNUtil.studyView.addSubview(self.newWindowController.view);
          self.newWindowController.setFrame(50,100,417,450)
        }
        if (self.newWindowController.view.hidden) {
          self.newWindowController.show(self.newWindowController.addonBar.frame)
        }
        try {
        if (sender.userInfo.desktop) {
          self.newWindowController.webview.customUserAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Safari/605.1.15'
        }else{
          self.newWindowController.webview.customUserAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148'
        }
        self.newWindowController.headingButton.hidden = false
        self.newWindowController.goBackButton.hidden = false
        self.newWindowController.goForwardButton.hidden = false
        self.newWindowController.refreshButton.hidden = false
        self.newWindowController.saveButton.hidden = false
        var viewFrame = self.newWindowController.view.bounds;
        self.newWindowController.webview.frame = { x: viewFrame.x + 1, y: viewFrame.y + 10, width: viewFrame.width - 2, height: viewFrame.height - 40 }
        self.newWindowController.isMainWindow = false
        self.newWindowController.webview.hidden = false;
        // Application.sharedInstance().showHUD(userInfo.url, self.window, 5);
        MNConnection.loadRequest(self.newWindowController.webview, sender.userInfo.url)
        // self.newWindowController.webview.loadRequest(MNUtil.requestWithURL(sender.userInfo.url));
        } catch (error) {
          editorUtils.addErrorLog(error, "onNewWindow")
        }
      },
      onPasteboardChange: function () {
        if (typeof MNUtil === 'undefined') {
          return
        }
        MNUtil.showHUD("check:")

      },
      receivedSearchInBrowser: function (sender) {
        if (typeof MNUtil === 'undefined') {
          return
        }
        // Application.sharedInstance().showHUD("check:",self.appInstance.focusWindow,2)
        if (self.window!==self.appInstance.focusWindow) {
          return
        }
        if (sender.userInfo.noteid) {
          let note = MNUtil.getNoteById(sender.userInfo.noteid)
          let text = self.getTextForSearch(note)
          self.addonController.selectedText = text
          self.addonController.search(self.textSelected)
        }else{
          self.textSelected = encodeURIComponent(sender.userInfo.text.replaceAll('/', '\\/'));
          self.addonController.selectedText = self.textSelected
          self.addonController.search(self.textSelected)
        }
        if (self.addonController.view.hidden) {
          self.addonController.show()
          MNUtil.studyView.bringSubviewToFront(self.addonController.view)
        }
      },
      receivedOpenInEditor: async function (sender) {
        if (typeof MNUtil === 'undefined') {
          return
        }
        if (self.window!==MNUtil.currentWindow) {
          return
        }
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
          }else if (self.addonBar) {
            self.addonController.show(self.addonBar.frame)
          }else{
            self.addonController.show()
          }
        }
        // return
        await MNUtil.delay(0.01)
        if (sender.userInfo.content) {
          self.addonController.runJavaScript(`setValue(\`${encodeURIComponent(sender.userInfo.content.trim())}\`)`)
          if (sender.userInfo.fileURL) {
            self.addonController.targetURL = sender.userInfo.fileURL
            self.addonController.refreshBackgroundColor()
          }else{
            self.addonController.targetURL = undefined
            self.addonController.refreshBackgroundColor()
          }
          self.addonController.editorNoteId = undefined
        }
        // MNUtil.copyJSON(sender.userInfo)
        if (sender.userInfo.noteId) {
          let note = MNNote.new(sender.userInfo.noteId)
          if (note) {
            self.addonController.setContent(note)
            // self.addonController.view.hidden = false;
            self.addonController.miniMode = false
            // self.addonController.searchButton.hidden = false
            self.textProcessed = true
          }
        }


    } catch (error) { 
      editorUtils.addErrorLog(error, "receivedOpenInEditor")
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
              let url = editorUtils.getLocalBufferFromBase64(content.content)
              return `![image](${url})`
            }
            if (content.type === "text") {
              // MNUtil.copy(content.content)
              return content.content
            }
          }).join("\n")+"\n"
          // let replacedContent = await self.addonController.replaceBase64ImagesWithR2(contents)
          // MNUtil.copy(contents)
          self.addonController.runJavaScript(`insertValue(\`${encodeURIComponent(contents)}\`,true)`)

        }
                } catch (error) {
         MNUtil.showHUD(error) 
        }
      },
      /**
       * 
       * @param {{object:UITextView}} param 
       */
      onTextDidBeginEditing:function (param) {
        try {
          if (self.window !== MNUtil.currentWindow) {
            return
          }
          if (MNUtil.studyMode === 3) {
            return
          }
          let textView = param.object
          editorUtils.textView = textView
          if (!editorConfig.getConfig("showOnNoteEdit")) {
            return
          }
          let mindmapView = editorUtils.getMindmapview(textView)
          if (editorUtils.checkExtendView(textView)) {
            if (textView.text && textView.text.trim()) {
             //do nothing 
            }else{
              textView.text = "placeholder"
              textView.endEditing(true)
            }
            let focusNote = MNNote.getFocusNote()
            if (focusNote) {
              MNUtil.postNotification("openInEditor",{noteId:focusNote.noteId})
            }
            // MNUtil.showHUD("message")
            return
          }
          if (mindmapView) {
            let noteView = mindmapView.selViewLst[0].view
            // let foucsNote = MNNote.getFocusNote()
            let foucsNote = MNNote.new(mindmapView.selViewLst[0].note.note)
            let beginFrame = noteView.convertRectToView(noteView.bounds, MNUtil.studyView)
            if (!foucsNote.noteTitle && !foucsNote.excerptText && !foucsNote.comments.length) {
              // MNUtil.copyJSON(param.object)
              param.object.text = "placeholder"
              // foucsNote.noteTitle = "Title"
              // foucsNote.excerptText = "Excerpt"
            }
            // MNUtil.beginTime = Date.now()
            // return
            if (foucsNote) {
              let noteId = foucsNote.noteId
              let studyFrame = MNUtil.studyView.bounds
              if (beginFrame.x+450 > studyFrame.width) {
                let endFrame = Frame.gen(studyFrame.width-450, beginFrame.y-10, 450, 500)
                if (beginFrame.y+490 > studyFrame.height) {
                  endFrame.y = studyFrame.height-500
                }
                MNUtil.postNotification("openInEditor",{noteId:noteId,beginFrame:beginFrame,endFrame:endFrame})
              }else{
                let endFrame = Frame.gen(beginFrame.x, beginFrame.y-10, 450, 500)
                if (beginFrame.y+490 > studyFrame.height) {
                  endFrame.y = studyFrame.height-500
                }
                MNUtil.postNotification("openInEditor",{noteId:noteId,beginFrame:beginFrame,endFrame:endFrame})
              }
            }
          }
          // MNUtil.showHUD(param.object.text)
          // MNUtil.copyJSON(params.userInfo)
        
        } catch (error) {
          editorUtils.addErrorLog(error, "onTextDidBeginEditing")
        }
      },
      toggleAddon: async function (sender) {
        if (typeof MNUtil === 'undefined') {
          return
        }
        // MNUtil.copy(MNUtil.dbFolder)
        try {
        self.init(mainPath)
        self.ensureView()
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
            let width = MNUtil.app.osType !== 1 ? 450 : 365
            if (buttonFrame.x === 0) {
              self.addonController.setFrame(40,buttonFrame.y,width,500)
            }else{
              self.addonController.setFrame(buttonFrame.x-width,buttonFrame.y,width,500)
            }
            self.isFirst = false;
          }
          MNUtil.studyView.bringSubviewToFront(self.addonBar)
          // MNUtil.copyJSON(self.addonController.view.frame)
          self.addonController.show(self.addonBar.frame)
          // self.addonController.view.hidden = false
          // self.addonController.webview.hidden = false
        } else {
          if (self.textProcessed || self.watchMode) {
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
            self.watchMode = false;
            MNUtil.refreshAddonCommands()
            return;
          }
        }
        // MNUtil.delay(0.2).then(()=>{
        //   MNUtil.studyView.becomeFirstResponder()
        // })
        if (!self.addonController.view.window) return;
        if (self.viewTimer) self.viewTimer.invalidate();
        // Application.sharedInstance().showHUD("process:1",self.window,2)
        let focusNote = MNNote.getFocusNote()
        if (focusNote) {
          // self.addonController.webview.loadFileURLAllowingReadAccessToURL(
          //   NSURL.fileURLWithPath(editorUtils.bufferFolder + 'veditor.html'),
          //   NSURL.fileURLWithPath(editorUtils.bufferFolder)
          // );
          self.addonController.setContent(focusNote)
          self.addonController.miniMode = false
        }else{
          self.addonController.clearContent()
        
        }
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

  MNEditorClass.prototype.layoutAddonController = function (rectStr, arrowNum) {

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
    this.addonController.setFrame(x,y,w,h)

  };
  MNEditorClass.prototype.customLayoutAddonController = function (rectStr, arrowNum, custom = false) {

    this.rect = rectStr || this.rect;
    this.arrow = arrowNum || this.arrow;
    var x, y
      w = (this.appInstance.osType !== 1) ? 419 : 365, // this.addonController.view.frame.width
      h = 450, // this.addonController.view.frame.height
      fontSize = 15,
      margin = 10,
      padding = 20,
      frame = this.appInstance.studyController(this.window).view.bounds,
      W = frame.width,
      H = frame.height,
      rectArr = this.rect.replace(/{/g, '').replace(/}/g, '').replace(/\s/g, '').split(','),
      X = Number(rectArr[0]),
      Y = Number(rectArr[1]),
      studyMode = this.appInstance.studyController(this.window).studyMode,
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
    this.addonController.setFrame(x,y+50,w,h)
  };
  MNEditorClass.prototype.checkWatchMode = function () {
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
  MNEditorClass.prototype.ensureView = function (refresh = true) {
  try {
    if (!this.addonController) {
      this.addonController = editorController.new();
      MNUtil.studyView.addSubview(this.addonController.view)
      this.addonController.view.hidden = true;
      // this.addonController.webview.becomeFirstResponder()
      // this.addonController.webview.loadFileURLAllowingReadAccessToURL(
      //   NSURL.fileURLWithPath(editorUtils.bufferFolder + 'veditor.html'),
      //   NSURL.fileURLWithPath(editorUtils.bufferFolder)
      // );
      this.addonController.loadVditor(undefined,true)
      // this.addonController.webview.becomeFirstResponder()
      // this.addonController.webview.loadFileURLAllowingReadAccessToURL(
      //   NSURL.fileURLWithPath(editorUtils.bufferFolder + '/milkdown.html'),
      //   NSURL.fileURLWithPath(editorUtils.bufferFolder+'/')
      // );
      // MNUtil.delay(0.5).then(()=>{
      //   this.addonController.runJavaScript('initMilkdown()')
      // })
    }
    if (!MNUtil.isDescendantOfStudyView(this.addonController.view)) {
      MNUtil.studyView.addSubview(this.addonController.view)
      this.addonController.view.hidden = true
      if (refresh) {
        MNUtil.refreshAddonCommands()
      }
    }
      } catch (error) {
      editorUtils.addErrorLog(error, "ensureView")
  }
  }
  MNEditorClass.prototype.getNoteList = function (note) {
    let noteList = []
    if (note.noteTitle) {
      noteList.push(note.noteTitle)
    }
    if (note.excerptText && !note.excerptPic) {
      noteList.push(note.excerptText)
    }
    return noteList.concat(note.comments.filter(comment=>comment.type==="TextNote").map(comment=>comment.text))
  };
  MNEditorClass.prototype.init = function(mainPath){
  try {
    if (!this.initialized) {
      editorUtils.init(mainPath)
      editorConfig.init()
      this.initialized = true
    }

  } catch (error) {
    editorUtils.addErrorLog(error, "init")
  }
  }
  MNEditorClass.prototype.getTextForSearch = function (note) {
    let order = editorConfig.searchOrder
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
  return MNEditorClass;
};

