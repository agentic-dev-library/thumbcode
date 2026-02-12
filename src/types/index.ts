/**
 * ThumbCode Core Type Definitions
 *
 * These types define the contracts for all ThumbCode features.
 * Agents MUST code against these interfaces - no deviations without Architect approval.
 *
 * Types are organized by domain:
 * - agent.ts: Agent roles, statuses, capabilities, tasks
 * - project.ts: Projects, repositories, settings
 * - workspace.ts: Workspaces, files, diffs
 * - credentials.ts: Credential types and providers
 * - chat.ts: Chat threads, messages, content types
 * - user.ts: Users, preferences
 * - navigation.ts: Route parameter lists
 * - api.ts: API response wrappers
 * - events.ts: Application events
 */

// Agent System
export type {
  Agent,
  AgentCapability,
  AgentMetrics,
  AgentRole,
  AgentStatus,
  TaskAssignment,
  TaskStatus,
} from './agent';

// Project System
export type {
  BranchProtectionRule,
  Project,
  ProjectSettings,
  Repository,
} from './project';

// Workspace System
export type {
  DiffHunk,
  FileChange,
  Workspace,
  WorkspaceFile,
  WorkspaceStatus,
} from './workspace';

// Credential System
export type {
  AnthropicCredential,
  Credential,
  CredentialType,
  GitHubCredential,
  MCPServerCredential,
  OpenAICredential,
} from './credentials';

// Chat System
export type {
  ActionContent,
  ChatContext,
  ChatMessage,
  ChatThread,
  CodeContent,
  FileContent,
  MessageContent,
  MessageMetadata,
  TextContent,
} from './chat';

// User System
export type {
  EditorPreferences,
  NotificationPreferences,
  User,
  UserPreferences,
} from './user';

// Navigation
export type {
  OnboardingStackParamList,
  RootStackParamList,
  TabParamList,
} from './navigation';

// API Responses
export type {
  ApiError,
  ApiMeta,
  ApiResponse,
  RateLimitInfo,
} from './api';

// Events
export type {
  AgentEvent,
  AppEvent,
  ChatEvent,
  ProjectEvent,
  WorkspaceEvent,
} from './events';
