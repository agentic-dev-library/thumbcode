/**
 * Git Service Exports
 *
 * Provides mobile-native Git operations using isomorphic-git.
 *
 * Usage:
 * ```typescript
 * import { GitCloneService, GitCommitService } from '@thumbcode/core/git';
 *
 * // Clone a repository
 * await GitCloneService.clone({
 *   url: 'https://github.com/user/repo.git',
 *   dir: GitCloneService.getRepoBaseDir() + '/repo',
 *   credentials: { password: token },
 * });
 *
 * // Stage and commit
 * await GitCommitService.stage({ dir, filepath: 'src/file.ts' });
 * await GitCommitService.commit({
 *   dir,
 *   message: 'feat: add new feature',
 *   author: { name: 'John Doe', email: 'john@example.com' },
 * });
 *
 * // Push changes
 * await GitCloneService.push({
 *   dir,
 *   credentials: { password: token },
 * });
 * ```
 */

export { GitBranchService } from './GitBranchService';
export { GitCloneService } from './GitCloneService';
export { GitCommitService } from './GitCommitService';
export { GitDiffService } from './GitDiffService';

// Types
export type {
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
  GitAuthor,
  GitCredentials,
  GitFileStatus,
  GitResult,
  ProgressCallback,
  ProgressEvent,
  PullOptions,
  PushOptions,
  RemoteInfo,
  RepositoryStatus,
  StageOptions,
} from './types';
