/**
 * Orchestrator Types
 *
 * Types for the multi-agent orchestration system.
 */

import type {
  Agent,
  AgentRole,
  AgentStatus,
  TaskAssignment,
  TaskPriority,
  TaskStatus,
  TaskType,
} from '@thumbcode/types';
import type { AIProvider } from '../ai';
import type { AgentContext, AgentEvent, AgentExecutionResult } from '../agents/base-agent';

/**
 * Orchestrator configuration
 */
export interface OrchestratorConfig {
  /** AI provider to use */
  provider: AIProvider;
  /** Model to use (provider-specific) */
  model?: string;
  /** Maximum concurrent agents */
  maxConcurrentAgents: number;
  /** Enable auto-assignment of tasks */
  autoAssign: boolean;
  /** Enable parallel execution when possible */
  enableParallelExecution: boolean;
  /** Project context */
  projectContext: AgentContext;
}

/**
 * Orchestrator state
 */
export interface OrchestratorState {
  /** Current status */
  status: 'idle' | 'running' | 'paused' | 'error';
  /** Active agents */
  agents: Map<string, Agent>;
  /** Task queue */
  taskQueue: TaskAssignment[];
  /** Currently executing tasks */
  activeTasks: Map<string, string>; // taskId -> agentId
  /** Completed tasks */
  completedTasks: TaskAssignment[];
  /** Error message if status is error */
  error?: string;
}

/**
 * Task creation input
 */
export interface CreateTaskInput {
  title: string;
  description: string;
  type: TaskType;
  priority?: TaskPriority;
  acceptanceCriteria: string[];
  references?: string[];
  dependsOn?: string[];
  assigneeRole?: AgentRole;
}

/**
 * Task result
 */
export interface TaskResult {
  taskId: string;
  agentId: string;
  success: boolean;
  result: AgentExecutionResult;
  startedAt: string;
  completedAt: string;
  duration: number; // milliseconds
}

/**
 * Orchestrator events
 */
export interface OrchestratorEvent {
  type:
    | 'status_change'
    | 'agent_created'
    | 'agent_removed'
    | 'task_created'
    | 'task_assigned'
    | 'task_started'
    | 'task_completed'
    | 'task_failed'
    | 'agent_event'
    | 'error';
  timestamp: string;
  data?: {
    status?: OrchestratorState['status'];
    agent?: Agent;
    task?: TaskAssignment;
    result?: TaskResult;
    agentEvent?: AgentEvent;
    error?: string;
  };
}

/**
 * Event callback
 */
export type OrchestratorEventCallback = (event: OrchestratorEvent) => void;

/**
 * Task dependency graph node
 */
export interface DependencyNode {
  taskId: string;
  dependsOn: string[];
  dependents: string[];
  status: TaskStatus;
}

/**
 * Execution plan
 */
export interface ExecutionPlan {
  /** Tasks that can start immediately (no dependencies) */
  ready: string[];
  /** Tasks waiting on dependencies */
  waiting: Map<string, string[]>; // taskId -> [dependencyIds]
  /** Completed tasks */
  completed: string[];
  /** Blocked tasks (circular dependencies or failed dependencies) */
  blocked: string[];
}

/**
 * Agent metrics summary
 */
export interface AgentMetricsSummary {
  agentId: string;
  role: AgentRole;
  tasksCompleted: number;
  totalTokensUsed: number;
  averageTaskDuration: number;
  successRate: number;
  status: AgentStatus;
}

/**
 * Orchestrator metrics
 */
export interface OrchestratorMetrics {
  totalTasksCreated: number;
  totalTasksCompleted: number;
  totalTasksFailed: number;
  totalTokensUsed: number;
  averageTaskDuration: number;
  agentMetrics: AgentMetricsSummary[];
  uptime: number;
}
