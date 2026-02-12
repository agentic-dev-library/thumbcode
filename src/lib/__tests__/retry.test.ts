/**
 * Retry Utility Tests
 */

import {
  isNetworkError,
  isRateLimitError,
  networkRetryable,
  RetryPresets,
  retry,
  withRetry,
} from '../retry';

// Mock the logger
vi.mock('../logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    fatal: vi.fn(),
  },
}));

describe('Retry Utility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('retry', () => {
    it('should succeed on first attempt', async () => {
      const fn = vi.fn().mockResolvedValue('success');
      const result = await retry(fn);
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure and succeed', async () => {
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new Error('First fail'))
        .mockResolvedValue('success');

      const result = await retry(fn, {
        maxAttempts: 3,
        initialDelay: 10,
      });

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('should throw after max attempts', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('Always fails'));

      await expect(
        retry(fn, {
          maxAttempts: 3,
          initialDelay: 10,
        })
      ).rejects.toThrow('Always fails');

      expect(fn).toHaveBeenCalledTimes(3);
    });

    it('should respect maxAttempts option', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('Fail'));

      await expect(
        retry(fn, {
          maxAttempts: 5,
          initialDelay: 10,
        })
      ).rejects.toThrow();

      expect(fn).toHaveBeenCalledTimes(5);
    });

    it('should normalize maxAttempts to at least 1', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('Fail'));

      await expect(
        retry(fn, {
          maxAttempts: 0,
          initialDelay: 10,
        })
      ).rejects.toThrow();

      // Should have been normalized to 1 attempt
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should call onRetry callback', async () => {
      const fn = vi.fn().mockRejectedValueOnce(new Error('Fail')).mockResolvedValue('success');
      const onRetry = vi.fn();

      await retry(fn, {
        maxAttempts: 3,
        initialDelay: 10,
        onRetry,
      });

      expect(onRetry).toHaveBeenCalledTimes(1);
      expect(onRetry).toHaveBeenCalledWith(expect.any(Error), 1, expect.any(Number));
    });

    it('should call onFailure callback when all retries fail', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('Fail'));
      const onFailure = vi.fn();

      await expect(
        retry(fn, {
          maxAttempts: 2,
          initialDelay: 10,
          onFailure,
        })
      ).rejects.toThrow();

      expect(onFailure).toHaveBeenCalledTimes(1);
      expect(onFailure).toHaveBeenCalledWith(expect.any(Error), 2);
    });

    it('should respect isRetryable option', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('Non-retryable'));

      await expect(
        retry(fn, {
          maxAttempts: 3,
          initialDelay: 10,
          isRetryable: () => false,
        })
      ).rejects.toThrow();

      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should use exponential backoff', async () => {
      const delays: number[] = [];
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new Error('Fail'))
        .mockRejectedValueOnce(new Error('Fail'))
        .mockResolvedValue('success');

      await retry(fn, {
        maxAttempts: 5,
        initialDelay: 100,
        backoffMultiplier: 2,
        jitter: false,
        onRetry: (_, __, delay) => delays.push(delay),
      });

      // First delay: 100 * 2^0 = 100
      // Second delay: 100 * 2^1 = 200
      expect(delays[0]).toBe(100);
      expect(delays[1]).toBe(200);
    });

    it('should respect maxDelay', async () => {
      const delays: number[] = [];
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new Error('Fail'))
        .mockRejectedValueOnce(new Error('Fail'))
        .mockRejectedValueOnce(new Error('Fail'))
        .mockResolvedValue('success');

      await retry(fn, {
        maxAttempts: 5,
        initialDelay: 100,
        maxDelay: 150,
        backoffMultiplier: 2,
        jitter: false,
        onRetry: (_, __, delay) => delays.push(delay),
      });

      // Should be capped at 150
      expect(delays.every((d) => d <= 150)).toBe(true);
    });
  });

  describe('withRetry', () => {
    it('should wrap a function with retry logic', async () => {
      const fn = vi.fn().mockResolvedValue('success');
      const wrappedFn = withRetry(fn, { maxAttempts: 3 });

      const result = await wrappedFn('arg1', 'arg2');
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledWith('arg1', 'arg2');
    });

    it('should pass arguments to wrapped function', async () => {
      const fn = vi.fn().mockImplementation((a: number, b: number) => Promise.resolve(a + b));
      const wrappedFn = withRetry(fn);

      const result = await wrappedFn(2, 3);
      expect(result).toBe(5);
    });
  });

  describe('RetryPresets', () => {
    it('should have quick preset', () => {
      expect(RetryPresets.quick.maxAttempts).toBe(2);
      expect(RetryPresets.quick.initialDelay).toBe(500);
    });

    it('should have standard preset', () => {
      expect(RetryPresets.standard.maxAttempts).toBe(3);
      expect(RetryPresets.standard.initialDelay).toBe(1000);
    });

    it('should have patient preset', () => {
      expect(RetryPresets.patient.maxAttempts).toBe(5);
      expect(RetryPresets.patient.initialDelay).toBe(2000);
    });

    it('should have aggressive preset', () => {
      expect(RetryPresets.aggressive.maxAttempts).toBe(10);
    });
  });

  describe('isNetworkError', () => {
    it('should detect network errors', () => {
      expect(isNetworkError(new Error('Network request failed'))).toBe(true);
      expect(isNetworkError(new Error('Connection timeout'))).toBe(true);
      expect(isNetworkError(new Error('Fetch error'))).toBe(true);
      expect(isNetworkError(new Error('ECONNREFUSED'))).toBe(true);
    });

    it('should not flag non-network errors', () => {
      expect(isNetworkError(new Error('Validation failed'))).toBe(false);
      expect(isNetworkError(new Error('Not found'))).toBe(false);
      expect(isNetworkError('string error')).toBe(false);
      expect(isNetworkError(null)).toBe(false);
    });
  });

  describe('isRateLimitError', () => {
    it('should detect rate limit errors', () => {
      expect(isRateLimitError(new Error('Rate limit exceeded'))).toBe(true);
      expect(isRateLimitError(new Error('Too many requests'))).toBe(true);
      expect(isRateLimitError(new Error('HTTP 429'))).toBe(true);
    });

    it('should not flag non-rate-limit errors', () => {
      expect(isRateLimitError(new Error('Server error'))).toBe(false);
      expect(isRateLimitError(new Error('Not found'))).toBe(false);
    });
  });

  describe('networkRetryable', () => {
    it('should return true for network errors', () => {
      expect(networkRetryable(new Error('Network failed'))).toBe(true);
    });

    it('should return true for rate limit errors', () => {
      expect(networkRetryable(new Error('Rate limit exceeded'))).toBe(true);
    });

    it('should return false for other errors', () => {
      expect(networkRetryable(new Error('Validation error'))).toBe(false);
    });
  });
});
