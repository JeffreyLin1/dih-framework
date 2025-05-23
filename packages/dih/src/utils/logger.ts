/**
 * Logger utility for DIH Framework
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  SILENT = 4
}

export class Logger {
  private isDebugMode: boolean;
  private level: LogLevel;
  
  constructor(debug: boolean = false, level: LogLevel = LogLevel.INFO) {
    this.isDebugMode = debug;
    this.level = debug ? LogLevel.DEBUG : level;
  }
  
  /**
   * Log a debug message
   */
  debug(...args: any[]): void {
    if (this.level <= LogLevel.DEBUG) {
      console.debug('[DIH:DEBUG]', ...args);
    }
  }
  
  /**
   * Log an info message
   */
  info(...args: any[]): void {
    if (this.level <= LogLevel.INFO) {
      console.info('[DIH:INFO]', ...args);
    }
  }
  
  /**
   * Log a warning message
   */
  warn(...args: any[]): void {
    if (this.level <= LogLevel.WARN) {
      console.warn('[DIH:WARN]', ...args);
    }
  }
  
  /**
   * Log an error message
   */
  error(...args: any[]): void {
    if (this.level <= LogLevel.ERROR) {
      console.error('[DIH:ERROR]', ...args);
    }
  }
  
  /**
   * Set the log level
   */
  setLevel(level: LogLevel): void {
    this.level = level;
  }
  
  /**
   * Enable or disable debug mode
   */
  setDebug(debug: boolean): void {
    this.isDebugMode = debug;
    if (debug) {
      this.level = LogLevel.DEBUG;
    }
  }
  
  /**
   * Get the current log level
   */
  getLevel(): LogLevel {
    return this.level;
  }
} 