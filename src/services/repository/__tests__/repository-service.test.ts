import { GitHubApiService } from '@thumbcode/core';
import type { Repository } from '@thumbcode/types';
import { describe, expect, it, vi } from 'vitest';
import {
  classifyError,
  createRepository,
  fetchRepositories,
  filterRepositories,
  toRepoListItem,
} from '../repository-service';

vi.mock('@thumbcode/core', async () => {
  const actual = await vi.importActual('@thumbcode/core');
  return {
    ...actual,
    GitHubApiService: {
      listRepositories: vi.fn(),
      createRepository: vi.fn(),
    },
  };
});

const makeRepo = (overrides: Partial<Repository> = {}): Repository => ({
  provider: 'github',
  owner: 'user',
  name: 'my-repo',
  fullName: 'user/my-repo',
  defaultBranch: 'main',
  cloneUrl: 'https://github.com/user/my-repo.git',
  isPrivate: false,
  description: 'A test repository',
  stars: 5,
  forks: 1,
  updatedAt: '2024-01-01T00:00:00Z',
  ...overrides,
});

describe('toRepoListItem', () => {
  it('maps a Repository to a RepoListItem with a key', () => {
    const repo = makeRepo();
    const item = toRepoListItem(repo);

    expect(item.key).toBe('user/my-repo');
    expect(item.name).toBe('my-repo');
    expect(item.fullName).toBe('user/my-repo');
    expect(item.cloneUrl).toBe('https://github.com/user/my-repo.git');
    expect(item.isPrivate).toBe(false);
    expect(item.stars).toBe(5);
  });

  it('converts null description to undefined', () => {
    const repo = makeRepo({ description: undefined });
    const item = toRepoListItem(repo);
    expect(item.description).toBeUndefined();
  });
});

describe('fetchRepositories', () => {
  it('fetches and maps repositories from GitHub API', async () => {
    const mockRepos = [makeRepo(), makeRepo({ name: 'other', fullName: 'user/other' })];
    vi.mocked(GitHubApiService.listRepositories).mockResolvedValue(mockRepos);

    const result = await fetchRepositories();

    expect(result).toHaveLength(2);
    expect(result[0].key).toBe('user/my-repo');
    expect(result[1].key).toBe('user/other');
    expect(GitHubApiService.listRepositories).toHaveBeenCalledTimes(1);
  });

  it('propagates API errors', async () => {
    vi.mocked(GitHubApiService.listRepositories).mockRejectedValue(new Error('Network error'));

    await expect(fetchRepositories()).rejects.toThrow('Network error');
  });
});

describe('createRepository', () => {
  it('creates a repo and returns a RepoListItem', async () => {
    const created = makeRepo({ name: 'new-repo', fullName: 'user/new-repo' });
    vi.mocked(GitHubApiService.createRepository).mockResolvedValue(created);

    const result = await createRepository({ name: 'new-repo', isPrivate: true });

    expect(result.key).toBe('user/new-repo');
    expect(result.name).toBe('new-repo');
    expect(GitHubApiService.createRepository).toHaveBeenCalledWith({
      name: 'new-repo',
      isPrivate: true,
    });
  });
});

describe('filterRepositories', () => {
  const repos = [
    toRepoListItem(makeRepo({ name: 'alpha', fullName: 'user/alpha', description: 'First repo' })),
    toRepoListItem(makeRepo({ name: 'beta', fullName: 'user/beta', description: 'Second repo' })),
    toRepoListItem(makeRepo({ name: 'gamma', fullName: 'org/gamma', description: undefined })),
  ];

  it('returns all repos for empty query', () => {
    expect(filterRepositories(repos, '')).toHaveLength(3);
    expect(filterRepositories(repos, '   ')).toHaveLength(3);
  });

  it('filters by name', () => {
    const result = filterRepositories(repos, 'alpha');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('alpha');
  });

  it('filters by fullName', () => {
    const result = filterRepositories(repos, 'org/');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('gamma');
  });

  it('filters by description', () => {
    const result = filterRepositories(repos, 'Second');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('beta');
  });

  it('is case insensitive', () => {
    expect(filterRepositories(repos, 'ALPHA')).toHaveLength(1);
  });

  it('returns empty array when nothing matches', () => {
    expect(filterRepositories(repos, 'zzz')).toHaveLength(0);
  });
});

describe('classifyError', () => {
  it('classifies 401 errors as auth errors', () => {
    const msg = classifyError(new Error('GitHub API error: 401'));
    expect(msg).toContain('authentication failed');
  });

  it('classifies Unauthorized errors as auth errors', () => {
    const msg = classifyError(new Error('Unauthorized access'));
    expect(msg).toContain('authentication failed');
  });

  it('classifies token errors as auth errors', () => {
    const msg = classifyError(new Error('Bad token'));
    expect(msg).toContain('authentication failed');
  });

  it('returns the original message for non-auth errors', () => {
    const msg = classifyError(new Error('Rate limit exceeded'));
    expect(msg).toBe('Rate limit exceeded');
  });

  it('returns a fallback for non-Error values', () => {
    const msg = classifyError('string error');
    expect(msg).toBe('Failed to load repositories');
  });
});
