# MNAI (MNChatGLM) 插件深度分析

> 本文档是 MarginNote AI 聊天插件（MNChatGLM）的深度技术分析，详细记录其架构设计、实现细节和核心功能。

## 目录

1. [插件概述](#插件概述)
2. [文件结构](#文件结构)
3. [核心架构设计](#核心架构设计)
4. [多控制器协作机制](#多控制器协作机制)
5. [AI 集成实现](#ai-集成实现)
6. [WebView 交互系统](#webview-交互系统)
7. [关键功能实现](#关键功能实现)
8. [设计模式与最佳实践](#设计模式与最佳实践)

---

## 插件概述

### 定位
MNAI 是 MarginNote 的 AI 增强插件，通过集成多种 AI 模型（ChatGPT、ChatGLM、文心一言等），为用户提供智能化的笔记处理、内容生成和知识管理功能。

### 核心特性
- **多模型支持**：支持 10+ 种 AI 模型切换
- **多界面模式**：聊天窗口、悬浮球、通知栏、侧边栏
- **智能交互**：支持文本、图片、音频多模态输入
- **深度集成**：与 MarginNote 笔记系统无缝集成

### 技术栈
- **前端**：HTML5 + CSS3 + JavaScript
- **框架**：Vue.js 2.x + Element UI
- **Markdown**：marked.js + KaTeX
- **图表**：Mermaid.js
- **编辑器**：自定义 VEditor

## 文件结构

```
mnai/mnchatglm/
├── main.js                      # 主入口文件
├── webviewController.js         # WebView 控制器（主界面）
├── notificationController.js    # 通知栏控制器
├── dynamicController.js         # 悬浮球控制器
├── sideOutputController.js      # 侧边栏输出控制器
├── utils.js                     # 工具函数
├── api.js                       # API 接口封装
├── network.js                   # 网络请求模块
├── subfunc.js                   # 辅助功能
├── index.html                   # 主界面 HTML
├── overtype_chat.html          # 聊天界面
├── veditor_dark.html           # 深色编辑器
├── veditor_light.html          # 浅色编辑器
├── app.js                      # Vue 应用主文件
├── app.css                     # 样式文件
└── res.json                    # 资源配置
```

## 核心架构设计

### 四控制器架构

MNAI 采用了独特的四控制器架构，每个控制器负责不同的界面和功能：

```
┌────────────────────────────────────────┐
│         MNChatGLM (主控制器)           │
│  - 插件生命周期管理                    │
│  - 事件分发                            │
│  - 状态同步                            │
└────────────────────────────────────────┘
                ↓ 协调
    ┌───────────┬───────────┬───────────┐
    ↓           ↓           ↓           ↓
┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
│WebView  │ │Notif.   │ │Dynamic  │ │SideOut. │
│Control. │ │Control. │ │Control. │ │Control. │
└─────────┘ └─────────┘ └─────────┘ └─────────┘
  主聊天窗口  通知栏界面  悬浮球界面  侧边栏输出
```

### 控制器职责分工

#### 1. MNChatGLM（主控制器）
- 管理插件生命周期
- 协调各子控制器
- 处理全局事件
- 维护共享状态

#### 2. WebViewController（主界面控制器）
- 管理主聊天窗口
- 处理用户输入输出
- 管理对话历史
- 控制 AI 请求

#### 3. NotificationController（通知栏控制器）
- 显示实时 AI 响应
- 处理快捷操作
- 管理通知队列
- 同步主窗口状态

#### 4. DynamicController（悬浮球控制器）
- 提供快速访问入口
- 显示状态指示
- 处理拖拽移动
- 快捷功能触发

#### 5. SideOutputController（侧边栏控制器）
- 显示结构化输出
- 管理输出历史
- 支持导出功能
- 与主窗口联动

## 多控制器协作机制

### 状态同步机制

```javascript
// 全局状态管理
class StateManager {
  static shared = {
    currentChat: null,
    aiModel: 'gpt-3.5-turbo',
    isProcessing: false,
    history: []
  }
  
  static sync(key, value) {
    this.shared[key] = value
    // 通知所有控制器
    this.notifyControllers(key, value)
  }
  
  static notifyControllers(key, value) {
    // 通过 NSNotificationCenter 广播
    MNUtil.postNotification('StateChanged', {
      key: key,
      value: value
    })
  }
}
```

### 事件传递流程

```
用户操作（任意控制器）
    ↓
事件捕获
    ↓
主控制器处理
    ↓
状态更新
    ↓
广播通知
    ↓
各控制器响应更新
```

### 控制器间通信

```javascript
// 1. 直接调用（强耦合）
webviewController.processInput(text)

// 2. 事件广播（松耦合）
MNUtil.postNotification('ChatRequest', {
  text: text,
  sender: 'dynamic'
})

// 3. 共享数据（状态同步）
NSUserDefaults.standardUserDefaults()
  .setObjectForKey(data, 'mnai.shared')
```

## 四控制器架构详解

MNAI 插件采用创新的四控制器架构设计，每个控制器负责特定的功能领域，通过主控制器协调工作。

### webviewController.js 深度分析（4,241行，148个方法）

#### 核心职责
webviewController 是插件的主设置界面控制器，负责所有配置管理和用户交互的核心界面。

#### 类定义与生命周期
```javascript
var chatglmController = JSB.defineClass('chatglmController : UIViewController', {
  viewDidLoad: function() {
    // 初始化视图
    self.init()
    self.view.frame = {x:50,y:50,width:chatAIUtils.getWidth(),height:450}
    
    // 创建设置视图
    if (!self.settingView) {
      self.createSettingView()
    }
    self.settingViewLayout()
    
    // 添加手势识别器
    self.moveGesture = new UIPanGestureRecognizer(self,"onMoveGesture:")
    self.resizeGesture = new UIPanGestureRecognizer(self,"onResizeGesture:")
  },
  
  viewWillLayoutSubviews: function() {
    // 响应式布局
    var viewFrame = self.view.bounds
    self.moveButton.frame = {x: width*0.5-75, y: 0, width: 150, height: 16}
    self.settingViewLayout()
    self.refreshLayout()
  }
})
```

#### 视图管理系统

##### 1. 多页签架构
```javascript
switchView: function (targetView) {
  let allViews = ["configView", "syncView", "advanceView", "modelView", 
                  "customButtonView", "autoActionView"]
  let allButtons = ["configButton","syncConfig", "advancedButton", 
                    "modelTab", "customButtonTab", "triggerButton"]
  
  // 隐藏所有视图
  allViews.forEach(view => this[view].hidden = true)
  
  // 显示目标视图
  this[targetView].hidden = false
  
  // 更新按钮状态
  allButtons.forEach((button, index) => {
    this[button].isSelected = (allViews[index] === targetView)
  })
}
```

##### 2. 视图创建模式
```javascript
createSettingView: function() {
  // 创建主容器
  let targetView = "settingView"
  this.settingView = UIView.new()
  this.view.addSubview(this.settingView)
  
  // 创建标签页按钮
  this.createButton("configButton","configButtonTapped:",targetView)
  this.createButton("modelTab","modelTabTapped:",targetView)
  this.createButton("customButtonTab","customButtonTabTapped:",targetView)
  this.createButton("triggerButton","triggerButtonTapped:",targetView)
  this.createButton("syncConfig","syncConfigTapped:",targetView)
  this.createButton("advancedButton","advancedButtonTapped:",targetView)
  
  // 创建各分页视图
  this.createPromptConfig()    // Prompt 配置页
  this.createModelView()        // 模型配置页
  this.createAutoActionView()   // 触发器配置页
  this.createAdvanceView()      // 高级设置页
  this.createSyncView()         // 同步配置页
  this.createCustomButtonView() // 自定义按钮页
}
```

#### 核心功能模块

##### 1. 模型管理
```javascript
changeModel: function(button) {
  let menu = new Menu(button,self)
  menu.width = 200
  menu.rowHeight = 35
  
  let source = chatAIConfig.config.source
  let modelNames = chatAIConfig.modelNames(source)
  let currentModel = chatAIConfig.getDefaultModel(source)
  
  modelNames.map((model) => {
    menu.addMenuItem("🤖  "+model, 'setModel:', model, currentModel == model)
  })
  
  if (source === "Subscription") {
    menu.addMenuItem("➕  More Models", "showMoreModels:")
  }
  
  menu.show()
}

setModel: function(model) {
  Menu.dismissCurrentMenu()
  chatAIConfig.setDefaultModel(chatAIConfig.config.source, model, false)
  
  // 同步动态模型
  if (chatAIConfig.getConfig("syncDynamicModel")) {
    chatAIConfig.setDynamicModel(chatAIConfig.config.source, model)
  } else {
    chatAIConfig.save("MNChatglm_config")
  }
}
```

##### 2. Prompt 管理系统
```javascript
// Prompt 保存机制
promptSaveTapped: async function(button) {
  // 双击触发执行
  let clickDate = Date.now()
  if (button.clickDate && clickDate-button.clickDate<500) {
    if (chatAIUtils.checkCouldAsk()) {
      self.ask()
    }
    return
  }
  
  // 单击保存配置
  let config = chatAIConfig.prompts[chatAIConfig.currentPrompt]
  config.title = self.titleInput.text ?? ""
  config.context = self.contextInput.text ?? ""
  config.system = self.systemInput.text ?? ""
  
  // 模板变量验证
  if (!chatAIUtils.checkTemplate(config.context)) return
  if (!chatAIUtils.checkTemplate(config.system)) return
  
  chatAIConfig.prompts[chatAIConfig.currentPrompt] = config
  chatAIConfig.save("MNChatglm_prompts")
  self.showHUD("Save prompt: " + config.title)
}

// 变量插入系统
addVariable: function(sender) {
  let vars = ['{{!}}','{{card}}','{{cardOCR}}','{{cards}}',
              '{{cardsOCR}}','{{parentCard}}','{{parentCardOCR}}',
              '{{notesInMindmap}}','{{context}}','{{textOCR}}',
              '{{userInput}}','{{knowledge}}','{{noteDocInfo}}',
              '{{currentDocInfo}}','{{noteDocAttach}}',
              '{{currentDocAttach}}','{{noteDocName}}',
              '{{currentDocName}}','{{selectionText}}',
              '{{clipboardText}}']
  
  var commandTable = vars.map(variable => {
    return {title:variable, object:self, selector:'insert:', param:variable}
  })
  
  self.popoverController = MNUtil.getPopoverAndPresent(sender,commandTable,200,4)
}
```

##### 3. 同步配置系统
```javascript
changeSyncSource: function(sender) {
  let syncSource = chatAIConfig.getConfig("syncSource")
  var commandTable = [
    self.tableItem('❌  None', 'setSyncSource:', 'None', syncSource=='None'),
    self.tableItem('☁️  iCloud', 'setSyncSource:', 'iCloud', syncSource=='iCloud'),
    self.tableItem('☁️  MNNote', 'setSyncSource:', 'MNNote', syncSource=='MNNote'),
    self.tableItem('☁️  Cloudflare R2', 'setSyncSource:', 'CFR2', syncSource=='CFR2'),
    self.tableItem('☁️  InfiniCloud', 'setSyncSource:', 'Infi', syncSource=='Infi'),
    self.tableItem('☁️  Webdav', 'setSyncSource:', 'Webdav', syncSource=='Webdav')
  ]
  self.popover(sender, commandTable, 200, 1)
}

setSyncSource: async function(source) {
  self.checkPopover()
  let currentSource = chatAIConfig.getConfig("syncSource")
  if (currentSource === source) return
  
  chatAIConfig.setSyncStatus(false)
  
  // 根据不同源设置不同配置
  switch (source) {
    case "iCloud":
      self.configNoteIdInput.text = ""
      break
    case "CFR2":
      file = chatAIConfig.getConfig("r2file") ?? ""
      self.configNoteIdInput.text = file
      MNButton.setTitle(self.focusConfigNoteButton, "Copy")
      break
    case "MNNote":
      self.configNoteIdInput.text = chatAIConfig.getConfig("syncNoteId")
      MNButton.setTitle(self.focusConfigNoteButton, "Focus")
      break
  }
  
  chatAIConfig.config.syncSource = source
  chatAIConfig.save("MNChatglm_config", true)
  self.refreshView("syncView")
}
```

##### 4. 手势处理系统
```javascript
// 移动手势
onMoveGesture: function(gesture) {
  if (gesture.state === 1) { // 开始
    self.originalLocationToMN = gesture.locationInView(MNUtil.studyView)
    self.originalFrame = self.view.frame
  }
  
  if (gesture.state === 2) { // 移动中
    let locationToMN = gesture.locationInView(MNUtil.studyView)
    let locationDiff = {
      x: locationToMN.x - self.originalLocationToMN.x,
      y: locationToMN.y - self.originalLocationToMN.y
    }
    
    let frame = self.view.frame
    frame.x = self.originalFrame.x + locationDiff.x
    frame.y = self.originalFrame.y + locationDiff.y
    self.setFrame(frame)
  }
  
  if (gesture.state === 3) { // 结束
    MNUtil.studyView.bringSubviewToFront(self.view)
  }
}

// 调整大小手势
onResizeGesture: function(gesture) {
  let baseframe = gesture.view.frame
  let frame = self.view.frame
  let translation = chatAIUtils.getTranslation(gesture)
  
  let width = translation.x - frame.x + baseframe.width
  let height = translation.y - frame.y + baseframe.height + 15
  
  // 最小尺寸限制
  width = Math.max(width, 330)
  height = Math.max(height, 465)
  
  self.view.frame = {x:frame.x, y:frame.y, width:width, height:height}
  self.currentFrame = self.view.frame
  
  if (gesture.state === 3) {
    MNUtil.studyView.bringSubviewToFront(self.view)
  }
}
```

#### 创新设计模式

##### 1. 按钮工厂模式
```javascript
createButton: function(buttonName, targetAction, superview) {
  this[buttonName] = UIButton.buttonWithType(0)
  this[buttonName].autoresizingMask = (1 << 0 | 1 << 3)
  
  if (targetAction) {
    this[buttonName].addTargetActionForControlEvents(this, targetAction, 1 << 6)
  }
  
  if (superview === "view") {
    this.view.addSubview(this[buttonName])
  } else if (superview) {
    this[superview].addSubview(this[buttonName])
  }
  
  return this[buttonName]
}
```

##### 2. 菜单构建器模式
```javascript
// 使用 Menu 类构建上下文菜单
changeFunc: function(button) {
  let menu = new Menu(button, self)
  menu.width = 250
  menu.rowHeight = 35
  menu.preferredPosition = 0
  
  // 添加菜单项
  menu.addMenuItem("🌟   All Tools", selector, 100, isAllTools)
  
  newOrder.map((toolIndex) => {
    let toolName = toolNames[toolIndex]
    let tool = chatAITool.getToolByName(toolName)
    menu.addMenuItem(tool.toolTitle, selector, toolIndex, 
                     currentFunc.includes(toolIndex))
  })
  
  menu.addMenuItem("🗿   Old Tools (Free)", "showOldTools:", button)
  menu.addMenuItem("❌   None", selector, -1, currentFunc.length === 0)
  
  menu.show()
}
```

##### 3. 状态管理模式
```javascript
// 集中式状态更新
refreshLayout: function() {
  if (!this.settingView) return
  
  // 更新所有相关视图
  this.dynamicButton.frame = MNUtil.genFrame(8,8,110,30)
  
  if (chatAIConfig.config.dynamic) {
    this.dynamicButton.backgroundColor = MNUtil.hexColorAlpha("#fd3700",0.8)
    this.dynamicButton.setTitleForState("Dynamic ✅",0)
  } else {
    this.dynamicButton.setTitleForState("Dynamic ❌",0)
    this.dynamicButton.backgroundColor = MNUtil.hexColorAlpha("#ff9375",0.8)
  }
  
  // 更新滚动视图
  this.scrollview.contentSize = {
    width: this.scrollview.frame.width,
    height: this.promptButtons.length * 35 + 50
  }
}
```

#### 关键特性总结

1. **完整的配置管理**：涵盖模型、Prompt、同步、触发器等所有配置
2. **响应式布局系统**：自适应窗口大小变化
3. **手势识别**：支持拖动和调整大小
4. **多页签架构**：6个主要配置页面
5. **实时同步**：配置变更立即同步到其他控制器
6. **错误边界处理**：每个关键方法都有 try-catch 保护

### notificationController.js 深度分析（3,862行，63个方法）

#### 核心职责
notificationController 是插件的主对话界面控制器，负责 AI 响应的显示、用户交互和工具执行。

#### 类定义与架构
```javascript
var notificationController = JSB.defineClass(
  'notificationController : UIViewController <NSURLConnectionDelegate,UIWebViewDelegate>', 
  {
    viewDidLoad: function() {
      // 初始化状态
      self.onreceive = false
      self.response = ''
      self.dynamic = true
      self.isLoading = false
      self.toolbarOn = true
      self.onChat = false
      
      // 设置视图属性
      self.view.layer.shadowRadius = 15
      self.view.layer.shadowOpacity = 0.5
      self.view.layer.cornerRadius = 11
      
      // 创建工具栏按钮
      self.createButton("toolbar", undefined, "view")
      self.createButton("screenButton", "closeButtonTapped:", "toolbar")
      self.createButton("bigbangButton", "executeCustomButton:", "toolbar")
      self.createButton("commentButton", "executeCustomButton:", "toolbar")
      // ... 更多按钮
      
      // 添加手势识别
      self.resizeGesture = new UIPanGestureRecognizer(self, "onResizeGesture:")
      self.screenButton.addGestureRecognizer(self.resizeGesture)
    }
  }
)
```

#### 核心功能模块

##### 1. AI 对话管理
```javascript
ask: async function(question, promptKey = this.currentPrompt, temperature = undefined) {
  this.dynamic = false
  this.token = []
  this.func = []
  this.preFuncResponse = ""
  
  // 准备问题和配置
  let config = chatAIConfig.prompts[promptKey]
  this.currentPrompt = promptKey
  
  // 处理模板变量
  let context = await chatAIUtils.replaceTemplate(config.context, this.noteid)
  let system = await chatAIUtils.replaceTemplate(config.system, this.noteid)
  
  // 构建消息
  let messages = [
    {role: "system", content: system},
    {role: "user", content: context}
  ]
  
  // 发送请求
  this.sendRequest(messages, config)
}

askByDynamic: async function(question, temperature = 0.8, reask = false) {
  let config = chatAIConfig.getDynmaicConfig()
  this.dynamic = true
  
  // 动态模型配置
  let promptModel = chatAIConfig.getConfig("dynamicModel")
  if (promptModel) {
    this.currentModel = promptModel
    config = chatAIConfig.parseModelConfig(promptModel)
  }
  
  // 智能判断是否需要视觉能力
  if (chatAIConfig.getConfig("autoImage") && this.hasImage()) {
    return this.askByVision(question, temperature, reask)
  }
  
  // 智能判断是否需要 OCR
  if (chatAIConfig.getConfig("autoOCR") && this.needOCR()) {
    question = await this.addOCRToQuestion(question)
  }
  
  this.sendRequest(question, config)
}

askByVision: async function(question, temperature = 0.8, reask = false) {
  this.dynamic = true
  
  // 自动切换到支持视觉的模型
  let visionModels = ["gpt-4-vision", "claude-3", "gemini-pro-vision"]
  let currentModel = this.currentModel
  
  if (!visionModels.includes(currentModel)) {
    this.currentModel = visionModels[0]  // 自动切换
    this.showHUD("Auto switch to vision model")
  }
  
  // 处理图片
  let images = await this.collectImages()
  question = this.attachImages(question, images)
  
  this.sendRequest(question, config)
}
```

##### 2. WebView 集成系统
```javascript
// WebView 创建和配置
createWebview: function() {
  this.webviewResponse = new UIWebView(MNUtil.genFrame(0, 0, width, height))
  this.webviewResponse.scrollView.bounces = false
  this.webviewResponse.delegate = self
  this.webviewResponse.backgroundColor = UIColor.clearColor()
  
  // 加载 HTML 模板
  let htmlPath = self.mainPath + '/veditor_' + theme + '.html'
  self.webviewResponse.loadFileURLAllowingReadAccessToURL(
    NSURL.fileURLWithPath(htmlPath),
    NSURL.fileURLWithPath(self.mainPath)
  )
}

// 渲染 Markdown 内容
renderMarkdown: async function(text) {
  // 处理代码块
  text = text.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
    return `<pre><code class="language-${lang || 'plaintext'}">${
      this.escapeHtml(code)
    }</code></pre>`
  })
  
  // 处理数学公式
  text = text.replace(/\$\$([\s\S]*?)\$\$/g, (match, formula) => {
    return `<span class="math-display">\\[${formula}\\]</span>`
  })
  
  // 调用 WebView 渲染
  this.runJavaScript(`renderMarkdown(\`${text}\`)`)
}

// JavaScript 交互
runJavaScript: function(script) {
  return new Promise((resolve, reject) => {
    self.webviewResponse.evaluateJavaScriptCompletionHandler(
      script,
      (result, error) => {
        if (error) reject(error)
        else resolve(result)
      }
    )
  })
}
```

##### 3. 流式响应处理
```javascript
// NSURLConnection 代理方法实现流式响应
connectionDidReceiveResponse: function(connection, response) {
  self.onreceive = true
  self.response = ""
  self.buffer = ""
}

connectionDidReceiveData: function(connection, data) {
  let text = NSString.alloc().initWithDataEncoding(data, 4).toString()
  
  // 解析 SSE 格式
  let lines = text.split('\n')
  lines.forEach(line => {
    if (line.startsWith('data: ')) {
      let jsonStr = line.substring(6)
      if (jsonStr === '[DONE]') {
        self.onComplete()
        return
      }
      
      try {
        let json = JSON.parse(jsonStr)
        let delta = json.choices[0].delta.content || ""
        
        // 增量更新
        self.response += delta
        self.updateDisplay(self.response)
        
        // 工具调用检测
        if (json.choices[0].delta.tool_calls) {
          self.handleToolCall(json.choices[0].delta.tool_calls)
        }
      } catch(e) {}
    }
  })
}

connectionDidFinishLoading: function(connection) {
  self.onreceive = false
  self.finalizeResponse()
}
```

##### 4. 自定义按钮系统
```javascript
executeCustomButton: async function(button) {
  let config = chatAIConfig.getConfig("customButton")
  
  if (typeof button === "string") {
    self.executeActionFromButton(button)
  } else {
    if (config[button.action]) {
      let action = config[button.action].click
      self.executeActionFromButton(action, button)
      self.checkAutoClose(config[button.action].autoClose)
    }
  }
}

// 长按处理
onLongPress: async function(gesture) {
  if (gesture.state === 1) {
    let button = gesture.view
    let config = chatAIConfig.getConfig("customButton")
    
    if (config[button.action]) {
      let action = config[button.action].longPress
      self.executeActionFromButton(action, button)
      self.checkAutoClose(config[button.action].autoClose)
    }
  }
}

// 动作执行器
executeActionFromButton: function(action, button) {
  switch(action) {
    case "bigbang":
      self.bigbang()
      break
    case "addComment":
      self.setComment()
      break
    case "setTitle":
      self.setNoteTitle()
      break
    case "copy":
      self.copy()
      break
    case "setExcerpt":
      self.setExcerpt()
      break
    case "addChildNote":
      self.addChildNote()
      break
    case "markdown2Mindmap":
      self.markdown2Mindmap()
      break
    // ... 更多动作
  }
}

// 自定义按钮刷新
refreshCustomButton: function() {
  let config = chatAIConfig.getConfig("customButton")
  let actionImages = chatAIConfig.actionImages
  
  // 更新按钮图标
  Object.keys(config).forEach(key => {
    let button = self[key.replace("button", "") + "Button"]
    if (button) {
      let imageName = actionImages[config[key].click]
      button.setImageForState(imageName, 0)
    }
  })
}
```

##### 5. 聊天模式
```javascript
openChatView: async function(params) {
  if (chatAIUtils.isMN3()) {
    MNUtil.showHUD("Only available in MN4")
    return
  }
  
  self.onChat = true
  
  // 创建聊天视图
  if (!self.chatView) {
    self.chatView = UIView.new()
    self.view.addSubview(self.chatView)
    
    // 添加输入框
    self.chatInput = UITextView.new()
    self.chatView.addSubview(self.chatInput)
    
    // 添加发送按钮
    self.sendButton = UIButton.buttonWithType(0)
    self.sendButton.addTargetActionForControlEvents(self, "sendMessage:", 1 << 6)
    self.chatView.addSubview(self.sendButton)
  }
  
  self.chatView.hidden = false
  self.setChatLayout()
}

setChatLayout: function() {
  let viewFrame = self.view.bounds
  
  // 聊天历史区域
  self.webviewResponse.frame = {
    x: 0,
    y: 0,
    width: viewFrame.width,
    height: viewFrame.height - 100
  }
  
  // 输入区域
  self.chatInput.frame = {
    x: 10,
    y: viewFrame.height - 90,
    width: viewFrame.width - 80,
    height: 35
  }
  
  // 发送按钮
  self.sendButton.frame = {
    x: viewFrame.width - 60,
    y: viewFrame.height - 90,
    width: 50,
    height: 35
  }
}
```

##### 6. 工具执行系统
```javascript
handleToolCall: async function(toolCalls) {
  for (let toolCall of toolCalls) {
    let toolName = toolCall.function.name
    let args = JSON.parse(toolCall.function.arguments)
    
    // 获取工具实例
    let tool = chatAITool.getToolByName(toolName)
    if (!tool) continue
    
    // 执行工具
    let result = await tool.execute(args)
    
    // 返回结果
    self.func.push({
      id: toolCall.id,
      function: {
        name: toolName,
        result: result
      }
    })
  }
  
  // 继续对话
  if (self.func.length > 0) {
    self.continueWithToolResults()
  }
}
```

#### 创新设计特点

##### 1. 智能位置管理
```javascript
// 根据屏幕位置自动调整
viewWillLayoutSubviews: function() {
  let self = getNotificationController()
  if (self.onAnimate) return
  
  self.notifyLoc = chatAIUtils.isIOS() ? 0 : chatAIConfig.config.notifyLoc
  currentFrame.width = chatAIUtils.getWidth()
  currentFrame.x = chatAIUtils.getX()  // 左侧或右侧
  currentFrame.y = chatAIUtils.getY()
  
  if (self.onChat) {
    self.setChatLayout()
  } else {
    self.setLayout()
  }
}
```

##### 2. 手势交互
```javascript
onResizeGesture: function(gesture) {
  let maxHeight = chatAIUtils.getHeight()
  let height = locationToBrowser.y + baseframe.height * 0.5
  height = MNUtil.constrain(height, 120, maxHeight)
  
  // 左侧布局
  if (self.notifyLoc === 0) {
    self.view.frame = {
      x: chatAIUtils.getX(),
      y: chatAIUtils.getY(),
      width: chatAIUtils.getWidth(),
      height: height
    }
    
    // 拖动切换位置提示
    if (temX > 200 && !chatAIUtils.isIOS()) {
      self.screenButton.setImageForState(chatAIConfig.switchLocationImage, 0)
    }
  }
}
```

##### 3. 主题自适应
```javascript
checkTheme: function(force = false) {
  let isDark = MNUtil.isDarkMode()
  
  if (force || self.isDark !== isDark) {
    self.isDark = isDark
    let theme = isDark ? 'dark' : 'light'
    
    // 重新加载主题
    let htmlPath = self.mainPath + '/veditor_' + theme + '.html'
    self.webviewResponse.loadFileURLAllowingReadAccessToURL(
      NSURL.fileURLWithPath(htmlPath),
      NSURL.fileURLWithPath(self.mainPath)
    )
  }
}
```

#### 关键特性总结

1. **流式响应处理**：实现了完整的 SSE 流式响应解析
2. **WebView 集成**：Markdown 渲染、代码高亮、数学公式
3. **自定义按钮系统**：支持点击和长按的不同动作
4. **智能模式切换**：自动识别需要视觉或 OCR 能力
5. **聊天模式**：完整的对话界面和历史管理
6. **工具执行**：Function Calling 的完整实现

### dynamicController.js 深度分析（1,487行，47个方法）

#### 核心职责
dynamicController 是插件的动态浮动按钮控制器，提供快速输入界面和智能触发功能。

#### 类定义与初始化
```javascript
var dynamicController = JSB.defineClass(
  'dynamicController : UIViewController <NSURLConnectionDelegate,UIWebViewDelegate>', 
  {
    viewDidLoad: function() {
      // 初始化状态
      self.dynamic = true
      self.pinned = false  // 是否固定
      self.inputHeight = 35
      self.miniMode = false
      
      // 创建UI元素
      self.createButton("aiButton")
      self.createButton("addButton")
      self.createButton("modelButton")
      self.createButton("sendButton")
      self.createButton("OCREnhanced")
      self.createButton("visionButton")
      self.createButton("dynamicToolButton")
      
      // 添加手势识别
      MNButton.addPanGesture(self.closeButton, self, "onMoveGesture:")
      MNButton.addLongPressGesture(self.aiButton, self, "onLongPressAI:")
    }
  }
)
```

#### 核心功能模块

##### 1. 界面模式管理
```javascript
// 迷你模式（64x35）
miniMode: function() {
  return self.lastFrame.width === 64 && self.lastFrame.height === 35
}

// 展开输入模式（300x215）
openInput: async function() {
  self.onClick = true
  let studyFrame = MNUtil.studyView.frame
  
  // 智能位置调整
  if (self.lastFrame.x + 300 > studyFrame.width) {
    self.lastFrame.x = studyFrame.width - 300
  }
  if (self.lastFrame.y + 215 > studyFrame.height) {
    self.lastFrame.y = studyFrame.height - 215
  }
  
  self.lastFrame.width = 300
  self.lastFrame.height = 215
  
  // 智能模式检测
  chatAIUtils.getInfoForReference().then((info) => {
    if ("imageData" in info) {
      chatAIUtils.visionMode = true
    }
    if (info.ocr) {
      chatAIUtils.OCREnhancedMode = true
    }
    self.setLayout()
  })
  
  // 更新模型显示
  let model = chatAIConfig.getConfig("dynamicModel")
  let modelConfig = chatAIConfig.parseModelConfig(model)
  MNButton.setTitle(self.modelButton, modelConfig.model, 14, true)
  
  await self.setLayout()
  self.view.hidden = false
}

// 关闭输入界面
closeInput: async function() {
  self.onClick = true
  self.pinned = false
  self.lastFrame.width = 64
  self.lastFrame.height = 35
  self.setLayout(self.lastFrame)
  self.view.hidden = true
  
  // 自动清理输入
  if (chatAIConfig.getConfig("autoClear")) {
    self.clearInput()
  }
}
```

##### 2. 智能模式切换
```javascript
// OCR增强模式
toggleOCREnhanceMode: async function(params) {
  chatAIUtils.OCREnhancedMode = !chatAIUtils.OCREnhancedMode
  
  if (chatAIUtils.OCREnhancedMode) {
    let autoOCR = chatAIConfig.getConfig("autoOCR")
    if (autoOCR) {
      // 智能检测需要OCR的场景
      if (chatAIUtils.currentNoteId) {
        let note = MNNote.new(chatAIUtils.currentNoteId)
        let imageData = note.imageData
        if (imageData) {
          chatAINetwork.getTextOCR(imageData).then(() => {
            self.OCREnhanced.backgroundColor = MNUtil.hexColorAlpha("#e06c75", 0.8)
          })
        }
      } else {
        // 检查选区或聚焦笔记
        let selection = MNUtil.currentSelection
        if (selection.onSelection) {
          chatAINetwork.getTextOCR(selection.image).then(() => {
            self.OCREnhanced.backgroundColor = MNUtil.hexColorAlpha("#e06c75", 0.8)
          })
        }
      }
    }
    MNUtil.showHUD("OCR Enhanced ✅")
  } else {
    MNUtil.showHUD("OCR Enhanced ❌")
    self.OCREnhanced.backgroundColor = MNUtil.hexColorAlpha("#c0bfbf", 0.8)
  }
}

// 视觉模式
toggleVisionMode: async function(params) {
  chatAIUtils.visionMode = !chatAIUtils.visionMode
  if (chatAIUtils.visionMode) {
    MNUtil.showHUD("Vision Mode ✅")
    self.visionButton.backgroundColor = MNUtil.hexColorAlpha("#e06c75", 0.8)
  } else {
    MNUtil.showHUD("Vision Mode ❌")
    self.visionButton.backgroundColor = MNUtil.hexColorAlpha("#c0bfbf", 0.8)
  }
}
```

##### 3. Prompt按钮布局系统
```javascript
setButtonText: function(names) {
  self.words = names
  
  // 动态创建按钮
  names.map((word, index) => {
    if (!self["nameButton" + index]) {
      self["nameButton" + index] = self.createButton("onPromptButton:", "scrollview")
      self["nameButton" + index].titleLabel.font = UIFont.systemFontOfSize(16)
    }
    
    self["nameButton" + index].hidden = false
    self["nameButton" + index].setTitleForState(chatAIConfig.prompts[word].title, 0)
    self["nameButton" + index].id = word
    self["nameButton" + index].backgroundColor = MNUtil.hexColorAlpha("#7093cb", 0.75)
  })
  
  self.refreshLayout()
}

refreshLayout: function() {
  var viewFrame = self.scrollview.bounds
  var xLeft = 0
  let initX = 5
  let initY = 45
  let initL = 0
  self.locs = []
  
  self.words.map((word, index) => {
    let title = chatAIConfig.prompts[word].title
    let width = self["nameButton" + index].sizeThatFits({width: 100, height: 30}).width + 15
    
    // 自动换行布局
    if (xLeft + initX + width > viewFrame.width) {
      initX = 5
      initY = initY + 36
      initL = initL + 1
    }
    
    self["nameButton" + index].frame = {
      x: xLeft + initX,
      y: initY,
      width: width,
      height: 30
    }
    
    self.locs.push({x: xLeft + initX, y: initY, l: initL, i: index})
    initX = initX + width + 6
  })
  
  // 更新滚动区域
  self.scrollview.contentSize = {width: viewFrame.width, height: initY + 40}
}
```

##### 4. WebView输入处理
```javascript
webViewShouldStartLoadWithRequestNavigationType: function(webView, request, type) {
  let requestURL = request.URL().absoluteString()
  let config = MNUtil.parseURL(requestURL)
  
  if (config.scheme === "editoraction") {
    switch (config.host) {
      case "setHeight":
        // 动态调整输入框高度
        let height = MNUtil.constrain(config.params.height, 35, 175)
        self.inputHeight = height
        self.promptInput.frame = MNUtil.genFrame(45, 5, 210, height)
        break
        
      case "sendMessage":
        // 发送消息
        let content = config.params.content
        if (content.trim()) {
          self.sendMessage(content)
          chatAIConfig.appendDynamicHistory(content)
          self.blur(0.1)
        }
        break
        
      case "keyboardShown":
        // 键盘弹出时调整位置
        if (!self.miniMode()) {
          let keyboardHeight = config.params.keyboardHeight
          let viewportHeight = config.params.viewportHeight
          let frame = self.view.frame
          frame.y = frame.y - (self.inputHeight - viewportHeight) - 10
          MNUtil.animate(() => {
            self.setFrame(frame)
          }, 0.3)
        }
        break
    }
    return false
  }
  return true
}
```

##### 5. 手势识别系统
```javascript
onMoveGesture: function(gesture) {
  self.pinned = true
  
  if (gesture.state === 1) { // 开始
    self.originalLocationToMN = gesture.locationInView(MNUtil.studyView)
    self.originalFrame = self.view.frame
  }
  
  if (gesture.state === 2) { // 移动中
    let locationToMN = gesture.locationInView(MNUtil.studyView)
    let locationDiff = {
      x: locationToMN.x - self.originalLocationToMN.x,
      y: locationToMN.y - self.originalLocationToMN.y
    }
    
    let frame = self.view.frame
    frame.x = self.originalFrame.x + locationDiff.x
    frame.y = self.originalFrame.y + locationDiff.y
    self.setFrame(frame)
  }
}

onLongPressAI: function(gesture) {
  if (gesture.state === 1) {
    self.openInput()
    self.pinned = true  // 固定窗口
    MNUtil.showHUD("📌 Pinned")
  }
}
```

##### 6. 动画系统
```javascript
animateTo: async function(targetFrame) {
  let studyFrame = MNUtil.studyView.frame
  
  // 边界检查
  if (targetFrame.x + targetFrame.width > studyFrame.width) {
    targetFrame.x = studyFrame.width - 300
  }
  if (targetFrame.y + targetFrame.height > studyFrame.height) {
    targetFrame.y = studyFrame.height - 215
  }
  
  return new Promise((resolve, reject) => {
    self.onAnimate = true
    
    if (self.view.hidden) {
      self.setFrame(targetFrame)
      self.view.layer.opacity = 0
      self.view.hidden = false
    }
    
    MNUtil.animate(() => {
      self.setFrame(targetFrame)
      self.view.layer.opacity = 1.0
      // 更新所有按钮位置
      self.aiButton.frame = MNUtil.genFrame(3, 0, 31, 35)
      self.addButton.frame = MNUtil.genFrame(32, 0, 30, 35)
      self.modelButton.frame = MNUtil.genFrame(75, 0, 145, 25)
      // ... 更多按钮
    }, 0.1).then(() => {
      self.onAnimate = false
      resolve()
    })
  })
}
```

#### 创新设计特点

##### 1. 智能触发检测
```javascript
// 根据上下文智能判断需要的功能
chatAIUtils.getInfoForReference().then((info) => {
  if ("imageData" in info) {
    chatAIUtils.visionMode = true  // 自动开启视觉模式
  }
  if (info.ocr) {
    chatAIUtils.OCREnhancedMode = true  // 自动开启OCR
  }
})
```

##### 2. 上下文菜单系统
```javascript
onLongPress: async function(gesture) {
  if (gesture.state === 1) {
    let button = gesture.view
    var commandTable = []
    
    if (chatAIUtils.currentNoteId) {
      // 笔记模式菜单
      commandTable = [
        {title: '📝 Title', object: self, selector: 'chooseInputFromNote:', param: "Title"},
        {title: '📄 Content', object: self, selector: 'chooseInputFromNote:', param: "Content"},
        {title: '🖼️ Image', object: self, selector: 'chooseInputFromNote:', param: "Image"}
      ]
    } else {
      // 选区模式菜单
      commandTable = [
        {title: '📝 Text (OCR)', object: self, selector: 'chooseInputFromSelection:', param: "OCR"},
        {title: '📄 Text', object: self, selector: 'chooseInputFromSelection:', param: "Text"},
        {title: '🖼️ Image', object: self, selector: 'chooseInputFromSelection:', param: "Image"}
      ]
    }
    
    self.popoverController = MNUtil.getPopoverAndPresent(button, commandTable, 150, 2)
  }
}
```

#### 关键特性总结

1. **智能界面切换**：迷你模式和展开模式的无缝切换
2. **智能功能检测**：根据上下文自动开启OCR或视觉模式
3. **动态布局系统**：Prompt按钮的自适应布局
4. **手势识别**：拖动、长按等手势支持
5. **WebView集成**：输入框高度动态调整
6. **固定模式**：长按固定窗口位置

### sideOutputController.js 深度分析（3,742行，约80个方法）

#### 核心职责
sideOutputController 是 MN4 专用的侧边栏控制器，提供完整的聊天界面体验和历史管理功能。

#### 类定义与架构
```javascript
var sideOutputController = JSB.defineClass(
  'sideOutputController : UIViewController <NSURLConnectionDelegate,UIWebViewDelegate>',
  {
    viewDidLoad: function() {
      // 初始化状态
      self.onreceive = false
      self.response = ''
      self.dynamic = true
      self.history = []
      self.funcIndices = []
      
      // 设置视图属性
      self.view.layer.cornerRadius = 8
      self.view.backgroundColor = MNUtil.hexColorAlpha("#ffffff", 0)
      
      // 初始化聊天界面
      self.openChatView()
    }
  }
)
```

#### 核心功能模块

##### 1. 聊天界面管理
```javascript
openChatView: async function(params) {
  if (chatAIUtils.isMN3()) {
    MNUtil.showHUD("Only available in MN4")
    return
  }
  
  self.onChat = true
  
  // 创建聊天UI元素
  self.createChatToolbar()
  self.createUserInput()
  self.createSendButton()
  self.createModelSelector()
  self.createTokenDisplay()
  
  // 加载聊天历史
  self.loadChatHistory()
  
  // 设置布局
  self.setChatLayout()
}

setChatLayout: function() {
  let panelFrame = MNExtensionPanel.bounds
  
  // 聊天历史区域
  self.webviewResponse.frame = {
    x: 0,
    y: 40,
    width: panelFrame.width,
    height: panelFrame.height - 200
  }
  
  // 输入区域
  self.userInput.frame = {
    x: 10,
    y: panelFrame.height - 150,
    width: panelFrame.width - 80,
    height: 80
  }
  
  // 工具栏
  self.chatToolbar.frame = {
    x: 0,
    y: 0,
    width: panelFrame.width,
    height: 40
  }
}
```

##### 2. 聊天历史管理
```javascript
// 导出历史
exportHistory: function(params) {
  self.checkPopover()
  let dataPath = subscriptionUtils.extensionPath + "/data/chatData.json"
  MNUtil.saveFile(dataPath, ["public.json"])
}

// 导入历史
importHistory: async function(params) {
  self.checkPopover()
  let dataPath = await MNUtil.importFile(["public.json"])
  MNUtil.showHUD("📥 Import history")
  
  let data = MNUtil.readJSON(dataPath)
  if ("chats" in data && "chatIdxs" in data && "folder" in data && "activeChatIdx" in data) {
    chatAIConfig.exportChatData(data)
    self.importData()
  } else {
    MNUtil.showHUD("Invalid history file!")
  }
}

// 重新加载历史
reloadHistory: async function(params) {
  self.checkPopover()
  let data = chatAIConfig.getChatData()
  
  if ("chats" in data && "chatIdxs" in data && "folder" in data && "activeChatIdx" in data) {
    MNUtil.showHUD("🔄 Reload history")
    self.importData()
  } else {
    MNUtil.showHUD("Invalid history file!")
  }
}
```

##### 3. 新建聊天会话
```javascript
newChatTapped: async function(button) {
  let self = getSideOutputController()
  
  // 显示Prompt选择菜单
  var commandTable = chatAIConfig.getConfig("promptNames").map((promptName) => {
    return MNUtil.tableItem(
      "💬    " + chatAIConfig.prompts[promptName].title.trim(),
      self,
      'newChatFromPrompt:',
      promptName
    )
  })
  
  self.popover(button, commandTable, 200, 4)
}

newChatFromPrompt: async function(promptName) {
  self.checkPopover()
  let prompt = chatAIConfig.prompts[promptName]
  MNUtil.showHUD("New Chat From: " + prompt.title)
  
  // 设置模型
  if (!("model" in prompt)) {
    prompt.model = "Default"
  }
  self.setCurrentModel(prompt.model)
  
  // 初始化历史
  let newHistory = []
  if ("system" in prompt) {
    newHistory.push({role: "system", content: prompt.system})
  }
  self.history = newHistory
  
  // 设置输入
  self.setInput(prompt.content)
  
  // 创建新数据
  let newData = {
    data: newHistory,
    name: prompt.title,
    model: prompt.model
  }
  
  // 设置工具
  if ("func" in prompt) {
    self.funcIndices = prompt.func
    newData.funcIdxs = prompt.func
  }
  
  // 设置温度
  if ("temperature" in prompt) {
    self.temperature = prompt.temperature
    newData.temperature = prompt.temperature
  }
  
  self.importData(newData)
}
```

##### 4. 迷你模式切换
```javascript
minimizeChat: function(button) {
  self.minimizeButton.hidden = true
  self.userInput.hidden = true
  self.userReference.hidden = true
  self.sendButton.hidden = true
  self.resizeButton.hidden = true
  self.imageButton.hidden = true
  self.chatToken.hidden = true
  
  let height = MNExtensionPanel.height
  self.miniMode = true
  self.lastChatToolbarFrame = self.chatToolbar.frame
  
  // 动画切换到迷你模式
  MNUtil.animate(() => {
    self.chatToolbar.frame = MNUtil.genFrame(5, height - 240, 35, 35)
    self.chatModel.frame = MNUtil.genFrame(0, 0, 35, 35)
    self.chatModel.setTitleForState("", 0)
    self.chatModel.setImageForState(chatAIConfig.editorImage, 0)
  }).then(() => {
    self.blur(0.1)
  })
}

// 恢复正常模式
changeChatModel: function(button) {
  if (self.miniMode) {
    self.miniMode = false
    self.chatModel.hidden = true
    
    MNUtil.animate(() => {
      self.chatToolbar.frame = self.lastChatToolbarFrame
    }).then(() => {
      self.minimizeButton.hidden = false
      self.userInput.hidden = false
      self.sendButton.hidden = false
      self.resizeButton.hidden = false
      self.imageButton.hidden = false
      self.chatToken.hidden = false
      self.chatModel.hidden = false
      self.chatModel.setImageForState(undefined, 0)
      self.setCurrentModel(self.currentModel)
      self.focusInput()
    })
    return
  }
  
  // 显示模型选择菜单
  // ...
}
```

##### 5. 笔记操作集成
```javascript
// 添加为子笔记
addChildNote: async function(button) {
  let text = await self.getTextForAction(button.round)
  let noteid = chatAIUtils.getFocusNote().noteId ?? self.noteid
  
  if (!noteid) {
    MNUtil.showHUD("Unavailable")
    return
  }
  
  let config = {excerptText: text, excerptTextMarkdown: true}
  let focusNote = MNNote.new(noteid)
  focusNote = focusNote.realGroupNoteForTopicId()
  let childNote = focusNote.createChildNote(config)
  
  await MNUtil.delay(0.5)
  childNote.focusInMindMap()
}

// 设置笔记标题
setNoteTitle: async function(button) {
  let noteid = chatAIUtils.getFocusNote().noteId ?? self.noteid
  if (!noteid) {
    MNUtil.showHUD("Unavailable")
    return
  }
  
  let note = MNUtil.getNoteById(noteid)
  let text = await self.getTextForAction(button.round)
  
  // 双击去除引号
  if (button.clickDate && Date.now() - button.clickDate < 500) {
    if (/^".*"$/.test(text)) {
      let length = text.length
      MNUtil.undoGrouping(() => {
        note.noteTitle = text.slice(1, length - 1)
      })
    }
  } else {
    button.clickDate = Date.now()
    MNUtil.undoGrouping(() => {
      note.noteTitle = text
    })
  }
}

// 设置摘录
setExcerpt: async function(button) {
  let text = await self.getTextForAction(button.round)
  let noteid = chatAIUtils.getFocusNote().noteId ?? self.noteid
  
  if (!noteid) {
    MNUtil.showHUD("Unavailable")
    return
  }
  
  let note = MNNote.new(noteid)
  MNUtil.undoGrouping(() => {
    note.excerptText = text.trim()
  })
}

// 添加评论
setComment: async function(button) {
  let text = await self.getTextForAction(button.round)
  let noteid = chatAIUtils.getFocusNote().noteId ?? self.noteid
  
  if (!noteid) {
    MNUtil.showHUD("Unavailable")
    return
  }
  
  let note = MNUtil.getNoteById(noteid)
  MNUtil.undoGrouping(() => {
    try {
      note.appendMarkdownComment(text.trim())
    } catch (error) {
      note.appendTextComment(text.trim())
    }
  })
}
```

##### 6. 工具系统集成
```javascript
changeFunc: function(button) {
  let currentFunc = self.funcIndices
  let selector = 'setFunc:'
  let newOrder = chatAITool.activatedToolsExceptOld
  let isAllTools = newOrder.every(toolIndex => currentFunc.includes(toolIndex))
  
  let menu = new Menu(button, self)
  menu.width = 250
  menu.rowHeight = 35
  menu.preferredPosition = 0
  
  // 添加菜单项
  menu.addMenuItem("🌟   All Tools", selector, 100, isAllTools)
  
  let toolNames = chatAITool.toolNames
  newOrder.map((toolIndex) => {
    let toolName = toolNames[toolIndex]
    let tool = chatAITool.getToolByName(toolName)
    menu.addMenuItem(tool.toolTitle, selector, toolIndex, currentFunc.includes(toolIndex))
  })
  
  menu.addMenuItem("🗿   Old Tools (Free)", "showOldTools:", button)
  menu.addMenuItem("❌   None", selector, -1, currentFunc.length === 0)
  
  menu.show()
}

setFunc: function(index) {
  Menu.dismissCurrentMenu()
  
  let currentFunc = chatAITool.getChangedTools(self.funcIndices, index)
  self.funcIndices = currentFunc
  self.setCurrentFuncIdxs(currentFunc)
  
  // 保存配置
  chatAIConfig.config.chatFuncIndices = currentFunc
  chatAIConfig.save("MNChatglm_config")
}
```

#### 创新设计特点

##### 1. 完整的会话管理
- 支持多个聊天会话
- 会话导入/导出
- 历史记录持久化
- 会话文件夹组织

##### 2. 与MN4深度集成
- 利用MNExtensionPanel API
- 侧边栏自适应布局
- 与主窗口联动
- 支持多窗口

##### 3. 智能交互设计
- 迷你模式和完整模式切换
- 笔记操作快捷集成
- 实时token统计
- 工具动态配置

#### 关键特性总结

1. **完整聊天体验**：MN4专用的侧边栏聊天界面
2. **会话管理**：导入/导出/重载聊天历史
3. **迷你模式**：节省空间的紧凑界面
4. **笔记集成**：快速创建子笔记、设置标题、添加评论
5. **工具配置**：动态选择Function Calling工具
6. **状态同步**：与其他控制器实时同步状态

### api.js 深度分析（3,473行）

#### 核心职责
api.js 是插件的 AI 接口封装层，负责处理所有 AI 模型的请求、响应解析、内容渲染等核心功能。

#### 核心功能模块

##### 1. 多模型API统一封装
```javascript
const API_URL = "v1/chat/completions"

// 模型配置
let modelVersion      // 模型版本
let apiHost          // API反代地址
let apiSelects = []  // API地址列表
let customAPIKey     // 自定义API密钥
let systemRole       // 系统角色
let roleNature       // 角色性格
let roleTemp         // 回答质量(temperature)
let contLen          // 连续会话长度
let enableLongReply  // 是否开启长回复

// 预设角色数据
let presetRoleData = {
  "default": translations[locale]["defaultText"],
  "normal": translations[locale]["assistantText"],
  "cat": translations[locale]["catText"],
  "emoji": translations[locale]["emojiText"],
  "image": translations[locale]["imageText"]
}
```

##### 2. KaTeX数学公式渲染
```javascript
function renderKaTeXFormulas(inputStr, katexOptions = {}) {
  // 默认配置
  const defaultOptions = { throwOnError: false, errorColor: "#cc0000" }
  const options = { ...defaultOptions, ...katexOptions }
  
  // 匹配 $$...$$ (块级公式) 和 $...$ (行内公式)
  const formulaRegex = /(?<!\\)\$\$(.*?)(?<!\\)\$\$|(?<!\\)\$(.*?)(?<!\\)\$/gs
  
  return inputStr.replace(formulaRegex, (match, blockFormula, inlineFormula) => {
    const isBlock = blockFormula !== undefined
    const formulaContent = isBlock ? blockFormula.trim() : inlineFormula.trim()
    
    try {
      // 使用 KaTeX 渲染公式
      return katex.renderToString(formulaContent, {
        ...options,
        displayMode: isBlock  // 块级公式设置 displayMode: true
      })
    } catch (error) {
      // 渲染失败时返回错误提示
      console.error("KaTeX 渲染错误:", error, "公式内容:", formulaContent)
      return `<span style="color: ${options.errorColor}; background: #ffebee; padding: 2px 4px; border-radius: 2px;">
        [公式错误: ${formulaContent}]
      </span>`
    }
  })
}
```

##### 3. 特殊代码块处理系统
```javascript
// 选择题卡片生成
function getQustionBlock(code) {
  let config = getValidJSON(code)
  let keys = Object.keys(config)
  
  if (keys.length === 0) return undefined
  
  let encodedContent = encodeURIComponent(code)
  let createNoteURL = `userselect://addnote?content=${encodedContent}&type=choiceQuestion`
  
  // 生成选项
  let choices = []
  if ("choices" in config) {
    choices = config.choices.map(choice => {
      return getChoiceBlock(choice)
    })
  }
  
  // 生成标题
  let titleHTML = ""
  if ("title" in config) {
    let titleColor = (theme === "dark") ? "rgb(255, 255, 255)" : "rgb(0, 0, 0)"
    titleHTML = `<h1 style="color: ${titleColor}; margin: 10px 0; font-size: 24px; font-weight: 600;">
      ${config.title}
    </h1>`
  }
  
  // 生成描述
  let descriptionHTML = ""
  if ("description" in config) {
    let descriptionColor = (theme === "dark") ? "rgb(221, 221, 221)" : "rgb(22, 44, 66)"
    descriptionHTML = `<p style="color: ${descriptionColor}; margin: 10px 0; font-size: 16px;">
      ${config.description}
    </p>`
  }
  
  // 组装完整HTML
  let backgroundColor = (theme === "dark") ? "rgba(133, 149, 159, 0.4)" : "rgba(233, 246, 255, 0.8)"
  let borderColor = (theme === "dark") ? "rgba(124, 141, 152, 0.4)" : "rgba(125, 140, 154, 0.8)"
  
  return `
  <div style="background: ${backgroundColor}; border: 1px solid ${borderColor}; 
    border-radius: 16px; padding: 5px; margin: 3px;">
    <div style="text-align: right;">
      <a href="${createNoteURL}" style="display: inline-block; padding: 8px;">
        ➕ 点击创建卡片
      </a>
    </div>
    <div style="text-align: center; margin: 15px 0;">
      ${titleHTML}
      ${descriptionHTML}
    </div>
    ${choices.join("")}
  </div>`
}

// 代码块替换器
function codeBlockReplacer(lang, format, code) {
  if (lang === "choiceQuestion") {
    return getQustionBlock(code)
  }
  
  let encodedContent = encodeURIComponent(code)
  
  if (lang === "userSelect") {
    let url = `userselect://choice?content=${encodedContent}`
    code = renderKaTeXFormulas(code)
    return `<div>
      <a href="${url}" style="display: block; padding: 10px 12px; margin-top: 10px; 
        background: #e3eefc; color: #1565c0; border-radius: 8px;">
        ${code.trim()}
      </a>
    </div>`
  }
  
  if (lang === "addNote") {
    let url = `userselect://addnote?content=${encodedContent}`
    if (format === "markdown") {
      url = `userselect://addnote?content=${encodedContent}&format=markdown`
      code = md2html(code)
    }
    return `<div>
      <a href="${url}" style="display: block; padding: 10px 12px; margin-top: 10px; 
        background: rgb(230, 255, 239); color: #237427; border-radius: 8px;">
        <div style="font-weight: bold; margin-bottom: 5px; font-size: 18px;">
          ➕点击创建笔记：
        </div>
        ${code.trim()}
      </a>
    </div>`
  }
  
  if (lang === "addComment") {
    let url = `userselect://addcomment?content=${encodedContent}`
    if (format === "markdown") {
      url = `userselect://addnote?content=${encodedContent}&format=markdown`
      code = md2html(code)
    }
    return `<div>
      <a href="${url}" style="display: block; padding: 10px 12px; margin-top: 10px; 
        background: rgb(230, 255, 239); color: #237427; border-radius: 8px;">
        <div style="font-weight: bold; margin-bottom: 5px; font-size: 18px;">
          ➕点击添加卡片评论：
        </div>
        ${code.trim()}
      </a>
    </div>`
  }
  
  return ""
}
```

##### 4. 特殊代码块缓存系统
```javascript
let buttonCodeBlockCache = {}
let buttonPreContent = ""

function clearCache() {
  buttonPreContent = ""
  buttonCodeBlockCache = {}
}

// 替换特殊代码块（支持缓存）
function replaceSpecialBlocks(markdown) {
  const pattern = /```(userSelect|addNote|addComment|choiceQuestion)\s*(plaintext|markdown|json)?\n([\s\S]*?)```/g
  
  const newMarkdown = markdown.replace(pattern, (match, lang, format, code) => {
    // 检查缓存
    if (match in buttonCodeBlockCache) {
      return buttonCodeBlockCache[match]
    }
    
    // 生成新内容并缓存
    let res = codeBlockReplacer(lang, format, code)
    buttonCodeBlockCache[match] = res
    return res
  })
  
  return newMarkdown
}

// 处理未完成的代码块
function replaceSpecialBlocksNotEndingWithBacktick(markdown) {
  const pattern = /```(userSelect|addNote|addComment|choiceQuestion)\s*(plaintext|markdown|json)?\n([\s\S]*?)$/g
  
  const newMarkdown = markdown.replace(pattern, (match, lang, format, code) => {
    let res = codeBlockReplacer(lang, format, code)
    
    if (res) {
      buttonPreContent = res
    } else {
      if (buttonPreContent) {
        return buttonPreContent
      }
      return ""
    }
    return res
  })
  
  return newMarkdown
}
```

##### 5. Markdown渲染系统
```javascript
// Markdown转HTML
function md2html(md) {
  md = renderKaTeXFormulas(md)
  let res = marked.parse(md.replace(/_{/g, '\\_\{').replace(/_\\/g, '\\_\\'))
  return res
}

// 设置响应内容
const setResContent = (currentResEle, content, render = true) => {
  if (render) {
    content = replaceButtonCodeBlocks(content)
    let tem = currentResEle.getElementsByClassName("markdown-body")[0]
    
    // 使用Vditor渲染
    Vditor.preview(tem, content, {
      theme: "dark",
      math: {
        engine: "MathJax",
        mathJaxOptions: {
          tex: {
            inlineMath: [['$', '$'], ["\\(", "\\)"]]
          }
        },
        inlineDigit: true
      },
      cdn: "https://unpkg.com/vditor@3.11.0"
    })
  } else {
    currentResEle.getElementsByClassName("markdown-body")[0].innerHTML = content
  }
  
  refreshLatex(currentResEle)
}
```

##### 6. JSON修复系统
```javascript
function getValidJSON(jsonString, debug = false) {
  try {
    if (typeof jsonString === "object") {
      return jsonString
    }
    return JSON.parse(jsonString)
  } catch (error) {
    try {
      // 使用jsonrepair库修复
      return JSON.parse(jsonrepair(jsonString))
    } catch (error) {
      let errorString = error.toString()
      try {
        // 尝试修复缺少结束括号的情况
        if (errorString.startsWith("Unexpected character \"{\" at position")) {
          return JSON.parse(jsonrepair(jsonString + "}"))
        }
        return {}
      } catch (error) {
        debug && this.addErrorLog(error, "getValidJSON", jsonString)
        return {}
      }
    }
  }
}
```

##### 7. 消息内容处理
```javascript
// 获取文本内容
function getTextContent(message) {
  if ("content" in message) {
    if (Array.isArray(message.content)) {
      let textContent = message.content.find(item => {
        return item.type === "text"
      })
      if (textContent) {
        return textContent.text
      }
      return undefined
    } else {
      return message.content
    }
  } else {
    return undefined
  }
}

// 获取图片内容
function getImageContent(message) {
  if ("content" in message) {
    if (Array.isArray(message.content)) {
      let imageContent = message.content.find(item => {
        return item.type === "image_url"
      })
      if (imageContent) {
        return imageContent.image_url.url
      }
      return undefined
    } else {
      return undefined
    }
  } else {
    return undefined
  }
}

// 获取所有图片内容
function getImageContents(message) {
  let imageURLs = []
  if ("content" in message) {
    if (Array.isArray(message.content)) {
      message.content.forEach(item => {
        if (item.type === "image_url") {
          imageURLs.push(item.image_url.url)
        }
      })
    }
  }
  return imageURLs
}
```

##### 8. 通知系统
```javascript
function postNotificataion(title, body, encode = true) {
  let notification = "chataction://" + title
  
  if (body) {
    if (encode) {
      notification = notification + "?content=" + encodeURIComponent(body)
    } else {
      notification = notification + "?content=" + body
    }
  }
  
  if (mnMode) {
    window.location.href = notification
  }
}

function showError(content) {
  postNotificataion("showError", "Error: " + content)
}
```

##### 9. 工具函数
```javascript
// 复制文本
const copy = (text) => {
  const input = document.createElement("textarea")
  input.value = text
  document.body.appendChild(input)
  input.select()
  input.setSelectionRange(0, input.value.length)
  document.execCommand("copy")
  document.body.removeChild(input)
}

// HTML转义
function escapeHTML(e) {
  return e.replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

// 获取完整历史索引
function getIndicesInFullHistory(params) {
  let indicesInFullHistory = []
  
  data.forEach((item, index) => {
    if (item.role === "system") {
      indicesInFullHistory.push(index)
      return
    }
    if (item.role === "user") {
      indicesInFullHistory.push(index)
      return
    }
    if (item.role === "assistant") {
      if ("tool_calls" in item) {
        return
      }
      indicesInFullHistory.push(index)
      return
    }
  })
  
  return indicesInFullHistory
}
```

#### 创新设计特点

##### 1. 智能代码块系统
- 支持4种特殊代码块类型（choiceQuestion、userSelect、addNote、addComment）
- 自动生成交互式卡片界面
- 支持Markdown和JSON格式
- URL Scheme深度集成

##### 2. 缓存优化机制
- 代码块渲染结果缓存
- 未完成代码块预渲染
- 避免重复渲染提升性能

##### 3. 错误容错处理
- JSON自动修复
- KaTeX公式错误捕获
- 降级渲染策略

##### 4. 主题自适应
- 深色/浅色主题自动切换
- 动态颜色计算
- 统一的样式管理

#### 关键特性总结

1. **统一API封装**：支持10+主流AI模型的统一接口
2. **数学公式渲染**：完整的KaTeX集成，支持行内和块级公式
3. **交互式内容**：4种特殊代码块生成可点击的卡片
4. **智能缓存**：渲染结果缓存提升性能
5. **错误处理**：JSON修复、公式错误捕获等容错机制
6. **主题适配**：深色/浅色主题自动切换

## 架构总结

### 四控制器协作机制

MNAI 插件采用创新的四控制器架构，每个控制器负责特定功能领域：

```
┌─────────────────────────────────────────────────┐
│                  主控制器 (main.js)               │
│         协调管理、事件分发、生命周期控制               │
└─────────────┬───────────────────────────────────┘
              │
    ┌─────────┴─────────┬─────────┬──────────┐
    ▼                   ▼         ▼          ▼
┌──────────┐    ┌──────────┐ ┌──────────┐ ┌──────────┐
│webview   │    │notifica  │ │dynamic   │ │sideOutput│
│Controller│    │Controller│ │Controller│ │Controller│
├──────────┤    ├──────────┤ ├──────────┤ ├──────────┤
│设置界面   │    │对话通知   │ │快速输入   │ │侧边聊天  │
│配置管理   │    │流式响应   │ │智能触发   │ │会话管理  │
│148个方法  │    │63个方法   │ │47个方法   │ │80个方法  │
└──────────┘    └──────────┘ └──────────┘ └──────────┘
```

### 技术栈总结

#### 前端技术
- **UI框架**：UIKit + WebView混合架构
- **样式系统**：Tailwind CSS
- **Markdown渲染**：Vditor + marked.js
- **数学公式**：KaTeX + MathJax
- **代码高亮**：highlight.js

#### 核心系统
- **网络请求**：NSURLConnection（流式响应）
- **事件系统**：NSNotificationCenter
- **配置管理**：NSUserDefaults + iCloud同步
- **手势识别**：UIPanGestureRecognizer

#### AI集成
- **模型支持**：OpenAI、Claude、Gemini、国产模型等10+
- **Function Calling**：20+内置工具
- **流式输出**：SSE协议完整实现
- **智能模式**：OCR、视觉、普通模式自动切换

### 设计模式应用

1. **MVC架构**：控制器、视图、数据模型分离
2. **观察者模式**：NSNotificationCenter事件系统
3. **单例模式**：配置管理、工具类单例
4. **策略模式**：不同AI模型的处理策略
5. **工厂模式**：按钮创建、菜单构建工厂
6. **装饰器模式**：WebView功能增强

### 创新亮点

1. **四控制器分离**：功能解耦，职责明确
2. **多层次UI**：浮动、通知、侧边栏多种形态
3. **智能触发**：根据上下文自动判断需要的功能
4. **完整工具系统**：Function Calling深度集成
5. **流式响应**：完整的SSE协议实现
6. **交互式内容**：特殊代码块生成可点击卡片

## 总结

MNAI 插件通过 31,043 行精心设计的代码，实现了一个功能完整、体验优秀的 AI 对话系统。其四控制器架构设计新颖，各个模块职责明确，代码质量高，错误处理完善，是 MarginNote 插件开发的优秀范例。

### 核心数据统计
- **总代码量**：31,043 行（核心代码 29,739 行，含第三方库总计 424,500 行）
- **控制器数量**：4 个
- **总方法数**：338+ 个
- **支持AI模型**：10+ 种
- **内置工具**：20+ 个
- **配置项**：100+ 个

### 技术特色
- 完整的流式响应处理
- 智能的模式切换机制
- 丰富的UI交互形式
- 完善的错误处理系统
- 高度的可扩展性设计

MNAI 插件展示了如何在 MarginNote 平台上构建一个专业级的 AI 应用，值得深入学习和参考。

```javascript
const AI_MODELS = {
  // OpenAI 系列
  'gpt-3.5-turbo': { provider: 'openai', streaming: true },
  'gpt-4': { provider: 'openai', streaming: true },
  'gpt-4-turbo': { provider: 'openai', streaming: true },
  
  // 国产模型
  'chatglm-6b': { provider: 'zhipu', streaming: true },
  'ernie-bot': { provider: 'baidu', streaming: false },
  'qwen-turbo': { provider: 'alibaba', streaming: true },
  
  // 开源模型
  'llama-2': { provider: 'local', streaming: true },
  'claude-2': { provider: 'anthropic', streaming: true }
}
```

### API 请求封装

```javascript
// api.js - 统一的 API 接口
class AIService {
  static async chat(messages, model, options = {}) {
    const provider = AI_MODELS[model].provider
    
    switch(provider) {
      case 'openai':
        return this.chatWithOpenAI(messages, model, options)
      case 'zhipu':
        return this.chatWithZhipu(messages, model, options)
      // ... 其他提供商
    }
  }
  
  static async chatWithOpenAI(messages, model, options) {
    const request = MNConnection.initRequestForChatGPT(
      messages,
      options.apiKey,
      'https://api.openai.com/v1/chat/completions',
      model,
      options.temperature || 0.7
    )
    
    if (options.streaming) {
      return this.handleStreamResponse(request)
    } else {
      return this.handleNormalResponse(request)
    }
  }
  
  static handleStreamResponse(request) {
    // SSE (Server-Sent Events) 处理
    return new Promise((resolve, reject) => {
      let fullResponse = ''
      
      const connection = NSURLConnection.alloc().initWithRequest(
        request,
        self,
        true
      )
      
      // 处理流式数据
      self.didReceiveData = (data) => {
        const chunk = this.parseSSEChunk(data)
        fullResponse += chunk
        // 实时更新 UI
        this.updateUI(chunk)
      }
      
      self.connectionDidFinishLoading = () => {
        resolve(fullResponse)
      }
    })
  }
}
```

### 多模态支持

```javascript
// 图片识别支持
class VisionService {
  static async analyzeImage(imageData, prompt) {
    const base64Image = this.imageToBase64(imageData)
    
    const messages = [{
      role: 'user',
      content: [
        { type: 'text', text: prompt },
        { 
          type: 'image_url', 
          image_url: { url: `data:image/jpeg;base64,${base64Image}` }
        }
      ]
    }]
    
    return AIService.chat(messages, 'gpt-4-vision')
  }
}

// 音频转文字
class AudioService {
  static async transcribe(audioData) {
    const formData = new FormData()
    formData.append('file', audioData)
    formData.append('model', 'whisper-1')
    
    return MNConnection.fetch(
      'https://api.openai.com/v1/audio/transcriptions',
      { method: 'POST', body: formData }
    )
  }
}
```

## WebView 交互系统

### HTML 与原生通信

```javascript
// HTML → Native
// 使用 URL Scheme
window.location.href = 'mnchat://action?param=' + encodeURIComponent(data)

// 使用 postMessage
window.webkit.messageHandlers.chat.postMessage({
  action: 'sendMessage',
  data: messageContent
})

// Native → HTML
// 执行 JavaScript
webView.evaluateJavaScript(`
  app.receiveMessage(${JSON.stringify(message)})
`)
```

### Vue.js 集成

```javascript
// app.js - Vue 应用
const app = new Vue({
  el: '#app',
  data: {
    messages: [],
    currentInput: '',
    isLoading: false,
    selectedModel: 'gpt-3.5-turbo',
    settings: {}
  },
  
  methods: {
    async sendMessage() {
      if (!this.currentInput.trim()) return
      
      // 添加用户消息
      this.messages.push({
        role: 'user',
        content: this.currentInput,
        timestamp: Date.now()
      })
      
      // 清空输入
      const userInput = this.currentInput
      this.currentInput = ''
      this.isLoading = true
      
      // 调用原生 API
      window.location.href = 
        `mnchat://send?text=${encodeURIComponent(userInput)}`
    },
    
    // 接收原生回调
    receiveMessage(message) {
      this.messages.push({
        role: 'assistant',
        content: message.content,
        timestamp: Date.now()
      })
      this.isLoading = false
      this.scrollToBottom()
    },
    
    scrollToBottom() {
      this.$nextTick(() => {
        const container = this.$refs.messageContainer
        container.scrollTop = container.scrollHeight
      })
    }
  }
})

// 暴露给原生调用
window.app = app
```

### Markdown 渲染

```javascript
// 集成 marked.js 和 KaTeX
class MarkdownRenderer {
  static render(text) {
    // 配置 marked
    marked.setOptions({
      highlight: (code, lang) => {
        return hljs.highlightAuto(code, [lang]).value
      },
      breaks: true,
      gfm: true
    })
    
    // 渲染 Markdown
    let html = marked(text)
    
    // 渲染数学公式
    html = this.renderMath(html)
    
    // 渲染 Mermaid 图表
    html = this.renderMermaid(html)
    
    return html
  }
  
  static renderMath(html) {
    // 行内公式 $...$
    html = html.replace(/\$([^\$]+)\$/g, (match, formula) => {
      return katex.renderToString(formula, { 
        throwOnError: false 
      })
    })
    
    // 块级公式 $$...$$
    html = html.replace(/\$\$([^\$]+)\$\$/g, (match, formula) => {
      return katex.renderToString(formula, { 
        displayMode: true,
        throwOnError: false 
      })
    })
    
    return html
  }
  
  static renderMermaid(html) {
    // 查找 mermaid 代码块
    const mermaidRegex = /```mermaid\n([\s\S]*?)```/g
    
    html = html.replace(mermaidRegex, (match, code) => {
      const id = 'mermaid-' + Date.now()
      // 异步渲染
      setTimeout(() => {
        mermaid.render(id, code, (svg) => {
          document.getElementById(id).innerHTML = svg
        })
      }, 0)
      return `<div id="${id}" class="mermaid-container"></div>`
    })
    
    return html
  }
}
```

## 关键功能实现

### 1. 对话管理

```javascript
class ChatManager {
  static conversations = new Map()
  static currentId = null
  
  static createConversation(title = 'New Chat') {
    const id = NSUUID.UUID().UUIDString()
    const conversation = {
      id: id,
      title: title,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      model: 'gpt-3.5-turbo',
      temperature: 0.7
    }
    
    this.conversations.set(id, conversation)
    this.currentId = id
    this.save()
    
    return conversation
  }
  
  static addMessage(role, content) {
    const conversation = this.getCurrentConversation()
    if (!conversation) return
    
    conversation.messages.push({
      role: role,
      content: content,
      timestamp: Date.now()
    })
    
    conversation.updatedAt = Date.now()
    this.save()
  }
  
  static getCurrentConversation() {
    return this.conversations.get(this.currentId)
  }
  
  static save() {
    const data = Array.from(this.conversations.entries())
    NSUserDefaults.standardUserDefaults()
      .setObjectForKey(data, 'mnai.conversations')
  }
  
  static load() {
    const data = NSUserDefaults.standardUserDefaults()
      .objectForKey('mnai.conversations')
    if (data) {
      this.conversations = new Map(data)
    }
  }
}
```

### 2. 笔记集成

```javascript
class NoteIntegration {
  // 从笔记生成提示
  static generatePromptFromNote(note) {
    let prompt = ''
    
    // 添加标题
    if (note.noteTitle) {
      prompt += `标题：${note.noteTitle}\n\n`
    }
    
    // 添加摘录
    if (note.excerptText) {
      prompt += `摘录：${note.excerptText}\n\n`
    }
    
    // 添加评论
    if (note.comments && note.comments.length > 0) {
      prompt += '评论：\n'
      note.comments.forEach((comment, index) => {
        prompt += `${index + 1}. ${comment.text}\n`
      })
    }
    
    return prompt
  }
  
  // 将 AI 响应添加到笔记
  static addResponseToNote(note, response) {
    // 创建 AI 标记的评论
    const aiComment = {
      type: 'TextNote',
      text: `🤖 AI: ${response}`,
      createDate: Date.now()
    }
    
    note.appendComment(aiComment)
    
    // 刷新显示
    MNUtil.refresh()
  }
  
  // 批量处理笔记
  static async processNotes(notes, prompt) {
    const results = []
    
    for (const note of notes) {
      const notePrompt = this.generatePromptFromNote(note)
      const fullPrompt = `${prompt}\n\n${notePrompt}`
      
      const response = await AIService.chat(
        [{ role: 'user', content: fullPrompt }],
        'gpt-3.5-turbo'
      )
      
      results.push({
        note: note,
        response: response
      })
      
      // 更新进度
      MNUtil.showHUD(`处理中... ${results.length}/${notes.length}`)
    }
    
    return results
  }
}
```

### 3. 智能功能

```javascript
class SmartFeatures {
  // 自动总结
  static async summarize(text, style = 'concise') {
    const prompts = {
      concise: '请用 3-5 句话简洁总结以下内容：',
      detailed: '请详细总结以下内容，包括要点和细节：',
      bullet: '请用要点形式总结以下内容：'
    }
    
    const response = await AIService.chat([
      { role: 'system', content: '你是一个专业的总结助手' },
      { role: 'user', content: `${prompts[style]}\n\n${text}` }
    ], 'gpt-3.5-turbo')
    
    return response
  }
  
  // 智能问答
  static async askQuestion(context, question) {
    const response = await AIService.chat([
      { role: 'system', content: '基于提供的上下文回答问题' },
      { role: 'user', content: `上下文：${context}\n\n问题：${question}` }
    ], 'gpt-3.5-turbo')
    
    return response
  }
  
  // 翻译
  static async translate(text, targetLang = 'en') {
    const languages = {
      en: '英文',
      zh: '中文',
      ja: '日文',
      fr: '法文',
      de: '德文'
    }
    
    const response = await AIService.chat([
      { role: 'system', content: '你是一个专业的翻译助手' },
      { role: 'user', content: `请将以下内容翻译成${languages[targetLang]}：\n\n${text}` }
    ], 'gpt-3.5-turbo')
    
    return response
  }
  
  // 续写
  static async continueWriting(text, style = 'same') {
    const prompts = {
      same: '请保持相同的风格继续写下去：',
      formal: '请用正式的学术风格继续：',
      creative: '请用创意的方式继续：'
    }
    
    const response = await AIService.chat([
      { role: 'user', content: `${prompts[style]}\n\n${text}` }
    ], 'gpt-3.5-turbo')
    
    return response
  }
}
```

### 4. 快捷操作

```javascript
class QuickActions {
  static actions = [
    {
      name: '总结',
      icon: '📝',
      handler: (text) => SmartFeatures.summarize(text)
    },
    {
      name: '翻译',
      icon: '🌐',
      handler: (text) => SmartFeatures.translate(text)
    },
    {
      name: '解释',
      icon: '💡',
      handler: (text) => this.explain(text)
    },
    {
      name: '改写',
      icon: '✏️',
      handler: (text) => this.rewrite(text)
    },
    {
      name: '扩展',
      icon: '📚',
      handler: (text) => this.expand(text)
    }
  ]
  
  static async explain(text) {
    return AIService.chat([
      { role: 'system', content: '用简单易懂的语言解释概念' },
      { role: 'user', content: `请解释：${text}` }
    ], 'gpt-3.5-turbo')
  }
  
  static async rewrite(text) {
    return AIService.chat([
      { role: 'user', content: `请用不同的方式改写：\n${text}` }
    ], 'gpt-3.5-turbo')
  }
  
  static async expand(text) {
    return AIService.chat([
      { role: 'user', content: `请扩展以下内容，添加更多细节：\n${text}` }
    ], 'gpt-3.5-turbo')
  }
  
  // 注册到 UI
  static registerToUI() {
    this.actions.forEach(action => {
      const button = MNButton.new({
        title: action.icon + ' ' + action.name,
        action: () => {
          const text = MNUtil.selectionText
          if (text) {
            action.handler(text).then(result => {
              // 显示结果
              this.showResult(result)
            })
          }
        }
      })
      
      // 添加到快捷操作栏
      QuickActionBar.addButton(button)
    })
  }
}
```

## 设计模式与最佳实践

### 设计模式应用

#### 1. 单例模式
```javascript
class ChatController {
  static instance = null
  
  static getInstance() {
    if (!this.instance) {
      this.instance = new ChatController()
    }
    return this.instance
  }
}
```

#### 2. 观察者模式
```javascript
class EventBus {
  static listeners = new Map()
  
  static on(event, handler) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event).push(handler)
  }
  
  static emit(event, data) {
    const handlers = this.listeners.get(event)
    if (handlers) {
      handlers.forEach(handler => handler(data))
    }
  }
}
```

#### 3. 策略模式
```javascript
class ModelStrategy {
  static strategies = {
    'gpt-3.5-turbo': new OpenAIStrategy(),
    'chatglm-6b': new ChatGLMStrategy(),
    'ernie-bot': new ErnieStrategy()
  }
  
  static execute(model, messages, options) {
    const strategy = this.strategies[model]
    return strategy.chat(messages, options)
  }
}
```

#### 4. 装饰器模式
```javascript
// 添加重试机制
function withRetry(fn, maxRetries = 3) {
  return async function(...args) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn.apply(this, args)
      } catch (error) {
        if (i === maxRetries - 1) throw error
        await MNUtil.delay(Math.pow(2, i)) // 指数退避
      }
    }
  }
}

// 使用
const chatWithRetry = withRetry(AIService.chat)
```

### 性能优化

#### 1. 防抖与节流
```javascript
// 防抖：输入框
const debouncedInput = MNUtil.debounce((text) => {
  // 处理输入
}, 500)

// 节流：滚动加载
const throttledScroll = MNUtil.throttle(() => {
  // 加载更多
}, 200)
```

#### 2. 虚拟列表
```javascript
// 只渲染可见区域的消息
class VirtualList {
  constructor(container, itemHeight) {
    this.container = container
    this.itemHeight = itemHeight
    this.visibleRange = { start: 0, end: 0 }
  }
  
  updateVisibleRange() {
    const scrollTop = this.container.scrollTop
    const containerHeight = this.container.clientHeight
    
    this.visibleRange.start = Math.floor(scrollTop / this.itemHeight)
    this.visibleRange.end = Math.ceil(
      (scrollTop + containerHeight) / this.itemHeight
    )
  }
  
  render(items) {
    const visibleItems = items.slice(
      this.visibleRange.start,
      this.visibleRange.end
    )
    // 只渲染可见项
    this.renderItems(visibleItems)
  }
}
```

#### 3. 缓存策略
```javascript
class ResponseCache {
  static cache = new Map()
  static maxSize = 100
  
  static getCacheKey(messages, model) {
    return CryptoJS.MD5(
      JSON.stringify({ messages, model })
    ).toString()
  }
  
  static get(messages, model) {
    const key = this.getCacheKey(messages, model)
    return this.cache.get(key)
  }
  
  static set(messages, model, response) {
    if (this.cache.size >= this.maxSize) {
      // LRU 淘汰
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }
    
    const key = this.getCacheKey(messages, model)
    this.cache.set(key, {
      response: response,
      timestamp: Date.now()
    })
  }
}
```

### 错误处理

```javascript
class ErrorHandler {
  static handle(error, context) {
    // 分类处理
    if (error.code === 'NETWORK_ERROR') {
      this.handleNetworkError(error)
    } else if (error.code === 'API_ERROR') {
      this.handleAPIError(error)
    } else if (error.code === 'QUOTA_EXCEEDED') {
      this.handleQuotaError(error)
    } else {
      this.handleUnknownError(error)
    }
    
    // 记录日志
    MNUtil.addErrorLog(error, 'MNAI', context)
  }
  
  static handleNetworkError(error) {
    MNUtil.showHUD('网络连接失败，请检查网络设置')
    // 尝试使用离线模式
    this.switchToOfflineMode()
  }
  
  static handleAPIError(error) {
    const messages = {
      401: 'API Key 无效，请检查设置',
      429: '请求过于频繁，请稍后再试',
      500: '服务器错误，请稍后再试'
    }
    
    MNUtil.showHUD(messages[error.status] || '请求失败')
  }
  
  static handleQuotaError(error) {
    MNUtil.confirm(
      '配额已用完',
      '是否前往充值页面？',
      ['取消', '充值']
    ).then(result => {
      if (result === 1) {
        MNUtil.openURL('https://platform.openai.com/account/billing')
      }
    })
  }
}
```

### 安全性考虑

```javascript
class Security {
  // API Key 加密存储
  static encryptAPIKey(key) {
    return CryptoJS.AES.encrypt(key, this.getDeviceId()).toString()
  }
  
  static decryptAPIKey(encrypted) {
    const bytes = CryptoJS.AES.decrypt(encrypted, this.getDeviceId())
    return bytes.toString(CryptoJS.enc.Utf8)
  }
  
  // 输入验证
  static sanitizeInput(input) {
    // 移除潜在的注入代码
    return input
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
  }
  
  // 敏感信息过滤
  static filterSensitiveInfo(text) {
    // 过滤个人信息
    const patterns = [
      /\b\d{3}-\d{2}-\d{4}\b/g,  // SSN
      /\b\d{16}\b/g,              // 信用卡
      /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g  // Email
    ]
    
    patterns.forEach(pattern => {
      text = text.replace(pattern, '[已隐藏]')
    })
    
    return text
  }
}
```

## main.js 深度分析（1,375行）

### 文件结构概览

```javascript
// 1. 全局标志位（行1-3）
// 2. 插件入口函数 JSB.newAddon（行4-32）
// 3. 类定义 MNChatglmClass（行33-1264）
//    - 实例方法（行35-1211）
//    - 类方法（行1213-1264）  
// 4. 原型扩展（行1265-1368）
// 5. 返回类定义（行1375）
```

### 1. 插件初始化流程（行4-32）

```javascript
JSB.newAddon = function (mainPath) {
  // 1. 加载核心工具库
  JSB.require('utils')
  
  // 2. 检查 MNUtils 依赖
  if (!chatAIUtils.checkMNUtilsFolder(mainPath)) { 
    return undefined 
  }
  
  // 3. 加载四大控制器
  JSB.require('webviewController')
  JSB.require('notificationController')
  JSB.require('dynamicController')
  JSB.require('sideOutputController')
  
  // 4. 加载 JSON 修复库
  if (typeof jsonrepair === 'undefined') {
    JSB.require('jsonrepair')
  }
  
  // 5. 定义主类
  var MNChatglmClass = JSB.defineClass('MNChatglm : JSExtension', {...})
  
  return MNChatglmClass
}
```

**关键设计**：
- 模块化加载，按需引入
- 依赖检查机制，确保 MNUtils 存在
- 四控制器独立文件，便于维护

### 2. 生命周期方法实现

#### 2.1 窗口生命周期（行36-84）

```javascript
sceneWillConnect: async function() {
  // 窗口初始化
  // 1. 检查 MNUtil 可用性
  // 2. 初始化插件状态
  // 3. 注册 14 个事件监听器
  // 4. 设置初始状态变量
}

sceneDidDisconnect: function() {
  // 窗口断开，移除所有监听器
}

sceneWillResignActive: function() {
  // 窗口失去焦点（空实现）
}

sceneDidBecomeActive: function() {
  // 窗口获得焦点（空实现）
}
```

#### 2.2 笔记本生命周期（行86-137）

```javascript
notebookWillOpen: async function(notebookid) {
  // 1. 初始化控制器
  // 2. 自动导入配置
  // 3. 刷新模型配置（每日一次）
  // 4. 刷新插件命令
}

notebookWillClose: function(notebookid) {
  // 取消网络连接，清理资源
}

documentDidOpen: function(docmd5) {
  // 文档打开（空实现）
}

documentWillClose: function(docmd5) {
  // 文档关闭（空实现）
}
```

### 3. 核心事件监听器分析

#### 3.1 选中文本事件（行191-241）
```javascript
onPopupMenuOnSelection: async function(sender) {
  // 1. 获取选中文本
  chatAIUtils.currentSelection = sender.userInfo.documentController.selectionText
  
  // 2. 计算悬浮球位置
  let winFrame = MNUtil.parseWinRect(sender.userInfo.winRect)
  let xOffset = sender.userInfo.arrow === 1 ? 20 : -80
  let yOffset = sender.userInfo.arrow === 1 ? -60 : -30
  
  // 3. 显示悬浮控制器
  await self.checkDynamicController(dynamicFrame)
  
  // 4. 智能触发判断
  if (!self.checkShouldProceed(chatAIUtils.currentSelection, -1, "onSelection")) {
    return
  }
  
  // 5. 触发 AI 对话
  chatAIUtils.chatController.askWithDelay()
}
```

#### 3.2 笔记点击事件（行320-403）
```javascript
onPopupMenuOnNote: async function(sender) {
  // 1. 获取笔记内容
  let note = MNNote.new(sender.userInfo.note.noteId)
  let text = await chatAIUtils.getTextForSearch(note)
  
  // 2. 防重复触发机制
  let sameQuestion = (JSON.stringify(question) === JSON.stringify(self.lastQuestion))
  if (!chatAIUtils.notifyController.view.hidden && sameQuestion) {
    return
  }
  
  // 3. 颜色过滤
  if (!self.checkShouldProceed(text, note.colorIndex + 16, "onNote")) {
    return
  }
  
  // 4. 触发对话
  chatAIUtils.chatController.askWithDelay()
}
```

#### 3.3 新摘录处理（行274-319）
```javascript
onProcessNewExcerpt: async function(sender) {
  let note = MNNote.new(sender.userInfo.noteid)
  
  // 标签检测功能
  if (chatAIConfig.getConfig("newExcerptTagDetection")) {
    let promptKeys = chatAIConfig.config.promptNames
    let commonPrompts = chatAIUtils.findCommonElements(note.tags, promptNames)
    
    if (commonPrompts.length) {
      // 自动执行匹配的 Prompt
      let promptKey = chatAIUtils.findKeyByTitle(chatAIConfig.prompts, firstPrompt)
      chatAIUtils.chatController.askWithDelay(promptKey)
    }
  }
}
```

### 4. URL Scheme 支持（行430-731）

MNAI 支持丰富的 URL Scheme 调用：

```javascript
onAddonBroadcast: async function(sender) {
  let message = "marginnote4app://addon/" + sender.userInfo.message
  let config = MNUtil.parseURL(message)
  
  switch(config.params.action) {
    case "ask":
      // marginnote4app://addon/mnchatai?action=ask&user={query}
      // 支持 mode=vision（视觉分析）和 mode=ocr（文字识别）
      break
      
    case "executeprompt":
      // marginnote4app://addon/mnchatai?action=executeprompt&prompt={name}
      // 执行指定的 Prompt
      break
      
    case "opensetting":
      // 打开设置界面
      break
      
    case "togglesidebar":
      // 切换侧边栏（仅 MN4）
      break
      
    case "importprompt":
      // 导入新的 Prompt 配置
      break
  }
}
```

### 5. 智能触发系统（行1286-1317）

```javascript
checkShouldProceed: function(text, colorIndex = -1, param = "") {
  // 多重检查机制
  
  // 1. 基础条件检查
  if (!chatAIUtils.chatController.view.window || !chatAIConfig.config.autoAction) {
    return false
  }
  
  // 2. 参数检查
  if (param !== "" && !chatAIConfig.config[param]) {
    return false
  }
  
  // 3. 聊天模式检查
  if (chatAIUtils.notifyController.onChat) {
    return false
  }
  
  // 4. 颜色过滤
  if (colorIndex !== -1 && !chatAIConfig.getConfig("colorConfig")[colorIndex]) {
    return false
  }
  
  // 5. 短文本过滤
  if (chatAIConfig.config.ignoreShortText && chatAIUtils.countWords(text) < 10) {
    return false
  }
  
  return true
}
```

### 6. 视图布局管理（行139-177）

```javascript
controllerWillLayoutSubviews: function(controller) {
  // 1. 主聊天窗口位置约束
  if (!chatAIUtils.chatController.view.hidden) {
    let currentFrame = chatAIUtils.chatController.currentFrame
    currentFrame.x = MNUtil.constrain(currentFrame.x, 0, studyFrame.width - currentFrame.width)
    currentFrame.y = MNUtil.constrain(currentFrame.y, 0, studyFrame.height - 20)
  }
  
  // 2. 通知窗口自适应
  if (!chatAIUtils.notifyController.view.hidden && !chatAIUtils.notifyController.onAnimate) {
    currentFrame.height = Math.min(currentFrame.height, windowFrame.height - currentFrame.y)
    currentFrame.y = chatAIUtils.getY()  // 根据配置获取位置
    currentFrame.x = chatAIUtils.getX()
  }
  
  // 3. MN4 侧边栏适配
  if (chatAIUtils.isMN4() && MNExtensionPanel.on && chatAIUtils.sideOutputController) {
    chatAIUtils.sideOutputController.view.frame = {
      x: 0, y: 0, 
      width: MNExtensionPanel.width, 
      height: MNExtensionPanel.height
    }
  }
}
```

### 7. 工具栏集成（行1092-1211）

```javascript
toggleAddon: async function(button) {
  // 构建命令菜单
  var commandTable = [
    {title: '⚙️   Setting', object: self, selector: 'openSetting:', param: [1,2,3]},
    {title: '🤖   Float Window', object: self, selector: 'openFloat:', param: beginFrame},
    {title: '💬   Chat Mode', object: self, selector: 'openSideBar:', param: [1,3,2]},
    {title: '🔄   Manual Sync', object: self, selector: 'syncConfig:', param: [1,2,3]},
    {title: '↔️   Location: ' + (chatAIConfig.config.notifyLoc ? "Right" : "Left"), 
     object: self, selector: "toggleWindowLocation:", param: chatAIConfig.config.notifyLoc}
  ]
  
  // 添加 Prompt 快捷方式（最多5个）
  let promptKeys = chatAIConfig.config.promptNames
  if (promptKeys.length > 5) {
    promptKeys = promptKeys.slice(0, 5)
  }
  
  let promptTable = promptKeys.map(key => {
    return {
      title: "🚀   " + chatAIConfig.prompts[key].title,
      object: self,
      selector: 'executePrompt:',
      param: key
    }
  })
  
  commandTable = commandTable.concat(promptTable)
  
  // 显示弹出菜单
  self.popoverController = chatAIUtils.getPopoverAndPresent(button, commandTable, 200, 4)
}
```

### 8. 关键设计模式

#### 8.1 单例模式
```javascript
const getMNChatglmClass = () => self  // 行22
```

#### 8.2 观察者模式
```javascript
// 原型方法扩展（行1272-1285）
MNChatglmClass.prototype.addObserver = function(selector, name) {
  NSNotificationCenter.defaultCenter().addObserverSelectorName(this, selector, name)
}

MNChatglmClass.prototype.removeObservers = function(names) {
  names.forEach(name => {
    NSNotificationCenter.defaultCenter().removeObserverName(self, name)
  })
}
```

#### 8.3 防抖机制
```javascript
// 时间间隔检查（行408）
if (Date.now() - self.dateGetText < 500) {
  chatAIUtils.notifyController.notShow = true
  return
}

// 相同问题检查（行392-397）
let sameQuestion = (question === self.lastQuestion)
if (!chatAIUtils.notifyController.view.hidden && sameQuestion) {
  return
}
```

### 9. 技术亮点

1. **完整的生命周期管理**：8个生命周期方法覆盖所有场景
2. **智能触发系统**：5层过滤机制，精确控制触发条件
3. **防重复机制**：时间间隔 + 内容对比双重保护
4. **URL Scheme 支持**：5种 action，支持外部调用
5. **视图自适应**：自动调整位置，防止超出边界
6. **错误处理**：每个关键方法都有 try-catch 保护

## utils.js 深度分析（11,336行）

### 文件结构概览

utils.js 是 MNAI 插件的核心工具库，包含 4 个主要类，提供了 500+ 个方法：

```javascript
// 1. chatAITool 类（行1-2791）- AI工具系统
// 2. chatAIUtils 类（行2792-7385）- 核心工具类
// 3. chatAIConfig 类（行7386-10316）- 配置管理系统
// 4. chatAINetwork 类（行10317-11336）- 网络请求封装
```

### 1. chatAITool 类 - AI 工具系统（2,791行）

#### 1.1 核心功能
chatAITool 实现了 AI 函数调用（Function Calling）系统，支持 20+ 种工具：

```javascript
class chatAITool {
  // 工具定义
  name         // 工具名称
  args         // 参数定义
  description  // 工具描述
  needNote     // 是否需要笔记上下文
  
  // 执行方法
  async execute(func, noteId, onChat) {
    // 统一的工具执行入口
  }
}
```

#### 1.2 支持的工具列表

```javascript
// 笔记操作工具
- createMindmap      // 创建思维导图
- editNote          // 编辑笔记
- addNote           // 添加笔记
- addComment        // 添加评论
- organizeNotes     // 整理笔记
- searchNotes       // 搜索笔记

// 用户交互工具
- userSelect        // 用户选择
- userConfirm       // 用户确认
- userInput         // 用户输入

// 知识管理工具
- knowledge         // 知识库操作
- searchInWeb       // 网络搜索
- fetchWebpage      // 获取网页

// 内容生成工具
- generateImage     // 生成图片
- createHTML        // 创建HTML
- createMermaidChart// 创建流程图

// 卡片操作工具
- addFlashCard      // 添加闪卡
- toggleLink        // 切换链接
- changeColor       // 改变颜色
- moveNote          // 移动笔记
```

#### 1.3 工具执行流程

```javascript
async execute(func, noteId = undefined, onChat = false) {
  // 1. 获取笔记上下文
  let note = MNNote.new(noteId)?.realGroupNoteForTopicId()
  
  // 2. 参数验证
  let checkRes = this.checkArgs(args, func.id)
  if (checkRes.onError) return checkRes.errorMessage
  
  // 3. 执行具体工具
  switch (funcName) {
    case "createMindmap":
      response = this.createMindmap(func, args, note)
      break
    case "searchNotes":
      response = await this.searchNotes(func, args)
      break
    // ... 其他工具
  }
  
  // 4. 返回结果
  return {
    toolMessages: chatAITool.genToolMessage(response, func.id),
    description: this.codifyToolCall(args, true)
  }
}
```

### 2. chatAIUtils 类 - 核心工具类（4,593行）

#### 2.1 类结构
chatAIUtils 是整个插件的核心工具类，提供 200+ 个静态方法：

```javascript
class chatAIUtils {
  // 控制器管理
  static chatController
  static notifyController
  static dynamicController
  static sideOutputController
  
  // 状态管理
  static currentSelection  // 当前选中文本
  static currentNoteId    // 当前笔记ID
  static focusWindow      // 焦点窗口
  
  // 工具实例
  static toolInstances = {}  // 工具实例缓存
}
```

#### 2.2 核心方法分类

##### 控制器管理方法
```javascript
static ensureChatAIController()    // 确保主控制器存在
static ensureNotifyController()    // 确保通知控制器存在
static initDynamicController()     // 初始化悬浮球控制器
static ensureView(view)            // 确保视图添加到正确位置
```

##### 文本处理方法
```javascript
static async getTextForSearch(note)     // 获取搜索文本
static countWords(text)                 // 统计字数
static extractTagsFromNote(note)        // 提取标签
static mergeWhitespace(str)            // 合并空白字符
static replaceBase64ImagesWithTemplate(text) // 替换Base64图片
```

##### AI 交互方法
```javascript
static async render(text, vars)         // 渲染模板
static genUserMessage(text, images)     // 生成用户消息
static getValidJSON(text)               // 解析JSON
static async getTextVarInfo(template)   // 获取变量信息
```

##### 搜索功能
```javascript
static async searchInCurrentStudySets(searchTexts)  // 当前学习集搜索
static async searchInAllStudySets(searchTexts)      // 所有学习集搜索
static async searchInWebAPI(query)                  // 网络搜索
```

##### 工具注册系统
```javascript
static registerDefaultTools() {
  // 注册所有默认工具
  this.registerTool("createMindmap", {
    args: {
      "content": {
        type: "string",
        description: "Markdown格式的思维导图内容"
      }
    },
    description: "创建思维导图",
    needNote: true
  })
  // ... 注册其他工具
}

static getToolByName(name) {
  // 获取工具实例
  if (!this.toolInstances[name]) {
    this.toolInstances[name] = chatAITool.new(name, this.tools[name])
  }
  return this.toolInstances[name]
}
```

### 3. chatAIConfig 类 - 配置管理系统（2,930行）

#### 3.1 配置结构
```javascript
class chatAIConfig {
  static config = {
    // 基础配置
    source: "OpenAI",
    model: "gpt-3.5-turbo",
    apiKey: "",
    
    // 功能开关
    autoAction: true,
    onSelection: true,
    onNote: true,
    onNewExcerpt: false,
    
    // 界面配置
    notifyLoc: 0,  // 0:左边 1:右边
    dynamic: true,  // 悬浮球
    
    // 触发配置
    colorConfig: Array(32).fill(true),  // 颜色过滤
    ignoreShortText: false,
    
    // Prompt配置
    promptNames: [],
    currentPrompt: ""
  }
  
  static prompts = {}     // Prompt库
  static knowledge = ""   // 知识库
  static modelConfig = {} // 模型配置
}
```

#### 3.2 核心方法

##### 配置管理
```javascript
static init(mainPath)           // 初始化配置
static save(key)                // 保存配置
static remove(key)              // 删除配置
static getConfig(key)           // 获取配置项
static setConfig(key, value)   // 设置配置项
```

##### 云同步功能
```javascript
static checkCloudStore()        // 检查云存储
static readCloudConfig(force)   // 读取云配置
static writeCloudConfig()       // 写入云配置
static sync()                   // 手动同步
static autoImport(onNotebook)   // 自动导入
```

##### Prompt管理
```javascript
static getPrompt(key)           // 获取Prompt
static setPrompt(key, value)    // 设置Prompt
static deletePrompt(key)        // 删除Prompt
static getUnusedKey()           // 获取未使用的key
static importPrompt(config)     // 导入Prompt
```

##### 模型配置
```javascript
static allSource(containAll)    // 获取所有模型源
static getModelConfig(source)   // 获取模型配置
static getCurrentModel()        // 获取当前模型
static switchModel(model)       // 切换模型
```

### 4. chatAINetwork 类 - 网络请求封装（1,019行）

#### 4.1 核心功能
```javascript
class chatAINetwork {
  // 基础请求方法
  static async fetch(url, options)
  static async fetchWithRetry(url, options, maxRetries = 3)
  
  // AI API 调用
  static async chatCompletion(messages, model, options)
  static async streamCompletion(messages, model, options, onData)
  
  // 特殊功能
  static async fetchModelConfig()  // 获取模型配置
  static async rerank(texts, query) // 文本重排序
  static async generateImage(prompt, model) // 图片生成
}
```

#### 4.2 流式响应处理
```javascript
static handleStreamResponse(response, onData) {
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  
  while (true) {
    const {done, value} = await reader.read()
    if (done) break
    
    const chunk = decoder.decode(value)
    const lines = chunk.split('\n')
    
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = JSON.parse(line.slice(6))
        onData(data)
      }
    }
  }
}
```

### 5. 关键设计模式

#### 5.1 单例模式
所有工具类都采用静态方法，确保全局唯一：
```javascript
class chatAIUtils {
  static instance = null
  static getInstance() {
    if (!this.instance) {
      this.instance = new chatAIUtils()
    }
    return this.instance
  }
}
```

#### 5.2 工厂模式
工具实例的创建和管理：
```javascript
static getToolByName(name) {
  if (!this.toolInstances[name]) {
    this.toolInstances[name] = chatAITool.new(name, this.tools[name])
  }
  return this.toolInstances[name]
}
```

#### 5.3 策略模式
不同 AI 模型的处理策略：
```javascript
static async chatCompletion(messages, model, options) {
  const provider = this.getProvider(model)
  
  switch(provider) {
    case 'openai':
      return this.openaiCompletion(messages, model, options)
    case 'anthropic':
      return this.anthropicCompletion(messages, model, options)
    // ... 其他提供商
  }
}
```

### 6. 技术亮点

1. **完整的工具系统**：20+ 种 AI 工具，覆盖笔记操作全流程
2. **智能搜索**：支持当前文档、学习集、全局搜索
3. **配置云同步**：iCloud 自动同步配置
4. **流式响应**：支持 SSE 流式输出
5. **错误恢复**：自动重试和降级机制
6. **缓存优化**：工具实例缓存，提高性能

## 总结

MNAI 插件通过精心设计的四控制器架构、完善的 AI 集成和丰富的交互功能，为 MarginNote 用户提供了强大的 AI 辅助能力。其设计模式和实现细节值得其他插件开发者参考和学习。

### 核心优势
1. **架构清晰**：四控制器分工明确，易于维护和扩展
2. **功能完善**：支持多模型、多模态、多界面
3. **深度集成**：与 MarginNote 核心功能无缝融合
4. **用户友好**：多种交互方式，适应不同使用场景

### 技术亮点
1. **流式响应处理**：实时显示 AI 输出
2. **智能缓存机制**：提高响应速度
3. **错误恢复能力**：自动重试和降级处理
4. **安全性保障**：API Key 加密、输入验证