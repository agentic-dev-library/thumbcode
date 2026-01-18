# ThumbCode Technical Architecture

> Last Updated: January 2026  
> Status: **Specification Complete** - Ready for Implementation

## Overview

ThumbCode is a React Native/Expo application enabling multi-agent software development from mobile devices. This document defines the technical architecture that all agents MUST follow.

## Technology Stack

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| Framework | Expo | 52.x | Cross-platform mobile development |
| UI | React Native | 0.76.x | Native components |
| Navigation | expo-router | 4.x | File-based routing |
| Styling | NativeWind | 4.x | Tailwind CSS for React Native |
| State | Zustand | 5.x | Global state management |
| Git | isomorphic-git | 1.27.x | Git operations in JavaScript |
| AI | Anthropic SDK | 0.32.x | Claude API integration |
| Security | expo-secure-store | 14.x | Credential storage |

---

## Directory Structure

```
thumbcode/
├── app/                          # Expo Router file-based routes
│   ├── (onboarding)/             # Onboarding flow (grouped)
│   │   ├── _layout.tsx           # Stack navigator
│   │   ├── welcome.tsx           # Landing screen
│   │   ├── github-auth.tsx       # GitHub Device Flow
│   │   ├── api-keys.tsx          # Anthropic/OpenAI keys
│   │   ├── create-project.tsx    # First project setup
│   │   └── complete.tsx          # Success screen
│   │
│   ├── (tabs)/                   # Main tab navigation
│   │   ├── _layout.tsx           # Tab navigator
│   │   ├── index.tsx             # Dashboard
│   │   ├── projects.tsx          # Project list
│   │   ├── agents.tsx            # Agent management
│   │   ├── chat.tsx              # Chat interface
│   │   └── settings.tsx          # App settings
│   │
│   ├── project/
│   │   └── [id].tsx              # Project detail
│   │
│   ├── agent/
│   │   └── [id].tsx              # Agent detail
│   │
│   ├── workspace/
│   │   └── [id].tsx              # Workspace (code view)
│   │
│   ├── _layout.tsx               # Root layout
│   └── +not-found.tsx            # 404 handler
│
├── src/
│   ├── components/
│   │   ├── ui/                   # Design system components
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Text.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── agents/               # Agent-specific components
│   │   │   ├── AgentCard.tsx
│   │   │   ├── AgentStatus.tsx
│   │   │   ├── AgentMetrics.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── workspace/            # Workspace components
│   │   │   ├── FileTree.tsx
│   │   │   ├── CodeViewer.tsx
│   │   │   ├── DiffView.tsx
│   │   │   ├── CommitPanel.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── chat/                 # Chat components
│   │   │   ├── ChatBubble.tsx
│   │   │   ├── ChatInput.tsx
│   │   │   ├── CodeBlock.tsx
│   │   │   ├── ActionButton.tsx
│   │   │   └── index.ts
│   │   │
│   │   └── project/              # Project components
│   │       ├── ProjectCard.tsx
│   │       ├── BranchSelector.tsx
│   │       ├── RepoInfo.tsx
│   │       └── index.ts
│   │
│   ├── hooks/                    # Custom React hooks
│   │   ├── useAgent.ts
│   │   ├── useProject.ts
│   │   ├── useWorkspace.ts
│   │   ├── useGit.ts
│   │   ├── useCredentials.ts
│   │   ├── useChat.ts
│   │   └── index.ts
│   │
│   ├── stores/                   # Zustand stores
│   │   ├── agentStore.ts
│   │   ├── projectStore.ts
│   │   ├── workspaceStore.ts
│   │   ├── chatStore.ts
│   │   ├── userStore.ts
│   │   └── index.ts
│   │
│   ├── services/                 # External service integrations
│   │   ├── git/
│   │   │   ├── client.ts         # isomorphic-git wrapper
│   │   │   ├── operations.ts     # Clone, commit, push, etc.
│   │   │   └── index.ts
│   │   │
│   │   ├── github/
│   │   │   ├── auth.ts           # Device Flow implementation
│   │   │   ├── api.ts            # GitHub REST API
│   │   │   └── index.ts
│   │   │
│   │   ├── ai/
│   │   │   ├── anthropic.ts      # Claude integration
│   │   │   ├── openai.ts         # GPT integration
│   │   │   ├── mcp.ts            # MCP server client
│   │   │   └── index.ts
│   │   │
│   │   └── credentials/
│   │       ├── secureStore.ts    # expo-secure-store wrapper
│   │       ├── validation.ts     # Credential validation
│   │       └── index.ts
│   │
│   ├── types/                    # TypeScript definitions
│   │   ├── index.ts              # Core types (agents, projects, etc.)
│   │   ├── api.ts                # API response types
│   │   └── navigation.ts         # Navigation param lists
│   │
│   └── utils/                    # Utility functions
│       ├── format.ts             # Date, number formatting
│       ├── validation.ts         # Input validation
│       ├── errors.ts             # Error handling
│       └── index.ts
│
├── design-system/
│   ├── tokens.ts                 # Design tokens (TypeScript)
│   ├── tokens.json               # Design tokens (JSON)
│   └── tailwind.config.ts        # NativeWind config
│
├── docs/                         # Documentation (VitePress)
│   ├── brand/                    # Brand guidelines
│   ├── development/              # Development docs
│   ├── features/                 # Feature specifications
│   ├── api/                      # API documentation
│   └── vision/                   # Product vision
│
├── __tests__/                    # Jest tests
│   ├── components/
│   ├── hooks/
│   ├── services/
│   └── stores/
│
├── e2e/                          # Maestro E2E tests
│   ├── onboarding.yaml
│   ├── project-create.yaml
│   └── agent-workflow.yaml
│
├── app.json                      # Expo configuration
├── eas.json                      # EAS Build configuration
├── babel.config.js               # Babel configuration
├── metro.config.js               # Metro bundler configuration
├── tsconfig.json                 # TypeScript configuration
└── AGENTS.md                     # Agent coordination protocol
```

---

## State Architecture

### Store Design (Zustand)

```typescript
// Pattern: Slice-based stores with actions and selectors

interface StoreSlice<T> {
  // State
  data: T;
  loading: boolean;
  error: Error | null;
  
  // Actions
  fetch: () => Promise<void>;
  update: (partial: Partial<T>) => void;
  reset: () => void;
}
```

### Store Relationships

```
┌─────────────────┐
│    userStore    │
│  (credentials,  │
│   preferences)  │
└────────┬────────┘
         │ provides credentials
         ▼
┌─────────────────┐     ┌─────────────────┐
│  projectStore   │────▶│  workspaceStore │
│   (repos, git)  │     │ (files, changes)│
└────────┬────────┘     └────────┬────────┘
         │                       │
         │ coordinates           │ monitors
         ▼                       ▼
┌─────────────────┐     ┌─────────────────┐
│   agentStore    │◀───▶│    chatStore    │
│  (AI workers)   │     │   (messages)    │
└─────────────────┘     └─────────────────┘
```

---

## Data Flow

### 1. Credential Flow
```
User Input → Validation → expo-secure-store → Service Initialization
                              ↓
                    Credential Store Update
                              ↓
                      UI State Refresh
```

### 2. Git Operation Flow
```
User Action → Git Service → isomorphic-git → File System (expo-file-system)
                   ↓                               ↓
            Workspace Store              Local Repository Clone
                   ↓
            UI Update (FileTree, DiffView)
```

### 3. Agent Execution Flow
```
User Prompt → Chat Store → Agent Store → AI Service (Anthropic)
                                              ↓
                                    Tool Execution (MCP)
                                              ↓
                                    Workspace Changes
                                              ↓
                                    Chat Response
```

---

## Security Architecture

### Credential Storage
- **API Keys**: `expo-secure-store` with biometric unlock
- **OAuth Tokens**: `expo-secure-store` with encryption at rest
- **Temporary Data**: In-memory only, never persisted

### Key Hierarchy
```
┌─────────────────────────────────┐
│     Device Keychain/Keystore    │
│  (OS-level encryption at rest)  │
└────────────────┬────────────────┘
                 │
    ┌────────────┼────────────┐
    ▼            ▼            ▼
┌────────┐  ┌────────┐  ┌────────┐
│ GitHub │  │Anthropic│ │ OpenAI │
│ Token  │  │ API Key │  │API Key │
└────────┘  └────────┘  └────────┘
```

### Authentication Flows

**GitHub (Device Flow):**
```
1. Request device code → GET /login/device/code
2. Display user_code to user
3. Poll for access token → POST /login/oauth/access_token
4. Store token securely
5. Validate with → GET /user
```

**Anthropic (Direct API Key):**
```
1. User enters API key
2. Validate with test request → POST /v1/messages (minimal)
3. Store key securely
4. Initialize SDK with key
```

---

## Navigation Architecture

### Route Groups

| Group | Purpose | Auth Required |
|-------|---------|---------------|
| `(onboarding)` | First-time setup | No |
| `(tabs)` | Main app | Yes |
| `project/[id]` | Project detail | Yes |
| `agent/[id]` | Agent detail | Yes |
| `workspace/[id]` | Code workspace | Yes |

### Navigation Guards
```typescript
// In _layout.tsx
const { hasCompletedOnboarding, isAuthenticated } = useUserStore();

if (!hasCompletedOnboarding) {
  return <Redirect href="/(onboarding)/welcome" />;
}

if (!isAuthenticated) {
  return <Redirect href="/(onboarding)/github-auth" />;
}
```

---

## Error Handling Strategy

### Error Categories

| Category | Handling | User Feedback |
|----------|----------|---------------|
| Network | Retry with backoff | Toast + retry button |
| Auth | Re-authenticate | Modal redirect |
| Git | Show conflict UI | Inline diff |
| AI | Fallback/retry | Chat message |
| Validation | Inline errors | Field-level |

### Error Boundary Pattern
```typescript
// Wrap each route with error boundary
<ErrorBoundary fallback={<ErrorScreen />}>
  <RouteContent />
</ErrorBoundary>
```

---

## Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Cold Start | < 2s | Time to interactive |
| Git Clone (small repo) | < 10s | Progress shown at 1s |
| Message Response | < 500ms | First token streamed |
| File Tree Render | < 100ms | 1000 files |
| Memory (idle) | < 150MB | Background state |
| Memory (active) | < 300MB | During operations |

---

## Testing Strategy

### Unit Tests (Jest)
- All hooks
- All store actions
- All utility functions
- Service mocks

### Integration Tests (React Native Testing Library)
- Component interactions
- Navigation flows
- Store integration

### E2E Tests (Maestro)
- Complete onboarding
- Create project
- Agent workflow
- Git operations

### Coverage Targets
- Statements: 80%
- Branches: 75%
- Functions: 80%
- Lines: 80%

---

## Build & Deploy

### EAS Profiles

| Profile | Purpose | Distribution |
|---------|---------|--------------|
| development | Local testing | Internal |
| preview | Beta testing | TestFlight/Internal Track |
| production | App Store | Public |

### CI/CD Pipeline
```
Push → Lint → Typecheck → Test → Build → Deploy
              ↓
         Coverage Report
              ↓
         PR Feedback
```
