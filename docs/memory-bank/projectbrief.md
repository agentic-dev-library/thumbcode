# ThumbCode Project Brief

> Last Updated: February 2026

## Mission

**ThumbCode** enables anyone to ship mobile apps by directing AI agents from their phone. The tagline — "Code with your thumbs" — captures the core promise: a mobile-first, decentralized multi-agent development platform that eliminates the need for a laptop.

## Problem Statement

Software development remains tethered to the desktop. Despite mobile devices being our primary computers, creating software is still locked behind keyboards and multi-monitor setups. AI coding assistants (Cursor, Claude Code, Windsurf) have transformed development — but only accelerated the desktop paradigm. No major competitor is mobile-first.

## Core Requirements

### 1. Multi-Agent Orchestration

Users direct a team of specialized AI agents from a chat interface:

| Role | Purpose | Key Permission |
|------|---------|----------------|
| **Architect** | Plans, designs APIs | Write types/docs only |
| **Implementer** | Writes feature code | Write src/, commit |
| **Reviewer** | Evaluates code quality | Comment only |
| **Tester** | Writes and runs tests | Write tests only |

Agents collaborate via git worktrees for full isolation. Each agent operates in its own directory sharing the same `.git` database.

### 2. BYOK (Bring Your Own Keys)

Zero server dependency. Users provide their own API keys:

- **GitHub** — Device Flow authentication (no embedded browser)
- **Anthropic** — Claude API (primary AI provider)
- **OpenAI** — GPT API (secondary AI provider)

All credentials stored securely on-device. No ThumbCode servers in the loop.

### 3. Mobile-First Experience

Designed for thumbs, not adapted from mouse:

- Conversational interface as the primary interaction model
- Touch and gesture as first-class inputs
- Small screen as a superpower, not a limitation
- Responsive web app wrapped in native shell via Capacitor

### 4. Full Git Workflow

Complete git operations from mobile:

- Clone, branch, stage, commit, push
- Diff review with syntax highlighting
- Merge conflict resolution with AI assistance
- PR review workflow

## Scope

### v1.0 Release Goals

- Replace mock AI responses with real Anthropic/OpenAI streaming
- Implement multi-agent orchestration (Architect -> Implementer -> Reviewer)
- End-to-end git commit workflow via isomorphic-git
- Credential validation on entry
- Project creation via GitHub API
- Achieve 60% test statement coverage

### Out of Scope (v1.0)

- Offline mode / offline queue
- Push notifications
- Custom agent definitions
- Team workspaces / shared configurations
- MCP server ecosystem
- Self-hosted option

## Target Users

1. **Mobile-Native Developers** — Primary. Developers who prefer their phone for as many tasks as possible.
2. **Busy Technical Leaders** — Secondary. Engineering managers who want to review code and unblock teams without a laptop.
3. **Aspiring Developers** — Tertiary. People learning to code who find desktop IDEs overwhelming.

## Competitive Advantage

| Differentiator | ThumbCode | Competition |
|----------------|-----------|-------------|
| Platform | Mobile-first | Desktop/web-first |
| Architecture | Decentralized BYOK | Cloud-hosted |
| Privacy | User owns keys | Vendor manages keys |
| Cost Model | $0 infrastructure | Per-seat subscriptions |
| Agent Model | Multi-agent orchestration | Single assistant |

## Success Metrics

| Category | Metric | Target |
|----------|--------|--------|
| Activation | Complete onboarding | 70% |
| Activation | First commit from mobile | 50% |
| Engagement | Weekly active users | 30% of registered |
| Engagement | Commits per user per week | 5+ |
| Satisfaction | App Store rating | 4.5+ |
| Satisfaction | NPS | 50+ |

## Business Model

- **Free tier**: BYOK only, 1 project, 2 agents max
- **Pro** ($19/mo): Unlimited projects, 10 agents
- **Team** ($49/mo): Shared workspaces, team management

Distribution cost: Apple Developer ($99/yr) + Google Play ($25 one-time) = $124 year one.
