# MNLiterature 插件开发指南

> 本文档记录 MNLiterature 插件的核心技术实现，包括 HTML 加载机制和文献索引系统。
> 基于 mnknowledgebase 的技术分析，为 mnliterature 提供开发参考。

---

## 技术架构概览

### 核心组件

1. **literatureWebController.js** - WebView 控制器
   - 管理 HTML 界面的生命周期
   - 实现 Native 和 JavaScript 的双向通信
   - 处理窗口拖动、缩放等交互

2. **literatureIndexer.js** - 文献索引系统
   - 分片索引构建（支持大规模数据）
   - 增量更新机制
   - 文献数据的检索和过滤

3. **literatureManager.html** - 管理界面
   - 响应式布局
   - 搜索和过滤功能
   - 文献卡片展示

---

## 第一部分：WebView 控制器实现

### 1.1 基础架构

WebView 控制器使用 JSB.defineClass 定义，继承自 UIViewController 并实现 UIWebViewDelegate 协议。

```javascript
var literatureWebController = JSB.defineClass(
  'literatureWebController : UIViewController <UIWebViewDelegate>',
  {
    // 生命周期方法
    viewDidLoad: function() {
      // 初始化 WebView
      // 创建控制按钮
      // 添加手势处理
    },
    
    // WebView 代理方法
    webViewShouldStartLoadWithRequestNavigationType: function(webView, request, type) {
      // 拦截 URL Scheme，实现 JS → Native 通信
    },
    
    webViewDidFinishLoad: function(webView) {
      // HTML 加载完成后的处理
    }
  }
)
```

### 1.2 窗口管理

**窗口状态持久化**

```javascript
// 保存窗口位置和大小到 NSUserDefaults
let frameData = {x: frame.x, y: frame.y, width: frame.width, height: frame.height}
NSUserDefaults.standardUserDefaults().setObjectForKey(
  JSON.stringify(frameData),
  "Literature_WindowFrame"
)

// 恢复窗口位置
let savedFrameStr = NSUserDefaults.standardUserDefaults().objectForKey("Literature_WindowFrame")
let initialFrame = savedFrameStr ? JSON.parse(savedFrameStr) : defaultFrame
```

**Mini 模式支持**

```javascript
// 缩小为 mini 模式（拖动到边缘时触发）
toMinimode: function(targetFrame, previousFrame) {
  this.miniMode = true
  this.lastFrame = previousFrame
  
  // 隐藏 WebView 和大部分按钮
  this.webView.hidden = true
  this.closeButton.hidden = true
  this.resizeButton.hidden = true
  
  // 显示小图标按钮
  this.moveButton.frame = targetFrame
  this.moveButton.setTitle("📚", 0)
}

// 从 mini 模式恢复
fromMinimode: function() {
  // 恢复窗口大小
  // 显示所有控件
  // 刷新数据
}
```

### 1.3 JSBridge 通信机制

#### JS → Native（URL Scheme）

**HTML 端发送消息**

```javascript
// 在 HTML 中定义 Bridge 对象
window.LiteratureBridge = {
  // 刷新数据
  refreshData: function() {
    window.location.href = 'mnliterature://refreshData'
  },
  
  // 打开文献详情
  openLiterature: function(litId) {
    const encoded = encodeURIComponent(litId)
    window.location.href = `mnliterature://openLiterature?id=${encoded}`
  },
  
  // 发送日志
  log: function(message) {
    const encoded = encodeURIComponent(message)
    window.location.href = `mnliterature://log?message=${encoded}`
  }
}
```

**Native 端拦截处理**

```javascript
webViewShouldStartLoadWithRequestNavigationType: function(webView, request, type) {
  // 解析 URL
  let config = MNUtil.parseURL(request)
  // config = {scheme: "mnliterature", host: "refreshData", params: {...}}
  
  // 拦截自定义 scheme
  if (config && config.scheme === "mnliterature") {
    this.executeAction(config)
    return false  // 阻止加载
  }
  
  return true  // 允许加载正常 URL
}

// 动作执行器
executeAction: async function(config) {
  switch (config.host) {
    case "refreshData":
      await this.refreshAllData()
      break
    case "openLiterature":
      await this.openLiterature(config.params.id)
      break
    case "log":
      MNUtil.log("[HTML] " + decodeURIComponent(config.params.message))
      break
  }
}
```

#### Native → JS（evaluateJavaScript）

```javascript
// 执行 JavaScript 代码
runJavaScript: async function(script) {
  // 检查 WebView 状态
  if (!this.webView || !this.webView.window || !this.webViewLoaded) {
    MNUtil.log("WebView 未就绪")
    return undefined
  }
  
  return new Promise((resolve) => {
    this.webView.evaluateJavaScript(script, (result) => {
      resolve(MNUtil.isNSNull(result) ? undefined : result)
    })
  })
}

// 加载数据到 HTML
loadLiteratureData: async function(data) {
  const script = `window.LiteratureBridge.loadData(${JSON.stringify(data)})`
  await this.runJavaScript(script)
}
```

---

## 第二部分：文献索引系统

### 2.1 索引数据结构

```javascript
// 索引清单（manifest）
const manifest = {
  metadata: {
    version: "1.0",
    totalEntries: 5000,      // 总条目数
    totalParts: 5,           // 分片数量
    updateTime: 1735123456,  // Unix 时间戳
    lastUpdated: "2025-01-20T10:30:00Z"
  },
  parts: [
    {
      partNumber: 0,
      filename: "lit-index-part-0.json",
      entryCount: 1000,
      sizeMB: 2.5
    }
    // ... 更多分片
  ]
}

// 索引分片（part）
const part = {
  partNumber: 0,
  count: 1000,
  data: [
    // 文献条目数组
  ]
}

// 文献条目（entry）
const entry = {
  id: "DOI:10.1234/xxxx",
  type: "article",
  title: "论文标题",
  authors: ["作者1", "作者2"],
  year: 2024,
  journal: "期刊名",
  searchText: "论文标题 作者1 作者2 2024 期刊名 ...",  // 用于搜索
  noteId: "关联的卡片ID"
}
```

### 2.2 分片索引构建

**为什么需要分片？**

- 单文件过大（>10MB）导致读取慢
- 内存占用过高可能导致崩溃
- JSON 解析耗时过长
- 无法增量更新

**核心流程**

```javascript
class LiteratureIndexer {
  static async buildIndex(notes) {
    const BATCH_SIZE = 500    // 批次大小
    const PART_SIZE = 5000    // 分片大小
    
    let currentBatch = []
    let tempFileCount = 0
    
    // 阶段1：流式处理，写入临时文件
    for (let note of notes) {
      const entry = this.buildIndexEntry(note)
      if (entry) {
        currentBatch.push(entry)
      }
      
      // 批次满了，写入临时文件
      if (currentBatch.length >= BATCH_SIZE) {
        const tempFile = `temp-${tempFileCount}.json`
        MNUtil.writeJSON(tempFilePath, {data: currentBatch})
        currentBatch = []  // 释放内存
        tempFileCount++
      }
    }
    
    // 阶段2：合并临时文件到最终分片
    await this.mergeTempFilesToParts(manifest)
    
    // 阶段3：清理临时文件
    await this.cleanupTempFiles()
    
    return manifest
  }
}
```

### 2.3 增量更新

```javascript
class IncrementalIndexer {
  // 添加文献到增量索引
  static addToIndex(note) {
    const entry = LiteratureIndexer.buildIndexEntry(note)
    
    const incrementalPath = MNUtil.dbFolder + "/data/lit-incremental-index.json"
    let incrementalIndex = MNUtil.readJSON(incrementalPath) || {
      metadata: {updateTime: 0, totalEntries: 0},
      entries: []
    }
    
    // 检查是否已存在
    const existingIndex = incrementalIndex.entries.findIndex(e => e.id === entry.id)
    if (existingIndex >= 0) {
      incrementalIndex.entries[existingIndex] = entry  // 更新
    } else {
      incrementalIndex.entries.push(entry)  // 新增
    }
    
    incrementalIndex.metadata.updateTime = Date.now()
    MNUtil.writeJSON(incrementalPath, incrementalIndex)
  }
  
  // 从增量索引删除
  static removeFromIndex(entryId) {
    const incrementalPath = MNUtil.dbFolder + "/data/lit-incremental-index.json"
    let incrementalIndex = MNUtil.readJSON(incrementalPath)
    
    if (incrementalIndex) {
      incrementalIndex.entries = incrementalIndex.entries.filter(e => e.id !== entryId)
      MNUtil.writeJSON(incrementalPath, incrementalIndex)
    }
  }
}
```

---

## 第三部分：HTML 界面实现

### 3.1 CSS 架构

```css
/* CSS 变量系统 */
:root {
  --bg: #f7f8fb;
  --card-bg: #fff;
  --accent: #2b7cff;
  --topbar-height: 64px;
  --shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

/* 固定顶部搜索栏 */
.topbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 130;
  backdrop-filter: blur(6px);
  background: linear-gradient(180deg, rgba(255,255,255,0.98), rgba(250,250,250,0.9));
  padding: 14px 20px;
}

/* 响应式网格布局 */
.result-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  padding: 16px;
  margin-top: var(--topbar-height);
}

/* 卡片样式 */
.result-card {
  background: var(--card-bg);
  border-radius: 12px;
  padding: 16px;
  box-shadow: var(--shadow);
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
}

.result-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}
```

### 3.2 JavaScript Bridge

```javascript
// 全局状态
const state = {
  allLiterature: [],      // 所有文献
  filteredResults: [],    // 过滤后的结果
  searchKeywords: '',     // 搜索关键词
  selectedTypes: []       // 选中的类型
}

// Bridge 对象
window.LiteratureBridge = {
  // 接收索引数据
  loadData: function(indexData) {
    console.log('收到索引数据', indexData)
    state.allLiterature = indexData.entries || []
    state.metadata = indexData.metadata || {}
    
    // 更新界面
    renderResults(state.allLiterature)
  },
  
  // 更新搜索结果
  updateResults: function(results) {
    renderResults(results)
  },
  
  // 日志
  log: function(message) {
    const encoded = encodeURIComponent(message)
    window.location.href = `mnliterature://log?message=${encoded}`
  }
}

// 搜索功能
function searchLiterature(keywords) {
  const results = state.allLiterature.filter(lit => 
    lit.searchText.toLowerCase().includes(keywords.toLowerCase())
  )
  
  renderResults(results)
}

// 渲染结果
function renderResults(literature) {
  const container = document.getElementById('results')
  container.innerHTML = literature.map(lit => `
    <div class="result-card" onclick="handleLiteratureClick('${lit.id}')">
      <h3>${lit.title}</h3>
      <p class="authors">${lit.authors.join(', ')}</p>
      <p class="meta">${lit.year} · ${lit.journal}</p>
    </div>
  `).join('')
}

// 点击事件
function handleLiteratureClick(litId) {
  const encoded = encodeURIComponent(litId)
  window.location.href = `mnliterature://openLiterature?id=${encoded}`
}
```

---

## 第四部分：关键注意事项

### 4.1 常见错误

```javascript
// ❌ 错误1：忘记检查 WebView 状态
this.webView.evaluateJavaScript(script)

// ✅ 正确
if (this.webView && this.webView.window && this.webViewLoaded) {
  this.webView.evaluateJavaScript(script)
}

// ❌ 错误2：URL 参数未编码
window.location.href = `mnliterature://action?text=${text}`

// ✅ 正确
window.location.href = `mnliterature://action?text=${encodeURIComponent(text)}`

// ❌ 错误3：一次性加载大量数据
const allData = loadAllLiterature()  // 可能导致内存爆炸
sendToWebView(allData)

// ✅ 正确：分片加载
const manifest = loadManifest()
for (const part of manifest.parts) {
  const partData = loadPart(part.filename)
  await sendToWebView(partData)
  await MNUtil.delay(0.1)
}
```

### 4.2 性能优化

1. **批量处理**：每 500 条记录写入一次临时文件
2. **异步处理**：使用 async/await，定期 delay 让出控制权
3. **内存管理**：及时释放不用的数组和对象
4. **缓存策略**：文件缓存（持久化）+ 内存缓存（5分钟）

### 4.3 文件编码

**必须使用 UTF-8 编码**

```bash
# 检查文件编码
file -I filename.md

# 应该显示：charset=utf-8
# 如果是其他编码，需要转换
```

---

## 第五部分：开发流程

### 5.1 实现步骤

1. **创建 literatureWebController.js**
   - 定义控制器类
   - 实现 WebView 生命周期
   - 实现 JSBridge 通信
   - 实现窗口管理

2. **创建 literatureIndexer.js**
   - 定义数据结构
   - 实现分片构建
   - 实现增量更新
   - 实现文件操作

3. **重构 literatureManager.html**
   - 应用 CSS 架构
   - 实现 Bridge 对象
   - 实现搜索和过滤
   - 实现卡片展示

4. **集成到主插件**
   - require 新模块
   - 添加事件监听
   - 添加菜单项

5. **测试验证**
   - 界面打开测试
   - 通信测试
   - 索引构建测试
   - 数据加载测试

### 5.2 待实现功能（TODO）

```javascript
// literatureIndexer.js 中的 TODO
buildIndexEntry: function(note) {
  // TODO: 从卡片中提取文献信息
  // - 解析 BibTeX
  // - 解析引文格式
  // - 提取 DOI、作者、标题等
  return null  // 暂时返回 null
}

extractLiteratureData: function(note) {
  // TODO: 具体的数据提取逻辑
  return null
}

// literatureWebController.js 中的 TODO
refreshAllData: async function() {
  // TODO: 加载文献数据
  // - 读取索引文件
  // - 读取增量索引
  // - 合并数据
  // - 发送到 WebView
}
```

---

## 总结

本文档记录了基于 mnknowledgebase 的核心技术，为 mnliterature 提供了完整的技术架构参考。

**核心技术点：**
1. WebView 控制器 + JSBridge 双向通信
2. 分片索引系统（降低内存使用）
3. 增量更新机制（无需全量重建）
4. 响应式 HTML 界面

**开发原则：**
1. 严格使用 UTF-8 编码
2. 优先使用 async/await
3. 批量处理 + 及时释放内存
4. 完善的错误处理

---

## 第六部分：开发进度追踪

### 6.1 已完成任务 ✅

#### 核心文件创建（2025-11-21）

1. **literatureWebController.js** ✅
   - 完整的 WebView 控制器实现
   - 生命周期方法（viewDidLoad, viewWillLayoutSubviews, viewWillDisappear）
   - JSBridge 通信机制（URL Scheme 拦截 + evaluateJavaScript）
   - 窗口管理（show/hide 动画、Mini 模式、位置持久化）
   - 手势处理（拖动、调整大小）
   - 按钮系统（移动、关闭、调整大小）

2. **literatureIndexer.js** ✅
   - 分片索引系统（BATCH_SIZE: 500, PART_SIZE: 5000）
   - 三阶段构建流程（流式处理 → 合并分片 → 清理临时文件）
   - 增量索引管理（IncrementalIndexer）
   - 索引加载机制（清单 + 分片 + 增量合并）
   - **注意**：buildIndexEntry() 和 extractLiteratureData() 标记为 TODO

3. **literatureManager.html** ✅
   - 添加 Bridge 别名（line 2671）
   ```javascript
   window.LiteratureBridge = window.Bridge;
   ```

4. **utils.js** ✅
   - 添加 LiteratureUtils 类（lines 747-779）
   - 实现 checkWebViewController() 单例模式
   - 实现 addErrorLog() 错误处理
   - 参考 mnknowledgebase/utils.js:18796-18808

5. **main.js** ⚠️ 部分完成
   - ✅ 添加模块加载（lines 19-24）
     ```javascript
     JSB.require('literatureWebController');
     JSB.require('literatureIndexer');
     ```
   - ✅ 添加插件实例引用（lines 49-53）
     ```javascript
     if (typeof MNLiteratureInstance === 'undefined') {
       global.MNLiteratureInstance = self
     }
     ```

### 6.2 已完成任务 - main.js 接口补充 ✅（2025-11-21）

#### main.js 接口补充已完成

1. **queryAddonCommandStatus 方法** ✅
   - 已修改为使用 `LiteratureUtils.checkWebViewController()`
   - 实现延迟初始化模式（避免 sceneWillConnect 中初始化导致崩溃）
   - 复习模式下自动隐藏控制器

2. **openLiteratureLibrary 方法** ✅
   - 完整实现打开文献数据库界面的逻辑
   - 支持 HTML 缓存检测，避免重复加载
   - 支持动画状态检测，防止冲突
   - 参考 mnknowledgebase 的 openSearchWebView 实现

3. **checkPopover 方法** ✅
   - 作为 closeMenu 的别名添加
   - 与 mnknowledgebase 保持一致
   - 同时更新 closeMenu 方法，关闭后清空 menuPopoverController

#### 架构核查完成 ✅

**统一使用新的控制器系统**：
- ❌ 旧系统：`literatureUtils.checkLiteratureController()` → `literatureController`
- ✅ 新系统：`LiteratureUtils.checkWebViewController()` → `literatureWebController`

**已验证的一致性**：
- 延迟初始化模式（在 queryAddonCommandStatus 中初始化，而非 sceneWillConnect）
- 窗口位置保存/恢复机制（NSUserDefaults）
- HTML 缓存检测（currentHTMLType + webViewLoaded）
- show/hide 动画处理
- Mini 模式支持

### 6.3 遗留问题 ⚠️

#### 旧控制器系统待清理

`literatureUtils.checkLiteratureController()` 及相关方法已不再使用，但代码仍保留在 utils.js 中。
建议后续清理以下内容：
- `literatureUtils.checkLiteratureController()`
- `literatureUtils.literatureController`
- `literatureUtils.setFrame()`
- `literatureUtils.ensureView()`

**注意**：当前 openSetting 方法仍使用旧的 literatureController，如需保留设置面板功能，需要单独处理。

### 6.4 后续开发计划 📋

#### Phase 1: 数据提取（核心功能）

实现 literatureIndexer.js 中的 TODO：

1. **buildIndexEntry(note, mode)**
   - 解析 BibTeX 格式
   - 解析引文格式（APA, MLA 等）
   - 提取 DOI, PMID 等标识符
   - 提取作者、标题、年份、期刊等字段
   - 构建搜索文本（searchText）

2. **extractLiteratureData(note)**
   - 从卡片标题提取文献信息
   - 从卡片评论中查找结构化数据
   - 识别文献类型（article, book, conference）
   - 提取摘要、关键词、DOI 等

#### Phase 2: HTML 界面增强

1. **搜索功能**
   - 实时搜索
   - 高级过滤（作者、年份、期刊）
   - 搜索历史

2. **数据展示**
   - 卡片式布局
   - 列表式布局切换
   - 排序功能（时间、相关度）

3. **交互功能**
   - 点击打开文献详情
   - 导出功能（BibTeX, RIS）
   - 批量操作

#### Phase 3: 性能优化

1. **缓存机制**
   - 内存缓存（5分钟过期）
   - 文件缓存（持久化）
   - 增量更新策略

2. **异步加载**
   - 分片按需加载
   - 虚拟滚动
   - 懒加载图片

### 6.5 已知问题 ⚠️

1. **编码问题已修复** ✅
   - 问题：CLAUDE.md 初次创建时中文乱码
   - 原因：文件编码为 binary 而非 UTF-8
   - 解决：使用 bash heredoc 重新创建，确保 UTF-8 编码
   - 验证：`file -I CLAUDE.md` 显示 `charset=utf-8`

2. **main.js 接口缺失** ✅ 已修复
   - 问题：没有打开 HTML 的入口
   - 影响：用户无法使用文献数据库功能
   - 解决：已实现 openLiteratureLibrary 方法，参考 mnkb 的 openSearchWebView

### 6.6 技术债务 📝

1. **文献解析库**
   - 需要引入或实现 BibTeX 解析器
   - 需要引入或实现 Citation Parser
   - 考虑使用正则表达式 vs 第三方库

2. **测试覆盖**
   - 需要添加单元测试
   - 需要添加集成测试
   - 需要性能测试（大数据量场景）

3. **文档完善**
   - API 文档
   - 用户使用手册
   - 开发者贡献指南

---

**文档更新时间**：2025-11-21
**参考项目**：mnknowledgebase
**应用项目**：mnliterature
**当前状态**：框架搭建完成，等待 main.js 接口补充和验证
