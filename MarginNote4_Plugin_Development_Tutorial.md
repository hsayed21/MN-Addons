# MarginNote 插件开发：从零开始的创作之旅

> 用最简单的方式，做最酷的插件！
> 
> 版本：v2.0 - 初学者友好版
> 更新：2025-09-02

## 嗨，未来的插件开发者！👋

你是否曾经在用 MarginNote 时想过：
- "要是能一键翻译这段英文就好了..."
- "如果笔记能自动同步到 Notion 该多好..."
- "能不能让 AI 帮我总结这篇文章？"

**好消息！这些想法都能实现，而且比你想象的简单得多！**

### 10 分钟后，你就能：
- 🎉 做出第一个能运行的插件
- 💡 理解插件是怎么工作的
- 🚀 开始实现自己的创意

### 这个教程和其他教程有什么不同？

别的教程可能会先讲一堆理论，我们不一样：
- **第 1 个插件只要 15 行代码**（真的，我数过了）
- **每个例子都解决实际问题**（不是无聊的 Hello World）
- **像朋友聊天，不像读说明书**（我们用人话）

准备好了吗？让我们开始这段有趣的旅程！

---

---

# 第一站：10 分钟做出你的第一个插件

## 先看看效果

想象一下，你正在读一篇英文 PDF，遇到不认识的单词。你选中它，点击你的插件图标，瞬间就看到了中文翻译。酷不酷？

这就是插件的魔力 —— **把你的想法变成 MarginNote 的功能**。

## 插件到底是什么？

简单说，插件就是一小段 JavaScript 代码，它能：
- 📝 读取和修改你的笔记
- 🎨 改变界面显示
- 🌐 连接网络服务（翻译、AI等）
- 🔗 和其他应用交互

**最棒的是**：你不需要懂 iOS 开发，只要会一点 JavaScript 就够了！

## 看看别人都做了什么

在开始之前，让我激发一下你的想象力：

- **小王的故事**：他做了个插件，选中英文自动显示中文翻译
- **小李的创意**：她的插件能把笔记自动整理成思维导图
- **老张的效率工具**：一键把所有高亮导出成 Markdown

他们都是从零开始的，你也可以！

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

## 你的第一个插件：超简单版！

### 只需要 3 个文件

创建一个文件夹，叫 `MyFirstPlugin`，里面放 3 个文件：

#### 📄 文件 1：main.js（主程序，15 行搞定！）

```javascript
// 这就是全部代码，真的只有 15 行！
JSB.newAddon = function() {
  return JSB.defineClass('MyFirstPlugin : JSExtension', {
    
    // 当你点击插件图标时会执行这个
    toggleAddon: function() {
      // 弹出一个提示
      Application.sharedInstance().showHUD(
        "🎉 恭喜！你的第一个插件在工作了！", 
        self.window, 
        3  // 显示 3 秒
      );
    }
    
  });
};
```

看，就这么简单！不需要理解所有细节，先跟着做就对了。

#### 📄 文件 2：maddon.json（身份证）

```json
{
  "addonid": "my.first.plugin",
  "author": "你的名字",
  "title": "我的第一个插件",
  "version": "1.0.0"
}
```

这就像插件的身份证，告诉 MarginNote 这是个插件。

#### 🎨 文件 3：logo.png（插件图标）

任何 44x44 像素的图片都行。不会做？用这个：
- 打开 https://favicon.io/emoji-favicons/
- 选一个 emoji
- 下载后重命名为 logo.png

### 打包安装（超简单！）

在终端里：
```bash
# 进入你的插件文件夹
cd MyFirstPlugin

# 打包！
mnaddon4 build

# 会生成 MyFirstPlugin.mnaddon 文件
```

**双击这个 .mnaddon 文件，它就装好了！**

### 试试你的插件

1. 打开 MarginNote
2. 打开任意文档
3. 点击工具栏上你的插件图标
4. 看到提示了吗？🎉

**恭喜！你已经是插件开发者了！**

## 让它做点有用的事

现在插件只会弹提示，来做点实用的：

### 版本 2：复制选中的文本

把 main.js 改成这样：

```javascript
JSB.newAddon = function() {
  return JSB.defineClass('TextCopier : JSExtension', {
    
    toggleAddon: function() {
      // 获取当前选中的文本
      let controller = Application.sharedInstance()
        .studyController(self.window)
        .readerController.currentDocumentController;
      
      let text = controller.selectionText;
      
      if (text) {
        // 复制到剪贴板
        UIPasteboard.generalPasteboard().string = text;
        
        // 提示用户
        Application.sharedInstance().showHUD(
          "✅ 已复制: " + text.substring(0, 20) + "...",
          self.window, 2
        );
      } else {
        Application.sharedInstance().showHUD(
          "⚠️ 请先选中一些文本",
          self.window, 2
        );
      }
    }
    
  });
};
```

现在你的插件能：
1. 选中 PDF 中的文本
2. 点击插件图标
3. 文本自动复制到剪贴板！

### 版本 3：给笔记加时间戳

```javascript
JSB.newAddon = function() {
  return JSB.defineClass('TimeStamper : JSExtension', {
    
    toggleAddon: function() {
      // 获取当前时间
      let now = new Date();
      let time = now.getHours() + ":" + now.getMinutes();
      let date = now.toLocaleDateString();
      
      // 创建时间戳文本
      let timestamp = `[📅 ${date} ${time}]`;
      
      // 复制到剪贴板
      UIPasteboard.generalPasteboard().string = timestamp;
      
      Application.sharedInstance().showHUD(
        "时间戳已复制：" + timestamp,
        self.window, 2
      );
    }
    
  });
};
```

现在你可以一键添加时间戳到笔记了！

## 开发者小技巧

### 📝 调试技巧

打开 MarginNote 控制台（Cmd + Option + J），你可以：

```javascript
// 看看你的插件在不在
self  // 返回你的插件实例

// 测试一下功能
Application.sharedInstance().showHUD("测试", self.window, 2)
```

### 🚀 开发者模式（不用反复打包！）

每次修改都要打包很烦？用这招：

```bash
# 创建一个软链接（只需要做一次）
ln -s ~/你的插件文件夹 ~/Library/Containers/QReader.MarginNoteMac/Data/Library/MarginNote\ Extensions/

# 之后修改代码，重启 MarginNote 就能看到效果！
```

## 第一站小结 🎆

**你已经学会了：**
- ✅ 创建一个能运行的插件（只要 15 行代码！）
- ✅ 让插件做一些实用的事（复制文本、加时间戳）
- ✅ 打包和安装插件
- ✅ 使用调试工具

**接下来你可以：**
1. 试试修改代码，让插件做别的事
2. 给插件换个好看的图标
3. 把你的插件分享给朋友

准备好学更多了吗？下一站，我们将学习如何操作笔记！

---

# 第二站：让插件做更多有趣的事

上一站我们做了个简单的插件。现在，让我们学些更酷的技能！

## 插件能响应的 5 个时刻

插件不只是点击图标才能用，它可以在很多时刻自动运行：

### 1. 打开 MarginNote 时 - 自动启动

```javascript
JSB.newAddon = function() {
  return JSB.defineClass('AutoStart : JSExtension', {
    
    // 插件加载时自动执行
    sceneWillConnect: function() {
      // 检查今天是否已经问候过
      let today = new Date().toDateString();
      let lastGreeting = NSUserDefaults.standardUserDefaults()
        .objectForKey("lastGreeting");
      
      if (lastGreeting !== today) {
        Application.sharedInstance().showHUD(
          "🌞 早安！今天也要加油学习哦！",
          self.window, 3
        );
        
        // 记住今天已经问候过
        NSUserDefaults.standardUserDefaults()
          .setObjectForKey(today, "lastGreeting");
      }
    },
    
    toggleAddon: function() {
      // 点击图标的功能
    }
  });
};
```

### 2. 打开笔记本时 - 显示统计

```javascript
notebookWillOpen: function(notebookid) {
  // 获取笔记本
  let notebook = Database.sharedInstance()
    .getNotebookById(notebookid);
  
  // 统计笔记数量
  let noteCount = notebook.notes.length;
  
  Application.sharedInstance().showHUD(
    `📚 打开《${notebook.title}》\n共有 ${noteCount} 条笔记`,
    self.window, 3
  );
}
```

### 3. 选中文本时 - 弹出菜单

```javascript
onPopupMenuOnSelection: function(sender) {
  let selectedText = sender.userInfo.documentController.selectionText;
  
  if (selectedText) {
    // 创建一个快速操作菜单
    let alert = UIAlertView.alloc()
      .initWithTitleMessageDelegateCancelButtonTitleOtherButtonTitles(
        "快速操作",
        `选中：${selectedText.substring(0, 30)}...`,
        self,
        "取消",
        ["🔍 搜索", "🌐 翻译", "📋 复制"]
      );
    alert.show();
  }
},

alertViewClickedButtonAtIndex: function(alertView, buttonIndex) {
  // 处理菜单选择
  switch(buttonIndex) {
    case 1: // 搜索
      // 打开搜索引擎
      break;
    case 2: // 翻译
      // 调用翻译 API
      break;
    case 3: // 复制
      // 复制到剪贴板
      break;
  }
}
```

## 实用功能：记住用户的选择

插件可以记住用户的偏好和设置：

### 保存设置

```javascript
// 保存用户偏好
function saveSettings(settings) {
  let defaults = NSUserDefaults.standardUserDefaults();
  
  // 保存各种类型的数据
  defaults.setObjectForKey(settings.theme, "plugin_theme");
  defaults.setObjectForKey(settings.fontSize, "plugin_fontSize");
  defaults.setObjectForKey(settings.autoSave, "plugin_autoSave");
  
  // 立即同步到磁盘
  defaults.synchronize();
}

// 读取设置
function loadSettings() {
  let defaults = NSUserDefaults.standardUserDefaults();
  
  return {
    theme: defaults.objectForKey("plugin_theme") || "light",
    fontSize: defaults.objectForKey("plugin_fontSize") || 14,
    autoSave: defaults.objectForKey("plugin_autoSave") || true
  };
}
```

### 实例：记住用户最近使用的颜色

```javascript
JSB.newAddon = function() {
  return JSB.defineClass('ColorMemory : JSExtension', {
    
    toggleAddon: function() {
      // 读取上次使用的颜色
      let lastColor = NSUserDefaults.standardUserDefaults()
        .objectForKey("lastUsedColor") || 0;
      
      // 显示颜色选择器
      let colors = [
        "⚪ 无色", "🔴 红色", "🟠 橙色", "🟡 黄色",
        "🟢 绿色", "🔵 蓝色", "🟣 紫色", "⚫ 灰色"
      ];
      
      // 在上次的颜色前加个勾
      colors[lastColor] = "✓ " + colors[lastColor];
      
      let alert = UIAlertView.alloc()
        .initWithTitleMessageDelegateCancelButtonTitleOtherButtonTitles(
          "选择颜色",
          "上次使用：" + colors[lastColor],
          self,
          "取消",
          colors
        );
      alert.show();
    },
    
    alertViewClickedButtonAtIndex: function(alertView, buttonIndex) {
      if (buttonIndex > 0) {
        let colorIndex = buttonIndex - 1;
        
        // 保存选择的颜色
        NSUserDefaults.standardUserDefaults()
          .setObjectForKey(colorIndex, "lastUsedColor");
        
        // 应用颜色（这里只是示例）
        Application.sharedInstance().showHUD(
          "已选择颜色 #" + colorIndex,
          self.window, 2
        );
      }
    }
  });
};
```

## 和用户交互：3 种方式

### 1. HUD 提示（最简单）

```javascript
// 普通提示
Application.sharedInstance().showHUD("保存成功！", self.window, 2);

// 加载中...
Application.sharedInstance().showHUD("正在处理...", self.window, 999);
// 做一些事...
Application.sharedInstance().stopHUD(self.window);
```

### 2. 对话框（获取用户选择）

```javascript
// 简单选择
let alert = UIAlertView.alloc()
  .initWithTitleMessageDelegateCancelButtonTitleOtherButtonTitles(
    "确认操作",
    "要删除这个笔记吗？",
    self,
    "取消",
    ["删除"]
  );
alert.show();
```

### 3. 输入框（获取用户输入）

```javascript
// 创建输入框
let inputAlert = UIAlertView.alloc()
  .initWithTitleMessageDelegateCancelButtonTitleOtherButtonTitles(
    "给笔记起个名字",
    "输入标题：",
    self,
    "取消",
    ["确定"]
  );

// 设置为输入模式
inputAlert.alertViewStyle = 2;  // 2 = 文本输入

// 设置默认值
inputAlert.textFieldAtIndex(0).text = "默认标题";

inputAlert.show();

// 处理输入
alertViewClickedButtonAtIndex: function(alertView, buttonIndex) {
  if (buttonIndex === 1) {  // 点击了确定
    let inputText = alertView.textFieldAtIndex(0).text;
    // 使用输入的文本...
  }
}
```

## 错误处理：让插件更稳定

别让你的插件崩溃！这样处理错误：

```javascript
toggleAddon: function() {
  try {
    // 可能出错的代码
    let note = getNoteById("invalid-id");
    note.title = "新标题";  // 可能 note 是 null
    
  } catch (error) {
    // 友好地告诉用户
    Application.sharedInstance().showHUD(
      "⚠️ 操作失败：" + error.message,
      self.window, 3
    );
    
    // 记录错误以便调试
    JSB.log("错误详情：" + error);
  }
}
```

## 实战项目：智能笔记助手（完整代码）

让我们用刚学的知识做个实用的插件，它能：
- 🎨 快速标记笔记颜色
- 📅 自动添加时间戳
- 📋 一键复制所有摘录
- 📊 显示笔记统计

```javascript
JSB.newAddon = function(mainPath) {
  
  return JSB.defineClass('SmartNoteHelper : JSExtension', {
    
    // 插件加载时
    sceneWillConnect: function() {
      self.mainPath = mainPath;
      
      // 加载用户配置
      self.loadConfig();
      
      Application.sharedInstance().showHUD(
        "🚀 智能笔记助手已启动",
        self.window, 2
      );
    },
    
    // 加载配置
    loadConfig: function() {
      let defaults = NSUserDefaults.standardUserDefaults();
      self.config = {
        lastColor: defaults.objectForKey("NoteHelper_LastColor") || 0,
        autoTimestamp: defaults.objectForKey("NoteHelper_AutoTimestamp") || false,
        noteCount: defaults.objectForKey("NoteHelper_NoteCount") || 0
      };
    },
    
    // 保存配置
    saveConfig: function() {
      let defaults = NSUserDefaults.standardUserDefaults();
      defaults.setObjectForKey(self.config.lastColor, "NoteHelper_LastColor");
      defaults.setObjectForKey(self.config.autoTimestamp, "NoteHelper_AutoTimestamp");
      defaults.setObjectForKey(self.config.noteCount, "NoteHelper_NoteCount");
    },
    
    // 点击插件图标 - 显示主菜单
    toggleAddon: function() {
      self.showMainMenu();
    },
    
    // 主菜单
    showMainMenu: function() {
      let alert = UIAlertView.alloc()
        .initWithTitleMessageDelegateCancelButtonTitleOtherButtonTitles(
          "🚀 智能笔记助手",
          `已处理 ${self.config.noteCount} 条笔记`,
          self,
          "关闭",
          [
            "🎨 快速标记颜色",
            "📅 添加时间戳",
            "📋 复制所有摘录",
            "📊 查看笔记统计",
            "⚙️ 设置"
          ]
        );
      alert.tag = 100;  // 标识这是主菜单
      alert.show();
    },
    
    // 处理菜单选择
    alertViewClickedButtonAtIndex: function(alertView, buttonIndex) {
      if (alertView.tag === 100) {  // 主菜单
        switch(buttonIndex) {
          case 0: // 关闭
            break;
          case 1: // 标记颜色
            self.showColorPicker();
            break;
          case 2: // 添加时间戳
            self.addTimestamp();
            break;
          case 3: // 复制摘录
            self.copyAllExcerpts();
            break;
          case 4: // 查看统计
            self.showStatistics();
            break;
          case 5: // 设置
            self.showSettings();
            break;
        }
      } else if (alertView.tag === 200) {  // 颜色选择器
        if (buttonIndex > 0) {
          self.applyColor(buttonIndex - 1);
        }
      }
    },
    
    // 功能1：颜色选择器
    showColorPicker: function() {
      let colors = [
        "⚪ 无色", "🔴 红色", "🟠 橙色", "🟡 黄色",
        "🟢 绿色", "🔵 蓝色", "🟣 紫色", "⚫ 灰色"
      ];
      
      // 标记上次使用的颜色
      colors[self.config.lastColor] = "✓ " + colors[self.config.lastColor];
      
      let alert = UIAlertView.alloc()
        .initWithTitleMessageDelegateCancelButtonTitleOtherButtonTitles(
          "选择颜色",
          "选中笔记后将应用颜色",
          self,
          "取消",
          colors
        );
      alert.tag = 200;
      alert.show();
    },
    
    // 应用颜色
    applyColor: function(colorIndex) {
      // 获取当前选中的笔记
      let studyController = Application.sharedInstance()
        .studyController(self.window);
      
      if (!studyController) {
        Application.sharedInstance().showHUD(
          "⚠️ 请先打开笔记本",
          self.window, 2
        );
        return;
      }
      
      // 这里简化处理，实际需要通过 MNNote API
      Application.sharedInstance().showHUD(
        `✅ 已应用颜色 #${colorIndex}`,
        self.window, 2
      );
      
      // 保存选择
      self.config.lastColor = colorIndex;
      self.config.noteCount++;
      self.saveConfig();
    },
    
    // 功能2：添加时间戳
    addTimestamp: function() {
      let now = new Date();
      let timestamp = `[📅 ${now.toLocaleDateString()} ${now.toLocaleTimeString()}]`;
      
      // 复制到剪贴板
      UIPasteboard.generalPasteboard().string = timestamp;
      
      Application.sharedInstance().showHUD(
        "✅ 时间戳已复制\n" + timestamp,
        self.window, 3
      );
      
      self.config.noteCount++;
      self.saveConfig();
    },
    
    // 功能3：复制所有摘录
    copyAllExcerpts: function() {
      // 简化示例 - 实际需要遍历笔记本
      let excerpts = [
        "摘录1：这是一个示例摘录",
        "摘录2：另一个示例摘录",
        "摘录3：第三个示例摘录"
      ];
      
      let text = excerpts.join("\n\n");
      UIPasteboard.generalPasteboard().string = text;
      
      Application.sharedInstance().showHUD(
        `✅ 已复制 ${excerpts.length} 条摘录`,
        self.window, 2
      );
    },
    
    // 功能4：显示统计
    showStatistics: function() {
      let message = `📊 笔记统计\n\n` +
                   `总处理数：${self.config.noteCount} 条\n` +
                   `最常用颜色：#${self.config.lastColor}\n` +
                   `自动时间戳：${self.config.autoTimestamp ? '开启' : '关闭'}`;
      
      let alert = UIAlertView.alloc()
        .initWithTitleMessageDelegateCancelButtonTitleOtherButtonTitles(
          "统计信息",
          message,
          self,
          "确定",
          null
        );
      alert.show();
    },
    
    // 功能5：设置
    showSettings: function() {
      let status = self.config.autoTimestamp ? "✅ 已开启" : "❌ 已关闭";
      
      let alert = UIAlertView.alloc()
        .initWithTitleMessageDelegateCancelButtonTitleOtherButtonTitles(
          "设置",
          `自动时间戳：${status}`,
          self,
          "取消",
          ["切换自动时间戳", "重置统计"]
        );
      alert.tag = 300;
      alert.show();
    },
    
    // 选中文本时自动处理
    onPopupMenuOnSelection: function(sender) {
      if (self.config.autoTimestamp) {
        // 自动添加时间戳
        let now = new Date();
        let timestamp = `[${now.toLocaleTimeString()}] `;
        
        Application.sharedInstance().showHUD(
          "📅 已自动添加时间戳",
          self.window, 1
        );
      }
    }
    
  });
};
```

这个插件展示了：
- 🔄 配置的保存和加载
- 🎛️ 多级菜单的使用
- 📋 剪贴板操作
- 📊 数据统计
- ⚙️ 用户设置管理

## 第二站小结 🎉

**你学会了：**
- ✅ 插件的 5 个响应时刻
- ✅ 3 种用户交互方式
- ✅ 保存和读取配置
- ✅ 错误处理
- ✅ 完整的实战项目

**下一步：**
下一站，我们将学习 MNUtils —— 这个超强大的工具库将让你的插件开发变得更简单！

---

# 第三站：MNUtils - 你的超能力工具箱

## 什么是 MNUtils？

想象一下：
- 原生 API：你需要写 10 行代码才能获取一个笔记
- MNUtils：一行搞定！

MNUtils 就是一个超级工具箱，里面有 500+ 个现成的工具，让你专注于实现功能，而不是纠结于复杂的 API。

### 对比一下就知道了

```javascript
// 😩 不用 MNUtils - 好复杂！
let studyController = Application.sharedInstance().studyController(self.window);
let notebookController = studyController.notebookController;
let notebook = notebookController.notebook;
let notebookId = notebook.topicId;

// 😄 用 MNUtils - 太简单了！
let notebookId = MNUtil.currentNotebook.topicId;
```

## 快速安装 MNUtils

### 方法 1：先安装 MNUtils 插件（推荐）

1. 下载 MNUtils 插件
2. 双击安装
3. 在你的插件中加载它：

```javascript
JSB.newAddon = function(mainPath) {
  return JSB.defineClass('YourPlugin : JSExtension', {
    
    sceneWillConnect: function() {
      self.mainPath = mainPath;
      
      // 加载 MNUtils
      try {
        JSB.require('mnutils');
        MNUtil.init(self.mainPath);
        MNUtil.showHUD("✅ MNUtils 已加载！");
      } catch (error) {
        Application.sharedInstance().showHUD(
          "⚠️ 请先安装 MNUtils 插件",
          self.window, 3
        );
      }
    }
  });
};
```

### 方法 2：内置到你的插件（独立运行）

把 `mnutils.js` 文件复制到你的插件目录，然后：

```javascript
JSB.require('mnutils');  // 加载本地文件
MNUtil.init(mainPath);
```

## MNUtils 最常用的 10 个功能

别被 500+ 个 API 吓到！你只需要掌握这 10 个最常用的：

### 1. 显示提示
```javascript
MNUtil.showHUD("操作成功！");           // 默认 2 秒
MNUtil.showHUD("提示内容", 5);        // 显示 5 秒
MNUtil.waitHUD("加载中...");          // 持续显示
MNUtil.stopHUD();                   // 停止显示
```

### 2. 获取当前笔记
```javascript
let note = MNNote.getFocusNote();   // 获取选中的笔记
if (note) {
  note.noteTitle = "新标题";        // 修改标题
  note.color = 3;                  // 设置颜色（黄色）
}
```

### 3. 获取当前笔记本
```javascript
let notebook = MNUtil.currentNotebook;
MNUtil.showHUD(`笔记本：${notebook.title}`);
MNUtil.showHUD(`共 ${notebook.notes.length} 条笔记`);
```

### 4. 剪贴板操作
```javascript
MNUtil.copy("这段文本被复制了");      // 复制文本
let text = MNUtil.paste();          // 粘贴文本
MNUtil.copyJSON({name: "对象"});   // 复制对象
```

### 5. 弹出选择框
```javascript
MNUtil.select("选择一个", ["选项A", "选项B", "选项C"]).then(index => {
  if (index >= 0) {
    MNUtil.showHUD(`你选了：${index}`);
  }
});
```

### 6. 输入框
```javascript
MNUtil.input("请输入", "提示文字", "默认值").then(text => {
  if (text) {
    MNUtil.showHUD(`你输入了：${text}`);
  }
});
```

### 7. 确认框
```javascript
MNUtil.confirm("确认操作", "真的要删除吗？").then(ok => {
  if (ok) {
    // 用户点了确认
    MNUtil.showHUD("已删除");
  }
});
```

### 8. 延时执行
```javascript
MNUtil.delay(2).then(() => {
  MNUtil.showHUD("2 秒后执行");
});
```

### 9. 文件操作
```javascript
// 读写文本文件
let content = MNUtil.readText("/path/to/file.txt");
MNUtil.writeText("/path/to/file.txt", "新内容");

// 读写 JSON
let data = MNUtil.readJSON("/path/to/data.json");
MNUtil.writeJSON("/path/to/data.json", {key: "value"});
```

### 10. 错误处理
```javascript
try {
  // 可能出错的代码
} catch (error) {
  MNUtil.addErrorLog(error, "函数名", {参数: "xxx"});
  MNUtil.showHUD("操作失败：" + error.message);
}
```

就是这么简单！掌握这 10 个，你就能做 80% 的事情了。

## 实战：用 MNUtils 做个笔记管理器

让我们用 MNUtils 做个实用的笔记管理器：

```javascript
JSB.newAddon = function(mainPath) {
  return JSB.defineClass('NoteManager : JSExtension', {
    
    sceneWillConnect: function() {
      self.mainPath = mainPath;
      
      // 加载 MNUtils
      try {
        JSB.require('mnutils');
        MNUtil.init(self.mainPath);
      } catch (error) {
        Application.sharedInstance().showHUD(
          "请先安装 MNUtils",
          self.window, 3
        );
        return;
      }
      
      MNUtil.showHUD("📁 笔记管理器已启动");
    },
    
    // 点击插件图标
    toggleAddon: function() {
      self.showMenu();
    },
    
    // 显示主菜单
    showMenu: function() {
      MNUtil.select("📁 笔记管理器", [
        "🎨 批量设置颜色",
        "🏷️ 批量添加标签",
        "📋 导出所有摘录",
        "📊 查看笔记统计",
        "🔍 搜索笔记"
      ]).then(index => {
        switch(index) {
          case 0: self.batchSetColor(); break;
          case 1: self.batchAddTag(); break;
          case 2: self.exportExcerpts(); break;
          case 3: self.showStatistics(); break;
          case 4: self.searchNotes(); break;
        }
      });
    },
    
    // 功能1：批量设置颜色
    batchSetColor: function() {
      // 获取选中的笔记
      let notes = MNNote.getSelectedNotes();
      
      if (notes.length === 0) {
        MNUtil.showHUD("⚠️ 请先选择笔记");
        return;
      }
      
      // 选择颜色
      MNUtil.select("选择颜色", [
        "⚪ 无色", "🔴 红色", "🟠 橙色", "🟡 黄色",
        "🟢 绿色", "🔵 蓝色", "🟣 紫色", "⚫ 灰色"
      ]).then(colorIndex => {
        if (colorIndex >= 0) {
          // 使用 MNUtil 的批量操作
          MNUtil.undoGrouping(() => {
            notes.forEach(note => {
              note.color = colorIndex;
            });
          });
          
          MNUtil.showHUD(`✅ 已设置 ${notes.length} 个笔记的颜色`);
        }
      });
    },
    
    // 功能2：批量添加标签
    batchAddTag: async function() {
      let notes = MNNote.getSelectedNotes();
      
      if (notes.length === 0) {
        MNUtil.showHUD("⚠️ 请先选择笔记");
        return;
      }
      
      // 输入标签
      let tag = await MNUtil.input("添加标签", "输入标签内容（如 #重要）", "#");
      
      if (tag) {
        if (!tag.startsWith("#")) tag = "#" + tag;
        
        MNUtil.undoGrouping(() => {
          notes.forEach(note => {
            note.noteTitle = (note.noteTitle || "") + " " + tag;
          });
        });
        
        MNUtil.showHUD(`✅ 已为 ${notes.length} 个笔记添加标签`);
      }
    },
    
    // 功能3：导出所有摘录
    exportExcerpts: function() {
      let notebook = MNUtil.currentNotebook;
      if (!notebook) {
        MNUtil.showHUD("⚠️ 请先打开笔记本");
        return;
      }
      
      // 收集所有摘录
      let excerpts = [];
      notebook.notes.forEach(note => {
        if (note.excerptText) {
          excerpts.push(`[${note.noteTitle || '无标题'}] ${note.excerptText}`);
        }
      });
      
      if (excerpts.length > 0) {
        // 复制到剪贴板
        MNUtil.copy(excerpts.join("\n\n"));
        MNUtil.showHUD(`✅ 已复制 ${excerpts.length} 条摘录`);
      } else {
        MNUtil.showHUD("⚠️ 没有找到摘录");
      }
    },
    
    // 功能4：查看统计
    showStatistics: function() {
      let notebook = MNUtil.currentNotebook;
      if (!notebook) {
        MNUtil.showHUD("⚠️ 请先打开笔记本");
        return;
      }
      
      let stats = {
        total: notebook.notes.length,
        withTitle: 0,
        withExcerpt: 0,
        withComment: 0,
        colors: {}
      };
      
      notebook.notes.forEach(note => {
        if (note.noteTitle) stats.withTitle++;
        if (note.excerptText) stats.withExcerpt++;
        if (note.comments && note.comments.length > 0) stats.withComment++;
        
        let color = note.color || 0;
        stats.colors[color] = (stats.colors[color] || 0) + 1;
      });
      
      let message = `📊 笔记统计\n\n` +
                   `总数：${stats.total}\n` +
                   `有标题：${stats.withTitle}\n` +
                   `有摘录：${stats.withExcerpt}\n` +
                   `有评论：${stats.withComment}\n` +
                   `颜色分布：${JSON.stringify(stats.colors)}`;
      
      MNUtil.alert("笔记统计", message);
    },
    
    // 功能5：搜索笔记
    searchNotes: async function() {
      let keyword = await MNUtil.input("搜索笔记", "输入关键词", "");
      
      if (!keyword) return;
      
      let notebook = MNUtil.currentNotebook;
      if (!notebook) {
        MNUtil.showHUD("⚠️ 请先打开笔记本");
        return;
      }
      
      // 搜索笔记
      let results = [];
      notebook.notes.forEach(note => {
        let text = (note.noteTitle || "") + " " + (note.excerptText || "");
        if (text.toLowerCase().includes(keyword.toLowerCase())) {
          results.push(note);
        }
      });
      
      if (results.length > 0) {
        MNUtil.showHUD(`找到 ${results.length} 个结果`);
        
        // 选中第一个结果
        results[0].focusInMindMap();
      } else {
        MNUtil.showHUD("⚠️ 没有找到相关笔记");
      }
    }
  });
};
```

这个示例展示了 MNUtils 的强大之处：
- 🚀 代码量减少 70%
- 🎯 专注于业务逻辑
- 🔒 内置错误处理
- 🎉 更好的用户体验

## 第三站小结 🚀

**你学会了：**
- ✅ 安装和加载 MNUtils
- ✅ 10 个最常用的 API
- ✅ 用 MNUtils 开发完整插件
- ✅ 批量操作和撤销分组

**接下来：**
恭喜你！你已经掌握了 MarginNote 插件开发的核心技能。现在你可以：
1. 开发自己的插件
2. 参考其他优秀插件的源码
3. 加入社区，分享你的作品

## 附录：进阶资源

如果你想深入学习：

### 📚 API 文档
- MNUtils API 指南：`mnutils/MNUtils_API_Guide.md`
- 源码参考：`mnutils/mnutils.js`

### 🌟 优秀插件源码
- **MNAI**：AI 集成示例
- **MNOCR**：图像识别示例
- **MNWebDAV**：文件同步示例

### 👥 社区资源
- MarginNote 论坛
- GitHub 插件仓库
- 微信交流群

---

**祝你开发愉快！** 🎉

如果这个教程对你有帮助，欢迎分享给更多人！
