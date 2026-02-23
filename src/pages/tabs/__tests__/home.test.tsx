/**
 * Home Page Tests
 *
 * Verifies the home page renders as a thin composition layer
 * consuming the useHomeDashboard hook.
 */

import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import HomePage from '../home';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('@/hooks', () => ({
  useHomeDashboard: () => ({
    stats: {
      projectCount: 3,
      runningAgents: 1,
      pendingTasks: 5,
      completedToday: 2,
      progressPercent: 28.6,
    },
    agents: [
      { id: 'agent-1', name: 'Architect', role: 'architect', status: 'idle' },
      { id: 'agent-2', name: 'Implementer', role: 'implementer', status: 'working' },
    ],
    recentActivity: [
      {
        id: 'act-1',
        type: 'commit',
        agent: 'Implementer',
        message: 'Added new component',
        project: 'workspace',
        time: '10:30 AM',
      },
    ],
  }),
}));

describe('HomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the dashboard heading', () => {
    render(<HomePage />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('displays project count from hook stats', () => {
    render(<HomePage />);
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('Projects')).toBeInTheDocument();
  });

  it('displays running agents count', () => {
    render(<HomePage />);
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('Running Agents')).toBeInTheDocument();
  });

  it('displays pending tasks count', () => {
    render(<HomePage />);
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('Pending Tasks')).toBeInTheDocument();
  });

  it('renders agent team section with agent names', () => {
    render(<HomePage />);
    expect(screen.getByText('Agent Team')).toBeInTheDocument();
    expect(screen.getAllByText('Architect').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Implementer').length).toBeGreaterThanOrEqual(1);
  });

  it('renders today progress section', () => {
    render(<HomePage />);
    expect(screen.getByText("Today's Progress")).toBeInTheDocument();
    expect(screen.getByText('2 done')).toBeInTheDocument();
  });

  it('renders recent activity', () => {
    render(<HomePage />);
    expect(screen.getByText('Recent Activity')).toBeInTheDocument();
    expect(screen.getByText('Added new component')).toBeInTheDocument();
  });

  it('has the home-screen test id', () => {
    render(<HomePage />);
    expect(screen.getByTestId('home-screen')).toBeInTheDocument();
  });
});
