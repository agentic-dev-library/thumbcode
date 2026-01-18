# ThumbCode Agent Coordination Protocol

> **Code with your thumbs.** A decentralized multi-agent mobile development platform.

## Agent Roles

### 🏗️ Architect
**Responsibility:** System design, technical decisions, interface contracts  
**Authority:** Define types, approve breaking changes, establish patterns  
**Artifacts:** `src/types/`, `docs/development/ARCHITECTURE.md`, `DECISIONS.md`

### 🔧 Implementer
**Responsibility:** Write production code following established contracts  
**Authority:** Implementation details within type boundaries  
**Artifacts:** `src/components/`, `src/services/`, `src/hooks/`, `src/stores/`

### 🔍 Reviewer
**Responsibility:** Code quality, pattern compliance, edge case analysis  
**Authority:** Request changes, block merges, escalate to Architect  
**Artifacts:** PR comments, `docs/development/PATTERNS.md` updates

### 🧪 Tester
**Responsibility:** Test coverage, regression prevention, E2E scenarios  
**Authority:** Define test requirements, flag untested code paths  
**Artifacts:** `__tests__/`, `e2e/`, coverage reports

---

## Workflow

### Task Assignment Format
```yaml
task:
  id: TC-XXX
  type: feature | bugfix | refactor | docs
  assignee: architect | implementer | reviewer | tester
  depends_on: [TC-YYY, TC-ZZZ]
  
context:
  feature: "Feature name"
  scope: "Affected modules/files"
  
requirements:
  - Requirement 1
  - Requirement 2
  
acceptance_criteria:
  - [ ] Criterion 1
  - [ ] Criterion 2
  
references:
  - docs/features/FEATURE.md
  - src/types/feature.ts
```

### Git Strategy

**Branch Naming:**
```
feature/TC-XXX-short-description
bugfix/TC-XXX-short-description
refactor/TC-XXX-short-description
```

**Commit Format:**
```
[TC-XXX] type: Short description

- Detail 1
- Detail 2

Refs: #issue-number
```

**Worktree Strategy:**
Each agent works in isolated worktrees to prevent conflicts:
```bash
git worktree add ../thumbcode-TC-XXX feature/TC-XXX
```

---

## Communication Protocol

### Status Updates
Agents report status in standardized format:
```yaml
status:
  task: TC-XXX
  agent: implementer
  state: in_progress | blocked | complete | needs_review
  progress: 75%
  blockers: []
  next_steps:
    - "Complete unit tests"
    - "Request review"
```

### Handoff Protocol
When passing work between agents:
1. Update task status to `needs_review` or `complete`
2. Create PR with comprehensive description
3. Tag next agent in PR
4. Update `docs/development/STATUS.md`

---

## File Ownership

| Path | Owner | Collaborators |
|------|-------|---------------|
| `src/types/**` | Architect | - |
| `src/components/**` | Implementer | Reviewer |
| `src/services/**` | Implementer | Architect |
| `src/stores/**` | Implementer | Architect |
| `docs/features/**` | Architect | All |
| `docs/development/**` | Architect | All |
| `__tests__/**` | Tester | Implementer |

---

## Decision Authority

### Architect Decides
- Type definitions and interfaces
- State management patterns
- API contracts
- Breaking changes
- New dependencies

### Implementer Decides
- Implementation details within type constraints
- Internal helper functions
- Performance optimizations
- Code organization within modules

### Reviewer Decides
- Code quality gates
- Pattern compliance
- Documentation requirements

### Tester Decides
- Test coverage requirements
- E2E test scenarios
- Performance benchmarks

---

## Conflict Resolution

1. **Type Conflicts:** Architect has final say
2. **Implementation Conflicts:** Reviewer mediates
3. **Test Conflicts:** Tester defines requirements, Implementer adapts
4. **Deadlocks:** Escalate to human maintainer via GitHub issue
