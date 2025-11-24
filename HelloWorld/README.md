# Hello World - MarginNote 4 Plugin

A minimal example plugin demonstrating the basic structure and lifecycle of a MarginNote 4 plugin. This is the perfect starting point for learning MarginNote plugin development.

## 📋 Features

- ✅ Complete plugin lifecycle demonstration
- ✅ Window, notebook, and event handling
- ✅ HUD notifications
- ✅ Event listener registration/cleanup
- ✅ Auto-comment on new excerpts
- ✅ Full VSCode IntelliSense support
- ✅ Comprehensive code documentation

## 🚀 Quick Start

### Installation

1. **Option A: Development Mode (Recommended)**
   ```bash
   # Create symlink to MarginNote's addon directory
   # macOS/iOS:
   ln -s "$(pwd)" ~/Library/Containers/com.marginnote.MarginNote4/Data/Library/Application\ Support/marginnote4/addons/HelloWorld.mnaddon
   
   # Windows (requires admin PowerShell):
   New-Item -ItemType SymbolicLink -Path "$env:LOCALAPPDATA\Packages\MarginNote4\LocalState\addons\HelloWorld.mnaddon" -Target (Get-Location)
   ```

2. **Option B: Install Package**
   - Zip the folder and rename to `HelloWorld.mnaddon`
   - Double-click to install in MarginNote
   - Or manually copy to addons folder

3. **Restart MarginNote**

### Usage

1. Open MarginNote 4
2. Open any notebook
3. Look for the "Hello World" button in the toolbar
4. Click the button to see the greeting message!
5. Create a new excerpt to see auto-comments

## 📁 Project Structure

```
HelloWorld/
├── mnaddon.json       # Plugin manifest (metadata)
├── main.js            # Plugin implementation (fully documented)
├── jsconfig.json      # VSCode IntelliSense configuration
├── logo.png           # Plugin button icon (44x44px)
└── README.md          # This file
```

## 🛠️ Development Setup

### Prerequisites

- Visual Studio Code (with JavaScript support)
- MarginNote 4 (version 3.7.11 or higher)

### VSCode IntelliSense Setup

This project includes `jsconfig.json` which provides:

- ✅ **Type Checking**: Enables `checkJs` for error detection
- ✅ **Auto-completion**: Links to `../index.d.ts` type definitions
- ✅ **API Documentation**: Hover over methods to see documentation
- ✅ **Parameter Hints**: See parameter types and descriptions

### Type Definitions

The project uses the MarginNote type definitions from `../index.d.ts`:

```javascript
// IntelliSense will show available methods:
self.app.showHUD(message, view, duration);  // ← Hover for docs
Database.sharedInstance().getNoteById(noteid);  // ← Auto-complete
NSNotificationCenter.defaultCenter().addObserverSelectorName(...);
```

## 📚 Code Explanation

### Plugin Structure

```javascript
JSB.newAddon = function (mainPath) {
  const HelloWorldPlugin = JSB.defineClass(
    'HelloWorld : JSExtension',  // Class name : Parent class
    {
      // Instance methods (per-window)
      sceneWillConnect() { /* ... */ },
      notebookWillOpen(topicid) { /* ... */ },
      onButtonClick(sender) { /* ... */ },
      // ...
    },
    {
      // Static methods (class-level)
      addonDidConnect() { /* ... */ },
      addonWillDisconnect() { /* ... */ }
    }
  );
  return HelloWorldPlugin;
};
```

### Lifecycle Methods

#### Window Lifecycle
- `sceneWillConnect()` - Window opens (initialize)
- `sceneDidBecomeActive()` - Window gains focus
- `sceneWillResignActive()` - Window loses focus
- `sceneDidDisconnect()` - Window closes (cleanup)

#### Notebook Lifecycle
- `notebookWillOpen(topicid)` - Notebook opens
- `notebookWillClose(topicid)` - Notebook closes

#### Plugin Lifecycle
- `addonDidConnect()` - Plugin installed/activated
- `addonWillDisconnect()` - Plugin removed/deactivated

### Event Handling Pattern

```javascript
// Register event listener in notebookWillOpen
notebookWillOpen(topicid) {
  NSNotificationCenter.defaultCenter().addObserverSelectorName(
    self,                       // Observer (plugin instance)
    'onProcessNewExcerpt:',    // Handler method (with colon!)
    'ProcessNewExcerpt'        // Event name
  );
}

// Handler method (WITHOUT colon in definition)
onProcessNewExcerpt(sender) {
  const noteid = sender.userInfo.noteid;
  // Handle event
}

// CRITICAL: Remove listener in notebookWillClose
notebookWillClose(topicid) {
  NSNotificationCenter.defaultCenter().removeObserverName(
    self,
    'ProcessNewExcerpt'
  );
}
```

### Key Concepts

#### The `self` Object
- `self` = Plugin instance (Objective-C object)
- Each MarginNote window gets its own `self` instance
- **Always** attach window-specific data to `self`, not global variables
- **Never** use JavaScript global variables for state

```javascript
// ✅ CORRECT: Window-specific data
sceneWillConnect() {
  self.clickCount = 0;  // Each window has its own counter
}

// ❌ WRONG: Shared across all windows
let clickCount = 0;  // All windows share this!
```

#### Selector Names
- When registering events/buttons, use colon: `'onButtonClick:'`
- In method definition, NO colon: `onButtonClick(sender) { }`

## 🎨 Customization

### Change Plugin Metadata

Edit `mnaddon.json`:

```json
{
  "addonid": "marginnote.extension.helloworld",
  "author": "Your Name",  // ← Change this
  "title": "Hello World",  // ← Change this
  "version": "1.0.0"
}
```

### Change Button Message

Edit `main.js` → `onButtonClick` method:

```javascript
onButtonClick: function (sender) {
  let message = 'Your custom message!';  // ← Change this
  self.app.showHUD(message, self.window, 2);
}
```

### Add Custom Functionality

Follow these patterns:

1. **Add to button click:**
   ```javascript
   onButtonClick: function (sender) {
     // Your code here
   }
   ```

2. **Handle new excerpts:**
   ```javascript
   onProcessNewExcerpt: function (sender) {
     const note = Database.sharedInstance().getNoteById(sender.userInfo.noteid);
     // Modify the note
   }
   ```

3. **Add event listeners:**
   ```javascript
   notebookWillOpen: function (topicid) {
     NSNotificationCenter.defaultCenter().addObserverSelectorName(
       self, 'onMyEvent:', 'EventName'
     );
   }
   
   notebookWillClose: function (topicid) {
     NSNotificationCenter.defaultCenter().removeObserverName(
       self, 'EventName'
     );
   }
   ```

## 🐛 Debugging

### Console Logging

```javascript
// Logs appear in Console.app (macOS) or system logs
JSB.log('Debug message: ' + variable);
JSB.log('HelloWorld %@', objectToLog);
```

### Visual Debugging

```javascript
// Show HUD notification (visible in MarginNote)
self.app.showHUD('Debug: ' + JSON.stringify(data), self.window, 3);

// Alert dialog
self.app.alert('Debug message');
```

### Common Events

Available events for `addObserverSelectorName`:

- `ProcessNewExcerpt` - New excerpt created
- `ChangeExcerptRange` - Excerpt range modified
- `PopupMenuOnNote` - Context menu on note
- `PopupMenuOnSelection` - Context menu on text selection
- `OCRImageBegin` - OCR started
- `OCRImageEnd` - OCR completed
- `AddonBroadcast` - URL scheme triggered

## 📖 Learning Path

1. **Start Here**: Understand this Hello World plugin
2. **Read**: `../MarginNote4_Plugin_Development_Tutorial.md`
3. **Study**: Simple plugins like `../GoToPage/`
4. **Explore**: Complex plugins like `../mntask/`
5. **Reference**: `../index.d.ts` for type definitions

## 🔗 Resources

- **Type Definitions**: `../index.d.ts` (3,407 lines)
- **Comprehensive Guide**: `../MarginNote_Plugin_Development_Comprehensive_Guide.md`
- **Tutorial Series**: 
  - Part 1: `../MarginNote4_Plugin_Development_Tutorial.md`
  - Part 2: `../MarginNote4_Plugin_Tutorial_Part2.md`
  - Part 3: `../MarginNote4_Plugin_Tutorial_Part3.md`
  - Part 4: `../MarginNote4_Plugin_Tutorial_Part4.md`
- **MarginNote Forum**: https://forum.marginnote.com/

## ⚠️ Common Pitfalls

1. **❌ Forgot colon in selector**: `'onButtonClick'` → ✅ `'onButtonClick:'`
2. **❌ Forgot to remove event listeners**: Memory leak!
3. **❌ Used global variables**: Use `self.property` instead
4. **❌ Handler name mismatch**: Method must match selector (without colon)
5. **❌ Didn't check for null**: Always validate note/notebook objects

## 📝 Next Steps

After mastering this Hello World plugin:

1. **Add UI Elements**: Create floating panels, webviews
2. **Use MNUtils**: Import `../mnutils/mnutils.js` for 500+ utility methods
3. **Work with Notes**: Read/modify note properties, comments, links
4. **Network Requests**: Call external APIs
5. **Build Complex Features**: Study `../mntask/` or `../mntoolbar/`

## 📄 License

This is a sample plugin for educational purposes. Modify and use as needed.

## 🙋 Support

- Check existing plugins in `../` for examples
- Read comprehensive documentation files
- Post questions in MarginNote Forum
- Review type definitions for API reference

---

**Happy Plugin Development! 🚀**
