
if (typeof MNOnAlert === 'undefined') {
  var MNOnAlert = false
}
JSB.newAddon = function (mainPath) {
  JSB.require('segmentit')
  JSB.require('utils')

  if (!autoUtils.checkMNUtilsFolder(mainPath)) {return undefined}
  JSB.require('webviewController');
  var MNStyleClass = JSB.defineClass(
    'MNAutoStyle : JSExtension',
    { /* Instance members */
      sceneWillConnect: async function () { //Window initialize
        if (!(await autoUtils.checkMNUtil(true))) return
        self.appInstance = Application.sharedInstance();
        self.init(mainPath)
        // autoUtils.init(mainPath)
        self.isNewWindow = false;
        self.watchMode = false;
        self.textSelected = ""
        self.textProcessed = false;
        self.dateGetText = Date.now();
        self.dateNow = Date.now();
        self.rect = '{{0, 0}, {10, 10}}';
        self.arrow = 1;
        self.isFirst = true
        MNUtil.addObserver(self, 'onProcessNewExcerpt:', 'ProcessNewExcerpt')
        MNUtil.addObserver(self, 'onClosePopupMenuOnNote:', 'ClosePopupMenuOnNote')
        MNUtil.addObserver(self, 'onPopupMenuOnNote:', 'PopupMenuOnNote')
        MNUtil.addObserver(self, 'onOCRImageBegin:', 'OCRImageBegin')
        MNUtil.addObserver(self, 'onOCRImageEnd:', 'OCRImageEnd')
        // Application.sharedInstance().showHUD(autoUtils.styleController.appearOnNewExcerpt,self.window,2)

        // NSNotificationCenter.defaultCenter().addObserverSelectorName(self, 'trst:', 'onReciveTrst');
        // NSNotificationCenter.defaultCenter().addObserverSelectorName(self, 'onClosePopupMenuOnSelection:', 'ClosePopupMenuOnSelection');
      },

      sceneDidDisconnect: function () { // Window disconnect
        MNUtil.removeObserver(self, 'ProcessNewExcerpt')
        MNUtil.removeObserver(self, 'ClosePopupMenuOnNote')
        MNUtil.removeObserver(self, 'PopupMenuOnNote')
      },

      sceneWillResignActive: function () { // Window resign active
      },

      sceneDidBecomeActive: function () { // Window become active
      },

      notebookWillOpen: async function (notebookid) {
        if (!(await autoUtils.checkMNUtil(false,0.1))) return
      try {
        self.init()
        autoUtils.initStyleController()
        autoUtils.ensureView(autoUtils.styleController.view)



        if (MNUtil.studyMode < 3) {
          autoUtils.refreshAddonCommands()
          autoUtils.styleController.view.hidden = true;
          autoUtils.styleController.notebookid = notebookid
          self.notebookid = notebookid
          autoUtils.styleController.bothModeButton.hidden = false
          autoUtils.styleController.textModeButton.hidden = false
          autoUtils.styleController.view.frame = { x: 50, y: 100, width: 250, height: 290 }
          autoUtils.styleController.currentFrame = { x: 50, y: 100, width: 250, height: 290 }
        }else{
          if (autoUtils.styleController) {
            autoUtils.styleController.view.hidden = true
          }
        }
        MNUtil.delay(0.2).then(()=>{
          MNUtil.studyView.becomeFirstResponder()
        })
      } catch (error) {
        autoUtils.addErrorLog(error, "notebookWillOpen")
      }
      },

      notebookWillClose: function (notebookid) {
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
        if (MNUtil.studyController.studyMode === 3 && autoUtils.styleController) {
          autoUtils.styleController.view.hidden = true
        }
        if (!autoUtils.styleController.view.hidden && !autoUtils.styleController.onAnimate) {
          let studyFrame = MNUtil.studyView.bounds
          let currentFrame = autoUtils.styleController.currentFrame
          if (currentFrame.x+currentFrame.width*0.5 >= studyFrame.width) {
            currentFrame.x = studyFrame.width-currentFrame.width*0.5              
          }
          if (currentFrame.y >= studyFrame.height) {
            currentFrame.y = studyFrame.height-20              
          }
          currentFrame.width = 250
          currentFrame.height = 290
          autoUtils.styleController.view.frame = currentFrame
          autoUtils.styleController.currentFrame = currentFrame
        }
      },

      queryAddonCommandStatus: function () {
        if (!autoUtils.checkLogo()) {
          return null
        }
        if (MNUtil.studyMode < 3) {
          return {
            image: 'logo.png',
            object: self,
            selector: 'toggleAddon:',
            checked: false
          };
        } else {
          if (autoUtils.styleController) {
            autoUtils.styleController.view.hidden = true
          }
          return null;
        }
      },
      /**
       * 
       * @param {{userInfo:{noteid:String}}} sender 
       * @returns 
       */
      onProcessNewExcerpt:function (sender) {
        if (typeof MNUtil === 'undefined') return
        if (self.window !== MNUtil.currentWindow) return; // Don't process message from other window
        try {
        MNUtil.delay(1).then(()=>{
          autoUtils.previousNote = sender.userInfo.noteid
        })
        let note = MNNote.new(sender.userInfo.noteid)
        let fillIndex
        if (note.excerptPic) {
          fillIndex = autoUtils.getConfig("image")[note.colorIndex]
        }else{
          fillIndex = autoUtils.getConfig("text")[note.colorIndex]
        }
        if (fillIndex !== -1) {
          note.fillIndex = fillIndex
          // note.colorIndex = 10
          // Application.sharedInstance().showHUD("set fill index:"+note.fillIndex,self.window,2)
        }
        // MNUtil.refreshAfterDBChanged()
        MNUtil.app.refreshAfterDBChanged(MNUtil.currentNotebookId)

        // Application.sharedInstance().refreshAfterDBChanged(self.notebookid)
        if (autoUtils.getConfig("newExcerptTagDetection")) {
          let actionNames = ["snipaste","bigbang","copy","ocr","search","editor","merge","addReview"]

          let commonActions = autoUtils.findCommonElements(note.tags, actionNames)
          if (commonActions.length) {
            let firstAction = commonActions[0]
            note.removeCommentByIndex(0)
            autoUtils.styleController.autoActionByTag(note, firstAction)
            return
          }
        }
        // autoUtils.styleController.autoAction(note)
        autoUtils.styleController.autoActionDev(note,self.isOnBuiltInOCR)
        } catch (error) {
          autoUtils.addErrorLog(error, "onProcessNewExcerpt")
        }
      },
      onPopupMenuOnNote: async function (sender) {
        if (typeof MNUtil === 'undefined') return
        if (self.window !== MNUtil.currentWindow) return; // Don't process message from other window
        try {
        let currentDate = Date.now()
        await MNUtil.delay(0.01)
        // MNUtil.showHUD("onPopupMenuOnNote")
        let note = MNNote.new(sender.userInfo.note)
        let noteCreateDate = Date.parse(note.createDate)
        if (currentDate-noteCreateDate < 1500 && note.groupNoteId){
          let colorIndex = note.colorIndex
          let imageExcerpt = (note.excerptPic && !note.textFirst)
          let tem = imageExcerpt ? [1,3] :[1,2]
          let shouldMerge= tem.includes(autoUtils.getConfig("merge")[colorIndex])
          let shouldOCR= tem.includes(autoUtils.getConfig("ocr")[colorIndex])
          let config = {}
          let groupNote = MNNote.new(note.groupNoteId)
          if (shouldMerge && !imageExcerpt) {
            if (shouldOCR) {
              if (typeof ocrUtils === 'undefined') {
                MNUtil.showHUD("MN AutoStyle: Please install 'MN OCR' first!")
              }else{
                let imageData = MNUtil.getDocImage(true,true)
                // let imageData = MNUtil.currentDocController.imageFromFocusNote()
                if (!imageData && note.excerptPic && note.excerptPic.paint) {
                  imageData = MNUtil.getMediaByHash(note.excerptPic.paint)
                }
                if (!imageData) {
                  MNUtil.showHUD("No image to OCR")
                }else{
                  let res = await ocrNetwork.OCR(imageData)
                  config.excerptText = res
                  config.excerptTextMarkdown = true
                }
              }
            }
            let excerptText = "excerptText" in config ? config.excerptText : note.excerptText
            if (excerptText) {
              if (!groupNote.excerptPic || (groupNote.textFirst)) {
                config.groupExcerptText = autoUtils.mergeStringsWithSmartSpacing(groupNote.excerptText,excerptText)
                config.excerptText = ""
              }
            }
            autoUtils.editNoteOneOff(note, config)
            // MNUtil.undoGrouping(()=>{
            //   if ("excerptText" in config) {
            //     note.excerptText = config.excerptText
            //   }
            //   if ("title" in config) {
            //     note.title = config.title
            //   }
            //   if ("excerptTextMarkdown" in config) {
            //     note.excerptTextMarkdown = config.excerptTextMarkdown
            //   }
            //   if ("groupExcerptText" in config || "groupTitle" in config) {
            //     if ("groupExcerptText" in config) {
            //       groupNote.excerptText = config.groupExcerptText
            //     }
            //     if ("groupTitle" in config) {
            //       groupNote.title = config.groupTitle
            //     }
            //   }

            // })
          }

        }

        // MNUtil.copy({currentDate:currentDate,noteCreateDate:Date.parse(MNNote.new(note).createDate)})
        self.preNoteInfo = {noteId: note.noteId,color:note.colorIndex}
        // MNUtil.copyJSON(self.preNoteInfo)
          
        } catch (error) {
          autoUtils.addErrorLog(error, "onPopupMenuOnNote")
        }
      },
      onClosePopupMenuOnNote:function (sender) {
        if (typeof MNUtil === 'undefined') return
        if (self.window !== MNUtil.currentWindow) return; // Don't process message from other window
        try {

        if (!MNUtil.db.getNoteById(sender.userInfo.noteid)) {
          return
        }
        let note = MNNote.new(sender.userInfo.noteid)
          // MNUtil.showHUD("message"+(sender.userInfo.noteid === self.preNoteInfo.noteId))
          // MNUtil.copy("before:"+sender.userInfo.noteid+"; after:"+self.preNoteInfo.noteId)
        if (sender.userInfo.noteid !== self.preNoteInfo.noteId || note.colorIndex === self.preNoteInfo.color) {
          // MNUtil.showHUD("message")
          return
        }
        // let noteIdInMindmap = note.note.realGroupNoteIdForTopicId(MNUtil.currentNotebookId)
        // // let note = MNUtil.getNoteById(sender.userInfo.noteid)
        // if (sender.userInfo.noteid === noteIdInMindmap) {
        //   MNUtil.showHUD("note"+sender.userInfo.noteid)
        //   return
        // }
        let fillIndex
        if (note.excerptPic) {
          fillIndex = autoUtils.getConfig("image")[note.colorIndex]
        }else{
          fillIndex = autoUtils.getConfig("text")[note.colorIndex]
        }
        if (fillIndex !== -1) {
          if (note.note.groupNoteId) {
            let originNote = MNNote.new(note.note.groupNoteId)
            originNote.notes.forEach(n=>{
              n.fillIndex = fillIndex
            })
          }else{
            note.notes.forEach(n=>{
              n.fillIndex = fillIndex
            })
          }
        }
        MNUtil.app.refreshAfterDBChanged(MNUtil.currentNotebookId)
        } catch (error) {
          autoUtils.addErrorLog(error, "onClosePopupMenuOnNote")
        }
      },
      toggleAddon:function (sender) {
      try {
        self.init(mainPath)
        autoUtils.initStyleController()
        autoUtils.ensureView(autoUtils.styleController.view)
        if (!self.addonBar) {
          self.addonBar = sender.superview.superview
          autoUtils.styleController.addonBar = self.addonBar
        }
        if (self.isFirst) {
          // Application.sharedInstance().showHUD("first",self.window,2)
          let buttonFrame = self.addonBar.frame
          if (buttonFrame.x < 100) {
            autoUtils.styleController.view.frame = {x:40,y:buttonFrame.y,width:250,height:290}
          }else{
            autoUtils.styleController.view.frame = {x:buttonFrame.x-250,y:buttonFrame.y,width:250,height:290}
          }
          autoUtils.styleController.currentFrame = autoUtils.styleController.view.frame
          self.isFirst = false;
        }
        if (autoUtils.styleController.view.hidden) {
          autoUtils.styleController.show(self.addonBar.frame)
        }else{
          autoUtils.styleController.hide(self.addonBar.frame)
        }
      } catch (error) {
          autoUtils.addErrorLog(error, "toggleAddon")
      }
      // autoUtils.styleController.view.hidden = !autoUtils.styleController.view.hidden
      },
      // onOCRImageEnd: function (sender) {
      //   MNUtil.showHUD("onOCRImageEnd")
      // },
      onOCRImageBegin: async function (sender) {
        let focusNote = MNNote.new(sender.userInfo.mainNoteId)
        let tem = [1,2,3]//这里不区分文本和图片,颜色对就行
        let shouldOCR= tem.includes(autoUtils.getConfig("ocr")[focusNote.colorIndex])
        if (!shouldOCR) {
          // MNUtil.log("reject onOCRImageBegin")
          return
        }
        if (typeof ocrUtils === 'undefined') {
          MNUtil.log("MN AutoStyle: Please install 'MN OCR' first!")
          return;
        }
        self.isOnBuiltInOCR = true
        try {
        // let imageData = MNUtil.getDocImage(true,true)
        let imageData = sender.userInfo.imageData
        // let imageData = MNUtil.currentDocController.imageFromFocusNote()
        // if (!imageData && focusNote.excerptPic && focusNote.excerptPic.paint) {
        //   imageData = MNUtil.getMediaByHash(focusNote.excerptPic.paint)
        // }
        if (!imageData) {
          MNUtil.showHUD("No image to OCR")
        }else{
          let res = await ocrNetwork.OCR(imageData)
          if (self.isOnBuiltInOCR) {
            self.OCRResult = res
            return
          }
          // if (time < 100) {
          //   await MNUtil.delay(1)
          // }
          // MNUtil.copy(res)
          MNUtil.undoGrouping(()=>{
            focusNote.excerptText =  res
            focusNote.excerptTextMarkdown = true
            self.OCRResult = undefined
          })
        }
          
        } catch (error) {
          autoUtils.addErrorLog(error, "onOCRImageBegin")
        }
      },
      onOCRImageEnd: async function (sender) {
        self.isOnBuiltInOCR = false
        if (self.OCRResult) {
          let focusNote = MNNote.new(sender.userInfo.mainNoteId)
          await MNUtil.delay(0.5)
          MNUtil.undoGrouping(()=>{
            focusNote.excerptText =  self.OCRResult
            focusNote.excerptTextMarkdown = true
            self.OCRResult = undoGrouping
          })
        }
      }
    },
    { /* Class members */
      addonDidConnect: function () {
        autoUtils.init(mainPath)
      },
      addonWillDisconnect: async function () {
        if (typeof MNUtil === 'undefined') return
        let confirm = await MNUtil.confirm("MN AutoStyle: Remove all config?\n删除所有配置？", "")
        if (confirm) {
          MNUtil.showHUD("MN AutoStyle: Remove config")
          NSUserDefaults.standardUserDefaults().removeObjectForKey("MNAutoStyle")
        }
        autoUtils.addonConnected = false
        if (autoUtils.styleController) {
          autoUtils.styleController.view.hidden = true
        }
      },

      applicationWillEnterForeground: function () {
      },

      applicationDidEnterBackground: function () {
      },

      applicationDidReceiveLocalNotification: function (notify) {
      }
    }
  );
  MNStyleClass.prototype.init = function(mainPath){
  try {
    if (!this.initialized) {
      // autoUtils.init(mainPath)
      this.initialized = true
    }
  } catch (error) {
    autoUtils.addErrorLog(error, "init")
  }
  }
  return MNStyleClass;
};