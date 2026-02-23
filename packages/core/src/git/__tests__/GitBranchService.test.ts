/**
 * GitBranchService Tests
 *
 * Tests for branch creation, deletion, checkout, listing, and current branch operations.
 */

import git from 'isomorphic-git';

import { GitBranchService } from '../GitBranchService';

// Mock isomorphic-git
vi.mock('isomorphic-git', () => ({
  __esModule: true,
  default: {
    branch: vi.fn(),
    deleteBranch: vi.fn(),
    checkout: vi.fn(),
    currentBranch: vi.fn(),
    listBranches: vi.fn(),
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

const mockGit = git as Mocked<typeof git>;

describe('GitBranchService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createBranch', () => {
    it('should create a branch successfully', async () => {
      mockGit.branch.mockResolvedValue(undefined);

      const result = await GitBranchService.createBranch({
        dir: '/mock/repos/repo',
        branch: 'feature/new',
      });

      expect(result.success).toBe(true);
      expect(mockGit.branch).toHaveBeenCalledWith(
        expect.objectContaining({
          dir: '/mock/repos/repo',
          ref: 'feature/new',
          checkout: false,
        })
      );
    });

    it('should create a branch from a specific ref', async () => {
      mockGit.branch.mockResolvedValue(undefined);

      await GitBranchService.createBranch({
        dir: '/mock/repos/repo',
        branch: 'feature/new',
        ref: 'abc123',
      });

      expect(mockGit.branch).toHaveBeenCalledWith(
        expect.objectContaining({
          object: 'abc123',
        })
      );
    });

    it('should create and checkout a branch', async () => {
      mockGit.branch.mockResolvedValue(undefined);

      await GitBranchService.createBranch({
        dir: '/mock/repos/repo',
        branch: 'feature/new',
        checkout: true,
      });

      expect(mockGit.branch).toHaveBeenCalledWith(
        expect.objectContaining({
          checkout: true,
        })
      );
    });

    it('should return error when branch already exists', async () => {
      mockGit.branch.mockRejectedValue(new Error('Branch already exists'));

      const result = await GitBranchService.createBranch({
        dir: '/mock/repos/repo',
        branch: 'main',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Branch already exists');
    });

    it('should handle non-Error exceptions', async () => {
      mockGit.branch.mockRejectedValue('unexpected');

      const result = await GitBranchService.createBranch({
        dir: '/mock/repos/repo',
        branch: 'test',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Create branch failed');
    });
  });

  describe('deleteBranch', () => {
    it('should delete a branch successfully', async () => {
      mockGit.deleteBranch.mockResolvedValue(undefined);

      const result = await GitBranchService.deleteBranch('/mock/repos/repo', 'feature/old');

      expect(result.success).toBe(true);
      expect(mockGit.deleteBranch).toHaveBeenCalledWith(
        expect.objectContaining({
          dir: '/mock/repos/repo',
          ref: 'feature/old',
        })
      );
    });

    it('should return error when deleting non-existent branch', async () => {
      mockGit.deleteBranch.mockRejectedValue(new Error('Branch not found'));

      const result = await GitBranchService.deleteBranch('/mock/repos/repo', 'nonexistent');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Branch not found');
    });
  });

  describe('checkout', () => {
    it('should checkout a branch successfully', async () => {
      mockGit.checkout.mockResolvedValue(undefined);

      const result = await GitBranchService.checkout({
        dir: '/mock/repos/repo',
        ref: 'develop',
      });

      expect(result.success).toBe(true);
      expect(mockGit.checkout).toHaveBeenCalledWith(
        expect.objectContaining({
          dir: '/mock/repos/repo',
          ref: 'develop',
          force: false,
        })
      );
    });

    it('should support force checkout', async () => {
      mockGit.checkout.mockResolvedValue(undefined);

      await GitBranchService.checkout({
        dir: '/mock/repos/repo',
        ref: 'develop',
        force: true,
      });

      expect(mockGit.checkout).toHaveBeenCalledWith(expect.objectContaining({ force: true }));
    });

    it('should return error on checkout failure', async () => {
      mockGit.checkout.mockRejectedValue(new Error('Uncommitted changes'));

      const result = await GitBranchService.checkout({
        dir: '/mock/repos/repo',
        ref: 'develop',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Uncommitted changes');
    });
  });

  describe('currentBranch', () => {
    it('should return the current branch name', async () => {
      mockGit.currentBranch.mockResolvedValue('main');

      const result = await GitBranchService.currentBranch('/mock/repos/repo');

      expect(result.success).toBe(true);
      expect(result.data).toBe('main');
    });

    it('should return HEAD when in detached state', async () => {
      mockGit.currentBranch.mockResolvedValue(undefined);

      const result = await GitBranchService.currentBranch('/mock/repos/repo');

      expect(result.success).toBe(true);
      expect(result.data).toBe('HEAD');
    });

    it('should return error on failure', async () => {
      mockGit.currentBranch.mockRejectedValue(new Error('Not a git repo'));

      const result = await GitBranchService.currentBranch('/mock/repos/repo');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Not a git repo');
    });
  });

  describe('listBranches', () => {
    it('should list local branches with current marker', async () => {
      mockGit.listBranches.mockResolvedValue(['main', 'develop', 'feature/x']);
      mockGit.currentBranch.mockResolvedValue('main');
      mockGit.resolveRef
        .mockResolvedValueOnce('sha1')
        .mockResolvedValueOnce('sha2')
        .mockResolvedValueOnce('sha3');

      const result = await GitBranchService.listBranches('/mock/repos/repo');

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(3);
      expect(result.data?.[0]).toEqual({
        name: 'main',
        current: true,
        commit: 'sha1',
      });
      expect(result.data?.[1]).toEqual({
        name: 'develop',
        current: false,
        commit: 'sha2',
      });
    });

    it('should list remote branches without current marker', async () => {
      mockGit.listBranches.mockResolvedValue(['main', 'develop']);
      mockGit.currentBranch.mockResolvedValue('main');
      mockGit.resolveRef.mockResolvedValueOnce('sha1').mockResolvedValueOnce('sha2');

      const result = await GitBranchService.listBranches('/mock/repos/repo', 'origin');

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      // Remote branches should never be marked as current
      expect(result.data?.[0].current).toBe(false);
      expect(result.data?.[1].current).toBe(false);
    });

    it('should return error on failure', async () => {
      mockGit.listBranches.mockRejectedValue(new Error('Repository error'));

      const result = await GitBranchService.listBranches('/mock/repos/repo');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Repository error');
    });
  });
});
