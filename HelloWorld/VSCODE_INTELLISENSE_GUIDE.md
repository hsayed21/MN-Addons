# VSCode IntelliSense Setup Guide

This Hello World plugin is fully configured for VSCode with IntelliSense support!

## ✅ What's Already Configured

### 1. `jsconfig.json`
- **Type Checking**: Enabled with `checkJs: true`
- **Type Definitions**: Linked to `../index.d.ts` (3,407 lines of MarginNote API types)
- **ES6 Support**: Configured for modern JavaScript
- **Auto-completion**: Full MarginNote API autocomplete

### 2. Type Definitions Available

The parent directory's `index.d.ts` provides types for:
- **Core Classes**: `Application`, `Database`, `Note`, `MbBookNote`, `MbTopic`
- **UI Classes**: `UIView`, `UIButton`, `UILabel`, `UIWebView`, `UIColor`
- **System Classes**: `NSData`, `NSString`, `NSURL`, `NSFileManager`, `NSNotificationCenter`
- **Objective-C Bridge**: `JSB` class and methods

## 🚀 Using IntelliSense

### Auto-Completion

Type any object and press `Ctrl+Space` (Windows) or `Cmd+Space` (Mac):

```javascript
// Type "self.app." and IntelliSense shows:
self.app.showHUD()          // ← Method completion
self.app.alert()            // ← With parameter hints
self.app.appVersion         // ← Property completion
self.app.studyController()  // ← Return type info
```

### Hover Documentation

Hover over any method to see:
- Parameter types
- Return types
- Method descriptions

```javascript
// Hover over "showHUD" to see:
// showHUD(message: string, view: any, duration: number): void
self.app.showHUD("Hello", self.window, 2);
```

### Parameter Hints

Type a method name and open parenthesis to see parameter hints:

```javascript
Database.sharedInstance().getNoteById(
  // ← Shows: (noteid: string) => MbBookNote
)
```

### Go to Definition

`Ctrl+Click` (Windows) or `Cmd+Click` (Mac) on any type to jump to definition:

```javascript
// Click on "NSNotificationCenter" to see type definition
NSNotificationCenter.defaultCenter()
```

## 🔍 IntelliSense Examples

### Example 1: Application API

```javascript
sceneWillConnect: function () {
  // Type "self.app." to see all available methods:
  self.app.
    // showHUD(message, view, duration)
    // alert(message)
    // openURL(url)
    // studyController(window)
    // checkNetworkStatus()
    // currentTheme
    // appVersion
    // focusWindow
    // osType
}
```

### Example 2: Database API

```javascript
notebookWillOpen: function (topicid) {
  // Type "Database.sharedInstance()." to see:
  const db = Database.sharedInstance();
  db.
    // getNotebookById(topicid)
    // getNoteById(noteid)
    // getMediaByHash(hash)
    // refreshAfterDBChanged(topicid)
}
```

### Example 3: Note API

```javascript
onProcessNewExcerpt: function (sender) {
  const note = Database.sharedInstance().getNoteById(sender.userInfo.noteid);
  
  // Type "note." to see all properties:
  note.
    // noteId (string)
    // noteTitle (string)
    // excerptText (string)
    // colorIndex (number)
    // fillIndex (number)
    // createDate (Date)
    // modifiedDate (Date)
    // parentNote (MbBookNote)
    // childNotes (MbBookNote[])
    // comments (Comment[])
    // appendTextComment(text)
    // appendHtmlComment(html, text, size, tag)
    // focusInMindMap()
}
```

### Example 4: NSNotificationCenter API

```javascript
notebookWillOpen: function (topicid) {
  // Type "NSNotificationCenter." to see:
  NSNotificationCenter.
    // defaultCenter() ← Returns NSNotificationCenter instance
  
  // Then type "center." to see instance methods:
  const center = NSNotificationCenter.defaultCenter();
  center.
    // addObserverSelectorName(observer, selector, name)
    // removeObserverName(observer, name)
    // postNotificationName(name, object)
}
```

## 🎯 IntelliSense Best Practices

### 1. Always Use `self` for Instance Data

```javascript
sceneWillConnect: function () {
  // ✅ GOOD: IntelliSense recognizes self
  self.myData = { count: 0 };
  self.myData.  // ← IntelliSense works
  
  // ❌ BAD: IntelliSense can't track global vars
  let myData = { count: 0 };
  myData.  // ← No IntelliSense for structure
}
```

### 2. Use JSDoc Comments for Custom Types

```javascript
/**
 * Process a note and return metadata
 * @param {MbBookNote} note - The note to process
 * @returns {{title: string, count: number}} Metadata object
 */
processNote: function (note) {
  return {
    title: note.noteTitle,
    count: note.childNotes.length
  };
}
```

### 3. Leverage Type Inference

```javascript
notebookWillOpen: function (topicid) {
  // VSCode infers that 'notebook' is MbTopic
  const notebook = Database.sharedInstance().getNotebookById(topicid);
  
  // Now IntelliSense knows notebook properties
  notebook.  // ← Shows: topic, notes, allNotes(), etc.
}
```

## 🐛 Troubleshooting IntelliSense

### Issue: IntelliSense Not Working

**Solution 1**: Reload VSCode Window
1. Press `Ctrl+Shift+P` (Windows) or `Cmd+Shift+P` (Mac)
2. Type "Reload Window"
3. Press Enter

**Solution 2**: Check TypeScript Version
1. Open Command Palette
2. Type "TypeScript: Select TypeScript Version"
3. Choose "Use Workspace Version" or latest

**Solution 3**: Verify `jsconfig.json`
- Ensure file exists in `HelloWorld/` folder
- Check that `../index.d.ts` path is correct
- Verify no JSON syntax errors

### Issue: Type Definitions Not Found

**Check 1**: Verify `index.d.ts` exists in parent directory
```bash
ls ../index.d.ts  # Should show the file
```

**Check 2**: Update `jsconfig.json` path if needed
```json
{
  "include": [
    "*.js",
    "../index.d.ts"  // ← Adjust if index.d.ts is elsewhere
  ]
}
```

### Issue: Red Squiggly Lines (False Errors)

Some patterns may show false errors:

```javascript
// JSB.defineClass may show error - this is OK
const HelloWorldPlugin = JSB.defineClass(
  'HelloWorld : JSExtension',  // ← May underline as error
  { /* ... */ }
);
```

**Solution**: These are safe to ignore if the plugin runs correctly.

## 📚 Type Definition Reference

### Quick Reference

| API Area | Type Definition | Location in index.d.ts |
|----------|----------------|------------------------|
| Application | `Application` | Line ~100 |
| Database | `Database` | Line ~200 |
| Notes | `MbBookNote` | Line ~500 |
| Notebooks | `MbTopic` | Line ~800 |
| UI Views | `UIView`, `UIButton` | Line ~1500 |
| Notifications | `NSNotificationCenter` | Line ~2000 |
| File System | `NSFileManager` | Line ~2500 |
| Network | `NSURLSession` | Line ~3000 |

### Full API Documentation

For complete API documentation, see:
- `../index.d.ts` - Type definitions (3,407 lines)
- `../MarginNote_Plugin_Development_Comprehensive_Guide.md` - Complete guide
- `../mnutils/MNUtils_API_Guide.md` - MNUtils framework API

## ✨ Advanced IntelliSense Tips

### Tip 1: Use JSDoc for Complex Objects

```javascript
/**
 * @typedef {Object} TaskData
 * @property {string} id - Task ID
 * @property {string} title - Task title
 * @property {Date} dueDate - Due date
 * @property {number} priority - Priority (1-5)
 */

/**
 * Process task data
 * @param {TaskData} task
 */
processTask: function (task) {
  task.  // ← IntelliSense shows: id, title, dueDate, priority
}
```

### Tip 2: Type Casting for Better IntelliSense

```javascript
// Cast to specific type
/** @type {MbBookNote} */
const note = Database.sharedInstance().getNoteById(noteid);

// Now IntelliSense knows exact type
note.  // ← Full MbBookNote API
```

### Tip 3: Enum-like Constants with IntelliSense

```javascript
/**
 * Study modes
 * @enum {number}
 */
const StudyMode = {
  DOC: 0,
  MINDMAP: 1,
  OUTLINE: 2,
  REVIEW: 3
};

// IntelliSense suggests:
const mode = StudyMode.  // ← DOC, MINDMAP, OUTLINE, REVIEW
```

## 🎓 Learning Resources

1. **Start with IntelliSense Exploration**
   - Open `main.js`
   - Type `self.app.` and explore available methods
   - Hover over methods to read documentation

2. **Read Type Definitions**
   - Open `../index.d.ts`
   - Search for `declare class Application`
   - Study available APIs

3. **Practice with Examples**
   - Modify `onButtonClick` method
   - Try different `self.app` methods
   - Experiment with `Database` API

4. **Reference Documentation**
   - See `README.md` for API patterns
   - Check other plugins in `../` for examples
   - Read comprehensive guides

---

**Happy Coding with IntelliSense! 🎉**

Your VSCode setup is complete and ready for MarginNote plugin development!
