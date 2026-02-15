import { GitHubApiService } from '@thumbcode/core';
import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import CreateProjectPage from '../create-project';

// Mock GitHubApiService
vi.mock('@thumbcode/core', async () => {
  const actual = await vi.importActual('@thumbcode/core');
  return {
    ...actual,
    GitHubApiService: {
      listRepositories: vi.fn(),
    },
  };
});

// Mock useAppRouter
vi.mock('@/hooks/useAppRouter', () => ({
  useAppRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
}));

describe('CreateProjectPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches and displays repositories on mount', async () => {
    const mockRepos = [
      {
        provider: 'github',
        owner: 'user',
        name: 'repo1',
        fullName: 'user/repo1',
        defaultBranch: 'main',
        cloneUrl: 'https://github.com/user/repo1.git',
        isPrivate: false,
        description: 'Test Repo 1',
        stars: 10,
        forks: 2,
        updatedAt: '2023-01-01T00:00:00Z',
      },
      {
        provider: 'github',
        owner: 'user',
        name: 'repo2',
        fullName: 'user/repo2',
        defaultBranch: 'main',
        cloneUrl: 'https://github.com/user/repo2.git',
        isPrivate: true,
        description: 'Test Repo 2',
        stars: 5,
        forks: 0,
        updatedAt: '2023-01-02T00:00:00Z',
      },
    ];

    vi.mocked(GitHubApiService.listRepositories).mockResolvedValue(mockRepos);

    render(<CreateProjectPage />);

    // Check loading state initially
    expect(screen.getByText('Loading repositories...')).toBeInTheDocument();

    // Wait for repos to be displayed
    await waitFor(() => {
      expect(screen.getByText('repo1')).toBeInTheDocument();
      expect(screen.getByText('repo2')).toBeInTheDocument();
    });

    expect(GitHubApiService.listRepositories).toHaveBeenCalledTimes(1);
  });

  it('handles fetch error gracefully', async () => {
    const errorMessage = 'API Error';
    vi.mocked(GitHubApiService.listRepositories).mockRejectedValue(new Error(errorMessage));

    render(<CreateProjectPage />);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    expect(screen.getByText('No repositories found.')).toBeInTheDocument();
  });

  it('handles empty repository list', async () => {
    vi.mocked(GitHubApiService.listRepositories).mockResolvedValue([]);

    render(<CreateProjectPage />);

    await waitFor(() => {
      expect(screen.getByText('No repositories found.')).toBeInTheDocument();
    });
  });
});
