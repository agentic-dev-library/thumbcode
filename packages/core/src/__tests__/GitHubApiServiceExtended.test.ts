import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock CredentialService before importing GitHubApiService
vi.mock('../credentials', () => ({
  CredentialService: {
    retrieve: vi.fn().mockResolvedValue({ secret: 'gho_test_token' }),
  },
}));

// Mock @thumbcode/config
vi.mock('@thumbcode/config', () => ({
  API_URLS: { github: 'https://api.github.com' },
}));

import { GitHubApiService } from '../github/GitHubApiService';

describe('GitHubApiService - listCommits', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches commits for a repository', async () => {
    const mockCommits = [
      {
        sha: 'abc123',
        commit: {
          message: 'Initial commit',
          author: {
            name: 'Test User',
            email: 'test@example.com',
            date: '2026-01-01T00:00:00Z',
          },
        },
        html_url: 'https://github.com/owner/repo/commit/abc123',
      },
    ];

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockCommits),
    });

    const result = await GitHubApiService.listCommits('owner', 'repo');

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      sha: 'abc123',
      message: 'Initial commit',
      authorName: 'Test User',
      authorEmail: 'test@example.com',
      date: '2026-01-01T00:00:00Z',
      url: 'https://github.com/owner/repo/commit/abc123',
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/repos/owner/repo/commits'),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer gho_test_token',
        }),
      })
    );
  });

  it('passes sha parameter for branch filtering', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    });

    await GitHubApiService.listCommits('owner', 'repo', { sha: 'develop' });

    const url = (global.fetch as any).mock.calls[0][0];
    expect(url).toContain('sha=develop');
  });

  it('uses custom perPage option', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    });

    await GitHubApiService.listCommits('owner', 'repo', { perPage: 10 });

    const url = (global.fetch as any).mock.calls[0][0];
    expect(url).toContain('per_page=10');
  });
});

describe('GitHubApiService - getContents', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches root contents of a repository', async () => {
    const mockContents = [
      {
        name: 'src',
        path: 'src',
        type: 'dir',
        size: 0,
        sha: 'dir-sha',
        html_url: 'https://github.com/owner/repo/tree/main/src',
        download_url: null,
      },
      {
        name: 'README.md',
        path: 'README.md',
        type: 'file',
        size: 512,
        sha: 'file-sha',
        html_url: 'https://github.com/owner/repo/blob/main/README.md',
        download_url: 'https://raw.githubusercontent.com/owner/repo/main/README.md',
      },
    ];

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockContents),
    });

    const result = await GitHubApiService.getContents('owner', 'repo');

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      name: 'src',
      path: 'src',
      type: 'dir',
      size: 0,
      sha: 'dir-sha',
      url: 'https://github.com/owner/repo/tree/main/src',
      downloadUrl: null,
    });
    expect(result[1]).toEqual({
      name: 'README.md',
      path: 'README.md',
      type: 'file',
      size: 512,
      sha: 'file-sha',
      url: 'https://github.com/owner/repo/blob/main/README.md',
      downloadUrl: 'https://raw.githubusercontent.com/owner/repo/main/README.md',
    });
  });

  it('fetches contents for a specific path', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    });

    await GitHubApiService.getContents('owner', 'repo', 'src/components');

    const url = (global.fetch as any).mock.calls[0][0];
    expect(url).toContain('/repos/owner/repo/contents/src/components');
  });

  it('passes ref parameter for branch', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    });

    await GitHubApiService.getContents('owner', 'repo', undefined, 'develop');

    const url = (global.fetch as any).mock.calls[0][0];
    expect(url).toContain('ref=develop');
  });

  it('throws on API error', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      text: () => Promise.resolve('Not Found'),
    });

    await expect(GitHubApiService.getContents('owner', 'repo')).rejects.toThrow(
      'GitHub API error: 404 Not Found'
    );
  });
});
