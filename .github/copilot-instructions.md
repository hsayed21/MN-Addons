# MarginNote 4 Plugin Development - Copilot Instructions

> **Repository**: MN-Addons (https://github.com/xkwxdyy/MN-Addons)
> **Purpose**: MarginNote 4 plugin/addon ecosystem development
> **Primary Language**: JavaScript (JSBridge → Objective-C)
> **Last Updated**: 2025-01-17

---


**NOTES:** DO NOT CREATE any markdown files guides or documentation..etc. Only focus on coding

## 🎯 PROJECT IDENTITY & ECOSYSTEM OVERVIEW

### What is MarginNote?

MarginNote is a powerful **reading and knowledge management system** for macOS/iPadOS that combines PDF reading, note-taking, mind mapping, and spaced repetition review. It's designed for academic research, literature review, and deep learning.

**Core Philosophy**:
- **Knowledge Atomization**: Break knowledge into smallest manageable units (cards/notes)
- **Knowledge Structurization**: Build knowledge systems through relationship networks
- **Knowledge Mobility**: Same data flows seamlessly between different views (document/mindmap/review)
- **Knowledge Computability**: Support search, linking, and automated processing

### Plugin System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    MarginNote 4 Application                      │
│  ┌────────────────────────────────────────────────────────┐    │
│  │          iOS/macOS Native Layer (Objective-C)          │    │
│  └───────────────────────┬────────────────────────────────┘    │
│                          │ JSBridge Framework                   │
│  ┌───────────────────────▼────────────────────────────────┐    │
│  │       JavaScript Plugin Runtime (Safari Engine)         │    │
│  │  ┌──────────────────────────────────────────────────┐  │    │
│  │  │  Plugin Ecosystem (MN-Addons Repository)         │  │    │
│  │  │    ├── MNUtils (Foundation Framework)            │  │    │
│  │  │    ├── MNToolbar (UI Extensions)                │  │    │
│  │  │    ├── MNTask (Task Management)                 │  │    │
│  │  │    ├── MNAI (AI Integration)                    │  │    │
│  │  │    ├── MNOCR (OCR Services)                     │  │    │
│  │  │    └── [30+ other plugins...]                   │  │    │
│  │  └──────────────────────────────────────────────────┘  │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

**Technical Foundation**:
- **JSBridge**: Bridges JavaScript to Objective-C native APIs
- **Runtime**: Safari's JavaScript engine (no Node.js, limited Browser APIs)
- **Limitations**: Old JSBridge framework, iOS/macOS platform differences
- **Packaging**: `.mnaddon` files (ZIP archives with specific structure)

---

## 📁 COMPLETE REPOSITORY STRUCTURE

### Root-Level Organization

```
MN-Addons/
├── 📚 DOCUMENTATION (Core Learning Resources)
│   ├── CLAUDE.md                              # Chinese development guidelines
│   ├── WORKFLOW_GUIDE.md                       # Git workflow and issue management
│   ├── JavaScript_for_MN_Beginners.md         # JS fundamentals tutorial
│   ├── MarginNote4_Plugin_Development_Tutorial.md  # Part 1: Basics
│   ├── MarginNote4_Plugin_Tutorial_Part2.md   # Part 2: UI Development
│   ├── MarginNote4_Plugin_Tutorial_Part3.md   # Part 3: Advanced Topics
│   ├── MarginNote4_Plugin_Tutorial_Part4.md   # Part 4: OCR Integration
│   ├── MarginNote插件系统文档.md               # Official plugin system docs
│   ├── MNGuide_DataStructure.md               # Data model reference
│   └── [Plugin-specific analysis docs]
│
├── 🛠️ CORE INFRASTRUCTURE
│   ├── mnutils/                               # Foundation framework (CRITICAL)
│   │   ├── mnutils.js                        # 8,439 lines, 500+ API methods
│   │   ├── xdyyutils.js                      # 15,560 lines, academic extensions
│   │   ├── mnnote.js                         # Note manipulation utilities
│   │   ├── MNUtils_API_Guide.md              # Complete API reference
│   │   └── usage.json                        # Usage tracking/analytics
│   │
│   └── index.d.ts                            # TypeScript type definitions (root)
│
├── 🔌 PLUGIN ECOSYSTEM (30+ Plugins)
│   ├── GoToPage/                             # Simple navigation plugin
│   ├── mntask/                               # Task management system
│   ├── mntoolbar/                            # Customizable toolbar
│   ├── mnai/                                 # AI integration (ChatGLM, etc.)
│   ├── mnocr/                                # OCR services integration
│   ├── mnbrowser/                            # Web browsing within MN
│   ├── mneditor/                             # Text editor enhancements
│   ├── mnexcalidraw/                         # Diagramming tool
│   ├── mnknowledgebase/                      # Knowledge base search
│   ├── mnliterature/                         # Literature management
│   ├── mnpinner/                             # Pin/bookmark system
│   ├── mnsnipaste/                           # Screenshot integration
│   ├── mntexthandler/                        # Text processing utilities
│   ├── mntimer/                              # Time tracking
│   ├── mnvideoplayer/                        # Video note integration
│   ├── mnwebdav/                             # Cloud sync (WebDAV)
│   └── monaco/                               # Code editor integration
│
└── 📦 BUILD & DEPLOYMENT
    └── batch_build_addons.sh                 # Batch build script
```

---

## 🏗️ PLUGIN ANATOMY - STANDARD STRUCTURE

### Minimal Plugin Structure (15 lines)

```
MyPlugin.mnaddon/
├── mnaddon.json           # Plugin manifest (REQUIRED)
├── main.js                # Entry point JavaScript (REQUIRED)
└── logo.png               # Plugin icon 44x44px (OPTIONAL)
```

### Production Plugin Structure (Example: MNTask)

```
mntask/
├── mnaddon.json                    # Plugin manifest
├── main.js                         # Main entry point + lifecycle
├── utils.js                        # Utility functions
├── app.js                          # Application logic
├── webviewController.js            # WebView management
├── settingController.js            # Settings panel
├── drag-manager.js                 # Drag & drop functionality
├── render-engine.js                # UI rendering
├── state-manager.js                # State management
├── task-board.js                   # Task board UI
├── task-board-utils.js             # Task utilities
├── xdyy_button_registry.js         # Button registration
├── xdyy_custom_actions_registry.js # Custom actions
├── xdyy_menu_registry.js           # Menu system
├── xdyy_utils_extensions.js        # Utility extensions
├── index.html                      # WebView HTML
├── common.css                      # Shared styles
├── jsoneditor.js                   # JSON editor library
└── [asset files...]
```

---

## 📋 MNADDON.JSON - PLUGIN MANIFEST

### Required Fields & Validation

```json
{
  "addonid": "marginnote.extension.pluginname",  // REQUIRED: Unique ID (reverse domain)
  "author": "Your Name",                         // REQUIRED: Plugin author
  "title": "Plugin Display Name",                // REQUIRED: Shown in UI
  "version": "1.0.0",                           // REQUIRED: Semantic versioning
  "marginnote_version_min": "3.7.11",           // REQUIRED: Min MN version
  "cert_key": ""                                // OPTIONAL: Official signing key
}
```

**Critical Rules**:
- ✅ `addonid` MUST use `marginnote.extension.` prefix
- ✅ `addonid` MUST be globally unique across all MN plugins
- ✅ `main` field defaults to `main.js` (can specify custom entry point)
- ✅ Version changes trigger MN to reload plugin
- ⚠️ MarginNote 3 (< 4.0.0) vs MarginNote 4 (≥ 4.0.0) API differences

### Real-World Examples

```javascript
// mnutils/mnutils/mnaddon.json
{
    "addonid": "marginnote.extension.mnutils",
    "author": "Feliks",
    "title": "MN Utils",
    "version": "0.2.1.alpha1107",
    "marginnote_version_min": "3.7.11",
    "cert_key": ""
}

// mntask/mnaddon.json
{
    "addonid": "marginnote.extension.mntask",
    "author": "xiakangwei",
    "title": "MN Task",
    "version": "0.16.3",
    "marginnote_version_min": "3.7.11",
    "cert_key": ""
}
```

---

## 🔧 CORE API SYSTEM - COMPLETE REFERENCE

### 1. JSBridge Plugin Creation Pattern

```javascript
// STANDARD PLUGIN TEMPLATE (15 lines minimum)
JSB.newAddon = () => {
  return JSB.defineClass(
    "PluginName: JSExtension",  // Class declaration: Name + Parent
    {
      // === INSTANCE METHODS (per-window) ===

      sceneWillConnect() {
        // Window lifecycle: Initialize plugin when new MN window opens
        self.app = Application.sharedInstance();
        self.studyController = self.app.studyController(self.window);
      },

      notebookWillOpen(topicid) {
        // Notebook lifecycle: Setup when notebook opens
        this.setupEventListeners();
      },

      queryAddonCommandStatus() {
        // Plugin button configuration
        return {
          image: "logo_44x44.png",
          object: self,
          selector: "onButtonClick:",
          checked: self.isActive
        };
      },

      onButtonClick() {
        // Button click handler
        self.app.showHUD("Hello MarginNote!", self.window, 2);
      },

      notebookWillClose(topicid) {
        // Cleanup: Remove event listeners
        this.cleanupEventListeners();
      },

      sceneDidDisconnect() {
        // Window cleanup: Release resources
        self.app = null;
        self.studyController = null;
      }
    },
    {
      // === STATIC METHODS (class-level) ===

      addonDidConnect() {
        // Plugin installation/activation lifecycle
      },

      addonWillDisconnect() {
        // Plugin removal/deactivation lifecycle
      }
    }
  );
};
```

### 2. The `self` Object - Critical Concept

**CRITICAL**: `self` refers to the plugin **instance** (Objective-C object), NOT JavaScript's global object.

```javascript
// ✅ CORRECT: Instance data attached to self
sceneWillConnect() {
  self.windowData = {
    notebookId: null,
    isActive: false,
    cache: new Map()
  };
}

// ❌ WRONG: JavaScript variables are shared across all windows
sceneWillConnect() {
  let windowData = { notebookId: null };  // All windows share this!
}

// ⚠️ MULTI-WINDOW AWARENESS
// MarginNote supports multiple windows
// Each window has its own plugin instance (separate `self`)
// JavaScript variables are global across all instances
// ALWAYS attach window-specific data to `self`
```

### 3. Lifecycle Events - Complete Reference

#### Window Lifecycle (per MN window)

```javascript
sceneWillConnect() {
  // WHEN: New MarginNote window opens
  // USE: Initialize plugin instance for this window
  // CRITICAL: First lifecycle method called
}

sceneDidDisconnect() {
  // WHEN: MarginNote window closes
  // USE: Clean up resources, remove listeners
  // CRITICAL: Last lifecycle method called
}

sceneWillResignActive() {
  // WHEN: Window loses focus (background)
  // USE: Pause operations, save state
}

sceneDidBecomeActive() {
  // WHEN: Window regains focus (foreground)
  // USE: Resume operations, refresh UI
}
```

#### Notebook Lifecycle (per notebook)

```javascript
notebookWillOpen(topicid) {
  // WHEN: User opens a notebook
  // PARAMS: topicid (string) - Notebook UUID
  // USE: Setup notebook-specific features
  // COMMON: Register event listeners here
}

notebookWillClose(topicid) {
  // WHEN: User closes a notebook
  // PARAMS: topicid (string) - Notebook UUID
  // USE: Save state, remove event listeners
  // CRITICAL: Clean up to prevent memory leaks
}
```

#### Document Lifecycle (per PDF/EPUB)

```javascript
documentDidOpen(docmd5) {
  // WHEN: User opens a document
  // PARAMS: docmd5 (string) - Document MD5 hash
  // USE: Setup document-specific features
}

documentWillClose(docmd5) {
  // WHEN: User closes a document
  // PARAMS: docmd5 (string) - Document MD5 hash
  // USE: Save document state, cleanup
}
```

### 4. Event System - NSNotificationCenter

#### Event Registration Pattern

```javascript
// ADD EVENT LISTENER
notebookWillOpen(topicid) {
  NSNotificationCenter.defaultCenter().addObserverSelectorName(
    self,                          // Observer object
    "onProcessNewExcerpt:",       // Handler method (NOTE: colon required!)
    "ProcessNewExcerpt"           // Event name
  );
}

// REMOVE EVENT LISTENER (CRITICAL!)
notebookWillClose(topicid) {
  NSNotificationCenter.defaultCenter().removeObserverName(
    self,
    "ProcessNewExcerpt"
  );
}

// EVENT HANDLER (method name MUST match selector)
onProcessNewExcerpt(sender) {
  const noteid = sender.userInfo.noteid;
  const note = MNNote.getFocusNote();
  // Process the newly created excerpt
}
```

#### Core Event Types

```javascript
// === EXCERPT EVENTS ===
"ProcessNewExcerpt"           // PDF excerpt created
  // userInfo.noteid → Note ID

"ChangeExcerptRange"          // Excerpt range modified
  // userInfo.noteid → Note ID

// === MENU EVENTS ===
"PopupMenuOnNote"            // Context menu on note card
  // userInfo.note → MbBookNote object

"ClosePopupMenuOnNote"       // Note context menu closed

"PopupMenuOnSelection"       // Context menu on selected text
  // userInfo.documentController.selectionText → Selected text string

"ClosePopupMenuOnSelection"  // Text selection menu closed

// === OCR EVENTS ===
"OCRImageBegin"              // OCR process started
"OCRImageEnd"                // OCR process completed

// === URL SCHEME ===
"AddonBroadcast"             // URL scheme triggered
  // Format: marginnote3app://addon/[addonid]?params
  // userInfo.message → URL parameters
```

### 5. Application API - Central Control

```javascript
const app = Application.sharedInstance();

// === PROPERTIES ===
app.appVersion                    // "4.0.1" - MarginNote version
app.currentTheme                  // 0=Light, 1=Dark, 2=Auto
app.focusWindow                   // Current active window
app.osType                        // 0=macOS, 1=iOS/iPadOS

// === METHODS ===
app.studyController(window)       // Get study controller for window
app.showHUD(message, view, duration) // Show toast notification
app.alert(message)                // Show alert dialog
app.openURL(url)                  // Open URL in browser/app
app.checkNetworkStatus()          // Check internet connectivity
```

### 6. StudyController - UI Control

```javascript
const studyController = app.studyController(self.window);

// === PROPERTIES ===
studyController.studyMode         // 0=Doc, 1=MindMap, 2=Outline, 3=Review
studyController.notebookController // Notebook controller
studyController.readerController   // Document reader controller
studyController.view              // Main study view (UIView)

// === METHODS ===
studyController.refreshAddonCommands()  // Refresh plugin button state
studyController.becomeFirstResponder()  // Set as first responder
studyController.focusNoteInMindMapById(noteid) // Focus note in mind map
```

### 7. Database API - Data Access

```javascript
const db = Database.sharedInstance();

// === CORE METHODS ===
db.getNotebookById(topicid)       // Get MbTopic (notebook) object
db.getMediaByHash(hash)           // Get media file (NSData) by hash
db.getNoteById(noteid)            // Get MbBookNote object
db.refreshAfterDBChanged(topicid) // Refresh UI after data changes
```

---

## 📝 DATA MODELS - COMPLETE REFERENCE

### MbBookNote (Note/Card Object)

```javascript
// === CREATE NOTE ===
const note = Note.createWithTitleNotebookDocument(
  "Note Title",        // string - Note title
  notebook,            // MbTopic - Notebook object
  document             // MbBook - Document object
);

// === WRITABLE PROPERTIES ===
note.noteTitle = "New Title";        // string - Note title
note.excerptText = "Text content";   // string - Excerpt text
note.colorIndex = 3;                 // number (0-15) - Color
note.fillIndex = 1;                  // number (0-2) - Fill pattern
note.groupNoteId = "parent-id";      // string - Parent note ID

// === READ-ONLY PROPERTIES ===
note.noteId                          // string (UUID) - Unique identifier
note.docMd5                          // string - Document MD5 hash
note.notebookId                      // string (UUID) - Notebook ID
note.createDate                      // Date - Creation timestamp
note.modifiedDate                    // Date - Last modified timestamp
note.parentNote                      // MbBookNote - Parent note (if child)
note.childNotes                      // Array<MbBookNote> - Child notes
note.linkedNotes                     // Array<MbBookNote> - Linked notes
note.comments                        // Array<Comment> - Note comments
note.excerptPic                      // Object - Excerpt image data
note.mediaList                       // string - Media hashes ("-" separated)

// === METHODS ===
note.clearFormat()                   // Clear text formatting
note.merge(otherNote)                // Merge with another note
note.appendTextComment(text)         // Add text comment
note.appendHtmlComment(html, text, size, tag) // Add HTML comment
note.appendNoteLink(linkedNote)      // Add note link
note.removeCommentByIndex(index)     // Remove comment by index
note.focusInMindMap()                // Focus this note in mind map
note.clone()                         // Clone note
```

### Comment System

```javascript
// === COMMENT TYPES ===
{
  type: "TextNote",      // Plain text comment
  text: "Comment text",
  noteid: null           // Only set for merged comments
}

{
  type: "HtmlNote",      // HTML formatted comment
  text: "HTML content",
  noteid: null
}

{
  type: "LinkNote",      // Merged note reference
  text: "Merged content",
  noteid: "merged-note-id"  // ID of merged note
}

{
  type: "PaintNote",     // Image/Drawing comment
  paint: "image-hash",   // Media hash
  noteid: null
}

// === ACCESSING COMMENTS ===
note.comments.forEach((comment, index) => {
  switch(comment.type) {
    case "TextNote":
      // Handle text comment
      break;
    case "PaintNote":
      // Get image data
      const imageData = Database.sharedInstance()
        .getMediaByHash(comment.paint);
      break;
    case "LinkNote":
      // Get merged note
      const mergedNote = Database.sharedInstance()
        .getNoteById(comment.noteid);
      break;
  }
});
```

### Media Handling

```javascript
// === EXCERPT IMAGE ===
if (note.excerptPic && note.excerptPic.paint) {
  const imageData = Database.sharedInstance()
    .getMediaByHash(note.excerptPic.paint);

  // Convert to base64
  const base64 = imageData.base64Encoding();
}

// === MEDIA LIST (multiple media files) ===
if (note.mediaList) {
  const mediaHashes = note.mediaList.split("-");
  const mediaFiles = mediaHashes.map(hash =>
    Database.sharedInstance().getMediaByHash(hash)
  );
}

// === COMMENT IMAGES ===
note.comments
  .filter(c => c.type === "PaintNote" && c.paint)
  .forEach(comment => {
    const imageData = Database.sharedInstance()
      .getMediaByHash(comment.paint);
    // Process image
  });
```

---

## 🎨 MNUTILS FRAMEWORK - THE FOUNDATION

### Why MNUtils is Essential

MNUtils is the **core infrastructure** of the MN plugin ecosystem:

1. **Default Loading**: Automatically available in all plugins
2. **Complete API Wrapper**: 500+ methods covering all MN functionality
3. **Best Practices**: Battle-tested patterns from production plugins
4. **Lower Barrier**: No need to understand low-level Objective-C APIs

### File Structure

```
mnutils/
├── mnutils.js          # Core framework (8,439 lines, 500+ APIs)
├── xdyyutils.js        # Academic extensions (15,560 lines)
├── mnnote.js           # Note manipulation utilities
├── subfunc.js          # Subfunctions and helpers
├── sidebar.js          # Sidebar UI components
├── usage.js            # Usage tracking/analytics
├── MNUtils_API_Guide.md # Complete API documentation
└── CLAUDE.md           # Implementation details
```

### Initialization

```javascript
// CRITICAL: Initialize MNUtils in plugin
sceneWillConnect() {
  MNUtil.init(self.path);  // self.path = plugin directory
}
```

### Top 20 Most-Used APIs

```javascript
// === 1. HUD NOTIFICATIONS ===
MNUtil.showHUD("Message", 2);           // Show for 2 seconds
MNUtil.waitHUD("Loading...");           // Show indefinitely
MNUtil.stopHUD();                       // Hide HUD

// === 2. NOTE OPERATIONS ===
MNNote.getFocusNote();                  // Get currently focused note
MNNote.getSelectedNotes();              // Get all selected notes
MNNote.new("Title", "Text", notebook); // Create new note
MNNote.clone(note);                     // Clone note with children

// === 3. NOTEBOOK ACCESS ===
MNUtil.currentNotebook;                 // Current notebook object
MNUtil.studyController();               // Get study controller
MNUtil.getDocumentController();         // Get document controller

// === 4. CLIPBOARD OPERATIONS ===
MNUtil.copy("Text");                    // Copy to clipboard
MNUtil.paste();                         // Get clipboard text
MNUtil.copyJSON(object);                // Copy object as JSON

// === 5. USER INTERACTION ===
MNUtil.select("Title", ["Option 1", "Option 2"])
  .then(index => {
    // index: 0=canceled, 1=Option 1, 2=Option 2
  });

MNUtil.input("Title", "Placeholder", "Default")
  .then(text => {
    // User input text
  });

MNUtil.confirm("Title", "Message")
  .then(confirmed => {
    // boolean: true/false
  });

// === 6. DELAY/ASYNC ===
await MNUtil.delay(2);                  // Delay 2 seconds

// === 7. FILE OPERATIONS ===
MNUtil.readText("/path/to/file.txt");
MNUtil.writeText("/path/to/file.txt", "Content");
MNUtil.readJSON("/path/to/data.json");
MNUtil.writeJSON("/path/to/data.json", {key: "value"});

// === 8. UNDO GROUPING ===
MNUtil.undoGrouping(() => {
  // Multiple operations grouped as single undo action
  note1.noteTitle = "New Title 1";
  note2.noteTitle = "New Title 2";
});

// === 9. ERROR HANDLING ===
try {
  // Operations
} catch (error) {
  MNUtil.addErrorLog(error, "FunctionName", {context: "data"});
  MNUtil.showHUD("Error: " + error.message);
}

// === 10. LOGGING ===
MNUtil.log({
  source: "PluginName",
  message: "Operation completed",
  level: "INFO",  // INFO, ERROR, DEBUG
  detail: {
    noteId: note.noteId,
    count: 42
  }
});

// === 11. COLOR & STYLE ===
MNNote.setColor(note, 3);              // Set color (0-15)
MNNote.setFill(note, 1);               // Set fill pattern (0-2)

// === 12. HIERARCHY OPERATIONS ===
MNNote.getAncestorNotes(note);         // Get all ancestors
MNNote.getDescendantNotes(note);       // Get all descendants
MNNote.getSiblingNotes(note);          // Get sibling notes

// === 13. TEXT PROCESSING ===
MNUtil.MD5("text");                    // MD5 hash
MNUtil.genUUID();                      // Generate UUID
MNUtil.strCode("字符串");              // Calculate display width

// === 14. NOTIFICATION ===
MNUtil.postNotification("EventName", {
  noteId: note.noteId,
  action: "completed"
});

// === 15. VIEW ACCESS ===
MNUtil.studyView;                      // Main study view
MNUtil.readerView;                     // Document reader view

// === 16. CONFIGURATION ===
NSUserDefaults.standardUserDefaults()
  .setObjectForKey(data, "plugin_config");
NSUserDefaults.standardUserDefaults()
  .objectForKey("plugin_config");

// === 17. BATCH OPERATIONS ===
MNNote.batchUpdateNotes([note1, note2, note3], (note) => {
  note.colorIndex = 5;
  return note;
});

// === 18. SEARCH ===
MNUtil.searchNotesByTitle("keyword");
MNUtil.searchNotesByContent("text");

// === 19. EXPORT ===
MNUtil.exportNotesToMarkdown([note1, note2]);
MNUtil.copyNotesToClipboard([note1, note2]);

// === 20. MEDIA ===
MNUtil.getMediaByHash("hash");         // Get media file
MNUtil.saveMedia(imageData, "file.png"); // Save media
```

---

## 🎯 BEST PRACTICES & PATTERNS

### 1. Plugin Architecture Patterns

#### Single-File Plugin (Simple)

```javascript
// GoToPage plugin example (150 lines)
JSB.newAddon = () => {
  return JSB.defineClass("GoToPage: JSExtension", {
    // All logic in one file
    sceneWillConnect() { /* ... */ },
    notebookWillOpen(topicid) { /* ... */ },
    onButtonClick() { /* ... */ }
  });
};
```

#### Multi-Controller Architecture (Complex)

```javascript
// MNTask plugin pattern (3000+ lines across 15 files)
// main.js - Entry point + lifecycle coordination
JSB.newAddon = () => {
  JSB.require('utils');
  JSB.require('webviewController');
  JSB.require('settingController');

  return JSB.defineClass("MNTask: JSExtension", {
    sceneWillConnect() {
      self.controllerManager = {
        webview: null,
        settings: null
      };
    },

    notebookWillOpen(topicid) {
      this.ensureControllers();
    },

    ensureControllers() {
      if (!self.controllerManager.webview) {
        self.controllerManager.webview = webviewController.new();
        self.controllerManager.webview.mainController = self;
      }
    }
  });
};

// webviewController.js - WebView UI management
var webviewController = JSB.defineClass(
  'webviewController: UIViewController',
  {
    viewDidLoad() {
      this.setupWebView();
    },

    setupWebView() {
      this.webView = UIWebView.new();
      // WebView setup
    }
  }
);
```

### 2. Event Handling Patterns

```javascript
// PATTERN 1: Standard Event Registration
class EventManager {
  constructor(pluginInstance) {
    this.plugin = pluginInstance;
    this.observers = [];
  }

  registerEvents() {
    const center = NSNotificationCenter.defaultCenter();

    const observer1 = center.addObserverSelectorName(
      this.plugin,
      "onExcerpt:",
      "ProcessNewExcerpt"
    );
    this.observers.push(observer1);

    const observer2 = center.addObserverSelectorName(
      this.plugin,
      "onMenu:",
      "PopupMenuOnNote"
    );
    this.observers.push(observer2);
  }

  unregisterEvents() {
    const center = NSNotificationCenter.defaultCenter();
    this.observers.forEach(obs => center.removeObserver(obs));
    this.observers = [];
  }
}

// Usage
notebookWillOpen(topicid) {
  self.eventManager = new EventManager(self);
  self.eventManager.registerEvents();
}

notebookWillClose(topicid) {
  self.eventManager.unregisterEvents();
}
```

### 3. Data Persistence Patterns

```javascript
// PATTERN: Configuration Manager
class ConfigManager {
  constructor(pluginName) {
    this.pluginName = pluginName;
    this.configKey = `${pluginName}_config`;
  }

  getConfig(key, defaultValue = null) {
    const configStr = NSUserDefaults.standardUserDefaults()
      .objectForKey(this.configKey);
    if (!configStr) return defaultValue;

    const config = JSON.parse(configStr);
    return key ? (config[key] || defaultValue) : config;
  }

  setConfig(key, value) {
    let config = this.getConfig() || {};

    if (typeof key === 'object') {
      config = { ...config, ...key };  // Batch set
    } else {
      config[key] = value;             // Single set
    }

    const configStr = JSON.stringify(config);
    NSUserDefaults.standardUserDefaults()
      .setObjectForKey(configStr, this.configKey);
    NSUserDefaults.standardUserDefaults().synchronize();
  }

  removeConfig(key) {
    const config = this.getConfig() || {};
    delete config[key];
    this.setConfig(config);
  }
}

// Usage
const config = new ConfigManager("MyPlugin");
config.setConfig("theme", "dark");
const theme = config.getConfig("theme", "light");
```

### 4. Error Handling Patterns

```javascript
// PATTERN: Robust Error Handling
class PluginError extends Error {
  constructor(message, code, context) {
    super(message);
    this.code = code;
    this.context = context;
    this.timestamp = new Date();
  }
}

function withErrorHandling(fn, context = {}) {
  return function(...args) {
    try {
      return fn.apply(this, args);
    } catch (error) {
      // Log to MNUtils
      MNUtil.log({
        source: context.source || "Unknown",
        message: error.message,
        level: "ERROR",
        detail: {
          stack: error.stack,
          context: context,
          timestamp: new Date()
        }
      });

      // Copy error to clipboard for debugging
      MNUtil.copyJSON({
        error: error.toString(),
        stack: error.stack,
        context: context
      });

      // Show user-friendly message
      MNUtil.showHUD(`Error: ${error.message}`);

      // Optionally re-throw
      if (context.fatal) throw error;
    }
  };
}

// Usage
const safeProcessNote = withErrorHandling(
  function(note) {
    if (!note) throw new PluginError("Note is null", "NULL_NOTE", {});
    // Process note
  },
  { source: "NoteProcessor", fatal: false }
);
```

### 5. UI Patterns

```javascript
// PATTERN: Floating Panel with Drag Support
class FloatingPanel {
  constructor(title, content) {
    this.title = title;
    this.content = content;
    this.view = null;
  }

  create() {
    // Create container
    const panel = UIView.new();
    panel.frame = {x: 100, y: 100, width: 200, height: 150};
    panel.backgroundColor = UIColor.whiteColor()
      .colorWithAlphaComponent(0.95);
    panel.layer.cornerRadius = 12;
    panel.layer.shadowOpacity = 0.3;
    panel.layer.shadowRadius = 8;

    // Add title bar
    const titleBar = this.createTitleBar();
    panel.addSubview(titleBar);

    // Add content
    const contentView = this.createContent();
    panel.addSubview(contentView);

    // Add drag gesture
    this.addDragGesture(panel);

    // Add to view hierarchy
    MNUtil.studyView.addSubview(panel);
    this.view = panel;

    return panel;
  }

  createTitleBar() {
    const titleBar = UIView.new();
    titleBar.frame = {x: 0, y: 0, width: 200, height: 30};

    const label = UILabel.new();
    label.text = this.title;
    label.frame = {x: 10, y: 5, width: 150, height: 20};
    label.font = UIFont.boldSystemFontOfSize(14);
    titleBar.addSubview(label);

    const closeBtn = UIButton.buttonWithType(0);
    closeBtn.frame = {x: 170, y: 5, width: 20, height: 20};
    closeBtn.setTitleForState("×", 0);
    closeBtn.addTargetActionForControlEvents(
      this, "close", 1 << 6
    );
    titleBar.addSubview(closeBtn);

    return titleBar;
  }

  addDragGesture(view) {
    const panGesture = new UIPanGestureRecognizer(this, "handlePan:");
    view.addGestureRecognizer(panGesture);
  }

  handlePan(gesture) {
    const translation = gesture.translationInView(this.view.superview);
    const state = gesture.state;

    if (state === 2) { // Dragging
      const center = {
        x: this.view.center.x + translation.x,
        y: this.view.center.y + translation.y
      };
      this.view.center = center;
      gesture.setTranslationInView({x: 0, y: 0}, this.view.superview);
    }
  }

  close() {
    if (this.view) {
      this.view.removeFromSuperview();
      this.view = null;
    }
  }
}
```

---

## ⚠️ CRITICAL PITFALLS & SOLUTIONS

### 1. Multi-Window Data Isolation

```javascript
// ❌ WRONG: JavaScript variable shared across all windows
let pluginData = { isActive: false };

sceneWillConnect() {
  pluginData.isActive = true;  // AFFECTS ALL WINDOWS!
}

// ✅ CORRECT: Data attached to self (window-specific instance)
sceneWillConnect() {
  self.pluginData = { isActive: false };  // ONLY THIS WINDOW
}
```

### 2. Event Listener Memory Leaks

```javascript
// ❌ WRONG: Forgot to remove listeners
notebookWillOpen(topicid) {
  NSNotificationCenter.defaultCenter().addObserverSelectorName(
    self, "onExcerpt:", "ProcessNewExcerpt"
  );
  // Missing cleanup!
}

// ✅ CORRECT: Always cleanup listeners
notebookWillOpen(topicid) {
  self.observers = [];
  const observer = NSNotificationCenter.defaultCenter()
    .addObserverSelectorName(self, "onExcerpt:", "ProcessNewExcerpt");
  self.observers.push(observer);
}

notebookWillClose(topicid) {
  const center = NSNotificationCenter.defaultCenter();
  self.observers.forEach(obs => center.removeObserver(obs));
  self.observers = [];
}
```

### 3. Selector Method Name Errors

```javascript
// ❌ WRONG: Forgot colon in selector
NSNotificationCenter.defaultCenter().addObserverSelectorName(
  self,
  "onExcerpt",         // Missing ":"
  "ProcessNewExcerpt"
);

// ✅ CORRECT: Include colon
NSNotificationCenter.defaultCenter().addObserverSelectorName(
  self,
  "onExcerpt:",        // Colon required!
  "ProcessNewExcerpt"
);

// Handler method signature MUST match
onExcerpt(sender) {    // NO colon in method definition
  // Handle event
}
```

### 4. Undefined Values in NSUserDefaults

```javascript
// ❌ WRONG: undefined causes crashes
const config = {
  theme: "dark",
  fontSize: undefined  // CRASH!
};
NSUserDefaults.standardUserDefaults().setObjectForKey(config, "key");

// ✅ CORRECT: Remove undefined values
function sanitizeConfig(config) {
  return Object.fromEntries(
    Object.entries(config)
      .filter(([_, value]) => value !== undefined)
  );
}

const safeConfig = sanitizeConfig(config);
NSUserDefaults.standardUserDefaults().setObjectForKey(safeConfig, "key");
```

### 5. Note Property Null Safety

```javascript
// ❌ WRONG: Direct access without null check
const text = note.excerptText.trim();  // CRASH if null!

// ✅ CORRECT: Always check for null
const text = note.excerptText ? note.excerptText.trim() : "";

// ✅ BETTER: Use optional chaining (if supported)
const text = note.excerptText?.trim() || "";
```

### 6. Lifecycle Method Placement

```javascript
// ❌ WRONG: Methods in prototype can't be bound to selectors
JSB.defineClass("Plugin: JSExtension", {
  sceneWillConnect() {
    // Setup
  }
}, {
  // Methods here CAN'T be bound to UI events
  onButtonClick() {  // Won't work!
    MNUtil.showHUD("Clicked");
  }
});

// ✅ CORRECT: Instance methods can be bound
JSB.defineClass("Plugin: JSExtension", {
  sceneWillConnect() {
    // Setup
  },

  onButtonClick() {  // Works!
    MNUtil.showHUD("Clicked");
  }
});
```

---

## 🚀 DEVELOPMENT WORKFLOW

### Local Development Setup

```bash
# 1. Clone repository
git clone https://github.com/xkwxdyy/MN-Addons.git
cd MN-Addons

# 2. Create plugin directory
mkdir MyPlugin
cd MyPlugin

# 3. Create mnaddon.json
cat > mnaddon.json << EOF
{
  "addonid": "marginnote.extension.myplugin",
  "author": "Your Name",
  "title": "My Plugin",
  "version": "1.0.0",
  "marginnote_version_min": "3.7.11"
}
EOF

# 4. Create main.js
# (See template above)

# 5. Build plugin (if using mnaddon4 tool)
mnaddon4 build MyPlugin

# 6. Install to MarginNote
# Path: ~/Library/Containers/com.marginnote.MarginNote4/Data/Library/Application Support/marginnote4/addons/
# Or double-click .mnaddon file
```

### Development Mode (Live Reload)

```bash
# Create symlink for development
ln -s /path/to/MN-Addons/MyPlugin \
  ~/Library/Containers/com.marginnote.MarginNote4/Data/Library/Application\ Support/marginnote4/addons/MyPlugin.mnaddon

# Edit files → Restart MN → See changes
```

### Debugging Techniques

```javascript
// 1. Console Logging (appears in Console.app)
JSB.log("plugin-myplugin %@", object);

// 2. MNUtil Structured Logging
MNUtil.log({
  source: "MyPlugin:FunctionName",
  message: "Debug info",
  detail: { variable: value }
});

// 3. Visual Debugging with HUD
MNUtil.showHUD(`Debug: ${JSON.stringify(data)}`);

// 4. Copy to Clipboard for Inspection
MNUtil.copyJSON(complexObject);

// 5. Error Auto-Copy (from MNUtils framework)
try {
  // Code
} catch (error) {
  MNUtil.addErrorLog(error, "FunctionName", context);
  // Error automatically copied to clipboard
}
```

---

## 📚 PLUGIN EXAMPLES - REAL-WORLD PATTERNS

### Example 1: GoToPage (Simple Plugin)

```javascript
// File: GoToPage/main.js (150 lines total)
JSB.newAddon = () => {
  return JSB.defineClass("GoToPage: JSExtension", {
    sceneWillConnect() {
      self.app = Application.sharedInstance();
    },

    queryAddonCommandStatus() {
      return {
        image: "logo.png",
        object: self,
        selector: "toggleAddon:",
        checked: false
      };
    },

    toggleAddon() {
      const studyController = self.app.studyController(self.window);
      const doc = studyController.readerController.currentDocumentController;

      MNUtil.input("Go to Page", "Enter page number", "1")
        .then(pageNum => {
          if (pageNum) {
            const page = parseInt(pageNum) - 1;
            doc.setPage(page);
          }
        });
    }
  });
};
```

### Example 2: MNTask (Complex Multi-File Plugin)

```javascript
// File: mntask/main.js (Entry point)
JSB.newAddon = () => {
  JSB.require('utils');
  JSB.require('app');
  JSB.require('webviewController');

  return JSB.defineClass("MNTask: JSExtension", {
    sceneWillConnect() {
      self.app = Application.sharedInstance();
      self.studyController = self.app.studyController(self.window);
      self.controllers = {};
    },

    notebookWillOpen(topicid) {
      self.notebookId = topicid;
      this.initializeControllers();
      this.setupEventListeners();
    },

    initializeControllers() {
      if (!self.controllers.webview) {
        self.controllers.webview = webviewController.new();
        self.controllers.webview.mainController = self;
        self.controllers.webview.load();
      }
    },

    setupEventListeners() {
      const center = NSNotificationCenter.defaultCenter();
      self.observers = [];

      const obs1 = center.addObserverSelectorName(
        self,
        "onProcessNewTask:",
        "ProcessNewExcerpt"
      );
      self.observers.push(obs1);
    },

    onProcessNewTask(sender) {
      const noteid = sender.userInfo.noteid;
      const note = Database.sharedInstance().getNoteById(noteid);

      // Delegate to app logic
      taskApp.processNewTask(note);
    },

    notebookWillClose(topicid) {
      const center = NSNotificationCenter.defaultCenter();
      self.observers.forEach(obs => center.removeObserver(obs));
      self.observers = [];

      if (self.controllers.webview) {
        self.controllers.webview.cleanup();
      }
    }
  });
};

// File: mntask/webviewController.js (WebView UI)
var webviewController = JSB.defineClass(
  'webviewController: UIViewController',
  {
    load() {
      this.webView = UIWebView.new();
      this.webView.frame = this.calculateFrame();

      const htmlPath = self.path + "/index.html";
      const url = NSURL.fileURLWithPath(htmlPath);
      this.webView.loadRequest(NSURLRequest.requestWithURL(url));

      MNUtil.studyView.addSubview(this.webView);
    },

    calculateFrame() {
      const bounds = MNUtil.studyView.bounds;
      return {
        x: 20,
        y: 100,
        width: bounds.width - 40,
        height: 400
      };
    },

    cleanup() {
      if (this.webView) {
        this.webView.removeFromSuperview();
        this.webView = null;
      }
    }
  }
);

// File: mntask/app.js (Business Logic)
var taskApp = {
  processNewTask(note) {
    // Parse task from note
    const task = this.parseTask(note);

    // Update UI
    this.updateTaskBoard(task);

    // Save to storage
    this.saveTask(task);
  },

  parseTask(note) {
    return {
      id: note.noteId,
      title: note.noteTitle,
      content: note.excerptText,
      dueDate: this.extractDueDate(note),
      priority: this.extractPriority(note)
    };
  },

  // ... more methods
};
```

---

## 🔐 SECURITY & PERFORMANCE

### Security Best Practices

```javascript
// 1. Validate User Input
function validatePageNumber(input) {
  const num = parseInt(input);
  if (isNaN(num) || num < 1 || num > 10000) {
    throw new Error("Invalid page number");
  }
  return num;
}

// 2. Sanitize File Paths
function validateFilePath(path) {
  // Prevent directory traversal
  if (path.includes("..") || path.includes("~")) {
    throw new Error("Invalid file path");
  }
  return path;
}

// 3. Secure API Key Storage
// ❌ WRONG: Hardcoded API keys
const API_KEY = "sk-xxxxxxxxxxxxx";

// ✅ CORRECT: Store in NSUserDefaults (encrypted by OS)
function getAPIKey() {
  return NSUserDefaults.standardUserDefaults()
    .objectForKey("plugin_api_key");
}

function setAPIKey(key) {
  NSUserDefaults.standardUserDefaults()
    .setObjectForKey(key, "plugin_api_key");
}

// 4. Validate Note Objects
function processNote(note) {
  if (!note || !note.noteId) {
    throw new Error("Invalid note object");
  }
  // Safe to process
}
```

### Performance Optimization

```javascript
// 1. Batch Operations
// ❌ SLOW: Individual operations
notes.forEach(note => {
  note.colorIndex = 3;
  // Triggers UI update for each note
});

// ✅ FAST: Batch with undoGrouping
MNUtil.undoGrouping(() => {
  notes.forEach(note => {
    note.colorIndex = 3;
  });
  // Single UI update at end
});

// 2. Debounce Frequent Operations
function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

const debouncedSave = debounce(() => {
  // Save operation
}, 1000);

// 3. Cache Expensive Computations
class NoteCache {
  constructor() {
    this.cache = new WeakMap();
  }

  get(note, key, compute) {
    let noteCache = this.cache.get(note);
    if (!noteCache) {
      noteCache = {};
      this.cache.set(note, noteCache);
    }

    if (!(key in noteCache)) {
      noteCache[key] = compute(note);
    }

    return noteCache[key];
  }
}

// 4. Avoid Main Thread Blocking
async function processLargeDataset(notes) {
  const batchSize = 50;

  for (let i = 0; i < notes.length; i += batchSize) {
    const batch = notes.slice(i, i + batchSize);
    await processBatch(batch);
    await MNUtil.delay(0.1); // Allow UI updates
  }
}
```

---

## 🎓 LEARNING PATH FOR AI COPILOT

### Understanding Priority

**When helping users develop MarginNote plugins, prioritize**:

1. **MNUtils Framework** → Most plugins should use this (500+ APIs)
2. **Plugin Lifecycle** → Understand window/notebook/document lifecycle
3. **Event System** → NSNotificationCenter pattern is core
4. **Data Models** → MbBookNote structure is fundamental
5. **Multi-Window** → Always attach data to `self`, not globals

### Common User Requests & Solutions

#### "How do I get the currently selected note?"

```javascript
const note = MNNote.getFocusNote();
if (!note) {
  MNUtil.showHUD("Please select a note first");
  return;
}
```

#### "How do I process all notes in a notebook?"

```javascript
notebookWillOpen(topicid) {
  const notebook = Database.sharedInstance().getNotebookById(topicid);
  const allNotes = notebook.notes;

  MNUtil.undoGrouping(() => {
    allNotes.forEach(note => {
      // Process each note
    });
  });
}
```

#### "How do I create a floating panel?"

```javascript
// See FloatingPanel pattern in "UI Patterns" section above
```

#### "How do I call an API?"

```javascript
async function callAPI(url, data) {
  const request = NSMutableURLRequest.requestWithURL(
    NSURL.URLWithString(url)
  );
  request.setHTTPMethod("POST");
  request.setValue_forHTTPHeaderField("application/json", "Content-Type");

  const bodyData = NSString.stringWithString(JSON.stringify(data))
    .dataUsingEncoding(4);
  request.setHTTPBody(bodyData);

  return new Promise((resolve, reject) => {
    const session = NSURLSession.sharedSession();
    const task = session.dataTaskWithRequest_completionHandler(
      request,
      (data, response, error) => {
        if (error) {
          reject(error);
          return;
        }

        const responseString = NSString.alloc()
          .initWithData_encoding(data, 4);
        const result = JSON.parse(responseString);
        resolve(result);
      }
    );
    task.resume();
  });
}
```

---

## 📖 REFERENCE DOCUMENTATION LOCATIONS

### In Repository

```
MN-Addons/
├── CLAUDE.md                              # Development guidelines (Chinese)
├── JavaScript_for_MN_Beginners.md        # JS fundamentals
├── MarginNote4_Plugin_Development_Tutorial.md  # Tutorial Part 1
├── MarginNote4_Plugin_Tutorial_Part2.md  # Tutorial Part 2 (UI)
├── MarginNote4_Plugin_Tutorial_Part3.md  # Tutorial Part 3 (Advanced)
├── MarginNote4_Plugin_Tutorial_Part4.md  # Tutorial Part 4 (OCR)
├── MarginNote插件系统文档.md               # Official plugin system docs
├── MNGuide_DataStructure.md              # Data model reference
├── mnutils/MNUtils_API_Guide.md          # Complete MNUtils API docs
└── [Plugin]/CLAUDE.md                    # Plugin-specific docs
```

### External Resources

- **MarginNote Forum**: https://forum.marginnote.com/
- **Official Website**: https://www.marginnote.com/
- **GitHub Repository**: https://github.com/xkwxdyy/MN-Addons

---

## ✅ CODE GENERATION CHECKLIST

When generating MarginNote plugin code, ensure:

- [ ] **Always** extend `JSExtension` base class
- [ ] **Always** implement lifecycle methods correctly
- [ ] **Always** attach window-specific data to `self`
- [ ] **Always** cleanup event listeners in `notebookWillClose`
- [ ] **Always** use MNUtils APIs when available
- [ ] **Always** include colon (`:`) in selector names
- [ ] **Always** check for null before accessing note properties
- [ ] **Always** wrap batch operations in `MNUtil.undoGrouping()`
- [ ] **Always** validate user input
- [ ] **Never** use `undefined` in NSUserDefaults
- [ ] **Never** forget to remove event observers
- [ ] **Never** use global JavaScript variables for window-specific state

---

## 🎯 FINAL NOTES

This copilot instruction file represents a comprehensive analysis of the MN-Addons repository. Key insights:

1. **MNUtils is the backbone** - 500+ APIs, 8,439 lines of battle-tested code
2. **Lifecycle management is critical** - Proper cleanup prevents memory leaks
3. **Multi-window support is mandatory** - All plugins must handle multiple windows
4. **Event-driven architecture** - NSNotificationCenter is the primary communication mechanism
5. **JSBridge limitations** - No Node.js, limited Browser APIs, Objective-C bridging required

**For AI Code Generation**: Prioritize MNUtils framework methods over raw JSBridge calls. Most user needs can be solved with existing MNUtils APIs.

**For Developers**: Study the tutorial series (Parts 1-4) and MNUtils API Guide for comprehensive understanding. Reference existing plugins (MNTask, MNToolbar, MNOCR) for production-quality patterns.

---

## 📚 APPENDIX A: COMPLETE PLUGIN INVENTORY

### Analyzed Plugins (Deep Code Review)

Based on comprehensive source code analysis of 694 JavaScript files:

#### 1. **MNUtils** (Foundation Framework)
- **Version**: 0.2.1.alpha1107
- **Author**: Feliks
- **Files**: 8+ core files, 24,000+ lines total
- **Key Files**:
  - `mnutils.js` (8,439 lines) - Core 500+ API methods
  - `xdyyutils.js` (15,560 lines) - Academic extensions by 夏大鱼羊
  - `mnnote.js` - Note manipulation, link fixing, merge operations
  - `subfunc.js` - Helper functions
  - `sidebar.js` - Sidebar UI components
- **Dependencies**: CryptoJS, marked, pdf.js, highlight.js, mustache, segmentit, jsonrepair
- **Architecture**: Provides global `MNUtil`, `MNNote`, `MNLog` classes
- **Critical Features**:
  - 500+ utility methods (HUD, clipboard, file I/O, network, undo grouping)
  - Frame/Menu/Button helper classes
  - Advanced note operations (merge, link conversion, cleanup)
  - Markdown/HTML comment management

#### 2. **MNTask** (Task Management)
- **Version**: 0.16.3
- **Author**: xiakangwei (夏康威)
- **Files**: 15+ files, 3,000+ lines
- **Architecture Pattern**: Multi-controller with state management
- **Key Files**:
  - `main.js` (1,208 lines) - Lifecycle + module loading
  - `webviewController.js` - Task board WebView
  - `settingController.js` - Settings management
  - `xdyy_utils_extensions.js` - Core MNTaskManager class
  - `xdyy_menu_registry.js` - Custom menu templates
  - `xdyy_button_registry.js` - Button configuration
  - `xdyy_custom_actions_registry.js` - Custom action system
  - `xdyy_tag_trigger_system.js` - Tag-based automation
  - `logManager.js` - TaskLogManager logging
  - `pinyin.js` - Chinese pinyin support
- **Features**:
  - Kanban-style task board
  - Drag & drop task management
  - Custom actions and triggers
  - Tag-based automation
  - JSON editor integration

#### 3. **MNToolbar** (Customizable Toolbar)
- **Version**: 0.1.5.alpha1116
- **Author**: Feliks
- **Files**: 12+ files, 2,500+ lines
- **Architecture Pattern**: Dynamic toolbar with registry system
- **Key Files**:
  - `main.js` (1,211 lines) - Dynamic mode, event handling
  - `webviewController.js` - Toolbar WebView
  - `settingController.js` - Configuration UI
  - `xdyy_utils_extensions.js` - Extensions
  - `xdyy_menu_registry.js` - Menu system
  - `xdyy_button_registry.js` - Button system
  - `xdyy_custom_actions_registry.js` - Custom actions
  - `exportReferenceIds.json` - Button reference data
- **Features**:
  - Dynamic toolbar mode
  - Custom button configuration
  - Menu template system
  - Cloud configuration sync (iCloud)

#### 4. **MNBrowser** (Web Browser Integration)
- **Version**: 0.2.4.alpha1028
- **Author**: Feliks
- **Files**: 6+ files, 1,500+ lines
- **Architecture Pattern**: Embedded browser with custom URL schemes
- **Key Files**:
  - `main.js` (1,224 lines) - Browser embedding, mini mode
  - `webviewController.js` - Browser UI controller
  - `settingController.js` - Settings management
- **Features**:
  - Embedded web browser in MN
  - Mini mode (floating button)
  - Split screen support
  - Custom URL schemes
  - Watch mode for auto-excerpt
  - Search engine integration

#### 5. **MNWebDAV** (Cloud Sync)
- **Version**: 0.0.1.alpha0826
- **Author**: Feliks
- **Files**: 5+ files, 800+ lines
- **Architecture Pattern**: WebDAV protocol with XML parsing
- **Key Files**:
  - `main.js` (454 lines) - WebDAV sync logic
  - `webdav.js` - WebDAV protocol implementation
  - `fxp.js` - Fast XML parser
  - `webviewController.js` - UI controller
- **Features**:
  - WebDAV cloud synchronization
  - File upload/download
  - XML parsing for WebDAV responses
  - iCloud integration

#### 6. **MNKnowledgeBase** (Knowledge Search)
- **Version**: 0.33
- **Author**: Kangwei Xia (夏康威)
- **Files**: 5+ files, 3,500+ lines
- **Architecture Pattern**: Search + classification system
- **Key Files**:
  - `main.js` (2,754 lines) - Complex search logic
  - `knowledgebaseWebController.js` - Search UI
  - `search.html` - Search interface
  - `comment-manager.html` - Comment management UI
- **Features**:
  - Pre-excerpt mode (预摘录模式)
  - Class auto-move (上课自动移动)
  - Search across notebooks
  - Comment classification
  - Text editing lifecycle tracking

#### 7. **MNLiterature** (Literature Management)
- **Version**: 2.0
- **Author**: Kangwei Xia
- **Files**: 10+ files, 2,000+ lines
- **Architecture Pattern**: Dual WebView (traditional + new)
- **Key Files**:
  - `main.js` (479 lines) - Plugin integration
  - `literatureWebController.js` - New web UI
  - `literatureIndexer.js` - Literature indexing
  - `literatureNoteParser.js` - Note parsing
  - `literature_plugin_integration.js` - Plugin hooks
  - `literature_standalone_ocr.js` - OCR features
  - `literatureManager.html` - Management interface
- **Features**:
  - Literature reference management
  - Indexing system
  - OCR integration
  - Note parsing
  - Next.js board UI (MNLiteratureBoard/)

#### 8. **MNPinner** (Pin/Bookmark System)
- **Version**: 2.5
- **Author**: Kangwei Xia
- **Files**: 4+ files, 1,200+ lines
- **Architecture Pattern**: Simple WebView with config export/import
- **Key Files**:
  - `main.js` (662 lines) - Well-documented Chinese comments
  - `webviewController.js` - Pinner UI
  - `utils.js` - Utilities
  - `index.html` - Main interface
- **Documentation**:
  - `CLAUDE.md` - Development guidelines
  - `用户指南_配置导入导出.md` - User guide (Chinese)
  - `CONFIG_DRIVEN_ARCHITECTURE.md` - Architecture docs
- **Features**:
  - Pin/bookmark notes
  - Configuration export/import
  - URL scheme support

#### 9. **MNEditor** (Text Editor)
- **Version**: 0.0.3
- **Author**: Feliks
- **Features**: Text editing enhancements

#### 10. **MNExcalidraw** (Diagramming)
- **Version**: 0.0.1
- **Author**: Linlifei
- **Features**: Excalidraw integration for diagrams

#### 11. **MNSnipaste** (Screenshot Integration)
- **Version**: 0.1.3.alpha1116
- **Author**: Feliks
- **Features**: Screenshot capture and annotation

#### 12. **MNTimer** (Time Tracking)
- **Version**: 0.0.3.alpha0910
- **Author**: Feliks
- **Features**: Study time tracking

#### 13. **MNTextHandler** (Text Processing)
- **Version**: 2.0
- **Author**: Linlifei and XiaKangWei
- **Features**: Advanced text processing

#### 14. **MNVideoPlayer** (Video Player)
- **Version**: 0.0.1.alpha1030
- **Author**: Feliks
- **Features**: Video playback with note-taking

#### 15. **MNOCR** (OCR Services)
- **Version**: 0.0.4.alpha1113
- **Author**: Feliks
- **Documentation**: `ocr_prompt.md` - OCR prompt engineering
- **Features**: OCR integration with multiple services

#### 16. **Monaco** (Code Editor)
- **Version**: 0.0.1.alpha0720
- **Author**: Feliks
- **Type Definitions**: `index.d.ts` - Monaco editor types
- **Features**: Monaco code editor embedding

#### 17. **GoToPage** (Simple Navigation)
- **Version**: 1.1.1
- **Author**: BigGrayVVolf
- **Files**: `main.js` (150 lines) - Minimal example
- **Features**: Quick page navigation
- **Note**: Excellent beginner example

---

## 📚 APPENDIX B: COMMON ARCHITECTURE PATTERNS

### Pattern 1: Multi-File Plugin with Module Loading

**Used by**: MNTask, MNToolbar, MNBrowser

```javascript
// main.js - Entry point
JSB.newAddon = function (mainPath) {
  // Load dependencies
  JSB.require('utils')
  JSB.require('xdyy_utils_extensions')  // Core classes
  JSB.require('pinyin')  // Optional libraries

  // Check MNUtils availability
  if (!taskUtils.checkMNUtilsFolder(mainPath)) {
    return undefined
  }

  // Load controllers
  JSB.require('webviewController');
  JSB.require('settingController');

  // Load registries (after utils)
  try {
    JSB.require('xdyy_menu_registry')
    JSB.require('xdyy_button_registry')
    JSB.require('xdyy_custom_actions_registry')
  } catch (error) {
    if (typeof MNUtil !== 'undefined' && MNUtil.addErrorLog) {
      MNUtil.addErrorLog(error, "加载自定义扩展")
    }
  }

  // Define plugin class
  const MNPluginClass = JSB.defineClass(
    'MNPlugin : JSExtension',
    { /* instance methods */ },
    { /* static methods */ }
  );

  return MNPluginClass;
};
```

### Pattern 2: Simple Single-File Plugin

**Used by**: GoToPage, MNPinner (early versions)

```javascript
// main.js - Complete plugin in one file
JSB.newAddon = function(mainPath){
  JSB.require('utils');

  let MNPluginClass = JSB.defineClass('MNPlugin : JSExtension', {
    sceneWillConnect: function() {
      self.init(mainPath)
      // Simple initialization
    },

    queryAddonCommandStatus: function() {
      return {
        image: 'logo.png',
        object: self,
        selector: 'toggleAddon:',
        checked: self.toggled
      };
    },

    toggleAddon: async function(button) {
      // Simple toggle logic
    }
  });

  return MNPluginClass;
};
```

### Pattern 3: Dual WebView Controller Pattern

**Used by**: MNLiterature, MNKnowledgeBase

```javascript
// Maintain both old and new WebView controllers
JSB.require('webviewController');        // Traditional
JSB.require('literatureWebController');  // New version

sceneWillConnect: function() {
  // Save plugin instance for WebView access
  if (typeof MNLiteratureInstance === 'undefined') {
    global.MNLiteratureInstance = self
  }

  self.toggled = false
  self.ifFirst = true
}
```

### Pattern 4: Registry-Based Extension System

**Used by**: MNTask, MNToolbar

```javascript
// xdyy_button_registry.js - Button configuration
const buttonRegistry = {
  'action-name': {
    title: 'Button Title',
    icon: 'icon-name',
    handler: function(note) {
      // Button action
    }
  }
};

// xdyy_menu_registry.js - Menu templates
const menuRegistry = {
  'menu-name': {
    items: [
      { title: 'Item 1', action: 'action1' },
      { title: 'Item 2', action: 'action2' }
    ]
  }
};

// xdyy_custom_actions_registry.js - Custom actions
const actionRegistry = {
  'custom-action': function(context) {
    // Custom action logic
  }
};
```

### Pattern 5: Event Observer Management

**Best Practice Pattern**:

```javascript
sceneWillConnect: function() {
  // Store observers for cleanup
  self.observers = [];

  // Add observers
  MNUtil.addObserver(self, 'onPopupMenuOnNote:', 'PopupMenuOnNote')
  MNUtil.addObserver(self, 'onProcessNewExcerpt:', 'ProcessNewExcerpt')
  MNUtil.addObserver(self, 'onAddonBroadcast:', 'AddonBroadcast')
},

sceneDidDisconnect: function() {
  // Clean up all observers
  const names = [
    'PopupMenuOnNote',
    'ProcessNewExcerpt',
    'AddonBroadcast'
  ]
  self.removeObservers(names)  // Or use MNUtil.removeObservers(self, names)
}
```

### Pattern 6: Configuration Management with Cloud Sync

**Used by**: MNTask, MNToolbar, MNBrowser

```javascript
// Config with iCloud sync support
class PluginConfig {
  static init(mainPath) {
    this.mainPath = mainPath
    this.config = this.getConfig()

    // Listen for iCloud changes
    MNUtil.addObserver(
      self,
      'onCloudConfigChange:',
      'NSUbiquitousKeyValueStoreDidChangeExternallyNotificationUI'
    )
  }

  static getConfig() {
    return NSUserDefaults.standardUserDefaults()
      .objectForKey("PluginName_config") || this.defaultConfig
  }

  static save() {
    NSUserDefaults.standardUserDefaults()
      .setObjectForKey(this.config, "PluginName_config")
    NSUserDefaults.standardUserDefaults().synchronize()
  }

  static checkCloudStore() {
    // Sync with iCloud
    NSUbiquitousKeyValueStore.defaultStore().synchronize()
  }
}
```

---

## 📚 APPENDIX C: XDYYUTILS EXTENSIONS (夏大鱼羊)

The `xdyyutils.js` file (15,560 lines) provides critical academic workflow extensions.

### MNUtil Extensions

```javascript
// Check if object
MNUtil.isObj(obj)  // Returns boolean

// Link detection
MNUtil.isCommentLink(comment)  // Check if comment is a link
MNUtil.getLinkText(link)  // Extract link text

// Update Markdown links in note
MNUtil.updateMarkdownLinksInNote(note, oldURL, newURL)
// Updates all markdown comments containing oldURL to newURL
```

### MNNote Extensions

```javascript
// Find HTML comment containing text
note.getIncludingHtmlCommentIndex(htmlComment)  // Returns index or -1

// Delete note with options
note.delete(withDescendant = false)
// true: Delete entire subtree
// false: Move children to parent before deleting

// Convert marginnote3app:// links to marginnote4app://
note.convertLinksToNewVersion()

// Clean up broken links (targets don't exist)
note.cleanupBrokenLinks()

// Fix links after merge operations
note.fixMergeProblematicLinks()

// Advanced merge operation
note.mergeInto(targetNote, htmlType = "none")
// Merges this note into targetNote
// Updates all bidirectional links
// Converts title to HTML comment
// Fixes markdown inline links
```

### Link Comment Management

```javascript
// Get all link comment indices for a target
note.getLinkCommentsIndexArr(targetURL)  // Returns array of indices

// Replace comment with markdown
note.replaceWithMarkdownComment(newURL, commentIndex)

// Append markdown comment
note.appendMarkdownComment(text)

// Move comment to new position
note.moveComment(fromIndex, toIndex)
```

### Advanced Note Operations

```javascript
// Check if link is valid MN URL
url.ifValidNoteURL()  // Returns boolean

// Convert URL to note ID
url.toNoteId()  // "marginnote4app://note/ABC-123" → "ABC-123"

// Convert note ID to URL
noteId.toNoteURL()  // "ABC-123" → "marginnote4app://note/ABC-123"

// Remove bracket prefix from content
text.toNoBracketPrefixContent()  // "[prefix] content" → "content"
```

---

## 📚 APPENDIX D: TYPE DEFINITIONS REFERENCE

The repository includes comprehensive TypeScript definitions (`index.d.ts`, 3,407 lines).

### Key Type Definitions

```typescript
// NSData encoding types
declare const enum NSStringEncoding {
    ASCIIStringEncoding = 1,
    UTF8 = 4,
    UTF16BigEndian = 2415919360,
    UTF16LittleEndian = 2483028224,
    // ... 20+ encoding types
}

// NSData class
declare class NSData {
    static dataWithStringEncoding(string: string, encoding: NSStringEncoding): NSData;
    static dataWithContentsOfFile(path: string): NSData;
    static dataWithContentsOfURL(url: NSURL): NSData;

    length(): number;
    bytes(): number;
    base64Encoding(): string;
    writeToFileAtomically(path: string, useAuxiliaryFile: boolean): boolean;
}

// NSFileManager
declare const NSFileManager: {
    defaultManager(): NSFileManager;
};

declare type NSFileManager = {
    contentsOfDirectoryAtPath(path: string): string[];
    subpathsOfDirectoryAtPath(path: string): string[];
    fileExistsAtPath(path: string): boolean;
    isDirectoryAtPath(path: string): boolean;
    moveItemAtPathToPath(path: string, toPath: string): boolean;
    copyItemAtPathToPath(path: string, toPath: string): boolean;
};

// JSON serialization
declare const NSJSONSerialization: {
    isValidJSONObject(obj: NSData): boolean;
    JSONObjectWithDataOptions(data: NSData, options: NSJSONReadingOptions): any;
    dataWithJSONObjectOptions(obj: object, options: NSJSONWritingOptions): NSData;
};

// Locale support
declare const NSLocale: {
    currentLocale(): NSLocale;
    preferredLanguages(): string[];
    // ... extensive locale methods
};
```

---

**Document Version**: 2.0.0
**Last Updated**: 2025-01-24
**Repository**: https://github.com/xkwxdyy/MN-Addons
**Generated By**: Comprehensive deep analysis of MN-Addons codebase
**Analysis Scope**: 694 JavaScript files, 212 JSON files, 184 markdown files, 6 TypeScript definition files
**Total Lines Analyzed**: 30,000+ lines of production code across 15+ plugins
