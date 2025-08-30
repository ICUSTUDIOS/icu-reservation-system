# ICU Reservation System - Output Style Guide

## Response Format

### Code Changes
When making code changes, provide:
1. Brief explanation of what's being changed and why
2. The actual code with proper syntax highlighting
3. Any potential impacts or dependencies

### Error Handling
When encountering errors:
```
🔴 Error: [Brief description]
   Location: [file:line]
   Cause: [Root cause]
   Solution: [How to fix]
```

### Success Messages
```
✅ [Action completed]
   - [Detail 1]
   - [Detail 2]
```

### Warnings
```
⚠️ Warning: [Issue that needs attention]
   Impact: [What could go wrong]
   Recommendation: [What to do]
```

## Code Formatting

### TypeScript/React
- Use proper TypeScript types
- Include necessary imports
- Follow project's existing patterns
- Add 'use client' directive when needed

### SQL
- Format for readability
- Include comments for complex logic
- Use proper indentation
- Highlight important constraints

## Communication Style

### Be Concise
- Get to the point quickly
- Avoid unnecessary explanations
- Focus on what matters

### Be Specific
- Reference exact file paths and line numbers
- Provide concrete examples
- Use actual values from the project

### Be Helpful
- Anticipate follow-up questions
- Provide relevant context
- Suggest next steps

## Task Execution

### Planning
```
📋 Task: [What needs to be done]
Steps:
1. [First step]
2. [Second step]
3. [Third step]
```

### Progress Updates
```
🔄 Working on: [Current task]
Progress: [━━━━━━────] 60%
```

### Completion
```
✅ Completed: [Task name]
Results:
- [Outcome 1]
- [Outcome 2]
Next: [Suggested next action]
```

## Database Operations

### Query Results
```sql
-- Query: [Description]
SELECT * FROM table WHERE condition;

Results (3 rows):
┌────┬─────────┬──────────┐
│ id │ name    │ points   │
├────┼─────────┼──────────┤
│ 1  │ User A  │ 40       │
│ 2  │ User B  │ 35       │
│ 3  │ User C  │ 28       │
└────┴─────────┴──────────┘
```

### Schema Changes
```sql
-- Migration: [Description]
-- Impact: [Tables/functions affected]
-- Rollback: [How to undo if needed]

ALTER TABLE ...
```

## File Operations

### Creating Files
```
📄 Creating: path/to/file.ext
Purpose: [Why this file is needed]
```

### Modifying Files
```
✏️ Modifying: path/to/file.ext
Changes: [What's being changed]
Lines affected: [Line numbers]
```

### Deleting Files
```
🗑️ Deleting: path/to/file.ext
Reason: [Why it's being removed]
Backup: [If backed up, where]
```

## Testing Output

### Test Results
```
🧪 Test Results:
✅ Component rendering      [PASS]
✅ Points calculation       [PASS]
❌ Weekend slot validation  [FAIL]
   Error: Expected 12, got 6

Summary: 2/3 tests passing
```

### Performance Metrics
```
⚡ Performance:
- Build time: 23.4s
- Bundle size: 487KB
- First paint: 1.2s
- Time to interactive: 2.1s
```

## Debugging Output

### Stack Traces
```
🐛 Error Stack:
   at BookingForm.submit (booking-form.tsx:45)
   at handleClick (button.tsx:23)
   
Context: User clicked submit with invalid data
Fix: Add validation before submission
```

### Console Logs
```
📊 Debug Info:
- User ID: abc-123
- Points: 35/40
- Weekend slots: 3/12
- Current booking: { start: "2024-01-15 14:00", end: "2024-01-15 16:00" }
```

## Git Operations

### Commit Summary
```
📝 Commit: feat: add weekend slot validation
Files changed: 3
Insertions: 45 lines
Deletions: 12 lines
```

### Branch Status
```
🌿 Branch: feature/booking-improvements
Status: 2 commits ahead of main
Changes: 5 files modified
```

## Recommendations

### For Issues
```
💡 Recommendation:
Issue: [Problem description]
Impact: [Severity/scope]
Solution: [Recommended fix]
Alternative: [Other option if applicable]
```

### For Improvements
```
🚀 Optimization Opportunity:
Current: [Current implementation]
Suggested: [Better approach]
Benefit: [Expected improvement]
```

## Special Contexts

### Security Issues
```
🔐 SECURITY ALERT:
Severity: [HIGH/MEDIUM/LOW]
Issue: [What's wrong]
Risk: [Potential impact]
Fix Required: [What to do immediately]
```

### Breaking Changes
```
⚠️ BREAKING CHANGE:
Component: [What's affected]
Migration: [How to update]
Deadline: [When it needs to be done]
```

### Dependencies
```
📦 Dependency Update:
Package: [package-name]
Current: 1.0.0 → New: 2.0.0
Breaking: [Yes/No]
Action: [Update/Hold/Review]
```

## Response Examples

### Good Response
```
✅ Updated booking validation

Modified `components/dashboard/time-slot-picker.tsx:156`
- Added weekend slot limit check
- Shows error when limit exceeded
- Prevents booking submission

Note: This enforces the 12 weekend slots/week limit.
```

### Avoid This
```
I have made changes to the file to fix the issue you mentioned. The component should now work better. Please test it and let me know if there are any problems.
```

---

Remember: Be direct, specific, and helpful. Focus on what matters to the user's current task.