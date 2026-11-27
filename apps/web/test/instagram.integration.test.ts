import { createHmac, randomInt } from 'node:crypto';
import { getPrisma } from '@directora/db';
import Redis from 'ioredis';
import { beforeAll, expect, test } from 'vitest';
import { POST as requestOtp } from '../app/api/auth/otp/request/route';
import { GET as readCode } from '../app/api/auth/otp/test-code/route';
import { POST as verifyOtp } from '../app/api/auth/otp/verify/route';
import { POST as connectMock } from '../app/api/dev/instagram/connect-mock/route';
import { POST as simulate } from '../app/api/dev/instagram/simulate-webhook/route';
import { POST as webhook } from '../app/api/webhooks/instagram/route';
import { POST as createRule } from '../app/api/automations/route';
import { GET as me } from '../app/api/auth/me/route';
import { processWebhookJob } from '../../apps/worker/src/process-event';

beforeAll(() => {
  if (!process.env.DATABASE_URL || !process.env.REDIS_URL) {
    throw new Error('DATABASE_URL and REDIS_URL are required');
  }
  process.env.SMS_PROVIDER = 'console';
  process.env.OTP_TEST_HELPER = '1';
  process.env.INSTAGRAM_API_MODE = 'mock';
  if (!process.env.AUTH_SECRET || process.env.AUTH_SECRET.length < 16) {
    process.env.AUTH_SECRET = 'integration-auth-secret';
  }
  if (!process.env.ENCRYPTION_KEY) process.env.ENCRYPTION_KEY = '11'.repeat(32);
  if (!process.env.ENCRYPTION_KEY_ID) process.env.ENCRYPTION_KEY_ID = 'v1';
  if (!process.env.META_APP_SECRET) process.env.META_APP_SECRET = 'integration-meta-app-secret';
});

function phone() {
  return `0913${randomInt(0, 10_000_000).toString().padStart(7, '0')}`;
}

async function login() {
  const rawPhone = phone();
  const ip = `198.51.100.${randomInt(1, 200)}`;
  const headers = new Headers({
    'content-type': 'application/json',
    host: '127.0.0.1:3000',
    'x-directora-test-ip': ip,
  });
  const requested = await requestOtp(
    new Request('http://127.0.0.1:3000/api/auth/otp/request', {
      method: 'POST',
      headers,
      body: JSON.stringify({ phone: rawPhone }),
    }),
  );
  expect(requested.status).toBe(200);
  const helper = await readCode(
    new Request(`http://127.0.0.1:3000/api/auth/otp/test-code?phone=${rawPhone}`),
  );
  const helperBody = (await helper.json()) as { code: string };
  const verified = await verifyOtp(
    new Request('http://127.0.0.1:3000/api/auth/otp/verify', {
      method: 'POST',
      headers,
      body: JSON.stringify({ phone: rawPhone, code: helperBody.code }),
    }),
  );
  const token =
    /directora_session=([^;]+)/.exec(verified.headers.get('set-cookie') ?? '')?.[1] ?? '';
  expect(token).not.toBe('');
  return token;
}

function cookieRequest(url: string, token: string, body: unknown) {
  return new Request(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      host: '127.0.0.1:3000',
      cookie: `directora_session=${token}`,
    },
    body: JSON.stringify(body),
  });
}

test('signed webhook runs the real processor once and honors cooldown', async () => {
  const token = await login();
  const connected = await connectMock(
    cookieRequest('http://127.0.0.1:3000/api/dev/instagram/connect-mock', token, {}),
  );
  expect(connected.status).toBe(200);
  const profile = await me(
    new Request('http://127.0.0.1:3000/api/auth/me', {
      headers: { cookie: `directora_session=${token}` },
    }),
  );
  const profileBody = (await profile.json()) as { workspace: { id: string } };
  const database = getPrisma(process.env.DATABASE_URL ?? '');
  const account = await database.instagramAccount.findFirstOrThrow({
    where: { workspaceId: profileBody.workspace.id, username: 'directora_demo', status: 'ACTIVE' },
  });
  const created = await createRule(
    cookieRequest('http://127.0.0.1:3000/api/automations', token, {
      name: 'قیمت تست',
      instagramAccountId: account.id,
      triggerType: 'POST_COMMENT',
      mediaScope: 'ALL',
      matchType: 'CONTAINS',
      keywords: ['قیمت'],
      replyText: 'سلام',
      buttons: [],
      sendPrivateReply: true,
      cooldownSeconds: 120,
    }),
  );
  expect(created.status).toBe(201);

  const commentId = `c-${randomInt(0, 1_000_000)}`;
  const payload = {
    object: 'instagram',
    entry: [
      {
        id: account.igUserId,
        changes: [
          {
            field: 'comments',
            value: {
              id: commentId,
              text: 'قيمت',
              from: { id: 'igsid-test' },
              media: { id: 'media-1' },
              timestamp: Math.floor(Date.now() / 1000),
            },
          },
        ],
      },
    ],
  };
  const raw = Buffer.from(JSON.stringify(payload));
  const signature = `sha256=${createHmac('sha256', process.env.META_APP_SECRET ?? '')
    .update(raw)
    .digest('hex')}`;
  const accepted = await webhook(
    new Request('http://127.0.0.1:3000/api/webhooks/instagram', {
      method: 'POST',
      headers: { 'x-hub-signature-256': signature },
      body: raw,
    }),
  );
  expect(accepted.status).toBe(200);
  const again = await webhook(
    new Request('http://127.0.0.1:3000/api/webhooks/instagram', {
      method: 'POST',
      headers: { 'x-hub-signature-256': signature },
      body: raw,
    }),
  );
  expect(again.status).toBe(200);
  const events = await database.webhookEvent.findMany({
    where: { externalEventId: `comments:${commentId}` },
  });
  expect(events).toHaveLength(1);

  const redis = new Redis(process.env.REDIS_URL ?? '', { maxRetriesPerRequest: 1 });
  await processWebhookJob({
    eventId: events[0]?.id ?? '',
    attemptsMade: 1,
    maxAttempts: 3,
    redis,
  });
  const rule = await database.automationRule.findFirstOrThrow({
    where: { instagramAccountId: account.id, name: 'قیمت تست' },
  });
  const success = await database.automationLog.findMany({
    where: { ruleId: rule.id, status: 'SUCCESS' },
  });
  expect(success).toHaveLength(1);
  expect(rule.executionCount).toBe(1);

  const secondId = `c-${randomInt(0, 1_000_000)}`;
  const second = structuredClone(payload);
  const change = second.entry[0]?.changes[0];
  if (change) change.value.id = secondId;
  const secondRaw = Buffer.from(JSON.stringify(second));
  const secondSignature = `sha256=${createHmac('sha256', process.env.META_APP_SECRET ?? '')
    .update(secondRaw)
    .digest('hex')}`;
  const secondAccepted = await webhook(
    new Request('http://127.0.0.1:3000/api/webhooks/instagram', {
      method: 'POST',
      headers: { 'x-hub-signature-256': secondSignature },
      body: secondRaw,
    }),
  );
  expect(secondAccepted.status).toBe(200);
  const secondEvent = await database.webhookEvent.findUniqueOrThrow({
    where: { externalEventId: `comments:${secondId}` },
  });
  await processWebhookJob({ eventId: secondEvent.id, attemptsMade: 1, maxAttempts: 3, redis });
  const cooled = await database.automationLog.findFirst({
    where: { webhookEventId: secondEvent.id },
  });
  expect(cooled?.status).toBe('SKIPPED_COOLDOWN');
  await redis.quit();
});

test('dev instagram routes are hidden in production', async () => {
  const previous = process.env.NODE_ENV;
  (process.env as { NODE_ENV?: string }).NODE_ENV = 'production';
  try {
    const hidden = await connectMock(
      new Request('http://127.0.0.1:3000/api/dev/instagram/connect-mock', { method: 'POST' }),
    );
    const hiddenSimulator = await simulate(
      new Request('http://127.0.0.1:3000/api/dev/instagram/simulate-webhook', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ kind: 'comment', text: 'قیمت' }),
      }),
    );
    expect(hidden.status).toBe(404);
    expect(hiddenSimulator.status).toBe(404);
  } finally {
    (process.env as { NODE_ENV?: string }).NODE_ENV = previous;
  }
});
