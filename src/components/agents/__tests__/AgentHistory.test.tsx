import { render, screen } from '@testing-library/react';
import type { AgentTask } from '@/state';
import { AgentHistory } from '../AgentHistory';

vi.mock('@/components/display', () => ({
  Badge: ({ children }: { children?: React.ReactNode }) => (
    <span data-testid="badge">{children}</span>
  ),
}));

vi.mock('@/components/layout', () => ({
  Divider: () => <hr />,
  HStack: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  VStack: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/components/ui', () => ({
  Text: ({ children }: { children?: React.ReactNode }) => <span>{children}</span>,
}));

describe('AgentHistory', () => {
  const mockTasks: AgentTask[] = [
    {
      id: 'task-1',
      agentId: 'agent-1',
      description: 'Design login page',
      status: 'completed',
      createdAt: '2024-01-01T10:00:00Z',
      completedAt: '2024-01-01T11:00:00Z',
    },
    {
      id: 'task-2',
      agentId: 'agent-1',
      description: 'Implement API',
      status: 'failed',
      createdAt: '2024-01-02T10:00:00Z',
    },
    {
      id: 'task-3',
      agentId: 'agent-1',
      description: 'Run tests',
      status: 'in_progress',
      createdAt: '2024-01-03T10:00:00Z',
    },
  ];

  it('renders task history header', () => {
    render(<AgentHistory tasks={mockTasks} />);
    expect(screen.getByText('TASK HISTORY')).toBeInTheDocument();
  });

  it('renders task descriptions', () => {
    render(<AgentHistory tasks={mockTasks} />);
    expect(screen.getByText('Design login page')).toBeInTheDocument();
    expect(screen.getByText('Implement API')).toBeInTheDocument();
    expect(screen.getByText('Run tests')).toBeInTheDocument();
  });

  it('shows empty state when no tasks', () => {
    render(<AgentHistory tasks={[]} />);
    expect(screen.getByText('No tasks yet.')).toBeInTheDocument();
  });

  it('sorts tasks by creation date descending', () => {
    render(<AgentHistory tasks={mockTasks} />);
    const descriptions = screen.getAllByText(/Design login page|Implement API|Run tests/);
    expect(descriptions[0].textContent).toBe('Run tests');
    expect(descriptions[1].textContent).toBe('Implement API');
    expect(descriptions[2].textContent).toBe('Design login page');
  });
});
