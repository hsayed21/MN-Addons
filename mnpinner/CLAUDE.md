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

## 视图管理（配置驱动架构）⭐

MNPinner v2.0 采用配置驱动架构，通过 `SectionRegistry` 配置中心统一管理所有视图分区。

### 架构概述

**核心类：SectionRegistry** (`utils.js:222-432`)

所有视图分区的元数据都集中在 `SectionRegistry.sections` 中，包括：
- **key**: 分区唯一标识（用于数据存储和代码引用）
- **displayName**: 显示名称（界面显示）
- **viewMode**: 视图模式（"pin" 或 "task"）
- **color**: 主题颜色（十六进制色值）
- **icon**: 图标（Emoji）
- **order**: 显示顺序（数字越小越靠前）
- **description**: 分区描述

### 当前分区列表

**Pin 视图（4个）：**
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

```javascript
// 日志记录
pinnerUtils.log("消息", "来源")  // 而不是用  MNUtil.log!

// 复制对象
MNUtil.copyJSON(object)

// HUD 提示
MNUtil.showHUD("提示信息")

// 错误日志
pinnerUtils.errorLog()
```

## 相关文档

- MarginNote 插件开发指南：`../CLAUDE.md`
- MNUtils API 文档：`../mnutils/MNUtils_API_Guide.md`
- MNUtils 实现文档：`../mnutils/CLAUDE.md`
