/**
 * Workspace Type Definitions
 *
 * Types for code workspaces and file changes.
 */

/**
 * Workspace entity
 */
export interface Workspace {
  id: string;
  projectId: string;
  agentId: string;
  branch: string;
  baseBranch: string;
  status: WorkspaceStatus;
  worktreePath: string;
  files: WorkspaceFile[];
  changes: FileChange[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Workspace status
 */
export type WorkspaceStatus =
  | 'initializing'
  | 'ready'
  | 'syncing'
  | 'conflict'
  | 'error'
  | 'cleaning_up';

/**
 * File in a workspace
 */
export interface WorkspaceFile {
  path: string;
  type: 'file' | 'directory';
  size?: number;
  lastModified?: string;
  status: FileStatusType;
  language?: string;
}

/**
 * File status types
 */
export type FileStatusType =
  | 'unchanged'
  | 'modified'
  | 'added'
  | 'deleted'
  | 'renamed'
  | 'untracked'
  | 'ignored';

/**
 * File change in a workspace
 */
export interface FileChange {
  path: string;
  type: 'add' | 'modify' | 'delete' | 'rename';
  oldPath?: string; // For renames
  hunks: DiffHunk[];
  staged: boolean;
  additions: number;
  deletions: number;
}

/**
 * Diff hunk
 */
export interface DiffHunk {
  oldStart: number;
  oldLines: number;
  newStart: number;
  newLines: number;
  content: string;
  header: string;
}

/**
 * Commit information
 */
export interface CommitInfo {
  sha: string;
  message: string;
  author: CommitAuthor;
  committer: CommitAuthor;
  parents: string[];
  date: string;
}

/**
 * Commit author
 */
export interface CommitAuthor {
  name: string;
  email: string;
  date: string;
}

/**
 * Branch information
 */
export interface BranchInfo {
  name: string;
  sha: string;
  isHead: boolean;
  upstream?: string;
  ahead: number;
  behind: number;
}
