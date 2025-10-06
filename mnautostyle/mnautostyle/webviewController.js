
var styleController = JSB.defineClass('styleController : UIViewController', {
  viewDidLoad: function() {
    try {
    // NSUserDefaults.standardUserDefaults().removeObjectForKey("MNAutoStyle")
    self.appInstance = Application.sharedInstance();
    self.homeImage = autoUtils.getImage(autoUtils.mainPath + `/home.png`,2)
    self.homeImage = autoUtils.getImage(autoUtils.mainPath + `/home.png`, 2)
    self.bothModeImage = autoUtils.getImage(autoUtils.mainPath + `/bothMode.png`, 2)
    self.goforwardImage = autoUtils.getImage(autoUtils.mainPath + `/goforward.png`, 2)
    self.screenImage = autoUtils.getImage(autoUtils.mainPath + `/screen.png`, 2)
    self.snipasteImage = autoUtils.getImage(autoUtils.mainPath + `/snipaste.png`, 2)
    self.closeImage = autoUtils.getImage(autoUtils.mainPath + `/stop.png`, 2)
    self.settingImage = autoUtils.getImage(autoUtils.mainPath + `/setting.png`, 1.8)

    self.custom = false;
    self.customMode = "None"
    self.dynamic = true;
    self.miniMode = false;
    self.isLoading = false;
    self.lastFrame = self.view.frame;
    self.currentFrame = self.view.frame
    self.mode = 0
    self.moveDate = Date.now()

    self.view.layer.shadowOffset = {width: 0, height: 0};
    self.view.layer.shadowRadius = 15;
    self.view.layer.shadowOpacity = 0.5;
    self.view.layer.shadowColor = UIColor.colorWithWhiteAlpha(0.5, 1);
    self.view.layer.opacity = 1.0
    self.view.layer.cornerRadius = 11
    self.view.backgroundColor = UIColor.whiteColor().colorWithAlphaComponent(0.8)
    self.highlightColor = UIColor.blendedColor(
      UIColor.colorWithHexString("#2c4d81").colorWithAlphaComponent(0.8),
      Application.sharedInstance().defaultTextColor,
      0.8
    );

// >>> opacity button >>>
    // self.webAppButton.titleLabel.font = UIFont.systemFontOfSize(12);
    // <<< opacity button <<<

    // >>> max button >>>
    self.maxButton = UIButton.buttonWithType(0);
    // self.setButtonLayout(self.maxButton,"maxButtonTapped:")
    self.maxButton.setTitleForState('➕', 0);
    self.maxButton.titleLabel.font = UIFont.systemFontOfSize(10);
    // <<< max button <<<


    // <<< search button <<<
    // >>> move button >>>
    self.moveButton = UIButton.buttonWithType(0);
    self.setButtonLayout(self.moveButton)
    // <<< move button <<<
    // >>> close button >>>
    self.closeButton = UIButton.buttonWithType(0);
    self.setButtonLayout(self.closeButton,"closeButtonTapped:")
    // self.closeButton.setTitleForState('✖️', 0);
    self.closeButton.setImageForState(self.closeImage,0)
    MNButton.setColor(self.closeButton, "#e06c75",0.8)
    // <<< close button <<<
    self.settingButton = UIButton.buttonWithType(0);
    self.setButtonLayout(self.settingButton,"settingButtonTapped:")
    MNButton.setImage(self.settingButton, self.settingImage)
    MNButton.setColor(self.settingButton, "#89a6d5",0.8)
    self.settingButton.open = false
    // >>> goForward button >>>
    self.textModeButton = UIButton.buttonWithType(0);
    self.setButtonLayout(self.textModeButton,"textButtonTapped:")
    self.textModeButton.backgroundColor = UIColor.whiteColor().colorWithAlphaComponent(0)
    self.textModeButton.layer.opacity = 0.5
    // self.textModeButton.setTitleForState("Text",0)
    MNButton.setTitle(self.textModeButton, "Text",15,true)
    // self.textModeButton.setImageForState(self.goforwardImage,0)
    // <<< goForward button <<<
      // >>> bothMode button >>>
    self.bothModeButton = UIButton.buttonWithType(0);
    self.setButtonLayout(self.bothModeButton,"bothButtonTapped:")
    self.bothModeButton.backgroundColor = UIColor.colorWithHexString("#5982c4");
    self.bothModeButton.layer.opacity = 1.0
    // self.bothModeButton.setTitleForState("Both",0)
    MNButton.setTitle(self.bothModeButton, "Both",15,true)

    // self.bothModeButton.setImageForState(self.bothModeImage,0)
    // <<< bothMode button <<<
    // >>> search button >>>
    self.imageModeButton = UIButton.buttonWithType(0);
    self.setButtonLayout(self.imageModeButton,"imageButtonTapped:")
    self.imageModeButton.backgroundColor = UIColor.whiteColor().colorWithAlphaComponent(0)
    self.imageModeButton.layer.opacity = 0.5
    // self.imageModeButton.setImageForState(self.snipasteImage,0)
    MNButton.setTitle(self.imageModeButton, "Image",15,true)
    // self.imageModeButton.setTitleForState("Image",0)



    // self.imageModeButton.setTitleForState('🔍', 0);
    // self.tabButton      = UIButton.buttonWithType(0);
    // self.color = ["#ffffb4","#ccfdc4","#b4d1fb","#f3aebe","#ffff54","#75fb4c","#55bbf9","#ea3323","#ef8733","#377e47","#173dac","#be3223","#ffffff","#dadada","#b4b4b4","#bd9fdc"]
    // autoUtils.copyJSON(autoUtils.config.image)
    for (let index = 0; index < 16; index++) {
      self["ColorButton"+index]   = UIButton.buttonWithType(0);
      self["ColorButton"+index].index = index
      // self.setColorButtonLayout(self["ColorButton"+index],"changeColorPattern:",self.color[index])
      self["ColorButton"+index].setTitleForState(autoUtils.config.image[index]===autoUtils.config.text[index]?` ${autoUtils.config.image[index]} `:"-1",0) 
    }

        // >>> screen button >>>
    self.screenButton = UIButton.buttonWithType(0);
    self.moveGesture0 = new UIPanGestureRecognizer(self,"onMoveGesture:")
    self.textModeButton.addGestureRecognizer(self.moveGesture0)
    self.moveGesture0.view.hidden = false
    // self.moveGesture0.addTargetAction(self,"onMoveGesture:")
    self.moveGesture1 = new UIPanGestureRecognizer(self,"onMoveGesture:")
    self.imageModeButton.addGestureRecognizer(self.moveGesture1)
    self.moveGesture1.view.hidden = false
    // self.moveGesture1.addTargetAction(self,"onMoveGesture:")
    self.moveGesture2 = new UIPanGestureRecognizer(self,"onMoveGesture:")
    self.bothModeButton.addGestureRecognizer(self.moveGesture2)
    self.moveGesture2.view.hidden = false
    // self.moveGesture2.addTargetAction(self,"onMoveGesture:")
    // self.moveGesture3 = new UIPanGestureRecognizer(self,"onMoveGesture:")
    // self.closeButton.addGestureRecognizer(self.moveGesture3)
    // self.moveGesture3.view.hidden = false
    // self.moveGesture3.addTargetAction(self,"onMoveGesture:")
    self.moveGesture = new UIPanGestureRecognizer(self,"onMoveGesture:")
    self.moveButton.addGestureRecognizer(self.moveGesture)
    self.moveGesture.view.hidden = false
    // self.moveGesture.addTargetAction(self,"onMoveGesture:")
    // autoUtils.showHUD("init")
    self.settingView = self.createView()
    self.settingView.hidden = true
    self.settingView.layer.backgroundColor = MNUtil.hexColorAlpha("#ffffff",1.0)
    self.tagButton = UIButton.buttonWithType(0);
    self.setButtonLayout(self.tagButton,"toggleTagDetection:","settingView")
    self.tagButton.backgroundColor = UIColor.colorWithHexString("#5982c4");
    self.tagButton.layer.opacity = 1.0
    // self.tagButton.setTitleForState("Both",0)
    MNButton.setTitle(self.tagButton, "Tag Detection: "+(autoUtils.getConfig("newExcerptTagDetection")?"✅":"❌"),15,true)

    self.wordThresholdButton = UIButton.buttonWithType(0);
    self.setButtonLayout(self.wordThresholdButton,"changeWordThreshold:","settingView")
    self.wordThresholdButton.backgroundColor = UIColor.colorWithHexString("#5982c4");
    self.wordThresholdButton.layer.opacity = 1.0
    let wordThreshold = autoUtils.getConfig("autoTitleThreshold")
    // self.wordThresholdButton.setTitleForState("Both",0)
    MNButton.setTitle(self.wordThresholdButton, "Word Threshold: "+wordThreshold,15,true)
    } catch (error) {
      autoUtils.showHUD("Error in viewDidLoad: "+error)  
    }
  },
  viewWillAppear: function(animated) {
  },
  viewWillDisappear: function(animated) {
  },
viewWillLayoutSubviews: function() {
    var viewFrame = self.view.bounds;
    var xLeft     = viewFrame.x
    var xRight    = xLeft + viewFrame.width
    var yTop      = viewFrame.y
    var yBottom   = yTop + viewFrame.height
    self.settingView.frame = MNUtil.genFrame(10, 45, viewFrame.width-20, viewFrame.height-55)
    self.tagButton.frame = MNUtil.genFrame(10,10, viewFrame.width-40, 35)
    self.wordThresholdButton.frame = MNUtil.genFrame(10,50, viewFrame.width-40, 35)
    self.closeButton.frame = {x: xLeft+210,y: 10,width: 30,height: 30};
    self.settingButton.frame = {x: xLeft+175,y: 10,width: 30,height: 30};
    self.maxButton.frame   = {x: xRight-43,y: yTop,width: 18,height: 18};
    self.moveButton.frame = {x: xLeft+10 ,y: 10,width: 160,height: 30};
    // self.screenButton.frame = {  x: xRight-40,  y: yBottom-40,  width: 30,  height: 30,};
    self.imageModeButton.frame = {  x: xLeft+115,  y: 10,  width: 55,  height: 30,}
    self.bothModeButton.frame = {  x: xLeft+10,  y: 10,  width: 50,  height: 30,};
    self.textModeButton.frame = {  x: xLeft+60,  y: 10,  width: 55,  height: 30,};
    let initX = 10
    let initY = 50
    for (let index = 0; index < 16; index++) {
      if (xLeft+initX+50 > viewFrame.width) {
        initX = 10
        initY = initY+60
      }
      self["ColorButton"+index].frame = {  x: xLeft+initX,  y: initY,  width: 50,  height: 50,};
      initX = initX+60
    }

  },
  scrollViewDidScroll: function() {
  },
  changeColorPattern: function (sender) {
    //  Application.sharedInstance().showHUD("index:"+sender.index, self.view.window, 2);
    if (self.view.popoverController) {self.view.popoverController.dismissPopoverAnimated(true);}
    let imagePattern    = autoUtils.getConfig("image")[sender.index]
    let textPattern     = autoUtils.getConfig("text")[sender.index]
    let searchPattern  = autoUtils.getConfig("search")[sender.index]
    let bigbangPattern  = autoUtils.getConfig("bigbang")[sender.index]
    let snipastePattern = autoUtils.getConfig("snipaste")[sender.index]
    let copyPattern = autoUtils.getConfig("copy")[sender.index]
    let ocrPattern = autoUtils.getConfig("ocr")[sender.index]
    let editorPattern = autoUtils.getConfig("editor")[sender.index]
    let mergePattern = autoUtils.getConfig("merge")[sender.index]
    let addReviewPattern = autoUtils.getConfig("addReview")[sender.index]
    let autoTitlePattern = autoUtils.getConfig("autoTitle")[sender.index]
    let autoAiTitlePattern = autoUtils.getConfig("autoAiTitle")[sender.index]
    let autoTranslatePattern = autoUtils.getConfig("autoTranslate")[sender.index]
    let tem
    let checkList
    // MNUtil.showHUD("changeColorPattern:"+self.mode)
    switch (self.mode) {
      case 0://both
        checkList = (
          (imagePattern===textPattern)?
          [imagePattern===0,imagePattern===1,imagePattern===2]:
          [false,false,false]).concat(
            copyPattern===1,
            searchPattern===1,
            bigbangPattern===1,
            snipastePattern===1,
            ocrPattern===1,
            editorPattern===1,
            mergePattern===1,
            addReviewPattern===1,
            autoTitlePattern===1,
            autoAiTitlePattern===1,
            autoTranslatePattern===1
          )
        break;
      case 1://text
        tem = [1,2]
        // checkList = [textPattern===0,textPattern===1,textPattern===2,copyPattern===1||copyPattern===2,searchPattern===1||searchPattern===2,bigbangPattern===1||bigbangPattern===2,snipastePattern===1||snipastePattern===2,ocrPattern===1||ocrPattern===2]
        checkList = [
          textPattern===0,
          textPattern===1,
          textPattern===2,
          tem.includes(copyPattern),
          tem.includes(searchPattern),
          tem.includes(bigbangPattern),
          tem.includes(snipastePattern),
          tem.includes(ocrPattern),
          tem.includes(editorPattern),
          tem.includes(mergePattern),
          tem.includes(addReviewPattern),
          tem.includes(autoTitlePattern),
          tem.includes(autoAiTitlePattern),
          tem.includes(autoTranslatePattern)
          ]
        break
      case 2://image
        tem = [1,3]
        // checkList = [imagePattern===0,imagePattern===1,imagePattern===2,copyPattern===1||copyPattern===3,searchPattern===1||searchPattern===3,bigbangPattern===1||bigbangPattern===3,snipastePattern===1||snipastePattern===3,ocrPattern===1||ocrPattern===3]
        checkList = [
          imagePattern===0,
          imagePattern===1,
          imagePattern===2,
          tem.includes(copyPattern),
          tem.includes(searchPattern),
          tem.includes(bigbangPattern),
          tem.includes(snipastePattern),
          tem.includes(ocrPattern),
          tem.includes(editorPattern),
          tem.includes(mergePattern),
          tem.includes(addReviewPattern),
          tem.includes(autoTitlePattern),
          tem.includes(autoAiTitlePattern),
          tem.includes(autoTranslatePattern)
          ]
        break
      default:
        break;
    }
    let menu = new Menu(sender,self)
    menu.width = 250
    menu.addMenuItem("❌ Do Nothing", "setNonePattern:",sender,false)
    menu.addMenuItem("0️⃣ Both", "setBothPattern:",sender,checkList[0])
    menu.addMenuItem("1️⃣ Fill", "setFillPattern:",sender,checkList[1])
    menu.addMenuItem("2️⃣ Border", "setBorderPattern:",sender,checkList[2])
    menu.addMenuItem("🔄 Auto Copy", "setAutoAction:",{name:"copy",index:sender.index},checkList[3])
    if (self.mode === 1) {
      menu.addMenuItem("🔄 Auto MergeText", "setAutoAction:",{name:"merge",index:sender.index},checkList[9])
      menu.addMenuItem("🔄 Auto Title", "setAutoAction:",{name:"autoTitle",index:sender.index},checkList[11])
      menu.addMenuItem("🤖 Auto AI Translate", "setAutoAction:",{name:"autoTranslate",index:sender.index},checkList[13])
    }
    menu.addMenuItem("🤖 Auto AI Title", "setAutoAction:",{name:"autoAiTitle",index:sender.index},checkList[12])
    menu.addMenuItem("🔍 Auto Search", "setAutoAction:",{name:"search",index:sender.index},checkList[4])
    menu.addMenuItem("💥 Auto Bigbang", "setAutoAction:",{name:"bigbang",index:sender.index},checkList[5])
    menu.addMenuItem("🔄 Auto Snipaste", "setAutoAction:",{name:"snipaste",index:sender.index},checkList[6])
    menu.addMenuItem("🔄 Auto OCR", "setAutoAction:",{name:"ocr",index:sender.index},checkList[7])
    menu.addMenuItem("🔄 Auto Editor", "setAutoAction:",{name:"editor",index:sender.index},checkList[8])
    menu.addMenuItem("🔄 Auto AddReview", "setAutoAction:",{name:"addReview",index:sender.index},checkList[10])
    // let commandTable 
    // commandTable = [
    //   {title:'0️⃣ Both',object:self,selector:'setBothPattern:',param:sender,checked:checkList[0]},
    //   {title:'1️⃣ Fill',object:self,selector:'setFillPattern:',param:sender,checked:checkList[1]},
    //   {title:'2️⃣ Border',object:self,selector:'setBorderPattern:',param:sender,checked:checkList[2]},
    //   {title:'Auto Copy',object:self,selector:'setAutoAction:',param:{name:"copy",index:sender.index},checked:checkList[3]},
    //   {title:'Auto MergeText',object:self,selector:'setAutoAction:',param:{name:"merge",index:sender.index},checked:checkList[9]},
    //   {title:'Auto Search',object:self,selector:'setAutoAction:',param:{name:"search",index:sender.index},checked:checkList[4]},
    //   {title:'Auto Bigbang',object:self,selector:'setAutoAction:',param:{name:"bigbang",index:sender.index},checked:checkList[5]},
    //   {title:'Auto Snipaste',object:self,selector:'setAutoAction:',param:{name:"snipaste",index:sender.index},checked:checkList[6]},
    //   {title:'Auto OCR',object:self,selector:'setAutoAction:',param:{name:"ocr",index:sender.index},checked:checkList[7]},
    //   {title:'Auto Editor',object:self,selector:'setAutoAction:',param:{name:"editor",index:sender.index},checked:checkList[8]},
    //   {title:'Auto AddReview',object:self,selector:'setAutoAction:',param:{name:"addReview",index:sender.index},checked:checkList[10]}
    // ];
    if (sender.frame.x > 100) {
      menu.preferredPosition = 0
      // self.view.popoverController = MNUtil.getPopoverAndPresent(sender,commandTable,200,0)
    }else{
      menu.preferredPosition = 4
      // self.view.popoverController = MNUtil.getPopoverAndPresent(sender,commandTable,200,4)
    }
    menu.show()

  },
  setNonePattern: function (sender) {
    Menu.dismissCurrentMenu()
    if (self.view.popoverController) {self.view.popoverController.dismissPopoverAnimated(true);}
    sender.setTitleForState(" -1 ",0)
    switch (self.mode) {
      case 0:
        autoUtils.config.text[sender.index] = -1
        autoUtils.config.image[sender.index] = -1
        break;
      case 1:
        autoUtils.config.text[sender.index] = -1
        break;
      case 2:
        autoUtils.config.image[sender.index] = -1
        break;
      default:
        break;
    }
    autoUtils.save()
  },
  setBothPattern: function (sender) {
    Menu.dismissCurrentMenu()
    if (self.view.popoverController) {self.view.popoverController.dismissPopoverAnimated(true);}
    sender.setTitleForState(" 0 ",0)
    switch (self.mode) {
      case 0:
        autoUtils.config.text[sender.index] = 0
        autoUtils.config.image[sender.index] = 0
        break;
      case 1:
        autoUtils.config.text[sender.index] = 0
        break;
      case 2:
        autoUtils.config.image[sender.index] = 0
        break;
      default:
        break;
    }
    autoUtils.save()
  },
  setFillPattern: function (sender) {
    Menu.dismissCurrentMenu()
    if (self.view.popoverController) {self.view.popoverController.dismissPopoverAnimated(true);}

    sender.setTitleForState(" 1 ",0)
    switch (self.mode) {
      case 0:
        autoUtils.config.text[sender.index] = 1
        autoUtils.config.image[sender.index] = 1
        break;
      case 1:
        autoUtils.config.text[sender.index] = 1
        break;
      case 2:
        autoUtils.config.image[sender.index] = 1
        break;
      default:
        break;
    }
    autoUtils.save()
  },
  setBorderPattern: function (sender) {
    Menu.dismissCurrentMenu()
    if (self.view.popoverController) {self.view.popoverController.dismissPopoverAnimated(true);}

    sender.setTitleForState(" 2 ",0)
    switch (self.mode) {
      case 0:
        autoUtils.config.text[sender.index] = 2
        autoUtils.config.image[sender.index] = 2
        break;
      case 1:
        autoUtils.config.text[sender.index] = 2
        break;
      case 2:
        autoUtils.config.image[sender.index] = 2
        break;
      default:
        break;
    }
    autoUtils.save()
  },
  setAutoAction: function (param) {
  try {
    Menu.dismissCurrentMenu()
    if (self.view.popoverController) {self.view.popoverController.dismissPopoverAnimated(true);}
    let action = param.name
    let colorIndex = param.index
    let config = autoUtils.config
    if (action in config) {
    }else{
      config[action] = autoUtils.getConfig(action)
    }
    MNUtil.showHUD("Set autoAction: "+action)
    switch (self.mode) {
      case 0:
        config[action][colorIndex] = (config[action][colorIndex] === 1)?0:1
        break;
      case 1:
        switch (config[action][colorIndex]) {
          case 0:
            config[action][colorIndex] = 2
            break;
          case 1:
            config[action][colorIndex] = 3
            break;
          case 2:
            config[action][colorIndex] = 0
            break;
          case 3:
            config[action][colorIndex] = 1
            break;
          default:
            config[action][colorIndex] = 0
            break;
        }
        break;
      case 2:
        switch (config[action][colorIndex]) {
          case 0:
            config[action][colorIndex] = 3
            break;
          case 1:
            config[action][colorIndex] = 2
            break;
          case 2:
            config[action][colorIndex] = 1
            break;
          case 3:
            config[action][colorIndex] = 0
            break;
          default:
            config[action][colorIndex] = 0
            break;
        }
        break;
      default:
        break;
    }
    autoUtils.config = config
    // self.appInstance.showHUD("pattern:"+autoUtils.config.copy[sender.index],self.view.window,2)
    autoUtils.save()
  } catch (error) {
    autoUtils.addErrorLog(error, "setAutoAction", {action:action,colorIndex:colorIndex})
  }
  },
  changeOpacity: function(sender) {
    Menu.dismissCurrentMenu()
    if (self.view.popoverController) {self.view.popoverController.dismissPopoverAnimated(true);}
    let commandTable = [
      {title:'100%',object:self,selector:'changeOpacityTo:',param:1.0},
      {title:'90%',object:self,selector:'changeOpacityTo:',param:0.9},
      {title:'80%',object:self,selector:'changeOpacityTo:',param:0.8},
      {title:'70%',object:self,selector:'changeOpacityTo:',param:0.7},
      {title:'60%',object:self,selector:'changeOpacityTo:',param:0.6},
      {title:'50%',object:self,selector:'changeOpacityTo:',param:0.5}
    ];
    self.view.popoverController = MNUtil.getPopoverAndPresent(sender,commandTable,100)

  },
  changeOpacityTo:function (opacity) {
    self.view.layer.opacity = opacity
  },
  imageButtonTapped: function() {
    self.settingButton.open = false
    MNButton.setColor(self.settingButton, "#89a6d5")
    self.settingView.hidden = true
    self.mode = 2
    self.imageModeButton.backgroundColor = UIColor.colorWithHexString("#5982c4");
    self.imageModeButton.layer.opacity = 1.0
    self.textModeButton.backgroundColor = UIColor.whiteColor().colorWithAlphaComponent(0)
    self.textModeButton.layer.opacity = 0.5
    self.bothModeButton.backgroundColor = UIColor.whiteColor().colorWithAlphaComponent(0)
    self.bothModeButton.layer.opacity = 0.5
    for (let i = 0; i < 16; i++) {
      self['ColorButton'+i].setTitleForState(` ${autoUtils.config.image[i]} `,0) 
    }
  },
  bothButtonTapped: function() {
    self.settingButton.open = false
    MNButton.setColor(self.settingButton, "#89a6d5")
    self.settingView.hidden = true
    self.mode = 0
    self.bothModeButton.backgroundColor = UIColor.colorWithHexString("#5982c4");
    self.bothModeButton.layer.opacity = 1.0
    self.textModeButton.backgroundColor = UIColor.whiteColor().colorWithAlphaComponent(0)
    self.textModeButton.layer.opacity = 0.5
    self.imageModeButton.backgroundColor = UIColor.whiteColor().colorWithAlphaComponent(0)
    self.imageModeButton.layer.opacity = 0.5
    for (let i = 0; i < 16; i++) {
      self['ColorButton'+i].setTitleForState(autoUtils.config.image[i]===autoUtils.config.text[i]?` ${autoUtils.config.image[i]} `:"-1",0) 
    }
  },
  textButtonTapped: function() {
    self.settingButton.open = false
    MNButton.setColor(self.settingButton, "#89a6d5")
    self.settingView.hidden = true
    self.mode = 1
    self.textModeButton.backgroundColor = UIColor.colorWithHexString("#5982c4");
    self.textModeButton.layer.opacity = 1.0
    self.imageModeButton.backgroundColor = UIColor.whiteColor().colorWithAlphaComponent(0)
    self.imageModeButton.layer.opacity = 0.5
    self.bothModeButton.backgroundColor = UIColor.whiteColor().colorWithAlphaComponent(0)
    self.bothModeButton.layer.opacity = 0.5
    for (let i = 0; i < 16; i++) {
      self['ColorButton'+i].setTitleForState(` ${autoUtils.config.text[i]} `,0) 
    }
  },
  closeButtonTapped: function() {
    // self.view.hidden = true;
    self.hide(self.addonBar.frame)
    },
  onMoveGesture:function (gesture) {

    let locationToMN = gesture.locationInView(self.appInstance.studyController(self.view.window).view)
    if ( (Date.now() - self.moveDate) > 100) {
      let translation = gesture.translationInView(self.appInstance.studyController(self.view.window).view)
      let locationToBrowser = gesture.locationInView(self.view)
      let locationToButton = gesture.locationInView(gesture.view)
      let buttonFrame = self.moveButton.frame
      let newY = locationToButton.y-translation.y 
      let newX = locationToButton.x-translation.x
      if (gesture.state === 1 ) {
        gesture.locationToBrowser = {x:locationToBrowser.x-translation.x,y:locationToBrowser.y-translation.y}
      }
    }
    self.moveDate = Date.now()
    let location = {x:locationToMN.x - gesture.locationToBrowser.x,y:locationToMN.y -gesture.locationToBrowser.y}
    let frame = self.view.frame
    var viewFrame = self.view.bounds;
    let studyFrame = self.appInstance.studyController(self.view.window).view.bounds
    let y = location.y
    if (y<=0) {
      y = 0
    }
    if (y>=studyFrame.height-15) {
      y = studyFrame.height-15
    }
    let x = location.x
    
    if (self.custom) {
      // Application.sharedInstance().showHUD(self.custom, self.view.window, 2);
      self.customMode = "None"
      self.view.frame = {x:x,y:y,width:self.lastFrame.width,height:self.lastFrame.height}
      self.currentFrame  = self.view.frame

    }else{
      self.view.frame = {x:x,y:y,width:frame.width,height:frame.height}
      self.currentFrame  = self.view.frame

    }
    self.custom = false;
  },
  onResizeGesture:function (gesture) {
    self.custom = false;
    self.dynamic = false;
    let baseframe = gesture.view.frame
    let locationInView = gesture.locationInView(gesture.view)
    let frame = self.view.frame
    let width = locationInView.x+baseframe.x+baseframe.width*0.5
    let height = locationInView.y+baseframe.y+baseframe.height*0.5
    if (width <= 200) {
      width = 200
    }
    if (height <= 100) {
      height = 100
    }
    //  Application.sharedInstance().showHUD(`{x:${translation.x},y:${translation.y}}`, self.view.window, 2);
    //  self.view.frame = {x:frame.x,y:frame.y,width:frame.width+translationX,height:frame.height+translationY}
    self.view.frame = {x:frame.x,y:frame.y,width:width,height:height}
    self.currentFrame  = self.view.frame
  },
  settingButtonTapped: function (params) {
    self.settingButton.open = !self.settingButton.open
    if (self.settingButton.open) {
      MNButton.setColor(self.settingButton, "#457bd3")
      self.settingView.hidden = false
      self.view.bringSubviewToFront(self.settingView)
    }else{
      MNButton.setColor(self.settingButton, "#89a6d5")
      self.settingView.hidden = true
    }
  },
  toggleTagDetection:function (params) {
    if (!autoUtils.getConfig("newExcerptTagDetection") && !autoUtils.checkSubscribe()) {
      return
    }
    autoUtils.config.newExcerptTagDetection = !autoUtils.getConfig("newExcerptTagDetection")
    autoUtils.save()
    MNButton.setTitle(self.tagButton, "Tag Detection: "+(autoUtils.getConfig("newExcerptTagDetection")?"✅":"❌"),15,true)
  },
  changeWordThreshold:function (sender) {
    let menu = new Menu(sender,self)
    menu.width = 150
    menu.addMenuItem("2 words", "setWordThreshold:",2)
    menu.addMenuItem("5 words", "setWordThreshold:",5)
    menu.addMenuItem("10 words", "setWordThreshold:",10)
    menu.addMenuItem("15 words", "setWordThreshold:",15)
    menu.addMenuItem("20 words", "setWordThreshold:",20)
    menu.addMenuItem("25 words", "setWordThreshold:",25)
    menu.addMenuItem("30 words", "setWordThreshold:",30)
    menu.addMenuItem("50 words", "setWordThreshold:",50)
    menu.addMenuItem("100 words", "setWordThreshold:",100)
    menu.addMenuItem("1000 words", "setWordThreshold:",1000)
    menu.show()
  },
  setWordThreshold:function (threshold) {
    Menu.dismissCurrentMenu()
    autoUtils.config.autoTitleThreshold = threshold
    autoUtils.save()
    MNButton.setTitle(self.wordThresholdButton, "Word Threshold: "+threshold,15,true)
  }
});
styleController.prototype.setButtonLayout = function (button,targetAction,superview="view") {
    button.autoresizingMask = (1 << 0 | 1 << 3);
    button.setTitleColorForState(UIColor.whiteColor(),0);
    button.setTitleColorForState(this.highlightColor, 1);
    button.backgroundColor = UIColor.colorWithHexString("#9bb2d6").colorWithAlphaComponent(0.8);
    button.layer.cornerRadius = 10;
    button.layer.masksToBounds = true;
    if (targetAction) {
      button.addTargetActionForControlEvents(this, targetAction, 1 << 6);
    }
    this[superview].addSubview(button);
}
styleController.prototype.setColorButtonLayout = function (button,targetAction,color) {
  try {

    button.autoresizingMask = (1 << 0 | 1 << 3);
    button.setTitleColorForState(UIColor.blackColor(),0);
    button.setTitleColorForState(this.highlightColor, 1);
    // MNUtil.log(color)
    if (color.length === 7) {
      button.backgroundColor = UIColor.colorWithHexString(color);
    }else{
      button.backgroundColor = MNUtil.hexColor(color);
    }
    button.layer.cornerRadius = 10;
    button.layer.masksToBounds = true;
    if (targetAction) {
      button.addTargetActionForControlEvents(this, targetAction, 1 << 6);
    }
    this.view.addSubview(button);
    
  } catch (error) {
    autoUtils.addErrorLog(error, "setColorButtonLayout")
  }
}

/**
 * 
 * @param {MNNote} focusNote 
 */
styleController.prototype.autoActionDev = async function (focusNote,isOnBuiltInOCR) {
  let colorIndex = focusNote.colorIndex
  let imageExcerpt = (focusNote.excerptPic && !focusNote.textFirst)
  let tem = imageExcerpt ? [1,3] :[1,2]
  let shouldSearch = tem.includes(autoUtils.getConfig("search")[colorIndex])
  let shouldBigbang = tem.includes(autoUtils.getConfig("bigbang")[colorIndex])
  let shouldSnipaste = tem.includes(autoUtils.getConfig("snipaste")[colorIndex])
  let shouldCopy = tem.includes(autoUtils.getConfig("copy")[colorIndex])
  let shouldOCR= tem.includes(autoUtils.getConfig("ocr")[colorIndex])
  let shouldEditor= tem.includes(autoUtils.getConfig("editor")[colorIndex])
  let shouldMerge= tem.includes(autoUtils.getConfig("merge")[colorIndex])
  let shouldAddReview= tem.includes(autoUtils.getConfig("addReview")[colorIndex])
  let shouldAutoTitle = tem.includes(autoUtils.getConfig("autoTitle")[colorIndex])
  let shouldAutoAiTitle = tem.includes(autoUtils.getConfig("autoAiTitle")[colorIndex])
  let shouldAutoTranslate = tem.includes(autoUtils.getConfig("autoTranslate")[colorIndex])
  // let allActions = 0
  // let currentAction = 0
  // if (shouldOCR) {
  //   allActions += 1
  // }
  // if (shouldMerge) {
  //   allActions += 1
  // }
  // if (shouldAutoTitle) {
  //   allActions += 1
  // }
  // if (shouldAutoAiTitle) {
  //   allActions += 1
  // }
  // if (shouldAutoTranslate) {
  //   allActions += 1
  // }
  let config = {}
  let groupId = focusNote.groupNoteId
  if (isOnBuiltInOCR) {
    shouldOCR = false
  }
  if (shouldOCR) {
    if (typeof ocrUtils === 'undefined') {
      MNUtil.showHUD("MN AutoStyle: Please install 'MN OCR' first!")
    }else{
      MNUtil.log("OCR in autoActionDev begin")
      let imageData = MNUtil.getDocImage(true,true)
      // let imageData = MNUtil.currentDocController.imageFromFocusNote()
      if (!imageData && focusNote.excerptPic && focusNote.excerptPic.paint) {
        imageData = MNUtil.getMediaByHash(focusNote.excerptPic.paint)
      }
      if (!imageData) {
        MNUtil.showHUD("No image to OCR")
      }else{
        let res = await ocrNetwork.OCR(imageData)
      MNUtil.log("OCR in autoActionDev end")
        config.excerptText = res
        config.excerptTextMarkdown = true
        }
    }
  }


  if (shouldAutoTitle) {
    let excerptText = "excerptText" in config ? config.excerptText : focusNote.excerptText
    let wordCount = autoUtils.wordCountBySegmentit(excerptText)
    let threshold = autoUtils.getConfig("autoTitleThreshold")
    if (wordCount <= threshold) {
      if (!groupId) {
          config.title = excerptText
          config.excerptText = ""
      }else{
          let groupNote = MNNote.new(groupId)
          if (groupNote.title) {
            config.groupTitle = groupNote.title+";"+excerptText
          }else{
            config.groupTitle = excerptText
          }
          config.excerptText = ""
      }
    }
  }
  if (shouldAutoTranslate) {
    let excerptText = "excerptText" in config ? config.excerptText : focusNote.excerptText
    if (excerptText) {
      config.excerptText = await autoUtils.generateTranslate(excerptText)
    }
  }
  if (shouldAutoAiTitle) {
    if (!groupId) {
      if (!shouldOCR && imageExcerpt) {
        let imageData = focusNote.imageData
        let title = await autoUtils.generateTitleVision(imageData)
        config.title = title
      }else{
        let excerptText = "excerptText" in config ? config.excerptText : focusNote.excerptText
        let wordCount = autoUtils.wordCountBySegmentit(excerptText)
        let threshold = autoUtils.getConfig("autoTitleThreshold")
        if (wordCount > threshold) {
          let title = await autoUtils.generateTitle(excerptText)
          config.title = title
        }
      }
    }
  }
  if (shouldMerge && !imageExcerpt) {
    let excerptText = "excerptText" in config ? config.excerptText : focusNote.excerptText
    if (groupId && excerptText) {
      let groupNote = MNNote.new(groupId)
      if (!groupNote.excerptPic || (groupNote.textFirst)) {
        config.groupExcerptText = autoUtils.mergeStringsWithSmartSpacing(groupNote.excerptText,excerptText)
        config.excerptText = ""
      }
    }
  }
  autoUtils.editNoteOneOff(focusNote, config)
  // MNUtil.undoGrouping(()=>{
  //   if ("excerptText" in config) {
  //     focusNote.excerptText = config.excerptText
  //   }
  //   if ("title" in config) {
  //     focusNote.title = config.title
  //   }
  //   if ("excerptTextMarkdown" in config) {
  //     focusNote.excerptTextMarkdown = config.excerptTextMarkdown
  //   }
  //   if ("groupExcerptText" in config || "groupTitle" in config) {
  //     let groupNote = MNNote.new(groupId)
  //     if ("groupExcerptText" in config) {
  //       groupNote.excerptText = config.groupExcerptText
  //     }
  //     if ("groupTitle" in config) {
  //       groupNote.title = config.groupTitle
  //     }
  //   }

  // })
  if (shouldEditor) {
    if (MNUtil.mindmapView && MNUtil.mindmapView.selViewLst) {
      let noteView = MNUtil.mindmapView.selViewLst[0].view
      // let foucsNote = MNNote.getFocusNote()
      let beginFrame = noteView.convertRectToView(noteView.bounds, MNUtil.studyView)
      if (focusNote) {
        let noteId = focusNote.noteId
        let studyFrame = MNUtil.studyView.bounds
        if (beginFrame.x+450 > studyFrame.width) {
          let endFrame = MNUtil.genFrame(studyFrame.width-450, beginFrame.y-10, 450, 500)
          if (beginFrame.y+490 > studyFrame.height) {
            endFrame.y = studyFrame.height-500
          }
          MNUtil.postNotification("openInEditor",{noteId:noteId,beginFrame:beginFrame,endFrame:endFrame})
        }else{
          let endFrame = MNUtil.genFrame(beginFrame.x, beginFrame.y-10, 450, 500)
          if (beginFrame.y+490 > studyFrame.height) {
            endFrame.y = studyFrame.height-500
          }
          MNUtil.postNotification("openInEditor",{noteId:noteId,beginFrame:beginFrame,endFrame:endFrame})
        }
      }
    }else{
      MNUtil.postNotification('openInEditor', {noteId:focusNote.noteId})
    }
  }
  if (shouldSearch) {
    let excerptText = "excerptText" in config ? config.excerptText : focusNote.excerptText
    MNUtil.postNotification('searchInBrowser', {text:excerptText.trim()})
  }
  if (shouldAddReview) {
    // Database.sharedInstance().cloneNotesToFlashcardsToTopic([focusNote], MNUtil.currentNotebookId)
    // MNUtil.refreshAfterDBChanged(MNUtil.currentNotebookId)
    MNUtil.showHUD("如果没有成功添加，可能是焦点占用问题")
    MNUtil.excuteCommand("AddToReview")
  }
  if (shouldBigbang) {
    MNUtil.postNotification('bigbangNote', {noteid:focusNote.noteId})
  }
  if (shouldSnipaste) {
    MNUtil.postNotification('snipasteNote', {noteid:focusNote.noteId})
  }
  if (shouldCopy) {
    if (focusNote.excerptPic && !focusNote.textFirst) {
      let imageData = MNUtil.getMediaByHash(focusNote.excerptPic.paint)
      MNUtil.copyImage(imageData)
    }else{
      MNUtil.copy(focusNote.excerptText)
    }
  }
}

/**
 * 
 * @param {MNNote} focusNote 
 */
styleController.prototype.autoAction = async function (focusNote) {
  let colorIndex = focusNote.colorIndex
  let imageExcerpt = (focusNote.excerptPic && !focusNote.textFirst)
  let tem = imageExcerpt ? [1,3] :[1,2]
  let shouldSearch = tem.includes(autoUtils.getConfig("search")[colorIndex])
  let shouldBigbang = tem.includes(autoUtils.getConfig("bigbang")[colorIndex])
  let shouldSnipaste = tem.includes(autoUtils.getConfig("snipaste")[colorIndex])
  let shouldCopy = tem.includes(autoUtils.getConfig("copy")[colorIndex])
  let shouldOCR= tem.includes(autoUtils.getConfig("ocr")[colorIndex])
  let shouldEditor= tem.includes(autoUtils.getConfig("editor")[colorIndex])
  let shouldMerge= tem.includes(autoUtils.getConfig("merge")[colorIndex])
  let shouldAddReview= tem.includes(autoUtils.getConfig("addReview")[colorIndex])
  let shouldAutoTitle = tem.includes(autoUtils.getConfig("autoTitle")[colorIndex])
  let shouldAutoAiTitle = tem.includes(autoUtils.getConfig("autoAiTitle")[colorIndex])
  let shouldAutoTranslate = tem.includes(autoUtils.getConfig("autoTranslate")[colorIndex])
  if (shouldOCR) {
    if (typeof ocrUtils === 'undefined') {
      MNUtil.showHUD("MN AutoStyle: Please install 'MN OCR' first!")
    }else{
      let imageData = MNUtil.getDocImage(true,true)
      // let imageData = MNUtil.currentDocController.imageFromFocusNote()
      if (!imageData && focusNote.excerptPic && focusNote.excerptPic.paint) {
        imageData = MNUtil.getMediaByHash(focusNote.excerptPic.paint)
      }
      if (!imageData) {
        MNUtil.showHUD("No image to OCR")
      }else{
        if (focusNote.excerptPic && focusNote.excerptText && !focusNote.note.textFirst) {
          MNUtil.excuteCommand("EditTextMode")
        }
        let res = await ocrNetwork.OCR(imageData)
        MNUtil.undoGrouping(()=>{
          focusNote.excerptText =  res
          focusNote.excerptTextMarkdown = true
          MNUtil.showHUD("Set to excerpt")
        })
        }
      }
    }

  if (shouldSearch) {
    MNUtil.postNotification('searchInBrowser', {text:focusNote.excerptText.trim()})
  }
  if (shouldBigbang) {
    MNUtil.postNotification('bigbangNote', {noteid:focusNote.noteId})
  }
  if (shouldSnipaste) {
    MNUtil.postNotification('snipasteNote', {noteid:focusNote.noteId})
  }
  if (shouldAutoTitle) {
    let groupId = focusNote.groupNoteId
    let wordCount = autoUtils.wordCountBySegmentit(focusNote.excerptText)
    let threshold = autoUtils.getConfig("autoTitleThreshold")
    if (wordCount <= threshold) {
      if (!groupId) {
          MNUtil.undoGrouping(()=>{
            focusNote.title = focusNote.excerptText
            focusNote.excerptText = ""
          })
      }else{
          let groupNote = MNNote.new(groupId)
          MNUtil.undoGrouping(()=>{
            if (groupNote.title) {
              groupNote.title = groupNote.title+";"+focusNote.excerptText
            }else{
              groupNote.title = focusNote.excerptText
            }
            focusNote.excerptText = ""
          })
      }
    }

  }
  if (shouldAutoTranslate && focusNote.excerptText) {
    let translate = await autoUtils.generateTranslate(focusNote.excerptText)
    MNUtil.undoGrouping(()=>{
      focusNote.excerptText = translate
    })
  }
  if (shouldAutoAiTitle) {
    let groupId = focusNote.groupNoteId
    if (!groupId) {
      let wordCount = autoUtils.wordCountBySegmentit(focusNote.excerptText)
      let threshold = autoUtils.getConfig("autoTitleThreshold")
      if (wordCount > threshold) {
        let title = await autoUtils.generateTitle(focusNote.excerptText)
        MNUtil.undoGrouping(()=>{
          focusNote.title = title
        })
        // MNUtil.undoGrouping(()=>{
        //   focusNote.title = focusNote.excerptText
        //   focusNote.excerptText = ""
        // })
        // MNUtil.showHUD("autoTitle"+wordCount)
      }else{
        // MNUtil.showHUD("autoTitle"+wordCount)
      }
      // MNUtil.showHUD("autoAiTitle")
    }
  }
  if (shouldMerge && !imageExcerpt) {
    let groupId = focusNote.groupNoteId
    if (groupId && focusNote.excerptText) {
      let groupNote = MNNote.new(groupId)
      if (!groupNote.excerptPic || (groupNote.textFirst)) {
        MNUtil.undoGrouping(()=>{
            groupNote.excerptText = autoUtils.mergeStringsWithSmartSpacing(groupNote.excerptText,focusNote.excerptText)
            focusNote.excerptText = ""
        })
      }
    }
  }
  if (shouldAddReview) {
    // Database.sharedInstance().cloneNotesToFlashcardsToTopic([focusNote], MNUtil.currentNotebookId)
    // MNUtil.refreshAfterDBChanged(MNUtil.currentNotebookId)
    MNUtil.showHUD("如果没有成功添加，可能是焦点占用问题")
    MNUtil.excuteCommand("AddToReview")
  }
  if (shouldEditor) {
    if (MNUtil.mindmapView && MNUtil.mindmapView.selViewLst) {
      let noteView = MNUtil.mindmapView.selViewLst[0].view
      // let foucsNote = MNNote.getFocusNote()
      let beginFrame = noteView.convertRectToView(noteView.bounds, MNUtil.studyView)
      if (focusNote) {
        let noteId = focusNote.noteId
        let studyFrame = MNUtil.studyView.bounds
        if (beginFrame.x+450 > studyFrame.width) {
          let endFrame = MNUtil.genFrame(studyFrame.width-450, beginFrame.y-10, 450, 500)
          if (beginFrame.y+490 > studyFrame.height) {
            endFrame.y = studyFrame.height-500
          }
          MNUtil.postNotification("openInEditor",{noteId:noteId,beginFrame:beginFrame,endFrame:endFrame})
        }else{
          let endFrame = MNUtil.genFrame(beginFrame.x, beginFrame.y-10, 450, 500)
          if (beginFrame.y+490 > studyFrame.height) {
            endFrame.y = studyFrame.height-500
          }
          MNUtil.postNotification("openInEditor",{noteId:noteId,beginFrame:beginFrame,endFrame:endFrame})
        }
      }
    }else{
      MNUtil.postNotification('openInEditor', {noteId:focusNote.noteId})
    }
  }

  if (shouldCopy) {
    if (focusNote.excerptPic && !focusNote.textFirst) {
      let imageData = MNUtil.getMediaByHash(focusNote.excerptPic.paint)
      MNUtil.copyImage(imageData)
    }else{
      MNUtil.copy(focusNote.excerptText)
    }
  }
}

styleController.prototype.autoActionByTag = function (focusNote,tag) {
try {
  let shouldSearch = tag === "search"
  let shouldBigbang = tag === "bigbang"
  let shouldSnipaste = tag === "snipaste"
  let shouldCopy = tag === "copy"
  let shouldOCR = tag === "ocr"
  let shouldEditor= tag === "editor"
  let shouldMerge = tag === "merge"
  let shouldAddReview = tag === "addReview"
  if (shouldSearch) {
    MNUtil.postNotification('searchInBrowser', {text:focusNote.excerptText.trim()})
  }
  if (shouldBigbang) {
    MNUtil.postNotification('bigbangNote', {noteid:focusNote.noteId})
  }
  if (shouldSnipaste) {
    MNUtil.postNotification('snipasteNote', {noteid:focusNote.noteId})
  }
  if (shouldMerge && autoUtils.previousNote) {
    let groupNote = MNNote.new(autoUtils.previousNote)
    if (groupNote.groupNoteId) {
      groupNote = MNNote.new(groupNote.groupNoteId)
    }
    groupNote.merge(focusNote)
    MNUtil.undoGrouping(()=>{
      let mergedText = groupNote.excerptText+" "+focusNote.excerptText
      groupNote.excerptText = MNUtil.mergeWhitespace(mergedText)
      focusNote.excerptText = ""
    })
  }
  if (shouldAddReview) {
    // Database.sharedInstance().cloneNotesToFlashcardsToTopic([focusNote.note], MNUtil.currentNotebookId)
    MNUtil.showHUD("如果没有成功添加，可能是焦点占用问题")
    MNUtil.excuteCommand("AddToReview")
  }
  if (shouldEditor) {
    if (MNUtil.mindmapView && MNUtil.mindmapView.selViewLst) {
      let noteView = MNUtil.mindmapView.selViewLst[0].view
      // let foucsNote = MNNote.getFocusNote()
      let beginFrame = noteView.convertRectToView(noteView.bounds, MNUtil.studyView)
      if (focusNote) {
        let noteId = focusNote.noteId
        let studyFrame = MNUtil.studyView.bounds
        if (beginFrame.x+450 > studyFrame.width) {
          let endFrame = MNUtil.genFrame(studyFrame.width-450, beginFrame.y-10, 450, 500)
          if (beginFrame.y+490 > studyFrame.height) {
            endFrame.y = studyFrame.height-500
          }
          // MNUtil.delay(1).then(()=>{
            MNUtil.postNotification("openInEditor",{noteId:noteId,beginFrame:beginFrame,endFrame:endFrame})
          // })
        }else{
          let endFrame = MNUtil.genFrame(beginFrame.x, beginFrame.y-10, 450, 500)
          if (beginFrame.y+490 > studyFrame.height) {
            endFrame.y = studyFrame.height-500
          }
          // MNUtil.delay(1).then(()=>{
            MNUtil.postNotification("openInEditor",{noteId:noteId,beginFrame:beginFrame,endFrame:endFrame})
          // })
          // MNUtil.postNotification("openInEditor",{noteId:noteId,beginFrame:beginFrame,endFrame:endFrame})
        }
      }
    }else{
      MNUtil.postNotification('openInEditor', {noteId:focusNote.noteId})
    }
  }
  if (shouldOCR) {
    if (typeof ocrUtils === 'undefined') {
      MNUtil.showHUD("MN AutoStyle: Please install 'MN OCR' first!")
    }else{
      let imageData = MNUtil.getDocImage(true,true)
      // let imageData = MNUtil.currentDocController.imageFromFocusNote()
      if (!imageData && focusNote.excerptPic && focusNote.excerptPic.paint) {
        imageData = MNUtil.getMediaByHash(focusNote.excerptPic.paint)
      }
      if (!imageData) {
        MNUtil.showHUD("No image to OCR")
      }else{
        if (focusNote.excerptPic && focusNote.excerptText && !focusNote.note.textFirst) {
          MNUtil.excuteCommand("EditTextMode")
        }
        ocrNetwork.OCR(imageData).then((res)=>{
          MNUtil.undoGrouping(()=>{
            focusNote.excerptText =  res
            focusNote.excerptTextMarkdown = true
            MNUtil.showHUD("Set to excerpt")
          })
          if (focusNote.excerptPic && !focusNote.note.textFirst) {
            MNUtil.delay(0.5).then(()=>{
              MNUtil.excuteCommand("EditTextMode")
            })
          }
        })

      }
    }

  }
  if (shouldCopy) {
    if (focusNote.excerptPic) {
      let imageData = MNUtil.getMediaByHash(focusNote.excerptPic.paint)
      MNUtil.copyImage(imageData)
    }else{
      MNUtil.copy(focusNote.excerptText)
    }
  }
} catch (error) {
  MNUtil.showHUD("Error in autoActionByTag: "+error)
}
}
styleController.prototype.show = function (frame) {
  let preFrame = this.view.frame
  preFrame.width = 250
  preFrame.height = 290
  if (preFrame.x+250 > MNUtil.studyView.bounds.width) {
    preFrame.x = MNUtil.studyView.bounds.width-250
  }
  let preOpacity = this.view.layer.opacity
  this.view.layer.opacity = 0.2
  if (frame) {
    this.view.frame = frame
    this.currentFrame = frame
  }
  this.onAnimate = true
  this.view.hidden = false
  this.moveButton.hidden = true
  this.bothModeButton.hidden = true
  this.imageModeButton.hidden = true
  this.textModeButton.hidden = true
  this.closeButton.hidden = true
  this.settingButton.hidden = true
  this.settingButton.open = false
  MNButton.setColor(this.settingButton, "#89a6d5")
  this.settingView.hidden = true
  for (let index = 0; index < 16; index++) {
    this["ColorButton"+index].hidden = true
  }
  this.refreshColorButtons()
  MNUtil.animate(()=>{
    this.view.layer.opacity = preOpacity
    this.view.frame = preFrame
    this.currentFrame = preFrame
  }).then(()=>{
    this.view.layer.borderWidth = 0
    this.moveButton.hidden = false
    this.bothModeButton.hidden = false
    this.imageModeButton.hidden = false
    this.textModeButton.hidden = false
    this.closeButton.hidden = false
    this.settingButton.hidden = false
    this.onAnimate = false
    for (let index = 0; index < 16; index++) {
      this["ColorButton"+index].hidden = false
    }
  })
}
styleController.prototype.hide = async function (frame) {
  let preFrame = this.view.frame
  let preOpacity = this.view.layer.opacity
        // Application.sharedInstance().showHUD(JSON.stringify(frame),this.view.window,2)
  this.onAnimate = true
  this.moveButton.hidden = true
  this.bothModeButton.hidden = true
  this.imageModeButton.hidden = true
  this.textModeButton.hidden = true
  this.closeButton.hidden = true
  this.settingButton.hidden = true
  for (let index = 0; index < 16; index++) {
    this["ColorButton"+index].hidden = true
  }
  MNUtil.animate(()=>{
    this.view.layer.opacity = 0.2
    if (frame) {
      this.view.frame = frame
      this.currentFrame = frame
    }
  }).then(()=>{
    this.onAnimate = false
    this.view.hidden = true;
    this.view.layer.opacity = preOpacity      
    this.view.frame = preFrame
    this.currentFrame = preFrame
  })
}
styleController.prototype.createView = function (superview="view",color="#9bb2d6",alpha=1.0) {
  let view = UIView.new()
  view.backgroundColor = MNUtil.hexColorAlpha(color,alpha)
  view.layer.cornerRadius = 12
  this[superview].addSubview(view)
  return view
}
styleController.prototype.refreshColorButtons = function(){
    let colors = autoUtils.getCurrentNotebookExcerptColor()
    // autoUtils.copyJSON(autoUtils.config.image)
    for (let index = 0; index < 16; index++) {
      this.setColorButtonLayout(this["ColorButton"+index],"changeColorPattern:",colors[index])
    }
}