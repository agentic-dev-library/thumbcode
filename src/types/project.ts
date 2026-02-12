/**
 * Project System Type Definitions
 */

export interface Project {
  id: string;
  name: string;
  description: string;
  repository: Repository;
  agents: string[]; // Agent IDs
  workspaces: string[]; // Workspace IDs
  settings: ProjectSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface Repository {
  provider: 'github' | 'gitlab' | 'bitbucket';
  owner: string;
  name: string;
  defaultBranch: string;
  cloneUrl: string;
  isPrivate: boolean;
}

export interface ProjectSettings {
  autoReview: boolean;
  requireApproval: boolean;
  maxConcurrentAgents: number;
  branchProtection: BranchProtectionRule[];
}

export interface BranchProtectionRule {
  pattern: string;
  requireReview: boolean;
  requireTests: boolean;
}
