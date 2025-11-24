# 📚 MN Toolbar Development Training Complete Guide > 🎯 **Ultimate Goal**: To create a comprehensive document that blends technical depth with training-friendly design, suitable for a 3-hour training session while retaining complete technical content.
📖 **Target Audience:** Beginners → Advanced Developers → Technical Experts
> ⏱️ **Learning Duration**: Fast Track 3 hours | Full Learning 15 hours | Mastery 30 hours ## 🗂️ Table of Contents ### 🚀 Quick Navigation (Choose your learning path)

<details>
<summary><b>🌱 Beginner's Guide (Master in 3 Hours)</b></summary>

1. [Quick Start] (#Part 1 Quick Start 30 minutes) → Understanding plugins and setting up the environment 2. [Your First Button] (#21 - Your First Hello Button) → Creating a Hello Button 3. [Understanding the Principle] (#22 - Simplified Understanding of How it Works) → Basic Concepts 4. [Practical Functionality] (#Part 3 Practical Development 60 minutes) → 3 Useful Functions 5. [Frequently Asked Questions] (#Frequently Asked Questions (FAQ)) → Quick Solutions

<details>
<summary><b>⚡ Advanced Development Path (15 hours of in-depth learning)</b></summary>

1. [Architecture Overview](#21-Architecture Overview) → Complete System Architecture 2. [Core Principles](#Part Two: In-depth Analysis of Core Principles, 45 minutes) → Technical Details 3. [Patch Architecture](#Part Four: Patch Architecture Design, 30 minutes) → Decoupling Design 4. [Advanced Extensions](#Part Five: Advanced and Extended Features, 30 minutes) → Advanced Features 5. [Performance Optimization](#54-Performance Optimization) → Best Practices

<details>
<summary><b>🔧 Troubleshooting Path (Direct Access to Solution)</b></summary>

- [Button not showing](#q1-What to do if the button is not showing) → Environment and configuration - [Clicking has no effect](#q2-Clicking the button has no effect) → Action matching - [Function error](#q3-What to do if the code has an error) → Debugging techniques - [Undo not work](#434-Undo is not working) → undoGrouping
- [Memory Leak](#435-Memory Leak) → Resource Cleanup

### 📑 Full Table of Contents - [Part 1: Quick Start (30 minutes)](#Part 1: Quick Start (30 minutes))
  - [1.1 Understanding MN Toolbar](#11-Understanding-mn-toolbar)
  - [1.2 Environmental Preparation](#12-Environmental Preparation)
  - [1.3 File Structure](#13-Understanding File Structure)
- [Part Two: In-depth Analysis of Core Principles (45 minutes)](#Part Two: In-depth Analysis of Core Principles (45 minutes))
  - [2.1 Architecture Overview](#21-Architecture Overview)
  - [2.2 Button Working Principle](#22-Complete Version of Button Working Principle)
  - [2.3 Menu System Principles](#23-Detailed Explanation of Menu System Principles)
  - [2.4 Motion Processing Flow](#24-In-depth Analysis of Motion Processing Flow)
- [Part Three: Practical Development (60 minutes)](#Part Three Practical Development 60 minutes)
  - [3.1 Three Practical Functions](#31-Developing Three Practical Functions)
  - [3.2 Debugging Techniques](#32-Debugging Techniques)
  - [3.3 User Interaction Mode](#33-User Interaction Mode)
- [Part Four: Patch Architecture Design (30 minutes)](#Part Four: Patch Architecture Design 30 minutes)
  - [4.1 Why is a patch architecture needed?](#41-Why is a patch architecture needed?)
  - [4.2 Registry Schema Design](#42-Registry Schema Design)
  - [4.3 Four-Layer Architecture Analysis](#43-Four-Layer Architecture Analysis)
  - [4.4 Configuring the Fusion Mechanism](#44-Configuring the Core Principles of the Fusion Mechanism)
- [Part 5: Advanced and Expanded (30 minutes)](#Part 5 Advanced and Expanded 30 minutes)
  - [5.1 Multilevel Menu Design](#51-Multilevel Menu Design)
  - [5.2 Advanced Interaction Mode](#52-Advanced Interaction Mode)
  - [5.3 Best Practices](#53-Best Practices)
  - [5.4 Performance Optimization](#54-Performance Optimization)
- [Appendix A: API Quick Reference Manual](#Appendix A API Quick Reference Manual)
- [Appendix B: Code Template Library](#Appendix B Code Template Library)
- [Appendix C: Complete Example - Bulk Card Production](#Appendix C: Complete Example - Bulk Card Production)
- [Appendix D: Development Checklist](#Appendix D Development Checklist)
- [Appendix E: Frequently Asked Questions (FAQ)](#FAQ)

---

## Part 1: Quick Start Guide (30 minutes)

### Learning Objectives - ✅ Understand what the MN Toolbar plugin is - ✅ Set up the development environment - ✅ Create your first function button - ✅ Master basic debugging methods ### 1.1 Understanding the MN Toolbar

> 💡 **Life Analogy**: The MN Toolbar is like installing an app on your phone, or adding custom function buttons to MarginNote. #### What can the plugin do?

The MN Toolbar allows you to add custom buttons in MarginNote, and each button can:
- 🕐 One-click timestamp addition - 🏷️ Batch tag addition - 📝 Quick card creation - 🎨 Automatic note formatting - 🔄 Batch processing operations - 📊 Export statistics #### Final preview```
MarginNote Interface ├── Your Notebook ├── Document Area └── Toolbar ← This is the MN Toolbar!
    ├── [Timestamp] button ← You created ├── [Bulk Tags] button ← You created └── [More...] button ← You created

### 1.2 Environment Preparation #### 📁 Locate the plugin folder **macOS path**:
bash
~/Library/Containers/QReader.MarginStudyMac/Data/Library/MarginNote Extensions/mntoolbar
```

**Quick Open Method**:
1. Open Finder
2. Press `Cmd + Shift + G`
3. Paste the above path **iOS/iPadOS path**:
```
File App → My iPad → MarginNote 3 → Extensions → mntoolbar
```

#### 🛠️ Preparing Development Tools | Tools | Purpose | Recommendations |
|------|------|------|
| Text Editor | Code Writing | VSCode (Free) |
| Icon file | Button icon | 40×40 pixel PNG |
| MarginNote 3 | Testing Environment | Required |

### 1.3 Understanding File Structure```
mntoolbar/
├── 📜 Core files (do not modify)
│ ├── main.js # Plugin entry point │ ├── utils.js # Utility function library │ ├── webviewController.js # UI controller │ └── settingController.js # Settings interface │
├── 🎯 Extended file (the one you want to modify)
│ ├── xdyy_button_registry.js # Define button │ ├── xdyy_menu_registry.js # Define menu │ ├── xdyy_custom_actions_registry.js # Define function │ └── xdyy_utils_extensions.js # Utility extensions │
└── 🖼️ Resource Files ├── custom1.png ... custom19.png # Button Icons └── Other Icon Files```

> ⚠️ **Important Reminder**: Only modify files starting with `xdyy_`, do not modify core files!

---

## 🎯 Quick Practice: The First Button (10 minutes)

### 2.1 Your First Hello Button > 📚 **Basic Understanding**: Creating a button requires three steps, just like ordering food at a restaurant:
1. This dish must be on the menu (register button).
2. **You need to know how to do it** (defining the menu template)
3. **The chef can cook** (Function implemented)

#### Step 1: Register button (xdyy_button_registry.js)

Locate the `registerAllButtons()` function and add the following before `custom19`:

```javascript
// My first button!
global.registerButton("custom16", {
  name: "Hello", // Text displayed on the button image: "custom16", // Icon using custom16.png templateName: "menu_hello" // Associated menu template});
```

#### Step 2: Define the menu (xdyy_menu_registry.js)

Add the following to the end of the file:

```javascript
// Menu configuration for the Hello button: global.registerMenuTemplate("menu_hello", {
  action: "sayHello" // Click to execute the sayHello action});
```

Step 3: Implement the functionality (xdyy_custom_actions_registry.js)

Add the following to the end of the file:

```javascript
// Implementation of the Hello function global.registerCustomAction("sayHello", async function(context) {
  // Display a message: MNUtil.showHUD("🎉 Hello MN Toolbar!");

  // Get the currently selected card const focusNote = MNNote.getFocusNote();

  if (focusNote) {
    // If a card is selected, const title = focusNote.noteTitle || "Untitled";
    MNUtil.showHUD(`card title: ${title}`);
  } else {
    // No card selected. MNUtil.showHUD("Please select a card first");
  }
});
```

#### Test your button 1. **Save all files**
2. **Completely exit MarginNote** (Cmd+Q or close from the background)
3. **Reopen MarginNote**
4. **Open the toolbar settings**, find the "Hello" button. 5. **Drag the button to the toolbar**.
6. **Click the Hello button**, and you will see the message "🎉 Hello MN Toolbar!"

🎉 Congratulations! You've created your first feature!

### 2.2 Understanding the Working Principle (Simplified Version)

<details>
<summary>📚 <b>Basic Understanding: Click Process</b></summary>

```
The user clicks the Hello button ↓
The system is searching for the configuration of custom16 ↓
Find templateName: "menu_hello"
    ↓
Find the menu_hello template ↓
Found the action: "sayHello"
    ↓
Execute the sayHello function ↓
Displays "Hello MN Toolbar!"
```

</details>

<details>
<summary>🔧 <b>Technical Details: Complete Execution Thread</b> (Click to expand)</summary>

```javascript
// Complete execution chain 1. User clicks the button, triggering the iOS TouchUpInside event (value 1 << 6 = 64)
2. `webviewController.customAction(button)` is called. 3. The actionName is determined by retrieving `button.target` or `button.index`.
4. `toolbarConfig.getDescriptionById(actionName)` retrieves the complete configuration. 5. Parses the `action` field in the `description` object. 6. Locates the function registered in `global.customActions[action]`. 7. Executes the function and passes the `context` object.

</details>

---

## Part Two: In-depth Analysis of Core Principles (45 minutes)

### Learning Objectives - ✅ Understand the complete system architecture - ✅ Master the button event mechanism - ✅ Understand the menu system implementation - ✅ Master the action processing flow ### 2.1 Architecture Overview #### Overall Architecture Diagram```
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

### 2.2 Button Working Principle (Complete Version)

📚 **Basic Understanding**: A button is like a light switch in your home. When you press the switch (click the button), the circuit is connected (triggering an event), and the light turns on (performing a function).

#### 2.2.1 Basic Concepts<details>
<summary>📖 <b>Explanation of Core Concepts</b></summary>

- **UIButton**: A button component provided by the iOS system. - **Event**: User actions, such as click, long press, and double-click. - **Function**: A piece of code that can be called and executed. - **JSON**: A data format enclosed in curly braces `{}`, containing key-value pairs.

#### 2.2.2 Detailed Explanation of Button Creation Process```javascript
// webviewController.js - Button creation (lines 1037-1052)
viewDidLoad: function() {
  // 1. Create a UIButton instance // UIButton.buttonWithType(0) creates a standard button // Parameter 0 indicates UIButtonTypeCustom (custom style button)
  let button = UIButton.buttonWithType(0);

  // 2. Set the button appearance button.setTitleForState('Button Text', 0); // 0 = UIControlStateNormal
  button.setImageForState(image, 0); // Set the icon button.backgroundColor = UIColor.colorWithHexString("#9bb2d6");
  button.layer.cornerRadius = 5;

  // 3. Bind click events - This is the core!
  button.addTargetActionForControlEvents(
    this, // target: Who will handle this event "customAction:", // action: Which method to call 1 << 6 // event: TouchUpInside = 64
  );

  // 4. Add to view this.view.addSubview(button);
}
```

<details>
<summary>🔧 <b>Technical Details: Bitwise Operations Explained</b> (Click to expand)</summary>

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
// - Users can change their minds after pressing the button (this will not trigger if the button is dragged out and then released).
// - To prevent accidental clicks (the button must be released within its range for a click to be considered complete).
```

</details>

#### 2.2.3 In-depth analysis of click trigger principle **Complete click event flow**:

```
User touches the screen with their finger ↓
iOS system detected a touch point ↓
Determine which button the touch point is on ↓
Record touch state changes ↓
When you lift your finger, check if it's still inside the button ↓ (Yes)
Trigger the TouchUpInside event ↓
Call the bound method```

**Actual code implementation (webviewController.js lines 270-294):**

```javascript
customAction: async function (button) {
  let self = getToolbarController();

  // 1. Determine the function name corresponding to the button: let dynamicOrder = toolbarConfig.getWindowState("dynamicOrder");
  let useDynamic = dynamicOrder && self.dynamicWindow;
  let actionName = button.target ?? (useDynamic
    ? toolbarConfig.dynamicAction[button.index]
    : toolbarConfig.action[button.index]);

  // 2. Get the detailed configuration of this function let des = toolbarConfig.getDescriptionById(actionName);

  // 3. Handle double-click logic (if double-click is configured)
  if ("doubleClick" in des) {
    button.delay = true;
    self.onClick = true;

    if (button.doubleClick) {
      // This is the second click, executing the double-click action. button.doubleClick = false;
      let doubleClick = des.doubleClick;
      if (!("action" in doubleClick)) {
        doubleClick.action = des.action;
      }
      self.customActionByDes(button, doubleClick);
      return;
    }
    // First click, waiting for a possible second click}

  // 4. Execute the action: self.customActionByDes(button, des);
}
```

#### 2.2.4 Detailed Explanation of the Long Press Gesture Principle > 💡 **Basic Understanding**: A long press is like holding down an elevator button. The system times it, and if the set time (usually 0.3 seconds) is exceeded, it is considered a "long press".

<details>
<summary>🔧 <b>Technical Details: Gesture State Machine</b> (Click to expand)</summary>

```javascript
// webviewController.js - addLongPressGesture method (lines 2208-2218)
toolbarController.prototype.addLongPressGesture = function (view, selector) {
  // 1. Create a long-press gesture recognizer let gestureRecognizer = new UILongPressGestureRecognizer(this, selector);

  // 2. Set the long press trigger time (0.3 seconds)
  gestureRecognizer.minimumPressDuration = 0.3;

  // 3. Add the gesture recognizer to the view: view.addGestureRecognizer(gestureRecognizer);
}

// The 5 states of the gesture recognizer gesture.state = {
  0: "Possible", // Possible: Gesture just started 1: "Began", // Beginning: Confirmed to be a long press gesture (after 0.3 seconds)
  2: "Changed", // Change: Finger moved but still pressed 3: "Ended", // End: Finger lifted 4: "Cancelled", // Cancel: Gesture interrupted 5: "Failed" // Failure: Gesture conditions not met}
```

**Gesture State Transition Diagram**:

```
User presses finger ↓
[Possible] State 0
    ├─ Immediately lift → [Failed] Status 5 (not a long press)
    └─ Continue holding ↓ (after 0.3 seconds)
    [Began] State 1 ← This triggers a long press action!
        ├─ Finger movement → [Changed] State 2
        ├─ Lift finger → [Ended] Status 3
        └─ Interrupted → [Cancelled] Status 4
```

</details>

#### 2.2.5 Detailed Explanation of Double-Click Processing Mechanism > 💡 **Basic Understanding**: Double-clicking is like knocking on a door—the two "knocks" need to be fast enough (within 300 milliseconds); if it's too slow, it becomes two separate knocks.

<details>
<summary>🔧 <b>Technical Details: Double-click Timing Control</b> (Click to expand)</summary>

```javascript
// The implementation principle of double-click: delayed judgment customAction: function(button) {
  let des = toolbarConfig.getDescriptionById(actionName);

  if ("doubleClick" in des) {
    button.delay = true;
    self.onClick = true;

    if (button.doubleClick) {
      // ===== This is the second click (double-click to complete) =====
      button.doubleClick = false;
      let doubleClick = des.doubleClick;
      if (!("action" in doubleClick)) {
        doubleClick.action = des.action;
      }
      self.customActionByDes(button, doubleClick);
      return;

    } else {
      // ===== This is the first click (possibly the start of a double click) =====
      button.doubleClick = true;

      setTimeout(() => {
        if (button.doubleClick) {
          button.doubleClick = false;
          self.customActionByDes(button, des);
          if (button.menu) {
            button.menu.dismissAnimated(true);
          }
        }
      }, 300); // 300 milliseconds of waiting time}
  }
}
```

**Double-click the timing diagram:**

```
Scenario 1: User clicks 0ms; User clicks button 1ms; button.doubleClick = true
2ms setting setTimeout
Even after a 300ms timeout, button.doubleClick is still true.
301ms for click action, 302ms for result display. Scenario 2: User double-click 0ms, first click 1ms. button.doubleClick = true
2ms setting setTimeout
150ms User's second click (double-click!)
151ms Detected button.doubleClick === true
Double-click action executed in 152ms; result displayed in 153ms; timeout triggered in 300ms, but button.doubleClick is already false, so no action is taken.

</details>

### 2.3 Menu System Principles Explained > 💡 **Basic Understanding**: A menu is like a restaurant menu, listing all available options. Clicking on an item is like ordering food; the system will then perform the corresponding action.

#### 2.3.1 Detailed Explanation of Menu Data Structure
<summary>📖 <b>JSON Basics</b></summary>

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
```

</details>

**Complete structure of menu configuration**:

```javascript
{
  action: "menu", // Required: Indicates this is a menu type action menuWidth: 200, // Optional: Menu width (pixels)
  menuHeight: 300, // Optional: Maximum height autoClose: true, // Optional: Whether to close automatically after clicking menuItems: [ // Required: Array of menu items // Type 1: Plain text group titles (not clickable)
    "⬇️ Basic Operations",

    // Type 2: Simple Menu Items {
      action: "copy",
      menuTitle: " Copy" // 4 spaces indentation},

    // Type 3: Menu items with parameters {
      action: "setColor",
      menuTitle: "Set Color",
      color: 3, // Additional parameter target: "title"
    },

    // Type 4: Submenus (can be nested infinitely)
    {
      action: "menu",
      menuTitle: "More Options➡️",
      menuWidth: 250,
      menuItems: [
        {
          action: "advanced1",
          menuTitle: "Advanced Options 1"
        }
      ]
    },

    // Type 5: Separator "━━━━━━━━━━",

    // Type 6: Menu items with icons {
      action: "delete",
      menuTitle: "🗑️ Delete",
      confirmMessage: "Are you sure you want to delete?"
    }
  ]
}
```

#### 2.3.2 Detailed Explanation of Menu Display Process<details>
<summary>🔧 <b>Technical Details: Menu Rendering Process</b> (Click to expand)</summary>

```javascript
// webviewController.js - customActionByMenu method (lines 296-331)
customActionByMenu: async function (param) {
  let des = param.des;
  let button = param.button;

  // Check if it's a submenu if (des.action === "menu") {
    self.onClick = true;
    self.checkPopover();

    if (("autoClose" in des) && des.autoClose) {
      self.hideAfterDelay(0.1);
    }

    let menuItems = des.menuItems;
    let width = des.menuWidth ?? 200;

    if (menuItems.length) {
      // 1. Convert menu items to the format required by iOS var commandTable = menuItems.map(item => {
        let title = (typeof item === "string")
          ? item
          : (item.menuTitle ?? item.action);

        return {
          title: title,
          object: self,
          selector: 'customActionByMenu:',
          param: {des: item, button: button}
        };
      });

      // 2. Add a back button commandTable.unshift({
        title: toolbarUtils.emojiNumber(self.commandTables.length) + " 🔙",
        object: self,
        selector: 'lastPopover:',
        param: button
      });

      // 3. Save the menu stack: self.commandTables.push(commandTable);

      // 4. Create and display the menu self.popoverController = MNUtil.getPopoverAndPresent(
        button,
        commandTable,
        width,
        4
      );
    }
    return;
  }

  // Not a submenu, execute the specific action if (!(("autoClose" in des) || des.autoClose) {
    self.checkPopover();
    self.hideAfterDelay(0.1);
  }

  self.commandTables = [];
  self.customActionByDes(button, des);
}
```

</details>

### 2.4 In-depth Analysis of Action Processing Flow > 💡 **Basic Understanding**: Action processing is like a package sorting center. Each package (user action) has a destination (the function to be performed), and the system delivers the package to the correct processing point based on the address tag (action name).

#### 2.4.1 Complete Processing Chain```
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

#### 2.4.2 Detailed Explanation of Configuring the Search Mechanism<details>
<summary>🔧 <b>Technical Details: Implementation of getDescriptionById</b> (Click to expand)</summary>

```javascript
// utils.js - getDescriptionById method (lines 7261-7287)
static getDescriptionById(actionKey) {
  let desObject = {};

  // 1. Attempt to retrieve the action key from the actions configuration if (actionKey in this.actions) {
    let action = this.actions[actionKey];

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
    let defaultActions = this.getActions();
    if (actionKey in defaultActions) {
      let defaultAction = defaultActions[actionKey];

      // Special handling of the default behavior of certain buttons switch (actionKey) {
        case "copy":
          desObject.action = "copy";
          break
        // ... More default configurations}
    }
  }

  return desObject;
}
```

**Configuration Priority**:

```javascript
// Priority from high to low:
// 1. User-defined configuration (toolbarConfig.actions)
// 2. Default button configuration (returned by getActions())
// 3. Hard-coded default values ​​(in switch-case statements)
```

</details>

#### 2.4.3 Complete Implementation of Core Processing Functions ```javascript
// utils.js - customActionByDes method (simplified version of lines 5379-5963)
static async customActionByDes(des, button, controller, fromOtherPlugin = false) {
  try {
    // 1. Get the current environment let focusNote = fromOtherPlugin
      ? des.focusNote
      MNNote.getFocusNote();
    Let notebookid = focusNote
      ? focusNote.notebookId
      : MNUtil.currentNotebookId;

    // 2. Prepare a general variable: let success = true;
    let title, content, color, config;

    // 3. Log the message (for debugging)
    MNUtil.log(`Execution action: ${des.action}`);

    // 4. Perform different operations based on the action type switch (des.action) {
      // ===== Text Manipulation Classes =====
      case "copy":
        if (des.target || des.content) {
          success = await this.copy(des);
        } else {
          success = this.smartCopy();
        }
        break

      case "paste":
        this.paste(des);
        await MNUtil.delay(0.1);
        break

      // ===== Card Operation Class =====
      case "switchTitleOrExcerpt":
        this.switchTitleOrExcerpt();
        await MNUtil.delay(0.1);
        break

      case "clearFormat":
        let focusNotes = MNNote.getFocusNotes();
        MNUtil.undoGrouping(() => {
          focusNotes.forEach(note => {
            note.clearFormat();
          });
        });
        await MNUtil.delay(0.1);
        break

      case "setColor":
        MNUtil.undoGrouping(() => {
          focusNotes.forEach(note => {
            note.colorIndex = des.color; // 0-15
          });
        });
        MNUtil.showHUD(`color set to ${des.color}`);
        break

      // ===== Menu Category =====
      case "menu":
        controller.customActionByMenu({
          des: des,
          button: button
        });
        break

      // ===== Extended Actions =====
      default:
        // Check if it's a custom action if (typeof global !== 'undefined' && global.executeCustomAction) {
          const context = {
            button: button,
            des: des,
            focusNote: focusNote,
            focusNotes: MNNote.getFocusNotes(),
            self: controller
          };

          const handled = await global.executeCustomAction(des.action, context);

          if (handled) {
            break
          }
        }

        MNUtil.showHUD("Not supported yet: " + des.action);
        break
    }

    // 5. Post-processing while ("onFinish" in des) {
      des = des.onFinish;
      let delay = des.delay ?? 0.1;
      await MNUtil.delay(delay);

      await this.customActionByDes(des, button, controller, false);
    }

    Return success;

  } catch (error) {
    toolbarUtils.addErrorLog(error, "customActionByDes");
    MNUtil.showHUD(`Error: ${error.message}`);
    return false;
  }
}
```

---

## Part Three: Hands-on Development (60 minutes)

### Learning Objectives - ✅ Develop 3 practical functions - ✅ Master debugging techniques - ✅ Learn user interaction patterns - ✅ Handle common problems ### 3.1 Develop Three Practical Functions #### Function 1: Smart Timestamp > Requirement: Click to add a timestamp, long press to display more options **Step 1: Register Button** (xdyy_button_registry.js)

```javascript
global.registerButton("custom17", {
  name: "timestamp"
  image: "custom17",
  templateName: "menu_timestamp"
});
```

**Step 2: Define the menu** (xdyy_menu_registry.js)

```javascript
global.registerMenuTemplate("menu_timestamp", {
  action: "addTimestamp", // Default: Click action onLongPress: { // Long press: Show menu action: "menu",
    menuWidth: 200,
    menuItems: [
      {
        action: "addTimestamp",
        menuTitle: "Add to Title"
      },
      {
        action: "addTimestampComment",
        menuTitle: "Add as Comment"
      },
      {
        action: "copyTimestamp",
        menuTitle: "Copy Timestamp"
      }
    ]
  }
});
```

**Step 3: Implement the functionality** (xdyy_custom_actions_registry.js)

```javascript
// Add to header global.registerCustomAction("addTimestamp", async function(context) {
  const focusNote = MNNote.getFocusNote();

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

// Add as a comment global.registerCustomAction("addTimestampComment", async function(context) {
  const focusNote = MNNote.getFocusNote();

  if (!focusNote) {
    MNUtil.showHUD("❌ Please select a card first");
    return;
  }

  MNUtil.undoGrouping(() => {
    const timestamp = new Date().toLocaleString('zh-CN');
    focusNote.appendComment(`📅 ${timestamp}`);
    MNUtil.showHUD("✅ Timestamp has been added as a comment");
  });
});

// Copy timestamp global.registerCustomAction("copyTimestamp", async function(context) {
  const timestamp = new Date().toLocaleString('zh-CN');
  MNUtil.copy(timestamp);
  MNUtil.showHUD(`✅ Copy: ${timestamp}`);
});
```

#### Function 2: Batch Labeling > Requirement: Add labels to multiple selected cards in batches.
// Batch add tags global.registerCustomAction("batchAddTag", async function(context) {
  const focusNotes = MNNote.getFocusNotes();

  if (!focusNotes || focusNotes.length === 0) {
    MNUtil.showHUD("❌ Please select a card first");
    return;
  }

  // Show input fields UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
    "Batch add tags"
    This will add labels to ${focusNotes.length} cards.
    2, // Input box style "Cancel",
    ["Add to"],
    (alert, buttonIndex) => {
      if (buttonIndex === 1) {
        const tagName = alert.textFieldAtIndex(0).text;

        if (tagName && tagName.trim()) {
          MNUtil.undoGrouping(() => {
            let count = 0;

            focusNotes.forEach(note => {
              if (!note.tags.includes(tagName)) {
                note.appendTags([tagName.trim()]);
                count++;
              }
            });

            MNUtil.showHUD(`✅ Tags #${tagName} have been added to ${count} cards`);
          });
        } else {
          MNUtil.showHUD("❌ Tag name cannot be empty");
        }
      }
    }
  );
});
```

#### Function 3: Quick Templates > Requirement: Click to apply a preset template and set a uniform format for the cards.
// Academic Notes Template global.registerCustomAction("applyAcademicTemplate", async function(context) {
  const focusNote = MNNote.getFocusNote();

  if (!focusNote) {
    MNUtil.showHUD("❌ Please select a card first");
    return;
  }

  MNUtil.undoGrouping(() => {
    // Add the prefix if (!focusNote.noteTitle) {
      focusNote.noteTitle = "【Academic】";
    } else if (!focusNote.noteTitle.startsWith("[Academic]")) {
      focusNote.noteTitle = "【Academic】" + focusNote.noteTitle;
    }

    // Set the color (yellow)
    focusNote.colorIndex = 3;

    // Add tags focusNote.appendTags(["Academic", "To be organized"]);

    // Add timestamp comment const timestamp = new Date().toLocaleString('zh-CN');
    focusNote.appendComment(`📚 Academic Notes - ${timestamp}`);

    MNUtil.showHUD("✅ Academic Notes Template Applied");
  });
});
```

### 3.2 Debugging Techniques #### 3.2.1 Log Output ```javascript
// Basic logging MNUtil.log("🔍 Debugging: Entering function");
MNUtil.log("📦 Variable value: " + variable);
MNUtil.log("✅ Execution successful");

// Object debugging MNUtil.copyJSON(complexObject); // Copy to clipboard for viewing MNUtil.showHUD("Object has been copied to clipboard");

// Conditional logging const DEBUG = true;
if (DEBUG) {
  MNUtil.log("Debugging information");
}
```

#### 3.2.2 Error Handling ```javascript
global.registerCustomAction("safeAction", async function(context) {
  try {
    MNUtil.log("🚀 Start execution");

    const focusNote = MNNote.getFocusNote();
    if (!focusNote) {
      throw new Error("No card selected");
    }

    // Processing logic focusNote.noteTitle = "Processed";
    MNUtil.showHUD("✅ Success");

  } catch (error) {
    MNUtil.showHUD("❌ Error: " + error.message);
    MNUtil.log("Error details: " + error);
  }
});
```

#### 3.2.3 Performance Monitoring ```javascript
global.registerCustomAction("timedAction", async function(context) {
  const startTime = Date.now();

  // Execute the operation await heavyOperation();

  const elapsed = Date.now() - startTime;
  MNUtil.log(`Execution time: ${elapsed}ms`);

  if (elapsed > 1000) {
    MNUtil.log("⚠️ Performance Warning: Operation took more than 1 second");
  }
});
```

### 3.3 User Interaction Modes #### 3.3.1 Input Box Interaction ```javascript
global.registerCustomAction("renameNote", async function(context) {
  const focusNote = MNNote.getFocusNote();

  if (!focusNote) {
    MNUtil.showHUD("❌ Please select a card first");
    return;
  }

  // Show input fields UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
    "Rename Card"
    Please enter a new title:
    2, // UIAlertViewStylePlainTextInput
    "Cancel",
    ["Sure"],
    (alert, buttonIndex) => {
      if (buttonIndex === 1) { // Click OK const newTitle = alert.textFieldAtIndex(0).text;

        if (newTitle && newTitle.trim()) {
          MNUtil.undoGrouping(() => {
            focusNote.noteTitle = newTitle.trim();
            MNUtil.showHUD("✅ Rename successful");
          });
        }
      }
    }
  );

  // Set the default value let alert = UIAlertView.lastAlert;
  alert.textFieldAtIndex(0).text = focusNote.noteTitle || "";
});
```

#### 3.3.2 Progress Feedback ```javascript
global.registerCustomAction("batchProcess", async function(context) {
  const focusNotes = MNNote.getFocusNotes();

  if (!focusNotes || focusNotes.length === 0) {
    MNUtil.showHUD("❌ Please select a card first");
    return;
  }

  const total = focusNotes.length;
  let processed = 0;

  MNUtil.showHUD(`⏳ Start processing ${total} cards...`);

  for (const note of focusNotes) {
    // Process each card await processNote(note);

    processed++;

    // Update progress (displayed every 10% processed)
    if (processed % Math.ceil(total / 10) === 0 || processed === total) {
      const percent = Math.round((processed / total) * 100);
      MNUtil.showHUD(`⏳ Processing progress: ${percent}% (${processed}/${total})`);
    }

    // Avoid blocking the UI
    if (processed % 10 === 0) {
      await MNUtil.delay(0.01);
    }
  }

  MNUtil.showHUD(`✅ Done! Processed ${total} cards`);
});
```

---

## Part Four: Patch Architecture Design (30 minutes)

### Learning Objectives - ✅ Understand why a patch architecture is needed - ✅ Master the registry model - ✅ Understand the four-tier architecture design - ✅ Master the configuration fusion mechanism ### 4.1 Why a Patch Architecture is Needed #### 4.1.1 Problems with Traditional Methods Adding features to the official version requires directly modifying core files:

```javascript
// ❌ Traditional method - directly modify utils.js
toolbarConfig.actions = {
  "action1": {...},
  "action2": {...},
  "myAction": {...} // Add custom action - pollutes the original code};

// ❌ Traditional method - modify switch-case
switch(action) {
  case "copy": ...
  case "myAction": // Add a case - difficult to maintain // My processing logic break;
}
```

**question**:
- **Difficult version upgrades:** Requires modification after official updates. - **Code conflicts:** Conflicts are prone to occur during multi-person development. - **Maintenance difficulties:** Custom and official code are mixed together. - **Debugging difficulties:** Difficulty in distinguishing the source of problems. #### 4.1.2 Advantages of Patch Architecture```javascript
// ✅ Patch Method - Standalone File Extension // xdyy_custom_actions_registry.js
global.registerCustomAction("myAction", async function(context) {
  // My processing logic - completely independent});
```

**Advantages**:
- **Zero Intrusion**: No modification to any official files. - **Easy Upgrade**: Official updates do not affect custom functions. - **Modular**: Functions are independent and easy to manage. - **Pluggable**: Functions can be enabled/disabled at any time. ### 4.2 Registry Mode Design #### 4.2.1 Core Idea: Use a global registry to store custom configurations, which the main program accesses through a standard interface.

```javascript
// Registry structure global = {
  customButtons: { // Button registry "button1": {...},
    "button2": {...}
  },
  customMenuTemplates: { // Menu registry "menu1": {...},
    "menu2": {...}
  },
  customActions: { // Action registry "action1": function() {...},
    "action2": function() {...}
  }
}
```

#### 4.2.2 Registration Mechanism```javascript
// Registration Interface - Simple and Intuitive global.registerButton("myButton", {
  name: "My Button"
  image: "myicon"
  templateName: "myMenu"
});

global.registerMenuTemplate("myMenu", {
  action: "myAction"
});

global.registerCustomAction("myAction", async function(context) {
  // Processing logic});
```

#### 4.2.3 Search Mechanism```javascript
// Main program searches for custom content if (global.customActions[actionName]) {
  // Execute a custom action: global.executeCustomAction(actionName, context);
} else {
  // Execute the built-in action this.executeBuiltinAction(actionName);
}
```

### 4.3 Four-Layer Architecture Analysis #### Architecture Layer Diagram```
┌────────────────────────────────────┐
Layer 1: Button Configuration Layer
│ xdyy_button_registry.js │
│ - Define button appearance and association │
└──────────────┬─────────────────────┘
               │
┌──────────────▼─────────────────────┐
Layer 2: Menu Template Layer
│ xdyy_menu_registry.js │
│ - Define menu structure and hierarchy │
└──────────────┬───────────────────────┘
               │
┌──────────────▼─────────────────────┐
Layer 3: Motion Processing Layer
│ xdyy_custom_actions_registry.js │
│ - Implement specific functional logic │
└──────────────┬─────────────────────┘
               │
┌──────────────▼─────────────────────┐
Layer 4: Tool Extension Layer
│ xdyy_utils_extensions.js │
│ - Extended utility functions and configuration │
└────────────────────────────────────┘
```

#### Responsibilities of Each Layer **Layer 1 - Button Configuration Layer**:
```javascript
// Responsibilities: Define the button's visuals and behavior. global.registerButton("custom15", {
  name: "makeCards", // Display name image: "makeCards", // Icon file templateName: "menu_makeCards" // Associated menu template});
```

**Layer 2 - Menu Template Layer**:
```javascript
// Responsibility: Define the interaction structure global.registerMenuTemplate("menu_makeCards", {
  action: "makeCards", // Default action onLongPress: { // Long press menu action: "menu",
    menuItems: [
      {action: "quickMake", menuTitle: "Quick Card Making"},
      {action: "batchMake", menuTitle: "Batch Card Production"}
    ]
  }
});
```

**Layer 3 - Action Processing Layer**:
```javascript
// Responsibility: Implement business logic global.registerCustomAction("makeCards", async function(context) {
  const {focusNote, focusNotes} = context;

  MNUtil.undoGrouping(() => {
    // The specific card-making logic focusNotes.forEach(note => {
      // Process each card});
  });
});
```

**Layer 4 - Tool Extension Layer**:
```javascript
// Responsibility: Provide general functionality. toolbarUtils.makeCard = function(note, options) {
  // General card creation function // Can be reused by multiple actions};
```

### 4.4 Configuring the Fusion Mechanism (Core Principles)

> 🔧 **Technical Depth**: This is the core of the entire patch architecture, enabling seamless integration of custom buttons and official buttons. #### 4.4.1 Integration Principle The integration of custom buttons and official buttons is achieved by **overriding the `getActions` method**:

**Step 1: Save the original method**
```javascript
// xdyy_button_registry.js
// First, save the official getActions method to avoid losing the original logic if (!toolbarConfig._originalGetActions) {
  toolbarConfig._originalGetActions = toolbarConfig.getActions;
}
```

**Step 2: Override the getActions method**
```javascript
// Override getActions, this method will be called by setToolbarButton. toolbarConfig.getActions = function() {
  // 1. Call the original method to get all the buttons defined by the official documentation. const defaultActions = toolbarConfig._originalGetActions
    ? toolbarConfig._originalGetActions.call(this)
    : {};

  // defaultActions now includes:
  // {
  // "copy": {name:"Copy", image:"copy", description:{...}},
  // "timer": {name:"Timer", image:"timer", description:{...}},
  // "custom1": {name:"Custom 1", image:"custom1", description:{...}},
  // "custom2": {name:"Custom 2", image:"custom2", description:{...}},
  // ... // All official buttons // }

  // 2. If no custom button is specified, return the official button directly. if (Object.keys(global.customButtons).length === 0) {
    return defaultActions;
  }

  // 3. Create a new collection of buttons object const allActions = {};

  // 4. 【Crucial】First add all custom buttons // This will override the official custom button with the same name for (const key in global.customButtons) {
    const button = Object.assign({}, global.customButtons[key]);

    // 5. Handle the conversion between templateName and description: if (button.templateName && !button.description && toolbarConfig.template) {
      button.description = toolbarConfig.template(button.templateName);
    }

    // 6. Clean up the temporary property: delete button.templateName;

    // 7. Add to the final collection (this will override the official button with the same name)
    allActions[key] = button;
  }

  // 8. Add non-custom official buttons (retain the core official function buttons)
  for (const key in defaultActions) {
    // Add only:
    // - Buttons that do not start with "custom" (such as copy, timer, undo, etc.)
    // - and not covered by a custom button if (!key.startsWith('custom') && !(key in allActions)) {
      allActions[key] = defaultActions[key];
    }
  }

  return allActions;
};
```

#### 4.4.2 Call Chain Analysis```
User opens toolbar ↓
webviewController.viewDidLoad()
    ↓
this.setToolbarButton(toolbarConfig.action)
    ↓
let actions = toolbarConfig.actions // getter trigger↓
toolbarConfig.getActions() // Call the overridden method ↓
Return to the merged button configuration ↓
Create an actual UIButton instance.

#### 4.4.3 Complete Flowchart```
┌─────────────────────────────────────────────┐
│ getActions() in the official utils.js │
│ Return to all official buttons including custom1-19 │
└─────────────────┬─────────────────────────────┘
                  │
                  ▼ Saved as _originalGetActions
┌─────────────────────────────────────────────┐
│ xdyy_button_registry.js rewrites getActions() │
│ 1. Call _originalGetActions to retrieve the official button │
│ 2. Override the custom button with a custom button │
│ 3. Retain official function buttons (copy, timer, etc.) │
└─────────────────┬─────────────────────────────┘
                  │
                  ▼ Return to the merged configuration ┌───────────────────────────────────────────────┐
│ Using buttons in webviewController.js │
| Create the actual button UI based on the returned configuration |
└─────────────────────────────────────────────┘
```

#### 4.4.4 Why is it designed this way?

1. **Non-intrusive:** Does not modify the official `getActions` implementation; simply wraps it. 2. **Backward Compatibility:** Automatically inherits new functionality if the official button is updated. 3. **Flexibility:** Can selectively override without affecting the core functionality of the official implementation. 4. **Recoverable:** The original behavior can be restored at any time via `_originalGetActions`.

## Part 5: Advanced and Expanded (30 minutes)

### Learning Objectives - ✅ Master multi-level menu design - ✅ Learn advanced interaction patterns - ✅ Master best practices - ✅ Optimize performance ### 5.1 Multi-level Menu Design Creating complex menu structures:

```javascript
// xdyy_menu_registry.js
global.registerMenuTemplate("menu_advanced", {
  action: "menu",
  menuWidth: 300,
  menuItems: [
    "⬇️ Basic Operations", // Group Title {
      action: "basicAction1",
      menuTitle: "Operation 1" // 4 spaces indentation},
    {
      action: "basicAction2",
      menuTitle: "Operation 2"
    },

    "⬇️ Advanced Features",
    {
      action: "menu", // Submenu menuTitle: "More Options➡️",
      menuItems: [
        {
          action: "subAction1",
          menuTitle: "Sub-function 1"
        },
        {
          action: "subAction2",
          menuTitle: "Sub-function 2"
        }
      ]
    }
  ]
});
```

### 5.2 Advanced Interaction Modes #### 5.2.1 Long Press and Double Tap Configuration ```javascript
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

#### 5.2.2 Selection List Interaction ```javascript
global.registerCustomAction("selectTemplate", async function(context) {
  const templates = [
    "📚 Study Notes",
    "💼 Meeting Minutes",
    "💡 Inspiration Notes",
    "📊 Data Analysis",
    🎯 Goal Planning
  ];

  // Create a selection menu const commandTable = templates.map(template => ({
    title: template,
    object: global,
    selector: 'applyTemplate:',
    param: {template, context}
  }));

  // Display menu MNUtil.getPopoverAndPresent(
    context.button,
    commandTable,
    200
  );
});
```

### 5.3 Best Practices #### 5.3.1 Error Handling Patterns ```javascript
global.registerCustomAction("safeAction", async function(context) {
  try {
    // Parameter validation if (!context || !context.focusNote) {
      MNUtil.showHUD("❌ Invalid context");
      return;
    }

    // Use MNUtil.undoGrouping(() => {
      // Dangerous operation performDangerousOperation();
    });

  } catch (error) {
    // Log errors if (toolbarUtils && toolbarUtils.addErrorLog) {
      toolbarUtils.addErrorLog(error, "safeAction");
    }

    // User-friendly error message MNUtil.showHUD(`❌ Operation failed: ${error.message || "Unknown error"}`);

    // Output detailed information in development mode if (typeof MNUtil !== "undefined" && MNUtil.log) {
      MNUtil.log(`Error details: ${error.stack}`);
    }
  }
});
```

#### 5.3.2 Batch Operation Optimization ```javascript
// Batch operation optimization global.registerCustomAction("optimizedBatch", async function(context) {
  const {focusNotes} = context;

  // Use a single undo group MNUtil.undoGrouping(() => {
    // Batch data collection to reduce API calls const noteData = focusNotes.map(note => ({
      id: note.noteId,
      title: note.noteTitle,
      color: note.colorIndex
    }));

    // Batch processing processBatch(noteData);

    // Batch update focusNotes.forEach((note, index) => {
      note.noteTitle = noteData[index].title;
      note.colorIndex = noteData[index].color;
    });
  });
});
```

#### 5.3.3 State Management ```javascript
// Use closures to preserve state(function() {
  // Private state let lastProcessedId = null;
  let processCount = 0;

  global.registerCustomAction("statefulAction", async function(context) {
    const {focusNote} = context;

    // Check if duplicate processing occurs if (focusNote.noteId === lastProcessedId) {
      MNUtil.showHUD("⚠️ This card has just been processed");
      return;
    }

    // Update the status: lastProcessedId = focusNote.noteId;
    processCount++;

    // Perform the operation MNUtil.undoGrouping(() => {
      focusNote.appendComment(`Processing order: #${processCount}`);
    });

    MNUtil.showHUD(`✅ Processed(Total: ${processCount})`);
  });
})();
```

### 5.4 Performance Optimization #### 5.4.1 Big Data Processing ```javascript
global.registerCustomAction("largeDataProcess", async function(context) {
  const {focusNotes} = context;
  const total = focusNotes.length;

  if (total > 100) {
    MNUtil.showHUD("⚠️ Large amount of data, please wait patiently");
  }

  // Batch processing const batchSize = 50;
  for (let i = 0; i < total; i += batchSize) {
    const batch = focusNotes.slice(i, i + batchSize);

    MNUtil.undoGrouping(() => {
      batch.forEach(note => {
        // Processing logic});
    });

    // Update progress const progress = Math.min(100, Math.round(((i + batchSize) / total) * 100));
    MNUtil.showHUD(`⏳ Processing progress: ${progress}%`);

    // Relinquish execution control to avoid blocking await MNUtil.delay(0.01);
  }

  MNUtil.showHUD(`✅ Completed processing of ${total} cards`);
});
```

#### 5.4.2 Cache Optimization ```javascript
// Cache management const cache = {
  data: null,
  timestamp: 0,
  TTL: 5 * 60 * 1000 // Expires in 5 minutes;

global.registerCustomAction("cachedAction", async function(context) {
  const now = Date.now();

  // Check if the cache is valid if (cache.data && (now - cache.timestamp) < cache.TTL) {
    MNUtil.log("Using cached data");
    return cache.data;
  }

  // Recalculate MNUtil.log("Recalculate data");
  const result = await expensiveCalculation();

  // Update cache.data = result;
  cache.timestamp = now;

  return result;
});
```

---

## Appendix A: API Quick Reference Guide ### MNNote API

```javascript
// Get the card const focusNote = MNNote.getFocusNote() // The currently selected card const focusNotes = MNNote.getFocusNotes() // All selected cards const note = MNNote.new(noteId) // Get the card by ID // Card attribute note.noteId // Card ID
note.noteTitle // Title note.excerptText // Excerpt Text note.noteURL // Card Link note.colorIndex // Color Index (0-15)
note.fillIndex // 填充样式索引note.mindmapBranchIndex // 脑图分支样式note.tags // 标签数组note.comments // 评论数组note.parentNote // 父卡片note.childNotes // 子卡片数组note.linkedNotes // 链接的卡片// 卡片方法note.appendComment(text) // 添加文本评论note.appendHtmlComment(html) // 添加HTML 评论note.appendTags(["tag1", "tag2"]) // 添加标签note.removeCommentAtIndex(0) // 删除评论note.addChild(childNote) // 添加子卡片note.removeFromParent() // 从父卡片移除note.toBeIndependent() // 转为独立卡片note.merge(anotherNote) // 合并卡片note.focusInMindMap(duration) // 在脑图中聚焦note.focusInDocument() // 在文档中聚焦note.paste() // 粘贴剪贴板内容note.clearFormat() // 清除格式```

### MNUtil API

```javascript
// UI 反馈MNUtil.showHUD(message) // 显示提示信息MNUtil.confirm(title, message) // 显示确认对话框MNUtil.alert(title, message) // 显示警告对话框// 剪贴板MNUtil.copy(text) // 复制文本MNUtil.copyJSON(object) // 复制JSON 对象MNUtil.copyImage(imageData) // 复制图片MNUtil.clipboardText // 获取剪贴板文本// 撤销管理MNUtil.undoGrouping(() => { // 创建撤销组// 多个操作作为一次撤销})

// 异步控制await MNUtil.delay(seconds) // 延迟执行MNUtil.animate(() => { // 动画执行// UI 变化}, duration)

// 系统信息MNUtil.studyMode // 学习模式MNUtil.currentNotebookId // 当前笔记本ID
MNUtil.currentDocmd5 // 当前文档MD5
MNUtil.currentWindow // 当前窗口MNUtil.studyView // 学习视图MNUtil.version // 版本信息// 选择和选中MNUtil.selectionText // 选中的文本MNUtil.currentSelection // 当前选择对象// 通知MNUtil.postNotification(name, userInfo) // 发送通知MNUtil.addObserver(target, selector, name) // 添加观察者MNUtil.removeObserver(target, name) // 移除观察者// 工具函数MNUtil.log(message) // 输出日志MNUtil.openURL(url) // 打开URL
MNUtil.refreshAddonCommands() // 刷新插件命令```

### toolbarConfig API

```javascript
// 配置管理toolbarConfig.save(key, value) // 保存配置toolbarConfig.load(key) // 加载配置toolbarConfig.getWindowState(key) // 获取窗口状态toolbarConfig.setWindowState(key, value) // 设置窗口状态// 按钮和动作toolbarConfig.action // 当前工具栏按钮数组toolbarConfig.dynamicAction // 动态工具栏按钮数组toolbarConfig.getDescriptionById(id) // 获取动作描述toolbarConfig.getDesByButtonName(name) // 通过按钮名获取描述toolbarConfig.imageConfigs // 图标配置// 工具栏状态toolbarConfig.dynamic // 是否动态模式toolbarConfig.vertical() // 是否垂直布局toolbarConfig.horizontal() // 是否水平布局```

### UIKit API

```javascript
// 按钮UIButton.buttonWithType(type)
button.setTitleForState(title, state)
button.setImageForState(image, state)
button.addTargetActionForControlEvents(target, action, events)
button.removeTargetActionForControlEvents(target, action, events)

// 颜色UIColor.whiteColor()
UIColor.blackColor()
UIColor.colorWithHexString("#FF0000")
color.colorWithAlphaComponent(0.5)

// 弹窗UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
  title,
  message,
  style, // 0: 默认, 1: 密码, 2: 输入框cancelTitle,
  otherTitles, // 数组callback // (alert, buttonIndex) => {}
)

// 手势gesture.state // 1: began, 2: changed, 3: ended
gesture.locationInView(view)
```

---

## 附录B：代码模板库### 模板1：基础按钮```javascript
// === Button Registration ===
global.registerButton("customXX", {
  name: "Function Name",
  image: "customXX",
  templateName: "menu_function"
});

// === Menu Definition ===
global.registerMenuTemplate("menu_function", {
  action: "functionAction"
});

// === Functionality Implementation ===
global.registerCustomAction("functionAction", async function(context) {
  const focusNote = MNNote.getFocusNote();

  if (!focusNote) {
    MNUtil.showHUD("❌ Please select a card first");
    return;
  }

  MNUtil.undoGrouping(() => {
    // Your function code MNUtil.showHUD("✅ Complete");
  });
});
```

### Template 2: Button with Menu ```javascript
// === Menu Definition ===
global.registerMenuTemplate("menu_complex", {
  action: "defaultAction",
  onLongPress: {
    action: "menu",
    menuWidth: 200,
    menuItems: [
      {action: "option1", menuTitle: "Option 1"},
      {action: "option2", menuTitle: "Option 2"}
    ]
  }
});
```

### Template 3: User input ```javascript
global.registerCustomAction("userInput", async function(context) {
  UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
    "title",
    "Prompt message",
    2, // Input box "Cancel",
    ["Sure"],
    (alert, buttonIndex) => {
      if (buttonIndex === 1) {
        const input = alert.textFieldAtIndex(0).text;
        // Process input}
    }
  );
});
```

### Template 4: Batch Processing ```javascript
global.registerCustomAction("batchProcess", async function(context) {
  const focusNotes = MNNote.getFocusNotes();

  if (!focusNotes || focusNotes.length === 0) {
    MNUtil.showHUD("❌ Please select a card");
    return;
  }

  MNUtil.undoGrouping(() => {
    let count = 0;

    focusNotes.forEach(note => {
      // Count up for each card;
    });

    MNUtil.showHUD(`✅ ${count} cards were processed`);
  });
});
```

---

## 附录C：完整示例- 批量制卡这是一个完整的批量制卡功能示例，展示了所有概念的综合应用：

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

## 附录D：开发检查清单在发布你的扩展之前，请确保：

### 功能检查- [ ] 所有按钮都能正常显示- [ ] 点击、长按、双击功能都正常- [ ] 菜单能正确弹出和导航- [ ] 错误处理完善，不会崩溃- [ ] 撤销功能正常工作### 代码质量- [ ] 使用有意义的函数和变量名- [ ] 添加必要的注释- [ ] 遵循一致的代码风格- [ ] 没有调试代码遗留- [ ] 没有硬编码的测试数据### 性能优化- [ ] 批量操作使用单个撤销组- [ ] 大量数据处理有进度反馈- [ ] 避免不必要的API 调用- [ ] 及时清理资源和监听器### 用户体验- [ ] 操作有明确的反馈（HUD 提示）
- [ ] 错误信息友好易懂- [ ] 危险操作有确认提示- [ ] 图标清晰易识别### 文档完善- [ ] README 说明功能和用法- [ ] 列出所有依赖项- [ ] 提供安装指南- [ ] 包含常见问题解答---

## 常见问题FAQ

### Q1: What should I do if the button is not displayed?

**Inspection Steps**:
1. Confirm the file has been saved. 2. Exit MarginNote completely (Cmd+Q).
3. 重新打开4. 检查代码中的按钮名称是否正确**代码检查**：
```javascript
// 在xdyy_button_registry.js 的registerAllButtons 末尾添加：
MNUtil.log("按钮注册完成，共注册: " + Object.keys(global.customButtons).length + " 个按钮");

// 在每个xdyy_*.js 文件开头添加：
MNUtil.log("✅ 正在加载: [文件名]");
```

### Q2: 点击按钮没反应？

**Possible reasons:**
- Action name mismatch - Function syntax error - No action registered **Solution**:
```javascript
// 添加日志调试global.registerCustomAction("myAction", async function(context) {
  MNUtil.log("🚀 动作被触发: myAction");
  MNUtil.showHUD("动作开始执行");

  // 原有代码...
});
```

### Q3: 代码报错怎么办？

**Debugging Techniques**:
```javascript
try {
  // Your code} catch (error) {
  MNUtil.showHUD("Error: " + error.message);
  MNUtil.log("Detailed error: " + error);
}
```

### Q4: 撤销不工作？

**正确使用撤销组**：
```javascript
MNUtil.undoGrouping(() => {
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

### Q5: 内存泄漏怎么办？

**使用闭包管理资源**：
```javascript
(function() {
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

## 🎓 结语恭喜你完成了MN Toolbar 开发培训完全指南的学习！

### 你已经掌握了- ✅ **基础开发**：创建按钮、定义菜单、实现功能- ✅ **核心原理**：事件机制、菜单系统、动作处理- ✅ **补丁架构**：注册表模式、四层架构、配置融合- ✅ **进阶技术**：多级菜单、用户交互、性能优化- ✅ **调试技巧**：日志输出、错误处理、问题排查### 下一步建议1. **实践项目**：基于本指南创建3-5个实用功能2. **深入研究**：阅读utils.js 源码，理解更多API
3. **社区贡献**：分享你的功能给其他用户4. **持续学习**：关注官方更新，学习新特性### 学习资源- 📖 本指南：随时查阅技术细节- 💬 用户社区：加入MN 用户群交流- 🔍 源码研究：深入理解实现原理- 📝 实践笔记：记录你的学习心得### 记住核心原则1. **分离关注点**：按钮、菜单、动作、工具各司其职2. **注册而非修改**：通过注册表添加功能3. **上下文驱动**：通过context 对象传递所有信息4. **用户至上**：始终提供清晰的反馈无论你是想添加一个简单的快捷操作，还是构建复杂的工作流系统，这个架构都能满足你的需求。

**记住**：编程是一个渐进的过程，每天进步一点点！

Happy Coding! 🚀

---

*本指南基于MN Toolbar 实际源码编写，融合了开发指南的技术深度与培训教程的友好性。*

*版本：2024.12 | 综合优化版*
