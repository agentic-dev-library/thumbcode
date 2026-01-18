# ThumbCode API Reference

This documentation covers the core services and APIs that power ThumbCode's mobile-first development experience.

## Core Services

ThumbCode is built on a modular service architecture designed for reliability, security, and offline-first operation.

### Service Overview

| Service | Purpose | Package |
|---------|---------|---------|
| [GitService](./git-service.md) | Git operations using isomorphic-git | `@thumbcode/core` |
| [CredentialService](./credential-service.md) | Secure credential storage | `@thumbcode/core` |
| [ChatService](./chat-service.md) | AI provider communication | `@thumbcode/core` |
| [AgentOrchestrator](./agent-orchestrator.md) | Multi-agent coordination | `@thumbcode/core` |

## Architecture Principles

### BYOK (Bring Your Own Keys)

ThumbCode operates on a zero-server dependency model. Users provide their own API keys for:
- **AI Providers**: Anthropic (Claude), OpenAI (GPT)
- **Version Control**: GitHub Personal Access Tokens
- **Optional**: Custom MCP server endpoints

All keys are stored locally using hardware-backed encryption via `expo-secure-store`.

### Offline-First Design

All services are designed to work offline where possible:
- Git operations are performed locally using isomorphic-git
- Changes are synced when connectivity is available
- Agent state is persisted locally

### Type Safety

All APIs are fully typed with TypeScript. Types are exported from `@thumbcode/types`.

```typescript
import type { Agent, Project, GitBranch } from '@thumbcode/types';
```

## Quick Start

### Initialize Services

```typescript
import {
  GitService,
  CredentialService,
  ChatService
} from '@thumbcode/core';

// Services are typically accessed as singletons
const gitService = new GitService();
const credentialService = CredentialService;
const chatService = new ChatService();
```

### Common Patterns

#### Storing Credentials

```typescript
import { CredentialService } from '@thumbcode/core';

// Store an API key
await CredentialService.store('anthropic', 'sk-ant-...');

// Retrieve a credential
const credential = await CredentialService.retrieve('anthropic');
if (credential.secret) {
  // Use the credential
}
```

#### Git Operations

```typescript
import { GitService } from '@thumbcode/core';

const git = new GitService();
await git.initialize('/path/to/repo');

// Clone a repository
await git.clone('https://github.com/owner/repo.git');

// Check status
const status = await git.status();
console.log(status.modified, status.staged, status.untracked);
```

#### AI Chat

```typescript
import { ChatService } from '@thumbcode/core';

const chat = new ChatService();

// Send a message
const response = await chat.sendMessage({
  provider: 'anthropic',
  model: 'claude-3-5-sonnet-20241022',
  messages: [
    { role: 'user', content: 'Explain this code...' }
  ]
});
```

## Error Handling

All services use a consistent error handling pattern:

```typescript
import { AppError, isAppError, ErrorCodes } from '@thumbcode/core';

try {
  await gitService.push();
} catch (error) {
  if (isAppError(error)) {
    switch (error.code) {
      case ErrorCodes.AUTH_REQUIRED:
        // Handle authentication error
        break;
      case ErrorCodes.NETWORK_ERROR:
        // Handle network error
        break;
      default:
        // Handle other errors
    }
  }
}
```

## Integration Guides

For connecting ThumbCode to external services, see:

- [GitHub Integration](../integrations/github.md)
- [Anthropic/OpenAI Setup](../integrations/anthropic-openai.md)
- [MCP Server Configuration](../integrations/mcp-server.md)

## Type Definitions

Core types are available from `@thumbcode/types`:

```typescript
// Agent types
interface Agent {
  id: string;
  name: string;
  type: AgentType;
  status: AgentStatus;
  currentTask?: string;
}

// Project types
interface Project {
  id: string;
  name: string;
  path: string;
  gitUrl?: string;
  createdAt: Date;
}

// Git types
interface GitStatus {
  branch: string;
  ahead: number;
  behind: number;
  modified: string[];
  staged: string[];
  untracked: string[];
}
```

## Next Steps

- Explore individual service documentation
- Review [integration guides](../integrations/index.md)
- Check out the [development setup](../development/setup.md)
