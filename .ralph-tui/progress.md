# Ralph-TUI Progress

## Codebase Patterns

### UI Component Re-export Pattern
When consolidating `src/components/ui/` to re-export from `@thumbcode/ui`, each file becomes a single-line barrel: `export { Component } from '@thumbcode/ui';`. This preserves existing import paths (`@/components/ui`) while establishing `@thumbcode/ui` as the canonical source of truth.

### Organic Styles Alignment
Both `src/lib/organic-styles.ts` and `packages/ui/src/theme/organicStyles.ts` define the same border-radius values for card, button, and badge. When adding new shape keys (like `input`), both need to stay in sync until `src/lib/organic-styles.ts` is deprecated.

### Text Component Accessibility Pattern
The `Text` component in `packages/ui` uses custom props (`accessibilityRole`, `accessibilityLabel`, `accessibilityElementsHidden`) mapped to ARIA attributes (`role`, `aria-label`, `aria-hidden`). This is a React Native compatibility layer — always use the `accessibility*` props, not raw HTML attributes.

### Environment Variable Convention
The project uses Vite, so client-exposed env vars must use `VITE_*` prefix (accessed via `import.meta.env.VITE_*`). Server-only secrets (API keys like `ANTHROPIC_API_KEY`) don't need the prefix. The old `EXPO_PUBLIC_*` prefix is fully removed from `.env.example`.

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

## 2026-02-20 - US-017
- Updated `.env.example`: replaced all `EXPO_PUBLIC_*` vars with `VITE_*` prefix, removed Expo/EAS build section, added Capacitor config section
- Deleted `eslint.config.mjs` (Biome is the only linter)
- Deleted `.coveralls.yml` (unused)
- Deleted `expo-env.d.ts` (Expo vestige)
- Deleted `.eas/` directory with 3 workflow YAML files (Expo vestige)
- Deleted `src/stubs/react-native-assets-registry.ts` and empty `src/stubs/` directory (RN vestige)
- Rewrote `scripts/setup.sh`: removed Expo CLI check, removed "Expo Go won't work" warning, updated next-steps to reference Vite dev server and Capacitor commands, updated env var references to `VITE_*`
- Cleaned up `.gitignore`: removed `@generated expo-cli` section (`.expo/`, `expo-env.d.ts` patterns)
- Updated `packages/core/src/auth/DeviceFlowHandler.ts` error message: `EXPO_PUBLIC_GITHUB_CLIENT_ID` → `VITE_GITHUB_CLIENT_ID`
- Files changed:
  - `.env.example` (rewrote with VITE_* prefix)
  - `eslint.config.mjs` (deleted)
  - `.coveralls.yml` (deleted)
  - `expo-env.d.ts` (deleted)
  - `.eas/workflows/development-builds.yml` (deleted)
  - `.eas/workflows/preview-update.yml` (deleted)
  - `.eas/workflows/production-deploy.yml` (deleted)
  - `src/stubs/react-native-assets-registry.ts` (deleted)
  - `scripts/setup.sh` (rewrote for Capacitor/Vite)
  - `.gitignore` (removed expo-cli generated section)
  - `packages/core/src/auth/DeviceFlowHandler.ts` (updated env var name in error message)
- **Learnings:**
  - `EXPO_PUBLIC_*` references exist in `docs/development/ENVIRONMENT.md` and `docs-site/` — these are documentation-only and out of scope for this config-focused US, but should be updated in a docs cleanup story
  - `README.md` still has a Coveralls badge and `.github/workflows/ci.yml` has Coveralls integration — removing those is CI pipeline work, not config cleanup
  - The `src/stubs/` directory became empty after deleting the only file, so the directory itself was removed
  - The `.env.example` Apple/Google store sections were Expo-specific (EAS build) and replaced with a simpler Capacitor config section
  - The `.gitignore` had an `@generated expo-cli` section with a sync hash — this is safe to remove since expo-cli is no longer used
---
