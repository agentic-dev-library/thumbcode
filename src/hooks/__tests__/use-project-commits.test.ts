/**
 * useProjectCommits Hook Tests
 */

import { renderHook, waitFor } from '@testing-library/react';
import { GitHubApiService } from '@thumbcode/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useProjectCommits } from '../use-project-commits';

vi.mock('@thumbcode/core', () => ({
  GitHubApiService: {
    listCommits: vi.fn(),
  },
}));

const mockCommits = [
  {
    sha: 'abc123def456',
    message: 'feat: add new feature',
    authorName: 'Test User',
    authorEmail: 'test@example.com',
    date: '2026-01-15T12:00:00Z',
    url: 'https://github.com/testuser/testrepo/commit/abc123def456',
  },
  {
    sha: '789xyz',
    message: 'fix: bug fix',
    authorName: 'Dev User',
    authorEmail: 'dev@example.com',
    date: '2026-01-14T12:00:00Z',
    url: 'https://github.com/testuser/testrepo/commit/789xyz',
  },
];

describe('useProjectCommits', () => {
  const repoInfo = { owner: 'testuser', repo: 'testrepo' };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(GitHubApiService.listCommits).mockResolvedValue(mockCommits);
  });

  it('fetches commits on mount', async () => {
    const { result } = renderHook(() => useProjectCommits(repoInfo, 'main'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(GitHubApiService.listCommits).toHaveBeenCalledWith('testuser', 'testrepo', {
      sha: 'main',
      perPage: 30,
    });
    expect(result.current.commits).toHaveLength(2);
    expect(result.current.error).toBeNull();
  });

  it('handles fetch errors', async () => {
    vi.mocked(GitHubApiService.listCommits).mockRejectedValue(new Error('API error'));

    const { result } = renderHook(() => useProjectCommits(repoInfo, 'main'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe('API error');
    expect(result.current.commits).toHaveLength(0);
  });

  it('does nothing when repoInfo is null', async () => {
    const { result } = renderHook(() => useProjectCommits(null, 'main'));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.commits).toHaveLength(0);
    expect(GitHubApiService.listCommits).not.toHaveBeenCalled();
  });

  it('refetches when branch changes', async () => {
    const { result, rerender } = renderHook(({ branch }) => useProjectCommits(repoInfo, branch), {
      initialProps: { branch: 'main' },
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    rerender({ branch: 'develop' });

    await waitFor(() => {
      expect(GitHubApiService.listCommits).toHaveBeenCalledWith('testuser', 'testrepo', {
        sha: 'develop',
        perPage: 30,
      });
    });
  });
});
