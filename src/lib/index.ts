/**
 * Library Exports
 *
 * Core utilities and helpers for ThumbCode.
 */

// Environment configuration
export {
  type AppEnvironment,
  apiUrls,
  type EnvironmentConfig,
  env,
  isFeatureEnabled,
  type ValidationResult,
  validateEnvironment,
} from './env';
// Error handling
export {
  type AppError,
  createAppError,
  type ErrorCode,
  ErrorCodes,
  type ErrorSeverity,
  getUserMessage,
  handleError,
  isAppError,
  onError,
  parseError,
  setupGlobalErrorHandlers,
} from './error-handler';
// Logging
export {
  ChildLogger,
  Logger,
  type LogLevel,
  logger,
} from './logger';
// Performance utilities
export {
  createMemoizedRenderItem,
  defaultListItemPropsAreEqual,
  OptimizedList,
  type OptimizedListProps,
  type PerformanceMetric,
  PerformanceMonitor,
  perfMonitor,
  type RenderMetric,
  useDebouncedCallback,
  useDebouncedValue,
  useIntersectionObserver,
  useLazyValue,
  useMountTime,
  usePerformanceTracking,
  usePrevious,
  useRenderTime,
  useStableArray,
  useStableCallback,
  useStableObject,
  useThrottledCallback,
  useWindowDimensions,
  withListItemMemo,
} from './performance';
// Retry utilities
export {
  isNetworkError,
  isRateLimitError,
  networkRetryable,
  type RetryOptions,
  RetryPresets,
  retry,
  withRetry,
} from './retry';
