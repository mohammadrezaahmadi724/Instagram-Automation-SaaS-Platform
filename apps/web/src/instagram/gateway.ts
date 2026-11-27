import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import type { Queue } from 'bullmq';
import Redis from 'ioredis';
import { decryptSecret, encryptSecret } from '@directora/core';
import { getPrisma } from '@directora/db';
import {
  automationInputSchema,
  buildInstagramAuthUrl,
  createInstagramApi,
  instagramScopes,
  isProfessionalAccount,
  parseWebhookPayload,
  readSignedRequest,
  resolveInstagramMode,
  verifyMetaSignature,
  type AutomationInput,
} from '@directora/instagram';
import { getRedis } from '../auth/redis';
import { requireRole, type AuthResult } from '../auth/service';

const webhookQueueName = 'instagram.webhook';
let queue: Queue | null = null;

function database() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  return getPrisma(url);
}

function encryption() {
  const key = process.env.ENCRYPTION_KEY;
  const keyId = process.env.ENCRYPTION_KEY_ID;
  if (!key || !keyId) return null;
  return { key, keyId };
}

function redirectUri() {
  return (
    process.env.META_OAUTH_REDIRECT_URI || 'http://127.0.0.1:3000/api/instagram/oauth/callback'
  );
}

async function webhookQueue() {
  const url = process.env.REDIS_URL;
  if (!url) return null;
  if (!queue) {
    const { Queue } = await import('bullmq');
    queue = new Queue(webhookQueueName, {
      connection: new Redis(url, { maxRetriesPerRequest: null }),
    });
  }
  return queue;
}

function fail(status: number, error: string): AuthResult<never> {
  return { ok: false, status, error };
}

async function activePlan(workspaceId: string) {
  const db = database();
  if (!db) return null;
  return db.subscription.findFirst({
    where: { workspaceId, status: { in: ['TRIAL', 'ACTIVE'] }, endsAt: { gt: new Date() } },
    include: { plan: true },
    orderBy: { createdAt: 'desc' },
  });
}

export async function startInstagramOauth(token: string) {
  const profile = await requireRole(token, 'ADMIN');
  if (!profile.ok) return profile;
  const workspaceId = profile.data.workspace?.id;
  if (!workspaceId) return fail(403, 'فضای کاری فعال نیست');
  const db = database();
  const redis = await getRedis().catch(() => null);
  if (!db || !redis) return fail(503, 'اتصال موقتاً در دسترس نیست');
  const subscription = await activePlan(workspaceId);
  if (!subscription) return fail(403, 'اشتراک فعالی برای اتصال حساب نیست');
  const used = await db.instagramAccount.count({
    where: { workspaceId, status: { not: 'REVOKED' } },
  });
  if (used >= subscription.plan.maxInstagramAccounts) {
    return fail(403, 'سقف حساب اینستاگرام این پلن پر شده است');
  }
  if (!process.env.META_APP_ID || !process.env.META_APP_SECRET) {
    return fail(503, 'شناسهٔ اپ Meta هنوز تنظیم نشده است');
  }
  const state = randomBytes(24).toString('base64url');
  await redis.set(
    `oauth:ig:${state}`,
    JSON.stringify({ workspaceId, userId: profile.data.user.id }),
    'EX',
    600,
  );
  const url = buildInstagramAuthUrl({
    clientId: process.env.META_APP_ID,
    redirectUri: redirectUri(),
    scopes: instagramScopes,
    state,
  });
  return { ok: true as const, data: { url } };
}

export async function finishInstagramOauth(state: string, code: string) {
  const db = database();
  const redis = await getRedis().catch(() => null);
  const keys = encryption();
  if (!db || !redis || !keys || !process.env.META_APP_ID || !process.env.META_APP_SECRET) {
    return fail(503, 'اتصال موقتاً در دسترس نیست');
  }
  const raw = await redis.getdel(`oauth:ig:${state}`);
  if (!raw) return fail(400, 'درخواست اتصال منقضی شده است');
  const saved = JSON.parse(raw) as { workspaceId: string; userId: string };
  const api = createInstagramApi({ mode: resolveInstagramMode(process.env) });
  const shortLived = await api.exchangeCodeForShortLivedToken({
    clientId: process.env.META_APP_ID,
    clientSecret: process.env.META_APP_SECRET,
    redirectUri: redirectUri(),
    code,
  });
  const longLived = await api.exchangeShortLivedForLongLivedToken({
    clientSecret: process.env.META_APP_SECRET,
    accessToken: shortLived.accessToken,
  });
  const profile = await api.fetchInstagramProfile(longLived.accessToken);
  if (!isProfessionalAccount(profile.accountType) || !profile.userId) {
    return fail(400, 'فقط حساب حرفه‌ای بیزنس یا کریتور پذیرفته می‌شود');
  }
  const igUserId = profile.userId === 'mock-user' ? `mock-${saved.workspaceId}` : profile.userId;
  const elsewhere = await db.instagramAccount.findFirst({
    where: { igUserId, workspaceId: { not: saved.workspaceId }, status: { not: 'REVOKED' } },
  });
  if (elsewhere) return fail(409, 'این حساب به فضای کاری دیگری متصل است');
  const encrypted = encryptSecret(longLived.accessToken, keys.key, keys.keyId);
  const expiresIn = longLived.expiresIn ?? 60 * 24 * 60 * 60;
  await db.instagramAccount.upsert({
    where: { workspaceId_igUserId: { workspaceId: saved.workspaceId, igUserId } },
    create: {
      workspaceId: saved.workspaceId,
      igUserId,
      username: profile.username,
      name: profile.name,
      profilePictureUrl: profile.profilePictureUrl,
      followersCount: profile.followersCount,
      accountType: profile.accountType,
      accessTokenEnc: encrypted.ciphertext,
      tokenKeyId: encrypted.keyId,
      tokenExpiresAt: new Date(Date.now() + expiresIn * 1000),
      scopes: [...instagramScopes],
      status: 'ACTIVE',
    },
    update: {
      username: profile.username,
      name: profile.name,
      profilePictureUrl: profile.profilePictureUrl,
      followersCount: profile.followersCount,
      accountType: profile.accountType,
      accessTokenEnc: encrypted.ciphertext,
      tokenKeyId: encrypted.keyId,
      tokenExpiresAt: new Date(Date.now() + expiresIn * 1000),
      scopes: [...instagramScopes],
      status: 'ACTIVE',
    },
  });
  return { ok: true as const, data: { workspaceId: saved.workspaceId } };
}

export async function disconnectInstagramAccount(token: string, accountId: string) {
  const profile = await requireRole(token, 'ADMIN');
  if (!profile.ok) return profile;
  const workspaceId = profile.data.workspace?.id;
  const db = database();
  if (!workspaceId || !db) return fail(403, 'فضای کاری فعال نیست');
  const account = await db.instagramAccount.findFirst({ where: { id: accountId, workspaceId } });
  if (!account) return fail(404, 'حساب پیدا نشد');
  await db.instagramAccount.update({
    where: { id: account.id },
    data: { accessTokenEnc: randomBytes(24).toString('base64url'), tokenKeyId: 'revoked' },
  });
  await db.instagramAccount.update({
    where: { id: account.id },
    data: { accessTokenEnc: null, tokenKeyId: null, status: 'REVOKED' },
  });
  await db.automationRule.updateMany({
    where: { instagramAccountId: account.id, status: 'ACTIVE' },
    data: { status: 'PAUSED' },
  });
  return { ok: true as const, data: { id: account.id } };
}

export async function listRecentMedia(token: string, accountId: string) {
  const profile = await requireRole(token, 'AGENT');
  if (!profile.ok) return profile;
  const workspaceId = profile.data.workspace?.id;
  const db = database();
  const keys = encryption();
  const redis = await getRedis().catch(() => null);
  if (!workspaceId || !db || !keys || !redis) return fail(503, 'فهرست پست‌ها در دسترس نیست');
  const account = await db.instagramAccount.findFirst({
    where: { id: accountId, workspaceId, status: 'ACTIVE' },
  });
  if (!account?.accessTokenEnc || !account.tokenKeyId) return fail(404, 'حساب پیدا نشد');
  const cacheKey = `ig:media:${account.id}`;
  const cached = await redis.get(cacheKey);
  if (cached) return { ok: true as const, data: JSON.parse(cached) as unknown[] };
  let accessToken = '';
  try {
    accessToken = decryptSecret(
      { keyId: account.tokenKeyId, ciphertext: account.accessTokenEnc },
      keys.key,
    );
  } catch {
    return fail(503, 'توکن حساب قابل استفاده نیست');
  }
  const api = createInstagramApi({ mode: resolveInstagramMode(process.env) });
  const media = await api.fetchRecentMedia(accessToken);
  await redis.set(cacheKey, JSON.stringify(media), 'EX', 300);
  return { ok: true as const, data: media };
}

export async function ingestInstagramWebhook(raw: Buffer, signature: string | null) {
  const secret = process.env.META_APP_SECRET ?? '';
  if (!secret || !signature || !verifyMetaSignature(raw, signature, secret)) return 401;
  let payload: unknown;
  try {
    payload = JSON.parse(raw.toString('utf8'));
  } catch {
    return 400;
  }
  const db = database();
  const jobs = await webhookQueue();
  if (!db || !jobs) return 503;
  for (const event of parseWebhookPayload(payload)) {
    let rowId = '';
    try {
      const row = await db.webhookEvent.create({
        data: {
          externalEventId: event.externalEventId,
          source: 'INSTAGRAM',
          eventType: event.triggerType,
          payloadJson: { ...event, timestamp: event.timestamp.toISOString() },
          status: 'QUEUED',
        },
      });
      rowId = row.id;
    } catch {
      const existing = await db.webhookEvent.findUnique({
        where: { externalEventId: event.externalEventId },
      });
      if (!existing) return 503;
      continue;
    }
    try {
      await jobs.add(
        'instagram.webhook',
        { eventId: rowId },
        { jobId: rowId, attempts: 3, backoff: { type: 'exponential', delay: 1000 } },
      );
    } catch {
      return 503;
    }
  }
  return 200;
}

function tokensEqual(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function verifyWebhookSubscription(params: URLSearchParams) {
  const expected = process.env.META_WEBHOOK_VERIFY_TOKEN ?? '';
  const mode = params.get('hub.mode');
  const token = params.get('hub.verify_token') ?? '';
  const challenge = params.get('hub.challenge') ?? '';
  if (mode !== 'subscribe' || !expected || !tokensEqual(token, expected)) return null;
  return challenge;
}

async function revokeInstagramUser(igUserId: string) {
  const db = database();
  if (!db) return;
  const accounts = await db.instagramAccount.findMany({ where: { igUserId } });
  for (const account of accounts) {
    await db.instagramAccount.update({
      where: { id: account.id },
      data: { status: 'REVOKED', accessTokenEnc: null, tokenKeyId: null },
    });
    await db.automationRule.updateMany({
      where: { instagramAccountId: account.id, status: 'ACTIVE' },
      data: { status: 'PAUSED' },
    });
    await db.automationLog.updateMany({
      where: { instagramAccountId: account.id },
      data: { igsid: 'removed', matchedKeyword: null, errorMessage: null },
    });
    await db.webhookEvent.updateMany({
      where: { instagramAccountId: account.id },
      data: { payloadJson: {}, errorMessage: null },
    });
  }
}

export async function deauthorizeInstagram(signedRequest: string) {
  const secret = process.env.META_APP_SECRET ?? '';
  const data = readSignedRequest(signedRequest, secret);
  if (!data) return 401;
  await revokeInstagramUser(data.user_id);
  return 200;
}

export async function startDataDeletion(signedRequest: string, statusUrl: string) {
  const secret = process.env.META_APP_SECRET ?? '';
  const data = readSignedRequest(signedRequest, secret);
  if (!data) return null;
  const db = database();
  if (!db) return null;
  const confirmationCode = createHash('sha256')
    .update(`${data.user_id}:${randomBytes(8).toString('hex')}`)
    .digest('hex')
    .slice(0, 24);
  await revokeInstagramUser(data.user_id);
  await db.dataDeletionRequest.create({
    data: {
      confirmationCode,
      igUserId: data.user_id,
      status: 'COMPLETED',
      completedAt: new Date(),
    },
  });
  return { url: statusUrl.replace('CODE', confirmationCode), confirmation_code: confirmationCode };
}

export async function dataDeletionStatus(code: string) {
  const db = database();
  if (!db) return null;
  const row = await db.dataDeletionRequest.findUnique({ where: { confirmationCode: code } });
  if (!row) return null;
  return row.status;
}

export async function connectMockAccount(token: string) {
  if (process.env.NODE_ENV === 'production') return fail(404, 'پیدا نشد');
  const profile = await requireRole(token, 'ADMIN');
  if (!profile.ok) return profile;
  const workspaceId = profile.data.workspace?.id;
  const db = database();
  const keys = encryption();
  if (!workspaceId || !db || !keys) return fail(503, 'اتصال آزمایشی در دسترس نیست');
  const subscription = await activePlan(workspaceId);
  if (!subscription) return fail(403, 'اشتراک فعالی برای اتصال حساب نیست');
  const used = await db.instagramAccount.count({
    where: { workspaceId, status: { not: 'REVOKED' } },
  });
  if (used >= subscription.plan.maxInstagramAccounts)
    return fail(403, 'سقف حساب اینستاگرام این پلن پر شده است');
  const igUserId = `mock-${workspaceId}`;
  const encrypted = encryptSecret(`mock-access-${workspaceId}`, keys.key, keys.keyId);
  await db.instagramAccount.upsert({
    where: { workspaceId_igUserId: { workspaceId, igUserId } },
    create: {
      workspaceId,
      igUserId,
      username: 'directora_demo',
      name: 'پیج آزمایشی',
      followersCount: 12400,
      accountType: 'BUSINESS',
      accessTokenEnc: encrypted.ciphertext,
      tokenKeyId: encrypted.keyId,
      tokenExpiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      scopes: [...instagramScopes],
      status: 'ACTIVE',
    },
    update: {
      username: 'directora_demo',
      followersCount: 12400,
      accountType: 'BUSINESS',
      accessTokenEnc: encrypted.ciphertext,
      tokenKeyId: encrypted.keyId,
      status: 'ACTIVE',
      tokenExpiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    },
  });
  return { ok: true as const, data: { username: 'directora_demo' } };
}

export async function simulateWebhook(
  token: string,
  body: { kind: 'comment' | 'dm'; text: string },
) {
  if (process.env.NODE_ENV === 'production') return fail(404, 'پیدا نشد');
  const profile = await requireRole(token, 'AGENT');
  if (!profile.ok) return profile;
  const workspaceId = profile.data.workspace?.id;
  const db = database();
  const secret = process.env.META_APP_SECRET;
  if (!workspaceId || !db || !secret) return fail(503, 'شبیه‌ساز به META_APP_SECRET نیاز دارد');
  const account = await db.instagramAccount.findFirst({
    where: { workspaceId, status: 'ACTIVE' },
    orderBy: { connectedAt: 'desc' },
  });
  if (!account) return fail(400, 'ابتدا یک حساب وصل کنید');
  const commentId = `sim-${randomBytes(4).toString('hex')}`;
  const payload =
    body.kind === 'dm'
      ? {
          object: 'instagram',
          entry: [
            {
              id: account.igUserId,
              messaging: [
                {
                  sender: { id: `igsid-${workspaceId.slice(0, 8)}` },
                  recipient: { id: account.igUserId },
                  timestamp: Date.now(),
                  message: { mid: commentId, text: body.text },
                },
              ],
            },
          ],
        }
      : {
          object: 'instagram',
          entry: [
            {
              id: account.igUserId,
              changes: [
                {
                  field: 'comments',
                  value: {
                    id: commentId,
                    text: body.text,
                    from: { id: `igsid-${workspaceId.slice(0, 8)}` },
                    media: { id: 'media-demo' },
                    timestamp: Math.floor(Date.now() / 1000),
                  },
                },
              ],
            },
          ],
        };
  const raw = Buffer.from(JSON.stringify(payload));
  const { createHmac } = await import('node:crypto');
  const signature = `sha256=${createHmac('sha256', secret).update(raw).digest('hex')}`;
  const status = await ingestInstagramWebhook(raw, signature);
  if (status !== 200) return fail(status, 'رویداد پذیرفته نشد');
  return { ok: true as const, data: { accepted: true } };
}

export async function saveAutomation(token: string, input: unknown, ruleId?: string) {
  const minimum = ruleId ? 'AGENT' : 'AGENT';
  const profile = await requireRole(token, minimum);
  if (!profile.ok) return profile;
  const workspaceId = profile.data.workspace?.id;
  const db = database();
  if (!workspaceId || !db) return fail(403, 'فضای کاری فعال نیست');
  const parsed = automationInputSchema.safeParse(input);
  if (!parsed.success) return fail(400, 'اطلاعات دستور معتبر نیست');
  const data = parsed.data;
  const account = await db.instagramAccount.findFirst({
    where: { id: data.instagramAccountId, workspaceId },
  });
  if (!account) return fail(404, 'حساب اینستاگرام پیدا نشد');
  const record = ruleRecord(workspaceId, data);
  if (!ruleId) {
    const created = await db.automationRule.create({ data: { ...record, status: 'ACTIVE' } });
    return { ok: true as const, data: { id: created.id } };
  }
  const existing = await db.automationRule.findFirst({ where: { id: ruleId, workspaceId } });
  if (!existing) return fail(404, 'دستور پیدا نشد');
  await db.automationRule.update({ where: { id: existing.id }, data: record });
  return { ok: true as const, data: { id: existing.id } };
}

function ruleRecord(workspaceId: string, data: AutomationInput) {
  return {
    workspaceId,
    instagramAccountId: data.instagramAccountId,
    name: data.name,
    triggerType: data.triggerType,
    mediaScope: data.mediaScope,
    mediaId: data.mediaScope === 'SPECIFIC' ? (data.mediaId ?? null) : null,
    matchType: data.matchType,
    keywords: data.keywords,
    replyText: data.replyText,
    replyButtonsJson: data.buttons,
    publicCommentReplyText: data.publicCommentReplyText ?? null,
    sendPrivateReply: data.sendPrivateReply,
    cooldownSeconds: data.cooldownSeconds,
  };
}

export async function toggleAutomation(token: string, ruleId: string) {
  const profile = await requireRole(token, 'AGENT');
  if (!profile.ok) return profile;
  const workspaceId = profile.data.workspace?.id;
  const db = database();
  if (!workspaceId || !db) return fail(403, 'فضای کاری فعال نیست');
  const rule = await db.automationRule.findFirst({ where: { id: ruleId, workspaceId } });
  if (!rule) return fail(404, 'دستور پیدا نشد');
  const status = rule.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
  await db.automationRule.update({ where: { id: rule.id }, data: { status } });
  return { ok: true as const, data: { status } };
}

export async function deleteAutomation(token: string, ruleId: string) {
  const profile = await requireRole(token, 'ADMIN');
  if (!profile.ok) return profile;
  const workspaceId = profile.data.workspace?.id;
  const db = database();
  if (!workspaceId || !db) return fail(403, 'فضای کاری فعال نیست');
  const rule = await db.automationRule.findFirst({ where: { id: ruleId, workspaceId } });
  if (!rule) return fail(404, 'دستور پیدا نشد');
  await db.automationLog.updateMany({ where: { ruleId: rule.id }, data: { ruleId: null } });
  await db.automationRule.delete({ where: { id: rule.id } });
  return { ok: true as const, data: { id: rule.id } };
}

export async function dashboardStats(workspaceId: string) {
  const db = database();
  if (!db) throw new Error('database is unavailable');
  const startToday = new Date();
  startToday.setHours(0, 0, 0, 0);
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const [accounts, activeRules, today, monthLogs, recent, subscription] = await Promise.all([
    db.instagramAccount.count({ where: { workspaceId, status: { not: 'REVOKED' } } }),
    db.automationRule.count({ where: { workspaceId, status: 'ACTIVE' } }),
    db.automationLog.count({ where: { workspaceId, createdAt: { gte: startToday } } }),
    db.automationLog.findMany({
      where: { workspaceId, createdAt: { gte: since } },
      select: { status: true },
    }),
    db.automationLog.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { rule: true },
    }),
    activePlan(workspaceId),
  ]);
  const success = monthLogs.filter((item) => item.status === 'SUCCESS').length;
  const finished = monthLogs.filter(
    (item) => item.status === 'SUCCESS' || item.status === 'FAILED',
  ).length;
  const endsAt = subscription?.endsAt.getTime() ?? Date.now();
  const remainingDays = Math.max(0, Math.ceil((endsAt - Date.now()) / (24 * 60 * 60 * 1000)));
  const duration = subscription?.plan.durationDays ?? 1;
  return {
    accounts,
    activeRules,
    today,
    success30: success,
    successRate: finished === 0 ? 0 : Math.round((success / finished) * 100),
    planName: subscription?.plan.nameFa ?? 'بدون اشتراک',
    remainingDays,
    progress: Math.min(100, Math.round(((duration - remainingDays) / duration) * 100)),
    recent,
  };
}
