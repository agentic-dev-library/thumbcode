/**
 * Chat Service
 *
 * Manages real-time chat interactions between users and AI agents.
 * Handles message streaming, thread management, and agent coordination.
 */

import { CredentialService } from '@thumbcode/core';
import type {
  ApprovalMessage,
  ChatThread,
  CodeMessage,
  Message,
  MessageContentType,
  MessageSender,
} from '@thumbcode/state';
import { useCredentialStore, useChatStore } from '@thumbcode/state';
import { createAIClient } from '../ai/AIClientFactory';
import { getAgentSystemPrompt } from '../ai/AgentPrompts';
import type { AIMessage, AIProvider } from '../ai/types';

// Event types for streaming updates
export type ChatEventType =
  | 'message_start'
  | 'message_delta'
  | 'message_complete'
  | 'typing_start'
  | 'typing_end'
  | 'approval_request'
  | 'approval_response'
  | 'error';

export interface ChatEvent {
  type: ChatEventType;
  threadId: string;
  messageId?: string;
  delta?: string;
  sender?: MessageSender;
  error?: Error;
}

export interface SendMessageOptions {
  threadId: string;
  content: string;
  contentType?: MessageContentType;
  metadata?: Record<string, unknown>;
  targetAgent?: MessageSender;
}

export interface StreamingResponse {
  messageId: string;
  content: string;
  isComplete: boolean;
}

type ChatEventListener = (event: ChatEvent) => void;

/**
 * ChatService handles all chat operations including:
 * - Sending messages to agents
 * - Receiving and streaming responses
 * - Managing typing indicators
 * - Handling approval workflows
 */
class ChatServiceImpl {
  private listeners: Set<ChatEventListener> = new Set();
  private abortControllers: Map<string, AbortController> = new Map();

  /**
   * Subscribe to chat events
   */
  onEvent(listener: ChatEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Emit an event to all listeners
   */
  private emit(event: ChatEvent): void {
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (error) {
        console.error('[ChatService] Error in event listener:', error);
      }
    }
  }

  /**
   * Create a new chat thread
   */
  createThread(options: {
    title: string;
    projectId?: string;
    participants?: MessageSender[];
  }): string {
    const { title, projectId, participants = ['user'] } = options;

    return useChatStore.getState().createThread({
      title,
      projectId,
      participants,
      isPinned: false,
    });
  }

  /**
   * Get all threads
   */
  getThreads(): ChatThread[] {
    return useChatStore.getState().threads;
  }

  /**
   * Get a specific thread
   */
  getThread(threadId: string): ChatThread | undefined {
    return useChatStore.getState().threads.find((t) => t.id === threadId);
  }

  /**
   * Get messages for a thread
   */
  getMessages(threadId: string): Message[] {
    return useChatStore.getState().messages[threadId] || [];
  }

  /**
   * Send a message in a thread
   */
  async sendMessage(options: SendMessageOptions): Promise<string> {
    const { threadId, content, contentType = 'text', metadata, targetAgent } = options;

    // Add user message to store
    const messageId = useChatStore.getState().addMessage({
      threadId,
      sender: 'user',
      content,
      contentType,
      metadata,
    });

    this.emit({
      type: 'message_complete',
      threadId,
      messageId,
      sender: 'user',
    });

    // If targeting a specific agent, request a response
    if (targetAgent && targetAgent !== 'user' && targetAgent !== 'system') {
      await this.requestAgentResponse(threadId, messageId, targetAgent);
    }

    return messageId;
  }

  /**
   * Send a code message
   */
  async sendCodeMessage(options: {
    threadId: string;
    code: string;
    language: string;
    filename?: string;
  }): Promise<string> {
    const { threadId, code, language, filename } = options;

    const messageId = useChatStore.getState().addMessage({
      threadId,
      sender: 'user',
      content: code,
      contentType: 'code',
      metadata: {
        language,
        filename,
      },
    });

    this.emit({
      type: 'message_complete',
      threadId,
      messageId,
      sender: 'user',
    });

    return messageId;
  }

  /**
   * Resolve the user's AI provider and API key from secure storage.
   * Tries anthropic first, then openai.
   */
  private async resolveAICredentials(): Promise<{ provider: AIProvider; apiKey: string }> {
    // Check which AI credentials are available via the credential store metadata
    const credentialStore = useCredentialStore.getState();
    const anthropicMeta = credentialStore.getCredentialByProvider('anthropic');
    const openaiMeta = credentialStore.getCredentialByProvider('openai');

    // Try anthropic first, then openai
    if (anthropicMeta) {
      const result = await CredentialService.retrieve('anthropic');
      if (result.secret) {
        return { provider: 'anthropic', apiKey: result.secret };
      }
    }

    if (openaiMeta) {
      const result = await CredentialService.retrieve('openai');
      if (result.secret) {
        return { provider: 'openai', apiKey: result.secret };
      }
    }

    throw new Error(
      'No AI API key configured. Please add an Anthropic or OpenAI API key in Settings.'
    );
  }

  /**
   * Convert thread messages to AIMessage format for the AI client
   */
  private toAIMessages(messages: Message[]): AIMessage[] {
    return messages
      .filter((m) => m.sender !== 'system')
      .map((m) => ({
        role: (m.sender === 'user' ? 'user' : 'assistant') as AIMessage['role'],
        content: m.content,
      }));
  }

  /**
   * Request a response from an agent
   */
  private async requestAgentResponse(
    threadId: string,
    _triggerMessageId: string,
    agent: MessageSender
  ): Promise<void> {
    // Create abort controller for this request
    const abortController = new AbortController();
    this.abortControllers.set(threadId, abortController);

    // Set typing indicator
    useChatStore.getState().setTyping(threadId, agent, true);
    this.emit({
      type: 'typing_start',
      threadId,
      sender: agent,
    });

    try {
      // Resolve AI credentials
      const { provider, apiKey } = await this.resolveAICredentials();
      const aiClient = createAIClient(provider, apiKey);

      // Get thread context (recent messages for context)
      const messages = this.getMessages(threadId);
      const recentMessages = messages.slice(-10);
      const aiMessages = this.toAIMessages(recentMessages);

      // Get agent-specific system prompt
      const systemPrompt = getAgentSystemPrompt(agent);

      // Create empty response message for streaming into
      const messageId = useChatStore.getState().addMessage({
        threadId,
        sender: agent,
        content: '',
        contentType: 'text',
      });

      this.emit({
        type: 'message_start',
        threadId,
        messageId,
        sender: agent,
      });

      // Stream the AI response
      let currentContent = '';

      await aiClient.streamMessage(
        aiMessages,
        systemPrompt,
        (chunk) => {
          if (chunk.done) return;

          currentContent += chunk.text;

          // Update message content in the store
          const store = useChatStore.getState();
          const threadMessages = store.messages[threadId] || [];
          const messageIndex = threadMessages.findIndex((m) => m.id === messageId);
          if (messageIndex !== -1) {
            threadMessages[messageIndex].content = currentContent;
          }

          this.emit({
            type: 'message_delta',
            threadId,
            messageId,
            delta: chunk.text,
            sender: agent,
          });
        },
        abortController.signal
      );

      // Mark message as delivered
      useChatStore.getState().updateMessageStatus(messageId, threadId, 'delivered');

      this.emit({
        type: 'message_complete',
        threadId,
        messageId,
        sender: agent,
      });
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        // Add error message to the thread so the user sees what went wrong
        const errorContent =
          error.message.includes('API key') || error.message.includes('No AI')
            ? error.message
            : `Failed to get response: ${error.message}`;

        useChatStore.getState().addMessage({
          threadId,
          sender: 'system',
          content: errorContent,
          contentType: 'text',
        });

        this.emit({
          type: 'error',
          threadId,
          error: error as Error,
        });
      }
    } finally {
      // Clear typing indicator
      useChatStore.getState().setTyping(threadId, agent, false);
      this.emit({
        type: 'typing_end',
        threadId,
        sender: agent,
      });
      this.abortControllers.delete(threadId);
    }
  }

  /**
   * Cancel an ongoing response
   */
  cancelResponse(threadId: string): void {
    const controller = this.abortControllers.get(threadId);
    if (controller) {
      controller.abort();
      this.abortControllers.delete(threadId);
    }
  }

  /**
   * Request approval from the user
   */
  requestApproval(options: {
    threadId: string;
    sender: MessageSender;
    actionType: 'commit' | 'push' | 'merge' | 'deploy' | 'file_change';
    actionDescription: string;
  }): string {
    const { threadId, sender, actionType, actionDescription } = options;

    const messageId = useChatStore.getState().addMessage({
      threadId,
      sender,
      content: `Requesting approval for: ${actionDescription}`,
      contentType: 'approval_request',
      metadata: {
        actionType,
        actionDescription,
      },
    });

    this.emit({
      type: 'approval_request',
      threadId,
      messageId,
      sender,
    });

    return messageId;
  }

  /**
   * Respond to an approval request
   */
  respondToApproval(threadId: string, messageId: string, approved: boolean): void {
    useChatStore.getState().respondToApproval(messageId, threadId, approved);

    this.emit({
      type: 'approval_response',
      threadId,
      messageId,
    });
  }

  /**
   * Delete a thread
   */
  deleteThread(threadId: string): void {
    // Cancel any ongoing responses
    this.cancelResponse(threadId);
    useChatStore.getState().deleteThread(threadId);
  }

  /**
   * Clear all messages in a thread
   */
  clearThread(threadId: string): void {
    useChatStore.getState().clearThread(threadId);
  }

  /**
   * Pin/unpin a thread
   */
  pinThread(threadId: string, pinned: boolean): void {
    useChatStore.getState().pinThread(threadId, pinned);
  }

  /**
   * Mark a thread as read
   */
  markAsRead(threadId: string): void {
    useChatStore.getState().markThreadAsRead(threadId);
  }

  /**
   * Search messages across threads
   */
  searchMessages(query: string): Message[] {
    const allMessages = useChatStore.getState().messages;
    const results: Message[] = [];
    const queryLower = query.toLowerCase();

    for (const threadMessages of Object.values(allMessages)) {
      for (const message of threadMessages) {
        if (message.content.toLowerCase().includes(queryLower)) {
          results.push(message);
        }
      }
    }

    return results.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

}

// Export singleton instance
export const ChatService = new ChatServiceImpl();

// Export types for consumers
export type { Message, ChatThread, CodeMessage, ApprovalMessage };
