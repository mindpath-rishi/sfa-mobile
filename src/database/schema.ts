import { ENTITY_TABLES } from './entities';

const entityTables = Object.values(ENTITY_TABLES)
  .map(
    (table) => `
    CREATE TABLE IF NOT EXISTS ${table} (
      uuid TEXT PRIMARY KEY NOT NULL,
      server_id TEXT,
      owner_id TEXT NOT NULL,
      data TEXT NOT NULL,
      search_text TEXT NOT NULL DEFAULT '',
      version INTEGER NOT NULL DEFAULT 1,
      sync_status TEXT NOT NULL DEFAULT 'SYNCED',
      deleted_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE UNIQUE INDEX IF NOT EXISTS idx_${table}_server_id ON ${table}(server_id) WHERE server_id IS NOT NULL;
    CREATE INDEX IF NOT EXISTS idx_${table}_owner_updated ON ${table}(owner_id, updated_at DESC);
    CREATE INDEX IF NOT EXISTS idx_${table}_search ON ${table}(owner_id, search_text);
    CREATE INDEX IF NOT EXISTS idx_${table}_sync ON ${table}(owner_id, sync_status);
  `,
  )
  .join('\n');

export const DATABASE_SCHEMA_VERSION = 1;
export const DATABASE_SCHEMA = `
  PRAGMA journal_mode = WAL;
  PRAGMA synchronous = FULL;
  PRAGMA foreign_keys = ON;
  PRAGMA busy_timeout = 5000;

  CREATE TABLE IF NOT EXISTS schema_migrations (
    version INTEGER PRIMARY KEY NOT NULL,
    applied_at TEXT NOT NULL
  );

  ${entityTables}

  CREATE TABLE IF NOT EXISTS sync_queue (
    id TEXT PRIMARY KEY NOT NULL,
    owner_id TEXT NOT NULL,
    entity TEXT NOT NULL,
    record_id TEXT NOT NULL,
    operation TEXT NOT NULL CHECK(operation IN ('CREATE', 'UPDATE', 'DELETE')),
    payload TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK(status IN ('PENDING', 'SYNCING', 'SYNCED', 'FAILED')),
    retry_count INTEGER NOT NULL DEFAULT 0,
    next_retry_at TEXT,
    error TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_sync_queue_pending ON sync_queue(owner_id, status, next_retry_at, created_at);
  CREATE UNIQUE INDEX IF NOT EXISTS idx_sync_queue_record_pending
    ON sync_queue(owner_id, entity, record_id) WHERE status IN ('PENDING', 'FAILED');

  CREATE TABLE IF NOT EXISTS sync_log (
    id TEXT PRIMARY KEY NOT NULL,
    owner_id TEXT NOT NULL,
    operation TEXT NOT NULL,
    entity TEXT NOT NULL,
    status TEXT NOT NULL,
    error TEXT,
    created_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_sync_log_created ON sync_log(owner_id, created_at DESC);

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT NOT NULL,
    owner_id TEXT NOT NULL,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    PRIMARY KEY(key, owner_id)
  );

  CREATE TABLE IF NOT EXISTS api_cache (
    owner_id TEXT NOT NULL,
    cache_key TEXT NOT NULL,
    response TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    PRIMARY KEY(owner_id, cache_key)
  );
  CREATE INDEX IF NOT EXISTS idx_api_cache_updated
    ON api_cache(owner_id, updated_at DESC);
`;
