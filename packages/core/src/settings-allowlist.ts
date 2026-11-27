const allowed = new Set(['billing.card_to_card', 'support.contact', 'site.notice']);

export function settingKeyError(key: string): string | null {
  const lower = key.toLowerCase();
  if (
    lower.includes('token') ||
    lower.includes('secret') ||
    lower.includes('key') ||
    lower.startsWith('encryption_') ||
    lower.startsWith('meta_')
  ) {
    return 'این کلید ذخیره نمی‌شود';
  }
  if (!allowed.has(key)) return 'کلید تنظیم ناشناخته است';
  return null;
}
