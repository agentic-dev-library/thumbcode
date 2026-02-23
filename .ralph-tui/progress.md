# Ralph Progress

## Codebase Patterns

- **Markdown files are excluded from TypeScript compilation** — `tsconfig.json` only includes `src/**/*.ts` and `src/**/*.tsx`, so adding/modifying docs never causes typecheck failures
- **Biome is the lint tool**, not ESLint — run `pnpm lint` which invokes `biome check .`; 22 pre-existing warnings exist in the codebase (mostly `noExplicitAny` in test files and `noExcessiveCognitiveComplexity`)
- **Documentation lives in multiple places** — `docs/` for organized docs, `memory-bank/` (root) for UX research, root-level `ARCHITECTURE.md`, `DECISIONS.md`, `CLAUDE.md` for quick agent reference. The `docs/memory-bank/` subdirectory holds institutional memory files
- **Many docs reference outdated Expo stack** — `ARCHITECTURE.md`, `DECISIONS.md`, `PROJECT-STATUS.md`, `CLAUDE.md` all reference Expo SDK 52, NativeWind, expo-router, Jest, Maestro. The actual stack is React 18 + Vite 7 + Capacitor 8 + React Router DOM 7 + Tailwind CSS + Vitest + Playwright
- **pnpm workspaces** — monorepo with root app + packages/ (agent-intelligence, core, config, state, types, ui, dev-tools) + docs-site

### Page Refactoring Pattern: Hook + Decomposed Components
For large page components, extract a `useXxx` hook (in `src/hooks/`) that owns all form state and side effects. Service functions go in `src/services/<domain>/`. The page becomes a thin composition layer (~100 lines) that wires the hook's return values into decomposed components from `src/components/`. The `RepoListItem` type is canonical from `src/components/onboarding/RepoSelector.tsx` (extends `Repository` from `@thumbcode/types`).

---

## 2026-02-20 - US-014
- **What was implemented**: Created three foundational memory bank files in `docs/memory-bank/`:
  - `projectbrief.md` — ThumbCode mission, scope, core requirements, target users, competitive advantage, success metrics, business model
  - `productContext.md` — BYOK model explanation, mobile-first philosophy, UX goals, agent coordination model, design philosophy, content strategy
  - `techContext.md` — Complete current tech stack (React 18, Vite 7, Capacitor 8), migration diff from Expo, dev setup commands, project structure, path aliases, dependencies, architecture decisions, current metrics, known tech debt
- **Files changed**:
  - `docs/memory-bank/projectbrief.md` (created)
  - `docs/memory-bank/productContext.md` (created)
  - `docs/memory-bank/techContext.md` (created)
- **Learnings:**
  - The codebase has undergone a major Expo → Capacitor migration, but many existing docs (ARCHITECTURE.md, DECISIONS.md, PROJECT-STATUS.md, CLAUDE.md) still reference the old Expo stack. The memory bank files now serve as the accurate source of truth for the current stack.
  - The `docs/memory-bank/` directory already existed with `DECISIONS-OLD.md` and `DEVELOPMENT-LOG.md` (historical reference files from the Expo era).
  - Fresh git worktrees don't have `node_modules` — `pnpm install` is needed before typecheck/lint can run.
  - All 22 lint warnings are pre-existing in source code (not caused by this change).
---

## 2026-02-20 - US-009
- Extracted form logic from `create-project.tsx` (411→103 lines) into service layer and custom hook
- Created `src/services/repository/repository-service.ts` — fetchRepositories, createRepository, filterRepositories, classifyError
- Created `src/services/repository/validation.ts` — canCreateProject, canCreateRepo
- Created `src/hooks/useCreateProject.ts` — orchestrates all form state and side effects
- Rewrote `src/pages/onboarding/create-project.tsx` to compose `RepoSelector`, `ProjectFormHeader`, `ProjectFormActions` from `src/components/onboarding/`
- Updated existing test to match `RepoSelector`'s Unicode ellipsis (`…` not `...`)
- Added 25 new unit tests across repository-service.test.ts and validation.test.ts
- Files changed:
  - `src/services/repository/repository-service.ts` (new)
  - `src/services/repository/validation.ts` (new)
  - `src/services/repository/index.ts` (new)
  - `src/hooks/useCreateProject.ts` (new)
  - `src/pages/onboarding/create-project.tsx` (rewritten, 411→103 lines)
  - `src/pages/onboarding/__tests__/create-project.test.tsx` (updated ellipsis)
  - `src/services/repository/__tests__/repository-service.test.ts` (new, 16 tests)
  - `src/services/repository/__tests__/validation.test.ts` (new, 9 tests)
- **Learnings:**
  - `RepoSelector` uses Unicode ellipsis `…` in "Loading repositories…" while old inline code used `...` — watch for text mismatches when swapping to decomposed components
  - `RepoListItem` in `src/components/onboarding/RepoSelector.tsx` extends `Repository` from `@thumbcode/types` — it needs `provider`, `owner`, and other fields the old local interface omitted
  - Biome `--write` auto-fixes formatting but skips "unsafe" fixes (like unused imports) — use `--write --unsafe` for those
  - The existing 20 Biome warnings (down from 22 after prior fixes) are all pre-existing `noExplicitAny` issues
---
