/**
 * Projects Page Tests
 *
 * Verifies the projects page renders as a thin composition layer
 * consuming the useProjectList hook.
 */

import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ProjectsPage from '../projects';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

const mockSetSearchQuery = vi.fn();
vi.mock('@/hooks', () => ({
  useProjectList: () => ({
    searchQuery: '',
    setSearchQuery: mockSetSearchQuery,
    filteredProjects: [
      {
        id: 'p1',
        name: 'ThumbCode',
        repoUrl: 'https://github.com/user/thumbcode.git',
        localPath: '/thumbcode',
        defaultBranch: 'main',
        status: 'active',
        createdAt: '2026-01-01T00:00:00Z',
        lastOpenedAt: '2026-01-15T00:00:00Z',
      },
      {
        id: 'p2',
        name: 'Other App',
        repoUrl: 'https://github.com/user/other-app.git',
        localPath: '/other-app',
        defaultBranch: 'develop',
        status: 'idle',
        createdAt: '2026-01-01T00:00:00Z',
        lastOpenedAt: '2026-01-10T00:00:00Z',
      },
    ],
    hasProjects: true,
  }),
}));

describe('ProjectsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the projects screen test id', () => {
    render(<ProjectsPage />);
    expect(screen.getByTestId('projects-screen')).toBeInTheDocument();
  });

  it('renders search input', () => {
    render(<ProjectsPage />);
    expect(screen.getByLabelText('Search projects')).toBeInTheDocument();
  });

  it('displays project names', () => {
    render(<ProjectsPage />);
    expect(screen.getByText('ThumbCode')).toBeInTheDocument();
    expect(screen.getByText('Other App')).toBeInTheDocument();
  });

  it('displays branch names', () => {
    render(<ProjectsPage />);
    expect(screen.getByText('main')).toBeInTheDocument();
    expect(screen.getByText('develop')).toBeInTheDocument();
  });

  it('displays status badges', () => {
    render(<ProjectsPage />);
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Idle')).toBeInTheDocument();
  });

  it('renders the FAB button', () => {
    render(<ProjectsPage />);
    expect(screen.getByLabelText('Create new project')).toBeInTheDocument();
  });
});
