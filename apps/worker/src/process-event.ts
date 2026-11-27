import { decryptSecret, encryptSecret } from '@directora/core';
import { getPrisma } from '@directora/db';
import {
  InstagramApiError,
  createInstagramApi,
  matchAutomationRule,
  resolveInstagramMode,
  type ReplyButton,
} from '@directora/instagram';
import type { Redis } from 'ioredis';

const dayMs = 24 * 60 * 60 * 1000;
const liveWindowMs = 15 * 60 * 1000;

type StoredEvent = {
  triggerType: 'POST_COMMENT' | 'LIVE_COMMENT' | 'DM' | 'STORY_REPLY';
  igUserId: string;
  igsid: string;
  commentId: string | null;
  mediaId: string | null;
  text: string;
  timestamp: string;
  isEcho: boolean;
};

function buttonsOf(value: unknown): ReplyButton[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item): ReplyButton[] => {
    if (!item || typeof item !== 'object') return [];
    const button = item as { type?: string; title?: string; url?: string; payload?: string };
    if (button.type === 'web_url' && button.title && button.url) {
      return [{ type: 'web_url' as const, title: button.title, url: button.url }];
    }
    if (button.type === 'postback' && button.title && button.payload) {
      return [{ type: 'postback' as const, title: button.title, payload: button.payload }];
    }
    return [];
  });
}

export async function processWebhookJob(input: {
  eventId: string;
  attemptsMade: number;
  maxAttempts: number;
  redis: Redis;
}) {
  const databaseUrl = process.env.DATABASE_URL;
  const key = process.env.ENCRYPTION_KEY;
  if (!databaseUrl || !key) throw new InstagramApiError('TRANSIENT', true);
  const db = getPrisma(databaseUrl);
  const row = await db.webhookEvent.findUnique({ where: { id: input.eventId } });
  if (!row || row.status === 'PROCESSED' || row.status === 'IGNORED') return;
  const event = row.payloadJson as StoredEvent;
  if (event.isEcho) {
    await db.webhookEvent.update({
      where: { id: row.id },
      data: { status: 'IGNORED', processedAt: new Date() },
    });
    return;
  }
  const account = await db.instagramAccount.findFirst({
    where: { igUserId: event.igUserId, status: 'ACTIVE' },
  });
  if (!account) {
    await db.webhookEvent.update({
      where: { id: row.id },
      data: { status: 'IGNORED', processedAt: new Date() },
    });
    return;
  }
  const subscription = await db.subscription.findFirst({
    where: {
      workspaceId: account.workspaceId,
      status: { in: ['TRIAL', 'ACTIVE'] },
      endsAt: { gt: new Date() },
    },
    include: { plan: true },
    orderBy: { createdAt: 'desc' },
  });
  const fail = async (
    status:
      'FAILED' | 'SKIPPED_WINDOW' | 'SKIPPED_COOLDOWN' | 'SKIPPED_PLAN_LIMIT' | 'RATE_LIMITED',
    errorCode?: string,
  ) => {
    await db.automationLog.create({
      data: {
        workspaceId: account.workspaceId,
        instagramAccountId: account.id,
        webhookEventId: row.id,
        igsid: event.igsid,
        triggerType: event.triggerType,
        actionType: 'NONE',
        status,
        errorCode: errorCode ?? null,
      },
    });
    await db.webhookEvent.update({
      where: { id: row.id },
      data: {
        status: status === 'FAILED' ? 'FAILED' : 'PROCESSED',
        workspaceId: account.workspaceId,
        instagramAccountId: account.id,
        processedAt: new Date(),
      },
    });
  };
  if (!subscription) return fail('SKIPPED_PLAN_LIMIT', 'NO_SUBSCRIPTION');
  const monthStart = new Date();
  monthStart.setUTCDate(1);
  monthStart.setUTCHours(0, 0, 0, 0);
  const used = await db.automationLog.count({
    where: { workspaceId: account.workspaceId, status: 'SUCCESS', createdAt: { gte: monthStart } },
  });
  if (used >= subscription.plan.maxMonthlyExecutions)
    return fail('SKIPPED_PLAN_LIMIT', 'MONTHLY_EXECUTIONS');
  if (
    subscription.plan.maxFollowers !== null &&
    (account.followersCount ?? 0) > subscription.plan.maxFollowers
  ) {
    return fail('SKIPPED_PLAN_LIMIT', 'FOLLOWERS');
  }
  if (!account.accessTokenEnc || !account.tokenKeyId) return fail('FAILED', 'TOKEN_MISSING');
  let accessToken = '';
  try {
    accessToken = decryptSecret(
      { keyId: account.tokenKeyId, ciphertext: account.accessTokenEnc },
      key,
    );
  } catch {
    return fail('FAILED', 'TOKEN_UNREADABLE');
  }
  const rules = await db.automationRule.findMany({
    where: { instagramAccountId: account.id, status: 'ACTIVE' },
    orderBy: { createdAt: 'asc' },
  });
  const rule = matchAutomationRule(
    { triggerType: event.triggerType, mediaId: event.mediaId, text: event.text },
    rules.map((item) => ({
      id: item.id,
      status: item.status,
      triggerType: item.triggerType,
      mediaScope: item.mediaScope,
      mediaId: item.mediaId,
      matchType: item.matchType,
      keywords: item.keywords,
      createdAt: item.createdAt.toISOString(),
    })),
  );
  if (!rule) {
    await db.webhookEvent.update({
      where: { id: row.id },
      data: {
        status: 'IGNORED',
        workspaceId: account.workspaceId,
        instagramAccountId: account.id,
        processedAt: new Date(),
      },
    });
    return;
  }
  const age = Date.now() - new Date(event.timestamp).getTime();
  if ((event.triggerType === 'DM' || event.triggerType === 'STORY_REPLY') && age > dayMs)
    return fail('SKIPPED_WINDOW');
  if (event.triggerType === 'POST_COMMENT' && age > 7 * dayMs) return fail('SKIPPED_WINDOW');
  if (event.triggerType === 'LIVE_COMMENT' && age > liveWindowMs) return fail('SKIPPED_WINDOW');
  const saved = rules.find((item) => item.id === rule.id);
  if (!saved) return fail('FAILED', 'RULE_MISSING');
  if (saved.cooldownSeconds > 0) {
    const cooled = await input.redis.set(
      `cooldown:${saved.id}:${event.igsid}`,
      '1',
      'EX',
      saved.cooldownSeconds,
      'NX',
    );
    if (cooled !== 'OK') return fail('SKIPPED_COOLDOWN');
  }
  if (
    event.commentId &&
    (event.triggerType === 'POST_COMMENT' || event.triggerType === 'LIVE_COMMENT')
  ) {
    const lock = await input.redis.set(
      `ig:private-reply:${event.commentId}`,
      '1',
      'EX',
      8 * 24 * 60 * 60,
      'NX',
    );
    if (lock !== 'OK') return fail('SKIPPED_WINDOW', 'PRIVATE_REPLY_ONCE');
  }
  const api = createInstagramApi({ mode: resolveInstagramMode(process.env) });
  const buttons = buttonsOf(saved.replyButtonsJson);
  try {
    if (event.triggerType === 'DM' || event.triggerType === 'STORY_REPLY') {
      await api.sendDirectMessage(
        accessToken,
        account.igUserId,
        event.igsid,
        saved.replyText ?? '',
        buttons,
      );
    } else if (saved.sendPrivateReply && event.commentId) {
      await api.sendPrivateReplyToComment(
        accessToken,
        account.igUserId,
        event.commentId,
        saved.replyText ?? '',
        buttons,
      );
    }
    if (saved.publicCommentReplyText && event.commentId) {
      await api.replyToCommentPublicly(accessToken, event.commentId, saved.publicCommentReplyText);
    }
  } catch (error) {
    const apiError =
      error instanceof InstagramApiError ? error : new InstagramApiError('TRANSIENT', true);
    if (apiError.code === 'EXPIRED_TOKEN') {
      await db.instagramAccount.update({ where: { id: account.id }, data: { status: 'EXPIRED' } });
    }
    if (apiError.retryable && input.attemptsMade < input.maxAttempts) {
      if (event.commentId) await input.redis.del(`ig:private-reply:${event.commentId}`);
      if (saved.cooldownSeconds > 0) await input.redis.del(`cooldown:${saved.id}:${event.igsid}`);
      throw apiError;
    }
    await db.automationLog.create({
      data: {
        workspaceId: account.workspaceId,
        instagramAccountId: account.id,
        ruleId: saved.id,
        webhookEventId: row.id,
        igsid: event.igsid,
        triggerType: event.triggerType,
        matchedKeyword: saved.keywords[0] ?? null,
        actionType: event.triggerType,
        status: apiError.code === 'RATE_LIMITED' ? 'RATE_LIMITED' : 'FAILED',
        errorCode: apiError.code,
      },
    });
    await db.webhookEvent.update({
      where: { id: row.id },
      data: {
        status: 'FAILED',
        workspaceId: account.workspaceId,
        instagramAccountId: account.id,
        processedAt: new Date(),
        errorMessage: apiError.code,
      },
    });
    return;
  }
  await db.automationLog.create({
    data: {
      workspaceId: account.workspaceId,
      instagramAccountId: account.id,
      ruleId: saved.id,
      webhookEventId: row.id,
      igsid: event.igsid,
      triggerType: event.triggerType,
      matchedKeyword: saved.keywords[0] ?? null,
      actionType: event.triggerType,
      status: 'SUCCESS',
    },
  });
  await db.automationRule.update({
    where: { id: saved.id },
    data: { executionCount: { increment: 1 } },
  });
  await db.webhookEvent.update({
    where: { id: row.id },
    data: {
      status: 'PROCESSED',
      workspaceId: account.workspaceId,
      instagramAccountId: account.id,
      processedAt: new Date(),
    },
  });
}

export async function refreshDueTokens(redisUnused?: Redis) {
  void redisUnused;
  const databaseUrl = process.env.DATABASE_URL;
  const key = process.env.ENCRYPTION_KEY;
  const keyId = process.env.ENCRYPTION_KEY_ID;
  if (!databaseUrl || !key || !keyId) return;
  const db = getPrisma(databaseUrl);
  const soon = new Date(Date.now() + 10 * dayMs);
  const dayAgo = new Date(Date.now() - dayMs);
  const accounts = await db.instagramAccount.findMany({
    where: {
      status: 'ACTIVE',
      tokenExpiresAt: { gt: new Date(), lt: soon },
      updatedAt: { lt: dayAgo },
    },
  });
  const api = createInstagramApi({ mode: resolveInstagramMode(process.env) });
  for (const account of accounts) {
    if (!account.accessTokenEnc || !account.tokenKeyId) continue;
    try {
      const current = decryptSecret(
        { keyId: account.tokenKeyId, ciphertext: account.accessTokenEnc },
        key,
      );
      const refreshed = await api.refreshLongLivedToken(current);
      const encrypted = encryptSecret(refreshed.accessToken, key, keyId);
      const expiresIn = refreshed.expiresIn ?? (60 * dayMs) / 1000;
      await db.instagramAccount.update({
        where: { id: account.id },
        data: {
          accessTokenEnc: encrypted.ciphertext,
          tokenKeyId: encrypted.keyId,
          tokenExpiresAt: new Date(Date.now() + expiresIn * 1000),
        },
      });
    } catch (error) {
      if (error instanceof InstagramApiError && error.code === 'EXPIRED_TOKEN') {
        await db.instagramAccount.update({
          where: { id: account.id },
          data: { status: 'EXPIRED' },
        });
      }
    }
  }
}
