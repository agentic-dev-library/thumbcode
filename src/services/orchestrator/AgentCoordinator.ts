/**
 * Agent Coordinator
 *
 * Manages agent lifecycle, execution, and coordination.
 */

import type { AgentRole } from '@/types';
import { type AgentEvent, type BaseAgent, createAgent, DEFAULT_AGENT_CONFIGS } from '../agents';
import { type AIClient, createAIClient, getDefaultModel } from '../ai';
import type { OrchestrationStateManager } from './OrchestrationState';
import type { OrchestratorConfig, TaskResult } from './types';

export class AgentCoordinator {
  private aiClient: AIClient;
  private agentInstances: Map<string, BaseAgent> = new Map();

  constructor(
    private config: OrchestratorConfig,
    private stateManager: OrchestrationStateManager,
    apiKey: string
  ) {
    this.aiClient = createAIClient(config.provider, apiKey);
  }

  /**
   * Initialize with default agents
   */
  async initialize(): Promise<void> {
    const roles: AgentRole[] = ['architect', 'implementer', 'reviewer', 'tester'];

    for (const role of roles) {
      await this.createAgent(role);
    }

    this.stateManager.emitEvent({ type: 'status_change', data: { status: 'idle' } });
  }

  /**
   * Create an agent
   */
  async createAgent(
    role: AgentRole,
    customConfig?: Partial<(typeof DEFAULT_AGENT_CONFIGS)[AgentRole]>
  ): Promise<string> {
    const defaultConfig = DEFAULT_AGENT_CONFIGS[role];
    const agentId = `${role}-${Date.now()}`;

    const agent = createAgent(role, {
      id: agentId,
      name: customConfig?.name || defaultConfig.name,
      aiClient: this.aiClient,
      model: this.config.model || getDefaultModel(this.config.provider),
      maxTokens: customConfig?.maxTokens || defaultConfig.maxTokens,
      temperature: customConfig?.temperature || defaultConfig.temperature,
    });

    // Subscribe to agent events
    agent.onEvent((event: AgentEvent) => {
      this.stateManager.emitEvent({ type: 'agent_event', data: { agentEvent: event } });
    });

    const agentInfo = agent.getInfo();
    this.stateManager.state.agents.set(agentId, agentInfo);
    this.agentInstances.set(agentId, agent);

    this.stateManager.emitEvent({ type: 'agent_created', data: { agent: agentInfo } });

    return agentId;
  }

  /**
   * Remove an agent
   */
  async removeAgent(agentId: string): Promise<void> {
    const agent = this.stateManager.state.agents.get(agentId);
    if (!agent) return;

    // Check if agent has active tasks
    for (const [taskId, activeAgentId] of this.stateManager.state.activeTasks) {
      if (activeAgentId === agentId) {
        throw new Error(`Cannot remove agent ${agentId} with active task ${taskId}`);
      }
    }

    this.stateManager.state.agents.delete(agentId);
    this.agentInstances.delete(agentId);

    this.stateManager.emitEvent({ type: 'agent_removed', data: { agent } });
  }

  /**
   * Execute a single task
   */
  async executeTask(taskId: string): Promise<void> {
    const task = this.stateManager.state.taskQueue.find((t) => t.id === taskId);
    if (!task || !task.assignee) return;

    const agent = this.agentInstances.get(task.assignee);
    if (!agent) return;

    // Update task status
    task.status = 'in_progress';
    task.startedAt = new Date().toISOString();
    task.updatedAt = new Date().toISOString();
    this.stateManager.state.activeTasks.set(taskId, task.assignee);

    // Update agent status
    const agentInfo = this.stateManager.state.agents.get(task.assignee);
    if (agentInfo) {
      agentInfo.status = 'thinking';
      agentInfo.currentTask = task;
    }

    this.stateManager.emitEvent({ type: 'task_started', data: { task } });

    const startTime = Date.now();

    try {
      const result = await agent.execute(task, this.config.projectContext);

      const taskResult: TaskResult = {
        taskId,
        agentId: task.assignee,
        success: result.success,
        result,
        startedAt: task.startedAt ?? new Date().toISOString(),
        completedAt: new Date().toISOString(),
        duration: Date.now() - startTime,
      };

      this.stateManager.taskResults.push(taskResult);

      // Update task
      task.status = result.success ? 'complete' : 'cancelled';
      task.completedAt = taskResult.completedAt;
      task.updatedAt = taskResult.completedAt;
      task.output = result.output;

      // Move to completed
      this.stateManager.state.taskQueue = this.stateManager.state.taskQueue.filter(
        (t) => t.id !== taskId
      );
      this.stateManager.state.completedTasks.push(task);
      this.stateManager.state.activeTasks.delete(taskId);

      // Update agent
      if (agentInfo) {
        agentInfo.status = 'idle';
        agentInfo.currentTask = undefined;
        agentInfo.metrics.tasksCompleted++;
        agentInfo.metrics.tokensUsed += result.tokensUsed;
      }

      this.stateManager.emitEvent({
        type: result.success ? 'task_completed' : 'task_failed',
        data: { task, result: taskResult },
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      task.status = 'cancelled';
      task.updatedAt = new Date().toISOString();
      this.stateManager.state.activeTasks.delete(taskId);

      if (agentInfo) {
        agentInfo.status = 'error';
        agentInfo.currentTask = undefined;
      }

      this.stateManager.emitEvent({
        type: 'task_failed',
        data: {
          task,
          result: {
            taskId,
            agentId: task.assignee,
            success: false,
            result: {
              success: false,
              output: {
                filesCreated: [],
                filesModified: [],
                filesDeleted: [],
                summary: errorMessage,
              },
              messages: [],
              tokensUsed: 0,
              error: errorMessage,
            },
            startedAt: task.startedAt ?? new Date().toISOString(),
            completedAt: new Date().toISOString(),
            duration: Date.now() - startTime,
          },
        },
      });
    }
  }
}
