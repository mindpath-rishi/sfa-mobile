import type { SQLiteDatabase } from 'expo-sqlite';

import { ENTITY_TABLES, type EntityName, getDatabase, withTransaction } from '@/database';
import type { DownloadRecord, LocalEntity, SyncOperation } from '@/models/offline.models';
import { createUuid } from '@/utils/uuid';
import { validateOfflineEntity } from './offline-validation';

type EntityRow = {
  uuid: string;
  server_id: string | null;
  data: string;
  version: number;
  sync_status: LocalEntity['syncStatus'];
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
};

const searchText = (data: Record<string, unknown>) =>
  Object.values(data)
    .filter((value) => ['string', 'number'].includes(typeof value))
    .join(' ')
    .toLocaleLowerCase();

const mapRow = <T extends Record<string, unknown>>(row: EntityRow): LocalEntity<T> => ({
  ...(JSON.parse(row.data) as T),
  uuid: row.uuid,
  serverId: row.server_id,
  version: row.version,
  syncStatus: row.sync_status,
  deletedAt: row.deleted_at,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const addToQueue = async (
  database: SQLiteDatabase,
  ownerId: string,
  entity: EntityName,
  recordId: string,
  operation: SyncOperation,
  payload: Record<string, unknown>,
) => {
  const now = new Date().toISOString();
  const existing = await database.getFirstAsync<{ id: string; operation: SyncOperation }>(
    `SELECT id, operation FROM sync_queue
     WHERE owner_id = ? AND entity = ? AND record_id = ? AND status IN ('PENDING', 'FAILED')`,
    ownerId,
    entity,
    recordId,
  );
  const finalOperation = existing?.operation === 'CREATE' ? 'CREATE' : operation;
  if (existing) {
    await database.runAsync(
      `UPDATE sync_queue SET operation = ?, payload = ?, status = 'PENDING', error = NULL,
       retry_count = 0, next_retry_at = NULL, updated_at = ? WHERE id = ?`,
      finalOperation,
      JSON.stringify(payload),
      now,
      existing.id,
    );
    return;
  }
  await database.runAsync(
    `INSERT INTO sync_queue
     (id, owner_id, entity, record_id, operation, payload, status, retry_count, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, 'PENDING', 0, ?, ?)`,
    createUuid(),
    ownerId,
    entity,
    recordId,
    operation,
    JSON.stringify(payload),
    now,
    now,
  );
};

export class BaseRepository<T extends Record<string, unknown>> {
  readonly table: string;

  constructor(readonly entity: EntityName) {
    this.table = ENTITY_TABLES[entity];
  }

  async findById(ownerId: string, id: string) {
    const database = await getDatabase();
    const row = await database.getFirstAsync<EntityRow>(
      `SELECT * FROM ${this.table} WHERE owner_id = ? AND (uuid = ? OR server_id = ?) AND deleted_at IS NULL`,
      ownerId,
      id,
      id,
    );
    return row ? mapRow<T>(row) : null;
  }

  async findAll(ownerId: string, options: { search?: string; page?: number; limit?: number } = {}) {
    const database = await getDatabase();
    const page = Math.max(1, options.page ?? 1);
    const limit = Math.min(200, Math.max(1, options.limit ?? 50));
    const query = options.search?.trim().toLocaleLowerCase();
    const rows = await database.getAllAsync<EntityRow>(
      `SELECT * FROM ${this.table} WHERE owner_id = ? AND deleted_at IS NULL
       AND (? = '' OR search_text LIKE ?) ORDER BY updated_at DESC LIMIT ? OFFSET ?`,
      ownerId,
      query ?? '',
      `%${query ?? ''}%`,
      limit,
      (page - 1) * limit,
    );
    return rows.map(mapRow<T>);
  }

  async create(ownerId: string, data: T) {
    if (!ownerId?.trim())
      throw new Error(`Cannot save offline ${this.entity}: ownerId is required`);
    validateOfflineEntity(this.entity, data);
    const uuid = String(data.uuid ?? createUuid());
    const now = new Date().toISOString();
    await withTransaction(async (database) => {
      await database.runAsync(
        `INSERT INTO ${this.table}
         (uuid, server_id, owner_id, data, search_text, version, sync_status, created_at, updated_at)
         VALUES (?, NULL, ?, ?, ?, 1, 'PENDING', ?, ?)`,
        uuid,
        ownerId,
        JSON.stringify(data),
        searchText(data),
        now,
        now,
      );
      await addToQueue(database, ownerId, this.entity, uuid, 'CREATE', { ...data, uuid });
    });
    return this.findById(ownerId, uuid) as Promise<LocalEntity<T>>;
  }

  async update(ownerId: string, id: string, changes: Partial<T>) {
    const current = await this.findById(ownerId, id);
    if (!current) throw new Error(`${this.entity} record not found: ${id}`);
    const data = { ...current, ...changes } as T;
    validateOfflineEntity(this.entity, data);
    const now = new Date().toISOString();
    await withTransaction(async (database) => {
      await database.runAsync(
        `UPDATE ${this.table} SET data = ?, search_text = ?, version = version + 1,
         sync_status = 'PENDING', updated_at = ? WHERE owner_id = ? AND uuid = ?`,
        JSON.stringify(data),
        searchText(data),
        now,
        ownerId,
        current.uuid,
      );
      await addToQueue(database, ownerId, this.entity, current.uuid, 'UPDATE', data);
    });
    return this.findById(ownerId, current.uuid) as Promise<LocalEntity<T>>;
  }

  /** Update a downloaded snapshot without creating a server sync operation. */
  async updateLocal(ownerId: string, id: string, changes: Partial<T>) {
    const current = await this.findById(ownerId, id);
    if (!current) throw new Error(`${this.entity} record not found: ${id}`);
    const data = { ...current, ...changes } as T;
    const now = new Date().toISOString();
    const database = await getDatabase();
    await database.runAsync(
      `UPDATE ${this.table} SET data = ?, search_text = ?, updated_at = ?
       WHERE owner_id = ? AND uuid = ?`,
      JSON.stringify(data),
      searchText(data),
      now,
      ownerId,
      current.uuid,
    );
    return this.findById(ownerId, current.uuid) as Promise<LocalEntity<T>>;
  }

  async delete(ownerId: string, id: string) {
    const current = await this.findById(ownerId, id);
    if (!current) return;
    const now = new Date().toISOString();
    await withTransaction(async (database) => {
      await database.runAsync(
        `UPDATE ${this.table} SET deleted_at = ?, sync_status = 'PENDING', updated_at = ?
         WHERE owner_id = ? AND uuid = ?`,
        now,
        now,
        ownerId,
        current.uuid,
      );
      await addToQueue(database, ownerId, this.entity, current.uuid, 'DELETE', current);
    });
  }

  async upsertRemote(ownerId: string, record: DownloadRecord) {
    const database = await getDatabase();
    const existing = await database.getFirstAsync<EntityRow>(
      `SELECT * FROM ${this.table} WHERE owner_id = ? AND (uuid = ? OR server_id = ?)`,
      ownerId,
      record.uuid,
      record.id ?? '',
    );
    // Never overwrite a local record while any queue operation for it remains.
    // A newer edit can be queued while an older version is actively uploading.
    const queued = existing
      ? await database.getFirstAsync<{ id: string }>(
          `SELECT id FROM sync_queue
           WHERE owner_id = ? AND entity = ? AND record_id = ?
           AND status IN ('PENDING', 'FAILED', 'SYNCING') LIMIT 1`,
          ownerId,
          this.entity,
          existing.uuid,
        )
      : null;
    if (existing?.sync_status === 'PENDING' || queued) return;
    const createdAt = existing?.created_at ?? record.updatedAt;
    await database.runAsync(
      `INSERT OR REPLACE INTO ${this.table}
       (uuid, server_id, owner_id, data, search_text, version, sync_status, deleted_at, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 'SYNCED', ?, ?, ?)`,
      record.uuid,
      record.id ?? null,
      ownerId,
      JSON.stringify(record.payload),
      searchText(record.payload),
      record.version,
      record.deletedAt ?? null,
      createdAt,
      record.updatedAt,
    );
  }

  async markSynced(
    ownerId: string,
    uuid: string,
    serverId?: string,
    version?: number,
    currentQueueId?: string,
  ) {
    const database = await getDatabase();
    await database.runAsync(
      `UPDATE ${this.table}
       SET server_id = COALESCE(?, server_id),
           version = COALESCE(?, version),
           sync_status = CASE WHEN EXISTS (
             SELECT 1 FROM sync_queue
             WHERE owner_id = ? AND entity = ? AND record_id = ?
               AND status IN ('PENDING', 'FAILED', 'SYNCING')
               AND (? IS NULL OR id != ?)
           ) THEN 'PENDING' ELSE 'SYNCED' END
       WHERE owner_id = ? AND uuid = ?`,
      serverId ?? null,
      version ?? null,
      ownerId,
      this.entity,
      uuid,
      currentQueueId ?? null,
      currentQueueId ?? null,
      ownerId,
      uuid,
    );
  }
}
