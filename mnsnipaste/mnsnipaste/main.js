if (typeof MNOnAlert === 'undefined') {
  var MNOnAlert = false
}
JSB.newAddon = function (mainPath) {
  JSB.require("utils")
  if (!snipasteUtils.checkMNUtilsFolder(mainPath)) {return undefined}
  JSB.require('webviewController');
  var MNSnipasteClass = JSB.defineClass(
    'MNSnipaste : JSExtension',
    { /* Instance members */
      sceneWillConnect: async function () { //Window initialize
      try {

        if (!(await snipasteUtils.checkMNUtil(true))) return
        snipasteUtils.init(mainPath)
        self.appInstance = Application.sharedInstance();
        self.addonController = snipasteController.new();
        self.addonController.mainPath = mainPath;
        self.isNewWindow = false;
        self.watchMode = false;
        self.textSelected = ""
        self.textProcessed = false;
        self.dateGetText = Date.now();
        self.dateNow = Date.now();
        self.rect = '{{0, 0}, {10, 10}}';
        self.arrow = 1;
        self.isFirst = true
        // Application.sharedInstance().showHUD(self.addonController.appearOnNewExcerpt,self.window,2)
        MNUtil.addObserver(self, 'OnReceivedSnipasteNote:', 'snipasteNote');
        MNUtil.addObserver(self, 'OnReceivedSnipasteImage:', 'snipasteImage');
        MNUtil.addObserver(self, 'OnReceivedSnipastePDF:', 'snipastePDF');
        MNUtil.addObserver(self, 'OnReceivedSnipasteHtml:', 'snipasteHtml');
        MNUtil.addObserver(self, 'OnReceivedSnipasteMermaid:', 'snipasteMermaid');
        MNUtil.addObserver(self, 'OnReceivedAudioAction:', 'snipasteAudioAction');
        MNUtil.addObserver(self, 'onPopupMenuOnSelection:', 'PopupMenuOnSelection')
        MNUtil.addObserver(self, 'onPopupMenuOnNote:', 'PopupMenuOnNote');
        
      } catch (error) {
        snipasteUtils.addErrorLog(error, "sceneWillConnect")
      }
        // NSNotificationCenter.defaultCenter().addObserverSelectorName(self, 'trst:', 'onReciveTrst');
        // NSNotificationCenter.defaultCenter().addObserverSelectorName(self, 'onClosePopupMenuOnSelection:', 'ClosePopupMenuOnSelection');
      },

      sceneDidDisconnect: function () { // Window disconnect
        MNUtil.removeObserver(self, "snipasteNote")
        MNUtil.removeObserver(self, "snipasteImage")
        MNUtil.removeObserver(self, "snipastePDF")
        MNUtil.removeObserver(self, "snipasteHtml")
        MNUtil.removeObserver(self, "snipasteMermaid")
        MNUtil.removeObserver(self, "snipasteAudioAction")
        MNUtil.removeObserver(self, "PopupMenuOnSelection")
        MNUtil.removeObserver(self, "PopupMenuOnNote")
      },

      sceneWillResignActive: function () { // Window resign active
      },

      sceneDidBecomeActive: function () { // Window become active
      },

      notebookWillOpen: async function (notebookid) {
        try {
        if (!(await snipasteUtils.checkMNUtil(false,0.1))) return
        if (!self.addonController) {
          self.addonController = snipasteController.new();
          self.addonController.mainPath = mainPath;
        }
        if (!self.addonController.onSnipaste) {
          MNUtil.refreshAddonCommands()
          MNUtil.currentWindow.addSubview(self.addonController.view)
          self.addonController.view.hidden = true;
          self.addonController.notebookid = notebookid
          self.addonController.view.frame = { x: 50, y: 10, width: 500, height: 500 }
          self.addonController.webview.frame = { x: 50, y: 10, width: 500, height: 500 }
          self.addonController.currentFrame = { x: 50, y: 10, width: 500, height: 500 }
        }
        // if (dynamic !== undefined) {
        //   self.addonController.dynamic = dynamic
        // }
        if (self.addonController.onSnipaste) {
          self.addonController.view.hidden = false
        }
        } catch (error) {
          snipasteUtils.addErrorLog(error, "notebookWillOpen")
        }
      },

      notebookWillClose: function (notebookid) {
        // Application.sharedInstance().showHUD("close",self.window,2)
        // self.addonController.homePage()
        // self.watchMode = false;
        // self.textSelected = '';
        // NSNotificationCenter.defaultCenter().removeObserverName(self, 'PopupMenuOnSelection');
        // NSNotificationCenter.defaultCenter().removeObserverName(self, 'ClosePopupMenuOnSelection');
        // NSNotificationCenter.defaultCenter().removeObserverName(self, 'ProcessNewExcerpt');
      },

      documentDidOpen: function (docmd5) {
      },

      documentWillClose: function (docmd5) {
      },

      controllerWillLayoutSubviews: function (controller) {
        if (typeof MNUtil === 'undefined') return
        if (controller !== MNUtil.studyController) {
          return;
        };
        if (!self.addonController.view.hidden) {
          let studyFrame = MNUtil.currentWindow.bounds
          if (self.addonController.miniMode) {
            let oldFrame = self.addonController.view.frame
            if (oldFrame.x < studyFrame.width*0.5) {
            // self.addonController.view.frame = self.addonController.currentFrame
              self.addonController.view.frame = { x: 0, y: oldFrame.y, width: 40, height: 40 }
            } else {
              self.addonController.view.frame = { x: studyFrame.width - 40, y: oldFrame.y, width: 40, height: 40 }
            }
          } else if (self.addonController.custom) {
            let yOffset = snipasteUtils.offset.top
            let height = studyFrame.height-10-yOffset;
            let y = 10+yOffset
            let splitLine = MNUtil.splitLine
            switch (self.addonController.customMode) {
              case "left":
                self.addonController.view.frame = { x: 40, y: y, width: splitLine - 45, height: height }
                break;
              case "left13":
                self.addonController.view.frame = { x: 40, y: y, width: studyFrame.width / 3. + 40, height: height}
                break;
              case "right":
                self.addonController.view.frame = { x: splitLine + 5, y: y, width: studyFrame.width - splitLine - 45, height: height }
                break;
              case "right13":
                self.addonController.view.frame = { x: studyFrame.width * 2 / 3. - 40, y: y, width: studyFrame.width / 3., height: height }
                break;
              case "full":
                self.addonController.view.frame = { x: 40, y: y, width: studyFrame.width - 80, height: height }
                break;
              default:
                break;
            }
            self.addonController.webview.frame = self.addonController.view.bounds
          }else{
            let currentFrame = self.addonController.currentFrame
            currentFrame.width = MNUtil.constrain(currentFrame.width, 300, studyFrame.width)
            currentFrame.height = MNUtil.constrain(currentFrame.height, 200, studyFrame.height)
            if (currentFrame.x+currentFrame.width*0.5 >= studyFrame.width) {
              currentFrame.x = studyFrame.width-currentFrame.width*0.5              
            }
            if (currentFrame.y >= studyFrame.height) {
              currentFrame.y = studyFrame.height-20              
            }
            // MNUtil.copy(currentFrame)
            // MNUtil.log(currentFrame.width)
            self.addonController.view.frame = currentFrame
            self.addonController.currentFrame = currentFrame
            // MNUtil.copy(currentFrame)
          }
        }
      },

      queryAddonCommandStatus: function () {
        if (!snipasteUtils.checkLogo()) {
          return null
        }
          return {
            image: 'logo.png',
            object: self,
            selector: 'toggleAddon:',
            checked: false
          };
      },
      OnReceivedSnipastePDF: function (sender) {
        if (typeof MNUtil === 'undefined') return
        if (self.window!==MNUtil.currentWindow) {
          return
        }
        let userInfo = sender.userInfo
        self.addonController.pageIndex = 0
        self.addonController.snipastePDFDev(userInfo.docMd5,userInfo.currPageNo)
      },
      OnReceivedSnipasteHtml: function (sender) {
        if (typeof MNUtil === 'undefined') return
        if (self.window!==MNUtil.currentWindow) {
          return
        }
        let userInfo = sender.userInfo
        let html = sender.userInfo.html
        // snipasteUtils.log("OnReceivedSnipasteHtml",html)
        self.addonController.snipasteHtml(html,userInfo)
      },
      OnReceivedSnipasteMermaid: function (sender) {
        if (typeof MNUtil === 'undefined') return
        if (self.window!==MNUtil.currentWindow) {
          return
        }
        let content = sender.userInfo.content
        let force = sender.userInfo.force
        self.addonController.snipasteMermaid(content,force)
      },
      OnReceivedAudioAction: function (sender) {
        if (typeof MNUtil === 'undefined') return
        if (self.window!==MNUtil.currentWindow) {
          return
        }
        let action = sender.userInfo.action
        self.addonController.audioControl(action)
        // MNUtil.showHUD("OnReceivedAudioAction")
      },
      OnReceivedSnipasteNote: function (sender) {
        if (typeof MNUtil === 'undefined') return
        if (self.window!==MNUtil.currentWindow) {
          return
        }
        let userInfo = sender.userInfo
        // showHUD("snipaste")
        // Application.sharedInstance().showHUD(sender.userInfo.noteid,self.window,5)
        let focusNote = MNNote.new(sender.userInfo.noteid)
        let addonController = self.addonController
        if (addonController.isFirst) {
          let frame = addonController.view.frame
          frame.width = 500
          if (MNUtil.isIOS()) {
            frame.x = 0
          }
          addonController.view.frame = frame
          addonController.currentFrame = frame
          addonController.isFirst = false
        }
        if ("audioAutoPlay" in userInfo) {
          addonController.snipasteNote(focusNote,true)
        }else{
          addonController.snipasteNote(focusNote)
        }
      },
      OnReceivedSnipasteImage:function (sender) {
        let imageData = sender.userInfo.imageData
        if (imageData) {
          let image = UIImage.imageWithData(imageData)
          let wholeFrame = MNUtil.studyView.bounds
          // let rotateImage = UIImage.imageWithCGImageScaleOrientation(image.CGImage,1.5,UIImage.orientation)
          // rotateImage.imageOrientation = 1
          // let rotateImageData = rotateImage.pngData()
          let imageSize = image.size
          let widthScale = wholeFrame.width/imageSize.width*0.5
          let heightScale = wholeFrame.height/imageSize.height*0.5
          let scale = Math.min(widthScale,heightScale)
          if (scale > 1) {
            scale = 1
          }
          // let scale = (imageSize.width < 600 || imageSize.height < 200)?1.0:0.5
          // Application.sharedInstance().showHUD("width: "+imageSize.width+" hiehgt: "+imageSize.height, self.window, 2)
          let addonController = self.addonController
          let viewFrame = addonController.view.frame
          if (addonController.isFirst) {
            let width = MNUtil.constrain(imageSize.width*scale, 300, MNUtil.windowWidth)
            let height = MNUtil.constrain(imageSize.height*scale, 200, MNUtil.windowHeight)
            let targetFrame = {x:viewFrame.x,y:viewFrame.y,width:width,height:height}
            if (MNUtil.isIOS()) {
              targetFrame.x = 0
            }
            addonController.view.frame = targetFrame
            addonController.currentFrame = targetFrame
            addonController.isFirst = false
          }
          // style="transform:rotate(7deg)"
          addonController.htmlMode = false
          addonController.onSnipaste = true
          addonController.snipasteFromImage(imageData)
          if (addonController.view.hidden) {
            addonController.show()
          }
        }
      },
      onPopupMenuOnSelection: function (sender) { // Selecting text on pdf or epub
        if (typeof MNUtil === 'undefined') return
        if (!self.appInstance.checkNotifySenderInWindow(sender, self.window)) return; // Don't process message from other window
          //  Application.sharedInstance().showHUD(sender.userInfo.winRect, self.window, 2);
        if (!self.addonController.view.hidden) {
          self.addonController.blur(0.01)
        }
      },
      onProcessNewExcerpt:function (sender) {
        if (typeof MNUtil === 'undefined') return
        if (!self.appInstance.checkNotifySenderInWindow(sender, self.window)) return; // Don't process message from other window
      },
      onPopupMenuOnNote: function (sender) { // Clicking note
        if (typeof MNUtil === 'undefined') return
        if (!self.appInstance.checkNotifySenderInWindow(sender, self.window)) return; // Don't process message from other window
        if (!self.addonController.view.hidden) {
          self.addonController.blur(0.01)
        }
        // const frame = self.addonController.view.frame
        // const frameText = `{x:${frame.x},y:${frame.y},width:${frame.width},height:${frame.height}}`
        // Application.sharedInstance().showHUD(frameText,self.window,5
        // self.addonController.view.frame = {x:0,y:0,width:100,height:100}
      },
      toggleAddon:function (sender) {
        if (typeof MNUtil === 'undefined') return
        // self.addonController.snipasteMermaid("test")
        // return
        try {
        let addonController = self.addonController

        if (!self.addonBar) {
          self.addonBar = sender.superview.superview
          addonController.addonBar = self.addonBar
        }
        if (Date.now() - self.dateNow < 500) {
          addonController.snipasteFromClipboard()
          return;
        }else{
          self.dateNow = Date.now()
        }
        let latestSelection = snipasteUtils.getLatestSelection()
        
        if (latestSelection) {
          let type = latestSelection.type
          switch (type) {
            case "text":
            case "image":
              if (MNUtil.currentSelection.onSelection) {
                let selection = MNUtil.currentSelection
                //优先选择图片
                addonController.focusNoteId = undefined
                // MNUtil.showHUD(selection.docMd5)
                addonController.docMd5 = selection.docMd5
                addonController.pageIndex = selection.pageIndex
                let imageData = selection.image
                let wholeFrame = MNUtil.studyView.bounds
                // let rotateImage = UIImage.imageWithCGImageScaleOrientation(image.CGImage,1.5,UIImage.orientation)
                // rotateImage.imageOrientation = 1
                // let rotateImageData = rotateImage.pngData()
                let imageSize = snipasteUtils.getImageSize(imageData)
                let widthScale = wholeFrame.width/imageSize.width*0.5
                let heightScale = wholeFrame.height/imageSize.height*0.5
                let scale = Math.min(widthScale,heightScale)
                if (scale > 1) {
                  scale = 1
                }
                // let scale = (imageSize.width < 600 || imageSize.height < 200)?1.0:0.5
                // Application.sharedInstance().showHUD("width: "+imageSize.width+" hiehgt: "+imageSize.height, self.window, 2)
                let viewFrame = addonController.view.frame
                viewFrame.y = MNUtil.constrain(viewFrame.y, snipasteUtils.offset.top, MNUtil.windowHeight-snipasteUtils.offset.top)
                if (addonController.isFirst) {
                  let targetFrame = {x:viewFrame.x,y:viewFrame.y,width:imageSize.width*scale,height:imageSize.height*scale}
                  if (MNUtil.isIOS()) {
                    targetFrame.x = 0
                  }
                  addonController.view.frame = targetFrame
                  addonController.currentFrame = targetFrame
                }
                // MNUtil.log({message:"toggleAddon",pageIndex:selection.pageIndex})
                // style="transform:rotate(7deg)"
                addonController.htmlMode = false
                addonController.onSnipaste = true
                addonController.pageIndex = selection.pageIndex
                addonController.snipasteFromImage(imageData,{source:"selection",docMd5:selection.docMd5,pageIndex:selection.pageIndex})
                return;
              }
              break;
            case "note":
              let temNote = MNNote.getFocusNote()
              if (temNote && temNote.noteId === latestSelection.noteId) {
                let focusNote = MNNote.new(latestSelection.noteId)
                if (focusNote) {
                  addonController.docMd5 = undefined
                  addonController.pageIndex = undefined
                  if (snipasteUtils.isPureImageNote(focusNote)) {
                    let imageData = MNUtil.getMediaByHash(focusNote.excerptPic.paint)
                    addonController.focusNoteId = latestSelection.noteId
                  // MNUtil.showHUD("Snipaste from note image")
                    addonController.snipasteFromImage(imageData,{source:"note",noteId:latestSelection.noteId})
                    return;
                  }else{//摘录中无图片，直接贴卡片
                    if (addonController.isFirst) {
                      let frame = addonController.view.frame
                      frame.width = 500
                      if (MNUtil.isIOS()) {
                        frame.x = 0
                      }
                      addonController.view.frame = frame
                      addonController.currentFrame = frame
                      addonController.isFirst = false
                    }
                  // MNUtil.showHUD("Snipaste from note")
                    addonController.snipasteNote(focusNote)
                    return;
                  }
                }
              }
              break;
            default:
              break;
          }
        }

        let selection = MNUtil.currentSelection
        if (selection.onSelection && !selection.isText) {
          //优先选择图片
          addonController.focusNoteId = undefined
          // MNUtil.showHUD(selection.docMd5)
          addonController.docMd5 = selection.docMd5
          addonController.pageIndex = selection.pageIndex
          let imageData = selection.image
          let wholeFrame = MNUtil.studyView.bounds
          // let rotateImage = UIImage.imageWithCGImageScaleOrientation(image.CGImage,1.5,UIImage.orientation)
          // rotateImage.imageOrientation = 1
          // let rotateImageData = rotateImage.pngData()
          let imageSize = snipasteUtils.getImageSize(imageData)
          let widthScale = wholeFrame.width/imageSize.width*0.5
          let heightScale = wholeFrame.height/imageSize.height*0.5
          let scale = Math.min(widthScale,heightScale)
          if (scale > 1) {
            scale = 1
          }
          // let scale = (imageSize.width < 600 || imageSize.height < 200)?1.0:0.5
          // Application.sharedInstance().showHUD("width: "+imageSize.width+" hiehgt: "+imageSize.height, self.window, 2)
          let viewFrame = addonController.view.frame
          viewFrame.y = MNUtil.constrain(viewFrame.y, snipasteUtils.offset.top, MNUtil.windowHeight-snipasteUtils.offset.top)
          if (addonController.isFirst) {
            let targetFrame = {x:viewFrame.x,y:viewFrame.y,width:imageSize.width*scale,height:imageSize.height*scale}
            if (MNUtil.isIOS()) {
              targetFrame.x = 0
            }
            addonController.view.frame = targetFrame
            addonController.currentFrame = targetFrame
          }
          // MNUtil.log({message:"toggleAddon",pageIndex:selection.pageIndex})
          // style="transform:rotate(7deg)"
          addonController.htmlMode = false
          addonController.onSnipaste = true
          addonController.pageIndex = selection.pageIndex
          addonController.snipasteFromImage(imageData,{source:"selection",docMd5:selection.docMd5,pageIndex:selection.pageIndex})
          return
        }else{
          //无图片下选择卡片
          let focusNote = MNNote.getFocusNote()
            // MNUtil.log("docMapSplitMode"+MNUtil.docMapSplitMode)
            // MNUtil.log("studyMode"+MNUtil.studyMode) 
          // MNUtil.log("currentNotebookType"+currentNotebook.flags) 
          if (!focusNote) {
            let currentNotebookType = MNUtil.currentNotebook.flags
            if (currentNotebookType === 1) {
              focusNote = MNNote.new(MNUtil.currentDocController.focusNote)
            }
          }
          if (focusNote) {
            addonController.docMd5 = undefined
            addonController.pageIndex = undefined
            if (snipasteUtils.isPureImageNote(focusNote)) {
              imageData = MNUtil.getMediaByHash(focusNote.excerptPic.paint)
              addonController.focusNoteId = focusNote.noteId
            // MNUtil.showHUD("Snipaste from note image")
              addonController.snipasteFromImage(imageData,{source:"note",noteId:focusNote.noteId})
              return;
            }else{//摘录中无图片，直接贴卡片
              if (addonController.isFirst) {
                let frame = addonController.view.frame
                frame.width = 500
                if (MNUtil.isIOS()) {
                  frame.x = 0
                }
                addonController.view.frame = frame
                addonController.currentFrame = frame
                addonController.isFirst = false
              }
            // MNUtil.showHUD("Snipaste from note")
              addonController.snipasteNote(focusNote)
              return;
            }
          }else if (selection.onSelection) {//尝试贴文字
            // MNUtil.showHUD("123")
            // MNUtil.showHUD("No note found")
              addonController.focusNoteId = undefined
              // MNUtil.showHUD(selection.docMd5)
              addonController.docMd5 = selection.docMd5
              addonController.pageIndex = selection.pageIndex
              let imageData = selection.image
              let image = UIImage.imageWithData(imageData)
              let wholeFrame = MNUtil.studyView.bounds
              // let rotateImage = UIImage.imageWithCGImageScaleOrientation(image.CGImage,1.5,UIImage.orientation)
              // rotateImage.imageOrientation = 1
              // let rotateImageData = rotateImage.pngData()
              let imageSize = image.size
              let widthScale = wholeFrame.width/imageSize.width*0.5
              let heightScale = wholeFrame.height/imageSize.height*0.5
              let scale = Math.min(widthScale,heightScale)
              if (scale > 1) {
                scale = 1
              }
              // let scale = (imageSize.width < 600 || imageSize.height < 200)?1.0:0.5
              // Application.sharedInstance().showHUD("width: "+imageSize.width+" hiehgt: "+imageSize.height, self.window, 2)
              let viewFrame = addonController.view.frame
              if (addonController.isFirst) {
                let targetFrame = {x:viewFrame.x,y:viewFrame.y,width:imageSize.width*scale,height:imageSize.height*scale}
                if (MNUtil.isIOS()) {
                  targetFrame.x = 0
                }
                addonController.view.frame = targetFrame
                addonController.currentFrame = targetFrame
              }
              // style="transform:rotate(7deg)"
              addonController.htmlMode = false
              addonController.onSnipaste = true
              addonController.snipasteFromImage(imageData)
              if (addonController.view.hidden) {
                addonController.show()
              }
              return
            }
        }
        let menu = new Menu(sender,self)
        menu.width = 250
        menu.addMenuItem("📋  Clipboard Image", "snipasteFromClipboard:")
        let docFileName = MNUtil.currentDoc.fullPathFileName
        if (docFileName.endsWith(".pdf")) {
          menu.addMenuItem("📄  PDF (Current Page)", "snipasteFromPDF:","Current")
          menu.addMenuItem("📄  PDF (First Page)", "snipasteFromPDF:","First")
          menu.addMenuItem("📄  PDF (Last Page)", "snipasteFromPDF:","Last")
        }
        if (docFileName.endsWith(".mp3")) {
          menu.addMenuItem("🎵  Audio", "snipasteFromAudio:",docFileName)
        }
        if (self.addonBar.frame.x < 100) {
          menu.preferredPosition = 4
        }else{
          menu.preferredPosition = 0
        }
        menu.show()
        return
          
        } catch (error) {
          snipasteUtils.addErrorLog(error, "toggleAddon")
        }
      },
      snipasteFromAudio: function (fileName) {

        Menu.dismissCurrentMenu()
        self.addonController.snipasteFromAudio(fileName)
      },
      snipasteFromPDF: function (target) {
        Menu.dismissCurrentMenu()
        let docController = MNUtil.currentDocController
        if (target === "Current") {
          self.addonController.pageIndex = docController.currPageIndex
          // MNUtil.showHUD("PageIndex: "+self.addonController.pageIndex)
          self.addonController.snipastePDFDev(docController.docMd5,docController.currPageNo,docController)
        }else if (target === "First") {
          self.addonController.pageIndex = 0
          let pageNo = docController.pageNoFromIndex(0)
          self.addonController.snipastePDFDev(docController.docMd5,pageNo,docController)
        }else if (target === "Last") {
          let pageNo = docController.document.pageCount
          self.addonController.pageIndex = docController.indexFromPageNo(pageNo)
          self.addonController.snipastePDFDev(docController.docMd5,pageNo,docController)
        }
      },
      snipasteFromClipboard: function (sender) {
        Menu.dismissCurrentMenu()
        self.addonController.snipasteFromClipboard(sender)
      }
    },
    { /* Class members */
      addonDidConnect: function () {
      },

      addonWillDisconnect: function () {
      },

      applicationWillEnterForeground: function () {
      },

      applicationDidEnterBackground: function () {
      },

      applicationDidReceiveLocalNotification: function (notify) {
      }
    }
  );

  return MNSnipasteClass;
};