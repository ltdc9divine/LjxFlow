/**
 * Date utilities for LjxFlow.
 *
 * Helper functions for formatting and manipulating dates
 * in the YYYY-MM-DD format used as primary keys in the database.
 * All display formatting uses Vietnamese (vi-VN) locale.
 */

/**
 * Format a Date to YYYY-MM-DD string (local time).
 */
export function formatDateId(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Format a Date to a human-readable string, e.g. "Thứ Hai, 15/01".
 * Uses vi-VN locale.
 */
export function formatDateDisplay(date: Date = new Date()): string {
  const options: Intl.DateTimeFormatOptions = {
    weekday: "short",
    month: "numeric",
    day: "numeric",
  };
  return date.toLocaleDateString("vi-VN", options);
}

/**
 * Format a Date to a full readable string, e.g. "Thứ Hai, ngày 15 tháng 1, 2025".
 * Uses vi-VN locale.
 */
export function formatDateFull(date: Date = new Date()): string {
  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return date.toLocaleDateString("vi-VN", options);
}

/**
 * Generate an array of date IDs for the last N days (inclusive of today).
 * @param days Number of days to generate (including today)
 */
export function getLastNDays(days: number): { date: Date; dateId: string }[] {
  const result: { date: Date; dateId: string }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    result.push({ date, dateId: formatDateId(date) });
  }
  return result;
}

/**
 * Convert a date string (YYYY-MM-DD) to a Date object at local midnight.
 */
export function parseDateId(dateId: string): Date {
  const [year, month, day] = dateId.split("-").map(Number);
  return new Date(year, month - 1, day);
}
