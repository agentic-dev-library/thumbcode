# ThumbCode Brand Identity

> Last Updated: February 2026
> Source of truth for visual design decisions

## Brand Essence

**"Code with your thumbs."**

ThumbCode is the bridge between mobile-native creators and professional software development. We believe great code doesn't require a great desk.

### Personality Traits

- **Warm**: Approachable, friendly, human-centered
- **Technical**: Capable, precise, professional
- **Playful**: Creative, surprising, delightful
- **Empowering**: Enabling, supportive, confidence-building

### Voice

- Conversational, not corporate
- Clear, not dumbed-down
- Encouraging, not condescending
- Concise, not verbose

---

## Color Palette: P3 "Warm Technical"

The palette deliberately counters the cold blue/purple aesthetic that dominates developer tools. 65% of major IDEs use blue tones -- ThumbCode occupies the warm color white space.

### Primary Colors

| Role | Name | Hex | HSL | Usage |
|------|------|-----|-----|-------|
| **Primary** | Thumb Coral | `#FF7059` | `hsl(8, 100%, 67%)` | Logo, primary buttons, key accents |
| **Secondary** | Digital Teal | `#0D9488` | `hsl(175, 84%, 32%)` | Supporting elements, links, badges |
| **Accent** | Soft Gold | `#F5D563` | `hsl(47, 87%, 67%)` | Highlights, success states, active indicators |
| **Base Dark** | Charcoal Navy | `#151820` | `hsl(224, 21%, 10%)` | Dark mode backgrounds |
| **Base Light** | Off White | `#F8FAFC` | `hsl(210, 40%, 98%)` | Light mode backgrounds |

### Mode Variants

| Mode | Coral | Teal | Gold |
|------|-------|------|------|
| **Standard** | #FF7059 | #0D9488 | #F5D563 |
| **Light mode** | #E85A4F | #0F766E | #D4A84B |
| **High contrast** | #A33832 | #115E59 | #A16207 |

### Neutrals

| Token | Hex | Use |
|-------|-----|-----|
| neutral-50 | #F8FAFC | Light mode background |
| neutral-400 | #94A3B8 | Placeholder/muted text |
| neutral-700 | #334155 | Elevated surface |
| neutral-800 | #1E293B | Surface |
| neutral-900 | #0F172A | Deep background |

All color combinations maintain WCAG AA compliance (4.5:1 minimum contrast) across standard, high contrast, and reduced transparency modes.

---

## Typography

| Role | Font | Fallback | Usage |
|------|------|----------|-------|
| **Display** | Fraunces | Georgia, serif | Headlines, hero text, logo wordmark |
| **Body** | Cabin | system-ui, sans-serif | UI text, paragraphs, labels |
| **Code** | JetBrains Mono | monospace | Code blocks, terminal output, technical data |

### Why These Fonts

- **Fraunces**: Soft-serif with "wonk" optical axis for organic imperfection. Warm and distinctive.
- **Cabin**: Humanist sans-serif with handcrafted feel. Studies show humanist fonts outperform grotesques for glanceable reading -- crucial for mobile.
- **JetBrains Mono**: Best-in-class monospace for code. Retained from earliest design iterations.

### Google Fonts Import

```html
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght,SOFT,WONK@0,9..144,100..900,0..100,0..1&family=Cabin:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
```

---

## Organic Visual Language ("Paint Daubes")

ThumbCode uses organic, imperfect shapes -- NOT gradients. This is critical brand differentiation.

### The Philosophy

The "daube" (paint smear) aesthetic was a deliberate counter to AI-generated visual perfection. It connects to:
- The "thumb" concept (thumbprints, finger painting)
- Humanist imperfection in a world of AI precision
- 2025 design trends toward organic, hand-crafted aesthetics

### Asymmetric Border Radius

Instead of uniform rounded corners, intentionally uneven radii:

```css
/* Card */
border-radius: 1rem 0.75rem 1.25rem 0.5rem;

/* Button */
border-radius: 0.5rem 0.75rem 0.625rem 0.875rem;

/* Badge */
border-radius: 0.375rem 0.5rem 0.625rem 0.25rem;

/* Input */
border-radius: 0.5rem 0.625rem 0.5rem 0.75rem;
```

### Organic Shadows

Multi-layered shadows with brand color tints:

```css
/* Card shadow */
box-shadow:
  2px 4px 8px -2px rgb(0 0 0 / 0.08),
  -1px 2px 4px -1px rgb(0 0 0 / 0.04);

/* Elevated shadow */
box-shadow:
  4px 8px 16px -4px rgb(0 0 0 / 0.12),
  -2px 4px 8px -2px rgb(0 0 0 / 0.06);
```

### Subtle Rotation

Cards and interactive elements use subtle rotation transforms:

```css
.card { transform: rotate(-0.3deg); }
.card:nth-child(even) { transform: rotate(0.3deg); }
```

### Rules

**DO:**
- Use asymmetric border-radius
- Add subtle rotation to cards
- Use multi-layered organic shadows with color tints
- Apply SVG feTurbulence filters for paint texture effects

**DON'T:**
- Use linear or radial gradients for backgrounds
- Use perfectly rounded corners (border-radius: 8px)
- Use flat, sterile UI patterns

---

## Logo

### Logo Mark
- Paint-daub shape suggesting a thumbprint
- Primary coral color (#F28B79)
- Asymmetric border radius

### Wordmark
- "ThumbCode" in Fraunces Bold
- Can be in primary coral or neutral-900 depending on background

### Logo Files
- Full logos: `public/assets/logos/full/` (4 variants: transparent, light, dark, monochrome)
- Mark only: `public/assets/logos/mark/` (2 variants)
- App icons: `public/assets/icons/app/`

---

## Iconography

### In-App Icons (PaintDaube)

ThumbCode uses a procedural "Paint Daube" SVG icon system (`src/components/icons/`) matching the brand's organic aesthetic.

- Do not ship emoji/unicode glyphs as icons in production UI
- Prefer paint-daube icons for app UI consistency
- Lucide React is available for secondary use (docs, utilities)

---

## Design Tokens

### Source of Truth

1. `design-system/tokens.json` -- canonical JSON token file
2. `tailwind.config.ts` -- Tailwind integration
3. `CLAUDE.md` -- brand constraints for AI agents

### Token Categories

- Colors (brand, neutral, semantic)
- Typography (font families, sizes, weights, line heights)
- Spacing (4px base scale)
- Border radius (organic variants)
- Shadows (organic variants)
- Animation (timing, easing)

### Programmatic Access

```typescript
import { getColor, getSpacing, getFontFamily } from '@/utils/design-tokens';

const primary = getColor('coral', '500');    // #FF7059
const space = getSpacing('4');               // 16px
const font = getFontFamily('display');       // Fraunces, Georgia, serif
```

---

## Design History

The design system evolved through 6 phases:

1. **Phase 1**: Space Grotesk / Electric Violet -- standard tech aesthetic (rejected: too similar to Cursor/VS Code)
2. **Phase 2**: Color research -- mapped competitive landscape, found 65% of IDEs use blue
3. **Phase 3**: Four palette candidates evaluated (P1 Refined, P2 Bold, P3 Warm Technical, P4 Fresh)
4. **Phase 4**: **P3 "Warm Technical" selected** -- Coral/Teal/Gold on Charcoal
5. **Phase 5**: "Daube revolution" -- replaced all gradients with organic paint-daub shapes
6. **Phase 6**: Typography refined -- Fraunces/Cabin replaced Space Grotesk/Inter

See `docs/architecture/decisions.md` for current decision records including migration history.
