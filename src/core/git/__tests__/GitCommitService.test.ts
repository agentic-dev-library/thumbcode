/**
 * GitCommitService Tests
 *
 * Tests for commit, stage, unstage, and log operations.
 */

import git from 'isomorphic-git';

import { GitCommitService } from '../GitCommitService';

// Mock isomorphic-git
vi.mock('isomorphic-git', () => ({
  __esModule: true,
  default: {
    commit: vi.fn(),
    add: vi.fn(),
    remove: vi.fn(),
    log: vi.fn(),
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

const mockGit = git as Mocked<typeof git>;

describe('GitCommitService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('commit', () => {
    it('should create a commit and return the SHA', async () => {
      mockGit.commit.mockResolvedValue('abc123def456');

      const result = await GitCommitService.commit({
        dir: '/mock/repos/repo',
        message: 'feat: add new feature',
        author: { name: 'Test User', email: 'test@example.com' },
      });

      expect(result.success).toBe(true);
      expect(result.data).toBe('abc123def456');
      expect(mockGit.commit).toHaveBeenCalledWith(
        expect.objectContaining({
          dir: '/mock/repos/repo',
          message: 'feat: add new feature',
          author: {
            name: 'Test User',
            email: 'test@example.com',
            timestamp: undefined,
          },
        })
      );
    });

    it('should support separate committer information', async () => {
      mockGit.commit.mockResolvedValue('sha456');

      await GitCommitService.commit({
        dir: '/mock/repos/repo',
        message: 'fix: bug fix',
        author: { name: 'Author', email: 'author@example.com' },
        committer: { name: 'Committer', email: 'committer@example.com', timestamp: 1700000000 },
      });

      expect(mockGit.commit).toHaveBeenCalledWith(
        expect.objectContaining({
          committer: {
            name: 'Committer',
            email: 'committer@example.com',
            timestamp: 1700000000,
          },
        })
      );
    });

    it('should omit committer when not provided', async () => {
      mockGit.commit.mockResolvedValue('sha789');

      await GitCommitService.commit({
        dir: '/mock/repos/repo',
        message: 'chore: update',
        author: { name: 'Test', email: 'test@test.com' },
      });

      expect(mockGit.commit).toHaveBeenCalledWith(
        expect.objectContaining({
          committer: undefined,
        })
      );
    });

    it('should return error on commit failure', async () => {
      mockGit.commit.mockRejectedValue(new Error('Nothing to commit'));

      const result = await GitCommitService.commit({
        dir: '/mock/repos/repo',
        message: 'empty commit',
        author: { name: 'Test', email: 'test@test.com' },
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Nothing to commit');
    });

    it('should handle non-Error exceptions', async () => {
      mockGit.commit.mockRejectedValue(42);

      const result = await GitCommitService.commit({
        dir: '/mock/repos/repo',
        message: 'test',
        author: { name: 'Test', email: 'test@test.com' },
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Commit failed');
    });
  });

  describe('stage', () => {
    it('should stage a single file', async () => {
      mockGit.add.mockResolvedValue(undefined);

      const result = await GitCommitService.stage({
        dir: '/mock/repos/repo',
        filepath: 'src/index.ts',
      });

      expect(result.success).toBe(true);
      expect(mockGit.add).toHaveBeenCalledTimes(1);
      expect(mockGit.add).toHaveBeenCalledWith(
        expect.objectContaining({
          dir: '/mock/repos/repo',
          filepath: 'src/index.ts',
        })
      );
    });

    it('should stage multiple files', async () => {
      mockGit.add.mockResolvedValue(undefined);

      const result = await GitCommitService.stage({
        dir: '/mock/repos/repo',
        filepath: ['src/a.ts', 'src/b.ts', 'src/c.ts'],
      });

      expect(result.success).toBe(true);
      expect(mockGit.add).toHaveBeenCalledTimes(3);
    });

    it('should return error when staging fails', async () => {
      mockGit.add.mockRejectedValue(new Error('File not found'));

      const result = await GitCommitService.stage({
        dir: '/mock/repos/repo',
        filepath: 'nonexistent.ts',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('File not found');
    });
  });

  describe('unstage', () => {
    it('should unstage a single file', async () => {
      mockGit.remove.mockResolvedValue(undefined);

      const result = await GitCommitService.unstage({
        dir: '/mock/repos/repo',
        filepath: 'src/index.ts',
      });

      expect(result.success).toBe(true);
      expect(mockGit.remove).toHaveBeenCalledTimes(1);
      expect(mockGit.remove).toHaveBeenCalledWith(
        expect.objectContaining({
          dir: '/mock/repos/repo',
          filepath: 'src/index.ts',
        })
      );
    });

    it('should unstage multiple files', async () => {
      mockGit.remove.mockResolvedValue(undefined);

      const result = await GitCommitService.unstage({
        dir: '/mock/repos/repo',
        filepath: ['src/a.ts', 'src/b.ts'],
      });

      expect(result.success).toBe(true);
      expect(mockGit.remove).toHaveBeenCalledTimes(2);
    });

    it('should return error when unstaging fails', async () => {
      mockGit.remove.mockRejectedValue(new Error('Not in index'));

      const result = await GitCommitService.unstage({
        dir: '/mock/repos/repo',
        filepath: 'unknown.ts',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Not in index');
    });
  });

  describe('log', () => {
    it('should return commit log with default depth', async () => {
      mockGit.log.mockResolvedValue([
        {
          oid: 'sha1',
          commit: {
            message: 'first commit',
            tree: 'tree1',
            parent: [],
            author: {
              name: 'Dev',
              email: 'dev@test.com',
              timestamp: 1700000000,
              timezoneOffset: 0,
            },
            committer: {
              name: 'Dev',
              email: 'dev@test.com',
              timestamp: 1700000000,
              timezoneOffset: 0,
            },
          },
          payload: '',
        },
        {
          oid: 'sha2',
          commit: {
            message: 'second commit',
            tree: 'tree2',
            parent: ['sha1'],
            author: {
              name: 'Dev',
              email: 'dev@test.com',
              timestamp: 1700000100,
              timezoneOffset: 0,
            },
            committer: {
              name: 'Dev',
              email: 'dev@test.com',
              timestamp: 1700000100,
              timezoneOffset: 0,
            },
          },
          payload: '',
        },
      ]);

      const result = await GitCommitService.log('/mock/repos/repo');

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(result.data?.[0]).toEqual({
        oid: 'sha1',
        message: 'first commit',
        author: { name: 'Dev', email: 'dev@test.com', timestamp: 1700000000 },
        committer: { name: 'Dev', email: 'dev@test.com', timestamp: 1700000000 },
        parents: [],
      });
      expect(result.data?.[1].parents).toEqual(['sha1']);
      expect(mockGit.log).toHaveBeenCalledWith(expect.objectContaining({ depth: 20 }));
    });

    it('should accept custom depth', async () => {
      mockGit.log.mockResolvedValue([]);

      await GitCommitService.log('/mock/repos/repo', 5);

      expect(mockGit.log).toHaveBeenCalledWith(expect.objectContaining({ depth: 5 }));
    });

    it('should return error on log failure', async () => {
      mockGit.log.mockRejectedValue(new Error('No commits'));

      const result = await GitCommitService.log('/mock/repos/repo');

      expect(result.success).toBe(false);
      expect(result.error).toBe('No commits');
    });
  });
});
