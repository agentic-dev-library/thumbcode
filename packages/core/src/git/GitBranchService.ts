/**
 * Git Branch Service
 *
 * Handles branch operations: create, delete, checkout, list, current branch.
 */

import git from 'isomorphic-git';

import { fs } from './git-fs';
import type {
  BranchInfo,
  BranchOptions,
  CheckoutOptions,
  GitResult,
} from './types';

class GitBranchServiceClass {
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
}

export const GitBranchService = new GitBranchServiceClass();
