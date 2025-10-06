# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# MNKnowledgeBase 插件开发指南

- 严禁自己不确定的情况下乱用 API！一但是以前没出现过的用法，要到 `../` 中自行查找是否合理！
- 使用 API 前严格确定 API 所处的类！不要乱写
 
## 项目概述

MNKnowledgeBase 是一个 MarginNote 4 知识库管理插件，专注于学术知识的结构化管理。

### 核心功能
- **知识卡片分类管理**：支持定义、命题、例子、反例、问题等多种卡片类型
- **模板化制卡**：基于预定义模板快速创建知识卡片
- **智能链接处理**：自动识别和处理 MarginNote 内部链接
- **JSON 数据持久化**：支持知识库数据的导入导出

## 项目结构

```
mnknowledgebase/
├── mnaddon.json       # 插件配置清单
├── main.js           # 插件主入口（280行）
├── utils.js          # 工具类库（15,864行）
└── logo.png          # 插件图标
```

## 开发与构建

### 打包插件
```bash
# 在父目录下执行
mnaddon4 build

# 或使用 mnaddon-package agent（推荐）
```

### 解包插件
```bash
mnaddon4 unpack mnknowledgebase_v0_1_实现JSON的读取.mnaddon
```

### 插件安装路径
`/Users/xiakangwei/Library/Containers/QReader.MarginNoteApp/Data/Library/MarginNote Extensions/`

## 核心代码架构

### 1. 插件入口（main.js）

#### 生命周期方法
- `sceneWillConnect`：窗口初始化，注册弹出菜单观察者
- `sceneDidDisconnect`：窗口关闭时清理
- `notebookWillOpen/Close`：笔记本打开/关闭事件
- `documentDidOpen/Close`：文档打开/关闭事件

#### 主要功能入口
- `toggleAddon`：插件图标点击响应，显示功能菜单
- `openKnowledgeBaseLibrary`：打开文献数据库
- `updateSearchIndex`：更新搜索索引
- `searchInKB`：显示快速搜索对话框
- `shareIndexFile`：分享索引文件（新增）
- `shareSearchResults`：分享搜索结果（新增）
- `onPopupMenuOnNote`：笔记弹出菜单处理

### 2. 知识库模板系统（utils.js - KnowledgeBaseTemplate）

#### 卡片类型定义
```javascript
static types = {
  定义: { refName, prefixName, englishName, templateNoteId, colorIndex, fields },
  命题: { ... },
  例子: { ... },
  反例: { ... },
  问题: { ... },
  思想方法: { ... },
  // 等等 20+ 种类型
}
```

#### 核心功能方法

##### 制卡相关
- `makeCard(note, addToReview, reviewEverytime, focusInMindMap)`：标准制卡流程
- `makeNote(note, ...)`：创建知识笔记
- `templateMergedCardMake(note)`：模板化合并卡片制作

##### 链接管理
- `handleDefinitionPropositionLinks(note)`：处理定义-命题链接
- `extractMarginNoteLinksFromComments(note, indexArr)`：提取评论中的链接
- `processExtractedMarginNoteLinks(note, marginNoteLinks)`：处理提取的链接
- `linkParentNote(note)`：链接父节点

##### 内容处理
- `keepOnlyExcerpt(note)`：仅保留摘录
- `removeTitlePrefix(note)`：移除标题前缀
- `autoMoveNewContent(note)`：自动移动新内容
- `renewExcerptInParentNoteByFocusNote(focusNote)`：更新父节点摘录

##### 辅助功能
- `addToReview(note, reviewEverytime)`：添加到复习
- `getTypeFromInputText(userInputText)`：从用户输入识别类型
- `getNoteTypeByColor(colorIndex)`：通过颜色获取类型

#### 模板卡片 ID 映射
```javascript
// 粗读根目录 ID
static roughReadingRootNoteIds = {
  "定义": "38ACB470-803E-4EE8-B7DD-1BF4722AB0FE",
  "命题": "D6F7EA72-DDD1-495B-8DF5-5E2559C5A982",
  // ...
}

// HTML 评论模板 ID
static singleHtmlCommentTemplateNoteIds = {
  "证明": "749B2770-77A9-4D3D-9F6F-8B2EE21615AB",
  // ...
}
```

## 关键技术要点

### MNUtil 框架使用
- 已集成完整的 MNUtils 框架（utils.js）
- 无需单独初始化，直接使用 MNUtil API
- 使用 `MNUtil.undoGrouping` 包装批量操作
- 使用 `MNUtil.showHUD` 显示提示信息

### 数据持久化
- 使用 `MNUtil.dbFolder` 作为数据存储目录
- 通过 `MNUtil.writeJSON/readJSON` 处理 JSON 数据
- 文件路径：`MNUtil.dbFolder + "/data/kb-test.json"`

### 错误处理
- 所有主要功能都包装在 try-catch 中
- 错误通过 `MNUtil.showHUD` 显示
- 使用 `MNLog.error` 记录错误日志

## 开发注意事项

### 重要原则
1. **不要随意修改模板卡片 ID**：这些 ID 对应实际的 MarginNote 卡片
2. **保持向后兼容**：修改 `types` 结构时考虑已有数据
3. **谨慎处理链接**：MarginNote 链接格式特殊，需要正确解析
4. **批量操作优化**：使用 `MNUtil.undoGrouping` 提升性能

### 调试技巧
```javascript
// 查看当前焦点卡片
let note = MNNote.getFocusNote()
MNUtil.copy(note)  // 复制到剪贴板查看

// JSON 测试
MNUtil.writeJSON(MNUtil.dbFolder + "/debug.json", data)
let data = MNUtil.readJSON(MNUtil.dbFolder + "/debug.json")
```

### 常见问题

1. **插件不生效**：检查 mnaddon.json 中的版本要求
2. **功能菜单不显示**：确认 `MNUtil.studyMode !== 3`（非复习模式）
3. **链接处理失败**：验证链接格式是否为 `marginnote4app://...`

## 文件分享功能（v0.3 新增）

### 功能说明
插件现在支持将索引文件和搜索结果通过系统分享功能导出，特别适合 iPad 用户。

### 使用方法

#### 1. 分享索引文件
- 点击插件图标
- 选择 "📤 分享索引文件"
- 系统弹出分享菜单
- 选择分享方式：
  - **隔空投送**：直接发送到 Mac
  - **存储到文件**：保存到文件 App
  - **邮件**：作为附件发送
  - **其他应用**：分享到支持的应用

#### 2. 分享搜索结果
- 进行快速搜索
- 在搜索结果列表底部选择 "📤 分享搜索结果"
- 选择分享方式（同上）

### 文件格式
- 索引文件：`kb-search-index-[时间戳].json`
- 搜索结果：`search-results-[关键词]-[时间戳].json`

### 技术实现
- 使用 iOS 原生 `UIActivityViewController`
- 临时文件存储在 `MNUtil.tempFolder`
- 支持 iPad 和 iPhone 的不同界面适配

## 扩展开发

### 添加新的卡片类型
1. 在 `KnowledgeBaseTemplate.types` 中添加类型定义
2. 设置对应的 `templateNoteId`（需要在 MarginNote 中创建）
3. 定义 `fields` 数组（字段列表）
4. 在 `keywordTypeMapping` 中添加关键词映射

### 集成外部数据源
- 利用 JSON 读写功能
- 可扩展支持 CSV、XML 等格式
- 考虑使用 `MNUtil.request` 进行网络请求

### 与其他插件协作
- 通过 MarginNote 链接传递数据
- 使用共享的笔记本或文档
- 利用 `MNUtil.db` 存储共享配置