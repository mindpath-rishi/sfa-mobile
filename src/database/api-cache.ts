import type { ApiResponse } from '@/core/network/api.types';

import { getDatabase } from './database';

const stableValue = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(stableValue);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, entry]) => [key, stableValue(entry)]),
    );
  }
  return value;
};

export const createApiCacheKey = (url: string, params?: Record<string, unknown>) =>
  `GET:${url}:${JSON.stringify(stableValue(params ?? {}))}`;

export const getCachedApiResponse = async <T>(
  ownerId: string,
  url: string,
  params?: Record<string, unknown>,
): Promise<ApiResponse<T> | null> => {
  if (!ownerId) return null;
  const database = await getDatabase();
  let row = await database.getFirstAsync<{ response: string }>(
    'SELECT response FROM api_cache WHERE owner_id = ? AND cache_key = ?',
    ownerId,
    createApiCacheKey(url, params),
  );
  // Dynamic dashboards may request a slightly different date/page while
  // offline. Prefer the exact entry, then use the newest snapshot for the URL.
  row ??= await database.getFirstAsync<{ response: string }>(
    `SELECT response FROM api_cache
     WHERE owner_id = ? AND cache_key LIKE ?
     ORDER BY updated_at DESC LIMIT 1`,
    ownerId,
    `GET:${url}:%`,
  );
  if (!row?.response) return null;
  try {
    return { ...(JSON.parse(row.response) as ApiResponse<T>), offline: true };
  } catch {
    return null;
  }
};

export const setCachedApiResponse = async <T>(
  ownerId: string,
  url: string,
  params: Record<string, unknown> | undefined,
  response: ApiResponse<T>,
) => {
  if (!ownerId) return;
  const database = await getDatabase();
  await database.runAsync(
    `INSERT INTO api_cache(owner_id, cache_key, response, updated_at)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(owner_id, cache_key) DO UPDATE SET
       response = excluded.response, updated_at = excluded.updated_at`,
    ownerId,
    createApiCacheKey(url, params),
    JSON.stringify(response),
    new Date().toISOString(),
  );
};
