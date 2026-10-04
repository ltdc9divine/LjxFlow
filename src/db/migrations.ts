/**
 * SQL migration statements for the LjxFlow database.
 *
 * The migrations use a version-based approach with PRAGMA user_version.
 * Each migration step is idempotent (uses CREATE TABLE IF NOT EXISTS).
 */

import type { SQLiteDatabase } from 'expo-sqlite';

/** SQL to create the categories table. */
export const CREATE_CATEGORIES_SQL = `
  CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    color_hex TEXT NOT NULL DEFAULT '#8E8E93',
    type TEXT NOT NULL CHECK (type IN ('income', 'expense'))
  );
`;

/** SQL to create the transactions table. */
export const CREATE_TRANSACTIONS_SQL = `
  CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY NOT NULL,
    amount REAL NOT NULL,
    note TEXT NOT NULL DEFAULT '',
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    date TEXT NOT NULL,
    category_id TEXT NOT NULL,
    FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE CASCADE
  );
`;

/** SQL to create the daily_balances table. */
export const CREATE_DAILY_BALANCES_SQL = `
  CREATE TABLE IF NOT EXISTS daily_balances (
    date_id TEXT PRIMARY KEY NOT NULL,
    starting_balance REAL NOT NULL DEFAULT 0
  );
`;

/**
 * Combined migration SQL that runs all CREATE TABLE statements.
 * This is executed when the database version is 0.
 */
export const MIGRATION_SQL = `
  PRAGMA journal_mode = 'wal';
  PRAGMA foreign_keys = ON;

  ${CREATE_CATEGORIES_SQL}

  ${CREATE_TRANSACTIONS_SQL}

  ${CREATE_DAILY_BALANCES_SQL}
`;

/**
 * Run migrations on the given database instance.
 *
 * Uses a version-based migration approach with PRAGMA user_version.
 * Currently only has one migration step (version 0 → 1) that creates
 * all three tables.
 *
 * @param db - The SQLite database instance
 */
export async function migrateDb(db: SQLiteDatabase): Promise<void> {
  // Get the current database version
  const result = await db.getFirstAsync<{ user_version: number }>(
    'PRAGMA user_version;'
  );
  const currentVersion = result?.user_version ?? 0;

  const DATABASE_VERSION = 1;

  if (currentVersion >= DATABASE_VERSION) {
    return;
  }

  if (currentVersion === 0) {
    await db.execAsync(MIGRATION_SQL);
    console.log('[db] Migration 0 → 1: tables created');
  }

  // Future migrations would go here:
  // if (currentVersion === 1) {
  //   await db.execAsync('ALTER TABLE ...');
  // }

  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
  console.log(`[db] Database migrated to version ${DATABASE_VERSION}`);
}
