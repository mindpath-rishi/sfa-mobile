import { AppState } from 'react-native';
import { setLogReporter, safeStringify } from '@/core/logger/logger';
import type { LogLevel, LogMeta } from '@/core/logger/logger.types';
import { useAuthStore } from '@/core/store/auth.store';
import { getClientDeviceIdAsync } from '@/shared/services/device.service';
import { APP_VERSION } from './app-info';
import { diagnosticsPost } from './diagnostics.client';

type QueuedError = {
  level: 'info' | 'warn' | 'error' | 'fatal';
  message: string;
  stack?: string;
  context?: string;
  time: string;
  meta?: Record<string, unknown>;
};

const MAX_QUEUE = 100;
const FLUSH_AT = 20;
const FLUSH_EVERY_MS = 60_000;

// Already logged by the server for the same request, or noise.
const SKIP = [/^HTTP Error$/, /^Post-mutation offline sync failed$/];

let queue: QueuedError[] = [];
let flushing = false;
let installed = false;
/** Set from the heartbeat when MIS switches on debug logging for this user. */
let verbose = false;

export const setVerboseReporting = (value: boolean) => {
  verbose = value;
};

const enqueue = (entry: QueuedError) => {
  queue.push(entry);
  if (queue.length > MAX_QUEUE) queue = queue.slice(-MAX_QUEUE);
  if (queue.length >= FLUSH_AT || entry.level === 'fatal') void flushErrors();
};

const fromLog = (level: LogLevel, message: string, meta?: LogMeta) => {
  if (level === 'debug' || (level === 'info' && !verbose)) return;
  if (SKIP.some((pattern) => pattern.test(message))) return;
  const error = meta && Object.values(meta).find((value) => value instanceof Error) as Error | undefined;
  enqueue({
    level, // debug never reaches here (filtered above)
    message: message.slice(0, 2000),
    stack: error?.stack?.slice(0, 8000),
    time: new Date().toISOString(),
    meta: meta ? (JSON.parse(safeStringify(meta)) as Record<string, unknown>) : undefined,
  });
};

/** Sends queued app errors to the server; they appear in MIS → System Logs. */
export const flushErrors = async () => {
  if (flushing || !queue.length || !useAuthStore.getState().user) return;
  flushing = true;
  const batch = queue.slice(0, 50);
  try {
    await diagnosticsPost('/diagnostics/errors', {
      deviceId: await getClientDeviceIdAsync(),
      appVersion: APP_VERSION,
      errors: batch,
    });
    queue = queue.slice(batch.length);
  } catch {
    // Keep them for the next attempt (offline, server down…).
  } finally {
    flushing = false;
  }
};

/** Installs the logger hook and a global JS error handler (once). */
export const installErrorReporter = () => {
  if (installed) return;
  installed = true;
  setLogReporter(fromLog);

  const errorUtils = (global as any).ErrorUtils;
  const previous = errorUtils?.getGlobalHandler?.();
  errorUtils?.setGlobalHandler?.((error: Error, isFatal?: boolean) => {
    enqueue({
      level: isFatal ? 'fatal' : 'error',
      message: `Unhandled JS error: ${error?.message ?? String(error)}`,
      stack: error?.stack?.slice(0, 8000),
      context: 'GlobalHandler',
      time: new Date().toISOString(),
    });
    previous?.(error, isFatal);
  });

  const timer = setInterval(() => void flushErrors(), FLUSH_EVERY_MS);
  AppState.addEventListener('change', (state) => {
    if (state === 'background') void flushErrors();
  });
  return () => clearInterval(timer);
};
