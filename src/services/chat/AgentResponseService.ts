/**
 * Agent Response Service
 *
 * Routes user messages to the appropriate agent via AgentOrchestrator
 * from @thumbcode/agent-intelligence. The orchestrator manages agent
 * lifecycle and routing; streaming responses flow through the existing
 * chat event infrastructure.
 */

import { CredentialService } from '@/core';
import type { AgentContext } from '@/services/agents';
import type { Message as AIMessage, AIProvider, StreamEvent } from '@/services/ai';
import { createAIClient, getDefaultModel } from '@/services/ai';
import type {
  AgentOrchestrator,
  OrchestratorConfig,
  Pipeline,
  VariantResult,
} from '@/services/orchestrator';
import type { ToolExecutionBridge } from '@/services/tools';
import type { Message, MessageSender } from '@/state';
import { useAgentStore, useChatStore, useCredentialStore } from '@/state';
import type { AgentRole } from '@/types';
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

/**
 * Keywords that indicate a multi-step pipeline request vs a simple question.
 */
const PIPELINE_TRIGGER_PATTERNS = [
  /\b(build|create|implement|develop|make)\b.*\b(app|feature|page|screen|component|module)\b/i,
  /\b(add|set\s*up)\b.*\b(authentication|login|signup|dashboard|navigation)\b/i,
  /\bfull\s+(pipeline|workflow|stack)\b/i,
  /\b(end.to.end|start.to.finish|from.scratch)\b/i,
];

export class AgentResponseService {
  private orchestrator: AgentOrchestrator | null = null;
  private orchestratorProvider: AIProvider | null = null;
  private activePipelines: Map<string, Pipeline> = new Map();
  private toolBridge: ToolExecutionBridge | null = null;
  private workspaceDir: string = '';

  constructor(
    private streamHandler: StreamHandler,
    private messageStore: MessageStore
  ) {}

  /**
   * Set the tool bridge for approval-triggered commits.
   */
  setToolBridge(bridge: ToolExecutionBridge, workspaceDir: string): void {
    this.toolBridge = bridge;
    this.workspaceDir = workspaceDir;
  }

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
    const { AgentOrchestrator: OrchestratorClass } = await import('@/services/orchestrator');

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
    // Use CredentialService.retrieve() which handles web (sessionStorage + AES-GCM)
    // and native (Capacitor SecureStorage) transparently.
    const anthropicCred = metadata.find((c) => c.provider === 'anthropic' && c.status === 'valid');
    if (anthropicCred) {
      try {
        const result = await CredentialService.retrieve('anthropic');
        if (result.secret) return { provider: 'anthropic', apiKey: result.secret };
      } catch {
        // Key not found
      }
    }

    const openaiCred = metadata.find((c) => c.provider === 'openai' && c.status === 'valid');
    if (openaiCred) {
      try {
        const result = await CredentialService.retrieve('openai');
        if (result.secret) return { provider: 'openai', apiKey: result.secret };
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
      .filter((m) => m.sender !== 'system')
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
   * Respond to an approval request.
   * For commit/file_change actions, triggers git commit on approve or discard on reject.
   */
  respondToApproval(threadId: string, messageId: string, approved: boolean): void {
    // Read the approval message metadata before updating
    const messages = useChatStore.getState().messages[threadId] || [];
    const approvalMsg = messages.find((m) => m.id === messageId);
    const actionType = approvalMsg?.metadata?.actionType as string | undefined;

    useChatStore.getState().respondToApproval(messageId, threadId, approved);

    this.streamHandler.emit({
      type: 'approval_response',
      threadId,
      messageId,
    });

    // Handle commit/file_change actions via the tool bridge
    if (
      this.toolBridge &&
      this.workspaceDir &&
      (actionType === 'commit' || actionType === 'file_change')
    ) {
      if (approved) {
        this.handleApprovedCommit(threadId);
      } else {
        this.handleRejectedCommit(threadId);
      }
    }
  }

  /**
   * Handle an approved commit: commit staged changes and post confirmation.
   */
  private async handleApprovedCommit(threadId: string): Promise<void> {
    if (!this.toolBridge || !this.workspaceDir) return;

    const result = await this.toolBridge.commitStagedChanges(this.workspaceDir, {
      name: 'ThumbCode Agent',
      email: 'agent@thumbcode.app',
    });

    if (result.success) {
      useChatStore.getState().addMessage({
        threadId,
        sender: 'system',
        content: `Commit successful: ${result.sha ?? 'unknown'} (${result.filesChanged} file(s) changed)`,
        contentType: 'text',
      });
    } else {
      useChatStore.getState().addMessage({
        threadId,
        sender: 'system',
        content: `Commit failed: ${result.error ?? 'Unknown error'}`,
        contentType: 'text',
      });
    }
  }

  /**
   * Handle a rejected commit: discard staged changes and post confirmation.
   */
  private async handleRejectedCommit(threadId: string): Promise<void> {
    if (!this.toolBridge || !this.workspaceDir) return;

    const result = await this.toolBridge.discardStagedChanges(this.workspaceDir);

    useChatStore.getState().addMessage({
      threadId,
      sender: 'system',
      content: result.success
        ? `Changes rejected. ${result.output}`
        : `Failed to discard changes: ${result.error ?? 'Unknown error'}`,
      contentType: 'text',
    });
  }

  /**
   * Detect whether a user message is a multi-step pipeline request
   */
  isMultiStepRequest(content: string): boolean {
    return PIPELINE_TRIGGER_PATTERNS.some((pattern) => pattern.test(content));
  }

  /**
   * Request a multi-agent pipeline response.
   * Creates a pipeline in the orchestrator, then executes each stage
   * sequentially with approval gates and system messages for handoffs.
   */
  async requestPipelineResponse(threadId: string, userMessage: string): Promise<Pipeline | null> {
    // Resolve credentials
    const credentials = await this.resolveAICredentials();
    if (!credentials) {
      useChatStore.getState().addMessage({
        threadId,
        sender: 'system',
        content:
          'No AI API key configured. Please add your Anthropic or OpenAI API key in Settings > Credentials.',
        contentType: 'text',
      });
      return null;
    }

    const { provider, apiKey } = credentials;
    let orchestrator: AgentOrchestrator | null = null;

    try {
      orchestrator = await this.ensureOrchestrator(provider, apiKey);
    } catch {
      useChatStore.getState().addMessage({
        threadId,
        sender: 'system',
        content: 'Failed to initialize agent orchestrator. Please try again.',
        contentType: 'text',
      });
      return null;
    }

    if (!orchestrator) return null;

    // Post system message: pipeline starting
    useChatStore.getState().addMessage({
      threadId,
      sender: 'system',
      content: `Starting multi-agent pipeline for: "${userMessage}"`,
      contentType: 'text',
    });

    // Create the pipeline in the orchestrator
    const pipeline = orchestrator.createPipeline({
      name: userMessage.slice(0, 80),
      description: userMessage,
    });

    // Track the pipeline
    this.activePipelines.set(pipeline.id, pipeline);

    // Create tasks in the agent store for UI visibility
    const agentStore = useAgentStore.getState();
    for (let i = 0; i < pipeline.stages.length; i++) {
      const stage = pipeline.stages[i];
      const agentId = `agent-${stage.role}`;
      agentStore.addTask({
        agentId,
        description: `[Pipeline] ${stage.title}: ${stage.description}`,
        status: i === 0 ? 'in_progress' : 'pending',
      });
    }

    // Execute the first stage
    await this.executePipelineStage(threadId, pipeline, 0, userMessage);

    return pipeline;
  }

  /**
   * Execute a specific pipeline stage: run the agent, post handoff messages,
   * and handle approval gates.
   */
  private async executePipelineStage(
    threadId: string,
    pipeline: Pipeline,
    stageIndex: number,
    userMessage: string
  ): Promise<void> {
    if (stageIndex >= pipeline.stages.length) {
      // Pipeline complete
      pipeline.status = 'completed';
      pipeline.completedAt = new Date().toISOString();
      useChatStore.getState().addMessage({
        threadId,
        sender: 'system',
        content: 'Pipeline complete. All agents have finished their work.',
        contentType: 'text',
      });
      return;
    }

    const stage = pipeline.stages[stageIndex];
    pipeline.currentStageIndex = stageIndex;
    pipeline.status = 'running';
    pipeline.updatedAt = new Date().toISOString();

    // Post handoff system message
    if (stageIndex > 0) {
      const prevStage = pipeline.stages[stageIndex - 1];
      useChatStore.getState().addMessage({
        threadId,
        sender: 'system',
        content: `${prevStage.role.charAt(0).toUpperCase() + prevStage.role.slice(1)} finished. Handing off to ${stage.role.charAt(0).toUpperCase() + stage.role.slice(1)}.`,
        contentType: 'text',
      });
    } else {
      useChatStore.getState().addMessage({
        threadId,
        sender: 'system',
        content: `Stage ${stageIndex + 1}/${pipeline.stages.length}: ${stage.role.charAt(0).toUpperCase() + stage.role.slice(1)} is starting — ${stage.title}`,
        contentType: 'text',
      });
    }

    // Update agent status in agent store
    useAgentStore.getState().updateAgentStatus(`agent-${stage.role}`, 'working');

    // Execute the agent response for this stage
    try {
      await this.requestAgentResponse(threadId, `pipeline-stage-${stageIndex}`, stage.role);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      pipeline.status = 'failed';
      pipeline.error = errorMsg;
      pipeline.updatedAt = new Date().toISOString();

      useChatStore.getState().addMessage({
        threadId,
        sender: 'system',
        content: `Pipeline failed at stage ${stageIndex + 1} (${stage.role}): ${errorMsg}`,
        contentType: 'text',
      });

      useAgentStore.getState().updateAgentStatus(`agent-${stage.role}`, 'error', errorMsg);
      return;
    }

    // Update agent status back to idle
    useAgentStore.getState().updateAgentStatus(`agent-${stage.role}`, 'idle');

    // Check if this stage requires approval before proceeding
    if (stage.requiresApproval && stageIndex < pipeline.stages.length - 1) {
      pipeline.status = 'awaiting_approval';
      pipeline.updatedAt = new Date().toISOString();

      const nextStage = pipeline.stages[stageIndex + 1];

      // Post an approval request
      const approvalMessageId = this.requestApproval({
        threadId,
        sender: stage.role,
        actionType: 'file_change',
        actionDescription: `Approve ${stage.title} and proceed to ${nextStage.title} (${nextStage.role})?`,
      });

      // Store pipeline context on the approval message for later resolution
      this.activePipelines.set(pipeline.id, {
        ...pipeline,
        // Store additional context needed for continuation
      });

      // Listen for approval response
      const unsubscribe = this.streamHandler.onEvent((event) => {
        if (event.type === 'approval_response' && event.messageId === approvalMessageId) {
          unsubscribe();

          const messages = useChatStore.getState().messages[threadId] || [];
          const approvalMsg = messages.find((m) => m.id === approvalMessageId);
          const approved = approvalMsg?.metadata?.approved === true;

          if (approved) {
            // Continue pipeline
            this.executePipelineStage(threadId, pipeline, stageIndex + 1, userMessage);
          } else {
            // Cancel pipeline
            pipeline.status = 'cancelled';
            pipeline.updatedAt = new Date().toISOString();

            useChatStore.getState().addMessage({
              threadId,
              sender: 'system',
              content: `Pipeline cancelled by user at stage ${stageIndex + 1} (${stage.role}).`,
              contentType: 'text',
            });
          }
        }
      });
    } else {
      // No approval needed, auto-advance
      await this.executePipelineStage(threadId, pipeline, stageIndex + 1, userMessage);
    }
  }

  /**
   * Request a variant response: generates multiple variants for a single prompt.
   * Posts a system message, calls orchestrator.generateVariants(), and posts
   * a variant_set message to the chat thread.
   */
  async requestVariantResponse(
    threadId: string,
    prompt: string,
    options?: { variantCount?: number; diversityMode?: 'same_provider' | 'multi_provider' }
  ): Promise<VariantResult | null> {
    const variantCount = options?.variantCount ?? 3;
    const diversityMode = options?.diversityMode ?? 'same_provider';

    // Post system message: generating variants
    useChatStore.getState().addMessage({
      threadId,
      sender: 'system',
      content: `Generating ${variantCount} variants...`,
      contentType: 'text',
    });

    // Resolve credentials
    const credentials = await this.resolveAICredentials();
    if (!credentials) {
      useChatStore.getState().addMessage({
        threadId,
        sender: 'system',
        content:
          'No AI API key configured. Please add your Anthropic or OpenAI API key in Settings > Credentials.',
        contentType: 'text',
      });
      return null;
    }

    const { provider, apiKey } = credentials;

    let orchestrator: AgentOrchestrator | null = null;
    try {
      orchestrator = await this.ensureOrchestrator(provider, apiKey);
    } catch {
      useChatStore.getState().addMessage({
        threadId,
        sender: 'system',
        content: 'Failed to initialize agent orchestrator for variant generation.',
        contentType: 'text',
      });
      return null;
    }

    if (!orchestrator) return null;

    // Gather available providers for multi_provider mode
    let availableProviders: Array<{ provider: AIProvider; apiKey: string }> | undefined;
    if (diversityMode === 'multi_provider') {
      availableProviders = await this.resolveAllAICredentials();
    }

    try {
      const result = await orchestrator.generateVariants(
        { prompt, variantCount, diversityMode },
        availableProviders
      );

      // Post variant_set message to the chat
      useChatStore.getState().addMessage({
        threadId,
        sender: 'system',
        content: `Generated ${result.variants.length} variants. Select one to continue.`,
        contentType: 'variant_set',
        metadata: {
          requestId: result.requestId,
          variants: result.variants.map((v) => ({
            id: v.id,
            name: v.name,
            description: v.description,
            content: v.content,
            provider: v.provider,
            model: v.model,
            tokensUsed: v.tokensUsed,
          })),
        },
      });

      return result;
    } catch {
      useChatStore.getState().addMessage({
        threadId,
        sender: 'system',
        content: 'Variant generation failed. Please try again.',
        contentType: 'text',
      });
      return null;
    }
  }

  /**
   * Handle variant selection: posts the selected variant as the canonical response.
   */
  selectVariant(threadId: string, messageId: string, variantId: string): void {
    const messages = useChatStore.getState().messages[threadId] || [];
    const variantMsg = messages.find((m) => m.id === messageId);

    if (!variantMsg || variantMsg.contentType !== 'variant_set') return;

    const metadata = variantMsg.metadata as {
      requestId: string;
      variants: Array<{ id: string; name: string; content: string; provider: string }>;
    };

    const variant = metadata.variants.find((v) => v.id === variantId);
    if (!variant) return;

    // Update the variant_set message with the selection
    useChatStore.getState().updateMessageContent(messageId, threadId, variantMsg.content);

    // Post the selected variant as the canonical response
    useChatStore.getState().addMessage({
      threadId,
      sender: 'system',
      content: variant.content,
      contentType: 'text',
      metadata: {
        selectedFromVariant: variantId,
        variantName: variant.name,
        variantProvider: variant.provider,
      },
    });

    // Update the orchestrator if available
    if (this.orchestrator) {
      this.orchestrator.selectVariant(metadata.requestId, variantId);
    }
  }

  /**
   * Resolve ALL available AI credentials (for multi_provider mode)
   */
  private async resolveAllAICredentials(): Promise<
    Array<{ provider: AIProvider; apiKey: string }>
  > {
    const credState = useCredentialStore.getState();
    const metadata = credState.credentials;
    const results: Array<{ provider: AIProvider; apiKey: string }> = [];

    const aiProviders = ['anthropic', 'openai'] as const;

    for (const providerName of aiProviders) {
      const cred = metadata.find((c) => c.provider === providerName && c.status === 'valid');
      if (cred) {
        try {
          const result = await CredentialService.retrieve(providerName);
          if (result.secret) {
            results.push({ provider: providerName, apiKey: result.secret });
          }
        } catch {
          // Key not found, skip
        }
      }
    }

    return results;
  }

  /**
   * Get active pipeline for a thread (if any)
   */
  getActivePipeline(pipelineId: string): Pipeline | undefined {
    return this.activePipelines.get(pipelineId);
  }

  /**
   * Get all active pipelines
   */
  getActivePipelines(): Pipeline[] {
    return Array.from(this.activePipelines.values());
  }
}
