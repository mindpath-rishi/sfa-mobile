/**
 * Device heartbeat
 * ----------------
 * Reports battery %, last active time and captured offline periods to
 * /device-status/heartbeat so managers / TLs / admins can see them.
 *
 * Offline time capture: when the device loses internet the start time is
 * stored; when it comes back the period is queued and sent with the next
 * heartbeat (kept across app restarts until the server accepts it).
 */
import { AppState, type AppStateStatus, Platform } from 'react-native';
import * as Battery from 'expo-battery';
import { api } from '@/core/network';
import { storage } from '@/core/storage';
import { applyTrackingConfig, getTrackingConfig } from '@/core/location/tracking-config';
import { useAuthStore } from '@/core/store/auth.store';
import { useOfflineStore } from '@/core/offline/offline.store';

const OFFLINE_SINCE_KEY = 'device_offline_since';
const PENDING_PERIODS_KEY = 'device_offline_periods';
const LAST_ACTIVE_KEY = 'device_last_active_at';
const HEARTBEAT_INTERVAL_MS = 5 * 60 * 1000;
/** Ignore network blips shorter than this. */
const MIN_OFFLINE_MS = 30 * 1000;

type OfflinePeriod = { from: string; to: string };

const readJson = async <T>(key: string, fallback: T): Promise<T> => {
  try {
    const raw = await storage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const isOnline = () => {
  const { isConnected, isInternetReachable } = useOfflineStore.getState();
  return isConnected && isInternetReachable;
};

const readBattery = async () => {
  if (Platform.OS === 'web') return {};
  try {
    const [level, state] = await Promise.all([
      Battery.getBatteryLevelAsync(),
      Battery.getBatteryStateAsync(),
    ]);
    return {
      batteryLevel: level >= 0 ? Math.round(level * 100) : undefined,
      isCharging:
        state === Battery.BatteryState.CHARGING || state === Battery.BatteryState.FULL,
    };
  } catch {
    return {};
  }
};

const markActive = () => storage.setItem(LAST_ACTIVE_KEY, new Date().toISOString());

let sending = false;
let lastSentAt = 0;
/** Foreground / reconnect events never send more often than this. */
const MIN_HEARTBEAT_GAP_MS = 60_000;

const sendHeartbeat = async (force = false) => {
  const auth = useAuthStore.getState();
  if (sending || !auth.accessToken || !auth.user?.userId || !isOnline()) return;
  if (!force && Date.now() - lastSentAt < MIN_HEARTBEAT_GAP_MS) return;
  sending = true;
  lastSentAt = Date.now();
  try {
    const periods = await readJson<OfflinePeriod[]>(PENDING_PERIODS_KEY, []);
    const lastActiveAt =
      AppState.currentState === 'active'
        ? new Date().toISOString()
        : (await storage.getItem(LAST_ACTIVE_KEY)) || undefined;
    const response: any = await api.post(
      '/device-status/heartbeat',
      {
        ...(await readBattery()),
        networkStatus: 'ONLINE',
        lastActiveAt,
        workSessionId: auth.workSessionId || undefined,
        offlinePeriods: periods.length ? periods : undefined,
        // Server replies with tracking settings only when this is out of date
        trackingVersion: getTrackingConfig().version,
      },
      { showLoader: false },
    );
    if (response?.data?.trackingSettings) {
      await applyTrackingConfig(response.data.trackingSettings);
    }
    if (response?.success !== false && periods.length) {
      // Keep periods queued meanwhile (if any) that were not part of this send.
      const latest = await readJson<OfflinePeriod[]>(PENDING_PERIODS_KEY, []);
      const sent = new Set(periods.map((period) => period.from));
      await storage.setItem(
        PENDING_PERIODS_KEY,
        JSON.stringify(latest.filter((period) => !sent.has(period.from))),
      );
    }
  } catch (error) {
    console.log('[DeviceHeartbeat] failed', error);
  } finally {
    sending = false;
  }
};

const handleConnectivity = async (online: boolean) => {
  if (!online) {
    if (!(await storage.getItem(OFFLINE_SINCE_KEY))) {
      await storage.setItem(OFFLINE_SINCE_KEY, new Date().toISOString());
    }
    return;
  }
  const since = await storage.getItem(OFFLINE_SINCE_KEY);
  if (since) {
    await storage.removeItem(OFFLINE_SINCE_KEY);
    const to = new Date();
    if (to.getTime() - new Date(since).getTime() >= MIN_OFFLINE_MS) {
      const periods = await readJson<OfflinePeriod[]>(PENDING_PERIODS_KEY, []);
      periods.push({ from: since, to: to.toISOString() });
      await storage.setItem(PENDING_PERIODS_KEY, JSON.stringify(periods.slice(-200)));
      // A real offline period (≥ MIN_OFFLINE_MS) is reported right away
      void sendHeartbeat(true);
      return;
    }
  }
  void sendHeartbeat();
};

/** Start heartbeat + offline capture; returns a cleanup function. */
export const startDeviceHeartbeat = () => {
  let wasOnline = isOnline();
  void handleConnectivity(wasOnline);
  void markActive();

  const unsubscribeNetwork = useOfflineStore.subscribe((state) => {
    const online = state.isConnected && state.isInternetReachable;
    if (online === wasOnline) return;
    wasOnline = online;
    void handleConnectivity(online);
  });

  const appStateSubscription = AppState.addEventListener('change', (next: AppStateStatus) => {
    if (next === 'active') {
      void markActive();
      void sendHeartbeat();
    } else {
      void markActive();
    }
  });

  const interval = setInterval(() => {
    if (AppState.currentState === 'active') void markActive();
    void sendHeartbeat();
  }, HEARTBEAT_INTERVAL_MS);

  return () => {
    clearInterval(interval);
    unsubscribeNetwork();
    appStateSubscription.remove();
  };
};
