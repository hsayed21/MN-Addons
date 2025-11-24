# 📚 Learn JavaScript through MarginNote code: from scratch to entry

> 🎯 **Goal of this article**: Let novices with no programming experience systematically learn the core concepts of JavaScript and master modern programming thinking through the real code of the MarginNote plug-in.

## 📖 Preface: Why choose this learning method?

### 🤔 Problems with traditional JavaScript tutorials

Traditional JavaScript tutorials tend to:
- **Out of touch with reality**: All the toy examples used are `hello world` and calculators.
- **Complex environment**: Node.js, browser development tools, etc. need to be configured
- **It’s useless after learning it**: I learned grammar but don’t know what to do with it.

### 🌟 Advantages of learning through MarginNote code

If you are a MarginNote user, you have already seen various powerful plug-ins: MNUtils, MNToolbar, MNChatGLM, etc. These plug-in codes are **living textbooks**:

1. **Real code, immediately understandable**: Each line of code has a clear function
2. **No need to configure the environment**: MarginNote is the running environment
3. **Put what you learn**: Once you understand the syntax, you can understand how the plug-in works.
4. **Step by step**: everything from simple variables to complex classes

### 🎯 What you will learn

**This is not a plug-in development tutorial**, but a **JavaScript language learning tutorial**. After completing the course you will know:

#### Core language features
- The nature of variables, functions, and objects
- Object-oriented programming thinking
- Asynchronous programming concepts
- Modern JavaScript syntax

#### Programming thinking
- How to break down complex problems
- How to organize code structure
- How to handle errors and exceptions
- How to read other people's code

#### Extra gains
- Can understand the code of any MarginNote plug-in
- Lay the foundation for further learning about front-end development
- Ability to read other JavaScript projects

### 🗺️ Learning Roadmap

```
Part 1: JavaScript Basics (Chapter 1-4)
├── Data and variables: how programs remember information
├── Functions: How to reuse and organize code
├── Control flow: how the program makes decisions
└── Composite data: How to deal with complex information

Part 2: Object-Oriented Programming (Chapter 5-7)
├── Objects and classes: how to describe the real world
├── Function advanced: this, closure and other advanced concepts
└── Inheritance and polymorphism: how to reuse and extend code

Part 3: Asynchronous Programming (Chapter 8)
└── Promise and async/await: How to handle delayed operations

Appendix: References
├── JavaScript syntax cheat sheet
├── Common errors and debugging tips
└── Recommended advanced learning resources
```

### 💡 How to use this tutorial

1. **Read in order**: Each chapter builds on the previous chapter
2. **Hands-on practice**: Once you see the code, try running it in MarginNote
3. **Understanding the Essence**: Focus on understanding concepts rather than memorizing grammar
4. **Connect with practice**: Think about how the concepts learned can be applied to other scenarios

> 💡 **Learning Principle**: "Understanding is more important than memory, application is more important than grammar, thinking is more important than skills"

Let’s start this fun JavaScript learning journey!

---

## Part 1: Basic Concepts of JavaScript

### Chapter 1: Data and Variables - Basics of Programming

#### 1.1 The first variable

> 🤔 **Question**: How does the program remember information? For example, I want MarginNote to remember my name and display "Welcome back, Xiao Ming" when I open it next time. What should I do?

This requires the use of **variables**!

**A variable is like a labeled box**: you can put things in it and you can take things out of it. The label is the variable name, and the content inside is the variable value.

**Practice now**:

```javascript
// The simplest example: create a variable
let userName = "Xiao Ming";

//Use variables: let MarginNote display the welcome message
MNUtil.showHUD("Welcome back," + userName);
```

**Run result**: MarginNote will display "Welcome back, Xiao Ming"

**Code explanation**:
- `let userName` → Create a variable named `userName`
- `= "Xiao Ming"` → Put the text "Xiao Ming" into the variable
- `userName` → Get the value of the variable
- `+` → connect two paragraphs of text

**🎯 Try it**: Modify the code, change "Xiao Ming" to your name, and then run it to see the results.

#### 1.2 Basic data types

> 🤔 **Question**: What types of data can JavaScript handle?

Just like boxes can hold different things (books, toys, food), variables can also store different types of data:

##### text (string)
```javascript
let message = "Hello MarginNote";
let noteName = "My Notes";
let emoji = "😀";

MNUtil.showHUD(message); // Display text
```

##### Numbers
```javascript
let age = 25;
let price = 99.9;
let count = 0;

MNUtil.showHUD("age = " + age); // Display: age = 25
```

##### True or false judgment (Boolean value)
```javascript
let isReady = true; // true
let isEmpty = false; // false

if (isReady) {
  MNUtil.showHUD("Ready!");
}
```

**📝 About quotation marks**:
- The text needs to be surrounded by quotes: `"Hello"`
- No quotes required for numbers: `123`
- `true`/`false` also does not require quotes

**✨ Practical Example**: See the practical application from the MarginNote code

```javascript
// Real code from mntoolbar/xdyy_button_registry.js
global.registerButton("custom15", {
  name: "Timestamp", // String: text displayed by the button
  image: "custom15", // String: icon file name
  templateName: "menu_timestamp" // String: menu template name
});

// Real code from mnutils.js
note.colorIndex = 3; // Number: color index (0-15)
note.fillIndex = 0; //Number: fill style index
menu.rowHeight = 35; // Number: menu row height (pixels)
```

**🔍 Take a look**:
- Which ones are in quotation marks? (those are strings)
- Which ones are without quotation marks? (those are numbers)

#### 1.3 Preliminary scope of variables

> 🤔 **Question**: When does a variable exist and when does it disappear?

Imagine you are at home and at school:
- **At Home**: You can use everything at home
- **At school**: You can only use things from school, not things from home

The same goes for variables:

```javascript
let globalMessage = "I am in the global area"; // Global variables: can be used anywhere

function showWelcome() {
  let localMessage = "I am inside the function"; // Local variables: can only be used in this function

  MNUtil.showHUD(globalMessage); // ✅ Global variables can be used
  MNUtil.showHUD(localMessage); // ✅ You can use local variables
}

showWelcome();
MNUtil.showHUD(globalMessage); // ✅ You can still use global variables
// MNUtil.showHUD(localMessage); // ❌ Error! Local variables cannot be used outside functions
```

**Remember**:
- Global variables = things at home, can be used everywhere
- Local variables = things in the classroom, can only be used in this classroom

**🎯 Small exercise**:
Try creating a variable to store your name, and then have MarginNote display the greeting message.

---

### Summary of Chapter 1

Congratulations! You have learned:
✅ Use variables to store information
✅ Distinguish between text, numbers and true and false values
✅ Understand the difference between global and local variables

But what if I want the same code to execute multiple times? For example, show different welcome messages to different people?

This requires the use of **functions** - let's move on to the next chapter!

---

### Chapter 2: Functions - Making code reusable

> 🤔 **Question**: It’s too troublesome to write `MNUtil.showHUD()` every time, and if I want to show greetings to 100 different users, do I have to write 100 lines of code?

**A function is like a machine**: you put the raw materials (input) in, and the machine processes it and gives you the product (output).

#### 2.1 The first function

```javascript
//Writing without functions: a lot of repeated code
MNUtil.showHUD("Welcome back, Xiao Ming");
MNUtil.showHUD("Welcome back, Xiaohong");
MNUtil.showHUD("Welcome back, Xiaogang");
// ...if there are 100 users, 100 lines need to be written!

// Use function writing: code can be reused
function sayWelcome(name) { // name is a parameter: receive external input
  MNUtil.showHUD("Welcome back," + name);
}

//Call function: one line of code
sayWelcome("Xiao Ming"); // Pass in the parameter "Xiao Ming"
sayWelcome("小红"); // Pass in the parameter "小红"
sayWelcome("Xiaogang"); // Pass in the parameter "Xiaogang"
```

**Code explanation**:
- `function sayWelcome(name)` → Create a function named `sayWelcome`
- `name` → parameter, just like the "input port" of a function
- `sayWelcome("Xiao Ming")` → Call the function and pass "Xiao Ming" to the parameter `name`

**🎯 Try it**: Create a function that can display the square of any number (for example, enter 3 and display 9)

#### 2.2 Function parameters and return values

> 🤔 **Question**: How does a function receive input and produce output?

**Parameters = inputs to the function**
```javascript
function greetUser(name, age) { // Two parameters: name and age
  MNUtil.showHUD(name + "this year" + age + "years");
}

greetUser("Xiao Ming", 25); // Pass in two parameters
```

**return value = output of function**
```javascript
function calculateAge(birthYear) {
  let currentYear = 2024;
  let age = currentYear - birthYear;
  return age; // Return the calculation result
}

let myAge = calculateAge(1990); // receive return value
MNUtil.showHUD("I am this year " + myAge + "years old"); // Display: I am 34 years old this year
```

**✨ Practical examples in MarginNote**
```javascript
// Real function from mnutils.js
function strCode(str) {
  let width = 0;
  for (let i = 0; i < str.length; i++) {
    if (str.charCodeAt(i) > 127) {
      width += 2; //Chinese characters count as 2 widths
    } else {
      width += 1; // English characters count as 1 width
    }
  }
  return width; // Return the string display width
}

// use this function
let titleWidth = strCode("My Notes");
MNUtil.showHUD("Title Width: " + titleWidth);
```

#### 2.3 Scope of function

> 🤔 **Question**: What is the relationship between the variables in the function and the variables outside?

Functions are like rooms, with their own "private space":

```javascript
let globalName = "Global Xiao Ming"; // Everyone can use the things in the living room

function showUserInfo() {
  let localName = "Function Xiaohong"; // Things in the room can only be used in the room

  MNUtil.showHUD("Global:" + globalName); // ✅ Can access external
  MNUtil.showHUD("local:" + localName); // ✅ Can access your own
}

showUserInfo();
MNUtil.showHUD("External:" + globalName); // ✅ Global ones can also be used outside
// MNUtil.showHUD("External: " + localName); // ❌ The ones in the room cannot be used outside.
```

**Actual application scenario**:
```javascript
// Practical example in MarginNote
function processNote() {
  let note = MNNote.getFocusNote(); // Function internal variables

  if (note) {
    let noteTitle = note.noteTitle; // Only used in this function
    MNUtil.showHUD("Processing notes: " + noteTitle);
  }
}
// Note and noteTitle cannot be accessed from outside, so they are safe!
```

#### 2.4 Preliminary understanding of arrow functions

> 🤔 **Question**: Is there a more concise way to write functions?

have! Arrow functions are like "simplified" versions of functions:

```javascript
// Ordinary function writing method
function sayHello(name) {
  return "Hello " + name;
}

//How to write arrow function
const sayHello2 = (name) => {
  return "Hello " + name;
}

// More concise arrow function (braces and return can be omitted in a single line)
const sayHello3 = (name) => "Hello " + name;

// The usage effect is exactly the same
MNUtil.showHUD(sayHello("Xiao Ming")); // Hello Xiao Ming
MNUtil.showHUD(sayHello2("小红")); // Hello Xiaohong
MNUtil.showHUD(sayHello3("Xiaogang")); // Hello Xiaogang
```

**When to use arrow functions? **
- Simple calculation: `const double = (x) => x * 2`
- Array processing: `numbers.map(x => x * 2)`
- Short utility functions

**Characteristics of arrow functions**:
- Written more concisely
- Suitable for simple logic
- (Advanced features: this points to different points, we will talk about it in detail in Chapter 6)

---

### Summary of Chapter 2

Congratulations! You have learned:
✅ Use functions to avoid duplicating code
✅ Pass parameters and receive return values
✅ Understand the scope of functions
✅ Understand the basic usage of arrow functions

Now you can create your own "code machine"! But what if I want the program to do different things based on different situations? For example, display a special welcome message only to VIP users?

This requires learning **conditional judgment** - let's enter Chapter 3 and learn how to make the program "think"!

---

### Chapter 3: Control Process - Let the program "think"

The program must not only be able to store data and execute functions, but also be able to make different decisions based on different situations. This is what control flow does.

#### 3.1 Conditional judgment - the decision-making ability of the program

> 🤔 **Question**: How to make the program do different things according to different situations? For example, is it processed only when a note is selected, and prompts the user when it is not selected?

**Life Example**: Check the weather before going out
- If it rains → bring an umbrella
- If it’s not raining → don’t bring an umbrella

**Code implementation**:
```javascript
//Basic if...else
let note = MNNote.getFocusNote();

if (note) {
  //Execute here when there are notes
  MNUtil.showHUD("Note found: " + note.noteTitle);
} else {
  //Execute here when there are no notes
  MNUtil.showHUD("Please select a note first");
}
```

**Multiple condition judgment**:
```javascript
let note = MNNote.getFocusNote();

if (!note) {
  MNUtil.showHUD("Please select the note first");
} else if (note.noteTitle === "") {
  MNUtil.showHUD("Note title is empty");
} else if (note.noteTitle.length > 50) {
  MNUtil.showHUD("Title is too long!");
} else {
  MNUtil.showHUD("Notes are normal: " + note.noteTitle);
}
```

**Practical application**:
```javascript
// Actual logic from the MarginNote plugin
function checkAndProcessNote() {
  let focusNote = MNNote.getFocusNote();

  if (focusNote === null) {
    MNUtil.showHUD("Please select a note first");
    return; // End the function early
  }

  if (focusNote.colorIndex === 0) {
    focusNote.colorIndex = 3; // Set to red
    MNUtil.showHUD("Notes are marked in red");
  } else {
    MNUtil.showHUD("Notes are now colored");
  }
}
```

**🎯 Exercise**: Write a function to check the length of the note title. If it exceeds 20 characters, it will prompt "Title is too long".

#### 3.2 Loop structure - the magic of repeated execution

> 🤔 **Question**: If I want to add the same tag to 100 notes, do I have to write the code 100 times?

**Loops are like conveyor belts**: make the same action happen multiple times.

**Basic for loop**:
```javascript
// The simplest example: counting
for (let i = 1; i <= 5; i++) {
  MNUtil.showHUD("The " + i + " cycle");
}
// Output: 1st loop, 2nd loop, 3rd loop, 4th loop, 5th loop

// Practical application: batch processing of notes
let notes = MNNote.getFocusNotes(); // Get multiple selected notes

for (let i = 0; i < notes.length; i++) {
  let note = notes[i]; // Take out the i-th note
  note.colorIndex = 3; // Set color
  MNUtil.showHUD("Processing the " + (i+1) + " note");
}
```

**Code explanation**:
- `let i = 0` → Counter starts from 0
- `i < notes.length` → continue as long as not finished
- `i++` → Counter+1 after each loop
- `notes[i]` → access the notes in the array using subscripts

**More modern way of writing - for...of loop**:
```javascript
let notes = MNNote.getFocusNotes();

for (let note of notes) { // directly traverse each note
  note.colorIndex = 3;
  MNUtil.showHUD("Processing notes: " + note.noteTitle);
}
// More concise, no need to worry about subscripts
```

**🎯 Exercise**: Write a loop that multiplies each number in the array by 2.

#### 3.3 Practical Exercise: Batch Processing Notes

> 🤔 **Question**: Now that you have learned conditional judgment and looping, can you use them comprehensively to write a batch processing note function?

**Requirement**: Only process notes with titles and mark them all in red.

```javascript
function batchProcessNotes() {
  let notes = MNNote.getFocusNotes(); // Get the selected notes
  let processedCount = 0; // counter

  // Check if there are selected notes
  if (notes.length === 0) {
    MNUtil.showHUD("Please select the note first");
    return;
  }

  //Loop through each note
  for (let note of notes) {
    //Conditional judgment: only process notes with titles
    if (note.noteTitle && note.noteTitle.trim() !== "") {
      note.colorIndex = 3; // Set to red
      processedCount++; // counter+1
    }
  }

  //Display processing results
  MNUtil.showHUD("Processed " + processedCount + " notes with title");
}

// use function
batchProcessNotes();
```

**Code Analysis**:
1. **Function Encapsulation**: Pack functions into functions that can be reused
2. **Error Check**: First check whether there are notes to process
3. **Loop Traversal**: Use for...of to traverse all notes
4. **Conditional filtering**: Only process notes that meet the conditions
5. **Result Feedback**: Tell the user how many notes have been processed

---

### Summary of Chapter 3

Congratulations! You have mastered the "brain" of the program:
✅ Use if...else to let the program make judgments
✅ Batch data processing with loops
✅ Comprehensive use of functions, conditions, and loops to solve practical problems

Now your program can "think"! But what if you want to deal with more complex data? For example, does a student have multiple attributes such as name, age, grades, etc.?

This requires learning about composite data types - let's get into Chapter 4!

---

### Chapter 4: Composite Data Types - Handling Complex Information

So far, we've been working with simple data: a variable holding a value. But real-world information is often complex: a note has multiple attributes such as title, content, color, and comments. This requires composite data types.

#### 4.1 Array - Managing multiple data

> 🤔 **Question**: If I want to store the names of multiple users, do I need to create variables like name1, name2, name3...?

**An array is like an organized storage box**: multiple things can be placed, and each position is numbered.

**Basic Usage**:
```javascript
// Several ways to create arrays
let userNames = ["Xiao Ming", "Xiao Hong", "Xiao Gang"]; // Create directly
let scores = [85, 92, 78]; // array of numbers
let mixedArray = ["Xiao Ming", 18, true, null]; // Mixed type array
let emptyArray = []; // empty array

//Access array elements (index starts from 0)
MNUtil.showHUD("First user: " + userNames[0]); // Xiao Ming
MNUtil.showHUD("Second user: " + userNames[1]); // Xiaohong
MNUtil.showHUD("Array length: " + userNames.length); // 3
```

**Actual application scenario**:
```javascript
// Practical example in MarginNote: batch processing of notes
function colorNotesByCategory() {
  let notes = MNNote.getFocusNotes(); // Get the selected notes (this is an array!)
  let colors = [1, 2, 3, 4, 5]; // Prepare 5 colors

  for (let i = 0; i < notes.length; i++) {
    let colorIndex = colors[i % colors.length]; // Take turns using colors
    notes[i].colorIndex = colorIndex;
    MNUtil.showHUD("note " + (i+1) + " set to color " + colorIndex);
  }
}
```

**Commonly used array operations**:
```javascript
let fruits = ["apple", "banana"];

// add element
fruits.push("orange"); //Add at the end: ["apple", "banana", "orange"]
fruits.unshift("strawberry"); // Add at the beginning: ["strawberry", "apple", "banana", "orange"]

// delete element
let lastFruit = fruits.pop(); // Delete the last one: orange
let firstFruit = fruits.shift(); // Delete the first one: strawberry

// Find element
let index = fruits.indexOf("apple"); // Find the position of apple: 0
let hasApple = fruits.includes("apple"); // Check whether apples are included: true

MNUtil.log("Current fruit:" + fruits); // ["Apple", "Banana"]
```

**🎯 Practical exercises**:
```javascript
//Create a note title cleaner
function cleanNoteTitles() {
  let notes = MNNote.getFocusNotes();
  let cleanedTitles = []; // Store cleaned titles

  for (let note of notes) {
    if (note.noteTitle) {
      // Clean the title: remove leading and trailing spaces, remove special characters
      let cleanTitle = note.noteTitle.trim().replace(/[^\w\s]/g, '');
      cleanedTitles.push(cleanTitle);
      note.noteTitle = cleanTitle;
    }
  }

  MNUtil.showHUD("Cleaned " + cleanedTitles.length + " titles");
  MNUtil.log("Cleaned titles: " + cleanedTitles);
}
```

#### 4.2 Objects - Managing structured data

> 🤔 **Question**: Arrays are suitable for storing multiple data of the same type, but what if a note has different types of attributes such as title, content, color, creation time, etc.?

**The object is like a labeled locker**: each box has its own name.

**Basic Usage**:
```javascript
//Create object
let student = {
  name: "Xiao Ming",
  age: 18,
  grade: "senior year",
  subjects: ["Math", "Physics", "Chemistry"] // Objects can contain arrays
};

//Access object properties
MNUtil.showHUD("Name: " + student.name); // Xiao Ming
MNUtil.showHUD("Age: " + student.age); // 18
MNUtil.showHUD("Subject: " + student.subjects[0]); // Mathematics
```

**Practical application in MarginNote**:
```javascript
//Create a note information object
function getNoteInfo() {
  let note = MNNote.getFocusNote();
  if (!note) return null;

  let noteInfo = {
    title: note.noteTitle || "Untitled",
    content: note.textContent || "No content",
    color: note.colorIndex || 0,
    hasComments: note.comments && note.comments.length > 0,
    created: new Date().toLocaleString(),
    // Method: Objects can also contain functions
    display: function() {
      MNUtil.showHUD("Note: " + this.title + " (" + this.color + ")");
    }
  };

  return noteInfo;
}

// use
let info = getNoteInfo();
if (info) {
  info.display(); // Call the object's method
  MNUtil.log(info); // View complete information
}
```

**Object operations**:
```javascript
let config = {
  theme: "dark",
  fontSize: 14
};

//Add new properties
config.language = "zh-CN";
config["auto-save"] = true; // Use this method when the attribute name has special characters

//Modify properties
config.fontSize = 16;

// Delete attributes
delete config.theme;

// Check if the property exists
if ("language" in config) {
  MNUtil.showHUD("Language setting: " + config.language);
}

// Traverse object properties
for (let key in config) {
  MNUtil.log(key + ": " + config[key]);
}
```

#### 4.3 Special value processing

##### undefined and null - the most confusing concepts for beginners

Both of these mean "no value", but are used differently:

```javascript
// undefined: The system says "I don't know"
let userName; // Declared but not assigned a value
MNUtil.log(userName); // undefined

let note = MNNote.getFocusNote();
if (!note) {
  MNUtil.log("No note selected"); // note may be null
}

// null: The programmer said "This is intentionally empty"
let settings = {
  theme: "dark",
  language: "zh-CN",
  customCSS: null // Deliberately set to empty, indicating "no custom styles yet"
};
```

**Life-based understanding**:
- **undefined**: Just like asking "What did you eat today?", the other party said "I forgot" (the system does not know)
- **null**: Just like asking "What did you eat today?", the other party said "I didn't eat" (told you proactively that it was empty)

**Practical application in MarginNote plug-in**:

```javascript
// Check if the note exists
let focusNote = MNNote.getFocusNote();
if (focusNote === null) {
  MNUtil.showHUD("Please select a note first");
  return;
}

// Check if the property is defined
if (typeof focusNote.customProperty === "undefined") {
  focusNote.customProperty = "Default value";
}

// Clear a property (set to null)
focusNote.tempData = null; // Actively clear temporary data
```

**Common mistakes and correct handling**:

```javascript
// ❌ Error: Direct use of a value that may be undefined
let note = MNNote.getFocusNote();
note.appendComment("New Comment"); // If note is null, an error will be reported!

// ✅ Correct: Check before using
let note = MNNote.getFocusNote();
if (note) { // Check for both null and undefined
  note.appendComment("New Comment");
} else {
  MNUtil.showHUD("Please select the note first");
}

// ✅ More concise writing: optional chaining operator (if supported)
note?.appendComment("New Comment"); // Called only when note exists
```

**Memory Tips**:
- **undefined**: "I don't know" - The system did not give a value
- **null**: "I know it is empty" - the programmer actively sets it to null

#### 4.4 Comprehensive Exercise: Creating a Note Manager

> 🎯 **Challenge**: Use arrays, objects and special value processing to create a small note management system

```javascript
function createNoteManager() {
  // Note manager object
  let noteManager = {
    notes: [], // Store all note information

    //Add notes
    addNote: function(title, content) {
      if (!title || title.trim() === "") {
        MNUtil.showHUD("Title cannot be empty");
        return null;
      }

      let noteInfo = {
        id: this.notes.length + 1,
        title: title.trim(),
        content: content || "",
        created: new Date().toLocaleString(),
        color: 0
      };

      this.notes.push(noteInfo);
      return noteInfo;
    },

    // Find notes
    findNote: function(id) {
      for (let note of this.notes) {
        if (note.id === id) {
          return note;
        }
      }
      return null; // Return null if not found
    },

    // show all notes
    listNotes: function() {
      if (this.notes.length === 0) {
        MNUtil.showHUD("No notes yet");
        return;
      }

      for (let note of this.notes) {
        MNUtil.log("ID:" + note.id + " | " + note.title + " | " + note.created);
      }
    }
  };

  return noteManager;
}

// Usage example
let manager = createNoteManager();
manager.addNote("Learning JavaScript", "Today I learned arrays and objects");
manager.addNote("MarginNote skills", "Learned to batch process notes");
manager.listNotes();

let note = manager.findNote(1);
if (note) {
  MNUtil.showHUD("Note found: " + note.title);
} else {
  MNUtil.showHUD("Note does not exist");
}
```

---

### Summary of Chapter 4

🎉 Congratulations! You have mastered the core skills of working with complex data:

✅ **Array Operation**: Store and operate multiple data
- Create array: `let arr = [1, 2, 3]`
- Access element: `arr[0]`, get length: `arr.length`
- Add/Remove: `push()`, `pop()`, `shift()`, `unshift()`
- Find: `indexOf()`, `includes()`

✅ **Object Operations**: Manage structured data
- Create object: `let obj = {name: "Xiao Ming", age: 18}`
- Access properties: `obj.name` or `obj["name"]`
- Add/delete properties: `obj.newProp = value`, `delete obj.prop`
- Traverse properties: `for...in` loop

✅ **Special Value Handling**: Avoid common mistakes
- `undefined`: value not defined by the system
- `null`: a null value actively set by the programmer
- Safety check: `if (value)` or optional chain `value?.method()`

Now you can handle complex real-world data! But what if I want the data to "behave"? For example, a student object not only has attributes, but it can also "introduce itself", "calculate GPA", etc.?

This requires learning **Object-Oriented Programming** – let’s get into part two!

---

## Part 2: Object-oriented programming

So far, we have learned about data types, functions, and control flow. Now it's time to learn Object-Oriented Programming - let data not only have "properties" but also "behaviors".

### Chapter 5: Classes and Objects - The Evolution of Data

> 🤔 **Question**: We have learned objects (such as `{name: "Xiao Ming", age: 18}`), but if I want to create many student objects, do I have to write them one by one manually?

#### 5.1 From simple objects to classes

**Review**: We created the object like this before:
```javascript
// Manually create student objects
let student1 = {
  name: "Xiao Ming",
  age: 18,
  grade: "senior year",
  introduce: function() {
    MNUtil.showHUD("I am " + this.name + ", this year is " + this.age + " years old");
  }
};

let student2 = {
  name: "小红",
  age: 17,
  grade: "Grade 2",
  introduce: function() { // Duplicate code!
    MNUtil.showHUD("I am " + this.name + ", this year is " + this.age + " years old");
  }
};
```

**Problem**: The code is duplicated and difficult to maintain!

**Solution**: Use Class
```javascript
// class is like a "student template"
class Student {
  //Constructor: automatically called when creating a student
  constructor(name, age, grade) {
    this.name = name;
    this.age = age;
    this.grade = grade;
  }

  // Method: Something all students can do
  introduce() {
    MNUtil.showHUD("I am " + this.name + ", this year is " + this.age + " years old");
  }

  study(subject) {
    MNUtil.showHUD(this.name + "Learning" + subject);
  }
}

//Create an object using a class (instantiate)
let student1 = new Student("Xiao Ming", 18, "Grade 3");
let student2 = new Student("小红", 17, "High School Sophomore");

student1.introduce(); // I am Xiao Ming, 18 years old this year
student2.study("Mathematics"); // Xiaohong is studying mathematics
```

#### 5.2 Class application in MarginNote

Let's see how classes are used in the MarginNote plugin:

```javascript
//Create a note processor class
class NoteProcessor {
  constructor(pluginName) {
    this.pluginName = pluginName;
    this.processedCount = 0;
  }

  // Process a single note
  processNote(note) {
    if (!note || !note.noteTitle) {
      return false;
    }

    // clear title
    note.noteTitle = note.noteTitle.trim();
    //Set color
    note.colorIndex = 2;
    // count
    this.processedCount++;

    return true;
  }

  //Batch processing notes
  processBatch() {
    let notes = MNNote.getFocusNotes();
    this.processedCount = 0; //Reset count

    for (let note of notes) {
      this.processNote(note);
    }

    MNUtil.showHUD(this.pluginName + " Processed " + this.processedCount + " notes");
  }

  // Get processing statistics
  getStats() {
    return {
      plugin: this.pluginName,
      processed: this.processedCount,
      lastUpdate: new Date().toLocaleString()
    };
  }
}

// use class
let processor = new NoteProcessor("My Note Processor");
processor.processBatch();
let stats = processor.getStats();
MNUtil.log(stats);
```

#### 5.3 getters and setters - gatekeepers for properties

> 🤔 **Question**: What if I want a property to have some "intelligent behavior"? For example, is it legal to automatically check when setting the age?

**getters and setters make properties "smart"**:
```javascript
class SmartStudent {
  constructor(name, age) {
    this.name = name;
    this._age = age; // Use _ to represent "internal attributes"
  }

  // getter: called when reading properties
  get age() {
    return this._age;
  }

  // setter: called when setting a property
  set age(value) {
    if (value < 0 || value > 150) {
      MNUtil.showHUD("Illegal age: " + value);
      return;
    }
    this._age = value;
    MNUtil.showHUD("Age has been updated to: " + value);
  }

  // Computed properties: recalculated on each access
  get description() {
    return this.name + "（" + this._age + "years old)";
  }
}

// use
let student = new SmartStudent("Xiao Ming", 18);
MNUtil.log(student.age); // 18 (calling getter)
student.age = 19; // Call the setter and display "Age has been updated to: 19"
student.age = -5; // Call the setter, it will display "Illegal age" and will not be updated.
MNUtil.log(student.description); // "Xiao Ming (19 years old)" (calling getter)
```

**Application in MarginNote**:

```javascript
class SmartNote {
  constructor(note) {
    this.note = note;
    this._priority = 0;
  }

  //Smart title processing
  get title() {
    return this.note.noteTitle || "Untitled";
  }

  set title(value) {
    if (!value || value.trim() === "") {
      MNUtil.showHUD("Title cannot be empty");
      return;
    }

    // Automatically clean and format titles
    let cleanTitle = value.trim().replace(/\s+/g, ' ');
    this.note.noteTitle = cleanTitle;
    MNUtil.showHUD("Title has been set to: " + cleanTitle);
  }

  //Priority management
  get priority() {
    return this._priority;
  }

  set priority(level) {
    if (level < 0 || level > 5) {
      MNUtil.showHUD("Priority must be between 0-5");
      return;
    }

    this._priority = level;
    // Automatically set colors based on priority
    this.note.colorIndex = level;
    MNUtil.showHUD(`The priority is set to ${level}, the color has been updated simultaneously`);
  }

  // read-only property
  get info() {
    return `${this.title} [Priority: ${this.priority}]`;
  }
}

// Usage example
let note = MNNote.getFocusNote();
if (note) {
  let smartNote = new SmartNote(note);

  smartNote.title = "Important Notes"; // Automatically clean the format
  smartNote.priority = 3; // Set priority and color
  MNUtil.log(smartNote.info); // Display complete information
}
```
#### 5.4 Practical exercise: Create a note manager class

> 🎯 **Challenge**: Create a complete note management system by comprehensively using constructors, methods, getters/setters

```javascript
class NoteManager {
  constructor() {
    this.notes = [];
    this.currentFilter = "all";
    this._totalProcessed = 0;
  }

  //Add notes
  addNote(title, content, priority = 0) {
    if (!title || title.trim() === "") {
      MNUtil.showHUD("Title cannot be empty");
      return null;
    }

    let note = {
      id: this.notes.length + 1,
      title: title.trim(),
      content: content || "",
      priority: Math.min(Math.max(priority, 0), 5), // limited to the range of 0-5
      created: new Date(),
      modified: new Date()
    };

    this.notes.push(note);
    this._totalProcessed++;
    return note;
  }

  // Find notes
  findById(id) {
    return this.notes.find(note => note.id === id) || null;
  }

  findByTitle(title) {
    return this.notes.filter(note =>
      note.title.toLowerCase().includes(title.toLowerCase())
    );
  }

  // filter getter
  get filteredNotes() {
    switch (this.currentFilter) {
      case "high":
        return this.notes.filter(note => note.priority >= 4);
      case "medium":
        return this.notes.filter(note => note.priority >= 2 && note.priority < 4);
      case "low":
        return this.notes.filter(note => note.priority < 2);
      case "recent":
        let yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return this.notes.filter(note => note.created > yesterday);
      default:
        return this.notes;
    }
  }

  //Set filter
  set filter(filterType) {
    let validFilters = ["all", "high", "medium", "low", "recent"];
    if (!validFilters.includes(filterType)) {
      MNUtil.showHUD("Invalid filter type: " + filterType);
      return;
    }

    this.currentFilter = filterType;
    MNUtil.showHUD("Filter set to: " + filterType);
  }

  //statistics getter
  get stats() {
    return {
      total: this.notes.length,
      high: this.notes.filter(n => n.priority >= 4).length,
      medium: this.notes.filter(n => n.priority >= 2 && n.priority < 4).length,
      low: this.notes.filter(n => n.priority < 2).length,
      processed: this._totalProcessed
    };
  }

  //Display note list
  displayNotes() {
    let notes = this.filteredNotes;
    if (notes.length === 0) {
      MNUtil.showHUD("No notes found");
      return;
    }

    for (let note of notes) {
      let priority = "★".repeat(note.priority) || "☆";
      MNUtil.log(`${priority} ${note.title} (${note.created.toLocaleDateString()})`);
    }

    let stats = this.stats;
    MNUtil.showHUD(`Show ${notes.length} notes (total ${stats.total})`);
  }

  // Set priorities in batches
  batchSetPriority(priority) {
    let notes = this.filteredNotes;
    let count = 0;

    for (let note of notes) {
      note.priority = priority;
      note.modified = new Date();
      count++;
    }

    MNUtil.showHUD(`The priority of ${count} notes has been set to ${priority}`);
    return count;
  }
}

// Usage example
let manager = new NoteManager();

//Add some notes
manager.addNote("Learn JavaScript classes", "Today I learned the basic concepts of classes", 4);
manager.addNote("MarginNote skills", "Learned to batch process notes", 2);
manager.addNote("Project plan", "List of tasks to be completed next week", 5);
manager.addNote("读书笔记", "《JavaScript高级程序设计》", 1);

// 查看所有笔记
manager.displayNotes();

// 只看高优先级笔记
manager.filter = "high";
manager.displayNotes();

// 批量调整优先级
manager.batchSetPriority(3);

// 搜索笔记
let found = manager.findByTitle("JavaScript");
MNUtil.log("找到 " + found.length + " 个相关笔记");

// 查看统计
let stats = manager.stats;
MNUtil.log(`统计: 高${stats.high}个, 中${stats.medium}个, 低${stats.low}个`);
```

---

### 第5章小结

🎉 恭喜！你已经掌握了面向对象编程的核心技能：

✅ **类的基础**：创建可重用的对象模板
- `class ClassName { }` 定义类
- `constructor()` 构造函数初始化对象
- `new ClassName()` 创建实例

✅ **实例属性和方法**：对象的数据和行为
- `this.property` 访问对象属性
- 方法中的 `this` 指向当前对象
- 封装相关功能到类中

✅ **getter 和 setter**：让属性变得智能
- `get propertyName()` 控制属性读取
- `set propertyName(value)` 控制属性设置
- 数据验证和自动处理

✅ **实际应用**：在 MarginNote 插件中的应用
- 创建功能类封装复杂逻辑
- 智能属性管理
- 批量处理和数据统计

现在你可以创建自己的"智能对象"了！但是，如果我想创建一些不需要实例化就能使用的工具方法呢？比如 `MNUtil.showHUD()` 这样的？

让我们进入第6章，学习**静态方法**和工具类设计！

### 第6章：静态方法和工具类

> 🤔 **问题**：你注意到了吗？我们一直在使用 `MNUtil.showHUD()`、`MNUtil.log()` 这样的方法，但从来没有写过 `new MNUtil()`？这就是静态方法的魅力！

#### 6.1 static 关键字 - 类方法 vs 实例方法

**生活类比**：想象一个汽车工厂
- **静态方法（static）**= 工厂的功能（统计总产量、制定生产规范）
- **实例方法**= 每辆车的功能（启动、刹车、加速）

```javascript
class Car {
  constructor(brand, model) {
    this.brand = brand;
    this.model = model;
    Car.totalCars++; // 每造一辆车，总数+1
  }

  // 静态属性 - 属于整个类
  static totalCars = 0;

  // 静态方法 - 不需要创建实例就能用
  static getTotalCars() {
    return Car.totalCars;
  }

  static createStandardCar() {
    return new Car("丰田", "卡罗拉");
  }

  // 实例方法 - 需要创建实例才能用
  start() {
    MNUtil.showHUD(this.brand + " " + this.model + " 启动了");
  }

  getInfo() {
    return this.brand + " " + this.model;
  }
}

// 静态方法的使用 - 直接通过类名调用
MNUtil.log("目前生产了 " + Car.getTotalCars() + " 辆车");  // 0
let standardCar = Car.createStandardCar();

// 实例方法的使用 - 需要先创建对象
let myCar = new Car("本田", "雅阁");
myCar.start();  // 本田 雅阁 启动了

MNUtil.log("目前生产了 " + Car.getTotalCars() + " 辆车");  // 2
```

#### 6.2 MNUtil 类的设计思想

让我们看看 MNUtil 这个典型工具类的设计：

```javascript
// MNUtil 就是一个纯静态方法的工具类
class MNUtil {
  // 静态方法 - 工具函数，不需要实例
  static showHUD(message, duration = 2) {
    // 显示提示信息
  }

  static copy(text) {
    // 复制到剪贴板
  }

  static delay(seconds) {
    // 延迟执行
    return new Promise(resolve => setTimeout(resolve, seconds * 1000));
  }

  static log(message) {
    // 输出日志
  }

  static getRandomColor() {
    return Math.floor(Math.random() * 6); // 0-5的随机颜色
  }
}

// 直接使用，无需 new MNUtil()
MNUtil.showHUD("保存成功!");
MNUtil.copy("复制的文本");
let color = MNUtil.getRandomColor();
```

**为什么 MNUtil 都是静态方法？ **
- **无状态**：这些工具函数不需要保存任何数据
- **通用性**：任何地方都能直接调用
- **简单性**：不需要创建对象，直接使用

#### 6.3 创建自己的工具类

让我们为 MarginNote 插件创建一个实用工具类：

```javascript
class PluginUtils {
  // 时间相关工具
  static formatTimestamp(date = new Date()) {
    return date.toLocaleDateString('zh-CN') + ' ' +
           date.toLocaleTimeString('zh-CN', {hour12: false});
  }

  static getDateString(format = 'YYYY-MM-DD') {
    let date = new Date();
    let year = date.getFullYear();
    let month = (date.getMonth() + 1).toString().padStart(2, '0');
    let day = date.getDate().toString().padStart(2, '0');

    switch(format) {
      case 'YYYY-MM-DD':
        return `${year}-${month}-${day}`;
      case 'MM/DD':
        return `${month}/${day}`;
      case 'Chinese':
        return `${year}年${month}月${day}日`;
      default:
        return `${year}-${month}-${day}`;
    }
  }

  // 文本处理工具
  static cleanText(text) {
    if (!text) return "";
    return text.trim().replace(/\s+/g, ' ').replace(/[^\w\s\u4e00-\u9fff]/g, '');
  }

  static truncateText(text, maxLength = 50) {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  }

  // 数据验证工具
  static isValidNoteId(id) {
    return typeof id === 'string' && id.length === 36 &&
           /^[A-F0-9]{8}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{12}$/.test(id);
  }

  static isValidColor(colorIndex) {
    return Number.isInteger(colorIndex) && colorIndex >= 0 && colorIndex <= 5;
  }

  // 笔记批量操作工具
  static batchProcess(notes, processor, showProgress = true) {
    if (!Array.isArray(notes) || notes.length === 0) {
      MNUtil.showHUD("没有笔记需要处理");
      return [];
    }

    let results = [];
    let processed = 0;

    for (let note of notes) {
      try {
        let result = processor(note);
        results.push({ note, result, success: true });
        processed++;

        if (showProgress && processed % 10 === 0) {
          MNUtil.showHUD(`已处理 ${processed}/${notes.length} 个笔记`);
        }
      } catch (error) {
        results.push({ note, error, success: false });
        MNUtil.log(`处理笔记失败: ${error.message}`);
      }
    }

    if (showProgress) {
      MNUtil.showHUD(`批量处理完成: 成功 ${results.filter(r => r.success).length} 个`);
    }

    return results;
  }

  // 配置管理工具
  static saveConfig(key, value) {
    try {
      let config = JSON.stringify(value);
      // 这里应该使用实际的存储机制
      MNUtil.log(`配置已保存: ${key} = ${config}`);
      return true;
    } catch (error) {
      MNUtil.showHUD("配置保存失败: " + error.message);
      return false;
    }
  }

  static loadConfig(key, defaultValue = null) {
    try {
      // 这里应该使用实际的读取机制
      MNUtil.log(`加载配置: ${key}`);
      return defaultValue; // 返回默认值作为示例
    } catch (error) {
      MNUtil.log("配置读取失败: " + error.message);
      return defaultValue;
    }
  }

  // ID 生成工具
  static generateId(prefix = 'item') {
    return prefix + '_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
}

// 使用示例
let timestamp = PluginUtils.formatTimestamp();
let dateStr = PluginUtils.getDateString('Chinese');
let cleanTitle = PluginUtils.cleanText("  重要笔记!!! ");
let shortText = PluginUtils.truncateText("这是一段很长的文本内容", 10);

MNUtil.log("时间戳: " + timestamp);
MNUtil.log("日期: " + dateStr);
MNUtil.log("清理后标题: " + cleanTitle);
MNUtil.log("截断文本: " + shortText);

// 批量处理笔记
let notes = MNNote.getFocusNotes();
if (notes.length > 0) {
  PluginUtils.batchProcess(notes, (note) => {
    // 为每个笔记添加时间戳
    note.appendTextComment("处理时间: " + PluginUtils.formatTimestamp());
    return "已添加时间戳";
  });
}

// 生成唯一ID
let taskId = PluginUtils.generateId('task');
MNUtil.log("生成的任务ID: " + taskId);
```

#### 6.4 静态方法的使用场景

**何时使用 static？ **

✅ **适合使用静态方法**：
1. **工具函数**：不需要对象状态，纯粹的功能函数
2. **工厂方法**：创建特定类型的实例
3. **验证函数**：数据格式验证
4. **配置管理**：全局设置的读写
5. **常量定义**：类相关的常量

❌ **不适合使用静态方法**：
1. **需要访问实例属性**：依赖 `this` 的操作
2. **有状态的操作**：需要记住之前的操作结果
3. **个性化行为**：每个对象行为不同的操作

```javascript
class NoteValidator {
  // ✅ 静态方法 - 纯验证功能
  static isValidTitle(title) {
    return title && title.trim().length > 0 && title.length <= 100;
  }

  static isValidColor(color) {
    return Number.isInteger(color) && color >= 0 && color <= 5;
  }

  // ✅ 静态工厂方法
  static createDefaultNote() {
    return {
      title: "新建笔记",
      content: "",
      color: 0,
      created: new Date()
    };
  }
}

class NoteProcessor {
  constructor(pluginName) {
    this.pluginName = pluginName;
    this.processedCount = 0;  // 实例状态
  }

  // ❌ 不适合静态 - 需要访问实例状态
  processNote(note) {
    this.processedCount++;  // 访问了实例属性
    MNUtil.log(`${this.pluginName} 处理了第 ${this.processedCount} 个笔记`);
  }

  // ✅ 可以是静态 - 纯功能函数
  static formatNoteTitle(title) {
    return title.trim().replace(/\s+/g, ' ');
  }
}
```

---

### 第6章小结

🎉 你已经掌握了静态方法和工具类的设计！

✅ **核心概念**：
- `static` 关键字创建类级别的方法和属性
- 静态方法直接通过类名调用，无需创建实例
- 静态方法不能访问实例的 `this`

✅ **设计原则**：
- 工具函数 → 静态方法
- 无状态操作 → 静态方法
- 需要实例数据 → 实例方法

✅ **实际应用**：
- `MNUtil` 等工具类的设计理念
- 创建自己的插件工具类
- 合理选择静态方法 vs 实例方法

现在你可以设计出结构清晰的工具类了！但是，如果我想基于现有的类创建新的、更专门化的类呢？比如创建一个"高级笔记处理器"继承基础的"笔记处理器"？

让我们进入第7章，学习**继承**的概念！

### 第7章：继承和扩展 - 在已有基础上构建

> 🤔 **问题**：如果我有一个基础的"笔记处理器"，现在想创建一个功能更强大的"高级笔记处理器"，难道要重写所有代码吗？

#### 7.1 继承基础 - extends 关键字

**生活类比**：继承就像"青出于蓝而胜于蓝"
- **父类**（基类）= 师父的基本技能
- **子类**（派生类）= 徒弟在师父基础上发展出的新技能
- **方法继承**= 徒弟学会了师父的所有技能
- **方法重写**= 徒弟对某些技能有了自己的改进

```javascript
// 基础笔记处理器（父类）
class NoteProcessor {
  constructor(name) {
    this.name = name;
    this.processedCount = 0;
  }

  // 基础处理方法
  processNote(note) {
    if (!note) {
      MNUtil.showHUD("没有笔记需要处理");
      return false;
    }

    // 基础处理：清理标题
    if (note.noteTitle) {
      note.noteTitle = note.noteTitle.trim();
    }

    this.processedCount++;
    MNUtil.log(`${this.name} 处理了第 ${this.processedCount} 个笔记`);
    return true;
  }

  // 获取统计信息
  getStats() {
    return {
      processor: this.name,
      processed: this.processedCount
    };
  }

  // 重置计数
  reset() {
    this.processedCount = 0;
    MNUtil.log(`${this.name} 已重置`);
  }
}

// 高级笔记处理器（子类）- 继承自 NoteProcessor
class AdvancedNoteProcessor extends NoteProcessor {
  constructor(name, options = {}) {
    super(name);  // 调用父类构造函数
    this.autoColor = options.autoColor || false;
    this.addTimestamp = options.addTimestamp || false;
    this.errorCount = 0;
  }

  // 重写父类方法 - 添加更多功能
  processNote(note) {
    // 先调用父类的基础处理
    let success = super.processNote(note);

    if (!success) {
      this.errorCount++;
      return false;
    }

    // 添加高级功能
    if (this.autoColor && note.noteTitle) {
      // 根据标题内容自动设置颜色
      if (note.noteTitle.includes("重要") || note.noteTitle.includes("!!!")) {
        note.colorIndex = 1; // 红色
      } else if (note.noteTitle.includes("TODO") || note.noteTitle.includes("待办")) {
        note.colorIndex = 3; // 黄色
      }
    }

    if (this.addTimestamp) {
      // 添加时间戳评论
      let timestamp = new Date().toLocaleString('zh-CN');
      note.appendTextComment(`处理时间: ${timestamp}`);
    }

    MNUtil.log(`高级处理器额外处理了笔记: ${note.noteTitle}`);
    return true;
  }

  // 新增方法 - 父类没有的功能
  batchColorByKeyword(notes, keyword, color) {
    let count = 0;
    for (let note of notes) {
      if (note.noteTitle && note.noteTitle.includes(keyword)) {
        note.colorIndex = color;
        count++;
      }
    }
    MNUtil.showHUD(`为 ${count} 个包含"${keyword}"的笔记设置了颜色`);
    return count;
  }

  // 重写父类的统计方法 - 添加错误统计
  getStats() {
    let baseStats = super.getStats(); // 获取父类的统计
    return {
      ...baseStats,  // 展开父类统计
      errors: this.errorCount,
      successRate: this.processedCount > 0 ?
        ((this.processedCount - this.errorCount) / this.processedCount * 100).toFixed(1) + '%' : 'N/A'
    };
  }
}

// 使用示例
let basicProcessor = new NoteProcessor("基础处理器");
let advancedProcessor = new AdvancedNoteProcessor("高级处理器", {
  autoColor: true,
  addTimestamp: true
});

// 测试基础处理器
let notes = MNNote.getFocusNotes();
if (notes.length > 0) {
  basicProcessor.processNote(notes[0]);
  MNUtil.log(basicProcessor.getStats());

  // 测试高级处理器
  advancedProcessor.processNote(notes[0]);
  MNUtil.log(advancedProcessor.getStats());

  // 使用高级处理器的特有功能
  advancedProcessor.batchColorByKeyword(notes, "重要", 1);
}
```

#### 7.2 super 关键字 - 与父类的正确沟通方式

> 🤔 **问题**：在上面的例子中，我们用了 `super.processNote()` 和 `super.getStats()`，这个 `super` 是什么意思？

**super 就像是"请教师父"**：
- `super()` = 请教师父如何初始化
- `super.methodName()` = 请教师父如何做某件事
- `super` 让子类能够复用父类的代码，而不是重写一遍

```javascript
class Plugin {
  constructor(name, version) {
    this.name = name;
    this.version = version;
    this.isActive = false;
    MNUtil.log(`插件 ${name} v${version} 已创建`);
  }

  activate() {
    this.isActive = true;
    MNUtil.showHUD(`${this.name} 已激活`);
  }

  deactivate() {
    this.isActive = false;
    MNUtil.showHUD(`${this.name} 已停用`);
  }

  getInfo() {
    return `${this.name} v${this.version} (${this.isActive ? '已激活' : '未激活'})`;
  }
}

class MarginNotePlugin extends Plugin {
  constructor(name, version, mnVersion) {
    // 调用父类构造函数
    super(name, version);
    this.mnVersion = mnVersion;
    this.features = [];
    MNUtil.log(`MarginNote 插件初始化完成，支持 MN ${mnVersion}`);
  }

  // 重写激活方法，添加插件特有逻辑
  activate() {
    // 先执行父类的激活逻辑
    super.activate();

    // 再添加 MarginNote 插件特有的激活逻辑
    this.loadFeatures();
    this.setupUI();
    MNUtil.log(`${this.name} 的所有功能已加载`);
  }

  // 新增方法
  addFeature(featureName) {
    this.features.push(featureName);
    MNUtil.log(`添加功能: ${featureName}`);
  }

  loadFeatures() {
    // 模拟加载功能
    this.addFeature("笔记导出");
    this.addFeature("批量处理");
    this.addFeature("快捷操作");
  }

  setupUI() {
    MNUtil.log("设置用户界面...");
  }

  // 重写 getInfo 方法，添加更多信息
  getInfo() {
    let baseInfo = super.getInfo(); // 获取父类的基本信息
    return `${baseInfo}\n支持 MarginNote ${this.mnVersion}\n功能数量: ${this.features.length}`;
  }
}

// 使用示例
let myPlugin = new MarginNotePlugin("超级笔记助手", "2.1.0", "4.0");
myPlugin.activate();
MNUtil.log(myPlugin.getInfo());
```

#### 7.3 在 MarginNote 插件中的继承应用

让我们看一个更实际的例子：创建不同类型的笔记分析器

```javascript
// 基础分析器
class NoteAnalyzer {
  constructor(name) {
    this.name = name;
    this.results = {};
  }

  analyze(notes) {
    if (!Array.isArray(notes) || notes.length === 0) {
      MNUtil.showHUD("没有笔记需要分析");
      return null;
    }

    this.results = {
      total: notes.length,
      analyzed: 0,
      timestamp: new Date().toLocaleString()
    };

    for (let note of notes) {
      if (this.analyzeNote(note)) {
        this.results.analyzed++;
      }
    }

    MNUtil.log(`${this.name} 分析完成: ${this.results.analyzed}/${this.results.total}`);
    return this.results;
  }

  // 基础分析方法（子类可以重写）
  analyzeNote(note) {
    // 基础分析：检查笔记是否有标题
    return note.noteTitle && note.noteTitle.trim().length > 0;
  }

  getReport() {
    return `${this.name} 分析报告:\n总计: ${this.results.total || 0}\n已分析: ${this.results.analyzed || 0}`;
  }
}

// 内容分析器 - 分析笔记内容
class ContentAnalyzer extends NoteAnalyzer {
  constructor() {
    super("内容分析器");
  }

  analyzeNote(note) {
    // 先执行父类的基础检查
    if (!super.analyzeNote(note)) {
      return false;
    }

    // 内容特定分析
    let hasContent = note.textContent && note.textContent.trim().length > 0;
    let hasComments = note.comments && note.comments.length > 0;

    // 记录更详细的信息
    if (!this.results.details) {
      this.results.details = {
        withContent: 0,
        withComments: 0,
        empty: 0
      };
    }

    if (hasContent) this.results.details.withContent++;
    if (hasComments) this.results.details.withComments++;
    if (!hasContent && !hasComments) this.results.details.empty++;

    return hasContent || hasComments;
  }

  getReport() {
    let baseReport = super.getReport();
    if (this.results.details) {
      baseReport += `\n有内容: ${this.results.details.withContent}`;
      baseReport += `\n有评论: ${this.results.details.withComments}`;
      baseReport += `\n空笔记: ${this.results.details.empty}`;
    }
    return baseReport;
  }
}

// 关键词分析器 - 分析关键词分布
class KeywordAnalyzer extends NoteAnalyzer {
  constructor(keywords = []) {
    super("关键词分析器");
    this.keywords = keywords;
  }

  analyzeNote(note) {
    if (!super.analyzeNote(note)) {
      return false;
    }

    if (!this.results.keywords) {
      this.results.keywords = {};
      this.keywords.forEach(keyword => {
        this.results.keywords[keyword] = 0;
      });
    }

    let text = (note.noteTitle + ' ' + (note.textContent || '')).toLowerCase();

    for (let keyword of this.keywords) {
      if (text.includes(keyword.toLowerCase())) {
        this.results.keywords[keyword]++;
      }
    }

    return true;
  }

  getReport() {
    let baseReport = super.getReport();
    if (this.results.keywords) {
      baseReport += '\n关键词统计:';
      for (let [keyword, count] of Object.entries(this.results.keywords)) {
        baseReport += `\n  ${keyword}: ${count}`;
      }
    }
    return baseReport;
  }
}

// 使用示例
let notes = MNNote.getFocusNotes();

if (notes.length > 0) {
  // 基础分析
  let basicAnalyzer = new NoteAnalyzer("基础分析器");
  basicAnalyzer.analyze(notes);
  MNUtil.log(basicAnalyzer.getReport());

  // 内容分析
  let contentAnalyzer = new ContentAnalyzer();
  contentAnalyzer.analyze(notes);
  MNUtil.log(contentAnalyzer.getReport());

  // 关键词分析
  let keywordAnalyzer = new KeywordAnalyzer(["重要", "TODO", "问题", "总结"]);
  keywordAnalyzer.analyze(notes);
  MNUtil.log(keywordAnalyzer.getReport());
}
```

---

### 第7章小结

🎉 你已经掌握了面向对象编程的高级特性！

✅ **继承的核心概念**：
- `extends` 关键字创建子类
- 子类继承父类的所有属性和方法
- 子类可以添加新功能和重写现有功能

✅ **super 关键字的用法**：
- `super()` 调用父类构造函数
- `super.method()` 调用父类方法
- 实现代码复用而不是重复编写

✅ **实际应用场景**：
- 创建专门化的处理器类
- 插件系统的扩展架构
- 分析器、验证器等工具类的层次设计

✅ **设计原则**：
- 基类定义通用功能
- 子类扩展特定功能
- 使用 super 复用父类代码

现在你可以设计出具有层次结构的类系统了！你已经掌握了面向对象编程的核心概念。

接下来，让我们学习 JavaScript 的最后一个重要概念——**异步编程**，这在现代 Web 开发中非常重要！

## 第三部分：异步编程

现在我们已经掌握了 JavaScript 的基础语法和面向对象编程，最后让我们学习异步编程——这是现代编程中非常重要的概念。

### 第8章：异步编程基础 - 让程序更高效

> 🤔 **问题**：有时候我们需要等待某些操作完成（比如延时、网络请求等），但又不想让整个程序卡住。这就需要异步编程！

#### 8.1 同步 vs 异步 - 理解基本概念

**生活类比**：
- **同步**：在银行排队，必须等前面的人办完才轮到你（阻塞）
- **异步**：在餐厅点餐，点完菜可以聊天，菜好了服务员会通知你（非阻塞）

```javascript
// 同步代码 - 按顺序执行
MNUtil.log("第1步：开始处理");
MNUtil.log("第2步：处理中...");
MNUtil.log("第3步：处理完成");
// 执行顺序：1 → 2 → 3

// 异步代码 - 不等待就继续执行
MNUtil.log("第1步：开始处理");
setTimeout(() => {
  MNUtil.log("第2步：延时任务完成");  // 1秒后执行
}, 1000);
MNUtil.log("第3步：继续其他任务");
// 实际执行顺序：1 → 3 → (1秒后) 2
```

#### 8.2 Promise 基础 - 异步编程的现代方案

**Promise 就像"承诺书"**：
- 现在先给你一个承诺
- 将来某个时候会兑现承诺（成功或失败）

```javascript
// 创建一个简单的 Promise
function delayedTask(seconds) {
  return new Promise((resolve, reject) => {
    if (seconds < 0) {
      reject(new Error("时间不能为负数"));
      return;
    }

    setTimeout(() => {
      resolve(`任务在 ${seconds} 秒后完成了！`);
    }, seconds * 1000);
  });
}

// 使用 Promise
delayedTask(2)
  .then(result => {
    MNUtil.showHUD(result);  // 2秒后显示：任务在 2 秒后完成了！
  })
  .catch(error => {
    MNUtil.showHUD("出错了: " + error.message);
  });

MNUtil.log("不需要等待，继续执行其他任务");
```

#### 8.3 async/await - 让异步代码看起来像同步

**async/await 让异步代码更优雅**：

```javascript
// 传统 Promise 写法（回调地狱）
function processNotesOldWay() {
  delayedTask(1)
    .then(result1 => {
      MNUtil.log(result1);
      return delayedTask(1);
    })
    .then(result2 => {
      MNUtil.log(result2);
      return delayedTask(1);
    })
    .then(result3 => {
      MNUtil.log(result3);
      MNUtil.showHUD("所有任务完成");
    })
    .catch(error => {
      MNUtil.showHUD("出错: " + error.message);
    });
}

// async/await 写法（清晰易读）
async function processNotesNewWay() {
  try {
    let result1 = await delayedTask(1);
    MNUtil.log(result1);

    let result2 = await delayedTask(1);
    MNUtil.log(result2);

    let result3 = await delayedTask(1);
    MNUtil.log(result3);

    MNUtil.showHUD("所有任务完成");
  } catch (error) {
    MNUtil.showHUD("出错: " + error.message);
  }
}

// 使用 async 函数
processNotesNewWay();
```

#### 8.4 在 MarginNote 插件中的异步应用

让我们看看实际的应用场景：

```javascript
class AsyncNoteProcessor {
  constructor(name) {
    this.name = name;
  }

  // 模拟耗时的笔记处理
  async processNoteAsync(note) {
    if (!note) {
      throw new Error("没有笔记需要处理");
    }

    MNUtil.log(`开始处理笔记: ${note.noteTitle}`);

    // 模拟耗时操作（比如网络请求、复杂计算等）
    await this.delay(500); // 等待0.5秒

    // 处理笔记
    if (note.noteTitle) {
      note.noteTitle = note.noteTitle.trim();
    }

    // 再次模拟耗时操作
    await this.delay(300);

    // 添加时间戳
    let timestamp = new Date().toLocaleString();
    note.appendTextComment(`处理时间: ${timestamp}`);

    MNUtil.log(`完成处理笔记: ${note.noteTitle}`);
    return `笔记 ${note.noteTitle} 处理完成`;
  }

  // 工具方法：创建延时 Promise
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // 批量异步处理笔记
  async batchProcessAsync(notes) {
    if (!notes || notes.length === 0) {
      MNUtil.showHUD("没有笔记需要处理");
      return [];
    }

    MNUtil.showHUD(`开始批量处理 ${notes.length} 个笔记`);
    let results = [];
    let errors = [];

    // 方法1：顺序处理（一个接一个）
    for (let i = 0; i < notes.length; i++) {
      try {
        let result = await this.processNoteAsync(notes[i]);
        results.push(result);

        // 显示进度
        if ((i + 1) % 5 === 0 || i === notes.length - 1) {
          MNUtil.showHUD(`已处理 ${i + 1}/${notes.length} 个笔记`);
        }
      } catch (error) {
        errors.push(`第${i+1}个笔记处理失败: ${error.message}`);
        MNUtil.log(errors[errors.length - 1]);
      }
    }

    // 显示最终结果
    let summary = `批量处理完成:\n成功: ${results.length}\n失败: ${errors.length}`;
    MNUtil.showHUD(summary);

    return { results, errors };
  }

  // 并行批量处理（同时处理多个）
  async batchProcessParallel(notes, maxConcurrent = 3) {
    if (!notes || notes.length === 0) {
      MNUtil.showHUD("没有笔记需要处理");
      return [];
    }

    MNUtil.showHUD(`开始并行处理 ${notes.length} 个笔记`);
    let results = [];
    let errors = [];

    // 分批并行处理
    for (let i = 0; i < notes.length; i += maxConcurrent) {
      let batch = notes.slice(i, i + maxConcurrent);
      let batchPromises = batch.map(async (note, index) => {
        try {
          let result = await this.processNoteAsync(note);
          return { success: true, result, index: i + index };
        } catch (error) {
          return { success: false, error: error.message, index: i + index };
        }
      });

      // 等待当前批次完成
      let batchResults = await Promise.all(batchPromises);

      // 处理批次结果
      batchResults.forEach(item => {
        if (item.success) {
          results.push(item.result);
        } else {
          errors.push(`第${item.index + 1}个笔记: ${item.error}`);
        }
      });

      // 显示进度
      let processed = Math.min(i + maxConcurrent, notes.length);
      MNUtil.showHUD(`并行处理进度: ${processed}/${notes.length}`);

      // 批次间稍作延迟，避免过度并发
      if (i + maxConcurrent < notes.length) {
        await this.delay(100);
      }
    }

    let summary = `并行处理完成:\n成功: ${results.length}\n失败: ${errors.length}`;
    MNUtil.showHUD(summary);

    return { results, errors };
  }
}

// 使用示例
async function demonstrateAsyncProcessing() {
  let processor = new AsyncNoteProcessor("异步处理器");
  let notes = MNNote.getFocusNotes();

  if (notes.length > 0) {
    try {
      MNUtil.log("=== 演示单个笔记异步处理 ===");
      let result = await processor.processNoteAsync(notes[0]);
      MNUtil.log(result);

      if (notes.length > 1) {
        MNUtil.log("=== 演示批量顺序处理 ===");
        let batchResult = await processor.batchProcessAsync(notes.slice(0, 3));
        MNUtil.log(`顺序处理结果: 成功${batchResult.results.length}个`);

        MNUtil.log("=== 演示批量并行处理 ===");
        let parallelResult = await processor.batchProcessParallel(notes.slice(0, 5));
        MNUtil.log(`并行处理结果: 成功${parallelResult.results.length}个`);
      }
    } catch (error) {
      MNUtil.showHUD("处理过程中出错: " + error.message);
    }
  } else {
    MNUtil.showHUD("请先选择一些笔记");
  }
}

// 调用演示函数
demonstrateAsyncProcessing();
```

#### 8.5 异步编程的最佳实践

```javascript
class AsyncBestPractices {
  // 1. 错误处理要完善
  static async safeAsyncOperation(operation) {
    try {
      let result = await operation();
      return { success: true, data: result };
    } catch (error) {
      MNUtil.log(`异步操作失败: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  // 2. 设置超时避免无限等待
  static async withTimeout(promise, timeoutMs = 5000) {
    let timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('操作超时')), timeoutMs);
    });

    return Promise.race([promise, timeoutPromise]);
  }

  // 3. 批量操作要控制并发数
  static async batchWithLimit(items, asyncFn, limit = 3) {
    let results = [];

    for (let i = 0; i < items.length; i += limit) {
      let batch = items.slice(i, i + limit);
      let batchPromises = batch.map(item => asyncFn(item));
      let batchResults = await Promise.allSettled(batchPromises);

      results.push(...batchResults);

      // 批次间稍作延迟
      if (i + limit < items.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    return results;
  }

  // 4. 重试机制
  static async withRetry(asyncFn, maxRetries = 3, delay = 1000) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await asyncFn();
      } catch (error) {
        if (attempt === maxRetries) {
          throw error;
        }

        MNUtil.log(`第${attempt}次尝试失败，${delay}ms后重试...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
}

// 使用最佳实践的示例
async function bestPracticeExample() {
  // 1. 安全的异步操作
  let safeResult = await AsyncBestPractices.safeAsyncOperation(async () => {
    // 模拟可能出错的操作
    if (Math.random() > 0.5) {
      throw new Error("随机错误");
    }
    return "操作成功";
  });

  if (safeResult.success) {
    MNUtil.log("安全操作成功: " + safeResult.data);
  } else {
    MNUtil.log("安全操作失败: " + safeResult.error);
  }

  // 2. 带超时的操作
  try {
    let timeoutResult = await AsyncBestPractices.withTimeout(
      delayedTask(3),  // 3秒的任务
      2000            // 2秒超时
    );
    MNUtil.log("超时测试成功: " + timeoutResult);
  } catch (error) {
    MNUtil.log("超时测试失败: " + error.message);
  }
}

// 运行最佳实践示例
bestPracticeExample();
```

---

### 第8章小结

🎉 恭喜！你已经掌握了异步编程的核心概念！

✅ **异步编程基础**：
- 理解同步 vs 异步的区别
- 掌握 Promise 的基本用法
- 熟悉 async/await 语法

✅ **实际应用**：
- 在 MarginNote 插件中处理耗时操作
- 批量异步处理的两种模式（顺序 vs 并行）
- 错误处理和进度反馈

✅ **最佳实践**：
- 完善的错误处理机制
- 超时控制避免无限等待
- 并发控制避免过度负载
- 重试机制提高成功率
