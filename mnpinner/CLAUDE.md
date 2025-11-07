# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

**MN Pinner** 是 MarginNote 4 的浮窗插件，提供卡片和文档页面的置顶管理功能。

核心功能：
- Pin 视图：固定卡片到不同分区（Focus、中间知识、待整理等）
- Task 视图：任务管理（Today、Tomorrow、This Week、TODO、日拱一卒）
- 自定义子视图：最多 5 个自定义分区
- 跨插件通信：URL Scheme 支持

## 代码架构

### 核心文件

```
mnpinner/
├── main.js                 # 插件入口和生命周期
├── utils.js                # 工具类和配置管理
├── webviewController.js    # 视图控制器（精简版）
├── mnaddon.json           # 插件配置
└── logo.png               # 插件图标
```

### 关键类

#### 1. pinnerUtils (utils.js)

工具类和视图控制器管理

重要方法：
- `init(mainPath)` - 初始化
- `checkPinnerController()` - 单例创建视图控制器
- `pinCard(noteId, title, section, position)` - Pin 卡片
- `pinPage(docMd5, pageIndex, title, section, position, note)` - Pin 页面

#### 2. pinnerConfig (utils.js:191-2268)

数据管理和持久化

数据结构：
```javascript
{
  sections: {
    // Pin 视图
    focus: [],
    midway: [],
    toOrganize: [],

    // Task 视图
    taskToday: [],
    taskTomorrow: [],
    taskThisWeek: [],
    taskTodo: [],
    taskDailyTask: []
  },
  config: {
    version: "1.0.0",
    source: "focus",
    pageTitlePresets: []
  },
  settings: {
    alwaysAskCardTitle: false,
    alwaysAskPageTitle: false,
    defaultViewMode: "pin",
    defaultSection: "focus"
  }
}
```

Pin 数据类型：
```javascript
// Card Pin
{
  type: "card",
  noteId: "xxx",
  title: "卡片标题"
}

// Page Pin
{
  type: "page",
  docMd5: "xxx",
  pageIndex: 5,
  title: "第6页",
  note: "备注",
  pinnedAt: 1234567890
}
```

核心方法：
- `createCardPin(noteId, title)` - 创建 Card Pin
- `createPagePin(docMd5, pageIndex, title, note)` - 创建 Page Pin
- `addPin(pinData, section, position)` - 添加 Pin
- `removePin(pinOrId, section)` - 删除 Pin
- `movePin(oldIndex, newIndex, section)` - 移动顺序
- `transferPin(pinOrId, fromSection, toSection)` - 转移分区
- `save(sectionName)` - 保存数据

#### 3. pinnerController (webviewController.js)

视图控制器（精简版）

功能：
- WebView 管理
- 关闭按钮和拖动手势
- 显示/隐藏动画
- JavaScript 交互

#### 4. MNPinnerClass (main.js)

插件主类

生命周期：
- `sceneWillConnect()` - 新建窗口
- `sceneDidDisconnect()` - 关闭窗口
- `notebookWillOpen(topicid)` - 打开笔记本
- `notebookWillClose(topicid)` - 关闭笔记本
- `documentDidOpen(docmd5)` - 打开文档
- `documentWillClose(docmd5)` - 关闭文档
- `addonDidConnect()` - 插件首次加载
- `addonWillDisconnect()` - 插件卸载前

## 跨插件通信

### URL Scheme 格式

```
marginnote4app://addon/mnpinner?action=ACTION&param1=value1&param2=value2
```

### 支持的 Actions

#### 1. pin - 添加卡片（推荐）

参数：
- `id` (必需) - 卡片 ID（URL 编码）
- `title` (可选) - 显示标题（URL 编码）
- `section` (可选) - 分区（默认 "midway"）
  - 可选值：focus、midway、toOrganize
- `position` (可选) - 插入位置（默认 "bottom"）
  - 可选值：top、bottom、数字索引

示例：
```
marginnote4app://addon/mnpinner?action=pin&id=NOTE123&title=重要笔记&section=focus&position=top
```

#### 2. pinCardToSection - 添加 Card 到指定分区

参数：
- `id` / `noteId` (必需) - 卡片 ID
- `section` (可选) - 分区（默认 "midway"）
- `position` (可选) - 位置（默认 "top"）
- `title` (可选) - 标题

示例：
```
marginnote4app://addon/mnpinner?action=pinCardToSection&id=NOTE123&section=focus&position=top
```

#### 3. pinPageToSection - 添加 Page 到指定分区

参数：
- `docMd5` / `docmd5` (必需) - 文档 MD5
- `pageIndex` / `pageindex` (必需) - 页码（从 0 开始）
- `section` (可选) - 分区（默认 "midway"）
- `position` (可选) - 位置（默认 "top"）
- `title` (可选) - 标题
- `note` (可选) - 备注

示例：
```
marginnote4app://addon/mnpinner?action=pinPageToSection&docMd5=ABC123&pageIndex=5&section=focus
```

#### 4. moveToTop - 移动到顶部

参数：
- `id` (必需) - 卡片 ID
- `section` (必需) - 分区

#### 5. moveToBottom - 移动到底部

参数：
- `id` (必需) - 卡片 ID
- `section` (必需) - 分区

#### 6. showPinBoard - 显示面板

无参数

### 注意事项

1. URL 编码：中文和特殊字符必须用 `encodeURIComponent` 编码
2. 参数验证：无效的 section 会返回错误
3. 去重检查：重复添加相同 ID 会提示"卡片已存在"

## 开发指南

### 添加新卡片到 Focus

```javascript
let cardPin = pinnerConfig.createCardPin("noteId123", "卡片标题")
pinnerConfig.addPin(cardPin, "focus", "top")

// 刷新视图
if (pinnerUtils.pinnerController) {
  pinnerUtils.pinnerController.refreshView("focusView")
}
```

### 添加页面到待整理

```javascript
let pagePin = pinnerConfig.createPagePin("docMd5", 5, "第6页", "备注")
pinnerConfig.addPin(pagePin, "toOrganize", "bottom")

// 刷新视图
if (pinnerUtils.pinnerController) {
  pinnerUtils.pinnerController.refreshView("toOrganizeView")
}
```

### 导出/导入配置

```javascript
// 导出到文件
pinnerConfig.exportToFile()

// 从文件导入
await pinnerConfig.importFromFile()

// 导出到剪贴板
pinnerConfig.exportToClipboard()

// 从剪贴板导入
pinnerConfig.importFromClipboard()
```

## 已知问题

### 1. 崩溃问题（见 ips.md）

问题：UIView 创建时的 bounds 异常

堆栈：
```
QuartzCore CA::Layer::set_bounds
UIKitCore -[UIView _createLayerWithFrame:]
JavaScriptCore JSC::ObjCCallbackFunctionImpl::call
```

可能原因：
- JavaScript 传递的 frame 参数包含无效值（NaN、Infinity）
- 内存不足

建议修复：
1. 创建 UIView 前验证 frame 参数
2. 添加防御性检查
3. 捕获异常并提供降级方案

### 2. self 和 this 的使用

重要：在 JSB.defineClass 内部严禁使用 `let self = this;`

```javascript
// 错误
let self = this;

// 正确
self.someProperty = value;
```

### 3. 多窗口支持

- MarginNote 支持多窗口，插件实例独立
- 数据挂载到 `self` 上区分窗口
- 视图控制器通过 `pinnerUtils` 单例管理

## 构建和打包

### 打包插件

```bash
cd /path/to/mnpinner
mnaddon4 build .
```

或优先使用 mnaddon-packager agent：
```
请打包 mnpinner 插件
```

### 解包插件

```bash
mnaddon4 unpack plugin_name.mnaddon
```

## 调试技巧

```javascript
// 日志记录
pinnerUtils.log("消息", "来源")

// 复制对象
MNUtil.copyJSON(object)

// HUD 提示
MNUtil.showHUD("提示信息")

// 错误日志
// 错误自动记录到 pinnerUtils.errorLog 并复制到剪贴板
```

## 相关文档

- MarginNote 插件开发指南：`../CLAUDE.md`
- MNUtils API 文档：`../mnutils/MNUtils_API_Guide.md`
- MNUtils 实现文档：`../mnutils/CLAUDE.md`
