---
title: Technical Decisions
description: Key technical decisions and their rationale.
---

# Technical Decisions

This page summarizes key technical decisions made during ThumbCode development.

## Stack Decisions

### Web Framework: React 18 + Vite 7

**Decision:** Use React 18 with Vite as the build tool

**Rationale:**
- Fast builds with hot module replacement
- Modern ESM-first architecture
- Excellent TypeScript support and AI code generation quality
- Large ecosystem of compatible libraries

**History:** Originally built with React Native + Expo SDK 52. Migrated to React + Vite in February 2026 for better web-first development and simpler build tooling.

### Native Shell: Capacitor 8

**Decision:** Use Capacitor for native iOS/Android access

**Rationale:**
- Web-first architecture with native capabilities
- Access to device APIs (secure storage, filesystem, biometrics)
- Standard web tooling (no Metro bundler)
- Easy web deployment alongside native builds

### Styling: Tailwind CSS

**Decision:** Use standard Tailwind CSS for styling

**Rationale:**
- AI agents excel at generating Tailwind patterns
- Consistent with web development mental model
- Fast iteration on UI changes
- Good TypeScript support

**History:** Originally used NativeWind (Tailwind for React Native). Migrated to standard Tailwind CSS with the Capacitor migration.

### State Management: Zustand

**Decision:** Use Zustand with Immer

**Rationale:**
- Minimal boilerplate compared to Redux
- TypeScript-first design
- Easy integration with React
- Supports middleware and devtools

### Git: isomorphic-git

**Decision:** Use isomorphic-git for all git operations

**Rationale:**
- Pure JavaScript works in browser and on mobile without native binaries
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
- Maximum security for sensitive data via capacitor-secure-storage-plugin (iOS Keychain / Android Keystore)
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

See the full [decisions.md](https://github.com/jbcom/thumbcode/blob/main/docs/architecture/decisions.md) in the repository for comprehensive decision records with migration history.
