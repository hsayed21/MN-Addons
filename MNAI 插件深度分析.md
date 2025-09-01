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

## AI 集成实现

### 支持的 AI 模型

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