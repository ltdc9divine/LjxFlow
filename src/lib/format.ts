/**
 * Currency and number formatting utilities for LjxFlow.
 * Vietnamese Đồng (VND) formatting with vi-VN locale.
 */

/**
 * Format a number as Vietnamese Đồng, e.g. "100.000 ₫".
 * Uses vi-VN locale and VND currency.
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
  }).format(Math.abs(amount));
}

/**
 * Format a number as currency with sign, e.g. "+100.000 ₫" or "-50.000 ₫".
 * Returns "0 ₫" for zero.
 */
export function formatCurrencyWithSign(amount: number): string {
  const formatted = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
  }).format(Math.abs(amount));
  if (amount === 0) return "0 ₫";
  return `${amount > 0 ? "+" : "-"}${formatted}`;
}

/**
 * Format a number as currency input, e.g. "100000".
 * Used for TextInput display (no currency symbol).
 */
export function formatCurrencyInput(amount: number): string {
  return new Intl.NumberFormat("vi-VN").format(Math.abs(amount));
}

/**
 * Parse a currency string to a number.
 * Handles strings like "100.000 ₫", "100000", "100,000".
 */
export function parseCurrency(value: string): number {
  const cleaned = value.replace(/[^\d]/g, "");
  return parseFloat(cleaned);
}
