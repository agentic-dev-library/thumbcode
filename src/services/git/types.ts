/**
 * Git Service Types
 *
 * Type definitions for the isomorphic-git service.
 */

import type { Repository } from '@/types';

/**
 * Git authentication credentials
 */
export interface GitCredentials {
  /** Username for authentication */
  username?: string;
  /** Password or Personal Access Token */
  password: string;
}

/**
 * Options for cloning a repository
 */
export interface CloneOptions {
  /** Repository URL (HTTPS) */
  url: string;
  /** Local directory path for the clone */
  dir: string;
  /** Authentication credentials */
  credentials?: GitCredentials;
  /** Single branch to clone (for faster cloning) */
  singleBranch?: boolean;
  /** Branch to checkout after clone */
  branch?: string;
  /** Clone depth (1 for shallow clone) */
  depth?: number;
  /** Progress callback */
  onProgress?: ProgressCallback;
  /** Abort signal for cancellation */
  signal?: AbortSignal;
}

/**
 * Options for fetching from remote
 */
export interface FetchOptions {
  /** Local repository directory */
  dir: string;
  /** Remote name (default: 'origin') */
  remote?: string;
  /** Ref to fetch */
  ref?: string;
  /** Authentication credentials */
  credentials?: GitCredentials;
  /** Progress callback */
  onProgress?: ProgressCallback;
  /** Abort signal for cancellation */
  signal?: AbortSignal;
}

/**
 * Options for pulling from remote
 */
export interface PullOptions extends FetchOptions {
  /** Rebase instead of merge (default: false) */
  rebase?: boolean;
  /** Author for merge commits */
  author?: GitAuthor;
}

/**
 * Options for pushing to remote
 */
export interface PushOptions {
  /** Local repository directory */
  dir: string;
  /** Remote name (default: 'origin') */
  remote?: string;
  /** Branch to push */
  ref?: string;
  /** Authentication credentials */
  credentials?: GitCredentials;
  /** Force push (use with caution) */
  force?: boolean;
  /** Progress callback */
  onProgress?: ProgressCallback;
  /** Abort signal for cancellation */
  signal?: AbortSignal;
}

/**
 * Git author/committer information
 */
export interface GitAuthor {
  /** Name */
  name: string;
  /** Email */
  email: string;
  /** Timestamp (optional, defaults to now) */
  timestamp?: number;
}

/**
 * Options for creating a commit
 */
export interface CommitOptions {
  /** Local repository directory */
  dir: string;
  /** Commit message */
  message: string;
  /** Author information */
  author: GitAuthor;
  /** Committer information (defaults to author) */
  committer?: GitAuthor;
}

/**
 * Options for creating a branch
 */
export interface BranchOptions {
  /** Local repository directory */
  dir: string;
  /** Branch name */
  branch: string;
  /** Start point (commit SHA or branch name) */
  ref?: string;
  /** Checkout the branch after creating */
  checkout?: boolean;
}

/**
 * Options for checking out a branch or commit
 */
export interface CheckoutOptions {
  /** Local repository directory */
  dir: string;
  /** Branch name or commit SHA to checkout */
  ref: string;
  /** Force checkout (discard local changes) */
  force?: boolean;
}

/**
 * Options for staging files
 */
export interface StageOptions {
  /** Local repository directory */
  dir: string;
  /** File paths to stage */
  filepath: string | string[];
}

/**
 * Git file status
 */
export interface GitFileStatus {
  /** File path relative to repository root */
  filepath: string;
  /** Status in the HEAD commit */
  head: 0 | 1; // 0 = absent, 1 = present
  /** Status in the working directory */
  workdir: 0 | 1 | 2; // 0 = absent, 1 = identical to index, 2 = modified
  /** Status in the staging area */
  stage: 0 | 1 | 2 | 3; // 0 = absent, 1 = identical to HEAD, 2 = staged, 3 = staged for deletion
}

/**
 * Simplified file status for UI
 */
export interface FileStatus {
  /** File path */
  path: string;
  /** Status type */
  status: 'unmodified' | 'modified' | 'added' | 'deleted' | 'renamed' | 'untracked' | 'ignored';
  /** Whether the file is staged */
  staged: boolean;
}

/**
 * Git branch information
 */
export interface BranchInfo {
  /** Branch name */
  name: string;
  /** Whether this is the current branch */
  current: boolean;
  /** Commit SHA the branch points to */
  commit: string;
  /** Remote tracking branch (if any) */
  upstream?: string;
  /** Commits ahead of upstream */
  ahead?: number;
  /** Commits behind upstream */
  behind?: number;
}

/**
 * Git commit information
 */
export interface CommitInfo {
  /** Commit SHA */
  oid: string;
  /** Commit message */
  message: string;
  /** Author information */
  author: GitAuthor;
  /** Committer information */
  committer: GitAuthor;
  /** Parent commit SHAs */
  parents: string[];
}

/**
 * Progress callback for long-running operations
 */
export type ProgressCallback = (event: ProgressEvent) => void;

/**
 * Progress event for operations
 */
export interface ProgressEvent {
  /** Current phase of the operation */
  phase: string;
  /** Number of items processed */
  loaded: number;
  /** Total number of items (if known) */
  total?: number;
  /** Percentage complete (0-100) */
  percent?: number;
}

/**
 * Result of a Git operation
 */
export interface GitResult<T = void> {
  /** Whether the operation succeeded */
  success: boolean;
  /** Result data (if successful) */
  data?: T;
  /** Error message (if failed) */
  error?: string;
}

/**
 * Repository metadata including local state
 */
export interface RepositoryState extends Repository {
  /** Local path to the repository */
  localPath: string;
  /** Current branch */
  currentBranch: string;
  /** Current HEAD commit */
  headCommit: string;
  /** Repository status (clean, dirty, etc.) */
  status: RepositoryStatus;
  /** List of remotes */
  remotes: RemoteInfo[];
}

/**
 * Repository status
 */
export type RepositoryStatus =
  | 'uninitialized'
  | 'clean'
  | 'dirty'
  | 'merging'
  | 'rebasing'
  | 'detached';

/**
 * Remote repository information
 */
export interface RemoteInfo {
  /** Remote name */
  name: string;
  /** Fetch URL */
  url: string;
  /** Push URL (if different) */
  pushUrl?: string;
}

/**
 * Diff between two commits or trees
 */
export interface DiffResult {
  /** Files changed */
  files: FileDiff[];
  /** Statistics */
  stats: DiffStats;
}

/**
 * File diff information
 */
export interface FileDiff {
  /** File path */
  path: string;
  /** Old path (for renames) */
  oldPath?: string;
  /** Change type */
  type: 'add' | 'delete' | 'modify' | 'rename';
  /** Number of lines added */
  additions: number;
  /** Number of lines deleted */
  deletions: number;
  /** Diff content (patch format) */
  patch?: string;
}

/**
 * Diff statistics
 */
export interface DiffStats {
  /** Total files changed */
  filesChanged: number;
  /** Total lines added */
  additions: number;
  /** Total lines deleted */
  deletions: number;
}
