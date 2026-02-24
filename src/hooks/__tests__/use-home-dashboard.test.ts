/**
 * useHomeDashboard Hook Tests
 */

import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useHomeDashboard } from '../use-home-dashboard';

const mockAgents = [
  { id: 'agent-1', name: 'Architect', role: 'architect', status: 'idle' },
  { id: 'agent-2', name: 'Implementer', role: 'implementer', status: 'working' },
];

const now = new Date();
const mockTasks = [
  {
    id: 'task-1',
    agentId: 'agent-2',
    description: 'Implement feature',
    status: 'completed',
    createdAt: now.toISOString(),
    completedAt: now.toISOString(),
  },
  {
    id: 'task-2',
    agentId: 'agent-1',
    description: 'Design architecture',
    status: 'pending',
    createdAt: new Date(now.getTime() - 60000).toISOString(),
  },
  {
    id: 'task-3',
    agentId: 'agent-2',
    description: 'Fix bug',
    status: 'in_progress',
    createdAt: new Date(now.getTime() - 120000).toISOString(),
  },
];

const mockProjects = [
  { id: 'p1', name: 'Project 1' },
  { id: 'p2', name: 'Project 2' },
];

vi.mock('@/state', () => ({
  useProjectStore: (selector: (state: Record<string, unknown>) => unknown) => {
    const state = { projects: mockProjects };
    return selector(state);
  },
  selectProjects: (state: { projects: unknown }) => state.projects,
  useAgentStore: (selector: (state: Record<string, unknown>) => unknown) => {
    const state = { agents: mockAgents, tasks: mockTasks };
    return selector(state);
  },
  selectAgents: (state: { agents: unknown }) => state.agents,
}));

describe('useHomeDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns correct project count', () => {
    const { result } = renderHook(() => useHomeDashboard());
    expect(result.current.stats.projectCount).toBe(2);
  });

  it('counts running agents (non-idle)', () => {
    const { result } = renderHook(() => useHomeDashboard());
    expect(result.current.stats.runningAgents).toBe(1);
  });

  it('counts pending and in-progress tasks', () => {
    const { result } = renderHook(() => useHomeDashboard());
    expect(result.current.stats.pendingTasks).toBe(2);
  });

  it('counts tasks completed today', () => {
    const { result } = renderHook(() => useHomeDashboard());
    expect(result.current.stats.completedToday).toBe(1);
  });

  it('calculates progress percent', () => {
    const { result } = renderHook(() => useHomeDashboard());
    // 1 completed today, 2 pending → 1/3 ≈ 33.33%
    expect(result.current.stats.progressPercent).toBeCloseTo(33.33, 0);
  });

  it('returns agents list', () => {
    const { result } = renderHook(() => useHomeDashboard());
    expect(result.current.agents).toHaveLength(2);
    expect(result.current.agents[0].name).toBe('Architect');
  });

  it('builds recent activity sorted by newest first', () => {
    const { result } = renderHook(() => useHomeDashboard());
    expect(result.current.recentActivity).toHaveLength(3);
    // Most recent task should be first
    expect(result.current.recentActivity[0].id).toBe('task-1');
    expect(result.current.recentActivity[0].type).toBe('commit'); // completed → commit
  });

  it('maps activity types correctly', () => {
    const { result } = renderHook(() => useHomeDashboard());
    const types = result.current.recentActivity.map((a) => a.type);
    expect(types).toEqual(['commit', 'task', 'task']); // completed, pending, in_progress
  });

  it('resolves agent names for activity items', () => {
    const { result } = renderHook(() => useHomeDashboard());
    expect(result.current.recentActivity[0].agent).toBe('Implementer');
    expect(result.current.recentActivity[1].agent).toBe('Architect');
  });
});
