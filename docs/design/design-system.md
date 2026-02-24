# ThumbCode Design System

> Last Updated: February 2026
> Implementation guide for the P3 "Warm Technical" design system

## Sources of Truth (Priority Order)

1. **`CLAUDE.md`** -- Brand constraints (no gradients, P3 palette, typography, organic shapes)
2. **`design-system/tokens.json`** -- Canonical color/spacing/typography values
3. **`tailwind.config.ts`** -- Derived token mappings for Tailwind CSS
4. **`src/ui/`** -- Canonical component library

If these disagree, fix the disagreement -- don't pick one ad hoc.

## Component Architecture

### Layer 1: src/ui/ (Canonical Primitives)

Location: `src/ui/`

| Category | Components |
|----------|------------|
| **Primitives** | Box, Text, Button, Card, Input, Image |
| **Layout** | ScrollArea, List |
| **Form** | Switch |
| **Feedback** | Spinner, Alert |
| **Theme** | ThemeProvider, useTheme |

### Layer 2: src/components/ui/ (App Re-exports)

Location: `src/components/ui/`

Thin re-exports from src/ui/. App code imports from here.

### Layer 3: src/components/{domain}/ (Composed Components)

Location: `src/components/agents/`, `src/components/chat/`, `src/components/project/`

Domain-specific components that compose primitives from Layer 1/2.

### Layer 4: src/pages/ (Page Composition)

Pages are thin composition layers that import hooks for logic and components for rendering. TSX should be design-only; logic lives in hooks.

## Tailwind Configuration

### Brand Colors

```javascript
// tailwind.config.ts
colors: {
  coral: { 500: '#FF7059', 600: '#E85A4F', 800: '#A33832' },
  teal: { 500: '#14B8A6', 600: '#0D9488', 800: '#115E59' },
  gold: { 400: '#F5D563', 600: '#D4A84B', 700: '#A16207' },
  charcoal: '#151820',
  surface: { DEFAULT: '#1E293B', elevated: '#334155' },
}

fontFamily: {
  display: ['Fraunces', 'Georgia', 'serif'],
  body: ['Cabin', 'system-ui', 'sans-serif'],
  mono: ['JetBrains Mono', 'monospace'],
}
```

### Organic Classes

```javascript
// Custom Tailwind utilities for organic styling
borderRadius: {
  'organic-card': '1rem 0.75rem 1.25rem 0.5rem',
  'organic-button': '0.5rem 0.75rem 0.625rem 0.875rem',
  'organic-badge': '0.375rem 0.5rem 0.625rem 0.25rem',
  'organic-input': '0.5rem 0.625rem 0.5rem 0.75rem',
}
```

## Non-Negotiable Rules

### Colors
- **No hardcoded hex** in app UI/components (except token sources, tests, icon generation)
- Use design tokens via Tailwind classes or `getColor()` utility

### Shapes
- No perfectly rounded generic corners for major surfaces
- Use organic border radii (`rounded-organic-card`, etc.)
- True circles allowed ONLY when functionally required (avatar, radio dot)

### Shadows
- Use organic shadows, not random shadow values
- Shadows should have brand color tints

### Iconography
- No emoji/unicode glyph icons in production UI
- App icons from `src/components/icons/` (PaintDaube system)

### Typography
- Display: Fraunces (headlines, hero text)
- Body: Cabin (UI text, paragraphs)
- Mono: JetBrains Mono (code, technical data)
- Never use Inter, Roboto, or system fonts as primary

### Gradients
- **Never use gradients** for backgrounds or buttons
- Use solid colors, textures, and organic shadows instead

## Component Checklist

Before submitting any component:

- [ ] Uses design tokens (no hardcoded color values)
- [ ] Has TypeScript types/interfaces
- [ ] Follows organic styling conventions (asymmetric radii)
- [ ] Includes accessibility attributes (labels, hit targets 44x44)
- [ ] Works in dark AND light mode
- [ ] Has proper loading/error states
- [ ] Uses Tailwind classes only (no inline JS style objects for organic patterns)

## PR Review Gates

### 1. Token compliance
- No new hardcoded colors
- No ad-hoc border radii

### 2. Accessibility baseline
- Labels for inputs
- Minimum hit targets (44x44)
- Screen reader-friendly semantics
- Contrast checks for text on background (WCAG AA)

### 3. Dark/light mode
- Screens must render in both modes

### 4. Performance sanity
- Avoid unnecessary re-renders in lists (memoize rows, stable callbacks)
