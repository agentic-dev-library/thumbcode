# UX/UI Overhaul Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix 16 audit findings across onboarding UX, organic brand compliance, typography, and UI bugs.

**Architecture:** Five independent workstreams modify pages, CSS utilities, and routing. No new dependencies. All changes are frontend-only (React components, Tailwind CSS, react-router-dom routes). The onboarding context (`src/contexts/onboarding.tsx`) governs redirect logic.

**Tech Stack:** React 18, Tailwind CSS v4, react-router-dom 7, Zustand 5, Vite 7

**Baseline:** 2178 tests passing, Biome lint clean, TypeScript clean.

---

## Workstream 1: Quick Fixes (11 independent items)

These are small, isolated changes that can be done in any order. Each is a single commit.

### Task 1: Fix hardcoded version in Settings

**Files:**
- Modify: `src/pages/tabs/settings.tsx:319`

**Step 1: Update version display to use env.version**

In `src/pages/tabs/settings.tsx`, add the import and replace the hardcoded value:

Add to imports (after the existing imports around line 27):
```typescript
import { env } from '@/config';
```

Replace line 319:
```typescript
// OLD:
<SettingsItemRow Icon={Info} title="Version" value="1.0.0" showArrow={false} />
// NEW:
<SettingsItemRow Icon={Info} title="Version" value={env.version} showArrow={false} />
```

**Step 2: Verify**

Run: `pnpm test --run -- src/pages/tabs/__tests__/settings.test.tsx`

**Step 3: Commit**
```bash
git add src/pages/tabs/settings.tsx
git commit -m "fix(settings): use env.version instead of hardcoded 1.0.0"
```

---

### Task 2: Fix broken external links in Settings

**Files:**
- Modify: `src/pages/tabs/settings.tsx:301-317`

**Step 1: Replace broken thumbcode.dev links with GitHub repo**

Replace the three About section links (lines 301-317):

```typescript
// OLD:
onClick={() => window.open('https://thumbcode.dev/docs', '_blank')}
// NEW:
onClick={() => window.open('https://github.com/thumbcode/thumbcode', '_blank')}

// OLD:
onClick={() => window.open('https://thumbcode.dev/support', '_blank')}
// NEW:
onClick={() => window.open('https://github.com/thumbcode/thumbcode/issues', '_blank')}

// OLD:
onClick={() => window.open('https://thumbcode.dev/legal', '_blank')}
// NEW:
onClick={() => window.open('https://github.com/thumbcode/thumbcode/blob/main/LICENSE', '_blank')}
```

**Step 2: Verify build**

Run: `pnpm exec tsc --noEmit`

**Step 3: Commit**
```bash
git add src/pages/tabs/settings.tsx
git commit -m "fix(settings): point external links to GitHub repo"
```

---

### Task 3: Remove light mode toggle from Settings

**Files:**
- Modify: `src/pages/tabs/settings.tsx:218-233`

**Step 1: Replace Appearance toggle with static "Dark" display**

Remove the cycling theme onClick and replace with a simple display row. In the PREFERENCES section, replace the Appearance SettingsItemRow:

```typescript
// OLD (lines 219-232):
<SettingsItemRow
  Icon={Palette}
  iconClassName="text-gold-400"
  title="Appearance"
  value={themeLabel}
  onClick={() => {
    const next =
      settings.theme === 'system'
        ? 'dark'
        : settings.theme === 'dark'
          ? 'light'
          : 'system';
    setTheme(next);
  }}
/>

// NEW:
<SettingsItemRow
  Icon={Palette}
  iconClassName="text-gold-400"
  title="Appearance"
  value="Dark"
  showArrow={false}
/>
```

Also remove the unused variables `themeLabel`, `themeLabelMap`, and `setTheme` from the component body (lines 141, 151-152).

**Step 2: Verify**

Run: `pnpm test --run -- src/pages/tabs/__tests__/settings.test.tsx`

**Step 3: Commit**
```bash
git add src/pages/tabs/settings.tsx
git commit -m "fix(settings): remove broken light mode toggle, dark-only app"
```

---

### Task 4: Fix deprecated meta tag in index.html

**Files:**
- Modify: `index.html:27`

**Step 1: Replace deprecated apple-mobile-web-app-capable**

```html
<!-- OLD (line 27): -->
<meta name="apple-mobile-web-app-capable" content="yes">
<!-- NEW: -->
<meta name="mobile-web-app-capable" content="yes">
```

**Step 2: Verify build**

Run: `pnpm build`

**Step 3: Commit**
```bash
git add index.html
git commit -m "fix(html): replace deprecated apple-mobile-web-app-capable meta tag"
```

---

### Task 5: Fix provider layout break at 390px width

**Files:**
- Modify: `src/pages/settings/ProviderConfig.tsx:153-163`

**Step 1: Make provider name and badges wrap on small screens**

In the ProviderCard header section (around line 153), update the inner div layout:

```typescript
// OLD (lines 153-163):
<div className="flex-1 min-w-0">
  <div className="flex items-center gap-2">
    <span className="text-white font-body font-medium">{provider.displayName}</span>
    <span className={`text-xs font-body font-medium ${tierColor}`}>{tierLabel}</span>
    {hasApiKey && (
      <span className="text-xs font-body font-medium text-teal-400 bg-teal-600/20 px-1.5 py-0.5 rounded-organic-badge">
        Active
      </span>
    )}
  </div>
  <span className="text-xs text-neutral-500 font-mono">{provider.packageName}</span>
</div>

// NEW:
<div className="flex-1 min-w-0">
  <div className="flex flex-wrap items-center gap-1">
    <span className="text-white font-body font-medium truncate">{provider.displayName}</span>
    <span className={`text-xs font-body font-medium ${tierColor}`}>{tierLabel}</span>
    {hasApiKey && (
      <span className="text-xs font-body font-medium text-teal-400 bg-teal-600/20 px-1.5 py-0.5 rounded-organic-badge">
        Active
      </span>
    )}
  </div>
  <span className="text-xs text-neutral-500 font-mono truncate block">{provider.packageName}</span>
</div>
```

Key changes: `flex` → `flex flex-wrap`, `gap-2` → `gap-1`, added `truncate` to name and `truncate block` to package name.

**Step 2: Verify**

Run: `pnpm test --run -- src/pages/settings/__tests__/ProviderConfig.test.tsx` (if exists, otherwise `pnpm exec tsc --noEmit`)

**Step 3: Commit**
```bash
git add src/pages/settings/ProviderConfig.tsx
git commit -m "fix(providers): wrap name and badges on small screens"
```

---

### Task 6: Fix create-project footer button overlap

**Files:**
- Modify: `src/pages/onboarding/create-project.tsx:91-103`

**Step 1: Fix the bottom buttons container**

The bottom div uses `bg-charcoal` but no glass/border-t, and `ProjectFormActions` uses `paddingBottom: bottomInset + 16` with `bottomInset={0}` which gives `16px` — not enough for safe area.

```typescript
// OLD (lines 91-103):
<div
  className="fixed bottom-0 left-0 right-0 bg-charcoal"
  style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom))' }}
>
  <ProjectFormActions
    canCreate={canCreate}
    isLoading={isLoading}
    bottomInset={0}
    onSkip={handleSkip}
    onCreate={handleCreate}
  />
</div>

// NEW:
<div
  className="fixed bottom-0 left-0 right-0 border-t border-white/5 glass"
  style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom))' }}
>
  <ProjectFormActions
    canCreate={canCreate}
    isLoading={isLoading}
    bottomInset={0}
    onSkip={handleSkip}
    onCreate={handleCreate}
  />
</div>
```

**Step 2: Verify**

Run: `pnpm exec tsc --noEmit`

**Step 3: Commit**
```bash
git add src/pages/onboarding/create-project.tsx
git commit -m "fix(onboarding): add glass backdrop to create-project footer"
```

---

### Task 7: Fix API key helper text not clickable

**Files:**
- Modify: `src/pages/onboarding/components/APIKeyInput.tsx:60`

**Step 1: Wrap helper text in clickable anchor**

```typescript
// OLD (line 60):
<span className="font-body text-xs text-neutral-500">{helperText}</span>

// NEW:
<span className="font-body text-xs text-neutral-500">
  {helperText.includes('console.anthropic.com') ? (
    <a
      href="https://console.anthropic.com/settings/keys"
      target="_blank"
      rel="noopener noreferrer"
      className="text-teal-400 underline"
    >
      {helperText}
    </a>
  ) : helperText.includes('platform.openai.com') ? (
    <a
      href="https://platform.openai.com/api-keys"
      target="_blank"
      rel="noopener noreferrer"
      className="text-teal-400 underline"
    >
      {helperText}
    </a>
  ) : (
    helperText
  )}
</span>
```

**Step 2: Verify**

Run: `pnpm exec tsc --noEmit`

**Step 3: Commit**
```bash
git add src/pages/onboarding/components/APIKeyInput.tsx
git commit -m "fix(onboarding): make API key helper text clickable links"
```

---

### Task 8: Fix Dashboard "Welcome back" for first-time users

**Files:**
- Modify: `src/pages/tabs/home.tsx:52-62`

**Step 1: Conditionally show welcome message**

Import the onboarding context and check project count:

Add to imports:
```typescript
import { useProjectStore, selectProjects } from '@/state';
```

In the component body (after the existing `useHomeDashboard` call):
```typescript
const projects = useProjectStore(selectProjects);
const isFirstTime = projects.length === 0 && stats.runningAgents === 0;
```

Replace lines 59-62:
```typescript
// OLD:
<div className="flex items-baseline gap-2 mb-4">
  <h1 className="font-display text-2xl font-bold text-white">Dashboard</h1>
  <span className="text-sm font-body text-neutral-400">Welcome back</span>
</div>

// NEW:
<div className="flex items-baseline gap-2 mb-4">
  <h1 className="font-display text-2xl font-bold text-white">Dashboard</h1>
  <span className="text-sm font-body text-neutral-400">
    {isFirstTime ? 'Welcome!' : 'Welcome back'}
  </span>
</div>
```

Note: `selectProjects` and `useProjectStore` are already in scope via `useHomeDashboard` internal usage, but we need them directly in the component. Check if they're already imported — if `useHomeDashboard` handles this internally, we need a separate import.

**Step 2: Verify**

Run: `pnpm test --run -- src/pages/tabs/__tests__/home.test.tsx`

**Step 3: Commit**
```bash
git add src/pages/tabs/home.tsx
git commit -m "fix(dashboard): show 'Welcome!' for first-time users"
```

---

### Task 9: Remove duplicate agent role text

**Files:**
- Modify: `src/pages/tabs/agents.tsx:196-198`

**Step 1: Check for redundancy**

Looking at the agent card, the status badge (line 201-205) shows `agent.status.replaceAll('_', ' ')` which displays things like "working", "idle", etc. Below the agent name (line 196-198) there's:
```typescript
<span className="text-sm font-body text-neutral-400 capitalize">
  {agent.role}
</span>
```

And the status badge shows:
```typescript
{agent.status.replaceAll('_', ' ')}
```

The role text under the name ("architect", "implementer", etc.) is not exactly redundant with the status badge. However, the design doc says "Agent role shown redundantly" — this might refer to the fact that the avatar icon already communicates the role (Star=architect, Zap=implementer, etc.) AND the text below the name also says the role.

Per the design doc item #11, remove the lowercase role text under the agent name since the icon already communicates it:

```typescript
// OLD (lines 192-199):
<div>
  <span className="block font-body font-semibold text-white text-lg">
    {agent.name}
  </span>
  <span className="text-sm font-body text-neutral-400 capitalize">
    {agent.role}
  </span>
</div>

// NEW:
<div>
  <span className="block font-body font-semibold text-white text-lg">
    {agent.name}
  </span>
</div>
```

**Step 2: Verify**

Run: `pnpm test --run -- src/pages/tabs/__tests__/agents.test.tsx`

**Step 3: Commit**
```bash
git add src/pages/tabs/agents.tsx
git commit -m "fix(agents): remove redundant role text (icon communicates role)"
```

---

## Workstream 2: Organic Brand Pass

### Task 10: Update CSS organic utilities to match CLAUDE.md spec

**Files:**
- Modify: `global.css:116-136`
- Modify: `tailwind.config.ts:88-98`

**Step 1: Update global.css organic utilities**

The current values are too subtle. Replace with the full organic paint-daube asymmetry from CLAUDE.md:

```css
/* OLD (lines 121-135): */
.organic-card {
  border-radius: 1rem 0.75rem 1.25rem 0.5rem;
}
.organic-button {
  border-radius: 0.5rem 0.75rem 0.625rem 0.875rem;
}
.organic-badge {
  border-radius: 0.375rem 0.5rem 0.625rem 0.25rem;
}
.organic-input {
  border-radius: 0.5rem 0.625rem 0.5rem 0.75rem;
}

/* NEW: */
.organic-card {
  border-radius: 20px 18px 22px 16px / 16px 20px 18px 22px;
}
.organic-button {
  border-radius: 50px 45px 50px 48px / 26px 28px 26px 24px;
}
.organic-badge {
  border-radius: 8px 12px 10px 6px / 6px 10px 12px 8px;
}
.organic-input {
  border-radius: 12px 14px 12px 16px / 10px 12px 14px 10px;
}
```

Also update tailwind.config.ts to match:

```typescript
// OLD (lines 88-98):
'organic-card': '1rem 0.75rem 1.25rem 0.5rem',
'organic-button': '0.5rem 0.75rem 0.625rem 0.875rem',
'organic-badge': '0.375rem 0.5rem 0.625rem 0.25rem',
'organic-input': '0.5rem 0.625rem 0.5rem 0.75rem',
'organic-hero': '1.75rem 1.5rem 2rem 1.25rem',
'organic-cta': '0.875rem 1rem 0.75rem 1.125rem',
'organic-modal': '1.125rem 1rem 1.25rem 0.875rem',
'organic-toast': '0.875rem 0.75rem 1rem 0.625rem',
'organic-code': '0.75rem 0.625rem 0.75rem 0.5rem',
'organic-chat-user': '1rem 0.375rem 1rem 0.875rem',
'organic-chat-agent': '0.375rem 1rem 1rem 0.875rem',

// NEW:
'organic-card': '20px 18px 22px 16px / 16px 20px 18px 22px',
'organic-button': '50px 45px 50px 48px / 26px 28px 26px 24px',
'organic-badge': '8px 12px 10px 6px / 6px 10px 12px 8px',
'organic-input': '12px 14px 12px 16px / 10px 12px 14px 10px',
'organic-hero': '28px 24px 32px 20px / 20px 24px 28px 18px',
'organic-cta': '14px 16px 12px 18px / 10px 14px 12px 16px',
'organic-modal': '18px 16px 20px 14px / 14px 18px 16px 20px',
'organic-toast': '14px 12px 16px 10px / 10px 14px 12px 16px',
'organic-code': '12px 10px 12px 8px / 8px 12px 10px 12px',
'organic-chat-user': '16px 6px 16px 14px / 14px 6px 16px 12px',
'organic-chat-agent': '6px 16px 16px 14px / 6px 14px 16px 12px',
```

**Step 2: Add organic-tilt utility class**

Add to `global.css` after the organic utilities, still in `@layer utilities`:

```css
.organic-tilt-left {
  transform: rotate(-0.3deg);
}
.organic-tilt-right {
  transform: rotate(0.3deg);
}
```

**Step 3: Update organic shadows to use brand color tint**

In `tailwind.config.ts`, update `boxShadow`:

```typescript
// OLD (lines 100-105):
'organic-card': '2px 4px 8px -2px rgb(0 0 0 / 0.08), -1px 2px 4px -1px rgb(0 0 0 / 0.04)',
'organic-elevated': '4px 8px 16px -4px rgb(0 0 0 / 0.12), -2px 4px 8px -2px rgb(0 0 0 / 0.06)',
'organic-float': '8px 16px 32px -8px rgb(0 0 0 / 0.16), -4px 8px 16px -4px rgb(0 0 0 / 0.08)',

// NEW:
'organic-card': '0 2px 4px rgba(13, 148, 136, 0.08), 0 8px 24px rgba(21, 24, 32, 0.12), 0 1px 2px rgba(0, 0, 0, 0.04)',
'organic-elevated': '0 4px 8px rgba(13, 148, 136, 0.1), 0 16px 32px rgba(21, 24, 32, 0.16), 0 2px 4px rgba(0, 0, 0, 0.06)',
'organic-float': '0 8px 16px rgba(255, 112, 89, 0.15), 0 24px 48px rgba(21, 24, 32, 0.2), 0 4px 8px rgba(0, 0, 0, 0.08)',
```

**Step 4: Verify**

Run: `pnpm test --run -- src/ui/__tests__/organicStyles.test.ts`
Run: `pnpm exec tsc --noEmit`
Run: `pnpm build`

**Step 5: Commit**
```bash
git add global.css tailwind.config.ts
git commit -m "style(brand): update organic utilities to full CLAUDE.md paint-daube spec"
```

---

## Workstream 3: Typography + Headings

### Task 11: Apply font-display to all settings page h1 headings

**Files:**
- Modify: `src/pages/settings/ProviderConfig.tsx:357`
- Modify: `src/pages/settings/CredentialSettings.tsx:206`
- Modify: `src/pages/settings/AgentSettings.tsx:198`
- Modify: `src/pages/settings/EditorSettings.tsx:152`
- Modify: `src/pages/settings/McpSettings.tsx:283`

**Step 1: Replace font-body with font-display on all h1 tags**

Each settings sub-page has an h1 like:
```html
<h1 className="text-xl font-bold text-white font-body">...</h1>
```

Change `font-body` to `font-display` in each file:

**ProviderConfig.tsx line 357:**
```typescript
// OLD: <h1 className="text-xl font-bold text-white font-body">AI Providers</h1>
// NEW: <h1 className="text-xl font-bold text-white font-display">AI Providers</h1>
```

**CredentialSettings.tsx line 206:**
```typescript
// OLD: <h1 className="text-xl font-bold text-white font-body">Credentials</h1>
// NEW: <h1 className="text-xl font-bold text-white font-display">Credentials</h1>
```

**AgentSettings.tsx line 198:**
```typescript
// OLD: <h1 className="text-xl font-bold text-white font-body">Agent Settings</h1>
// NEW: <h1 className="text-xl font-bold text-white font-display">Agent Settings</h1>
```

**EditorSettings.tsx line 152:**
```typescript
// OLD: <h1 className="text-xl font-bold text-white font-body">Editor Settings</h1>
// NEW: <h1 className="text-xl font-bold text-white font-display">Editor Settings</h1>
```

**McpSettings.tsx line 283:**
```typescript
// OLD: <h1 className="text-xl font-bold text-white font-body">MCP Servers</h1>
// NEW: <h1 className="text-xl font-bold text-white font-display">MCP Servers</h1>
```

**Step 2: Verify**

Run: `pnpm exec tsc --noEmit`

**Step 3: Commit**
```bash
git add src/pages/settings/ProviderConfig.tsx src/pages/settings/CredentialSettings.tsx src/pages/settings/AgentSettings.tsx src/pages/settings/EditorSettings.tsx src/pages/settings/McpSettings.tsx
git commit -m "style(typography): use font-display (Fraunces) on all settings h1 headings"
```

---

### Task 12: Add missing h1 headings to agents and projects pages

**Files:**
- Modify: `src/pages/tabs/agents.tsx:116-117`
- Modify: `src/pages/tabs/projects.tsx:41-47`

**Step 1: Add h1 to agents page**

Insert before the overview stats section (after `<div className="w-full p-4">` on line 116):

```typescript
// After line 116 (<div className="w-full p-4">), add:
<h1 className="font-display text-2xl font-bold text-white mb-4">Agents</h1>
```

**Step 2: Add h1 to projects page**

Insert before the search bar. After the outer `<div>` on line 42, before the search `<div>`:

```typescript
// After line 46 (<div className="p-4">), add before the search div:
<h1 className="font-display text-2xl font-bold text-white mb-3">Projects</h1>
```

**Step 3: Verify**

Run: `pnpm test --run -- src/pages/tabs/__tests__/agents.test.tsx src/pages/tabs/__tests__/projects.test.tsx`

**Step 4: Commit**
```bash
git add src/pages/tabs/agents.tsx src/pages/tabs/projects.tsx
git commit -m "a11y(pages): add semantic h1 headings to agents and projects pages"
```

---

### Task 13: Fix Dashboard section headings to use font-display

**Files:**
- Modify: `src/pages/tabs/home.tsx:109,169`

**Step 1: Replace font-body with font-display on h2 headings**

```typescript
// OLD (line 109):
<h2 className="font-body font-semibold text-white text-lg">Agent Team</h2>
// NEW:
<h2 className="font-display font-semibold text-white text-lg">Agent Team</h2>

// OLD (line 169):
<h2 className="font-body font-semibold text-white text-lg">Recent Activity</h2>
// NEW:
<h2 className="font-display font-semibold text-white text-lg">Recent Activity</h2>
```

**Step 2: Verify**

Run: `pnpm exec tsc --noEmit`

**Step 3: Commit**
```bash
git add src/pages/tabs/home.tsx
git commit -m "style(typography): use font-display on dashboard section headings"
```

---

## Workstream 4: Projects Page Fix

### Task 14: Fix FAB/empty state redundancy on Projects page

**Files:**
- Modify: `src/pages/tabs/projects.tsx:67-83,145-153`

**Step 1: Conditionally show FAB only when projects exist**

The empty state already has a "Create Project" button. The FAB should only show when there are projects.

```typescript
// OLD (lines 145-153):
{/* FAB */}
<button
  type="button"
  onClick={() => navigate('/onboarding/create-project')}
  className="fixed bottom-24 right-6 w-14 h-14 bg-coral-500 flex items-center justify-center rounded-organic-button shadow-organic-float hover:bg-coral-600 transition-colors z-10 tap-feedback"
  aria-label="Create new project"
>
  <Plus size={24} className="text-white" />
</button>

// NEW:
{/* FAB - only visible when projects exist */}
{filteredProjects.length > 0 && (
  <button
    type="button"
    onClick={() => navigate('/onboarding/create-project')}
    className="fixed bottom-24 right-6 w-14 h-14 bg-coral-500 flex items-center justify-center rounded-organic-button shadow-organic-float hover:bg-coral-600 transition-colors z-10 tap-feedback"
    aria-label="Create new project"
  >
    <Plus size={24} className="text-white" />
  </button>
)}
```

**Step 2: Verify**

Run: `pnpm test --run -- src/pages/tabs/__tests__/projects.test.tsx`

**Step 3: Commit**
```bash
git add src/pages/tabs/projects.tsx
git commit -m "fix(projects): hide FAB when showing empty state with Create button"
```

---

## Workstream 5: Onboarding Redesign

### Task 15: Redesign Welcome page (animated logo, compact pills, no stepper)

**Files:**
- Modify: `src/pages/onboarding/welcome.tsx`

**Step 1: Rewrite welcome page with animated logo and compact pills**

Replace the entire content of `welcome.tsx`:

```typescript
/**
 * Welcome Screen
 *
 * First screen of onboarding. Animated logo, tagline, three feature pills.
 * Single "Get Started" CTA — no progress stepper.
 */

import { useEffect, useState } from 'react';
import { ThumbIcon } from '@/components/icons';
import { useAppRouter } from '@/hooks/use-app-router';

const FEATURE_PILLS = [
  { emoji: '🤖', label: 'AI Agent Teams' },
  { emoji: '📱', label: 'Mobile-First Git' },
  { emoji: '🔐', label: 'Your Keys, Your Device' },
] as const;

export default function WelcomePage() {
  const router = useAppRouter();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = requestAnimationFrame(() => setIsVisible(true));
    return () => cancelAnimationFrame(timer);
  }, []);

  return (
    <div
      className="flex flex-col min-h-screen bg-charcoal"
      data-testid="welcome-screen"
    >
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-32">
        {/* Animated Logo */}
        <div
          className={`transition-all duration-700 ease-out ${
            isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
          }`}
        >
          <div className="w-28 h-28 bg-coral-500 flex items-center justify-center rounded-organic-hero mb-6">
            <ThumbIcon size={56} color="charcoal" turbulence={0.2} />
          </div>
        </div>

        {/* Title + Tagline */}
        <div
          className={`flex flex-col items-center gap-3 mb-10 transition-all duration-500 delay-200 ${
            isVisible ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <h1 className="font-display text-4xl font-bold text-coral-500 text-center">
            ThumbCode
          </h1>
          <p className="font-body text-lg text-neutral-400 text-center max-w-[300px]">
            Code with your thumbs. Ship apps from your phone.
          </p>
        </div>

        {/* Feature Pills */}
        <div
          className={`flex flex-wrap justify-center gap-3 transition-all duration-500 delay-300 ${
            isVisible ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {FEATURE_PILLS.map((pill) => (
            <span
              key={pill.label}
              className="bg-surface px-4 py-2 rounded-organic-badge font-body text-sm text-neutral-300 shadow-organic-card"
            >
              {pill.emoji} {pill.label}
            </span>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div
        className="fixed bottom-0 left-0 right-0 glass border-t border-white/5 px-6 py-4"
        style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom))' }}
      >
        <button
          type="button"
          onClick={() => router.push('/onboarding/setup')}
          className="w-full bg-coral-500 py-4 font-body font-semibold text-white text-center text-lg rounded-organic-button hover:bg-coral-600 active:bg-coral-700 transition-colors tap-feedback"
          data-testid="get-started-button"
        >
          Get Started
        </button>
      </div>
    </div>
  );
}
```

**Step 2: Verify**

Run: `pnpm exec tsc --noEmit`

**Step 3: Commit**
```bash
git add src/pages/onboarding/welcome.tsx
git commit -m "feat(onboarding): redesign welcome page with animated logo and feature pills"
```

---

### Task 16: Create unified Setup page (replaces github-auth + api-keys + create-project)

**Files:**
- Create: `src/pages/onboarding/setup.tsx`

**Step 1: Create the new Setup page**

This page combines GitHub auth and provider keys into a single scrollable page with collapsible sections. "Create Project" moves to the Projects tab.

Create `src/pages/onboarding/setup.tsx`:

```typescript
/**
 * Setup Screen
 *
 * Unified onboarding setup: GitHub auth + AI provider keys in collapsible sections.
 * Replaces the previous 3-page flow (github-auth → api-keys → create-project).
 */

import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { LinkIcon, SecurityIcon, SuccessIcon } from '@/components/icons';
import { env, GITHUB_OAUTH, PROVIDER_REGISTRY } from '@/config';
import { CredentialService, GitHubAuthService } from '@/core';
import { useOnboarding } from '@/contexts/onboarding';
import { useAppRouter } from '@/hooks/use-app-router';
import { logger } from '@/lib/logger';
import { type CredentialProvider, useCredentialStore } from '@/state';

function Spinner({ className = '' }: { className?: string }) {
  return (
    <div
      className={`w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin ${className}`}
    />
  );
}

/** Collapsible section wrapper */
function SetupSection({
  title,
  subtitle,
  isOpen,
  onToggle,
  isDone,
  whyText,
  children,
}: Readonly<{
  title: string;
  subtitle: string;
  isOpen: boolean;
  onToggle: () => void;
  isDone: boolean;
  whyText: string;
  children: React.ReactNode;
}>) {
  const [showWhy, setShowWhy] = useState(false);

  return (
    <div className="bg-surface rounded-organic-card shadow-organic-card overflow-hidden mb-4">
      <button
        type="button"
        onClick={onToggle}
        className="w-full px-4 py-4 flex items-center gap-3 text-left tap-feedback"
      >
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-body font-semibold text-white">{title}</span>
            {isDone && <SuccessIcon size={18} color="teal" turbulence={0.15} />}
          </div>
          <span className="text-sm font-body text-neutral-500">{subtitle}</span>
        </div>
        {isOpen ? (
          <ChevronUp size={18} className="text-neutral-400" />
        ) : (
          <ChevronDown size={18} className="text-neutral-400" />
        )}
      </button>

      {isOpen && (
        <div className="px-4 pb-4 border-t border-neutral-700/50 pt-3">
          {/* Why? helper */}
          <button
            type="button"
            onClick={() => setShowWhy(!showWhy)}
            className="flex items-center gap-1 text-xs font-body text-teal-400 mb-3 tap-feedback"
          >
            <HelpCircle size={14} />
            <span>Why?</span>
          </button>
          {showWhy && (
            <div className="bg-teal-600/10 p-3 mb-3 rounded-organic-badge">
              <p className="text-xs font-body text-teal-300">{whyText}</p>
            </div>
          )}
          {children}
        </div>
      )}
    </div>
  );
}

export default function SetupPage() {
  const router = useAppRouter();
  const { completeOnboarding } = useOnboarding();
  const cancelledRef = useRef(false);

  // Section state
  const [githubOpen, setGithubOpen] = useState(true);
  const [providersOpen, setProvidersOpen] = useState(false);

  // GitHub auth state
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [userCode, setUserCode] = useState<string | null>(null);
  const [verificationUri, setVerificationUri] = useState('https://github.com/login/device');
  const [isGithubConnected, setIsGithubConnected] = useState(false);
  const [githubError, setGithubError] = useState<string | null>(null);

  // Provider key state
  const addCredential = useCredentialStore((s) => s.addCredential);
  const setValidationResult = useCredentialStore((s) => s.setValidationResult);
  const [providerKeys, setProviderKeys] = useState<Record<string, string>>({});
  const [validatedProviders, setValidatedProviders] = useState<Set<string>>(new Set());
  const [validatingProvider, setValidatingProvider] = useState<string | null>(null);

  useEffect(() => {
    cancelledRef.current = false;
    return () => {
      cancelledRef.current = true;
      GitHubAuthService.cancel();
    };
  }, []);

  // --- GitHub Device Flow ---
  const startDeviceFlow = async () => {
    setIsAuthenticating(true);
    setGithubError(null);
    try {
      const result = await GitHubAuthService.startDeviceFlow({
        clientId: env.githubClientId,
        scopes: GITHUB_OAUTH.scopes,
        onStateChange: () => {},
        onError: (error) => {
          if (!cancelledRef.current) setGithubError(error);
        },
      });
      if (cancelledRef.current) return;
      if (result.success && result.data) {
        setUserCode(result.data.user_code);
        setVerificationUri(result.data.verification_uri);
      } else {
        setGithubError(result.error ?? 'Failed to start device flow');
      }
    } catch (err) {
      if (!cancelledRef.current) {
        setGithubError(err instanceof Error ? err.message : 'Failed to start device flow');
      }
    } finally {
      if (!cancelledRef.current) setIsAuthenticating(false);
    }
  };

  const checkAuth = async () => {
    setIsAuthenticating(true);
    setGithubError(null);
    try {
      const result = await GitHubAuthService.pollForToken({
        clientId: env.githubClientId,
        scopes: GITHUB_OAUTH.scopes,
        onPollAttempt: () => {},
        onError: (error) => {
          if (!cancelledRef.current) setGithubError(error);
        },
      });
      if (cancelledRef.current) return;
      if (result.authorized) {
        setIsGithubConnected(true);
        setGithubOpen(false);
        setProvidersOpen(true);
      } else if (result.error) {
        setGithubError(result.error);
      }
    } catch (err) {
      if (!cancelledRef.current) {
        setGithubError(err instanceof Error ? err.message : 'Authentication failed');
      }
    } finally {
      if (!cancelledRef.current) setIsAuthenticating(false);
    }
  };

  // --- Provider Key Validation ---
  const handleProviderKeyChange = (providerId: string, value: string) => {
    setProviderKeys((prev) => ({ ...prev, [providerId]: value }));
  };

  const validateAndSaveKey = useCallback(
    async (providerId: string) => {
      const key = providerKeys[providerId]?.trim();
      if (!key) return;

      // Only validate anthropic/openai through CredentialService
      const supportedProviders = ['anthropic', 'openai'];
      const provider = supportedProviders.includes(providerId)
        ? (providerId as 'anthropic' | 'openai')
        : null;

      setValidatingProvider(providerId);
      try {
        if (provider) {
          const result = await CredentialService.validateCredential(provider, key);
          if (result.isValid) {
            await CredentialService.store(provider, key);
            const credId = addCredential({
              provider: provider as CredentialProvider,
              name: providerId === 'anthropic' ? 'Anthropic' : 'OpenAI',
              secureStoreKey: providerId,
              maskedValue: CredentialService.maskSecret(key, provider),
            });
            setValidationResult(credId, { isValid: true, expiresAt: undefined });
          }
        }
        // For non-anthropic/openai, just store as custom
        setValidatedProviders((prev) => new Set(prev).add(providerId));
        setProviderKeys((prev) => ({ ...prev, [providerId]: '' }));
      } catch (error) {
        logger.error(`Failed to validate ${providerId} key`, error);
      } finally {
        setValidatingProvider(null);
      }
    },
    [providerKeys, addCredential, setValidationResult]
  );

  const handleFinish = async () => {
    await completeOnboarding();
    router.replace('/');
  };

  const handleSkip = async () => {
    await completeOnboarding();
    router.replace('/');
  };

  // Top 4 providers to show during onboarding (Tier 4 + 3)
  const onboardingProviders = PROVIDER_REGISTRY.filter((p) => p.tier >= 3).slice(0, 6);

  return (
    <div
      className="flex flex-col min-h-screen bg-charcoal animate-page-enter"
      data-testid="setup-screen"
    >
      <div className="flex-1 overflow-auto px-6 pt-6 pb-32 hide-scrollbar">
        {/* Header */}
        <div className="flex flex-col gap-2 mb-8">
          <h1 className="font-display text-3xl font-bold text-white">Set Up ThumbCode</h1>
          <p className="font-body text-neutral-400">
            Connect your accounts to get the most out of ThumbCode. You can skip and configure these later in Settings.
          </p>
        </div>

        {/* Section 1: GitHub */}
        <SetupSection
          title="GitHub"
          subtitle={isGithubConnected ? 'Connected' : 'Connect to access repositories'}
          isOpen={githubOpen}
          onToggle={() => setGithubOpen(!githubOpen)}
          isDone={isGithubConnected}
          whyText="GitHub access lets ThumbCode clone repos, create branches, commit code, and push changes — all from your phone."
        >
          {!isGithubConnected ? (
            <div className="flex flex-col gap-4">
              {!userCode ? (
                <button
                  type="button"
                  onClick={startDeviceFlow}
                  disabled={isAuthenticating}
                  className={`bg-neutral-800 py-3 rounded-organic-button font-body font-semibold text-white text-center transition-colors tap-feedback ${
                    isAuthenticating ? 'opacity-70 cursor-not-allowed' : 'hover:bg-neutral-700'
                  }`}
                  data-testid="start-auth-button"
                >
                  {isAuthenticating ? <Spinner /> : 'Connect GitHub'}
                </button>
              ) : (
                <>
                  <div className="bg-charcoal p-4 rounded-organic-card text-center">
                    <p className="font-body text-sm text-neutral-400 mb-1">Enter this code on GitHub:</p>
                    <p className="font-display text-2xl font-bold text-coral-500 tracking-wider">{userCode}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => window.open(verificationUri, '_blank', 'noopener,noreferrer')}
                    className="bg-neutral-800 py-3 rounded-organic-button font-body text-white text-center hover:bg-neutral-700 transition-colors tap-feedback"
                    data-testid="open-github-button"
                  >
                    Open GitHub &rarr;
                  </button>
                  <button
                    type="button"
                    onClick={checkAuth}
                    disabled={isAuthenticating}
                    className={`bg-teal-600 py-3 rounded-organic-button font-body font-semibold text-white text-center transition-colors tap-feedback ${
                      isAuthenticating ? 'opacity-70 cursor-not-allowed' : 'hover:bg-teal-700'
                    }`}
                    data-testid="check-auth-button"
                  >
                    {isAuthenticating ? <Spinner /> : "I've Entered the Code"}
                  </button>
                </>
              )}
              {githubError && (
                <p className="font-body text-sm text-coral-400 text-center">{githubError}</p>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-teal-400 font-body">
              <SuccessIcon size={18} color="teal" turbulence={0.15} />
              <span>GitHub connected successfully</span>
            </div>
          )}
        </SetupSection>

        {/* Section 2: AI Providers */}
        <SetupSection
          title="AI Providers"
          subtitle={
            validatedProviders.size > 0
              ? `${validatedProviders.size} provider${validatedProviders.size > 1 ? 's' : ''} configured`
              : 'Add API keys to power AI agents'
          }
          isOpen={providersOpen}
          onToggle={() => setProvidersOpen(!providersOpen)}
          isDone={validatedProviders.size > 0}
          whyText="AI provider keys let ThumbCode's agents (Architect, Implementer, Reviewer, Tester) generate code, review changes, and run tests. Your keys never leave your device."
        >
          <div className="flex flex-col gap-3">
            {/* Security notice */}
            <div className="bg-teal-600/10 p-3 rounded-organic-badge flex items-start gap-2">
              <SecurityIcon size={16} color="teal" turbulence={0.2} />
              <p className="font-body text-xs text-teal-300 flex-1">
                Keys are stored securely on your device using hardware-backed encryption.
              </p>
            </div>

            {onboardingProviders.map((provider) => (
              <div
                key={provider.providerId}
                className="bg-charcoal p-3 rounded-organic-card"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-body font-medium text-white text-sm">{provider.displayName}</span>
                    {validatedProviders.has(provider.providerId) && (
                      <SuccessIcon size={14} color="teal" turbulence={0.15} />
                    )}
                  </div>
                  <span className="text-xs font-body text-neutral-500">
                    Tier {provider.tier}
                  </span>
                </div>
                {!validatedProviders.has(provider.providerId) && (
                  <div className="flex gap-2">
                    <input
                      type="password"
                      placeholder={provider.authEnvVar}
                      value={providerKeys[provider.providerId] ?? ''}
                      onChange={(e) => handleProviderKeyChange(provider.providerId, e.target.value)}
                      className="flex-1 bg-surface border border-neutral-700 text-white font-mono text-xs px-3 py-2 rounded-organic-input placeholder:text-neutral-600 focus:outline-none focus:border-teal-500 transition-colors"
                      data-testid={`setup-key-${provider.providerId}`}
                      autoComplete="off"
                    />
                    <button
                      type="button"
                      onClick={() => validateAndSaveKey(provider.providerId)}
                      disabled={!providerKeys[provider.providerId]?.trim() || validatingProvider === provider.providerId}
                      className={`px-3 py-2 text-xs font-body font-medium rounded-organic-button transition-colors ${
                        providerKeys[provider.providerId]?.trim()
                          ? 'bg-teal-600 text-white hover:bg-teal-700'
                          : 'bg-neutral-700 text-neutral-500 cursor-not-allowed'
                      }`}
                      data-testid={`setup-save-${provider.providerId}`}
                    >
                      {validatingProvider === provider.providerId ? '...' : 'Save'}
                    </button>
                  </div>
                )}
              </div>
            ))}

            <p className="font-body text-xs text-neutral-500 text-center">
              More providers available in Settings &rarr; AI Providers
            </p>
          </div>
        </SetupSection>
      </div>

      {/* Bottom Buttons */}
      <div
        className="fixed bottom-0 left-0 right-0 border-t border-white/5 glass px-6 py-4 flex flex-row gap-4"
        style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom))' }}
      >
        <button
          type="button"
          onClick={handleSkip}
          className="flex-1 bg-neutral-800 py-4 rounded-organic-button font-body text-neutral-300 text-center hover:bg-neutral-700 active:bg-neutral-600 transition-colors tap-feedback"
          data-testid="skip-button"
        >
          Skip for Now
        </button>

        <button
          type="button"
          onClick={handleFinish}
          className="flex-1 bg-coral-500 py-4 rounded-organic-button font-body font-semibold text-white text-center hover:bg-coral-600 active:bg-coral-700 transition-colors tap-feedback"
          data-testid="finish-button"
        >
          Finish Setup
        </button>
      </div>
    </div>
  );
}
```

**Step 2: Verify**

Run: `pnpm exec tsc --noEmit`

**Step 3: Commit**
```bash
git add src/pages/onboarding/setup.tsx
git commit -m "feat(onboarding): create unified Setup page with collapsible sections"
```

---

### Task 17: Update routing for new onboarding flow

**Files:**
- Modify: `src/router.tsx`

**Step 1: Add Setup route, remove github-auth, api-keys, create-project, complete from onboarding**

```typescript
// Add lazy import for SetupPage (after WelcomePage import):
const SetupPage = lazy(() => import('@/pages/onboarding/setup'));

// Remove these lazy imports:
// const GitHubAuthPage = ...
// const ApiKeysPage = ...
// const CreateProjectPage = ...
// const CompletePage = ...
```

Update the onboarding routes:

```typescript
// OLD:
<Route path="onboarding" element={<ErrorBoundary><OnboardingLayout /></ErrorBoundary>}>
  <Route path="welcome" element={<WelcomePage />} />
  <Route path="github-auth" element={<GitHubAuthPage />} />
  <Route path="api-keys" element={<ApiKeysPage />} />
  <Route path="create-project" element={<CreateProjectPage />} />
  <Route path="complete" element={<CompletePage />} />
</Route>

// NEW:
<Route path="onboarding" element={<ErrorBoundary><OnboardingLayout /></ErrorBoundary>}>
  <Route path="welcome" element={<WelcomePage />} />
  <Route path="setup" element={<SetupPage />} />
</Route>
```

Note: Keep the old page files for now — they're no longer routed to but can be deleted in a cleanup task later. The `create-project.tsx` page is still referenced from the Projects FAB so keep that route available outside of onboarding (or the Projects page handles creation inline). For now, the FAB on the Projects page still navigates to `/onboarding/create-project`, so keep that route as a fallback:

```typescript
<Route path="onboarding" element={<ErrorBoundary><OnboardingLayout /></ErrorBoundary>}>
  <Route path="welcome" element={<WelcomePage />} />
  <Route path="setup" element={<SetupPage />} />
  <Route path="create-project" element={<CreateProjectPage />} />
</Route>
```

**Step 2: Verify**

Run: `pnpm exec tsc --noEmit`
Run: `pnpm build`

**Step 3: Commit**
```bash
git add src/router.tsx
git commit -m "feat(routing): update onboarding to 2-screen flow (welcome → setup)"
```

---

### Task 18: Update Dashboard with first-time setup CTA

**Files:**
- Modify: `src/pages/tabs/home.tsx`

**Step 1: Add setup CTA card when no projects configured**

After the Quick Stats section (line 104), before the Agent Status section, add a conditional:

```typescript
{/* First-time Setup CTA */}
{stats.projectCount === 0 && (
  <div
    className="bg-surface p-6 mb-4 rounded-organic-card shadow-organic-card text-center"
    style={{ transform: 'rotate(-0.2deg)' }}
  >
    <FolderOpen size={40} className="text-coral-500 mx-auto mb-3" />
    <h2 className="font-display text-lg font-semibold text-white mb-2">
      Create your first project
    </h2>
    <p className="font-body text-sm text-neutral-400 mb-4">
      Connect a repository to start building with AI agents.
    </p>
    <button
      type="button"
      onClick={() => navigate('/projects')}
      className="bg-coral-500 px-6 py-3 rounded-organic-button font-body font-semibold text-white hover:bg-coral-600 transition-colors tap-feedback"
    >
      Go to Projects
    </button>
  </div>
)}
```

**Step 2: Verify**

Run: `pnpm test --run -- src/pages/tabs/__tests__/home.test.tsx`

**Step 3: Commit**
```bash
git add src/pages/tabs/home.tsx
git commit -m "feat(dashboard): add first-time setup CTA when no projects exist"
```

---

## Final Verification

### Task 19: Full verification pass

**Step 1: Run all tests**
```bash
pnpm test --run
```
Expected: All 2178+ tests pass.

**Step 2: Type check**
```bash
pnpm exec tsc --noEmit
```
Expected: 0 errors.

**Step 3: Lint**
```bash
pnpm exec biome check --write .
```
Expected: 0 errors (may auto-fix formatting).

**Step 4: Build**
```bash
pnpm build
```
Expected: Clean build, no errors.

**Step 5: Commit any lint fixes**
```bash
git add -A
git commit -m "style: auto-fix Biome formatting after UX overhaul"
```

---

## Execution Order

Tasks 1-9 (WS1: Quick Fixes) are fully independent — run in parallel.

Task 10 (WS2: Organic Brand) is independent — run in parallel with above.

Tasks 11-13 (WS3: Typography) are independent — run in parallel with above.

Task 14 (WS4: Projects) is independent — run in parallel with above.

Tasks 15-18 (WS5: Onboarding) must run sequentially (15 → 16 → 17 → 18).

Task 19 runs last after all others complete.

```
Parallel batch 1: Tasks 1-14 (all independent)
Sequential batch 2: Tasks 15, 16, 17, 18 (onboarding flow)
Final: Task 19 (verification)
```
