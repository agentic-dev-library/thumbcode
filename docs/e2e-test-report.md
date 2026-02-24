# ThumbCode E2E Test Report

**Date:** 2026-02-23
**Branch:** `test/comprehensive-e2e-review`
**Viewport:** 390x844 (iPhone 14 Pro)
**Method:** Playwright MCP browser automation + computed style inspection

---

## Summary

| Category | Status |
|----------|--------|
| Onboarding Flow (5 screens) | PASS |
| Home Dashboard | PASS |
| Agents List | PASS (minor overflow) |
| Agent Detail | **FAIL - CRASH** |
| Projects List (empty state) | PASS |
| Project Detail (not found) | PASS |
| Chat | **FAIL - CRASH** |
| Settings Main | PASS |
| Settings > Credentials | PASS |
| Settings > Editor | PASS |
| Settings > Agent Behavior | PASS |
| 404 Page | PASS |
| Design Alignment | PASS |
| Navigation | PASS (1 UX issue) |

**Overall: 12/14 screens pass, 2 critical crashes**

---

## Critical Bugs (P0)

### BUG-001: Agent Detail page infinite re-render loop

- **Severity:** P0 - Page completely broken
- **Route:** `/agent/:id` (e.g., `/agent/agent-architect`)
- **Error:** `Maximum update depth exceeded` at `AgentDetail.tsx:46`
- **Root cause:** `useAgentDetail` hook (line 95) uses `useAgentStore((s) => s.tasks.filter(...))` which returns a new array reference on every render. Zustand uses `===` referential equality, so the new array triggers a re-render, which creates another new array, causing an infinite loop.
- **Console warning:** `The result of getSnapshot should be cached`
- **Impact:** Agent Detail is unreachable from both the Agents list and the Home dashboard agent cards
- **Fix:** Wrap the selector with `useShallow` from `zustand/react/shallow`:
  ```ts
  import { useShallow } from 'zustand/react/shallow';
  const tasks = useAgentStore(useShallow((s) => s.tasks.filter((t) => t.agentId === agentId)));
  ```

### BUG-002: Chat page infinite re-render loop

- **Severity:** P0 - Page completely broken
- **Route:** `/chat`
- **Error:** `Maximum update depth exceeded` at `ThreadList.tsx:134`
- **Root cause:** `selectPinnedThreads` and `selectRecentThreads` selectors in `src/state/chatStore.ts` use `.filter()` and `.sort()` which create new array references:
  ```ts
  // Line 293 - creates new array every call
  export const selectPinnedThreads = (state: ChatState) => state.threads.filter((t) => t.isPinned);
  // Line 294-297 - spread + filter + sort = three new arrays
  export const selectRecentThreads = (state: ChatState) =>
    [...state.threads].filter((t) => !t.isPinned).sort(...);
  ```
- **Impact:** Entire Chat tab is unusable
- **Fix:** Either wrap with `useShallow` at the call site, or memoize at the selector level:
  ```ts
  // Option A: At call site in ThreadList.tsx
  const pinnedThreads = useChatStore(useShallow(selectPinnedThreads));
  const recentThreads = useChatStore(useShallow(selectRecentThreads));

  // Option B: Use createSelector pattern in chatStore.ts
  ```

---

## High-Priority Bugs (P1)

### BUG-003: "Create Project" navigates to dead end after onboarding

- **Severity:** P1 - Feature broken
- **Route:** `/projects` → Click "Create Project" → redirects to `/`
- **Root cause:** The button navigates to `/onboarding/create-project`, but since onboarding is marked complete, the OnboardingProvider redirects back to `/`.
- **Impact:** Users cannot create new projects after completing onboarding
- **Fix:** Either:
  1. Add a standalone `/projects/create` route that doesn't depend on onboarding state
  2. Allow re-entry to specific onboarding steps (e.g., `/onboarding/create-project?standalone=true`)
  3. Use a modal/sheet for project creation on the Projects page itself

### BUG-004: Agent role filter buttons overflow on mobile

- **Severity:** P1 - UI partially broken
- **Route:** `/agents`
- **Problem:** The filter row (All, Architect, Implementer, Reviewer, Tester) overflows the 390px mobile viewport:
  - "Reviewer" partially visible (right edge at 404px, clipped at 390px)
  - "Tester" completely hidden (right edge at 484px)
- **Impact:** Users cannot filter by Reviewer or Tester roles on mobile
- **Fix:** Add `overflow-x-auto` with `flex-nowrap` to the filter container, or use smaller button text/abbreviations on narrow screens

---

## Minor Issues (P2)

### ISSUE-005: Potentially dangerous selectors elsewhere in state package

- **Severity:** P2 - Latent bugs
- **Locations in `packages/state/src/`:**
  - `selectAgentsByRole` / `selectAgentsByStatus` / `selectWorkingAgents` / `selectPendingTasks` / `selectAgentTasks` — all use `.filter()`
  - `selectValidCredentials` / `selectInvalidCredentials` / `selectCredentialsNeedingValidation` — likely use `.filter()`
  - `selectRecentProjects` — likely uses `.filter()` + `.sort()`
  - `selectPendingApprovals` — likely uses `.filter()`
  - `selectOpenFiles` — uses `?? []` which creates new empty array when workspace is null
- **Impact:** These will crash with infinite loops if used directly in components without `useShallow`
- **Recommendation:** Audit all selectors and either:
  1. Add `useShallow` to every call site that uses a derived-array selector
  2. Or create a convention like `useShallowStore()` wrapper

### ISSUE-006: Project Detail "not found" state is minimal

- **Severity:** P2 - Design polish
- **Route:** `/project/:id` with invalid ID
- **Problem:** The empty state shows just text + "Back" button, no icon or illustration (unlike the 404 page which has a search icon)
- **Recommendation:** Add a folder icon or similar visual to match the design quality of other empty states

### ISSUE-007: FAB button overlaps Settings nav label

- **Severity:** P2 - Minor visual overlap
- **Route:** `/projects`
- **Problem:** The coral "+" floating action button in the bottom-right slightly overlaps the "Settings" text label in the navigation bar
- **Recommendation:** Add bottom padding/margin to position FAB above the nav bar, or adjust z-index layering

---

## Design Alignment Verification

### Colors - PASS

| Token | Expected | Actual | Status |
|-------|----------|--------|--------|
| Root background | `#151820` (Charcoal) | `rgb(21, 24, 32)` = `#151820` | PASS |
| Surface | `#1E293B` | `rgb(30, 41, 59)` = `#1E293B` | PASS |
| Coral usage | Present in CTAs, active states | 3+ elements per page | PASS |
| Teal usage | Present in secondary actions | 2+ elements per page | PASS |
| Gold usage | Present in accents, badges | Found on agents page | PASS |
| Gradients | NONE allowed | 0 found across all pages | PASS |
| Blue/purple off-brand | NONE allowed | 0 elements found | PASS |

### Typography - PASS

| Token | Expected | Actual | Status |
|-------|----------|--------|--------|
| Display headings | Fraunces, Georgia, serif | `Fraunces, Georgia, serif` | PASS |
| Body text | Cabin, system-ui, sans-serif | `Cabin, system-ui, sans-serif` | PASS |
| Code preview | JetBrains Mono | Visible in Editor Settings | PASS |

### Organic Styling - PASS

| Feature | Expected | Actual | Status |
|---------|----------|--------|--------|
| Asymmetric border-radius | Non-uniform corners | `16px 12px 20px 8px` on cards | PASS |
| Card rotation | `rotate(±0.3deg)` | ±0.3deg matrix transforms found | PASS |
| Organic border-radius tokens | `rounded-organic-*` classes | 9+ elements on dashboard | PASS |
| No perfectly rounded corners | No `border-radius: 8px` | All use asymmetric values | PASS |

### Accessibility - PARTIAL PASS

- White text on charcoal background exceeds WCAG AA contrast
- Agent cards have `aria-label` attributes
- Progress bars have `role="progressbar"` with `aria-valuenow`
- Toggle switches use semantic `checkbox`/`switch` roles
- **Note:** Could not test full accessibility on Agent Detail and Chat due to crashes

---

## Navigation Flow

| From | Action | Expected | Actual | Status |
|------|--------|----------|--------|--------|
| Onboarding complete | Click "Start Building →" | → Dashboard | → Dashboard `/` | PASS |
| Dashboard | Click "View All →" | → Agents list | → `/agents` | PASS |
| Dashboard | Click agent card | → Agent detail | CRASH (BUG-001) | FAIL |
| Agents list | Click agent card | → Agent detail | CRASH (BUG-001) | FAIL |
| Projects empty | Click "Create Project" | → Create form | → Redirect to `/` (BUG-003) | FAIL |
| Settings | Click credential | → Credentials page | → `/settings/credentials` | PASS |
| Settings | Click Editor Settings | → Editor page | → `/settings/editor` | PASS |
| Settings | Click Agent Behavior | → Agent settings | → `/settings/agents` | PASS |
| Sub-settings | Click "← Settings" | → Settings main | → `/settings` | PASS |
| Nav bar | Click each tab | → Respective page | All correct | PASS |
| Any page | Navigate to bad URL | → 404 page | → 404 page | PASS |

---

## Screenshots Captured

| # | File | Page |
|---|------|------|
| 01 | test-01-welcome.png | Onboarding Welcome |
| 02 | test-02-github-auth.png | Onboarding GitHub Auth |
| 03 | test-03-api-keys.png | Onboarding API Keys |
| 04 | test-04-create-project.png | Onboarding Create Project |
| 05 | test-05-complete.png | Onboarding Complete |
| 06 | test-06-home-dashboard.png | Home Dashboard |
| 06b | test-06b-home-fullpage.png | Home Dashboard (full page) |
| 07 | test-07-agents-list.png | Agents List |
| 08 | test-08-agent-detail-CRASH.png | Agent Detail (crash) |
| 09 | test-09-projects-empty.png | Projects (empty state) |
| 10 | test-10-chat-CRASH.png | Chat (crash) |
| 11 | test-11-settings-main.png | Settings Main |
| 12 | test-12-settings-credentials.png | Settings > Credentials |
| 13 | test-13-settings-editor.png | Settings > Editor |
| 14 | test-14-settings-agents.png | Settings > Agent Behavior |
| 15 | test-15-404-page.png | 404 Page |
| 16 | test-16-project-detail-notfound.png | Project Detail (not found) |

---

## Recommended Fix Priority

1. **BUG-001 + BUG-002** (P0): Fix Zustand selector infinite loops — both share the same root cause. Add `useShallow` wrapper. ~30 min fix.
2. **BUG-003** (P1): Add standalone project creation route. ~1 hour.
3. **BUG-004** (P1): Add horizontal scroll to filter buttons. ~15 min.
4. **ISSUE-005** (P2): Audit all state selectors for stability. ~1 hour.
5. **ISSUE-006 + 007** (P2): Polish empty states and FAB positioning. ~30 min.
