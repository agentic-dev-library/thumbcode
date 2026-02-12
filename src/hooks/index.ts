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

// Navigation
export { useAppRouter, useRouteParams, useRouteSegments } from './useAppRouter';
