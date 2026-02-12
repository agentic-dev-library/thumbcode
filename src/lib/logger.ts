/**
 * Logger Service
 *
 * Production-grade logging service with levels, context enrichment,
 * and optional remote logging support.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

interface LogContext {
  [key: string]: unknown;
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: LogContext;
  stack?: string;
}

interface LoggerConfig {
  minLevel: LogLevel;
  enableConsole: boolean;
  enableRemote: boolean;
  remoteEndpoint?: string;
  appVersion?: string;
  environment?: 'development' | 'staging' | 'production';
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  fatal: 4,
};

const LOG_COLORS: Record<LogLevel, string> = {
  debug: '\x1b[36m', // cyan
  info: '\x1b[32m', // green
  warn: '\x1b[33m', // yellow
  error: '\x1b[31m', // red
  fatal: '\x1b[35m', // magenta
};

const RESET_COLOR = '\x1b[0m';

class Logger {
  private config: LoggerConfig;
  private globalContext: LogContext = {};
  private logBuffer: LogEntry[] = [];
  private readonly bufferSize = 100;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      minLevel: import.meta.env.DEV ? 'debug' : 'info',
      enableConsole: true,
      enableRemote: false,
      environment: import.meta.env.DEV ? 'development' : 'production',
      ...config,
    };
  }

  /**
   * Set global context that will be included in all log entries
   */
  setGlobalContext(context: LogContext): void {
    this.globalContext = { ...this.globalContext, ...context };
  }

  /**
   * Clear global context
   */
  clearGlobalContext(): void {
    this.globalContext = {};
  }

  /**
   * Configure the logger
   */
  configure(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get recent logs from buffer
   */
  getRecentLogs(count = 20): LogEntry[] {
    return this.logBuffer.slice(-count);
  }

  /**
   * Clear log buffer
   */
  clearLogs(): void {
    this.logBuffer = [];
  }

  /**
   * Debug level log
   */
  debug(message: string, context?: LogContext): void {
    this.log('debug', message, context);
  }

  /**
   * Info level log
   */
  info(message: string, context?: LogContext): void {
    this.log('info', message, context);
  }

  /**
   * Warning level log
   */
  warn(message: string, context?: LogContext): void {
    this.log('warn', message, context);
  }

  /**
   * Error level log
   */
  error(message: string, error?: Error | unknown, context?: LogContext): void {
    const errorContext = this.extractErrorContext(error);
    this.log('error', message, { ...errorContext, ...context });
  }

  /**
   * Fatal level log - for unrecoverable errors
   */
  fatal(message: string, error?: Error | unknown, context?: LogContext): void {
    const errorContext = this.extractErrorContext(error);
    this.log('fatal', message, { ...errorContext, ...context });
  }

  /**
   * Create a child logger with additional context
   */
  child(context: LogContext): ChildLogger {
    return new ChildLogger(this, context);
  }

  /**
   * Core logging method
   */
  private log(level: LogLevel, message: string, context?: LogContext): void {
    if (LOG_LEVELS[level] < LOG_LEVELS[this.config.minLevel]) {
      return;
    }

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context: { ...this.globalContext, ...context },
    };

    // Add to buffer
    this.logBuffer.push(entry);
    if (this.logBuffer.length > this.bufferSize) {
      this.logBuffer.shift();
    }

    // Console output
    if (this.config.enableConsole) {
      this.writeToConsole(entry);
    }

    // Remote logging
    if (this.config.enableRemote && this.config.remoteEndpoint) {
      this.sendToRemote(entry).catch(() => {
        // Silently fail remote logging
      });
    }
  }

  /**
   * Write log entry to console
   */
  private writeToConsole(entry: LogEntry): void {
    const color = LOG_COLORS[entry.level];
    const prefix = `${color}[${entry.level.toUpperCase()}]${RESET_COLOR}`;
    const timestamp = entry.timestamp.slice(11, 19); // HH:MM:SS
    const contextStr =
      entry.context && Object.keys(entry.context).length > 0
        ? ` ${JSON.stringify(entry.context)}`
        : '';

    const formattedMessage = `${prefix} ${timestamp} ${entry.message}${contextStr}`;

    switch (entry.level) {
      case 'debug':
        console.debug(formattedMessage);
        break;
      case 'info':
        console.info(formattedMessage);
        break;
      case 'warn':
        console.warn(formattedMessage);
        break;
      case 'error':
      case 'fatal':
        console.error(formattedMessage);
        break;
    }
  }

  /**
   * Send log entry to remote endpoint
   */
  private async sendToRemote(entry: LogEntry): Promise<void> {
    if (!this.config.remoteEndpoint) return;

    const payload = {
      ...entry,
      appVersion: this.config.appVersion,
      environment: this.config.environment,
    };

    await fetch(this.config.remoteEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  }

  /**
   * Extract context from an error object
   */
  private extractErrorContext(error?: Error | unknown): LogContext {
    if (!error) return {};

    if (error instanceof Error) {
      return {
        errorName: error.name,
        errorMessage: error.message,
        stack: error.stack,
      };
    }

    return { errorValue: String(error) };
  }
}

/**
 * Child logger with additional context
 */
class ChildLogger {
  constructor(
    private parent: Logger,
    private context: LogContext
  ) {}

  debug(message: string, context?: LogContext): void {
    this.parent.debug(message, { ...this.context, ...context });
  }

  info(message: string, context?: LogContext): void {
    this.parent.info(message, { ...this.context, ...context });
  }

  warn(message: string, context?: LogContext): void {
    this.parent.warn(message, { ...this.context, ...context });
  }

  error(message: string, error?: Error | unknown, context?: LogContext): void {
    this.parent.error(message, error, { ...this.context, ...context });
  }

  fatal(message: string, error?: Error | unknown, context?: LogContext): void {
    this.parent.fatal(message, error, { ...this.context, ...context });
  }

  child(context: LogContext): ChildLogger {
    return new ChildLogger(this.parent, { ...this.context, ...context });
  }
}

// Default logger instance
export const logger = new Logger();

// Export class for custom instances
export { Logger, ChildLogger };
