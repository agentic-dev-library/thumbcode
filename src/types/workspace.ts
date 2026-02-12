/**
 * Workspace System Type Definitions
 */

export interface Workspace {
  id: string;
  projectId: string;
  agentId: string;
  branch: string;
  status: WorkspaceStatus;
  files: WorkspaceFile[];
  changes: FileChange[];
  createdAt: Date;
  updatedAt: Date;
}

export type WorkspaceStatus = 'initializing' | 'ready' | 'syncing' | 'conflict' | 'error';

export interface WorkspaceFile {
  path: string;
  type: 'file' | 'directory';
  size?: number;
  lastModified?: Date;
  status: 'unchanged' | 'modified' | 'added' | 'deleted' | 'renamed';
}

export interface FileChange {
  path: string;
  type: 'add' | 'modify' | 'delete' | 'rename';
  oldPath?: string; // For renames
  hunks: DiffHunk[];
  staged: boolean;
}

export interface DiffHunk {
  oldStart: number;
  oldLines: number;
  newStart: number;
  newLines: number;
  content: string;
}
