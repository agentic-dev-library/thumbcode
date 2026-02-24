/**
 * useAgentDetail Hook
 *
 * Derives agent metrics, current task, and actions from the agent store
 * so that the AgentDetail page stays a thin composition layer.
 */

import type { Agent, AgentRole, AgentStatus, AgentTask } from '@/state';
import { useAgentStore } from '@/state';
import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';

export type StatusVariant = 'success' | 'pending' | 'error' | 'inactive';

export interface AgentDetailMetrics {
  completed: number;
  failed: number;
  successRate: number | null;
  progress: number;
}

export interface UseAgentDetailResult {
  agent: Agent | undefined;
  tasks: AgentTask[];
  currentTask: AgentTask | null;
  metrics: AgentDetailMetrics;
  statusVariant: StatusVariant;
  setIdle: () => void;
  setWorking: () => void;
}

export const ROLE_DESCRIPTION: Record<AgentRole, string> = {
  architect:
    'Designs system architecture, creates task breakdowns, and coordinates agent workflows.',
  implementer:
    'Writes code, implements features, and resolves technical issues based on architectural plans.',
  reviewer:
    'Reviews code quality, identifies bugs, ensures best practices, and provides detailed feedback.',
  tester:
    'Creates and runs tests, validates functionality, and ensures high-quality releases with good coverage.',
};

export function getStatusVariant(status: AgentStatus): StatusVariant {
  switch (status) {
    case 'working':
    case 'needs_review':
    case 'complete':
      return 'success';
    case 'awaiting_approval':
    case 'blocked':
      return 'pending';
    case 'error':
      return 'error';
    default:
      return 'inactive';
  }
}

export function getStatusBadgeClasses(variant: StatusVariant): string {
  switch (variant) {
    case 'success':
      return 'bg-teal-500/20 text-teal-400';
    case 'pending':
      return 'bg-gold-400/20 text-gold-400';
    case 'error':
      return 'bg-coral-500/20 text-coral-500';
    case 'inactive':
      return 'bg-neutral-700/50 text-neutral-400';
  }
}

export function getRoleColor(role: AgentRole): string {
  switch (role) {
    case 'architect':
      return 'bg-gold-400/20';
    case 'implementer':
      return 'bg-teal-500/20';
    case 'reviewer':
      return 'bg-coral-500/20';
    case 'tester':
      return 'bg-teal-500/20';
  }
}

function computeMetrics(tasks: AgentTask[]): AgentDetailMetrics {
  const completed = tasks.filter((t) => t.status === 'completed').length;
  const failed = tasks.filter((t) => t.status === 'failed').length;
  const denom = completed + failed;
  const successRate = denom > 0 ? Math.round((completed / denom) * 100) : null;
  const progress = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;
  return { completed, failed, successRate, progress };
}

export function useAgentDetail(agentId: string | undefined): UseAgentDetailResult {
  const agent = useAgentStore((s) => s.agents.find((a) => a.id === agentId));
  const tasks = useAgentStore(useShallow((s) => s.tasks.filter((t) => t.agentId === agentId)));
  const updateAgentStatus = useAgentStore((s) => s.updateAgentStatus);

  const currentTask = useMemo(() => {
    if (!agent?.currentTaskId) return null;
    return tasks.find((t) => t.id === agent.currentTaskId) ?? null;
  }, [agent?.currentTaskId, tasks]);

  const metrics = useMemo(() => computeMetrics(tasks), [tasks]);

  const statusVariant = agent ? getStatusVariant(agent.status) : 'inactive';

  const setIdle = () => {
    if (agent) updateAgentStatus(agent.id, 'idle');
  };

  const setWorking = () => {
    if (agent) updateAgentStatus(agent.id, 'working');
  };

  return { agent, tasks, currentTask, metrics, statusVariant, setIdle, setWorking };
}
