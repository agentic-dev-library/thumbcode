# ThumbCode Roadmap

> Last Updated: February 2026
> Derived from tasks/prd.json and VISION.md

## v1.0 Release Goals

The v1.0 release transforms ThumbCode from a polished shell with mock AI into a working multi-agent mobile development platform.

### Core Deliverables

1. **Real AI integration** -- Replace mock responses with Anthropic/OpenAI streaming via @thumbcode/agent-intelligence
2. **Multi-agent orchestration** -- Architect -> Implementer -> Reviewer -> Tester pipeline
3. **End-to-end git workflow** -- AI agents commit code via isomorphic-git with user approval
4. **Credential validation** -- Live API call validation on key entry
5. **Test coverage** -- 80%+ statement coverage

### Out of Scope (v1.0)

- Offline mode / offline queue
- Push notifications
- Custom agent definitions
- Team workspaces / shared configurations
- MCP server ecosystem
- Self-hosted option

## v1.0 Story Map

### Wave 1: Package Modernization (COMPLETE)

| Story | Title | Status |
|-------|-------|--------|
| US-001 | Modernize agent-intelligence for web | Done |
| US-007 | Establish packages/ui/ as canonical library | Done |
| US-014 | Create memory bank foundation files | Done |
| US-017 | Update config files, remove Expo vestiges | Done |

### Wave 2: Refactoring + Docs (IN PROGRESS)

| Story | Title | Status |
|-------|-------|--------|
| US-002 | Replace src/services/ai/ with agent-intelligence | Done |
| US-009 | Refactor create-project.tsx | Done |
| US-010 | Refactor ProjectDetail.tsx | Done |
| US-012 | Refactor tab pages | Done |
| US-018 | Update Biome/SonarCloud/TypeScript configs | Done |
| US-008 | Refactor chat.tsx | In Progress |
| US-011 | Refactor AgentDetail.tsx | In Progress |
| US-013 | Lazy-load icon-paths.ts, consolidate styling | In Progress |
| US-015 | Create memory bank working files | In Progress |

### Wave 3: Orchestrator Wiring

| Story | Title | Status |
|-------|-------|--------|
| US-003 | Wire orchestrator for single-agent routing | Pending |
| US-004 | Wire orchestrator for multi-agent pipeline | Pending |
| US-016 | Create AGENTS.md, update CLAUDE.md | Pending |

### Wave 4: Agent Tools + Cleanup

| Story | Title | Status |
|-------|-------|--------|
| US-005 | Connect agent read tools to git services | Pending |
| US-006 | Connect agent write tools, approval commits | Pending |
| US-019 | Remove dead src/types/ | Pending |
| US-020 | Remove dead exports and debris | Pending |

### Wave 5: Test Coverage

| Story | Title | Status |
|-------|-------|--------|
| US-021 | Unit tests for tab pages | Pending |
| US-022 | Unit tests for settings/detail pages | Pending |
| US-023 | Fix E2E chat crash | Pending |
| US-024 | Achieve 80%+ statement coverage | Pending |

## Post-v1.0 Phases

### Phase 2: Enhanced Multi-Agent

- Parallel agent execution
- Agent-to-agent communication
- Advanced task assignment and tracking
- Agent memory and learning

### Phase 3: Full Workspace

- Full file tree navigation with agent assistance
- Code editing with real-time AI help
- Advanced diff review and approval
- Branch management with conflict resolution

### Phase 4: Collaboration

- Team workspaces
- Shared agent configurations
- Real-time notifications
- PR review workflow

### Phase 5: Platform

- MCP server ecosystem
- Custom agent definitions
- Public API for integrations
- Self-hosted option

## Business Model

| Tier | Price | Features |
|------|-------|----------|
| **Free** | $0 | BYOK only, 1 project, 2 agents max |
| **Pro** | $19/mo | Unlimited projects, 10 agents |
| **Team** | $49/mo | Shared workspaces, team management |

Distribution cost: Apple Developer ($99/yr) + Google Play ($25 one-time) = $124 year one.

## Success Metrics

| Category | Metric | Target |
|----------|--------|--------|
| Activation | Complete onboarding | 70% |
| Activation | First commit from mobile | 50% |
| Engagement | Weekly active users | 30% of registered |
| Engagement | Commits per user per week | 5+ |
| Satisfaction | App Store rating | 4.5+ |
| Satisfaction | NPS | 50+ |
