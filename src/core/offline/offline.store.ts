import { create } from 'zustand';
import { storage } from '@/core/storage';

const offlineEnabledKey = (ownerId: string) => `offline_enabled:${ownerId}`;

type OfflineState = {
  isConnected: boolean;
  isInternetReachable: boolean;
  pendingCount: number;
  isSyncing: boolean;
  lastSyncTime: string | null;
  lastError: string | null;
  offlineEnabled: boolean;
  setConnection: (isConnected: boolean, isInternetReachable: boolean) => void;
  setPendingCount: (pendingCount: number) => void;
  setSyncing: (isSyncing: boolean) => void;
  setLastSyncTime: (lastSyncTime: string | null) => void;
  setLastError: (lastError: string | null) => void;
  setOfflineEnabled: (offlineEnabled: boolean) => void;
};

export const useOfflineStore = create<OfflineState>((set) => ({
  isConnected: true,
  isInternetReachable: true,
  pendingCount: 0,
  isSyncing: false,
  lastSyncTime: null,
  lastError: null,
  offlineEnabled: false,
  setConnection: (isConnected, isInternetReachable) => set({ isConnected, isInternetReachable }),
  setPendingCount: (pendingCount) => set({ pendingCount }),
  setSyncing: (isSyncing) => set({ isSyncing }),
  setLastSyncTime: (lastSyncTime) => set({ lastSyncTime }),
  setLastError: (lastError) => set({ lastError }),
  setOfflineEnabled: (offlineEnabled) => set({ offlineEnabled }),
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
  const { isConnected, isInternetReachable, offlineEnabled } = useOfflineStore.getState();
  return offlineEnabled || !isConnected || !isInternetReachable;
};

export const isOfflineReady = () =>
  Boolean(useOfflineStore.getState().offlineEnabled && useOfflineStore.getState().lastSyncTime);
