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
├── main.js                 # 插件入口和生命周期（~600 行）
├── utils.js                # 工具类和配置管理（~2200 行）
├── webviewController.js    # 主视图控制器（~1800 行）
├── settingController.js    # 设置视图控制器（~600 行，已废弃）
├── index.html              # 静态模板（未使用）
├── mnaddon.json           # 插件配置
└── logo.png               # 插件图标
```

**注：** `settingController.js` 已实现但未集成到主面板，其功能在 `webviewController.js` 的 `preferencesView` 中重新实现。

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
    defaultSection: "focus",
    rememberLastView: true,     // 记住上次视图
    lastViewMode: "pin",         // 上次的视图模式
    lastSection: "focus"         // 上次的分区
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

**创建与添加：**
- `createCardPin(noteId, title)` - 工厂方法：创建 Card Pin
- `createPagePin(docMd5, pageIndex, title, note)` - 工厂方法：创建 Page Pin
- `addPin(pinData, section, position)` - 统一添加方法（支持 top/bottom/index）

**删除与修改：**
- `removePin(pinOrId, section)` - 删除 Pin（支持对象或 ID）
- `updatePinTitle(noteId, newTitle, section)` - 更新卡片标题
- `updatePageTitle(oldTitle, newPageIndex)` - 智能更新页面标题中的页数
- `clearPins(section)` - 清空分区（返回 Promise）

**移动与转移：**
- `movePin(oldIndex, newIndex, section)` - 调整顺序
- `transferPin(pinOrId, fromSection, toSection)` - 转移到其他分区

**查询：**
- `getPins(section)` - 获取分区所有 Pin
- `getAllConfig()` - 获取完整配置
- `isValidTotalConfig(data)` - 验证配置格式

**导入导出：**
- `exportToFile()` - 导出为 JSON 文件
- `exportToClipboard()` - 导出到剪贴板
- `exportToCard(targetNote)` - 导出到指定卡片
- `importConfig(newConfig)` - 导入配置（自动迁移）
- `importFromFile()` - 从文件导入
- `importFromClipboard()` - 从剪贴板导入
- `importFromCard(note)` - 从卡片导入

**数据持久化：**
- `save(sectionName)` - 保存数据（可选指定分区）
- `load()` - 加载数据

#### 3. pinnerController (webviewController.js)

主视图控制器

**核心功能：**
- WebView 创建和生命周期管理
- 多分区视图创建和切换（配置驱动）
- 视图模式切换（Pin ↔ Task ↔ Custom）
- 底部工具栏管理（8个快捷按钮）
- 拖放移动手势（支持边缘吸附）
- 调整大小手势（右下角调整）
- 多选模式和批量导出
- 显示/隐藏动画（淡入淡出）
- JavaScript 交互和数据绑定

**视图层级结构：**
```
this.view (主容器)
├── moveButton (拖动柄，蓝色圆点)
├── closeButton (关闭按钮)
├── resizeButton (调整大小按钮)
├── settingView (主内容区)
│   ├── tabView (标签栏，水平滚动)
│   │   ├── focusTabButton (分区标签按钮)
│   │   ├── midwayTabButton
│   │   └── ... (其他分区按钮，配置驱动创建)
│   ├── focusView (分区容器，只显示一个)
│   │   └── focusCardScrollView (卡片列表滚动视图)
│   ├── midwayView
│   │   └── midwayCardScrollView
│   └── ... (其他分区容器)
└── toolbar (底部工具栏)
    ├── viewModeButton (视图模式切换)
    ├── toolbarClearButton (清空分区)
    ├── toolbarPinCardButton (Pin 卡片)
    ├── toolbarPinPageButton (Pin 页面)
    ├── toolbarAddButton (手动添加)
    ├── toolbarExportURLButton (导出 URL)
    └── toolbarExportMarkdownButton (导出 Markdown)

preferencesView (设置窗口，叠加显示)
├── 默认视图设置
├── 行为设置（是否弹窗询问标题）
└── 预设短语管理
```

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

## 数据存储与迁移

### NSUserDefaults 键值表

插件使用 NSUserDefaults 存储所有数据，键值如下：

| 键名 | 数据类型 | 说明 | 示例 |
|------|--------|------|------|
| `MNPinner_sections` | Object | 所有分区的卡片数据 | `{focus: [], midway: [], ...}` |
| `MNPinner_config` | Object | 配置信息（版本、预设短语） | `{version: "1.0.0", pageTitlePresets: []}` |
| `MNPinner_settings` | Object | 用户设置 | `{defaultViewMode: "pin", ...}` |
| `MNPinner_sectionConfigs` | JSON String | 分区元数据（用户自定义配置） | SectionRegistry 配置 |
| `MNPinner_temporaryPins` | Array | **已废弃**（v1.0 遗留） | - |

### 数据迁移机制

插件启动时（`pinnerConfig.init()`）会自动执行数据迁移，确保向后兼容：

#### 迁移流程

```javascript
// v0 → v1.0 迁移
if (临时卡片存在) {
  迁移所有临时卡片到 midway 分区
  删除旧的 temporaryPins 键
}

// v1.0 → v1.1 迁移
for (每个分区的所有 Pin) {
  if (!pin.type) {
    pin.type = "card"  // 添加 type 字段
  }
}

// v1.1 → v1.2 迁移
if (pages 分区存在) {
  迁移 pages 所有数据到 toOrganize
  清空 pages 分区
}
if (dailyTask 分区存在) {
  迁移 dailyTask 所有数据到 taskDailyTask
  清空 dailyTask 分区
}

// 新增分区初始化
for (SectionRegistry 中的所有分区) {
  if (!pinnerConfig.sections[section]) {
    pinnerConfig.sections[section] = []  // 初始化空数组
  }
}
```

#### 版本历史

| 版本 | 变更内容 | 迁移说明 |
|------|--------|--------|
| v0.x | 临时卡片功能 | - |
| v1.0 | 迁移到分区系统 | temporaryPins → midway |
| v1.1 | 添加 type 字段 | 所有 Pin 添加 type: "card" |
| v1.2 | 分区重命名 | pages → toOrganize, dailyTask → taskDailyTask |
| v2.0 | 配置驱动架构 | SectionRegistry 引入 |
| v2.1 | 自定义视图 | 新增 custom1-5 分区 |

### 数据导出格式

#### 完整配置结构

```javascript
{
  sections: {
    focus: [
      {type: "card", noteId: "xxx", title: "卡片标题"},
      {type: "page", docMd5: "xxx", pageIndex: 5, title: "第6页", note: "备注", pinnedAt: 1234567890}
    ],
    midway: [],
    // ... 其他分区
  },
  config: {
    version: "1.2.0",
    source: "focus",
    pageTitlePresets: ["重要", "复习", "待办"]
  },
  settings: {
    alwaysAskCardTitle: false,
    alwaysAskPageTitle: false,
    defaultViewMode: "pin",
    defaultSection: "focus",
    rememberLastView: true,
    lastViewMode: "pin",
    lastSection: "focus"
  }
}
```

#### 导出方式对比

| 方式 | 方法 | 适用场景 | 特点 |
|------|------|--------|------|
| 导出到文件 | `exportToFile()` | 完整备份 | 弹出文件选择器，保存为 .json |
| 导出到剪贴板 | `exportToClipboard()` | 快速分享 | 自动复制到剪贴板 |
| 导出到卡片 | `exportToCard(note)` | 集成到笔记 | 创建或追加到卡片评论 |

#### 导入验证

`isValidTotalConfig(data)` 验证导入数据的完整性：

```javascript
// 必需字段检查
✅ data.sections 存在且为对象
✅ data.config 存在且为对象
✅ data.config.version 存在

// 可选但推荐
⚠️ data.settings 存在
⚠️ 所有分区数据为数组

// 自动修复
🔧 缺失的分区自动初始化为 []
🔧 version 自动更新为当前版本
```

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

## 核心功能详解

### 1. 多选导出功能

用户可以勾选多个卡片并批量导出为 URL 列表或 Markdown 链接。

#### 使用流程

1. **进入多选模式**：长按任意卡片
2. **勾选卡片**：点击卡片左侧的复选框
3. **导出操作**：点击底部工具栏的导出按钮
   - 🔗 **导出 URL**：纯 MarginNote URL 列表（每行一个）
   - 📝 **导出 Markdown**：带序号的 Markdown 链接列表

#### 导出格式示例

**URL 列表格式：**
```
marginnote4app://note/NOTE123
marginnote4app://note/NOTE456
marginnote4app://note/NOTE789
```

**Markdown 格式：**
```markdown
1. [卡片标题1](marginnote4app://note/NOTE123)
2. [卡片标题2](marginnote4app://note/NOTE456)
3. [卡片标题3](marginnote4app://note/NOTE789)
```

#### 导出目标

用户可以选择将导出的内容：
- **复制到剪贴板**：直接使用 `MNUtil.copyText()`
- **创建新卡片**：在当前笔记本创建评论卡片
- **添加到现有卡片**：追加到聚焦卡片的评论中

#### 实现要点

```javascript
// 多选状态管理
this.selectedCards = new Map()  // key: "section-noteId", value: {noteId, title, section}

// 添加选中卡片
this.selectedCards.set(`${section}-${noteId}`, {noteId, title, section})

// 导出为 URL
exportSelectedCardsAsURL() {
  let urls = []
  this.selectedCards.forEach(card => {
    urls.push("marginnote4app://note/" + card.noteId)
  })
  return urls.join("\n")
}

// 导出为 Markdown
exportSelectedCardsAsMarkdown() {
  let lines = []
  let index = 1
  this.selectedCards.forEach(card => {
    lines.push(`${index}. [${card.title}](marginnote4app://note/${card.noteId})`)
    index++
  })
  return lines.join("\n")
}
```

### 2. 预设短语管理

为 Pin 页面时提供快速选择的标题预设。

#### 功能说明

- 存储常用的页面标题模板
- Pin 页面时可从预设列表快速选择
- 支持添加、编辑、删除预设

#### 使用方法

1. **打开设置界面**：点击右上角齿轮图标
2. **管理预设**：点击"管理预设短语"按钮
3. **添加预设**：输入常用标题，点击"添加"
4. **删除预设**：长按预设项，选择"删除"
5. **使用预设**：Pin 页面时，从列表中选择预设

#### 预设示例

```javascript
pinnerConfig.config.pageTitlePresets = [
  "重要内容",
  "需要复习",
  "待整理",
  "第x页",
  "p.x",
  "Page x"
]
```

#### API 方法

```javascript
// 添加预设
pinnerConfig.addPreset("新预设")

// 删除预设
pinnerConfig.removePreset(index)

// 获取所有预设
let presets = pinnerConfig.config.pageTitlePresets

// 保存预设
pinnerConfig.save()
```

#### 预设弹窗

Pin 页面时，如果 `alwaysAskPageTitle` 为 false，会直接使用默认标题；如果为 true，会弹出对话框让用户选择：
- 使用预设标题
- 自定义输入
- 使用默认标题（第x页）

### 3. 智能页面标题更新

Pin 页面时，系统会智能识别标题中的页数并自动更新。

#### 支持的格式

| 格式 | 示例 | 更新后 |
|------|------|--------|
| 中文格式 | "第5页：重要内容" | "第8页：重要内容" |
| 英文格式（小写p） | "p.5 - 知识点" | "p.8 - 知识点" |
| 英文格式（大写P） | "Page 5: Notes" | "Page 8: Notes" |

#### 实现原理

```javascript
updatePageTitle(oldTitle, newPageIndex) {
  // 替换中文格式
  if (oldTitle.includes("第") && oldTitle.includes("页")) {
    return oldTitle.replace(/第(\d+)页/, `第${newPageIndex + 1}页`)
  }

  // 替换 p.x 格式
  if (/p\.(\d+)/i.test(oldTitle)) {
    return oldTitle.replace(/p\.(\d+)/i, `p.${newPageIndex + 1}`)
  }

  // 替换 Page x 格式
  if (/Page\s+(\d+)/i.test(oldTitle)) {
    return oldTitle.replace(/Page\s+(\d+)/i, `Page ${newPageIndex + 1}`)
  }

  // 无法识别格式，返回默认标题
  return `第${newPageIndex + 1}页`
}
```

#### 使用示例

```javascript
// Pin 新页面时复用旧标题
let oldPin = {
  type: "page",
  docMd5: "ABC123",
  pageIndex: 4,
  title: "第5页：重要知识点"
}

// 更新到第8页
let newTitle = pinnerConfig.updatePageTitle(oldPin.title, 7)
// newTitle = "第8页：重要知识点"

let newPin = pinnerConfig.createPagePin("ABC123", 7, newTitle, oldPin.note)
pinnerConfig.addPin(newPin, "focus", "top")
```

### 4. 底部工具栏

固定在面板底部的快捷操作栏，提供常用功能的快速入口。

#### 工具栏按钮

| 按钮 | 图标 | 功能 | 快捷键/条件 |
|------|------|------|-----------|
| **视图模式** | 🔄 | 切换 Pin/Task/Custom 模式 | 点击切换 |
| **清空分区** | 🗑️ | 清空当前分区所有卡片 | 需要确认 |
| **Pin 卡片** | 📌 | Pin 当前聚焦卡片 | 需要聚焦卡片 |
| **Pin 页面** | 📄 | Pin 当前文档页面 | 需要打开文档 |
| **手动添加** | ➕ | 手动输入创建 Pin | 弹出输入框 |
| **导出 URL** | 🔗 | 多选导出为 URL 列表 | 需选中卡片 |
| **导出 Markdown** | 📝 | 多选导出为 Markdown | 需选中卡片 |
| **设置** | ⚙️ | 打开设置界面 | - |

#### 工具栏布局

```
┌─────────────────────────────────────────────────┐
│  🔄   🗑️   📌   📄   ➕   🔗   📝   ⚙️         │
└─────────────────────────────────────────────────┘
   ↑     ↑     ↑     ↑     ↑     ↑     ↑     ↑
  模式  清空  卡片  页面  添加  URL   MD   设置
```

#### 按钮状态管理

```javascript
// 根据多选状态动态更新按钮
updateToolbarButtonStates() {
  let hasSelection = this.selectedCards.size > 0

  // 导出按钮仅在有选中卡片时可用
  this.toolbarExportURLButton.enabled = hasSelection
  this.toolbarExportMarkdownButton.enabled = hasSelection

  // Pin 按钮根据上下文可用性
  this.toolbarPinCardButton.enabled = (MNNote.getFocusNote() != null)
  this.toolbarPinPageButton.enabled = (MNUtil.currentDocController != null)
}
```

#### 实现细节

```javascript
// 创建工具栏
createToolbarButtons() {
  let toolbar = UIView.new()
  toolbar.frame = {x: 0, y: height - 44, width: width, height: 44}
  toolbar.backgroundColor = UIColor.colorWithHexString("#2d2d2d")

  let buttonWidth = width / 8
  let buttons = [
    {title: "🔄", action: "switchViewMode"},
    {title: "🗑️", action: "clearCurrentSection"},
    {title: "📌", action: "pinFocusCard"},
    {title: "📄", action: "pinCurrentPage"},
    {title: "➕", action: "manualAddPin"},
    {title: "🔗", action: "exportSelectedAsURL"},
    {title: "📝", action: "exportSelectedAsMarkdown"},
    {title: "⚙️", action: "showPreferences"}
  ]

  buttons.forEach((btn, index) => {
    let button = UIButton.new()
    button.frame = {x: buttonWidth * index, y: 0, width: buttonWidth, height: 44}
    button.setTitleForState(btn.title, 0)
    button.tag = 9000 + index
    button.addTargetActionForControlEvents(self, btn.action, 1 << 6)
    toolbar.addSubview(button)
  })

  this.view.addSubview(toolbar)
  this.toolbar = toolbar
}
```

### 5. 启动设置

配置插件启动时的默认行为，提供个性化的使用体验。

#### 设置项说明

| 设置项 | 字段名 | 类型 | 说明 | 默认值 |
|--------|--------|------|------|--------|
| **记住上次视图** | `rememberLastView` | boolean | 启动时恢复上次关闭时的视图 | true |
| **默认视图模式** | `defaultViewMode` | string | 固定默认视图模式（pin/task/custom） | "pin" |
| **默认分区** | `defaultSection` | string | 固定默认分区 | "focus" |
| **上次视图模式** | `lastViewMode` | string | 记录上次的视图模式（自动） | "pin" |
| **上次分区** | `lastSection` | string | 记录上次的分区（自动） | "focus" |

#### 启动逻辑

```javascript
// 插件显示时决定初始视图
show() {
  let viewMode, section

  if (pinnerConfig.settings.rememberLastView) {
    // 恢复上次视图
    viewMode = pinnerConfig.settings.lastViewMode || "pin"
    section = pinnerConfig.settings.lastSection || "focus"
  } else {
    // 使用固定默认视图
    viewMode = pinnerConfig.settings.defaultViewMode || "pin"
    section = pinnerConfig.settings.defaultSection || "focus"
  }

  // 切换到目标视图
  this.switchViewMode(viewMode)
  this.switchView(section)
}

// 插件隐藏时保存当前视图
hide() {
  // 保存当前状态
  pinnerConfig.settings.lastViewMode = this.currentViewMode
  pinnerConfig.settings.lastSection = this.currentSection
  pinnerConfig.save()
}
```

#### 设置界面

用户可以在设置界面（⚙️ 按钮）中配置：

```
┌─────────────────────────────────────┐
│  启动设置                            │
├─────────────────────────────────────┤
│  ☑️ 记住上次视图                    │
│  ☐ 固定默认视图                     │
│                                     │
│  默认视图模式：[Pin ▼]              │
│  默认分区：    [Focus ▼]            │
│                                     │
│  [保存]  [取消]                     │
└─────────────────────────────────────┘
```

#### API 配置

```javascript
// 启用记住上次视图
pinnerConfig.settings.rememberLastView = true
pinnerConfig.save()

// 固定默认视图
pinnerConfig.settings.rememberLastView = false
pinnerConfig.settings.defaultViewMode = "pin"
pinnerConfig.settings.defaultSection = "focus"
pinnerConfig.save()

// 手动设置上次视图（通常由系统自动管理）
pinnerConfig.settings.lastViewMode = "task"
pinnerConfig.settings.lastSection = "taskToday"
pinnerConfig.save()
```

#### 使用场景

**场景 1：项目工作模式**
```javascript
// 每次都从 Focus 分区开始
settings.rememberLastView = false
settings.defaultViewMode = "pin"
settings.defaultSection = "focus"
```

**场景 2：任务管理模式**
```javascript
// 每次都从今天任务开始
settings.rememberLastView = false
settings.defaultViewMode = "task"
settings.defaultSection = "taskToday"
```

**场景 3：连续工作模式**
```javascript
// 自动恢复上次工作状态
settings.rememberLastView = true
// defaultViewMode 和 defaultSection 作为回退选项
```

## 视图管理（配置驱动架构）⭐

MNPinner v2.0 采用配置驱动架构，通过 `SectionRegistry` 配置中心统一管理所有视图分区。

### 架构概述

**核心类：SectionRegistry** (`utils.js:222-432`)

所有视图分区的元数据都集中在 `SectionRegistry.sections` 中，包括：
- **key**: 分区唯一标识（用于数据存储和代码引用）
- **displayName**: 显示名称（界面显示）
- **viewMode**: 视图模式（"pin"、"task" 或 "custom"）
- **color**: 主题颜色（十六进制色值）
- **icon**: 图标（Emoji）
- **order**: 显示顺序（数字越小越靠前）
- **description**: 分区描述

**核心方法：**

| 方法 | 功能 | 返回值 |
|------|------|--------|
| `getConfig(key)` | 获取单个分区配置 | Object \| undefined |
| `getAllByMode(mode)` | 获取指定模式的所有分区 | Array |
| `getOrderedKeys(mode)` | 获取排序后的分区键名 | Array<string> |
| `getDisplayName(key)` | 获取显示名称 | string |
| `has(key)` | 检查分区是否存在 | boolean |
| `addSection(config)` | 动态添加分区 | boolean |
| `removeSection(key)` | 删除分区 | boolean |
| `loadFromStorage()` | 从 NSUserDefaults 加载用户自定义配置 | void |
| `saveToStorage()` | 保存配置到 NSUserDefaults | void |
| `resetToDefault()` | 重置为默认配置 | void |

### 当前分区列表

**Pin 视图（5个）：**
1. Focus - 重点关注的卡片 (#457bd3 📌)
2. 中间知识 - 待进一步处理的知识 (#61afef 📚)
3. 待整理 - 需要整理的零散内容 (#98c379 📥)
4. Class - 课程相关内容 (#e5c07b 🎓)

**Task 视图（5个）：**
1. Today - 今天要处理的任务 (#e06c75 📅)
2. Tomorrow - 明天的任务 (#d19a66 📆)
3. This Week - 本周任务 (#c678dd 📊)
4. TODO - 待办事项 (#56b6c2 ✅)
5. 日拱一卒 - 每日坚持的任务 (#98c379 🏃)

**自定义视图（5个）：**
1. Custom 1-5 - 用户自定义分区（可通过配置自定义名称、颜色和图标）

### 添加新视图

#### 步骤 1：在 SectionRegistry 添加配置

**文件位置：** `utils.js` 第 236-321 行

在 `SectionRegistry.sections` Map 中添加新的配置对象：

```javascript
class SectionRegistry {
  static sections = new Map([
    // ... 现有配置

    // 添加新视图：例如 "项目" 分区
    ["project", {
      key: "project",                    // 必需：唯一标识，用于数据存储
      displayName: "项目",                // 必需：界面显示名称
      viewMode: "pin",                   // 必需：视图模式 "pin" 或 "task"
      color: "#c678dd",                  // 必需：主题颜色（十六进制）
      icon: "📂",                        // 可选：图标 Emoji
      order: 5,                          // 必需：显示顺序（决定标签位置）
      description: "项目相关的卡片"       // 可选：描述信息
    }],

    // ... 其他配置
  ])
}
```

#### 步骤 2：验证配置

添加后，系统会自动：
1. ✅ 在数据层创建对应的数据结构（`pinnerConfig.sections.project`）
2. ✅ 创建视图容器（`projectView`）
3. ✅ 创建标签按钮（`projectTabButton`）
4. ✅ 绑定事件处理（自动使用 `genericTabTapped`）
5. ✅ 支持所有标准操作（Pin、清空、导出等）
6. ✅ 支持 URL Scheme（`section=project`）

**无需修改其他任何代码！**

#### 配置参数详解

| 参数 | 类型 | 必需 | 说明 | 示例 |
|------|------|------|------|------|
| `key` | string | ✅ | 唯一标识，用于数据存储和 URL Scheme | `"project"` |
| `displayName` | string | ✅ | 界面显示的名称 | `"项目"` |
| `viewMode` | string | ✅ | 视图模式，决定分组显示 | `"pin"` 或 `"task"` |
| `color` | string | ✅ | 主题颜色（选中时的按钮颜色） | `"#c678dd"` |
| `icon` | string | 可选 | 图标，通常使用 Emoji | `"📂"` |
| `order` | number | ✅ | 显示顺序，数字越小越靠前 | `5` |
| `description` | string | 可选 | 描述信息，用于说明分区用途 | `"项目相关的卡片"` |

#### 显示顺序规则

`order` 参数决定标签按钮的显示位置：

**Pin 视图当前顺序：**
- order: 1 → Focus
- order: 2 → 中间知识
- order: 3 → 待整理
- order: 4 → Class
- **order: 5 → 你的新分区（会显示在 Class 之后）**

**调整顺序技巧：**
- 若想插入到 Focus 和中间知识之间，设置 `order: 1.5`
- 若想放到最前面，设置 `order: 0.5`
- 若想放到最后面，使用较大的数字如 `order: 999`

### 删除视图

#### 方法 1：注释配置（推荐，可恢复）

在 `utils.js` 中注释掉对应的配置：

```javascript
class SectionRegistry {
  static sections = new Map([
    // ... 其他配置

    // 临时隐藏 toOrganize 分区
    // ["toOrganize", {
    //   key: "toOrganize",
    //   displayName: "待整理",
    //   viewMode: "pin",
    //   color: "#98c379",
    //   icon: "📥",
    //   order: 3
    // }],

    // ... 其他配置
  ])
}
```

**注意：** 注释后，该分区的数据仍保留在 `pinnerConfig.sections` 中，取消注释即可恢复。

#### 方法 2：使用 API 删除（运行时）

```javascript
// 临时删除分区（插件重启后恢复）
SectionRegistry.removeSection("toOrganize")

// 重新布局视图
if (pinnerUtils.pinnerController) {
  pinnerUtils.pinnerController.settingViewLayout()
}
```

**警告：** 使用 API 删除的分区在插件重启后会恢复（因为配置仍在代码中）。

#### 方法 3：完全删除

如果确定要永久删除某个分区：

1. 从 `SectionRegistry.sections` 中删除配置
2. 导出用户数据（避免数据丢失）
3. 通知用户该分区的数据将被迁移或清空

```javascript
// 1. 从配置中删除
// 直接从 Map 中移除对应的条目

// 2. 迁移数据到其他分区（可选）
let oldData = pinnerConfig.getPins("toOrganize")
oldData.forEach(pin => {
  pinnerConfig.addPin(pin, "midway", "bottom")
})

// 3. 清空旧分区数据
pinnerConfig.clearPins("toOrganize")
```

### 调整视图顺序

修改 `order` 参数即可调整显示顺序：

**示例：将 Class 移到第一位**

```javascript
["class", {
  key: "class",
  displayName: "Class",
  viewMode: "pin",
  color: "#e5c07b",
  icon: "🎓",
  order: 0.5,  // 原来是 4，改为 0.5 就会显示在最前面
  description: "课程相关内容"
}]
```

保存后重新加载插件，Class 标签会显示在最左边。

### 修改视图属性

可以修改任意配置属性：

```javascript
// 修改显示名称
["focus", {
  key: "focus",
  displayName: "⭐ 重点",  // 原来是 "Focus"，改为中文加图标
  // ... 其他属性保持不变
}]

// 修改颜色
["midway", {
  key: "midway",
  displayName: "中间知识",
  color: "#e5c07b",  // 原来是 "#61afef"，改为金色
  // ... 其他属性保持不变
}]

// 修改图标
["toOrganize", {
  key: "toOrganize",
  displayName: "待整理",
  icon: "🗂",  // 原来是 "📥"，改为文件夹图标
  // ... 其他属性保持不变
}]
```

### 在不同视图模式间移动分区

如果想将某个分区从 Pin 视图移动到 Task 视图（或反之）：

```javascript
// 将 Class 分区从 Pin 移到 Task
["class", {
  key: "class",
  displayName: "Class",
  viewMode: "task",  // 改为 "task"（原来是 "pin"）
  color: "#e5c07b",
  icon: "🎓",
  order: 6,  // 调整顺序，避免与 Task 视图现有分区冲突
  description: "课程相关内容"
}]
```

**注意：** 修改 `viewMode` 后，该分区的数据仍保留，但会出现在不同的视图模式中。

### 动态添加分区（高级用法）

在运行时动态添加分区：

```javascript
// 添加新分区
let newConfig = {
  key: "reading",
  displayName: "阅读",
  viewMode: "pin",
  color: "#56b6c2",
  icon: "📖",
  order: 6,
  description: "阅读材料"
}

// 调用 API 添加
let success = SectionRegistry.addSection(newConfig)

if (success) {
  // 初始化数据结构
  if (!pinnerConfig.sections.reading) {
    pinnerConfig.sections.reading = []
    pinnerConfig.save()
  }

  // 重新创建视图（需要重启插件或重新加载视图）
  MNUtil.showHUD("新分区已添加，请重启插件")
}
```

**限制：** 动态添加的分区在插件重启后会消失（除非写入配置文件）。

### 实际案例：添加 "学习" 分区

**需求：** 在 Pin 视图中添加一个 "学习" 分区，用于存放学习相关的卡片。

**步骤：**

1. **打开 `utils.js`**，找到 `SectionRegistry.sections`（第 236 行）

2. **在 Pin 视图分区的最后添加配置**：

```javascript
class SectionRegistry {
  static sections = new Map([
    // Pin 视图分区
    ["focus", { ... }],
    ["midway", { ... }],
    ["toOrganize", { ... }],
    ["class", { ... }],

    // 新增：学习分区
    ["study", {
      key: "study",
      displayName: "学习",
      viewMode: "pin",
      color: "#56b6c2",      // 青色
      icon: "📖",
      order: 5,              // 显示在 Class 之后
      description: "学习材料和笔记"
    }],

    // Task 视图分区
    ["taskToday", { ... }],
    // ...
  ])
}
```

3. **保存文件并重新加载插件**

4. **验证结果**：
   - 打开 MNPinner 插件
   - 切换到 Pin 视图
   - 应该能看到新的 "学习" 标签（青色，显示在 Class 之后）
   - 尝试 Pin 卡片到学习分区
   - 数据会自动保存到 `pinnerConfig.sections.study`

### 注意事项

1. **key 唯一性**：确保 `key` 在所有分区中唯一，避免冲突
2. **数据迁移**：删除分区前，考虑迁移或导出该分区的数据
3. **向后兼容**：修改现有分区的 `key` 会导致数据无法访问
4. **颜色选择**：建议使用区分度高的颜色，方便用户识别
5. **order 冲突**：多个分区使用相同 `order` 时，按配置顺序显示
6. **插件重启**：修改配置后需要重新加载插件才能生效

### 配置最佳实践

1. **命名规范**：
   - `key` 使用小写英文，如 `"study"`, `"project"`
   - `displayName` 使用中文或简短英文，如 `"学习"`, `"Project"`

2. **颜色搭配**：
   - 避免使用相似颜色
   - 建议使用 VSCode 主题色系（如 One Dark）
   - 常用色值：`#e06c75`(红) `#98c379`(绿) `#61afef`(蓝) `#c678dd`(紫) `#e5c07b`(黄)

3. **顺序规划**：
   - 常用分区放前面（order < 5）
   - 特殊分区放后面（order > 5）
   - 预留间隔（如 1, 2, 3, 5, 10）方便插入

4. **描述信息**：
   - 简洁明了，说明分区用途
   - 方便团队协作和代码维护

### 相关文档

- 配置驱动架构详解：`CONFIG_DRIVEN_ARCHITECTURE.md`
- API 参考：`SectionRegistry` 类文档（`utils.js:222-432`）

## 常见问题

### self 和 this 的使用

重要：在 JSB.defineClass 内部严禁使用 `let self = this;`

```javascript
// 错误
let self = this;

// 正确
self.someProperty = value;
```

### 按钮菜单的功能与生命周期里的功能（极其重要！）

需要写在生命周期中才能通过 selector 绑定，写在 prototype 里的方法无法绑定菜单。

相反的是生命周期里用 `self.xxx()` 只能调用 prototype 里的方法，不能调用生命周期里的方法。


## 调试技巧

### 日志记录

```javascript
// 普通日志（推荐使用 pinnerUtils.log）
pinnerUtils.log("消息", "来源")  // 而不是用 MNUtil.log!

// 错误日志（自动复制错误信息）
pinnerUtils.errorLog(error, "来源", {额外信息})

// 错误日志示例
try {
  // 可能出错的代码
} catch (error) {
  pinnerUtils.addErrorLog(error, "pinCard", {noteId, section})
  MNUtil.showHUD("Pin 失败")
}
```

### 数据检查

```javascript
// 复制对象到剪贴板（方便查看完整数据）
MNUtil.copyJSON(object)

// 查看当前配置
MNUtil.copyJSON(pinnerConfig.getAllConfig())

// 查看分区元数据
MNUtil.copyJSON(Array.from(SectionRegistry.sections.entries()))

// 查看某个分区的所有 Pin
MNUtil.copyJSON(pinnerConfig.getPins("focus"))

// 查看视图控制器状态
MNUtil.copyJSON({
  currentSection: pinnerController.currentSection,
  currentViewMode: pinnerController.currentViewMode,
  selectedCards: Array.from(pinnerController.selectedCards.entries())
})
```

### 用户提示

```javascript
// 显示 HUD 提示
MNUtil.showHUD("提示信息")

// 显示带持续时间的 HUD
MNUtil.showHUD("操作成功", 2.0)

// 显示错误提示
MNUtil.showHUD("❌ 操作失败")

// 显示成功提示
MNUtil.showHUD("✅ 操作完成")
```

### 状态检查

```javascript
// 检查视图控制器是否存在
if (pinnerUtils.pinnerController) {
  pinnerUtils.log("视图控制器已创建")
} else {
  pinnerUtils.log("视图控制器未创建")
}

// 检查当前聚焦卡片
let focusNote = MNNote.getFocusNote()
if (focusNote) {
  pinnerUtils.log(`当前聚焦: ${focusNote.noteTitle}`)
}

// 检查当前文档
let docController = MNUtil.currentDocController
if (docController) {
  pinnerUtils.log(`当前文档: ${docController.document.docMd5}`)
}

// 检查笔记本状态
let notebook = MNUtil.currentNotebook
if (notebook) {
  pinnerUtils.log(`当前笔记本: ${notebook.topic}`)
}
```

### 数据重置（仅开发调试使用）

```javascript
// ⚠️ 警告：以下操作会清空所有数据，仅用于开发调试

// 重置所有分区数据
Object.keys(pinnerConfig.sections).forEach(section => {
  pinnerConfig.sections[section] = []
})
pinnerConfig.save()

// 重置设置为默认值
pinnerConfig.settings = {
  alwaysAskCardTitle: false,
  alwaysAskPageTitle: false,
  defaultViewMode: "pin",
  defaultSection: "focus",
  rememberLastView: true,
  lastViewMode: "pin",
  lastSection: "focus"
}
pinnerConfig.save()

// 完全重置（删除所有存储的数据）
NSUserDefaults.standardUserDefaults().removeObjectForKey("MNPinner_sections")
NSUserDefaults.standardUserDefaults().removeObjectForKey("MNPinner_config")
NSUserDefaults.standardUserDefaults().removeObjectForKey("MNPinner_settings")
NSUserDefaults.standardUserDefaults().removeObjectForKey("MNPinner_sectionConfigs")
```

### 性能分析

```javascript
// 测量操作耗时
let startTime = Date.now()

// 执行操作
for (let i = 0; i < 1000; i++) {
  pinnerConfig.getPins("focus")
}

let elapsed = Date.now() - startTime
pinnerUtils.log(`操作耗时: ${elapsed}ms`)

// 测量内存占用（估算）
let configSize = JSON.stringify(pinnerConfig.getAllConfig()).length
pinnerUtils.log(`配置大小: ${(configSize / 1024).toFixed(2)} KB`)
```

## 相关文档

- MarginNote 插件开发指南：`../CLAUDE.md`
- MNUtils API 文档：`../mnutils/MNUtils_API_Guide.md`
- MNUtils 实现文档：`../mnutils/CLAUDE.md`
