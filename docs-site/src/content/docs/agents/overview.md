---
title: Agent System Overview
description: Understanding ThumbCode's multi-agent architecture.
---

ThumbCode uses a team of specialized AI agents that collaborate to build software. Each agent has a specific role and expertise.

## The Agent Team

### Architect Agent

The **Architect** is the strategic planner of the team.

**Responsibilities:**
- Analyze requirements and break down tasks
- Design system architecture and patterns
- Plan implementation strategies
- Identify potential risks and dependencies

**When it acts:** At the start of new features or when significant design decisions are needed.

### Implementer Agent

The **Implementer** writes the actual code.

**Responsibilities:**
- Write production-quality code
- Follow established patterns and conventions
- Handle edge cases and error conditions
- Optimize for performance and readability

**When it acts:** After the Architect provides a plan, implementing each component.

### Reviewer Agent

The **Reviewer** ensures code quality.

**Responsibilities:**
- Review code for bugs and issues
- Check adherence to coding standards
- Identify security vulnerabilities
- Suggest improvements and optimizations

**When it acts:** After the Implementer completes code, before commits.

### Tester Agent

The **Tester** verifies everything works.

**Responsibilities:**
- Write and run tests
- Verify functionality matches requirements
- Test edge cases and error handling
- Report any regressions

**When it acts:** After code changes are reviewed, before final approval.

## Agent Coordination

Agents work together in a coordinated workflow:

```
User Request
    │
    ▼
┌─────────────┐
│  Architect  │ ── Plans the approach
└─────────────┘
    │
    ▼
┌─────────────┐
│ Implementer │ ── Writes the code
└─────────────┘
    │
    ▼
┌─────────────┐
│  Reviewer   │ ── Validates quality
└─────────────┘
    │
    ▼
┌─────────────┐
│   Tester    │ ── Verifies behavior
└─────────────┘
    │
    ▼
User Approval → Git Commit
```

## Human-in-the-Loop

ThumbCode keeps you in control:

- **Approval gates** at key decision points
- **Transparent reasoning** - see why agents make decisions
- **Override capability** - reject or modify agent suggestions
- **Configurable automation** - choose what requires approval

## Configuration

Customize agent behavior in Settings → Agent Settings:

- **Auto-Review**: Let Reviewer automatically check changes
- **Auto-Test**: Let Tester run tests automatically
- **Parallel Execution**: Allow multiple agents to work simultaneously
- **Approval Requirements**: Configure what actions need your approval

See [Agent Settings](/thumbcode/guides/settings/) for details.
