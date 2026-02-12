/**
 * Task Assigner
 *
 * Handles task creation, assignment, and query operations.
 */

import type { AgentRole, TaskAssignment, TaskStatus } from '@thumbcode/types';
import type { OrchestrationStateManager } from './OrchestrationState';
import type { CreateTaskInput } from './types';

export class TaskAssigner {
  constructor(
    private stateManager: OrchestrationStateManager,
    private autoAssign: boolean
  ) {}

  /**
   * Create a new task
   */
  createTask(input: CreateTaskInput): string {
    const taskId = `task-${++this.stateManager.taskIdCounter}-${Date.now()}`;

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

    this.stateManager.state.taskQueue.push(task);
    this.stateManager.emitEvent({ type: 'task_created', data: { task } });

    // Auto-assign if enabled
    if (this.autoAssign && input.assigneeRole) {
      this.assignTask(taskId, input.assigneeRole);
    }

    return taskId;
  }

  /**
   * Assign a task to an agent role
   */
  assignTask(taskId: string, role: AgentRole): void {
    const task = this.stateManager.state.taskQueue.find((t) => t.id === taskId);
    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }

    // Find an idle agent with the specified role
    const availableAgent = Array.from(this.stateManager.state.agents.values()).find(
      (a) => a.role === role && a.status === 'idle'
    );

    if (!availableAgent) {
      throw new Error(`No idle agent available with role ${role}`);
    }

    task.assignee = availableAgent.id;
    task.updatedAt = new Date().toISOString();

    this.stateManager.emitEvent({ type: 'task_assigned', data: { task } });
  }

  /**
   * Get task by ID
   */
  getTask(taskId: string): TaskAssignment | undefined {
    return this.stateManager.getTask(taskId);
  }

  /**
   * Get all tasks
   */
  getTasks(): TaskAssignment[] {
    return this.stateManager.getTasks();
  }

  /**
   * Get tasks by status
   */
  getTasksByStatus(status: TaskStatus): TaskAssignment[] {
    return this.stateManager.getTasks().filter((t) => t.status === status);
  }
}
