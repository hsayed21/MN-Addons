# MN Toolbar Development Guide > This guide aims to help developers understand how the MN Toolbar works and master extension development techniques. It is suitable for both human developers and can be used as prompts for AI-assisted development.

## Table of Contents - [Part 1: MN Toolbar Basic Principles](#Part 1 mn-toolbar-Basic Principles)
  - [1.1 Architecture Overview](#11-Architecture Overview)
  - [1.2 Button Working Principle](#12-Button Working Principle)
  - [1.3 Menu System Principles](#13-Menu System Principles)
  - [1.4 Action Processing Flow](#14-Action Processing Flow)
- [Part Two: Patch Architecture Design](#Part Two: Patch Architecture Design)
  - [2.1 Why is a patch architecture needed?](#21-Why is a patch architecture needed?)
  - [2.2 Registry Schema Design](#22-Registry Schema Design)
  - [2.3 Four-Layer Architecture Analysis](#23-Four-Layer Architecture Analysis)
  - [2.4 Implementation Details of Decoupling](#24-Implementation Details of Decoupling)
- [Part Three: Development Practice Guide](#Part Three Development Practice Guide)
  - [3.1 Environmental Preparation](#31-Environmental Preparation)
  - [3.2 Quick Start: The First Button](#32-Quick Start: The First Button)
  - [3.3 Advanced: Multilevel Menus](#33-Advanced Multilevel Menus)
  - [3.4 User Interaction Mode](#34-User Interaction Mode)
  - [3.5 Best Practices](#35-Best Practices)
- [Part Four: API Reference](#Part Four API Reference)
  - [4.1 Core API](#41-core-api)
  - [4.2 Debugging Techniques](#42-Debugging Techniques)
  - [4.3 Frequently Asked Questions](#43-Frequently Asked Questions)

---

## Part 1: MN Toolbar Basic Principles ### 1.1 Architecture Overview MN Toolbar is a toolbar plugin for MarginNote, developed using the JSB (JavaScript Bridge) framework. The overall architecture consists of four core modules:

```
┌───────────────────────────────────────┐
│ main.js (Entry Point) │
│ - Lifecycle Management │
│ - Plugin Initialization │
│ - Observer Registration │
└────────────┬──────────────────────────┘
             │
┌────────────▼──────────────────────────┐
│ webviewController.js │
│ - UI Interface Management │
│ - Button Creation and Layout │
│ - Event Response (Click/Long Press/Double Tap) │
│ - Gesture Recognition │
└────────────┬──────────────────────────┘
             │
┌────────────▼──────────────────────────┐
│ utils.js │
│ - Configuration Management (toolbarConfig) │
│ - Utility functions (toolbarUtils) │
│ - Action Processing Logic │
│ - Button/Menu Configuration │
└────────────┬──────────────────────────┘
             │
┌────────────▼──────────────────────────┐
│ settingController.js │
│ - Settings Interface │
│ - Configure Persistence │
│ - User Preference Management │
└───────────────────────────────────────┘
```

### 1.2 Button Working Principle > **Beginner's Tip:** If you are not familiar with programming, you can think of a button as a light switch in your home. When you press the switch (click the button), the circuit is connected (triggering an event), and the light turns on (performing a function).

#### 1.2.1 Basic Concepts Before delving deeper, let's understand a few basic concepts:

- **UIButton**: A button component provided by the iOS system, which can be clicked just like a real button. - **Event**: User actions, such as click, long press, double-click, etc. - **Function**: A piece of code that can be called and executed, like an "action script".
- **JSON**: A data format enclosed in curly braces `{}`, containing key-value pairs, such as `{name:"button", color:3}`.

#### 1.2.2 Detailed Explanation of Button Creation Process When the plugin starts, buttons are created through the following process:

```javascript
// webviewController.js - Button creation viewDidLoad: function() {
  // 1. Create a UIButton instance // UIButton.buttonWithType(0) creates a standard button // Parameter 0 indicates UIButtonTypeCustom (custom style button)
  let button = UIButton.buttonWithType(0);

  // 2. Set button appearance // setTitleForState: Sets the text displayed by the button in a certain state // The second parameter 0 indicates UIControlStateNormal (normal state)
  button.setTitleForState('Button Text', 0);

  // setImageForState: Sets the button icon // image is a 40x40 pixel PNG image object button.setImageForState(image, 0);

  // Set the background color, #9bb2d6 is a light blue hexadecimal color value. button.backgroundColor = UIColor.colorWithHexString("#9bb2d6");

  // Set rounded corners to make the button look better. button.layer.cornerRadius = 5;

  // 3. Bind click events - This is the core!
  // This step tells the system what to do when the user clicks this button.button.addTargetActionForControlEvents(
    this, // target: Who will handle this event (the current controller)
    "customAction:", // action: Which method to call (the method name must include a colon)
    1 << 6 // event: When is it triggered (see details below)
  );

  // 4. Add to View // Add the button to the interface so that the user can see and click it. this.view.addSubview(button);
}
```

**Key numerical explanation: What does `1 << 6` mean?**

```javascript
// 1 << 6 is a bitwise operation, meaning shift 1 left by 6 bits. // Binary: 000001 becomes 1000000
// Decimal: 1 becomes 64
// Meaning: UIControlEventTouchUpInside = 64

// Touch event types in iOS:
// 1 << 0 = 1 : TouchDown (finger press)
// 1 << 1 = 2 : TouchDownRepeat (press repeatedly)
// 1 << 2 = 4 : TouchDragInside (drag inside the button)
// 1 << 3 = 8 : TouchDragOutside (drag the button outside)
// 1 << 4 = 16 : TouchDragEnter (drag into the button)
// 1 << 5 = 32 : TouchDragExit (drag outside the button)
// 1 << 6 = 64 : TouchUpInside (Lift your finger inside the button) ✅ Most commonly used // 1 << 7 = 128 : TouchUpOutside (Lift your finger outside the button)

// Why use TouchUpInside?
// This is the interaction method that best suits user habits:
// - Users can change their minds after pressing the button (this will not trigger if the button is dragged out and then released).
// - To prevent accidental clicks (the button must be released within its range for a click to be considered complete).
```

**Button creation in actual code:**

```javascript
// Actual code in webviewController.js (lines 1037-1052)
toolbarController.prototype.setColorButtonLayout = function (button,targetAction,color) {
    // Set the button to automatically resize: button.autoresizingMask = (1 << 0 | 1 << 3);

    // Set button text color button.setTitleColorForState(UIColor.blackColor(), 0); // Normal state: black button.setTitleColorForState(toolbarConfig.highlightColor, 1); // Highlight state: specific color // Set background color button.backgroundColor = color;

    // Set rounded corners and cropping button.layer.cornerRadius = 10;
    button.layer.masksToBounds = true; // Crop the portion extending beyond the rounded corners if (targetAction) {
      // Important: Remove old event listeners first to avoid duplicate bindings. `let number = 64;` // This is the result of 1 << 6. `button.removeTargetActionForControlEvents(this, targetAction, number);`
      button.addTargetActionForControlEvents(this, targetAction, number);

      // Also add double-click detection to button.addTargetActionForControlEvents(this, "doubleClick:", 1 << 1);
    }

    // Add to the view: this.view.addSubview(button);
}

#### 1.2.3 In-depth analysis of click trigger principle **Complete click event flow:**

```
User touches the screen with their finger ↓
iOS system detected a touch point ↓
Determine which button the touch point is on ↓
Record touch state changes ↓
When you lift your finger, check if it's still inside the button ↓ (Yes)
Trigger the TouchUpInside event ↓
Call the bound method```

When a user clicks the button, the system goes through the following detailed steps:

**Step 1: iOS system captures touch events**
```javascript
// The system detected a finger touch // Record the touch point coordinates (x, y)
// Find the UI element at this coordinate```

**Step 2: UIButton identifies event type**
```javascript
// System determines event type if (finger pressed within button && finger released within button) {
  // Trigger the TouchUpInside event (value 64)
  eventType = UIControlEventTouchUpInside;
}
```

**Step 3: Trigger the bound action method**
```javascript
// webviewController.js - The actual customAction method (lines 270-294)
customAction: async function (button) {
  let self = getToolbarController();

  // 1. Determine the function name corresponding to the button // button.target: The directly specified function name (highest priority)
  // button.index: The button's index in the toolbar (0, 1, 2...)
  let dynamicOrder = toolbarConfig.getWindowState("dynamicOrder");
  let useDynamic = dynamicOrder && self.dynamicWindow;
  let actionName = button.target ?? (useDynamic
    `toolbarConfig.dynamicAction[button.index]` // Dynamic toolbar configuration: `toolbarConfig.action[button.index]` // Fixed toolbar configuration // `actionName` example: "copy", "custom15", "timer", etc. // 2. Get detailed configuration of this function // `getDescriptionById` will find the complete configuration information of the button. `let des = toolbarConfig.getDescriptionById(actionName);`
  // des Example: {
  // action: "copy",
  // target: "title",
  // doubleClick: {...},
  // onLongPress: {...}
  // }

  // 3. Handle double-click logic (if double-click is configured)
  if ("doubleClick" in des) {
    button.delay = true; // Delay hiding the menu self.onClick = true;

    if (button.doubleClick) {
      // This is the second click, executing the double-click action. button.doubleClick = false;
      let doubleClick = des.doubleClick;
      if (!("action" in doubleClick)) {
        doubleClick.action = des.action; // Inherit the default action}
      self.customActionByDes(button, doubleClick);
      return;
    }
    // First click, wait for possible second click // See the double-click handling section for details}

  // 4. Execute the action: self.customActionByDes(button, des);
}
```

**Step 4: Locate and execute the corresponding action configuration**
```javascript
// utils.js - customActionByDes method (starting from line 5386)
customActionByDes: async function(des, button, controller) {
  let action = des.action; // Get the action type // Execute different operations based on the action type switch(action) {
    case "copy":
      // Perform copy operation if (des.target || des.content) {
        success = await this.copy(des);
      } else {
        success = this.smartCopy(); // Smart copy
      break

    case "setColor":
      // Set color let focusNote = MNNote.getFocusNote();
      if (focusNote) {
        focusNote.colorIndex = des.color; // Color index from 0 to 15}
      break

    case "menu":
      // Show menu (see Menu System section)
      this.showMenu(des);
      break

    default:
      // Check if it is a custom action (an extension point of the patch architecture)
      if (typeof global !== 'undefined' && global.executeCustomAction) {
        const context = {button, des, focusNote, focusNotes, self: controller};
        const handled = await global.executeCustomAction(des.action, context);
        if (handled) break;
      }
      MNUtil.showHUD("Not supported yet...");
  }
}
```

**Button Attribute Details:**

```javascript
// Each button object contains the key property button = {
  // System properties frame: {x: 0, y: 0, width: 40, height: 40}, // Position and size backgroundColor: UIColor, // Background color layer: { // Visual layer cornerRadius: 10, // Corner radius masksToBounds: true // Whether to crop },

  // Custom attributes (added by the plugin)
  target: "copy", // Button's function name index: 3, // Button's position in the toolbar color: 5, // Color button's color index menu: PopupMenu, // Associated popup menu object doubleClick: false, // Double-click status flag delay: false // Delayed hide flag
```

**Practical example: Clicking the "Copy" button**

```javascript
// 1. User clicks the "Copy" button // 2. System triggers customAction(button)
// 3. Retrieve actionName = "copy"
// 4. Retrieve des = {action: "copy", target: "title"}
// 5. Execute customActionByDes
// 6. switch statement matches case "copy"
// 7. Execute the replication logic:
// - Get the focused card // - Determine the content to copy based on the target (title/excerpt/comment)
// - Call MNUtil.copy() to copy to the clipboard // - Display the HUD message "Copied"
```

#### 1.2.4 Detailed Explanation of Long-Press Gesture Principle > **Beginner's Tip:** A long press is like holding down an elevator button. The system times it; if the set time (usually 0.3 seconds) is exceeded, it is considered a "long press" instead of a normal click.

**The mechanism behind long-press gestures:**

```javascript
// webviewController.js - addLongPressGesture method (lines 2208-2218)
toolbarController.prototype.addLongPressGesture = function (view, selector) {
  // 1. Create a long press gesture recognizer // UILongPressGestureRecognizer: The long press gesture class provided by iOS // this: The object that handles the gesture (the current controller)
  // selector: The name of the method to be called when the gesture is triggered. let gestureRecognizer = new UILongPressGestureRecognizer(this, selector);

  // 2. Set long press trigger time // minimumPressDuration: Minimum press time (seconds)
  // 0.3 seconds is a balance point: it prevents accidental touches but doesn't make users wait too long, so gestureRecognizer.minimumPressDuration = 0.3;

  // 3. Add a gesture recognizer to the view (usually a button).
  // This will allow the button to recognize long-press gestures. view.addGestureRecognizer(gestureRecognizer);
}
```

**Gesture Status Explained:**

```javascript
// The 5 states of the gesture recognizer gesture.state = {
  0: "Possible", // Possible: The gesture has just started, and the gesture itself is not yet confirmed. 1: "Began", // Beginning: Confirmed to be a long press gesture (press for more than 0.3 seconds).
  2: "Changed", // Change: Finger moves but is still pressed. 3: "Ended", // End: Finger lifts, gesture complete. 4: "Cancelled", // Cancel: Gesture is interrupted (e.g., incoming phone call).
  5: "Failed" // Failure: Gesture conditions not met}
```

**Gesture State Transition Diagram (Beginner Version):**

```
User presses finger ↓
[Possible] State 0
    ├─ Immediately lift → [Failed] Status 5 (not a long press)
    └─ Continue holding ↓ (after 0.3 seconds)
    [Began] State 1 ← This triggers a long press action!
        ├─ Finger movement → [Changed] State 2
        │ ├─ Continue moving → Maintain state 2
        │ └─ Lift your finger → [Ended] Status 3
        ├─ Lift finger → [Ended] Status 3
        └─ Interrupted → [Cancelled] Status 4

The actual code only needs to handle the Began (1) state:
if (gesture.state === 1) {
  // Perform a long press operation}
```

**Complete implementation of the long press response method:**

```javascript
// webviewController.js - onLongPressGesture method (lines 902-921)
onLongPressGesture: async function (gesture) {
  // Only process when the gesture begins (state === 1)
  // To avoid repeated triggering of if (gesture.state === 1) { // UIGestureRecognizerStateBegan
    // 1. Get the button that triggers the gesture let button = gesture.view; // view is the button where the gesture is added // 2. Determine the function corresponding to the button let dynamicOrder = toolbarConfig.getWindowState("dynamicOrder");
    let useDynamic = dynamicOrder && self.dynamicWindow;

    // Get the button's function name // button.target: The directly specified function name // button.index: The button's position index let actionName = button.target ?? (useDynamic
      ? toolbarConfig.dynamicAction[button.index]
      : toolbarConfig.action[button.index]);

    // 3. Retrieve feature configuration if (actionName) {
      let des = toolbarConfig.getDescriptionById(actionName);

      // 4. Check if a long press action is configured if ("onLongPress" in des) {
        // des.onLongPress Example:
        // {
        // action: "menu",
        // menuWidth: 200,
        // menuItems: [...]
        // }

        let onLongPress = des.onLongPress;

        // If no action is specified in the long-press configuration, the default action will be inherited.
        if (!("action" in onLongPress)) {
          onLongPress.action = des.action;
        }

        // 5. Execute the long press action: await self.customActionByDes(button, onLongPress);
        return;
      } else {
        // No long press action is configured; display the message MNUtil.showHUD("No long press action");
      }
    }
  }

  // Other states (Changed, Ended, etc.) will not be processed for now // Advanced features such as gesture tracking and animations can be added here}
```

**Practical example: Long press to display menu**

```javascript
// Button configuration example {
  name: "Card Making"
  image: "makeCards",
  description: {
    action: "quickMakeCard", // Single click: Quick card creation onLongPress: { // Long press: Show menu action: "menu",
      menuWidth: 250,
      menuItems: [
        {action: "quickMakeCard", menuTitle: "Quick Card Making"},
        {action: "advancedMakeCard", menuTitle: "Advanced Card Making"},
        {action: "batchMakeCard", menuTitle: "Batch Card Production"}
      ]
    }
  }
}

// User interaction flow:
// 1. The user presses and holds the "Make Card" button. // 2. After 0.3 seconds, onLongPressGesture is triggered.
// 3. gesture.state === 1 (Began)
// 4. Retrieve actionName = "makeCards"
// 5. Retrieve the des.onLongPress configuration // 6. Execute customActionByDes(button, des.onLongPress)
// 7. action === "menu", display the menu // 8. Users can select specific operations from the menu```

Why 0.3 seconds?

```javascript
// Recommended long press time for different scenarios: 0.2 seconds. Too short, and it's easy to accidentally press (before the user can react).
0.3 seconds: Standard value, iOS system default ✅
0.5 seconds: Suitable for elderly users or dangerous operations requiring confirmation. 1.0 second: Special scenarios, such as confirmation before deleting all data. // You can adjust gestureRecognizer.minimumPressDuration = 0.5; // A more conservative setting.

#### 1.2.5 Double-click processing mechanism explained in detail > **Beginner's tip**: Double-clicking is like knocking on a door—the two "knock knocks" need to be fast enough (usually within 300 milliseconds), otherwise it becomes two separate knocks.

**The principle behind double-click implementation:**

iOS does not natively support double-clicking buttons, so this plugin cleverly achieves this through a "delayed judgment":

```
First click → Mark → Wait 300ms → Decision ↓ ↓
         A second click? No second click ↓ ↓
           Perform a double-click action. Perform a single-click action.

**Complete double-click handling code:**

```javascript
// double-click handling in the `customAction` method of webviewController.js: function(button) {
  let des = toolbarConfig.getDescriptionById(actionName);

  // Check if double-click functionality is configured if ("doubleClick" in des) {
    // example of des configuration:
    // {
    // action: "copy", // Single click action // doubleClick: { // Double click action // action: "copyAll"
    // }
    // }

    // Set a delay flag to prevent the menu from closing immediately. button.delay = true;
    self.onClick = true;

    // If the button has an associated menu, also prevent the menu from closing if (button.menu) {
      button.menu.stopHide = true;
    }

    // Determine if (button.doubleClick) {
      // ===== This is the second click (double-click to complete) =====
      button.doubleClick = false; // Reset the marker // Get the double-click configuration let doubleClick = des.doubleClick;

      // If double-clicking the configuration does not specify an action, the default action will be used.
      if (!("action" in doubleClick)) {
        doubleClick.action = des.action;
      }

      // Execute the double-click action self.customActionByDes(button, doubleClick);
      return; // End processing } else {
      // ===== This is the first click (possibly the start of a double click) =====
      button.doubleClick = true; // Mark as "Wait for second click"

      // Set a timeout: check after 300 milliseconds setTimeout(() => {
        // If the marker is still there, it means there was no second click; execute the click if (button.doubleClick) {
          button.doubleClick = false; // Reset the marker // Execute the click action self.customActionByDes(button, des);

          // If there is a menu, close it if (button.menu) {
            button.menu.dismissAnimated(true);
          }
        }
        // If the marker is no longer present, it means the double-click has already been performed; do nothing.}, 300); // 300 milliseconds of waiting time.
  }
}
```

**Considerations for double-clicking the time window:**

```javascript
// Different double-click time window settings: 200ms: Too short, slow-handed users will find it difficult to complete a double-click; 300ms: Standard value, the default setting for most applications. ✅
400ms: A lenient setting, suitable for devices with less sensitive touch input. 500ms: Too long, resulting in a poor user experience (feels sluggish).

// Can be adjusted based on user group const DOUBLE_CLICK_DELAY = 300; // Configurable constant setTimeout(..., DOUBLE_CLICK_DELAY);
```

**Practical example: Single/double click of the copy button**

```javascript
// Button configuration {
  name: "Copy",
  image: "copy",
  description: {
    action: "copy",
    target: "title", // Single click: Copy title doubleClick: { // Double click: Copy all content action: "copy",
      target: "all"
    }
  }
}

// User interaction sequence diagram:
//
// Scenario 1: User clicks // 0ms User clicks button // 1ms button.doubleClick = true
// 2ms setTimeout
// Triggered after 300ms timeout, button.doubleClick is still true
// 301ms Execute click action: Copy title // 302ms Display "Title copied"
//
// Scenario 2: User double-clicks // 0ms First click by the user // 1ms button.doubleClick = true
// 2ms setting setTimeout
// 150ms User's second click (double-click!)
// 151ms Detected button.doubleClick === true
// 152ms Execute double-click action: copy all content // 153ms Display "All content copied"
// Triggered after a 300ms timeout, but button.doubleClick is already false, so it doesn't execute.

**Conflict prevention mechanisms:**

```javascript
// Special handling for double-clicking the button: toolbarController.prototype.doubleClick = function(button) {
  // This method is called when the button is bound // Used to set the double-click flag button.doubleClick = true;
}

// Bind button in setColorButtonLayout: button.addTargetActionForControlEvents(this, "doubleClick:", 1 << 1);
// 1 << 1 = 2 = UIControlEventTouchDownRepeat (repeated touch event)

// Why use two separate event listeners?
// 1. TouchUpInside (1 << 6) is used for normal click processing. // 2. TouchDownRepeat (1 << 1) is used for detecting rapid, continuous clicks. // This distinguishes between "slow clicks" and "rapid double clicks".
```

**Tips for troubleshooting double-click issues:**

```javascript
// Add logging to track double-click status if ("doubleClick" in des) {
  MNUtil.log(`Double-click detection - Current status: ${button.doubleClick ? "Second time" : "First time"}`);

  if (button.doubleClick) {
    MNUtil.log("Executed double-click action");
  } else {
    MNUtil.log("Starting to wait for the second click...");
    setTimeout(() => {
      MNUtil.log(`Timeout check - Status: ${button.doubleClick ? "Single" : "Double-clicked"}`);
    }, 300);
  }
}
```

### 1.3 Menu System Principles Explained > **Beginner's Tip:** A menu is like a restaurant menu, listing all available options. Clicking on an item is like ordering food; the system will perform the corresponding action.

#### 1.3.1 Detailed Explanation of Menu Data Structure **JSON Basics:**

```javascript
// JSON (JavaScript Object Notation) is a data format // Curly braces {} represent objects, and square brackets [] represent arrays // Object example:
{
  "key": "value",
  Number: 123
  Boolean: true,
  "array": [1, 2, 3],
  "Nested object": {
    "Subkey": "Subvalue"
  }
}

// Array example:
[
  "Project 1",
  Project 2
  {"object item": "value"}
]
```

**Complete structure of menu configuration:**

```javascript
{
  action: "menu", // Required: Indicates this is a menu type action menuWidth: 200, // Optional: Menu width (pixels), default 200
  menuHeight: 300, // Optional: Maximum height; scrolls if exceeded autoClose: true, // Optional: Whether to close automatically after clicking menuItems: [ // Required: Array of menu items // Type 1: Plain text group titles (not clickable)
    "⬇️ Basic Operations",

    // Type 2: Simple Menu Items {
      action: "copy", // Action to perform when clicked menuTitle: "Copy" // Text to display (4 spaces indented)
    },

    // Type 3: Menu items with parameters {
      action: "setColor",
      menuTitle: "Set Color",
      color: 3, // Additional parameter target: "title" // Additional parameter},

    // Type 4: Submenus (can be nested infinitely)
    {
      action: "menu", // Indicates this is still a menu. menuTitle: "More Options➡️",
      menuWidth: 250, // Submenus can have different widths menuItems: [ // Submenu items {
          action: "advanced1",
          menuTitle: "Advanced Options 1"
        },
        {
          action: "advanced2",
          menuTitle: "Advanced Options 2"
        }
      ]
    },

    // Type 5: Separator (Visual Grouping)
    "━━━━━━━━━━",

    // Type 6: Menu items with icons {
      action: "delete",
      menuTitle: "🗑️ Delete", // Can include emoji
      confirmMessage: "Are you sure you want to delete?" // Confirmation for a dangerous operation.
  ]
}
```

**Methods for representing hierarchical relationships:**

```javascript
// Use indentation (spaces) to indicate hierarchical relationships in menuItems: [
  "📁 File Operations", // Top-level group {menuTitle: "New"}, // 4 spaces = First level {menuTitle: "Open"},
  {menuTitle: "Save"},

  "📝 Editing Operations", // Another group {menuTitle: "Cut"},
  {menuTitle: "Copy"},
  {menuTitle: "Paste"},
  {
    menuTitle: "Search ➡️",
    action: "menu",
    menuItems: [
      {menuTitle: "Find Text"}, // Submenus do not need extra indentation {menuTitle: "Find and Replace"},
      {menuTitle: "Find Next"}
    ]
  }
]
```

**Practical Example: Card Making Menu**

```javascript
// The actual menu in xdyy_menu_registry.js: global.registerMenuTemplate("menu_makeCards", {
  action: "makeCardsDefault", // Default action (when the button is clicked directly)
  onLongPress: { // Menu displayed when long-pressed action: "menu",
    menuWidth: 330,
    menuItems: [
      // Group 1: Quick Actions "⚡ Quick Actions",
      {
        action: "quickMakeCards",
        menuTitle: "One-Click Card Creation"
      },
      {
        action: "makeCardsWithReview",
        menuTitle: "Create flashcards and add them to review"
      },

      // Group 2: Card Type "📚 Card Type",
      {
        action: "makeDefinitionCard",
        menuTitle: "Creating a Definition Card"
      },
      {
        action: "makeQuestionCard",
        menuTitle: "Creating Question Cards"
      },
      {
        action: "makeFormulaCard",
        menuTitle: "Creating Formula Cards"
      },

      // Group 3: Advanced Options (Submenu)
      "⚙️ Advanced Options",
      {
        action: "menu",
        menuTitle: "Batch Operations➡️",
        menuWidth: 280,
        menuItems: [
          {
            action: "batchMakeCards",
            menuTitle: "Bulk Card Production"
          },
          {
            action: "batchRenameCards",
            menuTitle: "Batch Rename"
          },
          {
            action: "batchSetColor",
            menuTitle: "Batch Set Colors"
          }
        ]
      },
      {
        action: "makeCardsSettings",
        menuTitle: "Card Making Settings..."
      }
    ]
  }
})
```

#### 1.3.2 Detailed Explanation of Menu Display Process **The complete process of menu rendering:**

```
Button clicked/long press ↓
Check action === "menu"
    ↓
Parsing the menuItems array ↓
Convert to iOS menu format ↓
Create PopoverController
    ↓
Displayed next to the button```

**Detailed code implementation:**

```javascript
// webviewController.js - customActionByMenu method (lines 296-331)
customActionByMenu: async function (param) {
  let des = param.des; // Menu item configuration let button = param.button; // Button to trigger the menu // Check if it's a submenu if (des.action === "menu") {
    // ===== Show Submenu =====
    self.onClick = true;
    self.checkPopover(); // Close the previous menu // Check if automatic closing is needed if (("autoClose" in des) && des.autoClose) {
      self.hideAfterDelay(0.1);
    }

    let menuItems = des.menuItems;
    let width = des.menuWidth ?? 200; // Default width 200

    if (menuItems.length) {
      // 1. Convert menu items to the format required by iOS var commandTable = menuItems.map(item => {
        // Determine the title to display let title = (typeof item === "string")
          ? item // Use directly as a plain string: (item.menuTitle ?? item.action); // Get the menuTitle or action from the object

        // Return to iOS menu item format return {
          title: title, // Display text object: self, // Processing object selector: 'customActionByMenu:', // Processing method param: {des: item, button: button} // Passed parameters};
      });

      // 2. Add a back button (multi-level menu navigation)
      commandTable.unshift({
        title: toolbarUtils.emojiNumber(self.commandTables.length) + " 🔙",
        object: self,
        selector: 'lastPopover:',
        param: button
      });

      // 3. Save the menu stack (for going back)
      self.commandTables.push(commandTable);

      // 4. Create and display the menu self.popoverController = MNUtil.getPopoverAndPresent(
        button, // Anchor point (next to which the menu appears)
        commandTable, // Menu data width, // Menu width 4 // Arrow direction (4 = Auto selection)
      );
    }
    return;
  }

  // ===== Not a submenu, execute specific actions =====
  if (!("autoClose" in des) || des.autoClose) {
    self.checkPopover(); // Close the menu self.hideAfterDelay(0.1); // Delay hiding the toolbar } else {
    self.checkPopover(); // Only close the menu, keep the toolbar open.

  // Clear the menu stack self.commandTables = [];

  // Execute the action self.customActionByDes(button, des);
}
```

**Detailed Explanation of the map Function:**

```javascript
// map is an array transformation function that converts each element into a new form. // Original array let menuItems = [
  "Group Title",
  {action: "copy", menuTitle: "Copy"},
  {action: "paste", menuTitle: "Paste"}
];

// map transformation process let commandTable = menuItems.map(function(item) {
  // The items are as follows:
  // First time: "Group title"
  // Second time: {action: "copy", menuTitle: "Copy"}
  // 3rd time: {action: "paste", menuTitle: "Paste"}

  // Return to new format return {
    title: item.menuTitle || item,
    // ... other attributes};
});

// Result commandTable = [
  {title: "Group Title", ...},
  {title: "Copy", ...},
  {title: "Paste", ...}
];
```

**PopoverController Explained:**

```javascript
// PopoverController is an iOS pop-up menu control // It looks like a bubble with an arrow pointing to the button that triggered it. MNUtil.getPopoverAndPresent = function(anchor, items, width, arrow) {
  // anchor: Anchor point view (button)
  // items: Array of menu items // width: Menu width // arrow: Arrow direction // 1 = Upward (↑)
  // 2 = Downward ↓
  // 3 = Left ←
  // 4 = Right →
  // 0 = Auto-select // Create menu controller let menuController = MenuController.new();
  menuController.commandTable = items;
  menuController.rowHeight = 35; // Height of each row // Set size menuController.preferredContentSize = {
    width: width,
    height: menuController.rowHeight * items.length
  };

  // Create a popover controller let popover = new UIPopoverController(menuController);

  // Calculate the display position let rect = anchor.convertRectToView(anchor.bounds, studyView);

  // Display menu popover.presentPopoverFromRect(
    rect, // position; studyView, // parent view; arrow, // arrow direction; true // animation);

  return popover;
};
```

#### 1.3.3 Detailed Explanation of Menu Item Click Processing **Complete Click Processing Flow:**

```javascript
// When the user clicks a menu item, customActionByMenu: function(param) {
  // param contains:
  // {
  // des: {action: "copy", menuTitle: "Copy"},
  // button: UIButton object // }

  let des = param.des;
  let button = param.button;

  // Type check if (typeof des === "string") {
    // Plain string = group title, do not perform any operation return;
  }

  if (des.action === "menu") {
    // This is a submenu, showing the next level: this.showSubMenu(des);
  } else {
    // This is the specific action, executed by this.customActionByDes(button, des);

    // Post-execution processing this.closeMenu(); // Close the menu this.updateUI(); // Update the UI this.saveState(); // Save the state}
}
```

**Menu Stack Management (Multi-level Menu Navigation):**

```javascript
// commandTables is an array of arrays used to manage menu hierarchy self.commandTables = [
  [/* First-level menu item*/],
  [/* Second-level menu item */],
  /* Third-level menu item */
];

// Return to the previous menu lastPopover: function(button) {
  self.checkPopover(); // Close the current menu self.commandTables.pop(); // Remove the current menu let commandTable = self.commandTables.at(-1); // Get the parent menu // Re-show the parent menu self.popoverController = MNUtil.getPopoverAndPresent(
    button,
    commandTable,
    200,
    4
  );
}

// emojiNumber function: Displays the hierarchy of emojis.toolbarUtils.emojiNumber = function(n) {
  const emojis = ["0️⃣","1️⃣","2️⃣","3️⃣","4️⃣","5️⃣","6️⃣","7️⃣","8️⃣","9️⃣"];
  return emojis[n] || "🔢";
}
// For example: the back button in the 3rd level menu displays "2️⃣ 🔙"
```

**Practical Example: Complete Menu Interaction**

```javascript
// User operation process:
// 1. Press and hold the "Make Card" button // 2. Display the first-level menu:
// ⚡ Quick Operation // One-Click Card Production // Batch Operation ➡️
// 3. Click "Batch Operations ➡️"
// 4. Display the second-level menu:
// 1️⃣ 🔙
// Batch Card Production // Batch Renaming // 5. Click "Batch Card Production"
// 6. Execute the batchMakeCards action // 7. Close the menu // Code execution order:
onLongPressGesture(gesture)
  ↓
customActionByDes(button, des.onLongPress)
  ↓ (des.action === "menu")
The primary menu is displayed ↓ The user clicks "Batch Operations"
customActionByMenu({des: submenu configuration, button})
  ↓ (des.action === "menu")
A secondary menu is displayed ↓ The user clicks "Batch Card Production"
customActionByMenu({des: {action:"batchMakeCards"}, button})
  ↓ (des.action !== "menu")
customActionByDes(button, des)
  ↓
Perform batch card production function.

### 1.4 In-depth analysis of action processing flow > **Beginner's tip:** Action processing is like a package sorting center. Each package (user action) has a destination (the function to be performed), and the system sends the package to the correct processing point based on the address label (action name).

#### 1.4.1 The Complete Processing Chain: The Complete Journey from User Operation to Function Execution:

```
User touches button ↓
iOS system recognizes gesture types: ├─ Tap (TouchUpInside)
   ├─ Long press (LongPress > 0.3s)
   Double-click (two clicks < 0.3s)
   ↓
Trigger the corresponding processing method ├─ customAction(button)
   ├─ onLongPressGesture(gesture)
   └─ doubleClick(button)
   ↓
Get button configuration information ├─ button.target (directly specify)
   └─ toolbarConfig.action[index] (location index)
   ↓
Find the complete feature description using `toolbarConfig.getDescriptionById(actionName)`.
   ↓
Parsing the description object: ├─ action: Action type ├─ Parameters: target, content, color, etc. └─ Special: doubleClick, onLongPress
   ↓
Execute customActionByDes
   ↓
Dispatch based on action type: Built-in actions → switch-case handling → Custom actions → global.executeCustomAction
   ↓
Execute the specific function code ↓
Feedback results to the user

#### 1.4.2 Detailed Explanation of the Configuration Lookup Mechanism **How ​​getDescriptionById Works:**

```javascript
// utils.js - getDescriptionById method (lines 7261-7287)
static getDescriptionById(actionKey) {
  let desObject = {};

  // 1. Attempt to retrieve the action key from the actions configuration if (actionKey in this.actions) {
    // this.actions is the user-saved configuration. let action = this.actions[actionKey];

    // 2. Parse the description
    if (action.description) {
      if (typeof action.description === "string") {
        // String format, attempting to parse into JSON
        if (MNUtil.isValidJSON(action.description)) {
          desObject = JSON.parse(action.description);
        }
      } else {
        // It's already an object, so just use desObject = action.description;
      }
    }
  }

  // 3. If not found, use the default configuration if (Object.keys(desObject).length === 0) {
    // 从getActions() 获取默认配置let defaultActions = this.getActions();
    if (actionKey in defaultActions) {
      let defaultAction = defaultActions[actionKey];

      // 特殊处理某些按钮的默认行为switch (actionKey) {
        case "bigbang":
          desObject.action = "bigbang";
          break
        case "switchTitleorExcerpt":
          desObject.action = "switchTitleOrExcerpt";
          break
        case "clearFormat":
          desObject.action = "clearFormat";
          break
        case "copy":
          desObject.action = "copy";
          break
        // ... 更多默认配置}
    }
  }

  return desObject;
}
```

**配置优先级：**

```javascript
// 优先级从高到低：
// 1. 用户自定义配置(toolbarConfig.actions)
// 2. 按钮默认配置(getActions() 返回的)
// 3. 硬编码默认值(switch-case 中的)

// 示例：查找"copy" 按钮的配置let des = toolbarConfig.getDescriptionById("copy");

// 查找顺序：
// 1. 检查toolbarConfig.actions["copy"]
// 如果存在且有description，使用它// 2. 如果没有，检查getActions()["copy"]
// 获取默认的description
// 3. 如果还没有，使用硬编码默认值// {action: "copy"}
```

#### 1.4.3 核心处理函数完整实现```javascript
// utils.js - customActionByDes 方法（第5379-5963行精简版）
static async customActionByDes(des, button, controller, fromOtherPlugin = false) {
  try {
    // 1. 获取当前环境let focusNote = fromOtherPlugin
      ? des.focusNote
      : MNNote.getFocusNote();
    let notebookid = focusNote
      ? focusNote.notebookId
      : MNUtil.currentNotebookId;

    // 2. 准备通用变量let success = true;
    let title, content, color, config;
    let targetNoteId;

    // 3. 记录日志（调试用）
    MNUtil.log(`执行动作: ${des.action}`);

    // 4. 根据action 类型执行不同操作switch (des.action) {
      // ===== 文本操作类=====
      case "copy":
        if (des.target || des.content) {
          // 有指定复制内容success = await this.copy(des);
        } else {
          // 智能复制（自动判断复制什么）
          success = this.smartCopy();
        }
        break

      case "paste":
        this.paste(des);
        await MNUtil.delay(0.1);
        break

      // ===== 卡片操作类=====
      case "switchTitleOrExcerpt":
        // 交换标题和摘录this.switchTitleOrExcerpt();
        await MNUtil.delay(0.1);
        break

      case "clearFormat":
        // 清除格式let focusNotes = MNNote.getFocusNotes();
        MNUtil.undoGrouping(() => {
          focusNotes.forEach(note => {
            note.clearFormat();
          });
        });
        await MNUtil.delay(0.1);
        break

      case "setColor":
        // 设置颜色MNUtil.undoGrouping(() => {
          focusNotes.forEach(note => {
            note.colorIndex = des.color; // 0-15
          });
        });
        MNUtil.showHUD(`颜色设置为${des.color}`);
        break

      // ===== 评论操作类=====
      case "addComment":
        // 添加评论content = this.parseContent(des.content);
        MNUtil.undoGrouping(() => {
          focusNote.appendComment(content);
        });
        break

      case "removeComment":
        // 删除评论let index = des.index || -1; // -1 表示最后一个MNUtil.undoGrouping(() => {
          if (index === 0) {
            // 删除所有评论focusNote.comments = [];
          } else if (index < 0) {
            // 删除最后一个focusNote.removeCommentAtIndex(
              focusNote.comments.length - 1
            );
          } else {
            // 删除指定索引focusNote.removeCommentAtIndex(index - 1);
          }
        });
        break

      // ===== 系统功能类=====
      case "undo":
        UndoManager.sharedInstance().undo();
        MNUtil.refreshAfterDBChanged(notebookid);
        await MNUtil.delay(0.1);
        break

      case "redo":
        UndoManager.sharedInstance().redo();
        MNUtil.refreshAfterDBChanged(notebookid);
        await MNUtil.delay(0.1);
        break

      case "openSetting":
        MNUtil.postNotification("openToolbarSetting", {});
        await MNUtil.delay(0.1);
        break

      // ===== 菜单类=====
      case "menu":
        // 显示菜单（见菜单系统章节）
        controller.customActionByMenu({
          des: des,
          button: button
        });
        break

      // ===== 扩展动作=====
      default:
        // 检查是否是自定义动作if (typeof global !== 'undefined' && global.executeCustomAction) {
          const context = {
            button: button,
            des: des,
            focusNote: focusNote,
            focusNotes: MNNote.getFocusNotes(),
            self: controller
          };

          // 尝试执行自定义动作const handled = await global.executeCustomAction(des.action, context);

          if (handled) {
            // 自定义动作已处理break;
          }
        }

        // 未知动作MNUtil.showHUD("Not supported yet: " + des.action);
        break
    }

    // 5. 后续处理while ("onFinish" in des) {
      // 链式动作：执行完后还有后续动作des = des.onFinish;
      let delay = des.delay ?? 0.1;
      await MNUtil.delay(delay);

      // 递归执行后续动作await this.customActionByDes(des, button, controller, false);
    }

    return success;

  } catch (error) {
    // 错误处理toolbarUtils.addErrorLog(error, "customActionByDes");
    MNUtil.showHUD(`错误: ${error.message}`);
    return false;
  }
}
```

#### 1.4.4 内容解析机制**parseContent 函数：解析动态内容**

```javascript
// 将模板字符串转换为实际内容parseContent: function(template) {
  if (!template) return "";

  let result = template;

  // 替换剪贴板内容result = result.replace(/\{\{clipboardText\}\}/g,
    MNUtil.clipboardText || "");

  // 替换当前时间result = result.replace(/\{\{currentTime\}\}/g,
    new Date().toLocaleString());

  // 替换卡片信息let focusNote = MNNote.getFocusNote();
  if (focusNote) {
    result = result.replace(/\{\{note\.title\}\}/g,
      focusNote.noteTitle || "");
    result = result.replace(/\{\{note\.excerpt\}\}/g,
      focusNote.excerptText || "");
    result = result.replace(/\{\{note\.url\}\}/g,
      focusNote.noteURL || "");
  }

  return result;
}

// 使用示例：
des = {
  action: "addComment",
  content: "摘录自: {{note.title}}\n时间: {{currentTime}}"
}
// 解析后：
// "摘录自: 第一章基础概念\n时间: 2024/1/20 15:30:00"
```

#### 1.4.5 撤销组的重要性```javascript
// MNUtil.undoGrouping 的作用MNUtil.undoGrouping(() => {
  // 这里的所有操作会作为一个整体// 用户按一次撤销就能撤销所有操作note1.noteTitle = "新标题1";
  note2.noteTitle = "新标题2";
  note3.colorIndex = 5;
  note4.appendComment("评论");
});

// 没有使用undoGrouping 的问题：
note1.noteTitle = "新标题1"; // 撤销1次note2.noteTitle = "新标题2"; // 撤销2次note3.colorIndex = 5; // 撤销3次note4.appendComment("评论"); // 撤销4次// 用户需要撤销4次才能恢复原状！

// 使用undoGrouping 的好处：
// 用户只需撤销1次就能恢复所有更改```

---

## 第二部分："补丁"架构设计### 2.1 为什么需要补丁架构#### 2.1.1 传统方式的问题在官方版本中添加功能需要直接修改核心文件：

```javascript
// ❌ 传统方式- 直接修改utils.js
toolbarConfig.actions = {
  "action1": {...},
  "action2": {...},
  "myAction": {...} // 添加自定义动作- 污染原始代码};

// ❌ 传统方式- 修改switch-case
switch(action) {
  case "copy": ...
  case "myAction": // 添加case - 难以维护// 我的处理逻辑break;
}
```

question:
- **版本升级困难**：官方更新后需要重新修改- **代码冲突**：多人开发容易产生冲突- **维护困难**：自定义代码和官方代码混杂- **调试困难**：难以区分问题来源#### 2.1.2 补丁架构的优势```javascript
// ✅ 补丁方式- 独立文件扩展// xdyy_custom_actions_registry.js
global.registerCustomAction("myAction", async function(context) {
  // 我的处理逻辑- 完全独立});
```

优势：
- **零侵入**：不修改任何官方文件- **易升级**：官方更新不影响自定义功能- **模块化**：功能独立，易于管理- **可插拔**：随时启用/禁用功能### 2.2 注册表模式设计#### 2.2.1 核心思想使用全局注册表存储自定义配置，主程序通过标准接口访问：

```javascript
// 注册表结构global = {
  customButtons: { // 按钮注册表"button1": {...},
    "button2": {...}
  },
  customMenuTemplates: { // 菜单注册表"menu1": {...},
    "menu2": {...}
  },
  customActions: { // 动作注册表"action1": function() {...},
    "action2": function() {...}
  }
}
```

#### 2.2.2 注册机制```javascript
// 注册接口- 简单直观global.registerButton("myButton", {
  name: "我的按钮",
  image: "myicon",
  templateName: "myMenu"
});

global.registerMenuTemplate("myMenu", {
  action: "myAction"
});

global.registerCustomAction("myAction", async function(context) {
  // 处理逻辑});
```

#### 2.2.3 查找机制```javascript
// 主程序查找自定义内容if (global.customActions[actionName]) {
  // 执行自定义动作global.executeCustomAction(actionName, context);
} else {
  // 执行内置动作this.executeBuiltinAction(actionName);
}
```

### 2.3 四层架构解析#### 2.3.1 架构分层```
┌──────────────────────────────────────┐
│ Layer 1: 按钮配置层│
│ xdyy_button_registry.js │
│ - 定义按钮外观和关联│
└──────────────┬───────────────────────┘
               │
┌──────────────▼───────────────────────┐
│ Layer 2: 菜单模板层│
│ xdyy_menu_registry.js │
│ - 定义菜单结构和层级│
└──────────────┬───────────────────────┘
               │
┌──────────────▼───────────────────────┐
│ Layer 3: 动作处理层│
│ xdyy_custom_actions_registry.js │
│ - 实现具体功能逻辑│
└──────────────┬───────────────────────┘
               │
┌──────────────▼───────────────────────┐
│ Layer 4: 工具扩展层│
│ xdyy_utils_extensions.js │
│ - 扩展工具函数和配置│
└──────────────────────────────────────┘
```

#### 2.3.2 各层职责**Layer 1 - 按钮配置层**：
```javascript
// 职责：定义按钮的视觉和行为global.registerButton("custom15", {
  name: "制卡", // 显示名称image: "makeCards", // 图标文件templateName: "menu_makeCards" // 关联的菜单模板});
```

**Layer 2 - 菜单模板层**：
```javascript
// 职责：定义交互结构global.registerMenuTemplate("menu_makeCards", {
  action: "makeCards", // 默认动作onLongPress: { // 长按菜单action: "menu",
    menuItems: [
      {action: "quickMake", menuTitle: "快速制卡"},
      {action: "batchMake", menuTitle: "批量制卡"}
    ]
  }
});
```

**Layer 3 - 动作处理层**：
```javascript
// 职责：实现业务逻辑global.registerCustomAction("makeCards", async function(context) {
  const {focusNote, focusNotes} = context;

  MNUtil.undoGrouping(() => {
    // 具体的制卡逻辑focusNotes.forEach(note => {
      // 处理每个卡片});
  });
});
```

**Layer 4 - 工具扩展层**：
```javascript
// 职责：提供通用能力toolbarUtils.makeCard = function(note, options) {
  // 通用的制卡函数// 可被多个动作复用};
```

### 2.4 解耦的实现细节#### 2.4.1 加载顺序控制```javascript
// main.js - 精确的加载顺序JSB.newAddon = function(mainPath) {
  // 1. 加载核心模块JSB.require('utils');

  // 2. 加载工具扩展（可能被其他模块依赖）
  JSB.require('xdyy_utils_extensions');

  // 3. 其他初始化...
  JSB.require('webviewController');
  JSB.require('settingController');

  // 4. 加载自定义模块（在核心模块之后）
  JSB.require('xdyy_menu_registry');
  JSB.require('xdyy_button_registry');
  JSB.require('xdyy_custom_actions_registry');
}
```

#### 2.4.2 接口注入点在主程序中只需要一个注入点：

```javascript
// utils.js - 唯一的修改点customActionByDes: async function(des, button, controller) {
  switch(des.action) {
    // ... 内置动作处理...

    default:
      // 注入点- 检查自定义动作if (typeof global !== 'undefined' && global.executeCustomAction) {
        const context = {button, des, focusNote, focusNotes, self: controller};
        const handled = await global.executeCustomAction(des.action, context);
        if (handled) break;
      }
      MNUtil.showHUD("Not supported yet...");
  }
}
```

#### 2.4.3 配置融合机制（核心原理）

自定义按钮与官方按钮的融合是通过**重写`getActions` 方法**实现的。这是整个补丁架构的核心，让我详细解释：

**步骤1：保存原始方法**
```javascript
// xdyy_button_registry.js
// 首先保存官方的getActions 方法，避免丢失原始逻辑if (!toolbarConfig._originalGetActions) {
  toolbarConfig._originalGetActions = toolbarConfig.getActions;
}
```

**步骤2：重写getActions 方法**
```javascript
// 重写getActions，这个方法会被setToolbarButton 调用toolbarConfig.getActions = function() {
  // 1. 调用原始方法，获取官方定义的所有按钮// 官方的getActions 返回包含所有内置按钮的对象const defaultActions = toolbarConfig._originalGetActions
    ? toolbarConfig._originalGetActions.call(this)
    : {};

  // defaultActions 现在包含：
  // {
  // "copy": {name:"Copy", image:"copy", description:{...}},
  // "timer": {name:"Timer", image:"timer", description:{...}},
  // "custom1": {name:"Custom 1", image:"custom1", description:{...}},
  // "custom2": {name:"Custom 2", image:"custom2", description:{...}},
  // ... // 所有官方按钮// }

  // 2. 如果没有自定义按钮，直接返回官方按钮if (Object.keys(global.customButtons).length === 0) {
    return defaultActions;
  }

  // 3. 创建新的按钮集合对象const allActions = {};

  // 4. 【关键】先添加所有自定义按钮// 这会覆盖同名的官方custom 按钮for (const key in global.customButtons) {
    const button = Object.assign({}, global.customButtons[key]);

    // 5. 处理templateName -> description 的转换// templateName 是菜单模板名称，需要转换为实际的description 对象if (button.templateName && !button.description && toolbarConfig.template) {
      // 调用template 方法获取菜单配置button.description = toolbarConfig.template(button.templateName);
    }

    // 6. 清理临时属性delete button.templateName;

    // 7. 添加到最终集合（会覆盖同名官方按钮）
    allActions[key] = button;
  }

  // 8. 添加非custom 的官方按钮（保留官方的核心功能按钮）
  for (const key in defaultActions) {
    // 只添加：
    // - 不是custom 开头的按钮（如copy, timer, undo 等）
    // - 且没有被自定义按钮覆盖的if (!key.startsWith('custom') && !(key in allActions)) {
      allActions[key] = defaultActions[key];
    }
  }

  return allActions;
  // 最终返回的allActions 包含：
  // - 所有自定义的custom 按钮（覆盖了官方的）
  // - 所有官方的非custom 按钮（如copy, timer 等）
};
```

**步骤3：调用链分析**

```
用户打开工具栏↓
webviewController.viewDidLoad()
    ↓
this.setToolbarButton(toolbarConfig.action)
    ↓
let actions = toolbarConfig.actions // getter 触发↓
toolbarConfig.getActions() // 调用重写的方法↓
返回融合后的按钮配置↓
创建实际的UIButton 实例```

**完整流程图：**

```
┌─────────────────────────────────────────────────┐
│ 官方utils.js 中的getActions() │
│ 返回所有官方按钮包括custom1-19 │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼ 被保存为_originalGetActions
┌─────────────────────────────────────────────────┐
│ xdyy_button_registry.js 重写getActions() │
│ 1. 调用_originalGetActions 获取官方按钮│
│ 2. 用自定义按钮覆盖custom 按钮│
│ 3. 保留官方的功能按钮（copy, timer 等） │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼ 返回融合后的配置┌─────────────────────────────────────────────────┐
│ webviewController.js 使用按钮│
│ 根据返回的配置创建实际的按钮UI │
└─────────────────────────────────────────────────┘
```

**为什么这样设计？**

1. **无侵入性**：不修改官方的`getActions` 实现，只是包装它2. **向后兼容**：如果官方更新了按钮，自动继承新功能3. **灵活性**：可以选择性覆盖，不影响官方核心功能4. **可恢复**：通过`_originalGetActions` 可以随时恢复原始行为---

## 初学者必读：从零开始的完整开发流程> **小白提示**：如果你从未接触过编程，请先按照本章节一步步操作，成功运行第一个功能后，再阅读其他章节的原理解释。

### 开发前的心理准备1. **不要害怕报错**：报错是正常的，它们是在告诉你哪里需要修正2. **从模仿开始**：先复制现有代码，运行成功后再尝试修改3. **小步快跑**：每次只改一点点，确认没问题后再继续4. **保持备份**：修改前先备份原文件，出错了可以恢复### Step 0：理解文件结构（用房子做比喻）

```
mntoolbar/（这是你的房子）
├── main.js # 大门：插件的入口├── utils.js # 工具箱：各种工具函数├── webviewController.js # 客厅：用户看到和操作的界面├── settingController.js # 书房：设置界面│
├── xdyy_button_registry.js # 装饰品清单：定义有哪些按钮├── xdyy_menu_registry.js # 菜谱：定义菜单内容├── xdyy_custom_actions_registry.js # 说明书：定义每个按钮做什么└── xdyy_utils_extensions.js # 工具箱扩展：额外的工具```

### Step 1：准备开发环境#### 1.1 找到插件文件夹**macOS 路径**：
```
/Users/你的用户名/Library/Containers/QReader.MarginStudyMac/Data/Library/MarginNote Extensions/
```

**iOS/iPadOS 路径**：
```
在"文件"App中：我的iPad > MarginNote 3 > Extensions
```

#### 1.2 创建测试文件在mntoolbar 文件夹中创建`test_hello.js`：

```javascript
// test_hello.js - 你的第一个测试文件// 这个文件用来测试你的代码是否正确// 定义一个简单的测试函数function testHello() {
  // MNUtil.showHUD 会在屏幕上显示一个提示框MNUtil.showHUD("Hello, MN Toolbar!");

  // MNUtil.log 会在控制台输出日志（用于调试）
  MNUtil.log("测试成功执行");
}

// 执行测试testHello();
```

### Step 2：创建你的第一个按钮#### 2.1 理解三要素创建一个按钮需要三个要素，就像点菜：
1. **菜单上要有这道菜**（按钮注册）
2. **要知道这道菜怎么做**（菜谱/模板）
3. **厨师要会做这道菜**（动作实现）

#### 2.2 实战：添加"添加时间戳"按钮**文件1：xdyy_button_registry.js**（添加到registerAllButtons 函数末尾）

```javascript
// 在registerAllButtons() 函数的末尾，custom19 之前添加：
// 注意：custom15 到custom19 可能已经被占用，检查后使用空闲的// 如果custom15 未被使用：
global.registerButton("custom15", {
  name: "时间戳", // 按钮显示的文字image: "custom15", // 使用custom15.png 作为图标templateName: "menu_timestamp" // 关联的菜单模板名称});
```

**文件2：xdyy_menu_registry.js**（在文件末尾添加）

```javascript
// 简单版本：点击直接执行global.registerMenuTemplate("menu_timestamp", {
  action: "addTimestamp" // 点击按钮时执行的动作名称});

// 或者高级版本：带菜单global.registerMenuTemplate("menu_timestamp", {
  action: "addTimestamp", // 默认点击动作onLongPress: { // 长按显示菜单action: "menu",
    menuWidth: 200,
    menuItems: [
      {
        action: "addTimestamp",
        menuTitle: "Add to Title"
      },
      {
        action: "addTimestampComment",
        menuTitle: "Add as Comment"
      }
    ]
  }
});
```

**文件3：xdyy_custom_actions_registry.js**（在文件末尾添加）

```javascript
// 注册主动作：添加时间戳到标题global.registerCustomAction("addTimestamp", async function(context) {
  // context 包含了所有需要的信息const {focusNote} = context; // 获取当前选中的卡片// 检查是否有选中的卡片if (!focusNote) {
    MNUtil.showHUD("❌ 请先选择一个卡片");
    return;
  }

  // 使用撤销分组，这样用户可以撤销这个操作MNUtil.undoGrouping(() => {
    // 获取当前时间const now = new Date();
    const timestamp = now.toLocaleString('zh-CN');

    // 修改卡片标题if (focusNote.noteTitle) {
      // 如果已有标题，在后面添加时间戳focusNote.noteTitle = focusNote.noteTitle + " [" + timestamp + "]";
    } else {
      // 如果没有标题，直接设置为时间戳focusNote.noteTitle = timestamp;
    }

    // 显示成功提示MNUtil.showHUD("✅ 时间戳已添加");
  });
});

// 注册附加动作：添加时间戳为评论global.registerCustomAction("addTimestampComment", async function(context) {
  const {focusNote} = context;

  if (!focusNote) {
    MNUtil.showHUD("❌ 请先选择一个卡片");
    return;
  }

  MNUtil.undoGrouping(() => {
    const timestamp = new Date().toLocaleString('zh-CN');

    // 添加评论focusNote.appendComment("📅 " + timestamp);

    MNUtil.showHUD("✅ Timestamp has been added as a comment");
  });
});
```

### Step 3：测试你的按钮1. **重启MarginNote**（完全退出再打开）
2. **打开工具栏设置**，找到你的新按钮（时间戳）
3. **将按钮添加到工具栏**
4. **选择一个卡片**，点击按钮测试### 常见错误及解决方法#### 错误1：按钮不显示**症状**：在设置中看不到新按钮**检查清单**：
```javascript
// 1. 检查按钮是否注册成功// 在xdyy_button_registry.js 的registerAllButtons 末尾添加：
MNUtil.log("按钮注册完成，共注册: " + Object.keys(global.customButtons).length + " 个按钮");

// 2. 检查文件是否被加载// 在每个xdyy_*.js 文件开头添加：
MNUtil.log("✅ 正在加载: [文件名]");
```

#### 错误2：点击按钮没反应**症状**：按钮显示了，但点击后什么都不发生**调试方法**：
```javascript
// 在customAction 函数开头添加日志global.registerCustomAction("myAction", async function(context) {
  MNUtil.log("🚀 动作被触发: myAction"); // 添加这行MNUtil.showHUD("动作开始执行"); // 添加这行// 原有代码...
});
```

#### 错误3：功能执行了但报错**症状**：出现错误提示或功能不完整**调试模板**：
```javascript
global.registerCustomAction("safeAction", async function(context) {
  try {
    MNUtil.log("开始执行safeAction");

    // 检查必需的对象if (!context) {
      MNUtil.log("❌ context 为空");
      return;
    }

    const {focusNote} = context;
    if (!focusNote) {
      MNUtil.log("❌ 没有选中的卡片");
      MNUtil.showHUD("请先选择卡片");
      return;
    }

    MNUtil.log("✅ 找到卡片: " + focusNote.noteId);

    // 执行实际操作MNUtil.undoGrouping(() => {
      // 你的代码});

    MNUtil.log("✅ Execution successful");

  } catch (error) {
    // 捕获并显示错误MNUtil.log("❌ 错误: " + error);
    MNUtil.showHUD("Error: " + error.message);
  }
});
```

### 实用调试技巧#### 技巧1：使用日志定位问题```javascript
// 在代码的关键位置添加日志MNUtil.log("=== 步骤1 ===");
// 一些代码MNUtil.log("=== 步骤2 ===");
// 更多代码MNUtil.log("=== 步骤3 ===");

// 如果日志只显示到步骤2，说明问题在步骤2 和3 之间```

#### 技巧2：检查对象内容```javascript
// 将对象复制到剪贴板，然后粘贴到文本编辑器查看MNUtil.copyJSON(focusNote);
MNUtil.showHUD("对象已复制，请粘贴查看");
```

#### 技巧3：逐步简化```javascript
// 先从最简单的功能开始global.registerCustomAction("test", async function(context) {
  // 第一步：只显示提示MNUtil.showHUD("测试");

  // 成功后，添加第二步// const {focusNote} = context;
  // MNUtil.showHUD("卡片ID: " + focusNote.noteId);

  // 再添加第三步...
});
```

### 从模仿到创新：学习路径#### 第一阶段：模仿（第1-7天）
1. 复制现有按钮的代码2. 只改变提示文字3. 运行并观察效果#### 第二阶段：修改（第8-14天）
1. 修改现有功能的部分逻辑2. 组合两个功能3. 添加新的参数#### 第三阶段：创造（第15天后）
1. 设计自己的功能2. 实现复杂的业务逻辑3. 优化用户体验### 实际案例：批量添加标签这是一个完整的实用功能示例：

```javascript
// === Step 1: 注册按钮(xdyy_button_registry.js) ===
global.registerButton("custom16", {
  name: "批量标签",
  image: "custom16",
  templateName: "menu_batchTag"
});

// === Step 2: 定义菜单(xdyy_menu_registry.js) ===
global.registerMenuTemplate("menu_batchTag", {
  action: "menu",
  menuWidth: 200,
  menuItems: [
    "🏷️ 快速添加",
    {action: "addTag_important", menuTitle: " 📌 重要"},
    {action: "addTag_review", menuTitle: " 📖 待复习"},
    {action: "addTag_question", menuTitle: " ❓ 疑问"},

    "🎯 批量操作",
    {action: "addCustomTag", menuTitle: " 自定义标签..."},
    {action: "removeAllTags", menuTitle: " 清除所有标签"}
  ]
});

// === Step 3: 实现功能(xdyy_custom_actions_registry.js) ===

// 添加预设标签global.registerCustomAction("addTag_important", async function(context) {
  addTagToNotes(context, "重要");
});

global.registerCustomAction("addTag_review", async function(context) {
  addTagToNotes(context, "待复习");
});

global.registerCustomAction("addTag_question", async function(context) {
  addTagToNotes(context, "疑问");
});

// 通用的添加标签函数function addTagToNotes(context, tagName) {
  const {focusNotes} = context; // 注意是focusNotes（复数），获取所有选中的卡片if (!focusNotes || focusNotes.length === 0) {
    MNUtil.showHUD("❌ Please select a card first");
    return;
  }

  MNUtil.undoGrouping(() => {
    let count = 0;

    // 遍历所有选中的卡片focusNotes.forEach(note => {
      // 检查是否已有该标签if (!note.tags.includes(tagName)) {
        note.appendTags([tagName]);
        count++;
      }
    });

    if (count > 0) {
      MNUtil.showHUD(`✅ Tags #${tagName} have been added to ${count} cards`);
    } else {
      MNUtil.showHUD(`ℹ️ 所有卡片已有标签#${tagName}`);
    }
  });
}

// 自定义标签global.registerCustomAction("addCustomTag", async function(context) {
  const {focusNotes} = context;

  if (!focusNotes || focusNotes.length === 0) {
    MNUtil.showHUD("❌ Please select a card first");
    return;
  }

  // Show input fields UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
    "添加自定义标签",
    This will add labels to ${focusNotes.length} cards.
    2, // Input box style "Cancel",
    ["Add to"],
    (alert, buttonIndex) => {
      if (buttonIndex === 1) {
        const tagName = alert.textFieldAtIndex(0).text;

        if (tagName && tagName.trim()) {
          addTagToNotes(context, tagName.trim());
        } else {
          MNUtil.showHUD("❌ Tag name cannot be empty");
        }
      }
    }
  );
});

// 清除所有标签global.registerCustomAction("removeAllTags", async function(context) {
  const {focusNotes} = context;

  if (!focusNotes || focusNotes.length === 0) {
    MNUtil.showHUD("❌ Please select a card first");
    return;
  }

  // 显示确认对话框UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
    "确认清除",
    `将清除${focusNotes.length} 个卡片的所有标签，此操作可撤销`,
    0, // 默认样式"取消",
    ["清除"],
    (alert, buttonIndex) => {
      if (buttonIndex === 1) {
        MNUtil.undoGrouping(() => {
          let totalTags = 0;

          focusNotes.forEach(note => {
            totalTags += note.tags.length;
            note.tags = []; // 清空标签数组});

          MNUtil.showHUD(`✅ 已清除${totalTags} 个标签`);
        });
      }
    }
  );
});
```

### 💡 给初学者的建议1. **不要贪多**：先实现一个简单功能，完全理解后再做下一个2. **多看官方代码**：utils.js 中有很多可以学习的例子3. **善用搜索**：遇到不懂的API，在项目中搜索它的用法4. **保持耐心**：编程是一个渐进的过程，每天进步一点点5. **记录笔记**：把学到的东西记下来，下次遇到类似问题就有参考了---

## 第三部分：开发实践指南### 3.1 环境准备#### 3.1.1 目录结构```
mntoolbar/
├── main.js # 主入口（尽量不修改）
├── utils.js # 工具类（尽量不修改）
├── webviewController.js # UI控制（尽量不修改）
├── settingController.js # 设置界面（尽量不修改）
│
├── xdyy_button_registry.js # 自定义按钮配置├── xdyy_menu_registry.js # 自定义菜单模板├── xdyy_custom_actions_registry.js # 自定义动作实现├── xdyy_utils_extensions.js # 工具函数扩展│
└── 图标文件/
    ├── custom1.png
    ├── custom2.png
    └── ...
```

#### 3.1.2 开发工具- **代码编辑器**：VSCode 或其他支持JavaScript 的编辑器- **调试工具**：MarginNote 的控制台输出- **图标制作**：40x40 像素的PNG 图片### 3.2 快速上手：第一个按钮让我们创建一个简单的"添加时间戳"按钮。

#### Step 1：注册按钮（xdyy_button_registry.js）

```javascript
// 在registerAllButtons() 函数中添加global.registerButton("customTimestamp", {
  name: "timestamp"
  image: "timestamp", // 需要timestamp.png 图标文件templateName: "menu_timestamp"
});
```

#### Step 2：定义菜单（xdyy_menu_registry.js）

```javascript
// 简单版本- 直接执行global.registerMenuTemplate("menu_timestamp", {
  action: "addTimestamp"
});

// 或带菜单版本global.registerMenuTemplate("menu_timestamp", {
  action: "addTimestamp", // 默认动作onLongPress: { // 长按显示选项action: "menu",
    menuWidth: 200,
    menuItems: [
      {action: "addTimestamp", menuTitle: "添加到标题"},
      {action: "addTimestampComment", menuTitle: "添加为评论"},
      {action: "copyTimestamp", menuTitle: "复制时间戳"}
    ]
  }
});
```

#### Step 3：实现功能（xdyy_custom_actions_registry.js）

```javascript
// 注册主动作global.registerCustomAction("addTimestamp", async function(context) {
  const {focusNote} = context;

  if (!focusNote) {
    MNUtil.showHUD("❌ Please select a card first");
    return;
  }

  MNUtil.undoGrouping(() => {
    const timestamp = new Date().toLocaleString('zh-CN');

    if (focusNote.noteTitle) {
      focusNote.noteTitle = `${focusNote.noteTitle} [${timestamp}]`;
    } else {
      focusNote.noteTitle = timestamp;
    }

    MNUtil.showHUD("✅ Timestamp added");
  });
});

// 注册其他动作global.registerCustomAction("addTimestampComment", async function(context) {
  const {focusNote} = context;

  if (!focusNote) {
    MNUtil.showHUD("❌ Please select a card first");
    return;
  }

  MNUtil.undoGrouping(() => {
    const timestamp = new Date().toLocaleString('zh-CN');
    focusNote.appendComment(`时间戳: ${timestamp}`);
    MNUtil.showHUD("✅ 已添加时间戳评论");
  });
});

global.registerCustomAction("copyTimestamp", async function(context) {
  const timestamp = new Date().toLocaleString('zh-CN');
  MNUtil.copy(timestamp);
  MNUtil.showHUD(`✅ Copy: ${timestamp}`);
});
```

#### Step 4：添加到工具栏在MarginNote 的工具栏设置中，将新按钮添加到工具栏即可。

### 3.3 进阶：多级菜单创建一个复杂的多级菜单系统：

```javascript
// xdyy_menu_registry.js
global.registerMenuTemplate("menu_advanced", {
  action: "menu",
  menuWidth: 250,
  menuItems: [
    "📝 笔记操作", // 分组标题{
      action: "noteOperation1",
      menuTitle: " 整理格式"
    },
    {
      action: "menu", // 子菜单menuTitle: " 批量处理➡️",
      menuItems: [
        {action: "batchRename", menuTitle: "批量重命名"},
        {action: "batchTag", menuTitle: "批量添加标签"},
        {action: "batchMove", menuTitle: "批量移动"}
      ]
    },

    "🎨 样式调整", // 另一个分组{
      action: "menu",
      menuTitle: " 颜色方案➡️",
      menuItems: [
        {action: "colorScheme1", menuTitle: "学术风格"},
        {action: "colorScheme2", menuTitle: "商务风格"},
        {action: "colorScheme3", menuTitle: "创意风格"}
      ]
    }
  ]
});
```

### 3.4 用户交互模式#### 3.4.1 输入框交互```javascript
global.registerCustomAction("renameNote", async function(context) {
  const {focusNote} = context;

  if (!focusNote) {
    MNUtil.showHUD("❌ Please select a card first");
    return;
  }

  // Show input fields UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
    "重命名卡片",
    "请输入新的标题:",
    2, // UIAlertViewStylePlainTextInput
    "Cancel",
    ["Sure"],
    (alert, buttonIndex) => {
      if (buttonIndex === 1) { // 点击确定const newTitle = alert.textFieldAtIndex(0).text;

        if (newTitle && newTitle.trim()) {
          MNUtil.undoGrouping(() => {
            focusNote.noteTitle = newTitle.trim();
            MNUtil.showHUD("✅ 重命名成功");
          });
        }
      }
    }
  );

  // 设置默认值let alert = UIAlertView.lastAlert;
  alert.textFieldAtIndex(0).text = focusNote.noteTitle || "";
});
```

#### 3.4.2 选择列表交互```javascript
global.registerCustomAction("selectTemplate", async function(context) {
  const templates = [
    "📚 学习笔记",
    "💼 会议记录",
    "💡 灵感速记",
    "📊 数据分析",
    "🎯 目标规划"
  ];

  // 创建选择菜单const commandTable = templates.map(template => ({
    title: template,
    object: global,
    selector: 'applyTemplate:',
    param: {template, context}
  }));

  // 显示菜单MNUtil.getPopoverAndPresent(
    context.button,
    commandTable,
    200
  );
});

// 处理选择global.applyTemplate = function(param) {
  const {template, context} = param;
  const {focusNote} = context;

  MNUtil.undoGrouping(() => {
    // 根据模板应用不同的格式switch(template) {
      case "📚 学习笔记":
        focusNote.noteTitle = `【学习】${focusNote.noteTitle || ""}`;
        focusNote.colorIndex = 3; // 黄色break;
      case "💼 会议记录":
        focusNote.noteTitle = `【会议】${focusNote.noteTitle || ""}`;
        focusNote.colorIndex = 4; // 绿色break;
      // ... 其他模板}

    MNUtil.showHUD(`✅ 已应用模板: ${template}`);
  });
};
```

#### 3.4.3 进度反馈```javascript
global.registerCustomAction("batchProcess", async function(context) {
  const {focusNotes} = context;

  if (!focusNotes || focusNotes.length === 0) {
    MNUtil.showHUD("❌ Please select a card first");
    return;
  }

  const total = focusNotes.length;
  let processed = 0;

  // 显示开始提示MNUtil.showHUD(`⏳ 开始处理${total} 个卡片...`);

  for (const note of focusNotes) {
    // 处理每个卡片await processNote(note);

    processed++;

    // 更新进度（每处理10% 显示一次）
    if (processed % Math.ceil(total / 10) === 0 || processed === total) {
      const percent = Math.round((processed / total) * 100);
      MNUtil.showHUD(`⏳ 处理进度: ${percent}% (${processed}/${total})`);
    }

    // 避免阻塞UI
    if (processed % 10 === 0) {
      await MNUtil.delay(0.01);
    }
  }

  MNUtil.showHUD(`✅ 完成！共处理${total} 个卡片`);
});
```

### 3.5 最佳实践#### 3.5.1 错误处理```javascript
global.registerCustomAction("safeAction", async function(context) {
  try {
    // 参数验证if (!context || !context.focusNote) {
      MNUtil.showHUD("❌ 无效的上下文");
      return;
    }

    // 使用撤销分组MNUtil.undoGrouping(() => {
      // 危险操作performDangerousOperation();
    });

  } catch (error) {
    // 记录错误if (toolbarUtils && toolbarUtils.addErrorLog) {
      toolbarUtils.addErrorLog(error, "safeAction");
    }

    // 用户友好的错误提示MNUtil.showHUD(`❌ 操作失败: ${error.message || "未知错误"}`);

    // 开发模式下输出详细信息if (typeof MNUtil !== "undefined" && MNUtil.log) {
      MNUtil.log(`错误详情: ${error.stack}`);
    }
  }
});
```

#### 3.5.2 性能优化```javascript
// 批量操作优化global.registerCustomAction("optimizedBatch", async function(context) {
  const {focusNotes} = context;

  // 使用单个撤销组MNUtil.undoGrouping(() => {
    // 批量收集数据，减少API 调用const noteData = focusNotes.map(note => ({
      id: note.noteId,
      title: note.noteTitle,
      color: note.colorIndex
    }));

    // 批量处理processBatch(noteData);

    // 批量更新focusNotes.forEach((note, index) => {
      note.noteTitle = noteData[index].title;
      note.colorIndex = noteData[index].color;
    });
  });
});
```

#### 3.5.3 状态管理```javascript
// 使用闭包保存状态(function() {
  // 私有状态let lastProcessedId = null;
  let processCount = 0;

  global.registerCustomAction("statefulAction", async function(context) {
    const {focusNote} = context;

    // 检查是否重复处理if (focusNote.noteId === lastProcessedId) {
      MNUtil.showHUD("⚠️ 该卡片刚刚已处理");
      return;
    }

    // 更新状态lastProcessedId = focusNote.noteId;
    processCount++;

    // 执行操作MNUtil.undoGrouping(() => {
      focusNote.appendComment(`处理次序: #${processCount}`);
    });

    MNUtil.showHUD(`✅ 已处理(总计: ${processCount})`);
  });
})();
```

#### 3.5.4 调试技巧```javascript
// 开发模式开关const DEBUG = true;

global.registerCustomAction("debugAction", async function(context) {
  if (DEBUG) {
    // 输出详细调试信息MNUtil.log("=== 调试信息===");
    MNUtil.log(`Context keys: ${Object.keys(context).join(", ")}`);
    MNUtil.log(`FocusNote: ${context.focusNote?.noteId}`);
    MNUtil.log(`FocusNotes count: ${context.focusNotes?.length}`);

    // 复制完整上下文到剪贴板（方便分析）
    MNUtil.copyJSON(context);
    MNUtil.showHUD("📋 上下文已复制到剪贴板");
  }

  // 实际功能逻辑performActualWork(context);
});
```

---

## 第四部分：API 参考### 4.1 核心API

#### 4.1.1 MNNote API

```javascript
// 获取卡片const focusNote = MNNote.getFocusNote(); // 当前选中的卡片const focusNotes = MNNote.getFocusNotes(); // 所有选中的卡片const note = MNNote.new(noteId); // 根据ID 获取卡片// 卡片属性note.noteId // 卡片ID
note.noteTitle // 标题note.excerptText // 摘录文本note.noteURL // 卡片链接note.colorIndex // 颜色索引(0-15)
note.fillIndex // 填充样式索引note.mindmapBranchIndex // 脑图分支样式note.tags // 标签数组note.comments // 评论数组note.parentNote // 父卡片note.childNotes // 子卡片数组note.linkedNotes // 链接的卡片// 卡片方法note.appendComment(text); // 添加文本评论note.appendHtmlComment(html); // 添加HTML 评论note.appendTags(["tag1", "tag2"]); // 添加标签note.removeCommentAtIndex(0); // 删除评论note.addChild(childNote); // 添加子卡片note.removeFromParent(); // 从父卡片移除note.toBeIndependent(); // 转为独立卡片note.merge(anotherNote); // 合并卡片note.focusInMindMap(duration); // 在脑图中聚焦note.focusInDocument(); // 在文档中聚焦note.paste(); // 粘贴剪贴板内容note.clearFormat(); // 清除格式```

#### 4.1.2 MNUtil API

```javascript
// UI 反馈MNUtil.showHUD(message); // 显示提示信息MNUtil.confirm(title, message); // 显示确认对话框MNUtil.alert(title, message); // 显示警告对话框// 剪贴板MNUtil.copy(text); // 复制文本MNUtil.copyJSON(object); // 复制JSON 对象MNUtil.copyImage(imageData); // 复制图片MNUtil.clipboardText // 获取剪贴板文本// 撤销管理MNUtil.undoGrouping(() => { // 创建撤销组// 多个操作作为一次撤销});

// 异步控制await MNUtil.delay(seconds); // 延迟执行MNUtil.animate(() => { // 动画执行// UI 变化}, duration);

// 系统信息MNUtil.studyMode // 学习模式MNUtil.currentNotebookId // 当前笔记本ID
MNUtil.currentDocmd5 // 当前文档MD5
MNUtil.currentWindow // 当前窗口MNUtil.studyView // 学习视图MNUtil.version // 版本信息// 选择和选中MNUtil.selectionText // 选中的文本MNUtil.currentSelection // 当前选择对象// 通知MNUtil.postNotification(name, userInfo); // 发送通知MNUtil.addObserver(target, selector, name); // 添加观察者MNUtil.removeObserver(target, name); // 移除观察者// 工具函数MNUtil.log(message); // 输出日志MNUtil.openURL(url); // 打开URL
MNUtil.refreshAddonCommands(); // 刷新插件命令```

#### 4.1.3 toolbarConfig API

```javascript
// 配置管理toolbarConfig.save(key, value); // 保存配置toolbarConfig.load(key); // 加载配置toolbarConfig.getWindowState(key); // 获取窗口状态toolbarConfig.setWindowState(key, value); // 设置窗口状态// 按钮和动作toolbarConfig.action // 当前工具栏按钮数组toolbarConfig.dynamicAction // 动态工具栏按钮数组toolbarConfig.getDescriptionById(id); // 获取动作描述toolbarConfig.getDesByButtonName(name); // 通过按钮名获取描述toolbarConfig.imageConfigs // 图标配置// 工具栏状态toolbarConfig.dynamic // 是否动态模式toolbarConfig.vertical(); // 是否垂直布局toolbarConfig.horizontal(); // 是否水平布局```

#### 4.1.4 UIKit API

```javascript
// 按钮UIButton.buttonWithType(type);
button.setTitleForState(title, state);
button.setImageForState(image, state);
button.addTargetActionForControlEvents(target, action, events);
button.removeTargetActionForControlEvents(target, action, events);

// 颜色UIColor.whiteColor();
UIColor.blackColor();
UIColor.colorWithHexString("#FF0000");
color.colorWithAlphaComponent(0.5);

// 弹窗UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
  title,
  message,
  style, // 0: 默认, 1: 密码, 2: 输入框cancelTitle,
  otherTitles, // 数组callback // (alert, buttonIndex) => {}
);

// 手势gesture.state // 1: began, 2: changed, 3: ended
gesture.locationInView(view);
```

### 4.2 调试技巧#### 4.2.1 日志输出```javascript
// 基础日志MNUtil.log("简单消息");
MNUtil.log(`变量值: ${variable}`);

// 对象调试MNUtil.copyJSON(complexObject); // 复制到剪贴板查看MNUtil.log(JSON.stringify(object, null, 2)); // 格式化输出// 条件日志const DEBUG = true;
if (DEBUG) {
  MNUtil.log("调试信息");
}

// 日志分类MNUtil.log("🔧 初始化");
MNUtil.log("✅ 成功");
MNUtil.log("❌ 错误");
MNUtil.log("🔍 查找");
MNUtil.log("🚀 执行");
```

#### 4.2.2 断点调试```javascript
// 使用debugger 语句（需要开发者工具支持）
global.registerCustomAction("debugAction", async function(context) {
  debugger; // 断点// 检查变量console.log(context);
});

// 手动断点global.registerCustomAction("manualBreak", async function(context) {
  // 暂停并显示信息MNUtil.confirm("调试断点", `
    FocusNote: ${context.focusNote?.noteId}
    Button: ${context.button?.target}
    继续执行？
  `);

  // 继续执行performWork();
});
```

#### 4.2.3 性能分析```javascript
// 计时器global.registerCustomAction("timedAction", async function(context) {
  const startTime = Date.now();

  // 执行操作await heavyOperation();

  const elapsed = Date.now() - startTime;
  MNUtil.log(`执行时间: ${elapsed}ms`);

  if (elapsed > 1000) {
    MNUtil.log("⚠️ 性能警告: 操作耗时超过1 秒");
  }
});

// 内存监控global.registerCustomAction("memoryCheck", async function(context) {
  const before = process.memoryUsage?.();

  // 执行操作performOperation();

  const after = process.memoryUsage?.();
  if (before && after) {
    const diff = after.heapUsed - before.heapUsed;
    MNUtil.log(`内存使用: ${diff / 1024 / 1024}MB`);
  }
});
```

### 4.3 常见问题#### Q1: 按钮不显示**可能原因**：
1. 图标文件缺失2. 按钮未正确注册3. 加载顺序错误**解决方案**：
```javascript
// 检查按钮是否注册MNUtil.log(`按钮注册: ${global.customButtons["myButton"] ? "是" : "否"}`);

// 检查图标MNUtil.log(`图标存在: ${toolbarConfig.imageConfigs["myIcon"] ? "是" : "否"}`);

// 强制刷新MNUtil.refreshAddonCommands();
```

#### Q2: 动作不执行**可能原因**：
1. action 名称不匹配2. 函数未正确注册3. 错误被静默捕获**解决方案**：
```javascript
// 添加日志追踪global.registerCustomAction("myAction", async function(context) {
  MNUtil.log("动作开始执行"); // 添加日志try {
    // 实际逻辑} catch (error) {
    MNUtil.log(`错误: ${error}`); // 捕获错误throw error; // 重新抛出}
});
```

#### Q3: 菜单不显示**可能原因**：
1. 菜单模板格式错误2. menuItems 为空3. 手势识别冲突**解决方案**：
```javascript
// 验证菜单模板const template = global.customMenuTemplates["myMenu"];
MNUtil.copyJSON(template); // 检查结构// 确保有菜单项if (!template.menuItems || template.menuItems.length === 0) {
  MNUtil.log("警告: 菜单项为空");
}
```

#### Q4: 撤销不工作**可能原因**：
1. 未使用undoGrouping
2. 操作不支持撤销3. 撤销组嵌套**解决方案**：
```javascript
// 正确使用撤销组MNUtil.undoGrouping(() => {
  // 所有修改操作都放在这里note.noteTitle = "新标题";
  note.colorIndex = 3;
});

// 避免嵌套let inUndoGroup = false;
function safeUndo(callback) {
  if (inUndoGroup) {
    callback();
  } else {
    inUndoGroup = true;
    MNUtil.undoGrouping(callback);
    inUndoGroup = false;
  }
}
```

#### Q5: 内存泄漏**可能原因**：
1. 事件监听未清理2. 定时器未清除3. 循环引用**解决方案**：
```javascript
// 使用闭包管理资源(function() {
  let timer = null;
  let observer = null;

  global.registerCustomAction("managedAction", async function(context) {
    // 清理旧资源if (timer) {
      clearTimeout(timer);
    }
    if (observer) {
      MNUtil.removeObserver(observer);
    }

    // 创建新资源timer = setTimeout(() => {
      // 延迟操作}, 1000);

    // 确保清理context.self?.cleanupCallbacks?.push(() => {
      clearTimeout(timer);
    });
  });
})();
```

---

## 附录A：完整示例### 批量制卡功能完整实现这是一个完整的批量制卡功能示例，展示了所有概念的综合应用：

```javascript
// === xdyy_button_registry.js ===
global.registerButton("batchCards", {
  name: "批量制卡",
  image: "batchcards",
  templateName: "menu_batchCards"
});

// === xdyy_menu_registry.js ===
global.registerMenuTemplate("menu_batchCards", {
  action: "quickBatchCards",
  onLongPress: {
    action: "menu",
    menuWidth: 250,
    menuItems: [
      "⚡ 快速操作",
      {action: "quickBatchCards", menuTitle: " 一键制卡"},
      {action: "batchCardsWithOptions", menuTitle: " 制卡选项..."},

      "🎨 预设模板",
      {action: "academicCards", menuTitle: " 学术模板"},
      {action: "reviewCards", menuTitle: " 复习模板"},
      {action: "summaryCards", menuTitle: " 总结模板"},

      "⚙️ 高级",
      {action: "batchCardsSettings", menuTitle: " 设置默认选项"},
      {action: "batchCardsHistory", menuTitle: " 查看历史"}
    ]
  }
});

// === xdyy_custom_actions_registry.js ===

// 状态管理const batchCardsState = {
  lastOptions: {},
  history: [],
  processing: false
};

// 主功能：快速批量制卡global.registerCustomAction("quickBatchCards", async function(context) {
  const {focusNotes} = context;

  if (!focusNotes || focusNotes.length === 0) {
    MNUtil.showHUD("❌ 请先选择要制卡的笔记");
    return;
  }

  if (batchCardsState.processing) {
    MNUtil.showHUD("⚠️ 正在处理中，请稍候");
    return;
  }

  batchCardsState.processing = true;
  const startTime = Date.now();

  try {
    MNUtil.showHUD(`⏳ 开始处理${focusNotes.length} 个卡片...`);

    let successCount = 0;
    let failCount = 0;

    MNUtil.undoGrouping(() => {
      focusNotes.forEach((note, index) => {
        try {
          // 制卡核心逻辑processNoteToCard(note);
          successCount++;

          // 进度反馈if ((index + 1) % 10 === 0) {
            const progress = Math.round(((index + 1) / focusNotes.length) * 100);
            MNUtil.showHUD(`⏳ Progress: ${progress}%`);
          }
        } catch (error) {
          failCount++;
          MNUtil.log(`制卡失败[${note.noteId}]: ${error}`);
        }
      });
    });

    // 记录历史const record = {
      time: new Date().toISOString(),
      total: focusNotes.length,
      success: successCount,
      fail: failCount,
      duration: Date.now() - startTime
    };
    batchCardsState.history.unshift(record);
    if (batchCardsState.history.length > 10) {
      batchCardsState.history.pop();
    }

    // 显示结果const message = failCount > 0
      ? `✅ 完成！成功: ${successCount}, 失败: ${failCount}`
      : `✅ 成功制作${successCount} 张卡片`;
    MNUtil.showHUD(message);

  } catch (error) {
    MNUtil.showHUD(`❌ 批量制卡失败: ${error.message}`);
    toolbarUtils.addErrorLog(error, "quickBatchCards");
  } finally {
    batchCardsState.processing = false;
  }
});

// 带选项的批量制卡global.registerCustomAction("batchCardsWithOptions", async function(context) {
  // 显示选项对话框const options = await showCardOptions();

  if (!options) {
    return; // 用户取消}

  // 保存选项batchCardsState.lastOptions = options;

  // 执行制卡await processBatchCardsWithOptions(context, options);
});

// 学术模板global.registerCustomAction("academicCards", async function(context) {
  const academicOptions = {
    addTitle: true,
    titlePrefix: "【学术】",
    colorIndex: 3, // 黄色addTags: ["学术", "待整理"],
    addToReview: true,
    extractKeywords: true
  };

  await processBatchCardsWithOptions(context, academicOptions);
});

// 核心处理函数function processNoteToCard(note, options = {}) {
  // 默认选项const opts = {
    addTitle: true,
    titlePrefix: "",
    colorIndex: null,
    addTags: [],
    addToReview: false,
    extractKeywords: false,
    ...options
  };

  // 1. 处理标题if (opts.addTitle && !note.noteTitle) {
    const title = extractTitle(note);
    note.noteTitle = opts.titlePrefix + title;
  }

  // 2. 设置颜色if (opts.colorIndex !== null) {
    note.colorIndex = opts.colorIndex;
  }

  // 3. 添加标签if (opts.addTags.length > 0) {
    note.appendTags(opts.addTags);
  }

  // 4. 加入复习if (opts.addToReview) {
    // 调用复习相关API
    addToReviewSystem(note);
  }

  // 5. 提取关键词if (opts.extractKeywords) {
    const keywords = extractKeywords(note.excerptText);
    if (keywords.length > 0) {
      note.appendComment(`关键词: ${keywords.join(", ")}`);
    }
  }
}

// 辅助函数：提取标题function extractTitle(note) {
  if (note.excerptText) {
    // 从摘录提取第一句作为标题const firstSentence = note.excerptText.split(/[。！？\n]/)[0];
    return firstSentence.substring(0, 30);
  }
  return "未命名卡片";
}

// 辅助函数：提取关键词function extractKeywords(text) {
  if (!text) return [];

  // 简单的关键词提取逻辑const words = text.match(/[\u4e00-\u9fa5]{2,}/g) || [];
  const frequency = {};

  words.forEach(word => {
    frequency[word] = (frequency[word] || 0) + 1;
  });

  // 按频率排序，取前5个return Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word);
}

// === xdyy_utils_extensions.js ===
// 扩展工具函数toolbarUtils.batchCardsUtils = {
  // 获取默认选项getDefaultOptions() {
    return batchCardsState.lastOptions || {
      addTitle: true,
      colorIndex: null,
      addTags: [],
      addToReview: false
    };
  },

  // 获取历史记录getHistory() {
    return batchCardsState.history;
  },

  // 清空历史clearHistory() {
    batchCardsState.history = [];
    MNUtil.showHUD("✅ 历史已清空");
  }
};
```

---

## 附录B：开发检查清单在发布你的扩展之前，请确保：

### 功能检查- [ ] 所有按钮都能正常显示- [ ] 点击、长按、双击功能都正常- [ ] 菜单能正确弹出和导航- [ ] 错误处理完善，不会崩溃- [ ] 撤销功能正常工作### 代码质量- [ ] 使用有意义的函数和变量名- [ ] 添加必要的注释- [ ] 遵循一致的代码风格- [ ] 没有调试代码遗留- [ ] 没有硬编码的测试数据### 性能优化- [ ] 批量操作使用单个撤销组- [ ] 大量数据处理有进度反馈- [ ] 避免不必要的API 调用- [ ] 及时清理资源和监听器### 用户体验- [ ] 操作有明确的反馈（HUD 提示）
- [ ] 错误信息友好易懂- [ ] 危险操作有确认提示- [ ] 图标清晰易识别### 文档完善- [ ] README 说明功能和用法- [ ] 列出所有依赖项- [ ] 提供安装指南- [ ] 包含常见问题解答---

## 结语MN Toolbar 的扩展开发既简单又强大。通过本指南介绍的"补丁"架构，你可以：

1. **无侵入地扩展功能** - 不修改官方代码2. **模块化管理代码** - 清晰的分层结构3. **快速迭代开发** - 即改即用4. **轻松分享成果** - 独立的扩展文件记住核心原则：
- **分离关注点**：按钮、菜单、动作、工具各司其职- **注册而非修改**：通过注册表添加功能- **上下文驱动**：通过context 对象传递所有信息- **用户至上**：始终提供清晰的反馈无论你是想添加一个简单的快捷操作，还是构建复杂的工作流系统，这个架构都能满足你的需求。

Happy Coding! 🚀

---

## 快速索引：我想要...

> **小白提示**：根据你的需求，快速找到对应的章节。

### 🚀 如果你想快速上手- **从零开始** → [初学者必读](#初学者必读从零开始的完整开发流程)
- **创建第一个按钮** → [Step 2：创建你的第一个按钮](#step-2创建你的第一个按钮)
- **看完整示例** → [附录A：完整示例](#附录-a完整示例)

### 🔍 如果你想理解原理- **按钮如何工作** → [1.2 按钮工作原理](#12-按钮工作原理)
- **菜单如何弹出** → [1.3 菜单系统原理](#13-菜单系统原理)
- **动作如何执行** → [1.4 动作处理流程](#14-动作处理流程)

### 🛠️ 如果你想深入开发- **理解补丁架构** → [第二部分：补丁架构设计](#第二部分补丁架构设计)
- **配置融合机制** → [2.4.3 配置融合机制](#243-配置融合机制核心原理)
- **高级交互模式** → [3.4 用户交互模式](#34-用户交互模式)

### ❓ 如果你遇到问题- **按钮不显示** → [Q1: 按钮不显示](#q1-按钮不显示)
- **动作不执行** → [Q2: 动作不执行](#q2-动作不执行)
- **菜单不弹出** → [Q3: 菜单不显示](#q3-菜单不显示)
- **常见错误** → [常见错误及解决方法](#常见错误及解决方法)

### 📚 如果你想查API
- **卡片操作** → [4.1.1 MNNote API](#411-mnote-api)
- **工具方法** → [4.1.2 MNUtil API](#412-mnutil-api)
- **UI 组件** → [4.1.4 UIKit API](#414-uikit-api)

### 💡 学习路径推荐**第1 周：基础入门**
1. 阅读[初学者必读](#初学者必读从零开始的完整开发流程)
2. 完成第一个按钮3. 理解基本原理**第2 周：进阶实践**
1. 学习[多级菜单](#33-进阶多级菜单)
2. 掌握[用户交互](#34-用户交互模式)
3. 实现批量操作**第3 周：深入理解**
1. 研究[补丁架构](#第二部分补丁架构设计)
2. 理解配置融合3. 优化性能**第4 周：独立开发**
1. 设计自己的功能2. 处理复杂逻辑3. 发布分享---

*本指南持续更新中。如有问题或建议，欢迎提交Issue 或Pull Request。*
