# Ralph-TUI Progress

## Codebase Patterns

### UI Component Re-export Pattern
When consolidating `src/components/ui/` to re-export from `@thumbcode/ui`, each file becomes a single-line barrel: `export { Component } from '@thumbcode/ui';`. This preserves existing import paths (`@/components/ui`) while establishing `@thumbcode/ui` as the canonical source of truth.

### Organic Styles Alignment
Both `src/lib/organic-styles.ts` and `packages/ui/src/theme/organicStyles.ts` define the same border-radius values for card, button, and badge. When adding new shape keys (like `input`), both need to stay in sync until `src/lib/organic-styles.ts` is deprecated.

### Text Component Accessibility Pattern
The `Text` component in `packages/ui` uses custom props (`accessibilityRole`, `accessibilityLabel`, `accessibilityElementsHidden`) mapped to ARIA attributes (`role`, `aria-label`, `aria-hidden`). This is a React Native compatibility layer — always use the `accessibility*` props, not raw HTML attributes.

---

## 2026-02-20 - US-007
- Established `packages/ui/` as the canonical component library
- `src/components/ui/{Button,Card,Input,Text}.tsx` now re-export from `@thumbcode/ui`
- Updated `packages/ui` form/Button to use `organicBorderRadius.button` style objects, added `data-testid="activity-indicator"` spinner, style prop passthrough
- Updated `packages/ui` layout/Card to add style prop passthrough, removed transform rotation, added border class
- Updated `packages/ui` form/Input to add `onChangeText` prop, style prop passthrough, organic border radius
- Updated `packages/ui` primitives/Text to add `accessibilityLabel` and `accessibilityElementsHidden` props
- Added `input` key to `packages/ui/src/theme/organicStyles.ts`
- Added Box, ScrollArea, List, Image, Switch exports to `packages/ui/src/index.ts`
- Fixed Header.tsx `role` → `accessibilityRole` type error
- Removed dead `_SPINNER_COLORS` and `_PLACEHOLDER_COLOR` constants (replaced files entirely)
- Updated Button test to remove now-unnecessary mocks
- Files changed:
  - `packages/ui/src/form/Button.tsx` (aligned API)
  - `packages/ui/src/form/Input.tsx` (aligned API)
  - `packages/ui/src/layout/Card.tsx` (aligned API)
  - `packages/ui/src/layout/Header.tsx` (fixed type error)
  - `packages/ui/src/primitives/Text.tsx` (added accessibility props)
  - `packages/ui/src/theme/organicStyles.ts` (added input border radius)
  - `packages/ui/src/index.ts` (added primitive exports)
  - `src/components/ui/Button.tsx` (re-export)
  - `src/components/ui/Card.tsx` (re-export)
  - `src/components/ui/Input.tsx` (re-export)
  - `src/components/ui/Text.tsx` (re-export)
  - `src/components/ui/__tests__/Button.test.tsx` (removed stale mocks)
- **Learnings:**
  - The `packages/ui` Text was missing accessibility props that its own Spinner component was using — a pre-existing type gap
  - The `packages/ui` Card and Button had `transform: rotate()` styles that the `src` versions didn't — removed for visual parity
  - The `packages/ui` organicStyles only had card/button/badge shapes; needed to add `input` to match `src/lib/organic-styles.ts`
  - `pnpm install` is needed in worktrees since `node_modules` aren't shared
  - Biome lint has 22 pre-existing warnings (mostly `noExplicitAny`) — none from this change
---
