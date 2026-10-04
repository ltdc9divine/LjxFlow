/**
 * Main database module for LjxFlow.
 *
 * This module provides:
 * - A singleton SQLite database instance via `getDatabase()`
 * - Initialization function `initializeDatabase()` that runs migrations and seeds
 * - Repository functions for Categories, Transactions, and DailyBalances
 *
 * The database uses the next-generation expo-sqlite API (SDK 50+):
 * - `openDatabaseSync()` to open/create the database
 * - `execAsync()` for schema DDL
 * - `runAsync()` for INSERT/UPDATE/DELETE
 * - `getAllAsync()` / `getFirstAsync()` for SELECT queries
 *
 * @see https://docs.expo.dev/versions/latest/sdk/sqlite/
 */

import type { SQLiteDatabase } from "expo-sqlite";
import * as SQLite from "expo-sqlite";

import { migrateDb } from "./migrations";
import { seedCategoriesIfEmpty } from "./seed";
import type {
  Category,
  DailyBalance,
  NewCategoryInput,
  NewTransactionInput,
  Transaction,
} from "./types";
import { generateId } from "@/lib/uuid";

const DATABASE_NAME = "ljxflow.db";

// Singleton database instance
let _db: SQLiteDatabase | null = null;

/**
 * Get the singleton database instance.
 * Opens the database if not already open.
 */
export function getDatabase(): SQLiteDatabase {
  if (_db === null) {
    _db = SQLite.openDatabaseSync(DATABASE_NAME);
  }
  return _db;
}

/**
 * Initialize the database: run migrations and seed default data.
 *
 * This should be called once at app startup, typically in the root layout.
 */
export async function initializeDatabase(): Promise<void> {
  const db = getDatabase();

  console.log("[db] Initializing database...");

  // Run migrations (creates tables if they don't exist)
  await migrateDb(db);

  // Seed default categories if the table is empty
  await seedCategoriesIfEmpty(db);

  console.log("[db] Database initialized successfully");
}

// ─── Category Repository ───────────────────────────────────────────────────

export async function getAllCategories(): Promise<Category[]> {
  const db = getDatabase();
  return db.getAllAsync<Category>(
    "SELECT id, name, color_hex, type FROM categories ORDER BY type, name;",
  );
}

export async function getCategoriesByType(
  type: "income" | "expense",
): Promise<Category[]> {
  const db = getDatabase();
  return db.getAllAsync<Category>(
    "SELECT id, name, color_hex, type FROM categories WHERE type = ? ORDER BY name;",
    type,
  );
}

export async function getCategoryById(id: string): Promise<Category | null> {
  const db = getDatabase();
  return db.getFirstAsync<Category>(
    "SELECT id, name, color_hex, type FROM categories WHERE id = ?;",
    id,
  );
}

export async function addCategory(category: NewCategoryInput): Promise<void> {
  const db = getDatabase();
  await db.runAsync(
    "INSERT INTO categories (id, name, color_hex, type) VALUES (?, ?, ?, ?);",
    generateId(),
    category.name,
    category.color_hex,
    category.type,
  );
}

// ─── Transaction Repository ────────────────────────────────────────────────

export async function addTransaction(tx: NewTransactionInput): Promise<void> {
  const db = getDatabase();
  await db.runAsync(
    "INSERT INTO transactions (id, amount, note, type, date, category_id) VALUES (?, ?, ?, ?, ?, ?);",
    generateId(),
    tx.amount,
    tx.note,
    tx.type,
    tx.date,
    tx.category_id,
  );
}

export async function getTransactionById(
  id: string,
): Promise<Transaction | null> {
  const db = getDatabase();
  return db.getFirstAsync<Transaction>(
    "SELECT id, amount, note, type, date, category_id FROM transactions WHERE id = ?;",
    id,
  );
}

export async function updateTransaction(
  id: string,
  tx: NewTransactionInput,
): Promise<void> {
  const db = getDatabase();
  await db.runAsync(
    "UPDATE transactions SET amount = ?, note = ?, type = ?, date = ?, category_id = ? WHERE id = ?;",
    tx.amount,
    tx.note,
    tx.type,
    tx.date,
    tx.category_id,
    id,
  );
}

export async function getTransactionsByDate(
  date: string,
): Promise<
  (Transaction & { category_name: string; category_color: string })[]
> {
  const db = getDatabase();
  return db.getAllAsync<
    Transaction & { category_name: string; category_color: string }
  >(
    `
    SELECT
      t.id,
      t.amount,
      t.note,
      t.type,
      t.date,
      t.category_id,
      c.name AS category_name,
      c.color_hex AS category_color
    FROM transactions t
    JOIN categories c ON t.category_id = c.id
    WHERE t.date LIKE ?
    ORDER BY t.date DESC;
  `,
    `${date.split("T")[0]}%`,
  );
}

export async function deleteTransaction(id: string): Promise<void> {
  const db = getDatabase();
  await db.runAsync("DELETE FROM transactions WHERE id = ?;", id);
}

// ─── Daily Balance Repository ─────────────────────────────────────────────

export async function getOrCreateDailyBalance(
  dateId: string,
): Promise<DailyBalance> {
  const db = getDatabase();
  const existing = await db.getFirstAsync<DailyBalance>(
    "SELECT date_id, starting_balance FROM daily_balances WHERE date_id = ?;",
    dateId,
  );

  if (existing) {
    return existing;
  }

  await db.runAsync(
    "INSERT INTO daily_balances (date_id, starting_balance) VALUES (?, 0);",
    dateId,
  );
  return { date_id: dateId, starting_balance: 0 };
}

export async function updateDailyBalance(
  dateId: string,
  startingBalance: number,
): Promise<void> {
  const db = getDatabase();
  await db.runAsync(
    "UPDATE daily_balances SET starting_balance = ? WHERE date_id = ?;",
    startingBalance,
    dateId,
  );
}

// ─── Daily Cash Flow ───────────────────────────────────────────────────────

export async function getDailyCashFlow(
  startDate: string,
  endDate: string,
): Promise<{ date: string; net_flow: number }[]> {
  const db = getDatabase();
  const rows = await db.getAllAsync<{
    date: string;
    net_flow: number;
  }>(
    `
    SELECT
      substr(date, 1, 10) AS date,
      SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) AS net_flow
    FROM transactions
    WHERE substr(date, 1, 10) >= ? AND substr(date, 1, 10) <= ?
    GROUP BY substr(date, 1, 10)
    ORDER BY date;
  `,
    startDate,
    endDate,
  );
  return rows;
}

// ─── Daily Summary ──────────────────────────────────────────────────────────

export async function getDailySummary(dateId: string): Promise<{
  starting_balance: number;
  total_income: number;
  total_expense: number;
  ending_balance: number;
}> {
  const db = getDatabase();
  const balanceRow = await db.getFirstAsync<{ starting_balance: number }>(
    "SELECT starting_balance FROM daily_balances WHERE date_id = ?;",
    dateId,
  );
  const startingBalance = balanceRow?.starting_balance ?? 0;

  const incomeRow = await db.getFirstAsync<{ total: number }>(
    "SELECT COALESCE(SUM(amount), 0) AS total FROM transactions WHERE substr(date, 1, 10) = ? AND type = 'income';",
    dateId,
  );
  const totalIncome = incomeRow?.total ?? 0;

  const expenseRow = await db.getFirstAsync<{ total: number }>(
    "SELECT COALESCE(SUM(amount), 0) AS total FROM transactions WHERE substr(date, 1, 10) = ? AND type = 'expense';",
    dateId,
  );
  const totalExpense = expenseRow?.total ?? 0;

  return {
    starting_balance: startingBalance,
    total_income: totalIncome,
    total_expense: totalExpense,
    ending_balance: startingBalance + totalIncome - totalExpense,
  };
}

// ─── Utility ────────────────────────────────────────────────────────────────

/** Ensure a daily_balances row exists for the given date. */
export async function ensureDailyBalance(
  dateId: string,
): Promise<DailyBalance> {
  return getOrCreateDailyBalance(dateId);
}
