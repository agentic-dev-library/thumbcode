# @thumbcode/core

Core services for ThumbCode including Git operations, credential management, GitHub authentication, and security services. All operations run client-side with no server dependency.

## Installation

This package is part of the ThumbCode monorepo and uses workspace protocol:

```json
{
  "dependencies": {
    "@thumbcode/core": "workspace:*"
  }
}
```

## Key Exports

### Git Service (`@thumbcode/core/git`)

Client-side Git operations powered by isomorphic-git:

- `GitService` -- Full Git client with clone, commit, push, pull, branch management, diffs, and status tracking

```typescript
import { GitService } from '@thumbcode/core';

const git = new GitService();
await git.clone({ url: 'https://github.com/user/repo', dir: '/repos/my-project' });
await git.commit({ dir: '/repos/my-project', message: 'feat: add feature', author: { name: 'User', email: 'user@example.com' } });
await git.push({ dir: '/repos/my-project' });
```

**Types:** `CloneOptions`, `CommitOptions`, `PushOptions`, `PullOptions`, `FetchOptions`, `BranchOptions`, `CheckoutOptions`, `StageOptions`, `DiffResult`, `RepositoryStatus`, `FileStatus`, `BranchInfo`, `CommitInfo`, `GitCredentials`, `ProgressCallback`

### Credential Service (`@thumbcode/core/credentials`)

Hardware-backed credential storage using Expo SecureStore:

- `CredentialService` -- Store, retrieve, and delete encrypted credentials with optional biometric protection
- `validateAnthropicKey(key)` -- Validate an Anthropic API key format
- `validateGitHubToken(token)` -- Validate a GitHub token format

```typescript
import { CredentialService } from '@thumbcode/core';

const creds = new CredentialService();
await creds.store({ key: 'github', value: 'ghp_...', biometric: true });
const result = await creds.retrieve({ key: 'github' });
```

**Types:** `SecureCredential`, `StoreOptions`, `RetrieveOptions`, `RetrieveResult`, `BiometricResult`, `CredentialType`, `ValidationResult`

### GitHub Auth

GitHub Device Flow + PKCE authentication (no backend required):

- `GitHubAuthService` -- Complete Device Flow implementation with polling, token exchange, and user info retrieval

```typescript
import { GitHubAuthService } from '@thumbcode/core';

const auth = new GitHubAuthService();
const { userCode, verificationUri } = await auth.startDeviceFlow();
// Show userCode to user, they enter it at verificationUri
const token = await auth.pollForToken();
```

**Types:** `DeviceCodeResponse`, `AccessTokenResponse`, `DeviceFlowState`, `DeviceFlowOptions`, `GitHubUser`, `StartFlowResult`, `PollResult`

### GitHub API

- `GitHubApiService` -- REST API client for GitHub (repos, users, organizations)

### Security

Defense-in-depth security services:

- `certificatePinningService` -- TLS certificate pinning for API requests
- `requestSigningService` -- HMAC request signing
- `runtimeSecurityService` -- Jailbreak/root detection and runtime integrity checks

## Dependencies

- `@thumbcode/config` -- Environment and constants
- `@thumbcode/types` -- Shared type definitions
- `isomorphic-git` -- Client-side Git operations
- `expo-secure-store` -- Hardware-backed encrypted storage
- `expo-local-authentication` -- Biometric authentication
- `expo-file-system` -- File system access
- `zod` -- Schema validation
- `diff` -- Unified diff generation

## Related

- [ThumbCode README](../../README.md)
- [Security documentation](../../SECURITY.md)
