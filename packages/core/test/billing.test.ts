import { describe, expect, it } from 'vitest';
import {
  amountFromPlan,
  decideAdminAccess,
  nextSubscriptionWindow,
  normalizeReceiptFields,
  settingKeyError,
} from '../src/index.ts';

describe('receipt fields', () => {
  it('rejects a short or long reference and a bad card suffix', () => {
    expect(normalizeReceiptFields({ referenceCode: '12' }).ok).toBe(false);
    expect(normalizeReceiptFields({ referenceCode: 'x'.repeat(65) }).ok).toBe(false);
    expect(normalizeReceiptFields({ referenceCode: '1234', payerCardLast4: '12' }).ok).toBe(false);
  });

  it('uses the plan price and ignores a client amount', () => {
    const priced = amountFromPlan({ isActive: true, priceRial: 4_900_000n }, 1);
    expect(priced).toEqual({ ok: true, amountRial: 4_900_000n });
    expect(amountFromPlan({ isActive: true, priceRial: 0n }).ok).toBe(false);
    expect(amountFromPlan(null).ok).toBe(false);
  });
});

describe('admin access and settings', () => {
  it('rejects a missing session and a normal user', () => {
    expect(decideAdminAccess({ hasSession: false, isActive: false, isSuperAdmin: false })).toBe(
      'unauthenticated',
    );
    expect(decideAdminAccess({ hasSession: true, isActive: false, isSuperAdmin: true })).toBe(
      'unauthenticated',
    );
    expect(decideAdminAccess({ hasSession: true, isActive: true, isSuperAdmin: false })).toBe(
      'forbidden',
    );
    expect(decideAdminAccess({ hasSession: true, isActive: true, isSuperAdmin: true })).toBe(
      'allow',
    );
  });

  it('rejects unknown and secret-like setting keys', () => {
    expect(settingKeyError('billing.card_to_card')).toBeNull();
    expect(settingKeyError('site.notice')).toBeNull();
    expect(settingKeyError('custom.flag')).toBeTruthy();
    expect(settingKeyError('api_token')).toBeTruthy();
    expect(settingKeyError('META_APP_SECRET')).toBeTruthy();
    expect(settingKeyError('ENCRYPTION_KEY')).toBeTruthy();
  });
});

describe('subscription window', () => {
  it('extends the same open plan and replaces a different one', () => {
    const now = new Date('2026-11-27T00:00:00.000Z');
    const endsAt = new Date('2026-12-01T00:00:00.000Z');
    const extended = nextSubscriptionWindow({
      now,
      durationDays: 30,
      targetPlanId: 'plan-a',
      current: { planId: 'plan-a', status: 'ACTIVE', endsAt },
    });
    expect(extended.mode).toBe('extend');
    expect(extended.endsAt.toISOString()).toBe('2026-12-31T00:00:00.000Z');
    const replaced = nextSubscriptionWindow({
      now,
      durationDays: 30,
      targetPlanId: 'plan-b',
      current: { planId: 'plan-a', status: 'TRIAL', endsAt },
    });
    expect(replaced.mode).toBe('replace');
    expect(replaced.endsAt.toISOString()).toBe('2026-12-27T00:00:00.000Z');
  });
});
