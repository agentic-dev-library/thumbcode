/**
 * Agent System Type Definitions
 */

import type { CredentialType } from './credentials';

export type AgentRole = 'architect' | 'implementer' | 'reviewer' | 'tester';

export type AgentStatus =
  | 'idle'
  | 'thinking'
  | 'coding'
  | 'reviewing'
  | 'waiting_approval'
  | 'error'
  | 'paused';

export interface Agent {
  id: string;
  name: string;
  role: AgentRole;
  status: AgentStatus;
  avatar?: string;
  capabilities: AgentCapability[];
  currentTask?: TaskAssignment;
  metrics: AgentMetrics;
  createdAt: Date;
  lastActiveAt: Date;
}

export interface AgentCapability {
  id: string;
  name: string;
  description: string;
  requiredCredentials: CredentialType[];
}

export interface AgentMetrics {
  tasksCompleted: number;
  linesWritten: number;
  reviewsPerformed: number;
  averageTaskTime: number; // milliseconds
  successRate: number; // 0-1
}

export interface TaskAssignment {
  id: string;
  type: 'feature' | 'bugfix' | 'refactor' | 'docs' | 'review' | 'test';
  title: string;
  description: string;
  assignee: string; // Agent ID
  dependsOn: string[]; // Task IDs
  status: TaskStatus;
  priority: 'low' | 'medium' | 'high' | 'critical';
  acceptanceCriteria: string[];
  references: string[];
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export type TaskStatus =
  | 'pending'
  | 'in_progress'
  | 'blocked'
  | 'needs_review'
  | 'complete'
  | 'cancelled';
