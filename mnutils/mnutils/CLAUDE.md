# ✅ MNUtils Plugins > If you want to learn how to develop other plugins using the MNUtils API, please see [MNUTILS_API_GUIDE.md](./MNUTILS_API_GUIDE.md).

## 📌 Project Overview MNUtils is the core infrastructure of the MarginNote ecosystem and has a dual identity:

1. **Plugin Management System:** Provides plugin store, subscription management, and update management functions. 2. **API Framework:** Provides core API support for other MarginNote plugins. ### Project Information - **Plugin ID:** marginnote.extension.mnutils
- **Author: Feliks**
Version: 0.1.5.alpha0624
- **Minimum supported version:** MarginNote 3.7.11

### Core Functional Modules 1. **Subscription Management System**: APIKey management, quota purchase, automatic subscription 2. **Plugin Store**: Plugin installation, updates, version management 3. **Notebook/Document Sharing**: Community resource sharing platform 4. **Log System**: Error tracking, debugging support 5. **API Framework**: mnutils.js and xdyyutils.js

## 🎯 MNUtils Plugin Functionality Explained ### As the core value of the MarginNote ecosystem, MNUtils is not only an independent plugin, but also the **infrastructure layer** of the entire MarginNote plugin ecosystem:

1. **Default Loading Mechanism:** The MNUtils framework is loaded by default; all other plugins can directly use its API without needing to be imported.
2. **Unified API Standards:** Provides standardized development interfaces, lowering the barrier to plugin development and improving code quality. 3. **Function Reuse:** Avoids redundant implementation of basic functions in each plugin, allowing focus on core business logic. ### API Framework Scale and Capabilities #### mnutils.js - Core Framework - **Scale:** 10 main classes, 500+ API methods - **Coverage:** Comprehensive functionality including note-taking, document management, UI components, network requests, file system, etc. - **Core Classes:**
  - `MNUtil` (400+ methods) - System-level toolset - `MNNote` (180+ methods) - Core note-taking functionality - `MNLog` - Structured log system - `Menu`/`MNButton` - UI components #### xdyyutils.js - Academic extension - **Scale**: 15,000+ lines of code, 200+ extension methods - **Features**:
  - **Intelligent Link Management**: Automatically maintains knowledge structure relationships. - **Chinese Typography Optimization**: Integrated with Pangu.js, automatically optimizes mixed Chinese and English text. - **Prototype Extension**: String (95+ methods), MNNote (70+ methods) extensions. ### Applicable Scenarios and Target Users 1. **Plugin Developers**
   - Quickly build powerful MarginNote plugins - No need to start from scratch, focus on business logic implementation - Gain proven best practices. 2. **Academic Researchers**
   - Structured knowledge management (especially in mathematics and computer science)
   - Automated note organization and linking - Standardized academic note template 3. **For general users**
   - Manage other plugins through the plugin store - Unified subscription and update management - Enhanced bug tracking and debugging capabilities ### Key Features Summary - ✅ **Plug and Play**: Loaded by default, no additional configuration required - ✅ **Comprehensive Coverage**: From low-level APIs to advanced academic features - ✅ **Continuous Updates**: Active development and community support - ✅ **Best Practices**: Design patterns proven through extensive practice > 💡 **Tip**: For detailed API usage methods and examples, please see [MNUTILS_API_GUIDE.md](./MNUTILS_API_GUIDE.md)

## 🏗️ Project Structure```
mnutils/
├── main.js # Main entry point for the plugin, including UI and business logic ├── mnutils.js # Core API framework (6,878 lines)
├── xdyyutils.js # Academic Extension API (6, 175 lines)
├── mnaddon.json # Plugin configuration list ├── CLAUDE.md # This document - Project development guide ├── MNUTILS_API_GUIDE.md # API usage guide ├── sidebar.html # Sidebar UI
├── log.html # Log viewer ├── usage.html # Usage details page └── mcp-marginnote4/ # MCP server-side support

## 💻 Development Environment Setup ### 1. Required Tools - **Code Editor**: VS Code or other JavaScript-enabled editor - **MarginNote**: Version 3.7.11+ - **Debugging Tool**: Safari Web Inspector (macOS) or remote debugging ### 2. Development Workflow ```bash
# 1. Clone the project: git clone [repository-url]

# 2. Enter the project directory: cd mnutils

# 3. Edit files directly during development, no compilation required. # 4. Package the plugin: `zip -r mnutils.mnaddon * -x ".*" -x "__MACOSX"`

# 5. Install to MarginNote
# Drag the .mnaddon file into MarginNote
```

## 📦 Core Components Explained ### 1. main.js - Plugin Main Controller main.js is the entry point and control center of the entire plugin, mainly containing:

#### 1.1 MNSubscription Class (Main Plugin Class)
```javascript
JSB.defineClass("MNSubscription : JSExtension", {
  // Lifecycle methods sceneWillConnect: function() {}, // Scene connection sceneDidDisconnect: function() {}, // Scene disconnect notebookWillOpen: function(id) {}, // Notebook open documentDidOpen: function(doc) {}, // Document open // Event listeners onPopupMenuOnNote: function(info) {}, // Note pop-up menu onPopupMenuOnSelection: function() {}, // Selection pop-up menu // Plugin control toggleAddon: function(button) {} // Toggle plugin display });
```

#### 1.2 The subscriptionController class (UI controller)
```javascript
JSB.defineClass("subscriptionController : UIViewController", {
  // UI initialization viewDidLoad: function() {},
  init: function() {},

  // View management refresh: function(reload) {}, // Refresh the view changeView: function(sender) {}, // Switch the view setViewTo: function(viewName) {}, // Set the view // Subscription function activate: function(days) {}, // Activate the subscription refreshUsage: function() {}, // Refresh usage chooseAPIKeyForQuota: function() {}, // Purchase quota // Plugin store refreshSidebar: function(reload) {}, // Refresh the plugin list webViewShouldStartLoad: function() {}, // Handle web page interactions });
```

### 2. Subscription System Architecture #### 2.1 Subscription Configuration Management ```javascript
subscriptionConfig = {
  config: {
    apikey: "", // API key url: "", // Server address activated: false, // Activation status autoSubscription: false, // Automatic subscription subscriptionDaysRemain: 0, // Remaining days lastView: "subscriptionView" // Last view

  // Core methods init: function() {}, // Initialize configuration save: function() {}, // Save configuration isSubscribed: function() {} // Check subscription status };
```

#### 2.2 Network Request Module ```javascript
subscriptionNetwork = {
  // Subscribe related: async function(days) {},
  getUsage: async function() {},

  // Download file from Config: function(config, controller) {},
  readFileFromWebdav: async function(filename) {},

  // Install the plugin installAddon: function(addonInfo) {}
};
```

### 3. UI View System #### 3.1 View Switching Mechanism ```javascript
// Supported view types const views = {
  "subscriptionView": "Subscription Management",
  "webview": "Update Manager",
  "webviewAlpha": "Update Manager (α)",
  "shareNotebooks": "Shared Notebooks",
  "shareDocuments": "Shared Documents",
  "log": "Log viewer"
};
```

#### 3.2 Mini Mode ```javascript
// Mini mode switch to Minimode: function(animate) {
  // Floating button shrunk to 40x40 // Supports dragging and position memory}
```

### 4. Plugin Store Functionality #### 4.1 Plugin Information Structure ```javascript
{
  id: "addon.id",
  name: "Plugin Name",
  version: "1.0.0",
  description: "Plugin description",
  action: "install/update/reinstall",
  url: "Download address",
  history: [...] // Historical versions}
```

#### 4.2 Version Management ```javascript
// Version comparison logic compareVersions: function(v1, v2) {
  // Returns: 1 (Needs update), 0 (Same), -1 (Local update)
}
```

## 🔧 Key Functionality Implementation ### 1. APIKey Management System ```javascript
// APIKey input and validation pasteApiKey: function() {
  let key = MNUtil.clipboardText.trim();
  if (key.startsWith("sk-")) {
    // Save and activate}
}

// Quota purchase process chooseAPIKeyForQuota: function() {
  // 1. Select purchase type (New Key/Top-up)
  // 2. Select the credit limit (5/10/20/50 Points)
  // 3. Redirect to the payment page}
```

### 2. Automatic Subscription Mechanism ```javascript
autoSubscribe: function() {
  if (config.autoSubscription && !isSubscribed()) {
    // Check remaining days // Automatically deduct and activate }
}
```

### 3. Plugin Installation Process ```javascript
// 1. Download the .mnaddon file // 2. Extract it to a temporary directory // 3. Read mnaddon.json to get the addonid
// 4. Copy to the extension directory // 5. Prompt to restart MarginNote
```

### 4. Log System Integration ```javascript
// Error capture subscriptionUtils.addErrorLog = function(error, source, info) {
  MNUtil.addErrorLog(error, source, info);
  // Synchronize to the log view if (currentView === "log") {
    controller.appendLog(errorLog);
  }
};
```

## 📚 Core API Framework Explained ### mnutils.js - Core Framework (6,878 lines)

mnutils.js is the core of the MNUtils framework, providing 9 main classes and over 300 API methods.

#### Core Class Overview | Class Name | Lines of Code | Main Functionality | Number of APIs |
|------|----------|----------|----------|
| **Menu** | 1-139 | Pop-up Menu UI Component | 12 |
**MNUtil** | 140-2787 | Core utility class, system-level functionality | 304+ errors |
| **MNConnection** | 2788-3171 | Network Requests, WebView, WebDAV | 14 |
| **MNButton** | 3172-3754 | Custom Button UI Component | 27 |
| **MNDocument** | 3755-3879 | PDF Document Manipulation Interface | 14 |
| **MNNotebook** | 3880-4172 | Notebook/Study Set Management | 35 |
| **MNNote** | 4173-6337 | Core Note-Taking Tool | 149+ |
| **MNComment** | 6338-6757 | Comments/Content Management | 20+ |
| **MNExtensionPanel** | 6758-6841 | Plugin Panel Control | 11 |

#### 1. Menu Class - Pop-up Menu Component ```javascript
// Core features - Automatically adjusts position to avoid exceeding screen limits - Supports multiple pop-up directions (up, down, left, right)
- Customizable line height and font size - Supports menu item selection state // Common methods: new Menu(sender, delegate, width, preferredPosition)
addMenuItem(title, selector, params, checked)
addMenuItems(items)
show()
dismiss()

// Example usage: let menu = new Menu(button, self, 250);
menu.addMenuItem("Copy", "copyNote:", note);
menu.addMenuItem("makeCard", "makeCard:", note, note.isCard);
menu.show();
```

#### 2. MNUtil Class - Core Utility Class ⭐⭐⭐⭐⭐

MNUtil is the core of the entire framework, providing 304+ static methods.

**Main Functional Modules**:

```javascript
// 1. Context accessor (lazy loading)
MNUtil.app // Application instance MNUtil.db // Database instance MNUtil.studyController // Study controller MNUtil.studyView // Study view MNUtil.mindmapView // Mind map view // 2. Selection and clipboard MNUtil.selectionText // Get selected text MNUtil.clipboardText // Clipboard text MNUtil.copy(object) // Copy to clipboard // 3. Note operations MNUtil.getNoteById(noteid, alert)
MNUtil.noteExists(noteId)
MNUtil.focusNoteInMindMapById(noteId, delay)

// 4. UI interaction MNUtil.showHUD(message, duration)
MNUtil.confirm(title, message, buttons)
MNUtil.input(title, subTitle, items)
MNUtil.userSelect(title, options, allowMulti)

// 5. Error Handling and Logging MNUtil.addErrorLog(error, source, info)
MNUtil.log(log)

// 6. File operations MNUtil.readJSON(path)
MNUtil.writeJSON(path, object)
MNUtil.isfileExists(path)
MNUtil.createFolder(path)

// 7. Version and Platform Detection MNUtil.isMN4()
MNUtil.isMacOS()
MNUtil.version
```

#### 3. MNNote Class - Core Note-Taking Class ⭐⭐⭐⭐⭐

One of the most important classes, providing 149+ properties and methods.

**Core Functionality**:

```javascript
// 1. Constructing and retrieving MNNote.new(note, alert) // Intelligently creates note objects MNNote.getFocusNote() // Gets the currently focused note MNNote.getSelectedNotes() // Gets the selected note array // 2. Core property note.noteId // Note ID
note.title // Note title note.excerptText // Excerpt text note.comments // Array of comments note.colorIndex // Color index (0-15)
note.parentNote // Parent note note.childNotes // Array of child notes // 3. Content operations note.appendTextComment(comment)
note.appendMarkdownComment(comment)
note.appendHtmlComment(html, text, size, tag)
note.moveComment(fromIndex, toIndex)
note.removeCommentByIndex(index)

// 4. Hierarchical management: note.addChild(childNote)
note.removeFromParent()
note.createChildNote(config)

// 5. Other operations note.merge(anotherNote) // Merge notes```

#### 4. MNComment Class - The comment system manages various content types in the notes.

**Supported comment types:**
- textComment: Plain text comment - markdownComment: Markdown formatted comment - imageComment: Image comment - htmlComment: HTML comment - linkComment: Link comment - tagComment: Tag comment #### 5. MNConnection Class - Network Requests ```javascript
// HTTP request MNConnection.fetch(url, options)

// WebDAV supports MNConnection.readWebDAVFile(url, username, password)
MNConnection.uploadWebDAVFile(url, username, password, content)

// WebView controls MNConnection.loadRequest(webview, url, desktop)
MNConnection.loadHTML(webview, html, baseURL)
```

#### 6. MNDocument Class - Document Manipulation ```javascript
// Core attribute doc.docMd5 // Document MD5
doc.docTitle // Document title doc.pageCount // Page number // Operation method doc.open(notebookId) // Open in the specified notebook doc.textContentsForPageNo(pageNo) // Get the page text

#### 7. MNNotebook Class - Notebook Management ```javascript
// Get the current notebook MNNotebook.currentNotebook // Current notebook MNNotebook.allNotebooks() // All notebooks MNNotebook.allStudySets() // All study sets // Notebook operations notebook.open() // Open the notebook notebook.openDoc(docMd5) // Open the document in the notebook

### xdyyutils.js - Academic Extension (6,175 lines)

xdyyutils.js is a deeply optimized extension for academic scenarios, especially mathematics.

#### HtmlMarkdownUtils Class - HTML style tool that provides rich HTML styles and icons, supporting 5 levels of hierarchy.

```javascript
// Predefined icons static icons = {
  level1: '🚩', level2: '▸', level3: '▪',
  level4: '•', level5: '·',
  key: '🔑', alert: '⚠️', danger: '❗❗❗',
  remark: '📝', goal: '🎯', question: '❓',
  idea: '💡', method: '✨'
}

// Create styled HTML text HtmlMarkdownUtils.createHtmlMarkdownText(text, type)
```

#### Pangu Class - Automatically optimizes mixed Chinese and English text layout based on pangu.js rules.

```javascript
// Automatically add spaces between Chinese and English text. `Pangu.spacing(text)`
// "MarginNote4 plugin" → "MarginNote 4 plugin"
```

#### String/MNNote Prototype Extensions - **String.prototype**: 85+ method extensions - **MNNote.prototype**: 30+ method extensions, providing smoother chaining of methods ## ⚠️ Important: Difference between note.MNComments and note.comments (2025-01-12)

### Problem Background: While developing the handwritten comment optimization feature, a key API usage error was discovered, causing type judgment to fail.

### Core Differences #### 1. `note.comments` - Raw array of comments - Contains the underlying `NoteComment` object - `comment.type` only contains basic type values:
  - `"TextNote"` - Text comments - `"HtmlNote"` - HTML comments - `"LinkNote"` - Linked comments (including merged images/text)
  - `"PaintNote"` - Drawing comments (including images and handwriting)
  - `"AudioNote"` - Audio Comments #### 2. `note.MNComments` - Processed array of comments - An array of `MNComment` instances generated by `MNComment.from(note)` - Each `MNComment` instance is constructed by calling `MNComment.getCommentType(comment)`.
- The `type` attribute of `MNComment` is the subdivided type:
  - `"textComment"` - Plain text - `"markdownComment"` - Markdown text - `"tagComment"` - Tag (starting with #)
  - `"linkComment"` - Note link - `"summaryComment"` - Summary link - `"HtmlComment"` - HTML comment - `"mergedTextComment"` - Merged text - `"mergedImageComment"` - Merged image - `"mergedImageCommentWithDrawing"` - Merged image + handwriting - `"imageComment"` - Image - `"imageCommentWithDrawing"` - Image + handwriting - `"drawingComment"` - Pure handwriting - `"audioComment"` - Audio ### Correct usage ```javascript
// ❌ Error: getCommentType was called again on the MNComments element
let commentType = MNComment.getCommentType(note.MNComments[0]);

// ✅ Correct: Directly use the type attribute of the MNComments element: let commentType = note.MNComments[0].type;

// ❌ Error: Using a sub-type check on the original comments if (note.comments[0].type === "drawingComment") { } // will always be false

// ✅ Correct: Use basic type checking on the original comments: if (note.comments[0].type === "PaintNote") { }

// ✅ Or: Call getCommentType on the original comments to get the sub-type let commentType = MNComment.getCommentType(note.comments[0]);
if (commentType === "drawingComment") { }
```

### Practical Application Examples ```javascript
// Determine if a comment is handwritten: function isHandwritingComment(note, index) {
  // Method 1: Use MNComments (Recommended)
  let commentType = note.MNComments[index].type;
  return commentType === "drawingComment" ||
         commentType === "imageCommentWithDrawing" ||
         commentType === "mergedImageCommentWithDrawing";

  // Method 2: Use the original comments
  let comment = note.comments[index];
  if (comment.type === "PaintNote" || comment.type === "LinkNote") {
    let commentType = MNComment.getCommentType(comment);
    return commentType === "drawingComment" ||
           commentType === "imageCommentWithDrawing" ||
           commentType === "mergedImageCommentWithDrawing";
  }
  return false;
}
```

### Notes 1. **Prefer `note.MNComments`:** It has already been processed, and the `type` attribute is more precise. 2. **Do not call `getCommentType` repeatedly:** The `MNComments` element has already called it. 3. **Understand the type hierarchy:** Basic types (5 types) → Sub-types (15+ types)
4. **Debugging Tips**: Use `MNUtil.log(note.MNComments[0])` to view the actual type value.
