/**
 * Agent Type Definitions
 *
 * Types for the multi-agent system.
 */

import type { CredentialType } from './credentials';

/**
 * Agent roles in the system
 */
export type AgentRole = 'architect' | 'implementer' | 'reviewer' | 'tester';

/**
 * Current agent status
 */
export type AgentStatus =
  | 'idle'
  | 'thinking'
  | 'coding'
  | 'reviewing'
  | 'waiting_approval'
  | 'error'
  | 'paused';

/**
 * Main agent entity
 */
export interface Agent {
  id: string;
  name: string;
  role: AgentRole;
  status: AgentStatus;
  avatar?: string;
  capabilities: AgentCapability[];
  currentTask?: TaskAssignment;
  metrics: AgentMetrics;
  config: AgentConfig;
  createdAt: string;
  lastActiveAt: string;
}

/**
 * Agent capability definition
 */
export interface AgentCapability {
  id: string;
  name: string;
  description: string;
  requiredCredentials: CredentialType[];
  tools?: string[];
}

/**
 * Agent performance metrics
 */
export interface AgentMetrics {
  tasksCompleted: number;
  linesWritten: number;
  reviewsPerformed: number;
  averageTaskTime: number; // milliseconds
  successRate: number; // 0-1
  tokensUsed: number;
}

/**
 * Agent configuration
 */
export interface AgentConfig {
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt?: string;
  tools: string[];
}

/**
 * Task assignment for an agent
 */
export interface TaskAssignment {
  id: string;
  type: TaskType;
  title: string;
  description: string;
  assignee: string; // Agent ID
  dependsOn: string[]; // Task IDs
  status: TaskStatus;
  priority: TaskPriority;
  acceptanceCriteria: string[];
  references: string[];
  output?: TaskOutput;
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  completedAt?: string;
}

/**
 * Task types
 */
export type TaskType = 'feature' | 'bugfix' | 'refactor' | 'docs' | 'review' | 'test';

/**
 * Task status
 */
export type TaskStatus =
  | 'pending'
  | 'in_progress'
  | 'blocked'
  | 'needs_review'
  | 'complete'
  | 'cancelled';

/**
 * Task priority levels
 */
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

/**
 * Output from a completed task
 */
export interface TaskOutput {
  filesCreated: string[];
  filesModified: string[];
  filesDeleted: string[];
  commitSha?: string;
  summary: string;
  artifacts?: TaskArtifact[];
}

/**
 * Artifact produced by a task
 */
export interface TaskArtifact {
  type: 'code' | 'documentation' | 'test' | 'report';
  path: string;
  description: string;
}
