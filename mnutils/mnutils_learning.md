# 🚀 MNUtils Plugin Development Learning Journey > Understanding the Secrets of MarginNote Plugin Development Step by Step from Scratch ## 📖 Foreword Hi! Welcome to the MNUtils learning journey. If this is your first time developing a MarginNote plugin, don't worry, we'll build a knowledge system piece by piece, like building blocks.

Who is this document suitable for?
- 🌱 For complete beginners with no plugin development experience - 🔍 For developers who want to understand the inner workings of MNUtils - 🎯 For creators who want to develop their own plugins for MarginNote---

## Chapter 1: Starting with a Simple Requirement ### 🤔 The Beginning of the Story Imagine you're developing a MarginNote plugin. Suddenly, the plugin malfunctions! You don't know where the error is, and you can't see any error messages. At this moment, you desperately wish there was a tool that could record and display everything that happened...

This is why the **Log Viewer** was created!

### 📝 What is a log?

Logs are like a program's **diary**:

```
8:00 AM - The user opened the plugin ✅
8:01 AM - Loading configuration file ✅
8:02 AM - Connection to server failed ❌
8:03 AM - Retrying connection... ⏳
```

We record everything the program does. When a problem occurs, we can refer to the log to see what happened.

### 🎯 What should we do?

To create a log viewer, you need:
1. **Collect Logs** - Gather information from various sources. 2. **Store Logs** - Save the information. 3. **Display Logs** - Present the logs in a user-friendly interface. 4. **Filter and Search** - Quickly find the information you need. Sounds simple? Let's get started!

---

## Chapter 2: Understanding the World of MarginNote Plugins ### 🏰 Three-Tier Architecture - Like a Three-Story House The MarginNote plugin is like a three-story house:

```
    🏠 Your plugin is on the 3rd floor of the house [Web Interface Layer] 👤 Users are here ↕️ Stairs (Communication)
    2nd Floor [JavaScript] 🧠 The logic is here ↕️ Stairs (bridge)
    Floor 1 [Native] 💪 The system is here```

- **Floor 1 (Native)**: Deals with the MarginNote system; powerful but not flexible enough. - **Floor 2 (JavaScript)**: Handles business logic; the brain of the entire plugin. - **Floor 3 (Web)**: A beautiful interface; where users see and interact. ### 🤝 How do they communicate?

Just as stairs are needed between floors, these three floors also need a "communication method":

```
The user clicks the button (3rd floor).
    ↓ "The boss wants to see the logs!"
JavaScript (2nd floor)
    "System, give me the log data!"
Native (1st floor)
    ↓ "This is all the logs"
JavaScript (2nd floor)
    ↓ "It's all organized, ready to be shown to users."
Displayed on the interface (3rd floor)
```

### 💡 Why design it this way?

Imagine if all the functions were crammed into one layer:
- ❌ Code will become messy - ❌ Modifying one part may affect everything - ❌ Difficult to maintain and extend after layering:
- ✅ Clear and concise division of labor - ✅ Independent modification of a specific layer - ✅ Easy to understand and maintain

## Chapter 3: Writing Your First Line of Code ### 🎬 Let's start with the simplest log class and create a very basic log manager:

```javascript
// This is our log manager class SimpleLogger {
  constructor() {
    // Prepare a container for the logs this.logs = []
  }

  // Log a message log(message) {
    // Create log entries (like writing a diary)
    const logEntry = {
      message: message, // What to say time: new Date().toLocaleTimeString() // What time it was said}

    // Put it into the box: this.logs.push(logEntry)

    // Print it out to see: console.log(`[${logEntry.time}] ${logEntry.message}`)
  }

  // View all logs showAll() {
    console.log("📋 All logs:")
    this.logs.forEach(log => {
      console.log(` [${log.time}] ${log.message}`)
    })
  }
}

// Give it a try!
const logger = new SimpleLogger()
logger.log("Plugin started")
logger.log("User clicked the button")
logger.showAll()
```

### 🎮 Hands-on Practice #1

Try modifying the code above to add a "log level" feature:
- INFO (General Information) uses ℹ️
- WARN (warning) with ⚠️
- ERROR (Error) is marked with ❌

<details>
<summary>💡 Tip (click to expand)</summary>

```javascript
log(message, level = 'INFO') {
  const icons = {
    'INFO': 'ℹ️',
    'WARN': '⚠️'
    'ERROR': '❌'
  }
  // ... Continue to complete}
```
</details>

---

## Chapter 4: Making the Log "Come Alive" - ​​Adding UI

### 🎨 Logs from the console to the web console are too boring, let's create a beautiful web interface!

#### Step 1: Creating the HTML Structure ```html
This is our log display platform -->
<!DOCTYPE html>
<html>
<head>
    <title>My Log Viewer</title>
    <style>
        /* Decorate our stage */
        .log-container {
            background: #f5f5f5;
            padding: 10px;
            height: 400px;
            overflow-y: auto; /* If there's too much data, it can be scrolled */
        }

        .log-entry {
            background: white;
            margin: 5px 0;
            padding: 8px;
            border-radius: 4px;
            font-family: monospace; /* Use a monospace font */
        }

        /* Different levels, different colors */
        .log-error { border-left: 3px solid red; }
        .log-warn { border-left: 3px solid orange; }
        .log-info { border-left: 3px solid blue; }
    </style>
</head>
<body>
    <h2>📋 Log Viewer</h2>
    <div id="logContainer" class="log-container">
        <!-- Logs will be displayed here-->
    </div>
</body>
</html>
```

#### Step Two: Add Logs Using JavaScript ```javascript
// Now we're going to interact with the webpage!
class WebLogger {
  constructor(containerId) {
    // Locate the container for the logs: this.container = document.getElementById(containerId)
  }

  // Add a log entry to the page addLog(message, level = 'info') {
    // Create a new log element const logDiv = document.createElement('div')
    logDiv.className = `log-entry log-${level.toLowerCase()}`

    // Set content const time = new Date().toLocaleTimeString()
    logDiv.textContent = `[${time}] ${message}`

    // Add to the container this.container.appendChild(logDiv)

    // Automatically scroll to the bottom (to see the latest)
    this.container.scrollTop = this.container.scrollHeight
  }
}

// Example usage: const webLogger = new WebLogger('logContainer')
webLogger.addLog('System Startup', 'info')
webLogger.addLog('Warning: High memory usage', 'warn')
webLogger.addLog('Error: Network connection failed', 'error')
```

### 🎯 Understanding Key Concepts: **DOM Manipulation** - Like Building Blocks ```javascript
document.getElementById('logContainer') // Finds the specified block. document.createElement('div') // Creates a new block. container.appendChild(logDiv) // Adds the block inside.

**CSS class names** - like adding tags to JavaScript
logDiv.className = 'log-entry log-error' // Add two tags // CSS will decorate according to the tags: red border indicates an error```

---

## Chapter 5: Connecting Native and Web - Building Communication Bridges ### 🌉 Understanding the Challenges of Communication Native and Web are like two people speaking different languages:
- Native speaks "Objective-C language"
- The Web Speaks "JavaScript"

We need a translator!

### 📡 Method 1: JavaScript injection into Native allows you to "speak" to web pages:

```javascript
// Native side: Injecting JavaScript into the webpage
subscriptionController.prototype.sendLogToWeb = function(log) {
  // Prepare what to say const message = JSON.stringify(log)

  // Encoding (to prevent damage from special characters)
  const encoded = encodeURIComponent(message)

  // Sending a message to the webpage
  this.webview.runJavaScript(
    `receiveLog('${encoded}')` // Calls a function on the webpage)
}

// Web side: Ready to receive function receiveLog(encodedLog) {
  // Decode const message = decodeURIComponent(encodedLog)
  const log = JSON.parse(message)

  // Display logs: webLogger.addLog(log.message, log.level)
}
```

### 📡 Method Two: URL Scheme

The web can send signals to native systems via special URLs:

```javascript
// Web side: Send signal function askForLogs() {
  // Construct a special URL
  window.location.href = 'mnutils://getLogs'
}

// Native side: Receive signals if (url.startsWith('mnutils://')) {
  const action = url.split('://')[1]
  if (action === 'getLogs') {
    // Send logs to the web
    this.sendAllLogs()
  }
}
```

### 🎮 Hands-on Practice #2

Draw a flowchart of Native and Web communication:
1. The user clicks the "Refresh Logs" button. 2. The Web server sends a request to the Native server.
3. Native code retrieves log data. 4. Native code sends data to the Web application.
5. Web-based log display <details>
<summary>💡 Reference Answer</summary>

```
User clicks button ↓
[Web] "mnutils://refresh
    ↓
[Native] Request received ↓
[Native] Get MNLog.logs
    ↓
[Native] runJavaScript('showLogs(...)')
    ↓
[Web] Display logs```
</details>

---

## Chapter 6: Handling Real-World Challenges ### 🎯 Challenge 1: What to do with too many logs?

Imagine you have 10,000 log entries. Here's the problem:
- 📱 Memory will run out - 🐌 The interface will lag - 😵 Users will feel lost **Solution: Circular buffer**

```javascript
class SmartLogger {
  constructor(maxLogs = 1000) {
    this.logs = []
    this.maxLogs = maxLogs // Maximum of 1000 records can be stored.

  log(message) {
    // Add a new log entry this.logs.push({
      message,
      time: Date.now()
    })

    // If the limit is exceeded, delete the oldest if (this.logs.length > this.maxLogs) {
      this.logs.shift() // Delete the first (oldest) log.
    }
  }
}
```

It's like a conveyor belt in a revolving sushi restaurant:
```
New sushi → [🍣🍣🍣🍣🍣] → Old sushi was taken away```

### 🎯 Challenge 2: How to quickly find the logs you need?

**Solution: Filtration System**

```javascript
class FilterableLogger {
  // Filter logs filterLogs(level) {
    return this.logs.filter(log => log.level === level)
  }

  // Search Logs(keyword) {
    return this.logs.filter(log =>
      log.message.includes(keyword)
    )
  }

  // Combined filtering getFilteredLogs(options) {
    let filtered = this.logs

    if (options.level) {
      filtered = filtered.filter(log =>
        log.level === options.level
      )
    }

    if (options.keyword) {
      filtered = filtered.filter(log =>
        log.message.includes(options.keyword)
      )
    }

    return filtered
  }
}
```

### 🎯 Challenge 3: How to handle mistakes gracefully?

```javascript
class SafeLogger {
  log(message) {
    try {
      // Normal logging using this.addLog(message)
    } catch (error) {
      // An error should not cause a crash: console.error('Error logging:', error)

      // Attempt to log the error itself this.emergencyLog({
        message: 'Log system error',
        Error: error.toString()
      })
    }
  }

  emergencyLog(data) {
    // Emergency backup solution: save to localStorage
    const backup = JSON.parse(
      localStorage.getItem('emergency_logs') || '[]'
    )
    backup.push(data)
    localStorage.setItem('emergency_logs', JSON.stringify(backup))
  }
}
```

---

## Chapter 7: Debugging Techniques and Common Problems ### 🐛 Debugging Techniques #### 1. Using Safari Web Inspector

```javascript
// Add a breakpoint marker (debugger) to the code // The code will pause here // Or add debug logs: console.log('%c Important information', 'color: red; font-size: 16px')
console.table(this.logs) // Display in table format

#### 2. Add debug mode to ```javascript`
class DebugLogger {
  constructor(debug = false) {
    this.debug = debug
  }

  log(message, level) {
    // Normal logging: this.logs.push({message, level})

    // Debug mode: additional output if (this.debug) {
      console.group(`📝 Log[${level}]`)
      console.log('Message:', message)
      console.log('Time:', new Date())
      console.log('Call stack:', new Error().stack)
      console.groupEnd()
    }
  }
}
```

### ❓ Frequently Asked Questions and Solutions #### Q1: WebView is loaded but I can't see the logs?

**Possible cause:** JavaScript executed before the WebView was ready. **Solution:**
```javascript
// Add a delay to wait MNUtil.delay(0.5) // Wait 500ms
this.showLog(MNLog.logs)

// Or listen for the loading completion event: webview.onload = () => {
  this.showLog(MNLog.logs)
}
```

#### Q2: Why are the logs displaying garbled characters?

**Possible Cause:** Encoding Issue **Solution:**
```javascript
// Ensure correct encoding and decoding const encoded = encodeURIComponent(JSON.stringify(data))
// ... transmission...
const decoded = JSON.parse(decodeURIComponent(encoded))
```

#### Q3: Clicking the button has no effect?

**Debugging Steps**:
```javascript
// 1. Confirm event binding to button.addEventListener('click', (e) => {
  console.log('The button was clicked!') // Step 1: Confirm the trigger // 2. Check the data console.log('Current log count:', this.logs.length)

  // 3. Trace the execution of console.log('Start filtering...')
  const filtered = this.filterLogs()
  console.log('Filtered result:', filtered)
})
```

### 💡 Performance Optimization Tips```javascript
// ❌ Not good: Re-renders all logs every time function showAllLogs() {
  container.innerHTML = '' // Clear logs.forEach(log => { // Re-add all logs container.appendChild(createLogElement(log))
  })
}

// ✅ Okay: Only add new log entries function appendNewLog(log) {
  // Create and add only one new element const element = createLogElement(log)
  container.appendChild(element)

  // Limit the number of children displayed if (container.children.length > 100) {
    container.removeChild(container.firstChild)
  }
}
```

---

## Chapter 8: Practical Project - Building a Complete Log Viewer

### 🎯 The project goal is for us to integrate what we've learned and create a fully functional log viewer!

### 📋 Feature List - [x] Basic Logging - [x] Web Interface Display - [x] Level Filtering (ERROR/WARN/INFO)
- [x] Keyword Search - [x] Copy Log - [x] Clear Log - [ ] Export Log (Exercise)
- [ ] Log statistics (exercise)

### 🏗️ Final Architecture```
┌──────────────────────────┐
User Interface (HTML) |
│ ┌────┐ ┌────┐ ┌────┐ │
│ │Filter│ │Search│ │Copy│ │
│ └────┘ └────┘ └────┘ │
└───────────┬──────────────┘
            │
┌───────────▼──────────────┐
│ LogViewer Class (JS) │
│ - Rendering Log │
│ - Handling Interactions │
│ - Manage Filters │
└───────────┬──────────────┘
            │
┌───────────▼──────────────┐
│ MNLog Class (Native) │
│ - Collect Logs │
│ - Storage Management │
│ - Data Transmission │
└──────────────────────────┘
```

### 🎮 Hands-on Exercise #3: Add an Export Function Challenge: Add an "Export" button to save the log as a file.

**Prompt Structure**:
```javascript
function exportLogs() {
  // 1. Get all logs const logs = logViewer.logs

  // 2. Convert to text format const text = logs.map(log =>
    `[${log.time}] [${log.level}] ${log.message}`
  ).join('\n')

  // 3. Create a download link const blob = new Blob([text], {type: 'text/plain'})
  const url = URL.createObjectURL(blob)

  // 4. Trigger the download const a = document.createElement('a')
  a.href = url
  a.download = 'logs.txt'
  a.click()
}
```

### 🎮 Hands-on Exercise #4: Add a Statistics Panel Challenge: Display log statistics (total, number of items at each level, most common messages).

**Interface Template**:
```html
<div class="stats-panel">
  <h3>📊 Statistics</h3>
  <p>Total: <span id="totalCount">0</span></p>
  Error: <span id="errorCount">0</span></p>
  <p>Warning: <span id="warnCount">0</span></p>
  <p>Information: <span id="infoCount">0</span></p>
</div>
```

---

## 🎓 Summary: What did you learn?

### ✅ Core Concepts 1. **Three-Tier Architecture**: Collaboration of Native + JavaScript + Web 2. **Data Flow**: How logs are generated and displayed 3. **Communication Mechanisms**: How different layers communicate 4. **Performance Optimization**: Techniques for handling large amounts of data ### ✅ Practical Skills 1. **DOM Manipulation**: Dynamically creating and modifying web page elements 2. **Event Handling**: Responding to user interactions 3. **Data Management**: Filtering, searching, and storing 4. **Error Handling**: Gracefully handling exceptions ### ✅ Development Mindset 1. **Modular Thinking**: Breaking down large problems into smaller modules 2. **Incremental Development**: Gradually improving from simple to complex 3. **User Experience**: Always considering the user's experience 4. **Debugging Techniques**: Quickly locating and resolving problems

## 🚀 Next Steps ### Continue learning path 1. **Delve deeper into other MNUtils modules**
   - Subscription Management System - Plugin Store Functionality - Note-taking API

2. **Create your own plugins**
   - Start with simple features - Gradually increase complexity - Release to the community 3. **Participate in the community**
   - Share your learning experiences - Help other beginners - Contribute code improvements ### 📚 Recommended Resources - [MarginNote Official Documentation](https://docs.marginnote.com)
- [MNUtils API Reference](./MNUtils_API_Guide.md)
- [JavaScript MDN Documentation](https://developer.mozilla.org)

### 💬 Getting help when encountering problems:
1. First, check the error message. 2. Review relevant documentation. 3. Search for similar questions. 4. Seek help from the community.

## 🎉 Congratulations!

You have completed your learning journey with Log Viewer! Now you understand:
- Basic architecture of the MarginNote plugin - Communication methods between Native and Web - How to build the user interface - How to process and display data **Remember:** Programming is like learning to ride a bicycle; the more you practice, the more proficient you become.

Wishing you continued success in your MarginNote plugin development journey! 🚀

---

> 📝 **Note Space**
>
Record your learning experiences, problems encountered, and solutions here:
>
>
>
>
>

---

This document is continuously being updated; feedback and suggestions are welcome!
