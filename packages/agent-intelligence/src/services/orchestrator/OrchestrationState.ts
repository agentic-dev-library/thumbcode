/**
 * Orchestration State
 *
 * Manages execution state, dependency graph, and execution plan building.
 */

import type { TaskAssignment } from '@thumbcode/types';
import type {
  DependencyNode,
  ExecutionPlan,
  OrchestratorConfig,
  OrchestratorEvent,
  OrchestratorEventCallback,
  OrchestratorMetrics,
  OrchestratorState,
  TaskResult,
} from './types';

export class OrchestrationStateManager {
  readonly state: OrchestratorState;
  private eventCallbacks: OrchestratorEventCallback[] = [];
  private startTime: number;
  readonly taskResults: TaskResult[] = [];
  taskIdCounter = 0;

  constructor(_config: OrchestratorConfig) {
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
  emitEvent(event: Omit<OrchestratorEvent, 'timestamp'>): void {
    const fullEvent: OrchestratorEvent = {
      ...event,
      timestamp: new Date().toISOString(),
    };
    for (const callback of this.eventCallbacks) {
      callback(fullEvent);
    }
  }

  /**
   * Build execution plan based on dependencies
   */
  buildExecutionPlan(): ExecutionPlan {
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
        const task = this.getTask(taskId);
        if (task?.assignee) {
          plan.ready.push(taskId);
        }
      } else {
        // Check for failed dependencies (use getTask to search both taskQueue and completedTasks)
        const failedDeps = pendingDeps.filter((depId) => {
          const task = this.getTask(depId);
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
   * Get snapshot of current state
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
}
