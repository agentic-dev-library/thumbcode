---
title: API Reference
description: ThumbCode API documentation for core services.
---

This section documents the core services and APIs available in ThumbCode.

## Core Services

### CredentialService

Manages secure storage and validation of API credentials.

```typescript
import { CredentialService } from '@thumbcode/core';

// Store a credential
await CredentialService.store('anthropic', 'sk-ant-...');

// Retrieve a credential
const { secret } = await CredentialService.retrieve('anthropic');

// Validate a credential
const result = await CredentialService.validateCredential('github', token);

// Check if credential exists
const exists = await CredentialService.exists('github');

// Delete a credential
await CredentialService.delete('github');
```

### GitHubAuthService

Handles GitHub Device Flow OAuth authentication.

```typescript
import { GitHubAuthService } from '@thumbcode/core';

// Start device flow
const result = await GitHubAuthService.startDeviceFlow({
  clientId: 'your-client-id',
  onUserCode: (code, uri) => {
    console.log(`Enter ${code} at ${uri}`);
  },
});

// Poll for token
await GitHubAuthService.pollForToken({ clientId: 'your-client-id' });

// Check authentication status
const isAuth = await GitHubAuthService.isAuthenticated();

// Get current user
const user = await GitHubAuthService.getCurrentUser();

// Sign out
await GitHubAuthService.signOut();
```

### GitService

Provides client-side git operations using isomorphic-git.

```typescript
import { GitService } from '@thumbcode/core';

// Clone a repository
await GitService.clone({
  url: 'https://github.com/user/repo',
  dir: '/repos/my-project',
});

// Get repository status
const status = await GitService.status({ dir: '/repos/my-project' });

// Stage files
await GitService.add({ dir, filepath: 'src/index.ts' });

// Commit changes
await GitService.commit({
  dir,
  message: 'feat: add new feature',
  author: { name: 'User', email: 'user@example.com' },
});

// Push to remote
await GitService.push({ dir, remote: 'origin', branch: 'main' });
```

## State Management

ThumbCode uses Zustand stores for state management:

- `useProjectStore` - Project and repository state
- `useAgentStore` - Agent configuration and status
- `useChatStore` - Chat history and messages
- `useSettingsStore` - User preferences

## Type Definitions

See the `@thumbcode/types` package for all TypeScript type definitions:

```typescript
import type {
  Agent,
  Project,
  ChatMessage,
  CredentialType,
  GitCommit,
} from '@thumbcode/types';
```
