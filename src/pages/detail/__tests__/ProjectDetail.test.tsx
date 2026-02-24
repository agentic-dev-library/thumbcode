import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GitHubApiService } from '@/core';
import { ProjectDetail } from '../ProjectDetail';

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useParams: () => ({ id: 'project-1' }),
}));

// Mock @/core
vi.mock('@/core', () => ({
  GitHubApiService: {
    listCommits: vi.fn(),
    getContents: vi.fn(),
  },
}));

// Mock @/state
const mockProject = {
  id: 'project-1',
  name: 'Test Project',
  repoUrl: 'https://github.com/testuser/testrepo.git',
  localPath: '/testuser/testrepo',
  defaultBranch: 'main',
  status: 'active',
  createdAt: '2026-01-01T00:00:00Z',
  lastOpenedAt: '2026-01-01T00:00:00Z',
};

const mockInitWorkspace = vi.fn();

vi.mock('@/state', () => ({
  toast: { success: vi.fn(), error: vi.fn(), warning: vi.fn(), info: vi.fn() },
  useProjectStore: vi.fn((selector) => {
    const state = {
      projects: [mockProject],
      workspace: { projectId: 'project-1', currentBranch: 'main' },
      initWorkspace: mockInitWorkspace,
    };
    if (typeof selector === 'function') return selector(state);
    return state;
  }),
  useAgentStore: vi.fn((selector) => {
    const state = {
      agents: [
        { id: 'agent-1', name: 'Architect', role: 'architect', status: 'idle' },
        { id: 'agent-2', name: 'Implementer', role: 'implementer', status: 'working' },
      ],
      tasks: [
        {
          id: 'task-1',
          description: 'Fix bug',
          status: 'completed',
          agentId: 'agent-2',
          result: 'Fixed',
        },
      ],
    };
    if (typeof selector === 'function') return selector(state);
    return state;
  }),
}));

describe('ProjectDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(GitHubApiService.getContents).mockResolvedValue([
      {
        name: 'src',
        path: 'src',
        type: 'dir',
        size: 0,
        sha: 'abc123',
        url: 'https://github.com/testuser/testrepo/tree/main/src',
        downloadUrl: null,
      },
      {
        name: 'README.md',
        path: 'README.md',
        type: 'file',
        size: 1234,
        sha: 'def456',
        url: 'https://github.com/testuser/testrepo/blob/main/README.md',
        downloadUrl: 'https://raw.githubusercontent.com/testuser/testrepo/main/README.md',
      },
    ]);

    vi.mocked(GitHubApiService.listCommits).mockResolvedValue([
      {
        sha: 'abc123def456',
        message: 'Initial commit',
        authorName: 'Test User',
        authorEmail: 'test@example.com',
        date: '2026-01-01T00:00:00Z',
        url: 'https://github.com/testuser/testrepo/commit/abc123def456',
      },
    ]);
  });

  it('renders project header with name and branch', () => {
    render(<ProjectDetail />);

    expect(screen.getByText('Test Project')).toBeInTheDocument();
    expect(screen.getByText('main')).toBeInTheDocument();
  });

  it('shows tab navigation', () => {
    render(<ProjectDetail />);

    expect(screen.getByLabelText('Show files')).toBeInTheDocument();
    expect(screen.getByLabelText('Show commits')).toBeInTheDocument();
    expect(screen.getByLabelText('Show tasks')).toBeInTheDocument();
    expect(screen.getByLabelText('Show agents')).toBeInTheDocument();
  });

  it('loads files from GitHub API on files tab', async () => {
    render(<ProjectDetail />);

    await waitFor(() => {
      expect(screen.getByText('src')).toBeInTheDocument();
      expect(screen.getByText('README.md')).toBeInTheDocument();
    });

    expect(GitHubApiService.getContents).toHaveBeenCalledWith(
      'testuser',
      'testrepo',
      undefined,
      'main'
    );
  });

  it('shows file sizes for files', async () => {
    render(<ProjectDetail />);

    await waitFor(() => {
      expect(screen.getByText('1.2KB')).toBeInTheDocument();
    });
  });

  it('shows "not found" when project does not exist', async () => {
    // Override the mock for this test to return no matching project
    const { useProjectStore } = await import('@/state');
    const mockedStore = vi.mocked(useProjectStore);
    // biome-ignore lint/suspicious/noExplicitAny: test mock needs flexible selector type for Zustand store
    mockedStore.mockImplementation((selector: any) => {
      const state = {
        projects: [],
        workspace: null,
        initWorkspace: mockInitWorkspace,
      };
      if (typeof selector === 'function') return selector(state);
      return state;
    });

    render(<ProjectDetail />);

    expect(screen.getByText('Project not found')).toBeInTheDocument();

    // Restore original mock
    // biome-ignore lint/suspicious/noExplicitAny: test mock needs flexible selector type for Zustand store
    mockedStore.mockImplementation((selector: any) => {
      const state = {
        projects: [mockProject],
        workspace: { projectId: 'project-1', currentBranch: 'main' },
        initWorkspace: mockInitWorkspace,
      };
      if (typeof selector === 'function') return selector(state);
      return state;
    });
  });
});
