/**
 * Chat System Type Definitions
 */

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
