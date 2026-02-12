# ThumbCode v1.0 Product Requirements Document

> **Date**: February 12, 2026
> **Status**: Draft
> **Author**: Engineering Team (Claude-assisted audit)
> **Scope**: Gap analysis, decomposition plan, and Capacitor migration evaluation

---

## Executive Summary

ThumbCode is a decentralized multi-agent mobile development platform ("Code with your thumbs"). This PRD evaluates the current codebase against a v1.0 release, identifying every stub, placeholder, gap, monolith, and documentation deficit. It also evaluates a Capacitor migration path.

**Current State**: Foundation-complete with significant stubbed functionality. The UI shell, navigation, design system, and monorepo structure are production-grade. The core agent orchestration, real AI integration, and deployment workflows remain mock/placeholder implementations.

**Headline Metrics (post-merge)**:
| Metric | Value |
|--------|-------|
| Test Coverage | 34.78% statements, 18.23% branches |
| Test Suites | 21 passed, 1 skipped |
| Tests | 245 passed, 3 skipped |
| SonarCloud Bugs | 1 |
| SonarCloud Code Smells | 136 |
| Security Hotspots | 2 |
| Lint/TypeCheck | Clean |
| Security Audit | 0 vulnerabilities (prod) |
| Lines of Code | ~11,400 |

---

## 1. Stubs, Placeholders & Incomplete Implementations

### 1.1 Critical (Blocks v1.0)

| ID | Location | Description | Impact | Effort |
|----|----------|-------------|--------|--------|
| **S-01** | `src/services/chat/ChatService.ts:236-313` | `simulateAgentResponse()` returns hardcoded mock text instead of calling AI APIs | Core feature non-functional | L |
| **S-02** | `app/(onboarding)/create-project.tsx:276-282` | "Create new repository (coming soon)" — no project creation service | Cannot create new projects | M |
| **S-03** | `src/services/chat/ChatService.ts:301-313` | `getAgentResponsePlaceholder()` returns canned strings per agent type | No real AI orchestration | L |

### 1.2 High (Should fix for v1.0)

| ID | Location | Description | Impact | Effort |
|----|----------|-------------|--------|--------|
| **S-04** | `e2e/web/dashboard.spec.ts:33` | E2E tests skipped "pending UX research" | No E2E regression coverage | M |
| **S-05** | `e2e/web/interactions.spec.ts:60` | Interaction E2E tests skipped "pending UX research" | No interaction testing | M |

### 1.3 Low (Post v1.0)

| ID | Location | Description | Impact | Effort |
|----|----------|-------------|--------|--------|
| **S-06** | `src/components/chat/CodeBlock.tsx:4` | "syntax highlighting placeholder" — no actual syntax highlighting | Visual only | S |
| **S-07** | `app/verify.tsx` | Demo/test screen with hardcoded UI — purpose unclear | Dead code | S |

---

## 2. Monoliths Requiring Decomposition

### 2.1 Critical Monoliths (>500 lines)

| File | Lines | What It Contains | Decomposition Plan |
|------|-------|-----------------|-------------------|
| **`src/components/icons/PaintDaubeIcon.tsx`** | 1,268 | All SVG paint daube icon definitions in a single file | Extract to icon registry pattern: `icons/daube-check.tsx`, `icons/daube-key.tsx`, etc. Use lazy loading. |
| **`packages/core/src/git/GitService.ts`** | 1,055 | Git operations: clone, commit, push, diff, status, branch management | Split by concern: `GitCloneService`, `GitDiffService`, `GitBranchService`, `GitStatusService` |
| **`packages/agent-intelligence/src/services/orchestrator/orchestrator.ts`** | 512 | Agent orchestration: task assignment, coordination, status tracking | Extract: `TaskAssigner`, `AgentCoordinator`, `OrchestrationState` |
| **`packages/agent-intelligence/src/services/agents/base-agent.ts`** | 492 | Base agent class with all agent behaviors | Extract shared behaviors into mixins/traits: `Promptable`, `Reviewable`, `Committable` |

### 2.2 High-Priority Monoliths (300-500 lines)

| File | Lines | Decomposition Plan |
|------|-------|--------------------|
| **`packages/core/src/credentials/CredentialService.ts`** | 460 | Extract: `KeyValidator`, `KeyStorage`, `KeyRotation` |
| **`src/services/chat/ChatService.ts`** | 442 | Extract: `MessageStore`, `StreamHandler`, `AgentResponseService` (replace mock) |
| **`app/project/[id].tsx`** | 430 | Extract: `ProjectHeader`, `ProjectFileExplorer`, `ProjectSettings`, `ProjectActions` |
| **`packages/core/src/auth/GitHubAuthService.ts`** | 407 | Extract: `DeviceFlowHandler`, `TokenManager`, `PollingService` |
| **`src/types/index.ts`** | 400 | Split by domain: `types/agent.ts`, `types/project.ts`, `types/workspace.ts`, `types/credentials.ts`, `types/chat.ts` |
| **`app/agent/[id].tsx`** | 355 | Extract: `AgentMetrics`, `AgentHistory`, `AgentActions`, `AgentHeader` |
| **`packages/agent-intelligence/src/services/ai/openai-client.ts`** | 348 | Extract: `StreamParser`, `TokenCounter`, `ModelSelector` |
| **`app/settings/credentials.tsx`** | 346 | Extract: `ApiKeyInput` (already partially done), `CredentialSection`, `ConnectionStatus` |
| **`app/(tabs)/settings.tsx`** | 337 | Extract: `SettingsSection` component, separate sections into files |
| **`app/(onboarding)/create-project.tsx`** | 321 | Extract: `RepoSelector`, `ProjectForm`, `TemplateSelector` |

### 2.3 Test File Monoliths (acceptable, lower priority)

| File | Lines | Note |
|------|-------|------|
| `src/lib/__tests__/performance-hooks.test.ts` | 666 | Large test file, but test files are acceptable to be long |
| `packages/state/src/__tests__/credentialStore.test.ts` | 370 | Test file |
| `src/lib/__tests__/performance.test.ts` | 366 | Test file |

---

## 3. Gap Analysis

### 3.1 Feature Gaps

| Gap | Description | Priority | Effort |
|-----|-------------|----------|--------|
| **Real AI Integration** | ChatService uses mock responses. Need actual Anthropic/OpenAI API calls with streaming. | P0 | L |
| **Agent Orchestration** | Multi-agent coordination is stubbed. Need real task assignment, code generation, review cycles. | P0 | XL |
| **Git Commit Workflow** | PR #108 added approval trigger but actual isomorphic-git commit execution needs end-to-end testing. | P0 | M |
| **Project Creation** | "Create new repository" button is cosmetic. Need GitHub API integration for repo creation. | P1 | M |
| **Credential Validation** | API keys accepted without verification. Need actual API calls to validate keys on entry. | P1 | S |
| **Credential Rotation** | No expiration/refresh mechanism for stored credentials. | P2 | M |
| **Syntax Highlighting** | CodeBlock component has placeholder highlighting. Need a lightweight RN-compatible highlighter. | P2 | S |
| **Push Notifications** | `expo-notifications` installed but not wired to any event source. | P2 | M |
| **Offline Mode** | No offline queue for git operations or message drafts. | P2 | L |
| **App Store Submission** | CD pipeline has placeholder comments for iOS/Android submission. Issue #66 tracks this. | P1 | M |

### 3.2 Testing Gaps

| Gap | Current | Target for v1.0 | Effort |
|-----|---------|-----------------|--------|
| **Statement Coverage** | 34.78% | 60% | L |
| **Branch Coverage** | 18.23% | 40% | L |
| **Screen-level Tests** | 1 screen tested (agents) | All 21 screens | XL |
| **E2E Tests** | 2 test files, both skipped | Core user flows covered | L |
| **Integration Tests** | 0 | Chat flow, Auth flow, Git operations | L |
| **Package Tests** | Partial (core, state tested) | All 7 packages | M |

### 3.3 Security Gaps

| Gap | Description | Priority |
|-----|-------------|----------|
| **SonarCloud Bug** | 1 unresolved bug: Promise-returning function in credentials.tsx:207 | P1 |
| **Security Hotspots** | 2 unresolved hotspots requiring review | P1 |
| **Credential Validation** | No runtime validation of API key format before storage | P1 |
| **Rate Limiting** | No client-side rate limiting for API calls | P2 |
| **Audit Logging** | No logging of credential access or agent operations | P2 |

### 3.4 Performance Gaps

| Gap | Description | Priority |
|-----|-------------|----------|
| **Memoization** | Many components may re-render unnecessarily (large lists, recursive trees) | P2 |
| **Icon Loading** | 1,268-line PaintDaubeIcon loaded eagerly | P2 |
| **Bundle Size** | No bundle analysis or tree-shaking verification | P2 |

---

## 4. Documentation Audit

### 4.1 Existing Documentation (Good)

| Document | Location | Status |
|----------|----------|--------|
| Agent Playbook | `CLAUDE.md` | Current, comprehensive |
| Architecture | `docs/development/ARCHITECTURE.md` | Current |
| Decisions | `docs/memory-bank/DECISIONS-OLD.md` | Historical reference |
| Development Log | `docs/memory-bank/DEVELOPMENT-LOG.md` | Historical reference |
| Contributing Guide | `CONTRIBUTING.md` | Current |
| README | `README.md` | Comprehensive |
| Onboarding Spec | `docs/features/ONBOARDING.md` | Current |
| Brand Guidelines | `docs/brand/BRAND-GUIDELINES.md` | Current |
| Design System Governance | `docs/brand/DESIGN-SYSTEM-GOVERNANCE.md` | New |
| Setup Guide | `docs/development/SETUP.md` | Current |
| Deployment Guide | `docs/development/DEPLOYMENT.md` | Current |
| Environment Config | `docs/development/ENVIRONMENT.md` | Current |
| Vision | `docs/vision/VISION.md` | Current |
| UX Research | `memory-bank/UX-RESEARCH-REPORT.md` | New |
| Market Research | `docs/research/MARKET-RESEARCH.md` | New |
| Usability Testing | `docs/research/USABILITY-TESTING-FRAMEWORK.md` | New |

### 4.2 API Documentation

| Document | Location | Status |
|----------|----------|--------|
| API Index | `docs/api/index.md` | Exists |
| Agent Orchestrator | `docs/api/agent-orchestrator.md` | Exists, needs update |
| Chat Service | `docs/api/chat-service.md` | Exists, needs update |
| Credential Service | `docs/api/credential-service.md` | Exists, needs update |
| Git Service | `docs/api/git-service.md` | Exists, needs update |
| GitHub Integration | `docs/integrations/github.md` | Exists |
| AI Integration | `docs/integrations/anthropic-openai.md` | Exists |
| MCP Server | `docs/integrations/mcp-server.md` | Exists |

### 4.3 Documentation Gaps

| Gap | Priority | Description |
|-----|----------|-------------|
| **Component Prop Docs** | P1 | UI components in `src/components/` lack JSDoc prop descriptions |
| **Package READMEs** | P1 | No READMEs in `packages/` subdirectories (agent-intelligence, core, state, ui, config, types) |
| **Test Guide** | P1 | No documentation on running tests, adding tests, or test architecture |
| **Changelog** | P1 | No CHANGELOG.md for tracking releases |
| **API Reference (TypeDoc)** | P2 | TypeDoc is configured but no generated output committed |
| **Docs Site Content** | P2 | Astro docs site exists but content is minimal |
| **ADR Format** | P2 | Decision records exist but don't follow formal ADR template |

---

## 5. Capacitor Migration Evaluation

### 5.1 Current Architecture

ThumbCode is built on **React Native + Expo SDK 52** with:
- EAS Build for native iOS/Android builds
- Expo Router for file-based navigation
- NativeWind (Tailwind) for styling
- expo-secure-store, expo-local-authentication for native security
- expo-updates for OTA updates
- isomorphic-git for client-side git operations

### 5.2 Why Consider Capacitor?

| Factor | Expo | Capacitor |
|--------|------|-----------|
| **Web-first** | React Native Web (adaptation layer) | Native web + native shell |
| **Plugin Ecosystem** | Expo modules + community | Capacitor plugins + Cordova compat |
| **Custom Native Code** | Config plugins, EAS | Direct Xcode/Android Studio |
| **Build System** | EAS Build (cloud) | Local or CI (full control) |
| **OTA Updates** | expo-updates (built-in) | Appflow or custom |
| **Bundle Size** | Larger (RN runtime) | Smaller (web bundle) |
| **Developer Experience** | Excellent for RN devs | Better for web devs |

### 5.3 Migration Assessment

#### What Would Change

| Layer | Current (Expo) | After (Capacitor) |
|-------|---------------|-------------------|
| **Framework** | React Native + Expo | React (web) + Capacitor shell |
| **UI** | React Native components + NativeWind | Standard React + Tailwind CSS |
| **Navigation** | expo-router (file-based) | React Router or TanStack Router |
| **Storage** | expo-secure-store | @capacitor/preferences + Keychain plugin |
| **Auth** | expo-auth-session | @capacitor/browser + custom |
| **File System** | expo-file-system | @capacitor/filesystem |
| **Haptics** | expo-haptics | @capacitor/haptics |
| **Notifications** | expo-notifications | @capacitor/push-notifications |
| **Build** | EAS Build | Xcode + Android Studio + Capacitor CLI |

#### Migration Effort Estimate

| Phase | Description | Effort |
|-------|-------------|--------|
| **Phase 1: Web App** | Port all screens from RN components to React/HTML/Tailwind | XL (4-6 weeks) |
| **Phase 2: Capacitor Shell** | Add Capacitor, configure iOS/Android projects | M (1 week) |
| **Phase 3: Native Plugins** | Replace Expo modules with Capacitor equivalents | L (2-3 weeks) |
| **Phase 4: Testing** | Port tests, new E2E with Playwright/WebdriverIO | L (2 weeks) |
| **Phase 5: Build Pipeline** | New CI/CD for Capacitor builds | M (1 week) |
| **Total** | | **10-13 weeks** |

#### What We'd Lose

- **OTA Updates**: expo-updates provides instant JS bundle updates without app store review
- **Expo Go Dev Workflow**: (already not using — custom dev client required)
- **EAS Build**: Cloud builds without local Xcode/Android Studio setup
- **Expo Module Ecosystem**: Well-tested, maintained native modules
- **Community Support**: Larger React Native + Expo community

#### What We'd Gain

- **True Web-First**: Native web performance, no React Native Web adaptation layer
- **Smaller Bundle**: No React Native runtime overhead
- **Full Native Control**: Direct Xcode/Android Studio access for complex native features
- **Progressive Web App**: Can deploy as PWA with native app as enhancement
- **Web Developer Friendly**: Standard web technologies for the UI layer

### 5.4 Recommendation

**Do NOT migrate to Capacitor for v1.0.** Reasons:

1. **10-13 week rewrite** delays shipping the actual product (agent orchestration, AI integration)
2. **Expo SDK 52 is mature** — all current native features work well
3. **No blocking technical reason** — nothing in the v1.0 roadmap requires Capacitor
4. **Risk**: Migration introduces bugs and regression in an already-complex system

**Revisit for v2.0** if:
- Web performance becomes a bottleneck
- Need for custom native modules that Expo can't support
- PWA distribution becomes a priority
- Team composition shifts toward web-first developers

### 5.5 Hybrid Approach (If Capacitor is Required)

If a Capacitor migration is mandated, a phased hybrid approach minimizes risk:

1. **Phase 0: Web Export** — Use Expo's web export (`expo export --platform web`) as the base
2. **Phase 1: Capacitor Wrapper** — Wrap the existing Expo web export in a Capacitor shell
3. **Phase 2: Plugin Migration** — Gradually replace Expo native modules with Capacitor plugins
4. **Phase 3: Native Optimization** — Port performance-critical screens to native web components

This preserves the existing codebase while adding Capacitor's native shell capabilities.

---

## 6. v1.0 Roadmap

### Phase 1: Core Engine (Weeks 1-4)

| Priority | Task | Depends On |
|----------|------|-----------|
| P0 | Replace ChatService mock with real Anthropic/OpenAI streaming | — |
| P0 | Implement multi-agent orchestration (Architect → Implementer → Reviewer) | AI Integration |
| P0 | End-to-end git commit workflow (isomorphic-git) | — |
| P0 | Decompose PaintDaubeIcon.tsx (1,268 lines) | — |
| P0 | Decompose GitService.ts (1,055 lines) | — |
| P1 | Credential validation (verify API keys on entry) | — |
| P1 | Project creation via GitHub API | — |

### Phase 2: Quality & Testing (Weeks 3-6)

| Priority | Task | Depends On |
|----------|------|-----------|
| P0 | Increase test coverage to 60% statements | — |
| P1 | Add screen-level tests for all 21 app screens | — |
| P1 | Enable and fix E2E test suites | — |
| P1 | Fix SonarCloud bug and security hotspots | — |
| P1 | Decompose types/index.ts into domain-specific files | — |
| P1 | Add JSDoc to all public component props | — |

### Phase 3: Polish & Ship (Weeks 5-8)

| Priority | Task | Depends On |
|----------|------|-----------|
| P1 | App Store submission pipeline (Issue #66) | Core Engine |
| P1 | Add CHANGELOG.md and release process | — |
| P1 | Add package READMEs for all 7 packages | — |
| P2 | Syntax highlighting in CodeBlock | — |
| P2 | Push notification integration | — |
| P2 | Remove dead code (verify.tsx, unused mocks) | — |
| P2 | SonarCloud code smell remediation (136 issues) | — |

---

## 7. SonarCloud Issue Summary

Retrieved via SonarCloud API (`SONARCLOUD_TOKEN` from Doppler `gha/ci`):

### By Severity

| Severity | Count | Examples |
|----------|-------|---------|
| **CRITICAL** | 3 | Void operator usage in chat.tsx, Progress.tsx, DiffViewer.tsx |
| **MAJOR** | 30+ | Nested ternaries, component definitions inside parent components, non-readonly members |
| **MINOR** | 100+ | Read-only props, deprecated APIs, Number.parseInt preference |

### Top Patterns to Fix

1. **Nested ternaries** (12 instances) — Extract to helper functions or switch statements
2. **Component definitions inside parent** (5 in `_layout.tsx`) — Extract to separate files
3. **Non-readonly class members** (4 instances) — Add `readonly` keyword
4. **Void operator usage** (3 instances) — Replace with explicit handling
5. **Read-only props** (10+ components) — Add `Readonly<>` wrapper to prop types

---

## Appendix A: File Inventory

### Packages

| Package | Purpose | Has Tests | Has README |
|---------|---------|-----------|-----------|
| `@thumbcode/agent-intelligence` | AI agent logic, orchestrator | Yes | No |
| `@thumbcode/core` | Git, credentials, auth services | Yes | No |
| `@thumbcode/config` | Environment config, feature flags | No | No |
| `@thumbcode/state` | Zustand stores | Yes | No |
| `@thumbcode/types` | Shared TypeScript types | No | No |
| `@thumbcode/ui` | Shared UI components | No | No |
| `@thumbcode/dev-tools` | Token/icon generators | No | No |

### App Screens (21 total)

| Screen | Test Coverage | Notes |
|--------|-------------|-------|
| `app/(tabs)/index.tsx` | None | Dashboard |
| `app/(tabs)/agents.tsx` | Yes (new) | Agent list |
| `app/(tabs)/chat.tsx` | None | Chat with agents |
| `app/(tabs)/projects.tsx` | None | Project list |
| `app/(tabs)/settings.tsx` | None | Settings |
| `app/(onboarding)/welcome.tsx` | None | Welcome screen |
| `app/(onboarding)/api-keys.tsx` | None | API key entry |
| `app/(onboarding)/github-auth.tsx` | None | GitHub Device Flow |
| `app/(onboarding)/create-project.tsx` | None | Project creation |
| `app/(onboarding)/complete.tsx` | None | Onboarding complete |
| `app/agent/[id].tsx` | None | Agent detail |
| `app/project/[id].tsx` | None | Project detail |
| `app/settings/credentials.tsx` | None | Credential management |
| `app/settings/agents.tsx` | None | Agent settings |
| `app/settings/editor.tsx` | None | Editor settings |
| `app/verify.tsx` | None | Demo/test (dead code?) |

---

## Appendix B: Merged PRs (This Session)

| PR | Title | Type |
|----|-------|------|
| #113 | fix(ci): resolve all CI pipeline failures | Infrastructure |
| #114 | fix(ci): prevent SonarCloud action pinning from failing tests | Infrastructure |
| #115 | fix(ci): extract SonarCloud into separate job to unblock tests | Infrastructure |
| #104 | Optimize GitService diffWorkingDir performance | Performance |
| #105 | Implement GitHub Device Flow with Auto-Polling | Feature |
| #106 | Implement GitHub issue reporting in ErrorFallback | Feature |
| #107 | Optimize Git Diff File Comparison | Performance |
| #108 | feat: trigger git commit on approval in ChatScreen | Feature |
| #109 | Improve GitHub Auth Polling Robustness | Feature |
| #111 | Memoize Inline Styles in ApprovalCard | Performance |
| #112 | Increase test coverage thresholds to 20% | Quality |
| #110 | Bump tar (closed as redundant) | Dependency |
