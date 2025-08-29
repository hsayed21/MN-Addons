# 📚 MarginNote 插件开发：从 JavaScript 零基础到入门

> 🎯 **本文目标**：让完全没有编程经验的小白，通过 MarginNote 插件的实际代码，理解 JavaScript 的核心概念，最终能够开发简单的插件。

## 📖 前言：为什么要学 JavaScript？

如果你是 MarginNote 的深度用户，一定用过各种插件：MNUtils、MNToolbar、MNChatGLM 等。这些插件都是用 JavaScript 编写的。学会 JavaScript，你就能：

1. **定制自己的工作流**：不再受限于现有功能
2. **理解插件的工作原理**：知其然，更知其所以然
3. **参与社区贡献**：帮助改进现有插件

本文将通过分析真实的插件代码，让你在理解 JavaScript 的同时，掌握 MarginNote 插件开发。

---

## 第一部分：JavaScript 基础概念

### 1.1 变量和数据类型 - 存储信息的容器

#### 什么是变量？

想象你有很多盒子，每个盒子上贴着标签，里面装着不同的东西。在编程中，变量就是这样的"盒子"。

让我们看 **mnutils/mnutils.js** 中的实际例子：

```javascript
// mnutils.js:174-180 行
class MNLog {
  static logs = []  // 这是一个变量，存储所有日志
  
  static updateLog(log){
    // log 是参数变量，存储传入的日志内容
    if (subscriptionUtils.subscriptionController) {
      subscriptionUtils.subscriptionController?.appendLog(log)
    }
  }
}
```

#### JavaScript 中的数据类型

在 MarginNote 插件中，你会经常遇到这些数据类型：

##### 1. **字符串（String）** - 文本内容

```javascript
// mntoolbar/xdyy_button_registry.js 的实际例子
global.registerButton("custom15", {
  name: "时间戳",        // 字符串：按钮显示的文字
  image: "custom15",     // 字符串：图标文件名
  templateName: "menu_timestamp"  // 字符串：菜单模板名
});
```

##### 2. **数字（Number）** - 数值

```javascript
// mnutils.js:3067 行 - MNNote 类中
note.colorIndex = 3;     // 数字：颜色索引（0-15）
note.fillIndex = 0;      // 数字：填充样式索引
menu.rowHeight = 35;     // 数字：菜单行高（像素）
```

##### 3. **布尔值（Boolean）** - 真/假

```javascript
// mnutils.js:2145 行
class MNUtil {
  static onAlert = false  // 布尔值：是否正在显示对话框
  
  static showHUD(message, duration = 2) {
    if (this.onAlert) {  // 检查布尔值
      return;  // 如果正在显示，直接返回
    }
    // 显示提示...
  }
}
```

##### 4. **数组（Array）** - 有序列表

```javascript
// mntoolbar/xdyy_menu_registry.js 的实际例子
global.registerMenuTemplate("menu_timestamp", {
  menuItems: [  // 数组：包含多个菜单项
    { action: "addTimestamp", menuTitle: "添加到标题" },
    { action: "addTimestampComment", menuTitle: "添加为评论" },
    { action: "copyTimestamp", menuTitle: "复制时间戳" }
  ]
});
```

##### 5. **对象（Object）** - 键值对集合

```javascript
// mnutils.js - 一个笔记对象的结构
const noteInfo = {
  noteId: "38ACB470-803E-4EE8-B7DD-1BF4722AB0FE",  
  title: "【定义】JavaScript 变量",
  colorIndex: 3,
  comments: ["这是评论1", "这是评论2"],
  parentNote: null  // null 表示"空"，没有父笔记
};
```

#### 🤔 思考题

在上面的代码中，你能找出：
1. 哪些是字符串？（提示：用引号包围的）
2. 哪些是数字？（提示：没有引号的数值）
3. 哪些是数组？（提示：用 [] 包围的）

---

### 1.2 函数的三种形式 - 执行任务的代码块

函数就像是一个"机器"，你给它输入（参数），它执行一些操作，然后给你输出（返回值）。

#### 形式1：普通函数声明

```javascript
// mnutils.js:102 行 - Menu 类中
function strCode(str) {
  // 计算字符串的显示宽度
  let width = 0;
  for (let i = 0; i < str.length; i++) {
    if (str.charCodeAt(i) > 127) {
      width += 2;  // 中文字符算2个宽度
    } else {
      width += 1;  // 英文字符算1个宽度
    }
  }
  return width;
}
```

**特点**：
- 用 `function` 关键字开头
- 有函数名（strCode）
- 可以在声明之前调用（提升特性）

#### 形式2：箭头函数

```javascript
// mntoolbar/webviewController.js:1026 行
const getToolbarController = () => self

// 更复杂的例子
const titles = items.map(item => item.title)
// 等价于：
const titles = items.map(function(item) {
  return item.title;
})
```

**特点**：
- 用 `=>` 符号（像箭头）
- 更简洁的语法
- `this` 绑定不同（后面会详细讲）

#### 形式3：对象的方法

```javascript
// mnutils.js:53-58 行 - Menu 类中
class Menu {
  // 这是类的方法
  addMenuItem(title, selector, params = "", checked = false) {
    this.commandTable.push({
      title: title,
      object: this.delegate,
      selector: selector,
      param: params,
      checked: checked
    })
  }
}
```

**什么时候用哪种？**

1. **普通函数**：独立的功能，如工具函数
2. **箭头函数**：简短的回调，如 map、filter
3. **方法**：属于对象或类的功能

---

### 1.3 对象和类 - 理解面向对象编程

这是最重要的概念之一，让我们用生活例子来理解。

#### 类比：类是"模具"，对象是"产品"

想象你在做月饼：
- **类（Class）**= 月饼模具
- **对象（Object）**= 用模具做出的一个个月饼
- **属性（Property）**= 月饼的特征（口味、重量）
- **方法（Method）**= 月饼能做的事（被吃、被包装）

#### 真实代码例子：MNNote 类

```javascript
// mnutils.js:3063-3068 行
class MNNote {
  // 构造函数 - 创建新笔记对象时调用
  constructor(note, alert = true) {
    if (typeof note === "string") {
      // 如果传入的是字符串ID，去数据库查找
      this.note = MNUtil.db.getNoteById(note);
    } else {
      // 如果传入的是笔记对象，直接使用
      this.note = note;
    }
  }
  
  // 实例属性 - 每个笔记对象都有的特征
  get noteId() {
    return this.note.noteId;
  }
  
  get title() {
    return this.note.noteTitle;
  }
  
  // 实例方法 - 每个笔记对象都能做的事
  appendComment(text) {
    // 给这个笔记添加评论
    this.note.appendTextComment(text);
  }
}

// 使用类创建对象
const myNote = new MNNote("38ACB470-803E-4EE8-B7DD-1BF4722AB0FE");
myNote.appendComment("这是一条评论");  // 调用实例方法
```

#### 什么是实例？

**实例就是用类创建出来的具体对象**。就像：
- `MNNote` 是类（月饼模具）
- `myNote` 是实例（一个具体的月饼）

你可以用同一个类创建多个实例：

```javascript
const note1 = new MNNote("ID-001");  // 第一个笔记实例
const note2 = new MNNote("ID-002");  // 第二个笔记实例
const note3 = new MNNote("ID-003");  // 第三个笔记实例

// 每个实例都是独立的
note1.appendComment("笔记1的评论");
note2.appendComment("笔记2的评论");
```

---

## 第二部分：类的深入理解

### 2.1 类方法 vs 实例方法 - static 的秘密

这是初学者最困惑的地方：为什么有些方法要加 `static`，有些不加？

#### 生活类比

想象一个"汽车工厂"：
- **类方法（static）**= 工厂的功能（统计生产了多少辆车）
- **实例方法**= 每辆车的功能（启动、刹车、加速）

#### 真实代码对比

让我们看 **mnutils.js** 中 MNUtil 类的设计：

```javascript
// mnutils.js:2142-2200 行（简化版）
class MNUtil {
  // 类方法（static） - 不需要创建实例就能用
  static showHUD(message, duration = 2) {
    // 显示提示信息
    // 直接调用：MNUtil.showHUD("保存成功！")
  }
  
  static copy(object) {
    // 复制到剪贴板
    // 直接调用：MNUtil.copy("要复制的文本")
  }
  
  static get app() {
    // 获取应用实例
    return Application.sharedInstance();
  }
}

// ❌ 错误用法：
const util = new MNUtil();  // MNUtil 不需要实例化！
util.showHUD("消息");        // 错误！

// ✅ 正确用法：
MNUtil.showHUD("消息");     // 直接通过类名调用
```

再看 MNNote 类的设计：

```javascript
// mnutils.js:3063-3200 行（简化版）
class MNNote {
  // 实例方法 - 需要先创建实例
  appendComment(text) {
    this.note.appendTextComment(text);
    // this 指向当前实例
  }
  
  // 静态方法 - 获取笔记的工具方法
  static getFocusNote() {
    // 获取当前选中的笔记
    const noteId = MNUtil.studyController.focusNote;
    if (noteId) {
      return new MNNote(noteId);  // 返回一个实例
    }
    return null;
  }
}

// 使用示例：
const focusNote = MNNote.getFocusNote();  // 静态方法，获取实例
if (focusNote) {
  focusNote.appendComment("新评论");      // 实例方法，操作具体笔记
}
```

#### 为什么要这样设计？

1. **静态方法用于**：
   - 工具函数（MNUtil.showHUD）
   - 工厂方法（MNNote.getFocusNote）
   - 不依赖具体实例的功能

2. **实例方法用于**：
   - 操作具体对象的数据（note.appendComment）
   - 需要访问 `this` 的功能
   - 每个实例可能有不同行为的功能

#### 🎯 判断技巧

问自己一个问题：**这个功能是属于"类本身"还是属于"某个具体对象"？**

- 显示提示框 → 类本身的功能 → static
- 给某个笔记添加评论 → 具体笔记的功能 → 实例方法

---

### 2.2 prototype 原型链 - JavaScript 的继承机制

#### 什么是 prototype？

在 JavaScript 中，每个函数都有一个 `prototype` 属性，它是实现继承的关键。

让我们看 **mntoolbar/main.js** 中的实际应用：

```javascript
// mntoolbar/main.js:216-250 行
JSB.defineClass(
  'MNToolbar : JSExtension',  // MNToolbar 继承自 JSExtension
  {
    // 这些方法会被添加到 MNToolbar.prototype
    sceneWillConnect: function() {
      // 应用启动时调用
    },
    
    notebookWillOpen: function(topicid) {
      // 打开笔记本时调用
    },
    
    queryAddonCommandStatus: function() {
      // 查询插件状态
      return {
        image: "logo.png",
        object: self,
        selector: "toggleToolbar:",
        checked: self.status == 1
      };
    }
  }
);
```

#### 为什么用 JSB.defineClass 而不是 class？

这是 MarginNote 的特殊性：需要与 Objective-C 交互。

```javascript
// 普通 JavaScript 类（不能用于 MN 插件主类）
class MyClass extends ParentClass {
  method() { }
}

// MarginNote 插件必须用 JSB.defineClass
JSB.defineClass('MyPlugin : JSExtension', {
  // 方法定义
});
```

#### prototype 扩展的实际应用

看看 **mnutils/xdyyutils.js** 如何扩展原生对象：

```javascript
// xdyyutils.js - String 原型扩展
String.prototype.trimStart = function() {
  // 删除字符串开头的空白
  return this.replace(/^\s+/, '');
};

String.prototype.trimEnd = function() {
  // 删除字符串结尾的空白
  return this.replace(/\s+$/, '');
};

// 使用扩展后的方法
let text = "  你好，世界  ";
text = text.trimStart();  // "你好，世界  "
text = text.trimEnd();    // "你好，世界"
```

#### 原型链的工作原理

```javascript
// 当你调用 note.appendComment() 时：
// 1. 先在 note 对象自身查找 appendComment
// 2. 没找到，去 note.__proto__（即 MNNote.prototype）查找
// 3. 找到了就执行，没找到继续向上查找

// 可视化原型链：
note (实例)
  ↓
MNNote.prototype
  ↓
Object.prototype
  ↓
null
```

---

### 2.3 构造函数和 this - 对象的初始化

#### 构造函数是什么？

构造函数是创建对象时自动调用的特殊方法，用来初始化对象。

```javascript
// mnutils.js:12-22 行 - Menu 类的构造函数
class Menu {
  constructor(sender, delegate, width = undefined, preferredPosition = 2) {
    // this 指向正在创建的新对象
    this.menuController = MenuController.new()
    this.delegate = delegate
    this.sender = sender
    this.commandTable = []
    this.menuController.rowHeight = 35
    this.preferredPosition = preferredPosition
    
    if (width && width > 100) {
      this.width = width
    }
  }
}

// 创建实例时，constructor 自动执行
const menu = new Menu(button, self, 250, 2);
// 此时 menu 对象已经有了所有属性
```

#### this 的含义

`this` 是 JavaScript 中最令人困惑的概念之一。它的值取决于函数的调用方式。

```javascript
// 在类方法中，this 指向实例
class MNNote {
  appendComment(text) {
    this.note.appendTextComment(text);  // this = 当前笔记实例
  }
}

// 在普通函数中，this 可能不确定
function showThis() {
  console.log(this);  // 取决于如何调用
}

// 箭头函数继承外部的 this
class Controller {
  init() {
    // 普通函数
    setTimeout(function() {
      console.log(this);  // this = window/undefined
    }, 1000);
    
    // 箭头函数
    setTimeout(() => {
      console.log(this);  // this = Controller 实例
    }, 1000);
  }
}
```

#### self 的特殊用法

在 MarginNote 插件中，你会经常看到 `self` 变量：

```javascript
// mntoolbar/webviewController.js:1026 行
const getToolbarController = () => self

// 为什么要这样写？
// 因为在 JSB.defineClass 中，this 可能会变化
// 所以用 self 保存正确的引用
```

### 2.4 单例模式 - sharedInstance() 的秘密

这是 MarginNote 插件开发中一个非常重要但经常被忽略的概念。

#### 生活化理解：校长办公室的例子

想象一下：
- 你的学校只有**一个校长办公室**
- 无论从哪栋楼、哪个入口，"去校长办公室"都是去**同一个地方**
- 不可能有两个校长办公室同时存在

在编程中，**单例模式**就是这样的概念：
- `Application.sharedInstance()` = 去校长办公室
- 无论调用多少次，都返回**同一个应用实例**
- 整个 MarginNote 程序只有一个应用对象

#### 单例 vs new 的本质区别

让我们用代码来理解：

```javascript
// 🏫 单例模式：Application（相当于校长办公室）
const app1 = Application.sharedInstance();
const app2 = Application.sharedInstance();
const app3 = Application.sharedInstance();

console.log(app1 === app2);  // true - 是同一个对象！
console.log(app2 === app3);  // true - 还是同一个对象！
console.log("应用实例数量：", "只有1个");

// 🏗️ new 操作：创建新对象（相当于盖新房子）
class MyClass {
  constructor(name) {
    this.name = name;
  }
}

const obj1 = new MyClass("对象1");
const obj2 = new MyClass("对象2");
const obj3 = new MyClass("对象3");

console.log(obj1 === obj2);  // false - 是不同对象！
console.log(obj2 === obj3);  // false - 每次都是新对象！
console.log("对象数量：", "每次 new 都创建一个新的");
```

#### 形象对比

| 特性 | 单例模式 | new 操作 |
|------|----------|-----------|
| **概念** | 校长办公室（全校唯一） | 盖房子（想盖多少盖多少） |
| **实例数量** | 永远只有1个 | 每次 new 创建1个 |
| **获取方式** | `Class.sharedInstance()` | `new Class()` |
| **内存使用** | 节省（共享一个对象） | 每个对象占用独立内存 |
| **状态管理** | 全局共享状态 | 每个实例独立状态 |

#### MarginNote 中的单例家族

在 MarginNote 插件开发中，有很多重要的单例：

```javascript
// 🏢 应用管理员 - 管理整个 MarginNote 应用
const app = Application.sharedInstance();
app.showHUD("Hello World!", app.focusWindow, 2);

// 🗃️ 数据库管理员 - 管理所有笔记和文档
const db = Database.sharedInstance();
const note = db.getNoteById("some-note-id");

// 🔧 设置管理员 - 管理用户偏好设置
const settings = NSUserDefaults.standardUserDefaults();
settings.setObjectForKey("my-value", "my-key");

// 📢 消息中心 - 管理应用内通信
const center = NSNotificationCenter.defaultCenter();
center.addObserverSelectorName(self, "onSomeEvent:", "SomeEvent");
```

#### 为什么 MarginNote 要用单例？

1. **避免冲突**：
   ```javascript
   // ❌ 如果有多个应用实例，会很混乱
   const app1 = new Application();  // 假设可以这样做
   const app2 = new Application();  // 又创建了一个？
   app1.showHUD("消息1");            // 在哪个应用显示？
   app2.showHUD("消息2");            // 又在哪个显示？
   
   // ✅ 单例模式避免了这个问题
   const app = Application.sharedInstance();  // 总是同一个
   app.showHUD("消息");                       // 明确在当前应用显示
   ```

2. **全局状态管理**：
   ```javascript
   // 所有插件都能访问同一个数据库
   const db = Database.sharedInstance();
   
   // 插件A 创建笔记
   const newNote = db.createNote("标题");
   
   // 插件B 立即能看到插件A创建的笔记
   const sameNote = db.getNoteById(newNote.noteId);
   ```

3. **资源共享**：
   ```javascript
   // 所有插件共享同一个设置系统
   const settings = NSUserDefaults.standardUserDefaults();
   
   // 插件A 保存设置
   settings.setObjectForKey("dark", "theme");
   
   // 插件B 能读取插件A的设置
   const theme = settings.objectForKey("theme");  // "dark"
   ```

#### 实战中的常见错误

```javascript
// ❌ 错误思维：想要"创建"应用
const myApp = new Application();  // 这样做不了！MarginNote不允许

// ✅ 正确思维：获取已存在的应用
const app = Application.sharedInstance();  // 获取系统提供的唯一实例

// ❌ 错误：重复获取并担心性能
const app1 = Application.sharedInstance();
const app2 = Application.sharedInstance();  // 担心：这会创建第二个吗？
// 答案：不会！它们是同一个对象

// ✅ 正确：放心使用，可以多次获取
function showMessage(msg) {
  Application.sharedInstance().showHUD(msg, 
    Application.sharedInstance().focusWindow, 2);
  // 两次调用返回的是同一个对象，没有性能问题
}
```

#### 🤔 思考题

1. 如果 `Database.sharedInstance()` 不是单例，会发生什么问题？
2. 为什么浏览器的 `window` 对象也是单例？
3. 你能想到其他需要用单例模式的场景吗？

#### 💡 记忆技巧

记住这个口诀：**"shared 表示共享，Instance 表示实例，sharedInstance 就是大家共享的那一个实例"**

---

## 第三部分：MarginNote 插件特殊语法

### 3.1 JSB.defineClass - 与 Objective-C 的桥梁

MarginNote 插件系统建立在 JSBridge 之上，这让 JavaScript 可以调用 iOS 原生功能。

#### 标准插件结构

```javascript
// 每个插件的 main.js 都有类似结构
JSB.newAddon = function() {
  // 1. 定义插件主类
  JSB.defineClass(
    'MNToolbar : JSExtension',  // 类名 : 父类
    {
      // 2. 生命周期方法
      sceneWillConnect: function() {
        // 应用窗口连接时
        self = MNToolbar.new();  // 创建实例并保存到 self
      },
      
      sceneDidDisconnect: function() {
        // 应用窗口断开时
      },
      
      notebookWillOpen: function(topicid) {
        // 笔记本打开时
        // topicid 是笔记本ID
      },
      
      notebookWillClose: function(topicid) {
        // 笔记本关闭时
      },
      
      documentDidOpen: function(docmd5) {
        // 文档打开时
        // docmd5 是文档的MD5标识
      },
      
      // 3. 事件处理方法
      onPopupMenuOnNote: function(sender) {
        // 笔记上的弹出菜单
        return [{
          title: "我的功能",
          object: self,
          selector: "myFunction:"
        }];
      },
      
      // 4. 自定义方法
      myFunction: function(note) {
        // 处理笔记
        MNUtil.showHUD("处理笔记：" + note.noteTitle);
      }
    },
    {
      // 类方法（静态方法）
    }
  );
  
  // 返回插件类
  return MNToolbar;
};
```

#### 与普通 JavaScript 类的区别

| 特性 | JSB.defineClass | ES6 class |
|------|----------------|-----------|
| 用途 | 主插件类，需要与 ObjC 交互 | 纯 JavaScript 类 |
| 继承 | 通过字符串指定父类 | 使用 extends 关键字 |
| 方法定义 | 对象字面量形式 | 类方法语法 |
| this 绑定 | 需要特别注意，常用 self | 自动绑定 |

---

### 3.2 异步编程 - async/await 的应用

#### 为什么需要异步？

让我们从最基础的概念开始理解：

##### 同步 vs 异步

**同步**：一件事做完再做下一件事
```javascript
console.log("第1步");
console.log("第2步"); 
console.log("第3步");
// 按顺序执行：1→2→3
```

**异步**：不等第一件事做完，就可以做其他事
```javascript
console.log("第1步");
setTimeout(() => console.log("第2步"), 1000); // 1秒后执行
console.log("第3步");
// 实际执行顺序：1→3→(1秒后)2
```

想象你在餐厅点餐：
- **同步**：点完菜站在那里等，菜好了才能做其他事（浪费时间）
- **异步**：点完菜去找座位，菜好了服务员会叫你（高效）

在编程中，网络请求、文件读写、定时器等耗时操作都应该异步执行。

#### 理解 Promise - 异步编程的核心

##### Promise 是什么？

Promise 就是一个**"盒子"**，这个盒子用来装"未来的结果"：

```javascript
// Promise = 一个装未来结果的盒子
let 盒子 = new Promise((resolve, reject) => {
  // 这里决定什么时候往盒子里放东西
  
  setTimeout(() => {
    resolve("礼物");  // 1秒后，往盒子里放"礼物"
  }, 1000);
});

// 打开盒子看结果
盒子.then(里面的东西 => {
  console.log(里面的东西);  // "礼物"
});
```

##### Promise 的三种状态

1. **等待中**（pending）：盒子是空的，在等东西
2. **成功**（resolved）：盒子里装了结果
3. **失败**（rejected）：盒子里装了错误信息

##### resolve 和 reject 是什么？

`resolve` 和 `reject` 不是特殊函数，只是参数名：

```javascript
// 这两个写法完全等价
new Promise((resolve, reject) => {
  resolve("成功");
  reject("失败");
});

new Promise((成功函数, 失败函数) => {
  成功函数("成功");
  失败函数("失败");
});
```

- 第一个参数（通常叫 resolve）= 成功时调用
- 第二个参数（通常叫 reject）= 失败时调用

##### 参数的作用和传递

```javascript
function 读取文件(文件名) {
  return new Promise((resolve, reject) => {
    if (文件存在) {
      resolve("文件内容");  // 把"文件内容"传出去
    } else {
      reject("文件不存在");  // 把错误信息传出去
    }
  });
}

// 接收参数 - 方式1：用 await
try {
  let 结果 = await 读取文件("test.txt");
  console.log(结果);  // "文件内容" ← resolve的参数
} catch(错误) {
  console.log(错误);  // "文件不存在" ← reject的参数
}

// 接收参数 - 方式2：用 .then()
读取文件("test.txt")
  .then(结果 => {
    console.log(结果);  // "文件内容" ← resolve的参数
  })
  .catch(错误 => {
    console.log(错误);  // "文件不存在" ← reject的参数
  });
```

#### 回调地狱问题及解决

##### 传统回调的问题

```javascript
// 传统回调写法 - 层层嵌套，难以阅读
delay(1, function() {
  console.log("1秒后");
  delay(1, function() {
    console.log("再1秒后");
    delay(1, function() {
      console.log("再再1秒后");
      // 越嵌越深，像地狱一样
    });
  });
});
```

##### Promise 链式调用

```javascript
// Promise 链式调用 - 稍好一些
delay(1)
  .then(() => {
    console.log("1秒后");
    return delay(1);
  })
  .then(() => {
    console.log("2秒后");
    return delay(1);
  })
  .then(() => {
    console.log("3秒后");
  });
```

#### MarginNote 中的 delay 函数详解

让我们深入理解 MNUtil.delay 函数：

```javascript
// mnutils.js 中的实际代码
static async delay(seconds) {
  return new Promise((resolve, reject) => {
    // NSTimer 是 MarginNote 提供的定时器
    NSTimer.scheduledTimerWithTimeInterval(seconds, false, function() {
      resolve();  // 时间到了，调用 resolve 表示"完成"
    });
  });
}
```

**这个函数在做什么？**
1. 创建一个 Promise（承诺）
2. 设置 NSTimer 定时器等待 X 秒
3. 时间到了，调用 resolve() 告诉 Promise "完成了"
4. 注意：resolve() 没有参数，因为我们只需要"等待完成"的信号

**为什么要包装成 Promise？**
- NSTimer 使用回调方式，不支持 await
- 包装成 Promise 后，就可以用现代的 async/await 语法

#### async 和 await 详解

##### await 是什么？

`await` = "等待"，让异步代码看起来像同步：

```javascript
// 不用 await - 不会等待
delay(1);
console.log("立即执行，不等1秒");

// 用 await - 会等待
await delay(1);
console.log("1秒后才执行");
```

##### async 函数的要求

函数里用了 `await`，就必须标记为 `async`：

```javascript
// ❌ 错误：普通函数不能用 await
function myFunction() {
  await delay(1);  // 报错！
}

// ✅ 正确：async 函数才能用 await
async function myFunction() {
  await delay(1);  // 正确
}
```

##### 完整对比示例

```javascript
// 老方式（回调地狱）
NSTimer.scheduledTimerWithTimeInterval(1, false, function() {
  console.log("1秒后");
  NSTimer.scheduledTimerWithTimeInterval(1, false, function() {
    console.log("2秒后");
    NSTimer.scheduledTimerWithTimeInterval(1, false, function() {
      console.log("3秒后");
    });
  });
});

// 新方式（async/await）
async function 演示() {
  await MNUtil.delay(1);
  console.log("1秒后");
  await MNUtil.delay(1);
  console.log("2秒后");
  await MNUtil.delay(1);
  console.log("3秒后");
}
```

#### 错误处理

##### 处理 reject 的情况

```javascript
// 如果 Promise 调用了 reject
static async delay(seconds) {
  return new Promise((resolve, reject) => {
    NSTimer.scheduledTimerWithTimeInterval(seconds, false, function() {
      reject("超时了");  // 假设改成 reject
    });
  });
}

// 使用时会触发错误
try {
  await delay(1);  
  console.log("成功等待1秒");  // ❌ 不会执行
} catch(error) {
  console.log("出错了：" + error);  // ✅ 会执行这里！
}
```

#### 实际代码例子

```javascript
// mntoolbar/xdyy_custom_actions_registry.js
global.registerCustomAction("fetchData", async function(context) {
  try {
    // 显示加载提示
    MNUtil.showHUD("正在获取数据...");
    
    // 异步请求数据（等待结果）
    const response = await fetch("https://api.example.com/data");
    const data = await response.json();
    
    // 处理数据
    MNUtil.showHUD("获取成功：" + data.length + " 条数据");
    
    // 异步延迟
    await MNUtil.delay(0.5);  // 等待0.5秒
    
    // 继续处理...
    
  } catch (error) {
    MNUtil.showHUD("获取失败：" + error.message);
  }
});
```

#### 在 MarginNote 插件中的应用

```javascript
// 批量处理笔记的例子
async function processNotes() {
  const notes = MNNote.getFocusNotes();
  
  for (const note of notes) {
    note.appendComment("处理中...");
    await MNUtil.delay(0.1);  // 每个笔记之间延迟0.1秒
  }
  
  MNUtil.showHUD("全部处理完成！");
}

// 带进度显示的批量处理
async function processNotesWithProgress() {
  const notes = MNNote.getFocusNotes();
  const total = notes.length;
  
  for (let i = 0; i < notes.length; i++) {
    const note = notes[i];
    
    // 显示进度
    MNUtil.showHUD(`处理中 ${i+1}/${total}`);
    
    // 处理笔记
    note.appendComment(`已处理 - ${new Date().toLocaleTimeString()}`);
    
    // 延迟，避免处理太快
    await MNUtil.delay(0.2);
  }
  
  MNUtil.showHUD("✅ 全部处理完成！");
}
```

#### 核心概念总结

1. **异步** = 不等结果，先做其他事
2. **Promise** = 装"未来结果"的盒子
3. **resolve/reject** = 往盒子里放成功/失败结果
4. **await** = 等待 Promise 完成
5. **async** = 能使用 await 的函数标记
6. **try/catch** = 处理异步错误

#### 💡 记忆技巧

- Promise = "承诺将来给你结果"
- resolve = "成功兑现承诺"
- reject = "承诺失败了"
- await = "等等，让我先拿到结果"
- async = "这个函数会等待"

---

### 3.3 闭包和作用域 - 变量的可见范围

#### 什么是闭包？

闭包是 JavaScript 的强大特性：内部函数可以访问外部函数的变量。

```javascript
// mntoolbar/xdyy_utils_extensions.js 的实际例子
function createCounter() {
  let count = 0;  // 外部变量
  
  return {
    increment: function() {
      count++;  // 内部函数访问外部变量
      return count;
    },
    
    decrement: function() {
      count--;
      return count;
    },
    
    getCount: function() {
      return count;
    }
  };
}

// 使用闭包
const counter = createCounter();
counter.increment();  // 1
counter.increment();  // 2
counter.decrement();  // 1
```

#### 在插件中的实际应用

```javascript
// 使用闭包保存状态
const toolbarUtils = (function() {
  // 私有变量（外部无法直接访问）
  let errorLogs = [];
  let config = {};
  
  // 返回公开的方法
  return {
    addErrorLog: function(error, source) {
      errorLogs.push({
        error: error,
        source: source,
        time: new Date()
      });
    },
    
    getErrorLogs: function() {
      return errorLogs;  // 闭包访问私有变量
    },
    
    clearLogs: function() {
      errorLogs = [];
    }
  };
})();

// 使用
toolbarUtils.addErrorLog("测试错误", "main.js");
console.log(toolbarUtils.errorLogs);  // undefined（无法直接访问）
console.log(toolbarUtils.getErrorLogs());  // 可以通过方法访问
```

#### 常见的闭包陷阱

```javascript
// ❌ 错误示例：循环中的闭包
for (var i = 0; i < 3; i++) {
  setTimeout(function() {
    console.log(i);  // 输出 3, 3, 3
  }, 100);
}

// ✅ 正确示例1：使用 let
for (let i = 0; i < 3; i++) {
  setTimeout(function() {
    console.log(i);  // 输出 0, 1, 2
  }, 100);
}

// ✅ 正确示例2：使用立即执行函数
for (var i = 0; i < 3; i++) {
  (function(index) {
    setTimeout(function() {
      console.log(index);  // 输出 0, 1, 2
    }, 100);
  })(i);
}
```

---

## 第四部分：实战案例分析

### 4.1 完整功能分析：从按钮点击到功能执行

让我们分析一个完整的功能：**添加时间戳**

#### 第1步：注册按钮（xdyy_button_registry.js）

```javascript
// 告诉系统：我要添加一个按钮
global.registerButton("custom15", {
  name: "时间戳",              // 按钮显示的文字
  image: "custom15",           // 使用 custom15.png 作为图标
  templateName: "menu_timestamp"  // 点击后显示的菜单
});
```

#### 第2步：定义菜单（xdyy_menu_registry.js）

```javascript
// 定义菜单的内容和行为
global.registerMenuTemplate("menu_timestamp", {
  action: "addTimestamp",      // 默认动作：直接点击执行
  
  onLongPress: {              // 长按显示子菜单
    action: "menu",
    menuWidth: 200,
    menuItems: [
      {
        action: "addTimestampToTitle",
        menuTitle: "添加到标题"
      },
      {
        action: "addTimestampToComment",
        menuTitle: "添加为评论"
      }
    ]
  }
});
```

#### 第3步：实现功能（xdyy_custom_actions_registry.js）

```javascript
// 实现具体的功能
global.registerCustomAction("addTimestamp", async function(context) {
  // 1. 获取当前选中的笔记
  const focusNote = MNNote.getFocusNote();
  
  // 2. 检查是否有选中笔记
  if (!focusNote) {
    MNUtil.showHUD("请先选择一个笔记");
    return;
  }
  
  // 3. 生成时间戳
  const now = new Date();
  const timestamp = `${now.getFullYear()}-${
    String(now.getMonth() + 1).padStart(2, '0')
  }-${
    String(now.getDate()).padStart(2, '0')
  } ${
    String(now.getHours()).padStart(2, '0')
  }:${
    String(now.getMinutes()).padStart(2, '0')
  }`;
  
  // 4. 添加到笔记
  MNUtil.undoGrouping(() => {
    // 使用撤销组，让操作可以一键撤销
    if (focusNote.noteTitle) {
      focusNote.noteTitle = `${focusNote.noteTitle} [${timestamp}]`;
    } else {
      focusNote.noteTitle = timestamp;
    }
  });
  
  // 5. 显示成功提示
  MNUtil.showHUD(`已添加时间戳：${timestamp}`);
});
```

#### 执行流程图

```
用户点击按钮
    ↓
系统查找 custom15 配置
    ↓
找到 templateName: "menu_timestamp"
    ↓
查找 menu_timestamp 模板
    ↓
找到 action: "addTimestamp"
    ↓
执行 global.customActions["addTimestamp"]
    ↓
功能代码执行
    ↓
显示结果
```

---

### 4.2 常见错误和解决方案

#### 错误1：undefined 和 null

```javascript
// ❌ 常见错误
const note = MNNote.getFocusNote();
note.appendComment("评论");  // 如果没有选中笔记，note 是 null，会报错

// ✅ 正确做法
const note = MNNote.getFocusNote();
if (note) {  // 先检查
  note.appendComment("评论");
} else {
  MNUtil.showHUD("请先选择笔记");
}
```

#### 错误2：this 指向问题

```javascript
// ❌ 错误示例
class MyClass {
  name = "测试";
  
  showName() {
    setTimeout(function() {
      console.log(this.name);  // undefined！this 不是 MyClass 实例
    }, 1000);
  }
}

// ✅ 解决方案1：箭头函数
class MyClass {
  name = "测试";
  
  showName() {
    setTimeout(() => {
      console.log(this.name);  // "测试"，箭头函数保持 this
    }, 1000);
  }
}

// ✅ 解决方案2：保存 this
class MyClass {
  name = "测试";
  
  showName() {
    const that = this;  // 保存 this
    setTimeout(function() {
      console.log(that.name);  // "测试"
    }, 1000);
  }
}
```

#### 错误3：异步陷阱

```javascript
// ❌ 错误：忘记 await
async function processNotes() {
  const notes = MNNote.getFocusNotes();
  
  notes.forEach(note => {
    MNUtil.delay(1);  // 忘记 await，不会等待
    note.appendComment("处理完成");
  });
  
  MNUtil.showHUD("全部完成");  // 会立即执行，不等待延迟
}

// ✅ 正确：使用 for...of 和 await
async function processNotes() {
  const notes = MNNote.getFocusNotes();
  
  for (const note of notes) {
    await MNUtil.delay(1);  // 等待1秒
    note.appendComment("处理完成");
  }
  
  MNUtil.showHUD("全部完成");  // 真正全部完成后才执行
}
```

---

### 4.3 调试技巧

#### 1. 使用 MNUtil.log 输出日志

```javascript
function debugFunction() {
  MNUtil.log("=== 开始执行 ===");
  
  const note = MNNote.getFocusNote();
  MNUtil.log("获取的笔记：" + note);
  
  if (note) {
    MNUtil.log("笔记标题：" + note.noteTitle);
    MNUtil.log("笔记ID：" + note.noteId);
  }
  
  MNUtil.log("=== 执行结束 ===");
}
```

#### 2. 使用 try-catch 捕获错误

```javascript
async function safeFunction(context) {
  try {
    // 可能出错的代码
    const note = MNNote.getFocusNote();
    note.appendComment("测试");
    
  } catch (error) {
    // 错误处理
    MNUtil.log("错误：" + error.message);
    MNUtil.log("错误栈：" + error.stack);
    MNUtil.showHUD("操作失败：" + error.message);
  }
}
```

#### 3. 使用 MNUtil.copy 复制对象信息

```javascript
function inspectObject() {
  const note = MNNote.getFocusNote();
  
  if (note) {
    // 复制笔记信息到剪贴板
    MNUtil.copyJSON({
      id: note.noteId,
      title: note.noteTitle,
      color: note.colorIndex,
      commentCount: note.comments.length
    });
    
    MNUtil.showHUD("笔记信息已复制到剪贴板");
  }
}
```

---

## 📝 练习题

### 基础练习

1. **变量和数据类型**
   - 创建一个对象，包含你的姓名（字符串）、年龄（数字）、是否是学生（布尔值）
   - 创建一个数组，包含5个你喜欢的颜色

2. **函数练习**
   - 写一个函数，接收两个数字参数，返回它们的和
   - 用箭头函数重写上面的函数

3. **类的练习**
   - 创建一个 Book 类，有 title 和 author 属性
   - 添加一个 getInfo() 方法，返回 "《标题》by 作者"
   - 创建两个 Book 实例

### 进阶练习

1. **static 方法**
   - 给 Book 类添加一个静态方法 `static createFromString(str)`
   - 该方法接收 "标题-作者" 格式的字符串，返回 Book 实例

2. **异步编程**
   - 写一个异步函数，使用 MNUtil.delay 实现倒计时功能
   - 从 3 倒数到 1，每秒显示一次

3. **实战功能**
   - 实现一个"批量添加标签"的功能
   - 获取所有选中的笔记，给每个笔记添加 "已处理" 标签

---

## 🎯 总结

### 你已经学会了

1. **JavaScript 基础**
   - 变量和数据类型
   - 函数的三种形式
   - 对象和类的概念

2. **面向对象编程**
   - 类和实例的关系
   - static 方法 vs 实例方法
   - prototype 原型链
   - 构造函数和 this

3. **MarginNote 特殊语法**
   - JSB.defineClass 的使用
   - 异步编程 async/await
   - 闭包和作用域

4. **实战技能**
   - 完整的功能开发流程
   - 常见错误的解决
   - 调试技巧

### 下一步学习建议

1. **阅读源码**：打开 mnutils.js，试着理解每个类的设计
2. **修改现有插件**：先从小修改开始，比如改变按钮名称
3. **开发简单功能**：实现一个自己需要的小功能
4. **参与社区**：分享你的代码，向其他开发者学习

### 推荐资源

- **MNUtils API 文档**：`mnutils/MNUtils_API_Guide.md`
- **MNToolbar 完整指南**：`mntoolbar/mntoolbar_complete_guide.md`
- **JavaScript MDN 文档**：https://developer.mozilla.org/zh-CN/docs/Web/JavaScript

---

## 🙏 结语

编程就像学习一门新语言，需要时间和练习。不要害怕犯错，每个错误都是学习的机会。MarginNote 插件开发是一个很好的起点，因为你可以立即看到代码的效果，解决自己的实际需求。

记住：**每个专家都曾是初学者**。保持好奇心，持续学习，你也能成为插件开发高手！

祝你在 MarginNote 插件开发的道路上越走越远！🚀

---

*本文档基于 MarginNote 4 插件实际代码编写，所有示例均来自真实插件。*

*文档版本：1.0.0 | 更新日期：2025-01-20*