/**
 * Error Handler Tests
 */

import {
  createAppError,
  ErrorCodes,
  getUserMessage,
  handleError,
  isAppError,
  onError,
  parseError,
} from '../error-handler';

// Mock the logger to prevent console output during tests
vi.mock('../logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    fatal: vi.fn(),
  },
}));

describe('Error Handler', () => {
  describe('createAppError', () => {
    it('should create an AppError with default values', () => {
      const error = createAppError('Test error');
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Test error');
      expect(error.code).toBe(ErrorCodes.UNKNOWN);
      expect(error.severity).toBe('medium');
      expect(error.recoverable).toBe(true);
    });

    it('should create an AppError with custom options', () => {
      const error = createAppError('Network error', {
        code: ErrorCodes.NETWORK_ERROR,
        severity: 'high',
        recoverable: false,
        context: { url: 'https://api.example.com' },
      });
      expect(error.code).toBe(ErrorCodes.NETWORK_ERROR);
      expect(error.severity).toBe('high');
      expect(error.recoverable).toBe(false);
      expect(error.context?.url).toBe('https://api.example.com');
    });

    it('should include userMessage based on error code', () => {
      const error = createAppError('Auth failed', {
        code: ErrorCodes.AUTH_EXPIRED,
      });
      expect(error.userMessage).toContain('session');
    });

    it('should allow custom userMessage', () => {
      const error = createAppError('Error', {
        userMessage: 'Custom user-friendly message',
      });
      expect(error.userMessage).toBe('Custom user-friendly message');
    });
  });

  describe('parseError', () => {
    it('should return AppError unchanged', () => {
      const original = createAppError('Original error', {
        code: ErrorCodes.API_ERROR,
      });
      const parsed = parseError(original);
      expect(parsed).toBe(original);
    });

    it('should convert standard Error to AppError', () => {
      const standardError = new Error('Standard error');
      const parsed = parseError(standardError);
      expect(isAppError(parsed)).toBe(true);
      expect(parsed.message).toBe('Standard error');
    });

    it('should detect network errors', () => {
      const networkError = new Error('Network request failed');
      const parsed = parseError(networkError);
      expect(parsed.code).toBe(ErrorCodes.NETWORK_ERROR);
    });

    it('should detect timeout errors', () => {
      const timeoutError = new Error('Request timeout');
      const parsed = parseError(timeoutError);
      expect(parsed.code).toBe(ErrorCodes.NETWORK_TIMEOUT);
    });

    it('should handle string errors', () => {
      const parsed = parseError('String error message');
      expect(isAppError(parsed)).toBe(true);
      expect(parsed.message).toBe('String error message');
    });

    it('should handle unknown error types', () => {
      const parsed = parseError({ weird: 'object' });
      expect(isAppError(parsed)).toBe(true);
      expect(parsed.code).toBe(ErrorCodes.UNKNOWN);
    });

    it('should handle null/undefined', () => {
      const parsedNull = parseError(null);
      const parsedUndefined = parseError(undefined);
      expect(isAppError(parsedNull)).toBe(true);
      expect(isAppError(parsedUndefined)).toBe(true);
    });
  });

  describe('isAppError', () => {
    it('should return true for AppError', () => {
      const error = createAppError('Test');
      expect(isAppError(error)).toBe(true);
    });

    it('should return false for standard Error', () => {
      const error = new Error('Test');
      expect(isAppError(error)).toBe(false);
    });

    it('should return false for non-error values', () => {
      expect(isAppError('string')).toBe(false);
      expect(isAppError(null)).toBe(false);
      expect(isAppError({})).toBe(false);
    });
  });

  describe('getUserMessage', () => {
    it('should return user message for AppError', () => {
      const error = createAppError('Internal error', {
        code: ErrorCodes.NETWORK_OFFLINE,
      });
      const message = getUserMessage(error);
      expect(message).toContain('offline');
    });

    it('should return default message for unknown errors', () => {
      const message = getUserMessage('random error');
      expect(message).toContain('unexpected');
    });

    it('should use custom userMessage if provided', () => {
      const error = createAppError('Error', {
        userMessage: 'Custom message for user',
      });
      const message = getUserMessage(error);
      expect(message).toBe('Custom message for user');
    });
  });

  describe('handleError', () => {
    it('should parse and return AppError', () => {
      const error = new Error('Test error');
      const handled = handleError(error);
      expect(isAppError(handled)).toBe(true);
    });

    it('should add context to error', () => {
      const error = new Error('Test error');
      const handled = handleError(error, { component: 'TestComponent' });
      expect(handled.context?.component).toBe('TestComponent');
    });
  });

  describe('onError callback', () => {
    it('should register and call error callbacks', () => {
      const callback = vi.fn();
      const unsubscribe = onError(callback);

      handleError(new Error('Test error'));
      expect(callback).toHaveBeenCalled();

      unsubscribe();
    });

    it('should unsubscribe callback', () => {
      const callback = vi.fn();
      const unsubscribe = onError(callback);

      handleError(new Error('First error'));
      expect(callback).toHaveBeenCalledTimes(1);

      unsubscribe();

      handleError(new Error('Second error'));
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  describe('ErrorCodes', () => {
    it('should have all expected error codes', () => {
      expect(ErrorCodes.NETWORK_OFFLINE).toBe('NETWORK_OFFLINE');
      expect(ErrorCodes.NETWORK_TIMEOUT).toBe('NETWORK_TIMEOUT');
      expect(ErrorCodes.API_ERROR).toBe('API_ERROR');
      expect(ErrorCodes.API_UNAUTHORIZED).toBe('API_UNAUTHORIZED');
      expect(ErrorCodes.AUTH_EXPIRED).toBe('AUTH_EXPIRED');
      expect(ErrorCodes.GIT_PUSH_FAILED).toBe('GIT_PUSH_FAILED');
      expect(ErrorCodes.AGENT_TIMEOUT).toBe('AGENT_TIMEOUT');
      expect(ErrorCodes.UNKNOWN).toBe('UNKNOWN');
    });
  });
});
