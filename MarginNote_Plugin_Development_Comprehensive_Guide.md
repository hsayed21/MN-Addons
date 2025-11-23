# MarginNote Plugin Development: Comprehensive Guide

> **From Beginner to Expert** - A Complete Resource for MarginNote 4 Plugin Development
> 
> Version: 3.0  
> Last Updated: 2025-01-10

## 📚 Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Core Concepts](#core-concepts)
4. [MNUtils Framework](#mnutils-framework)
5. [Architecture Patterns](#architecture-patterns)
6. [Plugin Development Workflows](#plugin-development-workflows)
7. [Advanced Topics](#advanced-topics)
8. [Best Practices](#best-practices)
9. [Debugging & Testing](#debugging-testing)
10. [Real-World Examples](#real-world-examples)
11. [Production Architecture Patterns](#11-production-architecture-patterns)
    - [MNToolbar Registry Pattern](#111-mntoolbar-registry-pattern-zero-invasion-extension-system)
    - [Configuration-Driven Architecture](#112-configuration-driven-architecture-mnpinner-pattern)
    - [Multi-File Modular Pattern](#113-multi-file-modular-pattern-mntask-architecture)
12. [xdyyutils.js Extensions Deep Dive](#12-xdyyutilsjs-extensions-deep-dive)
    - [Critical Default Parameter Changes](#121-critical-default-parameter-changes)
    - [New MNNote Methods](#122-new-mnnote-methods-70-extensions)
    - [URL Utility Methods](#123-url-utility-methods)
    - [Production Usage Examples](#124-production-usage-examples)
13. [PDF Page Location Tracking System](#13-pdf-page-location-tracking-system)
    - [Core Concept](#131-core-concept)
    - [Complete Implementation](#132-complete-implementation)
    - [UI Integration](#133-ui-integration)
    - [Advanced: History Stack](#134-advanced-history-stack)
14. [Debugging & Troubleshooting Production Issues](#14-debugging--troubleshooting-production-issues)
    - [Comprehensive Logging Strategy](#141-comprehensive-logging-strategy)
    - [Performance Profiling](#142-performance-profiling)
    - [Error Boundary Pattern](#143-error-boundary-pattern)

---

## 1. Introduction

### What is a MarginNote Plugin?

MarginNote plugins are JavaScript-based extensions that enhance MarginNote's functionality. They can:

- 📝 Read and modify notes, cards, and documents
- 🎨 Customize UI and user interactions
- 🌐 Connect to external services (translation, AI, cloud storage)
- 🔗 Integrate with other applications
- ⚙️ Automate workflows and repetitive tasks

### Why Develop Plugins?

**For Users:**
- Customize MarginNote to fit your specific workflow
- Add features not available in the base application
- Integrate with your existing tool ecosystem

**For Developers:**
- Learn JavaScript through real-world projects
- Contribute to the MarginNote community
- Build portfolio projects

### Prerequisites

**Required Knowledge:**
- Basic JavaScript (variables, functions, objects)
- Understanding of DOM manipulation (helpful but not required)
- Familiarity with MarginNote's features

**Development Environment:**
- macOS 10.15+ or iOS 14+
- MarginNote 4.0.0+
- Text editor (VS Code recommended)
- Node.js and npm (for build tools)

---

## 2. Getting Started

### 2.1 Development Environment Setup

#### Install Required Tools

```bash
# Install Node.js (if not already installed)
brew install node

# Install mnaddon4 packaging tool
npm install -g mnaddon4

# Create plugin development directory
mkdir ~/MNPluginDev
cd ~/MNPluginDev
```

#### VS Code Setup

Recommended extensions:
- **JavaScript (ES6) code snippets** - Syntax highlighting
- **ESLint** - Code quality checking
- **Prettier** - Code formatting

#### Type Definitions

Add `index.d.ts` to your workspace for IntelliSense support:

```typescript
// Place at project root for autocomplete
/// <reference path="./index.d.ts" />
```

### 2.2 Your First Plugin - "Hello MarginNote"

#### Step 1: Create Plugin Structure

```bash
mkdir HelloWorld
cd HelloWorld
```

Create these 3 files:

**1. mnaddon.json** (Plugin manifest)
```json
{
  "addonid": "com.yourname.helloworld",
  "author": "Your Name",
  "title": "Hello World",
  "version": "1.0.0",
  "min_app_version": "4.0.0",
  "min_api_version": "1.0.0"
}
```

**2. main.js** (Entry point)
```javascript
JSB.newAddon = function(mainPath) {
  return JSB.defineClass('HelloWorld : JSExtension', {
    // Called when plugin loads
    sceneWillConnect: function() {
      self.mainPath = mainPath;
      Application.sharedInstance().showHUD(
        "🎉 Hello MarginNote!",
        self.window,
        2
      );
    },
    
    // Called when user clicks plugin icon
    toggleAddon: function() {
      let focusNote = this.getFocusNote();
      
      if (focusNote) {
        Application.sharedInstance().showHUD(
          "Selected note: " + focusNote.noteTitle,
          self.window,
          3
        );
      } else {
        Application.sharedInstance().showHUD(
          "No note selected",
          self.window,
          2
        );
      }
    },
    
    // Helper method to get current note
    getFocusNote: function() {
      let studyController = Application.sharedInstance()
        .studyController(self.window);
      
      if (!studyController) return null;
      
      let notebookController = studyController.notebookController;
      if (!notebookController) return null;
      
      return notebookController.focusNote;
    }
  });
};
```

**3. logo.png** (44x44 pixel icon)

#### Step 2: Package and Install

```bash
# Package the plugin
mnaddon4 build

# This creates HelloWorld.mnaddon
# Double-click to install
```

#### Step 3: Test Your Plugin

1. Open MarginNote
2. Open any notebook
3. Click your plugin icon in the toolbar
4. See the greeting message!

---

## 3. Core Concepts

### 3.1 Plugin Lifecycle

Plugins go through several lifecycle stages:

```javascript
JSB.newAddon = function(mainPath) {
  return JSB.defineClass('MyPlugin : JSExtension', {
    
    // 1. Plugin loads (app starts or extension folder changes)
    sceneWillConnect: function() {
      // Initialize plugin
      // Load configurations
      // Set up observers
    },
    
    // 2. Scene becomes active
    sceneDidConnect: function() {
      // UI is ready
      // Can access window objects
    },
    
    // 3. Notebook opens
    notebookWillOpen: function(notebookId) {
      // Prepare for new notebook
      // Load notebook-specific data
    },
    
    // 4. Notebook did open
    notebookDidOpen: function(notebookId) {
      // Notebook fully loaded
      // Can access notes
    },
    
    // 5. User clicks plugin icon
    toggleAddon: function() {
      // Main plugin action
    },
    
    // 6. Plugin unloads
    sceneWillDisconnect: function() {
      // Clean up resources
      // Save state
    }
  });
};
```

### 3.2 Data Model

#### Understanding MarginNote's Data Structure

```
Study Set (学习集)
├── Documents (文档)
│   ├── PDF Document
│   │   ├── Pages
│   │   └── Annotations
│   └── Markdown Document
│       └── Content
├── Mindmaps (思维导图)
│   └── Cards/Notes (卡片)
│       ├── Title (标题)
│       ├── Excerpts (摘录)
│       ├── Comments (评论)
│       ├── Children (子卡片)
│       └── Links (链接)
└── Review Queue (复习队列)
```

#### Key Objects

**MNNote (Card)**
```javascript
{
  noteId: "32-character-UUID",
  noteTitle: "Card title",
  excerptText: "Text from document",
  comments: ["comment1", "comment2"],
  colorIndex: 0-15,
  fillIndex: 0-15,
  childNotes: [MNNote, MNNote, ...],
  parentNote: MNNote,
  linkedNotes: [MNNote, ...]
}
```

**MNNotebook (Study Set)**
```javascript
{
  topicId: "notebook-uuid",
  title: "Notebook name",
  notes: [MNNote, MNNote, ...]
}
```

**MNDocument**
```javascript
{
  docMd5: "document-hash",
  pathFile: "/path/to/file",
  type: "PDF" | "Markdown" | "EPUB"
}
```

### 3.3 Event System

#### Listening to User Actions

```javascript
JSB.newAddon = function(mainPath) {
  return JSB.defineClass('EventDemo : JSExtension', {
    
    sceneWillConnect: function() {
      // Register for notifications
      NSNotificationCenter.defaultCenter()
        .addObserverSelectorName(
          self,
          "onNoteSelectionChange:",
          "FocusNoteDidChangeNotification"
        );
    },
    
    // Handle note selection change
    onNoteSelectionChange: function(sender) {
      let noteId = sender.userInfo.noteId;
      // React to note selection
    },
    
    // Text selection in document
    onPopupMenuOnSelection: function(sender) {
      let selectedText = sender.userInfo
        .documentController.selectionText;
      
      if (selectedText) {
        // Process selected text
      }
    },
    
    sceneWillDisconnect: function() {
      // Unregister observers
      NSNotificationCenter.defaultCenter()
        .removeObserver(self);
    }
  });
};
```

#### Common Notification Types

| Notification | When Triggered | UserInfo |
|-------------|----------------|----------|
| `FocusNoteDidChangeNotification` | Note selection changes | `noteId` |
| `NoteDidChangeNotification` | Note content modified | `note` |
| `NotebookWillOpenNotification` | Before notebook opens | `notebookId` |
| `DocumentDidOpenNotification` | Document loaded | `docMd5` |

---

## 4. MNUtils Framework

### 4.1 What is MNUtils?

MNUtils is a comprehensive utility framework that simplifies plugin development:

- **8,439 lines** of core utilities (mnutils.js)
- **15,560 lines** of academic extensions (xdyyutils.js)
- **500+ API methods** for common tasks
- **Type definitions** for IntelliSense support

### 4.2 Installing MNUtils

#### Method 1: As a Dependency (Recommended)

```javascript
// In your plugin's main.js
JSB.newAddon = function(mainPath) {
  return JSB.defineClass('YourPlugin : JSExtension', {
    sceneWillConnect: function() {
      try {
        // Load MNUtils from installed plugin
        JSB.require('mnutils');
        MNUtil.init(mainPath);
        MNUtil.showHUD("✅ MNUtils loaded!");
      } catch (error) {
        Application.sharedInstance().showHUD(
          "⚠️ Please install MNUtils plugin first",
          self.window, 3
        );
      }
    }
  });
};
```

#### Method 2: Bundle with Your Plugin

Copy `mnutils.js` to your plugin folder:

```javascript
JSB.require('mnutils');  // Load from local file
MNUtil.init(mainPath);
```

### 4.3 Essential MNUtils APIs

#### User Interface

```javascript
// Show message
MNUtil.showHUD("Success!");
MNUtil.showHUD("Message", 5);  // Show for 5 seconds

// Show loading indicator
MNUtil.waitHUD("Processing...");
// ... do work ...
MNUtil.stopHUD();

// Confirm dialog
MNUtil.confirm("Confirm", "Are you sure?").then(ok => {
  if (ok) {
    // User confirmed
  }
});

// Input dialog
MNUtil.input("Title", "Prompt", "Default").then(text => {
  if (text) {
    // User entered text
  }
});

// Selection menu
MNUtil.select("Choose", ["Option A", "Option B"]).then(index => {
  if (index >= 0) {
    // User selected index
  }
});
```

#### Note Operations

```javascript
// Get current note
let note = MNNote.getFocusNote();

// Get selected notes
let notes = MNNote.getFocusNotes();

// Get note by ID
let note = MNUtil.getNoteById(noteId);

// Get current notebook
let notebook = MNUtil.currentNotebook;

// Undo grouping (wrap modifications)
MNUtil.undoGrouping(() => {
  note.noteTitle = "New Title";
  note.colorIndex = 3;
});
```

#### Clipboard Operations

```javascript
// Copy text
MNUtil.copy("Hello World");

// Copy JSON object
MNUtil.copyJSON({name: "test", value: 123});

// Paste text
let text = MNUtil.paste();

// Paste as JSON
let obj = MNUtil.pasteAsJSON();
```

#### File Operations

```javascript
// Read text file
let content = MNUtil.readText("/path/to/file.txt");

// Write text file
MNUtil.writeText("/path/to/file.txt", "content");

// Read JSON file
let data = MNUtil.readJSON("/path/to/data.json");

// Write JSON file
MNUtil.writeJSON("/path/to/data.json", {key: "value"});
```

#### Delay and Async

```javascript
// Delay execution
MNUtil.delay(2).then(() => {
  MNUtil.showHUD("Executed after 2 seconds");
});

// Wait for condition
async function waitForNote() {
  await MNUtil.waitUntil(() => MNNote.getFocusNote() !== null);
  MNUtil.showHUD("Note selected!");
}
```

### 4.4 MNNote Prototype Extensions

The xdyyutils.js extends MNNote with 70+ helper methods:

```javascript
let note = MNNote.getFocusNote();

// Append comment
note.appendComment("New comment");

// Insert comment at position
note.insertCommentAfter(index, "Comment text");

// Get comment HTML
let html = note.getCommentHTML(index);

// Modify comment
note.modifyComment(index, "Updated text");

// Delete comment
note.deleteComment(index);

// Get all text content
let allText = note.getAllText();

// Check if note has children
if (note.hasChildren()) {
  // Process children
}

// Get ancestor notes
let ancestors = note.getAncestors();

// Find notes by title
let matches = note.findNotesByTitle("search term");
```

---

## 5. Architecture Patterns

### 5.1 Multi-File Structure

Professional plugins use a modular structure:

```
MyPlugin/
├── mnaddon.json
├── logo.png
├── main.js                    # Entry point
├── utils.js                   # Core utilities
├── webviewController.js       # UI management
├── settingController.js       # Settings panel
├── index.html                 # WebView HTML
├── app.js                     # WebView JavaScript
└── common.css                 # Styles
```

#### main.js - Plugin Entry

```javascript
JSB.newAddon = function(mainPath) {
  // Load dependencies
  JSB.require('utils');
  JSB.require('webviewController');
  JSB.require('settingController');
  
  return JSB.defineClass('MyPlugin : JSExtension', {
    sceneWillConnect: function() {
      self.mainPath = mainPath;
      // Initialize plugin
    },
    
    toggleAddon: function() {
      // Delegate to controller
      getWebviewController().showUI();
    }
  });
};
```

#### utils.js - Business Logic

```javascript
// Configuration management
class PluginConfig {
  static load() {
    return NSUserDefaults.standardUserDefaults()
      .objectForKey("MyPlugin_Config");
  }
  
  static save(config) {
    NSUserDefaults.standardUserDefaults()
      .setObjectForKey(config, "MyPlugin_Config");
  }
}

// Business logic
class PluginUtils {
  static processNote(note) {
    // Implementation
  }
  
  static batchProcess(notes) {
    notes.forEach(note => {
      this.processNote(note);
    });
  }
}
```

#### webviewController.js - UI Controller

```javascript
class WebviewController {
  constructor() {
    this.webView = null;
  }
  
  showUI() {
    if (!this.webView) {
      this.createWebView();
    }
    this.webView.show();
  }
  
  createWebView() {
    // Create WebView window
    // Load HTML
    // Set up JavaScript bridge
  }
  
  receiveMessage(message) {
    // Handle messages from WebView
    switch(message.action) {
      case "save":
        this.handleSave(message.data);
        break;
      // ... more cases
    }
  }
}
```

### 5.2 Registry Pattern (MN Toolbar Approach)

The MN Toolbar plugin demonstrates a sophisticated registry pattern:

```javascript
// xdyy_button_registry.js
// Centralized button definitions
function registerAllButtons() {
  global.registerButton("custom15", {
    name: "Timestamp",
    image: "clock",
    templateName: "menu_timestamp"
  });
  
  global.registerButton("custom16", {
    name: "Tags",
    image: "tag",
    templateName: "menu_tags"
  });
}

// xdyy_menu_registry.js
// Menu template definitions
global.registerMenuTemplate("menu_timestamp", {
  action: "addTimestamp",
  onLongPress: {
    action: "menu",
    menuItems: [
      {action: "addTimestamp", menuTitle: "Add to Title"},
      {action: "addTimestampComment", menuTitle: "Add as Comment"}
    ]
  }
});

// xdyy_custom_actions_registry.js
// Action implementations
global.registerCustomAction("addTimestamp", async function(context) {
  const {focusNote} = context;
  if (!focusNote) {
    MNUtil.showHUD("No note selected");
    return;
  }
  
  const timestamp = new Date().toLocaleString('zh-CN');
  MNUtil.undoGrouping(() => {
    focusNote.noteTitle = `${focusNote.noteTitle} [${timestamp}]`;
  });
  
  MNUtil.showHUD("✅ Timestamp added");
});
```

**Benefits of Registry Pattern:**
- **Decoupling**: Buttons, menus, and actions defined separately
- **Extensibility**: Easy to add new features without modifying core code
- **Maintainability**: Each component has a single responsibility
- **Zero-invasion**: Extend functionality without touching original code

### 5.3 Configuration-Driven Architecture (MN Pinner)

MN Pinner demonstrates configuration-driven UI generation:

```javascript
// SectionRegistry: Centralized section definitions
class SectionRegistry {
  static sections = new Map([
    ["focus", {
      key: "focus",
      displayName: "Focus",
      viewMode: "pin",
      color: "#457bd3",
      icon: "📌",
      order: 1,
      description: "重点关注的卡片"
    }],
    ["class", {
      key: "class",
      displayName: "Class", 
      viewMode: "pin",
      color: "#e5c07b",
      icon: "🎓",
      order: 4,
      description: "课程相关内容"
    }]
  ]);
  
  static getConfig(key) {
    return this.sections.get(key);
  }
  
  static getAllByMode(mode) {
    return Array.from(this.sections.values())
      .filter(s => s.viewMode === mode)
      .sort((a, b) => a.order - b.order);
  }
}

// Dynamic view creation based on configuration
createAllSectionTabs() {
  let configs = SectionRegistry.getAllByMode("pin");
  configs.forEach((config, index) => {
    this.createSectionTabButton(config, index === 0);
  });
}

// Adding new section: Just add configuration!
SectionRegistry.sections.set("newSection", {
  key: "newSection",
  displayName: "New Section",
  viewMode: "pin",
  color: "#98c379",
  icon: "✨",
  order: 5
});
```

**Before Configuration-Driven:**
- Adding new view: Modify 9 places, ~45 lines of code
- Repeated switch-case statements
- Hard-coded view lists

**After Configuration-Driven:**
- Adding new view: 1 configuration object, ~8 lines
- Dynamic generation eliminates repetition
- Easy to maintain and extend

---

## 6. Plugin Development Workflows

### 6.1 Development Workflow

```bash
# 1. Create plugin structure
mkdir MyPlugin && cd MyPlugin

# 2. Create basic files
touch mnaddon.json main.js logo.png

# 3. Develop with hot reload
# Create symlink to extensions folder
ln -s $(pwd) ~/Library/Containers/QReader.MarginNoteMac/Data/Library/MarginNote\ Extensions/

# 4. Edit code
# Restart MarginNote to see changes

# 5. Package for distribution
mnaddon4 build

# 6. Test the .mnaddon file
open MyPlugin.mnaddon
```

### 6.2 Using MN4-Addon-Deep-Research Tool

For analyzing existing plugins:

```bash
# Deep analysis of a plugin
/mn4-addon-deep-research mntask

# This generates:
# - Architecture analysis
# - Key patterns identified
# - Code organization insights
# - Improvement suggestions
```

### 6.3 Bug Workflow

```bash
# 1. Create bug report
/bug-create task-crash "MNTask crashes on launch"

# 2. Analyze the issue
/bug-analyze task-crash

# 3. Implement fix
/bug-fix task-crash

# 4. Verify fix
/bug-verify task-crash
```

### 6.4 Feature Development Workflow

```bash
# 1. Create feature spec
/spec-create task-priority "Add priority management to MNTask"

# 2. Follow guided workflow:
# - Requirements gathering
# - Design documentation
# - Task breakdown
# - Implementation
# - Testing

# 3. Execute tasks
/spec-execute task-priority

# 4. Check status
/spec-status task-priority
```

---

## 7. Advanced Topics

### 7.1 WebView Integration

#### Creating a WebView

```javascript
class WebviewController {
  createWebView() {
    // Create window
    let frame = {x: 100, y: 100, width: 600, height: 800};
    this.window = UIWindow.alloc()
      .initWithFrame(frame);
    
    // Create WebView
    this.webView = WKWebView.alloc()
      .initWithFrame(this.window.bounds);
    
    // Load HTML
    let htmlPath = self.mainPath + "/index.html";
    let htmlURL = NSURL.fileURLWithPath(htmlPath);
    let baseURL = NSURL.fileURLWithPath(self.mainPath);
    
    this.webView.loadFileURLAllowingReadAccessToURL(
      htmlURL,
      baseURL
    );
    
    // Set up JavaScript bridge
    this.setupMessageHandler();
    
    // Add to window
    this.window.addSubview(this.webView);
    this.window.makeKeyAndVisible();
  }
  
  setupMessageHandler() {
    // Register message handler
    this.webView.configuration.userContentController
      .addScriptMessageHandlerName(
        this,
        "jsMessageHandler"
      );
  }
  
  // Receive messages from WebView
  userContentControllerDidReceiveScriptMessage: function(
    controller, message
  ) {
    let data = message.body;
    this.handleMessage(data);
  }
  
  // Send message to WebView
  sendToWebView(message) {
    let script = `window.receiveFromNative(${JSON.stringify(message)})`;
    this.webView.evaluateJavaScriptCompletionHandler(
      script,
      null
    );
  }
}
```

#### HTML Side (index.html)

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: -apple-system, sans-serif;
      padding: 20px;
    }
  </style>
</head>
<body>
  <h1>My Plugin UI</h1>
  <button onclick="sendToNative()">Click Me</button>
  
  <script src="app.js"></script>
</body>
</html>
```

#### JavaScript Side (app.js)

```javascript
// Send message to native
function sendToNative() {
  window.webkit.messageHandlers.jsMessageHandler
    .postMessage({
      action: "buttonClicked",
      data: {timestamp: Date.now()}
    });
}

// Receive message from native
window.receiveFromNative = function(message) {
  console.log("Received:", message);
  // Update UI based on message
};
```

### 7.2 Network Requests

```javascript
class NetworkUtils {
  // GET request
  static async get(url) {
    return new Promise((resolve, reject) => {
      let request = NSMutableURLRequest
        .requestWithURL(NSURL.URLWithString(url));
      request.HTTPMethod = "GET";
      
      let session = NSURLSession.sharedSession();
      let task = session.dataTaskWithRequestCompletionHandler(
        request,
        (data, response, error) => {
          if (error) {
            reject(error);
            return;
          }
          
          let json = NSJSONSerialization
            .JSONObjectWithDataOptionsError(data, 0, null);
          resolve(json);
        }
      );
      
      task.resume();
    });
  }
  
  // POST request
  static async post(url, body) {
    return new Promise((resolve, reject) => {
      let request = NSMutableURLRequest
        .requestWithURL(NSURL.URLWithString(url));
      request.HTTPMethod = "POST";
      request.setValueForHTTPHeaderField(
        "application/json",
        "Content-Type"
      );
      
      let jsonData = NSJSONSerialization
        .dataWithJSONObjectOptionsError(body, 0, null);
      request.HTTPBody = jsonData;
      
      let session = NSURLSession.sharedSession();
      let task = session.dataTaskWithRequestCompletionHandler(
        request,
        (data, response, error) => {
          if (error) {
            reject(error);
            return;
          }
          
          let json = NSJSONSerialization
            .JSONObjectWithDataOptionsError(data, 0, null);
          resolve(json);
        }
      );
      
      task.resume();
    });
  }
}

// Usage
async function fetchData() {
  try {
    MNUtil.waitHUD("Loading...");
    
    let data = await NetworkUtils.get(
      "https://api.example.com/data"
    );
    
    MNUtil.stopHUD();
    MNUtil.showHUD("Data loaded!");
    
    // Process data
  } catch (error) {
    MNUtil.stopHUD();
    MNUtil.showHUD("Error: " + error.localizedDescription);
  }
}
```

### 7.3 Persistent Storage

#### UserDefaults (Simple Data)

```javascript
class Storage {
  // Save single value
  static save(key, value) {
    NSUserDefaults.standardUserDefaults()
      .setObjectForKey(value, key);
    NSUserDefaults.standardUserDefaults().synchronize();
  }
  
  // Get single value
  static get(key, defaultValue = null) {
    let value = NSUserDefaults.standardUserDefaults()
      .objectForKey(key);
    return value !== null ? value : defaultValue;
  }
  
  // Save object
  static saveJSON(key, obj) {
    let json = JSON.stringify(obj);
    this.save(key, json);
  }
  
  // Get object
  static getJSON(key, defaultValue = null) {
    let json = this.get(key);
    if (json) {
      try {
        return JSON.parse(json);
      } catch (e) {
        return defaultValue;
      }
    }
    return defaultValue;
  }
}

// Usage
Storage.save("username", "Alice");
Storage.saveJSON("settings", {theme: "dark", fontSize: 14});

let username = Storage.get("username");
let settings = Storage.getJSON("settings", {});
```

#### File Storage (Large Data)

```javascript
class FileStorage {
  static getPluginPath() {
    let path = NSFileManager.defaultManager()
      .URLsForDirectoryInDomains(9, 1, true)
      .firstObject().path;
    return path + "/MarginNote Extensions/MyPlugin";
  }
  
  static saveFile(filename, content) {
    let path = this.getPluginPath() + "/" + filename;
    NSString.stringWithString(content)
      .writeToFileAtomicallyEncodingError(path, true, 4, null);
  }
  
  static loadFile(filename) {
    let path = this.getPluginPath() + "/" + filename;
    return NSString.stringWithContentsOfFileEncodingError(
      path, 4, null
    );
  }
}

// Usage
FileStorage.saveFile("notes.json", JSON.stringify(notes));
let data = FileStorage.loadFile("notes.json");
```

---

## 8. Best Practices

### 8.1 Code Organization

**DO:**
```javascript
// ✅ Modular structure
class NoteProcessor {
  static processTitle(note) {
    // Single responsibility
  }
  
  static processContent(note) {
    // Single responsibility
  }
}

// ✅ Use constants
const COLORS = {
  RED: 3,
  YELLOW: 5,
  GREEN: 7
};
```

**DON'T:**
```javascript
// ❌ God function doing everything
function doEverything() {
  // 500 lines of mixed logic
}

// ❌ Magic numbers
note.colorIndex = 3;  // What does 3 mean?
```

### 8.2 Error Handling

```javascript
// ✅ Defensive programming
function processNote(note) {
  // Validate input
  if (!note) {
    MNUtil.showHUD("No note provided");
    return;
  }
  
  try {
    // Risky operation
    let result = complexOperation(note);
    
    // Validate result
    if (!result.success) {
      throw new Error(result.message);
    }
    
    MNUtil.showHUD("✅ Success");
  } catch (error) {
    // Log error
    MNUtil.addErrorLog(error, "processNote", {
      noteId: note.noteId
    });
    
    // User-friendly message
    MNUtil.showHUD("⚠️ Operation failed");
  }
}
```

### 8.3 Performance Optimization

```javascript
// ✅ Batch operations
MNUtil.undoGrouping(() => {
  notes.forEach(note => {
    note.colorIndex = 3;
  });
});

// ✅ Debounce frequent operations
let debounceTimer = null;
function onTextChange() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    // Actual processing
  }, 300);
}

// ✅ Cache expensive results
let cachedNotes = null;
function getNotes() {
  if (!cachedNotes) {
    cachedNotes = expensiveQuery();
  }
  return cachedNotes;
}
```

### 8.4 User Experience

```javascript
// ✅ Show progress for long operations
async function batchProcess(notes) {
  MNUtil.waitHUD("Processing...");
  
  for (let i = 0; i < notes.length; i++) {
    await processNote(notes[i]);
    
    // Update progress
    let progress = Math.round((i + 1) / notes.length * 100);
    MNUtil.showHUD(`Processing... ${progress}%`);
  }
  
  MNUtil.stopHUD();
  MNUtil.showHUD("✅ Completed!");
}

// ✅ Confirm destructive actions
async function deleteAllNotes() {
  let ok = await MNUtil.confirm(
    "Delete All",
    "This cannot be undone. Continue?"
  );
  
  if (ok) {
    // Proceed with deletion
  }
}
```

---

## 9. Debugging & Testing

### 9.1 Debugging Techniques

#### Console Logging

```javascript
// Use MNUtil.log for debugging
MNUtil.log("Debug: note =", note);
MNUtil.log("Values:", {x: 1, y: 2});

// Conditional logging
const DEBUG = true;
if (DEBUG) {
  MNUtil.log("Detailed debug info");
}
```

#### Inspecting Objects

```javascript
// Copy object to clipboard for inspection
MNUtil.copyJSON(complexObject);
MNUtil.showHUD("Object copied! Paste to see details");

// Log object properties
function inspectObject(obj, name = "object") {
  MNUtil.log(`Inspecting ${name}:`);
  for (let key in obj) {
    MNUtil.log(`  ${key}: ${obj[key]}`);
  }
}
```

#### Error Tracking

```javascript
try {
  riskyOperation();
} catch (error) {
  // Detailed error logging
  MNUtil.addErrorLog(error, "functionName", {
    param1: value1,
    param2: value2
  });
  
  // Stack trace
  MNUtil.log("Stack:", error.stack);
}
```

### 9.2 Testing Strategies

#### Unit Testing Pattern

```javascript
class TestRunner {
  static tests = [];
  
  static test(name, fn) {
    this.tests.push({name, fn});
  }
  
  static async run() {
    let passed = 0;
    let failed = 0;
    
    for (let test of this.tests) {
      try {
        await test.fn();
        MNUtil.log(`✅ ${test.name}`);
        passed++;
      } catch (error) {
        MNUtil.log(`❌ ${test.name}: ${error.message}`);
        failed++;
      }
    }
    
    MNUtil.showHUD(`Tests: ${passed} passed, ${failed} failed`);
  }
}

// Define tests
TestRunner.test("Note creation", () => {
  let note = createTestNote();
  if (!note) throw new Error("Note not created");
  if (!note.noteTitle) throw new Error("Title missing");
});

TestRunner.test("Color setting", () => {
  let note = createTestNote();
  note.colorIndex = 3;
  if (note.colorIndex !== 3) throw new Error("Color not set");
});

// Run tests
TestRunner.run();
```

---

## 10. Real-World Examples

### 10.1 Simple Utility Plugin

**Quick Timestamp Plugin**

```javascript
JSB.newAddon = function(mainPath) {
  return JSB.defineClass('QuickTimestamp : JSExtension', {
    
    toggleAddon: function() {
      let note = MNNote.getFocusNote();
      
      if (!note) {
        MNUtil.showHUD("Please select a note");
        return;
      }
      
      let timestamp = new Date().toLocaleString('zh-CN');
      
      MNUtil.undoGrouping(() => {
        note.noteTitle = `${note.noteTitle || ""} [${timestamp}]`;
      });
      
      MNUtil.showHUD("✅ Timestamp added");
    }
  });
};
```

### 10.2 Advanced Plugin - Task Manager

**Simplified MNTask Architecture**

```javascript
// main.js
JSB.newAddon = function(mainPath) {
  JSB.require('utils');
  JSB.require('webviewController');
  
  return JSB.defineClass('TaskManager : JSExtension', {
    
    sceneWillConnect: function() {
      TaskUtils.init(mainPath);
    },
    
    toggleAddon: function() {
      TaskWebviewController.show();
    },
    
    notebookWillOpen: function(notebookId) {
      TaskUtils.loadNotebookTasks(notebookId);
    }
  });
};

// utils.js
class TaskUtils {
  static init(mainPath) {
    this.mainPath = mainPath;
  }
  
  static createTask(title, type = "action") {
    let note = MNNote.new();
    note.noteTitle = `【${type}｜未开始】${title}`;
    return note;
  }
  
  static updateTaskStatus(note, status) {
    let title = note.noteTitle;
    let newTitle = title.replace(/｜(.+?)】/, `｜${status}】`);
    
    MNUtil.undoGrouping(() => {
      note.noteTitle = newTitle;
    });
  }
  
  static getTodayTasks() {
    let notebook = MNUtil.currentNotebook;
    return notebook.notes.filter(note => {
      return note.noteTitle && note.noteTitle.includes("📅 今日");
    });
  }
}

// webviewController.js
class TaskWebviewController {
  static show() {
    // Create WebView UI
    // Show task board
  }
}
```

### 10.3 AI Integration Plugin

**OpenAI Integration Example**

```javascript
class AIPlugin {
  static async summarizeNote(note) {
    if (!note || !note.excerptText) {
      MNUtil.showHUD("No content to summarize");
      return;
    }
    
    MNUtil.waitHUD("Generating summary...");
    
    try {
      let summary = await this.callOpenAI(note.excerptText);
      
      MNUtil.undoGrouping(() => {
        note.appendComment(`🤖 AI Summary:\n${summary}`);
      });
      
      MNUtil.stopHUD();
      MNUtil.showHUD("✅ Summary added!");
      
    } catch (error) {
      MNUtil.stopHUD();
      MNUtil.showHUD("❌ Error: " + error.message);
    }
  }
  
  static async callOpenAI(text) {
    let url = "https://api.openai.com/v1/chat/completions";
    let apiKey = "your-api-key";
    
    let body = {
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Summarize the following text concisely."
        },
        {
          role: "user",
          content: text
        }
      ]
    };
    
    let response = await NetworkUtils.post(url, body, {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    });
    
    return response.choices[0].message.content;
  }
}
```

---

## 11. Production Architecture Patterns

### 11.1 MNToolbar Registry Pattern: Zero-Invasion Extension System

The Registry Pattern used in MNToolbar demonstrates how to create extensible plugins where new features can be added without modifying core code.

#### Three-Layer Decoupled Architecture

```
User Interaction → Button Registry → Menu Template → Custom Action
                   (Definition)      (UI Behavior)   (Implementation)
```

**Why This Matters:**
- **Zero Code Invasion**: Add features without touching core logic
- **Maintainability**: Clear separation of concerns
- **Scalability**: Easy to add 10, 20, 100+ custom actions
- **Collaboration**: Multiple developers can add features independently

#### Layer 1: Button Registry (`xdyy_button_registry.js`)

```javascript
// === BUTTON DEFINITION LAYER ===
// Purpose: Register which buttons exist and their basic metadata

global.registerButton = function(buttonId, config) {
  if (typeof global.buttonRegistry === 'undefined') {
    global.buttonRegistry = {};
  }
  global.buttonRegistry[buttonId] = config;
};

// Register a custom button
global.registerButton("custom16", {
  name: "Complete Task",              // Display name
  image: "checkmark_custom16",        // Icon name (44x44px)
  templateName: "menu_completeTask",  // Links to menu template
  description: "Mark selected notes as complete"
});

// Register more buttons - completely isolated
global.registerButton("custom17", {
  name: "AI Summary",
  image: "ai_custom17",
  templateName: "menu_aiSummary"
});
```

**Design Insight:** The button registry ONLY defines metadata. It doesn't know what happens when clicked. This decoupling allows changing behavior without touching button definitions.

#### Layer 2: Menu Template Registry (`xdyy_menu_registry.js`)

```javascript
// === UI BEHAVIOR LAYER ===
// Purpose: Define HOW buttons respond to user interaction

global.registerMenuTemplate = function(templateName, config) {
  if (typeof global.menuTemplates === 'undefined') {
    global.menuTemplates = {};
  }
  global.menuTemplates[templateName] = config;
};

// Single-click action
global.registerMenuTemplate("menu_completeTask", {
  action: "markComplete",
  icon: "✅"
});

// Advanced: Multiple interaction types
global.registerMenuTemplate("menu_smartAction", {
  // Single click
  action: "quickAction",
  
  // Double click (within 300ms window)
  doubleClick: {
    action: "advancedAction",
    icon: "⚡"
  },
  
  // Long press (0.3s)
  onLongPress: {
    action: "menu",          // Special: Opens submenu
    menuWidth: 200,
    menuItems: [
      {action: "option1", menuTitle: "Option 1", icon: "1️⃣"},
      {action: "option2", menuTitle: "Option 2", icon: "2️⃣"},
      {action: "option3", menuTitle: "Option 3", icon: "3️⃣"}
    ]
  }
});
```

**Design Insight:** Menu templates define BEHAVIOR (click, double-click, long-press) but don't implement logic. This allows changing gestures without touching implementation.

#### Layer 3: Custom Action Registry (`xdyy_custom_actions_registry.js`)

```javascript
// === IMPLEMENTATION LAYER ===
// Purpose: Actual logic executed when actions trigger

global.registerCustomAction = function(actionName, handler) {
  if (typeof global.customActions === 'undefined') {
    global.customActions = {};
  }
  global.customActions[actionName] = handler;
};

// Implement the action
global.registerCustomAction("markComplete", async function(context) {
  // Context provides everything needed
  const { button, des, focusNote, focusNotes, self } = context;
  
  // Validation
  if (!focusNote) {
    MNUtil.showHUD("❌ Please select a note");
    return;
  }
  
  // Business logic
  MNUtil.undoGrouping(() => {
    focusNote.noteTitle = "✅ " + (focusNote.noteTitle || "");
    focusNote.colorIndex = 7; // Green
    
    // Add completion comment
    const now = new Date().toLocaleDateString();
    focusNote.appendTextComment(`Completed on ${now}`);
  });
  
  MNUtil.showHUD(`✅ Marked complete: ${focusNote.noteTitle}`);
});

// Complex action with async operations
global.registerCustomAction("aiSummary", async function(context) {
  const { focusNote } = context;
  
  if (!focusNote || !focusNote.excerptText) {
    MNUtil.showHUD("No content to summarize");
    return;
  }
  
  MNUtil.waitHUD("Generating AI summary...");
  
  try {
    // Call external API
    const summary = await callOpenAI(focusNote.excerptText);
    
    MNUtil.undoGrouping(() => {
      focusNote.appendHtmlComment(
        `<div style="padding:10px;background:#f0f0f0;">
          <strong>🤖 AI Summary:</strong><br>${summary}
        </div>`,
        `AI Summary: ${summary}`,
        {width: 300, height: 0}
      );
    });
    
    MNUtil.stopHUD();
    MNUtil.showHUD("✅ Summary added!");
    
  } catch (error) {
    MNUtil.stopHUD();
    MNUtil.showHUD("❌ Error: " + error.message);
  }
});
```

**Design Insight:** Actions are completely isolated async functions. They can be complex (API calls, multi-step operations) without affecting the button/menu layers.

#### Integration in Main Plugin

```javascript
// webviewController.js - The glue code
async function customActionByDes(des, button, controller) {
  // Get focused note(s)
  const focusNote = MNNote.getFocusNote();
  const focusNotes = MNNote.getSelectedNotes();
  
  // Build context object
  const context = {
    button: button,
    des: des,
    focusNote: focusNote,
    focusNotes: focusNotes,
    self: controller
  };
  
  // Check for registered custom action
  if (typeof global !== 'undefined' && global.customActions) {
    const handler = global.customActions[des.action];
    
    if (handler) {
      try {
        await handler(context);
        return true;  // Handled
      } catch (error) {
        MNUtil.showHUD("❌ Action error: " + error.message);
        MNUtil.addErrorLog(error, "customActionByDes", { action: des.action });
        return false;
      }
    }
  }
  
  // If not a custom action, fall through to default handling
  return false;
}
```

#### Complete Event Flow

```
1. User taps button "custom16" on toolbar
   ↓
2. iOS TouchUpInside event fires
   ↓
3. MNToolbar looks up button in buttonRegistry
   → Finds templateName: "menu_completeTask"
   ↓
4. Looks up template in menuTemplates
   → Finds action: "markComplete"
   ↓
5. Calls customActionByDes("markComplete", button, controller)
   ↓
6. Looks up action in customActions registry
   → Finds handler function
   ↓
7. Executes handler with context
   ↓
8. Updates UI and shows HUD
```

#### Adding a New Feature (Zero Code Changes)

```javascript
// === ADD NEW FEATURE IN 3 FILES, NO CORE CHANGES ===

// File 1: xdyy_button_registry.js
global.registerButton("custom18", {
  name: "Export to Markdown",
  image: "md_custom18",
  templateName: "menu_exportMd"
});

// File 2: xdyy_menu_registry.js
global.registerMenuTemplate("menu_exportMd", {
  action: "exportMarkdown",
  icon: "📄"
});

// File 3: xdyy_custom_actions_registry.js
global.registerCustomAction("exportMarkdown", async function(context) {
  const { focusNotes } = context;
  
  if (!focusNotes || focusNotes.length === 0) {
    MNUtil.showHUD("No notes selected");
    return;
  }
  
  let markdown = "# Exported Notes\n\n";
  
  focusNotes.forEach(note => {
    markdown += `## ${note.noteTitle}\n\n`;
    markdown += `${note.excerptText || ''}\n\n`;
  });
  
  MNUtil.copy(markdown);
  MNUtil.showHUD(`✅ Exported ${focusNotes.length} notes to clipboard`);
});
```

**Result:** New export feature added without touching any core MNToolbar code!

---

### 11.2 Configuration-Driven Architecture: MNPinner Pattern

The MNPinner plugin demonstrates how configuration-driven design can eliminate switch-case statements and reduce code by 83%.

#### The Problem: Traditional Switch-Case Hell

```javascript
// ❌ TRADITIONAL APPROACH (45 lines)
function renderSection(sectionType) {
  switch(sectionType) {
    case 'recentNotes':
      return renderRecentNotes();
    case 'bookmarks':
      return renderBookmarks();
    case 'tags':
      return renderTags();
    // ... 10 more cases
  }
}

function fetchData(sectionType) {
  switch(sectionType) {
    case 'recentNotes':
      return MNNote.getRecentNotes(20);
    case 'bookmarks':
      return MNNote.getBookmarkedNotes();
    // ... duplicate logic
  }
}

function getSectionIcon(sectionType) {
  switch(sectionType) {
    case 'recentNotes':
      return "📝";
    // ... more duplication
  }
}
```

**Problems:**
- Code duplication across multiple functions
- Hard to add new sections (touch 5+ functions)
- Error-prone (forget one switch case = bug)
- Poor maintainability

#### The Solution: Section Registry Pattern

```javascript
// ✅ CONFIGURATION-DRIVEN (8 lines of core + config)

// === SECTION REGISTRY ===
const SECTION_REGISTRY = {
  recentNotes: {
    icon: "📝",
    title: "Recent Notes",
    color: "#4A90E2",
    
    fetchData: async () => {
      return MNNote.getRecentNotes(20);
    },
    
    renderItem: (note) => ({
      title: note.noteTitle,
      subtitle: note.createDate.toLocaleDateString(),
      badge: note.childNotes.length > 0 ? note.childNotes.length : null,
      action: () => note.focusInMindMap()
    }),
    
    filter: (items, keyword) => {
      return items.filter(note => 
        note.noteTitle.toLowerCase().includes(keyword.toLowerCase())
      );
    },
    
    sort: (items, order) => {
      if (order === 'date') {
        return items.sort((a, b) => b.createDate - a.createDate);
      }
      return items.sort((a, b) => a.noteTitle.localeCompare(b.noteTitle));
    }
  },
  
  bookmarks: {
    icon: "⭐",
    title: "Bookmarks",
    color: "#F5A623",
    
    fetchData: async () => {
      // Get notes with bookmark tag
      const allNotes = MNNote.getAllNotes();
      return allNotes.filter(note => note.noteTitle.includes("⭐"));
    },
    
    renderItem: (note) => ({
      title: note.noteTitle.replace("⭐", "").trim(),
      subtitle: `Notebook: ${note.notebookId}`,
      action: () => note.focusInDocument()
    })
  },
  
  tags: {
    icon: "🏷️",
    title: "Tags",
    color: "#7ED321",
    
    fetchData: async () => {
      // Extract all unique tags from notes
      const allNotes = MNNote.getAllNotes();
      const tagMap = new Map();
      
      allNotes.forEach(note => {
        const tags = extractTags(note.noteTitle);
        tags.forEach(tag => {
          if (!tagMap.has(tag)) {
            tagMap.set(tag, { name: tag, notes: [] });
          }
          tagMap.get(tag).notes.push(note);
        });
      });
      
      return Array.from(tagMap.values());
    },
    
    renderItem: (tag) => ({
      title: tag.name,
      subtitle: `${tag.notes.length} notes`,
      badge: tag.notes.length,
      action: () => showTaggedNotes(tag.name)
    }),
    
    filter: (items, keyword) => {
      return items.filter(tag => 
        tag.name.toLowerCase().includes(keyword.toLowerCase())
      );
    }
  }
};

// === UNIFIED RENDERING ENGINE (8 lines!) ===
async function renderSection(sectionKey) {
  const config = SECTION_REGISTRY[sectionKey];
  if (!config) {
    console.error(`Unknown section: ${sectionKey}`);
    return null;
  }
  
  // Fetch data using config
  const data = await config.fetchData();
  
  // Create section container
  const container = createSectionContainer({
    icon: config.icon,
    title: config.title,
    color: config.color
  });
  
  // Render each item
  data.forEach(item => {
    const rendered = config.renderItem(item);
    container.addItem(rendered);
  });
  
  return container;
}
```

**Benefits:**
- **83% Code Reduction**: 45 lines → 8 lines of core logic
- **Add Features Instantly**: Just add config object, no code changes
- **Type Safety**: Config structure is consistent
- **Testable**: Config is pure data, easy to test

#### Adding a New Section (Zero Core Changes)

```javascript
// Just add configuration - rendering engine handles it automatically!
SECTION_REGISTRY.searches = {
  icon: "🔍",
  title: "Saved Searches",
  color: "#9013FE",
  
  fetchData: async () => {
    // Load saved searches from storage
    const searches = await loadSearches();
    return searches;
  },
  
  renderItem: (search) => ({
    title: search.query,
    subtitle: `${search.resultCount} results`,
    action: () => executeSearch(search.query)
  }),
  
  filter: (items, keyword) => {
    return items.filter(search => 
      search.query.includes(keyword)
    );
  }
};

// That's it! No changes to renderSection() or any other code.
// The new section automatically works with filtering, sorting, rendering.
```

---

### 11.3 Multi-File Modular Pattern: MNTask Architecture

For complex plugins (3000+ lines), the multi-file modular pattern provides clear separation of concerns.

#### Directory Structure

```
mntask/
├── main.js                          # Entry point + lifecycle
├── utils.js                         # Utility functions
├── app.js                           # Business logic
├── webviewController.js             # WebView UI
├── settingController.js             # Settings management
├── drag-manager.js                  # Drag & drop
├── render-engine.js                 # UI rendering
├── state-manager.js                 # State management
├── task-board.js                    # Task board logic
├── task-board-utils.js              # Task utilities
├── xdyy_button_registry.js          # Button extensions
├── xdyy_menu_registry.js            # Menu extensions
├── xdyy_custom_actions_registry.js  # Action extensions
├── logManager.js                    # Logging system
├── pinyin.js                        # Chinese pinyin support
└── index.html                       # WebView HTML
```

#### Module Loading Pattern

```javascript
// === main.js - Entry Point ===
JSB.newAddon = function (mainPath) {
  // Load dependencies in order
  JSB.require('utils');                    // Must load first
  JSB.require('xdyy_utils_extensions');   // Core extensions
  
  // Check MNUtils availability
  if (!taskUtils.checkMNUtilsFolder(mainPath)) {
    return undefined;  // Abort if MNUtils missing
  }
  
  // Load optional libraries
  try {
    JSB.require('pinyin');  // Chinese support
  } catch (e) {
    console.log("Pinyin not available");
  }
  
  // Load controllers
  JSB.require('webviewController');
  JSB.require('settingController');
  
  // Load extension registries (after utils)
  try {
    JSB.require('xdyy_menu_registry');
    JSB.require('xdyy_button_registry');
    JSB.require('xdyy_custom_actions_registry');
  } catch (error) {
    if (typeof MNUtil !== 'undefined' && MNUtil.addErrorLog) {
      MNUtil.addErrorLog(error, "加载自定义扩展");
    }
  }
  
  // Define main plugin class
  const MNTask = JSB.defineClass('MNTask : JSExtension', {
    sceneWillConnect: function() {
      // Initialize controllers
      self.controllers = {};
      self.state = {
        isActive: false,
        currentBoard: null
      };
    },
    
    notebookWillOpen: function(topicid) {
      // Ensure controllers exist
      this.ensureControllers();
      
      // Initialize task system
      if (typeof taskApp !== 'undefined') {
        taskApp.initialize(topicid);
      }
    },
    
    ensureControllers: function() {
      if (!self.controllers.webview) {
        self.controllers.webview = webviewController.new();
        self.controllers.webview.mainController = self;
      }
      
      if (!self.controllers.settings) {
        self.controllers.settings = settingController.new();
        self.controllers.settings.mainController = self;
      }
    },
    
    toggleAddon: function() {
      if (self.controllers.webview) {
        self.controllers.webview.toggleVisibility();
      }
    },
    
    notebookWillClose: function(topicid) {
      // Cleanup
      if (self.controllers.webview) {
        self.controllers.webview.cleanup();
      }
      
      if (typeof taskApp !== 'undefined') {
        taskApp.cleanup();
      }
    }
  });
  
  return MNTask;
};
```

#### Controller Responsibilities

```javascript
// === webviewController.js - UI Management ===
var webviewController = JSB.defineClass(
  'webviewController : UIViewController',
  {
    viewDidLoad: function() {
      this.setupWebView();
      this.loadContent();
    },
    
    setupWebView: function() {
      this.webView = UIWebView.new();
      this.webView.frame = this.calculateFrame();
      
      // Load HTML
      const htmlPath = self.mainPath + "/index.html";
      const url = NSURL.fileURLWithPath(htmlPath);
      this.webView.loadRequest(NSURLRequest.requestWithURL(url));
      
      // Add to view hierarchy
      MNUtil.studyView.addSubview(this.webView);
    },
    
    toggleVisibility: function() {
      this.webView.hidden = !this.webView.hidden;
    },
    
    cleanup: function() {
      if (this.webView) {
        this.webView.removeFromSuperview();
        this.webView = null;
      }
    }
  }
);

// === settingController.js - Settings Management ===
var settingController = JSB.defineClass(
  'settingController : UIViewController',
  {
    viewDidLoad: function() {
      this.loadSettings();
      this.setupUI();
    },
    
    loadSettings: function() {
      const saved = NSUserDefaults.standardUserDefaults()
        .objectForKey("MNTask_settings");
      
      this.settings = saved ? JSON.parse(saved) : this.defaultSettings();
    },
    
    saveSettings: function() {
      const json = JSON.stringify(this.settings);
      NSUserDefaults.standardUserDefaults()
        .setObjectForKey(json, "MNTask_settings");
      NSUserDefaults.standardUserDefaults().synchronize();
    }
  }
);

// === app.js - Business Logic ===
var taskApp = {
  initialize: function(notebookId) {
    this.notebookId = notebookId;
    this.tasks = [];
    this.loadTasks();
    this.setupEventListeners();
  },
  
  loadTasks: function() {
    // Load tasks from notes
    const allNotes = MNNote.getAllNotes();
    this.tasks = allNotes
      .filter(note => this.isTask(note))
      .map(note => this.parseTask(note));
  },
  
  isTask: function(note) {
    return note.noteTitle && note.noteTitle.includes("#task");
  },
  
  parseTask: function(note) {
    return {
      id: note.noteId,
      title: note.noteTitle,
      status: this.extractStatus(note),
      priority: this.extractPriority(note),
      dueDate: this.extractDueDate(note)
    };
  },
  
  cleanup: function() {
    this.tasks = [];
    // Remove event listeners
  }
};
```

**Benefits of Multi-File Pattern:**
- **Clear Separation**: Each file has single responsibility
- **Team Collaboration**: Multiple developers can work on different files
- **Testability**: Each module can be tested independently
- **Maintainability**: Changes localized to specific files
- **Code Reuse**: Modules can be extracted to separate plugins

---

## 12. xdyyutils.js Extensions Deep Dive

The `xdyyutils.js` file (15,560 lines) extends MNUtils with 70+ academic workflow methods. Understanding its changes and extensions is critical for production plugins.

### 12.1 Critical Default Parameter Changes

**⚠️ GOTCHA ALERT:** xdyyutils.js changes default parameters from original MNUtils. This can cause subtle bugs if you're not aware!

```javascript
// === CHANGED: MNUtil.getNoteById ===

// Original MNUtils behavior:
MNUtil.getNoteById(noteId, alert = true)
// → Shows error HUD if note not found

// xdyyutils.js behavior:
MNUtil.getNoteById(noteId, alert = false)
// → Silent failure if note not found (default changed!)

// Impact example:
const note = MNUtil.getNoteById("invalid-id");
// Original: Shows "Note not found" HUD
// xdyyutils: Returns null silently

// Fix: Explicitly specify alert parameter
const note = MNUtil.getNoteById("invalid-id", true);  // ✅ Shows HUD
```

```javascript
// === CHANGED: MNNote.prototype.moveComment ===

// Original behavior:
note.moveComment(fromIndex, toIndex, msg = true)
// → Shows "Comment moved" HUD

// xdyyutils.js behavior:
note.moveComment(fromIndex, toIndex, msg = false)
// → Silent operation (default changed!)

// Fix: Explicitly request HUD
note.moveComment(0, 2, true);  // ✅ Shows confirmation HUD
```

**Why This Matters:**
- **Silent Failures**: Operations fail without user feedback
- **Debugging Hell**: Hard to trace why operations seem to do nothing
- **Production Bugs**: Works in dev, fails silently in production

**Best Practice:**
```javascript
// ✅ ALWAYS specify optional parameters explicitly
const note = MNUtil.getNoteById(noteId, true);  // Explicit alert
note.moveComment(from, to, true);               // Explicit message

// ❌ AVOID relying on defaults
const note = MNUtil.getNoteById(noteId);        // Which default?
```

### 12.2 New MNNote Methods (70+ Extensions)

#### Link Management

```javascript
// Check if comment is a link
note.isCommentLink(comment)
// Returns: boolean

// Get link text from comment
note.getLinkText(linkComment)
// Returns: Display text of link

// Find HTML comment by content
note.getIncludingHtmlCommentIndex(htmlContent)
// Returns: index or -1
// Example:
const index = note.getIncludingHtmlCommentIndex("<strong>Important</strong>");
if (index !== -1) {
  note.removeCommentByIndex(index);
}

// Get all link comment indices pointing to specific note
note.getLinkCommentsIndexArr(targetNoteURL)
// Returns: [0, 3, 5] (array of indices)
// Example:
const targetURL = "marginnote4app://note/ABC-123";
const indices = note.getLinkCommentsIndexArr(targetURL);
indices.forEach(index => {
  console.log(`Link at index ${index}`);
});
```

#### Advanced Link Operations

```javascript
// Convert marginnote3app:// links to marginnote4app://
note.convertLinksToNewVersion()
// Scans all comments and updates old URL scheme
// marginnote3app://note/XXX → marginnote4app://note/XXX

// Clean up broken links (target notes don't exist)
note.cleanupBrokenLinks()
// Removes link comments where target note is deleted

// Fix problematic links after merge
note.fixMergeProblematicLinks()
// Repairs bidirectional link integrity after merge operations
```

#### Comment Manipulation

```javascript
// Replace comment with markdown
note.replaceWithMarkdownComment(newURL, commentIndex)
// Converts HTML comment to markdown link at specific index

// Append markdown comment
note.appendMarkdownComment(markdownText)
// Adds markdown-formatted comment
// Example:
note.appendMarkdownComment("**Bold** and *italic* text");

// Move comment to new position
note.moveComment(fromIndex, toIndex, showMessage = false)
// Moves comment from one position to another
// Example:
note.moveComment(0, 5, true);  // Move first comment to 6th position
```

#### Note Deletion with Options

```javascript
// Delete note with descendant handling
note.delete(withDescendant = false)
// withDescendant = true:  Delete entire subtree
// withDescendant = false: Move children to parent before deleting

// Examples:
// Delete only this note, preserve children
note.delete(false);

// Delete entire subtree
note.delete(true);
```

#### Advanced Merge Operation

```javascript
// Merge note into another with link fixing
note.mergeInto(targetNote, htmlType = "none")
// Merges this note into targetNote
// Updates all bidirectional links
// Converts title to HTML comment
// Fixes markdown inline links

// Example:
const sourceNote = MNNote.new("note-1");
const targetNote = MNNote.new("note-2");

// Merge note-1 into note-2
sourceNote.mergeInto(targetNote, "html");
// Result:
// - sourceNote.noteTitle becomes HTML comment in targetNote
// - All links TO sourceNote are updated to point to targetNote
// - sourceNote is deleted
// - Children moved to targetNote
```

### 12.3 URL Utility Methods

```javascript
// Check if URL is valid MarginNote note URL
const url = "marginnote4app://note/ABC-123";
url.ifValidNoteURL()
// Returns: true

// Convert URL to note ID
"marginnote4app://note/ABC-123".toNoteId()
// Returns: "ABC-123"

// Convert note ID to URL
"ABC-123".toNoteURL()
// Returns: "marginnote4app://note/ABC-123"

// Remove bracket prefix from content
"[📌 Important] Main content here".toNoBracketPrefixContent()
// Returns: "Main content here"
```

### 12.4 Production Usage Examples

#### Example 1: Batch Link Update

```javascript
// Update all links pointing to old note
function updateAllLinksToNote(oldNoteId, newNoteId) {
  const allNotes = MNNote.getAllNotes();
  const oldURL = oldNoteId.toNoteURL();
  const newURL = newNoteId.toNoteURL();
  
  let updateCount = 0;
  
  MNUtil.undoGrouping(() => {
    allNotes.forEach(note => {
      const linkIndices = note.getLinkCommentsIndexArr(oldURL);
      
      if (linkIndices.length > 0) {
        linkIndices.forEach(index => {
          note.replaceWithMarkdownComment(newURL, index);
        });
        updateCount++;
      }
    });
  });
  
  MNUtil.showHUD(`✅ Updated ${updateCount} notes`);
}
```

#### Example 2: Clean Up Orphaned Links

```javascript
// Remove all broken links in notebook
function cleanupBrokenLinks() {
  const allNotes = MNNote.getAllNotes();
  let cleanedCount = 0;
  
  MNUtil.undoGrouping(() => {
    allNotes.forEach(note => {
      const beforeCount = note.comments.length;
      note.cleanupBrokenLinks();
      const afterCount = note.comments.length;
      
      if (beforeCount > afterCount) {
        cleanedCount++;
      }
    });
  });
  
  MNUtil.showHUD(`✅ Cleaned ${cleanedCount} notes`);
}
```

#### Example 3: Merge Duplicate Notes

```javascript
// Merge duplicate notes intelligently
function mergeDuplicates(noteIds) {
  if (noteIds.length < 2) {
    MNUtil.showHUD("Need at least 2 notes to merge");
    return;
  }
  
  const notes = noteIds.map(id => MNNote.new(id)).filter(Boolean);
  if (notes.length < 2) {
    MNUtil.showHUD("Some notes not found");
    return;
  }
  
  const [targetNote, ...sourceNotes] = notes;
  
  MNUtil.undoGrouping(() => {
    sourceNotes.forEach(sourceNote => {
      // Merge with link fixing
      sourceNote.mergeInto(targetNote, "html");
    });
  });
  
  MNUtil.showHUD(`✅ Merged ${sourceNotes.length} notes`);
  targetNote.focusInMindMap();
}
```

---

## 13. PDF Page Location Tracking System

One of the most powerful features for reading workflows is the ability to save and restore PDF page locations. This pattern is used in MNSnipaste and other production plugins.

### 13.1 Core Concept

```javascript
// Location state object
const LocationState = {
  docMd5: string,      // Document identifier
  pageIndex: number,   // 0-based page index
  noteId: string,      // Optional: Associated note
  timestamp: number    // When location was saved
};
```

### 13.2 Complete Implementation

```javascript
// === LOCATION MANAGER ===

class LocationManager {
  constructor() {
    this.locations = this.loadLocations();
  }
  
  // Save current location
  saveCurrentLocation(name = "default") {
    const location = {
      name: name,
      docMd5: MNUtil.currentDocMd5,
      pageIndex: MNUtil.currentDocController?.currPageIndex,
      noteId: MNNote.getFocusNote()?.noteId,
      timestamp: Date.now()
    };
    
    this.locations[name] = location;
    this.persist();
    
    return location;
  }
  
  // Restore saved location
  async restoreLocation(name = "default") {
    const location = this.locations[name];
    if (!location) {
      MNUtil.showHUD(`Location "${name}" not found`);
      return false;
    }
    
    return await this.jumpToLocation(location);
  }
  
  // Jump to specific location
  async jumpToLocation(location) {
    // Step 1: Open document if needed
    if (location.docMd5 && location.docMd5 !== MNUtil.currentDocMd5) {
      MNUtil.openDoc(location.docMd5);
      
      // Ensure document view is visible
      const currentMode = MNUtil.studyController.docMapSplitMode;
      if (currentMode === 0) {
        // Mind map only → switch to split mode
        MNUtil.studyController.docMapSplitMode = 1;
      }
      
      // Wait for document to load
      await MNUtil.delay(0.1);
    }
    
    // Step 2: Jump to page
    if (location.pageIndex !== undefined) {
      const docController = MNUtil.currentDocController;
      
      if (docController) {
        const currentPage = docController.currPageIndex;
        
        if (currentPage !== location.pageIndex) {
          docController.setPageAtIndex(location.pageIndex);
          await MNUtil.delay(0.05);
        }
      }
    }
    
    // Step 3: Focus note if exists
    if (location.noteId) {
      const note = MNNote.new(location.noteId);
      
      if (note) {
        const mode = MNUtil.studyController.docMapSplitMode;
        
        // Focus in appropriate views
        if (mode === 0 || mode === 1) {
          // Mind map visible
          note.focusInMindMap();
        }
        
        if (mode === 1 || mode === 2) {
          // Document visible
          note.focusInDocument();
        }
      }
    }
    
    MNUtil.showHUD(`📍 Jumped to: ${location.name}`);
    return true;
  }
  
  // List all saved locations
  listLocations() {
    return Object.entries(this.locations).map(([name, loc]) => ({
      name: name,
      timestamp: new Date(loc.timestamp).toLocaleString(),
      page: loc.pageIndex + 1,  // Convert to 1-based
      docMd5: loc.docMd5.substring(0, 8) + "..."
    }));
  }
  
  // Delete location
  deleteLocation(name) {
    if (this.locations[name]) {
      delete this.locations[name];
      this.persist();
      return true;
    }
    return false;
  }
  
  // Persistence
  loadLocations() {
    const saved = NSUserDefaults.standardUserDefaults()
      .objectForKey("LocationManager_locations");
    
    return saved ? JSON.parse(saved) : {};
  }
  
  persist() {
    const json = JSON.stringify(this.locations);
    NSUserDefaults.standardUserDefaults()
      .setObjectForKey(json, "LocationManager_locations");
    NSUserDefaults.standardUserDefaults().synchronize();
  }
}
```

### 13.3 UI Integration

```javascript
// === FLOATING LOCATION BUTTON ===

class LocationButton {
  constructor(locationManager) {
    this.manager = locationManager;
    this.button = null;
    this.currentLocation = null;
  }
  
  create() {
    // Create button
    this.button = UIButton.buttonWithType(0);
    this.button.frame = {x: 10, y: 100, width: 50, height: 50};
    
    // Set icon
    const icon = UIImage.imageNamed("location.png");
    this.button.setImageForState(icon, 0);
    
    // Rounded corners
    this.button.layer.cornerRadius = 25;
    this.button.layer.masksToBounds = true;
    
    // Shadow
    this.button.layer.shadowOpacity = 0.3;
    this.button.layer.shadowRadius = 5;
    this.button.layer.shadowOffset = {width: 0, height: 2};
    
    // Single tap: Save location
    this.button.addTargetActionForControlEvents(
      self,
      "onLocationSingleTap:",
      1 << 6  // TouchUpInside
    );
    
    // Long press: Show menu
    const longPress = new UILongPressGestureRecognizer(
      self,
      "onLocationLongPress:"
    );
    longPress.minimumPressDuration = 0.5;
    this.button.addGestureRecognizer(longPress);
    
    // Add to view
    MNUtil.studyView.addSubview(this.button);
    
    // Update badge
    this.updateBadge();
  }
  
  updateBadge() {
    const count = Object.keys(this.manager.locations).length;
    
    if (count > 0) {
      // Add badge label
      const badge = UILabel.new();
      badge.frame = {x: 35, y: 0, width: 20, height: 20};
      badge.text = count.toString();
      badge.textAlignment = 1; // Center
      badge.backgroundColor = UIColor.redColor();
      badge.textColor = UIColor.whiteColor();
      badge.font = UIFont.boldSystemFontOfSize(12);
      badge.layer.cornerRadius = 10;
      badge.layer.masksToBounds = true;
      
      this.button.addSubview(badge);
    }
  }
  
  onSingleTap() {
    // Save current location
    const location = this.manager.saveCurrentLocation(
      `Location ${Date.now()}`
    );
    
    this.currentLocation = location;
    this.updateBadge();
    
    MNUtil.showHUD("📍 Location saved!");
  }
  
  async onLongPress(gesture) {
    if (gesture.state !== 1) return;  // Began state
    
    // Show location menu
    const locations = this.manager.listLocations();
    
    if (locations.length === 0) {
      MNUtil.showHUD("No saved locations");
      return;
    }
    
    const options = locations.map(loc => 
      `${loc.name} (Page ${loc.page})`
    );
    
    const selected = await MNUtil.select(
      "Saved Locations",
      options
    );
    
    if (selected > 0) {
      const locationName = locations[selected - 1].name;
      await this.manager.restoreLocation(locationName);
    }
  }
  
  cleanup() {
    if (this.button) {
      this.button.removeFromSuperview();
      this.button = null;
    }
  }
}
```

### 13.4 Advanced: History Stack

```javascript
// === LOCATION HISTORY (Back/Forward Navigation) ===

class LocationHistory {
  constructor(maxSize = 50) {
    this.maxSize = maxSize;
    this.history = [];
    this.currentIndex = -1;
  }
  
  // Record new location
  recordLocation(location) {
    // Remove any forward history
    this.history = this.history.slice(0, this.currentIndex + 1);
    
    // Add new location
    this.history.push(location);
    
    // Trim if exceeds max size
    if (this.history.length > this.maxSize) {
      this.history.shift();
    } else {
      this.currentIndex++;
    }
  }
  
  // Go back
  canGoBack() {
    return this.currentIndex > 0;
  }
  
  async goBack() {
    if (!this.canGoBack()) {
      MNUtil.showHUD("No previous location");
      return false;
    }
    
    this.currentIndex--;
    const location = this.history[this.currentIndex];
    await this.jumpToLocation(location);
    return true;
  }
  
  // Go forward
  canGoForward() {
    return this.currentIndex < this.history.length - 1;
  }
  
  async goForward() {
    if (!this.canGoForward()) {
      MNUtil.showHUD("No next location");
      return false;
    }
    
    this.currentIndex++;
    const location = this.history[this.currentIndex];
    await this.jumpToLocation(location);
    return true;
  }
}
```

---

## 14. Debugging & Troubleshooting Production Issues

### 14.1 Comprehensive Logging Strategy

```javascript
// === STRUCTURED LOGGING SYSTEM ===

class PluginLogger {
  constructor(pluginName) {
    this.pluginName = pluginName;
    this.logs = [];
    this.maxLogs = 1000;
  }
  
  log(level, message, detail = {}) {
    const entry = {
      level: level,
      timestamp: new Date().toISOString(),
      plugin: this.pluginName,
      message: message,
      detail: detail
    };
    
    // Add to memory buffer
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
    
    // Output to MNUtil if available
    if (typeof MNUtil !== 'undefined' && MNUtil.log) {
      MNUtil.log({
        source: `${this.pluginName}:${detail.function || 'Unknown'}`,
        message: message,
        level: level,
        detail: detail
      });
    }
    
    // Output to console
    const prefix = this.getLevelPrefix(level);
    console.log(`${prefix} [${this.pluginName}] ${message}`, detail);
    
    // Auto-copy errors
    if (level === 'ERROR' && typeof MNUtil !== 'undefined') {
      MNUtil.copyJSON({
        error: message,
        detail: detail,
        timestamp: entry.timestamp,
        stack: new Error().stack
      });
    }
  }
  
  getLevelPrefix(level) {
    const prefixes = {
      DEBUG: '🔧',
      INFO: 'ℹ️',
      WARN: '⚠️',
      ERROR: '❌',
      SUCCESS: '✅'
    };
    return prefixes[level] || 'ℹ️';
  }
  
  debug(message, detail) {
    this.log('DEBUG', message, detail);
  }
  
  info(message, detail) {
    this.log('INFO', message, detail);
  }
  
  warn(message, detail) {
    this.log('WARN', message, detail);
  }
  
  error(message, detail) {
    this.log('ERROR', message, detail);
  }
  
  success(message, detail) {
    this.log('SUCCESS', message, detail);
  }
  
  // Export logs
  exportLogs() {
    const markdown = this.logs.map(entry => {
      return `## ${entry.timestamp} - ${entry.level}\n**${entry.message}**\n\`\`\`json\n${JSON.stringify(entry.detail, null, 2)}\n\`\`\`\n`;
    }).join('\n');
    
    MNUtil.copy(markdown);
    MNUtil.showHUD("📋 Logs copied to clipboard");
  }
}

// Usage
const logger = new PluginLogger("MyPlugin");

logger.info("Plugin initialized", {
  version: "1.0.0",
  notebookId: topicid
});

logger.error("Failed to process note", {
  function: "processNote",
  noteId: note.noteId,
  error: error.message
});
```

### 14.2 Performance Profiling

```javascript
// === PERFORMANCE TRACKER ===

class PerformanceProfiler {
  constructor() {
    this.timers = new Map();
    this.metrics = [];
  }
  
  start(label) {
    this.timers.set(label, Date.now());
  }
  
  end(label) {
    const startTime = this.timers.get(label);
    if (!startTime) {
      console.warn(`Timer "${label}" not found`);
      return;
    }
    
    const duration = Date.now() - startTime;
    this.timers.delete(label);
    
    const metric = {
      label: label,
      duration: duration,
      timestamp: Date.now()
    };
    
    this.metrics.push(metric);
    
    // Log slow operations
    if (duration > 1000) {
      logger.warn(`Slow operation: ${label}`, {
        duration: `${duration}ms`
      });
    }
    
    return duration;
  }
  
  measure(label, fn) {
    this.start(label);
    try {
      const result = fn();
      this.end(label);
      return result;
    } catch (error) {
      this.end(label);
      throw error;
    }
  }
  
  async measureAsync(label, fn) {
    this.start(label);
    try {
      const result = await fn();
      this.end(label);
      return result;
    } catch (error) {
      this.end(label);
      throw error;
    }
  }
  
  report() {
    const summary = {};
    
    this.metrics.forEach(metric => {
      if (!summary[metric.label]) {
        summary[metric.label] = {
          count: 0,
          totalDuration: 0,
          minDuration: Infinity,
          maxDuration: -Infinity
        };
      }
      
      const stats = summary[metric.label];
      stats.count++;
      stats.totalDuration += metric.duration;
      stats.minDuration = Math.min(stats.minDuration, metric.duration);
      stats.maxDuration = Math.max(stats.maxDuration, metric.duration);
    });
    
    // Calculate averages
    Object.keys(summary).forEach(label => {
      summary[label].avgDuration = 
        summary[label].totalDuration / summary[label].count;
    });
    
    return summary;
  }
}

// Usage
const profiler = new PerformanceProfiler();

// Synchronous
profiler.measure("loadNotes", () => {
  return MNNote.getAllNotes();
});

// Asynchronous
await profiler.measureAsync("apiCall", async () => {
  return await fetch("https://api.example.com/data");
});

// Manual timing
profiler.start("complexOperation");
// ... operations ...
const duration = profiler.end("complexOperation");
```

### 14.3 Error Boundary Pattern

```javascript
// === ERROR BOUNDARY ===

function withErrorBoundary(fn, context = {}) {
  return async function(...args) {
    try {
      return await fn.apply(this, args);
      
    } catch (error) {
      // Log error
      logger.error(error.message, {
        function: context.functionName || fn.name || 'anonymous',
        context: context,
        args: args,
        stack: error.stack
      });
      
      // Show user-friendly message
      MNUtil.showHUD(`❌ Error: ${error.message}`);
      
      // Auto-copy for debugging
      if (typeof MNUtil !== 'undefined') {
        MNUtil.copyJSON({
          error: error.toString(),
          message: error.message,
          stack: error.stack,
          context: context
        });
      }
      
      // Rethrow if fatal
      if (context.fatal) {
        throw error;
      }
      
      return context.fallback || null;
    }
  };
}

// Usage
const safeProcessNote = withErrorBoundary(
  async function(note) {
    if (!note) throw new Error("Note is null");
    
    // Process note
    note.noteTitle = "✅ " + note.noteTitle;
    return note;
  },
  {
    functionName: "processNote",
    fatal: false,
    fallback: null
  }
);

// Call safely
const result = await safeProcessNote(note);
```

---

## Conclusion

This comprehensive guide covers the essential knowledge for MarginNote plugin development, from basic concepts to advanced patterns. Key takeaways:

✅ **Understand the lifecycle**: Know when your code runs  
✅ **Master MNUtils**: Leverage the framework for efficiency  
✅ **Use patterns**: Registry, configuration-driven, modular  
✅ **Follow best practices**: Error handling, testing, UX  
✅ **Learn from examples**: Study real plugins like MNUtils, MNToolbar, MNTask

### Next Steps

1. **Practice**: Start with simple utilities
2. **Study**: Analyze existing plugins
3. **Build**: Create your own workflow automation
4. **Share**: Contribute to the community

### Resources

- **MNUtils API Guide**: Complete API reference
- **Plugin Tutorials**: Step-by-step guides
- **Community Forum**: Get help and share ideas
- **Example Plugins**: Study production code

Happy coding! 🚀
