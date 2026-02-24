/**
 * useProjectFiles Hook Tests
 */

import { act, renderHook, waitFor } from '@testing-library/react';
import { GitHubApiService } from '@/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { parseRepoInfo, useProjectFiles } from '../use-project-files';

vi.mock('@/core', () => ({
  GitHubApiService: {
    getContents: vi.fn(),
  },
}));

const mockContents = [
  {
    name: 'README.md',
    path: 'README.md',
    type: 'file' as const,
    size: 1234,
    sha: 'abc',
    url: '',
    downloadUrl: '',
  },
  {
    name: 'src',
    path: 'src',
    type: 'dir' as const,
    size: 0,
    sha: 'def',
    url: '',
    downloadUrl: null,
  },
  {
    name: 'package.json',
    path: 'package.json',
    type: 'file' as const,
    size: 500,
    sha: 'ghi',
    url: '',
    downloadUrl: '',
  },
];

describe('parseRepoInfo', () => {
  it('parses HTTPS GitHub URLs', () => {
    expect(parseRepoInfo('https://github.com/owner/repo.git')).toEqual({
      owner: 'owner',
      repo: 'repo',
    });
  });

  it('parses SSH GitHub URLs', () => {
    expect(parseRepoInfo('git@github.com:owner/repo.git')).toEqual({
      owner: 'owner',
      repo: 'repo',
    });
  });

  it('parses URLs without .git suffix', () => {
    expect(parseRepoInfo('https://github.com/owner/repo')).toEqual({
      owner: 'owner',
      repo: 'repo',
    });
  });

  it('returns null for non-GitHub URLs', () => {
    expect(parseRepoInfo('https://gitlab.com/owner/repo')).toBeNull();
  });
});

describe('useProjectFiles', () => {
  const repoInfo = { owner: 'testuser', repo: 'testrepo' };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(GitHubApiService.getContents).mockResolvedValue(mockContents);
  });

  it('fetches contents on mount', async () => {
    const { result } = renderHook(() => useProjectFiles(repoInfo, 'main'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(GitHubApiService.getContents).toHaveBeenCalledWith(
      'testuser',
      'testrepo',
      undefined,
      'main'
    );
    expect(result.current.contents).toHaveLength(3);
    expect(result.current.error).toBeNull();
  });

  it('sorts directories before files', async () => {
    const { result } = renderHook(() => useProjectFiles(repoInfo, 'main'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // First should be dir 'src', then files alphabetically
    expect(result.current.contents[0].name).toBe('src');
    expect(result.current.contents[0].type).toBe('dir');
    expect(result.current.contents[1].name).toBe('package.json');
    expect(result.current.contents[2].name).toBe('README.md');
  });

  it('navigates to subdirectories', async () => {
    const { result } = renderHook(() => useProjectFiles(repoInfo, 'main'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const subContents = [
      {
        name: 'index.ts',
        path: 'src/index.ts',
        type: 'file' as const,
        size: 100,
        sha: 'jkl',
        url: '',
        downloadUrl: '',
      },
    ];
    vi.mocked(GitHubApiService.getContents).mockResolvedValue(subContents);

    act(() => {
      result.current.navigateTo('src');
    });

    await waitFor(() => {
      expect(result.current.currentPath).toBe('src');
    });

    expect(result.current.contents).toHaveLength(1);
    expect(result.current.contents[0].name).toBe('index.ts');
  });

  it('computes parentPath correctly', async () => {
    const { result } = renderHook(() => useProjectFiles(repoInfo, 'main'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Navigate to nested path
    vi.mocked(GitHubApiService.getContents).mockResolvedValue([]);

    act(() => {
      result.current.navigateTo('src/components');
    });

    await waitFor(() => {
      expect(result.current.currentPath).toBe('src/components');
    });

    expect(result.current.parentPath).toBe('src');
  });

  it('handles fetch errors', async () => {
    vi.mocked(GitHubApiService.getContents).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useProjectFiles(repoInfo, 'main'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe('Network error');
    expect(result.current.contents).toHaveLength(0);
  });

  it('does nothing when repoInfo is null', async () => {
    const { result } = renderHook(() => useProjectFiles(null, 'main'));

    // Should never start loading
    expect(result.current.isLoading).toBe(false);
    expect(result.current.contents).toHaveLength(0);
    expect(GitHubApiService.getContents).not.toHaveBeenCalled();
  });
});
