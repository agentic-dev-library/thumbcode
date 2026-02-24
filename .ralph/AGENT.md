# Ralph Agent Configuration — ThumbCode

## Stack
- **Framework:** React 18 + Vite 7 (web SPA) + Capacitor 8 (native shell)
- **Routing:** react-router-dom v7
- **Styling:** Tailwind CSS 3.x
- **State:** Zustand 5 + Immer
- **Testing:** Vitest (unit/integration) + Playwright (E2E)
- **Linting:** Biome 2.4.4
- **Structure:** Flat src/ with @/* path aliases (packages flattened as of 2026-02)
- **AI:** @anthropic-ai/sdk, openai SDK

## Build Instructions

```bash
# Install dependencies
pnpm install

# Build the web app
pnpm build

# Build + sync Capacitor native shells
pnpm cap:build
```

## Test Instructions

```bash
# Run all unit/integration tests
pnpm test

# Run tests with coverage report
pnpm test:coverage

# Run E2E tests (requires dev server running)
pnpm test:e2e:web
```

## Lint & Typecheck

```bash
# Lint (Biome)
pnpm lint

# Fix lint issues
pnpm lint:fix

# TypeScript type checking
pnpm typecheck
```

## Run Instructions

```bash
# Start dev server
pnpm dev
```

## Key Directories
- `src/` — Main application code (pages, components, services, hooks, state, types, ui, core, config)
- `tools/` — Build-time scripts (token generator, icon generator)
- `docs/` — Architecture decisions, memory bank, brand guidelines
- `android/` — Capacitor Android project
- `ios/` — Capacitor iOS project
- `design-system/` — Design tokens and generated CSS
- `e2e/` — Playwright E2E test specs
- `.ralph/` — Ralph configuration

## Notes
- IMPORTANT: The project migrated from Expo/React Native to Capacitor/Vite on 2026-02-12. Many docs still reference the old Expo stack — trust the code, not the docs.
- Uses pnpm, not npm or yarn.
- Biome is the linter (not ESLint — the eslint.config.mjs is vestigial).
- Tests use Vitest (not Jest — Jest config in agent-intelligence is vestigial).
