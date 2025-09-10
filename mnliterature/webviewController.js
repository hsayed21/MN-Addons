/**
 * 文献管理视图控制器
 * 
 * 技术要点：
 * 1. 继承自 UIViewController：iOS 的标准视图控制器基类
 * 2. 实现 NSURLConnectionDelegate 协议：用于处理网络请求
 * 3. 通过 JSB.defineClass 创建 Objective-C 类
 * 
 * 视图层级结构：
 * - self.view（主视图）
 *   - literatureView（文献操作视图）
 *     - 各种文献操作按钮
 *   - settingView（设置视图）
 *     - 各种设置选项
 *   - moveButton（标题/拖动按钮）
 *   - closeButton（关闭按钮）
 *   - settingButton（设置按钮）
 * 
 * @return {literatureController}
 */
var literatureController = JSB.defineClass('literatureController : UIViewController <NSURLConnectionDelegate>', {
  /**
   * 视图加载完成的生命周期方法
   * 
   * 这是 iOS UIViewController 的核心生命周期方法：
   * - 在视图控制器的 view 被加载到内存后调用
   * - 只会调用一次（在控制器的整个生命周期中）
   * - 用于初始化视图和设置 UI 组件
   * 
   * 执行时机：
   * 当 literatureController.new() 被调用时，系统会：
   * 1. 创建控制器实例
   * 2. 创建主视图（self.view）
   * 3. 调用 viewDidLoad
   */
  viewDidLoad: function() {
    try {
      // === 1. 加载图片资源 ===
      // 加载按钮图标，第二个参数是缩放比例
      self.closeImage = MNUtil.getImage(MNUtil.mainPath + `/stop.png`, 2)
      // self.translateImage = MNUtil.getImage(MNUtil.mainPath + `/translate.png`, 2)
      self.settingImage = MNUtil.getImage(MNUtil.mainPath + `/setting.png`, 1.8)
      // self.clearImage = MNUtil.getImage(MNUtil.mainPath + `/eraser.png`, 1.8)
      
      // === 2. 初始化状态变量 ===
      // self.lastFrame = self.view.frame;
      // self.currentFrame = self.view.frame
      self.moveDate = Date.now()  // 用于拖动手势的时间跟踪
      
      // === 3. 设置主视图的外观 ===
      // 设置阴影效果（让面板看起来浮在上方）
      self.view.layer.shadowOffset = {width: 0, height: 0};  // 阴影偏移
      self.view.layer.shadowRadius = 15;                      // 阴影模糊半径
      self.view.layer.shadowOpacity = 0.5;                    // 阴影透明度
      self.view.layer.shadowColor = UIColor.colorWithWhiteAlpha(0.5, 1);  // 阴影颜色
      
      // 设置视图本身的外观
      self.view.layer.opacity = 1.0              // 视图透明度
      self.view.layer.cornerRadius = 15          // 圆角半径
      self.view.backgroundColor = UIColor.whiteColor().colorWithAlphaComponent(0.8)  // 半透明白色背景
      self.highlightColor = UIColor.blendedColor(MNUtil.hexColorAlpha("#2c4d81", 0.8),
        MNUtil.app.defaultTextColor,
        0.8
      );

      // === 4. 创建子视图 ===
      // 文献操作视图（主要功能区域）
      self.literatureView = self.createView()
      self.literatureView.hidden = false  // 默认显示
      self.literatureView.layer.backgroundColor = MNUtil.hexColorAlpha("#ffffff", 0.0)  // 透明背景

      // === 5. 创建按钮组件 ===
      // 标题/源选择按钮（显示当前源，点击可切换）
      // self.moveButton = self.createButton("changeSource:")  // 指定响应方法
      // self.moveButton.titleLabel.font = UIFont.boldSystemFontOfSize(16);
      // // self.moveButton.backgroundColor = MNUtil.hexColorAlpha("#457bd3",0.8)
      // MNButton.setColor(self.moveButton, "#5694ff",0.8)
      // MNButton.setRadius(self.moveButton, 12)

      // 关闭按钮
      // self.closeButton = self.createButton("closeButtonTapped:")  // 响应方法：closeButtonTapped
      // MNButton.setImage(self.closeButton, self.closeImage)       // 设置图标
      // MNButton.setColor(self.closeButton, "#e06c75",0.8)         // 红色按钮
      // MNButton.setRadius(self.closeButton, 12)                   // 圆角
      self.closeButton = MNButton.new({
        image: literatureUtils.mainPath + `/logo.png`,
        radius: 12,
        color: "#e06c75",
        opacity: .8,
      }, self.view)
      self.closeButton.addClickAction(self, "closeButtonTapped:")
      // 为关闭按钮添加拖动手势（通过拖动关闭按钮可以移动整个面板）
      // UIPanGestureRecognizer 是 iOS 的拖动手势识别器
      self.moveGesture = new UIPanGestureRecognizer(self, "onMoveGesture:")
      self.closeButton.addGestureRecognizer(self.moveGesture)
      self.moveGesture.view.hidden = false
      self.moveGesture.addTargetAction(self, "onMoveGesture:")  // 指定手势响应方法

      // 设置按钮
      // self.settingButton = self.createButton("settingButtonTapped:")
      // MNButton.setImage(self.settingButton, self.settingImage)
      // MNButton.setColor(self.settingButton, "#89a6d5",0.8)  // 蓝色按钮
      // self.settingButton.open = false  // 自定义属性，标记设置面板是否打开
      // MNButton.setRadius(self.settingButton, 12)
      // let fontSize = 15
      // self.LiteratureCommentButton = self.createButton("beginLiterature:","literatureView")
      // self.LiteratureCommentButton.action = "toComment"
      // MNButton.setTitle(self.LiteratureCommentButton, "Literature → Comment",fontSize,true)
      // MNButton.setColor(self.LiteratureCommentButton, "#457bd3",0.8)
      // MNButton.setRadius(self.LiteratureCommentButton, 10)

      // self.LiteratureOptionButton = self.createButton("beginLiterature:","literatureView")
      // self.LiteratureOptionButton.action = "toOption"
      // MNButton.setTitle(self.LiteratureOptionButton, "Literature → Option",fontSize,true)
      // MNButton.setColor(self.LiteratureOptionButton, "#457bd3",0.8)
      // MNButton.setRadius(self.LiteratureOptionButton, 10)

      // // self.LiteratureClearButton.titleLabel.font = UIFont.boldSystemFontOfSize(14);

      // self.PDFLiteratureFileButton = self.createButton("beginPDFLiterature:","literatureView")
      // self.PDFLiteratureFileButton.action = "file"
      // MNButton.setTitle(self.PDFLiteratureFileButton, "Literature → Buffer",fontSize,true)
      // MNButton.setRadius(self.PDFLiteratureFileButton, 10)
      // MNButton.setColor(self.PDFLiteratureFileButton, "#457bd3",0.8)

      // self.PDFLiteratureExportButton = self.createButton("beginPDFLiterature:","literatureView")
      // self.PDFLiteratureExportButton.action = "export"
      // MNButton.setTitle(self.PDFLiteratureExportButton, "Literature → Export",fontSize,true)
      // MNButton.setColor(self.PDFLiteratureExportButton, "#457bd3",0.8)
      // MNButton.setRadius(self.PDFLiteratureExportButton, 10)

      // self.PDFLiteratureCopyButton = self.createButton("beginPDFLiterature:","literatureView")
      // self.PDFLiteratureCopyButton.action = "copy"
      // MNButton.setTitle(self.PDFLiteratureCopyButton, "Literature → Clipboard",fontSize,true)
      // MNButton.setColor(self.PDFLiteratureCopyButton, "#457bd3",0.8)
      // MNButton.setRadius(self.PDFLiteratureCopyButton, 10)

      // self.PDFLiteratureEditorButton = self.createButton("beginPDFLiterature:","literatureView")
      // self.PDFLiteratureEditorButton.action = "toEditor"
      // MNButton.setTitle(self.PDFLiteratureEditorButton, "Literature → Editor",fontSize,true)
      // MNButton.setColor(self.PDFLiteratureEditorButton, "#457bd3",0.8)
      // MNButton.setRadius(self.PDFLiteratureEditorButton, 10)

      // self.PDFTranslateButton = self.createButton("togglePDFTranslate:","literatureView")
      // MNButton.setColor(self.PDFTranslateButton, "#c0bfbf",0.8)
      // MNButton.setImage(self.PDFTranslateButton, self.translateImage)
      // MNButton.setRadius(self.PDFTranslateButton, 10)

      // self.PDFLiteratureClearButton = self.createButton("clearPDFBuffer:","literatureView")
      // MNButton.setTitle(self.PDFLiteratureClearButton, "Clear buffer",fontSize,true)
      // MNButton.setColor(self.PDFLiteratureClearButton, "#457bd3",0.8)
      // MNButton.setRadius(self.PDFLiteratureClearButton, 10)

      // self.LiteratureCopyButton = self.createButton("beginLiterature:","literatureView")
      // self.LiteratureCopyButton.action = "copy"
      // MNButton.setTitle(self.LiteratureCopyButton, "Literature → Clipboard",fontSize,true)
      // MNButton.setColor(self.LiteratureCopyButton, "#457bd3",0.8)
      // MNButton.setRadius(self.LiteratureCopyButton, 10)

      // self.LiteratureExcerptButton = self.createButton("beginLiterature:","literatureView")
      // self.LiteratureExcerptButton.action = "toExcerpt"
      // MNButton.setTitle(self.LiteratureExcerptButton, "Literature → Excerpt",fontSize,true)
      // MNButton.setColor(self.LiteratureExcerptButton, "#457bd3",0.8)
      // MNButton.setRadius(self.LiteratureExcerptButton, 10)

      // self.LiteratureChildButton = self.createButton("beginLiterature:","literatureView")
      // self.LiteratureChildButton.action = "toChild"
      // MNButton.setTitle(self.LiteratureChildButton, "Literature → ChildNote",fontSize,true)
      // MNButton.setColor(self.LiteratureChildButton, "#457bd3",0.8)
      // MNButton.setRadius(self.LiteratureChildButton, 10)

      // self.LiteratureEditorButton = self.createButton("beginLiterature:","literatureView")
      // self.LiteratureEditorButton.action = "toEditor"
      // MNButton.setTitle(self.LiteratureEditorButton, "Literature → Editor",fontSize,true)
      // MNButton.setColor(self.LiteratureEditorButton, "#457bd3",0.8)
      // MNButton.setRadius(self.LiteratureEditorButton, 10)

      // self.LiteratureTitleButton = self.createButton("beginLiterature:","literatureView")
      // self.LiteratureTitleButton.action = "toTitle"
      // MNButton.setTitle(self.LiteratureTitleButton, "Literature → Title",fontSize,true)
      // MNButton.setColor(self.LiteratureTitleButton, "#457bd3",0.8)
      // MNButton.setRadius(self.LiteratureTitleButton, 10)

      // self.LiteratureClearButton = self.createButton("clearBuffer:","literatureView")
      // // MNButton.setTitle(self.LiteratureClearButton, "Clear buffer",14,true)
      // MNButton.setColor(self.LiteratureClearButton, "#c0bfbf",0.8)
      // MNButton.setImage(self.LiteratureClearButton, self.clearImage)
      // MNButton.setRadius(self.LiteratureClearButton, 10)

      // // self.tabButton      = UIButton.buttonWithType(0);
      // self.color = ["#ffffb4","#ccfdc4","#b4d1fb","#f3aebe","#ffff54","#75fb4c","#55bbf9","#ea3323","#ef8733","#377e47","#173dac","#be3223","#ffffff","#dadada","#b4b4b4","#bd9fdc"]

      // === 6. 添加手势识别器 ===

      // self.moveGesture2 = new UIPanGestureRecognizer(self,"onMoveGesture:")
      // self.settingButton.addGestureRecognizer(self.moveGesture2)
      // self.moveGesture2.view.hidden = false

      // self.moveGesture = new UIPanGestureRecognizer(self,"onMoveGesture:")
      // self.moveButton.addGestureRecognizer(self.moveGesture)
      // self.moveGesture.view.hidden = false
      // // self.moveGesture.addTargetAction(self,"onMoveGesture:")
      // // MNUtil.showHUD("init")

      // === 7. 创建设置视图 ===
      // 设置视图（默认隐藏，点击设置按钮后显示）
      self.settingView = self.createView()
      self.settingView.hidden = true  // 初始状态为隐藏
      self.settingView.layer.backgroundColor = MNUtil.hexColorAlpha("#ffffff",0)  // 透明背景

      // self.apikeyInput = self.creatTextView("settingView",undefined,0.75)
      // self.apikeyInput.text = literatureConfig.getConfig("doc2xApikey")
      // self.apikeyInput.editable = false

      // self.createWebviewInput("settingView",JSON.stringify(literatureConfig.getConfig("action")))
      // // self.webviewInput = self.creatTextView("settingView",undefined,0.75)
      // // self.webviewInput.text = JSON.stringify(literatureConfig.getConfig("action"))
      // // MNUtil.copyJSON(getAllProperties(self.webviewInput))
      // // self.webviewInput.smartQuotesType = false

      // self.promptInput = self.creatTextView("settingView",undefined,0.75)
      // self.promptInput.text = literatureConfig.getConfig("userPrompt")
      // self.promptInput.editable = true

      // self.savePromptButton = self.createButton("savePrompt:","settingView")
      // MNButton.setTitle(self.savePromptButton,"Save", 15,true)
      // MNButton.setColor(self.savePromptButton, "#89a6d5",0.8)
      // MNButton.setRadius(self.savePromptButton,8)

      // self.resetPromptButton = self.createButton("resetPrompt:","settingView")
      // MNButton.setTitle(self.resetPromptButton,"Reset", 15,true)
      // MNButton.setColor(self.resetPromptButton, "#89a6d5",0.8)
      // MNButton.setRadius(self.resetPromptButton,8)

      // self.saveActionButton = self.createButton("saveAction:","settingView")
      // MNButton.setTitle(self.saveActionButton,"Save", 14,true)
      // MNButton.setColor(self.saveActionButton, "#89a6d5",0.8)
      // MNButton.setRadius(self.saveActionButton,8)

      // self.pasteKeyButton = self.createButton("pasteApikey:","settingView")
      // MNButton.setTitle(self.pasteKeyButton,"Paste", 14,true)
      // MNButton.setColor(self.pasteKeyButton, "#89a6d5",0.8)
      // MNButton.setRadius(self.pasteKeyButton,8)

      // self.clearButton = self.createButton("clearApikey:","settingView")
      // MNButton.setTitle(self.clearButton,"Clear", 14,true)
      // MNButton.setColor(self.clearButton, "#89a6d5",0.8)
      // MNButton.setRadius(self.clearButton,8)


      // self.imageCorrectionButton = self.createButton("toggleIC:","settingView")
      // self.imageCorrectionButton.titleLabel.font = UIFont.boldSystemFontOfSize(14);

      // self.equationButton = self.createButton("togglePE:","settingView")
      // self.equationButton.titleLabel.font = UIFont.boldSystemFontOfSize(14);

      // self.rotationButton = self.createButton("toggleRotation:","settingView")
      // MNButton.setColor(self.rotationButton, "#457bd3",0.8)
      // self.rotationButton.titleLabel.font = UIFont.boldSystemFontOfSize(14);

      // self.refreshView(literatureConfig.getConfig("source"))
    
    } catch (error) {
      MNUtil.showHUD("Error in viewDidLoad: "+error)  
    }
  },
  /**
   * 视图即将显示
   * iOS 生命周期方法，在视图即将显示在屏幕上时调用
   */
  viewWillAppear: function(animated) {
  },
  /**
   * 视图即将消失
   * iOS 生命周期方法，在视图即将从屏幕上移除时调用
   */
  viewWillDisappear: function(animated) {
  },
  /**
   * 视图即将布局子视图
   * 
   * 这是 iOS 的布局生命周期方法：
   * - 在视图的 bounds 改变时调用
   * - 用于调整子视图的位置和大小
   * - 在这里设置所有按钮和子视图的 frame
   */
  viewWillLayoutSubviews: function() {
    var viewFrame = self.view.bounds;
    var xLeft     = viewFrame.x
    var xRight    = xLeft + viewFrame.width
    var yTop      = viewFrame.y
    var yBottom   = yTop + viewFrame.height
    // self.settingView.frame = MNUtil.genFrame(0, 40, viewFrame.width, viewFrame.height-45)
    // self.literatureView.frame = MNUtil.genFrame(0, 40, viewFrame.width, viewFrame.height-45)
    // self.moveButton.frame = {x: xLeft+40 ,y: 5,width: 180,height: 30};
    // self.settingButton.frame = {x: xLeft+5,y: 5,width: 30,height: 30};
    self.closeButton.frame = {x: xLeft+225,y: 5,width: 30,height: 30};
    let buttonHeight = 33
    // self.LiteratureOptionButton.frame = {x: xLeft+15 ,y: 10,width: 230,height: buttonHeight};
    // self.LiteratureCommentButton.frame = {x: xLeft+15 ,y: 50,width: 230,height: buttonHeight};
    // self.LiteratureCopyButton.frame = {x: xLeft+15 ,y: 90,width: 230,height: buttonHeight};
    // self.LiteratureExcerptButton.frame = {x: xLeft+15 ,y: 130,width: 230,height: buttonHeight};
    // self.LiteratureChildButton.frame = {x: xLeft+15 ,y: 170,width: 230,height: buttonHeight};
    // self.LiteratureEditorButton.frame = {x: xLeft+15 ,y: 210,width: 230,height: buttonHeight};
    // self.LiteratureTitleButton.frame = {x: xLeft+15 ,y: 250,width: 230,height: buttonHeight};

    // self.LiteratureClearButton.frame = MNUtil.genFrame(xRight-45, yBottom-85, 35, 35);
    // self.PDFLiteratureFileButton.frame = {x: xLeft+15 ,y: 10,width: 230,height: buttonHeight};
    // self.PDFLiteratureCopyButton.frame = {x: xLeft+15 ,y: 50,width: 230,height: buttonHeight};
    // self.PDFLiteratureExportButton.frame = {x: xLeft+15 ,y: 90,width: 230,height: buttonHeight};
    // self.PDFLiteratureEditorButton.frame = {x: xLeft+15 ,y: 130,width: 230,height: buttonHeight};
    // self.PDFTranslateButton.frame = MNUtil.genFrame(xRight-45, yBottom-85, 35, 35)

    // self.imageCorrectionButton.frame = {x: xLeft+15 ,y: 190,width: 230,height: 30};
    // self.rotationButton.frame = {x: xLeft+15 ,y: 190,width: 230,height: 30};
    // self.equationButton.frame = {x: xLeft+15 ,y: 225,width: 230,height: 30};
    // self.PDFLiteratureClearButton.frame = {x: xLeft+15 ,y: 170,width: 230,height: 30};

    // self.pasteKeyButton.frame = {x: viewFrame.width - 70 ,y: 50,width: 50,height: 25};
    // self.clearButton.frame = {x: viewFrame.width - 125 ,y: 50,width: 50,height: 25};
    // self.apikeyInput.frame = {x: xLeft+15 ,y: 10,width: 230,height: 70};
    // self.webviewInput.frame = {x: xLeft+15 ,y: 85,width: 230,height: 100};
    // self.promptInput.frame = {x: xLeft+15 ,y: 10,width: 230,height: 210};
    // self.saveActionButton.frame = {x: viewFrame.width - 65 ,y: 155,width: 50,height: 25};
    // self.savePromptButton.frame = {x: viewFrame.width - 65 ,y: 225,width: 55,height: 30};
    // self.resetPromptButton.frame = {x: viewFrame.width - 130 ,y: 225,width: 60,height: 30};
  },
  scrollViewDidScroll: function() {
  },
  changeSource:function (sender) {
    self.checkPopover()
    let source = literatureConfig.getConfig("source")
    let selector = "changeSourceTo:"
    let commandTable = [
      self.tableItem('🆓 [Free] GLM-4V Flash', selector,"glm-4v-flash",source === "glm-4v-flash"),
      self.tableItem('🆓 [Free] GLM-4.1V Thinking Flash', selector,"glm-4.1v-thinking-flash",source === "glm-4.1v-thinking-flash"),
      self.tableItem('🆓 [Free] Gemini-2.0 Flash Lite', selector,"gemini-2.0-flash-lite",source === "gemini-2.0-flash-lite"),
      self.tableItem('🆓 [Free] Gemini-2.5 Flash Lite', selector,"gemini-2.5-flash-lite",source === "gemini-2.5-flash-lite"),
      self.tableItem('🆓 [Free] GPT-4.1 Nano', selector,"GPT-4.1-nano",source === "GPT-4.1-nano"),
      self.tableItem('🆓 [Free] GPT-5 Nano', selector,"GPT-5-nano",source === "GPT-5-nano"),
      self.tableItem('🆓 [Free] Doubao 1.6 Flash No Thinking', selector,"doubao-seed-1.6-flash-nothinking",source === "doubao-seed-1.6-flash-nothinking"),
      self.tableItem('🆓 [Free] GLM-4.5V No Thinking', selector,"glm-4.5v-nothinking",source === "glm-4.5v-nothinking"),
      self.tableItem('🏞️ SimpleTex', selector,"SimpleTex",source === "SimpleTex"),
      self.tableItem('📝 Doc2X PDF', selector,"Doc2XPDF",source === "Doc2XPDF"),
      self.tableItem('🏞️ Doc2X Image', selector,"Doc2X",source === "Doc2X"),
    ];
    if (literatureNetwork.isActivated()) {
      commandTable.push({title:'🤖 Doubao 1.6 No Thinking',object:self,selector:selector,param:"doubao-seed-1-6-nothinking",checked:source === "doubao-seed-1-6-nothinking"})
      commandTable.push(self.tableItem('🤖 GPT-5', selector,"GPT-5",source === "GPT-5"))
      commandTable.push(self.tableItem('🤖 GPT-5 Mini', selector,"GPT-5-mini",source === "GPT-5-mini"))
      commandTable.push(self.tableItem('🤖 GPT-4o', selector,"GPT-4o",source === "GPT-4o"))
      commandTable.push(self.tableItem('🤖 GPT-4o Mini', selector,"GPT-4o-mini",source === "GPT-4o-mini"))
      commandTable.push(self.tableItem('🤖 GPT-4.1', selector,"GPT-4.1",source === "GPT-4.1"))
      commandTable.push(self.tableItem('🤖 GPT-4.1 Mini', selector,"GPT-4.1-mini",source === "GPT-4.1-mini"))
      // commandTable.push({title:'🤖 Abab6.5s',object:self,selector:selector,param:"abab6.5s-chat",checked:source === "abab6.5s-chat"})
      commandTable.push({title:'🤖 MiniMax-Text-01',object:self,selector:selector,param:"MiniMax-Text-01",checked:source === "MiniMax-Text-01"})
      commandTable.push({title:'🤖 Doubao 1.6',object:self,selector:selector,param:"doubao-seed-1-6",checked:source === "doubao-seed-1-6"})
      commandTable.push({title:'🤖 GLM-4.5V',object:self,selector:selector,param:"glm-4.5v",checked:source === "glm-4.5v"})
      commandTable.push({title:'🤖 GLM-4V Plus',object:self,selector:selector,param:"glm-4v-plus",checked:source === "glm-4v-plus"})
      commandTable.push({title:'🤖 Moonshot-v1',object:self,selector:selector,param:"Moonshot-v1",checked:source === "Moonshot-v1"})
      commandTable.push({title:'🤖 Claude-3.5 Haiku',object:self,selector:selector,param:"claude-3-5-haiku",checked:source === "claude-3-5-haiku"})
      commandTable.push({title:'🤖 Claude-3.7 Sonnet',object:self,selector:selector,param:"claude-3-7-sonnet",checked:source === "claude-3-7-sonnet"})
      commandTable.push({title:'🤖 Claude-4 Sonnet',object:self,selector:selector,param:"claude-sonnet-4",checked:source === "claude-sonnet-4"})
      commandTable.push({title:'🤖 Claude-4 Opus',object:self,selector:selector,param:"claude-opus-4",checked:source === "claude-opus-4"})
      commandTable.push({title:'🤖 Gemini-2.0 Flash',object:self,selector:selector,param:"gemini-2.0-flash",checked:source === "gemini-2.0-flash"})
      commandTable.push({title:'🤖 Gemini-2.5 Flash',object:self,selector:selector,param:"gemini-2.5-flash",checked:source === "gemini-2.5-flash"})
      commandTable.push({title:'🤖 Gemini-2.5 Pro',object:self,selector:selector,param:"gemini-2.5-pro",checked:source === "gemini-2.5-pro"})
      // commandTable.push({title:'🤖 Claude-3.5-Haiku',object:self,selector:selector,param:"claude-3-5-haiku-20241022",checked:source === "claude-3-5-haiku-20241022"})
    }
    self.view.popoverController = MNUtil.getPopoverAndPresent(sender,commandTable,350,1)
    // self.view.popoverController = literatureUtils.getPopoverAndPresent(sender,commandTable,200)
  },
  changeSourceTo:function (source) {
    if (self.view.popoverController) {self.view.popoverController.dismissPopoverAnimated(true);}
    literatureConfig.config.source = source
    self.refreshView(source)
    literatureConfig.save()
  },
  savePrompt: async function (params) {
    let prompt = self.promptInput.text
    MNUtil.showHUD("Save prompt")
    literatureConfig.config.userPrompt = prompt
    literatureConfig.save()
  },
  resetPrompt: async function (params) {
    self.promptInput.text = `—role—
Image Text Extraction Specialist

—goal—
* For the given image, please directly output the text in the image.

* For any formulas, you must enclose them with dollar signs.

—constrain—
* You are not allowed to output any content other than what is in the image.

—role—
Image Text Extraction Specialist

—goal—
* For the given image, please directly output the text in the image.

* For any formulas, you must enclose them with dollar signs.
* 
—constrain—
* You are not allowed to output any content other than what is in the image.

—example—
$\\phi_{n} = \\frac{f_{0}^{2}h_{n}}{gH\\left(K^{2} - K_{s}^{2} - irK^{2}/k\\bar{u}\\right)}$
`


    MNUtil.showHUD("Reset prompt")
    literatureConfig.config.userPrompt = self.promptInput.text
    literatureConfig.save()
  },
  saveAction: async function (params) {
  try {
    

    let text = await self.getWebviewContent()
    // MNUtil.copy(text)
    if (MNUtil.isValidJSON(text)) {
      let action = JSON.parse(text)
      literatureConfig.config.action = action
      literatureConfig.save()
      MNUtil.showHUD("Save action")
    }else{
      MNUtil.showHUD("Invalid JSON")
    }
  } catch (error) {
    MNUtil.showHUD(error)
  }
  },
  pasteApikey: async function (params) {
    let apikey = literatureUtils.clipboardText().trim()
    self.apikeyInput.text = apikey
    switch (literatureConfig.getConfig("source")) {
      case "Doc2X":
      case "Doc2XPDF":
        literatureConfig.config.doc2xApikey = apikey
        MNUtil.showHUD("Save Doc2X API key")
        break;
      case "SimpleTex":
        literatureConfig.config.simpleTexApikey = apikey
        MNUtil.showHUD("Save SimpleTex API key")
        break;
      case "GPT-4o":
        literatureConfig.config.openaiApikey = apikey
        break;
      default:
        break;
    }
    literatureConfig.save()
  },
  clearApikey:function (params) {
    self.apikeyInput.text = ""
    switch (literatureConfig.getConfig("source")) {
      case "Doc2X":
      case "Doc2XPDF":
        literatureConfig.config.doc2xApikey = ""
        break;
      case "SimpleTex":
        literatureConfig.config.simpleTexApikey = ""
        break;
      default:
        break;
    }
    literatureConfig.save()
  },
  refresh: async function () {
    literatureNetwork.accessToken = await literatureNetwork.refreshAccessToken(literatureConfig.getConfig("doc2xApikey").trim())
  },
  togglePDFTranslate: function (params) {
    literatureUtils.pdfTranslate = !literatureUtils.pdfTranslate
    MNUtil.showHUD("Unavailable!")
    MNButton.setColor(self.PDFTranslateButton, literatureUtils.pdfTranslate?"#e06c75":"#c0bfbf",0.8)
  },
  clearPDFBuffer: function (params) {
    let docMd5 = MNUtil.currentDocController.document.docMd5
    if (literatureConfig.fileIds[docMd5]) {
      literatureConfig.fileIds[docMd5] = undefined
      MNUtil.showHUD("Clear buffer")
    }
  },
  clearBuffer: function (params) {
    literatureNetwork.LiteratureBuffer = {}
    // let foucsNote = literatureUtils.getFocusNote()
    // // let imageData = MNUtil.getImageForLiterature()
    // let imageData = MNUtil.getDocImage(true,true)
    // if (!imageData) {
    //   if (foucsNote) {
    //     imageData = MNUtil.getImageFromNote(foucsNote)
    //   }else{
    //     MNUtil.showHUD("No image found")
    //     return;
    //   }
    // }
    // if (!imageData) {
    //   MNUtil.showHUD("No image found")
    //   return
    // }
    // let config = JSON.parse(JSON.stringify(literatureConfig.config))
    // let strForMD5 = JSON.stringify(config)+imageData.base64Encoding()
    // let MD5 = MNUtil.MD5(strForMD5)
    // if (MD5 in literatureNetwork.LiteratureBuffer) {
    //   MNUtil.showHUD("Clear buffer")
    //   delete literatureNetwork.LiteratureBuffer[MD5]
    // }
  },
  toggleIC: function (params) {
    let imageCorrection = !literatureConfig.getConfig("imageCorrection")
    literatureConfig.config.imageCorrection = imageCorrection
    self.imageCorrectionButton.setTitleForState("Image Correction: "+(imageCorrection?"✅":"❌"),0)
    self.imageCorrectionButton.backgroundColor = MNUtil.hexColorAlpha(imageCorrection?"#457bd3":"#9bb2d6",0.8)

    literatureConfig.save()
  },
  togglePE: function (sender) {
    switch (literatureConfig.config.source) {
      case "SimpleTex":
        if (self.view.popoverController) {self.view.popoverController.dismissPopoverAnimated(true);}
        let commandTable = [
          {title:'auto',object:self,selector:'changeRecModeTo:',param:"auto",checked:literatureConfig.getConfig("simpleTexRecMode") === "auto"},
          {title:'document',object:self,selector:'changeRecModeTo:',param:"document",checked:literatureConfig.getConfig("simpleTexRecMode") === "document"},
          {title:'formula',object:self,selector:'changeRecModeTo:',param:"formula",checked:literatureConfig.getConfig("simpleTexRecMode") === "formula"}
        ];
        self.view.popoverController = MNUtil.getPopoverAndPresent(sender,commandTable,200)
        // literatureConfig.config.simpleTexGeneral = !literatureConfig.getConfig("simpleTexGeneral")
        // self.equationButton.setTitleForState("Pure Equation: "+(literatureConfig.config.simpleTexGeneral?"❌":"✅"),0)
        // self.equationButton.backgroundColor = MNUtil.hexColorAlpha(literatureConfig.config.simpleTexGeneral?"#9bb2d6":"#457bd3",0.8)
        break;
      case "Doc2X":
        literatureConfig.config.pureEquation = !literatureConfig.getConfig("pureEquation")
        self.equationButton.setTitleForState("Pure Equation: "+(literatureConfig.config.pureEquation?"✅":"❌"),0)
        self.equationButton.backgroundColor = MNUtil.hexColorAlpha(literatureConfig.config.pureEquation?"#457bd3":"#9bb2d6",0.8)
        break;
      default:
        break;
    }
    literatureConfig.save()
  },
  changeRecModeTo: function (param) {
    if (self.view.popoverController) {self.view.popoverController.dismissPopoverAnimated(true);}
    literatureConfig.config.simpleTexRecMode = param
    self.equationButton.setTitleForState("Rec mode: "+param,0)
  },
  toggleRotation: function (params) {
    literatureConfig.config.simpleTexRotation = !literatureConfig.getConfig("simpleTexRotation")
    self.rotationButton.setTitleForState("Image Rotation: "+(literatureConfig.config.simpleTexRotation?"✅":"❌"),0)
    self.rotationButton.backgroundColor = MNUtil.hexColorAlpha(literatureConfig.config.simpleTexRotation?"#457bd3":"#9bb2d6",0.8)
    literatureConfig.save()
    // literatureConfig.config.simpleTexTurbo = !literatureConfig.getConfig("simpleTexTurbo")
    // self.rotationButton.setTitleForState("Turbo: "+(literatureConfig.config.simpleTexTurbo?"✅":"❌"),0)
    // self.rotationButton.backgroundColor = MNUtil.hexColorAlpha(literatureConfig.config.simpleTexTurbo?"#457bd3":"#9bb2d6",0.8)
    // literatureConfig.save()
  },
  beginLiteratureDev:async function (button) {
  // try {
    // let docSplitMode = MNUtil.studyController.docMapSplitMode
    // MNUtil.showHUD("message"+docSplitMode)
    // return
    let focusNotes = MNNote.getFocusNotes()
    // let A = MNNote.new("marginnote4app://note/80DC6151-CF24-43A1-B12C-A55F73565D31")
    // let B = MNNote.new("marginnote4app://note/24BDE208-4F64-46EC-813F-CBC2F9DCEE60")
    // let C = MNNote.new("marginnote4app://note/05171B3B-43FC-4091-8959-C3E9FC95E46C")
    // let D = MNNote.new("marginnote4app://note/CD76132F-9327-4BA3-AB1F-5B71E9CD16C9")
    // let E = MNNote.new("marginnote4app://note/B7B0D1CF-69A4-44F8-9D60-AAB0121F2B2A")
    // let F = MNNote.new("marginnote4app://note/0171456B-D931-447E-8E38-F560486DE651")
    // let G = MNNote.new("marginnote4app://note/0A12FAFE-2427-40AE-9EF2-D7A49290BF89")
    // let H = MNNote.new("marginnote4app://note/0F729619-F8A3-48FC-80A8-C3B4BAB1A4F9")
    // let I = MNNote.new("marginnote4app://note/F92CD347-F05A-401E-88A9-E0277BB20FDA")
    // let J = MNNote.new("marginnote4app://note/45DAF7A2-8B79-4645-AE34-743990FE4030")
    // let K = MNNote.new("marginnote4app://note/6DDAC9D1-04B5-4EE7-8CED-CB8E7FA41A19")
    // let L = MNNote.new("marginnote4app://note/3FC09001-CE88-492A-BB00-72DD730842B9")
    // let M = MNNote.new("marginnote4app://note/F4341F75-A1FC-454B-BE2F-B3ED41424896")
    // let N = MNNote.new("marginnote4app://note/8FA5E3F9-74D6-41DC-AADF-6C26DFFA66B6")
    // let O = MNNote.new("marginnote4app://note/F6F852E9-578D-41AF-9333-6D11CC5ACA01")
    // let P = MNNote.new("marginnote4app://note/435D0D84-A4A7-4F57-9DF8-B62FBB46C1DF")
    // let Q = MNNote.new("marginnote4app://note/A92D6D1D-7CB4-4FCE-801B-62DA2A8FBA32")
    // let R = MNNote.new("marginnote4app://note/06AB6A37-6948-4C19-94D2-82C85DE5FD62")
    // let S = MNNote.new("marginnote4app://note/E8780A53-E421-4224-BCE5-5CFF1B7C50BA")
    // let T = MNNote.new("marginnote4app://note/7FDF5054-B5B7-45AC-AD0D-A3816297A23B")

    for (let i = 0; i < focusNotes.length; i++) {
      const note = focusNotes[i];
      if (note.excerptText && note.excerptText.length > 20) {
        continue
      }
      let word = note.title.split(";")[0].trim()
      // if (!word || !word.trim()) {
      //   word = note.title
      // }
      // if (word.startsWith("a")) {
      //   A.addAsChildNote(note)
      // }
      // if (word.startsWith("b")) {
      //   B.addAsChildNote(note)
      // }
      // if (word.startsWith("c")) {
      //   C.addAsChildNote(note)
      // }
      // if (word.startsWith("d")) {
      //   D.addAsChildNote(note)
      // }
      // if (word.startsWith("e")) {
      //   E.addAsChildNote(note)
      // }
      // if (word.startsWith("f")) {
      //   F.addAsChildNote(note)
      // }
      // if (word.startsWith("g")) {
      //   G.addAsChildNote(note)
      // }
      // if (word.startsWith("h")) {
      //   H.addAsChildNote(note)
      // }
      // if (word.startsWith("i")) {
      //   I.addAsChildNote(note)
      // }
      // if (word.startsWith("j")) {
      //   J.addAsChildNote(note)
      // }
      // if (word.startsWith("k")) {
      //   K.addAsChildNote(note)
      // }
      // if (word.startsWith("l")) {
      //   L.addAsChildNote(note)
      // }
      // if (word.startsWith("m")) {
      //   M.addAsChildNote(note)
      // }
      // if (word.startsWith("n")) {
      //   N.addAsChildNote(note)
      // }
      // if (word.startsWith("o")) {
      //   O.addAsChildNote(note)
      // }
      // if (word.startsWith("p")) {
      //   P.addAsChildNote(note)
      // }
      // if (word.startsWith("q")) {
      //   Q.addAsChildNote(note)
      // }
      // if (word.startsWith("r")) {
      //   R.addAsChildNote(note)
      // }
      // if (word.startsWith("s")) {
      //   S.addAsChildNote(note)
      // }
      // if (word.startsWith("t")) {
      //   T.addAsChildNote(note)
      // }
      literatureNetwork.LiteratureDev(word).then((res)=>{
        literatureUtils.undoGrouping(()=>{
          note.excerptText = res
          note.excerptTextMarkdown = true
          MNUtil.showHUD("Set to excerpt")
          // note.appendMarkdownComment(res)
          // MNUtil.showHUD("Append to comment")
        })
      })
      await MNUtil.delay(2)
    }
  },
  beginLiterature:async function (button) {
  try {
    // let docSplitMode = MNUtil.studyController.docMapSplitMode
    // MNUtil.showHUD("message"+docSplitMode)
    let foucsNote = MNNote.getFocusNote()

    // let imageData = MNUtil.getImageForLiterature()
    let imageData = MNUtil.getDocImage(true,true)
    if (!imageData) {
      if (foucsNote) {
        imageData = MNUtil.getImageFromNote(foucsNote)
      }else{
        MNUtil.showHUD("No image found")
        return;
      }
    }
    if (!imageData) {
      MNUtil.showHUD("No image found")
      return
    }
    self.currentTime = Date.now()
    //直接传入压缩后的图片数据，减少计算md5时的耗时
    let compressedImageData = UIImage.imageWithData(imageData).jpegData(0.1)
    let res = await literatureNetwork.Literature(compressedImageData)
    MNUtil.delay(1).then(()=>{
      MNUtil.stopHUD()
    })
    let selection = MNUtil.currentSelection
    let actions2createNote = ["toChild","toExcerpt","toComment"]
    if (selection.onSelection && actions2createNote.includes(button.action)) {
      foucsNote = MNNote.fromSelection()
    }
    // MNUtil.copyJSON(res)
    if (res) {
      // MNUtil.showHUD("Time usage: "+(Date.now()-self.currentTime)+" ms")
      switch (button.action) {
        case "toOption":
          if (foucsNote) {
            let userSelect = await MNUtil.userSelect("Literature Result", res, ["Copy","Comment","Excerpt","Editor","ChildNote"])
            switch (userSelect) {
              case 0:
                return;
              case 1:
                MNUtil.copy(res)
                MNUtil.showHUD("✅ Save to clipboard")
                return;
              case 2:
                MNUtil.undoGrouping(()=>{
                  foucsNote.appendMarkdownComment(res)
                  MNUtil.showHUD("✅ Append to comment")
                })
                MNUtil.postNotification("LiteratureFinished", {action:"toComment",noteId:foucsNote.noteId,result:res})
                return;
              case 3:
                literatureUtils.undoGrouping(()=>{
                  // foucsNote.textFirst = true
                  foucsNote.excerptTextMarkdown = true
                  foucsNote.excerptText =  res
                  MNUtil.showHUD("✅ Set to excerpt")
                })
                MNUtil.postNotification("LiteratureFinished", {action:"toExcerpt",noteId:foucsNote.noteId,result:res})
                return;
              case 4:
                let beginFrame = self.view.frame
                let endFrame = MNUtil.genFrame(beginFrame.x, beginFrame.y, 450, 500)
                let studyFrame = MNUtil.studyView.bounds
                if ((beginFrame.x+beginFrame.width+450) < studyFrame.width) {
                  endFrame.x = beginFrame.x+beginFrame.width
                  MNUtil.postNotification("openInEditor", {content:res,beginFrame:beginFrame,endFrame:endFrame})
                  return
                }
                if ((beginFrame.x-450) > 0) {
                  endFrame.x = beginFrame.x-450
                  MNUtil.copyJSON({content:res,beginFrame:beginFrame,endFrame:endFrame})
                  MNUtil.postNotification("openInEditor", {content:res,beginFrame:beginFrame,endFrame:endFrame})
                  return
                }
                MNUtil.postNotification("openInEditor", {content:res})
                return;
              case 5:
                MNUtil.undoGrouping(()=>{
                  let child = foucsNote.createChildNote({excerptText:res,excerptTextMarkdown:true})
                  child.focusInMindMap(0.5)
                })
                MNUtil.showHUD("✅ Create child note")
                return;
              default:
                return;
            }
          }else{
            let userSelect = await MNUtil.userSelect("Literature Result", res, ["Copy","Editor","New Note"])
            switch (userSelect) {
              case 0:
                return;
              case 1:
                MNUtil.copy(res)
                MNUtil.showHUD("✅ Save to clipboard")
                return;
              case 2:
                let beginFrame = self.view.frame
                let endFrame = MNUtil.genFrame(beginFrame.x, beginFrame.y, 450, 500)
                let studyFrame = MNUtil.studyView.bounds
                if ((beginFrame.x+beginFrame.width+450) < studyFrame.width) {
                  endFrame.x = beginFrame.x+beginFrame.width
                  MNUtil.postNotification("openInEditor", {content:res,beginFrame:beginFrame,endFrame:endFrame})
                  return
                }
                if ((beginFrame.x-450) > 0) {
                  endFrame.x = beginFrame.x-450
                  MNUtil.copyJSON({content:res,beginFrame:beginFrame,endFrame:endFrame})
                  MNUtil.postNotification("openInEditor", {content:res,beginFrame:beginFrame,endFrame:endFrame})
                  return
                }
                MNUtil.postNotification("openInEditor", {content:res})
                return;
              case 3:
                MNUtil.undoGrouping(()=>{
                  let childmap = MNUtil.currentChildMap
                  if (childmap) {
                    let child = foucsNote.createChildNote({excerptText:res,excerptTextMarkdown:true})
                    child.focusInMindMap(0.5)
                  }else{
                    let child = MNNote.new({excerptText:res,excerptTextMarkdown:true})
                    child.focusInMindMap(0.5)
                  }
                })
                MNUtil.showHUD("✅ Create child note")
                return;
              default:
                return;
            }
          }
        case "toComment":
          if (foucsNote) {
            MNUtil.undoGrouping(()=>{
              foucsNote.appendMarkdownComment(res)
              MNUtil.waitHUD("✅ Append to comment")
            })
            MNUtil.postNotification("LiteratureFinished", {action:"toComment",noteId:foucsNote.noteId,result:res})
          }else{
            MNUtil.copy(res)
          }
          break;
        case "copy":
          MNUtil.copy(res)
          MNUtil.waitHUD("✅ Save to clipboard")
          break;
        case "toEditor":
          let beginFrame = self.view.frame
          let endFrame = MNUtil.genFrame(beginFrame.x, beginFrame.y, 450, 500)
          let studyFrame = MNUtil.studyView.bounds
          if ((beginFrame.x+beginFrame.width+450) < studyFrame.width) {
            endFrame.x = beginFrame.x+beginFrame.width
            MNUtil.postNotification("openInEditor", {content:res,beginFrame:beginFrame,endFrame:endFrame})
            return
          }
          if ((beginFrame.x-450) > 0) {
            endFrame.x = beginFrame.x-450
            MNUtil.copyJSON({content:res,beginFrame:beginFrame,endFrame:endFrame})
            MNUtil.postNotification("openInEditor", {content:res,beginFrame:beginFrame,endFrame:endFrame})
            return
          }
          MNUtil.postNotification("openInEditor", {content:res})
          break;
        case "toChild":
          if (foucsNote) {
            MNUtil.undoGrouping(()=>{
              let child = foucsNote.createChildNote({excerptText:res,excerptTextMarkdown:true})
              child.focusInMindMap(0.5)
            })
            MNUtil.waitHUD("✅ Create child note")
          }
          break;
        case "toExcerpt":
          if (foucsNote) {
            literatureUtils.undoGrouping(()=>{
              // foucsNote.textFirst = true
              foucsNote.excerptTextMarkdown = true
              foucsNote.excerptText =  res
              MNUtil.waitHUD("✅ Set to excerpt")
            })
            MNUtil.postNotification("LiteratureFinished", {action:"toExcerpt",noteId:foucsNote.noteId,result:res})
          }else{
            MNUtil.copy(res)
          }
          break;
        case "toTitle":
          if (foucsNote) {
            MNUtil.undoGrouping(()=>{
              foucsNote.noteTitle = res
              MNUtil.waitHUD("✅ Set to title")
            })
            MNUtil.postNotification("LiteratureFinished", {action:"toTitle",noteId:foucsNote.noteId,result:res})
          }else{
            MNUtil.showHUD("Please select a note first")
          }
          break;
        default:
          break;
      }

    }
      
    } catch (error) {
      MNUtil.showHUD(error)
      MNUtil.copy(error)
    }
  },
  beginPDFLiterature:async function (button) {
  try {
    let res = await literatureNetwork.PDFLiterature()
    if (!res) {
      return
    }
    try {
      MNUtil.stopHUD()
    } catch (error) {
      
    }
    let mds
    // MNUtil.copyJSON(res)
    // MNUtil.copy(button.action)
    switch (button.action) {
      case "copy":
        mds = res.pages.map(page=>page.md)
        MNUtil.copy(mds.join(""))
        MNUtil.showHUD("Save to clipboard")
        return
      case "file":
        MNUtil.writeJSON(MNUtil.dbFolder+"/"+literatureUtils.docMd5+".json", res)
        MNUtil.showHUD("Flie saved to folder: "+MNUtil.dbFolder)
        MNUtil.copy(MNUtil.dbFolder)
        return;
      case "export":
        let docPath = MNUtil.cacheFolder+"/"+MNUtil.getFileName(MNUtil.getDocById(literatureUtils.docMd5).fullPathFileName)+".md"
        MNUtil.writeText(docPath, res.pages.map(d=>d.md).join(""))
        let UTI = ["public.md"]
        MNUtil.saveFile(docPath, UTI)
        return
      case "toEditor":
        // let fileURL = MNUtil.dbFolder+"/"+literatureUtils.docMd5+".md"
        // if (!MNUtil.isfileExists(fileURL)) {
        //   MNUtil.writeText(fileURL, res.pages.map(d=>d.md).join(""))
        // }
        MNUtil.writeJSON(MNUtil.dbFolder+"/"+literatureUtils.docMd5+".json", res)
        mds = res.pages.map(page=>page.md)
        let beginFrame = self.view.frame
        let endFrame = MNUtil.genFrame(beginFrame.x, beginFrame.y, 450, 500)
        let studyFrame = MNUtil.studyView.bounds
        if ((beginFrame.x+beginFrame.width+450) < studyFrame.width) {
          endFrame.x = beginFrame.x+beginFrame.width
          MNUtil.postNotification("openInEditor", {content:mds.join(""),beginFrame:beginFrame,endFrame:endFrame})
          return
        }
        if ((beginFrame.x-450) > 0) {
          endFrame.x = beginFrame.x-450
          MNUtil.postNotification("openInEditor", {content:mds.join(""),beginFrame:beginFrame,endFrame:endFrame})
          return
        }
        MNUtil.postNotification("openInEditor", {content:mds.join("")})
        break;
      default:
        break;
    }
    } catch (error) {
      MNUtil.showHUD(error)
      literatureUtils.copy(error)
    }
  },
  connectionDidReceiveResponse: async function (connection,response) {
    self.textStirng = ""
  },
  /**
   * 
   * @param {NSURLConnection} connection 
   * @param {NSData} data 
   */
  connectionDidReceiveData: async function (connection,data) {
  // try {
  //   // let text =  NSString.initWithDataEncoding(data, 4)
  //   // MNUtil.copy(data.base64Encoding)
  //   let test = CryptoJS.enc.Base64.parse(data.base64Encoding())
  //   let textString = CryptoJS.enc.Utf8.stringify(test);
  //   self.textStirng = self.textStirng+textString
  //   let res = self.textStirng.split("data:").slice(1).map(r=>{
  //     return JSON.parse(r)
  //   })
  //   // MNUtil.copyJSON(self.textStirng)

  //   self.res = res.at(-1).data
  //   self.fileId = res.at(-1).uuid
  //   // self.res = literatureNetwork.parseDoc2XRespnse(data)
  //   // MNUtil.copyJSON(self.res)
  //   if (self.res.msg) {
  //     MNUtil.showHUD(self.res.progress+"%|"+self.res.msg)
  //   }
  //   // literatureUtils.copyJSON(self.res)
  // } catch (error) {
  //   MNUtil.showHUD(error)
  //   MNUtil.copyJSON(error)
  // }

    // let test = CryptoJS.enc.Base64.parse(data.base64Encoding())
    // self.textString = CryptoJS.enc.Utf8.stringify(test);
    // let res = JSON.parse(self.textString.split("data:")[1])
  },
  connectionDidFinishLoading: function (connection) {
    // try {
    // if (literatureConfig.getConfig("source") === "Doc2XPDF") {
    //   literatureConfig.saveFileId(self.docMd5, self.fileId)
    //   if (self.export) {
    //     let docPath = MNUtil.cacheFolder+"/"+MNUtil.getFileName(MNUtil.getDocById(self.docMd5).fullPathFileName)+".md"
    //     MNUtil.writeText(docPath, self.res.pages.map(d=>d.md).join(""))
    //     let UTI = ["public.md"]
    //     MNUtil.saveFile(docPath, UTI)
    //     return
    //   }
    //   if (self.file) {
    //     MNUtil.writeJSON(MNUtil.dbFolder+"/"+self.docMd5+".json", self.res)
    //     MNUtil.showHUD("文件已保存到"+MNUtil.dbFolder)
    //     return
    //   }
    //   // MNUtil.copyJSON(self.res.pages)
    //   if (self.copy) {
    //     let mds = self.res.pages.map(page=>page.md)
    //     MNUtil.copy(mds.join(""))
    //     MNUtil.showHUD("Save to clipboard")
    //     return
    //   }
    //   return
    // }
    // let foucsNote = literatureUtils.getFocusNote()
    // // let regexp = new RegExp("(\[\\)|(\\\])", "g")
    // // MNUtil.copyJSON(self.res)
    // let md = self.res.pages[0].md
    // MNUtil.showHUD("Time usage: "+(Date.now()-self.currentTime)+" ms")
    // if (self.copy) {
    //   literatureUtils.copy(md)
    //   MNUtil.showHUD("Save to clipboard")
    //   return
    // }
    // let convertText = md
    // .replace(/(\\\[\s?)|(\s?\\\])/g, '$$') // Replace display math mode delimiters
    // .replace(/(\\\(\s?)|(\s?\\\))/g, '$') // Replace inline math mode opening delimiter
    // if (self.toExcerpt && foucsNote) {
    //   literatureUtils.undoGrouping(()=>{
    //     foucsNote.excerptText =  convertText
    //   })
    //   return
    // }
    // if (foucsNote) {
    //   literatureUtils.undoGrouping(()=>{
    //     foucsNote.appendMarkdownComment(convertText)
    //   })
    // }
    // } catch (error) {
    //   MNUtil.showHUD(error)
    //   literatureUtils.copyJSON(self.res)
    // }
  },
  connectionDidFailWithError: function (connection,error) {
    MNUtil.showHUD("network error")
  },
  /**
   * 关闭按钮的响应方法
   * 
   * 处理逻辑：
   * 1. 如果有 addonBar 引用，传入其 frame 作为动画终点
   * 2. 否则使用默认隐藏动画
   */
  closeButtonTapped: function() {
    if (self.addonBar) {
      // 传入插件栏的位置，让面板动画收缩到插件栏位置
      self.hide(self.addonBar.frame)
    } else {
      self.hide()
    }
  },
  settingButtonTapped: function (params) {
    self.settingButton.open = !self.settingButton.open
    if (self.settingButton.open) {
      MNButton.setColor(self.settingButton, "#457bd3")
      self.settingView.hidden = false
      self.literatureView.hidden = true
    }else{
      MNButton.setColor(self.settingButton, "#89a6d5")
      self.settingView.hidden = true
      self.literatureView.hidden = false
    }
  },
  /**
   * 处理拖动手势
   * 
   * 这个方法实现了通过拖动关闭按钮来移动整个面板的功能
   * 
   * 技术要点：
   * 1. gesture.state === 1 表示手势刚开始（UIGestureRecognizerStateBegan）
   * 2. 需要计算手指在视图中的相对位置，以保持拖动时的偏移正确
   * 3. 限制面板在屏幕范围内移动
   * 
   * @param {UIPanGestureRecognizer} gesture - 拖动手势识别器
   */
  onMoveGesture:function (gesture) {
    // 获取手指在 studyView 中的位置
    let locationToMN = gesture.locationInView(MNUtil.studyView)
    
    // 节流处理：避免过于频繁的更新
    if ( (Date.now() - self.moveDate) > 100) {
      // 获取手势的位移量
      let translation = gesture.translationInView(MNUtil.studyView)
      // 获取手指在面板视图中的位置
      let locationToBrowser = gesture.locationInView(self.view)
      
      // 手势开始时，记录手指在视图中的初始偏移
      if (gesture.state === 1 ) {
        // 计算并保存手指相对于视图的偏移量
        gesture.locationToBrowser = {
          x:locationToBrowser.x-translation.x,
          y:locationToBrowser.y-translation.y
        }
      }
    }
    self.moveDate = Date.now()
    
    // 计算面板应该移动到的新位置
    // 新位置 = 手指位置 - 手指在视图中的偏移
    let location = {
      x:locationToMN.x - gesture.locationToBrowser.x,
      y:locationToMN.y -gesture.locationToBrowser.y
    }
    
    let frame = self.view.frame
    var viewFrame = self.view.bounds;
    let studyFrame = MNUtil.studyView.bounds
    
    // 限制垂直移动范围，确保面板不会移出屏幕
    let y = location.y
    if (y<=0) {
      y = 0  // 不能超出顶部
    }
    if (y>=studyFrame.height-15) {
      y = studyFrame.height-15  // 底部至少保留15像素可见
    }
    
    let x = location.x  // 水平方向暂不限制
    
    // 更新面板位置
    literatureUtils.setFrame(self, {x:x,y:y,width:frame.width,height:frame.height})
  }
});
literatureController.prototype.setButtonLayout = function (button,targetAction) {
    button.autoresizingMask = (1 << 0 | 1 << 3);
    button.setTitleColorForState(UIColor.whiteColor(),0);
    button.setTitleColorForState(this.highlightColor, 1);
    button.backgroundColor = UIColor.colorWithHexString("#9bb2d6").colorWithAlphaComponent(0.8);
    button.layer.cornerRadius = 10;
    button.layer.masksToBounds = true;
    if (targetAction) {
      button.addTargetActionForControlEvents(this, targetAction, 1 << 6);
    }
    this.view.addSubview(button);
}
/**
 * 显示面板（带动画效果）
 * 
 * 动画流程：
 * 1. 记录目标位置和当前透明度
 * 2. 设置初始状态（半透明、起始位置）
 * 3. 执行动画（淡入 + 位置移动）
 * 4. 动画完成后恢复正常状态
 * 
 * @param {Object} frame - 动画的起始位置（通常是插件栏的位置）
 * @this {literatureController}
 */
literatureController.prototype.show = function (frame) {
  // 保存目标位置（面板的正常显示位置）
  let preFrame = this.view.frame
  preFrame.width = 260  // 确保宽度正确
  
  // 保存当前透明度，并设置初始透明度为 0.2（半透明）
  let preOpacity = this.view.layer.opacity
  this.view.layer.opacity = 0.2
  
  // 如果传入了起始位置，先将视图移动到该位置
  if (frame) {
    this.view.frame = frame
    this.currentFrame = frame
  }
  
  // 设置初始状态
  this.view.hidden = false              // 显示主视图
  this.setAllButton(true)               // 隐藏所有按钮（动画期间）
  this.literatureView.hidden = true     // 隐藏子视图
  this.settingView.hidden = true
  
  // 将视图移动到最前面
  MNUtil.studyView.bringSubviewToFront(this.view)
  
  // 执行 iOS 动画
  UIView.animateWithDurationAnimationsCompletion(
    0.2,  // 动画时长 0.2 秒
    ()=>{
      // 动画块：这里的变化会以动画形式呈现
      this.view.layer.opacity = preOpacity  // 恢复透明度
      this.view.frame = preFrame             // 移动到目标位置
      this.currentFrame = preFrame
    },
    ()=>{
      // 动画完成回调
      this.view.layer.borderWidth = 0
      this.setAllButton(false)                // 显示所有按钮
      this.literatureView.hidden = false      // 显示主功能视图
      this.settingView.hidden = true          // 确保设置视图隐藏
      MNButton.setColor(this.settingButton, "#89a6d5")  // 重置设置按钮颜色
      this.settingButton.open = false         // 重置设置按钮状态
      this.refreshView(literatureConfig.config.source)  // 刷新视图内容
    }
  )
}
literatureController.prototype.setAllButton = function (hidden) {
  // this.moveButton.hidden = hidden
  this.closeButton.hidden = hidden
  // this.settingButton.hidden = hidden
  
}
/**
 * 隐藏面板（带动画效果）
 * 
 * 动画流程（与 show 相反）：
 * 1. 记录当前位置和透明度
 * 2. 隐藏所有子视图
 * 3. 执行动画（淡出 + 位置移动）
 * 4. 动画完成后完全隐藏视图
 * 
 * @param {Object} frame - 动画的终点位置（通常是插件栏的位置）
 */
literatureController.prototype.hide = function (frame) {
  // 保存当前位置（用于下次显示时恢复）
  let preFrame = this.view.frame
  preFrame.width = 260
  this.view.frame = preFrame
  
  // 标记动画状态
  this.onAnimate = true
  
  // 保存当前透明度
  let preOpacity = this.view.layer.opacity
  // Application.sharedInstance().showHUD(JSON.stringify(frame),this.view.window,2)
  
  // 隐藏所有子视图（动画前）
  this.setAllButton(true)        // 隐藏所有按钮
  this.literatureView.hidden = true
  this.settingView.hidden = true
  
  // 执行 iOS 动画
  UIView.animateWithDurationAnimationsCompletion(
    .25,  // 动画时长 0.25 秒
    ()=>{
      // 动画块
      this.view.layer.opacity = 0.2  // 淡出到半透明
      if (frame) {
        // 如果指定了终点位置，移动到该位置
        this.view.frame = frame
        this.currentFrame = frame
      }
    },
    ()=>{
      // 动画完成回调
      this.onAnimate = false
      this.view.hidden = true;           // 完全隐藏视图
      this.view.layer.opacity = preOpacity  // 恢复透明度（为下次显示准备）
      this.view.frame = preFrame         // 恢复位置
      this.currentFrame = preFrame
    }
  )
}

/**
 * @this {literatureController}
 * @returns {UITextView}
 */
literatureController.prototype.creatTextView = function (superview="view",color="#c0bfbf",alpha=0.9) {
  /** @type {UITextView} */
  let view = UITextView.new()
  view.font = UIFont.systemFontOfSize(15);
  view.layer.cornerRadius = 8
  view.backgroundColor = MNUtil.hexColorAlpha(color,alpha)
  view.textColor = UIColor.blackColor()
  view.delegate = this
  view.bounces = true
  this[superview].addSubview(view)
  return view
}
/**
 * @this {literatureController}
 */
literatureController.prototype.refreshView = function (source){
  if (!literatureNetwork.isActivated() && (source === "GPT-4o" || source === "GPT-4o-mini")) {
    source = "Doc2X"
    literatureConfig.config.source = source
    literatureConfig.save()
  }
  let aiMode = false
  switch (source) {
    case "Doc2X":
      this.moveButton.setTitleForState("Doc2X Image")
      this.apikeyInput.text = literatureConfig.getConfig("doc2xApikey")
      this.apikeyInput.hidden = false
      this.pasteKeyButton.hidden = false
      this.imageCorrectionButton.hidden = false
      this.imageCorrectionButton.setTitleForState("Image Correction: "+(literatureConfig.getConfig("imageCorrection")?"✅":"❌"),0)
      this.imageCorrectionButton.backgroundColor = MNUtil.hexColorAlpha(literatureConfig.getConfig("imageCorrection")?"#457bd3":"#9bb2d6",0.8)
      this.equationButton.hidden = false
      this.equationButton.setTitleForState("Pure Equation: "+(literatureConfig.getConfig("pureEquation")?"✅":"❌"),0)
      this.equationButton.backgroundColor = MNUtil.hexColorAlpha(literatureConfig.getConfig("pureEquation")?"#457bd3":"#9bb2d6",0.8)
      this.PDFLiteratureClearButton.hidden = true
      this.LiteratureClearButton.hidden = false
      this.rotationButton.hidden = true
      this.PDFLiteratureExportButton.hidden = true
      this.PDFLiteratureFileButton.hidden = true
      this.PDFLiteratureCopyButton.hidden = true
      this.LiteratureCommentButton.hidden = false
      this.LiteratureOptionButton.hidden = false
      this.LiteratureExcerptButton.hidden = false
      this.LiteratureCopyButton.hidden = false
      this.LiteratureChildButton.hidden = false
      this.LiteratureEditorButton.hidden = false
      this.LiteratureTitleButton.hidden = false
      this.PDFLiteratureEditorButton.hidden = true
      this.PDFTranslateButton.hidden = true
      this.clearButton.hidden = false
      this.promptInput.hidden = true
      this.webviewInput.hidden = false
      this.savePromptButton.hidden = true
      this.resetPromptButton.hidden = true
      this.saveActionButton.hidden = false
      break;
    case "Doc2XPDF":
      this.moveButton.setTitleForState("Doc2X PDF")
      this.apikeyInput.text = literatureConfig.getConfig("doc2xApikey")
      this.imageCorrectionButton.hidden = true
      this.equationButton.hidden = true
      this.PDFLiteratureClearButton.hidden = false
      this.PDFLiteratureExportButton.hidden = false
      this.PDFLiteratureFileButton.hidden = false
      this.PDFLiteratureCopyButton.hidden = false
      this.LiteratureCopyButton.hidden = true
      this.LiteratureClearButton.hidden = true
      this.rotationButton.hidden = true
      this.LiteratureCommentButton.hidden = true
      this.LiteratureOptionButton.hidden = true
      this.LiteratureExcerptButton.hidden = true
      this.LiteratureChildButton.hidden = true
      this.LiteratureEditorButton.hidden = true
      this.LiteratureTitleButton.hidden = true
      this.PDFLiteratureEditorButton.hidden = false
      this.PDFTranslateButton.hidden = true
      this.apikeyInput.hidden = false
      this.pasteKeyButton.hidden = false
      this.clearButton.hidden = false
      this.promptInput.hidden = true
      this.webviewInput.hidden = true
      this.savePromptButton.hidden = true
      this.resetPromptButton.hidden = true
      this.saveActionButton.hidden = true
      break;
    case "SimpleTex":
      this.moveButton.setTitleForState("SimpleTex Image")
      this.apikeyInput.text = literatureConfig.getConfig("simpleTexApikey")
      this.rotationButton.hidden = false
      this.rotationButton.setTitleForState("Image Ratation: "+(literatureConfig.getConfig("simpleTexRotation")?"✅":"❌"),0)
      this.rotationButton.backgroundColor = MNUtil.hexColorAlpha(literatureConfig.getConfig("simpleTexRotation")?"#457bd3":"#9bb2d6",0.8)
      this.imageCorrectionButton.hidden = true
      this.PDFLiteratureClearButton.hidden = true
      this.equationButton.hidden = false
      this.equationButton.setTitleForState("Rec mode: "+literatureConfig.getConfig("simpleTexRecMode"),0)
      this.equationButton.backgroundColor = MNUtil.hexColorAlpha(literatureConfig.getConfig("simpleTexGeneral")?"#9bb2d6":"#457bd3",0.8)
      this.LiteratureChildButton.hidden = false
      this.LiteratureEditorButton.hidden = false
      this.LiteratureTitleButton.hidden = false
      this.LiteratureClearButton.hidden = false
      this.PDFLiteratureEditorButton.hidden = true
      this.PDFTranslateButton.hidden = true
      this.PDFLiteratureExportButton.hidden = true
      this.PDFLiteratureFileButton.hidden = true
      this.PDFLiteratureCopyButton.hidden = true
      this.LiteratureCommentButton.hidden = false
      this.LiteratureOptionButton.hidden = false
      this.LiteratureCopyButton.hidden = false
      this.LiteratureExcerptButton.hidden = false
      this.apikeyInput.hidden = false
      this.pasteKeyButton.hidden = false
      this.clearButton.hidden = false
      this.promptInput.hidden = true
      this.webviewInput.hidden = false
      this.savePromptButton.hidden = true
      this.resetPromptButton.hidden = true
      this.saveActionButton.hidden = false
      break;
    case "abab6.5s-chat":
    case "MiniMax-Text-01":
    case "Moonshot-v1":
    case "claude-3-5-sonnet-20241022":
    case "claude-opus-4":
    case "claude-sonnet-4":
    case "claude-3-7-sonnet":
    case "claude-3-5-haiku-20241022":
    case "claude-3-5-haiku":
    case "gemini-2.0-flash":
    case "gemini-2.5-flash":
    case "gemini-2.0-flash-lite":
    case "gemini-2.5-flash-lite":
    case "gemini-2.0-flash-exp":
    case "gemini-2.0-pro":
    case "gemini-2.5-pro":
    case "glm-4v-plus":
    case "glm-4v-flash":
    case "glm-4.1v-thinking-flashx":
    case "glm-4.1v-thinking-flash":
    case "glm-4.5v":
    case "glm-4.5v-nothinking":
    case "GPT-4o":
    case "GPT-4o-mini":
    case "GPT-4.1":
    case "GPT-4.1-mini":
    case "GPT-4.1-nano":
    case "GPT-5":
    case "GPT-5-mini":
    case "GPT-5-nano":
    case "doubao-seed-1-6":
    case "doubao-seed-1-6-nothinking":
    case "doubao-seed-1.6-flash":
    case "doubao-seed-1.6-flash-nothinking":
      aiMode = true
      this.moveButton.setTitleForState(literatureConfig.modelSource(source).title)
      break;
    default:
      break;
  }
  if (aiMode) {
      this.rotationButton.hidden = true
      this.imageCorrectionButton.hidden = true
      this.PDFLiteratureClearButton.hidden = true
      this.equationButton.hidden = true
      this.LiteratureClearButton.hidden = false
      this.LiteratureChildButton.hidden = false
      this.LiteratureEditorButton.hidden = false
      this.LiteratureTitleButton.hidden = false
      this.PDFLiteratureEditorButton.hidden = true
      this.PDFTranslateButton.hidden = true
      this.PDFLiteratureExportButton.hidden = true
      this.PDFLiteratureFileButton.hidden = true
      this.PDFLiteratureCopyButton.hidden = true
      this.LiteratureCommentButton.hidden = false
      this.LiteratureOptionButton.hidden = false
      this.LiteratureCopyButton.hidden = false
      this.LiteratureExcerptButton.hidden = false
      this.apikeyInput.hidden = true
      this.pasteKeyButton.hidden = true
      this.clearButton.hidden = true
      this.promptInput.hidden = false
      this.webviewInput.hidden = true
      this.savePromptButton.hidden = false
      this.resetPromptButton.hidden = false
      this.saveActionButton.hidden = true
  }
}

literatureController.prototype.createView = function (superview="view",color="#9bb2d6",alpha=0.8) {
  let view = UIView.new()
  view.backgroundColor = MNUtil.hexColorAlpha(color,alpha)
  view.layer.cornerRadius = 12
  this[superview].addSubview(view)
  return view
}

/**
 * 创建按钮的通用方法
 * 
 * @param {string} targetAction - 按钮点击时调用的方法名（如 "closeButtonTapped:"）
 * @param {string} superview - 父视图名称，不传则添加到主视图
 * @returns {UIButton} 创建的按钮对象
 */
literatureController.prototype.createButton = function (targetAction,superview) {
    // 创建按钮（type=0 表示自定义按钮）
    let button = UIButton.buttonWithType(0);
    
    // 设置自动布局掩码（灵活左边距 + 灵活高度）
    button.autoresizingMask = (1 << 0 | 1 << 3);
    
    // 设置按钮文字颜色
    button.setTitleColorForState(UIColor.whiteColor(),0);  // 正常状态：白色
    button.setTitleColorForState(this.highlightColor, 1);  // 高亮状态：自定义颜色
    
    // 设置按钮外观
    button.backgroundColor = MNUtil.hexColorAlpha("#9bb2d6",0.8)  // 蓝灰色背景
    button.layer.cornerRadius = 8;        // 圆角
    button.layer.masksToBounds = true;    // 裁剪超出圆角的内容
    button.titleLabel.font = UIFont.systemFontOfSize(16);  // 字体大小

    // 绑定点击事件
    if (targetAction) {
      // 1 << 6 = 64 = UIControlEventTouchUpInside（手指在按钮内部抬起）
      button.addTargetActionForControlEvents(this, targetAction, 1 << 6);
    }
    
    // 添加到父视图
    if (superview) {
      this[superview].addSubview(button)  // 添加到指定的子视图
    }else{
      this.view.addSubview(button);       // 添加到主视图
    }
    return button
}

/**
 * @this {literatureController}
 */
literatureController.prototype.createWebviewInput = function (superView,content) {
  try {
    
  this.webviewInput = new UIWebView(this.view.bounds);
  this.webviewInput.backgroundColor = MNUtil.hexColorAlpha("#c0bfbf",0.8)
  this.webviewInput.scalesPageToFit = false;
  this.webviewInput.autoresizingMask = (1 << 1 | 1 << 4);
  this.webviewInput.delegate = this;
  // this.webviewInput.setValueForKey("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1.1 Safari/605.1.15","User-Agent")
  this.webviewInput.scrollView.delegate = this;
  this.webviewInput.layer.cornerRadius = 8;
  this.webviewInput.layer.masksToBounds = true;
  this.webviewInput.layer.borderColor = MNUtil.hexColorAlpha("#9bb2d6",0.8);
  this.webviewInput.layer.borderWidth = 0
  this.webviewInput.layer.opacity = 0.9
  // this.webviewInput.loadFileURLAllowingReadAccessToURL(
  //   NSURL.fileURLWithPath(this.mainPath + '/test.html'),
  //   NSURL.fileURLWithPath(this.mainPath + '/')
  // );
  this.webviewInput.loadHTMLStringBaseURL(literatureUtils.html(content))
    } catch (error) {
    MNUtil.showHUD(error)
  }
  if (superView) {
    this[superView].addSubview(this.webviewInput)
  }
}
literatureController.prototype.createButton = function (config) {
  let button = UIButton.buttonWithType(0);
  button.autoresizingMask = (1 << 0 | 1 << 3);
  button.setTitleColorForState(this.highlightColor, 1);
  if ("fontColor" in config) {
    button.setTitleColorForState(MNUtil.hexColorAlpha(config.fontColor),0);
  }else{
    button.setTitleColorForState(UIColor.whiteColor(),0);
  }
  if ("targetAction" in config) {
    button.addTargetActionForControlEvents(this, config.targetAction, 1 << 6);
  }
  if ("superView" in config) {
    this[config.superView].addSubview(button)
  } else {
    this.view.addSubview(button);
  }
  if ("color" in config) {
    
  }
  MNButton.setConfig(button, config)
    button.backgroundColor = MNUtil.hexColorAlpha("#9bb2d6",0.8)
    button.layer.cornerRadius = 8;
    button.layer.masksToBounds = true;
    button.titleLabel.font = UIFont.systemFontOfSize(16);
    return button
}

/**
 * @this {literatureController}
 */
literatureController.prototype.setWebviewContent = function (content) {
  // toolbarUtils.copy(content)
  this.webviewInput.loadHTMLStringBaseURL(literatureUtils.html(content))
}
/**
 * @this {literatureController}
 */
literatureController.prototype.getWebviewContent = async function () {
  let content = await this.runJavaScript(`updateContent(); document.body.innerText`)
  this.webviewInput.endEditing(true)
  return content
}
/** @this {literatureController} */
literatureController.prototype.runJavaScript = async function(script) {
  // if(!this.webviewResponse || !this.webviewResponse.window)return;
  return new Promise((resolve, reject) => {
      this.webviewInput.evaluateJavaScript(script,(result) => {resolve(result)});
  })
};

/**
 * 
 * @param {string} title 
 * @param {string} selector 
 * @param {any} param 
 * @param {boolean|undefined} checked 
 * @this {literatureController}
 * @returns 
 */
literatureController.prototype.tableItem = function (title,selector,param = "",checked = false) {
  return {title:title,object:this,selector:selector,param:param,checked:checked}
}
/**
 * 
 * @this {literatureController}
 */
literatureController.prototype.checkPopover = function () {
  if (this.popoverController) {this.popoverController.dismissPopoverAnimated(true);}
}

/**
 * 测试网页交互
 */
literatureController.prototype.sendTitleToWeb = function(title) {
  // 编码（防止特殊字符破坏）
  const encoded = encodeURIComponent(title)
  
  // 向网页"喊话"
  this.webview.runJavaScript(
    `receiveTitle('${encoded}')`  // 调用网页的函数
  )
}