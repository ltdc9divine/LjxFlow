/**
 * Database seeding logic for default categories.
 *
 * If the categories table is empty, seeds it with default categories:
 * - Expense categories: Food, Transport
 * - Income category: Salary
 */

import type { SQLiteDatabase } from 'expo-sqlite';
import type { Category } from './types';

/** Default categories seeded when the database is first initialized. */
export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Food',
    color_hex: '#FF6B6B',
    type: 'expense',
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    name: 'Transport',
    color_hex: '#4DA6FF',
    type: 'expense',
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    name: 'Salary',
    color_hex: '#30D158',
    type: 'income',
  },
];

/**
 * Check if the categories table is empty and seed it if necessary.
 *
  * @param db - The SQLite database instance
 */
export async function seedCategoriesIfEmpty(db: SQLiteDatabase): Promise<void> {
  const count = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM categories'
  );

  if (count && count.count > 0) {
    console.log(`[db] Categories already seeded (${count.count} entries)`);
    return;
  }

  console.log('[db] Seeding default categories...');
  for (const cat of DEFAULT_CATEGORIES) {
    await db.runAsync(
      'INSERT INTO categories (id, name, color_hex, type) VALUES (?, ?, ?, ?);',
      cat.id,
      cat.name,
      cat.color_hex,
      cat.type
    );
  }
  console.log(`[db] Seeded ${DEFAULT_CATEGORIES.length} default categories`);
}
