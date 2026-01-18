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
