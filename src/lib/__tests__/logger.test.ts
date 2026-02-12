/**
 * Logger Tests
 */

import type { MockInstance } from 'vitest';
import { Logger, logger } from '../logger';

describe('Logger', () => {
  let consoleSpy: {
    debug: MockInstance;
    info: MockInstance;
    warn: MockInstance;
    error: MockInstance;
  };

  beforeEach(() => {
    consoleSpy = {
      debug: vi.spyOn(console, 'debug').mockImplementation(() => {}),
      info: vi.spyOn(console, 'info').mockImplementation(() => {}),
      warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
      error: vi.spyOn(console, 'error').mockImplementation(() => {}),
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('default logger instance', () => {
    it('should be exported', () => {
      expect(logger).toBeDefined();
      expect(logger).toBeInstanceOf(Logger);
    });
  });

  describe('log levels', () => {
    it('should log debug messages', () => {
      const testLogger = new Logger({ minLevel: 'debug', enableConsole: true });
      testLogger.debug('Debug message');
      expect(consoleSpy.debug).toHaveBeenCalled();
    });

    it('should log info messages', () => {
      const testLogger = new Logger({ minLevel: 'debug', enableConsole: true });
      testLogger.info('Info message');
      expect(consoleSpy.info).toHaveBeenCalled();
    });

    it('should log warn messages', () => {
      const testLogger = new Logger({ minLevel: 'debug', enableConsole: true });
      testLogger.warn('Warn message');
      expect(consoleSpy.warn).toHaveBeenCalled();
    });

    it('should log error messages', () => {
      const testLogger = new Logger({ minLevel: 'debug', enableConsole: true });
      testLogger.error('Error message');
      expect(consoleSpy.error).toHaveBeenCalled();
    });

    it('should log fatal messages', () => {
      const testLogger = new Logger({ minLevel: 'debug', enableConsole: true });
      testLogger.fatal('Fatal message');
      expect(consoleSpy.error).toHaveBeenCalled();
    });
  });

  describe('log level filtering', () => {
    it('should not log debug when minLevel is info', () => {
      const testLogger = new Logger({ minLevel: 'info', enableConsole: true });
      testLogger.debug('Debug message');
      expect(consoleSpy.debug).not.toHaveBeenCalled();
    });

    it('should log warn when minLevel is warn', () => {
      const testLogger = new Logger({ minLevel: 'warn', enableConsole: true });
      testLogger.warn('Warn message');
      expect(consoleSpy.warn).toHaveBeenCalled();
    });

    it('should not log info when minLevel is warn', () => {
      const testLogger = new Logger({ minLevel: 'warn', enableConsole: true });
      testLogger.info('Info message');
      expect(consoleSpy.info).not.toHaveBeenCalled();
    });
  });

  describe('context', () => {
    it('should include context in log entries', () => {
      const testLogger = new Logger({ minLevel: 'debug', enableConsole: true });
      testLogger.info('Message', { userId: '123' });
      expect(consoleSpy.info).toHaveBeenCalledWith(expect.stringContaining('userId'));
    });

    it('should include global context', () => {
      const testLogger = new Logger({ minLevel: 'debug', enableConsole: true });
      testLogger.setGlobalContext({ app: 'test' });
      testLogger.info('Message');
      expect(consoleSpy.info).toHaveBeenCalledWith(expect.stringContaining('app'));
      testLogger.clearGlobalContext();
    });
  });

  describe('error handling', () => {
    it('should extract error context from Error objects', () => {
      const testLogger = new Logger({ minLevel: 'debug', enableConsole: true });
      const error = new Error('Test error');
      testLogger.error('An error occurred', error);
      expect(consoleSpy.error).toHaveBeenCalledWith(expect.stringContaining('Test error'));
    });

    it('should handle non-Error objects', () => {
      const testLogger = new Logger({ minLevel: 'debug', enableConsole: true });
      testLogger.error('An error occurred', 'string error');
      expect(consoleSpy.error).toHaveBeenCalled();
    });
  });

  describe('log buffer', () => {
    it('should store recent logs', () => {
      const testLogger = new Logger({ minLevel: 'debug', enableConsole: true });
      testLogger.info('Log 1');
      testLogger.info('Log 2');
      testLogger.info('Log 3');

      const logs = testLogger.getRecentLogs(2);
      expect(logs).toHaveLength(2);
    });

    it('should clear logs', () => {
      const testLogger = new Logger({ minLevel: 'debug', enableConsole: true });
      testLogger.info('Log 1');
      testLogger.clearLogs();

      const logs = testLogger.getRecentLogs();
      expect(logs).toHaveLength(0);
    });
  });

  describe('child logger', () => {
    it('should create child logger with context', () => {
      const testLogger = new Logger({ minLevel: 'debug', enableConsole: true });
      const child = testLogger.child({ component: 'TestComponent' });
      child.info('Child message');
      expect(consoleSpy.info).toHaveBeenCalledWith(expect.stringContaining('component'));
    });

    it('should support nested child loggers', () => {
      const testLogger = new Logger({ minLevel: 'debug', enableConsole: true });
      const child1 = testLogger.child({ level: '1' });
      const child2 = child1.child({ level: '2' });
      child2.info('Nested message');
      expect(consoleSpy.info).toHaveBeenCalled();
    });
  });

  describe('configuration', () => {
    it('should allow reconfiguration', () => {
      const testLogger = new Logger({ minLevel: 'info', enableConsole: true });
      testLogger.debug('Should not log');
      expect(consoleSpy.debug).not.toHaveBeenCalled();

      testLogger.configure({ minLevel: 'debug' });
      testLogger.debug('Should log');
      expect(consoleSpy.debug).toHaveBeenCalled();
    });

    it('should disable console output when configured', () => {
      const testLogger = new Logger({ minLevel: 'debug', enableConsole: false });
      testLogger.info('Should not appear');
      expect(consoleSpy.info).not.toHaveBeenCalled();
    });
  });
});
