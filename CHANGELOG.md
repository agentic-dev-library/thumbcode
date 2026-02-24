# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2026-01-18

> **Note:** Package names below (e.g. `@thumbcode/agent-intelligence`) reflect the original monorepo structure. As of February 2026, all packages were flattened into `src/` subdirectories. See `docs/architecture/decisions.md` DEC-011 for details.

### Added

**Monorepo Architecture**
- pnpm workspace with 7 packages: `agent-intelligence`, `config`, `core`, `dev-tools`, `state`, `types`, `ui`
- Workspace protocol (`workspace:*`) for internal package references

**Agent Intelligence (`@thumbcode/agent-intelligence`)**
- Unified AI client abstraction supporting Anthropic and OpenAI providers
- Streaming completion support with event-based callbacks
- Tool/function calling support across providers
- Specialized agents: Architect, Implementer, Reviewer, Tester
- `BaseAgent` class with role-based system prompts and task execution
- `createAgent` factory function and `DEFAULT_AGENT_CONFIGS`
- Multi-agent orchestrator with task queuing and dependency resolution
- Parallel execution support with configurable concurrency
- Agent metrics tracking (tokens, duration, success rate)
- Chat components: `ChatBubble`, `ChatInput`, `CodeBlock`, `ActionButton`
- Chat store for managing threads and messages

**Core Services (`@thumbcode/core`)**
- `GitService` with isomorphic-git: clone, commit, push, pull, branch, diff, status
- `GitHttpClient` for authenticated Git HTTP operations
- `CredentialService` with Expo SecureStore hardware-backed encryption
- Biometric authentication for credential access
- API key format validation for Anthropic and GitHub tokens
- `GitHubAuthService` implementing Device Flow + PKCE (no backend required)
- `GitHubApiService` REST client for repository and user operations
- `CertificatePinningService` for TLS certificate verification
- `RequestSigningService` for HMAC request signing
- `RuntimeSecurityService` for jailbreak/root detection

**Configuration (`@thumbcode/config`)**
- Environment configuration via Expo Constants with type-safe access
- Environment validation with required variable checking per environment
- Centralized constants: API URLs, OAuth config, storage keys, rate limits
- Feature flag system with environment-aware toggling
- Development-only feature overrides

**State Management (`@thumbcode/state`)**
- Zustand stores with Immer for immutable updates
- `agentStore` -- agent lifecycle, tasks, status tracking with selectors
- `chatStore` -- threads, messages, typing indicators, approvals
- `credentialStore` -- credential metadata, validation state
- `projectStore` -- projects, workspaces, file trees, branches
- `userStore` -- authentication, settings, preferences
- AsyncStorage persistence layer

**Type Definitions (`@thumbcode/types`)**
- Domain-organized type modules: agents, projects, workspaces, credentials, chat, user, navigation, API, events
- Subpath exports for tree-shakeable imports

**UI Components (`@thumbcode/ui`)**
- `Text` primitive with themed font family support
- `Button` with organic border-radius and coral/teal/gold variants
- `Input` with organic border styling
- `Card` with asymmetric border-radius and organic shadows
- `Container` page layout wrapper
- `Header` with back navigation
- `Alert` with success/error/warning/info variants
- `Spinner` loading indicator
- `ThemeProvider` with `useTheme`, `useColor`, `useSpacing` hooks
- `organicBorderRadius` and `organicShadow` style presets
- Semantic `Icon` component with Ionicons backend

**Dev Tools (`@thumbcode/dev-tools`)**
- TypeScript design token generator (JSON to CSS variables and Tailwind config)
- SVG to PNG icon generator using Sharp (icon, splash, adaptive-icon, favicon)

**App Screens**
- Root layout with Stack navigation
- Tab navigation: Home, Projects, Agents, Chat, Settings
- Onboarding flow: Welcome, API Keys, GitHub Auth, Configuration, Complete
- Project detail and agent detail screens
- Settings screen with theme, editor, and notification preferences
- Demo home screen showcasing the design system

**Design System**
- P3 "Warm Technical" brand identity: Coral/Teal/Gold on Charcoal
- Organic asymmetric border-radius ("paint daube" aesthetic)
- Fraunces (display), Cabin (body), JetBrains Mono (code) typography
- JSON-based design tokens with auto-generation pipeline
- CSS custom properties and Tailwind color config generation

**Infrastructure**
- Expo SDK 52 with expo-router file-based navigation
- NativeWind (Tailwind CSS) for styling
- Biome for linting and formatting
- Commitlint with conventional commit enforcement
- Jest test suite with jest-expo preset
- Playwright E2E tests for web
- GitHub Actions CI: lint, typecheck, test, build validation
- GitHub Actions: PR review, CI auto-fix, issue triage, multi-agent workflows
- Netlify web deployment pipeline
- EAS Build profiles for development, preview, and production
- Local quality stack: Vitest coverage thresholds, Semgrep SAST, jscpd duplication detection

### Security

- Hardware-backed credential encryption via Expo SecureStore
- BYOK model -- user API keys never leave the device
- Certificate pinning for API requests
- HMAC request signing
- Runtime integrity checks (jailbreak/root detection)
- No server-side credential storage
