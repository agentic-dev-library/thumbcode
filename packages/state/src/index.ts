/**
 * @thumbcode/state
 *
 * State management for ThumbCode using Zustand.
 * Provides stores for agents, chat, credentials, projects, and user settings.
 */

// Agent store
export {
  useAgentStore,
  selectAgents,
  selectActiveAgent,
  selectAgentsByRole,
  selectAgentsByStatus,
  selectWorkingAgents,
  selectPendingTasks,
  selectAgentTasks,
} from './agentStore';
export type { Agent, AgentConfig, AgentRole, AgentStatus, AgentTask } from './agentStore';

// Chat store
export {
  useChatStore,
  selectThreads,
  selectActiveThread,
  selectActiveThreadMessages,
  selectThreadMessages,
  selectUnreadCount,
  selectPinnedThreads,
  selectRecentThreads,
  selectTypingIndicators,
  selectPendingApprovals,
} from './chatStore';
export type {
  ApprovalMessage,
  ChatThread,
  CodeMessage,
  Message,
  MessageContentType,
  MessageSender,
  MessageStatus,
} from './chatStore';

// Credential store
export {
  useCredentialStore,
  selectCredentials,
  selectCredentialByProvider,
  selectValidCredentials,
  selectInvalidCredentials,
  selectIsValidating,
  selectHasGitHubCredential,
  selectHasAICredential,
  selectCredentialsNeedingValidation,
} from './credentialStore';
export type {
  CredentialMetadata,
  CredentialProvider,
  CredentialStatus,
  ValidationResult,
} from './credentialStore';

// Project store
export {
  useProjectStore,
  selectProjects,
  selectActiveProject,
  selectWorkspace,
  selectFileTree,
  selectBranches,
  selectCurrentBranch,
  selectOpenFiles,
  selectActiveFile,
  selectHasUnsavedChanges,
  selectRecentProjects,
} from './projectStore';
export type { Branch, Commit, FileNode, LocalProjectStatus, Project, Workspace } from './projectStore';

// User store
export {
  useUserStore,
  selectIsAuthenticated,
  selectIsOnboarded,
  selectGitHubProfile,
  selectSettings,
  selectTheme,
  selectEditorPreferences,
  selectNotificationPreferences,
  selectAgentPreferences,
  selectIsNewUser,
  selectNeedsSetup,
} from './userStore';
export type {
  AgentPreferences,
  EditorPreferences,
  GitHubProfile,
  NotificationPreferences,
  ThemeMode,
  UserSettings,
} from './userStore';
