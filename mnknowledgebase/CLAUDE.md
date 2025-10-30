# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# MNKnowledgeBase Plugin Development Guide

## Project Overview

MNKnowledgeBase is a MarginNote 4 plugin focused on academic knowledge management with structured card classification, indexing, and intelligent search capabilities.

### Core Capabilities
- **Knowledge Card Classification**: 20+ card types (定义, 命题, 例子, 反例, 问题, etc.)
- **Template-Based Card Creation**: Pre-defined templates for rapid card creation
- **Full-Text Indexing**: Supports partitioned indexing with synonym expansion
- **Visual Search Interface**: WebView-based search UI with real-time filtering
- **AI Integration**: RAG-based card recommendation via MNAI plugin
- **OCR Processing**: Automatic OCR for excerpts with multiple modes

## Project Structure

```
mnknowledgebase/
├── mnaddon.json                 # Plugin manifest
├── main.js                      # Plugin entry point (2082 lines)
├── utils.js                     # Core utilities (21,700+ lines)
├── knowledgebaseWebController.js # WebView controller
├── search.html                  # Visual search interface
├── comment-manager.html         # Comment management UI
└── logo.png                     # Plugin icon
```

## Architecture Overview

### 1. Core Class Hierarchy (utils.js)

The plugin follows a modular class-based architecture:

#### **KnowledgeBaseTemplate** (Line 701)
- Manages card type definitions and templates
- Handles card creation, linking, and content processing
- Core methods:
  - `makeCard()` / `makeNote()`: Card creation workflows
  - `mergeTemplate()`: Template merging
  - `handleDefinitionPropositionLinks()`: Auto-linking logic
  - `getNoteType()` / `getTypeFromInputText()`: Type detection
  - `changeTitle()`: Title formatting with prefixes

#### **KnowledgeBaseIndexer** (Line 15276)
- Main knowledge base indexing (with partitioning support)
- Synonym expansion via `SynonymManager`
- Exclusion filtering via `ExclusionManager`
- Key methods:
  - `buildSearchIndex()`: Build partitioned index
  - `loadIndexManifest()` / `loadIndexPart()`: Load index data
  - `expandSearchQuery()`: Synonym expansion

#### **IntermediateKnowledgeIndexer** (Line 17197)
- Indexes intermediate knowledge base (未制卡/预备知识)
- Separate from main knowledge base
- Supports incremental indexing
- Methods mirror `KnowledgeBaseIndexer` API

#### **KnowledgeBaseSearcher** (Line 16085)
- Search engine with advanced query parsing
- Supports AND/OR/exact phrase queries
- Scoring and ranking algorithms
- Methods:
  - `parseSearchQuery()`: Parse search syntax
  - `matchesQuery()`: Match card against query
  - `showSearchDialog()`: Native search UI

#### **KnowledgeBaseUtils** (Line 17912)
- Shared utilities and helpers
- WebView controller management
- Error logging and debugging
- Methods:
  - `checkWebViewController()`: Lazy initialization
  - `addErrorLog()`: Error tracking

#### **KnowledgeBaseNetwork** (Line 17963)
- Network operations and external integrations
- AI plugin communication (MNAI)
- OCR services
- Methods:
  - `callMNAIWithNotification()`: AI communication
  - `OCRToTitle()`: OCR processing

#### **KnowledgeBaseConfig** (Line 19496)
- Plugin configuration management
- Persists settings to disk
- Configuration keys:
  - `excerptOCRMode`: OCR mode (0-3)
  - `classificationMode`: Auto-classification
  - `preProcessMode`: Card preprocessing
  - `excerptOCRModel`: OCR model selection

#### **KnowledgeBaseClassUtils** (Line 21415)
- Classification mode utilities
- Handles auto-classification workflows
- Integration with text editing lifecycle

### 2. Plugin Entry Point (main.js)

The plugin extends `JSExtension` with lifecycle methods:

#### **Lifecycle Hooks**
- `sceneWillConnect()`: Window initialization
- `sceneDidDisconnect()`: Cleanup observers
- `notebookWillOpen()` / `notebookWillClose()`: Notebook events
- `documentDidOpen()` / `documentWillClose()`: Document events

#### **Text Editing Lifecycle** (Critical for Card Detection)
- `onTextDidBeginEditing()`: Detects new card creation
  - Uses 3-element test: no title, no excerpt, no comments
  - Sets `self.newNoteCreatedFromMindMap`
- `onTextDidEndEditing()`: Processes new card
  - Auto-classification if enabled
  - Auto-linking to parent/classification nodes

#### **Main Menu** (`toggleAddon()`)
- 🔄 索引知识库
- 📝 索引中间知识库
- 🌐 可视化搜索
- 🤖 Mode toggles (OCR, 预摘录, 归类, 上课)
- ⚙️ OCR model settings
- 🎯 AI 推荐卡片

#### **Plugin Communication** (`onAddonBroadcast()`)
Protocol: `marginnote4app://addon/mnknowledgebase?action=<ACTION>`
Supported actions:
- `openSearchWebView`: Open visual search interface

### 3. WebView Architecture (knowledgebaseWebController.js)

Custom UIViewController managing search interface:

#### **Components**
- `webView`: Main UIWebView for search.html
- `moveButton`: Drag to reposition
- `closeButton`: Hide interface
- `resizeButton`: Resize window

#### **Bridge Methods** (JavaScript ↔ Native)
- `Bridge.loadSearchIndex(data)`: Load index data into frontend
- `Bridge.showAIRecommendations(cardIds)`: Display AI recommendations
- `Bridge.focusCard(noteId)`: Focus card in MindMap
- `Bridge.copyCardUrl(noteId)`: Copy MarginNote URL
- `Bridge.copyMarkdownLink(title, noteId)`: Copy MD link

#### **Data Loading Flow**
1. `openSearchWebView()` → Show WebView
2. `loadSearchDataToWebView()` → Merge main + intermediate index
3. Frontend receives data via `Bridge.loadSearchIndex()`
4. User searches → Frontend filters → Display results

### 4. Visual Search Interface (search.html)

Vue.js-based reactive search UI:

#### **Features**
- Real-time search with debouncing
- Type filtering (pill buttons)
- Paginated results (50 per page)
- Card selection and actions
- AI recommendation panel (bottom)

#### **Search Modes**
- **Quick presets**: Common card types
- **Advanced filtering**: AND/OR/exact phrase
- **AI recommendations**: RAG-based suggestions

#### **Actions**
- 🎯 定位到卡片 (Focus in MindMap)
- 📋 复制 URL
- 🔗 复制 Markdown 链接
- 💬 查看评论 (Comment Manager)

## Development Workflows

### Building the Plugin
```bash
# In parent directory
mnaddon4 build mnknowledgebase

# Or use mnaddon-packager agent (recommended)
# Output: mnknowledgebase_v0_XX.mnaddon
```

### Unpacking for Development
```bash
mnaddon4 unpack mnknowledgebase_vX_Y.mnaddon
```

### Installation Path
```
/Users/xiakangwei/Library/Containers/QReader.MarginNoteApp/Data/Library/MarginNote Extensions/
```

### Testing Workflow
1. Make changes to `main.js` or `utils.js`
2. Build plugin with `mnaddon4 build mnknowledgebase`
3. Restart MarginNote to load new version
4. Check logs in `log.json` for errors

## Key Technical Patterns

### 1. Card Type System

Card types are defined in `KnowledgeBaseTemplate.types`:
```javascript
{
  refName: "定义",           // Internal reference name
  prefixName: "定义",        // Prefix in title
  englishName: "Definition", // English name
  templateNoteId: "...",     // Template card ID
  colorIndex: 2,             // Color code
  fields: [                  // Field structure
    { name: "关键词", logical: "keyword" },
    { name: "陈述", logical: "statement" },
    // ...
  ]
}
```

### 2. Search Index Structure

Partitioned index for scalability:
```javascript
// Manifest file: kb-search-index-manifest.json
{
  metadata: {
    totalCards: 5000,
    totalParts: 5,
    updateTime: 1234567890
  },
  parts: [
    { filename: "kb-search-index-part-1.json", cardCount: 1000 },
    // ...
  ]
}

// Each part: kb-search-index-part-X.json
{
  data: [
    {
      id: "noteId",
      title: "卡片标题",
      type: "定义",
      searchText: "标题 + 字段内容",
      score: 50
    },
    // ...
  ]
}
```

### 3. Incremental Indexing

New cards are added to incremental index:
```javascript
// kb-incremental-index.json
{
  cards: [/* new cards */],
  metadata: { lastUpdate: timestamp }
}

// Merged during search/display
allCards = [...mainIndex, ...incrementalIndex]
```

### 4. AI Integration Pattern

RAG-based card recommendation:
```javascript
// 1. Extract keywords from question
keywords = extractKeywords(userQuestion)

// 2. Search knowledge base for candidates
candidates = searchCardsByKeywords(keywords)

// 3. Send to MNAI for relevance analysis
prompt = buildAIPromptForCardRecommendation(question, candidates)
response = await callMNAIWithNotification(prompt)

// 4. Parse AI response and display
cardIds = parseCardIdsFromAIResponse(response)
showRecommendedCardsInWebView(cardIds)
```

### 5. Observer Pattern Usage

The plugin uses MarginNote's observer system extensively:
```javascript
// Register observers
MNUtil.addObserver(self, 'onPopupMenuOnNote:', 'PopupMenuOnNote')
MNUtil.addObserver(self, 'onProcessNewExcerpt:', 'ProcessNewExcerpt')
MNUtil.addObserver(self, 'onAddonBroadcast:', 'AddonBroadcast')

// Clean up on disconnect
MNUtil.removeObservers(self, [
  'AddonBroadcast',
  'ProcessNewExcerpt',
  'PopupMenuOnNote'
])
```

## Important Constraints

### API Usage
- **严禁自己不确定的情况下乱用 API！**
- 必须在 `../mnutils/` 中查找确认 API 存在
- 使用前严格确定 API 所处的类

### MNUtils Framework
- Already integrated in `utils.js`
- No separate initialization needed
- Use `MNUtil.undoGrouping()` for batch operations
- Use `MNUtil.showHUD()` for user feedback

### Data Persistence
- Storage path: `MNUtil.dbFolder + "/data/"`
- Use `MNUtil.writeJSON()` / `MNUtil.readJSON()`
- Index files use partitioning for scalability

### Error Handling
- All main functions wrapped in try-catch
- Errors logged via `KnowledgeBaseUtils.addErrorLog()`
- User-facing errors via `MNUtil.showHUD()`
- Debug logs written to `log.json`

## Common Tasks

### Adding a New Card Type
1. Add type definition to `KnowledgeBaseTemplate.types`
2. Create template card in MarginNote
3. Add template ID to `roughReadingRootNoteIds` or `singleHtmlCommentTemplateNoteIds`
4. Update `keywordTypeMapping` for auto-detection
5. Test with `getTypeFromInputText()`

### Modifying Search Behavior
1. Edit synonym groups in `kbSearchConfig.synonymGroups`
2. Update exclusion words in `kbSearchConfig.exclusionGroups`
3. Rebuild index with "🔄 索引知识库"
4. Test search in visual interface

### Customizing AI Prompts
1. Modify `buildAIPromptForCardRecommendation()` in main.js
2. Adjust `buildContextFromCards()` for context formatting
3. Update `parseCardIdsFromAIResponse()` for response parsing

### Debugging WebView Issues
1. Enable logging in `knowledgebaseWebController.js`
2. Check `self.webViewLoaded` flag
3. Use `MNLog.log()` for lifecycle tracking
4. Inspect `Bridge` methods in browser console (if accessible)

## Known Issues and Workarounds

### Issue: WebView Data Not Refreshing
**Solution**: Use `refreshAllData()` method to force reload
```javascript
await controller.refreshAllData()
```

### Issue: Cards Not Found in AI Recommendations
**Cause**: Index might be stale
**Solution**: Rebuild index before AI recommendations

### Issue: Observer Not Firing
**Cause**: Wrong window context
**Solution**: Always check `self.window === MNUtil.currentWindow`

## Integration Points

### With MNAI Plugin
- Uses `customChat` notification
- Polls `chatAIUtils.notifyController.lastResponse`
- Auto-closes notification controller after response

### With MNUtils Framework
- Extends `MNNote`, `MNComment`, `MNDocument` classes
- Uses `MNUtil.studyView` for WebView attachment
- Leverages `MNUtil.parseURL()` for protocol handling

### With Other Plugins
- Supports plugin communication via URL protocol
- Example: `marginnote4app://addon/mnknowledgebase?action=openSearchWebView`

## Performance Considerations

### Index Partitioning
- Main index split into 5MB chunks
- Incremental index for new cards
- Merged in-memory during search

### Search Optimization
- Synonym expansion pre-computed
- Exclusion filtering post-search
- Scoring uses weighted term frequency

### WebView Lifecycle
- Lazy initialization on first use
- HTML loaded once, data refreshed via Bridge
- Hidden (not destroyed) when closed for faster reopen

## Version History Notes

Current version: **0.27**

Recent major changes:
- Added AI recommendation system (v0.25+)
- Implemented partitioned indexing (v0.20+)
- Added visual search interface (v0.15+)
- Integrated OCR modes (v0.10+)
- Initial release with basic indexing (v0.1)

## Additional Resources

- Parent directory CLAUDE.md for general MN plugin development
- `../mnutils/MNUtils_API_Guide.md` for API reference
- MarginNote plugin system documentation in parent directory
