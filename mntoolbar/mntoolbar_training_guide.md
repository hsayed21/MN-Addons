# 📚 MN Toolbar Plugin Development Training Tutorial > 🎯 **Course Objectives**: Beginners will master MN Toolbar plugin development within 3 hours, enabling them to independently create practical functions. ## Course Outline | Modules | Duration | Content | Practice |
|------|------|------|------|
| Module 1 | 30 minutes | Introduction to MN Toolbar | Environment Setup |
| Module Two | 45 minutes | First Button | Hello MN |
| Module 3 | 45 minutes | Understanding the working principle | Debugging exercises |
| Module Four | 60 minutes | Hands-on Function Development | 3 Practical Functions |
| Module 5 | 30 minutes | Advanced and Extension | Comprehensive Exercises |

---

## 📖 Module 1: Getting to Know the MN Toolbar (30 minutes)

### Learning Objectives - ✅ Understand what the MN Toolbar plugin is - ✅ Understand what the plugin can do - ✅ Set up the development environment ### 1.1 What is a plugin?

> 💡 **Analogy in Daily Life**: Plugins are like installing apps on a phone; imagine adding new features to MarginNote:
- **MarginNote** = Smartphone - **MN Toolbar** = A Super App
- **Your code** = The new MN Toolbar feature in the app allows you to add custom buttons to MarginNote, each button performing a specific function, such as:
- 🕐 One-click timestamp addition - 🏷️ Batch tag addition - 📝 Quick card creation - 🎨 Automatic formatting ### 1.2 Let's see the final result Before we begin, let's see what you can make:

```
MarginNote Interface ├── Your Notebook ├── Document └── Toolbar ← This is the MN Toolbar!
    ├── [Timestamp] button ← You created ├── [Bulk Tags] button ← You created └── [More...] button ← You created

After clicking the button:
- Execute the function immediately - or display menu options - or pop up an input box ### 1.3 Development Environment Preparation #### 📁 Locate the plugin folder **macOS path**:
bash
~/Library/Containers/QReader.MarginStudyMac/Data/Library/MarginNote Extensions/mntoolbar
```

**Quick Open Method**:
1. Open Finder
2. Press `Cmd + Shift + G`
3. Paste the path above #### 🛠️ Tools needed:
- 📝 Text editor (VSCode recommended)
- 🖼️ Icon file (40×40 pixel PNG)
- 📱 MarginNote 3

#### 📂 Understanding File Structure```
mntoolbar/
├── 📜 main.js # Main gate (no need to modify)
├── 📜 utils.js # Toolbox (No need to modify)
├── 📜 webviewController.js # Control Center (No need to modify)
├── 📜 settingController.js # Settings interface (no need to modify)
│
└── 🎯 The file you want to modify:
    ├── xdyy_button_registry.js # Define buttons ├── xdyy_menu_registry.js # Define menus └── xdyy_custom_actions_registry.js # Define functions

> ⚠️ **Important Reminder**: Never modify the first 4 files; only modify files that start with `xdyy_`!

### 🎯 Hands-on Exercise 1: Environment Verification 1. Locate and open the mntoolbar folder. 2. Ensure you can see the files mentioned above. 3. Open `xdyy_button_registry.js` with an editor.
4. Locate lines 47-51 and you will see code similar to this:
   ```javascript
   global.registerButton("custom15", {
     name: "Card Making"
     image: "makeCards",
     templateName: "menu_makeCards"
   });
   ```

✅ If you can see these, the environment is ready!

---

## 🚀 Module Two: The First Button (45 minutes)

### Learning Objectives - ✅ Create your first "Hello MN" button - ✅ Understand the three elements of a button - ✅ See the button appear in the toolbar ### 2.1 The Three Elements of a Button > 💡 **Restaurant Analogy**: Creating a button is like ordering food at a restaurant | Elements | Restaurant Analogy | Code Location |
|------|----------|----------|
| **Button** | Menu item name | xdyy_button_registry.js |
| **Menu** | How to make this dish | xdyy_menu_registry.js |
| **Actions** | Chef cooking | xdyy_custom_actions_registry.js |

### 2.2 Creating the Hello MN Button #### Step 1: Register the button (tell the system that this button exists)

Open `xdyy_button_registry.js`, and add the following at the end of the `registerAllButtons()` function (around line 144, before `custom19`):

```javascript
// My first button!
global.registerButton("custom16", {
  name: "Hello", // Text displayed on the button image: "custom16", // Icon using custom16.png templateName: "menu_hello" // Associated menu template});
```

Step 2: Define the menu (what to do when the button is clicked)

Open `xdyy_menu_registry.js` and add the following to the end of the file:

```javascript
// Menu configuration for the Hello button: global.registerMenuTemplate("menu_hello", {
  action: "sayHello" // Execute the sayHello action});
```

Step 3: Implement the function (what exactly does it do)

Open `xdyy_custom_actions_registry.js` and add the following to the end of the file:

```javascript
// Implementation of the Hello function global.registerCustomAction("sayHello", async function(context) {
  // MNUtil.showHUD will display a tooltip on the screen: MNUtil.showHUD("🎉 Hello MN Toolbar!");

  // Get the currently selected card const focusNote = MNNote.getFocusNote();

  if (focusNote) {
    // If a card is selected, display its title MNUtil.showHUD("Card Title: " + (focusNote.noteTitle || "Untitled"));
  } else {
    // No card selected. MNUtil.showHUD("Please select a card first");
  }
});
```

### 2.3 Test your button 1. **Save all files**
2. **Completely exit MarginNote** (Cmd+Q)
3. **Reopen MarginNote**
4. **Open toolbar settings**:
   - Click the settings button in the toolbar - Find the "Hello" button - Drag it to toolbar 5. **Click the Hello button**
6. **You will see the "🎉 Hello MN Toolbar!" notification.**

🎉 Congratulations! You've created your first feature!

### 2.4 Understanding the Code Flow```
The user clicks the Hello button ↓
The system searches for the configuration file for custom16 (xdyy_button_registry.js).
    ↓
Find templateName: "menu_hello"
    ↓
Find the menu_hello template (xdyy_menu_registry.js)
    ↓
Found the action: "sayHello"
    ↓
Execute the sayHello function (xdyy_custom_actions_registry.js)
    ↓
Displays "Hello MN Toolbar!"
```

### 🎯 Hands-on Exercise 2: Modify the `sayHello` function to make it:
1. Display the current time. 2. If a card is selected, add the time **hint code** after the title:
```javascript
global.registerCustomAction("sayHello", async function(context) {
  // Get the current time const now = new Date().toLocaleString('zh-CN');
  MNUtil.showHUD("Current time: " + now);

  // Get the selected card const focusNote = MNNote.getFocusNote();
  if (focusNote) {
    // Use the undo grouping feature so users can undo MNUtil.undoGrouping(() => {
      focusNote.noteTitle = (focusNote.noteTitle || "") + " [" + now + "]";
      MNUtil.showHUD("✅ Timestamp added");
    });
  }
});
```

---

## 🔍 Module 3: Understanding How It Works (45 minutes)

### Learning Objectives - ✅ Understand the complete button click process - ✅ Learn debugging and troubleshooting - ✅ Master commonly used APIs

### 3.1 Detailed Explanation of Working Principle > 💡 **Express Delivery Analogy**: Clicking the button is like sending a package.
Send (user clicks)
    ↓
Track your courier order (configure the search button)
    ↓
Sorting Center (Get Menu Template)
    ↓
Delivery (find the corresponding action)
    ↓
Sign for receipt (execute function)
```

### 3.2 Core Concepts #### Context Object (Execution Context)

Each action function will receive a `context` object, which contains:

```javascript
context = {
  button: button, // The button that was clicked des: des, // Action description focusNote: focusNote, // The currently selected card focusNotes: focusNotes, // All selected cards self: controller // The controller object
```

**Practical Use**:
```javascript
global.registerCustomAction("myAction", async function(context) {
  // Destructuring to obtain the required object const { focusNote, focusNotes } = context;

  if (focusNote) {
    // Process a single card MNUtil.showHUD("Processing card: " + focusNote.noteTitle);
  }

  if (focusNotes && focusNotes.length > 1) {
    // Handle multiple cards MNUtil.showHUD(`${focusNotes.length} cards are selected`);
  }
});
```

### 3.3 Debugging Techniques #### 1. Use log output for ```javascript`
// Add a log to your code: MNUtil.log("🔍 Debugging: Entering the sayHello function");
MNUtil.log("📦 focusNote: " + focusNote);
MNUtil.log("✅ Execution successful");
```

#### 2. Display object content ```javascript
// Copy the object to the clipboard to view MNUtil.copyJSON(focusNote);
MNUtil.showHUD("Object has been copied to clipboard");
```

#### 3. Error Handling ```javascript
global.registerCustomAction("safeAction", async function(context) {
  try {
    // Your code const focusNote = MNNote.getFocusNote();
    if (!focusNote) {
      throw new Error("No card selected");
    }

    // Processing logic focusNote.noteTitle = "Processed";
    MNUtil.showHUD("✅ Success");

  } catch (error) {
    // Display error MNUtil.showHUD("❌ Error: " + error.message);
    MNUtil.log("Error details: " + error);
  }
});
```

### 3.4 Troubleshooting Common Problems | Problem | Cause | Solution |
|------|------|----------|
| Button not displayed | MN not restarted | Restart after complete exit |
| Clicking has no effect | Action name mismatch | Check if the names in the three files are consistent |
| Displays "Not supported" | Action not registered | Confirmed to be registered in xdyy_custom_actions_registry.js |
| Function error | Syntax error in code | View logs and correct errors |

### 🎯 Hands-on Exercise 3: Add Debugging Information Add debug logs to your `sayHello` function:

```javascript
global.registerCustomAction("sayHello", async function(context) {
  MNUtil.log("🚀 Start executing sayHello");

  const { focusNote, focusNotes } = context;
  MNUtil.log(`📦 Number of selected cards: ${focusNotes ? focusNotes.length : 0}`);

  try {
    if (focusNote) {
      MNUtil.log("✅ Found the focused card: " + focusNote.noteId);
      // Your processing logic} else {
      MNUtil.log("⚠️ No card selected");
    }
  } catch (error) {
    MNUtil.log("❌ Error: " + error);
  }

  MNUtil.log("🏁 sayHello execution completed");
});
```

---

## 💼 Module Four: Practical Functionality Development (60 minutes)

### Learning Objectives - ✅ Develop 3 practical functions - ✅ Learn the menu system - ✅ Master user interaction ### 4.1 Function 1: Smart Timestamp > Requirement: Click to add a timestamp, long press to display more options #### Complete Implementation **Step 1: Register Button** (xdyy_button_registry.js)
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

### 4.2 Function 2: Batch Labeling > Requirement: Add labels to multiple selected cards in batches **Complete Implementation** (xdyy_custom_actions_registry.js):
```javascript
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

### 4.3 Function 3: Quick Template > Requirement: Click to apply the preset template and set a uniform format for the cards. **Step 1: Define the template menu** (xdyy_menu_registry.js)
```javascript
global.registerMenuTemplate("menu_template", {
  action: "menu",
  menuWidth: 250,
  menuItems: [
    {
      action: "applyAcademicTemplate",
      menuTitle: "📚 Academic Notes"
    },
    {
      action: "applyMeetingTemplate",
      menuTitle: "💼 Meeting Minutes"
    },
    {
      action: "applyIdeaTemplate",
      menuTitle: "💡 Inspiration Notes"
    }
  ]
});
```

**Step 2: Implement template functionality** (xdyy_custom_actions_registry.js)
```javascript
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

### 🎯 Hands-on Exercise 4: Create Your Own Feature Based on the example above, create a "Clean Format" feature:
1. Clear all formatting from the cards. 2. Set all cards to the specified color. 3. Delete all tags. Tip: Use `focusNote.clearFormat()` and `focusNote.tags = []`.

---

## 🚀 Module Five: Advanced and Expanded (30 minutes)

### Learning Objectives - ✅ Master multi-level menus - ✅ Optimize user experience - ✅ Publish and share ### 5.1 Multi-level menu design: Creating complex menu structures:

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

### 5.2 Best Practices Summary #### 1. Always use `undo grouping` in JavaScript
MNUtil.undoGrouping(() => {
  // All modifications});
```

#### 2. Provide clear user feedback.
MNUtil.showHUD("⏳ Processing..."); // Start MNUtil.showHUD("✅ Success"); // Success MNUtil.showHUD("❌ Failure: " + error.message); // Failure```

#### 3. Handling Boundary Cases ```javascript
if (!focusNote) {
  MNUtil.showHUD("❌ Please select a card first");
  return;
}
```

#### 4. Performance Optimization ```javascript
// Display progress during batch operations focusNotes.forEach((note, index) => {
  // Handle if (index % 10 === 0) {
    const progress = Math.round((index / focusNotes.length) * 100);
    MNUtil.showHUD(`⏳ Progress: ${progress}%`);
  }
});
```

### 5.3 Quick Reference for Commonly Used APIs #### Card Operations ```javascript
// Get MNNote.getFocusNote() // Current card MNNote.getFocusNotes() // All selected // Properties note.noteTitle // Title note.excerptText // Excerpt note.comments // Array of comments note.tags // Array of tags note.colorIndex // Color (0-15)

// Method note.appendComment(text) // Adds a comment note.appendTags([tags]) // Adds tags note.clearFormat() // Clears formatting

#### Utility Methods ```javascript
MNUtil.showHUD(message) // Show message MNUtil.copy(text) // Copy text MNUtil.undoGrouping(() => {}) // Undo grouping MNUtil.delay(seconds) // Delay MNUtil.log(message) // Log message

### 🎯 Comprehensive Exercise: Create Your Toolset Create a toolset button that includes the following functions:
1. Quick format (clear format + set color)
2. Batch processing (adding tags to all sub-cards)
3. Export information (copy all card titles to clipboard)

---

## 📚 Appendix A: Learning Path Map ### 5-Day Learning Plan ```mermaid
graph LR
    Day 1 [Environment Setup: Hello Button] --> Day 2 [Understanding Principles: Simple Functionality]
    Day 2 --> Day 3 [Day 3<br/>Menu System<br/>User Interaction]
    Day 3 --> Day 4 [Day 4<br/>Batch Operations<br/>Error Handling]
    Day 4 --> Day 5 [Day 5 Comprehensive Practice Posting and Sharing]
```

### Skills Checklist - [ ] **Basic Skills**
  - [ ] Can find and open plugin folders - [ ] Can create and display custom buttons - [ ] Can implement click-to-execute functionality - [ ] **Advanced Skills**
  - [ ] Can create multi-level menus - [ ] Can process user input - [ ] Can perform batch operations on cards - [ ] **Advanced Skills**
  - [ ] Can handle errors and exceptions - [ ] Can optimize performance - [ ] Can debug and troubleshoot ---

## 📚 Appendix B: Frequently Asked Questions (FAQ)

### Q1: What should I do if the button is not displayed?

**Inspection Steps**:
1. Confirm the file has been saved. 2. Exit MarginNote completely (Cmd+Q).
3. Reopen 4. Check if the button names in the code are correct ### Q2: Clicking the button has no effect?

**Possible reasons:**
- Action name mismatch - Function syntax error - No action registered **Solution**:
```javascript
// Add log debugging MNUtil.log("Button was clicked");
MNUtil.showHUD("Test");
```

### Q3: How do I view the logs?

**How ​​to view the macOS Console:**
1. Open the "Console" application. 2. Search for "MarginNote".
3. Check the relevant logs ### Q4: What should I do if there is a code error?

**Debugging Techniques**:
```javascript
try {
  // Your code} catch (error) {
  MNUtil.showHUD("Error: " + error.message);
  MNUtil.log("Detailed error: " + error);
}
```

### Q5: How do I share my features?

1. Organize your code. 2. Add comments. 3. Export xdyy_*.js files. 4. Share with other users.

## 📚 Appendix C: Code Template Library ### Template 1: Basic Button ```javascript
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

## 🎓 Conclusion Congratulations on completing the MN Toolbar plugin development training!

You have already learned:
- ✅ Create custom buttons - ✅ Implement practical functions - ✅ Handle user interactions - ✅ Debug and optimize ### Next Steps 1. **Exercise**: Create more functions based on templates 2. **Explore**: See more APIs in utils.js
3. **Share**: Share your features with the community. 4. **Advanced**: Learn to implement more complex features. ### Get Help - 📖 View this tutorial - 💬 Join the MN user community - 🔍 Search for existing solutions - ❓ Attach your code and error message when asking questions. **Remember**: Programming is a gradual process; improve a little bit every day!

---

*This tutorial is based on the actual source code of MN Toolbar, and all examples can be run directly.*

*Version: 2024.12 | Author: MN Toolbar Development Team*
