/**
 * Navigation Type Definitions
 *
 * Types for expo-router navigation.
 */

/**
 * Root stack param list
 */
export type RootStackParamList = {
  '(onboarding)': undefined;
  '(tabs)': undefined;
  'project/[id]': { id: string };
  'agent/[id]': { id: string };
  'workspace/[id]': { id: string };
  settings: undefined;
};

/**
 * Onboarding stack param list
 */
export type OnboardingStackParamList = {
  welcome: undefined;
  'github-auth': undefined;
  'api-keys': undefined;
  'create-project': undefined;
  complete: undefined;
};

/**
 * Tab param list
 */
export type TabParamList = {
  index: undefined;
  projects: undefined;
  agents: undefined;
  chat: undefined;
  settings: undefined;
};

/**
 * Project detail routes
 */
export type ProjectDetailRoutes = {
  overview: { projectId: string };
  files: { projectId: string; path?: string };
  branches: { projectId: string };
  commits: { projectId: string };
  settings: { projectId: string };
};

/**
 * Agent detail routes
 */
export type AgentDetailRoutes = {
  overview: { agentId: string };
  tasks: { agentId: string };
  metrics: { agentId: string };
  config: { agentId: string };
};

/**
 * Workspace detail routes
 */
export type WorkspaceDetailRoutes = {
  files: { workspaceId: string };
  changes: { workspaceId: string };
  diff: { workspaceId: string; filePath: string };
  commit: { workspaceId: string };
};
