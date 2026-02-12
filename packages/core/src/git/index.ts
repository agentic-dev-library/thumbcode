/**
 * Git Service Exports
 *
 * Provides mobile-native Git operations using isomorphic-git.
 *
 * Usage:
 * ```typescript
 * import { GitService } from '@thumbcode/core/git';
 *
 * // Clone a repository
 * await GitService.clone({
 *   url: 'https://github.com/user/repo.git',
 *   dir: GitService.getRepoBaseDir() + '/repo',
 *   credentials: { password: token },
 * });
 *
 * // Stage and commit
 * await GitService.stage({ dir, filepath: 'src/file.ts' });
 * await GitService.commit({
 *   dir,
 *   message: 'feat: add new feature',
 *   author: { name: 'John Doe', email: 'john@example.com' },
 * });
 *
 * // Push changes
 * await GitService.push({
 *   dir,
 *   credentials: { password: token },
 * });
 * ```
 */

export { GitService } from './GitService';

// Focused services for direct import
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
