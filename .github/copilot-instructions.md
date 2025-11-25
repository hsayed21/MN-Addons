# MarginNote 4 Plugin Development - Copilot Instructions

## 🎯 CORE PRINCIPLES
**CRITICAL RULES:**
1. **NO DOCUMENTATION/MARKDOWN CREATION** - Only generate and focus on code
2. **NO API INVENTION** - Only use verified APIs from codebase
3. **ASK WHEN UNCLEAR** - Never guess user requirements
4. **VERIFY BEFORE USE** - Search plugin files to confirm API existence
5. **UTF-8 ENCODING** - All files must use UTF-8
6. **DO NOT CREATE MARKDOWN FILES** - such as README.md or docs or guides, summaries etc.
7. **ALWAYS USE MNUTILS** - Leverage MNUtils framework for all functionalities

**CODING STANDARDS:**
- Follow existing code style and conventions
- Use clear, descriptive names for variables and functions
- DO NOT Write comments on code
- Modularize code for readability and maintainability (If applicable and large and complex)

## 🎯 PROJECT IDENTITY & ECOSYSTEM OVERVIEW
## 1. What is MarginNote 4

MarginNote 4 is a **data structure-based knowledge management system**, not just a PDF reader or note-taking software. Its core design concepts:

- **Atomization of knowledge**: Break down knowledge into the smallest manageable units (cards)
- **Structure of knowledge**: Build a knowledge system through a network of relationships
- **Knowledge mobility**: The same data flows freely between different views (document/brain map/review)
- **Computability of knowledge**: supports retrieval, linking, and automated processing

### Three-tier data architecture
1. **Card**: the atomic unit of knowledge, including titles, excerpts, and comments
2. **Document**: The carrier of knowledge, supporting PDF/EPUB and other formats
3. **Study Set**: A knowledge workspace that integrates documents, brain maps, and review

## 2. MarginNote plug-in system

### Technical basis
- **JSBridge Framework**: bridging technology between Objective-C and JavaScript
- **Runtime environment**: Safari-based JavaScript engine
- **Limitations**: No Node.js API, limited Browser API support

### Plug-in structure (.mnaddon)
```
plugin.mnaddon/
├── mnaddon.json # Plug-in configuration list
├── main.js # Plug-in main code
└── logo.png # plug-in icon
```

### Plug-in life cycle
```javascript
JSB.newAddon = () => {
  return JSB.defineClass("PluginName: JSExtension", {
    //Window life cycle
    sceneWillConnect() {}, // Create a new window
    sceneDidDisconnect() {}, // Close window

    //Notebook life cycle
    notebookWillOpen(topicid) {}, // Open notebook
    notebookWillClose(topicid) {}, // Close notebook

    //Document life cycle
    documentDidOpen(docmd5) {}, // Open document
    documentWillClose(docmd5) {} // Close the document
  })
}
```

**Attention (extremely important)! ! ! **
It needs to be written in the life cycle to bind through the selector. Methods written in the prototype cannot bind the menu.

On the contrary, using `self.xxx()` in the life cycle can only call methods in the prototype, but not methods in the life cycle.

### How to package and unpack plugins

Use `mnaddon4 build` to package and `mnaddon4 unpack` to unpack in the plug-in directory, for example:
```bash
mnaddon4 build plugin_0827
```
For packaging, use the mnaddon-package agent first.

## 3. MNUtils framework - infrastructure for plug-in development ⭐⭐⭐⭐⭐

### Why MNUtils is necessary

MNUtils is the **core infrastructure layer** of the MarginNote plug-in ecosystem:

1. **Default loading**: The framework has been automatically loaded and all plug-ins can be used directly.
2. **Complete encapsulation**: Provides 500+ API methods, covering all functional requirements
3. **Best Practices**: Design patterns proven through extensive practice
4. **Lower the threshold**: No need to understand the underlying Objective-C API

### Core components

**mnutils.js - Basic Framework (line 8,439)**
- 10 core classes, 500+ API methods
- Main categories:
  - `MNUtil`: system tool class (400+ methods)
  - `MNNote`: note operation class (180+ methods) (migrated to `mnnote.js`)
  - `MNComment`: comment management
  - `MNDocument`: document operations
  - `MNNotebook`: notebook management

**xdyyutils.js - Academic Extension (15,560 lines)**
- Optimized for academic scenarios
- Intelligent link management
- Chinese typesetting optimization (Pangu.js)

### The first step to using MNUtils

```javascript
// Must be initialized when the plugin starts
MNUtil.init(self.path);

// All APIs can then be used
let note = MNNote.getFocusNote();
MNUtil.showHUD("Hello MarginNote!");
```

## 4. How to learn and use API

### 📚 Document review order

1. **View API Guide**: `mnutils/MNUtils_API_Guide.md`
   - Complete API reference documentation
   - Contains all class and method descriptions
   - Provide rich usage examples

2. **Confirm that the method exists**: Search in `mnutils.js`, `mnnote.js` and `xdyyutils.js`
   - There may be omissions in the document, please refer to the source code.
   - Use Cmd+F to quickly locate the method

3. **Understand implementation details**: refer to `mnutils/CLAUDE.md`
   - Deep understanding of internal implementation
   - View notes and known issues

### Comprehensive type function reference

Some of the more comprehensive and complex functions implemented based on MNUtils are listed below for your reference when developing similar functions.

#### Pop-up window type

If you want to develop an "input box" + "select" type pop-up window, you can refer to:

##### 1. manageCommentsByPopup (multi-level pop-up management system)
- **Location**: `mnutils/xdyyutils.js:4419-4508`
- **Function**: Move, delete, extract and other operations of comments
- **Features**:
  - Multi-level pop-up window structure (main menu → selection method → operation confirmation)
  - Recursive navigation mode, supports returning to the previous level
  - Strategy mode handles different choices
  - Manage complex processes through callback function chains

##### 2. searchNotesInDescendants (complex search interactive system)
- **Location**: `mnutils/xdyyutils.js:8904-9121`
- **FEATURE**: Advanced search in descendant cards of multiple roots
- **Features**:
  - Loop interactive interface, no need to open dialog boxes repeatedly
  - Dynamic button state (update button text in real time according to configuration)
  - Supports multiple search configurations (type filtering, keyword expansion, excluded words, etc.)
  - Progress display and error handling mechanism

#### Detailed explanation of pop-up development mode

##### Multi-level pop-up window structure

**Core Design Patterns**:
```javascript
// 1. Use object mapping to manage options and processing functions
const optionHandlers = {
  "Option 1": () => { /* Processing logic */ },
  "Option 2": () => { /* Processing logic */ }
};

// 2. Recursive call to implement return function
function showMainDialog() {
  UIAlertView.show(..., (alert, buttonIndex) => {
    if (buttonIndex === 0) return; // Cancel

    //Enter the next level
    showSubDialog(() => {
      // Return callback: redisplay the main dialog box
      showMainDialog();
    });
  });
}

// 3. Maintain state through parameter passing
function showSubDialog(previousDialog) {
  UIAlertView.show(..., (alert, buttonIndex) => {
    if (buttonIndex === 0) {
      previousDialog(); // Return to the previous level
      return;
    }
    // Processing logic
  });
}
```

##### State management mode

**Use closures and Sets to manage selection state**:
```javascript
//Use Set to store selected items
const selectedItems = new Set();

// Pass status between pop-up windows
function showMultiSelectDialog(allOptions, selectedItems, callback) {
  // Display selected status based on selectedItems
  const displayOptions = allOptions.map((opt, idx) =>
    selectedItems.has(idx) ? `✅ ${opt}` : `☐ ${opt}`
  );

  UIAlertView.show(...displayOptions...);
}
```

##### Dynamic option generation

**Dynamically build a list of options based on data**:
```javascript
// Generate options based on note content
function getAllCommentOptions(note) {
  return note.comments.map((comment, index) => {
    const preview = comment.text.substring(0, 30);
    return `${index}: ${preview}...`;
  });
}

// Dynamically update button text
const buttonText = isEnabled ? "☑️ Enabled" : "☐ Not enabled";
```

#### Technical Points Reminder

##### Precautions for using UIAlertView
1. **alertViewStyle type**:
   - 0: Default (no input box)
   - 1: Password input
   - 2: Normal text input
   - 3: Username and password input

2. **Button Index**:
   - 0: Cancel button
   - 1+: other buttons (starting from 1)

3. **Text acquisition**:
   ```javascript
   const inputText = alert.textFieldAtIndex(0).text;
   ```

##### Performance optimization suggestions
1. **Avoid deep recursion**: Use loops instead of excessively deep recursive calls
2. **Batch operation**: Use `MNUtil.undoGrouping()` to package batch modifications
3. **Asynchronous processing**: Use `MNUtil.delay()` for long-term operations to avoid blocking
4. **Progress Tip**: If the operation exceeds 1 second, the progress HUD should be displayed.

##### Error handling mode
```javascript
try {
  // Main logic
} catch (error) {
  MNUtil.copyJSON(error);
  MNUtil.showHUD("Operation failed: " + error.message);
  // Optional: return to safe state
  this.reset();
}
```

## 5. Important reminder

1. **API version differences**
   - `xdyyutils.js` modified some default values (such as the alert parameter of `getNoteById`)
   - Please confirm whether it meets the requirements before use.

2. **Multi-window processing**
   - MarginNote supports multiple windows, and the plug-in instances of different windows are independent.
   - data must be mounted on `self` to distinguish between windows

3. **Performance Optimization**
   - Use `undoGrouping` for bulk operations
   - Use `delay` appropriately to avoid interface lags
   - Pay attention to memory management and release large objects in time

4. **Debugging Tips**
   - Use `MNLog` to record structured logs (recommended)
   - Use `MNUtil.log()` to record simple logs
   - Use `MNUtil.copyJSON()` to copy objects to the clipboard
   - Errors are automatically logged and copied

## 6. Get more help

- **Detailed API documentation**: View `mnutils/MNUtils_API_Guide.md`
- **Implementation details**: See `mnutils/CLAUDE.md`
- **Data structure understanding**: refer to `MNGuide_DataStructure.md`
- **Plug-in System Documentation**: Refer to `MarginNote Plug-in System Documentation.md`

> 💡 **Remember**: MNUtils is not only a tool library, but also the infrastructure of the entire MarginNote plug-in ecosystem. Mastering it is equivalent to mastering the core of MarginNote plug-in development.

---

# MN-Addon Development Experience and Frequently Asked Questions

## About self and this

It is strictly forbidden to use `let self = this;` inside JSB.defineClass. This is a wrong way of writing. Just use `self` to point to the current plugin instance.

## Key differences between note.MNComments and note.comments

### Core differences

#### 1. `note.comments` - original comments array
- Contains the underlying `NoteComment` object
- `comment.type` has only 5 basic type values:
  - `"TextNote"` - text comment
  - `"HtmlNote"` - HTML comments
  - `"LinkNote"` - merge excerpt comments
  - `"PaintNote"` - drawing comments (including pictures and handwriting)
  - `"AudioNote"` - audio commentary

#### 2. `note.MNComments` - processed comments array
- Array of `MNComment` instances generated via `MNComment.from(note)`
- Automatically call `MNComment.getCommentType(comment)` during construction to set type
- The `type` attribute of `MNComment` is broken down into 15+ types:
  - Text class: `"textComment"`, `"markdownComment"`, `"tagComment"`
  - Link class: `"linkComment"`, `"summaryComment"`
  - HTML class: `"HtmlComment"`
  - Merged classes: `"mergedTextComment"`, `"mergedImageComment"`, `"mergedImageCommentWithDrawing"`
  - Picture class: `"imageComment"`, `"imageCommentWithDrawing"`
  - Handwriting class: `"drawingComment"`
  - Others: `"audioComment"`, `"blankTextComment"`, `"blankImageComment"`

### Common mistakes and correct usage

```javascript
// ❌ Error 1: Calling getCommentType again on the MNComments element
let commentType = MNComment.getCommentType(note.MNComments[0]);

// ✅ Correct: use the type attribute directly (already a subdivision type)
let commentType = note.MNComments[0].type;

// ❌ Error 2: Use subdivision type judgment on original comments
if (note.comments[0].type === "drawingComment") { } // always false

// ✅ Correct: use base types for raw comments
if (note.comments[0].type === "PaintNote") { }
```

### Actual case: judging handwritten comments

```javascript
// Recommended method: use MNComments
function isHandwritingComment(note, index) {
  let commentType = note.MNComments[index].type;
  return commentType === "drawingComment" ||
         commentType === "imageCommentWithDrawing" ||
         commentType === "mergedImageCommentWithDrawing";
}

// Alternative: use raw comments (more complex)
function isHandwritingCommentAlt(note, index) {
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

### Best Practices
1. **Prefer to use `note.MNComments`**: the types have been subdivided, making it more convenient to use.
2. **Avoid repeated calls to `getCommentType`**: MNComments have already been processed
3. **Understanding type hierarchy**: basic types (5 types) → subdivided types (15+ types)
4. **Debugging Tips**: `MNUtil.log(note.MNComments[0])` View the actual type value

### Scope of influence
- All functions involving comment type judgment
- Especially the recognition of handwriting, pictures, and merged content

### ❌ Use prohibited

**Error example (never write this):**

```javascript
// ❌ Error: using UIAlertView.show()
UIAlertView.show(
  "Title",
  "Message",
  "cancel",
  ["Option 1", "Option 2"],
  (alert, buttonIndex) => {
    if (buttonIndex === 0) return // Cancel
    // Processing logic
  }
)
```

**Question:**
- `UIAlertView.show()` is a low-level native API and should not be used directly
- Using callback mode can easily lead to callback hell.
- Does not comply with MarginNote plug-in development specifications

### ✅ Correct use:MNUtil.userSelect

**Correct example (recommended):**

```javascript
// ✅ Correct: use MNUtil.userSelect()
let selected = await MNUtil.userSelect(
  "Title",
  "Message",
  ["Option 1", "Option 2"]
)

// Return value description:
// 0 = Cancel
// 1 = option 1
// 2 = option 2
// ...

if (selected === 0) return // User cancels

// handle selection
let selectedIndex = selected - 1 // Convert to 0-based index
MNUtil.showHUD(`Selected: ${options[selectedIndex]}`)
```

**Actual case: batch transfer function**

```javascript
// webviewController.js:2993-3096
transferSelectedPins: async function(button) {
  try {
    // Check if there is a selected item
    let selectedCards = self.getSelectedCards()
    if (selectedCards. length === 0) {
      MNUtil.showHUD("Please select at least one item first")
      return
    }

    // Get the target partition list
    let currentSection = self.currentSection
    let allSections = SectionRegistry.getOrderedKeys(self.currentViewMode)

    let sectionOptions = []
    let sectionKeys = []

    allSections.forEach(sectionKey => {
      let config = SectionRegistry.getConfig(sectionKey)
      if (config) {
        let displayName = config.displayName || sectionKey
        let icon = config.icon || ""

        if (sectionKey === currentSection) {
          sectionOptions.push(`${icon} ${displayName} (current)`)
        } else {
          sectionOptions.push(`${icon} ${displayName}`)
        }
        sectionKeys.push(sectionKey)
      }
    })

    // ✅ Use MNUtil.userSelect instead of UIAlertView.show
    let selected = await MNUtil.userSelect(
      `Batch transfer (${selectedCards.length} items selected)`,
      "Please select the target partition",
      sectionOptions
    )

    //User cancels
    if (selected === 0) return

    // Get the selected partition index (selected - 1, because the return value starts from 1)
    let selectedIndex = selected - 1
    let targetSection = sectionKeys[selectedIndex]

    // Check if the current partition is selected
    if (targetSection === currentSection) {
      MNUtil.showHUD("Unable to transfer to current partition")
      return
    }

    //Perform batch transfer
    let successCount = 0
    let failCount = 0

    MNUtil.undoGrouping(() => {
      selectedCards.forEach(card => {
        let success = pinnerConfig.transferPin(
          card.rawPin,
          card.section,
          targetSection
        )

        if (success) {
          successCount++
        } else {
          failCount++
        }
      })
    })

    //display results
    if (failCount === 0) {
      MNUtil.showHUD(`✅ ${successCount} items transferred`)
    } else {
      MNUtil.showHUD(`⚠️ ${successCount} successful, ${failCount} failed`)
    }

    //Clear the selection and refresh the interface
    self.clearSelection()
    self.refreshSectionCards(currentSection)

  } catch (error) {
    pinnerUtils.addErrorLog(error, "transferSelectedPins")
    MNUtil.showHUD("Transfer failed: " + error.message)
  }
}
```

### ✅ Special circumstances: input + selection required

**The only allowed scenario where UIAlertView calls directly:**

When you need to support both input and selection, you can use the full native API:

```javascript
// ✅ Acceptable: input box + multiple selection buttons required
UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
  "Modify page title",
  "Enter a title or select a preset phrase",
  2, // alertViewStyle = 2 (text input box)
  "cancel",
  ["OK", "Default1", "Default2"], // Multiple option buttons
  (alert, buttonIndex) => {
    if (buttonIndex === 0) return // Cancel

    let inputText = alert.textFieldAtIndex(0).text.trim()

    if (buttonIndex === 1) {
      // OK button - use input box content
      // ...
    } else {
      // Default phrase selected
      let preset = presets[buttonIndex - 2]
      // ...
    }
  }
)
```

**Conditions of use:**
- Must require both input and selection functions
- Use the full method name: `UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock`
- **Absolutely not to be used** `UIAlertView.show()`

### Comparison table

| API | Is it allowed | Applicable scenarios | Return method |
|-----|---------|---------|---------|
| `UIAlertView.show()` | ❌ Disabled | None | Callback |
| `MNUtil.userSelect()` | ✅ Recommended | Pure selection | async/await |
| `UIAlertView.showWithTitle...TapBlock()` | ⚠️ Special cases | Input + selection | Callback |

### Important reminder

1. **Never use `UIAlertView.show()`**
2. **Prefer to use the API encapsulated by MNUtils**
3. **Use async/await instead of callback mode**
4. **Only use the native API when both input and selection are required**
5. **You must use the complete method name, not the abbreviated form**

---

## MNLog log system usage specifications ⭐⭐⭐⭐⭐

### Why use MNLog

`MNLog` is a **structured logging system** provided by MNUtils, which has the following advantages:

1. **Structured data**: Supports `detail` field to record detailed information (object, array, etc.)
2. **Category Management**: Identify the log source through the `source` field
3. **Level distinction**: supports `INFO`, `ERROR`, `DEBUG` and other levels
4. **Visual View**: The log will be automatically displayed in the log viewer of MNUtils
5. **Detailed expansion**: Click the log to view the complete `detail` content

### ❌ Incorrect usage

**Error example:**

```javascript
// ❌ Error 1: Only string messages are logged, no detailed information
MNUtil.log(`Processing root card: ${rootNote.noteTitle} (${rootNote.noteId})`);
MNUtil.log(`number of childNotes: ${rootNote.childNotes?.length || 0}`);

// ❌ Error 2: The error message is incomplete
MNLog.error(errorMessage, "KnowledgeBaseIndexer");

// ❌ Error 3: Use MNUtil.log to log JSON strings
MNUtil.log(`rootNote details: ${JSON.stringify({
  noteId: rootNote.noteId,
  noteTitle: rootNote.noteTitle
})}`);
```

**Question:**
- The log only displays the text of the message and cannot be expanded to view detailed content.
- You must copy the entire long string to see the complete information when debugging
- Unable to take advantage of the structured display feature of the log viewer

### ✅ Correct usage

**Correct example:**

```javascript
// ✅ Correct 1: Use object form, including detail field
MNLog.info({
  message: "Start processing root card",
  source: "KnowledgeBaseIndexer",
  detail: {
    noteId: rootNote.noteId,
    noteTitle: rootNote.noteTitle,
    childNotesCount: rootNote.childNotes?.length || 0
  }
});

// ✅ Correct 2: Include full context when logging errors
MNLog.error({
  message: "Stack overflow occurred while retrieving descendants",
  source: "KnowledgeBaseIndexer",
  detail: {
    noteId: rootNote.noteId,
    noteTitle: rootNote.noteTitle,
    errorMessage: error?.message,
    errorStack: error?.stack
  }
});

// ✅ Correct 3: Successful operations also record detailed information
MNLog.info({
  message: "Successfully obtained descendants",
  source: "KnowledgeBaseIndexer",
  detail: {
    noteId: rootNote.noteId,
    noteTitle: rootNote.noteTitle,
    descendantsCount: descendants.length
  }
});
```

### MNLog API detailed explanation

#### 1. Basic method

```javascript
//Information log
MNLog.info({
  message: "Operation description",
  source: "source identification",
  detail: { /* detail object */ }
});

// error log
MNLog.error({
  message: "Error description",
  source: "source identifier",
  detail: { /* Error detail object */ }
});

// debug log
MNLog.debug({
  message: "Debug information",
  source: "source identifier",
  detail: { /* debugging detail object */ }
});

// General log (automatically determine the level)
MNLog.log({
  message: "Log message",
  level: "INFO", // Optional: "INFO", "ERROR", "DEBUG"
  source: "source identification",
  detail: { /* detail object */ }
});
```

#### 2. Simplified writing

```javascript
// If only strings are passed, a basic log will be automatically created
MNLog.log("Simple Message"); // Equivalent to { message: "Simple Message", level: "INFO", source: "Default" }

// Support the second parameter as detail
MNLog.log("Processing Card", {
  noteId: "xxx",
  noteTitle: "Title"
});
```

#### 3. Log object structure

```javascript
{
  message: string, // Required: log message (short description)
  level: string, // Optional: log level (default "INFO")
  source: string, // Optional: source identifier (default "Default")
  timestamp: number, // Optional: timestamp (automatically generated)
  detail: object|string // Optional: detailed information (the object will automatically JSON.stringify)
}
```

### Practical application scenarios

#### Scenario 1: Record the operation process

```javascript
// start processing
MNLog.info({
  message: "Start building index",
  source: "KnowledgeBaseIndexer",
  detail: {
    mode: "full",
    rootNotesCount: rootNotes.length
  }
});

// Processing
for (const rootNote of rootNotes) {
  MNLog.info({
    message: "Processing root card",
    source: "KnowledgeBaseIndexer",
    detail: {
      noteId: rootNote.noteId,
      noteTitle: rootNote.noteTitle,
      progress: `${processed}/${total}`
    }
  });
}

// Done
MNLog.info({
  message: "Index construction completed",
  source: "KnowledgeBaseIndexer",
  detail: {
    totalCards: validCount,
    totalParts: manifest.metadata.totalParts,
    duration: Date.now() - startTime
  }
});
```

#### Scenario 2: Logging errors and exceptions

```javascript
try {
  // business logic
} catch (error) {
  MNLog.error({
    message: "Index build failed",
    source: "KnowledgeBaseIndexer: buildSearchIndex",
    detail: {
      errorMessage: error?.message || "Unknown error",
      errorStack: error?.stack || "No stack information",
      errorType: typeof error,
      context: {
        mode: mode,
        processedCount: processedCount,
        currentNote: currentNote?.noteId
      }
    }
  });
}
```

#### Scenario 3: Circular reference detection

```javascript
// Detect circular references in descendantNodes
if (visited.has(node.noteId)) {
  MNLog.error({
    message: "Circular reference detected",
    source: "MNNote.descendantNodes",
    detail: {
      nodeId: node.noteId,
      nodeTitle: node.noteTitle,
      visitedPath: Array.from(visited)
    }
  });
  return;
}
```

### Best Practices

1. **Always use object form**: Even for simple logs, it is recommended to use object form for future expansion.
2. **Clear source**: Use the format of `class name.method name` or `plugin name:function name`
3. **detail contains key information**:
   - ID and identification of the operand
   - Relevant quantity, status, progress
   - Full context of the error (message, stack, type)
4. **Differentiate log levels**:
   - `INFO`: normal operating flow
   - `ERROR`: errors and exceptions
   - `DEBUG`: debugging information (can be removed when publishing)
5. **Avoid sensitive information**: Do not record sensitive data such as passwords and tokens in logs

### ✅ CODE GENERATION CHECKLIST

- [ ] Extend `JSExtension` base class
- [ ] Initialize MNUtils with `MNUtil.init(self.path)`
- [ ] Attach window data to `self`, not JavaScript variables
- [ ] Include colon (`:`) in selector names
- [ ] Cleanup event listeners in `notebookWillClose`
- [ ] Check null before accessing note properties
- [ ] Wrap batch operations in `MNUtil.undoGrouping()`
- [ ] Use `MNLog` for structured logging, not `MNUtil.log()`
- [ ] Use `MNUtil.userSelect` instead of `UIAlertView.show()`
- [ ] Remove `undefined` values before `NSUserDefaults`
- [ ] Place event handlers in instance methods, not prototype
- [ ] Use `note.MNComments[i].type` directly, not `getCommentType()`

### Comparison table

| Method | Applicable Scenario | Detail Support | Visualization | Recommendation |
|------|---------|-----------|--------|--------|
| `MNLog.info()` | Structured log | ✅ Full support | ✅ Expandable | ⭐⭐⭐⭐⭐ |
| `MNLog.error()` | Error log | ✅ Full support | ✅ Expandable | ⭐⭐⭐⭐⭐ |
| `MNUtil.log()` | Simple text | ❌ Not supported | ❌ Plain text | ⭐⭐ |
| `console.log()` | Browser debugging | ❌ Not supported | ❌ Console | ⭐ |

### Important reminder

1. **Prefer `MNLog`**: All new code should use `MNLog` instead of `MNUtil.log()`
2. **detail is the core**: make full use of the `detail` field to record detailed information
3. **source should be clear**: to facilitate filtering and locating problems
4. **Automatic serialization of objects**: Objects in `detail` will be automatically `JSON.stringify`, no manual conversion is required
5. **View log**: Use `MNLog.showLogViewer()` to open the log viewer

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
### 4. UI Patterns

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

#### 2. **MNToolbar** (Customizable Toolbar)
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
