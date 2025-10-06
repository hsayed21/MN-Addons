# 第三部分：核心技术篇

## 第9章：网络请求与API集成

### 9.1 网络请求基础

在现代插件开发中，网络请求是核心功能之一。MarginNote 插件基于 iOS 平台，我们使用 NSURLSession 来处理网络通信。

#### 9.1.1 HTTP 客户端封装

让我们看看如何构建一个强大的网络请求客户端。以 MNAI 插件中的 GPTClient 为例：

```javascript
// 基础网络客户端
class NetworkClient {
  constructor(baseURL, apiKey) {
    this.baseURL = baseURL;
    this.apiKey = apiKey;
    this.headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    };
  }
  
  // POST 请求方法
  async post(endpoint, data) {
    const url = this.baseURL + endpoint;
    const body = JSON.stringify(data);
    
    return new Promise((resolve, reject) => {
      const request = NSMutableURLRequest.requestWithURL(NSURL.URLWithString(url));
      request.setHTTPMethod("POST");
      request.setHTTPBody(NSString.stringWithString(body).dataUsingEncoding(4));
      
      // 设置请求头
      Object.keys(this.headers).forEach(key => {
        request.setValue_forHTTPHeaderField(this.headers[key], key);
      });
      
      const session = NSURLSession.sharedSession();
      const task = session.dataTaskWithRequest_completionHandler(request, (data, response, error) => {
        if (error) {
          reject(error);
          return;
        }
        
        const responseString = NSString.alloc().initWithData_encoding(data, 4);
        try {
          const result = JSON.parse(responseString);
          resolve(result);
        } catch (parseError) {
          reject(parseError);
        }
      });
      
      task.resume();
    });
  }
}
```

#### 9.1.2 流式响应处理

对于 AI 对话等需要实时响应的场景，我们使用 Server-Sent Events (SSE) 处理流式数据：

```javascript
class StreamingClient extends NetworkClient {
  // 流式请求方法
  streamPost(endpoint, data, onMessage, onComplete) {
    const url = this.baseURL + endpoint;
    const body = JSON.stringify(data);
    
    const request = NSMutableURLRequest.requestWithURL(NSURL.URLWithString(url));
    request.setHTTPMethod("POST");
    request.setHTTPBody(NSString.stringWithString(body).dataUsingEncoding(4));
    
    // 设置流式请求头
    request.setValue_forHTTPHeaderField("application/json", "Content-Type");
    request.setValue_forHTTPHeaderField(`Bearer ${this.apiKey}`, "Authorization");
    request.setValue_forHTTPHeaderField("text/event-stream", "Accept");
    
    const session = NSURLSession.sharedSession();
    let responseData = NSMutableData.alloc().init();
    
    const task = session.dataTaskWithRequest_completionHandler(request, (data, response, error) => {
      if (error) {
        onComplete(error, null);
        return;
      }
      
      // 处理流式数据
      responseData.appendData(data);
      this.parseSSEData(responseData, onMessage);
      
      // 检查是否完成
      if (response.expectedContentLength > 0 && responseData.length >= response.expectedContentLength) {
        onComplete(null, "Stream completed");
      }
    });
    
    task.resume();
    return task;
  }
  
  // 解析 SSE 数据格式
  parseSSEData(data, onMessage) {
    const dataString = NSString.alloc().initWithData_encoding(data, 4);
    const lines = dataString.componentsSeparatedByString("\n");
    
    lines.forEach(line => {
      if (line.hasPrefix("data: ")) {
        const jsonString = line.substringFromIndex(6);
        if (jsonString !== "[DONE]") {
          try {
            const messageData = JSON.parse(jsonString);
            onMessage(messageData);
          } catch (e) {
            // 忽略解析错误
          }
        }
      }
    });
  }
}
```

### 9.2 实际应用：OCR服务集成

让我们看看 MNOCR 插件如何集成第三方 OCR 服务：

#### 9.2.1 OCR 客户端实现

```javascript
class OCRClient {
  constructor() {
    this.apiKey = MNUtil.getObjCClassDeclar("MNOCRUtils", "getSavedAPIKey");
    this.baseURL = "https://api.ocr.space/parse/image";
  }
  
  // OCR 图片识别
  async recognizeImage(imageData) {
    return new Promise((resolve, reject) => {
      const request = NSMutableURLRequest.requestWithURL(
        NSURL.URLWithString(this.baseURL)
      );
      request.setHTTPMethod("POST");
      
      // 构建 multipart/form-data
      const boundary = "----formdata-mn-ocr-" + Date.now();
      const contentType = `multipart/form-data; boundary=${boundary}`;
      request.setValue_forHTTPHeaderField(contentType, "Content-Type");
      request.setValue_forHTTPHeaderField(this.apiKey, "apikey");
      
      // 构建请求体
      const body = this.buildMultipartBody(boundary, imageData);
      request.setHTTPBody(body);
      
      const session = NSURLSession.sharedSession();
      const task = session.dataTaskWithRequest_completionHandler(request, 
        (data, response, error) => {
          if (error) {
            reject(this.handleError(error));
            return;
          }
          
          const result = this.parseOCRResponse(data);
          resolve(result);
        }
      );
      
      task.resume();
    });
  }
  
  // 构建 multipart 请求体
  buildMultipartBody(boundary, imageData) {
    const body = NSMutableData.alloc().init();
    const newline = NSString.stringWithString("\r\n").dataUsingEncoding(4);
    const boundaryData = NSString.stringWithString(`--${boundary}\r\n`).dataUsingEncoding(4);
    
    // 添加文件字段
    body.appendData(boundaryData);
    const fileHeader = NSString.stringWithString(
      'Content-Disposition: form-data; name="file"; filename="image.png"\r\n' +
      'Content-Type: image/png\r\n\r\n'
    ).dataUsingEncoding(4);
    body.appendData(fileHeader);
    body.appendData(imageData);
    body.appendData(newline);
    
    // 添加其他参数
    this.addFormField(body, boundary, "language", "chs");
    this.addFormField(body, boundary, "isOverlayRequired", "false");
    
    // 结束边界
    const endBoundary = NSString.stringWithString(`--${boundary}--\r\n`).dataUsingEncoding(4);
    body.appendData(endBoundary);
    
    return body;
  }
  
  // 添加表单字段
  addFormField(body, boundary, name, value) {
    const boundaryData = NSString.stringWithString(`--${boundary}\r\n`).dataUsingEncoding(4);
    const fieldData = NSString.stringWithString(
      `Content-Disposition: form-data; name="${name}"\r\n\r\n${value}\r\n`
    ).dataUsingEncoding(4);
    
    body.appendData(boundaryData);
    body.appendData(fieldData);
  }
}
```

#### 9.2.2 错误处理和重试机制

```javascript
class RobustOCRClient extends OCRClient {
  constructor() {
    super();
    this.maxRetries = 3;
    this.retryDelay = 1000;
  }
  
  // 带重试的OCR识别
  async recognizeImageWithRetry(imageData) {
    let lastError;
    
    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        const result = await this.recognizeImage(imageData);
        return result;
      } catch (error) {
        lastError = error;
        
        // 检查是否应该重试
        if (!this.shouldRetry(error) || attempt === this.maxRetries - 1) {
          break;
        }
        
        // 等待后重试
        await this.delay(this.retryDelay * (attempt + 1));
        MNUtil.showHUD(`OCR failed, retrying... (${attempt + 1}/${this.maxRetries})`);
      }
    }
    
    throw lastError;
  }
  
  // 判断是否应该重试
  shouldRetry(error) {
    // 网络错误或服务器暂时不可用时重试
    return error.code === -1001 || // 超时
           error.code === -1004 || // 无法连接到服务器
           (error.response && error.response.status >= 500); // 服务器错误
  }
  
  // 延迟函数
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

### 9.3 配置管理系统

#### 9.3.1 配置存储和读取

基于 MN WebDAV 插件的配置管理实践：

```javascript
class ConfigManager {
  constructor(pluginName) {
    this.pluginName = pluginName;
    this.configKey = `${pluginName}_config`;
  }
  
  // 获取配置
  getConfig(key, defaultValue = null) {
    try {
      const configStr = NSUserDefaults.standardUserDefaults().objectForKey(this.configKey);
      if (!configStr) return defaultValue;
      
      const config = JSON.parse(configStr);
      return key ? (config[key] || defaultValue) : config;
    } catch (error) {
      MNUtil.log(`配置读取失败: ${error.message}`);
      return defaultValue;
    }
  }
  
  // 设置配置
  setConfig(key, value) {
    try {
      let config = this.getConfig() || {};
      
      if (typeof key === 'object') {
        // 批量设置
        config = { ...config, ...key };
      } else {
        // 单个设置
        config[key] = value;
      }
      
      const configStr = JSON.stringify(config);
      NSUserDefaults.standardUserDefaults().setObject_forKey(configStr, this.configKey);
      NSUserDefaults.standardUserDefaults().synchronize();
      
      return true;
    } catch (error) {
      MNUtil.log(`配置保存失败: ${error.message}`);
      return false;
    }
  }
  
  // 删除配置项
  removeConfig(key) {
    const config = this.getConfig() || {};
    delete config[key];
    return this.setConfig(config);
  }
  
  // 重置所有配置
  resetConfig() {
    NSUserDefaults.standardUserDefaults().removeObjectForKey(this.configKey);
    NSUserDefaults.standardUserDefaults().synchronize();
  }
}
```

#### 9.3.2 配置验证和迁移

```javascript
class AdvancedConfigManager extends ConfigManager {
  constructor(pluginName) {
    super(pluginName);
    this.currentVersion = "1.0.0";
    this.migrations = {
      "0.9.0": this.migrateFrom090,
      "1.0.0": this.migrateFrom100
    };
  }
  
  // 初始化配置（包含版本检查和迁移）
  initializeConfig() {
    const config = this.getConfig() || {};
    const configVersion = config.version || "0.9.0";
    
    // 检查是否需要迁移
    if (configVersion !== this.currentVersion) {
      this.migrateConfig(configVersion);
    }
    
    // 验证配置完整性
    this.validateConfig();
  }
  
  // 配置迁移
  migrateConfig(fromVersion) {
    MNUtil.showHUD("正在更新插件配置...");
    
    try {
      for (let version in this.migrations) {
        if (this.compareVersion(fromVersion, version) < 0) {
          this.migrations[version].call(this);
          MNUtil.log(`已迁移配置到版本 ${version}`);
        }
      }
      
      // 更新版本号
      this.setConfig("version", this.currentVersion);
      MNUtil.showHUD("配置更新完成");
    } catch (error) {
      MNUtil.showHUD("配置迁移失败: " + error.message);
    }
  }
  
  // 从 0.9.0 版本迁移
  migrateFrom090() {
    const config = this.getConfig();
    
    // 重命名配置项
    if (config.serverUrl) {
      config.webdavUrl = config.serverUrl;
      delete config.serverUrl;
    }
    
    // 添加新的默认配置
    config.syncInterval = config.syncInterval || 300;
    
    this.setConfig(config);
  }
  
  // 配置验证
  validateConfig() {
    const config = this.getConfig() || {};
    const required = ['webdavUrl', 'username', 'password'];
    const missing = required.filter(key => !config[key]);
    
    if (missing.length > 0) {
      MNUtil.showHUD(`缺少必需配置: ${missing.join(', ')}`);
      return false;
    }
    
    return true;
  }
  
  // 版本号比较
  compareVersion(v1, v2) {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);
    
    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const part1 = parts1[i] || 0;
      const part2 = parts2[i] || 0;
      
      if (part1 < part2) return -1;
      if (part1 > part2) return 1;
    }
    
    return 0;
  }
}
```

## 第10章：插件间通信与事件系统

### 10.1 事件总线系统

插件间通信是复杂应用的重要需求。让我们构建一个强大的事件系统：

#### 10.1.1 基础事件总线

```javascript
class EventBus {
  constructor() {
    this.events = new Map();
  }
  
  // 注册事件监听器
  on(eventName, callback, context = null) {
    if (!this.events.has(eventName)) {
      this.events.set(eventName, []);
    }
    
    const listener = {
      callback,
      context,
      id: Date.now() + Math.random()
    };
    
    this.events.get(eventName).push(listener);
    return listener.id;
  }
  
  // 移除事件监听器
  off(eventName, listenerId) {
    if (!this.events.has(eventName)) return;
    
    const listeners = this.events.get(eventName);
    const index = listeners.findIndex(l => l.id === listenerId);
    
    if (index > -1) {
      listeners.splice(index, 1);
    }
  }
  
  // 触发事件
  emit(eventName, data = null) {
    if (!this.events.has(eventName)) return;
    
    const listeners = this.events.get(eventName);
    listeners.forEach(listener => {
      try {
        if (listener.context) {
          listener.callback.call(listener.context, data);
        } else {
          listener.callback(data);
        }
      } catch (error) {
        MNUtil.log(`事件处理错误 ${eventName}: ${error.message}`);
      }
    });
  }
  
  // 一次性监听器
  once(eventName, callback, context = null) {
    const listenerId = this.on(eventName, (data) => {
      callback.call(context, data);
      this.off(eventName, listenerId);
    });
    
    return listenerId;
  }
}

// 全局事件总线实例
const GlobalEventBus = new EventBus();
```

#### 10.1.2 插件间消息传递

```javascript
class InterPluginMessenger {
  constructor(pluginId) {
    this.pluginId = pluginId;
    this.messageQueue = [];
    this.initializeMessageChannel();
  }
  
  // 初始化消息通道
  initializeMessageChannel() {
    // 使用 NSNotificationCenter 实现跨插件通信
    const center = NSNotificationCenter.defaultCenter();
    
    center.addObserverForName_object_queue_usingBlock(
      `MNPluginMessage_${this.pluginId}`,
      null,
      NSOperationQueue.mainQueue(),
      (notification) => {
        this.handleIncomingMessage(notification.userInfo);
      }
    );
  }
  
  // 发送消息给其他插件
  sendMessage(targetPlugin, messageType, data) {
    const message = {
      from: this.pluginId,
      to: targetPlugin,
      type: messageType,
      data: data,
      timestamp: Date.now(),
      id: this.generateMessageId()
    };
    
    const center = NSNotificationCenter.defaultCenter();
    const userInfo = NSDictionary.dictionaryWithObject_forKey(
      JSON.stringify(message),
      "message"
    );
    
    center.postNotificationName_object_userInfo(
      `MNPluginMessage_${targetPlugin}`,
      null,
      userInfo
    );
    
    return message.id;
  }
  
  // 处理收到的消息
  handleIncomingMessage(userInfo) {
    try {
      const messageStr = userInfo.objectForKey("message");
      const message = JSON.parse(messageStr);
      
      // 验证消息格式
      if (!this.validateMessage(message)) {
        return;
      }
      
      // 触发消息事件
      GlobalEventBus.emit(`message:${message.type}`, message);
      GlobalEventBus.emit('message:received', message);
    } catch (error) {
      MNUtil.log(`消息处理失败: ${error.message}`);
    }
  }
  
  // 验证消息格式
  validateMessage(message) {
    return message && 
           message.from && 
           message.to === this.pluginId && 
           message.type && 
           message.id;
  }
  
  // 生成唯一消息ID
  generateMessageId() {
    return `${this.pluginId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
```

### 10.2 实际应用：截图插件通信

以 MNSnipaste 插件为例，看看如何与系统和其他插件协作：

#### 10.2.1 截图服务通信

```javascript
class ScreenshotService {
  constructor() {
    this.messenger = new InterPluginMessenger("MNSnipaste");
    this.setupEventHandlers();
  }
  
  // 设置事件处理器
  setupEventHandlers() {
    // 监听截图完成事件
    GlobalEventBus.on('screenshot:completed', this.handleScreenshotCompleted.bind(this));
    
    // 监听来自其他插件的截图请求
    GlobalEventBus.on('message:screenshot_request', this.handleScreenshotRequest.bind(this));
  }
  
  // 请求系统截图
  async requestScreenshot(options = {}) {
    return new Promise((resolve, reject) => {
      // 使用系统截图 API
      const task = NSTask.alloc().init();
      task.setLaunchPath("/usr/sbin/screencapture");
      
      // 设置截图参数
      const args = NSMutableArray.alloc().init();
      args.addObject("-i"); // 交互式选择
      args.addObject("-c"); // 复制到剪贴板
      
      if (options.format) {
        args.addObject("-t");
        args.addObject(options.format);
      }
      
      task.setArguments(args);
      
      // 监听完成事件
      const observer = NSNotificationCenter.defaultCenter();
      observer.addObserverForName_object_queue_usingBlock(
        "NSTaskDidTerminateNotification",
        task,
        NSOperationQueue.mainQueue(),
        (notification) => {
          const terminationStatus = task.terminationStatus();
          if (terminationStatus === 0) {
            this.processScreenshotResult(resolve);
          } else {
            reject(new Error(`截图失败，状态码: ${terminationStatus}`));
          }
        }
      );
      
      task.launch();
    });
  }
  
  // 处理截图结果
  processScreenshotResult(resolve) {
    // 从剪贴板获取截图
    const pasteboard = NSPasteboard.generalPasteboard();
    const imageData = pasteboard.dataForType("public.png");
    
    if (imageData) {
      const result = {
        imageData: imageData,
        timestamp: Date.now(),
        format: "png"
      };
      
      // 通知截图完成
      GlobalEventBus.emit('screenshot:completed', result);
      resolve(result);
    } else {
      resolve(null); // 用户取消了截图
    }
  }
  
  // 处理其他插件的截图请求
  async handleScreenshotRequest(message) {
    try {
      const options = message.data || {};
      const result = await this.requestScreenshot(options);
      
      // 回复请求方
      this.messenger.sendMessage(message.from, 'screenshot_response', {
        requestId: message.id,
        success: true,
        data: result
      });
    } catch (error) {
      this.messenger.sendMessage(message.from, 'screenshot_response', {
        requestId: message.id,
        success: false,
        error: error.message
      });
    }
  }
}
```

#### 10.2.2 图片处理和OCR集成

```javascript
class ImageProcessor {
  constructor(screenshotService) {
    this.screenshotService = screenshotService;
    this.ocrService = new OCRClient();
    this.setupProcessingPipeline();
  }
  
  // 设置处理管道
  setupProcessingPipeline() {
    GlobalEventBus.on('screenshot:completed', this.processImage.bind(this));
  }
  
  // 图片处理主流程
  async processImage(screenshotData) {
    if (!screenshotData || !screenshotData.imageData) return;
    
    try {
      MNUtil.showHUD("正在处理图片...");
      
      // 1. 图片预处理
      const processedImage = await this.preprocessImage(screenshotData.imageData);
      
      // 2. OCR识别（如果需要）
      let ocrResult = null;
      if (this.shouldPerformOCR()) {
        MNUtil.showHUD("正在识别文字...");
        ocrResult = await this.ocrService.recognizeImage(processedImage);
      }
      
      // 3. 保存处理结果
      const result = await this.saveProcessedImage(processedImage, ocrResult);
      
      // 4. 通知处理完成
      GlobalEventBus.emit('image:processed', {
        original: screenshotData,
        processed: result,
        ocr: ocrResult
      });
      
      MNUtil.showHUD("图片处理完成");
    } catch (error) {
      MNUtil.showHUD("图片处理失败: " + error.message);
    }
  }
  
  // 图片预处理
  async preprocessImage(imageData) {
    // 这里可以添加图片处理逻辑：
    // - 调整尺寸
    // - 增强对比度
    // - 去噪等
    
    return imageData; // 简化实现
  }
  
  // 判断是否需要OCR
  shouldPerformOCR() {
    const config = new ConfigManager("MNSnipaste");
    return config.getConfig("autoOCR", false);
  }
  
  // 保存处理后的图片
  async saveProcessedImage(imageData, ocrResult) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `screenshot_${timestamp}.png`;
    
    // 保存到插件目录
    const pluginPath = self.path;
    const imagePath = `${pluginPath}/screenshots/${filename}`;
    
    // 确保目录存在
    const fileManager = NSFileManager.defaultManager();
    const screenshotsDir = `${pluginPath}/screenshots`;
    fileManager.createDirectoryAtPath_withIntermediateDirectories_attributes_error(
      screenshotsDir, true, null, null
    );
    
    // 写入文件
    imageData.writeToFile_atomically(imagePath, true);
    
    return {
      path: imagePath,
      filename: filename,
      size: imageData.length,
      ocrText: ocrResult ? ocrResult.ParsedText : null
    };
  }
}
```

## 第11章：数据持久化与缓存

### 11.1 本地存储策略

#### 11.1.1 文件系统操作

```javascript
class FileStorage {
  constructor(pluginName) {
    this.pluginName = pluginName;
    this.basePath = self.path + "/data";
    this.initializeStorage();
  }
  
  // 初始化存储目录
  initializeStorage() {
    const fileManager = NSFileManager.defaultManager();
    
    if (!fileManager.fileExistsAtPath(this.basePath)) {
      fileManager.createDirectoryAtPath_withIntermediateDirectories_attributes_error(
        this.basePath, true, null, null
      );
    }
  }
  
  // 保存数据到文件
  async saveToFile(filename, data) {
    const filePath = `${this.basePath}/${filename}`;
    
    try {
      let content;
      if (typeof data === 'object') {
        content = JSON.stringify(data, null, 2);
      } else {
        content = data.toString();
      }
      
      const nsString = NSString.stringWithString(content);
      const success = nsString.writeToFile_atomically_encoding_error(
        filePath, true, 4, null
      );
      
      if (!success) {
        throw new Error(`无法保存文件: ${filename}`);
      }
      
      return filePath;
    } catch (error) {
      throw new Error(`保存失败: ${error.message}`);
    }
  }
  
  // 从文件读取数据
  async loadFromFile(filename, asJSON = true) {
    const filePath = `${this.basePath}/${filename}`;
    
    try {
      const fileManager = NSFileManager.defaultManager();
      if (!fileManager.fileExistsAtPath(filePath)) {
        return null;
      }
      
      const content = NSString.stringWithContentsOfFile_encoding_error(
        filePath, 4, null
      );
      
      if (asJSON) {
        return JSON.parse(content);
      } else {
        return content;
      }
    } catch (error) {
      throw new Error(`读取失败: ${error.message}`);
    }
  }
  
  // 删除文件
  async deleteFile(filename) {
    const filePath = `${this.basePath}/${filename}`;
    const fileManager = NSFileManager.defaultManager();
    
    if (fileManager.fileExistsAtPath(filePath)) {
      return fileManager.removeItemAtPath_error(filePath, null);
    }
    
    return true;
  }
  
  // 列出所有文件
  listFiles(extension = null) {
    const fileManager = NSFileManager.defaultManager();
    const files = fileManager.contentsOfDirectoryAtPath_error(this.basePath, null);
    
    if (!files) return [];
    
    const fileList = [];
    for (let i = 0; i < files.count(); i++) {
      const filename = files.objectAtIndex(i);
      if (!extension || filename.hasSuffix(extension)) {
        fileList.push(filename);
      }
    }
    
    return fileList;
  }
}
```

#### 11.1.2 缓存管理系统

```javascript
class CacheManager {
  constructor(pluginName, options = {}) {
    this.pluginName = pluginName;
    this.maxSize = options.maxSize || 50 * 1024 * 1024; // 50MB
    this.maxAge = options.maxAge || 24 * 60 * 60 * 1000; // 24小时
    this.storage = new FileStorage(pluginName);
    this.cacheIndex = new Map();
    this.initializeCache();
  }
  
  // 初始化缓存
  async initializeCache() {
    try {
      // 加载缓存索引
      const index = await this.storage.loadFromFile('cache_index.json');
      if (index) {
        this.cacheIndex = new Map(Object.entries(index));
      }
      
      // 清理过期缓存
      await this.cleanExpiredCache();
      
    } catch (error) {
      MNUtil.log(`缓存初始化失败: ${error.message}`);
    }
  }
  
  // 设置缓存
  async set(key, data, ttl = null) {
    try {
      const filename = this.getCacheFilename(key);
      const filepath = await this.storage.saveToFile(filename, data);
      
      // 更新索引
      const cacheItem = {
        key,
        filename,
        size: this.getDataSize(data),
        createdAt: Date.now(),
        expiresAt: ttl ? Date.now() + ttl : Date.now() + this.maxAge,
        accessCount: 0,
        lastAccessAt: Date.now()
      };
      
      this.cacheIndex.set(key, cacheItem);
      
      // 保存索引
      await this.saveCacheIndex();
      
      // 检查缓存大小
      await this.enforceMaxSize();
      
      return true;
    } catch (error) {
      MNUtil.log(`缓存设置失败 ${key}: ${error.message}`);
      return false;
    }
  }
  
  // 获取缓存
  async get(key) {
    try {
      const cacheItem = this.cacheIndex.get(key);
      if (!cacheItem) {
        return null;
      }
      
      // 检查是否过期
      if (Date.now() > cacheItem.expiresAt) {
        await this.delete(key);
        return null;
      }
      
      // 更新访问统计
      cacheItem.accessCount++;
      cacheItem.lastAccessAt = Date.now();
      
      // 加载数据
      const data = await this.storage.loadFromFile(cacheItem.filename);
      
      // 保存更新的索引
      await this.saveCacheIndex();
      
      return data;
    } catch (error) {
      MNUtil.log(`缓存获取失败 ${key}: ${error.message}`);
      return null;
    }
  }
  
  // 删除缓存
  async delete(key) {
    try {
      const cacheItem = this.cacheIndex.get(key);
      if (!cacheItem) {
        return true;
      }
      
      // 删除文件
      await this.storage.deleteFile(cacheItem.filename);
      
      // 从索引中移除
      this.cacheIndex.delete(key);
      
      // 保存索引
      await this.saveCacheIndex();
      
      return true;
    } catch (error) {
      MNUtil.log(`缓存删除失败 ${key}: ${error.message}`);
      return false;
    }
  }
  
  // 清理过期缓存
  async cleanExpiredCache() {
    const now = Date.now();
    const expiredKeys = [];
    
    for (let [key, item] of this.cacheIndex) {
      if (now > item.expiresAt) {
        expiredKeys.push(key);
      }
    }
    
    for (let key of expiredKeys) {
      await this.delete(key);
    }
    
    if (expiredKeys.length > 0) {
      MNUtil.log(`清理了 ${expiredKeys.length} 个过期缓存项`);
    }
  }
  
  // 执行缓存大小限制
  async enforceMaxSize() {
    const totalSize = this.getTotalCacheSize();
    if (totalSize <= this.maxSize) {
      return;
    }
    
    // 按访问频率排序，删除最少使用的项
    const items = Array.from(this.cacheIndex.entries());
    items.sort((a, b) => {
      const scoreA = a[1].accessCount / (Date.now() - a[1].createdAt);
      const scoreB = b[1].accessCount / (Date.now() - b[1].createdAt);
      return scoreA - scoreB;
    });
    
    let currentSize = totalSize;
    for (let [key, item] of items) {
      if (currentSize <= this.maxSize * 0.8) break; // 保留20%空间
      
      await this.delete(key);
      currentSize -= item.size;
    }
  }
  
  // 获取缓存总大小
  getTotalCacheSize() {
    let total = 0;
    for (let item of this.cacheIndex.values()) {
      total += item.size;
    }
    return total;
  }
  
  // 计算数据大小
  getDataSize(data) {
    if (typeof data === 'string') {
      return data.length * 2; // UTF-16
    } else {
      return JSON.stringify(data).length * 2;
    }
  }
  
  // 生成缓存文件名
  getCacheFilename(key) {
    const hash = this.simpleHash(key);
    return `cache_${hash}.json`;
  }
  
  // 简单哈希函数
  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 转为32位整数
    }
    return Math.abs(hash).toString(36);
  }
  
  // 保存缓存索引
  async saveCacheIndex() {
    const indexObject = Object.fromEntries(this.cacheIndex);
    await this.storage.saveToFile('cache_index.json', indexObject);
  }
  
  // 获取缓存统计信息
  getStats() {
    return {
      totalItems: this.cacheIndex.size,
      totalSize: this.getTotalCacheSize(),
      maxSize: this.maxSize,
      hitRate: this.calculateHitRate()
    };
  }
  
  // 计算命中率（简化版）
  calculateHitRate() {
    if (this.cacheIndex.size === 0) return 0;
    
    let totalAccess = 0;
    for (let item of this.cacheIndex.values()) {
      totalAccess += item.accessCount;
    }
    
    return totalAccess / this.cacheIndex.size;
  }
}
```

## 第12章：高级手势和动画

### 12.1 复杂手势识别

基于 MNSnipaste 插件的高级手势处理：

#### 12.1.1 多手势协调系统

```javascript
class GestureCoordinator {
  constructor(view) {
    this.view = view;
    this.gestureRecognizers = new Map();
    this.gestureState = {
      isPanning: false,
      isRotating: false,
      isZooming: false,
      startPoint: null,
      currentTransform: null
    };
    this.initializeGestures();
  }
  
  // 初始化手势识别器
  initializeGestures() {
    // 拖拽手势
    const panGesture = UIPanGestureRecognizer.alloc()
      .initWithTarget_action(this, "handlePanGesture:");
    panGesture.setMinimumNumberOfTouches(1);
    panGesture.setMaximumNumberOfTouches(1);
    
    // 旋转手势
    const rotationGesture = UIRotationGestureRecognizer.alloc()
      .initWithTarget_action(this, "handleRotationGesture:");
    
    // 缩放手势
    const pinchGesture = UIPinchGestureRecognizer.alloc()
      .initWithTarget_action(this, "handlePinchGesture:");
    
    // 长按手势
    const longPressGesture = UILongPressGestureRecognizer.alloc()
      .initWithTarget_action(this, "handleLongPressGesture:");
    longPressGesture.setMinimumPressDuration(0.5);
    
    // 双击手势
    const doubleTapGesture = UITapGestureRecognizer.alloc()
      .initWithTarget_action(this, "handleDoubleTapGesture:");
    doubleTapGesture.setNumberOfTapsRequired(2);
    
    // 添加手势到视图
    this.view.addGestureRecognizer(panGesture);
    this.view.addGestureRecognizer(rotationGesture);
    this.view.addGestureRecognizer(pinchGesture);
    this.view.addGestureRecognizer(longPressGesture);
    this.view.addGestureRecognizer(doubleTapGesture);
    
    // 设置手势间的依赖关系
    this.setupGestureRelations(panGesture, rotationGesture, pinchGesture, longPressGesture, doubleTapGesture);
    
    // 存储引用
    this.gestureRecognizers.set('pan', panGesture);
    this.gestureRecognizers.set('rotation', rotationGesture);
    this.gestureRecognizers.set('pinch', pinchGesture);
    this.gestureRecognizers.set('longPress', longPressGesture);
    this.gestureRecognizers.set('doubleTap', doubleTapGesture);
  }
  
  // 设置手势关系
  setupGestureRelations(pan, rotation, pinch, longPress, doubleTap) {
    // 同时支持拖拽和旋转
    rotation.setDelegate({
      gestureRecognizer_shouldRecognizeSimultaneouslyWithGestureRecognizer: (recognizer, otherRecognizer) => {
        return otherRecognizer === pan || otherRecognizer === pinch;
      }
    });
    
    // 同时支持拖拽和缩放
    pinch.setDelegate({
      gestureRecognizer_shouldRecognizeSimultaneouslyWithGestureRecognizer: (recognizer, otherRecognizer) => {
        return otherRecognizer === pan || otherRecognizer === rotation;
      }
    });
    
    // 长按和双击互斥
    longPress.requireGestureRecognizerToFail(doubleTap);
  }
  
  // 拖拽手势处理
  handlePanGesture(gesture) {
    const state = gesture.state();
    const location = gesture.locationInView(this.view);
    
    switch (state) {
      case 1: // UIGestureRecognizerStateBegan
        this.gestureState.isPanning = true;
        this.gestureState.startPoint = location;
        this.onPanBegan(location);
        break;
        
      case 2: // UIGestureRecognizerStateChanged
        if (this.gestureState.isPanning) {
          const translation = gesture.translationInView(this.view);
          this.onPanChanged(location, translation);
        }
        break;
        
      case 3: // UIGestureRecognizerStateEnded
      case 4: // UIGestureRecognizerStateCancelled
        this.gestureState.isPanning = false;
        const velocity = gesture.velocityInView(this.view);
        this.onPanEnded(location, velocity);
        break;
    }
  }
  
  // 旋转手势处理
  handleRotationGesture(gesture) {
    const state = gesture.state();
    const rotation = gesture.rotation();
    
    switch (state) {
      case 1:
        this.gestureState.isRotating = true;
        this.onRotationBegan();
        break;
        
      case 2:
        if (this.gestureState.isRotating) {
          this.onRotationChanged(rotation);
        }
        break;
        
      case 3:
      case 4:
        this.gestureState.isRotating = false;
        this.onRotationEnded(rotation);
        break;
    }
  }
  
  // 缩放手势处理
  handlePinchGesture(gesture) {
    const state = gesture.state();
    const scale = gesture.scale();
    
    switch (state) {
      case 1:
        this.gestureState.isZooming = true;
        this.onZoomBegan();
        break;
        
      case 2:
        if (this.gestureState.isZooming) {
          this.onZoomChanged(scale);
        }
        break;
        
      case 3:
      case 4:
        this.gestureState.isZooming = false;
        this.onZoomEnded(scale);
        break;
    }
  }
  
  // 手势事件回调（由子类实现）
  onPanBegan(location) {}
  onPanChanged(location, translation) {}
  onPanEnded(location, velocity) {}
  
  onRotationBegan() {}
  onRotationChanged(rotation) {}
  onRotationEnded(rotation) {}
  
  onZoomBegan() {}
  onZoomChanged(scale) {}
  onZoomEnded(scale) {}
}
```

#### 12.1.2 浮动面板手势控制

```javascript
class FloatingPanelGestureHandler extends GestureCoordinator {
  constructor(panel) {
    super(panel.view);
    this.panel = panel;
    this.isDragging = false;
    this.isResizing = false;
    this.dragOffset = { x: 0, y: 0 };
    this.initialFrame = null;
  }
  
  // 开始拖拽
  onPanBegan(location) {
    const panelFrame = this.panel.frame();
    
    // 判断是拖拽还是调整大小
    const isNearRightEdge = location.x > panelFrame.size.width - 20;
    const isNearBottomEdge = location.y > panelFrame.size.height - 20;
    
    if (isNearRightEdge || isNearBottomEdge) {
      // 调整大小模式
      this.isResizing = true;
      this.initialFrame = panelFrame;
      this.panel.setResizeMode(true);
    } else {
      // 拖拽模式
      this.isDragging = true;
      this.dragOffset = {
        x: location.x,
        y: location.y
      };
      this.panel.setDragMode(true);
    }
  }
  
  // 拖拽过程中
  onPanChanged(location, translation) {
    if (this.isDragging) {
      this.handleDragMovement(translation);
    } else if (this.isResizing) {
      this.handleResizeMovement(location);
    }
  }
  
  // 拖拽结束
  onPanEnded(location, velocity) {
    if (this.isDragging) {
      this.finishDragMovement(velocity);
    } else if (this.isResizing) {
      this.finishResizeMovement();
    }
    
    this.isDragging = false;
    this.isResizing = false;
    this.panel.setDragMode(false);
    this.panel.setResizeMode(false);
  }
  
  // 处理拖拽移动
  handleDragMovement(translation) {
    const currentFrame = this.panel.frame();
    const screenBounds = UIScreen.mainScreen().bounds();
    
    // 计算新位置
    let newX = currentFrame.origin.x + translation.x;
    let newY = currentFrame.origin.y + translation.y;
    
    // 边界检查
    newX = Math.max(0, Math.min(newX, screenBounds.size.width - currentFrame.size.width));
    newY = Math.max(0, Math.min(newY, screenBounds.size.height - currentFrame.size.height));
    
    // 更新位置
    this.panel.setFrame({
      x: newX,
      y: newY,
      width: currentFrame.size.width,
      height: currentFrame.size.height
    });
    
    // 重置translation避免累积
    this.gestureRecognizers.get('pan').setTranslation_inView({ x: 0, y: 0 }, this.view);
  }
  
  // 处理大小调整
  handleResizeMovement(location) {
    if (!this.initialFrame) return;
    
    const minSize = { width: 200, height: 150 };
    const maxSize = { width: 800, height: 600 };
    
    // 计算新尺寸
    let newWidth = Math.max(minSize.width, Math.min(location.x, maxSize.width));
    let newHeight = Math.max(minSize.height, Math.min(location.y, maxSize.height));
    
    // 更新尺寸
    this.panel.setFrame({
      x: this.initialFrame.origin.x,
      y: this.initialFrame.origin.y,
      width: newWidth,
      height: newHeight
    });
  }
  
  // 完成拖拽（添加惯性动画）
  finishDragMovement(velocity) {
    const currentFrame = this.panel.frame();
    const screenBounds = UIScreen.mainScreen().bounds();
    
    // 计算惯性终点
    const dampingFactor = 0.8;
    const targetX = Math.max(0, Math.min(
      currentFrame.origin.x + velocity.x * dampingFactor,
      screenBounds.size.width - currentFrame.size.width
    ));
    const targetY = Math.max(0, Math.min(
      currentFrame.origin.y + velocity.y * dampingFactor,
      screenBounds.size.height - currentFrame.size.height
    ));
    
    // 执行惯性动画
    UIView.animateWithDuration_delay_usingSpringWithDamping_initialSpringVelocity_options_animations_completion(
      0.6, 0, 0.8, 0.5, 0,
      () => {
        this.panel.setFrame({
          x: targetX,
          y: targetY,
          width: currentFrame.size.width,
          height: currentFrame.size.height
        });
      },
      (finished) => {
        // 动画完成后的处理
        this.panel.onDragAnimationCompleted();
      }
    );
  }
  
  // 完成大小调整
  finishResizeMovement() {
    // 保存新尺寸到配置
    const finalFrame = this.panel.frame();
    this.panel.saveFrameToConfig(finalFrame);
    
    // 触发尺寸变化事件
    this.panel.onResizeCompleted(finalFrame);
  }
}
```

### 12.2 流畅动画系统

#### 12.2.1 动画管理器

```javascript
class AnimationManager {
  constructor() {
    this.activeAnimations = new Map();
    this.animationQueue = [];
    this.isProcessingQueue = false;
  }
  
  // 基础动画方法
  animate(options) {
    const {
      view,
      duration = 0.3,
      delay = 0,
      damping = 1.0,
      velocity = 0,
      properties,
      completion,
      id
    } = options;
    
    // 如果指定了ID，取消之前的同ID动画
    if (id && this.activeAnimations.has(id)) {
      this.cancelAnimation(id);
    }
    
    const animationBlock = () => {
      // 应用属性变化
      Object.keys(properties).forEach(key => {
        this.applyProperty(view, key, properties[key]);
      });
    };
    
    const completionBlock = (finished) => {
      if (id) {
        this.activeAnimations.delete(id);
      }
      if (completion) {
        completion(finished);
      }
    };
    
    // 执行动画
    if (damping < 1.0) {
      // 弹簧动画
      UIView.animateWithDuration_delay_usingSpringWithDamping_initialSpringVelocity_options_animations_completion(
        duration, delay, damping, velocity, 0, animationBlock, completionBlock
      );
    } else {
      // 标准动画
      UIView.animateWithDuration_delay_options_animations_completion(
        duration, delay, 0, animationBlock, completionBlock
      );
    }
    
    // 记录活动动画
    if (id) {
      this.activeAnimations.set(id, { view, startTime: Date.now() });
    }
  }
  
  // 应用属性变化
  applyProperty(view, property, value) {
    switch (property) {
      case 'frame':
        view.setFrame(value);
        break;
      case 'alpha':
        view.setAlpha(value);
        break;
      case 'transform':
        view.setTransform(value);
        break;
      case 'backgroundColor':
        view.setBackgroundColor(value);
        break;
      case 'center':
        view.setCenter(value);
        break;
      default:
        // 尝试使用 KVC
        try {
          view.setValue_forKey(value, property);
        } catch (e) {
          MNUtil.log(`不支持的动画属性: ${property}`);
        }
    }
  }
  
  // 淡入动画
  fadeIn(view, options = {}) {
    const defaultOptions = {
      view,
      duration: 0.3,
      properties: { alpha: 1.0 },
      id: `fadeIn_${view.hash || Date.now()}`
    };
    
    view.setAlpha(0);
    this.animate({ ...defaultOptions, ...options });
  }
  
  // 淡出动画
  fadeOut(view, options = {}) {
    const defaultOptions = {
      view,
      duration: 0.3,
      properties: { alpha: 0.0 },
      id: `fadeOut_${view.hash || Date.now()}`
    };
    
    this.animate({ ...defaultOptions, ...options });
  }
  
  // 缩放动画
  scale(view, scale, options = {}) {
    const transform = CGAffineTransformMakeScale(scale, scale);
    const defaultOptions = {
      view,
      duration: 0.3,
      properties: { transform },
      id: `scale_${view.hash || Date.now()}`
    };
    
    this.animate({ ...defaultOptions, ...options });
  }
  
  // 移动动画
  moveTo(view, point, options = {}) {
    const defaultOptions = {
      view,
      duration: 0.3,
      properties: { center: point },
      id: `moveTo_${view.hash || Date.now()}`
    };
    
    this.animate({ ...defaultOptions, ...options });
  }
  
  // 弹跳效果
  bounce(view, options = {}) {
    const originalTransform = view.transform();
    
    // 弹跳序列
    const sequence = [
      { scale: 1.2, duration: 0.1 },
      { scale: 0.9, duration: 0.1 },
      { scale: 1.1, duration: 0.1 },
      { scale: 1.0, duration: 0.1 }
    ];
    
    this.animateSequence(view, sequence, options.completion);
  }
  
  // 动画序列
  animateSequence(view, sequence, completion) {
    if (sequence.length === 0) {
      if (completion) completion(true);
      return;
    }
    
    const step = sequence[0];
    const remainingSteps = sequence.slice(1);
    
    this.scale(view, step.scale, {
      duration: step.duration,
      completion: (finished) => {
        if (finished) {
          this.animateSequence(view, remainingSteps, completion);
        } else if (completion) {
          completion(false);
        }
      }
    });
  }
  
  // 取消动画
  cancelAnimation(id) {
    if (this.activeAnimations.has(id)) {
      const animation = this.activeAnimations.get(id);
      // 移除所有动画层
      animation.view.layer().removeAllAnimations();
      this.activeAnimations.delete(id);
    }
  }
  
  // 取消所有动画
  cancelAllAnimations() {
    for (let [id, animation] of this.activeAnimations) {
      animation.view.layer().removeAllAnimations();
    }
    this.activeAnimations.clear();
  }
}

// 全局动画管理器实例
const GlobalAnimationManager = new AnimationManager();
```

#### 12.2.2 实际应用：面板动画效果

```javascript
class AnimatedFloatingPanel {
  constructor(options) {
    this.options = options;
    this.animator = GlobalAnimationManager;
    this.isVisible = false;
    this.isAnimating = false;
    this.createPanel();
    this.setupAnimationEffects();
  }
  
  // 创建面板
  createPanel() {
    // 基础面板创建逻辑...
    this.panel = this.createBasePanel();
    this.panel.setAlpha(0);
    this.panel.setTransform(CGAffineTransformMakeScale(0.8, 0.8));
  }
  
  // 设置动画效果
  setupAnimationEffects() {
    // 鼠标悬停效果
    this.panel.setMouseEnterHandler(() => {
      if (!this.isAnimating) {
        this.animator.animate({
          view: this.panel,
          duration: 0.2,
          properties: { 
            transform: CGAffineTransformMakeScale(1.05, 1.05),
            alpha: 0.9
          },
          id: 'panel_hover'
        });
      }
    });
    
    this.panel.setMouseExitHandler(() => {
      if (!this.isAnimating) {
        this.animator.animate({
          view: this.panel,
          duration: 0.2,
          properties: { 
            transform: CGAffineTransformIdentity,
            alpha: 1.0
          },
          id: 'panel_hover'
        });
      }
    });
  }
  
  // 显示面板（带动画）
  show(animated = true) {
    if (this.isVisible || this.isAnimating) return;
    
    this.isAnimating = true;
    
    if (animated) {
      // 显示动画序列
      this.animator.animate({
        view: this.panel,
        duration: 0.4,
        damping: 0.7,
        velocity: 0.5,
        properties: {
          alpha: 1.0,
          transform: CGAffineTransformIdentity
        },
        completion: (finished) => {
          this.isAnimating = false;
          this.isVisible = true;
          this.onShowCompleted();
        },
        id: 'panel_show'
      });
      
      // 添加入场特效
      this.addShowEffects();
    } else {
      this.panel.setAlpha(1.0);
      this.panel.setTransform(CGAffineTransformIdentity);
      this.isVisible = true;
      this.isAnimating = false;
    }
  }
  
  // 隐藏面板（带动画）
  hide(animated = true) {
    if (!this.isVisible || this.isAnimating) return;
    
    this.isAnimating = true;
    
    if (animated) {
      this.animator.animate({
        view: this.panel,
        duration: 0.3,
        properties: {
          alpha: 0.0,
          transform: CGAffineTransformMakeScale(0.8, 0.8)
        },
        completion: (finished) => {
          this.isAnimating = false;
          this.isVisible = false;
          this.onHideCompleted();
        },
        id: 'panel_hide'
      });
    } else {
      this.panel.setAlpha(0.0);
      this.isVisible = false;
      this.isAnimating = false;
    }
  }
  
  // 添加显示特效
  addShowEffects() {
    // 阴影扩散效果
    this.animator.animate({
      view: this.panel.layer(),
      duration: 0.5,
      properties: {
        shadowRadius: 10,
        shadowOpacity: 0.3
      },
      id: 'panel_shadow'
    });
    
    // 轻微旋转效果
    const rotateAnimation = CABasicAnimation.animationWithKeyPath("transform.rotation.z");
    rotateAnimation.setFromValue(-0.1);
    rotateAnimation.setToValue(0);
    rotateAnimation.setDuration(0.4);
    rotateAnimation.setTimingFunction(CAMediaTimingFunction.functionWithName("easeOut"));
    
    this.panel.layer().addAnimation_forKey(rotateAnimation, "rotation");
  }
  
  // 弹跳提示动画
  bounceAttention() {
    if (this.isAnimating) return;
    
    this.animator.bounce(this.panel, {
      completion: () => {
        // 添加颜色闪烁效果
        this.flashColor(UIColor.systemBlueColor(), 0.3);
      }
    });
  }
  
  // 颜色闪烁效果
  flashColor(color, duration) {
    const originalColor = this.panel.backgroundColor();
    
    this.animator.animate({
      view: this.panel,
      duration: duration / 2,
      properties: { backgroundColor: color },
      completion: () => {
        this.animator.animate({
          view: this.panel,
          duration: duration / 2,
          properties: { backgroundColor: originalColor }
        });
      }
    });
  }
  
  // 摇摆效果（表示错误或警告）
  shake() {
    const originalCenter = this.panel.center();
    const shakeDistance = 10;
    
    const sequence = [
      { x: originalCenter.x - shakeDistance, y: originalCenter.y },
      { x: originalCenter.x + shakeDistance, y: originalCenter.y },
      { x: originalCenter.x - shakeDistance / 2, y: originalCenter.y },
      { x: originalCenter.x + shakeDistance / 2, y: originalCenter.y },
      originalCenter
    ];
    
    this.animatePositionSequence(sequence, 0.1);
  }
  
  // 位置序列动画
  animatePositionSequence(positions, duration) {
    if (positions.length === 0) return;
    
    const position = positions[0];
    const remaining = positions.slice(1);
    
    this.animator.moveTo(this.panel, position, {
      duration: duration,
      completion: (finished) => {
        if (finished && remaining.length > 0) {
          this.animatePositionSequence(remaining, duration);
        }
      }
    });
  }
}
```

## 小结

第三部分核心技术篇到此完成。我们深入学习了：

1. **网络请求与API集成**：掌握了 NSURLSession 的使用，流式响应处理，以及 OCR 服务集成的完整实现

2. **插件间通信与事件系统**：构建了事件总线和消息传递机制，实现了截图服务的跨插件协作

3. **数据持久化与缓存**：学会了文件存储操作和智能缓存管理系统

4. **高级手势和动画**：掌握了复杂手势识别和流畅动画效果的实现

这些核心技术为构建功能丰富、交互流畅的 MarginNote 插件奠定了坚实基础。接下来我们将进入实战项目篇，将所学技术综合运用到完整项目中。

---

### 本章练习

1. **网络客户端实践**：基于 StreamingClient 实现一个支持进度回调的文件下载功能
2. **事件系统应用**：设计一个多插件协作的文档注释同步系统
3. **缓存优化挑战**：为 OCR 结果实现智能缓存，支持图片相似度匹配
4. **动画创作**：设计一套独特的面板切换动画效果

