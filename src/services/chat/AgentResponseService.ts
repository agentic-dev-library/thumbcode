/**
 * Agent Response Service
 *
 * Handles agent response orchestration using real AI clients and approval workflows.
 */

import type { Message, MessageSender } from '@thumbcode/state';
import { useChatStore, useCredentialStore } from '@thumbcode/state';
import * as SecureStore from 'expo-secure-store';
import { createAIClient } from '../ai/AIClientFactory';
import { getAgentSystemPrompt } from '../ai/AgentPrompts';
import type { AIMessage, AIProvider } from '../ai/types';
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
    const abortController = this.streamHandler.registerAbort(threadId);

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
            'No AI API key configured. Please add your Anthropic or OpenAI API key in Settings → Credentials.',
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

      // Stream the AI response
      await aiClient.streamMessage(
        aiMessages,
        systemPrompt,
        (chunk) => {
          currentContent += chunk.text;

          // Update message content
          const store = useChatStore.getState();
          const msgs = store.messages[threadId] || [];
          const msgIndex = msgs.findIndex((m) => m.id === messageId);
          if (msgIndex !== -1) {
            msgs[msgIndex].content = currentContent;
          }

          this.streamHandler.emit({
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
    if (metadata.anthropic?.isSet) {
      const apiKey = await SecureStore.getItemAsync('credential_anthropic');
      if (apiKey) return { provider: 'anthropic', apiKey };
    }

    if (metadata.openai?.isSet) {
      const apiKey = await SecureStore.getItemAsync('credential_openai');
      if (apiKey) return { provider: 'openai', apiKey };
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
