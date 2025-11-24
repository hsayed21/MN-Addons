
# MNUtils API Reference Guide

## ⚠️ Important Note

1. **This document is for reference only; the source code shall prevail.**
   - Before using the API, please search for and confirm the method exists in `mnutils.js` or `xdyyutils.js`.
   - There may be omissions in the documentation or the version may not have been synchronized in a timely manner after the update.

2. **API Source Differentiation**
   - `mnutils.js`: The core API, usable by all plugins.
   - `xdyyutils.js`: Academic extension API, requires additional loading.
   - Some methods are implemented as prototype extensions in xdyyutils.js

3. **Important Changes to xdyyutils.js**
   The default value of the `alert` parameter in `MNUtil.getNoteById(noteId, alert)` has been changed from true to false.
   The default value of the `msg` parameter in `MNNote.prototype.moveComment(from, to, msg)` has been changed from true to false.
   - Please note the changes to these default values ​​when using them.

### Core Document Description
| Document | Scale | Function | Importance |
|------|------|------|--------|
| **mnutils.js** | 8,439 lines | Core API encapsulation, providing 10 main classes | ⭐⭐⭐⭐⭐ |
| **xdyyutils.js** | 15,560+ lines | Academic scenario expansion, 13 card types | ⭐⭐⭐⭐ |
| **main.js** | - | Plugin entry point, business logic implementation | ⭐⭐⭐ |
| **mnaddon.json** | - | Plugin Configuration List | ⭐⭐⭐ |

### Technology Stack
- **Development Language:** JavaScript ES6+ (supports async/await)
- **Operating Platform:** MarginNote 3/4 Plugin System
- **UI Framework**: UIKit (called via JSBridge)
- **Data storage:** CoreData (wrapped as a JavaScript API)
- **Design Patterns**: Static Utility Class, Factory Pattern, Decorator Pattern

## 📖 Core API Reference - mnutils.js

mnutils.js is the core of the MNUtils framework, providing 10 main classes and over 500 API methods. These APIs cover all the core functionalities of MarginNote.

### 🔧 Overview of MNUtils Core Classes

| Class Name | Lines of Code | Main Functionality | Number of APIs |
|------|----------|----------|----------|
| **Menu** | 1-171 | Pop-up Menu UI Component | 12 |
| **MNLog** | 173-315 | Log Management System | 11 |
| **MNUtil** | 316-3730 | Core utility class, system-level functionality | 400+ |
| **MNConnection** | 3731-4191 | Network Requests, WebView, WebDAV | 16 |
| **MNButton** | 4192-4774 | Custom Button UI Component | 27 |
| **MNDocument** | 4775-4902 | PDF Document Manipulation Interface | 14 |
| **MNNotebook** | 4903-5199 | Notebook/Study Set Management | 35 |
**MNNote** | 5200-7890 | Core Note-Taking Category | 180+ |
| **MNComment** | 7891-8316 | Comments/Content Management | 22+ |
| **MNExtensionPanel** | 8317-8439 | Plugin Panel Control | 20+ |

### 📌 Menu Class - Pop-up Menu Component

```javascript
class Menu {
  // Attributes
  preferredPosition = 2 // Pop-up direction: Left 0, Down 1, Up 2, Right 4
  titles = [] // Array of menu item titles
  commandTable = [] // Command table

  // Constructor
  constructor(sender, delegate, width = 200, preferredPosition = 2)

  // Core Method
  addMenuItem(title, selector, params = "", checked = false)
  addMenuItems(items) // Add menu items in bulk
  insertMenuItem(index, title, selector, params, checked)
  insertMenuItems(index, items) // Insert menu items in batches to a specified position
  show() // Displays the menu (automatically adjusts its position to avoid exceeding the screen limits)
  dismiss() // Close the menu

  // Attribute access
  set menuItems(items) // Set menu items
  get menuItems() // Get menu items
  set rowHeight(height) // Set row height
  get rowHeight() // Get row height
  set fontSize(size) // Sets the font size
  get fontSize() // Get font size

  // Static method
  static item(title, selector, params, checked) // Quickly create menu items
  static dismissCurrentMenu() // Closes the currently displayed menu

  // Static properties
  static popover // Example of the currently displayed menu pop-up
}

// Usage Example
let menu = new Menu(button, self, 250);
menu.addMenuItem("Copy", "copyNote:", note);
menu.addMenuItem("makeCard", "makeCard:", note, note.isCard);
menu.show();
```

**Best Practices**:
- Use `preferredPosition` to set the preferred pop-up direction; the menu will automatically adjust to avoid exceeding the screen's width.
- Use the `static item()` method to quickly create menu item objects.
- Remember to call `dismiss()` to close the menu at the appropriate time.
- The menu appearance can be adjusted using `rowHeight` and `fontSize`.

### 2. MNLog Class - Log Management System ⭐⭐⭐⭐

MNLog is a brand new log management class that provides structured log recording and viewing functionality.

```javascript
class MNLog {
  // Static properties
  static logs = [] // Log array

  // Core Method
  static updateLog(log) // Update the log to the view
  static showLogViewer() // Displays the log viewer
  static getLogObject(log, defaultLevel = "INFO", defaultSource = "Default") // Get the formatted log object

  // Log level methods
  static log(log, detail = undefined) // General logging
  static info(log, source = undefined) // Info level
  static error(log, source = undefined) // Error level
  static debug(log, source = undefined) // Debug level
  static warn(log, source = undefined) // Warning level

  // Utility Methods
  static clearLogs() // Clear all logs
  static showHUD(message, duration = 2, view = this.currentWindow) // Displays the HUD and logs the message.
}

// Usage Example
// 1. Record different levels of logs
MNLog.info("Operation successful", "MyPlugin");
MNLog.error("File not found", "FileManager");
MNLog.debug({ action: "loadNote", noteId: "xxx" });

// 2. Record structured logs
MNLog.log({
  message: "Batch processing complete",
  level: "INFO",
  source: "BatchProcessor",
  detail: { processed: 10, failed: 2 }
});

// 3. Display HUD and record automatically
MNLog.showHUD("Save successful", 1.5);

// 4. Open the log viewer
MNLog.showLogViewer();
```

**Log object format**:
```javascript
{
  message: string, // Log message
  level: string, // Level: INFO/ERROR/DEBUG/WARN
  source: string, // Source identifier
  timestamp: number, // timestamp
  detail: string // Detailed information (JSON string)
}
```

**Best Practices**:
- Use different levels to distinguish log importance
- Specifying a source for logs facilitates filtering.
Structured logs facilitate analysis and debugging.
- The log array can retain a maximum of 1000 entries, and old logs are automatically cleaned up.

### 3. MNUtil Class - Core Utility Class ⭐⭐⭐⭐⭐

MNUtil is the core of the entire framework, providing over 400 static methods. All methods are static and can be called directly via `MNUtil.methodName()`.

```javascript
class MNUtil {
  // === Theme and Colors ===
  static themeColor = {
    Gray: UIColor.colorWithHexString("#414141"),
    Default: UIColor.colorWithHexString("#FFFFFF"),
    Dark: UIColor.colorWithHexString("#000000"),
    Green: UIColor.colorWithHexString("#E9FBC7"),
    Sepia: UIColor.colorWithHexString("#F5EFDC")
  }

  // === Initialization ===
  static init(mainPath) // Must be called when the plugin starts

  // === Context Accessor (Lazy Loading) ===
  static get app() // Application instance
  static get db() // Database instance
  static get currentWindow() // Current window
  static get studyController() // Study controller
  static get studyView() // Study View
  static getmindmapView() // Mind map view
  static get readerController() // Reader controller
  static getnotebookController() // Notebook controller
  static get currentDocController() // Current document controller
  static get studyMode() // Study mode: 0/1 = document, 2 = study, 3 = review

  // === Selection and Clipboard ===
  static get selectionText() // Get the selected text
  static get isSelectionText() // Checks if text (not an image) is selected.
  static get currentSelection() // Get complete selection information
  static get clipboardText() // Clipboard text
  static get clipboardImage() // Clipboard image

  // === Core Utility Methods ===
  static showHUD(message, duration = 2, view = this.currentWindow)
  static copy(object) // Copy to clipboard (automatically serialized)
  static copyJSON(object) // Copy JSON format
  static copyImage(imageData) // Copy image data

  // === Note-taking operations ===
  static getNoteById(noteid, alert = true) // Retrieves the note by its ID
  static noteExists(noteId) // Check if the note exists
  static isNoteInReview(noteId) // Whether the notes are being reviewed

  // === Error Handling and Logging ===
  static addErrorLog(error, source, info) // Add error log
  static log(log) // General logging
  static clearLogs() // Clear logs

  // === Version and Platform ===
  static get version() // Get MN version information
  static isMN4() // Whether to use MarginNote 4
  static isMN3() // Whether to use MarginNote 3
  static isIOS() // Whether it's an iOS platform
  static isMacOS() // Determines whether the platform is macOS

  // === Document and Notebook Management ===
  static getDocById(md5) // Retrieves the document based on its MD5 hash
  static getNoteBookById(id) // Get the notebook by ID
  static getNoteIdByURL(url) // Parse the note ID from the URL
  static getNotebookIdByURL(url) // Parse the notebook ID from the URL
  static importDocument(filePath) // Import document
  static importPDFFromFile() // Select and import PDF from pop-up window
  static openDoc(md5, notebookId) // Open the document
  static openNotebook(notebook, needConfirm) // Open the notebook
  static findToc(md5, excludeNotebookId) // Find the table of contents notes of a document
  static getDocTocNotes(md5, notebookId) // Get the table of contents notes of a document

  // === Interface Control ===
  static toggleExtensionPanel() // Toggle the extension panel
  static refreshAddonCommands() // Refresh plugin commands
  static refreshAfterDBChanged(notebookId) // Refresh after database changes
  static focusNoteInMindMapById(noteId, delay) // Focuses a note in the mind map
  static focusNoteInFloatMindMapById(noteId, delay) // Focuses on the floating mind map
  static focusNoteInDocumentById(noteId, delay) // Focus on the document

  // === Utility Tools and Methods ===
  static genFrame(x, y, width, height) // Generates a frame object
  static setFrame(view, x, y, width, height) // Sets the view frame
  static isfileExists(path) // Check if the file exists
  static createFolder(path) // Creates a folder
  static createFolderDev(path) // Creates a folder (including intermediate directories).
  static getFileName(path) // Get the filename from the path
  static getFileFold(path) // Get the path of the folder where the file is located
  static copyFile(sourcePath, targetPath) // Copy file
  static subpathsOfDirectory(path) // Get all subpaths in a directory
  static contentsOfDirectory(path) // Gets a list of directory contents
  static mergeWhitespace(str) // Merge consecutive whitespace characters
  static parseWinRect(winRect) // Parse the string representing the window rectangle
  static typeOf(obj) // Get the object type
  static isValidJSON(jsonString) // Check if the JSON is valid.
  static getValidJSON(text) // Attempts to parse JSON
  static deepEqual(obj1, obj2) // Deep comparison of objects
  static UUID() // Generate UUID
  static sort(arr, type) // Sort the array and remove duplicates
  static constrain(value, min, max) // Constrain the range of values
  static textMatchPhrase(text, query) // Text matching that supports AND and OR syntax.
  static runJavaScript(webview, script) // Executes JavaScript in the WebView

  // === Pop-up windows and user interaction ===
  static confirm(title, message, buttons) // Confirmation pop-up
  static input(title, subTitle, items) // Input pop-up
  static waitHUD(message) // Displays a waiting message
  static stopHUD(delay, view) // Stop waiting for the prompt

  // === Image and Selection Processing ===
  static genSelection(docController) // Generate selection information
  static getImageFromSelection() // Get the image of the selected area
  static mergeImages(images, spacing) // Merge multiple images
  static UIImageToNSData(image) // Convert UIImage to NSData
  static NSDataToUIImage(data, scale) // Converts NSData to UIImage

  // === Asynchronous and Animation ===
  static delay(seconds) // Delay execution
  static animate(func, time) // Animation execution
  static undoGrouping(func) // Undo Grouping

  // === Notifications and Events ===
  static addObserver(observer, selector, name)
  static addObserverForPopupMenuOnNote(observer, selector)
  static addObserverForClosePopupMenuOnNote(observer, selector)
  static addObserverForPopupMenuOnSelection(observer, selector)
  static addObserverForClosePopupMenuOnSelection(observer, selector)
  static addObserverForProcessNewExcerpt(observer, selector)
  static addObserverForAddonBroadcast(observer, selector)
  static removeObserver(observer, name)

  // === Color Management ===
  static getColorIndex(color) // Color name or index conversion
  static colorIndexToString(index) // Convert color index to string

  // === Command Execution ===
  static executeCommand(command) // Execute the MarginNote command
  static openURL(url) // Open URL

  // === Data Storage ===
  static readCloudKey(key) // Read iCloud key value
  static setCloudKey(key, value) // Sets the iCloud key value
  static readJSON(path) // Reads a JSON file
  static writeJSON(path, object) // Writes a JSON file
  static readText(path) // Reads a text file
  static writeText(path, string) // Write to a text file
  static data2string(data) // Converts NSData to string

  // === File path ===
  static get dbFolder() // Database folder
  static get cacheFolder() // Cache folder
  static get documentFolder() // Document folder
  static get tempFolder() // Temporary folder
  static get mainPath() // Plugin main path

  // === Markdown and AST ===
  static markdown2AST(markdown) // Markdown to AST
  static buildTree(tokens) // Build the tree structure
  static processList(items) // Process list items

  // === Date and Time ===
  static getDateObject() // Get the date object

  // === Special Tools ===
  static emojiNumber(index) // Converts a number to an emoji (0-10)
  static getStatusCodeDescription(code) // HTTP status code description
  static render(template, config) // Mustache template rendering
  static createJsonEditor(htmlPath) // Creates a JSON editor
  static moveElement(arr, element, direction) // Move array elements
  static countWords(str) // Count the number of Chinese and English words
  static importNotebook(path, merge) // Import Notebook
  static getRandomElement(arr) // Gets a random element from an array.
  static stopHUD(delay, view) // Stop the HUD display
  static userSelect(mainTitle, subTitle, items) // User selection pop-up window

  // === Media Processing ===
  static getMediaByHash(hash) // Retrieves media data based on the hash
  static hasMNImages(markdown) // Check if it contains MN images
  static isPureMNImages(markdown) // Check if the images are pure MN images
  static getMNImageFromMarkdown(markdown) // Extracts the MN image from Markdown.

  // === Selected Click Information ===
  static get popUpNoteInfo() // Note information in the pop-up menu
  static get popUpSelectionInfo() // Popup menu selection area information

  // === Added methods (100+) ===
  // Color Management
  static rgbaToHex(rgba, includeAlpha, toUpperCase) // RGBA to HEX
  static rgbaArrayToHexArray(rgbaArray, includeAlpha, toUpperCase)
  static getNotebookExcerptColorById(notebookId)
  static noteColorByNotebookIdAndColorIndex(notebookId, colorIndex)
  static getNoteColorHex(colorIndex)
  static parseHexColor(hex)
  static hexColorAlpha(hex, alpha)
  static hexColor(hex)

  // Text processing
  static countWords(str) // Counts the number of words (Chinese and English)
  static removePunctuationOnlyElements(arr) // Removes pure punctuation elements
  static doSegment(str) // Word segmentation
  static wordCountBySegmentit(str) // Word count based on word segmentation
  static mergeWhitespace(str) // Merge whitespace characters
  static escapeString(str) // Escape string
  static removeMarkdownFormat(markdownStr) // Remove Markdown formatting

  // Enhanced Notebook Management
  static allNotebookIds() // Get all notebook IDs
  static allDocumentNotebooks(option) // Retrieves all document notebooks
  static allReviewGroups(option) // Get all review groups
  static allStudySets(option) // Get all study sets
  static notesInStudySet(studySetId) // Retrieves notes from the study set.
  static chatNotesInStudySet(studySetId) // Retrieves chat notes from the study set.
  static notebookExists(notebookId, checkNotes) // Check if the notebook exists
  static async openNotebook(notebook, needConfirm) // Open the notebook

  // Document Management
  static allDocuments() // Retrieves all documents
  static allDocumentIds() // Get all document IDs
  static getNoteFileById(noteId) // Get the file based on the note ID
  static findToc(md5, excludeNotebookId) // Find directory
  static getDocTocNotes(md5, notebookId) // Get the document table of contents notes
  static getPageContent(pageNo) // Get page content
  static openDoc(md5, notebookId) // Open the document

  // Enhanced PDF Import
  static dataFromBase64(base64, type) // Convert Base64 data
  static async importPDFFromBase64(pdfBase64, option)
  static async importPDFFromData(pdfData)
  static async importPDFFromFileAndOpen(notebookId)

  // UI Enhancement
  static waitHUD(message, view) // Wait for the HUD
  static async stopHUD(delay, view) // Stop HUD
  static alert(message) // Warning pop-up
  static async confirm(mainTitle, subTitle, items) // Confirmation pop-up
  static async userSelect(mainTitle, subTitle, items) // User selection
  static async input(title, subTitle, items, options) // Input pop-up
  static async userInput(title, subTitle, items, options) // User input

  // Enhanced file operations
  static createFolderDev(path) // Creates a folder (including intermediate directories).
  static getFileFold(path) // Get the folder where the file is located
  static copyFile(sourcePath, targetPath) // Copy file
  static async importFile(UTI) // Import file
  static async importJSONFromFile() // Import JSON file
  static saveFile(filePath, UTI) // Save the file

  // JavaScript execution
  static async runJavaScript(webview, script) // Executes JavaScript in the WebView

  // Animation and Interaction
  static async animate(func, time) // Animation execution
  static checkSender(sender, window) // Check the sender
  static isDescendantOfStudyView(view) // Check the view hierarchy
  static isDescendantOfCurrentWindow(view)

  // Enhanced Observer Pattern
  static addObservers(observer, kv) // Add observers in batches
  static removeObservers(observer, notifications) // Batch remove observers
  // Observer methods for various specific events...

  // JSON and Data Processing
  static isValidJSON(jsonString) // Validate JSON
  static getValidJSON(jsonString, debug) // Get valid JSON
  static stringify(object) // Convert object to string
  static deepEqual(obj1, obj2, keysToIgnore) // Depth comparison
  static unique(arr, noEmpty) // Remove duplicates from an array
  static typeOf(object) // Get the type

  // Undo/Redo
  static undo(notebookId) // Undo
  static redo(notebookId) // Redo

  // URL processing
  static parseURL(urlString) // Parse URL
  static openURL(url, mode) // Open URL
  static openWith(config, addon) // Open with a specific plugin
  static genNSURL(url) // Generate NSURL

  // Image processing
  static compressImage(imageData, quality) // Compress the image
  static copyImage(imageData) // Copy image
  static getImage(path, scale) // Get the image
  static getDocImage(checkImageFromNote, checkDocMapSplitMode)

  // Media processing
  static getMediaByHash(hash) // Retrieves media based on hash
  static replaceMNImagesWithBase64(markdown) // Replaces the MN image with Base64
  static isPureMNImages(markdown) // Check if the images are pure MN images
  static hasMNImages(markdown) // Check if it contains MN images
  static getMNImageFromMarkdown(markdown) // Extracts the MN image from Markdown.

  // Cloud storage
  static getCloudDataByKey(key) // Retrieves cloud data
  static setCloudDataByKey(data, key) // Set cloud data
  static readCloudKey(key) // Read cloud key value
  static setCloudKey(key, value) // Sets the cloud key value

  // Local storage
  static getLocalDataByKey(key) // Retrieves local data
  static getLocalDataByKeyWithDefaultAndBackup(key, defaultValue, backUpFile)
  static setLocalDataByKey(data, key) // Set local data

  // Encryption and Security
  static xorEncryptDecrypt(input, key) // XOR encryption/decryption
  static MD5(data) // MD5 hash

  // Template rendering
  static render(template, config) // Mustache template rendering
  static createJsonEditor(htmlPath) // Creates a JSON editor

  // AST and Markdown
  static markdown2AST(markdown) // Markdown to AST
  static buildTree(tokens) // Build the tree structure
  static processList(items) // Process list items
  static AST2Mindmap(note, ast, level) // Convert AST to Mind Map
  static getConfig(text) // Get configuration

  // Link processing
  static hasBackLink(from, to) // Check backlinks
  static extractMarginNoteLinks(text) // Extract MarginNote links

  // Status Code
  static getStatusCodeDescription(code) // HTTP status code description

  // Utilities
  static getRandomElement(arr) // Gets a random element
  static constrain(value, min, max) // Constrain the range of values
  static emojiNumber(index) // Convert number to emoji
  static tableItem(title, object, selector, params, checked)
  static moveElement(arr, element, direction) // Move array elements
  static UUID() // Generate UUID
  static getDateObject() // Get the date object
  static getNoteObject(note, opt) // Get the note object
  static NSValue2String(v) // Converts NSValue to string
  static CGRectString2CGRect(str) // Convert string to CGRect
  static isBlankNote(note) // Check if the note is blank
  static isNSNull(obj) // Check if it is NSNull
  static strCode(str) // Get the number of bytes in the string
  static textMatchPhrase(text, query) // Text matching (supports AND and OR)
  static executeCommand(command) // Execute the command
  static sort(arr, type) // Sort the array
  static postNotification(name, userInfo) // Send notification
  static getPopoverAndPresent(sender, commandTable, width, preferredPosition)
  static parseWinRect(winRect) // Parse the window rectangle
  static getFileName(fullPath) // Get the filename
  static getFile(path) // Get the file
  static data2string(data) // Convert data to string
  static readJSON(path) // Read JSON
  static writeJSON(path, object) // Write JSON
  static readText(path) // Reads text
  static writeText(path, string) // Write text
  static readTextFromUrlSync(url) // Synchronously reads text from the URL
  static async readTextFromUrlAsync(url, option) // Asynchronously reads text from a URL
  static isAddonRunning(addonName) // Check if the plugin is running
  static md2html(md) // Markdown to HTML
  static getColorIndex(color) // Get color index
  static getNoteId(note) // Get the note ID
  static crash() // Crash (for debugging)
  static checkDataDir() // Check the data directory
  static addHistory(type, detail) // Add history records
  static importNotebook(path, merge) // Import Notebook
  static isNoteInReview(noteId) // Check if the notes are being reviewed
  static getMNUtilVersion() // Get the MNUtil version

  // === Other Useful Methods ===
  static readFile(path) // Reads the contents of a file
  static writeFile(path, data) // Write to file
  static removeFile(path) // Delete file
  static moveFile(from, to) // Move file
  static getExcerptNotes(docMd5, notebookId) // Retrieves excerpt notes from a document
  static getNotebookNotes(notebookId) // Retrieves all notes in the notebook
  static refreshNoteInNotebook(noteId, notebookId) // Refreshes a specific note in the notebook.
}
```

**Important Attributes and Constants**:
```javascript
// The currently active text view (used to detect focus)
static activeTextView

// Pop-up menu related information
static popUpNoteInfo // Pop-up note information
static popUpSelectionInfo // Pop-up selection information

// Global state
static onAlert // Whether to display an alert

// Log system
static errorLog = [] // Array of error logs
static logs = [] // General log array

// Version information cache
static mnVersion // MarginNote version information cache
```

**Examples of Commonly Used Methods**:
```javascript
// 1. Initialization (required)
MNUtil.init(self.path);

// 2. Display prompt
MNUtil.showHUD("Operation successful!");

// 3. Get the current note
let note = MNUtil.getNoteById(noteId, false); // Do not display error messages

// 4. Error Handling
try {
  // Your code
} catch (error) {
  MNUtil.addErrorLog(error, "functionName", {noteId: noteId});
}

// 5. Environmental Monitoring
if (MNUtil.isMN4()) {
  // MarginNote 4 unique features
}
```

### 4. MNNote Class - Core Note-Taking Class ⭐⭐⭐⭐⭐

MNNote is one of the most important classes, providing 180+ properties and methods.

```javascript
class MNNote {
  // === Constructor (supports multiple inputs) ===
  constructor(note) // Supports: MbBookNote object / URL string / ID string / configuration object

  // === Static Factory Method ===
  static new(note, alert = true) // Smartly create note objects
  static getFocusNote() // Get the currently focused note
  static getFocusNotes() // Retrieves the currently focused note (in array form)
  static getSelectedNotes() // Gets the array of selected notes

  // === Core properties (149+ getters/setters) ===
  get noteId() // Note ID
  get noteURL() // Note URL (marginnote4app://note/xxx)
  get title() // Note title
  get noteTitle() // Note title (same as title)
  get excerptText() // Extract text
  get comments() // Comments array
  get colorIndex() // Color index (0-15)
  get parentNote() // Parent Notes
  get childNotes() // Array of child notes
  get tags() // Tag array
  get modifiedDate() // Modify the date
  get createDate() // Creation time

  // === Note-taking methods ===
  open() // Open the notes
  copy() // Copy notes
  paste() // Paste as a sub-note
  delete(withDescendant = false) // Delete note
  clone() // Cloning Notes
  merge(note) // Merge notes
  refresh() // Refresh the note display
  focusInMindMap(delay) // Focus on the mind map

  // === Hierarchical Relationship Management ===
  addChild(note) // Add a child note
  removeFromParent() // Remove from parent note
  createChildNote(config, undoGrouping = true) // Create child notes

  // === Comment System (50+ Methods) ===
  appendTextComment(comment, index) // Add text comment
  appendMarkdownComment(comment, index) // Add a Markdown comment
  appendHtmlComment(html, text, size, tag, index) // Add HTML comment
  moveComment(fromIndex, toIndex, msg = true) // Moves the comment (Note: In xdyyutils, the default value should be false)
  removeCommentByIndex(index) // Delete the specified comment
  removeCommentsByIndices(indices) // Batch delete comments
  sortCommentsByNewIndices(arr) // Reorder comments

  // === Content Operations ===
  appendTitles(...titles) // Add titles
  appendTags(tags) // Add tags
  removeTags(tagsToRemove) // Delete tags
  appendNoteLink(note, type) // Add a note link
  getCommentIndex(comment) // Get the comment index (exact match)
  getCommentIndicesByCondition(condition) // Get the comment index array based on the condition
  removeCommentsByIndices(indices) // Batch delete comments
  removeCommentByCondition(condition) // Delete comments based on conditions
  removeAllComments() // Delete all comments
  removeCommentButLinkTag(filter, f) // Deletes a comment but keeps its link and tag.
  tidyupTags() // Organize tags (make sure they are at the end)
  clearFormat() // Clear formatting

  // === Batch Comment Operation ===
  appendTextComments(...comments) // Add text comments in batches
  appendMarkdownComments(...comments) // Add Markdown comments in batches

  // === Card-related operations ===
  get isCard() // Check if it is a card
  set isCard(value) // Set card status
  toCard() // Convert to a card
  removeFromCard() // Removes the card

  // === More properties (getter) ===
  getallText() // All text
  getallTextPic() // All text and images
  getancestorNodes() // Ancestor node array
  get descendantNodes() // Descendant node objects
  get startPage() // Start Page
  get endPage() // End Page
  getdocTitle() // Document title
  getnoteBook() // The notebook to which the notebook belongs
  get isOCR() // Whether to use OCR notes

  // === Auxiliary Attributes ===
  get MNComments() // An array of comment objects (MNComment instances)
  get childMindMap() // Child Mind Map
  get currentChildMap() // Current child mind map
  get groupNoteId() // Group Note ID
  get summaryLinks() // Summary Links
  get tags() // An array of tags (excluding the # prefix)
  get excerptPic() // Extract image
  get modifiedDate() // Modify date
  get createDate() // Creation date
  getdocMd5() // Document MD5
  get notebookId() // Notebook ID

  // === Static Method ===
  static new(note, alert = true) // Smartly create note objects
  static getFocusNote() // Get the currently focused note
  static getFocusNotes() // Retrieves the currently focused note (in array form)
  static getSelectedNotes() // Gets the array of selected notes

  // === Added 30+ static methods ===
  static errorLog = [] // Array of error logs
  static addErrorLog(error, source, info) // Add error log
  static getNoteExcerptTextPic(note) // Get the note excerpt text image
  static exportPic(pic) // Export image
  static focusInMindMapById(noteId, delay) // Focuses on the mind map based on the noteId.
  static focusInDocumentById(noteId, delay) // Focuses on the document based on its ID.
  static focusInFloatMindMapById(noteId, delay) // Focuses on the floating mind map based on the noteId.
  static focusInMindMap(note, delay) // Focuses the note in the mind map
  static focusInDocument(note, delay) // Focuses the note in the document
  static focusInFloatMindMap(note, delay) // Focuses the note in the floating mind map
  static get currentChildMap() // Get the current child mind map
  static getfocusNote() // Get the focused note (getter)
  static hasImageInNote(note, checkTextFirst) // Check if the note contains an image
  static fromSelection(docController) // Create a note from the selection
  static getfocusNotes() // Gets the array of focused notes (getter)
  static buildHierarchy(notes) // Build the hierarchical structure
  static getNotesByRange(range) // Retrieves notes by a range
  static clone(note, notebookId) // Clone the notebook
  static getImageFromNote(note, checkTextFirst) // Get an image from a note
  static getImageInfoFromNote(note, checkTextFirst) // Get note image information
  static getImagesFromNote(note, checkTextFirst) // Get all images from the note
  static exist(noteId) // Check if the note exists
}
```

**Usage Example:**
```javascript
// 1. Get Notes
let note = MNNote.getFocusNote(); // The currently focused note
let note2 = MNNote.new("marginnote4app://note/xxx"); // via URL
let note3 = MNNote.new("6B45B7C5-xxxx"); // By ID

// 2. Basic Operations
note.title = "New Title";
note.colorIndex = 2; // Light blue
note.appendTags(["Important", "To be reviewed"]);

// 3. Comment Operations
note.appendTextComment("This is a comment");
note.appendMarkdownComment("**Bold Text**");
note.moveComment(0, 2); // Move the first comment to the third position.

// 4. Hierarchical Operations
let childConfig = {
  title: "Sub-notes"
  content: "content",
  colorIndex: 5
};
let child = note.createChildNote(childConfig);
```

### 5. MNComment Class - Comment System

It supports multiple comment types and manages various content within notes.

```javascript
class MNComment {
  // === Comment type (dynamically determined using the getCommentType method) ===
  // Supported types include:
  // - textComment: Plain text comment
  // - markdownComment: Markdown formatted comments
  // - imageComment: Image Comment
  // - drawingComment: Handwritten comment
  // - mergedImageComment: Merged image comment (usually an excerpt of an image).
  // - blankImageComment: Blank image comment
  // - imageCommentWithDrawing: Image Comments with Handwritten Notes
  // - htmlComment: HTML Comment
  // - tagComment: Tag-based comments (starting with #)
  // - linkComment: Link to comments
  // - summaryComment: Summary Comment

  // === Core Attributes ===
  get type() // Comment type
  get text() // Text content
  get markdown() // Markdown content
  get imageData() // Image data
  get index() // Index in notes
  get originalNoteId() // Original Note ID

  // === Content Operations ===
  set text(value) // Sets the text
  set markdown(value) // Set Markdown

  // === Static Method ===
  static from(note) // Retrieves all comments from the note
  static getCommentType(comment) // Determines the comment type based on the comment object
  static commentBelongsToType(comment, types) // Checks if a comment belongs to the specified type
  static new(comment, index, note) // Creates a new MNComment instance.
}
```

**Comment Type Explanation**:
- `textComment`: Plain text comment
- `markdownComment`: Markdown formatted comments
- `imageComment`: Image Comments
- `mergedImageComment`: Merged image comments (usually image excerpts).

### 6. MNConnection Class - Network Requests and WebView Management

Provides network request, WebDAV support, and WebView control functionality.

```javascript
class MNConnection {
  // === URL and Request Management ===
  static genURL(url) // Generates an NSURL object
  static requestWithURL(url) // Create a request object
  static initRequest(url, options) // Initialize the HTTP request
  static sendRequest(request) // Send an asynchronous request
  static fetch(url, options = {}) // Similar to the browser's fetch API

  // === WebView Control ===
  static loadRequest(webview, url, desktop) // Load the URL
  static loadFile(webview, file, baseURL) // Load a local file
  static loadHTML(webview, html, baseURL) // Loads the HTML string

  // === WebDAV Support ===
  static readWebDAVFile(url, username, password) // Reads a WebDAV file
  static readWebDAVFileWithDelegate(url, username, password) // Read WebDAV using a proxy
  static uploadWebDAVFile(url, username, password, content) // Upload to WebDAV

  // === Utilities ===
  static btoa(str) // Base64 encoding
  static getOnlineImage(url, scale=3) // Download online image
  static getImageFromNote(note, checkTextFirst = true) // Get an image from a note

  // === ChatGPT API Support ===
  static initRequestForChatGPT(history, apikey, url, model, temperature, funcIndices=[])
  static initRequestForChatGPTWithoutStream(history, apikey, url, model, temperature, funcIndices=[])
}
```

**Usage Example:**
```javascript
// 1. Send an HTTP request
let response = await MNConnection.fetch("https://api.example.com/data", {
  method: "POST"
  headers: { "Content-Type": "application/json" },
  json: { key: "value" },
  timeout: 30
});

// 2. WebDAV Operation
let fileContent = await MNConnection.readWebDAVFile(
  "https://dav.example.com/file.txt",
  "username",
  "password"
);

// 3. Download Images
let image = MNConnection.getOnlineImage("https://example.com/image.png");
if (image) {
  note.appendImageComment(image);
}
```

### 7. MNButton Class - Custom Button Component

Create and manage custom button UI elements.

```javascript
class MNButton {
  // === Static Properties ===
  static gethighlightColor() // Highlight color

  // === Constructor ===
  constructor(config = {}, superView)

  // === Configuration Options ===
  // config: {
  // color: string, // Button color
  // title: string, // Button title
  // bold: boolean, // Whether to use bold text
  // font: number, // font size
  // opacity: number, // transparency
  // radius: number, // corner radius
  // alpha: number // Alpha channel
  // }
}

// Usage Example
let button = new MNButton({
  title: "Click Me"
  color: "#2c4d81",
  radius: 8,
  font: 16
}, parentView);
```

### 8. MNDocument Class - Document Manipulation Interface

The core class for managing PDF documents.

```javascript
class MNDocument {
  // === Core Attributes ===
  getdocMd5() // Document MD5 identifier
  getdocTitle() // Document title
  get pageCount() // Page count
  get currentTopicId() // Current notebook ID

  // === Document Operations ===
  open(notebookId) // Opens the notebook in the specified notebook
  textContentsForPageNo(pageNo) // Retrieves the text content of the specified page.

  // === Related Queries ===
  get tocNotes() // Table of Contents Notes
  get documentNotebooks() // List of document notebooks
  get studySets() // Contains the study sets for this document

  // === Notes Search ===
  documentNotebookInStudySet(notebookId) // Retrieves the document notebooks in the study set.
  notesInDocumentInStudySet(notebookId) // Retrieves the notes in the document within the study set.
  mainNoteInNotebook(notebookId) // Retrieves the main note

  // === Static Method ===
  static new(docMd5) // Create a document object

  // === Other attributes ===
  get pathFile() // File path
  get fileName() // filename
}
```

### 9. MNNotebook Class - Notebook Management

Manage notebooks (study notebooks, document notebooks, review groups).

```javascript
class MNNotebook {
  // === Static Method ===
  static get currentNotebook() // Current notebook
  static allNotebooks() // All Notebooks
  static allDocumentNotebooks() // All document notebooks
  static allStudySets() // All study sets
  static allReviewGroups() // All review groups

  // === Core Attributes ===
  get id() // Notebook ID
  get title() // Title
  get type() // Type: documentNotebook/studySet/reviewGroup
  get url() // marginnote4app://notebook/xxx
  get notes() // Contains an array of notes
  get documents() // Contains an array of documents

  // === Operation Method ===
  open() // Open the notebook
  openDoc(docMd5) // Opens the document in Notepad
  importDoc() // Import new document

  // === Static utility methods ===
  static new(notebookId) // Create a notebook object

  // === Other attributes ===
  get createDate() // Creation date
  get modifiedDate() // Modify date
  get colorIndex() // Color index
}
```

### 10. MNExtensionPanel Class - Extension Panel Management

Control the extended panel UI of the plugin.

```javascript
class MNExtensionPanel {
  // === Static Properties ===
  static subviews = {} // Subview storage

  // === Accessor ===
  static get currentWindow() // Current window
  static get subviewNames() // List of subview names
  static get app() // Application example
  static get studyController() // Study controller
  static get controller() // Extend panel controller
  static get view() // Expand panel view
  static get frame() // Panel frame
  static get width() // Panel width
  static get height() // Panel height
  static get on() // Whether to display

  // === Control Method ===
  static hideExtentionPanel(window) // Hides the extended panel
  static toggle() // Toggle between showing and hiding
  static show(name = undefined) // Show panel or subview
  static subview(name) // Get the subview
  static addSubview(name, view) // Add a subview
  static removeSubview(name) // Removes a subview
}
```

## 🎓 Academic Extension API - xdyyutils.js

xdyyutils.js is a deeply optimized extension for academic scenarios (especially mathematics), providing advanced features such as knowledge card management, intelligent linking, and Chinese typesetting.

⚠️ **Important Notes**:
- Some methods have overridden the default behavior of mnutils.js (e.g., the default value of the alert parameter in MNUtil.getNoteById has been changed from true to false).
- Please confirm that these changes meet your needs before using them.

### Core Module Overview

| Module | Function | Use Case | Code Location |
|------|------|----------|----------|
| **HtmlMarkdownUtils** | HTML Styler | Rich Text Display, Hierarchical Management | Starting from line 11634 |
| **Pangu** | Chinese typography optimization | Mixed Chinese and English text, mathematical symbols | Starting from line 13249 |
| **String.prototype** | String expansion (95+ methods) | Text processing, format conversion | Starting line 13359 |
| **MNNote.prototype** | Note-taking extensions (70+ methods) | Workflow, batch operations | Starting from line 13858 |


### HtmlMarkdownUtils Class - HTML Style Utility

It offers a rich set of HTML styles and icons, and supports a 5-level hierarchy.

```javascript
// Predefined icons
static icons = {
  level1: '🚩', level2: '▸', level3: '▪', level4: '•', level5: '·',
  key: '🔑', alert: '⚠️', danger: '❗❗❗', remark: '📝',
  goal: '🎯', question: '❓', idea: '💡', method: '✨'
}

// Create styled HTML text
static createHtmlMarkdownText(text, type = 'none')
```

### Pangu Class - Chinese Typesetting Optimization

Automatically optimizes mixed Chinese and English text layout based on the rules of [pangu.js](https://github.com/vinta/pangu.js).

```javascript
class Pangu {
  // === Main Methods ===
  static spacing(text) // Automatically adds spaces to optimize layout
  static autoSpacingPage() // Automatically optimizes the entire page (not implemented)
  static spacingPageBody() // Optimizes the main content of the page (not implemented)
  static addSpaceAtNode(node) // Adds a space to the specified node (not implemented)
  static canIgnoreNode(node) // Determines whether a node can be ignored (not implemented)

  // === Added Method ===
  static convertToFullwidth(symbols) // Convert to full-width characters
  static toFullwidth(text) // Convert text to full width

  // === Conversion Rules ===
  // 1. Add spaces between CJK characters and English letters/numbers
  // 2. Handling punctuation spacing
  // 3. Standardize full-width/half-width punctuation

  // === Special Mathematical Symbols Handling ===
  // - C[a,b] Format: Single letter followed by parentheses
  // - ∞ Special treatment for the infinity symbol
  // - ∑ will automatically convert to Σ
}

// Usage Example
let text = "Learning JavaScript is fun!";
let formatted = Pangu.spacing(text);
// Output: "Learning JavaScript is fun!"

// Examples of mathematical symbols
Pangu.spacing("Let C[a,b] be a closed interval"); // "Let C[a,b] be a closed interval"
Pangu.spacing("When n→∞"); // "When n→∞"
```

### HtmlMarkdownUtils Class - HTML Style Utility

It offers a rich set of HTML styles and icons, and supports a 5-level hierarchy.

```javascript
class HtmlMarkdownUtils {
  // === Predefined icons ===
  static icons = {
    // Hierarchical icons
    level1: '🚩', level2: '▸', level3: '▪', level4: '•', level5: '·',

    // Semantic Icons
    key: '🔑', // Key point
    alert: '⚠️', // Warning
    danger: '❗❗❗', // Danger
    remark: '📝', // Note
    goal: '🎯', // target
    question: '❓', // Question
    idea: '💡', // idea
    method: '✨' // Method
  }

  // === Prefix Text ===
  static prefix = {
    danger: '',
    alert: 'Note:',
    key: '',
    level1: '', level2: '', level3: '', level4: '', level5: '',
    remark: '',
    goal: '',
    question: '',
    idea: 'Thoughts/Approaches:',
    method: 'Method:'
  }

  // === Style Definitions (Complete CSS) ===
  static styles = {
    // Danger Warning - Dark red background, bold text
    danger: 'font-weight:700;color:#6A0C0C;background:#FFC9C9;border-left:6px solid #A93226;font-size:1em;padding:8px 15px;display:inline-block;transform:skew(-3deg);box-shadow:2px 2px 5px rgba(0,0,0,0.1);',

    // Warning - Orange border
    alert: 'background:#FFF;color:#FF8C5A;border:2px solid currentColor;border-radius:3px;padding:6px 12px;font-weight:600;box-shadow:0 1px 3px rgba(255,140,90,0.2);display:inline-block;',

    // Key content - Orange left border
    key: 'color: #B33F00;background: #FFF1E6;border-left: 6px solid #FF6B35;padding:16px 12px 1px;line-height:2;position:relative;top:6px;display:inline-block;font-family:monospace;margin-top:-2px;',

    // 5-level hierarchical style
    level1: "font-weight:600;color:#1E40AF;background:linear-gradient(15deg,#EFF6FF 30%,#DBEAFE);border:2px solid #3B82F6;border-radius:12px;padding:10px 18px;display:inline-block;box-shadow:2px 2px 0px #BFDBFE,4px 4px 8px rgba(59,130,246,0.12);position:relative;margin:4px 8px;",
    level2: "font-weight:600;color:#4F79A3; background:linear-gradient(90deg,#F3E5F5 50%,#ede0f7);font-size:1.1em;padding:6px 12px;border-left:4px solid #7A9DB7;transform:skew(-1.5deg);box-shadow:1px 1px 3px rgba(0,0,0,0.05);margin-left:40px;position:relative;",
    level3: "font-weight:500;color:#7A9DB7;background:#E8F0FE;padding:4px 10px;border-radius:12px;border:1px solid #B3D4FF;font-size:0.95em;margin-left:80px;position:relative;",
    level4: "font-weight:400;color:#9DB7CA;background:#F8FBFF;padding:3px 8px;border-left:2px dashed #B3D4FF;font-size:0.9em;margin-left:120px;position:relative;",
    level5: "font-weight:300;color:#B3D4FF;background:#FFFFFF;padding:2px 6px;border-radius:8px;border:1px dashed #B3D4FF;font-size:0.85em;margin-left:160px;position:relative;",

    // Note - Yellow left border
    remark: 'background:#F5E6C9;color:#6d4c41;display:inline-block;border-left:5px solid #D4AF37;padding:2px 8px 3px 12px;border-radius:0 4px 4px 0;box-shadow:1px 1px 3px rgba(0,0,0,0.08);margin:0 2px;line-height:1.3;vertical-align:baseline;position:relative;',

    // Target - Green Rounded Corner Button Style
    goal: 'font-weight:900;font-size:0.7em;color:#F8FDFF;background:#00BFA5 radial-gradient(circle at 100% 0%,#64FFDA 0%,#009688 00%);padding:12px 24px;border-radius:50px;display:inline-block;position:relative;box-shadow:0 4px 8px rgba(0, 191, 166, 0.26);text-shadow:0 1px 3px rgba(0,0,0,0.35);border:2px solid rgba(255,255,255,0.3)',

    // Issue - Purple double border
    question: 'font-weight:700;color:#3D1A67;background:linear-gradient(15deg,#F8F4FF 30%,#F1E8FF);border:3px double #8B5CF6;border-radius:16px 4px 16px 4px;padding:14px 22px;display:inline-block;box-shadow:4px 4px 0px #DDD6FE,8px 8px 12px rgba(99,102,241,0.12);position:relative;margin:4px 8px;',

    // Idea - Blue dashed border
    idea: 'font-weight:600;color:#4A4EB2;background:linear-gradient(15deg,#F0F4FF 30%,#E6EDFF);border:2px dashed #7B7FD1;border-radius:12px;padding:10px 18px;display:inline-block;box-shadow:0 0 0 2px rgba(123,127,209,0.2),inset 0 0 10px rgba(123,127,209,0.1);position:relative;margin:4px 8px;',

    // Method - Dark Blue Block Style
    method: 'display:block;font-weight:700;color:#FFFFFF;background:linear-gradient(135deg,#0D47A1 0%,#082C61 100%);font-size:1.3em;padding:12px 20px 12px 24px;border-left:10px solid #041E42;margin:0 0 12px 0;border-radius:0 6px 6px 0;box-shadow:0 4px 10px rgba(0,0,0,0.25),inset 0 0 10px rgba(255,255,255,0.1);text-shadow:1px 1px 2px rgba(0,0,0,0.35);position:relative;'
  }

  // === Main Methods ===
  static createHtmlMarkdownText(text, type = 'none')
  static getHtmlCommentTemplate(type, text = "")
  static getSpanTemplate(type)
  static getSpanContent(comment) // Get the content of the span tag
  static getSpanTextContent(comment) // Retrieves the plain text content (excluding icons and prefixes).
  static getSpanType(comment) // Get the type of the span
  static getSpanNextLevelType(currentType)
  static getSpanLastLevelType(type) // Get the parent type
  static parseLeadingDashes(text) // Parse the number of leading hyphens
  static extractSpanContent(html) // Extracts span content from HTML
  static removeSpanTags(html) // Removes span tags while preserving content
  static updateSpanContent(html, newContent) // Update span content
  static changeSpanType(html, newType) // Change the type of the span

  // === Added Method ===
  static isLevelType(type) // Determines if it is a level type
  static getHtmlMDCommentIndexAndTypeObjArr(note) // Get the HTML MD comment index and type
  static isHtmlMDComment(comment) // Determines if it is an HTML MD comment
  static changeHtmlMDCommentTypeToNextLevel(comment) // Change to the next level
  static changeHtmlMDCommentTypeToLastLevel(comment) // Change to the parent level
  static getLastHtmlMDComment(note) // Get the last HTML MD comment
  static hasHtmlMDComment(note) // Whether there is an HTML MD comment
  static addSameLevelHtmlMDComment(note, text, type) // Add a comment at the same level
  static addNextLevelHtmlMDComment(note, text, type) // Add next-level comment
  static addLastLevelHtmlMDComment(note, text, type) // Add a parent comment
  static autoAddLevelHtmlMDComment(note, text, goalLevel) // Automatically add hierarchical comments
  static adjustAllHtmlMDLevels(note, direction) // Adjust all levels
  static adjustHtmlMDLevelsByHighest(note, targetHighestLevel) // Adjusts to the highest level
  static upwardMergeWithStyledComments(rootFocusNote, firstLevelType) // Merge styled comments upwards
  static convertFieldContentToHtmlMDByPopup(note) // Convert field content via pop-up window
  static getFieldNonHtmlMDContents(note, fieldName) // Retrieves the non-HTML MD content of a field.
  static getAllNonHtmlMDContents(note) // Retrieves all non-HTML MD content
  static getCommentFieldInfo(note, commentIndex) // Get comment field information
  static showFieldContentSelectionPopup(note, contents, fieldName) // Displays a pop-up window for selecting field content.
  static showFieldContentMultiSelectDialog(note, contents, fieldName, selectedIndices) // Multi-select dialog box
  static showTypeSelectionPopup(note, contents) // Displays a pop-up window for selecting the type of input.
  static convertContentsToHtmlMD(note, contents, type) // Converts the content to HTML MD

  // === Q&A Function ===
  static createQuestionHtml(question, answer, explanation) // Creates a question and answer HTML file
  static updateQuestionPart(comment, part, newContent) // Update the question and answer section
  static parseQuestionHtml(html) // Parse the question and answer HTML
  static isQuestionComment(comment) // Determines whether a question/answer comment is being used.

  // === Proof Function ===
  static createEquivalenceProof(propositionA, propositionB) // Creates an equivalence proof
  static generateProofFromTemplate(template, inputs) // Generate proof from template
}

// Usage Example
let html = HtmlMarkdownUtils.createHtmlMarkdownText("Important content", "danger");
note.appendHtmlComment(html, "Important content", 16, "danger");

// Create a multi-level structure
let level1 = HtmlMarkdownUtils.createHtmlMarkdownText("First Level", "level1");
let level2 = HtmlMarkdownUtils.createHtmlMarkdownText("Second Level", "level2");

// Example of Q&A function
let qHtml = HtmlMarkdownUtils.createQuestionHtml("What is a function?", "A function is...", "Detailed explanation...");
```


### String.prototype extension

xdyyutils.js adds 95+ extension methods to the String prototype:

```javascript
// === Conditional methods ===
str.isPositiveInteger() // Check if it's a positive integer
str.isKnowledgeNoteTitle() // Same as above
str.ifReferenceNoteTitle() // Whether the reference note title is correct [Reference: xxx]
str.ifWithBracketPrefix() // Does it have a 【】 prefix?
str.ifGreenClassificationNoteTitle() // Check if the green classification card title "xxx" is related to xxx
str.isGreenClassificationNoteTitle() // Same as above
str.ifYellowClassificationNoteTitle() // Check if the yellow classification card title is "xxx": "xxx" Related to xxx
str.isYellowClassificationNoteTitle() // Same as above
str.isClassificationNoteTitle() // Whether to classify the card title (green or yellow)

// === Note ID/URL Related ===
str.ifNoteIdorURL() // Check if it's a note ID or URL
str.isNoteIdorURL() // Same as above (multiple aliases)
str.ifValidNoteId() // Checks if the note ID (UUID format) is valid.
str.isValidNoteId() // Same as above
str.ifValidNoteURL() // Check if the note URL is valid
str.isValidNoteURL() // Same as above
str.isLink() // Whether a link is valid (same as isValidNoteURL)
str.ifNoteBookId() // Check if NotebookId is the notebook ID

// === Conversion Class Method ===
str.toReferenceNoteTitle() // Retrieves the title of the reference notes
str.toReferenceNoteTitlePrefixContent() // Gets the prefix content of the reference card title.
str.toNoBracketPrefixContent() // Get the part without the prefix
str.toNoBracketPrefixContentFirstTitleLinkWord() // Get the first word of the unprefixed part
str.toBracketPrefixContent() // Get the content of the prefix
str.toBracketPrefixContentArrowSuffix() // This transforms 【xxx】yyy into 【xxx→yyy】
str.toGreenClassificationNoteTitle() // Get the title of the green classification card.
str.toGreenClassificationNoteTitleType() // Get the type of the green classification card
str.toYellowClassificationNoteTitle() // Get the title of the yellow classification card.
str.toYellowClassificationNoteTitleType() // Get the type of the yellow classification card
str.toClassificationNoteTitle() // Get the title of the classification card.
str.toClassificationNoteTitleType() // Get the type of the classification card
str.toNoteURL() // Converts ID or URL to URL
str.toNoteBookId() // Convert to Notebook ID
str.toNoteId() // Converts URLs or IDs to IDs
str.toNoteID() // Same as above

// === Text Processing ===
str.toDotPrefix() // Converts to "- xxx" format
str.removeDotPrefix() // Removes the "-" prefix
str.splitStringByFourSeparators() // Split strings by commas and semicolons (Chinese and English characters)
str.parseCommentIndices(totalComments) // Parses the comment index (supports range, XYZ)
str.toTitleCasePro() // Smart title case conversion
```

**Usage Example:**
```javascript
// 1. Judgment and Verification
"marginnote4app://note/xxx".isNoteIdorURL() // true
"123".isPositiveInteger() // true

// 2. Format Conversion
"1,3-5,Y,Z".parseCommentIndices(10) // [1,3,4,5,9,10]
"ABCD-1234".toNoteURL() // "marginnote4app://note/ABCD-1234"
"hello world".toTitleCasePro() // "Hello World"

// 3. Text Processing
"- content".removeDotPrefix() // "content"
"a,b;c;d".splitStringByFourSeparators() // ["a", "b", "c", "d"]
```

### MNNote.prototype extension

xdyyutils.js adds 70+ extension methods to the MNNote prototype:

```javascript
// === Note type determination ===
note.ifReferenceNote() // Whether to use reference notes (title begins with "[References]" or "[Bibliography]")
note.ifOldReferenceNote() // Whether to use the old version of the reference notes
note.ifReferenceNoteToMove() // Whether the reference notes need to be moved.
note.lastTwoCommentsType() // Get the types of the last two comments

// === Batch Operations ===
note.pasteChildNotesByIdArr(["id1", "id2", "id3"]) // Batch paste child notes
note.pasteChildNoteById(id) // Paste a single child note
note.deleteCommentsByPopup() // Pop-up window for selecting to delete comments
note.deleteCommentsByPopupAndMoveNewContentTo(target, toBottom) // Delete comments and move new content
note.clearAllComments() // Clear all comments
note.removeCommentsByTypes(types) // Delete comments by type (link/paint/text/markdown/html/excerpt)
note.removeCommentsByType(type) // Same as above (singular form)
note.removeCommentsByOneType(type) // Removes a single type
note.removeCommentsByText(text) // Removes comments based on their text content
note.removeCommentsByTrimText(text) // Removes comments from the text after removing spaces.

// === HTML block operations ===
note.moveHtmlBlock(htmltext, toIndex) // Move the HTML block to the specified position
note.moveHtmlBlockToBottom(htmltext) // Move the HTML block to the bottom
note.moveHtmlBlockToTop(htmltext) // Move the HTML block to the top
note.getHtmlBlockIndexArr(htmltext) // Gets an array of HTML block indices
note.getHtmlBlockContentIndexArr(htmltext) // Gets an array of block content indices (excluding the HTML itself).
note.getHtmlBlockTextContentArr(htmltext) // Gets an array of block text contents
note.getHtmlCommentIndex(htmlcomment) // Get the HTML comment index
note.getIncludingHtmlCommentIndex(htmlComment) // Gets the index of HTML comments containing a specific text.
note.getNextHtmlCommentIndex(htmltext) // Get the index of the next HTML comment
note.getHtmlCommentsIndexArr() // Gets an array of indexes for all HTML comments

// === Comment Search ===
note.getIncludingCommentIndex(text, includeHtmlComment = false) // Gets the index of comments containing the specified text.

// === Link Management ===
note.hasLink(link) // Whether the specified link exists
note.LinkGetType(link) // Gets the link type ("Double"/"Single"/"NoLink")
note.LinkIfSingle(link) // Whether the link is unidirectional
note.LinkIfDouble(link) // Whether the link is bidirectional
note.renewLinks() // Updates links (aliases: LinkRenew/renewLink/LinksRenew)
note.clearFailedLinks() // Clean up broken links
note.fixProblemLinks() // Fix problem links
note.linkRemoveDuplicatesAfterIndex(startIndex) // Remove duplicate links after the specified index
note.convertLinksToMN4Version() // Converts links to MN4 version
note.getTextCommentsIndexArr(text) // Gets an array of indices of all comments for the specified text.
note.getLinkCommentsIndexArr(link) // Get the array of link comment indices

// === Content Merge ===
note.mergeInto(targetNote, htmlType) // Merges the text into the target note
note.mergeIntoAndMove(targetNote, targetIndex, htmlType) // Merges and moves to the specified location
note.mergIntoAndRenewReplaceholder(targetNote, htmlType) // Merges and updates placeholders

// === Special Functions ===
note.toBeProgressNote() // Converts to a progress card (grayed out)
note.toBeIndependent() // Makes the card independent
note.move() // Moves the card (mainly used for reference cards)
note.moveProofDown() // Moves the proof to the bottom
note.moveToInput() // Move to the input area
note.getTitleLinkWordsArr() // Gets an array of all linked words in the title
note.getFirstTitleLinkWord() // Get the first title link word
note.generateCustomTitleLinkFromFirstTitlelinkWord(keyword) // Generates a custom title link
note.ifCommentsAllLinksByIndexArr(indexArr) // Check if all comments are links

// === Batch Move and Update ===
note.moveCommentsByIndexArr(indexArr, toIndex) // Batch move comments
note.renew() // Updates the note (alias: renewNote/renewCard)
note.refresh(delay) // Refresh the note display
note.refreshAll(delay) // Refreshes the note and its parent and child notes.

// === Utility Methods ===
note.renewHtmlCommentFromId(comment, id) // Updates the HTML comment (from template ID)
note.mergeClonedNoteFromId(id) // Merge cloned notes

// === New methods (40+) ===
// Note creation and copying
note.createDuplicatedNote(title, colorIndex) // Creates a duplicate note
note.createDuplicatedNoteAndDelete(title, colorIndex) // Creates a duplicate note and deletes the original note.
note.addClassificationNote(title) // Add a categorized note
note.addClassificationNoteByType(type, title) // Add categorized notes by type

// Proof of Content Management
note.renewContentPointsToHtmlType(htmlType) // Update content points to HTML type

// Enhanced comment cleanup
note.clearAllCommentsButMergedImageComment() // Clears all comments but retains the merged image
note.removeCommentsByContent(content) // Remove comments based on content
note.removeCommentsByTrimContent(content) // Remove comments based on the content after removing spaces
note.removeCommentsByIndexArr(indexArr) // Remove comments based on the index array

// HTML block enhancement operations
note.getIncludingHtmlCommentIndex(htmlComment) // Gets the index of the HTML containing a specific HTML.
note.getHtmlBlockTextContentArr(htmltext) // Gets an array of HTML block text contents
note.getTextCommentsIndexArr(text) // Gets an array of text comment indices
note.getLinkCommentsIndexArr(link) // Get the array of link comment indices
```

**Usage Example:**
```javascript
// 1. Batch operations
note.pasteChildNotesByIdArr(["id1", "id2", "id3"]);
note.removeCommentsByTypes(["link", "paint"]); // Delete links and handwritten comments

// 2. HTML Block Operations
let blocks = note.getHtmlBlockIndexArr("Proof:");
note.moveHtmlBlockToBottom("Proof:"); // Move the proof block to the bottom

// 3. Link Management
if (note.hasLink(targetNote.noteURL)) {
  if (note.LinkIfDouble(targetNote.noteURL)) {
    MNUtil.log("Two-way link");
  }
}

// 4. Content Merging
let targetNote = MNNote.getFocusNote();
selectedNotes.forEach(n => n.mergeInto(targetNote, "level1"));
```

## 🎨 Design Patterns and Architecture

### Core Design Patterns

1. **Static Utility Class Pattern**
   - All core functionalities are provided through static methods
   - No instantiation required, just call it directly.
   - Example: `MNUtil.showHUD()`

2. **Factory Pattern**
   - Intelligent object creation with automatic type recognition
   - Example: `MNNote.new()` supports ID/URL/object input.

3. **Decorator Pattern**
   - Prototype extension enhances existing functionality
   - Example: Extensions of String.prototype and MNNote.prototype

4. **Strategy Pattern**
   - Differentiated processing for different card types
   - Example: Special linking rules for categorized cards

5. **Observer Pattern**
   - Event notification mechanism of the logging system
   Example: Automatic error logging and copying

### Performance Optimization Strategies

```javascript
// 1. Lazy loading - Loading system components on demand
static get studyController() {
  if (!this._studyController) {
    this._studyController = this.app.studyController(this.currentWindow);
  }
  return this._studyController;
}

// 2. Batch operations - Reduce API calls
note.appendTextComments("Comment 1", "Comment 2", "Comment 3"); // One-time call
note.removeCommentsByIndices([1, 3, 5]); // Batch delete

// 3. Undo Groups - Supports batch undoing
MNUtil.undoGrouping(() => {
  // Multiple operations as a single undo unit
  note1.title = "New Title";
  note2.colorIndex = 5;
  note3.addTag("Important");
});

// 4. Index Optimization - Delete from back to front
let indices = [1, 3, 5].sort((a, b) => b - a);
indices.forEach(i => note.removeCommentByIndex(i));
```

## 💡 Best Practices

### 1. Initialization and Environment Detection

```javascript
// Plugin entry point main.js
JSB.require('mnutils');
JSB.require('xdyyutils'); // For academic functionality

// Initialization (required)
MNUtil.init(self.path);

// Environmental monitoring
if (MNUtil.isMN4()) {
  // MarginNote 4 unique features
}

// Version compatibility handling
let version = MNUtil.version;
if (version.version >= "3.7.21") {
  // Using the new API
}
```

### 2. Error Handling and Logging

```javascript
// Unified error handling mode
function safeExecute(func, funcName) {
  try {
    return func();
  } catch (error) {
    MNUtil.addErrorLog(error, funcName, {
      noteId: MNNote.getFocusNote()?.noteId,
      timestamp: new Date().toISOString()
    });
    MNUtil.showHUD("Operation failed, error logged");
    return null;
  }
}


### 3. User Experience Optimization

```javascript
// 1. Reduce pop-up interference
let note = MNUtil.getNoteById(noteId, false); // Silent mode

// 2. Use HUD instead of alert
MNUtil.showHUD("Operation successful", 1.5); // Disappears automatically after 1.5 seconds.

// 3. Display a waiting prompt before batch operations
MNUtil.waitHUD("Processing, please wait...");
// Perform time-consuming operations
MNUtil.showHUD("Processing complete");

// 4. Refresh after the operation is complete
note.refresh();
MNUtil.refreshAfterDBChanged();
```

### 4. Memory Management

```javascript
// 1. Release large objects promptly
let largeData = processData();
// After use
largeData = null;

// 2. Avoid circular references
note.customData = {
  // Do not store references to the note itself.
  noteId: note.noteId // Stores only the ID
};

// 3. Use weak references to store temporary data
let cache = new WeakMap();
cache.set(note.note, tempData);
```

## 🔧 Advanced Theme

### Pop-up API Usage

```javascript
// Standard pop-up window calling method
UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
  "Selection Operation", // Title
  "Please select an option", // Message
  0, // Style: 0 = Normal, 1 = Password, 2 = Input box
  "Cancel", // Cancel button
  ["Option 1", "Option 2"], // Other buttons
  (alert, buttonIndex) => {
    if (buttonIndex === 0) return; // Cancel
    // buttonIndex >= 1 corresponds to other buttons
    let selected = ["option1", "option2"][buttonIndex - 1];
  }
);
```


### File Path Handling

```javascript
// Use absolute path
let imagePath = MNUtil.mainPath + "/images/icon.png";

// Check file existence
if (NSFileManager.defaultManager().fileExistsAtPath(imagePath)) {
  // Processing files
}

// Create directory
MNUtil.createFolder(MNUtil.documentFolder + "/MyPlugin");
```

## ⚠️ Important Notes

### 1. Chinese punctuation marks
**Important:** Use `""` instead of `""`
- Use `Pangu.spacing()` to automatically handle spacing between Chinese and English characters.
- Mathematical symbols require special handling (∞, ∑, etc.)

### 2. API Compatibility
```javascript
// Main changes from MN3 to MN4
- marginnote3app:// → marginnote4app://
- Some API method names have changed
- Use MNUtil.isMN4() to determine the version.
```

### 3. Performance Considerations
- Avoid calling APIs frequently in loops
- Use `undoGrouping` for large-scale operations
- Use `delay` appropriately to avoid interface lag.
- Be aware of memory leaks and release large objects promptly.

### 4. Debugging Techniques
```javascript
// 1. Use a logging system
MNUtil.log({
  message: "Debugging information",
  level: "DEBUG",
  detail: { noteId: note.noteId }
});

// 2. Copy the object to the clipboard to view.
MNUtil.copyJSON({
  note: note.noteTitle,
  comments: note.comments.length
});

// 3. Automatic error copying
// MNUtil.addErrorLog will automatically copy error messages.
```

### 5. Common API Usage Errors

#### 5.1 MNNote Static Method Call Error
```javascript
// ❌ Error: MNNote.focusNote is not a valid property
let focusNote = MNNote.focusNote; // Error: undefined is not an object

// ✅ Correct: Use the getFocusNote() method
let focusNote = MNNote.getFocusNote();
```

#### 5.2 Data Type Inconsistency Issues
```javascript
// ❌ Error: Mixing MNNote instances and native note objects
let focusNote = MNNote.getFocusNote();
let targetNotes = [focusNote]; // Error: It should be a raw object array

// ✅ Correct: Use the .note property to get the native object
let focusNote = MNNote.getFocusNote();
let targetNotes = [focusNote.note]; // Correct: Raw object array

// ✅ Correct: Processing sub-note arrays
targetNotes = rootNote.childNotes.map(mnNote => mnNote.note);
```

**Important Note**:
- The static methods of the MNNote class return an MNNote instance (encapsulated object).
- When you need the native note object, access it using the `.note` property.
- Ensure data type consistency in arrays during batch operations.

## 📚 API Usage Examples

```javascript
// === Basic Operations ===
// Get the current note
let note = MNNote.getFocusNote();
let notes = MNNote.getFocusNotes();

// Create a new note
let newNote = MNNote.new({
  title: "New Notes"
  content: "content",
  colorIndex: 5,
  tags: ["Important", "To-do"]
});

// === Comment Operations ===
note.appendTextComment("Normal Text");
note.appendMarkdownComment("**Markdown** text");

// === Batch Operations ===
MNUtil.undoGrouping(() => {
  notes.forEach(note => {
    note.colorIndex = 3;
    note.appendTags(["Processed"]);
  });
});

// === Network Request ===
let response = await MNConnection.fetch("https://api.example.com/data", {
  method: "POST"
  json: { key: "value" }
});

// === Menu Creation ===
let menu = new Menu(button, self, 250);
menu.addMenuItem("Copy", "copyNote:", note);
menu.addMenuItem("makeCard", "makeCard:", note, note.isCard);
menu.show();


```

## 📊 Complete API Quick Reference Table

| Class Name | Core Functionality | Most Commonly Used APIs |
|------|----------|-------------|
| **MNUtil** | System Tools | `showHUD()`, `copy()`, `getNoteById()`, `delay()`, `undoGrouping()` |
| **MNNote** | Note-taking operations | `getFocusNote()`, `getSelectedNotes()`, `new()`, `title`, `colorIndex`, `appendTextComment()` |
| **MNComment** | Comment Management | `text`, `type`, `from()`, `getCommentType()` |
| **MNNotebook** | Notebook | `currentNotebook`, `notes`, `open()`, `type` |
| **MNDocument** | Documentation| `docMd5`, `pageCount`, `open()`, `textContentsForPageNo()` |
| **MNConnection** | Network| `fetch()`, `readWebDAVFile()`, `getOnlineImage()` |
| **MNLog** | Log System | `log()`, `info()`, `error()`, `showLogViewer()`, `showHUD()` |
| **Menu** | Menu UI | `addMenuItem()`, `show()`, `dismiss()` |
| **MNButton** | Button UI | `new(config)` |
| **MNExtensionPanel** | Panel Controls | `show()`, `toggle()`, `addSubview()` |
| **HtmlMarkdownUtils** | HTML styles | `createHtmlMarkdownText()`, `icons.*`, `styles.*` |
| **Pangu** | Chinese Layout | `spacing()`, `toFullwidth()` |

## ⚠️ Important Note

1. **Framework already loaded by default**: In other plugin projects, MNUtils is already loaded by default, and all the above classes and methods can be used directly.

2. **Initialization Requirements**: `MNUtil.init(self.path)` must be called before using MNUtils.

3. **Version Compatibility**: Use `MNUtil.isMN4()` and `MNUtil.isMN3()` to determine the version.

4. **Method Overriding:** xdyyutils.js modified some default behaviors.

### 📝 Explanation of Method Overriding in xdyyutils.js

To better support academic scenarios, xdyyutils.js rewrote some default behaviors in mnutils.js:

| Overridden Method | Original Default Value | New Default Value | Impact Description |
|------------|---------|----------|---------|
| `MNUtil.getNoteById(noteId, alert)` | alert = **true** | alert = **false** | Silent mode, do not display error pop-ups |
| `MNNote.prototype.moveComment(from, to, msg)` | msg = **true** | msg = **false** | Do not display prompts when moving comments |

**Note:** If your plugin depends on the existing default behavior, please explicitly pass in the parameters:
```javascript
// Explicitly use the original default behavior
MNUtil.getNoteById(noteId, true); // Display error pop-up
note.moveComment(0, 2, true); // Display move comment
```

## 🎯 Summary

The MNUtils framework provides the following for MarginNote plugin development:

1. **Complete API Encapsulation:** Covering everything from basic to advanced.
2. **Optimized for Academic Scenarios:** Specifically designed for mathematics and research needs.
3. **Best Practice Guidance: Proven Development Patterns**
4. **Powerful scalability:** Supports various customization needs.

By mastering this framework, you can:
- Rapidly develop powerful plugins
- Provide an excellent user experience
- Building complex knowledge management systems
- Contribute to the MarginNote ecosystem

Remember: **MNUtils is not just a plugin, but a powerful development platform.**
