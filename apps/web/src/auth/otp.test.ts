import { describe, expect, it } from 'vitest';
import { hashOtp, maxOtpAttempts, otpBlockReason, otpHashesMatch } from './otp';

const secret = 'unit-test-pepper-value';
const phone = '+989123456789';

describe('otp hash', () => {
  it('matches only the same code and hides the plaintext', () => {
    const stored = hashOtp(phone, '123456', secret);
    expect(stored).not.toContain('123456');
    expect(otpHashesMatch(stored, phone, '123456', secret)).toBe(true);
    expect(otpHashesMatch(stored, phone, '123457', secret)).toBe(false);
    expect(otpHashesMatch(`${stored.slice(0, -1)}0`, phone, '123456', secret)).toBe(false);
  });

  it('blocks expired, consumed, and exhausted codes', () => {
    const now = new Date('2026-11-27T00:00:00.000Z');
    expect(
      otpBlockReason(
        { attempts: 0, expiresAt: new Date(now.getTime() - 1), consumedAt: null },
        now,
      ),
    ).toBe('کد منقضی شده است');
    expect(
      otpBlockReason(
        { attempts: maxOtpAttempts, expiresAt: new Date(now.getTime() + 1000), consumedAt: null },
        now,
      ),
    ).toBe('سقف تلاش این کد پر شده است');
    expect(
      otpBlockReason(
        { attempts: 1, expiresAt: new Date(now.getTime() + 1000), consumedAt: now },
        now,
      ),
    ).toBe('این کد قبلاً استفاده شده است');
    expect(
      otpBlockReason(
        {
          attempts: maxOtpAttempts - 1,
          expiresAt: new Date(now.getTime() + 1000),
          consumedAt: null,
        },
        now,
      ),
    ).toBeNull();
  });
});
