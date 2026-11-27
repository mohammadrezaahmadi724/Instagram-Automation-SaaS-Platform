import { createHmac, timingSafeEqual } from 'node:crypto';

export const maxOtpAttempts = 5;
export const otpTtlMs = 2 * 60 * 1000;

export function hashOtp(phoneE164: string, code: string, secret: string) {
  return createHmac('sha256', secret).update(`${phoneE164}:${code}`).digest('hex');
}

export function otpHashesMatch(stored: string, phoneE164: string, code: string, secret: string) {
  const next = hashOtp(phoneE164, code, secret);
  const left = Buffer.from(stored);
  const right = Buffer.from(next);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function otpBlockReason(
  row: { attempts: number; expiresAt: Date; consumedAt: Date | null },
  now: Date,
) {
  if (row.consumedAt) return 'این کد قبلاً استفاده شده است';
  if (row.expiresAt.getTime() <= now.getTime()) return 'کد منقضی شده است';
  if (row.attempts >= maxOtpAttempts) return 'سقف تلاش این کد پر شده است';
  return null;
}
