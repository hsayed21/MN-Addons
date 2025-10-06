/** @return {webdavController} */
const getWebdavController = ()=>self
var webdavController = JSB.defineClass('webdavController : UIViewController <UIWebViewDelegate,NSURLConnectionDataDelegate>',{
  // /** @self {webdavController} */
  viewDidLoad: function() {
  try {
    let self = getWebdavController()
    self.appInstance = Application.sharedInstance();
    self.custom = false;
    self.customMode = "None"
    self.currentPath = "/"
    self.miniMode = false;
    self.shouldCopy = false
    self.shouldComment = false
    self.selectedText = '';
    self.searchedText = '';
    self.isLoading = false;
    self.view.frame = {x:50,y:50,width:(self.appInstance.osType !== 1) ? 419 : 365,height:450}
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
    self.init()
  } catch (error) {
    webdavUtil.addErrorLog(error, "viewDidLoad")
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
  let self = getWebdavController()
    if (self.miniMode) {
      return
    }
    let buttonHeight = 28
    let buttonWidth = 35
    var viewFrame = self.view.bounds;
    var width    = viewFrame.width
    var height   = viewFrame.height
    self.closeButton.frame = MNUtil.genFrame(width-19,0,18,18)
    self.maxButton.frame = MNUtil.genFrame(width-44,0,18,18)
    self.minButton.frame = MNUtil.genFrame(width-69,0,18,18)
    let moveButtonHeight = 18

    self.toolbar.frame = MNUtil.genFrame(0, height-buttonHeight, width,buttonHeight)
    self.engineButton.frame = {x: width - 128,y: 0,width: 130,height: buttonHeight};
    self.buttonScrollview.frame = {x: 0,y: 0,width: width-116,height: buttonHeight};
    self.backButton.frame = {  x: 0,  y: 0,  width:buttonWidth,  height: buttonHeight,};   
    self.homeButton.frame = {  x: 40,  y: 0,  width:buttonWidth,  height: buttonHeight,};   
    self.refreshButton.frame = {  x: 80,  y: 0,  width:buttonWidth,  height: buttonHeight,};   

    self.buttonScrollview.contentSize = {width: 100,height: buttonHeight};

    if (width <= 340) {
      // if (!self.onAnimate) {
      self.moveButton.frame = {x: width*0.5-75,y: 0,width: width*0.5,height: moveButtonHeight};
      // }
      self.moreButton.hidden = true
    }else if (width <= 375) {
      // if (!self.onAnimate) {
        self.moveButton.frame = {  x: width*0.5-75,  y: 0,  width: width*0.4,  height: moveButtonHeight};
      // }
      if (!self.onAnimate) {
        self.moreButton.hidden = false
      }
      self.moreButton.frame = {  x: width*0.9-70,  y: 0,  width: 25,  height: 18};
    }else{
        self.moveButton.frame = {  x: width*0.5-75,  y: 0,  width: 150,  height: moveButtonHeight};
      if (!self.onAnimate) {
        self.moreButton.hidden = false
      }
      self.moreButton.frame = {  x: width*0.5+80,  y: 0,  width: 25,  height: 18};
    }
    if (webdavConfig.toolbar) {
      self.webview.frame = {x:0,y:9,width:width,height:height-42}
    }else{
      self.webview.frame = {x:0,y:9,width:width,height:height-12}
    }
    try {
      if (self.settingView) {
        self.settingViewLayout()
        self.refreshLayout()
      }
    } catch (error) {
      webdavUtil.addErrorLog(error, "viewWillLayoutSubviews")
    }

  },

  webViewDidStartLoad: function(webView) {
    let currentURL = webView.request.URL().absoluteString();

    if (!currentURL) {return}
    self.refreshButton.setImageForState(webdavUtil.stopImage,0)
    self.changeButtonOpacity(0.5)
    // MNUtil.showHUD("Start")
//         self.runJavaScript(`
// function clickButtonAfterVideoLoad(buttonSelector) {
// document.addEventListener('DOMContentLoaded', function () {
//     const button = document.querySelector(buttonSelector);
//     button.click();
// }
// clickButtonAfterVideoLoad('.bpx-player-ctrl-btn.bpx-player-ctrl-wide');
// `)
    if (/(notion.so)|(craft.do)/.test(currentURL)) {
      webView.url = currentURL
      self.refreshButton.setImageForState(webdavUtil.reloadImage,0)
      self.changeButtonOpacity(1.0)
      return;
    }
    // var pasteBoard = UIPasteboard.generalPasteboard()
    // pasteBoard.string = currentURL
    if (/^https:\/\/www.thesaurus.com/.test(currentURL)) {
        self.updateThesaurusOffset()
      
    }
    // var pasteBoard = UIPasteboard.generalPasteboard()
    // pasteBoard.string = currentURL
    UIApplication.sharedApplication().networkActivityIndicatorVisible = true;
    // self.refreshButton.setTitleForState('✖️', 0);
  },
  /**
   * 
   * @param {UIWebView} webView 
   */
  webViewDidFinishLoad: function(webView) {
    let self = getWebdavController()
    // MNUtil.showHUD("message")
    self.webview.url = webView.request.URL().absoluteString();
    if (self.webview.url.endsWith("webdav-config.html")) {
      self.initConnectionPage()
    }
    // MNUtil.copy("object"+self.webview.url)
    self.refreshButton.setImageForState(webdavUtil.reloadImage,0)
    self.changeButtonOpacity(1.0)
    self.isLoading = false;
    UIApplication.sharedApplication().networkActivityIndicatorVisible = false;
  },
  webViewDidFailLoadWithError: function(webView, error) {
    // MNUtil.showHUD("789")
    self.refreshButton.setImageForState(webdavUtil.reloadImage,0)
    // self.refreshButton.setTitleForState('🔄', 0);
    self.changeButtonOpacity(1.0)
    self.isLoading = false;
    // MNUtil.showHUD(error)
    // let errorInfo = {
    //   code:error.code,
    //   domain: error.domain,
    //   description: error.localizedDescription,
    //   userInfo: error.userInfo
    // }
    // MNUtil.copyJSON(errorInfo)

    // self.getCurrentURL()
    //UIApplication.sharedApplication().networkActivityIndicatorVisible = false;
    //var lan = NSLocale.preferredLanguages() ? NSLocale.preferredLanguages()[0].substring(0,2) : 'en';
    //if (lan == 'zh') {
    //  Application.sharedInstance().showHUD('错误', self.view.window, 2);
    //} else {
    //  Application.sharedInstance().showHUD('Failed to load DeepL translator, please try again later', self.view.window, 2);
    //}
  },
  /**
   * UIWebViewNavigationTypeLinkClicked   = 0,    // 用户点击链接,如下载文档
   * UIWebViewNavigationTypeFormSubmitted = 1,    // 表单提交
   * UIWebViewNavigationTypeBackForward   = 2,    // 前进/后退按钮操作
   * UIWebViewNavigationTypeReload        = 3,    // 刷新页面
   * UIWebViewNavigationTypeFormResubmitted = 4,  // 表单重新提交
   * UIWebViewNavigationTypeOther         = 5     // 其他方式
   * @param {UIWebView} webView 
   * @param {NSURLRequest} request 
   * @param {number} type
   * @returns 
   */
  webViewShouldStartLoadWithRequestNavigationType: function(webView,request,type){
  try {
    let self = getWebdavController()
    let config = MNUtil.parseURL(request)
    // MNUtil.copy(config)
    // let currentURL = webView.request.URL().absoluteString()
    if (config.scheme === "mnwebdav") {
      self.executeAction(config)
      return false
    }
    if (config.scheme === "native") {
      switch (config.host) {
        case "copy":
          MNUtil.copy(config.params.content)
          break;
      
        default:
          break;
      }
      return false
    }
    return true;
  } catch (error) {
    webdavUtil.addErrorLog(error, "webViewShouldStartLoadWithRequestNavigationType")
    return false
  }
  },
  connectionDidSendBodyDataTotalBytesWrittenTotalBytesExpectedToWrite:function (connection,bytesWritten,totalBytesWritten,totalBytesExpectedToWrite) {
    // MNUtil.waitHUD("Uploading: "+(bytesWritten)+":"+(totalBytesWritten)+"/"+(totalBytesExpectedToWrite))
    if (self.office2pdf) {
      self.waitHUD("Office2PDF(Uploading): "+(totalBytesWritten/totalBytesExpectedToWrite*100).toFixed(2)+"%")
    }else{
      if (self.fileId){
        self.waitHUD("Uploading ("+webdavUploadManager.taskRemain()+" files remain) : "+(totalBytesWritten/totalBytesExpectedToWrite*100).toFixed(2)+"%")
      }else{
        self.waitHUD("Uploading: "+(totalBytesWritten/totalBytesExpectedToWrite*100).toFixed(2)+"%")
      }
    }
    // MNUtil.showHUD("connectionDidSendBodyDataTotalBytesWrittenTotalBytesExpectedToWrite")
  },
  connectionDidReceiveResponse: async function (connection,response) {
    self.statusCode = response.statusCode()
    self.currentData = NSMutableData.new()
    if (self.statusCode >= 400) {
      MNUtil.stopHUD()
      self.showHUD(MNUtil.getStatusCodeDescription(""+self.statusCode))
      return
    }
    self.expectedContentLength = response.expectedContentLength()
    // MNUtil.waitHUD("Begin download...")
  },
  connectionDidReceiveData: async function (connection,data) {
    try {
    // MNUtil.showHUD("connectionDidReceiveData")
    self.currentData.appendData(data)
    if (self.statusCode >= 400) {
      self.onDownloading = false
      return
    }
    if (self.office2pdf) {
      self.waitHUD("Office2PDF(Downloading): "+(self.currentData.length()/self.expectedContentLength*100).toFixed(2)+"%")
    }else{

      self.waitHUD("Downloading: "+(self.currentData.length()/self.expectedContentLength*100).toFixed(2)+"%")
    }
    } catch (error) {
      webdavUtil.addErrorLog(error,"connectionDidReceiveData")
    }
  },
  connectionDidFinishLoading: async function (connection) {
  try {
    if (self.onUploading) {
      if (self.statusCode >= 400) {
        self.refreshAfterAction('上传失败','error')
        self.onUploading = false
        let errorText = MNUtil.data2string(self.currentData)
        if (errorText.startsWith("<?xml")) {
          let errorObj = webdavUtil.parseWebdavErrorResponse(errorText,self.statusCode)
          errorText = JSON.stringify(errorObj,undefined,2)
          // MNUtil.copy(errorText)
        }
        MNUtil.confirm("MN Webdav", "上传失败\n\n"+errorText)
        if (self.fileId) {
          webdavUploadManager.startNextUpload(self.fileId)
        }else{
          self.fileId = undefined
          MNUtil.stopHUD()
          self.showHUD("上传结束")
        }
        return
      }
      self.onUploading = false
      if (self.fileId) {
        let success = webdavUploadManager.startNextUpload(self.fileId)
        if (success) {
          self.showToast('上传成功','success')
        }else{
          self.fileId = undefined
          self.showHUD("上传结束")
          self.refreshAfterAction('上传成功')
          MNUtil.stopHUD()
        }
      }else{
        self.refreshAfterAction('上传成功')
        self.fileId = undefined
        MNUtil.stopHUD()
        self.showHUD("上传结束")
      }
      return
    }
    MNUtil.stopHUD()
    if (self.statusCode >= 400) {
      return
    }
    if (self.onDownloading) {
      self.onDownloading = false
      self.office2pdf = false
      if (self.addonPath && self.fileName.endsWith(".mnaddon")) {
        self.showHUD("Download finished")
        self.currentData.writeToFileAtomically(self.addonPath,false)
        MNUtil.createFolderDev(webdavUtil.mainPath+"/temp")
        ZipArchive.unzipFileAtPathToDestination(self.addonPath,webdavUtil.mainPath+"/temp")
        let config = MNUtil.readJSON(webdavUtil.mainPath+"/temp/mnaddon.json")
        if (config && "addonid" in config) {
          let addonPath = subscriptionUtils.extensionPath+"/"+config.addonid
          ZipArchive.unzipFileAtPathToDestination(self.addonPath,addonPath)
          self.showHUD(`✅ Install mnaddon [${config.title}] success!\n\nPlease restart MN manually`)
        }else{
          self.showHUD("❌ Install mnaddon failed!")
        }
        return
      }
      if (self.fileName && (self.fileName.endsWith(".marginnotes") || self.fileName.endsWith(".marginpkg"))) {

        self.showHUD("Download finished")
        MNUtil.createFolderDev(webdavUtil.mainPath+"/marginnotes")
        let targetPath = webdavUtil.mainPath+"/marginnotes/"+self.fileName
        self.currentData.writeToFileAtomically(targetPath,false)
        MNUtil.createFolderDev(webdavUtil.mainPath+"/temp")
        webdavUtil.importNotebook(targetPath,webdavUtil.mainPath+"/temp")
        return
      }
      let officeExtensions = [".docx",".doc",".pptx",".ppt",".xlsx",".xls"]
      if (officeExtensions.some(ext => self.fileName.endsWith(ext))) {
        // MNUtil.createFolderDev(webdavUtil.mainPath+"/office2pdf")
        MNUtil.log("office2pdf:"+self.fileName)
        self.waitHUD("Uploading...")
        let request = webdavUtil.office2pdfFromData(self.currentData,self.fileName)
        self.onDownloading = true
        let connection = NSURLConnection.connectionWithRequestDelegate(request, self)
        let pdfName = self.fileName.replace(/.(docx|doc|pptx|ppt|xlsx|xls)$/, ".pdf")
        MNUtil.log(pdfName)
        connection.fileName = pdfName
        self.fileName = pdfName
        self.office2pdf = true
        // let filePath = webdavUtil.mainPath+"/office2pdf/"+self.fileName
        // self.currentData.writeToFileAtomically(filePath,false)
        // webdavConfig.webdav.previewFile({name:self.fileName,path:filePath})
        return
      }
      if (self.fileName) {
        let webdavFolder = MNUtil.documentFolder+"/Webdav"
        MNUtil.createFolderDev(webdavFolder)
        let filePath = webdavFolder+"/"+self.fileName
        self.currentData.writeToFileAtomically(filePath,false)
        webdavConfig.webdav.previewFile({name:self.fileName})
        // let fileName = self.fileName
        // if (fileName.endsWith(".pdf") && MNUtil.currentNotebookId) {
        //   let md5 = MNUtil.importDocument(filePath)
        //   MNUtil.postNotification("snipastePDF", {docMd5:md5,currPageNo:1})
        //   // let confirm = await MNUtil.confirm("MN Webdav", "Open document?\n\n是否打开该文档？\n\n"+fileName)
        //   // if (confirm) {
        //   //   // MNUtil.copy(MNUtil.currentNotebookId)
        //   //   MNUtil.openDoc(md5,MNUtil.currentNotebookId)
        //   //   if (MNUtil.docMapSplitMode === 0) {
        //   //     MNUtil.studyController.docMapSplitMode = 1
        //   //   }
        //   // }
        // }
        // if (fileName.endsWith(".png") || fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")) {
        //   MNUtil.postNotification("snipasteImage", {imageData:self.currentData})
        // }
      }
    }
    // // let config = {}
    // if (self.targetPath) {
    //   // config.targetPath = self.targetPath
    //   self.currentData.writeToFileAtomically(self.targetPath,false)
    //   switch (self.fileType) {
    //     case "document":
    //       let fileName = MNUtil.getFileName(self.targetPath)
    //       let md5 = MNUtil.importDocument(self.targetPath)
    //       MNUtil.copy(md5)
    //       if (MNUtil.currentNotebookId) {
    //         let confirm = await MNUtil.confirm("Open document?", "是否打开该文档？\n"+fileName)
    //         if (confirm) {
    //           // MNUtil.copy(MNUtil.currentNotebookId)
    //           MNUtil.openDoc(md5,MNUtil.currentNotebookId)
    //         }
    //       }
    //       break;
    //     case "notebook":
    //       if (self.targetPath.endsWith(".marginpkg") || self.targetPath.endsWith(".marginnotes")) {
    //         subscriptionUtils.importNotebook(self.targetPath,self.folder,self.notebookId)
    //       }
    //       break;
    //     case "mnaddon":
    //       ZipArchive.unzipFileAtPathToDestination(self.targetPath,self.addonPath)
    //       self.showHUD("Install success!\n\nPlease restart MN manually",2)
    //       break;
    //     default:
    //       break;
    //   }
    // }
    // // MNUtil.copyJSON(config)
    // MNUtil.delay(1).then(()=>{
    //   MNUtil.stopHUD()
    // })
  } catch (error) {
    MNUtil.stopHUD()
    webdavUtil.addErrorLog(error,"connectionDidFinishLoading")
  }
  },
  connectionDidFailWithError: function (connection,error) {
    self.onDownloading = false
    if (error.localizedDescription) {
      self.showHUD(error.localizedDescription)
    }else{
      self.showHUD("connectionDidFailWithError")
    }
  },
  backButtonTapped: async function() {
    let isFileManagerPage = await self.isFileManagerPage()
    if (isFileManagerPage) {
      self.navigateBack()
    }
  },
  homeButtonTapped: async function() {
    let isFileManagerPage = await self.isFileManagerPage()
    if (!isFileManagerPage) {
      self.homePage()
    }
    self.handleConnect()
  },
  refreshButtonTapped:  async function(sender) {
    let isFileManagerPage = await self.isFileManagerPage()
    if (isFileManagerPage) {
      let path = self.currentPath
      self.showToast("Refreshing...")
      // let res = await webdavConfig.webdav.listDirectory(path)
      let res = await webdavConfig.listDirectory(path,self)
      if (res) {
        self.currentPath = path
        self.loadDirectory(res, path)
      }
    }else{
      self.connectionPage()
    }
  },
  changeScreen: function(sender) {
    if (sender.link) {
      MNConnection.loadRequest(self.webview, sender.link)
      return
    }
    var commandTable = [
        {title:'🌐 Copy as MD link',object:self,selector:'copyCurrentURLWithText:',param:'right'},
        {title:'🎚 Zoom',object:self,selector:'changeZoom:',param:sender}
      ];
    self.view.popoverController = MNUtil.getPopoverAndPresent(sender, commandTable,250,2)
  },
  moveButtonTapped: function(button) {
  try {

    if (self.miniMode) {
      let preFrame = self.view.frame
      self.view.hidden = true
      self.showAllButton()
      let studyFrame = MNUtil.studyView.bounds
      self.lastFrame.x = MNUtil.constrain(self.lastFrame.x, 0, studyFrame.width-self.lastFrame.width)
      self.lastFrame.y = MNUtil.constrain(self.lastFrame.y, 0, studyFrame.height-self.lastFrame.height)
      let color = this.desktop ? "#b5b5f5":"#9bb2d6"
      self.view.layer.backgroundColor = MNUtil.hexColorAlpha(color,0.8)
      self.view.layer.borderColor = MNUtil.hexColorAlpha(color,0.8)
      self.moveButton.setImageForState(undefined,0)
      self.setFrame(self.lastFrame)
      self.show(preFrame)
      return
    }
    let menu = new Menu(button,self)
    menu.addMenuItem("🎛  Connection Page", 'openConnectionPage:', 'connectionPage')
    let order = webdavConfig.getConfig("order")
    if (order === "name") {
      order = "name (a→z)"
    }
    menu.addMenuItem("🎛  Sort by "+order, 'changeOrder:', button)
    menu.width = 250
    menu.preferredPosition = 1
    menu.show()
    
  } catch (error) {
    webdavUtil.addErrorLog(error, "moveButtonTapped")
  }
  },
  changeOrder: function(button) {
    Menu.dismissCurrentMenu()
    let menu = new Menu(button,self)
    menu.addMenuItem("🎛  Sort by name (a→z)", 'setOrder:', 'name (a→z)')
    menu.addMenuItem("🎛  Sort by name (z→z)", 'setOrder:', 'name (z→a)')
    menu.addMenuItem("🎛  Sort by size (1→9)", 'setOrder:', 'size (1→9)')
    menu.addMenuItem("🎛  Sort by size (9→1)", 'setOrder:', 'size (9→1)')
    menu.addMenuItem("🎛  Sort by date (old→new)", 'setOrder:', 'date (old→new)')
    menu.addMenuItem("🎛  Sort by date (new→old)", 'setOrder:', 'date (new→old)')
    menu.width = 250
    menu.preferredPosition = 1
    menu.show()
  },
  setOrder: async function(order) {
    Menu.dismissCurrentMenu()
    webdavConfig.config.order = order
    webdavConfig.save("MNWebdav_config")
    self.showHUD("Save order: "+order)
    let isFileManagerPage = await self.isFileManagerPage()
    if (isFileManagerPage) {
      let path = self.currentPath
      self.showToast("Refreshing...")
      // let res = await webdavConfig.webdav.listDirectory(path)
      let res = await webdavConfig.listDirectory(path,self)
      if (res) {
        self.currentPath = path
        self.loadDirectory(res, path)
      }
    }
  },
  onLongPressHome: async function(gesture) {
    if (gesture.state === 1) {
      self.showHUD("Reload webview")
      self.createWebview()
      self.homePage()
      self.view.bringSubviewToFront(self.moveButton)
      self.view.bringSubviewToFront(self.moreButton)
      self.view.bringSubviewToFront(self.maxButton)
      self.view.bringSubviewToFront(self.minButton)
      self.view.bringSubviewToFront(self.closeButton)
      self.handleConnect()
    }
  },
  changeEngine: function(sender) {
    let sources = webdavConfig.config.sources
    var commandTable = sources.map(source => {
      return {title:source.name,object:self,selector:'searchWithEngine:',param:source.id,checked:webdavConfig.config.currentSourceId===source.id}
    })
    self.view.popoverController = MNUtil.getPopoverAndPresent(sender, commandTable,200,2)
  },
  changeOpacity: function(slider) {
    self.view.layer.opacity = slider.value
    self.opacityButton.setTitleForState("Opacity: "+(slider.value*100).toFixed(1)+"%",0)
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
  changeSearchOrder: function(sender) {
    var commandTable = [
      {title:'Title → Excerpt → Comment',object:self,selector:'setSearchOrder:',param:[1,2,3],checked:webdavConfig.searchOrder==[1,2,3]},
      {title:'Title → Comment → Excerpt',object:self,selector:'setSearchOrder:',param:[1,3,2],checked:webdavConfig.searchOrder==[1,3,2]},
      {title:'Excerpt → Title → Comment',object:self,selector:'setSearchOrder:',param:[2,1,3],checked:webdavConfig.searchOrder==[2,1,3]},
      {title:'Excerpt → Comment → Title',object:self,selector:'setSearchOrder:',param:[2,3,1],checked:webdavConfig.searchOrder==[2,3,1]},
      {title:'Comment → Title → Excerpt',object:self,selector:'setSearchOrder:',param:[3,1,2],checked:webdavConfig.searchOrder==[3,1,2]},
      {title:'Comment → Excerpt → Title',object:self,selector:'setSearchOrder:',param:[3,2,1],checked:webdavConfig.searchOrder==[3,2,1]},
    ];
    self.view.popoverController = MNUtil.getPopoverAndPresent(sender, commandTable,300)
  },
  changeZoomTo:function (zoom) {
    self.runJavaScript(`document.body.style.zoom = ${zoom}`)
  },
  openSettingView:function (targetView) {
    self.openSetting(targetView)
  },
  openConnectionPage: function (targetView) {
    if (self.view.popoverController) {self.view.popoverController.dismissPopoverAnimated(true);}
    Menu.dismissCurrentMenu()
    self.connectionPage()
  },
  openInNewWindow: function (url) {
    self.checkPopover()
    if (webdavUtil.checkSubscribe()) {
      let agent = self.webview.customUserAgent
      MNUtil.postNotification('newWindow', {url:url,desktop:self.desktop,engine:webdavConfig.engine,webApp:self.webApp,agent:agent})
      self.homePage();
    }
  },
  openNewWindow: function (url) {
    self.checkPopover()
    if (webdavUtil.checkSubscribe()) {
      let homePageConfig = webdavConfig.getConfig("homePage")
      MNUtil.postNotification('newWindow', {url:homePageConfig.url,desktop:homePageConfig.desktop})
    }
  },
  resetConfig: async function (engine) {
    return
    let confirm = await MNUtil.confirm("Reset config?", "重置配置？")
    if (!confirm) {
      return
    }
  },
  searchButtonTapped: async function(button) {
    let sources = webdavConfig.config.sources
    let menu = new Menu(button,self)
    sources.map(source => {
      menu.addMenuItem(source.name, 'changeSource:',source.id,webdavConfig.config.currentSourceId===source.id)
    })
    menu.addMenuItem("⚙️  Setting", 'openConnectionPage:', 'setting')
    menu.preferredPosition = 2
    menu.show()
    // Menu.dismissCurrentMenu()
  },
  changeSource: async function (id) {
    Menu.dismissCurrentMenu()
    webdavConfig.config.currentSourceId = id
    webdavConfig.refresh()
    webdavConfig.save("MNWebdav_config")
    self.updateEngineButton()
    let isFileManagerPage = await self.isFileManagerPage()
    if (!isFileManagerPage) {
      self.homePage()
    }
    self.handleConnect()
  },
  closeButtonTapped: function() {
    if (self.addonBar) {
      self.hide(self.addonBar.frame)
    } else {
      self.hide()
    }
    self.searchedText = ""
    self.blur(0.01)
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
  if (self.view.popoverController) {self.view.popoverController.dismissPopoverAnimated(true);}
  self.lastFrame = self.view.frame
  self.custom = true;
  self.customMode = mode
  webdavConfig.dynamic = false;
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
    webdavConfig.dynamic = false;
    self.webview.hidden = false
    self.hideAllButton()
    MNUtil.animate(()=>{
      self.setFrame(40,50,frame.width-80,frame.height-70)
    },0.3).then(()=>{
      self.showAllButton()
    })
  },
  minButtonTapped: function() {
    // webdavConfig.dynamic = false;
    self.miniMode = true
    let studyFrame = MNUtil.studyView.bounds
    let studyCenter = MNUtil.studyView.center.x
    let viewCenter = self.view.center.x
    if (viewCenter>studyCenter) {
      self.toMinimode(MNUtil.genFrame(studyFrame.width-40,self.view.frame.y,40,40))
    }else{
      self.toMinimode(MNUtil.genFrame(0,self.view.frame.y,40,40))
    }
  },
  moreButtonTapped: function(button) {
    let self = getWebdavController()
    try {
    var commandTable 
    // MNUtil.showHUD("moreButtonTapped"+webdavConfig.toolbar)
    if (self.isMainWindow) {
      commandTable = [
        {title:'🌗  Left',object:self,selector:'splitScreen:',param:'left',checked:self.customMode==="left"},
        {title:'🌘  Left 1/3',object:self,selector:'splitScreen:',param:'left13',checked:self.customMode==="left13"},
        {title:'🌓  Right',object:self,selector:'splitScreen:',param:'right',checked:self.customMode==="right"},
        {title:'🌒  Right 1/3',object:self,selector:'splitScreen:',param:'right13',checked:self.customMode==="right13"},
        {title:'🎚  Zoom',object:self,selector:'changeZoom:',param:button}
      ];
    }else{
      commandTable = [
        {title:'🌗  Left',object:self,selector:'splitScreen:',param:'left',checked:self.customMode==="left"},
        {title:'🌘  Left 1/3',object:self,selector:'splitScreen:',param:'left13',checked:self.customMode==="left13"},
        {title:'🌓  Right',object:self,selector:'splitScreen:',param:'right',checked:self.customMode==="right"},
        {title:'🌒  Right 1/3',object:self,selector:'splitScreen:',param:'right13',checked:self.customMode==="right13"},
        {title:'🎚  Zoom',object:self,selector:'changeZoom:',param:button}
      ];
    }
    self.view.popoverController = MNUtil.getPopoverAndPresent(button, commandTable,230,1)
    } catch (error) {
      webdavUtil.addErrorLog(error, "moreButtonTapped")
    }
  },
  onMoveGesture:function (gesture) {
    webdavConfig.dynamic = false;
    let locationToMN = gesture.locationInView(MNUtil.studyView)
    if (!self.locationToButton || !self.miniMode && (Date.now() - self.moveDate) > 100) {
      // self.appInstance.showHUD("state:"+gesture.state, self.view.window, 2);
      let translation = gesture.translationInView(MNUtil.studyView)
      let locationToBrowser = gesture.locationInView(self.view)
      let locationToButton = gesture.locationInView(gesture.view)
      let newY = locationToButton.y-translation.y 
      let newX = locationToButton.x-translation.x
      if (gesture.state === 1) {
        // self.lastFrame = self.view.frame
        self.locationToBrowser = {x:locationToBrowser.x-translation.x,y:locationToBrowser.y-translation.y}
        self.locationToButton = {x:newX,y:newY}
      }
    }
    self.moveDate = Date.now()
    let location = {x:locationToMN.x - self.locationToButton.x-gesture.view.frame.x,y:locationToMN.y -self.locationToButton.y-gesture.view.frame.y}
    let minX = -(self.locationToButton.x+gesture.view.frame.x)
    // let location = webdavUtil.getNewLoc(gesture)
    let frame = self.view.frame
    var viewFrame = self.view.bounds;
    let studyFrame = MNUtil.studyView.bounds
    let y = MNUtil.constrain(location.y, 0, studyFrame.height-15)
    let x = MNUtil.constrain(location.x, minX, studyFrame.width-15)
    
    if (self.custom) {
      // Application.sharedInstance().showHUD(self.custom, self.view.window, 2);
      self.custom = false
      MNUtil.animate(()=>{
        self.setFrame(x,y,self.lastFrame.width,self.lastFrame.height)
      })
    }else{
      self.setFrame(x, y, frame.width,frame.height)
    }
    self.custom = false;
  },
  onResizeGesture:function (gesture) {
    self.custom = false;
    webdavConfig.dynamic = false;
    self.customMode = "none"
    let frame = self.view.frame
    let locationToBrowser = gesture.locationInView(self.view)
    if (gesture.state === 1) {
      self.xDiff = MNUtil.constrain(frame.width-locationToBrowser.x, 0, frame.width)
      self.yDiff = MNUtil.constrain(frame.height-locationToBrowser.y, 0, frame.height)
    }
    let width = locationToBrowser.x+self.xDiff
    let height = locationToBrowser.y+self.yDiff
    if (width <= 265) {
      width = 265
    }
    if (height <= 150) {
      height = 150
    }
    if (self.settingView && !self.settingView.hidden) {
      if (height <= 420) {
        height = 420
      }
    }
    //  Application.sharedInstance().showHUD(`{x:${translation.x},y:${translation.y}}`, self.view.window, 2);
    //  self.view.frame = {x:frame.x,y:frame.y,width:frame.width+translationX,height:frame.height+translationY}
    self.setFrame(frame.x, frame.y, width,height)
  },
  advancedButtonTapped: function (params) {
    self.configSearchView.hidden = true
    self.advanceView.hidden = false
    self.syncView.hidden = true
    self.customButtonView.hidden = true
    MNButton.setColor(self.advancedButton, "#457bd3")
    MNButton.setColor(self.configSearchButton, "#9bb2d6")
    MNButton.setColor(self.syncConfig, "#9bb2d6")
    MNButton.setColor(self.configCustomButton, "#9bb2d6")
  },
  syncConfigTapped: function (params) {
    self.configSearchView.hidden = true
    self.advanceView.hidden = true
    self.syncView.hidden = false
    self.customButtonView.hidden = true
    MNButton.setColor(self.advancedButton, "#9bb2d6")
    MNButton.setColor(self.configSearchButton, "#9bb2d6")
    MNButton.setColor(self.syncConfig, "#457bd3")
    MNButton.setColor(self.configCustomButton, "#9bb2d6")
    self.refreshView("syncView")
  },
  configSearchTapped: function (params) {
    self.configSearchView.hidden = false
    self.advanceView.hidden = true
    self.syncView.hidden = true
    self.customButtonView.hidden = true
    self.configMode = 0
    self.configEngine = webdavConfig.engine
    MNButton.setColor(self.advancedButton, "#9bb2d6")
    MNButton.setColor(self.configSearchButton, "#457bd3")
    MNButton.setColor(self.syncConfig, "#9bb2d6")
    MNButton.setColor(self.configCustomButton, "#9bb2d6")
    self.setButtonText( webdavConfig.entrieNames,webdavConfig.engine)
    self.setTextview(webdavConfig.engine)
    self.refreshLayout()
  },
  configWebAppTapped: function (params) {
    self.configSearchView.hidden = false
    self.advanceView.hidden = true
    self.syncView.hidden = true
    self.customButtonView.hidden = true
    self.configMode = 1
    self.configEngine = self.webApp
    MNButton.setColor(self.advancedButton, "#9bb2d6")
    MNButton.setColor(self.configSearchButton, "#9bb2d6")
    MNButton.setColor(self.syncConfig, "#9bb2d6")
    MNButton.setColor(self.configCustomButton, "#9bb2d6")
    self.setButtonText(webdavConfig.webAppEntrieNames,self.webApp)
    self.setTextview(self.webApp)
    self.refreshLayout()

  },
  configCustomButtonTapped: function (params) {
    self.configSearchView.hidden = true
    self.advanceView.hidden = true
    self.syncView.hidden = true
    self.customButtonView.hidden = false
    MNButton.setColor(self.advancedButton, "#9bb2d6")
    MNButton.setColor(self.configSearchButton, "#9bb2d6")
    MNButton.setColor(self.syncConfig, "#9bb2d6")
    MNButton.setColor(self.configCustomButton, "#457bd3")
  },
  toggleSelected:function (sender) {
    sender.isSelected = !sender.isSelected
    // self.appInstance.showHUD(text,self.view.window,2)
    let title = sender.id
    self.configEngine = title
    self.words.forEach((entryName,index)=>{
      if (entryName !== title) {
        self["nameButton"+index].isSelected = false
        self["nameButton"+index].backgroundColor = MNUtil.hexColorAlpha("#9bb2d6",0.8);
      }
    })
    if (sender.isSelected) {
      self.setTextview(title)
      sender.backgroundColor = MNUtil.hexColorAlpha("#457bd3",0.8)
    }else{
      sender.backgroundColor = MNUtil.hexColorAlpha("#9bb2d6",0.8);
    }
  },
  exportConfig: async function (params) {
    let success = await webdavConfig.export()
    if (success) {
      self.configNoteIdInput.text = webdavConfig.getConfig("syncNoteId")
      webdavConfig.save("MNWebdav_config")
      self.showHUD("Export Success!")
      let dateObj = new Date(webdavConfig.getConfig("lastSyncTime"))
      MNButton.setTitle(self.syncTimeButton, "Last Sync Time: "+dateObj.toLocaleString())
    }
  },
  importConfig:async function (params) {
    try {
    let success = await webdavConfig.import()
    if (success) {
      self.refreshView("syncView")
      self.refreshView("configSearchView")
      self.showHUD("Import Success!")
    }
    } catch (error) {
      webdavUtil.addErrorLog(error, "importConfig")
    }
  },
  syncConfig: function (params) {
    let success = webdavConfig.sync()
    if (success) {
      self.refreshView("syncView")
      self.showHUD("Sync Success!")
    }
  },
  restoreConfig:async function (params) {
    let modifiedTime = webdavConfig.previousConfig?.config?.modifiedTime
    if (modifiedTime) {
      let dateObj = new Date(modifiedTime)
      let dateString = dateObj.toLocaleString()
      let confirm = await MNUtil.confirm("Restore Config", "恢复上次配置\n\n将会恢复到上次导入前的配置\n\n上次配置的修改时间："+dateString )
      if (confirm) {
        // let success = webdavConfig.importConfig(webdavConfig.previousConfig)
        // if (success) {
        //   webdavConfig.save(undefined,true)
        //   MNUtil.showHUD("✅ Restore Success!")
        //   if (webdavConfig.getConfig("autoExport")) {
        //     webdavConfig.export(true,true)
        //   }
        // }
      }
    }else{
      MNUtil.showHUD("❌ No previous config to restore!")
    }
  },
  focusConfigNoteId:function (params) {
  try {
    let syncNoteId = webdavConfig.getConfig("syncNoteId")
        let note = MNNote.new(syncNoteId)
        if (note) {
          note.focusInFloatMindMap()
        }else{
          MNUtil.showHUD("Note not exist!")
        }
  } catch (error) {
    MNUtil.showHUD("Error in focusConfigNoteId: "+error)
  }
  },
  toggleAutoExport: function (params) {
  try {
    webdavConfig.config.autoExport = !webdavConfig.getConfig("autoExport")
    MNButton.setTitle(self.autoExportButton, "Auto Export: "+(webdavConfig.getConfig("autoExport")?"✅":"❌"))
    webdavConfig.save("MNWebdav_config")
  } catch (error) {
    MNUtil.showHUD(error)
  }
  },
  toggleAutoImport: function (params) {
    webdavConfig.config.autoImport = !webdavConfig.getConfig("autoImport")
    MNButton.setTitle(self.autoImportButton, "Auto Import: "+(webdavConfig.getConfig("autoImport")?"✅":"❌"))
    webdavConfig.save("MNWebdav_config")
  },
  pasteConfigNoteId:function (params) {
    let noteId = MNUtil.clipboardText
    let note = MNNote.new(noteId)//MNUtil.getNoteById(noteId)
    if (note) {
      self.configNoteIdInput.text = note.noteId
      webdavConfig.config.syncNoteId = noteId.noteId
      webdavConfig.save("MNWebdav_config")
      MNUtil.showHUD("Save Config NoteId")
    }else{
      MNUtil.showHUD("Note not exist!")
    }
  },
  clearConfigNoteId:function (params) {
    self.configNoteIdInput.text = ""
    webdavConfig.config.syncNoteId = ""
    webdavConfig.save("MNWebdav_config")
    MNUtil.showHUD("Clear Config NoteId")
  },
  changeSyncSource: function (button) {
    let self = getWebdavController()
    let syncSource = webdavConfig.getConfig("syncSource")
    let selector = 'setSyncSource:'
    let menu = new Menu(button,self)
    menu.addMenuItem('❌  None', selector,'None',syncSource =='None')
    menu.addMenuItem('☁️  iCloud', selector,'iCloud',syncSource =='iCloud')
    menu.addMenuItem('☁️  MNNote', selector,'MNNote',syncSource =='MNNote')
    menu.show()
    // var commandTable = [
    //     self.tableItem('❌  None', selector, 'None',syncSource =='None'),
    //     self.tableItem('☁️  iCloud', selector, 'iCloud',syncSource =='iCloud'),
    //     self.tableItem('☁️  MNNote', selector, 'MNNote',syncSource =='MNNote'),
    //     // self.tableItem('☁️  Cloudflare R2', selector, 'CFR2',syncSource =='CFR2'),
    //     // self.tableItem('☁️  InfiniCloud', selector, 'Infi',syncSource =='Infi'),
    //     // self.tableItem('☁️  Webdav', selector, 'Webdav',syncSource =='Webdav')
    // ]
    // self.popover(button, commandTable,200,1)
  },
  setSyncSource: async function (source) {
    let self = getWebdavController()
    self.checkPopover()
    Menu.dismissCurrentMenu()
    let currentSource = webdavConfig.getConfig("syncSource")
    if (currentSource === source) {
      return
    }
    webdavConfig.setSyncStatus(false)
    let file
    switch (source) {
      case "iCloud":
        // MNButton.setTitle(self.exportConfigButton, "Export to iCloud")
        // MNButton.setTitle(self.importConfigButton, "Import from iCloud")
        self.configNoteIdInput.text = file
        // self.focusConfigNoteButton.hidden = true
        break;
      case "CFR2":
        file = webdavConfig.getConfig("r2file") ?? ""
        // MNButton.setTitle(self.exportConfigButton, "Export to R2")
        // MNButton.setTitle(self.importConfigButton, "Import from R2")
        MNButton.setTitle(self.focusConfigNoteButton, "Copy")
        self.configNoteIdInput.text = file
        // self.focusConfigNoteButton.hidden = true
        break;
      case "Infi":
        file = webdavConfig.getConfig("InfiFile") ?? ""
        // MNButton.setTitle(self.exportConfigButton, "Export to Infini")
        // MNButton.setTitle(self.importConfigButton, "Import from Infini")
        MNButton.setTitle(self.focusConfigNoteButton, "Copy")
        self.configNoteIdInput.text = file
        // self.focusConfigNoteButton.hidden = true
        break;
      case "Webdav":
        file = webdavConfig.getConfig("webdavFile") ?? ""
        // MNButton.setTitle(self.exportConfigButton, "Export to Webdav")
        // MNButton.setTitle(self.importConfigButton, "Import from Webdav")
        MNButton.setTitle(self.focusConfigNoteButton, "Copy")
        self.configNoteIdInput.text = file
        // self.focusConfigNoteButton.hidden = true
        break;
      case "MNNote":
        self.configNoteIdInput.text = webdavConfig.getConfig("syncNoteId")
        self.focusConfigNoteButton.hidden = false
        // MNButton.setTitle(self.exportConfigButton, "Export to Note")
        // MNButton.setTitle(self.importConfigButton, "Import from Note")
        MNButton.setTitle(self.focusConfigNoteButton, "Focus")
        break;
      default:
        break;
    }
    webdavConfig.config.syncSource = source
    MNButton.setTitle(self.syncSourceButton, "Sync Config: "+webdavConfig.getSyncSourceString(),undefined,true)
    webdavConfig.save("MNWebdav_config",true)
    self.refreshView("syncView")
  },
  stopSync:function (params) {
    self.checkPopover()
    Menu.dismissCurrentMenu()
    webdavConfig.setSyncStatus(false,false)
    MNUtil.showHUD("Stop Current Sync")
  }
});
/** @this {webdavController} */
webdavController.prototype.createWebview = function () {
    if (this.webview) {
      this.webview.removeFromSuperview()
    }
    this.webview = new UIWebView(this.view.bounds);
    this.webview.backgroundColor = UIColor.whiteColor();
    this.webview.scalesPageToFit = true;
    this.webview.autoresizingMask = (1 << 1 | 1 << 4);
    this.webview.delegate = this;
    this.webview.scrollView.delegate = this;
    this.webview.layer.cornerRadius = 15;
    this.webview.layer.masksToBounds = true;
    this.webview.layer.borderColor = MNUtil.hexColorAlpha("#9bb2d6",0.8);
    this.webview.layer.borderWidth = 0
    this.highlightColor = UIColor.blendedColor( MNUtil.hexColorAlpha("#2c4d81",0.8),
      this.appInstance.defaultTextColor,
      0.8
    );

    this.webview.hidden = true;
    this.webview.lastOffset = 0;
    this.view.addSubview(this.webview);
}

/** @this {webdavController} */
webdavController.prototype.init = function(){
    this.desktop = false
    this.createWebview()
        // let dragInteraction = UIDragInteraction(this)
        // this.view.addInteraction(dragInteraction)
    this.createButton("toolbar")
    this.toolbar.backgroundColor = MNUtil.hexColorAlpha("#727f94",0.)




    this.createButton("closeButton","closeButtonTapped:")
    this.closeButton.setTitleForState('✖️', 0);
    this.closeButton.titleLabel.font = UIFont.systemFontOfSize(10);
    this.closeButton.layer.cornerRadius = 9

    this.createButton("maxButton","maxButtonTapped:")
    this.maxButton.setTitleForState('➕', 0);
    this.maxButton.titleLabel.font = UIFont.systemFontOfSize(10);
    this.maxButton.layer.cornerRadius = 9

    this.createButton("minButton","minButtonTapped:")
    this.minButton.setTitleForState('➖', 0);
    this.minButton.titleLabel.font = UIFont.systemFontOfSize(10);
    this.minButton.layer.cornerRadius = 9

    this.createButton("moreButton","moreButtonTapped:")
    this.moreButton.setImageForState(webdavUtil.moreImage,0)
    this.moreButton.layer.cornerRadius = 9


    this.buttonScrollview = UIScrollView.new()
    this.toolbar.addSubview(this.buttonScrollview)
    this.buttonScrollview.hidden = false
    this.buttonScrollview.delegate = this
    this.buttonScrollview.bounces = true
    this.buttonScrollview.alwaysBounceVertical = false
    this.buttonScrollview.layer.cornerRadius = 8
    this.buttonScrollview.backgroundColor = MNUtil.hexColorAlpha("#c0bfbf",0.0)
    this.buttonScrollview.alwaysBounceHorizontal = true
    this.buttonScrollview.showsHorizontalScrollIndicator = false
    // this.buttonScrollview.



    this.createButton("engineButton","searchButtonTapped:","toolbar")
    this.engineButton.titleLabel.font = UIFont.boldSystemFontOfSize(15);
    this.updateEngineButton()
    MNButton.addLongPressGesture(this.engineButton, this, "onLongPressSearch:")

    this.createButton("backButton","backButtonTapped:","buttonScrollview")
    this.backButton.setImageForState(webdavUtil.gobackImage,0)
    MNButton.addLongPressGesture(this.backButton, this, "onLongPressBack:")

    this.createButton("homeButton","homeButtonTapped:","buttonScrollview")
    this.homeButton.setImageForState(webdavUtil.homeImage,0)
    MNButton.addLongPressGesture(this.homeButton, this, "onLongPressHome:")


    this.createButton("refreshButton","refreshButtonTapped:","buttonScrollview")
    this.refreshButton.setImageForState(webdavUtil.reloadImage,0)

    this.createButton("moveButton","moveButtonTapped:")
    MNButton.addLongPressGesture(this.moveButton, this, "onLongPress:")

    // <<< refresh button <<<
    this.moveGesture = new UIPanGestureRecognizer(this,"onMoveGesture:")
    this.moveButton.addGestureRecognizer(this.moveGesture)
    this.moveGesture.view.hidden = false
    this.moveGesture.addTargetAction(this,"onMoveGesture:")

    MNButton.addPanGesture(this.engineButton, this, "onResizeGesture:")

    // this.resizeGesture = new UIPanGestureRecognizer(this,"onResizeGesture:")
    // this.resizeGesture.view.hidden = false
    // this.resizeGesture.addTargetAction(this,"onResizeGesture:")

}
/** @this {webdavController} */
webdavController.prototype.homePage = function() {
try {
  this.webview.stopLoading();
  if (webdavConfig.getConfig("first")) {
    this.connectionPage()
  }else{
    MNConnection.loadFile(this.webview, webdavUtil.mainPath+"/index.html",webdavUtil.mainPath)
  }
  // MNUtil.showHUD("Loading HomePage")
  // let useLocalHomePage = webdavConfig.getConfig("useLocalHomePage")
  // if (useLocalHomePage) {
  //   let html = this.homePageHtml()
  //   this.webview.loadHTMLStringBaseURL(html)
  // } else {
  //   MNConnection.loadRequest(this.webview, homePage.url)
  // }
  // return
  this.inHomePage = true
  
  // this.webview.loadFileURLAllowingReadAccessToURL(
  //   NSURL.fileURLWithPath(webdavUtil.mainPath + '/milkdown.html'),
  //   NSURL.fileURLWithPath(webdavUtil.mainPath + '/')
  // );
  this.webview.hidden = false
  this.searchedText = "";
  // MNUtil.delay(0.5).then(()=>{
  //   this.runJavaScript("initMilkdown()")
  // })
  } catch (error) {
  webdavUtil.addErrorLog(error, "homePage")
}
  // this.mdxDictView.hidden = false
  // var url = `${this.webview.url}#en/${this.webview.lanCode}/${encodeURIComponent(text.replaceAll('/', '\\/'))}`;
};

/** @this {webdavController} */
webdavController.prototype.connectionPage = async function() {
try {
  this.webview.stopLoading();
  MNConnection.loadFile(this.webview, webdavUtil.mainPath+"/webdav-config.html",webdavUtil.mainPath)
  this.webview.hidden = false
  this.searchedText = "";
  // await MNUtil.delay(1)
  // this.initConnectionPage()
  } catch (error) {
  webdavUtil.addErrorLog(error, "connectionPage")
}
};

/** @this {webdavController} */
webdavController.prototype.initConnectionPage = function() {
  let configAll = webdavConfig.config
  // MNUtil.copy(configAll)
  this.runJavaScript(`init('${encodeURIComponent(JSON.stringify(configAll))}')`, 0)

}
/** @this {webdavController} */
webdavController.prototype.setToolbar = async function(state) {
  webdavConfig.toolbar = state
  this.buttonScrollview.hidden = !webdavConfig.toolbar

}

/** @this {webdavController} */
webdavController.prototype.updateDeeplOffset = async function() {
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
/** @this {webdavController} */
webdavController.prototype.updateBaiduOffset = function() {
  if(!this.webview || !this.webview.window)return;
  this.runJavaScript(`document.getElementsByClassName("new-header")[0].style.display = "none";`)
  this.shouldCopy = false
  this.shouldComment = false
};

/** @this {webdavController} */
webdavController.prototype.updateBingOffset = function() {
  if(!this.webview || !this.webview.window)return;
  this.runJavaScript(`document.getElementById("bnp_container").style.display = "none";`)
};

/** @this {webdavController} */
webdavController.prototype.updateYoudaoOffset = async function() {
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

    if (!webdavUtil.isNSNull(result) && this.shouldCopy) {
      MNUtil.copy(result)
    }
    if (!webdavUtil.isNSNull(result) && this.shouldComment) {
      MNUtil.undoGrouping(()=>{
        MNUtil.getNoteById(this.currentNoteId).appendTextComment(ret)
      })
    }
    this.shouldCopy = false
    this.shouldComment = false
  }
};
/** @this {webdavController} */
webdavController.prototype.updateRGOffset = function() {
  if(!this.webview || !this.webview.window)return;
  this.runJavaScript(`document.getElementsByClassName("header")[0].style.display = "none"`)
  this.shouldCopy = false
  this.shouldComment = false
};

/** 
 * @this {webdavController}
 * @returns {Promise<string|undefined>}
  */
webdavController.prototype.runJavaScript = async function(script,delay) {
  if(!this.webview || !this.webview.window)return;
  return new Promise((resolve, reject) => {
    if (delay) {
      this.viewTimer = NSTimer.scheduledTimerWithTimeInterval(delay, true, () => {
        this.webview.evaluateJavaScript(script,(result) => {
          if (MNUtil.isNSNull(result)) {
            resolve(undefined)
          }else{
            resolve(result)
          }
        });
      })
    }else{
      this.webview.evaluateJavaScript(script,(result) => {
          if (MNUtil.isNSNull(result)) {
            resolve(undefined)
          }else{
            resolve(result)
          }
      });
    }
  })
};

/** @this {webdavController} */
webdavController.prototype.updateBilibiliOffset = function() {
  if(!this.webview || !this.webview.window)return;
  // MNUtil.showHUD("updateBilibiliOffset")
  this.runJavaScript(`document.getElementsByClassName("recommended-swipe grid-anchor")[0].style.display = "none";`,0.5)
};

/** @this {webdavController} */
webdavController.prototype.updateBilibiliPCOffset = function() {
  if(!this.webview || !this.webview.window)return;
  this.runJavaScript(`document.getElementById("biliMainHeader").style.display = "none";`,1)
  this.shouldCopy = false
  this.shouldComment = false
};

/** @this {webdavController} */
webdavController.prototype.updateThesaurusOffset = function() {
  if(!this.webview || !this.webview.window)return;
  this.viewTimer = NSTimer.scheduledTimerWithTimeInterval(2, true, () => {
    this.runJavaScript(getWebJS("updateThesaurusOffset"))
    this.viewTimer.invalidate();
  });
  this.shouldCopy = false
  this.shouldComment = false
};

/** @this {webdavController} */
webdavController.prototype.getCurrentURL = async function() {
  if(!this.webview || !this.webview.window) return;
  let url = await this.runJavaScript(`window.location.href`)
  this.webview.url = url
  return url
};
/** @this {webdavController} */
webdavController.prototype.getSelectedTextInWebview = async function() {
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

/** @this {webdavController} */
webdavController.prototype.getTextInWebview = async function() {
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

/** @this {webdavController} */
webdavController.prototype.changeButtonOpacity = function(opacity) {
    this.toolbar.layer.opacity = opacity
    this.moveButton.layer.opacity = opacity
    this.maxButton.layer.opacity = opacity
    this.minButton.layer.opacity = opacity
    this.moreButton.layer.opacity = opacity
    this.closeButton.layer.opacity = opacity
}

/** @this {webdavController} */
webdavController.prototype.setButtonLayout = function (button,targetAction) {
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

/** @this {webdavController} */
webdavController.prototype.createButton = function (buttonName,targetAction,superview) {
    this[buttonName] = UIButton.buttonWithType(0);
    this[buttonName].autoresizingMask = (1 << 0 | 1 << 3);
    this[buttonName].setTitleColorForState(UIColor.whiteColor(),0);
    this[buttonName].setTitleColorForState(this.highlightColor, 1);
    this[buttonName].backgroundColor = MNUtil.hexColorAlpha("#9bb2d6",0.8)
    this[buttonName].layer.cornerRadius = 10;
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

/** @this {webdavController} */
webdavController.prototype.settingViewLayout = function (){
  try {
  

    let viewFrame = this.view.bounds
    let width = viewFrame.width
    let height = viewFrame.height
    width = width-16
    height = height -60
    MNFrame.set(this.settingView, 8, 20, width, height)
    MNFrame.set(this.configSearchView, 0, 40, width, height-10)
    MNFrame.set(this.customButtonView, 0, 40, width, height-40)
    MNFrame.set(this.advanceView, 0, 40, width, height-10)
    MNFrame.set(this.syncView, 0, 40, width, height-10)
    this.customButtonView.contentSize = {width:width-20,height:360+35}
    this.orderButton.frame = MNUtil.genFrame(5,0,width-10,35)
    this.setHomepageButton.frame = MNUtil.genFrame(5,40,width-10,35)
    this.timestampDetail.frame = MNUtil.genFrame(5,80,width-10,35)
    this.autoOpenVideoExcerpt.frame = MNUtil.genFrame(5,120,width-10,35)
    this.opacityButton.frame = MNUtil.genFrame(5,160,130,35)
    this.slider.frame = MNUtil.genFrame(145,162,width-160,35)
    MNFrame.set(this.textviewInput, 5, 185, width-10, height-230)
    this.uploadButton.frame = {x:width-81,y:height-80,width:70,height:30}

    this.scrollview.frame = {x:5,y:0,width:width-10,height:180};
    this.scrollview.contentSize = {width:width-20,height:height};
    this.moveUpButton.frame = {x:width-40,y:5,width:30,height:30}
    this.moveDownButton.frame = {x:width-40,y:40,width:30,height:30}
    this.newEntryButton.frame = {x:width-40,y:75,width:30,height:30}
    this.configReset.frame = {x:width-40,y:110,width:30,height:30}
    this.deleteButton.frame = {x:width-40,y:145,width:30,height:30}
    //syncView
    this.syncSourceButton.frame = MNUtil.genFrame(10, 10, width-20, 35)
    this.configNoteIdInput.frame = MNUtil.genFrame(10,50,width-20,70)
    this.syncTimeButton.frame = MNUtil.genFrame(10,125,width-20,35)
    this.exportConfigButton.frame = MNUtil.genFrame(15+(width-25)*0.5,165,(width-25)*0.5,35)
    this.importConfigButton.frame = MNUtil.genFrame(10,165,(width-25)*0.5,35)
    this.autoExportButton.frame = MNUtil.genFrame(15+(width-25)*0.5,205,(width-25)*0.5,35)
    this.autoImportButton.frame = MNUtil.genFrame(10,205,(width-25)*0.5,35)
    this.pasteConfigNoteButton.frame = MNUtil.genFrame(width-75,85,60,30)
    this.clearConfigNoteButton.frame = MNUtil.genFrame(width-140,85,60,30)
    this.focusConfigNoteButton.frame = MNUtil.genFrame(width-205,85,60,30)
    this.restoreConfigButton.frame = MNUtil.genFrame(10, height-85, width-20, 35)

    let settingFrame = this.settingView.bounds
    settingFrame.x = 5
    settingFrame.y = 5
    settingFrame.height = 30
    settingFrame.width = this.configSearchButton.width
    this.configSearchButton.frame = settingFrame
    settingFrame.x = settingFrame.x + this.configSearchButton.width + 4.5
    settingFrame.width = this.configWebappButton.width
    this.configWebappButton.frame = settingFrame
    settingFrame.x = settingFrame.x + this.configWebappButton.width + 4.5
    settingFrame.width = this.configCustomButton.width
    this.configCustomButton.frame = settingFrame
    settingFrame.x = settingFrame.x + this.configCustomButton.width + 4.5
    settingFrame.width = this.syncConfig.width
    this.syncConfig.frame = settingFrame
    settingFrame.x = settingFrame.x + this.syncConfig.width + 4.5
    settingFrame.width = this.advancedButton.width
    this.advancedButton.frame = settingFrame
    MNFrame.set(this.closeConfig, width - 35, 5, 30, 30)

  } catch (error) {
    webdavUtil.addErrorLog(error, "settingViewLayout")
  }
}


/** @this {webdavController} */
webdavController.prototype.setSplitScreenFrame = function (mode) {  
  let studyFrame = MNUtil.studyView.bounds
  let height = studyFrame.height;
  let width = studyFrame.width;
  let splitLine = MNUtil.splitLine ?? width/2.
  let targetFrame
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
    this.view.frame = MNUtil.genFrame(40,0,width-80,height)
    break;
  default:
    break;
  }
  this.currentFrame = this.view.frame
}
/** @this {webdavController} */
webdavController.prototype.toMinimode = function (frame,lastFrame) {
  this.miniMode = true 
  if (lastFrame) {
    this.lastFrame = lastFrame
  }else{
    this.lastFrame = this.view.frame 
  }
  this.webview.hidden = true
  this.currentFrame  = this.view.frame
  this.hideAllButton()
  this.view.layer.borderWidth = 0
  let color = this.desktop ? "#b5b5f5":"#9bb2d6"
  this.view.layer.backgroundColor = MNUtil.hexColorAlpha(color,0.8)
  this.view.layer.borderColor = MNUtil.hexColorAlpha(color,0.8)
  MNUtil.animate(()=>{
    this.setFrame(frame)
  }).then(()=>{
    this.moveButton.frame = MNUtil.genFrame(0,0,40,40)
    this.moveButton.hidden = false
    this.moveButton.setImageForState(webdavUtil.homeImage,0)
  })
}
/** @this {webdavController} */
webdavController.prototype.setWebMode = function (desktop = false) {
  if (desktop) {
    this.desktop = true
    this.webview.customUserAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Safari/605.1.15'
    this.setAllButtonColor("#b5b5f5")
  }else{
    this.desktop = false
    this.webview.customUserAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148'
    this.setAllButtonColor("#9bb2d6")
  }
}

/** @this {webdavController} */
webdavController.prototype.setAllButtonColor = function (color = "#9bb2d6") {
  MNButton.setColor(this.moveButton, color,0.8)
  MNButton.setColor(this.closeButton, color,0.8)
  MNButton.setColor(this.maxButton, color, 0.8)
  MNButton.setColor(this.minButton, color, 0.8)
  MNButton.setColor(this.moreButton, color, 0.8)
  MNButton.setColor(this.engineButton, color, 0.8)
  MNButton.setColor(this.homeButton, color, 0.8)
  MNButton.setColor(this.backButton, color, 0.8)
  MNButton.setColor(this.refreshButton, color, 0.8)


}
/** @this {webdavController} */
webdavController.prototype.hideAllButton = function (frame) {
  this.moveButton.hidden = true
  this.closeButton.hidden = true
  this.maxButton.hidden = true
  this.minButton.hidden = true
  this.moreButton.hidden = true
  this.toolbar.hidden = true
}
/** @this {webdavController} */
webdavController.prototype.showAllButton = function (frame) {
  this.moveButton.hidden = false
  this.closeButton.hidden = false
  this.maxButton.hidden = false
  this.minButton.hidden = false
  this.moreButton.hidden = false
  this.toolbar.hidden = false
}
/** @this {webdavController} */
webdavController.prototype.show = function (beginFrame,endFrame) {
  let preFrame = this.currentFrame
  let studyFrame = MNUtil.studyView.frame
  if (endFrame) {
    preFrame = endFrame
  }
  preFrame.x = MNUtil.constrain(preFrame.x, 0, studyFrame.width-preFrame.width)
  preFrame.y = MNUtil.constrain(preFrame.y, 0, studyFrame.height-preFrame.height)
  preFrame.width = MNUtil.constrain(preFrame.width, 215, studyFrame.width)
  preFrame.height = MNUtil.constrain(preFrame.height, 100, studyFrame.height)
  let preOpacity = this.view.layer.opacity
  // studyController().view.bringSubviewToFront(this.view)
  this.view.layer.opacity = 0.2
  if (beginFrame) {
    this.setFrame(beginFrame)
  }
  this.view.hidden = false
  if (this.miniMode) {
    this.webview.layer.borderWidth = 0
  }else{
    this.webview.layer.borderWidth = 3
  }
  this.miniMode = false
  this.webview.hidden = false
  this.hideAllButton()
  this.updateEngineButton()
  this.moreButton.hidden = true
  this.onAnimate = true
  MNUtil.animate(()=>{
    this.view.layer.opacity = preOpacity
    this.setFrame(preFrame)
  }).then(()=>{
    MNUtil.studyView.bringSubviewToFront(this.view)
    this.webview.layer.borderWidth = 0
    this.view.layer.borderWidth = 0
    this.webview.hidden = false
    this.view.backgroundColor = MNUtil.hexColorAlpha("#9bb2d6",0.0)
    this.moveButton.setImageForState(undefined,0)
    this.onAnimate = false
    this.showAllButton()
    this.view.setNeedsLayout()
  })
}
/** @this {webdavController} */
webdavController.prototype.hide = function (frame) {
  let preFrame = this.view.frame
  let preOpacity = this.view.layer.opacity
  let preCustom = this.custom
  // let preFrame = this.view.frame
  this.webview.hidden = false
  if (this.settingView) {
    this.settingView.hidden = true
  }
  this.hideAllButton()
  this.custom = false
  if (frame) {
    this.webview.layer.borderWidth = 3
  }
  MNUtil.animate(()=>{
    this.view.layer.opacity = 0.2
    if (frame) {
      this.setFrame(frame)
    }
  }).then(()=>{
    this.view.hidden = true;
    this.view.layer.opacity = preOpacity      
    this.setFrame(preFrame)
    // MNUtil.showHUD("message"+this.currentFrame.width)
    // MNUtil.copyJSON(this.view.currentFrame)
    this.webview.layer.borderWidth = 0
    this.custom = preCustom
  })
}
/** @this {webdavController} */
webdavController.prototype.setFrame = function(x,y,width,height){
    if (typeof x === "object") {
      this.view.frame = x
    }else{
      this.view.frame = MNUtil.genFrame(x, y, width, height)
    }
    this.currentFrame = this.view.frame
  }

/** @this {webdavController} */
webdavController.prototype.creatView = function (viewName,superview="view",color="#9bb2d6",alpha=0.8) {
  this[viewName] = UIView.new()
  this[viewName].backgroundColor = MNUtil.hexColorAlpha(color,alpha)
  this[viewName].layer.cornerRadius = 12
  this[superview].addSubview(this[viewName])
}

/** @this {webdavController} */
webdavController.prototype.creatTextView = function (viewName,superview="view",color="#c0bfbf",alpha=0.8) {
  this[viewName] = UITextView.new()
  this[viewName].font = UIFont.systemFontOfSize(15);
  this[viewName].layer.cornerRadius = 8
  this[viewName].backgroundColor = MNUtil.hexColorAlpha(color,alpha)
  this[viewName].textColor = UIColor.blackColor()
  this[viewName].delegate = this
  this[viewName].bounces = true
  this[superview].addSubview(this[viewName])
}

webdavController.prototype.refreshView = function (targetView) {
try {

  let syncSource = webdavConfig.getConfig("syncSource")
  switch (targetView) {
    case "syncView":
      this.configNoteIdInput.text = webdavConfig.getConfig("syncNoteId")
      this.configNoteIdInput.hidden = (syncSource === "iCloud" || syncSource === "None")
      this.focusConfigNoteButton.hidden = (syncSource === "iCloud" || syncSource === "None")
      this.clearConfigNoteButton.hidden = (syncSource === "iCloud" || syncSource === "None")
      this.pasteConfigNoteButton.hidden = (syncSource === "iCloud" || syncSource === "None")
      MNButton.setTitle(this.autoExportButton, "Auto Export: "+(webdavConfig.getConfig("autoExport")?"✅":"❌"))
      MNButton.setTitle(this.autoImportButton, "Auto Import: "+(webdavConfig.getConfig("autoImport")?"✅":"❌"))
      let dateObj = new Date(webdavConfig.getConfig("lastSyncTime"))
      MNButton.setTitle(this.syncTimeButton, "Last Sync Time: "+dateObj.toLocaleString())
      break;
    case "configSearchView":
      if (this.configMode === 0) {
        this.setButtonText(webdavConfig.entrieNames,webdavConfig.engine)
        this.setTextview(webdavConfig.engine)
      }else{
        this.setButtonText(webdavConfig.webAppEntrieNames,this.webApp)
        this.setTextview(this.webApp)
      }
      break;
    default:
      break;
  }
  
} catch (error) {
  webdavUtil.addErrorLog(error, "refreshView")
}
}
webdavController.prototype.getCurrentURL = async function(url) {
  return new Promise((resolve, reject) => {
    if(!this.webview || !this.webview.window)return;
    this.webview.evaluateJavaScript(
      `window.location.href`,
      (ret) => {
        this.webview.url = ret
        resolve(ret)
      }
    );
  })
};
/** @this {webdavController} */
webdavController.prototype.openOrJump = async function(bvid,time,p) {
try {
  

  if (this.view.hidden) {
    MNUtil.showHUD(`window is hidden`)
    return
  }
  let timestamp = await this.getTimestamp()

  // await this.getCurrentURL()

  // let res = this.webview.url.match(/(?<=bilibili.com\/video\/)\w+/);
  // // MNUtil.copy("bv:"+this.webview.url)
  // if (res) {
  //   this.currentBvid = res[0]
  // }else{
  //   this.currentBvid = ""
  // }
  let formatedVideoTime = webdavUtil.formatSeconds(parseFloat(time))
  if (this.currentBvid && this.currentBvid === bvid && (this.currentP === p)) {
    MNUtil.showHUD(`Jump to ${formatedVideoTime}`)
    this.runJavaScript(`document.getElementsByTagName("video")[0].currentTime = ${time}`)
  }else{
    //  Application.sharedInstance().showHUD("should open", this.view.window, 2);
    this.currentBvid = bvid
    var url = `https://www.bilibili.com/`+bvid+`?t=`+time
    if (p) {
      url = url+"&p="+p
    }
    MNUtil.showHUD(url)
    this.setWebMode(true)
    MNConnection.loadRequest(this.webview, url)
    // this.runJavaScript(`window.location.href="${url}"`)
  }
} catch (error) {
  webdavUtil.addErrorLog(error, "openOrJump")
}
};
/** @this {webdavController} */
webdavController.prototype.openOrJumpForYT = async function(Ytid,time) {
try {
  let parseTime = parseInt(time)
  if (this.view.hidden) {
     Application.sharedInstance().showHUD(`window is hidden`, this.view.window, 2);
    return
  }
  await this.getCurrentURL()
  let res = this.webview.url.match(/(?<=youtube.com\/watch\?t\=.*&v\=)\w+/);
  if (res) {
    this.currentYtid = res[0]
  }else{
    this.currentYtid = ""
  }
  let formatedVideoTime = webdavUtil.formatSeconds(parseTime)
  // NSUserDefaults.standardUserDefaults().synchronize();
  // let object = NSUserDefaults.standardUserDefaults().objectForKey("UserAgent");
    //  Application.sharedInstance().showHUD(text, this.view.window, 2);
  if (this.currentYtid && this.currentYtid === Ytid) {
    MNUtil.showHUD(`Jump to ${formatedVideoTime}`)
    this.runJavaScript(`document.getElementsByTagName("video")[0].currentTime = ${parseTime}`)
  }else{
    //  Application.sharedInstance().showHUD("should open", this.view.window, 2);
    this.currentYtid = Ytid
    var url = `https://youtu.be/`+Ytid+`?t=`+parseTime
    MNUtil.showHUD(url)
    MNConnection.loadRequest(this.webview, url)
  }
} catch (error) {
  webdavUtil.addErrorLog(error, "openOrJump")
}
};
/** @this {webdavController} */
webdavController.prototype.getTimestamp = async function(){
  let videoTime = await this.runJavaScript(`document.getElementsByTagName('video')[0].currentTime.toFixed(2);`)
  if (videoTime) {
    let url = await this.runJavaScript(`window.location.href`)
    let res = url.match(/(?<=bilibili.com\/video\/)\w+/);
    if (res) {
      let timestamp = {time:parseFloat(videoTime),bv:res[0]}
      this.currentBvid = timestamp.bv
      let testP = url.match(/(?<=bilibili.com\/video\/.+(\?|&)p\=)\d+/);
      if (testP) {
        timestamp.p = parseInt(testP[0])
        this.currentP = timestamp.p
      }else{
        this.currentP = 0
      }
      // https://www.bilibili.com/video/BV1F34y1h7so/?p=4
      // https://www.bilibili.com/video/BV1F34y1h7so?p=4
      return timestamp
    }
    this.currentBvid = ""
    this.currentP = 0
    return {time:parseFloat(videoTime)}
  }
  return undefined
}
/** @this {webdavController} */
webdavController.prototype.getVideoFrameInfo = async function(){
try {
    let imageBase64 = await this.runJavaScript(`
function getImage() {
// try {
  const video = document.getElementsByTagName('video')[0];
  video.crossOrigin = "anonymous"; // 尝试设置crossOrigin属性
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  canvas.width = video.videoWidth*2;
  canvas.height = video.videoHeight*2;
  context.drawImage(video, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/png');
// } catch (error) {
//   return error.toString()
// }
};
getImage();
`)
    if (webdavUtil.isNSNull(imageBase64)) {
        MNUtil.showHUD("Capture video frame failed!")
      return undefined
      let width = this.view.frame.width>1000?this.view.frame.width:1000
      let image = await this.screenshot(width)
      if (!image) {
        MNUtil.showHUD("Capture video frame failed!")
        return undefined
      }
      imageBase64 = 'data:image/png;base64,'+image.base64Encoding()
    }
    // let videoTime = await this.runJavaScript(`document.getElementsByTagName('video')[0].currentTime.toFixed(2);`)
    let timestamp = await this.getTimestamp(this.webview.url)
    if (timestamp) {
      timestamp.image = imageBase64
    }
    return timestamp


    // let res = this.webview.url.match(/(?<=bilibili.com\/video\/)\w+/);
    // if (res) {
    // // https://www.bilibili.com/video/BV1F34y1h7so?p=2
    //   let testP = this.webview.url.match(/(?<=bilibili.com\/video\/\w+\?p\=)\d+/);
    //   // MNUtil.copyJSON(testP)
    //   if (testP) {
    //     return {
    //       image:imageBase64,
    //       time:parseFloat(videoTime),
    //       bv:res[0],
    //       p:testP[0]
    //     }
    //   }
    //   return {
    //     image:imageBase64,
    //     time:parseFloat(videoTime),
    //     bv:res[0]
    //   }
    // }else{
    //   res = this.webview.url.match(/(?<=youtube.com\/watch\?v\=)\w+/);
    //   if (res) {
    //     return {
    //       image:imageBase64,
    //       time:parseFloat(videoTime),
    //       yt:res[0]
    //     }
    //   }
    //   res = this.webview.url.match(/(?<=youtube.com\/watch\?t\=.*&v\=)\w+/);
    //   if (res) {
    //     return {
    //       image:imageBase64,
    //       time:parseFloat(videoTime),
    //       yt:res[0]
    //     }
    //   }
    // }
    // return {
    //   image:imageBase64,
    //   time:parseFloat(videoTime)
    // }
} catch (error) {
  webdavUtil.addErrorLog(error, "getVideoFrameInfo")
  return undefined
}
}

/**
 * 
 * @param {*} width 
 * @returns {Promise<NSData>}
 */
webdavController.prototype.screenshot = async function(width){
  return new Promise((resolve, reject) => {
    this.webview.takeSnapshotWithWidth(width,(snapshot)=>{
      resolve(snapshot.pngData())
    })
  })
}

/**
 * @this {webdavController}
 */
webdavController.prototype.blur = async function (delay = 0) {
  if (delay) {
    MNUtil.delay(delay).then(()=>{
      this.runJavaScript(`document.activeElement.blur()`)
      this.webview.endEditing(true)
    })
  }else{
    this.runJavaScript(`document.activeElement.blur()`)
    this.webview.endEditing(true)
  }
}

webdavController.prototype.animateTo = function(frame){
  this.onAnimate = true
  MNUtil.animate(()=>{
    this.view.frame = frame
    this.currentFrame = frame
  }).then(()=>{
    this.onAnimate = false
  })
}
webdavController.prototype.checkPopover = function(){
  if (this.view.popoverController) {this.view.popoverController.dismissPopoverAnimated(true);}
}
webdavController.prototype.refreshLastSyncTime = function () {
  let dateObj = new Date(webdavConfig.getConfig("lastSyncTime"))
  MNButton.setTitle(this.syncTimeButton, "Last Sync Time: "+dateObj.toLocaleString())
  this.refreshView("syncView")
  this.refreshView("configSearchView")
}
webdavController.prototype.updateEngineButton = function(){
  this.engineButton.setTitleForState(webdavConfig.currentConfig.name || webdavConfig.currentConfig.sourceName, 0);
}
/**
 * @this {webdavController}
 * @param {string} title 
 * @param {number} duration 
 * @param {UIView} view 
 */
webdavController.prototype.showHUD = function (title,duration = 1.5,view = this.view) {
  MNUtil.showHUD(title,duration,view)
}


/** @this {webdavController} */
webdavController.prototype.loadDirectory = function (xmlText, path) {
try {
  // const jsonObj = webdavConfig.parseDirectoryListing(xmlText);
  // MNUtil.copy(jsonObj)
  // MNUtil.copy(`fileManager.loadDirectoryFromAddon("${encodeURIComponent(xmlText)}", "${encodeURIComponent(path)}")`)
  this.runJavaScript(`fileManager.loadDirectoryFromAddon("${encodeURIComponent(xmlText)}", "${encodeURIComponent(path)}",'${webdavConfig.getConfig("order")}')`)
  // MNUtil.showHUD("loadDirectory")
    
} catch (error) {
  webdavUtil.addErrorLog(error, "loadDirectory")
}
}

/** @this {webdavController} */
webdavController.prototype.navigateBack = function() {
  this.runJavaScript(`fileManager.navigateBack()`)
}

/** @this {webdavController} */
webdavController.prototype.handleConnect = async function () {  try {
  this.waitHUD("Loading...")
  if (!webdavConfig.webdav) {
    // MNUtil.copy("webdav not initilized")
    return
  }
  let path = "/"
  let res = await webdavConfig.webdav.listDirectory(path)
  this.currentPath = path
  // MNUtil.copy(res)
  if (typeof res === "object" && "error" in res) {
    MNUtil.confirm("MN Webdav", "加载失败\n\n"+res.error)
    MNUtil.stopHUD()
    return
  }
  let config = {
    baseUrl: webdavConfig.webdav.baseUrl,
    username: webdavConfig.webdav.username,
    password: webdavConfig.webdav.password,
    path: path,
    xmlText: res
  }
  // MNUtil.copy(`fileManager.handleConnectFromAddon('${encodeURIComponent(JSON.stringify(config))}')`)
  this.runJavaScript(`fileManager.handleConnectFromAddon('${encodeURIComponent(JSON.stringify(config))}','${webdavConfig.getConfig("order")}')`)
  await MNUtil.delay(0.3)
  MNUtil.stopHUD()
      
  } catch (error) {
    webdavUtil.addErrorLog(error, "handleConnect")
  }
}

/** @this {webdavController} */
webdavController.prototype.testConnect = async function (config) {  
try {
  this.waitHUD("Testing...")
  let tem = WebDAV.new(config)
  let path = "/"
  let res = await tem.listDirectory(path,"0")
  if (!res) {
    MNUtil.stopHUD()
    return
  }
  if (typeof res === "object" && "error" in res) {
    // MNUtil.copy(res)
    MNUtil.confirm("MN Webdav", "加载失败\n\n"+res.error)
    MNUtil.stopHUD()
    return
  }
  MNUtil.stopHUD()
  this.runJavaScript(`showToast('连接成功:"${config.name || config.sourceName}"','success')`)
      
  } catch (error) {
    webdavUtil.addErrorLog(error, "testConnect")
  }
}

/** @this {webdavController} */
webdavController.prototype.refreshAfterAction = async function (toast,type = 'success') {
  if (toast) {
  this.runJavaScript(`fileManager.showToast('${toast}','${type}')`)
  }
  if (type === 'error') {
    return
  }
  let path = this.currentPath
  webdavConfig.webdav.listDirectory(path).then((res)=>{
    this.loadDirectory(res, path)
  })
}

/** @this {webdavController} */
webdavController.prototype.showToast = async function (toast,type = 'info') {
  if (toast) {
    this.runJavaScript(`fileManager.showToast('${toast}','${type}')`)
  }
}
/**
 * @this {webdavController}
 * @param {string} title 
 * @param {UIView} view 
 */
webdavController.prototype.waitHUD = function (title,view = this.view) {
  MNUtil.waitHUD(title,view)
}

webdavController.prototype.isFileManagerPage = async function () {
  let tem = await this.runJavaScript(`isFileManagerPage`)
  if (tem) {
    let res = parseInt(tem)
    if (res === 0) {
      return false
    }
    return true
  }else{
    return false
  }
  // return fileManagerPage
}
/** @this {webdavController} */
 webdavController.prototype.executeAction = async function (config){
  let confirm = false
  try {
      // MNUtil.copy(config)
      switch (config.host) {
        case "saveconfig":
          let params = config.params
          webdavConfig.config.first = false
          webdavConfig.config.sourceConfigs = params.sourceConfigs
          webdavConfig.config.currentSourceId = params.currentSourceId
          webdavConfig.config.sources = params.sources
          webdavConfig.save("MNWebdav_config")
          webdavConfig.refresh(self)
          this.updateEngineButton()
          break;
        case "opensetting":
          this.connectionPage()
          break;
        case "testconnection":
          // MNUtil.copy(config.params)

          this.testConnect(config.params)
          break;
        case "deletesource":
          let sourceIdToDelete = config.params.id
          let sourceNameToDelete = config.params.name
          let confirmed = await MNUtil.confirm("MN Webdev", `Delete source "${sourceNameToDelete}"?\n\n确定要删除源 "${sourceNameToDelete}"?\n这将同时删除该源的所有配置信息。`)
          if (confirmed) {
            delete webdavConfig.config.sourceConfigs[sourceIdToDelete]
            webdavConfig.config.sources = webdavConfig.config.sources.filter(source=> source.id !== sourceIdToDelete)
            if (sourceIdToDelete === webdavConfig.config.currentSourceId) {
              webdavConfig.config.currentSourceId = webdavConfig.config.sources[0].id
            }
            webdavConfig.save("MNWebdav_config")
            webdavConfig.refresh()
            this.updateEngineButton()
            this.initConnectionPage()
          }
          break;
        case "listdirectory":
          // MNUtil.copy(config.params)
          let path = config.params.path
          this.changeButtonOpacity(0.8)
          // let res = await webdavConfig.webdav.listDirectory(path)
          let res = await webdavConfig.listDirectory(path,this)
          if (res) {
            this.currentPath = path
            this.loadDirectory(res, path)
            await MNUtil.delay(0.1)
            this.changeButtonOpacity(1)
          }
          break;
        case "deleteItem":
          confirm = await MNUtil.confirm("MN Webdav", "是否删除当前文件: "+config.params.name)
          if (confirm) {
            this.changeButtonOpacity(0.8)
            let delelteRes = await webdavConfig.deleteItem(config.params.path,this)
            if (delelteRes) {
              this.refreshAfterAction("已删除文件: "+config.params.name)
              await MNUtil.delay(0.1)
              this.changeButtonOpacity(1)
            }
          }
          break;
        case "renameItem":
          MNUtil.log(config)
          let renameRes= await webdavConfig.webdav.renameItem(config)
          if (renameRes) {
             this.refreshAfterAction("重命名成功: "+config.params.name)
             await MNUtil.delay(0.1)
             this.changeButtonOpacity(1)
          }else{
                MNUtil.showHUD("重命名失败/取消")
          }
          // let newName = await MNUtil.input("MN Webdav", "请输入新名称\n\n"+config.name, undefined, {default: config.params.name})
          // MNUtil.log(newName)
          // switch (newName.button) {
          //   case 0:
          //     return
          //   case 1:
          //     let name = newName.input
          //     let folder = config.params.path.replace(config.params.name,"")
          //     let destPath = folder+name
          //     let fileExt = config.params.name.split(".").pop()
          //     if (fileExt && !name.endsWith("."+fileExt)) {
          //       destPath = destPath+"."+fileExt
          //     }
          //     MNUtil.log(destPath)
          //     let renameRes = await webdavConfig.webdav.moveItem(config)
          //     if (renameRes) {
          //        this.refreshAfterAction("重命名成功: "+name)
          //        await MNUtil.delay(0.1)
          //        this.changeButtonOpacity(1)
          //     }else{
          //       MNUtil.showHUD("重命名失败")
          //     }
          //     // MNUtil.copy(name)
          //     // let renameRes = await webdavConfig.renameItem(config.params.path,newName.text,this)
          //     break;
          //   default:
          //     break;
          // }
          break;
        case "download":
          // MNUtil.copy(config.params)
          webdavConfig.downloadFromConfig(config.params,this)
          break;
        case "creatfolder":
          // MNUtil.log({message:"createFolder",level:"INFO",source:"MN WebDAV",detail:config})
          let createRes = await webdavConfig.createDirectory(config.params.folderPath,this)
          if (createRes) {
             this.refreshAfterAction("已创建文件夹: "+config.params.name)
             await MNUtil.delay(0.1)
             this.changeButtonOpacity(1)
          }
          break;
        case "upload":
          await this.uploadAction(config)
          break
        default:
          break;
      }
    
  } catch (error) {
    webdavUtil.addErrorLog(error, "executeAction",config)
  }
 }

 webdavController.prototype.uploadAction = async function (config) {
          let userSelect = await MNUtil.userSelect("MN Webdav", "请选择上传项目",["当前文档","当前学习集所有文档","当前学习集备份（带PDF）","当前学习集备份（不带PDF）"])
          // MNUtil.copy("object"+userSelect)
          switch (userSelect) {
            case 0:
              return
            case 1:
              webdavUploadManager.addItemToUploadQueue(MNUtil.currentDocmd5,config.params)
              // MNUtil.copy(webdavUploadManager.uploadQueue)
              this.waitHUD("Uploading...")
              webdavUploadManager.startUpload(this)
              break;
            case 2:
              let notebook = MNUtil.currentNotebook
              // MNUtil.copy("docs:"+notebook.documents.length)

              let docs = notebook.documents
              if (docs.length > 0) {
                let first10Docs = docs.slice(0,10).map((doc,index)=>{
                  let docName = doc.docTitle
                  if (docName.length > 25) {
                    docName = docName.slice(0,25)+"..."
                  }
                  return index+1+". "+docName
                }).join("\n")
                if (docs > 10) {
                  first10Docs += "\n..."
                }
                let confirm = await MNUtil.confirm("MN Webdav", "是否上传当前学习集所有文档("+docs.length+")？\n\n"+first10Docs)
                if (confirm) {
                  for (let doc of docs) {
                    webdavUploadManager.addItemToUploadQueue(doc.docMd5,config.params)
                  }
                  MNUtil.copy(webdavUploadManager.uploadQueue)
                  this.waitHUD("Uploading...")
                  webdavUploadManager.startUpload(this)
                }
              //   if (confirm) {
              //     for (let doc of notebook.documents) {
              //       let docData = MNUtil.getFile(doc.fullPathFileName)
              //       let docName = doc.docTitle+".pdf"
              //       config.params.name = docName
              //       webdavConfig.uploadFromConfig(config.params, docData,this)
              }
              // MNUtil.showHUD("暂不支持")
              break;
            case 3:
              // MNUtil.showHUD("备份当前学习集并上传（带PDF）")
              MNUtil.showHUD("暂不支持")
              // MNUtil.copy(MNUtil.currentNotebookId)
              // MNUtil.copy(webdavUtil.mainPath+"/marginnotes")
              // MNUtil.copy(webdavUtil.mainPath+"/marginnotes/marginnotes.marginpkg")
              // MNUtil.copy(webdavUtil.mainPath+"/marginnotes/marginnotes.marginpkg")
              break;
            case 4:
              MNUtil.waitHUD("备份当前学习集（不带PDF）...")
              await MNUtil.delay(0.1)
              MNUtil.createFolderDev(webdavUtil.mainPath+"/marginnotes")
              // MNUtil.copy(webdavUtil.mainPath+"/marginnotes")
              let notebookName = MNUtil.currentNotebook.title+"("+webdavUtil.formatTimestamp()+")"+".marginnotes"
              let res = MNUtil.db.exportNotebookStorePath(MNUtil.currentNotebookId, webdavUtil.mainPath+"/marginnotes/"+notebookName)
              // MNUtil.copy(res)
              if (res) {
                MNUtil.stopHUD()
                let fileData = MNUtil.getFile(webdavUtil.mainPath+"/marginnotes/"+notebookName)
                let fileSize = (fileData.length()/1000000)
                let confirmString = "❓ 备份成功，是否上传？\n\n📔 文件名:"+notebookName+"\n\n📊 文件大小: "+fileSize.toFixed(2)+"MB"
                if (fileSize > 500) {
                  confirmString = confirmString + "\n\n❗ 注意：备份文件大小超过500MB，可能会导致上传失败(如坚果云)！"
                }
                let confirm = await MNUtil.confirm("MN Webdav", confirmString)
                if (confirm) {
                  // MNUtil.waitHUD("上传当前学习集（不带PDF）...")
                  // MNUtil.copy({path:this.currentPath,name:notebookName})
                  webdavConfig.uploadFromConfig({path:this.currentPath,name:notebookName}, fileData,this)
                }
              }
              break;
            default:
              break;
          }
 }

 