import { toPersianDigits } from './digits.js';

/**
 * Formats an integer toman amount for UI.
 * Negative amounts and non-integers throw. Storage is integer rials in the database;
 * callers convert rials to toman before display. See docs/10-database.md.
 */
export function formatToman(amount: number): string {
  if (!Number.isInteger(amount)) {
    throw new Error('formatToman expects an integer toman amount');
  }
  if (amount < 0) {
    throw new Error('formatToman does not accept a negative amount');
  }
  const grouped = new Intl.NumberFormat('en-US').format(amount);
  return `${toPersianDigits(grouped).replaceAll(',', '٬')} تومان`;
}
