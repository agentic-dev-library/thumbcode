/**
 * Git Diff Service
 *
 * Handles diff and status operations: diff, diffWorkingDir, status.
 */

import * as Diff from 'diff';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import git from 'isomorphic-git';

import { fs } from './git-fs';
import type {
  DiffResult,
  DiffStats,
  FileDiff,
  FileStatus,
  GitResult,
} from './types';

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

class GitDiffServiceClass {
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
      const allFilesArray = Array.from(allFiles);
      const BATCH_SIZE = 20;

      for (let i = 0; i < allFilesArray.length; i += BATCH_SIZE) {
        const batch = allFilesArray.slice(i, i + BATCH_SIZE);
        await Promise.all(
          batch.map(async (filepath) => {
            const blobA = filesInA.get(filepath);
            const blobB = filesInB.get(filepath);

            if (blobA === blobB) {
              // File unchanged
              return;
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
          })
        );
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

      const results = await Promise.all(
        matrix.map(async ([filepath, head, workdir, _stage]) => {
          // Skip unmodified files
          if (head === 1 && workdir === 1) return null;

          let type: FileDiff['type'];
          let oldContent = '';
          let newContent = '';

          if (head === 0 && workdir === 2) {
            // New file (untracked or added)
            type = 'add';
            try {
              const fileResult = await Filesystem.readFile({
                path: `${dir}/${filepath}`,
                directory: Directory.Documents,
                encoding: Encoding.UTF8,
              });
              newContent = fileResult.data as string;
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
              const fileResult = await Filesystem.readFile({
                path: `${dir}/${filepath}`,
                directory: Directory.Documents,
                encoding: Encoding.UTF8,
              });
              newContent = fileResult.data as string;
            } catch {
              newContent = '';
            }
          }

          const { patch, additions, deletions } = createUnifiedPatch(
            filepath,
            oldContent,
            newContent
          );

          return {
            path: filepath,
            type,
            additions,
            deletions,
            patch,
          };
        })
      );

      const files: FileDiff[] = [];
      let totalAdditions = 0;
      let totalDeletions = 0;

      for (const result of results) {
        if (result) {
          files.push(result);
          totalAdditions += result.additions;
          totalDeletions += result.deletions;
        }
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
}

export const GitDiffService = new GitDiffServiceClass();
