import type { EntityName } from '@/database';

export type SyncStatus = 'PENDING' | 'SYNCING' | 'SYNCED' | 'FAILED';
export type SyncOperation = 'CREATE' | 'UPDATE' | 'DELETE';

export type LocalEntity<T extends Record<string, unknown> = Record<string, unknown>> = T & {
  uuid: string;
  serverId?: string | null;
  version: number;
  syncStatus: SyncStatus;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
};

export type SyncQueueItem = {
  id: string;
  ownerId: string;
  entity: EntityName;
  recordId: string;
  operation: SyncOperation;
  payload: Record<string, unknown>;
  status: SyncStatus;
  retryCount: number;
  nextRetryAt?: string | null;
  error?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type DownloadRecord = {
  entity: EntityName;
  uuid: string;
  id?: string;
  version: number;
  updatedAt: string;
  deletedAt?: string | null;
  payload: Record<string, unknown>;
};

