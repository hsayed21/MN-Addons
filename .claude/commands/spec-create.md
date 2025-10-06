# Spec Create Command

Create a new feature specification following the complete spec-driven workflow.

## Usage
```
/spec-create <feature-name> [description]
```

## 🛑 EXECUTION BLOCKERS - READ FIRST

**YOU MUST NOT:**
- ❌ Jump to implementation without creating documents first
- ❌ Proceed to next phase without explicit user approval
- ❌ Skip calling validation agents (spec-requirements-validator, spec-design-validator, spec-task-validator)
- ❌ Create any code before all three documents (requirements.md, design.md, tasks.md) are created and approved
- ❌ Skip any phase in the sequence: Requirements → Design → Tasks → Implementation

**IF YOU VIOLATE ANY OF THESE RULES, STOP IMMEDIATELY AND CORRECT THE ERROR**

## 📋 PHASE TRACKING SYSTEM

Before starting ANY action, verify your current state:

```yaml
# Current Execution State (update as you progress)
current_phase: null  # Must be: null | requirements | design | tasks | implementation
files_status:
  - requirements.md: not_created  # not_created | created | validated | approved
  - design.md: not_created       # not_created | created | validated | approved  
  - tasks.md: not_created        # not_created | created | validated | approved
agents_called:
  - spec-requirements-validator: false
  - spec-design-validator: false
  - spec-task-validator: false
user_approvals:
  - requirements: false
  - design: false
  - tasks: false
```

**RULE**: You can ONLY advance to the next phase when the previous phase shows "approved: true"

## Workflow Philosophy

You are an AI assistant that specializes in spec-driven development. Your role is to guide users through a systematic approach to feature development that ensures quality, maintainability, and completeness.

### Core Principles
- **Structured Development**: Follow the sequential phases without skipping steps
- **User Approval Required**: Each phase must be explicitly approved before proceeding
- **Atomic Implementation**: Execute one task at a time during implementation
- **Requirement Traceability**: All tasks must reference specific requirements
- **Test-Driven Focus**: Prioritize testing and validation throughout

## Complete Workflow Sequence

**CRITICAL**: Follow this exact sequence - do NOT skip steps:

1. **Requirements Phase** (Phase 1)
   - Create requirements.md using template
   - Get user approval
   - Proceed to design phase

2. **Design Phase** (Phase 2)
   - Create design.md using template
   - Get user approval
   - Proceed to tasks phase

3. **Tasks Phase** (Phase 3)
   - Create tasks.md using template
   - Get user approval
   - **Ask user if they want task commands generated** (yes/no)
   - If yes: run `claude-code-spec-workflow generate-task-commands {spec-name}`

4. **Implementation Phase** (Phase 4)
   - Use generated task commands or execute tasks individually

## Instructions

You are helping create a new feature specification through the complete workflow. Follow these phases sequentially:

**WORKFLOW SEQUENCE**: Requirements → Design → Tasks → Generate Commands
**DO NOT** run task command generation until all phases are complete and approved.

### Initial Setup

1. **Create Directory Structure**
   - Create `.claude/specs/{feature-name}/` directory
   - Initialize empty requirements.md, design.md, and tasks.md files

2. **Load ALL Context Once (Hierarchical Context Loading)**
   Load complete context at the beginning - this will be used throughout the creation process:

   ```bash
   # Load steering documents (if available)
   claude-code-spec-workflow get-steering-context

   # Load specification templates for structure guidance
   claude-code-spec-workflow get-template-context spec
   ```

   **Store this context** - you will reference it throughout all phases without reloading.

3. **Analyze Existing Codebase** (BEFORE starting any phase)
   - **Search for similar features**: Look for existing patterns relevant to the new feature
   - **Identify reusable components**: Find utilities, services, hooks, or modules that can be leveraged
   - **Review architecture patterns**: Understand current project structure, naming conventions, and design patterns
   - **Cross-reference with steering documents**: Ensure findings align with documented standards
   - **Find integration points**: Locate where new feature will connect with existing systems
   - **Document findings**: Note what can be reused vs. what needs to be built from scratch

## PHASE 1: Requirements Creation

**Template to Follow**: Use the requirements template from the pre-loaded context above (do not reload).

### Requirements Process
1. **Generate requirements.md Document**
   - Use the requirements template structure precisely
   - **Align with product.md**: Ensure requirements support the product vision and goals
   - Create user stories in "As a [role], I want [feature], so that [benefit]" format
   - Write acceptance criteria in EARS format (WHEN/IF/THEN statements)
   - Consider edge cases and technical constraints
   - **Reference steering documents**: Note how requirements align with product vision

### Requirements Template Usage
- **Read and follow**: Load the requirements template using:
  ```bash
  # Windows: claude-code-spec-workflow get-content "C:\path\to\project\.claude\templates\requirements-template.md"
  # macOS/Linux: claude-code-spec-workflow get-content "/path/to/project/.claude/templates/requirements-template.md"
  ```
- **Use exact structure**: Follow all sections and formatting from the template
- **Include all sections**: Don't omit any required template sections

### 🛑 PHASE 1 MANDATORY STOP POINT

**BEFORE PROCEEDING, COMPLETE THIS CHECKLIST:**

```
✅ REQUIREMENTS PHASE CHECKLIST:
□ requirements.md created and saved to .claude/specs/{feature-name}/
□ spec-requirements-validator agent called (MANDATORY)
□ Validation result: PASS or improved to PASS
□ User explicitly approved with "yes", "approved", or "looks good"

IF ANY CHECKBOX IS UNCHECKED, YOU MUST NOT PROCEED TO PHASE 2
```

#### MANDATORY VALIDATION STEP

**YOU MUST CALL THIS AGENT - NO EXCEPTIONS:**

Use the Task tool to invoke the `spec-requirements-validator` agent:
- **subagent_type**: `spec-requirements-validator`
- **description**: "Validate requirements document" 
- **prompt**: "Validate the requirements document for {feature-name}. Check structure, user stories, acceptance criteria, and alignment with steering documents. Provide feedback and rate as PASS/NEEDS_IMPROVEMENT/MAJOR_ISSUES."

**If validation fails**: Use the feedback to improve the requirements before presenting to user.

#### USER APPROVAL STEP

- **Present the validated requirements document** with codebase analysis summary
- Ask: **"Do the requirements look good? If so, we can move on to the design phase."**
- **CRITICAL**: Wait for explicit approval before proceeding to Phase 2
- Accept only clear affirmative responses: "yes", "approved", "looks good", etc.
- If user provides feedback, make revisions and ask for approval again

## PHASE 2: Design Creation

**Template to Follow**: Use the design template from the pre-loaded context above (do not reload).

### Design Process
1. **Load Previous Phase**
   - Ensure requirements.md exists and is approved
   - Load requirements document for context:

   ```bash
   # Load the completed requirements document
   claude-code-spec-workflow get-spec-context {feature-name}
   ```

   **Note**: This loads the requirements.md you just created, along with any existing design/tasks files.

2. **Codebase Research** (MANDATORY)
   - **Map existing patterns**: Identify data models, API patterns, component structures
   - **Cross-reference with tech.md**: Ensure patterns align with documented technical standards
   - **Catalog reusable utilities**: Find validation functions, helpers, middleware, hooks
   - **Document architectural decisions**: Note existing tech stack, state management, routing patterns
   - **Verify against structure.md**: Ensure file organization follows project conventions
   - **Identify integration points**: Map how new feature connects to existing auth, database, APIs

3. **Create Design Document**
   - Use the design template structure precisely
   - **Incorporate research findings** from web researcher agent (if available)
   - **Build on existing patterns** rather than creating new ones
   - **Follow tech.md standards**: Ensure design adheres to documented technical guidelines
   - **Respect structure.md conventions**: Organize components according to project structure
   - **Include Mermaid diagrams** for visual representation
   - **Define clear interfaces** that integrate with existing systems

### Design Template Usage
- **Read and follow**: Load the design template using:
  ```bash
  # Windows: claude-code-spec-workflow get-content "C:\path\to\project\.claude\templates\design-template.md"
  # macOS/Linux: claude-code-spec-workflow get-content "/path/to/project/.claude/templates/design-template.md"
  ```
- **Use exact structure**: Follow all sections and formatting from the template
- **Include Mermaid diagrams**: Add visual representations as shown in template

### 🛑 PHASE 2 MANDATORY STOP POINT

**BEFORE PROCEEDING, COMPLETE THIS CHECKLIST:**

```
✅ DESIGN PHASE CHECKLIST:
□ design.md created and saved to .claude/specs/{feature-name}/
□ spec-design-validator agent called (MANDATORY)
□ Validation result: PASS or improved to PASS
□ User explicitly approved with "yes", "approved", or "looks good"

IF ANY CHECKBOX IS UNCHECKED, YOU MUST NOT PROCEED TO PHASE 3
```

#### MANDATORY VALIDATION STEP

**YOU MUST CALL THIS AGENT - NO EXCEPTIONS:**

Use the Task tool to invoke the `spec-design-validator` agent:
- **subagent_type**: `spec-design-validator`
- **description**: "Validate design document"
- **prompt**: "Validate the design document for {feature-name}. Check technical soundness, architecture quality, alignment with tech.md standards and structure.md conventions, and proper leverage of existing code. Provide feedback and rate as PASS/NEEDS_IMPROVEMENT/MAJOR_ISSUES."

**If validation fails**: Use the feedback to improve the design before presenting to user.

#### USER APPROVAL STEP

- **Present the validated design document** with code reuse highlights and steering document alignment
- Ask: **"Does the design look good? If so, we can move on to the implementation planning."**
- **CRITICAL**: Wait for explicit approval before proceeding to Phase 3

## PHASE 3: Tasks Creation

**Template to Follow**: Load and use the exact structure from the tasks template:

```bash
# Windows:
claude-code-spec-workflow get-content "C:\path\to\project\.claude\templates\tasks-template.md"

# macOS/Linux:
claude-code-spec-workflow get-content "/path/to/project/.claude/templates/tasks-template.md"
```

### Task Planning Process
1. **Load Previous Phases**
   - Ensure design.md exists and is approved
   - Load both requirements.md and design.md for complete context:

   ```bash
   # Load all completed specification documents
   claude-code-spec-workflow get-spec-context {feature-name}
   ```

   **Note**: This loads the requirements.md and design.md you created in previous phases.

2. **Generate Atomic Task List**
   - Break design into atomic, executable coding tasks following these criteria:

   **Atomic Task Requirements**:
   - **File Scope**: Each task touches 1-3 related files maximum
   - **Time Boxing**: Completable in 15-30 minutes by an experienced developer
   - **Single Purpose**: One testable outcome per task
   - **Specific Files**: Must specify exact files to create/modify
   - **Agent-Friendly**: Clear input/output with minimal context switching

   **Task Granularity Examples**:
   - BAD: "Implement authentication system"
   - GOOD: "Create User model in models/user.py with email/password fields"
   - BAD: "Add user management features"
   - GOOD: "Add password hashing utility in utils/auth.py using bcrypt"

   **Implementation Guidelines**:
   - **Follow structure.md**: Ensure tasks respect project file organization
   - **Prioritize extending/adapting existing code** over building from scratch
   - Use checkbox format with numbered hierarchy
   - Each task should reference specific requirements AND existing code to leverage
   - Focus ONLY on coding tasks (no deployment, user testing, etc.)
   - Break large concepts into file-level operations

### Task Template Usage
- **Read and follow**: Load the tasks template using:
  ```bash
  # Windows: claude-code-spec-workflow get-content "C:\path\to\project\.claude\templates\tasks-template.md"
  # macOS/Linux: claude-code-spec-workflow get-content "/path/to/project/.claude/templates/tasks-template.md"
  ```
- **Use exact structure**: Follow all sections and formatting from the template
- **Use checkbox format**: Follow the exact task format with requirement references

### Task Validation and Approval
- **Automatic Validation**: Use the `spec-task-validator` agent to validate the tasks:

```
Use the spec-task-validator agent to validate the task breakdown for the {feature-name} specification.

The agent should:
1. Read the tasks document using get-content script:
   ```bash
   # Windows:
   claude-code-spec-workflow get-content "C:\path\to\project\.claude\specs\{feature-name}\tasks.md"

   # macOS/Linux:
   claude-code-spec-workflow get-content "/path/to/project/.claude/specs/{feature-name}/tasks.md"
   ```
2. Read requirements.md and design.md for context
3. Validate each task against atomicity criteria (file scope, time boxing, single purpose)
4. Check for agent-friendly formatting and clear specifications
5. Verify requirement references and leverage information are accurate
6. Rate the overall quality as PASS, NEEDS_IMPROVEMENT, or MAJOR_ISSUES

If validation fails, use the feedback to break down tasks further and improve atomicity before presenting to the user.
```






### 🛑 PHASE 3 MANDATORY STOP POINT

**BEFORE PROCEEDING, COMPLETE THIS CHECKLIST:**

```
✅ TASKS PHASE CHECKLIST:
□ tasks.md created and saved to .claude/specs/{feature-name}/
□ spec-task-validator agent called (MANDATORY)
□ Validation result: PASS or improved to PASS
□ User explicitly approved with "yes", "approved", or "looks good"

IF ANY CHECKBOX IS UNCHECKED, YOU MUST NOT PROCEED TO IMPLEMENTATION
```

#### MANDATORY VALIDATION STEP

**YOU MUST CALL THIS AGENT - NO EXCEPTIONS:**

Use the Task tool to invoke the `spec-task-validator` agent:
- **subagent_type**: `spec-task-validator`
- **description**: "Validate task breakdown"
- **prompt**: "Validate the task breakdown for {feature-name}. Check that each task is atomic (1-3 files, 15-30 minutes), has clear specifications, includes requirement references, and is agent-friendly. Provide feedback and rate as PASS/NEEDS_IMPROVEMENT/MAJOR_ISSUES."

**If validation fails**: Use the feedback to break down tasks further and improve atomicity before presenting to user.

#### USER APPROVAL STEP

- **Present the validated task list**
- Ask: **"Do the tasks look good? Each task should be atomic and agent-friendly."**
- **CRITICAL**: Wait for explicit approval before proceeding
- **AFTER APPROVAL**: Ask **"Would you like me to generate individual task commands for easier execution? (yes/no)"**
- **IF YES**: Execute `claude-code-spec-workflow generate-task-commands {feature-name}`
- **IF NO**: Continue with traditional task execution approach

## Critical Workflow Rules

### Universal Rules
- **Only create ONE spec at a time**
- **Always use kebab-case for feature names**
- **MANDATORY**: Always analyze existing codebase before starting any phase
- **Follow exact template structures** from the specified template files
- **Do not proceed without explicit user approval** between phases
- **Do not skip phases** - complete Requirements → Design → Tasks → Commands sequence

### Approval Requirements
- **NEVER** proceed to the next phase without explicit user approval
- Accept only clear affirmative responses: "yes", "approved", "looks good", etc.
- If user provides feedback, make revisions and ask for approval again
- Continue revision cycle until explicit approval is received

### Template Usage
**Use the pre-loaded template context** from step 2 above - do not reload templates.

- **Requirements**: Must follow requirements template structure exactly
- **Design**: Must follow design template structure exactly
- **Tasks**: Must follow tasks template structure exactly
- **Include all template sections** - do not omit any required sections
- **Reference the loaded templates** - all specification templates were loaded at the beginning

### Task Command Generation
- **ONLY** ask about task command generation AFTER tasks.md is approved
- **Use NPX command**: `claude-code-spec-workflow generate-task-commands {feature-name}`
- **User choice**: Always ask the user if they want task commands generated (yes/no)
- **Restart requirement**: Inform user to restart Claude Code for new commands to be visible

## 🚨 WORKFLOW VIOLATION DETECTION AND RECOVERY

### Self-Check Questions (Ask Yourself Before ANY Action)
1. **Am I in the right phase?** Check current_phase status against what I'm about to do
2. **Have I called the required validation agent?** Each phase MUST have agent validation
3. **Do I have user approval?** Can't proceed without explicit "yes", "approved", "looks good"
4. **Am I trying to implement without documents?** All three docs must exist before implementation

### Violation Recovery Protocol
**If you realize you've violated the workflow:**

1. **STOP IMMEDIATELY** - Do not continue with current action
2. **Inform user**: "I've detected a workflow violation. I started [what you did wrong]. Let me correct this."
3. **Return to correct phase**: Go back to the last properly completed phase
4. **Complete missing steps**: 
   - Create missing documents
   - Call missing validation agents
   - Get missing user approvals
5. **Resume from correct point**: Continue following the proper sequence

### Common Violations and Fixes
| **Violation** | **Fix** |
|---------------|---------|
| Started implementing without docs | Stop → Create requirements.md → Continue sequence |
| Skipped validation agent | Stop → Call the agent → Wait for results → Continue |
| Proceeded without user approval | Stop → Present work → Ask for approval → Wait |
| Created design before requirements approved | Stop → Get requirements approval → Then proceed |
| Mixed phases (e.g., implementation in design) | Stop → Separate concerns → Follow proper sequence |

## Error Handling

If issues arise during the workflow:
- **Requirements unclear**: Ask targeted questions to clarify
- **Design too complex**: Suggest breaking into smaller components
- **Tasks too broad**: Break into smaller, more atomic tasks
- **Implementation blocked**: Document the blocker and suggest alternatives
- **Template not found**: Inform user that templates should be generated during setup
- **Workflow violation detected**: Follow the recovery protocol above

## ✅ SUCCESS CRITERIA CHECKLIST

**A successful spec workflow completion requires ALL of these:**

```yaml
Document Creation:
□ requirements.md exists in .claude/specs/{feature-name}/
□ design.md exists in .claude/specs/{feature-name}/
□ tasks.md exists in .claude/specs/{feature-name}/

Agent Validation (MANDATORY):
□ spec-requirements-validator called and passed
□ spec-design-validator called and passed  
□ spec-task-validator called and passed

User Approval (MANDATORY):
□ Requirements explicitly approved by user
□ Design explicitly approved by user
□ Tasks explicitly approved by user

Implementation Ready:
□ Task commands generated (if user requested)
□ Ready to proceed to implementation phase
```

**IF ANY CHECKBOX IS UNCHECKED, THE WORKFLOW IS INCOMPLETE**

## Example Usage
```
/spec-create user-authentication "Allow users to sign up and log in securely"
```

## Implementation Phase
After completing all phases and generating task commands, Display the following information to the user:
0. **RESTART Claude Code** for new commands to be visible
1. **Use individual task commands**: `/user-authentication-task-1`, `/user-authentication-task-2`, etc.
2. **Or use spec-execute**: Execute tasks individually as needed
3. **Track progress**: Use `/spec-status user-authentication` to monitor progress
