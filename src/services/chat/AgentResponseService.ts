/**
 * Agent Response Service
 *
 * Routes user messages to the appropriate agent via AgentOrchestrator
 * from @thumbcode/agent-intelligence. The orchestrator manages agent
 * lifecycle and routing; streaming responses flow through the existing
 * chat event infrastructure.
 */

import type {
  AgentContext,
  AgentOrchestrator,
  Message as AIMessage,
  AIProvider,
  OrchestratorConfig,
  StreamEvent,
} from '@thumbcode/agent-intelligence';
import { createAIClient, getDefaultModel } from '@thumbcode/agent-intelligence';
import type { AgentRole } from '@thumbcode/types';
import type { Message, MessageSender } from '@thumbcode/state';
import { useChatStore, useCredentialStore } from '@thumbcode/state';
import { SecureStoragePlugin } from 'capacitor-secure-storage-plugin';
import { getAgentSystemPrompt } from './AgentPrompts';
import type { MessageStore } from './MessageStore';
import type { StreamHandler } from './StreamHandler';

/** Agent roles the orchestrator can route to */
const AGENT_ROLES: readonly AgentRole[] = ['architect', 'implementer', 'reviewer', 'tester'];

/** Default project context for orchestrator initialization */
const DEFAULT_PROJECT_CONTEXT: AgentContext = {
  projectId: '',
  workspaceDir: '',
  currentBranch: 'main',
  availableFiles: [],
};

export class AgentResponseService {
  private orchestrator: AgentOrchestrator | null = null;
  private orchestratorProvider: AIProvider | null = null;

  constructor(
    private streamHandler: StreamHandler,
    private messageStore: MessageStore
  ) {}

  /**
   * Ensure the orchestrator is initialized with current credentials.
   * Returns null if no credentials are available.
   */
  private async ensureOrchestrator(
    provider: AIProvider,
    apiKey: string
  ): Promise<AgentOrchestrator | null> {
    // Re-create if provider changed or not yet initialized
    if (this.orchestrator && this.orchestratorProvider === provider) {
      return this.orchestrator;
    }

    // Lazy import to avoid circular dependency at module load time
    const { AgentOrchestrator: OrchestratorClass } = await import('@thumbcode/agent-intelligence');

    const config: OrchestratorConfig = {
      provider,
      model: getDefaultModel(provider),
      maxConcurrentAgents: 1,
      autoAssign: true,
      enableParallelExecution: false,
      projectContext: DEFAULT_PROJECT_CONTEXT,
    };

    const orchestrator = new OrchestratorClass(config, apiKey);
    await orchestrator.initialize();

    this.orchestrator = orchestrator;
    this.orchestratorProvider = provider;
    return orchestrator;
  }

  /**
   * Check if a MessageSender is a valid agent role for routing
   */
  private isAgentRole(sender: MessageSender): sender is AgentRole {
    return (AGENT_ROLES as readonly string[]).includes(sender);
  }

  /**
   * Request a response from an agent, routed through the orchestrator
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

      // Initialize or reuse orchestrator for agent routing
      let orchestrator: AgentOrchestrator | null = null;
      if (this.isAgentRole(agent)) {
        try {
          orchestrator = await this.ensureOrchestrator(provider, apiKey);
        } catch {
          // Orchestrator init failed — fall through to direct AI client
          orchestrator = null;
        }
      }

      // Route through orchestrator when available, otherwise direct
      const aiClient = createAIClient(provider, apiKey);
      const systemPrompt = this.resolveSystemPrompt(agent, orchestrator);
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
   * Resolve system prompt — the orchestrator validates agent availability,
   * while the prompt content comes from AgentPrompts (our chat-specific prompts).
   */
  private resolveSystemPrompt(
    agent: MessageSender,
    orchestrator: AgentOrchestrator | null
  ): string {
    if (orchestrator && this.isAgentRole(agent)) {
      // Verify the agent role has an initialized agent in the orchestrator
      const state = orchestrator.getState();
      const hasAgent = Array.from(state.agents.values()).some((a) => a.role === agent);
      if (!hasAgent) {
        // Agent not found in orchestrator — this shouldn't happen after init,
        // but fall back gracefully to the static prompt
        return getAgentSystemPrompt(agent);
      }
    }
    return getAgentSystemPrompt(agent);
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
