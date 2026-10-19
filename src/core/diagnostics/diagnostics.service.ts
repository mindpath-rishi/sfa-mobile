import * as FileSystem from 'expo-file-system/legacy';
import * as Location from 'expo-location';
import * as Network from 'expo-network';
import * as Notifications from 'expo-notifications';
import { getRecentLogs, logger } from '@/core/logger/logger';
import { useOfflineStore } from '@/core/offline/offline.store';
import { useAuthStore } from '@/core/store/auth.store';
import { getClientDeviceIdAsync } from '@/shared/services/device.service';
import { syncService } from '@/sync/sync.service';
import { APP_BUILD, APP_VERSION, DEVICE_INFO } from './app-info';
import { useAppUpdateStore } from './app-update.store';
import { diagnosticsPost } from './diagnostics.client';
import { flushErrors, setVerboseReporting } from './error-reporter';

type HeartbeatResponse = {
  updateRequired: boolean;
  updateAvailable: boolean;
  minAppVersion: string | null;
  latestAppVersion: string | null;
  updateMessage: string | null;
  storeUrl: string | null;
  debugLogging: boolean;
  commands: { commandId: string; command: 'SEND_DIAGNOSTICS' | 'FORCE_RESYNC' | 'LOGOUT' }[];
};

const permission = async (read: () => Promise<{ status: string }>) => {
  try {
    return (await read()).status;
  } catch {
    return 'unknown';
  }
};

/** Everything MIS → Devices & App shows about this phone. */
export const collectDiagnostics = async () => {
  const [deviceId, freeBytes, network, queue, location, backgroundLocation, notifications] = await Promise.all([
    getClientDeviceIdAsync(),
    FileSystem.getFreeDiskStorageAsync().catch(() => null),
    Network.getNetworkStateAsync().catch(() => null),
    syncService.getQueueStats().catch(() => null),
    permission(() => Location.getForegroundPermissionsAsync()),
    permission(() => Location.getBackgroundPermissionsAsync()),
    permission(() => Notifications.getPermissionsAsync()),
  ]);
  const offline = useOfflineStore.getState();
  return {
    deviceId,
    appVersion: APP_VERSION,
    buildNumber: APP_BUILD,
    ...DEVICE_INFO,
    freeStorageMb: typeof freeBytes === 'number' ? Math.round(freeBytes / 1024 / 1024) : undefined,
    offlineMode: Boolean(offline.offlineEnabled),
    networkType: network?.type ? String(network.type) : undefined,
    lastDownloadAt: offline.lastSyncTime ?? undefined,
    lastUploadAt: queue?.lastUploadAt ?? undefined,
    queue: queue ? { pending: queue.pending, failed: queue.failed, syncing: queue.syncing, oldestPendingAt: queue.oldestPendingAt ?? undefined } : undefined,
    permissions: { location, backgroundLocation, notifications },
  };
};

const complete = (commandId: string, success: boolean, message?: string) =>
  diagnosticsPost(`/diagnostics/commands/${commandId}/complete`, { success, message }).catch(() => null);

const runCommand = async (command: HeartbeatResponse['commands'][number]) => {
  try {
    if (command.command === 'SEND_DIAGNOSTICS') {
      const diagnostics = await collectDiagnostics();
      await diagnosticsPost('/diagnostics/reports', {
        deviceId: diagnostics.deviceId,
        commandId: command.commandId,
        appVersion: APP_VERSION,
        logs: getRecentLogs(),
        queue: await syncService.getQueueSnapshot(),
        diagnostics,
      });
    } else if (command.command === 'FORCE_RESYNC') {
      await syncService.resetDownloadWatermark();
      await complete(command.commandId, true, 'Full download finished');
    } else if (command.command === 'LOGOUT') {
      await complete(command.commandId, true, 'Signed out');
      await useAuthStore.getState().logout();
    }
  } catch (error) {
    logger.error(`Diagnostics command ${command.command} failed`, { error });
    await complete(command.commandId, false, error instanceof Error ? error.message : String(error));
  }
};

let running = false;

/**
 * Check in with the server: report phone health, learn whether this version
 * must update, and run any command MIS queued (diagnostics, re-download,
 * logout). Called every 5 minutes while signed in and when the app resumes.
 */
export const sendHeartbeat = async () => {
  if (running || !useAuthStore.getState().user) return;
  running = true;
  try {
    const response = await diagnosticsPost<HeartbeatResponse>('/diagnostics/heartbeat', await collectDiagnostics());
    if (!response) return;
    useAppUpdateStore.getState().setFromServer({
      updateRequired: response.updateRequired,
      updateAvailable: response.updateAvailable,
      minAppVersion: response.minAppVersion,
      latestAppVersion: response.latestAppVersion,
      message: response.updateMessage,
      storeUrl: response.storeUrl,
    });
    setVerboseReporting(response.debugLogging);
    for (const command of response.commands ?? []) await runCommand(command);
    await flushErrors();
  } catch {
    // Offline or server unreachable: try again on the next tick.
  } finally {
    running = false;
  }
};
