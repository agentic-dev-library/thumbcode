/**
 * useAgentList Hook
 *
 * Manages role-filter state, derives agent metrics, and computes
 * per-agent task stats from @thumbcode/state. Keeps the agents page
 * focused on layout only.
 */

import { useCallback, useMemo, useState } from 'react';
import { type Agent, type AgentTask, selectAgents, useAgentStore } from '@/state';

export interface AgentMetrics {
  completedTasks: number;
  failedTasks: number;
  activeTasks: number;
  successRate: string;
  currentTask: AgentTask | null;
  progress: number;
}

export interface UseAgentListResult {
  selectedRole: string | null;
  setSelectedRole: (role: string | null) => void;
  filteredAgents: Agent[];
  totalAgents: number;
  activeAgents: number;
  totalCompletedTasks: number;
  tasks: AgentTask[];
  getAgentMetrics: (agent: Agent) => AgentMetrics;
}

export function useAgentList(): UseAgentListResult {
  const agents = useAgentStore(selectAgents);
  const tasks = useAgentStore((s) => s.tasks);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const handleSetRole = useCallback((role: string | null) => {
    setSelectedRole(role);
  }, []);

  const filteredAgents = useMemo(
    () => (selectedRole ? agents.filter((a) => a.role === selectedRole) : agents),
    [agents, selectedRole]
  );

  const activeAgents = useMemo(() => agents.filter((a) => a.status !== 'idle').length, [agents]);

  const totalCompletedTasks = useMemo(
    () => tasks.filter((t) => t.status === 'completed').length,
    [tasks]
  );

  const getAgentMetrics = useCallback(
    (agent: Agent): AgentMetrics => {
      const agentTasks = tasks.filter((t) => t.agentId === agent.id);
      const completedTasks = agentTasks.filter((t) => t.status === 'completed').length;
      const failedTasks = agentTasks.filter((t) => t.status === 'failed').length;
      const activeTasks = agentTasks.filter((t) => t.status === 'in_progress').length;
      const successDenom = completedTasks + failedTasks;
      const successRate =
        successDenom > 0 ? `${Math.round((completedTasks / successDenom) * 100)}%` : '\u2014';

      const currentTask = agent.currentTaskId
        ? (tasks.find((t) => t.id === agent.currentTaskId) ?? null)
        : null;
      const total = agentTasks.length;
      const progress = total > 0 ? Math.round((completedTasks / total) * 100) : 0;

      return { completedTasks, failedTasks, activeTasks, successRate, currentTask, progress };
    },
    [tasks]
  );

  return {
    selectedRole,
    setSelectedRole: handleSetRole,
    filteredAgents,
    totalAgents: agents.length,
    activeAgents,
    totalCompletedTasks,
    tasks,
    getAgentMetrics,
  };
}
