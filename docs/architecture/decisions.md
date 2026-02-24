# ThumbCode Technical Decisions Registry

> Migrated from root DECISIONS.md and updated for current stack (February 2026)
>
> Agents MUST consult this before proposing changes to established patterns.

---

## DEC-001: React 18 + Vite + Capacitor

**Status:** Accepted (Updated)
**Date:** January 2026 (originally Expo), migrated February 2026
**Context:** Choosing the foundation for cross-platform mobile development.

**Decision:** Use React 18 + Vite 7 as the build system with Capacitor 8 for native shell.

**Rationale:**
- Web-first approach gives maximum compatibility and faster development
- Vite provides fast HMR and modern ES module bundling
- Capacitor wraps the web app in native shell with plugin access to device APIs
- Standard React DOM means full web ecosystem compatibility
- Easier for AI agents to generate standard React + Tailwind code

**History:** Originally chose Expo SDK 52+ but migrated due to bundler complexity (Metro), native module constraints, and the need for standard web tooling.

**Consequences:**
- Must use Capacitor plugins instead of Expo modules
- Web-first means some mobile-specific patterns need adaptation
- Better web deployment story (direct Netlify deploy)

---

## DEC-002: Tailwind CSS (Standard)

**Status:** Accepted (Updated)
**Date:** February 2026 (migrated from NativeWind)
**Context:** Styling approach after Expo -> Capacitor migration.

**Decision:** Use standard Tailwind CSS instead of NativeWind.

**Rationale:**
- Standard Tailwind works natively with web React + Vite
- No React Native bridge layer needed
- Full Tailwind ecosystem compatibility
- AI agents generate excellent Tailwind code
- Brand tokens integrated via tailwind.config.ts

**History:** Originally used NativeWind 4.x (Tailwind for React Native). Migrated to standard Tailwind CSS with the Capacitor migration.

---

## DEC-003: Zustand 5 for State Management

**Status:** Accepted
**Date:** January 2026
**Context:** Choosing global state management approach.

**Decision:** Use Zustand 5.x with slice-based stores.

**Rationale:**
- Minimal boilerplate compared to Redux
- No providers needed (works outside React tree)
- Built-in devtools support
- Easy to test (just functions)
- TypeScript-first design
- Supports middleware for persistence, logging

---

## DEC-004: isomorphic-git for Git Operations

**Status:** Accepted
**Date:** January 2026
**Context:** Implementing git operations in JavaScript environment.

**Decision:** Use isomorphic-git for all git operations.

**Rationale:**
- Pure JavaScript, no native dependencies
- Works with @capacitor/filesystem for storage
- Full git protocol support (clone, fetch, push, etc.)
- Can run entirely on device (credential sovereignty)

---

## DEC-005: Capacitor Secure Storage for Credentials

**Status:** Accepted (Updated)
**Date:** February 2026 (migrated from expo-secure-store)
**Context:** Securely storing API keys and tokens.

**Decision:** Use `capacitor-secure-storage-plugin` for all sensitive credential storage.

**Rationale:**
- Uses iOS Keychain and Android Keystore
- Hardware-backed encryption where available
- Simple key-value API
- No credentials ever leave the device

**History:** Originally used expo-secure-store. Migrated to capacitor-secure-storage-plugin.

---

## DEC-006: GitHub Device Flow for Authentication

**Status:** Accepted
**Date:** January 2026
**Context:** Authenticating with GitHub from mobile without web views.

**Decision:** Use GitHub's Device Flow (OAuth 2.0 Device Authorization Grant).

**Rationale:**
- No embedded web view required
- User authenticates in their own browser
- Better security (no credential interception)
- Works without a backend server

---

## DEC-007: Anthropic as Primary AI Provider

**Status:** Accepted
**Date:** January 2026
**Context:** Choosing the primary AI provider for agent capabilities.

**Decision:** Use Anthropic's Claude as the primary AI provider, OpenAI as secondary.

**Rationale:**
- Superior code understanding and generation
- Long context window (200K tokens)
- MCP (Model Context Protocol) support
- Strong safety and alignment properties

---

## DEC-008: Organic Visual Language ("Paint Daubes")

**Status:** Accepted
**Date:** January 2026
**Context:** Establishing visual identity for ThumbCode brand.

**Decision:** Use "paint daub" aesthetic with asymmetric border radii and warm colors (P3 "Warm Technical" palette).

**Rationale:**
- Differentiates from cold, technical developer tools
- Conveys approachability for mobile-first users
- Memorable and distinctive brand identity
- Humanizes AI interaction

---

## DEC-009: React Router DOM for Navigation

**Status:** Accepted (Updated)
**Date:** February 2026 (migrated from expo-router)
**Context:** Client-side routing after Capacitor migration.

**Decision:** Use React Router DOM 7 for client-side navigation.

**Rationale:**
- Standard React ecosystem routing
- Well-documented, widely used
- Supports nested routes, layouts, and guards
- AI agents generate excellent React Router code

**History:** Originally used expo-router (file-based routing). Migrated to React Router DOM with the Capacitor migration.

---

## DEC-010: Multi-Agent Architecture

**Status:** Accepted
**Date:** January 2026
**Context:** Defining how AI agents collaborate.

**Decision:** Implement specialized agent roles (Architect, Implementer, Reviewer, Tester) with orchestrator coordination.

**Rationale:**
- Mirrors real engineering team structure
- Enables separation of concerns
- Allows parallel execution of independent tasks
- Creates natural review/approval checkpoints

---

## DEC-011: Flat src/ Structure (Previously pnpm Workspaces)

**Status:** Accepted (Updated)
**Date:** January 2026 (original); February 2026 (flattened)
**Context:** Organizing shared code across the project.

**Decision:** As of the 2026-02 refactor, the 7 pnpm workspace packages were flattened into `src/`. All code now lives under `src/` with `@/*` path aliases. There are no longer separate `packages/` workspace entries.

**Rationale:**
- Eliminates workspace overhead and inter-package build ordering
- Single lint and typecheck pass over the whole codebase
- Simpler `@/*` imports without package name indirection
- Easier for agents to locate and modify code

**History:** Originally used pnpm workspaces with 7 packages (`agent-intelligence`, `core`, `config`, `state`, `types`, `ui`, `dev-tools`). These were merged into `src/` subdirectories in February 2026.

---

## DEC-012: Biome for Lint + Format

**Status:** Accepted
**Date:** February 2026
**Context:** Consolidating code quality tooling.

**Decision:** Use Biome as the single tool for linting and formatting, replacing ESLint + Prettier.

**Rationale:**
- Single tool reduces configuration complexity
- Faster than ESLint (Rust-based)
- Consistent formatting without separate Prettier config
- Good TypeScript and React support

---

## DEC-013: Vitest for Testing

**Status:** Accepted
**Date:** February 2026 (migrated from Jest)
**Context:** Testing framework after Vite migration.

**Decision:** Use Vitest for all unit and integration tests.

**Rationale:**
- Native Vite integration (shares config, transforms, plugins)
- Jest-compatible API for easy migration
- Faster execution
- Built-in coverage reporting

**History:** Originally used Jest. Migrated to Vitest with the Vite migration.

---

## How to Add New Decisions

1. Create new entry with next number (DEC-XXX)
2. Fill in all fields (Status, Date, Context, Decision, Rationale, Consequences, Alternatives)
3. Get Architect approval before implementing
4. Update this document via PR
5. Reference decision number in related code comments
