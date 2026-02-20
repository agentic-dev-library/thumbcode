# PRD: ThumbCode v1.0 Consolidation & Completion

## Introduction

ThumbCode is a decentralized multi-agent mobile development platform where users direct AI agents from their phone using BYOK credentials. A comprehensive codebase assessment (Feb 20, 2026) revealed that the core product value -- multi-agent orchestration -- exists as a sophisticated but **disconnected** package (`@thumbcode/agent-intelligence`) that was never wired into the application. Meanwhile, `src/` independently re-implemented simplified versions of the same capabilities, creating duplication and leaving the product's central feature non-functional.

Additionally, a framework migration from Expo/React Native to Capacitor/Vite (Feb 12, 2026) left all documentation referencing the old stack, configuration files stale, and post-migration debris throughout the repo.

This PRD captures the full roadmap to consolidate, reconnect, refactor, and complete ThumbCode for v1.0 release.

## Goals

- Reconnect `packages/agent-intelligence/` as the canonical AI orchestration layer, replacing simplified duplicates in `src/services/`
- Establish `packages/ui/` as the canonical component library consumed by `src/`
- Refactor all monolithic TSX files so that TSX handles DESIGN only and logic lives in subpackages
- Consolidate documentation into a Cline-style memory bank structure under `docs/`
- Achieve 80%+ statement coverage with unit and E2E tests
- Clean all stale configuration, dead code, and post-migration debris
- Wire the multi-agent pipeline end-to-end: user prompt -> Architect -> Implementer -> Reviewer -> Tester -> commit

## User Stories

---

### Epic 1: Package Reconnection

---

### US-001: Modernize agent-intelligence package for web
**Description:** As a developer, I need `@thumbcode/agent-intelligence` updated for the Capacitor/Vite web stack so it can be imported by `src/`.

**Acceptance Criteria:**
- [ ] Remove `react-native: "0.76.0"` dependency from `packages/agent-intelligence/package.json`
- [ ] Replace `jest` with `vitest` for testing
- [ ] Remove all React Native-specific imports and types
- [ ] Add `"@thumbcode/agent-intelligence": "workspace:*"` to root `package.json` dependencies
- [ ] Ensure `pnpm install` resolves cleanly with no peer dependency warnings for RN
- [ ] All existing tests in the package pass under Vitest
- [ ] `pnpm typecheck` passes with `packages/agent-intelligence/` included in tsconfig

---

### US-002: Replace src/services/ai/ with agent-intelligence AI clients
**Description:** As a developer, I want `src/` to use the advanced AI clients from `@thumbcode/agent-intelligence` (with tool calling, token tracking, rich streaming events) instead of the simplified duplicates in `src/services/ai/`.

**Acceptance Criteria:**
- [ ] `src/services/chat/AgentResponseService.ts` imports AI client from `@thumbcode/agent-intelligence/ai` instead of `src/services/ai/`
- [ ] Tool calling support is available through the imported client
- [ ] Token usage tracking is exposed to the chat UI
- [ ] Streaming works with the same UX (typing indicator, progressive text render)
- [ ] `src/services/ai/` directory is deleted (no longer needed)
- [ ] All existing chat tests pass with the new client
- [ ] New unit tests verify tool calling round-trip
- [ ] `pnpm typecheck` passes

---

### US-003: Wire multi-agent orchestrator to chat service
**Description:** As a user, I want my messages to be routed through the full orchestrator so that specialized agents (Architect, Implementer, Reviewer, Tester) collaborate on my request.

**Acceptance Criteria:**
- [ ] `AgentResponseService` uses `AgentOrchestrator` from `@thumbcode/agent-intelligence/orchestrator`
- [ ] Single-agent mode still works for simple questions (orchestrator routes to appropriate agent)
- [ ] Multi-step requests create a task queue visible in the chat UI
- [ ] Agent handoffs are reflected in chat (e.g., "Architect finished, handing to Implementer")
- [ ] User can approve/reject at each stage via the existing `ApprovalCard` component
- [ ] Orchestrator errors are caught and displayed gracefully
- [ ] Unit tests cover single-agent routing, multi-agent pipeline, and error cases
- [ ] E2E test verifies a multi-step agent conversation renders correctly

---

### US-004: Connect agent tool execution to core git services
**Description:** As a user, I want agents to actually read files, generate code, and create commits -- not just chat.

**Acceptance Criteria:**
- [ ] Agent tool definitions in `packages/agent-intelligence/` are connected to `packages/core/` git services
- [ ] `Implementer` agent's `write_file` tool calls `GitCommitService` to stage changes
- [ ] `Reviewer` agent's `read_file` tool calls `GitDiffService` to show changes
- [ ] `Tester` agent can read test output and report results
- [ ] Approval in chat triggers actual `git commit` via `GitCommitService`
- [ ] Unit tests mock git operations and verify the tool-to-service bridge
- [ ] `pnpm typecheck` passes

---

### US-005: Establish packages/ui/ as canonical component library
**Description:** As a developer, I want `src/components/ui/` to import from `@thumbcode/ui` so that the design system has a single source of truth.

**Acceptance Criteria:**
- [ ] `src/components/ui/Button.tsx` imports and re-exports from `@thumbcode/ui`
- [ ] `src/components/ui/Card.tsx` imports and re-exports from `@thumbcode/ui`
- [ ] `src/components/ui/Input.tsx` imports and re-exports from `@thumbcode/ui`
- [ ] `src/components/ui/Text.tsx` imports and re-exports from `@thumbcode/ui`
- [ ] Unique primitives from `packages/ui/` (Box, ScrollArea, List, Image, Switch, Spinner, Alert) are available via `@thumbcode/ui`
- [ ] Theme system (`useTheme`, `useColor`, organic presets) is consumed from the package
- [ ] Dead underscore-prefixed constants (`_SPINNER_COLORS`, `_PLACEHOLDER_COLOR`) are removed from `src/components/ui/`
- [ ] All screens render identically before and after (visual regression check)
- [ ] `pnpm typecheck` passes

---

### Epic 2: Monolith Refactoring (TSX = Design, Logic -> Packages)

---

### US-006: Refactor chat.tsx -- extract logic, use existing components
**Description:** As a developer, I want `pages/tabs/chat.tsx` (510 lines) to be a thin composition layer that imports components from `components/chat/` and logic from service packages.

**Acceptance Criteria:**
- [ ] `formatTime()`, `formatRelativeTime()`, `getSenderInfo()`, `getParticipantColor()` are extracted to a shared `@thumbcode/core` utility or `src/lib/chat-utils.ts` and imported by both `pages/tabs/chat.tsx` and `components/chat/`
- [ ] `ThreadItem`, `ChatMessageView`, `ChatInputBar` inline components are deleted from `chat.tsx` -- the page imports `ThreadList`, `ChatMessage`, `ChatInput` from `components/chat/`
- [ ] Unused Zustand subscriptions (`_projects`, `_userProfile` at lines 420-421) are removed
- [ ] `chat.tsx` is under 150 lines
- [ ] All chat functionality works identically (thread management, message rendering, agent selection, typing indicators)
- [ ] Unit tests cover the extracted utilities
- [ ] E2E test verifies chat page renders and sends a message
- [ ] `pnpm typecheck` passes

---

### US-007: Refactor create-project.tsx -- extract form logic
**Description:** As a developer, I want `pages/onboarding/create-project.tsx` (411 lines) to delegate form logic to service functions and use existing decomposed components.

**Acceptance Criteria:**
- [ ] Repository listing logic extracted to a service function in `@thumbcode/core` or `src/services/`
- [ ] Form validation logic extracted from TSX into a validation module
- [ ] `create-project.tsx` uses `RepoSelector` and `ProjectForm` from `components/onboarding/` instead of reimplementing inline
- [ ] `create-project.tsx` is under 150 lines
- [ ] Existing onboarding tests still pass
- [ ] New unit tests cover the extracted service functions
- [ ] `pnpm typecheck` passes

---

### US-008: Refactor remaining monolithic pages
**Description:** As a developer, I want all page files to follow the pattern: TSX for layout/design, logic in services/hooks.

**Acceptance Criteria:**
- [ ] `pages/detail/ProjectDetail.tsx` (402 lines): file explorer logic → service, project actions → hook, page under 200 lines
- [ ] `pages/detail/AgentDetail.tsx` (320 lines): agent metrics/history logic → hook, page under 200 lines
- [ ] `pages/tabs/home.tsx`: any inline data fetching → hook
- [ ] `pages/tabs/projects.tsx`: project list logic → hook consuming `@thumbcode/state`
- [ ] `pages/tabs/agents.tsx`: agent list logic → hook consuming `@thumbcode/state`
- [ ] Each refactored page has a corresponding unit test
- [ ] `pnpm typecheck` passes

---

### US-009: Lazy-load icon-paths.ts
**Description:** As a developer, I want `icon-paths.ts` (924 lines of generated SVG path data) to not inflate the initial bundle.

**Acceptance Criteria:**
- [ ] `icon-paths.ts` is dynamically imported only when `PaintDaubeIcon` uses it as a fallback
- [ ] Initial bundle size decreases measurably (check with `pnpm build` output)
- [ ] Icon rendering still works for all icon variants
- [ ] `pnpm typecheck` passes

---

### US-010: Consolidate organic styling approach
**Description:** As a developer, I want one canonical way to apply organic styling -- either JS objects OR Tailwind classes, not both.

**Acceptance Criteria:**
- [ ] Decision: Use Tailwind utility classes (`rounded-organic-card`, `shadow-organic`) as the canonical approach
- [ ] Remove `src/lib/organic-styles.ts` JS object approach (or convert it to only generate Tailwind classes)
- [ ] All components using `style={organicBorderRadius.card}` migrated to `className="rounded-organic-card"`
- [ ] No component uses both approaches
- [ ] Visual regression check: all components render identically
- [ ] `pnpm typecheck` passes

---

### Epic 3: Documentation Consolidation (Cline Memory Bank)

---

### US-011: Create docs/ memory bank structure
**Description:** As a developer or AI agent, I want a `docs/` directory structured as a Cline-style memory bank so that project context is always current and maintained agentically.

**Acceptance Criteria:**
- [ ] Create `docs/memory-bank/` with 6 core files:
  - `projectbrief.md` -- ThumbCode mission, scope, core requirements
  - `productContext.md` -- BYOK model, mobile-first philosophy, user experience goals
  - `systemPatterns.md` -- Multi-agent architecture, Capacitor/Vite stack, package relationships, data flows
  - `techContext.md` -- Current technology stack (React 18, Vite 7, Capacitor 8, etc.), dev setup, dependencies
  - `activeContext.md` -- Current work focus, recent changes, next steps
  - `progress.md` -- What works, what's left, known issues, feature status
- [ ] Move existing relevant content from `ARCHITECTURE.md`, `DEVELOPMENT-LOG.md`, `DECISIONS.md`, `PROJECT-STATUS.md`, `AGENTS.md` into the appropriate memory bank files (updated for current stack)
- [ ] Create `docs/architecture/` for detailed architecture docs
- [ ] Create `docs/design/` for brand identity, design system docs
- [ ] Create `docs/vision/` for PRD, roadmap docs
- [ ] All content reflects the CURRENT Capacitor/Vite stack, not the old Expo stack

---

### US-012: Create AGENTS.md and update CLAUDE.md
**Description:** As an AI agent, I want `AGENTS.md` as the operational guide for multi-agent workflows, with `CLAUDE.md` pointing to it and docs/ for details.

**Acceptance Criteria:**
- [ ] Create `AGENTS.md` at repo root with:
  - Agent roles and capabilities (Architect, Implementer, Reviewer, Tester)
  - Orchestration workflow (how agents coordinate)
  - Tool definitions and permissions per agent
  - Ralph integration instructions
- [ ] Update `CLAUDE.md` to:
  - Reference current stack (Vite, Capacitor, react-router-dom, Tailwind CSS)
  - Point to `AGENTS.md` for multi-agent workflows
  - Point to `docs/memory-bank/` for project context
  - Remove all stale Expo/NativeWind/expo-router/gluestack references
  - Keep brand identity section (colors, typography, organic style) as-is
- [ ] Delete or archive stale root-level docs: `ARCHITECTURE.md`, `DEVELOPMENT-LOG.md`, `PROJECT-STATUS.md`, `DECISIONS.md` (content moved to docs/)
- [ ] Delete `thumbcode-agent-playbook.md` (duplicate of CLAUDE.md)

---

### US-013: Update .env.example and configuration files
**Description:** As a developer, I want configuration files to reflect the current stack.

**Acceptance Criteria:**
- [ ] `.env.example` uses `VITE_*` prefix instead of `EXPO_PUBLIC_*`
- [ ] `sonar-project.properties` includes all packages in `sonar.sources` and removes `eslint-report.json` reference
- [ ] `biome.json` removes `"!**/packages"` exclusion so packages are linted
- [ ] `tsconfig.json` includes all active packages (remove stale excludes)
- [ ] `capacitor.config.ts` includes plugin configuration for secure-storage, filesystem, biometric-auth
- [ ] Delete `eslint.config.mjs` (Biome is the only linter)
- [ ] Delete `.coveralls.yml` (unused)
- [ ] Delete `expo-env.d.ts` (Expo vestige)
- [ ] Delete `.eas/` directory (Expo vestige)
- [ ] Delete `src/stubs/react-native-assets-registry.ts` (RN vestige)
- [ ] Update `scripts/setup.sh` to reference Capacitor/Vite commands instead of Expo

---

### Epic 4: Dead Code & Debris Cleanup

---

### US-014: Remove dead type system
**Description:** As a developer, I want to eliminate the unused `src/types/` directory since all types come from packages.

**Acceptance Criteria:**
- [ ] Delete entire `src/types/` directory (10 files, ~400 lines, zero imports)
- [ ] Verify no build or typecheck errors after deletion
- [ ] Any type that was only defined in `src/types/` (not in `@thumbcode/types` or `@thumbcode/state`) is migrated to the correct package first
- [ ] `pnpm typecheck` passes
- [ ] `pnpm test` passes

---

### US-015: Remove dead exports and components
**Description:** As a developer, I want to remove exported components that nothing imports.

**Acceptance Criteria:**
- [ ] Remove 15 unused icon presets from `src/components/icons/icon-presets.tsx`
- [ ] Remove `src/pages/placeholder.tsx` (never imported)
- [ ] Remove empty `src/components/workspace/index.ts` (exports nothing)
- [ ] Evaluate and remove or wire up: `AgentActions`, `AgentHistory`, `ProjectFileExplorer`, `ProjectHeader`, `DeviceCodeDisplay`, `PollingStatus`, `RepoSelector`, `BottomSheet`, `Pagination`, `Spacer`, `Tooltip`
- [ ] For each component: if it should be used by a page, wire it in; if it's truly dead, delete it
- [ ] `pnpm typecheck` passes

---

### US-016: Clean post-migration debris
**Description:** As a developer, I want all Expo/React Native artifacts removed from the repo.

**Acceptance Criteria:**
- [ ] Remove `react-native` dependencies from `packages/core/package.json` and `packages/config/package.json` peer dependencies
- [ ] Remove `@react-native-async-storage/async-storage` from `packages/state/package.json` (replace with web-compatible alternative)
- [ ] Delete or `.gitignore` `archive/thumbcode-deploy.zip` and `archive/thumbcode-docs.zip` (binary files in git)
- [ ] Delete or `.gitignore` `ralph/` directory (old migration artifacts) -- note: the NEW ralph config is in `.ralph/`
- [ ] Rename `src/hooks/useAppRouter.ts` to `use-app-router.ts` for naming consistency
- [ ] Standardize export patterns: all pages use named exports (`export function`)
- [ ] Replace `console.error` calls in `src/` production files with the project's `logger` utility from `src/lib/logger.ts`
- [ ] `pnpm install` runs cleanly with no peer dependency warnings
- [ ] `pnpm typecheck` passes

---

### Epic 5: Testing & Quality

---

### US-017: Add unit tests for all tab pages
**Description:** As a developer, I want the 5 tab pages (home, projects, agents, chat, settings) to have unit tests since they currently have 0% coverage.

**Acceptance Criteria:**
- [ ] `src/pages/tabs/home.tsx` has tests covering render, data display, navigation
- [ ] `src/pages/tabs/projects.tsx` has tests covering project list, empty state, project selection
- [ ] `src/pages/tabs/agents.tsx` has tests covering agent list, status display, agent selection
- [ ] `src/pages/tabs/chat.tsx` has tests covering thread list, message display, agent selection, message sending
- [ ] `src/pages/tabs/settings.tsx` has tests covering settings list, navigation to sub-pages
- [ ] Each test file has at least 3 test cases covering core functionality
- [ ] `pnpm test` passes
- [ ] Statement coverage for these files is above 70%

---

### US-018: Add unit tests for settings and detail pages
**Description:** As a developer, I want settings pages and remaining detail pages to have unit tests.

**Acceptance Criteria:**
- [ ] `src/pages/settings/AgentSettings.tsx` has tests
- [ ] `src/pages/settings/CredentialSettings.tsx` has tests
- [ ] `src/pages/settings/EditorSettings.tsx` has tests
- [ ] `src/pages/detail/AgentDetail.tsx` has tests
- [ ] `src/pages/onboarding/complete.tsx` has tests
- [ ] `src/layouts/RootLayout.tsx` has tests
- [ ] Each test file covers render, user interactions, and error states
- [ ] `pnpm test` passes

---

### US-019: Fix E2E chat crash and restore skipped tests
**Description:** As a developer, I want the 3 skipped E2E tests to pass so we have full E2E coverage.

**Acceptance Criteria:**
- [ ] Investigate root cause of "Chat page crashes on web with error boundary" in E2E
- [ ] Fix the crash (likely related to the chat.tsx monolith -- may be resolved by US-006)
- [ ] Remove `test.skip` from `e2e/dashboard.spec.ts:79` (Chat tab navigation)
- [ ] Remove `test.skip` from `e2e/interactions.spec.ts:65` (Full flow interactions)
- [ ] Remove `test.skip` from `e2e/interactions.spec.ts:128` (Chat page interactions)
- [ ] All 3 previously-skipped E2E tests pass
- [ ] No E2E regressions in existing passing tests

---

### US-020: Achieve 80%+ statement coverage
**Description:** As a developer, I want overall test coverage to reach 80% statements (currently 59%).

**Acceptance Criteria:**
- [ ] Overall statement coverage >= 80% (measured by `pnpm test:coverage`)
- [ ] Overall branch coverage >= 60%
- [ ] No source file in `src/` has 0% coverage
- [ ] All `packages/` have test files (currently `packages/types/` has none)
- [ ] Coverage report is generated and uploaded to SonarCloud in CI

---

### US-021: Expand quality tooling to all packages
**Description:** As a developer, I want Biome, SonarCloud, and TypeScript to analyze all packages, not just `src/`.

**Acceptance Criteria:**
- [ ] `biome.json` removes `"!**/packages"` exclusion
- [ ] `sonar-project.properties` `sonar.sources` includes all package source directories
- [ ] `tsconfig.json` includes all active packages in its project references or composite builds
- [ ] `pnpm lint` checks all packages
- [ ] `pnpm typecheck` checks all packages
- [ ] CI pipeline runs lint and typecheck across all packages
- [ ] Any new lint errors in packages are fixed

---

## Functional Requirements

- FR-1: The orchestrator must route user messages to the appropriate agent based on intent analysis
- FR-2: Multi-step requests must create a visible task queue in the chat UI
- FR-3: Each agent handoff must produce a visible message in chat
- FR-4: Tool calling (file read, code generation, git commit) must work end-to-end through the orchestrator
- FR-5: User approval gates must block execution until the user approves or rejects
- FR-6: All TSX page files must be under 200 lines, with logic extracted to hooks or services
- FR-7: All documentation in `docs/` must reflect the current Capacitor/Vite stack
- FR-8: The `docs/memory-bank/activeContext.md` and `progress.md` must be updated at the end of each development session
- FR-9: All source files must be covered by Biome linting and TypeScript type checking
- FR-10: Test coverage must be >= 80% statements before v1.0 release
- FR-11: No `console.log/warn/error` in production `src/` code -- use the `logger` utility
- FR-12: Single canonical approach for organic styling (Tailwind classes, not JS objects)

## Non-Goals (Out of Scope)

- MCP server integration (post-v1.0)
- Push notifications (post-v1.0)
- Offline mode / message queue (post-v1.0)
- App Store submission pipeline (post-v1.0, separate PRD)
- New feature development beyond wiring existing code
- Rewriting `packages/agent-intelligence/` from scratch -- modernize and reconnect, don't rebuild
- `docs-site/` (Astro docs site) improvements -- separate effort

## Design Considerations

- Chat UI should show agent avatars and role labels during multi-agent conversations
- Task queue in chat should use the existing `ApprovalCard` component pattern
- Token usage display should be unobtrusive (collapsed by default, expandable)
- Memory bank docs should be plain markdown with no build step required
- Brand identity (P3 "Warm Technical", organic daubes) must be preserved through all refactoring

## Technical Considerations

- `packages/agent-intelligence/` has React Native dependencies that must be removed before it can be imported by the web app
- The orchestrator's `executeTool()` needs to be bridged to `packages/core/` git services -- this is the critical integration point
- `@react-native-async-storage/async-storage` in `packages/state/` must be replaced with a web-compatible alternative (localStorage or Capacitor Preferences)
- The chat E2E crash may be caused by the monolithic chat.tsx -- US-006 (refactor) may resolve US-019 (E2E fix) as a side effect
- Biome currently excludes all packages -- expanding coverage may surface existing lint errors that need fixing first

## Success Metrics

- Multi-agent pipeline works end-to-end: user prompt -> agent collaboration -> code commit
- Zero duplicate implementations between `src/` and `packages/`
- All TSX page files under 200 lines
- 80%+ test coverage with zero skipped E2E tests
- All documentation reflects the current stack (zero Expo references outside of git history)
- `docs/memory-bank/activeContext.md` stays current across development sessions
- Clean `pnpm install`, `pnpm lint`, `pnpm typecheck`, `pnpm test` with zero warnings

## Open Questions

1. Should `packages/agent-intelligence/` chat components (ChatBubble, ChatInput, CodeBlock) be deleted or merged into `src/components/chat/`? (Recommendation: delete -- the `src/` versions are newer and web-native)
2. Should we adopt `@capacitor/preferences` to replace `@react-native-async-storage/async-storage`, or use plain `localStorage`?
3. The orchestrator has parallel execution support -- should v1.0 enable parallel agent execution, or keep it sequential for simplicity?
4. Should `docs/memory-bank/` be gitignored for `activeContext.md` and `progress.md` (they change every session) or tracked in git?
5. How should the `ralph/` directory (old migration artifacts) be handled -- delete from git history, or just remove from main?

## Dependencies Between Stories

```
US-001 (modernize agent-intelligence)
  -> US-002 (replace src/services/ai/)
    -> US-003 (wire orchestrator)
      -> US-004 (connect tool execution)

US-005 (establish packages/ui/) -- independent, can parallel with Epic 1

US-006 (refactor chat.tsx) -- depends on US-002 (new AI client imports)
  -> US-019 (fix E2E crash -- likely resolved by refactor)

US-007, US-008 (refactor other monoliths) -- independent of each other

US-009, US-010 (icon lazy-load, organic consolidation) -- independent

US-011, US-012, US-013 (docs consolidation) -- independent of code work, can parallel

US-014, US-015, US-016 (dead code cleanup) -- should run after US-001/US-005 to avoid deleting code that will be reconnected

US-017, US-018, US-019, US-020, US-021 (testing) -- should run after refactoring (Epics 1-2) since tests should target the new structure
```
