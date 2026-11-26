import { toPersianDigits } from './digits.js';

/**
 * Formats an integer toman amount for UI.
 * Negative amounts and non-integers throw. Storage is integer rials in the database;
 * callers convert rials to toman before display. See docs/10-database.md.
 */
export function formatRialAsToman(rial: number | bigint): string {
  const value = typeof rial === 'bigint' ? rial : BigInt(rial);
  if (value < 0n) {
    throw new Error('formatRialAsToman does not accept a negative amount');
  }
  if (value % 10n !== 0n) {
    throw new Error('formatRialAsToman expects a rial amount divisible by 10');
  }
  const toman = value / 10n;
  if (toman > BigInt(Number.MAX_SAFE_INTEGER)) {
    throw new Error('formatRialAsToman amount is too large');
  }
  return formatToman(Number(toman));
}

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
