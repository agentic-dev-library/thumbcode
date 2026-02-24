# Flatten Monorepo Packages Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Dissolve all 6 runtime packages into `src/`, decompose `agent-intelligence` into services, and remove all workspace ceremony.

**Architecture:** Move package source files into `src/` subdirectories with matching names. Rewrite all `@thumbcode/*` imports to `@/*` path aliases. Absorb AI SDK deps into root `package.json`. Delete all package config files and workspace references.

**Tech Stack:** pnpm workspaces, TypeScript path aliases (`@/*` → `src/*`), Vite + `vite-tsconfig-paths`, Vitest, Biome

---

## Task 1: Move `packages/types/src/*` to `src/types/`

**Files:**
- Move: `packages/types/src/*.ts` (10 files) → `src/types/`
- Delete: `packages/types/package.json`

**Step 1: Copy files**

```bash
cp -r packages/types/src/ src/types/
```

This creates `src/types/` with all 10 files including `index.ts`.

**Step 2: Delete package source**

```bash
rm -rf packages/types/
```

**Step 3: Verify the barrel exists**

The existing `packages/types/src/index.ts` re-exports everything — it becomes `src/types/index.ts` automatically from the copy.

**Step 4: Commit**

```bash
git add -A && git commit -m "refactor(types): move @thumbcode/types into src/types/"
```

---

## Task 2: Move `packages/config/src/*` to `src/config/`

**Files:**
- Move: `packages/config/src/*.ts` + `packages/config/src/__tests__/*.ts` (9 files) → `src/config/`
- Delete: `packages/config/package.json`

**Step 1: Copy files**

```bash
cp -r packages/config/src/ src/config/
```

**Step 2: Delete package source**

```bash
rm -rf packages/config/
```

**Step 3: Commit**

```bash
git add -A && git commit -m "refactor(config): move @thumbcode/config into src/config/"
```

---

## Task 3: Move `packages/state/src/*` to `src/state/`

**Files:**
- Move: `packages/state/src/*.ts` + `packages/state/src/__tests__/*.ts` (15 files) → `src/state/`
- Delete: `packages/state/package.json`

**Step 1: Copy files**

```bash
cp -r packages/state/src/ src/state/
```

**Step 2: Delete package source**

```bash
rm -rf packages/state/
```

**Step 3: Fix internal import**

`packages/state/src/agentStore.ts` imports `from '@thumbcode/config'`. After the move this file lives at `src/state/agentStore.ts` and should import `from '@/config'`.

Edit `src/state/agentStore.ts`:
```
- import { AGENT_CONFIG } from '@thumbcode/config';
+ import { AGENT_CONFIG } from '@/config';
```

**Step 4: Commit**

```bash
git add -A && git commit -m "refactor(state): move @thumbcode/state into src/state/"
```

---

## Task 4: Move `packages/core/src/*` to `src/core/`

**Files:**
- Move: `packages/core/src/**/*` (49 files in nested structure) → `src/core/`
- Delete: `packages/core/package.json`, `packages/core/tsconfig.json`

**Step 1: Copy files**

```bash
cp -r packages/core/src/ src/core/
```

**Step 2: Delete package source**

```bash
rm -rf packages/core/
```

**Step 3: Fix internal imports**

These files in `packages/core/src/` import from `@thumbcode/config` and `@thumbcode/types`:

- `src/core/auth/PollingService.ts` — `@thumbcode/config` → `@/config`
- `src/core/auth/DeviceFlowHandler.ts` — `@thumbcode/config` → `@/config`
- `src/core/auth/GitHubAuthService.ts` — `@thumbcode/config` → `@/config`
- `src/core/github/GitHubApiService.ts` — `@thumbcode/config` → `@/config`, `@thumbcode/types` → `@/types`

Edit each file to replace the `@thumbcode/*` import with `@/*`.

**Step 4: Commit**

```bash
git add -A && git commit -m "refactor(core): move @thumbcode/core into src/core/"
```

---

## Task 5: Move `packages/ui/src/*` to `src/ui/`

**Files:**
- Move: `packages/ui/src/**/*` (31 files) → `src/ui/`
- Delete: `packages/ui/package.json`

**Step 1: Copy files**

```bash
cp -r packages/ui/src/ src/ui/
```

**Step 2: Delete package source**

```bash
rm -rf packages/ui/
```

**Step 3: Commit**

```bash
git add -A && git commit -m "refactor(ui): move @thumbcode/ui into src/ui/"
```

---

## Task 6: Decompose `agent-intelligence` services into `src/services/`

**Files:**
- Move: `packages/agent-intelligence/src/services/ai/` → `src/services/ai/`
- Move: `packages/agent-intelligence/src/services/agents/` → `src/services/agents/`
- Move: `packages/agent-intelligence/src/services/mcp/` → `src/services/mcp/`
- Move: `packages/agent-intelligence/src/services/orchestrator/` → `src/services/orchestrator/`
- Move: `packages/agent-intelligence/src/services/skills/` → `src/services/skills/`
- Move: `packages/agent-intelligence/src/services/routing/` → `src/services/routing/`
- Move: `packages/agent-intelligence/src/services/tools/` → `src/services/tools/`

**Step 1: Copy all service directories**

`src/services/` already exists (has `chat/` and `repository/`). The new directories will merge alongside.

```bash
cp -r packages/agent-intelligence/src/services/ai/ src/services/ai/
cp -r packages/agent-intelligence/src/services/agents/ src/services/agents/
cp -r packages/agent-intelligence/src/services/mcp/ src/services/mcp/
cp -r packages/agent-intelligence/src/services/orchestrator/ src/services/orchestrator/
cp -r packages/agent-intelligence/src/services/skills/ src/services/skills/
cp -r packages/agent-intelligence/src/services/routing/ src/services/routing/
cp -r packages/agent-intelligence/src/services/tools/ src/services/tools/
```

**Step 2: Fix internal imports within moved services**

All `@thumbcode/types` and `@thumbcode/config` imports become `@/types` and `@/config`.
All `@thumbcode/state` imports become `@/state`.

Files to update:

| File | Old import | New import |
|------|-----------|------------|
| `src/services/agents/base-agent.ts` | `@thumbcode/types` | `@/types` |
| `src/services/agents/types.ts` | `@thumbcode/types` | `@/types` |
| `src/services/agents/index.ts` | `@thumbcode/types` | `@/types` |
| `src/services/agents/Committable.ts` | `@thumbcode/types` | `@/types` |
| `src/services/agents/Promptable.ts` | `@thumbcode/types` | `@/types` |
| `src/services/agents/Reviewable.ts` | `@thumbcode/types` | `@/types` |
| `src/services/agents/architect-agent.ts` | `@thumbcode/types` | `@/types` |
| `src/services/agents/implementer-agent.ts` | `@thumbcode/types` | `@/types` |
| `src/services/agents/reviewer-agent.ts` | `@thumbcode/types` | `@/types` |
| `src/services/agents/tester-agent.ts` | `@thumbcode/types` | `@/types` |
| `src/services/orchestrator/OrchestrationState.ts` | `@thumbcode/types` | `@/types` |
| `src/services/orchestrator/AgentCoordinator.ts` | `@thumbcode/types` | `@/types` |
| `src/services/orchestrator/orchestrator.ts` | `@thumbcode/types` | `@/types` |
| `src/services/orchestrator/TaskAssigner.ts` | `@thumbcode/types` | `@/types` |
| `src/services/routing/AgentRouter.ts` | `@thumbcode/config`, `@thumbcode/types` | `@/config`, `@/types` |
| `src/services/routing/types.ts` | `@thumbcode/config`, `@thumbcode/types` | `@/config`, `@/types` |
| `src/services/mcp/McpClient.ts` | `@thumbcode/state` | `@/state` |
| `src/services/skills/__tests__/FrontendSkill.test.ts` | `@thumbcode/types` | `@/types` |
| `src/services/orchestrator/__tests__/AgentCoordinator.test.ts` | `@thumbcode/types` | `@/types` |
| `src/services/orchestrator/__tests__/TaskAssigner.test.ts` | `@thumbcode/types` | `@/types` |
| `src/services/routing/__tests__/AgentRouter.test.ts` | `@thumbcode/types` | `@/types` |
| `src/services/mcp/__tests__/McpClient.test.ts` | `@thumbcode/state` | `@/state` |

**Step 3: Commit**

```bash
git add -A && git commit -m "refactor(services): decompose agent-intelligence services into src/services/"
```

---

## Task 7: Merge `agent-intelligence` stores, theme, and tests

**Files:**
- Move: `packages/agent-intelligence/src/stores/chatStore.ts` → merge into `src/state/` (check for conflicts with `packages/state/src/chatStore.ts` already in `src/state/`)
- Move: `packages/agent-intelligence/src/stores/__tests__/chatStore.test.ts` → merge into `src/state/__tests__/`
- Move: `packages/agent-intelligence/src/theme/organic-styles.ts` → `src/ui/theme/` (check for conflicts with `packages/ui/src/theme/organicStyles.ts`)
- Move: `packages/agent-intelligence/src/theme/__tests__/organic-styles.test.ts` → `src/ui/__tests__/`
- Move: `packages/agent-intelligence/src/__tests__/*.test.ts` → `src/__tests__/`
- Drop: `packages/agent-intelligence/src/components/chat/` (superseded by `src/components/chat/`)
- Drop: `packages/agent-intelligence/src/index.ts` (barrel no longer needed)
- Delete: `packages/agent-intelligence/package.json`, `packages/agent-intelligence/tsconfig.json`

**Step 1: Resolve store conflict**

Both `packages/state/src/chatStore.ts` (now at `src/state/chatStore.ts`) and `packages/agent-intelligence/src/stores/chatStore.ts` exist. Read both to determine if the agent-intelligence version adds anything new. If the agent-intelligence version is a subset or duplicate, skip it. If it has unique functionality, merge the unique parts into `src/state/chatStore.ts`.

Similarly for the test files.

**Step 2: Resolve theme conflict**

`packages/ui/src/theme/organicStyles.ts` (now at `src/ui/theme/organicStyles.ts`) and `packages/agent-intelligence/src/theme/organic-styles.ts` exist. Compare and merge any unique styles from the agent-intelligence version.

**Step 3: Move top-level tests**

```bash
cp packages/agent-intelligence/src/__tests__/ai-client.test.ts src/__tests__/
cp packages/agent-intelligence/src/__tests__/orchestrator.test.ts src/__tests__/
```

If `packages/agent-intelligence/src/__tests__/integration/` exists:
```bash
mkdir -p src/__tests__/integration/
cp packages/agent-intelligence/src/__tests__/integration/* src/__tests__/integration/
```

**Step 4: Delete the entire agent-intelligence package**

```bash
rm -rf packages/agent-intelligence/
```

**Step 5: Commit**

```bash
git add -A && git commit -m "refactor(agent-intelligence): merge stores/theme/tests, delete package"
```

---

## Task 8: Move `dev-tools` to `tools/`

**Files:**
- Move: `packages/dev-tools/src/*` (3 files) → `tools/`
- Delete: `packages/dev-tools/package.json`, `packages/dev-tools/tsconfig.json`

**Step 1: Copy files**

```bash
mkdir -p tools/
cp packages/dev-tools/src/check-contrast.ts tools/
cp packages/dev-tools/src/generate-icons.ts tools/
cp packages/dev-tools/src/generate-tokens.ts tools/
```

**Step 2: Delete package and directory**

```bash
rm -rf packages/dev-tools/
```

**Step 3: Remove the now-empty `packages/` directory**

```bash
rmdir packages/ 2>/dev/null || rm -rf packages/
```

**Step 4: Update root `package.json` scripts**

The `generate:tokens` and `generate:icons` scripts reference `pnpm --filter @thumbcode/dev-tools`. Update to run directly:

```json
- "generate:tokens": "pnpm --filter @thumbcode/dev-tools run generate:tokens",
- "generate:icons": "pnpm --filter @thumbcode/dev-tools run generate:icons",
- "generate:all": "pnpm --filter @thumbcode/dev-tools run generate:all",
+ "generate:tokens": "npx tsx tools/generate-tokens.ts",
+ "generate:icons": "npx tsx tools/generate-icons.ts",
+ "generate:all": "npx tsx tools/generate-tokens.ts && npx tsx tools/generate-icons.ts",
```

**Step 5: Commit**

```bash
git add -A && git commit -m "refactor(dev-tools): move to tools/, update scripts"
```

---

## Task 9: Rewrite all `@thumbcode/*` imports in `src/`

**Files:**
- Modify: ~60 files in `src/` that import from `@thumbcode/*`

**Step 1: Run a global find-and-replace**

Use the following replacements across all `.ts` and `.tsx` files in `src/`:

| Pattern | Replacement |
|---------|-------------|
| `from '@thumbcode/types'` | `from '@/types'` |
| `from '@thumbcode/config'` | `from '@/config'` |
| `from '@thumbcode/state'` | `from '@/state'` |
| `from '@thumbcode/core'` | `from '@/core'` |
| `from '@thumbcode/ui'` | `from '@/ui'` |

For `@thumbcode/agent-intelligence` imports, each must be rewritten to the specific service directory:

| File | Old import | New import |
|------|-----------|------------|
| `src/services/chat/__tests__/AgentResponseService.test.ts` | `from '@thumbcode/agent-intelligence'` | `from '@/services/ai'` (for `createAIClient`) |
| `src/services/chat/__tests__/Pipeline.test.ts` | `from '@thumbcode/agent-intelligence'` | `from '@/services/ai'` (for `createAIClient`) |
| `src/services/chat/ChatService.ts` | `from '@thumbcode/agent-intelligence'` | `from '@/services/tools'` (for `ToolExecutionBridge`) |

Note: Some `@thumbcode/agent-intelligence` imports may reference sub-paths. Check each and route to the correct `src/services/*` directory.

**Step 2: Verify no remaining `@thumbcode/` imports**

```bash
grep -r "@thumbcode/" src/ --include="*.ts" --include="*.tsx"
```

Expected: zero results.

**Step 3: Commit**

```bash
git add -A && git commit -m "refactor(imports): rewrite all @thumbcode/* to @/* path aliases"
```

---

## Task 10: Update root `package.json`

**Files:**
- Modify: `package.json`

**Step 1: Remove workspace references**

Delete these 6 lines from `dependencies`:

```json
"@thumbcode/agent-intelligence": "workspace:*",
"@thumbcode/config": "workspace:*",
"@thumbcode/core": "workspace:*",
"@thumbcode/state": "workspace:*",
"@thumbcode/types": "workspace:*",
"@thumbcode/ui": "workspace:*",
```

**Step 2: Absorb AI SDK deps from agent-intelligence**

Add to `dependencies` (these were only in `agent-intelligence/package.json`):

```json
"@ai-sdk/amazon-bedrock": "^4.0.63",
"@ai-sdk/anthropic": "^3.0.46",
"@ai-sdk/azure": "^3.0.32",
"@ai-sdk/cohere": "^3.0.21",
"@ai-sdk/deepseek": "^2.0.20",
"@ai-sdk/google": "^3.0.30",
"@ai-sdk/groq": "^3.0.24",
"@ai-sdk/mcp": "^1.0.21",
"@ai-sdk/mistral": "^3.0.20",
"@ai-sdk/openai": "^3.0.31",
"@ai-sdk/xai": "^3.0.57",
"ai": "^6.0.97",
```

Note: `@anthropic-ai/sdk`, `openai`, `react`, `zustand` are already in root deps.

**Step 3: Commit**

```bash
git add package.json && git commit -m "refactor(deps): remove workspace refs, absorb AI SDK deps"
```

---

## Task 11: Update `pnpm-workspace.yaml`

**Files:**
- Modify: `pnpm-workspace.yaml`

**Step 1: Remove packages entries**

Change from:
```yaml
packages:
  - '.'
  - 'packages/*'
  - 'docs-site'
```

To:
```yaml
packages:
  - '.'
  - 'docs-site'
```

**Step 2: Commit**

```bash
git add pnpm-workspace.yaml && git commit -m "refactor(workspace): remove packages/* from workspace"
```

---

## Task 12: Update `tsconfig.json`

**Files:**
- Modify: `tsconfig.json`

**Step 1: Remove packages from `include`**

Change `include` from:
```json
"include": [
  "src/**/*.ts",
  "src/**/*.tsx",
  "packages/*/src/**/*.ts",
  "packages/*/src/**/*.tsx",
  "vite.config.ts",
  "capacitor.config.ts"
]
```

To:
```json
"include": [
  "src/**/*.ts",
  "src/**/*.tsx",
  "vite.config.ts",
  "capacitor.config.ts"
]
```

**Step 2: Commit**

```bash
git add tsconfig.json && git commit -m "refactor(tsconfig): remove packages/ include paths"
```

---

## Task 13: Update `vitest.config.ts`

**Files:**
- Modify: `vitest.config.ts`

**Step 1: Simplify test includes**

Change `test.include` from:
```typescript
include: [
  'src/**/__tests__/**/*.test.{ts,tsx}',
  'packages/state/src/__tests__/**/*.test.{ts,tsx}',
  'packages/core/src/**/__tests__/**/*.test.{ts,tsx}',
  'packages/config/src/__tests__/**/*.test.{ts,tsx}',
  'packages/ui/src/__tests__/**/*.test.{ts,tsx}',
  'packages/agent-intelligence/src/**/__tests__/**/*.test.{ts,tsx}',
],
```

To:
```typescript
include: [
  'src/**/__tests__/**/*.test.{ts,tsx}',
],
```

**Step 2: Simplify coverage includes**

Change `coverage.include` from:
```typescript
include: ['src/**/*.{ts,tsx}', 'packages/*/src/**/*.{ts,tsx}'],
```

To:
```typescript
include: ['src/**/*.{ts,tsx}'],
```

**Step 3: Commit**

```bash
git add vitest.config.ts && git commit -m "refactor(vitest): remove packages/ from test config"
```

---

## Task 14: Install deps and verify

**Step 1: Reinstall dependencies**

```bash
pnpm install
```

This resolves the new AI SDK dependencies and removes workspace linking.

**Step 2: Type check**

```bash
pnpm typecheck
```

Expected: 0 errors. If there are errors, they'll be from:
- Missing imports (a `@thumbcode/*` import we missed)
- Type resolution issues from barrel re-exports

Fix any errors found.

**Step 3: Run tests**

```bash
pnpm test
```

Expected: All tests pass. The test files moved with their sources, so relative imports within `__tests__/` directories should still work.

**Step 4: Lint**

```bash
pnpm lint
```

Fix any formatting or lint issues with `pnpm lint:fix`.

**Step 5: Commit any fixes**

```bash
git add -A && git commit -m "fix: resolve typecheck/test/lint errors from flatten"
```

---

## Task 15: Update documentation

**Files:**
- Modify: `CLAUDE.md` — update File Structure section, remove Monorepo Packages table
- Modify: `AGENTS.md` — update any references to `packages/agent-intelligence`

**Step 1: Update CLAUDE.md**

- Remove "Monorepo Packages" table (the packages no longer exist)
- Update "File Structure" to show `src/types/`, `src/config/`, `src/state/`, `src/core/`, `src/ui/`, and the expanded `src/services/`
- Update "Stack" table: change "Monorepo" row from "pnpm workspaces" to "Flat src/ structure"
- Remove references to `@thumbcode/*` package names
- Update `package.json` references in Key Decisions

**Step 2: Update AGENTS.md**

Replace any `packages/agent-intelligence/src/services/` paths with `src/services/`.

**Step 3: Commit**

```bash
git add CLAUDE.md AGENTS.md && git commit -m "docs: update for flattened structure"
```

---

## Task 16: Final verification

**Step 1: Verify no packages/ directory remains**

```bash
ls packages/ 2>/dev/null && echo "FAIL: packages/ still exists" || echo "PASS: packages/ removed"
```

**Step 2: Verify no @thumbcode/ imports remain**

```bash
grep -r "@thumbcode/" src/ --include="*.ts" --include="*.tsx" | head -20
```

Expected: zero results.

**Step 3: Full verification suite**

```bash
pnpm typecheck && pnpm test && pnpm lint
```

All three must pass.

**Step 4: Final commit if needed**

```bash
git add -A && git commit -m "chore: final flatten verification cleanup"
```
