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
import type { McpClient } from '../mcp/McpClient';
import {
  type BridgedMcpTool,
  convertAllMcpTools,
  executeMcpTool,
  isMcpTool,
} from '../mcp/McpToolBridge';
import type { AgentSkill, SkillToolDefinition } from '../skills/types';
import type { ToolExecutionBridge } from '../tools/ToolExecutionBridge';
import { parseExecutionResult } from './Committable';
import { formatTaskMessage } from './Promptable';
import { executeTask, executeTaskStream } from './Reviewable';
import type { AgentContext, AgentEvent, AgentEventCallback, AgentExecutionResult } from './types';

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
  protected skills: AgentSkill[] = [];
  protected mcpClient?: McpClient;
  protected toolBridge?: ToolExecutionBridge;
  private mcpBridgedTools: BridgedMcpTool[] = [];
  protected eventCallbacks: AgentEventCallback[] = [];
  protected conversationHistory: Message[] = [];

  constructor(config: {
    id: string;
    role: AgentRole;
    name: string;
    aiClient: AIClient;
    model?: string;
    maxTokens?: number;
    temperature?: number;
    mcpClient?: McpClient;
    toolBridge?: ToolExecutionBridge;
  }) {
    this.id = config.id;
    this.role = config.role;
    this.name = config.name;
    this.status = 'idle';
    this.aiClient = config.aiClient;
    this.model = config.model || 'claude-3-5-sonnet-20241022';
    this.maxTokens = config.maxTokens || 4096;
    this.temperature = config.temperature || 0.7;
    this.mcpClient = config.mcpClient;
    this.toolBridge = config.toolBridge;
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
        tools: this.getToolsWithSkills().map((t) => t.name),
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
   * Add a skill to this agent
   */
  addSkill(skill: AgentSkill): void {
    this.skills.push(skill);
  }

  /**
   * Get all attached skills
   */
  getSkills(): AgentSkill[] {
    return [...this.skills];
  }

  /**
   * Build system prompt with skill extensions appended
   */
  protected getSystemPromptWithSkills(context: AgentContext): string {
    const basePrompt = this.getSystemPrompt(context);
    if (this.skills.length === 0) {
      return basePrompt;
    }

    const skillExtensions = this.skills
      .map((skill) => skill.getSystemPromptExtension())
      .filter((ext) => ext.length > 0);

    if (skillExtensions.length === 0) {
      return basePrompt;
    }

    return `${basePrompt}\n\n${skillExtensions.join('\n\n')}`;
  }

  /**
   * Convert a SkillToolDefinition to a ToolDefinition
   */
  private skillToolToToolDefinition(skillTool: SkillToolDefinition): ToolDefinition {
    const properties: Record<string, { type: string; description: string }> = {};
    const required: string[] = [];

    for (const [paramName, param] of Object.entries(skillTool.parameters)) {
      properties[paramName] = {
        type: param.type,
        description: param.description,
      };
      if (param.required) {
        required.push(paramName);
      }
    }

    return {
      name: skillTool.name,
      description: skillTool.description,
      input_schema: {
        type: 'object',
        properties,
        required: required.length > 0 ? required : undefined,
      },
    };
  }

  /**
   * Get all tools including skill-provided and MCP tools
   */
  protected getToolsWithSkills(): ToolDefinition[] {
    const baseTools = this.getTools();

    const skillTools = this.skills.flatMap((skill) =>
      skill.getTools().map((st) => this.skillToolToToolDefinition(st))
    );

    // Refresh MCP bridged tools from client
    if (this.mcpClient?.hasConnections()) {
      this.mcpBridgedTools = convertAllMcpTools(this.mcpClient);
    } else {
      this.mcpBridgedTools = [];
    }
    const mcpTools = this.mcpBridgedTools.map((b) => b.definition);

    return [...baseTools, ...skillTools, ...mcpTools];
  }

  /**
   * Execute a tool, routing to MCP, skills, tool bridge, or the agent fallback.
   *
   * Priority order:
   * 1. MCP tools (external tool servers)
   * 2. Skill tools (attached skill modules)
   * 3. ToolExecutionBridge (file I/O, diffs, search, documents)
   * 4. Agent-specific tools (role-specific logic like create_spec, approve_changes)
   */
  protected async executeToolWithSkills(
    name: string,
    input: Record<string, unknown>,
    context: AgentContext
  ): Promise<string> {
    // 1. Check if this is an MCP tool
    if (this.mcpClient && isMcpTool(this.mcpBridgedTools, name)) {
      return executeMcpTool(this.mcpClient, this.mcpBridgedTools, name, input);
    }

    // 2. Check if any skill owns this tool
    for (const skill of this.skills) {
      const skillToolNames = skill.getTools().map((t) => t.name);
      if (skillToolNames.includes(name)) {
        const result = await skill.executeTool(name, input);
        return result.output;
      }
    }

    // 3. Try the ToolExecutionBridge for file/workspace operations
    if (this.toolBridge) {
      const result = await this.toolBridge.execute(name, input, context.workspaceDir);
      // Bridge returns "Unknown tool: X" for tools it doesn't handle
      if (!result.error?.startsWith('Unknown tool:')) {
        return result.success ? result.output : `Error: ${result.error ?? 'Tool execution failed'}`;
      }
    }

    // 4. Fall back to the agent's own tool execution
    return this.executeTool(name, input, context);
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
      this.getSystemPromptWithSkills(context),
      this.getToolsWithSkills(),
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
        executeTool: (name, input, ctx) => this.executeToolWithSkills(name, input, ctx),
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
      this.getSystemPromptWithSkills(context),
      this.getToolsWithSkills(),
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
        executeTool: (name, input, ctx) => this.executeToolWithSkills(name, input, ctx),
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
