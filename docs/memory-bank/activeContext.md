# ThumbCode Active Context

> Last Updated: February 2026

## Current Work Focus

**v1.0 Consolidation & Completion** -- The project is in a consolidation wave that reconnects disconnected packages, refactors monolithic pages, consolidates documentation, and wires the multi-agent pipeline end-to-end.

The work is tracked via `tasks/prd.json` with 24 user stories organized by priority.

## Recent Completed Work (Wave 1 & 2)

### Completed Stories (9 of 24)

| Story | Title | Summary |
|-------|-------|---------|
| **US-001** | Modernize agent-intelligence for web | Removed React Native deps, migrated to Vitest |
| **US-002** | Replace src/services/ai/ with agent-intelligence | Deleted duplicate AI clients, app uses src/services/ai/ |
| **US-007** | Establish src/ui/ as canonical component library | src/components/ui/ re-exports from src/ui/ |
| **US-009** | Refactor create-project.tsx | Extracted useCreateProject hook, page reduced to ~100 lines |
| **US-010** | Refactor ProjectDetail.tsx | Extracted useProjectFiles, useProjectActions, useProjectCommits hooks |
| **US-012** | Refactor tab pages | Extracted useHomeDashboard, useProjectList, useAgentList hooks |
| **US-014** | Create memory bank foundation files | projectbrief.md, productContext.md, techContext.md created |
| **US-017** | Update config files, remove Expo vestiges | .env.example uses VITE_*, Expo artifacts deleted |
| **US-018** | Update Biome, Semgrep, TypeScript configs | All packages now linted and typechecked |

### Key Technical Migrations Completed

- **Expo -> Capacitor**: Full migration from React Native/Expo to React 18 + Vite 7 + Capacitor 8
- **NativeWind -> Tailwind CSS**: Standard web Tailwind replaces NativeWind
- **expo-router -> React Router DOM 7**: File-based to standard client-side routing
- **Jest -> Vitest**: All test suites migrated
- **ESLint -> Biome**: Single tool for lint + format
- **Metro -> Vite**: Bundler migration complete

## Currently In Progress

| Story | Title | Status |
|-------|-------|--------|
| **US-008** | Refactor chat.tsx | Extracting chat-utils, components, hooks |
| **US-011** | Refactor AgentDetail.tsx | Extracting useAgentDetail hook |
| **US-013** | Lazy-load icon-paths.ts, consolidate organic styling | Dynamic import + Tailwind-only migration |
| **US-015** | Create docs/ memory bank working files | This work -- systemPatterns, activeContext, progress + docs subdirs |

## Next Priorities

### Immediate (Wave 3)

1. **US-003**: Wire orchestrator for single-agent routing -- connect AgentOrchestrator to real message flow
2. **US-004**: Wire orchestrator for multi-agent pipeline -- task queue with Architect -> Implementer -> Reviewer -> Tester
3. **US-016**: Create AGENTS.md, update CLAUDE.md to reflect current stack
4. **US-019**: Remove dead src/types/ directory (all types come from packages)

### Near-Term (Wave 4)

5. **US-005**: Connect agent read tools to core git services
6. **US-006**: Connect agent write tools and approval-triggered commits
7. **US-020**: Remove dead exports, unused components, cleanup debris

### Testing Push (Wave 5)

8. **US-021**: Unit tests for all tab pages
9. **US-022**: Unit tests for settings and detail pages
10. **US-023**: Fix E2E chat crash, restore skipped tests
11. **US-024**: Achieve 80%+ statement coverage (currently ~35%)

## Open Questions

1. **Orchestrator wiring strategy** -- Should single-agent routing (US-003) modify AgentResponseService directly or introduce a new message routing layer?
2. **E2E chat crash** -- Chat page crashes in Playwright E2E. May be resolved by US-008 refactor. Needs investigation.
3. **Test coverage gap** -- 35% statements vs 80% target. The testing push (US-021 through US-024) is the final wave.
4. **Domain registration** -- thumbcode.app, thumbcode.dev not yet purchased.
5. **PaintDaubeIcon bundle impact** -- icon-paths.ts is 924 lines loaded eagerly. US-013 addresses with lazy loading.

## Architecture Decisions Pending

- ~~Root-level docs cleanup~~ — Resolved: stale Expo-era docs removed, current docs consolidated in `docs/`
- How to handle the Capacitor plugin configuration for secure storage when running on web vs native
- MCP server integration approach for agent tool calling
