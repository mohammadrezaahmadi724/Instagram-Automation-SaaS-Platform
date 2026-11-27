import { randomInt } from 'node:crypto';
import { getPrisma } from '@directora/db';
import { beforeAll, expect, test } from 'vitest';
import { GET as adminStats } from '../app/api/admin/stats/route';
import { POST as approveReceipt } from '../app/api/admin/receipts/[id]/approve/route';
import { POST as requestOtp } from '../app/api/auth/otp/request/route';
import { GET as readCode } from '../app/api/auth/otp/test-code/route';
import { POST as verifyOtp } from '../app/api/auth/otp/verify/route';
import { GET as me } from '../app/api/auth/me/route';
import { POST as createReceipt } from '../app/api/billing/receipts/route';
import { normalizeIranMobile } from '../src/auth/phone';

beforeAll(() => {
  if (!process.env.DATABASE_URL || !process.env.REDIS_URL) {
    throw new Error('DATABASE_URL and REDIS_URL are required');
  }
  process.env.SMS_PROVIDER = 'console';
  process.env.OTP_TEST_HELPER = '1';
  if (!process.env.AUTH_SECRET || process.env.AUTH_SECRET.length < 16) {
    process.env.AUTH_SECRET = 'integration-auth-secret';
  }
});

function phone() {
  return `0913${randomInt(0, 10_000_000).toString().padStart(7, '0')}`;
}

async function post(
  handler: (request: Request) => Promise<Response>,
  url: string,
  body: unknown,
  extra?: { cookie?: string; ip?: string },
) {
  const headers = new Headers({ 'content-type': 'application/json', host: '127.0.0.1:3000' });
  if (extra?.cookie) headers.set('cookie', `directora_session=${extra.cookie}`);
  if (extra?.ip) headers.set('x-directora-test-ip', extra.ip);
  return handler(new Request(url, { method: 'POST', headers, body: JSON.stringify(body) }));
}

test('card receipt is priced on the server and approved once', async () => {
  const rawPhone = phone();
  const normalized = normalizeIranMobile(rawPhone);
  const ip = `198.51.100.${randomInt(1, 200)}`;
  const requested = await post(
    requestOtp,
    'http://127.0.0.1:3000/api/auth/otp/request',
    { phone: rawPhone },
    { ip },
  );
  expect(requested.status).toBe(200);
  const helper = await readCode(
    new Request(`http://127.0.0.1:3000/api/auth/otp/test-code?phone=${rawPhone}`),
  );
  const code = ((await helper.json()) as { code: string }).code;
  const verified = await post(
    verifyOtp,
    'http://127.0.0.1:3000/api/auth/otp/verify',
    { phone: rawPhone, code },
    { ip },
  );
  expect(verified.status).toBe(200);
  const token =
    /directora_session=([^;]+)/.exec(verified.headers.get('set-cookie') ?? '')?.[1] ?? '';
  const profile = await me(
    new Request('http://127.0.0.1:3000/api/auth/me', {
      headers: { cookie: `directora_session=${token}` },
    }),
  );
  const profileBody = (await profile.json()) as { user: { isSuperAdmin?: boolean } };
  expect(profileBody.user.isSuperAdmin).toBeUndefined();

  const blocked = await adminStats(
    new Request('http://127.0.0.1:3000/api/admin/stats', {
      headers: { cookie: `directora_session=${token}` },
    }),
  );
  expect(blocked.status).toBe(403);
  const anonymous = await adminStats(new Request('http://127.0.0.1:3000/api/admin/stats'));
  expect(anonymous.status).toBe(401);

  const database = getPrisma(process.env.DATABASE_URL ?? '');
  const plan = await database.plan.findUniqueOrThrow({ where: { code: 'GROWTH_UNDER_25K' } });
  const created = await post(
    createReceipt,
    'http://127.0.0.1:3000/api/billing/receipts',
    { planId: plan.id, referenceCode: 'TRACK1234', amountRial: 1, payerCardLast4: '4242' },
    { cookie: token },
  );
  expect(created.status).toBe(201);
  const receipt = (await created.json()) as { id: string; status: string; amountRial: string };
  expect(receipt.status).toBe('PENDING');
  expect(receipt.amountRial).toBe(plan.priceRial.toString());

  const user = await database.user.update({
    where: { phoneE164: normalized ?? '' },
    data: { isSuperAdmin: true },
  });
  const approved = await approveReceipt(
    new Request(`http://127.0.0.1:3000/api/admin/receipts/${receipt.id}/approve`, {
      method: 'POST',
      headers: { cookie: `directora_session=${token}`, host: '127.0.0.1:3000' },
    }),
    { params: Promise.resolve({ id: receipt.id }) },
  );
  expect(approved.status).toBe(200);
  const subscription = await database.subscription.findFirstOrThrow({
    where: {
      workspaceId: (await database.membership.findFirstOrThrow({ where: { userId: user.id } }))
        .workspaceId,
      status: 'ACTIVE',
    },
  });
  expect(subscription.planId).toBe(plan.id);
  const span = subscription.endsAt.getTime() - subscription.startsAt.getTime();
  expect(span).toBe(plan.durationDays * 24 * 60 * 60 * 1000);
  const again = await approveReceipt(
    new Request(`http://127.0.0.1:3000/api/admin/receipts/${receipt.id}/approve`, {
      method: 'POST',
      headers: { cookie: `directora_session=${token}`, host: '127.0.0.1:3000' },
    }),
    { params: Promise.resolve({ id: receipt.id }) },
  );
  expect(again.status).toBe(409);
  const unchanged = await database.subscription.findUniqueOrThrow({
    where: { id: subscription.id },
  });
  expect(unchanged.endsAt.getTime()).toBe(subscription.endsAt.getTime());
});
