/**
 * @thumbcode/state
 *
 * State management for ThumbCode using Zustand.
 * Provides stores for agents, chat, credentials, projects, and user settings.
 */

export type { Agent, AgentConfig, AgentRole, AgentStatus, AgentTask } from './agentStore';
// Agent store
export {
  selectActiveAgent,
  selectAgents,
  selectAgentsByRole,
  selectAgentsByStatus,
  selectAgentTasks,
  selectPendingTasks,
  selectWorkingAgents,
  useAgentStore,
} from './agentStore';
export type {
  ApprovalMessage,
  ChatThread,
  CodeMessage,
  Message,
  MessageContentType,
  MessageSender,
  MessageStatus,
} from './chatStore';
// Chat store
export {
  selectActiveThread,
  selectActiveThreadMessages,
  selectPendingApprovals,
  selectPinnedThreads,
  selectRecentThreads,
  selectThreadMessages,
  selectThreads,
  selectTypingIndicators,
  selectUnreadCount,
  useChatStore,
} from './chatStore';
export type {
  CredentialMetadata,
  CredentialProvider,
  CredentialStatus,
  ValidationResult,
} from './credentialStore';
// Credential store
export {
  selectCredentialByProvider,
  selectCredentials,
  selectCredentialsNeedingValidation,
  selectHasAICredential,
  selectHasGitHubCredential,
  selectInvalidCredentials,
  selectIsValidating,
  selectValidCredentials,
  useCredentialStore,
} from './credentialStore';
export type {
  Branch,
  Commit,
  FileNode,
  LocalProjectStatus,
  Project,
  Workspace,
} from './projectStore';
// Project store
export {
  selectActiveFile,
  selectActiveProject,
  selectBranches,
  selectCurrentBranch,
  selectFileTree,
  selectHasUnsavedChanges,
  selectOpenFiles,
  selectProjects,
  selectRecentProjects,
  selectWorkspace,
  useProjectStore,
} from './projectStore';
export type {
  AgentPreferences,
  EditorPreferences,
  GitHubProfile,
  NotificationPreferences,
  ThemeMode,
  UserSettings,
} from './userStore';
// User store
export {
  selectAgentPreferences,
  selectEditorPreferences,
  selectGitHubProfile,
  selectIsAuthenticated,
  selectIsNewUser,
  selectIsOnboarded,
  selectNeedsSetup,
  selectNotificationPreferences,
  selectSettings,
  selectTheme,
  useUserStore,
} from './userStore';
