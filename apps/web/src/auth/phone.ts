const persian = '۰۱۲۳۴۵۶۷۸۹';
const arabic = '٠١٢٣٤٥٦٧٨٩';

export function normalizeIranMobile(input: string): string | null {
  const compact = input.trim().replace(/[\s-]/g, '');
  let digits = '';
  for (const char of compact) {
    const persianIndex = persian.indexOf(char);
    const arabicIndex = arabic.indexOf(char);
    if (persianIndex >= 0) digits += String(persianIndex);
    else if (arabicIndex >= 0) digits += String(arabicIndex);
    else digits += char;
  }
  if (/^09\d{9}$/.test(digits)) return `+98${digits.slice(1)}`;
  if (/^\+989\d{9}$/.test(digits)) return digits;
  return null;
}

export function formatIranMobile(phoneE164: string): string {
  if (!/^\+989\d{9}$/.test(phoneE164)) return phoneE164;
  return `0${phoneE164.slice(3)}`;
}
