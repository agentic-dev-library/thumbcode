/**
 * useAgentList Hook Tests
 */

import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Agent } from '@/state';
import { useAgentList } from '../use-agent-list';

const mockAgents: Agent[] = [
  {
    id: 'agent-1',
    name: 'Architect',
    role: 'architect',
    status: 'idle',
    config: { provider: 'anthropic', model: 'claude-sonnet-4-20250514' },
  },
  {
    id: 'agent-2',
    name: 'Implementer',
    role: 'implementer',
    status: 'working',
    currentTaskId: 'task-1',
    config: { provider: 'anthropic', model: 'claude-sonnet-4-20250514' },
  },
  {
    id: 'agent-3',
    name: 'Reviewer',
    role: 'reviewer',
    status: 'idle',
    config: { provider: 'anthropic', model: 'claude-sonnet-4-20250514' },
  },
  {
    id: 'agent-4',
    name: 'Tester',
    role: 'tester',
    status: 'error',
    config: { provider: 'anthropic', model: 'claude-sonnet-4-20250514' },
  },
];

const mockTasks = [
  {
    id: 'task-1',
    agentId: 'agent-2',
    description: 'Implement feature',
    status: 'in_progress',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'task-2',
    agentId: 'agent-2',
    description: 'Fix bug',
    status: 'completed',
    createdAt: '2026-01-01T00:00:00Z',
    completedAt: '2026-01-02T00:00:00Z',
  },
  {
    id: 'task-3',
    agentId: 'agent-2',
    description: 'Another fix',
    status: 'failed',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'task-4',
    agentId: 'agent-1',
    description: 'Design system',
    status: 'completed',
    createdAt: '2026-01-01T00:00:00Z',
    completedAt: '2026-01-02T00:00:00Z',
  },
];

vi.mock('@/state', () => ({
  useAgentStore: (selector: (state: Record<string, unknown>) => unknown) => {
    const state = { agents: mockAgents, tasks: mockTasks };
    return selector(state);
  },
  selectAgents: (state: { agents: unknown }) => state.agents,
}));

describe('useAgentList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns all agents when no role filter', () => {
    const { result } = renderHook(() => useAgentList());
    expect(result.current.filteredAgents).toHaveLength(4);
    expect(result.current.selectedRole).toBeNull();
  });

  it('filters agents by role', () => {
    const { result } = renderHook(() => useAgentList());

    act(() => {
      result.current.setSelectedRole('implementer');
    });

    expect(result.current.filteredAgents).toHaveLength(1);
    expect(result.current.filteredAgents[0].name).toBe('Implementer');
  });

  it('clears role filter when set to null', () => {
    const { result } = renderHook(() => useAgentList());

    act(() => {
      result.current.setSelectedRole('architect');
    });
    expect(result.current.filteredAgents).toHaveLength(1);

    act(() => {
      result.current.setSelectedRole(null);
    });
    expect(result.current.filteredAgents).toHaveLength(4);
  });

  it('counts active (non-idle) agents', () => {
    const { result } = renderHook(() => useAgentList());
    // agent-2 is working, agent-4 is error → 2 active
    expect(result.current.activeAgents).toBe(2);
  });

  it('counts total completed tasks', () => {
    const { result } = renderHook(() => useAgentList());
    expect(result.current.totalCompletedTasks).toBe(2);
  });

  it('reports total agent count', () => {
    const { result } = renderHook(() => useAgentList());
    expect(result.current.totalAgents).toBe(4);
  });

  describe('getAgentMetrics', () => {
    it('computes metrics for an agent with tasks', () => {
      const { result } = renderHook(() => useAgentList());
      const metrics = result.current.getAgentMetrics(mockAgents[1]); // Implementer

      expect(metrics.completedTasks).toBe(1);
      expect(metrics.failedTasks).toBe(1);
      expect(metrics.activeTasks).toBe(1);
      expect(metrics.successRate).toBe('50%');
      expect(metrics.currentTask).not.toBeNull();
      expect(metrics.currentTask?.id).toBe('task-1');
      expect(metrics.progress).toBe(33); // 1 completed / 3 total
    });

    it('returns dash for success rate when no completed or failed tasks', () => {
      const { result } = renderHook(() => useAgentList());
      const metrics = result.current.getAgentMetrics(mockAgents[2]); // Reviewer

      expect(metrics.completedTasks).toBe(0);
      expect(metrics.successRate).toBe('\u2014');
      expect(metrics.currentTask).toBeNull();
      expect(metrics.progress).toBe(0);
    });
  });
});
