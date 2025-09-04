# 📚 通过 MarginNote 代码学习 JavaScript：从零基础到入门

> 🎯 **本文目标**：让完全没有编程经验的小白，通过 MarginNote 插件的真实代码，系统学习 JavaScript 的核心概念，掌握现代编程思维。

## 📖 前言：为什么选择这种学习方式？

### 🤔 传统 JavaScript 教程的问题

传统的 JavaScript 教程往往：
- **脱离实际**：用的都是 `hello world`、计算器这样的玩具例子
- **环境复杂**：需要配置 Node.js、浏览器开发工具等
- **学完没用**：学了语法却不知道能做什么

### 🌟 通过 MarginNote 代码学习的优势

如果你是 MarginNote 的用户，你已经见过各种强大的插件：MNUtils、MNToolbar、MNChatGLM 等。这些插件代码是**活的教材**：

1. **真实代码，立即能懂**：每行代码都有明确的作用
2. **无需配置环境**：MarginNote 就是运行环境
3. **学以致用**：理解了语法就能理解插件如何工作
4. **循序渐进**：从简单的变量到复杂的类，应有尽有

### 🎯 你将学到什么

**这不是插件开发教程**，而是 **JavaScript 语言学习教程**。学完后你将掌握：

#### 核心语言特性
- 变量、函数、对象的本质
- 面向对象编程思维
- 异步编程概念
- 现代 JavaScript 语法

#### 编程思维
- 如何分解复杂问题
- 如何组织代码结构
- 如何处理错误和异常
- 如何阅读他人的代码

#### 额外收获
- 能看懂任何 MarginNote 插件的代码
- 为进一步学习前端开发打下基础
- 具备阅读其他 JavaScript 项目的能力

### 🗺️ 学习路线图

```
第一部分：JavaScript 基础 (第1-4章)
├── 数据与变量：程序如何记住信息
├── 函数：代码如何复用和组织
├── 控制流程：程序如何做决定
└── 复合数据：如何处理复杂信息

第二部分：面向对象编程 (第5-7章)  
├── 对象和类：如何描述现实世界
├── 函数进阶：this、闭包等高级概念
└── 继承与多态：代码如何复用和扩展

第三部分：异步编程 (第8章)
└── Promise 与 async/await：如何处理延时操作

附录：参考资料
├── JavaScript 语法速查表
├── 常见错误和调试技巧
└── 进阶学习资源推荐
```

### 💡 如何使用这份教程

1. **按顺序阅读**：每章都建立在前章的基础上
2. **动手实践**：看到代码就在 MarginNote 中运行试试
3. **理解本质**：重点理解概念，而不是背诵语法
4. **联系实际**：思考学到的概念如何应用到其他场景

> 💡 **学习原则**："理解比记忆重要，应用比语法重要，思维比技巧重要"

让我们开始这场有趣的 JavaScript 学习之旅！

---

## 第一部分：JavaScript 基础概念

### 第1章：数据与变量 - 程序的基础

#### 1.1 第一个变量

> 🤔 **问题**：程序如何记住信息？比如，我想让 MarginNote 记住我的名字，下次打开时显示"欢迎回来，小明"，该怎么做？

这就需要用到**变量**了！

**变量就像一个贴着标签的盒子**：你可以往里面放东西，也可以从里面取东西。标签就是变量名，里面的东西就是变量的值。

**立即实践**：

```javascript
// 最简单的例子：创建一个变量
let userName = "小明";

// 使用变量：让 MarginNote 显示欢迎信息
MNUtil.showHUD("欢迎回来，" + userName);
```

**运行结果**：MarginNote 会显示"欢迎回来，小明"

**代码解释**：
- `let userName` → 创建一个名为 `userName` 的变量
- `= "小明"` → 向变量里放入文字"小明" 
- `userName` → 取出变量的值
- `+` → 连接两段文字

**🎯 试试看**：修改代码，把"小明"改成你的名字，然后运行看结果。

#### 1.2 基础数据类型

> 🤔 **问题**：JavaScript 能处理哪些类型的数据？

就像盒子可以装不同的东西（书本、玩具、食物），变量也可以存储不同类型的数据：

##### 文字（字符串）
```javascript
let message = "Hello MarginNote";
let noteName = "我的笔记";
let emoji = "😀";

MNUtil.showHUD(message);  // 显示文字
```

##### 数字
```javascript
let age = 25;
let price = 99.9;
let count = 0;

MNUtil.showHUD("age = " + age);  // 显示：age = 25
```

##### 真假判断（布尔值）
```javascript
let isReady = true;   // 真
let isEmpty = false;  // 假

if (isReady) {
  MNUtil.showHUD("准备完成！");
}
```

**📝 关于引号**：
- 文字需要用引号包围：`"Hello"`
- 数字不需要引号：`123`
- `true`/`false` 也不需要引号

**✨ 实战例子**：从 MarginNote 代码中看实际应用

```javascript
// 来自 mntoolbar/xdyy_button_registry.js 的真实代码
global.registerButton("custom15", {
  name: "时间戳",        // 字符串：按钮显示的文字
  image: "custom15",     // 字符串：图标文件名
  templateName: "menu_timestamp"  // 字符串：菜单模板名
});

// 来自 mnutils.js 的真实代码
note.colorIndex = 3;     // 数字：颜色索引（0-15）
note.fillIndex = 0;      // 数字：填充样式索引
menu.rowHeight = 35;     // 数字：菜单行高（像素）
```

**🔍 观察一下**：
- 哪些用了引号？（那些是字符串）
- 哪些没用引号？（那些是数字）

#### 1.3 变量的作用域初步

> 🤔 **问题**：变量什么时候存在，什么时候消失？

想象一下你在家里和在学校：
- **在家里**：你可以使用家里所有的东西
- **在学校**：你只能使用学校的东西，不能用家里的

变量也是这样的道理：

```javascript
let globalMessage = "我在全局区域";  // 全局变量：在哪里都能用

function showWelcome() {
  let localMessage = "我在函数内部";  // 局部变量：只在这个函数里能用
  
  MNUtil.showHUD(globalMessage);  // ✅ 可以用全局变量
  MNUtil.showHUD(localMessage);   // ✅ 可以用局部变量
}

showWelcome();
MNUtil.showHUD(globalMessage);  // ✅ 还是可以用全局变量
// MNUtil.showHUD(localMessage);   // ❌ 错误！函数外面用不了局部变量
```

**记住**：
- 全局变量 = 家里的东西，在哪里都能用
- 局部变量 = 教室里的东西，只能在这个教室里用

**🎯 小练习**：
试试创建一个变量存储你的名字，然后让 MarginNote 显示问候信息。

---

### 第1章小结

恭喜！你已经学会了：
✅ 用变量存储信息  
✅ 区分文字、数字和真假值
✅ 理解全局和局部变量的区别

但是，如果我想让同样的代码执行多次怎么办？比如，给不同的人显示不同的欢迎信息？

这就需要用到**函数**了——让我们进入下一章的学习吧！

---

### 第2章：函数 - 让代码可以重复使用

> 🤔 **问题**：每次都写 `MNUtil.showHUD()` 太麻烦了，而且如果我想给100个不同的用户显示问候，难道要写100行代码吗？

**函数就像一台机器**：你把原料（输入）放进去，机器加工后给你产品（输出）。

#### 2.1 第一个函数

```javascript
// 不用函数的写法：重复代码很多
MNUtil.showHUD("欢迎回来，小明");
MNUtil.showHUD("欢迎回来，小红");  
MNUtil.showHUD("欢迎回来，小刚");
// ...如果有100个用户，要写100行！

// 用函数的写法：代码可以复用
function sayWelcome(name) {  // name是参数：接收外部输入
  MNUtil.showHUD("欢迎回来，" + name);
}

// 调用函数：一行代码搞定
sayWelcome("小明");  // 传入参数"小明"
sayWelcome("小红");  // 传入参数"小红"  
sayWelcome("小刚");  // 传入参数"小刚"
```

**代码解释**：
- `function sayWelcome(name)` → 创建一个名为 `sayWelcome` 的函数
- `name` → 参数，就像函数的"输入口"
- `sayWelcome("小明")` → 调用函数，把"小明"传给参数 `name`

**🎯 试试看**：创建一个函数，能显示任意数字的平方（比如输入3，显示9）

#### 2.2 函数的参数和返回值

> 🤔 **问题**：函数如何接收输入和产生输出？

**参数 = 函数的输入**
```javascript
function greetUser(name, age) {  // 两个参数：name 和 age
  MNUtil.showHUD(name + " 今年 " + age + " 岁");
}

greetUser("小明", 25);  // 传入两个参数
```

**返回值 = 函数的输出**
```javascript
function calculateAge(birthYear) {
  let currentYear = 2024;
  let age = currentYear - birthYear;
  return age;  // 返回计算结果
}

let myAge = calculateAge(1990);  // 接收返回值
MNUtil.showHUD("我今年 " + myAge + " 岁");  // 显示：我今年 34 岁
```

**✨ MarginNote 中的实际例子**
```javascript
// 来自 mnutils.js 的真实函数
function strCode(str) {
  let width = 0;
  for (let i = 0; i < str.length; i++) {
    if (str.charCodeAt(i) > 127) {
      width += 2;  // 中文字符算2个宽度
    } else {
      width += 1;  // 英文字符算1个宽度
    }
  }
  return width;  // 返回字符串显示宽度
}

// 使用这个函数
let titleWidth = strCode("我的笔记");
MNUtil.showHUD("标题宽度：" + titleWidth);
```

#### 2.3 函数的作用域

> 🤔 **问题**：函数里的变量和外面的变量有什么关系？

函数就像房间，有自己的"私人空间"：

```javascript
let globalName = "全局小明";  // 客厅的东西，大家都能用

function showUserInfo() {
  let localName = "函数小红";  // 房间里的东西，只有房间里能用
  
  MNUtil.showHUD("全局：" + globalName);  // ✅ 能访问外面的
  MNUtil.showHUD("局部：" + localName);   // ✅ 能访问自己的
}

showUserInfo();
MNUtil.showHUD("外部：" + globalName);  // ✅ 外面也能用全局的
// MNUtil.showHUD("外部：" + localName);   // ❌ 外面用不了房间里的
```

**实际应用场景**：
```javascript
// MarginNote 中的实际例子
function processNote() {
  let note = MNNote.getFocusNote();  // 函数内部变量
  
  if (note) {
    let noteTitle = note.noteTitle;   // 只在这个函数里用
    MNUtil.showHUD("处理笔记：" + noteTitle);
  }
}
// 外面访问不到 note 和 noteTitle，很安全！
```

#### 2.4 箭头函数初步认识

> 🤔 **问题**：有没有更简洁的函数写法？

有！箭头函数就像函数的"简化版"：

```javascript
// 普通函数写法
function sayHello(name) {
  return "Hello " + name;
}

// 箭头函数写法
const sayHello2 = (name) => {
  return "Hello " + name;
}

// 更简洁的箭头函数（单行时可省略大括号和return）
const sayHello3 = (name) => "Hello " + name;

// 使用效果完全一样
MNUtil.showHUD(sayHello("小明"));   // Hello 小明
MNUtil.showHUD(sayHello2("小红"));  // Hello 小红
MNUtil.showHUD(sayHello3("小刚"));  // Hello 小刚
```

**何时使用箭头函数？**
- 简单的计算：`const double = (x) => x * 2`
- 数组处理：`numbers.map(x => x * 2)`
- 短小的工具函数

**箭头函数的特点**：
- 写法更简洁
- 适合简单逻辑
- （高级特性：this指向不同，我们第6章详细讲）

---

### 第2章小结

恭喜！你已经学会了：
✅ 用函数避免重复代码
✅ 传递参数和接收返回值
✅ 理解函数的作用域
✅ 认识箭头函数的基本用法

现在你能创建自己的"代码机器"了！但是，如果我想让程序根据不同情况做不同的事情呢？比如，只给VIP用户显示特殊欢迎信息？

这就需要学习**条件判断**——让我们进入第3章，学习如何让程序会"思考"！

---

### 第3章：控制流程 - 让程序会"思考"

程序不仅要能存储数据、执行函数，还要能根据不同情况做出不同的决定。这就是控制流程的作用。

#### 3.1 条件判断 - 程序的决策能力

> 🤔 **问题**：如何让程序根据不同情况做不同的事？比如，只有选中笔记时才处理，没选中时提示用户？

**生活例子**：出门前看天气
- 如果下雨 → 带伞
- 如果不下雨 → 不带伞

**代码实现**：
```javascript
// 基础的 if...else
let note = MNNote.getFocusNote();

if (note) {
  // 有笔记时执行这里
  MNUtil.showHUD("找到笔记：" + note.noteTitle);
} else {
  // 没有笔记时执行这里
  MNUtil.showHUD("请先选择一个笔记");
}
```

**多重条件判断**：
```javascript
let note = MNNote.getFocusNote();

if (!note) {
  MNUtil.showHUD("请先选择笔记");
} else if (note.noteTitle === "") {
  MNUtil.showHUD("笔记标题为空");
} else if (note.noteTitle.length > 50) {
  MNUtil.showHUD("标题太长了！");
} else {
  MNUtil.showHUD("笔记正常：" + note.noteTitle);
}
```

**实战应用**：
```javascript
// 来自 MarginNote 插件的实际逻辑
function checkAndProcessNote() {
  let focusNote = MNNote.getFocusNote();
  
  if (focusNote === null) {
    MNUtil.showHUD("请先选择一个笔记");
    return;  // 提前结束函数
  }
  
  if (focusNote.colorIndex === 0) {
    focusNote.colorIndex = 3;  // 设置为红色
    MNUtil.showHUD("笔记已标记为红色");
  } else {
    MNUtil.showHUD("笔记已经有颜色了");
  }
}
```

**🎯 练习**：写一个函数，检查笔记标题长度，超过20字符就提示"标题太长"。

#### 3.2 循环结构 - 重复执行的魔法

> 🤔 **问题**：如果我想给100个笔记都添加相同的标签，难道要写100次代码吗？

**循环就像传送带**：让同样的操作重复执行多次。

**基础 for 循环**：
```javascript
// 最简单的例子：数数
for (let i = 1; i <= 5; i++) {
  MNUtil.showHUD("第 " + i + " 次循环");
}
// 输出：第1次循环、第2次循环、第3次循环、第4次循环、第5次循环

// 实际应用：批量处理笔记
let notes = MNNote.getFocusNotes();  // 获取选中的多个笔记

for (let i = 0; i < notes.length; i++) {
  let note = notes[i];  // 取出第i个笔记
  note.colorIndex = 3;  // 设置颜色
  MNUtil.showHUD("处理第 " + (i+1) + " 个笔记");
}
```

**代码解释**：
- `let i = 0` → 计数器从0开始
- `i < notes.length` → 只要没处理完就继续
- `i++` → 每次循环后计数器+1
- `notes[i]` → 用下标访问数组中的笔记

**更现代的写法 - for...of 循环**：
```javascript
let notes = MNNote.getFocusNotes();

for (let note of notes) {  // 直接遍历每个笔记
  note.colorIndex = 3;
  MNUtil.showHUD("处理笔记：" + note.noteTitle);
}
// 更简洁，不需要管下标
```

**🎯 练习**：写一个循环，给数组中的每个数字都乘以2。

#### 3.3 实战练习：批量处理笔记

> 🤔 **问题**：现在你已经学会了条件判断和循环，能不能综合运用，写一个批量处理笔记的功能？

**需求**：只处理有标题的笔记，给它们都加上红色标记。

```javascript
function batchProcessNotes() {
  let notes = MNNote.getFocusNotes();  // 获取选中的笔记
  let processedCount = 0;              // 计数器
  
  // 检查是否有选中的笔记
  if (notes.length === 0) {
    MNUtil.showHUD("请先选择笔记");
    return;
  }
  
  // 遍历每个笔记
  for (let note of notes) {
    // 条件判断：只处理有标题的笔记
    if (note.noteTitle && note.noteTitle.trim() !== "") {
      note.colorIndex = 3;  // 设置为红色
      processedCount++;     // 计数器+1
    }
  }
  
  // 显示处理结果
  MNUtil.showHUD("已处理 " + processedCount + " 个有标题的笔记");
}

// 使用函数
batchProcessNotes();
```

**代码分析**：
1. **函数封装**：把功能包装成函数，可以重复使用
2. **错误检查**：先检查是否有笔记可处理
3. **循环遍历**：用 for...of 遍历所有笔记
4. **条件筛选**：只处理符合条件的笔记
5. **结果反馈**：告诉用户处理了多少个笔记

---

### 第3章小结

恭喜！你已经掌握了程序的"大脑"：
✅ 用 if...else 让程序做判断
✅ 用循环批量处理数据
✅ 综合运用函数、条件、循环解决实际问题

现在你的程序已经会"思考"了！但是，如果要处理更复杂的数据怎么办？比如一个学生有姓名、年龄、成绩等多个属性？

这就需要学习**复合数据类型**——让我们进入第4章！

---

### 第4章：复合数据类型 - 处理复杂信息

到目前为止，我们用的都是简单数据：一个变量存一个值。但现实世界的信息往往很复杂：一个笔记有标题、内容、颜色、评论等多个属性。这就需要复合数据类型。

#### 4.1 数组 - 管理多个数据

> 🤔 **问题**：如果我想存储多个用户的名字，难道要创建 name1、name2、name3... 这样的变量吗？

**数组就像一个有序的收纳盒**：可以放多个东西，每个位置都有编号。

**基础用法**：
```javascript
// 创建数组的几种方法
let userNames = ["小明", "小红", "小刚"];        // 直接创建
let scores = [85, 92, 78];                    // 数字数组
let mixedArray = ["小明", 18, true, null];    // 混合类型数组
let emptyArray = [];                          // 空数组

// 访问数组元素（下标从0开始）
MNUtil.showHUD("第一个用户：" + userNames[0]);  // 小明
MNUtil.showHUD("第二个用户：" + userNames[1]);  // 小红
MNUtil.showHUD("数组长度：" + userNames.length); // 3
```

**实际应用场景**：
```javascript
// MarginNote 中的实际例子：批量处理笔记
function colorNotesByCategory() {
  let notes = MNNote.getFocusNotes();    // 获取选中笔记（这就是一个数组！）
  let colors = [1, 2, 3, 4, 5];          // 准备5种颜色
  
  for (let i = 0; i < notes.length; i++) {
    let colorIndex = colors[i % colors.length];  // 轮流使用颜色
    notes[i].colorIndex = colorIndex;
    MNUtil.showHUD("笔记 " + (i+1) + " 设为颜色 " + colorIndex);
  }
}
```

**常用数组操作**：
```javascript
let fruits = ["苹果", "香蕉"];

// 添加元素
fruits.push("橙子");           // 在末尾添加：["苹果", "香蕉", "橙子"]
fruits.unshift("草莓");        // 在开头添加：["草莓", "苹果", "香蕉", "橙子"]

// 删除元素
let lastFruit = fruits.pop();  // 删除最后一个：橙子
let firstFruit = fruits.shift(); // 删除第一个：草莓

// 查找元素
let index = fruits.indexOf("苹果");  // 找到苹果的位置：0
let hasApple = fruits.includes("苹果"); // 检查是否包含苹果：true

MNUtil.log("当前水果：" + fruits);  // ["苹果", "香蕉"]
```

**🎯 实战练习**：
```javascript
// 创建一个笔记标题清理器
function cleanNoteTitles() {
  let notes = MNNote.getFocusNotes();
  let cleanedTitles = [];  // 存储清理后的标题
  
  for (let note of notes) {
    if (note.noteTitle) {
      // 清理标题：去除前后空格，移除特殊字符
      let cleanTitle = note.noteTitle.trim().replace(/[^\w\s]/g, '');
      cleanedTitles.push(cleanTitle);
      note.noteTitle = cleanTitle;
    }
  }
  
  MNUtil.showHUD("清理了 " + cleanedTitles.length + " 个标题");
  MNUtil.log("清理后的标题：" + cleanedTitles);
}
```

#### 4.2 对象 - 管理结构化数据

> 🤔 **问题**：数组适合存储相同类型的多个数据，但如果一个笔记有标题、内容、颜色、创建时间等不同类型的属性呢？

**对象就像一个有标签的储物柜**：每个格子都有自己的名字。

**基础用法**：
```javascript
// 创建对象
let student = {
  name: "小明",
  age: 18,
  grade: "高三",
  subjects: ["数学", "物理", "化学"]  // 对象里可以包含数组
};

// 访问对象属性
MNUtil.showHUD("姓名：" + student.name);        // 小明
MNUtil.showHUD("年龄：" + student.age);         // 18
MNUtil.showHUD("学科：" + student.subjects[0]); // 数学
```

**MarginNote 中的实际应用**：
```javascript
// 创建一个笔记信息对象
function getNoteInfo() {
  let note = MNNote.getFocusNote();
  if (!note) return null;
  
  let noteInfo = {
    title: note.noteTitle || "无标题",
    content: note.textContent || "无内容", 
    color: note.colorIndex || 0,
    hasComments: note.comments && note.comments.length > 0,
    created: new Date().toLocaleString(),
    // 方法：对象也可以包含函数
    display: function() {
      MNUtil.showHUD("笔记：" + this.title + " (" + this.color + ")");
    }
  };
  
  return noteInfo;
}

// 使用
let info = getNoteInfo();
if (info) {
  info.display();  // 调用对象的方法
  MNUtil.log(info); // 查看完整信息
}
```

**对象操作**：
```javascript
let config = {
  theme: "dark",
  fontSize: 14
};

// 添加新属性
config.language = "zh-CN";
config["auto-save"] = true;  // 属性名有特殊字符时用这种方式

// 修改属性
config.fontSize = 16;

// 删除属性
delete config.theme;

// 检查属性是否存在
if ("language" in config) {
  MNUtil.showHUD("语言设置：" + config.language);
}

// 遍历对象属性
for (let key in config) {
  MNUtil.log(key + ": " + config[key]);
}
```

#### 4.3 特殊值处理

##### undefined 和 null - 初学者最困惑的概念

这两个都表示"没有值"，但用法不同：

```javascript
// undefined：系统说"我不知道"
let userName;                    // 声明了但没赋值
MNUtil.log(userName);           // undefined

let note = MNNote.getFocusNote();
if (!note) {
  MNUtil.log("没有选中笔记");      // note 可能是 null
}

// null：程序员说"这里故意空着"
let settings = {
  theme: "dark",
  language: "zh-CN", 
  customCSS: null    // 故意设为空，表示"暂时没有自定义样式"
};
```

**生活化理解**：
- **undefined**：就像问"你今天吃了什么？"，对方说"我忘了"（系统不知道）
- **null**：就像问"你今天吃了什么？"，对方说"我没吃"（主动告诉你是空的）

**在 MarginNote 插件中的实际应用**：

```javascript
// 检查笔记是否存在
let focusNote = MNNote.getFocusNote();
if (focusNote === null) {
  MNUtil.showHUD("请先选择一个笔记");
  return;
}

// 检查属性是否定义
if (typeof focusNote.customProperty === "undefined") {
  focusNote.customProperty = "默认值";
}

// 清空某个属性（设置为 null）
focusNote.tempData = null;  // 主动清空临时数据
```

**常见错误和正确处理**：

```javascript
// ❌ 错误：直接使用可能为 undefined 的值
let note = MNNote.getFocusNote();
note.appendComment("新评论");  // 如果 note 是 null，会报错！

// ✅ 正确：先检查再使用
let note = MNNote.getFocusNote();
if (note) {  // 同时检查 null 和 undefined
  note.appendComment("新评论");
} else {
  MNUtil.showHUD("请先选择笔记");
}

// ✅ 更简洁的写法：可选链操作符（如果支持）
note?.appendComment("新评论");  // 只有 note 存在时才调用
```

**记忆技巧**：
- **undefined**："我不知道" - 系统没给值
- **null**："我知道是空的" - 程序员主动设空

#### 4.4 综合练习：创建笔记管理器

> 🎯 **挑战**：综合运用数组、对象和特殊值处理，创建一个小型笔记管理系统

```javascript
function createNoteManager() {
  // 笔记管理器对象
  let noteManager = {
    notes: [],  // 存储所有笔记信息
    
    // 添加笔记
    addNote: function(title, content) {
      if (!title || title.trim() === "") {
        MNUtil.showHUD("标题不能为空");
        return null;
      }
      
      let noteInfo = {
        id: this.notes.length + 1,
        title: title.trim(),
        content: content || "",
        created: new Date().toLocaleString(),
        color: 0
      };
      
      this.notes.push(noteInfo);
      return noteInfo;
    },
    
    // 查找笔记
    findNote: function(id) {
      for (let note of this.notes) {
        if (note.id === id) {
          return note;
        }
      }
      return null;  // 没找到返回 null
    },
    
    // 显示所有笔记
    listNotes: function() {
      if (this.notes.length === 0) {
        MNUtil.showHUD("还没有笔记");
        return;
      }
      
      for (let note of this.notes) {
        MNUtil.log("ID:" + note.id + " | " + note.title + " | " + note.created);
      }
    }
  };
  
  return noteManager;
}

// 使用示例
let manager = createNoteManager();
manager.addNote("学习JavaScript", "今天学习了数组和对象");
manager.addNote("MarginNote技巧", "学会了批量处理笔记");
manager.listNotes();

let note = manager.findNote(1);
if (note) {
  MNUtil.showHUD("找到笔记：" + note.title);
} else {
  MNUtil.showHUD("笔记不存在");
}
```

---

### 第4章小结

🎉 恭喜！你已经掌握了处理复杂数据的核心技能：

✅ **数组操作**：存储和操作多个数据
- 创建数组：`let arr = [1, 2, 3]`
- 访问元素：`arr[0]`，获取长度：`arr.length`
- 添加/删除：`push()`, `pop()`, `shift()`, `unshift()`
- 查找：`indexOf()`, `includes()`

✅ **对象操作**：管理结构化数据
- 创建对象：`let obj = {name: "小明", age: 18}`
- 访问属性：`obj.name` 或 `obj["name"]`
- 添加/删除属性：`obj.newProp = value`, `delete obj.prop`
- 遍历属性：`for...in` 循环

✅ **特殊值处理**：避免常见错误
- `undefined`：系统未定义的值
- `null`：程序员主动设置的空值
- 安全检查：`if (value)` 或可选链 `value?.method()`

现在你可以处理真实世界中的复杂数据了！但是，如果我想让数据有"行为"呢？比如一个学生对象不仅有属性，还能"自我介绍"、"计算GPA"等？

这就需要学习**面向对象编程**——让我们进入第二部分！

---

## 第二部分：面向对象编程

到目前为止，我们学会了数据类型、函数和控制流程。现在是时候学习**面向对象编程**了——让数据不仅有"属性"，还有"行为"。

### 第5章：类与对象 - 数据的进化

> 🤔 **问题**：我们学了对象（比如 `{name: "小明", age: 18}`），但如果我要创建很多个学生对象，难道要一个一个手动写吗？

#### 5.1 从简单对象到类

**回顾**：我们之前创建对象是这样的：
```javascript
// 手动创建学生对象
let student1 = {
  name: "小明",
  age: 18,
  grade: "高三",
  introduce: function() {
    MNUtil.showHUD("我是 " + this.name + "，今年 " + this.age + " 岁");
  }
};

let student2 = {
  name: "小红", 
  age: 17,
  grade: "高二",
  introduce: function() {  // 重复的代码！
    MNUtil.showHUD("我是 " + this.name + "，今年 " + this.age + " 岁");
  }
};
```

**问题**：代码重复，不好维护！

**解决方案**：使用类（Class）
```javascript
// 类就像一个"学生模板"
class Student {
  // 构造函数：创建学生时自动调用
  constructor(name, age, grade) {
    this.name = name;
    this.age = age; 
    this.grade = grade;
  }
  
  // 方法：所有学生都能做的事
  introduce() {
    MNUtil.showHUD("我是 " + this.name + "，今年 " + this.age + " 岁");
  }
  
  study(subject) {
    MNUtil.showHUD(this.name + " 正在学习 " + subject);
  }
}

// 使用类创建对象（实例化）
let student1 = new Student("小明", 18, "高三");
let student2 = new Student("小红", 17, "高二");

student1.introduce();  // 我是 小明，今年 18 岁
student2.study("数学"); // 小红 正在学习 数学
```

#### 5.2 MarginNote 中的类应用

让我们看看 MarginNote 插件中如何使用类：

```javascript
// 创建一个笔记处理器类
class NoteProcessor {
  constructor(pluginName) {
    this.pluginName = pluginName;
    this.processedCount = 0;
  }
  
  // 处理单个笔记
  processNote(note) {
    if (!note || !note.noteTitle) {
      return false;
    }
    
    // 清理标题
    note.noteTitle = note.noteTitle.trim();
    // 设置颜色
    note.colorIndex = 2;
    // 计数
    this.processedCount++;
    
    return true;
  }
  
  // 批量处理笔记
  processBatch() {
    let notes = MNNote.getFocusNotes();
    this.processedCount = 0;  // 重置计数
    
    for (let note of notes) {
      this.processNote(note);
    }
    
    MNUtil.showHUD(this.pluginName + " 处理了 " + this.processedCount + " 个笔记");
  }
  
  // 获取处理统计
  getStats() {
    return {
      plugin: this.pluginName,
      processed: this.processedCount,
      lastUpdate: new Date().toLocaleString()
    };
  }
}

// 使用类
let processor = new NoteProcessor("我的笔记处理器");
processor.processBatch();
let stats = processor.getStats();
MNUtil.log(stats);
```

#### 5.3 getter 和 setter - 属性的守门员

> 🤔 **问题**：如果我想让属性有一些"智能行为"呢？比如设置年龄时自动检查是否合法？

**getter 和 setter 让属性变得"聪明"**：
```javascript
class SmartStudent {
  constructor(name, age) {
    this.name = name;
    this._age = age;  // 用 _ 表示"内部属性"
  }
  
  // getter：读取属性时调用
  get age() {
    return this._age;
  }
  
  // setter：设置属性时调用 
  set age(value) {
    if (value < 0 || value > 150) {
      MNUtil.showHUD("年龄不合法：" + value);
      return;
    }
    this._age = value;
    MNUtil.showHUD("年龄已更新为：" + value);
  }
  
  // 计算属性：每次访问都重新计算
  get description() {
    return this.name + "（" + this._age + "岁）";
  }
}

// 使用
let student = new SmartStudent("小明", 18);
MNUtil.log(student.age);          // 18（调用getter）
student.age = 19;                 // 调用setter，显示"年龄已更新为：19"
student.age = -5;                 // 调用setter，显示"年龄不合法"，不会更新
MNUtil.log(student.description);  // "小明（19岁）"（调用getter）
```

**在 MarginNote 中的应用**：

```javascript
class SmartNote {
  constructor(note) {
    this.note = note;
    this._priority = 0;
  }
  
  // 智能标题处理
  get title() {
    return this.note.noteTitle || "无标题";
  }
  
  set title(value) {
    if (!value || value.trim() === "") {
      MNUtil.showHUD("标题不能为空");
      return;
    }
    
    // 自动清理和格式化标题
    let cleanTitle = value.trim().replace(/\s+/g, ' ');
    this.note.noteTitle = cleanTitle;
    MNUtil.showHUD("标题已设置为：" + cleanTitle);
  }
  
  // 优先级管理
  get priority() {
    return this._priority;
  }
  
  set priority(level) {
    if (level < 0 || level > 5) {
      MNUtil.showHUD("优先级必须在0-5之间");
      return;
    }
    
    this._priority = level;
    // 根据优先级自动设置颜色
    this.note.colorIndex = level;
    MNUtil.showHUD(`优先级设为 ${level}，颜色已同步更新`);
  }
  
  // 只读属性
  get info() {
    return `${this.title} [优先级: ${this.priority}]`;
  }
}

// 使用示例
let note = MNNote.getFocusNote();
if (note) {
  let smartNote = new SmartNote(note);
  
  smartNote.title = "   重要笔记   ";  // 自动清理格式
  smartNote.priority = 3;             // 设置优先级和颜色
  MNUtil.log(smartNote.info);         // 显示完整信息
}
```
#### 5.4 实战练习：创建笔记管理器类

> 🎯 **挑战**：综合运用构造函数、方法、getter/setter，创建一个完整的笔记管理系统

```javascript
class NoteManager {
  constructor() {
    this.notes = [];
    this.currentFilter = "all";
    this._totalProcessed = 0;
  }
  
  // 添加笔记
  addNote(title, content, priority = 0) {
    if (!title || title.trim() === "") {
      MNUtil.showHUD("标题不能为空");
      return null;
    }
    
    let note = {
      id: this.notes.length + 1,
      title: title.trim(),
      content: content || "",
      priority: Math.min(Math.max(priority, 0), 5), // 限制在0-5范围
      created: new Date(),
      modified: new Date()
    };
    
    this.notes.push(note);
    this._totalProcessed++;
    return note;
  }
  
  // 查找笔记
  findById(id) {
    return this.notes.find(note => note.id === id) || null;
  }
  
  findByTitle(title) {
    return this.notes.filter(note => 
      note.title.toLowerCase().includes(title.toLowerCase())
    );
  }
  
  // 过滤器 getter
  get filteredNotes() {
    switch (this.currentFilter) {
      case "high":
        return this.notes.filter(note => note.priority >= 4);
      case "medium":
        return this.notes.filter(note => note.priority >= 2 && note.priority < 4);
      case "low":
        return this.notes.filter(note => note.priority < 2);
      case "recent":
        let yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return this.notes.filter(note => note.created > yesterday);
      default:
        return this.notes;
    }
  }
  
  // 设置过滤器
  set filter(filterType) {
    let validFilters = ["all", "high", "medium", "low", "recent"];
    if (!validFilters.includes(filterType)) {
      MNUtil.showHUD("无效的过滤类型: " + filterType);
      return;
    }
    
    this.currentFilter = filterType;
    MNUtil.showHUD("过滤器设为：" + filterType);
  }
  
  // 统计信息 getter
  get stats() {
    return {
      total: this.notes.length,
      high: this.notes.filter(n => n.priority >= 4).length,
      medium: this.notes.filter(n => n.priority >= 2 && n.priority < 4).length,
      low: this.notes.filter(n => n.priority < 2).length,
      processed: this._totalProcessed
    };
  }
  
  // 显示笔记列表
  displayNotes() {
    let notes = this.filteredNotes;
    if (notes.length === 0) {
      MNUtil.showHUD("没有找到笔记");
      return;
    }
    
    for (let note of notes) {
      let priority = "★".repeat(note.priority) || "☆";
      MNUtil.log(`${priority} ${note.title} (${note.created.toLocaleDateString()})`);
    }
    
    let stats = this.stats;
    MNUtil.showHUD(`显示 ${notes.length} 个笔记（总计 ${stats.total} 个）`);
  }
  
  // 批量设置优先级
  batchSetPriority(priority) {
    let notes = this.filteredNotes;
    let count = 0;
    
    for (let note of notes) {
      note.priority = priority;
      note.modified = new Date();
      count++;
    }
    
    MNUtil.showHUD(`已为 ${count} 个笔记设置优先级为 ${priority}`);
    return count;
  }
}

// 使用示例
let manager = new NoteManager();

// 添加一些笔记
manager.addNote("学习JavaScript类", "今天学会了类的基本概念", 4);
manager.addNote("MarginNote技巧", "学会了批量处理笔记", 2);
manager.addNote("项目计划", "下周要完成的任务清单", 5);
manager.addNote("读书笔记", "《JavaScript高级程序设计》", 1);

// 查看所有笔记
manager.displayNotes();

// 只看高优先级笔记
manager.filter = "high";
manager.displayNotes();

// 批量调整优先级
manager.batchSetPriority(3);

// 搜索笔记
let found = manager.findByTitle("JavaScript");
MNUtil.log("找到 " + found.length + " 个相关笔记");

// 查看统计
let stats = manager.stats;
MNUtil.log(`统计: 高${stats.high}个, 中${stats.medium}个, 低${stats.low}个`);
```

---

### 第5章小结

🎉 恭喜！你已经掌握了面向对象编程的核心技能：

✅ **类的基础**：创建可重用的对象模板
- `class ClassName { }` 定义类
- `constructor()` 构造函数初始化对象
- `new ClassName()` 创建实例

✅ **实例属性和方法**：对象的数据和行为
- `this.property` 访问对象属性
- 方法中的 `this` 指向当前对象
- 封装相关功能到类中

✅ **getter 和 setter**：让属性变得智能
- `get propertyName()` 控制属性读取
- `set propertyName(value)` 控制属性设置
- 数据验证和自动处理

✅ **实际应用**：在 MarginNote 插件中的应用
- 创建功能类封装复杂逻辑
- 智能属性管理
- 批量处理和数据统计

现在你可以创建自己的"智能对象"了！但是，如果我想创建一些不需要实例化就能使用的工具方法呢？比如 `MNUtil.showHUD()` 这样的？

让我们进入第6章，学习**静态方法**和工具类设计！

### 第6章：静态方法和工具类

> 🤔 **问题**：你注意到了吗？我们一直在使用 `MNUtil.showHUD()`、`MNUtil.log()` 这样的方法，但从来没有写过 `new MNUtil()`？这就是静态方法的魅力！

#### 6.1 static 关键字 - 类方法 vs 实例方法

**生活类比**：想象一个汽车工厂
- **静态方法（static）**= 工厂的功能（统计总产量、制定生产规范）
- **实例方法**= 每辆车的功能（启动、刹车、加速）

```javascript
class Car {
  constructor(brand, model) {
    this.brand = brand;
    this.model = model;
    Car.totalCars++; // 每造一辆车，总数+1
  }
  
  // 静态属性 - 属于整个类
  static totalCars = 0;
  
  // 静态方法 - 不需要创建实例就能用
  static getTotalCars() {
    return Car.totalCars;
  }
  
  static createStandardCar() {
    return new Car("丰田", "卡罗拉");
  }
  
  // 实例方法 - 需要创建实例才能用
  start() {
    MNUtil.showHUD(this.brand + " " + this.model + " 启动了");
  }
  
  getInfo() {
    return this.brand + " " + this.model;
  }
}

// 静态方法的使用 - 直接通过类名调用
MNUtil.log("目前生产了 " + Car.getTotalCars() + " 辆车");  // 0
let standardCar = Car.createStandardCar();

// 实例方法的使用 - 需要先创建对象
let myCar = new Car("本田", "雅阁");
myCar.start();  // 本田 雅阁 启动了

MNUtil.log("目前生产了 " + Car.getTotalCars() + " 辆车");  // 2
```

#### 6.2 MNUtil 类的设计思想

让我们看看 MNUtil 这个典型工具类的设计：

```javascript
// MNUtil 就是一个纯静态方法的工具类
class MNUtil {
  // 静态方法 - 工具函数，不需要实例
  static showHUD(message, duration = 2) {
    // 显示提示信息
  }
  
  static copy(text) {
    // 复制到剪贴板
  }
  
  static delay(seconds) {
    // 延迟执行
    return new Promise(resolve => setTimeout(resolve, seconds * 1000));
  }
  
  static log(message) {
    // 输出日志
  }
  
  static getRandomColor() {
    return Math.floor(Math.random() * 6); // 0-5的随机颜色
  }
}

// 直接使用，无需 new MNUtil()
MNUtil.showHUD("保存成功!");
MNUtil.copy("复制的文本");
let color = MNUtil.getRandomColor();
```

**为什么 MNUtil 都是静态方法？**
- **无状态**：这些工具函数不需要保存任何数据
- **通用性**：任何地方都能直接调用
- **简单性**：不需要创建对象，直接使用

#### 6.3 创建自己的工具类

让我们为 MarginNote 插件创建一个实用工具类：

```javascript
class PluginUtils {
  // 时间相关工具
  static formatTimestamp(date = new Date()) {
    return date.toLocaleDateString('zh-CN') + ' ' + 
           date.toLocaleTimeString('zh-CN', {hour12: false});
  }
  
  static getDateString(format = 'YYYY-MM-DD') {
    let date = new Date();
    let year = date.getFullYear();
    let month = (date.getMonth() + 1).toString().padStart(2, '0');
    let day = date.getDate().toString().padStart(2, '0');
    
    switch(format) {
      case 'YYYY-MM-DD':
        return `${year}-${month}-${day}`;
      case 'MM/DD':
        return `${month}/${day}`;
      case 'Chinese':
        return `${year}年${month}月${day}日`;
      default:
        return `${year}-${month}-${day}`;
    }
  }
  
  // 文本处理工具
  static cleanText(text) {
    if (!text) return "";
    return text.trim().replace(/\s+/g, ' ').replace(/[^\w\s\u4e00-\u9fff]/g, '');
  }
  
  static truncateText(text, maxLength = 50) {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  }
  
  // 数据验证工具
  static isValidNoteId(id) {
    return typeof id === 'string' && id.length === 36 && 
           /^[A-F0-9]{8}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{12}$/.test(id);
  }
  
  static isValidColor(colorIndex) {
    return Number.isInteger(colorIndex) && colorIndex >= 0 && colorIndex <= 5;
  }
  
  // 笔记批量操作工具
  static batchProcess(notes, processor, showProgress = true) {
    if (!Array.isArray(notes) || notes.length === 0) {
      MNUtil.showHUD("没有笔记需要处理");
      return [];
    }
    
    let results = [];
    let processed = 0;
    
    for (let note of notes) {
      try {
        let result = processor(note);
        results.push({ note, result, success: true });
        processed++;
        
        if (showProgress && processed % 10 === 0) {
          MNUtil.showHUD(`已处理 ${processed}/${notes.length} 个笔记`);
        }
      } catch (error) {
        results.push({ note, error, success: false });
        MNUtil.log(`处理笔记失败: ${error.message}`);
      }
    }
    
    if (showProgress) {
      MNUtil.showHUD(`批量处理完成: 成功 ${results.filter(r => r.success).length} 个`);
    }
    
    return results;
  }
  
  // 配置管理工具
  static saveConfig(key, value) {
    try {
      let config = JSON.stringify(value);
      // 这里应该使用实际的存储机制
      MNUtil.log(`配置已保存: ${key} = ${config}`);
      return true;
    } catch (error) {
      MNUtil.showHUD("配置保存失败: " + error.message);
      return false;
    }
  }
  
  static loadConfig(key, defaultValue = null) {
    try {
      // 这里应该使用实际的读取机制
      MNUtil.log(`加载配置: ${key}`);
      return defaultValue; // 返回默认值作为示例
    } catch (error) {
      MNUtil.log("配置读取失败: " + error.message);
      return defaultValue;
    }
  }
  
  // ID 生成工具
  static generateId(prefix = 'item') {
    return prefix + '_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
}

// 使用示例
let timestamp = PluginUtils.formatTimestamp();
let dateStr = PluginUtils.getDateString('Chinese');
let cleanTitle = PluginUtils.cleanText("  重要笔记!!! ");
let shortText = PluginUtils.truncateText("这是一段很长的文本内容", 10);

MNUtil.log("时间戳: " + timestamp);
MNUtil.log("日期: " + dateStr);
MNUtil.log("清理后标题: " + cleanTitle);
MNUtil.log("截断文本: " + shortText);

// 批量处理笔记
let notes = MNNote.getFocusNotes();
if (notes.length > 0) {
  PluginUtils.batchProcess(notes, (note) => {
    // 为每个笔记添加时间戳
    note.appendTextComment("处理时间: " + PluginUtils.formatTimestamp());
    return "已添加时间戳";
  });
}

// 生成唯一ID
let taskId = PluginUtils.generateId('task');
MNUtil.log("生成的任务ID: " + taskId);
```

#### 6.4 静态方法的使用场景

**何时使用 static？**

✅ **适合使用静态方法**：
1. **工具函数**：不需要对象状态，纯粹的功能函数
2. **工厂方法**：创建特定类型的实例
3. **验证函数**：数据格式验证
4. **配置管理**：全局设置的读写
5. **常量定义**：类相关的常量

❌ **不适合使用静态方法**：
1. **需要访问实例属性**：依赖 `this` 的操作
2. **有状态的操作**：需要记住之前的操作结果
3. **个性化行为**：每个对象行为不同的操作

```javascript
class NoteValidator {
  // ✅ 静态方法 - 纯验证功能
  static isValidTitle(title) {
    return title && title.trim().length > 0 && title.length <= 100;
  }
  
  static isValidColor(color) {
    return Number.isInteger(color) && color >= 0 && color <= 5;
  }
  
  // ✅ 静态工厂方法
  static createDefaultNote() {
    return {
      title: "新建笔记",
      content: "",
      color: 0,
      created: new Date()
    };
  }
}

class NoteProcessor {
  constructor(pluginName) {
    this.pluginName = pluginName;
    this.processedCount = 0;  // 实例状态
  }
  
  // ❌ 不适合静态 - 需要访问实例状态
  processNote(note) {
    this.processedCount++;  // 访问了实例属性
    MNUtil.log(`${this.pluginName} 处理了第 ${this.processedCount} 个笔记`);
  }
  
  // ✅ 可以是静态 - 纯功能函数
  static formatNoteTitle(title) {
    return title.trim().replace(/\s+/g, ' ');
  }
}
```

---

### 第6章小结

🎉 你已经掌握了静态方法和工具类的设计！

✅ **核心概念**：
- `static` 关键字创建类级别的方法和属性
- 静态方法直接通过类名调用，无需创建实例
- 静态方法不能访问实例的 `this`

✅ **设计原则**：
- 工具函数 → 静态方法
- 无状态操作 → 静态方法
- 需要实例数据 → 实例方法

✅ **实际应用**：
- `MNUtil` 等工具类的设计理念
- 创建自己的插件工具类
- 合理选择静态方法 vs 实例方法

现在你可以设计出结构清晰的工具类了！但是，如果我想基于现有的类创建新的、更专门化的类呢？比如创建一个"高级笔记处理器"继承基础的"笔记处理器"？

让我们进入第7章，学习**继承**的概念！

### 第7章：继承和扩展 - 在已有基础上构建

> 🤔 **问题**：如果我有一个基础的"笔记处理器"，现在想创建一个功能更强大的"高级笔记处理器"，难道要重写所有代码吗？

#### 7.1 继承基础 - extends 关键字

**生活类比**：继承就像"青出于蓝而胜于蓝"
- **父类**（基类）= 师父的基本技能
- **子类**（派生类）= 徒弟在师父基础上发展出的新技能
- **方法继承**= 徒弟学会了师父的所有技能
- **方法重写**= 徒弟对某些技能有了自己的改进

```javascript
// 基础笔记处理器（父类）
class NoteProcessor {
  constructor(name) {
    this.name = name;
    this.processedCount = 0;
  }
  
  // 基础处理方法
  processNote(note) {
    if (!note) {
      MNUtil.showHUD("没有笔记需要处理");
      return false;
    }
    
    // 基础处理：清理标题
    if (note.noteTitle) {
      note.noteTitle = note.noteTitle.trim();
    }
    
    this.processedCount++;
    MNUtil.log(`${this.name} 处理了第 ${this.processedCount} 个笔记`);
    return true;
  }
  
  // 获取统计信息
  getStats() {
    return {
      processor: this.name,
      processed: this.processedCount
    };
  }
  
  // 重置计数
  reset() {
    this.processedCount = 0;
    MNUtil.log(`${this.name} 已重置`);
  }
}

// 高级笔记处理器（子类）- 继承自 NoteProcessor
class AdvancedNoteProcessor extends NoteProcessor {
  constructor(name, options = {}) {
    super(name);  // 调用父类构造函数
    this.autoColor = options.autoColor || false;
    this.addTimestamp = options.addTimestamp || false;
    this.errorCount = 0;
  }
  
  // 重写父类方法 - 添加更多功能
  processNote(note) {
    // 先调用父类的基础处理
    let success = super.processNote(note);
    
    if (!success) {
      this.errorCount++;
      return false;
    }
    
    // 添加高级功能
    if (this.autoColor && note.noteTitle) {
      // 根据标题内容自动设置颜色
      if (note.noteTitle.includes("重要") || note.noteTitle.includes("!!!")) {
        note.colorIndex = 1; // 红色
      } else if (note.noteTitle.includes("TODO") || note.noteTitle.includes("待办")) {
        note.colorIndex = 3; // 黄色
      }
    }
    
    if (this.addTimestamp) {
      // 添加时间戳评论
      let timestamp = new Date().toLocaleString('zh-CN');
      note.appendTextComment(`处理时间: ${timestamp}`);
    }
    
    MNUtil.log(`高级处理器额外处理了笔记: ${note.noteTitle}`);
    return true;
  }
  
  // 新增方法 - 父类没有的功能
  batchColorByKeyword(notes, keyword, color) {
    let count = 0;
    for (let note of notes) {
      if (note.noteTitle && note.noteTitle.includes(keyword)) {
        note.colorIndex = color;
        count++;
      }
    }
    MNUtil.showHUD(`为 ${count} 个包含"${keyword}"的笔记设置了颜色`);
    return count;
  }
  
  // 重写父类的统计方法 - 添加错误统计
  getStats() {
    let baseStats = super.getStats(); // 获取父类的统计
    return {
      ...baseStats,  // 展开父类统计
      errors: this.errorCount,
      successRate: this.processedCount > 0 ? 
        ((this.processedCount - this.errorCount) / this.processedCount * 100).toFixed(1) + '%' : 'N/A'
    };
  }
}

// 使用示例
let basicProcessor = new NoteProcessor("基础处理器");
let advancedProcessor = new AdvancedNoteProcessor("高级处理器", {
  autoColor: true,
  addTimestamp: true
});

// 测试基础处理器
let notes = MNNote.getFocusNotes();
if (notes.length > 0) {
  basicProcessor.processNote(notes[0]);
  MNUtil.log(basicProcessor.getStats());
  
  // 测试高级处理器
  advancedProcessor.processNote(notes[0]);
  MNUtil.log(advancedProcessor.getStats());
  
  // 使用高级处理器的特有功能
  advancedProcessor.batchColorByKeyword(notes, "重要", 1);
}
```

#### 7.2 super 关键字 - 与父类的正确沟通方式

> 🤔 **问题**：在上面的例子中，我们用了 `super.processNote()` 和 `super.getStats()`，这个 `super` 是什么意思？

**super 就像是"请教师父"**：
- `super()` = 请教师父如何初始化
- `super.methodName()` = 请教师父如何做某件事
- `super` 让子类能够复用父类的代码，而不是重写一遍

```javascript
class Plugin {
  constructor(name, version) {
    this.name = name;
    this.version = version;
    this.isActive = false;
    MNUtil.log(`插件 ${name} v${version} 已创建`);
  }
  
  activate() {
    this.isActive = true;
    MNUtil.showHUD(`${this.name} 已激活`);
  }
  
  deactivate() {
    this.isActive = false;
    MNUtil.showHUD(`${this.name} 已停用`);
  }
  
  getInfo() {
    return `${this.name} v${this.version} (${this.isActive ? '已激活' : '未激活'})`;
  }
}

class MarginNotePlugin extends Plugin {
  constructor(name, version, mnVersion) {
    // 调用父类构造函数
    super(name, version);
    this.mnVersion = mnVersion;
    this.features = [];
    MNUtil.log(`MarginNote 插件初始化完成，支持 MN ${mnVersion}`);
  }
  
  // 重写激活方法，添加插件特有逻辑
  activate() {
    // 先执行父类的激活逻辑
    super.activate();
    
    // 再添加 MarginNote 插件特有的激活逻辑
    this.loadFeatures();
    this.setupUI();
    MNUtil.log(`${this.name} 的所有功能已加载`);
  }
  
  // 新增方法
  addFeature(featureName) {
    this.features.push(featureName);
    MNUtil.log(`添加功能: ${featureName}`);
  }
  
  loadFeatures() {
    // 模拟加载功能
    this.addFeature("笔记导出");
    this.addFeature("批量处理");
    this.addFeature("快捷操作");
  }
  
  setupUI() {
    MNUtil.log("设置用户界面...");
  }
  
  // 重写 getInfo 方法，添加更多信息
  getInfo() {
    let baseInfo = super.getInfo(); // 获取父类的基本信息
    return `${baseInfo}\n支持 MarginNote ${this.mnVersion}\n功能数量: ${this.features.length}`;
  }
}

// 使用示例
let myPlugin = new MarginNotePlugin("超级笔记助手", "2.1.0", "4.0");
myPlugin.activate();
MNUtil.log(myPlugin.getInfo());
```

#### 7.3 在 MarginNote 插件中的继承应用

让我们看一个更实际的例子：创建不同类型的笔记分析器

```javascript
// 基础分析器
class NoteAnalyzer {
  constructor(name) {
    this.name = name;
    this.results = {};
  }
  
  analyze(notes) {
    if (!Array.isArray(notes) || notes.length === 0) {
      MNUtil.showHUD("没有笔记需要分析");
      return null;
    }
    
    this.results = {
      total: notes.length,
      analyzed: 0,
      timestamp: new Date().toLocaleString()
    };
    
    for (let note of notes) {
      if (this.analyzeNote(note)) {
        this.results.analyzed++;
      }
    }
    
    MNUtil.log(`${this.name} 分析完成: ${this.results.analyzed}/${this.results.total}`);
    return this.results;
  }
  
  // 基础分析方法（子类可以重写）
  analyzeNote(note) {
    // 基础分析：检查笔记是否有标题
    return note.noteTitle && note.noteTitle.trim().length > 0;
  }
  
  getReport() {
    return `${this.name} 分析报告:\n总计: ${this.results.total || 0}\n已分析: ${this.results.analyzed || 0}`;
  }
}

// 内容分析器 - 分析笔记内容
class ContentAnalyzer extends NoteAnalyzer {
  constructor() {
    super("内容分析器");
  }
  
  analyzeNote(note) {
    // 先执行父类的基础检查
    if (!super.analyzeNote(note)) {
      return false;
    }
    
    // 内容特定分析
    let hasContent = note.textContent && note.textContent.trim().length > 0;
    let hasComments = note.comments && note.comments.length > 0;
    
    // 记录更详细的信息
    if (!this.results.details) {
      this.results.details = {
        withContent: 0,
        withComments: 0,
        empty: 0
      };
    }
    
    if (hasContent) this.results.details.withContent++;
    if (hasComments) this.results.details.withComments++;
    if (!hasContent && !hasComments) this.results.details.empty++;
    
    return hasContent || hasComments;
  }
  
  getReport() {
    let baseReport = super.getReport();
    if (this.results.details) {
      baseReport += `\n有内容: ${this.results.details.withContent}`;
      baseReport += `\n有评论: ${this.results.details.withComments}`;
      baseReport += `\n空笔记: ${this.results.details.empty}`;
    }
    return baseReport;
  }
}

// 关键词分析器 - 分析关键词分布
class KeywordAnalyzer extends NoteAnalyzer {
  constructor(keywords = []) {
    super("关键词分析器");
    this.keywords = keywords;
  }
  
  analyzeNote(note) {
    if (!super.analyzeNote(note)) {
      return false;
    }
    
    if (!this.results.keywords) {
      this.results.keywords = {};
      this.keywords.forEach(keyword => {
        this.results.keywords[keyword] = 0;
      });
    }
    
    let text = (note.noteTitle + ' ' + (note.textContent || '')).toLowerCase();
    
    for (let keyword of this.keywords) {
      if (text.includes(keyword.toLowerCase())) {
        this.results.keywords[keyword]++;
      }
    }
    
    return true;
  }
  
  getReport() {
    let baseReport = super.getReport();
    if (this.results.keywords) {
      baseReport += '\n关键词统计:';
      for (let [keyword, count] of Object.entries(this.results.keywords)) {
        baseReport += `\n  ${keyword}: ${count}`;
      }
    }
    return baseReport;
  }
}

// 使用示例
let notes = MNNote.getFocusNotes();

if (notes.length > 0) {
  // 基础分析
  let basicAnalyzer = new NoteAnalyzer("基础分析器");
  basicAnalyzer.analyze(notes);
  MNUtil.log(basicAnalyzer.getReport());
  
  // 内容分析
  let contentAnalyzer = new ContentAnalyzer();
  contentAnalyzer.analyze(notes);
  MNUtil.log(contentAnalyzer.getReport());
  
  // 关键词分析
  let keywordAnalyzer = new KeywordAnalyzer(["重要", "TODO", "问题", "总结"]);
  keywordAnalyzer.analyze(notes);
  MNUtil.log(keywordAnalyzer.getReport());
}
```

---

### 第7章小结

🎉 你已经掌握了面向对象编程的高级特性！

✅ **继承的核心概念**：
- `extends` 关键字创建子类
- 子类继承父类的所有属性和方法
- 子类可以添加新功能和重写现有功能

✅ **super 关键字的用法**：
- `super()` 调用父类构造函数
- `super.method()` 调用父类方法
- 实现代码复用而不是重复编写

✅ **实际应用场景**：
- 创建专门化的处理器类
- 插件系统的扩展架构
- 分析器、验证器等工具类的层次设计

✅ **设计原则**：
- 基类定义通用功能
- 子类扩展特定功能
- 使用 super 复用父类代码

现在你可以设计出具有层次结构的类系统了！你已经掌握了面向对象编程的核心概念。

接下来，让我们学习 JavaScript 的最后一个重要概念——**异步编程**，这在现代 Web 开发中非常重要！

## 第三部分：异步编程

现在我们已经掌握了 JavaScript 的基础语法和面向对象编程，最后让我们学习异步编程——这是现代编程中非常重要的概念。

### 第8章：异步编程基础 - 让程序更高效

> 🤔 **问题**：有时候我们需要等待某些操作完成（比如延时、网络请求等），但又不想让整个程序卡住。这就需要异步编程！

#### 8.1 同步 vs 异步 - 理解基本概念

**生活类比**：
- **同步**：在银行排队，必须等前面的人办完才轮到你（阻塞）
- **异步**：在餐厅点餐，点完菜可以聊天，菜好了服务员会通知你（非阻塞）

```javascript
// 同步代码 - 按顺序执行
MNUtil.log("第1步：开始处理");
MNUtil.log("第2步：处理中..."); 
MNUtil.log("第3步：处理完成");
// 执行顺序：1 → 2 → 3

// 异步代码 - 不等待就继续执行
MNUtil.log("第1步：开始处理");
setTimeout(() => {
  MNUtil.log("第2步：延时任务完成");  // 1秒后执行
}, 1000);
MNUtil.log("第3步：继续其他任务");
// 实际执行顺序：1 → 3 → (1秒后) 2
```

#### 8.2 Promise 基础 - 异步编程的现代方案

**Promise 就像"承诺书"**：
- 现在先给你一个承诺
- 将来某个时候会兑现承诺（成功或失败）

```javascript
// 创建一个简单的 Promise
function delayedTask(seconds) {
  return new Promise((resolve, reject) => {
    if (seconds < 0) {
      reject(new Error("时间不能为负数"));
      return;
    }
    
    setTimeout(() => {
      resolve(`任务在 ${seconds} 秒后完成了！`);
    }, seconds * 1000);
  });
}

// 使用 Promise
delayedTask(2)
  .then(result => {
    MNUtil.showHUD(result);  // 2秒后显示：任务在 2 秒后完成了！
  })
  .catch(error => {
    MNUtil.showHUD("出错了: " + error.message);
  });

MNUtil.log("不需要等待，继续执行其他任务");
```

#### 8.3 async/await - 让异步代码看起来像同步

**async/await 让异步代码更优雅**：

```javascript
// 传统 Promise 写法（回调地狱）
function processNotesOldWay() {
  delayedTask(1)
    .then(result1 => {
      MNUtil.log(result1);
      return delayedTask(1);
    })
    .then(result2 => {
      MNUtil.log(result2);
      return delayedTask(1);
    })
    .then(result3 => {
      MNUtil.log(result3);
      MNUtil.showHUD("所有任务完成");
    })
    .catch(error => {
      MNUtil.showHUD("出错: " + error.message);
    });
}

// async/await 写法（清晰易读）
async function processNotesNewWay() {
  try {
    let result1 = await delayedTask(1);
    MNUtil.log(result1);
    
    let result2 = await delayedTask(1);  
    MNUtil.log(result2);
    
    let result3 = await delayedTask(1);
    MNUtil.log(result3);
    
    MNUtil.showHUD("所有任务完成");
  } catch (error) {
    MNUtil.showHUD("出错: " + error.message);
  }
}

// 使用 async 函数
processNotesNewWay();
```

#### 8.4 在 MarginNote 插件中的异步应用

让我们看看实际的应用场景：

```javascript
class AsyncNoteProcessor {
  constructor(name) {
    this.name = name;
  }
  
  // 模拟耗时的笔记处理
  async processNoteAsync(note) {
    if (!note) {
      throw new Error("没有笔记需要处理");
    }
    
    MNUtil.log(`开始处理笔记: ${note.noteTitle}`);
    
    // 模拟耗时操作（比如网络请求、复杂计算等）
    await this.delay(500); // 等待0.5秒
    
    // 处理笔记
    if (note.noteTitle) {
      note.noteTitle = note.noteTitle.trim();
    }
    
    // 再次模拟耗时操作
    await this.delay(300);
    
    // 添加时间戳
    let timestamp = new Date().toLocaleString();
    note.appendTextComment(`处理时间: ${timestamp}`);
    
    MNUtil.log(`完成处理笔记: ${note.noteTitle}`);
    return `笔记 ${note.noteTitle} 处理完成`;
  }
  
  // 工具方法：创建延时 Promise
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  // 批量异步处理笔记
  async batchProcessAsync(notes) {
    if (!notes || notes.length === 0) {
      MNUtil.showHUD("没有笔记需要处理");
      return [];
    }
    
    MNUtil.showHUD(`开始批量处理 ${notes.length} 个笔记`);
    let results = [];
    let errors = [];
    
    // 方法1：顺序处理（一个接一个）
    for (let i = 0; i < notes.length; i++) {
      try {
        let result = await this.processNoteAsync(notes[i]);
        results.push(result);
        
        // 显示进度
        if ((i + 1) % 5 === 0 || i === notes.length - 1) {
          MNUtil.showHUD(`已处理 ${i + 1}/${notes.length} 个笔记`);
        }
      } catch (error) {
        errors.push(`第${i+1}个笔记处理失败: ${error.message}`);
        MNUtil.log(errors[errors.length - 1]);
      }
    }
    
    // 显示最终结果
    let summary = `批量处理完成:\n成功: ${results.length}\n失败: ${errors.length}`;
    MNUtil.showHUD(summary);
    
    return { results, errors };
  }
  
  // 并行批量处理（同时处理多个）
  async batchProcessParallel(notes, maxConcurrent = 3) {
    if (!notes || notes.length === 0) {
      MNUtil.showHUD("没有笔记需要处理");
      return [];
    }
    
    MNUtil.showHUD(`开始并行处理 ${notes.length} 个笔记`);
    let results = [];
    let errors = [];
    
    // 分批并行处理
    for (let i = 0; i < notes.length; i += maxConcurrent) {
      let batch = notes.slice(i, i + maxConcurrent);
      let batchPromises = batch.map(async (note, index) => {
        try {
          let result = await this.processNoteAsync(note);
          return { success: true, result, index: i + index };
        } catch (error) {
          return { success: false, error: error.message, index: i + index };
        }
      });
      
      // 等待当前批次完成
      let batchResults = await Promise.all(batchPromises);
      
      // 处理批次结果
      batchResults.forEach(item => {
        if (item.success) {
          results.push(item.result);
        } else {
          errors.push(`第${item.index + 1}个笔记: ${item.error}`);
        }
      });
      
      // 显示进度
      let processed = Math.min(i + maxConcurrent, notes.length);
      MNUtil.showHUD(`并行处理进度: ${processed}/${notes.length}`);
      
      // 批次间稍作延迟，避免过度并发
      if (i + maxConcurrent < notes.length) {
        await this.delay(100);
      }
    }
    
    let summary = `并行处理完成:\n成功: ${results.length}\n失败: ${errors.length}`;
    MNUtil.showHUD(summary);
    
    return { results, errors };
  }
}

// 使用示例
async function demonstrateAsyncProcessing() {
  let processor = new AsyncNoteProcessor("异步处理器");
  let notes = MNNote.getFocusNotes();
  
  if (notes.length > 0) {
    try {
      MNUtil.log("=== 演示单个笔记异步处理 ===");
      let result = await processor.processNoteAsync(notes[0]);
      MNUtil.log(result);
      
      if (notes.length > 1) {
        MNUtil.log("=== 演示批量顺序处理 ===");
        let batchResult = await processor.batchProcessAsync(notes.slice(0, 3));
        MNUtil.log(`顺序处理结果: 成功${batchResult.results.length}个`);
        
        MNUtil.log("=== 演示批量并行处理 ===");
        let parallelResult = await processor.batchProcessParallel(notes.slice(0, 5));
        MNUtil.log(`并行处理结果: 成功${parallelResult.results.length}个`);
      }
    } catch (error) {
      MNUtil.showHUD("处理过程中出错: " + error.message);
    }
  } else {
    MNUtil.showHUD("请先选择一些笔记");
  }
}

// 调用演示函数
demonstrateAsyncProcessing();
```

#### 8.5 异步编程的最佳实践

```javascript
class AsyncBestPractices {
  // 1. 错误处理要完善
  static async safeAsyncOperation(operation) {
    try {
      let result = await operation();
      return { success: true, data: result };
    } catch (error) {
      MNUtil.log(`异步操作失败: ${error.message}`);
      return { success: false, error: error.message };
    }
  }
  
  // 2. 设置超时避免无限等待
  static async withTimeout(promise, timeoutMs = 5000) {
    let timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('操作超时')), timeoutMs);
    });
    
    return Promise.race([promise, timeoutPromise]);
  }
  
  // 3. 批量操作要控制并发数
  static async batchWithLimit(items, asyncFn, limit = 3) {
    let results = [];
    
    for (let i = 0; i < items.length; i += limit) {
      let batch = items.slice(i, i + limit);
      let batchPromises = batch.map(item => asyncFn(item));
      let batchResults = await Promise.allSettled(batchPromises);
      
      results.push(...batchResults);
      
      // 批次间稍作延迟
      if (i + limit < items.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    return results;
  }
  
  // 4. 重试机制
  static async withRetry(asyncFn, maxRetries = 3, delay = 1000) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await asyncFn();
      } catch (error) {
        if (attempt === maxRetries) {
          throw error;
        }
        
        MNUtil.log(`第${attempt}次尝试失败，${delay}ms后重试...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
}

// 使用最佳实践的示例
async function bestPracticeExample() {
  // 1. 安全的异步操作
  let safeResult = await AsyncBestPractices.safeAsyncOperation(async () => {
    // 模拟可能出错的操作
    if (Math.random() > 0.5) {
      throw new Error("随机错误");
    }
    return "操作成功";
  });
  
  if (safeResult.success) {
    MNUtil.log("安全操作成功: " + safeResult.data);
  } else {
    MNUtil.log("安全操作失败: " + safeResult.error);
  }
  
  // 2. 带超时的操作
  try {
    let timeoutResult = await AsyncBestPractices.withTimeout(
      delayedTask(3),  // 3秒的任务
      2000            // 2秒超时
    );
    MNUtil.log("超时测试成功: " + timeoutResult);
  } catch (error) {
    MNUtil.log("超时测试失败: " + error.message);
  }
}

// 运行最佳实践示例
bestPracticeExample();
```

---

### 第8章小结

🎉 恭喜！你已经掌握了异步编程的核心概念！

✅ **异步编程基础**：
- 理解同步 vs 异步的区别
- 掌握 Promise 的基本用法
- 熟悉 async/await 语法

✅ **实际应用**：
- 在 MarginNote 插件中处理耗时操作
- 批量异步处理的两种模式（顺序 vs 并行）
- 错误处理和进度反馈

✅ **最佳实践**：
- 完善的错误处理机制
- 超时控制避免无限等待
- 并发控制避免过度负载
- 重试机制提高成功率