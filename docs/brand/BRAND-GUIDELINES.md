# ThumbCode Brand Guidelines

> **Code with your thumbs.** — The tagline that captures our mission.

## Brand Essence

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

## Visual Identity

### Color Palette

Our **P3 “Warm Technical”** palette combines organic warmth with professional capability.

**Source of truth**:
- Design tokens: `design-system/tokens.json`
- Agent playbook: `CLAUDE.md`
- Tailwind: `tailwind.config.ts`

#### Primary: Coral
The color of human connection and creative energy.

| Token | Hex | Use |
|-------|-----|-----|
| coral-500 | #FF7059 | Primary CTAs, key accents |
| coral-600 | #E85A4F | Light mode variant / pressed |
| coral-800 | #A33832 | High-contrast variant |

#### Secondary: Deep Teal
The color of depth, trust, and technical capability.

| Token | Hex | Use |
|-------|-----|-----|
| teal-600 | #0D9488 | Primary secondary, links, badges |
| teal-500 | #14B8A6 | Supporting elements |
| teal-800 | #115E59 | High-contrast variant |

#### Accent: Soft Gold
The color of achievement, warmth, and highlight.

| Token | Hex | Use |
|-------|-----|-----|
| gold-400 | #F5D563 | Highlights, warning/success emphasis |
| gold-600 | #D4A84B | Light mode variant |
| gold-700 | #A16207 | High-contrast variant |

#### Base + Neutrals
We ship **dark mode first** with a charcoal base and tokenized neutrals.

| Token | Hex | Use |
|-------|-----|-----|
| charcoal | #151820 | Dark mode background |
| neutral-50 | #F8FAFC | Light mode background |
| neutral-400 | #94A3B8 | Placeholder/muted text |
| neutral-700 | #334155 | Elevated surface |
| neutral-800 | #1E293B | Surface |
| neutral-900 | #0F172A | Deep background |

---

### Typography

#### Display: Fraunces
Used for headlines, hero text, and brand moments.
- Weight: 600-700 for headlines
- Style: Can use italics for emphasis
- Character: Warm, approachable, distinctive

```css
font-family: 'Fraunces', serif;
```

#### Body: Cabin
Used for body text, UI labels, and general content.
- Weight: 400 for body, 500-600 for emphasis
- Character: Clear, readable, friendly

```css
font-family: 'Cabin', sans-serif;
```

#### Mono: JetBrains Mono
Used for code, technical content, and data.
- Weight: 400-500
- Character: Technical, precise, readable

```css
font-family: 'JetBrains Mono', monospace;
```

---

### Organic Visual Language

ThumbCode uses a "paint daub" aesthetic — organic, hand-crafted, imperfect in a beautiful way.

#### Asymmetric Border Radius
Instead of uniform rounded corners, we use intentionally uneven radii:

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

#### Organic Shadows
Shadows that feel hand-painted, not digitally perfect:

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

---

### Logo

The ThumbCode logo combines a thumbprint-inspired mark with our wordmark.

#### Logo Mark
- Paint-daub shape suggesting a thumbprint
- Primary coral color (#F28B79)
- Asymmetric border radius

#### Wordmark
- "ThumbCode" in Fraunces Bold
- Can be in primary coral or neutral-900 depending on background

#### Clear Space
Maintain padding equal to the height of the "T" around all sides.

#### Minimum Size
- Digital: 24px height minimum
- Print: 0.5" height minimum

---

### Iconography

Icons should feel organic and friendly, not rigid.

#### Style Guidelines
- Rounded corners (2px stroke radius)
- 1.5-2px stroke weight
- Filled variants for emphasis
- Can use brand colors for accent

#### In-App Icon System (Source of Truth)
ThumbCode uses a **procedural “Paint Daube” SVG icon system** in `src/components/icons/` to match the brand’s organic aesthetic.

**Rules:**
- Do not ship emoji/unicode glyphs as icons in production UI.
- Prefer paint-daube icons for app UI consistency.
- If a future migration to Lucide happens, it must be done behind a single semantic wrapper (so screens don’t import raw icon libraries).

#### Icon Consistency
- All icons use Lucide React (`lucide-react`) across the application.

---

### Photography & Imagery

#### Style
- Warm color grading
- Natural lighting
- Real people in real contexts
- Mobile devices prominently featured
- Candid over posed

#### Avoid
- Cold, blue-tinted images
- Stock photo aesthetics
- Overly corporate settings
- Desktop-only contexts

---

### Motion & Animation

#### Principles
- Purposeful, not decorative
- Quick and responsive (150-300ms)
- Organic easing (ease-out for entrances, ease-in for exits)
- Subtle bounce for delight

#### Timing
- Fast: 150ms (micro-interactions)
- Normal: 300ms (transitions)
- Slow: 500ms (page transitions)

#### Easing
```css
/* Standard */
transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);

/* Bounce */
transition-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1);
```

---

## Writing Guidelines

### Headlines
- Use Fraunces
- Sentence case (not Title Case)
- Active voice
- Under 8 words ideal

**Good**: "Code with your thumbs"  
**Bad**: "The Revolutionary Mobile Development Platform"

### Body Copy
- Use Cabin
- Short paragraphs (2-3 sentences)
- Active voice
- Second person ("you") for user-facing content

### Technical Writing
- Use JetBrains Mono for code
- Include code examples
- Be precise but not verbose
- Define acronyms on first use

### Error Messages
- Be helpful, not blaming
- Suggest next steps
- Keep technical details optional

**Good**: "Couldn't connect to GitHub. Check your network and try again."  
**Bad**: "Error: ENOTFOUND github.com"

---

## Usage Examples

### Do's
- ✅ Use warm coral for primary CTAs
- ✅ Apply organic border radius to cards
- ✅ Use Fraunces for headlines
- ✅ Keep generous whitespace
- ✅ Write in active voice

### Don'ts
- ❌ Use cold blue as a primary color
- ❌ Apply uniform border radius
- ❌ Use system fonts
- ❌ Crowd the interface
- ❌ Write in passive voice

---

## Asset Downloads

- Logo files: `assets/logo/`
- Color swatches: `design-system/tokens.json`
- Font files: Google Fonts links in `index.html`
- Icon set: Lucide React

---

*These guidelines ensure ThumbCode maintains a consistent, recognizable, and delightful brand experience across all touchpoints.*
