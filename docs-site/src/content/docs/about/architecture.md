---
title: Architecture
description: Technical architecture of ThumbCode.
---

# Architecture

ThumbCode is built as a **decentralized, web-first application** wrapped in Capacitor for native iOS/Android deployment, with no server dependencies for core functionality.

## High-Level Architecture

```
┌────────────────────────────────────────────────┐
│                 ThumbCode App                   │
├────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────┐ │
│  │   UI Layer  │  │ Agent Layer │  │  State  │ │
│  │ (React 18 + │  │ (Multi-     │  │ (Zustand│ │
│  │  Tailwind)  │  │  Agent)     │  │  Stores)│ │
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
│               Capacitor Bridge                  │
│  ┌─────────────┐  ┌─────────────┐             │
│  │SecureStorage│  │ FileSystem  │             │
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
| Framework | React 18 + Vite 7 | Web-first UI with fast builds |
| Native | Capacitor 8 | iOS/Android native wrapper |
| Styling | Tailwind CSS | Utility-first CSS |
| Navigation | React Router DOM 7 | Client-side routing |
| State | Zustand 5 + Immer | Immutable state management |
| Git | isomorphic-git | Client-side git operations |
| Storage | capacitor-secure-storage | Hardware-encrypted credentials |
| AI | Anthropic/OpenAI SDKs | Multi-model agent support |

## Key Design Decisions

### Why React 18 + Vite?

- Modern ESM-first architecture with excellent DX
- Fast hot module replacement during development
- Standard web tooling (no custom bundler)
- Excellent AI code generation quality (large training corpus)

### Why Capacitor?

- Web-first with native device access
- Standard Vite build pipeline
- Access to iOS Keychain / Android Keystore for secure storage
- Easy web deployment alongside native builds

### Why isomorphic-git?

- Pure JavaScript implementation works in browser
- No native git binary required
- Full git protocol support
- Works offline

### Why Zustand?

- Minimal boilerplate
- TypeScript-first
- Works well with React
- Easy to test and debug

### Why BYOK (Bring Your Own Keys)?

- No server costs for API calls
- User owns their data
- No rate limit sharing
- Better privacy

## Source Structure

```
src/
├── pages/             # React Router pages
├── components/        # React components
│   ├── ui/            # Design system primitives
│   ├── agents/        # Agent-specific UI
│   ├── workspace/     # Code workspace
│   └── chat/          # Chat interface
├── services/          # Git, GitHub, AI, credentials
├── stores/            # Zustand state stores
├── hooks/             # Custom React hooks
└── lib/               # Utilities
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
  SecureStorage (Hardware Encrypted)
        │
        ▼
  Credential Available for Agents
```

## Security Model

- **Credential Isolation**: Keys stored in hardware-backed secure storage (iOS Keychain / Android Keystore)
- **No Server**: Direct API calls from device to providers
- **Transport Security**: Certificate pinning for critical endpoints
- **Request Signing**: HMAC signing for sensitive operations

## Future Architecture

### Planned Additions

- **Offline Mode**: Full offline git workflow with sync
- **Plugin System**: Extensible agent and tool architecture
- **Team Features**: Collaborative editing and review
- **Analytics**: Local-first usage analytics (privacy-preserving)
