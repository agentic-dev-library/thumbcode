# ThumbCode Agent Playbook v2.0

> **For AI Agents Building ThumbCode**
> This document is the definitive reference for reproducing ThumbCode's visual identity.

---

## Brand Summary

**Product:** ThumbCode — Decentralized multi-agent mobile development platform
**Tagline:** "Code with your thumbs"
**Positioning:** Approachable innovation in a cold-blue developer tool landscape

### Brand Personality
- **Bold** — Not apologetic about being mobile-first
- **Technical** — Built by devs, for devs
- **Playful** — Thumbs up energy, not corporate sterility
- **Fast** — Ship it, iterate, move
- **Warm** — Human touch for an AI-powered tool

---

## Color System: P3 "Warm Technical"

### Why This Palette

Coral is virtually **unused in developer tools** but performs exceptionally well in app stores. Combined with deep teal, it creates sophisticated warmth that signals "coding doesn't have to feel clinical." This combination occupies **massive white space** in the market.

### Primary Colors

| Role | Name | Hex | RGB | HSL |
|------|------|-----|-----|-----|
| **Primary** | Thumb Coral | `#FF7059` | 255, 112, 89 | 8°, 100%, 67% |
| **Secondary** | Digital Teal | `#0D9488` | 13, 148, 136 | 175°, 84%, 32% |
| **Accent** | Soft Gold | `#F5D563` | 245, 213, 99 | 47°, 87%, 67% |
| **Base** | Charcoal Navy | `#151820` | 21, 24, 32 | 224°, 21%, 10% |

### Mode Variants

| Mode | Coral | Teal | Gold |
|------|-------|------|------|
| **Dark (default)** | #FF7059 | #0D9488 | #F5D563 |
| **Light** | #E85A4F | #0F766E | #D4A84B |
| **High Contrast** | #A33832 | #115E59 | #A16207 |

**Key insight:** Teal requires minimal adjustment across modes — it's the anchor color.

---

## Typography

### Font Stack

| Role | Font | Weight Range | Google Fonts |
|------|------|--------------|--------------|
| **Display** | Fraunces | 400-700 | `Fraunces:ital,opsz,wght,SOFT,WONK@0,9..144,100..900,0..100,0..1` |
| **Body** | Cabin | 400-700 | `Cabin:ital,wght@0,400..700;1,400..700` |
| **Code** | JetBrains Mono | 400-700 | `JetBrains+Mono:wght@400;500;600;700` |

### Why These Fonts

- **Fraunces:** Soft-serif with **"wonk" axis** that literally adds hand-drawn imperfection. Perfect semantic alignment with paint daubes.
- **Cabin:** Humanist sans with "organic, handcrafted feel" that differentiates from mechanical geometric sans-serifs.
- **JetBrains Mono:** IDE-optimized with ligatures and disambiguated characters.

### Type Scale (Mobile-First)

| Token | Size | Line Height | Weight | Family |
|-------|------|-------------|--------|--------|
| display | 32px | 40px | 700 | Fraunces |
| h1 | 24px | 32px | 600 | Fraunces |
| h2 | 20px | 28px | 500 | Fraunces |
| h3 | 18px | 26px | 500 | Fraunces |
| body | 16px | 24px | 400 | Cabin |
| caption | 14px | 20px | 400 | Cabin |
| code | 14px | 20px | 400 | JetBrains Mono |

**Scale factors:** 1.2× for tablet, 1.4× for desktop.

---

## Visual Language: Paint Daubes

### Philosophy

**Every dev tool uses gradients. Paint daubes are our anti-pattern.**

The daube concept connects to:
- Thumbprints (it's in the name)
- Finger painting (tactile touch)
- Human touch for an AI-powered tool (beautifully ironic)

### Implementation

Paint daubes are created with SVG filters using `feTurbulence` + `feDisplacementMap`:

```svg
<filter id="paint-daube" x="-20%" y="-20%" width="140%" height="140%">
  <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" seed="1" result="noise"/>
  <feDisplacementMap in="SourceGraphic" in2="noise" scale="8" xChannelSelector="R" yChannelSelector="G"/>
</filter>
```

**Critical:** Use fixed `seed` values for deterministic output. Same inputs = same outputs.

### Filter Variants

| Filter | baseFrequency | numOctaves | scale | Use Case |
|--------|---------------|------------|-------|----------|
| paint-daube | 0.04 | 3 | 8 | Standard organic shapes |
| paint-heavy | 0.02 | 4 | 15 | Bold, prominent elements |
| thumbprint | 0.015, 0.08 | 2 | 12 | Concentric fingerprint effect |
| organic-noise | 0.06 | 2 | 4 | Subtle texture overlay |

---

## Organic Shapes

### Blob Border Radius

Instead of perfect circles, use asymmetric 8-value border-radius:

```css
/* Organic blob shapes */
--radius-blob-1: 50px 45px 50px 48px / 26px 28px 26px 24px;
--radius-blob-2: 48px 52px 45px 50px / 24px 26px 28px 25px;
--radius-blob-3: 45px 48px 52px 46px / 28px 24px 26px 27px;
--radius-blob-4: 52px 46px 48px 50px / 25px 27px 24px 28px;

/* Card-specific */
--radius-card: 16px 14px 16px 15px / 14px 16px 14px 15px;

/* Button */
--radius-button: 50px 45px 50px 48px / 26px 28px 26px 24px;
```

### Organic Shadows

The **gradient killer** is layered box-shadows with brand color tints:

```css
/* Organic shadow - creates warm dimensional depth */
--shadow-organic-md: 
  0 2px 4px rgba(255, 112, 89, 0.1),   /* Coral tint */
  0 4px 8px rgba(13, 148, 136, 0.08),  /* Teal tint */
  0 8px 16px rgba(0, 0, 0, 0.06);      /* Depth */
```

This creates warm, dimensional depth that feels organic — brand colors bleed into shadows like watercolor.

### Organic Transforms

Apply subtle rotations to cards/buttons for handmade feel:

```css
.card:nth-child(odd)  { transform: rotate(-0.3deg); }
.card:nth-child(even) { transform: rotate(0.3deg); }
```

---

## Logo System

### Logo Mark Concept

The mark combines:
- **Code brackets `{ }`** — Developer identity
- **Thumbs-up gesture** — The vertical bar + brackets suggest a hand
- **Paint daube texture** — Applied via SVG filter

### Logo Variants

| Variant | Use Case | Mark Color | Wordmark Color | Background |
|---------|----------|------------|----------------|------------|
| **On Dark** | Primary | #FF7059 | #FFFFFF | #151820 |
| **On Light** | Light mode | #E85A4F | #151820 | #F8FAFC |
| **Monochrome** | Single color | #FFFFFF or #151820 | Same | Any |

### Clear Space

Minimum clear space = height of the "T" in ThumbCode wordmark.
Minimum logo size: 32px digital, 0.5 inch print.

### Logo Don'ts

- ❌ Never stretch or distort proportions
- ❌ Never add drop shadows or effects beyond daube filter
- ❌ Never use unapproved colors
- ❌ Never place on busy backgrounds
- ❌ Never rotate the logo
- ❌ Never outline the logo

---

## UI Components

### Buttons

**Primary Button:**
```css
.btn-primary {
  background: var(--color-coral-500);
  color: var(--color-charcoal);
  border-radius: var(--radius-button);
  padding: 12px 24px;
  font-weight: 600;
  box-shadow: var(--shadow-organic-sm);
}
.btn-primary:hover {
  background: var(--color-coral-400);
  transform: translateY(-2px);
}
.btn-primary:active {
  transform: translateY(1px) scale(0.98);
}
```

**Secondary Button:**
```css
.btn-secondary {
  background: transparent;
  color: var(--color-teal-600);
  border: 2px solid var(--color-teal-600);
  border-radius: var(--radius-button);
}
```

### Cards

```css
.card {
  background: var(--surface-elevated);
  border-radius: var(--radius-card);
  padding: 16px;
  box-shadow: var(--shadow-organic-md);
  transform: rotate(-0.3deg);
}
.card:nth-child(even) {
  transform: rotate(0.3deg);
}
```

### Inputs

```css
.input {
  background: var(--surface);
  border: 1px solid rgba(13, 148, 136, 0.3);
  border-radius: 12px;
  padding: 12px 16px;
}
.input:focus {
  border-color: var(--color-coral-500);
  box-shadow: 0 0 0 3px rgba(255, 112, 89, 0.2);
}
```

### Chat Bubbles

**User message (right-aligned):**
```css
.chat-user {
  background: rgba(13, 148, 136, 0.2);
  border-radius: 16px 16px 4px 16px;
  margin-left: auto;
}
```

**Agent message (left-aligned):**
```css
.chat-agent {
  background: var(--surface-elevated);
  border-radius: 16px 16px 16px 4px;
  border-left: 2px solid var(--color-coral-500);
}
```

---

## App Screens Reference

### Screen 1: Splash
- Charcoal background (#151820)
- Logo mark centered with paint daube filter
- "ThumbCode" wordmark in coral
- "Code with your thumbs" tagline in teal

### Screen 2: Onboarding
- "Direct a Team of AI Coders" headline (Fraunces)
- Multi-agent illustration
- Coral "Get Started" button

### Screen 3: API Key Entry
- "Connect to Claude" headline
- Input field with teal border
- "Continue" coral button
- Link to Anthropic console

### Screen 4: Home Dashboard
- Greeting with user name
- Agent status card (gold indicator when active)
- Recent projects list (cards)
- Bottom navigation: Home / Projects / Settings

### Screen 5: Workspace
- Project header with back button
- Tab bar: Files / Agents / Chat / Terminal
- Chat interface with user/agent bubbles
- Message input at bottom

### Screen 6: Agent Chat Detail
- Agent name and avatar
- Status indicator (working/idle/done)
- Code file creation indicators
- Approve / Edit action buttons

---

## Device Targets

| Device | Screen | Resolution | Scale |
|--------|--------|------------|-------|
| iPhone 16 Pro Max | 6.9" | 1320×2868 | 3× |
| Google Pixel 8a | 6.1" | 1080×2400 | 2.625× |
| OnePlus Open (folded) | 6.31" | 1116×2484 | 3.5× |
| OnePlus Open (unfolded) | 7.82" | 2268×2440 | 2.8× |
| iPad Pro 13" | 13" | 2064×2752 | 2× |

---

## Quick Reference

### Copy-Paste Values

```
Primary Coral:    #FF7059 / rgb(255,112,89) / hsl(8,100%,67%)
Secondary Teal:   #0D9488 / rgb(13,148,136) / hsl(175,84%,32%)
Accent Gold:      #F5D563 / rgb(245,213,99) / hsl(47,87%,67%)
Base Charcoal:    #151820 / rgb(21,24,32) / hsl(224,21%,10%)

Display Font:     Fraunces
Body Font:        Cabin
Code Font:        JetBrains Mono

Organic Blob:     50px 45px 50px 48px / 26px 28px 26px 24px
Focus Shadow:     0 0 0 3px rgba(255, 112, 89, 0.3)
```

### Google Fonts Import

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght,SOFT,WONK@0,9..144,100..900,0..100,0..1&family=Cabin:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
```

---

## Canva Assets

The following editable designs are available in Canva:

| Asset | Design ID | Purpose |
|-------|-----------|---------|
| Brand Guidelines | DAG-uj2pd5Y | 10-slide brand reference |
| UI Components | DAG-ugasO00 | 8-slide component specimens |
| App Screens | DAG-upr5FM8 | 8-slide iPhone mockups |
| Marketing Assets | DAG-ul4t5Gw | 6-slide App Store graphics |
| Social Template | DAG-us3kftE | Instagram announcement |

---

## Summary

ThumbCode's brand is defined by:

1. **Warm Technical** — Coral/Teal/Gold on charcoal
2. **Paint Daubes** — Organic textures via SVG filters
3. **Organic Typography** — Fraunces + Cabin
4. **Blob Shapes** — Asymmetric border-radius
5. **Layered Shadows** — Brand color tinted depth

Every element is **procedurally reproducible** with deterministic outputs.

---

*This document enables any AI agent to build ThumbCode-branded interfaces that are indistinguishable from human-designed ones.*
