/**
 * Custom React Hooks
 *
 * Reusable hooks for common patterns.
 */

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
// Navigation
export { useAppRouter, useRouteParams, useRouteSegments } from './useAppRouter';
