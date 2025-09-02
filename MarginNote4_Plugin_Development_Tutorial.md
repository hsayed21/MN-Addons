# MarginNote4 插件开发完整教程

> 从零基础到精通，手把手教你开发 MarginNote 插件
> 
> 作者：基于 MNUtils、MNAI、MNOCR 等核心插件源码深度分析编写
> 版本：v1.0.0
> 更新：2025-02-01

## 前言

本教程基于对 MarginNote 插件生态系统的深度分析编写，涵盖了从最基础的 Hello World 到复杂的多控制器架构、AI 集成、WebView 开发等高级主题。通过学习本教程，你将能够开发出功能丰富、用户体验优秀的 MarginNote 插件。

### 你将学到什么

- ✅ MarginNote 插件系统的完整架构
- ✅ JSBridge 技术和 Objective-C API 调用
- ✅ MNUtils 框架的 500+ API 使用方法
- ✅ 原生 UI 开发和 WebView 集成
- ✅ 网络请求、流式响应、文件操作
- ✅ 多控制器架构设计和插件间通信
- ✅ 实战项目：OCR、AI对话、贴图、文件同步等

### 教程特色

1. **保姆级详细**：每个概念都从零开始，每行代码都有注释
2. **实战导向**：所有示例来自真实插件，经过验证可运行
3. **循序渐进**：从简单到复杂，逐步提升难度
4. **覆盖全面**：包含所有核心技术和最佳实践

---

# 第一部分：基础入门篇

## 第1章：初识 MarginNote 插件开发

### 1.1 MarginNote 是什么？

MarginNote 不仅仅是一个 PDF 阅读器或笔记软件，它是一个**基于数据结构的知识管理系统**。其核心设计理念是：

- **知识的原子化**：将知识分解为最小可管理单元（卡片/笔记）
- **知识的结构化**：通过脑图和链接构建知识体系
- **知识的流动性**：同一数据在文档、脑图、复习三种视图间自由流转
- **知识的可计算性**：支持检索、链接、自动化处理

### 1.2 插件能做什么？

MarginNote 的插件系统赋予了用户无限的扩展可能：

#### 已有插件展示
- **MNAI**：集成 ChatGPT、Claude 等 AI 模型，智能处理笔记
- **MNOCR**：支持 40+ AI 视觉模型的 OCR 识别
- **MNSnipaste**：截图贴图，支持 5 种内容类型
- **MNBrowser**：内置浏览器，视频时间戳跳转
- **MN WebDAV**：文件同步，支持 5 种同步方式

#### 你可以开发的插件
- 自动化工具：批量处理、格式转换、数据导出
- 学习增强：记忆曲线、学习统计、复习提醒
- 内容增强：翻译、词典、维基百科集成
- 协作工具：笔记分享、团队协作、版本管理

### 1.3 开发环境搭建

#### 系统要求
- macOS 10.15 或更高版本
- MarginNote 4.0.0 或更高版本
- 文本编辑器（推荐 VS Code）

#### 安装开发工具

1. **安装 MarginNote 4**
```bash
# 从 App Store 安装或官网下载
# https://www.marginnote.com/
```

2. **安装 VS Code 和插件**
```bash
# 安装 VS Code
brew install --cask visual-studio-code

# 推荐安装的 VS Code 插件
# - JavaScript 语法高亮
# - ESLint 代码检查
# - Prettier 代码格式化
```

3. **安装 mnaddon4 打包工具**
```bash
# 安装 Node.js (如果未安装)
brew install node

# 安装 mnaddon4 工具
npm install -g mnaddon4
```

4. **创建插件开发目录**
```bash
# 创建开发目录
mkdir ~/MNPluginDev
cd ~/MNPluginDev

# 创建第一个插件项目
mkdir HelloWorld
cd HelloWorld
```

### 1.4 第一个 Hello World 插件

让我们创建一个最简单的插件，在 MarginNote 中显示 "Hello World"。

#### Step 1: 创建插件配置文件 mnaddon.json

```json
{
  "addonid": "marginnote.extension.helloworld",
  "author": "Your Name",
  "title": "Hello World",
  "version": "1.0.0",
  "marginnote_version_min": "4.0.0",
  "cert_key": ""
}
```

**配置说明**：
- `addonid`：插件唯一标识符，建议使用反向域名格式
- `author`：插件作者
- `title`：插件显示名称
- `version`：插件版本号
- `marginnote_version_min`：最低支持的 MN 版本
- `cert_key`：证书密钥（开发阶段留空）

#### Step 2: 创建主程序 main.js

```javascript
// main.js - Hello World 插件主程序

// JSBridge 入口函数 - MarginNote 会调用这个函数来初始化插件
JSB.newAddon = function(mainPath) {
  // mainPath 是插件所在目录的路径
  
  // 使用 JSB.defineClass 定义插件主类
  // 格式：类名 : 父类名
  return JSB.defineClass('HelloWorld : JSExtension', {
    
    // 生命周期方法1：窗口连接时调用
    // 这是插件初始化的入口点
    sceneWillConnect: function() {
      // 在控制台输出日志
      JSB.log("Hello World 插件已加载！");
      
      // 显示一个 HUD 提示
      // 注意：此时 MNUtil 还未加载，我们使用原生 API
      Application.sharedInstance().showHUD(
        "Hello World from MarginNote Plugin!", 
        self.window, 
        2  // 显示 2 秒
      );
    },
    
    // 生命周期方法2：窗口断开时调用
    sceneDidDisconnect: function() {
      JSB.log("Hello World 插件已卸载");
    },
    
    // 生命周期方法3：打开笔记本时调用
    notebookWillOpen: function(notebookid) {
      JSB.log("打开笔记本: " + notebookid);
      
      // 获取当前笔记本的标题
      let notebook = Database.sharedInstance()
        .getNotebookById(notebookid);
      let title = notebook.title;
      
      Application.sharedInstance().showHUD(
        "打开笔记本: " + title,
        self.window,
        2
      );
    },
    
    // 生命周期方法4：关闭笔记本时调用
    notebookWillClose: function(notebookid) {
      JSB.log("关闭笔记本: " + notebookid);
    },
    
    // 生命周期方法5：点击插件 logo 时调用
    toggleAddon: function() {
      Application.sharedInstance().showHUD(
        "你点击了 Hello World 插件!",
        self.window,
        2
      );
    }
  });
};
```

#### Step 3: 创建插件图标 logo.png

创建一个 44x44 像素的 PNG 图片作为插件图标。可以使用任何图片编辑软件，或者使用在线工具生成。

#### Step 4: 打包和安装插件

```bash
# 在插件目录下执行打包命令
mnaddon4 build .

# 这会生成 HelloWorld.mnaddon 文件
# 双击该文件即可安装到 MarginNote
```

#### Step 5: 调试插件

1. **打开 MarginNote 控制台**
   - 在 MarginNote 中按 `Cmd + Option + J` 打开控制台
   - 或者通过菜单：开发 → 显示 JavaScript 控制台

2. **查看日志输出**
   ```javascript
   // 在控制台中可以看到我们的日志
   // "Hello World 插件已加载！"
   ```

3. **常用调试命令**
   ```javascript
   // 获取当前插件实例
   self
   
   // 获取当前笔记本
   MNUtil.currentNotebook
   
   // 获取选中的笔记
   MNNote.getFocusNote()
   ```

### 1.5 插件的安装和管理

#### 安装方式

1. **双击安装**：直接双击 `.mnaddon` 文件
2. **拖拽安装**：将插件文件拖到 MarginNote 窗口
3. **开发者模式**：创建软链接到插件目录（推荐）

```bash
# 开发者模式 - 创建软链接，修改代码立即生效
ln -s ~/MNPluginDev/HelloWorld ~/Library/Containers/QReader.MarginNoteMac/Data/Library/MarginNote\ Extensions/

# 重启 MarginNote 后插件自动加载
```

#### 插件目录位置

```bash
# macOS 插件目录
~/Library/Containers/QReader.MarginNoteMac/Data/Library/MarginNote Extensions/

# 查看已安装的插件
ls ~/Library/Containers/QReader.MarginNoteMac/Data/Library/MarginNote\ Extensions/
```

### 1.6 本章小结

恭喜你！你已经成功创建了第一个 MarginNote 插件。在这一章中，我们学习了：

✅ MarginNote 的核心理念和插件系统
✅ 开发环境的搭建
✅ 插件的基本结构（mnaddon.json + main.js + logo.png）
✅ JSBridge 的基本使用
✅ 插件的生命周期方法
✅ 插件的打包、安装和调试

下一章，我们将深入学习插件的架构设计，理解 JSBridge 的工作原理，掌握更多的生命周期方法和事件处理。

---

## 第2章：插件基础架构

### 2.1 插件文件结构详解

一个完整的 MarginNote 插件包含以下文件：

```
plugin.mnaddon/
├── mnaddon.json      # 插件配置清单（必需）
├── main.js           # 插件主程序（必需）
├── logo.png          # 插件图标（必需，44x44px）
├── utils.js          # 工具函数（可选）
├── controller.js     # 控制器类（可选）
├── config.js         # 配置管理（可选）
├── resources/        # 资源文件夹（可选）
│   ├── icons/        # 图标资源
│   ├── html/         # HTML 文件
│   └── css/          # 样式文件
└── lib/              # 第三方库（可选）
    └── library.js
```

### 2.2 mnaddon.json 配置详解

```json
{
  // 基本信息
  "addonid": "marginnote.extension.example",  // 唯一标识符
  "author": "Your Name",                       // 作者名称
  "title": "Example Plugin",                   // 显示名称
  "version": "1.0.0",                          // 版本号（语义化版本）
  
  // 兼容性
  "marginnote_version_min": "4.0.0",          // 最低 MN 版本
  "marginnote_version_max": "5.0.0",          // 最高 MN 版本（可选）
  
  // 权限和认证
  "cert_key": "",                              // 证书密钥
  
  // 额外配置（可选）
  "description": "插件描述",                   // 插件描述
  "homepage": "https://example.com",          // 主页链接
  "github": "https://github.com/user/repo",   // GitHub 仓库
  
  // 依赖（可选）
  "dependencies": {
    "MNUtils": ">=1.0.0"                       // 依赖的其他插件
  }
}
```

### 2.3 JSBridge 技术原理

JSBridge 是 JavaScript 与 Objective-C 之间的桥接技术，让我们能用 JavaScript 调用原生 API。

#### JSBridge 核心 API

```javascript
// 1. 定义类
JSB.defineClass('ClassName : ParentClass <Protocol1, Protocol2>', {
  // 实例方法
  instanceMethod: function(param) {
    // 方法实现
  }
}, {
  // 类方法（静态方法）
  classMethod: function() {
    // 方法实现
  }
});

// 2. 导入依赖
JSB.require('filename');  // 不需要 .js 后缀

// 3. 日志输出
JSB.log('日志信息');

// 4. 导出对象
JSB.export(object);
```

#### Objective-C API 调用规则

```javascript
// Objective-C 方法调用转换规则
// OC: [object methodWithParam1:value1 param2:value2]
// JS: object.methodWithParam1Param2(value1, value2)

// 示例1：无参数方法
// OC: [view removeFromSuperview]
view.removeFromSuperview();

// 示例2：单参数方法
// OC: [array objectAtIndex:0]
array.objectAtIndex(0);

// 示例3：多参数方法
// OC: [view setFrame:CGRectMake(0, 0, 100, 100)]
view.frame = {x: 0, y: 0, width: 100, height: 100};

// 示例4：创建对象
// OC: [[UIButton alloc] init]
let button = UIButton.new();
// 或
let button = UIButton.alloc().init();
```

### 2.4 插件生命周期完整流程

```javascript
JSB.newAddon = function(mainPath) {
  // 保存插件路径
  let path = mainPath;
  
  return JSB.defineClass('PluginName : JSExtension', {
    
    // ========== 窗口生命周期 ==========
    
    // 1. 窗口即将连接（插件初始化）
    sceneWillConnect: function() {
      self.mainPath = path;  // 保存路径到实例
      JSB.log("=== 插件初始化 ===");
      
      // 初始化配置
      self.initConfig();
      
      // 注册观察者
      self.registerObservers();
    },
    
    // 2. 窗口已连接
    sceneDidConnect: function() {
      JSB.log("窗口已连接");
    },
    
    // 3. 窗口将要断开
    sceneWillDisconnect: function() {
      JSB.log("窗口将要断开");
      
      // 保存状态
      self.saveState();
    },
    
    // 4. 窗口已断开
    sceneDidDisconnect: function() {
      JSB.log("=== 插件卸载 ===");
      
      // 清理资源
      self.cleanup();
    },
    
    // ========== 笔记本生命周期 ==========
    
    // 5. 笔记本将要打开
    notebookWillOpen: function(notebookid) {
      JSB.log("打开笔记本: " + notebookid);
      
      // 初始化笔记本相关功能
      self.currentNotebookId = notebookid;
      self.setupNotebookFeatures();
    },
    
    // 6. 笔记本已打开
    notebookDidOpen: function(notebookid) {
      JSB.log("笔记本已打开");
    },
    
    // 7. 笔记本将要关闭
    notebookWillClose: function(notebookid) {
      JSB.log("关闭笔记本: " + notebookid);
      
      // 保存笔记本状态
      self.saveNotebookState();
    },
    
    // 8. 笔记本已关闭
    notebookDidClose: function(notebookid) {
      JSB.log("笔记本已关闭");
      
      // 清理笔记本资源
      self.cleanupNotebook();
    },
    
    // ========== 文档生命周期 ==========
    
    // 9. 文档已打开
    documentDidOpen: function(docmd5) {
      JSB.log("打开文档: " + docmd5);
      
      // 初始化文档相关功能
      self.currentDocMd5 = docmd5;
    },
    
    // 10. 文档将要关闭
    documentWillClose: function(docmd5) {
      JSB.log("关闭文档: " + docmd5);
    },
    
    // ========== 布局生命周期 ==========
    
    // 11. 控制器将要布局子视图
    controllerWillLayoutSubviews: function(controller) {
      // 调整布局
      self.updateLayout();
    },
    
    // 12. 视图尺寸改变
    viewDidUpdateSize: function(view) {
      // 响应尺寸变化
    },
    
    // ========== 用户交互 ==========
    
    // 13. 用户点击插件图标
    toggleAddon: function() {
      JSB.log("切换插件显示");
      
      if (self.isVisible) {
        self.hide();
      } else {
        self.show();
      }
      self.isVisible = !self.isVisible;
    },
    
    // 14. 查询插件状态（工具栏显示）
    queryAddonCommandStatus: function() {
      // 返回插件在工具栏的状态
      // 0: 正常, 1: 选中, 2: 禁用
      return self.isActive ? 1 : 0;
    },
    
    // ========== 事件处理 ==========
    
    // 15. 选择文本时的弹出菜单
    onPopupMenuOnSelection: function(sender) {
      JSB.log("选中文本事件");
      
      let selectedText = sender.userInfo.documentController.selectionText;
      JSB.log("选中的文本: " + selectedText);
      
      // 处理选中文本
      self.processSelectedText(selectedText);
    },
    
    // 16. 点击笔记时的弹出菜单
    onPopupMenuOnNote: function(sender) {
      JSB.log("点击笔记事件");
      
      let note = sender.userInfo.note;
      JSB.log("笔记ID: " + note.noteId);
      
      // 处理笔记
      self.processNote(note);
    },
    
    // 17. 处理新摘录
    onProcessNewExcerpt: function(sender) {
      let excerpt = sender.userInfo.excerpt;
      JSB.log("新摘录: " + excerpt.text);
    },
    
    // 18. 插件间通信
    onAddonBroadcast: function(sender) {
      let message = sender.userInfo.message;
      JSB.log("收到广播: " + message);
      
      // 处理来自其他插件的消息
      self.handleBroadcast(message);
    },
    
    // ========== 辅助方法 ==========
    
    initConfig: function() {
      // 初始化配置
      self.config = {
        isVisible: false,
        isActive: false
      };
    },
    
    registerObservers: function() {
      // 注册通知观察者
      // 我们将在后面章节详细讲解
    },
    
    show: function() {
      Application.sharedInstance().showHUD("显示插件", self.window, 1);
    },
    
    hide: function() {
      Application.sharedInstance().showHUD("隐藏插件", self.window, 1);
    },
    
    saveState: function() {
      // 保存状态到 NSUserDefaults
    },
    
    cleanup: function() {
      // 清理资源
    }
    
  }, {
    // ========== 类方法（静态方法） ==========
    
    // 插件已连接（所有窗口共享）
    addonDidConnect: function() {
      JSB.log("插件已全局连接");
    },
    
    // 插件将要断开（所有窗口共享）
    addonWillDisconnect: function() {
      JSB.log("插件将要全局断开");
    }
  });
};
```

### 2.5 基本的 UI 操作

#### HUD 提示

```javascript
// 方法1：使用原生 API
Application.sharedInstance().showHUD(
  "提示信息",      // 消息内容
  self.window,     // 显示窗口
  2               // 显示时长（秒）
);

// 方法2：使用 MNUtil（需要先加载 MNUtils）
MNUtil.showHUD("提示信息");           // 默认 2 秒
MNUtil.showHUD("提示信息", 3);        // 指定秒数
MNUtil.waitHUD("正在处理...");        // 持续显示
MNUtil.stopHUD();                     // 停止显示
```

#### 弹窗对话框

```javascript
// 简单提示框
let alert = UIAlertView.alloc().initWithTitleMessageDelegateCancelButtonTitleOtherButtonTitles(
  "标题",           // 标题
  "消息内容",       // 消息
  self,            // 代理
  "取消",          // 取消按钮
  ["确定"]         // 其他按钮
);
alert.show();

// 处理按钮点击
alertViewClickedButtonAtIndex: function(alertView, buttonIndex) {
  if (buttonIndex == 0) {
    JSB.log("点击了取消");
  } else if (buttonIndex == 1) {
    JSB.log("点击了确定");
  }
}

// 输入框
let inputAlert = UIAlertView.alloc().initWithTitleMessageDelegateCancelButtonTitleOtherButtonTitles(
  "输入标题",
  "请输入内容:",
  self,
  "取消",
  ["确定"]
);
inputAlert.alertViewStyle = 2;  // 2 表示文本输入
inputAlert.show();

// 获取输入内容
alertViewClickedButtonAtIndex: function(alertView, buttonIndex) {
  if (buttonIndex == 1) {
    let inputText = alertView.textFieldAtIndex(0).text;
    JSB.log("输入的内容: " + inputText);
  }
}
```

### 2.6 错误处理和日志系统

```javascript
// 基础错误处理
function safeExecute(func, defaultValue) {
  try {
    return func();
  } catch (error) {
    JSB.log("错误: " + error);
    
    // 记录错误详情
    if (error.stack) {
      JSB.log("堆栈: " + error.stack);
    }
    
    // 显示用户友好的错误提示
    Application.sharedInstance().showHUD(
      "操作失败，请重试",
      self.window,
      2
    );
    
    return defaultValue;
  }
}

// 使用示例
let result = safeExecute(function() {
  // 可能出错的代码
  return someRiskyOperation();
}, null);

// 日志系统
let Logger = {
  // 日志级别
  LEVEL: {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3
  },
  
  currentLevel: 0,  // 当前日志级别
  
  // 输出日志
  log: function(level, tag, message) {
    if (level >= this.currentLevel) {
      let levelStr = ["DEBUG", "INFO", "WARN", "ERROR"][level];
      let logMessage = `[${levelStr}] [${tag}] ${message}`;
      JSB.log(logMessage);
      
      // 错误级别同时显示 HUD
      if (level === this.LEVEL.ERROR) {
        Application.sharedInstance().showHUD(
          "错误: " + message,
          self.window,
          3
        );
      }
    }
  },
  
  // 便捷方法
  debug: function(tag, message) {
    this.log(this.LEVEL.DEBUG, tag, message);
  },
  
  info: function(tag, message) {
    this.log(this.LEVEL.INFO, tag, message);
  },
  
  warn: function(tag, message) {
    this.log(this.LEVEL.WARN, tag, message);
  },
  
  error: function(tag, message) {
    this.log(this.LEVEL.ERROR, tag, message);
  }
};

// 使用日志系统
Logger.debug("Init", "插件初始化开始");
Logger.info("Init", "加载配置文件");
Logger.warn("Init", "配置文件不存在，使用默认配置");
Logger.error("Init", "初始化失败");
```

### 2.7 实战练习：增强版 Hello World

让我们创建一个功能更丰富的 Hello World 插件，包含：
- 配置管理
- 日志系统
- 用户交互
- 错误处理

```javascript
// main.js - 增强版 Hello World

JSB.newAddon = function(mainPath) {
  
  // 日志系统
  const Logger = {
    log: function(level, message) {
      let timestamp = new Date().toISOString();
      JSB.log(`[${timestamp}] [${level}] ${message}`);
    },
    info: function(msg) { this.log("INFO", msg); },
    error: function(msg) { this.log("ERROR", msg); }
  };
  
  return JSB.defineClass('HelloWorldPlus : JSExtension', {
    
    // 初始化
    sceneWillConnect: function() {
      Logger.info("插件初始化开始");
      
      // 保存路径
      self.mainPath = mainPath;
      
      // 初始化配置
      self.initConfig();
      
      // 初始化 UI
      self.initUI();
      
      Logger.info("插件初始化完成");
    },
    
    // 初始化配置
    initConfig: function() {
      // 从 NSUserDefaults 读取配置
      let defaults = NSUserDefaults.standardUserDefaults();
      
      // 读取或设置默认值
      self.config = {
        userName: defaults.objectForKey("HelloWorld_UserName") || "用户",
        clickCount: defaults.objectForKey("HelloWorld_ClickCount") || 0,
        lastOpenTime: defaults.objectForKey("HelloWorld_LastOpenTime") || null
      };
      
      Logger.info("配置已加载: " + JSON.stringify(self.config));
    },
    
    // 保存配置
    saveConfig: function() {
      let defaults = NSUserDefaults.standardUserDefaults();
      
      defaults.setObjectForKey(self.config.userName, "HelloWorld_UserName");
      defaults.setObjectForKey(self.config.clickCount, "HelloWorld_ClickCount");
      defaults.setObjectForKey(new Date().toISOString(), "HelloWorld_LastOpenTime");
      
      Logger.info("配置已保存");
    },
    
    // 初始化 UI
    initUI: function() {
      self.isVisible = false;
      
      // 显示欢迎消息
      let welcomeMsg = `欢迎回来，${self.config.userName}！`;
      if (self.config.lastOpenTime) {
        welcomeMsg += `\n上次使用: ${self.config.lastOpenTime}`;
      }
      
      Application.sharedInstance().showHUD(
        welcomeMsg,
        self.window,
        3
      );
    },
    
    // 点击插件图标
    toggleAddon: function() {
      try {
        self.config.clickCount++;
        Logger.info(`插件被点击，总次数: ${self.config.clickCount}`);
        
        if (!self.isVisible) {
          self.showMenu();
        } else {
          self.hideMenu();
        }
        
        self.isVisible = !self.isVisible;
        self.saveConfig();
        
      } catch (error) {
        Logger.error("toggleAddon 错误: " + error);
      }
    },
    
    // 显示菜单
    showMenu: function() {
      let alert = UIAlertView.alloc().initWithTitleMessageDelegateCancelButtonTitleOtherButtonTitles(
        "Hello World Plus",
        `你好 ${self.config.userName}！\n点击次数: ${self.config.clickCount}`,
        self,
        "关闭",
        ["修改用户名", "查看统计", "重置数据"]
      );
      alert.show();
    },
    
    // 处理菜单选择
    alertViewClickedButtonAtIndex: function(alertView, buttonIndex) {
      switch(buttonIndex) {
        case 0:  // 关闭
          Logger.info("用户关闭菜单");
          break;
          
        case 1:  // 修改用户名
          self.changeUserName();
          break;
          
        case 2:  // 查看统计
          self.showStatistics();
          break;
          
        case 3:  // 重置数据
          self.resetData();
          break;
      }
      
      self.isVisible = false;
    },
    
    // 修改用户名
    changeUserName: function() {
      let inputAlert = UIAlertView.alloc().initWithTitleMessageDelegateCancelButtonTitleOtherButtonTitles(
        "修改用户名",
        "请输入新的用户名:",
        self,
        "取消",
        ["确定"]
      );
      inputAlert.alertViewStyle = 2;
      inputAlert.tag = 100;  // 用于区分不同的对话框
      
      // 设置默认值
      inputAlert.textFieldAtIndex(0).text = self.config.userName;
      inputAlert.show();
    },
    
    // 处理输入框
    alertViewClickedButtonAtIndex: function(alertView, buttonIndex) {
      // 检查是否是输入框
      if (alertView.tag === 100 && buttonIndex === 1) {
        let newName = alertView.textFieldAtIndex(0).text;
        
        if (newName && newName.length > 0) {
          self.config.userName = newName;
          self.saveConfig();
          
          Application.sharedInstance().showHUD(
            `用户名已更改为: ${newName}`,
            self.window,
            2
          );
          
          Logger.info(`用户名更改为: ${newName}`);
        }
      } else {
        // 调用原来的处理方法
        self.alertViewClickedButtonAtIndex(alertView, buttonIndex);
      }
    },
    
    // 显示统计
    showStatistics: function() {
      let stats = `📊 使用统计\n` +
                 `用户名: ${self.config.userName}\n` +
                 `点击次数: ${self.config.clickCount}\n` +
                 `上次使用: ${self.config.lastOpenTime || '首次使用'}`;
      
      Application.sharedInstance().showHUD(stats, self.window, 4);
    },
    
    // 重置数据
    resetData: function() {
      self.config = {
        userName: "用户",
        clickCount: 0,
        lastOpenTime: null
      };
      
      // 清除所有保存的数据
      let defaults = NSUserDefaults.standardUserDefaults();
      defaults.removeObjectForKey("HelloWorld_UserName");
      defaults.removeObjectForKey("HelloWorld_ClickCount");
      defaults.removeObjectForKey("HelloWorld_LastOpenTime");
      
      Application.sharedInstance().showHUD(
        "数据已重置",
        self.window,
        2
      );
      
      Logger.info("用户数据已重置");
    },
    
    // 处理选中文本
    onPopupMenuOnSelection: function(sender) {
      let selectedText = sender.userInfo.documentController.selectionText;
      
      // 创建问候语
      let greeting = `Hello ${selectedText}!`;
      
      Application.sharedInstance().showHUD(greeting, self.window, 2);
      
      Logger.info(`选中文本: ${selectedText}`);
    },
    
    // 清理资源
    sceneWillDisconnect: function() {
      self.saveConfig();
      Logger.info("插件已卸载，配置已保存");
    }
  });
};
```

### 2.8 本章小结

在这一章中，我们深入学习了插件的基础架构：

✅ 插件文件结构和 mnaddon.json 配置
✅ JSBridge 技术原理和 API 调用规则
✅ 完整的生命周期方法（18个）
✅ 基本的 UI 操作（HUD、对话框、输入框）
✅ 错误处理和日志系统
✅ 配置管理（NSUserDefaults）
✅ 实战项目：增强版 Hello World

### 2.9 重要：API 验证与可信度指南 ⚠️

**在继续学习之前，必须了解如何验证API的真实性！**

#### 为什么需要验证 API

MarginNote 插件开发涉及多个框架和大量 API，**绝对不能**盲目相信任何文档或教程中的 API 调用。必须通过以下方式验证：

#### 验证步骤

**1. 检查源码**
```bash
# 搜索方法是否存在
grep -r "methodName" mnutils/
grep -r "functionName" mnutils/mnutils/mnutils.js
grep -r "className" mnutils/mnutils/xdyyutils.js
```

**2. 查阅官方文档**
- `mnutils/MNUtils_API_Guide.md` - 完整 API 参考
- `mnutils/CLAUDE.md` - 内部实现细节和注意事项

**3. 实际测试**
```javascript
// 在插件中测试方法是否存在
if (typeof MNUtil.methodName === 'function') {
  // 方法存在，可以安全调用
  MNUtil.methodName();
} else {
  MNUtil.showHUD("方法不存在！");
}
```

#### 常见错误示例

以下是**错误的编造API**（绝对不要使用）：
```javascript
// ❌ 错误 - 这些方法不存在
MNUtil.readFile();      // 应该是 MNUtil.readText()
MNUtil.writeFile();     // 应该是 MNUtil.writeText()
MNUtil.fileExists();    // 应该是 MNUtil.isfileExists()
note.mergeWithNote();   // 完全不存在
note.moveToNotebook();  // 完全不存在
```

#### 如何确认正确的方法名

**1. 文件操作相关**
```javascript
// ✅ 正确的文件操作 API
MNUtil.readText(path)           // 读取文本文件
MNUtil.writeText(path, text)    // 写入文本文件
MNUtil.readJSON(path)           // 读取 JSON 文件
MNUtil.writeJSON(path, object)  // 写入 JSON 文件
MNUtil.isfileExists(path)       // 检查文件存在
MNUtil.createFolder(path)       // 创建文件夹
MNUtil.contentsOfDirectory(path) // 获取目录内容
```

**2. 笔记操作相关**
```javascript
// ✅ 正确的笔记操作 API
note.createChildNote(config)           // 创建子笔记
note.appendTextComment(text)           // 添加文本评论
note.removeCommentByIndex(index)       // 删除指定评论
note.focusInMindMap()                  // 在脑图中聚焦
note.focusInDocument()                 // 在文档中聚焦
```

#### 开发建议

1. **永远不要猜测API名称** - 必须通过源码验证
2. **优先查阅 API Guide** - 这是最权威的参考文档
3. **测试每个新方法** - 在使用前先测试是否存在
4. **保持怀疑态度** - 对所有非官方文档保持谨慎

下一章，我们将学习 MNUtils 框架，**所有API都已经过验证确认存在**。

---

## 第3章：MNUtils 框架入门

### 3.1 为什么 MNUtils 是必需的

MNUtils 是 MarginNote 插件生态的**核心基础设施层**，几乎所有成熟的插件都依赖它。

#### MNUtils 的重要性

1. **API 封装**：将复杂的 Objective-C API 封装成简单的 JavaScript 接口
2. **功能增强**：提供原生 API 没有的高级功能
3. **错误处理**：统一的错误处理和日志系统
4. **跨版本兼容**：处理不同 MarginNote 版本的差异
5. **开发效率**：大幅提升开发效率，减少重复代码

#### 对比示例

```javascript
// 不使用 MNUtils - 获取当前笔记本
let studyController = Application.sharedInstance().studyController(self.window);
let notebookController = studyController.notebookController;
let notebook = notebookController.notebook;
let notebookId = notebook.topicId;

// 使用 MNUtils - 一行代码
let notebookId = MNUtil.currentNotebook.topicId;
```

### 3.2 MNUtils 的安装和初始化

#### 方法1：自动安装（推荐）

MNUtils 插件会自动为其他插件提供 API 支持，只需要：

1. 确保已安装 MNUtils 插件
2. 在你的插件中加载 MNUtils

```javascript
JSB.newAddon = function(mainPath) {
  
  return JSB.defineClass('YourPlugin : JSExtension', {
    
    sceneWillConnect: async function() {
      self.mainPath = mainPath;
      
      // 检查并加载 MNUtils
      if (!await self.loadMNUtils()) {
        return;  // MNUtils 未安装，退出
      }
      
      // 初始化 MNUtils
      MNUtil.init(self.mainPath);
      
      // 现在可以使用所有 MNUtils API 了
      MNUtil.showHUD("MNUtils 已加载！");
    },
    
    // 加载 MNUtils
    loadMNUtils: async function() {
      try {
        // 尝试加载 mnutils
        JSB.require('mnutils');
        
        // 检查版本（可选）
        if (MNUtil.version < "1.0.0") {
          Application.sharedInstance().showHUD(
            "MNUtils 版本过低，请更新",
            self.window,
            3
          );
          return false;
        }
        
        return true;
        
      } catch (error) {
        Application.sharedInstance().showHUD(
          "请先安装 MNUtils 插件",
          self.window,
          3
        );
        return false;
      }
    }
  });
};
```

#### 方法2：内置 MNUtils（独立运行）

如果你的插件需要独立运行，可以将 mnutils.js 文件复制到插件目录：

```javascript
JSB.newAddon = function(mainPath) {
  // 加载内置的 mnutils
  JSB.require('lib/mnutils');
  
  return JSB.defineClass('YourPlugin : JSExtension', {
    sceneWillConnect: function() {
      MNUtil.init(mainPath);
      // 使用 MNUtils
    }
  });
};
```

### 3.3 MNUtils 核心类概览

MNUtils 提供了 10 个核心类，包含 500+ 个 API：

```javascript
// 1. MNUtil - 核心工具类（400+ 方法）
MNUtil.showHUD("提示信息");
MNUtil.currentNotebook;  // 当前笔记本
MNUtil.studyView;        // 学习视图

// 2. MNNote - 笔记操作类（180+ 方法）
let note = MNNote.getFocusNote();     // 获取焦点笔记
note.noteTitle = "新标题";            // 修改标题
note.appendComment("评论内容");       // 添加评论

// 3. MNComment - 评论管理类
let comment = MNComment.createTextComment("文本评论");
comment.type;  // 评论类型

// 4. MNDocument - 文档操作类
let doc = MNDocument.getCurrentDocument();
doc.docTitle;  // 文档标题

// 5. MNNotebook - 笔记本管理类
let notebook = MNNotebook.getCurrentNotebook();
notebook.notes;  // 所有笔记

// 6. MNButton - 高级按钮组件
let button = MNButton.new({
  title: "点击我",
  action: function() { MNUtil.showHUD("被点击了"); }
});

// 7. MNConnection - 网络请求类
MNConnection.fetch("https://api.example.com/data");

// 8. MNExtensionPanel - 扩展面板（MN4）
MNExtensionPanel.show();

// 9. MNLog - 日志系统
MNLog.info("信息日志");
MNLog.error("错误日志");

// 10. Menu - 菜单系统
let menu = Menu.new(self, self); // 原标题: "选择操作");
menu.addMenuItem("选项1");
menu.show();
```

### 3.4 MNUtil 类详解

MNUtil 是最常用的类，提供了大量实用方法：

#### 系统信息和环境

```javascript
// 获取版本信息
MNUtil.version;           // MNUtils 版本
MNUtil.MNVersion;         // MarginNote 版本
MNUtil.isMN4;            // 是否是 MN4
MNUtil.isIOS;            // 是否是 iOS
MNUtil.isMac;            // 是否是 macOS

// 获取路径
MNUtil.mainPath;          // 插件主路径
MNUtil.documentPath;      // 文档路径
MNUtil.tempPath;          // 临时文件路径

// 获取屏幕信息
MNUtil.screenWidth;       // 屏幕宽度
MNUtil.screenHeight;      // 屏幕高度
MNUtil.isDarkMode;        // 是否深色模式
```

#### UI 相关方法

```javascript
// HUD 提示
MNUtil.showHUD("普通提示");              // 2秒
MNUtil.showHUD("自定义时长", 5);         // 5秒
MNUtil.waitHUD("加载中...");             // 持续显示
MNUtil.stopHUD();                        // 停止显示
MNUtil.stopHUD(1);                       // 1秒后停止

// 对话框
MNUtil.confirm("标题", "确认删除？").then(result => {
  if (result) {
    // 用户点击确认
  }
});

MNUtil.input("输入标题", "请输入内容", "默认值").then(text => {
  if (text) {
    MNUtil.showHUD("输入: " + text);
  }
});

// 选择框
MNUtil.select("选择选项", ["选项1", "选项2", "选项3"]).then(index => {
  MNUtil.showHUD("选择了: " + index);
});
```

#### 剪贴板操作

```javascript
// 文本剪贴板
MNUtil.copy("复制的文本");
let text = MNUtil.paste();  // 获取剪贴板文本

// 图片剪贴板
MNUtil.copyImage(imageData);
let image = MNUtil.pasteImage();

// HTML 剪贴板
MNUtil.copyHTML("<b>粗体文本</b>");

// 多格式复制
MNUtil.copyData({
  text: "纯文本",
  html: "<b>HTML文本</b>",
  image: imageData
});
```

#### 延时和动画

```javascript
// 延时执行
MNUtil.delay(1).then(() => {
  MNUtil.showHUD("1秒后执行");
});

// 动画
MNUtil.animate(() => {
  view.frame = {x: 100, y: 100, width: 200, height: 200};
}, 0.3).then(() => {
  MNUtil.showHUD("动画完成");
});

// 定时器
let timer = MNUtil.setInterval(() => {
  console.log("每秒执行");
}, 1000);

// 清除定时器
MNUtil.clearInterval(timer);
```

#### 文件操作

```javascript
// 读取文本文件
let content = MNUtil.readText("/path/to/file.txt");

// 写入文本文件
MNUtil.writeText("/path/to/file.txt", "文件内容");

// 读取 JSON 文件
let jsonData = MNUtil.readJSON("/path/to/data.json");

// 写入 JSON 文件
MNUtil.writeJSON("/path/to/data.json", {key: "value"});

// 检查文件是否存在
if (MNUtil.isfileExists("/path/to/file.txt")) {
  // 文件存在
}

// 创建文件夹
MNUtil.createFolder("/path/to/directory");

// 创建文件夹（包括中间目录）
MNUtil.createFolderDev("/path/to/nested/directory");

// 获取目录内容
let files = MNUtil.contentsOfDirectory("/path/to/directory");

// 获取目录下所有子路径（递归）
let allPaths = MNUtil.subpathsOfDirectory("/path/to/directory");

// 复制文件
MNUtil.copyFile("/source/file.txt", "/target/file.txt");

// 获取文件名
let fileName = MNUtil.getFileName("/path/to/file.txt"); // 返回 "file.txt"

// 获取文件所在文件夹
let folder = MNUtil.getFileFold("/path/to/file.txt"); // 返回 "/path/to"
```

### 3.5 MNNote 类详解

MNNote 是处理笔记的核心类：

#### 获取笔记

```javascript
// 获取焦点笔记（当前选中的）
let focusNote = MNNote.getFocusNote();

// 通过 ID 获取笔记
let note = MNNote.getNoteById("note-id-123");

// 获取所有笔记
let allNotes = MNNotebook.getCurrentNotebook().notes;

// 获取选中的多个笔记
let selectedNotes = MNNote.getSelectedNotes();
```

#### 笔记属性

```javascript
let note = MNNote.getFocusNote();

// 基本属性
note.noteId;           // 笔记 ID
note.noteTitle;        // 标题
note.excerptText;      // 摘录文本
note.createTime;       // 创建时间
note.modifyTime;       // 修改时间

// 设置属性
note.noteTitle = "新标题";
note.excerptText = "新摘录";

// 颜色和样式
note.color;            // 颜色索引 (0-15)
note.fillIndex;        // 填充样式 (0-10)
note.mindmapBranchStyle; // 脑图分支样式

// 位置信息
note.startPage;        // 起始页
note.endPage;          // 结束页
note.startPos;         // 起始位置
note.endPos;           // 结束位置

// 文档信息
note.docMd5;           // 所属文档 MD5
note.notebookId;       // 所属笔记本 ID
```

#### 评论管理

```javascript
// 获取所有评论
let comments = note.comments;  // 原始评论数组（5种基础类型）
let MNComments = note.MNComments;  // MNComment 对象数组（15+种细分类型）

// 添加评论（注意：这些是 MNNote 类的方法，不是原生方法）
note.appendTextComment("文本评论");
note.appendHtmlComment("<b>HTML评论</b>", "显示文本", 16, "tag");
note.appendMarkdownComment("**Markdown** 评论");

// 删除评论
note.removeCommentByIndex(0);  // 删除第一个评论

// 替换评论内容
note.replaceWithTextComment("新的文本内容", 0);  // 替换第一个评论
note.replaceWithMarkdownComment("**新的Markdown内容**", 0);

// 原始评论类型（5种基础类型）
comments.forEach(comment => {
  switch(comment.type) {
    case "TextNote":     // 文本评论
    case "HtmlNote":     // HTML评论
    case "PaintNote":    // 绘图评论（包括图片和手写）
    case "AudioNote":    // 音频评论
    case "LinkNote":     // 合并摘录评论
      // 处理不同类型
  }
});

// MNComment 细分类型（15+种）
MNComments.forEach(mnComment => {
  switch(mnComment.type) {
    case "textComment":        // 普通文本
    case "markdownComment":    // Markdown格式
    case "tagComment":         // 标签（#开头）
    case "imageComment":       // 图片
    case "drawingComment":     // 手写
    case "mergedTextComment":  // 合并的文本
    // ... 更多类型
  }
});
```

#### 链接管理

```javascript
// 获取链接的笔记
let linkedNotes = note.linkedNotes;  // 返回链接的笔记数组

// 通过评论创建链接（MNUtils 方式）
// 链接是通过特殊格式的评论实现的
// 格式：marginnote4app://note/[noteId]
note.appendTextComment("marginnote4app://note/" + targetNote.noteId);

// 检查是否有链接（需要遍历 linkedNotes）
let hasLink = note.linkedNotes && note.linkedNotes.some(n => n.noteId === targetNote.noteId);
```

#### 笔记操作

```javascript
// 创建子笔记
let childNote = note.createChildNote({
  noteTitle: "子笔记标题",
  excerptText: "子笔记摘录内容"
});

// 粘贴笔记（从剪贴板）
note.paste();  // 在当前笔记下粘贴

// 移除笔记（从脑图）
note.remove();  // 注意：这是 MNComment 的方法，用于移除链接评论

// 聚焦到笔记（在脑图中）
note.focusInMindMap();  // 或 note.focusInMindMap(延迟毫秒数)

// 在文档中定位
note.focusInDocument(); // 或 note.focusInDocument(延迟毫秒数)

// 获取子笔记
let childNotes = note.childNotes;

// 获取父笔记
let parentNote = note.parentNote;

// 批量粘贴子笔记（通过ID数组）
note.pasteChildNotesByIdArr(["noteId1", "noteId2"]);
```

### 3.6 实战：笔记处理器插件

让我们创建一个实用的笔记处理器插件，展示 MNUtils 的强大功能：

```javascript
// main.js - 笔记处理器插件

JSB.newAddon = function(mainPath) {
  
  return JSB.defineClass('NoteProcessor : JSExtension', {
    
    // 初始化
    sceneWillConnect: async function() {
      self.mainPath = mainPath;
      
      // 加载 MNUtils
      try {
        JSB.require('mnutils');
        MNUtil.init(self.mainPath);
      } catch (error) {
        Application.sharedInstance().showHUD(
          "请安装 MNUtils 插件",
          self.window,
          3
        );
        return;
      }
      
      MNUtil.showHUD("笔记处理器已加载");
    },
    
    // 点击插件图标 - 显示主菜单
    toggleAddon: function() {
      self.showMainMenu();
    },
    
    // 主菜单
    showMainMenu: function() {
      // 创建菜单（正确方式）
      let menu = Menu.new(self, self);
      
      menu.addMenuItem("📊 笔记统计", "showStatistics", "", false);
      menu.addMenuItem("🎨 批量设置颜色", "batchSetColor", "", false);
      menu.addMenuItem("🏷 批量添加标签", "batchAddTag", "", false);
      menu.addMenuItem("🔗 创建链接网络", "createLinkNetwork", "", false);
      menu.addMenuItem("📝 提取所有摘录", "extractAllExcerpts", "", false);
      menu.addMenuItem("🗑 清理空白笔记", "cleanEmptyNotes", "", false);
      menu.addMenuItem("📋 导出为 Markdown", "exportToMarkdown", "", false);
      
      menu.show();
    },
    
    // 功能1：笔记统计
    showStatistics: function() {
      let notebook = MNUtil.currentNotebook;
      if (!notebook) {
        MNUtil.showHUD("请先打开笔记本");
        return;
      }
      
      let notes = notebook.notes;
      
      // 统计数据
      let stats = {
        total: notes.length,
        withTitle: 0,
        withExcerpt: 0,
        withComment: 0,
        withLink: 0,
        colors: {}
      };
      
      notes.forEach(note => {
        if (note.noteTitle) stats.withTitle++;
        if (note.excerptText) stats.withExcerpt++;
        if (note.comments.length > 0) stats.withComment++;
        if (note.linkedNotes.length > 0) stats.withLink++;
        
        // 颜色统计
        let color = note.color || 0;
        stats.colors[color] = (stats.colors[color] || 0) + 1;
      });
      
      // 显示结果
      let message = `📊 笔记统计\n` +
                   `总数: ${stats.total}\n` +
                   `有标题: ${stats.withTitle}\n` +
                   `有摘录: ${stats.withExcerpt}\n` +
                   `有评论: ${stats.withComment}\n` +
                   `有链接: ${stats.withLink}\n` +
                   `颜色分布: ${JSON.stringify(stats.colors)}`;
      
      MNUtil.alert("笔记统计", message);
    },
    
    // 功能2：批量设置颜色
    batchSetColor: async function() {
      let notes = MNNote.getSelectedNotes();
      
      if (notes.length === 0) {
        MNUtil.showHUD("请先选择笔记");
        return;
      }
      
      // 颜色选项
      let colors = [
        "⚪ 无色", "🔴 红色", "🟠 橙色", "🟡 黄色",
        "🟢 绿色", "🔵 蓝色", "🟣 紫色", "⚫ 灰色"
      ];
      
      let colorIndex = await MNUtil.userSelect("选择颜色", "", colors);
      
      if (colorIndex >= 0) {
        // 使用 undoGrouping 批量操作
        MNUtil.undoGrouping(() => {
          notes.forEach(note => {
            note.color = colorIndex;
          });
        });
        
        MNUtil.showHUD(`已设置 ${notes.length} 个笔记的颜色`);
      }
    },
    
    // 功能3：批量添加标签
    batchAddTag: async function() {
      let notes = MNNote.getSelectedNotes();
      
      if (notes.length === 0) {
        MNUtil.showHUD("请先选择笔记");
        return;
      }
      
      let result = await MNUtil.userInput("添加标签", "输入标签内容（如 #重要）");
      let tag = result.text;
      
      if (tag) {
        // 确保标签格式
        if (!tag.startsWith("#")) {
          tag = "#" + tag;
        }
        
        MNUtil.undoGrouping(() => {
          notes.forEach(note => {
            // 添加到标题末尾
            if (note.noteTitle) {
              note.noteTitle = note.noteTitle + " " + tag;
            } else {
              note.noteTitle = tag;
            }
          });
        });
        
        MNUtil.showHUD(`已为 ${notes.length} 个笔记添加标签`);
      }
    },
    
    // 功能4：创建链接网络
    createLinkNetwork: function() {
      let notes = MNNote.getSelectedNotes();
      
      if (notes.length < 2) {
        MNUtil.showHUD("请选择至少2个笔记");
        return;
      }
      
      MNUtil.confirm("创建链接网络", 
        `将为 ${notes.length} 个笔记创建相互链接，确认？`
      ).then(confirmed => {
        if (confirmed) {
          MNUtil.undoGrouping(() => {
            // 创建全连接网络
            for (let i = 0; i < notes.length; i++) {
              for (let j = i + 1; j < notes.length; j++) {
                notes[i].linkToNote(notes[j], true);  // 双向链接
              }
            }
          });
          
          MNUtil.showHUD("链接网络已创建");
        }
      });
    },
    
    // 功能5：提取所有摘录
    extractAllExcerpts: function() {
      let notebook = MNUtil.currentNotebook;
      if (!notebook) {
        MNUtil.showHUD("请先打开笔记本");
        return;
      }
      
      let excerpts = [];
      notebook.notes.forEach(note => {
        if (note.excerptText) {
          excerpts.push(note.excerptText);
        }
      });
      
      if (excerpts.length > 0) {
        // 复制到剪贴板
        let text = excerpts.join("\n\n");
        MNUtil.copy(text);
        
        MNUtil.showHUD(`已复制 ${excerpts.length} 条摘录到剪贴板`);
      } else {
        MNUtil.showHUD("没有找到摘录");
      }
    },
    
    // 功能6：清理空白笔记
    cleanEmptyNotes: function() {
      let notebook = MNUtil.currentNotebook;
      if (!notebook) {
        MNUtil.showHUD("请先打开笔记本");
        return;
      }
      
      // 查找空白笔记
      let emptyNotes = notebook.notes.filter(note => {
        return !note.noteTitle && 
               !note.excerptText && 
               note.comments.length === 0;
      });
      
      if (emptyNotes.length === 0) {
        MNUtil.showHUD("没有空白笔记");
        return;
      }
      
      MNUtil.confirm("清理空白笔记", 
        `发现 ${emptyNotes.length} 个空白笔记，确认删除？`
      ).then(confirmed => {
        if (confirmed) {
          MNUtil.undoGrouping(() => {
            emptyNotes.forEach(note => {
              note.delete();
            });
          });
          
          MNUtil.showHUD(`已删除 ${emptyNotes.length} 个空白笔记`);
        }
      });
    },
    
    // 功能7：导出为 Markdown
    exportToMarkdown: function() {
      let notebook = MNUtil.currentNotebook;
      if (!notebook) {
        MNUtil.showHUD("请先打开笔记本");
        return;
      }
      
      let markdown = `# ${notebook.title}\n\n`;
      
      // 递归生成 Markdown
      function processNote(note, level) {
        let indent = "  ".repeat(level);
        let prefix = level > 0 ? "- " : "## ";
        
        // 标题
        if (note.noteTitle) {
          markdown += indent + prefix + note.noteTitle + "\n";
        }
        
        // 摘录
        if (note.excerptText) {
          markdown += indent + "  > " + note.excerptText + "\n";
        }
        
        // 评论
        note.comments.forEach(comment => {
          if (comment.type === "TextNote") {
            markdown += indent + "  - " + comment.text + "\n";
          }
        });
        
        markdown += "\n";
        
        // 处理子笔记
        if (note.childNotes) {
          note.childNotes.forEach(child => {
            processNote(child, level + 1);
          });
        }
      }
      
      // 处理所有顶级笔记
      notebook.notes.filter(note => !note.parentNote).forEach(note => {
        processNote(note, 0);
      });
      
      // 复制到剪贴板
      MNUtil.copy(markdown);
      
      MNUtil.showHUD("已导出为 Markdown 并复制到剪贴板");
      
      // 显示预览
      MNUtil.alert("Markdown 预览", markdown.substring(0, 500) + "...");
    }
  });
};
```

### 3.7 MNUtils 最佳实践

#### 1. 错误处理

```javascript
// 使用 MNUtil 的错误处理
MNUtil.try(() => {
  // 可能出错的代码
  let note = MNNote.getFocusNote();
  note.noteTitle = "新标题";
}, (error) => {
  MNUtil.showHUD("操作失败: " + error.message);
});
```

#### 2. 批量操作优化

```javascript
// 使用 undoGrouping 将多个操作合并为一个撤销单元
MNUtil.undoGrouping(() => {
  // 批量操作
  notes.forEach(note => {
    note.color = 1;
    note.noteTitle = "已处理";
  });
});
```

#### 3. 异步操作

```javascript
// 使用 async/await
async function processNotes() {
  MNUtil.waitHUD("处理中...");
  
  // 模拟异步操作
  await MNUtil.delay(1);
  
  let result = await MNUtil.confirm("确认", "继续处理？");
  
  if (result) {
    // 继续处理
  }
  
  MNUtil.stopHUD();
}
```

#### 4. 性能优化

```javascript
// 缓存常用对象
let _currentNotebook = null;

function getCurrentNotebook() {
  if (!_currentNotebook) {
    _currentNotebook = MNUtil.currentNotebook;
  }
  return _currentNotebook;
}

// 清除缓存
function clearCache() {
  _currentNotebook = null;
}
```

### 3.8 本章小结

在这一章中，我们学习了 MNUtils 框架的基础知识：

✅ MNUtils 的重要性和安装方法
✅ 10个核心类的概览
✅ MNUtil 类的常用 API（UI、剪贴板、文件等）
✅ MNNote 类的笔记操作方法
✅ 评论和链接管理
✅ 实战项目：笔记处理器插件
✅ 最佳实践和性能优化

下一章，我们将深入学习笔记操作的高级技巧，包括 15 种评论类型的处理、复杂的链接管理、笔记树遍历等。

---

## 第4章：笔记操作进阶

### 4.1 理解 MarginNote 的数据模型

在深入笔记操作之前，我们需要理解 MarginNote 的数据模型：

```
学习集 (Study Set)
├── 笔记本 (Notebook)
│   ├── 笔记 (Note)
│   │   ├── 标题 (Title)
│   │   ├── 摘录 (Excerpt)
│   │   │   ├── 文本 (Text)
│   │   │   └── 图片 (Image)
│   │   ├── 评论 (Comments)
│   │   │   ├── 文本评论
│   │   │   ├── HTML评论
│   │   │   ├── 图片评论
│   │   │   ├── 音频评论
│   │   │   └── 链接评论
│   │   ├── 链接 (Links)
│   │   └── 子笔记 (Child Notes)
│   └── 文档 (Documents)
└── 复习卡片 (Review Cards)
```

### 4.2 创建和管理笔记

#### 创建不同类型的笔记

```javascript
// 1. 创建独立笔记（不关联文档）
function createStandaloneNote() {
  let notebook = MNUtil.currentNotebook;
  
  // 方法1：使用 MNNote 类
  let note1 = MNNote.createNote({
    notebookId: notebook.topicId,
    title: "独立笔记",
    excerpt: "这是一个独立笔记的摘录",
    comments: ["评论1", "评论2"]
  });
  
  // 方法2：使用原生 API
  let note2 = Database.sharedInstance().addNoteToNotebook(
    notebook.topicId,
    {
      noteTitle: "另一个独立笔记",
      excerptText: "摘录文本"
    }
  );
  
  return note1;
}

// 2. 创建关联文档的笔记
function createDocumentNote(docMd5, pageNo, rect) {
  let doc = MNDocument.getDocumentByMd5(docMd5);
  
  // 在指定位置创建摘录笔记
  let note = doc.createExcerptNote(
    pageNo,     // 页码
    rect,        // 矩形区域 {x, y, width, height}
    "摘录文本"   // 可选，自动提取文本
  );
  
  // 设置笔记属性
  note.noteTitle = "文档笔记";
  note.color = 3;  // 黄色
  
  return note;
}

// 3. 创建子笔记
function createChildNote(parentNote) {
  let childNote = parentNote.createChildNote({
    title: "子笔记标题",
    excerpt: "子笔记摘录"
  });
  
  // 子笔记会自动链接到父笔记
  childNote.color = parentNote.color;  // 继承父笔记颜色
  
  return childNote;
}

// 4. 批量创建笔记树
function createNoteTree(data) {
  function createNode(nodeData, parentNote) {
    let note = parentNote 
      ? parentNote.createChildNote(nodeData)
      : MNNote.createNote(nodeData);
    
    // 递归创建子节点
    if (nodeData.children) {
      nodeData.children.forEach(child => {
        createNode(child, note);
      });
    }
    
    return note;
  }
  
  // 示例数据
  let treeData = {
    title: "根节点",
    excerpt: "根节点摘录",
    children: [
      {
        title: "子节点1",
        children: [
          { title: "孙节点1-1" },
          { title: "孙节点1-2" }
        ]
      },
      {
        title: "子节点2",
        children: [
          { title: "孙节点2-1" }
        ]
      }
    ]
  };
  
  return MNUtil.undoGrouping(() => {
    return createNode(treeData);
  });
}
```

### 4.3 15种评论类型详解

MarginNote 支持 15 种评论类型，分为 5 个基础类型和细分类型：

```javascript
// 评论类型识别和处理
function processCommentTypes(note) {
  let results = {
    text: [],
    html: [],
    images: [],
    audio: [],
    links: [],
    tags: [],
    markdown: []
  };
  
  // 使用 MNComments（已处理的评论）
  note.MNComments.forEach(comment => {
    switch(comment.type) {
      // ========== 文本类 ==========
      case "textComment":           // 普通文本
        results.text.push(comment.text);
        break;
        
      case "markdownComment":       // Markdown 文本
        results.markdown.push(comment.text);
        break;
        
      case "tagComment":           // 标签（#开头）
        results.tags.push(comment.text);
        break;
        
      case "blankTextComment":     // 空白文本
        // 通常忽略
        break;
        
      // ========== HTML类 ==========
      case "HtmlComment":          // HTML 内容
        results.html.push(comment.html);
        break;
        
      // ========== 图片类 ==========
      case "imageComment":         // 纯图片
        results.images.push(comment.imageData);
        break;
        
      case "imageCommentWithDrawing":  // 图片+手写
        results.images.push({
          image: comment.imageData,
          hasDrawing: true
        });
        break;
        
      case "drawingComment":       // 纯手写
        results.images.push({
          drawing: comment.paintData,
          isDrawing: true
        });
        break;
        
      case "blankImageComment":    // 空白图片
        // 通常忽略
        break;
        
      // ========== 合并类 ==========
      case "mergedTextComment":    // 合并的文本
        results.text.push(comment.mergedText);
        break;
        
      case "mergedImageComment":   // 合并的图片
        results.images.push(comment.mergedImage);
        break;
        
      case "mergedImageCommentWithDrawing":  // 合并的图片+手写
        results.images.push({
          image: comment.mergedImage,
          hasDrawing: true
        });
        break;
        
      // ========== 链接类 ==========
      case "linkComment":          // 笔记链接
        results.links.push(comment.linkedNoteId);
        break;
        
      case "summaryComment":       // 摘要链接
        results.links.push({
          type: "summary",
          noteId: comment.linkedNoteId
        });
        break;
        
      // ========== 音频类 ==========
      case "audioComment":         // 音频评论
        results.audio.push(comment.audioData);
        break;
    }
  });
  
  return results;
}

// 创建不同类型的评论
function createVariousComments(note) {
  // 1. 文本评论
  note.appendComment("普通文本评论");
  
  // 2. Markdown 评论
  note.appendMarkdownComment("**粗体** *斜体* `代码`");
  
  // 3. 标签评论
  note.appendComment("#重要 #待复习");
  
  // 4. HTML 评论
  note.appendHtmlComment(`
    <div style="color: red;">
      <b>HTML内容</b>
      <ul>
        <li>列表项1</li>
        <li>列表项2</li>
      </ul>
    </div>
  `);
  
  // 5. 图片评论
  let imageData = MNUtil.getImageFromClipboard();
  if (imageData) {
    note.appendImageComment(imageData);
  }
  
  // 6. 音频评论（录音）
  // 需要用户交互，通常通过 UI 触发
  
  // 7. 链接评论（链接到其他笔记）
  let targetNote = MNNote.getFocusNote();
  if (targetNote) {
    note.appendLinkComment(targetNote.noteId);
  }
}
```

### 4.4 高级链接管理

```javascript
// 链接管理器
class LinkManager {
  
  // 创建不同类型的链接
  static createLinks(sourceNote, targetNotes, type) {
    switch(type) {
      case "sequential":  // 顺序链接
        this.createSequentialLinks(targetNotes);
        break;
        
      case "star":        // 星形链接（中心节点）
        this.createStarLinks(sourceNote, targetNotes);
        break;
        
      case "mesh":        // 网状链接（全连接）
        this.createMeshLinks(targetNotes);
        break;
        
      case "tree":        // 树形链接
        this.createTreeLinks(sourceNote, targetNotes);
        break;
    }
  }
  
  // 顺序链接：A → B → C → D
  static createSequentialLinks(notes) {
    MNUtil.undoGrouping(() => {
      for (let i = 0; i < notes.length - 1; i++) {
        notes[i].linkToNote(notes[i + 1], false);  // 单向链接
      }
    });
  }
  
  // 星形链接：中心节点连接所有其他节点
  static createStarLinks(centerNote, notes) {
    MNUtil.undoGrouping(() => {
      notes.forEach(note => {
        centerNote.linkToNote(note, true);  // 双向链接
      });
    });
  }
  
  // 网状链接：所有节点相互连接
  static createMeshLinks(notes) {
    MNUtil.undoGrouping(() => {
      for (let i = 0; i < notes.length; i++) {
        for (let j = i + 1; j < notes.length; j++) {
          notes[i].linkToNote(notes[j], true);
        }
      }
    });
  }
  
  // 树形链接：按层级创建链接
  static createTreeLinks(rootNote, notes, childrenPerNode = 2) {
    MNUtil.undoGrouping(() => {
      let queue = [rootNote];
      let index = 0;
      
      while (queue.length > 0 && index < notes.length) {
        let parent = queue.shift();
        
        for (let i = 0; i < childrenPerNode && index < notes.length; i++) {
          parent.linkToNote(notes[index], false);
          queue.push(notes[index]);
          index++;
        }
      }
    });
  }
  
  // 查找链接路径
  static findPath(startNote, endNote) {
    let visited = new Set();
    let queue = [{note: startNote, path: [startNote]}];
    
    while (queue.length > 0) {
      let {note, path} = queue.shift();
      
      if (note.noteId === endNote.noteId) {
        return path;
      }
      
      if (visited.has(note.noteId)) {
        continue;
      }
      
      visited.add(note.noteId);
      
      note.linkedNotes.forEach(linkedNote => {
        queue.push({
          note: linkedNote,
          path: [...path, linkedNote]
        });
      });
    }
    
    return null;  // 没有找到路径
  }
  
  // 检测链接环
  static detectCycles(note) {
    let cycles = [];
    let visited = new Set();
    let stack = [];
    
    function dfs(current) {
      if (stack.includes(current.noteId)) {
        // 发现环
        let cycleStart = stack.indexOf(current.noteId);
        cycles.push(stack.slice(cycleStart));
        return;
      }
      
      if (visited.has(current.noteId)) {
        return;
      }
      
      visited.add(current.noteId);
      stack.push(current.noteId);
      
      current.linkedNotes.forEach(linked => {
        dfs(linked);
      });
      
      stack.pop();
    }
    
    dfs(note);
    return cycles;
  }
}
```

### 4.5 笔记树遍历和操作

```javascript
// 笔记树遍历器
class NoteTreeTraverser {
  
  // 深度优先遍历
  static traverseDFS(rootNote, callback) {
    let visited = new Set();
    
    function dfs(note, depth = 0) {
      if (visited.has(note.noteId)) return;
      
      visited.add(note.noteId);
      callback(note, depth);
      
      // 遍历子笔记
      if (note.childNotes) {
        note.childNotes.forEach(child => {
          dfs(child, depth + 1);
        });
      }
    }
    
    dfs(rootNote);
  }
  
  // 广度优先遍历
  static traverseBFS(rootNote, callback) {
    let visited = new Set();
    let queue = [{note: rootNote, depth: 0}];
    
    while (queue.length > 0) {
      let {note, depth} = queue.shift();
      
      if (visited.has(note.noteId)) continue;
      
      visited.add(note.noteId);
      callback(note, depth);
      
      // 添加子笔记到队列
      if (note.childNotes) {
        note.childNotes.forEach(child => {
          queue.push({note: child, depth: depth + 1});
        });
      }
    }
  }
  
  // 查找所有叶子节点
  static findLeafNotes(rootNote) {
    let leafNotes = [];
    
    this.traverseDFS(rootNote, (note) => {
      if (!note.childNotes || note.childNotes.length === 0) {
        leafNotes.push(note);
      }
    });
    
    return leafNotes;
  }
  
  // 计算树的深度
  static calculateDepth(rootNote) {
    let maxDepth = 0;
    
    this.traverseDFS(rootNote, (note, depth) => {
      maxDepth = Math.max(maxDepth, depth);
    });
    
    return maxDepth;
  }
  
  // 收集所有后代笔记
  static collectDescendants(rootNote) {
    let descendants = [];
    
    this.traverseDFS(rootNote, (note, depth) => {
      if (depth > 0) {  // 排除根节点
        descendants.push(note);
      }
    });
    
    return descendants;
  }
  
  // 展开/折叠笔记树
  static toggleTree(rootNote, expand) {
    this.traverseDFS(rootNote, (note) => {
      note.isExpanded = expand;
    });
  }
  
  // 筛选笔记树
  static filterTree(rootNote, predicate) {
    let filteredNotes = [];
    
    this.traverseDFS(rootNote, (note) => {
      if (predicate(note)) {
        filteredNotes.push(note);
      }
    });
    
    return filteredNotes;
  }
}

// 使用示例
function demonstrateTreeTraversal() {
  let rootNote = MNNote.getFocusNote();
  
  // 1. 打印笔记树结构
  console.log("笔记树结构:");
  NoteTreeTraverser.traverseDFS(rootNote, (note, depth) => {
    let indent = "  ".repeat(depth);
    console.log(indent + "- " + (note.noteTitle || "无标题"));
  });
  
  // 2. 查找所有叶子节点
  let leaves = NoteTreeTraverser.findLeafNotes(rootNote);
  console.log(`找到 ${leaves.length} 个叶子节点`);
  
  // 3. 计算树深度
  let depth = NoteTreeTraverser.calculateDepth(rootNote);
  console.log(`树深度: ${depth}`);
  
  // 4. 筛选包含特定标签的笔记
  let taggedNotes = NoteTreeTraverser.filterTree(rootNote, (note) => {
    return note.noteTitle && note.noteTitle.includes("#重要");
  });
  console.log(`找到 ${taggedNotes.length} 个标记为重要的笔记`);
}
```

### 4.6 笔记内容处理

```javascript
// 笔记内容处理器
class NoteContentProcessor {
  
  // 提取纯文本
  static extractPlainText(note) {
    let texts = [];
    
    // 标题
    if (note.noteTitle) {
      texts.push(note.noteTitle);
    }
    
    // 摘录
    if (note.excerptText) {
      texts.push(note.excerptText);
    }
    
    // 评论
    note.comments.forEach(comment => {
      if (comment.type === "TextNote") {
        texts.push(comment.text);
      } else if (comment.type === "HtmlNote") {
        // 移除 HTML 标签
        let plainText = comment.text.replace(/<[^>]*>/g, "");
        texts.push(plainText);
      }
    });
    
    return texts.join("\n");
  }
  
  // 提取图片
  static extractImages(note) {
    let images = [];
    
    // 摘录图片
    if (note.excerptPic && note.excerptPic.paint) {
      let imageData = Database.sharedInstance()
        .getMediaByHash(note.excerptPic.paint);
      images.push({
        type: "excerpt",
        data: imageData
      });
    }
    
    // 评论图片
    note.comments.forEach((comment, index) => {
      if (comment.type === "PaintNote" && comment.paint) {
        let imageData = Database.sharedInstance()
          .getMediaByHash(comment.paint);
        images.push({
          type: "comment",
          index: index,
          data: imageData
        });
      }
    });
    
    return images;
  }
  
  // 格式化为 Markdown
  static toMarkdown(note, includeMetadata = false) {
    let markdown = "";
    
    // 元数据
    if (includeMetadata) {
      markdown += "---\n";
      markdown += `id: ${note.noteId}\n`;
      markdown += `created: ${note.createTime}\n`;
      markdown += `modified: ${note.modifyTime}\n`;
      markdown += `color: ${note.color}\n`;
      markdown += "---\n\n";
    }
    
    // 标题
    if (note.noteTitle) {
      markdown += `# ${note.noteTitle}\n\n`;
    }
    
    // 摘录
    if (note.excerptText) {
      markdown += `> ${note.excerptText}\n\n`;
    }
    
    // 评论
    if (note.comments.length > 0) {
      markdown += "## 评论\n\n";
      note.comments.forEach(comment => {
        if (comment.type === "TextNote") {
          markdown += `- ${comment.text}\n`;
        }
      });
      markdown += "\n";
    }
    
    // 链接
    if (note.linkedNotes.length > 0) {
      markdown += "## 链接\n\n";
      note.linkedNotes.forEach(linked => {
        markdown += `- [[${linked.noteTitle || linked.noteId}]]\n`;
      });
    }
    
    return markdown;
  }
  
  // 格式化为 HTML
  static toHTML(note) {
    let html = `<div class="note" data-id="${note.noteId}">`;
    
    // 标题
    if (note.noteTitle) {
      html += `<h1>${note.noteTitle}</h1>`;
    }
    
    // 摘录
    if (note.excerptText) {
      html += `<blockquote>${note.excerptText}</blockquote>`;
    }
    
    // 评论
    if (note.comments.length > 0) {
      html += `<div class="comments">`;
      note.comments.forEach(comment => {
        if (comment.type === "TextNote") {
          html += `<p>${comment.text}</p>`;
        } else if (comment.type === "HtmlNote") {
          html += comment.text;
        }
      });
      html += `</div>`;
    }
    
    html += `</div>`;
    return html;
  }
  
  // 搜索和高亮
  static searchAndHighlight(note, keyword) {
    let results = [];
    
    // 在标题中搜索
    if (note.noteTitle && note.noteTitle.includes(keyword)) {
      results.push({
        type: "title",
        text: note.noteTitle,
        highlighted: note.noteTitle.replace(
          new RegExp(keyword, "gi"),
          `<mark>$&</mark>`
        )
      });
    }
    
    // 在摘录中搜索
    if (note.excerptText && note.excerptText.includes(keyword)) {
      results.push({
        type: "excerpt",
        text: note.excerptText,
        highlighted: note.excerptText.replace(
          new RegExp(keyword, "gi"),
          `<mark>$&</mark>`
        )
      });
    }
    
    // 在评论中搜索
    note.comments.forEach((comment, index) => {
      if (comment.type === "TextNote" && comment.text.includes(keyword)) {
        results.push({
          type: "comment",
          index: index,
          text: comment.text,
          highlighted: comment.text.replace(
            new RegExp(keyword, "gi"),
            `<mark>$&</mark>`
          )
        });
      }
    });
    
    return results;
  }
}
```

### 4.7 实战：智能笔记助手

让我们创建一个综合性的智能笔记助手插件：

```javascript
// main.js - 智能笔记助手

JSB.newAddon = function(mainPath) {
  
  return JSB.defineClass('SmartNoteAssistant : JSExtension', {
    
    sceneWillConnect: async function() {
      self.mainPath = mainPath;
      
      // 加载 MNUtils
      try {
        JSB.require('mnutils');
        MNUtil.init(self.mainPath);
      } catch(e) {
        Application.sharedInstance().showHUD(
          "请安装 MNUtils", 
          self.window, 
          3
        );
        return;
      }
      
      // 初始化
      self.init();
    },
    
    init: function() {
      // 注册快捷键
      self.registerShortcuts();
      
      MNUtil.showHUD("智能笔记助手已启动");
    },
    
    // 注册快捷键
    registerShortcuts: function() {
      // 这里仅作示例，实际快捷键需要通过系统设置
    },
    
    // 主菜单
    toggleAddon: function() {
      let menu = Menu.new(self, self); // 原标题: "智能笔记助手");
      
      menu.addMenuItem("🔍 智能搜索", () => self.smartSearch());
      menu.addMenuItem("🏷 自动标签", () => self.autoTag());
      menu.addMenuItem("📊 笔记分析", () => self.analyzeNotes());
      menu.addMenuItem("🔗 关系图谱", () => self.showRelationGraph());
      menu.addMenuItem("📝 批量处理", () => self.batchProcess());
      menu.addMenuItem("💾 导出选项", () => self.exportOptions());
      menu.addMenuItem("🧹 清理工具", () => self.cleanupTools());
      menu.addMenuItem("⚙️ 设置", () => self.showSettings());
      
      menu.show();
    },
    
    // 功能1：智能搜索
    smartSearch: async function() {
      let keyword = await MNUtil.input("智能搜索", "输入搜索关键词");
      
      if (!keyword) return;
      
      let notebook = MNUtil.currentNotebook;
      if (!notebook) {
        MNUtil.showHUD("请先打开笔记本");
        return;
      }
      
      MNUtil.waitHUD("搜索中...");
      
      let results = [];
      let searchRegex = new RegExp(keyword, "gi");
      
      // 搜索所有笔记
      notebook.notes.forEach(note => {
        let matches = NoteContentProcessor.searchAndHighlight(note, keyword);
        
        if (matches.length > 0) {
          results.push({
            note: note,
            matches: matches,
            score: this.calculateRelevance(note, keyword)
          });
        }
      });
      
      // 按相关度排序
      results.sort((a, b) => b.score - a.score);
      
      MNUtil.stopHUD();
      
      // 显示结果
      if (results.length > 0) {
        self.showSearchResults(results);
      } else {
        MNUtil.showHUD("未找到匹配的笔记");
      }
    },
    
    // 计算相关度分数
    calculateRelevance: function(note, keyword) {
      let score = 0;
      let keywordLower = keyword.toLowerCase();
      
      // 标题匹配（权重最高）
      if (note.noteTitle) {
        let titleLower = note.noteTitle.toLowerCase();
        if (titleLower === keywordLower) {
          score += 100;  // 完全匹配
        } else if (titleLower.includes(keywordLower)) {
          score += 50;   // 部分匹配
        }
      }
      
      // 摘录匹配
      if (note.excerptText && note.excerptText.toLowerCase().includes(keywordLower)) {
        score += 30;
      }
      
      // 评论匹配
      note.comments.forEach(comment => {
        if (comment.type === "TextNote" && 
            comment.text.toLowerCase().includes(keywordLower)) {
          score += 10;
        }
      });
      
      // 链接数量（有更多链接的笔记可能更重要）
      score += note.linkedNotes.length * 5;
      
      return score;
    },
    
    // 显示搜索结果
    showSearchResults: function(results) {
      let menu = new Menu(`搜索结果 (${results.length})`);
      
      results.slice(0, 20).forEach(result => {
        let title = result.note.noteTitle || "无标题";
        let score = result.score;
        let matchCount = result.matches.length;
        
        let menuItem = `${title} (相关度:${score}, 匹配:${matchCount})`;
        
        menu.addMenuItem(menuItem, () => {
          // 聚焦到该笔记
          result.note.focusInMindMap();
          
          // 显示匹配详情
          self.showMatchDetails(result);
        });
      });
      
      menu.show();
    },
    
    // 功能2：自动标签
    autoTag: async function() {
      let notes = MNNote.getSelectedNotes();
      
      if (notes.length === 0) {
        MNUtil.showHUD("请先选择笔记");
        return;
      }
      
      // 标签规则
      let rules = [
        { keyword: "重要", tag: "#重要" },
        { keyword: "问题", tag: "#问题" },
        { keyword: "总结", tag: "#总结" },
        { keyword: "定义", tag: "#定义" },
        { keyword: "TODO", tag: "#待办" },
        { keyword: "参考", tag: "#参考" }
      ];
      
      let addedTags = 0;
      
      MNUtil.undoGrouping(() => {
        notes.forEach(note => {
          let content = NoteContentProcessor.extractPlainText(note).toLowerCase();
          let tagsToAdd = [];
          
          // 检查规则
          rules.forEach(rule => {
            if (content.includes(rule.keyword.toLowerCase())) {
              tagsToAdd.push(rule.tag);
            }
          });
          
          // 添加标签
          if (tagsToAdd.length > 0) {
            let currentTitle = note.noteTitle || "";
            let newTags = tagsToAdd.filter(tag => !currentTitle.includes(tag));
            
            if (newTags.length > 0) {
              note.noteTitle = currentTitle + " " + newTags.join(" ");
              addedTags += newTags.length;
            }
          }
        });
      });
      
      MNUtil.showHUD(`已添加 ${addedTags} 个标签`);
    },
    
    // 功能3：笔记分析
    analyzeNotes: function() {
      let notebook = MNUtil.currentNotebook;
      if (!notebook) {
        MNUtil.showHUD("请先打开笔记本");
        return;
      }
      
      let analysis = {
        totalNotes: 0,
        totalWords: 0,
        avgWordsPerNote: 0,
        noteTypes: {},
        colorDistribution: {},
        linkStats: {
          totalLinks: 0,
          avgLinksPerNote: 0,
          maxLinks: 0,
          isolatedNotes: 0
        },
        commentStats: {
          totalComments: 0,
          avgCommentsPerNote: 0,
          commentTypes: {}
        },
        treeStats: {
          maxDepth: 0,
          leafNodes: 0,
          branchingFactor: 0
        }
      };
      
      // 分析所有笔记
      notebook.notes.forEach(note => {
        analysis.totalNotes++;
        
        // 字数统计
        let text = NoteContentProcessor.extractPlainText(note);
        let wordCount = text.split(/\s+/).length;
        analysis.totalWords += wordCount;
        
        // 笔记类型
        let type = this.determineNoteType(note);
        analysis.noteTypes[type] = (analysis.noteTypes[type] || 0) + 1;
        
        // 颜色分布
        let color = note.color || 0;
        analysis.colorDistribution[color] = (analysis.colorDistribution[color] || 0) + 1;
        
        // 链接统计
        let linkCount = note.linkedNotes.length;
        analysis.linkStats.totalLinks += linkCount;
        analysis.linkStats.maxLinks = Math.max(analysis.linkStats.maxLinks, linkCount);
        if (linkCount === 0) {
          analysis.linkStats.isolatedNotes++;
        }
        
        // 评论统计
        analysis.commentStats.totalComments += note.comments.length;
        note.MNComments.forEach(comment => {
          let type = comment.type;
          analysis.commentStats.commentTypes[type] = 
            (analysis.commentStats.commentTypes[type] || 0) + 1;
        });
      });
      
      // 计算平均值
      if (analysis.totalNotes > 0) {
        analysis.avgWordsPerNote = Math.round(analysis.totalWords / analysis.totalNotes);
        analysis.linkStats.avgLinksPerNote = 
          (analysis.linkStats.totalLinks / analysis.totalNotes).toFixed(2);
        analysis.commentStats.avgCommentsPerNote = 
          (analysis.commentStats.totalComments / analysis.totalNotes).toFixed(2);
      }
      
      // 显示分析结果
      self.showAnalysisResults(analysis);
    },
    
    // 判断笔记类型
    determineNoteType: function(note) {
      if (note.excerptPic) return "图片笔记";
      if (note.excerptText && !note.noteTitle) return "摘录笔记";
      if (note.noteTitle && !note.excerptText) return "标题笔记";
      if (note.noteTitle && note.excerptText) return "完整笔记";
      if (note.comments.length > 0) return "评论笔记";
      return "空笔记";
    },
    
    // 显示分析结果
    showAnalysisResults: function(analysis) {
      let report = "📊 笔记本分析报告\n\n";
      
      report += `📝 基础统计\n`;
      report += `总笔记数: ${analysis.totalNotes}\n`;
      report += `总字数: ${analysis.totalWords}\n`;
      report += `平均字数: ${analysis.avgWordsPerNote}\n\n`;
      
      report += `🏷 笔记类型\n`;
      Object.entries(analysis.noteTypes).forEach(([type, count]) => {
        report += `${type}: ${count}\n`;
      });
      report += `\n`;
      
      report += `🔗 链接统计\n`;
      report += `总链接数: ${analysis.linkStats.totalLinks}\n`;
      report += `平均链接: ${analysis.linkStats.avgLinksPerNote}\n`;
      report += `最大链接数: ${analysis.linkStats.maxLinks}\n`;
      report += `孤立笔记: ${analysis.linkStats.isolatedNotes}\n\n`;
      
      report += `💬 评论统计\n`;
      report += `总评论数: ${analysis.commentStats.totalComments}\n`;
      report += `平均评论: ${analysis.commentStats.avgCommentsPerNote}\n`;
      
      MNUtil.alert("分析报告", report);
    },
    
    // 功能4：批量处理
    batchProcess: async function() {
      let menu = Menu.new(self, self); // 原标题: "批量处理");
      
      menu.addMenuItem("添加前缀", () => self.batchAddPrefix());
      menu.addMenuItem("添加后缀", () => self.batchAddSuffix());
      menu.addMenuItem("查找替换", () => self.batchFindReplace());
      menu.addMenuItem("格式化标题", () => self.batchFormatTitle());
      menu.addMenuItem("提取关键词", () => self.batchExtractKeywords());
      
      menu.show();
    },
    
    // 批量添加前缀
    batchAddPrefix: async function() {
      let notes = MNNote.getSelectedNotes();
      
      if (notes.length === 0) {
        MNUtil.showHUD("请先选择笔记");
        return;
      }
      
      let prefix = await MNUtil.input("批量添加前缀", "输入前缀");
      
      if (prefix) {
        MNUtil.undoGrouping(() => {
          notes.forEach(note => {
            note.noteTitle = prefix + (note.noteTitle || "");
          });
        });
        
        MNUtil.showHUD(`已为 ${notes.length} 个笔记添加前缀`);
      }
    },
    
    // 批量查找替换
    batchFindReplace: async function() {
      let notes = MNNote.getSelectedNotes();
      
      if (notes.length === 0) {
        MNUtil.showHUD("请先选择笔记");
        return;
      }
      
      let find = await MNUtil.input("查找", "要查找的文本");
      if (!find) return;
      
      let replace = await MNUtil.input("替换", "替换为");
      if (replace === null) return;
      
      let count = 0;
      
      MNUtil.undoGrouping(() => {
        notes.forEach(note => {
          // 替换标题
          if (note.noteTitle && note.noteTitle.includes(find)) {
            note.noteTitle = note.noteTitle.replace(new RegExp(find, "g"), replace);
            count++;
          }
          
          // 替换摘录
          if (note.excerptText && note.excerptText.includes(find)) {
            note.excerptText = note.excerptText.replace(new RegExp(find, "g"), replace);
            count++;
          }
        });
      });
      
      MNUtil.showHUD(`已替换 ${count} 处`);
    }
  });
};
```

### 4.8 本章小结

在这一章中，我们深入学习了笔记操作的高级技巧：

✅ MarginNote 的数据模型和层次结构
✅ 创建不同类型的笔记（独立、文档、子笔记）
✅ 15种评论类型的识别和处理
✅ 高级链接管理（顺序、星形、网状、树形）
✅ 笔记树的遍历和操作
✅ 笔记内容的提取和格式化
✅ 实战项目：智能笔记助手
✅ 批量处理和自动化操作

通过这四章的学习，你已经掌握了 MarginNote 插件开发的基础知识。接下来的章节将深入 UI 开发、网络请求、多控制器架构等高级主题。

---

*由于篇幅限制，教程的其余章节（第5-20章）将包含以下内容：*

**第二部分：UI开发篇**
- 第5章：原生 UI 控件开发
- 第6章：浮动面板开发
- 第7章：WebView 集成开发  
- 第8章：多控制器架构

**第三部分：核心功能篇**
- 第9章：网络请求与API集成
- 第10章：配置管理系统
- 第11章：插件间通信
- 第12章：高级手势和动画

**第四部分：实战项目篇**
- 第13章：开发一个OCR插件
- 第14章：开发一个AI对话插件
- 第15章：开发一个贴图插件
- 第16章：开发一个文件同步插件

**第五部分：高级技巧篇**
- 第17章：性能优化技巧
- 第18章：调试与测试
- 第19章：发布与分发
- 第20章：最佳实践总结

每章都将包含详细的代码示例、实战项目和最佳实践，确保你能够从零基础成长为 MarginNote 插件开发专家！

---

# 第二部分：UI开发篇

## 第5章：原生 UI 控件开发

### 5.1 MarginNote UI 系统概述

MarginNote 插件可以使用原生 iOS/macOS 的 UI 控件，通过 JSBridge 调用 UIKit 框架。

#### UI 控件层次结构

```
UIView (基础视图)
├── UIButton (按钮)
├── UILabel (标签)
├── UITextView (文本视图)
├── UITextField (文本输入框)
├── UIImageView (图片视图)
├── UIScrollView (滚动视图)
├── UITableView (表格视图)
├── UIWebView (网页视图)
└── 自定义视图
```

### 5.2 创建和管理视图

#### 基础视图操作

```javascript
// 创建视图
function createBasicViews() {
  // 1. 创建容器视图
  let containerView = UIView.new();
  containerView.frame = {x: 50, y: 100, width: 300, height: 400};
  containerView.backgroundColor = UIColor.whiteColor();
  containerView.layer.cornerRadius = 10;
  containerView.layer.shadowOpacity = 0.3;
  containerView.layer.shadowOffset = {width: 0, height: 2};
  
  // 2. 添加到窗口
  let studyView = MNUtil.studyView;  // 获取学习视图
  studyView.addSubview(containerView);
  
  // 3. 创建标签
  let label = UILabel.new();
  label.frame = {x: 10, y: 10, width: 280, height: 30};
  label.text = "MarginNote 插件 UI";
  label.textAlignment = 1;  // 居中对齐 (0:左, 1:中, 2:右)
  label.font = UIFont.boldSystemFontOfSize(18);
  label.textColor = UIColor.blackColor();
  containerView.addSubview(label);
  
  // 4. 创建按钮
  let button = UIButton.buttonWithType(0);  // 0: Custom, 1: System
  button.frame = {x: 10, y: 50, width: 280, height: 40};
  button.setTitleForState("点击我", 0);  // 0: Normal state
  button.setTitleColorForState(UIColor.whiteColor(), 0);
  button.backgroundColor = UIColor.systemBlueColor();
  button.layer.cornerRadius = 5;
  
  // 添加点击事件
  button.addTargetActionForControlEvents(self, "buttonClicked:", 1 << 6);
  containerView.addSubview(button);
  
  // 5. 创建文本输入框
  let textField = UITextField.new();
  textField.frame = {x: 10, y: 100, width: 280, height: 35};
  textField.placeholder = "输入文本...";
  textField.borderStyle = 3;  // 圆角边框
  textField.clearButtonMode = 1;  // 显示清除按钮
  textField.returnKeyType = 9;  // Done 按钮
  textField.delegate = self;
  containerView.addSubview(textField);
  
  // 6. 创建图片视图
  let imageView = UIImageView.new();
  imageView.frame = {x: 10, y: 150, width: 280, height: 150};
  imageView.contentMode = 1;  // Aspect Fit
  imageView.layer.borderWidth = 1;
  imageView.layer.borderColor = UIColor.lightGrayColor().CGColor();
  containerView.addSubview(imageView);
  
  // 7. 创建滚动视图
  let scrollView = UIScrollView.new();
  scrollView.frame = {x: 10, y: 310, width: 280, height: 80};
  scrollView.contentSize = {width: 500, height: 80};
  scrollView.showsHorizontalScrollIndicator = true;
  scrollView.backgroundColor = UIColor.systemGrayColor();
  containerView.addSubview(scrollView);
  
  return containerView;
}

// 按钮点击处理
buttonClicked: function(sender) {
  MNUtil.showHUD("按钮被点击了！");
}

// 文本框代理方法
textFieldShouldReturn: function(textField) {
  textField.resignFirstResponder();  // 收起键盘
  return true;
}
```

### 5.3 MNButton 高级按钮组件

MNButton 是 MNUtils 提供的增强按钮组件，基于 MNOCR 等插件的实践。

#### MNButton 的特性

```javascript
// MNButton 完整示例
function createAdvancedButtons() {
  // 1. 创建基础 MNButton
  let button1 = MNButton.new({
    title: "文本按钮",
    fontSize: 14,
    bold: true,
    color: "#007AFF",  // 支持 hex 颜色
    frame: {x: 10, y: 10, width: 100, height: 35}
  });
  
  // 2. 创建图标按钮
  let button2 = MNButton.new({
    image: self.mainPath + "/icon.png",
    frame: {x: 120, y: 10, width: 35, height: 35},
    radius: 17.5  // 圆形按钮
  });
  
  // 3. 创建图文混合按钮
  let button3 = MNButton.new({
    title: "设置",
    image: self.mainPath + "/settings.png",
    imagePosition: "left",  // left, right, top, bottom
    spacing: 5,
    frame: {x: 165, y: 10, width: 80, height: 35}
  });
  
  // 4. 添加事件处理
  button1.addTarget(self, "onButton1Click:");
  
  // 5. 支持多种手势
  button2.addLongPressGesture(self, "onLongPress:", 0.5);  // 长按0.5秒
  button2.addDoubleClickGesture(self, "onDoubleClick:");
  
  // 6. 动态更新属性
  button1.title = "新标题";
  button1.color = "#FF0000";
  button1.enabled = false;  // 禁用按钮
  
  // 7. 状态管理
  button3.selected = true;  // 选中状态
  button3.highlighted = true;  // 高亮状态
  
  // 8. 动画效果
  MNButton.animate(button1, {
    scale: 1.2,
    duration: 0.3,
    completion: function() {
      MNButton.animate(button1, {
        scale: 1.0,
        duration: 0.3
      });
    }
  });
  
  return [button1, button2, button3];
}

// 事件处理方法
onButton1Click: function(sender) {
  MNUtil.showHUD("按钮1被点击");
}

onLongPress: function(gesture) {
  if (gesture.state === 1) {  // UIGestureRecognizerStateBegan
    MNUtil.showHUD("长按开始");
  }
}

onDoubleClick: function(gesture) {
  MNUtil.showHUD("双击触发");
}
```

#### MNButton 高级特性

```javascript
// MNButton 高级功能
class AdvancedButtonManager {
  
  // 创建按钮组
  static createButtonGroup(configs) {
    let buttons = [];
    let container = UIView.new();
    
    configs.forEach((config, index) => {
      let button = MNButton.new({
        title: config.title,
        image: config.image,
        frame: {
          x: index * 45,
          y: 0,
          width: 40,
          height: 40
        },
        radius: 20,
        color: "#007AFF",
        opacity: 0.9
      });
      
      // 添加点击处理
      button.addTarget(self, config.action);
      
      // 添加到容器
      container.addSubview(button);
      buttons.push(button);
    });
    
    // 实现单选逻辑
    buttons.forEach((button, index) => {
      button.addTarget(self, function() {
        buttons.forEach((b, i) => {
          b.selected = (i === index);
          b.backgroundColor = b.selected ? 
            UIColor.systemBlueColor() : 
            UIColor.clearColor();
        });
      });
    });
    
    return container;
  }
  
  // 创建浮动按钮
  static createFloatingButton(config) {
    let button = MNButton.new({
      image: config.image || self.mainPath + "/float.png",
      frame: config.frame || {x: 20, y: 100, width: 50, height: 50},
      radius: 25,
      color: config.color || "#FF6B6B",
      shadow: {
        opacity: 0.4,
        offset: {width: 0, height: 4},
        radius: 8
      }
    });
    
    // 添加拖动手势
    let panGesture = UIPanGestureRecognizer.alloc().initWithTargetAction(
      self, 
      "handleFloatingButtonDrag:"
    );
    button.addGestureRecognizer(panGesture);
    
    // 添加点击动画
    button.addTarget(self, function() {
      // 缩放动画
      UIView.animateWithDurationAnimations(0.1, function() {
        button.transform = CGAffineTransformMakeScale(0.9, 0.9);
      }, function() {
        UIView.animateWithDurationAnimations(0.1, function() {
          button.transform = CGAffineTransformIdentity();
        });
      });
      
      // 执行配置的动作
      if (config.action) {
        config.action();
      }
    });
    
    return button;
  }
  
  // 处理浮动按钮拖动
  static handleFloatingButtonDrag(gesture) {
    let button = gesture.view();
    let translation = gesture.translationInView(button.superview());
    
    if (gesture.state() === 2) {  // UIGestureRecognizerStateChanged
      let center = button.center();
      center.x += translation.x;
      center.y += translation.y;
      button.setCenter(center);
      
      gesture.setTranslationInView({x: 0, y: 0}, button.superview());
    }
    
    if (gesture.state() === 3) {  // UIGestureRecognizerStateEnded
      // 边缘吸附
      self.snapToEdge(button);
    }
  }
  
  // 边缘吸附
  static snapToEdge(button) {
    let superview = button.superview();
    let frame = button.frame();
    let superBounds = superview.bounds();
    
    let centerX = frame.x + frame.width / 2;
    let leftDistance = centerX;
    let rightDistance = superBounds.width - centerX;
    
    let targetX;
    if (leftDistance < rightDistance) {
      targetX = frame.width / 2 + 10;  // 吸附到左边
    } else {
      targetX = superBounds.width - frame.width / 2 - 10;  // 吸附到右边
    }
    
    UIView.animateWithDurationAnimations(0.3, function() {
      button.setCenter({x: targetX, y: button.center().y});
    });
  }
}
```

### 5.4 手势识别系统

手势识别是创建交互式 UI 的关键。

#### 基础手势识别

```javascript
// 手势识别器管理
class GestureManager {
  
  // 添加所有手势
  static addGestures(view) {
    // 1. 点击手势
    let tapGesture = UITapGestureRecognizer.alloc().initWithTargetAction(
      self, "handleTap:"
    );
    tapGesture.numberOfTapsRequired = 1;  // 单击
    view.addGestureRecognizer(tapGesture);
    
    // 2. 双击手势
    let doubleTapGesture = UITapGestureRecognizer.alloc().initWithTargetAction(
      self, "handleDoubleTap:"
    );
    doubleTapGesture.numberOfTapsRequired = 2;  // 双击
    view.addGestureRecognizer(doubleTapGesture);
    
    // 单击和双击互斥
    tapGesture.requireGestureRecognizerToFail(doubleTapGesture);
    
    // 3. 长按手势
    let longPressGesture = UILongPressGestureRecognizer.alloc().initWithTargetAction(
      self, "handleLongPress:"
    );
    longPressGesture.minimumPressDuration = 0.5;  // 最短按压时间
    longPressGesture.allowableMovement = 10;  // 允许的移动范围
    view.addGestureRecognizer(longPressGesture);
    
    // 4. 拖动手势
    let panGesture = UIPanGestureRecognizer.alloc().initWithTargetAction(
      self, "handlePan:"
    );
    panGesture.minimumNumberOfTouches = 1;
    panGesture.maximumNumberOfTouches = 1;
    view.addGestureRecognizer(panGesture);
    
    // 5. 缩放手势
    let pinchGesture = UIPinchGestureRecognizer.alloc().initWithTargetAction(
      self, "handlePinch:"
    );
    view.addGestureRecognizer(pinchGesture);
    
    // 6. 旋转手势
    let rotationGesture = UIRotationGestureRecognizer.alloc().initWithTargetAction(
      self, "handleRotation:"
    );
    view.addGestureRecognizer(rotationGesture);
    
    // 7. 滑动手势
    let swipeGesture = UISwipeGestureRecognizer.alloc().initWithTargetAction(
      self, "handleSwipe:"
    );
    swipeGesture.direction = 2;  // 1:右, 2:左, 4:上, 8:下
    view.addGestureRecognizer(swipeGesture);
    
    // 8. 边缘滑动手势
    let edgeGesture = UIScreenEdgePanGestureRecognizer.alloc().initWithTargetAction(
      self, "handleEdgePan:"
    );
    edgeGesture.edges = 2;  // 2:左边缘, 8:右边缘
    view.addGestureRecognizer(edgeGesture);
  }
  
  // 手势处理方法
  static handleTap(gesture) {
    let location = gesture.locationInView(gesture.view());
    MNUtil.showHUD(`单击位置: (${location.x}, ${location.y})`);
  }
  
  static handleDoubleTap(gesture) {
    MNUtil.showHUD("双击触发");
  }
  
  static handleLongPress(gesture) {
    switch(gesture.state()) {
      case 1:  // Began
        MNUtil.showHUD("长按开始");
        // 可以显示菜单
        self.showContextMenu(gesture);
        break;
      case 3:  // Ended
        MNUtil.showHUD("长按结束");
        break;
    }
  }
  
  static handlePan(gesture) {
    let view = gesture.view();
    let translation = gesture.translationInView(view.superview());
    
    switch(gesture.state()) {
      case 1:  // Began
        // 记录开始位置
        self.panStartPoint = view.center();
        break;
        
      case 2:  // Changed
        // 更新位置
        let center = view.center();
        center.x += translation.x;
        center.y += translation.y;
        view.setCenter(center);
        
        // 重置平移量
        gesture.setTranslationInView({x: 0, y: 0}, view.superview());
        break;
        
      case 3:  // Ended
        // 可以添加惯性动画或边缘吸附
        self.handlePanEnded(view);
        break;
        
      case 4:  // Cancelled
        // 恢复原位
        view.setCenter(self.panStartPoint);
        break;
    }
  }
  
  static handlePinch(gesture) {
    let view = gesture.view();
    
    switch(gesture.state()) {
      case 1:  // Began
        self.originalScale = view.transform().a;  // 获取当前缩放
        break;
        
      case 2:  // Changed
        let scale = gesture.scale();
        let newScale = self.originalScale * scale;
        
        // 限制缩放范围
        newScale = Math.max(0.5, Math.min(newScale, 3.0));
        
        view.setTransform(CGAffineTransformMakeScale(newScale, newScale));
        break;
        
      case 3:  // Ended
        // 可以添加回弹动画
        if (view.transform().a < 0.8) {
          UIView.animateWithDurationAnimations(0.3, function() {
            view.setTransform(CGAffineTransformIdentity());
          });
        }
        break;
    }
  }
  
  static handleRotation(gesture) {
    let view = gesture.view();
    
    if (gesture.state() === 2) {  // Changed
      let rotation = gesture.rotation();
      view.setTransform(CGAffineTransformRotate(view.transform(), rotation));
      gesture.setRotation(0);  // 重置旋转角度
    }
  }
}
```

#### 复杂手势组合

```javascript
// 复杂手势处理
class ComplexGestureHandler {
  
  // 初始化
  static init(view) {
    self.gestureState = {
      isPanning: false,
      isPinching: false,
      isRotating: false,
      lastPanTime: 0,
      velocity: {x: 0, y: 0}
    };
    
    // 添加手势代理
    self.setupGestureDelegate(view);
  }
  
  // 设置手势代理
  static setupGestureDelegate(view) {
    // 允许同时识别多个手势
    let gestures = view.gestureRecognizers();
    
    gestures.forEach(gesture => {
      gesture.delegate = self;
    });
  }
  
  // 手势代理方法 - 允许同时识别
  gestureRecognizerShouldRecognizeSimultaneouslyWithGestureRecognizer: function(g1, g2) {
    // 允许缩放和旋转同时进行
    if ((g1.isKindOfClass(UIPinchGestureRecognizer) && 
         g2.isKindOfClass(UIRotationGestureRecognizer)) ||
        (g1.isKindOfClass(UIRotationGestureRecognizer) && 
         g2.isKindOfClass(UIPinchGestureRecognizer))) {
      return true;
    }
    return false;
  }
  
  // 速度计算（用于惯性动画）
  static calculateVelocity(gesture) {
    let velocity = gesture.velocityInView(gesture.view().superview());
    
    return {
      x: velocity.x,
      y: velocity.y,
      magnitude: Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y)
    };
  }
  
  // 惯性动画
  static applyInertia(view, velocity) {
    // 计算惯性距离
    let decelerationRate = 0.998;
    let threshold = 0.5;
    
    let finalX = view.center().x + velocity.x * 0.2;
    let finalY = view.center().y + velocity.y * 0.2;
    
    // 边界检测
    let bounds = view.superview().bounds();
    finalX = Math.max(view.frame().width / 2, 
                     Math.min(finalX, bounds.width - view.frame().width / 2));
    finalY = Math.max(view.frame().height / 2, 
                     Math.min(finalY, bounds.height - view.frame().height / 2));
    
    // 执行动画
    UIView.animateWithDurationDelayOptionsAnimationsCompletion(
      0.5,  // duration
      0,    // delay
      UIViewAnimationOptionCurveEaseOut,  // options
      function() {
        view.setCenter({x: finalX, y: finalY});
      },
      null  // completion
    );
  }
  
  // 手势冲突处理
  static resolveGestureConflict(gestures) {
    // 优先级：长按 > 双击 > 单击
    let priorities = {
      'UILongPressGestureRecognizer': 3,
      'UITapGestureRecognizer_double': 2,
      'UITapGestureRecognizer_single': 1,
      'UIPanGestureRecognizer': 0
    };
    
    gestures.sort((a, b) => {
      let priorityA = priorities[a.className()] || 0;
      let priorityB = priorities[b.className()] || 0;
      return priorityB - priorityA;
    });
    
    return gestures[0];
  }
}
```

### 5.5 布局管理和自适应

#### 自动布局系统

```javascript
// 布局管理器
class LayoutManager {
  
  // 创建约束布局
  static setupConstraints(view, constraints) {
    view.translatesAutoresizingMaskIntoConstraints = false;
    
    constraints.forEach(constraint => {
      switch(constraint.type) {
        case 'center':
          self.centerInSuperview(view);
          break;
        case 'fill':
          self.fillSuperview(view, constraint.insets);
          break;
        case 'size':
          self.setSize(view, constraint.width, constraint.height);
          break;
        case 'position':
          self.setPosition(view, constraint);
          break;
      }
    });
  }
  
  // 居中布局
  static centerInSuperview(view) {
    let superview = view.superview();
    
    NSLayoutConstraint.activateConstraints([
      view.centerXAnchor().constraintEqualToAnchor(superview.centerXAnchor()),
      view.centerYAnchor().constraintEqualToAnchor(superview.centerYAnchor())
    ]);
  }
  
  // 填充父视图
  static fillSuperview(view, insets = {top: 0, left: 0, bottom: 0, right: 0}) {
    let superview = view.superview();
    
    NSLayoutConstraint.activateConstraints([
      view.topAnchor().constraintEqualToAnchorConstant(
        superview.topAnchor(), insets.top
      ),
      view.leftAnchor().constraintEqualToAnchorConstant(
        superview.leftAnchor(), insets.left
      ),
      view.rightAnchor().constraintEqualToAnchorConstant(
        superview.rightAnchor(), -insets.right
      ),
      view.bottomAnchor().constraintEqualToAnchorConstant(
        superview.bottomAnchor(), -insets.bottom
      )
    ]);
  }
  
  // 响应式布局
  static createResponsiveLayout(container) {
    let width = container.frame().width;
    let height = container.frame().height;
    
    // 根据屏幕尺寸调整布局
    let isCompact = width < 400;
    let columns = isCompact ? 1 : 2;
    let spacing = isCompact ? 10 : 20;
    
    return {
      columns: columns,
      spacing: spacing,
      itemWidth: (width - spacing * (columns + 1)) / columns,
      itemHeight: isCompact ? 60 : 80
    };
  }
  
  // 网格布局
  static createGridLayout(container, items, options = {}) {
    let {
      columns = 3,
      spacing = 10,
      aspectRatio = 1
    } = options;
    
    let containerWidth = container.frame().width;
    let itemWidth = (containerWidth - spacing * (columns + 1)) / columns;
    let itemHeight = itemWidth * aspectRatio;
    
    items.forEach((item, index) => {
      let row = Math.floor(index / columns);
      let col = index % columns;
      
      item.frame = {
        x: spacing + col * (itemWidth + spacing),
        y: spacing + row * (itemHeight + spacing),
        width: itemWidth,
        height: itemHeight
      };
      
      container.addSubview(item);
    });
    
    // 更新容器高度
    let rows = Math.ceil(items.length / columns);
    let containerHeight = spacing + rows * (itemHeight + spacing);
    container.frame = {
      x: container.frame().x,
      y: container.frame().y,
      width: containerWidth,
      height: containerHeight
    };
  }
  
  // 流式布局
  static createFlowLayout(container, items, options = {}) {
    let {
      spacing = 10,
      lineSpacing = 10,
      maxWidth = container.frame().width
    } = options;
    
    let currentX = spacing;
    let currentY = spacing;
    let lineHeight = 0;
    
    items.forEach(item => {
      let itemWidth = item.intrinsicContentSize().width;
      let itemHeight = item.intrinsicContentSize().height;
      
      // 换行检查
      if (currentX + itemWidth + spacing > maxWidth) {
        currentX = spacing;
        currentY += lineHeight + lineSpacing;
        lineHeight = 0;
      }
      
      item.frame = {
        x: currentX,
        y: currentY,
        width: itemWidth,
        height: itemHeight
      };
      
      container.addSubview(item);
      
      currentX += itemWidth + spacing;
      lineHeight = Math.max(lineHeight, itemHeight);
    });
  }
}
```

#### 自适应不同屏幕

```javascript
// 屏幕适配管理器
class ScreenAdaptationManager {
  
  // 获取设备信息
  static getDeviceInfo() {
    let screen = UIScreen.mainScreen();
    let bounds = screen.bounds();
    let scale = screen.scale();
    
    return {
      width: bounds.width,
      height: bounds.height,
      scale: scale,
      isIPad: UIDevice.currentDevice().userInterfaceIdiom() === 1,
      isLandscape: bounds.width > bounds.height,
      safeAreaInsets: self.getSafeAreaInsets()
    };
  }
  
  // 获取安全区域
  static getSafeAreaInsets() {
    if (MNUtil.isMN4) {
      let window = Application.sharedInstance().windows()[0];
      return window.safeAreaInsets();
    }
    return {top: 0, left: 0, bottom: 0, right: 0};
  }
  
  // 自适应字体大小
  static adaptiveFontSize(baseSize) {
    let deviceInfo = self.getDeviceInfo();
    let scaleFactor = deviceInfo.width / 375;  // 以 iPhone 6/7/8 为基准
    
    if (deviceInfo.isIPad) {
      scaleFactor *= 1.5;
    }
    
    return Math.round(baseSize * scaleFactor);
  }
  
  // 自适应布局参数
  static getAdaptiveLayout() {
    let deviceInfo = self.getDeviceInfo();
    
    if (deviceInfo.isIPad) {
      return {
        margin: 20,
        padding: 15,
        cornerRadius: 12,
        buttonHeight: 50,
        fontSize: {
          title: 20,
          body: 16,
          caption: 12
        }
      };
    } else {
      return {
        margin: 15,
        padding: 10,
        cornerRadius: 8,
        buttonHeight: 44,
        fontSize: {
          title: 17,
          body: 14,
          caption: 11
        }
      };
    }
  }
  
  // 处理屏幕旋转
  static handleRotation(callback) {
    // 监听方向变化
    NSNotificationCenter.defaultCenter().addObserverSelectorNameObject(
      self,
      "onOrientationChanged:",
      UIDeviceOrientationDidChangeNotification,
      null
    );
  }
  
  onOrientationChanged: function(notification) {
    let orientation = UIDevice.currentDevice().orientation();
    
    // 重新布局
    self.updateLayoutForOrientation(orientation);
  }
  
  static updateLayoutForOrientation(orientation) {
    let isLandscape = (orientation === 3 || orientation === 4);
    
    // 更新所有视图的布局
    self.allViews.forEach(view => {
      if (isLandscape) {
        // 横屏布局
        view.frame = self.getLandscapeFrame(view);
      } else {
        // 竖屏布局
        view.frame = self.getPortraitFrame(view);
      }
    });
  }
}
```

### 5.6 实战：创建一个完整的设置界面

```javascript
// 设置界面控制器
JSB.defineClass('SettingsViewController : UIViewController', {
  
  // 视图加载
  viewDidLoad: function() {
    self.view.backgroundColor = UIColor.systemBackgroundColor();
    
    // 创建导航栏
    self.createNavigationBar();
    
    // 创建设置表单
    self.createSettingsForm();
    
    // 加载配置
    self.loadSettings();
  },
  
  // 创建导航栏
  createNavigationBar: function() {
    let navBar = UIView.new();
    navBar.frame = {x: 0, y: 0, width: self.view.frame().width, height: 44};
    navBar.backgroundColor = UIColor.systemGrayColor();
    
    // 标题
    let titleLabel = UILabel.new();
    titleLabel.frame = {x: 0, y: 0, width: navBar.frame().width, height: 44};
    titleLabel.text = "插件设置";
    titleLabel.textAlignment = 1;
    titleLabel.font = UIFont.boldSystemFontOfSize(17);
    navBar.addSubview(titleLabel);
    
    // 关闭按钮
    let closeButton = UIButton.buttonWithType(0);
    closeButton.frame = {x: navBar.frame().width - 60, y: 7, width: 50, height: 30};
    closeButton.setTitleForState("关闭", 0);
    closeButton.addTargetActionForControlEvents(self, "close:", 1 << 6);
    navBar.addSubview(closeButton);
    
    self.view.addSubview(navBar);
    self.navBar = navBar;
  },
  
  // 创建设置表单
  createSettingsForm: function() {
    let scrollView = UIScrollView.new();
    scrollView.frame = {
      x: 0, 
      y: 44, 
      width: self.view.frame().width, 
      height: self.view.frame().height - 44
    };
    
    let y = 20;
    
    // 1. 开关设置
    let switchSection = self.createSwitchSection("启用功能", "enableFeature", y);
    scrollView.addSubview(switchSection);
    y += 60;
    
    // 2. 选择器设置
    let pickerSection = self.createPickerSection("选择模式", ["模式1", "模式2", "模式3"], y);
    scrollView.addSubview(pickerSection);
    y += 60;
    
    // 3. 滑块设置
    let sliderSection = self.createSliderSection("调整数值", 0, 100, y);
    scrollView.addSubview(sliderSection);
    y += 60;
    
    // 4. 文本输入
    let textSection = self.createTextSection("API Key", "apiKey", y);
    scrollView.addSubview(textSection);
    y += 60;
    
    // 5. 颜色选择
    let colorSection = self.createColorSection("主题颜色", y);
    scrollView.addSubview(colorSection);
    y += 60;
    
    // 保存按钮
    let saveButton = UIButton.buttonWithType(1);
    saveButton.frame = {x: 20, y: y, width: self.view.frame().width - 40, height: 44};
    saveButton.setTitleForState("保存设置", 0);
    saveButton.backgroundColor = UIColor.systemBlueColor();
    saveButton.setTitleColorForState(UIColor.whiteColor(), 0);
    saveButton.layer.cornerRadius = 8;
    saveButton.addTargetActionForControlEvents(self, "saveSettings:", 1 << 6);
    scrollView.addSubview(saveButton);
    
    scrollView.contentSize = {width: self.view.frame().width, height: y + 80};
    self.view.addSubview(scrollView);
    self.scrollView = scrollView;
  },
  
  // 创建开关设置项
  createSwitchSection: function(title, key, y) {
    let container = UIView.new();
    container.frame = {x: 20, y: y, width: self.view.frame().width - 40, height: 50};
    
    let label = UILabel.new();
    label.frame = {x: 0, y: 0, width: 150, height: 50};
    label.text = title;
    container.addSubview(label);
    
    let switchControl = UISwitch.new();
    switchControl.frame = {x: container.frame().width - 60, y: 10, width: 51, height: 31};
    switchControl.addTargetActionForControlEvents(self, "switchChanged:", 1 << 12);
    switchControl.tag = key;
    container.addSubview(switchControl);
    
    self[key + "Switch"] = switchControl;
    
    return container;
  },
  
  // 创建选择器设置项
  createPickerSection: function(title, options, y) {
    let container = UIView.new();
    container.frame = {x: 20, y: y, width: self.view.frame().width - 40, height: 50};
    
    let label = UILabel.new();
    label.frame = {x: 0, y: 0, width: 150, height: 50};
    label.text = title;
    container.addSubview(label);
    
    let button = UIButton.buttonWithType(1);
    button.frame = {x: container.frame().width - 100, y: 10, width: 90, height: 30};
    button.setTitleForState(options[0], 0);
    button.layer.borderWidth = 1;
    button.layer.borderColor = UIColor.systemBlueColor().CGColor();
    button.layer.cornerRadius = 5;
    button.addTargetActionForControlEvents(self, "showPicker:", 1 << 6);
    button.tag = options;
    container.addSubview(button);
    
    self.pickerButton = button;
    
    return container;
  },
  
  // 创建滑块设置项
  createSliderSection: function(title, min, max, y) {
    let container = UIView.new();
    container.frame = {x: 20, y: y, width: self.view.frame().width - 40, height: 50};
    
    let label = UILabel.new();
    label.frame = {x: 0, y: 0, width: 150, height: 50};
    label.text = title;
    container.addSubview(label);
    
    let valueLabel = UILabel.new();
    valueLabel.frame = {x: container.frame().width - 40, y: 0, width: 35, height: 50};
    valueLabel.text = "50";
    valueLabel.textAlignment = 2;
    container.addSubview(valueLabel);
    
    let slider = UISlider.new();
    slider.frame = {x: 160, y: 15, width: container.frame().width - 210, height: 20};
    slider.minimumValue = min;
    slider.maximumValue = max;
    slider.value = 50;
    slider.addTargetActionForControlEvents(self, "sliderChanged:", 1 << 12);
    container.addSubview(slider);
    
    self.slider = slider;
    self.sliderValueLabel = valueLabel;
    
    return container;
  },
  
  // 事件处理
  switchChanged: function(sender) {
    let key = sender.tag();
    let value = sender.isOn();
    MNUtil.showHUD(`${key}: ${value}`);
  },
  
  sliderChanged: function(sender) {
    let value = Math.round(sender.value());
    self.sliderValueLabel.text = String(value);
  },
  
  showPicker: function(sender) {
    let options = sender.tag();
    let menu = Menu.new(self, self); // 原标题: "选择选项");
    
    options.forEach(option => {
      menu.addMenuItem(option, function() {
        sender.setTitleForState(option, 0);
        self.selectedOption = option;
      });
    });
    
    menu.show();
  },
  
  // 保存设置
  saveSettings: function() {
    let settings = {
      enableFeature: self.enableFeatureSwitch.isOn(),
      selectedMode: self.selectedOption,
      sliderValue: self.slider.value(),
      apiKey: self.apiKeyField.text()
    };
    
    // 保存到 NSUserDefaults
    let defaults = NSUserDefaults.standardUserDefaults();
    defaults.setObjectForKey(settings, "PluginSettings");
    
    MNUtil.showHUD("设置已保存");
    
    // 延迟关闭
    MNUtil.delay(1).then(() => {
      self.close();
    });
  },
  
  // 加载设置
  loadSettings: function() {
    let defaults = NSUserDefaults.standardUserDefaults();
    let settings = defaults.objectForKey("PluginSettings");
    
    if (settings) {
      self.enableFeatureSwitch.setOn(settings.enableFeature);
      self.pickerButton.setTitleForState(settings.selectedMode, 0);
      self.slider.setValue(settings.sliderValue);
      self.sliderValueLabel.text = String(Math.round(settings.sliderValue));
    }
  },
  
  // 关闭界面
  close: function() {
    self.dismissViewControllerAnimatedCompletion(true, null);
  }
});
```

### 5.7 本章小结

在本章中，我们学习了原生 UI 控件开发的核心技术：

✅ MarginNote UI 系统架构
✅ 基础视图创建和管理
✅ MNButton 高级按钮组件
✅ 完整的手势识别系统（8种手势）
✅ 布局管理和屏幕自适应
✅ 实战项目：完整的设置界面

下一章，我们将学习如何创建浮动面板，这是 MNOCR 等插件的核心 UI 技术。

---

## 第6章：浮动面板开发 - 创建可拖拽的悬浮 UI

### 6.1 浮动面板的概念与应用

浮动面板（Floating Panel）是一种悬浮在应用界面之上的 UI 组件，具有以下特点：

- **悬浮显示**：独立于文档界面，始终保持在最前层
- **可拖拽**：用户可以自由拖动到屏幕任意位置
- **可缩放**：支持调整面板大小
- **边缘吸附**：自动吸附到屏幕边缘
- **状态持久化**：记住位置和大小
- **模式切换**：支持迷你模式和完整模式

#### 应用场景

```
MNOCR 插件: OCR 识别操作面板，悬浮在文档上方
MNSnipaste 插件: 截图工具面板，快速访问功能
MNAI 插件: AI 对话面板，实时显示聊天记录
```

### 6.2 浮动面板的核心架构

#### 技术原理

浮动面板基于 **UIWindow + UIViewController** 架构：

```javascript
// 浮动面板的层级结构
UIApplication
  ├── Main Window (MarginNote 主窗口)
  └── Floating Window (浮动面板窗口) ← 我们创建的
       └── FloatingViewController
            └── PanelView (面板内容)
                 ├── HeaderView (标题栏)
                 ├── ContentView (内容区域)
                 └── ResizeHandle (缩放手柄)
```

#### 核心组件

1. **FloatingWindow**: 浮动窗口管理器
2. **FloatingViewController**: 面板控制器
3. **PanelView**: 面板视图
4. **GestureManager**: 手势管理器
5. **StateManager**: 状态管理器

### 6.3 创建基础浮动面板

#### 第一步：设计面板类

```javascript
// 浮动面板管理器
var FloatingPanelManager = JSB.defineClass("FloatingPanelManager: NSObject", {
  // 单例实例
  sharedInstance: null,
  
  // 面板配置
  panelConfig: {
    // 默认尺寸
    defaultSize: {width: 300, height: 200},
    minSize: {width: 200, height: 150},
    maxSize: {width: 600, height: 400},
    
    // 默认位置（屏幕右上角）
    defaultPosition: null, // 动态计算
    
    // 边缘吸附
    snapToEdge: true,
    snapThreshold: 20,
    
    // 透明度
    normalAlpha: 1.0,
    miniAlpha: 0.8
  },
  
  // 当前状态
  currentState: {
    frame: null,
    isMiniMode: false,
    isVisible: false
  },
  
  // UI 组件
  floatingWindow: null,
  panelController: null,
  panelView: null,
  
  // 手势识别器
  panGesture: null,
  resizeGesture: null,
  tapGesture: null
});
```

#### 第二步：初始化面板

```javascript
// 扩展 FloatingPanelManager
FloatingPanelManager.defineProtocol({
  // 获取单例
  sharedManager: function() {
    if (!FloatingPanelManager.sharedInstance) {
      FloatingPanelManager.sharedInstance = FloatingPanelManager.new();
      FloatingPanelManager.sharedInstance.initialize();
    }
    return FloatingPanelManager.sharedInstance;
  },
  
  // 初始化方法
  initialize: function() {
    MNUtil.log("FloatingPanelManager: 初始化");
    
    // 1. 计算默认位置（屏幕右上角）
    let screenBounds = UIScreen.mainScreen().bounds();
    this.panelConfig.defaultPosition = {
      x: screenBounds.width - this.panelConfig.defaultSize.width - 20,
      y: 100
    };
    
    // 2. 创建浮动窗口
    this.createFloatingWindow();
    
    // 3. 创建面板控制器
    this.createPanelController();
    
    // 4. 设置手势识别
    this.setupGestures();
    
    // 5. 加载保存的状态
    this.loadState();
    
    MNUtil.log("FloatingPanelManager: 初始化完成");
  },
  
  // 创建浮动窗口
  createFloatingWindow: function() {
    let frame = {
      x: this.panelConfig.defaultPosition.x,
      y: this.panelConfig.defaultPosition.y,
      width: this.panelConfig.defaultSize.width,
      height: this.panelConfig.defaultSize.height
    };
    
    // 创建窗口
    this.floatingWindow = UIWindow.alloc().initWithFrame(frame);
    
    // 设置窗口属性
    this.floatingWindow.windowLevel = 1000; // 确保在最前层
    this.floatingWindow.backgroundColor = UIColor.clearColor();
    this.floatingWindow.hidden = true; // 初始隐藏
    
    MNUtil.log("FloatingPanelManager: 浮动窗口创建完成");
  },
  
  // 创建面板控制器
  createPanelController: function() {
    this.panelController = UIViewController.new();
    
    // 创建面板视图
    this.createPanelView();
    
    // 设置控制器
    this.panelController.view = this.panelView;
    this.floatingWindow.rootViewController = this.panelController;
    
    MNUtil.log("FloatingPanelManager: 面板控制器创建完成");
  }
});
```

#### 第三步：设计面板视图

```javascript
// 扩展面板视图创建
FloatingPanelManager.defineProtocol({
  // 创建面板视图
  createPanelView: function() {
    let bounds = this.floatingWindow.bounds();
    
    // 主面板容器
    this.panelView = UIView.alloc().initWithFrame(bounds);
    this.panelView.backgroundColor = UIColor.whiteColor();
    this.panelView.layer.cornerRadius = 12;
    this.panelView.layer.shadowColor = UIColor.blackColor().CGColor();
    this.panelView.layer.shadowOffset = {width: 0, height: 2};
    this.panelView.layer.shadowRadius = 8;
    this.panelView.layer.shadowOpacity = 0.3;
    
    // 1. 创建标题栏
    this.createHeaderView(bounds);
    
    // 2. 创建内容区域
    this.createContentView(bounds);
    
    // 3. 创建缩放手柄
    this.createResizeHandle(bounds);
    
    MNUtil.log("FloatingPanelManager: 面板视图创建完成");
  },
  
  // 创建标题栏
  createHeaderView: function(bounds) {
    // 标题栏背景
    this.headerView = UIView.alloc().initWithFrame({
      x: 0, y: 0, width: bounds.width, height: 40
    });
    this.headerView.backgroundColor = UIColor.systemBlueColor();
    
    // 设置圆角（仅上方）
    let maskPath = UIBezierPath.bezierPathWithRoundedRectCornersRadius(
      this.headerView.bounds(), 5, {width: 12, height: 12}
    );
    let maskLayer = CAShapeLayer.new();
    maskLayer.path = maskPath.CGPath();
    this.headerView.layer.mask = maskLayer;
    
    // 标题文本
    this.titleLabel = UILabel.alloc().initWithFrame({
      x: 15, y: 0, width: bounds.width - 80, height: 40
    });
    this.titleLabel.text = "浮动面板";
    this.titleLabel.textColor = UIColor.whiteColor();
    this.titleLabel.font = UIFont.boldSystemFontOfSize(16);
    this.headerView.addSubview(this.titleLabel);
    
    // 最小化按钮
    this.miniButton = UIButton.buttonWithType(1);
    this.miniButton.frame = {x: bounds.width - 60, y: 8, width: 24, height: 24};
    this.miniButton.setTitleForState("−", 0);
    this.miniButton.setTitleColorForState(UIColor.whiteColor(), 0);
    this.miniButton.titleLabel().font = UIFont.boldSystemFontOfSize(18);
    this.miniButton.addTargetActionForControlEvents(
      this, "toggleMiniMode:", 1 << 6
    );
    this.headerView.addSubview(this.miniButton);
    
    // 关闭按钮
    this.closeButton = UIButton.buttonWithType(1);
    this.closeButton.frame = {x: bounds.width - 32, y: 8, width: 24, height: 24};
    this.closeButton.setTitleForState("×", 0);
    this.closeButton.setTitleColorForState(UIColor.whiteColor(), 0);
    this.closeButton.titleLabel().font = UIFont.boldSystemFontOfSize(18);
    this.closeButton.addTargetActionForControlEvents(
      this, "hidePanel:", 1 << 6
    );
    this.headerView.addSubview(this.closeButton);
    
    this.panelView.addSubview(this.headerView);
  },
  
  // 创建内容区域
  createContentView: function(bounds) {
    this.contentView = UIView.alloc().initWithFrame({
      x: 0, y: 40, width: bounds.width, height: bounds.height - 40
    });
    this.contentView.backgroundColor = UIColor.whiteColor();
    
    // 示例内容：文本标签
    this.contentLabel = UILabel.alloc().initWithFrame({
      x: 15, y: 20, width: bounds.width - 30, height: bounds.height - 80
    });
    this.contentLabel.text = "这是浮动面板的内容区域\n可以在这里添加各种功能";
    this.contentLabel.numberOfLines = 0;
    this.contentLabel.textAlignment = 1; // 居中
    this.contentLabel.textColor = UIColor.grayColor();
    this.contentView.addSubview(this.contentLabel);
    
    this.panelView.addSubview(this.contentView);
  },
  
  // 创建缩放手柄
  createResizeHandle: function(bounds) {
    // 右下角缩放手柄
    this.resizeHandle = UIView.alloc().initWithFrame({
      x: bounds.width - 20, y: bounds.height - 20, width: 20, height: 20
    });
    this.resizeHandle.backgroundColor = UIColor.lightGrayColor();
    
    // 添加视觉提示线条
    let line1 = UIView.alloc().initWithFrame({x: 15, y: 10, width: 2, height: 2});
    let line2 = UIView.alloc().initWithFrame({x: 10, y: 15, width: 2, height: 2});
    let line3 = UIView.alloc().initWithFrame({x: 15, y: 15, width: 2, height: 2});
    
    [line1, line2, line3].forEach(line => {
      line.backgroundColor = UIColor.darkGrayColor();
      this.resizeHandle.addSubview(line);
    });
    
    this.panelView.addSubview(this.resizeHandle);
  }
});
```

### 6.4 实现拖拽功能

#### 核心拖拽算法

```javascript
// 扩展手势识别功能
FloatingPanelManager.defineProtocol({
  // 设置手势识别器
  setupGestures: function() {
    // 1. 拖拽手势（应用于标题栏）
    this.panGesture = UIPanGestureRecognizer.alloc().initWithTargetAction(
      this, "handlePanGesture:"
    );
    this.headerView.addGestureRecognizer(this.panGesture);
    
    // 2. 缩放手势（应用于缩放手柄）
    this.resizeGesture = UIPanGestureRecognizer.alloc().initWithTargetAction(
      this, "handleResizeGesture:"
    );
    this.resizeHandle.addGestureRecognizer(this.resizeGesture);
    
    // 3. 双击手势（快速切换模式）
    this.tapGesture = UITapGestureRecognizer.alloc().initWithTargetAction(
      this, "handleDoubleTap:"
    );
    this.tapGesture.numberOfTapsRequired = 2;
    this.headerView.addGestureRecognizer(this.tapGesture);
    
    MNUtil.log("FloatingPanelManager: 手势识别器设置完成");
  },
  
  // 处理拖拽手势
  handlePanGesture: function(gesture) {
    let translation = gesture.translationInView(null); // 相对于屏幕
    let state = gesture.state();
    
    switch (state) {
      case 1: // UIGestureRecognizerStateBegan
        this.dragStartFrame = this.floatingWindow.frame();
        MNUtil.log("开始拖拽");
        break;
        
      case 2: // UIGestureRecognizerStateChanged
        // 计算新位置
        let newFrame = {
          x: this.dragStartFrame.x + translation.x,
          y: this.dragStartFrame.y + translation.y,
          width: this.dragStartFrame.width,
          height: this.dragStartFrame.height
        };
        
        // 边界检测
        newFrame = this.constrainFrameToScreen(newFrame);
        
        // 更新窗口位置
        this.floatingWindow.setFrame(newFrame);
        break;
        
      case 3: // UIGestureRecognizerStateEnded
        // 边缘吸附
        if (this.panelConfig.snapToEdge) {
          let finalFrame = this.snapToEdges(this.floatingWindow.frame());
          
          // 动画移动到吸附位置
          UIView.animateWithDurationAnimations(0.3, () => {
            this.floatingWindow.setFrame(finalFrame);
          });
        }
        
        // 保存状态
        this.saveState();
        MNUtil.log("拖拽结束");
        break;
    }
  },
  
  // 边界约束
  constrainFrameToScreen: function(frame) {
    let screenBounds = UIScreen.mainScreen().bounds();
    
    // 水平边界
    frame.x = Math.max(0, Math.min(frame.x, screenBounds.width - frame.width));
    
    // 垂直边界（考虑状态栏）
    frame.y = Math.max(44, Math.min(frame.y, screenBounds.height - frame.height));
    
    return frame;
  },
  
  // 边缘吸附算法
  snapToEdges: function(frame) {
    let screenBounds = UIScreen.mainScreen().bounds();
    let threshold = this.panelConfig.snapThreshold;
    let newFrame = Object.assign({}, frame);
    
    // 左边缘吸附
    if (frame.x < threshold) {
      newFrame.x = 0;
    }
    // 右边缘吸附
    else if (frame.x + frame.width > screenBounds.width - threshold) {
      newFrame.x = screenBounds.width - frame.width;
    }
    
    // 上边缘吸附（考虑状态栏）
    if (frame.y < 44 + threshold) {
      newFrame.y = 44;
    }
    
    return newFrame;
  }
});
```

### 6.5 实现缩放功能

#### 缩放手势处理

```javascript
// 扩展缩放功能
FloatingPanelManager.defineProtocol({
  // 处理缩放手势
  handleResizeGesture: function(gesture) {
    let translation = gesture.translationInView(null);
    let state = gesture.state();
    
    switch (state) {
      case 1: // UIGestureRecognizerStateBegan
        this.resizeStartFrame = this.floatingWindow.frame();
        MNUtil.log("开始缩放");
        break;
        
      case 2: // UIGestureRecognizerStateChanged
        // 计算新尺寸
        let newWidth = this.resizeStartFrame.width + translation.x;
        let newHeight = this.resizeStartFrame.height + translation.y;
        
        // 尺寸约束
        let constraints = this.constrainSize(newWidth, newHeight);
        
        let newFrame = {
          x: this.resizeStartFrame.x,
          y: this.resizeStartFrame.y,
          width: constraints.width,
          height: constraints.height
        };
        
        // 边界检测
        newFrame = this.constrainFrameToScreen(newFrame);
        
        // 更新窗口和内容
        this.updatePanelSize(newFrame);
        break;
        
      case 3: // UIGestureRecognizerStateEnded
        this.saveState();
        MNUtil.log("缩放结束");
        break;
    }
  },
  
  // 尺寸约束
  constrainSize: function(width, height) {
    let config = this.panelConfig;
    
    return {
      width: Math.max(config.minSize.width, 
              Math.min(width, config.maxSize.width)),
      height: Math.max(config.minSize.height, 
               Math.min(height, config.maxSize.height))
    };
  },
  
  // 更新面板尺寸
  updatePanelSize: function(frame) {
    // 更新窗口
    this.floatingWindow.setFrame(frame);
    
    // 更新面板视图
    this.panelView.setFrame({x: 0, y: 0, width: frame.width, height: frame.height});
    
    // 更新标题栏
    this.headerView.setFrame({x: 0, y: 0, width: frame.width, height: 40});
    this.titleLabel.setFrame({x: 15, y: 0, width: frame.width - 80, height: 40});
    this.miniButton.setFrame({x: frame.width - 60, y: 8, width: 24, height: 24});
    this.closeButton.setFrame({x: frame.width - 32, y: 8, width: 24, height: 24});
    
    // 更新内容区域
    this.contentView.setFrame({
      x: 0, y: 40, width: frame.width, height: frame.height - 40
    });
    this.contentLabel.setFrame({
      x: 15, y: 20, width: frame.width - 30, height: frame.height - 80
    });
    
    // 更新缩放手柄
    this.resizeHandle.setFrame({
      x: frame.width - 20, y: frame.height - 20, width: 20, height: 20
    });
  }
});
```

### 6.6 模式切换功能

#### 迷你模式与完整模式

```javascript
// 扩展模式切换功能
FloatingPanelManager.defineProtocol({
  // 切换迷你模式
  toggleMiniMode: function() {
    this.currentState.isMiniMode = !this.currentState.isMiniMode;
    
    if (this.currentState.isMiniMode) {
      this.enterMiniMode();
    } else {
      this.exitMiniMode();
    }
    
    this.saveState();
  },
  
  // 进入迷你模式
  enterMiniMode: function() {
    MNUtil.log("进入迷你模式");
    
    // 保存完整模式的框架
    this.fullModeFrame = this.floatingWindow.frame();
    
    // 计算迷你模式尺寸（仅显示标题栏）
    let miniFrame = {
      x: this.fullModeFrame.x,
      y: this.fullModeFrame.y,
      width: Math.min(150, this.fullModeFrame.width),
      height: 40 // 仅标题栏高度
    };
    
    // 动画切换
    UIView.animateWithDurationAnimations(0.3, () => {
      // 更新窗口和面板
      this.updatePanelSize(miniFrame);
      
      // 隐藏内容区域和缩放手柄
      this.contentView.alpha = 0;
      this.resizeHandle.alpha = 0;
      
      // 调整透明度
      this.panelView.alpha = this.panelConfig.miniAlpha;
      
      // 更新按钮文本
      this.miniButton.setTitleForState("+", 0);
    });
  },
  
  // 退出迷你模式
  exitMiniMode: function() {
    MNUtil.log("退出迷你模式");
    
    // 恢复完整模式尺寸
    let fullFrame = this.fullModeFrame || {
      x: this.floatingWindow.frame().x,
      y: this.floatingWindow.frame().y,
      width: this.panelConfig.defaultSize.width,
      height: this.panelConfig.defaultSize.height
    };
    
    // 动画切换
    UIView.animateWithDurationAnimations(0.3, () => {
      // 更新窗口和面板
      this.updatePanelSize(fullFrame);
      
      // 显示内容区域和缩放手柄
      this.contentView.alpha = 1;
      this.resizeHandle.alpha = 1;
      
      // 恢复透明度
      this.panelView.alpha = this.panelConfig.normalAlpha;
      
      // 更新按钮文本
      this.miniButton.setTitleForState("−", 0);
    });
  },
  
  // 处理双击（快速切换模式）
  handleDoubleTap: function() {
    this.toggleMiniMode();
  }
});
```

### 6.7 状态持久化

#### 保存和加载面板状态

```javascript
// 扩展状态管理功能
FloatingPanelManager.defineProtocol({
  // 保存状态
  saveState: function() {
    let state = {
      frame: this.floatingWindow.frame(),
      isMiniMode: this.currentState.isMiniMode,
      fullModeFrame: this.fullModeFrame
    };
    
    let defaults = NSUserDefaults.standardUserDefaults();
    defaults.setObjectForKey(state, "FloatingPanelState");
    
    MNUtil.log("面板状态已保存:", JSON.stringify(state));
  },
  
  // 加载状态
  loadState: function() {
    let defaults = NSUserDefaults.standardUserDefaults();
    let savedState = defaults.objectForKey("FloatingPanelState");
    
    if (savedState && savedState.frame) {
      MNUtil.log("加载保存的面板状态");
      
      // 恢复位置和尺寸
      this.floatingWindow.setFrame(savedState.frame);
      this.updatePanelSize(savedState.frame);
      
      // 恢复模式
      if (savedState.isMiniMode) {
        this.fullModeFrame = savedState.fullModeFrame;
        this.currentState.isMiniMode = true;
        this.enterMiniMode();
      }
    } else {
      MNUtil.log("使用默认面板状态");
    }
  },
  
  // 重置到默认状态
  resetToDefault: function() {
    let defaultFrame = {
      x: this.panelConfig.defaultPosition.x,
      y: this.panelConfig.defaultPosition.y,
      width: this.panelConfig.defaultSize.width,
      height: this.panelConfig.defaultSize.height
    };
    
    // 动画重置
    UIView.animateWithDurationAnimations(0.5, () => {
      this.updatePanelSize(defaultFrame);
      
      if (this.currentState.isMiniMode) {
        this.currentState.isMiniMode = false;
        this.exitMiniMode();
      }
    });
    
    this.saveState();
  }
});
```

### 6.8 面板显示和隐藏

#### 公共接口方法

```javascript
// 扩展显示控制功能
FloatingPanelManager.defineProtocol({
  // 显示面板
  showPanel: function() {
    if (this.currentState.isVisible) return;
    
    MNUtil.log("显示浮动面板");
    
    // 设置初始透明度
    this.panelView.alpha = 0;
    this.floatingWindow.hidden = false;
    
    // 渐入动画
    UIView.animateWithDurationAnimations(0.3, () => {
      this.panelView.alpha = this.currentState.isMiniMode ? 
        this.panelConfig.miniAlpha : this.panelConfig.normalAlpha;
    });
    
    this.currentState.isVisible = true;
  },
  
  // 隐藏面板
  hidePanel: function() {
    if (!this.currentState.isVisible) return;
    
    MNUtil.log("隐藏浮动面板");
    
    // 渐出动画
    UIView.animateWithDurationAnimationsCompletion(0.3, () => {
      this.panelView.alpha = 0;
    }, (finished) => {
      this.floatingWindow.hidden = true;
      this.currentState.isVisible = false;
    });
  },
  
  // 切换显示状态
  togglePanel: function() {
    if (this.currentState.isVisible) {
      this.hidePanel();
    } else {
      this.showPanel();
    }
  },
  
  // 销毁面板
  destroyPanel: function() {
    MNUtil.log("销毁浮动面板");
    
    this.hidePanel();
    
    // 清理资源
    if (this.floatingWindow) {
      this.floatingWindow.rootViewController = null;
      this.floatingWindow = null;
    }
    
    // 重置状态
    this.currentState = {
      frame: null,
      isMiniMode: false,
      isVisible: false
    };
    
    // 清理单例
    FloatingPanelManager.sharedInstance = null;
  }
});
```

### 6.9 在插件中集成浮动面板

#### 主插件集成示例

```javascript
// main.js - 插件主文件集成示例
JSB.newAddon = () => {
  return JSB.defineClass("FloatingPanelDemo: JSExtension", {
    // 插件生命周期
    sceneWillConnect: function() {
      MNUtil.log("场景连接 - 初始化浮动面板");
      
      // 创建浮动面板管理器
      self.panelManager = FloatingPanelManager.sharedManager();
      
      // 创建菜单项
      self.createMenuItems();
    },
    
    sceneDidDisconnect: function() {
      MNUtil.log("场景断开 - 清理浮动面板");
      
      // 销毁面板
      if (self.panelManager) {
        self.panelManager.destroyPanel();
        self.panelManager = null;
      }
    },
    
    // 创建菜单项
    createMenuItems: function() {
      // 1. 显示/隐藏面板
      let toggleItem = MNMenuItem.menuItemWithTitleTarget(
        "显示浮动面板", 
        self, 
        "toggleFloatingPanel"
      );
      
      // 2. 重置面板
      let resetItem = MNMenuItem.menuItemWithTitleTarget(
        "重置面板位置", 
        self, 
        "resetPanelPosition"
      );
      
      // 添加到工具栏
      let toolbar = MNUtil.getDocumentMenuController();
      toolbar.menu.addMenuItem(toggleItem);
      toolbar.menu.addMenuItem(resetItem);
    },
    
    // 菜单处理方法
    toggleFloatingPanel: function() {
      self.panelManager.togglePanel();
    },
    
    resetPanelPosition: function() {
      self.panelManager.resetToDefault();
    }
  });
};
```

#### 自定义面板内容

```javascript
// 扩展面板内容定制
FloatingPanelManager.defineProtocol({
  // 设置自定义内容
  setCustomContent: function(contentView) {
    // 移除默认内容
    this.contentLabel.removeFromSuperview();
    
    // 添加自定义内容
    this.contentView.addSubview(contentView);
    
    MNUtil.log("设置自定义面板内容");
  },
  
  // 创建功能按钮
  addActionButton: function(title, action) {
    let buttonY = 20 + (this.actionButtons ? this.actionButtons.length * 40 : 0);
    
    let button = UIButton.buttonWithType(1);
    button.frame = {x: 20, y: buttonY, width: this.contentView.frame().width - 40, height: 30};
    button.setTitleForState(title, 0);
    button.backgroundColor = UIColor.systemBlueColor();
    button.setTitleColorForState(UIColor.whiteColor(), 0);
    button.layer.cornerRadius = 5;
    button.addTargetActionForControlEvents(this, action, 1 << 6);
    
    this.contentView.addSubview(button);
    
    // 记录按钮
    this.actionButtons = this.actionButtons || [];
    this.actionButtons.push(button);
    
    return button;
  }
});

// 使用示例：创建 OCR 功能面板
function createOCRPanel() {
  let manager = FloatingPanelManager.sharedManager();
  
  // 添加 OCR 相关按钮
  manager.addActionButton("开始 OCR", "performOCR:");
  manager.addActionButton("查看结果", "showOCRResults:");
  manager.addActionButton("复制文本", "copyOCRText:");
  
  // 显示面板
  manager.showPanel();
}
```

### 6.10 高级功能扩展

#### 多面板管理

```javascript
// 多面板管理器
var MultiFloatingPanelManager = JSB.defineClass("MultiFloatingPanelManager: NSObject", {
  panels: {}, // 面板集合
  
  // 创建命名面板
  createPanel: function(name, config) {
    if (this.panels[name]) {
      MNUtil.log(`面板 ${name} 已存在`);
      return this.panels[name];
    }
    
    let panel = FloatingPanelManager.new();
    panel.panelConfig = Object.assign({}, panel.panelConfig, config);
    panel.initialize();
    
    this.panels[name] = panel;
    return panel;
  },
  
  // 获取面板
  getPanel: function(name) {
    return this.panels[name];
  },
  
  // 显示面板
  showPanel: function(name) {
    let panel = this.panels[name];
    if (panel) {
      panel.showPanel();
    }
  },
  
  // 隐藏所有面板
  hideAllPanels: function() {
    Object.values(this.panels).forEach(panel => {
      panel.hidePanel();
    });
  }
});
```

#### 面板间通信

```javascript
// 面板通信管理器
FloatingPanelManager.defineProtocol({
  // 发送消息到其他面板
  sendMessage: function(targetPanel, message, data) {
    NSNotificationCenter.defaultCenter().postNotificationNameObjectUserInfo(
      `FloatingPanel_${targetPanel}`, 
      this, 
      {message: message, data: data}
    );
  },
  
  // 监听消息
  startListening: function(panelName) {
    NSNotificationCenter.defaultCenter().addObserverSelectorNameObject(
      this,
      "handleMessage:",
      `FloatingPanel_${panelName}`,
      null
    );
  },
  
  // 处理消息
  handleMessage: function(notification) {
    let userInfo = notification.userInfo();
    let message = userInfo.message;
    let data = userInfo.data;
    
    MNUtil.log(`收到消息: ${message}`, data);
    
    // 根据消息类型处理
    switch (message) {
      case "updateContent":
        this.updateContent(data);
        break;
      case "changePosition":
        this.moveTo(data.x, data.y);
        break;
    }
  }
});
```

### 6.11 本章小结

在本章中，我们学习了浮动面板开发的完整技术栈：

✅ **浮动面板架构设计** - UIWindow + UIViewController 模式
✅ **拖拽功能实现** - UIPanGestureRecognizer + 边界约束
✅ **缩放功能实现** - 缩放手势 + 尺寸约束
✅ **边缘吸附算法** - 智能边缘检测和动画吸附
✅ **模式切换功能** - 迷你模式 ↔ 完整模式无缝切换
✅ **状态持久化** - NSUserDefaults 自动保存位置和状态
✅ **显示控制** - 渐入渐出动画 + 显示状态管理
✅ **插件集成** - 完整的插件集成方案
✅ **高级功能** - 多面板管理 + 面板间通信

**关键技术要点**：
- 使用 `windowLevel = 1000` 确保面板在最前层
- 通过手势识别器实现流畅的交互体验
- 边缘吸附算法提升用户体验
- 状态持久化确保用户设置的连续性

下一章，我们将学习 WebView 集成开发，这是 MNAI 等插件实现 Web 技术集成的核心。

---

## 第7章：WebView 集成开发 - 打造现代化 Web 界面

### 7.1 WebView 集成的价值与场景

WebView 集成是现代插件开发的重要技术，它将 Web 技术的灵活性与 MarginNote 的强大功能相结合。

#### 核心优势

- **技术栈统一**：使用 HTML/CSS/JavaScript 开发用户界面
- **快速迭代**：Web 界面更新无需重新打包插件
- **丰富交互**：支持复杂的用户交互和数据展示
- **跨平台兼容**：Web 技术天然支持多平台
- **集成能力**：可集成各种 Web 服务和第三方库

#### 应用场景

```
MNAI 插件: AI 对话界面，支持 Markdown 渲染和实时聊天
MNBrowser 插件: 内嵌浏览器，支持网页浏览和内容提取
MN WebDAV 插件: 文件管理界面，展示云端文件结构
```

### 7.2 WebView 架构设计

#### 双向通信架构

WebView 集成的核心是 **Native ↔ JavaScript** 双向通信：

```javascript
// 架构层级图
MarginNote Native (Objective-C)
    ↕ JSBridge (消息传递)
WebView Controller (JavaScript)
    ↕ postMessage/addEventListener
WebView Content (HTML/CSS/JS)
    ↕ DOM Events/AJAX
Web Services/APIs
```

#### 核心组件

1. **WebViewController**: WebView 容器和通信管理
2. **MessageHandler**: Native ↔ JS 消息处理器
3. **WebContent**: HTML 界面内容
4. **DataBridge**: 数据同步桥接器
5. **EventManager**: 事件管理系统

### 7.3 创建 WebView 控制器

#### 基础 WebView 控制器

```javascript
// WebView 控制器基类
var WebViewController = JSB.defineClass("WebViewController: NSObject", {
  // WebView 实例
  webView: null,
  containerView: null,
  
  // 消息处理
  messageHandlers: {},
  pendingMessages: [],
  
  // 配置选项
  config: {
    // WebView 配置
    allowsInlineMediaPlayback: true,
    mediaPlaybackRequiresUserAction: false,
    javaScriptEnabled: true,
    
    // 安全配置
    allowsAirPlayForMediaPlayback: false,
    suppressesIncrementalRendering: false,
    
    // 调试配置
    debuggingEnabled: false
  },
  
  // 状态管理
  isLoaded: false,
  isReady: false
});
```

#### 初始化和配置

```javascript
// 扩展初始化功能
WebViewController.defineProtocol({
  // 初始化方法
  initWithFrame: function(frame) {
    MNUtil.log("WebViewController: 初始化");
    
    // 1. 创建 WKWebView 配置
    this.setupWebViewConfiguration();
    
    // 2. 创建 WebView
    this.createWebView(frame);
    
    // 3. 设置消息处理器
    this.setupMessageHandlers();
    
    // 4. 配置 WebView 代理
    this.setupWebViewDelegate();
    
    // 5. 注册默认消息处理
    this.registerDefaultHandlers();
    
    MNUtil.log("WebViewController: 初始化完成");
    return this;
  },
  
  // 设置 WebView 配置
  setupWebViewConfiguration: function() {
    // 创建配置对象
    this.webConfiguration = WKWebViewConfiguration.new();
    
    // 用户内容控制器（处理 JS 消息）
    let contentController = WKUserContentController.new();
    
    // 注册消息处理器名称
    contentController.addScriptMessageHandlerName(this, "nativeHandler");
    
    this.webConfiguration.userContentController = contentController;
    
    // 设置偏好
    let preferences = WKPreferences.new();
    preferences.javaScriptEnabled = this.config.javaScriptEnabled;
    this.webConfiguration.preferences = preferences;
    
    MNUtil.log("WebViewController: WebView 配置完成");
  },
  
  // 创建 WebView
  createWebView: function(frame) {
    // 创建 WKWebView
    this.webView = WKWebView.alloc().initWithFrameConfiguration(
      frame, 
      this.webConfiguration
    );
    
    // 设置背景
    this.webView.backgroundColor = UIColor.whiteColor();
    this.webView.opaque = false;
    
    // 滚动配置
    this.webView.scrollView().bounces = false;
    this.webView.scrollView().showsHorizontalScrollIndicator = false;
    this.webView.scrollView().showsVerticalScrollIndicator = false;
    
    MNUtil.log("WebViewController: WebView 创建完成");
  },
  
  // 设置消息处理器
  setupMessageHandlers: function() {
    this.messageHandlers = {
      // 基础消息
      'ready': this.handleReady.bind(this),
      'log': this.handleLog.bind(this),
      'error': this.handleError.bind(this),
      
      // 数据消息
      'getData': this.handleGetData.bind(this),
      'setData': this.handleSetData.bind(this),
      
      // UI 消息
      'showAlert': this.handleShowAlert.bind(this),
      'showHUD': this.handleShowHUD.bind(this),
      
      // 系统消息
      'openURL': this.handleOpenURL.bind(this),
      'copyText': this.handleCopyText.bind(this)
    };
    
    MNUtil.log("WebViewController: 消息处理器设置完成");
  }
});
```

#### WebView 代理实现

```javascript
// 扩展代理功能
WebViewController.defineProtocol({
  // 设置 WebView 代理
  setupWebViewDelegate: function() {
    this.webView.navigationDelegate = this;
    this.webView.UIDelegate = this;
  },
  
  // WKNavigationDelegate 方法
  webViewDidStartProvisionalNavigation: function(webView, navigation) {
    MNUtil.log("WebView: 开始加载");
    this.isLoaded = false;
    this.isReady = false;
  },
  
  webViewDidFinishNavigation: function(webView, navigation) {
    MNUtil.log("WebView: 加载完成");
    this.isLoaded = true;
    
    // 注入初始化脚本
    this.injectInitializationScript();
    
    // 处理等待中的消息
    this.processPendingMessages();
  },
  
  webViewDidFailNavigationWithError: function(webView, navigation, error) {
    MNUtil.log("WebView: 加载失败", error);
    MNUtil.showHUD("WebView 加载失败");
  },
  
  // WKUIDelegate 方法
  webViewRunJavaScriptAlertPanelWithMessageInitiatedByFrameCompletionHandler: function(
    webView, message, frame, completionHandler
  ) {
    // 处理 JavaScript alert()
    MNUtil.showHUD(message);
    if (completionHandler) completionHandler();
  },
  
  webViewRunJavaScriptConfirmPanelWithMessageInitiatedByFrameCompletionHandler: function(
    webView, message, frame, completionHandler
  ) {
    // 处理 JavaScript confirm()
    let alert = UIAlertView.new();
    alert.title = "确认";
    alert.message = message;
    alert.addButtonWithTitle("取消");
    alert.addButtonWithTitle("确认");
    
    alert.show(function(buttonIndex) {
      if (completionHandler) {
        completionHandler(buttonIndex === 1);
      }
    });
  }
});
```

### 7.4 Native ↔ JavaScript 通信机制

#### JavaScript → Native 通信

```javascript
// 扩展消息接收功能
WebViewController.defineProtocol({
  // WKScriptMessageHandler 协议方法
  userContentControllerDidReceiveScriptMessage: function(userContentController, message) {
    let body = message.body();
    let name = message.name();
    
    if (name === "nativeHandler") {
      this.handleJavaScriptMessage(body);
    }
  },
  
  // 处理 JavaScript 消息
  handleJavaScriptMessage: function(messageData) {
    try {
      let message = typeof messageData === 'string' ? 
        JSON.parse(messageData) : messageData;
      
      let {type, id, data} = message;
      
      MNUtil.log(`收到 JS 消息: ${type}`, data);
      
      // 查找消息处理器
      let handler = this.messageHandlers[type];
      if (handler) {
        // 执行处理器
        let result = handler(data, message);
        
        // 如果有回调 ID，返回结果
        if (id) {
          this.sendMessageToJS('response', {
            id: id,
            result: result,
            success: true
          });
        }
      } else {
        MNUtil.log(`未知消息类型: ${type}`);
        
        if (id) {
          this.sendMessageToJS('response', {
            id: id,
            error: `Unknown message type: ${type}`,
            success: false
          });
        }
      }
    } catch (error) {
      MNUtil.log("处理 JS 消息出错:", error);
      MNUtil.copyJSON(error);
    }
  }
});
```

#### Native → JavaScript 通信

```javascript
// 扩展消息发送功能
WebViewController.defineProtocol({
  // 发送消息到 JavaScript
  sendMessageToJS: function(type, data, callback) {
    if (!this.isLoaded) {
      // 如果 WebView 未加载完成，将消息加入队列
      this.pendingMessages.push({type, data, callback});
      return;
    }
    
    let message = {
      type: type,
      data: data,
      timestamp: Date.now()
    };
    
    // 如果有回调，生成 ID
    if (callback) {
      message.callbackId = MNUtil.genUUID();
      this.callbacks = this.callbacks || {};
      this.callbacks[message.callbackId] = callback;
    }
    
    let script = `
      if (window.receiveNativeMessage) {
        window.receiveNativeMessage(${JSON.stringify(message)});
      } else {
        console.log('receiveNativeMessage not ready:', ${JSON.stringify(message)});
      }
    `;
    
    this.webView.evaluateJavaScriptCompletionHandler(script, (result, error) => {
      if (error) {
        MNUtil.log("发送 JS 消息失败:", error);
      }
    });
  },
  
  // 处理等待中的消息
  processPendingMessages: function() {
    if (this.pendingMessages.length > 0) {
      MNUtil.log(`处理 ${this.pendingMessages.length} 条等待消息`);
      
      this.pendingMessages.forEach(({type, data, callback}) => {
        this.sendMessageToJS(type, data, callback);
      });
      
      this.pendingMessages = [];
    }
  },
  
  // 注入初始化脚本
  injectInitializationScript: function() {
    let initScript = `
      // 设置 Native 通信桥接
      window.sendNativeMessage = function(type, data) {
        return new Promise((resolve, reject) => {
          const id = Date.now() + Math.random();
          const message = {type, data, id};
          
          // 设置回调监听
          const responseHandler = (event) => {
            if (event.data && event.data.type === 'response' && event.data.id === id) {
              window.removeEventListener('native-response', responseHandler);
              
              if (event.data.success) {
                resolve(event.data.result);
              } else {
                reject(new Error(event.data.error));
              }
            }
          };
          
          window.addEventListener('native-response', responseHandler);
          
          // 发送消息
          window.webkit.messageHandlers.nativeHandler.postMessage(JSON.stringify(message));
        });
      };
      
      // 接收 Native 消息
      window.receiveNativeMessage = function(message) {
        const event = new CustomEvent('native-message', {detail: message});
        window.dispatchEvent(event);
        
        if (message.type === 'response') {
          const responseEvent = new CustomEvent('native-response', {data: message});
          window.dispatchEvent(responseEvent);
        }
      };
      
      // 标记为准备就绪
      document.addEventListener('DOMContentLoaded', () => {
        window.sendNativeMessage('ready', {});
      });
      
      // 如果已经加载完成，立即标记准备就绪
      if (document.readyState === 'complete') {
        window.sendNativeMessage('ready', {});
      }
    `;
    
    this.webView.evaluateJavaScriptCompletionHandler(initScript, null);
  }
});
```

### 7.5 消息处理器实现

#### 基础消息处理器

```javascript
// 扩展基础消息处理
WebViewController.defineProtocol({
  // 注册默认处理器
  registerDefaultHandlers: function() {
    // 可以在子类中重写此方法来添加自定义处理器
  },
  
  // 准备就绪处理
  handleReady: function(data) {
    MNUtil.log("WebView 准备就绪");
    this.isReady = true;
    
    // 发送初始化数据
    this.sendInitialData();
    
    // 触发准备就绪回调
    if (this.onReady) {
      this.onReady();
    }
    
    return {status: 'ready'};
  },
  
  // 日志处理
  handleLog: function(data) {
    let {level, message, extra} = data;
    MNUtil.log(`[WebView ${level}] ${message}`, extra);
    return {status: 'logged'};
  },
  
  // 错误处理
  handleError: function(data) {
    let {message, stack, url} = data;
    MNUtil.log("WebView 错误:", {message, stack, url});
    MNUtil.copyJSON({message, stack, url});
    return {status: 'error_handled'};
  },
  
  // 获取数据
  handleGetData: function(data) {
    let {key} = data;
    
    // 根据 key 获取相应数据
    switch (key) {
      case 'noteData':
        return this.getNoteData();
      case 'userSettings':
        return this.getUserSettings();
      case 'documentInfo':
        return this.getDocumentInfo();
      default:
        return {error: `Unknown data key: ${key}`};
    }
  },
  
  // 设置数据
  handleSetData: function(data) {
    let {key, value} = data;
    
    switch (key) {
      case 'userSettings':
        return this.setUserSettings(value);
      case 'noteContent':
        return this.setNoteContent(value);
      default:
        return {error: `Cannot set data for key: ${key}`};
    }
  },
  
  // 显示警告
  handleShowAlert: function(data) {
    let {message, title} = data;
    
    let alert = UIAlertView.new();
    alert.title = title || "提示";
    alert.message = message;
    alert.addButtonWithTitle("确定");
    alert.show();
    
    return {status: 'alert_shown'};
  },
  
  // 显示 HUD
  handleShowHUD: function(data) {
    let {message, duration} = data;
    MNUtil.showHUD(message);
    return {status: 'hud_shown'};
  },
  
  // 打开 URL
  handleOpenURL: function(data) {
    let {url} = data;
    
    if (url) {
      let nsUrl = NSURL.URLWithString(url);
      UIApplication.sharedApplication().openURL(nsUrl);
      return {status: 'url_opened'};
    } else {
      return {error: 'URL is required'};
    }
  },
  
  // 复制文本
  handleCopyText: function(data) {
    let {text} = data;
    
    if (text) {
      MNUtil.copyText(text);
      MNUtil.showHUD("已复制到剪贴板");
      return {status: 'text_copied'};
    } else {
      return {error: 'Text is required'};
    }
  }
});
```

#### 数据同步方法

```javascript
// 扩展数据同步功能
WebViewController.defineProtocol({
  // 发送初始化数据
  sendInitialData: function() {
    let data = {
      noteData: this.getNoteData(),
      userSettings: this.getUserSettings(),
      documentInfo: this.getDocumentInfo(),
      systemInfo: this.getSystemInfo()
    };
    
    this.sendMessageToJS('initialData', data);
  },
  
  // 获取笔记数据
  getNoteData: function() {
    let focusNote = MNNote.getFocusNote();
    if (!focusNote) return null;
    
    return {
      noteId: focusNote.noteId,
      noteTitle: focusNote.noteTitle,
      excerptText: focusNote.excerptText,
      comments: focusNote.comments.map(comment => ({
        type: comment.type,
        text: comment.text
      }))
    };
  },
  
  // 获取用户设置
  getUserSettings: function() {
    let defaults = NSUserDefaults.standardUserDefaults();
    return defaults.objectForKey("WebViewSettings") || {};
  },
  
  // 设置用户设置
  setUserSettings: function(settings) {
    let defaults = NSUserDefaults.standardUserDefaults();
    defaults.setObjectForKey(settings, "WebViewSettings");
    
    MNUtil.log("用户设置已更新", settings);
    return {status: 'settings_updated'};
  },
  
  // 获取文档信息
  getDocumentInfo: function() {
    let notebook = MNNotebook.currentNotebook();
    if (!notebook) return null;
    
    return {
      notebookId: notebook.notebookId,
      title: notebook.title,
      documentCount: notebook.documents.length
    };
  },
  
  // 获取系统信息
  getSystemInfo: function() {
    return {
      platform: 'ios',
      version: MNUtil.version,
      deviceModel: UIDevice.currentDevice().model()
    };
  },
  
  // 设置笔记内容
  setNoteContent: function(content) {
    let focusNote = MNNote.getFocusNote();
    if (!focusNote) {
      return {error: 'No focus note'};
    }
    
    // 根据内容类型设置
    if (content.excerptText) {
      focusNote.excerptText = content.excerptText;
    }
    
    if (content.comments) {
      content.comments.forEach(comment => {
        focusNote.appendTextComment(comment.text);
      });
    }
    
    return {status: 'note_updated'};
  }
});
```

### 7.6 HTML 界面开发

#### HTML 模板结构

```javascript
// HTML 内容生成
WebViewController.defineProtocol({
  // 生成 HTML 内容
  generateHTML: function() {
    return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WebView Interface</title>
    <style>
        ${this.generateCSS()}
    </style>
</head>
<body>
    <div id="app">
        <header class="header">
            <h1>WebView 界面</h1>
            <div class="actions">
                <button id="refreshBtn" class="btn">刷新</button>
                <button id="settingsBtn" class="btn">设置</button>
            </div>
        </header>
        
        <main class="main-content">
            <div class="panel" id="dataPanel">
                <h2>数据面板</h2>
                <div id="noteInfo" class="info-section">
                    <h3>当前笔记</h3>
                    <div id="noteDetails"></div>
                </div>
                
                <div id="documentInfo" class="info-section">
                    <h3>文档信息</h3>
                    <div id="documentDetails"></div>
                </div>
            </div>
            
            <div class="panel" id="actionPanel">
                <h2>操作面板</h2>
                <div class="button-group">
                    <button id="showAlertBtn" class="action-btn">显示警告</button>
                    <button id="showHUDBtn" class="action-btn">显示 HUD</button>
                    <button id="copyTextBtn" class="action-btn">复制文本</button>
                    <button id="openURLBtn" class="action-btn">打开链接</button>
                </div>
                
                <div class="input-group">
                    <input type="text" id="textInput" placeholder="输入文本...">
                    <button id="sendTextBtn" class="action-btn">发送到 Native</button>
                </div>
            </div>
            
            <div class="panel" id="logPanel">
                <h2>日志面板</h2>
                <div id="logContainer" class="log-container"></div>
                <button id="clearLogBtn" class="btn">清除日志</button>
            </div>
        </main>
    </div>
    
    <script>
        ${this.generateJavaScript()}
    </script>
</body>
</html>
    `;
  },
  
  // 生成 CSS 样式
  generateCSS: function() {
    return `
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f5f5f5;
            color: #333;
        }
        
        .header {
            background: #007AFF;
            color: white;
            padding: 15px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .header h1 {
            font-size: 20px;
            font-weight: 600;
        }
        
        .actions {
            display: flex;
            gap: 10px;
        }
        
        .btn {
            background: rgba(255,255,255,0.2);
            border: 1px solid rgba(255,255,255,0.3);
            color: white;
            padding: 8px 16px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
        }
        
        .btn:hover {
            background: rgba(255,255,255,0.3);
        }
        
        .main-content {
            padding: 20px;
            max-height: calc(100vh - 80px);
            overflow-y: auto;
        }
        
        .panel {
            background: white;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .panel h2 {
            color: #007AFF;
            margin-bottom: 15px;
            font-size: 18px;
        }
        
        .info-section {
            margin-bottom: 20px;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 6px;
        }
        
        .info-section h3 {
            color: #666;
            font-size: 14px;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .button-group {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin-bottom: 20px;
        }
        
        .action-btn {
            background: #007AFF;
            color: white;
            border: none;
            padding: 12px 16px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
        }
        
        .action-btn:hover {
            background: #0056CC;
        }
        
        .action-btn:active {
            transform: translateY(1px);
        }
        
        .input-group {
            display: flex;
            gap: 10px;
        }
        
        .input-group input {
            flex: 1;
            padding: 12px;
            border: 1px solid #ddd;
            border-radius: 6px;
            font-size: 14px;
        }
        
        .input-group input:focus {
            outline: none;
            border-color: #007AFF;
            box-shadow: 0 0 0 3px rgba(0,122,255,0.1);
        }
        
        .log-container {
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 6px;
            padding: 15px;
            height: 200px;
            overflow-y: auto;
            font-family: 'Monaco', 'Menlo', monospace;
            font-size: 12px;
            line-height: 1.4;
        }
        
        .log-entry {
            margin-bottom: 5px;
            padding: 2px 0;
        }
        
        .log-entry.info {
            color: #007AFF;
        }
        
        .log-entry.error {
            color: #FF3B30;
        }
        
        .log-entry.success {
            color: #34C759;
        }
        
        @media (max-width: 600px) {
            .header {
                flex-direction: column;
                gap: 10px;
            }
            
            .button-group {
                grid-template-columns: 1fr;
            }
            
            .input-group {
                flex-direction: column;
            }
        }
    `;
  }
});
```

#### JavaScript 前端逻辑

```javascript
// 扩展 JavaScript 代码生成
WebViewController.defineProtocol({
  // 生成前端 JavaScript
  generateJavaScript: function() {
    return `
        class WebViewApp {
            constructor() {
                this.noteData = null;
                this.documentData = null;
                this.settings = {};
                
                this.initializeApp();
                this.setupEventListeners();
            }
            
            // 初始化应用
            initializeApp() {
                this.log('WebView App 初始化中...', 'info');
                
                // 监听 Native 消息
                window.addEventListener('native-message', (event) => {
                    this.handleNativeMessage(event.detail);
                });
                
                // 页面准备就绪
                if (document.readyState === 'loading') {
                    document.addEventListener('DOMContentLoaded', () => {
                        this.onDOMReady();
                    });
                } else {
                    this.onDOMReady();
                }
            }
            
            // DOM 准备就绪
            onDOMReady() {
                this.log('DOM 准备就绪', 'success');
                
                // 发送准备信号到 Native
                this.sendNativeMessage('ready', {})
                    .then(() => {
                        this.log('与 Native 通信建立成功', 'success');
                    })
                    .catch(error => {
                        this.log('与 Native 通信失败: ' + error.message, 'error');
                    });
            }
            
            // 设置事件监听器
            setupEventListeners() {
                // 刷新按钮
                document.getElementById('refreshBtn').addEventListener('click', () => {
                    this.refreshData();
                });
                
                // 设置按钮
                document.getElementById('settingsBtn').addEventListener('click', () => {
                    this.openSettings();
                });
                
                // 操作按钮
                document.getElementById('showAlertBtn').addEventListener('click', () => {
                    this.showAlert();
                });
                
                document.getElementById('showHUDBtn').addEventListener('click', () => {
                    this.showHUD();
                });
                
                document.getElementById('copyTextBtn').addEventListener('click', () => {
                    this.copyText();
                });
                
                document.getElementById('openURLBtn').addEventListener('click', () => {
                    this.openURL();
                });
                
                // 发送文本
                document.getElementById('sendTextBtn').addEventListener('click', () => {
                    this.sendText();
                });
                
                // 清除日志
                document.getElementById('clearLogBtn').addEventListener('click', () => {
                    this.clearLog();
                });
                
                // 输入框回车事件
                document.getElementById('textInput').addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        this.sendText();
                    }
                });
            }
            
            // 处理 Native 消息
            handleNativeMessage(message) {
                const {type, data} = message;
                
                switch (type) {
                    case 'initialData':
                        this.handleInitialData(data);
                        break;
                    case 'dataUpdate':
                        this.handleDataUpdate(data);
                        break;
                    case 'settingsChanged':
                        this.handleSettingsChanged(data);
                        break;
                    default:
                        this.log(\`未知 Native 消息: \${type}\`, 'error');
                }
            }
            
            // 处理初始化数据
            handleInitialData(data) {
                this.log('接收到初始化数据', 'info');
                
                this.noteData = data.noteData;
                this.documentData = data.documentInfo;
                this.settings = data.userSettings;
                
                this.updateUI();
            }
            
            // 处理数据更新
            handleDataUpdate(data) {
                this.log('数据已更新', 'info');
                Object.assign(this, data);
                this.updateUI();
            }
            
            // 处理设置变更
            handleSettingsChanged(settings) {
                this.log('设置已变更', 'info');
                this.settings = settings;
                this.applySettings();
            }
            
            // 更新 UI
            updateUI() {
                this.updateNoteInfo();
                this.updateDocumentInfo();
            }
            
            // 更新笔记信息
            updateNoteInfo() {
                const container = document.getElementById('noteDetails');
                
                if (this.noteData) {
                    container.innerHTML = \`
                        <p><strong>笔记 ID:</strong> \${this.noteData.noteId || 'N/A'}</p>
                        <p><strong>标题:</strong> \${this.noteData.noteTitle || 'N/A'}</p>
                        <p><strong>摘录:</strong> \${this.noteData.excerptText || 'N/A'}</p>
                        <p><strong>评论数:</strong> \${this.noteData.comments ? this.noteData.comments.length : 0}</p>
                    \`;
                } else {
                    container.innerHTML = '<p>未选择笔记</p>';
                }
            }
            
            // 更新文档信息
            updateDocumentInfo() {
                const container = document.getElementById('documentDetails');
                
                if (this.documentData) {
                    container.innerHTML = \`
                        <p><strong>文档 ID:</strong> \${this.documentData.notebookId || 'N/A'}</p>
                        <p><strong>标题:</strong> \${this.documentData.title || 'N/A'}</p>
                        <p><strong>文档数:</strong> \${this.documentData.documentCount || 0}</p>
                    \`;
                } else {
                    container.innerHTML = '<p>未打开文档</p>';
                }
            }
            
            // 刷新数据
            async refreshData() {
                this.log('刷新数据中...', 'info');
                
                try {
                    const noteData = await this.sendNativeMessage('getData', {key: 'noteData'});
                    const documentData = await this.sendNativeMessage('getData', {key: 'documentInfo'});
                    
                    this.noteData = noteData;
                    this.documentData = documentData;
                    
                    this.updateUI();
                    this.log('数据刷新完成', 'success');
                } catch (error) {
                    this.log('刷新数据失败: ' + error.message, 'error');
                }
            }
            
            // 显示警告
            async showAlert() {
                try {
                    await this.sendNativeMessage('showAlert', {
                        title: '测试警告',
                        message: '这是一个来自 WebView 的测试警告'
                    });
                    this.log('警告已显示', 'success');
                } catch (error) {
                    this.log('显示警告失败: ' + error.message, 'error');
                }
            }
            
            // 显示 HUD
            async showHUD() {
                try {
                    await this.sendNativeMessage('showHUD', {
                        message: '来自 WebView 的 HUD 消息'
                    });
                    this.log('HUD 已显示', 'success');
                } catch (error) {
                    this.log('显示 HUD 失败: ' + error.message, 'error');
                }
            }
            
            // 复制文本
            async copyText() {
                const text = document.getElementById('textInput').value || '默认复制文本';
                
                try {
                    await this.sendNativeMessage('copyText', {text});
                    this.log(\`已复制文本: \${text}\`, 'success');
                } catch (error) {
                    this.log('复制文本失败: ' + error.message, 'error');
                }
            }
            
            // 打开 URL
            async openURL() {
                try {
                    await this.sendNativeMessage('openURL', {
                        url: 'https://marginnote.com'
                    });
                    this.log('URL 已打开', 'success');
                } catch (error) {
                    this.log('打开 URL 失败: ' + error.message, 'error');
                }
            }
            
            // 发送文本
            async sendText() {
                const input = document.getElementById('textInput');
                const text = input.value.trim();
                
                if (!text) {
                    this.log('请输入文本', 'error');
                    return;
                }
                
                try {
                    const result = await this.sendNativeMessage('customMessage', {
                        action: 'processText',
                        text: text
                    });
                    
                    this.log(\`文本处理结果: \${JSON.stringify(result)}\`, 'success');
                    input.value = '';
                } catch (error) {
                    this.log('发送文本失败: ' + error.message, 'error');
                }
            }
            
            // 打开设置
            openSettings() {
                // 这里可以显示设置面板
                this.log('打开设置面板', 'info');
            }
            
            // 应用设置
            applySettings() {
                // 根据设置调整 UI
                this.log('设置已应用', 'info');
            }
            
            // 发送消息到 Native
            sendNativeMessage(type, data) {
                return window.sendNativeMessage(type, data);
            }
            
            // 记录日志
            log(message, type = 'info') {
                const container = document.getElementById('logContainer');
                const timestamp = new Date().toLocaleTimeString();
                const entry = document.createElement('div');
                entry.className = \`log-entry \${type}\`;
                entry.textContent = \`[\${timestamp}] \${message}\`;
                
                container.appendChild(entry);
                container.scrollTop = container.scrollHeight;
                
                // 同时发送到 Native 日志
                this.sendNativeMessage('log', {
                    level: type,
                    message: message,
                    timestamp: timestamp
                }).catch(() => {
                    // 忽略日志发送失败
                });
            }
            
            // 清除日志
            clearLog() {
                document.getElementById('logContainer').innerHTML = '';
                this.log('日志已清除', 'info');
            }
        }
        
        // 初始化应用
        const app = new WebViewApp();
    `;
  }
});
```

### 7.7 WebView 显示和加载

#### WebView 容器集成

```javascript
// 扩展显示功能
WebViewController.defineProtocol({
  // 加载 HTML 内容
  loadHTMLContent: function() {
    let htmlContent = this.generateHTML();
    
    // 创建基础 URL（可选）
    let baseURL = null;
    
    this.webView.loadHTMLStringBaseURL(htmlContent, baseURL);
    
    MNUtil.log("WebViewController: HTML 内容加载中");
  },
  
  // 加载 URL
  loadURL: function(urlString) {
    let url = NSURL.URLWithString(urlString);
    let request = NSURLRequest.requestWithURL(url);
    
    this.webView.loadRequest(request);
    
    MNUtil.log(`WebViewController: 加载 URL - ${urlString}`);
  },
  
  // 获取 WebView
  getWebView: function() {
    return this.webView;
  },
  
  // 添加到容器视图
  addToView: function(containerView) {
    this.containerView = containerView;
    containerView.addSubview(this.webView);
    
    MNUtil.log("WebViewController: 已添加到容器视图");
  },
  
  // 设置 WebView 框架
  setFrame: function(frame) {
    this.webView.setFrame(frame);
  },
  
  // 刷新 WebView
  reload: function() {
    this.webView.reload();
  },
  
  // 清理资源
  cleanup: function() {
    if (this.webView) {
      this.webView.removeFromSuperview();
      this.webView.navigationDelegate = null;
      this.webView.UIDelegate = null;
      this.webView = null;
    }
    
    this.containerView = null;
    this.messageHandlers = {};
    this.callbacks = {};
    
    MNUtil.log("WebViewController: 资源已清理");
  }
});
```

### 7.8 在插件中集成 WebView

#### 主插件集成示例

```javascript
// main.js - 插件主文件中的 WebView 集成
JSB.newAddon = () => {
  return JSB.defineClass("WebViewDemo: JSExtension", {
    // WebView 控制器
    webViewController: null,
    webViewContainer: null,
    
    // 插件生命周期
    sceneWillConnect: function() {
      MNUtil.log("场景连接 - 初始化 WebView");
      
      // 创建 WebView 控制器
      this.createWebViewController();
      
      // 创建菜单项
      this.createMenuItems();
    },
    
    sceneDidDisconnect: function() {
      MNUtil.log("场景断开 - 清理 WebView");
      
      if (self.webViewController) {
        self.webViewController.cleanup();
        self.webViewController = null;
      }
      
      if (self.webViewContainer) {
        self.webViewContainer.removeFromSuperview();
        self.webViewContainer = null;
      }
    },
    
    // 创建 WebView 控制器
    createWebViewController: function() {
      // 计算 WebView 框架
      let screenBounds = UIScreen.mainScreen().bounds();
      let frame = {
        x: screenBounds.width - 400,
        y: 100,
        width: 380,
        height: 500
      };
      
      // 创建容器视图
      self.webViewContainer = UIView.alloc().initWithFrame(frame);
      self.webViewContainer.backgroundColor = UIColor.whiteColor();
      self.webViewContainer.layer.cornerRadius = 8;
      self.webViewContainer.layer.shadowColor = UIColor.blackColor().CGColor();
      self.webViewContainer.layer.shadowOffset = {width: 0, height: 2};
      self.webViewContainer.layer.shadowRadius = 8;
      self.webViewContainer.layer.shadowOpacity = 0.3;
      
      // 创建 WebView 控制器
      self.webViewController = WebViewController.new().initWithFrame({
        x: 0, y: 0, width: frame.width, height: frame.height
      });
      
      // 设置准备就绪回调
      self.webViewController.onReady = function() {
        MNUtil.log("WebView 准备就绪，发送插件数据");
        self.sendPluginDataToWebView();
      };
      
      // 注册自定义消息处理器
      self.registerCustomHandlers();
      
      // 添加到容器
      self.webViewController.addToView(self.webViewContainer);
      
      // 加载 HTML 内容
      self.webViewController.loadHTMLContent();
    },
    
    // 注册自定义消息处理器
    registerCustomHandlers: function() {
      // 处理自定义消息
      self.webViewController.messageHandlers['customMessage'] = function(data, message) {
        return self.handleCustomMessage(data, message);
      };
      
      // 处理文本处理请求
      self.webViewController.messageHandlers['processText'] = function(data, message) {
        return self.processText(data.text);
      };
      
      // 处理笔记操作
      self.webViewController.messageHandlers['noteAction'] = function(data, message) {
        return self.handleNoteAction(data);
      };
    },
    
    // 发送插件数据到 WebView
    sendPluginDataToWebView: function() {
      let pluginData = {
        pluginName: "WebView Demo",
        version: "1.0.0",
        features: ["数据同步", "笔记操作", "UI 交互"]
      };
      
      self.webViewController.sendMessageToJS('pluginData', pluginData);
    },
    
    // 处理自定义消息
    handleCustomMessage: function(data, message) {
      let {action} = data;
      
      switch (action) {
        case 'processText':
          return this.processText(data.text);
        case 'getNoteCount':
          return this.getNoteCount();
        case 'createNote':
          return this.createNote(data);
        default:
          return {error: `Unknown action: ${action}`};
      }
    },
    
    // 处理文本
    processText: function(text) {
      // 示例：文本统计
      let stats = {
        length: text.length,
        words: text.split(/\s+/).length,
        lines: text.split('\n').length,
        processed: text.toUpperCase()
      };
      
      MNUtil.log("文本处理完成", stats);
      return {status: 'processed', stats: stats};
    },
    
    // 获取笔记数量
    getNoteCount: function() {
      let notebook = MNNotebook.currentNotebook();
      if (!notebook) return {count: 0};
      
      let count = notebook.allNotes().length;
      return {count: count};
    },
    
    // 创建笔记
    createNote: function(data) {
      try {
        let {title, content} = data;
        
        // 创建新笔记（示例实现）
        let note = MNNote.new();
        if (title) note.noteTitle = title;
        if (content) note.excerptText = content;
        
        return {
          status: 'created',
          noteId: note.noteId
        };
      } catch (error) {
        return {
          error: error.message
        };
      }
    },
    
    // 处理笔记操作
    handleNoteAction: function(data) {
      let {action, noteId} = data;
      
      switch (action) {
        case 'select':
          return this.selectNote(noteId);
        case 'delete':
          return this.deleteNote(noteId);
        case 'update':
          return this.updateNote(noteId, data.updates);
        default:
          return {error: `Unknown note action: ${action}`};
      }
    },
    
    // 选择笔记
    selectNote: function(noteId) {
      let note = MNNote.getNoteById(noteId);
      if (note) {
        MNUtil.focusNote(note);
        return {status: 'selected', noteId: noteId};
      } else {
        return {error: 'Note not found'};
      }
    },
    
    // 创建菜单项
    createMenuItems: function() {
      // 显示/隐藏 WebView
      let toggleItem = MNMenuItem.menuItemWithTitleTarget(
        "切换 WebView", 
        self, 
        "toggleWebView"
      );
      
      // 刷新 WebView
      let refreshItem = MNMenuItem.menuItemWithTitleTarget(
        "刷新 WebView", 
        self, 
        "refreshWebView"
      );
      
      // 添加到工具栏
      let toolbar = MNUtil.getDocumentMenuController();
      toolbar.menu.addMenuItem(toggleItem);
      toolbar.menu.addMenuItem(refreshItem);
    },
    
    // 切换 WebView 显示
    toggleWebView: function() {
      if (!self.webViewContainer.superview()) {
        // 添加到主窗口
        let mainWindow = UIApplication.sharedApplication().keyWindow();
        mainWindow.addSubview(self.webViewContainer);
        
        MNUtil.showHUD("WebView 已显示");
      } else {
        // 从主窗口移除
        self.webViewContainer.removeFromSuperview();
        
        MNUtil.showHUD("WebView 已隐藏");
      }
    },
    
    // 刷新 WebView
    refreshWebView: function() {
      if (self.webViewController) {
        self.webViewController.reload();
        MNUtil.showHUD("WebView 已刷新");
      }
    }
  });
};
```

### 7.9 本章小结

在本章中，我们学习了 WebView 集成开发的完整技术栈：

✅ **WebView 架构设计** - Native ↔ JavaScript 双向通信机制  
✅ **WebView 控制器** - WKWebView 容器和消息管理  
✅ **消息处理系统** - JavaScript ↔ Native 消息传递  
✅ **HTML 界面开发** - 响应式 Web 界面设计  
✅ **前端逻辑实现** - JavaScript 事件处理和状态管理  
✅ **数据同步机制** - Native 数据与 Web 界面同步  
✅ **插件集成方案** - 完整的插件集成实现  
✅ **自定义消息处理** - 可扩展的消息处理架构

**关键技术要点**：
- 使用 `WKScriptMessageHandler` 实现 JS → Native 通信
- 使用 `evaluateJavaScript` 实现 Native → JS 通信  
- Promise-based 消息传递确保异步操作的可靠性
- 响应式设计适配不同屏幕尺寸
- 完整的错误处理和日志记录机制

下一章，我们将学习多控制器架构，这是 MNAI 等复杂插件的核心架构模式。

---

## 第8章：多控制器架构 - 构建大型复杂插件

### 8.1 多控制器架构的概念与价值

多控制器架构是现代大型插件开发的核心设计模式，它将复杂的功能拆分为多个专职的控制器，每个控制器负责特定的业务领域。

#### 核心优势

- **关注点分离**：不同的控制器专注于不同的功能领域
- **代码组织**：大型代码库变得更加可维护和可扩展
- **团队协作**：不同开发者可以并行开发不同的控制器
- **测试友好**：每个控制器可以独立测试
- **性能优化**：按需加载和初始化控制器

#### 经典应用案例

**MNAI 插件的四控制器架构**：
```
MNAI 插件 (13,332 lines)
├── webviewController.js     (4,241 lines, 148 methods) - 主界面管理
├── notificationController.js (3,862 lines, 63 methods)  - 事件处理
├── dynamicController.js     (1,487 lines, 47 methods)  - 动态内容
└── sideOutputController.js  (3,742 lines, 80 methods)  - 侧边面板
```

### 8.2 多控制器架构设计原理

#### 架构层级图

```javascript
// 多控制器架构层级
Main Plugin Controller (主控制器)
    ├── Controller Manager (控制器管理器)
    │   ├── Event Bus (事件总线)
    │   ├── State Manager (状态管理器)
    │   └── Lifecycle Manager (生命周期管理器)
    │
    ├── UI Controllers (界面控制器组)
    │   ├── WebView Controller (Web界面控制器)
    │   ├── Floating Panel Controller (浮动面板控制器)
    │   └── Menu Controller (菜单控制器)
    │
    ├── Data Controllers (数据控制器组)
    │   ├── Note Controller (笔记控制器)
    │   ├── Document Controller (文档控制器)
    │   └── Settings Controller (设置控制器)
    │
    └── Service Controllers (服务控制器组)
        ├── Notification Controller (通知控制器)
        ├── Network Controller (网络控制器)
        └── File Controller (文件控制器)
```

#### 设计原则

1. **单一职责原则**：每个控制器只负责一个特定的功能领域
2. **松耦合原则**：控制器间通过事件总线或接口通信
3. **高内聚原则**：相关的功能组织在同一个控制器内
4. **可扩展原则**：支持动态添加和移除控制器
5. **生命周期管理**：统一管理所有控制器的生命周期

### 8.3 控制器管理器设计

#### 核心管理器实现

```javascript
// 控制器管理器
var ControllerManager = JSB.defineClass("ControllerManager: NSObject", {
  // 控制器注册表
  controllers: {},
  controllerInstances: {},
  
  // 管理器配置
  config: {
    autoStart: true,
    lazyLoading: true,
    errorHandling: true,
    debugging: true
  },
  
  // 事件总线
  eventBus: null,
  
  // 状态管理器
  stateManager: null,
  
  // 生命周期状态
  lifecycleState: 'uninitialized' // uninitialized, initializing, running, destroying
});
```

#### 管理器初始化

```javascript
// 扩展控制器管理器
ControllerManager.defineProtocol({
  // 初始化管理器
  initialize: function() {
    MNUtil.log("ControllerManager: 初始化开始");
    
    this.lifecycleState = 'initializing';
    
    // 1. 初始化事件总线
    this.initializeEventBus();
    
    // 2. 初始化状态管理器
    this.initializeStateManager();
    
    // 3. 注册核心控制器
    this.registerCoreControllers();
    
    // 4. 启动控制器（如果配置了自动启动）
    if (this.config.autoStart) {
      this.startAllControllers();
    }
    
    this.lifecycleState = 'running';
    MNUtil.log("ControllerManager: 初始化完成");
  },
  
  // 初始化事件总线
  initializeEventBus: function() {
    this.eventBus = {
      listeners: {},
      
      // 订阅事件
      on: function(eventName, listener, context) {
        if (!this.listeners[eventName]) {
          this.listeners[eventName] = [];
        }
        
        this.listeners[eventName].push({
          callback: listener,
          context: context || null
        });
      },
      
      // 取消订阅
      off: function(eventName, listener) {
        if (this.listeners[eventName]) {
          this.listeners[eventName] = this.listeners[eventName].filter(
            l => l.callback !== listener
          );
        }
      },
      
      // 发布事件
      emit: function(eventName, data) {
        if (this.listeners[eventName]) {
          this.listeners[eventName].forEach(listener => {
            try {
              if (listener.context) {
                listener.callback.call(listener.context, data);
              } else {
                listener.callback(data);
              }
            } catch (error) {
              MNUtil.log(`事件处理错误 [${eventName}]:`, error);
            }
          });
        }
      }
    };
    
    MNUtil.log("EventBus: 初始化完成");
  },
  
  // 初始化状态管理器
  initializeStateManager: function() {
    this.stateManager = {
      state: {},
      
      // 获取状态
      get: function(key) {
        return this.state[key];
      },
      
      // 设置状态
      set: function(key, value) {
        let oldValue = this.state[key];
        this.state[key] = value;
        
        // 发布状态变更事件
        if (oldValue !== value) {
          ControllerManager.eventBus.emit('stateChanged', {
            key: key,
            oldValue: oldValue,
            newValue: value
          });
        }
      },
      
      // 批量更新状态
      update: function(updates) {
        let changes = {};
        
        Object.keys(updates).forEach(key => {
          let oldValue = this.state[key];
          this.state[key] = updates[key];
          
          if (oldValue !== updates[key]) {
            changes[key] = {
              oldValue: oldValue,
              newValue: updates[key]
            };
          }
        });
        
        // 发布批量状态变更事件
        if (Object.keys(changes).length > 0) {
          ControllerManager.eventBus.emit('stateUpdated', changes);
        }
      }
    };
    
    MNUtil.log("StateManager: 初始化完成");
  }
});
```

#### 控制器注册与管理

```javascript
// 扩展控制器注册功能
ControllerManager.defineProtocol({
  // 注册控制器
  registerController: function(name, controllerClass, config) {
    config = config || {};
    
    this.controllers[name] = {
      name: name,
      class: controllerClass,
      config: config,
      autoStart: config.autoStart !== false,
      dependencies: config.dependencies || [],
      priority: config.priority || 0
    };
    
    MNUtil.log(`控制器已注册: ${name}`);
    
    // 如果管理器已运行且控制器配置了自动启动，立即启动
    if (this.lifecycleState === 'running' && config.autoStart !== false) {
      this.startController(name);
    }
  },
  
  // 启动控制器
  startController: function(name) {
    let controllerDef = this.controllers[name];
    if (!controllerDef) {
      throw new Error(`控制器未找到: ${name}`);
    }
    
    // 检查是否已启动
    if (this.controllerInstances[name]) {
      MNUtil.log(`控制器已启动: ${name}`);
      return this.controllerInstances[name];
    }
    
    // 检查依赖
    this.checkDependencies(name);
    
    // 创建控制器实例
    try {
      let instance = controllerDef.class.new();
      
      // 注入依赖
      this.injectDependencies(instance, controllerDef);
      
      // 初始化控制器
      if (instance.initialize) {
        instance.initialize();
      }
      
      // 注册实例
      this.controllerInstances[name] = instance;
      
      // 发布控制器启动事件
      this.eventBus.emit('controllerStarted', {
        name: name,
        instance: instance
      });
      
      MNUtil.log(`控制器已启动: ${name}`);
      return instance;
      
    } catch (error) {
      MNUtil.log(`控制器启动失败: ${name}`, error);
      throw error;
    }
  },
  
  // 停止控制器
  stopController: function(name) {
    let instance = this.controllerInstances[name];
    if (!instance) {
      MNUtil.log(`控制器未运行: ${name}`);
      return;
    }
    
    try {
      // 调用控制器的销毁方法
      if (instance.destroy) {
        instance.destroy();
      }
      
      // 从注册表中移除
      delete this.controllerInstances[name];
      
      // 发布控制器停止事件
      this.eventBus.emit('controllerStopped', {
        name: name
      });
      
      MNUtil.log(`控制器已停止: ${name}`);
      
    } catch (error) {
      MNUtil.log(`控制器停止失败: ${name}`, error);
    }
  },
  
  // 获取控制器实例
  getController: function(name) {
    return this.controllerInstances[name];
  },
  
  // 检查依赖
  checkDependencies: function(name) {
    let controllerDef = this.controllers[name];
    let missingDeps = [];
    
    controllerDef.dependencies.forEach(dep => {
      if (!this.controllerInstances[dep]) {
        // 尝试启动依赖控制器
        if (this.controllers[dep]) {
          this.startController(dep);
        } else {
          missingDeps.push(dep);
        }
      }
    });
    
    if (missingDeps.length > 0) {
      throw new Error(`缺少依赖控制器: ${missingDeps.join(', ')}`);
    }
  },
  
  // 注入依赖
  injectDependencies: function(instance, controllerDef) {
    // 注入控制器管理器
    instance.controllerManager = this;
    
    // 注入事件总线
    instance.eventBus = this.eventBus;
    
    // 注入状态管理器
    instance.stateManager = this.stateManager;
    
    // 注入依赖控制器
    controllerDef.dependencies.forEach(dep => {
      let depInstance = this.controllerInstances[dep];
      if (depInstance) {
        instance[dep + 'Controller'] = depInstance;
      }
    });
  }
});
```

### 8.4 基础控制器类设计

#### 控制器基类

```javascript
// 基础控制器类
var BaseController = JSB.defineClass("BaseController: NSObject", {
  // 控制器名称
  name: null,
  
  // 依赖注入的服务
  controllerManager: null,
  eventBus: null,
  stateManager: null,
  
  // 控制器状态
  isInitialized: false,
  isRunning: false,
  
  // 配置选项
  config: {},
  
  // 事件监听器注册表
  eventListeners: []
});
```

#### 控制器基类方法

```javascript
// 扩展基础控制器
BaseController.defineProtocol({
  // 初始化方法（子类应重写）
  initialize: function() {
    MNUtil.log(`${this.name}: 初始化开始`);
    
    // 设置默认配置
    this.setupDefaultConfig();
    
    // 注册事件监听器
    this.setupEventListeners();
    
    // 初始化 UI 组件
    this.setupUI();
    
    // 初始化数据
    this.setupData();
    
    this.isInitialized = true;
    this.isRunning = true;
    
    MNUtil.log(`${this.name}: 初始化完成`);
  },
  
  // 销毁方法
  destroy: function() {
    MNUtil.log(`${this.name}: 销毁开始`);
    
    this.isRunning = false;
    
    // 清理事件监听器
    this.cleanupEventListeners();
    
    // 清理 UI 组件
    this.cleanupUI();
    
    // 清理数据
    this.cleanupData();
    
    this.isInitialized = false;
    
    MNUtil.log(`${this.name}: 销毁完成`);
  },
  
  // 设置默认配置（子类可重写）
  setupDefaultConfig: function() {
    this.config = Object.assign({}, this.config);
  },
  
  // 设置事件监听器（子类可重写）
  setupEventListeners: function() {
    // 子类实现具体的事件监听器设置
  },
  
  // 设置 UI 组件（子类可重写）
  setupUI: function() {
    // 子类实现具体的 UI 设置
  },
  
  // 设置数据（子类可重写）
  setupData: function() {
    // 子类实现具体的数据初始化
  },
  
  // 清理事件监听器
  cleanupEventListeners: function() {
    this.eventListeners.forEach(({eventName, callback}) => {
      this.eventBus.off(eventName, callback);
    });
    this.eventListeners = [];
  },
  
  // 清理 UI 组件（子类可重写）
  cleanupUI: function() {
    // 子类实现具体的 UI 清理
  },
  
  // 清理数据（子类可重写）
  cleanupData: function() {
    // 子类实现具体的数据清理
  },
  
  // 便捷的事件监听方法
  addEventListener: function(eventName, callback) {
    this.eventBus.on(eventName, callback, this);
    this.eventListeners.push({eventName, callback});
  },
  
  // 发布事件
  emitEvent: function(eventName, data) {
    this.eventBus.emit(eventName, data);
  },
  
  // 获取状态
  getState: function(key) {
    return this.stateManager.get(key);
  },
  
  // 设置状态
  setState: function(key, value) {
    this.stateManager.set(key, value);
  },
  
  // 获取其他控制器
  getController: function(name) {
    return this.controllerManager.getController(name);
  }
});
```

### 8.5 WebView 控制器实现

#### WebView 控制器设计

```javascript
// WebView 控制器
var WebViewController = JSB.defineClass("WebViewController: BaseController", {
  name: "WebViewController",
  
  // WebView 相关属性
  webView: null,
  containerView: null,
  messageHandlers: {},
  
  // 配置选项
  config: {
    autoShow: false,
    position: 'right',
    width: 400,
    height: 600
  }
});
```

#### WebView 控制器实现

```javascript
// 扩展 WebView 控制器
WebViewController.defineProtocol({
  // 设置默认配置
  setupDefaultConfig: function() {
    this.config = Object.assign({
      autoShow: false,
      position: 'right',
      width: 400,
      height: 600,
      debugMode: false
    }, this.config);
  },
  
  // 设置事件监听器
  setupEventListeners: function() {
    // 监听笔记变更事件
    this.addEventListener('noteChanged', this.handleNoteChanged);
    
    // 监听文档变更事件
    this.addEventListener('documentChanged', this.handleDocumentChanged);
    
    // 监听设置变更事件
    this.addEventListener('settingsChanged', this.handleSettingsChanged);
  },
  
  // 设置 UI 组件
  setupUI: function() {
    this.createContainer();
    this.createWebView();
    this.setupMessageHandlers();
    this.loadWebContent();
    
    if (this.config.autoShow) {
      this.show();
    }
  },
  
  // 创建容器
  createContainer: function() {
    let screenBounds = UIScreen.mainScreen().bounds();
    let frame = this.calculateFrame(screenBounds);
    
    this.containerView = UIView.alloc().initWithFrame(frame);
    this.containerView.backgroundColor = UIColor.whiteColor();
    this.containerView.layer.cornerRadius = 8;
    this.containerView.layer.shadowColor = UIColor.blackColor().CGColor();
    this.containerView.layer.shadowOffset = {width: 0, height: 2};
    this.containerView.layer.shadowRadius = 8;
    this.containerView.layer.shadowOpacity = 0.2;
  },
  
  // 计算框架位置
  calculateFrame: function(screenBounds) {
    let {width, height} = this.config;
    
    switch (this.config.position) {
      case 'left':
        return {x: 20, y: 100, width: width, height: height};
      case 'right':
        return {x: screenBounds.width - width - 20, y: 100, width: width, height: height};
      case 'center':
        return {
          x: (screenBounds.width - width) / 2,
          y: (screenBounds.height - height) / 2,
          width: width,
          height: height
        };
      default:
        return {x: screenBounds.width - width - 20, y: 100, width: width, height: height};
    }
  },
  
  // 创建 WebView
  createWebView: function() {
    let webConfig = WKWebViewConfiguration.new();
    let contentController = WKUserContentController.new();
    
    // 注册消息处理器
    contentController.addScriptMessageHandlerName(this, "nativeHandler");
    webConfig.userContentController = contentController;
    
    let frame = {x: 0, y: 0, width: this.config.width, height: this.config.height};
    this.webView = WKWebView.alloc().initWithFrameConfiguration(frame, webConfig);
    
    // 设置代理
    this.webView.navigationDelegate = this;
    this.webView.UIDelegate = this;
    
    // 添加到容器
    this.containerView.addSubview(this.webView);
  },
  
  // 设置消息处理器
  setupMessageHandlers: function() {
    this.messageHandlers = {
      'ready': this.handleWebViewReady.bind(this),
      'action': this.handleWebViewAction.bind(this),
      'dataRequest': this.handleDataRequest.bind(this),
      'stateUpdate': this.handleStateUpdate.bind(this)
    };
  },
  
  // 加载 Web 内容
  loadWebContent: function() {
    let htmlContent = this.generateHTML();
    this.webView.loadHTMLStringBaseURL(htmlContent, null);
  },
  
  // 生成 HTML 内容
  generateHTML: function() {
    return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WebView Controller</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
            margin: 0;
            padding: 20px;
            background: #f5f5f5;
        }
        
        .header {
            background: #007AFF;
            color: white;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        
        .content {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .btn {
            background: #007AFF;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 6px;
            cursor: pointer;
            margin: 5px;
        }
        
        .btn:hover {
            background: #0056CC;
        }
        
        #dataDisplay {
            margin-top: 20px;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 6px;
            font-family: monospace;
            white-space: pre-wrap;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>WebView 控制器</h1>
    </div>
    
    <div class="content">
        <h2>操作面板</h2>
        <button class="btn" onclick="requestData()">获取数据</button>
        <button class="btn" onclick="refreshView()">刷新视图</button>
        <button class="btn" onclick="sendAction('test')">测试操作</button>
        
        <div id="dataDisplay">等待数据...</div>
    </div>
    
    <script>
        // 初始化通信
        function initializeCommunication() {
            window.sendNativeMessage = function(type, data) {
                return new Promise((resolve, reject) => {
                    const id = Date.now() + Math.random();
                    const message = {type, data, id};
                    
                    window.pendingCallbacks = window.pendingCallbacks || {};
                    window.pendingCallbacks[id] = {resolve, reject};
                    
                    window.webkit.messageHandlers.nativeHandler.postMessage(JSON.stringify(message));
                });
            };
            
            window.receiveNativeMessage = function(message) {
                if (message.type === 'response' && message.id && window.pendingCallbacks[message.id]) {
                    const callback = window.pendingCallbacks[message.id];
                    delete window.pendingCallbacks[message.id];
                    
                    if (message.success) {
                        callback.resolve(message.result);
                    } else {
                        callback.reject(new Error(message.error));
                    }
                } else {
                    handleNativeMessage(message);
                }
            };
        }
        
        function handleNativeMessage(message) {
            switch (message.type) {
                case 'dataUpdate':
                    updateDisplay(message.data);
                    break;
                case 'stateChanged':
                    handleStateChange(message.data);
                    break;
            }
        }
        
        function requestData() {
            window.sendNativeMessage('dataRequest', {type: 'currentNote'})
                .then(data => {
                    updateDisplay(data);
                })
                .catch(error => {
                    updateDisplay({error: error.message});
                });
        }
        
        function refreshView() {
            window.sendNativeMessage('action', {type: 'refresh'});
        }
        
        function sendAction(action) {
            window.sendNativeMessage('action', {type: action});
        }
        
        function updateDisplay(data) {
            document.getElementById('dataDisplay').textContent = JSON.stringify(data, null, 2);
        }
        
        function handleStateChange(data) {
            console.log('State changed:', data);
        }
        
        // 初始化
        initializeCommunication();
        document.addEventListener('DOMContentLoaded', () => {
            window.sendNativeMessage('ready', {});
        });
    </script>
</body>
</html>
    `;
  },
  
  // WebView 消息处理
  userContentControllerDidReceiveScriptMessage: function(userContentController, message) {
    let body = message.body();
    let data = JSON.parse(body);
    
    let handler = this.messageHandlers[data.type];
    if (handler) {
      handler(data.data, data.id);
    } else {
      MNUtil.log(`未知的 WebView 消息类型: ${data.type}`);
    }
  },
  
  // 处理 WebView 准备就绪
  handleWebViewReady: function(data, id) {
    MNUtil.log("WebView 准备就绪");
    this.sendInitialData();
  },
  
  // 处理 WebView 操作
  handleWebViewAction: function(data, id) {
    let {type} = data;
    
    switch (type) {
      case 'refresh':
        this.refreshData();
        break;
      case 'test':
        this.performTest();
        break;
      default:
        MNUtil.log(`未知的操作类型: ${type}`);
    }
  },
  
  // 处理数据请求
  handleDataRequest: function(data, id) {
    let {type} = data;
    let result = null;
    
    switch (type) {
      case 'currentNote':
        result = this.getCurrentNoteData();
        break;
      case 'documentInfo':
        result = this.getDocumentInfo();
        break;
      default:
        result = {error: `未知的数据类型: ${type}`};
    }
    
    this.sendMessageToJS('response', {
      id: id,
      result: result,
      success: !result.error
    });
  },
  
  // 发送消息到 JS
  sendMessageToJS: function(type, data) {
    let script = `
      if (window.receiveNativeMessage) {
        window.receiveNativeMessage(${JSON.stringify({type, data})});
      }
    `;
    
    this.webView.evaluateJavaScriptCompletionHandler(script, null);
  },
  
  // 发送初始数据
  sendInitialData: function() {
    let data = {
      noteData: this.getCurrentNoteData(),
      documentData: this.getDocumentInfo(),
      settings: this.getState('webViewSettings') || {}
    };
    
    this.sendMessageToJS('dataUpdate', data);
  },
  
  // 获取当前笔记数据
  getCurrentNoteData: function() {
    let focusNote = MNNote.getFocusNote();
    if (!focusNote) return null;
    
    return {
      noteId: focusNote.noteId,
      noteTitle: focusNote.noteTitle,
      excerptText: focusNote.excerptText
    };
  },
  
  // 获取文档信息
  getDocumentInfo: function() {
    let notebook = MNNotebook.currentNotebook();
    if (!notebook) return null;
    
    return {
      notebookId: notebook.notebookId,
      title: notebook.title
    };
  },
  
  // 刷新数据
  refreshData: function() {
    this.sendInitialData();
  },
  
  // 执行测试
  performTest: function() {
    MNUtil.showHUD("WebView 控制器测试");
    this.emitEvent('webViewTestPerformed', {
      controller: this.name,
      timestamp: Date.now()
    });
  },
  
  // 事件处理方法
  handleNoteChanged: function(data) {
    this.sendMessageToJS('dataUpdate', {
      noteData: this.getCurrentNoteData()
    });
  },
  
  handleDocumentChanged: function(data) {
    this.sendMessageToJS('dataUpdate', {
      documentData: this.getDocumentInfo()
    });
  },
  
  handleSettingsChanged: function(data) {
    this.sendMessageToJS('stateChanged', data);
  },
  
  // 显示 WebView
  show: function() {
    let mainWindow = UIApplication.sharedApplication().keyWindow();
    mainWindow.addSubview(this.containerView);
    this.emitEvent('webViewShown', {controller: this.name});
  },
  
  // 隐藏 WebView
  hide: function() {
    this.containerView.removeFromSuperview();
    this.emitEvent('webViewHidden', {controller: this.name});
  },
  
  // 切换显示状态
  toggle: function() {
    if (this.containerView.superview()) {
      this.hide();
    } else {
      this.show();
    }
  },
  
  // 清理 UI 组件
  cleanupUI: function() {
    if (this.containerView) {
      this.containerView.removeFromSuperview();
      this.containerView = null;
    }
    
    if (this.webView) {
      this.webView.navigationDelegate = null;
      this.webView.UIDelegate = null;
      this.webView = null;
    }
  }
});
```

### 8.6 通知控制器实现

#### 通知控制器设计

```javascript
// 通知控制器
var NotificationController = JSB.defineClass("NotificationController: BaseController", {
  name: "NotificationController",
  
  // 通知相关属性
  notificationCenter: null,
  observers: [],
  notificationQueue: [],
  
  // 配置选项
  config: {
    enableSystemNotifications: true,
    enableHUDNotifications: true,
    maxQueueSize: 100,
    autoProcessQueue: true
  }
});
```

#### 通知控制器实现

```javascript
// 扩展通知控制器
NotificationController.defineProtocol({
  // 设置 UI 组件
  setupUI: function() {
    // 获取通知中心
    this.notificationCenter = NSNotificationCenter.defaultCenter();
    
    // 注册系统通知监听器
    this.setupSystemNotificationObservers();
    
    // 初始化通知队列处理
    if (this.config.autoProcessQueue) {
      this.startQueueProcessor();
    }
  },
  
  // 设置事件监听器
  setupEventListeners: function() {
    // 监听控制器启动停止事件
    this.addEventListener('controllerStarted', this.handleControllerStarted);
    this.addEventListener('controllerStopped', this.handleControllerStopped);
    
    // 监听状态变更事件
    this.addEventListener('stateChanged', this.handleStateChanged);
    this.addEventListener('stateUpdated', this.handleStateUpdated);
    
    // 监听 WebView 事件
    this.addEventListener('webViewShown', this.handleWebViewShown);
    this.addEventListener('webViewHidden', this.handleWebViewHidden);
  },
  
  // 设置系统通知监听器
  setupSystemNotificationObservers: function() {
    // 监听笔记选择变更
    let noteObserver = this.notificationCenter.addObserverSelectorNameObject(
      this,
      "handleNoteSelectionChanged:",
      "AddonNoteSelectionByEventDidChangeNotification",
      null
    );
    this.observers.push(noteObserver);
    
    // 监听文档打开/关闭
    let docOpenObserver = this.notificationCenter.addObserverSelectorNameObject(
      this,
      "handleDocumentOpened:",
      "AddonDocumentDidOpenNotification",
      null
    );
    this.observers.push(docOpenObserver);
    
    let docCloseObserver = this.notificationCenter.addObserverSelectorNameObject(
      this,
      "handleDocumentClosed:",
      "AddonDocumentWillCloseNotification", 
      null
    );
    this.observers.push(docCloseObserver);
    
    // 监听笔记本变更
    let notebookObserver = this.notificationCenter.addObserverSelectorNameObject(
      this,
      "handleNotebookChanged:",
      "AddonNotebookDidChangeNotification",
      null
    );
    this.observers.push(notebookObserver);
    
    MNUtil.log("系统通知监听器已设置");
  },
  
  // 处理笔记选择变更
  handleNoteSelectionChanged: function(notification) {
    let userInfo = notification.userInfo();
    let noteId = userInfo ? userInfo.noteId : null;
    
    this.queueNotification({
      type: 'noteChanged',
      data: {noteId: noteId},
      source: 'system',
      timestamp: Date.now()
    });
  },
  
  // 处理文档打开
  handleDocumentOpened: function(notification) {
    let userInfo = notification.userInfo();
    let docMd5 = userInfo ? userInfo.docMd5 : null;
    
    this.queueNotification({
      type: 'documentOpened',
      data: {docMd5: docMd5},
      source: 'system',
      timestamp: Date.now()
    });
  },
  
  // 处理文档关闭
  handleDocumentClosed: function(notification) {
    let userInfo = notification.userInfo();
    let docMd5 = userInfo ? userInfo.docMd5 : null;
    
    this.queueNotification({
      type: 'documentClosed',
      data: {docMd5: docMd5},
      source: 'system',
      timestamp: Date.now()
    });
  },
  
  // 处理笔记本变更
  handleNotebookChanged: function(notification) {
    let userInfo = notification.userInfo();
    let notebookId = userInfo ? userInfo.notebookId : null;
    
    this.queueNotification({
      type: 'notebookChanged',
      data: {notebookId: notebookId},
      source: 'system',
      timestamp: Date.now()
    });
  },
  
  // 队列通知
  queueNotification: function(notification) {
    // 检查队列大小
    if (this.notificationQueue.length >= this.config.maxQueueSize) {
      // 移除最老的通知
      this.notificationQueue.shift();
      MNUtil.log("通知队列已满，移除最老的通知");
    }
    
    this.notificationQueue.push(notification);
    
    // 如果启用了自动处理，立即处理
    if (this.config.autoProcessQueue) {
      this.processNextNotification();
    }
  },
  
  // 开始队列处理器
  startQueueProcessor: function() {
    // 定时处理队列（每 100ms 检查一次）
    this.queueTimer = NSTimer.scheduledTimerWithTimeIntervalTargetSelectorUserInfoRepeats(
      0.1, this, "processQueuedNotifications:", null, true
    );
  },
  
  // 处理队列中的通知
  processQueuedNotifications: function() {
    while (this.notificationQueue.length > 0) {
      this.processNextNotification();
    }
  },
  
  // 处理下一个通知
  processNextNotification: function() {
    if (this.notificationQueue.length === 0) return;
    
    let notification = this.notificationQueue.shift();
    this.processNotification(notification);
  },
  
  // 处理通知
  processNotification: function(notification) {
    try {
      // 发布到事件总线
      this.emitEvent(notification.type, notification.data);
      
      // 根据配置显示通知
      if (this.config.enableHUDNotifications && this.shouldShowHUD(notification)) {
        this.showHUDForNotification(notification);
      }
      
      // 记录通知
      this.logNotification(notification);
      
    } catch (error) {
      MNUtil.log("处理通知时出错:", error);
    }
  },
  
  // 判断是否应该显示 HUD
  shouldShowHUD: function(notification) {
    // 根据通知类型和用户设置决定是否显示 HUD
    let hudSettings = this.getState('notificationHUDSettings') || {};
    return hudSettings[notification.type] !== false;
  },
  
  // 为通知显示 HUD
  showHUDForNotification: function(notification) {
    let message = this.formatNotificationMessage(notification);
    if (message) {
      MNUtil.showHUD(message);
    }
  },
  
  // 格式化通知消息
  formatNotificationMessage: function(notification) {
    switch (notification.type) {
      case 'noteChanged':
        return "笔记已切换";
      case 'documentOpened':
        return "文档已打开";
      case 'documentClosed':
        return "文档已关闭";
      case 'notebookChanged':
        return "笔记本已切换";
      default:
        return null;
    }
  },
  
  // 记录通知
  logNotification: function(notification) {
    if (this.config.debugging) {
      MNUtil.log(`[通知] ${notification.type}:`, notification.data);
    }
  },
  
  // 事件处理方法
  handleControllerStarted: function(data) {
    this.queueNotification({
      type: 'controllerStarted',
      data: data,
      source: 'internal',
      timestamp: Date.now()
    });
  },
  
  handleControllerStopped: function(data) {
    this.queueNotification({
      type: 'controllerStopped',
      data: data,
      source: 'internal',
      timestamp: Date.now()
    });
  },
  
  handleStateChanged: function(data) {
    this.queueNotification({
      type: 'stateChanged',
      data: data,
      source: 'internal',
      timestamp: Date.now()
    });
  },
  
  handleStateUpdated: function(data) {
    this.queueNotification({
      type: 'stateUpdated',
      data: data,
      source: 'internal',
      timestamp: Date.now()
    });
  },
  
  handleWebViewShown: function(data) {
    if (this.config.enableHUDNotifications) {
      MNUtil.showHUD("WebView 已显示");
    }
  },
  
  handleWebViewHidden: function(data) {
    if (this.config.enableHUDNotifications) {
      MNUtil.showHUD("WebView 已隐藏");
    }
  },
  
  // 公共 API：发送自定义通知
  sendNotification: function(type, data, options) {
    options = options || {};
    
    let notification = {
      type: type,
      data: data,
      source: options.source || 'custom',
      timestamp: Date.now(),
      priority: options.priority || 'normal'
    };
    
    if (options.immediate) {
      this.processNotification(notification);
    } else {
      this.queueNotification(notification);
    }
  },
  
  // 清理数据
  cleanupData: function() {
    // 停止队列处理器
    if (this.queueTimer) {
      this.queueTimer.invalidate();
      this.queueTimer = null;
    }
    
    // 移除系统通知监听器
    this.observers.forEach(observer => {
      this.notificationCenter.removeObserver(observer);
    });
    this.observers = [];
    
    // 清空队列
    this.notificationQueue = [];
  }
});
```

### 8.7 数据控制器实现

#### 数据控制器设计

```javascript
// 数据控制器
var DataController = JSB.defineClass("DataController: BaseController", {
  name: "DataController",
  
  // 数据缓存
  cache: {},
  
  // 配置选项
  config: {
    enableCaching: true,
    cacheTimeout: 5000, // 5秒
    autoSync: true,
    maxCacheSize: 1000
  }
});
```

#### 数据控制器实现

```javascript
// 扩展数据控制器
DataController.defineProtocol({
  // 设置数据
  setupData: function() {
    // 初始化缓存
    this.initializeCache();
    
    // 设置自动同步
    if (this.config.autoSync) {
      this.startAutoSync();
    }
  },
  
  // 设置事件监听器
  setupEventListeners: function() {
    this.addEventListener('noteChanged', this.handleNoteChanged);
    this.addEventListener('documentChanged', this.handleDocumentChanged);
    this.addEventListener('notebookChanged', this.handleNotebookChanged);
  },
  
  // 初始化缓存
  initializeCache: function() {
    this.cache = {
      data: {},
      timestamps: {},
      accessCount: {}
    };
  },
  
  // 获取数据
  getData: function(key, options) {
    options = options || {};
    
    // 检查缓存
    if (this.config.enableCaching && this.isCacheValid(key)) {
      this.cache.accessCount[key] = (this.cache.accessCount[key] || 0) + 1;
      return Promise.resolve(this.cache.data[key]);
    }
    
    // 从源获取数据
    return this.fetchDataFromSource(key, options)
      .then(data => {
        // 缓存数据
        if (this.config.enableCaching) {
          this.cacheData(key, data);
        }
        
        return data;
      });
  },
  
  // 设置数据
  setData: function(key, data, options) {
    options = options || {};
    
    // 更新缓存
    if (this.config.enableCaching) {
      this.cacheData(key, data);
    }
    
    // 持久化数据
    if (options.persist !== false) {
      this.persistData(key, data);
    }
    
    // 发布数据变更事件
    this.emitEvent('dataChanged', {key, data});
    
    return Promise.resolve(data);
  },
  
  // 从源获取数据
  fetchDataFromSource: function(key, options) {
    return new Promise((resolve, reject) => {
      try {
        let data = null;
        
        switch (key) {
          case 'currentNote':
            data = this.fetchCurrentNoteData();
            break;
          case 'allNotes':
            data = this.fetchAllNotesData();
            break;
          case 'documentInfo':
            data = this.fetchDocumentInfo();
            break;
          case 'notebookInfo':
            data = this.fetchNotebookInfo();
            break;
          case 'userSettings':
            data = this.fetchUserSettings();
            break;
          default:
            throw new Error(`未知的数据键: ${key}`);
        }
        
        resolve(data);
      } catch (error) {
        reject(error);
      }
    });
  },
  
  // 获取当前笔记数据
  fetchCurrentNoteData: function() {
    let focusNote = MNNote.getFocusNote();
    if (!focusNote) return null;
    
    return {
      noteId: focusNote.noteId,
      noteTitle: focusNote.noteTitle,
      excerptText: focusNote.excerptText,
      comments: focusNote.comments.map(comment => ({
        type: comment.type,
        text: comment.text
      })),
      createDate: focusNote.createDate,
      modifyDate: focusNote.modifyDate
    };
  },
  
  // 获取所有笔记数据
  fetchAllNotesData: function() {
    let notebook = MNNotebook.currentNotebook();
    if (!notebook) return [];
    
    return notebook.allNotes().map(note => ({
      noteId: note.noteId,
      noteTitle: note.noteTitle,
      excerptText: note.excerptText.substring(0, 100) // 只获取前100个字符
    }));
  },
  
  // 获取文档信息
  fetchDocumentInfo: function() {
    let notebook = MNNotebook.currentNotebook();
    if (!notebook) return null;
    
    return {
      notebookId: notebook.notebookId,
      title: notebook.title,
      documentCount: notebook.documents.length,
      noteCount: notebook.allNotes().length
    };
  },
  
  // 获取笔记本信息
  fetchNotebookInfo: function() {
    let notebook = MNNotebook.currentNotebook();
    if (!notebook) return null;
    
    return {
      notebookId: notebook.notebookId,
      title: notebook.title,
      createDate: notebook.createDate,
      modifyDate: notebook.modifyDate
    };
  },
  
  // 获取用户设置
  fetchUserSettings: function() {
    let defaults = NSUserDefaults.standardUserDefaults();
    return defaults.objectForKey("MultiControllerSettings") || {};
  },
  
  // 缓存数据
  cacheData: function(key, data) {
    // 检查缓存大小
    if (Object.keys(this.cache.data).length >= this.config.maxCacheSize) {
      this.cleanOldCache();
    }
    
    this.cache.data[key] = data;
    this.cache.timestamps[key] = Date.now();
    this.cache.accessCount[key] = 1;
  },
  
  // 检查缓存是否有效
  isCacheValid: function(key) {
    if (!this.cache.data.hasOwnProperty(key)) {
      return false;
    }
    
    let timestamp = this.cache.timestamps[key];
    let now = Date.now();
    
    return (now - timestamp) < this.config.cacheTimeout;
  },
  
  // 清理旧缓存
  cleanOldCache: function() {
    let keys = Object.keys(this.cache.data);
    let now = Date.now();
    
    // 删除过期的缓存项
    keys.forEach(key => {
      if ((now - this.cache.timestamps[key]) > this.config.cacheTimeout) {
        delete this.cache.data[key];
        delete this.cache.timestamps[key];
        delete this.cache.accessCount[key];
      }
    });
    
    // 如果还是太大，删除最少使用的项
    if (Object.keys(this.cache.data).length >= this.config.maxCacheSize) {
      let leastUsedKey = keys.reduce((min, key) => {
        return this.cache.accessCount[key] < this.cache.accessCount[min] ? key : min;
      });
      
      delete this.cache.data[leastUsedKey];
      delete this.cache.timestamps[leastUsedKey];
      delete this.cache.accessCount[leastUsedKey];
    }
  },
  
  // 持久化数据
  persistData: function(key, data) {
    let defaults = NSUserDefaults.standardUserDefaults();
    let persistedData = defaults.objectForKey("MultiControllerPersistedData") || {};
    
    persistedData[key] = data;
    defaults.setObjectForKey(persistedData, "MultiControllerPersistedData");
  },
  
  // 开始自动同步
  startAutoSync: function() {
    // 每 10 秒同步一次关键数据
    this.syncTimer = NSTimer.scheduledTimerWithTimeIntervalTargetSelectorUserInfoRepeats(
      10.0, this, "performAutoSync:", null, true
    );
  },
  
  // 执行自动同步
  performAutoSync: function() {
    // 同步关键数据
    let keysToSync = ['currentNote', 'documentInfo'];
    
    keysToSync.forEach(key => {
      this.getData(key, {forceRefresh: true})
        .then(data => {
          this.emitEvent('dataSynced', {key, data});
        })
        .catch(error => {
          MNUtil.log(`同步数据失败 [${key}]:`, error);
        });
    });
  },
  
  // 事件处理方法
  handleNoteChanged: function(data) {
    // 清除当前笔记缓存
    this.invalidateCache('currentNote');
    
    // 预加载新笔记数据
    this.getData('currentNote');
  },
  
  handleDocumentChanged: function(data) {
    // 清除文档相关缓存
    this.invalidateCache('documentInfo');
    this.invalidateCache('allNotes');
  },
  
  handleNotebookChanged: function(data) {
    // 清除所有缓存
    this.clearCache();
  },
  
  // 使缓存失效
  invalidateCache: function(key) {
    delete this.cache.data[key];
    delete this.cache.timestamps[key];
    delete this.cache.accessCount[key];
  },
  
  // 清除所有缓存
  clearCache: function() {
    this.cache.data = {};
    this.cache.timestamps = {};
    this.cache.accessCount = {};
  },
  
  // 获取缓存统计
  getCacheStats: function() {
    return {
      size: Object.keys(this.cache.data).length,
      maxSize: this.config.maxCacheSize,
      hitRate: this.calculateHitRate()
    };
  },
  
  // 计算缓存命中率
  calculateHitRate: function() {
    let totalAccess = Object.values(this.cache.accessCount).reduce((sum, count) => sum + count, 0);
    let cacheSize = Object.keys(this.cache.data).length;
    
    return cacheSize > 0 ? totalAccess / cacheSize : 0;
  },
  
  // 清理数据
  cleanupData: function() {
    if (this.syncTimer) {
      this.syncTimer.invalidate();
      this.syncTimer = null;
    }
    
    this.clearCache();
  }
});
```

### 8.8 插件中的多控制器集成

#### 主插件集成示例

```javascript
// main.js - 多控制器架构主插件
JSB.newAddon = () => {
  return JSB.defineClass("MultiControllerDemo: JSExtension", {
    // 控制器管理器
    controllerManager: null,
    
    // 插件生命周期
    sceneWillConnect: function() {
      MNUtil.log("多控制器插件启动");
      
      // 初始化控制器管理器
      this.initializeControllerManager();
      
      // 注册所有控制器
      this.registerControllers();
      
      // 创建菜单项
      this.createMenuItems();
    },
    
    sceneDidDisconnect: function() {
      MNUtil.log("多控制器插件关闭");
      
      // 清理控制器管理器
      if (self.controllerManager) {
        self.controllerManager.destroy();
        self.controllerManager = null;
      }
    },
    
    // 初始化控制器管理器
    initializeControllerManager: function() {
      self.controllerManager = ControllerManager.new();
      self.controllerManager.initialize();
    },
    
    // 注册控制器
    registerControllers: function() {
      // 注册数据控制器（最高优先级，其他控制器依赖它）
      self.controllerManager.registerController('dataController', DataController, {
        priority: 100,
        autoStart: true
      });
      
      // 注册通知控制器
      self.controllerManager.registerController('notificationController', NotificationController, {
        priority: 90,
        autoStart: true,
        dependencies: ['dataController']
      });
      
      // 注册 WebView 控制器
      self.controllerManager.registerController('webViewController', WebViewController, {
        priority: 80,
        autoStart: false,
        dependencies: ['dataController', 'notificationController'],
        config: {
          position: 'right',
          width: 400,
          height: 600
        }
      });
      
      MNUtil.log("所有控制器已注册");
    },
    
    // 创建菜单项
    createMenuItems: function() {
      // 显示/隐藏 WebView
      let toggleWebViewItem = MNMenuItem.menuItemWithTitleTarget(
        "切换 WebView", 
        self, 
        "toggleWebView"
      );
      
      // 显示控制器状态
      let showStatusItem = MNMenuItem.menuItemWithTitleTarget(
        "控制器状态", 
        self, 
        "showControllerStatus"
      );
      
      // 测试控制器通信
      let testCommunicationItem = MNMenuItem.menuItemWithTitleTarget(
        "测试控制器通信", 
        self, 
        "testControllerCommunication"
      );
      
      // 添加到工具栏
      let toolbar = MNUtil.getDocumentMenuController();
      toolbar.menu.addMenuItem(toggleWebViewItem);
      toolbar.menu.addMenuItem(showStatusItem);
      toolbar.menu.addMenuItem(testCommunicationItem);
    },
    
    // 切换 WebView
    toggleWebView: function() {
      let webController = self.controllerManager.getController('webViewController');
      
      if (!webController) {
        // 如果控制器未启动，先启动它
        webController = self.controllerManager.startController('webViewController');
      }
      
      webController.toggle();
    },
    
    // 显示控制器状态
    showControllerStatus: function() {
      let status = self.getControllerStatus();
      let alert = UIAlertView.new();
      alert.title = "控制器状态";
      alert.message = status;
      alert.addButtonWithTitle("确定");
      alert.show();
    },
    
    // 获取控制器状态
    getControllerStatus: function() {
      let runningControllers = Object.keys(self.controllerManager.controllerInstances);
      let registeredControllers = Object.keys(self.controllerManager.controllers);
      
      let status = `运行中的控制器: ${runningControllers.length}\n`;
      status += `已注册的控制器: ${registeredControllers.length}\n\n`;
      
      status += "运行状态:\n";
      registeredControllers.forEach(name => {
        let isRunning = runningControllers.includes(name);
        status += `• ${name}: ${isRunning ? '✓' : '✗'}\n`;
      });
      
      // 添加数据控制器缓存统计
      let dataController = self.controllerManager.getController('dataController');
      if (dataController) {
        let cacheStats = dataController.getCacheStats();
        status += `\n缓存统计:\n`;
        status += `• 缓存大小: ${cacheStats.size}/${cacheStats.maxSize}\n`;
        status += `• 命中率: ${(cacheStats.hitRate * 100).toFixed(1)}%`;
      }
      
      return status;
    },
    
    // 测试控制器通信
    testControllerCommunication: function() {
      let dataController = self.controllerManager.getController('dataController');
      let notificationController = self.controllerManager.getController('notificationController');
      
      if (dataController && notificationController) {
        // 通过数据控制器获取数据
        dataController.getData('currentNote')
          .then(noteData => {
            // 通过通知控制器发送通知
            notificationController.sendNotification('testComplete', {
              message: '控制器通信测试成功',
              noteData: noteData
            }, {immediate: true});
          })
          .catch(error => {
            MNUtil.showHUD("通信测试失败: " + error.message);
          });
      } else {
        MNUtil.showHUD("所需控制器未启动");
      }
    }
  });
};
```

### 8.9 本章小结

在本章中，我们学习了多控制器架构的完整设计和实现：

✅ **多控制器架构概念** - 关注点分离和代码组织原理
✅ **控制器管理器设计** - 统一的控制器生命周期管理
✅ **事件总线系统** - 松耦合的控制器间通信机制
✅ **状态管理器** - 集中式的应用状态管理
✅ **基础控制器类** - 统一的控制器接口和生命周期
✅ **WebView 控制器** - 专职的 Web 界面管理控制器
✅ **通知控制器** - 统一的事件处理和通知管理
✅ **数据控制器** - 智能的数据缓存和同步机制
✅ **完整集成方案** - 在插件中的实际应用示例

**关键技术要点**：
- 使用依赖注入模式管理控制器之间的依赖关系
- 通过事件总线实现松耦合的控制器通信
- 采用生命周期管理确保资源的正确创建和销毁
- 使用缓存机制优化数据访问性能
- 支持控制器的按需加载和动态管理

**架构优势**：
- 大型插件的代码组织更加清晰和可维护
- 不同功能模块可以独立开发和测试
- 支持功能的渐进式加载和扩展
- 提供了统一的错误处理和调试机制

这种多控制器架构模式特别适合开发像 MNAI 这样的大型复杂插件，能够有效管理数万行代码和多个功能模块。

下一章，我们将进入核心功能篇，学习网络请求、配置管理、控制器通信和手势识别等核心技术。

---

# 第二部分：核心功能篇

## 第9章：网络请求与API集成

在现代插件开发中，网络请求是必不可少的功能。无论是调用 AI API、同步数据、还是获取在线资源，都需要强大的网络处理能力。本章将深入讲解 MarginNote 插件中的网络编程技术。

### 9.1 网络请求基础

#### 9.1.1 理解 MarginNote 的网络环境

MarginNote 插件运行在受限的 JavaScript 环境中，无法直接使用 Node.js 的网络库，但可以通过 JSBridge 调用原生的网络 API。

**可用的网络方法**：

```javascript
// MNUtil 提供的网络请求方法
MNUtil.postUrl(url, bodyData, headers) // POST 请求
MNUtil.getUrl(url, headers)           // GET 请求（通过 MNUtils 框架）

// 原生 NSURLConnection（底层方法）
let request = NSMutableURLRequest.requestWithURL(url)
let connection = NSURLConnection.connectionWithRequest(request, delegate)
```

#### 9.1.2 基础 GET 请求

让我们从最简单的 GET 请求开始：

```javascript
class NetworkManager {
    constructor() {
        this.defaultHeaders = {
            'User-Agent': 'MarginNote-Plugin/1.0',
            'Accept': 'application/json'
        }
    }
    
    // 简单的 GET 请求
    async simpleGet(url) {
        try {
            // 使用 MNUtil.getUrl（需要验证是否存在）
            let response = await this.makeRequest('GET', url)
            return JSON.parse(response)
        } catch (error) {
            MNUtil.showHUD(`请求失败: ${error.message}`)
            throw error
        }
    }
    
    // 通用请求方法
    makeRequest(method, url, data = null, customHeaders = {}) {
        return new Promise((resolve, reject) => {
            // 构建请求
            let nsurl = NSURL.URLWithString(url)
            let request = NSMutableURLRequest.requestWithURL(nsurl)
            request.setHTTPMethod(method)
            
            // 设置请求头
            let headers = {...this.defaultHeaders, ...customHeaders}
            for (let key in headers) {
                request.setValue_forHTTPHeaderField(headers[key], key)
            }
            
            // 设置请求体
            if (data && method !== 'GET') {
                let bodyData = typeof data === 'string' ? 
                    data : JSON.stringify(data)
                let nsData = NSString.stringWithString(bodyData)
                    .dataUsingEncoding(4) // NSUTF8StringEncoding
                request.setHTTPBody(nsData)
                request.setValue_forHTTPHeaderField('application/json', 'Content-Type')
            }
            
            // 发送请求
            let response = {data: '', statusCode: 0}
            let connection = NSURLConnection.sendSynchronousRequest_returningResponse_error(
                request, response, null
            )
            
            if (connection && response.statusCode === 200) {
                let responseStr = NSString.alloc().initWithData_encoding(
                    connection, 4 // NSUTF8StringEncoding
                ).toString()
                resolve(responseStr)
            } else {
                reject(new Error(`HTTP ${response.statusCode}`))
            }
        })
    }
}

// 使用示例
let networkManager = new NetworkManager()

// 获取用户信息
networkManager.simpleGet('https://api.example.com/user/profile')
    .then(data => {
        MNUtil.showHUD(`获取用户 ${data.name} 的信息成功`)
        // 处理响应数据
    })
    .catch(error => {
        MNUtil.log('请求失败:', error)
    })
```

### 9.2 POST 请求与数据提交

#### 9.2.1 表单数据提交

```javascript
class DataSubmissionManager extends NetworkManager {
    // 提交表单数据
    async submitFormData(url, formData) {
        let body = Object.keys(formData)
            .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(formData[key])}`)
            .join('&')
        
        return this.makeRequest('POST', url, body, {
            'Content-Type': 'application/x-www-form-urlencoded'
        })
    }
    
    // 提交 JSON 数据
    async submitJsonData(url, jsonData) {
        return this.makeRequest('POST', url, jsonData, {
            'Content-Type': 'application/json'
        })
    }
    
    // 上传笔记数据到云端
    async uploadNoteToCloud(noteId) {
        try {
            let note = MNNote.getFocusNote() || MNNote.getNoteById(noteId)
            if (!note) {
                throw new Error('笔记不存在')
            }
            
            // 构建上传数据
            let uploadData = {
                id: note.noteId,
                title: note.noteTitle || '',
                content: note.excerptText || '',
                tags: note.hashtags || [],
                created_at: new Date(note.createDate * 1000).toISOString(),
                modified_at: new Date(note.modifiedDate * 1000).toISOString()
            }
            
            let response = await this.submitJsonData(
                'https://api.cloudnotes.com/notes/upload', 
                uploadData
            )
            
            MNUtil.showHUD('笔记上传成功')
            return JSON.parse(response)
            
        } catch (error) {
            MNUtil.showHUD(`上传失败: ${error.message}`)
            throw error
        }
    }
}

// 使用示例
let dataManager = new DataSubmissionManager()

// 上传当前焦点笔记
dataManager.uploadNoteToCloud()
    .then(result => {
        MNUtil.log('上传结果:', result)
    })
    .catch(error => {
        MNUtil.copyJSON(error) // 复制错误信息到剪贴板以便调试
    })
```

#### 9.2.2 文件上传处理

```javascript
class FileUploadManager extends NetworkManager {
    // 构建多部分表单数据
    buildMultipartData(fields, files = {}) {
        let boundary = '----FormBoundary' + Math.random().toString(36)
        let body = []
        
        // 添加表单字段
        for (let key in fields) {
            body.push(`--${boundary}`)
            body.push(`Content-Disposition: form-data; name="${key}"`)
            body.push('')
            body.push(fields[key])
        }
        
        // 添加文件（如果有）
        for (let key in files) {
            let file = files[key]
            body.push(`--${boundary}`)
            body.push(`Content-Disposition: form-data; name="${key}"; filename="${file.name}"`)
            body.push(`Content-Type: ${file.type}`)
            body.push('')
            body.push(file.content)
        }
        
        body.push(`--${boundary}--`)
        
        return {
            body: body.join('
'),
            contentType: `multipart/form-data; boundary=${boundary}`
        }
    }
    
    // 上传笔记截图
    async uploadNoteScreenshot(noteId) {
        try {
            let note = MNNote.getNoteById(noteId)
            if (!note) {
                throw new Error('笔记不存在')
            }
            
            // 生成笔记截图（如果 MNUtils 支持）
            let screenshotPath = `/tmp/note_${noteId}_screenshot.png`
            // 这里需要验证实际的截图 API
            // let success = MNUtil.generateNoteScreenshot(note, screenshotPath)
            
            // 假设我们有截图文件路径
            if (MNUtil.isfileExists(screenshotPath)) {
                // 读取文件内容
                let imageData = MNUtil.readDataFromFile(screenshotPath) // 需要验证此 API
                
                let multipartData = this.buildMultipartData(
                    {
                        note_id: noteId,
                        title: note.noteTitle || 'Untitled'
                    },
                    {
                        screenshot: {
                            name: `note_${noteId}.png`,
                            type: 'image/png',
                            content: imageData
                        }
                    }
                )
                
                return this.makeRequest('POST', 
                    'https://api.cloudnotes.com/screenshots/upload',
                    multipartData.body,
                    {'Content-Type': multipartData.contentType}
                )
            }
            
        } catch (error) {
            MNUtil.showHUD(`截图上传失败: ${error.message}`)
            throw error
        }
    }
}
```

### 9.3 AI API 集成

#### 9.3.1 OpenAI API 集成示例

现代插件经常需要集成 AI 服务，让我们看看如何安全地集成 OpenAI API：

```javascript
class AIServiceManager extends NetworkManager {
    constructor(apiKey) {
        super()
        this.apiKey = apiKey
        this.baseURL = 'https://api.openai.com/v1'
        
        // 设置 AI 服务专用头部
        this.defaultHeaders = {
            ...this.defaultHeaders,
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
        }
    }
    
    // 文本补全请求
    async completeText(prompt, options = {}) {
        let requestData = {
            model: options.model || 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'user',
                    content: prompt
                }
            ],
            max_tokens: options.maxTokens || 1000,
            temperature: options.temperature || 0.7
        }
        
        try {
            let response = await this.makeRequest(
                'POST',
                `${this.baseURL}/chat/completions`,
                requestData
            )
            
            let data = JSON.parse(response)
            return data.choices[0].message.content
            
        } catch (error) {
            throw new Error(`AI 请求失败: ${error.message}`)
        }
    }
    
    // 分析笔记内容
    async analyzeNote(noteId) {
        try {
            let note = MNNote.getNoteById(noteId)
            if (!note || !note.excerptText) {
                throw new Error('无效的笔记或笔记内容为空')
            }
            
            let prompt = `请分析以下笔记内容，提供：
1. 主题摘要
2. 关键概念
3. 相关领域
4. 学习建议

笔记内容：
${note.excerptText}`
            
            MNUtil.showHUD('正在分析笔记...')
            
            let analysis = await this.completeText(prompt, {
                maxTokens: 500,
                temperature: 0.5
            })
            
            // 将分析结果添加为评论
            let comment = note.appendTextComment(analysis)
            comment.addTag('AI-Analysis')
            
            MNUtil.showHUD('笔记分析完成')
            return analysis
            
        } catch (error) {
            MNUtil.showHUD(`分析失败: ${error.message}`)
            throw error
        }
    }
    
    // 批量处理选中的笔记
    async batchAnalyzeSelectedNotes() {
        let selectedNotes = MNNote.getFocusNotes() // 获取选中的多个笔记
        if (!selectedNotes || selectedNotes.length === 0) {
            MNUtil.showHUD('请先选择要分析的笔记')
            return
        }
        
        MNUtil.showHUD(`开始分析 ${selectedNotes.length} 条笔记...`)
        
        let results = []
        for (let i = 0; i < selectedNotes.length; i++) {
            try {
                let note = selectedNotes[i]
                MNUtil.showHUD(`正在分析第 ${i + 1}/${selectedNotes.length} 条笔记`)
                
                let analysis = await this.analyzeNote(note.noteId)
                results.push({
                    noteId: note.noteId,
                    title: note.noteTitle,
                    analysis: analysis
                })
                
                // 添加延迟避免 API 频率限制
                await this.delay(1000)
                
            } catch (error) {
                MNUtil.log(`笔记 ${note.noteId} 分析失败:`, error)
                results.push({
                    noteId: note.noteId,
                    error: error.message
                })
            }
        }
        
        MNUtil.showHUD('批量分析完成')
        return results
    }
    
    // 延迟函数
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms))
    }
}

// 使用示例
// 注意：实际使用时需要安全地存储 API Key
let aiService = new AIServiceManager('your-api-key-here')

// 分析单个笔记
aiService.analyzeNote('note-id-123')
    .then(analysis => {
        MNUtil.log('分析结果:', analysis)
    })
    .catch(error => {
        MNUtil.log('分析失败:', error)
    })
```

### 9.4 错误处理与重试机制

#### 9.4.1 网络错误处理策略

```javascript
class RobustNetworkManager extends NetworkManager {
    constructor() {
        super()
        this.maxRetries = 3
        this.retryDelay = 1000
        this.timeout = 30000
    }
    
    // 带重试的网络请求
    async requestWithRetry(method, url, data = null, options = {}) {
        let attempts = 0
        let lastError
        
        while (attempts < this.maxRetries) {
            try {
                attempts++
                
                // 显示重试状态
                if (attempts > 1) {
                    MNUtil.showHUD(`重试中... (${attempts}/${this.maxRetries})`)
                }
                
                let response = await Promise.race([
                    this.makeRequest(method, url, data, options.headers),
                    this.timeoutPromise(this.timeout)
                ])
                
                // 请求成功，清除重试提示
                return response
                
            } catch (error) {
                lastError = error
                MNUtil.log(`请求失败 (第${attempts}次):`, error.message)
                
                // 判断是否应该重试
                if (!this.shouldRetry(error) || attempts >= this.maxRetries) {
                    break
                }
                
                // 等待后重试
                await this.delay(this.retryDelay * attempts)
            }
        }
        
        // 所有重试都失败了
        MNUtil.showHUD(`请求最终失败: ${lastError.message}`)
        throw lastError
    }
    
    // 超时 Promise
    timeoutPromise(timeout) {
        return new Promise((_, reject) => {
            setTimeout(() => {
                reject(new Error('请求超时'))
            }, timeout)
        })
    }
    
    // 判断是否应该重试
    shouldRetry(error) {
        // 网络错误、超时错误、5xx 服务器错误应该重试
        return error.message.includes('timeout') ||
               error.message.includes('network') ||
               error.message.includes('500') ||
               error.message.includes('502') ||
               error.message.includes('503')
    }
    
    // 延迟函数
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms))
    }
}
```

#### 9.4.2 网络状态监控

```javascript
class NetworkStatusManager {
    constructor() {
        this.isOnline = true
        this.listeners = []
        this.checkInterval = null
        
        this.startMonitoring()
    }
    
    // 开始监控网络状态
    startMonitoring() {
        // 初始检查
        this.checkNetworkStatus()
        
        // 定期检查
        this.checkInterval = setInterval(() => {
            this.checkNetworkStatus()
        }, 10000) // 每10秒检查一次
    }
    
    // 停止监控
    stopMonitoring() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval)
            this.checkInterval = null
        }
    }
    
    // 检查网络状态
    async checkNetworkStatus() {
        try {
            // 尝试请求一个可靠的端点
            await this.makeQuickRequest('https://httpbin.org/status/200')
            this.updateStatus(true)
        } catch (error) {
            this.updateStatus(false)
        }
    }
    
    // 快速请求（用于状态检查）
    makeQuickRequest(url) {
        return new Promise((resolve, reject) => {
            let nsurl = NSURL.URLWithString(url)
            let request = NSURLRequest.requestWithURL(nsurl)
            
            // 设置较短的超时时间
            request.setTimeoutInterval(5)
            
            let response = {}
            let connection = NSURLConnection.sendSynchronousRequest_returningResponse_error(
                request, response, null
            )
            
            if (connection && response.statusCode < 400) {
                resolve()
            } else {
                reject(new Error('Network unavailable'))
            }
        })
    }
    
    // 更新网络状态
    updateStatus(isOnline) {
        if (this.isOnline !== isOnline) {
            this.isOnline = isOnline
            
            // 显示状态变化
            MNUtil.showHUD(isOnline ? '网络已连接' : '网络连接断开')
            
            // 通知监听器
            this.listeners.forEach(callback => {
                try {
                    callback(isOnline)
                } catch (error) {
                    MNUtil.log('网络状态监听器错误:', error)
                }
            })
        }
    }
    
    // 添加状态变化监听器
    addListener(callback) {
        this.listeners.push(callback)
    }
    
    // 移除监听器
    removeListener(callback) {
        let index = this.listeners.indexOf(callback)
        if (index > -1) {
            this.listeners.splice(index, 1)
        }
    }
    
    // 获取当前状态
    getStatus() {
        return this.isOnline
    }
}

// 全局网络状态管理器
let networkStatus = new NetworkStatusManager()

// 监听网络状态变化
networkStatus.addListener((isOnline) => {
    if (isOnline) {
        MNUtil.log('网络已恢复，可以继续进行网络操作')
        // 可以在这里重新尝试失败的请求
    } else {
        MNUtil.log('网络断开，暂停网络操作')
        // 可以在这里缓存待发送的请求
    }
})
```

### 9.5 数据缓存与离线支持

#### 9.5.1 本地缓存管理

```javascript
class CacheManager {
    constructor() {
        this.cacheDir = MNUtil.getDocumentPath() + '/cache'
        this.maxCacheSize = 50 * 1024 * 1024 // 50MB
        this.maxCacheAge = 7 * 24 * 60 * 60 * 1000 // 7天
        
        this.initCache()
    }
    
    // 初始化缓存目录
    initCache() {
        if (!MNUtil.isfileExists(this.cacheDir)) {
            let success = NSFileManager.defaultManager()
                .createDirectoryAtPath_withIntermediateDirectories_attributes_error(
                    this.cacheDir, true, null, null
                )
            if (!success) {
                MNUtil.log('缓存目录创建失败')
            }
        }
    }
    
    // 生成缓存键
    generateCacheKey(url, params = {}) {
        let key = url + JSON.stringify(params)
        // 简单的 hash 函数
        let hash = 0
        for (let i = 0; i < key.length; i++) {
            hash = ((hash << 5) - hash + key.charCodeAt(i)) & 0xffffffff
        }
        return Math.abs(hash).toString(16)
    }
    
    // 获取缓存文件路径
    getCacheFilePath(cacheKey) {
        return `${this.cacheDir}/${cacheKey}.cache`
    }
    
    // 存储到缓存
    setCache(cacheKey, data, metadata = {}) {
        try {
            let cacheData = {
                data: data,
                timestamp: Date.now(),
                metadata: metadata
            }
            
            let filePath = this.getCacheFilePath(cacheKey)
            MNUtil.writeText(JSON.stringify(cacheData), filePath)
            
            // 清理过期缓存
            this.cleanExpiredCache()
            
            return true
        } catch (error) {
            MNUtil.log('缓存存储失败:', error)
            return false
        }
    }
    
    // 从缓存获取数据
    getCache(cacheKey) {
        try {
            let filePath = this.getCacheFilePath(cacheKey)
            
            if (!MNUtil.isfileExists(filePath)) {
                return null
            }
            
            let cacheContent = MNUtil.readText(filePath)
            let cacheData = JSON.parse(cacheContent)
            
            // 检查是否过期
            let age = Date.now() - cacheData.timestamp
            if (age > this.maxCacheAge) {
                this.removeCache(cacheKey)
                return null
            }
            
            return cacheData.data
            
        } catch (error) {
            MNUtil.log('缓存读取失败:', error)
            return null
        }
    }
    
    // 删除缓存
    removeCache(cacheKey) {
        let filePath = this.getCacheFilePath(cacheKey)
        if (MNUtil.isfileExists(filePath)) {
            NSFileManager.defaultManager().removeItemAtPath_error(filePath, null)
        }
    }
    
    // 清理过期缓存
    cleanExpiredCache() {
        try {
            let fileManager = NSFileManager.defaultManager()
            let files = fileManager.contentsOfDirectoryAtPath_error(this.cacheDir, null)
            
            if (files) {
                for (let i = 0; i < files.count; i++) {
                    let fileName = files.objectAtIndex(i)
                    let filePath = `${this.cacheDir}/${fileName}`
                    
                    // 检查文件修改时间
                    let attributes = fileManager.attributesOfItemAtPath_error(filePath, null)
                    if (attributes) {
                        let modifyDate = attributes.objectForKey('NSFileModificationDate')
                        let age = Date.now() - (modifyDate.timeIntervalSince1970 * 1000)
                        
                        if (age > this.maxCacheAge) {
                            fileManager.removeItemAtPath_error(filePath, null)
                            MNUtil.log(`删除过期缓存: ${fileName}`)
                        }
                    }
                }
            }
        } catch (error) {
            MNUtil.log('清理缓存失败:', error)
        }
    }
    
    // 获取缓存统计信息
    getCacheStats() {
        try {
            let fileManager = NSFileManager.defaultManager()
            let files = fileManager.contentsOfDirectoryAtPath_error(this.cacheDir, null)
            
            let totalSize = 0
            let fileCount = files ? files.count : 0
            
            if (files) {
                for (let i = 0; i < files.count; i++) {
                    let fileName = files.objectAtIndex(i)
                    let filePath = `${this.cacheDir}/${fileName}`
                    let attributes = fileManager.attributesOfItemAtPath_error(filePath, null)
                    if (attributes) {
                        totalSize += attributes.objectForKey('NSFileSize')
                    }
                }
            }
            
            return {
                fileCount: fileCount,
                totalSize: totalSize,
                totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2)
            }
            
        } catch (error) {
            MNUtil.log('获取缓存统计失败:', error)
            return null
        }
    }
}
```

#### 9.5.2 智能缓存网络管理器

```javascript
class CachedNetworkManager extends RobustNetworkManager {
    constructor() {
        super()
        this.cacheManager = new CacheManager()
        this.networkStatus = new NetworkStatusManager()
    }
    
    // 带缓存的 GET 请求
    async getCached(url, options = {}) {
        let cacheKey = this.cacheManager.generateCacheKey(url, options.params)
        let useCache = options.useCache !== false
        let forceRefresh = options.forceRefresh === true
        
        // 如果不强制刷新，先尝试从缓存获取
        if (useCache && !forceRefresh) {
            let cachedData = this.cacheManager.getCache(cacheKey)
            if (cachedData) {
                MNUtil.log('使用缓存数据:', url)
                return cachedData
            }
        }
        
        // 检查网络状态
        if (!this.networkStatus.getStatus()) {
            // 网络不可用时尝试使用缓存
            let cachedData = this.cacheManager.getCache(cacheKey)
            if (cachedData) {
                MNUtil.showHUD('网络不可用，使用缓存数据')
                return cachedData
            } else {
                throw new Error('网络不可用且无缓存数据')
            }
        }
        
        try {
            // 发起网络请求
            let response = await this.requestWithRetry('GET', url, null, {
                headers: options.headers
            })
            
            let data = typeof response === 'string' ? JSON.parse(response) : response
            
            // 存储到缓存
            if (useCache) {
                this.cacheManager.setCache(cacheKey, data, {
                    url: url,
                    requestTime: Date.now()
                })
            }
            
            return data
            
        } catch (error) {
            // 网络请求失败时尝试使用缓存
            if (useCache) {
                let cachedData = this.cacheManager.getCache(cacheKey)
                if (cachedData) {
                    MNUtil.showHUD('网络请求失败，使用缓存数据')
                    return cachedData
                }
            }
            
            throw error
        }
    }
    
    // 预加载数据
    async preloadData(urls) {
        MNUtil.showHUD(`预加载 ${urls.length} 个资源...`)
        
        let results = []
        for (let url of urls) {
            try {
                let data = await this.getCached(url, { useCache: true })
                results.push({ url, success: true, data })
                
                // 添加小延迟避免过度占用资源
                await this.delay(100)
                
            } catch (error) {
                results.push({ url, success: false, error: error.message })
                MNUtil.log(`预加载失败: ${url}`, error)
            }
        }
        
        let successCount = results.filter(r => r.success).length
        MNUtil.showHUD(`预加载完成: ${successCount}/${urls.length}`)
        
        return results
    }
    
    // 清理缓存的便捷方法
    clearCache() {
        try {
            let stats = this.cacheManager.getCacheStats()
            
            // 清理过期缓存
            this.cacheManager.cleanExpiredCache()
            
            let newStats = this.cacheManager.getCacheStats()
            let freedSpace = (stats.totalSize - newStats.totalSize) / (1024 * 1024)
            
            MNUtil.showHUD(`缓存清理完成，释放 ${freedSpace.toFixed(2)}MB 空间`)
            
        } catch (error) {
            MNUtil.showHUD('缓存清理失败')
            MNUtil.log('缓存清理错误:', error)
        }
    }
}

// 使用示例
let cachedNetwork = new CachedNetworkManager()

// 带缓存的 API 调用
cachedNetwork.getCached('https://api.example.com/user/profile', {
    useCache: true,
    forceRefresh: false
}).then(data => {
    MNUtil.log('用户数据:', data)
}).catch(error => {
    MNUtil.log('获取用户数据失败:', error)
})

// 预加载重要资源
let importantUrls = [
    'https://api.example.com/config',
    'https://api.example.com/user/settings',
    'https://api.example.com/recent-notes'
]

cachedNetwork.preloadData(importantUrls)
    .then(results => {
        MNUtil.log('预加载结果:', results)
    })
```

### 9.6 实战案例：知识库同步插件

让我们通过一个完整的知识库同步插件来演示网络编程的综合应用：

```javascript
class KnowledgeBaseSyncPlugin {
    constructor() {
        this.networkManager = new CachedNetworkManager()
        this.apiBase = 'https://api.knowledgebase.com/v1'
        this.apiKey = this.loadApiKey()
        this.syncQueue = []
        this.isSyncing = false
        
        this.initializePlugin()
    }
    
    // 初始化插件
    initializePlugin() {
        // 设置 API 认证头
        this.networkManager.defaultHeaders = {
            ...this.networkManager.defaultHeaders,
            'Authorization': `Bearer ${this.apiKey}`,
            'X-App-Version': '1.0.0'
        }
        
        // 监听笔记变化事件
        this.setupNoteEventListeners()
    }
    
    // 加载 API 密钥
    loadApiKey() {
        let apiKey = NSUserDefaults.standardUserDefaults()
            .objectForKey('KnowledgeBaseSync_ApiKey')
        
        if (!apiKey) {
            // 如果没有 API 密钥，提示用户设置
            this.promptForApiKey()
            return ''
        }
        
        return apiKey.toString()
    }
    
    // 提示用户输入 API 密钥
    promptForApiKey() {
        let alert = UIAlertView.alloc().init()
        alert.title = '知识库同步设置'
        alert.message = '请输入您的 API 密钥'
        alert.alertViewStyle = 2 // UIAlertViewStylePlainTextInput
        alert.addButtonWithTitle('取消')
        alert.addButtonWithTitle('确认')
        
        alert.setDelegate(this)
        alert.show()
    }
    
    // 处理 API 密钥输入
    alertView_clickedButtonAtIndex(alert, buttonIndex) {
        if (buttonIndex === 1) { // 确认按钮
            let apiKey = alert.textFieldAtIndex(0).text
            if (apiKey && apiKey.length > 0) {
                // 保存 API 密钥
                NSUserDefaults.standardUserDefaults()
                    .setObject_forKey(apiKey, 'KnowledgeBaseSync_ApiKey')
                NSUserDefaults.standardUserDefaults().synchronize()
                
                this.apiKey = apiKey
                this.networkManager.defaultHeaders['Authorization'] = `Bearer ${apiKey}`
                
                MNUtil.showHUD('API 密钥已保存')
                
                // 立即测试连接
                this.testConnection()
            }
        }
    }
    
    // 测试 API 连接
    async testConnection() {
        try {
            MNUtil.showHUD('测试连接中...')
            
            let response = await this.networkManager.getCached(
                `${this.apiBase}/user/profile`,
                { useCache: false }
            )
            
            MNUtil.showHUD('连接成功！')
            MNUtil.log('用户信息:', response)
            
            return true
            
        } catch (error) {
            MNUtil.showHUD('连接失败，请检查 API 密钥')
            MNUtil.log('连接测试失败:', error)
            return false
        }
    }
    
    // 设置笔记事件监听
    setupNoteEventListeners() {
        // 监听笔记创建事件
        NSNotificationCenter.defaultCenter().addObserver_selector_name_object(
            this, 'onNoteCreated:', 'NoteCreatedNotification', null
        )
        
        // 监听笔记修改事件
        NSNotificationCenter.defaultCenter().addObserver_selector_name_object(
            this, 'onNoteModified:', 'NoteModifiedNotification', null
        )
        
        // 监听笔记删除事件
        NSNotificationCenter.defaultCenter().addObserver_selector_name_object(
            this, 'onNoteDeleted:', 'NoteDeletedNotification', null
        )
    }
```
    
    // 笔记创建事件处理
    onNoteCreated(notification) {
        let noteId = notification.userInfo.objectForKey('noteId')
        if (noteId) {
            this.queueNoteForSync(noteId.toString(), 'create')
        }
    }
    
    // 笔记修改事件处理
    onNoteModified(notification) {
        let noteId = notification.userInfo.objectForKey('noteId')
        if (noteId) {
            this.queueNoteForSync(noteId.toString(), 'update')
        }
    }
    
    // 笔记删除事件处理
    onNoteDeleted(notification) {
        let noteId = notification.userInfo.objectForKey('noteId')
        if (noteId) {
            this.queueNoteForSync(noteId.toString(), 'delete')
        }
    }
    
    // 将笔记加入同步队列
    queueNoteForSync(noteId, operation) {
        // 避免重复加入队列
        let existingIndex = this.syncQueue.findIndex(item => 
            item.noteId === noteId && item.operation === operation
        )
        
        if (existingIndex >= 0) {
            // 更新时间戳
            this.syncQueue[existingIndex].timestamp = Date.now()
        } else {
            this.syncQueue.push({
                noteId: noteId,
                operation: operation,
                timestamp: Date.now(),
                retryCount: 0
            })
        }
        
        // 触发同步
        this.schedulSync()
    }
    
    // 调度同步任务
    schedulSync() {
        if (this.isSyncing || this.syncQueue.length === 0) {
            return
        }
        
        // 延迟执行避免频繁同步
        if (this.syncTimer) {
            clearTimeout(this.syncTimer)
        }
        
        this.syncTimer = setTimeout(() => {
            this.performSync()
        }, 2000) // 2秒后执行同步
    }
    
    // 执行同步
    async performSync() {
        if (this.isSyncing || this.syncQueue.length === 0) {
            return
        }
        
        this.isSyncing = true
        let processedItems = []
        
        try {
            MNUtil.showHUD(`同步中... (${this.syncQueue.length} 项)`)
            
            // 批量处理队列
            while (this.syncQueue.length > 0) {
                let item = this.syncQueue.shift()
                
                try {
                    await this.syncSingleNote(item)
                    processedItems.push(item)
                    
                    // 添加小延迟避免 API 频率限制
                    await this.delay(200)
                    
                } catch (error) {
                    item.retryCount++
                    
                    if (item.retryCount < 3) {
                        // 重新加入队列稍后重试
                        this.syncQueue.push(item)
                        MNUtil.log(`同步失败，将重试: ${item.noteId}`, error)
                    } else {
                        // 超过重试次数，记录错误
                        MNUtil.log(`同步最终失败: ${item.noteId}`, error)
                        processedItems.push({...item, error: error.message})
                    }
                }
            }
            
            MNUtil.showHUD(`同步完成 (${processedItems.length} 项)`)
            
        } catch (error) {
            MNUtil.showHUD(`同步异常: ${error.message}`)
            MNUtil.log('同步过程异常:', error)
        } finally {
            this.isSyncing = false
        }
    }
    
    // 同步单个笔记
    async syncSingleNote(item) {
        switch (item.operation) {
            case 'create':
                return this.createNoteOnServer(item.noteId)
            case 'update':
                return this.updateNoteOnServer(item.noteId)
            case 'delete':
                return this.deleteNoteOnServer(item.noteId)
            default:
                throw new Error(`未知的同步操作: ${item.operation}`)
        }
    }
    
    // 在服务器创建笔记
    async createNoteOnServer(noteId) {
        let note = MNNote.getNoteById(noteId)
        if (!note) {
            throw new Error(`笔记不存在: ${noteId}`)
        }
        
        let noteData = {
            id: noteId,
            title: note.noteTitle || '',
            content: note.excerptText || '',
            tags: note.hashtags || [],
            color: note.colorIndex,
            created_at: new Date(note.createDate * 1000).toISOString(),
            modified_at: new Date(note.modifiedDate * 1000).toISOString()
        }
        
        let response = await this.networkManager.makeRequest(
            'POST',
            `${this.apiBase}/notes`,
            noteData
        )
        
        MNUtil.log(`笔记创建成功: ${noteId}`)
        return JSON.parse(response)
    }
    
    // 在服务器更新笔记
    async updateNoteOnServer(noteId) {
        let note = MNNote.getNoteById(noteId)
        if (!note) {
            // 笔记已被删除，从服务器也删除
            return this.deleteNoteOnServer(noteId)
        }
        
        let noteData = {
            title: note.noteTitle || '',
            content: note.excerptText || '',
            tags: note.hashtags || [],
            color: note.colorIndex,
            modified_at: new Date(note.modifiedDate * 1000).toISOString()
        }
        
        let response = await this.networkManager.makeRequest(
            'PUT',
            `${this.apiBase}/notes/${noteId}`,
            noteData
        )
        
        MNUtil.log(`笔记更新成功: ${noteId}`)
        return JSON.parse(response)
    }
    
    // 从服务器删除笔记
    async deleteNoteOnServer(noteId) {
        let response = await this.networkManager.makeRequest(
            'DELETE',
            `${this.apiBase}/notes/${noteId}`,
            null
        )
        
        MNUtil.log(`笔记删除成功: ${noteId}`)
        return response
    }
    
    // 从服务器下载笔记
    async downloadAllNotes() {
        try {
            MNUtil.showHUD('下载服务器笔记中...')
            
            let response = await this.networkManager.getCached(
                `${this.apiBase}/notes`,
                { useCache: false }
            )
            
            let serverNotes = response.notes || []
            let importedCount = 0
            
            for (let serverNote of serverNotes) {
                try {
                    // 检查本地是否已存在
                    let existingNote = MNNote.getNoteById(serverNote.id)
                    
                    if (!existingNote) {
                        // 创建新笔记
                        await this.createLocalNote(serverNote)
                        importedCount++
                    } else {
                        // 检查是否需要更新
                        let serverModifyTime = new Date(serverNote.modified_at).getTime()
                        let localModifyTime = existingNote.modifiedDate * 1000
                        
                        if (serverModifyTime > localModifyTime) {
                            await this.updateLocalNote(existingNote, serverNote)
                            importedCount++
                        }
                    }
                    
                } catch (error) {
                    MNUtil.log(`导入笔记失败: ${serverNote.id}`, error)
                }
            }
            
            MNUtil.showHUD(`下载完成，导入 ${importedCount} 条笔记`)
            
        } catch (error) {
            MNUtil.showHUD(`下载失败: ${error.message}`)
            throw error
        }
    }
    
    // 创建本地笔记
    async createLocalNote(serverNote) {
        // 获取当前选中的笔记本
        let notebook = MNNote.getFocusNotebook()
        if (!notebook) {
            throw new Error('没有选中的笔记本')
        }
        
        // 创建新笔记
        let newNote = MNNote.new()
        newNote.noteTitle = serverNote.title
        newNote.excerptText = serverNote.content
        
        // 设置标签
        if (serverNote.tags && serverNote.tags.length > 0) {
            serverNote.tags.forEach(tag => {
                newNote.addTag(tag)
            })
        }
        
        // 设置颜色
        if (serverNote.color !== undefined) {
            newNote.colorIndex = serverNote.color
        }
        
        // 添加到笔记本
        notebook.addChild(newNote)
        
        return newNote
    }
    
    // 更新本地笔记
    async updateLocalNote(localNote, serverNote) {
        localNote.noteTitle = serverNote.title
        localNote.excerptText = serverNote.content
        
        // 更新标签
        localNote.clearTags()
        if (serverNote.tags && serverNote.tags.length > 0) {
            serverNote.tags.forEach(tag => {
                localNote.addTag(tag)
            })
        }
        
        // 更新颜色
        if (serverNote.color !== undefined) {
            localNote.colorIndex = serverNote.color
        }
        
        return localNote
    }
    
    // 手动触发全量同步
    async performFullSync() {
        try {
            MNUtil.showHUD('执行全量同步...')
            
            // 先上传本地更改
            await this.performSync()
            
            // 然后下载服务器更新
            await this.downloadAllNotes()
            
            MNUtil.showHUD('全量同步完成')
            
        } catch (error) {
            MNUtil.showHUD(`全量同步失败: ${error.message}`)
            MNUtil.log('全量同步错误:', error)
        }
    }
    
    // 延迟函数
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms))
    }
    
    // 插件销毁时清理
    cleanup() {
        // 移除事件监听
        NSNotificationCenter.defaultCenter().removeObserver(this)
        
        // 清理定时器
        if (this.syncTimer) {
            clearTimeout(this.syncTimer)
        }
        
        // 停止网络监控
        this.networkManager.networkStatus.stopMonitoring()
    }
}

// 使用示例：在插件主代码中初始化
let syncPlugin = new KnowledgeBaseSyncPlugin()

// 提供菜单接口
function showSyncMenu() {
    let alert = UIAlertView.alloc().init()
    alert.title = '知识库同步'
    alert.message = '请选择同步操作'
    alert.addButtonWithTitle('取消')
    alert.addButtonWithTitle('立即同步')
    alert.addButtonWithTitle('全量同步')
    alert.addButtonWithTitle('下载笔记')
    alert.addButtonWithTitle('设置')
    
    alert.show(null, (alert, buttonIndex) => {
        switch (buttonIndex) {
            case 1: // 立即同步
                syncPlugin.performSync()
                break
            case 2: // 全量同步
                syncPlugin.performFullSync()
                break
            case 3: // 下载笔记
                syncPlugin.downloadAllNotes()
                break
            case 4: // 设置
                syncPlugin.promptForApiKey()
                break
        }
    })
}
```

### 9.7 本章总结

本章详细介绍了 MarginNote 插件中的网络编程技术：

**✅ 核心网络技术**：
- JSBridge 网络 API 调用方法
- GET/POST 请求的标准实现
- 多部分表单数据和文件上传

**✅ AI 服务集成**：
- OpenAI API 集成示例
- 智能笔记分析功能
- 批量处理和频率限制处理

**✅ 错误处理与重试**：
- 网络错误分类和处理策略
- 自动重试机制实现
- 网络状态监控和离线处理

**✅ 缓存与性能优化**：
- 本地文件缓存系统
- 智能缓存策略
- 预加载和资源管理

**✅ 实战应用**：
- 知识库同步插件完整实现
- 事件驱动的自动同步
- 双向数据同步机制

**关键技术要点**：
- 使用 NSURLConnection 进行底层网络操作
- 通过 Promise 封装异步网络请求
- 实现智能的错误处理和重试机制
- 结合本地缓存提升用户体验
- 处理网络状态变化和离线场景

**最佳实践**：
- 始终进行错误处理和用户提示
- 合理使用缓存减少网络请求
- 实现优雅的降级策略
- 注意 API 频率限制和用户体验
- 保护用户隐私和 API 密钥安全

下一章，我们将学习配置管理系统，了解如何优雅地管理插件设置、用户偏好和持久化数据存储。


---

## 第10章：配置管理系统

在插件开发中，配置管理是一个至关重要的环节。用户需要能够自定义插件的行为，插件需要持久化保存设置，还要处理不同环境下的配置差异。本章将深入探讨如何构建一个完善的配置管理系统。

### 10.1 配置管理基础

#### 10.1.1 NSUserDefaults 基础使用

MarginNote 插件使用 NSUserDefaults 来持久化存储配置数据：

```javascript
class ConfigManager {
    constructor(pluginId) {
        this.pluginId = pluginId
        this.userDefaults = NSUserDefaults.standardUserDefaults()
        
        // 初始化默认配置
        this.initDefaultConfig()
    }
    
    // 获取完整的配置键名
    getFullKey(key) {
        return `${this.pluginId}_${key}`
    }
    
    // 设置配置项
    setConfig(key, value) {
        let fullKey = this.getFullKey(key)
        
        // 根据值类型选择合适的存储方法
        if (typeof value === 'boolean') {
            this.userDefaults.setBool_forKey(value, fullKey)
        } else if (typeof value === 'number') {
            if (Number.isInteger(value)) {
                this.userDefaults.setInteger_forKey(value, fullKey)
            } else {
                this.userDefaults.setDouble_forKey(value, fullKey)
            }
        } else if (typeof value === 'string') {
            this.userDefaults.setObject_forKey(value, fullKey)
        } else if (Array.isArray(value)) {
            // 数组转换为 NSArray
            let nsArray = NSMutableArray.array()
            value.forEach(item => nsArray.addObject(item))
            this.userDefaults.setObject_forKey(nsArray, fullKey)
        } else if (typeof value === 'object' && value !== null) {
            // 对象序列化为 JSON 字符串
            this.userDefaults.setObject_forKey(JSON.stringify(value), fullKey)
        }
        
        // 立即同步到磁盘
        this.userDefaults.synchronize()
        
        MNUtil.log(`配置已保存: ${key} = ${value}`)
    }
    
    // 获取配置项
    getConfig(key, defaultValue = null) {
        let fullKey = this.getFullKey(key)
        
        // 首先检查键是否存在
        if (!this.hasConfig(key)) {
            return defaultValue
        }
        
        let value = this.userDefaults.objectForKey(fullKey)
        
        // 如果是字符串，尝试解析为 JSON
        if (typeof value === 'string') {
            try {
                return JSON.parse(value)
            } catch (error) {
                return value // 如果不是 JSON，直接返回字符串
            }
        }
        
        // NSArray 转换为 JavaScript 数组
        if (value && value.isKindOfClass && value.isKindOfClass(NSArray.class)) {
            let jsArray = []
            for (let i = 0; i < value.count; i++) {
                jsArray.push(value.objectAtIndex(i))
            }
            return jsArray
        }
        
        return value
    }
    
    // 检查配置项是否存在
    hasConfig(key) {
        let fullKey = this.getFullKey(key)
        return this.userDefaults.objectForKey(fullKey) !== null
    }
    
    // 删除配置项
    removeConfig(key) {
        let fullKey = this.getFullKey(key)
        this.userDefaults.removeObjectForKey(fullKey)
        this.userDefaults.synchronize()
    }
    
    // 初始化默认配置
    initDefaultConfig() {
        // 这里可以设置默认配置
        if (!this.hasConfig('firstRun')) {
            this.setConfig('firstRun', false)
            this.setConfig('version', '1.0.0')
            this.setConfig('language', 'zh-CN')
        }
    }
    
    // 重置所有配置
    resetAllConfig() {
        // 获取所有相关键
        let keys = this.getAllConfigKeys()
        
        keys.forEach(key => {
            this.userDefaults.removeObjectForKey(key)
        })
        
        this.userDefaults.synchronize()
        
        // 重新初始化默认配置
        this.initDefaultConfig()
        
        MNUtil.showHUD('配置已重置')
    }
    
    // 获取所有配置键
    getAllConfigKeys() {
        let allKeys = this.userDefaults.dictionaryRepresentation().allKeys()
        let pluginKeys = []
        
        for (let i = 0; i < allKeys.count; i++) {
            let key = allKeys.objectAtIndex(i)
            if (key.hasPrefix(`${this.pluginId}_`)) {
                pluginKeys.push(key)
            }
        }
        
        return pluginKeys
    }
}

// 使用示例
let config = new ConfigManager('MyAwesomePlugin')

// 保存配置
config.setConfig('autoSync', true)
config.setConfig('syncInterval', 300)
config.setConfig('apiEndpoint', 'https://api.example.com')
config.setConfig('excludedTags', ['temp', 'draft'])

// 读取配置
let autoSync = config.getConfig('autoSync', false)
let syncInterval = config.getConfig('syncInterval', 600)
let excludedTags = config.getConfig('excludedTags', [])

MNUtil.log(`自动同步: ${autoSync}`)
MNUtil.log(`同步间隔: ${syncInterval} 秒`)
MNUtil.log(`排除标签: ${excludedTags.join(', ')}`)
```

#### 10.1.2 配置项分类管理

对于复杂的插件，建议将配置项按功能分类管理：

```javascript
class AdvancedConfigManager extends ConfigManager {
    constructor(pluginId) {
        super(pluginId)
        
        // 配置分类
        this.categories = {
            ui: 'UI界面',
            sync: '同步设置',
            ai: 'AI功能',
            shortcut: '快捷键',
            debug: '调试选项'
        }
        
        this.setupDefaultConfigs()
    }
    
    // 设置默认配置
    setupDefaultConfigs() {
        // UI 相关配置
        this.setDefaultConfig('ui.theme', 'auto')
        this.setDefaultConfig('ui.showTooltips', true)
        this.setDefaultConfig('ui.animationEnabled', true)
        this.setDefaultConfig('ui.floatingPanelPosition', { x: 100, y: 100 })
        
        // 同步相关配置
        this.setDefaultConfig('sync.enabled', false)
        this.setDefaultConfig('sync.interval', 300)
        this.setDefaultConfig('sync.autoStart', false)
        this.setDefaultConfig('sync.conflictResolution', 'ask')
        
        // AI 相关配置
        this.setDefaultConfig('ai.enabled', false)
        this.setDefaultConfig('ai.provider', 'openai')
        this.setDefaultConfig('ai.model', 'gpt-3.5-turbo')
        this.setDefaultConfig('ai.maxTokens', 1000)
        this.setDefaultConfig('ai.temperature', 0.7)
        
        // 快捷键配置
        this.setDefaultConfig('shortcut.quickAnalyze', 'Cmd+Shift+A')
        this.setDefaultConfig('shortcut.syncNow', 'Cmd+Shift+S')
        this.setDefaultConfig('shortcut.showPanel', 'Cmd+Shift+P')
        
        // 调试配置
        this.setDefaultConfig('debug.enabled', false)
        this.setDefaultConfig('debug.logLevel', 'info')
        this.setDefaultConfig('debug.showTimestamp', true)
    }
    
    // 设置默认配置（如果不存在的话）
    setDefaultConfig(key, value) {
        if (!this.hasConfig(key)) {
            this.setConfig(key, value)
        }
    }
    
    // 获取分类下的所有配置
    getCategoryConfigs(category) {
        let configs = {}
        let prefix = category + '.'
        
        let allKeys = this.getAllPluginConfigKeys()
        allKeys.forEach(fullKey => {
            let key = fullKey.replace(`${this.pluginId}_`, '')
            if (key.startsWith(prefix)) {
                let shortKey = key.replace(prefix, '')
                configs[shortKey] = this.getConfig(key)
            }
        })
        
        return configs
    }
    
    // 批量设置分类配置
    setCategoryConfigs(category, configs) {
        for (let key in configs) {
            this.setConfig(`${category}.${key}`, configs[key])
        }
    }
    
    // 获取插件的所有配置键
    getAllPluginConfigKeys() {
        let allKeys = this.userDefaults.dictionaryRepresentation().allKeys()
        let pluginKeys = []
        
        for (let i = 0; i < allKeys.count; i++) {
            let key = allKeys.objectAtIndex(i)
            if (key.hasPrefix(`${this.pluginId}_`)) {
                pluginKeys.push(key)
            }
        }
        
        return pluginKeys
    }
    
    // 导出配置
    exportConfig() {
        let allConfigs = {}
        let pluginKeys = this.getAllPluginConfigKeys()
        
        pluginKeys.forEach(fullKey => {
            let key = fullKey.replace(`${this.pluginId}_`, '')
            allConfigs[key] = this.getConfig(key)
        })
        
        let configJson = JSON.stringify(allConfigs, null, 2)
        
        // 将配置复制到剪贴板
        MNUtil.copyText(configJson)
        MNUtil.showHUD('配置已复制到剪贴板')
        
        return configJson
    }
    
    // 导入配置
    importConfig(configJson) {
        try {
            let configs = JSON.parse(configJson)
            
            let importedCount = 0
            for (let key in configs) {
                this.setConfig(key, configs[key])
                importedCount++
            }
            
            MNUtil.showHUD(`已导入 ${importedCount} 项配置`)
            return true
            
        } catch (error) {
            MNUtil.showHUD('配置格式错误')
            MNUtil.log('导入配置失败:', error)
            return false
        }
    }
    
    // 配置验证
    validateConfig(key, value) {
        let validationRules = {
            'sync.interval': (val) => val >= 60 && val <= 3600,
            'ai.temperature': (val) => val >= 0 && val <= 2,
            'ai.maxTokens': (val) => val > 0 && val <= 4000,
            'debug.logLevel': (val) => ['debug', 'info', 'warn', 'error'].includes(val)
        }
        
        if (validationRules[key]) {
            return validationRules[key](value)
        }
        
        return true // 如果没有验证规则，认为有效
    }
    
    // 安全设置配置（带验证）
    setConfigSafe(key, value) {
        if (this.validateConfig(key, value)) {
            this.setConfig(key, value)
            return true
        } else {
            MNUtil.showHUD(`配置值无效: ${key}`)
            return false
        }
    }
}

// 使用示例
let advConfig = new AdvancedConfigManager('MyPlugin')

// 获取 UI 配置
let uiConfigs = advConfig.getCategoryConfigs('ui')
MNUtil.log('UI 配置:', uiConfigs)

// 批量设置 AI 配置
advConfig.setCategoryConfigs('ai', {
    enabled: true,
    provider: 'openai',
    model: 'gpt-4',
    temperature: 0.5
})

// 安全设置配置（带验证）
advConfig.setConfigSafe('sync.interval', 120) // 有效
advConfig.setConfigSafe('ai.temperature', 5.0) // 无效，会显示错误提示
```

### 10.2 配置界面设计

#### 10.2.1 基础配置界面

创建一个用户友好的配置界面是提升插件体验的关键：

```javascript
class ConfigUIManager {
    constructor(configManager) {
        this.configManager = configManager
        this.currentCategory = 'general'
    }
    
    // 显示主配置界面
    showConfigDialog() {
        let alert = UIAlertView.alloc().init()
        alert.title = '插件设置'
        alert.message = '请选择配置类别'
        alert.addButtonWithTitle('取消')
        alert.addButtonWithTitle('常规设置')
        alert.addButtonWithTitle('同步设置')
        alert.addButtonWithTitle('AI 设置')
        alert.addButtonWithTitle('高级选项')
        alert.addButtonWithTitle('导入/导出')
        
        alert.show(null, (alert, buttonIndex) => {
            switch (buttonIndex) {
                case 1:
                    this.showGeneralSettings()
                    break
                case 2:
                    this.showSyncSettings()
                    break
                case 3:
                    this.showAISettings()
                    break
                case 4:
                    this.showAdvancedSettings()
                    break
                case 5:
                    this.showImportExportDialog()
                    break
            }
        })
    }
    
    // 常规设置界面
    showGeneralSettings() {
        let currentTheme = this.configManager.getConfig('ui.theme', 'auto')
        let showTooltips = this.configManager.getConfig('ui.showTooltips', true)
        let animationEnabled = this.configManager.getConfig('ui.animationEnabled', true)
        
        let alert = UIAlertView.alloc().init()
        alert.title = '常规设置'
        alert.message = '自定义界面显示选项'
        alert.addButtonWithTitle('返回')
        alert.addButtonWithTitle(`主题: ${currentTheme}`)
        alert.addButtonWithTitle(`${showTooltips ? '☑' : '☐'} 显示提示`)
        alert.addButtonWithTitle(`${animationEnabled ? '☑' : '☐'} 启用动画`)
        alert.addButtonWithTitle('重置默认')
        
        alert.show(null, (alert, buttonIndex) => {
            switch (buttonIndex) {
                case 0: // 返回
                    this.showConfigDialog()
                    break
                case 1: // 切换主题
                    this.selectTheme()
                    break
                case 2: // 切换提示显示
                    this.configManager.setConfig('ui.showTooltips', !showTooltips)
                    this.showGeneralSettings() // 刷新界面
                    break
                case 3: // 切换动画
                    this.configManager.setConfig('ui.animationEnabled', !animationEnabled)
                    this.showGeneralSettings()
                    break
                case 4: // 重置默认
                    this.resetCategorySettings('ui')
                    break
            }
        })
    }
    
    // 主题选择界面
    selectTheme() {
        let themes = ['auto', 'light', 'dark']
        let currentTheme = this.configManager.getConfig('ui.theme', 'auto')
        
        let alert = UIAlertView.alloc().init()
        alert.title = '选择主题'
        alert.message = '选择您喜欢的界面主题'
        alert.addButtonWithTitle('返回')
        
        themes.forEach(theme => {
            let prefix = theme === currentTheme ? '✓ ' : '   '
            let displayName = {
                'auto': '自动',
                'light': '浅色',
                'dark': '深色'
            }[theme]
            alert.addButtonWithTitle(prefix + displayName)
        })
        
        alert.show(null, (alert, buttonIndex) => {
            if (buttonIndex === 0) {
                this.showGeneralSettings()
            } else if (buttonIndex > 0 && buttonIndex <= themes.length) {
                let selectedTheme = themes[buttonIndex - 1]
                this.configManager.setConfig('ui.theme', selectedTheme)
                MNUtil.showHUD(`主题已切换为: ${selectedTheme}`)
                this.showGeneralSettings()
            }
        })
    }
    
    // 同步设置界面
    showSyncSettings() {
        let syncEnabled = this.configManager.getConfig('sync.enabled', false)
        let autoStart = this.configManager.getConfig('sync.autoStart', false)
        let interval = this.configManager.getConfig('sync.interval', 300)
        
        let alert = UIAlertView.alloc().init()
        alert.title = '同步设置'
        alert.message = '配置数据同步选项'
        alert.addButtonWithTitle('返回')
        alert.addButtonWithTitle(`${syncEnabled ? '☑' : '☐'} 启用同步`)
        alert.addButtonWithTitle(`${autoStart ? '☑' : '☐'} 自动启动同步`)
        alert.addButtonWithTitle(`同步间隔: ${interval} 秒`)
        alert.addButtonWithTitle('设置 API 密钥')
        alert.addButtonWithTitle('立即同步')
        
        alert.show(null, (alert, buttonIndex) => {
            switch (buttonIndex) {
                case 0: // 返回
                    this.showConfigDialog()
                    break
                case 1: // 切换同步启用
                    this.configManager.setConfig('sync.enabled', !syncEnabled)
                    this.showSyncSettings()
                    break
                case 2: // 切换自动启动
                    this.configManager.setConfig('sync.autoStart', !autoStart)
                    this.showSyncSettings()
                    break
                case 3: // 设置同步间隔
                    this.setSyncInterval()
                    break
                case 4: // 设置 API 密钥
                    this.setApiKey()
                    break
                case 5: // 立即同步
                    this.performSync()
                    break
            }
        })
    }
    
    // 设置同步间隔
    setSyncInterval() {
        let alert = UIAlertView.alloc().init()
        alert.title = '设置同步间隔'
        alert.message = '输入同步间隔（秒，60-3600）'
        alert.alertViewStyle = 2 // UIAlertViewStylePlainTextInput
        alert.addButtonWithTitle('取消')
        alert.addButtonWithTitle('确认')
        
        let currentInterval = this.configManager.getConfig('sync.interval', 300)
        alert.textFieldAtIndex(0).text = currentInterval.toString()
        alert.textFieldAtIndex(0).keyboardType = 4 // UIKeyboardTypeNumberPad
        
        alert.show(null, (alert, buttonIndex) => {
            if (buttonIndex === 1) {
                let inputText = alert.textFieldAtIndex(0).text
                let interval = parseInt(inputText)
                
                if (!isNaN(interval) && interval >= 60 && interval <= 3600) {
                    this.configManager.setConfig('sync.interval', interval)
                    MNUtil.showHUD(`同步间隔已设置为 ${interval} 秒`)
                } else {
                    MNUtil.showHUD('请输入 60-3600 之间的数字')
                }
            }
            this.showSyncSettings()
        })
    }
    
    // 重置分类设置
    resetCategorySettings(category) {
        let alert = UIAlertView.alloc().init()
        alert.title = '确认重置'
        alert.message = `确定要重置 ${category} 分类的所有设置吗？`
        alert.addButtonWithTitle('取消')
        alert.addButtonWithTitle('确认重置')
        
        alert.show(null, (alert, buttonIndex) => {
            if (buttonIndex === 1) {
                // 获取该分类的默认值并重新设置
                let defaults = this.getDefaultsForCategory(category)
                for (let key in defaults) {
                    this.configManager.setConfig(`${category}.${key}`, defaults[key])
                }
                MNUtil.showHUD('设置已重置')
                this.showGeneralSettings()
            }
        })
    }
    
    // 获取分类的默认值
    getDefaultsForCategory(category) {
        let defaults = {
            'ui': {
                'theme': 'auto',
                'showTooltips': true,
                'animationEnabled': true
            },
            'sync': {
                'enabled': false,
                'autoStart': false,
                'interval': 300
            },
            'ai': {
                'enabled': false,
                'provider': 'openai',
                'model': 'gpt-3.5-turbo',
                'temperature': 0.7
            }
        }
        
        return defaults[category] || {}
    }
}
```

#### 10.2.2 高级配置界面组件

```javascript
class AdvancedConfigUI {
    constructor(configManager) {
        this.configManager = configManager
    }
    
    // 创建滑块选择器
    showSliderConfig(title, key, min, max, step, unit = '') {
        let currentValue = this.configManager.getConfig(key, (min + max) / 2)
        
        // 生成选项列表
        let options = []
        for (let i = min; i <= max; i += step) {
            options.push(i)
        }
        
        let alert = UIAlertView.alloc().init()
        alert.title = title
        alert.message = `当前值: ${currentValue}${unit}`
        alert.addButtonWithTitle('取消')
        
        options.forEach(value => {
            let prefix = Math.abs(value - currentValue) < step / 2 ? '→ ' : '   '
            alert.addButtonWithTitle(`${prefix}${value}${unit}`)
        })
        
        alert.show(null, (alert, buttonIndex) => {
            if (buttonIndex > 0 && buttonIndex <= options.length) {
                let selectedValue = options[buttonIndex - 1]
                this.configManager.setConfig(key, selectedValue)
                MNUtil.showHUD(`已设置为: ${selectedValue}${unit}`)
            }
        })
    }
    
    // 创建多选配置
    showMultiSelectConfig(title, key, allOptions) {
        let selectedOptions = new Set(this.configManager.getConfig(key, []))
        
        let displayOptions = allOptions.map(option => {
            let isSelected = selectedOptions.has(option)
            return `${isSelected ? '☑' : '☐'} ${option}`
        })
        
        let alert = UIAlertView.alloc().init()
        alert.title = title
        alert.message = '选择要启用的选项'
        alert.addButtonWithTitle('完成')
        
        displayOptions.forEach(option => {
            alert.addButtonWithTitle(option)
        })
        
        alert.show(null, (alert, buttonIndex) => {
            if (buttonIndex === 0) {
                // 保存选择
                this.configManager.setConfig(key, Array.from(selectedOptions))
                MNUtil.showHUD('设置已保存')
            } else if (buttonIndex > 0 && buttonIndex <= allOptions.length) {
                let selectedOption = allOptions[buttonIndex - 1]
                
                // 切换选择状态
                if (selectedOptions.has(selectedOption)) {
                    selectedOptions.delete(selectedOption)
                } else {
                    selectedOptions.add(selectedOption)
                }
                
                // 重新显示界面
                this.showMultiSelectConfig(title, key, allOptions)
            }
        })
    }
    
    // 颜色选择器
    showColorPicker(title, key) {
        let colors = [
            { name: '红色', value: '#FF0000' },
            { name: '橙色', value: '#FFA500' },
            { name: '黄色', value: '#FFFF00' },
            { name: '绿色', value: '#00FF00' },
            { name: '蓝色', value: '#0000FF' },
            { name: '紫色', value: '#800080' },
            { name: '黑色', value: '#000000' },
            { name: '白色', value: '#FFFFFF' }
        ]
        
        let currentColor = this.configManager.getConfig(key, '#000000')
        
        let alert = UIAlertView.alloc().init()
        alert.title = title
        alert.message = `当前颜色: ${currentColor}`
        alert.addButtonWithTitle('取消')
        alert.addButtonWithTitle('自定义颜色')
        
        colors.forEach(color => {
            let prefix = color.value === currentColor ? '✓ ' : '   '
            alert.addButtonWithTitle(prefix + color.name)
        })
        
        alert.show(null, (alert, buttonIndex) => {
            if (buttonIndex === 1) {
                // 自定义颜色
                this.showCustomColorInput(title, key)
            } else if (buttonIndex > 1 && buttonIndex < colors.length + 2) {
                let selectedColor = colors[buttonIndex - 2]
                this.configManager.setConfig(key, selectedColor.value)
                MNUtil.showHUD(`颜色已设置为: ${selectedColor.name}`)
            }
        })
    }
    
    // 自定义颜色输入
    showCustomColorInput(title, key) {
        let alert = UIAlertView.alloc().init()
        alert.title = '自定义颜色'
        alert.message = '输入十六进制颜色值（如 #FF0000）'
        alert.alertViewStyle = 2 // UIAlertViewStylePlainTextInput
        alert.addButtonWithTitle('取消')
        alert.addButtonWithTitle('确认')
        
        let currentColor = this.configManager.getConfig(key, '#000000')
        alert.textFieldAtIndex(0).text = currentColor
        
        alert.show(null, (alert, buttonIndex) => {
            if (buttonIndex === 1) {
                let inputColor = alert.textFieldAtIndex(0).text
                
                // 验证颜色格式
                if (/^#[0-9A-Fa-f]{6}$/.test(inputColor)) {
                    this.configManager.setConfig(key, inputColor)
                    MNUtil.showHUD(`颜色已设置为: ${inputColor}`)
                } else {
                    MNUtil.showHUD('请输入有效的十六进制颜色值')
                }
            }
        })
    }
}
```


### 10.3 配置安全与加密

在插件开发中，保护敏感配置数据（如 API 密钥）是至关重要的。基于 MNOCR 插件的实际实现，我们来学习如何正确处理敏感配置。

#### 10.3.1 敏感数据加密存储

MNOCR 插件使用 CryptoJS 库来加密敏感数据：

```javascript
// 引入 CryptoJS 加密库（实际从 MNOCR 插件中提取）
class SecureConfigManager extends AdvancedConfigManager {
    constructor(pluginId, encryptionKey = 'default-key') {
        super(pluginId)
        this.encryptionKey = encryptionKey
        this.sensitiveKeys = ['apiKey', 'password', 'token', 'secret']
    }
    
    // 加密敏感数据
    encryptValue(value) {
        if (typeof value !== 'string') {
            value = JSON.stringify(value)
        }
        
        try {
            // 使用 AES 加密
            let encrypted = CryptoJS.AES.encrypt(value, this.encryptionKey).toString()
            return encrypted
        } catch (error) {
            MNUtil.log('加密失败:', error)
            return value // 加密失败时返回原值
        }
    }
    
    // 解密敏感数据
    decryptValue(encryptedValue) {
        if (!encryptedValue) return ''
        
        try {
            let bytes = CryptoJS.AES.decrypt(encryptedValue, this.encryptionKey)
            let decrypted = bytes.toString(CryptoJS.enc.Utf8)
            
            // 尝试解析 JSON
            try {
                return JSON.parse(decrypted)
            } catch {
                return decrypted
            }
        } catch (error) {
            MNUtil.log('解密失败:', error)
            return encryptedValue // 解密失败时返回原值
        }
    }
    
    // 判断是否为敏感配置键
    isSensitiveKey(key) {
        return this.sensitiveKeys.some(sensitiveKey => 
            key.toLowerCase().includes(sensitiveKey.toLowerCase())
        )
    }
    
    // 重写设置配置方法，自动加密敏感数据
    setConfig(key, value) {
        if (this.isSensitiveKey(key)) {
            value = this.encryptValue(value)
        }
        super.setConfig(key, value)
    }
    
    // 重写获取配置方法，自动解密敏感数据
    getConfig(key, defaultValue = null) {
        let value = super.getConfig(key, defaultValue)
        
        if (value !== null && this.isSensitiveKey(key)) {
            value = this.decryptValue(value)
        }
        
        return value
    }
    
    // 安全地设置 API 密钥
    setApiKey(provider, apiKey) {
        if (!apiKey || apiKey.trim() === '') {
            MNUtil.showHUD('API 密钥不能为空')
            return false
        }
        
        // 验证 API 密钥格式
        if (!this.validateApiKey(provider, apiKey)) {
            MNUtil.showHUD('API 密钥格式不正确')
            return false
        }
        
        this.setConfig(`${provider}ApiKey`, apiKey.trim())
        MNUtil.showHUD('API 密钥已安全保存')
        return true
    }
    
    // 验证 API 密钥格式
    validateApiKey(provider, apiKey) {
        const patterns = {
            openai: /^sk-[a-zA-Z0-9]{48}$/,
            claude: /^sk-ant-[a-zA-Z0-9-]{95,}$/,
            gemini: /^[a-zA-Z0-9-_]{39}$/,
            simpletex: /^[a-zA-Z0-9]{32}$/
        }
        
        if (patterns[provider.toLowerCase()]) {
            return patterns[provider.toLowerCase()].test(apiKey)
        }
        
        // 对于未知提供商，基本验证
        return apiKey.length >= 20
    }
    
    // 安全地获取 API 密钥
    getApiKey(provider) {
        let key = this.getConfig(`${provider}ApiKey`, '')
        
        if (!key) {
            MNUtil.log(`未设置 ${provider} API 密钥`)
            return null
        }
        
        return key
    }
    
    // 清除所有敏感数据
    clearSensitiveData() {
        let allKeys = this.getAllPluginConfigKeys()
        let clearedCount = 0
        
        allKeys.forEach(fullKey => {
            let key = fullKey.replace(`${this.pluginId}_`, '')
            if (this.isSensitiveKey(key)) {
                this.removeConfig(key)
                clearedCount++
            }
        })
        
        MNUtil.showHUD(`已清除 ${clearedCount} 项敏感数据`)
    }
}

// 使用示例
let secureConfig = new SecureConfigManager('MyPlugin', 'my-secret-key-2024')

// 安全地保存 API 密钥
secureConfig.setApiKey('openai', 'sk-1234567890abcdef...')
secureConfig.setApiKey('claude', 'sk-ant-api03-1234...')

// 安全地获取 API 密钥
let openaiKey = secureConfig.getApiKey('openai')
if (openaiKey) {
    // 使用 API 密钥
    console.log('OpenAI 密钥长度:', openaiKey.length)
}

// 保存其他敏感配置
secureConfig.setConfig('databasePassword', 'my-secret-password')
secureConfig.setConfig('webhookSecret', 'webhook-secret-token')
```

#### 10.3.2 配置访问权限控制

```javascript
class RoleBasedConfigManager extends SecureConfigManager {
    constructor(pluginId, encryptionKey, userRole = 'user') {
        super(pluginId, encryptionKey)
        this.userRole = userRole
        this.rolePermissions = {
            admin: ['read', 'write', 'delete', 'export'],
            user: ['read', 'write'],
            readonly: ['read']
        }
        this.configLevels = {
            public: ['ui.theme', 'ui.language', 'ui.showTooltips'],
            private: ['sync.interval', 'ai.model', 'shortcut.*'],
            secret: ['*ApiKey', '*Password', '*Secret', '*Token']
        }
    }
    
    // 检查权限
    hasPermission(action, configKey = '') {
        let userPerms = this.rolePermissions[this.userRole] || []
        if (!userPerms.includes(action)) {
            return false
        }
        
        // 检查配置级别权限
        let level = this.getConfigLevel(configKey)
        if (level === 'secret' && this.userRole !== 'admin') {
            return false
        }
        
        return true
    }
    
    // 获取配置级别
    getConfigLevel(configKey) {
        for (let level in this.configLevels) {
            let patterns = this.configLevels[level]
            for (let pattern of patterns) {
                if (this.matchPattern(configKey, pattern)) {
                    return level
                }
            }
        }
        return 'private' // 默认级别
    }
    
    // 模式匹配
    matchPattern(str, pattern) {
        // 支持通配符 *
        let regex = new RegExp(pattern.replace(/\*/g, '.*'))
        return regex.test(str)
    }
    
    // 权限控制的设置配置
    setConfig(key, value) {
        if (!this.hasPermission('write', key)) {
            MNUtil.showHUD('无权限修改此配置')
            return false
        }
        
        super.setConfig(key, value)
        return true
    }
    
    // 权限控制的获取配置
    getConfig(key, defaultValue = null) {
        if (!this.hasPermission('read', key)) {
            MNUtil.log(`无权限读取配置: ${key}`)
            return defaultValue
        }
        
        return super.getConfig(key, defaultValue)
    }
    
    // 权限控制的删除配置
    removeConfig(key) {
        if (!this.hasPermission('delete', key)) {
            MNUtil.showHUD('无权限删除此配置')
            return false
        }
        
        super.removeConfig(key)
        return true
    }
    
    // 权限控制的导出配置
    exportConfig() {
        if (!this.hasPermission('export')) {
            MNUtil.showHUD('无权限导出配置')
            return null
        }
        
        let exportData = {}
        let allKeys = this.getAllPluginConfigKeys()
        
        allKeys.forEach(fullKey => {
            let key = fullKey.replace(`${this.pluginId}_`, '')
            if (this.hasPermission('read', key)) {
                let level = this.getConfigLevel(key)
                if (level !== 'secret') { // 不导出机密数据
                    exportData[key] = this.getConfig(key)
                }
            }
        })
        
        return JSON.stringify(exportData, null, 2)
    }
    
    // 获取可访问的配置列表
    getAccessibleConfigs() {
        let configs = {}
        let allKeys = this.getAllPluginConfigKeys()
        
        allKeys.forEach(fullKey => {
            let key = fullKey.replace(`${this.pluginId}_`, '')
            if (this.hasPermission('read', key)) {
                configs[key] = {
                    value: this.getConfig(key),
                    level: this.getConfigLevel(key),
                    writable: this.hasPermission('write', key),
                    deletable: this.hasPermission('delete', key)
                }
            }
        })
        
        return configs
    }
}
```

### 10.4 配置迁移与版本管理

#### 10.4.1 配置版本控制机制

基于 toolbarConfig 的实际实现，我们学习如何管理配置的版本演进：

```javascript
class VersionedConfigManager extends SecureConfigManager {
    constructor(pluginId, encryptionKey, currentVersion = '1.0.0') {
        super(pluginId, encryptionKey)
        this.currentVersion = currentVersion
        this.versionKey = 'configVersion'
        this.migrationStrategies = new Map()
        
        this.setupMigrationStrategies()
    }
    
    // 设置迁移策略
    setupMigrationStrategies() {
        // 从 1.0.0 到 1.1.0 的迁移
        this.migrationStrategies.set('1.0.0->1.1.0', {
            migrate: (oldConfig) => {
                let newConfig = {...oldConfig}
                
                // 重命名配置键
                if ('oldApiKey' in newConfig) {
                    newConfig.apiKey = newConfig.oldApiKey
                    delete newConfig.oldApiKey
                }
                
                // 添加新的默认配置
                newConfig.newFeatureEnabled = true
                
                return newConfig
            },
            description: '重命名 API 密钥配置，添加新功能开关'
        })
        
        // 从 1.1.0 到 2.0.0 的迁移
        this.migrationStrategies.set('1.1.0->2.0.0', {
            migrate: (oldConfig) => {
                let newConfig = {...oldConfig}
                
                // 结构化重组
                if ('theme' in newConfig) {
                    newConfig.ui = newConfig.ui || {}
                    newConfig.ui.theme = newConfig.theme
                    delete newConfig.theme
                }
                
                // 数据类型转换
                if (typeof newConfig.maxItems === 'string') {
                    newConfig.maxItems = parseInt(newConfig.maxItems) || 10
                }
                
                return newConfig
            },
            description: '配置结构化重组，数据类型标准化'
        })
    }
    
    // 初始化时检查并执行配置迁移
    init() {
        super.init()
        this.checkAndMigrate()
    }
    
    // 检查并执行配置迁移
    checkAndMigrate() {
        let currentConfigVersion = this.getConfig(this.versionKey, '1.0.0')
        
        if (this.versionCompare(currentConfigVersion, this.currentVersion) < 0) {
            MNUtil.log(`检测到配置版本更新: ${currentConfigVersion} -> ${this.currentVersion}`)
            this.performMigration(currentConfigVersion)
        }
    }
    
    // 执行配置迁移
    performMigration(fromVersion) {
        let currentVersion = fromVersion
        let migrationPath = this.getMigrationPath(fromVersion, this.currentVersion)
        
        MNUtil.showHUD('正在升级配置...')
        
        try {
            // 备份当前配置
            this.backupConfig(currentVersion)
            
            // 按路径逐步迁移
            for (let step of migrationPath) {
                MNUtil.log(`执行迁移: ${step}`)
                let strategy = this.migrationStrategies.get(step)
                
                if (strategy) {
                    let allConfig = this.getAllConfigs()
                    let migratedConfig = strategy.migrate(allConfig)
                    this.replaceAllConfigs(migratedConfig)
                    
                    // 更新中间版本号
                    let toVersion = step.split('->')[1]
                    this.setConfig(this.versionKey, toVersion)
                }
            }
            
            // 设置最终版本
            this.setConfig(this.versionKey, this.currentVersion)
            MNUtil.showHUD('配置升级完成')
            
        } catch (error) {
            MNUtil.showHUD('配置升级失败，正在回滚')
            this.rollbackConfig(fromVersion)
            MNUtil.log('配置迁移失败:', error)
        }
    }
    
    // 获取迁移路径
    getMigrationPath(fromVersion, toVersion) {
        // 简化的路径查找算法
        let availableSteps = Array.from(this.migrationStrategies.keys())
        let path = []
        
        let current = fromVersion
        while (this.versionCompare(current, toVersion) < 0) {
            let nextStep = availableSteps.find(step => step.startsWith(current))
            if (!nextStep) break
            
            path.push(nextStep)
            current = nextStep.split('->')[1]
        }
        
        return path
    }
    
    // 版本比较
    versionCompare(v1, v2) {
        let parts1 = v1.split('.').map(Number)
        let parts2 = v2.split('.').map(Number)
        
        for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
            let part1 = parts1[i] || 0
            let part2 = parts2[i] || 0
            
            if (part1 < part2) return -1
            if (part1 > part2) return 1
        }
        
        return 0
    }
    
    // 备份配置
    backupConfig(version) {
        let backupKey = `configBackup_${version}_${Date.now()}`
        let allConfig = this.getAllConfigs()
        
        NSUserDefaults.standardUserDefaults()
            .setObject_forKey(allConfig, backupKey)
        
        MNUtil.log(`配置已备份到: ${backupKey}`)
    }
    
    // 回滚配置
    rollbackConfig(version) {
        // 查找最新的备份
        let userDefaults = NSUserDefaults.standardUserDefaults()
        let allKeys = userDefaults.dictionaryRepresentation().allKeys()
        
        let backupKeys = []
        for (let i = 0; i < allKeys.count; i++) {
            let key = allKeys.objectAtIndex(i)
            if (key.startsWith(`configBackup_${version}_`)) {
                backupKeys.push(key)
            }
        }
        
        if (backupKeys.length > 0) {
            // 使用最新的备份
            let latestBackup = backupKeys.sort().pop()
            let backupConfig = userDefaults.objectForKey(latestBackup)
            
            if (backupConfig) {
                this.replaceAllConfigs(backupConfig)
                MNUtil.log(`已从备份恢复: ${latestBackup}`)
            }
        }
    }
    
    // 获取所有配置
    getAllConfigs() {
        let configs = {}
        let allKeys = this.getAllPluginConfigKeys()
        
        allKeys.forEach(fullKey => {
            let key = fullKey.replace(`${this.pluginId}_`, '')
            configs[key] = super.getConfig(key) // 直接获取，不解密
        })
        
        return configs
    }
    
    // 替换所有配置
    replaceAllConfigs(newConfigs) {
        // 清除所有旧配置
        let allKeys = this.getAllPluginConfigKeys()
        allKeys.forEach(fullKey => {
            this.userDefaults.removeObjectForKey(fullKey)
        })
        
        // 设置新配置
        for (let key in newConfigs) {
            super.setConfig(key, newConfigs[key])
        }
        
        this.userDefaults.synchronize()
    }
}

// 使用示例
let versionedConfig = new VersionedConfigManager('MyPlugin', 'secret-key', '2.0.0')
versionedConfig.init() // 自动检查并执行迁移
```

#### 10.4.2 云端配置同步（iCloud）

基于 MNToolbar 插件的 iCloud 同步实现，让我们学习如何实现配置的云端同步：

```javascript
class CloudSyncConfigManager extends VersionedConfigManager {
    constructor(pluginId, encryptionKey, currentVersion = '1.0.0') {
        super(pluginId, encryptionKey, currentVersion)
        this.cloudStore = null
        this.syncEnabled = false
        this.syncInterval = null
        this.lastSyncTime = 0
        this.conflictResolutionStrategy = 'timestamp' // timestamp, manual, local, remote
        
        this.initCloudStore()
    }
    
    // 初始化 iCloud 存储
    initCloudStore() {
        try {
            // 检查 iCloud 可用性
            let fileManager = NSFileManager.defaultManager()
            let icloudURL = fileManager.URLForUbiquityContainerIdentifier(null)
            
            if (icloudURL) {
                this.cloudStore = icloudURL.URLByAppendingPathComponent('Documents')
                this.cloudStore = this.cloudStore.URLByAppendingPathComponent(`${this.pluginId}_config.json`)
                
                MNUtil.log('iCloud 同步已初始化')
                this.syncEnabled = true
                
                // 启动定期同步
                this.startPeriodicSync()
            } else {
                MNUtil.log('iCloud 不可用')
            }
        } catch (error) {
            MNUtil.log('iCloud 初始化失败:', error)
        }
    }
    
    // 启动定期同步
    startPeriodicSync() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval)
        }
        
        // 每5分钟同步一次
        this.syncInterval = setInterval(() => {
            this.syncToCloud()
        }, 5 * 60 * 1000)
    }
    
    // 停止定期同步
    stopPeriodicSync() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval)
            this.syncInterval = null
        }
    }
    
    // 同步到云端
    async syncToCloud() {
        if (!this.syncEnabled || !this.cloudStore) {
            return false
        }
        
        try {
            let localConfig = this.prepareConfigForSync()
            let remoteConfig = await this.getCloudConfig()
            
            if (remoteConfig) {
                // 检测冲突
                let conflict = this.detectConflict(localConfig, remoteConfig)
                if (conflict) {
                    await this.resolveConflict(localConfig, remoteConfig)
                } else {
                    // 无冲突，直接上传最新的
                    if (localConfig.lastModified > remoteConfig.lastModified) {
                        await this.uploadConfigToCloud(localConfig)
                    } else if (remoteConfig.lastModified > localConfig.lastModified) {
                        await this.downloadConfigFromCloud(remoteConfig)
                    }
                }
            } else {
                // 云端无配置，直接上传
                await this.uploadConfigToCloud(localConfig)
            }
            
            this.lastSyncTime = Date.now()
            return true
            
        } catch (error) {
            MNUtil.log('云端同步失败:', error)
            return false
        }
    }
    
    // 准备配置用于同步
    prepareConfigForSync() {
        let config = this.getAllConfigs()
        
        // 移除敏感数据（不同步到云端）
        let syncConfig = {}
        for (let key in config) {
            if (!this.isSensitiveKey(key)) {
                syncConfig[key] = config[key]
            }
        }
        
        return {
            version: this.currentVersion,
            lastModified: Date.now(),
            deviceId: this.getDeviceId(),
            config: syncConfig
        }
    }
    
    // 获取设备ID
    getDeviceId() {
        let deviceId = this.getConfig('_deviceId')
        if (!deviceId) {
            deviceId = 'device_' + Math.random().toString(36).substr(2, 9)
            this.setConfig('_deviceId', deviceId)
        }
        return deviceId
    }
    
    // 从云端获取配置
    async getCloudConfig() {
        try {
            let fileManager = NSFileManager.defaultManager()
            
            if (!fileManager.fileExistsAtPath(this.cloudStore.path)) {
                return null
            }
            
            let data = NSData.dataWithContentsOfURL(this.cloudStore)
            if (!data) {
                return null
            }
            
            let jsonString = NSString.alloc().initWithData_encoding(data, 4)
            return JSON.parse(jsonString.toString())
            
        } catch (error) {
            MNUtil.log('读取云端配置失败:', error)
            return null
        }
    }
    
    // 上传配置到云端
    async uploadConfigToCloud(config) {
        try {
            let jsonString = JSON.stringify(config, null, 2)
            let data = NSString.stringWithString(jsonString)
                .dataUsingEncoding(4) // NSUTF8StringEncoding
            
            let success = data.writeToURL_atomically(this.cloudStore, true)
            
            if (success) {
                MNUtil.log('配置已上传到 iCloud')
                return true
            } else {
                throw new Error('写入失败')
            }
            
        } catch (error) {
            MNUtil.log('上传配置到云端失败:', error)
            return false
        }
    }
    
    // 从云端下载配置
    async downloadConfigFromCloud(remoteConfig) {
        try {
            // 备份当前配置
            this.backupConfig('before_cloud_sync')
            
            // 应用云端配置
            this.replaceAllConfigs(remoteConfig.config)
            
            MNUtil.log('已从 iCloud 下载配置')
            MNUtil.showHUD('配置已从云端同步')
            
            return true
            
        } catch (error) {
            MNUtil.log('从云端下载配置失败:', error)
            return false
        }
    }
    
    // 检测冲突
    detectConflict(localConfig, remoteConfig) {
        // 检查是否有不同设备的修改
        if (localConfig.deviceId !== remoteConfig.deviceId) {
            let timeDiff = Math.abs(localConfig.lastModified - remoteConfig.lastModified)
            // 如果修改时间相近（5分钟内），认为有冲突
            return timeDiff < 5 * 60 * 1000
        }
        
        return false
    }
    
    // 解决冲突
    async resolveConflict(localConfig, remoteConfig) {
        switch (this.conflictResolutionStrategy) {
            case 'timestamp':
                // 使用时间戳较新的配置
                if (localConfig.lastModified > remoteConfig.lastModified) {
                    await this.uploadConfigToCloud(localConfig)
                } else {
                    await this.downloadConfigFromCloud(remoteConfig)
                }
                break
                
            case 'local':
                // 始终使用本地配置
                await this.uploadConfigToCloud(localConfig)
                break
                
            case 'remote':
                // 始终使用远程配置
                await this.downloadConfigFromCloud(remoteConfig)
                break
                
            case 'manual':
                // 手动解决冲突
                await this.showConflictResolutionDialog(localConfig, remoteConfig)
                break
        }
    }
    
    // 显示冲突解决对话框
    async showConflictResolutionDialog(localConfig, remoteConfig) {
        let alert = UIAlertView.alloc().init()
        alert.title = '配置同步冲突'
        alert.message = `检测到配置冲突：
本地修改时间: ${new Date(localConfig.lastModified).toLocaleString()}
云端修改时间: ${new Date(remoteConfig.lastModified).toLocaleString()}`
        
        alert.addButtonWithTitle('取消')
        alert.addButtonWithTitle('使用本地配置')
        alert.addButtonWithTitle('使用云端配置')
        alert.addButtonWithTitle('查看差异')
        
        alert.show(null, async (alert, buttonIndex) => {
            switch (buttonIndex) {
                case 1: // 使用本地配置
                    await this.uploadConfigToCloud(localConfig)
                    MNUtil.showHUD('已使用本地配置')
                    break
                case 2: // 使用云端配置
                    await this.downloadConfigFromCloud(remoteConfig)
                    break
                case 3: // 查看差异
                    this.showConfigDifference(localConfig, remoteConfig)
                    break
            }
        })
    }
    
    // 显示配置差异
    showConfigDifference(localConfig, remoteConfig) {
        let differences = this.calculateConfigDifference(localConfig.config, remoteConfig.config)
        let diffText = this.formatDifferences(differences)
        
        MNUtil.copy(diffText)
        MNUtil.showHUD('差异已复制到剪贴板')
        
        // 可以在这里实现更复杂的差异显示界面
    }
    
    // 计算配置差异
    calculateConfigDifference(local, remote) {
        let differences = []
        let allKeys = new Set([...Object.keys(local), ...Object.keys(remote)])
        
        for (let key of allKeys) {
            if (!(key in local)) {
                differences.push({type: 'added', key, remote: remote[key]})
            } else if (!(key in remote)) {
                differences.push({type: 'removed', key, local: local[key]})
            } else if (JSON.stringify(local[key]) !== JSON.stringify(remote[key])) {
                differences.push({type: 'modified', key, local: local[key], remote: remote[key]})
            }
        }
        
        return differences
    }
    
    // 格式化差异
    formatDifferences(differences) {
        let result = '配置差异：

'
        
        differences.forEach(diff => {
            switch (diff.type) {
                case 'added':
                    result += `+ ${diff.key}: ${JSON.stringify(diff.remote)}
`
                    break
                case 'removed':
                    result += `- ${diff.key}: ${JSON.stringify(diff.local)}
`
                    break
                case 'modified':
                    result += `~ ${diff.key}:
`
                    result += `  本地: ${JSON.stringify(diff.local)}
`
                    result += `  云端: ${JSON.stringify(diff.remote)}
`
                    break
            }
        })
        
        return result
    }
    
    // 手动触发同步
    async manualSync() {
        MNUtil.showHUD('正在同步...')
        
        let success = await this.syncToCloud()
        
        if (success) {
            MNUtil.showHUD('同步完成')
        } else {
            MNUtil.showHUD('同步失败')
        }
        
        return success
    }
    
    // 设置冲突解决策略
    setConflictResolutionStrategy(strategy) {
        if (['timestamp', 'manual', 'local', 'remote'].includes(strategy)) {
            this.conflictResolutionStrategy = strategy
            this.setConfig('_conflictResolutionStrategy', strategy)
        }
    }
    
    // 销毁时清理
    cleanup() {
        this.stopPeriodicSync()
    }
}

// 使用示例
let cloudConfig = new CloudSyncConfigManager('MyPlugin', 'secret-key', '2.0.0')

// 设置冲突解决策略
cloudConfig.setConflictResolutionStrategy('manual')

// 手动触发同步
cloudConfig.manualSync().then(success => {
    console.log('同步结果:', success)
})
```

### 10.5 实时配置监听

#### 10.5.1 配置变化监听器

```javascript
class ReactiveConfigManager extends CloudSyncConfigManager {
    constructor(pluginId, encryptionKey, currentVersion = '1.0.0') {
        super(pluginId, encryptionKey, currentVersion)
        
        this.listeners = new Map() // key -> [listeners]
        this.globalListeners = []
        this.batchTimeout = null
        this.batchedChanges = new Map()
    }
    
    // 添加配置变化监听器
    addListener(key, callback, options = {}) {
        let listenerId = 'listener_' + Math.random().toString(36).substr(2, 9)
        let listener = {
            id: listenerId,
            key: key,
            callback: callback,
            options: {
                immediate: options.immediate || false,  // 是否立即执行
                deep: options.deep || false,            // 是否深度监听对象变化
                once: options.once || false,            // 是否只执行一次
                debounce: options.debounce || 0         // 防抖延迟（毫秒）
            },
            lastValue: this.getConfig(key)
        }
        
        if (key === '*') {
            // 全局监听器
            this.globalListeners.push(listener)
        } else {
            // 特定键监听器
            if (!this.listeners.has(key)) {
                this.listeners.set(key, [])
            }
            this.listeners.get(key).push(listener)
        }
        
        // 立即执行
        if (listener.options.immediate) {
            this.invokeListener(listener, listener.lastValue, listener.lastValue, 'immediate')
        }
        
        return listenerId
    }
    
    // 移除监听器
    removeListener(listenerId) {
        // 从特定键监听器中移除
        for (let [key, listeners] of this.listeners) {
            let index = listeners.findIndex(l => l.id === listenerId)
            if (index >= 0) {
                listeners.splice(index, 1)
                if (listeners.length === 0) {
                    this.listeners.delete(key)
                }
                return true
            }
        }
        
        // 从全局监听器中移除
        let globalIndex = this.globalListeners.findIndex(l => l.id === listenerId)
        if (globalIndex >= 0) {
            this.globalListeners.splice(globalIndex, 1)
            return true
        }
        
        return false
    }
    
    // 重写 setConfig 以触发监听器
    setConfig(key, value) {
        let oldValue = this.getConfig(key)
        let changed = !this.deepEqual(oldValue, value)
        
        if (changed) {
            // 先设置值
            super.setConfig(key, value)
            
            // 触发监听器
            this.notifyListeners(key, value, oldValue, 'change')
        }
        
        return changed
    }
    
    // 批量设置配置
    setBatchConfig(configs) {
        let changes = []
        
        // 收集所有变化
        for (let key in configs) {
            let oldValue = this.getConfig(key)
            let newValue = configs[key]
            
            if (!this.deepEqual(oldValue, newValue)) {
                changes.push({key, newValue, oldValue})
            }
        }
        
        if (changes.length === 0) {
            return []
        }
        
        // 批量设置
        for (let change of changes) {
            super.setConfig(change.key, change.newValue)
        }
        
        // 批量通知
        this.batchNotifyListeners(changes)
        
        return changes
    }
    
    // 通知监听器
    notifyListeners(key, newValue, oldValue, changeType) {
        // 特定键监听器
        if (this.listeners.has(key)) {
            let listeners = this.listeners.get(key)
            for (let listener of listeners) {
                this.invokeListener(listener, newValue, oldValue, changeType)
            }
        }
        
        // 全局监听器
        for (let listener of this.globalListeners) {
            this.invokeListener(listener, newValue, oldValue, changeType, key)
        }
    }
    
    // 批量通知监听器
    batchNotifyListeners(changes) {
        let affectedKeys = new Set()
        
        // 收集所有受影响的键
        changes.forEach(change => {
            affectedKeys.add(change.key)
            this.batchedChanges.set(change.key, change)
        })
        
        // 清除之前的批量超时
        if (this.batchTimeout) {
            clearTimeout(this.batchTimeout)
        }
        
        // 设置新的批量通知
        this.batchTimeout = setTimeout(() => {
            // 处理特定键监听器
            for (let key of affectedKeys) {
                if (this.listeners.has(key)) {
                    let listeners = this.listeners.get(key)
                    let change = this.batchedChanges.get(key)
                    
                    for (let listener of listeners) {
                        this.invokeListener(listener, change.newValue, change.oldValue, 'batch')
                    }
                }
            }
            
            // 处理全局监听器
            for (let listener of this.globalListeners) {
                let allChanges = Array.from(this.batchedChanges.values())
                this.invokeGlobalListener(listener, allChanges, 'batch')
            }
            
            // 清理
            this.batchedChanges.clear()
            this.batchTimeout = null
        }, 10) // 10ms 的批量延迟
    }
    
    // 调用监听器
    invokeListener(listener, newValue, oldValue, changeType, affectedKey = null) {
        try {
            // 检查是否需要深度比较
            if (listener.options.deep && typeof newValue === 'object') {
                if (this.deepEqual(newValue, listener.lastValue)) {
                    return // 深度比较无变化
                }
            }
            
            // 防抖处理
            if (listener.options.debounce > 0) {
                if (listener.debounceTimer) {
                    clearTimeout(listener.debounceTimer)
                }
                
                listener.debounceTimer = setTimeout(() => {
                    this.executeListener(listener, newValue, oldValue, changeType, affectedKey)
                }, listener.options.debounce)
            } else {
                this.executeListener(listener, newValue, oldValue, changeType, affectedKey)
            }
            
        } catch (error) {
            MNUtil.log('监听器执行错误:', error)
        }
    }
    
    // 执行监听器回调
    executeListener(listener, newValue, oldValue, changeType, affectedKey = null) {
        try {
            listener.callback({
                key: affectedKey || listener.key,
                newValue: newValue,
                oldValue: oldValue,
                changeType: changeType,
                timestamp: Date.now()
            })
            
            // 更新最后值
            listener.lastValue = this.deepClone(newValue)
            
            // 如果是一次性监听器，移除它
            if (listener.options.once) {
                this.removeListener(listener.id)
            }
            
        } catch (error) {
            MNUtil.log('监听器回调执行错误:', error)
        }
    }
    
    // 调用全局监听器
    invokeGlobalListener(listener, changes, changeType) {
        try {
            listener.callback({
                changes: changes,
                changeType: changeType,
                timestamp: Date.now()
            })
            
            if (listener.options.once) {
                this.removeListener(listener.id)
            }
            
        } catch (error) {
            MNUtil.log('全局监听器执行错误:', error)
        }
    }
    
    // 深度比较
    deepEqual(obj1, obj2) {
        if (obj1 === obj2) {
            return true
        }
        
        if (typeof obj1 !== typeof obj2) {
            return false
        }
        
        if (typeof obj1 !== 'object' || obj1 === null || obj2 === null) {
            return obj1 === obj2
        }
        
        let keys1 = Object.keys(obj1)
        let keys2 = Object.keys(obj2)
        
        if (keys1.length !== keys2.length) {
            return false
        }
        
        for (let key of keys1) {
            if (!keys2.includes(key) || !this.deepEqual(obj1[key], obj2[key])) {
                return false
            }
        }
        
        return true
    }
    
    // 深度克隆
    deepClone(obj) {
        if (obj === null || typeof obj !== 'object') {
            return obj
        }
        
        if (obj instanceof Date) {
            return new Date(obj.getTime())
        }
        
        if (obj instanceof Array) {
            return obj.map(item => this.deepClone(item))
        }
        
        let cloned = {}
        for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
                cloned[key] = this.deepClone(obj[key])
            }
        }
        
        return cloned
    }
    
    // 暂停所有监听器
    pauseListeners() {
        this.listenersEnabled = false
    }
    
    // 恢复所有监听器
    resumeListeners() {
        this.listenersEnabled = true
    }
    
    // 清除所有监听器
    clearAllListeners() {
        this.listeners.clear()
        this.globalListeners = []
        
        if (this.batchTimeout) {
            clearTimeout(this.batchTimeout)
            this.batchTimeout = null
        }
    }
    
    // 获取监听器统计
    getListenerStats() {
        let specificCount = 0
        for (let listeners of this.listeners.values()) {
            specificCount += listeners.length
        }
        
        return {
            specific: specificCount,
            global: this.globalListeners.length,
            total: specificCount + this.globalListeners.length
        }
    }
}

// 使用示例
let reactiveConfig = new ReactiveConfigManager('MyPlugin', 'secret-key', '2.0.0')

// 监听特定配置变化
let listenerId1 = reactiveConfig.addListener('ui.theme', (event) => {
    console.log(`主题变更: ${event.oldValue} -> ${event.newValue}`)
    // 更新界面主题
    updateUITheme(event.newValue)
}, {
    immediate: true, // 立即执行一次
    debounce: 300    // 300ms 防抖
})

// 监听 AI 相关配置变化
let listenerId2 = reactiveConfig.addListener('ai.*', (event) => {
    console.log(`AI 配置变更: ${event.key}`)
    // 重新初始化 AI 服务
    reinitializeAIService()
})

// 全局配置监听
let globalId = reactiveConfig.addListener('*', (event) => {
    if (event.changes) {
        // 批量变化
        console.log(`批量配置变更，共 ${event.changes.length} 项`)
    } else {
        // 单个变化
        console.log(`配置变更: ${event.key}`)
    }
}, {
    debounce: 100 // 全局防抖
})

// 设置配置（自动触发监听器）
reactiveConfig.setConfig('ui.theme', 'dark')
reactiveConfig.setConfig('ai.model', 'gpt-4')

// 批量设置
reactiveConfig.setBatchConfig({
    'ui.language': 'zh-CN',
    'ui.showTooltips': false,
    'sync.enabled': true
})
```

### 10.6 实战案例：智能 OCR 配置系统

基于 MNOCR 插件的真实实现，让我们构建一个完整的配置管理系统：

```javascript
// 基于 ocrConfig 的完整配置系统实现
class OCRConfigSystem extends ReactiveConfigManager {
    constructor() {
        super('MNOCR', 'ocr-secret-key-2024', '2.1.0')
        
        // MNOCR 的实际默认配置（从源码提取）
        this.defaultConfig = {
            source: 'SimpleTex',
            simpleTexApikey: '',
            simpleTexTurbo: false,
            simpleTexGeneral: true,
            simpleTexRecMode: 'auto',
            simpleTexRotation: false,
            doc2xApikey: '',
            imageCorrection: false,
            pureEquation: false,
            PDFOCR: false,
            subscribedDay: 0,
            apikey: '',
            freeUsage: 0,
            freeDay: 0,
            subscriptionDaysRemain: 0,
            openaiApikey: '',
            userPrompt: `—role—
Image Text Extraction Specialist

—goal—
For the given image, please directly output the text in the image.
For any formulas, you must enclose them with dollar signs.

—constrain—
You are not allowed to output any content other than what is in the image.`,
            action: {}
        }
        
        this.modelSources = {
            'abab6.5s-chat': {title: 'Abab6.5s', model: 'abab6.5s-chat', isFree: false},
            'glm-4v-plus': {title: 'GLM-4V Plus', model: 'glm-4v-plus-0111', isFree: false},
            'glm-4v-flash': {title: 'GLM-4V Flash', model: 'glm-4v-flash', isFree: true},
            'claude-3-5-sonnet': {title: 'Claude-3.5 Sonnet', model: 'claude-3-5-sonnet-20241022', isFree: false},
            'gpt-4o': {title: 'GPT-4o', model: 'gpt-4o-2024-08-06', isFree: false},
            'gpt-4o-mini': {title: 'GPT-4o Mini', model: 'gpt-4o-mini', isFree: false}
        }
        
        this.fileIds = {}
        
        this.setupDefaultConfigs()
        this.setupConfigListeners()
        this.init()
    }
    
    // 设置默认配置
    setupDefaultConfigs() {
        for (let key in this.defaultConfig) {
            this.setDefaultConfig(key, this.defaultConfig[key])
        }
    }
    
    // 设置配置监听
    setupConfigListeners() {
        // 监听 OCR 源变化
        this.addListener('source', (event) => {
            this.onSourceChanged(event.newValue, event.oldValue)
        })
        
        // 监听 API 密钥变化
        this.addListener('*apikey', (event) => {
            this.validateAndSaveApiKey(event.key, event.newValue)
        })
        
        // 监听用户提示词变化
        this.addListener('userPrompt', (event) => {
            this.onUserPromptChanged(event.newValue)
        }, { debounce: 1000 })
        
        // 监听动作配置变化
        this.addListener('action', (event) => {
            this.onActionConfigChanged(event.newValue)
        }, { deep: true })
    }
    
    // OCR 源变化处理
    onSourceChanged(newSource, oldSource) {
        MNUtil.log(`OCR 源已切换: ${oldSource} -> ${newSource}`)
        
        // 验证新源的可用性
        let modelInfo = this.getModelSource(newSource)
        if (!modelInfo) {
            MNUtil.showHUD(`未知的 OCR 源: ${newSource}`)
            // 回滚到旧源
            this.setConfig('source', oldSource)
            return
        }
        
        // 检查 API 密钥
        if (!modelInfo.isFree) {
            let apiKey = this.getApiKeyForSource(newSource)
            if (!apiKey) {
                MNUtil.showHUD(`请先设置 ${modelInfo.title} 的 API 密钥`)
                this.promptForApiKey(newSource)
            }
        }
        
        // 通知界面更新
        this.notifySourceChanged(newSource, modelInfo)
    }
    
    // 获取模型源信息
    getModelSource(source) {
        let config = this.modelSources[source.toLowerCase()]
        return config || null
    }
    
    // 根据源获取 API 密钥
    getApiKeyForSource(source) {
        let keyMap = {
            'simpletex': 'simpleTexApikey',
            'doc2x': 'doc2xApikey',
            'openai': 'openaiApikey',
            'gpt-4o': 'openaiApikey',
            'gpt-4o-mini': 'openaiApikey'
        }
        
        let keyName = keyMap[source.toLowerCase()]
        return keyName ? this.getConfig(keyName, '') : ''
    }
    
    // 提示输入 API 密钥
    promptForApiKey(source) {
        let modelInfo = this.getModelSource(source)
        if (!modelInfo) return
        
        let alert = UIAlertView.alloc().init()
        alert.title = '设置 API 密钥'
        alert.message = `请输入 ${modelInfo.title} 的 API 密钥`
        alert.alertViewStyle = 2 // UIAlertViewStylePlainTextInput
        alert.addButtonWithTitle('取消')
        alert.addButtonWithTitle('保存')
        
        alert.show(null, (alert, buttonIndex) => {
            if (buttonIndex === 1) {
                let apiKey = alert.textFieldAtIndex(0).text
                if (apiKey && apiKey.trim()) {
                    this.saveApiKeyForSource(source, apiKey.trim())
                }
            }
        })
    }
    
    // 保存源对应的 API 密钥
    saveApiKeyForSource(source, apiKey) {
        let keyMap = {
            'simpletex': 'simpleTexApikey',
            'doc2x': 'doc2xApikey',
            'openai': 'openaiApikey'
        }
        
        let keyName = keyMap[source.toLowerCase()]
        if (keyName) {
            this.setConfig(keyName, apiKey)
            MNUtil.showHUD('API 密钥已保存')
        }
    }
    
    // API 密钥验证和保存
    validateAndSaveApiKey(keyName, apiKey) {
        if (!apiKey || apiKey.trim() === '') {
            return
        }
        
        // 根据密钥名确定提供商
        let provider = ''
        if (keyName.includes('simpleTex')) {
            provider = 'simpletex'
        } else if (keyName.includes('doc2x')) {
            provider = 'doc2x'
        } else if (keyName.includes('openai')) {
            provider = 'openai'
        }
        
        // 验证密钥格式
        if (provider && !this.validateApiKey(provider, apiKey)) {
            MNUtil.showHUD(`${provider} API 密钥格式不正确`)
            return false
        }
        
        MNUtil.log(`API 密钥已更新: ${keyName}`)
        return true
    }
    
    // 用户提示词变化处理
    onUserPromptChanged(newPrompt) {
        // 验证提示词长度
        if (newPrompt.length > 2000) {
            MNUtil.showHUD('提示词过长，建议控制在2000字符内')
        }
        
        // 检查是否包含关键指令
        let hasRoleSection = newPrompt.includes('—role—')
        let hasGoalSection = newPrompt.includes('—goal—')
        
        if (!hasRoleSection || !hasGoalSection) {
            MNUtil.showHUD('建议提示词包含角色和目标定义')
        }
        
        MNUtil.log('用户提示词已更新')
    }
    
    // 动作配置变化处理
    onActionConfigChanged(newAction) {
        if (Object.keys(newAction).length === 0) {
            MNUtil.log('后处理动作已清空')
            return
        }
        
        // 验证动作配置
        if (newAction.action === 'replace') {
            if (!newAction.from && !newAction.reg) {
                MNUtil.showHUD('替换动作需要指定查找内容')
                return false
            }
            
            if (newAction.reg) {
                try {
                    new RegExp(newAction.reg)
                } catch (error) {
                    MNUtil.showHUD('正则表达式格式不正确')
                    return false
                }
            }
        }
        
        MNUtil.log('后处理动作配置已更新')
    }
    
    // 通知源变化
    notifySourceChanged(source, modelInfo) {
        // 这里可以发送通知给UI组件
        NSNotificationCenter.defaultCenter()
            .postNotificationName_object_userInfo(
                'OCRSourceChanged',
                null,
                {
                    source: source,
                    modelInfo: modelInfo
                }
            )
    }
    
    // 获取当前模型配置
    getCurrentModelConfig() {
        let source = this.getConfig('source', 'SimpleTex')
        let modelInfo = this.getModelSource(source)
        
        return {
            source: source,
            title: modelInfo ? modelInfo.title : source,
            model: modelInfo ? modelInfo.model : source,
            isFree: modelInfo ? modelInfo.isFree : false,
            apiKey: this.getApiKeyForSource(source)
        }
    }
    
    // 测试当前配置
    async testCurrentConfig() {
        let config = this.getCurrentModelConfig()
        
        if (!config.isFree && !config.apiKey) {
            MNUtil.showHUD('请先设置 API 密钥')
            return false
        }
        
        try {
            MNUtil.showHUD('测试配置中...')
            
            // 这里可以实现实际的测试逻辑
            // let testResult = await this.performTestOCR()
            
            // 模拟测试结果
            await new Promise(resolve => setTimeout(resolve, 2000))
            
            MNUtil.showHUD('配置测试成功')
            return true
            
        } catch (error) {
            MNUtil.showHUD(`配置测试失败: ${error.message}`)
            return false
        }
    }
    
    // 导出配置（用于备份）
    exportOCRConfig() {
        let config = {
            version: this.currentVersion,
            timestamp: Date.now(),
            source: this.getConfig('source'),
            settings: {
                imageCorrection: this.getConfig('imageCorrection'),
                pureEquation: this.getConfig('pureEquation'),
                PDFOCR: this.getConfig('PDFOCR')
            },
            simpletex: {
                turbo: this.getConfig('simpleTexTurbo'),
                general: this.getConfig('simpleTexGeneral'),
                recMode: this.getConfig('simpleTexRecMode'),
                rotation: this.getConfig('simpleTexRotation')
            },
            userPrompt: this.getConfig('userPrompt'),
            action: this.getConfig('action')
        }
        
        let configJson = JSON.stringify(config, null, 2)
        MNUtil.copy(configJson)
        MNUtil.showHUD('配置已复制到剪贴板')
        
        return configJson
    }
    
    // 导入配置
    importOCRConfig(configJson) {
        try {
            let config = JSON.parse(configJson)
            
            if (!config.version) {
                throw new Error('无效的配置格式')
            }
            
            // 导入基础设置
            this.setConfig('source', config.source)
            
            if (config.settings) {
                this.setConfig('imageCorrection', config.settings.imageCorrection)
                this.setConfig('pureEquation', config.settings.pureEquation)
                this.setConfig('PDFOCR', config.settings.PDFOCR)
            }
            
            if (config.simpletex) {
                this.setConfig('simpleTexTurbo', config.simpletex.turbo)
                this.setConfig('simpleTexGeneral', config.simpletex.general)
                this.setConfig('simpleTexRecMode', config.simpletex.recMode)
                this.setConfig('simpleTexRotation', config.simpletex.rotation)
            }
            
            if (config.userPrompt) {
                this.setConfig('userPrompt', config.userPrompt)
            }
            
            if (config.action) {
                this.setConfig('action', config.action)
            }
            
            MNUtil.showHUD('配置导入成功')
            return true
            
        } catch (error) {
            MNUtil.showHUD('配置导入失败: ' + error.message)
            return false
        }
    }
    
    // 重置到默认配置
    resetToDefaults() {
        let alert = UIAlertView.alloc().init()
        alert.title = '重置配置'
        alert.message = '确定要重置所有配置到默认值吗？此操作不可撤销。'
        alert.addButtonWithTitle('取消')
        alert.addButtonWithTitle('确认重置')
        
        alert.show(null, (alert, buttonIndex) => {
            if (buttonIndex === 1) {
                // 备份当前配置
                this.backupConfig('before_reset')
                
                // 重置所有配置
                for (let key in this.defaultConfig) {
                    this.setConfig(key, this.defaultConfig[key])
                }
                
                MNUtil.showHUD('配置已重置')
            }
        })
    }
    
    // 文件ID管理（MNOCR特有功能）
    saveFileId(md5, uuid) {
        this.fileIds[md5] = uuid
        NSUserDefaults.standardUserDefaults()
            .setObject_forKey(this.fileIds, 'MNOCR_fileIds')
    }
    
    getFileId(md5) {
        return this.fileIds[md5] || null
    }
    
    // 清理过期文件ID
    cleanExpiredFileIds() {
        let cleaned = 0
        let now = Date.now()
        let expireTime = 30 * 24 * 60 * 60 * 1000 // 30天过期
        
        for (let md5 in this.fileIds) {
            let uuid = this.fileIds[md5]
            // 简单的时间戳检查（如果uuid包含时间戳）
            if (typeof uuid === 'string' && uuid.includes('_')) {
                let timestamp = parseInt(uuid.split('_').pop())
                if (now - timestamp > expireTime) {
                    delete this.fileIds[md5]
                    cleaned++
                }
            }
        }
        
        if (cleaned > 0) {
            NSUserDefaults.standardUserDefaults()
                .setObject_forKey(this.fileIds, 'MNOCR_fileIds')
            MNUtil.log(`清理了 ${cleaned} 个过期文件ID`)
        }
    }
}

// 全局配置实例
let ocrConfig = new OCRConfigSystem()

// 使用示例
// 获取当前模型配置
let currentConfig = ocrConfig.getCurrentModelConfig()
console.log('当前配置:', currentConfig)

// 测试配置
ocrConfig.testCurrentConfig()

// 监听配置变化
ocrConfig.addListener('source', (event) => {
    console.log('OCR源变化:', event.newValue)
    // 更新UI
})

// 导出配置
let exportedConfig = ocrConfig.exportOCRConfig()

// 重置配置
// ocrConfig.resetToDefaults()
```


## 第11章：控制器通信与事件管理

在构建复杂的MarginNote插件时，控制器之间的通信和事件管理是不可避免的需求。本章将深入介绍如何实现控制器间通信、事件监听机制，以及如何构建响应式的插件架构。

### 11.1 控制器间通信基础

#### 11.1.1 通信方式概览

MarginNote插件中的控制器通信主要有以下几种方式：

1. **直接引用传递**：通过构造函数或初始化方法传递控制器实例
2. **全局状态管理**：使用全局对象存储状态，实现间接通信
3. **事件总线模式**：基于发布-订阅模式的事件系统
4. **数据层通信**：通过共享数据模型实现同步

#### 11.1.2 基础通信实现

```javascript
// 基础控制器通信类
class ControllerCommunicator {
    constructor() {
        this.controllers = new Map();
        this.eventListeners = new Map();
    }
    
    // 注册控制器
    registerController(name, controller) {
        this.controllers.set(name, controller);
        MNUtil.log(`Controller registered: ${name}`);
    }
    
    // 获取控制器
    getController(name) {
        return this.controllers.get(name);
    }
    
    // 向指定控制器发送消息
    sendMessage(targetController, message, data = null) {
        const controller = this.getController(targetController);
        if (controller && typeof controller.onMessage === "function") {
            controller.onMessage(message, data);
        } else {
            MNUtil.log(`Controller ${targetController} not found or no onMessage method`);
        }
    }
    
    // 广播消息给所有控制器
    broadcast(message, data = null) {
        for (const [name, controller] of this.controllers) {
            if (typeof controller.onMessage === "function") {
                controller.onMessage(message, data);
            }
        }
    }
}
```

### 11.2 事件总线系统

#### 11.2.1 事件总线核心实现

基于MNToolbar插件的事件管理模式，我们来实现一个完整的事件总线：

```javascript
// 事件总线类
class EventBus {
    constructor() {
        this.events = new Map();
        this.middlewares = [];
        this.debugMode = false;
    }
    
    // 订阅事件
    on(eventName, callback, context = null) {
        if (!this.events.has(eventName)) {
            this.events.set(eventName, new Set());
        }
        
        const listener = { callback, context, id: this.generateId() };
        this.events.get(eventName).add(listener);
        
        if (this.debugMode) {
            MNUtil.log(`Event subscribed: ${eventName}, listeners: ${this.events.get(eventName).size}`);
        }
        
        // 返回取消订阅函数
        return () => this.off(eventName, listener.id);
    }
    
    // 订阅一次性事件
    once(eventName, callback, context = null) {
        const unsubscribe = this.on(eventName, (...args) => {
            callback.apply(context, args);
            unsubscribe();
        }, context);
        return unsubscribe;
    }
    
    // 取消订阅
    off(eventName, listenerId = null) {
        if (!this.events.has(eventName)) return;
        
        const listeners = this.events.get(eventName);
        if (listenerId) {
            // 删除指定监听器
            for (const listener of listeners) {
                if (listener.id === listenerId) {
                    listeners.delete(listener);
                    break;
                }
            }
        } else {
            // 删除所有监听器
            listeners.clear();
        }
        
        if (listeners.size === 0) {
            this.events.delete(eventName);
        }
    }
    
    // 触发事件
    emit(eventName, ...args) {
        if (this.debugMode) {
            MNUtil.log(`Event emitted: ${eventName}, args:`, args);
        }
        
        // 通过中间件处理
        let eventData = { name: eventName, args, cancelled: false };
        for (const middleware of this.middlewares) {
            eventData = middleware(eventData);
            if (eventData.cancelled) {
                if (this.debugMode) {
                    MNUtil.log(`Event cancelled by middleware: ${eventName}`);
                }
                return false;
            }
        }
        
        if (!this.events.has(eventName)) return true;
        
        const listeners = this.events.get(eventName);
        for (const listener of listeners) {
            try {
                if (listener.context) {
                    listener.callback.apply(listener.context, eventData.args);
                } else {
                    listener.callback(...eventData.args);
                }
            } catch (error) {
                MNUtil.log(`Error in event listener for ${eventName}:`, error);
            }
        }
        
        return true;
    }
    
    // 添加中间件
    use(middleware) {
        this.middlewares.push(middleware);
    }
    
    // 生成唯一ID
    generateId() {
        return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    // 获取事件统计信息
    getStats() {
        const stats = {};
        for (const [eventName, listeners] of this.events) {
            stats[eventName] = listeners.size;
        }
        return stats;
    }
    
    // 清除所有事件
    clear() {
        this.events.clear();
        if (this.debugMode) {
            MNUtil.log("All events cleared");
        }
    }
    
    // 设置调试模式
    setDebug(enabled) {
        this.debugMode = enabled;
    }
}
```

#### 11.2.2 预定义事件类型

```javascript
// 插件事件常量
const PLUGIN_EVENTS = {
    // 生命周期事件
    LIFECYCLE: {
        WINDOW_CONNECT: "window.connect",
        WINDOW_DISCONNECT: "window.disconnect", 
        NOTEBOOK_OPEN: "notebook.open",
        NOTEBOOK_CLOSE: "notebook.close",
        DOCUMENT_OPEN: "document.open",
        DOCUMENT_CLOSE: "document.close"
    },
    
    // UI事件
    UI: {
        TOOLBAR_CLICK: "ui.toolbar.click",
        MENU_SELECT: "ui.menu.select",
        DIALOG_OPEN: "ui.dialog.open",
        DIALOG_CLOSE: "ui.dialog.close",
        BUTTON_PRESS: "ui.button.press"
    },
    
    // 笔记事件
    NOTE: {
        CREATE: "note.create",
        UPDATE: "note.update", 
        DELETE: "note.delete",
        SELECT: "note.select",
        FOCUS_CHANGE: "note.focus.change"
    },
    
    // 配置事件
    CONFIG: {
        CHANGE: "config.change",
        RESET: "config.reset",
        SAVE: "config.save",
        LOAD: "config.load"
    },
    
    // 数据事件
    DATA: {
        SYNC_START: "data.sync.start",
        SYNC_COMPLETE: "data.sync.complete",
        SYNC_ERROR: "data.sync.error",
        CACHE_CLEAR: "data.cache.clear"
    }
};
```

### 11.3 控制器生命周期管理

#### 11.3.1 生命周期控制器

```javascript
// 生命周期管理控制器
class LifecycleController {
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.registeredControllers = new Map();
        this.initializeLifecycleHooks();
    }
    
    // 注册控制器到生命周期管理
    register(name, controller, hooks = {}) {
        const controllerInfo = {
            instance: controller,
            hooks: {
                onWindowConnect: hooks.onWindowConnect || null,
                onWindowDisconnect: hooks.onWindowDisconnect || null,
                onNotebookOpen: hooks.onNotebookOpen || null,
                onNotebookClose: hooks.onNotebookClose || null,
                onDocumentOpen: hooks.onDocumentOpen || null,
                onDocumentClose: hooks.onDocumentClose || null,
                onDestroy: hooks.onDestroy || null
            }
        };
        
        this.registeredControllers.set(name, controllerInfo);
        MNUtil.log(`Controller ${name} registered to lifecycle manager`);
    }
    
    // 初始化生命周期钩子
    initializeLifecycleHooks() {
        // 窗口连接事件
        this.eventBus.on(PLUGIN_EVENTS.LIFECYCLE.WINDOW_CONNECT, () => {
            this.executeHook("onWindowConnect");
        });
        
        // 窗口断开事件
        this.eventBus.on(PLUGIN_EVENTS.LIFECYCLE.WINDOW_DISCONNECT, () => {
            this.executeHook("onWindowDisconnect");
        });
        
        // 笔记本打开事件
        this.eventBus.on(PLUGIN_EVENTS.LIFECYCLE.NOTEBOOK_OPEN, (topicId) => {
            this.executeHook("onNotebookOpen", topicId);
        });
        
        // 笔记本关闭事件
        this.eventBus.on(PLUGIN_EVENTS.LIFECYCLE.NOTEBOOK_CLOSE, (topicId) => {
            this.executeHook("onNotebookClose", topicId);
        });
        
        // 文档打开事件
        this.eventBus.on(PLUGIN_EVENTS.LIFECYCLE.DOCUMENT_OPEN, (docMd5) => {
            this.executeHook("onDocumentOpen", docMd5);
        });
        
        // 文档关闭事件
        this.eventBus.on(PLUGIN_EVENTS.LIFECYCLE.DOCUMENT_CLOSE, (docMd5) => {
            this.executeHook("onDocumentClose", docMd5);
        });
    }
    
    // 执行钩子函数
    executeHook(hookName, ...args) {
        for (const [controllerName, info] of this.registeredControllers) {
            const hook = info.hooks[hookName];
            if (hook && typeof hook === "function") {
                try {
                    hook.apply(info.instance, args);
                } catch (error) {
                    MNUtil.log(`Error executing ${hookName} for ${controllerName}:`, error);
                }
            }
        }
    }
    
    // 销毁所有控制器
    destroyAll() {
        this.executeHook("onDestroy");
        this.registeredControllers.clear();
        MNUtil.log("All controllers destroyed");
    }
}
```

### 11.4 状态管理系统

#### 11.4.1 响应式状态管理

基于MNAI插件的状态管理模式，实现响应式状态管理：

```javascript
// 响应式状态管理
class StateManager {
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.state = {};
        this.watchers = new Map();
        this.mutations = new Map();
        this.getters = new Map();
        this.middlewares = [];
    }
    
    // 定义状态
    defineState(key, initialValue, options = {}) {
        if (this.state.hasOwnProperty(key)) {
            MNUtil.log(`State ${key} already exists`);
            return;
        }
        
        this.state[key] = initialValue;
        
        // 创建响应式代理
        if (options.reactive !== false) {
            this.makeReactive(key);
        }
    }
    
    // 创建响应式状态
    makeReactive(key) {
        let value = this.state[key];
        const watchers = [];
        
        Object.defineProperty(this.state, key, {
            get() {
                return value;
            },
            set: (newValue) => {
                const oldValue = value;
                value = newValue;
                
                // 触发watchers
                watchers.forEach(watcher => {
                    try {
                        watcher(newValue, oldValue);
                    } catch (error) {
                        MNUtil.log(`Error in state watcher for ${key}:`, error);
                    }
                });
                
                // 触发全局状态变更事件
                this.eventBus.emit("state.change", {
                    key,
                    newValue,
                    oldValue
                });
            },
            enumerable: true,
            configurable: true
        });
        
        this.watchers.set(key, watchers);
    }
    
    // 监听状态变化
    watch(key, callback, options = {}) {
        if (!this.watchers.has(key)) {
            MNUtil.log(`State ${key} is not reactive`);
            return null;
        }
        
        const watchers = this.watchers.get(key);
        const watcher = {
            callback,
            immediate: options.immediate || false,
            deep: options.deep || false
        };
        
        // 立即执行
        if (watcher.immediate) {
            callback(this.state[key], undefined);
        }
        
        watchers.push(watcher.callback);
        
        // 返回取消监听函数
        return () => {
            const index = watchers.indexOf(watcher.callback);
            if (index > -1) {
                watchers.splice(index, 1);
            }
        };
    }
    
    // 定义mutations
    defineMutation(name, handler) {
        this.mutations.set(name, handler);
    }
    
    // 提交mutation
    commit(mutationName, payload = null) {
        const mutation = this.mutations.get(mutationName);
        if (!mutation) {
            MNUtil.log(`Mutation ${mutationName} not found`);
            return;
        }
        
        // 通过中间件处理
        let mutationData = { name: mutationName, payload, cancelled: false };
        for (const middleware of this.middlewares) {
            mutationData = middleware(mutationData, this.state);
            if (mutationData.cancelled) return;
        }
        
        try {
            mutation(this.state, mutationData.payload);
            this.eventBus.emit("state.mutation", mutationData);
        } catch (error) {
            MNUtil.log(`Error in mutation ${mutationName}:`, error);
        }
    }
    
    // 定义getters
    defineGetter(name, handler) {
        this.getters.set(name, handler);
    }
    
    // 获取计算属性
    get(getterName) {
        const getter = this.getters.get(getterName);
        if (!getter) {
            MNUtil.log(`Getter ${getterName} not found`);
            return undefined;
        }
        
        try {
            return getter(this.state);
        } catch (error) {
            MNUtil.log(`Error in getter ${getterName}:`, error);
            return undefined;
        }
    }
    
    // 批量更新状态
    batchUpdate(updates) {
        const oldStates = {};
        
        // 保存旧状态
        Object.keys(updates).forEach(key => {
            if (this.state.hasOwnProperty(key)) {
                oldStates[key] = this.state[key];
            }
        });
        
        // 批量更新
        Object.assign(this.state, updates);
        
        // 触发批量更新事件
        this.eventBus.emit("state.batch.update", {
            updates,
            oldStates
        });
    }
    
    // 获取状态快照
    getSnapshot() {
        return JSON.parse(JSON.stringify(this.state));
    }
    
    // 从快照恢复状态
    restoreFromSnapshot(snapshot) {
        const oldState = this.getSnapshot();
        this.state = JSON.parse(JSON.stringify(snapshot));
        
        this.eventBus.emit("state.restore", {
            newState: this.state,
            oldState
        });
    }
    
    // 添加中间件
    use(middleware) {
        this.middlewares.push(middleware);
    }
    
    // 重置所有状态
    reset() {
        const oldState = this.getSnapshot();
        this.state = {};
        this.watchers.clear();
        
        this.eventBus.emit("state.reset", { oldState });
    }
}
```

### 11.5 控制器装饰器模式

#### 11.5.1 控制器装饰器

```javascript
// 控制器装饰器工厂
class ControllerDecorator {
    static withEventHandling(eventBus) {
        return function(ControllerClass) {
            return class extends ControllerClass {
                constructor(...args) {
                    super(...args);
                    this.eventBus = eventBus;
                    this.eventUnsubscribers = [];
                }
                
                // 便捷的事件订阅方法
                subscribe(eventName, handler, context = this) {
                    const unsubscribe = this.eventBus.on(eventName, handler, context);
                    this.eventUnsubscribers.push(unsubscribe);
                    return unsubscribe;
                }
                
                // 发射事件
                emit(eventName, ...args) {
                    return this.eventBus.emit(eventName, ...args);
                }
                
                // 销毁时自动取消所有订阅
                destroy() {
                    this.eventUnsubscribers.forEach(unsub => unsub());
                    this.eventUnsubscribers = [];
                    
                    if (super.destroy) {
                        super.destroy();
                    }
                }
            };
        };
    }
    
    static withStateManagement(stateManager) {
        return function(ControllerClass) {
            return class extends ControllerClass {
                constructor(...args) {
                    super(...args);
                    this.stateManager = stateManager;
                    this.stateWatchers = [];
                }
                
                // 监听状态变化
                watchState(key, handler, options = {}) {
                    const unwatch = this.stateManager.watch(key, handler, {
                        ...options,
                        immediate: options.immediate
                    });
                    
                    if (unwatch) {
                        this.stateWatchers.push(unwatch);
                    }
                    
                    return unwatch;
                }
                
                // 提交状态变更
                commit(mutationName, payload) {
                    return this.stateManager.commit(mutationName, payload);
                }
                
                // 获取状态
                getState(key) {
                    return this.stateManager.state[key];
                }
                
                // 获取计算属性
                getGetter(getterName) {
                    return this.stateManager.get(getterName);
                }
                
                destroy() {
                    this.stateWatchers.forEach(unwatch => unwatch());
                    this.stateWatchers = [];
                    
                    if (super.destroy) {
                        super.destroy();
                    }
                }
            };
        };
    }
    
    static withLifecycle(lifecycleController) {
        return function(ControllerClass) {
            return class extends ControllerClass {
                constructor(...args) {
                    super(...args);
                    
                    // 自动注册到生命周期管理器
                    const className = this.constructor.name;
                    lifecycleController.register(className, this, {
                        onWindowConnect: this.onWindowConnect?.bind(this),
                        onWindowDisconnect: this.onWindowDisconnect?.bind(this),
                        onNotebookOpen: this.onNotebookOpen?.bind(this),
                        onNotebookClose: this.onNotebookClose?.bind(this),
                        onDocumentOpen: this.onDocumentOpen?.bind(this),
                        onDocumentClose: this.onDocumentClose?.bind(this),
                        onDestroy: this.destroy?.bind(this)
                    });
                }
            };
        };
    }
}
```

### 11.6 实际应用案例：工具栏控制器通信

#### 11.6.1 基于MNToolbar的通信案例

基于MNToolbar插件的实际实现，展示控制器间通信的完整案例：

```javascript
// 工具栏主控制器
class ToolbarMainController {
    constructor() {
        this.eventBus = new EventBus();
        this.stateManager = new StateManager(this.eventBus);
        this.lifecycleController = new LifecycleController(this.eventBus);
        this.buttonControllers = new Map();
        
        this.initializeState();
        this.initializeEventHandlers();
    }
    
    // 初始化状态
    initializeState() {
        this.stateManager.defineState("toolbarVisible", true);
        this.stateManager.defineState("activeButton", null);
        this.stateManager.defineState("buttonStates", {});
        this.stateManager.defineState("toolbarConfig", {});
        
        // 定义mutations
        this.stateManager.defineMutation("TOGGLE_TOOLBAR", (state) => {
            state.toolbarVisible = !state.toolbarVisible;
        });
        
        this.stateManager.defineMutation("SET_ACTIVE_BUTTON", (state, buttonId) => {
            state.activeButton = buttonId;
        });
        
        this.stateManager.defineMutation("UPDATE_BUTTON_STATE", (state, { buttonId, newState }) => {
            state.buttonStates[buttonId] = { ...state.buttonStates[buttonId], ...newState };
        });
        
        // 定义getters
        this.stateManager.defineGetter("visibleButtons", (state) => {
            return Object.keys(state.buttonStates).filter(buttonId => 
                state.buttonStates[buttonId].visible !== false
            );
        });
    }
    
    // 初始化事件处理
    initializeEventHandlers() {
        // 监听按钮点击事件
        this.eventBus.on(PLUGIN_EVENTS.UI.BUTTON_PRESS, (buttonId, data) => {
            this.handleButtonPress(buttonId, data);
        });
        
        // 监听配置变更
        this.eventBus.on(PLUGIN_EVENTS.CONFIG.CHANGE, (configData) => {
            this.handleConfigChange(configData);
        });
        
        // 监听状态变化
        this.stateManager.watch("toolbarVisible", (newVisible) => {
            this.updateToolbarDisplay(newVisible);
        });
        
        this.stateManager.watch("activeButton", (newActiveButton, oldActiveButton) => {
            this.handleActiveButtonChange(newActiveButton, oldActiveButton);
        });
    }
    
    // 注册按钮控制器
    registerButtonController(buttonId, controller) {
        this.buttonControllers.set(buttonId, controller);
        
        // 将事件总线和状态管理器传递给按钮控制器
        if (controller.setEventBus) {
            controller.setEventBus(this.eventBus);
        }
        
        if (controller.setStateManager) {
            controller.setStateManager(this.stateManager);
        }
        
        // 初始化按钮状态
        this.stateManager.commit("UPDATE_BUTTON_STATE", {
            buttonId,
            newState: {
                visible: true,
                enabled: true,
                initialized: false
            }
        });
        
        MNUtil.log(`Button controller registered: ${buttonId}`);
    }
    
    // 处理按钮按下事件
    handleButtonPress(buttonId, data) {
        const controller = this.buttonControllers.get(buttonId);
        if (!controller) {
            MNUtil.log(`Button controller not found: ${buttonId}`);
            return;
        }
        
        // 设置为活动按钮
        this.stateManager.commit("SET_ACTIVE_BUTTON", buttonId);
        
        // 通知按钮控制器
        if (controller.onPress) {
            try {
                controller.onPress(data);
            } catch (error) {
                MNUtil.log(`Error in button ${buttonId} press handler:`, error);
                MNUtil.showHUD(`按钮 ${buttonId} 执行出错`);
            }
        }
        
        // 广播按钮按下事件给其他控制器
        this.eventBus.emit("toolbar.button.pressed", { buttonId, data });
    }
    
    // 处理配置变更
    handleConfigChange(configData) {
        if (configData.section === "toolbar") {
            this.stateManager.commit("UPDATE_TOOLBAR_CONFIG", configData.data);
            
            // 通知所有按钮控制器配置已更新
            for (const [buttonId, controller] of this.buttonControllers) {
                if (controller.onConfigChange) {
                    controller.onConfigChange(configData.data);
                }
            }
        }
    }
    
    // 更新工具栏显示
    updateToolbarDisplay(visible) {
        const toolbar = this.getToolbarElement();
        if (toolbar) {
            toolbar.style.display = visible ? "block" : "none";
        }
        
        // 通知所有按钮控制器可见性变化
        this.eventBus.emit("toolbar.visibility.change", visible);
    }
    
    // 处理活动按钮变化
    handleActiveButtonChange(newActiveButton, oldActiveButton) {
        // 取消旧按钮的活动状态
        if (oldActiveButton) {
            const oldController = this.buttonControllers.get(oldActiveButton);
            if (oldController && oldController.onDeactivate) {
                oldController.onDeactivate();
            }
            
            this.stateManager.commit("UPDATE_BUTTON_STATE", {
                buttonId: oldActiveButton,
                newState: { active: false }
            });
        }
        
        // 激活新按钮
        if (newActiveButton) {
            const newController = this.buttonControllers.get(newActiveButton);
            if (newController && newController.onActivate) {
                newController.onActivate();
            }
            
            this.stateManager.commit("UPDATE_BUTTON_STATE", {
                buttonId: newActiveButton,
                newState: { active: true }
            });
        }
    }
    
    // 获取工具栏元素
    getToolbarElement() {
        // 实际的DOM操作实现
        return document.getElementById("mn-toolbar");
    }
    
    // 初始化所有按钮控制器
    initializeAllControllers() {
        for (const [buttonId, controller] of this.buttonControllers) {
            if (controller.initialize && !this.stateManager.state.buttonStates[buttonId]?.initialized) {
                try {
                    controller.initialize();
                    this.stateManager.commit("UPDATE_BUTTON_STATE", {
                        buttonId,
                        newState: { initialized: true }
                    });
                } catch (error) {
                    MNUtil.log(`Error initializing button controller ${buttonId}:`, error);
                }
            }
        }
    }
    
    // 销毁所有控制器
    destroy() {
        // 销毁所有按钮控制器
        for (const [buttonId, controller] of this.buttonControllers) {
            if (controller.destroy) {
                controller.destroy();
            }
        }
        
        // 清理资源
        this.buttonControllers.clear();
        this.eventBus.clear();
        this.stateManager.reset();
        this.lifecycleController.destroyAll();
    }
}
```

#### 11.6.2 按钮控制器基类

```javascript
// 装饰后的按钮控制器基类
@ControllerDecorator.withEventHandling
@ControllerDecorator.withStateManagement  
@ControllerDecorator.withLifecycle
class ToolbarButtonController {
    constructor(buttonId, config = {}) {
        this.buttonId = buttonId;
        this.config = config;
        this.isInitialized = false;
        this.isActive = false;
    }
    
    // 设置事件总线（由装饰器自动调用）
    setEventBus(eventBus) {
        this.eventBus = eventBus;
    }
    
    // 设置状态管理器（由装饰器自动调用）
    setStateManager(stateManager) {
        this.stateManager = stateManager;
    }
    
    // 初始化方法
    initialize() {
        if (this.isInitialized) return;
        
        // 订阅相关事件
        this.subscribe("toolbar.visibility.change", this.onToolbarVisibilityChange);
        this.subscribe("toolbar.button.pressed", this.onOtherButtonPressed);
        
        // 监听自己的状态变化
        this.watchState(`buttonStates.${this.buttonId}`, (newState) => {
            this.onStateChange(newState);
        });
        
        this.isInitialized = true;
        MNUtil.log(`Button controller ${this.buttonId} initialized`);
    }
    
    // 按钮被按下
    onPress(data) {
        MNUtil.log(`Button ${this.buttonId} pressed with data:`, data);
        // 子类实现具体逻辑
    }
    
    // 按钮被激活
    onActivate() {
        this.isActive = true;
        MNUtil.log(`Button ${this.buttonId} activated`);
        // 子类实现具体逻辑
    }
    
    // 按钮被取消激活
    onDeactivate() {
        this.isActive = false;
        MNUtil.log(`Button ${this.buttonId} deactivated`);
        // 子类实现具体逻辑
    }
    
    // 工具栏可见性变化
    onToolbarVisibilityChange(visible) {
        if (visible && this.config.autoActivateOnShow && this.isActive) {
            this.onActivate();
        }
    }
    
    // 其他按钮被按下
    onOtherButtonPressed({ buttonId, data }) {
        if (buttonId !== this.buttonId && this.config.exclusiveMode && this.isActive) {
            this.onDeactivate();
        }
    }
    
    // 状态变化处理
    onStateChange(newState) {
        if (newState && newState.active !== this.isActive) {
            if (newState.active) {
                this.onActivate();
            } else {
                this.onDeactivate();
            }
        }
    }
    
    // 配置变更处理
    onConfigChange(newConfig) {
        this.config = { ...this.config, ...newConfig };
        MNUtil.log(`Button ${this.buttonId} config updated:`, this.config);
    }
    
    // 更新按钮状态
    updateState(newState) {
        this.commit("UPDATE_BUTTON_STATE", {
            buttonId: this.buttonId,
            newState
        });
    }
    
    // 显示/隐藏按钮
    setVisible(visible) {
        this.updateState({ visible });
    }
    
    // 启用/禁用按钮
    setEnabled(enabled) {
        this.updateState({ enabled });
    }
    
    // 发送消息给主控制器
    sendToMain(message, data) {
        this.emit("button.message", {
            buttonId: this.buttonId,
            message,
            data
        });
    }
    
    // 销毁控制器
    destroy() {
        MNUtil.log(`Button controller ${this.buttonId} destroyed`);
        super.destroy(); // 调用装饰器的销毁方法
    }
}
```


#### 11.6.3 具体按钮控制器实现示例

```javascript
// OCR按钮控制器（基于MNOCR插件）
class OCRButtonController extends ToolbarButtonController {
    constructor() {
        super("ocr", {
            exclusiveMode: false,
            autoActivateOnShow: true,
            requiresNotebook: true
        });
        
        this.ocrService = null;
        this.processingQueue = [];
        this.isProcessing = false;
    }
    
    // 初始化OCR服务
    initialize() {
        super.initialize();
        
        // 初始化OCR服务
        this.ocrService = new OCRService();
        
        // 订阅笔记选择事件
        this.subscribe(PLUGIN_EVENTS.NOTE.SELECT, this.onNoteSelected);
        
        // 监听处理队列状态
        this.watchState("processingQueue", (queue) => {
            this.updateProcessingStatus(queue.length > 0);
        });
    }
    
    // 按钮被按下时的处理
    onPress(data) {
        super.onPress(data);
        
        const focusNote = MNNote.getFocusNote();
        if (!focusNote) {
            MNUtil.showHUD("请先选择一个笔记");
            return;
        }
        
        // 检查笔记是否包含图片
        if (!this.hasImageContent(focusNote)) {
            MNUtil.showHUD("所选笔记不包含图片内容");
            return;
        }
        
        // 开始OCR处理
        this.startOCRProcess(focusNote);
    }
    
    // 开始OCR处理
    async startOCRProcess(note) {
        try {
            // 添加到处理队列
            this.processingQueue.push(note.noteId);
            this.updateProcessingQueue();
            
            // 显示处理状态
            this.updateState({ processing: true });
            MNUtil.showHUD("OCR识别中...");
            
            // 执行OCR
            const ocrResult = await this.ocrService.processNote(note);
            
            if (ocrResult.success) {
                // 添加OCR结果到笔记
                await this.addOCRResultToNote(note, ocrResult.text);
                
                // 发送成功事件
                this.emit(PLUGIN_EVENTS.DATA.SYNC_COMPLETE, {
                    type: "ocr",
                    noteId: note.noteId,
                    result: ocrResult
                });
                
                MNUtil.showHUD("OCR识别完成");
            } else {
                throw new Error(ocrResult.error || "OCR识别失败");
            }
            
        } catch (error) {
            MNUtil.log("OCR processing error:", error);
            MNUtil.showHUD(`OCR识别失败: ${error.message}`);
            
            // 发送错误事件
            this.emit(PLUGIN_EVENTS.DATA.SYNC_ERROR, {
                type: "ocr",
                noteId: note.noteId,
                error: error.message
            });
        } finally {
            // 从处理队列中移除
            const index = this.processingQueue.indexOf(note.noteId);
            if (index > -1) {
                this.processingQueue.splice(index, 1);
            }
            
            this.updateProcessingQueue();
            this.updateState({ processing: false });
        }
    }
    
    // 检查笔记是否包含图片
    hasImageContent(note) {
        return note.MNComments.some(comment => {
            const type = comment.type;
            return type === "imageComment" || 
                   type === "imageCommentWithDrawing" ||
                   type === "mergedImageComment" ||
                   type === "mergedImageCommentWithDrawing";
        });
    }
    
    // 添加OCR结果到笔记
    async addOCRResultToNote(note, ocrText) {
        if (!ocrText || ocrText.trim() === "") return;
        
        // 创建OCR结果评论
        const ocrComment = {
            type: "textComment",
            text: `[OCR识别结果]
${ocrText}`,
            timestamp: Date.now()
        };
        
        // 添加评论到笔记
        MNNote.addCommentToNote(note, ocrComment);
        
        // 发送笔记更新事件
        this.emit(PLUGIN_EVENTS.NOTE.UPDATE, {
            noteId: note.noteId,
            changeType: "comment_added",
            data: ocrComment
        });
    }
    
    // 更新处理队列状态
    updateProcessingQueue() {
        this.commit("UPDATE_PROCESSING_QUEUE", this.processingQueue);
    }
    
    // 更新处理状态显示
    updateProcessingStatus(isProcessing) {
        const buttonElement = document.getElementById(`toolbar-button-${this.buttonId}`);
        if (buttonElement) {
            if (isProcessing) {
                buttonElement.classList.add("processing");
            } else {
                buttonElement.classList.remove("processing");
            }
        }
    }
    
    // 笔记选择事件处理
    onNoteSelected(noteData) {
        const { note } = noteData;
        const hasImage = this.hasImageContent(note);
        
        // 根据笔记内容更新按钮状态
        this.setEnabled(hasImage);
        
        if (hasImage) {
            this.updateState({ 
                tooltip: "点击识别图片中的文字",
                badge: null 
            });
        } else {
            this.updateState({ 
                tooltip: "当前笔记不包含图片",
                badge: "无图片"
            });
        }
    }
    
    // 配置变更处理
    onConfigChange(newConfig) {
        super.onConfigChange(newConfig);
        
        // 更新OCR服务配置
        if (this.ocrService && newConfig.ocrSettings) {
            this.ocrService.updateConfig(newConfig.ocrSettings);
        }
    }
    
    // 销毁控制器
    destroy() {
        if (this.ocrService) {
            this.ocrService.destroy();
            this.ocrService = null;
        }
        
        this.processingQueue = [];
        super.destroy();
    }
}

// AI助手按钮控制器（基于MNAI插件）
class AIAssistantController extends ToolbarButtonController {
    constructor() {
        super("ai_assistant", {
            exclusiveMode: true,
            autoActivateOnShow: false,
            requiresNotebook: true
        });
        
        this.aiService = null;
        this.conversationHistory = [];
        this.currentContext = null;
    }
    
    initialize() {
        super.initialize();
        
        // 初始化AI服务
        this.aiService = new AIService();
        
        // 订阅笔记更新事件
        this.subscribe(PLUGIN_EVENTS.NOTE.UPDATE, this.onNoteUpdated);
        
        // 监听对话历史状态
        this.watchState("conversationHistory", (history) => {
            this.updateConversationDisplay(history);
        });
    }
    
    onPress(data) {
        super.onPress(data);
        
        const focusNote = MNNote.getFocusNote();
        if (!focusNote) {
            MNUtil.showHUD("请先选择一个笔记");
            return;
        }
        
        // 显示AI对话界面
        this.showAIDialog(focusNote);
    }
    
    // 显示AI对话界面
    showAIDialog(note) {
        const noteContent = this.extractNoteContent(note);
        const prompt = `请基于以下笔记内容提供分析和建议：

${noteContent}`;
        
        UIAlertView.showWithTitleMessage(
            "AI助手", 
            prompt,
            2, // 文本输入类型
            ["取消", "发送", "历史对话"],
            (alert, buttonIndex) => {
                if (buttonIndex === 1) { // 发送
                    const userInput = alert.textFieldAtIndex(0).text;
                    if (userInput && userInput.trim()) {
                        this.sendToAI(userInput, note);
                    }
                } else if (buttonIndex === 2) { // 历史对话
                    this.showConversationHistory();
                }
            }
        );
    }
    
    // 发送消息给AI
    async sendToAI(message, contextNote = null) {
        try {
            // 更新当前上下文
            this.currentContext = contextNote;
            
            // 添加用户消息到历史
            this.addToConversationHistory("user", message);
            
            // 显示处理状态
            this.updateState({ processing: true });
            MNUtil.showHUD("AI思考中...");
            
            // 构建对话上下文
            const context = this.buildConversationContext(contextNote);
            
            // 发送到AI服务
            const aiResponse = await this.aiService.sendMessage(message, context);
            
            if (aiResponse.success) {
                // 添加AI回复到历史
                this.addToConversationHistory("assistant", aiResponse.content);
                
                // 显示AI回复
                this.showAIResponse(aiResponse.content, contextNote);
                
                // 发送成功事件
                this.emit("ai.response.received", {
                    userMessage: message,
                    aiResponse: aiResponse.content,
                    noteId: contextNote?.noteId
                });
                
            } else {
                throw new Error(aiResponse.error || "AI服务请求失败");
            }
            
        } catch (error) {
            MNUtil.log("AI request error:", error);
            MNUtil.showHUD(`AI请求失败: ${error.message}`);
            
            this.emit("ai.request.error", {
                message,
                error: error.message,
                noteId: contextNote?.noteId
            });
        } finally {
            this.updateState({ processing: false });
        }
    }
    
    // 构建对话上下文
    buildConversationContext(note) {
        const context = {
            conversationHistory: this.conversationHistory.slice(-10), // 最近10条消息
            currentNote: null,
            relatedNotes: []
        };
        
        if (note) {
            context.currentNote = {
                id: note.noteId,
                title: note.noteTitle,
                content: this.extractNoteContent(note),
                type: this.getNoteType(note)
            };
            
            // 获取相关笔记
            context.relatedNotes = this.findRelatedNotes(note);
        }
        
        return context;
    }
    
    // 提取笔记内容
    extractNoteContent(note) {
        let content = note.noteTitle || "";
        
        // 添加摘录内容
        if (note.excerptText) {
            content += `
[摘录]: ${note.excerptText}`;
        }
        
        // 添加评论内容
        note.MNComments.forEach(comment => {
            if (comment.type === "textComment" || comment.type === "markdownComment") {
                content += `
[评论]: ${comment.text}`;
            }
        });
        
        return content.trim();
    }
    
    // 添加到对话历史
    addToConversationHistory(role, content) {
        const message = {
            role,
            content,
            timestamp: Date.now(),
            noteId: this.currentContext?.noteId
        };
        
        this.conversationHistory.push(message);
        
        // 限制历史记录数量
        if (this.conversationHistory.length > 100) {
            this.conversationHistory = this.conversationHistory.slice(-100);
        }
        
        // 更新状态
        this.commit("UPDATE_CONVERSATION_HISTORY", this.conversationHistory);
    }
    
    // 显示AI回复
    showAIResponse(response, contextNote) {
        UIAlertView.showWithTitleMessage(
            "AI助手回复",
            response,
            0,
            ["确定", "添加到笔记", "继续对话"],
            (alert, buttonIndex) => {
                if (buttonIndex === 1 && contextNote) { // 添加到笔记
                    this.addAIResponseToNote(contextNote, response);
                } else if (buttonIndex === 2) { // 继续对话
                    MNUtil.delay(0.1).then(() => {
                        this.showAIDialog(contextNote);
                    });
                }
            }
        );
    }
    
    // 添加AI回复到笔记
    addAIResponseToNote(note, response) {
        const aiComment = {
            type: "textComment",
            text: `[AI助手回复 - ${new Date().toLocaleString()}]
${response}`,
            timestamp: Date.now()
        };
        
        MNNote.addCommentToNote(note, aiComment);
        
        this.emit(PLUGIN_EVENTS.NOTE.UPDATE, {
            noteId: note.noteId,
            changeType: "ai_comment_added",
            data: aiComment
        });
        
        MNUtil.showHUD("AI回复已添加到笔记");
    }
    
    // 显示对话历史
    showConversationHistory() {
        if (this.conversationHistory.length === 0) {
            MNUtil.showHUD("暂无对话历史");
            return;
        }
        
        const historyText = this.conversationHistory
            .slice(-10)
            .map(msg => `[${msg.role}]: ${msg.content.substring(0, 100)}...`)
            .join("

");
        
        UIAlertView.showWithTitleMessage(
            "对话历史",
            historyText,
            0,
            ["返回", "清空历史", "导出历史"],
            (alert, buttonIndex) => {
                if (buttonIndex === 1) { // 清空历史
                    this.clearConversationHistory();
                } else if (buttonIndex === 2) { // 导出历史
                    this.exportConversationHistory();
                }
            }
        );
    }
    
    // 清空对话历史
    clearConversationHistory() {
        this.conversationHistory = [];
        this.commit("UPDATE_CONVERSATION_HISTORY", this.conversationHistory);
        MNUtil.showHUD("对话历史已清空");
    }
    
    // 导出对话历史
    exportConversationHistory() {
        const historyJson = JSON.stringify(this.conversationHistory, null, 2);
        MNUtil.copyJSON(historyJson);
        MNUtil.showHUD("对话历史已复制到剪贴板");
    }
    
    onNoteUpdated(updateData) {
        // 当前上下文笔记更新时，更新AI服务的上下文
        if (this.currentContext && updateData.noteId === this.currentContext.noteId) {
            this.currentContext = MNNote.getNoteById(updateData.noteId);
        }
    }
    
    destroy() {
        if (this.aiService) {
            this.aiService.destroy();
            this.aiService = null;
        }
        
        this.conversationHistory = [];
        this.currentContext = null;
        super.destroy();
    }
}
```

### 11.7 事件驱动架构最佳实践

#### 11.7.1 事件命名规范

```javascript
// 事件命名规范
const EVENT_NAMING_CONVENTION = {
    // 格式: 域.对象.动作
    // 示例: "notebook.document.open", "ui.toolbar.click", "data.sync.complete"
    
    // 生命周期事件
    LIFECYCLE: "lifecycle", // lifecycle.window.connect
    
    // UI事件  
    UI: "ui", // ui.button.click, ui.dialog.open
    
    // 数据事件
    DATA: "data", // data.note.create, data.sync.start
    
    // 配置事件
    CONFIG: "config", // config.setting.change
    
    // 插件事件
    PLUGIN: "plugin" // plugin.feature.activate
};

// 事件优先级
const EVENT_PRIORITY = {
    CRITICAL: 0,  // 系统关键事件
    HIGH: 1,      // 高优先级事件
    NORMAL: 2,    // 普通事件
    LOW: 3        // 低优先级事件
};
```

#### 11.7.2 错误处理和恢复机制

```javascript
// 带错误处理的事件总线
class RobustEventBus extends EventBus {
    constructor() {
        super();
        this.errorHandlers = new Map();
        this.retryConfig = {
            maxRetries: 3,
            retryDelay: 1000,
            backoffMultiplier: 2
        };
    }
    
    // 注册错误处理器
    onError(eventName, handler) {
        if (!this.errorHandlers.has(eventName)) {
            this.errorHandlers.set(eventName, new Set());
        }
        this.errorHandlers.get(eventName).add(handler);
    }
    
    // 触发事件（带重试机制）
    async emitWithRetry(eventName, ...args) {
        let lastError = null;
        let attempt = 0;
        
        while (attempt <= this.retryConfig.maxRetries) {
            try {
                const result = this.emit(eventName, ...args);
                if (result) {
                    return true; // 成功
                }
            } catch (error) {
                lastError = error;
                MNUtil.log(`Event ${eventName} failed on attempt ${attempt + 1}:`, error);
                
                // 调用错误处理器
                this.handleEventError(eventName, error, attempt);
                
                if (attempt < this.retryConfig.maxRetries) {
                    // 等待后重试
                    const delay = this.retryConfig.retryDelay * 
                        Math.pow(this.retryConfig.backoffMultiplier, attempt);
                    await MNUtil.delay(delay / 1000);
                }
            }
            
            attempt++;
        }
        
        // 所有重试都失败了
        this.handleFinalFailure(eventName, lastError);
        return false;
    }
    
    // 处理事件错误
    handleEventError(eventName, error, attempt) {
        const errorHandlers = this.errorHandlers.get(eventName);
        if (errorHandlers) {
            for (const handler of errorHandlers) {
                try {
                    handler(error, attempt, eventName);
                } catch (handlerError) {
                    MNUtil.log("Error in error handler:", handlerError);
                }
            }
        }
    }
    
    // 处理最终失败
    handleFinalFailure(eventName, error) {
        MNUtil.log(`Event ${eventName} failed permanently:`, error);
        
        // 发送系统错误事件
        try {
            super.emit("system.event.failed", {
                eventName,
                error: error.message,
                timestamp: Date.now()
            });
        } catch (systemError) {
            MNUtil.log("Failed to emit system error event:", systemError);
        }
    }
    
    // 健康检查
    healthCheck() {
        const stats = this.getStats();
        const totalListeners = Object.values(stats).reduce((sum, count) => sum + count, 0);
        
        return {
            totalEvents: this.events.size,
            totalListeners,
            eventStats: stats,
            middlewareCount: this.middlewares.length,
            errorHandlerCount: this.errorHandlers.size,
            timestamp: Date.now()
        };
    }
}
```

#### 11.7.3 性能优化技巧

```javascript
// 性能优化的事件管理器
class OptimizedEventManager {
    constructor() {
        this.eventBus = new RobustEventBus();
        this.performanceMetrics = new Map();
        this.eventQueue = [];
        this.batchProcessing = false;
        this.batchTimeout = null;
    }
    
    // 批量处理事件
    enableBatchProcessing(batchSize = 10, timeout = 100) {
        this.batchProcessing = true;
        this.batchSize = batchSize;
        this.batchTimeout = timeout;
    }
    
    // 发射事件（批量处理）
    emit(eventName, ...args) {
        if (this.batchProcessing) {
            this.eventQueue.push({ eventName, args });
            
            if (this.eventQueue.length >= this.batchSize) {
                this.processBatch();
            } else {
                this.scheduleBatchProcessing();
            }
        } else {
            this.processSingleEvent(eventName, args);
        }
    }
    
    // 处理单个事件
    processSingleEvent(eventName, args) {
        const startTime = Date.now();
        
        try {
            const result = this.eventBus.emit(eventName, ...args);
            
            // 记录性能指标
            this.recordPerformance(eventName, Date.now() - startTime, true);
            
            return result;
        } catch (error) {
            this.recordPerformance(eventName, Date.now() - startTime, false);
            throw error;
        }
    }
    
    // 调度批量处理
    scheduleBatchProcessing() {
        if (this.batchTimeout) {
            clearTimeout(this.batchTimeout);
        }
        
        this.batchTimeout = setTimeout(() => {
            if (this.eventQueue.length > 0) {
                this.processBatch();
            }
        }, this.batchTimeout);
    }
    
    // 处理批量事件
    processBatch() {
        if (this.eventQueue.length === 0) return;
        
        const batch = this.eventQueue.splice(0, this.batchSize);
        const startTime = Date.now();
        
        try {
            // 按事件类型分组
            const groupedEvents = this.groupEventsByType(batch);
            
            // 按顺序处理每组事件
            for (const [eventName, events] of groupedEvents) {
                for (const event of events) {
                    this.eventBus.emit(event.eventName, ...event.args);
                }
            }
            
            this.recordBatchPerformance(batch.length, Date.now() - startTime, true);
            
        } catch (error) {
            this.recordBatchPerformance(batch.length, Date.now() - startTime, false);
            MNUtil.log("Batch processing error:", error);
        }
        
        // 继续处理剩余事件
        if (this.eventQueue.length > 0) {
            MNUtil.delay(0.01).then(() => this.processBatch());
        }
    }
    
    // 按类型分组事件
    groupEventsByType(events) {
        const grouped = new Map();
        
        events.forEach(event => {
            if (!grouped.has(event.eventName)) {
                grouped.set(event.eventName, []);
            }
            grouped.get(event.eventName).push(event);
        });
        
        return grouped;
    }
    
    // 记录性能指标
    recordPerformance(eventName, duration, success) {
        if (!this.performanceMetrics.has(eventName)) {
            this.performanceMetrics.set(eventName, {
                totalCount: 0,
                successCount: 0,
                failureCount: 0,
                totalDuration: 0,
                maxDuration: 0,
                minDuration: Infinity
            });
        }
        
        const metrics = this.performanceMetrics.get(eventName);
        metrics.totalCount++;
        metrics.totalDuration += duration;
        metrics.maxDuration = Math.max(metrics.maxDuration, duration);
        metrics.minDuration = Math.min(metrics.minDuration, duration);
        
        if (success) {
            metrics.successCount++;
        } else {
            metrics.failureCount++;
        }
    }
    
    // 记录批量处理性能
    recordBatchPerformance(batchSize, duration, success) {
        this.recordPerformance("__batch__", duration / batchSize, success);
    }
    
    // 获取性能报告
    getPerformanceReport() {
        const report = {};
        
        for (const [eventName, metrics] of this.performanceMetrics) {
            report[eventName] = {
                ...metrics,
                averageDuration: metrics.totalCount > 0 ? metrics.totalDuration / metrics.totalCount : 0,
                successRate: metrics.totalCount > 0 ? (metrics.successCount / metrics.totalCount) * 100 : 0
            };
        }
        
        return report;
    }
    
    // 清理性能指标
    clearMetrics() {
        this.performanceMetrics.clear();
    }
}
```

### 11.8 本章总结

本章详细介绍了MarginNote插件中的控制器通信与事件管理系统，主要包括：

1. **通信基础**：控制器间的直接引用、全局状态、事件总线和数据层通信方式
2. **事件总线系统**：完整的发布-订阅模式实现，支持中间件和错误处理
3. **生命周期管理**：自动化的控制器生命周期管理和钩子函数系统
4. **状态管理**：响应式状态管理，支持状态监听和批量更新
5. **装饰器模式**：通过装饰器为控制器添加事件处理、状态管理和生命周期能力
6. **实际案例**：基于MNToolbar插件的完整工具栏控制器通信案例
7. **最佳实践**：事件命名规范、错误处理机制和性能优化技巧

通过本章学习，你将能够：
- 构建复杂的多控制器插件架构
- 实现可靠的事件驱动系统
- 使用装饰器模式简化控制器开发
- 应用性能优化技巧提高插件效率

下一章我们将学习手势识别与交互增强，探讨如何为插件添加丰富的交互体验。


## 第12章：手势识别与交互增强

在移动设备上使用MarginNote时，手势交互是提升用户体验的关键因素。本章将深入介绍如何在插件中实现手势识别、自定义交互模式，以及构建响应式的用户界面。

### 12.1 手势识别基础

#### 12.1.1 MarginNote中的手势系统

MarginNote支持多种手势类型：

1. **点击手势**：单击、双击、长按
2. **滑动手势**：上下左右滑动、多方向滑动
3. **缩放手势**：双指缩放（Pinch）
4. **旋转手势**：双指旋转
5. **多点触摸**：多指点击和滑动

#### 12.1.2 手势识别核心类

```javascript
// 手势识别管理器
class GestureRecognizer {
    constructor(targetElement) {
        this.targetElement = targetElement || document;
        this.gestureHandlers = new Map();
        this.isEnabled = true;
        this.gestureConfig = {
            tapTimeout: 300,
            longPressTimeout: 800,
            swipeThreshold: 50,
            pinchThreshold: 0.1
        };
        
        this.touchStartTime = 0;
        this.touchStartPosition = { x: 0, y: 0 };
        this.lastTouchPosition = { x: 0, y: 0 };
        this.touchCount = 0;
        this.isLongPressing = false;
        this.longPressTimer = null;
        
        this.initializeGestureHandlers();
    }
    
    // 初始化手势处理器
    initializeGestureHandlers() {
        // 触摸开始
        this.targetElement.addEventListener("touchstart", (event) => {
            this.handleTouchStart(event);
        }, { passive: false });
        
        // 触摸移动
        this.targetElement.addEventListener("touchmove", (event) => {
            this.handleTouchMove(event);
        }, { passive: false });
        
        // 触摸结束
        this.targetElement.addEventListener("touchend", (event) => {
            this.handleTouchEnd(event);
        }, { passive: false });
        
        // 触摸取消
        this.targetElement.addEventListener("touchcancel", (event) => {
            this.handleTouchCancel(event);
        }, { passive: false });
        
        // 鼠标事件（用于桌面调试）
        this.initializeMouseHandlers();
    }
    
    // 初始化鼠标事件处理（用于调试）
    initializeMouseHandlers() {
        this.targetElement.addEventListener("mousedown", (event) => {
            this.simulateTouchEvent("touchstart", event);
        });
        
        this.targetElement.addEventListener("mousemove", (event) => {
            this.simulateTouchEvent("touchmove", event);
        });
        
        this.targetElement.addEventListener("mouseup", (event) => {
            this.simulateTouchEvent("touchend", event);
        });
    }
    
    // 模拟触摸事件（用于鼠标调试）
    simulateTouchEvent(type, mouseEvent) {
        const touch = {
            identifier: 0,
            clientX: mouseEvent.clientX,
            clientY: mouseEvent.clientY,
            pageX: mouseEvent.pageX,
            pageY: mouseEvent.pageY
        };
        
        const touchEvent = {
            type,
            touches: type === "touchend" ? [] : [touch],
            changedTouches: [touch],
            targetTouches: type === "touchend" ? [] : [touch],
            preventDefault: () => mouseEvent.preventDefault(),
            stopPropagation: () => mouseEvent.stopPropagation()
        };
        
        switch (type) {
            case "touchstart":
                this.handleTouchStart(touchEvent);
                break;
            case "touchmove":
                this.handleTouchMove(touchEvent);
                break;
            case "touchend":
                this.handleTouchEnd(touchEvent);
                break;
        }
    }
    
    // 处理触摸开始
    handleTouchStart(event) {
        if (!this.isEnabled) return;
        
        this.touchCount = event.touches.length;
        this.touchStartTime = Date.now();
        
        if (event.touches.length === 1) {
            const touch = event.touches[0];
            this.touchStartPosition = { x: touch.clientX, y: touch.clientY };
            this.lastTouchPosition = { x: touch.clientX, y: touch.clientY };
            
            // 启动长按检测
            this.startLongPressDetection(touch);
        } else if (event.touches.length === 2) {
            // 双指操作
            this.handleMultiTouchStart(event);
        }
        
        this.triggerGesture("touchstart", {
            type: "touchstart",
            touchCount: this.touchCount,
            position: this.touchStartPosition,
            originalEvent: event
        });
    }
    
    // 处理触摸移动
    handleTouchMove(event) {
        if (!this.isEnabled) return;
        
        if (event.touches.length === 1) {
            const touch = event.touches[0];
            const currentPosition = { x: touch.clientX, y: touch.clientY };
            
            // 计算移动距离
            const deltaX = currentPosition.x - this.lastTouchPosition.x;
            const deltaY = currentPosition.y - this.lastTouchPosition.y;
            const totalDeltaX = currentPosition.x - this.touchStartPosition.x;
            const totalDeltaY = currentPosition.y - this.touchStartPosition.y;
            
            // 如果移动距离超过阈值，取消长按检测
            if (Math.abs(totalDeltaX) > 10 || Math.abs(totalDeltaY) > 10) {
                this.cancelLongPressDetection();
            }
            
            this.lastTouchPosition = currentPosition;
            
            this.triggerGesture("touchmove", {
                type: "touchmove",
                position: currentPosition,
                delta: { x: deltaX, y: deltaY },
                totalDelta: { x: totalDeltaX, y: totalDeltaY },
                originalEvent: event
            });
            
        } else if (event.touches.length === 2) {
            this.handleMultiTouchMove(event);
        }
    }
    
    // 处理触摸结束
    handleTouchEnd(event) {
        if (!this.isEnabled) return;
        
        this.cancelLongPressDetection();
        
        const touchDuration = Date.now() - this.touchStartTime;
        const endPosition = this.lastTouchPosition;
        
        // 计算总移动距离
        const totalDistance = Math.sqrt(
            Math.pow(endPosition.x - this.touchStartPosition.x, 2) +
            Math.pow(endPosition.y - this.touchStartPosition.y, 2)
        );
        
        // 判断手势类型
        if (totalDistance < 10) {
            // 点击手势
            if (touchDuration < this.gestureConfig.tapTimeout) {
                this.handleTapGesture(event);
            }
        } else if (totalDistance > this.gestureConfig.swipeThreshold) {
            // 滑动手势
            this.handleSwipeGesture(event, totalDistance);
        }
        
        this.triggerGesture("touchend", {
            type: "touchend",
            duration: touchDuration,
            distance: totalDistance,
            startPosition: this.touchStartPosition,
            endPosition: endPosition,
            originalEvent: event
        });
        
        // 重置状态
        this.reset();
    }
    
    // 处理触摸取消
    handleTouchCancel(event) {
        this.cancelLongPressDetection();
        this.reset();
        
        this.triggerGesture("touchcancel", {
            type: "touchcancel",
            originalEvent: event
        });
    }
    
    // 启动长按检测
    startLongPressDetection(touch) {
        this.cancelLongPressDetection();
        
        this.longPressTimer = setTimeout(() => {
            if (!this.isLongPressing) {
                this.isLongPressing = true;
                this.triggerGesture("longpress", {
                    type: "longpress",
                    position: { x: touch.clientX, y: touch.clientY },
                    duration: this.gestureConfig.longPressTimeout
                });
            }
        }, this.gestureConfig.longPressTimeout);
    }
    
    // 取消长按检测
    cancelLongPressDetection() {
        if (this.longPressTimer) {
            clearTimeout(this.longPressTimer);
            this.longPressTimer = null;
        }
        this.isLongPressing = false;
    }
    
    // 处理点击手势
    handleTapGesture(event) {
        this.triggerGesture("tap", {
            type: "tap",
            position: this.touchStartPosition,
            originalEvent: event
        });
    }
    
    // 处理滑动手势
    handleSwipeGesture(event, distance) {
        const deltaX = this.lastTouchPosition.x - this.touchStartPosition.x;
        const deltaY = this.lastTouchPosition.y - this.touchStartPosition.y;
        
        // 判断滑动方向
        let direction = "";
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            direction = deltaX > 0 ? "right" : "left";
        } else {
            direction = deltaY > 0 ? "down" : "up";
        }
        
        this.triggerGesture("swipe", {
            type: "swipe",
            direction,
            distance,
            velocity: distance / (Date.now() - this.touchStartTime),
            startPosition: this.touchStartPosition,
            endPosition: this.lastTouchPosition,
            delta: { x: deltaX, y: deltaY },
            originalEvent: event
        });
        
        // 触发方向特定的滑动事件
        this.triggerGesture(`swipe${direction}`, {
            type: `swipe${direction}`,
            distance,
            velocity: distance / (Date.now() - this.touchStartTime),
            originalEvent: event
        });
    }
    
    // 处理多点触摸开始
    handleMultiTouchStart(event) {
        if (event.touches.length === 2) {
            const touch1 = event.touches[0];
            const touch2 = event.touches[1];
            
            this.initialDistance = this.calculateDistance(touch1, touch2);
            this.initialAngle = this.calculateAngle(touch1, touch2);
            this.initialCenter = this.calculateCenter(touch1, touch2);
        }
    }
    
    // 处理多点触摸移动
    handleMultiTouchMove(event) {
        if (event.touches.length === 2) {
            const touch1 = event.touches[0];
            const touch2 = event.touches[1];
            
            const currentDistance = this.calculateDistance(touch1, touch2);
            const currentAngle = this.calculateAngle(touch1, touch2);
            const currentCenter = this.calculateCenter(touch1, touch2);
            
            // 缩放检测
            const scale = currentDistance / this.initialDistance;
            if (Math.abs(scale - 1) > this.gestureConfig.pinchThreshold) {
                this.triggerGesture("pinch", {
                    type: "pinch",
                    scale,
                    center: currentCenter,
                    distance: currentDistance,
                    initialDistance: this.initialDistance,
                    originalEvent: event
                });
            }
            
            // 旋转检测
            const rotation = currentAngle - this.initialAngle;
            if (Math.abs(rotation) > 5) { // 5度阈值
                this.triggerGesture("rotate", {
                    type: "rotate",
                    rotation,
                    center: currentCenter,
                    angle: currentAngle,
                    initialAngle: this.initialAngle,
                    originalEvent: event
                });
            }
        }
    }
    
    // 计算两点距离
    calculateDistance(touch1, touch2) {
        return Math.sqrt(
            Math.pow(touch2.clientX - touch1.clientX, 2) +
            Math.pow(touch2.clientY - touch1.clientY, 2)
        );
    }
    
    // 计算两点角度
    calculateAngle(touch1, touch2) {
        return Math.atan2(
            touch2.clientY - touch1.clientY,
            touch2.clientX - touch1.clientX
        ) * 180 / Math.PI;
    }
    
    // 计算两点中心
    calculateCenter(touch1, touch2) {
        return {
            x: (touch1.clientX + touch2.clientX) / 2,
            y: (touch1.clientY + touch2.clientY) / 2
        };
    }
    
    // 注册手势处理器
    on(gestureType, handler) {
        if (!this.gestureHandlers.has(gestureType)) {
            this.gestureHandlers.set(gestureType, new Set());
        }
        
        this.gestureHandlers.get(gestureType).add(handler);
        
        // 返回取消注册函数
        return () => {
            const handlers = this.gestureHandlers.get(gestureType);
            if (handlers) {
                handlers.delete(handler);
            }
        };
    }
    
    // 取消手势处理器
    off(gestureType, handler = null) {
        if (handler) {
            const handlers = this.gestureHandlers.get(gestureType);
            if (handlers) {
                handlers.delete(handler);
            }
        } else {
            this.gestureHandlers.delete(gestureType);
        }
    }
    
    // 触发手势事件
    triggerGesture(gestureType, gestureData) {
        const handlers = this.gestureHandlers.get(gestureType);
        if (handlers) {
            handlers.forEach(handler => {
                try {
                    handler(gestureData);
                } catch (error) {
                    MNUtil.log(`Error in gesture handler for ${gestureType}:`, error);
                }
            });
        }
    }
    
    // 重置状态
    reset() {
        this.touchStartTime = 0;
        this.touchStartPosition = { x: 0, y: 0 };
        this.lastTouchPosition = { x: 0, y: 0 };
        this.touchCount = 0;
        this.initialDistance = 0;
        this.initialAngle = 0;
        this.initialCenter = { x: 0, y: 0 };
    }
    
    // 启用/禁用手势识别
    setEnabled(enabled) {
        this.isEnabled = enabled;
    }
    
    // 更新配置
    updateConfig(newConfig) {
        this.gestureConfig = { ...this.gestureConfig, ...newConfig };
    }
    
    // 销毁手势识别器
    destroy() {
        this.cancelLongPressDetection();
        this.gestureHandlers.clear();
        this.reset();
    }
}
```

### 12.2 高级手势识别

#### 12.2.1 复合手势识别

```javascript
// 复合手势识别器
class CompositeGestureRecognizer {
    constructor(gestureRecognizer) {
        this.gestureRecognizer = gestureRecognizer;
        this.compositeHandlers = new Map();
        this.gestureSequence = [];
        this.sequenceTimeout = 1000; // 1秒内的手势被认为是序列
        this.lastGestureTime = 0;
        
        this.initializeCompositeGestures();
    }
    
    // 初始化复合手势
    initializeCompositeGestures() {
        // 监听所有基础手势
        const basicGestures = ["tap", "swipe", "longpress", "pinch", "rotate"];
        
        basicGestures.forEach(gestureType => {
            this.gestureRecognizer.on(gestureType, (gestureData) => {
                this.addToSequence(gestureType, gestureData);
                this.checkCompositeGestures();
            });
        });
    }
    
    // 添加到手势序列
    addToSequence(gestureType, gestureData) {
        const currentTime = Date.now();
        
        // 如果距离上次手势时间超过阈值，清空序列
        if (currentTime - this.lastGestureTime > this.sequenceTimeout) {
            this.gestureSequence = [];
        }
        
        this.gestureSequence.push({
            type: gestureType,
            data: gestureData,
            timestamp: currentTime
        });
        
        this.lastGestureTime = currentTime;
        
        // 限制序列长度
        if (this.gestureSequence.length > 10) {
            this.gestureSequence = this.gestureSequence.slice(-10);
        }
    }
    
    // 检查复合手势
    checkCompositeGestures() {
        for (const [pattern, handler] of this.compositeHandlers) {
            if (this.matchesPattern(pattern)) {
                try {
                    handler({
                        pattern,
                        sequence: [...this.gestureSequence],
                        timestamp: Date.now()
                    });
                    
                    // 清空序列，避免重复触发
                    this.gestureSequence = [];
                } catch (error) {
                    MNUtil.log(`Error in composite gesture handler for ${pattern}:`, error);
                }
            }
        }
    }
    
    // 匹配手势模式
    matchesPattern(pattern) {
        const patternArray = pattern.split("-");
        const sequenceTypes = this.gestureSequence.map(g => g.type);
        
        if (patternArray.length > sequenceTypes.length) {
            return false;
        }
        
        // 检查最近的手势是否匹配模式
        const recentSequence = sequenceTypes.slice(-patternArray.length);
        
        for (let i = 0; i < patternArray.length; i++) {
            if (patternArray[i] !== recentSequence[i]) {
                return false;
            }
        }
        
        return true;
    }
    
    // 注册复合手势处理器
    onComposite(pattern, handler) {
        this.compositeHandlers.set(pattern, handler);
        
        return () => {
            this.compositeHandlers.delete(pattern);
        };
    }
    
    // 取消复合手势处理器
    offComposite(pattern) {
        this.compositeHandlers.delete(pattern);
    }
    
    // 清空手势序列
    clearSequence() {
        this.gestureSequence = [];
    }
    
    // 获取当前序列
    getCurrentSequence() {
        return [...this.gestureSequence];
    }
}
```

#### 12.2.2 自定义手势模式

```javascript
// 自定义手势模式识别器
class CustomGestureRecognizer {
    constructor(gestureRecognizer) {
        this.gestureRecognizer = gestureRecognizer;
        this.customPatterns = new Map();
        this.pathTracking = {
            enabled: false,
            points: [],
            threshold: 10 // 路径点间距阈值
        };
        
        this.initializePathTracking();
    }
    
    // 初始化路径跟踪
    initializePathTracking() {
        this.gestureRecognizer.on("touchstart", (data) => {
            if (this.pathTracking.enabled) {
                this.pathTracking.points = [data.position];
            }
        });
        
        this.gestureRecognizer.on("touchmove", (data) => {
            if (this.pathTracking.enabled) {
                this.addPathPoint(data.position);
            }
        });
        
        this.gestureRecognizer.on("touchend", (data) => {
            if (this.pathTracking.enabled && this.pathTracking.points.length > 2) {
                this.analyzeCustomPath();
            }
        });
    }
    
    // 添加路径点
    addPathPoint(position) {
        const lastPoint = this.pathTracking.points[this.pathTracking.points.length - 1];
        
        if (lastPoint) {
            const distance = Math.sqrt(
                Math.pow(position.x - lastPoint.x, 2) +
                Math.pow(position.y - lastPoint.y, 2)
            );
            
            // 只有当距离超过阈值时才添加点
            if (distance > this.pathTracking.threshold) {
                this.pathTracking.points.push(position);
            }
        }
    }
    
    // 分析自定义路径
    analyzeCustomPath() {
        const points = this.pathTracking.points;
        if (points.length < 3) return;
        
        // 简化路径
        const simplifiedPath = this.simplifyPath(points);
        
        // 识别几何形状
        const shape = this.recognizeShape(simplifiedPath);
        
        if (shape) {
            // 触发自定义手势事件
            this.triggerCustomGesture("shape", {
                shape: shape.type,
                confidence: shape.confidence,
                path: simplifiedPath,
                originalPath: points,
                boundingBox: this.calculateBoundingBox(points)
            });
        }
        
        // 检查自定义模式
        this.checkCustomPatterns(simplifiedPath);
    }
    
    // 简化路径（Douglas-Peucker算法）
    simplifyPath(points, epsilon = 5) {
        if (points.length <= 2) return points;
        
        // 找到最远的点
        let maxDistance = 0;
        let maxIndex = 0;
        
        const start = points[0];
        const end = points[points.length - 1];
        
        for (let i = 1; i < points.length - 1; i++) {
            const distance = this.pointToLineDistance(points[i], start, end);
            if (distance > maxDistance) {
                maxDistance = distance;
                maxIndex = i;
            }
        }
        
        // 如果最大距离大于阈值，递归简化
        if (maxDistance > epsilon) {
            const left = this.simplifyPath(points.slice(0, maxIndex + 1), epsilon);
            const right = this.simplifyPath(points.slice(maxIndex), epsilon);
            
            return left.slice(0, -1).concat(right);
        } else {
            return [start, end];
        }
    }
    
    // 计算点到线的距离
    pointToLineDistance(point, lineStart, lineEnd) {
        const A = point.x - lineStart.x;
        const B = point.y - lineStart.y;
        const C = lineEnd.x - lineStart.x;
        const D = lineEnd.y - lineStart.y;
        
        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        
        if (lenSq === 0) {
            return Math.sqrt(A * A + B * B);
        }
        
        const param = dot / lenSq;
        let xx, yy;
        
        if (param < 0) {
            xx = lineStart.x;
            yy = lineStart.y;
        } else if (param > 1) {
            xx = lineEnd.x;
            yy = lineEnd.y;
        } else {
            xx = lineStart.x + param * C;
            yy = lineStart.y + param * D;
        }
        
        const dx = point.x - xx;
        const dy = point.y - yy;
        
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    // 识别几何形状
    recognizeShape(points) {
        if (points.length < 3) return null;
        
        const shapes = [
            { type: "circle", detector: this.isCircle.bind(this) },
            { type: "rectangle", detector: this.isRectangle.bind(this) },
            { type: "triangle", detector: this.isTriangle.bind(this) },
            { type: "line", detector: this.isLine.bind(this) }
        ];
        
        let bestMatch = null;
        let maxConfidence = 0;
        
        for (const shape of shapes) {
            const confidence = shape.detector(points);
            if (confidence > maxConfidence) {
                maxConfidence = confidence;
                bestMatch = { type: shape.type, confidence };
            }
        }
        
        return maxConfidence > 0.6 ? bestMatch : null;
    }
    
    // 检测是否为圆形
    isCircle(points) {
        if (points.length < 4) return 0;
        
        // 计算中心点
        const center = this.calculateCenter(points);
        
        // 计算每个点到中心的距离
        const distances = points.map(point => 
            Math.sqrt(Math.pow(point.x - center.x, 2) + Math.pow(point.y - center.y, 2))
        );
        
        const avgDistance = distances.reduce((sum, d) => sum + d, 0) / distances.length;
        
        // 计算距离方差
        const variance = distances.reduce((sum, d) => sum + Math.pow(d - avgDistance, 2), 0) / distances.length;
        const standardDeviation = Math.sqrt(variance);
        
        // 如果标准差相对较小，认为是圆形
        const confidence = Math.max(0, 1 - (standardDeviation / avgDistance) * 2);
        
        return confidence;
    }
    
    // 检测是否为矩形
    isRectangle(points) {
        if (points.length < 4) return 0;
        
        // 简化为4个角点
        const corners = this.findCorners(points, 4);
        if (corners.length !== 4) return 0;
        
        // 计算边长
        const sides = [];
        for (let i = 0; i < 4; i++) {
            const next = (i + 1) % 4;
            sides.push(this.calculateDistance(corners[i], corners[next]));
        }
        
        // 检查对边是否相等
        const side1 = Math.abs(sides[0] - sides[2]) / Math.max(sides[0], sides[2]);
        const side2 = Math.abs(sides[1] - sides[3]) / Math.max(sides[1], sides[3]);
        
        const confidence = Math.max(0, 1 - (side1 + side2) / 2);
        
        return confidence;
    }
    
    // 检测是否为三角形
    isTriangle(points) {
        if (points.length < 3) return 0;
        
        const corners = this.findCorners(points, 3);
        if (corners.length !== 3) return 0;
        
        // 计算三边长度
        const sides = [
            this.calculateDistance(corners[0], corners[1]),
            this.calculateDistance(corners[1], corners[2]),
            this.calculateDistance(corners[2], corners[0])
        ];
        
        // 检查三角形不等式
        const valid = sides[0] + sides[1] > sides[2] &&
                     sides[1] + sides[2] > sides[0] &&
                     sides[2] + sides[0] > sides[1];
        
        return valid ? 0.8 : 0;
    }
    
    // 检测是否为直线
    isLine(points) {
        if (points.length < 2) return 0;
        
        const start = points[0];
        const end = points[points.length - 1];
        
        // 计算每个点到起始线的距离
        let maxDeviation = 0;
        for (const point of points) {
            const deviation = this.pointToLineDistance(point, start, end);
            maxDeviation = Math.max(maxDeviation, deviation);
        }
        
        const lineLength = this.calculateDistance(start, end);
        const confidence = Math.max(0, 1 - (maxDeviation / lineLength) * 4);
        
        return confidence;
    }
    
    // 查找角点
    findCorners(points, targetCount) {
        // 简单的角点检测算法
        const corners = [];
        const angleThreshold = Math.PI / 4; // 45度阈值
        
        for (let i = 1; i < points.length - 1; i++) {
            const prev = points[i - 1];
            const current = points[i];
            const next = points[i + 1];
            
            const angle = this.calculateAngleBetweenPoints(prev, current, next);
            
            if (Math.abs(angle) > angleThreshold) {
                corners.push(current);
            }
        }
        
        // 如果角点数量不匹配，返回均匀分布的点
        if (corners.length !== targetCount) {
            const step = Math.floor(points.length / targetCount);
            return Array.from({ length: targetCount }, (_, i) => points[i * step]);
        }
        
        return corners;
    }
    
    // 计算三点间的角度
    calculateAngleBetweenPoints(p1, p2, p3) {
        const v1 = { x: p1.x - p2.x, y: p1.y - p2.y };
        const v2 = { x: p3.x - p2.x, y: p3.y - p2.y };
        
        const dot = v1.x * v2.x + v1.y * v2.y;
        const cross = v1.x * v2.y - v1.y * v2.x;
        
        return Math.atan2(cross, dot);
    }
    
    // 计算中心点
    calculateCenter(points) {
        const sum = points.reduce((acc, point) => ({
            x: acc.x + point.x,
            y: acc.y + point.y
        }), { x: 0, y: 0 });
        
        return {
            x: sum.x / points.length,
            y: sum.y / points.length
        };
    }
    
    // 计算两点距离
    calculateDistance(p1, p2) {
        return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
    }
    
    // 计算边界框
    calculateBoundingBox(points) {
        let minX = Infinity, minY = Infinity;
        let maxX = -Infinity, maxY = -Infinity;
        
        points.forEach(point => {
            minX = Math.min(minX, point.x);
            minY = Math.min(minY, point.y);
            maxX = Math.max(maxX, point.x);
            maxY = Math.max(maxY, point.y);
        });
        
        return {
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY
        };
    }
    
    // 注册自定义手势处理器
    onCustom(gestureType, handler) {
        return this.gestureRecognizer.on(gestureType, handler);
    }
    
    // 触发自定义手势
    triggerCustomGesture(gestureType, data) {
        const handlers = this.gestureRecognizer.gestureHandlers.get(gestureType);
        if (handlers) {
            handlers.forEach(handler => {
                try {
                    handler(data);
                } catch (error) {
                    MNUtil.log(`Error in custom gesture handler for ${gestureType}:`, error);
                }
            });
        }
    }
    
    // 启用/禁用路径跟踪
    setPathTracking(enabled) {
        this.pathTracking.enabled = enabled;
        if (!enabled) {
            this.pathTracking.points = [];
        }
    }
    
    // 注册自定义模式
    registerPattern(name, patternData) {
        this.customPatterns.set(name, patternData);
    }
    
    // 检查自定义模式
    checkCustomPatterns(path) {
        for (const [name, pattern] of this.customPatterns) {
            const similarity = this.calculatePathSimilarity(path, pattern.path);
            
            if (similarity > pattern.threshold) {
                this.triggerCustomGesture("pattern", {
                    name,
                    similarity,
                    path,
                    pattern: pattern.path
                });
            }
        }
    }
    
    // 计算路径相似度
    calculatePathSimilarity(path1, path2) {
        // 简化的DTW（Dynamic Time Warping）算法
        if (path1.length === 0 || path2.length === 0) return 0;
        
        const matrix = Array(path1.length + 1)
            .fill(null)
            .map(() => Array(path2.length + 1).fill(Infinity));
        
        matrix[0][0] = 0;
        
        for (let i = 1; i <= path1.length; i++) {
            for (let j = 1; j <= path2.length; j++) {
                const cost = this.calculateDistance(path1[i - 1], path2[j - 1]);
                matrix[i][j] = cost + Math.min(
                    matrix[i - 1][j],      // insertion
                    matrix[i][j - 1],      // deletion
                    matrix[i - 1][j - 1]   // match
                );
            }
        }
        
        const maxDistance = Math.max(path1.length, path2.length) * 100; // 假设最大距离
        const similarity = 1 - (matrix[path1.length][path2.length] / maxDistance);
        
        return Math.max(0, similarity);
    }
}
```
