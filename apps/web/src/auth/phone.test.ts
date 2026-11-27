import { describe, expect, it } from 'vitest';
import { formatIranMobile, normalizeIranMobile } from './phone';

describe('iran mobile', () => {
  it('normalizes local and international forms', () => {
    expect(normalizeIranMobile('09123456789')).toBe('+989123456789');
    expect(normalizeIranMobile('+989123456789')).toBe('+989123456789');
    expect(normalizeIranMobile('۰۹۱۲۳۴۵۶۷۸۹')).toBe('+989123456789');
    expect(normalizeIranMobile('0912 345-6789')).toBe('+989123456789');
  });

  it('rejects non-iranian and incomplete numbers', () => {
    expect(normalizeIranMobile('08123456789')).toBeNull();
    expect(normalizeIranMobile('+14155552671')).toBeNull();
    expect(normalizeIranMobile('091234567')).toBeNull();
    expect(normalizeIranMobile('')).toBeNull();
  });

  it('formats stored numbers for display', () => {
    expect(formatIranMobile('+989123456789')).toBe('09123456789');
  });
});
