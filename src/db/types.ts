/**
 * TypeScript type definitions for LjxFlow database models.
 * These mirror the SQLite table schemas defined in migrations.ts.
 */

export type TransactionType = 'income' | 'expense';

export interface Category {
  id: string;
  name: string;
  color_hex: string;
  type: TransactionType;
}

export interface Transaction {
  id: string;
  amount: number;
  note: string;
  type: TransactionType;
  date: string; // ISO 8601 string (e.g. "2025-01-15T10:30:00.000Z")
  category_id: string;
}

export interface DailyBalance {
  date_id: string; // Format: YYYY-MM-DD (primary key)
  starting_balance: number;
}

export interface DailySummary {
  date_id: string;
  starting_balance: number;
  total_income: number;
  total_expense: number;
  ending_balance: number; // starting_balance + total_income - total_expense
}

export interface DayCashFlow {
  date: string;
  net_flow: number; // total_income - total_expense
  is_positive: boolean;
}

// ─── Internal types for repository function parameters ───────────────────

export interface NewTransactionInput {
  amount: number;
  note: string;
  type: TransactionType;
  date: string;
  category_id: string;
}

export interface NewCategoryInput {
  name: string;
  color_hex: string;
  type: TransactionType;
}

