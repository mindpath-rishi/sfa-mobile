import { ENTITY_TABLES, getDatabase, withTransaction } from '@/database';
import type { EntityName } from '@/database/entities';
import { isSalesman } from '@/core/navigation/role.utils';
import {
  hydrateOfflinePreference,
  saveOfflinePreference,
  useOfflineStore,
} from '@/core/offline/offline.store';
import { useAuthStore } from '@/core/store/auth.store';
import type { SyncQueueItem } from '@/models/offline.models';
import { repositories } from '@/repositories';
import { createUuid } from '@/utils/uuid';
import { uploadFormData } from '@/core/network/upload';
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';

import { syncApi, type UploadOperation } from './sync.api';

/**
 * v11 forces one full download after:
 * - adding vanErpClosing
 * - moving offline live stock display to vanDailyStock
 * - changing offline sale stock deduction flow
 *
 * Normal server sync still remains incremental after this full download:
 * records are sent by updatedAt > lastSync.
 */
const LAST_SYNC_KEY = 'last_sync_time_v11';

const BATCH_SIZE = 50;
const MAX_RETRIES = 8;
const BASE_RETRY_MS = 2_000;

type QueueRow = {
  id: string;
  owner_id: string;
  entity: EntityName;
  record_id: string;
  operation: SyncQueueItem['operation'];
  payload: string;
  status: SyncQueueItem['status'];
  retry_count: number;
  next_retry_at: string | null;
  error: string | null;
  created_at: string;
  updated_at: string;
};

const OWNER_FIELDS_BY_ENTITY: Partial<Record<EntityName, string[]>> = {
  routeSessions: ['userId', 'employeeId'],
  orders: ['employeeId', 'userId'],
  collections: ['employeeId', 'userId'],
  attendance: ['userId', 'employeeId'],
  activities: ['userId', 'employeeId'],
  visits: ['employeeId', 'userId'],
  interactions: ['employeeId', 'userId'],
  nonSales: ['employeeId', 'userId'],
  leaves: ['userId', 'employeeId'],
  surveys: ['employeeId', 'userId'],
  expenses: ['employeeId', 'userId'],
  returns: ['employeeId', 'userId'],
  complaints: ['employeeId', 'userId'],
  vanDailyStock: ['employeeId', 'userId'],
  inventoryTransactions: ['employeeId', 'userId'],
};

const payloadOwnerId = (item: QueueRow) => {
  let payload: Record<string, unknown>;

  try {
    payload = JSON.parse(item.payload) as Record<string, unknown>;
  } catch {
    return null;
  }

  const queueOwnerMarker = String(payload.ownerId ?? '').trim();
  const candidates = [
    ...(queueOwnerMarker ? [queueOwnerMarker] : []),
    ...(OWNER_FIELDS_BY_ENTITY[item.entity] ?? [])
      .map((field) => String(payload[field] ?? '').trim())
      .filter(Boolean),
  ];

  if (item.entity === 'orders' && Array.isArray(payload.employees)) {
    for (const employee of payload.employees) {
      if (!employee || typeof employee !== 'object') continue;

      const employeeId = String((employee as Record<string, unknown>).employeeId ?? '').trim();

      if (employeeId) candidates.push(employeeId);
    }
  }

  const uniqueCandidates = [...new Set(candidates)];

  return uniqueCandidates.length === 1 ? uniqueCandidates[0] : null;
};

const ownerId = () => useAuthStore.getState().user?.userId ?? '';

const enabled = () =>
  isSalesman(useAuthStore.getState().user) &&
  useAuthStore.getState().user?.offlineAccessAllowed === true;

let activeSync: Promise<void> | null = null;
let activeSyncOwnerId: string | null = null;
let syncRequestedWhileActive = false;

const log = async (operation: string, entity: string, status: string, error?: string) => {
  const database = await getDatabase();

  await database.runAsync(
    `INSERT INTO sync_log(id, owner_id, operation, entity, status, error, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    createUuid(),
    ownerId(),
    operation,
    entity,
    status,
    error ?? null,
    new Date().toISOString(),
  );
};

const pendingCount = async () => {
  if (!ownerId()) return 0;

  const database = await getDatabase();

  const row = await database.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) AS count FROM sync_queue
     WHERE owner_id = ? AND status IN ('PENDING', 'FAILED', 'SYNCING')`,
    ownerId(),
  );

  return row?.count ?? 0;
};

const updatePendingCount = async () => {
  useOfflineStore.getState().setPendingCount(await pendingCount());
};

const getSetting = async (key: string, settingOwnerId = ownerId()) => {
  const database = await getDatabase();

  return database.getFirstAsync<{ value: string }>(
    'SELECT value FROM settings WHERE owner_id = ? AND key = ?',
    settingOwnerId,
    key,
  );
};

const setSetting = async (key: string, value: string, settingOwnerId = ownerId()) => {
  const database = await getDatabase();

  await database.runAsync(
    `INSERT INTO settings(key, owner_id, value, updated_at) VALUES (?, ?, ?, ?)
     ON CONFLICT(key, owner_id) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
    key,
    settingOwnerId,
    value,
    new Date().toISOString(),
  );
};

const nextBatch = async (batchOwnerId = ownerId()) => {
  const database = await getDatabase();
  const now = new Date().toISOString();

  return database.getAllAsync<QueueRow>(
    `SELECT * FROM sync_queue
     WHERE owner_id = ?
       AND status IN ('PENDING', 'FAILED')
       AND retry_count < ?
       AND (next_retry_at IS NULL OR next_retry_at <= ?)
     ORDER BY created_at ASC
     LIMIT ?`,
    batchOwnerId,
    MAX_RETRIES,
    now,
    BATCH_SIZE,
  );
};

const moveQueueItemToPayloadOwner = async (item: QueueRow, correctOwnerId: string) => {
  const table = ENTITY_TABLES[item.entity];
  const now = new Date().toISOString();

  await withTransaction(async (database) => {
    const existingQueueItem = await database.getFirstAsync<{ id: string }>(
      `SELECT id FROM sync_queue
       WHERE owner_id = ?
         AND entity = ?
         AND record_id = ?
         AND status IN ('PENDING', 'FAILED')
         AND id != ?
       LIMIT 1`,
      correctOwnerId,
      item.entity,
      item.record_id,
      item.id,
    );

    await database.runAsync(
      `UPDATE ${table}
       SET owner_id = ?, updated_at = ?
       WHERE uuid = ? AND owner_id = ?`,
      correctOwnerId,
      now,
      item.record_id,
      item.owner_id,
    );

    if (existingQueueItem) {
      await database.runAsync('DELETE FROM sync_queue WHERE id = ?', item.id);
    } else {
      await database.runAsync(
        `UPDATE sync_queue
         SET owner_id = ?,
             status = 'PENDING',
             retry_count = 0,
             next_retry_at = NULL,
             error = NULL,
             updated_at = ?
         WHERE id = ? AND owner_id = ?`,
        correctOwnerId,
        now,
        item.id,
        item.owner_id,
      );
    }
  });
};

const resetRetryableFailedItems = async () => {
  if (!ownerId()) return;

  const database = await getDatabase();

  await database.runAsync(
    `UPDATE sync_queue
     SET status = 'PENDING',
         retry_count = 0,
         next_retry_at = NULL,
         error = NULL,
         updated_at = ?
     WHERE owner_id = ?
       AND status IN ('FAILED', 'SYNCING')`,
    new Date().toISOString(),
    ownerId(),
  );

  await updatePendingCount();
};

const markQueueItemSynced = async (item: QueueRow) => {
  const database = await getDatabase();

  await database.runAsync(
    `UPDATE sync_queue
     SET status = 'SYNCED',
         error = NULL,
         updated_at = ?
     WHERE id = ?`,
    new Date().toISOString(),
    item.id,
  );

  await log(item.operation, item.entity, 'SYNCED');

  await updatePendingCount();
};

const resetToPending = async (items: QueueRow[]) => {
  if (!items.length) return;

  const database = await getDatabase();

  await database.runAsync(
    `UPDATE sync_queue
     SET status = 'PENDING',
         updated_at = ?
     WHERE id IN (${items.map(() => '?').join(',')})`,
    new Date().toISOString(),
    ...items.map((item) => item.id),
  );

  await updatePendingCount();
};

const markFailed = async (item: QueueRow, error: string) => {
  const database = await getDatabase();

  const retries = item.retry_count + 1;
  const delay = Math.min(BASE_RETRY_MS * 2 ** item.retry_count, 5 * 60_000);
  const nextRetry = new Date(Date.now() + delay).toISOString();

  await database.runAsync(
    `UPDATE sync_queue
     SET status = 'FAILED',
         retry_count = ?,
         next_retry_at = ?,
         error = ?,
         updated_at = ?
     WHERE id = ?`,
    retries,
    nextRetry,
    error,
    new Date().toISOString(),
    item.id,
  );

  await log(item.operation, item.entity, 'FAILED', error);

  await updatePendingCount();
};

const uploadMediaItem = async (item: QueueRow) => {
  const payload = JSON.parse(item.payload) as {
    customerId?: string;
    uri?: string;
    extension?: string;
    isPrimary?: boolean;
  };

  if (!payload.customerId || !payload.uri) {
    throw new Error('Offline media record is missing customerId or file URI');
  }

  if (Platform.OS !== 'web' && payload.uri.startsWith('file://')) {
    const file = await FileSystem.getInfoAsync(payload.uri);

    if (!file.exists) {
      throw new Error('Saved photo file no longer exists on this device');
    }
  }

  const extension = payload.extension || 'jpg';
  const mimeType = extension.toLowerCase() === 'png' ? 'image/png' : 'image/jpeg';

  const fileName = `outlet-${payload.customerId}-${Date.now()}.${extension}`;
  const formData = new FormData();

  if (Platform.OS === 'web') {
    const blob = await fetch(payload.uri).then((response) => response.blob());

    formData.append('file', blob, fileName);
  } else {
    formData.append('file', {
      uri: payload.uri,
      name: fileName,
      type: mimeType,
    } as any);
  }

  formData.append('ownerType', 'CUSTOMER');
  formData.append('ownerId', payload.customerId);
  formData.append('mediaType', 'IMAGE');
  formData.append('purpose', payload.isPrimary ? 'PROFILE' : 'PROOF');
  formData.append('title', 'Outlet Photo');
  formData.append('isPrimary', String(Boolean(payload.isPrimary)));

  const response = await uploadFormData<any>('/media/upload', formData, {
    showLoader: false,
  });

  if (!response.success) {
    throw new Error(response.message || 'Media upload failed');
  }

  return String(response.data?.mediaId ?? item.record_id);
};

const deleteQueuedMediaFile = async (item: QueueRow) => {
  if (Platform.OS === 'web' || !FileSystem.documentDirectory) return;

  const payload = JSON.parse(item.payload) as {
    uri?: string;
  };

  if (payload.uri?.startsWith(FileSystem.documentDirectory)) {
    await FileSystem.deleteAsync(payload.uri, {
      idempotent: true,
    }).catch(() => undefined);
  }
};

const upload = async (uploadOwnerId = ownerId()) => {
  const database = await getDatabase();
  const mediaWarnings: string[] = [];

  while (true) {
    if (!uploadOwnerId || ownerId() !== uploadOwnerId) return mediaWarnings;

    const batch = await nextBatch(uploadOwnerId);

    if (!batch.length) return mediaWarnings;
    if (ownerId() !== uploadOwnerId) return mediaWarnings;

    const validBatch: QueueRow[] = [];

    for (const item of batch) {
      const recordOwnerId = payloadOwnerId(item);

      if (recordOwnerId && recordOwnerId !== uploadOwnerId) {
        await moveQueueItemToPayloadOwner(item, recordOwnerId);
        continue;
      }

      validBatch.push(item);
    }

    if (!validBatch.length) {
      await updatePendingCount();
      continue;
    }

    const ids = validBatch.map((item) => item.id);

    await database.runAsync(
      `UPDATE sync_queue
       SET status = 'SYNCING',
           updated_at = ?
       WHERE id IN (${ids.map(() => '?').join(',')})`,
      new Date().toISOString(),
      ...ids,
    );

    await updatePendingCount();

    // Authentication can change while SQLite is resolving a batch. Never send
    // one salesman's rows with another salesman's newly installed token.
    if (ownerId() !== uploadOwnerId) {
      await resetToPending(validBatch);
      return mediaWarnings;
    }

    const mediaItems = validBatch.filter((item) => item.entity === 'mediaUploads');
    const regularItems = validBatch.filter((item) => item.entity !== 'mediaUploads');

    const operations: UploadOperation[] = regularItems.map((item) => ({
      queueId: item.id,
      entity: item.entity,
      operation: item.operation,
      localId: item.record_id,
      payload: JSON.parse(item.payload),
    }));

    const regularErrors: string[] = [];

    if (regularItems.length) {
      let response;

      try {
        if (ownerId() !== uploadOwnerId) {
          await resetToPending(validBatch);
          return mediaWarnings;
        }

        response = await syncApi.upload(operations, uploadOwnerId);

        if (ownerId() !== uploadOwnerId) {
          await resetToPending(validBatch);
          return mediaWarnings;
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Upload request failed';

        for (const item of regularItems) {
          await markFailed(item, message);
        }

        await resetToPending(mediaItems);

        throw error;
      }

      if (!response.success || !response.data?.results) {
        const message = response.message ?? 'Upload failed';

        for (const item of regularItems) {
          await markFailed(item, message);
        }

        await resetToPending(mediaItems);

        throw new Error(message);
      }

      for (const item of regularItems) {
        const result = response.data.results.find((entry) => entry.queueId === item.id);

        if (!result?.success) {
          const message =
            result?.error ?? (result?.conflict ? 'VERSION_CONFLICT' : 'Upload failed');

          await markFailed(item, message);

          regularErrors.push(`${item.entity}: ${message}`);

          continue;
        }

        const repository = repositories[item.entity];

        if (!repository) {
          const message = `Missing local repository for uploaded entity: ${String(item.entity)}`;

          await markFailed(item, message);

          regularErrors.push(`${item.entity}: ${message}`);

          continue;
        }

        await repository.markSynced(
          uploadOwnerId,
          item.record_id,
          result.serverId,
          result.version,
          item.id,
        );

        await markQueueItemSynced(item);
      }
    }

    /**
     * Media is independent from the JSON operation batch.
     * A photo failure must remain retryable and visible, but must not prevent
     * master-data download or the initial offline dataset from becoming available.
     */
    for (let mediaIndex = 0; mediaIndex < mediaItems.length; mediaIndex += 1) {
      const item = mediaItems[mediaIndex];

      if (ownerId() !== uploadOwnerId) {
        await resetToPending(mediaItems.slice(mediaIndex));
        return mediaWarnings;
      }

      try {
        const serverId = await uploadMediaItem(item);

        await repositories.mediaUploads.markSynced(
          uploadOwnerId,
          item.record_id,
          serverId,
          1,
          item.id,
        );

        await markQueueItemSynced(item);
        await deleteQueuedMediaFile(item);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Media upload failed';

        await markFailed(item, message);

        mediaWarnings.push(`Photo ${item.record_id.slice(-8)}: ${message}`);
      }
    }

    await updatePendingCount();

    if (regularErrors.length) {
      throw new Error(`Offline upload failed — ${regularErrors.join('; ')}`);
    }
  }
};

const download = async (downloadOwnerId = ownerId()) => {
  if (!downloadOwnerId || ownerId() !== downloadOwnerId) return;

  const setting = await getSetting(LAST_SYNC_KEY, downloadOwnerId);

  let cursor: string | undefined;
  let serverTime: string | undefined;

  do {
    if (ownerId() !== downloadOwnerId) return;

    const response = await syncApi.download(setting?.value ?? null, cursor, downloadOwnerId);

    if (ownerId() !== downloadOwnerId) return;

    if (!response.success || !response.data) {
      throw new Error(response.message ?? 'Download failed');
    }

    for (const record of response.data.records) {
      const repository = repositories[record.entity];

      if (!repository) {
        await log(
          'DOWNLOAD',
          String(record.entity),
          'SKIPPED',
          `Missing local repository for entity: ${String(record.entity)}`,
        );

        continue;
      }

      try {
        await repository.upsertRemote(downloadOwnerId, record);
      } catch (error) {
        await log(
          'DOWNLOAD',
          String(record.entity),
          'FAILED',
          error instanceof Error ? error.message : 'Failed to save remote record',
        );

        throw error;
      }
    }

    cursor = response.data.hasMore ? response.data.cursor : undefined;

    /**
     * Keep the first page watermark.
     * Records changed while later pages are downloading will then remain newer
     * than this value and arrive next run.
     */
    serverTime ??= response.data.serverTime;
  } while (cursor);

  const watermark = serverTime ?? new Date().toISOString();

  if (ownerId() !== downloadOwnerId) return;

  await setSetting(LAST_SYNC_KEY, watermark, downloadOwnerId);

  useOfflineStore.getState().setLastSyncTime(watermark);
};

export const syncService = {
  async getPendingCount() {
    return pendingCount();
  },

  /**
   * =====================================================
   * DEVICE → SERVER UPLOAD BEFORE DISABLING OFFLINE MODE
   * =====================================================
   *
   * Use this when user disables Offline Mode.
   *
   * Important:
   * - This method shows Device → Server upload screen.
   * - It uploads pending local queue items.
   * - It does NOT download master data.
   * - It throws if any pending item remains.
   * - Offline Mode should be disabled only after this method succeeds.
   */
  async uploadDeviceDataBeforeDisableOffline() {
    if (!enabled() || !ownerId()) return 0;

    const uploadOwnerId = ownerId();
    const state = useOfflineStore.getState();

    const queuedBeforeUpload = await pendingCount();

    if (!state.isConnected || !state.isInternetReachable) {
      throw new Error(
        'Please connect to the internet. Device data must be uploaded before disabling Offline Mode.',
      );
    }

    if (activeSync) {
      state.setDeviceServerUploadVisible(
        true,
        'Finishing current sync before uploading device data...',
      );

      await activeSync;
    }

    await resetRetryableFailedItems();

    const pendingBeforeUpload = await pendingCount();

    state.setDeviceServerUploadVisible(
      true,
      pendingBeforeUpload > 0
        ? `Uploading ${pendingBeforeUpload} pending item(s) from device to server...`
        : 'Checking pending device data before disabling Offline Mode...',
    );

    state.setSyncing(true);
    state.setLastError(null);

    try {
      const mediaWarnings = await upload(uploadOwnerId);

      if (mediaWarnings.length) {
        state.setLastError(`Media pending — ${mediaWarnings.join('; ')}`);
      }

      await updatePendingCount();

      const remaining = await pendingCount();

      if (remaining > 0) {
        throw new Error(
          `${remaining} pending entr${
            remaining === 1 ? 'y is' : 'ies are'
          } still not uploaded. Offline Mode was not disabled.`,
        );
      }

      state.setDeviceServerUploadMessage('Device data uploaded successfully.');

      return queuedBeforeUpload;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Device data upload failed';

      useOfflineStore.getState().setLastError(message);

      throw new Error(message);
    } finally {
      useOfflineStore.getState().setSyncing(false);
      useOfflineStore.getState().setDeviceServerUploadVisible(false);
      await updatePendingCount();
    }
  },

  async uploadPendingBeforeSettlement() {
    const uploadOwnerId = ownerId();
    const queuedBeforeUpload = await pendingCount();

    if (!queuedBeforeUpload) return 0;

    const state = useOfflineStore.getState();

    if (!state.isConnected || !state.isInternetReachable) {
      throw new Error(
        `${queuedBeforeUpload} pending entr${
          queuedBeforeUpload === 1 ? 'y' : 'ies'
        } must be uploaded before settlement. Please connect to the internet.`,
      );
    }

    /**
     * Do not start a second uploader while normal background sync is active.
     */
    if (activeSync) {
      await activeSync;
    } else {
      state.setSyncing(true);
      state.setLastError(null);

      try {
        const warnings = await upload(uploadOwnerId);

        if (warnings.length) {
          state.setLastError(`Media pending — ${warnings.join('; ')}`);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Pending entry upload failed';

        state.setLastError(message);

        throw new Error(message);
      } finally {
        state.setSyncing(false);
        await updatePendingCount();
      }
    }

    const remaining = await pendingCount();

    if (remaining) {
      throw new Error(
        `${remaining} pending entr${
          remaining === 1 ? 'y is' : 'ies are'
        } still not uploaded. Settlement was not completed.`,
      );
    }

    return queuedBeforeUpload;
  },

  async initialise() {
    /**
     * Queue rows/settings are scoped by owner_id, but Zustand sync status is
     * shared in memory. Reset it before hydrating the logged-in owner so a
     * previous salesman's error or pending count cannot leak into this session.
     */
    useOfflineStore.getState().resetUserSyncState();

    await hydrateOfflinePreference(ownerId());

    if (useAuthStore.getState().user?.offlineAccessAllowed !== true) {
      await saveOfflinePreference(ownerId(), false);
    }

    const database = await getDatabase();

    if (ownerId()) {
      /**
       * A force-close or OS termination can leave rows permanently marked as
       * SYNCING. No request is still running after startup, so recover them.
       */
      await database.runAsync(
        `UPDATE sync_queue
         SET status = 'PENDING',
             next_retry_at = NULL,
             updated_at = ?
         WHERE owner_id = ?
           AND status = 'SYNCING'`,
        new Date().toISOString(),
        ownerId(),
      );
    }

    const setting = ownerId() ? await getSetting(LAST_SYNC_KEY) : null;

    useOfflineStore.getState().setLastSyncTime(setting?.value ?? null);

    await updatePendingCount();
  },

  async sync() {
    if (!enabled() || !ownerId()) return;

    const syncOwnerId = ownerId();

    if (activeSync) {
      if (activeSyncOwnerId !== syncOwnerId) {
        await activeSync;

        if (enabled() && ownerId() === syncOwnerId) {
          await this.sync();
        }

        return;
      }

      syncRequestedWhileActive = true;

      const runningSync = activeSync;

      await runningSync;

      /**
       * The completion handler starts one coalesced follow-up sync for all
       * mutations that arrived while the first pass was running.
       */
      if (activeSync) await activeSync;

      return;
    }

    activeSyncOwnerId = syncOwnerId;
    activeSync = (async () => {
      const state = useOfflineStore.getState();

      if (!state.isConnected || !state.isInternetReachable) return;

      state.setSyncing(true);
      state.setLastError(null);

      try {
        const mediaWarnings = await upload(syncOwnerId);

        if (ownerId() !== syncOwnerId) return;

        await download(syncOwnerId);

        /**
         * Important:
         * Local live stock in offline mode comes from vanDailyStock.
         * Sale creation updates vanDailyStock using updateLocal().
         * Server stock is reduced after inventoryTransactions upload.
         *
         * If you use offline dashboard snapshots, refresh them here.
         */
        // await prefetchOfflineSnapshots(true);

        if (mediaWarnings.length) {
          state.setLastError(`Media pending — ${mediaWarnings.join('; ')}`);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Synchronization failed';

        if (ownerId() !== syncOwnerId) return;

        useOfflineStore.getState().setLastError(message);

        await log('SYNC', 'ALL', 'FAILED', message);
      } finally {
        if (ownerId() !== syncOwnerId) return;

        useOfflineStore.getState().setSyncing(false);

        await updatePendingCount();
      }
    })().finally(() => {
      activeSync = null;
      activeSyncOwnerId = null;

      if (syncRequestedWhileActive) {
        syncRequestedWhileActive = false;

        void syncService.sync();
      }
    });

    return activeSync;
  },

  async retryFailed() {
    if (activeSync) {
      await this.sync();

      return;
    }

    const database = await getDatabase();

    await database.runAsync(
      `UPDATE sync_queue
       SET status = 'PENDING',
           retry_count = 0,
           next_retry_at = NULL,
           error = NULL
       WHERE owner_id = ?
         AND status IN ('FAILED', 'SYNCING')`,
      ownerId(),
    );

    await updatePendingCount();

    await this.sync();
  },
};
