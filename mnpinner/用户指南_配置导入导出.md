# MNPinner 配置导入导出指南

## 目录
- [概述](#概述)
- [导出配置](#导出配置)
- [理解配置文件结构](#理解配置文件结构)
- [修改配置](#修改配置)
- [导入配置](#导入配置)
- [常见场景示例](#常见场景示例)
- [故障排除](#故障排除)

---

## 概述

MNPinner 插件支持通过导入导出配置文件来自定义：
- **视图模式**（View Modes）：如 Pin、Task、Custom、Daily、Research 等
- **分区**（Sections）：每个视图模式下的子分区及其显示样式
- **卡片数据**：所有已固定的卡片和页面

这种方式允许你：
- 🎨 完全自定义工作流程
- 💾 备份和恢复配置
- 🔄 在不同设备间同步配置
- 🚀 快速切换不同的工作场景

---

## 导出配置

### 步骤

1. **打开 MNPinner 面板**
   - 点击工具栏的 MNPinner 图标

2. **访问设置菜单**
   - 点击面板上方的移动条，在弹出菜单中选择“导出配置”

3. **选择导出方式**
   - **导出到剪贴板**：配置会复制到剪贴板，可粘贴到文本编辑器
   - **导出到文件**：保存为 `.json` 文件
   - **导出到当前卡片**：将配置保存为当前卡片的评论（方便在 MarginNote 内管理）

### 推荐做法

- 定期导出配置作为备份
- 使用有意义的文件名，如 `mnpinner_config_2025-01-17.json`
- 在修改前先导出当前配置

---

## 理解配置文件结构

### 配置文件概览

```json
{
  "version": "1.3.0",
  "sections": {
    "focus": [...],
    "taskToday": [...],
    "daily/Courses": [...]
  },
  "config": {
    "version": "1.3.0",
    "source": "focus",
    "pageTitlePresets": []
  },
  "settings": {
    "defaultViewMode": "pin",
    "defaultSection": "focus",
    "cardWidth": 280,
    "cardHeight": 160
  },
  "sectionConfigs": [...],
  "viewModeConfigs": [...]
}
```

### 关键字段说明

#### 1. `sections`（卡片数据）
```json
{
  "focus": [
    {
      "type": "card",
      "noteId": "xxx-xxx-xxx",
      "title": "重要概念",
      "notebookId": "xxx"
    }
  ]
}
```

**说明**：存储每个分区中固定的卡片和页面数据。

#### 2. `sectionConfigs`（分区配置）
```json
[
  {
    "key": "focus",
    "displayName": "Focus",
    "viewMode": "pin",
    "color": "#457bd3",
    "icon": "📌",
    "order": 1,
    "description": "重点关注的卡片"
  }
]
```

**字段说明**：
- **key**（必需）：分区唯一标识符，对应 `sections` 中的键
- **displayName**（必需）：显示名称
- **viewMode**（必需）：所属视图模式（pin/task/custom/daily/research/submindmap）
- **color**：标签颜色（十六进制）
- **icon**：图标 emoji
- **order**：排序顺序（数字越小越靠前）
- **description**：描述文本

#### 3. `viewModeConfigs`（视图模式配置）
```json
[
  {
    "key": "pin",
    "displayName": "Pin",
    "icon": "📌",
    "color": "#457bd3",
    "order": 1,
    "defaultSection": "focus"
  }
]
```

**字段说明**：
- **key**（必需）：视图模式唯一标识符
- **displayName**（必需）：显示名称
- **icon**：图标 emoji
- **color**：主题颜色
- **order**：排序顺序
- **defaultSection**：该视图模式的默认分区

---

## 修改配置

### 场景 1：添加新分区

假设你想在 **Custom** 视图模式下添加一个 **"项目管理"** 分区。

#### 步骤：

1. **在 `sectionConfigs` 中添加配置**：

```json
{
  "key": "projectManagement",
  "displayName": "项目管理",
  "viewMode": "custom",
  "color": "#e5c07b",
  "icon": "📊",
  "order": 5,
  "description": "管理各种项目任务"
}
```

2. **在 `sections` 中初始化数据**（可选）：

```json
{
  "sections": {
    "projectManagement": []
  }
}
```

⚠️ **注意**：如果不在 `sections` 中添加键，导入时会自动创建空数组。

#### 完整示例：

修改前的 `sectionConfigs`：
```json
[
  {
    "key": "class",
    "displayName": "Class",
    "viewMode": "custom",
    "order": 1
  }
]
```

修改后的 `sectionConfigs`：
```json
[
  {
    "key": "class",
    "displayName": "Class",
    "viewMode": "custom",
    "order": 1
  },
  {
    "key": "projectManagement",
    "displayName": "项目管理",
    "viewMode": "custom",
    "color": "#e5c07b",
    "icon": "📊",
    "order": 2,
    "description": "管理各种项目任务"
  }
]
```

---

### 场景 2：修改分区显示样式

修改 **"Focus"** 分区的图标、颜色和显示名称：

```json
{
  "key": "focus",
  "displayName": "核心任务",    // ← 修改显示名称
  "viewMode": "pin",
  "color": "#ff6b6b",           // ← 修改颜色（红色）
  "icon": "🎯",                  // ← 修改图标
  "order": 1,
  "description": "最重要的核心任务"
}
```

---

### 场景 3：添加新视图模式

假设你想创建一个 **"学习"** 视图模式，包含多个学习阶段分区。

#### 步骤：

1. **在 `viewModeConfigs` 中添加视图模式**：

```json
{
  "key": "study",
  "displayName": "学习",
  "icon": "📚",
  "color": "#51cf66",
  "order": 7,
  "defaultSection": "study/todo"
}
```

2. **在 `sectionConfigs` 中添加该模式的分区**：

```json
[
  {
    "key": "study/todo",
    "displayName": "待学习",
    "viewMode": "study",
    "color": "#51cf66",
    "icon": "📝",
    "order": 1
  },
  {
    "key": "study/inProgress",
    "displayName": "学习中",
    "viewMode": "study",
    "color": "#4dabf7",
    "icon": "🔄",
    "order": 2
  },
  {
    "key": "study/completed",
    "displayName": "已完成",
    "viewMode": "study",
    "color": "#95c95c",
    "icon": "✅",
    "order": 3
  }
]
```

3. **在 `sections` 中初始化数据**：

```json
{
  "sections": {
    "study/todo": [],
    "study/inProgress": [],
    "study/completed": []
  }
}
```

---

### 场景 4：调整分区顺序

修改 `order` 字段即可改变分区的显示顺序（数字越小越靠前）：

```json
[
  {
    "key": "taskToday",
    "order": 1   // ← 将会显示在第一个
  },
  {
    "key": "focus",
    "order": 2   // ← 将会显示在第二个
  }
]
```

---

### 场景 5：删除分区

#### 方法 1：从配置中完全移除

从 `sectionConfigs` 中删除对应的配置对象，同时从 `sections` 中删除对应的键。

⚠️ **警告**：这会导致该分区的所有卡片数据丢失！

#### 方法 2：保留数据但隐藏（推荐）

暂时将分区的 `order` 设置为很大的数字（如 999），使其排在最后。

---

## 导入配置

### 步骤

1. **打开 MNPinner 面板**
   - 点击工具栏的 MNPinner 图标

2. **访问设置菜单**
   - 点击面板上方的移动条，在弹出菜单中选择“导入配置”

3. **选择导入方式**
   - **从剪贴板导入**：复制配置 JSON 到剪贴板后选择此项
   - **从文件导入**：选择 `.json` 文件
   - **从当前卡片导入**：从当前选中卡片的评论中读取配置

4. **确认导入**
   - 导入成功后，插件会自动刷新界面
   - 查看显示的摘要信息，确认导入的分区数量

### 导入后的效果

- ✅ 所有视图模式和分区按配置重建
- ✅ 卡片数据完全恢复
- ✅ 界面样式（颜色、图标）生效
- ✅ 默认视图和分区设置生效

---

## 常见场景示例

### 示例 1：工作/学习双模式配置

创建一个既适合工作又适合学习的配置：

**视图模式**：
- **Pin**：每日核心任务
- **Work**：工作项目分区
- **Study**：学习阶段分区

**`viewModeConfigs`**：
```json
[
  {
    "key": "pin",
    "displayName": "Pin",
    "icon": "📌",
    "order": 1,
    "defaultSection": "focus"
  },
  {
    "key": "work",
    "displayName": "工作",
    "icon": "💼",
    "color": "#4c6ef5",
    "order": 2,
    "defaultSection": "work/current"
  },
  {
    "key": "study",
    "displayName": "学习",
    "icon": "📚",
    "color": "#51cf66",
    "order": 3,
    "defaultSection": "study/todo"
  }
]
```

**`sectionConfigs`**：
```json
[
  {
    "key": "focus",
    "displayName": "Focus",
    "viewMode": "pin",
    "icon": "📌",
    "order": 1
  },
  {
    "key": "work/current",
    "displayName": "当前项目",
    "viewMode": "work",
    "icon": "🚀",
    "order": 1
  },
  {
    "key": "work/backlog",
    "displayName": "待办",
    "viewMode": "work",
    "icon": "📋",
    "order": 2
  },
  {
    "key": "study/todo",
    "displayName": "待学习",
    "viewMode": "study",
    "icon": "📝",
    "order": 1
  },
  {
    "key": "study/reviewing",
    "displayName": "复习中",
    "viewMode": "study",
    "icon": "🔄",
    "order": 2
  }
]
```

---

### 示例 2：番茄工作法配置

**分区设置**：
```json
[
  {
    "key": "pomodoro/current",
    "displayName": "当前番茄",
    "viewMode": "custom",
    "icon": "🍅",
    "color": "#ff6b6b",
    "order": 1
  },
  {
    "key": "pomodoro/next",
    "displayName": "下一个",
    "viewMode": "custom",
    "icon": "⏭",
    "order": 2
  },
  {
    "key": "pomodoro/completed",
    "displayName": "已完成",
    "viewMode": "custom",
    "icon": "✅",
    "color": "#95c95c",
    "order": 3
  }
]
```

---

## 故障排除

### 问题 1：导入后分区不显示

**可能原因**：
- 配置文件中缺少 `sectionConfigs` 字段
- `sectionConfigs` 为空数组

**解决方法**：
- ✅ **自动修复**（v1.3.0+）：插件会自动从 `sections` 的键推断分区配置
- 如果仍然不显示，检查 `sections` 中是否有对应的键

---

### 问题 2：标签页无法滚动

**可能原因**：
- 导入后界面未正确刷新

**解决方法**：
1. 关闭并重新打开 MNPinner 面板
2. 切换到其他视图模式再切换回来
3. 重启 MarginNote

---

### 问题 3：配置导入后卡片丢失

**可能原因**：
- 配置文件中的 `sections` 字段缺失或损坏

**解决方法**：
- 从备份文件恢复
- 检查配置文件的 JSON 格式是否正确

---

### 问题 4：导入提示 "Invalid config format"

**可能原因**：
- JSON 格式错误
- 缺少必需字段（`version`, `sections`, `config`）

**解决方法**：
1. 使用 JSON 验证工具检查格式（如 [jsonlint.com](https://jsonlint.com)）
2. 确保配置文件包含所有必需字段：
   ```json
   {
     "version": "1.3.0",
     "sections": {},
     "config": {},
     "settings": {}
   }
   ```

---

### 问题 5：自定义分区的 viewMode 不正确

**自动推断规则**（当 `sectionConfigs` 缺失时）：

| 分区 Key 模式 | 推断的 viewMode |
|--------------|----------------|
| `daily/xxx` 或 `dailyXxx` | `daily` |
| `research/xxx` | `research` |
| `submindmap/xxx` | `submindmap` |
| `task*`（除 `taskToday`, `taskTomorrow`） | `task` |
| `focus`, `taskToday`, `taskTomorrow` 等 | `pin` |
| 其他 | `custom` |

**解决方法**：
- 手动在 `sectionConfigs` 中指定正确的 `viewMode`

---

## 最佳实践

### 配置管理

1. **版本控制**
   - 每次修改前导出当前配置
   - 使用带日期的文件名（如 `config_2025-01-17.json`）

2. **模块化设计**
   - 按功能分组分区（如 `work/`, `study/`, `daily/`）
   - 使用统一的命名规范

3. **颜色和图标**
   - 使用一致的颜色主题
   - 选择有意义的 emoji 图标

4. **备份策略**
   - 定期导出到文件
   - 导出到卡片评论作为备份
   - 同步到云端（如 iCloud）

### 性能优化

- 避免创建过多分区（建议每个视图模式不超过 10 个）
- 定期清理不使用的分区
- 合理设置卡片宽度和高度

---

## 配置模板下载

### 基础模板
```json
{
  "version": "1.3.0",
  "sections": {
    "focus": [],
    "midway": [],
    "completed": []
  },
  "config": {
    "version": "1.3.0",
    "source": "focus",
    "pageTitlePresets": []
  },
  "settings": {
    "defaultViewMode": "pin",
    "defaultSection": "focus",
    "cardWidth": 280,
    "cardHeight": 160,
    "fontSize": 14,
    "lineSpacing": 1.2
  },
  "sectionConfigs": [
    {
      "key": "focus",
      "displayName": "Focus",
      "viewMode": "pin",
      "color": "#457bd3",
      "icon": "📌",
      "order": 1,
      "description": "重点关注的卡片"
    }
  ],
  "viewModeConfigs": [
    {
      "key": "pin",
      "displayName": "Pin",
      "icon": "📌",
      "color": "#457bd3",
      "order": 1,
      "defaultSection": "focus"
    }
  ]
}
```

---

## 技术支持

如果遇到问题：
1. 查看 MNPinner 日志（通过 MNUtils 日志查看器）
2. 导出当前配置并检查 JSON 格式
3. 参考本指南的故障排除部分
4. 向开发者反馈问题