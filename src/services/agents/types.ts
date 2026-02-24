/**
 * Agent Types
 *
 * Shared type definitions for agent modules.
 */

import type { AgentStatus, TaskOutput } from '@/types';
import type { Message } from '../ai';

/**
 * Agent execution context
 */
export interface AgentContext {
  projectId: string;
  workspaceDir: string;
  currentBranch: string;
  availableFiles: string[];
}

/**
 * Agent execution result
 */
export interface AgentExecutionResult {
  success: boolean;
  output: TaskOutput;
  messages: Message[];
  tokensUsed: number;
  error?: string;
}

/**
 * Event emitter callback for agent events
 */
export type AgentEventCallback = (event: AgentEvent) => void;

/**
 * Agent events
 */
export interface AgentEvent {
  type: 'status_change' | 'thinking' | 'tool_use' | 'progress' | 'error' | 'complete';
  agentId: string;
  timestamp: string;
  data?: {
    status?: AgentStatus;
    thought?: string;
    tool?: string;
    toolInput?: Record<string, unknown>;
    toolOutput?: string;
    progress?: number;
    error?: string;
    result?: AgentExecutionResult;
  };
}
