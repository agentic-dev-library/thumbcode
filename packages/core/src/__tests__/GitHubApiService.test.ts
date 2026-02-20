/**
 * GitHubApiService Tests
 *
 * Tests for GitHub API operations: listRepositories, createRepository.
 * Mocks fetch and CredentialService.
 */

// Mock @thumbcode/config
vi.mock('@thumbcode/config', () => ({
  API_URLS: {
    github: 'https://api.github.com',
  },
}));

// Mock CredentialService
vi.mock('../credentials', () => ({
  CredentialService: {
    retrieve: vi.fn(),
  },
}));

import { CredentialService } from '../credentials';
import { GitHubApiService } from '../github/GitHubApiService';

const mockFetch = vi.fn();
global.fetch = mockFetch;

const mockCredentialService = CredentialService as Mocked<typeof CredentialService>;

describe('GitHubApiService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCredentialService.retrieve.mockResolvedValue({ secret: 'ghp_testtoken123' });
  });

  describe('listRepositories', () => {
    const mockRepoResponse = [
      {
        id: 1,
        name: 'my-repo',
        full_name: 'user/my-repo',
        owner: { login: 'user' },
        private: false,
        description: 'A test repo',
        default_branch: 'main',
        clone_url: 'https://github.com/user/my-repo.git',
        stargazers_count: 10,
        forks_count: 2,
        language: 'TypeScript',
        updated_at: '2025-01-01T00:00:00Z',
      },
      {
        id: 2,
        name: 'another-repo',
        full_name: 'user/another-repo',
        owner: { login: 'user' },
        private: true,
        description: null,
        default_branch: 'develop',
        clone_url: 'https://github.com/user/another-repo.git',
        stargazers_count: 0,
        forks_count: 0,
        language: null,
        updated_at: '2025-02-01T00:00:00Z',
      },
    ];

    it('should list repositories with default options', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockRepoResponse),
      });

      const repos = await GitHubApiService.listRepositories();

      expect(repos).toHaveLength(2);
      expect(repos[0]).toEqual({
        provider: 'github',
        owner: 'user',
        name: 'my-repo',
        fullName: 'user/my-repo',
        defaultBranch: 'main',
        cloneUrl: 'https://github.com/user/my-repo.git',
        isPrivate: false,
        description: 'A test repo',
        language: 'TypeScript',
        stars: 10,
        forks: 2,
        updatedAt: '2025-01-01T00:00:00Z',
      });
    });

    it('should handle null description and language', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockRepoResponse),
      });

      const repos = await GitHubApiService.listRepositories();

      expect(repos[1].description).toBeUndefined();
      expect(repos[1].language).toBeUndefined();
    });

    it('should pass sort and perPage options to the API', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      });

      await GitHubApiService.listRepositories({
        perPage: 50,
        sort: 'created',
      });

      const calledUrl = mockFetch.mock.calls[0][0];
      expect(calledUrl).toContain('per_page=50');
      expect(calledUrl).toContain('sort=created');
    });

    it('should include Authorization header with bearer token', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      });

      await GitHubApiService.listRepositories();

      const headers = mockFetch.mock.calls[0][1].headers;
      expect(headers.Authorization).toBe('Bearer ghp_testtoken123');
      expect(headers.Accept).toBe('application/vnd.github.v3+json');
    });

    it('should throw when no GitHub credential', async () => {
      mockCredentialService.retrieve.mockResolvedValueOnce({ secret: null });

      await expect(GitHubApiService.listRepositories()).rejects.toThrow(
        'Missing GitHub credential'
      );
    });

    it('should throw on API error response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        text: () => Promise.resolve('Rate limit exceeded'),
      });

      await expect(GitHubApiService.listRepositories()).rejects.toThrow(
        'GitHub API error: 403 Rate limit exceeded'
      );
    });
  });

  describe('createRepository', () => {
    const mockCreatedRepo = {
      id: 3,
      name: 'new-project',
      full_name: 'user/new-project',
      owner: { login: 'user' },
      private: true,
      description: 'My new project',
      default_branch: 'main',
      clone_url: 'https://github.com/user/new-project.git',
      stargazers_count: 0,
      forks_count: 0,
      language: null,
      updated_at: '2025-03-01T00:00:00Z',
    };

    it('should create a repository with default options', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCreatedRepo),
      });

      const repo = await GitHubApiService.createRepository({
        name: 'new-project',
        description: 'My new project',
      });

      expect(repo.name).toBe('new-project');
      expect(repo.provider).toBe('github');
      expect(repo.isPrivate).toBe(true);

      const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(requestBody).toEqual({
        name: 'new-project',
        description: 'My new project',
        private: true,
        auto_init: true,
      });
    });

    it('should create a public repository', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ...mockCreatedRepo, private: false }),
      });

      const repo = await GitHubApiService.createRepository({
        name: 'public-project',
        isPrivate: false,
      });

      expect(repo.isPrivate).toBe(false);
      const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(requestBody.private).toBe(false);
    });

    it('should send POST request to /user/repos', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCreatedRepo),
      });

      await GitHubApiService.createRepository({ name: 'test' });

      expect(mockFetch.mock.calls[0][0]).toBe('https://api.github.com/user/repos');
      expect(mockFetch.mock.calls[0][1].method).toBe('POST');
    });

    it('should throw on creation failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 422,
        text: () => Promise.resolve('Repository creation failed: name already exists'),
      });

      await expect(GitHubApiService.createRepository({ name: 'existing-repo' })).rejects.toThrow(
        'GitHub API error: 422'
      );
    });

    it('should default description to empty string', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCreatedRepo),
      });

      await GitHubApiService.createRepository({ name: 'no-desc' });

      const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(requestBody.description).toBe('');
    });
  });
});
