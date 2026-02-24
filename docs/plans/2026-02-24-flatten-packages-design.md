# Design: Flatten Monorepo Packages into src/

**Date:** 2026-02-24
**Status:** Approved

## Problem

ThumbCode uses a monorepo `packages/` structure with 7 workspace packages. This is unnecessary overhead for a single Capacitor app. There are no separate deployable units, the dependency chain is at most 2 levels deep, and the workspace ceremony (separate package.json files, `workspace:*` protocol, pnpm linking, multiple tsconfig/vitest configs) adds complexity with no benefit.

The worst offender is `agent-intelligence` — a mini-app with its own components, stores, theme, and services that should have been part of the app from the start.

## Decision

Full flatten. Dissolve all 6 runtime packages into `src/`. Keep `dev-tools` as a standalone `tools/` directory.

## Directory Mapping

### Simple packages (direct move)

| Package | Target |
|---------|--------|
| `packages/types/src/*` | `src/types/` |
| `packages/config/src/*` | `src/config/` |
| `packages/state/src/*` | `src/state/` |
| `packages/core/src/*` | `src/core/` |
| `packages/ui/src/*` | `src/ui/` |
| `packages/dev-tools/src/*` | `tools/` |

### agent-intelligence (decompose and merge)

| Source | Target |
|--------|--------|
| `services/ai/` | `src/services/ai/` |
| `services/agents/` | `src/services/agents/` |
| `services/mcp/` | `src/services/mcp/` |
| `services/orchestrator/` | `src/services/orchestrator/` |
| `services/skills/` | `src/services/skills/` |
| `services/routing/` | `src/services/routing/` |
| `services/tools/` | `src/services/tools/` |
| `stores/*` | `src/state/` (merge) |
| `theme/*` | `src/ui/theme/` (merge) |
| `__tests__/*` | `src/__tests__/` (merge) |
| `components/chat/*` | **Drop** (superseded by `src/components/chat/`) |
| `index.ts` | **Drop** (no barrel) |
| `package.json` | **Drop** |

## Import Rewrites

All `@thumbcode/*` imports become `@/*` path aliases:

| Before | After |
|--------|-------|
| `from '@thumbcode/types'` | `from '@/types'` |
| `from '@thumbcode/config'` | `from '@/config'` |
| `from '@thumbcode/state'` | `from '@/state'` |
| `from '@thumbcode/core'` | `from '@/core'` |
| `from '@thumbcode/ui'` | `from '@/ui'` |
| `from '@thumbcode/agent-intelligence'` | `from '@/services/{specific-dir}'` |

Sub-path imports also flatten (e.g. `from '@thumbcode/state/agent'` becomes `from '@/state/agentStore'`).

Internal imports within moved packages change from relative to `@/` aliases where appropriate, and intra-directory imports stay relative.

## Config Changes

**Delete:**
- All `packages/*/package.json`
- `pnpm-workspace.yaml` package entries (keep root `.` entry)
- Any `packages/*/tsconfig.json`

**Update:**
- Root `tsconfig.json` — path aliases already cover `@/*` mapping to `src/*`
- Root `package.json` — remove `@thumbcode/*` workspace deps, absorb AI SDK deps from agent-intelligence
- Vitest — consolidate to single root config

**Create:**
- Barrel `index.ts` in `src/types/`, `src/config/`, `src/state/`, `src/core/`, `src/ui/` for clean import boundaries

## Dependencies

AI-specific deps from `agent-intelligence/package.json` move to root:
- `@ai-sdk/mcp`, `@ai-sdk/anthropic`, `@ai-sdk/openai`, `@ai-sdk/google`, etc.
- `@anthropic-ai/sdk`, `openai`, `ai`

## What Stays the Same

- All app code structure (`pages/`, `components/`, `hooks/`, `contexts/`, `layouts/`)
- Third-party dependency versions
- Test co-location pattern (`__tests__/` directories)
- Build tooling (Vite + Capacitor)
