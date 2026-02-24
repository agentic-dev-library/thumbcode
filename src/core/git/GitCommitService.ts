/**
 * Git Commit Service
 *
 * Handles commit operations: commit, stage, unstage, log.
 */

import git from 'isomorphic-git';

import { fs } from './git-fs';
import type { CommitInfo, CommitOptions, GitResult, StageOptions } from './types';

class GitCommitServiceClass {
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
}

export const GitCommitService = new GitCommitServiceClass();
