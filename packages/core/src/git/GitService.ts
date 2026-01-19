/**
 * Git Service
 *
 * Provides mobile-native Git operations using isomorphic-git.
 * Integrates with expo-file-system for React Native compatibility.
 *
 * Usage:
 * ```typescript
 * import { GitService } from '@thumbcode/core/git';
 *
 * // Clone a repository
 * const result = await GitService.clone({
 *   url: 'https://github.com/user/repo.git',
 *   dir: '/path/to/local/repo',
 *   credentials: { password: token },
 *   onProgress: (event) => console.log(event.phase, event.percent),
 * });
 *
 * // Get status
 * const status = await GitService.status('/path/to/local/repo');
 * ```
 */

import * as Diff from 'diff';
import * as FileSystem from 'expo-file-system';
import git, { type HttpClient } from 'isomorphic-git';
import { gitHttpClient } from './GitHttpClient';

// HTTP client adapter - bridges our implementation to isomorphic-git's HttpClient type
// Our implementation uses AsyncIterableIterator which works with isomorphic-git at runtime
// Using type assertion as the body types differ but are compatible at runtime
const http = gitHttpClient as unknown as HttpClient;

import type {
  BranchInfo,
  BranchOptions,
  CheckoutOptions,
  CloneOptions,
  CommitInfo,
  CommitOptions,
  DiffResult,
  DiffStats,
  FetchOptions,
  FileDiff,
  FileStatus,
  GitCredentials,
  GitResult,
  PullOptions,
  PushOptions,
  RemoteInfo,
  StageOptions,
} from './types';

/**
 * File system adapter for isomorphic-git
 * Uses expo-file-system for React Native compatibility
 */
const fs = {
  promises: {
    readFile: async (filepath: string, options?: { encoding?: string }) => {
      const content = await FileSystem.readAsStringAsync(filepath, {
        encoding:
          options?.encoding === 'utf8'
            ? FileSystem.EncodingType.UTF8
            : FileSystem.EncodingType.Base64,
      });
      if (options?.encoding === 'utf8') {
        return content;
      }
      // Return as Buffer-like for binary files
      return Buffer.from(content, 'base64');
    },

    writeFile: async (
      filepath: string,
      data: string | Uint8Array,
      _options?: { mode?: number }
    ) => {
      const isString = typeof data === 'string';
      await FileSystem.writeAsStringAsync(
        filepath,
        isString ? data : Buffer.from(data).toString('base64'),
        {
          encoding: isString ? FileSystem.EncodingType.UTF8 : FileSystem.EncodingType.Base64,
        }
      );
    },

    unlink: async (filepath: string) => {
      await FileSystem.deleteAsync(filepath, { idempotent: true });
    },

    readdir: async (dirpath: string) => {
      const result = await FileSystem.readDirectoryAsync(dirpath);
      return result;
    },

    mkdir: async (dirpath: string, options?: { recursive?: boolean }) => {
      await FileSystem.makeDirectoryAsync(dirpath, {
        intermediates: options?.recursive ?? true,
      });
    },

    rmdir: async (dirpath: string) => {
      await FileSystem.deleteAsync(dirpath, { idempotent: true });
    },

    stat: async (filepath: string) => {
      const info = await FileSystem.getInfoAsync(filepath);
      return {
        isFile: () => !info.isDirectory,
        isDirectory: () => info.isDirectory,
        isSymbolicLink: () => false,
        size: info.exists && 'size' in info ? info.size : 0,
        mode: 0o644,
        mtimeMs: info.exists && 'modificationTime' in info ? info.modificationTime * 1000 : 0,
      };
    },

    lstat: async (filepath: string) => {
      // For React Native, lstat behaves same as stat
      return fs.promises.stat(filepath);
    },

    readlink: async (_filepath: string): Promise<string> => {
      // Symlinks not fully supported in React Native
      throw new Error('Symlinks not supported');
    },

    symlink: async (_target: string, _filepath: string): Promise<void> => {
      // Symlinks not fully supported in React Native
      throw new Error('Symlinks not supported');
    },

    chmod: async (_filepath: string, _mode: number): Promise<void> => {
      // chmod not applicable in React Native
      return;
    },
  },
};

/**
 * Helper to read file content from a tree at specific commit
 */
async function readBlobContent(
  dir: string,
  oid: string,
  filepath: string
): Promise<string | null> {
  try {
    const { blob } = await git.readBlob({
      fs,
      dir,
      oid,
      filepath,
    });
    return new TextDecoder().decode(blob);
  } catch {
    return null;
  }
}

/**
 * Generate unified diff patch between two strings
 */
function createUnifiedPatch(
  filepath: string,
  oldContent: string,
  newContent: string
): { patch: string; additions: number; deletions: number } {
  const patch = Diff.createPatch(filepath, oldContent, newContent, 'old', 'new');

  // Count additions and deletions
  let additions = 0;
  let deletions = 0;
  const lines = patch.split('\n');
  for (const line of lines) {
    if (line.startsWith('+') && !line.startsWith('+++')) {
      additions++;
    } else if (line.startsWith('-') && !line.startsWith('---')) {
      deletions++;
    }
  }

  return { patch, additions, deletions };
}

/**
 * Git Service for mobile Git operations
 */
class GitServiceClass {
  /**
   * Get the base directory for Git repositories
   */
  getRepoBaseDir(): string {
    return `${FileSystem.documentDirectory}repos`;
  }

  /**
   * Clone a repository
   */
  async clone(options: CloneOptions): Promise<GitResult<void>> {
    const {
      url,
      dir,
      credentials,
      singleBranch,
      branch,
      depth,
      onProgress,
      signal: _signal,
    } = options;

    try {
      // Ensure directory exists
      await fs.promises.mkdir(dir, { recursive: true });

      const onAuth = credentials
        ? () => ({
            username: credentials.username || 'x-access-token',
            password: credentials.password,
          })
        : undefined;

      await git.clone({
        fs,
        http,
        dir,
        url,
        singleBranch: singleBranch ?? true,
        ref: branch,
        depth,
        onAuth,
        onProgress: onProgress
          ? (event) => {
              onProgress({
                phase: event.phase,
                loaded: event.loaded,
                total: event.total,
                percent: event.total ? Math.round((event.loaded / event.total) * 100) : undefined,
              });
            }
          : undefined,
      });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Clone failed',
      };
    }
  }

  /**
   * Fetch from remote
   */
  async fetch(options: FetchOptions): Promise<GitResult<void>> {
    const { dir, remote = 'origin', ref, credentials, onProgress } = options;

    try {
      const onAuth = credentials
        ? () => ({
            username: credentials.username || 'x-access-token',
            password: credentials.password,
          })
        : undefined;

      await git.fetch({
        fs,
        http,
        dir,
        remote,
        ref,
        onAuth,
        onProgress: onProgress
          ? (event) => {
              onProgress({
                phase: event.phase,
                loaded: event.loaded,
                total: event.total,
                percent: event.total ? Math.round((event.loaded / event.total) * 100) : undefined,
              });
            }
          : undefined,
      });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Fetch failed',
      };
    }
  }

  /**
   * Pull from remote (fetch + merge/rebase)
   */
  async pull(options: PullOptions): Promise<GitResult<void>> {
    const { dir, remote = 'origin', ref, credentials, author, onProgress } = options;

    try {
      const onAuth = credentials
        ? () => ({
            username: credentials.username || 'x-access-token',
            password: credentials.password,
          })
        : undefined;

      await git.pull({
        fs,
        http,
        dir,
        remote,
        ref,
        author: author
          ? {
              name: author.name,
              email: author.email,
            }
          : undefined,
        onAuth,
        onProgress: onProgress
          ? (event) => {
              onProgress({
                phase: event.phase,
                loaded: event.loaded,
                total: event.total,
                percent: event.total ? Math.round((event.loaded / event.total) * 100) : undefined,
              });
            }
          : undefined,
      });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Pull failed',
      };
    }
  }

  /**
   * Push to remote
   */
  async push(options: PushOptions): Promise<GitResult<void>> {
    const { dir, remote = 'origin', ref, credentials, force = false, onProgress } = options;

    try {
      const onAuth = credentials
        ? () => ({
            username: credentials.username || 'x-access-token',
            password: credentials.password,
          })
        : undefined;

      await git.push({
        fs,
        http,
        dir,
        remote,
        ref,
        force,
        onAuth,
        onProgress: onProgress
          ? (event) => {
              onProgress({
                phase: event.phase,
                loaded: event.loaded,
                total: event.total,
                percent: event.total ? Math.round((event.loaded / event.total) * 100) : undefined,
              });
            }
          : undefined,
      });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Push failed',
      };
    }
  }

  /**
   * Create a commit
   */
  async commit(options: CommitOptions): Promise<GitResult<string>> {
    const { dir, message, author, committer } = options;

    try {
      const sha = await git.commit({
        fs,
        dir,
        message,
        author: {
          name: author.name,
          email: author.email,
          timestamp: author.timestamp,
        },
        committer: committer
          ? {
              name: committer.name,
              email: committer.email,
              timestamp: committer.timestamp,
            }
          : undefined,
      });

      return { success: true, data: sha };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Commit failed',
      };
    }
  }

  /**
   * Stage files
   */
  async stage(options: StageOptions): Promise<GitResult<void>> {
    const { dir, filepath } = options;
    const paths = Array.isArray(filepath) ? filepath : [filepath];

    try {
      for (const path of paths) {
        await git.add({
          fs,
          dir,
          filepath: path,
        });
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Stage failed',
      };
    }
  }

  /**
   * Unstage files
   */
  async unstage(options: StageOptions): Promise<GitResult<void>> {
    const { dir, filepath } = options;
    const paths = Array.isArray(filepath) ? filepath : [filepath];

    try {
      for (const path of paths) {
        await git.remove({
          fs,
          dir,
          filepath: path,
        });
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unstage failed',
      };
    }
  }

  /**
   * Create a new branch
   */
  async createBranch(options: BranchOptions): Promise<GitResult<void>> {
    const { dir, branch, ref, checkout = false } = options;

    try {
      await git.branch({
        fs,
        dir,
        ref: branch,
        object: ref,
        checkout,
      });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Create branch failed',
      };
    }
  }

  /**
   * Delete a branch
   */
  async deleteBranch(dir: string, branch: string): Promise<GitResult<void>> {
    try {
      await git.deleteBranch({
        fs,
        dir,
        ref: branch,
      });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Delete branch failed',
      };
    }
  }

  /**
   * Checkout a branch or commit
   */
  async checkout(options: CheckoutOptions): Promise<GitResult<void>> {
    const { dir, ref, force = false } = options;

    try {
      await git.checkout({
        fs,
        dir,
        ref,
        force,
      });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Checkout failed',
      };
    }
  }

  /**
   * Get the current branch name
   */
  async currentBranch(dir: string): Promise<GitResult<string>> {
    try {
      const branch = await git.currentBranch({
        fs,
        dir,
        fullname: false,
      });

      return { success: true, data: branch || 'HEAD' };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get current branch',
      };
    }
  }

  /**
   * List all branches
   */
  async listBranches(dir: string, remote?: string): Promise<GitResult<BranchInfo[]>> {
    try {
      const branches = await git.listBranches({
        fs,
        dir,
        remote,
      });

      const currentResult = await this.currentBranch(dir);
      const currentBranch = currentResult.success ? currentResult.data : undefined;

      const branchInfos: BranchInfo[] = [];
      for (const branch of branches) {
        const refResult = await git.resolveRef({
          fs,
          dir,
          ref: remote ? `${remote}/${branch}` : branch,
        });

        branchInfos.push({
          name: branch,
          current: branch === currentBranch && !remote,
          commit: refResult,
        });
      }

      return { success: true, data: branchInfos };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to list branches',
      };
    }
  }

  /**
   * Get file status for the repository
   */
  async status(dir: string): Promise<GitResult<FileStatus[]>> {
    try {
      const matrix = await git.statusMatrix({ fs, dir });

      const statuses: FileStatus[] = matrix.map(([filepath, head, workdir, stage]) => {
        let status: FileStatus['status'];
        let staged = false;

        // Interpret status matrix
        // [HEAD, WORKDIR, STAGE]
        if (head === 0 && workdir === 2 && stage === 0) {
          status = 'untracked';
        } else if (head === 0 && workdir === 2 && stage === 2) {
          status = 'added';
          staged = true;
        } else if (head === 1 && workdir === 0 && stage === 0) {
          status = 'deleted';
        } else if (head === 1 && workdir === 0 && stage === 3) {
          status = 'deleted';
          staged = true;
        } else if (head === 1 && workdir === 2 && stage === 1) {
          status = 'modified';
        } else if (head === 1 && workdir === 2 && stage === 2) {
          status = 'modified';
          staged = true;
        } else if (head === 1 && workdir === 1 && stage === 1) {
          status = 'unmodified';
        } else {
          status = 'modified';
        }

        return {
          path: filepath,
          status,
          staged,
        };
      });

      // Filter out unmodified files for cleaner output
      return {
        success: true,
        data: statuses.filter((s) => s.status !== 'unmodified'),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get status',
      };
    }
  }

  /**
   * Get commit log
   */
  async log(dir: string, depth = 20): Promise<GitResult<CommitInfo[]>> {
    try {
      const commits = await git.log({
        fs,
        dir,
        depth,
      });

      const commitInfos: CommitInfo[] = commits.map((commit) => ({
        oid: commit.oid,
        message: commit.commit.message,
        author: {
          name: commit.commit.author.name,
          email: commit.commit.author.email,
          timestamp: commit.commit.author.timestamp,
        },
        committer: {
          name: commit.commit.committer.name,
          email: commit.commit.committer.email,
          timestamp: commit.commit.committer.timestamp,
        },
        parents: commit.commit.parent,
      }));

      return { success: true, data: commitInfos };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get log',
      };
    }
  }

  /**
   * Get diff between two commits using tree walking
   * Performs full recursive tree comparison and generates unified diffs
   */
  async diff(dir: string, commitA: string, commitB: string): Promise<GitResult<DiffResult>> {
    try {
      // Resolve refs to commit OIDs
      const oidA = await git.resolveRef({ fs, dir, ref: commitA });
      const oidB = await git.resolveRef({ fs, dir, ref: commitB });

      // Read commit objects to get tree OIDs
      const commitObjA = await git.readCommit({ fs, dir, oid: oidA });
      const commitObjB = await git.readCommit({ fs, dir, oid: oidB });

      const treeA = commitObjA.commit.tree;
      const treeB = commitObjB.commit.tree;

      // Walk both trees simultaneously to find differences
      const files: FileDiff[] = [];
      const filesInA = new Map<string, string>(); // filepath -> blob oid
      const filesInB = new Map<string, string>(); // filepath -> blob oid

      // Walk tree A recursively
      await this.walkTree(dir, treeA, '', filesInA);
      // Walk tree B recursively
      await this.walkTree(dir, treeB, '', filesInB);

      // Find all unique files
      const allFiles = new Set([...filesInA.keys(), ...filesInB.keys()]);

      let totalAdditions = 0;
      let totalDeletions = 0;

      // Compare each file
      for (const filepath of allFiles) {
        const blobA = filesInA.get(filepath);
        const blobB = filesInB.get(filepath);

        if (blobA === blobB) {
          // File unchanged
          continue;
        }

        let type: FileDiff['type'];
        let oldContent = '';
        let newContent = '';

        if (!blobA && blobB) {
          // File added in B
          type = 'add';
          newContent = (await readBlobContent(dir, oidB, filepath)) || '';
        } else if (blobA && !blobB) {
          // File deleted in B
          type = 'delete';
          oldContent = (await readBlobContent(dir, oidA, filepath)) || '';
        } else {
          // File modified
          type = 'modify';
          oldContent = (await readBlobContent(dir, oidA, filepath)) || '';
          newContent = (await readBlobContent(dir, oidB, filepath)) || '';
        }

        // Generate unified diff
        const { patch, additions, deletions } = createUnifiedPatch(
          filepath,
          oldContent,
          newContent
        );

        totalAdditions += additions;
        totalDeletions += deletions;

        files.push({
          path: filepath,
          type,
          additions,
          deletions,
          patch,
        });
      }

      const stats: DiffStats = {
        filesChanged: files.length,
        additions: totalAdditions,
        deletions: totalDeletions,
      };

      return {
        success: true,
        data: {
          files,
          stats,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate diff',
      };
    }
  }

  /**
   * Recursively walk a git tree and collect all file paths with their blob OIDs
   */
  private async walkTree(
    dir: string,
    treeOid: string,
    prefix: string,
    result: Map<string, string>
  ): Promise<void> {
    const tree = await git.readTree({ fs, dir, oid: treeOid });

    for (const entry of tree.tree) {
      const fullPath = prefix ? `${prefix}/${entry.path}` : entry.path;

      if (entry.type === 'blob') {
        result.set(fullPath, entry.oid);
      } else if (entry.type === 'tree') {
        // Recursively walk subtrees
        await this.walkTree(dir, entry.oid, fullPath, result);
      }
    }
  }

  /**
   * Get diff for working directory changes (staged and unstaged)
   */
  async diffWorkingDir(dir: string): Promise<GitResult<DiffResult>> {
    try {
      const matrix = await git.statusMatrix({ fs, dir });
      const headOid = await git.resolveRef({ fs, dir, ref: 'HEAD' });

      const files: FileDiff[] = [];
      let totalAdditions = 0;
      let totalDeletions = 0;

      for (const [filepath, head, workdir, _stage] of matrix) {
        // Skip unmodified files
        if (head === 1 && workdir === 1) continue;

        let type: FileDiff['type'];
        let oldContent = '';
        let newContent = '';

        if (head === 0 && workdir === 2) {
          // New file (untracked or added)
          type = 'add';
          try {
            newContent = await FileSystem.readAsStringAsync(`${dir}/${filepath}`);
          } catch {
            newContent = '';
          }
        } else if (head === 1 && workdir === 0) {
          // Deleted file
          type = 'delete';
          oldContent = (await readBlobContent(dir, headOid, filepath)) || '';
        } else {
          // Modified file
          type = 'modify';
          oldContent = (await readBlobContent(dir, headOid, filepath)) || '';
          try {
            newContent = await FileSystem.readAsStringAsync(`${dir}/${filepath}`);
          } catch {
            newContent = '';
          }
        }

        const { patch, additions, deletions } = createUnifiedPatch(
          filepath,
          oldContent,
          newContent
        );

        totalAdditions += additions;
        totalDeletions += deletions;

        files.push({
          path: filepath,
          type,
          additions,
          deletions,
          patch,
        });
      }

      return {
        success: true,
        data: {
          files,
          stats: {
            filesChanged: files.length,
            additions: totalAdditions,
            deletions: totalDeletions,
          },
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate working directory diff',
      };
    }
  }

  /**
   * List remotes
   */
  async listRemotes(dir: string): Promise<GitResult<RemoteInfo[]>> {
    try {
      const remotes = await git.listRemotes({ fs, dir });

      return {
        success: true,
        data: remotes.map((r) => ({
          name: r.remote,
          url: r.url,
        })),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to list remotes',
      };
    }
  }

  /**
   * Add a remote
   */
  async addRemote(dir: string, name: string, url: string): Promise<GitResult<void>> {
    try {
      await git.addRemote({
        fs,
        dir,
        remote: name,
        url,
      });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add remote',
      };
    }
  }

  /**
   * Delete a remote
   */
  async deleteRemote(dir: string, name: string): Promise<GitResult<void>> {
    try {
      await git.deleteRemote({
        fs,
        dir,
        remote: name,
      });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete remote',
      };
    }
  }

  /**
   * Initialize a new repository
   */
  async init(dir: string, defaultBranch = 'main'): Promise<GitResult<void>> {
    try {
      await fs.promises.mkdir(dir, { recursive: true });

      await git.init({
        fs,
        dir,
        defaultBranch,
      });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to initialize repository',
      };
    }
  }

  /**
   * Check if a directory is a Git repository
   */
  async isRepository(dir: string): Promise<boolean> {
    try {
      await git.resolveRef({
        fs,
        dir,
        ref: 'HEAD',
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get the HEAD commit SHA
   */
  async getHead(dir: string): Promise<GitResult<string>> {
    try {
      const oid = await git.resolveRef({
        fs,
        dir,
        ref: 'HEAD',
      });

      return { success: true, data: oid };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get HEAD',
      };
    }
  }

  /**
   * Clean up a repository (delete local clone)
   */
  async cleanup(dir: string): Promise<GitResult<void>> {
    try {
      await FileSystem.deleteAsync(dir, { idempotent: true });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to cleanup repository',
      };
    }
  }
}

// Export singleton instance
export const GitService = new GitServiceClass();
