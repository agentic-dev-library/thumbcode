/**
 * Base Agent
 *
 * Abstract base class for specialized AI agents.
 */

import type { Agent, AgentRole, AgentStatus, TaskAssignment, TaskOutput } from '@thumbcode/types';
import type { AIClient, CompletionOptions, Message, StreamEvent, ToolDefinition } from '../ai';

/**
 * Agent execution context
 */
export interface AgentContext {
  projectId: string;
  workspaceDir: string;
  currentBranch: string;
  availableFiles: string[];
}

/**
 * Agent execution result
 */
export interface AgentExecutionResult {
  success: boolean;
  output: TaskOutput;
  messages: Message[];
  tokensUsed: number;
  error?: string;
}

/**
 * Event emitter callback for agent events
 */
export type AgentEventCallback = (event: AgentEvent) => void;

/**
 * Agent events
 */
export interface AgentEvent {
  type: 'status_change' | 'thinking' | 'tool_use' | 'progress' | 'error' | 'complete';
  agentId: string;
  timestamp: string;
  data?: {
    status?: AgentStatus;
    thought?: string;
    tool?: string;
    toolInput?: Record<string, unknown>;
    toolOutput?: string;
    progress?: number;
    error?: string;
    result?: AgentExecutionResult;
  };
}

/**
 * Base agent abstract class
 */
export abstract class BaseAgent {
  protected id: string;
  protected role: AgentRole;
  protected name: string;
  protected status: AgentStatus;
  protected aiClient: AIClient;
  protected model: string;
  protected maxTokens: number;
  protected temperature: number;
  protected eventCallbacks: AgentEventCallback[] = [];
  protected conversationHistory: Message[] = [];

  constructor(
    config: {
      id: string;
      role: AgentRole;
      name: string;
      aiClient: AIClient;
      model?: string;
      maxTokens?: number;
      temperature?: number;
    }
  ) {
    this.id = config.id;
    this.role = config.role;
    this.name = config.name;
    this.status = 'idle';
    this.aiClient = config.aiClient;
    this.model = config.model || 'claude-3-5-sonnet-20241022';
    this.maxTokens = config.maxTokens || 4096;
    this.temperature = config.temperature || 0.7;
  }

  /**
   * Get agent info as Agent type
   */
  getInfo(): Agent {
    return {
      id: this.id,
      name: this.name,
      role: this.role,
      status: this.status,
      capabilities: this.getCapabilities(),
      metrics: {
        tasksCompleted: 0,
        linesWritten: 0,
        reviewsPerformed: 0,
        averageTaskTime: 0,
        successRate: 0,
        tokensUsed: 0,
      },
      config: {
        model: this.model,
        temperature: this.temperature,
        maxTokens: this.maxTokens,
        tools: this.getTools().map((t) => t.name),
      },
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
    };
  }

  /**
   * Subscribe to agent events
   */
  onEvent(callback: AgentEventCallback): () => void {
    this.eventCallbacks.push(callback);
    return () => {
      this.eventCallbacks = this.eventCallbacks.filter((cb) => cb !== callback);
    };
  }

  /**
   * Emit an agent event
   */
  protected emitEvent(event: Omit<AgentEvent, 'agentId' | 'timestamp'>): void {
    const fullEvent: AgentEvent = {
      ...event,
      agentId: this.id,
      timestamp: new Date().toISOString(),
    };
    for (const callback of this.eventCallbacks) {
      callback(fullEvent);
    }
  }

  /**
   * Update agent status
   */
  protected setStatus(status: AgentStatus): void {
    this.status = status;
    this.emitEvent({ type: 'status_change', data: { status } });
  }

  /**
   * Get the system prompt for this agent
   */
  protected abstract getSystemPrompt(context: AgentContext): string;

  /**
   * Get the capabilities this agent has
   */
  protected abstract getCapabilities(): Agent['capabilities'];

  /**
   * Get the tools this agent can use
   */
  protected abstract getTools(): ToolDefinition[];

  /**
   * Execute a tool call
   */
  protected abstract executeTool(
    name: string,
    input: Record<string, unknown>,
    context: AgentContext
  ): Promise<string>;

  /**
   * Execute a task
   */
  async execute(task: TaskAssignment, context: AgentContext): Promise<AgentExecutionResult> {
    this.setStatus('thinking');
    this.conversationHistory = [];

    const systemPrompt = this.getSystemPrompt(context);
    const tools = this.getTools();
    let totalTokens = 0;

    // Initial user message with task
    const userMessage: Message = {
      role: 'user',
      content: this.formatTaskMessage(task, context),
    };
    this.conversationHistory.push(userMessage);

    try {
      let continueExecution = true;
      let iterations = 0;
      const maxIterations = 10;

      while (continueExecution && iterations < maxIterations) {
        iterations++;

        const options: CompletionOptions = {
          model: this.model,
          maxTokens: this.maxTokens,
          temperature: this.temperature,
          systemPrompt,
          tools: tools.length > 0 ? tools : undefined,
        };

        const response = await this.aiClient.complete(this.conversationHistory, options);
        totalTokens += response.usage.totalTokens;

        // Process response
        const assistantMessage: Message = {
          role: 'assistant',
          content: response.content,
        };
        this.conversationHistory.push(assistantMessage);

        // Check for tool use
        const toolUseBlocks = response.content.filter((b) => b.type === 'tool_use');

        if (response.stopReason === 'tool_use' && toolUseBlocks.length > 0) {
          this.setStatus('coding');

          // Execute all tool calls
          const toolResults = await Promise.all(
            toolUseBlocks.map(async (block) => {
              this.emitEvent({
                type: 'tool_use',
                data: {
                  tool: block.name,
                  toolInput: block.input,
                },
              });

              const output = await this.executeTool(block.name || '', block.input || {}, context);

              this.emitEvent({
                type: 'tool_use',
                data: {
                  tool: block.name,
                  toolOutput: output,
                },
              });

              return {
                type: 'tool_result' as const,
                tool_use_id: block.id,
                content: output,
              };
            })
          );

          // Add tool results to history
          const toolResultMessage: Message = {
            role: 'user',
            content: toolResults,
          };
          this.conversationHistory.push(toolResultMessage);
        } else {
          // No more tool use, we're done
          continueExecution = false;
        }

        // Check for thinking content
        const textBlocks = response.content.filter((b) => b.type === 'text');
        for (const block of textBlocks) {
          if (block.text) {
            this.emitEvent({ type: 'thinking', data: { thought: block.text } });
          }
        }
      }

      this.setStatus('idle');

      const result = this.parseExecutionResult();

      this.emitEvent({ type: 'complete', data: { result } });

      return {
        success: true,
        output: result,
        messages: this.conversationHistory,
        tokensUsed: totalTokens,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.setStatus('error');
      this.emitEvent({ type: 'error', data: { error: errorMessage } });

      return {
        success: false,
        output: {
          filesCreated: [],
          filesModified: [],
          filesDeleted: [],
          summary: `Error: ${errorMessage}`,
        },
        messages: this.conversationHistory,
        tokensUsed: totalTokens,
        error: errorMessage,
      };
    }
  }

  /**
   * Execute with streaming
   */
  async executeStream(
    task: TaskAssignment,
    context: AgentContext,
    onStream: (event: StreamEvent) => void
  ): Promise<AgentExecutionResult> {
    this.setStatus('thinking');
    this.conversationHistory = [];

    const systemPrompt = this.getSystemPrompt(context);
    const tools = this.getTools();
    let totalTokens = 0;

    const userMessage: Message = {
      role: 'user',
      content: this.formatTaskMessage(task, context),
    };
    this.conversationHistory.push(userMessage);

    try {
      let continueExecution = true;
      let iterations = 0;
      const maxIterations = 10;

      while (continueExecution && iterations < maxIterations) {
        iterations++;

        const options: CompletionOptions = {
          model: this.model,
          maxTokens: this.maxTokens,
          temperature: this.temperature,
          systemPrompt,
          tools: tools.length > 0 ? tools : undefined,
          stream: true,
        };

        const response = await this.aiClient.completeStream(
          this.conversationHistory,
          options,
          onStream
        );
        totalTokens += response.usage.totalTokens;

        const assistantMessage: Message = {
          role: 'assistant',
          content: response.content,
        };
        this.conversationHistory.push(assistantMessage);

        const toolUseBlocks = response.content.filter((b) => b.type === 'tool_use');

        if (response.stopReason === 'tool_use' && toolUseBlocks.length > 0) {
          this.setStatus('coding');

          const toolResults = await Promise.all(
            toolUseBlocks.map(async (block) => {
              const output = await this.executeTool(block.name || '', block.input || {}, context);
              return {
                type: 'tool_result' as const,
                tool_use_id: block.id,
                content: output,
              };
            })
          );

          const toolResultMessage: Message = {
            role: 'user',
            content: toolResults,
          };
          this.conversationHistory.push(toolResultMessage);
        } else {
          continueExecution = false;
        }
      }

      this.setStatus('idle');
      const result = this.parseExecutionResult();

      return {
        success: true,
        output: result,
        messages: this.conversationHistory,
        tokensUsed: totalTokens,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.setStatus('error');

      return {
        success: false,
        output: {
          filesCreated: [],
          filesModified: [],
          filesDeleted: [],
          summary: `Error: ${errorMessage}`,
        },
        messages: this.conversationHistory,
        tokensUsed: totalTokens,
        error: errorMessage,
      };
    }
  }

  /**
   * Format the task into a message
   */
  protected formatTaskMessage(task: TaskAssignment, context: AgentContext): string {
    return `
# Task: ${task.title}

## Description
${task.description}

## Acceptance Criteria
${task.acceptanceCriteria.map((c) => `- ${c}`).join('\n')}

## Context
- Project: ${context.projectId}
- Branch: ${context.currentBranch}
- Workspace: ${context.workspaceDir}

## Available Files
${context.availableFiles.slice(0, 50).join('\n')}
${context.availableFiles.length > 50 ? `\n... and ${context.availableFiles.length - 50} more files` : ''}

## References
${task.references.length > 0 ? task.references.join('\n') : 'None'}

Please complete this task step by step.
`.trim();
  }

  /**
   * Parse the execution result from conversation history
   */
  protected parseExecutionResult(): TaskOutput {
    const filesCreated: string[] = [];
    const filesModified: string[] = [];
    const filesDeleted: string[] = [];

    // Look through tool results for file operations
    for (const message of this.conversationHistory) {
      if (Array.isArray(message.content)) {
        for (const block of message.content) {
          if (block.type === 'tool_result' && block.content) {
            // Parse file operations from tool results
            if (block.content.includes('Created file:')) {
              const match = block.content.match(/Created file: (.+)/);
              if (match) filesCreated.push(match[1]);
            }
            if (block.content.includes('Modified file:')) {
              const match = block.content.match(/Modified file: (.+)/);
              if (match) filesModified.push(match[1]);
            }
            if (block.content.includes('Deleted file:')) {
              const match = block.content.match(/Deleted file: (.+)/);
              if (match) filesDeleted.push(match[1]);
            }
          }
        }
      }
    }

    // Get final summary from last assistant message
    let summary = 'Task completed';
    const lastAssistantMessage = [...this.conversationHistory]
      .reverse()
      .find((m) => m.role === 'assistant');
    if (lastAssistantMessage && typeof lastAssistantMessage.content === 'string') {
      summary = lastAssistantMessage.content.slice(0, 500);
    } else if (lastAssistantMessage && Array.isArray(lastAssistantMessage.content)) {
      const textBlock = lastAssistantMessage.content.find((b) => b.type === 'text');
      if (textBlock?.text) {
        summary = textBlock.text.slice(0, 500);
      }
    }

    return {
      filesCreated,
      filesModified,
      filesDeleted,
      summary,
    };
  }
}
