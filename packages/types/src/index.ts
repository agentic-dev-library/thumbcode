/**
 * @thumbcode/types
 *
 * Shared type definitions for the ThumbCode application.
 * All types are re-exported from domain-specific modules.
 */

// Agents
export type {
  Agent,
  AgentCapability,
  AgentConfig,
  AgentMetrics,
  AgentRole,
  AgentStatus,
  TaskArtifact,
  TaskAssignment,
  TaskOutput,
  TaskPriority,
  TaskStatus,
  TaskType,
} from './agents';
// API
export type {
  Anthropic,
  ApiError,
  ApiMeta,
  ApiResponse,
  GitHub,
  PaginationInfo,
  PaginationParams,
  RateLimitInfo,
} from './api';
// Chat
export type {
  ActionContent,
  ChatContext,
  ChatMessage,
  ChatThread,
  CodeContent,
  FileContent,
  MessageChunk,
  MessageContent,
  MessageMetadata,
  MessageRole,
  TextContent,
  ThreadStatus,
  ToolResultContent,
  ToolUseContent,
  UserAction,
} from './chat';

// Credentials
export type {
  AnthropicCredentialMeta,
  Credential,
  CredentialMeta,
  CredentialProvider,
  CredentialStatus,
  CredentialType,
  CredentialValidationResult,
  GitHubCredentialMeta,
  MCPServerCredentialMeta,
  OpenAICredentialMeta,
} from './credentials';
// Events
export type {
  AgentEvent,
  AgentEventAction,
  AppEvent,
  BaseEvent,
  ChatEvent,
  ChatEventAction,
  EventEmitter,
  EventHandler,
  EventSubscription,
  ProjectEvent,
  ProjectEventAction,
  SystemEvent,
  SystemEventAction,
  WorkspaceEvent,
  WorkspaceEventAction,
} from './events';
// Navigation
export type {
  AgentDetailRoutes,
  OnboardingStackParamList,
  ProjectDetailRoutes,
  RootStackParamList,
  TabParamList,
  WorkspaceDetailRoutes,
} from './navigation';
// Projects
export type {
  BranchProtectionRule,
  CreateProjectOptions,
  GitProvider,
  Project,
  ProjectSettings,
  ProjectStatus,
  Repository,
} from './projects';
// User
export type {
  AgentPreferences,
  EditorPreferences,
  GitHubProfile,
  NotificationPreferences,
  ThemeMode,
  User,
  UserPreferences,
} from './user';
// Workspaces
export type {
  BranchInfo,
  CommitAuthor,
  CommitInfo,
  DiffHunk,
  FileChange,
  FileStatusType,
  Workspace,
  WorkspaceFile,
  WorkspaceStatus,
} from './workspaces';
