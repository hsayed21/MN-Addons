# MNKnowledgeBase 快速搜索功能 PRD 和设计文档

## 一、产品需求文档（PRD）

### 1.1 项目背景

当前 MarginNote 知识库中的卡片搜索速度缓慢，在 10,000+ 张卡片的场景下，每次搜索需要 5-10 秒。这严重影响了用户的使用体验和知识管理效率。

### 1.2 核心问题

- **性能问题**：现有的 `searchNotesInDescendants` 方法需要遍历所有卡片，时间复杂度 O(n)
- **用户体验差**：搜索等待时间过长，影响思维连贯性
- **扩展性差**：随着卡片数量增长，搜索时间线性增长

### 1.3 解决方案

实现基于 JSON 索引的快速搜索系统：
1. 预构建搜索索引，将卡片关键信息提取到 JSON 文件
2. 搜索时直接在内存中的索引数据进行匹配，避免遍历卡片对象
3. 支持手动或定时更新索引

### 1.4 功能需求

#### 1.4.1 索引构建功能
- **手动更新**：用户可通过菜单手动触发索引更新
- **增量更新**：（未来版本）支持只更新变化的卡片
- **进度显示**：构建索引时显示进度信息
- **错误处理**：构建失败时提供明确的错误信息

#### 1.4.2 快速搜索功能
- **精确匹配**：支持精确的文本包含匹配（不是模糊搜索）
- **类型过滤**：可限定搜索特定类型的卡片（定义、命题、归类等）
- **归类细分**：支持搜索特定细分类别的归类卡片
- **结果排序**：按相关性分数排序

#### 1.4.3 搜索范围
搜索以下内容：
- 定义卡片：前缀内容 + 标题链接词
- 命题卡片：前缀内容 + 标题链接词 + 关键词字段
- 归类卡片：引号内内容 + 细分类别

### 1.5 性能目标

- 索引构建：10,000 张卡片在 30 秒内完成
- 搜索响应：< 100ms（索引已加载情况下）
- 内存占用：索引文件 < 10MB（10,000 张卡片）

### 1.6 用户界面

- 复用现有的弹窗交互模式
- 在主菜单添加"更新搜索索引"选项
- 搜索结果使用现有的多选弹窗展示

## 二、技术设计文档

### 2.1 系统架构

```
┌─────────────────────────────────────────┐
│           用户界面层（UI）                │
│  - 弹窗菜单                              │
│  - 搜索输入                              │
│  - 结果展示                              │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│           业务逻辑层                      │
│  - FastSearcher（搜索器）                 │
│  - KnowledgeBaseIndexer（索引器）         │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│           数据层                         │
│  - JSON 索引文件                         │
│  - MarginNote 卡片数据                   │
└─────────────────────────────────────────┘
```

### 2.2 数据结构设计

#### 2.2.1 JSON 索引结构

```javascript
{
  "metadata": {
    "version": "1.0",                    // 索引版本
    "lastUpdated": "2025-01-27T22:00:00", // 最后更新时间
    "totalCards": 1234,                  // 总卡片数
    "targetTypes": ["定义", "命题", "归类"] // 索引的卡片类型
  },
  "searchData": [
    {
      "id": "UUID",                       // 卡片 ID
      "type": "定义",                     // 卡片类型（getNoteType 返回值）
      "title": "原始标题",                 // 完整标题
      "prefix": "前缀内容",               // parseNoteTitle().prefixContent
      "titleLinkWords": "链接词1; 链接词2", // 标题链接词
      "keywords": "关键词内容",            // 关键词字段
      "searchText": "可搜索文本"          // 连接的搜索文本
    },
    {
      "id": "UUID",
      "type": "归类",                     // 归类卡片
      "classificationSubtype": "定义",    // 归类的细分类别
      "content": "内容",                  // 标题`“内容”相关定义`引号内的内容
      "searchText": "内容"
    }
  ]
}
```

### 2.3 核心类设计

#### 2.3.1 KnowledgeBaseIndexer 类

```javascript
class KnowledgeBaseIndexer {
  // 构建搜索索引
  static buildSearchIndex(rootNoteIds, targetTypes = ["定义", "命题", "归类"])
  
  // 构建单个卡片的索引条目
  static buildIndexEntry(note)
  
  // 构建搜索文本
  static buildSearchText(note, parsedTitle, noteType, keywordsContent)
  
  // 保存索引到文件
  static saveIndex(index, filename = "kb-search-index.json")
  
  // 加载索引
  static loadIndex(filename = "kb-search-index.json")
}
```

#### 2.3.2 FastSearcher 类

```javascript
class FastSearcher {
  constructor(index)
  
  // 从文件加载索引并创建搜索器
  static loadFromFile(filename = "kb-search-index.json")
  
  // 在索引中搜索
  search(keyword, options = {
    types: [],                    // 限定卡片类型
    classificationSubtypes: [],   // 限定归类细分类型
    limit: 100                    // 结果数量限制
  })
  
  // 计算匹配分数
  calculateScore(keyword, entry)
  
  // 获取搜索结果的详细信息
  getDetailedResults(searchResults)
}
```

### 2.4 关键算法

#### 2.4.1 卡片类型判断逻辑

```javascript
// getNoteType 方法判断主类型
if (标题匹配 /".*"相关.*/) {
  return "归类"
} else if (标题匹配 /【(.*?)[:>>]/) {
  根据括号内容查找对应类型
}

// parseNoteTitle 解析标题结构
if (type === "归类") {
  提取 content（引号内容）和 type（相关后内容）
} else {
  提取 prefixContent、content 和 titleLinkWordsArr
}
```

#### 2.4.2 搜索文本构建算法

```javascript
if (卡片类型 === "归类") {
  searchText = content + " " + 细分类别
} else {
  searchText = prefixContent + " " + titleLinkWords + " " + keywords
}
```

#### 2.4.3 相关性评分算法

```javascript
score = 0
if (完全匹配) score += 100
if (标题链接词匹配) score += 50
if (关键词字段匹配) score += 30
if (前缀内容匹配) score += 20
基础匹配分 += 10
```

### 2.5 UI 集成方案

#### 2.5.1 主菜单集成

在 `main.js` 的 `toggleAddon` 方法中添加：

```javascript
menuItems.push({
  title: "更新搜索索引",
  action: () => this.updateSearchIndex()
})

menuItems.push({
  title: "快速搜索",
  action: () => this.searchInKBDialog()
})
```

#### 2.5.2 搜索对话框

```javascript
searchInKBDialog() {
  // 1. 输入搜索关键词
  UIAlertView.show("输入搜索关键词", ..., (text) => {
    // 2. 执行搜索
    const searcher = FastSearcher.loadFromFile()
    const results = searcher.search(text)
    
    // 3. 显示结果（复用现有的弹窗模式）
    this.showSearchResults(results)
  })
}
```

### 2.6 实现步骤

1. **第一阶段**：实现核心索引器和搜索器
   - 实现 KnowledgeBaseIndexer 类
   - 实现 FastSearcher 类
   - 添加到 utils.js 文件末尾

2. **第二阶段**：UI 集成
   - 在主菜单添加更新索引选项
   - 实现快速搜索入口
   - 集成搜索结果展示

3. **第三阶段**：优化和测试
   - 性能测试和优化
   - 错误处理完善
   - 用户体验优化

### 2.7 关键代码位置

- **卡片类型判断**：`utils.js:3274` - `getNoteType` 方法
- **标题解析**：`utils.js:3388` - `parseNoteTitle` 方法
- **关键词提取**：`utils.js:10162` - `getKeywordsFromNote` 方法
- **现有搜索实现**：`utils.js:8904` - `searchNotesInDescendants` 方法
- **粗读根目录 ID**：`utils.js:241` - `roughReadingRootNoteIds` 对象

### 2.8 注意事项

1. **归类卡片的双重属性**
   - 卡片类型是"归类"（getNoteType 返回值）
   - 有细分类别（parseNoteTitle().type）表示归类的内容类型

2. **标题解析的准确性**
   - 定义卡片：前缀在【】内，链接词在】后
   - 归类卡片：内容在引号内，类型在"相关"后

3. **性能优化要点**
   - 使用 `MNUtil.undoGrouping` 包装批量操作
   - 适当使用 `MNUtil.delay` 避免阻塞
   - 索引只包含必要字段

4. **向后兼容性**
   - 保持现有搜索功能不变
   - 索引更新失败时能回退到原搜索

## 三、测试计划

### 3.1 功能测试

1. **索引构建测试**
   - 测试不同数量级的卡片（100、1000、10000）
   - 测试各种卡片类型的正确解析
   - 测试异常数据的处理

2. **搜索功能测试**
   - 测试中文、英文关键词
   - 测试类型过滤功能
   - 测试结果排序正确性

3. **性能测试**
   - 索引构建时间
   - 搜索响应时间
   - 内存占用情况

### 3.2 边界条件测试

- 空索引搜索
- 特殊字符搜索
- 超长关键词
- 并发搜索

## 四、未来优化方向

1. **增量更新**：只更新变化的卡片，减少索引构建时间
2. **模糊搜索**：支持拼音、简写等模糊匹配
3. **搜索历史**：记录搜索历史，支持快速重搜
4. **高级过滤**：支持更复杂的过滤条件组合
5. **HTML 界面**：开发独立的 HTML 搜索界面

## 五、风险评估

1. **数据一致性**：索引与实际卡片数据不同步
   - 缓解：提供手动更新选项，显示最后更新时间

2. **性能瓶颈**：大量卡片时索引文件过大
   - 缓解：分片存储，按需加载

3. **兼容性问题**：不同版本的数据结构变化
   - 缓解：版本号管理，向后兼容处理