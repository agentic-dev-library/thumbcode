/**
 * AgentDetail Page Tests
 *
 * Verifies the agent detail page renders agent info, metrics,
 * tabs, and handles missing agent gracefully.
 */

import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AgentDetail } from '../AgentDetail';

const mockNavigate = vi.fn();
let mockParamsId: string | undefined = 'agent-1';

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useParams: () => ({ id: mockParamsId }),
}));

vi.mock('@/components/agents', () => ({
  AgentMetrics: ({ completed, failed, successRate }: { completed: number; failed: number; successRate: number | null }) => (
    <div data-testid="agent-metrics">
      <span>{completed} completed</span>
      <span>{failed} failed</span>
      {successRate !== null && <span>{successRate}% success</span>}
    </div>
  ),
  AgentActions: ({ agentId }: { agentId: string }) => (
    <div data-testid="agent-actions">Actions for {agentId}</div>
  ),
  AgentHistory: ({ tasks }: { tasks: unknown[] }) => (
    <div data-testid="agent-history">{tasks.length} tasks</div>
  ),
}));

const mockSetIdle = vi.fn();
const mockSetWorking = vi.fn();

vi.mock('@/hooks', () => ({
  useAgentDetail: (id: string | undefined) => {
    if (!id || id === 'unknown') {
      return {
        agent: undefined,
        tasks: [],
        currentTask: null,
        metrics: { completed: 0, failed: 0, successRate: null, progress: 0 },
        statusVariant: 'inactive',
        setIdle: mockSetIdle,
        setWorking: mockSetWorking,
      };
    }
    if (id === 'agent-2') {
      return {
        agent: {
          id: 'agent-2',
          name: 'Implementer',
          role: 'implementer',
          status: 'working',
          currentTaskId: 'task-1',
          config: { provider: 'anthropic', model: 'claude-3' },
        },
        tasks: [
          { id: 'task-1', agentId: 'agent-2', description: 'Implement feature', status: 'in_progress' },
          { id: 'task-2', agentId: 'agent-2', description: 'Fix bug', status: 'completed' },
        ],
        currentTask: { id: 'task-1', description: 'Implement feature', status: 'in_progress' },
        metrics: { completed: 1, failed: 0, successRate: 100, progress: 50 },
        statusVariant: 'success',
        setIdle: mockSetIdle,
        setWorking: mockSetWorking,
      };
    }
    return {
      agent: {
        id: 'agent-1',
        name: 'Architect',
        role: 'architect',
        status: 'idle',
        config: { provider: 'anthropic', model: 'claude-3' },
      },
      tasks: [
        { id: 'task-4', agentId: 'agent-1', description: 'Design architecture', status: 'pending' },
      ],
      currentTask: null,
      metrics: { completed: 0, failed: 0, successRate: null, progress: 0 },
      statusVariant: 'inactive',
      setIdle: mockSetIdle,
      setWorking: mockSetWorking,
    };
  },
  getRoleColor: (role: string) => `bg-${role}-100`,
  getStatusBadgeClasses: (variant: string) => `badge-${variant}`,
  ROLE_DESCRIPTION: {
    architect: 'Designs system architecture and technical decisions',
    implementer: 'Writes code and implements features',
    reviewer: 'Reviews code quality and suggests improvements',
    tester: 'Writes and runs tests',
  },
}));

describe('AgentDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockParamsId = 'agent-1';
  });

  it('renders agent name and role', () => {
    render(<AgentDetail />);
    expect(screen.getByText('Architect')).toBeInTheDocument();
    expect(screen.getByText('architect')).toBeInTheDocument();
  });

  it('renders agent status badge', () => {
    render(<AgentDetail />);
    expect(screen.getByText('idle')).toBeInTheDocument();
  });

  it('renders role description', () => {
    render(<AgentDetail />);
    expect(
      screen.getByText('Designs system architecture and technical decisions')
    ).toBeInTheDocument();
  });

  it('renders overview and history tabs', () => {
    render(<AgentDetail />);
    expect(screen.getByLabelText('Show overview')).toBeInTheDocument();
    expect(screen.getByLabelText('Show history')).toBeInTheDocument();
  });

  it('shows agent metrics on overview tab by default', () => {
    render(<AgentDetail />);
    expect(screen.getByTestId('agent-metrics')).toBeInTheDocument();
    expect(screen.getByTestId('agent-actions')).toBeInTheDocument();
  });

  it('switches to history tab when clicked', () => {
    render(<AgentDetail />);
    fireEvent.click(screen.getByLabelText('Show history'));
    expect(screen.getByTestId('agent-history')).toBeInTheDocument();
    expect(screen.getByText('1 tasks')).toBeInTheDocument();
  });

  it('shows "Agent not found" for invalid agent id', () => {
    mockParamsId = 'unknown';
    render(<AgentDetail />);
    expect(screen.getByText('Agent not found')).toBeInTheDocument();
    expect(screen.getByTestId('back-button')).toBeInTheDocument();
  });

  it('shows "Agent not found" when id is undefined', () => {
    mockParamsId = undefined;
    render(<AgentDetail />);
    expect(screen.getByText('Agent not found')).toBeInTheDocument();
  });

  it('navigates back when back button is clicked from error state', () => {
    mockParamsId = 'unknown';
    render(<AgentDetail />);
    fireEvent.click(screen.getByTestId('back-button'));
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it('shows current task card when agent has active task', () => {
    mockParamsId = 'agent-2';
    render(<AgentDetail />);
    expect(screen.getByText('Current Task')).toBeInTheDocument();
    expect(screen.getByText('Implement feature')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('does not show current task card when agent has no active task', () => {
    mockParamsId = 'agent-1';
    render(<AgentDetail />);
    expect(screen.queryByText('Current Task')).not.toBeInTheDocument();
  });

  it('navigates back when header back button is clicked', () => {
    render(<AgentDetail />);
    fireEvent.click(screen.getByLabelText('Go back'));
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });
});
