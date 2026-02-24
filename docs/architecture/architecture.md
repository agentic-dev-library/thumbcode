# ThumbCode Technical Architecture

> Last Updated: February 2026
> Stack: React 18 + Vite 7 + Capacitor 8

## Overview

ThumbCode is a web-first React application wrapped in Capacitor for native iOS/Android deployment. It enables multi-agent software development from mobile devices through a conversational AI interface with full git integration.

## Technology Stack

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

## Directory Structure

```
thumbcode/
├── src/                          # Main application source
│   ├── components/               # React components
│   │   ├── ui/                   # Re-exports from src/ui/
│   │   ├── agents/               # Agent-related components
│   │   ├── chat/                 # Chat interface components
│   │   └── project/              # Project management components
│   ├── hooks/                    # Custom React hooks
│   ├── lib/                      # Utility libraries
│   ├── pages/                    # Page components (routes)
│   │   ├── tabs/                 # Tab pages (home, projects, agents, chat, settings)
│   │   ├── detail/               # Detail pages (project, agent)
│   │   ├── settings/             # Settings pages
│   │   └── onboarding/           # Onboarding flow pages
│   ├── services/                 # External service integrations
│   │   ├── chat/                 # Chat/agent response service
│   │   └── ...
│   ├── state/                    # Zustand state stores
│   └── layouts/                  # Layout components
├── design-system/                # Design tokens (JSON, TS, CSS)
├── docs/                         # Documentation

├── e2e/                          # Playwright E2E tests
├── ios/                          # Capacitor iOS project
├── android/                      # Capacitor Android project
├── public/                       # Static assets (logos, icons, brand)
└── scripts/                      # Build/setup scripts
```

## State Architecture (Zustand 5)

### Store Relationships

```
┌─────────────────┐
│    userStore     │
│  (credentials,   │
│   preferences)   │
└────────┬────────┘
         │ provides credentials
         v
┌─────────────────┐     ┌─────────────────┐
│  projectStore    │────>│  workspaceStore  │
│   (repos, git)   │     │ (files, changes) │
└────────┬────────┘     └────────┬────────┘
         │                       │
         │ coordinates           │ monitors
         v                       v
┌─────────────────┐     ┌─────────────────┐
│   agentStore     │<───>│    chatStore     │
│  (AI workers)    │     │   (messages)     │
└─────────────────┘     └─────────────────┘
```

### Store Design Pattern

```typescript
// All stores follow slice-based pattern with actions and selectors
interface StoreSlice<T> {
  data: T;
  loading: boolean;
  error: Error | null;

  fetch: () => Promise<void>;
  update: (partial: Partial<T>) => void;
  reset: () => void;
}
```

## Data Flow

### Credential Flow
```
User Input -> Validation -> capacitor-secure-storage -> Service Initialization
                               |
                     Credential Store Update
                               |
                       UI State Refresh
```

### Git Operation Flow
```
User Action -> Git Service -> isomorphic-git -> @capacitor/filesystem
                   |                                |
            Workspace Store              Local Repository Clone
                   |
            UI Update (FileTree, DiffView)
```

### Agent Execution Flow
```
User Prompt -> Chat Store -> Agent Store -> AI Service (Anthropic/OpenAI)
                                                |
                                      Tool Execution
                                                |
                                      Workspace Changes
                                                |
                                      Chat Response (streaming)
```

## Security Architecture

### Credential Storage
- API keys stored via `capacitor-secure-storage-plugin` (iOS Keychain / Android Keystore)
- GitHub auth via Device Flow (no embedded browser)
- Biometric unlock via `@aparajita/capacitor-biometric-auth`
- No credentials ever leave the device

### Key Hierarchy
```
┌─────────────────────────────────┐
│     Device Keychain/Keystore    │
│  (OS-level encryption at rest)  │
└────────────────┬────────────────┘
                 │
    ┌────────────┼────────────┐
    v            v            v
┌────────┐  ┌────────┐  ┌────────┐
│ GitHub │  │Anthropic│  │ OpenAI │
│ Token  │  │ API Key │  │API Key │
└────────┘  └────────┘  └────────┘
```

### Authentication Flows

**GitHub (Device Flow):**
```
1. Request device code -> GET /login/device/code
2. Display user_code to user
3. Poll for access token -> POST /login/oauth/access_token
4. Store token securely
5. Validate with -> GET /user
```

**Anthropic (Direct API Key):**
```
1. User enters API key
2. Validate with test request -> POST /v1/messages (minimal)
3. Store key securely
4. Initialize SDK with key
```

## Navigation Architecture

React Router DOM 7 with client-side routing.

| Route | Purpose | Auth Required |
|-------|---------|---------------|
| `/onboarding/*` | First-time setup | No |
| `/` (home) | Dashboard | Yes |
| `/projects` | Project list | Yes |
| `/agents` | Agent management | Yes |
| `/chat` | Chat interface | Yes |
| `/settings/*` | App settings | Yes |
| `/project/:id` | Project detail | Yes |
| `/agent/:id` | Agent detail | Yes |

### Navigation Guards
```typescript
// In RootLayout
const { hasCompletedOnboarding, isAuthenticated } = useUserStore();

if (!hasCompletedOnboarding) {
  return <Navigate to="/onboarding/welcome" />;
}
```

## Error Handling Strategy

| Category | Handling | User Feedback |
|----------|----------|---------------|
| Network | Retry with backoff | Toast + retry button |
| Auth | Re-authenticate | Modal redirect |
| Git | Show conflict UI | Inline diff |
| AI | Fallback/retry | Chat message |
| Validation | Inline errors | Field-level |

## Performance Targets

| Metric | Target |
|--------|--------|
| Cold Start | < 2s |
| Git Clone (small repo) | < 10s |
| Message Response | < 500ms (first token) |
| File Tree Render | < 100ms (1000 files) |
| Memory (idle) | < 150MB |

## Build & Deploy

```
Source (src/) -> Vite Build -> dist/ -> Capacitor Sync -> iOS/Android
                                                 -> Web deploy (Netlify)
```

### CI/CD Pipeline
```
Push -> Lint (Biome + jscpd) -> Typecheck (tsc) -> Test (Vitest + thresholds) -> Semgrep SAST -> Build (Vite) -> Deploy
                                                                                     |
                                                                               Coverage Report (PR)
```

## Testing Strategy

| Layer | Tool | Target |
|-------|------|--------|
| Unit tests | Vitest + Testing Library | 80% lines/functions/statements, 73% branches |
| E2E tests | Playwright | Critical paths |
| Type checking | TypeScript (tsc --noEmit) | All files |
| Linting | Biome | All packages |
| SAST | Semgrep CE | 0 findings |
| Duplication | jscpd | < 5% |
| Dependencies | pnpm audit + Dependabot | 0 moderate+ vulnerabilities |
