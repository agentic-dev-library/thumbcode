# Ralph Progress

## Codebase Patterns

- **Markdown files are excluded from TypeScript compilation** — `tsconfig.json` only includes `src/**/*.ts` and `src/**/*.tsx`, so adding/modifying docs never causes typecheck failures
- **Biome is the lint tool**, not ESLint — run `pnpm lint` which invokes `biome check .`; 22 pre-existing warnings exist in the codebase (mostly `noExplicitAny` in test files and `noExcessiveCognitiveComplexity`)
- **Documentation lives in multiple places** — `docs/` for organized docs, `memory-bank/` (root) for UX research, root-level `ARCHITECTURE.md`, `DECISIONS.md`, `CLAUDE.md` for quick agent reference. The `docs/memory-bank/` subdirectory holds institutional memory files
- **Many docs reference outdated Expo stack** — `ARCHITECTURE.md`, `DECISIONS.md`, `PROJECT-STATUS.md`, `CLAUDE.md` all reference Expo SDK 52, NativeWind, expo-router, Jest, Maestro. The actual stack is React 18 + Vite 7 + Capacitor 8 + React Router DOM 7 + Tailwind CSS + Vitest + Playwright
- **pnpm workspaces** — monorepo with root app + packages/ (agent-intelligence, core, config, state, types, ui, dev-tools) + docs-site

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
