import type { ILogger, LogMeta } from './logger.types';

const isDev = __DEV__;

/**
 * ✅ PRO TIP:
 * In production you can send logs to Sentry / Firebase / your API
 */
const print = (level: string, message: string, meta?: LogMeta) => {
  if (!isDev) return; // ✅ stop logs in production (keep clean)

  const time = new Date().toISOString();

  if (meta) {
    // eslint-disable-next-line no-console
    console.log(`[${time}] [${level}] ${message}`, meta);
  } else {
    // eslint-disable-next-line no-console
    console.log(`[${time}] [${level}] ${message}`);
  }
};

export const logger: ILogger = {
  debug(message, meta) {
    print('DEBUG', message, meta);
  },
  info(message, meta) {
    print('INFO', message, meta);
  },
  warn(message, meta) {
    print('WARN', message, meta);
  },
  error(message, meta) {
    print('ERROR', message, meta);
  },
};
