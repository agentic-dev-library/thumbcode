/**
 * Global Error Handler
 *
 * Centralized error handling for the application.
 * Catches unhandled errors and provides consistent error processing.
 */

import { logger } from './logger';

// Type for React Native's ErrorUtils
interface ErrorUtilsType {
  setGlobalHandler: (handler: (error: Error, isFatal?: boolean) => void) => void;
  getGlobalHandler: () => ((error: Error, isFatal?: boolean) => void) | undefined;
}

// Access React Native's ErrorUtils
function getErrorUtils(): ErrorUtilsType | undefined {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (global as any).ErrorUtils as ErrorUtilsType | undefined;
}

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface AppError extends Error {
  code?: string;
  severity?: ErrorSeverity;
  userMessage?: string;
  context?: Record<string, unknown>;
  recoverable?: boolean;
}

/**
 * Error codes for categorization
 */
export const ErrorCodes = {
  // Network errors
  NETWORK_OFFLINE: 'NETWORK_OFFLINE',
  NETWORK_TIMEOUT: 'NETWORK_TIMEOUT',
  NETWORK_ERROR: 'NETWORK_ERROR',

  // API errors
  API_ERROR: 'API_ERROR',
  API_UNAUTHORIZED: 'API_UNAUTHORIZED',
  API_FORBIDDEN: 'API_FORBIDDEN',
  API_NOT_FOUND: 'API_NOT_FOUND',
  API_RATE_LIMITED: 'API_RATE_LIMITED',

  // Auth errors
  AUTH_EXPIRED: 'AUTH_EXPIRED',
  AUTH_INVALID: 'AUTH_INVALID',
  AUTH_MISSING: 'AUTH_MISSING',

  // Storage errors
  STORAGE_FULL: 'STORAGE_FULL',
  STORAGE_ERROR: 'STORAGE_ERROR',

  // Git errors
  GIT_CLONE_FAILED: 'GIT_CLONE_FAILED',
  GIT_PUSH_FAILED: 'GIT_PUSH_FAILED',
  GIT_PULL_FAILED: 'GIT_PULL_FAILED',
  GIT_MERGE_CONFLICT: 'GIT_MERGE_CONFLICT',

  // Agent errors
  AGENT_TIMEOUT: 'AGENT_TIMEOUT',
  AGENT_ERROR: 'AGENT_ERROR',

  // Generic
  UNKNOWN: 'UNKNOWN',
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];

/**
 * User-friendly error messages
 */
const userMessages: Record<ErrorCode, string> = {
  [ErrorCodes.NETWORK_OFFLINE]: 'You appear to be offline. Please check your connection.',
  [ErrorCodes.NETWORK_TIMEOUT]: 'The request timed out. Please try again.',
  [ErrorCodes.NETWORK_ERROR]: 'A network error occurred. Please try again.',
  [ErrorCodes.API_ERROR]: 'Something went wrong. Please try again.',
  [ErrorCodes.API_UNAUTHORIZED]: 'Your session has expired. Please sign in again.',
  [ErrorCodes.API_FORBIDDEN]: "You don't have permission to perform this action.",
  [ErrorCodes.API_NOT_FOUND]: 'The requested resource was not found.',
  [ErrorCodes.API_RATE_LIMITED]: "You've made too many requests. Please wait a moment.",
  [ErrorCodes.AUTH_EXPIRED]: 'Your session has expired. Please sign in again.',
  [ErrorCodes.AUTH_INVALID]: 'Invalid credentials. Please check and try again.',
  [ErrorCodes.AUTH_MISSING]: 'Please sign in to continue.',
  [ErrorCodes.STORAGE_FULL]: 'Device storage is full. Please free up some space.',
  [ErrorCodes.STORAGE_ERROR]: 'Failed to save data. Please try again.',
  [ErrorCodes.GIT_CLONE_FAILED]: 'Failed to clone repository. Please check your connection.',
  [ErrorCodes.GIT_PUSH_FAILED]: 'Failed to push changes. Please try again.',
  [ErrorCodes.GIT_PULL_FAILED]: 'Failed to pull changes. Please try again.',
  [ErrorCodes.GIT_MERGE_CONFLICT]: 'Merge conflict detected. Please resolve manually.',
  [ErrorCodes.AGENT_TIMEOUT]: 'The agent took too long to respond. Please try again.',
  [ErrorCodes.AGENT_ERROR]: 'The agent encountered an error. Please try again.',
  [ErrorCodes.UNKNOWN]: 'Something unexpected happened. Please try again.',
};

/**
 * Create a standardized app error
 */
export function createAppError(
  message: string,
  options: {
    code?: ErrorCode;
    severity?: ErrorSeverity;
    userMessage?: string;
    context?: Record<string, unknown>;
    recoverable?: boolean;
    cause?: Error;
  } = {}
): AppError {
  const error = new Error(message) as AppError;
  error.name = 'AppError';
  error.code = options.code || ErrorCodes.UNKNOWN;
  error.severity = options.severity || 'medium';
  error.userMessage = options.userMessage || userMessages[error.code as ErrorCode];
  error.context = options.context;
  error.recoverable = options.recoverable ?? true;
  error.cause = options.cause;
  return error;
}

/**
 * Parse an error into a standardized AppError
 */
export function parseError(error: unknown): AppError {
  // Already an AppError
  if (isAppError(error)) {
    return error;
  }

  // Standard Error
  if (error instanceof Error) {
    // Check for network errors
    if (error.message.includes('Network request failed')) {
      return createAppError(error.message, {
        code: ErrorCodes.NETWORK_ERROR,
        severity: 'medium',
        cause: error,
      });
    }

    // Check for timeout errors
    if (error.message.includes('timeout') || error.name === 'TimeoutError') {
      return createAppError(error.message, {
        code: ErrorCodes.NETWORK_TIMEOUT,
        severity: 'low',
        cause: error,
      });
    }

    // Generic error conversion
    return createAppError(error.message, {
      code: ErrorCodes.UNKNOWN,
      severity: 'medium',
      cause: error,
    });
  }

  // String error
  if (typeof error === 'string') {
    return createAppError(error, {
      code: ErrorCodes.UNKNOWN,
      severity: 'medium',
    });
  }

  // Unknown error type
  return createAppError('An unknown error occurred', {
    code: ErrorCodes.UNKNOWN,
    severity: 'medium',
    context: { originalError: String(error) },
  });
}

/**
 * Type guard for AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof Error && 'code' in error && 'severity' in error;
}

/**
 * Get user-friendly message for an error
 */
export function getUserMessage(error: unknown): string {
  const appError = parseError(error);
  return appError.userMessage || userMessages[ErrorCodes.UNKNOWN];
}

/**
 * Error handler callbacks
 */
type ErrorCallback = (error: AppError) => void;

const errorCallbacks: Set<ErrorCallback> = new Set();

/**
 * Register a global error callback
 */
export function onError(callback: ErrorCallback): () => void {
  errorCallbacks.add(callback);
  return () => errorCallbacks.delete(callback);
}

/**
 * Handle an error globally
 */
export function handleError(error: unknown, context?: Record<string, unknown>): AppError {
  const appError = parseError(error);

  // Add context if provided
  if (context) {
    appError.context = { ...appError.context, ...context };
  }

  // Log the error
  const logLevel = appError.severity === 'critical' ? 'fatal' : 'error';
  logger[logLevel](`[${appError.code}] ${appError.message}`, appError, appError.context);

  // Notify callbacks
  for (const callback of errorCallbacks) {
    try {
      callback(appError);
    } catch (callbackError) {
      logger.warn('Error callback threw an exception', { error: String(callbackError) });
    }
  }

  return appError;
}

/**
 * Setup global error handlers for React Native
 */
export function setupGlobalErrorHandlers(): void {
  const errorUtils = getErrorUtils();

  if (errorUtils) {
    // Handle unhandled promise rejections
    const originalHandler = errorUtils.getGlobalHandler?.();

    errorUtils.setGlobalHandler?.((error: Error, isFatal?: boolean) => {
      handleError(error, { isFatal, source: 'globalHandler' });

      // Call original handler
      if (originalHandler) {
        originalHandler(error, isFatal);
      }
    });
  }

  logger.info('Global error handlers initialized');
}
