/**
 * Retry Utility
 *
 * Provides retry logic with exponential backoff for handling transient failures.
 */

import { logger } from './logger';

export interface RetryOptions {
  /** Maximum number of attempts (default: 3) */
  maxAttempts?: number;
  /** Initial delay in milliseconds (default: 1000) */
  initialDelay?: number;
  /** Maximum delay in milliseconds (default: 30000) */
  maxDelay?: number;
  /** Backoff multiplier (default: 2) */
  backoffMultiplier?: number;
  /** Whether to add jitter to delays (default: true) */
  jitter?: boolean;
  /** Function to determine if error is retryable (default: all errors) */
  isRetryable?: (error: unknown) => boolean;
  /** Callback when a retry occurs */
  onRetry?: (error: unknown, attempt: number, delay: number) => void;
  /** Callback when all retries fail */
  onFailure?: (error: unknown, attempts: number) => void;
  /** Operation name for logging */
  operationName?: string;
}

const DEFAULT_OPTIONS: Required<Omit<RetryOptions, 'onRetry' | 'onFailure' | 'operationName'>> = {
  maxAttempts: 3,
  initialDelay: 1000,
  maxDelay: 30000,
  backoffMultiplier: 2,
  jitter: true,
  isRetryable: () => true,
};

/**
 * Calculate delay with exponential backoff and optional jitter
 */
function calculateDelay(
  attempt: number,
  initialDelay: number,
  maxDelay: number,
  multiplier: number,
  jitter: boolean
): number {
  // Exponential backoff: initialDelay * multiplier^(attempt-1)
  const exponentialDelay = initialDelay * multiplier ** (attempt - 1);
  const cappedDelay = Math.min(exponentialDelay, maxDelay);

  if (jitter) {
    // Add random jitter (±25%)
    const jitterFactor = 0.75 + Math.random() * 0.5;
    return Math.round(cappedDelay * jitterFactor);
  }

  return cappedDelay;
}

/**
 * Sleep for a specified duration
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Execute an async function with retry logic
 */
export async function retry<T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
  const config = { ...DEFAULT_OPTIONS, ...options };
  const { maxAttempts, initialDelay, maxDelay, backoffMultiplier, jitter, isRetryable } = config;
  const operationName = options.operationName || 'operation';

  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const result = await fn();

      if (attempt > 1) {
        logger.info(`${operationName} succeeded after ${attempt} attempts`);
      }

      return result;
    } catch (error) {
      lastError = error;

      // Check if we should retry
      if (attempt >= maxAttempts || !isRetryable(error)) {
        break;
      }

      // Calculate delay
      const delay = calculateDelay(attempt, initialDelay, maxDelay, backoffMultiplier, jitter);

      // Log retry
      logger.warn(`${operationName} failed, retrying in ${delay}ms`, {
        attempt,
        maxAttempts,
        error: error instanceof Error ? error.message : String(error),
      });

      // Notify callback
      options.onRetry?.(error, attempt, delay);

      // Wait before retrying
      await sleep(delay);
    }
  }

  // All retries exhausted
  logger.error(`${operationName} failed after ${maxAttempts} attempts`, lastError);
  options.onFailure?.(lastError, maxAttempts);

  throw lastError;
}

/**
 * Create a retry wrapper for a function
 */
export function withRetry<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
  options: RetryOptions = {}
): (...args: TArgs) => Promise<TResult> {
  return (...args: TArgs) => retry(() => fn(...args), options);
}

/**
 * Retry configuration presets
 */
export const RetryPresets = {
  /** Quick retry for fast operations */
  quick: {
    maxAttempts: 2,
    initialDelay: 500,
    maxDelay: 2000,
  } as RetryOptions,

  /** Standard retry for most operations */
  standard: {
    maxAttempts: 3,
    initialDelay: 1000,
    maxDelay: 10000,
  } as RetryOptions,

  /** Patient retry for slow operations */
  patient: {
    maxAttempts: 5,
    initialDelay: 2000,
    maxDelay: 30000,
  } as RetryOptions,

  /** Aggressive retry for critical operations */
  aggressive: {
    maxAttempts: 10,
    initialDelay: 500,
    maxDelay: 60000,
    backoffMultiplier: 1.5,
  } as RetryOptions,
};

/**
 * Check if an error is a network error (commonly retryable)
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes('network') ||
      message.includes('timeout') ||
      message.includes('fetch') ||
      message.includes('connection') ||
      message.includes('econnrefused') ||
      message.includes('enotfound')
    );
  }
  return false;
}

/**
 * Check if an error is a rate limit error (should retry after delay)
 */
export function isRateLimitError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes('rate limit') ||
      message.includes('too many requests') ||
      message.includes('429')
    );
  }
  return false;
}

/**
 * Retry only network-related errors
 */
export function networkRetryable(error: unknown): boolean {
  return isNetworkError(error) || isRateLimitError(error);
}
