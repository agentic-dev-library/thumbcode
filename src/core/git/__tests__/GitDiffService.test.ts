/**
 * GitDiffService Tests
 *
 * Tests for status, diff between commits, and working directory diff operations.
 */

import git from 'isomorphic-git';

import { GitDiffService } from '../GitDiffService';

// Mock isomorphic-git
vi.mock('isomorphic-git', () => ({
  __esModule: true,
  default: {
    statusMatrix: vi.fn(),
    resolveRef: vi.fn(),
    readCommit: vi.fn(),
    readTree: vi.fn(),
    readBlob: vi.fn(),
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

// Mock diff module
vi.mock('diff', () => ({
  createPatch: vi.fn().mockReturnValue('--- old\n+++ new\n@@ -1,1 +1,1 @@\n-old line\n+new line\n'),
}));

const mockGit = git as Mocked<typeof git>;

describe('GitDiffService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('status', () => {
    it('should return file statuses excluding unmodified files', async () => {
      mockGit.statusMatrix.mockResolvedValue([
        ['src/index.ts', 1, 2, 1], // modified (unstaged)
        ['src/new.ts', 0, 2, 0], // untracked
        ['src/staged.ts', 0, 2, 2], // added (staged)
        ['src/unchanged.ts', 1, 1, 1], // unmodified
      ]);

      const result = await GitDiffService.status('/mock/repos/repo');

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(3); // unmodified filtered out
      expect(result.data).toEqual([
        { path: 'src/index.ts', status: 'modified', staged: false },
        { path: 'src/new.ts', status: 'untracked', staged: false },
        { path: 'src/staged.ts', status: 'added', staged: true },
      ]);
    });

    it('should detect deleted files', async () => {
      mockGit.statusMatrix.mockResolvedValue([
        ['deleted.ts', 1, 0, 0], // deleted (unstaged)
        ['deleted2.ts', 1, 0, 3], // deleted (staged)
      ]);

      const result = await GitDiffService.status('/mock/repos/repo');

      expect(result.success).toBe(true);
      expect(result.data).toEqual([
        { path: 'deleted.ts', status: 'deleted', staged: false },
        { path: 'deleted2.ts', status: 'deleted', staged: true },
      ]);
    });

    it('should detect staged modified files', async () => {
      mockGit.statusMatrix.mockResolvedValue([
        ['modified.ts', 1, 2, 2], // modified and staged
      ]);

      const result = await GitDiffService.status('/mock/repos/repo');

      expect(result.success).toBe(true);
      expect(result.data?.[0]).toEqual({
        path: 'modified.ts',
        status: 'modified',
        staged: true,
      });
    });

    it('should return empty array for clean repository', async () => {
      mockGit.statusMatrix.mockResolvedValue([['file.ts', 1, 1, 1]]);

      const result = await GitDiffService.status('/mock/repos/repo');

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(0);
    });

    it('should return error on failure', async () => {
      mockGit.statusMatrix.mockRejectedValue(new Error('Not a git repository'));

      const result = await GitDiffService.status('/mock/repos/repo');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Not a git repository');
    });

    it('should handle unknown status combinations as modified', async () => {
      mockGit.statusMatrix.mockResolvedValue([
        ['weird.ts', 1, 2, 3], // unusual combination
      ]);

      const result = await GitDiffService.status('/mock/repos/repo');

      expect(result.success).toBe(true);
      expect(result.data?.[0].status).toBe('modified');
    });
  });

  describe('diff', () => {
    it('should compute diff between two commits', async () => {
      mockGit.resolveRef.mockResolvedValueOnce('oid-a').mockResolvedValueOnce('oid-b');

      mockGit.readCommit
        .mockResolvedValueOnce({
          oid: 'oid-a',
          commit: {
            tree: 'tree-a',
            parent: [],
            message: '',
            author: {} as any,
            committer: {} as any,
          },
          payload: '',
        })
        .mockResolvedValueOnce({
          oid: 'oid-b',
          commit: {
            tree: 'tree-b',
            parent: ['oid-a'],
            message: '',
            author: {} as any,
            committer: {} as any,
          },
          payload: '',
        });

      // Tree A has one file, Tree B has it modified plus a new file
      mockGit.readTree
        .mockResolvedValueOnce({
          oid: 'tree-a',
          tree: [{ mode: '100644', path: 'file.ts', oid: 'blob-a1', type: 'blob' }],
        })
        .mockResolvedValueOnce({
          oid: 'tree-b',
          tree: [
            { mode: '100644', path: 'file.ts', oid: 'blob-b1', type: 'blob' },
            { mode: '100644', path: 'new.ts', oid: 'blob-b2', type: 'blob' },
          ],
        });

      // Mock readBlob for modified file
      mockGit.readBlob
        .mockResolvedValueOnce({ oid: 'blob-a1', blob: new TextEncoder().encode('old content') })
        .mockResolvedValueOnce({ oid: 'blob-b1', blob: new TextEncoder().encode('new content') })
        // Mock readBlob for added file
        .mockResolvedValueOnce({ oid: 'blob-b2', blob: new TextEncoder().encode('added content') });

      const result = await GitDiffService.diff('/mock/repos/repo', 'HEAD~1', 'HEAD');

      expect(result.success).toBe(true);
      expect(result.data?.files).toHaveLength(2);
      expect(result.data?.stats.filesChanged).toBe(2);
    });

    it('should detect deleted files in diff', async () => {
      mockGit.resolveRef.mockResolvedValueOnce('oid-a').mockResolvedValueOnce('oid-b');

      mockGit.readCommit
        .mockResolvedValueOnce({
          oid: 'oid-a',
          commit: {
            tree: 'tree-a',
            parent: [],
            message: '',
            author: {} as any,
            committer: {} as any,
          },
          payload: '',
        })
        .mockResolvedValueOnce({
          oid: 'oid-b',
          commit: {
            tree: 'tree-b',
            parent: ['oid-a'],
            message: '',
            author: {} as any,
            committer: {} as any,
          },
          payload: '',
        });

      // Tree A has a file, Tree B is empty
      mockGit.readTree
        .mockResolvedValueOnce({
          oid: 'tree-a',
          tree: [{ mode: '100644', path: 'removed.ts', oid: 'blob-a1', type: 'blob' }],
        })
        .mockResolvedValueOnce({
          oid: 'tree-b',
          tree: [],
        });

      mockGit.readBlob.mockResolvedValueOnce({
        oid: 'blob-a1',
        blob: new TextEncoder().encode('deleted content'),
      });

      const result = await GitDiffService.diff('/mock/repos/repo', 'HEAD~1', 'HEAD');

      expect(result.success).toBe(true);
      expect(result.data?.files[0].type).toBe('delete');
    });

    it('should skip unchanged files (same blob OID)', async () => {
      mockGit.resolveRef.mockResolvedValueOnce('oid-a').mockResolvedValueOnce('oid-b');

      mockGit.readCommit
        .mockResolvedValueOnce({
          oid: 'oid-a',
          commit: {
            tree: 'tree-a',
            parent: [],
            message: '',
            author: {} as any,
            committer: {} as any,
          },
          payload: '',
        })
        .mockResolvedValueOnce({
          oid: 'oid-b',
          commit: {
            tree: 'tree-b',
            parent: ['oid-a'],
            message: '',
            author: {} as any,
            committer: {} as any,
          },
          payload: '',
        });

      // Both trees have the same blob OID for the file
      mockGit.readTree
        .mockResolvedValueOnce({
          oid: 'tree-a',
          tree: [{ mode: '100644', path: 'same.ts', oid: 'same-blob', type: 'blob' }],
        })
        .mockResolvedValueOnce({
          oid: 'tree-b',
          tree: [{ mode: '100644', path: 'same.ts', oid: 'same-blob', type: 'blob' }],
        });

      const result = await GitDiffService.diff('/mock/repos/repo', 'HEAD~1', 'HEAD');

      expect(result.success).toBe(true);
      expect(result.data?.files).toHaveLength(0);
      expect(result.data?.stats.filesChanged).toBe(0);
    });

    it('should return error on failure', async () => {
      mockGit.resolveRef.mockRejectedValue(new Error('Bad ref'));

      const result = await GitDiffService.diff('/mock/repos/repo', 'bad-ref', 'HEAD');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Bad ref');
    });
  });

  describe('diffWorkingDir', () => {
    it('should compute diff for working directory changes', async () => {
      const { Filesystem } = await import('@capacitor/filesystem');

      mockGit.statusMatrix.mockResolvedValue([
        ['modified.ts', 1, 2, 1], // modified
        ['new.ts', 0, 2, 0], // new untracked
        ['unchanged.ts', 1, 1, 1], // unchanged (skipped)
      ]);

      mockGit.resolveRef.mockResolvedValue('head-oid');

      // readBlob for modified file old content
      mockGit.readBlob.mockResolvedValueOnce({
        oid: 'blob1',
        blob: new TextEncoder().encode('old modified content'),
      });

      // Filesystem.readFile returns { data: string }
      vi.mocked(Filesystem.readFile)
        .mockResolvedValueOnce({ data: 'new modified content' } as never)
        .mockResolvedValueOnce({ data: 'brand new content' } as never);

      const result = await GitDiffService.diffWorkingDir('/mock/repos/repo');

      expect(result.success).toBe(true);
      expect(result.data?.files).toHaveLength(2);
      expect(result.data?.stats.filesChanged).toBe(2);
    });

    it('should handle deleted files in working directory', async () => {
      mockGit.statusMatrix.mockResolvedValue([
        ['deleted.ts', 1, 0, 0], // deleted
      ]);

      mockGit.resolveRef.mockResolvedValue('head-oid');

      mockGit.readBlob.mockResolvedValueOnce({
        oid: 'blob1',
        blob: new TextEncoder().encode('content before deletion'),
      });

      const result = await GitDiffService.diffWorkingDir('/mock/repos/repo');

      expect(result.success).toBe(true);
      expect(result.data?.files).toHaveLength(1);
      expect(result.data?.files[0].type).toBe('delete');
    });

    it('should return empty diff for clean working directory', async () => {
      mockGit.statusMatrix.mockResolvedValue([['clean.ts', 1, 1, 1]]);

      mockGit.resolveRef.mockResolvedValue('head-oid');

      const result = await GitDiffService.diffWorkingDir('/mock/repos/repo');

      expect(result.success).toBe(true);
      expect(result.data?.files).toHaveLength(0);
      expect(result.data?.stats.filesChanged).toBe(0);
    });

    it('should return error on failure', async () => {
      mockGit.statusMatrix.mockRejectedValue(new Error('Repo error'));

      const result = await GitDiffService.diffWorkingDir('/mock/repos/repo');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Repo error');
    });
  });
});
