/**
 * Chat Type Definitions
 *
 * Types for the chat system between users and agents.
 */

/**
 * Chat thread
 */
export interface ChatThread {
  id: string;
  projectId: string;
  participants: string[]; // Agent IDs + 'user'
  messages: ChatMessage[];
  context: ChatContext;
  status: ThreadStatus;
  createdAt: string;
  updatedAt: string;
}

/**
 * Thread status
 */
export type ThreadStatus = 'active' | 'paused' | 'completed' | 'archived';

/**
 * Chat message
 */
export interface ChatMessage {
  id: string;
  threadId: string;
  sender: string; // Agent ID or 'user'
  role: MessageRole;
  content: MessageContent[];
  metadata?: MessageMetadata;
  createdAt: string;
}

/**
 * Message role
 */
export type MessageRole = 'user' | 'assistant' | 'system';

/**
 * Message content types
 */
export type MessageContent =
  | TextContent
  | CodeContent
  | FileContent
  | ActionContent
  | ToolUseContent
  | ToolResultContent;

/**
 * Text content
 */
export interface TextContent {
  type: 'text';
  text: string;
}

/**
 * Code content
 */
export interface CodeContent {
  type: 'code';
  language: string;
  code: string;
  filename?: string;
  startLine?: number;
  endLine?: number;
}

/**
 * File content
 */
export interface FileContent {
  type: 'file';
  path: string;
  action: 'created' | 'modified' | 'deleted' | 'renamed';
  diff?: string;
  oldPath?: string;
}

/**
 * Action content (user actions)
 */
export interface ActionContent {
  type: 'action';
  action: UserAction;
  target?: string;
  details?: string;
}

/**
 * User actions
 */
export type UserAction =
  | 'approve'
  | 'reject'
  | 'request_changes'
  | 'commit'
  | 'push'
  | 'stage'
  | 'unstage';

/**
 * Tool use content (agent using a tool)
 */
export interface ToolUseContent {
  type: 'tool_use';
  toolName: string;
  input: Record<string, unknown>;
  id: string;
}

/**
 * Tool result content
 */
export interface ToolResultContent {
  type: 'tool_result';
  toolUseId: string;
  result: unknown;
  isError?: boolean;
}

/**
 * Message metadata
 */
export interface MessageMetadata {
  tokenCount?: number;
  inputTokens?: number;
  outputTokens?: number;
  modelUsed?: string;
  responseTime?: number;
  toolsUsed?: string[];
  stopReason?: string;
}

/**
 * Chat context (what the agent knows about)
 */
export interface ChatContext {
  activeFiles: string[];
  recentCommits: string[];
  currentBranch: string;
  pendingChanges: number;
  workspaceId?: string;
}

/**
 * Streaming message chunk
 */
export interface MessageChunk {
  type: 'text' | 'tool_use' | 'tool_result';
  delta?: string;
  toolName?: string;
  input?: Record<string, unknown>;
  id?: string;
}
