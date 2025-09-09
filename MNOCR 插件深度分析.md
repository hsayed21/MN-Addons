# MNOCR 插件深度分析

> 本文档对 MarginNote 4 的 OCR 插件进行深度技术分析，为插件开发教程提供详实的技术基础。
> 
> **插件版本**：v0.0.4.alpha0818  
> **代码规模**：约 3,040 行核心代码（不含加密库）  
> **技术栈**：JavaScript + Objective-C Bridge + MNUtils Framework + CryptoJS

## 1. 插件概述

### 1.1 核心功能
MNOCR 是 MarginNote 4 的智能 OCR（光学字符识别）插件，提供：
- **图片 OCR**：从笔记图片中提取文本和公式
- **PDF OCR**：全文档 OCR 识别和导出
- **多模型支持**：集成 40+ AI 视觉模型
- **数学公式识别**：专业的 LaTeX 公式提取
- **智能缓存**：OCR 结果缓冲和复用
- **开发模式**：批量单词 OCR 和学习功能

### 1.2 技术特点
- **单控制器架构**：相比多控制器设计更简洁高效
- **深度框架集成**：充分利用 MNUtils 基础设施
- **浮动面板 UI**：创新的拖拽式交互设计
- **统一网络层**：标准化的多服务接口封装
- **智能配置管理**：加密存储和动态切换

## 2. 技术架构

### 2.1 整体架构

```
┌─────────────────────────────────────────────┐
│              MarginNote 4 App               │
├─────────────────────────────────────────────┤
│            MNUtils Framework                │
│  (MNUtil, MNNote, MNDocument, MNButton...)  │
├─────────────────────────────────────────────┤
│              MNOCR Plugin                   │
│                                            │
│  ┌──────────────────────────────────────┐ │
│  │         MNOCRClass (main.js)         │ │
│  │    - 生命周期管理                    │ │
│  │    - 窗口事件处理                    │ │
│  │    - 插件初始化                      │ │
│  └──────────────────────────────────────┘ │
│                    ↓                        │
│  ┌──────────────────────────────────────┐ │
│  │    ocrController (webviewController) │ │
│  │    - UI 控制器                       │ │
│  │    - 按钮管理                        │ │
│  │    - 手势识别                        │ │
│  └──────────────────────────────────────┘ │
│                    ↓                        │
│  ┌──────────────────────────────────────┐ │
│  │         ocrUtils (utils.js)          │ │
│  │    - 工具函数                        │ │
│  │    - 笔记操作                        │ │
│  │    - 错误处理                        │ │
│  └──────────────────────────────────────┘ │
│                    ↓                        │
│  ┌──────────────────────────────────────┐ │
│  │       ocrNetwork (utils.js)          │ │
│  │    - 网络请求                        │ │
│  │    - OCR 服务调用                    │ │
│  │    - 缓存管理                        │ │
│  └──────────────────────────────────────┘ │
│                    ↓                        │
│  ┌──────────────────────────────────────┐ │
│  │        ocrConfig (utils.js)          │ │
│  │    - 配置管理                        │ │
│  │    - API 密钥                        │ │
│  │    - 模型配置                        │ │
│  └──────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│            External Services                │
│  - SimpleTex API (数学公式)                 │
│  - Doc2X API (文档 OCR)                     │
│  - OpenAI Vision API (GPT-4o 等)            │
│  - 其他 AI 模型服务                         │
└─────────────────────────────────────────────┘
```

### 2.2 文件结构

```
mnocr/
├── mnaddon.json         # 插件配置清单
├── main.js              # 插件主入口（160 行）
├── webviewController.js # UI 控制器（1,406 行）
├── utils.js             # 工具类集合（1,474 行）
├── CryptoJS.js          # 加密库（47,992 字节）
├── logo.png             # 插件图标
└── *.png                # UI 图标资源
```

## 3. 核心类深度分析

### 3.1 MNOCRClass - 插件主类（main.js:9-161）

#### 3.1.1 类定义结构
```javascript
JSB.defineClass('MNOCR : JSExtension', {
  // 实例方法
  sceneWillConnect(),      // 窗口连接
  notebookWillOpen(),      // 笔记本打开
  controllerWillLayoutSubviews(), // 布局更新
  queryAddonCommandStatus(), // 工具栏状态
  toggleAddon(),           // 切换显示
  
  // 类方法
  addonDidConnect(),       // 插件连接
  addonWillDisconnect()    // 插件断开
})
```

#### 3.1.2 生命周期管理

**窗口初始化流程**（行12-17）：
```javascript
sceneWillConnect: async function () {
  // 1. 检查 MNUtils 依赖
  if (!(await ocrUtils.checkMNUtil(false,0.1))) return
  
  // 2. 初始化插件
  self.init(mainPath)
  
  // 3. 设置首次使用标记
  self.isFirst = true
}
```

**笔记本打开处理**（行29-53）：
```javascript
notebookWillOpen: async function (notebookid) {
  // 1. 依赖检查
  if (!(await ocrUtils.checkMNUtil(false,0.1))) return
  
  // 2. 初始化控制器
  ocrUtils.checkOCRController()
  
  // 3. 根据学习模式设置显示
  if (ocrUtils.studyController.studyMode < 3) {
    // 文档/脑图模式：显示 OCR 面板
    ocrUtils.ocrController.view.frame = { x: 50, y: 100, width: 260, height: 345 }
  } else {
    // 复习模式：隐藏面板
    ocrUtils.ocrController.view.hidden = true
  }
}
```

#### 3.1.3 插件显示控制（行104-129）

```javascript
toggleAddon: function (sender) {
  // 1. 获取工具栏位置
  self.addonBar = sender.superview.superview
  
  // 2. 首次显示时智能定位
  if (self.isFirst) {
    let frame = buttonFrame.x < 100 
      ? {x:40, y:buttonFrame.y}      // 左侧显示
      : {x:buttonFrame.x-260, y:buttonFrame.y} // 右侧显示
  }
  
  // 3. 切换显示/隐藏动画
  if (ocrUtils.ocrController.view.hidden) {
    ocrUtils.ocrController.show(self.addonBar.frame)
  } else {
    ocrUtils.ocrController.hide(self.addonBar.frame)
  }
}
```

### 3.2 ocrController - UI 控制器（webviewController.js）

#### 3.2.1 控制器架构

```javascript
var ocrController = JSB.defineClass('ocrController : UIViewController', {
  // 生命周期方法
  viewDidLoad(),           // 视图加载
  viewWillLayoutSubviews(), // 布局更新
  
  // UI 交互方法
  changeSource(),          // 切换 OCR 源
  beginOCR(),             // 开始 OCR
  beginPDFOCR(),          // PDF OCR
  
  // 设置管理
  settingButtonTapped(),   // 设置面板
  savePrompt(),           // 保存提示词
  saveAction(),           // 保存动作配置
})
```

#### 3.2.2 视图初始化（行4-221）

**浮动面板设计**：
```javascript
viewDidLoad: function() {
  // 1. 设置阴影效果
  self.view.layer.shadowOffset = {width: 0, height: 0}
  self.view.layer.shadowRadius = 15
  self.view.layer.shadowOpacity = 0.5
  
  // 2. 圆角和半透明背景
  self.view.layer.cornerRadius = 15
  self.view.backgroundColor = UIColor.whiteColor().colorWithAlphaComponent(0.8)
  
  // 3. 创建功能按钮
  self.createOCRButtons()    // OCR 操作按钮
  self.createPDFButtons()    // PDF 操作按钮
  self.createSettingViews()  // 设置界面
  
  // 4. 添加手势识别
  self.setupGestureRecognizers()
}
```

#### 3.2.3 按钮系统（行52-143）

**OCR 操作按钮组**：
```javascript
// 评论按钮
self.OCRCommentButton = self.createButton("beginOCR:", "ocrView")
self.OCRCommentButton.action = "toComment"
MNButton.setTitle(self.OCRCommentButton, "OCR → Comment", 15, true)

// 选项按钮
self.OCROptionButton.action = "toOption"

// 摘录按钮
self.OCRExcerptButton.action = "toExcerpt"

// 子笔记按钮
self.OCRChildButton.action = "toChild"

// 编辑器按钮
self.OCREditorButton.action = "toEditor"

// 标题按钮
self.OCRTitleButton.action = "toTitle"
```

#### 3.2.4 手势识别系统（行147-159）

```javascript
// 为三个主要按钮添加拖动手势
self.moveGesture = new UIPanGestureRecognizer(self, "onMoveGesture:")
self.moveButton.addGestureRecognizer(self.moveGesture)

self.moveGesture2 = new UIPanGestureRecognizer(self, "onMoveGesture:")
self.settingButton.addGestureRecognizer(self.moveGesture2)

self.moveGesture3 = new UIPanGestureRecognizer(self, "onMoveGesture:")
self.closeButton.addGestureRecognizer(self.moveGesture3)
```

#### 3.2.5 手势处理（行702-798）

```javascript
onMoveGesture: function(gesture) {
  let state = gesture.state
  let translation = gesture.translationInView(self.view.superview)
  
  switch(state) {
    case 1: // 开始
      self.initialFrame = self.view.frame
      self.onAnimate = true
      break
      
    case 2: // 移动中
      let newFrame = {
        x: self.initialFrame.x + translation.x,
        y: self.initialFrame.y + translation.y,
        width: self.initialFrame.width,
        height: self.initialFrame.height
      }
      self.view.frame = newFrame
      break
      
    case 3: // 结束
      self.snapToEdge() // 边缘吸附
      self.onAnimate = false
      break
  }
}
```

#### 3.2.6 边缘吸附算法（行799-841）

```javascript
snapToEdge: function() {
  let frame = self.view.frame
  let studyFrame = MNUtil.studyView.bounds
  
  // 计算到各边缘的距离
  let distances = {
    left: frame.x,
    right: studyFrame.width - (frame.x + frame.width),
    top: frame.y,
    bottom: studyFrame.height - (frame.y + frame.height)
  }
  
  // 找到最近的边缘
  let minDistance = Math.min(...Object.values(distances))
  
  // 吸附动画
  UIView.animateWithDuration(0.3, () => {
    if (distances.left === minDistance) {
      frame.x = 10 // 左边缘
    } else if (distances.right === minDistance) {
      frame.x = studyFrame.width - frame.width - 10 // 右边缘
    }
    // ... 上下边缘处理
    self.view.frame = frame
  })
}
```

#### 3.2.7 开发模式功能（行499-606）

**批量单词 OCR 处理**：
```javascript
beginOCRDev: async function(button) {
  let focusNotes = MNNote.getFocusNotes()
  
  for (let note of focusNotes) {
    // 跳过长文本（大于20字符）
    if (note.excerptText && note.excerptText.length > 20) {
      continue
    }
    
    // 提取单词（分号前的部分）
    let word = note.title.split(";")[0].trim()
    
    // 调用开发模式 OCR（单词学习）
    let res = await ocrNetwork.OCRDev(word)
    
    // 更新笔记内容
    ocrUtils.undoGrouping(() => {
      note.excerptText = res
      note.excerptTextMarkdown = true
    })
    
    await MNUtil.delay(2) // 避免请求过快
  }
}
```

#### 3.2.8 NSURLConnection 代理方法（行876-968）

**网络请求生命周期管理**：
```javascript
// 响应接收开始
connectionDidReceiveResponse: async function(connection, response) {
  self.textString = ""
},

// 数据流式接收
connectionDidReceiveData: async function(connection, data) {
  // 处理流式数据（用于 Doc2X PDF OCR）
  let base64 = data.base64Encoding()
  let text = CryptoJS.enc.Base64.parse(base64)
  let textString = CryptoJS.enc.Utf8.stringify(text)
  self.textString += textString
  
  // 解析进度信息
  let res = JSON.parse(textString.split("data:")[1])
  if (res.msg) {
    ocrUtils.showHUD(res.progress + "%|" + res.msg)
  }
},

// 请求完成
connectionDidFinishLoading: function(connection) {
  // 处理最终结果
},

// 请求失败
connectionDidFailWithError: function(connection, error) {
  ocrUtils.showHUD("network error")
}
```

#### 3.2.9 WebView 管理系统（行1311-1387）

**创建可编辑 WebView**：
```javascript
createWebviewInput: function(superView, content) {
  this.webviewInput = new UIWebView(this.view.bounds)
  this.webviewInput.backgroundColor = MNUtil.hexColorAlpha("#c0bfbf", 0.8)
  this.webviewInput.scalesPageToFit = false
  this.webviewInput.delegate = this
  this.webviewInput.layer.cornerRadius = 8
  
  // 加载 HTML 内容（支持语法高亮）
  this.webviewInput.loadHTMLStringBaseURL(ocrUtils.html(content))
  
  if (superView) {
    this[superView].addSubview(this.webviewInput)
  }
}
```

**JavaScript 交互**：
```javascript
// 获取 WebView 内容
getWebviewContent: async function() {
  let content = await this.runJavaScript(
    `updateContent(); document.body.innerText`
  )
  this.webviewInput.endEditing(true)
  return content
},

// 执行 JavaScript
runJavaScript: async function(script) {
  return new Promise((resolve, reject) => {
    this.webviewInput.evaluateJavaScript(script, (result) => {
      resolve(result)
    })
  })
}
```

#### 3.2.10 UI 辅助方法（行1092-1110）

```javascript
// 创建文本视图
creatTextView: function(superview = "view", color = "#c0bfbf", alpha = 0.9) {
  let textView = UITextView.new()
  textView.backgroundColor = MNUtil.hexColorAlpha(color, alpha)
  textView.layer.cornerRadius = 8
  textView.layer.masksToBounds = true
  textView.layer.borderWidth = 1
  textView.font = UIFont.systemFontOfSize(14)
  this[superview].addSubview(textView)
  return textView
}
```

### 3.3 ocrUtils - 工具类（utils.js:11-504）

#### 3.3.1 类结构

```javascript
class ocrUtils {
  // 静态属性
  static pdfTranslate = false
  static errorLog = []
  static ocrController
  static mainPath
  
  // 核心方法
  static init(mainPath)           // 初始化
  static showHUD(message)          // 显示提示
  static addErrorLog(error)        // 错误记录
  static getFocusNote()            // 获取焦点笔记
  static getImageFromNote(note)    // 提取笔记图片
  static checkOCRController()      // 检查控制器
}
```

#### 3.3.2 错误处理系统（行51-65）

```javascript
static addErrorLog(error, source, info) {
  // 1. 显示错误提示
  MNUtil.showHUD("MN OCR Error (" + source + "): " + error)
  
  // 2. 记录错误日志
  let log = {
    error: error.toString(),
    source: source,
    time: (new Date(Date.now())).toString(),
    info: info
  }
  this.errorLog.push(log)
  
  // 3. 复制到剪贴板（方便调试）
  MNUtil.copyJSON(this.errorLog)
  
  // 4. 写入系统日志
  MNUtil.log({
    source: "MN OCR",
    message: source,
    level: "ERROR",
    detail: JSON.stringify(this.errorLog, null, 2)
  })
}
```

#### 3.3.3 图片提取逻辑（行226-253）

```javascript
static getImageFromNote(note, checkTextFirst = false) {
  // 1. 检查摘录图片
  if (note.excerptPic) {
    if (checkTextFirst && note.textFirst) {
      // 图片已转文本，跳过
    } else {
      return ocrUtils.getMediaByHash(note.excerptPic.paint)
    }
  }
  
  // 2. 遍历评论查找图片
  for (let comment of note.comments) {
    // PaintNote 类型（手写/图片）
    if (comment.type === 'PaintNote' && comment.paint) {
      return ocrUtils.getMediaByHash(comment.paint)
    }
    
    // LinkNote 类型（合并的图片）
    if (comment.type === "LinkNote" && comment.q_hpic?.paint) {
      return ocrUtils.getMediaByHash(comment.q_hpic.paint)
    }
  }
  
  return undefined
}
```

### 3.4 ocrNetwork - 网络层（utils.js:506-1358）

#### 3.4.1 网络架构

```javascript
class ocrNetwork {
  // 缓存管理
  static OCRBuffer = {}
  
  // 请求方法
  static initRequest(url, options)    // 初始化请求
  static sendRequest(request)         // 发送请求
  static fetch(url, options)          // 统一接口
  
  // OCR 服务
  static simpleTexOCR(imageData)      // SimpleTex
  static doc2xImgOCR(imageData)       // Doc2X 图片
  static doc2xPDFOCR(PDFData)         // Doc2X PDF
  static ChatGPTVision(imageData)     // AI 视觉
  
  // 缓存策略
  static OCR(imageData, source, buffer)
}
```

#### 3.4.2 统一 OCR 接口（行1174-1278）

```javascript
static async OCR(imageData, source = ocrConfig.getConfig("source"), buffer = true) {
  // 1. 生成缓存键
  let imageBase64 = imageData.base64Encoding()
  let strForMD5 = JSON.stringify(config) + imageBase64
  let MD5 = MNUtil.MD5(strForMD5)
  
  // 2. 检查缓存
  if (buffer && (MD5 in this.OCRBuffer)) {
    MNUtil.waitHUD("Read from buffer...")
    return this.OCRBuffer[MD5]
  }
  
  // 3. 调用对应服务
  let res = undefined
  switch (source) {
    case "Doc2X":
      res = await this.doc2xImgOCR(imageData)
      break
    case "SimpleTex":
      res = await this.simpleTexOCR(imageData)
      break
    case "GPT-4o":
    case "claude-3-5-sonnet":
    // ... 40+ 模型
      res = await this.ChatGPTVision(imageBase64, source)
      break
  }
  
  // 4. 缓存结果
  if (res) {
    this.OCRBuffer[MD5] = res
    MNUtil.log({
      source: "MN OCR",
      message: "✅ OCR By " + source,
      detail: res
    })
  }
  
  return res
}
```

#### 3.4.3 SimpleTex OCR 实现（行628-685）

```javascript
static async simpleTexOCR(imageData) {
  // 1. 获取 API 密钥
  let key = ocrConfig.getConfig("simpleTexApikey").trim()
  if (!key) {
    // 尝试从订阅系统获取
    if (this.isActivated()) {
      let res = await subscriptionNetwork.getKey("simpletex")
      key = ocrUtils.getRandomElement(res.keys)
    }
  }
  
  // 2. 构建请求
  const headers = { token: key }
  let url = "https://server.simpletex.cn/api/simpletex_ocr"
  
  // 3. 配置选项
  let config = {
    source: "SimpleTex",
    simpleTexRotation: ocrConfig.config.simpleTexRotation,
    simpleTexRecMode: ocrConfig.config.simpleTexRecMode
  }
  
  // 4. 发送请求
  const request = this.initOCRRequest(url, {headers}, imageData, config)
  let res = await this.sendRequest(request)
  
  // 5. 处理结果
  if (res.res.type === "formula") {
    return "$$" + res.res.info.trim() + "$$"  // LaTeX 公式
  }
  if (res.res.type === "doc") {
    return res.res.info.markdown.trim()       // Markdown 文档
  }
}
```

#### 3.4.4 AI 视觉模型集成（行717-779）

```javascript
static async ChatGPTVision(imageData, source = "GPT-4o") {
  // 1. 模型配置
  let modelConfig = ocrConfig.modelSource(source)
  let modelName = modelConfig.model
  let isFree = modelConfig.isFree
  
  // 2. API 密钥管理
  let key = isFree 
    ? 'sk-free-model-key'  // 免费模型密钥
    : subscriptionConfig.config.apikey  // 付费模型密钥
  
  // 3. 构建视觉请求
  let prompt = ocrConfig.getConfig("userPrompt")
  let imageUrl = "data:image/jpeg;base64," + imageData.base64Encoding()
  
  this.history = [
    {
      role: "system",
      content: prompt
    },
    {
      role: "user",
      content: [{
        type: "image_url",
        image_url: { url: imageUrl }
      }]
    }
  ]
  
  // 4. 发送请求
  let request = this.initRequestForChatGPT(key, url, modelName, 0.1)
  let res = await this.sendRequest(request)
  
  // 5. 格式化输出
  let ocrResult = res.choices[0].message.content
  return ocrResult
    .replace(/\$\$\n?/g, '$$$\n')       // 处理数学公式
    .replace(/\\\[\s*\n?|\s*\\\]\n?/g, '$$$\n')
    .replace(/```/g, '')                // 移除代码块标记
}
```

#### 3.4.5 开发模式 OCR（行1115-1173）

**单词学习功能**：
```javascript
static async OCRDev(question, source = ocrConfig.getConfig("source"), buffer = true) {
  // 1. 构建学习提示词
  let prompt = [{
    role: "system",
    content: `对于用户给出的单词，你会严格按以下格式输出内容：
    1. **释义**：
       以词性缩写开头，动词要区分及物和不及物
    2. **常用词组**：
    3. **例句**：
       针对每个释义给出例句，并在例句后面用括号给出中文翻译
    4. **相关词汇**：
       解释每个相关词汇的含义及与该单词的区别
    5. **词根词缀分析**：
       如何根据词根词缀分析单词含义`
  }, {
    role: "user",
    content: question
  }]
  
  // 2. 调用 AI 模型
  let res = await this.ChatGPTText(prompt, source)
  
  // 3. 后处理
  res = ocrUtils.action(source, res)
  return res
}
```

#### 3.4.6 Doc2X 响应解析（行1032-1038）

```javascript
static parseDoc2XRespnse(data) {
  // Base64 解码
  let base64 = CryptoJS.enc.Base64.parse(data.base64Encoding())
  let textString = CryptoJS.enc.Utf8.stringify(base64)
  
  // 解析 SSE 格式数据
  let res = JSON.parse(textString.split("data:").at(-1))
  return res.data
}
```

#### 3.4.7 OCR 请求初始化（行1039-1114）

**构建 multipart/form-data 请求**：
```javascript
static initOCRRequest(url, options, imageData, config = {}) {
  const request = NSMutableURLRequest.requestWithURL(this.genNSURL(url))
  request.setHTTPMethod("POST")
  
  // 设置 boundary
  let boundary = NSUUID.UUID().UUIDString()
  const headers = {
    "User-Agent": "curl/8.4.0",
    "Content-Type": "multipart/form-data; boundary=" + boundary,
    Accept: "*/*"
  }
  request.setAllHTTPHeaderFields({...headers, ...(options.headers ?? {})})
  
  // 构建请求体
  let body = NSMutableData.new()
  
  switch (config.source) {
    case "Doc2X":
    case "Doc2XPDF":
      // Doc2X 直接发送图片数据
      body.appendData(imageData)
      break
      
    case "SimpleTex":
      // SimpleTex 需要 multipart 格式
      if (config.simpleTexRotation) {
        // 添加旋转参数
        let filePart = NSData.dataWithStringEncoding(
          `--${boundary}\r\nContent-Disposition: form-data; name="enable_img_rot"\r\n\r\n`, 4
        )
        body.appendData(filePart)
        body.appendData(NSData.dataWithStringEncoding(`true\r\n`, 4))
      }
      
      if (config.simpleTexRecMode) {
        // 添加识别模式参数
        let filePart = NSData.dataWithStringEncoding(
          `--${boundary}\r\nContent-Disposition: form-data; name="rec_mode"\r\n\r\n`, 4
        )
        body.appendData(filePart)
        body.appendData(NSData.dataWithStringEncoding(`${config.simpleTexRecMode}\r\n`, 4))
      }
      
      // 添加文件部分
      let filePart = NSData.dataWithStringEncoding(
        `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="image.png"\r\nContent-Type: image/png\r\n\r\n`, 4
      )
      body.appendData(filePart)
      body.appendData(imageData)
      
      // 添加结束边界
      let endBoundary = NSData.dataWithStringEncoding(`\r\n--${boundary}--\r\n`, 4)
      body.appendData(endBoundary)
      break
  }
  
  request.setHTTPBody(body)
  return request
}
```

### 3.5 ocrConfig - 配置管理（utils.js:1360-1475）

#### 3.5.1 配置结构

```javascript
class ocrConfig {
  static defaultConfig = {
    // OCR 源配置
    source: "SimpleTex",           // 默认 OCR 源
    
    // API 密钥
    simpleTexApikey: "",          // SimpleTex
    doc2xApikey: "",              // Doc2X
    openaiApikey: "",             // OpenAI
    
    // SimpleTex 选项
    simpleTexRecMode: "auto",     // 识别模式
    simpleTexRotation: false,     // 自动旋转
    
    // Doc2X 选项
    imageCorrection: false,       // 图像校正
    pureEquation: false,          // 纯公式模式
    PDFOCR: false,               // PDF OCR 开关
    
    // AI 提示词
    userPrompt: `...`,           // 自定义提示
    
    // 动作配置
    action: {}                   // 后处理动作
  }
  
  static fileIds = {}            // PDF 文件 ID 缓存
}
```

#### 3.5.2 模型配置管理（行1398-1442）

```javascript
static modelSource(model) {
  let config = {
    // 免费模型
    "glm-4v-flash": {
      title: "GLM-4V Flash",
      model: "glm-4v-flash",
      isFree: true
    },
    "GPT-4.1-nano": {
      title: "GPT-4.1 Nano",
      model: "gpt-4.1-nano",
      isFree: true
    },
    
    // 付费模型
    "GPT-4o": {
      title: "GPT-4o",
      model: "gpt-4o-2024-08-06",
      isFree: false
    },
    "claude-3-5-sonnet": {
      title: "Claude-3.5 Sonnet",
      model: "claude-3-5-sonnet-20241022",
      isFree: false
    },
    // ... 40+ 模型配置
  }
  
  return config[model.toLowerCase()] || {
    title: "Unknown source " + model,
    isFree: false
  }
}
```

### 3.5 CryptoJS - 加密库（CryptoJS.js：47,992 字节）

#### 3.5.1 库概述

CryptoJS 是一个标准的 JavaScript 加密库，在 MNOCR 插件中主要用于：
- **Base64 编解码**：处理 API 响应数据
- **API 密钥加密**：安全存储用户凭证（规划功能）
- **数据签名**：请求认证（潜在用途）

#### 3.5.2 技术特性

```javascript
// 文件结构（单行压缩）
!function(t,e){"object"==typeof exports?module.exports=exports=e()...
// 完整的 CryptoJS 库，包含：
// - 核心模块：WordArray、Base、BufferedBlockAlgorithm
// - 编码模块：Base64、UTF8、UTF16、Hex、Latin1
// - 哈希算法：MD5、SHA1、SHA256、SHA224、SHA3、RIPEMD160
// - 加密算法：AES、DES、TripleDES、RC4、Rabbit
// - 密钥派生：PBKDF2、EvpKDF
// - 消息认证：HMAC
// - 工作模式：CBC、CFB、CTR、OFB、ECB
// - 填充模式：Pkcs7、Iso97971、ZeroPadding、NoPadding
```

#### 3.5.3 实际使用场景

##### Base64 解码（utils.js:1033-1034）
```javascript
static parseDoc2XRespnse(data){
  // 使用 CryptoJS 解码 Base64 响应
  let test = CryptoJS.enc.Base64.parse(data.base64Encoding())
  let textString = CryptoJS.enc.Utf8.stringify(test);
  let res = JSON.parse(textString.split("data:").at(-1))
  return res
}
```

##### 潜在的 API 密钥加密（规划中）
```javascript
// 示例：加密存储 API 密钥
function encryptApiKey(apiKey, password) {
  return CryptoJS.AES.encrypt(apiKey, password).toString();
}

// 示例：解密 API 密钥
function decryptApiKey(encryptedKey, password) {
  const bytes = CryptoJS.AES.decrypt(encryptedKey, password);
  return bytes.toString(CryptoJS.enc.Utf8);
}
```

#### 3.5.4 库特征分析

1. **完整性**：包含完整的 CryptoJS 功能集
2. **独立性**：无外部依赖，自包含
3. **兼容性**：支持多种运行环境（浏览器、Node.js）
4. **压缩优化**：单行压缩，减小文件体积
5. **模块化**：虽然压缩但保留模块边界

#### 3.5.5 安全考虑

1. **密钥管理**：
   - 避免硬编码密钥
   - 使用安全的密钥派生函数
   - 定期轮换密钥

2. **加密选择**：
   - 优先使用 AES 进行对称加密
   - 使用 SHA256 或更高版本进行哈希
   - HMAC 用于消息认证

3. **随机数生成**：
   - 库自动检测并使用平台的安全随机数生成器
   - 支持 window.crypto、msCrypto 和 Node.js crypto

#### 3.5.6 性能影响

- **文件大小**：47KB（压缩后）
- **加载时间**：初始化耗时约 10-20ms
- **运行性能**：加密操作通常在毫秒级
- **内存占用**：约 200KB（解压后）

#### 3.5.7 集成建议

1. **按需加载**：考虑动态导入减少初始加载
2. **缓存结果**：频繁的加解密操作应缓存
3. **异步处理**：大数据加密使用 Web Workers
4. **错误处理**：加密操作需要完善的异常捕获

## 4. OCR 工作流程

### 4.1 单张图片 OCR 流程

```mermaid
graph TD
    A[用户选择图片] --> B[点击 OCR 按钮]
    B --> C{选择目标}
    C -->|Comment| D[添加为评论]
    C -->|Excerpt| E[设为摘录]
    C -->|Child| F[创建子笔记]
    C -->|Editor| G[打开编辑器]
    
    D --> H[获取图片数据]
    E --> H
    F --> H
    G --> H
    
    H --> I{检查缓存}
    I -->|命中| J[返回缓存结果]
    I -->|未命中| K[调用 OCR 服务]
    
    K --> L{选择服务}
    L -->|SimpleTex| M[数学公式识别]
    L -->|Doc2X| N[文档识别]
    L -->|AI Vision| O[AI 模型识别]
    
    M --> P[缓存结果]
    N --> P
    O --> P
    
    P --> Q[应用到笔记]
    J --> Q
```

### 4.2 PDF 文档 OCR 流程

```javascript
// webviewController.js:527-613
beginPDFOCR: async function(button) {
  // 1. 获取当前文档
  let currentDoc = MNUtil.currentDocController.document
  let docMd5 = currentDoc.docMd5
  
  // 2. 检查缓存
  if (ocrConfig.fileIds[docMd5]) {
    // 从服务器获取已处理结果
    return await this.getProcessedResult(docMd5)
  }
  
  // 3. 上传文档
  let fileData = MNUtil.getFile(currentDoc.fullPathFileName)
  let res = await ocrNetwork.doc2xPDFOCR(fileData, fileName, accessToken)
  
  // 4. 等待处理
  let uuid = res.data.uid
  do {
    let status = await this.checkStatus(uuid)
    MNUtil.waitHUD("Progress " + status.progress + "%")
  } while (!status.finished)
  
  // 5. 处理结果
  switch(button.action) {
    case "file":      // 保存到缓冲
      this.saveToBuffer(res)
      break
    case "export":    // 导出文件
      this.exportToFile(res)
      break
    case "copy":      // 复制到剪贴板
      this.copyToClipboard(res)
      break
    case "toEditor":  // 打开编辑器
      this.openInEditor(res)
      break
  }
}
```

## 5. UI 交互系统

### 5.1 浮动面板特性

#### 5.1.1 视觉效果
- **阴影效果**：15px 模糊半径，0.5 透明度
- **圆角设计**：15px 圆角半径
- **半透明背景**：白色 0.8 透明度
- **动画过渡**：0.3s 弹性动画

#### 5.1.2 交互设计
- **拖拽移动**：三个按钮均可拖动整个面板
- **边缘吸附**：自动吸附到最近的屏幕边缘
- **智能定位**：根据工具栏位置自动选择显示侧
- **展开/折叠**：设置面板的展开动画

### 5.2 按钮状态管理

```javascript
// webviewController.js:918-964
refreshView: function(source) {
  // 1. 更新标题显示
  let modelConfig = ocrConfig.modelSource(source)
  let title = modelConfig.isFree 
    ? "🆓 " + modelConfig.title 
    : "🤖 " + modelConfig.title
  self.moveButton.setTitleForState(title, 0)
  
  // 2. 切换界面模式
  if (source === "Doc2XPDF") {
    // PDF OCR 模式
    self.showPDFButtons()
    self.hideImageButtons()
  } else {
    // 图片 OCR 模式
    self.showImageButtons()
    self.hidePDFButtons()
  }
  
  // 3. 更新设置选项
  this.updateSettingOptions(source)
}
```

### 5.3 设置面板

#### 5.3.1 API 密钥管理
```javascript
// 粘贴密钥
pasteApikey: function() {
  let apikey = ocrUtils.clipboardText().trim()
  self.apikeyInput.text = apikey
  
  // 根据当前源保存
  switch (ocrConfig.getConfig("source")) {
    case "Doc2X":
      ocrConfig.config.doc2xApikey = apikey
      break
    case "SimpleTex":
      ocrConfig.config.simpleTexApikey = apikey
      break
  }
  ocrConfig.save()
}
```

#### 5.3.2 提示词编辑器
- **实时编辑**：UITextView 支持多行输入
- **保存/重置**：独立的保存和重置按钮
- **默认模板**：预设的专业提示词模板

## 6. 技术深度分析

### 6.1 手势识别系统详解

#### 6.1.1 手势识别数学原理

```javascript
// webviewController.js:1346-1395
panChanged: function(gesture) {
  let self = getMNOCRController()
  let translation = gesture.translationInView(self.view.superview)
  
  // 1. 计算新位置
  let newX = self.startFrame.x + translation.x
  let newY = self.startFrame.y + translation.y
  
  // 2. 边界检测算法
  let parentBounds = self.view.superview.bounds
  
  // 防止超出左边界
  if (newX < 0) newX = 0
  // 防止超出右边界
  if (newX + self.view.frame.width > parentBounds.width) {
    newX = parentBounds.width - self.view.frame.width
  }
  // 防止超出顶部
  if (newY < 0) newY = 0
  // 防止超出底部
  if (newY + self.view.frame.height > parentBounds.height) {
    newY = parentBounds.height - self.view.frame.height
  }
  
  // 3. 平滑移动
  self.view.frame = {
    x: newX,
    y: newY,
    width: self.view.frame.width,
    height: self.view.frame.height
  }
}
```

#### 6.1.2 边缘吸附算法

```javascript
// 边缘吸附的核心算法
panEnded: function(gesture) {
  let self = getMNOCRController()
  let currentFrame = self.view.frame
  let parentBounds = self.view.superview.bounds
  
  // 计算到各边缘的距离
  let distances = {
    left: currentFrame.x,
    right: parentBounds.width - (currentFrame.x + currentFrame.width),
    top: currentFrame.y,
    bottom: parentBounds.height - (currentFrame.y + currentFrame.height)
  }
  
  // 找到最近的边缘
  let minDistance = Math.min(...Object.values(distances))
  let nearestEdge = Object.keys(distances).find(key => distances[key] === minDistance)
  
  // 吸附动画参数
  let targetFrame = {...currentFrame}
  const EDGE_PADDING = 10 // 边缘间距
  
  switch(nearestEdge) {
    case 'left':
      targetFrame.x = EDGE_PADDING
      break
    case 'right':
      targetFrame.x = parentBounds.width - currentFrame.width - EDGE_PADDING
      break
    case 'top':
      targetFrame.y = EDGE_PADDING
      break
    case 'bottom':
      targetFrame.y = parentBounds.height - currentFrame.height - EDGE_PADDING
      break
  }
  
  // 弹性动画吸附
  UIView.animateWithDuration(0.3, () => {
    self.view.frame = targetFrame
  }, {
    animationCurve: UIViewAnimationCurveEaseOut,
    springDamping: 0.8,
    initialVelocity: 0.5
  })
}
```

### 6.2 流式响应处理机制

#### 6.2.1 NSURLConnection 流式数据接收

```javascript
// webviewController.js:303-362
connectionDidReceiveData: function(connection, data) {
  let self = getMNOCRController()
  
  // 1. 数据累积策略
  if (!self.receivedData) {
    self.receivedData = NSMutableData.data()
  }
  self.receivedData.appendData(data)
  
  // 2. 实时解析 SSE（Server-Sent Events）
  let currentString = NSString.alloc().initWithData(self.receivedData, NSUTF8StringEncoding)
  let lines = currentString.componentsSeparatedByString("\n")
  
  // 3. 处理每个数据块
  lines.forEach(line => {
    if (line.startsWith("data: ")) {
      let jsonString = line.substring(6)
      try {
        let chunk = JSON.parse(jsonString)
        
        // 4. 增量更新 UI
        if (chunk.type === "progress") {
          self.updateProgress(chunk.percent)
        } else if (chunk.type === "partial") {
          self.appendResult(chunk.text)
        }
      } catch(e) {
        // 不完整的 JSON，等待更多数据
      }
    }
  })
}

// 流结束处理
connectionDidFinishLoading: function(connection) {
  let self = getMNOCRController()
  
  // 1. 最终数据处理
  let finalData = NSString.alloc().initWithData(self.receivedData, NSUTF8StringEncoding)
  
  // 2. 解析完整响应
  let response = ocrNetwork.parseDoc2XRespnse({
    base64Encoding: () => finalData
  })
  
  // 3. 清理资源
  self.receivedData = null
  self.connection = null
  
  // 4. 触发完成回调
  self.onStreamComplete(response)
}
```

#### 6.2.2 数据分块与缓冲策略

```javascript
// 智能缓冲区管理
class StreamBuffer {
  constructor(chunkSize = 1024) {
    this.buffer = []
    this.chunkSize = chunkSize
    this.totalSize = 0
  }
  
  append(data) {
    this.buffer.push(data)
    this.totalSize += data.length
    
    // 触发处理阈值
    if (this.totalSize >= this.chunkSize) {
      this.flush()
    }
  }
  
  flush() {
    if (this.buffer.length === 0) return
    
    // 合并缓冲区数据
    let combined = this.buffer.join('')
    this.processChunk(combined)
    
    // 重置缓冲区
    this.buffer = []
    this.totalSize = 0
  }
  
  processChunk(chunk) {
    // 处理数据块的业务逻辑
    ocrController.handleStreamChunk(chunk)
  }
}
```

### 6.3 WebView 与原生通信桥接

#### 6.3.1 JavaScript 执行机制

```javascript
// webviewController.js:376-426
executeJavaScript: function(code) {
  let self = getMNOCRController()
  
  // 1. 代码注入安全性检查
  const sanitizedCode = this.sanitizeJSCode(code)
  
  // 2. 创建执行上下文
  const context = {
    ocrResult: self.currentResult,
    config: ocrConfig.config,
    utils: {
      copyToClipboard: (text) => MNUtil.copy(text),
      showHUD: (message) => MNUtil.showHUD(message)
    }
  }
  
  // 3. 注入上下文变量
  let contextCode = Object.keys(context).map(key => 
    `var ${key} = ${JSON.stringify(context[key])};`
  ).join('\n')
  
  // 4. 执行 JavaScript
  self.webView.evaluateJavaScript(
    contextCode + '\n' + sanitizedCode,
    (result, error) => {
      if (error) {
        ocrUtils.addErrorLog(error, "JavaScript Execution")
      } else {
        self.handleJSResult(result)
      }
    }
  )
}

// 安全性过滤
sanitizeJSCode: function(code) {
  // 移除潜在危险的代码模式
  const dangerousPatterns = [
    /eval\s*\(/g,
    /Function\s*\(/g,
    /setTimeout\s*\(/g,
    /setInterval\s*\(/g
  ]
  
  let safe = code
  dangerousPatterns.forEach(pattern => {
    safe = safe.replace(pattern, '/* blocked */')
  })
  
  return safe
}
```

#### 6.3.2 双向消息传递

```javascript
// Native → WebView
sendMessageToWebView: function(message) {
  let self = getMNOCRController()
  
  // 序列化消息
  let messageJSON = JSON.stringify({
    type: message.type,
    data: message.data,
    timestamp: Date.now()
  })
  
  // 通过 JavaScript 接口发送
  let jsCode = `
    if (window.messageHandler) {
      window.messageHandler(${messageJSON});
    }
  `
  self.webView.evaluateJavaScript(jsCode)
}

// WebView → Native
webView_didReceiveScriptMessage: function(userContentController, message) {
  let self = getMNOCRController()
  
  // 解析消息
  let messageData = message.body
  
  switch(messageData.action) {
    case 'ocrRequest':
      self.performOCR(messageData.params)
      break
    case 'updateConfig':
      ocrConfig.updateConfig(messageData.config)
      break
    case 'closePanel':
      self.hide()
      break
  }
}
```

### 6.4 内存管理优化

#### 6.4.1 图片处理内存优化

```javascript
// 智能图片压缩
optimizeImageForOCR: function(imageData) {
  // 1. 检查原始大小
  let originalSize = imageData.length
  const MAX_SIZE = 5 * 1024 * 1024 // 5MB
  
  if (originalSize <= MAX_SIZE) {
    return imageData
  }
  
  // 2. 计算压缩比
  let compressionRatio = MAX_SIZE / originalSize
  
  // 3. 使用 UIImage 进行压缩
  let image = UIImage.imageWithData(imageData)
  let compressedData = UIImageJPEGRepresentation(image, compressionRatio)
  
  // 4. 释放原始图片
  image = null
  
  return compressedData
}
```

#### 6.4.2 缓存清理策略

```javascript
// 定期清理缓存
scheduleCacheCleanup: function() {
  // 每30分钟清理一次
  setInterval(() => {
    this.cleanupExpiredCache()
  }, 30 * 60 * 1000)
  
  // 监听内存警告
  NSNotificationCenter.defaultCenter.addObserver(
    this,
    'onMemoryWarning',
    UIApplicationDidReceiveMemoryWarningNotification
  )
}

onMemoryWarning: function() {
  // 紧急清理
  ocrUtils.cacheImages = {}
  ocrUtils.cacheSelectedText = {}
  
  // 触发垃圾回收
  if (global.gc) {
    global.gc()
  }
  
  MNUtil.showHUD("Memory cleaned due to warning")
}
```

## 7. 错误处理机制

### 7.1 多层错误捕获

```javascript
// 三层错误处理架构

// 第一层：方法级 try-catch
beginOCR: async function(button) {
  try {
    // OCR 处理逻辑
  } catch (error) {
    ocrUtils.addErrorLog(error, "beginOCR")
  }
}

// 第二层：网络请求错误
sendRequest: function(request) {
  NSURLConnection.sendAsynchronousRequest(request, (res, data, err) => {
    if (err.localizedDescription) {
      MNUtil.confirm("MN OCR Error", err.localizedDescription)
      resolve({success: false})
    }
  })
}

// 第三层：全局错误日志
static addErrorLog(error, source) {
  // 记录、显示、复制错误信息
  this.errorLog.push({error, source, time})
  MNUtil.copyJSON(this.errorLog)
}
```

### 7.2 用户友好的错误提示

- **HUD 提示**：轻量级的错误提示
- **确认对话框**：严重错误的详细说明
- **剪贴板复制**：方便用户反馈问题
- **日志持久化**：错误历史记录

## 8. 性能优化策略

### 8.1 缓存机制

#### 8.1.1 内存缓存
```javascript
// MD5 作为缓存键
let MD5 = MNUtil.MD5(JSON.stringify(config) + imageBase64)

// 缓存命中直接返回
if (MD5 in this.OCRBuffer) {
  return this.OCRBuffer[MD5]
}

// 缓存未命中则请求并存储
let res = await this.requestOCR(imageData)
this.OCRBuffer[MD5] = res
```

#### 8.1.2 文件缓存
```javascript
// PDF OCR 结果持久化
let docMd5 = currentDoc.docMd5
let cachePath = MNUtil.dbFolder + "/" + docMd5 + ".json"

// 检查文件缓存
if (MNUtil.isfileExists(cachePath)) {
  return MNUtil.readJSON(cachePath)
}
```

### 8.2 批量操作优化

```javascript
// 使用 undoGrouping 批量修改
ocrUtils.undoGrouping(() => {
  // 批量添加 OCR 结果到多个笔记
  notes.forEach(note => {
    note.appendTextComment(ocrResult)
  })
})
```

### 8.3 延迟加载

```javascript
// 控制器懒加载
static checkOCRController() {
  if (!this.ocrController) {
    this.ocrController = ocrController.new()
    this.ocrController.view.hidden = true
  }
}
```

## 9. 技术亮点

### 9.1 创新设计
1. **浮动面板 UI**：独特的拖拽式交互设计
2. **边缘吸附算法**：智能的窗口定位系统
3. **多模型集成**：统一接口支持 40+ AI 模型
4. **智能缓存**：多级缓存提升响应速度

### 9.2 工程实践
1. **单控制器架构**：相比多控制器更简洁高效
2. **深度框架集成**：充分利用 MNUtils 基础设施
3. **错误处理系统**：完善的错误捕获和日志记录
4. **配置管理**：灵活的配置系统和加密存储

### 9.3 用户体验
1. **学习模式感知**：根据模式自动显示/隐藏
2. **免费模型支持**：提供多个免费 AI 模型选项
3. **实时进度反馈**：PDF OCR 的进度显示
4. **快捷操作**：多种 OCR 目标选择

## 10. 开发指南

### 10.1 环境准备

```bash
# 1. 确保安装 MNUtils 插件
# 2. 克隆项目
git clone [repository]

# 3. 进入插件目录
cd mnocr/mnocr

# 4. 打包插件
mnaddon4 build

# 5. 安装到 MarginNote 4
# 将生成的 .mnaddon 文件拖入应用
```

### 10.2 调试技巧

#### 10.2.1 日志调试
```javascript
// 使用 MNUtil.log 记录日志
MNUtil.log({
  source: "MN OCR",
  message: "调试信息",
  level: "INFO",
  detail: JSON.stringify(data)
})

// 复制对象到剪贴板
MNUtil.copyJSON(complexObject)
```

#### 10.2.2 错误追踪
```javascript
// 查看错误历史
ocrUtils.errorLog

// 错误自动复制到剪贴板
// 可直接粘贴查看详细信息
```

#### 10.2.3 UI 调试
```javascript
// 显示临时消息
MNUtil.showHUD("Debug: " + value)

// 检查视图层级
MNUtil.isDescendantOfStudyView(view)

// 帧调试
console.log(ocrController.currentFrame)
```

### 10.3 扩展开发

#### 10.3.1 添加新的 OCR 服务
```javascript
// 1. 在 ocrNetwork 中添加服务方法
static async newServiceOCR(imageData) {
  // 实现 OCR 逻辑
}

// 2. 在 OCR 统一接口中添加分支
case "NewService":
  res = await this.newServiceOCR(imageData)
  break

// 3. 在配置中添加模型信息
"new-model": {
  title: "New Model",
  model: "new-model-api",
  isFree: false
}
```

#### 10.3.2 自定义 UI 按钮
```javascript
// 1. 创建按钮
self.customButton = self.createButton("customAction:", "ocrView")
MNButton.setTitle(self.customButton, "Custom OCR", 15, true)

// 2. 设置布局
self.customButton.frame = {x: 15, y: 290, width: 230, height: 33}

// 3. 实现动作
customAction: function(button) {
  // 自定义逻辑
}
```

## 11. 最佳实践

### 11.1 代码规范
1. **命名规范**：使用驼峰命名，类名大写开头
2. **注释规范**：关键逻辑添加中文注释
3. **错误处理**：所有异步操作包装 try-catch
4. **日志记录**：重要操作记录日志

### 11.2 性能建议
1. **使用缓存**：重复 OCR 请求应使用缓存
2. **批量操作**：多个修改使用 undoGrouping
3. **延迟加载**：非关键组件延迟初始化
4. **内存管理**：及时释放大对象引用

### 11.3 用户体验
1. **进度提示**：长时间操作显示进度
2. **错误反馈**：友好的错误提示信息
3. **默认配置**：提供合理的默认值
4. **快捷操作**：减少用户操作步骤

## 12. 技术总结

MNOCR 插件展示了 MarginNote 4 插件开发的最佳实践：

### 12.1 架构设计
- **简洁高效**：单控制器架构降低复杂度
- **模块化**：清晰的类职责划分
- **可扩展**：易于添加新的 OCR 服务

### 12.2 技术实现
- **深度集成**：充分利用 MNUtils 框架
- **统一接口**：标准化的服务调用
- **智能缓存**：多级缓存提升性能

### 12.3 用户价值
- **功能丰富**：支持多种 OCR 场景
- **操作便捷**：直观的浮动面板设计
- **稳定可靠**：完善的错误处理机制

## 13. 未来展望

### 13.1 功能增强
- 批量 OCR 处理
- OCR 结果编辑器
- 自定义后处理脚本
- 更多 AI 模型支持

### 13.2 性能优化
- 并发请求处理
- 增量 OCR 识别
- 本地模型支持
- 云端结果同步

### 13.3 用户体验
- 手势快捷操作
- OCR 历史记录
- 智能纠错建议
- 多语言支持

---

*本文档基于 MNOCR v0.0.4.alpha0818 版本分析，作为 MarginNote 4 插件开发教程的技术基础。*