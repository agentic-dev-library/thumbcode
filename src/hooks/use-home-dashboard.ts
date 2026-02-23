/**
 * useHomeDashboard Hook
 *
 * Derives dashboard stats and recent activity from the agent and project
 * stores so that the home page stays a thin composition layer.
 */

import {
  type Agent,
  type AgentTask,
  selectAgents,
  selectProjects,
  useAgentStore,
  useProjectStore,
} from '@thumbcode/state';
import { useMemo } from 'react';

export interface ActivityItem {
  id: string;
  type: 'commit' | 'review' | 'task';
  agent: string;
  message: string;
  project: string;
  time: string;
}

export interface HomeDashboardStats {
  projectCount: number;
  runningAgents: number;
  pendingTasks: number;
  completedToday: number;
  progressPercent: number;
}

export interface UseHomeDashboardResult {
  stats: HomeDashboardStats;
  agents: Agent[];
  recentActivity: ActivityItem[];
}

function statusToActivityType(status: string): ActivityItem['type'] {
  switch (status) {
    case 'completed':
      return 'commit';
    case 'failed':
      return 'review';
    default:
      return 'task';
  }
}

function buildRecentActivity(tasks: AgentTask[], agents: Agent[], limit = 5): ActivityItem[] {
  return tasks
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit)
    .map((t) => {
      const agent = agents.find((a) => a.id === t.agentId);
      return {
        id: t.id,
        type: statusToActivityType(t.status),
        agent: agent?.name || 'Agent',
        message: t.description,
        project: 'workspace',
        time: new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
    });
}

export function useHomeDashboard(): UseHomeDashboardResult {
  const projects = useProjectStore(selectProjects);
  const agents = useAgentStore(selectAgents);
  const tasks = useAgentStore((s) => s.tasks);

  const stats = useMemo<HomeDashboardStats>(() => {
    const runningAgents = agents.filter((a) => a.status !== 'idle').length;
    const pendingTasks = tasks.filter(
      (t) => t.status === 'pending' || t.status === 'in_progress'
    ).length;
    const completedToday = tasks.filter((t) => {
      if (t.status !== 'completed' || !t.completedAt) return false;
      const d = new Date(t.completedAt);
      const now = new Date();
      return d.toDateString() === now.toDateString();
    }).length;
    const total = completedToday + pendingTasks;
    const progressPercent = total > 0 ? (completedToday / total) * 100 : 0;

    return {
      projectCount: projects.length,
      runningAgents,
      pendingTasks,
      completedToday,
      progressPercent,
    };
  }, [projects, agents, tasks]);

  const recentActivity = useMemo(() => buildRecentActivity(tasks, agents), [tasks, agents]);

  return { stats, agents, recentActivity };
}
