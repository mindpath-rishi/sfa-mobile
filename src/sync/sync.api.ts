import { api } from '@/core/network';
import type { DownloadRecord, SyncOperation } from '@/models/offline.models';

export type UploadOperation = {
  queueId: string;
  entity: string;
  operation: SyncOperation;
  localId: string;
  payload: Record<string, unknown>;
};

export type UploadResult = {
  queueId: string;
  localId: string;
  success: boolean;
  serverId?: string;
  version?: number;
  conflict?: boolean;
  error?: string;
};

export const syncApi = {
  upload: (operations: UploadOperation[], expectedUserId: string) =>
    api.post<{ results: UploadResult[] }, { operations: UploadOperation[] }>(
      '/sync/upload',
      { operations },
      { showLoader: false, expectedUserId },
    ),
  download: (lastSync: string | null, cursor: string | undefined, expectedUserId: string) =>
    api.get<{ records: DownloadRecord[]; cursor?: string; hasMore: boolean; serverTime: string }>(
      '/sync/download',
      {
        params: { lastSync: lastSync ?? undefined, cursor },
        showLoader: false,
        expectedUserId,
      },
    ),
};
