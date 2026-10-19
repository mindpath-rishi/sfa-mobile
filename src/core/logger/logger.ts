import type { ILogger, LogLevel, LogMeta } from './logger.types';

const isDev = __DEV__;

/** Recent log lines kept in memory for diagnostic reports requested from MIS. */
const BUFFER_SIZE = 400;
const buffer: string[] = [];

type LogReporter = (level: LogLevel, message: string, meta?: LogMeta) => void;
let reporter: LogReporter | null = null;

/** The error reporter registers here to forward warnings/errors to the server. */
export const setLogReporter = (hook: LogReporter | null) => {
  reporter = hook;
};

export const getRecentLogs = () => [...buffer];

/** JSON that survives Error objects and circular references. */
export const safeStringify = (value: unknown) => {
  const seen = new WeakSet<object>();
  try {
    return JSON.stringify(value, (_key, item) => {
      if (item instanceof Error) return { name: item.name, message: item.message, stack: item.stack };
      if (item && typeof item === 'object') {
        if (seen.has(item)) return '[circular]';
        seen.add(item);
      }
      return item;
    });
  } catch {
    return String(value);
  }
};

const record = (level: LogLevel, message: string, meta?: LogMeta) => {
  const time = new Date().toISOString();
  const line = `${time} [${level.toUpperCase()}] ${message}${meta ? ` ${safeStringify(meta)}` : ''}`;
  buffer.push(line.length > 2000 ? `${line.slice(0, 2000)}…` : line);
  if (buffer.length > BUFFER_SIZE) buffer.shift();

  if (reporter) {
    try {
      reporter(level, message, meta);
    } catch {
      // Reporting must never break the app.
    }
  }

  if (!isDev) return; // console output only in development

  if (meta) {
    // eslint-disable-next-line no-console
    console.log(`[${time}] [${level.toUpperCase()}] ${message}`, meta);
  } else {
    // eslint-disable-next-line no-console
    console.log(`[${time}] [${level.toUpperCase()}] ${message}`);
  }
};

export const logger: ILogger = {
  debug(message, meta) {
    record('debug', message, meta);
  },
  info(message, meta) {
    record('info', message, meta);
  },
  warn(message, meta) {
    record('warn', message, meta);
  },
  error(message, meta) {
    record('error', message, meta);
  },
};
