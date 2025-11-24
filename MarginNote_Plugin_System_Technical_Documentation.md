# MarginNote plug-in system technical documentation

## 1. System Architecture Overview

### 1.1 Technical basis

MarginNote's plug-in system is built based on the bridging technology of Objective-C and JavaScript (JSBridge). Plug-ins are ostensibly written in JavaScript, but actually call the underlying Objective-C API through the JSBridge framework to implement functions.

**Key Features:**
- Using the older JSBridge framework, there are some compatibility issues
- Unable to use Node.js API
- Limited Browser API support (implemented based on Safari)
- There are differences between iOS and macOS platforms

### 1.2 Plug-in file structure

The MarginNote plug-in has the suffix `.mnaddon` and is essentially a ZIP compressed package containing the following core files:

```
plugin.mnaddon/
├── mnaddon.json # Plug-in description list
├── main.js # Plug-in main code
└── logo.png # plug-in icon (44x44)
```

#### mnaddon.json configuration list

```json
{
  "addonid": "marginnote.extension.example",
  "author": "author name",
  "title": "Plug-in name",
  "version": "1.0.0",
  "marginnote_version_min": "3.7.21",
  "cert_key": ""
}
```

- `addonid`: The unique identifier of the plug-in, uniformly use the `marginnote.extension.` prefix
- `marginnote_version_min`: the minimum supported version of MarginNote
- `cert_key`: official signing key (requires application)

## 2. Plug-in object (JSExtension)

### 2.1 Plug-in creation mechanism

Add-ons are created through the `JSB.newAddon` function, which returns an Objective-C class inherited from `JSExtension`:

```javascript
JSB.newAddon = () => {
  return JSB.defineClass(
    "PluginName: JSExtension", // class name and parent class
    {
      //Instance method
    },
    {
      // Class method (static method)
    }
  )
}
```

### 2.2 JSB.defineClass Parameter Description

1. **Class declaration**: The format is `"ClassName: ParentClass"`
2. **Instance methods**: including life cycle methods, event processing methods, plug-in button interaction, etc.
3. **Class method**: Mainly includes static methods for plug-in installation and uninstallation

### 2.3 self object

`self` refers to the plugin instance (Objective-C object) and can only be used in instance methods.

**Important note**: MarginNote supports multiple windows. The plug-in instances of different windows are independent of each other, but JavaScript variables are shared by multiple windows. To differentiate window data, variables must be mounted on `self`.

## 3. Life cycle management

### 3.1 Instance method life cycle

#### Window life cycle
- `sceneWillConnect()`: triggered when creating a new MN window
- `sceneDidDisconnect()`: triggered when closing the MN window
- `sceneWillResignActive()`: triggered when the window loses focus
- `sceneDidBecomeActive()`: triggered when the window gains focus

#### Notebook life cycle
- `notebookWillOpen(topicid: string)`: triggered when a notebook is opened
- `notebookWillClose(topicid: string)`: triggered when closing the notebook

#### Document life cycle
- `documentDidOpen(docmd5: string)`: triggered when opening a document
- `documentWillClose(docmd5: string)`: triggered when closing the document

### 3.2 Static method life cycle

- `addonDidConnect()`: triggered when plug-in is installed, enabled or MN starts
- `addonWillDisconnect()`: triggered when the plug-in is uninstalled or deactivated

**Note**: Crossing out the background directly on iPad will not trigger the close event, and the relevant logic should be processed when entering the background.

## 4. Event monitoring system

### 4.1 Event listener registration

Usually add event listening when opening the notebook:

```javascript
//Add listener
NSNotificationCenter.defaultCenter().addObserverSelectorName(
  self,
  "onProcessNewExcerpt:", // note the colon
  "ProcessNewExcerpt"
)

// Remove the listener
NSNotificationCenter.defaultCenter().removeObserverName(
  self,
  "ProcessNewExcerpt"
)
```

### 4.2 Core event types

#### Excerpt related
- `ProcessNewExcerpt`: triggered when excerpting from PDF
  - `userInfo.noteid`: Get the excerpt note ID
- `ChangeExcerptRange`: triggered when the excerpt range is modified
  - `userInfo.noteid`: Get note ID

#### Menu related
- `PopupMenuOnNote`: triggered when the note popup menu is clicked
  - `userInfo.note`: Get the note object
- `ClosePopupMenuOnNote`: triggered when the note menu disappears
- `PopupMenuOnSelection`: Triggered when text popup menu is selected in PDF
  - `userInfo.documentController.selectionText`: Get the selected text
- `ClosePopupMenuOnSelection`: triggered when the selected text menu disappears

#### OCR related
- `OCRImageBegin`: triggered when OCR starts
- `OCRImageEnd`: triggered when OCR ends

#### URL Scheme
- `AddonBroadcast`: triggered when opening a URL in a specific format
  - Format: `marginnote3app://addon/[addonid]?params`
  - `userInfo.message`: Get URL parameters

## 5. Core API system

### 5.1 Application API

Get application examples:
```javascript
const app = Application.sharedInstance()
```

Main properties and methods:
- `appVersion`: version number
- `currentTheme`: current theme
- `focusWindow`: focus window
- `osType`: operating system type
- `studyController(window)`: Get the study controller
- `showHUD(message, view, duration)`: Display prompt message
- `alert(message)`: display warning box
- `openURL(url)`: Open URL

### 5.2 Database API

Get the database instance:
```javascript
const db = Database.sharedInstance()
```

Main methods:
- `getMediaByHash(hash)`: Get media files based on hash value
- `refreshAfterDBChanged(notebookid)`: Refresh note data

### 5.3 StudyController

Core objects that control the learning interface:

```javascript
const studyController = app.studyController(window)
```

Main attributes:
- `studyMode`: study mode (0: document mode, 1: study mode, 2: review mode, 3: brain map mode)
- `notebookController`: notebook controller
- `readerController`: reader controller

Main methods:
- `refreshAddonCommands()`: Refresh the plug-in button state
- `becomeFirstResponder()`: Set as the first responder

### 5.4 Plug-in button interaction

Set the plugin button through the `queryAddonCommandStatus` method:

```javascript
queryAddonCommandStatus() {
  return {
    image: "logo_44x44.png", // Icon file
    object: self, // handle object
    selector: "onToggle:", // Click trigger method
    checked: self.status // checked status
  }
}
```

## 6. Data model

### 6.1 MbBookNote (note object)

#### Create Note
```javascript
const note = Note.createWithTitleNotebookDocument(
  title, // title
  notebook, // MbTopic object
  document // MbBook object
)
```

#### Writable properties
- `excerptText`: excerpt text
- `noteTitle`: note title
- `colorIndex`: color index (0-15)
- `fillIndex`: fill type index (0-2)

#### Read-only properties
- `noteId`: note ID
- `docMd5`: Document MD5
- `notebookId`: Notebook ID
- `createDate`: creation date
- `modifiedDate`: modified date
- `comments`: array of comments
- `parentNote`: parent note
- `childNotes`: array of child notes
- `linkedNotes`: List of linked notes
- `excerptPic`: excerpt picture
- `mediaList`: media list (hash separated by `-`)

#### Instance methods
- `clearFormat()`: clear format
- `merge(note)`: merge notes
- `appendTextComment(text)`: Add text comment
- `appendHtmlComment(html, text, size, tag)`: Add HTML comment
- `appendNoteLink(note)`: Add note link
- `removeCommentByIndex(index)`: delete comment

### 6.2 Comment system

Comment type:
- `TextComment`: text comment
- `HtmlComment`: HTML comment
- `LinkComment`: Link comment (generated by merging notes)
- `PaintComment`: Picture comments

Comment structure example:
```javascript
{
  type: "TextNote",
  text: "Comment content",
  noteid: "Note ID" // Valid after merging
}
```

### 6.3 Media processing

Get media files:
```javascript
// Get the excerpt image
const imageData = db.getMediaByHash(note.excerptPic.paint)
const base64 = imageData?.base64Encoding()

// Get all media
const mediaHashes = note.mediaList?.split("-")
const mediaFiles = mediaHashes?.map(hash => db.getMediaByHash(hash))
```

## 7. Data storage

### 7.1 NSUserDefaults persistence

Use NSUserDefaults to store configuration data:

```javascript
// store data
NSUserDefaults.standardUserDefaults().setObjectForKey(data, key)

// read data
const data = NSUserDefaults.standardUserDefaults().objectForKey(key)
```

**Note**:
- Can store JSON objects directly without converting to strings
- Cannot contain `undefined` value, otherwise an error will be reported
- Data is retained after app restart

### 7.2 Configuration management recommendations

It is recommended to use hierarchical configuration key names:
- Global configuration: `plugin_global_config`
- Notebook configuration: `plugin_notebook_${notebookId}`
- Document configuration: `plugin_doc_${docMd5}`

## 8. Development Practice

### 8.1 Basic plug-in example

```javascript
JSB.newAddon = () => {
  return JSB.defineClass(
    "MyPlugin: JSExtension",
    {
      //Initialized when the window is opened
      sceneWillConnect() {
        self.app = Application.sharedInstance()
        self.studyController = self.app.studyController(self.window)
      },

      //Add event listener when opening notebook
      notebookWillOpen(topicid) {
        NSNotificationCenter.defaultCenter().addObserverSelectorName(
          self,
          "onProcessNewExcerpt:",
          "ProcessNewExcerpt"
        )
      },

      // Handle excerpt events
      onProcessNewExcerpt(sender) {
        const noteid = sender.userInfo.noteid
        // Processing logic
      },

      // Clean up when closing notebook
      notebookWillClose(topicid) {
        NSNotificationCenter.defaultCenter().removeObserverName(
          self,
          "ProcessNewExcerpt"
        )
      },

      //Plug-in button configuration
      queryAddonCommandStatus() {
        return {
          image: "logo_44x44.png",
          object: self,
          selector: "onButtonClick:",
          checked: false
        }
      },

      // Button click processing
      onButtonClick() {
        self.app.showHUD("Hello MarginNote!", self.window, 2)
      }
    },
    {
      //When the plug-in is installed
      addonDidConnect() {
        //Initialization operation
      }
    }
  )
}
```

### 8.2 Debugging method

Use Console.app to view the logs:
```javascript
JSB.log("plugin-key %@", object)
```

Filter log output by plugin key in Console.app.

### 8.3 Multi-window processing

Ensure data isolation:
```javascript
sceneWillConnect() {
  // Mount window specific data to self
  self.windowData = {
    status: false,
    config: {}
  }
}
```

### 8.4 Asynchronous operation support

Plugin supports async/await:
```javascript
async onButtonClick() {
  const result = await someAsyncOperation()
  self.app.showHUD(result, self.window, 2)
}
```

## 9. Platform differences

### 9.1 iOS vs macOS

- iOS does not support some shortcut key operations
- macOS has more complete file system access
- UI controls may behave differently

### Compatible with version 9.2

- MarginNote 3: Version number < 4.0.0
- MarginNote 4 (MNE): version number >= 4.0.0
- It is recommended to set `marginnote_version_min: "3.7.21"` to ensure basic API support

## 10. Restrictions and Precautions

### 10.1 Technical limitations

- Unable to use Node.js modules
- Unable to use fetch API (need to use NSURLConnection)
- JavaScript features not supported by Safari cannot be used
- Unable to directly operate the file system (need to pass NSFileManager)

### 10.2 Performance Notes

- Avoid performing time-consuming operations on the main thread
- Remove unnecessary event listeners promptly
- Reasonable use of cache to avoid double calculations

### 10.3 Security considerations

- Unsigned plug-ins require manual permission from the user
- Avoid storing sensitive information
- Handle user data with caution

## Summary

Although the MarginNote plug-in system is based on an older technology stack, it provides a rich API interface and can achieve powerful note processing functions. Developers need to understand the bridging mechanism between Objective-C and JavaScript and be familiar with the life cycle and event system in order to develop stable and efficient plug-ins.

By rationally utilizing the MbBookNote data model, event listening system, and persistent storage, complex functions such as automated processing of excerpts, batch operation of cards, and intelligent management of notes can be realized.
