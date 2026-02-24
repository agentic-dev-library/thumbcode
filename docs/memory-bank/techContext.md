# ThumbCode Technical Context

> Last Updated: February 2026
> Stack: React 18 + Vite 7 + Capacitor 8 (migrated from Expo SDK 52)

## Current Technology Stack

The project migrated from React Native + Expo to a web-first React + Capacitor architecture. This document reflects the **current** stack.

### Core Stack

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| **UI Framework** | React | 18.3.1 | Component library |
| **DOM** | React DOM | 18.3.1 | Web rendering |
| **Build Tool** | Vite | 7.3.x | Dev server, bundler, HMR |
| **Native Shell** | Capacitor | 8.1.x | iOS/Android native wrapper |
| **Routing** | React Router DOM | 7.13.x | Client-side navigation |
| **Styling** | Tailwind CSS | 3.4.x | Utility-first CSS |
| **State** | Zustand | 5.x | Global state management |
| **Schema** | Zod | 3.23.x | Runtime type validation |
| **Git** | isomorphic-git | 1.27.x | Client-side git operations |
| **AI (Primary)** | Anthropic SDK | 0.32.x | Claude API integration |
| **AI (Secondary)** | OpenAI SDK | 4.70.x | GPT API integration |
| **Icons** | Lucide React | 0.563.x | Icon library |
| **Dates** | date-fns | 4.1.x | Date utilities |
| **Diffing** | diff | 8.x | Text diff generation |
| **Immutability** | Immer | 10.2.x | Immutable state updates |
| **Utilities** | lodash-es | 4.17.x | Utility functions (ESM) |

### Capacitor Plugins

| Plugin | Version | Purpose |
|--------|---------|---------|
| `@capacitor/core` | 8.1.x | Core Capacitor runtime |
| `@capacitor/ios` | 8.1.x | iOS platform support |
| `@capacitor/android` | 8.1.x | Android platform support |
| `@capacitor/device` | 8.x | Device info API |
| `@capacitor/filesystem` | 8.1.x | File system access |
| `capacitor-secure-storage-plugin` | 0.13.x | Encrypted credential storage |
| `@aparajita/capacitor-biometric-auth` | 10.x | Biometric authentication |

### Development Tools

| Tool | Version | Purpose |
|------|---------|---------|
| **Biome** | 2.3.x | Linting and formatting (replaces ESLint + Prettier) |
| **TypeScript** | 5.6.x | Static typing |
| **Vitest** | 4.x | Unit/integration testing |
| **Playwright** | 1.57.x | E2E browser testing |
| **Testing Library** | 16.3.x | React component testing |
| **TypeDoc** | 0.28.x | API documentation generation |
| **pnpm** | 10.11.x | Package manager (workspaces) |
| **commitlint** | 19.x | Conventional commit enforcement |

### What Changed from Expo

| Concern | Old (Expo) | Current (Capacitor) |
|---------|-----------|-------------------|
| Framework | React Native + Expo SDK 52 | React 18 + React DOM |
| Bundler | Metro | Vite 7 |
| Native shell | Expo managed workflow | Capacitor 8 |
| Routing | expo-router (file-based) | React Router DOM 7 |
| Styling | NativeWind (Tailwind for RN) | Tailwind CSS (standard) |
| Credentials | expo-secure-store | capacitor-secure-storage-plugin |
| File system | expo-file-system | @capacitor/filesystem |
| Biometrics | expo-local-authentication | @aparajita/capacitor-biometric-auth |
| Testing | Jest | Vitest |
| E2E testing | Maestro | Playwright |
| Linting | ESLint | Biome |
| Build/deploy | EAS Build (cloud) | Vite build + Capacitor sync (local) |

## Development Setup

### Prerequisites

- Node.js (LTS)
- pnpm 10.x (`corepack enable && corepack prepare pnpm@latest --activate`)
- For iOS: Xcode + CocoaPods
- For Android: Android Studio + SDK

### Getting Started

```bash
# Install all workspace dependencies
pnpm install

# Start Vite dev server (web)
pnpm dev              # http://localhost:5173

# Build for production
pnpm build            # outputs to dist/

# Sync to native projects
pnpm cap:sync         # copies dist/ to iOS/Android

# Open native IDEs
pnpm cap:open:ios     # opens Xcode
pnpm cap:open:android # opens Android Studio

# Full native build
pnpm cap:build        # vite build + cap sync
```

### Quality Commands

```bash
# Linting (Biome)
pnpm lint             # check all files
pnpm lint:fix         # auto-fix issues

# Type checking
pnpm typecheck        # tsc --noEmit

# Testing
pnpm test             # vitest run
pnpm test:watch       # vitest (watch mode)
pnpm test:coverage    # vitest with coverage

# E2E
pnpm test:e2e:web     # playwright test

# Formatting
pnpm format           # biome format --write
```

## Project Structure

### Monorepo Layout (pnpm workspaces)

```
thumbcode/
├── src/                          # Main application source
│   ├── components/               # React components
│   │   ├── ui/                   # Design system primitives
│   │   ├── agents/               # Agent-related components
│   │   ├── workspace/            # Code workspace components
│   │   ├── chat/                 # Chat interface components
│   │   └── project/              # Project management components
│   ├── hooks/                    # Custom React hooks
│   ├── stores/                   # Zustand state stores
│   ├── services/                 # External service integrations
│   │   ├── git/                  # isomorphic-git wrapper
│   │   ├── github/               # GitHub API + Device Flow
│   │   ├── ai/                   # Anthropic/OpenAI clients
│   │   └── credentials/         # Secure storage wrapper
│   ├── types/                    # TypeScript type definitions
│   ├── utils/                    # Utility functions
│   └── lib/                      # Core libraries
├── packages/                     # Workspace packages
│   ├── agent-intelligence/       # AI agent logic, orchestrator
│   ├── core/                     # Git, credentials, auth services
│   ├── config/                   # Environment config, feature flags
│   ├── state/                    # Zustand stores (shared)
│   ├── types/                    # Shared TypeScript types
│   ├── ui/                       # Shared UI components
│   └── dev-tools/                # Token/icon generators
├── design-system/                # Design tokens (JSON, TS, CSS)
├── docs/                         # Documentation

├── e2e/                          # Playwright E2E tests
├── ios/                          # Capacitor iOS project
├── android/                      # Capacitor Android project
├── public/                       # Static assets (logos, icons, brand)
└── scripts/                      # Build/setup scripts
```

### Key Configuration Files

| File | Purpose |
|------|---------|
| `vite.config.ts` | Vite build config (React plugin, path aliases) |
| `capacitor.config.ts` | Capacitor native config (appId, webDir) |
| `tsconfig.json` | TypeScript config (ES2022, bundler resolution) |
| `tailwind.config.ts` | Tailwind with brand colors, organic patterns |
| `biome.json` | Biome lint + format rules |
| `vitest.config.ts` | Vitest test configuration |
| `playwright.config.ts` | Playwright E2E config |
| `pnpm-workspace.yaml` | pnpm workspace definition |
| `package.json` | Root dependencies, scripts |

### Path Aliases (tsconfig)

```
@/*              → src/*
@/components/*   → src/components/*
@/hooks/*        → src/hooks/*
@/services/*     → src/services/*
@/types/*        → src/types/*
@/utils/*        → src/utils/*
@/design-system/* → design-system/*
```

## Dependencies & Architecture Decisions

### State Management (Zustand 5)

Slice-based stores with actions and selectors:

```
userStore       → credentials, preferences
  ↓
projectStore    → repos, git state → workspaceStore (files, changes)
  ↓
agentStore      ↔ chatStore (messages, streaming)
```

### Security Architecture

- API keys stored via `capacitor-secure-storage-plugin` (uses iOS Keychain / Android Keystore)
- GitHub auth via Device Flow (no embedded browser needed)
- Anthropic keys validated via test API call before storage
- No credentials ever leave the device

### Build Pipeline

```
Source (src/) → Vite Build → dist/ → Capacitor Sync → iOS/Android
                                  ↘ Web deploy (Netlify/Render)
```

CI/CD: GitHub Actions (`ci.yml`) runs lint → typecheck → test → build on every push.

## Current Project Metrics (February 2026)

| Metric | Value |
|--------|-------|
| Lines of Code | ~11,400 |
| Test Suites | 21 passed, 1 skipped |
| Tests | 245 passed, 3 skipped |
| Statement Coverage | 34.78% |
| Branch Coverage | 18.23% |
| Code Duplication (jscpd) | 2.38% (40 clones) |
| Semgrep SAST Findings | TBD (first scan) |
| Lint/TypeCheck | Clean |
| Security Audit (prod) | 0 vulnerabilities |

## Known Technical Debt

1. **Mock AI integration** — `ChatService` returns hardcoded responses instead of calling APIs
2. **Stubbed orchestration** — Multi-agent coordination not wired to real execution
3. **Monolithic files** — `PaintDaubeIcon.tsx` (1,268 lines), `GitService.ts` (1,055 lines)
4. **Low test coverage** — 34.78% statements, target is 60%
5. **Documentation consolidation** — Stale Expo-era docs removed; current docs in `docs/architecture/` and `docs/memory-bank/`
6. **Skipped E2E tests** — Both Playwright test files marked "pending UX research"
