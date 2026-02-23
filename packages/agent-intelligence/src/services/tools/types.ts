/**
 * Tool Execution Bridge Types
 *
 * Interfaces for injecting git service dependencies into the tool execution bridge.
 * These abstract the concrete git service singletons from @thumbcode/core so the
 * bridge remains testable and decoupled.
 */

/**
 * Minimal interface for diff operations the bridge needs.
 */
export interface DiffServiceLike {
  status(dir: string): Promise<{ success: boolean; data?: FileStatusLike[]; error?: string }>;
  diff(
    dir: string,
    commitA: string,
    commitB: string
  ): Promise<{ success: boolean; data?: DiffResultLike; error?: string }>;
  diffWorkingDir(dir: string): Promise<{ success: boolean; data?: DiffResultLike; error?: string }>;
}

/**
 * Minimal interface for clone/repo operations the bridge needs.
 */
export interface CloneServiceLike {
  isRepository(dir: string): Promise<boolean>;
  getHead(dir: string): Promise<{ success: boolean; data?: string; error?: string }>;
}

/**
 * Minimal interface for branch operations the bridge needs.
 */
export interface BranchServiceLike {
  currentBranch(dir: string): Promise<{ success: boolean; data?: string; error?: string }>;
  listBranches(
    dir: string,
    remote?: string
  ): Promise<{ success: boolean; data?: BranchInfoLike[]; error?: string }>;
}

/**
 * Minimal interface for commit/log operations the bridge needs.
 */
export interface CommitServiceLike {
  log(
    dir: string,
    depth?: number
  ): Promise<{ success: boolean; data?: CommitInfoLike[]; error?: string }>;
  stage(options: {
    dir: string;
    filepath: string | string[];
  }): Promise<{ success: boolean; error?: string }>;
  unstage(options: {
    dir: string;
    filepath: string | string[];
  }): Promise<{ success: boolean; error?: string }>;
  commit(options: {
    dir: string;
    message: string;
    author: { name: string; email: string; timestamp?: number };
  }): Promise<{ success: boolean; data?: string; error?: string }>;
}

/**
 * File system adapter for workspace files.
 * Allows injection of the Capacitor FS or a mock.
 */
export interface FileSystemLike {
  readFile(path: string): Promise<string>;
  readDir(path: string): Promise<string[]>;
  stat(path: string): Promise<{ isFile: boolean; isDirectory: boolean }>;
  writeFile(path: string, content: string): Promise<void>;
  deleteFile(path: string): Promise<void>;
  mkdir(path: string): Promise<void>;
}

/**
 * Structured result from tool execution.
 */
export interface ToolResult {
  success: boolean;
  output: string;
  error?: string;
}

/**
 * Git service dependencies for the bridge.
 */
export interface ToolBridgeDependencies {
  diffService: DiffServiceLike;
  cloneService: CloneServiceLike;
  branchService: BranchServiceLike;
  commitService: CommitServiceLike;
  fileSystem: FileSystemLike;
}

// Slimmed-down types matching @thumbcode/core shapes

export interface FileStatusLike {
  path: string;
  status: string;
  staged: boolean;
}

export interface DiffResultLike {
  files: FileDiffLike[];
  stats: { filesChanged: number; additions: number; deletions: number };
}

export interface FileDiffLike {
  path: string;
  type: string;
  additions: number;
  deletions: number;
  patch?: string;
}

export interface BranchInfoLike {
  name: string;
  current: boolean;
  commit: string;
}

export interface CommitInfoLike {
  oid: string;
  message: string;
  author: { name: string; email: string; timestamp?: number };
}

/**
 * Tracks a staged file change for the approval-commit flow.
 */
export interface StagedChange {
  path: string;
  type: 'write' | 'create' | 'delete';
  agentRole?: string;
  taskDescription?: string;
}

/**
 * Result of a commit triggered by approval.
 */
export interface CommitResult {
  success: boolean;
  sha?: string;
  filesChanged: number;
  error?: string;
}
