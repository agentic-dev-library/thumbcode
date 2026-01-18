/**
 * Zustand State Stores
 *
 * Global state management using Zustand with persistence and DevTools support.
 *
 * Architecture:
 * - All stores use immer middleware for immutable updates
 * - AsyncStorage persistence for app restart survival
 * - DevTools integration for debugging (in development)
 * - Typed selectors for optimal re-renders
 *
 * Security Notes:
 * - CredentialStore only stores METADATA, not actual secrets
 * - Actual API keys/tokens must use Expo SecureStore
 * - UserStore does not store authentication tokens
 */

export type { Agent, AgentConfig, AgentRole, AgentStatus, AgentTask } from './agentStore';
// Agent Store - Multi-agent orchestration state
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
// Chat Store - Human-agent collaboration
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
// Credential Store - API credential metadata (not secrets)
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
export type { Branch, Commit, FileNode, Project, Workspace } from './projectStore';
// Project Store - Repository and workspace state
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
// User Store - Preferences and settings
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
