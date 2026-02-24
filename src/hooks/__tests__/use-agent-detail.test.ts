/**
 * useAgentDetail Hook Tests
 */

import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getRoleColor,
  getStatusBadgeClasses,
  getStatusVariant,
  ROLE_DESCRIPTION,
  useAgentDetail,
} from '../use-agent-detail';

const mockUpdateAgentStatus = vi.fn();

const mockAgents = [
  {
    id: 'agent-1',
    name: 'Architect',
    role: 'architect',
    status: 'idle',
    config: { provider: 'anthropic', model: 'claude-3', maxTokens: 4096 },
  },
  {
    id: 'agent-2',
    name: 'Implementer',
    role: 'implementer',
    status: 'working',
    currentTaskId: 'task-1',
    config: { provider: 'anthropic', model: 'claude-3', maxTokens: 4096 },
  },
];

const now = new Date();
const mockTasks = [
  {
    id: 'task-1',
    agentId: 'agent-2',
    description: 'Implement feature',
    status: 'in_progress',
    createdAt: now.toISOString(),
  },
  {
    id: 'task-2',
    agentId: 'agent-2',
    description: 'Fix bug',
    status: 'completed',
    createdAt: new Date(now.getTime() - 60000).toISOString(),
    completedAt: now.toISOString(),
  },
  {
    id: 'task-3',
    agentId: 'agent-2',
    description: 'Refactor module',
    status: 'failed',
    createdAt: new Date(now.getTime() - 120000).toISOString(),
  },
  {
    id: 'task-4',
    agentId: 'agent-1',
    description: 'Design architecture',
    status: 'pending',
    createdAt: new Date(now.getTime() - 180000).toISOString(),
  },
];

vi.mock('@/state', () => ({
  toast: { success: vi.fn(), error: vi.fn(), warning: vi.fn(), info: vi.fn() },
  useAgentStore: (selector: (state: Record<string, unknown>) => unknown) => {
    const state = {
      agents: mockAgents,
      tasks: mockTasks,
      updateAgentStatus: mockUpdateAgentStatus,
    };
    return selector(state);
  },
}));

describe('useAgentDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns agent by id', () => {
    const { result } = renderHook(() => useAgentDetail('agent-1'));
    expect(result.current.agent).toBeDefined();
    expect(result.current.agent?.name).toBe('Architect');
  });

  it('returns undefined agent for unknown id', () => {
    const { result } = renderHook(() => useAgentDetail('unknown'));
    expect(result.current.agent).toBeUndefined();
  });

  it('returns undefined agent when id is undefined', () => {
    const { result } = renderHook(() => useAgentDetail(undefined));
    expect(result.current.agent).toBeUndefined();
  });

  it('filters tasks for the given agent', () => {
    const { result } = renderHook(() => useAgentDetail('agent-2'));
    expect(result.current.tasks).toHaveLength(3);
    expect(result.current.tasks.every((t) => t.agentId === 'agent-2')).toBe(true);
  });

  it('resolves currentTask from agent.currentTaskId', () => {
    const { result } = renderHook(() => useAgentDetail('agent-2'));
    expect(result.current.currentTask).not.toBeNull();
    expect(result.current.currentTask?.id).toBe('task-1');
  });

  it('returns null currentTask when agent has no currentTaskId', () => {
    const { result } = renderHook(() => useAgentDetail('agent-1'));
    expect(result.current.currentTask).toBeNull();
  });

  it('computes correct metrics', () => {
    const { result } = renderHook(() => useAgentDetail('agent-2'));
    expect(result.current.metrics.completed).toBe(1);
    expect(result.current.metrics.failed).toBe(1);
    expect(result.current.metrics.successRate).toBe(50);
    // 1 completed out of 3 tasks = 33%
    expect(result.current.metrics.progress).toBe(33);
  });

  it('returns null successRate when no completed or failed tasks', () => {
    const { result } = renderHook(() => useAgentDetail('agent-1'));
    // agent-1 has 1 pending task, 0 completed, 0 failed
    expect(result.current.metrics.successRate).toBeNull();
  });

  it('returns correct statusVariant', () => {
    const { result } = renderHook(() => useAgentDetail('agent-2'));
    expect(result.current.statusVariant).toBe('success'); // working → success
  });

  it('returns inactive statusVariant for unknown agent', () => {
    const { result } = renderHook(() => useAgentDetail('unknown'));
    expect(result.current.statusVariant).toBe('inactive');
  });

  it('setIdle calls updateAgentStatus with idle', () => {
    const { result } = renderHook(() => useAgentDetail('agent-2'));
    act(() => {
      result.current.setIdle();
    });
    expect(mockUpdateAgentStatus).toHaveBeenCalledWith('agent-2', 'idle');
  });

  it('setWorking calls updateAgentStatus with working', () => {
    const { result } = renderHook(() => useAgentDetail('agent-2'));
    act(() => {
      result.current.setWorking();
    });
    expect(mockUpdateAgentStatus).toHaveBeenCalledWith('agent-2', 'working');
  });

  it('setIdle does nothing when agent is undefined', () => {
    const { result } = renderHook(() => useAgentDetail('unknown'));
    act(() => {
      result.current.setIdle();
    });
    expect(mockUpdateAgentStatus).not.toHaveBeenCalled();
  });
});

describe('getStatusVariant', () => {
  it('maps working to success', () => {
    expect(getStatusVariant('working')).toBe('success');
  });

  it('maps needs_review to success', () => {
    expect(getStatusVariant('needs_review')).toBe('success');
  });

  it('maps complete to success', () => {
    expect(getStatusVariant('complete')).toBe('success');
  });

  it('maps awaiting_approval to pending', () => {
    expect(getStatusVariant('awaiting_approval')).toBe('pending');
  });

  it('maps blocked to pending', () => {
    expect(getStatusVariant('blocked')).toBe('pending');
  });

  it('maps error to error', () => {
    expect(getStatusVariant('error')).toBe('error');
  });

  it('maps idle to inactive', () => {
    expect(getStatusVariant('idle')).toBe('inactive');
  });
});

describe('getStatusBadgeClasses', () => {
  it('returns teal classes for success', () => {
    expect(getStatusBadgeClasses('success')).toContain('teal');
  });

  it('returns gold classes for pending', () => {
    expect(getStatusBadgeClasses('pending')).toContain('gold');
  });

  it('returns coral classes for error', () => {
    expect(getStatusBadgeClasses('error')).toContain('coral');
  });

  it('returns neutral classes for inactive', () => {
    expect(getStatusBadgeClasses('inactive')).toContain('neutral');
  });
});

describe('getRoleColor', () => {
  it('returns gold for architect', () => {
    expect(getRoleColor('architect')).toContain('gold');
  });

  it('returns teal for implementer', () => {
    expect(getRoleColor('implementer')).toContain('teal');
  });

  it('returns coral for reviewer', () => {
    expect(getRoleColor('reviewer')).toContain('coral');
  });

  it('returns teal for tester', () => {
    expect(getRoleColor('tester')).toContain('teal');
  });
});

describe('ROLE_DESCRIPTION', () => {
  it('has descriptions for all roles', () => {
    expect(ROLE_DESCRIPTION.architect).toBeDefined();
    expect(ROLE_DESCRIPTION.implementer).toBeDefined();
    expect(ROLE_DESCRIPTION.reviewer).toBeDefined();
    expect(ROLE_DESCRIPTION.tester).toBeDefined();
  });
});
