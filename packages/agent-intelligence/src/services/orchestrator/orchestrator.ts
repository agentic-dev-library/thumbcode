/**
 * Agent Orchestrator
 *
 * Coordinates orchestration modules for multi-agent task management:
 * - AgentCoordinator: agent lifecycle and task execution
 * - TaskAssigner: task creation, assignment, and queries
 * - OrchestrationStateManager: state, metrics, and execution planning
 */

import type { AgentRole, TaskAssignment, TaskStatus } from '@thumbcode/types';
import type { DEFAULT_AGENT_CONFIGS } from '../agents';
import { AgentCoordinator } from './AgentCoordinator';
import { OrchestrationStateManager } from './OrchestrationState';
import { TaskAssigner } from './TaskAssigner';
import type {
  CreateTaskInput,
  OrchestratorConfig,
  OrchestratorEventCallback,
  OrchestratorMetrics,
  OrchestratorState,
  Pipeline,
  PipelineStage,
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

  async createAgent(
    role: AgentRole,
    customConfig?: Partial<(typeof DEFAULT_AGENT_CONFIGS)[AgentRole]>
  ): Promise<string> {
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
    this.taskAssigner.assignTask(taskId, role);
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

  // Pipeline management

  /**
   * Default pipeline stages: Architect -> Implementer -> Reviewer -> Tester.
   * Each transition requires user approval.
   */
  static readonly DEFAULT_PIPELINE_STAGES: PipelineStage[] = [
    {
      role: 'architect',
      taskType: 'feature',
      title: 'Architecture Design',
      description: 'Design system architecture and plan implementation',
      requiresApproval: true,
    },
    {
      role: 'implementer',
      taskType: 'feature',
      title: 'Implementation',
      description: 'Implement the planned architecture',
      requiresApproval: true,
    },
    {
      role: 'reviewer',
      taskType: 'review',
      title: 'Code Review',
      description: 'Review implementation for quality and correctness',
      requiresApproval: true,
    },
    {
      role: 'tester',
      taskType: 'test',
      title: 'Testing',
      description: 'Write and run tests to verify implementation',
      requiresApproval: false,
    },
  ];

  /**
   * Create a multi-agent pipeline.
   * Each stage creates a task with a dependency on the previous stage.
   * Stages with requiresApproval pause the pipeline until approved.
   */
  createPipeline(options: {
    name: string;
    description: string;
    stages?: PipelineStage[];
  }): Pipeline {
    const stages = options.stages ?? AgentOrchestrator.DEFAULT_PIPELINE_STAGES;
    const pipelineId = `pipeline-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const now = new Date().toISOString();

    const taskIds: string[] = [];

    for (let i = 0; i < stages.length; i++) {
      const stage = stages[i];
      const dependsOn = i > 0 ? [taskIds[i - 1]] : [];

      const taskId = this.taskAssigner.createTask({
        title: `[${stage.role}] ${stage.title}`,
        description: `${stage.description}\n\nPipeline: ${options.name}\nStage ${i + 1} of ${stages.length}: ${options.description}`,
        type: stage.taskType,
        priority: 'high',
        acceptanceCriteria: [`${stage.title} completed by ${stage.role}`],
        dependsOn,
        assigneeRole: stage.role,
      });

      taskIds.push(taskId);
    }

    const pipeline: Pipeline = {
      id: pipelineId,
      name: options.name,
      description: options.description,
      stages,
      taskIds,
      currentStageIndex: 0,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    };

    this.stateManager.state.pipelines.set(pipelineId, pipeline);
    this.stateManager.emitEvent({
      type: 'pipeline_created',
      data: { pipeline },
    });

    return pipeline;
  }

  /**
   * Get a pipeline by ID
   */
  getPipeline(pipelineId: string): Pipeline | undefined {
    return this.stateManager.state.pipelines.get(pipelineId);
  }

  /**
   * Get all pipelines
   */
  getPipelines(): Pipeline[] {
    return Array.from(this.stateManager.state.pipelines.values());
  }

  /**
   * Advance a pipeline to the next stage.
   * Called after user approval or when a non-approval stage completes.
   */
  advancePipeline(pipelineId: string): void {
    const pipeline = this.stateManager.state.pipelines.get(pipelineId);
    if (!pipeline || pipeline.status === 'completed' || pipeline.status === 'failed') {
      return;
    }

    const now = new Date().toISOString();
    const currentIndex = pipeline.currentStageIndex;

    // Mark current stage as completed
    this.stateManager.emitEvent({
      type: 'pipeline_stage_completed',
      data: { pipeline, stageIndex: currentIndex },
    });

    const nextIndex = currentIndex + 1;

    if (nextIndex >= pipeline.stages.length) {
      // Pipeline complete
      pipeline.status = 'completed';
      pipeline.completedAt = now;
      pipeline.updatedAt = now;
      this.stateManager.emitEvent({
        type: 'pipeline_completed',
        data: { pipeline },
      });
      return;
    }

    // Move to next stage
    pipeline.currentStageIndex = nextIndex;
    pipeline.updatedAt = now;

    const nextStage = pipeline.stages[nextIndex];

    if (nextStage.requiresApproval) {
      // Pause and wait for approval
      pipeline.status = 'awaiting_approval';
      this.stateManager.emitEvent({
        type: 'pipeline_awaiting_approval',
        data: { pipeline, stageIndex: nextIndex },
      });
    } else {
      // Auto-advance
      pipeline.status = 'running';
      this.stateManager.emitEvent({
        type: 'pipeline_stage_started',
        data: { pipeline, stageIndex: nextIndex },
      });
    }
  }

  /**
   * Approve a pipeline stage, allowing it to proceed.
   */
  approvePipelineStage(pipelineId: string): void {
    const pipeline = this.stateManager.state.pipelines.get(pipelineId);
    if (!pipeline || pipeline.status !== 'awaiting_approval') {
      return;
    }

    pipeline.status = 'running';
    pipeline.updatedAt = new Date().toISOString();

    this.stateManager.emitEvent({
      type: 'pipeline_approval_received',
      data: { pipeline, stageIndex: pipeline.currentStageIndex },
    });

    this.stateManager.emitEvent({
      type: 'pipeline_stage_started',
      data: { pipeline, stageIndex: pipeline.currentStageIndex },
    });
  }

  /**
   * Cancel a pipeline.
   */
  cancelPipeline(pipelineId: string): void {
    const pipeline = this.stateManager.state.pipelines.get(pipelineId);
    if (!pipeline || pipeline.status === 'completed' || pipeline.status === 'failed') {
      return;
    }

    pipeline.status = 'cancelled';
    pipeline.updatedAt = new Date().toISOString();

    this.stateManager.emitEvent({
      type: 'pipeline_cancelled',
      data: { pipeline },
    });
  }

  /**
   * Fail a pipeline with an error.
   */
  failPipeline(pipelineId: string, error: string): void {
    const pipeline = this.stateManager.state.pipelines.get(pipelineId);
    if (!pipeline) return;

    pipeline.status = 'failed';
    pipeline.error = error;
    pipeline.updatedAt = new Date().toISOString();

    this.stateManager.emitEvent({
      type: 'pipeline_failed',
      data: { pipeline, error },
    });
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
      const availableSlots =
        this.config.maxConcurrentAgents - this.stateManager.state.activeTasks.size;
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
