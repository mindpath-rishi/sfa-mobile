import { create } from 'zustand';

type OfflineState = {
  isConnected: boolean;
  isInternetReachable: boolean;
  pendingCount: number;
  isSyncing: boolean;
  lastSyncTime: string | null;
  lastError: string | null;
  setConnection: (isConnected: boolean, isInternetReachable: boolean) => void;
  setPendingCount: (pendingCount: number) => void;
  setSyncing: (isSyncing: boolean) => void;
  setLastSyncTime: (lastSyncTime: string | null) => void;
  setLastError: (lastError: string | null) => void;
};

export const useOfflineStore = create<OfflineState>((set) => ({
  isConnected: true,
  isInternetReachable: true,
  pendingCount: 0,
  isSyncing: false,
  lastSyncTime: null,
  lastError: null,
  setConnection: (isConnected, isInternetReachable) => set({ isConnected, isInternetReachable }),
  setPendingCount: (pendingCount) => set({ pendingCount }),
  setSyncing: (isSyncing) => set({ isSyncing }),
  setLastSyncTime: (lastSyncTime) => set({ lastSyncTime }),
  setLastError: (lastError) => set({ lastError }),
}));

export const isOfflineMode = () => {
  const { isConnected, isInternetReachable } = useOfflineStore.getState();
  return !isConnected || !isInternetReachable;
};
