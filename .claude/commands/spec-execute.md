# Spec Execute Command

Execute specific tasks from the approved task list.

## Usage
```
/spec-execute [task-id] [feature-name]
```

## 🛑 EXECUTION BLOCKERS - READ FIRST

**YOU MUST NOT:**
- ❌ Execute tasks without verifying tasks.md is approved
- ❌ Execute multiple tasks simultaneously  
- ❌ Skip calling the spec-task-executor agent
- ❌ Proceed to next task without marking current task complete
- ❌ Execute tasks that don't reference specific requirements

**IF YOU VIOLATE ANY OF THESE RULES, STOP IMMEDIATELY AND CORRECT THE ERROR**

## 📋 TASK EXECUTION PREREQUISITES

Verify these conditions before executing ANY task:

```yaml
# Required State to Execute Tasks
prerequisites:
  - requirements.md: must_exist_and_be_approved
  - design.md: must_exist_and_be_approved  
  - tasks.md: must_exist_and_be_approved
  - current_phase: implementation
  - task_state: must_be_pending_or_in_progress
```

**RULE**: You can ONLY execute tasks if ALL specification documents exist and were user-approved

## Phase Overview
**Your Role**: Execute tasks systematically with validation

This is Phase 4 of the spec workflow. Your goal is to implement individual tasks from the approved task list, one at a time.

## Instructions

**Execution Steps**:

**Step 1: Load Context**
```bash
# Load steering documents (if available)
claude-code-spec-workflow get-steering-context

# Load specification context
claude-code-spec-workflow get-spec-context {feature-name}

# Load specific task details
claude-code-spec-workflow get-tasks {feature-name} {task-id} --mode single
```

### 🛑 MANDATORY AGENT EXECUTION

**YOU MUST CALL THIS AGENT - NO EXCEPTIONS:**

Use the Task tool to invoke the `spec-task-executor` agent:
- **subagent_type**: `spec-task-executor`
- **description**: "Execute task {task-id}"
- **prompt**: "Execute task {task-id} for the {feature-name} specification. Follow all project conventions, leverage existing code, and implement ONLY the specified task. Provide a completion summary when done."

**If you do not call this agent, you have violated the workflow.**


3. **Task Execution**
   - Focus on ONE task at a time
   - If task has sub-tasks, start with those
   - Follow the implementation details from design.md
   - Verify against requirements specified in the task

4. **Implementation Guidelines**
   - Write clean, maintainable code
   - **Follow steering documents**: Adhere to patterns in tech.md and conventions in structure.md
   - Follow existing code patterns and conventions
   - Include appropriate error handling
   - Add unit tests where specified
   - Document complex logic

5. **Validation**
   - Verify implementation meets acceptance criteria
   - Run tests if they exist
   - Check for lint/type errors
   - Ensure integration with existing code

### 🛑 TASK COMPLETION MANDATORY STOP POINT

**BEFORE CONSIDERING TASK COMPLETE, VERIFY THIS CHECKLIST:**

```
✅ TASK COMPLETION CHECKLIST:
□ spec-task-executor agent was called and completed successfully
□ Implementation meets the task's acceptance criteria
□ Code follows project conventions and leverages existing patterns
□ No unintended side effects or regressions introduced
□ Task marked complete using: claude-code-spec-workflow get-tasks {feature-name} {task-id} --mode complete

IF ANY CHECKBOX IS UNCHECKED, THE TASK IS NOT COMPLETE
```

#### COMPLETION PROTOCOL

When completing any task during `/spec-execute`:
1. **Mark task complete**: Use the get-tasks script to mark completion:
   ```bash
   # Cross-platform command:
   claude-code-spec-workflow get-tasks {feature-name} {task-id} --mode complete
   ```
2. **Confirm to user**: State clearly "Task X has been marked as complete"
3. **STOP EXECUTION**: Do not proceed to next task automatically
4. **Wait for instruction**: Let user decide next steps




## Critical Workflow Rules

### Task Execution
- **ONLY** execute one task at a time during implementation
- **CRITICAL**: Mark completed tasks using get-tasks --mode complete before stopping
- **ALWAYS** stop after completing a task
- **NEVER** automatically proceed to the next task
- **MUST** wait for user to request next task execution
- **CONFIRM** task completion status to user

### Requirement References
- **ALL** tasks must reference specific requirements using _Requirements: X.Y_ format
- **ENSURE** traceability from requirements through design to implementation
- **VALIDATE** implementations against referenced requirements

## Task Selection
If no task-id specified:
- Look at tasks.md for the spec
- Recommend the next pending task
- Ask user to confirm before proceeding

If no feature-name specified:
- Check `.claude/specs/` directory for available specs
- If only one spec exists, use it
- If multiple specs exist, ask user which one to use
- Display error if no specs are found

## Examples
```
/spec-execute 1 user-authentication
/spec-execute 2.1 user-authentication
```

## Important Rules
- Only execute ONE task at a time
- **ALWAYS** mark completed tasks using get-tasks --mode complete
- Always stop after completing a task
- Wait for user approval before continuing
- Never skip tasks or jump ahead
- Confirm task completion status to user

## Next Steps
After task completion, you can:
- Address any issues identified in the review
- Run tests if applicable
- Execute the next task using `/spec-execute [next-task-id]`
- Check overall progress with `/spec-status {feature-name}`
