# Design System Governance (1.0)

ThumbCode’s design system exists to keep the product **warm, technical, and consistent**, even when many agents contribute in parallel.

This document defines the **rules, sources of truth, and review gates** for UI work.

---

## Sources of Truth (in priority order)

1. **`/workspace/CLAUDE.md`**
   - Brand constraints (no gradients, P3 palette, typography, organic shapes)
2. **Design tokens**: `design-system/tokens.json`
   - Canonical colors/spacing/typography values
3. **Tailwind config**: `tailwind.config.ts`
   - Derived token mappings for NativeWind
4. **Organic styles**:
   - App: `src/lib/organic-styles.ts`
   - Shared UI package: `packages/ui/src/theme/organicStyles.ts`

If these disagree, fix the disagreement — don’t “pick one” ad hoc.

---

## Non-Negotiable Rules

### Colors
- **No hardcoded hex** in app UI/components (except token sources, tests, or icon generation).
- Use `getColor()` / `getColorWithOpacity()` (app) or `themeTokens` (shared UI package).

### Shapes
- No perfectly rounded “generic” corners for major surfaces.
- Use organic radii via `organicBorderRadius.*`.
- True circles are allowed **only** when functionally required (e.g., avatar, radio dot).

### Shadows
- Use organic shadows via `organicShadow.*` (RN style objects), not random `shadow*` values.
- Avoid web-only utilities that don’t map cleanly to RN.

### Iconography
- **No emoji/unicode glyph icons** in production UI.
- App icons must come from `src/components/icons/` (PaintDaube) unless a migration plan introduces a semantic wrapper.

### Typography
- Use the system’s font families:
  - Display: Fraunces
  - Body: Cabin
  - Mono: JetBrains Mono

### “Demo Mode”
- No demo-mode paths for production 1.0. If a feature can’t ship, it must be implemented — not simulated.

---

## Component Ownership & DRY Policy

### Where components live
- **Reusable primitives**: `packages/ui`
- **App-specific composites**: `src/components/**`
- **Screens**: `app/**`

If you’re building something reusable, default to `packages/ui` first.

---

## Review Gates (must pass for UI work)

### 1) Token compliance
- No new hardcoded colors
- No ad-hoc radii

### 2) Accessibility baseline
- Labels for inputs
- Minimum hit targets (44x44)
- Screen reader-friendly semantics
- Contrast checks for text on background

### 3) Dark/light mode
- Screens must render in both modes, even if dark is primary

### 4) Performance sanity
- Avoid unnecessary re-renders in lists (memoize rows, stable callbacks)

---

## PR Checklist (copy/paste)

- [ ] Uses design tokens for colors (no hex)
- [ ] Uses organic radii (`organicBorderRadius`)
- [ ] Uses organic shadows where needed (`organicShadow`)
- [ ] No emoji/unicode glyph icons
- [ ] Accessible labels and touch targets
- [ ] Lint passes
- [ ] Tests pass

