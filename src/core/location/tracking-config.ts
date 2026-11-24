/**
 * Location tracking settings set by the admin in the portal
 * (Live Tracking → Tracking settings). Loaded when tracking starts and
 * refreshed with every device heartbeat; cached for offline starts.
 */
import { api } from '@/core/network';
import { storage } from '@/core/storage';

export type AccuracyMode = 'HIGH' | 'BALANCED' | 'LOW';

export type TrackingConfig = {
  trackingEnabled: boolean;
  accuracyMode: AccuracyMode;
  foregroundIntervalSec: number;
  foregroundDistanceM: number;
  backgroundEnabled: boolean;
  backgroundIntervalSec: number;
  backgroundDistanceM: number;
  maxAccuracyM: number;
  heartbeatSec: number;
  version: string;
};

export const DEFAULT_TRACKING_CONFIG: TrackingConfig = {
  trackingEnabled: true,
  accuracyMode: 'HIGH',
  foregroundIntervalSec: 5,
  foregroundDistanceM: 5,
  backgroundEnabled: true,
  backgroundIntervalSec: 5,
  backgroundDistanceM: 0,
  maxAccuracyM: 100,
  heartbeatSec: 30,
  version: 'default',
};

const STORAGE_KEY = 'location_tracking_config';
const FETCH_TIMEOUT_MS = 5_000;

let current: TrackingConfig = DEFAULT_TRACKING_CONFIG;
let loadedFromCache = false;
const listeners = new Set<(config: TrackingConfig, previous: TrackingConfig) => void>();

export const getTrackingConfig = () => current;

/** Called with (new, previous) whenever the effective settings change. */
export const onTrackingConfigChange = (
  listener: (config: TrackingConfig, previous: TrackingConfig) => void,
) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const sanitize = (raw: any): TrackingConfig | null => {
  if (!raw || typeof raw !== 'object') return null;
  const num = (value: unknown, fallback: number, min: number, max: number) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? Math.min(max, Math.max(min, parsed)) : fallback;
  };
  const d = DEFAULT_TRACKING_CONFIG;
  return {
    trackingEnabled: raw.trackingEnabled !== false,
    accuracyMode: ['HIGH', 'BALANCED', 'LOW'].includes(raw.accuracyMode) ? raw.accuracyMode : d.accuracyMode,
    foregroundIntervalSec: num(raw.foregroundIntervalSec, d.foregroundIntervalSec, 1, 600),
    foregroundDistanceM: num(raw.foregroundDistanceM, d.foregroundDistanceM, 0, 1000),
    backgroundEnabled: raw.backgroundEnabled !== false,
    backgroundIntervalSec: num(raw.backgroundIntervalSec, d.backgroundIntervalSec, 1, 900),
    backgroundDistanceM: num(raw.backgroundDistanceM, d.backgroundDistanceM, 0, 1000),
    maxAccuracyM: num(raw.maxAccuracyM, d.maxAccuracyM, 10, 2000),
    heartbeatSec: num(raw.heartbeatSec, d.heartbeatSec, 5, 900),
    version: String(raw.version ?? 'default'),
  };
};

const sameConfig = (a: TrackingConfig, b: TrackingConfig) =>
  (Object.keys(a) as (keyof TrackingConfig)[])
    .filter((key) => key !== 'version')
    .every((key) => a[key] === b[key]);

/** Applies settings received from the server (heartbeat or fetch). */
export const applyTrackingConfig = async (raw: unknown) => {
  const next = sanitize(raw);
  if (!next) return false;
  const previous = current;
  current = next;
  await storage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => undefined);
  if (sameConfig(previous, next)) return false;
  listeners.forEach((listener) => {
    try {
      listener(next, previous);
    } catch (error) {
      console.warn('[TrackingConfig] listener failed', error);
    }
  });
  return true;
};

const loadCached = async () => {
  if (loadedFromCache) return;
  loadedFromCache = true;
  try {
    const cached = sanitize(JSON.parse((await storage.getItem(STORAGE_KEY)) || 'null'));
    if (cached) current = cached;
  } catch {
    /* keep defaults */
  }
};

/** Cached settings immediately, then the server's (short timeout; offline keeps the cache). */
export const loadTrackingConfig = async () => {
  await loadCached();
  try {
    const response: any = await Promise.race([
      api.get('/live-location-tracking/settings/me', { showLoader: false } as any),
      new Promise((resolve) => setTimeout(() => resolve(null), FETCH_TIMEOUT_MS)),
    ]);
    const data = response?.data ?? null;
    if (data) {
      const next = sanitize(data);
      if (next) {
        current = next;
        await storage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => undefined);
      }
    }
  } catch {
    /* offline: cached / default settings */
  }
  return current;
};
