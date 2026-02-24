# ThumbCode Product Context

> Last Updated: February 2026

## Why ThumbCode Exists

The AI coding assistant market is projected to grow from $4.91B (2024) to $30.1B (2032) at 27.1% CAGR. Yet every major player — GitHub Copilot, Cursor, Windsurf, Claude Code — is desktop-first. ThumbCode occupies the uncontested mobile-first position.

The key insight: AI agents can bridge the gap between mobile constraints (small screen, thumb input) and the complexity of software development. Instead of adapting desktop workflows to mobile, ThumbCode reimagines development as a conversation with intelligent agents.

## BYOK Model

**Bring Your Own Keys** is the foundational architectural principle:

### How It Works

1. User provides their own API keys during onboarding (GitHub, Anthropic, OpenAI)
2. Keys are validated via live API calls, then stored in platform-secure storage
3. All AI and git operations happen client-side using the user's credentials
4. No ThumbCode backend server is involved — zero per-user infrastructure cost

### Why BYOK

| Benefit | Explanation |
|---------|-------------|
| **Privacy** | Credentials never leave the device |
| **Cost** | Users pay their AI provider directly; ThumbCode has zero marginal cost per user |
| **Trust** | No intermediary holding sensitive tokens |
| **Transparency** | Users see exactly what API calls are made |
| **Independence** | No vendor lock-in; works with any supported AI provider |

### Trade-offs

- Cannot offer "free trial" of AI features (users must have their own keys)
- Must clearly document key setup in onboarding
- User responsible for their own API costs

## Mobile-First Philosophy

ThumbCode is not a desktop app squeezed onto a phone. Every design decision starts from mobile constraints:

### Interaction Model

**Conversation over commands.** The chat interface is the primary way users interact with agents. Natural language replaces keyboard shortcuts and menu hierarchies.

**Orchestration over execution.** Users direct strategy ("Add authentication to this app"), agents handle tactics (designing the auth flow, writing code, testing). Human judgment guides; AI implements.

**Review and approve.** Users review agent-generated diffs, approve commits, and manage PRs — all through touch-friendly interfaces.

### Design Philosophy: "Warm Technical"

ThumbCode's brand identity deliberately counters the cold, blue-toned aesthetic of developer tools:

- **Organic shapes** — Paint daube aesthetics with asymmetric border-radius, not perfect circles
- **Warm palette** — Coral (#FF7059), Teal (#0D9488), Gold (#F5D563) on Charcoal (#151820)
- **Human typography** — Fraunces (display), Cabin (body), JetBrains Mono (code)
- **No gradients** — Textured, imperfect shapes that connect to the thumbprint/finger-painting concept

This is not cosmetic — it's strategic differentiation in a market where every tool looks the same.

## User Experience Goals

### Onboarding (< 5 minutes)

1. **Welcome** — Value proposition, "Code with your thumbs"
2. **GitHub Auth** — Device Flow (user authenticates in their own browser, returns to app)
3. **API Keys** — Enter Anthropic and/or OpenAI keys with live validation
4. **First Project** — Clone an existing repo or create new
5. **Complete** — Drop into the agent workspace

### Core Workflow Loop

```
1. User describes intent → "Add a login page"
2. Architect agent proposes approach → designs types, interfaces
3. User reviews and approves plan
4. Implementer agent writes code → commits to feature branch
5. Reviewer agent audits quality → suggests improvements
6. Tester agent writes tests → validates behavior
7. User reviews final diff → approves merge/PR
```

### Key UX Principles

| Principle | Implementation |
|-----------|---------------|
| **Thumb-friendly** | Large touch targets, bottom-sheet navigation, swipe gestures |
| **Progressive disclosure** | Show summary first, expand for details |
| **Real-time feedback** | Streaming AI responses, progress indicators for git ops |
| **Transparent AI** | Show agent reasoning, tool calls, and generated code in real-time |
| **Error recovery** | Every error state has a clear recovery path (retry, edit, rollback) |

## Multi-Agent System

### Agent Coordination

Agents work in isolation via git worktrees, preventing conflicts:

```
main branch
  ├── architect-worktree/    (designs, types, docs)
  ├── implementer-worktree/  (feature code)
  ├── reviewer-worktree/     (read-only analysis)
  └── tester-worktree/       (test code)
```

### Task Flow

1. User creates a task via chat
2. Orchestrator assigns to Architect
3. Architect produces a plan → user approves
4. Orchestrator assigns to Implementer
5. Implementer writes code → creates PR
6. Reviewer analyzes → provides feedback
7. Tester writes tests → validates
8. User gives final approval → merge

### Current State (February 2026)

The multi-agent orchestration is **stubbed/mock**. The UI shell, chat interface, and agent management screens are built, but AI responses are simulated. Real Anthropic/OpenAI integration is the top priority for v1.0.

## Content Strategy

### Documentation Structure

```
docs/
├── agents/          # Agent coordination protocol
├── api/             # API documentation (service interfaces)
├── brand/           # Brand guidelines, design system governance
├── development/     # Architecture, setup, deployment, environment
├── features/        # Feature specifications (onboarding, etc.)
├── integrations/    # GitHub, Anthropic/OpenAI, MCP
├── memory-bank/     # Institutional memory (this directory)
├── research/        # Market research, usability testing
└── vision/          # Product vision and roadmap
```

### For AI Agents Reading This

Before making changes, read in this order:

1. `CLAUDE.md` — Complete agent playbook (root)
2. `AGENTS.md` — Coordination protocol
3. `docs/architecture/decisions.md` — Technical decisions registry
4. `docs/memory-bank/techContext.md` — Current tech stack
5. `docs/architecture/architecture.md` — System architecture and data flow
