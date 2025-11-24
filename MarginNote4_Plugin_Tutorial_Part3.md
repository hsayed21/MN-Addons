#Part 3: Core Technology

## Chapter 9: Network Request and API Integration

### 9.1 Basics of network requests

In modern plug-in development, network requests are one of the core functions. The MarginNote plug-in is based on the iOS platform, and we use NSURLSession to handle network communication.

#### 9.1.1 HTTP client encapsulation

Let's see how to build a powerful network request client. Take GPTClient in the MNAI plug-in as an example:

```javascript
//Basic network client
class NetworkClient {
  constructor(baseURL, apiKey) {
    this.baseURL = baseURL;
    this.apiKey = apiKey;
    this.headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    };
  }

  // POST request method
  async post(endpoint, data) {
    const url = this.baseURL + endpoint;
    const body = JSON.stringify(data);

    return new Promise((resolve, reject) => {
      const request = NSMutableURLRequest.requestWithURL(NSURL.URLWithString(url));
      request.setHTTPMethod("POST");
      request.setHTTPBody(NSString.stringWithString(body).dataUsingEncoding(4));

      //Set request headers
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

#### 9.1.2 Streaming response processing

For scenarios that require real-time response, such as AI conversations, we use Server-Sent Events (SSE) to process streaming data:

```javascript
class StreamingClient extends NetworkClient {
  // Streaming request method
  streamPost(endpoint, data, onMessage, onComplete) {
    const url = this.baseURL + endpoint;
    const body = JSON.stringify(data);

    const request = NSMutableURLRequest.requestWithURL(NSURL.URLWithString(url));
    request.setHTTPMethod("POST");
    request.setHTTPBody(NSString.stringWithString(body).dataUsingEncoding(4));

    //Set streaming request header
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

      // Process streaming data
      responseData.appendData(data);
      this.parseSSEData(responseData, onMessage);

      // Check if completed
      if (response.expectedContentLength > 0 && responseData.length >= response.expectedContentLength) {
        onComplete(null, "Stream completed");
      }
    });

    task.resume();
    return task;
  }

  // Parse SSE data format
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
            // Ignore parsing errors
          }
        }
      }
    });
  }
}
```

### 9.2 Practical application: OCR service integration

Let's see how the MNOCR plugin integrates third-party OCR services:

#### 9.2.1 OCR client implementation

```javascript
class OCRClient {
  constructor() {
    this.apiKey = MNUtil.getObjCClassDeclar("MNOCRUtils", "getSavedAPIKey");
    this.baseURL = "https://api.ocr.space/parse/image";
  }

  // OCR image recognition
  async recognizeImage(imageData) {
    return new Promise((resolve, reject) => {
      const request = NSMutableURLRequest.requestWithURL(
        NSURL.URLWithString(this.baseURL)
      );
      request.setHTTPMethod("POST");

      // Build multipart/form-data
      const boundary = "----formdata-mn-ocr-" + Date.now();
      const contentType = `multipart/form-data; boundary=${boundary}`;
      request.setValue_forHTTPHeaderField(contentType, "Content-Type");
      request.setValue_forHTTPHeaderField(this.apiKey, "apikey");

      // Build request body
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

  // Construct multipart request body
  buildMultipartBody(boundary, imageData) {
    const body = NSMutableData.alloc().init();
    const newline = NSString.stringWithString("\r\n").dataUsingEncoding(4);
    const boundaryData = NSString.stringWithString(`--${boundary}\r\n`).dataUsingEncoding(4);

    //Add file fields
    body.appendData(boundaryData);
    const fileHeader = NSString.stringWithString(
      'Content-Disposition: form-data; name="file"; filename="image.png"\r\n' +
      'Content-Type: image/png\r\n\r\n'
    ).dataUsingEncoding(4);
    body.appendData(fileHeader);
    body.appendData(imageData);
    body.appendData(newline);

    //Add other parameters
    this.addFormField(body, boundary, "language", "chs");
    this.addFormField(body, boundary, "isOverlayRequired", "false");

    //end boundary
    const endBoundary = NSString.stringWithString(`--${boundary}--\r\n`).dataUsingEncoding(4);
    body.appendData(endBoundary);

    return body;
  }

  //Add form fields
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

#### 9.2.2 Error handling and retry mechanism

```javascript
class RobustOCRClient extends OCRClient {
  constructor() {
    super();
    this.maxRetries = 3;
    this.retryDelay = 1000;
  }

  // OCR recognition with retry
  async recognizeImageWithRetry(imageData) {
    let lastError;

    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        const result = await this.recognizeImage(imageData);
        return result;
      } catch (error) {
        lastError = error;

        // Check if it should be retried
        if (!this.shouldRetry(error) || attempt === this.maxRetries - 1) {
          break;
        }

        // Wait and try again
        await this.delay(this.retryDelay * (attempt + 1));
        MNUtil.showHUD(`OCR failed, retrying... (${attempt + 1}/${this.maxRetries})`);
      }
    }

    throw lastError;
  }

  // Determine whether we should try again
  shouldRetry(error) {
    //Retry when there is a network error or the server is temporarily unavailable
    return error.code === -1001 || // Timeout
           error.code === -1004 || // Unable to connect to server
           (error.response && error.response.status >= 500); // Server error
  }

  //delay function
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

### 9.3 Configuration management system

#### 9.3.1 Configuration storage and reading

Configuration management practice based on MN WebDAV plug-in:

```javascript
class ConfigManager {
  constructor(pluginName) {
    this.pluginName = pluginName;
    this.configKey = `${pluginName}_config`;
  }

  // Get configuration
  getConfig(key, defaultValue = null) {
    try {
      const configStr = NSUserDefaults.standardUserDefaults().objectForKey(this.configKey);
      if (!configStr) return defaultValue;

      const config = JSON.parse(configStr);
      return key ? (config[key] || defaultValue) : config;
    } catch (error) {
      MNUtil.log(`Configuration reading failed: ${error.message}`);
      return defaultValue;
    }
  }

  //Set configuration
  setConfig(key, value) {
    try {
      let config = this.getConfig() || {};

      if (typeof key === 'object') {
        // Batch settings
        config = { ...config, ...key };
      } else {
        // single setting
        config[key] = value;
      }

      const configStr = JSON.stringify(config);
      NSUserDefaults.standardUserDefaults().setObject_forKey(configStr, this.configKey);
      NSUserDefaults.standardUserDefaults().synchronize();

      return true;
    } catch (error) {
      MNUtil.log(`Failed to save configuration: ${error.message}`);
      return false;
    }
  }

  //Delete configuration item
  removeConfig(key) {
    const config = this.getConfig() || {};
    delete config[key];
    return this.setConfig(config);
  }

  //Reset all configurations
  resetConfig() {
    NSUserDefaults.standardUserDefaults().removeObjectForKey(this.configKey);
    NSUserDefaults.standardUserDefaults().synchronize();
  }
}
```

#### 9.3.2 Configuration verification and migration

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

  //Initialization configuration (including version checking and migration)
  initializeConfig() {
    const config = this.getConfig() || {};
    const configVersion = config.version || "0.9.0";

    // Check if migration is needed
    if (configVersion !== this.currentVersion) {
      this.migrateConfig(configVersion);
    }

    // Verify configuration integrity
    this.validateConfig();
  }

  //Configuration migration
  migrateConfig(fromVersion) {
    MNUtil.showHUD("Updating plug-in configuration...");

    try {
      for (let version in this.migrations) {
        if (this.compareVersion(fromVersion, version) < 0) {
          this.migrations[version].call(this);
          MNUtil.log(`Configuration migrated to version ${version}`);
        }
      }

      //Update version number
      this.setConfig("version", this.currentVersion);
      MNUtil.showHUD("Configuration update completed");
    } catch (error) {
      MNUtil.showHUD("Configuration migration failed: " + error.message);
    }
  }

  // Migrate from version 0.9.0
  migrateFrom090() {
    const config = this.getConfig();

    //Rename configuration item
    if (config.serverUrl) {
      config.webdavUrl = config.serverUrl;
      delete config.serverUrl;
    }

    //Add new default configuration
    config.syncInterval = config.syncInterval || 300;

    this.setConfig(config);
  }

  //Configuration verification
  validateConfig() {
    const config = this.getConfig() || {};
    const required = ['webdavUrl', 'username', 'password'];
    const missing = required.filter(key => !config[key]);

    if (missing. length > 0) {
      MNUtil.showHUD(`Missing required configuration: ${missing.join(', ')}`);
      return false;
    }

    return true;
  }

  //Compare version numbers
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

## Chapter 10: Inter-plugin communication and event system

### 10.1 Event bus system

Inter-plugin communication is an important requirement for complex applications. Let's build a powerful event system:

#### 10.1.1 Basic event bus

```javascript
class EventBus {
  constructor() {
    this.events = new Map();
  }

  //Register event listener
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

  //Remove event listener
  off(eventName, listenerId) {
    if (!this.events.has(eventName)) return;

    const listeners = this.events.get(eventName);
    const index = listeners.findIndex(l => l.id === listenerId);

    if (index > -1) {
      listeners.splice(index, 1);
    }
  }

  // trigger event
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
        MNUtil.log(`Event processing error ${eventName}: ${error.message}`);
      }
    });
  }

  // one-time listener
  once(eventName, callback, context = null) {
    const listenerId = this.on(eventName, (data) => {
      callback.call(context, data);
      this.off(eventName, listenerId);
    });

    return listenerId;
  }
}

// Global event bus instance
const GlobalEventBus = new EventBus();
```

#### 10.1.2 Message passing between plug-ins

```javascript
class InterPluginMessenger {
  constructor(pluginId) {
    this.pluginId = pluginId;
    this.messageQueue = [];
    this.initializeMessageChannel();
  }

  //Initialize message channel
  initializeMessageChannel() {
    // Use NSNotificationCenter to implement cross-plugin communication
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

  //Send messages to other plugins
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

  // Process the received message
  handleIncomingMessage(userInfo) {
    try {
      const messageStr = userInfo.objectForKey("message");
      const message = JSON.parse(messageStr);

      //Verify message format
      if (!this.validateMessage(message)) {
        return;
      }

      //Trigger message event
      GlobalEventBus.emit(`message:${message.type}`, message);
      GlobalEventBus.emit('message:received', message);
    } catch (error) {
      MNUtil.log(`Message processing failed: ${error.message}`);
    }
  }

  //Verify message format
  validateMessage(message) {
    return message &&
           message.from &&
           message.to === this.pluginId &&
           message.type &&
           message.id;
  }

  // Generate unique message ID
  generateMessageId() {
    return `${this.pluginId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
```

### 10.2 Practical application: screenshot plug-in communication

Take the MNSnipaste plugin as an example to see how it works with the system and other plugins:

#### 10.2.1 Screenshot service communication

```javascript
class ScreenshotService {
  constructor() {
    this.messenger = new InterPluginMessenger("MNSnipaste");
    this.setupEventHandlers();
  }

  //Set event handler
  setupEventHandlers() {
    //Listen to the screenshot completion event
    GlobalEventBus.on('screenshot:completed', this.handleScreenshotCompleted.bind(this));

    // Listen for screenshot requests from other plug-ins
    GlobalEventBus.on('message:screenshot_request', this.handleScreenshotRequest.bind(this));
  }

  //Request system screenshot
  async requestScreenshot(options = {}) {
    return new Promise((resolve, reject) => {
      //Use system screenshot API
      const task = NSTask.alloc().init();
      task.setLaunchPath("/usr/sbin/screencapture");

      //Set screenshot parameters
      const args = NSMutableArray.alloc().init();
      args.addObject("-i"); // Interactive selection
      args.addObject("-c"); // Copy to clipboard

      if (options.format) {
        args.addObject("-t");
        args.addObject(options.format);
      }

      task.setArguments(args);

      //Listen to the completion event
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
            reject(new Error(`Screenshot failed, status code: ${terminationStatus}`));
          }
        }
      );

      task.launch();
    });
  }

  // Process screenshot results
  processScreenshotResult(resolve) {
    // Get screenshot from clipboard
    const pasteboard = NSPasteboard.generalPasteboard();
    const imageData = pasteboard.dataForType("public.png");

    if (imageData) {
      const result = {
        imageData: imageData,
        timestamp: Date.now(),
        format: "png"
      };

      //Notification screenshot completed
      GlobalEventBus.emit('screenshot:completed', result);
      resolve(result);
    } else {
      resolve(null); // The user canceled the screenshot
    }
  }

  // Handle screenshot requests from other plug-ins
  async handleScreenshotRequest(message) {
    try {
      const options = message.data || {};
      const result = await this.requestScreenshot(options);

      //Reply to the requester
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

#### 10.2.2 Image processing and OCR integration

```javascript
class ImageProcessor {
  constructor(screenshotService) {
    this.screenshotService = screenshotService;
    this.ocrService = new OCRClient();
    this.setupProcessingPipeline();
  }

  //Set up the processing pipeline
  setupProcessingPipeline() {
    GlobalEventBus.on('screenshot:completed', this.processImage.bind(this));
  }

  // Main process of image processing
  async processImage(screenshotData) {
    if (!screenshotData || !screenshotData.imageData) return;

    try {
      MNUtil.showHUD("Processing pictures...");

      // 1. Image preprocessing
      const processedImage = await this.preprocessImage(screenshotData.imageData);

      // 2. OCR recognition (if needed)
      let ocrResult = null;
      if (this.shouldPerformOCR()) {
        MNUtil.showHUD("Recognizing text...");
        ocrResult = await this.ocrService.recognizeImage(processedImage);
      }

      // 3. Save the processing results
      const result = await this.saveProcessedImage(processedImage, ocrResult);

      // 4. Notification processing completed
      GlobalEventBus.emit('image:processed', {
        original: screenshotData,
        processed: result,
        ocr:ocrResult
      });

      MNUtil.showHUD("Image processing completed");
    } catch (error) {
      MNUtil.showHUD("Image processing failed: " + error.message);
    }
  }

  //Image preprocessing
  async preprocessImage(imageData) {
    //You can add image processing logic here:
    // - resize
    // - enhance contrast
    // - denoising etc.

    return imageData; // Simplified implementation
  }

  // Determine whether OCR is required
  shouldPerformOCR() {
    const config = new ConfigManager("MNSnipaste");
    return config.getConfig("autoOCR", false);
  }

  //Save the processed image
  async saveProcessedImage(imageData, ocrResult) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `screenshot_${timestamp}.png`;

    //Save to plugin directory
    const pluginPath = self.path;
    const imagePath = `${pluginPath}/screenshots/${filename}`;

    // Make sure the directory exists
    const fileManager = NSFileManager.defaultManager();
    const screenshotsDir = `${pluginPath}/screenshots`;
    fileManager.createDirectoryAtPath_withIntermediateDirectories_attributes_error(
      screenshotsDir, true, null, null
    );

    // write to file
    imageData.writeToFile_atomically(imagePath, true);

    return {
      path: imagePath,
      filename: filename,
      size: imageData.length,
      ocrText: ocrResult? ocrResult.ParsedText: null
    };
  }
}
```

## Chapter 11: Data persistence and caching

### 11.1 Local storage strategy

#### 11.1.1 File system operations

```javascript
class FileStorage {
  constructor(pluginName) {
    this.pluginName = pluginName;
    this.basePath = self.path + "/data";
    this.initializeStorage();
  }

  //Initialize storage directory
  initializeStorage() {
    const fileManager = NSFileManager.defaultManager();

    if (!fileManager.fileExistsAtPath(this.basePath)) {
      fileManager.createDirectoryAtPath_withIntermediateDirectories_attributes_error(
        this.basePath, true, null, null
      );
    }
  }

  //Save data to file
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
        throw new Error(`Unable to save file: ${filename}`);
      }

      return filePath;
    } catch (error) {
      throw new Error(`Save failed: ${error.message}`);
    }
  }

  //Read data from file
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
      throw new Error(`Read failed: ${error.message}`);
    }
  }

  // List all files
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

#### 11.1.2 Cache management system

```javascript
class CacheManager {
  constructor(pluginName, options = {}) {
    this.pluginName = pluginName;
    this.maxSize = options.maxSize || 50 * 1024 * 1024; // 50MB
    this.maxAge = options.maxAge || 24 * 60 * 60 * 1000; // 24 hours
    this.storage = new FileStorage(pluginName);
    this.cacheIndex = new Map();
    this.initializeCache();
  }

  //Initialize cache
  async initializeCache() {
    try {
      //Load cache index
      const index = await this.storage.loadFromFile('cache_index.json');
      if (index) {
        this.cacheIndex = new Map(Object.entries(index));
      }

      // Clear expired cache
      await this.cleanExpiredCache();

    } catch (error) {
      MNUtil.log(`Cache initialization failed: ${error.message}`);
    }
  }

  // Set up cache
  async set(key, data, ttl = null) {
    try {
      const filename = this.getCacheFilename(key);
      const filepath = await this.storage.saveToFile(filename, data);

      //update index
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

      // save index
      await this.saveCacheIndex();

      // Check cache size
      await this.enforceMaxSize();

      return true;
    } catch (error) {
      MNUtil.log(`Cache setting failed ${key}: ${error.message}`);
      return false;
    }
  }

  // Get cache
  async get(key) {
    try {
      const cacheItem = this.cacheIndex.get(key);
      if (!cacheItem) {
        return null;
      }

      // Check if it has expired
      if (Date.now() > cacheItem.expiresAt) {
        await this.delete(key);
        return null;
      }

      //Update access statistics
      cacheItem.accessCount++;
      cacheItem.lastAccessAt = Date.now();

      //Load data
      const data = await this.storage.loadFromFile(cacheItem.filename);

      //Save updated index
      await this.saveCacheIndex();

      return data;
    } catch (error) {
      MNUtil.log(`Cache acquisition failed ${key}: ${error.message}`);
      return null;
    }
  }

  // Delete cache
  async delete(key) {
    try {
      const cacheItem = this.cacheIndex.get(key);
      if (!cacheItem) {
        return true;
      }

      // delete file
      await this.storage.deleteFile(cacheItem.filename);

      //Remove from index
      this.cacheIndex.delete(key);

      // save index
      await this.saveCacheIndex();

      return true;
    } catch (error) {
      MNUtil.log(`Cache deletion failed ${key}: ${error.message}`);
      return false;
    }
  }

  // Clear expired cache
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
      MNUtil.log(`Cleaned ${expiredKeys.length} expired cache items`);
    }
  }

  // Enforce cache size limit
  async enforceMaxSize() {
    const totalSize = this.getTotalCacheSize();
    if (totalSize <= this.maxSize) {
      return;
    }

    // Sort by access frequency, delete least used items
    const items = Array.from(this.cacheIndex.entries());
    items.sort((a, b) => {
      const scoreA = a[1].accessCount / (Date.now() - a[1].createdAt);
      const scoreB = b[1].accessCount / (Date.now() - b[1].createdAt);
      return scoreA - scoreB;
    });

    let currentSize = totalSize;
    for (let [key, item] of items) {
      if (currentSize <= this.maxSize * 0.8) break; // Reserve 20% space

      await this.delete(key);
      currentSize -= item.size;
    }
  }

  // Get the total cache size
  getTotalCacheSize() {
    let total = 0;
    for (let item of this.cacheIndex.values()) {
      total += item.size;
    }
    return total;
  }

  // Calculate data size
  getDataSize(data) {
    if (typeof data === 'string') {
      return data.length * 2; // UTF-16
    } else {
      return JSON.stringify(data).length * 2;
    }
  }

  // Generate cache file name
  getCacheFilename(key) {
    const hash = this.simpleHash(key);
    return `cache_${hash}.json`;
  }

  // Simple hash function
  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  //Save cache index
  async saveCacheIndex() {
    const indexObject = Object.fromEntries(this.cacheIndex);
    await this.storage.saveToFile('cache_index.json', indexObject);
  }

  // Get cache statistics
  getStats() {
    return {
      totalItems: this.cacheIndex.size,
      totalSize: this.getTotalCacheSize(),
      maxSize: this.maxSize,
      hitRate: this.calculateHitRate()
    };
  }

  // Calculate hit rate (simplified version)
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

## Chapter 12: Advanced Gestures and Animations

### 12.1 Complex gesture recognition

Advanced gesture processing based on MNSnipaste plug-in:

#### 12.1.1 Multi-gesture coordination system

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

  //Initialize gesture recognizer
  initializeGestures() {
    // drag gesture
    const panGesture = UIPanGestureRecognizer.alloc()
      .initWithTarget_action(this, "handlePanGesture:");
    panGesture.setMinimumNumberOfTouches(1);
    panGesture.setMaximumNumberOfTouches(1);

    //Rotate gesture
    const rotationGesture = UIRotationGestureRecognizer.alloc()
      .initWithTarget_action(this, "handleRotationGesture:");

    // Zoom gesture
    const pinchGesture = UIPinchGestureRecognizer.alloc()
      .initWithTarget_action(this, "handlePinchGesture:");

    // long press gesture
    const longPressGesture = UILongPressGestureRecognizer.alloc()
      .initWithTarget_action(this, "handleLongPressGesture:");
    longPressGesture.setMinimumPressDuration(0.5);

    // Double click gesture
    const doubleTapGesture = UITapGestureRecognizer.alloc()
      .initWithTarget_action(this, "handleDoubleTapGesture:");
    doubleTapGesture.setNumberOfTapsRequired(2);

    //Add gesture to view
    this.view.addGestureRecognizer(panGesture);
    this.view.addGestureRecognizer(rotationGesture);
    this.view.addGestureRecognizer(pinchGesture);
    this.view.addGestureRecognizer(longPressGesture);
    this.view.addGestureRecognizer(doubleTapGesture);

    //Set dependencies between gestures
    this.setupGestureRelations(panGesture, rotationGesture, pinchGesture, longPressGesture, doubleTapGesture);

    // store reference
    this.gestureRecognizers.set('pan', panGesture);
    this.gestureRecognizers.set('rotation', rotationGesture);
    this.gestureRecognizers.set('pinch', pinchGesture);
    this.gestureRecognizers.set('longPress', longPressGesture);
    this.gestureRecognizers.set('doubleTap', doubleTapGesture);
  }

  //Set gesture relationship
  setupGestureRelations(pan, rotation, pinch, longPress, doubleTap) {
    //Supports dragging and rotating at the same time
    rotation.setDelegate({
      gestureRecognizer_shouldRecognizeSimultaneouslyWithGestureRecognizer: (recognizer, otherRecognizer) => {
        return otherRecognizer === pan || otherRecognizer === pinch;
      }
    });

    //Supports dragging and zooming at the same time
    pinch.setDelegate({
      gestureRecognizer_shouldRecognizeSimultaneouslyWithGestureRecognizer: (recognizer, otherRecognizer) => {
        return otherRecognizer === pan || otherRecognizer === rotation;
      }
    });

    // Long press and double click are mutually exclusive
    longPress.requireGestureRecognizerToFail(doubleTap);
  }

  // Drag gesture processing
  handlePanGesture(gesture) {
    const state = gesture.state();
    const location = gesture.locationInView(this.view);

    switch (state) {
      case 1: // UIGestureRecognizerStateBegan
        this.gestureState.isPanning = true;
        this.gestureState.startPoint = location;
        this.onPanBegan(location);
        break;

      case 2: //UIGestureRecognizerStateChanged
        if (this.gestureState.isPanning) {
          const translation = gesture.translationInView(this.view);
          this.onPanChanged(location, translation);
        }
        break;

      case 3: //UIGestureRecognizerStateEnded
      case 4: //UIGestureRecognizerStateCancelled
        this.gestureState.isPanning = false ;
        const velocity = gesture.velocityInView(this.view);
        this.onPanEnded(location, velocity);
        break;
    }
  }

  //Rotation gesture processing
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

  // Zoom gesture handling
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

  // Gesture event callback (implemented by subclass)
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

#### 12.1.2 Floating panel gesture control

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

  // Start dragging
  onPanBegan(location) {
    const panelFrame = this.panel.frame();

    // Determine whether to drag or resize
    const isNearRightEdge = location.x > panelFrame.size.width - 20;
    const isNearBottomEdge = location.y > panelFrame.size.height - 20;

    if (isNearRightEdge || isNearBottomEdge) {
      //Resize mode
      this.isResizing = true;
      this.initialFrame = panelFrame;
      this.panel.setResizeMode(true);
    } else {
      // drag mode
      this.isDragging = true;
      this.dragOffset = {
        x: location.x,
        y: location.y
      };
      this.panel.setDragMode(true);
    }
  }

  //During dragging process
  onPanChanged(location, translation) {
    if (this.isDragging) {
      this.handleDragMovement(translation);
    } else if (this.isResizing) {
      this.handleResizeMovement(location);
    }
  }

  // End of dragging
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

  // Handle drag and drop movement
  handleDragMovement(translation) {
    const currentFrame = this.panel.frame();
    const screenBounds = UIScreen.mainScreen().bounds();

    // Calculate new position
    let newX = currentFrame.origin.x + translation.x;
    let newY = currentFrame.origin.y + translation.y;

    // Bounds check
    newX = Math.max(0, Math.min(newX, screenBounds.size.width - currentFrame.size.width));
    newY = Math.max(0, Math.min(newY, screenBounds.size.height - currentFrame.size.height));

    // update location
    this.panel.setFrame({
      x: newX,
      y: newY,
      width: currentFrame.size.width,
      height: currentFrame.size.height
    });

    //Reset translation to avoid accumulation
    this.gestureRecognizers.get('pan').setTranslation_inView({ x: 0, y: 0 }, this.view);
  }

  // Handle resizing
  handleResizeMovement(location) {
    if (!this.initialFrame) return;

    const minSize = { width: 200, height: 150 };
    const maxSize = { width: 800, height: 600 };

    // Calculate new size
    let newWidth = Math.max(minSize.width, Math.min(location.x, maxSize.width));
    let newHeight = Math.max(minSize.height, Math.min(location.y, maxSize.height));

    // update size
    this.panel.setFrame({
      x: this.initialFrame.origin.x,
      y: this.initialFrame.origin.y,
      width: newWidth,
      height: newHeight
    });
  }

  //Complete dragging (add inertia animation)
  finishDragMovement(velocity) {
    const currentFrame = this.panel.frame();
    const screenBounds = UIScreen.mainScreen().bounds();

    // Calculate the inertia end point
    const dampingFactor = 0.8;
    const targetX = Math.max(0, Math.min(
      currentFrame.origin.x + velocity.x * dampingFactor,
      screenBounds.size.width - currentFrame.size.width
    ));
    const targetY = Math.max(0, Math.min(
      currentFrame.origin.y + velocity.y * dampingFactor,
      screenBounds.size.height - currentFrame.size.height
    ));

    //Perform inertia animation
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
        //Processing after animation is completed
        this.panel.onDragAnimationCompleted();
      }
    );
  }

  // Complete resizing
  finishResizeMovement() {
    //Save new size to configuration
    const finalFrame = this.panel.frame();
    this.panel.saveFrameToConfig(finalFrame);

    // Trigger size change event
    this.panel.onResizeCompleted(finalFrame);
  }
}
```

### 12.2 Smooth animation system

#### 12.2.1 Animation Manager

```javascript
class AnimationManager {
  constructor() {
    this.activeAnimations = new Map();
    this.animationQueue = [];
    this.isProcessingQueue = false;
  }

  //Basic animation method
  animate(options) {
    const {
      view,
      duration = 0.3,
      delay = 0,
      damping = 1.0,
      velocity = 0,
      properties,
      completion,
      ID
    } = options;

    // If an ID is specified, cancel the previous animation with the same ID
    if (id && this.activeAnimations.has(id)) {
      this.cancelAnimation(id);
    }

    const animationBlock = () => {
      // Apply property changes
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

    //Execute animation
    if (damping < 1.0) {
      // spring animation
      UIView.animateWithDuration_delay_usingSpringWithDamping_initialSpringVelocity_options_animations_completion(
        duration, delay, damping, velocity, 0, animationBlock, completionBlock
      );
    } else {
      // standard animation
      UIView.animateWithDuration_delay_options_animations_completion(
        duration, delay, 0, animationBlock, completionBlock
      );
    }

    //Record activity animation
    if (id) {
      this.activeAnimations.set(id, { view, startTime: Date.now() });
    }
  }

  // Apply property changes
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

  //Create panel
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
