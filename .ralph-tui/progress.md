## Codebase Patterns

- **Hook extraction pattern**: Each hook returns a typed result interface (`UseXxxResult`), consumes `@thumbcode/state` stores directly, and exposes derived data via `useMemo`. Pages become thin composition layers (TSX = design only).
- **Test mocking pattern**: Mock `@thumbcode/state` with `vi.mock()` using a selector-based approach: `useXxxStore: (selector) => selector(state)`. Mock `react-router-dom` with `useNavigate: () => mockNavigate`. For page tests, mock the hook module (`@/hooks`) entirely.
- **Biome formatting**: Biome auto-sorts imports alphabetically and collapses single-expression `useMemo` calls to one line. Run `pnpm lint:fix` after writing code.
- **Test text matching**: When asserting text that may appear multiple times (e.g. agent name + activity feed), use `getAllByText().length` instead of `getByText()` to avoid "multiple elements found" errors.

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