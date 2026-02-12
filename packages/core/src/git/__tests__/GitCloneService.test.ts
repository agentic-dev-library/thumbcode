/**
 * GitCloneService Tests
 *
 * Tests for clone, fetch, pull, push, remote management, init, and cleanup operations.
 */

import git from 'isomorphic-git';

import { GitCloneService } from '../GitCloneService';

// Mock isomorphic-git
vi.mock('isomorphic-git', () => ({
  __esModule: true,
  default: {
    clone: vi.fn(),
    fetch: vi.fn(),
    pull: vi.fn(),
    push: vi.fn(),
    listRemotes: vi.fn(),
    addRemote: vi.fn(),
    deleteRemote: vi.fn(),
    init: vi.fn(),
    resolveRef: vi.fn(),
  },
}));

// Mock git-fs
vi.mock('../git-fs', () => ({
  fs: {
    promises: {
      mkdir: vi.fn().mockResolvedValue(undefined),
    },
  },
  http: {},
}));

// Mock expo-file-system

const mockGit = git as Mocked<typeof git>;

describe('GitCloneService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getRepoBaseDir', () => {
    it('should return the repos directory under documentDirectory', () => {
      const baseDir = GitCloneService.getRepoBaseDir();
      expect(baseDir).toBe('/mock/documents/repos');
    });
  });

  describe('clone', () => {
    it('should clone a repository successfully', async () => {
      mockGit.clone.mockResolvedValue(undefined);

      const result = await GitCloneService.clone({
        url: 'https://github.com/user/repo.git',
        dir: '/mock/repos/repo',
      });

      expect(result.success).toBe(true);
      expect(mockGit.clone).toHaveBeenCalledWith(
        expect.objectContaining({
          dir: '/mock/repos/repo',
          url: 'https://github.com/user/repo.git',
          singleBranch: true,
        })
      );
    });

    it('should pass credentials as onAuth callback', async () => {
      mockGit.clone.mockResolvedValue(undefined);

      await GitCloneService.clone({
        url: 'https://github.com/user/repo.git',
        dir: '/mock/repos/repo',
        credentials: { password: 'ghp_token123' },
      });

      const callArgs = mockGit.clone.mock.calls[0][0];
      expect(callArgs.onAuth).toBeDefined();
      const auth = callArgs.onAuth!('https://github.com', {});
      expect(auth).toEqual({
        username: 'x-access-token',
        password: 'ghp_token123',
      });
    });

    it('should use provided username in credentials', async () => {
      mockGit.clone.mockResolvedValue(undefined);

      await GitCloneService.clone({
        url: 'https://github.com/user/repo.git',
        dir: '/mock/repos/repo',
        credentials: { username: 'myuser', password: 'ghp_token123' },
      });

      const callArgs = mockGit.clone.mock.calls[0][0];
      const auth = callArgs.onAuth!('https://github.com', {});
      expect(auth).toEqual({
        username: 'myuser',
        password: 'ghp_token123',
      });
    });

    it('should pass branch and depth options', async () => {
      mockGit.clone.mockResolvedValue(undefined);

      await GitCloneService.clone({
        url: 'https://github.com/user/repo.git',
        dir: '/mock/repos/repo',
        branch: 'develop',
        depth: 1,
        singleBranch: false,
      });

      expect(mockGit.clone).toHaveBeenCalledWith(
        expect.objectContaining({
          ref: 'develop',
          depth: 1,
          singleBranch: false,
        })
      );
    });

    it('should invoke onProgress callback with normalized progress', async () => {
      mockGit.clone.mockImplementation(async (args: any) => {
        if (args.onProgress) {
          args.onProgress({ phase: 'Counting objects', loaded: 50, total: 100 });
        }
      });

      const onProgress = vi.fn();
      await GitCloneService.clone({
        url: 'https://github.com/user/repo.git',
        dir: '/mock/repos/repo',
        onProgress,
      });

      expect(onProgress).toHaveBeenCalledWith({
        phase: 'Counting objects',
        loaded: 50,
        total: 100,
        percent: 50,
      });
    });

    it('should return error on failure', async () => {
      mockGit.clone.mockRejectedValue(new Error('Authentication failed'));

      const result = await GitCloneService.clone({
        url: 'https://github.com/user/repo.git',
        dir: '/mock/repos/repo',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Authentication failed');
    });

    it('should handle non-Error exceptions', async () => {
      mockGit.clone.mockRejectedValue('unknown error');

      const result = await GitCloneService.clone({
        url: 'https://github.com/user/repo.git',
        dir: '/mock/repos/repo',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Clone failed');
    });
  });

  describe('fetch', () => {
    it('should fetch from origin by default', async () => {
      mockGit.fetch.mockResolvedValue({
        defaultBranch: 'main',
        fetchHead: 'abc123',
        fetchHeadDescription: null,
        headers: {},
        pruned: [],
      });

      const result = await GitCloneService.fetch({ dir: '/mock/repos/repo' });

      expect(result.success).toBe(true);
      expect(mockGit.fetch).toHaveBeenCalledWith(
        expect.objectContaining({
          dir: '/mock/repos/repo',
          remote: 'origin',
        })
      );
    });

    it('should return error on fetch failure', async () => {
      mockGit.fetch.mockRejectedValue(new Error('Network error'));

      const result = await GitCloneService.fetch({ dir: '/mock/repos/repo' });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });
  });

  describe('pull', () => {
    it('should pull from remote successfully', async () => {
      mockGit.pull.mockResolvedValue(undefined);

      const result = await GitCloneService.pull({
        dir: '/mock/repos/repo',
        author: { name: 'Test', email: 'test@test.com' },
      });

      expect(result.success).toBe(true);
      expect(mockGit.pull).toHaveBeenCalledWith(
        expect.objectContaining({
          dir: '/mock/repos/repo',
          remote: 'origin',
          author: { name: 'Test', email: 'test@test.com', timestamp: undefined },
        })
      );
    });

    it('should return error on pull failure', async () => {
      mockGit.pull.mockRejectedValue(new Error('Merge conflict'));

      const result = await GitCloneService.pull({ dir: '/mock/repos/repo' });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Merge conflict');
    });
  });

  describe('push', () => {
    it('should push to remote successfully', async () => {
      mockGit.push.mockResolvedValue({
        ok: true,
        error: null,
        refs: {},
        headers: {},
      });

      const result = await GitCloneService.push({
        dir: '/mock/repos/repo',
        credentials: { password: 'ghp_token' },
      });

      expect(result.success).toBe(true);
      expect(mockGit.push).toHaveBeenCalledWith(
        expect.objectContaining({
          dir: '/mock/repos/repo',
          remote: 'origin',
          force: false,
        })
      );
    });

    it('should support force push', async () => {
      mockGit.push.mockResolvedValue({
        ok: true,
        error: null,
        refs: {},
        headers: {},
      });

      await GitCloneService.push({
        dir: '/mock/repos/repo',
        force: true,
      });

      expect(mockGit.push).toHaveBeenCalledWith(
        expect.objectContaining({ force: true })
      );
    });

    it('should return error on push failure', async () => {
      mockGit.push.mockRejectedValue(new Error('Push rejected'));

      const result = await GitCloneService.push({ dir: '/mock/repos/repo' });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Push rejected');
    });
  });

  describe('listRemotes', () => {
    it('should list remotes successfully', async () => {
      mockGit.listRemotes.mockResolvedValue([
        { remote: 'origin', url: 'https://github.com/user/repo.git' },
        { remote: 'upstream', url: 'https://github.com/org/repo.git' },
      ]);

      const result = await GitCloneService.listRemotes('/mock/repos/repo');

      expect(result.success).toBe(true);
      expect(result.data).toEqual([
        { name: 'origin', url: 'https://github.com/user/repo.git' },
        { name: 'upstream', url: 'https://github.com/org/repo.git' },
      ]);
    });

    it('should return error on failure', async () => {
      mockGit.listRemotes.mockRejectedValue(new Error('Not a git repo'));

      const result = await GitCloneService.listRemotes('/mock/repos/repo');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Not a git repo');
    });
  });

  describe('addRemote', () => {
    it('should add a remote successfully', async () => {
      mockGit.addRemote.mockResolvedValue(undefined);

      const result = await GitCloneService.addRemote(
        '/mock/repos/repo',
        'upstream',
        'https://github.com/org/repo.git'
      );

      expect(result.success).toBe(true);
      expect(mockGit.addRemote).toHaveBeenCalledWith(
        expect.objectContaining({
          remote: 'upstream',
          url: 'https://github.com/org/repo.git',
        })
      );
    });
  });

  describe('deleteRemote', () => {
    it('should delete a remote successfully', async () => {
      mockGit.deleteRemote.mockResolvedValue(undefined);

      const result = await GitCloneService.deleteRemote('/mock/repos/repo', 'upstream');

      expect(result.success).toBe(true);
      expect(mockGit.deleteRemote).toHaveBeenCalledWith(
        expect.objectContaining({ remote: 'upstream' })
      );
    });
  });

  describe('init', () => {
    it('should initialize a repository with default branch', async () => {
      mockGit.init.mockResolvedValue(undefined);

      const result = await GitCloneService.init('/mock/repos/new-repo');

      expect(result.success).toBe(true);
      expect(mockGit.init).toHaveBeenCalledWith(
        expect.objectContaining({
          dir: '/mock/repos/new-repo',
          defaultBranch: 'main',
        })
      );
    });

    it('should accept a custom default branch', async () => {
      mockGit.init.mockResolvedValue(undefined);

      const result = await GitCloneService.init('/mock/repos/new-repo', 'develop');

      expect(result.success).toBe(true);
      expect(mockGit.init).toHaveBeenCalledWith(
        expect.objectContaining({ defaultBranch: 'develop' })
      );
    });

    it('should return error on init failure', async () => {
      mockGit.init.mockRejectedValue(new Error('Permission denied'));

      const result = await GitCloneService.init('/mock/repos/new-repo');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Permission denied');
    });
  });

  describe('isRepository', () => {
    it('should return true for a valid repository', async () => {
      mockGit.resolveRef.mockResolvedValue('abc123');

      const result = await GitCloneService.isRepository('/mock/repos/repo');

      expect(result).toBe(true);
    });

    it('should return false for a non-repository', async () => {
      mockGit.resolveRef.mockRejectedValue(new Error('Not a git repository'));

      const result = await GitCloneService.isRepository('/mock/not-a-repo');

      expect(result).toBe(false);
    });
  });

  describe('getHead', () => {
    it('should return the HEAD commit SHA', async () => {
      mockGit.resolveRef.mockResolvedValue('abc123def456');

      const result = await GitCloneService.getHead('/mock/repos/repo');

      expect(result.success).toBe(true);
      expect(result.data).toBe('abc123def456');
    });

    it('should return error when HEAD is unresolvable', async () => {
      mockGit.resolveRef.mockRejectedValue(new Error('HEAD not found'));

      const result = await GitCloneService.getHead('/mock/repos/repo');

      expect(result.success).toBe(false);
      expect(result.error).toBe('HEAD not found');
    });
  });

  describe('cleanup', () => {
    it('should delete the repository directory', async () => {
      const FileSystem = require('expo-file-system');

      const result = await GitCloneService.cleanup('/mock/repos/repo');

      expect(result.success).toBe(true);
      expect(FileSystem.deleteAsync).toHaveBeenCalledWith('/mock/repos/repo', {
        idempotent: true,
      });
    });

    it('should return error on cleanup failure', async () => {
      const FileSystem = require('expo-file-system');
      FileSystem.deleteAsync.mockRejectedValueOnce(new Error('Busy'));

      const result = await GitCloneService.cleanup('/mock/repos/repo');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Busy');
    });
  });
});
