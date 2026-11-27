import { randomInt } from 'node:crypto';
import { getPrisma } from '@directora/db';
import { beforeAll, expect, test } from 'vitest';
import { POST as requestOtp } from '../app/api/auth/otp/request/route';
import { GET as readCode } from '../app/api/auth/otp/test-code/route';
import { POST as verifyOtp } from '../app/api/auth/otp/verify/route';
import { POST as logout } from '../app/api/auth/logout/route';
import { GET as me } from '../app/api/auth/me/route';
import { POST as createWorkspace } from '../app/api/workspaces/route';
import { POST as switchWorkspace } from '../app/api/workspaces/switch/route';
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
  return `0912${randomInt(0, 10_000_000).toString().padStart(7, '0')}`;
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

test('otp login creates a trial workspace and logout revokes it', async () => {
  const rawPhone = phone();
  const normalized = normalizeIranMobile(rawPhone);
  const ip = `198.51.100.${randomInt(1, 200)}`;
  expect(normalized).toBeTruthy();

  const requested = await post(
    requestOtp,
    'http://127.0.0.1:3000/api/auth/otp/request',
    { phone: rawPhone },
    { ip },
  );
  const requestedText = await requested.text();
  expect(requested.status).toBe(200);

  const limited = await post(
    requestOtp,
    'http://127.0.0.1:3000/api/auth/otp/request',
    { phone: rawPhone },
    { ip },
  );
  expect(limited.status).toBe(429);

  const helper = await readCode(
    new Request(`http://127.0.0.1:3000/api/auth/otp/test-code?phone=${rawPhone}`),
  );
  expect(helper.status).toBe(200);
  const helperBody = (await helper.json()) as { code: string };
  expect(requestedText).not.toContain(helperBody.code);
  expect(requestedText).not.toContain('code');

  const verified = await post(
    verifyOtp,
    'http://127.0.0.1:3000/api/auth/otp/verify',
    { phone: rawPhone, code: helperBody.code },
    { ip },
  );
  const verifiedText = await verified.text();
  expect(verified.status).toBe(200);
  expect(verifiedText).not.toContain(helperBody.code);
  const setCookie = verified.headers.get('set-cookie') ?? '';
  expect(setCookie).toContain('HttpOnly');
  expect(setCookie).toContain('SameSite=Lax');
  expect(setCookie).not.toContain('Secure');
  const token = /directora_session=([^;]+)/.exec(setCookie)?.[1] ?? '';
  expect(token).not.toBe('');

  const database = getPrisma(process.env.DATABASE_URL ?? '');
  const user = await database.user.findUniqueOrThrow({
    where: { phoneE164: normalized ?? '' },
    include: { memberships: true },
  });
  expect(user.memberships[0]?.role).toBe('OWNER');
  const subscription = await database.subscription.findFirstOrThrow({
    where: { workspaceId: user.memberships[0]?.workspaceId },
    include: { plan: true },
  });
  expect(subscription.status).toBe('TRIAL');
  expect(subscription.plan.code).toBe('FREE_TRIAL');

  const created = await post(
    createWorkspace,
    'http://127.0.0.1:3000/api/workspaces',
    { name: 'فضای دوم' },
    { cookie: token },
  );
  expect(created.status).toBe(200);
  const second = (await created.json()) as { id: string };
  const profile = await me(
    new Request('http://127.0.0.1:3000/api/auth/me', {
      headers: { cookie: `directora_session=${token}` },
    }),
  );
  const profileBody = (await profile.json()) as {
    workspace: { id: string } | null;
    user: { isSuperAdmin?: boolean };
  };
  expect(profile.status).toBe(200);
  expect(profileBody.workspace?.id).toBe(second.id);
  expect(profileBody.user.isSuperAdmin).toBeUndefined();
  const extraSubscription = await database.subscription.findFirst({
    where: { workspaceId: second.id },
  });
  expect(extraSubscription).toBeNull();

  const switched = await post(
    switchWorkspace,
    'http://127.0.0.1:3000/api/workspaces/switch',
    { workspaceId: user.memberships[0]?.workspaceId },
    { cookie: token },
  );
  expect(switched.status).toBe(200);

  const signedOut = await post(
    logout,
    'http://127.0.0.1:3000/api/auth/logout',
    {},
    { cookie: token },
  );
  expect(signedOut.status).toBe(200);
  const after = await me(
    new Request('http://127.0.0.1:3000/api/auth/me', {
      headers: { cookie: `directora_session=${token}` },
    }),
  );
  expect(after.status).toBe(401);
});
