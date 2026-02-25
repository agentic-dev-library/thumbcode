# UX/UI Overhaul Design

**Date:** 2026-02-24
**Branch:** `feat/ux-overhaul`
**Scope:** Comprehensive frontend overhaul addressing 16 audit findings

## Problem

ThumbCode's frontend has 16 confirmed issues spanning onboarding UX, brand compliance, accessibility, and bugs. The app feels generic despite having a distinctive brand identity (organic shapes, warm coral/teal/gold palette, Fraunces display font). The onboarding flow is 5 screens long and punishing for new users. Providers are hidden. Empty states are misleading.

## Audit Sources

- Manual code review of all 36 page/component files
- Playwright MCP automated audit of all 15 navigable routes
- Live browser testing of GitHub Device Flow

## Design Decisions

### 1. Onboarding: 5 Screens → 2 Screens

**Current flow:** Welcome → GitHub Auth → API Keys → Create Project → Complete

**New flow:** Welcome → Setup → Dashboard

**Welcome screen** redesign:
- Animated ThumbCode logo (CSS scale + fade, no JS animation library)
- Tagline: "Code with your thumbs. Ship apps from your phone."
- Three compact feature pills instead of four verbose cards
- Single "Get Started" CTA, no progress stepper

**Setup screen** (new, replaces 3 separate pages):
- Single scrollable page with collapsible sections
- Section 1: GitHub (Device Flow with embedded client ID)
- Section 2: AI Providers (ALL providers from PROVIDER_REGISTRY, not just Anthropic/OpenAI)
- Each section has an expandable "Why?" helper explaining the purpose
- "Skip" applies to the whole page, not individual sections
- No "Create Project" step — that moves to the Projects tab

**Remove:** `complete.tsx` page. After setup, redirect to Dashboard with a first-time welcome banner.

### 2. Projects Page: Fix Redundancy

- Empty state: Show "Create Project" CTA. **Hide the FAB.**
- With projects: Show FAB. No inline CTA.
- FAB destination changes from `/onboarding/create-project` to inline on the Projects page itself (no route change needed — just conditional render).

### 3. Provider Discovery During Onboarding

Reuse the `ProviderConfig.tsx` component (or its core logic) inline in the new Setup page. Show all providers from `PROVIDER_REGISTRY` grouped by tier with capability badges. Each provider shows: name, tier, supported capabilities, API key input.

### 4. Organic Brand Compliance

**The biggest visual gap.** The brand's primary differentiator (asymmetric `border-radius`, card rotation) is almost entirely missing from the rendered app. Custom Tailwind utilities exist (`rounded-organic-card`, `rounded-organic-button`) but they use simple values like `1rem 0.75rem 1.25rem 0.5rem`, not the full organic paint-daube style from CLAUDE.md.

Fixes:
- Update `global.css` organic utilities to match CLAUDE.md spec (larger asymmetry)
- Add rotation transforms to all card components via a shared `organic-tilt` utility
- Ensure every interactive card and button uses organic border-radius

### 5. Typography Consistency

Replace `font-body` with `font-display` (Fraunces) on all page-level h1/h2 headings:
- `ProviderConfig.tsx` h1
- `CredentialSettings.tsx` h1
- `AgentSettings.tsx` h1
- `EditorSettings.tsx` h1
- `McpSettings.tsx` h1
- Add semantic h1 to `/agents` and `/projects` pages (currently missing)

### 6. Quick Fixes (Independent)

| # | Issue | File(s) | Fix |
|---|-------|---------|-----|
| 1 | Hardcoded version "1.0.0" | `settings.tsx` | Use `env.version` |
| 2 | Broken external links | `settings.tsx` | Point to GitHub repo |
| 3 | Light mode toggle does nothing | `settings.tsx` | Remove toggle, dark-only app |
| 4 | Deprecated meta tag | `index.html` | Replace `apple-mobile-web-app-capable` |
| 5 | cancelledRef Strict Mode bug | `github-auth.tsx` | Already fixed in auth commit |
| 6 | Provider layout breaks at 390px | `ProviderConfig.tsx` | Wrap name/badges, stack on small screens |
| 7 | Create-project footer overlap | `create-project.tsx` | Fix button layout with proper flex gap |
| 8 | Chat empty state position | `chat.tsx` | Center vertically, add icon |
| 9 | API key helper text not clickable | `APIKeyInput.tsx` | Wrap in anchor tags |
| 10 | Dashboard "Welcome back" for first-time users | `home.tsx` | Conditional: "Welcome!" first time, "Welcome back" returning |
| 11 | Agent role shown redundantly | `agents.tsx` | Remove duplicate lowercase role text |

### 7. Dashboard First-Time Experience

When no projects are configured:
- Replace mock agent/activity data with a setup CTA card
- Show: "Create your first project" with a prominent button
- Link to `/projects` (which shows the create-project experience in its empty state)

### 8. What We're NOT Doing (YAGNI)

- No light mode (dark-only is the brand)
- No splash screen animation (Capacitor handles native splash)
- No tab layout refactor
- No chat page redesign
- No new dependencies

## Workstreams (Parallelizable)

These are independent and can be executed simultaneously:

1. **WS-1: Onboarding Redesign** — Welcome + Setup pages, remove Complete, update routing
2. **WS-2: Organic Brand Pass** — CSS utilities, card rotation, border-radius across all pages
3. **WS-3: Quick Fixes** — Version, links, meta tag, provider layout, footer overlap, chat empty state, API key links, dashboard conditional, agent role dedup
4. **WS-4: Typography + Headings** — Font-display on all headings, add missing h1s
5. **WS-5: Projects Page** — Fix FAB/empty state redundancy, move create-project inline

## Success Criteria

- All 2178 existing tests pass
- Build succeeds with no TypeScript errors
- Biome lint passes with 0 errors
- Playwright screenshots of all pages show organic styling
- Onboarding completes in 2 screens max
- All providers visible during setup
