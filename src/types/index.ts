/**
 * ThumbCode Core Type Definitions
 *
 * These types define the contracts for all ThumbCode features.
 * Agents MUST code against these interfaces - no deviations without Architect approval.
 */

// =============================================================================
// AGENT SYSTEM
// =============================================================================

export type AgentRole = 'architect' | 'implementer' | 'reviewer' | 'tester';

export type AgentStatus =
  | 'idle'
  | 'thinking'
  | 'coding'
  | 'reviewing'
  | 'waiting_approval'
  | 'error'
  | 'paused';

export interface Agent {
  id: string;
  name: string;
  role: AgentRole;
  status: AgentStatus;
  avatar?: string;
  capabilities: AgentCapability[];
  currentTask?: TaskAssignment;
  metrics: AgentMetrics;
  createdAt: Date;
  lastActiveAt: Date;
}

export interface AgentCapability {
  id: string;
  name: string;
  description: string;
  requiredCredentials: CredentialType[];
}

export interface AgentMetrics {
  tasksCompleted: number;
  linesWritten: number;
  reviewsPerformed: number;
  averageTaskTime: number; // milliseconds
  successRate: number; // 0-1
}

export interface TaskAssignment {
  id: string;
  type: 'feature' | 'bugfix' | 'refactor' | 'docs' | 'review' | 'test';
  title: string;
  description: string;
  assignee: string; // Agent ID
  dependsOn: string[]; // Task IDs
  status: TaskStatus;
  priority: 'low' | 'medium' | 'high' | 'critical';
  acceptanceCriteria: string[];
  references: string[];
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export type TaskStatus =
  | 'pending'
  | 'in_progress'
  | 'blocked'
  | 'needs_review'
  | 'complete'
  | 'cancelled';

// =============================================================================
// PROJECT SYSTEM
// =============================================================================

export interface Project {
  id: string;
  name: string;
  description: string;
  repository: Repository;
  agents: string[]; // Agent IDs
  workspaces: string[]; // Workspace IDs
  settings: ProjectSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface Repository {
  provider: 'github' | 'gitlab' | 'bitbucket';
  owner: string;
  name: string;
  defaultBranch: string;
  cloneUrl: string;
  isPrivate: boolean;
}

export interface ProjectSettings {
  autoReview: boolean;
  requireApproval: boolean;
  maxConcurrentAgents: number;
  branchProtection: BranchProtectionRule[];
}

export interface BranchProtectionRule {
  pattern: string;
  requireReview: boolean;
  requireTests: boolean;
}

// =============================================================================
// WORKSPACE SYSTEM
// =============================================================================

export interface Workspace {
  id: string;
  projectId: string;
  agentId: string;
  branch: string;
  status: WorkspaceStatus;
  files: WorkspaceFile[];
  changes: FileChange[];
  createdAt: Date;
  updatedAt: Date;
}

export type WorkspaceStatus = 'initializing' | 'ready' | 'syncing' | 'conflict' | 'error';

export interface WorkspaceFile {
  path: string;
  type: 'file' | 'directory';
  size?: number;
  lastModified?: Date;
  status: 'unchanged' | 'modified' | 'added' | 'deleted' | 'renamed';
}

export interface FileChange {
  path: string;
  type: 'add' | 'modify' | 'delete' | 'rename';
  oldPath?: string; // For renames
  hunks: DiffHunk[];
  staged: boolean;
}

export interface DiffHunk {
  oldStart: number;
  oldLines: number;
  newStart: number;
  newLines: number;
  content: string;
}

// =============================================================================
// CREDENTIAL SYSTEM
// =============================================================================

export type CredentialType =
  | 'github'
  | 'gitlab'
  | 'bitbucket'
  | 'anthropic'
  | 'openai'
  | 'mcp_server';

export interface Credential {
  id: string;
  type: CredentialType;
  name: string;
  isValid: boolean;
  lastValidated?: Date;
  expiresAt?: Date;
  createdAt: Date;
}

export interface GitHubCredential extends Credential {
  type: 'github';
  username: string;
  accessToken: string; // Stored in SecureStore
  scopes: string[];
}

export interface AnthropicCredential extends Credential {
  type: 'anthropic';
  apiKey: string; // Stored in SecureStore
  organizationId?: string;
}

export interface OpenAICredential extends Credential {
  type: 'openai';
  apiKey: string; // Stored in SecureStore
  organizationId?: string;
}

export interface MCPServerCredential extends Credential {
  type: 'mcp_server';
  serverUrl: string;
  authToken?: string; // Stored in SecureStore
  capabilities: string[];
}

// =============================================================================
// CHAT SYSTEM
// =============================================================================

export interface ChatThread {
  id: string;
  projectId: string;
  participants: string[]; // Agent IDs + 'user'
  messages: ChatMessage[];
  context: ChatContext;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessage {
  id: string;
  threadId: string;
  sender: string; // Agent ID or 'user'
  role: 'user' | 'assistant' | 'system';
  content: MessageContent[];
  metadata?: MessageMetadata;
  createdAt: Date;
}

export type MessageContent = TextContent | CodeContent | FileContent | ActionContent;

export interface TextContent {
  type: 'text';
  text: string;
}

export interface CodeContent {
  type: 'code';
  language: string;
  code: string;
  filename?: string;
}

export interface FileContent {
  type: 'file';
  path: string;
  action: 'created' | 'modified' | 'deleted';
  diff?: string;
}

export interface ActionContent {
  type: 'action';
  action: 'approve' | 'reject' | 'request_changes' | 'commit' | 'push';
  target?: string;
  details?: string;
}

export interface MessageMetadata {
  tokenCount?: number;
  modelUsed?: string;
  responseTime?: number;
  toolsUsed?: string[];
}

export interface ChatContext {
  activeFiles: string[];
  recentCommits: string[];
  currentBranch: string;
  pendingChanges: number;
}

// =============================================================================
// USER SYSTEM
// =============================================================================

export interface User {
  id: string;
  email?: string;
  displayName: string;
  avatar?: string;
  credentials: string[]; // Credential IDs
  projects: string[]; // Project IDs
  preferences: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  hapticFeedback: boolean;
  notifications: NotificationPreferences;
  editor: EditorPreferences;
}

export interface NotificationPreferences {
  agentComplete: boolean;
  reviewRequired: boolean;
  errorAlerts: boolean;
  dailySummary: boolean;
}

export interface EditorPreferences {
  fontSize: number;
  tabSize: number;
  wordWrap: boolean;
  lineNumbers: boolean;
}

// =============================================================================
// NAVIGATION
// =============================================================================

export type RootStackParamList = {
  '(onboarding)': undefined;
  '(tabs)': undefined;
  'project/[id]': { id: string };
  'agent/[id]': { id: string };
  'workspace/[id]': { id: string };
  settings: undefined;
};

export type OnboardingStackParamList = {
  welcome: undefined;
  'github-auth': undefined;
  'api-keys': undefined;
  'create-project': undefined;
  complete: undefined;
};

export type TabParamList = {
  index: undefined;
  projects: undefined;
  agents: undefined;
  chat: undefined;
  settings: undefined;
};

// =============================================================================
// API RESPONSES
// =============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ApiMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ApiMeta {
  requestId: string;
  timestamp: Date;
  rateLimit?: RateLimitInfo;
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: Date;
}

// =============================================================================
// EVENTS
// =============================================================================

export type AppEvent = AgentEvent | ProjectEvent | WorkspaceEvent | ChatEvent;

export interface AgentEvent {
  type: 'agent';
  action: 'started' | 'stopped' | 'status_changed' | 'task_assigned' | 'task_completed';
  agentId: string;
  payload: Record<string, unknown>;
  timestamp: Date;
}

export interface ProjectEvent {
  type: 'project';
  action: 'created' | 'updated' | 'deleted' | 'synced';
  projectId: string;
  payload: Record<string, unknown>;
  timestamp: Date;
}

export interface WorkspaceEvent {
  type: 'workspace';
  action: 'created' | 'files_changed' | 'committed' | 'pushed' | 'conflict';
  workspaceId: string;
  payload: Record<string, unknown>;
  timestamp: Date;
}

export interface ChatEvent {
  type: 'chat';
  action: 'message_sent' | 'message_received' | 'typing';
  threadId: string;
  payload: Record<string, unknown>;
  timestamp: Date;
}
