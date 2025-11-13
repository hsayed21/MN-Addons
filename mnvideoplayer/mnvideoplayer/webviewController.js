/** @return {videoPlayerController} */
const getVideoPlayerController = ()=>self
var videoPlayerController = JSB.defineClass('videoPlayerController : UIViewController  <NSURLConnectionDelegate,UIWebViewDelegate>',{
  // /** @self {videoPlayerController} */
  viewDidLoad: function() {
  try {
    let self = getVideoPlayerController()
    self.appInstance = Application.sharedInstance();
    self.custom = false;
    self.customMode = "None"
    self.miniMode = false;
    self.videoSize = {width:265,height:150}
    self.shouldCopy = false
    self.shouldComment = false
    self.preParseId = "123"
    self.selectedText = '';
    self.searchedText = '';
    self.webApp = "Bilibili"
    self.watchMode = false
    if (!(self.webApp in videoPlayerConfig.webAppEntries)) {
      self.webApp = videoPlayerConfig.webAppEntrieNames[0]
    }
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
    videoPlayerUtils.addErrorLog(error, "viewDidLoad")
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
  let self = getVideoPlayerController()
    // if (self.miniMode) {
    //   return
    // }
    let buttonHeight = 28
    let buttonWidth = 35
    var viewFrame = self.view.bounds;
    var width    = viewFrame.width
    var height   = viewFrame.height
    self.closeButton.frame = MNUtil.genFrame(width-19,0,18,18)
    self.maxButton.frame = MNUtil.genFrame(width-44,0,18,18)
    self.minButton.frame = MNUtil.genFrame(width-69,0,18,18)
    let moveButtonHeight = 18

    if (videoPlayerConfig.toolbar) {
      self.toolbar.frame = MNUtil.genFrame(0, height-buttonHeight, width,buttonHeight)
      self.engineButton.frame = {x: width - 113,y: 0,width: 115,height: buttonHeight};
    }else{
      self.toolbar.frame = MNUtil.genFrame(0,height-buttonHeight-8,width,buttonHeight)
      self.engineButton.frame = {x: width - 45,y: 0,width: 40,height: buttonHeight};
    }
    if (self.miniMode) {
      self.buttonScrollview.frame = {x: 0,y: 0,width: width,height: buttonHeight};
      self.engineButton.hidden = true
      self.minButton.hidden = true
      self.maxButton.hidden = true
      self.closeButton.hidden = true
    }else{
      self.buttonScrollview.frame = {x: 0,y: 0,width: width-116,height: buttonHeight};
      self.engineButton.hidden = false
      self.minButton.hidden = false
      self.maxButton.hidden = false
      self.closeButton.hidden = false
    }
    let x = 0
    if (self.miniMode) {
      self.goBackButton.hidden = true
      self.goForwardButton.hidden = true
      self.refreshButton.hidden = true
      self.homeButton.hidden = true
      self.webAppButton.hidden = true
    }else{
      self.goBackButton.frame = {  x:0,  y: 0,  width: buttonWidth,  height: buttonHeight,};
      x = x + buttonWidth + 3
      self.goForwardButton.frame = {  x:x,  y: 0,  width: buttonWidth,  height: buttonHeight,};
      x = x + buttonWidth + 3
      self.refreshButton.frame = {  x:x,  y: 0,  width: buttonWidth,  height: buttonHeight,};
      x = x + buttonWidth + 3
      self.homeButton.frame = {  x:x,  y: 0,  width:buttonWidth,  height: buttonHeight,};   
      x = x + buttonWidth + 3
      self.webAppButton.frame = {  x:x,  y: 0,  width: buttonWidth,  height: buttonHeight,};
      x = x + buttonWidth + 3
      self.goBackButton.hidden = false
      self.goForwardButton.hidden = false
      self.refreshButton.hidden = false
      self.homeButton.hidden = false
      self.webAppButton.hidden = false
    }
    self.customButton1.frame = {  x:x,  y: 0,  width: buttonWidth,  height: buttonHeight,};
    x = x + buttonWidth + 3
    self.customButton2.frame = {  x: x,  y: 0,  width: buttonWidth,  height: buttonHeight,};
    x = x + buttonWidth + 3
    self.customButton3.frame = {  x: x,  y: 0,  width: buttonWidth,  height: buttonHeight,};
    x = x + buttonWidth + 3
    self.customButton4.frame = {  x: x,  y: 0,  width: buttonWidth,  height: buttonHeight,};
    x = x + buttonWidth + 3
    self.customButton5.frame = {  x: x,  y: 0,  width: buttonWidth,  height: buttonHeight,};
    x = x + buttonWidth + 3
    self.customButton6.frame = {  x: x,  y: 0,  width: buttonWidth,  height: buttonHeight,};
    x = x + buttonWidth + 3
    self.customButton7.frame = {  x: x,  y: 0,  width: buttonWidth,  height: buttonHeight,};
    x = x + buttonWidth + 3
    self.customButton8.frame = {  x: x,  y: 0,  width: buttonWidth,  height: buttonHeight,};
    x = x + buttonWidth + 3
    self.customButton9.frame = {  x: x,  y: 0,  width: buttonWidth,  height: buttonHeight,};
    x = x + buttonWidth + 3
    self.customButton10.frame = {  x: x,  y: 0,  width: buttonWidth,  height: buttonHeight,};

    self.buttonScrollview.contentSize = {width: x + buttonWidth,height: buttonHeight};

    if (width <= 400) {
      // if (!self.onAnimate) {
      self.moveButton.frame = {  x: width*0.5-75,  y: 0,  width: width*0.4,  height: moveButtonHeight};
      // }
      self.moreButton.hidden = true
      self.moreButton.frame = {  x: width*0.9-70,  y: 0,  width: 25,  height: 18};
    }else{
      self.moveButton.frame = {  x: width*0.5-75,  y: 0,  width: 150,  height: moveButtonHeight};
      if (!self.onAnimate) {
        self.moreButton.hidden = false
      }
      self.moreButton.frame = {  x: width*0.5+80,  y: 0,  width: 25,  height: 18};
    }


    if (videoPlayerConfig.toolbar) {
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
      videoPlayerUtils.addErrorLog(error, "viewWillLayoutSubviews")
    }

  },

  webViewDidStartLoad: function(webView) {
  try {

    let currentURL = webView.request.URL().absoluteString();
    if (!currentURL) {return}
    let config = MNUtil.parseURL(webView.request.URL())
    // MNUtil.log({
    //   message:"webViewDidStartLoad",
    //   detail:config
    // })
    // MNUtil.copy(config)
    if (config.url === "about:blank") {
      self.refreshButton.setImageForState(videoPlayerUtils.reloadImage,0)
      self.changeButtonOpacity(1.0)
      return
    }else{
      self.refreshButton.setImageForState(videoPlayerUtils.stopImage,0)
      self.changeButtonOpacity(0.5)
    }

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
      self.refreshButton.setImageForState(videoPlayerUtils.reloadImage,0)
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
    
  } catch (error) {
    videoPlayerUtils.addErrorLog(error, "webViewDidStartLoad")
  }
  },
  /**
   * 
   * @param {UIWebView} webView 
   */
  webViewDidFinishLoad: async function(webView) {
  try {

    let self = getVideoPlayerController()
    // MNUtil.log("webViewDidFinishLoad")
    MNUtil.stopHUD()

    // MNUtil.showHUD("message")
    // MNUtil.showHUD("Finish")
    self.webview.url = webView.request.URL().absoluteString();
    let currentURL = webView.request.URL().absoluteString()
    // MNUtil.log(currentURL)
    self.refreshButton.setImageForState(videoPlayerUtils.reloadImage,0)
    self.changeButtonOpacity(1.0)
    self.isLoading = false;
    UIApplication.sharedApplication().networkActivityIndicatorVisible = false;
    let config = MNUtil.parseURL(webView.request.URL())
  } catch (error) {
    videoPlayerUtils.addErrorLog(error, "webViewDidFinishLoad")
  }
  },
  webViewDidFailLoadWithError: function(webView, error) {
    // MNUtil.showHUD("789")
    // MNUtil.log("webViewDidFailLoadWithError")
    self.refreshButton.setImageForState(videoPlayerUtils.reloadImage,0)
    // self.refreshButton.setTitleForState('🔄', 0);
    self.changeButtonOpacity(1.0)
    self.isLoading = false;
    // MNUtil.showHUD(error)
    let errorInfo = {
      code:error.code,
      domain: error.domain,
      description: error.localizedDescription,
      userInfo: error.userInfo
    }
    MNUtil.log(errorInfo)

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

    // MNUtil.log("webViewShouldStartLoadWithRequestNavigationType:"+type)
  //  https://qun.qq.com/universal-share/share?ac=1&authKey=7j5ESev4kHF%2BVOyv0MIP6xLGy7AxHqAv2aSo1zckqWUdLWKFloiCBbsmKsXAuvNY&busi_data=eyJncm91cENvZGUiOiI1MzkzMDUyMjciLCJ0b2tlbiI6IjA1c3R1azhjaVBvN1BmRUt6OGF5TXI0WEhzaEwrQ3IrN0k2ZklNU2tENnVjVzlRVlZSVFdFd3dPZGNCaG9LSlUiLCJ1aW4iOiIxNTE0NTAxNzY3In0%3D&data=g3UDk1OiVpEsWZsCg12Eau9l0pcVSSBZykMUIznWi8QSlSJfqWsr2m6VM4xiByyRC-t7sYSZmjr2z7s8dCsdxA&svctype=4&tempid=h5_group_info
  //  https://qm.qq.com/q/nuwBBTCwpi
    let currentURL = webView.request?.URL()?.absoluteString()
    let requestURL = request.URL().absoluteString()
    // MNUtil.copy(requestURL)
    // MNUtil.log(requestURL)
    // if(requestURL === 'https://doc2x.noedgeai.com/markdownEdit'){
    //   MNUtil.log("reject")
    //   return false
    // }
    
    let config = MNUtil.parseURL(requestURL)
    // videoPlayerUtils.log("webViewShouldStartLoadWithRequestNavigationType", config)
    // let currentConfig = MNUtil.parseURL(currentURL)
    // MNUtil.log({
    //   message:"webViewShouldStartLoadWithRequestNavigationType",
    //   detail:config
    // })
    // MNUtil.log(config)
    switch (config.scheme) {
      case "videoplayer":
        switch (config.host) {
          case "playVideo":
            self.openVideoPlayer(config.params)
            break;
          case "videoSize":
            // MNUtil.copy(config.params)
            let videoSize = config.params.size
            self.videoSize = videoSize
            break;
          default:
            break;
        }
        return false;
      case "zhihu":
        return false;
      case "bilibili":
        // MNUtil.log(config)
        self.runJavaScript(`document.getElementsByClassName("openapp-dialog")[0].style.display = "none";document.getElementsByClassName("openapp-btn")[0].style.display = "none";`)
        return false;
      case "blob":
        if (currentURL.startsWith("https://doc2x.noedgeai.com")) {
          self.base64FromBlob(requestURL)
          return false
        }
        if (currentURL.startsWith("https://moredraw.com") || currentURL.startsWith("http://moredraw.com")) {
          // MNUtil.showHUD("base64FromBlob")
          self.base64FromBlob(requestURL)
          return false
        }
        if (currentURL.startsWith("https://boardmix.cn")) {
          self.base64FromBlob(requestURL)
          return false
        }
        if (currentURL.startsWith("https://fireflycard.shushiai.com")) {
          self.base64FromBlob(requestURL)
          return false
        }
        // MNUtil.copy(config)
        return false;
      case "http":
      case "https":
        self.inHomePage = false
        switch (config.host) {
            case "d.bilibili":
            case "d.bilibili.com":
              // MNUtil.log(config)
              if (config.params.preUrl){
                MNConnection.loadRequest(self.webview, config.params.preUrl)
              }
              // MNUtil.log("reject d.bilibili")
              return false
            case "oia.zhihu.com":
              return false
            case "s1.hdslb.com":
              if (currentURL.startsWith("https://www.bilibili.com/video/")) {

                self.enableWideMode()
              }
              return true
            case "oia.xiaohongshu.com":
              MNUtil.confirm("MN Utils", "Open Red Note?\n\n是否打开小红书？").then(async (confirm)=>{
                let deeplink = config.params.deeplink
                if (confirm) {
                  MNUtil.openURL(deeplink)
                }
              })
              return false
        
          default:
            break;
        }
        break;
      case "mqqapi":
        MNUtil.openURL(requestURL)
        return false;
        
      case "xhsdiscover":
      case "zhihu":
        return false
      case "zotero":
      case "marginnote3app":
      case "marginnote4app":
        MNUtil.openURL(requestURL)
        return false
      case "browser":
        videoPlayerUtils.log("config",config)
        switch (config.host) {
          case "showhud":
            self.showHUD(config.params.message)
            MNUtil.stopHUD()
            return false
          case "getpdfdata":
            // MNUtil.showHUD("getpdfdata")
            let type = self.fileTypeFromBase64(config.params.content)
            videoPlayerUtils.log("type",type)
            switch (type) {
              case "pdf":
                if (currentURL.startsWith("https://doc2x.noedgeai.com")) {
                  self.importPDFFromBase64Doc2X(config.params.content,config.params.blobUrl)
                }
                if (currentURL.startsWith("https://moredraw.com") || currentURL.startsWith("http://moredraw.com")) {
                  self.importPDFFromBase64MoreDraw(config.params.content,config.params.blobUrl)
                }
                if (currentURL.startsWith("https://boardmix.cn")) {
                  self.importPDFFromBase64BoardMix(config.params.content,config.params.blobUrl)
                }
                if (currentURL.startsWith("https://fireflycard.shushiai.com")) {
                  self.importPDFFromBase64FireflyCard(config.params.content,config.params.blobUrl)
                }
                break;
              case "png":
              case "jpg":
                self.importImageFromBase64(config.params.content,config.params.blobUrl)
                break;
              default:
                self.showHUD("Unsupported file type: "+type)
                break;
            }
            // MNUtil.copy(tem[0])
            return false
          case "downloadpdf":
            self.downloadPDF(config.params)
            return false
          case "openlink":
            MNConnection.loadRequest(webView, config.params.url)
            break;
          case "opensetting":
            self.openSetting()
            break;
          case "openshortcut":
            // let content = decodeURIComponent(requestURL.split("?content=")[1])
            let shortcutInfo = config.params
            self.setWebMode(shortcutInfo.desktop)
            self.inHomePage = false
            MNConnection.loadRequest(self.webview, shortcutInfo.url)
            break;
          case "changesearchengine":
            videoPlayerConfig.config.homePageEngine = config.params.content
            break;
          case "copy":
            MNUtil.copy(config.params.content)
            break;
          case "search":
            let searchInfo = config.params
            self.search(searchInfo.text,searchInfo.engine)
            break;
          case "copyimage":
            let base64 = config.params.image
            let imageData = NSData.dataWithContentsOfURL(NSURL.URLWithString(base64))
            MNUtil.copyImage(imageData)
            MNUtil.postNotification("snipasteImage", {imageData:imageData})
            MNUtil.waitHUD("✅ Image copied")
            MNUtil.stopHUD()
            break;
          default:
            break;
        }
        return false
      case "about":
        return true
      case "itms-appss":
        return false
      case "weixin":
        self.openWX(config)
        return false
      case "imacopilot":
        // MNUtil.openURL(requestURL)
        // MNUtil.log({
        //   message:"openIMA",
        //   detail:requestURL
        // })
        self.openIMA(config)
        return false
      case "data":
        if (videoPlayerUtils.isAllowedIconLibrary(currentURL) && /data:image\/png;base64/.test(requestURL)) {
          //此时type为0
          MNUtil.postNotification("newIconImage", {imageBase64:requestURL})
          return false
        }
        break;
      case "file":
        return true
      default:
        MNUtil.showHUD("Unknown scheme: "+config.scheme)
        MNUtil.log({
          message:"Unknown scheme: "+config.scheme,
          detail:config
        })
        break;
    }
    // MNUtil.copy(config)

    // MNUtil.showHUD("type:"+type)
    // MNUtil.copyJSON({currentURL:currentURL,requestURL:requestURL,type:type,time:Date.now()})
    let redirectInfo = videoPlayerUtils.checkRedirect(requestURL)
    if (redirectInfo.isRedirect) {
      // MNUtil.showHUD("Redirect to: "+redirectInfo.redirectURL)
      MNConnection.loadRequest(webView, redirectInfo.redirectURL)
      return false
    }
    // if (requestURL.startsWith("https://graph.qq.com/jsdkproxy/PMProxy.html")) {
    //   return false
    // }

    if (type === 0) {
      let isLink = videoPlayerUtils.parseLink(requestURL)
      if (isLink.isPdfDownload) {
        let fileName = isLink.fileName
        MNUtil.delay(0.1).then(async ()=>{
          let confirm = await MNUtil.confirm("Download doc ["+fileName+"]?", "是否要下载文档 ["+fileName+"]?")
          if (confirm) {
            MNUtil.showHUD("Downloading: "+fileName)
            await MNUtil.delay(0.1)
            let targetPath = videoPlayerUtils.mainPath+"/"+fileName
            let data = NSData.dataWithContentsOfURL(MNUtil.genNSURL(requestURL))
            data.writeToFileAtomically(targetPath, false)
            let docMd5 = MNUtil.importDocument(targetPath)
            if (typeof snipasteUtils !== 'undefined') {
              MNUtil.postNotification("snipastePDF", {docMd5:docMd5,currPageNo:1})
            }else{
              let confirm = await MNUtil.confirm("🌐 MN Video Player", "Open document?\n\n是否直接打开该文档？\n\n"+fileName)
              if (confirm) {
                MNUtil.openDoc(md5,MNUtil.currentNotebookId)
                if (MNUtil.docMapSplitMode === 0) {
                  MNUtil.studyController.docMapSplitMode = 1
                }
              }
            }
            // MNUtil.openDoc(docMd5)
          }
        })
        // MNUtil.showHUD("Save to "+targetPath)
        return false
      }
    } 

    // MNUtil.copy(requestURL)
//     if (requestURL.startsWith("https://s1.hdslb.com") && /https:\/\/www\.bilibili\.com\/video\/.*/.test(currentURL)) {
//         self.runJavaScript(`
// // 存储 interval ID
// const intervalId = setInterval(() => {
//   const wideButton = document.querySelector('.bpx-player-ctrl-btn.bpx-player-ctrl-wide');
//   if (wideButton) {
//     wideButton.click(); // 点击按钮
//     clearInterval(intervalId); // 取消 interval
//   }
// }, 1000);

//         `)
// self.updateBilibiliOffset()
//         // self.runJavaScript(`document.querySelector('.bpx-player-ctrl-btn.bpx-player-ctrl-wide').click()`)
//       // MNUtil.showHUD("message")
//       return true
//     }
    // if (/^webaction\:\/\/showError/.test(requestURL)) {
    //   let error = decodeURIComponent(requestURL.split("showError=")[1])
    //   MNUtil.showHUD(error)
    //   return false
    // }

    if (videoPlayerUtils.shouldPrevent(currentURL,requestURL,type)) {
      // MNUtil.showHUD("prevent")
      MNConnection.loadRequest(self.webview, requestURL)
      return false
    }
    // if (requestURL.startsWith("https://www.bilibili.com")) {
    //   return false
    // }
    // MNUtil.copy(requestURL)
    return true;
    
  } catch (error) {
    videoPlayerUtils.addErrorLog(error, "webViewShouldStartLoadWithRequestNavigationType")
    return true 
  }
  },
  /**
   * 
   * @param {NSURLConnection} connection 
   * @param {NSURLResponse} response 
   * @returns 
   */
  connectionDidReceiveResponse: async function (connection,response) {
    MNUtil.showHUD("connectionDidReceiveResponse")
  },

  connectionDidReceiveData: async function (connection,data) {
    MNUtil.showHUD("connectionDidReceiveData")
  },
  connectionDidFinishLoading: function (connection) {
    MNUtil.showHUD("connectionDidFinishLoading")
  },
  connectionDidFailWithError: function (connection,error) {
    MNUtil.showHUD("connectionDidFailWithError")
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
  moveButtonTapped: async function(sender) {
  
    if (self.miniMode) {
      let preFrame = self.view.frame
      let studyFrame = MNUtil.studyView.bounds
      self.lastFrame.x = MNUtil.constrain(self.lastFrame.x, 0, studyFrame.width-self.lastFrame.width)
      self.lastFrame.y = MNUtil.constrain(self.lastFrame.y, 0, studyFrame.height-self.lastFrame.height)
      self.setFrame(self.lastFrame)
      self.show(preFrame)
      return
    }
    
    let menu = new Menu(sender,self)
    menu.width = 250
    menu.preferredPosition = 1
    menu.addMenuItem('🎛  Setting', 'openSettingView:','right')
    menu.addMenuItem('🎶  Into Backgroud', 'backgroundPlay:')
    menu.addMenuItem('⏭️  Auto Play Next Video', 'toggleAutoPlayNextVideo:',undefined,videoPlayerConfig.getConfig("autoPlayNextVideo"))
    menu.addMenuItem('🎬  VideoFrame → Clipboard', 'videoFrame:',self.view.frame.width>1000?self.view.frame.width:1000)
    menu.addMenuItem('🎬  VideoFrame → Snipaste', 'videoFrameToSnipaste:',self.view.frame.width>1000?self.view.frame.width:1000)
    menu.addMenuItem('🎬  VideoFrame → Editor', 'videoFrameToEditor:',self.view.frame.width>1000?self.view.frame.width:1000)
    menu.addMenuItem('🎬  VideoFrame → CurrentNote', 'videoFrameToNote:',false)
    menu.addMenuItem('🎬  VideoFrame → ChildNote', 'videoFrameToNote:',true)
    menu.addMenuItem('🎬  VideoFrame → NewNote', 'videoFrameToNewNote:',true)
    menu.addMenuItem('🎬  VideoFrame → NewComment', 'videoFrameToComment:',true)
    let sourceInfo = await self.getWebSource()
    if (sourceInfo) {
      menu.addMenuItem(sourceInfo.title, sourceInfo.selector,sourceInfo.source)
    }
    // let currentURL = await self.getCurrentURL()
    // // menu.addMenuItem('🎬  VideoFrame → NewComment', 'changeZoomScale:',true)
    // if (currentURL.startsWith("https://doc2x.noedgeai.com")) {
    //   menu.addMenuItem('📤  Upload to Doc2X', 'uploadToDoc2X:','doc2x')
    // }
    // if (currentURL.startsWith("https://ima.qq.com")) {
    //   menu.addMenuItem('📤  Upload to Ima', 'uploadToWebDefault:','ima')
    // }
    // if (currentURL.startsWith("https://www.kimi.com")) {
    //   menu.addMenuItem('📤  Upload to Kimi', 'uploadToWebDefault:','kimi')
    // }
    // if (currentURL.startsWith("https://chat.qwen.ai")) {
    //   menu.addMenuItem('📤  Upload to Qwen', 'uploadPDFToWebDefault:','qwen')
    // }
    // // if (currentURL.startsWith("https://www.doubao.com/chat/")) {
    // //   menu.addMenuItem('📤  Upload to Doubao', 'uploadToWebDefault:','doubao')
    // // }
    // if (currentURL.startsWith("https://chat.z.ai")) {
    //   menu.addMenuItem('📤  Upload to Z.ai', 'uploadPDFToWebDefault:','zhipu')
    //   // menu.addMenuItem('📤  Upload to Z.ai', 'uploadToWebDefault:','zhipu')
    // }
    // if (currentURL.startsWith("https://chat.deepseek.com")) {
    //   menu.addMenuItem('📤  Upload to DeepSeek', 'uploadToWebDefault:','deepseek')
    // }
    // if (currentURL.startsWith("https://yuanbao.tencent.com/chat")) {
    //   menu.addMenuItem('📤  Upload to Yuanbao', 'uploadToWebDefault:','yuanbao')
    //   // menu.addMenuItem('📤  Upload to Yuanbao', 'uploadPDFToWebDefault:','yuanbao')
    // }
    // if (currentURL.startsWith("https://space.coze.cn")) {
    //   menu.addMenuItem('📤  Upload to Coze', 'uploadToWebDefault:','coze')
    //   // menu.addMenuItem('📤  Upload to Yuanbao', 'uploadPDFToWebDefault:','yuanbao')
    // }
    menu.show()
  },
  toggleAutoPlayNextVideo: function () {
    let self = getVideoPlayerController()
    Menu.dismissCurrentMenu()
    let autoPlayNextVideo = !videoPlayerConfig.getConfig("autoPlayNextVideo")
    videoPlayerConfig.config.autoPlayNextVideo = autoPlayNextVideo
    MNUtil.showHUD((autoPlayNextVideo?"✅":"❌")+" Auto Play Next Video")
    self.runJavaScript(`setAutoPlayNextVideo(${autoPlayNextVideo})`)
    videoPlayerConfig.save("MNVideoPlayer_config")
    // self.autoPlayNextVideo.setTitleForState("Auto Play Next Video: "+(autoPlayNextVideo?"✅":"❌"),0)
    // self.toggleAutoPlayNextVideo()
  },
  backgroundPlay: function () {
    let self = getVideoPlayerController()
    Menu.dismissCurrentMenu()
    self.hide()
    // self.homePage()
    self.searchedText = ""
    this.runJavaScript(`document.activeElement.blur()`)
    this.webview.endEditing(true)
  },
  openDemoPage: function (button) {
    Menu.dismissCurrentMenu()
    MNConnection.loadFile(self.webview, videoPlayerUtils.mainPath + "/test.html", videoPlayerUtils.mainPath+"/")
    if (self.view.hidden) {
      self.show()
    }
  },
  changeZoomScale: async function (params) {
  try {
    let scrollview = self.webview.scrollView
  let webWidth = scrollview.contentSize.width
    MNUtil.log({
      message:"enableWideMode",
      detail:{
        maximumZoomScale:scrollview.maximumZoomScale,
        minimumZoomScale:scrollview.minimumZoomScale,
        zoomScale:scrollview.zoomScale,
        possibleZoomScales:self.view.frame.width/webWidth,
      }
    })
    scrollview.contentSize = {width:self.view.frame.width, height:scrollview.contentSize.height}
    
  } catch (error) {
    videoPlayerUtils.addErrorLog(error, "changeZoomScale")
  }
  },
  changeBilibiliVideoPart: async function (button) {
    let self = getVideoPlayerController()
    Menu.dismissCurrentMenu()
    self.changeBilibiliVideoPart(button)
    // let encodedPartInfo = await self.runJavaScript(`    
    // function getPartInfo() {
    //   let list = document.getElementsByClassName("video-pod__list multip list")[0]
    //   if (!list) {
    //     return []
    //   }
    //   let items = list.getElementsByClassName("simple-base-item video-pod__item")
    //   let partInfo = []
    //   for (let i = 0; i < items.length; i++) {
    //     let item = items[i]
    //     let title = item.getElementsByClassName("title")[0].textContent.trim()
    //     let time = item.getElementsByClassName("stats")[0].textContent.trim()
    //     let times = time.split(":")
    //     let minutes = parseInt(times[0])
    //     let seconds = parseInt(times[1])
    //     let totalSeconds = minutes*60+seconds

    //     if (item.classList.contains("active")) {
    //       partInfo.push({title:title,time:time,active:true,totalSeconds:totalSeconds})
    //     }else{
    //       partInfo.push({title:title,time:time,active:false,totalSeconds:totalSeconds})
    //     }
    //   }
    //   console.log(partInfo)
      
    //   return encodeURIComponent(JSON.stringify(partInfo))
    // }
    // getPartInfo()
    // `)
    // let partInfo = JSON.parse(decodeURIComponent(encodedPartInfo))
    // if (partInfo.length) {
    //   // MNUtil.copy(partInfo)
    //   let menu = new Menu(button,self)
    //   let selector = "changePart:"
    //   partInfo.forEach((part,index)=>{
    //     menu.addMenuItem(part.title+" ("+part.time+")", selector,index+1,part.active)
    //   })
    //   menu.show()
    // }else{
    //   MNUtil.showHUD("No video part found")
    // }


  },
  changePart: async function (params) {
  try {
    let self = getVideoPlayerController()
    Menu.dismissCurrentMenu()
    if ("bvid" in params) {
      self.openOrJump(params.bvid,0,params.p)
    }else{
      self.openOrJump(self.currentBvid, 0, params.p)
    }
    
  } catch (error) {
    videoPlayerUtils.addErrorLog(error, "changePage")
  }
  },
  uploadToDoc2X: async function (params) {
    let self = getVideoPlayerController()
    Menu.dismissCurrentMenu()
    let currentImage = videoPlayerUtils.getCurrentImage()
    // MNUtil.copy(currentImage)
    if (currentImage) {
      self.uploadImage(currentImage)
    }else{
      self.uploadPDF()
    }
    return
  },
  uploadToWebDefault: async function (params) {
    let self = getVideoPlayerController()
    Menu.dismissCurrentMenu()
    let currentImage = videoPlayerUtils.getCurrentImage()
    // MNUtil.copy(currentImage)
    if (currentImage) {
      self.uploadImage(currentImage)
    }else{
      self.uploadPDF(undefined,params)
    }
  },
  uploadPDFToWebDefault: async function (params) {
    let self = getVideoPlayerController()
    Menu.dismissCurrentMenu()
    self.uploadPDF(undefined,params)
  },
  uploadToKimi: async function (params) {
    let self = getVideoPlayerController()
    Menu.dismissCurrentMenu()
    let currentImage = videoPlayerUtils.getCurrentImage()
    // MNUtil.copy(currentImage)
    if (currentImage) {
      self.uploadImage(currentImage)
      
    }else{
      self.uploadPDF()
    }
  },
  onLongPress: async function(gesture) {
    if (gesture.state === 1) {
      let url = await self.getCurrentURL()
      MNUtil.input("输入URL", url, ["Cancel","Open in mobile mode","Open in desktop mode","Copy current url","Open copied url"]).then((value)=>{
        let input = value.input
        let button = value.button
        switch (button) {
          case 0:
            break;
          case 1:
            self.setWebMode(false)
            if (/https?:/.test(input)) {
              MNConnection.loadRequest(self.webview, input)
            }else{
              MNConnection.loadRequest(self.webview, "https://"+input)
            }
            MNUtil.showHUD("Open: "+input)
            break;
          case 2:
            self.setWebMode(true)
            if (/https?:/.test(input)) {
              MNConnection.loadRequest(self.webview, input)
            }else{
              MNConnection.loadRequest(self.webview, "https://"+input)
            }
            MNUtil.showHUD("Open: "+input)
            break;
          case 3:
            MNUtil.copy(url)
            MNUtil.showHUD("Copied to clipboard")
            break;
          case 4:
            MNConnection.loadRequest(self.webview, MNUtil.clipboardText)
            break;
          default:
            break;
        }
      })
      // self.onAnimate = true
      // let frame = self.view.frame
      // self.moveButton.frame = MNUtil.genFrame(10,20,frame.width-20,40)

      // MNUtil.showHUD("LongPress begin")
    }
    // if (gesture.state === 3) {
    //   self.onAnimate = false
    //   MNUtil.showHUD("LongPress end")
    //   self.view.setNeedsLayout()
    // }
  },
  onLongPressSearch: async function(gesture) {
  },
  onLongPressRefresh: async function(gesture) {
    if (gesture.state === 1) {
      self.showHUD("Reload webview")
      self.createWebview()
      self.homePage()
      self.view.bringSubviewToFront(self.moveButton)
      self.view.bringSubviewToFront(self.moreButton)
      self.view.bringSubviewToFront(self.maxButton)
      self.view.bringSubviewToFront(self.minButton)
      self.view.bringSubviewToFront(self.closeButton)
    }
  },
  changeWebApp: function(button) {
    MNUtil.showHUD("Not implemented")
    return
    let menu = new Menu(button,self)
    // menu.width = 200
    menu.preferredPosition = 2
    videoPlayerConfig.webAppEntrieNames.forEach(entrieName => {
      menu.addMenuItem(videoPlayerConfig.webAppEntries[entrieName].title, 'changeWebAppTo:', entrieName)
    })
    if (self.currentVideoId) {
      menu.addMenuItem('➕  Star this video', 'addPageToWebApp:', button)
      menu.addMenuItem('🎛  Setting', 'openSettingView:', 'webApp')
    }else{
      menu.addMenuItem('🎛  Setting', 'openSettingView:', 'webApp')
    }
    menu.show()
    // var commandTable = videoPlayerConfig.webAppEntrieNames.map(entrieName => {
    //   return {title:videoPlayerConfig.webAppEntries[entrieName].title,object:self,selector:'changeWebAppTo:',param:entrieName}
    // })
    // if (self.inHomePage) {
    //   commandTable.push({title:'🎛  Setting',object:self,selector:'openSettingView:',param:'webApp'})
    // }else{
    //   commandTable.push({title:'➕  Add this page',object:self,selector:'addPageToWebApp:',param:button})
    //   commandTable.push({title:'🎛  Setting',object:self,selector:'openSettingView:',param:'webApp'})
    // }
    // self.view.popoverController = MNUtil.getPopoverAndPresent(button, commandTable,200)
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
      {title:'Title → Excerpt → Comment',object:self,selector:'setSearchOrder:',param:[1,2,3],checked:videoPlayerConfig.searchOrder==[1,2,3]},
      {title:'Title → Comment → Excerpt',object:self,selector:'setSearchOrder:',param:[1,3,2],checked:videoPlayerConfig.searchOrder==[1,3,2]},
      {title:'Excerpt → Title → Comment',object:self,selector:'setSearchOrder:',param:[2,1,3],checked:videoPlayerConfig.searchOrder==[2,1,3]},
      {title:'Excerpt → Comment → Title',object:self,selector:'setSearchOrder:',param:[2,3,1],checked:videoPlayerConfig.searchOrder==[2,3,1]},
      {title:'Comment → Title → Excerpt',object:self,selector:'setSearchOrder:',param:[3,1,2],checked:videoPlayerConfig.searchOrder==[3,1,2]},
      {title:'Comment → Excerpt → Title',object:self,selector:'setSearchOrder:',param:[3,2,1],checked:videoPlayerConfig.searchOrder==[3,2,1]},
    ];
    self.view.popoverController = MNUtil.getPopoverAndPresent(sender, commandTable,300)
  },
  changeCustomButton: function(button){
    if (videoPlayerUtils.checkSubscribe(false)) {
      let menu = new Menu(button,self)
      menu.width = 300
      menu.preferredPosition = 1
      videoPlayerConfig.allCustomActions.forEach(action=>{
        menu.addMenuItem(videoPlayerConfig.getCustomDescription(action),'setCustomAction:',{index:button.index,action:action})
      })
      menu.show()
      // self.view.popoverController = MNUtil.getPopoverAndPresent(button, commandTable,300,1)
      // var commandTable = videoPlayerConfig.allCustomActions.map(action=>{
      //   return {title:videoPlayerConfig.getCustomDescription(action),object:self,selector:'setCustomAction:',param:{index:button.index,action:action}}
      // })
      // self.view.popoverController = MNUtil.getPopoverAndPresent(button, commandTable,300,1)
    }
  },
  chooseWebApp: function(params){
  try {
    Menu.dismissCurrentMenu()
    let button = params.button
    let index = params.index
    let menu = new Menu(button,self)
    menu.width = 200
    menu.preferredPosition = 1
    videoPlayerConfig.webAppEntrieNames.map(entrieName => {
      menu.addMenuItem(videoPlayerConfig.webAppEntries[entrieName].title, 'setCustomAction:', {index:index,action:"webApp:"+entrieName})
    })
    menu.show()
    
  } catch (error) {
    videoPlayerUtils.addErrorLog(error, "chooseWebApp")
  }
  },
  setCustomAction: async function(config){
    Menu.dismissCurrentMenu()
    if (config.index === 1) {
      videoPlayerConfig.config.custom = config.action
      // self["setCustomButton"+config.index].setTitleForState("Custom"+config.index+": "+videoPlayerConfig.getConfig("custom"),0)
      self["setCustomButton"+config.index].setTitleForState("Custom"+config.index+": "+videoPlayerConfig.getCustomDescription(config.action),0)
    }else{
      videoPlayerConfig.config["custom"+config.index] = config.action
      self["setCustomButton"+config.index].setTitleForState("Custom"+config.index+": "+videoPlayerConfig.getCustomDescription(config.action),0)
    }
    self["customButton"+config.index].setTitleForState(videoPlayerConfig.getCustomEmoji(config.index))
    videoPlayerConfig.save("MNVideoPlayer_config")
  },
  toggleTimestampeDetail: function (params) {
    let timestampDetail = !videoPlayerConfig.getConfig("timestampDetail")
    videoPlayerConfig.config.timestampDetail = timestampDetail
    self.timestampDetail.setTitleForState("Timestamp Detail: "+(timestampDetail?"✅":"❌"),0)
  },
  toggleAutoOpenVideoExcerpt: function (params) {
    // if (!videoPlayerUtils.checkSubscribe(true)) {
    //   return undefined
    // }
    let autoOpenVideoExcerpt = !videoPlayerConfig.getConfig("autoOpenVideoExcerpt")
    videoPlayerConfig.config.autoOpenVideoExcerpt = autoOpenVideoExcerpt
    self.autoOpenVideoExcerpt.setTitleForState("Auto Open Video Excerpt: "+(autoOpenVideoExcerpt?"✅":"❌"),0)
  },
  changeZoomTo:function (zoom) {
    self.runJavaScript(`document.body.style.zoom = ${zoom}`)
  },
  openSettingView:function (targetView) {
    Menu.dismissCurrentMenu()
    self.openSetting(targetView)
  },
  toggleToolbar:function (opacity) {
    if (self.view.popoverController) {self.view.popoverController.dismissPopoverAnimated(true);}
try {
  

    videoPlayerConfig.toolbar = !videoPlayerConfig.toolbar
    self.buttonScrollview.hidden = !videoPlayerConfig.toolbar
    self.updateEngineButton()
} catch (error) {
  videoPlayerUtils.addErrorLog(error, "toggleToolbar")
}
    var viewFrame = self.view.bounds;
    MNUtil.animate(()=>{
      if (videoPlayerConfig.toolbar) {
        self.webview.frame = {x:viewFrame.x,y:viewFrame.y+10,width:viewFrame.width,height:viewFrame.height-40}
      }else{
        self.webview.frame = {x:viewFrame.x,y:viewFrame.y+10,width:viewFrame.width,height:viewFrame.height}
      }
    })
  },
  toggleWatchMode:function (param) {
    Menu.dismissCurrentMenu()
    self.watchMode = !self.watchMode
    if (self.watchMode) {
      self.showHUD("✅ Watch Mode: ON")
    }else{
      self.showHUD("❌ Watch Mode: OFF")
    }
  },
  setCustomIcon:async function (params) {
    let self = getVideoPlayerController()
    Menu.dismissCurrentMenu()
    if (self.view.popoverController) {self.view.popoverController.dismissPopoverAnimated(true);}
    let res = await MNUtil.input("Custom Icon", "Enter the custom icon URL\n\n请输入自定义图标URL\n\nURL must starts with https:// and ends with .png")
    if (res.button) {
      let input = res.input
      if (!input.startsWith("https://") || !input.endsWith(".png")) {
        MNUtil.confirm("MN Video Player", "Invalid icon URL\n\n请输入正确的图标URL\n\nURL must starts with https:// and ends with .png")
        return
      }
      let confirm = await MNUtil.confirm(" MN Video Player", "This feature requires subscription or free usage. Do you want to continue?\n\n该功能需要订阅或免费额度，是否继续？")
      if (!confirm) {
        return
      }
      if (!videoPlayerUtils.checkSubscribe(true)) {
        return
      }
      videoPlayerConfig.webAppEntries[params.id].icon = input
      self.setTextview(params.id)
    }
    // self.setCustomIcon(params.id)
  },
  searchWithEngine: function (engine) {
    videoPlayerConfig.engine = engine
    if (self.selectedText.length) {
      self.search(self.selectedText) 
    }else{
      self.search(self.searchedText)//用户可能只是想换个搜索引擎再次搜索
    }
    if (self.view.popoverController) {self.view.popoverController.dismissPopoverAnimated(true);}

    // self.view.popoverController.dismissPopoverAnimated(true);
  },
  openInNewWindow: function (url) {
    self.checkPopover()
    Menu.dismissCurrentMenu()
    if (videoPlayerUtils.checkSubscribe()) {
      if (self.inHomePage) {
        MNUtil.postNotification('newWindow', {homePage:true})
      }else{
        if(url === "about:blank"){
          MNUtil.postNotification('newWindow', {homePage:true})
          self.homePage();
        }else{
          MNUtil.postNotification('newWindow', {url:url,desktop:self.desktop,engine:videoPlayerConfig.engine,webApp:self.webApp})
          self.homePage();
        }
      }
    }
  },
  openNewWindow: function (url) {
    self.checkPopover()
    Menu.dismissCurrentMenu()
    if (videoPlayerUtils.checkSubscribe()) {
      MNUtil.postNotification('newWindow', {homePage:true})
    }
  },
  openInBrowser: async function (engine) {
    Menu.dismissCurrentMenu()
    let url = await self.getCurrentURL()
    MNUtil.openURL(url)
  },
  copyCurrentURL: async function (engine) {
    Menu.dismissCurrentMenu()
    if (self.view.popoverController) {self.view.popoverController.dismissPopoverAnimated(true);}
    let url = await self.getCurrentURL()
    MNUtil.copy(url)
    self.showHUD("链接已复制")
  },
  copyCurrentURLWithText: async function(){
    Menu.dismissCurrentMenu()
    if (self.view.popoverController) {self.view.popoverController.dismissPopoverAnimated(true);}
    let url = await self.getCurrentURL()
    let text = await self.getSelectedTextInWebview()
    MNUtil.copy(`[${text}](${url})`)
    self.showHUD("链接已复制")
  },
  bigbang: async function(){
    Menu.dismissCurrentMenu()
    if (self.view.popoverController) {self.view.popoverController.dismissPopoverAnimated(true);}
    let url = await self.getCurrentURL()
    let text = await self.getTextInWebview()
    MNUtil.postNotification('bigbangText', {text:text,url:url})
  },
  openCopiedURL: function (engine) {
    Menu.dismissCurrentMenu()
    MNConnection.loadRequest(self.webview, MNUtil.clipboardText)
  },
  resetConfig: async function (engine) {
    let confirm = await MNUtil.confirm("Reset config?", "重置配置？")
    if (!confirm) {
      return
    }
    videoPlayerConfig.webAppEntrieNames = Object.keys(videoPlayerConfig.webAppEntries)
    videoPlayerConfig.webAppEntries = videoPlayerConfig.defaultWebAppEntries
    self.webApp = videoPlayerConfig.webAppEntrieNames[0]
    self.setButtonText(videoPlayerConfig.webAppEntrieNames,self.webApp)
    self.refreshLayout()
    self.setTextview(self.webApp)
  },
  uploadConfig: function (engine) {

    let note = self.currentNote()
    let customEntries
    let commentsLength = note.comments.length
    if (commentsLength === 0) {
      Application.sharedInstance().showHUD("No comments found",self.view.window,2)
      return;
    }
    try {
      let comment = note.comments[0].text.replaceAll(`”`,`"`).replaceAll(`“`,`"`)
      customEntries = JSON.parse(comment)
      if (!Object.keys(customEntries).length) {
        Application.sharedInstance().showHUD("Invalid config",self.view.window,2)
        return;
      }
      // Application.sharedInstance().showHUD(Object.keys(customEntries).length,self.view.window,2)
    } catch (error) {
      videoPlayerUtils.addErrorLog(error, "uploadConfig")
      return;
    }
    let uploadLog = [];
    if (customEntries.WebApp) {
      uploadLog.push(`"WebApp"`)
      videoPlayerConfig.webAppEntries = customEntries.WebApp
      videoPlayerConfig.webAppEntrieNames = Object.keys(videoPlayerConfig.webAppEntries)
      self.webApp = videoPlayerConfig.webAppEntrieNames[0]
    }
    if (uploadLog.length) {
      self.showHUD("Upload config of "+uploadLog.join(" and ")+" success!")
    }else{
      self.showHUD('Entries of "Search" or "WebApp" not found')
    }
  },
  videoFrame: async function (width) {
    let self = getVideoPlayerController()
    Menu.dismissCurrentMenu()
    if (self.view.popoverController) {self.view.popoverController.dismissPopoverAnimated(true);}
    self.videoFrameAction("clipboard",false)
  },
  videoFrameToSnipaste: async function (width) {
    let self = getVideoPlayerController()
    Menu.dismissCurrentMenu()
    if (self.view.popoverController) {self.view.popoverController.dismissPopoverAnimated(true);}
    self.videoFrameAction("snipaste",false)
  },
  videoFrameToEditor: async function (width) {
    let self = getVideoPlayerController()
    Menu.dismissCurrentMenu()
    if (self.view.popoverController) {self.view.popoverController.dismissPopoverAnimated(true);}
    self.videoFrameAction("editor")
  },
  videoFrameToNote: async function (childNote) {
    let self = getVideoPlayerController()
    Menu.dismissCurrentMenu()
    if (self.view.popoverController) {self.view.popoverController.dismissPopoverAnimated(true);}
    if (childNote) {
      self.videoFrameAction("childNote")
    }else{
      self.videoFrameAction("excerpt")
    }
  },
  videoFrameToNewNote: async function (childNote) {
    let self = getVideoPlayerController()
    if (self.view.popoverController) {self.view.popoverController.dismissPopoverAnimated(true);}
    self.videoFrameAction("newNote")
  },
  videoFrameToComment: async function () {
      let self = getVideoPlayerController()
    if (self.view.popoverController) {self.view.popoverController.dismissPopoverAnimated(true);}
    self.videoFrameAction("comment")
  },
  homeButtonTapped: function() {
    // if (self.inHomePage) {
    //   MNUtil.showHUD("Already in homepage")
    //   return
    // }
    self.homePage()
  },
  loadCKEditor:function (params) {
    try {
      // MNUtil.copy(videoPlayerUtils.mainPath+"/ckeditor.html")
      self.webview.loadFileURLAllowingReadAccessToURL(
      NSURL.fileURLWithPath(videoPlayerUtils.mainPath+"/ckeditor.html"),
      NSURL.fileURLWithPath(videoPlayerUtils.mainPath+"/")
    )

    // MNConnection.loadFile(self.webview, videoPlayerUtils.mainPath+"/ckeditor.html", videoPlayerUtils.mainPath+"/")
          
    } catch (error) {
      videoPlayerUtils.addErrorLog(error, "loadCKEditor")
    }
  },
  customButtonTapped: async function(button){
    let self = getVideoPlayerController()
    if (!videoPlayerUtils.checkSubscribe(true)) {
      return
    }
    try {
    if (self.settingView) {
      let preOpacity = self.settingView.layer.opacity
      UIView.animateWithDurationAnimationsCompletion(0.2,()=>{
        self.settingView.layer.opacity = 0
      },()=>{
        self.settingView.layer.opacity = preOpacity
        self.settingView.hidden = true
      })
    }
    // let url
    // let text
    let configName = (button.index === 1)?"custom":"custom"+button.index
    let action = videoPlayerConfig.getConfig(configName)
    if (action.startsWith("webApp:")) {
      self.changeWebAppTo(action.split(":")[1])
      return
    }
    self.executeCustomAction(action)
    } catch (error) {
      videoPlayerUtils.addErrorLog(error, "customButtonTapped")
    }
  },
  searchButtonTapped: async function(button) {
    let self = getVideoPlayerController()
    let menu = new Menu(button,self)
    menu.width = 200
    menu.preferredPosition = 2
    menu.addMenuItem('Source 1️⃣', 'setVideoSource:', 'source1',videoPlayerConfig.baseURL === "https://cdn.u1162561.nyat.app:43836/d/cdn")
    menu.addMenuItem('Source 2️⃣', 'setVideoSource:', 'source2',videoPlayerConfig.baseURL === "http://cn-hk-bgp-4.ofalias.net:62334/d/cdn")
    menu.show()
  },
  setVideoSource: async function(source) {
    let self = getVideoPlayerController()
    Menu.dismissCurrentMenu()
    self.videoSource = videoPlayerConfig.sourceConfig[source]
    videoPlayerConfig.baseURL = self.videoSource
    MNUtil.showHUD("Video source set to "+source)
    if (self.inHomePage) {
      return
    }
    await MNUtil.delay(0.5)
    if (self.currentVideoId) {
      self.openVideoPlayerById(self.currentVideoId)
      return
    }
  },
  goBackButtonTapped: function() {
    self.webview.goBack();
  },
  goForwardButtonTapped: function() {
    self.webview.goForward();
  },
  refreshButtonTapped: async function(para) {
    if (self.inHomePage) {
      self.homePage()
      return
    }
    if (self.webview.loading) {
      self.webview.stopLoading();
      self.refreshButton.setImageForState(videoPlayerUtils.reloadImage,0)
      self.changeButtonOpacity(1.0)
      self.isLoading = false;
    }else{
      if (self.currentVideoId) {
        self.openVideoPlayerById(self.currentVideoId)
        return
      }
      self.webview.reload();
    }
  },
  closeButtonTapped: function() {
    if (self.addonBar) {
      self.hide(self.addonBar.frame)
    }else{
      self.hide()
    }
    // self.homePage()
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
  videoPlayerConfig.dynamic = false;
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
      },0.3).then(async ()=>{
        self.showAllButton()
        let webInfo = await self.getCurrentWebInfo()
        // videoPlayerUtils.log("getCurrentWebInfo", webInfo)
        if (webInfo.hasVideo && webInfo.urlConfig.host === "www.bilibili.com") {
          if (self.view.frame.width < 700) {
            self.enableWideMode()
          }else if (self.view.frame.width > 800) {
            self.exitWideMode()
          }
        }
      })
      return
    }
    const frame = MNUtil.studyView.bounds
    self.lastFrame = self.view.frame
    self.customMode = "full"
    self.custom = true;
    videoPlayerConfig.dynamic = false;
    self.webview.hidden = false
    self.hideAllButton()
    MNUtil.animate(()=>{
      self.setFrame(40,50,frame.width-80,frame.height-70)
    },0.3).then(async ()=>{
      self.showAllButton()
      let webInfo = await self.getCurrentWebInfo()
      // videoPlayerUtils.log("getCurrentWebInfo", webInfo)
      if (webInfo.hasVideo && webInfo.urlConfig.host === "www.bilibili.com") {
        if (self.view.frame.width < 700) {
          self.enableWideMode()
        }else if (self.view.frame.width > 800) {
          self.exitWideMode()
        }
      }
    })
  },
  minButtonTapped: function() {
    if (!self.currentVideoId) {
      MNUtil.showHUD("Play a video first")
      return
    }
    // videoPlayerConfig.dynamic = false;
    self.miniMode = true
    let studyFrame = MNUtil.studyView.bounds
    let studyCenter = MNUtil.studyView.center.x
    let viewCenter = self.view.center.x
    let size = self.getMiniModeSize()
    if (viewCenter>studyCenter) {
      self.toMinimode(MNUtil.genFrame(studyFrame.width-size.width,self.view.frame.y,size.width,size.height))
    }else{
      self.toMinimode(MNUtil.genFrame(0,self.view.frame.y,size.width,size.height))
    }
  },
  moreButtonTapped: function(button) {
    MNUtil.showHUD("Not implemented")
  },
  onMoveGesture:function (gesture) {
      if (gesture.state === 1) {
        self.originalLocationToMN = gesture.locationInView(MNUtil.studyView);
        self.originalFrame = self.view.frame;
        if (!self.miniMode) {
          self.lastFrame = self.view.frame
        }
      }
      if (gesture.state === 2) {
        let locationToMN = gesture.locationInView(MNUtil.studyView);
        // let translation = gesture.translationInView(MNUtil.studyView)
        let locationDiff = {
          x: locationToMN.x - self.originalLocationToMN.x,
          y: locationToMN.y - self.originalLocationToMN.y,
        };
        let frame = self.view.frame;
        frame.x = self.originalFrame.x + locationDiff.x;
        frame.y = self.originalFrame.y + locationDiff.y;
        self.setFrame(frame);
      }


    // videoPlayerConfig.dynamic = false;
    // let locationToMN = gesture.locationInView(MNUtil.studyView)
    // if (!self.locationToButton || !self.miniMode && (Date.now() - self.moveDate) > 100) {
    //   // self.appInstance.showHUD("state:"+gesture.state, self.view.window, 2);
    //   let translation = gesture.translationInView(MNUtil.studyView)
    //   let locationToBrowser = gesture.locationInView(self.view)
    //   let locationToButton = gesture.locationInView(gesture.view)
    //   let newY = locationToButton.y-translation.y 
    //   let newX = locationToButton.x-translation.x
    //   if (gesture.state === 1) {
    //     if (!self.miniMode) {
    //       self.lastFrame = self.view.frame
    //     }
    //     self.locationToBrowser = {x:locationToBrowser.x-translation.x,y:locationToBrowser.y-translation.y}
    //     self.locationToButton = {x:newX,y:newY}
    //   }
    // }
    // self.moveDate = Date.now()
    // let location = {x:locationToMN.x - self.locationToButton.x-gesture.view.frame.x,y:locationToMN.y -self.locationToButton.y-gesture.view.frame.y}
    // // let location = videoPlayerUtils.getNewLoc(gesture)
    // let frame = self.view.frame
    // var viewFrame = self.view.bounds;
    // let studyFrame = MNUtil.studyView.bounds
    // let y = MNUtil.constrain(location.y, 0, studyFrame.height-15)
    // let x = location.x
    // self.setFrame(x, y, frame.width,frame.height)
    // self.custom = false;
    // MNUtil.copy(self.view.frame)
  },
  onResizeGesture:async function (gesture) {
    let self = getVideoPlayerController()
    self.custom = false;
    videoPlayerConfig.dynamic = false;
    self.customMode = "none"
    let frame = self.view.frame
    let locationToBrowser = gesture.locationInView(self.view)
    if (gesture.state === 1) {
      self.xDiff = MNUtil.constrain(frame.width-locationToBrowser.x, 0, frame.width)
      self.yDiff = MNUtil.constrain(frame.height-locationToBrowser.y, 0, frame.height)
    }
    let width = locationToBrowser.x+self.xDiff
    let height = locationToBrowser.y+self.yDiff
    if (width <= 378) {
      width = 378
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
    if (gesture.state === 3 && self.isMainWindow) {
      let size = {width:width,height:height}
      videoPlayerConfig.config.size = size
      videoPlayerConfig.save("MNVideoPlayer_config",false,false)
      if (self.currentVideoId && width <= 265 && height <= 150) {
        self.runJavaScript(`enterFullscreen()`)
      }
    }
  },
  changeWebAppTo:function(webApp) {
    Menu.dismissCurrentMenu()
    if (self.view.popoverController) {self.view.popoverController.dismissPopoverAnimated(true);}
    self.changeWebAppTo(webApp)

  },
  addPageToWebApp: async function (button) {
    let self = getVideoPlayerController()
    if (self.view.popoverController) {self.view.popoverController.dismissPopoverAnimated(true);}
    let info = await self.getCurrentWebInfo()
    let url = info.url
    let config = {title:info.title,desktop:info.desktop,link:url}
    let option = {default:info.title}
    let userInput = await MNUtil.input("🌐 MN Video Player","Name for this page?\n\n请输入网页名称\n\nCurrent URL/当前URL:\n"+url+"\n\nDefault/默认:",["Cancel / 取消","➕ Add / 添加"],option)
    let buttonIndex = userInput.button
    let input = userInput.input
    if (buttonIndex === 0) {
      return
    }
    if (buttonIndex === 1) {
      config.title = input
    }
    let entryKey = videoPlayerConfig.getAvailableWebAppEntryKey()
    videoPlayerConfig.webAppEntries[entryKey] = config
    videoPlayerConfig.webAppEntrieNames = videoPlayerConfig.webAppEntrieNames.concat((entryKey))
    self.configEngine = entryKey
    videoPlayerConfig.save("MNVideoPlayer_webAppEntrieNames")
    videoPlayerConfig.save("MNVideoPlayer_webAppEntries")
    self.showHUD("✅ WebApp Added: "+config.title)
    Menu.dismissCurrentMenu(false)
    let menu = new Menu(button,self)
    // menu.width = 200
    menu.preferredPosition = 2
    videoPlayerConfig.webAppEntrieNames.forEach(entrieName => {
      menu.addMenuItem(videoPlayerConfig.webAppEntries[entrieName].title, 'changeWebAppTo:', entrieName)
    })
    menu.addMenuItem('🎛  Setting', 'openSettingView:', 'webApp')
    menu.show(true,false)
  },
  advancedButtonTapped: function (params) {
    self.configSearchView.hidden = true
    self.advanceView.hidden = false
    self.syncView.hidden = true
    self.customButtonView.hidden = true
    MNButton.setColor(self.advancedButton, "#457bd3")
    MNButton.setColor(self.configWebappButton, "#9bb2d6")
    MNButton.setColor(self.syncConfig, "#9bb2d6")
    MNButton.setColor(self.configCustomButton, "#9bb2d6")
  },
  syncConfigTapped: function (params) {
    MNUtil.showHUD("Not implemented")
    return
    self.configSearchView.hidden = true
    self.advanceView.hidden = true
    self.syncView.hidden = false
    self.customButtonView.hidden = true
    MNButton.setColor(self.advancedButton, "#9bb2d6")
    MNButton.setColor(self.configWebappButton, "#9bb2d6")
    MNButton.setColor(self.syncConfig, "#457bd3")
    MNButton.setColor(self.configCustomButton, "#9bb2d6")
    self.refreshView("syncView")
  },
  configWebAppTapped: function (params) {
    self.configSearchView.hidden = false
    self.advanceView.hidden = true
    self.syncView.hidden = true
    self.customButtonView.hidden = true
    self.configMode = 1
    self.configEngine = self.webApp
    MNButton.setColor(self.advancedButton, "#9bb2d6")
    MNButton.setColor(self.configWebappButton, "#457bd3")
    MNButton.setColor(self.syncConfig, "#9bb2d6")
    MNButton.setColor(self.configCustomButton, "#9bb2d6")
    self.setButtonText(videoPlayerConfig.webAppEntrieNames,self.webApp)
    self.setTextview(self.webApp)
    self.refreshLayout()

  },
  configCustomButtonTapped: function (params) {
    self.configSearchView.hidden = true
    self.advanceView.hidden = true
    self.syncView.hidden = true
    self.customButtonView.hidden = false
    MNButton.setColor(self.advancedButton, "#9bb2d6")
    MNButton.setColor(self.configWebappButton, "#9bb2d6")
    MNButton.setColor(self.syncConfig, "#9bb2d6")
    MNButton.setColor(self.configCustomButton, "#457bd3")
  },
  configCopyTapped: function (button) {
    let config = self.textviewInput.text.replaceAll(`”`,`"`)
    MNUtil.copy(config)
    MNUtil.showHUD("Copy to clipboard")
  },
  configPasteTapped: function (button) {
    let configText = MNUtil.clipboardText
    if (MNUtil.isValidJSON(configText)) {
      let config = JSON.parse(configText)
      self.textviewInput.text = configText
      videoPlayerConfig.webAppEntries[self.configEngine] = config
      self.setButtonText(videoPlayerConfig.webAppEntrieNames,self.configEngine)
      videoPlayerConfig.save("MNVideoPlayer_webAppEntries")
      MNUtil.showHUD("Saved webapp: "+config.title)
      self.refreshLayout(true)
    }else{
      MNUtil.confirm("🌐 MN Video Player", "Invalid JSON format:\n\n"+configText)
    }
  },
  configSaveTapped: async function (params) {
    MNUtil.showHUD("Not implemented")
    return
    // self.appInstance.showHUD(123, self.view.window, 2);
    try {
    self.textviewInput.text = self.textviewInput.text.replaceAll(`”`,`"`)
    let config = MNUtil.getValidJSON(self.textviewInput.text)
    // videoPlayerUtils.log("config", config)

    if (config && Object.keys(config).length > 0) {
        if ("icon" in config) {
          vr.log("check icon", config)
          if (!config.icon.startsWith("https://") || !config.icon.endsWith(".png")) {
            MNUtil.confirm("MN Video Player", "Invalid icon URL\n\n请输入正确的图标URL\n\nURL must starts with https:// and ends with .png")
            return
          }
          let preIcon = self.currentConfigBeforeSave.icon
          if (preIcon !== config.icon) {
            let res = await MNUtil.userSelect("MN Video Player", "The Custom Icon has been changed. Using new icon requires subscription or free usage. Do you want to continue?\n\n自定义图标已更改，使用新图标需要订阅或免费额度，是否继续？",["Keep Icon / 保留原图标","Use New Icon / 使用新图标"])
            switch (res) {
              case 0: // Cancel
                return
              case 1: // Keep Icon

                config.icon = preIcon
                break
              case 2: // Use New Icon
                if (!videoPlayerUtils.checkSubscribe(true)) {
                  return
                }
                break
              default:
                break;
            }
          }
        }
        // videoPlayerUtils.log("config after check icon", config)

        videoPlayerConfig.webAppEntries[self.configEngine] = config
        self.setButtonText(videoPlayerConfig.webAppEntrieNames,self.configEngine)
        videoPlayerConfig.save("MNVideoPlayer_webAppEntries")
        MNUtil.showHUD("✅ Save webapp: "+config.title)
        self.setTextview(self.configEngine)
      self.refreshLayout(true)
    }else{
      MNUtil.confirm("🌐 MN Video Player", "Invalid JSON format:\n\n"+self.textviewInput.text)
    }
    } catch (error) {
      videoPlayerUtils.addErrorLog(error, "configSaveTapped")
    }
  },
  openURLInBrowser: function (url) {
    Menu.dismissCurrentMenu()
    MNConnection.loadRequest(self.webview, url)
    let preOpacity = self.settingView.layer.opacity
    UIView.animateWithDurationAnimationsCompletion(0.2,()=>{
      self.settingView.layer.opacity = 0
    },()=>{
      self.settingView.layer.opacity = preOpacity
      self.settingView.hidden = true
    })
  },
  importAction: function (action) {
    let self = getVideoPlayerController()
    Menu.dismissCurrentMenu()
    if (action === "New") {
      self.newConfig()
    }
  },
  configDeleteTapped: async function (params) {
  try {
    let confim = await MNUtil.confirm("🌐 MN Video Player","Remove current config?\n\n是否删除当前配置？")
    if (!confim) {
      return
    }
      delete videoPlayerConfig.webAppEntries[self.configEngine]
      videoPlayerConfig.webAppEntrieNames = videoPlayerConfig.webAppEntrieNames.filter(item=>item !== self.configEngine)
      if (self.configEngine === self.webApp) {
        self.webApp = videoPlayerConfig.webAppEntrieNames[0]
      }
      self.configEngine = videoPlayerConfig.webAppEntrieNames[0]
      self.webApp = self.configEngine
      self.setButtonText(videoPlayerConfig.webAppEntrieNames,self.configEngine)
      self.setTextview(self.configEngine)
      self.refreshLayout()
      videoPlayerConfig.save("MNVideoPlayer_webAppEntrieNames")
      videoPlayerConfig.save("MNVideoPlayer_webAppEntries")
      if (self.inHomePage && videoPlayerConfig.getConfig("useLocalHomePage")) {
        self.homePage()
      }
  } catch (error) {
    videoPlayerUtils.addErrorLog(error, "configDeleteTapped")
  }
  },
  configMoveUpTapped: function (params) {
    if (self.configMode === 0) {
      let index = videoPlayerConfig.entrieNames.indexOf(self.configEngine)
      if (index === 0) {
        self.showHUD("Already the top one!")
        return
      }
      let temp = videoPlayerConfig.entrieNames[index-1]
      videoPlayerConfig.entrieNames[index-1] = self.configEngine
      videoPlayerConfig.entrieNames[index] = temp
      self.setButtonText(videoPlayerConfig.entrieNames,self.configEngine)
      self.refreshLayout()
      videoPlayerConfig.save("MNVideoPlayer_entrieNames")
    }else{
      let index = videoPlayerConfig.webAppEntrieNames.indexOf(self.configEngine)
      if (index === 0) {
        self.showHUD("Already the top one!")
        return
      }
      let temp = videoPlayerConfig.webAppEntrieNames[index-1]
      videoPlayerConfig.webAppEntrieNames[index-1] = self.configEngine
      videoPlayerConfig.webAppEntrieNames[index] = temp
      // showHUD("index:"+index)
      self.setButtonText(videoPlayerConfig.webAppEntrieNames,self.configEngine)
      self.refreshLayout()
      videoPlayerConfig.save("MNVideoPlayer_webAppEntrieNames")

    }
  },
  configMoveDownTapped: function (params) {
    if (self.configMode === 0) {
      let index = videoPlayerConfig.entrieNames.indexOf(self.configEngine)
      if (index === videoPlayerConfig.entrieNames.length-1) {
        self.showHUD("Already the bottom one!")
        return
      }
      let temp = videoPlayerConfig.entrieNames[index+1]
      videoPlayerConfig.entrieNames[index+1] = self.configEngine
      videoPlayerConfig.entrieNames[index] = temp
      self.setButtonText(videoPlayerConfig.entrieNames,self.configEngine)
      self.refreshLayout()
      videoPlayerConfig.save("MNVideoPlayer_entrieNames")
    }else{
      let index = videoPlayerConfig.webAppEntrieNames.indexOf(self.configEngine)
      if (index === videoPlayerConfig.webAppEntrieNames.length-1) {
        self.showHUD("Already the bottom one!")
        return
      }
      let temp = videoPlayerConfig.webAppEntrieNames[index+1]
      videoPlayerConfig.webAppEntrieNames[index+1] = self.configEngine
      videoPlayerConfig.webAppEntrieNames[index] = temp
      self.setButtonText(videoPlayerConfig.webAppEntrieNames,self.configEngine)
      self.refreshLayout()
      videoPlayerConfig.save("MNVideoPlayer_webAppEntrieNames")

    }
  },
  openWebApp:function() {
    let self = getVideoPlayerController()
    var url;
    url = videoPlayerConfig.webAppEntries[self.webApp].link
    self.setWebMode(videoPlayerConfig.webAppEntries[self.webApp].desktop)
    MNConnection.loadRequest(self.webview, url)
    self.webview.hidden = false
  },
  toggleSelected:function (button) {
  try {
    let self = getVideoPlayerController()
    if (button.isSelected) {
      if (self.configMode === 1) {
        if (self.webApp === button.id) {
          self.configMoreOption(button)
          return
        }
      }else{
        self.configMoreOption(button)
        return;
      }
    }
    button.isSelected = !button.isSelected
    if (self.configMode === 1) {
      self.webApp = button.id
    }
    // self.appInstance.showHUD(text,self.view.window,2)
    let title = button.id
    self.configEngine = title
    self.words.forEach((entryName,index)=>{
      if (entryName !== title) {
        self["nameButton"+index].isSelected = false
        self["nameButton"+index].backgroundColor = MNUtil.hexColorAlpha("#9bb2d6",0.8);
      }
    })
    if (button.isSelected) {
      self.setTextview(title)
      button.backgroundColor = MNUtil.hexColorAlpha("#457bd3",0.8)
    }else{
      button.backgroundColor = MNUtil.hexColorAlpha("#9bb2d6",0.8);
    }
    
  } catch (error) {
    videoPlayerUtils.addErrorLog(error, "toggleSelected")
  }
  },
  exportConfig: async function (params) {
    let success = await videoPlayerConfig.export()
    if (success) {
      self.configNoteIdInput.text = videoPlayerConfig.getConfig("syncNoteId")
      videoPlayerConfig.save("MNVideoPlayer_config")
      self.showHUD("Export Success!")
      let dateObj = new Date(videoPlayerConfig.getConfig("lastSyncTime"))
      MNButton.setTitle(self.syncTimeButton, "Last Sync Time: "+dateObj.toLocaleString())
    }
  },
  importConfig:async function (params) {
    try {
    let success = await videoPlayerConfig.import()
    if (success) {
      self.refreshView("syncView")
      self.refreshView("configSearchView")
      self.showHUD("Import Success!")
    }
    } catch (error) {
      videoPlayerUtils.addErrorLog(error, "importConfig")
    }
  },
  syncConfig: function (params) {
    let success = videoPlayerConfig.sync()
    if (success) {
      self.refreshView("syncView")
      self.showHUD("Sync Success!")
    }
  },
  restoreConfig:async function (params) {
    let modifiedTime = videoPlayerConfig.previousConfig?.config?.modifiedTime
    if (modifiedTime) {
      let dateObj = new Date(modifiedTime)
      let dateString = dateObj.toLocaleString()
      let confirm = await MNUtil.confirm("Restore Config", "恢复上次配置\n\n将会恢复到上次导入前的配置\n\n上次配置的修改时间："+dateString )
      if (confirm) {
        // let success = videoPlayerConfig.importConfig(videoPlayerConfig.previousConfig)
        // if (success) {
        //   videoPlayerConfig.save(undefined,true)
        //   MNUtil.showHUD("✅ Restore Success!")
        //   if (videoPlayerConfig.getConfig("autoExport")) {
        //     videoPlayerConfig.export(true,true)
        //   }
        // }
      }
    }else{
      MNUtil.showHUD("❌ No previous config to restore!")
  }
  },
  focusConfigNoteId:function (params) {
  try {
    let syncNoteId = videoPlayerConfig.getConfig("syncNoteId")
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
    videoPlayerConfig.config.autoExport = !videoPlayerConfig.getConfig("autoExport")
    MNButton.setTitle(self.autoExportButton, "Auto Export: "+(videoPlayerConfig.getConfig("autoExport")?"✅":"❌"))
    videoPlayerConfig.save("MNVideoPlayer_config")
  } catch (error) {
    MNUtil.showHUD(error)
  }
  },
  toggleAutoImport: function (params) {
    videoPlayerConfig.config.autoImport = !videoPlayerConfig.getConfig("autoImport")
    MNButton.setTitle(self.autoImportButton, "Auto Import: "+(videoPlayerConfig.getConfig("autoImport")?"✅":"❌"))
    videoPlayerConfig.save("MNVideoPlayer_config")
  },
  pasteConfigNoteId:function (params) {
    let noteId = MNUtil.clipboardText
    let note = MNNote.new(noteId)//MNUtil.getNoteById(noteId)
    if (note) {
      self.configNoteIdInput.text = note.noteId
      videoPlayerConfig.config.syncNoteId = noteId.noteId
      videoPlayerConfig.save("MNVideoPlayer_config")
      MNUtil.showHUD("Save Config NoteId")
    }else{
      MNUtil.showHUD("Note not exist!")
    }
  },
  clearConfigNoteId:function (params) {
    self.configNoteIdInput.text = ""
    videoPlayerConfig.config.syncNoteId = ""
    videoPlayerConfig.save("MNVideoPlayer_config")
    MNUtil.showHUD("Clear Config NoteId")
  },
  changeSyncSource: function (button) {
    let self = getVideoPlayerController()
    let syncSource = videoPlayerConfig.getConfig("syncSource")
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
  try {

    let self = getVideoPlayerController()
    self.checkPopover()
    Menu.dismissCurrentMenu()
    let currentSource = videoPlayerConfig.getConfig("syncSource")
    if (currentSource === source) {
      return
    }
    videoPlayerConfig.setSyncStatus(false)
    let file
    switch (source) {
      case "iCloud":
        // MNButton.setTitle(self.exportConfigButton, "Export to iCloud")
        // MNButton.setTitle(self.importConfigButton, "Import from iCloud")
        self.configNoteIdInput.text = file
        // self.focusConfigNoteButton.hidden = true
        break;
      case "CFR2":
        file = videoPlayerConfig.getConfig("r2file") ?? ""
        // MNButton.setTitle(self.exportConfigButton, "Export to R2")
        // MNButton.setTitle(self.importConfigButton, "Import from R2")
        MNButton.setTitle(self.focusConfigNoteButton, "Copy")
        self.configNoteIdInput.text = file
        // self.focusConfigNoteButton.hidden = true
        break;
      case "Infi":
        file = videoPlayerConfig.getConfig("InfiFile") ?? ""
        // MNButton.setTitle(self.exportConfigButton, "Export to Infini")
        // MNButton.setTitle(self.importConfigButton, "Import from Infini")
        MNButton.setTitle(self.focusConfigNoteButton, "Copy")
        self.configNoteIdInput.text = file
        // self.focusConfigNoteButton.hidden = true
        break;
      case "Webdav":
        file = videoPlayerConfig.getConfig("webdavFile") ?? ""
        // MNButton.setTitle(self.exportConfigButton, "Export to Webdav")
        // MNButton.setTitle(self.importConfigButton, "Import from Webdav")
        MNButton.setTitle(self.focusConfigNoteButton, "Copy")
        self.configNoteIdInput.text = file
        // self.focusConfigNoteButton.hidden = true
        break;
      case "MNNote":
        self.configNoteIdInput.text = videoPlayerConfig.getConfig("syncNoteId")
        self.focusConfigNoteButton.hidden = false
        // MNButton.setTitle(self.exportConfigButton, "Export to Note")
        // MNButton.setTitle(self.importConfigButton, "Import from Note")
        MNButton.setTitle(self.focusConfigNoteButton, "Focus")
        break;
      default:
        break;
    }
    videoPlayerConfig.config.syncSource = source
    MNButton.setTitle(self.syncSourceButton, "Sync Config: "+videoPlayerConfig.getSyncSourceString(),undefined,true)
    videoPlayerConfig.save("MNVideoPlayer_config",true)
    self.refreshView("syncView")
    
  } catch (error) {
    videoPlayerUtils.addErrorLog(error, "setSyncSource")
  }
  },
  stopSync:function (params) {
    self.checkPopover()
    Menu.dismissCurrentMenu()
    videoPlayerConfig.setSyncStatus(false,false)
    MNUtil.showHUD("Stop Current Sync")
  },
});
/** @this {videoPlayerController} */
videoPlayerController.prototype.createWebview = function () {
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

/**
 * @this {videoPlayerController}
 * @param {string} superview
 * @param {string} color
 * @param {number} alpha
 * @returns {UIScrollView}
 */
videoPlayerController.prototype.createScrollview = function (superview="view",color="#c0bfbf",alpha=0.8) {
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

/** @this {videoPlayerController} */
videoPlayerController.prototype.init = function(){
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
    this.moreButton.setImageForState(videoPlayerUtils.moreImage,0)
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

    this.createButton("webAppButton","changeWebApp:","buttonScrollview")
    // this.webAppButton.setTitleForState('📺', 0);
    this.webAppButton.setImageForState(videoPlayerUtils.webappImage,0)



    this.createButton("engineButton","searchButtonTapped:","toolbar")
    this.engineButton.titleLabel.font = UIFont.boldSystemFontOfSize(15);
    this.updateEngineButton()
    MNButton.addLongPressGesture(this.engineButton, this, "onLongPressSearch:")

    // this.createButton("homeButton","loadCKEditor:","buttonScrollview")
    this.createButton("homeButton","homeButtonTapped:","buttonScrollview")
    this.homeButton.setImageForState(videoPlayerUtils.homeImage,0)

    this.createButton("customButton1","customButtonTapped:","buttonScrollview")
    this.customButton1.index = 1
    this.customButton1.setTitleForState(videoPlayerConfig.getCustomEmoji(1), 0);
    this.customButton1.titleLabel.font = UIFont.boldSystemFontOfSize(14);
    // this.customButton.setImageForState(videoPlayerUtils.homeImage,0)

    this.createButton("customButton2","customButtonTapped:","buttonScrollview")
    this.customButton2.index = 2
    this.customButton2.setTitleForState(videoPlayerConfig.getCustomEmoji(2), 0);
    this.customButton2.titleLabel.font = UIFont.boldSystemFontOfSize(14);

    this.createButton("customButton3","customButtonTapped:","buttonScrollview")
    this.customButton3.index = 3
    this.customButton3.setTitleForState(videoPlayerConfig.getCustomEmoji(3), 0);
    this.customButton3.titleLabel.font = UIFont.boldSystemFontOfSize(14);

    this.createButton("customButton4","customButtonTapped:","buttonScrollview")
    this.customButton4.index = 4
    this.customButton4.setTitleForState(videoPlayerConfig.getCustomEmoji(4), 0);
    this.customButton4.titleLabel.font = UIFont.boldSystemFontOfSize(14);

    this.createButton("customButton5","customButtonTapped:","buttonScrollview")
    this.customButton5.index = 5
    this.customButton5.setTitleForState(videoPlayerConfig.getCustomEmoji(5), 0);
    this.customButton5.titleLabel.font = UIFont.boldSystemFontOfSize(14);

    this.createButton("customButton6","customButtonTapped:","buttonScrollview")
    this.customButton6.index = 6
    this.customButton6.setTitleForState(videoPlayerConfig.getCustomEmoji(6), 0);
    this.customButton6.titleLabel.font = UIFont.boldSystemFontOfSize(14);

    this.createButton("customButton7","customButtonTapped:","buttonScrollview")
    this.customButton7.index = 7
    this.customButton7.setTitleForState(videoPlayerConfig.getCustomEmoji(7), 0);
    this.customButton7.titleLabel.font = UIFont.boldSystemFontOfSize(14);

    this.createButton("customButton8","customButtonTapped:","buttonScrollview")
    this.customButton8.index = 8
    this.customButton8.setTitleForState(videoPlayerConfig.getCustomEmoji(8), 0);
    this.customButton8.titleLabel.font = UIFont.boldSystemFontOfSize(14);

    this.createButton("customButton9","customButtonTapped:","buttonScrollview")
    this.customButton9.index = 9
    this.customButton9.setTitleForState(videoPlayerConfig.getCustomEmoji(9), 0);
    this.customButton9.titleLabel.font = UIFont.boldSystemFontOfSize(14);

    this.createButton("customButton10","customButtonTapped:","buttonScrollview")
    this.customButton10.index = 10
    this.customButton10.setTitleForState(videoPlayerConfig.getCustomEmoji(10), 0);
    this.customButton10.titleLabel.font = UIFont.boldSystemFontOfSize(14);


    this.createButton("moveButton","moveButtonTapped:")
    MNButton.addLongPressGesture(this.moveButton, this, "onLongPress:")

    this.createButton("goForwardButton","goForwardButtonTapped:","buttonScrollview")
    this.goForwardButton.setImageForState(videoPlayerUtils.goforwardImage,0)

    this.createButton("goBackButton","goBackButtonTapped:","buttonScrollview")
    this.goBackButton.setImageForState(videoPlayerUtils.gobackImage,0)
    // <<< goBack button <<<
    // >>> refresh button >>>
    this.createButton("refreshButton","refreshButtonTapped:","buttonScrollview")
    this.refreshButton.setImageForState(videoPlayerUtils.reloadImage,0)
    MNButton.addLongPressGesture(this.refreshButton, this, "onLongPressRefresh:")

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
/** @this {videoPlayerController} */
videoPlayerController.prototype.homePage = async function() {
try {
  MNUtil.stopHUD()
  this.webview.stopLoading();
  // return
  this.inHomePage = true
  this.currentVideoId = undefined
  this.currentP = 0
  
  this.webview.loadFileURLAllowingReadAccessToURL(
    NSURL.fileURLWithPath(videoPlayerUtils.mainPath + '/homepage.html'),
    NSURL.fileURLWithPath(videoPlayerUtils.mainPath + '/')
  );
  this.webview.hidden = false
  this.searchedText = "";
  // MNUtil.delay(0.5).then(()=>{
  //   this.runJavaScript("initMilkdown()")
  // })
  await MNUtil.delay(0.1)

  let config = await videoPlayerUtils.getVideoConfig()
  // let url = "https://cdn.u1162561.nyat.app:43836/d/cdn/videoConfig.json"
  // let config = await videoPlayerUtils.readConfigFromURL(url)
//   MNUtil.copy(config)

  let script = `updateConfigData("${encodeURIComponent(JSON.stringify(config))}");
showHomePage();`
  // MNUtil.copy(script)
  this.runJavaScript(script)
  } catch (error) {
  videoPlayerUtils.addErrorLog(error, "homePage")
}
  // this.mdxDictView.hidden = false
  // var url = `${this.webview.url}#en/${this.webview.lanCode}/${encodeURIComponent(text.replaceAll('/', '\\/'))}`;
};

/** @this {videoPlayerController} */
videoPlayerController.prototype.setToolbar = async function(state) {
  videoPlayerConfig.toolbar = state
  this.buttonScrollview.hidden = !videoPlayerConfig.toolbar

}






/** @this {videoPlayerController} */
videoPlayerController.prototype.runJavaScript = async function(script,delay) {
  if(!this.webview || !this.webview.window)return;
  if (delay) {
    await MNUtil.delay(delay)
  }
  return new Promise((resolve, reject) => {
    try {
      this.webview.evaluateJavaScript(script,(result) => {
        if (MNUtil.isNSNull(result)) {
          resolve(undefined)
        }else{
          resolve(result)
        }
      });
    } catch (error) {
      videoPlayerUtils.addErrorLog(error, "runJavaScript")
      resolve(undefined)
    }
  })
};


/** 
* @description 获取当前网页的信息
* @returns {Promise<{url:string, title:string, hasVideo:boolean, videoTime:number, urlConfig:{url: string, scheme: string, host: string, query: string ,params: any, pathComponents: string[], isBlank: boolean, fragment: string}}>} 当前网页的信息
*/
videoPlayerController.prototype.getCurrentWebInfo = async function() {
  if(!this.webview || !this.webview.window) return;

  let encodedInfo = await this.runJavaScript(`function currentWebInfo() {
    let url = window.location.href
    let title = document.title
    let hasVideo = document.getElementsByTagName('video').length > 0
    let info = {url, title, hasVideo}
    if (hasVideo) {
      info.videoTime = document.getElementsByTagName('video')[0].currentTime;
    }
    if (hasVideo && videoId) {
      info.videoId = videoId
    }
    return encodeURIComponent(JSON.stringify(info))
  }
  currentWebInfo()
  `)
  let info = JSON.parse(decodeURIComponent(encodedInfo))
  info.desktop = this.desktop ?? false
  info.urlConfig = MNUtil.parseURL(info.url)
  this.webview.url = info.url
  // info.contentWidth = this.webview.scrollView.contentSize.width
  // info.webviewWidth = this.webview.frame.width
  return info
};


/** @this {videoPlayerController} */
videoPlayerController.prototype.getCurrentURL = async function() {
  if(!this.webview || !this.webview.window) return;
  let url = await this.runJavaScript(`window.location.href`)
  this.webview.url = url
  return url
};
/** @this {videoPlayerController} */
videoPlayerController.prototype.getSelectedTextInWebview = async function() {
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

/** @this {videoPlayerController} */
videoPlayerController.prototype.getTextInWebview = async function() {
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
    `)
  return ret
}

/** @this {videoPlayerController} */
videoPlayerController.prototype.changeButtonOpacity = function(opacity) {
    this.toolbar.layer.opacity = opacity
    this.moveButton.layer.opacity = opacity
    this.maxButton.layer.opacity = opacity
    this.minButton.layer.opacity = opacity
    this.moreButton.layer.opacity = opacity
    this.closeButton.layer.opacity = opacity
}

/** @this {videoPlayerController} */
videoPlayerController.prototype.setButtonLayout = function (button,targetAction) {
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

/** @this {videoPlayerController} */
videoPlayerController.prototype.createButton = function (buttonName,targetAction,superview) {
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

/** @this {videoPlayerController} */
videoPlayerController.prototype.settingViewLayout = function (){
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


    this.setCustomButton1.frame = MNUtil.genFrame(5,0,width-10,35)
    this.setCustomButton2.frame = MNUtil.genFrame(5,40,width-10,35)
    this.setCustomButton3.frame = MNUtil.genFrame(5,80,width-10,35)
    this.setCustomButton4.frame = MNUtil.genFrame(5,120,width-10,35)
    this.setCustomButton5.frame = MNUtil.genFrame(5,160,width-10,35)
    this.setCustomButton6.frame = MNUtil.genFrame(5,200,width-10,35)
    this.setCustomButton7.frame = MNUtil.genFrame(5,240,width-10,35)
    this.setCustomButton8.frame = MNUtil.genFrame(5,280,width-10,35)
    this.setCustomButton9.frame = MNUtil.genFrame(5,320,width-10,35)
    this.setCustomButton10.frame = MNUtil.genFrame(5,360,width-10,35)
    this.customButtonView.contentSize = {width:width-20,height:360+35}
    this.timestampDetail.frame = MNUtil.genFrame(5,80,width-10,35)
    this.autoOpenVideoExcerpt.frame = MNUtil.genFrame(5,120,width-10,35)
    this.opacityButton.frame = MNUtil.genFrame(5,200,130,35)
    this.slider.frame = MNUtil.genFrame(145,202,width-160,35)
    MNFrame.set(this.textviewInput, 5, 150, width-10, height-195)
    this.saveConfigButton.frame = {x:width-70,y:height-80,width:60,height:30}
    this.pasteConfigButton.frame = {x:width-135,y:height-80,width:60,height:30}
    this.copyConfigButton.frame = {x:width-200,y:height-80,width:60,height:30}

    this.scrollview.frame = {x:5,y:0,width:width-10,height:145};
    this.scrollview.contentSize = {width:width-20,height:height};
    this.moveUpButton.frame = {x:width-40,y:5,width:30,height:30}
    this.moveDownButton.frame = {x:width-40,y:40,width:30,height:30}
    this.configResetButton.frame = {x:width-40,y:75,width:30,height:30}
    this.deleteButton.frame = {x:width-40,y:110,width:30,height:30}
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
    settingFrame.width = settingFrame.width-45
    this.tabView.frame = settingFrame

    settingFrame.x = 0
    settingFrame.y = 0
    settingFrame.height = 30
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
    this.tabView.contentSize = {width:settingFrame.x+settingFrame.width,height:30}

  } catch (error) {
    videoPlayerUtils.addErrorLog(error, "settingViewLayout")
  }
}

/** @this {videoPlayerController} */
videoPlayerController.prototype.createSettingView = function (){
try {
  let targetView = "settingView"

  this.configMode = 0
  this.configEngine = videoPlayerConfig.engine
  this.settingView = UIView.new()
  this.settingView.backgroundColor = UIColor.whiteColor().colorWithAlphaComponent(0.8)
  this.settingView.layer.cornerRadius = 13
  this.settingView.hidden = true
  this.view.addSubview(this.settingView)

  this.tabView = this.createScrollview("settingView","#aaaaaa",0.0)
  this.tabView.alwaysBounceHorizontal = true
  this.tabView.showsHorizontalScrollIndicator = false

  this.configSearchView = UIView.new()
  this.configSearchView.backgroundColor = MNUtil.hexColorAlpha("#9bb2d6",0.0)
  this.configSearchView.layer.cornerRadius = 12
  this.settingView.addSubview(this.configSearchView)


  this.customButtonView = UIScrollView.new()
  this.settingView.addSubview(this.customButtonView)
  this.customButtonView.hidden = true
  this.customButtonView.delegate = this
  this.customButtonView.bounces = true
  this.customButtonView.alwaysBounceVertical = true
  this.customButtonView.layer.cornerRadius = 10
  this.customButtonView.backgroundColor = MNUtil.hexColorAlpha("#c0bfbf",0.0)


  this.advanceView = UIView.new()
  this.advanceView.backgroundColor = MNUtil.hexColorAlpha("#9bb2d6",0.0)
  this.advanceView.layer.cornerRadius = 12
  this.settingView.addSubview(this.advanceView)
  this.advanceView.hidden = true

  this.syncView = UIView.new()
  this.syncView.backgroundColor = MNUtil.hexColorAlpha("#9bb2d6",0.0)
  this.syncView.layer.cornerRadius = 12
  this.settingView.addSubview(this.syncView)
  this.syncView.hidden = true

  // this.creatView("syncView",targetView,"#9bb2d6",0.0)
  // this.syncView.hidden = true
  targetView = "tabView"



  this.createButton("configWebappButton","configWebAppTapped:",targetView)
  this.configWebappButton.backgroundColor = MNUtil.hexColorAlpha("#457bd3",0.8)
  // this.configWebappButton.layer.opacity = 1.0
  MNButton.setConfig(this.configWebappButton, {title:"Favorite",font:17,bold:true,alpha:0.8,opacity:1.0})
  size = this.configWebappButton.sizeThatFits({width:100,height:100})
  this.configWebappButton.width = size.width+15

  this.createButton("configCustomButton","configCustomButtonTapped:",targetView)
  // this.configWebappButton.backgroundColor = MNUtil.hexColorAlpha("#457bd3",0.8)
  // this.configWebappButton.layer.opacity = 1.0
  MNButton.setConfig(this.configCustomButton, {title:"Button",font:17,bold:true,alpha:0.8,opacity:1.0})
  size = this.configCustomButton.sizeThatFits({width:100,height:100})
  this.configCustomButton.width = size.width+15

  this.createButton("advancedButton","advancedButtonTapped:",targetView)
  // this.advancedButton.backgroundColor = MNUtil.hexColorAlpha("#457bd3",0.8)
  this.advancedButton.layer.opacity = 1.0
  this.advancedButton.setTitleForState("More",0)
  MNButton.setConfig(this.advancedButton, {title:"More",font:17,bold:true})
  size = this.advancedButton.sizeThatFits({width:100,height:100})
  this.advancedButton.width = size.width+15

  this.createButton("syncConfig","syncConfigTapped:",targetView)
  MNButton.setConfig(this.syncConfig, 
    {color:"#9bb2d6",alpha:0.8,opacity:1.0,title:"Sync",font:17,bold:true}
  )
  size = this.syncConfig.sizeThatFits({width:100,height:100})
  this.syncConfig.width = size.width+15

  targetView = "settingView"

  this.createButton("closeConfig","closeConfigTapped:",targetView)
  this.closeConfig.setImageForState(videoPlayerUtils.stopImage,0)
  this.closeConfig.backgroundColor = MNUtil.hexColorAlpha("#e06c75",0.8)

  

  targetView = "configSearchView"



  this.scrollview = UIScrollView.new()
  this.configSearchView.addSubview(this.scrollview)
  this.scrollview.hidden = false
  this.scrollview.delegate = this
  this.scrollview.bounces = true
  this.scrollview.alwaysBounceVertical = true
  this.scrollview.layer.cornerRadius = 10
  this.scrollview.backgroundColor = MNUtil.hexColorAlpha("#c0bfbf",0.8)



  this.textviewInput = UITextView.new()
  this.textviewInput.font = UIFont.systemFontOfSize(16);
  this.textviewInput.layer.cornerRadius = 10
  this.textviewInput.backgroundColor = MNUtil.hexColorAlpha("#c0bfbf",0.8)
  this.textviewInput.textColor = UIColor.blackColor()
  this.configSearchView.addSubview(this.textviewInput)
  this.textviewInput.text = `Input here`
  this.textviewInput.bounces = true

  this.createButton("saveConfigButton","configSaveTapped:",targetView)
  this.saveConfigButton.layer.opacity = 1.0
  MNButton.setColor(this.saveConfigButton, "#e06c75")
  MNButton.setTitle(this.saveConfigButton, "Save",undefined,true)

  this.createButton("copyConfigButton","configCopyTapped:",targetView)
  this.copyConfigButton.layer.opacity = 1.0
  // MNButton.setColor(this.copyConfigButton, "#e06c75")
  MNButton.setTitle(this.copyConfigButton, "Copy",undefined,true)

  this.createButton("pasteConfigButton","configPasteTapped:",targetView)
  this.pasteConfigButton.layer.opacity = 1.0
  // MNButton.setColor(this.pasteConfigButton, "#e06c75")
  MNButton.setTitle(this.pasteConfigButton, "Paste",undefined,true)

  this.createButton("deleteButton","configDeleteTapped:",targetView)
  this.deleteButton.layer.opacity = 1.0
  this.deleteButton.setTitleForState("🗑",0)
  MNButton.setColor(this.deleteButton, "#ffffff",0.8)

  this.createButton("moveUpButton","configMoveUpTapped:",targetView)
  this.moveUpButton.layer.opacity = 1.0
  this.moveUpButton.setTitleForState("🔼",0)
  MNButton.setColor(this.moveUpButton, "#ffffff",0.8)
  this.createButton("moveDownButton","configMoveDownTapped:",targetView)
  this.moveDownButton.layer.opacity = 1.0
  this.moveDownButton.setTitleForState("🔽",0)
  MNButton.setColor(this.moveDownButton, "#ffffff",0.8)

  this.createButton("configResetButton","resetConfig:",targetView)
  this.configResetButton.layer.opacity = 1.0
  this.configResetButton.setTitleForState("🔄",0)
  MNButton.setColor(this.configResetButton, "#ffffff",0.8)

  this.createButton("setCustomButton1","changeCustomButton:","customButtonView")
  this.setCustomButton1.index = 1
  this.setCustomButton1.layer.opacity = 1.0
  this.setCustomButton1.backgroundColor = MNUtil.hexColorAlpha("#457bd3",0.8)
  this.setCustomButton1.setTitleForState("Custom1: "+videoPlayerConfig.getCustomDescription(videoPlayerConfig.getConfig("custom")),0)

  this.createButton("setCustomButton2","changeCustomButton:","customButtonView")
  this.setCustomButton2.index = 2
  this.setCustomButton2.layer.opacity = 1.0
  this.setCustomButton2.backgroundColor = MNUtil.hexColorAlpha("#457bd3",0.8)
  this.setCustomButton2.setTitleForState("Custom2: "+videoPlayerConfig.getCustomDescription(videoPlayerConfig.getConfig("custom2")),0)

  this.createButton("setCustomButton3","changeCustomButton:","customButtonView")
  this.setCustomButton3.index = 3
  this.setCustomButton3.layer.opacity = 1.0
  this.setCustomButton3.backgroundColor = MNUtil.hexColorAlpha("#457bd3",0.8)
  this.setCustomButton3.setTitleForState("Custom3: "+videoPlayerConfig.getCustomDescription(videoPlayerConfig.getConfig("custom3")),0)

  this.createButton("setCustomButton4","changeCustomButton:","customButtonView")
  this.setCustomButton4.index = 4
  this.setCustomButton4.layer.opacity = 1.0
  this.setCustomButton4.backgroundColor = MNUtil.hexColorAlpha("#457bd3",0.8)
  this.setCustomButton4.setTitleForState("Custom4: "+videoPlayerConfig.getCustomDescription(videoPlayerConfig.getConfig("custom4")),0)

  this.createButton("setCustomButton5","changeCustomButton:","customButtonView")
  this.setCustomButton5.index = 5
  this.setCustomButton5.layer.opacity = 1.0
  this.setCustomButton5.backgroundColor = MNUtil.hexColorAlpha("#457bd3",0.8)
  this.setCustomButton5.setTitleForState("Custom5: "+videoPlayerConfig.getCustomDescription(videoPlayerConfig.getConfig("custom5")),0)

  this.createButton("setCustomButton6","changeCustomButton:","customButtonView")
  this.setCustomButton6.index = 6
  this.setCustomButton6.layer.opacity = 1.0
  this.setCustomButton6.backgroundColor = MNUtil.hexColorAlpha("#457bd3",0.8)
  this.setCustomButton6.setTitleForState("Custom6: "+videoPlayerConfig.getCustomDescription(videoPlayerConfig.getConfig("custom6")),0)

  this.createButton("setCustomButton7","changeCustomButton:","customButtonView")

  this.setCustomButton7.index = 7
  this.setCustomButton7.layer.opacity = 1.0
  this.setCustomButton7.backgroundColor = MNUtil.hexColorAlpha("#457bd3",0.8)
  this.setCustomButton7.setTitleForState("Custom7: "+videoPlayerConfig.getCustomDescription(videoPlayerConfig.getConfig("custom7")),0)

  this.createButton("setCustomButton8","changeCustomButton:","customButtonView")
  this.setCustomButton8.index = 8
  this.setCustomButton8.layer.opacity = 1.0
  this.setCustomButton8.backgroundColor = MNUtil.hexColorAlpha("#457bd3",0.8)
  this.setCustomButton8.setTitleForState("Custom8: "+videoPlayerConfig.getCustomDescription(videoPlayerConfig.getConfig("custom8")),0)

  this.createButton("setCustomButton9","changeCustomButton:","customButtonView")
  this.setCustomButton9.index = 9
  this.setCustomButton9.layer.opacity = 1.0
  this.setCustomButton9.backgroundColor = MNUtil.hexColorAlpha("#457bd3",0.8)
  this.setCustomButton9.setTitleForState("Custom9: "+videoPlayerConfig.getCustomDescription(videoPlayerConfig.getConfig("custom9")),0)

  this.createButton("setCustomButton10","changeCustomButton:","customButtonView")
  this.setCustomButton10.index = 10
  this.setCustomButton10.layer.opacity = 1.0
  this.setCustomButton10.backgroundColor = MNUtil.hexColorAlpha("#457bd3",0.8)
  this.setCustomButton10.setTitleForState("Custom10: "+videoPlayerConfig.getCustomDescription(videoPlayerConfig.getConfig("custom10")),0)

  this.createButton("timestampDetail","toggleTimestampeDetail:","advanceView")
  this.timestampDetail.layer.opacity = 1.0
  this.timestampDetail.backgroundColor = MNUtil.hexColorAlpha("#457bd3",0.8)
  this.timestampDetail.setTitleForState("Timestamp Detail: "+(videoPlayerConfig.getConfig("timestampDetail")?"✅":"❌"),0)

  this.createButton("autoOpenVideoExcerpt","toggleAutoOpenVideoExcerpt:","advanceView")
  this.autoOpenVideoExcerpt.layer.opacity = 1.0
  this.autoOpenVideoExcerpt.backgroundColor = MNUtil.hexColorAlpha("#457bd3",0.8)
  this.autoOpenVideoExcerpt.setTitleForState("Auto Open Video Excerpt: "+(videoPlayerConfig.getConfig("autoOpenVideoExcerpt")?"✅":"❌"),0)

  this.createButton("opacityButton","changeOpacity:","advanceView")
  this.opacityButton.layer.opacity = 1.0
  this.opacityButton.backgroundColor = MNUtil.hexColorAlpha("#457bd3",0.8)
  this.opacityButton.setTitleForState("Opacity: 100.0%",0)

  this.slider = UISlider.new()
  this.slider.minimumValue = 0.2
  this.slider.maximumValue = 1.0
  this.slider.value = 1.0
  this.slider.addTargetActionForControlEvents(this, "changeOpacity:",1<<6)
  this.advanceView.addSubview(this.slider)

  targetView = "syncView"

  this.createButton("syncSourceButton","changeSyncSource:",targetView)
  MNButton.setConfig(this.syncSourceButton, {title:"Sync Config: "+videoPlayerConfig.getSyncSourceString(),color:"#457bd3",font:17,alpha:0.8,bold:true,radius:11})

  this.creatTextView("configNoteIdInput",targetView)
  this.configNoteIdInput.editable = false

  this.createButton("syncTimeButton","syncConfig:",targetView)
  MNButton.setConfig(this.syncTimeButton, {color:"#457bd3",alpha:0.8})
  
  this.createButton("exportConfigButton","exportConfig:",targetView)
  MNButton.setConfig(this.exportConfigButton, {title:"Export To Note",color:"#457bd3",alpha:0.8})

  this.createButton("restoreConfigButton","restoreConfig:",targetView)
  MNButton.setConfig(this.restoreConfigButton, {title:"Restore Config"})

  this.createButton("importConfigButton","importConfig:",targetView)
  MNButton.setConfig(this.importConfigButton, {title:"Import From Note",color:"#457bd3",alpha:0.8})

  this.createButton("autoExportButton","toggleAutoExport:",targetView)
  MNButton.setConfig(this.autoExportButton, {color:"#457bd3",alpha:0.8})

  this.createButton("autoImportButton","toggleAutoImport:",targetView)
  MNButton.setConfig(this.autoImportButton, {color:"#457bd3",alpha:0.8})

  this.createButton("pasteConfigNoteButton","pasteConfigNoteId:",targetView)
  MNButton.setConfig(this.pasteConfigNoteButton, {title:"Paste",color:"#9bb2d6",alpha:0.8})

  this.createButton("clearConfigNoteButton","clearConfigNoteId:",targetView)
  MNButton.setConfig(this.clearConfigNoteButton, {title:"Clear",color:"#9bb2d6",alpha:0.8})

  this.createButton("focusConfigNoteButton","focusConfigNoteId:",targetView)
  MNButton.setConfig(this.focusConfigNoteButton, {title:"Focus",color:"#9bb2d6",alpha:0.8})
  this.refreshView(targetView)
} catch (error) {
  videoPlayerUtils.addErrorLog(error, "createSettingView")
}
try {
  let text  = videoPlayerConfig.webAppEntries[videoPlayerConfig.engine]
  if (!text || !text.title) {
    if (videoPlayerConfig.engine && videoPlayerConfig.engine in videoPlayerConfig.defaultWebAppEntries) {
      text = videoPlayerConfig.defaultWebAppEntries[videoPlayerConfig.engine]
      videoPlayerConfig.webAppEntries[videoPlayerConfig.engine] = text
    }else{
      videoPlayerConfig.engine = videoPlayerConfig.webAppEntrieNames[0]
      text  = videoPlayerConfig.webAppEntries[videoPlayerConfig.engine]
    }
  }
  this.textviewInput.text = `{
  "title":   "${text.title}",
  "symbol":  "${text.symbol}",
  "engine":  "${text.engine}",
  "link":    "${text.link}"
}`
} catch (error) {
    videoPlayerUtils.addErrorLog(error, "textviewInput")
}

}

/** @this {videoPlayerController} */
videoPlayerController.prototype.setButtonText = function (names,highlight) {
try {

    this.words = names

    names.map((word,index)=>{
      if (!this["nameButton"+index]) {
        this.createButton("nameButton"+index,"toggleSelected:","scrollview")
        // this["nameButton"+index].index = index
        this["nameButton"+index].titleLabel.font = UIFont.systemFontOfSize(16);
      }
      this["nameButton"+index].hidden = false
      this["nameButton"+index].setTitleForState(videoPlayerConfig.webAppEntries[word].title,0) 
      this["nameButton"+index].id = word

      if (word === highlight) {
        this["nameButton"+index].backgroundColor = MNUtil.hexColorAlpha("#457bd3",0.8)
      }else{
        this["nameButton"+index].backgroundColor = MNUtil.hexColorAlpha("#9bb2d6",0.8);
      }
      // this["nameButton"+index].titleEdgeInsets = {top:0,left:-100,bottom:0,right:-50}
      // this["nameButton"+index].setTitleForState(this.imagePattern[index]===this.textPattern[index]?` ${this.imagePattern[index]} `:"-1",0) 
    })
    // this.refreshLayout()
} catch (error) {
    videoPlayerUtils.addErrorLog(error, "setButtonText")
}
}
/** @this {videoPlayerController} */
videoPlayerController.prototype.setTextview = function (name) {
  try {

      let text  = videoPlayerConfig.webAppEntries[name]
      let config = {
        title:text.title,
        id:text.id,
        time:text.time
      }
      this.currentConfigBeforeSave = config
      this.textviewInput.text = JSON.stringify(config,null,2)
    
  } catch (error) {
    videoPlayerUtils.addErrorLog(error, "setTextview")
  }
}
/** @this {videoPlayerController} */
videoPlayerController.prototype.setSplitScreenFrame = function (mode) {  
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
/** @this {videoPlayerController} */
videoPlayerController.prototype.getMiniModeSize = function () {
  let ratio = this.videoSize.width/this.videoSize.height
  // let width = 265
  let width = 378
  let height = width/ratio+42
  return {width:width,height:height}
}
/** @this {videoPlayerController} */
videoPlayerController.prototype.toMinimode = function (frame,lastFrame) {
  this.miniMode = true 
  if (lastFrame) {
    this.lastFrame = lastFrame
  }else{
    this.lastFrame = this.view.frame 
  }
  this.currentFrame  = this.view.frame
  // this.hideAllButton()
  this.view.layer.borderWidth = 0
  MNUtil.animate(()=>{
    this.setFrame(frame)
  }).then(()=>{
    this.moveButton.hidden = false
    if (this.currentVideoId) {
      this.runJavaScript(`enterFullscreen()`)
    }
  })
}
/** @this {videoPlayerController} */
videoPlayerController.prototype.refreshLayout = function (refreshHomepage = false) {
  if (this.settingView.hidden) {
    let preOpacity = this.settingView.layer.opacity
    this.settingView.layer.opacity = 0.2
    // this.settingView.hidden = false
    this.settingView.layer.opacity = preOpacity
    var viewFrame = this.scrollview.bounds;
    var xLeft     = 0
    let initX = 10
    let initY = 10
    let initL = 0
    this.locs = [];
    this.words.map((word,index)=>{
      let button = this["nameButton"+index]
      if (this.configMode === 0) {
        button.isSelected = word === this.configEngine
      }else{
        button.isSelected = word === this.webApp
      }
      let width = button.sizeThatFits({width:100,height:30}).width+15

      if (xLeft+initX+width > viewFrame.width-20) {
        initX = 8
        initY = initY+38
        initL = initL+1
      }
      button.frame = {  x: xLeft+initX,  y: initY,  width: width,  height: 30,};
      this.locs.push({
        x:xLeft+initX,
        y:initY,
        l:initL,
        i:index
      })
      initX = initX+width+8
    })
    if (this.lastLength && this.lastLength>this.words.length) {
      for (let index = this.words.length; index < this.lastLength; index++) {
        MNUtil.showHUD("index:"+index)
        this["nameButton"+index].hidden = true
      }
    }
    this.lastLength = this.words.length
    this.scrollview.contentSize= {width:viewFrame.width,height:initY+40}
  }else{
    var viewFrame = this.scrollview.bounds;
    var xLeft     = 0
    let initX = 8
    let initY = 8
    let initL = 0
    this.locs = [];
    this.words.map((word,index)=>{
      let button = this["nameButton"+index]
      if (this.configMode === 0) {
        button.isSelected = word === this.configEngine
      }else{
        button.isSelected = word === this.webApp
      }
      let width = button.sizeThatFits({width:100,height:30}).width+15
      if (xLeft+initX+width > viewFrame.width-20) {
        initX = 8
        initY = initY+38
        initL = initL+1
      }
      button.frame = {  x: xLeft+initX,  y: initY,  width: width,  height: 30,};
      this.locs.push({
        x:xLeft+initX,
        y:initY,
        l:initL,
        i:index
      })
      initX = initX+width+8
    })
    if (this.lastLength && this.lastLength>this.words.length) {
      for (let index = this.words.length; index < this.lastLength; index++) {
        this["nameButton"+index].hidden = true
      }
    }
    this.lastLength = this.words.length
    this.scrollview.contentSize= {width:viewFrame.width,height:initY+40}
  }
  if (refreshHomepage && this.inHomePage && videoPlayerConfig.getConfig("useLocalHomePage")) {
    this.homePage()
  }


}

/** @this {videoPlayerController} */
videoPlayerController.prototype.getColor = function (highlight = false) {
  if (this.desktop) {
    if (highlight) {
      return "#9e77ff"
    }
    return "#b5b5f5"
  }
  if (highlight) {
    return "#5483cd"
  }
  return "#9bb2d6"
}

/** @this {videoPlayerController} */
videoPlayerController.prototype.setWebMode = function (desktop = false) {
  if (desktop) {
    this.desktop = true
    // this.webview.customUserAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Safari/605.1.15'
    this.webview.customUserAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15'
    // this.webview.customUserAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/604.1 Edg/139.0.0.0'
    // this.webview.customUserAgent = 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36'
    this.setAllButtonColor("#b5b5f5")
  }else{
    this.desktop = false
    this.webview.customUserAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148'
    this.setAllButtonColor("#9bb2d6")
  }
}

/** @this {videoPlayerController} */
videoPlayerController.prototype.setAllButtonColor = function (color = "#9bb2d6") {
  MNButton.setColor(this.moveButton, color,0.8)
  MNButton.setColor(this.closeButton, color,0.8)
  MNButton.setColor(this.maxButton, color, 0.8)
  MNButton.setColor(this.minButton, color, 0.8)
  MNButton.setColor(this.moreButton, color, 0.8)
  MNButton.setColor(this.goBackButton, color, 0.8)
  MNButton.setColor(this.goForwardButton, color, 0.8)
  MNButton.setColor(this.refreshButton, color, 0.8)
  MNButton.setColor(this.engineButton, color, 0.8)
  MNButton.setColor(this.customButton1, color, 0.8)
  MNButton.setColor(this.customButton2, color, 0.8)
  MNButton.setColor(this.customButton3, color, 0.8)
  MNButton.setColor(this.customButton4, color, 0.8)
  MNButton.setColor(this.customButton5, color, 0.8)
  MNButton.setColor(this.customButton6, color, 0.8)
  MNButton.setColor(this.customButton7, color, 0.8)
  MNButton.setColor(this.customButton8, color, 0.8)
  MNButton.setColor(this.customButton9, color, 0.8)
  MNButton.setColor(this.customButton10, color, 0.8)
  MNButton.setColor(this.homeButton, color, 0.8)
  MNButton.setColor(this.webAppButton, color, 0.8)


}
/** @this {videoPlayerController} */
videoPlayerController.prototype.hideAllButton = function (frame) {
  this.moveButton.hidden = true
  this.closeButton.hidden = true
  this.maxButton.hidden = true
  this.minButton.hidden = true
  this.moreButton.hidden = true
  this.toolbar.hidden = true
}
/** @this {videoPlayerController} */
videoPlayerController.prototype.showAllButton = function (frame) {
  this.moveButton.hidden = false
  this.closeButton.hidden = false
  this.maxButton.hidden = false
  this.minButton.hidden = false
  this.moreButton.hidden = false
  this.toolbar.hidden = false
}
/** @this {videoPlayerController} */
videoPlayerController.prototype.show = function (beginFrame,endFrame) {
  let preFrame = this.currentFrame //目标矩形
  let studyFrame = MNUtil.studyView.frame
  if (endFrame) {
    preFrame = endFrame
  }
  // MNUtil.log({message:"show",preFrame})

  preFrame.height = MNUtil.constrain(preFrame.height, 100, studyFrame.height)
  preFrame.width = MNUtil.constrain(preFrame.width, 215, studyFrame.width)
  preFrame.x = MNUtil.constrain(preFrame.x, 0, studyFrame.width-preFrame.width)
  preFrame.y = MNUtil.constrain(preFrame.y, 0, studyFrame.height-preFrame.height)
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
/** @this {videoPlayerController} */
videoPlayerController.prototype.hide = function (frame) {
  let preFrame = this.currentFrame
  this.view.frame = preFrame
  // MNUtil.log({message:"hide",preFrame})
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
  this.onAnimate = true
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
    this.onAnimate = false
  })
}
/** @this {videoPlayerController} */
videoPlayerController.prototype.setFrame = function(x,y,width,height){
    if (typeof x === "object") {
      this.view.frame = x
    }else{
      this.view.frame = MNUtil.genFrame(x, y, width, height)
    }
    this.currentFrame = this.view.frame
  }

/** @this {videoPlayerController} */
videoPlayerController.prototype.creatView = function (viewName,superview="view",color="#9bb2d6",alpha=0.8) {
  this[viewName] = UIView.new()
  this[viewName].backgroundColor = MNUtil.hexColorAlpha(color,alpha)
  this[viewName].layer.cornerRadius = 12
  this[superview].addSubview(this[viewName])
}

/** @this {videoPlayerController} */
videoPlayerController.prototype.creatTextView = function (viewName,superview="view",color="#c0bfbf",alpha=0.8) {
  this[viewName] = UITextView.new()
  this[viewName].font = UIFont.systemFontOfSize(15);
  this[viewName].layer.cornerRadius = 8
  this[viewName].backgroundColor = MNUtil.hexColorAlpha(color,alpha)
  this[viewName].textColor = UIColor.blackColor()
  this[viewName].delegate = this
  this[viewName].bounces = true
  this[superview].addSubview(this[viewName])
}

videoPlayerController.prototype.refreshView = function (targetView) {
try {

  switch (targetView) {
    case "syncView":
      let syncSource = videoPlayerConfig.getConfig("syncSource")
      switch (syncSource) {
        case "iCloud" :
          this.configNoteIdInput.hidden = true
          this.syncTimeButton.hidden = false
          this.importConfigButton.hidden = false
          this.exportConfigButton.hidden = false
          this.autoImportButton.hidden = false
          this.autoExportButton.hidden = false
          this.pasteConfigNoteButton.hidden = true
          this.clearConfigNoteButton.hidden = true
          this.focusConfigNoteButton.hidden = true
          MNButton.setTitle(this.importConfigButton, "Import from iCloud")
          MNButton.setTitle(this.exportConfigButton, "Export to iCloud")
          break;
        case "MNNote":
          this.configNoteIdInput.hidden = false
          this.syncTimeButton.hidden = false
          this.importConfigButton.hidden = false
          this.exportConfigButton.hidden = false
          this.autoImportButton.hidden = false
          this.autoExportButton.hidden = false
          this.pasteConfigNoteButton.hidden = false
          this.clearConfigNoteButton.hidden = false
          this.focusConfigNoteButton.hidden = false
          this.configNoteIdInput.text = videoPlayerConfig.getConfig("syncNoteId")
          MNButton.setTitle(this.importConfigButton, "Import from Note")
          MNButton.setTitle(this.exportConfigButton, "Export to Note")
          break;
        case "None":
          this.configNoteIdInput.hidden = true
          this.importConfigButton.hidden = true
          this.exportConfigButton.hidden = true
          this.autoImportButton.hidden = true
          this.autoExportButton.hidden = true
          this.pasteConfigNoteButton.hidden = true
          this.clearConfigNoteButton.hidden = true
          this.focusConfigNoteButton.hidden = true
          this.syncTimeButton.hidden = true
        default:
          break;
      }
      MNButton.setTitle(this.autoExportButton, "Auto Export: "+(videoPlayerConfig.getConfig("autoExport")?"✅":"❌"))
      MNButton.setTitle(this.autoImportButton, "Auto Import: "+(videoPlayerConfig.getConfig("autoImport")?"✅":"❌"))
      let dateObj = new Date(videoPlayerConfig.getConfig("lastSyncTime"))
      MNButton.setTitle(this.syncTimeButton, "Last Sync Time: "+dateObj.toLocaleString())
      break;
    case "configSearchView":
      this.setButtonText(videoPlayerConfig.webAppEntrieNames,this.webApp)
      this.setTextview(this.webApp)
      break;
    default:
      break;
  }
  
} catch (error) {
  videoPlayerUtils.addErrorLog(error, "refreshView")
}
}
videoPlayerController.prototype.sameVideo = function (videoId) {
  // videoPlayerUtils.log("openOrJump", {currentBvid:this.currentBvid,bvid:bvid,p:p})
  if (!this.currentVideoId) {
    return false
  }
  if (this.currentVideoId !== videoId) {
    // videoPlayerUtils.log("not same videoId")
    return false
  }
  // videoPlayerUtils.log("is same videoId and p")
  return true
}
/** @this {videoPlayerController} */
videoPlayerController.prototype.openOrJump = async function(videoId,time = 0) {
try {
  if (this.view.hidden) {
    MNUtil.showHUD(`window is hidden`)
    return
  }
  let webInfo = await this.getCurrentWebInfo()
  this.currentVideoId = webInfo.videoId
  let formatedVideoTime = videoPlayerUtils.formatSeconds(parseFloat(time))
  if (this.sameVideo(videoId)) {
    this.showHUD(`Jump to ${formatedVideoTime}`)
    this.runJavaScript(`document.getElementsByTagName("video")[0].currentTime = ${time}`)
  }else{
    this.openVideoPlayer({videoId:videoId,timestamp:time})
  }
} catch (error) {
  videoPlayerUtils.addErrorLog(error, "openOrJump")
}
};
/** @this {videoPlayerController} */
videoPlayerController.prototype.openOrJumpForYT = async function(Ytid,time) {
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
  let formatedVideoTime = videoPlayerUtils.formatSeconds(parseTime)
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
  videoPlayerUtils.addErrorLog(error, "openOrJump")
}
};
/** @this {videoPlayerController} */
videoPlayerController.prototype.getTimestamp = async function(){
  let webInfo = await this.getCurrentWebInfo()
  // videoPlayerUtils.log("webInfo", webInfo)
  if (webInfo.hasVideo) {
    let videoTime = webInfo.videoTime.toFixed(2)
    let timestamp = {time:parseFloat(videoTime),videoId:webInfo.videoId}
    this.currentVideoId = timestamp.videoId
    return timestamp
  }
  // let videoTime = await this.runJavaScript(`document.getElementsByTagName('video')[0].currentTime.toFixed(2);`)
  // if (videoTime) {
  //   let url = await this.getCurrentURL()
  //   let res = url.match(/(?<=bilibili.com\/video\/)\w+/);
  //   if (res) {
  //     let timestamp = {time:parseFloat(videoTime),bv:res[0]}
  //     this.currentBvid = timestamp.bv
  //     let testP = url.match(/(?<=bilibili.com\/video\/.+(\?|&)p\=)\d+/);
  //     if (testP) {
  //       timestamp.p = parseInt(testP[0])
  //       this.currentP = timestamp.p
  //     }else{
  //       this.currentP = 0
  //     }
  //     // https://www.bilibili.com/video/BV1F34y1h7so/?p=4
  //     // https://www.bilibili.com/video/BV1F34y1h7so?p=4
  //     return timestamp
  //   }
  //   this.currentBvid = ""
  //   this.currentP = 0
  //   return {time:parseFloat(videoTime)}
  // }
  return undefined
}
/** @this {videoPlayerController} */
videoPlayerController.prototype.getVideoFrameBase64 = async function(scale = 2){
let imageBase64 = await this.runJavaScript(`
function getImage() {
// try {
  const video = document.getElementsByTagName('video')[0];
  video.crossOrigin = "anonymous"; // 尝试设置crossOrigin属性
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  canvas.width = video.videoWidth*${scale};
  canvas.height = video.videoHeight*${scale};
  context.drawImage(video, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg',1.0);
// } catch (error) {
//   return error.toString()
// }
};
getImage();
`)
return imageBase64
}

/** 
* @this {videoPlayerController} 
* @returns {Promise<{image:string,time:number,bv:string,p:number}>}
*/
videoPlayerController.prototype.getVideoFrameInfo = async function(scale = 2){
try {
    let timestamp = await this.getTimestamp()
    if (!timestamp) {
      return undefined
    }
    let imageBase64 = await this.getVideoFrameBase64(scale)
    if (imageBase64) {
      timestamp.image = imageBase64
    }

    // if (videoPlayerUtils.isNSNull(imageBase64)) {
    //     MNUtil.showHUD("Capture video frame failed!")
    //   return undefined
    //   let width = this.view.frame.width>1000?this.view.frame.width:1000
    //   let image = await this.screenshot(width)
    //   if (!image) {
    //     MNUtil.showHUD("Capture video frame failed!")
    //     return undefined
    //   }
    //   imageBase64 = 'data:image/png;base64,'+image.base64Encoding()
    // }
    // let videoTime = await this.runJavaScript(`document.getElementsByTagName('video')[0].currentTime.toFixed(2);`)

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
  videoPlayerUtils.addErrorLog(error, "getVideoFrameInfo")
  return undefined
}
}

/**
 * @this {videoPlayerController}
 * @param {*} width 
 * @returns {Promise<NSData>}
 */
videoPlayerController.prototype.screenshot = async function(width){
  if (!MNUtil.isMacOS()) {
    let webInfo = await this.getCurrentWebInfo()
    if (webInfo.hasVideo) {
      let confirm = await MNUtil.confirm("🌐 MN Video Player","检测到当前网页有视频标签，是否启用视频截图？\n\nPS：iPad/iOS端普通截图无法截取视频内容，需启用视频截图")
      if (confirm) {
        let videoFrameInfo = await this.getVideoFrameInfo()
        if (videoFrameInfo && "image" in videoFrameInfo) {
          let imageData = MNUtil.dataFromBase64(videoFrameInfo.image,"jpeg")
          MNUtil.copyImage(imageData)
          MNUtil.showHUD('✅ 视频截图已复制到剪贴板')
          return imageData
        }else{
          MNUtil.showHUD("❌ 视频截图失败")
          return undefined
        }
      }
    }
  }

  return new Promise((resolve, reject) => {
    this.webview.takeSnapshotWithWidth(width,(snapshot)=>{
      resolve(snapshot.pngData())
    })
  })
}
/**
 * @this {videoPlayerController}
 * @param {string} target 
 * @param {boolean} needSubscribe 
 */
videoPlayerController.prototype.videoFrameAction= async function(target,needSubscribe = true){
    // let needSubscribe = (target !== "clipboard") && (target !== "snipaste")
    let videoFrameInfo= await this.getVideoFrameInfo()
    if (!videoFrameInfo) {
      this.showHUD("No video frame found")
      return
    }
    if (!videoPlayerUtils.checkSubscribe(true)) {
      return 
    }
    let focusNote = MNNote.getFocusNote()
try {
  
    switch (target) {
      case "clipboard":
        if ("image" in videoFrameInfo) {
          let imageData = NSData.dataWithContentsOfURL(MNUtil.genNSURL(videoFrameInfo.image))
          // let res = await videoPlayerUtils.uploadImageData(imageData,this.currentVideoId)
          // MNUtil.showHUD("上传完成")

          // let filePath = videoPlayerUtils.mainPath+"/"+this.currentVideoId+".jpeg"
          // imageData.writeToFileAtomically(filePath, true)
          // MNUtil.saveFile(filePath, "public.jpeg")
          MNUtil.copyImage(imageData)
          MNUtil.showHUD('视频截图已复制到剪贴板')
        }
        break;
      case "snipaste":
        if ("image" in videoFrameInfo) {
          let imageData = NSData.dataWithContentsOfURL(MNUtil.genNSURL(videoFrameInfo.image))
          MNUtil.postNotification("snipasteImage", {imageData:imageData})
        }
        break;
      case "editor":
        // MNUtil.copy(videoFrameInfo)
        if ("bv" in videoFrameInfo) {
          MNUtil.showHUD("videoframe → Editor")
          MNUtil.postNotification("editorInsert", {contents:[
            {type:"image",content:videoFrameInfo.image},
            {type:"text",content:videoPlayerUtils.videoTime2MD(videoFrameInfo)}
          ]})
        }else{
          MNUtil.showHUD("videoframe → Editor")
          MNUtil.postNotification("editorInsert", {contents:[
            {type:"image",content:videoFrameInfo.image}
          ]})
        }
        break;
      case "excerpt":
        if (focusNote) {
          MNUtil.showHUD("videoframe → Excerpt")
          let MDVideoInfo = videoPlayerUtils.videoInfo2MD(videoFrameInfo)
          let excerptText = (focusNote.excerptText??"")+`\n`+MDVideoInfo
            MNUtil.undoGrouping(()=>{
              focusNote.excerptText = excerptText
              focusNote.excerptTextMarkdown = true
              focusNote.processMarkdownBase64Images()
            })
        }else{
          MNUtil.showHUD("No note selected!")
          return
        }
        break;
      case "childNote":
        if (focusNote) {
          MNUtil.showHUD("videoframe → ChildNote")
          let MDVideoInfo = videoPlayerUtils.videoInfo2MD(videoFrameInfo)
          let config = {excerptText:MDVideoInfo,excerptTextMarkdown:true}
          let childNote = focusNote.createChildNote(config)
          if (childNote) {
            childNote.focusInMindMap(0.5)
          }else{
            MNUtil.showHUD("❌ Create note failed")
          }
        }else{
          MNUtil.showHUD("No note selected!")
          return
        }
        break;
      case "comment":
        if (focusNote) {
          MNUtil.showHUD("videoframe → Comment")
          let MDVideoInfo = videoPlayerUtils.videoInfo2MD(videoFrameInfo)
          MNUtil.undoGrouping(()=>{
            focusNote.excerptTextMarkdown = true
            focusNote.appendMarkdownComment(MDVideoInfo)
            focusNote.processMarkdownBase64Images()
          })
        }else{
          MNUtil.showHUD("No note selected!")
          return
        }

        break;
      case "newNote":
        MNUtil.showHUD("videoframe → ChildNote")
        let MDVideoInfo = videoPlayerUtils.videoInfo2MD(videoFrameInfo)
        let config = {excerptText:MDVideoInfo,excerptTextMarkdown:true}
        let mindmap = MNUtil.mindmapView.mindmapNodes[0].note.childMindMap
        // MNNote.new(mindmap).focusInMindMap()
        if (mindmap) {
          let childNote = MNNote.new(mindmap).createChildNote(config)
          childNote.focusInMindMap(0.5)
        }else{
          MNUtil.showHUD("Create in main mindmap")
          MNUtil.undoGrouping(()=>{
            let newNote = MNNote.new(config)
            if (!newNote) {
              MNUtil.showHUD("❌ Create note failed")
              return
            }
            newNote.focusInMindMap(0.5)
          })
        }
        break;
      default:
        MNUtil.showHUD("Unsupported action: "+target)
        break;
    }
  } catch (error) {
  videoPlayerUtils.addErrorLog(error, "videoFrameAction",target)
}
  }

/**
 * @this {videoPlayerController}
 */
videoPlayerController.prototype.blur = async function (delay = 0) {
  if (this.currentVideoId) {
    //获取video标签并暂停
    this.runJavaScript(`
      function pauseVideo() {
        const video = document.getElementsByTagName('video')[0];
        if (video) {
          video.pause();
        }
      }
      pauseVideo()
    `)
  }
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

/**
 * @this {videoPlayerController}
 * @param {string} target 
 * @returns 
 */
videoPlayerController.prototype.videoTimeAction= async function(target){
    if (!videoPlayerUtils.checkSubscribe(true)) {
      return
    }
    let videoFrameInfo = await this.getTimestamp()
    if (!videoFrameInfo) {
      return
    }
    let formatedLink = videoPlayerUtils.videoTime2MD(videoFrameInfo)
    if (!formatedLink) {
      return
    }
    let focusNote = MNNote.getFocusNote()
try {
    switch (target) {
      case "clipboard":
        MNUtil.copy(formatedLink)
        this.showHUD('视频时间戳已复制到剪贴板')
        break;
      case "editor":
        MNUtil.postNotification("editorInsert", {
          contents:[
            {type:"text",content:formatedLink}
          ]
        })
        break;
      case "excerpt":
        if (!focusNote) {
          this.showHUD("No note selected!")
          return
        }
        if ("bv" in videoFrameInfo) {
          this.showHUD("videoTime → Excerpt")
          if (focusNote.excerptPic && !focusNote.textFirst) {
            this.webview.endEditing(true)
          }
          let MDVideoInfo = formatedLink
          let excerptText = (focusNote.excerptText??"")+`\n`+MDVideoInfo
            MNUtil.undoGrouping(()=>{
              focusNote.excerptText = excerptText
              focusNote.excerptTextMarkdown = true
            })
        }
        break;
      case "childNote":
        if (!focusNote) {
          this.showHUD("No note selected!")
          return
        }
        if ("bv" in videoFrameInfo) {
          this.showHUD("videoTime → ChildNote")
          let MDVideoInfo = formatedLink
          let config = {excerptText:MDVideoInfo,excerptTextMarkdown:true}
          let childNote = focusNote.createChildNote(config)
          childNote.focusInMindMap(0.5)
        }
        break;
      case "comment":
        if (!focusNote) {
          this.showHUD("No note selected!")
          return
        }
        if ("bv" in videoFrameInfo) {
          this.showHUD("videoTime → Comment")
          let MDVideoInfo = formatedLink
            MNUtil.undoGrouping(()=>{
              focusNote.appendMarkdownComment(MDVideoInfo)
            })
        }
        break;
      case "newNote":
        if ("bv" in videoFrameInfo) {
          this.showHUD("videoTime → ChildNote")
          let MDVideoInfo = formatedLink
          let config = {excerptText:MDVideoInfo,excerptTextMarkdown:true}
          let mindmap = MNUtil.mindmapView.mindmapNodes[0].note.childMindMap
          // MNNote.new(mindmap).focusInMindMap()
          if (mindmap) {
            let childNote = MNNote.new(mindmap).createChildNote(config)
            childNote.focusInMindMap(0.5)
          }else{
            this.showHUD("Create in main mindmap")
            MNUtil.undoGrouping(()=>{
              let newNote = MNNote.new(config)
              newNote.focusInMindMap(0.5)
            })
          }
        }
        break;
      default:
        this.showHUD("Unsupported action: "+target)
        break;
    }
  } catch (error) {
  videoPlayerUtils.addErrorLog(error, "videoTimeAction",target)
}
}
videoPlayerController.prototype.animateTo = function(frame){
  this.onAnimate = true
  MNUtil.animate(()=>{
    this.view.frame = frame
    this.currentFrame = frame
  }).then(()=>{
    this.onAnimate = false
  })
}
videoPlayerController.prototype.checkPopover = function(){
  if (this.view.popoverController) {this.view.popoverController.dismissPopoverAnimated(true);}
}
videoPlayerController.prototype.refreshLastSyncTime = function () {
  let dateObj = new Date(videoPlayerConfig.getConfig("lastSyncTime"))
  MNButton.setTitle(this.syncTimeButton, "Last Sync Time: "+dateObj.toLocaleString())
  this.refreshView("syncView")
  this.refreshView("configSearchView")
}
/**
 * @this {videoPlayerController}
 */
videoPlayerController.prototype.updateEngineButton = function(){
  this.engineButton.setTitleForState("Source",0);
}
/**
 * 
 * @param {string} title 
 * @param {number} duration 
 * @param {UIView} view 
 */
videoPlayerController.prototype.showHUD = function (title,duration = 1.5,view = this.view) {
  MNUtil.showHUD(title,duration,view)
}


/**
 * @this {videoPlayerController}
 */
videoPlayerController.prototype.openSetting = function(targetView){
if (this.view.popoverController) {this.view.popoverController.dismissPopoverAnimated(true);}
try {

    // this.settingController.view.hidden = false
    if (!this.settingView) {
      this.createSettingView()
    }
    this.settingView.hidden = false
    let frame = this.view.frame
    if (frame.height < 420) {
      frame.height = 420
    }
    this.view.frame = frame
    this.currentFrame = frame
    if (targetView === "webApp" || targetView === "engine") {
      MNUtil.log("webapp: "+this.webApp)
      this.configSearchView.hidden = false
      this.advanceView.hidden = true
      this.syncView.hidden = true
      this.configMode = 1
      this.configEngine = this.webApp
      MNButton.setColor(this.advancedButton, "#9bb2d6")
      MNButton.setColor(this.configWebappButton, "#457bd3")
      MNButton.setColor(this.syncConfig, "#9bb2d6")
      this.setButtonText(videoPlayerConfig.webAppEntrieNames,this.webApp)
      this.setTextview(this.webApp)
      this.refreshLayout()
      return
    }
    try {
      this.refreshView("configSearchView")
    } catch (error) {
      videoPlayerUtils.addErrorLog(error, "openSettingView")
    }
  
} catch (error) {
  videoPlayerUtils.addErrorLog(error, "openSettingView")
}
}

/**
 * 
 * @param {string} title 
 * @param {number} duration 
 * @param {UIView} view 
 */
videoPlayerController.prototype.waitHUD = function (title,view = this.view) {
  MNUtil.waitHUD(title,view)
}
/**
 * 
 * @param {string} url 
 * @returns {Promise<boolean>}
 */
videoPlayerController.prototype.currentURLStartsWith = async function(url) {
  let currentURL = await this.getCurrentURL()
  return currentURL.startsWith(url);
}

videoPlayerController.prototype.downloadPDF = async function (params) {
try {

  // MNUtil.copy(params.pdfBase64)
  MNUtil.stopHUD()
  let pdfData = videoPlayerUtils.dataFromBase64(params.pdfBase64,"pdf")
  if (!pdfData) {
    MNUtil.showHUD("Invalid PDF")
    return
  }
  let fileSize = pdfData.length()/1000000
  MNUtil.stopHUD()
  let defaultName = "imported_"+Date.now()+".pdf"
  let title = await this.runJavaScript("document.title")
  if (title && title.trim()) {
    defaultName = title+".pdf"
  }
  let option = {}
  let userInput = await MNUtil.input("🌐 MN Video Player","Please input the name of the document\n\n请输入文档名称\n\nDefault: "+defaultName+"\n\nFile Size: "+fileSize.toFixed(2)+"MB",["Cancel",defaultName,"Confirm"])
  if (userInput.button === 0) {
    return
  }
  if (userInput.button === 1) {
    option.fileName = defaultName
  }
  let input = userInput.text
  if (input && input.trim()) {
    if (input.endsWith(".pdf")) {
      option.fileName = input
    }else{
      option.fileName = input+".pdf"
    }
  }
  let md5 = videoPlayerUtils.importPDFFromData(pdfData,option)
  MNUtil.log(md5)
  if (md5) {
    MNUtil.openDoc(md5)
  }
  
} catch (error) {
  videoPlayerUtils.addErrorLog(error, "downloadPDF")
}
}

videoPlayerController.prototype.changeBilibiliVideoPart = async function (button) {
let encodedPartInfo = await this.runJavaScript(`    
    function getPartInfo() {
      let videoPod = document.getElementsByClassName("video-pod__body")[0]
      
      if (!videoPod) {
        console.log("No video pod found")
        return []
      }
      let list = document.getElementsByClassName("video-pod__list multip list")[0]
      if (list) {
        let items = list.getElementsByClassName("simple-base-item video-pod__item")
        let partInfo = []
        for (let i = 0; i < items.length; i++) {
          let item = items[i]
          let title = item.getElementsByClassName("title")[0].textContent.trim()
          let time = item.getElementsByClassName("stats")[0].textContent.trim()
          let times = time.split(":")
          let minutes = parseInt(times[0])
          let seconds = parseInt(times[1])
          let totalSeconds = minutes*60+seconds

          if (item.classList.contains("active")) {
            partInfo.push({title:title,time:time,active:true,totalSeconds:totalSeconds,p:i+1})
          }else{
            partInfo.push({title:title,time:time,active:false,totalSeconds:totalSeconds,p:i+1})
          }
        }
        console.log(partInfo)

        return encodeURIComponent(JSON.stringify(partInfo))
      }else{
        let list = videoPod.getElementsByClassName("video-pod__list section")[0]
        if (!list) {
          console.log("No video list found")
          return []
        }
        let partInfo = []
        let items = list.getElementsByClassName("pod-item video-pod__item simple")
        for (let i = 0; i < items.length; i++) {
          let item = items[i]
          let bvid = item.getAttribute("data-key")
          let isSingle = item.getElementsByClassName("single-p")[0]?true:false
          let isActive = item.getElementsByClassName("simple-base-item active normal")[0]?true:false
          if (isSingle) {
            let title = item.getElementsByClassName("title-txt")[0].textContent.trim()
            let time = item.getElementsByClassName("stats")[0].textContent.trim()
            let times = time.split(":")
            let minutes = parseInt(times[0])
            let seconds = parseInt(times[1])
            let totalSeconds = minutes*60+seconds
            partInfo.push({title:title,time:time,active:isActive,totalSeconds:totalSeconds,bvid:bvid})
          }else{
            let parts = item.getElementsByClassName("simple-base-item page-item")
            parts.forEach((part,index)=>{
              let isActivePart = part.classList.contains("active")
              let title = part.getElementsByClassName("title-txt")[0].textContent.trim()
              let time = part.getElementsByClassName("stats")[0].textContent.trim()
              let times = time.split(":")
              let minutes = parseInt(times[0])
              let seconds = parseInt(times[1])
              let totalSeconds = minutes*60+seconds
              partInfo.push({title:title,time:time,active:isActivePart,totalSeconds:totalSeconds,bvid:bvid,p:index+1})
            })
            

          }
        }
        console.log(partInfo)
        return encodeURIComponent(JSON.stringify(partInfo))
        
      }
    }
    getPartInfo()
    `)
    let partInfo = JSON.parse(decodeURIComponent(encodedPartInfo))
    if (partInfo.length) {
      // MNUtil.copy(partInfo)
      let menu = new Menu(button,this)
      let selector = "changePart:"
      partInfo.forEach((part,index)=>{
        if ("bvid" in part) {
          menu.addMenuItem(part.title+" ("+part.time+")", selector,part,part.active)
        }else{
          menu.addMenuItem(part.title+" ("+part.time+")", selector,part,part.active)
        }
      })
      menu.show(true)
    }else{
      MNUtil.showHUD("No video part found")
    }
}

videoPlayerController.prototype.enableWideMode = async function() {
  let contentWidth = this.webview.scrollView.contentSize.width
  let webviewWidth = this.webview.frame.width
  if (this.view.frame.width < 700 && (contentWidth/webviewWidth) < 1.1) {
    await this.runJavaScript(`
function enableWideMode() {
  let isFullScreen = document.getElementsByClassName("mode-webscreen").length > 0
  if (isFullScreen) {
    return
  }
  let isWideMode = document.querySelectorAll('[data-screen="wide"]').length > 0
  if (isWideMode) {
    return
  }
// 存储 interval ID
const intervalId = setInterval(() => {
  const wideButton = document.querySelector('.bpx-player-ctrl-btn.bpx-player-ctrl-wide');
  if (wideButton) {
    wideButton.click(); // 点击按钮
    clearInterval(intervalId); // 取消 interval
    document.getElementById("biliMainHeader").style.display = 'none'
  }
}, 1000);
}
enableWideMode()
`)
    }
  this.updateBilibiliOffset()

}
videoPlayerController.prototype.exitWideMode = async function() {
  if (this.view.frame.width > 800) {
    await this.runJavaScript(`
function exitWideMode() {
  let isFullScreen = document.getElementsByClassName("mode-webscreen").length > 0
  if (isFullScreen) {
    return
  }
  let isWideMode = document.querySelectorAll('[data-screen="wide"]').length > 0
  if (!isWideMode) {
    return
  }
// 存储 interval ID
const intervalId = setInterval(() => {
  const wideButton = document.querySelector('.bpx-player-ctrl-btn.bpx-player-ctrl-wide');
  if (wideButton) {
    wideButton.click(); // 点击按钮
    clearInterval(intervalId); // 取消 interval
    document.getElementById("biliMainHeader").style.display = 'none'
  }
}, 1000);
}
exitWideMode()
`)
              }
  this.updateBilibiliOffset()
}
videoPlayerController.prototype.changeWebAppTo = function(webApp) {
    if (webApp) {
      this.webApp = webApp;
    }
    let config = videoPlayerConfig.webAppEntries[this.webApp]
    var url = config.link
    MNUtil.showHUD("Changing WebApp to "+config.title)

    this.setWebMode(config.desktop)
    this.inHomePage = false
    if (this.webview.url !== url) {
      MNConnection.loadRequest(this.webview, url)
      this.webview.hidden = false
      return
    }
}
videoPlayerController.prototype.executeCustomAction = async function(action) {
    let url
    let text
    let res = ""
    let success = true
    switch (action) {
      case "uploadPDF":
        let sourceInfo = await this.getWebSource()
        if (!sourceInfo) {
          this.showHUD("No source found")
          return false
        }
        this.uploadPDF(undefined,sourceInfo.source)
        break;
      case "uploadPDFToDoc2X":
        if (!(await this.currentURLStartsWith("https://doc2x.noedgeai.com"))) {
          MNUtil.waitHUD("Opening Doc2X...")
          this.setWebMode(true)
          MNConnection.loadRequest(this.webview, "https://doc2x.noedgeai.com")
          this.uploadOnDoc2X = {enabled:true,action:"uploadPDFToDoc2X"}
          return success
        }
        this.uploadPDF()
        break;
      case "uploadPDFToIma":
        if (!(await this.currentURLStartsWith("https://ima.qq.com"))) {
          MNUtil.waitHUD("Opening Doc2X...")
          this.setWebMode(true)
          MNConnection.loadRequest(this.webview, "https://ima.qq.com")
          this.uploadOnIma = {enabled:true,action:"uploadPDFToIma"}
          return success
        }
        this.uploadPDF()
        break;
      case "uploadImageToDoc2X":
        if (!(await this.currentURLStartsWith("https://doc2x.noedgeai.com"))) {
          MNUtil.waitHUD("Opening Doc2X...")
          this.setWebMode(true)
          MNConnection.loadRequest(this.webview, "https://doc2x.noedgeai.com")
          this.uploadOnDoc2X = {enabled:true,action:"uploadImageToDoc2X"}
          return success
        }
        this.uploadImage()
        break;
      case "changeBilibiliVideoPart":
        this.changeBilibiliVideoPart(button)
        break;
      case "screenshot":
        let width = this.view.frame.width>1000?this.view.frame.width:1000
        let imageData = await this.screenshot(width)
        MNUtil.copyImage(imageData)
        this.showHUD('截图已复制到剪贴板')
        break;
      case "videoFrame2Clipboard":
        this.videoFrameAction("clipboard")
        break;
      case "videoFrame2Editor":
        this.videoFrameAction("editor")
        break;
      case "videoFrame2Note":
        this.videoFrameAction("excerpt")
        break;
      case "videoFrame2ChildNote":
        this.videoFrameAction("childNote")
        break;
      case "videoFrameToNewNote":
        this.videoFrameAction("newNote")
        break;
      case "videoFrameToComment":
        this.videoFrameAction("comment")
        break;
      case "videoTime2Clipboard":
        this.videoTimeAction("clipboard")
        break;
      case "videoTime2Editor":
        this.videoTimeAction("editor")
        break;
      case "videoTime2Note":
        this.videoTimeAction("excerpt")
        break;
      case "videoTime2ChildNote":
        this.videoTimeAction("childNote")
        break;
      case "videoFrameToSnipaste":
        this.videoFrameAction("snipaste")
        break;
      case "videoTimeToNewNote":
        this.videoTimeAction("newNote")
        break;
      case "videoTimeToComment":
        this.videoTimeAction("comment")
        break;
      case "bigbang":
        url = await this.getCurrentURL()
        text = await this.getTextInWebview()
        MNUtil.postNotification('bigbangText', {text:text,url:url})
        break;
      case "copyCurrentURL":
        url = await this.getCurrentURL()
        MNUtil.copy(url)
        this.showHUD("链接已复制")
        break;
      case "copyAsMDLink":
        url = await this.getCurrentURL()
        text = await this.getSelectedTextInWebview()
        MNUtil.copy(`[${text}](${url})`)
        this.showHUD("链接已复制")
        break;
      case "openCopiedURL":
        MNConnection.loadRequest(this.webview, MNUtil.clipboardText)
        break;
      case "pauseOrPlay":
        res = await this.runJavaScript(`
function togglePlayPause() {
  // 假设我们的video元素的id是'myVideo'
  const video = document.getElementsByTagName('video')[0];
  if (!video) {
    return "No video found"
  }
  if (video.ended) {
    video.currentTime = 0
    video.play()
  }else if (video.paused) {
    video.play()
  }else{
    video.pause()
  }
  return ""
};
togglePlayPause()
`)
        break;
      case "toggleMute":
        res = await this.runJavaScript(`
function toggleMute() {
  const video = document.getElementsByTagName('video')[0];
  if (!video) {
    return "No video found"
  }
  video.muted = !video.muted;
  return ""
}
toggleMute()`)
        break;
      case "volumeUp":
        res = await this.runJavaScript(`
function volumeUp() {
  const video = document.getElementsByTagName('video')[0];
  if (!video) {
    return "No video found"
  }
  video.volume += 0.1;
  return ""
}
volumeUp()`)
        break;
      case "volumeDown":
        res = await this.runJavaScript(`
function volumeDown() {
  const video = document.getElementsByTagName('video')[0];
  if (!video) {
    return "No video found"
  }
  video.volume -= 0.1;
  return ""
}
volumeDown()`)
        break;
      case "play0.5x":
        res = await this.changePlaybackRate(0.5)
        break;
      case "play1.25x":
        res = await this.changePlaybackRate(1.25)
        break;
      case "play1.5x":
        res = await this.changePlaybackRate(1.5)
        break;
      case "play1.75x":
        res = await this.changePlaybackRate(1.75)
        break;
      case "play2x":
        res = await this.changePlaybackRate(2)
        break;
      case "play2.5x":
        res = await this.changePlaybackRate(2.5)
        break;
      case "play3x":
        res = await this.changePlaybackRate(3)
        break;
      case "play3.5x":
        res = await this.changePlaybackRate(3.5)
        break;
      case "play4x":
        res = await this.changePlaybackRate(4)
        break;
      case "forward10s":
        res = await this.forwardSeconds(10)
        break;
      case "forward15s":
        res = await this.forwardSeconds(15)
        break;
      case "forward30s":
        res = await this.forwardSeconds(30)
        break;
      case "backward10s":
        res = await this.backwardSeconds(10)
        break;
      case "backward15s":
        res = await this.backwardSeconds(15)
        break;
      case "backward30s":
        res = await this.backwardSeconds(30)
        break;
        default:
        break;
    }
  if (res === "No video found") {
    this.showHUD("No video found")
    success = false
  }
  return success
}
videoPlayerController.prototype.backwardSeconds = async function(seconds) {
  let res = await this.runJavaScript(`
function backwardSeconds(seconds) {
  const video = document.getElementsByTagName('video')[0];
  if (!video) {
    return "No video found"
  }
  let currentTime = video.currentTime;
  if (currentTime - seconds < 0) {
    video.currentTime = 0;
  }else{
    video.currentTime -= seconds;
  }
  video.play()
  return ""
};
backwardSeconds(${seconds})`);
  return res
}
videoPlayerController.prototype.forwardSeconds = async function(seconds) {
  let res = await this.runJavaScript(`
function forwardSeconds(seconds) {
  const video = document.getElementsByTagName('video')[0];
  if (!video) {
    return "No video found"
  }
  video.currentTime += seconds;
  video.play()
  return ""
};
forwardSeconds(${seconds})`);
  return res
}
videoPlayerController.prototype.changePlaybackRate = async function(rate) {
  let res = await this.runJavaScript(`
function changePlaybackRate(rate) {
  const video = document.getElementsByTagName('video')[0];
  if (!video) {
    return "No video found"
  }
  if (video.playbackRate === rate) {
    video.playbackRate = 1;
  }else{
    video.playbackRate = rate;
  }
  return ""
}
changePlaybackRate(${rate})`)
  return res
}

videoPlayerController.prototype.configMoreOption = function(button) {
  let id = button.id
  let menu = new Menu(button,this)
  menu.preferredPosition = 1
  let config = videoPlayerConfig.webAppEntries[id]
  menu.addMenuItem('🖥️  Desktop', 'toggleDesktop:',{type:'webApp',id:id},config.desktop)
  menu.addMenuItem('🖼️  Custom Icon', 'setCustomIcon:',{type:'webApp',id:id})
  menu.show()
}
/**
 * @this {videoPlayerController}
 * @returns {MNNote}
 */
videoPlayerController.prototype.currentNote = function () {
  return MNNote.new(this.currentNoteId)
}

videoPlayerController.prototype.getWebSource = async function () {
    let currentURL = await this.getCurrentURL()
    // menu.addMenuItem('🎬  VideoFrame → NewComment', 'changeZoomScale:',true)
    if (currentURL.startsWith("https://doc2x.noedgeai.com")) {
      return {
        title: '📤  Upload to Doc2X',
        source: 'doc2x',
        selector: 'uploadToDoc2X:'
      }
    }
    if (currentURL.startsWith("https://ima.qq.com")) {
      return {
        title: '📤  Upload to Ima',
        source: 'ima',
        selector: 'uploadToWebDefault:'
      }
    }
    if (currentURL.startsWith("https://www.kimi.com")) {
      return {
        title: '📤  Upload to Kimi',
        source: 'kimi',
        selector: 'uploadToWebDefault:'
      }
    }
    if (currentURL.startsWith("https://chat.qwen.ai")) {
      return {
        title: '📤  Upload to Qwen',
        source: 'qwen',
        selector: 'uploadPDFToWebDefault:'
      }
    }
    // if (currentURL.startsWith("https://www.doubao.com/chat/")) {
    //   menu.addMenuItem('📤  Upload to Doubao', 'uploadToWebDefault:','doubao')
    // }
    if (currentURL.startsWith("https://chat.z.ai")) {
      return {
        title: '📤  Upload to Z.ai',
        source: 'zhipu',
        selector: 'uploadPDFToWebDefault:'
      }
      // menu.addMenuItem('📤  Upload to Z.ai', 'uploadToWebDefault:','zhipu')
    }
    if (currentURL.startsWith("https://chat.deepseek.com")) {
      return {
        title: '📤  Upload to DeepSeek',
        source: 'deepseek',
        selector: 'uploadToWebDefault:'
      }
    }
    if (currentURL.startsWith("https://yuanbao.tencent.com/chat")) {
      return {
        title: '📤  Upload to Yuanbao',
        source: 'yuanbao',
        selector: 'uploadToWebDefault:'
      }
      // menu.addMenuItem('📤  Upload to Yuanbao', 'uploadPDFToWebDefault:','yuanbao')
    }
    if (currentURL.startsWith("https://space.coze.cn")) {
      return {
        title: '📤  Upload to Coze',
        source: 'coze',
        selector: 'uploadToWebDefault:'
      }
      // menu.addMenuItem('📤  Upload to Yuanbao', 'uploadPDFToWebDefault:','yuanbao')
    }
    return undefined
}
videoPlayerController.prototype.openIMA = async function (config) {
  let confirm = await MNUtil.confirm("MN Video Player","Open IMA?\n\n是否打开IMA？")
  if (confirm) {
    // MNUtil.copy(config.url)
    MNUtil.openURL(config.url)
  }
}

videoPlayerController.prototype.openWX = async function (config) {
  let confirm = await MNUtil.confirm("MN Video Player","Open WeiXin?\n\n是否打开微信？")
  if (confirm) {
    // MNUtil.copy(config.url)
    MNUtil.openURL(config.url)
  }
}
videoPlayerController.prototype.openVideoPlayer = async function (config) {
  try {
    if (!videoPlayerUtils.hasVideoConfig()) {
      await videoPlayerUtils.getVideoConfig()
    }
    let videoInfo = videoPlayerUtils.getVideoInfoById(config.videoId)
    // MNUtil.log("openVideoPlayer",videoInfo)
    let reload = config.reload ?? true//默认是重新加载
    if (reload) {//重新加载
      MNConnection.loadFile(this.webview, videoPlayerUtils.mainPath + '/player.html', videoPlayerUtils.mainPath+"/")
    }
    let cover = "https://cdn.u1162561.nyat.app:43836/d/cdn/cover/"+config.videoId+".jpeg"
    let allVideos = videoPlayerUtils.getAllVideosInfoByCollectionId(videoInfo.collection)
    // MNUtil.log("openVideoPlayer",videoInfo)
    let data = {
      title:videoInfo.title,
      url:videoInfo.url,
      startAtSeconds:config.timestamp,
      id:videoInfo.id,
      allVideos:allVideos,
      collection:videoInfo.collection,
      autoPlayNextVideo:videoPlayerConfig.getConfig("autoPlayNextVideo")
    }
    // MNUtil.log("openVideoPlayer",data)
    this.currentVideoId = videoInfo.id
    this.inHomePage = false
    let script = `initVideo("${encodeURIComponent(JSON.stringify(data))}")`
    await MNUtil.delay(0.1)
    // MNUtil.copy(script)
    this.runJavaScript(script)
  } catch (error) {
    videoPlayerUtils.addErrorLog(error, "openVideoPlayer")
  }
}

videoPlayerController.prototype.openVideoPlayerById = async function (videoId = this.currentVideoId) {
  try {
    if (!videoPlayerUtils.hasVideoConfig()) {
      await videoPlayerUtils.getVideoConfig()
    }
    let videoInfo = videoPlayerUtils.getVideoInfoById(videoId)
    videoPlayerUtils.log("baseURL", videoPlayerConfig.baseURL)
    videoPlayerUtils.log("openVideoPlayerById", videoInfo)
    let allVideos = videoPlayerUtils.getAllVideosInfoByCollectionId(videoInfo.collection)
    let cover = "https://cdn.u1162561.nyat.app:43836/d/cdn/cover/"+videoId+".jpeg"
    MNConnection.loadFile(this.webview, videoPlayerUtils.mainPath + '/player.html', videoPlayerUtils.mainPath+"/")
    let data = {
      title:videoInfo.title,
      url:videoInfo.url,
      startAtSeconds:0,
      id:videoInfo.id,
      allVideos:allVideos,
      collection:videoInfo.collection,
      autoPlayNextVideo:videoPlayerConfig.getConfig("autoPlayNextVideo")
    }
    this.currentVideoId = videoInfo.id
    this.inHomePage = false
    let script = `initVideo("${encodeURIComponent(JSON.stringify(data))}")`
    await MNUtil.delay(0.1)
    // MNUtil.copy(script)
    this.runJavaScript(script)
  } catch (error) {
    videoPlayerUtils.addErrorLog(error, "openVideoPlayer")
  }
}