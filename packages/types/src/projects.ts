/**
 * Project Type Definitions
 *
 * Types for projects and repositories.
 */

/**
 * Git provider
 */
export type GitProvider = 'github' | 'gitlab' | 'bitbucket';

/**
 * Repository information
 */
export interface Repository {
  provider: GitProvider;
  owner: string;
  name: string;
  fullName: string;
  defaultBranch: string;
  cloneUrl: string;
  isPrivate: boolean;
  description?: string;
  language?: string;
  stars?: number;
  forks?: number;
  updatedAt?: string;
}

/**
 * Project entity
 */
export interface Project {
  id: string;
  name: string;
  description: string;
  repository: Repository;
  localPath: string;
  agents: string[]; // Agent IDs
  workspaces: string[]; // Workspace IDs
  settings: ProjectSettings;
  status: ProjectStatus;
  lastSyncedAt?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Project status
 */
export type ProjectStatus =
  | 'initializing'
  | 'ready'
  | 'syncing'
  | 'error'
  | 'archived';

/**
 * Project settings
 */
export interface ProjectSettings {
  autoReview: boolean;
  requireApproval: boolean;
  maxConcurrentAgents: number;
  branchProtection: BranchProtectionRule[];
  defaultBranch: string;
  autoFetch: boolean;
  fetchInterval: number; // minutes
}

/**
 * Branch protection rule
 */
export interface BranchProtectionRule {
  pattern: string;
  requireReview: boolean;
  requireTests: boolean;
  requiredApprovers: number;
}

/**
 * Project creation options
 */
export interface CreateProjectOptions {
  name: string;
  description?: string;
  repository: {
    provider: GitProvider;
    owner: string;
    name: string;
    cloneUrl: string;
    isPrivate: boolean;
  };
  cloneDepth?: number;
  branch?: string;
}
