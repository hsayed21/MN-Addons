# In-depth analysis of the MNToolbar plugin > 📅 Analysis date: 2025-09-01
📦 Plugin version: v0.1.4.alpha0826
📊 Code size: 12,989 lines (excluding jsoneditor library)
> 🎯 Analysis Purpose: To provide a technical foundation for writing a plugin development tutorial ## 1. Plugin Overview ### 1.1 Core Functionality MNToolbar is an **enhanced toolbar plugin** for MarginNote 4, providing:
- **Fixed Toolbar:** A persistent toolbar with customizable position and orientation. - **Dynamic Toolbar:** A floating toolbar that pops up following the cards. - **36 Configurable Buttons:** Supports custom actions and multi-level menus. - **Gesture Control:** Allows for dragging, zooming, long-pressing, and other interactions. - **iCloud Sync:** Enables cloud-based configuration synchronization. ### 1.2 Technical Features - **Dual Controller Architecture:** Fixed toolbar + Dynamic toolbar. - **Registry Mode:** Separate design for buttons, menus, and actions (not implemented in the official version).
- **Event-Driven:** 15 NSNotificationCenter observers - **Action Executor:** Unified customActionByDes mechanism ### 1.3 File Structure```
mntoolbar_official/
├── main.js # Main entry point for the plugin (lines 1, 145)
├── utils.js # Utility library (line 7,381)
├── webviewController.js # UI controller (lines 2, 197)
├── settingController.js # Setting up the controller (line 2, 171)
├── mnaddon.json # Plugin Configuration └── [Icon Resources] # 40+ PNG Icon Files```

## 2. Architecture Design ### 2.1 Class Hierarchy```
JSExtension (MarginNote base class)
    └── MNToolbar (main.js)
        ├── toolbarController (webviewController.js)
        │ ├── Fixed Toolbar UI
        │ └── Dynamic Toolbar UI
        └── settingController (settingController.js)
            └── Settings Interface UI

Utility class:
├── Frame # Layout utility class ├── toolbarUtils # Core utility class (200+ methods)
└── toolbarConfig # Configuration management class (100+ methods)
```

### 2.2 Lifecycle Flow```javascript
// Plugin startup JSB.newAddon()
  ├── JSB.require('utils') // Load utility classes ├── JSB.require('webviewController') // Load UI controller └── JSB.require('settingController') // Load settings controller // Window lifecycle sceneWillConnect() // Window connection ├── self.init() // Initialization ├── Register 15 observers └── Initialize state variables notebookWillOpen() // Open notebook ├── ensureView() // Ensure view exists ├── Restore window state └── Refresh button configuration notebookWillClose() // Close notebook ├── Save window state └── Clean up resources```

## 3. Core File Analysis ### 3.1 main.js - Plugin Main Entry Point (lines 1, 145)

#### 3.1.1 Class Definition ```javascript
var MNToolbarClass = JSB.defineClass(
  'MNToolbar : JSExtension',
  { /* instance method */ },
  { /* Class method */ }
)
```

#### 3.1.2 Event Listening System (15 Observers)
| Event Name | Triggering Timing | Main Functions |
|--------|----------|----------|
| PopupMenuOnNote | Click the card to bring up a menu | Show dynamic toolbar |
| PopupMenuOnSelection | Select text to display a pop-up menu | Show dynamic toolbar |
| ClosePopupMenuOnNote | Close the card menu | Hide the dynamic toolbar |
| ClosePopupMenuOnSelection | Close the selection menu | Hide the dynamic toolbar |
| toggleDynamic | Toggle Dynamic Mode | Toggle Dynamic Toolbar |
refreshView | Refresh the view | Update the UI state |
| toggleMindmapToolbar | Toggle Mind Map Toolbar | Hide/Show Native Toolbar |
| refreshToolbarButton | Refresh Button | Update Button State |
| openToolbarSetting | Open Settings | Show Settings Interface |
| newIconImage | New Icon | Update Button Icon |
| UITextViewTextDidBeginEditingNotification | Start Editing | Trigger Editor |
| UITextViewTextDidEndEditingNotification | End Editing | Close Editor |
| NSUbiquitousKeyValueStoreDidChangeExternallyNotificationUI | iCloud Changes | Sync Configuration |
| AddonBroadcast | Plugin Broadcast | URL Handling Scheme |

#### 3.1.3 Key Method Analysis ##### onPopupMenuOnNote (Lines 246-400)
```javascript
onPopupMenuOnNote: async function (sender) {
  // 1. Check window and dynamic mode if (self.window !== MNUtil.currentWindow) return
  if (!toolbarConfig.dynamic) return

  // 2. Create or retrieve the dynamic toolbar if (!self.testController) {
    self.testController = toolbarController.new()
    self.testController.dynamicWindow = true
  }

  // 3. Calculate the position (based on direction)
  if (toolbarConfig.horizontal(true)) {
    // Horizontal layout: Adjust the Y offset according to the direction of the menu arrow switch (menu.arrowDirection) {
      case 0: yOffset = 45; break
      case 1: yOffset = -80; break
    }
  } else {
    // Vertical layout: Adjust lastFrame.x = winRect.x according to card position - 43 - studyFrameX
    lastFrame.y = winRect.y - 25
  }

  // 4. Display animation testController.view.layer.opacity = 0
  testController.view.hidden = false
  await MNUtil.animate(() => {
    testController.view.layer.opacity = 1.0
  })
}
```

##### onAddonBroadcast (lines 428-469)
Handling URL Scheme calls:
```javascript
// URL format: marginnote4app://addon/mntoolbar?action=xxx
onAddonBroadcast: async function (sender) {
  let config = MNUtil.parseURL(message)
  if (config.params.action) {
    // Execute the specified action let actionDes = toolbarConfig.getDescriptionById(actionKey)
    await toolbarUtils.customActionByDes(actionDes)
  }
  if (config.params.config) {
    // Import configuration self.settingController.importFromShareURL(config.params.config)
  }
}
```

##### checkToolbar (lines 1036-1132)
Intelligent layout management:
```javascript
checkToolbar: function () {
  if (toolbarConfig.horizontal()) {
    // Horizontal mode: Check boundaries, adjust width if (currentFrame.width + currentFrame.x > studyFrame.width) {
      // Exceeding the boundary, constrain the width let maxWidth = toolbarUtils.checkHeight(...)
      currentFrame.width = 45 * buttonNumber + 15
    }
    // Edge snapping if (toolbar.sideMode === "top") currentFrame.y = 0
    if (toolbar.sideMode === "bottom") currentFrame.y = studyFrame.height - 40
  } else {
    // Vertical mode: Split-screen detection, edge snapping if (toolbar.splitMode) {
      currentFrame.x = splitLine - 20
    }
    if (toolbar.sideMode === "left") currentFrame.x = 0
    if (toolbar.sideMode === "right") currentFrame.x = studyFrame.width - 40
  }
}
```

### 3.2 utils.js - Utility Library (7,381 lines) ⭐⭐⭐⭐⭐

#### 3.2.1 Frame Class (Lines 3-140)
A layout utility class that encapsulates frame operations:
```javascript
class Frame {
  static gen(x, y, width, height) {
    return MNUtil.genFrame(x, y, width, height)
  }

  static set(view, x, y, width, height) {
    // Supports both animation and real-time modes if (animate) {
      MNUtil.animate(() => {
        view.frame = frame
      })
    } else {
      view.frame = frame
    }
  }

  static offset(frame, x, y) {
    // Offset calculation return {
      x: frame.x + x,
      y: frame.y + y,
      width: frame.width,
      height: frame.height
    }
  }
}
```

#### 3.2.2 The toolbarUtils class (lines 153-3667)
Core utility class, 200+ methods:

##### Key attribute ```javascript
static errorLog = [] // Error log static currentNoteId // Current card ID
static mainPath // Plugin path static isMac // Platform detection static bottomOffset // Bottom offset (iOS adaptation)
```

##### customActionByDes (lines 324-913) ⭐⭐⭐⭐⭐
Action actuator core:
```javascript
static async customActionByDes(des, button, controller, checkSubscribe = true) {
  // 1. Subscription check if (checkSubscribe && !this.checkSubscribe(true)) return

  // 2. Action Routing (50+ Actions)
  switch (des.action) {
    case "menu":
      // Display menu let menuItems = des.menuItems
      MNUtil.showMenu(menuItems)
      break

    case "setColor":
      // Set color let color = des.color ?? button.color
      MNNote.setHighlightColor(color)
      break

    case "copy":
      // Copy operation (10+ targets)
      switch (des.target) {
        case "noteId": MNUtil.copy(focusNote.noteId); break
        case "noteTitle": MNUtil.copy(focusNote.noteTitle); break
        case "excerptText": MNUtil.copy(focusNote.excerptText); break
        // ... More goals}
      break

    case "paste":
      // Paste operation (supports multiple formats)
      let content = MNUtil.clipboardText
      this.pasteToTarget(des.target, content)
      break

    case "ocr":
      // OCR recognition await this.performOCR(des)
      break

    case "snipaste":
      // Screenshot and posting: MNUtil.postNotification("snipaste", {})
      break

    case "chatAI":
      // AI dialogue MNUtil.postNotification("customChat", {})
      break

    case "search":
      // Search functionality await this.performSearch(des)
      break

    case "confirm":
      // User confirmation let targetDes = await this.userConfirm(des)
      if (targetDes) {
        success = await this.customActionByDes(targetDes, button)
      }
      break

    case "userSelect":
      // User selection let selectDes = await this.userSelect(des)
      if (selectDes) {
        success = await this.customActionByDes(selectDes, button)
      }
      break

    case "triggerButton":
      // Trigger other buttons let description = toolbarConfig.getDesByButtonName(des.buttonName)
      success = await this.customActionByDes(description)
      break

    default:
      // Extended Actions (Plugin Integration)
      if (typeof global !== 'undefined' && global.executeCustomAction) {
        const context = { button, des, focusNote, focusNotes, self: controller }
        const handled = await global.executeCustomAction(des.action, context)
        if (handled) break
      }
      MNUtil.showHUD("Not supported yet...")
  }

  // 3. Subsequent action chain while ("onFinish" in des) {
    let delay = des.delay ?? 0.5
    des = des.onFinish
    await MNUtil.delay(delay)
    await this.customActionByDes(des, button, controller, false)
  }
}
```

##### Helper Methods ```javascript
// Platform detection static checkPlatform() {
  this.isMac = MNUtil.version.type === "macOS"
  this.bottomOffset = this.isMac? 0:35
}

// Error handling static addErrorLog(error, methodName, info) {
  this.errorLog.push({
    time: Date.now(),
    method: methodName,
    Error: error.toString(),
    info: info
  })
  MNUtil.copyJSON(error)
}

// Split-screen detection static getSplitLine(studyController) {
  if (studyController.docMapSplitMode === 1) {
    return studyController.rightMapMode
      studyFrame.width * 0.6
      studyFrame.width * 0.4
  }
  return null
}

// Height constraint static checkHeight(height, maxButton) {
  let buttonNumber = Math.floor(height / 45)
  return Math.min(buttonNumber, maxButton) * 45 + 15
}
```

#### 3.2.3 toolbarConfig Class (Lines 6067-7342)
Configuration Management System:

##### Core Attributes ```javascript
static isFirst = true // First launch static action = [] // Fixed toolbar configuration static dynamicAction = [] // Dynamic toolbar configuration static buttonConfig = {} // Button style configuration static windowState = {} // Window state static iCloudSync = false // iCloud synchronization switch

##### Configuration Management Methods```javascript
// Initialize static init(mainPath) {
  this.mainPath = mainPath
  this.loadDefaultActions()
  this.loadButtonConfig()
  this.readWindowState()
  this.checkCloudStore()
}

// Save configuration static save(key) {
  if (this.iCloudSync) {
    // iCloud storage this.cloudStore.setObjectForKey(this[key], key)
    this.cloudStore.synchronize()
  } else {
    // Local storage NSUserDefaults.standardUserDefaults().setObjectForKey(this[key], key)
  }
}

// Read configuration static read(key) {
  if (this.iCloudSync) {
    return this.cloudStore.objectForKey(key)
  } else {
    return NSUserDefaults.standardUserDefaults().objectForKey(key)
  }
}

// Button configuration management static getDescriptionById(buttonId) {
  let index = this.action.indexOf(buttonId)
  if (index !== -1) {
    return this.actionConfig[index] ?? {}
  }
  return {}
}

static setButtonImage(buttonId, image, isCustom) {
  if (isCustom) {
    // Custom icon this.buttonImages[buttonId] = image
  } else {
    // Built-in icon let imagePath = this.mainPath + "/" + buttonId + ".png
    this.buttonImages[buttonId] = UIImage.imageWithContentsOfFile(imagePath)
  }
}

// Direction switching static toggleToolbarDirection(source) {
  if (source === "fixed") {
    this.windowState.vertical = !this.windowState.vertical
  } else {
    this.windowState.dynamicVertical = !this.windowState.dynamicVertical
  }
  this.save("MNToolbar_windowState")
  MNUtil.refreshAddonCommands()
}

// Color management static refreshColorImage() {
  for (let i = 0; i < 16; i++) {
    let colorKey = "color" + i
    let colorValue = this.colorConfig[i]
    // Dynamically generate color icons this.buttonImages[colorKey] = this.generateColorImage(colorValue)
  }
}
```

### 3.3 webviewController.js - UI controller (line 2,197) ⭐⭐⭐⭐⭐

#### 3.3.1 Class Definition ```javascript
var toolbarController = JSB.defineClass(
  'toolbarController : UIViewController <UIImagePickerControllerDelegate,UINavigationControllerDelegate>',
  { /* instance method */ }
)
```

#### 3.3.2 Initialization (viewDidLoad)
```javascript
viewDidLoad: async function() {
  let self = getToolbarController()

  // 1. Initialize the property self.maxButtonNumber = 30
  self.buttonNumber = 9
  self.isMac = MNUtil.version.type === "macOS"
  self.sideMode = toolbarConfig.getWindowState("sideMode")
  self.splitMode = toolbarConfig.getWindowState("splitMode")

  // 2. Set the view style: self.view.layer.shadowOffset = {width: 0, height: 0}
  self.view.layer.shadowRadius = 15
  self.view.layer.shadowOpacity = 0.5
  self.view.layer.cornerRadius = 5

  // 3. Create a control button: self.screenButton = UIButton.buttonWithType(0)
  self.setButtonLayout(self.screenButton, "changeScreen:")

  // 4. Add gestures self.addPanGesture(self.view, "onMoveGesture:") // Drag self.addPanGesture(self.screenButton, "onResizeGesture:") // Zoom // 5. Load button configuration if (self.dynamicWindow) {
    self.setToolbarButton(toolbarConfig.dynamicAction)
  } else {
    self.setToolbarButton(toolbarConfig.action)
  }
}
```

#### 3.3.3 Gesture Processing System ##### Drag Gesture (onMoveGesture)
```javascript
onMoveGesture: function(gesture) {
  let state = gesture.state
  let translation = gesture.translationInView(self.studyView)

  switch (state) {
    case 1: // Began
      self.onResize = true
      self.beginFrame = self.view.frame
      break

    case 2: // Changed
      let newFrame = Frame.offset(self.beginFrame, translation.x, translation.y)
      // Boundary detection if (newFrame.x < 0) newFrame.x = 0
      if (newFrame.y < 0) newFrame.y = 0
      if (newFrame.x + newFrame.width > studyFrame.width) {
        newFrame.x = studyFrame.width - newFrame.width
      }
      self.view.frame = newFrame
      break

    case 3: // Ended
      self.onResize = false
      // Edge snapping self.snapToEdge(self.view.frame)
      //Save location toolbarConfig.windowState.frame = self.view.frame
      toolbarConfig.save("MNToolbar_windowState")
      break
  }
}
```

##### Zoom Gesture (onResizeGesture)
```javascript
onResizeGesture: function(gesture) {
  let state = gesture.state
  let translation = gesture.translationInView(self.view)

  if (state === 1) { // Began
    self.beginFrame = self.view.frame
    self.beginButtonNumber = self.buttonNumber
  }

  if (state === 2) { // Changed
    if (toolbarConfig.horizontal()) {
      // Horizontal scaling let deltaWidth = translation.x
      let newButtonNumber = Math.floor((self.beginFrame.width + deltaWidth) / 45)
      newButtonNumber = Math.max(1, Math.min(newButtonNumber, self.maxButtonNumber))

      if (newButtonNumber !== self.buttonNumber) {
        self.buttonNumber = newButtonNumber
        self.setToolbarLayout()
      }
    } else {
      // Vertical scaling let deltaHeight = translation.y
      let newButtonNumber = Math.floor((self.beginFrame.height + deltaHeight) / 45)
      newButtonNumber = Math.max(1, Math.min(newButtonNumber, self.maxButtonNumber))

      if (newButtonNumber !== self.buttonNumber) {
        self.buttonNumber = newButtonNumber
        self.setToolbarLayout()
      }
    }
  }
}
```

#### 3.3.4 Button Management System ##### setToolbarButton (lines 745-889)
Dynamically create and configure buttons:
```javascript
setToolbarButton: function(actionArray) {
  // 1. Clean up old buttons this.toolButtons?.forEach(button => button.removeFromSuperview())

  // 2. Create new buttons this.toolButtons = []
  actionArray.forEach((buttonId, index) => {
    if (index >= 36) return // Maximum 36 buttons // Create a button let button = MNButton.new()
    button.id = buttonId

    // Set the icon let image = toolbarConfig.getButtonImage(buttonId)
    MNButton.setImage(button, image)

    // Set the action let des = toolbarConfig.getDescriptionById(buttonId)
    if (des.action === "menu") {
      // Menu button this.addLongPressGesture(button, "onButtonMenu:")
    } else {
      // For a regular button, addTargetAction(this, "onButtonTapped:")
    }

    // Special handling if (buttonId.includes("color")) {
      button.color = toolbarConfig.colorConfig[index]
      button.layer.borderColor = button.color
    }

    this.toolButtons.push(button)
    this.view.addSubview(button)
  })

  // 3. Layout the button: this.setToolbarLayout()
}
```

##### setToolbarLayout (lines 890-994)
Intelligent layout algorithm:
```javascript
setToolbarLayout: function() {
  if (toolbarConfig.horizontal()) {
    // Horizontal layout let width = 45 * this.buttonNumber + 15
    Let height = 40

    // Constraint detection if (this.currentFrame.x + width > studyFrame.width) {
      width = studyFrame.width - this.currentFrame.x - 15
      this.buttonNumber = Math.floor(width / 45)
    }

    // Update frame
    Frame.set(this.view, this.currentFrame.x, this.currentFrame.y, width, height)

    // Layout buttons this.toolButtons.forEach((button, index) => {
      if (index < this.buttonNumber) {
        Frame.set(button, 7.5 + index * 45, 5, 30, 30)
        button.hidden = false
      } else {
        button.hidden = true
      }
    })

    // Control the button position Frame.set(this.screenButton, width - 15, 12.5, 15, 15)
  } else {
    // Vertical layout let width = 40
    let height = 45 * this.buttonNumber + 15

    // Constraint detection if (this.currentFrame.y + height > studyFrame.height) {
      height = studyFrame.height - this.currentFrame.y - 15
      this.buttonNumber = Math.floor(height / 45)
    }

    // Update frame
    Frame.set(this.view, this.currentFrame.x, this.currentFrame.y, width, height)

    // Layout buttons this.toolButtons.forEach((button, index) => {
      if (index < this.buttonNumber) {
        Frame.set(button, 5, 7.5 + index * 45, 30, 30)
        button.hidden = false
      } else {
        button.hidden = true
      }
    })

    // Control the button position Frame.set(this.screenButton, 12.5, height - 15, 15, 15)
  }
}
```

#### 3.3.5 Button Action Handling ##### Color Button
```javascript
colorButton: function(button) {
  let des = toolbarConfig.getDescriptionById(button.id)

  // Double-click check if (Date.now() - self.lastTapTime < 300) {
    if (des.doubleClick) {
      self.customActionByDes(button, des.doubleClick)
      return
    }
  }

  // Set the color des.color = button.color
  des.action = "setColor"
  self.customActionByDes(button, des, false)
}
```

##### Copy button
```javascript
copy: function(button) {
  let des = toolbarConfig.getDescriptionById("copy")

  // Smart object detection if (!des.target) {
    let focusNote = MNNote.getFocusNote()
    if (focusNote.excerptText) {
      des.target = "excerptText"
    } else if (focusNote.noteTitle) {
      des.target = "noteTitle"
    } else {
      des.target = "noteId"
    }
  }

  des.action = "copy"
  self.customActionByDes(button, des, false)
}
```

### 3.4 settingController.js - Setting up the controller (line 2, 171)

#### 3.4.1 Interface Layout ```javascript
viewDidLoad: function() {
  // 1. Create the main view: self.view.frame = MNUtil.genFrame(100, 100, 600, 400)
  self.view.layer.cornerRadius = 10

  // 2. Create the top bar: self.topBar = UIView.alloc().init()
  Frame.set(self.topBar, 0, 0, 600, 40)

  // 3. Create tabs self.tabs = ["Button", "Popup", "Advance", "Import/Export"]
  self.createTabButtons()

  // 4. Create the content area self.contentView = UIView.alloc().init()
  Frame.set(self.contentView, 0, 40, 600, 360)

  // 5. Load the button configuration interface self.loadButtonView()
}
```

#### 3.4.2 Button Configuration Interface ```javascript
loadButtonView: function() {
  // Create 36 button slots for (let i = 0; i < 36; i++) {
    let button = MNButton.new()
    button.index = i

    // Current configuration let buttonId = toolbarConfig.action[i] ?? "empty"
    let image = toolbarConfig.getButtonImage(buttonId)
    MNButton.setImage(button, image)

    // Click to select button.addTargetAction(self, "selectButton:")

    // Long press to edit self.addLongPressGesture(button, "editButton:")

    self.buttonSlots.push(button)
    self.buttonView.addSubview(button)
  }
}
```

#### 3.4.3 Configure Synchronization ```javascript
// iCloud sync toggleiCloudSync: function() {
  toolbarConfig.iCloudSync = !toolbarConfig.iCloudSync

  if (toolbarConfig.iCloudSync) {
    // Enable sync: Upload local configuration to iCloud
    toolbarConfig.uploadToCloud()
    MNUtil.showHUD("iCloud Sync ✅")
  } else {
    // Disable sync: Download iCloud configuration to local toolbarConfig.downloadFromCloud()
    MNUtil.showHUD("iCloud Sync ❌")
  }
}

// Configure import/export exportConfig: function() {
  let config = {
    action: toolbarConfig.action,
    dynamicAction: toolbarConfig.dynamicAction,
    actionConfig: toolbarConfig.actionConfig,
    buttonConfig: toolbarConfig.buttonConfig,
    colorConfig: toolbarConfig.colorConfig
  }

  let base64 = MNUtil.base64Encode(JSON.stringify(config))
  let url = "marginnote4app://addon/mntoolbar?config=" + base64
  MNUtil.copy(url)
  MNUtil.showHUD("Configuration URL copied!")
}

importConfig: function(url) {
  let config = MNUtil.parseURL(url)
  if (config.params.config) {
    let configData = JSON.parse(MNUtil.base64Decode(config.params.config))

    // Application configuration Object.assign(toolbarConfig, configData)
    toolbarConfig.save("MNToolbar_action")
    toolbarConfig.save("MNToolbar_actionConfig")

    // Refresh UI
    self.toolbarController.setToolbarButton()
    self.refreshView()

    MNUtil.showHUD("Configuration imported!")
  }
}
```

## 4. Event System Analysis ### 4.1 Event Flowchart```
User Operations ↓
System events (NSNotification)
    ↓
MNToolbar Observer Method ↓
Determine the window and its status ↓
Execute the corresponding logic ↓
Update UI/Save state```

### 4.2 Critical Event Handling #### PopupMenuOnNote/Selection
- **Trigger:** Click the card or select text - **Function:** Displays the dynamic toolbar - **Features:**
  - Intelligent location calculation - Split-screen mode detection - Fade-in animation effect #### UITextViewTextDidBeginEditing
- **Trigger**: Starts text editing - **Function**: Can trigger editor plugins - **Features**:
  - Detect editing position - Calculate optimal display position - Send openInEditor notification #### AddonBroadcast
- **Trigger**: URL Scheme call - **Function**: Inter-plugin communication - **Format**: `marginnote4app://addon/mntoolbar?action=xxx`

## 5. Action Execution Mechanism ### 5.1 Execution Flow```
Button click / menu selection ↓
Get button configuration (getDescriptionById)
    ↓
customActionByDes(button, des)
    ↓
Action routing (50+ actions)
    ↓
Execute specific logic ↓
Handling the onFinish chain```

### 5.2 Action Type Classification #### Basic Actions - setColor: Set highlight color - copy/paste: Copy and paste - undo/redo: Undo and redo #### Menu Actions - menu: Display menu - userSelect: User selection - confirm: Confirmation dialog #### Plugin Integration - ocr: OCR recognition - snipaste: Screenshot and paste - chatAI: AI dialogue - search: Search function - openInEditor: Editor #### Advanced Actions - triggerButton: Trigger other buttons - onFinish: Subsequent action chain - doubleClick: Double-click action ### 5.3 Action Configuration Example ```javascript
{
  "action": "menu",
  "menuItems": [
    {
      "action": "copy",
      "menuTitle": "Copy Note ID",
      "target": "noteId"
    },
    {
      "action": "menu",
      "menuTitle": "More Options",
      "menuItems": [...]
    }
  ],
  "onFinish": {
    "action": "showHUD",
    "message": "Operation completed",
    "delay": 0.5
  }
}
```

## 6. UI Management System ### 6.1 Dual Toolbar Architecture #### Fixed Toolbar - **Features**: Persistent display, adjustable position, supports 36 buttons - **Interactions**: Drag and move, edge scaling, edge snapping - **Layout**: Horizontal/vertical adaptive #### Dynamic Toolbar - **Features**: Follows cards, automatic show/hide, up to 9 buttons - **Trigger**: PopupMenuOnNote/Selection
- **Animation**: Fade-in/Fade-out Effect ### 6.2 Gesture Recognition System | Gesture Type | Target | Function |
|----------|------|------|
| Pan | view | drag and move |
| Pan | screenButton | Zoom Adjustment |
| LongPress | button | Show Menu |
| Tap | button | Perform an action |
DoubleTap | button | double-tap action |

### 6.3 Layout Algorithm #### Boundary Constraints```javascript
// Ensure it doesn't exceed the screen: if (frame.x < 0) frame.x = 0
if (frame.y < 0) frame.y = 0
if (frame.x + frame.width > screenWidth) {
  frame.x = screenWidth - frame.width
}
```

#### Edge snapping```javascript
// Adsorption distance threshold const snapThreshold = 20

// Left edge snapping if (frame.x < snapThreshold) {
  frame.x = 0
  self.sideMode = "left"
}

// Snap to the right edge if (frame.x + frame.width > screenWidth - snapThreshold) {
  frame.x = screenWidth - frame.width
  self.sideMode = "right"
}
```

#### Split-screen adaptation```javascript
// Detect split-screen mode if (studyController.docMapSplitMode === 1) {
  let splitLine = studyController.rightMapMode
    screenWidth * 0.6
    screenWidth * 0.4

  // Snap to the split line if (Math.abs(frame.x - splitLine) < 20) {
    frame.x = splitLine - 20
    self.splitMode = true
  }
}
```

## 7. Configuration Management ### 7.1 Configuration Structure ```javascript
{
  // Window state "windowState": {
    "open": true,
    "frame": {x: 10, y: 100, width: 40, height: 405},
    "vertical": false,
    "dynamicVertical": true,
    "sideMode": "left",
    "splitMode": false
  },

  // Button configuration (36 slots)
  "action": ["undo", "redo", "color0", "color1", ...],
  "dynamicAction": ["copy", "paste", "search", ...],

  // Button action configuration "actionConfig": [
    {"action": "copy", "target": "excerptText"},
    {"action": "menu", "menuItems": [...]},
    ...
  ],

  // Button style "buttonConfig": {
    "color": "#457bd3",
    "alpha": 0.8,
    "borderWidth": 2
  },

  // Color scheme (16 colors)
  "colorConfig": [
    "#ff0000", "#00ff00", "#0000ff", ...
  ]
}
```

### 7.2 Storage Mechanism #### Local Storage ```javascript
NSUserDefaults.standardUserDefaults()
  .setObjectForKey(config, "MNToolbar_config")
```

#### iCloud Storage ```javascript
NSUbiquitousKeyValueStore.defaultStore()
  .setObjectForKey(config, "MNToolbar_config")
```

### 7.3 Synchronization Strategy 1. **Automatic Synchronization**: Listen for NSUbiquitousKeyValueStoreDidChangeExternallyNotification
2. **Manual Sync:** User triggers Manual Sync.
3. **Conflict Resolution:** Cloud-First Strategy ## 8. Technical Highlights ### 8.1 Innovative Design 1. **Dual Toolbar Architecture:** Fixed + Dynamic, meeting different usage scenarios 2. **Intelligent Layout Algorithm:** Boundary detection, edge snapping, split-screen adaptation 3. **Action Executor:** Unified customActionByDes mechanism 4. **Configuration Cloud Synchronization:** Seamless iCloud synchronization ### 8.2 Performance Optimization 1. **Lazy Loading:** Creating UI components on demand 2. **Event Debouncing:** Avoiding repeated triggering 3. **Animation Optimization:** Unified management using MNUtil.animate 4. **Memory Management:** Timely cleanup of unused views ### 8.3 Extensibility Design 1. **Action Routing:** Easy to add new actions 2. **Plugin Integration:** Through Notification and URL Scheme
3. **Configuration Import/Export:** Supports configuration sharing. 4. **Custom Icons:** Supports user-uploaded icons. ## 9. Design Patterns ### 9.1 Singleton Pattern ```javascript
// Use self as a singleton reference const getToolbarController = () => self
```

### 9.2 Observer Pattern - 15 NSNotificationCenter observers - Event-driven architecture design ### 9.3 Strategy Pattern - Action routing in customActionByDes - Different actions correspond to different processing strategies ### 9.4 Chain of Responsibility Pattern - onFinish action chain - Sequential execution of multiple actions ### 9.5 Factory Pattern - Button creation and configuration - Menu item generation ## 10. Potential Improvement Directions ### 10.1 Architecture Optimization 1. **Registry Pattern**: Separate buttons, menus, and actions (already implemented in xdyy series files)
2. **Modularization**: Breaking down the massive utils.js file.
3. **TypeScript**: Added type definitions ### 10.2 Feature Enhancements 1. **Button Grouping**: Support for button group concepts 2. **Theme System**: Switch between multiple themes 3. **Gesture Extension**: More gesture support 4. **Animation Effects**: Richer transition animations ### 10.3 Performance Optimizations 1. **Virtual List**: Performance optimization for a large number of buttons 2. **Caching Mechanism**: Configuration and icon caching 3. **Asynchronous Loading**: Loading functional modules on demand ## 11. Development Guide ### 11.1 Adding New Buttons ```javascript
// 1. Register the toolbarConfig class in toolbarConfig.toolbarConfig.registerButton("myButton", {
  image: "myButton.png"
  action: "myAction"
})

// 2. Add a handling case "myAction" to toolbarUtils.customActionByDes:
  // Implement function break

// 3. Add icon file // myButton.png → Plugin directory```

### 11.2 Add new action ```javascript
// Add a case in customActionByDes
case "myNewAction":
  let result = await this.performMyAction(des)
  if (result) {
    MNUtil.showHUD("Success!")
  }
  break
```

### 11.3 Integrating Other Plugins ```javascript
// Via Notification
MNUtil.postNotification("targetPlugin", {
  action: "doSomething",
  data: {...}
})

// Via URL Scheme
let url = "marginnote4app://addon/targetPlugin?action=xxx"
Application.sharedInstance().openURL(NSURL.URLWithString(url))
```

## 12. In summary, MNToolbar is a powerful and well-designed MarginNote 4 plugin, showcasing the robust capabilities of the plugin system:

### Core Values ​​1. **Improved Efficiency**: Quick access to frequently used functions 2. **Personalized Customization**: 36 configurable buttons 3. **Intelligent Interaction**: Dynamic toolbar follows cards 4. **Cloud Synchronization**: Multi-device configuration synchronization ### Technical Features 1. **Clear Architecture**: Dual controllers, three-tier utility classes 2. **Rich Interaction**: Multiple gestures, intelligent layout 3. **Strong Extensibility**: Easy to add new features 4. **Excellent Performance**: Optimized animation and memory management ### Learning Value - Demonstrates best practices in MarginNote plugin development - Provides rich UI interaction examples - Demonstrates various ways of integrating plugins - Reflects the implementation of configuration management and cloud synchronization This analysis provides a solid technical foundation for the secondary development and tutorial writing of the MNToolbar plugin.

---

*Analysis completed on 2025-09-01*
