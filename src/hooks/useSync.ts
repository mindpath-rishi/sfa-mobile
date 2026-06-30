import { useOfflineStore } from '@/core/offline';
import { syncService } from '@/sync';

export const useSync = () => {
  const status = useOfflineStore();
  return {
    ...status,
    sync: syncService.sync,
    retryFailed: syncService.retryFailed,
  };
};

