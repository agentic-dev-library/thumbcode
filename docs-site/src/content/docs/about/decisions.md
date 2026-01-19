---
title: Technical Decisions
description: Key technical decisions and their rationale.
---

# Technical Decisions

This page summarizes key technical decisions made during ThumbCode development.

## Stack Decisions

### Mobile Framework: React Native + Expo

**Decision:** Use React Native with Expo SDK 52+

**Rationale:**
- Best AI code generation quality due to extensive training data
- TypeScript support is excellent
- Single codebase for iOS and Android
- Expo provides OTA updates for fast iteration
- Large ecosystem of compatible libraries

**Alternatives Considered:**
- Flutter (Dart less familiar to AI models)
- Native development (double the codebase)
- PWA (limited device access)

### Styling: NativeWind (Tailwind CSS)

**Decision:** Use NativeWind for styling

**Rationale:**
- AI agents excel at generating Tailwind patterns
- Consistent with web development mental model
- Fast iteration on UI changes
- Good TypeScript support

### State Management: Zustand

**Decision:** Use Zustand with Immer

**Rationale:**
- Minimal boilerplate compared to Redux
- TypeScript-first design
- Easy integration with React Native
- Supports middleware and devtools

### Git: isomorphic-git

**Decision:** Use isomorphic-git for all git operations

**Rationale:**
- Pure JavaScript works on mobile without native binaries
- Full git protocol implementation
- Works offline
- Active maintenance

## Architecture Decisions

### BYOK (Bring Your Own Keys)

**Decision:** Users provide their own API keys

**Rationale:**
- Zero server costs for API calls
- Users own their credentials completely
- No rate limit sharing between users
- Privacy-preserving by design

**Trade-offs:**
- Requires users to obtain API keys
- No centralized usage analytics
- Users manage their own billing

### Credential Sovereignty

**Decision:** Store credentials in hardware-backed secure storage only

**Rationale:**
- Maximum security for sensitive data
- No server to hack
- Credentials never leave device
- Biometric protection available

### Multi-Agent Architecture

**Decision:** Use specialized agents (Architect, Implementer, Reviewer, Tester)

**Rationale:**
- Mirrors human development team structure
- Each agent can be optimized for its role
- Clear separation of concerns
- Easier to understand and debug

### Git Worktrees for Agent Isolation

**Decision:** Use git worktrees for parallel agent work

**Rationale:**
- Better than CRDTs for code editing
- Native git compatibility
- Clean merge workflow
- Supports offline work

## Brand Decisions

### Color Palette: Warm Technical

**Decision:** Use Coral/Teal/Gold instead of typical tech blues

**Rationale:**
- Differentiates from cold tech aesthetic
- More approachable and friendly
- Stands out in app stores
- Memorable brand identity

### Visual Style: Organic Daubes

**Decision:** Use organic shapes instead of gradients

**Rationale:**
- Counters AI-generated perfection trend
- Adds warmth and personality
- Unique visual identity
- Reflects "human + AI" collaboration theme

### Typography: Fraunces + Cabin

**Decision:** Use humanist fonts instead of geometric sans-serif

**Rationale:**
- Warm and approachable feel
- Good readability on mobile
- Distinct from typical tech fonts
- Works well in both light and dark modes

## For More Details

See the full [DECISIONS.md](https://github.com/agentic-dev-library/thumbcode/blob/main/DECISIONS.md) in the repository for comprehensive decision records.
