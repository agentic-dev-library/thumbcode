/**
 * Git Service - Unified Facade
 *
 * Thin facade that delegates to focused Git service modules.
 * Maintains backward-compatible API for all consumers.
 *
 * For new code, consider importing the focused services directly:
 * - GitCloneService: clone, fetch, pull, push, remotes, init
 * - GitBranchService: branches, checkout
 * - GitCommitService: commit, stage, unstage, log
 * - GitDiffService: diff, status
 */

import { GitBranchService } from './GitBranchService';
import { GitCloneService } from './GitCloneService';
import { GitCommitService } from './GitCommitService';
import { GitDiffService } from './GitDiffService';

import type {
  BranchInfo,
  BranchOptions,
  CheckoutOptions,
  CloneOptions,
  CommitInfo,
  CommitOptions,
  DiffResult,
  FetchOptions,
  FileStatus,
  GitResult,
  PullOptions,
  PushOptions,
  RemoteInfo,
  StageOptions,
} from './types';

class GitServiceClass {
  // Clone & Remote operations (delegated to GitCloneService)
  getRepoBaseDir(): string {
    return GitCloneService.getRepoBaseDir();
  }

  clone(options: CloneOptions): Promise<GitResult<void>> {
    return GitCloneService.clone(options);
  }

  fetch(options: FetchOptions): Promise<GitResult<void>> {
    return GitCloneService.fetch(options);
  }

  pull(options: PullOptions): Promise<GitResult<void>> {
    return GitCloneService.pull(options);
  }

  push(options: PushOptions): Promise<GitResult<void>> {
    return GitCloneService.push(options);
  }

  listRemotes(dir: string): Promise<GitResult<RemoteInfo[]>> {
    return GitCloneService.listRemotes(dir);
  }

  addRemote(dir: string, name: string, url: string): Promise<GitResult<void>> {
    return GitCloneService.addRemote(dir, name, url);
  }

  deleteRemote(dir: string, name: string): Promise<GitResult<void>> {
    return GitCloneService.deleteRemote(dir, name);
  }

  init(dir: string, defaultBranch = 'main'): Promise<GitResult<void>> {
    return GitCloneService.init(dir, defaultBranch);
  }

  isRepository(dir: string): Promise<boolean> {
    return GitCloneService.isRepository(dir);
  }

  getHead(dir: string): Promise<GitResult<string>> {
    return GitCloneService.getHead(dir);
  }

  cleanup(dir: string): Promise<GitResult<void>> {
    return GitCloneService.cleanup(dir);
  }

  // Branch operations (delegated to GitBranchService)
  createBranch(options: BranchOptions): Promise<GitResult<void>> {
    return GitBranchService.createBranch(options);
  }

  deleteBranch(dir: string, branch: string): Promise<GitResult<void>> {
    return GitBranchService.deleteBranch(dir, branch);
  }

  checkout(options: CheckoutOptions): Promise<GitResult<void>> {
    return GitBranchService.checkout(options);
  }

  currentBranch(dir: string): Promise<GitResult<string>> {
    return GitBranchService.currentBranch(dir);
  }

  listBranches(dir: string, remote?: string): Promise<GitResult<BranchInfo[]>> {
    return GitBranchService.listBranches(dir, remote);
  }

  // Commit operations (delegated to GitCommitService)
  commit(options: CommitOptions): Promise<GitResult<string>> {
    return GitCommitService.commit(options);
  }

  stage(options: StageOptions): Promise<GitResult<void>> {
    return GitCommitService.stage(options);
  }

  unstage(options: StageOptions): Promise<GitResult<void>> {
    return GitCommitService.unstage(options);
  }

  log(dir: string, depth = 20): Promise<GitResult<CommitInfo[]>> {
    return GitCommitService.log(dir, depth);
  }

  // Diff operations (delegated to GitDiffService)
  status(dir: string): Promise<GitResult<FileStatus[]>> {
    return GitDiffService.status(dir);
  }

  diff(dir: string, commitA: string, commitB: string): Promise<GitResult<DiffResult>> {
    return GitDiffService.diff(dir, commitA, commitB);
  }

  diffWorkingDir(dir: string): Promise<GitResult<DiffResult>> {
    return GitDiffService.diffWorkingDir(dir);
  }
}

// Export singleton instance
export const GitService = new GitServiceClass();
