export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export type LogMeta = Record<string, any>;

export interface ILogger {
  debug(message: string, meta?: LogMeta): void;
  info(message: string, meta?: LogMeta): void;
  warn(message: string, meta?: LogMeta): void;
  error(message: string, meta?: LogMeta): void;
}
