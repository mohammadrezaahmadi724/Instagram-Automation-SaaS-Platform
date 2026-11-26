import { describe, expect, it } from 'vitest';
import {
  contrastRatio,
  formatJalali,
  formatRialAsToman,
  formatToman,
  normalizeDigits,
  toPersianDigits,
} from '../src/index.ts';

const supervisor = [
  ['#0B1B3F', '#F5F7FB', 15.75],
  ['#48546E', '#F5F7FB', 7.07],
  ['#5F6C87', '#F5F7FB', 4.92],
  ['#FFFFFF', '#0B5BD3', 6.08],
  ['#0B1B3F', '#FF7A1A', 6.48],
  ['#FFFFFF', '#0B6E41', 6.32],
  ['#0B1B3F', '#FFB000', 9.22],
  ['#FFFFFF', '#D42828', 5.08],
  ['#FFFFFF', '#0170A4', 5.45],
  ['#7A869E', '#FFFFFF', 3.66],
  ['#7A869E', '#F5F7FB', 3.42],
  ['#2B76EE', '#FFFFFF', 4.26],
  ['#F5F7FB', '#06122C', 17.32],
  ['#5596F8', '#06122C', 6.28],
] as const;

describe('digits', () => {
  it('converts latin digits to Persian', () => {
    expect(toPersianDigits('12500000')).toBe('۱۲۵۰۰۰۰۰');
  });

  it('normalizes Persian, Arabic, and mixed digits', () => {
    expect(normalizeDigits('۰۱۲۳۴۵۶۷۸۹')).toBe('0123456789');
    expect(normalizeDigits('٠١٢٣٤٥٦٧٨٩')).toBe('0123456789');
    expect(normalizeDigits('۱2٣')).toBe('123');
  });
});

describe('formatToman', () => {
  it('formats zero, thousands, and the sample amount', () => {
    expect(formatToman(0)).toBe('۰ تومان');
    expect(formatToman(1000)).toBe('۱٬۰۰۰ تومان');
    expect(formatToman(12500000)).toBe('۱۲٬۵۰۰٬۰۰۰ تومان');
  });

  it('rejects a negative amount', () => {
    expect(() => formatToman(-1)).toThrow(/negative/);
  });
});

describe('formatRialAsToman', () => {
  it('divides a multiple of ten by ten', () => {
    expect(formatRialAsToman(4_900_000n)).toBe('۴۹۰٬۰۰۰ تومان');
  });

  it('rejects a rial amount that is not a whole toman', () => {
    expect(() => formatRialAsToman(15)).toThrow(/divisible by 10/);
  });
});

describe('formatJalali', () => {
  it('formats 2026-11-25 noon UTC as 4 Azar 1405 in Tehran', () => {
    expect(formatJalali(new Date('2026-11-25T12:00:00Z'))).toBe('۴ آذر ۱۴۰۵');
  });
});

describe('contrastRatio', () => {
  it('stays within 0.02 of the supervisor table', () => {
    for (const [foreground, background, expected] of supervisor) {
      expect(Math.abs(contrastRatio(foreground, background) - expected)).toBeLessThanOrEqual(0.02);
    }
  });
});
