/**
 * Custom React Hooks
 *
 * Reusable hooks for common patterns.
 */

export {
  type AgentMetrics,
  type UseAgentListResult,
  useAgentList,
} from './use-agent-list';
// Tab page hooks
export {
  type ActivityItem,
  type HomeDashboardStats,
  type UseHomeDashboardResult,
  useHomeDashboard,
} from './use-home-dashboard';
// Network and error handling
export {
  type NetworkErrorState,
  type NetworkState,
  useIsOnline,
  useNetworkError,
} from './use-network-error';
// Project hooks
export { type UseProjectActionsResult, useProjectActions } from './use-project-actions';
export { type UseProjectCommitsResult, useProjectCommits } from './use-project-commits';
export {
  parseRepoInfo,
  type RepoInfo,
  type UseProjectFilesResult,
  useProjectFiles,
} from './use-project-files';
export { type UseProjectListResult, useProjectList } from './use-project-list';
// Navigation
export { useAppRouter, useRouteParams, useRouteSegments } from './useAppRouter';
