import { create } from 'zustand';
import { storage } from '@/core/storage';
import { useAuthStore } from '@/core/store/auth.store';
import { isSalesman } from '@/core/navigation/role.utils';

const offlineEnabledKey = (ownerId: string) => `offline_enabled:${ownerId}`;

type OfflineState = {
  isConnected: boolean;
  isInternetReachable: boolean;
  pendingCount: number;
  isSyncing: boolean;
  lastSyncTime: string | null;
  lastError: string | null;
  offlineEnabled: boolean;

  /**
   * Used only for first-time offline setup.
   * When user taps Enable Offline Mode, we set this true before sync starts.
   * This allows OfflineSyncGate to show while offlineEnabled is still false.
   */
  offlineSetupInProgress: boolean;

  /**
   * Used when user disables Offline Mode.
   * This shows Device → Server upload screen while pending local data
   * is uploading to server.
   */
  deviceServerUploadVisible: boolean;
  deviceServerUploadMessage: string | null;

  setConnection: (isConnected: boolean, isInternetReachable: boolean) => void;
  setPendingCount: (pendingCount: number) => void;
  setSyncing: (isSyncing: boolean) => void;
  setLastSyncTime: (lastSyncTime: string | null) => void;
  setLastError: (lastError: string | null) => void;
  setOfflineEnabled: (offlineEnabled: boolean) => void;
  setOfflineSetupInProgress: (offlineSetupInProgress: boolean) => void;

  setDeviceServerUploadVisible: (visible: boolean, message?: string | null) => void;
  setDeviceServerUploadMessage: (message: string | null) => void;
  resetUserSyncState: () => void;
};

export const useOfflineStore = create<OfflineState>((set) => ({
  isConnected: true,
  isInternetReachable: true,
  pendingCount: 0,
  isSyncing: false,
  lastSyncTime: null,
  lastError: null,
  offlineEnabled: false,

  offlineSetupInProgress: false,

  deviceServerUploadVisible: false,
  deviceServerUploadMessage: null,

  setConnection: (isConnected, isInternetReachable) =>
    set({
      isConnected,
      isInternetReachable,
    }),

  setPendingCount: (pendingCount) =>
    set({
      pendingCount,
    }),

  setSyncing: (isSyncing) =>
    set({
      isSyncing,
    }),

  setLastSyncTime: (lastSyncTime) =>
    set({
      lastSyncTime,
    }),

  setLastError: (lastError) =>
    set({
      lastError,
    }),

  setOfflineEnabled: (offlineEnabled) =>
    set({
      offlineEnabled,
    }),

  setOfflineSetupInProgress: (offlineSetupInProgress) =>
    set({
      offlineSetupInProgress,
    }),

  setDeviceServerUploadVisible: (visible, message = null) =>
    set({
      deviceServerUploadVisible: visible,
      deviceServerUploadMessage: message,
    }),

  setDeviceServerUploadMessage: (message) =>
    set({
      deviceServerUploadMessage: message,
    }),

  /**
   * Sync status is device memory, not user data. Clear it whenever sync is
   * initialised for an authenticated user so an error/overlay from the
   * previous account cannot be displayed for the new account.
   */
  resetUserSyncState: () =>
    set({
      pendingCount: 0,
      isSyncing: false,
      lastSyncTime: null,
      lastError: null,
      offlineEnabled: false,
      offlineSetupInProgress: false,
      deviceServerUploadVisible: false,
      deviceServerUploadMessage: null,
    }),
}));

export const hydrateOfflinePreference = async (ownerId: string) => {
  const value = ownerId ? await storage.getItem(offlineEnabledKey(ownerId)) : null;

  useOfflineStore.getState().setOfflineEnabled(value === 'true');
};

export const saveOfflinePreference = async (ownerId: string, enabled: boolean) => {
  if (!ownerId) return;

  await storage.setItem(offlineEnabledKey(ownerId), String(enabled));

  useOfflineStore.getState().setOfflineEnabled(enabled);
};

export const isOfflineMode = () => {
  const user = useAuthStore.getState().user;

  // Offline queuing/local-completion is only ever valid for a salesman who has
  // been granted offline access. Without that permission, a connectivity blip
  // must surface as "you're offline" rather than silently routing the action
  // through the offline queue and later showing an offline-only error.
  if (!isSalesman(user) || user?.offlineAccessAllowed !== true) return false;

  const { isConnected, isInternetReachable, offlineEnabled } = useOfflineStore.getState();

  return offlineEnabled || !isConnected || !isInternetReachable;
};

export const isOfflineReady = () => {
  const { offlineEnabled, lastSyncTime } = useOfflineStore.getState();

  return Boolean(offlineEnabled && lastSyncTime);
};

export const isOfflineSetupRunning = () => {
  const { offlineSetupInProgress, isSyncing } = useOfflineStore.getState();

  return Boolean(offlineSetupInProgress || isSyncing);
};

export const isDeviceServerUploadRunning = () => {
  const { deviceServerUploadVisible } = useOfflineStore.getState();

  return Boolean(deviceServerUploadVisible);
};

export const isAnyOfflineBlockingScreenRunning = () => {
  const { offlineSetupInProgress, isSyncing, deviceServerUploadVisible } =
    useOfflineStore.getState();
  return Boolean(offlineSetupInProgress || isSyncing || deviceServerUploadVisible);
};
