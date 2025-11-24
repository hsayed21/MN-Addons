# ✅ MN Toolbar Pro Development and Collaboration Guidelines > These guidelines apply to all development tasks within the MN Toolbar Pro project and are mandatory unless explicitly waived by the user.
If you are familiar with all the guidelines, you should state "I am fully familiar with the development and writing guidelines" during the user's first conversation, and then proceed with implementing the user's requirements.

## Table of Contents 1. [Project Overview](#1-Project Overview)
2. [Development Principles](#2-Development Principles)
3. [Project Architecture](#3-Project Architecture)
4. [Code Style Guide](#4-Code Style Guide)
5. [JSB Framework Specification](#5-jsb-framework specification)
6. [Technical Practice](#6-Technical Practice)
7. [Quick Start Guide to Extension Development](#7-Quick Start Guide to Extension Development)
8. [Advanced Guide to Extended Development](#8-Advanced Guide to Extended Development)
9. [Debugging and Troubleshooting](#9-Debugging and Troubleshooting)
10. [API Quick Reference](#10-api-quick reference)

---

## 1. Project Overview ### 1.1 Directory Structure - **mntoolbar**: User's development project directory, based on the official version. - **mntoolbar_official**: Official plugin directory, for reference and comparison only, should not be modified. ### 1.2 Core File Responsibilities | Filename | Responsibilities | Importance |
|--------|------|--------|
| `main.js` | Plugin Entry Point and Lifecycle Management | ⭐⭐⭐⭐⭐ |
| `webviewController.js` | Toolbar UI Management and Interaction | ⭐⭐⭐⭐⭐ |
| `settingController.js` | Settings Interface Management | ⭐⭐⭐⭐ |
| `utils.js` | General utility functions and configuration management | ⭐⭐⭐⭐⭐ |

### 1.3 Decoupling Architecture File | Filename | Responsibilities | Description |
|--------|------|------|
| `xdyy_button_registry.js` | Button configuration registry | Define custom buttons |
| `xdyy_menu_registry.js` | Menu template registry | Define menu structure |
| `xdyy_custom_actions_registry.js` | Action handling registry | Implements functional logic |
| `xdyy_utils_extensions.js` | Utility function extensions | Extends toolbarUtils and toolbarConfig |

### 1.4 Namespace Conventions - Utility Functions: `MNUtil.` Prefix - Configuration Related: `toolbarConfig.`
- Frame operations: `Frame.`
- Custom global: `global.`

---

## 2. Development Principles ### 2.1 Basic Principles 1. **Deep Understanding**: Before each output, a deep understanding of the project background, user intent, and technology stack characteristics is essential. 2. **Authoritative References**: When information is uncertain, consult authoritative sources (official documentation, standards, or source code) first.
3. **Precise Answers:** Only answer questions directly related to the problem, avoiding redundancy and tutorial-like elaboration. 4. **Task Breakdown:** For complex requirements, break them down into manageable sub-tasks. ### 2.2 ⚠️ Unauthorized modification of user content is strictly prohibited (extremely important)

**Unauthorized replacement of user-generated content with original content is strictly prohibited!**

When performing any code decoupling, refactoring, migration, or cleanup work:

1. **The original content must be copied exactly:**
   - Copy verbatim from Git history, existing files, or user-provided content - Keep all comments, blank lines, and formatting completely consistent - Even commented-out code must be retained. 2. **No original creations or simplifications allowed:**
   - Menu structures must not be simplified or menu items removed. - Function parameters or default values ​​must not be changed. - Code must not be "optimized" or naming improved. - Seemingly "useless" code must not be deleted. 3. **Maintain integrity**:
   - Every menu item, every button configuration, and every parameter must be completely preserved. - Maintain the original hierarchical structure and order. - Maintain the original Chinese and English content, emojis, etc. 4. **Ask immediately if you encounter any uncertainty:**
   - If a part is unclear or missing, the user must be consulted. - Do not speculate or fill in the content yourself. - Do not supplement based on "common practices." **Violating this principle will result in the loss of functionality and disruption of user work, and is an absolutely unacceptable mistake.**

### 2.3 Source Code Reading Guidelines 1. **Complete Reading Principles**:
   - [Extremely Important] The entire file must be read in its entirety to avoid misinterpreting information. - Understand context dependencies and complete business logic. - Pay attention to file references. 2. **Large File Handling**:
   - Documents exceeding 500 lines should be read in segments. - Each segment should be 100-200 lines long. - Record the relationships between segments. 3. **Reading order**:
   ```
   main.js → utils.js → webviewController.js → other modules

---

## 3. Project Architecture ### 3.1 Lifecycle Flow ```javascript
// Plugin startup process sceneWillConnect()
  ↓
notebookWillOpen()
  ↓
Create a toolbar window ↓
Initialization configuration and status ↓
Register observers and gestures // Plugin closing process notebookWillClose()
  ↓
Save status ↓
Clean up resources ↓
sceneDidDisconnect()
```

### 3.2 Singleton Pattern ```javascript
// ✅ The correct way to obtain a singleton instance: const getFooController = () => self
var FooController = JSB.defineClass('FooController : UIViewController', {
  viewDidLoad: function() {
    let self = getFooController()
    // Use self instead of this
  }
})
```

### 3.3 Decoupled Architecture Data Flow```
User clicks button ↓
webviewController parses description
    ↓
Get the action name ↓
Find global.customActions[action]
    ↓
Execute the registration processing function ↓
Passing the context object ↓
Return the execution result.

---

## 4. Coding Standards ### 4.1 Naming Conventions 1. **Variable Naming**:
   - ✅ Correct: `const error = new Error()`, `const event`
   - ❌ Errors: `const e`, `const err`, `const data`

2. **Duplicate Names**:
   - ✅ Correct: `let cache; let redisCache;`
   - ❌ Error: `let cache; let cache2;`

### 4.2 Code Style 1. **Arrow Functions**:
   ```javascript
   // ✅ Concise syntax () => "something"
   list.forEach(console.log)

   // ❌ Redundant syntax() => { return "something"; }
   (x) => { doSomething(x); }
   ```

2. **Array operations:**
   - Prefer using `.filter()`, `.map()`, and `.reduce()`
   - Avoid traditional for loops ### 4.3 Indentation Standards 1. **Automatic Formatting Tool**:
   bash
   # Use Prettier for formatting (recommended)
   npx prettier --write filename.js --tab-width 2 --single-quote false

   # Format the entire project npx prettier --write "**/*.js" --tab-width 2
   ```

2. **Configuration file** (.prettierrc):
   json
   {
     "tabWidth": 2,
     "useTabs": false,
     "semi": true,
     "singleQuote": false,
     "printWidth": 120,
     "bracketSpacing": true
   }
   ```

### 4.4 Commenting Guidelines 1. **JSDoc Format**:
   ```javascript
   /**
    * Handling toolbar actions * @param {Object} button - Button object * @param {Object} des - Action description * @returns {Promise<void>}
    * @throws {Error} Throws an error when the action is undefined. */
   ```

2. **Comment Language**:
   - Code comments are in English - User communication is in Chinese---

## 5. JSB Framework Specification ### 5.1 File Loading Specification 1. **Loading Timing**:
   ```javascript
   // ❌ Error: JSB.require('extension') is loaded at the beginning of the file.
   var MyClass = JSB.defineClass(...)

   // ✅ Correct: Load var MyClass = JSB.defineClass(...) at the end of the file
   JSB.require('extension')
   ```

2. **Path Specification**:
   ```javascript
   // ✅ Correct JSB.require('xdyy_utils_extensions')
   // ❌ Error JSB.require('xdyy_utils_extensions.js')
   ```

### 5.2 Class Definition Specifications ```javascript
var FooController = JSB.defineClass('FooController : UIViewController', {
  // Instance method viewDidLoad: function() {
    let self = getFooController()
    // Initialization logic},

  // Static methods use static
  static someStaticMethod: function() {
    // Static logic}
})
```

---

## 6. Technical Practices ### 6.1 UI Development 1. **Frame Operations**:
   ```javascript
   // ✅ Use the utility class Frame.set(view, x, y, width, height)
   // ❌ Do not directly manipulate view.frame = {x: 10, y: 10, width: 100, height: 50}
   ```

2. **Gesture processing:**
   ```javascript
   self.addPanGesture(self.view, "onMoveGesture:")
   self.addLongPressGesture(button, "onLongPressGesture:")
   ```

### 6.2 Memory Management **Resources that must be cleaned up**:
- NSNotificationCenter Observer - Timer (NSTimer)
- Gesture Recognizer Reference - Controller Strong Reference ```javascript
notebookWillClose: function(notebookid) {
  // Save state toolbarConfig.windowState.frame = self.view.frame
  // Clean up resources MNUtil.removeObserver(self.observerId)
}
```

### 6.3 Error Handling ```javascript
try {
  // Boundary check if (typeof MNUtil === 'undefined') return
  if (!(await toolbarUtils.checkMNUtil(true))) return

  // Business logic } catch (error) {
  toolbarUtils.addErrorLog(error, methodName, info)
  MNUtil.showHUD("Operation failed: " + error.message)
}
```

### 6.4 Platform Compatibility ```javascript
self.isMac = MNUtil.version.type === "macOS"
if (self.isMac) {
  // macOS-specific logic (mouse hover, right-click menu)
} else {
  // iOS-specific logic (touch gestures, screen rotation)
}
```

---

## 7. Quick Start Guide to Extended Development ### 7.1 Architecture Overview MN Toolbar adopts a decoupled architecture based on the **registry model**:

```
Main program (unmodified) Extension modules (customizable)
├── main.js ├── xdyy_button_registry.js # Button configuration ├── utils.js ├── xdyy_menu_registry.js # Menu template ├── webviewController.js ├── xdyy_custom_actions_registry.js # Action handling └── settingController.js └── xdyy_utils_extensions.js # Utility extensions

### 7.2 Module Loading Order ```javascript
// Loading order in main.js (Important!)
JSB.require('utils') // 1. Core utilities JSB.require('xdyy_utils_extensions') // 2. Extension utility functions JSB.require('pinyin') // 3. Pinyin library // ... Other initialization...
JSB.require('xdyy_menu_registry') // 4. Menu template JSB.require('xdyy_button_registry') // 5. Button configuration JSB.require('xdyy_custom_actions_registry') // 6. Action handling

### 7.3 Adding the First Button (Three Steps)

#### Step 1: Register button (xdyy_button_registry.js)

```javascript
// Add `global.registerButton("custom19", {` to the `registerAllButtons()` function.
  name: "My Function", // Button display name image: "myfunction", // Icon file name (excluding .png)
  templateName: "menu_myfunction" // Associated menu template});
```

#### Step 2: Define the menu (xdyy_menu_registry.js)

```javascript
// Simple button (executes the action directly)
global.registerMenuTemplate("menu_myfunction", JSON.stringify({
  action: "myAction"
}));

// Or a complex menu: global.registerMenuTemplate("menu_myfunction", {
  action: "menu",
  menuItems: [
    {
      action: "myAction1",
      menuTitle: "Function One"
    },
    {
      action: "myAction2",
      menuTitle: "Function Two"
    }
  ]
});
```

Step 3: Implement the action (xdyy_custom_actions_registry.js)

```javascript
global.registerCustomAction("myAction", async function(context) {
  const { button, des, focusNote, focusNotes, self } = context;

  // Use MNUtil.undoGrouping(() => {
    try {
      // Your functionality implementation if (focusNote) {
        focusNote.noteTitle = "Processed: " + focusNote.noteTitle;
        MNUtil.showHUD("✅ Processing successful");
      } else {
        MNUtil.showHUD("❌ Please select a card first");
      }
    } catch (error) {
      MNUtil.showHUD(`❌ Error: ${error.message}`);
    }
  });
});
```

### 7.4 Main File Integration (Only Once Required)

Add the following to the `customActionByDes` function in `webviewController.js`:

```javascript
default:
  if (typeof global !== 'undefined' && global.executeCustomAction) {
    const context = { button, des, focusNote, focusNotes, self: this };
    const handled = await global.executeCustomAction(des.action, context);
    if (handled) break;
  }
  MNUtil.showHUD("Not supported yet...")
  break
```

---

## 8. Advanced Guide to Extended Development ### 8.1 Multilevel Menus ```javascript
global.registerMenuTemplate("menu_advanced", {
  action: "menu",
  menuWidth: 300, // Menu width menuItems: [
    "⬇️ Group Title", // Plain text as group {
      action: "subAction1",
      menuTitle: "Sub-function 1" // Indentation indicates hierarchy},
    {
      action: "menu", // Nested menu menuTitle: "➡️ More Options",
      menuItems: [
        {
          action: "deepAction",
          menuTitle: "Deep Functionality"
        }
      ]
    }
  ]
});
```

### 8.2 Interaction Modes #### Long press and double tap ```javascript
global.registerMenuTemplate("menu_interactive", {
  action: "defaultAction", // Default click action doubleClick: { // Double-click action action: "doubleClickAction"
  },
  onLongPress: { // Long press menu action: "menu",
    menuItems: [
      {
        action: "longPressOption1",
        menuTitle: "Long press option 1"
      }
    ]
  }
});
```

#### User input ```javascript
global.registerCustomAction("userInput", async function(context) {
  UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
    Enter a new title
    Please enter a new title for the card.
    2, // Input box style "Cancel",
    ["Sure"],
    (alert, buttonIndex) => {
      if (buttonIndex === 1) {
        const inputText = alert.textFieldAtIndex(0).text;
        MNUtil.undoGrouping(() => {
          context.focusNote.noteTitle = inputText;
          MNUtil.showHUD("✅ Title updated");
        });
      }
    }
  );
});
```

### 8.3 Common Modes #### Batch Processing ```javascript
global.registerCustomAction("batchProcess", async function(context) {
  const { button, des, focusNote, focusNotes, self } = context;

  MNUtil.undoGrouping(() => {
    let successCount = 0;

    focusNotes.forEach(note => {
      try {
        // Process each card: note.appendTags(["Processed"]);
        successCount++;
      } catch (error) {
        // A single failure does not affect others}
    });

    MNUtil.showHUD(`✅ Successfully processed ${successCount}/${focusNotes.length} cards`);
  });
});
```

#### Asynchronous Operations in JavaScript
global.registerCustomAction("asyncOperation", async function(context) {
  const { button, des, focusNote, focusNotes, self } = context;

  try {
    MNUtil.showHUD("⏳ Processing...");

    // Simulate asynchronous operation await MNUtil.delay(0.5);

    // Perform the operation const result = await someAsyncFunction(focusNote);

    MNUtil.showHUD(`✅ Complete: ${result}`);
  } catch (error) {
    MNUtil.showHUD(`❌ Failure: ${error.message}`);
  }
});
```

### 8.4 Best Practices 1. **Always Use Undo Groups**
   ```javascript
   MNUtil.undoGrouping(() => { /* Your operation */ });
   ```

2. **Check the existence of the object**
   ```javascript
   if (focusNote && focusNote.noteTitle) {
     // Safe Operation}
   ```

3. **Provide user feedback**
   - Before operation: `MNUtil.showHUD("⏳ Processing...")`
   - After success: `MNUtil.showHUD("✅ Success")`
   - On failure: `MNUtil.showHUD("❌ Failure: " + error.message)`

4. **Using context destructuring**
   ```javascript
   const { button, des, focusNote, focusNotes, self } = context;
   ```

5. **Error Handling Modes**
   ```javascript
   try {
     // Dangerous operation} catch (error) {
     toolbarUtils.addErrorLog(error, "functionName");
     MNUtil.showHUD("Operation failed");
   }
   ```

---

## 9. Debugging and Troubleshooting ### 9.1 Debugging Tools 1. **User Visible**: `MNUtil.showHUD("message")`
2. **Development Log**: `MNUtil.log()` (Recommended for consistent log format)
3. **Error Log: `toolbarUtils.addErrorLog()`
4. **Object Inspection**: `MNUtil.copyJSON(object)`

**Log usage guidelines**:
- **You must use `MNUtil.log()` instead of `console.log()`
- Before logging, you need to check if MNUtil exists:
  ```javascript
  if (typeof MNUtil !== "undefined" && MNUtil.log) {
    MNUtil.log("log information");
  }
  ```
- Use a meaningful prefix to identify the log type:
  - `🔧` Initialize/Configure - `✅` Success - `❌` Error - `🔍` Debug/Find - `🚀` Execute Action - `📦` Load Module ### 9.2 Test Script ```javascript
// test_myfunction.js
function testMyFunction() {
  // Simulate button click const context = {
    button: null,
    des: { action: "myAction" },
    focusNote: MNNote.getFocusNote(),
    focusNotes: MNNote.getFocusNotes(),
    self: null
  };

  if (global.executeCustomAction) {
    global.executeCustomAction("myAction", context).then(result => {
      MNUtil.log(`Test result: ${result}`);
    });
  }
}

// Execute test testMyFunction();
```

### 9.3 Common Problems | Problem | Cause | Solution |
|------|------|----------|
"Can't find variable" | Loading order error | Adjust JSB.require position |
| "undefined is not an object" | Uninitialized | Call ensureView() |
"Not supported yet..." | Action not registered | Check registry loading |
Button not displaying | Caching issue | Using `global.forceRefreshButtons()` |
| Indentation issues | Manually fix errors | Use Prettier for formatting |

### 9.4 Performance Optimization - Memory usage for large document testing - Batch operations using `undoGrouping` - Avoid frequent UI updates - Use `async/await` for asynchronous operations

---

## 10. API Quick Reference ### 10.1 Card Operations ```javascript
// Get const focusNote = MNNote.getFocusNote()
const focusNotes = MNNote.getFocusNotes()

// Attribute focusNote.noteId // ID
`focusNote.noteTitle` // Title `focusNote.excerptText` // Excerpt `focusNote.parentNote` // Parent card `focusNote.childNotes` // Array of child cards `// Method focusNote.addChild(note)`
focusNote.toBeIndependent()
focusNote.focusInMindMap(0.3)
focusNote.refresh()
```

### 10.2 Utility Methods ```javascript
// UI feedback MNUtil.showHUD("message")

// Undo grouping MNUtil.undoGrouping(() => { /* Operation */ })

// Delay `await MNUtil.delay(0.5)`

// Clipboard MNUtil.copy("text")
MNUtil.copyJSON(object)

// Current environment MNUtil.currentNotebookId
MNUtil.currentDocmd5
```

### 10.3 Configuration Management```javascript
// Read let frame = toolbarConfig.getWindowState("frame")

//Save toolbarConfig.windowState.frame = newFrame

// Persistent toolbarConfig.save()
```

### 10.4 UI Components ```javascript
// Pop-up input UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
  title, message, style, cancelTitle, otherTitles, callback
)

// Display menu using MNUtil.showMenu(menuItems, menuWidth)
```
