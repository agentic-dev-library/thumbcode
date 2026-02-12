/**
 * Base Agent
 *
 * Abstract base class for specialized AI agents.
 * Composes trait modules for agent behavior:
 * - Promptable: task formatting and prompt construction
 * - Reviewable: the agentic execution loop (standard and streaming)
 * - Committable: result parsing from conversation history
 */

import type { Agent, AgentRole, AgentStatus, TaskAssignment } from '@thumbcode/types';
import type { AIClient, Message, StreamEvent, ToolDefinition } from '../ai';
import { parseExecutionResult } from './Committable';
import { formatTaskMessage } from './Promptable';
import { executeTask, executeTaskStream } from './Reviewable';
import type {
  AgentContext,
  AgentEvent,
  AgentEventCallback,
  AgentExecutionResult,
} from './types';

export type { AgentContext, AgentEvent, AgentEventCallback, AgentExecutionResult } from './types';

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
   * Execute a task (delegated to Reviewable)
   */
  async execute(task: TaskAssignment, context: AgentContext): Promise<AgentExecutionResult> {
    return executeTask(
      task,
      context,
      this.getSystemPrompt(context),
      this.getTools(),
      this.aiClient,
      { model: this.model, maxTokens: this.maxTokens, temperature: this.temperature },
      {
        onStatusChange: (status) => this.setStatus(status as AgentStatus),
        onToolUse: (tool, input, output) => {
          if (output !== undefined) {
            this.emitEvent({ type: 'tool_use', data: { tool, toolOutput: output } });
          } else {
            this.emitEvent({ type: 'tool_use', data: { tool, toolInput: input } });
          }
        },
        onThinking: (thought) => this.emitEvent({ type: 'thinking', data: { thought } }),
        onError: (error) => this.emitEvent({ type: 'error', data: { error } }),
        onComplete: (result) => this.emitEvent({ type: 'complete', data: { result } }),
        executeTool: (name, input, ctx) => this.executeTool(name, input, ctx),
      }
    );
  }

  /**
   * Execute with streaming (delegated to Reviewable)
   */
  async executeStream(
    task: TaskAssignment,
    context: AgentContext,
    onStream: (event: StreamEvent) => void
  ): Promise<AgentExecutionResult> {
    return executeTaskStream(
      task,
      context,
      this.getSystemPrompt(context),
      this.getTools(),
      this.aiClient,
      { model: this.model, maxTokens: this.maxTokens, temperature: this.temperature },
      {
        onStatusChange: (status) => this.setStatus(status as AgentStatus),
        onToolUse: (tool, input, output) => {
          if (output !== undefined) {
            this.emitEvent({ type: 'tool_use', data: { tool, toolOutput: output } });
          } else {
            this.emitEvent({ type: 'tool_use', data: { tool, toolInput: input } });
          }
        },
        onThinking: (thought) => this.emitEvent({ type: 'thinking', data: { thought } }),
        onError: (error) => this.emitEvent({ type: 'error', data: { error } }),
        onComplete: (result) => this.emitEvent({ type: 'complete', data: { result } }),
        executeTool: (name, input, ctx) => this.executeTool(name, input, ctx),
      },
      onStream
    );
  }

  /**
   * Format task into a message (delegated to Promptable)
   */
  protected formatTaskMessage(task: TaskAssignment, context: AgentContext): string {
    return formatTaskMessage(task, context);
  }

  /**
   * Parse execution result (delegated to Committable)
   */
  protected parseExecutionResult() {
    return parseExecutionResult(this.conversationHistory);
  }
}
