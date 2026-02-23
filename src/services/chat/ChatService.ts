/**
 * Chat Service
 *
 * Coordinates chat modules for thread management and agent communication:
 * - MessageStore: thread CRUD, message queries, search
 * - StreamHandler: event system, abort controllers, streaming infrastructure
 * - AgentResponseService: agent response simulation, approval workflows
 */

import type { ToolExecutionBridge } from '@thumbcode/agent-intelligence';
import type { ChatThread, Message, MessageSender } from '@thumbcode/state';
import { AgentResponseService } from './AgentResponseService';
import { MessageStore } from './MessageStore';
import { StreamHandler } from './StreamHandler';
import type { ChatEventListener, SendMessageOptions } from './types';

class ChatServiceImpl {
  private streamHandler: StreamHandler;
  private messageStore: MessageStore;
  private agentResponseService: AgentResponseService;

  constructor() {
    this.streamHandler = new StreamHandler();
    this.messageStore = new MessageStore(this.streamHandler);
    this.agentResponseService = new AgentResponseService(this.streamHandler, this.messageStore);
  }

  // Event management (delegated to StreamHandler)
  onEvent(listener: ChatEventListener): () => void {
    return this.streamHandler.onEvent(listener);
  }

  // Thread & message operations (delegated to MessageStore)
  createThread(options: {
    title: string;
    projectId?: string;
    participants?: MessageSender[];
  }): string {
    return this.messageStore.createThread(options);
  }

  getThreads(): ChatThread[] {
    return this.messageStore.getThreads();
  }

  getThread(threadId: string): ChatThread | undefined {
    return this.messageStore.getThread(threadId);
  }

  getMessages(threadId: string): Message[] {
    return this.messageStore.getMessages(threadId);
  }

  async sendMessage(options: SendMessageOptions): Promise<string> {
    const { targetAgent } = options;

    const messageId = this.messageStore.sendUserMessage(options);

    // Variant mode: generate multiple variant responses
    if (options.variantMode) {
      await this.agentResponseService.requestVariantResponse(
        options.threadId,
        options.content,
        options.variantOptions
      );
      return messageId;
    }

    // Detect pipeline requests when no specific agent is targeted
    if (!targetAgent || targetAgent === 'user') {
      if (this.agentResponseService.isMultiStepRequest(options.content)) {
        await this.agentResponseService.requestPipelineResponse(options.threadId, options.content);
        return messageId;
      }
    }

    // If targeting a specific agent, request a response
    if (targetAgent && targetAgent !== 'user' && targetAgent !== 'system') {
      await this.agentResponseService.requestAgentResponse(
        options.threadId,
        messageId,
        targetAgent
      );
    }

    return messageId;
  }

  async sendCodeMessage(options: {
    threadId: string;
    code: string;
    language: string;
    filename?: string;
  }): Promise<string> {
    return this.messageStore.sendCodeMessage(options);
  }

  deleteThread(threadId: string): void {
    this.messageStore.deleteThread(threadId);
  }

  clearThread(threadId: string): void {
    this.messageStore.clearThread(threadId);
  }

  pinThread(threadId: string, pinned: boolean): void {
    this.messageStore.pinThread(threadId, pinned);
  }

  markAsRead(threadId: string): void {
    this.messageStore.markAsRead(threadId);
  }

  searchMessages(query: string): Message[] {
    return this.messageStore.searchMessages(query);
  }

  // Streaming control (delegated to StreamHandler)
  cancelResponse(threadId: string): void {
    this.streamHandler.cancelResponse(threadId);
  }

  // Approval workflows (delegated to AgentResponseService)
  requestApproval(options: {
    threadId: string;
    sender: MessageSender;
    actionType: 'commit' | 'push' | 'merge' | 'deploy' | 'file_change';
    actionDescription: string;
  }): string {
    return this.agentResponseService.requestApproval(options);
  }

  respondToApproval(threadId: string, messageId: string, approved: boolean): void {
    this.agentResponseService.respondToApproval(threadId, messageId, approved);
  }

  // Tool bridge integration for approval-triggered commits
  setToolBridge(bridge: ToolExecutionBridge, workspaceDir: string): void {
    this.agentResponseService.setToolBridge(bridge, workspaceDir);
  }

  // Pipeline methods (delegated to AgentResponseService)
  isMultiStepRequest(content: string): boolean {
    return this.agentResponseService.isMultiStepRequest(content);
  }

  async requestPipelineResponse(threadId: string, userMessage: string) {
    return this.agentResponseService.requestPipelineResponse(threadId, userMessage);
  }

  // Variant methods (delegated to AgentResponseService)
  async requestVariantResponse(
    threadId: string,
    prompt: string,
    options?: { variantCount?: number; diversityMode?: 'same_provider' | 'multi_provider' }
  ) {
    return this.agentResponseService.requestVariantResponse(threadId, prompt, options);
  }

  selectVariant(threadId: string, messageId: string, variantId: string): void {
    this.agentResponseService.selectVariant(threadId, messageId, variantId);
  }
}

// Export singleton instance
export const ChatService = new ChatServiceImpl();
