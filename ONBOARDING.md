# Feature: Onboarding Flow

> Status: **Specification Complete**  
> Priority: **P0 - Critical Path**  
> Owner: Architect

## Overview

The onboarding flow guides new users through initial setup: GitHub authentication, API key configuration, and first project creation.

## User Stories

### US-001: Welcome Screen
**As a** new user  
**I want to** understand what ThumbCode does  
**So that** I can decide to proceed with setup

**Acceptance Criteria:**
- [ ] Display ThumbCode logo and tagline
- [ ] Show 3 key value propositions
- [ ] "Get Started" button navigates to GitHub auth
- [ ] "Learn More" opens external docs link

### US-002: GitHub Authentication
**As a** user  
**I want to** connect my GitHub account  
**So that** agents can access my repositories

**Acceptance Criteria:**
- [ ] Display Device Flow code prominently
- [ ] Provide copy-to-clipboard functionality
- [ ] Auto-detect when auth completes (polling)
- [ ] Show loading state during verification
- [ ] Handle auth failure with retry option
- [ ] Display connected username on success

### US-003: API Key Configuration
**As a** user  
**I want to** enter my AI API keys  
**So that** agents can communicate with AI providers

**Acceptance Criteria:**
- [ ] Input field for Anthropic API key
- [ ] Optional input for OpenAI API key
- [ ] Real-time validation (format check)
- [ ] "Validate" button tests key with API call
- [ ] Secure storage using expo-secure-store
- [ ] Skip option if user doesn't have keys yet

### US-004: First Project Creation
**As a** user  
**I want to** set up my first project  
**So that** I can start using ThumbCode immediately

**Acceptance Criteria:**
- [ ] Option to clone existing repo OR create new
- [ ] Repository search/autocomplete from GitHub
- [ ] Display repo metadata (stars, language, last updated)
- [ ] Clone progress indicator
- [ ] Success confirmation with "Open Project" CTA

### US-005: Onboarding Completion
**As a** user  
**I want to** know setup is complete  
**So that** I can start using the app

**Acceptance Criteria:**
- [ ] Success celebration animation
- [ ] Summary of configured items
- [ ] Quick tips for getting started
- [ ] "Start Building" button → main dashboard

---

## Screen Specifications

### Screen: Welcome (`welcome.tsx`)

```
┌─────────────────────────────────┐
│                                 │
│         [ThumbCode Logo]        │
│                                 │
│      "Code with your thumbs"    │
│                                 │
│  ┌───────────────────────────┐  │
│  │ 🤖 Multi-agent teams      │  │
│  │    working in parallel    │  │
│  └───────────────────────────┘  │
│                                 │
│  ┌───────────────────────────┐  │
│  │ 📱 Full git workflow      │  │
│  │    from your phone        │  │
│  └───────────────────────────┘  │
│                                 │
│  ┌───────────────────────────┐  │
│  │ 🔒 Your keys, your code   │  │
│  │    100% local control     │  │
│  └───────────────────────────┘  │
│                                 │
│  ┌───────────────────────────┐  │
│  │       Get Started         │  │
│  └───────────────────────────┘  │
│                                 │
│         [Learn More →]          │
│                                 │
└─────────────────────────────────┘
```

**Components:**
- `Logo` - ThumbCode paint-daub logo
- `ValuePropCard` - Feature highlight cards
- `Button` - Primary "Get Started"
- `TextLink` - "Learn More" link

**State:**
- None (stateless screen)

**Navigation:**
- "Get Started" → `github-auth`
- "Learn More" → external URL

---

### Screen: GitHub Auth (`github-auth.tsx`)

```
┌─────────────────────────────────┐
│  ←                              │
│                                 │
│     Connect your GitHub         │
│                                 │
│  ThumbCode needs access to      │
│  your repositories to clone     │
│  and push code.                 │
│                                 │
│  ┌───────────────────────────┐  │
│  │                           │  │
│  │      XXXX-XXXX            │  │
│  │                           │  │
│  │     [Copy Code]           │  │
│  └───────────────────────────┘  │
│                                 │
│  1. Copy the code above         │
│  2. Open GitHub in browser      │
│  3. Paste when prompted         │
│                                 │
│  ┌───────────────────────────┐  │
│  │    Open GitHub.com/device │  │
│  └───────────────────────────┘  │
│                                 │
│  [====          ] Waiting...    │
│                                 │
│        [I'll do this later]     │
│                                 │
└─────────────────────────────────┘
```

**Components:**
- `Header` - Back button + title
- `DeviceCodeDisplay` - Large code + copy button
- `InstructionList` - Numbered steps
- `Button` - Open GitHub
- `ProgressIndicator` - Polling status
- `TextLink` - Skip option

**State:**
```typescript
interface GitHubAuthState {
  deviceCode: string | null;
  userCode: string | null;
  verificationUri: string;
  expiresAt: Date | null;
  pollInterval: number;
  status: 'loading' | 'waiting' | 'verifying' | 'success' | 'error';
  error: string | null;
}
```

**API Calls:**
1. `POST https://github.com/login/device/code`
   - Request: `client_id`, `scope: repo,user`
   - Response: `device_code`, `user_code`, `verification_uri`, `expires_in`, `interval`

2. `POST https://github.com/login/oauth/access_token` (polling)
   - Request: `client_id`, `device_code`, `grant_type: urn:ietf:params:oauth:grant-type:device_code`
   - Response: `access_token`, `token_type`, `scope`

**Error Handling:**
- `authorization_pending` - Continue polling
- `slow_down` - Increase poll interval
- `expired_token` - Restart flow
- `access_denied` - Show error, allow retry

---

### Screen: API Keys (`api-keys.tsx`)

```
┌─────────────────────────────────┐
│  ←                              │
│                                 │
│     Configure AI Providers      │
│                                 │
│  Enter your API keys to enable  │
│  AI-powered agents.             │
│                                 │
│  Anthropic API Key *            │
│  ┌───────────────────────────┐  │
│  │ sk-ant-...                │  │
│  └───────────────────────────┘  │
│  ✓ Valid key format             │
│                                 │
│  OpenAI API Key (optional)      │
│  ┌───────────────────────────┐  │
│  │                           │  │
│  └───────────────────────────┘  │
│                                 │
│  ┌───────────────────────────┐  │
│  │ 🔒 Keys stored locally    │  │
│  │    in secure storage      │  │
│  └───────────────────────────┘  │
│                                 │
│  ┌───────────────────────────┐  │
│  │    Validate & Continue    │  │
│  └───────────────────────────┘  │
│                                 │
│     [Get an Anthropic key →]    │
│                                 │
└─────────────────────────────────┘
```

**Components:**
- `Header` - Back button + title
- `SecureInput` - Masked input with show/hide toggle
- `ValidationIndicator` - Real-time format check
- `SecurityNote` - Reassurance card
- `Button` - Validate & Continue
- `TextLink` - Get API key link

**State:**
```typescript
interface ApiKeysState {
  anthropicKey: string;
  anthropicValid: boolean | null;
  anthropicValidating: boolean;
  openaiKey: string;
  openaiValid: boolean | null;
  openaiValidating: boolean;
}
```

**Validation Rules:**
- Anthropic: Starts with `sk-ant-`, min 40 chars
- OpenAI: Starts with `sk-`, min 40 chars

**API Validation:**
- Anthropic: `POST /v1/messages` with minimal request
- OpenAI: `GET /v1/models`

---

### Screen: Create Project (`create-project.tsx`)

```
┌─────────────────────────────────┐
│  ←                              │
│                                 │
│     Set up your first project   │
│                                 │
│  ┌─────────────┬─────────────┐  │
│  │   Clone     │   Create    │  │
│  │   Existing  │   New       │  │
│  └─────────────┴─────────────┘  │
│                                 │
│  Search your repositories       │
│  ┌───────────────────────────┐  │
│  │ 🔍 Search...              │  │
│  └───────────────────────────┘  │
│                                 │
│  ┌───────────────────────────┐  │
│  │ 📁 my-awesome-project     │  │
│  │    ⭐ 42  TypeScript      │  │
│  │    Updated 2 days ago     │  │
│  └───────────────────────────┘  │
│                                 │
│  ┌───────────────────────────┐  │
│  │ 📁 another-repo           │  │
│  │    ⭐ 12  JavaScript      │  │
│  │    Updated 1 week ago     │  │
│  └───────────────────────────┘  │
│                                 │
│  ┌───────────────────────────┐  │
│  │      Clone & Continue     │  │
│  └───────────────────────────┘  │
│                                 │
└─────────────────────────────────┘
```

**Components:**
- `Header` - Back button + title
- `SegmentedControl` - Clone/Create toggle
- `SearchInput` - Repository search
- `RepoCard` - Repository list item
- `CloneProgress` - Progress during clone
- `Button` - Clone & Continue

**State:**
```typescript
interface CreateProjectState {
  mode: 'clone' | 'create';
  searchQuery: string;
  repositories: Repository[];
  selectedRepo: Repository | null;
  cloneProgress: number; // 0-100
  cloneStatus: 'idle' | 'cloning' | 'success' | 'error';
  error: string | null;
}
```

---

### Screen: Complete (`complete.tsx`)

```
┌─────────────────────────────────┐
│                                 │
│                                 │
│         [✓ Checkmark]           │
│                                 │
│       You're all set!           │
│                                 │
│  ┌───────────────────────────┐  │
│  │ ✓ GitHub connected        │  │
│  │ ✓ Anthropic configured    │  │
│  │ ✓ Project cloned          │  │
│  └───────────────────────────┘  │
│                                 │
│  Quick Tips:                    │
│  • Tap + to add more agents     │
│  • Long-press to see options    │
│  • Swipe to switch projects     │
│                                 │
│  ┌───────────────────────────┐  │
│  │      Start Building →     │  │
│  └───────────────────────────┘  │
│                                 │
└─────────────────────────────────┘
```

**Components:**
- `SuccessAnimation` - Animated checkmark
- `SetupSummary` - Completed items list
- `QuickTips` - Getting started tips
- `Button` - Start Building

**Navigation:**
- "Start Building" → `/(tabs)/` (main dashboard)

---

## State Management

### Zustand Store Slice

```typescript
// stores/onboardingStore.ts

interface OnboardingStore {
  // State
  currentStep: number;
  completedSteps: Set<string>;
  githubToken: string | null;
  anthropicKey: string | null;
  openaiKey: string | null;
  firstProjectId: string | null;
  
  // Actions
  setGitHubToken: (token: string) => void;
  setAnthropicKey: (key: string) => void;
  setOpenAIKey: (key: string) => void;
  setFirstProject: (id: string) => void;
  completeStep: (step: string) => void;
  resetOnboarding: () => void;
  
  // Selectors
  isComplete: () => boolean;
  canProceed: (step: string) => boolean;
}
```

---

## Error States

| Error | Screen | Handling |
|-------|--------|----------|
| Device code expired | github-auth | Show "Restart" button |
| Auth denied | github-auth | Show error, allow retry |
| Invalid API key format | api-keys | Inline validation message |
| API key validation failed | api-keys | Show specific error |
| Clone failed | create-project | Show error, allow retry |
| Network error | Any | Toast + retry option |

---

## Analytics Events

| Event | Screen | Properties |
|-------|--------|------------|
| `onboarding_started` | welcome | `{}` |
| `github_auth_initiated` | github-auth | `{}` |
| `github_auth_completed` | github-auth | `{ scopes }` |
| `github_auth_failed` | github-auth | `{ error }` |
| `api_key_entered` | api-keys | `{ provider }` |
| `api_key_validated` | api-keys | `{ provider, valid }` |
| `project_selected` | create-project | `{ repoName }` |
| `project_cloned` | create-project | `{ duration }` |
| `onboarding_completed` | complete | `{ totalTime }` |

---

## Testing Requirements

### Unit Tests
- [ ] Device code generation logic
- [ ] Polling interval management
- [ ] API key format validation
- [ ] Repository search filtering
- [ ] Clone progress calculation

### Integration Tests
- [ ] Full onboarding flow navigation
- [ ] State persistence across screens
- [ ] Error recovery flows
- [ ] Skip functionality

### E2E Tests (Maestro)
```yaml
# e2e/onboarding.yaml
- launchApp
- tapOn: "Get Started"
- assertVisible: "Connect your GitHub"
- tapOn: "I'll do this later"
- assertVisible: "Configure AI Providers"
# ... continue flow
```
