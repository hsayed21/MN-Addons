/** @return {monacoController} */
const getMonacoController = ()=>self

var monacoController = JSB.defineClass('monacoController : UIViewController <UIWebViewDelegate>',{
  // /** @self {monacoController} */
  viewDidLoad: function() {
    try {
    

    let self = getMonacoController()
    self.appInstance = Application.sharedInstance();
    self.custom = false;
    self.customMode = "None"
    self.miniMode = false;
    self.shouldCopy = false
    self.shouldComment = false
    self.editorNoteTime = Date.now();
    self.selectedText = '';
    self.webApp = "Bilibili"
    self.project = ""
    self.onAnimate = false
    self.isLoading = false;
    self.theme = "light"
    self.view.frame = {x:50,y:50,width:(self.appInstance.osType !== 1) ? 500 : 365,height:500}
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
    self.view.layer.shadowColor = MNUtil.hexColorAlpha("#7d7d7d", 0.5)
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
    //sidebar
    self.sidebarView = new UIWebView(self.view.bounds);
    self.sidebarView.backgroundColor = UIColor.whiteColor();
    self.sidebarView.scalesPageToFit = true;
    self.sidebarView.autoresizingMask = (1 << 1 | 1 << 4);
    self.sidebarView.delegate = self;
    self.sidebarView.scrollView.delegate = self;
    self.sidebarView.layer.cornerRadius = 15;
    self.sidebarView.layer.masksToBounds = true;
    self.sidebarView.layer.borderColor = MNUtil.hexColorAlpha("#9bb2d6",0.8);
    self.sidebarView.layer.borderWidth = 0
    self.highlightColor = UIColor.blendedColor( MNUtil.hexColorAlpha("#2c4d81",0.8),
      self.appInstance.defaultTextColor,
      0.8
    );

    self.sidebarView.hidden = false;
    self.sidebarView.lastOffset = 0;
    self.view.addSubview(self.sidebarView);

    self.createButton("toolbar")
    self.toolbar.backgroundColor = MNUtil.hexColorAlpha("#727f94",0.)
    self.toolbar.layer.cornerRadius = 0;
    self.toolbar.hidden = true

    self.createButton("headingButton","changeHeading:","toolbar")
    self.headingButton.setImageForState(monacoUtils.webappImage,0)

    self.createButton("listButton","changeList:","toolbar")
    self.listButton.setImageForState(monacoUtils.listImage,0)

    self.createButton("boldButton","changebold:","toolbar")
    self.boldButton.setImageForState(monacoUtils.boldImage,0)

    self.createButton("linkButton","addLink:","toolbar")
    self.linkButton.setImageForState(monacoUtils.linkImage,0)

    self.createButton("codeButton","addcode:","toolbar")
    self.codeButton.setImageForState(monacoUtils.codeImage,0)

    self.createButton("tableButton","exportMNAddon:","toolbar")
    self.tableButton.setImageForState(monacoUtils.tableImage,0)

    self.createButton("moreButton","addmore:")
    self.moreButton.setImageForState(monacoUtils.moreImage,0)

    self.createButton("closeButton","closeButtonTapped:")
    self.closeButton.setTitleForState('✖️', 0);
    self.closeButton.titleLabel.font = UIFont.systemFontOfSize(10);

    self.createButton("maxButton","maxButtonTapped:")
    self.maxButton.setTitleForState('➕', 0);
    self.maxButton.titleLabel.font = UIFont.systemFontOfSize(10);

    self.createButton("minButton","minButtonTapped:")
    self.minButton.setTitleForState('➖', 0);
    self.minButton.titleLabel.font = UIFont.systemFontOfSize(10);

    self.createButton("saveButton","runCode:")
    self.saveButton.setTitleForState('Run', 0);1
    self.saveButton.titleLabel.font = UIFont.boldSystemFontOfSize(17);

    self.createButton("searchButton","search:")
    self.searchButton.setImageForState(monacoUtils.searchImage,0)
    self.searchButton.titleLabel.font = UIFont.boldSystemFontOfSize(17);

    self.createButton("copyButton","copy:")
    self.copyButton.setTitleForState("Copy",0)
    self.copyButton.titleLabel.font = UIFont.boldSystemFontOfSize(17);

    self.createButton("menuButton","showMenu:")
    // self.menuButton.setTitleForState('Menu', 0);1
    self.menuButton.setImageForState(monacoUtils.listImage,0)
    self.menuButton.titleLabel.font = UIFont.boldSystemFontOfSize(17);

    self.createButton("sidebarButton","sidebarButtonTapped:")
    self.sidebarButton.setImageForState(monacoUtils.screenImage,0)

    self.createButton("moveButton","moveButtonTapped:")

    self.createButton("goForwardButton","goForwardButtonTapped:")
    self.goForwardButton.setImageForState(monacoUtils.goforwardImage,0)

    self.createButton("goBackButton","goBackButtonTapped:")
    self.goBackButton.setImageForState(monacoUtils.gobackImage,0)
    // <<< goBack button <<<
    // >>> refresh button >>>
    self.createButton("refreshButton","refreshButtonTapped:","toolbar")
    self.refreshButton.setImageForState(monacoUtils.reloadImage,0)
    // <<< refresh button <<<

    MNButton.addPanGesture(self.menuButton, self, "onResizeGesture:")
    MNButton.addPanGesture(self.moveButton, self, "onMoveGesture:")
  } catch (error) {
    monacoUtils.addErrorLog(error, "viewDidLoad")
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

viewWillLayoutSubviews: function() {
  let self = getMonacoController()
    if (self.miniMode || self.onAnimate) {
      return
    }
    let buttonHeight = 25
    var viewFrame = self.view.bounds;
    var width    = viewFrame.width
    var height   = viewFrame.height
    self.closeButton.frame = MNUtil.genFrame(width-26,0,20,20)
    self.toolbar.frame = MNUtil.genFrame(1, height-25, width-2,buttonHeight)
    self.toolbar.hidden = true
    self.saveButton.frame = {  x: width-53,  y: 27,  width: 46,  height: 25};
    self.searchButton.frame = {  x: width-90,  y: 27, width: 32,  height: 25};
    self.copyButton.frame = {  x: width-150,  y: 27, width: 55,  height: 25};
    self.menuButton.frame = {  x: width-37,  y: height-32,  width: 30,  height: 25};

    if (width <= 440) {
      // self.moveButton.frame = {  x: width*0.5-75,  y: 0,  width: width*0.35,  height: 16};
      self.refreshButton.hidden = false
      self.goBackButton.hidden = false
      self.goForwardButton.hidden = false
      self.headingButton.frame = {  x: 106,  y: 0,  width: 30,  height: buttonHeight,};  
      self.listButton.frame = {  x: 141,  y: 0,  width: 30,  height: buttonHeight,};  
      self.boldButton.frame = {  x: 176,  y: 0,  width: 30,  height: buttonHeight,};  
      self.linkButton.frame = {  x: 211,  y: 0,  width: 30,  height: buttonHeight,};  
      self.codeButton.frame = {  x: 246,  y: 0,  width: 30,  height: buttonHeight,};  
      self.tableButton.frame = {  x: 281,  y: 0,  width: 30,  height: buttonHeight,};  
      // self.moreButton.frame = {  x: 316,  y: 0,  width: 30,  height: buttonHeight,}; 
    }else{
      // self.moveButton.frame = {  x: width*0.5-75,  y: 0,  width: 150,  height: 16};
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
      // self.sidebarButton.frame = {  x: width - 95,  y: 0,  width: 35,  height: buttonHeight};
    }


    self.refreshButton.frame = {  x: 71,  y: 0,  width: 30,  height: buttonHeight,};
    if (width > 700 && !self.testMode()) {
      let sidebarWidth = width*0.25
      if (sidebarWidth > 300) {
        sidebarWidth = 300
      }
      let remainWidth = width-sidebarWidth
      self.moveButton.frame = {  x: sidebarWidth+remainWidth*0.5-75,  y: 0,  width: 150,  height: 20};
      self.minButton.frame = MNUtil.genFrame(sidebarWidth+remainWidth*0.5-100,0,20,20)
      self.maxButton.frame = MNUtil.genFrame(sidebarWidth+remainWidth*0.5+115,0,20,20)
      self.moreButton.frame = MNUtil.genFrame(sidebarWidth+remainWidth*0.5+80,0,30,20)
      self.goBackButton.frame = {  x:sidebarWidth+46,  y: 0,  width: 25,  height: 20,};
      self.goForwardButton.frame = {  x:sidebarWidth+76,  y: 0,  width: 25,  height: 20,};
      self.sidebarButton.setImageForState(undefined,0)
      self.sidebarButton.frame = {  x: sidebarWidth*0.5-40,  y: 0,  width: 80,  height: 20};
      self.sidebarView.frame = {x:1,y:21,width:sidebarWidth,height:height-21}
      self.webview.frame = {x:sidebarWidth+6,y:21,width:width-sidebarWidth-7,height:height-21}
      self.sidebarView.hidden = false
    }else{
      self.moveButton.frame = {  x: width*0.5-75,  y: 0,  width: 150,  height: 20};
      self.minButton.frame = MNUtil.genFrame(width*0.5-100,0,20,20)
      self.maxButton.frame = MNUtil.genFrame(width*0.5+115,0,20,20)
      self.moreButton.frame = MNUtil.genFrame(width*0.5+80,0,30,20)
      self.goBackButton.frame = {  x:41,  y: 0,  width: 25,  height: 20};
      self.goForwardButton.frame = {  x:71,  y: 0,  width: 25,  height: 20};
      self.sidebarButton.setImageForState(monacoUtils.screenImage,0)
      self.sidebarButton.frame = {  x: 7,  y: 27,  width: 30,  height: 25};
      self.sidebarView.frame = {x:1,y:21,width:300,height:height-21}
      self.webview.frame = {x:1,y:21,width:width-2,height:height-21}
      self.sidebarView.hidden = true
    }
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

  },
  webViewDidFailLoadWithError: function(webView, error) {
  },
  webViewShouldStartLoadWithRequestNavigationType: function(webView,request,type){
    // MNUtil.showHUD("message")
    try {
    let self = getMonacoController()
    let requestURL = request.URL().absoluteString()
    let config = MNUtil.parseURL(requestURL)
    switch (config.scheme) {
      case "nativeaction":
        self.executeNativeAction(config.host,config.params)
        return false;
    
      default:
        break;
    }
    if (/^nativeopen\:\/\//.test(requestURL)) {
      let path = decodeURIComponent(requestURL.split("content=")[1])
      if (self.targetURL === monacoUtils.extensionPath+"/"+self.project+"/"+path){
        return
      }
      if (/\.js$/.test(path)) {
        MNUtil.showHUD("Open: "+path)
        self.setContent(monacoUtils.extensionPath+"/"+self.project+"/"+path)
//        self.runJavaScript(`monaco.editor.setModelLanguage(editor.getModel(), 'javascript');`)
        return false
      }
      if (/\.json$/.test(path)) {
        MNUtil.showHUD("Open: "+path)
        self.setContent(monacoUtils.extensionPath+"/"+self.project+"/"+path)
//        self.runJavaScript(`monaco.editor.setModelLanguage(editor.getModel(), 'json');`)
        return false
      }
      if (/\.html$/.test(path)) {
        MNUtil.showHUD("Open: "+path)
        self.setContent(monacoUtils.extensionPath+"/"+self.project+"/"+path)
//        self.runJavaScript(`monaco.editor.setModelLanguage(editor.getModel(), 'html');`)
        return false
      }
      if (/\.css$/.test(path)) {
        MNUtil.showHUD("Open: "+path)
        self.setContent(monacoUtils.extensionPath+"/"+self.project+"/"+path)
//        self.runJavaScript(`monaco.editor.setModelLanguage(editor.getModel(), 'css');`)
        return false
      }
      if (/\.png$/.test(path)) {
        MNUtil.showHUD("Open: "+path)
        let url = monacoUtils.extensionPath+"/"+self.project+"/"+path
        let imageData = NSData.dataWithContentsOfFile(url)
        url = "data:image/png;base64,"+imageData.base64Encoding()
        MNUtil.postNotification("openInBrowser", {url:url})
        return false
      }
      MNUtil.showHUD("Not supported: "+path)
      // MNUtil.copy(path)
      return false
    }
    if (/^editorselect\:\/\//.test(requestURL)) {
      let text = decodeURIComponent(requestURL.split("content=")[1])
      MNUtil.copy(text)
      return false
    }
    if (/^editorcommand\:\/\//.test(requestURL)) {
      let command = decodeURIComponent(requestURL.split("content=")[1])
      switch (command) {
        case "search":
          self.runJavaScript(`editor.trigger('search',"actions.findWithSelection")`)
          break;
        default:
          break;
      }
      return false
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
      let windowFrame = MNUtil.currentWindow.bounds
      if ((beginFrame.x+beginFrame.width*2) < windowFrame.width) {
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
      monacoUtils.addErrorLog(error, "webViewShouldStartLoadWithRequestNavigationType")
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
    self.view.popoverController = MNUtil.getPopoverAndPresent(sender, commandTable,150,2)
  },
  setHeading: function (index) {
    if (self.view.popoverController) {self.view.popoverController.dismissPopoverAnimated(true);}
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
    self.view.popoverController = MNUtil.getPopoverAndPresent(sender, commandTable,120,2)
  },
  setList: function (index) {
    if (self.view.popoverController) {self.view.popoverController.dismissPopoverAnimated(true);}
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
    self.view.popoverController = MNUtil.getPopoverAndPresent(sender, commandTable,250,2)
  },
  moveButtonTapped: function(sender) {
    let self = getMonacoController()
    if (self.miniMode) {
      let preFrame = self.view.frame
      self.view.hidden = true
      self.showAllButton()
      self.setFrame(self.lastFrame)
      self.show(preFrame)
      self.moveButton.setImageForState(undefined,0)
      return
    }
    if (self.clickDate && Date.now() - self.clickDate < 500) {
      self.runJavaScript(`editor.focus();editor.trigger("teset","editor.action.quickOutline")`)
      return
    }
    self.runJavaScript(`editor.focus();editor.trigger("teset","editor.action.quickCommand")`)
    self.clickDate = Date.now()
    return
  },
  copyDocName: function (docName) {
    MNUtil.copy(docName)
  },
  runCode: async function(sender) {
    let self = getMonacoController()
    let code = await self.runJavaScript(`editor.getValue();`)
    if (self.testMode()) {
      if (self.targetURL.endsWith("testCode.html")) {
        MNUtil.postNotification("snipasteHtml", {html:code})
        MNUtil.writeText(self.targetURL, code)
        return
      }
      if (self.targetURL.endsWith("testCode.js")) {
        monacoSandbox.execute(code)
        MNUtil.writeText(self.targetURL, code)
        return
      }
    }
    if (self.targetURL) {
      MNUtil.showHUD("file saved")
      MNUtil.writeText(self.targetURL, code)
      return
    }
  },
  search: async function () {
    let self = getMonacoController()
    await self.runJavaScript(`editor.trigger('search',"actions.findWithSelection");`)
  },
  exportMNAddon: async function (params) {
    try {
    let self = getMonacoController()
    if (self.view.popoverController) {self.view.popoverController.dismissPopoverAnimated(true);}
    if (!self.targetURL) {
      MNUtil.showHUD("No project")
      return
    }
    MNUtil.showHUD("Export...")
    self.save(self.targetURL)
    // MNUtil.copy(MNUtil.tempFolder+"export.mnaddon")
    let addon = MNUtil.readJSON(monacoUtils.extensionPath+"/"+self.project+"/mnaddon.json")
    let id = addon.addonid.split(".").at(-1)
    let version = addon.version.replace(/\./g,"_")
    let title = id+"_"+version
    // ZipArchive.createZipFileAtPathWithFilesAtPaths(path, filenames)
    ZipArchive.createZipFileAtPathWithContentsOfDirectory(MNUtil.tempFolder+title+".mnaddon",monacoUtils.extensionPath+"/"+self.project)
    MNUtil.saveFile(MNUtil.tempFolder+title+".mnaddon", ["public.mnaddon"])
    } catch (error) {
     MNUtil.showHUD(error) 
    }
    //会消耗免费次数
  //   if (monacoUtils.checkSubscribe(true)) {
  // // let content = await self.runJavaScript('editor.getValue()')
  //     let content = await self.getContent("base64")   
  //     MNUtil.copy(content)
  //     let docPath = MNUtil.cacheFolder+"/export.md"
  //     MNUtil.writeText(docPath, content)
  //     let UTI = ["public.md"]
  //     MNUtil.saveFile(docPath, UTI)
  //   }
    // }
  },
  changeOpacity: function(sender) {
    if (self.view.popoverController) {self.view.popoverController.dismissPopoverAnimated(true);}
    var commandTable = [
      {title:'100%',object:self,selector:'changeOpacityTo:',param:1.0},
      {title:'90%',object:self,selector:'changeOpacityTo:',param:0.9},
      {title:'80%',object:self,selector:'changeOpacityTo:',param:0.8},
      {title:'70%',object:self,selector:'changeOpacityTo:',param:0.7},
      {title:'60%',object:self,selector:'changeOpacityTo:',param:0.6},
      {title:'50%',object:self,selector:'changeOpacityTo:',param:0.5}
    ];
    self.view.popoverController = MNUtil.getPopoverAndPresent(sender, commandTable,100,1)
  },
  changeZoom: function(sender) {
    if (self.view.popoverController) {self.view.popoverController.dismissPopoverAnimated(true);}
    var commandTable = [
      {title:'175%',object:self,selector:'changeZoomTo:',param:1.75},
      {title:'150%',object:self,selector:'changeZoomTo:',param:1.5},
      {title:'125%',object:self,selector:'changeZoomTo:',param:1.25},
      {title:'100%',object:self,selector:'changeZoomTo:',param:1.0},
      {title:'75%', object:self,selector:'changeZoomTo:',param:0.75},
      {title:'50%', object:self,selector:'changeZoomTo:',param:0.5}
    ];
    self.view.popoverController = MNUtil.getPopoverAndPresent(sender, commandTable,100,1)
  },
  changeOpacityTo:function (opacity) {
    self.view.layer.opacity = opacity
  },
  changeZoomTo:function (zoom) {
    self.runJavaScript(`document.body.style.zoom = ${zoom}`)
  },
  openSettingView:function () {
    let self = getMonacoController()
    if (self.view.popoverController) {self.view.popoverController.dismissPopoverAnimated(true);}
    // self.settingController.view.hidden = false
    if (!self.settingView) {
      self.createSettingView()
    }
    // if (self.settingView.hidden) {
    //   self.settingView.frame = self.moveButton.frame
    // }
    let preOpacity = self.settingView.layer.opacity
    self.settingView.layer.opacity = 0
    self.settingViewLayout()
    self.settingView.hidden = false
    MNUtil.animate(()=>{
      self.settingView.layer.opacity = preOpacity
    },0.3)

    // self.view.addSubview(self.tabView)
  },
  screenshot: function (width) {
    if (self.view.popoverController) {self.view.popoverController.dismissPopoverAnimated(true);}
    self.webview.takeSnapshotWithWidth(width,(snapshot)=>{
      MNUtil.copyImage(snapshot.pngData())
      MNUtil.showHUD('截图已复制到剪贴板')
    })
  },
  addmore: function (sender) {
  try {
    

    var commandTable = [
      // {title:'Export',object:self,selector:'exportMNAddon:',param:"inline"},
      // {title:'Force to exit',object:self,selector:'forceToExit:',param:"block"},
      {title:'Reload editor',object:self,selector:'reloadWebview:',param:"block"},
      // {title:'Setting',object:self,selector:'openSettingView:',param:'right'},
      {title:'WordWrap',object:self,selector:'toggleWordWrap:',param:'right'},
      {title:'Open testCode.js',object:self,selector:'openTestCode:',param:'js'},
      {title:'Open testCode.html',object:self,selector:'openTestCode:',param:'html'}
    ];
    if (self.testMode()) {
      if (!self.targetURL || self.targetURL.endsWith("testCode.js")) {
        commandTable = commandTable.concat([
          {title:'Save testCode.js',object:self,selector:'saveTestCode:',param:'js'},
          {title:'Copy testCode.js',object:self,selector:'copyTestCode:',param:'js'},
          {title:'Clear testCode.js',object:self,selector:'clearTestCode:',param:'js'}
        ])
      }else if (self.targetURL.endsWith("testCode.html")) {
        commandTable = commandTable.concat([
          {title:'Save testCode.html',object:self,selector:'saveTestCode:',param:'html'},
          {title:'Copy testCode.html',object:self,selector:'copyTestCode:',param:'html'},
          {title:'Clear testCode.html',object:self,selector:'clearTestCode:',param:'html'}
        ])
      }
    }
    self.view.popoverController = MNUtil.getPopoverAndPresent(sender, commandTable,200,1)
    } catch (error) {
    monacoUtils.addErrorLog(error, "addmore")
  }
  },
  openTestCode: function (type) {
    let self = getMonacoController()
    if (self.view.popoverController) {self.view.popoverController.dismissPopoverAnimated(true);}
    switch (type) {
      case "js":
        self.targetURL = monacoUtils.dataFolder+"testCode.js"
        break;
      case "html":
        self.targetURL = monacoUtils.dataFolder+"testCode.html"
        break;
      default:
        break;
    }
    self.setTestContent(type,"#9bb2d6")
  },
  saveTestCode: async function (type) {
    let self = getMonacoController()
    if (self.view.popoverController) {self.view.popoverController.dismissPopoverAnimated(true);}
    let code = await self.runJavaScript(`editor.getValue();`)
    MNUtil.writeText(self.targetURL, code)
    MNUtil.showHUD("File Saved")
  },
  copyTestCode: async function (type) {
    let self = getMonacoController()
    if (self.view.popoverController) {self.view.popoverController.dismissPopoverAnimated(true);}
    let code = await self.runJavaScript(`editor.getValue();`)
    MNUtil.copy(code)
  },
  clearTestCode: function (params) {
    let self = getMonacoController()
    if (self.view.popoverController) {self.view.popoverController.dismissPopoverAnimated(true);}
    self.clearTestContent()
    MNUtil.writeText(monacoUtils.dataFolder+"testCode.js", "")
    MNUtil.showHUD("File Cleared")
  },
  toggleWordWrap: function () {
    let self = getMonacoController()
    if (self.view.popoverController) {self.view.popoverController.dismissPopoverAnimated(true);}
    self.runJavaScript(`toggleWordWrap()`)
  },
  openProject: function (path) {
    let self = getMonacoController()
    self.project = path
    if (self.view.popoverController) {self.view.popoverController.dismissPopoverAnimated(true);}
    let url = monacoUtils.extensionPath+"/"+path+"/main.js"
    self.setContent(url)
    self.setFileList(path)
  },
  newProject: async function () {
    let self = getMonacoController()
    if (self.view.popoverController) {self.view.popoverController.dismissPopoverAnimated(true);}
    // MNUtil.showHUD("Not supported")
    let res = await monacoUtils.input("Addon Name", "AddonId: Lowercase of addon name", ["Cancel","Confirm"])
    if (res.button) {
      let title = res.input
      let addonId = title.replace(/\s|\./g,"_")
      let addonPath = monacoUtils.extensionPath+"/marginnote.extension."+addonId
      NSFileManager.defaultManager().createDirectoryAtPathAttributes(addonPath, undefined)
      let config = {
        "addonid": "marginnote.extension."+addonId,
        "author": "User",
        "title": title,
        "version": "0.0.1",
        "marginnote_version_min": "3.7.11",
        "cert_key": ""
      }
      MNUtil.writeJSON(addonPath+"/mnaddon.json",config)
      MNUtil.writeText(addonPath+"/main.js", monacoUtils.mainJS(addonId))
      NSFileManager.defaultManager().copyItemAtPathToPath(monacoUtils.mainPath+"/example.png", addonPath+"/logo.png")
      MNUtil.showHUD("Creating new addon: "+title)

      self.project = "marginnote.extension."+addonId
      if (self.view.popoverController) {self.view.popoverController.dismissPopoverAnimated(true);}
      let url = addonPath+"/main.js"
      self.setContent(url)
      self.setFileList(self.project)
    }
  },
  sidebarButtonTapped: async function(button) {
  MNUtil.showHUD("Not implemented")
  return
  let subpaths = NSFileManager.defaultManager().contentsOfDirectoryAtPath(monacoUtils.extensionPath)
    subpaths = subpaths.filter(path=>!/\.DS_Store$/.test(path))
    // MNUtil.copyJSON(subpaths)
    var commandTable = subpaths.map(path=>{
      let title = MNUtil.readJSON(monacoUtils.extensionPath+"/"+path+"/mnaddon.json").title
      return {title:"🧩 "+title,object:self,selector:'openProject:',param:path}
    })
    commandTable.unshift({title:"➕ New addon",object:self,selector:'newProject:',param:""})
    self.view.popoverController = MNUtil.getPopoverAndPresent(button, commandTable,200,1)
  },
  showAttachs: function (sender) {
  try {
    if (self.view.popoverController) {self.view.popoverController.dismissPopoverAnimated(true);}
    let content = NSFileManager.defaultManager().contentsOfDirectoryAtPath(MNUtil.dbFolder+"/veditor")
    let mdContents = content.filter(file=>(/\.md$/.test(file) && file.length > 60))
    let docInfo = mdContents.map(file=>{
      let res = monacoUtils.getDocNameFromAttach(file)
      return res
    })
    var commandTable = docInfo.map(doc=>{
      return {title:doc.name,object:self,selector:'openAttach:',param:doc.md5}
    })
    if (commandTable.length === 0) {
      MNUtil.showHUD("No attachments")
      return
    }
    self.view.popoverController = MNUtil.getPopoverAndPresent(sender, commandTable,400,1)
  } catch (error) {
    monacoUtils.addErrorLog(error, "showAttachs")
  }
  },
  openAttach: function (md5) {
    if (self.view.popoverController) {self.view.popoverController.dismissPopoverAnimated(true);}
    let fileURL = monacoUtils.bufferFolder+md5+".md"
    self.targetURL = fileURL
    self.editorNoteId = undefined
    self.setBackgroundColor("#b6d2bc")
    let content = monacoUtils.getAttachContentByMD5(md5)
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
  },
  newAttach: function (md5) {
    let fileURL = monacoUtils.bufferFolder+md5+".md"
    self.targetURL = fileURL
    self.editorNoteId = undefined
    self.setBackgroundColor("#b6d2bc")
    self.runJavaScript(`setValue(\`\`)`)
  },
  copy: function () {
    self.runJavaScript(`copySelection()`)
  },
  showMenu: function (params) {
    // MNUtil.showHUD("Focus")
    // self.runJavaScript(`editor.focus();`)
    self.runJavaScript(`editor.focus();editor.trigger('menu',"editor.action.showContextMenu")`)
  },
  goBackButtonTapped: function() {
    self.runJavaScript(`editor.focus();editor.trigger('undo',"undo")`)
    // self.runJavaScript(`editor.focus();editor.trigger('undo',"editor.action.showContextMenu")`)
    // self.runJavaScript(`triggerEvent('z')`)
    // self.webview.goBack();
  },
  goForwardButtonTapped: function() {
    self.runJavaScript(`editor.focus();editor.trigger('redo',"redo")`)
    // self.runJavaScript(`triggerEvent('y')`)

    // self.runJavaScript(`document.getElementsByClassName("vditor-reset")[0].dispatchEvent(redoEvent)`)
    // self.webview.goForward();
  },
  refreshButtonTapped: async function(para) {
    monacoUtils.restart()
    // let noteTime = Date.parse(MNNote.new(self.editorNoteId).modifiedDate)
    // if (noteTime > self.editorNoteTime) {
    //   let confirm = await MNUtil.confirm("Note has been edited. Show edited note content?", "笔记已被编辑。是否使用编辑后的内容刷新？")
    //   if (confirm) {
    //     self.setContent(MNNote.new(self.editorNoteId))
    //   }else{
    //     self.runJavaScript(`refresh()`)
    //   }
    // }else{
    //   self.runJavaScript(`refresh()`)
    // }
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
    //   self.refreshButton.setImageForState(monacoUtils.reloadImage,0)
    //   self.changeButtonOpacity(1.0)
    //   self.isLoading = false;
    // }else{
    //   self.webview.reload();
    // }
  },
  dynamicButtonTapped: function() {
    if (self.view.popoverController) {self.view.popoverController.dismissPopoverAnimated(true);}
    // self.view.popoverController.dismissPopoverAnimated(true);
    // self.switchView();
    monacoConfig.dynamic = !monacoConfig.dynamic;
  },
  closeButtonTapped: async function() {

//     self.runJavaScript(`setValue("");editor.disabled()`)
// return
    self.exit()
  },
 closeConfigTapped: function () {
  let self = getMonacoController()
  let preOpacity = self.settingView.layer.opacity
  self.onAnimate = true
  MNUtil.animate(()=>{
    // self.settingView.frame = self.moveButton.frame
    self.settingView.layer.opacity = 0
  }).then(()=>{
    self.onAnimate = false
    self.settingView.layer.opacity = preOpacity
    self.settingView.hidden = true
  })
 },
  maxButtonTapped: function() {
    let self = getMonacoController()
    if (self.customMode === "full") {
      self.customMode = "none"
      self.custom = false;
      self.onAnimate = true
      // self.hideAllButton()
      MNUtil.animate(()=>{
        self.setFrame(self.lastFrame)
        if (self.settingView && !self.settingView.hidden) {
          self.settingViewLayout()
        }
      },0.3).then(()=>{
        self.onAnimate = false
        self.showAllButton()
      })
      return
    }
    const frame = MNUtil.currentWindow.bounds
    self.lastFrame = self.view.frame
    self.customMode = "full"
    self.custom = true;
    monacoConfig.dynamic = false;
    self.webview.hidden = false
    self.onAnimate = true
    // self.hideAllButton()
    MNUtil.animate(()=>{
      self.setFrame(0,20,frame.width,frame.height-40)
      if (self.settingView && !self.settingView.hidden) {
        self.settingViewLayout()
      }
      // self.layoutSubviews(MNUtil.genFrame(40,50,frame.width-80,frame.height-70))
    },0.3).then(()=>{
      self.onAnimate = false
      self.showAllButton()
    })
  },
  minButtonTapped: function() {
    monacoConfig.dynamic = false;
    self.miniMode = true
    let windowFrame = MNUtil.currentWindow.bounds
    let windowCenter = MNUtil.currentWindow.center.x
    let viewCenter = self.view.center.x
    if (viewCenter>windowCenter || (self.customMode === "full" && self.custom)) {
      self.toMinimode(MNUtil.genFrame(windowFrame.width-40,self.view.frame.y,40,40))
    }else{
      self.toMinimode(MNUtil.genFrame(0,self.view.frame.y,40,40))
    }
  },
  forceToExit:async function () {
      monacoUtils.restart()
      await MNUtil.delay(1)
      let invalidConfig = {}
      self.view.frame = {x:invalidConfig.x,y:invalidConfig.y,width:invalidConfig.width,height:invalidConfig.height}
  },
  reloadWebview: function(){
    let self = getMonacoController()
    self.webview.loadFileURLAllowingReadAccessToURL(
      NSURL.fileURLWithPath(monacoUtils.bufferFolder + 'index.html'),
      NSURL.fileURLWithPath(monacoUtils.bufferFolder)
    );
  },
  onMoveGesture:function (gesture) {
    monacoConfig.dynamic = false;
    let locationToMN = gesture.locationInView(MNUtil.currentWindow)
    if (!self.locationToButton || !self.miniMode && (Date.now() - self.moveDate) > 100) {
      // self.appInstance.showHUD("state:"+gesture.state, self.view.window, 2);
      let translation = gesture.translationInView(MNUtil.currentWindow)
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

    // let location = monacoUtils.getNewLoc(gesture)
    let frame = self.view.frame
    var viewFrame = self.view.bounds;
    let windowFrame = MNUtil.currentWindow.bounds
    let y = location.y
    if (y<=0) {
      y = 0
    }
    if (y>=windowFrame.height-15) {
      y = windowFrame.height-15
    }
    let x = location.x
    if (!self.miniMode) {
      if (locationToMN.x<40) {
        self.toMinimode(MNUtil.genFrame(0,locationToMN.y,40,40))
        return
      }
      if (locationToMN.x>windowFrame.width-40) {
        self.toMinimode(MNUtil.genFrame(windowFrame.width-40,locationToMN.y,40,40))
        return
      }
    }else{
      if (locationToMN.x<50) {
        self.view.frame = MNUtil.genFrame(0,locationToMN.y-20,40,40)
        return
      }else if (locationToMN.x>windowFrame.width-50) {
        self.view.frame = MNUtil.genFrame(windowFrame.width-40,locationToMN.y-20,40,40)
        return
      }else if (locationToMN.x>50) {
        let preOpacity = self.view.layer.opacity
        self.view.layer.opacity = 0
        self.hideAllButton()
        self.onAnimate = true
        self.miniMode = false
        self.view.backgroundColor = MNUtil.hexColorAlpha("#9bb2d6",0.3)
        MNUtil.animate(()=>{
          self.view.layer.opacity = preOpacity
          self.setFrame(x,y,self.lastFrame.width,self.lastFrame.height)
          self.hideAllButton()
        },0.3).then(()=>{
          self.onAnimate = false
          self.view.backgroundColor = MNUtil.hexColorAlpha("#9bb2d6",0)
          self.moveButton.frame = MNUtil.genFrame(viewFrame.x + viewFrame.width*0.5-75,viewFrame.y+5,150,10)
          // self.view.layer.borderColor = MNUtil.hexColorAlpha("#9bb2d6",0.8)
          self.view.hidden = false
          self.webview.hidden = false
          self.showAllButton()
          self.toolbar.hidden = true
          self.moveButton.setImageForState(undefined,0)
        })
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
    monacoConfig.dynamic = false;
    self.customMode = "none"
    let baseframe = gesture.view.frame
    let locationToBrowser = gesture.locationInView(self.view)
    let frame = self.view.frame
    let width = locationToBrowser.x+baseframe.width*0.5
    let height = locationToBrowser.y+baseframe.height*0.5
    if (width <= 410) {
      width = 410
    }
    if (height <= 500) {
      height = 500
    }
    //  Application.sharedInstance().showHUD(`{x:${translation.x},y:${translation.y}}`, self.view.window, 2);
    //  self.view.frame = {x:frame.x,y:frame.y,width:frame.width+translationX,height:frame.height+translationY}
    self.setFrame(frame.x, frame.y, width,height)
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

/** @this {monacoController} */
monacoController.prototype.updateDeeplOffset = async function() {
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
/** @this {monacoController} */
monacoController.prototype.updateBaiduOffset = function() {
  if(!this.webview || !this.webview.window)return;
  this.runJavaScript(`document.getElementsByClassName("new-header")[0].style.display = "none";`)
  this.shouldCopy = false
  this.shouldComment = false
};

/** @this {monacoController} */
monacoController.prototype.updateBingOffset = function() {
  if(!this.webview || !this.webview.window)return;
  this.runJavaScript(`document.getElementById("bnp_container").style.display = "none";`)
};

/** @this {monacoController} */
monacoController.prototype.updateYoudaoOffset = async function() {
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

    if (!monacoUtils.isNSNull(result) && this.shouldCopy) {
      MNUtil.copy(result)
    }
    if (!monacoUtils.isNSNull(result) && this.shouldComment) {
      MNUtil.undoGrouping(()=>{
        MNUtil.getNoteById(this.currentNoteId).appendTextComment(ret)
      })
    }
    this.shouldCopy = false
    this.shouldComment = false
  }
};
/** @this {monacoController} */
monacoController.prototype.updateRGOffset = function() {
  if(!this.webview || !this.webview.window)return;
  this.runJavaScript(`document.getElementsByClassName("header")[0].style.display = "none"`)
  this.shouldCopy = false
  this.shouldComment = false
};

/** @this {monacoController} */
monacoController.prototype.runJavaScript = async function(script,delay) {
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
/** @this {monacoController} */
monacoController.prototype.runJavaScriptForSidebar = async function(script,delay) {
  if(!this.sidebarView || !this.sidebarView.window)return;
  return new Promise((resolve, reject) => {
    if (delay) {
      this.viewTimer = NSTimer.scheduledTimerWithTimeInterval(delay, true, () => {
        this.sidebarView.evaluateJavaScript(script,(result) => {resolve(result)});
      })
    }else{
      this.sidebarView.evaluateJavaScript(script,(result) => {resolve(result)});
    }
  })
};
/**
 * 
 * @param {string} fileURL 
 * @this {monacoController} 
 */
monacoController.prototype.setContent = async function (fileURL,color = "#b5b5f5") {
try {
  let text = MNUtil.data2string(NSData.dataWithContentsOfFile(fileURL))
  let encoded = encodeURIComponent(text)
  let fileName = MNUtil.getFileName(fileURL)
  this.runJavaScript(`editor.setValue(decodeURIComponent(\`${encoded}\`));setTitle(\`${fileName}\`);`)
  this.targetURL = fileURL
  this.setBackgroundColor(color)
  this.saveButton.setTitleForState('Save', 0);
  this.view.setNeedsLayout()
  
} catch (error) {
  monacoUtils.addErrorLog(error, "setContent")
}
}

/**
 * 
 * @param {string} content 
 * @this {monacoController} 
 */
monacoController.prototype.openWithHtmlContent = async function (content,color = "#b5b5f5") {
try {
  let encoded = encodeURIComponent(content)
  let fileName = "testCode.html"
  this.runJavaScript(`editor.setValue(decodeURIComponent(\`${encoded}\`));setTitle(\`${fileName}\`);`)
  this.setBackgroundColor(color)
  this.saveButton.setTitleForState('Run', 0);
  this.view.setNeedsLayout()
  this.targetURL = monacoUtils.dataFolder+"testCode.html"
  // MNUtil.copy(this.targetURL)
  
} catch (error) {
  monacoUtils.addErrorLog(error, "openWithHtmlContent")
}
}

/**
 * 
 * @param {string} type 
 * @param {string} color 
 * @this {monacoController} 
 */
monacoController.prototype.setTestContent = async function (type,color = "#b5b5f5") {
try {
  let text = ""
  switch (type) {
    case "js":
      this.targetURL = monacoUtils.dataFolder+"testCode.js"
      text = `MNUtil.showHUD("Hello world!")`
      break;
    case "html":
      this.targetURL = monacoUtils.dataFolder+"testCode.html"
      text = `<!DOCTYPE html>
<html>
<head>
  <title>Test Page</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f0f0f0;
      margin: 0;
      padding: 20px;
    }
  </style>
</head>
<body>
  <h1>Hello World</h1>
</body>
</html>
      `
      break;
    default:
      break;
  }
  if (MNUtil.isfileExists(this.targetURL)) {
    text = MNUtil.data2string(NSData.dataWithContentsOfFile(this.targetURL))
  }
  let encoded = encodeURIComponent(text)
  let fileName = MNUtil.getFileName(this.targetURL)
  this.runJavaScript(`editor.setValue(decodeURIComponent(\`${encoded}\`));setTitle(\`${fileName}\`);`)
  this.setBackgroundColor(color)
  this.saveButton.setTitleForState('Run', 0);
  this.view.setNeedsLayout()
  
} catch (error) {
  monacoUtils.addErrorLog(error, "setTestContent")
}
}

/**
 * 
 * @param {string} fileURL 
 * @this {monacoController} 
 */
monacoController.prototype.clearTestContent = async function () {
try {
  let encoded = encodeURIComponent("")
  this.runJavaScript(`editor.setValue(decodeURIComponent(\`${encoded}\`));setTitle(\`testCode.js\`);`)
} catch (error) {
  monacoUtils.addErrorLog(error, "clearTestContent")
}
}

/**
 * 
 * @param {MNNote|MbBookNote} note 
 */
monacoController.prototype.clearContent = function () {
  this.editorNoteId = undefined
  this.targetURL = undefined
  this.runJavaScript(`editor.setValue("");setTitle("Untitled");`)
  this.setBackgroundColor("#9bb2d6")
  this.saveButton.setTitleForState('Run', 0);
  this.webview.resignFirstResponder()
}

/** @this {monacoController} */
monacoController.prototype.getCurrentURL = async function() {
  if(!this.webview || !this.webview.window) return;
  let url = await this.runJavaScript(`window.location.href`)
  this.webview.url = url
  return url
};
/** @this {monacoController} */
monacoController.prototype.getSelectedTextInWebview = async function() {
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

/** @this {monacoController} */
monacoController.prototype.getTextInWebview = async function() {
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

/** @this {monacoController} */
monacoController.prototype.changeButtonOpacity = function(opacity) {
    this.toolbar.layer.opacity = opacity
    this.moveButton.layer.opacity = opacity
    this.maxButton.layer.opacity = opacity
    this.minButton.layer.opacity = opacity
    this.closeButton.layer.opacity = opacity
}

/** @this {monacoController} */
monacoController.prototype.setButtonLayout = function (button,targetAction) {
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

/** @this {monacoController} */
monacoController.prototype.createButton = function (buttonName,targetAction,superview) {
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

/** @this {monacoController} */
monacoController.prototype.settingViewLayout = function (){
    let viewFrame = this.view.bounds
    let width = viewFrame.width
    let height = viewFrame.height
    let x = 1
    let y = 20
    if (width>500) {
      x = width*0.5-250
      width = 500
    }
    if (height>500) {
      if (height > 580) {
        y = 60
      }
      height = 500
    }
    this.settingView.frame = {x:x,y:y,width:width-2,height:height-50}
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
    this.modeButton.frame = MNUtil.genFrame(10,10, (width-25)/2., 35)
    this.configSearch.frame = MNUtil.genFrame(15+(width-25)/2.,10, (width-25)/2., 35)
    this.toolbarOn.frame = MNUtil.genFrame(15+(width-25)/2.,50, (width-25)/2., 35)
    this.replaceEditOn.frame = MNUtil.genFrame(10.,50, (width-25)/2., 35)
    this.imageHostButton.frame = MNUtil.genFrame(10,50, width-20, 35)
    this.uploadOnEditButton.frame = MNUtil.genFrame(15+(width-25)/2.,90, (width-25)/2., 35)

    settingFrame.x = 95
    settingFrame.width = 90
    this.advancedButton.frame = settingFrame
    settingFrame.x = width - 45
    settingFrame.width = 30
    this.closeConfig.frame = settingFrame
}

/** @this {monacoController} */
monacoController.prototype.createSettingView = function (){
try {
  this.configMode = 0
  this.settingView = UIView.new()
  this.settingView.backgroundColor = MNUtil.hexColorAlpha("#666666", 0.8)
  this.settingView.layer.cornerRadius = 13
  this.settingView.hidden = true
  this.settingView.autoresizesSubviews = true
  this.view.addSubview(this.settingView)
  this.tabView = UIView.new()
  this.tabView.backgroundColor = MNUtil.hexColorAlpha("#667790",0.8)
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
  this.closeConfig.setImageForState(monacoUtils.stopImage,0)
  this.closeConfig.backgroundColor = UIColor.whiteColor().colorWithAlphaComponent(0)

  this.createButton("modeButton","toggleEditMode:","configView")
  this.modeButton.layer.opacity = 1.0
  this.modeButton.setTitleForState("Mode: ",0)
  this.modeButton.backgroundColor = MNUtil.hexColorAlpha("#457bd3",0.8)

  this.createButton("configSearch","toggleCommentEditting:","configView")
  this.configSearch.layer.opacity = 1.0
  this.configSearch.setTitleForState("Including comments: ",0)
  this.configSearch.backgroundColor = MNUtil.hexColorAlpha("#457bd3",0.8)

  this.createButton("toolbarOn","toggleToolbar:","configView")
  this.toolbarOn.layer.opacity = 1.0
  this.toolbarOn.setTitleForState("Top toolbar: ",0)
  this.toolbarOn.backgroundColor = MNUtil.hexColorAlpha("#457bd3",0.8)

  this.createButton("replaceEditOn","toggleReplaceEdit:","configView")
  this.replaceEditOn.layer.opacity = 1.0
  this.replaceEditOn.setTitleForState("Replace Popup Edit: ",0)
  this.replaceEditOn.backgroundColor = MNUtil.hexColorAlpha("#457bd3",0.8)

  this.createButton("imageHostButton","toggleImageHost:","configView")
  this.imageHostButton.layer.opacity = 1.0
  this.imageHostButton.hidden = true
  this.imageHostButton.setTitleForState("Upload to Cloudflare imageHost",0)
  this.imageHostButton.backgroundColor = MNUtil.hexColorAlpha("#457bd3",0.8)

  this.createButton("uploadOnEditButton","toggleUploadOnEdit:","configView")
  this.uploadOnEditButton.layer.opacity = 1.0
  this.uploadOnEditButton.hidden = true
  this.uploadOnEditButton.setTitleForState("On edit: ",0)
  this.uploadOnEditButton.backgroundColor = MNUtil.hexColorAlpha("#457bd3",0.8)
} catch (error) {
  MNUtil.showHUD(error)
}

}

/** @this {monacoController} */
monacoController.prototype.toMinimode = function (frame) {
try {
  
  this.miniMode = true 
  monacoConfig.dynamic = false    
  this.lastFrame = this.view.frame 
  this.webview.hidden = true
  this.currentFrame  = this.view.frame
  this.hideAllButton()
  // this.view.layer.borderWidth = 3
  this.view.backgroundColor = MNUtil.hexColorAlpha("#9bb2d6",0.3)
  if (this.settingView) {
    this.settingView.hidden = true
  }
  this.onAnimate = true
  // this.view.layer.borderColor = MNUtil.hexColorAlpha("#9bb2d6",0.8)
  MNUtil.animate(()=>{
    this.setFrame(frame)
  },0.3).then(()=>{
    this.onAnimate = false
    this.moveButton.frame = MNUtil.genFrame(0,0,40,40)
    this.moveButton.hidden = false
    this.view.layer.borderWidth = 0
    this.moveButton.setImageForState(monacoUtils.logo,0)
  })
} catch (error) {
  monacoUtils.addErrorLog(error, "toMinimode")
}
}
/** @this {monacoController} */
monacoController.prototype.refreshLayout = function () {
  if (this.settingView.hidden) {
    let preOpacity = this.settingView.layer.opacity
    this.settingView.layer.opacity = 0.2
    // this.settingView.hidden = false
    this.settingView.layer.opacity = preOpacity
  }

}
/** @this {monacoController} */
monacoController.prototype.hideAllButton = function (frame) {
  this.moveButton.hidden = true
  this.closeButton.hidden = true
  this.maxButton.hidden = true
  this.minButton.hidden = true
  this.toolbar.hidden = true
  this.searchButton.hidden = true
  this.copyButton.hidden = true
  this.menuButton.hidden = true
  this.goForwardButton.hidden = true
  this.goBackButton.hidden = true
  this.sidebarButton.hidden = true
  this.moreButton.hidden = true
  this.saveButton.hidden = true
}
/** @this {monacoController} */
monacoController.prototype.showAllButton = function (frame) {
  this.moveButton.hidden = false
  this.closeButton.hidden = false
  this.maxButton.hidden = false
  this.minButton.hidden = false
  this.toolbar.hidden = true
  this.searchButton.hidden = false
  this.copyButton.hidden = false
  this.menuButton.hidden = false
  this.goForwardButton.hidden = false
  this.goBackButton.hidden = false
  this.sidebarButton.hidden = false
  this.moreButton.hidden = false
  this.saveButton.hidden = false

}
/** @this {monacoController} */
monacoController.prototype.show = function (beginFrame,endFrame) {
  this.view.frame = this.currentFrame
  let preFrame = this.currentFrame
  if (endFrame) {
    preFrame = endFrame
  }
  let windowFrame = MNUtil.currentWindow.frame
  preFrame.width = MNUtil.constrain(preFrame.width, 40, windowFrame.width)
  let time = 0.2
  let preOpacity = this.view.layer.opacity

  this.view.layer.opacity = 0.2
  this.webview.layer.opacity = 0.2
  this.webview.hidden = false
  this.moveButton.setImageForState(undefined,0)
  if (beginFrame) {
    // let adjustBeginFrame = MNUtil.genFrame(beginFrame.x, beginFrame.y-5, beginFrame.width, beginFrame.height+40)
    this.endFrame = beginFrame
    this.setFrame(beginFrame)
  }else{
    this.endFrame = undefined
  }
  if (this.miniMode) {
    time = 0.3
    this.endFrame = undefined
  }
  this.view.hidden = false
  // if (this.miniMode) {
  //   this.webview.layer.borderWidth = 0
  // }else{
  //   this.webview.layer.borderWidth = 3
  // }
  // if (this.miniMode) {
  //   this.view.layer.borderWidth = 3
  // }
  this.view.backgroundColor = MNUtil.hexColorAlpha("#9bb2d6",0.3)
  this.miniMode = false
  // this.hideAllButton()
  this.saveButton.hidden = false
  MNUtil.animate(()=>{
    this.onAnimate = true
    this.view.layer.opacity = 1.0
    this.webview.layer.opacity = 1.0
    this.setFrame(preFrame)
    this.hideAllButton()
  },time).then(()=>{
    this.onAnimate = false
    MNUtil.currentWindow.bringSubviewToFront(this.view)
    this.webview.layer.borderWidth = 0
    this.view.layer.borderWidth = 0
    this.showAllButton()
    this.view.setNeedsLayout()
    this.view.backgroundColor = MNUtil.hexColorAlpha("#9bb2d6",0)
  })
}
/** @this {monacoController} */
monacoController.prototype.hide = async function (endFrame) {
  try {

  let preFrame = this.view.frame
  // let preOpacity = this.view.layer.opacity
  let preCustom = this.custom
  // let preFrame = this.view.frame
  // this.view.frame = adjustPreframe
  this.webview.hidden = false
  if (this.settingView) {
    this.settingView.hidden = true
  }
  this.view.backgroundColor = MNUtil.hexColorAlpha("#9bb2d6",0.3)
  // this.hideAllButton()
  this.custom = false
  // if (endFrame) {
  //   this.webview.layer.borderWidth = 3
  // }
  MNUtil.animate(()=>{
    this.onAnimate = true
    this.view.layer.opacity = 0.2
    this.webview.layer.opacity = 0.2
    if (endFrame) {
      this.setFrame(endFrame)
    }
    this.hideAllButton()
  }).then(()=>{
    this.onAnimate = false
    this.view.hidden = true;
    this.webview.hidden = true
    // this.view.layer.opacity = preOpacity      
    this.setFrame(preFrame)
    this.webview.layer.borderWidth = 0
    this.custom = preCustom
  })
  await MNUtil.delay(0.01)
  this.blur()
  if (this.targetURL) {
    await this.save(this.targetURL)
  }
  // this.clearContent()
  // this.targetURL = undefined
  this.editorNoteId = undefined
  } catch (error) {
    monacoUtils.addErrorLog(error, "hide")
  }
}
/** @this {monacoController} */
monacoController.prototype.setFrame = function(x,y,width,height){
  if (typeof x === "object") {
    this.view.frame = x
  }else{
    this.view.frame = MNUtil.genFrame(x, y, width, height)
  }
  this.currentFrame = this.view.frame
  this.layoutSubviews(this.currentFrame)
}
/** @this {monacoController} */
monacoController.prototype.setBackgroundColor= function (color) {
  this.headingButton.backgroundColor = MNUtil.hexColorAlpha(color,0.8);
  this.goForwardButton.backgroundColor = MNUtil.hexColorAlpha(color,0.8);
  this.goBackButton.backgroundColor = MNUtil.hexColorAlpha(color,0.8);
  this.saveButton.backgroundColor = MNUtil.hexColorAlpha(color,0.8);
  this.sidebarButton.backgroundColor = MNUtil.hexColorAlpha(color,0.8);
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
  this.searchButton.backgroundColor = MNUtil.hexColorAlpha(color,0.8)
  this.copyButton.backgroundColor = MNUtil.hexColorAlpha(color,0.8)
  this.menuButton.backgroundColor = MNUtil.hexColorAlpha(color,0.8)
}

/** @this {monacoController} */
monacoController.prototype.save  = async function(fileURL) {
try {
  let code = await this.runJavaScript(`editor.getValue();`)
  if (this.targetURL) {
    MNUtil.showHUD("file saved")
    MNUtil.writeText(this.targetURL, code)
    return
  }else{
    MNUtil.showHUD("Can't save temporary file")
  }
} catch (error) {
  monacoUtils.addErrorLog(error, "save")
}
  // MNUtil.delay(3).then(()=>{
  //   MNUtil.app.refreshAfterDBChanged(MNUtil.currentNotebookId)
  // })
}

monacoController.prototype.getURLFromImage = async function (imageData,md5) {
  MNUtil.showHUD("Upload image...")
  let fileName
  if (md5) {
    fileName = md5
  }else{
    let md5 = MNUtil.MD5(imageData.base64Encoding())
    fileName = md5
  }
  let request = await monacoUtils.uploadFileToR2(imageData, fileName+".png", true)
  return monacoUtils.getR2URL(fileName)
}
/** @this {monacoController} */
monacoController.prototype.blur = async function (delay=0) {
  if (delay) {
    MNUtil.delay(delay).then(()=>{
      // this.runJavaScript(`editor.blur();`)
      this.runJavaScript(`document.activeElement.blur()`)
      this.webview.endEditing(true)
    })
  }else{
    // this.runJavaScript(`editor.blur();`)
      this.runJavaScript(`document.activeElement.blur()`)
    this.webview.endEditing(true)
  }
}
/** @this {monacoController} */
monacoController.prototype.getSelection = async function () {
  return await this.runJavaScript(`encodeURIComponent(editor.getModel().getValueInRange(editor.getSelection());)`)
}

/** @this {monacoController} */
monacoController.prototype.exit = async function () {
      if (this.endFrame) {
        this.hide(this.endFrame)
        return
      }
      this.hide()
      return
}

/** @this {monacoController} */
monacoController.prototype.setFileList = async function (path) {
  let url = monacoUtils.extensionPath+"/"+path
  let subpaths = NSFileManager.defaultManager().subpathsOfDirectoryAtPath(url)
  subpaths = subpaths.filter(subpath=>!/\.DS_Store$/.test(subpath))
  // MNUtil.copyJSON(subpaths)
  let title = MNUtil.readJSON(url+"/mnaddon.json").title
  const fileData = monacoUtils.buildFileData(subpaths)
  // const fileData = subpaths.map(path=>{
  //   return { name: path, type: 'file' }
  // })
  // MNUtil.copyJSON(fileData)
  // const subpaths = [
  //   'Folder1/File1-1.txt',
  //   'Folder1/File1-2.txt',
  //   'Folder1/Folder1-1/File1-1-1.txt',
  //   'File2.txt',
  //   'Folder2/File2-1.txt'
  // ]
  // const fileData = [
  //   {
  //     name: 'Folder1',
  //     type: 'folder',
  //     children: [
  //         { name: 'File1-1.txt', type: 'file' },
  //         { name: 'File1-2.txt', type: 'file' },
  //         {
  //           name: 'Folder1-1',
  //           type: 'folder',
  //           children: [
  //             { name: 'File1-1-1.txt', type: 'file' }
  //           ]
  //         }
  //     ]
  //   },
  //   { name: 'File2.txt', type: 'file' },
  //   {
  //     name: 'Folder2',
  //     type: 'folder',
  //     children: [
  //       { name: 'File2-1.txt', type: 'file' }
  //     ]
  //   }
  // ];
  let encodeText = encodeURIComponent(JSON.stringify(fileData))
  this.runJavaScriptForSidebar(`render(\`${decodeURIComponent(encodeText)}\`);setTitle(\`${title}\`)`)
}

/** @this {monacoController} */
monacoController.prototype.runCode = async function() {
    let code = await this.runJavaScript(`editor.getValue();`)
    if (this.testMode()) {
      if (this.targetURL.endsWith("testCode.html")) {
        MNUtil.postNotification("snipasteHtml", {html:code})
        MNUtil.writeText(this.targetURL, code)
        return
      }
      if (this.targetURL.endsWith("testCode.js")) {
        monacoSandbox.execute(code)
        MNUtil.writeText(this.targetURL, code)
        return
      }
    }
    if (this.targetURL) {
      MNUtil.showHUD("file saved")
      MNUtil.writeText(this.targetURL, code)
      return
    }
}
/** @this {monacoController} */
monacoController.prototype.testMode = function() {
  if (this.targetURL) {
    // MNUtil.copy(this.targetURL)
    if (this.targetURL.endsWith("testCode.js") || this.targetURL.endsWith("testCode.html")) {
      // MNUtil.showHUD("testMode")
      return true
    }
    return false
  }
  return true
}
/** @this {monacoController} */
monacoController.prototype.layoutSubviews= function(frame) {
  if (this.miniMode) {
    this.hideAllButton()
    return
  }
    let buttonHeight = 25
    var width    = frame.width
    var height   = frame.height
    this.closeButton.frame = MNUtil.genFrame(width-26,0,20,20)
    this.toolbar.frame = MNUtil.genFrame(1, height-25, width-2,buttonHeight)
    this.toolbar.hidden = true
    this.saveButton.frame = {  x: width-53,  y: 27,  width: 46,  height: 25};
    this.searchButton.frame = {  x: width-90,  y: 27, width: 32,  height: 25};
    this.copyButton.frame = {  x: width-150,  y: 27, width: 55,  height: 25};
    this.menuButton.frame = {  x: width-37,  y: height-32,  width: 30,  height: 25};

    if (width <= 440) {
      // this.moveButton.frame = {  x: width*0.5-75,  y: 0,  width: width*0.35,  height: 16};
      // this.refreshButton.hidden = false
      // this.goBackButton.hidden = false
      // this.goForwardButton.hidden = false
      this.headingButton.frame = {  x: 106,  y: 0,  width: 30,  height: buttonHeight,};  
      this.listButton.frame = {  x: 141,  y: 0,  width: 30,  height: buttonHeight,};  
      this.boldButton.frame = {  x: 176,  y: 0,  width: 30,  height: buttonHeight,};  
      this.linkButton.frame = {  x: 211,  y: 0,  width: 30,  height: buttonHeight,};  
      this.codeButton.frame = {  x: 246,  y: 0,  width: 30,  height: buttonHeight,};  
      this.tableButton.frame = {  x: 281,  y: 0,  width: 30,  height: buttonHeight,};  
      // this.moreButton.frame = {  x: 316,  y: 0,  width: 30,  height: buttonHeight,}; 
    }else{
      // this.moveButton.frame = {  x: width*0.5-75,  y: 0,  width: 150,  height: 16};
      // this.refreshButton.hidden = false
      // this.goBackButton.hidden = false
      // this.goForwardButton.hidden = false
      // this.headingButton.hidden = false
      this.headingButton.frame = {  x: 106,  y: 0,  width:30,  height: buttonHeight,};   
      this.listButton.frame = {  x: 141,  y: 0,  width:30,  height: buttonHeight,};   
      this.boldButton.frame = {  x: 176,  y: 0,  width: 30,  height: buttonHeight,};  
      this.linkButton.frame = {  x: 211,  y: 0,  width: 30,  height: buttonHeight,};  
      this.codeButton.frame = {  x: 246,  y: 0,  width: 30,  height: buttonHeight,};  
      this.tableButton.frame = {  x: 281,  y: 0,  width: 30,  height: buttonHeight,};  
      // this.sidebarButton.frame = {  x: width - 95,  y: 0,  width: 35,  height: buttonHeight};
      // this.moreButton.hidden = false
    }

    this.refreshButton.frame = {  x: 71,  y: 0,  width: 30,  height: buttonHeight,};
    if (width > 700 && !this.testMode()) {
      let sidebarWidth = width*0.25
      if (sidebarWidth > 300) {
        sidebarWidth = 300
      }
      let remainWidth = width-sidebarWidth
      this.moveButton.frame = {  x: sidebarWidth+remainWidth*0.5-75,  y: 0,  width: 150,  height: 20};
      this.minButton.frame = MNUtil.genFrame(sidebarWidth+remainWidth*0.5-100,0,20,20)
      this.maxButton.frame = MNUtil.genFrame(sidebarWidth+remainWidth*0.5+115,0,20,20)
      this.moreButton.frame = MNUtil.genFrame(sidebarWidth+remainWidth*0.5+80,0,30,20)
      this.goBackButton.frame = {  x:sidebarWidth+46,  y: 0,  width: 25,  height: 20,};
      this.goForwardButton.frame = {  x:sidebarWidth+76,  y: 0,  width: 25,  height: 20,};
      this.sidebarButton.setImageForState(undefined,0)
      this.sidebarButton.frame = {  x: sidebarWidth*0.5-40,  y: 0,  width: 80,  height: 20};
      this.sidebarView.frame = {x:1,y:21,width:sidebarWidth,height:height-21}
      this.webview.frame = {x:sidebarWidth+6,y:21,width:width-sidebarWidth-7,height:height-21}
      this.sidebarView.hidden = false
    }else{
      this.moveButton.frame = {  x: width*0.5-75,  y: 0,  width: 150,  height: 20};
      this.minButton.frame = MNUtil.genFrame(width*0.5-100,0,20,20)
      this.maxButton.frame = MNUtil.genFrame(width*0.5+115,0,20,20)
      this.moreButton.frame = MNUtil.genFrame(width*0.5+80,0,30,20)
      this.goBackButton.frame = {  x:41,  y: 0,  width: 25,  height: 20};
      this.goForwardButton.frame = {  x:71,  y: 0,  width: 25,  height: 20};
      this.sidebarButton.setImageForState(monacoUtils.screenImage,0)
      this.sidebarButton.frame = {  x: 7,  y: 27,  width: 30,  height: 25};
      this.sidebarView.frame = {x:1,y:21,width:300,height:height-21}
      this.webview.frame = {x:1,y:21,width:width-2,height:height-21}
      this.sidebarView.hidden = true
    }
  }

monacoController.prototype.showHUD = function (message,duration = 2,view = this.view) {
  MNUtil.showHUD(message,duration,view)
}
monacoController.prototype.executeNativeAction = async function (action,params) {
// MNUtil.copy(config)
        switch (action) {
          case "copy":
            MNUtil.copy(params.content)
            break;
          case "cut":
            await MNUtil.delay(0.1)
            MNUtil.copy(params.content)
            break;
          case "save":
            let code = params.code
            if (this.targetURL) {
              MNUtil.writeText(this.targetURL, code)
            }else{
              MNUtil.writeText(monacoUtils.dataFolder+"testCode.js", code)
            }
            this.showHUD("file saved")
            break;
          case "runcode":
            this.runCode()
            break;
          case "showHUD":
            let text = params.content
            this.showHUD(text)
            break;
          case "init":
            self.setTestContent("js","#9bb2d6")
            break;

          default:
            break;
        }
}