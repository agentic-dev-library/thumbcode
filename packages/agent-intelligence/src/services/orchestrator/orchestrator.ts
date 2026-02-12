/**
 * Agent Orchestrator - Unified Facade
 *
 * Thin facade that delegates to focused orchestration modules:
 * - AgentCoordinator: agent lifecycle and task execution
 * - TaskAssigner: task creation, assignment, and queries
 * - OrchestrationStateManager: state, metrics, and execution planning
 */

import type { AgentRole, TaskAssignment, TaskStatus } from '@thumbcode/types';
import { DEFAULT_AGENT_CONFIGS } from '../agents';
import { AgentCoordinator } from './AgentCoordinator';
import { OrchestrationStateManager } from './OrchestrationState';
import { TaskAssigner } from './TaskAssigner';
import type {
  CreateTaskInput,
  OrchestratorConfig,
  OrchestratorEventCallback,
  OrchestratorMetrics,
  OrchestratorState,
} from './types';

export class AgentOrchestrator {
  private readonly stateManager: OrchestrationStateManager;
  private readonly coordinator: AgentCoordinator;
  private readonly taskAssigner: TaskAssigner;
  private readonly config: OrchestratorConfig;

  constructor(config: OrchestratorConfig, apiKey: string) {
    this.config = config;
    this.stateManager = new OrchestrationStateManager(config);
    this.coordinator = new AgentCoordinator(config, this.stateManager, apiKey);
    this.taskAssigner = new TaskAssigner(this.stateManager, config.autoAssign);
  }

  // Event management (delegated to OrchestrationStateManager)
  onEvent(callback: OrchestratorEventCallback): () => void {
    return this.stateManager.onEvent(callback);
  }

  // Agent lifecycle (delegated to AgentCoordinator)
  async initialize(): Promise<void> {
    return this.coordinator.initialize();
  }

  async createAgent(role: AgentRole, customConfig?: Partial<typeof DEFAULT_AGENT_CONFIGS[AgentRole]>): Promise<string> {
    return this.coordinator.createAgent(role, customConfig);
  }

  async removeAgent(agentId: string): Promise<void> {
    return this.coordinator.removeAgent(agentId);
  }

  // Task management (delegated to TaskAssigner)
  createTask(input: CreateTaskInput): string {
    return this.taskAssigner.createTask(input);
  }

  assignTask(taskId: string, role: AgentRole): void {
    return this.taskAssigner.assignTask(taskId, role);
  }

  getTask(taskId: string): TaskAssignment | undefined {
    return this.taskAssigner.getTask(taskId);
  }

  getTasks(): TaskAssignment[] {
    return this.taskAssigner.getTasks();
  }

  getTasksByStatus(status: TaskStatus): TaskAssignment[] {
    return this.taskAssigner.getTasksByStatus(status);
  }

  // Execution control
  async start(): Promise<void> {
    if (this.stateManager.state.status === 'running') return;

    this.stateManager.state.status = 'running';
    this.stateManager.emitEvent({ type: 'status_change', data: { status: 'running' } });

    await this.processTaskQueue();
  }

  pause(): void {
    this.stateManager.state.status = 'paused';
    this.stateManager.emitEvent({ type: 'status_change', data: { status: 'paused' } });
  }

  async resume(): Promise<void> {
    if (this.stateManager.state.status !== 'paused') return;

    this.stateManager.state.status = 'running';
    this.stateManager.emitEvent({ type: 'status_change', data: { status: 'running' } });

    await this.processTaskQueue();
  }

  stop(): void {
    this.stateManager.state.status = 'idle';
    this.stateManager.emitEvent({ type: 'status_change', data: { status: 'idle' } });
  }

  // State & metrics (delegated to OrchestrationStateManager)
  getState(): OrchestratorState {
    return this.stateManager.getState();
  }

  getMetrics(): OrchestratorMetrics {
    return this.stateManager.getMetrics();
  }

  /**
   * Process the task queue
   */
  private async processTaskQueue(): Promise<void> {
    while (this.stateManager.state.status === 'running') {
      const plan = this.stateManager.buildExecutionPlan();

      if (plan.ready.length === 0 && this.stateManager.state.activeTasks.size === 0) {
        // No more tasks to process
        this.stateManager.state.status = 'idle';
        this.stateManager.emitEvent({ type: 'status_change', data: { status: 'idle' } });
        break;
      }

      // Start ready tasks up to concurrency limit
      const availableSlots = this.config.maxConcurrentAgents - this.stateManager.state.activeTasks.size;
      const tasksToStart = plan.ready.slice(0, availableSlots);

      if (this.config.enableParallelExecution && tasksToStart.length > 1) {
        // Execute in parallel
        await Promise.all(tasksToStart.map((taskId) => this.coordinator.executeTask(taskId)));
      } else if (tasksToStart.length > 0) {
        // Execute sequentially
        await this.coordinator.executeTask(tasksToStart[0]);
      } else {
        // Wait for active tasks to complete
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  }
}
