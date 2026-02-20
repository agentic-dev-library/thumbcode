## Codebase Patterns

- **Hook extraction pattern**: Each hook returns a typed result interface (`UseXxxResult`), consumes `@thumbcode/state` stores directly, and exposes derived data via `useMemo`. Pages become thin composition layers (TSX = design only).
- **Test mocking pattern**: Mock `@thumbcode/state` with `vi.mock()` using a selector-based approach: `useXxxStore: (selector) => selector(state)`. Mock `react-router-dom` with `useNavigate: () => mockNavigate`. For page tests, mock the hook module (`@/hooks`) entirely.
- **Biome formatting**: Biome auto-sorts imports alphabetically and collapses single-expression `useMemo` calls to one line. Run `pnpm lint:fix` after writing code.
- **Test text matching**: When asserting text that may appear multiple times (e.g. agent name + activity feed), use `getAllByText().length` instead of `getByText()` to avoid "multiple elements found" errors.
- **Vitest global types**: `Mocked`, `Mock`, `MockInstance` are exported from `vitest` module but NOT from `vitest/globals`. Use `src/vitest-globals.d.ts` to augment the global scope so test files across all packages get them without explicit imports.
- **Biome a11y static analysis**: Rules like `noStaticElementInteractions` and `useAriaPropsSupportedByRole` do static JSX analysis and can't see runtime conditions (e.g. `onClick ? 'button' : undefined`). Use `biome-ignore` comments with clear rationale for these false positives.

---

Conflict resolved and staged. The file now cleanly includes contributions from both the US-010 (hook extraction) and US-017 (config cleanup) branches alongside the shared US-007 base.

## 2026-02-20 - US-012
- Extracted inline data logic from three tab pages into dedicated hooks
- Created `useHomeDashboard` hook — derives dashboard stats (projectCount, runningAgents, pendingTasks, completedToday, progressPercent) and recent activity from agent/project stores
- Created `useProjectList` hook — manages search state and filtered project list from @thumbcode/state
- Created `useAgentList` hook — manages role filter state, active agent counts, completed tasks, and per-agent metrics (getAgentMetrics callback)
- Refactored home.tsx, projects.tsx, agents.tsx to be thin composition layers consuming their respective hooks
- Updated hooks/index.ts barrel to export all new hooks and types
- Files changed:
  - `src/hooks/use-home-dashboard.ts` (new)
  - `src/hooks/use-project-list.ts` (new)
  - `src/hooks/use-agent-list.ts` (new)
  - `src/hooks/index.ts` (updated exports)
  - `src/pages/tabs/home.tsx` (refactored)
  - `src/pages/tabs/projects.tsx` (refactored)
  - `src/pages/tabs/agents.tsx` (refactored)
  - `src/hooks/__tests__/use-home-dashboard.test.ts` (new, 9 tests)
  - `src/hooks/__tests__/use-project-list.test.ts` (new, 6 tests)
  - `src/hooks/__tests__/use-agent-list.test.ts` (new, 9 tests)
  - `src/pages/tabs/__tests__/home.test.tsx` (new, 8 tests)
  - `src/pages/tabs/__tests__/projects.test.tsx` (new, 6 tests)
  - `src/pages/tabs/__tests__/agents.test.tsx` (new, 7 tests)
- **Learnings:**
  - When extracting hooks from pages, watch for intermediate values that were implicitly accessible (e.g. `agents.length` vs `filteredAgents.length`) — you may need to explicitly expose both `totalAgents` and `filteredAgents`
  - Pure display helper functions (getStatusColor, AvatarIcon, getStatusBadge) can stay in the page file since they're view-only; only data-fetching/derivation logic needs extraction
  - Biome will reorder imports alphabetically and collapse concise useMemo expressions — always run lint:fix after writing
---

## 2026-02-20 - US-018
- Updated Biome, SonarCloud, and TypeScript configs to analyze all packages (not just src/)
- Fixed all lint errors (7 errors) and type errors (~30 errors) surfaced by expanded coverage
- Added Capacitor plugin configuration for secure-storage, filesystem, biometric-auth
- Files changed:
  - `biome.json` (removed `!**/packages` exclusion)
  - `sonar-project.properties` (added all package source dirs, removed stale eslint-report.json reference)
  - `tsconfig.json` (added `packages/*/src/**/*.ts` to include, removed stale package excludes)
  - `capacitor.config.ts` (added plugins config for SecureStoragePlugin, Filesystem, BiometricAuth)
  - `src/vitest-globals.d.ts` (new — augments global scope with Mocked, Mock, MockInstance types)
  - `packages/ui/src/primitives/Box.tsx` (added keyboard accessibility for interactive divs)
  - `packages/ui/src/primitives/Button.tsx` (conditional aria-checked for supported roles)
  - `packages/ui/src/primitives/Text.tsx` (conditional aria-label when role is set)
  - `packages/agent-intelligence/src/components/chat/ActionButton.tsx` (added type="button")
  - `packages/agent-intelligence/src/components/chat/ChatInput.tsx` (added type="button", fixed spanInput typo)
  - `packages/agent-intelligence/src/components/chat/ChatBubble.tsx` (message.text → message.content)
  - `packages/agent-intelligence/src/services/orchestrator/orchestrator.ts` (removed void return)
  - `packages/agent-intelligence/src/services/agents/architect-agent.ts` (added missing description fields)
  - `packages/agent-intelligence/src/services/agents/implementer-agent.ts` (added missing description field)
  - `packages/agent-intelligence/src/services/agents/reviewer-agent.ts` (added missing description fields)
  - `packages/agent-intelligence/src/services/ai/anthropic-client.ts` (fixed ContentBlockParam type)
  - `packages/agent-intelligence/src/services/orchestrator/__tests__/AgentCoordinator.test.ts` (nullish coalescing)
  - `packages/agent-intelligence/src/services/orchestrator/__tests__/TaskAssigner.test.ts` (added missing AgentMetrics fields)
  - `packages/core/src/__tests__/GitServicePerf.test.ts` (added explicit type annotation)
  - `packages/dev-tools/src/check-contrast.ts` (type narrowing for design token entries)
  - `packages/state/src/__tests__/userStore.test.ts` (added missing hapticsEnabled)
  - `packages/ui/src/__tests__/components.test.tsx` (fixed variant and undefined guard)
- **Learnings:**
  - Expanding linter/typecheck coverage to previously-excluded packages surfaces many latent issues — most are auto-fixable (import sorting, formatting) but some require manual fixes
  - `vitest/globals` does NOT provide utility types like `Mocked`, `Mock`, `MockInstance` — create a `vitest-globals.d.ts` declaration file to bridge this gap
  - Biome's a11y rules are purely static — they can't evaluate runtime conditions like conditional role/aria props. Use `biome-ignore` with rationale for intentional dynamic ARIA patterns
  - The `@anthropic-ai/sdk` types change between versions — `ContentBlockParam` was renamed; use union of specific block types instead
  - When tsconfig includes new directories, check for packages with standalone tsconfigs (e.g. dev-tools with `NodeNext` module resolution) that may conflict with root settings
---