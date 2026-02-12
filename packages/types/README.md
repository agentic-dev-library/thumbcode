# @thumbcode/types

Shared TypeScript type definitions for the ThumbCode application. All types are organized into domain-specific modules and re-exported from the package root.

## Installation

This package is part of the ThumbCode monorepo and uses workspace protocol:

```json
{
  "dependencies": {
    "@thumbcode/types": "workspace:*"
  }
}
```

## Modules

### Agents (`@thumbcode/types/agents`)

Agent system types: `Agent`, `AgentRole`, `AgentStatus`, `AgentConfig`, `AgentCapability`, `AgentMetrics`, `TaskAssignment`, `TaskOutput`, `TaskArtifact`, `TaskType`, `TaskStatus`, `TaskPriority`

### Projects (`@thumbcode/types/projects`)

Project management types: `Project`, `ProjectStatus`, `ProjectSettings`, `Repository`, `GitProvider`, `CreateProjectOptions`, `BranchProtectionRule`

### Workspaces (`@thumbcode/types/workspaces`)

Workspace and Git types: `Workspace`, `WorkspaceStatus`, `WorkspaceFile`, `BranchInfo`, `CommitInfo`, `CommitAuthor`, `FileChange`, `FileStatusType`, `DiffHunk`

### Credentials (`@thumbcode/types/credentials`)

Credential management types: `Credential`, `CredentialProvider`, `CredentialType`, `CredentialStatus`, `CredentialMeta`, `CredentialValidationResult`, `GitHubCredentialMeta`, `AnthropicCredentialMeta`, `OpenAICredentialMeta`, `MCPServerCredentialMeta`

### Chat (`@thumbcode/types/chat`)

Chat and messaging types: `ChatMessage`, `ChatThread`, `ChatContext`, `MessageRole`, `MessageContent`, `TextContent`, `CodeContent`, `FileContent`, `ActionContent`, `ToolUseContent`, `ToolResultContent`, `MessageChunk`, `MessageMetadata`, `ThreadStatus`, `UserAction`

### User (`@thumbcode/types/user`)

User and preferences types: `User`, `GitHubProfile`, `UserPreferences`, `ThemeMode`, `EditorPreferences`, `NotificationPreferences`, `AgentPreferences`

### Navigation (`@thumbcode/types/navigation`)

Route parameter types: `RootStackParamList`, `TabParamList`, `OnboardingStackParamList`, `ProjectDetailRoutes`, `AgentDetailRoutes`, `WorkspaceDetailRoutes`

### API (`@thumbcode/types/api`)

API response types: `ApiResponse`, `ApiError`, `ApiMeta`, `PaginationInfo`, `PaginationParams`, `RateLimitInfo`, `GitHub`, `Anthropic`

### Events (`@thumbcode/types/events`)

Event system types: `AppEvent`, `BaseEvent`, `AgentEvent`, `ChatEvent`, `ProjectEvent`, `SystemEvent`, `WorkspaceEvent`, `EventEmitter`, `EventHandler`, `EventSubscription`, and action type unions for each event domain

## Usage

Import types from the root or from specific domain modules:

```typescript
// From root (all types available)
import type { Agent, Project, ChatMessage } from '@thumbcode/types';

// From domain module (tree-shakeable)
import type { Agent, AgentRole } from '@thumbcode/types/agents';
import type { Project } from '@thumbcode/types/projects';
```

## Dependencies

This package has no runtime dependencies -- it contains only TypeScript type definitions.

## Related

- [ThumbCode README](../../README.md)
