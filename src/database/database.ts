import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';

import { DATABASE_SCHEMA, DATABASE_SCHEMA_VERSION } from './schema';

let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;

export const getDatabase = async () => {
  if (!databasePromise) {
    databasePromise = SQLite.openDatabaseAsync('Sales Stream-offline.db').then(async (database) => {
      await database.execAsync(DATABASE_SCHEMA);
      await database.runAsync(
        'INSERT OR IGNORE INTO schema_migrations(version, applied_at) VALUES (?, ?)',
        DATABASE_SCHEMA_VERSION,
        new Date().toISOString(),
      );
      return database;
    });
  }
  return databasePromise;
};

/**
 * Runs `work` in an exclusive transaction on its own connection, so writes
 * made elsewhere at the same time are not pulled into (or rolled back with)
 * it. Web has no exclusive transactions; there the work runs without one.
 */
export const withExclusiveTransaction = async <T>(
  work: (database: SQLite.SQLiteDatabase) => Promise<T>,
) => {
  const database = await getDatabase();
  if (Platform.OS === 'web') return work(database);
  let result!: T;
  await database.withExclusiveTransactionAsync(async (transaction) => {
    result = await work(transaction);
  });
  return result;
};

export const withTransaction = async <T>(work: (database: SQLite.SQLiteDatabase) => Promise<T>) => {
  const database = await getDatabase();
  let result!: T;
  await database.withTransactionAsync(async () => {
    result = await work(database);
  });
  return result;
};
