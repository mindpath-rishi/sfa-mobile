# Offline-first architecture

Offline data is enabled only when the authenticated user's normalized `roleId` is `SALESMAN`.
Manager requests retain their existing online API behavior.

## Data flow

Salesman screens use repositories. Repositories read and write SQLite, which is the mobile source
of truth. A local create/update/soft-delete and its `sync_queue` operation are committed in the same
SQLite transaction. The sync engine uploads batches to `POST /api/v1/sync/upload`, then applies
incremental changes from `GET /api/v1/sync/download?lastSync=...`.

Master data uses server-wins conflict resolution. Transaction updates carry `uuid`, `version`,
`updatedAt`, and `deletedAt`; stale writes are returned as `VERSION_CONFLICT` and remain visible in
the failed queue for retry or business-specific resolution.

## Triggers

- Login and application launch
- Internet reconnection
- Returning the application to the foreground
- Five-minute foreground interval
- `syncService.sync()` for pull-to-refresh or a manual sync action

## Adding a module

1. Add its table to `database/entities.ts` (the migration creates common indexes).
2. Add its repository to `repositories/repositories.ts`.
3. Add the server collection mapping and ownership rule to the NestJS sync service.
4. Make the salesman screen/service read and mutate only through that repository.
5. Add upload idempotency and version-conflict tests.

Never store access or refresh tokens in SQLite. They remain in the existing secure token storage.
