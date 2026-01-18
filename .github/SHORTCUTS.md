# ThumbCode AI Shortcuts 🚀

> **Quick-trigger AI automation via comment mentions**

ThumbCode uses powerful AI shortcuts that you can trigger by mentioning them in comments on issues or pull requests. These shortcuts engage Claude AI and CodeRabbit AI to perform complex tasks automatically.

---

## Available Shortcuts

### `@rebase` - Auto-Rebase PR 🔀

**Where:** Pull request comments
**What:** Automatically rebases your PR onto the latest base branch with conflict resolution

**Usage:**
```
@rebase
```

**What Happens:**
1. Fetches latest from base branch
2. Attempts automatic rebase
3. If conflicts: **Claude resolves them automatically**
4. Verifies all changes (lint, typecheck, test, build)
5. Force-pushes the rebased branch
6. Comments with summary

**When to Use:**
- Your PR is behind the base branch
- You need to incorporate latest changes
- You have merge conflicts and want AI to resolve them

**Example:**
```markdown
This PR needs to be updated with latest main.

@rebase
```

---

### `@triage` - Multi-AI Triage 🔍

**Where:** Issue or pull request comments
**What:** Engages both CodeRabbit AI and Claude for collaborative triage and analysis

**Usage:**
```
@triage
```

**What Happens:**

**On Issues:**
1. CodeRabbit analyzes: category, priority, complexity, requirements
2. Claude analyzes: ThumbCode alignment, roadmap fit, implementation approach
3. Both AIs add labels automatically
4. Comprehensive triage report posted

**On Pull Requests:**
1. CodeRabbit performs code review
2. Claude performs ThumbCode-specific review (CLAUDE.md compliance)
3. Both provide actionable feedback
4. Collaborative analysis posted

**When to Use:**
- New issue needs categorization
- Issue needs priority assessment
- PR needs comprehensive review from multiple perspectives

**Example:**
```markdown
Not sure how to categorize this issue or what priority it should be.

@triage
```

---

### `@review` - Collaborative AI Code Review 🔎

**Where:** Pull request comments
**What:** Deep collaborative review by both CodeRabbit AI and Claude working together

**Usage:**
```
@review
```

**What Happens:**
1. **CodeRabbit** performs comprehensive code review:
   - Code quality, security, performance
   - TypeScript types, testing, documentation
   - Line-by-line feedback with code examples

2. **Claude** performs ThumbCode-specific deep review:
   - CLAUDE.md playbook compliance (design tokens, organic styling, Warm Technical palette)
   - Architecture alignment (ARCHITECTURE.md)
   - Roadmap fit (PROJECT-STATUS.md)
   - Mobile-first considerations
   - React Native/Expo best practices

3. Both post detailed reviews with:
   - Critical issues 🚨
   - High priority warnings ⚠️
   - Suggestions 💡
   - Code examples for fixes

**When to Use:**
- PR is ready for thorough review
- Want multiple AI perspectives
- Need both general and ThumbCode-specific feedback
- Before merging important changes

**Example:**
```markdown
Ready for comprehensive review before merging.

@review
```

---

### `@backlog` - Collaborative Backlog Triage 📋

**Where:** Any issue comment OR manual workflow trigger
**What:** Comprehensive backlog analysis and strategic planning by CodeRabbit and Claude

**Usage:**
```
@backlog
```

**What Happens:**
1. Creates a triage coordination issue
2. **CodeRabbit** analyzes:
   - Priority ranking
   - Categorization (type, area, complexity)
   - Duplicate detection
   - Quick wins identification

3. **Claude** performs strategic analysis:
   - Roadmap alignment (PROJECT-STATUS.md)
   - AI-implementation feasibility
   - Quality impact assessment
   - Strategic bucketing

4. Both AIs automatically:
   - Apply labels to all issues
   - Assign milestones
   - Close duplicates/won't-fix issues
   - Mark ready issues for auto-implementation

5. Comprehensive backlog report posted with:
   - 🚀 High priority issues
   - ✅ Ready for AI auto-implementation
   - 📅 Backlog (next phase)
   - 🔒 Blocked issues
   - ❌ Recommended to close

**When to Use:**
- Backlog is getting cluttered
- Need to prioritize work
- Want to identify what can be auto-implemented
- Planning next sprint/phase

**Example:**
```markdown
Our backlog needs organization and prioritization.

@backlog
```

---

### `@ready` - Readiness Check ✅

**Where:** Issue or pull request comments
**What:** Checks if issue is resolved OR if PR comments are all addressed

**Usage:**
```
@ready
```

**What Happens:**

**On Issues:**
1. Fetches issue details and requirements
2. **Searches entire codebase** for implementation
3. Checks recent commits and PRs
4. Verifies with automated tests
5. Reports: RESOLVED / PARTIALLY RESOLVED / NOT RESOLVED / DUPLICATE
6. **Auto-closes if fully resolved**

**On Pull Requests:**
1. Fetches all comments, reviews, and threads
2. **Categorizes each comment:**
   - ✅ Addressed (code changed, question answered)
   - ⚠️ Acknowledged but deferred (tracked in follow-up)
   - ❌ Unaddressed (needs action)
   - 🤖 AI hallucination (invalid feedback)

3. **Auto-resolves AI hallucination threads** (you have permission!)
4. **Creates follow-up issues** for deferred items
5. Reports PR readiness: READY TO MERGE / NEEDS ATTENTION / NOT READY

**When to Use Issues:**
- Issue was opened a while ago, might be resolved now
- Want to verify if work is complete
- Cleaning up old issues

**When to Use PRs:**
- PR has lots of comments, want summary
- Want to verify all feedback addressed
- Ready to merge but want final check
- Need to resolve invalid AI feedback threads

**Example Issue:**
```markdown
This issue was opened 2 weeks ago. Is it still relevant?

@ready
```

**Example PR:**
```markdown
Lots of comments here. Are they all addressed?

@ready
```

---

## Shortcut Combinations

You can combine shortcuts for powerful workflows:

### Complete PR Workflow
```markdown
1. @rebase       # Update with latest
2. @review       # Get comprehensive review
3. (address feedback)
4. @ready        # Verify all comments addressed
```

### Issue Lifecycle
```markdown
1. @triage       # Categorize and prioritize
2. (AI auto-implements if ready)
3. @ready        # Verify resolution in codebase
```

### Backlog Management
```markdown
1. @backlog      # Analyze all issues
2. (Issues get labeled)
3. (Ready issues auto-implemented)
4. @ready        # Verify implementations
```

---

## Permissions & Capabilities

All shortcuts have comprehensive permissions:

| Shortcut | Can Do |
|----------|--------|
| `@rebase` | Push code, resolve conflicts, force-push |
| `@triage` | Add labels, comment, engage multiple AIs |
| `@review` | Add reviews, comment, analyze code deeply |
| `@backlog` | Label issues, assign milestones, close issues, create issues |
| `@ready` | Close issues, resolve PR threads, create follow-up issues |

**All shortcuts:**
- Work for **any user** (no permission restrictions)
- Can **write to the repository** (commit, push, label, close)
- Can **engage multiple AIs** (CodeRabbit + Claude collaboration)
- Have **full context** (read all files, commits, comments)

---

## Response Times

| Shortcut | Typical Duration |
|----------|-----------------|
| `@rebase` | 5-15 minutes (longer with complex conflicts) |
| `@triage` | 10-20 minutes |
| `@review` | 20-30 minutes (comprehensive review) |
| `@backlog` | 20-30 minutes (entire backlog) |
| `@ready` | 10-20 minutes |

You'll see reactions on your comment to indicate progress:
- 👀 - Processing started
- 🚀 - Working on it
- 👍 - Success
- 🎉 - All done

---

## Tips & Tricks

### Get Faster Results
- Be specific in your issue/PR description
- Provide context and links to related work
- Mention specific files or areas of concern

### Multiple Shortcuts
You can trigger multiple shortcuts in succession:
```markdown
@triage
@ready
```

Both will run, but Claude will see both are requested.

### Shortcuts Work Anywhere
- Issue comments
- PR comments
- Review comments
- PR descriptions (some shortcuts)

### Best Practices
1. **Use `@triage` first** on new issues/PRs
2. **Use `@review` when ready** for deep analysis
3. **Use `@ready` before closing** to verify
4. **Use `@backlog` monthly** to maintain clean backlog
5. **Use `@rebase` when behind** instead of manual merging

---

## Examples from Real Use

### Example 1: New Feature PR
```markdown
User: I've implemented the new authentication flow. @review

[20 minutes later]

CodeRabbit: 🤖 Found 3 security issues...
Claude: 🤖 ThumbCode review: Missing design tokens in LoginButton.tsx...

User: (fixes issues)

User: @ready

Claude: ✅ All 15 comments addressed. PR is READY TO MERGE.
```

### Example 2: Old Issue Check
```markdown
User: This bug was reported in v0.9. Is it still relevant? @ready

Claude: ✅ Readiness Check Complete
Resolution Status: RESOLVED

Evidence:
- Implementation Found: Yes
- Files Modified: src/auth/login.tsx (commit abc123)
- Tests Added: Yes

Recommendation: ✅ READY TO CLOSE
Auto-closing as resolved.

[Issue automatically closed]
```

### Example 3: Messy Backlog
```markdown
User: Our backlog is a mess. @backlog

[30 minutes later]

Claude: 📋 Strategic Backlog Analysis
- Labeled 47 issues
- Marked 12 as ready for AI auto-implementation
- Closed 8 duplicates
- Created 3 milestones

[Auto-implementation workflow triggers for 12 ready issues]
[12 PRs created automatically over next few hours]
```

---

## Troubleshooting

### Shortcut Didn't Trigger
- Make sure you used the exact syntax: `@rebase` (not "@ rebase" or "@rebase!")
- Check you commented on the right place (issue vs PR)
- Wait a few minutes - workflows can take time to start

### Workflow Failed
- Check the Actions tab for error logs
- Ensure secrets are configured (ANTHROPIC_API_KEY)
- Some shortcuts require specific permissions

### Unexpected Results
- Claude does its best but may need clarification
- Add more context in your comment
- Review the posted analysis and provide feedback

---

## Technical Details

Each shortcut is powered by:
- **GitHub Actions workflows** (`.github/workflows/shortcut-*.yml`)
- **Claude Code Action** (Anthropic's official GitHub Action)
- **CodeRabbit AI** (via mention triggers)
- **GitHub GraphQL API** (for advanced operations)

Workflows use:
- `allow_any_user: true` - Anyone can trigger
- Comprehensive permissions - Can write, label, close, resolve
- Tool allowlist - `edit_file`, `write_file`, `read_file`, `bash`, etc.
- Bash allowlist - `git`, `pnpm`, `npm`, `gh`, `biome`, `tsc`, `jest`, `expo`

---

## Contributing

Want to add a new shortcut?

1. Create workflow: `.github/workflows/shortcut-{name}.yml`
2. Add detector job (checks for `@{name}` in comments)
3. Add action job (what Claude should do)
4. Update this document
5. Test on a PR

**Shortcut Ideas:**
- `@security` - Security audit
- `@perf` - Performance analysis
- `@deps` - Dependency updates
- `@docs` - Documentation generation
- `@test` - Test coverage analysis

---

*Built with ❤️ by ThumbCode fully-automated multi-agent team.*
