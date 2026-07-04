import * as SQLite from 'expo-sqlite';

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

export const withTransaction = async <T>(work: (database: SQLite.SQLiteDatabase) => Promise<T>) => {
  const database = await getDatabase();
  let result!: T;
  await database.withTransactionAsync(async () => {
    result = await work(database);
  });
  return result;
};
