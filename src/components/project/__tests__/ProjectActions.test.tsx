import { fireEvent, render, screen } from '@testing-library/react';
import type { GitHubCommit } from '@thumbcode/core';
import type { AgentTask } from '@thumbcode/state';
import { ProjectAgents, ProjectCommits, ProjectTasks } from '../ProjectActions';

describe('ProjectCommits', () => {
  const repoInfo = { owner: 'user', repo: 'my-project' };

  const mockCommits: GitHubCommit[] = [
    {
      sha: 'abc1234567890',
      message: 'feat: add login page\n\nDetailed description here',
      authorName: 'John Doe',
      authorEmail: 'john@example.com',
      date: '2024-01-15T10:00:00Z',
      url: 'https://github.com/user/my-project/commit/abc1234567890',
    },
    {
      sha: 'def4567890123',
      message: 'fix: resolve auth issue',
      authorName: 'Jane Doe',
      authorEmail: 'jane@example.com',
      date: '2024-01-14T10:00:00Z',
      url: 'https://github.com/user/my-project/commit/def4567890123',
    },
  ];

  it('shows error when repoInfo is null', () => {
    render(
      <ProjectCommits repoInfo={null} commits={[]} isLoading={false} error={null} />
    );
    expect(screen.getByText('Could not parse repository info from URL.')).toBeInTheDocument();
  });

  it('shows loading spinner', () => {
    const { container } = render(
      <ProjectCommits repoInfo={repoInfo} commits={[]} isLoading error={null} />
    );
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('shows error message', () => {
    render(
      <ProjectCommits repoInfo={repoInfo} commits={[]} isLoading={false} error="Failed to load" />
    );
    expect(screen.getByText('Failed to load')).toBeInTheDocument();
  });

  it('shows empty state when no commits', () => {
    render(
      <ProjectCommits repoInfo={repoInfo} commits={[]} isLoading={false} error={null} />
    );
    expect(screen.getByText('No commits found.')).toBeInTheDocument();
  });

  it('renders commit list with messages', () => {
    render(
      <ProjectCommits
        repoInfo={repoInfo}
        commits={mockCommits}
        isLoading={false}
        error={null}
      />
    );
    expect(screen.getByText('feat: add login page')).toBeInTheDocument();
    expect(screen.getByText('fix: resolve auth issue')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('abc1234')).toBeInTheDocument();
  });
});

describe('ProjectTasks', () => {
  const mockTasks: AgentTask[] = [
    {
      id: 'task-1',
      agentId: 'agent-1',
      description: 'Design login page',
      status: 'completed',
      createdAt: '2024-01-01T10:00:00Z',
    },
    {
      id: 'task-2',
      agentId: 'agent-2',
      description: 'Implement API',
      status: 'failed',
      result: 'Connection timeout',
      createdAt: '2024-01-02T10:00:00Z',
    },
  ];

  it('shows empty state when no tasks', () => {
    render(<ProjectTasks tasks={[]} />);
    expect(screen.getByText('No tasks yet.')).toBeInTheDocument();
  });

  it('renders task descriptions', () => {
    render(<ProjectTasks tasks={mockTasks} />);
    expect(screen.getByText('Design login page')).toBeInTheDocument();
    expect(screen.getByText('Implement API')).toBeInTheDocument();
  });

  it('shows task result when available', () => {
    render(<ProjectTasks tasks={mockTasks} />);
    expect(screen.getByText('Connection timeout')).toBeInTheDocument();
  });

  it('shows task status badges', () => {
    render(<ProjectTasks tasks={mockTasks} />);
    expect(screen.getByText('completed')).toBeInTheDocument();
    expect(screen.getByText('failed')).toBeInTheDocument();
  });
});

describe('ProjectAgents', () => {
  const mockAgents = [
    { id: 'agent-1', name: 'Architect', role: 'architect', status: 'working' },
    { id: 'agent-2', name: 'Implementer', role: 'implementer', status: 'idle' },
    { id: 'agent-3', name: 'Reviewer', role: 'reviewer', status: 'error' },
  ];

  it('renders agent names', () => {
    render(<ProjectAgents agents={mockAgents} onAgentPress={vi.fn()} />);
    expect(screen.getByText('Architect')).toBeInTheDocument();
    expect(screen.getByText('Implementer')).toBeInTheDocument();
    expect(screen.getByText('Reviewer')).toBeInTheDocument();
  });

  it('renders agent roles', () => {
    render(<ProjectAgents agents={mockAgents} onAgentPress={vi.fn()} />);
    expect(screen.getByText('architect')).toBeInTheDocument();
    expect(screen.getByText('implementer')).toBeInTheDocument();
  });

  it('calls onAgentPress when agent button clicked', () => {
    const onAgentPress = vi.fn();
    render(<ProjectAgents agents={mockAgents} onAgentPress={onAgentPress} />);
    fireEvent.click(screen.getByTestId('agent-agent-1'));
    expect(onAgentPress).toHaveBeenCalledWith('agent-1');
  });
});
