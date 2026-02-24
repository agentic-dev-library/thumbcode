# CLAUDE.md — ThumbCode Agent Playbook

> **You are building ThumbCode.** This document is your institutional memory, style guide, and operating manual. Read it completely before generating any code.

---

## Project Identity

**ThumbCode** is a decentralized multi-agent mobile development platform.

- **Tagline**: "Code with your thumbs"
- **Mission**: Enable anyone to ship mobile apps by directing AI agents from their phone
- **Philosophy**: Mobile-first, BYOK (Bring Your Own Keys), zero server dependency

### Core Value Proposition

Users bring their own API keys (Anthropic, OpenAI, GitHub). They direct a team of specialized AI agents — Architect, Implementer, Reviewer, Tester — from their phone. The agents build, commit, push, and deploy. The user reviews and approves. No laptop required.

---

## Brand Identity: P3 "Warm Technical"

ThumbCode uses a distinctive warm color palette that differentiates from the cold blue/purple tech aesthetic. Every design decision should feel **technical but approachable**, like a trusted tool that's also a friend.

### Colors (NEVER deviate)

| Role | Name | Hex | HSL | Usage |
|------|------|-----|-----|-------|
| **Primary** | Thumb Coral | `#FF7059` | `hsl(8, 100%, 67%)` | Logo, primary buttons, key accents |
| **Secondary** | Digital Teal | `#0D9488` | `hsl(175, 84%, 32%)` | Supporting elements, secondary actions, links |
| **Accent** | Soft Gold | `#F5D563` | `hsl(47, 87%, 67%)` | Highlights, success states, active indicators |
| **Base Dark** | Charcoal Navy | `#151820` | `hsl(224, 21%, 10%)` | Dark mode backgrounds |
| **Base Light** | Off White | `#F8FAFC` | `hsl(210, 40%, 98%)` | Light mode backgrounds |

**Mode Variants:**
- Light mode: Coral → `#E85A4F`, Teal → `#0F766E`, Gold → `#D4A84B`
- High contrast: Coral → `#A33832`, Teal → `#115E59`, Gold → `#A16207`

### Typography (ALWAYS use these)

| Role | Font | Fallback | Usage |
|------|------|----------|-------|
| **Display** | Fraunces | Georgia, serif | Headlines, hero text, logo wordmark |
| **Body** | Cabin | system-ui, sans-serif | UI text, paragraphs, labels |
| **Code** | JetBrains Mono | monospace | Code blocks, terminal output, technical data |

**Google Fonts import:**
```html
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght,SOFT,WONK@0,9..144,100..900,0..100,0..1&family=Cabin:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
```

### Visual Style: Organic Paint Daubes

ThumbCode uses **organic, imperfect shapes** — NOT gradients. This is critical brand differentiation.

**DO:**
- Use asymmetric border-radius: `border-radius: 50px 45px 50px 48px / 26px 28px 26px 24px;`
- Add subtle rotation to cards: `transform: rotate(-0.3deg);`
- Use multi-layered organic shadows with color tints
- Apply SVG `feTurbulence` filters for paint texture effects

**DON'T:**
- Use linear or radial gradients for backgrounds
- Use perfectly rounded corners (border-radius: 8px)
- Use flat, sterile UI patterns
- Copy Material Design or iOS Human Interface Guidelines literally

### CSS Organic Patterns

```css
/* Organic button shape */
.btn-organic {
  border-radius: 50px 45px 50px 48px / 26px 28px 26px 24px;
  box-shadow: 
    0 4px 12px rgba(255, 112, 89, 0.3),
    0 1px 3px rgba(0, 0, 0, 0.1);
}

/* Organic card with tilt */
.card-organic {
  border-radius: 20px 18px 22px 16px / 16px 20px 18px 22px;
  transform: rotate(-0.3deg);
}
.card-organic:nth-child(even) {
  transform: rotate(0.3deg);
}

/* Organic shadow with brand color tint */
.shadow-organic {
  box-shadow:
    0 2px 4px rgba(13, 148, 136, 0.08),
    0 8px 24px rgba(21, 24, 32, 0.12),
    0 1px 2px rgba(0, 0, 0, 0.04);
}
```

---

## Technical Architecture

### Stack

| Layer | Technology | Why |
|-------|------------|-----|
| **Framework** | React 18 + Vite 7 | Fast builds, modern ESM, excellent DX |
| **Native** | Capacitor 8 | Web-first with native iOS/Android access |
| **Styling** | Tailwind CSS | Agents excel at Tailwind patterns |
| **Components** | src/ui/ | In-house design system with organic styling |
| **Navigation** | react-router-dom 7 | Client-side routing, nested layouts |
| **Credentials** | capacitor-secure-storage-plugin | iOS Keychain / Android Keystore |
| **Git** | isomorphic-git | Client-side operations |
| **State** | Zustand 5 | Lightweight, slice-based stores |
| **Auth** | GitHub Device Flow + PKCE | No backend required |
| **Structure** | Flat src/ | All code under src/ with @/* path aliases |

### File Structure

```
src/
├── pages/                  # react-router-dom pages
│   ├── tabs/              # Tab navigation group
│   ├── detail/            # Entity detail pages
│   ├── onboarding/        # Onboarding flow
│   └── settings/          # Settings sub-pages
├── components/
│   ├── ui/                # Re-exports from src/ui/
│   ├── agents/            # Agent-related components
│   ├── chat/              # Chat components
│   └── project/           # Project components
├── hooks/                 # Custom React hooks
├── layouts/               # Layout components (RootLayout)
├── contexts/              # React context providers
├── services/              # Service layer
│   ├── ai/               # AI client factory, provider adapters
│   ├── agents/            # Specialized agent implementations
│   ├── chat/              # Chat service, streaming, message store
│   ├── mcp/               # MCP client and tool bridge
│   ├── orchestrator/      # Multi-agent coordination
│   ├── routing/           # Capability-aware agent routing
│   ├── skills/            # Agent skill definitions
│   └── tools/             # Tool execution bridge
├── config/                # Environment config, feature flags, constants
├── core/                  # Git operations, credentials, auth, security
├── state/                 # Zustand stores (chat, agent, project, etc.)
├── types/                 # Shared TypeScript type definitions
├── ui/                    # Design system (primitives, layout, form, feedback)
├── lib/                   # Utilities and helpers
└── utils/                 # Additional utilities
tools/                      # Build-time scripts (token/icon generators)
```

### Naming Conventions

- **Files**: kebab-case (`agent-card.tsx`, `use-workspace.ts`)
- **Components**: PascalCase (`AgentCard`, `WorkspaceProvider`)
- **Functions**: camelCase (`createAgent`, `fetchProjectData`)
- **Constants**: SCREAMING_SNAKE (`API_BASE_URL`, `MAX_AGENTS`)
- **CSS classes**: Use Tailwind utilities, custom classes in kebab-case

---

## Agent Coordination

See **AGENTS.md** for the full multi-agent workflow, tool definitions, and orchestration protocol.

ThumbCode is built BY agents FOR agents. When generating code:

### Before Writing Code

1. **Check design tokens** — Use values from `design-system/tokens.json`
2. **Follow file structure** — Put files where they belong
3. **Use existing components** — Check `/src/components/` first
4. **Match the style** — Organic daubes, not gradients

### Code Style

```typescript
// ✅ GOOD: Uses design tokens, organic styling, proper typing
import { colors, typography } from '@/tokens';

interface AgentCardProps {
  agent: Agent;
  onSelect: (id: string) => void;
}

export function AgentCard({ agent, onSelect }: AgentCardProps) {
  return (
    <button
      onClick={() => onSelect(agent.id)}
      className="bg-surface-elevated p-4 shadow-organic text-left"
      style={{ borderRadius: '20px 18px 22px 16px / 16px 20px 18px 22px', transform: 'rotate(-0.3deg)' }}
    >
      <span className="block font-display text-coral-500">{agent.name}</span>
      <span className="block font-body text-neutral-400">{agent.status}</span>
    </button>
  );
}

// ❌ BAD: Hardcoded colors, generic styling, no types
export function AgentCard({ agent, onSelect }) {
  return (
    <div 
      onClick={() => onSelect(agent.id)}
      style={{ background: '#333', padding: 16, borderRadius: 8 }}
    >
      <span style={{ color: 'blue' }}>{agent.name}</span>
    </div>
  );
}
```

### Commit Messages

Follow Conventional Commits:
```
feat(agents): add multi-agent workspace view
fix(auth): resolve GitHub PKCE token refresh
docs(readme): update installation instructions
style(buttons): apply organic border-radius
refactor(stores): migrate to Zustand v5
```

---

## Memory Bank

Institutional memory lives in `docs/memory-bank/`. Read these before proposing changes:

- **systemPatterns.md** — Architecture overview, data flow, package graph
- **productContext.md** — Product vision, BYOK model, UX goals
- **techContext.md** — Current tech stack and build pipeline
- **activeContext.md** — Current sprint focus and recent changes

See also: `docs/development/`, `docs/architecture/`, `docs/brand/` for deeper reference.

---

## Key Decisions Summary

| Decision | Choice | Why |
|----------|--------|-----|
| Web framework | React 18 + Vite 7 | Fast builds, modern ESM, excellent DX |
| Native wrapper | Capacitor 8 | Web-first with native iOS/Android access |
| Routing | react-router-dom 7 | Client-side, nested layouts |
| State | Zustand 5 | Lightweight, slice-based stores |
| Color palette | Coral/Teal/Gold on Charcoal | Differentiates from blue tech aesthetic |
| Visual style | Organic daubes | Counters AI-generated perfection trend |
| Typography | Fraunces + Cabin | Warm humanist feel, not cold geometric |
| Auth model | BYOK with Device Flow | Zero server cost, user owns credentials |
| Multi-agent | Git worktrees | Better than CRDTs for AI agents |
| Structure | Flat src/ with @/* aliases | No workspace overhead, single lint/typecheck |

---

## Anti-Patterns (NEVER do these)

1. **Never use gradients** for backgrounds or buttons
2. **Never use Inter, Roboto, or system fonts** — we use Fraunces/Cabin
3. **Never hardcode colors** — always reference tokens
4. **Never use perfectly rounded corners** — always organic
5. **Never add server dependencies** — everything client-side
6. **Never store API keys in code** — use capacitor-secure-storage-plugin
7. **Never ignore accessibility** — maintain WCAG AA contrast

---

## Quick Reference

### Tailwind Custom Classes

```javascript
// tailwind.config.ts extensions
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

### Component Checklist

Before submitting any component:
- [ ] Uses design tokens (no hardcoded values)
- [ ] Has TypeScript types/interfaces
- [ ] Follows organic styling conventions
- [ ] Includes accessibility attributes
- [ ] Works in dark AND light mode
- [ ] Has proper loading/error states

---

## Contact & Resources

- **Canva Brand Kit**: `kAG-uqPJ8gk`
- **Netlify Team**: `jbdevprimary` (ThumbCode)
- **Domain targets**: thumbcode.app, thumbcode.dev

**This document is the source of truth. When in doubt, follow CLAUDE.md.**
