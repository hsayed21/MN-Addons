/** @return {editorController} */
const getEditorController = ()=>self

var editorController = JSB.defineClass('editorController : UIViewController <UIWebViewDelegate>',{
  // /** @self {editorController} */
  viewDidLoad: function() {
  try {
    let self = getEditorController()
    self.appInstance = Application.sharedInstance();
    self.custom = false;
    self.customMode = "None"
    self.miniMode = false;
    self.shouldCopy = false
    self.shouldComment = false
    self.editorNoteTime = Date.now();
    self.selectedText = '';
    self.webApp = "Bilibili"
    self.isLoading = false;
    self.theme = "light"
    self.view.frame = {x:50,y:50,width:(self.appInstance.osType !== 1) ? 450 : 365,height:500}
    self.lastFrame = self.view.frame;
    self.currentFrame = self.view.frame
    self.isMainWindow = true
    self.title = "main"
    self.test = [0]
    self.moveDate = Date.now()
    self.color = [true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true]
    self.view.layer.shadowOffset = {width: 0, height: 0};
    self.view.layer.shadowRadius = 15;
    self.view.layer.shadowOpacity = 0.5;
    self.view.layer.shadowColor = UIColor.colorWithWhiteAlpha(0.5, 1);
    self.view.layer.cornerRadius = 11
    self.view.layer.opacity = 1.0
    self.view.layer.borderColor = MNUtil.hexColorAlpha("#9bb2d6",0.8)
    self.view.layer.borderWidth = 0

    // >>> DeepL view >>>
    self.webview = new UIWebView(self.view.bounds);
    self.webview.backgroundColor = UIColor.whiteColor();
    self.webview.scalesPageToFit = true;
    self.webview.autoresizingMask = (1 << 1 | 1 << 4);
    self.webview.delegate = self;
    self.webview.scrollView.delegate = self;
    self.webview.layer.cornerRadius = 15;
    self.webview.layer.masksToBounds = true;
    self.webview.layer.borderColor = MNUtil.hexColorAlpha("#9bb2d6",0.8);
    self.webview.layer.borderWidth = 0
    self.highlightColor = UIColor.blendedColor( MNUtil.hexColorAlpha("#2c4d81",0.8),
      self.appInstance.defaultTextColor,
      0.8
    );

    self.webview.hidden = true;
    self.webview.lastOffset = 0;
    self.view.addSubview(self.webview);

    self.createButton("toolbar")
    self.toolbar.backgroundColor = MNUtil.hexColorAlpha("#727f94",0.)
    self.toolbar.layer.cornerRadius = 0;

    self.createButton("headingButton","changeHeading:","toolbar")
    self.headingButton.setImageForState(editorUtils.webappImage,0)

    self.createButton("listButton","changeList:","toolbar")
    self.listButton.setImageForState(editorUtils.listImage,0)

    self.createButton("boldButton","changebold:","toolbar")
    self.boldButton.setImageForState(editorUtils.boldImage,0)

    self.createButton("linkButton","addLink:","toolbar")
    self.linkButton.setImageForState(editorUtils.linkImage,0)

    self.createButton("codeButton","addcode:","toolbar")
    self.codeButton.setImageForState(editorUtils.codeImage,0)

    self.createButton("tableButton","addtable:","toolbar")
    self.tableButton.setImageForState(editorUtils.tableImage,0)

    self.createButton("moreButton","addmore:","toolbar")
    self.moreButton.setImageForState(editorUtils.moreImage,0)

    self.createButton("closeButton","closeButtonTapped:")
    self.closeButton.setTitleForState('✖️', 0);
    self.closeButton.titleLabel.font = UIFont.systemFontOfSize(10);

    self.createButton("maxButton","maxButtonTapped:")
    self.maxButton.setTitleForState('➕', 0);
    self.maxButton.titleLabel.font = UIFont.systemFontOfSize(10);

    self.createButton("minButton","minButtonTapped:")
    self.minButton.setTitleForState('➖', 0);
    self.minButton.titleLabel.font = UIFont.systemFontOfSize(10);

    self.createButton("saveButton","saveToNote:","toolbar")
    self.saveButton.setTitleForState('Save', 0);
    self.saveButton.titleLabel.font = UIFont.boldSystemFontOfSize(17);

    self.createButton("searchButton","searchButtonTapped:","toolbar")
    self.searchButton.setTitleForState('📝', 0);

    self.createButton("moveButton","moveButtonTapped:")

    self.createButton("goForwardButton","goForwardButtonTapped:","toolbar")
    self.goForwardButton.setImageForState(editorUtils.goforwardImage,0)

    self.createButton("goBackButton","goBackButtonTapped:","toolbar")
    self.goBackButton.setImageForState(editorUtils.gobackImage,0)
    // <<< goBack button <<<
    // >>> refresh button >>>
    self.createButton("refreshButton","refreshButtonTapped:","toolbar")
    self.refreshButton.setImageForState(editorUtils.reloadImage,0)
    MNButton.addLongPressGesture(self.refreshButton,self,"onLongPressRefresh:")
    // <<< refresh button <<<
    MNButton.addPanGesture(self.moveButton,self,"onMoveGesture:")
    MNButton.addLongPressGesture(self.moveButton,self,"onLongPress:")
    // self.moveGesture = new UIPanGestureRecognizer(self,"onMoveGesture:")
    // self.moveButton.addGestureRecognizer(self.moveGesture)
    // self.moveGesture.view.hidden = false
    // self.moveGesture.addTargetAction(self,"onMoveGesture:")
    MNButton.addPanGesture(self.saveButton,self,"onResizeGesture:")
    MNButton.addLongPressGesture(self.saveButton,self,"onLongPressSave:")
    // self.resizeGesture = new UIPanGestureRecognizer(self,"onResizeGesture:")
    // self.saveButton.addGestureRecognizer(self.resizeGesture)
    // self.resizeGesture.view.hidden = false
    // self.resizeGesture.addTargetAction(self,"onResizeGesture:")
    // self.creatTextView("inlineLinkInput")
    self.creatView("inlineLinkView")
    self.inlineLinkView.hidden = true
    self.creatTextView("inlineLinkInput","inlineLinkView")
    self.inlineLinkInput.id = "inlineLinkInput"
    self.createButton("closeInlineLink","closeInlineLinkTapped:","inlineLinkView")
    self.closeInlineLink.setImageForState(editorUtils.stopImage,0)
    MNButton.setColor(self.closeInlineLink, "#e06c75")
    self.inlineLinkScrollview = self.createScrollview("inlineLinkView")
  } catch (error) {
    MNUtil.showHUD("Error in viewDidLoad: "+error)
  }
  },
  viewWillAppear: function(animated) {
    self.webview.delegate = self;
  },
  viewWillDisappear: function(animated) {
    self.webview.stopLoading();
    self.webview.delegate = null;
    UIApplication.sharedApplication().networkActivityIndicatorVisible = false;
  },
  /**
   * 
   * @param {UITextView} textview 
   */
  textViewDidChange:function (textview) {
    let self = getEditorController()
    try {
      if (textview.id !== "inlineLinkInput") {
        return
      }

    let text = textview.text.trim()
    if (text.length < 2) {
      return
    }
    // MNUtil.showHUD("should search: "+text)
    let allNotes = MNUtil.currentNotebook.notes
    let filteredNotes = allNotes.filter((note)=>{
      if (note.noteTitle) {
        return note.noteTitle.includes(text)
      }
      return false
    })
    // MNUtil.showHUD("filteredNotes: "+filteredNotes.length)
    self.setButtonText(filteredNotes.map((note)=>{
      return note.noteTitle
    }))
    } catch (error) {
      editorUtils.addErrorLog(error, "textViewDidChange")
    }
  },
viewWillLayoutSubviews: function() {
  let self = getEditorController()
    if (self.miniMode) {
      return
    }
    let buttonHeight = 25
    var viewFrame = self.view.bounds;
    var width    = viewFrame.width
    var height   = viewFrame.height
    self.closeButton.frame = MNUtil.genFrame(width-18,0,18,18)
    self.maxButton.frame = MNUtil.genFrame(width-43,0,18,18)
    self.minButton.frame = MNUtil.genFrame(width-68,0,18,18)

    self.toolbar.frame = MNUtil.genFrame(1, height-25, width-2,buttonHeight)
    self.saveButton.frame = {x: width - 55,y: 0,width: 50,height: buttonHeight};
    self.tableButton.hidden = width <= 400
    self.codeButton.hidden = width <= 370

    if (width <= 440) {
      self.moveButton.frame = {  x: width*0.5-75,  y: 0,  width: width*0.35,  height: 16};
      self.refreshButton.hidden = false
      self.goBackButton.hidden = false
      self.goForwardButton.hidden = false
      self.headingButton.frame = {  x: 106,  y: 0,  width: 30,  height: buttonHeight,};  
      self.listButton.frame = {  x: 141,  y: 0,  width: 30,  height: buttonHeight,};  
      self.boldButton.frame = {  x: 176,  y: 0,  width: 30,  height: buttonHeight,};  
      self.linkButton.frame = {  x: 211,  y: 0,  width: 30,  height: buttonHeight,};  
      self.codeButton.frame = {  x: 246,  y: 0,  width: 30,  height: buttonHeight,};  
      self.tableButton.frame = {  x: 281,  y: 0,  width: 30,  height: buttonHeight,};  
      self.searchButton.frame = {  x: width-95,  y: 0,  width: 35,  height: buttonHeight,};
      self.moreButton.frame = {  x: 316,  y: 0,  width: 30,  height: buttonHeight,}; 
      self.moreButton.hidden = true
    }else{
      self.moveButton.frame = {  x: width*0.5-75,  y: 0,  width: 150,  height: 16};
      self.refreshButton.hidden = false
      self.goBackButton.hidden = false
      self.goForwardButton.hidden = false
      self.headingButton.hidden = false
      self.headingButton.frame = {  x: 106,  y: 0,  width:30,  height: buttonHeight,};   
      self.listButton.frame = {  x: 141,  y: 0,  width:30,  height: buttonHeight,};   
      self.boldButton.frame = {  x: 176,  y: 0,  width: 30,  height: buttonHeight,};  
      self.linkButton.frame = {  x: 211,  y: 0,  width: 30,  height: buttonHeight,};  
      self.codeButton.frame = {  x: 246,  y: 0,  width: 30,  height: buttonHeight,};  
      self.tableButton.frame = {  x: 281,  y: 0,  width: 30,  height: buttonHeight,};  
      self.moreButton.frame = {  x: 316,  y: 0,  width: 30,  height: buttonHeight,};  
      self.searchButton.frame = {  x: width - 95,  y: 0,  width: 35,  height: buttonHeight};
      self.moreButton.hidden = false
    }

    self.goBackButton.frame = {  x:1,  y: 0,  width: 30,  height: buttonHeight,};
    self.goForwardButton.frame = {  x:36,  y: 0,  width: 30,  height: buttonHeight,};
    self.refreshButton.frame = {  x: 71,  y: 0,  width: 30,  height: buttonHeight,};
    self.webview.frame = {x:1,y:8,width:width-2,height:height-38}
    try {
      if (self.settingView) {
        self.settingViewLayout()
        self.refreshLayout()
      }
    } catch (error) {
      MNUtil.showHUD(error)
    }

  },
  webViewDidStartLoad: function(webView) {
  },
  webViewDidFinishLoad: function(webView) {

    // let subscribed = editorUtils.checkSubscribe(false,false)
    // self.runJavaScript(`base64ToR2URL = ${editorConfig.getConfig("base64ToR2URL")};subscribed = ${subscribed}`)
  },
  webViewDidFailLoadWithError: function(webView, error) {
  },
  webViewShouldStartLoadWithRequestNavigationType: function(webView,request,type){
    try {
    let self = getEditorController()
    let requestURL = request.URL().absoluteString()
    // MNUtil.copy(requestURL)
    if (!requestURL) {
      MNUtil.showHUD("Empty URL")
      return false
    }
    let config = MNUtil.parseURL(requestURL)
    switch (config.scheme) {
      case "file":
        return true
      case "marginnote4app":
      case "marginnote3app":
        self.openMNURL(config)
        // MNUtil.openURL(requestURL)
        return false
      default:
        editorUtils.log("config", config)
        break;
    }
    
    // if (/^marginnote4app\:\/\//.test(requestURL)) {
    //   MNUtil.showHUD("message")
    //   // MNUtil.openURL(requestURL)
    //   return true
    // }
    // if(/^externalfile:\/\//.test(requestURL)) {
    //   MNUtil.copy(requestURL.slice(15))
    //   MNUtil.openURL(requestURL.slice(15))
    //   return false
    // }
    if(/^craftdocs:\/\//.test(requestURL) || /^zotero:\/\//.test(requestURL)) {
      MNUtil.openURL(requestURL)
      return false
    }
    if (/^browservideo\:\/\//.test(requestURL)) {
      let tem = decodeURIComponent(requestURL).split("time=")[1].split("?source=")
      let time = tem[0]
      let source = tem[1]
      // MNUtil.copy({
      //   time:time,
      //   source:source
      // })
      MNUtil.postNotification("browserVideo", {time:time,source:source})
      return false
    }
    if (/^nativecopy\:\/\//.test(requestURL)) {
      let text = decodeURIComponent(requestURL.split("content=")[1])
      // MNUtil.showHUD(text)
      MNUtil.copy(text)
      return false
    }
    
    if (/^editordroptext\:\/\//.test(requestURL)) {
      if(self.editorNoteId){
        let text = decodeURIComponent(requestURL.split("content=")[1])
        // MNUtil.showHUD(text)
        let currentSelection = MNUtil.currentSelection
        if(currentSelection.onSelection && currentSelection.isText && currentSelection.text === text){
          MNUtil.undoGrouping(()=>{
            let note = MNNote.fromSelection().realGroupNoteForTopicId()
            note.excerptText = ""
            let currentNote = MNNote.new(self.editorNoteId)
            currentNote.merge(note)
            MNUtil.delay(0.5).then(()=>{
              self.save(self.editorNoteId)
            })
            // self.setContent(currentNote,0.5)
          })
        }
      }
      return false
    }
    if (/^editorimage\:\/\//.test(requestURL)) {
      // MNUtil.excuteCommand("SourceHighlight")
      let dataURL = decodeURIComponent(requestURL.split("content=")[1])
      // let currentSelection = MNUtil.currentSelection
      // if(currentSelection.onSelection && !currentSelection.isText){
      //   self.save(self.editorNoteId)
      //   // let selectedMd5 = MNUtil.MD5(currentSelection.image.base64Encoding())
      //   // if (imageMd5 === selectedMd5) {
      //     MNUtil.undoGrouping(()=>{
      //       let note = MNNote.fromSelection().realGroupNoteForTopicId()
      //       note.excerptText = ""
      //       note.textFirst = true
      //       let currentNote = MNNote.new(self.editorNoteId)
      //       currentNote.merge(note)
      //       self.setContent(currentNote,0.5)
      //     })
      //     return false
      // }
      if (editorConfig.getConfig("base64ToLocalBuffer")) {
        let url = editorUtils.getLocalBufferFromBase64(dataURL)
        // self.runJavaScript("editor.getCursorPosition()").then((res)=>{
        //   let pos = JSON.parse(res)
        //   if (pos.top < 40) {
        //     self.runJavaScript(`editor.insertValue("# \\n![image](${url})",true);`)
        //       MNUtil.showHUD("message")
        //   }else{
        //   }
        //   MNUtil.copy(res)
        // })
        self.runJavaScript(`editor.insertValue("![image](${url})",true);`)

        // let imageMd5 = MNUtil.MD5(dataURL)

        return false
      }

      return false
      // let fileSizeWithMB = imageData.length()/1048576.
      // if (fileSizeWithMB > 1 && !edtorUtils.checkSubscribe(false,false,true)) {
      //   MNUtil.showHUD("Too large file!")
      //   return false
      // }

      // let md5 = MNUtil.MD5(imageData.base64Encoding())
      // let fileName = md5+".png"
      // // MNUtil.copyJSON(editorConfig.config)
      // if (editorConfig.getConfig("uploadOnEdit")) {
      //   MNUtil.showHUD("Uploading image...")
      //   let url = editorUtils.getR2URL(md5)
      //   if (md5 in editorUtils.imageBuffer) {
      //     self.runJavaScript(`editor.insertValue("![image](${url})",true);`)
      //     return false
      //   }
      //   self.runJavaScript(`editor.disabled();`)
      //   editorUtils.imageBuffer[md5] = false
      //   editorUtils.uploadFileToR2(imageData, fileName, true)
      //   .then(async ()=>{
      //     editorUtils.imageBuffer[md5] = true
      //     await self.runJavaScript(`editor.insertValue("![image](${url})",true);`)
      //     await MNUtil.delay(0.5)
      //     await self.runJavaScript(`refresh();editor.enable();`)
      //   })
      // }
      // return false
    }
    if (/^editorselect\:\/\//.test(requestURL)) {
      let text = decodeURIComponent(requestURL.split("content=")[1])
      MNUtil.copy(text)
      return false
    }
    if (/^nativecommand\:\/\/save/.test(requestURL)) {
      if (self.editorNoteId) {
        self.save(self.editorNoteId)
        MNUtil.showHUD("Note saved")
        return false
      }
      if (self.targetURL) {
        self.saveToAttach(self.targetURL)
        MNUtil.showHUD("File saved")
        return false
      }
      MNUtil.showHUD("Can't save on free mode!")
      return false
    }
    if (/^editorinlinelink\:\/\//.test(requestURL)) {
      // self.exit()
      // MNUtil.showHUD("Inline link")
      self.inlineLinkView.hidden = false
      let frame = self.view.frame
      self.inlineLinkView.frame = {x:frame.width/2-200,y:frame.height/2-150,width:400,height:300}
      self.inlineLinkInput.frame = {x:10,y:10,width:340,height:35}
      self.closeInlineLink.frame = {x:355,y:10,width:35,height:35}
      self.inlineLinkScrollview.frame = {x:10,y:50,width:380,height:240}
      self.inlineLinkInput.becomeFirstResponder()
      return false
      // let text = decodeURIComponent(requestURL.split("content=")[1])
      // MNUtil.copy(text)
    }
    if (/^editorexit\:\/\//.test(requestURL)) {
      self.exit()
      return false
      // let text = decodeURIComponent(requestURL.split("content=")[1])
      // MNUtil.copy(text)
    }
    if (/^editorinput\:\/\//.test(requestURL)) {
      let text = decodeURIComponent(requestURL.split("content=")[1])
      self.checkAndPrepareR2URL(text)
      return false
      // MNUtil.showHUD("message")
      // MNUtil.copy(text)
    }
    if (/^(marginnote\dapp)\:\/\/note/.test(requestURL)) {
      let targetNote = MNNote.new(requestURL)
      targetNote.focusInFloatMindMap()
      // MNUtil.openURL(requestURL)
      // Application.sharedInstance().openURL(NSURL.URLWithString(requestURL));
      return false
    }
    if (/^(marginnote\dapp)\:\/\/addon/.test(requestURL)) {
      // MNUtil.openURL(requestURL)
      // Application.sharedInstance().openURL(NSURL.URLWithString(requestURL));
      MNUtil.postNotification("AddonBroadcast", {message:requestURL})
      return false
    }
    if (/^http/.test(requestURL) || /^data\:image\//.test(requestURL)) {
      let beginFrame = self.view.frame
      let endFrame = beginFrame
      let studyFrame = MNUtil.studyView.bounds
      if ((beginFrame.x+beginFrame.width*2) < studyFrame.width) {
        endFrame.x = beginFrame.x+beginFrame.width
        MNUtil.postNotification("openInBrowser", {url:requestURL,beginFrame:beginFrame,endFrame:endFrame})
        return false
      }
      if ((beginFrame.x-beginFrame.width) > 0) {
        endFrame.x = beginFrame.x-beginFrame.width
        MNUtil.postNotification("openInBrowser", {url:requestURL,beginFrame:beginFrame,endFrame:endFrame})
        return false
      }
      MNUtil.postNotification("openInBrowser", {url:requestURL})
      return false
    }
    if (/^file\:\/\//.test(requestURL)) {
      let url = decodeURI(requestURL).replace("file://", "")
      if (url.endsWith(".png") && MNUtil.isfileExists(url)) {
        let imageData = NSData.dataWithContentsOfFile(url)
        url = "data:image/png;base64,"+imageData.base64Encoding()
        MNUtil.postNotification("openInBrowser", {url:url})
        return false
      }
    }
    return true;
    } catch (error) {
      editorUtils.addErrorLog(error, "webViewShouldStartLoadWithRequestNavigationType")
      return false
    }
  },
  changeHeading: function (sender) {
    var commandTable = [
      {title:'Heading 1',object:self,selector:'setHeading:',param:1},
      {title:'Heading 2',object:self,selector:'setHeading:',param:2},
      {title:'Heading 3',object:self,selector:'setHeading:',param:3},
      {title:'Heading 4',object:self,selector:'setHeading:',param:4},
      {title:'Heading 5',object:self,selector:'setHeading:',param:5},
      {title:'Heading 6',object:self,selector:'setHeading:',param:6},
      {title:'No Heading',object:self,selector:'setHeading:',param:7},
    ];
    self.popoverController = MNUtil.getPopoverAndPresent(sender, commandTable,150,2)
  },
  setHeading: function (index) {
    if (self.popoverController) {self.popoverController.dismissPopoverAnimated(true);}
    switch (index) {
      case 7:
        self.runJavaScript(`triggerKey('h','KeyH',72,true)`)
        break;
      case 1:
        self.runJavaScript(`triggerKey('1','Digit1',49,true,false,true)`)
        break;
      case 2:
        self.runJavaScript(`triggerKey('2','Digit2',50,true,false,true)`)
        break;
      case 3:
        self.runJavaScript(`triggerKey('3','Digit3',51,true,false,true)`)
        break;
      case 4:
        self.runJavaScript(`triggerKey('4','Digit4',52,true,false,true)`)
        break;
      case 5:
        self.runJavaScript(`triggerKey('5','Digit5',53,true,false,true)`)
        break;
      case 6:
        self.runJavaScript(`triggerKey('6','Digit6',54,true,false,true)`)
        break;
      default:
        break;
    }
  },
  changeList: function (sender) {
    var commandTable = [
      {title:'Todo List',object:self,selector:'setList:',param:1},
      {title:'Bullet List',object:self,selector:'setList:',param:2},
      {title:'Ordered List',object:self,selector:'setList:',param:3},
    ];
    self.popoverController = MNUtil.getPopoverAndPresent(sender, commandTable,120,2)
  },
  setList: function (index) {
    if (self.popoverController) {self.popoverController.dismissPopoverAnimated(true);}
    switch (index) {
      case 1:
        self.runJavaScript(`triggerKey('j','KeyJ',74,true)`)
        break;
      case 2:
        self.runJavaScript(`triggerKey('l','KeyL',76,true)`)
        break;
      case 3:
        self.runJavaScript(`triggerKey('o','KeyO',79,true)`)
        break;
      default:
        break;
    }
  },
  changebold:function (params) {
    // MNUtil.showHUD("message")
        // self.runJavaScript(`triggerKey('o','KeyO',79,true)`)
    self.runJavaScript(`triggerKey('b','KeyB',66,true)`)
  },
  changeScreen: function(sender) {
    var commandTable = [
        {title:'🎚 Zoom',object:self,selector:'changeZoom:',param:sender},
        {title:'🎛 Setting',object:self,selector:'openSettingView:',param:'right'},
        {title:'🫧 Opacity',object:self,selector:'changeOpacity:',param:sender},
        {title:'🫧 Theme',object:self,selector:'changeTheme:',param:sender},
      ];
    self.popoverController = MNUtil.getPopoverAndPresent(sender, commandTable,250,2)
  },
  moveButtonTapped: function(sender) {
    if (self.miniMode) {
      let preFrame = self.view.frame
      self.view.hidden = true
      self.showAllButton()
      let studyFrame = MNUtil.studyView.bounds
      if (self.lastFrame.x < 0) {
        self.lastFrame.x = 0
      }
      if (self.lastFrame.x + self.lastFrame.width > studyFrame.width) {
        self.lastFrame.x = studyFrame.width-self.lastFrame.width
        
      }
      self.setFrame(self.lastFrame)
      self.show(preFrame)
      self.moveButton.setImageForState(undefined,0)
      return
    }
    let commandTable = []
    if (self.targetURL) {
      let docInfo = editorUtils.getDocNameFromAttach(self.targetURL)
      commandTable = [{title:'📝 '+docInfo.name,object:self,selector:'copyDocName:',param:docInfo.name}]
    }
    commandTable  = commandTable.concat([
        {title:'🎛 Setting',object:self,selector:'openSettingView:',param:'right'},
        {title:'🎛 Export → File',object:self,selector:'exportMd:',param:'right'},
        {title:'🎛 Export → Clipboard',object:self,selector:'saveTo:',param:'Clipboard'},
        {title:'🌗 Left',object:self,selector:'splitScreen:',param:'left',checked:self.customMode==="left"},
        {title:'🌘 Left 1/3',object:self,selector:'splitScreen:',param:'left13',checked:self.customMode==="left13"},
        {title:'🌓 Right',object:self,selector:'splitScreen:',param:'right',checked:self.customMode==="right"},
        {title:'🌒 Right 1/3',object:self,selector:'splitScreen:',param:'right13',checked:self.customMode==="right13"},
        {title:'🎬 Screenshot',object:self,selector:'screenshot:',param:self.view.frame.width>1000?self.view.frame.width:1000},
        {title:'📝 New Document',object:self,selector:'homeButtonTapped:',param:self.view.frame.width>1000?self.view.frame.width:1000},
        {title:'📝 Open Attachment',object:self,selector:'openAttach:',param:MNUtil.currentDocmd5},
        {title:'📝 Show Attachments',object:self,selector:'showAttachs:',param:sender},
        {title:'📝 Mode: ir',object:self,selector:'changeMode:',param:"ir",checked:editorConfig.getConfig("mode")==="ir"},
        {title:'📝 Mode: wysiwyg',object:self,selector:'changeMode:',param:"wysiwyg",checked:editorConfig.getConfig("mode")==="wysiwyg"},
        {title:'📝 Mode: sv',object:self,selector:'changeMode:',param:"sv",checked:editorConfig.getConfig("mode")==="sv"},
        {title:'🌓 Theme',object:self,selector:'changeTheme:',param:sender},
        {title:'❌ Force close',object:self,selector:'forceToClose:',param:sender}
      ]);

    self.popoverController = MNUtil.getPopoverAndPresent(sender, commandTable,250,1)
  },
  copyDocName: function (docName) {
    MNUtil.copy(docName)
  },
  testEdit: async function (button){
    let popupMenu = editorUtils.popupMenu()
    MNUtil.animate(()=>{
      popupMenu.layer.opacity = 0
    }).then(()=>{
      popupMenu.hidden = true
      popupMenu.removeFromSuperview()
      MNUtil.postNotification("ClosePopupMenuOnNote", {noteid:self.currentNoteId})
    })
    // self.view.becomeFirstResponder()
    if (self.view.hidden) {
      if (button.noteFrame) {
        self.show(button.noteFrame)
      }else{
        let target
        if (MNUtil.mindmapView) {
          target = MNUtil.mindmapView.selViewLst.find(sel=>sel.note.note.noteId === self.currentNoteId)
          if (target) {
            let noteView = target.view
            let beginFrame = noteView.convertRectToView(noteView.bounds, MNUtil.studyView)
            // let tem = {begin:test.frame,end:endFrame}
            // MNUtil.copyJSON(tem)
            self.show(beginFrame)
          }else{
            self.show()
          }
        }else{
          self.show()
        }
      }
    }else{
      if (button.noteFrame) {
        self.endFrame = button.noteFrame
      }
    }
    await MNUtil.delay(0.01)
    let note = MNUtil.getNoteById(self.currentNoteId)
    self.setContent(note)
  },
  saveToNote: async function(sender) {
    let self = getEditorController()
    if (self.editorNoteId) {
      if (MNUtil.db.getNoteById(self.editorNoteId)) {
        let noteTime = Date.parse(MNNote.new(self.editorNoteId).modifiedDate)
        if (noteTime > self.editorNoteTime) {
          // MNUtil.copyJSON({editorTime: self.editorNoteTime, noteTime: noteTime})
          let confirm = await MNUtil.confirm("Note has been edited. Overwrite content？", "笔记已被编辑。是否覆盖？")
          if (confirm) {
            self.editorNoteTime = Date.now()
          }else{
            return
          }
        }
        self.save(self.editorNoteId)
        return
      }else{
        self.editorNoteId = undefined
        self.refreshBackgroundColor()
        MNUtil.showHUD("Note not found")
      }
    }
    if (self.targetURL) {
      let content = await self.getContent()
      MNUtil.writeText(self.targetURL, content)
      MNUtil.showHUD("File saved")
      return
    }
    var commandTable = [
      {title:'Save to CurrentNote',object:self,selector:'saveTo:',param:"CurrentNote"},
      {title:'Save as NewNote',object:self,selector:'saveTo:',param:"NewNote"},
      {title:'Save as ChildNote',object:self,selector:'saveTo:',param:"ChildNote"},
      {title:'Save as BrotherNote',object:self,selector:'saveTo:',param:"BrotherNote"},
      {title:'Save as Comment',object:self,selector:'saveTo:',param:"Comment"},
      {title:'Save as Attachment',object:self,selector:'saveToAttach:',param:sender}
    ];
    self.popoverController = MNUtil.getPopoverAndPresent(sender, commandTable,200)
  },
  saveTo: async function (target) {
    let self = getEditorController()
  try {
    let content
    if (self.popoverController) {self.popoverController.dismissPopoverAnimated(true);}
    let focusNote = MNNote.getFocusNote()
    switch (target) {
      case "CurrentNote":
        if (focusNote) {
          self.save(focusNote.noteId,false)
          self.editorNoteId = focusNote.noteId
          self.refreshBackgroundColor()
        }else{
          MNUtil.showHUD("No note found")
        }
        break;
      case "Comment":
        if (focusNote) {
          content = await self.getContent()
          MNUtil.undoGrouping(()=>{
            focusNote.appendMarkdownComment(content)
          })
        }else{
          MNUtil.showHUD("No note found")
        }
        break;
      case "NewNote":
          content = await self.getContent()
          let config = {}
          let hasTitle = /^#/.test(content)
          if (hasTitle) {
            let newTitle = content.split("\n")[0].replace(/^#+\s?/g,"")
            config = {title:newTitle,excerptText:content.split("\n").slice(1).join("\n").trim(),excerptTextMarkdown:true}
          }else{
            config = {excerptText:content,excerptTextMarkdown:true}
          }
          let mindmap = MNUtil.mindmapView.mindmapNodes[0].note.childMindMap
          // MNNote.new(mindmap).focusInMindMap()
          if (mindmap) {
            let childNote = MNNote.new(mindmap).createChildNote(config)
            self.editorNoteId = childNote.noteId
            self.editorNoteTime = Date.now()
            self.refreshBackgroundColor()
            childNote.focusInMindMap(0.5)
          }else{
            MNUtil.showHUD("Create in main mindmap")
            MNUtil.undoGrouping(()=>{
              let newNote = MNNote.new(config)
              self.editorNoteId = newNote.noteId
              self.editorNoteTime = Date.now()
              self.refreshBackgroundColor()
              newNote.focusInMindMap(0.5)
            })
          }
          break
      case "BrotherNote":
        if (focusNote) {
          if (focusNote.parentNote) {
            let parentNote = focusNote.parentNote
            content = await self.getContent()
            await self.blur()
            if (editorConfig.imageCompression) {
              content = this.replaceBase64Images(content)
            }
            let hasTitle = /^#/.test(content)
            if (hasTitle) {
              let newTitle = content.split("\n")[0].replace(/^#+\s?/g,"")
              let config = {title:newTitle,excerptText:content.split("\n").slice(1).join("\n").trim(),excerptTextMarkdown:true}
              let childNote = parentNote.createChildNote(config)
              self.editorNoteId = childNote.noteId
              childNote.focusInMindMap(0.5)
            }else{
              let childNote = parentNote.createChildNote({excerptText:content,excerptTextMarkdown:true})
              self.editorNoteId = childNote.noteId
              childNote.focusInMindMap(0.5)
            }
            self.editorNoteTime = Date.now()
            self.refreshBackgroundColor()
          }else{
            MNUtil.showHUD("No parent")
          }
        }else{
          MNUtil.showHUD("No note found")
        }
        break;
      case "ChildNote":
        if (focusNote) {
          content = await self.getContent()
          await self.blur()
          if (editorConfig.imageCompression) {
            content = this.replaceBase64Images(content)
          }
          let hasTitle = /^#/.test(content)
          if (hasTitle) {
            let newTitle = content.split("\n")[0].replace(/^#+\s?/g,"")
            let config = {title:newTitle,excerptText:content.split("\n").slice(1).join("\n").trim(),excerptTextMarkdown:true}
            let childNote = focusNote.createChildNote(config)
            self.editorNoteId = childNote.noteId
            childNote.focusInMindMap(0.5)
          }else{
            let childNote = focusNote.createChildNote({excerptText:content,excerptTextMarkdown:true})
            self.editorNoteId = childNote.noteId
            childNote.focusInMindMap(0.5)
          }
          self.editorNoteTime = Date.now()
          self.refreshBackgroundColor()
        }else{
          MNUtil.showHUD("No note found")
        }
        break;
      case "Clipboard":
        content = await self.getContent()
        MNUtil.copy(content)
        break;
      default:
        break;
    }
  } catch (error) {
    editorUtils.addErrorLog(error, "saveTo")
  }
  },

  saveToMindmap: async function (){
    let self = getEditorController()
    if (self.popoverController) {self.popoverController.dismissPopoverAnimated(true);}
    let content = await self.getContent()
    let ast = editorUtils.markdown2AST(content)
    let focusNote = MNNote.getFocusNote()
    MNUtil.showHUD("Creating mindmap...")
    await MNUtil.delay(0.1)
    MNUtil.undoGrouping(()=>{
      if (!focusNote) {
        focusNote = editorUtils.newNoteInCurrentChildMap({title:newNoteTitle})
        focusNote.focusInFloatMindMap(0.5)
      }
      editorUtils.AST2Mindmap(focusNote,ast)
    })
  },
  saveToAttach(md5){
    if (self.popoverController) {self.popoverController.dismissPopoverAnimated(true);}
    if (typeof md5 === "string") {
      let fileURL = editorUtils.bufferFolder+md5+".md"
      self.saveToAttach(fileURL)
      self.targetURL = fileURL
      self.editorNoteId = undefined
      self.refreshBackgroundColor()
      MNUtil.showHUD("file saved as: "+fileURL)
    }else{
      let docControllers = MNUtil.docControllers
      if (docControllers.length > 1) {
        var commandTable = docControllers.map(docController=>{
          let docMd5 = docController.docMd5
          let docName = docController.document.docTitle
          return {title:docName,object:self,selector:'saveToAttach:',param:docMd5}
        })
        self.popoverController = MNUtil.getPopoverAndPresent(md5, commandTable,300)
        return;
      }
      let docMd5 = MNUtil.currentDocController.docMd5
      let fileURL = editorUtils.bufferFolder+docMd5+".md"
      self.saveToAttach(fileURL)
      self.targetURL = fileURL
      self.editorNoteId = undefined
      self.refreshBackgroundColor()
      MNUtil.showHUD("file saved as: "+fileURL)
    }
  },
  exportMd: async function (params) {
    if (self.popoverController) {self.popoverController.dismissPopoverAnimated(true);}
    //会消耗免费次数
    if (editorUtils.checkSubscribe(true)) {
  // let content = await self.runJavaScript('editor.getValue()')
      let content = await self.getContent("base64")   
      MNUtil.copy(content)
      let docPath = MNUtil.cacheFolder+"/export.md"
      MNUtil.writeText(docPath, content)
      let UTI = ["public.md"]
      MNUtil.saveFile(docPath, UTI)
    }
    // }
  },
  changeMode: async function (mode) {
    if (self.popoverController) {self.popoverController.dismissPopoverAnimated(true);}

    self.setMode(mode)
  },
  openCurrentDocMd: function (params) {
  try {
    if (self.popoverController) {self.popoverController.dismissPopoverAnimated(true);}
    let docMd5 = MNUtil.currentDocController.docMd5
    let fileURL = editorUtils.bufferFolder+docMd5+".md"
    if (MNUtil.isfileExists(fileURL)) {
      let data = NSData.dataWithContentsOfFile(fileURL)
      let test = CryptoJS.enc.Base64.parse(data.base64Encoding())
      let content = CryptoJS.enc.Utf8.stringify(test);
      // MNUtil.copy(content)
      self.runJavaScript(`setValue(\`${encodeURIComponent(content)}\`)`)
      self.targetURL = fileURL

      // let content = MNUtil.
    }else{
      MNUtil.showHUD("No file")
    }
  } catch (error) {
    MNUtil.showHUD(error)
  }
  },
  changeOpacity: function(sender) {
    if (self.popoverController) {self.popoverController.dismissPopoverAnimated(true);}
    var commandTable = [
      {title:'100%',object:self,selector:'changeOpacityTo:',param:1.0},
      {title:'90%',object:self,selector:'changeOpacityTo:',param:0.9},
      {title:'80%',object:self,selector:'changeOpacityTo:',param:0.8},
      {title:'70%',object:self,selector:'changeOpacityTo:',param:0.7},
      {title:'60%',object:self,selector:'changeOpacityTo:',param:0.6},
      {title:'50%',object:self,selector:'changeOpacityTo:',param:0.5}
    ];
    self.popoverController = MNUtil.getPopoverAndPresent(sender, commandTable,100,1)
  },
  changeTheme: function (params) {
    if (self.popoverController) {self.popoverController.dismissPopoverAnimated(true);}
    switch (self.theme) {
      case "light":
        self.runJavaScript(`editor.setTheme("dark","dark");`)
        self.theme = "dark"
        break;
      case "dark":
        self.runJavaScript(`editor.setTheme("light","light");`)
        self.theme = "light"
        break;
      default:
        break;
    }
  },
  changeZoom: function(sender) {
    if (self.popoverController) {self.popoverController.dismissPopoverAnimated(true);}
    var commandTable = [
      {title:'175%',object:self,selector:'changeZoomTo:',param:1.75},
      {title:'150%',object:self,selector:'changeZoomTo:',param:1.5},
      {title:'125%',object:self,selector:'changeZoomTo:',param:1.25},
      {title:'100%',object:self,selector:'changeZoomTo:',param:1.0},
      {title:'75%', object:self,selector:'changeZoomTo:',param:0.75},
      {title:'50%', object:self,selector:'changeZoomTo:',param:0.5}
    ];
    self.popoverController = MNUtil.getPopoverAndPresent(sender, commandTable,100,1)
  },
  changeOpacityTo:function (opacity) {
    self.view.layer.opacity = opacity
    self.opacityButton.setTitleForState("Opacity: "+(opacity*100)+"%",0)
  },
  changeZoomTo:function (zoom) {
    self.runJavaScript(`document.body.style.zoom = ${zoom}`)
  },
  openSettingView:function () {
    if (self.popoverController) {self.popoverController.dismissPopoverAnimated(true);}
    // self.settingController.view.hidden = false
    if (!self.settingView) {
      self.createSettingView()
    }
      self.settingView.hidden = false




    // self.view.addSubview(self.tabView)
  },
  screenshot: function (width) {
    if (self.popoverController) {self.popoverController.dismissPopoverAnimated(true);}
    self.webview.takeSnapshotWithWidth(width,(snapshot)=>{
      MNUtil.copyImage(snapshot.pngData())
      MNUtil.showHUD('截图已复制到剪贴板')
    })
  },
  addLink: function (sender) {
    var commandTable = [
      {title:'image link',object:self,selector:'addLinkWithType:',param:"imageLink"},
      {title:'pure link',object:self,selector:'addLinkWithType:',param:"textLink"},
      {title:'image from selection',object:self,selector:'addLinkWithType:',param:"focusImage"},
      {title:'image from clipboard',object:self,selector:'addLinkWithType:',param:"clipborad"},
      {title:'link from focusNote',object:self,selector:'addLinkWithType:',param:"focusNote"},
      {title:'Footnote',object:self,selector:'addLinkWithType:',param:"Footnote"},
    ];
    self.popoverController = MNUtil.getPopoverAndPresent(sender, commandTable,200)
    // self.runJavaScript(`editor.insertValue("[](https://)",true)`)
  },
  addLinkWithType: async function (type) {
    if (self.popoverController) {self.popoverController.dismissPopoverAnimated(true);}
    let imageData
    let focusNote
    switch (type) {
      case "imageLink":
        self.runJavaScript(`editor.insertValue("![image](https://)",true)`)
        break;
      case "textLink":
        let res = await MNUtil.input("Input URL", "请输入链接",["Cancel","Confirm"])
        if (res.button) {
          if (/https?:/.test(res.input)) {
            self.runJavaScript(`addLink(\`${res.input}\`)`)
          }else{
            self.runJavaScript(`addLink(\`https://${res.input}\`)`)
          }
        }
        break;
      case "Footnote":
          let footnotes = JSON.parse(await self.runJavaScript(`getFootnoteIds()`))
          let allOption = ["❌ Cancel","✅ Confirm","➡️ Content"].concat(footnotes.map(f=>"#️⃣ "+f))
          let input = ""
          let inputRes = await MNUtil.input("Input Footnote","输入脚注\ntitle:content",allOption)
            switch (inputRes.button) {
              case 0:
                break;
              case 1:
                input = inputRes.input
                if (input.trim()) {
                  let res = input.split(":")
                  if (res.length > 1) {
                    await self.runJavaScript(`addFootnote(\`${res[0]}\`,\`${res[1]}\`)`)
                  }else{
                    await self.runJavaScript(`addFootnote(\`${input}\`)`)
                  }
                }else{
                  MNUtil.showHUD("Invalid input")
                }
                break;
              case 2:
                input = inputRes.input
                if (input.trim()) {
                  let content = await MNUtil.input("Input Content","输入脚注内容",["❌ Cancel","✅ Confirm","📝 Current note"])
                  switch (content.button) {
                    case 0:
                      break;
                    case 1:
                      if (content.input.trim()) {
                        await self.runJavaScript(`addFootnote(\`${input}\`,\`${content.input}\`)`)
                      }else{
                        await self.runJavaScript(`addFootnote(\`${input}\`)`)
                      }
                      break;
                    case 2:
                      focusNote = MNNote.getFocusNote()
                      let markdonwLink = `[${focusNote.noteTitle ?? focusNote.excerptsText ?? "note"}](${focusNote.noteURL})`
                      await self.runJavaScript(`addFootnote(\`${input}\`,\`${markdonwLink}\`)`)
                      break;
                    default:
                      break;
                  }
                }else{
                  MNUtil.showHUD("Invalid input")
                }
                break;
              default:
                let title = footnotes[inputRes.button-3]
                await self.runJavaScript(`addFootnote(\`${title}\`)`)
                break;
            }
          break;
      case "clipborad":
        let image = UIPasteboard.generalPasteboard().image
        if (image) {
          self.runJavaScript(`editor.insertValue("![image.png](data:image/png;base64,${image.pngData().base64Encoding()})",true)`)
        }else{
          MNUtil.showHUD("No image found")
        }
        break;
      case "focusImage":
      try {
        imageData = MNUtil.getDocImage(true,true)
        if (!imageData) {
          focusNote = MNNote.getFocusNote()
          if (!focusNote) {
            MNUtil.showHUD("No image found")
            return
          }
          imageData = MNNote.getImageFromNote(focusNote)
        }
        if (imageData) {
          let url = await self.getURLFromImage(imageData)
          self.runJavaScript(`editor.focus();editor.insertValue("![image.png](${url})",true)`)
          // self.runJavaScript(`editor.insertValue("![image.png](data:image/png;base64,${imageData.base64Encoding()})",true)`)
        }else{
          MNUtil.showHUD("No image found")
        }
      } catch (error) {
        MNUtil.showHUD(error)
      }
        break;
      case "focusNote":
        focusNote = MNNote.getFocusNote()
        if (focusNote) {
          let title = focusNote.noteTitle ?? focusNote.excerptsText ?? "note"
          self.runJavaScript(`addLink(\`${focusNote.noteURL}\`,\`${title}\`)`)
          // if (!title) {
          //   if (focusNote.comments.length) {
              
          //   }
          // }
          // self.runJavaScript(`editor.insertValue("[${title}](${focusNote.noteURL})",true)`)
        }else{
          MNUtil.showHUD("No note found")
        }
        break;
      default:
        break;
    }
  },
  addcode: function (sender) {
    var commandTable = [
      {title:'inline',object:self,selector:'addCodeWithType:',param:"inline"},
      {title:'block',object:self,selector:'addCodeWithType:',param:"block"}
    ];
    self.popoverController = MNUtil.getPopoverAndPresent(sender, commandTable,200)
    // self.runJavaScript(`editor.insertValue("[](https://)",true)`)
  },
  addCodeWithType: function (type) {
    if (self.popoverController) {self.popoverController.dismissPopoverAnimated(true);}
    switch (type) {
      case "inline":
        self.runJavaScript(`triggerKey('g','KeyG',71,true)`)
        break;
      case "block":
        self.runJavaScript(`triggerKey('u','KeyU',85,true)`)
        break;
      default:
        break;
    }
  },
  addtable: function (sender) {
    var commandTable = [
      {title:'2x2',object:self,selector:'addTableWithSize:',param:2},
      {title:'3x3',object:self,selector:'addTableWithSize:',param:3},
      {title:'4x4',object:self,selector:'addTableWithSize:',param:4},
      {title:'5x5',object:self,selector:'addTableWithSize:',param:5}
    ];
    self.popoverController = MNUtil.getPopoverAndPresent(sender, commandTable,200)
  },
  addTableWithSize: function (size) {
    let sizeString
    switch (size) {
      case 2:
        sizeString = `|   |   |
| - | - |
|   |   |`
        break;
      case 3:
        sizeString = `|   |   |   |
| - | - | - |
|   |   |   |
|   |   |   |`
        break;
      case 4:
        sizeString =`|   |   |   |   |
| - | - | - | - |
|   |   |   |   |
|   |   |   |   |
|   |   |   |   |`
        break;
      case 5:
        sizeString = `|   |   |   |   |   |
| - | - | - | - | - |
|   |   |   |   |   |
|   |   |   |   |   |
|   |   |   |   |   |
|   |   |   |   |   |`
        break;
      default:
        break;
    }
    self.runJavaScript(`editor.insertValue(\`${sizeString}\`,true)`)

  },
  addmore: function (sender) {
    var commandTable = [
      {title:'Italic',object:self,selector:'addMoreWithType:',param:"Italic"},
      {title:'Strike',object:self,selector:'addMoreWithType:',param:"Strike"},
      {title:'Quote',object:self,selector:'addMoreWithType:',param:"Quote"},
      {title:'Line',object:self,selector:'addMoreWithType:',param:"Line"},
      {title:'Latex block',object:self,selector:'addMoreWithType:',param:"Latex"},
      {title:'Mindmap block',object:self,selector:'addMoreWithType:',param:"Mindmap"},
      {title:'Remove link',object:self,selector:'removeLinkFormat:',param:"Mindmap"},
      {title:'➕  Create Subpage',object:self,selector:'createChildNote:',param:"selection"},
      {title:'➕  Create Subpage & Edit',object:self,selector:'createChildNote:',param:"selectionAndEdit"},
      // {title:'Html Block',object:self,selector:'addMoreWithType:',param:"Html Block"}
    ];
    self.popoverController = MNUtil.getPopoverAndPresent(sender, commandTable,200)
  },
  removeLinkFormat: async function () {
    if (self.popoverController) {self.popoverController.dismissPopoverAnimated(true);}
    self.runJavaScript(`editor.updateValue(editor.getSelection())`)
    // await self.runJavaScript(`editor.updateValue(\`${selection}\`)`)
    // MNUtil.copy(selection)
    // //对于markdown链接，只保留文本，移除链接格式
    // if (/^\[.*?\]\(.+?\)/.test(selection)) {
    // }else{
    //   MNUtil.showHUD("No link found")
    // }
  },
  createChildNote: async function (source) {
    if (self.popoverController) {self.popoverController.dismissPopoverAnimated(true);}
    if (self.editorNoteId) {
      let note = MNNote.new(self.editorNoteId)
      let selection = await self.runJavaScript(`editor.getSelection()`)
      if (!selection || selection.trim() === "") {
        MNUtil.showHUD("No selection")
        return
      }
      let child = note.createChildNote({title:selection,color:note.colorIndex})
      switch (source) {
        case "selection":
          await self.runJavaScript(`editor.updateValue(\`[${selection}](${child.noteURL})\`)`)
          break;
        case "selectionAndEdit":
          await self.runJavaScript(`editor.updateValue(\`[${selection}](${child.noteURL})\`)`)
          await self.save(self.editorNoteId)
          self.setContent(child)
          break;
        default:
          break;
      }
      // let note = MNNote.new(self.editorNoteId)
      // let selection = await self.runJavaScript(`editor.getSelection()`)
      // let child = note.createChildNote({title:selection})
      // await self.runJavaScript(`editor.updateValue(\`[${selection}](${child.noteURL})\`)`)
      // await self.save(self.editorNoteId)
      // self.setContent(child)
    }
  },
  replaceSelection: async function (content) {
    if (self.popoverController) {self.popoverController.dismissPopoverAnimated(true);}
    if (self.editorNoteId) {
      let note = MNNote.new(self.editorNoteId)
      let selection = await self.runJavaScript(`editor.getSelection()`)
      let child = note.createChildNote({title:selection})
      self.runJavaScript(`editor.updateValue(\`[${selection}](${child.noteURL})\`)`)
    }
  },
  addMoreWithType: async function (type) {
    if (self.popoverController) {self.popoverController.dismissPopoverAnimated(true);}
    switch (type) {
      case "Italic":
        self.runJavaScript(`triggerKey('i','KeyI',73,true)`)
        break;
      case "Strike":
        self.runJavaScript(`triggerKey('s','KeyS',83,true)`)
        break;
      case "Quote":
        self.runJavaScript(`triggerKey(';','Semicolon',186,true)`)
        break;
      case "Line":
        self.runJavaScript(`triggerKey('h','KeyH',72,true,true)`)
        break;
      case "Latex":
        self.runJavaScript(`editor.insertValue(\`$$\`,true)`)
        break;

      case "Mindmap":
        let block = "```mindmap\n- A\n  - a\n  - b\n```"
        self.runJavaScript(`insertValue(\`${encodeURIComponent(block)}\`,true)`)
        break;
      case "Html Block":
        self.runJavaScript(`insertValue(\`${encodeURIComponent("<div><font>text</font></div>")}\`,false)`)
        break;
      default:
        break;
    }
  },
  homeButtonTapped: function() {
    if (self.popoverController) {self.popoverController.dismissPopoverAnimated(true);}
    self.clearContent()
  },
  searchButtonTapped: async function(button) {
  try {
    let focusNote = MNNote.getFocusNote()
    if (focusNote) {
      self.setContent(focusNote)
    }else{
      let docControllers = MNUtil.docControllers
      if (docControllers.length > 1) {
        var commandTable = docControllers.map(docController=>{
          let md5 = docController.docMd5
          let docName = docController.document.docTitle
          return {title:docName,object:self,selector:'openAttach:',param:md5}
        })
        self.popoverController = MNUtil.getPopoverAndPresent(button, commandTable,300)
        return
      }
      let docMd5 = MNUtil.currentDocmd5
      let docName = MNUtil.currentDocController.document.docTitle
      let fileURL = editorUtils.bufferFolder+docMd5+".md"
      // let docName = MNUtil.getDocById(docMd5).docTitle
      MNUtil.showHUD("Open Attachment of Doc: "+docName)
      self.targetURL = fileURL
      self.editorNoteId = undefined
      self.refreshBackgroundColor()
      
      let content = editorUtils.getAttachContentByMD5(docMd5)
      if (content) {
        self.runJavaScript(`setValue(\`${encodeURIComponent(content)}\`)`)
      }else{
        self.runJavaScript(`setValue(\`\`)`)
      }
      // if (MNUtil.isfileExists(fileURL)) {
      //   let data = NSData.dataWithContentsOfFile(fileURL)
      //   let test = CryptoJS.enc.Base64.parse(data.base64Encoding())
      //   let content = CryptoJS.enc.Utf8.stringify(test);
      //   // MNUtil.copy(content)
      //   self.runJavaScript(`setValue(\`${encodeURIComponent(content)}\`)`)
      // }else{
      //   self.runJavaScript(`setValue(\`\`)`)
      // }
    }
    // self.runJavaScript(`setValue(\`${encodeURIComponent(excerptText)}\`)`)
  } catch (error) {
    editorUtils.addErrorLog(error, "searchButtonTapped")
  }
  },
  showAttachs: function (sender) {
  try {
    if (self.popoverController) {self.popoverController.dismissPopoverAnimated(true);}
    let content = NSFileManager.defaultManager().contentsOfDirectoryAtPath(MNUtil.dbFolder+"/veditor")
    let mdContents = content.filter(file=>(/\.md$/.test(file) && file.length > 60))
    let docInfo = mdContents.map(file=>{
      let res = editorUtils.getDocNameFromAttach(file)
      return res
    })
    var commandTable = docInfo.map(doc=>{
      return {title:doc.name,object:self,selector:'openAttach:',param:doc.md5}
    })
    if (commandTable.length === 0) {
      MNUtil.showHUD("No attachments")
      return
    }
    self.popoverController = MNUtil.getPopoverAndPresent(sender, commandTable,400,1)
  } catch (error) {
    editorUtils.addErrorLog(error, "showAttachs")
  }
  },
  openAttach: function (md5) {
    if (self.popoverController) {self.popoverController.dismissPopoverAnimated(true);}
    let fileURL = editorUtils.bufferFolder+md5+".md"
    self.targetURL = fileURL
    self.editorNoteId = undefined
    self.refreshBackgroundColor()
    
    let content = editorUtils.getAttachContentByMD5(md5)
    if (content) {
      self.runJavaScript(`setValue(\`${encodeURIComponent(content)}\`)`)
    }else{
      self.runJavaScript(`setValue(\`\`)`)
    }
    MNUtil.openDoc(md5)
    // if (MNUtil.isfileExists(fileURL)) {
    //   let data = NSData.dataWithContentsOfFile(fileURL)
    //   let test = CryptoJS.enc.Base64.parse(data.base64Encoding())
    //   let content = CryptoJS.enc.Utf8.stringify(test);
    //   // MNUtil.copy(content)
    //   self.runJavaScript(`setValue(\`${encodeURIComponent(content)}\`)`)
    // }else{
    //   self.runJavaScript(`setValue(\`\`)`)
    // }
  },
  newAttach: function (md5) {
    if (self.popoverController) {self.popoverController.dismissPopoverAnimated(true);}
    let fileURL = editorUtils.bufferFolder+md5+".md"
    self.targetURL = fileURL
    self.editorNoteId = undefined
    self.refreshBackgroundColor()
    self.runJavaScript(`setValue(\`\`)`)
  },
  goBackButtonTapped: function() {
    self.runJavaScript(`triggerKey('z','KeyZ',90,true)`)
    // self.runJavaScript(`triggerEvent('z')`)
    // self.webview.goBack();
  },
  goForwardButtonTapped: function() {
    self.runJavaScript(`triggerKey('y','KeyY',89,true)`)
    // self.runJavaScript(`triggerEvent('y')`)

    // self.runJavaScript(`document.getElementsByClassName("vditor-reset")[0].dispatchEvent(redoEvent)`)
    // self.webview.goForward();
  },
  refreshButtonTapped: async function(para) {
    let noteTime = Date.parse(MNNote.new(self.editorNoteId).modifiedDate)
    if (noteTime > self.editorNoteTime) {
      let confirm = await MNUtil.confirm("Note has been edited. Show edited note content?", "笔记已被编辑。是否使用编辑后的内容刷新？")
      if (confirm) {
        self.setContent(MNNote.new(self.editorNoteId))
      }else{
        self.runJavaScript(`refresh()`)
      }
    }else{
      let res = await self.runJavaScript(`try {
      refresh()
    } catch (error) {
      error.toString()
    }`)
    }

    // if (self.editorNoteId) {
    //   self.setContent(MNNote.new(self.editorNoteId))
    //   return
    // }

    // if (self.targetURL) {
    //   let data = NSData.dataWithContentsOfFile(self.targetURL)
    //   let test = CryptoJS.enc.Base64.parse(data.base64Encoding())
    //   let content = CryptoJS.enc.Utf8.stringify(test);
    //   // MNUtil.copy(content)
    //   self.runJavaScript(`setValue(\`${encodeURIComponent(content)}\`)`)
    // }
    // if (self.webview.loading) {
    //   self.webview.stopLoading();
    //   self.refreshButton.setImageForState(editorUtils.reloadImage,0)
    //   self.changeButtonOpacity(1.0)
    //   self.isLoading = false;
    // }else{
    //   self.webview.reload();
    // }
  },
  dynamicButtonTapped: function() {
    if (self.popoverController) {self.popoverController.dismissPopoverAnimated(true);}
    // self.popoverController.dismissPopoverAnimated(true);
    // self.switchView();
    editorConfig.dynamic = !editorConfig.dynamic;
    editorConfig.save("MNBrowser_dynamic")
  },
  toggleCommentEditting: async function () {
    editorConfig.config.includingComments = !editorConfig.getConfig("includingComments")
    self.configSearch.setTitleForState("Including comments: "+(editorConfig.getConfig("includingComments")?"✅":"❌"),0)
    editorConfig.save("MNEditor_config")
  },
  toggleToolbar: async function (params) {
    editorConfig.config.toolbar = !editorConfig.getConfig("toolbar")
    // self.editorNoteId = undefined
    // self.targetURL = undefined
    self.toolbarOn.setTitleForState("Top toolbar: "+(editorConfig.getConfig("toolbar")?"✅":"❌"),0)
    // editorConfig.moveEditor()
    let content = await self.getContent()
    editorConfig.save("MNEditor_config")
    self.loadVditor(content)

  },
  toggleShowOnEdit: function (params) {
    if (!editorUtils.checkSubscribe(false,true,true)) {
      return
    }
    editorConfig.config.showOnNoteEdit = !editorConfig.getConfig("showOnNoteEdit")
    self.replaceEditOn.setTitleForState("Show on Editing Note: "+(editorConfig.getConfig("showOnNoteEdit")?"✅":"❌"),0)
    editorConfig.save("MNEditor_config")
  },
  // toggleImageHost: async function () {
  //   editorConfig.config.base64ToR2URL = !editorConfig.getConfig("base64ToR2URL")
  //   self.imageHostButton.setTitleForState("Cloudflare imageHost: "+(editorConfig.getConfig("base64ToR2URL")?"✅":"❌"),0)
  //   let subscribed = editorUtils.checkSubscribe(false,false)
  //   self.runJavaScript(`base64ToR2URL = ${editorConfig.getConfig("base64ToR2URL")};subscribed = ${subscribed}`)
  //   // self.runJavaScript(`base64ToR2URL = `+editorConfig.config.base64ToR2URL)
  //   editorConfig.save("MNEditor_config")
  // },
  toggleUploadOnEdit: async function () {
    editorConfig.config.uploadOnEdit = !editorConfig.getConfig("uploadOnEdit")
    self.uploadOnEditButton.setTitleForState("On Edit: "+(editorConfig.getConfig("uploadOnEdit")?"✅":"❌"),0)
    // let subscribed = editorUtils.checkSubscribe(false,false,true)//只看当天是否订阅
    self.runJavaScript(`base64ToR2URL = ${editorConfig.getConfig("uploadOnEdit")};`)
    // self.runJavaScript(`base64ToR2URL = `+editorConfig.config.base64ToR2URL)
    editorConfig.save("MNEditor_config")
  },
  toggleUploadOnSave: async function () {
    editorConfig.config.uploadOnSave = !editorConfig.getConfig("uploadOnSave")
    self.uploadOnSaveButton.setTitleForState("On Save: "+(editorConfig.getConfig("uploadOnSave")?"✅":"❌"),0)
    // let subscribed = editorUtils.checkSubscribe(false,false)
    // self.runJavaScript(`base64ToR2URL = ${editorConfig.getConfig("base64ToR2URL")};subscribed = ${subscribed}`)
    // self.runJavaScript(`base64ToR2URL = `+editorConfig.config.base64ToR2URL)
    editorConfig.save("MNEditor_config")
  },
  forceToClose: async function () {
    let self = getEditorController()
    if (self.popoverController) {self.popoverController.dismissPopoverAnimated(true);}
    if (self.endFrame) {
      self.hide(self.endFrame,false)
      self.loadVditor(undefined,true)
      return
    }
    if (self.addonBar) {
      self.hide(self.addonBar.frame,false)
      self.loadVditor(undefined,true)
      return
    }
    self.hide(undefined,false)
    self.loadVditor(undefined,true)
  },
  closeButtonTapped: async function() {
    let self = getEditorController()

//     self.runJavaScript(`setValue("");editor.disabled()`)
// return
    self.exit()
  },
  closeInlineLinkTapped: function () {
    self.inlineLinkView.hidden = true
    // self.inlineLinkInput.resignFirstResponder()
    MNUtil.delay(0.01).then(()=>{
      self.focus()
    })
  },
 closeConfigTapped: function () {
    let preOpacity = self.settingView.layer.opacity
    UIView.animateWithDurationAnimationsCompletion(0.2,()=>{
      self.settingView.layer.opacity = 0
    },()=>{
      self.settingView.layer.opacity = preOpacity
      self.settingView.hidden = true
    })
 },
 splitScreen: function (mode) {
  if (self.popoverController) {self.popoverController.dismissPopoverAnimated(true);}
  self.lastFrame = self.view.frame
  self.custom = true;
  self.customMode = mode
  editorConfig.dynamic = false;
  self.webview.hidden = false
  self.hideAllButton()
  MNUtil.animate(()=>{
    self.setSplitScreenFrame(mode)
  },0.3).then(()=>{
    self.showAllButton()
  })
 },
  maxButtonTapped: function() {
    if (self.customMode === "full") {
      self.customMode = "none"
      self.custom = false;
      self.hideAllButton()
      MNUtil.animate(()=>{
        self.setFrame(self.lastFrame)
      },0.3).then(()=>{
        self.showAllButton()
      })
      return
    }
    const frame = MNUtil.studyView.bounds
    self.lastFrame = self.view.frame
    self.customMode = "full"
    self.custom = true;
    editorConfig.dynamic = false;
    self.webview.hidden = false
    self.hideAllButton()
    MNUtil.animate(()=>{
      if (editorUtils.isIOS()) {
        self.setFrame(5,5,frame.width-10,frame.height-10)
      }else{
        self.setFrame(40,50,frame.width-80,frame.height-70)
      }
    },0.3).then(()=>{
      self.showAllButton()
    })
  },
  minButtonTapped: function() {
    editorConfig.dynamic = false;
    self.miniMode = true
    let studyFrame = MNUtil.studyView.bounds
    let studyCenter = MNUtil.studyView.center.x
    let viewCenter = self.view.center.x
    if (viewCenter>studyCenter || (self.customMode === "full" && self.custom)) {
      self.toMinimode(MNUtil.genFrame(studyFrame.width-40,self.view.frame.y,40,40))
    }else{
      self.toMinimode(MNUtil.genFrame(0,self.view.frame.y,40,40))
    }
  },
  onMoveGesture:function (gesture) {
    editorConfig.dynamic = false;
    let locationToMN = gesture.locationInView(MNUtil.studyView)
    if (!self.locationToButton || !self.miniMode && (Date.now() - self.moveDate) > 100) {
      // self.appInstance.showHUD("state:"+gesture.state, self.view.window, 2);
      let translation = gesture.translationInView(MNUtil.studyView)
      let locationToBrowser = gesture.locationInView(self.view)
      let locationToButton = gesture.locationInView(gesture.view)
      let newY = locationToButton.y-translation.y 
      let newX = locationToButton.x-translation.x
      if (gesture.state === 1) {
        self.locationToBrowser = {x:locationToBrowser.x-translation.x,y:locationToBrowser.y-translation.y}
        self.locationToButton = {x:newX,y:newY}
      }
    }
    self.moveDate = Date.now()
    let location = {x:locationToMN.x - self.locationToButton.x-gesture.view.frame.x,y:locationToMN.y -self.locationToButton.y-gesture.view.frame.y}

    // let location = editorUtils.getNewLoc(gesture)
    let frame = self.view.frame
    var viewFrame = self.view.bounds;
    let studyFrame = MNUtil.studyView.bounds
    let y = location.y
    if (y<=0) {
      y = 0
    }
    if (y>=studyFrame.height-15) {
      y = studyFrame.height-15
    }
    let x = location.x
    if (!self.miniMode) {
      if (locationToMN.x<40) {
        self.toMinimode(MNUtil.genFrame(0,locationToMN.y,40,40))
        return
      }
      if (locationToMN.x>studyFrame.width-40) {
        self.toMinimode(MNUtil.genFrame(studyFrame.width-40,locationToMN.y,40,40))
        return
      }
    }else{
      if (locationToMN.x<50) {
        self.view.frame = MNUtil.genFrame(0,locationToMN.y-20,40,40)
        return
      }else if (locationToMN.x>studyFrame.width-50) {
        self.view.frame = MNUtil.genFrame(studyFrame.width-40,locationToMN.y-20,40,40)
        return
      }else if (locationToMN.x>50) {
        let preOpacity = self.view.layer.opacity
        self.view.layer.opacity = 0
        self.hideAllButton()
        MNUtil.animate(()=>{
          self.view.layer.opacity = preOpacity
          self.setFrame(x,y,self.lastFrame.width,self.lastFrame.height)
        }).then(()=>{
          self.moveButton.frame = MNUtil.genFrame(viewFrame.x + viewFrame.width*0.5-75,viewFrame.y+5,150,10)
          self.view.layer.borderWidth = 0
          self.view.backgroundColor = MNUtil.hexColorAlpha("#9bb2d6",0.)
          // self.view.layer.borderColor = MNUtil.hexColorAlpha("#9bb2d6",0.8)
          self.view.hidden = false
          self.webview.hidden = false
          self.showAllButton()
          self.toolbar.hidden = false
          self.moveButton.setImageForState(undefined,0)

        })
        self.miniMode = false
        return
      }
    }
    
    if (self.custom) {
      // Application.sharedInstance().showHUD(self.custom, self.view.window, 2);
      self.customMode = "None"
      MNUtil.animate(()=>{
        self.setFrame(x,y,self.lastFrame.width,self.lastFrame.height)
        self.moveButton.setImageForState(undefined,0)
      })
    }else{
      self.setFrame(x, y, frame.width,frame.height)
    }
    self.custom = false;
  },
  onResizeGesture:function (gesture) {
    self.custom = false;
    editorConfig.dynamic = false;
    self.customMode = "none"
    let baseframe = gesture.view.frame
    let locationToBrowser = gesture.locationInView(self.view)
    let frame = self.view.frame
    let width = locationToBrowser.x+baseframe.width*0.5
    let height = locationToBrowser.y+baseframe.height*0.5
    if (width <= 410) {
      width = 410
    }
    width = editorUtils.getWidth(width)
    if (height <= 100) {
      height = 100
    }
    //  Application.sharedInstance().showHUD(`{x:${translation.x},y:${translation.y}}`, self.view.window, 2);
    //  self.view.frame = {x:frame.x,y:frame.y,width:frame.width+translationX,height:frame.height+translationY}
    self.setFrame(frame.x, frame.y, width,height)
  },
  onLongPress: function(gesture){
    if (self.miniMode) {
      return
    }
    if(gesture.state === 1){
      let button = gesture.view
      try {
        let content = NSFileManager.defaultManager().contentsOfDirectoryAtPath(MNUtil.dbFolder+"/veditor")
        let mdContents = content.filter(file=>(/\.md$/.test(file) && file.length > 60))
        let docInfo = mdContents.map(file=>{
          let res = editorUtils.getDocNameFromAttach(file)
          // MNUtil.log({message:"getDocNameFromAttach: "+res.name,detail:res})
          return res
        })
        let currentDocmd5 = MNUtil.currentDocmd5
        let hasCurrentDoc = false
        // let currentDocFileURL = editorUtils.bufferFolder+currentDocmd5+".md"
        var commandTable = []
        docInfo.forEach(doc=>{
          if (doc.exists) {
            if (doc.md5 === currentDocmd5) {
              hasCurrentDoc = true
            }
            let targetFileURL = editorUtils.bufferFolder+doc.md5+".md"
            commandTable.push({title:"📝  "+doc.name,object:self,selector:'openAttach:',param:doc.md5,checked:targetFileURL === self.targetURL})
          }else{
            MNUtil.log({message:"ignore: "+doc.name,detail:doc})
          }
        })
        // var commandTable = docInfo.map(doc=>{
        //   if (doc.md5 === currentDocmd5) {
        //     hasCurrentDoc = true
        //   }
        //   let targetFileURL = editorUtils.bufferFolder+doc.md5+".md"
        //   return {title:"📝  "+doc.name,object:self,selector:'openAttach:',param:doc.md5,checked:targetFileURL === self.targetURL}
        // })
        // if (commandTable.length === 0) {
        //   MNUtil.showHUD("No attachments")
        //   return
        // }
        if (!hasCurrentDoc) {
          commandTable.unshift({title:"➕  New attachment for current doc",object:self,selector:'newAttach:',param:currentDocmd5})
        }
        self.setBackgroundColor("#b6d2bc")
        self.popoverController = MNUtil.getPopoverAndPresent(button, commandTable,400,1)
      } catch (error) {
        editorUtils.addErrorLog(error, "onLongPress")
      }
      return
    }
    if(gesture.state === 3){
      self.refreshBackgroundColor()
    }

  },
  onLongPressSave: function(gesture){
    if(gesture.state === 1){
      let button = gesture.view
      var commandTable = [
        {title:'Save to CurrentNote',object:self,selector:'saveTo:',param:"CurrentNote"},
        {title:'Save as NewNote',object:self,selector:'saveTo:',param:"NewNote"},
        {title:'Save as ChildNote',object:self,selector:'saveTo:',param:"ChildNote"},
        {title:'Save as BrotherNote',object:self,selector:'saveTo:',param:"BrotherNote"},
        {title:'Save as Attachment',object:self,selector:'saveToAttach:',param:button},
        {title:'➡️ Mindmap',object:self,selector:'saveToMindmap:',param:button},
        {title:'➡️ Comment',object:self,selector:'saveTo:',param:"Comment"},
      ];
      self.popoverController = MNUtil.getPopoverAndPresent(button, commandTable,200)
      return
    }

  },
  onLongPressRefresh: async function(gesture){
    if(gesture.state === 1){
      // let button = gesture.view
      let content = await self.getContent()
      self.loadVditor(content,true)
    }

  },
  advancedButtonTapped: function (params) {
    self.configView.hidden = true
    self.advanceView.hidden = false

    self.configButton.backgroundColor = MNUtil.hexColorAlpha("#9bb2d6",0.8)
    self.advancedButton.backgroundColor = MNUtil.hexColorAlpha("#457bd3",0.8)

  },
  configButtonTapped: function (params) {
    self.configView.hidden = false
    self.advanceView.hidden = true
    self.configButton.backgroundColor = MNUtil.hexColorAlpha("#457bd3",0.8)
    self.advancedButton.backgroundColor = MNUtil.hexColorAlpha("#9bb2d6",0.8)

  }
});

/** @this {editorController} */
editorController.prototype.updateDeeplOffset = async function() {
  if(!this.webview || !this.webview.window)return;
  // if (Application.sharedInstance().osType !== 1) {
  await this.runJavaScript(getWebJS("updateDeeplOffset"))
  // } else {
  //   this.webview.evaluateJavaScript(
  //     `document.querySelector("#gatsby-focus-wrapper > header").style.display = "none";
  //      document.querySelector("#gatsby-focus-wrapper > footer").style.display = "none";
  //      document.getElementsByClassName("TranslatorPage-module--otherSections--3cbQ7")[0].style.display = "none";`,
  //     (ret) => {}
  //   );
  // }
  let ret = await this.runJavaScript('document.getElementsByClassName("lmt__side_container--target")[0].getBoundingClientRect().top + document.body.scrollTop+document.documentElement.scrollTop;')
  if (ret && !isNaN(parseFloat(ret))) {
    this.webview.scrollView.contentOffset = {x: 0, y: parseFloat(ret) + 0};          
  } else {
    this.webview.scrollView.contentOffset = {x: 0, y: 130};          
  }
  // this.shouldCopy = false
  // this.shouldComment = false
};
/** @this {editorController} */
editorController.prototype.updateBaiduOffset = function() {
  if(!this.webview || !this.webview.window)return;
  this.runJavaScript(`document.getElementsByClassName("new-header")[0].style.display = "none";`)
  this.shouldCopy = false
  this.shouldComment = false
};

/** @this {editorController} */
editorController.prototype.updateBingOffset = function() {
  if(!this.webview || !this.webview.window)return;
  this.runJavaScript(`document.getElementById("bnp_container").style.display = "none";`)
};

/** @this {editorController} */
editorController.prototype.updateYoudaoOffset = async function() {
  if(!this.webview || !this.webview.window)return;
  await this.runJavaScript(`document.getElementsByClassName("top-download")[0].style.display = "none";
    document.getElementsByClassName("m-top_vav")[0].style.display = "none";`)
  if (this.shouldCopy || this.shouldComment) {
    let result = await this.runJavaScript(`
    let containers = document.getElementsByClassName("trans-container")
    let explains = Array.from(document.getElementsByClassName("word-exp"))
    if (containers.length === 1) {
      containers[0].getElementsByClassName("trans-content")[0].textContent
    }else{
      explains.map(explain=>explain.textContent).join("\\n")
    }
    `)

    if (!editorUtils.isNSNull(result) && this.shouldCopy) {
      MNUtil.copy(result)
    }
    if (!editorUtils.isNSNull(result) && this.shouldComment) {
      MNUtil.undoGrouping(()=>{
        MNUtil.getNoteById(this.currentNoteId).appendTextComment(ret)
      })
    }
    this.shouldCopy = false
    this.shouldComment = false
  }
};
/** @this {editorController} */
editorController.prototype.updateRGOffset = function() {
  if(!this.webview || !this.webview.window)return;
  this.runJavaScript(`document.getElementsByClassName("header")[0].style.display = "none"`)
  this.shouldCopy = false
  this.shouldComment = false
};

/** @this {editorController} */
editorController.prototype.runJavaScript = async function(script,delay) {
  if(!this.webview || !this.webview.window)return;
  return new Promise((resolve, reject) => {
    if (delay) {
      this.viewTimer = NSTimer.scheduledTimerWithTimeInterval(delay, true, () => {
        this.webview.evaluateJavaScript(script,(result) => {resolve(result)});
      })
    }else{
      this.webview.evaluateJavaScript(script,(result) => {resolve(result)});
    }
  })
};
/**
 * 
 * @param {MNNote|MbBookNote} note 
 */
editorController.prototype.setContent = async function (note,delay = 0) {
  if(delay){
    await MNUtil.delay(delay)
  }
  // MNUtil.copy(note)
  if (note) {
    if (note.groupNoteId || (note.note && note.note.groupNoteId)) {
      if (note.groupNoteId) {
        this.editorNoteId = note.groupNoteId
      }else{
        this.editorNoteId = note.note.groupNoteId
      }
      let temNote = MNNote.new(this.editorNoteId)
      if (temNote) {
        note = temNote
      }
      // MNUtil.copy(note)
      // MNUtil.copy(this.editorNoteId)
    }else{
      this.editorNoteId = note.noteId
    }
    this.editorNoteTime = Date.now();
  }else{
    return
  }
try {
  this.targetURL = undefined
  let hasBase64 = false
  let title = note.noteTitle ?? ""
  if (title.trim()) {
    title = title.split(";").filter(t=>{
      if (/{{.*}}/.test(t)) {
        return false
      }
      return true
    }).join(";")
  }
  let textFirst = note.textFirst
  let excerptText = note.excerptText ?? ""
  if (note.excerptPic && !textFirst) {
    //似乎只有在留白下才会有mask属性
    if (note.excerptPic.mask) {
      MNUtil.showHUD("不支持手写留白!")
      this.editorNoteId = undefined
      return
    }
    //手写会有drawing属性，即使已经擦除了
    if (note.excerptPic.drawing) {
      MNUtil.showHUD("不支持手写摘录!")
      this.editorNoteId = undefined
      return
    }
    //paint指图片
    if (note.excerptPic.paint) {
      hasBase64 = true
      let imageData = MNUtil.getMediaByHash(note.excerptPic.paint)
      let imageSize = UIImage.imageWithData(imageData).size
      if (imageData) {
        if (imageSize.width === 1 && imageSize.height === 1) {
          //do nothing
        }else{
          let imageURL = editorUtils.getMNImageURL(note.excerptPic.paint)
          excerptText = `![image.png](${imageURL})\n`
        }
      }
    }
  }
  if (editorConfig.getConfig("includingComments") && note.comments.length) {
    note.comments.forEach(comment=>{
      switch (comment.type) {
        case "TextNote":
          if (editorUtils.isLinkComment(comment) || editorUtils.isTagComment(comment)) {
            //do nothing
          }else{
            excerptText = excerptText+"\n\n"+comment.text
          }
          break;
        case 'PaintNote':
          if (comment.paint && !comment.drawing) {
            hasBase64 = true
            let imageURL = editorUtils.getMNImageURL(comment.paint)
            excerptText = excerptText+"\n\n"+`![image.png](${imageURL})\n`
          }
          break;
        //合并的卡片
        case "LinkNote":
          if (comment.q_hpic && (comment.q_hpic.mask || comment.q_hpic.drawing)) {
            break;
          }
          if (comment.q_hpic && comment.q_hpic.paint && !textFirst) {
            let imageData = MNUtil.getMediaByHash(comment.q_hpic.paint)
            let imageSize = UIImage.imageWithData(imageData).size
            if (imageSize.width === 1 && imageSize.height === 1) {
              //do nothing
            }else{
              let imageURL = editorUtils.getMNImageURL(comment.q_hpic.paint)
              excerptText = excerptText+`\n\n---\n![image.png](${imageURL})\n`
              break;
            }
          }
          if (comment.q_htext && comment.q_htext.trim()) {
            let commentNote = MNUtil.db.getNoteById(comment.noteid)
            if (commentNote) {
              excerptText = excerptText+"\n\n---\n\n"+comment.q_htext
            }else{
              excerptText = excerptText+"\n\n"+comment.q_htext
            }
          }
        default:
          break;
      }
    })
  }
  excerptText = editorUtils.highlightEqualsContentReverse(excerptText)
  excerptText = this.replaceBase64WithLocalBuffer(excerptText)
  excerptText = this.replaceMNImagesWithLocalBuffer(excerptText)
  let content = "# "+title+"\n"+excerptText
  this.contentOnOpen = content.trim()
  // MNUtil.copy(this.contentOnOpen)
  this.runJavaScript(`setValue(\`${encodeURIComponent(content.trim())}\n\n\`);editor.focus()`)
  this.refreshBackgroundColor()
  // this.view.becomeFirstResponder()
  
} catch (error) {
  editorUtils.addErrorLog(error, "setContent")
}
}
/**
 * 
 * @param {MNNote|MbBookNote} note 
 */
editorController.prototype.clearContent = function () {
  this.editorNoteId = undefined
  this.targetURL = undefined
  this.runJavaScript(`setValue("");`)
  this.refreshBackgroundColor()
  // MNUtil.showHUD("resign")
  this.webview.resignFirstResponder()
  MNUtil.studyView.becomeFirstResponder()
}

/** @this {editorController} */
editorController.prototype.getCurrentURL = async function() {
  if(!this.webview || !this.webview.window) return;
  let url = await this.runJavaScript(`window.location.href`)
  this.webview.url = url
  return url
};
/** @this {editorController} */
editorController.prototype.getSelectedTextInWebview = async function() {
  let ret = await this.runJavaScript(`
      function getCurrentSelect(){

      let selectionObj = null, rangeObj = null;
      let selectedText = "", selectedHtml = "";

      if(window.getSelection){
        selectionObj = window.getSelection();
        selectedText = selectionObj.toString();
      }
      return selectedText
    };
      getCurrentSelect()
    `)
  return ret
}

/** @this {editorController} */
editorController.prototype.getTextInWebview = async function() {
  let ret = await this.runJavaScript(`
      function getSelectOrWholeText(){

      let selectionObj = null, rangeObj = null;
      let selectedText = "", selectedHtml = "";

      if(window.getSelection){
        selectionObj = window.getSelection();
        selectedText = selectionObj.toString();
        return selectedText === ""?document.body.innerText:selectedText
      }else{
        return document.body.innerText;
      }
    };
    getSelectOrWholeText()
    // document.body.innerHTML;
    `)
  return ret
}

/** @this {editorController} */
editorController.prototype.changeButtonOpacity = function(opacity) {
    this.toolbar.layer.opacity = opacity
    this.moveButton.layer.opacity = opacity
    this.maxButton.layer.opacity = opacity
    this.minButton.layer.opacity = opacity
    this.closeButton.layer.opacity = opacity
}

/** @this {editorController} */
editorController.prototype.setButtonLayout = function (button,targetAction) {
    button.autoresizingMask = (1 << 0 | 1 << 3);
    button.setTitleColorForState(UIColor.whiteColor(),0);
    button.setTitleColorForState(this.highlightColor, 1);
    button.backgroundColor = MNUtil.hexColorAlpha("#9bb2d6",0.8);
    button.layer.cornerRadius = 8;
    button.layer.masksToBounds = true;
    if (targetAction) {
      button.addTargetActionForControlEvents(this, targetAction, 1 << 6);
    }
    this.view.addSubview(button);
}

/** @this {editorController} */
editorController.prototype.createButton = function (buttonName,targetAction,superview) {
    this[buttonName] = UIButton.buttonWithType(0);
    this[buttonName].autoresizingMask = (1 << 0 | 1 << 3);
    this[buttonName].setTitleColorForState(UIColor.whiteColor(),0);
    this[buttonName].setTitleColorForState(this.highlightColor, 1);
    this[buttonName].backgroundColor = MNUtil.hexColorAlpha("#9bb2d6",0.8)
    this[buttonName].layer.cornerRadius = 8;
    this[buttonName].layer.masksToBounds = true;
    this[buttonName].titleLabel.font = UIFont.systemFontOfSize(16);

    if (targetAction) {
      this[buttonName].addTargetActionForControlEvents(this, targetAction, 1 << 6);
    }
    if (superview) {
      this[superview].addSubview(this[buttonName])
    }else{
      this.view.addSubview(this[buttonName]);
    }
}

/** @this {editorController} */
editorController.prototype.settingViewLayout = function (){
    let viewFrame = this.view.bounds
    let width = viewFrame.width
    let height = viewFrame.height
    this.settingView.frame = {x:1,y:20,width:width-2,height:height-50}
    this.configView.frame = MNUtil.genFrame(0,40,width-2,height-60)
    this.advanceView.frame = MNUtil.genFrame(0,40,width-2,height-60)

    let settingFrame = this.settingView.bounds
    settingFrame.x = 5
    settingFrame.y = 5
    settingFrame.height = 40
    settingFrame.width = settingFrame.width-10
    this.tabView.frame = settingFrame
    settingFrame.width = 80
    settingFrame.y = 10
    settingFrame.x = 10
    settingFrame.height = 30
    this.configButton.frame = settingFrame
    this.configSearch.frame = MNUtil.genFrame(10,10, width-20, 35)
    this.toolbarOn.frame = MNUtil.genFrame(10,50, width-20, 35)
    this.replaceEditOn.frame = MNUtil.genFrame(10.,90, width-20, 35)
    this.opacityButton.frame = MNUtil.genFrame(10.,130, width-20, 35)
    this.imageHostButton.frame = MNUtil.genFrame(10,50, width-20, 35)
    this.uploadOnSaveButton.frame = MNUtil.genFrame(10,90, (width-25)/2., 35)
    this.uploadOnEditButton.frame = MNUtil.genFrame(15+(width-25)/2.,90, (width-25)/2., 35)

    settingFrame.x = 95
    settingFrame.width = 90
    this.advancedButton.frame = settingFrame
    settingFrame.x = width - 42
    settingFrame.width = 30
    this.closeConfig.frame = settingFrame
}

/** @this {editorController} */
editorController.prototype.createSettingView = function (){
try {
  

  this.configMode = 0
  this.settingView = UIView.new()
  this.settingView.backgroundColor = UIColor.whiteColor().colorWithAlphaComponent(0.8)
  this.settingView.layer.cornerRadius = 13
  this.settingView.hidden = true
  this.view.addSubview(this.settingView)
  this.tabView = UIView.new()
  this.tabView.backgroundColor = MNUtil.hexColorAlpha("#9bb2d6",0.8)
  this.tabView.layer.cornerRadius = 12
  this.settingView.addSubview(this.tabView)

  this.configView = UIView.new()
  this.configView.backgroundColor = MNUtil.hexColorAlpha("#9bb2d6",0.0)
  this.configView.layer.cornerRadius = 12
  this.settingView.addSubview(this.configView)

  this.advanceView = UIView.new()
  this.advanceView.backgroundColor = MNUtil.hexColorAlpha("#9bb2d6",0.0)
  this.advanceView.layer.cornerRadius = 12
  this.settingView.addSubview(this.advanceView)
  this.advanceView.hidden = true


  this.createButton("configButton","configButtonTapped:","settingView")
  this.configButton.backgroundColor = MNUtil.hexColorAlpha("#457bd3",0.8)
  this.configButton.layer.opacity = 1.0
  this.configButton.setTitleForState("Config",0)

  this.createButton("advancedButton","advancedButtonTapped:","settingView")
  // this.advancedButton.backgroundColor = MNUtil.hexColorAlpha("#457bd3",0.8)
  this.advancedButton.layer.opacity = 1.0
  this.advancedButton.setTitleForState("Advanced",0)

  this.createButton("closeConfig","closeConfigTapped:","settingView")
  this.closeConfig.setImageForState(editorUtils.stopImage,0)
  MNButton.setColor(this.closeConfig, "#e06c75")

  this.createButton("configSearch","toggleCommentEditting:","configView")
  this.configSearch.layer.opacity = 1.0
  this.configSearch.setTitleForState("Including comments: "+(editorConfig.getConfig("includingComments")?"✅":"❌"),0)
  this.configSearch.backgroundColor = MNUtil.hexColorAlpha("#457bd3",0.8)

  this.createButton("toolbarOn","toggleToolbar:","configView")
  this.toolbarOn.layer.opacity = 1.0
  this.toolbarOn.setTitleForState("Top toolbar: "+(editorConfig.getConfig("toolbar")?"✅":"❌"),0)
  this.toolbarOn.backgroundColor = MNUtil.hexColorAlpha("#457bd3",0.8)

  //当编辑时是否弹出菜单
  this.createButton("replaceEditOn","toggleShowOnEdit:","configView")
  this.replaceEditOn.layer.opacity = 1.0
  this.replaceEditOn.setTitleForState("Show on Editing Note: "+(editorConfig.getConfig("showOnNoteEdit")?"✅":"❌"),0)
  this.replaceEditOn.backgroundColor = MNUtil.hexColorAlpha("#457bd3",0.8)

  this.createButton("opacityButton","changeOpacity:","configView")
  this.opacityButton.layer.opacity = 1.0
  this.opacityButton.setTitleForState("Opacity: "+(this.view.layer.opacity*100)+"%",0)
  this.opacityButton.backgroundColor = MNUtil.hexColorAlpha("#457bd3",0.8)

  this.createButton("imageHostButton","toggleImageHost:","configView")
  this.imageHostButton.layer.opacity = 1.0
  this.imageHostButton.hidden = true
  this.imageHostButton.setTitleForState("Upload to Cloudflare imageHost",0)
  this.imageHostButton.backgroundColor = MNUtil.hexColorAlpha("#457bd3",0.8)

  this.createButton("uploadOnEditButton","toggleUploadOnEdit:","configView")
  this.uploadOnEditButton.layer.opacity = 1.0
  this.uploadOnEditButton.hidden = true
  this.uploadOnEditButton.setTitleForState("On edit: "+(editorConfig.getConfig("uploadOnEdit")?"✅":"❌"),0)
  this.uploadOnEditButton.backgroundColor = MNUtil.hexColorAlpha("#457bd3",0.8)

  this.createButton("uploadOnSaveButton","toggleUploadOnSave:","configView")
  this.uploadOnSaveButton.hidden = true
  this.uploadOnSaveButton.layer.opacity = 1.0
  this.uploadOnSaveButton.setTitleForState("On save: "+(editorConfig.getConfig("uploadOnSave")?"✅":"❌"),0)
  this.uploadOnSaveButton.backgroundColor = MNUtil.hexColorAlpha("#457bd3",0.8)
} catch (error) {
  MNUtil.showHUD(error)
}

}

/** @this {editorController} */
editorController.prototype.setSplitScreenFrame = function (mode) {  
  let studyFrame = MNUtil.studyView.bounds
  let height = studyFrame.height;
  let width = studyFrame.width;
  let targetMode = mode
  if (editorUtils.isIOS()) {
    targetMode = "full"
  }
  let splitLine = MNUtil.splitLine ?? width/2.
  switch (mode) {
  case "left":
    this.view.frame = MNUtil.genFrame(40,0,splitLine-40,height)
    break;
  case "left13":
    this.view.frame = MNUtil.genFrame(40,0,width/3.+40,height)
    break;
  case "right":
    this.view.frame = MNUtil.genFrame(splitLine,0,width-splitLine-40,height)
    break;
  case "right13":
    this.view.frame = MNUtil.genFrame(width*2/3.-40,0,width/3.,height)
    break;
  case "full":
    if (editorUtils.isIOS()) {
      this.view.frame = MNUtil.genFrame(5,5,width-10,height-5)
    }else{
      this.view.frame = MNUtil.genFrame(40,0,width-80,height)
    }
    break;
  default:
    break;
  }
  this.currentFrame = this.view.frame
}
/** @this {editorController} */
editorController.prototype.toMinimode = function (frame) {
  this.miniMode = true 
  editorConfig.dynamic = false    
  this.lastFrame = this.view.frame 
  this.webview.hidden = true
  this.currentFrame  = this.view.frame
  this.hideAllButton()
  if (this.editorNoteId) {
    this.view.backgroundColor = MNUtil.hexColorAlpha("#b5b5f5",0.3)
  }else if(this.targetURL){
    this.view.backgroundColor = MNUtil.hexColorAlpha("#b6d2bc",0.3)
  }else{
    this.view.backgroundColor = MNUtil.hexColorAlpha("#9bb2d6",0.3)
  }
  // this.view.layer.borderWidth = 3
  // this.view.layer.borderColor = MNUtil.hexColorAlpha("#9bb2d6",0.8)
  MNUtil.animate(()=>{
    this.setFrame(frame)
  },0.25).then(()=>{
    this.moveButton.frame = MNUtil.genFrame(0,0,40,40)
    this.moveButton.hidden = false
    this.moveButton.setImageForState(editorUtils.editImage,0)
  })
}
/** @this {editorController} */
editorController.prototype.refreshLayout = function () {
  if (this.settingView.hidden) {
    let preOpacity = this.settingView.layer.opacity
    this.settingView.layer.opacity = 0.2
    // this.settingView.hidden = false
    this.settingView.layer.opacity = preOpacity
  }

}
/** @this {editorController} */
editorController.prototype.hideAllButton = function (frame) {
  this.moveButton.hidden = true
  this.closeButton.hidden = true
  this.maxButton.hidden = true
  this.minButton.hidden = true
  this.toolbar.hidden = true
}
/** @this {editorController} */
editorController.prototype.showAllButton = function (frame) {
  this.moveButton.hidden = false
  this.closeButton.hidden = false
  this.maxButton.hidden = false
  this.minButton.hidden = false
  this.toolbar.hidden = false
}
/** @this {editorController} */
editorController.prototype.show = function (beginFrame,endFrame) {
  this.view.frame = this.currentFrame
  let preFrame = this.currentFrame
  if (endFrame) {
    preFrame = endFrame
  }
  let studyFrame = MNUtil.studyView.frame
  if (preFrame.width > studyFrame.width) {
    preFrame.width = studyFrame.width
  }
  preFrame.x = editorUtils.getX(preFrame.x)
  preFrame.y = editorUtils.getY(preFrame.y)
  preFrame.width = editorUtils.getWidth(preFrame.width)
  let preOpacity = this.view.layer.opacity
  
  // studyController().view.bringSubviewToFront(this.view)
  this.view.layer.opacity = 0.2
  if (beginFrame) {
    let adjustBeginFrame = MNUtil.genFrame(beginFrame.x, beginFrame.y-5, beginFrame.width, beginFrame.height+40)
    this.endFrame = beginFrame
    this.setFrame(adjustBeginFrame)
  }else{
    this.endFrame = undefined
  }
  this.view.hidden = false
  // if (this.miniMode) {
  //   this.webview.layer.borderWidth = 0
  // }else{
  //   this.webview.layer.borderWidth = 3
  // }
  this.miniMode = false
  this.webview.hidden = false
  this.hideAllButton()
  this.saveButton.hidden = false
  MNUtil.animate(()=>{
    this.view.layer.opacity = preOpacity
    this.setFrame(preFrame)
  },0.25).then(()=>{
        // this.webview.loadFileURLAllowingReadAccessToURL(
        //   NSURL.fileURLWithPath(editorUtils.bufferFolder + 'veditor.html'),
        //   NSURL.fileURLWithPath(editorUtils.bufferFolder)
        // );
    MNUtil.studyView.bringSubviewToFront(this.view)
    this.webview.layer.borderWidth = 0
    this.view.layer.borderWidth = 0
    this.view.backgroundColor = MNUtil.hexColorAlpha("#9bb2d6",0.)
    this.webview.hidden = false
    this.showAllButton()
    // let subscribed = editorUtils.checkSubscribe(false,false)
    // this.runJavaScript(`base64ToR2URL = ${editorConfig.getConfig("uploadOnEdit")}`)
    // this.setMode(editorConfig.getConfig("mode"),false)

    // this.runJavaScript('editor.focus()')
  })
}
/** @this {editorController} */
editorController.prototype.hide = async function (endFrame,checkSave = true) {
  try {

  let preFrame = this.view.frame
  let preOpacity = this.view.layer.opacity
  let preCustom = this.custom
  // let preFrame = this.view.frame
  // this.view.frame = adjustPreframe
  this.webview.hidden = false
  if (this.settingView) {
    this.settingView.hidden = true
  }
  this.hideAllButton()
  this.custom = false
  // this.view.backgroundColor = MNUtil.hexColorAlpha("#9bb2d6",0.3)
  // if (endFrame) {
  //   this.webview.layer.borderWidth = 3
  // }
  await MNUtil.animate(()=>{
    this.view.layer.opacity = 0.2
    if (endFrame) {
      // MNUtil.copy(endFrame)
      let adjustEndFrame = MNUtil.genFrame(endFrame.x, endFrame.y-5, endFrame.width, endFrame.height+40)
      this.setFrame(adjustEndFrame)
    }
  })
  this.view.hidden = true;
  this.view.layer.opacity = preOpacity      
  this.setFrame(preFrame)
  this.webview.layer.borderWidth = 0
  this.custom = preCustom
  await MNUtil.delay(0.1)
  this.blur()
  if (checkSave) {
    if (this.editorNoteId) {
      let content = await this.getContent(undefined,false)
      try {
        if ((content !== undefined) && (!content.trim() || content.trim() === "#")) {
          MNUtil.undoGrouping(()=>{
            MNUtil.db.deleteBookNote(this.editorNoteId)
          })
          return
        }
      } catch (error) {
        editorUtils.addErrorLog(error, "checkShouldDeleteNote")
      }
      if (editorUtils.checkIsDifferent(this.contentOnOpen, content)) {
        // MNUtil.showHUD("different")
        await this.save(this.editorNoteId)
      }
    }
    if (this.targetURL) {
      await this.saveToAttach(this.targetURL)
    }
  }
  this.clearContent()
  this.targetURL = undefined
  this.editorNoteId = undefined
  } catch (error) {
    editorUtils.addErrorLog(error, "hide")
  }
}
/** @this {editorController} */
editorController.prototype.setFrame = function(x,y,width,height){
    if (typeof x === "object") {
      this.view.frame = x
    }else{
      this.view.frame = MNUtil.genFrame(x, y, width, height)
    }
    this.currentFrame = this.view.frame
  }
/** @this {editorController} */
editorController.prototype.setBackgroundColor= function (color) {
  this.headingButton.backgroundColor = MNUtil.hexColorAlpha(color,0.8);
  this.goForwardButton.backgroundColor = MNUtil.hexColorAlpha(color,0.8);
  this.goBackButton.backgroundColor = MNUtil.hexColorAlpha(color,0.8);
  this.saveButton.backgroundColor = MNUtil.hexColorAlpha(color,0.8);
  this.searchButton.backgroundColor = MNUtil.hexColorAlpha(color,0.8);
  this.refreshButton.backgroundColor = MNUtil.hexColorAlpha(color,0.8);
  this.listButton.backgroundColor = MNUtil.hexColorAlpha(color,0.8);
  this.boldButton.backgroundColor = MNUtil.hexColorAlpha(color,0.8);
  this.linkButton.backgroundColor = MNUtil.hexColorAlpha(color,0.8);
  this.codeButton.backgroundColor = MNUtil.hexColorAlpha(color,0.8);
  this.tableButton.backgroundColor = MNUtil.hexColorAlpha(color,0.8);
  this.moreButton.backgroundColor = MNUtil.hexColorAlpha(color,0.8);
  this.moveButton.backgroundColor = MNUtil.hexColorAlpha(color,0.8);
  this.closeButton.backgroundColor = MNUtil.hexColorAlpha(color,0.8);
  this.maxButton.backgroundColor = MNUtil.hexColorAlpha(color,0.8);
  this.minButton.backgroundColor = MNUtil.hexColorAlpha(color,0.8);
  this.view.layer.borderColor = MNUtil.hexColorAlpha(color,0.8)
  this.webview.layer.borderColor = MNUtil.hexColorAlpha(color,0.8)

}

/** @this {editorController} */
editorController.prototype.save  = async function(noteId,removeComment = true) {
try {
  if (!noteId || !MNUtil.db.getNoteById(noteId)) {
    MNUtil.showHUD("No note to save")
    return
  }
  let content = await this.getContent()
  await this.blur()

  // if () {
    
  // }
  content = editorUtils.highlightEqualsContent(content)

  this.contentOnOpen = content
  let hasTitle = /^#/.test(content)
  let focusNote = MNNote.new(noteId)
  let shouldTextFirst = false
  if (focusNote.excerptPic && !focusNote.textFirst) {
    focusNote.textFirst = true
  }
  let targetToSet = []
  let indexToRemove = []
  let contents
    if (editorConfig.getConfig("includingComments") && removeComment && focusNote.comments.length) {
      focusNote.comments.map((comment,index)=>{
        switch (comment.type) {
          case "TextNote":
            if (editorUtils.isLinkComment(comment) || editorUtils.isTagComment(comment)) {
              //do nothing
            }else{
              indexToRemove.push(index)
            }
            break;
          case 'PaintNote':
            if (comment.paint && !comment.drawing) {
              indexToRemove.push(index)
            }
            break;
          case "LinkNote":
            let commentNote = MNUtil.db.getNoteById(comment.noteid)
            if (!commentNote) {
              indexToRemove.push(index)
              break
            }
            if (comment.q_htext && comment.q_htext.trim()) {
              targetToSet.push(index)
            }
            if (comment.q_hpic && !comment.q_hpic.mask && !comment.q_hpic.drawing) {
              shouldTextFirst = true
            }
            // if (comment.q_htext && !comment.q_hpic) {
            //   indexToRemove.push(index)
            // }
            break;
          default:
            break;
        }
      })
    }

  MNUtil.undoGrouping(()=>{
    focusNote.excerptTextMarkdown = true
    if (/!\[.*?\]\((data:image\/.*;base64,.*?)(\))/.test(content)) {
      focusNote.excerptText = content
      focusNote.note.processMarkdownBase64Images()
      content = focusNote.excerptText
    }
    if (indexToRemove.length) {
      let commentsLength = focusNote.comments.length
      for (let i = commentsLength-1; i >= 0; i--) {
        if (indexToRemove.includes(i)) {
          focusNote.removeCommentByIndex(i)
        }
      }
    }
    if (hasTitle) {
      let newTitle = content.split("\n")[0].replace(/^#\s?/g,"")
      let contentRemain = content.split("\n").slice(1).join("\n").trim()
      let headingNames = editorUtils.headingNamesFromMarkdown(contentRemain)
      if (headingNames.length) {
        focusNote.noteTitle = newTitle+";"+headingNames.map(h=>"{{"+h+"}}").join(";")
      }else{
        focusNote.noteTitle = newTitle
      }
      if (focusNote.excerptPic?.paint) {
        // MNUtil.copy(contentRemain)
        let hash = focusNote.excerptPic.paint
        let imageURL = editorUtils.getMNImageURL(hash)
        let imageURL2 = `![image.png](${imageURL})`
        if (contentRemain.startsWith(imageURL2)) {
          // MNUtil.showHUD("Should save image")
          contentRemain = contentRemain.slice(imageURL2.length).trim()
          shouldTextFirst = false
          focusNote.textFirst = false
          focusNote.excerptTextMarkdown = false
          focusNote.excerptsText = ""
          // contentRemain = contentRemain.split("\n").slice(1).join("\n").trim()
          if (targetToSet.length) {
            contents = contentRemain.split("\n---\n")
            if (contents[0].trim()) {
              focusNote.appendMarkdownComment(contents[0],0)
            }
            // focusNote.excerptText = contents[0]
          }else{
            if (contentRemain.trim()) {
              focusNote.appendMarkdownComment(contentRemain,0)
            }
          }
        }else{
          if (targetToSet.length) {
            contents = contentRemain.split("\n---\n")
            focusNote.excerptText = contents[0]
          }else{
            focusNote.excerptText = contentRemain
          }
        }
      }else{
        if (targetToSet.length) {
          contents = contentRemain.split("\n---\n")
          focusNote.excerptText = contents[0]
        }else{
          focusNote.excerptText = contentRemain
        }
      }
    }else{
      focusNote.noteTitle = ""
      if (targetToSet.length) {
        contents = content.split("\n---\n")
        focusNote.excerptText = contents[0]
      }else{
        focusNote.excerptText = content
      }
    }
    if (targetToSet.length) {
      targetToSet.map((targetIndex,contentsIndex)=>{
        let comment = focusNote.comments[targetIndex]
        let mergedNote = MNNote.new(comment.noteid)
        if (mergedNote) {
          mergedNote.note.excerptTextMarkdown = true
          // mergedNote.focusInMindMap()
          // let temNote = MNNote.new(mergedNote.note.originNoteId)
          // MNUtil.copyJSON({a:mergedNote.excerptTextMarkdown,b:temNote.excerptTextMarkdown})
          // temNote.focusInMindMap()
          // temNote.note.excerptTextMarkdown = true
          // temNote.excerptText = contents[contentsIndex+1]
          mergedNote.excerptText = contents[contentsIndex+1]
          // mergedNote.note.processMarkdownBase64Images()
        }

      })
    }
    this.editorNoteTime = Date.now()
    // focusNote.note.excerptTextMarkdown = true


  })

  return
} catch (error) {
  editorUtils.addErrorLog(error, "save")
}
  // MNUtil.delay(3).then(()=>{
  //   MNUtil.app.refreshAfterDBChanged(MNUtil.currentNotebookId)
  // })
}

/** @this {editorController} */
editorController.prototype.checkAndPrepareR2URL = async function(markdown) {
if (!editorConfig.getConfig("uploadOnSave")) {
  return markdown
}
try {
  
    // 匹配 base64 图片链接的正则表达式
    const base64ImagePattern = /!\[.*?\]\((data:image\/png;base64,.*?)(\))/g;
    let images = []
    // 处理 Markdown 字符串，替换每个 base64 图片链接
    const result = markdown.replace(base64ImagePattern, (match, base64Str,p2) => {
      // 你可以在这里对 base64Str 进行替换或处理
      let imageData = editorUtils.imageDataFromBase64(base64Str)
      let md5 = MNUtil.MD5(imageData.base64Encoding())
      if (md5 in editorUtils.imageBuffer) {
        
      }else{
        images.push({md5:md5,data:imageData})
        editorUtils.imageBuffer[md5] = false
      }
      // editorUtils.sendRequest(request)
      // let compressedImageBase64 = `data:image/jpeg;base64,`+editorUtils.compressedImageDataBase64FromBase64(base64Str)
      return match.replace(base64Str, editorUtils.getR2URL(md5));
      // return
      // let imageData = NSData.dataWithContentsOfURL(MNUtil.genNSURL(base64Str))
      // let compressedImageData = UIImage.imageWithData(imageData).jpegData(0.5).base64Encoding()
      // // MNUtil.copy("Before: "+base64Str.length+";after: "+compressedImageData.length)
      // return match.replace(base64Str, `data:image/jpeg;base64,`+compressedImageData);
    });
    if (images.length) {
      this.saveButton.layer.opacity = 0.5
      for (let i = 0; i < images.length; i++) {
        const imageInfo = images[i];
        let fileName = imageInfo.md5 + ".png"
        let imageData = imageInfo.data
        let res = await editorUtils.uploadFileToR2(imageData, fileName,false)
        editorUtils.imageBuffer[imageInfo.md5] = true
      }
      this.saveButton.layer.opacity = 1.0
    }
  return result;
} catch (error) {
  editorUtils.addErrorLog(error, "checkAndPrepareR2URL")
  return undefined
}
}

/** @this {editorController} */
editorController.prototype.replaceBase64ImagesWithR2 = async function(markdown,checkConfig = true) {
if (checkConfig && !editorConfig.getConfig("uploadOnSave")) {
  return markdown
}
try {
    let shouldOverWritten = false
    // 匹配 base64 图片链接的正则表达式
    const base64ImagePattern = /!\[.*?\]\((data:image\/png;base64,.*?)(\))/g;
    let images = []
    // 处理 Markdown 字符串，替换每个 base64 图片链接
    const result = markdown.replace(base64ImagePattern, (match, base64Str,p2) => {
      // 你可以在这里对 base64Str 进行替换或处理
      shouldOverWritten = true
      let imageData = NSData.dataWithContentsOfURL(MNUtil.genNSURL(base64Str))
      let md5 = MNUtil.MD5(imageData.base64Encoding())
      if (md5 in editorUtils.imageBuffer) {
        // MNUtil.showHUD("Pass")
      }else{
        images.push({md5:md5,data:imageData})
      }
      // editorUtils.sendRequest(request)
      // let compressedImageBase64 = `data:image/jpeg;base64,`+editorUtils.compressedImageDataBase64FromBase64(base64Str)
      return match.replace(base64Str, editorUtils.getR2URL(md5));
      // return
      // let imageData = NSData.dataWithContentsOfURL(MNUtil.genNSURL(base64Str))
      // let compressedImageData = UIImage.imageWithData(imageData).jpegData(0.5).base64Encoding()
      // // MNUtil.copy("Before: "+base64Str.length+";after: "+compressedImageData.length)
      // return match.replace(base64Str, `data:image/jpeg;base64,`+compressedImageData);
    });
    // if (shouldOverWritten) {
    //   this.runJavaScript(`editor.disabled()`)
    // }
    if (images.length) {
      MNUtil.showHUD("Uploading image")
      for (let i = 0; i < images.length; i++) {
        const imageInfo = images[i];
        if (imageInfo.md5 in editorUtils.imageBuffer) {
          if (!editorUtils.imageBuffer[imageInfo.md5]) {
            await MNUtil.delay(0.5)
          }
        }else{
          editorUtils.imageBuffer[imageInfo.md5] = false
          let fileName = imageInfo.md5 + ".png"
          let imageData = imageInfo.data
          let res = await editorUtils.uploadFileToR2(imageData, fileName,true)
          editorUtils.imageBuffer[imageInfo.md5] = true
        }
      }
      await MNUtil.delay(0.5)
    }
    // if (shouldOverWritten) {
    //   this.runJavaScript(`setValue(\`${encodeURIComponent(result)}\`);editor.enable()`)
    // }
  return result;
} catch (error) {
  editorUtils.addErrorLog(error, "replaceBase64ImagesWithR2")
  return undefined
}
}

/** @this {editorController} */
editorController.prototype.replaceMNImagesWithBase64 = function(markdown,checkConfig = true) {
try {
    // let shouldOverWritten = false
    let images = []
    // 处理 Markdown 字符串，替换每个 base64 图片链接
    const result = markdown.replace(editorUtils.MNImagePattern, (match, MNImageURL,p2) => {
      // 你可以在这里对 base64Str 进行替换或处理
      // shouldOverWritten = true
      let imageConfig = editorUtils.parseMNImageURL(MNImageURL)
      let hash = imageConfig.hash
      let base64 = MNUtil.getMediaByHash(hash).base64Encoding()
      // let imageData = NSData.dataWithContentsOfURL(MNUtil.genNSURL(base64Str))
      // let md5 = MNUtil.MD5(imageData.base64Encoding())
      // if (md5 in editorUtils.imageBuffer) {
      //   // MNUtil.showHUD("Pass")
      // }else{
      //   images.push({md5:md5,data:imageData})
      // }
      // editorUtils.sendRequest(request)
      // let compressedImageBase64 = `data:image/jpeg;base64,`+editorUtils.compressedImageDataBase64FromBase64(base64Str)
      return match.replace(MNImageURL, `data:image/${imageConfig.type};base64,`+base64);
      // return
      // let imageData = NSData.dataWithContentsOfURL(MNUtil.genNSURL(base64Str))
      // let compressedImageData = UIImage.imageWithData(imageData).jpegData(0.5).base64Encoding()
      // // MNUtil.copy("Before: "+base64Str.length+";after: "+compressedImageData.length)
      // return match.replace(base64Str, `data:image/jpeg;base64,`+compressedImageData);
    });
    // if (shouldOverWritten) {
    //   this.runJavaScript(`editor.disabled()`)
    // }
    // if (images.length) {
    //   MNUtil.showHUD("Uploading image")
    //   for (let i = 0; i < images.length; i++) {
    //     const imageInfo = images[i];
    //     if (imageInfo.md5 in editorUtils.imageBuffer) {
    //       if (!editorUtils.imageBuffer[imageInfo.md5]) {
    //         await MNUtil.delay(0.5)
    //       }
    //     }else{
    //       editorUtils.imageBuffer[imageInfo.md5] = false
    //       let fileName = imageInfo.md5 + ".png"
    //       let imageData = imageInfo.data
    //       let res = await editorUtils.uploadFileToR2(imageData, fileName,true)
    //       editorUtils.imageBuffer[imageInfo.md5] = true
    //     }
    //   }
    //   await MNUtil.delay(0.5)
    // }
    // if (shouldOverWritten) {
    //   this.runJavaScript(`setValue(\`${encodeURIComponent(result)}\`);editor.enable()`)
    // }
  return result;
} catch (error) {
  editorUtils.addErrorLog(error, "replaceBase64ImagesWithR2")
  return undefined
}
}
/** @this {editorController} */
editorController.prototype.replaceMNImagesWithLocalBuffer = function(markdown,checkConfig = true) {
try {
    // let shouldOverWritten = false
    let images = []
    // 处理 Markdown 字符串，替换每个 base64 图片链接
    const result = markdown.replace(editorUtils.MNImagePattern, (match, MNImageURL,p2) => {
      // 你可以在这里对 base64Str 进行替换或处理
      // shouldOverWritten = true
      let imageConfig = editorUtils.parseMNImageURL(MNImageURL)
      let hash = imageConfig.hash
      let imageData = MNUtil.getMediaByHash(hash)
      let fileName = hash+"."+imageConfig.ext
      if (!imageData) {
        return match.replace(MNImageURL, fileName);
      }
      imageData.writeToFileAtomically(editorUtils.bufferFolder+fileName, false)
      // let imageData = NSData.dataWithContentsOfURL(MNUtil.genNSURL(base64Str))
      // let md5 = MNUtil.MD5(imageData.base64Encoding())
      // if (md5 in editorUtils.imageBuffer) {
      //   // MNUtil.showHUD("Pass")
      // }else{
      //   images.push({md5:md5,data:imageData})
      // }
      // editorUtils.sendRequest(request)
      // let compressedImageBase64 = `data:image/jpeg;base64,`+editorUtils.compressedImageDataBase64FromBase64(base64Str)
      return match.replace(MNImageURL, fileName);
      // return
      // let imageData = NSData.dataWithContentsOfURL(MNUtil.genNSURL(base64Str))
      // let compressedImageData = UIImage.imageWithData(imageData).jpegData(0.5).base64Encoding()
      // // MNUtil.copy("Before: "+base64Str.length+";after: "+compressedImageData.length)
      // return match.replace(base64Str, `data:image/jpeg;base64,`+compressedImageData);
    });
  return result;
} catch (error) {
  editorUtils.addErrorLog(error, "replaceBase64ImagesWithR2")
  return undefined
}
}
/** @this {editorController} */
editorController.prototype.replaceBase64WithLocalBuffer = function(markdown,checkConfig = true) {
try {
    // 匹配 base64 图片链接的正则表达式
    const base64ImagePattern = /!\[.*?\]\((data:image\/png;base64,.*?)(\))/g;
    // 处理 Markdown 字符串，替换每个 base64 图片链接
    const result = markdown.replace(base64ImagePattern, (match, base64Str,p2) => {
      // 你可以在这里对 base64Str 进行替换或处理
      // shouldOverWritten = true
      let url = editorUtils.getLocalBufferFromBase64(base64Str)
      return match.replace(base64Str, url);
      // return
      // let imageData = NSData.dataWithContentsOfURL(MNUtil.genNSURL(base64Str))
      // let compressedImageData = UIImage.imageWithData(imageData).jpegData(0.5).base64Encoding()
      // // MNUtil.copy("Before: "+base64Str.length+";after: "+compressedImageData.length)
      // return match.replace(base64Str, `data:image/jpeg;base64,`+compressedImageData);
    });
  return result;
} catch (error) {
  editorUtils.addErrorLog(error, "replaceBase64WithLocalBuffer")
  return undefined
}
}
/** @this {editorController} */
editorController.prototype.replaceLocalBufferWithBase64 = function(markdown,checkConfig = true) {
try {
    // 匹配 缓存图片链接的正则表达式
    const MNImagePattern = /!\[.*?\]\(((?!http|https|data\:image).*?)(\))/g;
    const result = markdown.replace(MNImagePattern, (match, MNImageURL,p2) => {
      // 你可以在这里对 base64Str 进行替换或处理
      // shouldOverWritten = true
      let url = MNImageURL.replace(".png","")
      let imageData = NSData.dataWithContentsOfFile(editorUtils.bufferFolder+MNImageURL)
      url = "data:image/png;base64,"+imageData.base64Encoding()
      return match.replace(MNImageURL, url);
    });
  return result;
} catch (error) {
  // editorUtils.addErrorLog(error, "replaceLocalBufferWithBase64OrMNImage")
  return undefined
}
}
/** @this {editorController} */
editorController.prototype.replaceLocalBufferWithBase64OrMNImage = function(markdown,checkConfig = true) {
try {
    // let shouldOverWritten = false
    // 匹配 缓存图片链接的正则表达式
    const MNImagePattern = /!\[.*?\]\(((?!http|https|data\:image).*?)(\))/g;
    const result = markdown.replace(MNImagePattern, (match, MNImageURL,p2) => {
      // 你可以在这里对 base64Str 进行替换或处理
      // shouldOverWritten = true
      let url = MNImageURL.replace(".png","").replace(".jpg","")
      if (url.startsWith("local_")) {
        let imageData = NSData.dataWithContentsOfFile(editorUtils.bufferFolder+MNImageURL)
        url = "data:image/png;base64,"+imageData.base64Encoding()
      }else{
        url = editorUtils.getMNImageURL(url)
      }
      return match.replace(MNImageURL, url);
    });
  return result;
} catch (error) {
  // editorUtils.addErrorLog(error, "replaceLocalBufferWithBase64OrMNImage")
  return undefined
}
}
editorController.prototype.getURLFromImage = async function (imageData,md5) {
  MNUtil.showHUD("Upload image...")
  let fileName
  if (md5) {
    fileName = md5
  }else{
    let md5 = MNUtil.MD5(imageData.base64Encoding())
    fileName = md5
  }
  let request = await editorUtils.uploadFileToR2(imageData, fileName+".png", true)
  return editorUtils.getR2URL(fileName)
}
/** @this {editorController} */
editorController.prototype.focus = async function (delay=0) {
  if (delay) {
    MNUtil.delay(delay).then(()=>{
      this.runJavaScript(`editor.focus();`)
    })
  }else{
    this.runJavaScript(`editor.focus();`)
  }
}
/** @this {editorController} */
editorController.prototype.blur = async function (delay=0) {
  if (delay) {
    MNUtil.delay(delay).then(()=>{
      this.runJavaScript(`editor.blur();`)
      this.webview.endEditing(true)
    })
  }else{
    this.runJavaScript(`editor.blur();`)
    this.webview.endEditing(true)
  }
}
/** @this {editorController} */
editorController.prototype.getContent = async function (mode,replace=true) {
  let content = await this.runJavaScript('editor.getValue()')
  // MNUtil.log({message:"getContent.before",content:content})
  // let content = await this.runJavaScript(`
  // try {
  //   getMarkdown()
  // } catch (error) {
  //   error.toString()
  // }
  // `)
  if (mode) {
    switch (mode) {
      case "R2":
        return content
      case "base64":
        return this.replaceLocalBufferWithBase64(content)
      default:
        break;
    }
  }
  if (replace) {
    content = await this.replaceBase64ImagesWithR2(content)
    content = await this.replaceLocalBufferWithBase64OrMNImage(content)
  }
  // MNUtil.log({message:"getContent.after",content:content})

  return content
}
/** @this {editorController} */
editorController.prototype.setMode = async function (mode,msg=true) {
  let res
  switch (mode) {
    case "ir":
      editorConfig.config.mode = "ir"
      msg && MNUtil.showHUD("Mode: Instant rendering")
      break;
    case "wysiwyg":
      editorConfig.config.mode = "wysiwyg"
      msg && MNUtil.showHUD("Mode: What you see is what you get")
      break;
    case "sv":
      editorConfig.config.mode = "sv"
      msg && MNUtil.showHUD("Mode: Source mode")
      break;
    default:
      break;
  }
  editorConfig.save("MNEditor_config")
  let content = await self.getContent()
  this.loadVditor(content)
  // MNUtil.showHUD("Reloading editor...")
  // await MNUtil.delay(0.5)
  // await this.runJavaScript(`setValue(\`${encodeURIComponent(content.trim())}\n\n\`);editor.focus()`)
}
/** @this {editorController} */
editorController.prototype.saveToAttach = async function(fileURL){
  let self = getEditorController()
  content = await self.getContent()
  MNUtil.writeText(fileURL, content)
}

/** @this {editorController} */
editorController.prototype.exit = async function () {
try {
  if (this.editorNoteId) {
    if (!MNUtil.db.getNoteById(this.editorNoteId)) {
      MNUtil.showHUD("Note not found")
      return
    }
    let noteTime = Date.parse(MNNote.new(this.editorNoteId).modifiedDate)
    let confirm = true
    if (noteTime > this.editorNoteTime) {
      confirm = await MNUtil.confirm("Note has been edited. Overwrite content and close？", "笔记已被编辑。是否覆盖并退出？")
      if (!confirm) {
        return
      }
    }
    let target
    if (MNUtil.mindmapView && MNUtil.mindmapView.selViewLst) {
      if (this.endFrame && MNUtil.notebookController.outlineView && MNUtil.mindmapView.frame.width === MNUtil.notebookController.outlineView.frame.width) {
        this.hide(this.endFrame,confirm)
        return
      }
      target = MNUtil.mindmapView.selViewLst.find(sel=>sel.note.note.noteId === this.editorNoteId)
      if (target) {
        let noteView = target.view
        let endFrame = noteView.convertRectToView(noteView.bounds, MNUtil.studyView)
        if (endFrame.x > 0 && endFrame.y > 0) {
          this.hide(endFrame,confirm)
          return
        }
        this.hide(this.endFrame,confirm)
        return
      }
    }
    if (MNUtil.floatMindMapView && !MNUtil.floatMindMapView.hidden) {
      target = MNUtil.floatMindMapView.selViewLst.find(sel=>sel.note.note.noteId === this.editorNoteId)
      if (target) {
        let noteView = target.view
        let endFrame = noteView.convertRectToView(noteView.bounds, MNUtil.studyView)
        this.hide(endFrame,confirm)
        return
      }
    }
  }
  if (this.endFrame) {
    this.hide(this.endFrame)
    return
  }
  if (this.addonBar) {
    this.hide(this.addonBar.frame)
    return
  }
  this.hide()
  return
} catch (error) {
  editorUtils.addErrorLog(error, "exit",MNUtil.mindmapView.selViewLst)
  this.hide()
}
}
/**
 * @this {editorController}
 * @param {string|undefined} content 
 */
editorController.prototype.loadVditor = async function (content,force = false) {
  try {
  MNUtil.writeText(editorUtils.bufferFolder + 'veditor.html', `
    <!DOCTYPE html>
<html lang="zh-cmn-Hans" style="height: 0px;">
<head>
    <meta charset="utf-8"/>
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0"/>
    <title>Vditor</title>
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black">
    <script src="veditor.min.js" defer></script>
    <link rel="stylesheet" href="veditor.css" />
    <script src="subfunc.js" defer></script>
</head>
<body>
    <div id="vditor"></div>
    <script>
      window.editorToolbar = ${editorConfig.getConfig("toolbar")}
      window.mode = "${editorConfig.getConfig("mode")}"

    </script>
</body>
</html>`)
this.webview.loadFileURLAllowingReadAccessToURL(
  NSURL.fileURLWithPath(editorUtils.bufferFolder + 'veditor.html'),
  NSURL.fileURLWithPath(editorUtils.bufferFolder)
);
//   this.webview.loadHTMLStringBaseURL(`
//     <!DOCTYPE html>
// <html lang="zh-cmn-Hans" style="height: 0px;">
// <head>
//     <meta charset="utf-8"/>
//     <meta http-equiv="X-UA-Compatible" content="IE=edge">
//     <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0"/>
//     <title>Vditor</title>
//     <meta name="apple-mobile-web-app-capable" content="yes">
//     <meta name="apple-mobile-web-app-status-bar-style" content="black">
//     <script src="veditor.min.js" defer></script>
//     <link rel="stylesheet" href="veditor.css" />
//     <script src="subfunc.js" defer></script>
// </head>
// <body>
//     <div id="vditor"></div>
//     <script>
//       window.editorToolbar = ${editorConfig.getConfig("toolbar")}
//       window.mode = "${editorConfig.getConfig("mode")}"

//     </script>
// </body>
// </html>`,
// NSURL.fileURLWithPath(editorUtils.bufferFolder)
// )
if (content && content.trim()) {
  if(force){
    MNUtil.showHUD("Reloading...")
  }else{
    MNUtil.showHUD("Force reload...")
  }
  await MNUtil.delay(0.5)
  if (MNUtil.appVersion().type === "macOS") {
    this.runJavaScript(`setValue(\`${encodeURIComponent(content.trim())}\n\n\`);editor.focus()`)
  }else{
    this.runJavaScript(`setValue(\`${encodeURIComponent(content.trim())}\n\n\`);`)
  }
}
  } catch (error) {
    editorUtils.addErrorLog(error, "loadVditor")
  }
}
editorController.prototype.refreshBackgroundColor = function () {
  if (this.editorNoteId) {
    this.setBackgroundColor("#b5b5f5")
    return
  }
  if (this.targetURL) {
    this.setBackgroundColor("#b6d2bc")
    return
  }
  this.setBackgroundColor("#9bb2d6")
}
/** @this {editorController} */
editorController.prototype.creatTextView = function (viewName,superview="view",color="#b3bbc0",alpha=0.7) {
  this[viewName] = UITextView.new()
  this[viewName].font = UIFont.systemFontOfSize(15);
  this[viewName].layer.cornerRadius = 8
  this[viewName].backgroundColor = MNUtil.hexColorAlpha(color,alpha)
  this[viewName].textColor = UIColor.blackColor()
  this[viewName].delegate = this
  this[viewName].bounces = true
  this[superview].addSubview(this[viewName])
}

/**
 * @this {editorController}
 * @param {string} viewName
 * @param {string} superview
 * @param {string} color
 * @param {number} alpha
 * @returns {UITextView}
 */
editorController.prototype.creatView = function (viewName,superview="view",color="#9bb2d6",alpha=0.8) {
  this[viewName] = UIView.new()
  this[viewName].backgroundColor = MNUtil.hexColorAlpha(color,alpha)
  this[viewName].layer.cornerRadius = 12
  this[superview].addSubview(this[viewName])
}

/**
 * @this {editorController}
 * @param {string} superview
 * @param {string} color
 * @param {number} alpha
 * @returns {UIScrollView}
 */
editorController.prototype.createScrollview = function (superview="view",color="#c0bfbf",alpha=0.8) {
  let scrollview = UIScrollView.new()
  scrollview.hidden = false
  scrollview.delegate = this
  scrollview.bounces = true
  // scrollview.alwaysBounceVertical = true
  scrollview.layer.cornerRadius = 8
  scrollview.backgroundColor = MNUtil.hexColorAlpha(color,alpha)
  this[superview].addSubview(scrollview)
  return scrollview
}

/**
 * @this {editorController}
 */
editorController.prototype.setButtonText = function (names) {
  try {
    this.words = names
    // MNUtil.copyJSON(names)
    names.map((word,index)=>{
      if (!this["nameButton"+index]) {
        // this["nameButton"+index] = this.createButton("selectNoteAsInlineLink:","inlineLinkScrollview")
        this.createButton("nameButton"+index,"selectNoteAsInlineLink:","inlineLinkScrollview")
        this["nameButton"+index].titleLabel.font = UIFont.systemFontOfSize(16);
      }
      this["nameButton"+index].hidden = false
      this["nameButton"+index].setTitleForState(word,0) 
      this["nameButton"+index].id = word
      this["nameButton"+index].backgroundColor = MNUtil.hexColorAlpha("#7093cb",0.75);
      this["nameButton"+index].isSelected = false
    })
    this.refreshLayout()
  } catch (error) {
    editorUtils.addErrorLog(error, "editorController.setButtonText",{names:names})
  }
}

/**
 * @this {editorController}
 * @param {Object} config
 */
editorController.prototype.openMNURL = async function (config) {
  let noteId = config.pathComponents[0]
  let note = MNNote.new(noteId)
  // editorUtils.log(noteId)
  if (note.parentNoteId === this.editorNoteId) {
    await this.save(this.editorNoteId)
    this.setContent(note)
    // editorUtils.log("should edit")
  }else{
    note.focusInFloatMindMap()
  }
}