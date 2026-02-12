/**
 * Agent Orchestrator
 *
 * Manages multi-agent coordination, task assignment, and execution.
 */

import type { AgentRole, TaskAssignment, TaskStatus } from '@thumbcode/types';
import { createAIClient, getDefaultModel, type AIClient } from '../ai';
import {
  createAgent,
  DEFAULT_AGENT_CONFIGS,
  type AgentContext,
  type AgentEvent,
  type BaseAgent,
} from '../agents';
import type {
  CreateTaskInput,
  DependencyNode,
  ExecutionPlan,
  OrchestratorConfig,
  OrchestratorEvent,
  OrchestratorEventCallback,
  OrchestratorMetrics,
  OrchestratorState,
  TaskResult,
} from './types';

/**
 * Multi-agent orchestrator
 */
export class AgentOrchestrator {
  private readonly config: OrchestratorConfig;
  private state: OrchestratorState;
  private readonly aiClient: AIClient;
  private readonly agentInstances: Map<string, BaseAgent> = new Map();
  private eventCallbacks: OrchestratorEventCallback[] = [];
  private taskIdCounter = 0;
  private readonly startTime: number;
  private readonly taskResults: TaskResult[] = [];

  constructor(config: OrchestratorConfig, apiKey: string) {
    this.config = config;
    this.aiClient = createAIClient(config.provider, apiKey);
    this.startTime = Date.now();

    this.state = {
      status: 'idle',
      agents: new Map(),
      taskQueue: [],
      activeTasks: new Map(),
      completedTasks: [],
    };
  }

  /**
   * Subscribe to orchestrator events
   */
  onEvent(callback: OrchestratorEventCallback): () => void {
    this.eventCallbacks.push(callback);
    return () => {
      this.eventCallbacks = this.eventCallbacks.filter((cb) => cb !== callback);
    };
  }

  /**
   * Emit an orchestrator event
   */
  private emitEvent(event: Omit<OrchestratorEvent, 'timestamp'>): void {
    const fullEvent: OrchestratorEvent = {
      ...event,
      timestamp: new Date().toISOString(),
    };
    for (const callback of this.eventCallbacks) {
      callback(fullEvent);
    }
  }

  /**
   * Initialize the orchestrator with default agents
   */
  async initialize(): Promise<void> {
    const roles: AgentRole[] = ['architect', 'implementer', 'reviewer', 'tester'];

    for (const role of roles) {
      await this.createAgent(role);
    }

    this.emitEvent({ type: 'status_change', data: { status: 'idle' } });
  }

  /**
   * Create an agent
   */
  async createAgent(role: AgentRole, customConfig?: Partial<typeof DEFAULT_AGENT_CONFIGS[AgentRole]>): Promise<string> {
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
      this.emitEvent({ type: 'agent_event', data: { agentEvent: event } });
    });

    const agentInfo = agent.getInfo();
    this.state.agents.set(agentId, agentInfo);
    this.agentInstances.set(agentId, agent);

    this.emitEvent({ type: 'agent_created', data: { agent: agentInfo } });

    return agentId;
  }

  /**
   * Remove an agent
   */
  async removeAgent(agentId: string): Promise<void> {
    const agent = this.state.agents.get(agentId);
    if (!agent) return;

    // Check if agent has active tasks
    for (const [taskId, activeAgentId] of this.state.activeTasks) {
      if (activeAgentId === agentId) {
        throw new Error(`Cannot remove agent ${agentId} with active task ${taskId}`);
      }
    }

    this.state.agents.delete(agentId);
    this.agentInstances.delete(agentId);

    this.emitEvent({ type: 'agent_removed', data: { agent } });
  }

  /**
   * Create a new task
   */
  createTask(input: CreateTaskInput): string {
    const taskId = `task-${++this.taskIdCounter}-${Date.now()}`;

    const task: TaskAssignment = {
      id: taskId,
      type: input.type,
      title: input.title,
      description: input.description,
      assignee: '', // Will be assigned later
      dependsOn: input.dependsOn || [],
      status: 'pending',
      priority: input.priority || 'medium',
      acceptanceCriteria: input.acceptanceCriteria,
      references: input.references || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.state.taskQueue.push(task);
    this.emitEvent({ type: 'task_created', data: { task } });

    // Auto-assign if enabled
    if (this.config.autoAssign && input.assigneeRole) {
      this.assignTask(taskId, input.assigneeRole);
    }

    return taskId;
  }

  /**
   * Assign a task to an agent role
   */
  assignTask(taskId: string, role: AgentRole): void {
    const task = this.state.taskQueue.find((t) => t.id === taskId);
    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }

    // Find an idle agent with the specified role
    const availableAgent = Array.from(this.state.agents.values()).find(
      (a) => a.role === role && a.status === 'idle'
    );

    if (!availableAgent) {
      throw new Error(`No idle agent available with role ${role}`);
    }

    task.assignee = availableAgent.id;
    task.updatedAt = new Date().toISOString();

    this.emitEvent({ type: 'task_assigned', data: { task } });
  }

  /**
   * Start executing tasks
   */
  async start(): Promise<void> {
    if (this.state.status === 'running') return;

    this.state.status = 'running';
    this.emitEvent({ type: 'status_change', data: { status: 'running' } });

    await this.processTaskQueue();
  }

  /**
   * Pause execution
   */
  pause(): void {
    this.state.status = 'paused';
    this.emitEvent({ type: 'status_change', data: { status: 'paused' } });
  }

  /**
   * Resume execution
   */
  async resume(): Promise<void> {
    if (this.state.status !== 'paused') return;

    this.state.status = 'running';
    this.emitEvent({ type: 'status_change', data: { status: 'running' } });

    await this.processTaskQueue();
  }

  /**
   * Stop execution
   */
  stop(): void {
    this.state.status = 'idle';
    this.emitEvent({ type: 'status_change', data: { status: 'idle' } });
  }

  /**
   * Process the task queue
   */
  private async processTaskQueue(): Promise<void> {
    while (this.state.status === 'running') {
      const plan = this.buildExecutionPlan();

      if (plan.ready.length === 0 && this.state.activeTasks.size === 0) {
        // No more tasks to process
        this.state.status = 'idle';
        this.emitEvent({ type: 'status_change', data: { status: 'idle' } });
        break;
      }

      // Start ready tasks up to concurrency limit
      const availableSlots = this.config.maxConcurrentAgents - this.state.activeTasks.size;
      const tasksToStart = plan.ready.slice(0, availableSlots);

      if (this.config.enableParallelExecution && tasksToStart.length > 1) {
        // Execute in parallel
        await Promise.all(tasksToStart.map((taskId) => this.executeTask(taskId)));
      } else if (tasksToStart.length > 0) {
        // Execute sequentially
        await this.executeTask(tasksToStart[0]);
      } else {
        // Wait for active tasks to complete
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  }

  /**
   * Build execution plan based on dependencies
   */
  private buildExecutionPlan(): ExecutionPlan {
    const plan: ExecutionPlan = {
      ready: [],
      waiting: new Map(),
      completed: this.state.completedTasks.map((t) => t.id),
      blocked: [],
    };

    const nodes = this.buildDependencyGraph();

    for (const [taskId, node] of nodes) {
      if (node.status === 'complete') continue;

      // Check if task is already active
      if (this.state.activeTasks.has(taskId)) continue;

      // Check dependencies
      const pendingDeps = node.dependsOn.filter((depId) => {
        const depNode = nodes.get(depId);
        return depNode && depNode.status !== 'complete';
      });

      if (pendingDeps.length === 0) {
        // Check if task has an assignee
        const task = this.state.taskQueue.find((t) => t.id === taskId);
        if (task?.assignee) {
          plan.ready.push(taskId);
        }
      } else {
        // Check for failed dependencies
        const failedDeps = pendingDeps.filter((depId) => {
          const task = this.state.taskQueue.find((t) => t.id === depId);
          return task?.status === 'cancelled';
        });

        if (failedDeps.length > 0) {
          plan.blocked.push(taskId);
        } else {
          plan.waiting.set(taskId, pendingDeps);
        }
      }
    }

    return plan;
  }

  /**
   * Build dependency graph from tasks
   */
  private buildDependencyGraph(): Map<string, DependencyNode> {
    const nodes = new Map<string, DependencyNode>();

    for (const task of [...this.state.taskQueue, ...this.state.completedTasks]) {
      nodes.set(task.id, {
        taskId: task.id,
        dependsOn: task.dependsOn,
        dependents: [],
        status: task.status,
      });
    }

    // Build reverse dependencies
    for (const [taskId, node] of nodes) {
      for (const depId of node.dependsOn) {
        const depNode = nodes.get(depId);
        if (depNode) {
          depNode.dependents.push(taskId);
        }
      }
    }

    return nodes;
  }

  /**
   * Execute a single task
   */
  private async executeTask(taskId: string): Promise<void> {
    const task = this.state.taskQueue.find((t) => t.id === taskId);
    if (!task || !task.assignee) return;

    const agent = this.agentInstances.get(task.assignee);
    if (!agent) return;

    // Update task status
    task.status = 'in_progress';
    task.startedAt = new Date().toISOString();
    task.updatedAt = new Date().toISOString();
    this.state.activeTasks.set(taskId, task.assignee);

    // Update agent status
    const agentInfo = this.state.agents.get(task.assignee);
    if (agentInfo) {
      agentInfo.status = 'thinking';
      agentInfo.currentTask = task;
    }

    this.emitEvent({ type: 'task_started', data: { task } });

    const startTime = Date.now();

    try {
      const result = await agent.execute(task, this.config.projectContext);

      const taskResult: TaskResult = {
        taskId,
        agentId: task.assignee,
        success: result.success,
        result,
        startedAt: task.startedAt!,
        completedAt: new Date().toISOString(),
        duration: Date.now() - startTime,
      };

      this.taskResults.push(taskResult);

      // Update task
      task.status = result.success ? 'complete' : 'cancelled';
      task.completedAt = taskResult.completedAt;
      task.updatedAt = taskResult.completedAt;
      task.output = result.output;

      // Move to completed
      this.state.taskQueue = this.state.taskQueue.filter((t) => t.id !== taskId);
      this.state.completedTasks.push(task);
      this.state.activeTasks.delete(taskId);

      // Update agent
      if (agentInfo) {
        agentInfo.status = 'idle';
        agentInfo.currentTask = undefined;
        agentInfo.metrics.tasksCompleted++;
        agentInfo.metrics.tokensUsed += result.tokensUsed;
      }

      this.emitEvent({
        type: result.success ? 'task_completed' : 'task_failed',
        data: { task, result: taskResult },
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      task.status = 'cancelled';
      task.updatedAt = new Date().toISOString();
      this.state.activeTasks.delete(taskId);

      if (agentInfo) {
        agentInfo.status = 'error';
        agentInfo.currentTask = undefined;
      }

      this.emitEvent({
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
            startedAt: task.startedAt!,
            completedAt: new Date().toISOString(),
            duration: Date.now() - startTime,
          },
        },
      });
    }
  }

  /**
   * Get current state
   */
  getState(): OrchestratorState {
    return { ...this.state };
  }

  /**
   * Get metrics
   */
  getMetrics(): OrchestratorMetrics {
    const completedResults = this.taskResults.filter((r) => r.success);
    const failedResults = this.taskResults.filter((r) => !r.success);

    const totalDuration = completedResults.reduce((sum, r) => sum + r.duration, 0);
    const totalTokens = this.taskResults.reduce((sum, r) => sum + r.result.tokensUsed, 0);

    const agentMetrics = Array.from(this.state.agents.values()).map((agent) => ({
      agentId: agent.id,
      role: agent.role,
      tasksCompleted: agent.metrics.tasksCompleted,
      totalTokensUsed: agent.metrics.tokensUsed,
      averageTaskDuration: agent.metrics.averageTaskTime,
      successRate: agent.metrics.successRate,
      status: agent.status,
    }));

    return {
      totalTasksCreated: this.taskIdCounter,
      totalTasksCompleted: completedResults.length,
      totalTasksFailed: failedResults.length,
      totalTokensUsed: totalTokens,
      averageTaskDuration: completedResults.length > 0 ? totalDuration / completedResults.length : 0,
      agentMetrics,
      uptime: Date.now() - this.startTime,
    };
  }

  /**
   * Get task by ID
   */
  getTask(taskId: string): TaskAssignment | undefined {
    return (
      this.state.taskQueue.find((t) => t.id === taskId) ||
      this.state.completedTasks.find((t) => t.id === taskId)
    );
  }

  /**
   * Get all tasks
   */
  getTasks(): TaskAssignment[] {
    return [...this.state.taskQueue, ...this.state.completedTasks];
  }

  /**
   * Get tasks by status
   */
  getTasksByStatus(status: TaskStatus): TaskAssignment[] {
    return this.getTasks().filter((t) => t.status === status);
  }
}
