# AGENTS.md — Multi-Agent Coordination Protocol

> This document defines how multiple AI agents collaborate on the ThumbCode codebase. Follow these rules to prevent conflicts and maintain quality.

---

## Agent Roles

ThumbCode uses a specialized agent team. Each role has defined permissions and responsibilities.

### Architect

**Purpose**: Plans features, designs APIs, creates file structures

**Permissions**:
- ✅ Read all files
- ✅ Write to `src/types/`, `docs/`, `ARCHITECTURE.md`
- ✅ Create new directories
- ❌ Cannot commit directly
- ❌ Cannot modify existing feature code

**System Prompt Snippet**:
```
You are a software architect. Before writing any code:
1. Analyze the full requirement
2. Break it into discrete, parallelizable tasks
3. Define interfaces and types FIRST
4. Specify file locations for each component
5. Document API contracts

You create the blueprint. Others implement.
```

**Output Format**:
```markdown
## Feature: [Name]

### Overview
[1-2 sentences describing the feature]

### Files to Create
- `src/components/feature-name/index.tsx` — Main component
- `src/components/feature-name/types.ts` — TypeScript interfaces
- `src/hooks/use-feature.ts` — Custom hook

### Interfaces
\`\`\`typescript
interface FeatureProps {
  // ...
}
\`\`\`

### Implementation Notes
[Guidance for implementing agents]

### Dependencies
[List any new packages needed]
```

---

### Implementer

**Purpose**: Writes feature code based on Architect plans

**Permissions**:
- ✅ Read all files
- ✅ Write to `src/components/`, `src/hooks/`, `src/lib/`
- ✅ Commit to feature branches
- ❌ Cannot push to main
- ❌ Cannot modify types without Architect approval

**System Prompt Snippet**:
```
You implement features following the Architect's blueprint.

Rules:
1. ALWAYS check CLAUDE.md before coding
2. ALWAYS use design tokens — never hardcode colors/fonts
3. ALWAYS follow the file structure specified
4. Match existing code patterns in the repository
5. Write TypeScript with full type safety
6. Include loading, error, and empty states
7. Test your work mentally before committing
```

**Workflow**:
1. Receive task assignment from Architect
2. Read relevant sections of CLAUDE.md
3. Check for existing similar components
4. Implement following the spec exactly
5. Self-review against Component Checklist
6. Commit with conventional commit message

---

### Reviewer

**Purpose**: Reviews code, suggests improvements, approves merges

**Permissions**:
- ✅ Read all files
- ✅ Comment on any file
- ✅ Approve or request changes
- ❌ Cannot write code directly
- ❌ Cannot merge without human approval

**System Prompt Snippet**:
```
You review code for quality, security, and brand consistency.

Check for:
1. Design token compliance — no hardcoded values
2. Organic styling — no gradients, use daubes
3. TypeScript safety — proper types, no `any`
4. Accessibility — WCAG AA contrast, labels
5. Performance — memoization, lazy loading
6. Security — no exposed credentials, XSS prevention
7. Consistency — matches existing patterns
```

**Review Checklist**:
```markdown
## Review: [PR Title]

### Brand Compliance
- [ ] Uses Coral/Teal/Gold palette correctly
- [ ] Organic border-radius applied
- [ ] No gradients
- [ ] Typography matches spec (Fraunces/Cabin/JetBrains)

### Code Quality
- [ ] Full TypeScript coverage
- [ ] No hardcoded values
- [ ] Follows naming conventions
- [ ] Proper error handling

### Accessibility
- [ ] Color contrast ≥ 4.5:1
- [ ] Interactive elements have labels
- [ ] Focus states visible

### Verdict
- [ ] ✅ APPROVED
- [ ] 🔄 REQUEST CHANGES
- [ ] ❌ REJECT
```

---

### Tester

**Purpose**: Writes and runs tests, reports coverage

**Permissions**:
- ✅ Read all files
- ✅ Write to `__tests__/`, `*.test.ts`, `*.spec.ts`
- ✅ Commit test files
- ❌ Cannot modify production code

**System Prompt Snippet**:
```
You write comprehensive tests for ThumbCode.

Test categories:
1. Unit tests for utilities and hooks
2. Component tests for UI elements
3. Integration tests for workflows
4. Visual regression tests for brand compliance

Always test:
- Happy path
- Error states
- Edge cases
- Accessibility
```

---

## Workspace Isolation

Multiple agents work simultaneously using **git worktrees** — NOT real-time collaboration.

### Why Worktrees, Not CRDTs

| Approach | Pros | Cons | Verdict |
|----------|------|------|---------|
| CRDTs (Yjs) | Real-time sync | Context fragmentation, merge complexity | ❌ Bad for agents |
| Git worktrees | Full isolation, standard git | Requires branch management | ✅ Best for agents |
| File locking | Simple | Blocks parallelism | ⚠️ Only for high-conflict files |

### Worktree Setup

```bash
# Create isolated workspace for each agent
git worktree add ../thumbcode-architect main
git worktree add ../thumbcode-impl-1 feature/auth
git worktree add ../thumbcode-impl-2 feature/dashboard
git worktree add ../thumbcode-tester develop

# Each agent operates in their directory
# Changes stay isolated until merged
```

### Branch Strategy

```
main                    # Production-ready, protected
├── develop             # Integration branch
│   ├── feature/auth    # Agent 1 workspace
│   ├── feature/dashboard # Agent 2 workspace
│   └── feature/agents  # Agent 3 workspace
└── hotfix/*            # Emergency fixes
```

### Merge Protocol

1. **Implementer** completes feature, creates PR to `develop`
2. **Reviewer** evaluates against checklist
3. **Human** approves or requests changes
4. **Tester** runs test suite on `develop`
5. **Human** merges `develop` → `main` for release

---

## Task Assignment

### Task Format

```yaml
task_id: THUMB-042
title: "Implement Agent Status Card"
assigned_to: implementer-1
priority: high
depends_on: [THUMB-041]
branch: feature/agent-cards

spec:
  files:
    - path: src/components/agents/agent-card.tsx
      type: component
    - path: src/components/agents/agent-card.test.tsx
      type: test
  
  interface: |
    interface AgentCardProps {
      agent: Agent;
      onSelect: (id: string) => void;
      isActive?: boolean;
    }
  
  requirements:
    - Display agent name, role, and status
    - Use organic card styling
    - Show activity indicator when active
    - Animate status changes
  
  acceptance:
    - [ ] Matches design spec
    - [ ] Passes type check
    - [ ] Has test coverage
    - [ ] Reviewed and approved
```

### Priority Levels

| Level | Response Time | Examples |
|-------|--------------|----------|
| **critical** | Immediate | Security fixes, production bugs |
| **high** | Same session | Core features, blocking issues |
| **medium** | Next session | Improvements, non-blocking bugs |
| **low** | Backlog | Nice-to-haves, experiments |

---

## Conflict Resolution

### File-Level Conflicts

When two agents need the same file:

1. **Check dependency** — Can one wait for the other?
2. **Split the file** — Can it be decomposed?
3. **Lock pattern** — One agent locks, completes, unlocks
4. **Escalate** — Ask human to arbitrate

### Design Conflicts

When agents disagree on approach:

1. **Check CLAUDE.md** — Does it specify?
2. **Check memory-bank/DECISIONS.md** — Was this decided before?
3. **Architect decides** — Technical choices
4. **Human decides** — Brand/UX choices

### Escalation Path

```
Implementer conflict → Architect
Architect conflict → Human
Any security concern → Human (immediate)
Brand/style question → Human
```

---

## Communication Protocol

Agents don't chat — they communicate through structured artifacts.

### Task Handoff

```markdown
## Handoff: THUMB-042

**From**: architect
**To**: implementer-1
**Status**: Ready for implementation

### Context
[Why this feature exists, how it fits]

### Spec
[Link to full specification]

### Notes
- Watch out for [specific concern]
- Reuse [existing component] as base
- Ask human about [uncertain requirement]
```

### Review Request

```markdown
## Review Request: THUMB-042

**From**: implementer-1
**To**: reviewer
**Branch**: feature/agent-cards
**Files Changed**: 3

### Summary
Implemented AgentCard component with organic styling.

### Self-Review
- [x] Checked against CLAUDE.md
- [x] Used design tokens
- [x] Added loading state
- [x] TypeScript strict mode passes

### Questions
- Should status indicator pulse or glow?
```

### Blocking Issue

```markdown
## BLOCKED: THUMB-042

**Agent**: implementer-1
**Blocked By**: Missing type definitions
**Waiting On**: architect

### Details
Cannot implement AgentCard — the `Agent` type is not defined.

### Requested Action
Please define `Agent` interface in `src/types/agents.ts`
```

---

## Quality Gates

No code reaches `main` without passing:

### Gate 1: Self-Review
- [ ] Agent checks own work against CLAUDE.md
- [ ] Component Checklist completed

### Gate 2: Peer Review
- [ ] Reviewer agent evaluates
- [ ] All checklist items pass

### Gate 3: Automated Checks
- [ ] TypeScript compiles without errors
- [ ] ESLint passes
- [ ] Tests pass
- [ ] Build succeeds

### Gate 4: Human Approval
- [ ] Human reviews PR
- [ ] Approves or requests changes
- [ ] Merges when ready

---

## Emergency Procedures

### Production Bug

1. **Tester** identifies and documents
2. **Human** creates hotfix branch from `main`
3. **Implementer** fixes with minimal change
4. **Reviewer** fast-track review
5. **Human** merges directly to `main`
6. **Architect** plans proper fix for `develop`

### Security Issue

1. **STOP** all work
2. **Human** notified immediately
3. **No commits** until assessed
4. **Fix in private** if needed
5. **Post-mortem** documented

---

## Metrics

Track agent effectiveness:

| Metric | Target | Why |
|--------|--------|-----|
| First-attempt success | >80% | Agents should need minimal revision |
| Review rejection rate | <10% | High quality self-review |
| Merge conflicts | <5% | Good workspace isolation |
| Brand compliance | 100% | Non-negotiable |

---

**Remember: Agents work IN PARALLEL but merge IN SEQUENCE. Isolation enables speed. Protocol enables quality.**
