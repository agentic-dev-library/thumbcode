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
import type { AgentContext, AgentEvent, AgentExecutionResult } from '../agents/base-agent';
import type { AIProvider } from '../ai';

/**
 * Variant generation request
 */
export interface VariantRequest {
  /** The user's prompt to generate variants for */
  prompt: string;
  /** Number of variants to generate (default 3) */
  variantCount: number;
  /** Whether to use the same provider or distribute across multiple providers */
  diversityMode: 'same_provider' | 'multi_provider';
  /** Optional: which agent type to use (or auto-detect) */
  agentType?: string;
}

/**
 * A single generated variant
 */
export interface Variant {
  /** Unique variant identifier */
  id: string;
  /** Human-readable name (e.g. "Approach A: Minimal") */
  name: string;
  /** 1-2 sentence summary of this variant's approach */
  description: string;
  /** Full response content */
  content: string;
  /** Which AI provider generated this */
  provider: string;
  /** Which model was used */
  model: string;
  /** Tokens consumed */
  tokensUsed: number;
  /** Estimated cost in cents */
  estimatedCost?: number;
  /** ISO timestamp of generation */
  generatedAt: string;
}

/**
 * Result of variant generation
 */
export interface VariantResult {
  /** Unique request identifier */
  requestId: string;
  /** Generated variants */
  variants: Variant[];
  /** ID of the variant the user selected */
  selectedVariantId?: string;
}

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
  /** Active pipelines */
  pipelines: Map<string, Pipeline>;
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
    | 'error'
    | PipelineEventType;
  timestamp: string;
  data?: {
    status?: OrchestratorState['status'];
    agent?: Agent;
    task?: TaskAssignment;
    result?: TaskResult;
    agentEvent?: AgentEvent;
    error?: string;
    pipeline?: Pipeline;
    stageIndex?: number;
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
 * Pipeline stage definition
 */
export interface PipelineStage {
  role: AgentRole;
  taskType: TaskType;
  title: string;
  description: string;
  requiresApproval: boolean;
}

/**
 * Pipeline status
 */
export type PipelineStatus =
  | 'pending'
  | 'running'
  | 'awaiting_approval'
  | 'completed'
  | 'failed'
  | 'cancelled';

/**
 * Pipeline definition for multi-agent orchestration
 */
export interface Pipeline {
  id: string;
  name: string;
  description: string;
  stages: PipelineStage[];
  taskIds: string[];
  currentStageIndex: number;
  status: PipelineStatus;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  error?: string;
}

/**
 * Pipeline event types
 */
export type PipelineEventType =
  | 'pipeline_created'
  | 'pipeline_stage_started'
  | 'pipeline_stage_completed'
  | 'pipeline_awaiting_approval'
  | 'pipeline_approval_received'
  | 'pipeline_completed'
  | 'pipeline_failed'
  | 'pipeline_cancelled';

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
