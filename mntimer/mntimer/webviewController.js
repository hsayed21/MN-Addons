/** @return {timerController} */
const getTimerController = ()=>self
var timerController = JSB.defineClass('timerController : UIViewController <UIWebViewDelegate>',{
  // /** @self {timerController} */
  viewDidLoad: function() {
  try {
    
    let self = getTimerController()
    self.appInstance = Application.sharedInstance();
    self.custom = false;
    self.customMode = "None"
    self.miniMode = false;
    self.shouldCopy = false
    self.shouldComment = false
    self.selectedText = '';
    self.searchedText = '';
    self.isFirst = true
    self.timerOn = false
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
    self.view.layer.shadowColor = MNUtil.hexColorAlpha("#636363",0.5)
    self.view.layer.cornerRadius = 15
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
    // self.view.addSubview(self.webview);
        // let dragInteraction = UIDragInteraction(self)
        // self.view.addInteraction(dragInteraction)
    self.createButton("toolbar")
    self.toolbar.backgroundColor = MNUtil.hexColorAlpha("#727f94",0.5)
    self.toolbar.hidden = true

    self.createButton("closeButton","closeButtonTapped:")
    self.closeButton.setTitleForState('✖️', 0);
    self.closeButton.titleLabel.font = UIFont.systemFontOfSize(10);

    self.createButton("minButton","minButtonTapped:")
    self.minButton.setTitleForState('➖', 0);
    self.minButton.titleLabel.font = UIFont.systemFontOfSize(10);

    // self.createButton("screenButton","changeScreen:","toolbar")
    self.createButton("screenButton","changeOpacity:")

    self.screenButton.setImageForState(timerUtils.screenImage,0)
    MNButton.setColor(self.screenButton, "#ffffff",0.0)

    self.createButton("homeButton","homeButtonTapped:","toolbar")
    self.homeButton.setImageForState(timerUtils.homeImage,0)

    self.createButton("moveButton","moveButtonTapped:")
    self.moveButton.clickDate = Date.now()

    self.createButton("goForwardButton","goForwardButtonTapped:","toolbar")
    self.goForwardButton.setImageForState(timerUtils.goforwardImage,0)

    self.createButton("goBackButton","goBackButtonTapped:","toolbar")
    self.goBackButton.setImageForState(timerUtils.gobackImage,0)
    // <<< goBack button <<<
    // >>> refresh button >>>
    self.createButton("refreshButton","refreshButtonTapped:","toolbar")
    self.refreshButton.setImageForState(timerUtils.reloadImage,0)
    // <<< refresh button <<<
    
    MNButton.addPanGesture(self.moveButton, self, "onMoveGesture:")
    MNButton.addLongPressGesture(self.moveButton, self, "onLongPress:")
    // self.moveGesture = new UIPanGestureRecognizer(self,"onMoveGesture:")
    // self.moveButton.addGestureRecognizer(self.moveGesture)
    // self.moveGesture.view.hidden = false
    // self.moveGesture.addTargetAction(self,"onMoveGesture:")
    MNButton.addPanGesture(self.screenButton, self, "onResizeGesture:")
    // self.resizeGesture = new UIPanGestureRecognizer(self,"onResizeGesture:")
    // self.screenButton.addGestureRecognizer(self.resizeGesture)
    // self.resizeGesture.view.hidden = false
    // self.resizeGesture.addTargetAction(self,"onResizeGesture:")
    self.creatTextView("todoText")
    self.todoText.backgroundColor = timerConfig.themeColor()
    MNButton.setRadius(self.todoText,10)
  } catch (error) {
    timerUtils.addErrorLog(error, "viewDidLoad")
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
  let self = getTimerController()
    var viewFrame = self.view.bounds;
    if (self.onAnimate) {
      return
    }
    if (self.miniMode) {
      let webFrame = MNUtil.genFrame(0, 0, viewFrame.width, 70)
      self.webview.frame = webFrame
      MNButton.setRadius(self.moveButton,15)
      return
    }
    MNButton.setRadius(self.moveButton,8)
    let buttonHeight = 25
    var width    = viewFrame.width
    var height   = viewFrame.height
    self.closeButton.frame = MNUtil.genFrame(width-18,0,18,18)
    self.minButton.frame = MNUtil.genFrame(width-43,0,18,18)
    self.toolbar.frame = MNUtil.genFrame(1,height-30,width-2,buttonHeight)
    self.screenButton.frame = MNUtil.genFrame(width-20,height-20,20,20)
    if (self.miniMode) {
      self.todoText.frame = MNUtil.genFrame(width*0.5-100,height-40,timerConfig.miniWidth,35)
    }else{
      self.todoText.frame = MNUtil.genFrame(width*0.5-100,height-40,200,35)
    }

    if (width <= 300) {
      self.goBackButton.hidden = true
      self.goForwardButton.hidden = true
      self.refreshButton.hidden = true
      self.moveButton.frame = {x: width*0.5-75,y: 0,width: width*0.35,height: 16};
      self.homeButton.frame = {  x: 0,  y: 0,  width: 35,  height: buttonHeight,};    
    }else if (width <= 380) {
      self.moveButton.frame = {  x: width*0.5-75,  y: 0,  width: width*0.35,  height: 16};
      self.refreshButton.hidden = !timerConfig.toolbar
      self.goBackButton.hidden = !timerConfig.toolbar
      self.homeButton.hidden = !timerConfig.toolbar
      self.goForwardButton.hidden = !timerConfig.toolbar
      self.homeButton.frame = {  x: 106,  y: 0,  width: 35,  height: buttonHeight,};  
    }else{
      self.moveButton.frame = {  x: width*0.5-75,  y: 0,  width: 150,  height: 16};
      self.refreshButton.hidden = !timerConfig.toolbar
      self.goBackButton.hidden = !timerConfig.toolbar
      self.goForwardButton.hidden = !timerConfig.toolbar
      self.homeButton.hidden = !timerConfig.toolbar
      self.screenButton.hidden = false
      self.homeButton.frame = {  x: 106,  y: 0,  width:35,  height: buttonHeight,};   
    }

    self.goBackButton.frame = {  x:1,  y: 0,  width: 30,  height: buttonHeight,};
    self.goForwardButton.frame = {  x:36,  y: 0,  width: 30,  height: buttonHeight,};
    self.refreshButton.frame = {  x: 71,  y: 0,  width: 30,  height: buttonHeight,};
    self.webview.frame = {x:0,y:8,width:width,height:height-8}
    try {
      if (self.settingView) {
        self.settingViewLayout()
      }
    } catch (error) {
      timerUtils.addErrorLog(error, "viewWillLayoutSubviews")
    }

  },

  webViewDidStartLoad: function(webView) {
  },
  webViewDidFinishLoad: function(webView) {
    if (webView.name === "webviewInput") {
      let config = {
        "themeColor":timerConfig.getConfig("themeColor"),
        "background": timerConfig.getConfig("background"),
        "lineColor":timerConfig.getConfig("lineColor"),
        "fillColor":timerConfig.getConfig("fillColor"),
        "textColor":timerConfig.getConfig("textColor"),
        "annoText":timerConfig.getConfig("annoText"),
        "alertOnFinish": timerConfig.getConfig("alertOnFinish"),
        "showSecond":timerConfig.getConfig("showSecond")
      }
      self.setWebviewContent(JSON.stringify(config))
    }
  },
  webViewDidFailLoadWithError: function(webView, error) {


  },
  webViewShouldStartLoadWithRequestNavigationType: function(webView,request,type){
    let currentURL = webView.request.URL().absoluteString()
    // MNUtil.copy(currentURL)
    let requestURL = request.URL().absoluteString()
    if (/^timer\:\/\//.test(requestURL)) {
      let text = decodeURIComponent(requestURL.split("action=")[1])
      switch (text) {
        case "beginWatch":
        case "startTimer":
        case "beginClockMode":
          if (self.miniMode) {
            MNUtil.animate(()=>{ 
              self.view.layer.opacity = 1
            },0.5)
            return false
          }
          self.miniMode = true
          let frame = self.view.frame
          let viewCenter = self.view.center.x
          frame.x = viewCenter-100
          frame.width = timerConfig.miniWidth
          frame.height = 70
          self.toMinimode(frame)
          break;
        case "openSetting":
          self.webview.endEditing(true)
          break;
        case "stop":
          self.showHUD("⏸️ Pause")
          if (self.miniMode) {
            MNUtil.delay(0.3).then(()=>{
              MNUtil.animate(()=>{ 
                self.view.layer.opacity = 0.5
              },0.5)
            })
          }
          break;
        case "start":
          self.showHUD("▶️ Resume")
          MNUtil.delay(0.3).then(()=>{
            MNUtil.animate(()=>{ 
              self.view.layer.opacity = 1
            },0.5)
          })
          break;
        case "finishTimer":
          if (timerConfig.getConfig('alertOnFinish') && timerUtils.checkSubscribe()) {
            MNUtil.input(
              "Countdown Finish!", "倒计时结束!", ["⏰  Clock Mode",'⏱️  Count Up','⌛  Countdown: 5mins','⌛  Countdown: 10mins','⌛  Countdown: 15mins','🍅  Countdown: 25mins','⌛  Countdown: 40mins','⌛  Countdown: 60mins','⌛  Countdown: Custom']
            ).then(res=>{
              // MNUtil.showHUD("message"+index)
              switch (res.button) {
                case 0:
                  self.beginClockMode()
                  break;
                case 1:
                  self.stopWatch()
                  break;
                case 2:
                  self.getTimer(5)
                  break;
                case 3:
                  self.getTimer(10)
                  break;
                case 4:
                  self.getTimer(15)
                  break;
                case 5:
                  self.getTimer(25)
                  break;
                case 6:
                  self.getTimer(40)
                  break;
                case 7:
                  self.getTimer(60)
                  break;
                case 8:
                  let minutes = parseFloat(res.input)
                  if (minutes > 0) {
                    self.getTimer(minutes)
                  }
                default:
                  break;
              }
            })
          }
          break;
        // case "cancelTimer":
        //   MNUtil.showHUD("cancelTimer")
        //   break;
        // case "beginWatch":
        //   MNUtil.showHUD("beginWatch")
        //   break;
        // case "cancelWatch":
        //   MNUtil.showHUD("cancelWatch")
        //   break;
        // case "startOrStop":
        //   MNUtil.showHUD("pause/resume")
        //   break;
        default:
          self.showHUD(text)
          break;
      }
      return false
    }
    // Application.sharedInstance().showHUD(requestURL, self.view.window, 2);
    if (/^https:\/\/d.bilibili/.test(requestURL)) {
      return false
    }
    if (/^(marginnote\dapp|zotero)/.test(requestURL)) {
      MNUtil.openURL(requestURL)
      // Application.sharedInstance().openURL(NSURL.URLWithString(requestURL));
      return false
    }
    if (timerUtils.shouldPrevent(currentURL,requestURL,type)) {
      // MNUtil.showHUD("prevent")
      MNConnection.loadRequest(self.webview, requestURL)
      return false
    }
    return true;
  },
  /**
   * 
   * @param {UITextView} textview 
   */
  textViewDidChange:function (textview) {
    let text = textview.text
    if (/\n/.test(text) && text.trim()) {
      textview.text = text.trim()
      textview.endEditing(true)
    }
  },
  changeScreen: function(sender) {
    if (sender.link) {
      MNConnection.loadRequest(self.webview, sender.link)
      return
    }
    var commandTable 
    if (self.isMainWindow) {
      commandTable = [
        {title:'🎚 Zoom',object:self,selector:'changeZoom:',param:sender},
      ];
    }else{
      commandTable = [
        {title:'🎚 Zoom',object:self,selector:'changeZoom:',param:sender},
        {title:'🫧 Opacity',object:self,selector:'changeOpacity:',param:sender}
      ];
    }
    
    self.popoverController = MNUtil.getPopoverAndPresent(sender, commandTable,250,2)
  },
  moveButtonTapped: async function(button) {
    let self = getTimerController()
    if (self.miniMode) {
      let timerMode = await self.getTimerMode()
      if (timerMode > 0) {
        if ((Date.now() - button.clickDate) < 300) {
          self.showHUD("⏰  Clock Mode")
          MNUtil.delay(0.8).then(()=>{
            self.beginClockMode()
            MNUtil.animate(()=>{ 
              self.view.layer.opacity = 1
            },0.5)
          })
        }else{
          button.clickDate = Date.now()
          self.startStop()
        }
        return
      }
    }
    var commandTable = [
        {title:'⏰  Clock Mode',object:self,selector:'toClockMode:',param:'left'},
        {title:'⏱️  Count Up',object:self,selector:'beginCountUp:',param:'left'},
        {title:'⌛  Countdown: 5mins',object:self,selector:'beginCountDown:',param:5},
        {title:'⌛  Countdown: 10mins',object:self,selector:'beginCountDown:',param:10},
        {title:'⌛  Countdown: 15mins',object:self,selector:'beginCountDown:',param:15},
        {title:'🍅  Countdown: 25mins',object:self,selector:'beginCountDown:',param:25},
        {title:'⌛  Countdown: 40mins',object:self,selector:'beginCountDown:',param:40},
        {title:'⌛  Countdown: 60mins',object:self,selector:'beginCountDown:',param:60},
        {title:'⌛  Countdown: Custom',object:self,selector:'beginCountDown:',param:-1},
        {title:'⌛  Timer Object',object:self,selector:'copyTimerObject:',param:-1},
      ];
    if (!self.miniMode) {
      commandTable.unshift({title:'⚙️  Setting',object:self,selector:'openSettingView:',param:'left'})
    }else{
      commandTable.unshift({title:'📝  Annotation',object:self,selector:'inputAnnotation:',param:'left'})
      commandTable.unshift({title:'📤  Exit Mini Mode',object:self,selector:'exitMiniMode:',param:'left'})
    }
    self.popoverController = MNUtil.getPopoverAndPresent(button, commandTable,200,1)
  },
  copyTimerObject: function(){
    let self = getTimerController()
    self.getTimerStatus()
    // MNUtil.copy(timerUtils.getTimerObject())
  },
  inputAnnotation: async function(){
    let self = getTimerController()
    if (self.popoverController) {self.popoverController.dismissPopoverAnimated(true);}
    self.inputAnnotation()

  },
  exitMiniMode: function(){
    let self = getTimerController()
    if (self.popoverController) {self.popoverController.dismissPopoverAnimated(true);}
    let viewFrame = self.view.frame
    let preFrame = viewFrame
    self.view.hidden = true
    self.showAllButton()
    self.setFrame(self.lastFrame)
    self.show(preFrame)
  },
  toClockMode: function(){
    let self = getTimerController()
    if (self.popoverController) {self.popoverController.dismissPopoverAnimated(true);}
    if (self.miniMode) {
      MNUtil.animate(()=>{ 
        self.view.layer.opacity = 0.5
      },0.5).then(()=>{
        self.beginClockMode()
      })
    }else{
      self.beginClockMode()
    }
  },
  beginCountUp: function(){
    let self = getTimerController()
    if (self.popoverController) {self.popoverController.dismissPopoverAnimated(true);}
    if (self.miniMode) {
      MNUtil.animate(()=>{ 
        self.view.layer.opacity = 0.5
      },0.5).then(()=>{
        self.stopWatch()
      })
    }else{
      self.stopWatch()
    }
  },
  beginCountDown: async function(mins){
    let self = getTimerController()
    if (self.popoverController) {self.popoverController.dismissPopoverAnimated(true);}
    if (self.miniMode) {
      MNUtil.animate(()=>{ 
        self.view.layer.opacity = 0.5
      },0.5).then(()=>{
        self.getTimer(mins)
      })
    }else{
      self.getTimer(mins)
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
    self.popoverController = MNUtil.getPopoverAndPresent(sender, commandTable,100)
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
    self.popoverController = MNUtil.getPopoverAndPresent(sender, commandTable,100)
  },

  changeOpacityTo:function (opacity) {
    self.view.layer.opacity = opacity
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
    try {
    self.view.bringSubviewToFront(self.settingView)
    self.settingView.hidden = false
    self.settingViewLayout()
    } catch (error) {
      timerUtils.addErrorLog(error, "openSettingView")
    }
  },

  homeButtonTapped: function() {
    self.homePage()
  },
  goBackButtonTapped: function() {
    self.webview.goBack();
  },
  goForwardButtonTapped: function() {
    self.webview.goForward();
  },
  refreshButtonTapped: function(para) {
    if (self.webview.loading) {
      self.webview.stopLoading();
      self.refreshButton.setImageForState(timerUtils.reloadImage,0)
      self.changeButtonOpacity(1.0)
      self.isLoading = false;
    }else{
      self.webview.reload();
    }
  },
  closeButtonTapped: async function() {
    let self = getTimerController()
    await self.hide()
    // self.homePage()
    self.webview.removeFromSuperview();
    // self.clearContent()
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
 resetConfigTapped: async function () {
  let self = getTimerController()
  let res = await MNUtil.confirm("🤖 MN Timer","Are you sure you want to reset the config?\n\n确定要重置配置吗？")
  if (res) {
    timerConfig.config = timerConfig.defaultConfig
    timerConfig.save("MNTimer_config")
    timerConfig.writeTimer()
    self.reloadTimer()
    self.moveButton.backgroundColor = timerConfig.themeColor()
    self.closeButton.backgroundColor = timerConfig.themeColor()
    self.minButton.backgroundColor = timerConfig.themeColor()
    self.todoText.backgroundColor = timerConfig.themeColor()
    self.todoText.textColor = timerConfig.annoTextColor()
    self.todoText.font = timerConfig.annoFont()
    // timerConfig.config = {}
    // timerConfig.save()
    // this.reloadTimer()
  }
 },
configSaveTapped: async function (button) {

    try {
      

    let self = getTimerController()
    let config = JSON.parse(await self.getWebviewContent())
    // MNUtil.log({message:"config",detail:config})
    // MNUtil.log({message:"config",detail:timerConfig.config})
    // let isSame = MNUtil.deepEqual(config, timerConfig.config)
    let isSame = timerConfig.deepEqual(config, timerConfig.config,["annotation","customMinutes"])
    if (isSame) {
      self.showHUD("No changes to save")
      return
    }
    if (!chatAIUtils.isSubscribed()) {
      let confirm = await MNUtil.confirm("🤖 MN ChatAI", "This feature requires subscription or free usage. Do you want to continue?\n\n该功能需要订阅或免费额度，是否继续？")
      if (!confirm) {
        return
      }
    };
    timerConfig.config = config
    if (!timerUtils.checkSubscribe()) {
      return
    }
    timerConfig.save("MNTimer_config")
    timerConfig.writeTimer()
    self.reloadTimer()
    self.moveButton.backgroundColor = timerConfig.themeColor()
    self.closeButton.backgroundColor = timerConfig.themeColor()
    self.minButton.backgroundColor = timerConfig.themeColor()
    self.todoText.backgroundColor = timerConfig.themeColor()
    self.todoText.textColor = timerConfig.annoTextColor()
    self.todoText.font = timerConfig.annoFont()
  } catch (error) {
    timerUtils.addErrorLog(error, "configSaveTapped")
  }
    // MNUtil.copy(config)
  },
  minButtonTapped: function() {
    self.miniMode = true
    let frame = self.view.frame
    let viewCenter = self.view.center.x
    frame.x = viewCenter-100
    frame.width = timerConfig.miniWidth
    frame.height = 70
    self.toMinimode(frame)
  },
  onMoveGesture:function (gesture) {
    let location = timerUtils.getNewLoc(gesture)
    let frame = self.view.frame
    let studyFrame = MNUtil.currentWindow.bounds
    let y = location.y
    if (y>=studyFrame.height-15) {
      y = studyFrame.height-15
    }
    let x = location.x
    if (self.miniMode) {
      if (x<0) {
        x = 0
      }
      let miniWidth = timerConfig.miniWidth
      if (x>=studyFrame.width-miniWidth) {
        x = studyFrame.width - miniWidth
      }
      if (y>=studyFrame.height-70) {
        y = studyFrame.height-70
      }
    }else{
      if (y<=30) {
        y = 30
      }
    }
    
    self.setFrame(x, y, frame.width,frame.height)
    self.custom = false;
  },
  onLongPress:function (gesture) {
    if (gesture.state === 1) {
      let self = getTimerController()
      if (self.miniMode) {
        let viewFrame = self.view.frame
        let preFrame = viewFrame
        self.view.hidden = true
        self.showAllButton()
        self.setFrame(self.lastFrame)
        self.show(preFrame)
        return
      }
      timerConfig.dynamic = false;
      self.miniMode = true
      let frame = self.view.frame
      let viewCenter = self.view.center.x
      frame.x = viewCenter-100
      frame.width = timerConfig.miniWidth
      frame.height = 70
      self.toMinimode(frame)
    }
  },
  onResizeGesture:function (gesture) {
    self.custom = false;
    timerConfig.dynamic = false;
    self.customMode = "none"
    let baseframe = gesture.view.frame
    let locationToBrowser = gesture.locationInView(self.view)
    let frame = self.view.frame
    let width = locationToBrowser.x+baseframe.width*0.35
    let height = locationToBrowser.y+baseframe.height*0.35
    if (width <= 215) {
      width = 215
    }
    if (height <= 100) {
      height = 100
    }
    //  Application.sharedInstance().showHUD(`{x:${translation.x},y:${translation.y}}`, self.view.window, 2);
    //  self.view.frame = {x:frame.x,y:frame.y,width:frame.width+translationX,height:frame.height+translationY}
    self.setFrame(frame.x, frame.y, width,height)
  }
});

timerController.prototype.homePage = function() {
  if (!this.isFirst) {
    return
  }
  try {
  this.isFirst = false
  this.reloadTimer()

  } catch (error) {
    timerUtils.addErrorLog(error, "homePage")
  }
};

timerController.prototype.reloadTimer = function() {
  try {
  this.isFirst = false
    this.webview.loadFileURLAllowingReadAccessToURL(
      NSURL.fileURLWithPath(timerUtils.mainPath + '/index.html'),
      NSURL.fileURLWithPath(timerUtils.mainPath + '/')
    );
  } catch (error) {
    timerUtils.addErrorLog(error, "reloadTimer")
  }
};

timerController.prototype.clearContent = function() {
    // this.webview.loadHTMLStringBaseURL("");
    this.webview.removeFromSuperview();
};

/** @this {timerController} */
timerController.prototype.setToolbar = async function(state) {
  timerConfig.toolbar = state
  this.homeButton.hidden = !timerConfig.toolbar
  this.goBackButton.hidden = !timerConfig.toolbar
  this.goForwardButton.hidden = !timerConfig.toolbar
  this.refreshButton.hidden = !timerConfig.toolbar

}

/** @this {timerController} */
timerController.prototype.configRunJavaScript = async function(script,delay) {
  if(!this.webviewInput || !this.webviewInput.window)return;
  return new Promise((resolve, reject) => {
    if (delay) {
      this.viewTimer = NSTimer.scheduledTimerWithTimeInterval(delay, true, () => {
        this.webviewInput.evaluateJavaScript(script,(result) => {resolve(result)});
      })
    }else{
      this.webviewInput.evaluateJavaScript(script,(result) => {resolve(result)});
    }
  })
};

/** @this {timerController} */
timerController.prototype.runJavaScript = async function(script,delay) {
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


/** @this {timerController} */
timerController.prototype.getCurrentURL = async function() {
  if(!this.webview || !this.webview.window) return;
  let url = await this.runJavaScript(`window.location.href`)
  this.webview.url = url
  return url
};
/** @this {timerController} */
timerController.prototype.getSelectedTextInWebview = async function() {
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

/** @this {timerController} */
timerController.prototype.getTextInWebview = async function() {
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

/** @this {timerController} */
timerController.prototype.changeButtonOpacity = function(opacity) {
    this.toolbar.layer.opacity = opacity
    this.moveButton.layer.opacity = opacity
    this.minButton.layer.opacity = opacity
    this.closeButton.layer.opacity = opacity
}

/** @this {timerController} */
timerController.prototype.setButtonLayout = function (button,targetAction) {
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

/** @this {timerController} */
timerController.prototype.createButton = function (buttonName,targetAction,superview) {
    this[buttonName] = UIButton.buttonWithType(0);
    this[buttonName].autoresizingMask = (1 << 0 | 1 << 3);
    this[buttonName].setTitleColorForState(UIColor.whiteColor(),0);
    this[buttonName].setTitleColorForState(this.highlightColor, 1);
    // this[buttonName].backgroundColor = MNUtil.hexColorAlpha("#a4a4a4",0.8)
    // this[buttonName].backgroundColor = timerUtils.hexColor("#a4a4a4cd")
    this[buttonName].backgroundColor = timerConfig.themeColor()
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

/** @this {timerController} */
timerController.prototype.settingViewLayout = function (){
  try {
    let viewFrame = this.view.bounds
    let width = viewFrame.width
    let height = viewFrame.height
    this.settingView.frame = {x:12.5,y:20,width:width-25,height:height-32.5}

    this.webviewInput.frame = {x:0,y:0,width:width-25,height:height-32}

    this.saveButton.frame = {x:width-91,y:height-70,width:this.saveButton.width,height:this.saveButton.height}

    let settingFrame = this.settingView.bounds
    settingFrame.y = 3
    settingFrame.height = 29
    settingFrame.x = width - 57
    settingFrame.width = 29
    this.closeConfig.frame = settingFrame
    settingFrame.x = settingFrame.x - 65
    settingFrame.width = 60
    this.resetConfig.frame = settingFrame

  } catch (error) {
    timerUtils.addErrorLog(error, "settingViewLayout")
  }
}

/** @this {timerController} */
timerController.prototype.createSettingView = function (){
  // return
try {
  let targetView = "settingView"
  this.settingView = UIView.new()
  this.settingView.backgroundColor = UIColor.whiteColor().colorWithAlphaComponent(0.0)
  this.settingView.layer.cornerRadius = 13
  this.settingView.hidden = true
  this.view.addSubview(this.settingView)



  this.createWebviewInput(targetView)

  this.createButton("saveButton","configSaveTapped:",targetView)
  // this.saveButton.layer.opacity = 1.0
  // this.saveButton.setTitleForState("Save",0)
  MNButton.setConfig(this.saveButton, {opacity:0.8,color:"#e06c75",title:"Save","font":18,bold:true})
  this.saveButton.width = 60
  this.saveButton.height = 32

  this.createButton("closeConfig","closeConfigTapped:",targetView)
  this.closeConfig.setImageForState(timerUtils.stopImage,0)
  this.closeConfig.backgroundColor = UIColor.whiteColor().colorWithAlphaComponent(0)
  MNButton.setColor(this.closeConfig, "#e06c75",0.8)

  this.createButton("resetConfig","resetConfigTapped:",targetView)
  MNButton.setConfig(this.resetConfig, {opacity:0.8,color:"#e06c75",title:"Reset","font":18,bold:true})

  // this.refreshView(targetView)
} catch (error) {
  timerUtils.addErrorLog(error, "createSettingView")
}

}


/**
 * @this {timerController}
 */
timerController.prototype.createWebviewInput = function (superView) {
  try {
  this.webviewInput = new UIWebView(this.view.bounds);
  this.webviewInput.backgroundColor = MNUtil.hexColorAlpha("#c0bfbf",0.8)
  this.webviewInput.scalesPageToFit = false;
  this.webviewInput.autoresizingMask = (1 << 1 | 1 << 4);
  this.webviewInput.delegate = this;
  // this.webviewInput.setValueForKey("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1.1 Safari/605.1.15","User-Agent")
  this.webviewInput.scrollView.delegate = this;
  this.webviewInput.layer.cornerRadius = 10;
  this.webviewInput.layer.masksToBounds = true;
  this.webviewInput.layer.borderColor = MNUtil.hexColorAlpha("#9bb2d6",0.8);
  this.webviewInput.layer.borderWidth = 0
  this.webviewInput.layer.opacity = 0.95
  this.webviewInput.scrollEnabled = false
  this.webviewInput.scrollView.scrollEnabled = false
  this.webviewInput.loadFileURLAllowingReadAccessToURL(
    NSURL.fileURLWithPath(timerUtils.mainPath + '/jsoneditor.html'),
    NSURL.fileURLWithPath(timerUtils.mainPath + '/')
  );
  this.webviewInput.name = "webviewInput"
    } catch (error) {
    timerUtils.addErrorLog(error, "createWebviewInput")
  }
  if (superView) {
    this[superView].addSubview(this.webviewInput)
  }
}
/**
 * @this {timerController}
 */
timerController.prototype.loadWebviewContent = function () {
  this.webviewInput.loadFileURLAllowingReadAccessToURL(
    NSURL.fileURLWithPath(timerUtils.mainPath + '/jsoneditor.html'),
    NSURL.fileURLWithPath(timerUtils.mainPath + '/')
  );
}
/**
 * @this {timerController}
 */
timerController.prototype.updateWebviewContent = function (content) {
  if (!MNUtil.isValidJSON(content)) {
    content = "{}"
  }
  this.configRunJavaScript(`updateContent('${encodeURIComponent(content)}')`)
}
/**
 * @this {timerController}
 */
timerController.prototype.setWebviewContent = function (content) {
  if (!MNUtil.isValidJSON(content)) {
    content = "{}"
  }
  this.configRunJavaScript(`setContent('${encodeURIComponent(content)}')`)
}

/**
 * @this {timerController}
 */
timerController.prototype.blur = async function () {
  this.configRunJavaScript(`removeFocus()`)
  this.webviewInput.endEditing(true)
}

/**
 * @this {timerController}
 */
timerController.prototype.getWebviewContent = async function () {
  // let content = await this.runJavaScript(`updateContent(); document.body.innerText`)
  let content = await this.configRunJavaScript(`getContent()`)
  let tem = decodeURIComponent(content)
  this.webviewInput.endEditing(true)
  return tem
}

/** @this {timerController} */
timerController.prototype.toMinimode = function (frame) {
  this.miniMode = true 
  if (this.settingView) {
    this.settingView.hidden = true
  }
  this.hasTodoText = this.todoText.text.trim() !== ""
  timerConfig.dynamic = false    
  this.lastFrame = this.view.frame 
  this.webview.hidden = false
  // this.webview.frame = MNUtil.genFrame(0, 0, this.view.frame.width, this.view.frame.height)
  this.currentFrame  = this.view.frame
  this.onAnimate = true
  if (frame.x < 0) {
    frame.x = 0
  }
  let miniWidth = timerConfig.miniWidth
  if (frame.x >= (MNUtil.currentWindow.frame.width-miniWidth)) {
    frame.x = MNUtil.currentWindow.frame.width-miniWidth
  }
  if (this.hasTodoText) {
    frame.height = 110
  }
  let viewFrame = MNUtil.genFrame(0, 0, frame.width, 70)
  this.moveButton.backgroundColor = timerConfig.themeColor(0)
  // this.moveButton.layer.opacity = 0
  // MNButton.setColor(this.moveButton,"#a4a4a4",0.0)
  this.hideAllButton()
  MNUtil.animate(()=>{
    this.view.layer.opacity = 0.4
    this.setFrame(frame)
    this.moveButton.frame = viewFrame
    this.webview.frame = viewFrame
    this.todoText.hidden = !this.hasTodoText
    this.todoText.frame = MNUtil.genFrame(0,viewFrame.height+5,viewFrame.width,35)
    this.todoText.endEditing(true)
    MNButton.setRadius(this.view,10)
    MNButton.setRadius(this.webview,10)
  }).then(async ()=>{
    this.moveButton.hidden = false
    this.screenButton.hidden = true
    this.onAnimate = false
    this.webview.endEditing(true)
    await MNUtil.delay(0.3)
    MNUtil.animate(()=>{ 
      self.view.layer.opacity = 1
    },0.5)
  })
}

/** @this {timerController} */
timerController.prototype.hideAllButton = function (frame) {
  this.moveButton.hidden = true
  this.closeButton.hidden = true
  this.screenButton.hidden = true
  this.minButton.hidden = true
}
/** @this {timerController} */
timerController.prototype.showAllButton = function (frame) {
  this.moveButton.hidden = false
  this.closeButton.hidden = false
  this.minButton.hidden = false
  this.screenButton.hidden = false
}
/** @this {timerController} */
timerController.prototype.show = async function (beginFrame,endFrame) {
  let preFrame = this.currentFrame
  if (!preFrame) {
    preFrame = this.view.frame
  }
  // MNUtil.showHUD("message"+preFrame.width)
  let studyFrame = MNUtil.currentWindow.frame
  if (endFrame) {
    preFrame = endFrame
  }
  // if (preFrame.width > studyFrame.width) {
  //   preFrame.width = studyFrame.width
  // }
  preFrame.width = MNUtil.constrain(preFrame.width, 215, studyFrame.width)
  preFrame.x = MNUtil.constrain(preFrame.x, 0, studyFrame.width-preFrame.width)
  let width = preFrame.width
  let height = preFrame.height
  let preOpacity = this.view.layer.opacity
  // studyController().view.bringSubviewToFront(this.view)
  this.view.layer.opacity = 0.2
  if (beginFrame) {
    // this.view.frame = beginFrame
    this.setFrame(beginFrame)
  }else{
    this.view.frame = preFrame
  }
  this.view.hidden = false
  this.miniMode = false
  let miniWidth = timerConfig.miniWidth
  if (!this.webview.isDescendantOfView(this.view)) {
    this.view.addSubview(this.webview)
    this.view.bringSubviewToFront(this.moveButton)
    this.view.bringSubviewToFront(this.closeButton)
    this.view.bringSubviewToFront(this.screenButton)
    this.view.bringSubviewToFront(this.minButton)
    this.view.bringSubviewToFront(this.todoText)
    this.webview.frame = {x:0,y:8,width:this.view.frame.width,height:this.view.frame.height-8}
    this.todoText.frame = MNUtil.genFrame(this.view.frame.width*0.5-100,this.view.frame.height-40,miniWidth,35)
  }
  this.webview.hidden = false
  this.hideAllButton()
  this.onAnimate = true
  this.timerOn = true
  // this.moveButton.layer.opacity = 1

  this.moveButton.backgroundColor = timerConfig.themeColor()
  // MNButton.setColor(this.moveButton,"#a4a4a4",0.8)
  await MNUtil.animate(()=>{
    this.view.layer.opacity = preOpacity
    this.setFrame(preFrame)
    // this.view.frame = preFrame
    this.webview.frame = {x:0,y:8,width:width,height:height-8}
    this.todoText.frame = MNUtil.genFrame(width*0.5-100,height-40,miniWidth,35)
    this.todoText.hidden = false
    MNButton.setRadius(this.view,15)
    MNButton.setRadius(this.webview,15)
    // if (width>300) {
    //   this.moveButton.frame = {  x: width*0.5-75,  y: 0,  width: 150,  height: 15};
    // }else{
    //   this.moveButton.frame = {  x: width*0.5-75,  y: 0,  width: width*0.35,  height: 15};
    // }
  })
  MNUtil.currentWindow.bringSubviewToFront(this.view)
  this.webview.layer.borderWidth = 0
  this.view.layer.borderWidth = 0
  this.webview.hidden = false
  this.onAnimate = false
  this.view.setNeedsLayout()
  this.showAllButton()
  this.webview.endEditing(true)
}
/** @this {timerController} */
timerController.prototype.hide = async function (frame) {
  return new Promise((resolve, reject) => {
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
    this.onAnimate = true
    this.timerOn = false
    MNUtil.animate(()=>{
      this.view.layer.opacity = 0.2
      // if (frame) {
      //   this.setFrame(frame)
      // }
    }).then(()=>{
      this.view.hidden = true;
      this.view.layer.opacity = preOpacity      
      this.setFrame(preFrame)
      // this.view.frame = preFrame
      this.webview.layer.borderWidth = 0
      this.onAnimate = false
      this.custom = preCustom
      this.homePage()
      this.webview.endEditing(true)
      resolve()
    })
  })

}
/** @this {timerController} */
timerController.prototype.setFrame = function(x,y,width,height){
    if (typeof x === "object") {
      this.view.frame = x
    }else{
      this.view.frame = MNUtil.genFrame(x, y, width, height)
    }
    this.currentFrame = this.view.frame
  }

/** @this {timerController} */
timerController.prototype.creatView = function (viewName,superview="view",color="#9bb2d6",alpha=0.8) {
  this[viewName] = UIView.new()
  this[viewName].backgroundColor = MNUtil.hexColorAlpha(color,alpha)
  this[viewName].layer.cornerRadius = 12
  this[superview].addSubview(this[viewName])
}

/** @this {timerController} */
timerController.prototype.creatTextView = function (viewName,superview="view",color="#c0bfbf",alpha=0.8) {
  this[viewName] = UITextView.new()
  this[viewName].font = timerConfig.annoFont()
  this[viewName].layer.cornerRadius = 8
  this[viewName].backgroundColor = MNUtil.hexColorAlpha(color,alpha)
  this[viewName].textColor = timerConfig.annoTextColor()
  this[viewName].delegate = this
  this[viewName].bounces = true
  this[superview].addSubview(this[viewName])
}

timerController.prototype.refreshView = function (targetView) {
  switch (targetView) {
    case "syncView":
      break;
    case "configView":
      break;
    default:
      break;
  }

}
timerController.prototype.getCurrentURL = async function(url) {
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

timerController.prototype.animateTo = function(frame){
  this.onAnimate = true
  MNUtil.animate(()=>{
    this.view.frame = frame
    this.currentFrame = frame
  }).then(()=>{
    this.onAnimate = false
  })
}
timerController.prototype.checkPopover = function(){
  if (this.view.popoverController) {this.view.popoverController.dismissPopoverAnimated(true);}
}

timerController.prototype.pause = function () {
  this.showHUD("Toogle Pause")
  this.runJavaScript("togglePause()")
}
timerController.prototype.beginCountDown = function (minutes) {
  let date = Date.now()
  timerUtils.timerObject.isCountUp = false
  timerUtils.timerObject.isCountDown = true
  timerUtils.timerObject.isClockMode = false
  timerUtils.timerObject.isRunning = true
  timerUtils.timerObject.isPaused = false
  timerUtils.timerObject.isFinished = false
  timerUtils.timerObject.isCancelled = false
  timerUtils.timerObject.dateBegin = date
  timerUtils.timerObject.dateEnd = date + minutes * 60000
  this.runJavaScript('window.timer.getTimer('+minutes+')')
}
/** 
* 开始倒计时
* @this {timerController} 
* @param {number} minutes 
*/
timerController.prototype.getTimer = async function (minutes) {
  try {

    if (minutes < 0){
      let defaultMinutes = timerConfig.getConfig("customMinutes")
      let option = {}
      if (defaultMinutes) {
        option.default = defaultMinutes.toString()
      }
      let res = await MNUtil.input("⏱ MN Timer","Enter minutes\n\n输入倒计时分钟数:",["Cancel", "Confirm"],option)
      if (res.button === 0){
        this.showHUD("❌ Cancelled")
        this.view.layer.opacity = 1
      }else{
        minutes = parseFloat(res.input)
        if (minutes > 0) {
          if(this.view.hidden){
            await this.show()
          }
          this.showHUD("⌛ Countdown: "+minutes+" mins")
          this.beginCountDown(minutes)
          // this.runJavaScript('window.timer.getTimer('+minutes+')')
          timerConfig.config.customMinutes = minutes
          timerConfig.save()
        }else{
          this.showHUD("❌ Invalid minutes: "+minutes)
        }
      }
      return
    }
    if(this.view.hidden){
      await this.show()
    }
    if (minutes === 25) {
      this.showHUD("🍅 Countdown: "+minutes+" mins")
    }else{
      this.showHUD("⌛ Countdown: "+minutes+" mins")
    }
    this.beginCountDown(minutes)
    // this.runJavaScript('window.timer.getTimer('+minutes+')')
    
  } catch (error) {
    timerUtils.addErrorLog(error, "getTimer")
  }
}
/** @this {timerController} */
timerController.prototype.cancelTimer = function () {
  this.runJavaScript('window.timer.cancelTimer()')
}

/** @this {timerController} */
timerController.prototype.beginClockMode = async function () {
  if(this.view.hidden){
    await this.show()
  }
  this.runJavaScript('window.timer.beginClockMode()')
}
/** 
* 开始正计时
* @this {timerController} 
*/
timerController.prototype.stopWatch = async function () {
  if(this.view.hidden){
    await this.show()
  }
  timerUtils.timerObject.isCountUp = true
  timerUtils.timerObject.isCountDown = false
  timerUtils.timerObject.isClockMode = false
  timerUtils.timerObject.isRunning = true
  timerUtils.timerObject.isPaused = false
  timerUtils.timerObject.isFinished = false
  timerUtils.timerObject.isCancelled = false
  timerUtils.timerObject.dateBegin = Date.now()
  timerUtils.timerObject.dateEnd = 0
  this.runJavaScript('window.timer.stopWatch()')
}
/** @this {timerController} */
timerController.prototype.cancelWatch = function () {
  this.runJavaScript('window.timer.cancelWatch()')
}
/** @this {timerController} */
timerController.prototype.startStop = async function () {
  this.runJavaScript('window.timer.startStop()')
}

/** @this {timerController} */
timerController.prototype.getTimerMode = async function () {
  res = await this.runJavaScript('window.timer.getTimerMode()')
  return parseInt(res)
}
/**
 * 
 * @param {string} title 
 * @param {number} duration 
 * @param {UIView} view 
 */
timerController.prototype.showHUD = function (title,duration = 1.5,view = this.view) {
  if (this.view.hidden) {
    MNUtil.showHUD(title,duration)
    return
  }
  MNUtil.showHUD(title,duration,view)
}
/**
 * @this {timerController}
 * @param {string} annotation 
 */
timerController.prototype.setAnnotation = async function(annotation){
  this.todoText.text = annotation
  if(annotation.trim()){
    this.hasTodoText = true
  }else{
    this.hasTodoText = false
  }
  if(this.miniMode){
    await MNUtil.animate(()=>{
      this.view.layer.opacity = 0.5
    })
    await MNUtil.animate(()=>{
      let miniWidth = timerConfig.miniWidth
      let viewFrame = MNUtil.genFrame(0, 0, miniWidth, 70)
      this.currentFrame.height = 110
      this.view.frame = this.currentFrame
      this.webview.frame = viewFrame
      this.todoText.frame = MNUtil.genFrame(0,75,miniWidth,35)
      this.moveButton.frame = viewFrame
      this.todoText.hidden = !this.hasTodoText
      this.view.layer.opacity = 1
    })
  }
}

/** @this {timerController} */
timerController.prototype.inputAnnotation = async function(){
  let option = {}
  let annotation = timerConfig.getConfig("annotation")
  if (annotation && annotation.trim()) {
    option.default = annotation
  }
  let res = await MNUtil.input(
    "⏱ MN Timer","Input annotation\n\n输入注释", 
    ["⏰  Clock Mode",'⏱️  Count Up','⌛  Countdown: 5mins','⌛  Countdown: 10mins','⌛  Countdown: 15mins','🍅  Countdown: 25mins','⌛  Countdown: 40mins','⌛  Countdown: 60mins'],
    option
  )
  this.todoText.text = res.input
  if(res.input.trim()){
    this.hasTodoText = true
  }else{
    this.hasTodoText = false
  }
  if(this.miniMode){
    await MNUtil.animate(()=>{
      this.view.layer.opacity = 0.5
    })
    await MNUtil.animate(()=>{
      let miniWidth = timerConfig.miniWidth
      let viewFrame = MNUtil.genFrame(0, 0, miniWidth, 70)
      this.currentFrame.height = 110
      this.view.frame = this.currentFrame
      this.webview.frame = viewFrame
      this.todoText.frame = MNUtil.genFrame(0,75,miniWidth,35)
      this.moveButton.frame = viewFrame
      this.todoText.hidden = !this.hasTodoText
      this.view.layer.opacity = 1
    })
  }
        // MNUtil.showHUD("⏱️ Count Up")
  switch (res.button) {
      case 0:
        this.beginClockMode()
        break;
      case 1:
        this.stopWatch()
        break;
      case 2:
        this.getTimer(5)
        break;
      case 3:
        this.getTimer(10)
        break;
      case 4:
        this.getTimer(15)
        break;
      case 5:
        this.getTimer(25)
        break;
      case 6:
        this.getTimer(40)
        break;
      case 7:
        this.getTimer(60)
        break;
      default:
        break;
    }
  timerConfig.config.annotation = this.todoText.text
  timerConfig.save()
}
timerController.prototype.resetConfig = async function () {
  MNUtil.showHUD("Resetting config...")
  let res = await MNUtil.confirm("🤖 MN Timer","Are you sure you want to reset the config?\n\n确定要重置配置吗？")
  if (res) {
    // timerConfig.config = {}
    // timerConfig.save()
    // this.reloadTimer()
  }
}
timerController.prototype.getTimerStatus = async function () {
  let temp = await this.runJavaScript('getTimerStatus()')
  let status = JSON.parse(temp)
  let res = {
    mode: status.mode,
    timePassed: status.timePassed,
    timeRemaining: status.timeRemaining,
    currentClockTime: status.currentClockTime,
    isRunning: status.isRunning,
    isPaused: status.isPaused,
    finished: status.isFinished,
    watching: status.watching
  }
  timerUtils.timerObject = res
  MNUtil.copy(res)
  return res
}
// timerController.prototype.creatTextView = function (viewName,superview="view",color="#c0bfbf",alpha=0.8) {
//   this[viewName] = UITextView.new()
//   this[viewName].font = UIFont.systemFontOfSize(15);
//   this[viewName].layer.cornerRadius = 8
//   this[viewName].backgroundColor = MNUtil.hexColorAlpha(color,alpha)
//   this[viewName].textColor = UIColor.blackColor()
//   this[viewName].delegate = this
//   this[viewName].bounces = true
//   this[superview].addSubview(this[viewName])
// }