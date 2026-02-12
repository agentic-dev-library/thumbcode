# @thumbcode/state

State management for ThumbCode using Zustand. Provides reactive stores for agents, chat, credentials, projects, and user settings with persistence via AsyncStorage.

## Installation

This package is part of the ThumbCode monorepo and uses workspace protocol:

```json
{
  "dependencies": {
    "@thumbcode/state": "workspace:*"
  }
}
```

## Stores

### Agent Store (`@thumbcode/state/agent`)

Manages the multi-agent system state:

- `useAgentStore` -- Zustand hook for agent state
- **Selectors:** `selectAgents`, `selectActiveAgent`, `selectAgentsByRole`, `selectAgentsByStatus`, `selectWorkingAgents`, `selectPendingTasks`, `selectAgentTasks`

```typescript
import { useAgentStore, selectActiveAgent } from '@thumbcode/state';

const activeAgent = useAgentStore(selectActiveAgent);
```

**Types:** `Agent`, `AgentConfig`, `AgentRole`, `AgentStatus`, `AgentTask`

### Chat Store (`@thumbcode/state/chat`)

Manages chat threads and messages between user and agents:

- `useChatStore` -- Zustand hook for chat state
- **Selectors:** `selectThreads`, `selectActiveThread`, `selectActiveThreadMessages`, `selectThreadMessages`, `selectUnreadCount`, `selectPinnedThreads`, `selectRecentThreads`, `selectTypingIndicators`, `selectPendingApprovals`

**Types:** `ChatThread`, `Message`, `MessageContentType`, `MessageSender`, `MessageStatus`, `ApprovalMessage`, `CodeMessage`

### Credential Store (`@thumbcode/state/credential`)

Tracks credential metadata and validation state:

- `useCredentialStore` -- Zustand hook for credential state
- **Selectors:** `selectCredentials`, `selectCredentialByProvider`, `selectValidCredentials`, `selectInvalidCredentials`, `selectIsValidating`, `selectHasGitHubCredential`, `selectHasAICredential`, `selectCredentialsNeedingValidation`

**Types:** `CredentialMetadata`, `CredentialProvider`, `CredentialStatus`, `ValidationResult`

### Project Store (`@thumbcode/state/project`)

Manages projects, workspaces, file trees, and branches:

- `useProjectStore` -- Zustand hook for project state
- **Selectors:** `selectProjects`, `selectActiveProject`, `selectWorkspace`, `selectFileTree`, `selectBranches`, `selectCurrentBranch`, `selectOpenFiles`, `selectActiveFile`, `selectHasUnsavedChanges`, `selectRecentProjects`

**Types:** `Project`, `Workspace`, `Branch`, `Commit`, `FileNode`, `LocalProjectStatus`

### User Store (`@thumbcode/state/user`)

Manages authentication, settings, and preferences:

- `useUserStore` -- Zustand hook for user state
- **Selectors:** `selectIsAuthenticated`, `selectIsOnboarded`, `selectGitHubProfile`, `selectSettings`, `selectTheme`, `selectEditorPreferences`, `selectNotificationPreferences`, `selectAgentPreferences`, `selectIsNewUser`, `selectNeedsSetup`

**Types:** `GitHubProfile`, `UserSettings`, `ThemeMode`, `EditorPreferences`, `NotificationPreferences`, `AgentPreferences`

## Usage

All stores follow the same pattern using Zustand hooks and memoized selectors:

```typescript
import { useAgentStore, selectWorkingAgents } from '@thumbcode/state';
import { useProjectStore, selectActiveProject } from '@thumbcode/state';

function Dashboard() {
  const workingAgents = useAgentStore(selectWorkingAgents);
  const project = useProjectStore(selectActiveProject);

  return (
    // ...
  );
}
```

## Dependencies

- `zustand` -- State management library
- `immer` -- Immutable state updates
- `@react-native-async-storage/async-storage` -- Persistent storage
- `@thumbcode/config` -- Storage keys and constants

## Related

- [ThumbCode README](../../README.md)
