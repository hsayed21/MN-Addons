---
applyTo: '*'
description: 'If you do not understand what I want or if you think I have not made it clear, please donot guess and ask me directly. It is strictly forbidden to create non-existent APIs out of thin air! If you want to use any API that does not appear before, you must search all plug-in files to confirm that it actually exists and can be used. If the user asks you to analyze any functional code and generate a Markdown document, if I do not tell you the specific document path, the `.md` document will be generated to [another path](/Users/xiakangwei/Nutstore/Obsidian/IOTO/1-Input/Fragment Notes/MarginNote) by default. Markdown documents are written strictly in UTF-8 encoding! If the user asks you to refer to the plug-ins in this directory, you will not refer to them by default:  - Gotopage - mntask - mntoolbar/mntoolbar'
---

# MarginNote 4 Plug-in Development Guide

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

# Git workflow specification

In principle, you are not allowed to do git commit and push without my permission.

## GitHub Issue Workflow Specification

### Overview
Standardized GitHub issue management process ensures professionalism and traceability of issue tracking.

### 1. Problem discovery and recording
When problems are discovered during development:
- Create a temporary log file (such as `fix_summary.md`)
- Detailed records:
  - Problem phenomenon
  - Steps to reproduce
  - Cause analysis
  - Solution

### 2. Code repair process
-Fix in local branch
- Make sure the fix is fully tested
- Keep code changes atomic (one commit solves one problem)
- Avoid mixing multiple unrelated changes in one commit

### 3. Submission specifications
```bash
# 1. Add modified files
git add [modified file]

# 2. Create semantic submission
git commit -m "fix: briefly describe the repair content

- Detailed description of the fixed issue (#issue-number)
- List the main changes
-Describe the scope of influence"

# 3. Push to remote warehouse
git push [remote-name] [branch-name]
```

### 4. Create Issue
**Important Principle**: Issues must be created after the code is submitted and pushed.

```bash
gh issue create \
  --title "[Plug-in name] Brief description of the problem" \
  --body "## Problem description
Describe the problem in detail...

## Reproduction steps
1. Step 1
2. Step 2
3. ...

## Cause analysis
Explain the root cause of the problem...

## Solution
Describe the solution adopted...

## Related code
- Fix location: [GitHub code permalink]
- Commit: [commit hash]

## Repair status
✅ Fixed in [branch] branch" \
  --label "plugin name" \
  --label "bug/feature/enhancement"
```

### 5. Issue update best practices

#### Permalink using code
```
https://github.com/[username]/[warehouse name]/blob/[commit-hash]/[file path]#L[line number]
```
Example:
```
https://github.com/xkwxdyy/MN-Addons/blob/0a16a5805278ffa676a7365c22361e94d16d1876/mntask/xdyy_utils_extensions.js#L538-L546
```

#### Update Issue comments
```bash
gh issue comment [issue-number] --body "Fixed in commit [hash]

### Related code links:
- [Specific fix description]: [Code permanent link]

### Repair instructions:
[Details of the repair]"
```

### 6. Close Issue
```bash
# Close after verifying the repair
gh issue close [issue-number] --comment "Fixed and verified"

# Or simply close
gh issue close [issue-number]
```

### 7. Complete workflow example

Take the TaskFieldUtils method name conflict problem as an example:

1. **Problem found**: All field content extraction returns null
2. **Analysis of reasons**: It was found that a method with the same name exists, causing overwriting
3. **Local fix**: Rename method to `extractFieldText`
4. **Test verification**: Confirm that the field content can be extracted correctly
5. **Submit code**:
   ```bash
   git add xdyy_utils_extensions.js
   git commit -m "fix: Fix TaskFieldUtils method name conflict causing field extraction failure (#3)"
   git push github dev
   ```
6. **Create Issue**: including problem description, cause analysis, and solution
7. **Update Issue**: Add specific code link
8. **Close Issue**: Close after confirming the repair

### 8. Precautions

#### Tag usage specifications
- **Plug-in tag**: must be added (such as `mntask`, `mnai`)
- **Type Tag**:
  - `bug`: bug fix
  - `feature`: new function
  - `enhancement`: functional improvements
  - `documentation`: Documentation update

#### Code link requirements
- Use permalinks containing commit hash
- Link to specific lines or blocks of code
- Provide links to multiple relevant locations

#### Issue description specification
- The title is concise and clear, including the plug-in name
- Text structure, using Markdown format
- Contains sufficient contextual information
- Provide steps to reproduce (if applicable)

#### Timing
- **Code first, Issue second**: Ensure that the code is already in the warehouse when the Issue is created
- **Timely updates**: Important progress will be updated in Issue comments in a timely manner
- **Timely closure**: Timely closure after the problem is solved to avoid backlog

### 9. Batch processing techniques

When fixing multiple related issues at once:
```bash
# 1. Fix multiple issues with one submission
git commit -m "fix: Fix multiple problems with MNTask card printing function

- Fix issue A (#1)
- Fix issue B (#2)
- Fix issue C (#3)"

# 2. Update each Issue separately
for issue in 1 2 3; do
  gh issue comment $issue --body "Fixed in commit [hash]
  Related code: [corresponding code link]"
done

# 3. Batch close
gh issue close 1 2 3
```

### 10. Document maintenance

- Solutions to important issues should be logged to CLAUDE.md
- Common solutions can be organized into best practices
- Regularly review and update documents to keep them current

## Important reminder for Git operations (2025-01-17)

### Key matters
1. **Must push after submission**: After completing git commit, you must remember to execute git push to push to the remote warehouse
2. **Remote warehouse name**: The remote warehouse name of the MN-Addon project is `github`, not the default `origin`

### Correct Git workflow
```bash
# 1. Add files
git add [filename]

# 2. Commit changes
git commit -m "commit information"

# 3. Push to remote warehouse (important!)
git push origin [branch name]
```

### Common mistakes
```bash
# ✅ Correct: use origin
git push origin dev

# ❌ Error: using github
git push github dev
```

### Check remote warehouse configuration
```bash
# View the currently configured remote warehouse
git remote -v

# Output example:
# github https://github.com/xkwxdyy/MN-Addons.git (fetch)
# github https://github.com/xkwxdyy/MN-Addons.git (push)
```

### Important reminder
- Before creating a GitHub Issue, make sure the code has been pushed to the remote repository
- Use `git push origin [branch name]` instead of `git push github [branch name]`
- If you forget to push, the code link referenced in the Issue will be inaccessible
## UIAlertView API usage specifications (extremely important!⚠️)

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
