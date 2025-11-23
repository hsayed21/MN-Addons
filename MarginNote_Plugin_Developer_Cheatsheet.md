# MarginNote Plugin Developer Cheatsheet

> **Quick Reference** - Copy-Paste Code Snippets for MarginNote 4 Plugin Development
> 
> Last Updated: 2025-01-10

## 📋 Table of Contents

- [Plugin Boilerplate](#plugin-boilerplate)
- [Lifecycle Methods](#lifecycle-methods)
- [MNUtils Snippets](#mnutils-snippets)
- [Note Operations](#note-operations)
- [UI Interactions](#ui-interactions)
- [File & Storage](#file-storage)
- [Network Requests](#network-requests)
- [WebView Integration](#webview-integration)
- [Common Patterns](#common-patterns)
- [Debugging](#debugging)

---

## Plugin Boilerplate

### Minimal Plugin Template

```javascript
JSB.newAddon = function(mainPath) {
  return JSB.defineClass('PluginName : JSExtension', {
    
    sceneWillConnect: function() {
      self.mainPath = mainPath;
      // Initialize plugin
    },
    
    toggleAddon: function() {
      // Main action when user clicks plugin icon
      MNUtil.showHUD("Plugin activated!");
    }
  });
};
```

### Plugin with MNUtils

```javascript
JSB.newAddon = function(mainPath) {
  return JSB.defineClass('PluginName : JSExtension', {
    
    sceneWillConnect: function() {
      self.mainPath = mainPath;
      
      try {
        JSB.require('mnutils');
        MNUtil.init(mainPath);
        MNUtil.showHUD("✅ Plugin loaded!");
      } catch (error) {
        Application.sharedInstance().showHUD(
          "⚠️ Please install MNUtils first",
          self.window, 3
        );
      }
    },
    
    toggleAddon: function() {
      let note = MNNote.getFocusNote();
      if (note) {
        MNUtil.showHUD("Note: " + note.noteTitle);
      } else {
        MNUtil.showHUD("No note selected");
      }
    }
  });
};
```

### Multi-File Plugin Structure

```javascript
// main.js
JSB.newAddon = function(mainPath) {
  JSB.require('utils');
  JSB.require('webviewController');
  
  return JSB.defineClass('PluginName : JSExtension', {
    sceneWillConnect: function() {
      PluginUtils.init(mainPath);
    },
    
    toggleAddon: function() {
      WebviewController.show();
    }
  });
};
```

---

## Lifecycle Methods

### Complete Lifecycle

```javascript
JSB.newAddon = function(mainPath) {
  return JSB.defineClass('LifecycleDemo : JSExtension', {
    
    // 1. Plugin loads
    sceneWillConnect: function() {
      self.mainPath = mainPath;
      MNUtil.log("Plugin loading...");
    },
    
    // 2. Scene active
    sceneDidConnect: function() {
      MNUtil.log("Scene connected");
    },
    
    // 3. Before notebook opens
    notebookWillOpen: function(notebookId) {
      MNUtil.log("Opening notebook:", notebookId);
    },
    
    // 4. After notebook opens
    notebookDidOpen: function(notebookId) {
      let notebook = Database.sharedInstance()
        .getNotebookById(notebookId);
      MNUtil.log("Notebook opened:", notebook.title);
    },
    
    // 5. Before document opens
    documentDidOpen: function(docMd5) {
      MNUtil.log("Document opened:", docMd5);
    },
    
    // 6. Plugin icon clicked
    toggleAddon: function() {
      MNUtil.log("Plugin activated");
    },
    
    // 7. Scene will disconnect
    sceneWillDisconnect: function() {
      MNUtil.log("Cleaning up...");
      // Save state, remove observers
    }
  });
};
```

### Event Observers

```javascript
// Register for notifications
sceneWillConnect: function() {
  NSNotificationCenter.defaultCenter()
    .addObserverSelectorName(
      self,
      "onNoteChange:",
      "NoteDidChangeNotification"
    );
},

// Handle notification
onNoteChange: function(sender) {
  let note = sender.userInfo.note;
  MNUtil.log("Note changed:", note.noteId);
},

// Clean up
sceneWillDisconnect: function() {
  NSNotificationCenter.defaultCenter()
    .removeObserver(self);
}
```

---

## MNUtils Snippets

### Show Messages

```javascript
// Simple HUD
MNUtil.showHUD("Hello!");

// HUD with duration
MNUtil.showHUD("Processing...", 5);

// Loading indicator
MNUtil.waitHUD("Loading...");
// ... do work ...
MNUtil.stopHUD();
```

### Dialogs

```javascript
// Confirm dialog
MNUtil.confirm("Title", "Are you sure?").then(ok => {
  if (ok) {
    MNUtil.showHUD("Confirmed");
  }
});

// Input dialog
MNUtil.input("Enter Name", "Prompt", "Default").then(text => {
  if (text) {
    MNUtil.showHUD("You entered: " + text);
  }
});

// Selection menu
let options = ["Option A", "Option B", "Option C"];
MNUtil.select("Choose One", options).then(index => {
  if (index >= 0) {
    MNUtil.showHUD("Selected: " + options[index]);
  }
});
```

### Delay & Async

```javascript
// Delay execution
MNUtil.delay(2).then(() => {
  MNUtil.showHUD("Executed after 2 seconds");
});

// Wait for condition
async function waitForNote() {
  await MNUtil.waitUntil(() => {
    return MNNote.getFocusNote() !== null;
  });
  MNUtil.showHUD("Note selected!");
}
```

---

## Note Operations

### Get Notes

```javascript
// Get focused note
let note = MNNote.getFocusNote();

// Get all selected notes
let notes = MNNote.getFocusNotes();

// Get note by ID
let note = MNUtil.getNoteById(noteId);

// Get current notebook
let notebook = MNUtil.currentNotebook;

// Get all notes in notebook
let allNotes = notebook.notes;
```

### Modify Notes

```javascript
// Wrap modifications in undo group
MNUtil.undoGrouping(() => {
  let note = MNNote.getFocusNote();
  
  // Set title
  note.noteTitle = "New Title";
  
  // Set color (0-15)
  note.colorIndex = 3;
  
  // Set fill style (0-15)
  note.fillIndex = 0;
  
  // Append comment
  note.appendComment("New comment");
});
```

### Create Notes

```javascript
// Create new note
MNUtil.undoGrouping(() => {
  let notebook = MNUtil.currentNotebook;
  let note = notebook.createNote();
  
  note.noteTitle = "New Note";
  note.excerptText = "Content";
  note.colorIndex = 5;
  
  MNUtil.showHUD("Note created!");
});
```

### Comment Operations

```javascript
let note = MNNote.getFocusNote();

// Append comment
note.appendComment("New comment");

// Insert comment after index
note.insertCommentAfter(0, "Comment at position 1");

// Get comment HTML
let html = note.getCommentHTML(0);

// Modify comment
note.modifyComment(0, "Updated text");

// Delete comment
note.deleteComment(0);

// Get all comments
let comments = note.comments;
```

### Hierarchical Operations

```javascript
let note = MNNote.getFocusNote();

// Get children
let children = note.childNotes;

// Get parent
let parent = note.parentNote;

// Check if has children
if (note.hasChildren()) {
  MNUtil.log("Has " + children.length + " children");
}

// Get ancestors
let ancestors = note.getAncestors();

// Find notes by title
let matches = note.findNotesByTitle("search term");
```

---

## UI Interactions

### Menus

```javascript
// Create menu
function showMenu() {
  let alert = UIAlertView.alloc()
    .initWithTitleMessageDelegateCancelButtonTitleOtherButtonTitles(
      "Menu Title",
      "Description",
      self,
      "Cancel",
      ["Option 1", "Option 2", "Option 3"]
    );
  alert.show();
}

// Handle menu selection
alertViewClickedButtonAtIndex: function(alertView, buttonIndex) {
  if (buttonIndex === 0) return; // Cancel
  
  switch(buttonIndex) {
    case 1:
      MNUtil.showHUD("Option 1 selected");
      break;
    case 2:
      MNUtil.showHUD("Option 2 selected");
      break;
    case 3:
      MNUtil.showHUD("Option 3 selected");
      break;
  }
}
```

### Input Fields

```javascript
// Text input dialog
function showInput() {
  let alert = UIAlertView.alloc()
    .initWithTitleMessageDelegateCancelButtonTitleOtherButtonTitles(
      "Input Title",
      "Enter text:",
      self,
      "Cancel",
      ["OK"]
    );
  
  alert.alertViewStyle = 2; // Text input
  alert.textFieldAtIndex(0).text = "Default value";
  alert.show();
}

// Get input value
alertViewClickedButtonAtIndex: function(alertView, buttonIndex) {
  if (buttonIndex === 1) {
    let text = alertView.textFieldAtIndex(0).text;
    MNUtil.showHUD("You entered: " + text);
  }
}
```

### Buttons

```javascript
// Create button
let button = UIButton.buttonWithType(0);

// Set appearance
button.setTitleForState("Click Me", 0);
button.backgroundColor = UIColor.colorWithHexString("#457bd3");
button.layer.cornerRadius = 5;
button.frame = {x: 20, y: 20, width: 100, height: 40};

// Add click handler
button.addTargetActionForControlEvents(
  self,
  "buttonClicked:",
  1 << 6  // TouchUpInside
);

// Handle click
buttonClicked: function(sender) {
  MNUtil.showHUD("Button clicked!");
}
```

---

## File & Storage

### UserDefaults (Simple Storage)

```javascript
// Save value
function save(key, value) {
  NSUserDefaults.standardUserDefaults()
    .setObjectForKey(value, key);
  NSUserDefaults.standardUserDefaults().synchronize();
}

// Get value
function get(key, defaultValue = null) {
  let value = NSUserDefaults.standardUserDefaults()
    .objectForKey(key);
  return value !== null ? value : defaultValue;
}

// Save JSON
function saveJSON(key, obj) {
  save(key, JSON.stringify(obj));
}

// Get JSON
function getJSON(key, defaultValue = null) {
  let json = get(key);
  if (json) {
    try {
      return JSON.parse(json);
    } catch (e) {
      return defaultValue;
    }
  }
  return defaultValue;
}
```

### File Operations (MNUtils)

```javascript
// Read text file
let content = MNUtil.readText("/path/to/file.txt");

// Write text file
MNUtil.writeText("/path/to/file.txt", "content");

// Read JSON file
let data = MNUtil.readJSON("/path/to/data.json");

// Write JSON file
MNUtil.writeJSON("/path/to/data.json", {key: "value"});

// Check if file exists
let exists = NSFileManager.defaultManager()
  .fileExistsAtPath("/path/to/file");
```

### Clipboard

```javascript
// Copy text
MNUtil.copy("Hello World");

// Copy JSON
MNUtil.copyJSON({name: "test", value: 123});

// Paste text
let text = MNUtil.paste();

// Paste as JSON
let obj = MNUtil.pasteAsJSON();
```

---

## Network Requests

### GET Request

```javascript
async function fetchData(url) {
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

// Usage
async function loadData() {
  try {
    MNUtil.waitHUD("Loading...");
    let data = await fetchData("https://api.example.com/data");
    MNUtil.stopHUD();
    MNUtil.showHUD("Data loaded!");
  } catch (error) {
    MNUtil.stopHUD();
    MNUtil.showHUD("Error: " + error.localizedDescription);
  }
}
```

### POST Request

```javascript
async function postData(url, body) {
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

// Usage
async function submitData() {
  let data = {name: "test", value: 123};
  let result = await postData("https://api.example.com/submit", data);
  MNUtil.showHUD("Submitted!");
}
```

---

## WebView Integration

### Create WebView Window

```javascript
class WebviewController {
  constructor() {
    this.window = null;
    this.webView = null;
  }
  
  show() {
    if (!this.window) {
      this.createWindow();
    }
    this.window.makeKeyAndVisible();
  }
  
  hide() {
    if (this.window) {
      this.window.hidden = true;
    }
  }
  
  createWindow() {
    // Create window
    let frame = {x: 100, y: 100, width: 600, height: 800};
    this.window = UIWindow.alloc().initWithFrame(frame);
    
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
    
    // Set up message handler
    this.webView.configuration.userContentController
      .addScriptMessageHandlerName(this, "jsMessageHandler");
    
    this.window.addSubview(this.webView);
  }
  
  // Receive messages from WebView
  userContentControllerDidReceiveScriptMessage(controller, message) {
    let data = message.body;
    MNUtil.log("Received from WebView:", data);
  }
  
  // Send message to WebView
  sendToWebView(message) {
    let script = `window.receiveFromNative(${JSON.stringify(message)})`;
    this.webView.evaluateJavaScriptCompletionHandler(script, null);
  }
}
```

### HTML Template

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      padding: 20px;
      margin: 0;
    }
  </style>
</head>
<body>
  <h1>My Plugin UI</h1>
  <button onclick="sendToNative()">Send to Native</button>
  
  <script>
    // Send message to native
    function sendToNative() {
      window.webkit.messageHandlers.jsMessageHandler
        .postMessage({
          action: "test",
          data: {timestamp: Date.now()}
        });
    }
    
    // Receive message from native
    window.receiveFromNative = function(message) {
      console.log("Received:", message);
    };
  </script>
</body>
</html>
```

---

## Common Patterns

### Registry Pattern

```javascript
// Button registry
global.registerButton = function(id, config) {
  if (!global.buttonRegistry) {
    global.buttonRegistry = new Map();
  }
  global.buttonRegistry.set(id, config);
};

// Menu registry
global.registerMenuTemplate = function(id, template) {
  if (!global.menuRegistry) {
    global.menuRegistry = new Map();
  }
  global.menuRegistry.set(id, template);
};

// Action registry
global.registerCustomAction = function(id, handler) {
  if (!global.actionRegistry) {
    global.actionRegistry = new Map();
  }
  global.actionRegistry.set(id, handler);
};

// Execute action
global.executeCustomAction = async function(actionId, context) {
  let handler = global.actionRegistry.get(actionId);
  if (handler) {
    await handler(context);
    return true;
  }
  return false;
};
```

### Batch Processing

```javascript
async function batchProcess(notes, processFn) {
  MNUtil.waitHUD("Processing...");
  
  let processed = 0;
  let failed = 0;
  
  for (let i = 0; i < notes.length; i++) {
    try {
      await processFn(notes[i]);
      processed++;
    } catch (error) {
      failed++;
      MNUtil.log("Error processing note:", error);
    }
    
    // Update progress
    let progress = Math.round((i + 1) / notes.length * 100);
    MNUtil.showHUD(`Processing... ${progress}%`);
  }
  
  MNUtil.stopHUD();
  MNUtil.showHUD(`✅ Done! ${processed} succeeded, ${failed} failed`);
}

// Usage
let notes = MNNote.getFocusNotes();
await batchProcess(notes, async (note) => {
  note.colorIndex = 3;
});
```

### Configuration Manager

```javascript
class Config {
  static KEY = "MyPlugin_Config";
  
  static defaults = {
    enabled: true,
    theme: "light",
    fontSize: 14
  };
  
  static load() {
    let json = NSUserDefaults.standardUserDefaults()
      .objectForKey(this.KEY);
    
    if (json) {
      try {
        return {...this.defaults, ...JSON.parse(json)};
      } catch (e) {
        return this.defaults;
      }
    }
    
    return this.defaults;
  }
  
  static save(config) {
    let json = JSON.stringify(config);
    NSUserDefaults.standardUserDefaults()
      .setObjectForKey(json, this.KEY);
    NSUserDefaults.standardUserDefaults().synchronize();
  }
  
  static get(key, defaultValue) {
    let config = this.load();
    return config[key] !== undefined ? config[key] : defaultValue;
  }
  
  static set(key, value) {
    let config = this.load();
    config[key] = value;
    this.save(config);
  }
}

// Usage
Config.set("theme", "dark");
let theme = Config.get("theme");
```

### Error Handler

```javascript
class ErrorHandler {
  static handle(error, context = {}) {
    // Log error
    MNUtil.addErrorLog(error, "ErrorHandler", context);
    
    // Show user-friendly message
    let message = this.getUserMessage(error);
    MNUtil.showHUD("⚠️ " + message);
    
    // Optionally report to server
    this.report(error, context);
  }
  
  static getUserMessage(error) {
    if (error.code === 404) {
      return "Not found";
    } else if (error.code === 403) {
      return "Permission denied";
    } else if (error.message) {
      return error.message;
    }
    return "An error occurred";
  }
  
  static report(error, context) {
    // Send to analytics/monitoring service
  }
}

// Usage
try {
  riskyOperation();
} catch (error) {
  ErrorHandler.handle(error, {
    operation: "riskyOperation",
    noteId: note.noteId
  });
}
```

---

## Debugging

### Console Logging

```javascript
// Basic logging
MNUtil.log("Debug message");
MNUtil.log("Value:", variable);
MNUtil.log("Object:", {key: "value"});

// Conditional logging
const DEBUG = true;
if (DEBUG) {
  MNUtil.log("Detailed debug info");
}

// Log with timestamp
function debugLog(message) {
  let timestamp = new Date().toLocaleTimeString();
  MNUtil.log(`[${timestamp}] ${message}`);
}
```

### Object Inspection

```javascript
// Copy to clipboard
function inspect(obj, name = "object") {
  MNUtil.copyJSON(obj);
  MNUtil.showHUD(`${name} copied to clipboard!`);
}

// Log properties
function inspectObject(obj, name = "object") {
  MNUtil.log(`Inspecting ${name}:`);
  for (let key in obj) {
    MNUtil.log(`  ${key}: ${obj[key]}`);
  }
}

// Get type
function getType(value) {
  if (value === null) return "null";
  if (value === undefined) return "undefined";
  if (Array.isArray(value)) return "array";
  return typeof value;
}
```

### Performance Measurement

```javascript
// Measure execution time
function measure(fn, name = "operation") {
  let start = Date.now();
  let result = fn();
  let duration = Date.now() - start;
  MNUtil.log(`${name} took ${duration}ms`);
  return result;
}

// Usage
measure(() => {
  // Some expensive operation
}, "batchProcess");
```

### Stack Trace

```javascript
// Get stack trace
function getStackTrace() {
  try {
    throw new Error();
  } catch (e) {
    return e.stack;
  }
}

// Log call stack
function logStack() {
  MNUtil.log("Stack trace:", getStackTrace());
}
```

---

## Quick Command Reference

### Essential Shortcuts

```javascript
// Get focused note
let n = MNNote.getFocusNote();

// Get all selected notes
let ns = MNNote.getFocusNotes();

// Show message
MNUtil.showHUD("msg");

// Undo grouping
MNUtil.undoGrouping(() => { /* changes */ });

// Confirm
await MNUtil.confirm("Title", "Message");

// Input
let text = await MNUtil.input("Title", "Prompt", "Default");

// Select
let index = await MNUtil.select("Title", ["A", "B", "C"]);

// Delay
await MNUtil.delay(seconds);

// Copy
MNUtil.copy(text);

// Save config
NSUserDefaults.standardUserDefaults().setObjectForKey(value, key);

// Load config
let v = NSUserDefaults.standardUserDefaults().objectForKey(key);
```

---

## Advanced Architecture Patterns

### MNToolbar Registry Pattern (Zero-Invasion Extension)

```javascript
// === THREE-LAYER DECOUPLED ARCHITECTURE ===

// Layer 1: Button Registration (xdyy_button_registry.js)
global.registerButton = function(buttonId, config) {
  global.buttonRegistry = global.buttonRegistry || {};
  global.buttonRegistry[buttonId] = config;
};

global.registerButton("custom16", {
  name: "My Function",
  image: "custom16",
  templateName: "menu_myfunction"
});

// Layer 2: Menu Template (xdyy_menu_registry.js)
global.registerMenuTemplate = function(templateName, config) {
  global.menuTemplates = global.menuTemplates || {};
  global.menuTemplates[templateName] = config;
};

global.registerMenuTemplate("menu_myfunction", {
  action: "myAction",              // Single click
  doubleClick: {                   // Double click
    action: "myActionAlt"
  },
  onLongPress: {                   // Long press
    action: "menu",
    menuWidth: 200,
    menuItems: [
      {action: "option1", menuTitle: "Option 1"},
      {action: "option2", menuTitle: "Option 2"}
    ]
  }
});

// Layer 3: Action Implementation (xdyy_custom_actions_registry.js)
global.registerCustomAction = function(actionName, handler) {
  global.customActions = global.customActions || {};
  global.customActions[actionName] = handler;
};

global.registerCustomAction("myAction", async function(context) {
  const { button, des, focusNote, focusNotes, self } = context;
  
  if (!focusNote) {
    MNUtil.showHUD("❌ Please select a note");
    return;
  }
  
  MNUtil.undoGrouping(() => {
    focusNote.noteTitle = "✅ " + (focusNote.noteTitle || "");
    MNUtil.showHUD("✅ Processed!");
  });
});

// Main integration (webviewController.js)
async function customActionByDes(des, button, controller) {
  // Check for custom action
  if (typeof global !== 'undefined' && global.customActions) {
    const handler = global.customActions[des.action];
    if (handler) {
      const context = { button, des, focusNote, focusNotes, self: controller };
      await handler(context);
      return true;
    }
  }
  return false;
}
```

### Configuration-Driven Architecture (MNPinner Pattern)

```javascript
// === SECTION REGISTRY PATTERN ===
// Eliminates switch-case statements, reduces code by 83%

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
      action: () => note.focusInMindMap()
    }),
    filter: (items, keyword) => {
      return items.filter(note => 
        note.noteTitle.includes(keyword)
      );
    }
  },
  
  bookmarks: {
    icon: "⭐",
    title: "Bookmarks",
    color: "#F5A623",
    fetchData: async () => {
      return MNNote.getBookmarkedNotes();
    },
    renderItem: (note) => ({
      title: note.noteTitle,
      subtitle: note.notebookId,
      action: () => note.focusInDocument()
    })
  }
  
  // Add new sections without touching core code!
};

// Dynamic UI generation
function renderSection(sectionKey) {
  const config = SECTION_REGISTRY[sectionKey];
  if (!config) return;
  
  const data = await config.fetchData();
  const container = createSectionContainer(config);
  
  data.forEach(item => {
    const rendered = config.renderItem(item);
    container.addItem(rendered);
  });
  
  return container;
}

// Usage - add new feature by adding config only
SECTION_REGISTRY.tags = {
  icon: "🏷️",
  title: "Tags",
  fetchData: async () => MNNote.getAllTags(),
  renderItem: (tag) => ({
    title: tag.name,
    subtitle: `${tag.count} notes`,
    action: () => filterByTag(tag.name)
  })
};
```

### PDF Page Location System (MNSnipaste Pattern)

```javascript
// === SAVE AND RESTORE PDF LOCATIONS ===

// Save current location
function saveLocation() {
  return {
    docMd5: MNUtil.currentDocMd5,
    pageIndex: MNUtil.currentDocController?.currPageIndex,
    noteId: MNNote.getFocusNote()?.noteId,
    timestamp: Date.now()
  };
}

// Restore saved location
async function restoreLocation(location) {
  if (!location) return;
  
  // Open document if different
  if (location.docMd5 && location.docMd5 !== MNUtil.currentDocMd5) {
    MNUtil.openDoc(location.docMd5);
    
    // Ensure document is visible
    if (MNUtil.studyController.docMapSplitMode === 0) {
      MNUtil.studyController.docMapSplitMode = 1; // Split mode
    }
    
    // Wait for document to load
    await MNUtil.delay(0.1);
  }
  
  // Jump to saved page
  if (location.pageIndex !== undefined) {
    const docController = MNUtil.currentDocController;
    if (docController && docController.currPageIndex !== location.pageIndex) {
      docController.setPageAtIndex(location.pageIndex);
    }
  }
  
  // Focus note if exists
  if (location.noteId) {
    const note = MNNote.new(location.noteId);
    if (note) {
      const mode = MNUtil.studyController.docMapSplitMode;
      
      // Focus in appropriate view
      if (mode === 0 || mode === 1) {
        note.focusInMindMap();
      }
      if (mode === 1 || mode === 2) {
        note.focusInDocument();
      }
    }
  }
}

// Create location button
function createLocationButton(savedLocation) {
  const button = UIButton.buttonWithType(0);
  button.setImageForState(UIImage.imageNamed("loc.png"), 0);
  button.frame = {x: 10, y: 10, width: 44, height: 44};
  
  button.addTargetActionForControlEvents(
    self,
    "onLocationTap:",
    1 << 6
  );
  
  return button;
}

// Handle location tap
async function onLocationTap() {
  if (self.savedLocation) {
    await restoreLocation(self.savedLocation);
    MNUtil.showHUD("📍 Location restored");
  } else {
    MNUtil.showHUD("No saved location");
  }
}
```

### MNTask Field System Pattern

```javascript
// === FIELD-BASED TASK MANAGEMENT ===

// Field definitions
const TASK_FIELDS = {
  status: {
    type: "enum",
    values: ["todo", "doing", "done", "blocked"],
    default: "todo",
    render: (value) => {
      const icons = {
        todo: "⭕",
        doing: "🔄",
        done: "✅",
        blocked: "🚫"
      };
      return icons[value] || "⭕";
    }
  },
  
  priority: {
    type: "enum",
    values: ["low", "medium", "high", "urgent"],
    default: "medium",
    color: (value) => {
      const colors = {
        low: 7,      // Green
        medium: 5,   // Yellow
        high: 3,     // Red
        urgent: 13   // Purple
      };
      return colors[value];
    }
  },
  
  dueDate: {
    type: "date",
    format: "YYYY-MM-DD",
    validate: (value) => {
      return !isNaN(Date.parse(value));
    }
  },
  
  assignee: {
    type: "string",
    default: "Unassigned"
  }
};

// Extract field from note
function getField(note, fieldName) {
  const field = TASK_FIELDS[fieldName];
  if (!field) return null;
  
  // Parse from note title or comments
  const pattern = new RegExp(`#${fieldName}:([^\\s#]+)`);
  const match = note.noteTitle.match(pattern);
  
  return match ? match[1] : field.default;
}

// Update field in note
function setField(note, fieldName, value) {
  const field = TASK_FIELDS[fieldName];
  if (!field) return;
  
  MNUtil.undoGrouping(() => {
    // Remove old field value
    const pattern = new RegExp(`#${fieldName}:[^\\s#]+\\s*`, 'g');
    note.noteTitle = note.noteTitle.replace(pattern, '');
    
    // Add new field value
    note.noteTitle += ` #${fieldName}:${value}`;
    
    // Apply field color if defined
    if (field.color) {
      note.colorIndex = field.color(value);
    }
  });
}

// Batch update by field
function updateTasksByField(fieldName, oldValue, newValue) {
  const allNotes = MNNote.getAllNotes();
  const tasksToUpdate = allNotes.filter(note => 
    getField(note, fieldName) === oldValue
  );
  
  MNUtil.undoGrouping(() => {
    tasksToUpdate.forEach(note => {
      setField(note, fieldName, newValue);
    });
  });
  
  MNUtil.showHUD(`✅ Updated ${tasksToUpdate.length} tasks`);
}
```

### xdyyutils.js Critical Extensions

```javascript
// === IMPORTANT: Default parameter changes in xdyyutils.js ===
// These can cause bugs if you're not aware!

// ⚠️ CHANGED: getNoteById alert default
// Original MNUtil: alert defaults to TRUE
// xdyyutils: alert defaults to FALSE
MNUtil.getNoteById(noteId, alert = false)  // Now silent by default

// ⚠️ CHANGED: moveComment msg default  
// Original: msg defaults to TRUE (shows HUD)
// xdyyutils: msg defaults to FALSE (silent)
MNNote.prototype.moveComment(from, to, msg = false)

// === NEW METHODS (70+ additions) ===

// Get HTML comment by content
note.getIncludingHtmlCommentIndex(htmlComment)
// Returns: index or -1

// Convert old links to new version
note.convertLinksToNewVersion()
// marginnote3app://note/XXX → marginnote4app://note/XXX

// Advanced merge with link fixing
note.mergeInto(targetNote, htmlType = "none")
// Merges note + updates all bidirectional links + fixes markdown

// Clean up broken links
note.cleanupBrokenLinks()
// Removes links where target notes don't exist

// Get all link comment indices
note.getLinkCommentsIndexArr(targetURL)
// Returns: [0, 3, 5] (indices of link comments)

// Replace comment with markdown
note.replaceWithMarkdownComment(newURL, commentIndex)

// Append markdown comment
note.appendMarkdownComment(text)

// Move comment position
note.moveComment(fromIndex, toIndex, msg)

// Check if URL is valid MN note URL
url.ifValidNoteURL()
// Returns: boolean

// Convert URL to note ID
"marginnote4app://note/ABC-123".toNoteId()
// Returns: "ABC-123"

// Convert note ID to URL  
"ABC-123".toNoteURL()
// Returns: "marginnote4app://note/ABC-123"

// Remove bracket prefix
"[prefix] content".toNoBracketPrefixContent()
// Returns: "content"
```

---

## Next.js Integration Patterns

### MNTaskBoard / MNLiteratureBoard

```javascript
// === STANDALONE NEXT.JS APP WITH MN PLUGIN INTEGRATION ===

// Plugin side (main.js) - opens Next.js board
toggleAddon: function() {
  const boardURL = "http://localhost:3000";
  
  // Check if server is running
  MNUtil.checkURL(boardURL).then(running => {
    if (running) {
      Application.sharedInstance().openURL(
        NSURL.URLWithString(boardURL)
      );
    } else {
      MNUtil.showHUD("⚠️ Please start the board server first");
    }
  });
}

// Next.js board structure
// MNTaskBoard/
// ├── app/
// │   ├── page.tsx         # Main task board UI
// │   ├── layout.tsx       # Root layout
// │   └── globals.css      # Tailwind styles
// ├── public/
// │   ├── manifest.json    # PWA manifest
// │   └── icons/
// ├── package.json
// └── next.config.js

// PWA features for offline use
// public/manifest.json
{
  "name": "MN Task Board",
  "short_name": "MNTask",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    }
  ]
}

// Launch scripts (from LAUNCH_GUIDE.md)
// start-taskboard.sh
#!/bin/bash
cd MNTaskBoard
if ! command -v pnpm &> /dev/null; then
  npm install -g pnpm
fi
pnpm install
pnpm dev

// PM2 for production
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'mntaskboard',
    script: 'npm',
    args: 'start',
    cwd: './MNTaskBoard',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
```

---

## Advanced Debugging Techniques

### Comprehensive Logging System

```javascript
// === STRUCTURED LOGGING (from MNUtils framework) ===

// Standard log format
MNUtil.log({
  source: "PluginName:FunctionName",
  message: "Operation completed",
  level: "INFO",  // INFO, WARN, ERROR, DEBUG
  detail: {
    noteId: note.noteId,
    count: 42,
    metadata: {...}
  }
});

// Log levels
const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3
};

// Conditional logging
function log(message, level = "INFO", detail = {}) {
  if (typeof MNUtil !== 'undefined' && MNUtil.log) {
    MNUtil.log({
      source: "MyPlugin",
      message,
      level,
      detail
    });
  }
}

// Error auto-copy (MNUtils feature)
MNUtil.addErrorLog(error, "FunctionName", {
  context: "Processing note",
  noteId: note.noteId,
  timestamp: Date.now()
});
// Automatically copies error to clipboard for debugging

// Performance tracking
const startTime = Date.now();
// ... operation ...
const duration = Date.now() - startTime;
MNUtil.log({
  source: "Performance",
  message: `Operation took ${duration}ms`,
  level: "DEBUG"
});
```

### Console.app Log Viewing (macOS)

```javascript
// View logs in Console.app
// 1. Open Console.app
// 2. Filter by "MarginNote" or plugin name
// 3. Use predicates for advanced filtering

// Log format that appears in Console.app
JSB.log("plugin-myplugin %@", JSON.stringify(data));

// With emoji for easy visual scanning
MNUtil.log("🔧 Initialization complete");
MNUtil.log("✅ Success");
MNUtil.log("⚠️ Warning");
MNUtil.log("❌ Error");
```

### Safari Web Inspector (for WebView debugging)

```javascript
// Enable debugging in WebView
const webview = WKWebView.new();
const config = webview.configuration;

if (config.preferences.developerExtrasEnabled !== undefined) {
  config.preferences.setValue_forKey(true, "developerExtrasEnabled");
}

// Debug JavaScript in WebView
// 1. Right-click WebView → Inspect Element
// 2. Or Safari → Develop → [Device] → [WebView]

// Add debug hooks
window.postDebugMessage = function(msg) {
  console.log("DEBUG:", msg);
  // Also send to native
  window.webkit.messageHandlers.debug.postMessage(msg);
};
```

---

## Deployment & Build Workflows

### Using mnaddon4 Tool

```bash
# Install mnaddon4 (if not installed)
npm install -g mnaddon4

# Build single plugin
mnaddon4 build pluginname_MMDD

# Example: Build MNToolbar on Jan 17
mnaddon4 build mntoolbar_0117

# Batch build (from batch_build_addons.sh)
#!/bin/bash
for plugin in mnutils mntoolbar mntask mnpinner; do
  cd $plugin
  mnaddon4 build ${plugin}_$(date +%m%d)
  cd ..
done
```

### Plugin Directory Mapping (from mnaddon-packager agent)

```javascript
// Known plugin paths - avoid path detection
const PLUGIN_DIRECTORIES = {
  // Root level
  'gotopage': '/path/to/GoToPage/',
  'mnliterature': '/path/to/mnliterature/',
  'mntask': '/path/to/mntask/',
  
  // Nested (plugin name repeated)
  'mnutils': '/path/to/mnutils/mnutils/',
  'mntoolbar': '/path/to/mntoolbar/mntoolbar/',
  'mnbrowser': '/path/to/mnbrowser/mnbrowser/',
  
  // Special naming
  'mnai': '/path/to/mnai/mnchatglm/'
};

// Quick build function
function buildPlugin(name) {
  const path = PLUGIN_DIRECTORIES[name];
  if (!path) {
    console.error(`Unknown plugin: ${name}`);
    return;
  }
  
  const date = new Date().toISOString().slice(5, 10).replace('-', '');
  const buildName = `${name}_${date}`;
  
  process.chdir(path);
  execSync(`mnaddon4 build ${buildName}`);
}
```

### Agent-Based Workflows

```javascript
// === CLAUDE AGENTS (from .claude/agents/) ===

// 1. mn4-plugin-code-analyzer
// Use when: Need to understand plugin code, trace logic, explain implementation
// Triggers: "为什么" (why), "怎么实现" (how implemented), "这段代码" (this code)

// 2. mnaddon-packager  
// Use when: After development, need to package plugins
// Fast build: Uses predefined paths, skips exploration
// Naming: plugin_MMDD format

// Example agent invocation patterns:
// User: "为什么 MNUtils.showHUD 会自动消失？"
// → Launches mn4-plugin-code-analyzer to trace showHUD implementation

// User: "打包一下刚才修改的插件"
// → Launches mnaddon-packager to build modified plugins
```

---

## Common Color Indices

```javascript
const COLORS = {
  NONE: 0,
  PINK: 1,
  RED: 3,
  YELLOW: 5,
  GREEN: 7,
  CYAN: 9,
  BLUE: 11,
  PURPLE: 13,
  GRAY: 15
};

// Usage
note.colorIndex = COLORS.RED;
```

---

## Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| `undefined is not an object` | Accessing property of null/undefined | Check if object exists first |
| `Cannot read property 'X' of null` | Object is null | Add null check |
| `Method not found` | Wrong method name | Check API documentation |
| `Permission denied` | Accessing restricted resource | Check permissions |
| `File not found` | Wrong file path | Verify path exists |

---

This cheatsheet contains the most commonly used code snippets. For complete API documentation, see the Comprehensive Guide or MNUtils API documentation.

**Pro Tip**: Bookmark this file and use Cmd+F to quickly find snippets!
