/**
 * Git Service Tests
 *
 * Note: These tests mock isomorphic-git and expo-file-system
 * since actual Git operations and file system access are not available in Jest.
 */

import * as FileSystem from 'expo-file-system';
import git from 'isomorphic-git';

import { GitService } from '../GitService';

// Mock expo-file-system
jest.mock('expo-file-system', () => ({
  documentDirectory: '/mock/documents/',
  readAsStringAsync: jest.fn(),
  writeAsStringAsync: jest.fn(),
  deleteAsync: jest.fn(),
  readDirectoryAsync: jest.fn(),
  makeDirectoryAsync: jest.fn(),
  getInfoAsync: jest.fn(),
  EncodingType: {
    UTF8: 'utf8',
    Base64: 'base64',
  },
}));

// Mock isomorphic-git
jest.mock('isomorphic-git', () => ({
  clone: jest.fn(),
  fetch: jest.fn(),
  pull: jest.fn(),
  push: jest.fn(),
  commit: jest.fn(),
  add: jest.fn(),
  remove: jest.fn(),
  branch: jest.fn(),
  deleteBranch: jest.fn(),
  checkout: jest.fn(),
  currentBranch: jest.fn(),
  listBranches: jest.fn(),
  resolveRef: jest.fn(),
  statusMatrix: jest.fn(),
  log: jest.fn(),
  readCommit: jest.fn(),
  listRemotes: jest.fn(),
  addRemote: jest.fn(),
  deleteRemote: jest.fn(),
  init: jest.fn(),
}));

// Mock isomorphic-git/http/web
jest.mock('isomorphic-git/http/web', () => ({}));

// Mock CredentialService
jest.mock('../../credentials', () => ({
  CredentialService: {
    retrieve: jest.fn(),
  },
}));

const mockDir = '/mock/documents/repos/test-repo';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GitService', () => {
  describe('getRepoBaseDir', () => {
    it('should return the correct base directory', () => {
      const baseDir = GitService.getRepoBaseDir();
      expect(baseDir).toBe('/mock/documents/repos');
    });
  });

  describe('clone', () => {
    it('should clone a repository successfully', async () => {
      (git.clone as jest.Mock).mockResolvedValue(undefined);
      (FileSystem.makeDirectoryAsync as jest.Mock).mockResolvedValue(undefined);

      const result = await GitService.clone({
        url: 'https://github.com/user/repo.git',
        dir: mockDir,
        credentials: { password: 'test-token' },
      });

      expect(result.success).toBe(true);
      expect(git.clone).toHaveBeenCalled();
    });

    it('should return error when clone fails', async () => {
      (git.clone as jest.Mock).mockRejectedValue(new Error('Clone failed'));
      (FileSystem.makeDirectoryAsync as jest.Mock).mockResolvedValue(undefined);

      const result = await GitService.clone({
        url: 'https://github.com/user/repo.git',
        dir: mockDir,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Clone failed');
    });

    it('should call progress callback during clone', async () => {
      const progressCallback = jest.fn();
      (git.clone as jest.Mock).mockImplementation(async (options) => {
        if (options.onProgress) {
          options.onProgress({ phase: 'Receiving objects', loaded: 50, total: 100 });
        }
      });
      (FileSystem.makeDirectoryAsync as jest.Mock).mockResolvedValue(undefined);

      await GitService.clone({
        url: 'https://github.com/user/repo.git',
        dir: mockDir,
        onProgress: progressCallback,
      });

      expect(progressCallback).toHaveBeenCalledWith({
        phase: 'Receiving objects',
        loaded: 50,
        total: 100,
        percent: 50,
      });
    });
  });

  describe('fetch', () => {
    it('should fetch from remote successfully', async () => {
      (git.fetch as jest.Mock).mockResolvedValue(undefined);

      const result = await GitService.fetch({
        dir: mockDir,
        remote: 'origin',
        credentials: { password: 'test-token' },
      });

      expect(result.success).toBe(true);
      expect(git.fetch).toHaveBeenCalled();
    });

    it('should return error when fetch fails', async () => {
      (git.fetch as jest.Mock).mockRejectedValue(new Error('Fetch failed'));

      const result = await GitService.fetch({ dir: mockDir });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Fetch failed');
    });
  });

  describe('pull', () => {
    it('should pull from remote successfully', async () => {
      (git.pull as jest.Mock).mockResolvedValue(undefined);

      const result = await GitService.pull({
        dir: mockDir,
        credentials: { password: 'test-token' },
        author: { name: 'Test User', email: 'test@example.com' },
      });

      expect(result.success).toBe(true);
      expect(git.pull).toHaveBeenCalled();
    });

    it('should return error when pull fails', async () => {
      (git.pull as jest.Mock).mockRejectedValue(new Error('Pull failed'));

      const result = await GitService.pull({ dir: mockDir });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Pull failed');
    });
  });

  describe('push', () => {
    it('should push to remote successfully', async () => {
      (git.push as jest.Mock).mockResolvedValue(undefined);

      const result = await GitService.push({
        dir: mockDir,
        credentials: { password: 'test-token' },
      });

      expect(result.success).toBe(true);
      expect(git.push).toHaveBeenCalled();
    });

    it('should return error when push fails', async () => {
      (git.push as jest.Mock).mockRejectedValue(new Error('Push failed'));

      const result = await GitService.push({ dir: mockDir });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Push failed');
    });
  });

  describe('commit', () => {
    it('should create a commit successfully', async () => {
      (git.commit as jest.Mock).mockResolvedValue('abc123');

      const result = await GitService.commit({
        dir: mockDir,
        message: 'Test commit',
        author: { name: 'Test User', email: 'test@example.com' },
      });

      expect(result.success).toBe(true);
      expect(result.data).toBe('abc123');
      expect(git.commit).toHaveBeenCalled();
    });

    it('should return error when commit fails', async () => {
      (git.commit as jest.Mock).mockRejectedValue(new Error('Commit failed'));

      const result = await GitService.commit({
        dir: mockDir,
        message: 'Test commit',
        author: { name: 'Test User', email: 'test@example.com' },
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Commit failed');
    });
  });

  describe('stage', () => {
    it('should stage a single file successfully', async () => {
      (git.add as jest.Mock).mockResolvedValue(undefined);

      const result = await GitService.stage({
        dir: mockDir,
        filepath: 'src/file.ts',
      });

      expect(result.success).toBe(true);
      expect(git.add).toHaveBeenCalledTimes(1);
    });

    it('should stage multiple files successfully', async () => {
      (git.add as jest.Mock).mockResolvedValue(undefined);

      const result = await GitService.stage({
        dir: mockDir,
        filepath: ['src/file1.ts', 'src/file2.ts'],
      });

      expect(result.success).toBe(true);
      expect(git.add).toHaveBeenCalledTimes(2);
    });

    it('should return error when staging fails', async () => {
      (git.add as jest.Mock).mockRejectedValue(new Error('Stage failed'));

      const result = await GitService.stage({
        dir: mockDir,
        filepath: 'src/file.ts',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Stage failed');
    });
  });

  describe('unstage', () => {
    it('should unstage a file successfully', async () => {
      (git.remove as jest.Mock).mockResolvedValue(undefined);

      const result = await GitService.unstage({
        dir: mockDir,
        filepath: 'src/file.ts',
      });

      expect(result.success).toBe(true);
      expect(git.remove).toHaveBeenCalled();
    });
  });

  describe('createBranch', () => {
    it('should create a branch successfully', async () => {
      (git.branch as jest.Mock).mockResolvedValue(undefined);

      const result = await GitService.createBranch({
        dir: mockDir,
        branch: 'feature/new-branch',
      });

      expect(result.success).toBe(true);
      expect(git.branch).toHaveBeenCalled();
    });

    it('should return error when branch creation fails', async () => {
      (git.branch as jest.Mock).mockRejectedValue(new Error('Branch exists'));

      const result = await GitService.createBranch({
        dir: mockDir,
        branch: 'existing-branch',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Branch exists');
    });
  });

  describe('deleteBranch', () => {
    it('should delete a branch successfully', async () => {
      (git.deleteBranch as jest.Mock).mockResolvedValue(undefined);

      const result = await GitService.deleteBranch(mockDir, 'feature/old-branch');

      expect(result.success).toBe(true);
      expect(git.deleteBranch).toHaveBeenCalled();
    });
  });

  describe('checkout', () => {
    it('should checkout a branch successfully', async () => {
      (git.checkout as jest.Mock).mockResolvedValue(undefined);

      const result = await GitService.checkout({
        dir: mockDir,
        ref: 'main',
      });

      expect(result.success).toBe(true);
      expect(git.checkout).toHaveBeenCalled();
    });

    it('should return error when checkout fails', async () => {
      (git.checkout as jest.Mock).mockRejectedValue(new Error('Checkout failed'));

      const result = await GitService.checkout({
        dir: mockDir,
        ref: 'non-existent',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Checkout failed');
    });
  });

  describe('currentBranch', () => {
    it('should return the current branch', async () => {
      (git.currentBranch as jest.Mock).mockResolvedValue('main');

      const result = await GitService.currentBranch(mockDir);

      expect(result.success).toBe(true);
      expect(result.data).toBe('main');
    });

    it('should return HEAD when detached', async () => {
      (git.currentBranch as jest.Mock).mockResolvedValue(undefined);

      const result = await GitService.currentBranch(mockDir);

      expect(result.success).toBe(true);
      expect(result.data).toBe('HEAD');
    });
  });

  describe('listBranches', () => {
    it('should list all branches', async () => {
      (git.listBranches as jest.Mock).mockResolvedValue(['main', 'develop', 'feature/test']);
      (git.currentBranch as jest.Mock).mockResolvedValue('main');
      (git.resolveRef as jest.Mock).mockResolvedValue('abc123');

      const result = await GitService.listBranches(mockDir);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(3);
      expect(result.data?.[0].name).toBe('main');
      expect(result.data?.[0].current).toBe(true);
    });
  });

  describe('status', () => {
    it('should return file statuses', async () => {
      (git.statusMatrix as jest.Mock).mockResolvedValue([
        ['modified.ts', 1, 2, 1], // modified, not staged
        ['added.ts', 0, 2, 2], // added, staged
        ['deleted.ts', 1, 0, 3], // deleted, staged
        ['untracked.ts', 0, 2, 0], // untracked
      ]);

      const result = await GitService.status(mockDir);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(4);

      const modified = result.data?.find((f) => f.path === 'modified.ts');
      expect(modified?.status).toBe('modified');
      expect(modified?.staged).toBe(false);

      const added = result.data?.find((f) => f.path === 'added.ts');
      expect(added?.status).toBe('added');
      expect(added?.staged).toBe(true);

      const deleted = result.data?.find((f) => f.path === 'deleted.ts');
      expect(deleted?.status).toBe('deleted');
      expect(deleted?.staged).toBe(true);

      const untracked = result.data?.find((f) => f.path === 'untracked.ts');
      expect(untracked?.status).toBe('untracked');
      expect(untracked?.staged).toBe(false);
    });

    it('should filter out unmodified files', async () => {
      (git.statusMatrix as jest.Mock).mockResolvedValue([
        ['unchanged.ts', 1, 1, 1], // unmodified
        ['modified.ts', 1, 2, 1], // modified
      ]);

      const result = await GitService.status(mockDir);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data?.[0].path).toBe('modified.ts');
    });
  });

  describe('log', () => {
    it('should return commit log', async () => {
      (git.log as jest.Mock).mockResolvedValue([
        {
          oid: 'abc123',
          commit: {
            message: 'First commit',
            author: { name: 'Test', email: 'test@test.com', timestamp: 1234567890 },
            committer: { name: 'Test', email: 'test@test.com', timestamp: 1234567890 },
            parent: [],
          },
        },
        {
          oid: 'def456',
          commit: {
            message: 'Second commit',
            author: { name: 'Test', email: 'test@test.com', timestamp: 1234567891 },
            committer: { name: 'Test', email: 'test@test.com', timestamp: 1234567891 },
            parent: ['abc123'],
          },
        },
      ]);

      const result = await GitService.log(mockDir, 10);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(result.data?.[0].oid).toBe('abc123');
      expect(result.data?.[0].message).toBe('First commit');
    });
  });

  describe('listRemotes', () => {
    it('should list all remotes', async () => {
      (git.listRemotes as jest.Mock).mockResolvedValue([
        { remote: 'origin', url: 'https://github.com/user/repo.git' },
        { remote: 'upstream', url: 'https://github.com/org/repo.git' },
      ]);

      const result = await GitService.listRemotes(mockDir);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(result.data?.[0].name).toBe('origin');
    });
  });

  describe('addRemote', () => {
    it('should add a remote successfully', async () => {
      (git.addRemote as jest.Mock).mockResolvedValue(undefined);

      const result = await GitService.addRemote(
        mockDir,
        'upstream',
        'https://github.com/org/repo.git'
      );

      expect(result.success).toBe(true);
      expect(git.addRemote).toHaveBeenCalled();
    });
  });

  describe('deleteRemote', () => {
    it('should delete a remote successfully', async () => {
      (git.deleteRemote as jest.Mock).mockResolvedValue(undefined);

      const result = await GitService.deleteRemote(mockDir, 'upstream');

      expect(result.success).toBe(true);
      expect(git.deleteRemote).toHaveBeenCalled();
    });
  });

  describe('init', () => {
    it('should initialize a repository successfully', async () => {
      (git.init as jest.Mock).mockResolvedValue(undefined);
      (FileSystem.makeDirectoryAsync as jest.Mock).mockResolvedValue(undefined);

      const result = await GitService.init(mockDir);

      expect(result.success).toBe(true);
      expect(git.init).toHaveBeenCalled();
    });
  });

  describe('isRepository', () => {
    it('should return true for a valid repository', async () => {
      (git.resolveRef as jest.Mock).mockResolvedValue('abc123');

      const result = await GitService.isRepository(mockDir);

      expect(result).toBe(true);
    });

    it('should return false for a non-repository', async () => {
      (git.resolveRef as jest.Mock).mockRejectedValue(new Error('Not a repository'));

      const result = await GitService.isRepository(mockDir);

      expect(result).toBe(false);
    });
  });

  describe('getHead', () => {
    it('should return the HEAD commit SHA', async () => {
      (git.resolveRef as jest.Mock).mockResolvedValue('abc123');

      const result = await GitService.getHead(mockDir);

      expect(result.success).toBe(true);
      expect(result.data).toBe('abc123');
    });
  });

  describe('cleanup', () => {
    it('should cleanup the repository directory', async () => {
      (FileSystem.deleteAsync as jest.Mock).mockResolvedValue(undefined);

      const result = await GitService.cleanup(mockDir);

      expect(result.success).toBe(true);
      expect(FileSystem.deleteAsync).toHaveBeenCalledWith(mockDir, { idempotent: true });
    });
  });
});
