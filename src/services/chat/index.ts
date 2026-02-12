/**
 * Chat Service
 *
 * Real-time chat interactions between users and AI agents.
 */

export * from './types';
export { ChatService } from './ChatService';
export type { Message, ChatThread, CodeMessage, ApprovalMessage } from './ChatService';

// Focused modules for direct import
export { MessageStore } from './MessageStore';
export { StreamHandler } from './StreamHandler';
export { AgentResponseService } from './AgentResponseService';
