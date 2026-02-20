/**
 * Agent Response Service
 *
 * Handles agent response orchestration using @thumbcode/agent-intelligence
 * AI clients (with tool calling, token tracking, rich streaming events)
 * and approval workflows.
 */

import type { Message as AIMessage, AIProvider, StreamEvent } from '@thumbcode/agent-intelligence';
import { createAIClient, getDefaultModel } from '@thumbcode/agent-intelligence';
import type { Message, MessageSender } from '@thumbcode/state';
import { useChatStore, useCredentialStore } from '@thumbcode/state';
import { SecureStoragePlugin } from 'capacitor-secure-storage-plugin';
import { getAgentSystemPrompt } from './AgentPrompts';
import type { MessageStore } from './MessageStore';
import type { StreamHandler } from './StreamHandler';

export class AgentResponseService {
  constructor(
    private streamHandler: StreamHandler,
    private messageStore: MessageStore
  ) {}

  /**
   * Request a response from an agent
   */
  async requestAgentResponse(
    threadId: string,
    _triggerMessageId: string,
    agent: MessageSender
  ): Promise<void> {
    this.streamHandler.registerAbort(threadId);

    // Set typing indicator
    useChatStore.getState().setTyping(threadId, agent, true);
    this.streamHandler.emitTypingStart(threadId, agent);

    try {
      // Get thread context (recent messages for context)
      const messages = this.messageStore.getMessages(threadId);
      const recentMessages = messages.slice(-10);

      // Resolve AI credentials
      const credentials = await this.resolveAICredentials();
      if (!credentials) {
        // No API key configured - add error message
        useChatStore.getState().addMessage({
          threadId,
          sender: agent,
          content:
            'No AI API key configured. Please add your Anthropic or OpenAI API key in Settings \u2192 Credentials.',
          contentType: 'text',
        });
        return;
      }

      const { provider, apiKey } = credentials;
      const aiClient = createAIClient(provider, apiKey);
      const systemPrompt = getAgentSystemPrompt(agent);
      const aiMessages = this.toAIMessages(recentMessages);

      // Create message for streaming response
      const messageId = useChatStore.getState().addMessage({
        threadId,
        sender: agent,
        content: '',
        contentType: 'text',
      });

      this.streamHandler.emit({
        type: 'message_start',
        threadId,
        messageId,
        sender: agent,
      });

      let currentContent = '';

      // Stream the AI response using the rich streaming interface
      await aiClient.completeStream(
        aiMessages,
        {
          model: getDefaultModel(provider),
          maxTokens: 4096,
          systemPrompt,
        },
        (event: StreamEvent) => {
          // Extract text deltas from content_block_delta events
          if (event.type === 'content_block_delta' && event.delta?.text) {
            currentContent += event.delta.text;

            // Update message content via store action
            useChatStore.getState().updateMessageContent(messageId, threadId, currentContent);

            this.streamHandler.emit({
              type: 'message_delta',
              threadId,
              messageId,
              delta: event.delta.text,
              sender: agent,
            });
          }
        }
      );

      // Mark message as delivered
      useChatStore.getState().updateMessageStatus(messageId, threadId, 'delivered');

      this.streamHandler.emit({
        type: 'message_complete',
        threadId,
        messageId,
        sender: agent,
      });
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        this.streamHandler.emit({
          type: 'error',
          threadId,
          error: error as Error,
        });
      }
    } finally {
      // Clear typing indicator
      useChatStore.getState().setTyping(threadId, agent, false);
      this.streamHandler.emitTypingEnd(threadId, agent);
      this.streamHandler.cleanupAbort(threadId);
    }
  }

  /**
   * Resolve AI credentials from the credential store
   */
  private async resolveAICredentials(): Promise<{
    provider: AIProvider;
    apiKey: string;
  } | null> {
    const credState = useCredentialStore.getState();
    const metadata = credState.credentials;

    // Try Anthropic first, then OpenAI
    const anthropicCred = metadata.find((c) => c.provider === 'anthropic' && c.status === 'valid');
    if (anthropicCred) {
      try {
        const result = await SecureStoragePlugin.get({ key: anthropicCred.secureStoreKey });
        if (result.value) return { provider: 'anthropic', apiKey: result.value };
      } catch {
        // Key not found
      }
    }

    const openaiCred = metadata.find((c) => c.provider === 'openai' && c.status === 'valid');
    if (openaiCred) {
      try {
        const result = await SecureStoragePlugin.get({ key: openaiCred.secureStoreKey });
        if (result.value) return { provider: 'openai', apiKey: result.value };
      } catch {
        // Key not found
      }
    }

    return null;
  }

  /**
   * Convert chat messages to AI message format
   */
  private toAIMessages(messages: Message[]): AIMessage[] {
    return messages
      .filter((m) => m.sender === 'user' || m.sender !== 'system')
      .map((m) => ({
        role: (m.sender === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
        content: m.content,
      }));
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

    this.streamHandler.emit({
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

    this.streamHandler.emit({
      type: 'approval_response',
      threadId,
      messageId,
    });
  }
}
