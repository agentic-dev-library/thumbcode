# ThumbCode Technical Decisions Registry

This document records significant technical decisions and their rationale. Agents MUST consult this before proposing changes to established patterns.

---

## DEC-001: Expo SDK 52+ with New Architecture

**Status:** Accepted  
**Date:** January 2026  
**Context:** Choosing the foundation for cross-platform mobile development.

**Decision:** Use Expo SDK 52+ with the New Architecture (Fabric renderer, TurboModules) enabled.

**Rationale:**
- Expo provides the fastest path to iOS and Android deployment
- SDK 52+ includes stable New Architecture support for better performance
- expo-router provides file-based routing familiar to web developers
- EAS Build/Submit handles the entire deployment pipeline
- Managed workflow avoids native code complexity for v1

**Consequences:**
- Some native modules may not yet support New Architecture
- Must use Expo-compatible libraries or write custom modules
- Performance benefits from synchronous native calls

**Alternatives Considered:**
- React Native CLI: More control but significantly more setup/maintenance
- Flutter: Different language (Dart), smaller ecosystem for our needs
- Native development: Would require two codebases

---

## DEC-002: NativeWind 4.x for Styling

**Status:** Accepted  
**Date:** January 2026  
**Context:** Choosing a styling approach for React Native components.

**Decision:** Use NativeWind 4.x to bring Tailwind CSS to React Native.

**Rationale:**
- Consistent with web Tailwind patterns (team familiarity)
- Design tokens can be shared between web docs and mobile app
- v4 has native CSS support, better performance than v2/v3
- Utility-first approach works well with AI code generation
- Easy to express our organic border-radius patterns

**Consequences:**
- Some Tailwind utilities don't translate to React Native
- Must understand RN layout model (flexbox-only)
- Custom utilities needed for organic patterns

**Alternatives Considered:**
- StyleSheet.create: Verbose, no design system integration
- styled-components: Runtime overhead, different mental model
- Tamagui: Promising but less mature ecosystem

---

## DEC-003: Zustand for State Management

**Status:** Accepted  
**Date:** January 2026  
**Context:** Choosing global state management approach.

**Decision:** Use Zustand 5.x for global state management.

**Rationale:**
- Minimal boilerplate compared to Redux
- No providers needed (works outside React tree)
- Built-in devtools support
- Easy to test (just functions)
- Supports middleware for persistence, logging
- TypeScript-first design

**Consequences:**
- Less opinionated than Redux (need our own patterns)
- Smaller community than Redux (but growing fast)
- Must define our own slice patterns

**Alternatives Considered:**
- Redux Toolkit: More boilerplate, heavier
- Jotai: Good for derived state, less obvious for our needs
- React Context: Not scalable for complex state
- MobX: Magic proxies can confuse agents

---

## DEC-004: isomorphic-git for Git Operations

**Status:** Accepted  
**Date:** January 2026  
**Context:** Implementing git operations in JavaScript environment.

**Decision:** Use isomorphic-git for all git operations.

**Rationale:**
- Pure JavaScript, no native dependencies
- Works with expo-file-system for storage
- Full git protocol support (clone, fetch, push, etc.)
- HTTP transport for GitHub API compatibility
- Can run entirely on device (credential sovereignty)

**Consequences:**
- Performance may be slower than native git
- Large repos may hit memory constraints
- Must implement custom progress reporting
- Need to handle authentication carefully

**Alternatives Considered:**
- libgit2 (native): Would require ejecting from Expo
- Simple GitHub API: Not real git, limited offline support
- Degit: Clone-only, not full git client

---

## DEC-005: expo-secure-store for Credentials

**Status:** Accepted  
**Date:** January 2026  
**Context:** Securely storing API keys and tokens.

**Decision:** Use expo-secure-store for all sensitive credential storage.

**Rationale:**
- Uses iOS Keychain and Android Keystore
- Hardware-backed encryption where available
- Biometric unlock support
- No credentials ever leave the device
- Simple key-value API

**Consequences:**
- 2KB limit per item (sufficient for API keys)
- Must handle migration if storage format changes
- Need fallback for devices without secure storage

**Alternatives Considered:**
- AsyncStorage: Not encrypted, visible to other apps
- Custom encryption: Reinventing the wheel, likely less secure
- Cloud credential storage: Violates sovereignty principle

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
- Works even on devices without browser integration
- User can use existing GitHub session

**Consequences:**
- Requires user to switch to browser and back
- Polling mechanism during verification
- Must handle timeout and retry scenarios

**Alternatives Considered:**
- OAuth web flow: Requires embedded browser, security concerns
- Personal access tokens: Bad UX, user must manage manually
- GitHub App authentication: More complex, overkill for personal use

---

## DEC-007: Anthropic as Primary AI Provider

**Status:** Accepted  
**Date:** January 2026  
**Context:** Choosing the primary AI provider for agent capabilities.

**Decision:** Use Anthropic's Claude as the primary AI provider.

**Rationale:**
- Superior code understanding and generation
- Long context window (200K tokens)
- Better instruction following
- MCP (Model Context Protocol) support
- Strong safety and alignment properties

**Consequences:**
- API costs may be higher than alternatives
- Must support fallback for users without Anthropic keys
- OpenAI support as secondary option

**Alternatives Considered:**
- OpenAI GPT-4: Good but shorter context, no MCP
- Open source models: Not yet competitive for code tasks
- Multiple providers equally: Adds complexity without clear benefit

---

## DEC-008: Organic Visual Language

**Status:** Accepted  
**Date:** January 2026  
**Context:** Establishing visual identity for ThumbCode brand.

**Decision:** Use "paint daub" aesthetic with asymmetric border radii and warm colors.

**Rationale:**
- Differentiates from cold, technical developer tools
- Conveys approachability for mobile-first users
- Memorable and distinctive brand identity
- Works well at mobile screen sizes
- Humanizes AI interaction

**Consequences:**
- More complex CSS/styling implementation
- Must be consistent across all components
- May not appeal to users expecting traditional IDE aesthetic

**Alternatives Considered:**
- Material Design: Generic, doesn't differentiate
- iOS native: Platform-specific, inconsistent cross-platform
- Brutalist: Too stark for our "warm" positioning

---

## DEC-009: File-Based Routing with expo-router

**Status:** Accepted  
**Date:** January 2026  
**Context:** Organizing navigation structure.

**Decision:** Use expo-router's file-based routing system.

**Rationale:**
- Familiar pattern from Next.js
- URL-based routing works for web and deep links
- Automatic TypeScript route typing
- Route groups for logical organization
- Layouts for shared UI

**Consequences:**
- File structure IS the route structure
- Must understand expo-router conventions
- Some patterns (complex modals) need workarounds

**Alternatives Considered:**
- React Navigation directly: More flexible but more boilerplate
- Custom routing: Reinventing solved problems

---

## DEC-010: Multi-Agent Architecture

**Status:** Accepted  
**Date:** January 2026  
**Context:** Defining how AI agents collaborate.

**Decision:** Implement specialized agent roles (Architect, Implementer, Reviewer, Tester) that can work in parallel.

**Rationale:**
- Mirrors real engineering team structure
- Enables separation of concerns
- Allows parallel execution of independent tasks
- Creates natural review/approval checkpoints
- Better utilization of AI context windows

**Consequences:**
- More complex orchestration logic
- Must define agent communication protocols
- Need clear task assignment and handoff rules
- More API calls than single-agent approach

**Alternatives Considered:**
- Single general-purpose agent: Simpler but less capable
- User assigns roles manually: Poor UX, defeats purpose
- No roles (all agents equal): Harder to coordinate

---

## How to Add New Decisions

1. Create new entry with next number (DEC-XXX)
2. Fill in all fields (Status, Date, Context, Decision, Rationale, Consequences, Alternatives)
3. Get Architect approval before implementing
4. Update this document via PR
5. Reference decision number in related code comments
