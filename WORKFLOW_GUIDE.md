This guide is specifically for the MN-Addon project, combining claude-code-spec-workflow with existing MarginNote development tools. ### 🚀 Quick Start ##################################
You must restart Claude Code after the initial installation to see the new commands.
Bash
claude --continue # Continue the current conversation # or claude # Start a new conversation

View Available Commands - **Spec Workflow**: `/spec-create`, `/spec-execute`, `/spec-status`, `/spec-list`
- **Bug Workflow**: `/bug-create`, `/bug-analyze`, `/bug-fix`, `/bug-verify`
- **MarginNote Dedicated**: `/mn4-addon-deep-research`

# 📋 I. New Feature Development (Spec Workflow)

Real-world case study: Adding task priority to MNTask Step 1: Create a functional specification ``bash'
`/spec-create task-priority' adds task priority management functionality to MNTask.
"```

##################

**Requirements Phase**:
"```
Claude: I will create a task authorization feature feature specification for MNTask. First, I will analyze the existing code structure.

Analysis of MNTask's Existing Functionality
- TaskFieldUtils Field Management System - xdyy_custom_actions_registry.js Action Mechanism - Task Card Field Layout Pattern [Create Requirements Document]
User Story As an MNTask user, I want to set priorities (high/medium/low) for tasks so that:
- Better manage task order - Quickly identify important tasks - Filter tasks by priority #Interface Criteria 1. When the user opens the task card, the priority field should be displayed. 2. When the user clicks the priority field, a selection dialog box should pop up. 3. When the user selects a priority, the priority field should be updated and saved. Requirements document complete creation. Continue to the design phase?
"```

**Design Phase**:
"```
Claude [Create Design Document]
Reusing Existing Components - Creating Priority Fields using TaskFieldUtils.createFieldHtml() - Reusing showActionDialog() Interaction Mode - Following the HTML Structure of Existing Fields ######################################################################### `TaskFieldUtils.createPriorityField(priority]]
2. `TaskActions.setPriority(note, priority)'
3. `TaskFieldUtils.getPriorityFromNote(note)]

Layout Priority Field Position: Below the status field, maintaining the field hierarchy. Design document complete. Continue to task breakdown?
"```

The Task Phase**:
"```
Claude: [Create Task List]
###Development Tasks ##################### Basic Field Support - Add the createPriorityField method to TaskFieldUtils (TaskFieldUtils.js:250-270)
Add the getPriorityFromNote method to TaskFieldUtils (TaskFieldUtils.js:350-380) []
Modify the parseTaskComments method to identify priority fields (TaskFieldUtils.js:180-200)

###2 User Interaction - [ ] Add the setPriority action (line 800+) to xdyy_custom_actions_registry.js
- [ ] Implement a priority selection dialog box (reusing the showActionDialog mode)

###3 Test Verification - [ ] Create and update test priority fields - [ ] Test compatibility with existing fields. Task decomposition complete. Do you want to generate a separate task command?
"```

Step 2: Select Implementation Method** Option A: Use Standalone Task Command
Bash
You: Yes, the task command. Claude: Generating task command
The following commands were generated:
- /task-priority-task-1
- /task-priority-task-2
- /task-priority-task-3

After restarting Claude Code, you can use these commands to execute tasks one by one.
"```

Option B: Use general execution commands**
Bash
You: No, I'll use the general method. Claude: Okay, you can use /spec-execute task-priority to execute the task.
"```

More Practical Examples 2: Adding Batch Processing to MNAi
`/spec-create mnai-batch' adds batch AI processing functionality to MNAI.
"```

Case 3: Adding keyboard shortcut support to MNEditor ``bash'
`/spec-create mneditator-hotkeys` adds custom keyboard shortcuts to MNEditor.
"```

Case 4: Adding Bookmark Management to MNBrowser
`/spec-create mnbrowser-bookmarks` adds a webpage bookmark management functionality to MNBrowser.
"```

## 🐛 II. Bug Fixing (Bug Workflow)

Real-world case study: Fixing the MNTask startup crash issue. This is a documented issue in your project; let's handle it using a bug workflow:

Step 1: Create a Bug Report
The bug `/bug-create task-launch-crash` error message indicates that the application crashes after clicking to start the MNTask task.
"```

##################
“`````````````````
Claude [Create Bug Report]
## Problem Description After clicking the "Start Task" button in MNTask, the MarginNote 4 application crashes immediately.

##Reproduction Steps 1. Open the notebook containing the task card. 2. Select the task card. 3. Click the "Start Task" button. 4. The application crashes and exits. ## Environment Information - Plugin: MNTask v0.16.2
- MarginNote: 4.x
Platform: macOS

##Crash Log```
Exception Type: EXC_CRASH (SIGABRT)
Foundation -[NSUserDefaults(NSUserDefaults) setObject:forKey:]
"```

Bug report created. Please continue the analysis phase.
“`````````````````

Step 2: Analyze the problem
/bug-analyze task-launch-crash
"```

“`````````````````
Claude: "Analyze the root causes of the problem"
Root Cause Analysis: This involves analyzing the crash logs and MNTask code.

### Problem Locating - **Crash Location**: NSUserDefaults.setObjectForKey
- **Call path:** launchTask → saveLaunchedTaskState → NSUserDefaults
- **Root cause:** JavaScript objects are directly passed to the Objective-C API.

############>`javascript>
// utils.js - Problematic code static saveLaunchedTaskState(state) {
  const key = `MNTask_launchedTaskState_${notebookId}`
  this.save(key, state) // ❌ JS objects are directly stored in NSUserDefaults
}
"```

The solution requires JSON serialization to ensure type compatibility.

Analysis complete. Proceed to the repair phase?
“`````````````````

Step 3: “Hint the repair”
/bug-fix task-launch-crash
"```

“`````````````````
Claude: [Implementing the remediation plan]
Fixing the MNTask crash issue on startup...

Solution 1: Serialize and store
// utils.js - Fixed code static saveLaunchedTaskState(state) {
  const notebookId = this.getCurrentNotebookId()
  If (!) notebookId) return

  const key = `MNTask_launchedTaskState_${notebookId}`
  // ✅ Serialize to JSON string const jsonString = JSON.stringify(state)
  this.save(key, jsonString)
}
"```

Solution 2: Deserialize and read
static getLaunchedTaskState() {
  const key = `MNTask_launchedTaskState_${notebookId}`
  const jsonString = this.getByDefault(key, null)

  if (jsonString) {
    try {
      return JSON.parse(jsonString) // ✅ Secure parsing } catch (e) {
      Return to default State
    }
  }
  Return to default State
}
"```

The repair is complete. Shall we proceed to the verification phase?
“`````````````````

Step 4: Verify and repair
/bug-verify task-launch-crash
"```

More Bug Case Studies ###### Bug workflow based on your project's actual problems:

Bash
# Fixed field lookup method conflict / bug-create field-method-conflict "TaskFieldUtils method name conflict caused field failure"

# Fixed duplicate links between parent and child tasks /bug-createned duplicate-task-links "Duplicate child task links appear in the parent task"

# Fixed launch link lookup failure / bug-create launch-link-not-found "getLaunchLink method could not find launch link"
"```

## 🔧 III. Perfect Integration with Existing Tools #######Professional Development Process 1: New Feature Development ``bash'
#1 In-depth analysis of existing plugins (your dedicated tools)
/mn4-addon-deep-research mntask

#2. Creating Functional Specifications (New Tool)
`/spec-create task-priority' adds the function to prioritize tasks.

#3. Package and release (your dedicated agent will be invoked automatically)
"```

Process 2: Problem Solving
#1 Reporting and analyzing issues (new tools)
The `/bug-create task-crash` command indicates a task function crash.
/bug-analyze task-crash

#2. In-depth analysis of relevant code (your dedicated tool)
/mn4-addon-deep-research mntask

#3. Implement the fix (new tool)
/bug-fix task-crash
"```

### Clearly Defined Tool Roles** Your Dedicated MarginNote Tools**:
- 🔍 `/mn4-addon-deep-research` - Deep code analysis - 📦 `mnaddon-packager` agent - Automatic packaging - 🎯 `git-commit-manager` agent - Intelligent commit management **New general development tools**:
- 📋 `/spec-*` Series - Standardized Feature Development - 🐛 `/bug-*` Series - Systematic Problem Solving - ✅ Various Verification Agents - Quality Assurance ## 📊 IV. Status Monitoring and Management ###########Bash Project Status ```bash'
# View all feature specifications/spec-list

View the progress of a specific feature /spec-status task-priority

# View all bug statuses /bug-status
"```

#### Example output of status``
Current list of specifications:
Task Priority (Completed)
🔄 mnai-batch (In progress - design phase)
mneditor-hotkeys (to be started)

Bug status:
✅ task-launch-crash (fixed)
Field-method conflict (under analysis)
"```

#💡 V. Best Practices ###1 Choose the right workflow **Scenarios for using Spec workflows**:
New feature development (such as task support, batch processing)
Complex refactoring (such as redesigning the UI)
Features require detailed documentation (for team collaboration)

Scenarios for using the bug workflow:
Crash fixes (such as crashes when starting a task)
- ✅ Functionality error (e.g., field lookup failed)
User-reported issues in scenarios where existing tools are still in use:
- ✅ Quick code adjustments - ✅ Plugin packaging and deployment - ✅ Git operations ###2 Naming conventions **Feature naming conventions**:
- `Plugin Name-Function Name`: e.g., `mntask-priority`, `mnai-batch`
Use kebab-case (hyphen separator)
Descriptive but concise **bug naming**:
Describe the problem symptoms: such as `task-launch-crash`, `field-method-conflict`
- Highlight the scope of influence: such as `editor-cursor-position`, `browser-bookmark-sync`

###3 Integration with the MNUtils framework for **automatic processing of spec workflows**:
- ✅ Identify the MNUtils/xdyyutils version you are using - ✅ Follow existing field HTML formats - ✅ Reuse utility classes such as TaskFieldUtils and MNNote - ✅ Maintain consistency with existing code, for example, by task decomposition:
"```
Task: Add a priority field to the task card. Method: Use TaskFieldUtils.createFieldHtml("Priority: High", "mainField")
Location: Below the status field, using insertCommentAfter
Saving: Use MNUtil. undoGrouping to wrap the operation.

###4 Documentation and Tracking **Specification Document Location**:
- 📁 `.claude/specs/function_name/`
- 📄 `requirements.md` - Requirements document - 📄 `design.md` - Design document - 📄 `tasks.md` - Task breakdown **Bug recording location**:
- 📁 `.claude/bugs/issue_name/`
- 📄 `report.md` - Problem Report - 📄 `analysis.md` - Analysis Results - 📄 `verification.md` - Verification Checklist ## 🚀 VI. Practical Exercises #### Exercise 1: Create Your First Functional Specification Choose a function you want, for example:
Bash
`/spec-create mntask-tags` adds task tag categorization functionality to MNTask.
"```

Follow Claude's instructions to complete the entire process.

Exercise 2: Troubleshooting a Real World Bug

Select a known issue in the project:
Bash
`/bug-create actual-bug` describes an actual problem you encountered.
"```

Exercise 3: Integrate Workflows and Try the Complete Development Cycle
1. Analyze existing plugins using `/mn4-addon-deep-research`. 2. Plan new features using `/spec-create`. 3. Implement the features. 4. Submit the code. 5. Release the version using the packaging agent. Support and Feedback If you encounter any of the problems use:
1. Check the templates and documentation in the `.claude/` directory. 2. Check the status using `/spec-status` or `/bug-status`. 3. Refer to the relevant sections of this guide. 4. Utilize your existing MarginNote tools to resolve the issue.

*This guide will be continuously updated and improved based on user experience. :: 🔄
