# Design System Governance (1.0)

ThumbCode's design system exists to keep the product **warm, technical, and consistent**, even when many agents contribute in parallel.

This document defines the **rules, sources of truth, and review gates** for UI work.

---

## Sources of Truth (in priority order)

1. **`CLAUDE.md`** (project root)
   - Brand constraints (no gradients, P3 palette, typography, organic shapes)
2. **Design tokens**: `design-system/tokens.json`
   - Canonical colors/spacing/typography values
3. **Tailwind config**: `tailwind.config.ts`
   - Derived token mappings for Tailwind CSS
4. **Organic styles**: `src/lib/organic-styles.ts`
   - Reusable organic border-radius and shadow presets

If these disagree, fix the disagreement — don't "pick one" ad hoc.

---

## Non-Negotiable Rules

### Colors
- **No hardcoded hex** in app UI/components (except token sources, tests, or icon generation).
- Use Tailwind utility classes (`text-coral-500`, `bg-teal-600`) or `getColor()` / `getColorWithOpacity()` from design tokens.

### Shapes
- No perfectly rounded "generic" corners for major surfaces.
- Use organic radii via `organicBorderRadius.*` or Tailwind organic classes.
- True circles are allowed **only** when functionally required (e.g., avatar, radio dot).

### Shadows
- Use organic shadows via `organicShadow.*` or Tailwind shadow utilities.
- Avoid arbitrary shadow values that don't follow the brand pattern.

### Iconography
- **No emoji/unicode glyph icons** in production UI.
- App icons must come from Lucide React (`lucide-react`).

### Typography
- Use the system's font families:
  - Display: Fraunces
  - Body: Cabin
  - Mono: JetBrains Mono

### "Demo Mode"
- No demo-mode paths for production 1.0. If a feature can't ship, it must be implemented — not simulated.

---

## Component Ownership & DRY Policy

### Where components live
- **Design system primitives**: `src/ui/` (Box, Text, Button, Card, Input, etc.)
- **App-specific composites**: `src/components/**`
- **Pages**: `src/pages/**`

If you're building something reusable, default to `src/ui/` first.

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
- [ ] Lint passes (`pnpm lint`)
- [ ] Tests pass (`pnpm test`)
