# DECISIONS.md — Key Decisions Registry

> Every significant decision in ThumbCode is recorded here with rationale. Before proposing changes, check if it was already decided.

---

## Decision Format

```
## D-XXX: [Title]

**Date**: YYYY-MM-DD
**Status**: ACCEPTED | SUPERSEDED | DEPRECATED
**Supersedes**: D-XXX (if applicable)

### Context
What prompted this decision?

### Options Considered
1. Option A — pros/cons
2. Option B — pros/cons

### Decision
What we chose and why.

### Consequences
What this means going forward.
```

---

## Foundational Decisions

### D-001: Mobile Framework Selection

**Date**: 2026-01-17
**Status**: ACCEPTED

#### Context
ThumbCode is built entirely by AI agents. The framework must optimize for agent code generation quality, not human DX.

#### Options Considered

1. **React Native + Expo**
   - ✅ TypeScript has largest LLM training corpus
   - ✅ Expo patterns highly predictable
   - ✅ 40K+ GitHub stars = extensive examples
   - ✅ Official Expo MCP Server exists
   - ❌ React Native specific quirks

2. **Flutter**
   - ✅ Excellent headless testing
   - ✅ Good Dart code generation
   - ❌ Smaller training corpus (Dart)
   - ❌ Verbose widget trees

3. **Capacitor/Ionic**
   - ✅ Web skills transfer
   - ❌ Performance issues for animations
   - ❌ Hybrid limitations

4. **Tauri Mobile**
   - ❌ Multi-language (Rust + Swift + Kotlin)
   - ❌ Limited training data for mobile
   - ❌ Too new

#### Decision
**React Native + Expo SDK 52+** with expo-router for navigation.

#### Consequences
- All code in TypeScript
- Use NativeWind for styling (Tailwind)
- Agent code generation reliability maximized
- Can leverage extensive React training data

---

### D-002: Product Name

**Date**: 2026-01-17
**Status**: ACCEPTED

#### Context
Need a memorable, defensible name with available domains and no trademark conflicts.

#### Options Considered

| Name | Domains | Trademark | Verdict |
|------|---------|-----------|---------|
| VibeCode | ❌ Taken | — | Rejected |
| CodePocket | ❌ Taken | — | Rejected |
| Codelet | ❌ Taken | — | Rejected |
| Conductor | ❌ Mixed | ⚠️ Conflicts | Rejected |
| ThumbCode | ✅ All available | ✅ Clear | **Selected** |

#### Decision
**ThumbCode** — "Code with your thumbs"

#### Consequences
- Domains to acquire: thumbcode.app, thumbcode.dev, thumbcode.ai
- Social handles to claim: @thumbcode
- Tagline locked: "Code with your thumbs"
- Mobile-first positioning reinforced

---

### D-003: Color Palette Selection

**Date**: 2026-01-17
**Status**: ACCEPTED

#### Context
65% of dev tools use blue tones. Need differentiation while maintaining technical credibility.

#### Options Considered

1. **P1 — Refined Evolution**: Warm Violet + Ocean Teal + Signal Coral
   - Risk: Still in violet territory (Cursor-adjacent)

2. **P2 — Bold Disruptor**: Electric Lime + Deep Violet
   - Risk: Too aggressive, accessibility concerns

3. **P3 — Warm Technical**: Coral + Deep Teal + Soft Gold
   - ✅ Unique in space
   - ✅ Warm but professional
   - ✅ Excellent accessibility scores

4. **P4 — Fresh Disruption**: Electric Mint + Hot Magenta + Soft Lavender
   - Risk: Too playful, signals "toy"

#### Decision
**P3 "Warm Technical"**

| Role | Name | Hex |
|------|------|-----|
| Primary | Thumb Coral | #FF7059 |
| Secondary | Digital Teal | #0D9488 |
| Accent | Soft Gold | #F5D563 |
| Base | Charcoal Navy | #151820 |

#### Consequences
- All UI must use these colors exclusively
- Mode variants defined for light/dark/high-contrast
- Differentiates from blue-heavy competitor space

---

### D-004: Visual Style — Daubes Over Gradients

**Date**: 2026-01-17
**Status**: ACCEPTED

#### Context
Gradients are ubiquitous in tech. Need distinctive visual language that connects to "thumb" concept.

#### Options Considered

1. **Standard gradients**
   - ❌ Generic, looks like every other app

2. **Flat solid colors**
   - ❌ Boring, lacks personality

3. **Organic paint daubes**
   - ✅ Unique, memorable
   - ✅ Connects to thumbprint/finger painting
   - ✅ 2025 trend toward imperfection
   - ✅ Counter-positions against AI-generated perfection

#### Decision
**Organic paint daubes** — NO gradients anywhere in the brand.

Implementation:
- SVG `feTurbulence` + `feDisplacementMap` filters
- Asymmetric border-radius: `50px 45px 50px 48px / 26px 28px 26px 24px`
- Subtle rotation transforms: `rotate(-0.3deg)`
- Multi-layered shadows with brand color tints

#### Consequences
- NEVER use linear/radial gradients
- All buttons, cards, containers use organic shapes
- SVG filters required for paint texture effects
- CSS3 organic system for NativeWind compatibility

---

### D-005: Typography System

**Date**: 2026-01-17
**Status**: ACCEPTED
**Supersedes**: Initial system using Space Grotesk/Inter

#### Context
Initial typography (Space Grotesk, Inter) was too cold and generic. Needed fonts that feel warm and humanist to match daube aesthetic.

#### Options Considered

1. **Keep Space Grotesk / Inter**
   - ❌ Cold, geometric
   - ❌ Conflicts with organic visual style

2. **Fraunces + Cabin + JetBrains Mono**
   - ✅ Fraunces: Soft-serif with "wonk" axis
   - ✅ Cabin: Humanist sans with handcrafted feel
   - ✅ JetBrains Mono: Best code font (retained)
   - ✅ All on Google Fonts
   - ✅ Research shows humanist fonts better for mobile

#### Decision
**Fraunces (display) + Cabin (body) + JetBrains Mono (code)**

#### Consequences
- Update all font references
- Google Fonts import string locked
- Headlines have organic character
- Body text is warm and readable

---

### D-006: Authentication Architecture

**Date**: 2026-01-17
**Status**: ACCEPTED

#### Context
Zero per-user server cost required. Users must bring own API keys.

#### Options Considered

1. **Traditional OAuth with backend**
   - ❌ Requires server
   - ❌ Per-user cost

2. **BYOK with Device Flow**
   - ✅ No backend needed
   - ✅ GitHub Device Flow works client-side
   - ✅ Anthropic supports PKCE
   - ✅ Keys stored securely on device

#### Decision
**BYOK (Bring Your Own Keys)** with:
- GitHub Device Flow for repo access
- Anthropic PKCE for Claude API
- `expo-secure-store` for credential storage

#### Consequences
- No server infrastructure
- Users responsible for their own API costs
- Must clearly document key setup in onboarding
- Cannot offer "free trial" of AI features

---

### D-007: Multi-Agent Coordination Model

**Date**: 2026-01-17
**Status**: ACCEPTED

#### Context
Multiple AI agents must work on same codebase without conflicts.

#### Options Considered

1. **CRDTs (Yjs)**
   - ✅ Real-time collaboration
   - ❌ Context fragmentation for agents
   - ❌ Merge complexity

2. **Git worktrees**
   - ✅ Full isolation
   - ✅ Standard git workflow
   - ✅ Agents work with complete snapshots
   - ❌ Requires branch management

3. **File locking**
   - ✅ Simple
   - ❌ Blocks parallelism

#### Decision
**Git worktrees** — each agent operates in isolated directory sharing same .git database.

#### Consequences
- Branch strategy required (main/develop/feature/*)
- Merge protocol documented in AGENTS.md
- PR workflow for integration
- Human or reviewer agent resolves conflicts

---

### D-008: Agent Role Specialization

**Date**: 2026-01-18
**Status**: ACCEPTED

#### Context
Generic agents produce inconsistent results. Specialized roles with constrained permissions improve quality.

#### Decision
Four specialized roles:

| Role | Purpose | Key Permission |
|------|---------|----------------|
| **Architect** | Plans, designs APIs | Write types/docs only |
| **Implementer** | Writes feature code | Write src/, commit |
| **Reviewer** | Evaluates quality | Comment only |
| **Tester** | Writes/runs tests | Write tests only |

#### Consequences
- Clear task handoff protocol
- Reduced scope per agent = better output
- Quality gates at each transition
- Documented in AGENTS.md

---

### D-009: Design Tokens Format

**Date**: 2026-01-18
**Status**: ACCEPTED

#### Context
Agents need machine-readable tokens with semantic context about usage.

#### Decision
Multi-format token system:
- `tokens.json` — Machine-readable with descriptions
- `tokens.ts` — TypeScript constants with types
- `tailwind.config.ts` — NativeWind integration
- `css-variables.css` — Web fallback

Each token includes:
- Value
- Description of WHY it exists
- Context for WHEN to use it

#### Consequences
- Agents can query token intent
- No hardcoded values in components
- Single source of truth for brand

---

### D-010: Deployment Platform

**Date**: 2026-01-18
**Status**: ACCEPTED

#### Context
Need hosting for landing page and reference documentation that agents can access.

#### Options Considered

1. **Vercel**
   - ✅ Great Next.js support
   - ❌ Separate account

2. **Netlify**
   - ✅ Claude connector available
   - ✅ Direct deployment from conversation
   - ✅ Free tier sufficient

3. **GitHub Pages**
   - ✅ Free
   - ❌ Static only

#### Decision
**Netlify** via Claude connector for initial deployment.

Team: `jbdevprimary`
Site: `thumbcode-foundation`

#### Consequences
- Can deploy directly from this conversation
- CI/CD via Netlify
- Custom domain support when ready

---

## Pending Decisions

### D-011: Pricing Tiers

**Status**: DRAFT

Proposed structure:
- **Free**: BYOK only, 1 project, 2 agents max
- **Pro** ($19/mo): Unlimited projects, 10 agents
- **Team** ($49/mo): Shared workspaces, team management

Needs: Market validation, feature scoping

### D-012: MCP Server Strategy

**Status**: DRAFT

Proposed:
- Context7 hardcoded (always available)
- GitHub, Figma, Sentry as "quick add" options
- Custom server URL support

Needs: Security review, UX testing

---

**Add new decisions using the format above. Never delete — mark as SUPERSEDED or DEPRECATED.**
