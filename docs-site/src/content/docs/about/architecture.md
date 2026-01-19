---
title: Architecture
description: Technical architecture of ThumbCode.
---

# Architecture

ThumbCode is built as a **decentralized, mobile-first application** with no server dependencies for core functionality.

## High-Level Architecture

```
┌────────────────────────────────────────────────┐
│                 ThumbCode App                   │
├────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────┐ │
│  │   UI Layer  │  │ Agent Layer │  │  State  │ │
│  │ (React      │  │ (Multi-     │  │ (Zustand│ │
│  │  Native)    │  │  Agent)     │  │  Stores)│ │
│  └──────┬──────┘  └──────┬──────┘  └────┬────┘ │
│         │                │               │      │
│  ┌──────┴────────────────┴───────────────┴────┐ │
│  │              Core Services                  │ │
│  │  ┌───────────┐  ┌───────────┐  ┌────────┐  │ │
│  │  │   Git     │  │Credentials│  │  Auth  │  │ │
│  │  │  Service  │  │  Service  │  │ Service│  │ │
│  │  └───────────┘  └───────────┘  └────────┘  │ │
│  └─────────────────────────────────────────────┘ │
├────────────────────────────────────────────────┤
│                Device Storage                   │
│  ┌─────────────┐  ┌─────────────┐             │
│  │SecureStore  │  │ FileSystem  │             │
│  │(Encrypted)  │  │ (Repos)     │             │
│  └─────────────┘  └─────────────┘             │
└────────────────────────────────────────────────┘
         │                    │
         ▼                    ▼
    ┌─────────┐         ┌─────────┐
    │ GitHub  │         │ AI APIs │
    │   API   │         │(Claude, │
    │         │         │ OpenAI) │
    └─────────┘         └─────────┘
```

## Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Framework | React Native + Expo | Cross-platform mobile UI |
| Styling | NativeWind | Tailwind CSS for React Native |
| Navigation | expo-router | File-based routing |
| State | Zustand + Immer | Immutable state management |
| Git | isomorphic-git | Client-side git operations |
| Storage | expo-secure-store | Hardware-encrypted credentials |
| AI | Anthropic/OpenAI SDKs | Multi-model agent support |

## Key Design Decisions

### Why React Native + Expo?

- Best-in-class TypeScript support
- Excellent AI code generation quality (large training corpus)
- Single codebase for iOS and Android
- OTA updates for faster iteration

### Why isomorphic-git?

- Pure JavaScript implementation works on mobile
- No native git binary required
- Full git protocol support
- Works offline

### Why Zustand?

- Minimal boilerplate
- TypeScript-first
- Works well with React Native
- Easy to test and debug

### Why BYOK (Bring Your Own Keys)?

- No server costs for API calls
- User owns their data
- No rate limit sharing
- Better privacy

## Package Structure

```
packages/
├── core/          # Git, Auth, Credentials
├── config/        # Constants, configuration
├── state/         # Zustand stores
├── types/         # Shared TypeScript types
└── ui/            # Shared UI components
```

## Data Flow

### Agent Request Flow

```
User Input
    │
    ▼
Chat Store ──────► Agent Orchestrator
                         │
                         ▼
                   ┌─────────────┐
                   │ Agent Queue │
                   └─────────────┘
                         │
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
    ┌─────────┐    ┌─────────┐    ┌─────────┐
    │Architect│    │Implement│    │Reviewer │
    └─────────┘    └─────────┘    └─────────┘
         │               │               │
         └───────────────┼───────────────┘
                         │
                         ▼
                   Git Service
                         │
                         ▼
                   File System
```

### Credential Flow

```
User Input (API Key)
        │
        ▼
  Validation (Format Check)
        │
        ▼
  API Validation (Test Request)
        │
        ▼
  SecureStore (Hardware Encrypted)
        │
        ▼
  Credential Available for Agents
```

## Security Model

- **Credential Isolation**: Keys stored in hardware-backed secure enclave
- **No Server**: Direct API calls from device to providers
- **Transport Security**: Certificate pinning for critical endpoints
- **Request Signing**: HMAC signing for sensitive operations

## Future Architecture

### Planned Additions

- **Offline Mode**: Full offline git workflow with sync
- **Plugin System**: Extensible agent and tool architecture
- **Team Features**: Collaborative editing and review
- **Analytics**: Local-first usage analytics (privacy-preserving)
