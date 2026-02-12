/**
 * Chat Service
 *
 * Real-time chat interactions between users and AI agents.
 */

export { AgentResponseService } from './AgentResponseService';
export type { ApprovalMessage, ChatThread, CodeMessage, Message } from './ChatService';
export { ChatService } from './ChatService';

// Focused modules for direct import
export { MessageStore } from './MessageStore';
export { StreamHandler } from './StreamHandler';
export * from './types';
