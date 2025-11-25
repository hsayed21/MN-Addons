> 严禁自己创造 API，严禁使用任何在当前项目中未出现过的 API。
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

MNKnowledgeBase 是一个 MarginNote 4 插件，用于构建和搜索个人知识库。它提供了高性能的卡片索引、智能搜索、同义词扩展、OCR 处理、自动归类等核心功能。

### 核心功能模块
- **知识库索引系统**：支持分片索引和增量索引，处理大规模卡片数据
- **智能搜索引擎**：支持同义词扩展、模式匹配、排除词、类型筛选
- **WebView 搜索界面**：提供可视化的搜索和结果管理界面
- **自动化处理**：OCR识别、自动归类、模板制卡
- **卡片预摘录系统**：支持课堂笔记自动整理

## 技术架构

### 文件结构
```
mnknowledgebase/
├── main.js                          # 插件主入口（2,000+ 行）
│   └── MNKnowledgeBase 类            # 生命周期钩子、事件处理、菜单命令
├── utils.js                         # 核心工具库（22,000+ 行）
│   ├── kbSearchConfig               # 搜索配置（同义词、类型预设）
│   ├── kbTemplateConfig             # 模板配置
│   ├── kbOCRConfig                  # OCR 配置
│   ├── KnowledgeBaseTemplate        # 模板制卡系统
│   ├── KnowledgeBaseIndexer         # 索引构建器
│   ├── KnowledgeBaseSearcher        # 搜索引擎
│   ├── KnowledgeBaseConfig          # 配置管理
│   ├── KnowledgeBaseClassUtils      # 归类工具
│   └── 其他辅助类...
├── knowledgebaseWebController.js    # WebView 控制器（1,600+ 行）
│   └── 搜索界面的窗口管理、通信协议
├── search.html                      # 搜索界面（5,800+ 行）
│   └── 完整的搜索 UI 和交互逻辑
├── mnaddon.json                     # 插件清单
└── logo.png                         # 插件图标
```

### 核心类和职责

#### KnowledgeBaseIndexer（索引构建）
- 扫描笔记本，构建卡片索引（标题、ID、类型、父卡片等）
- 支持分片存储（大索引拆分为多个文件）
- 增量索引（仅索引新增/修改的卡片）

#### KnowledgeBaseSearcher（搜索引擎）
- 支持多种搜索模式：基础搜索、同义词扩展、排除词
- 类型筛选（定义、命题、证明等）
- 搜索历史管理
- 兼容旧版单文件索引和新版分片索引

#### KnowledgeBaseTemplate（模板制卡）
- 根据标题关键词自动识别卡片类型
- 应用颜色标签、合并策略
- 处理字段链接（如目标-关键结果-动作）
- 支持 OKR 和笔记场景

#### KnowledgeBaseConfig（配置管理）
- 统一管理所有配置项（OCR模型、模式开关等）
- 配置持久化到 MarginNote 的 userDefaults
- 支持 50+ 个 OCR 模型

#### knowledgebaseWebController（WebView 界面）
- 管理浮动搜索窗口（拖动、缩放、最小化）
- WebView 与插件之间的双向通信
- URL 协议处理（mnkb:// 开头的命令）

### 数据流

```
用户输入搜索词
    ↓
search.html (UI 交互)
    ↓
window.webkit.messageHandlers.MNKnowledgeBase.postMessage()
    ↓
knowledgebaseWebController.userContentController_didReceiveScriptMessage()
    ↓
MNKnowledgeBaseInstance.handleSearchRequest()
    ↓
KnowledgeBaseSearcher.search()
    ↓
返回结果 JSON
    ↓
webView.evaluateJavaScript("renderSearchResults(...)")
    ↓
search.html (渲染结果)
```

## 常用开发任务

### 打包插件
```bash
# 使用 mnaddon4 命令行工具
mnaddon4 build

# 手动打包（不推荐）
zip -r mnknowledgebase_v0_X.mnaddon main.js utils.js knowledgebaseWebController.js mnaddon.json logo.png search.html comment-manager.html close.png resize.png
```

### 解包插件
```bash
mnaddon4 unpack mnknowledgebase_v0_X.mnaddon
```

### 调试
- 使用 KnowledgeBaseUtils.log(message, method, data) 记录日志
- 使用 MNUtil.showHUD(message) 显示用户提示
- 使用 MNUtil.copyJSON(object) 复制对象到剪贴板进行检查
- 错误会自动通过 KnowledgeBaseUtils.addErrorLog() 记录并复制

### 测试
- 无自动化测试，需手动在 MarginNote 4 中测试
- 主要测试流程：
  1. 构建索引（选择笔记本 → "重建知识库索引"）
  2. 打开搜索界面（菜单 → "打开知识库搜索"）
  3. 测试各种搜索功能（类型筛选、同义词、排除词）
  4. 测试卡片操作（定位、复制链接、定制命令）

## 重要开发约定

### JSBridge 与 self/this
- **严禁**在 JSB.defineClass 内部使用 let self = this;
- 直接使用 self 引用当前插件实例（MarginNote 的 JSBridge 约定）
- self 在不同方法中始终指向同一个插件实例

### 配置数据管理
- **集中管理**：所有可配置数据放在文件顶部的配置对象中
  - kbSearchConfig：同义词、排除词、类型预设
  - kbTemplateConfig：模板关键词、字段映射
  - kbOCRConfig：OCR 提示词
- **不要硬编码**：避免在代码逻辑中直接写入数据

### 同义词系统
同义词配置支持多种高级特性：
```javascript
{
  words: ["词1", "词2"],           // 必需：同义词列表
  partialReplacement: true,       // 可选：字符级替换（如 || ↔ ‖）
  patternMode: true,              // 可选：模式匹配（如 稠{{}}集 ↔ 稠密{{}}集）
  caseSensitive: false,           // 可选：大小写敏感
  contextTriggers: ["触发词"],    // 可选：上下文触发
  contextMode: "any",             // 可选：上下文模式（any/all）
  enabled: true                   // 可选：是否启用
}
```

### 性能优化
- 大批量操作使用 MNUtil.undoGrouping() 包装
- 长时间操作使用 MNUtil.delay() 避免界面卡顿
- 索引构建时显示进度 HUD

### WebView 通信协议
#### JS → ObjC（发送命令）
```javascript
window.webkit.messageHandlers.MNKnowledgeBase.postMessage({
  action: "commandName",
  data: { ... }
})
```

#### ObjC → JS（执行代码）
```javascript
self.webView.evaluateJavaScript("functionName(args)")
```

### 索引文件路径
- 主索引清单：~/Library/Mobile Documents/iCloud~QReader~MarginNote3/Documents/marginnote4/knowledge_base_manifest.json
- 分片索引：~/Library/Mobile Documents/iCloud~QReader~MarginNote3/Documents/marginnote4/knowledge_base_part_*.json
- 增量索引：保存在插件实例的 self.incrementalIndex

## 代码风格

### 缩进与格式
- 使用 2 空格缩进
- 多行对象末尾保留逗号
- 字符串优先使用双引号（与现有代码保持一致）

### 命名约定
- 类名：大驼峰 KnowledgeBaseSearcher
- 方法名：小驼峰 buildIndex
- 常量：全大写 DEFAULT_EXCERPT_OCR_MODEL
- 静态属性：小驼峰 static searchHistory

### 注释规范
- 类和复杂方法使用 JSDoc 风格注释
- 关键算法和业务逻辑添加行内注释
- 配置对象提供详细的字段说明

## 常见陷阱

### 1. note.comments vs note.MNComments
- note.comments：原始评论数组，comment.type 只有 5 种基础类型
  - "TextNote", "HtmlNote", "LinkNote", "PaintNote", "AudioNote"
- note.MNComments：处理后的 MNComment 实例数组，type 已细分为 15+ 种
  - "drawingComment", "imageCommentWithDrawing", "markdownComment" 等
- **错误**：对 MNComments 元素再次调用 MNComment.getCommentType()
- **正确**：直接使用 note.MNComments[i].type

### 2. 异步操作与生命周期
- OCR 处理是异步的（async/await）
- 在 onProcessNewExcerpt 中正确处理异步流程
- 避免在窗口关闭后继续操作（检查 self.window !== MNUtil.currentWindow）

### 3. 多窗口隔离
- MarginNote 支持多窗口，每个窗口有独立的插件实例
- 数据必须挂载到 self 上以区分窗口
- 事件处理时先检查窗口是否匹配

### 4. 索引兼容性
- 代码需同时支持旧版单文件索引和新版分片索引
- KnowledgeBaseSearcher 构造函数会自动判断索引类型
- 增量索引可能为空，搜索时需合并两种索引的结果

## 模块间依赖

```
main.js
  ├── requires: utils.js
  ├── requires: knowledgebaseWebController.js
  └── uses: MNUtil (from MNUtils)

utils.js
  ├── uses: MNUtil (from MNUtils)
  ├── uses: MNNote (from MNUtils)
  └── standalone classes (can be used independently)

knowledgebaseWebController.js
  ├── requires: utils.js (for KnowledgeBaseConfig)
  ├── uses: MNUtil (from MNUtils)
  └── communicates with: search.html

search.html
  ├── standalone HTML/CSS/JS
  └── communicates via: webkit.messageHandlers
```

## 配置更新

### 修改版本号
编辑 mnaddon.json：
```json
{
  "version": "0.33"
}
```

### 添加新的同义词
编辑 utils.js 中的 kbSearchConfig.synonymGroups：
```javascript
synonymGroups: [
  // 在数组末尾添加新组
  {
    "words": ["新词1", "新词2"],
    "partialReplacement": false
  }
]
```

### 添加新的 OCR 模型

**重要**：添加新 OCR 模型需要修改 `utils.js` 中的**两个位置**，缺一不可！

#### 1. 添加到模型选择列表（用户界面）
编辑 `KnowledgeBaseConfig.excerptOCRSources` 数组（约第 20869 行）：
```javascript
static excerptOCRSources = [
  // 在对应系列的位置添加
  "新模型名称",
]
```

#### 2. 添加到 OCR 方法的 switch-case（调用路由）
编辑 `KnowledgeBaseNetwork.OCR` 方法中的 switch-case 结构（约第 20615 行）：
```javascript
switch (ocrSource) {
  case "Doc2X":
  case "doc2x":
    // Doc2X 专用处理
    break;
  case "SimpleTex":
  case "simpleTex":
    // SimpleTex 专用处理
    break;
  // ... 其他模型 ...
  case "doubao-seed-1-6":
  case "doubao-seed-1-6-nothinking":
  case "新模型名称":           // ← 在这里添加新 case
  case "MiniMax-Text-01":
    // 走 ChatGPTVision 调用路径
    let beginTime = Date.now()
    res = await this.ChatGPTVision(imageBase64, ocrSource, prompt)
    // ...
    break;
  default:
    MNUtil.showHUD("Unsupported source: "+ocrSource)  // ← 否则报这个错
    return undefined
}
```

#### 常见错误
如果只添加到 `excerptOCRSources` 而不添加到 switch-case，用户选择该模型后会报错：
```
Unsupported source: 模型名称
```

#### 模型命名注意事项
- case 的模型名称必须与 `excerptOCRSources` 中的字符串**完全匹配**
- 大多数模型通过 `ChatGPTVision` 方法调用，直接添加 case 即可（利用 case 穿透）
- `ChatGPTVision` 内部通过 `ocrConfig.modelSource(source)` 获取模型配置，该配置来自 MNOCR 插件

## 相关文档

- README.md：搜索界面原型说明
- AGENTS.md：项目结构和提交规范（英文）
- exclusion-cleanup-summary.md：排除词清理记录
- MarginNote 插件系统文档：参考项目根目录
- MNUtils API 文档：参考 ../mnutils/ 目录

## 故障排查

### 索引构建失败
- 检查笔记本是否已打开
- 查看控制台日志（KnowledgeBaseUtils.log 输出）
- 确认索引文件路径可写

### 搜索无结果
- 确认索引已构建（检查索引文件是否存在）
- 检查类型筛选是否过于严格
- 查看增量索引是否包含新卡片

### WebView 通信失败
- 确认 search.html 已正确加载
- 检查 window.webkit.messageHandlers.MNKnowledgeBase 是否存在
- 查看 webViewShouldStartLoadWithRequestNavigationType 是否正确拦截

### OCR 不工作
- 检查配置中的 excerptOCRMode 是否已启用（1/2/3）
- 确认选择的模型在 excerptOCRSources 列表中
- 查看网络连接和 API 配置
