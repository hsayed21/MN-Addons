# Bug Create Command

Initialize a new bug fix workflow for tracking and resolving bugs.

## Usage
```
/bug-create <bug-name> [description]
```

## 🛑 EXECUTION BLOCKERS - READ FIRST

**YOU MUST NOT:**
- ❌ Proceed to analysis phase without explicit user approval
- ❌ Skip creating the bug report document (report.md)
- ❌ Jump directly to implementing fixes without documentation
- ❌ Move to next phase without completing the current phase

**IF YOU VIOLATE ANY OF THESE RULES, STOP IMMEDIATELY AND CORRECT THE ERROR**

## 📋 BUG WORKFLOW TRACKING

Before starting ANY action, verify your current state:

```yaml
# Current Bug Fix State (update as you progress)
current_phase: report  # report | analysis | fix | verification
files_status:
  - report.md: not_created      # not_created | created | approved
  - analysis.md: not_created    # not_created | created | approved
  - verification.md: not_created # not_created | created | approved
user_approvals:
  - report: false
  - analysis: false
  - fix: false
```

**RULE**: You can ONLY advance to the next phase when the previous phase shows "approved: true"

## Workflow Overview

This is the **streamlined bug fix workflow** - a lighter alternative to the full spec workflow for addressing bugs and issues.

### Bug Fix Phases
1. **Report Phase** (This command) - Document the bug
2. **Analysis Phase** (`/bug-analyze`) - Investigate root cause
3. **Fix Phase** (`/bug-fix`) - Implement solution
4. **Verification Phase** (`/bug-verify`) - Confirm resolution

## Instructions

You are helping create a new bug fix workflow. This is designed for smaller fixes that don't need the full spec workflow overhead.

1. **Create Directory Structure**
   - Create `.claude/bugs/{bug-name}/` directory
   - Initialize report.md, analysis.md, and verification.md files

2. **Load ALL Context Once (Hierarchical Context Loading)**
   Load complete context at the beginning for the bug creation process:

   ```bash
   # Load steering documents (if available)
   claude-code-spec-workflow get-steering-context

   # Load bug templates
   claude-code-spec-workflow get-template-context bug
   ```

3. **Gather Bug Information**
   - Take the bug name and optional description
   - Guide user through bug report creation
   - Use structured format for consistency

4. **Generate Bug Report**
   - **Template to Follow**: Use the bug report template from the pre-loaded context above (do not reload)
   - Create detailed bug description following the bug report template structure

## Template Usage
- **Follow exact structure**: Use loaded bug report template precisely
- **Include all sections**: Don't omit any required template sections
- **Structured format**: Follow the template's format for consistency

5. **Request User Input**
   - Ask for bug details if not provided in description
   - Guide through each section of the bug report
   - Ensure all required information is captured

6. **Save and Proceed**
   - Save the completed bug report to report.md

### 🛑 REPORT PHASE MANDATORY STOP POINT

**BEFORE PROCEEDING, COMPLETE THIS CHECKLIST:**

```
✅ BUG REPORT CHECKLIST:
□ report.md created and saved to .claude/bugs/{bug-name}/
□ Bug description includes reproduction steps
□ Environment information documented
□ Expected vs actual behavior clearly stated
□ User explicitly approved with "yes", "approved", or "looks good"

IF ANY CHECKBOX IS UNCHECKED, YOU MUST NOT PROCEED TO ANALYSIS PHASE
```

#### USER APPROVAL STEP

- **Present the completed bug report**
- Ask: **"Is this bug report accurate? If so, we can move on to the analysis."**
- **CRITICAL**: Wait for explicit approval before proceeding
- Accept only clear affirmative responses: "yes", "approved", "looks good", etc.
- If user provides feedback, make revisions and ask for approval again

## Key Differences from Spec Workflow

- **Faster**: No requirements/design phases
- **Targeted**: Focus on fixing existing functionality
- **Streamlined**: 4 phases instead of detailed workflow
- **Practical**: Direct from problem to solution

## Rules

- Only create ONE bug fix at a time
- Always use kebab-case for bug names
- Must analyze existing codebase during investigation
- Follow existing project patterns and conventions
- Do not proceed without user approval between phases

## 🚨 WORKFLOW VIOLATION RECOVERY

### Self-Check Questions (Ask Yourself Before ANY Action)
1. **Am I in the right phase?** Check current_phase status (report/analysis/fix/verification)
2. **Have I created the required document?** Each phase needs its document
3. **Do I have user approval?** Can't proceed without explicit "yes", "approved", "looks good"
4. **Am I trying to fix without analysis?** Must complete report → analysis → fix → verification

### Violation Recovery Protocol
**If you realize you've violated the workflow:**

1. **STOP IMMEDIATELY** - Do not continue with current action
2. **Inform user**: "I've detected a workflow violation. I started [what you did wrong]. Let me correct this."
3. **Return to correct phase**: Go back to the last properly completed phase
4. **Complete missing steps**: Create missing documents, get missing approvals
5. **Resume from correct point**: Continue following the proper sequence

### Common Violations and Fixes
| **Violation** | **Fix** |
|---------------|---------|
| Started fixing without bug report | Stop → Create report.md → Get approval → Continue |
| Skipped analysis phase | Stop → Create analysis.md → Get approval → Continue |
| Proceeded without user approval | Stop → Present work → Ask for approval → Wait |

## Error Handling

If issues arise during the workflow:
- **Bug unclear**: Ask targeted questions to clarify
- **Too complex**: Suggest breaking into smaller bugs or using spec workflow
- **Reproduction blocked**: Document blockers and suggest alternatives
- **Workflow violation detected**: Follow the recovery protocol above

## Example
```
/bug-create login-timeout "Users getting logged out too quickly"
```

## Next Steps
After bug report approval, proceed to `/bug-analyze` phase.
