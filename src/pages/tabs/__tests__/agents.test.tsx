/**
 * Agents Page Tests
 *
 * Verifies the agents page renders as a thin composition layer
 * consuming the useAgentList hook.
 */

import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AgentsPage from '../agents';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

const mockSetSelectedRole = vi.fn();
vi.mock('@/hooks', () => ({
  useAgentList: () => ({
    selectedRole: null,
    setSelectedRole: mockSetSelectedRole,
    filteredAgents: [
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
    ],
    totalAgents: 4,
    activeAgents: 2,
    totalCompletedTasks: 10,
    getAgentMetrics: (agent: { id: string }) => {
      if (agent.id === 'agent-2') {
        return {
          completedTasks: 5,
          failedTasks: 1,
          activeTasks: 1,
          successRate: '83%',
          currentTask: { id: 'task-1', description: 'Implement login', status: 'in_progress' },
          progress: 62,
        };
      }
      return {
        completedTasks: 3,
        failedTasks: 0,
        activeTasks: 0,
        successRate: '100%',
        currentTask: null,
        progress: 0,
      };
    },
  }),
}));

describe('AgentsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the agents screen test id', () => {
    render(<AgentsPage />);
    expect(screen.getByTestId('agents-screen')).toBeInTheDocument();
  });

  it('displays active agents count with total', () => {
    render(<AgentsPage />);
    expect(screen.getByText('2/4')).toBeInTheDocument();
    expect(screen.getByText('Active Agents')).toBeInTheDocument();
  });

  it('displays total completed tasks', () => {
    render(<AgentsPage />);
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('Tasks Completed')).toBeInTheDocument();
  });

  it('renders role filter buttons', () => {
    render(<AgentsPage />);
    expect(screen.getByTestId('role-filter-all')).toBeInTheDocument();
    expect(screen.getByTestId('role-filter-architect')).toBeInTheDocument();
    expect(screen.getByTestId('role-filter-implementer')).toBeInTheDocument();
    expect(screen.getByTestId('role-filter-reviewer')).toBeInTheDocument();
    expect(screen.getByTestId('role-filter-tester')).toBeInTheDocument();
  });

  it('renders agent names and roles', () => {
    render(<AgentsPage />);
    // Agent names appear as card titles; role text appears as subtitle and in filter buttons
    expect(screen.getAllByText('Architect').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Implementer').length).toBeGreaterThanOrEqual(1);
    // Role labels appear in both the card subtitle and filter buttons
    expect(screen.getAllByText('architect').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('implementer').length).toBeGreaterThanOrEqual(1);
  });

  it('renders current task progress for working agent', () => {
    render(<AgentsPage />);
    expect(screen.getByText('Implement login')).toBeInTheDocument();
    expect(screen.getByText('62%')).toBeInTheDocument();
  });

  it('renders agent metrics', () => {
    render(<AgentsPage />);
    expect(screen.getByText('83%')).toBeInTheDocument(); // Implementer success rate
    expect(screen.getByText('100%')).toBeInTheDocument(); // Architect success rate
  });
});
