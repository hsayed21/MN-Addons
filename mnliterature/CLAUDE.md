# MNLiterature OCR 和 AI 功能实现指南

> 本文档记录了 MNLiterature 插件中 OCR 和 AI 功能的完整实现方案，包括调用其他插件和独立实现两种方式。
> 遇到困难时，本文档只做参考，具体看 [MNAI](../mnai/mnchatglm) 和 [MNOCR](../mnocr/mnocr) 两个成熟插件的具体代码，以及参考 [MNToolbar](../mntoolbar/mntoolbar) 的 ocrAsProofTitle 功能代码。

## 目录

1. [快速开始](#快速开始)
2. [核心概念](#核心概念)
3. [方案一：调用其他插件](#方案一调用其他插件插件协作)
4. [方案二：独立实现](#方案二独立实现完全自包含)
5. [集成步骤](#集成步骤)
6. [API 参考](#api-参考)
7. [常见问题](#常见问题)

---

## 快速开始

### 功能概述

MNLiterature 将实现以下功能：
- **OCR 识别**：将图片中的文字提取出来
- **AI 处理**：对文本进行翻译、总结等智能处理
- **插件协作**：与 MNOCR、MNAI 等插件协同工作

### 使用场景

1. 选中包含文字的图片 → OCR 识别 → 设置为卡片标题
2. 识别外文文献 → 自动翻译 → 生成中文笔记
3. 截图公式 → 识别 LaTeX → 插入到笔记

---

## 核心概念

### 1. 网络请求基础

#### 请求流程
```
准备数据 → 创建请求 → 发送请求 → 等待响应 → 处理结果
```

#### 关键对象
- `NSMutableURLRequest` - 请求对象
- `NSURLConnection` - 网络连接
- `NSJSONSerialization` - JSON 处理

### 2. 图片处理

```javascript
// 获取图片
let imageData = MNUtil.getDocImage(true, true);  // 从文档获取
let imageData = MNNote.getImageFromNote(note);   // 从卡片获取

// 转换为 base64（AI 需要文本格式）
const imageBase64 = imageData.base64EncodedStringWithOptions(0);
```

### 3. 异步处理

```javascript
// 使用 Promise 处理异步操作
async function doOCR() {
  const result = await sendRequest();  // 等待结果
  return result;
}

// 使用 async/await 让代码更简洁
```

---

## 方案一：调用其他插件（插件协作）

### 实现文件：`literature_plugin_integration.js`

```javascript
// literature_plugin_integration.js
// 学习如何调用 MNOCR 和 MNAI 插件

class LiteraturePluginIntegration {
  
  // ============ 调用 MNOCR 插件 ============
  
  /**
   * 检查并调用 MNOCR 进行 OCR
   * @param {NSData} imageData - 图片数据
   * @returns {Promise<string>} OCR 结果文本
   */
  static async ocrWithPlugin(imageData) {
    try {
      // 检查 MNOCR 插件是否存在
      if (typeof ocrNetwork === "undefined") {
        MNUtil.showHUD("❌ 请先安装 MNOCR 插件");
        return null;
      }
      
      MNUtil.showHUD("使用 MNOCR 识别中...");
      
      // 调用 MNOCR 的 OCR 功能
      // 参数说明：
      // - imageData: 图片数据
      // - source: OCR 源（"Doc2X", "SimpleTex", "GPT-4o" 等）
      // - buffer: 是否缓存结果（true/false）
      const ocrResult = await ocrNetwork.OCR(imageData, "GPT-4o", true);
      
      if (ocrResult) {
        MNUtil.showHUD("✅ OCR 识别成功");
        return ocrResult;
      } else {
        MNUtil.showHUD("❌ OCR 识别失败");
        return null;
      }
      
    } catch (error) {
      MNUtil.showHUD("❌ 调用 MNOCR 失败: " + error.message);
      return null;
    }
  }
  
  /**
   * 选择 OCR 源并识别
   */
  static async ocrWithSourceSelection() {
    const focusNote = MNNote.getFocusNote();
    if (!focusNote) {
      MNUtil.showHUD("请先选择一个卡片");
      return;
    }
    
    // 获取图片
    let imageData = MNUtil.getDocImage(true, true);
    if (!imageData) {
      imageData = MNNote.getImageFromNote(focusNote);
    }
    
    if (!imageData) {
      MNUtil.showHUD("未找到图片");
      return;
    }
    
    // OCR 源选项（与 MNOCR 保持一致）
    const sources = [
      { name: "Doc2X - 专业文档", value: "Doc2X" },
      { name: "SimpleTex - 数学公式", value: "SimpleTex" },
      { name: "GPT-4o - OpenAI", value: "GPT-4o" },
      { name: "GLM-4V - 智谱AI", value: "glm-4v-flash" },
      { name: "Claude 3.5", value: "claude-3-5-sonnet-20241022" }
    ];
    
    const sourceNames = sources.map(s => s.name);
    const selected = await MNUtil.userSelect("选择 OCR 引擎", "", sourceNames);
    
    if (selected === 0) return;  // 用户取消
    
    const selectedSource = sources[selected - 1];
    
    // 调用 MNOCR
    if (typeof ocrNetwork !== "undefined") {
      const result = await ocrNetwork.OCR(imageData, selectedSource.value, true);
      if (result) {
        MNUtil.undoGrouping(() => {
          focusNote.noteTitle = result;
        });
        MNUtil.showHUD("✅ 已设置为标题");
      }
    } else {
      MNUtil.showHUD("请安装 MNOCR 插件");
    }
  }
  
  // ============ 调用 MNAI 插件 ============
  
  /**
   * 通过 URL Scheme 调用 MNAI
   * @param {string} text - 要处理的文本
   * @param {string} action - 动作类型 (ask/vision/prompt)
   */
  static async callMNAIWithURLScheme(text, action = "ask") {
    // MNAI 支持的 URL Scheme 格式：
    // marginnote4app://addon/mnchatai?action=xxx&user=xxx&prompt=xxx
    
    const encodedText = encodeURIComponent(text);
    
    // 不同的调用方式
    switch (action) {
      case "ask":
        // 直接提问
        const askUrl = `marginnote4app://addon/mnchatai?action=ask&user=${encodedText}`;
        MNUtil.openURL(askUrl);
        break;
        
      case "vision":
        // 视觉识别模式
        const visionUrl = `marginnote4app://addon/mnchatai?action=ask&user=${encodedText}&mode=vision`;
        MNUtil.openURL(visionUrl);
        break;
        
      case "prompt":
        // 执行特定 prompt
        const promptName = "翻译成中文";  // MNAI 中预设的 prompt 名称
        const promptUrl = `marginnote4app://addon/mnchatai?action=executeprompt&prompt=${encodeURIComponent(promptName)}&user=${encodedText}`;
        MNUtil.openURL(promptUrl);
        break;
    }
    
    MNUtil.showHUD("已发送到 MNAI 处理");
  }
  
  /**
   * 通过事件通知调用 MNAI（更高级）
   */
  static async callMNAIWithNotification(text, promptKey) {
    // 发送广播通知，MNAI 会监听这个事件
    MNUtil.postNotification("AddonBroadcast", {
      message: `mnchatai?action=ask&user=${encodeURIComponent(text)}`
    });
    
    MNUtil.showHUD("已通过事件发送到 MNAI");
  }
  
  /**
   * 完整流程：OCR + AI 处理
   */
  static async ocrThenAI() {
    try {
      // 获取卡片和图片
      const focusNote = MNNote.getFocusNote();
      if (!focusNote) {
        MNUtil.showHUD("请先选择一个卡片");
        return;
      }
      
      let imageData = MNUtil.getDocImage(true, true);
      if (!imageData) {
        imageData = MNNote.getImageFromNote(focusNote);
      }
      
      if (!imageData) {
        MNUtil.showHUD("未找到图片");
        return;
      }
      
      // 步骤1：使用 MNOCR 识别
      if (typeof ocrNetwork === "undefined") {
        MNUtil.showHUD("请安装 MNOCR 插件");
        return;
      }
      
      MNUtil.showHUD("正在识别文字...");
      const ocrText = await ocrNetwork.OCR(imageData, "GPT-4o", true);
      
      if (!ocrText) {
        MNUtil.showHUD("OCR 识别失败");
        return;
      }
      
      // 步骤2：选择 AI 处理方式
      const actions = [
        "直接使用 OCR 结果",
        "翻译成中文",
        "总结要点",
        "解释内容"
      ];
      
      const selected = await MNUtil.userSelect("选择处理方式", ocrText.substring(0, 50) + "...", actions);
      
      switch (selected) {
        case 0:  // 取消
          return;
          
        case 1:  // 直接使用
          MNUtil.undoGrouping(() => {
            focusNote.noteTitle = ocrText;
          });
          MNUtil.showHUD("✅ 已设置为标题");
          break;
          
        case 2:  // 翻译
          this.callMNAIWithURLScheme(ocrText, "prompt");
          break;
          
        case 3:  // 总结
        case 4:  // 解释
          this.callMNAIWithURLScheme(ocrText, "ask");
          break;
      }
      
    } catch (error) {
      MNUtil.showHUD("❌ 处理失败: " + error.message);
    }
  }
}

// 导出供其他文件使用
if (typeof module !== 'undefined') {
  module.exports = LiteraturePluginIntegration;
}
```

---

## 方案二：独立实现（完全自包含）

### 实现文件：`literature_standalone_ocr.js`

```javascript
// literature_standalone_ocr.js
// 学习如何独立实现网络请求

class LiteratureStandaloneOCR {
  
  // ============ 核心网络请求封装 ============
  
  /**
   * 创建网络请求
   * @param {string} url - 请求地址
   * @param {Object} options - 请求选项
   * @returns {NSMutableURLRequest} 请求对象
   */
  static createRequest(url, options = {}) {
    const request = NSMutableURLRequest.requestWithURL(NSURL.URLWithString(url));
    
    // 设置请求方法（GET/POST）
    request.setHTTPMethod(options.method || "POST");
    
    // 设置超时时间
    request.setTimeoutInterval(options.timeout || 30);
    
    // 设置请求头
    const headers = {
      "Content-Type": "application/json",
      "User-Agent": "MarginNote/4.0",
      ...options.headers  // 合并自定义请求头
    };
    request.setAllHTTPHeaderFields(headers);
    
    // 设置请求体
    if (options.body) {
      const jsonData = NSJSONSerialization.dataWithJSONObjectOptions(options.body, 0);
      request.setHTTPBody(jsonData);
    }
    
    return request;
  }
  
  /**
   * 发送请求并获取响应
   * @param {NSMutableURLRequest} request - 请求对象
   * @returns {Promise<Object>} 响应数据
   */
  static async sendRequest(request) {
    return new Promise((resolve, reject) => {
      NSURLConnection.sendAsynchronousRequestQueueCompletionHandler(
        request,
        NSOperationQueue.mainQueue(),
        (response, data, error) => {
          // 错误处理
          if (error && error.localizedDescription) {
            reject(new Error(error.localizedDescription));
            return;
          }
          
          // 解析响应
          try {
            const result = NSJSONSerialization.JSONObjectWithDataOptions(data, 0);
            resolve(result);
          } catch (parseError) {
            reject(new Error("解析响应失败"));
          }
        }
      );
    });
  }
  
  // ============ OCR 实现 ============
  
  /**
   * 使用免费 API 的 OCR
   * @param {NSData} imageData - 图片数据
   * @returns {Promise<string>} OCR 结果
   */
  static async freeOCR(imageData) {
    try {
      MNUtil.waitHUD("正在识别文字...");
      
      // 免费 API 配置（来自 mnutils）
      const apiKey = 'sk-S2rXjj2qB98OiweU46F3BcF2D36e4e5eBfB2C9C269627e44';
      const url = 'https://sub.flynotes.cn/v1/chat/completions';
      
      // 将图片转换为 base64
      const imageBase64 = imageData.base64EncodedStringWithOptions(0);
      
      // 构建请求
      const request = this.createRequest(url, {
        method: "POST",
        timeout: 60,
        headers: {
          "Authorization": `Bearer ${apiKey}`
        },
        body: {
          model: "glm-4v-flash",
          messages: [{
            role: "user",
            content: [
              {
                type: "text",
                text: "请识别并输出图片中的所有文字，保持原始格式和换行"
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/png;base64,${imageBase64}`
                }
              }
            ]
          }],
          temperature: 0.3,
          max_tokens: 2000
        }
      });
      
      // 发送请求
      const response = await this.sendRequest(request);
      
      MNUtil.stopHUD();
      
      // 提取结果
      if (response && response.choices && response.choices[0]) {
        const text = response.choices[0].message.content;
        return this.cleanOCRText(text);
      }
      
      return null;
      
    } catch (error) {
      MNUtil.stopHUD();
      throw error;
    }
  }
  
  /**
   * 使用付费 API（需要用户自己的 key）
   * @param {NSData} imageData - 图片数据
   * @param {string} apiKey - API Key
   * @param {string} model - 模型名称
   * @returns {Promise<string>} OCR 结果
   */
  static async paidOCR(imageData, apiKey, model = "gpt-4-vision-preview") {
    try {
      MNUtil.waitHUD(`使用 ${model} 识别中...`);
      
      // OpenAI API 配置
      const url = 'https://api.openai.com/v1/chat/completions';
      
      const imageBase64 = imageData.base64EncodedStringWithOptions(0);
      
      const request = this.createRequest(url, {
        method: "POST",
        timeout: 60,
        headers: {
          "Authorization": `Bearer ${apiKey}`
        },
        body: {
          model: model,
          messages: [{
            role: "user",
            content: [
              {
                type: "text",
                text: "Extract all text from this image, maintaining the original format."
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`,
                  detail: "high"  // 高精度识别
                }
              }
            ]
          }],
          max_tokens: 4096
        }
      });
      
      const response = await this.sendRequest(request);
      
      MNUtil.stopHUD();
      
      if (response && response.choices && response.choices[0]) {
        return response.choices[0].message.content;
      }
      
      return null;
      
    } catch (error) {
      MNUtil.stopHUD();
      throw error;
    }
  }
  
  // ============ AI 处理 ============
  
  /**
   * AI 文本处理（翻译、总结等）
   * @param {string} text - 要处理的文本
   * @param {string} instruction - 处理指令
   * @returns {Promise<string>} 处理结果
   */
  static async processTextWithAI(text, instruction) {
    try {
      MNUtil.waitHUD("AI 处理中...");
      
      const apiKey = 'sk-S2rXjj2qB98OiweU46F3BcF2D36e4e5eBfB2C9C269627e44';
      const url = 'https://sub.flynotes.cn/v1/chat/completions';
      
      const request = this.createRequest(url, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`
        },
        body: {
          model: "glm-4v-flash",
          messages: [
            {
              role: "system",
              content: instruction  // 例如："请将以下内容翻译成中文"
            },
            {
              role: "user",
              content: text
            }
          ],
          temperature: 0.7,
          max_tokens: 2000
        }
      });
      
      const response = await this.sendRequest(request);
      
      MNUtil.stopHUD();
      
      if (response && response.choices && response.choices[0]) {
        return response.choices[0].message.content;
      }
      
      return null;
      
    } catch (error) {
      MNUtil.stopHUD();
      throw error;
    }
  }
  
  // ============ 工具函数 ============
  
  /**
   * 清理 OCR 文本
   * @param {string} text - 原始文本
   * @returns {string} 清理后的文本
   */
  static cleanOCRText(text) {
    return text
      .replace(/```/g, '')           // 去掉代码块标记
      .replace(/\$\$\s*/g, '')        // 去掉数学公式标记
      .replace(/\s*\$\$/g, '')
      .replace(/\\\[/g, '')           // 去掉 LaTeX 标记
      .replace(/\\\]/g, '')
      .trim();
  }
  
  /**
   * 获取 API Key
   * @returns {string} API Key
   */
  static getAPIKey() {
    // 从 mnutils 获取统一的 API Key
    if (typeof subscriptionConfig !== 'undefined' && subscriptionConfig.APIKey) {
      return subscriptionConfig.APIKey;
    }
    
    // 从本地存储获取
    const savedKey = NSUserDefaults.standardUserDefaults().objectForKey("LiteratureAPIKey");
    return savedKey;
  }
  
  /**
   * 设置 API Key
   * @returns {Promise<string>} 设置的 API Key
   */
  static async setAPIKey() {
    const key = await MNUtil.input("设置 API Key", "请输入你的 API Key");
    if (key) {
      NSUserDefaults.standardUserDefaults().setObjectForKey(key, "LiteratureAPIKey");
      MNUtil.showHUD("✅ API Key 已保存");
      return key;
    }
    return null;
  }
  
  // ============ 完整功能示例 ============
  
  /**
   * 完整的 OCR 到标题功能
   */
  static async ocrToTitle() {
    try {
      // 获取卡片
      const focusNote = MNNote.getFocusNote();
      if (!focusNote) {
        MNUtil.showHUD("请先选择一个卡片");
        return;
      }
      
      // 获取图片
      let imageData = MNUtil.getDocImage(true, true);
      if (!imageData) {
        imageData = MNNote.getImageFromNote(focusNote);
      }
      
      if (!imageData) {
        MNUtil.showHUD("未找到图片");
        return;
      }
      
      // 执行 OCR
      const ocrText = await this.freeOCR(imageData);
      
      if (ocrText) {
        MNUtil.undoGrouping(() => {
          focusNote.noteTitle = ocrText;
        });
        MNUtil.showHUD("✅ 已设置为标题");
      } else {
        MNUtil.showHUD("❌ OCR 失败");
      }
      
    } catch (error) {
      MNUtil.showHUD("❌ 错误: " + error.message);
    }
  }
  
  /**
   * OCR + AI 处理
   */
  static async ocrAndTranslate() {
    try {
      const focusNote = MNNote.getFocusNote();
      if (!focusNote) {
        MNUtil.showHUD("请先选择一个卡片");
        return;
      }
      
      let imageData = MNUtil.getDocImage(true, true);
      if (!imageData) {
        imageData = MNNote.getImageFromNote(focusNote);
      }
      
      if (!imageData) {
        MNUtil.showHUD("未找到图片");
        return;
      }
      
      // 步骤1：OCR
      const ocrText = await this.freeOCR(imageData);
      if (!ocrText) {
        MNUtil.showHUD("OCR 失败");
        return;
      }
      
      // 步骤2：选择处理方式
      const actions = [
        "原文",
        "翻译成中文",
        "翻译成英文",
        "总结要点",
        "简化解释"
      ];
      
      const selected = await MNUtil.userSelect("选择处理方式", ocrText.substring(0, 50) + "...", actions);
      
      let finalText = ocrText;
      
      switch (selected) {
        case 0:  // 取消
          return;
        case 1:  // 原文
          break;
        case 2:  // 翻译中文
          finalText = await this.processTextWithAI(ocrText, "请将以下内容翻译成中文，保持专业术语准确");
          break;
        case 3:  // 翻译英文
          finalText = await this.processTextWithAI(ocrText, "Please translate the following into English");
          break;
        case 4:  // 总结
          finalText = await this.processTextWithAI(ocrText, "请用3-5句话总结以下内容的要点");
          break;
        case 5:  // 解释
          finalText = await this.processTextWithAI(ocrText, "请用简单易懂的语言解释以下内容");
          break;
      }
      
      if (finalText) {
        MNUtil.undoGrouping(() => {
          focusNote.noteTitle = finalText;
        });
        MNUtil.showHUD("✅ 处理完成");
      }
      
    } catch (error) {
      MNUtil.showHUD("❌ 错误: " + error.message);
    }
  }
  
  /**
   * 批量 OCR 处理
   */
  static async batchOCR() {
    const focusNotes = MNNote.getFocusNotes();
    if (focusNotes.length === 0) {
      MNUtil.showHUD("请选择要处理的卡片");
      return;
    }
    
    let successCount = 0;
    
    for (let i = 0; i < focusNotes.length; i++) {
      const note = focusNotes[i];
      const imageData = MNNote.getImageFromNote(note);
      
      if (imageData) {
        try {
          MNUtil.showHUD(`处理中 ${i+1}/${focusNotes.length}`);
          const ocrText = await this.freeOCR(imageData);
          
          if (ocrText) {
            MNUtil.undoGrouping(() => {
              note.noteTitle = ocrText;
            });
            successCount++;
          }
        } catch (error) {
          // 单个失败不影响其他
        }
      }
    }
    
    MNUtil.showHUD(`✅ 完成 ${successCount}/${focusNotes.length}`);
  }
}

// 导出供其他文件使用
if (typeof module !== 'undefined') {
  module.exports = LiteratureStandaloneOCR;
}
```

---

## 集成步骤

### 1. 在主文件中添加模块加载

```javascript
// 在 mnliterature 主文件开头
JSB.require('literature_plugin_integration');
JSB.require('literature_standalone_ocr');
```

### 2. 添加事件监听

```javascript
// 在 sceneWillConnect 中添加
sceneWillConnect: function() {
  // ... 原有代码 ...
  
  // 添加事件监听（用于插件间通信）
  MNUtil.addObserver(self, "OCRFinished", "onOCRFinished:");
  MNUtil.addObserver(self, "AddonBroadcast", "onAddonBroadcast:");
}

// 处理 OCR 完成事件
onOCRFinished: function(sender) {
  const data = sender.userInfo;
  if (data && data.result) {
    MNUtil.showHUD("收到 OCR 结果: " + data.result.substring(0, 20) + "...");
    // 可以在这里进一步处理
  }
}

// 处理插件间广播
onAddonBroadcast: function(sender) {
  const message = sender.userInfo.message;
  if (message && message.includes("mnliterature")) {
    // 处理发给自己的消息
    const params = MNUtil.parseURL("marginnote4app://addon/" + message).params;
    this.handleBroadcast(params);
  }
}
```

### 3. 添加用户界面

```javascript
// 添加菜单或按钮
toggleAddon: function(button) {
  const menu = [
    { title: "📷 OCR 识别（调用插件）", selector: "ocrWithPlugin:" },
    { title: "📷 OCR 识别（独立实现）", selector: "ocrStandalone:" },
    { title: "🤖 OCR + AI 翻译", selector: "ocrAndTranslate:" },
    { title: "📦 批量 OCR", selector: "batchOCR:" },
    { title: "⚙️ 设置 API Key", selector: "setAPIKey:" }
  ];
  
  MNUtil.showMenu(menu, button);
}

// 实现各个功能
ocrWithPlugin: function() {
  LiteraturePluginIntegration.ocrWithSourceSelection();
}

ocrStandalone: function() {
  LiteratureStandaloneOCR.ocrToTitle();
}

ocrAndTranslate: function() {
  LiteratureStandaloneOCR.ocrAndTranslate();
}

batchOCR: function() {
  LiteratureStandaloneOCR.batchOCR();
}

setAPIKey: function() {
  LiteratureStandaloneOCR.setAPIKey();
}
```

---

## API 参考

### MNUtils API

| 函数 | 说明 | 示例 |
|------|------|------|
| `MNUtil.getDocImage(x, y)` | 获取文档图片 | `MNUtil.getDocImage(true, true)` |
| `MNNote.getImageFromNote(note)` | 从卡片获取图片 | `MNNote.getImageFromNote(focusNote)` |
| `MNUtil.showHUD(msg)` | 显示提示 | `MNUtil.showHUD("处理中...")` |
| `MNUtil.waitHUD(msg)` | 显示等待提示 | `MNUtil.waitHUD("加载中...")` |
| `MNUtil.stopHUD()` | 停止等待提示 | `MNUtil.stopHUD()` |
| `MNUtil.undoGrouping(fn)` | 支持撤销的操作 | `MNUtil.undoGrouping(() => {...})` |
| `MNUtil.userSelect(title, msg, options)` | 用户选择 | `await MNUtil.userSelect(...)` |
| `MNUtil.input(title, msg)` | 用户输入 | `await MNUtil.input(...)` |

### MNOCR API

| 函数 | 说明 | 参数 |
|------|------|------|
| `ocrNetwork.OCR(imageData, source, buffer)` | 执行 OCR | imageData: 图片数据<br>source: OCR 源<br>buffer: 是否缓存 |

### MNAI URL Scheme

| 动作 | URL 格式 | 说明 |
|------|----------|------|
| 提问 | `marginnote4app://addon/mnchatai?action=ask&user=xxx` | 直接提问 |
| 视觉 | `marginnote4app://addon/mnchatai?action=ask&mode=vision&user=xxx` | 视觉识别 |
| Prompt | `marginnote4app://addon/mnchatai?action=executeprompt&prompt=xxx&user=xxx` | 执行预设 |

### 网络请求 API

| 类/函数 | 说明 | 用法 |
|---------|------|------|
| `NSMutableURLRequest` | 创建请求 | `NSMutableURLRequest.requestWithURL(url)` |
| `setHTTPMethod()` | 设置方法 | `request.setHTTPMethod("POST")` |
| `setAllHTTPHeaderFields()` | 设置请求头 | `request.setAllHTTPHeaderFields(headers)` |
| `setHTTPBody()` | 设置请求体 | `request.setHTTPBody(data)` |
| `NSURLConnection` | 发送请求 | `NSURLConnection.sendAsynchronousRequestQueueCompletionHandler()` |
| `NSJSONSerialization` | JSON 处理 | `NSJSONSerialization.dataWithJSONObjectOptions()` |

---

## 常见问题

### Q1: 为什么要把图片转换成 base64？

**答**：AI 接口只能接收文本数据，不能直接接收二进制图片文件。base64 是一种将二进制数据编码成文本的标准方法，就像把图片"翻译"成了 AI 能理解的文字。

### Q2: Promise 和 async/await 是什么？

**答**：
- **Promise**：表示一个异步操作的最终结果，就像一个"承诺"，说"我会在未来某个时候给你结果"
- **async/await**：让异步代码看起来像同步代码的语法糖，使代码更易读

```javascript
// 传统回调方式（复杂）
sendRequest(function(result) {
  processResult(result, function(processed) {
    saveResult(processed);
  });
});

// 使用 async/await（简洁）
async function doWork() {
  const result = await sendRequest();
  const processed = await processResult(result);
  await saveResult(processed);
}
```

### Q3: 如何处理网络请求错误？

**答**：使用 try/catch 捕获错误：

```javascript
try {
  const result = await sendRequest();
  // 处理结果
} catch (error) {
  MNUtil.showHUD("错误: " + error.message);
  // 记录错误日志
  if (typeof MNUtil.log !== 'undefined') {
    MNUtil.log("OCR Error: " + error);
  }
}
```

### Q4: 如何调试网络请求？

**答**：
1. 使用 `MNUtil.copyJSON()` 查看请求和响应数据
2. 使用 `MNUtil.log()` 记录关键步骤
3. 使用 `MNUtil.showHUD()` 显示当前状态

```javascript
// 调试示例
const request = createRequest(url, options);
MNUtil.copyJSON(options.body);  // 复制请求数据到剪贴板
MNUtil.log("Sending request to: " + url);

const response = await sendRequest(request);
MNUtil.copyJSON(response);  // 复制响应数据
MNUtil.log("Response received");
```

### Q5: OCR 结果不准确怎么办？

**答**：
1. 确保图片清晰，分辨率足够
2. 尝试不同的 OCR 源（Doc2X 适合文档，SimpleTex 适合公式）
3. 调整 prompt，让 AI 更准确理解需求
4. 使用高精度模式（`detail: "high"`）

### Q6: 如何优化 OCR 速度？

**答**：
1. 使用缓存（`buffer: true`）避免重复识别
2. 选择合适的模型（glm-4v-flash 速度快）
3. 限制图片大小，压缩后再发送
4. 批量处理时使用队列，避免并发过多

### Q7: API Key 安全性？

**答**：
1. 不要把 API Key 硬编码在代码中
2. 使用 `NSUserDefaults` 安全存储
3. 考虑使用代理服务器中转请求
4. 定期更换 API Key

---

## 下一步计划

1. **功能扩展**
   - 添加更多 OCR 源支持
   - 实现自定义 prompt 管理
   - 添加历史记录功能

2. **性能优化**
   - 实现请求队列管理
   - 添加本地缓存机制
   - 优化图片压缩算法

3. **用户体验**
   - 添加进度条显示
   - 实现拖拽操作
   - 支持快捷键

4. **插件协作**
   - 与更多插件集成
   - 实现数据共享机制
   - 建立统一的通信协议

---

## 更新日志

### 2025-01-12
- 初始版本
- 实现基础 OCR 功能
- 添加 AI 处理能力
- 支持插件间调用

---

## 联系方式

如有问题或建议，请通过以下方式联系：
- GitHub Issues
- MarginNote 论坛

---

*本文档会持续更新，请关注最新版本*