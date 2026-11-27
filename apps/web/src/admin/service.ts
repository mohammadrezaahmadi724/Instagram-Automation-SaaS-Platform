import { decideAdminAccess, nextSubscriptionWindow, settingKeyError } from '@directora/core';
import { getPrisma, type PrismaClient } from '@directora/db';
import { loadSession } from '../auth/service';

type Tx = Pick<PrismaClient, 'subscription'>;

function db() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  return getPrisma(url);
}

export async function requireSuperAdmin(token: string | null) {
  const session = token ? await loadSession(token) : null;
  const decision = decideAdminAccess({
    hasSession: Boolean(session),
    isActive: Boolean(session?.user.isActive),
    isSuperAdmin: Boolean(session?.user.isSuperAdmin),
  });
  if (decision === 'unauthenticated' || !session) {
    return { ok: false as const, status: 401, error: 'وارد نشده‌اید' };
  }
  if (decision === 'forbidden') return { ok: false as const, status: 403, error: 'اجازه این کار را ندارید' };
  return { ok: true as const, userId: session.user.id };
}

async function applyPlan(
  tx: Tx,
  workspaceId: string,
  planId: string,
  durationDays: number,
  now: Date,
) {
  const current = await tx.subscription.findFirst({
    where: { workspaceId, status: { in: ['TRIAL', 'ACTIVE', 'PAST_DUE'] } },
    orderBy: { endsAt: 'desc' },
  });
  const window = nextSubscriptionWindow({
    now,
    durationDays,
    targetPlanId: planId,
    current: current
      ? { planId: current.planId, status: current.status, endsAt: current.endsAt }
      : null,
  });
  if (window.mode === 'extend' && current) {
    return tx.subscription.update({
      where: { id: current.id },
      data: { status: 'ACTIVE', endsAt: window.endsAt },
    });
  }
  await tx.subscription.updateMany({
    where: { workspaceId, status: { in: ['TRIAL', 'ACTIVE', 'PAST_DUE'] } },
    data: { status: 'CANCELED' },
  });
  return tx.subscription.create({
    data: {
      workspaceId,
      planId,
      status: 'ACTIVE',
      startsAt: window.startsAt,
      endsAt: window.endsAt,
    },
  });
}

export async function adminStats() {
  const client = db();
  if (!client) return null;
  const [users, workspaces, accounts, paid, pending, approved] = await Promise.all([
    client.user.count(),
    client.workspace.count(),
    client.instagramAccount.count({ where: { status: 'ACTIVE' } }),
    client.subscription.count({ where: { status: 'ACTIVE' } }),
    client.paymentReceipt.count({ where: { status: 'PENDING' } }),
    client.paymentReceipt.aggregate({ where: { status: 'APPROVED' }, _sum: { amountRial: true } }),
  ]);
  return {
    users,
    workspaces,
    connectedAccounts: accounts,
    paidSubscriptions: paid,
    pendingReceipts: pending,
    approvedAmountRial: (approved._sum.amountRial ?? 0n).toString(),
  };
}

export async function listReceipts(status: string | null, page: number) {
  const client = db();
  if (!client) return null;
  const statusFilter: 'PENDING' | 'APPROVED' | 'REJECTED' | null =
    status === 'PENDING' || status === 'APPROVED' || status === 'REJECTED' ? status : null;
  const where = statusFilter ? { status: statusFilter } : {};
  const take = 20;
  const [rows, total] = await Promise.all([
    client.paymentReceipt.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * take,
      take,
      include: { plan: true, workspace: true },
    }),
    client.paymentReceipt.count({ where }),
  ]);
  return {
    total,
    page,
    receipts: rows.map((row) => ({
      id: row.id,
      workspaceName: row.workspace.name,
      planName: row.plan.nameFa,
      planId: row.planId,
      amountRial: row.amountRial.toString(),
      referenceCode: row.referenceCode,
      payerCardLast4: row.payerCardLast4,
      note: row.note,
      status: row.status,
      reviewNote: row.reviewNote,
      createdAt: row.createdAt.toISOString(),
    })),
  };
}

export async function approveReceipt(id: string, reviewerId: string) {
  const client = db();
  if (!client) return { ok: false as const, status: 500, error: 'داده در دسترس نیست' };
  try {
    const result = await client.$transaction(async (tx) => {
      const receipt = await tx.paymentReceipt.findUnique({ where: { id }, include: { plan: true } });
      if (!receipt || receipt.status !== 'PENDING') throw new Error('not-pending');
      const subscription = await applyPlan(
        tx as Tx,
        receipt.workspaceId,
        receipt.planId,
        receipt.plan.durationDays,
        new Date(),
      );
      const updated = await tx.paymentReceipt.updateMany({
        where: { id, status: 'PENDING' },
        data: {
          status: 'APPROVED',
          reviewedByUserId: reviewerId,
          reviewedAt: new Date(),
          subscriptionId: subscription.id,
        },
      });
      if (updated.count !== 1) throw new Error('not-pending');
      return { endsAt: subscription.endsAt.toISOString() };
    });
    return { ok: true as const, data: result };
  } catch (error) {
    if (error instanceof Error && error.message === 'not-pending') {
      return { ok: false as const, status: 409, error: 'این فیش قبلاً بررسی شده است' };
    }
    return { ok: false as const, status: 500, error: 'تأیید فیش ممکن نشد' };
  }
}

export async function rejectReceipt(id: string, reviewerId: string, reviewNote: string) {
  const note = reviewNote.trim();
  if (!note) return { ok: false as const, status: 400, error: 'دلیل رد لازم است' };
  const client = db();
  if (!client) return { ok: false as const, status: 500, error: 'داده در دسترس نیست' };
  const updated = await client.paymentReceipt.updateMany({
    where: { id, status: 'PENDING' },
    data: { status: 'REJECTED', reviewedByUserId: reviewerId, reviewedAt: new Date(), reviewNote: note },
  });
  if (updated.count !== 1) return { ok: false as const, status: 409, error: 'این فیش قبلاً بررسی شده است' };
  return { ok: true as const, data: { status: 'REJECTED' } };
}

export async function grantSubscription(workspaceId: string, planId: string) {
  const client = db();
  if (!client) return { ok: false as const, status: 500, error: 'داده در دسترس نیست' };
  const plan = await client.plan.findUnique({ where: { id: planId } });
  if (!plan || !plan.isActive) return { ok: false as const, status: 400, error: 'پلن معتبر نیست' };
  const workspace = await client.workspace.findUnique({ where: { id: workspaceId } });
  if (!workspace) return { ok: false as const, status: 404, error: 'فضای کاری پیدا نشد' };
  const subscription = await client.$transaction((tx) =>
    applyPlan(tx as Tx, workspaceId, plan.id, plan.durationDays, new Date()),
  );
  return { ok: true as const, data: { id: subscription.id, endsAt: subscription.endsAt.toISOString() } };
}

const featureKeys = ['aiReply', 'smsAddon', 'formBuilder', 'showcase'] as const;

export function parsePlanInput(body: unknown, withCode: boolean) {
  const record = body && typeof body === 'object' ? (body as Record<string, unknown>) : null;
  if (!record) return { ok: false as const, error: 'دادهٔ پلن معتبر نیست' };
  const nameFa = typeof record.nameFa === 'string' ? record.nameFa.trim() : '';
  if (nameFa.length < 2 || nameFa.length > 80) return { ok: false as const, error: 'نام پلن معتبر نیست' };
  let price: bigint | null = null;
  if (typeof record.priceRial === 'string' || typeof record.priceRial === 'number') {
    try {
      price = BigInt(record.priceRial);
    } catch {
      price = null;
    }
  }
  if (price === null || price < 0n || price % 10n !== 0n) {
    return { ok: false as const, error: 'مبلغ باید ریال صحیح و مضرب ۱۰ باشد' };
  }
  const durationDays = Number(record.durationDays);
  const minFollowers = Number(record.minFollowers);
  const maxFollowers = record.maxFollowers === null ? null : Number(record.maxFollowers);
  const maxInstagramAccounts = Number(record.maxInstagramAccounts);
  const maxMonthlyExecutions = Number(record.maxMonthlyExecutions);
  if (!Number.isInteger(durationDays) || durationDays < 1) return { ok: false as const, error: 'مدت پلن معتبر نیست' };
  if (!Number.isInteger(minFollowers) || minFollowers < 0) return { ok: false as const, error: 'کف فالوور معتبر نیست' };
  if (maxFollowers !== null && (!Number.isInteger(maxFollowers) || maxFollowers < minFollowers)) {
    return { ok: false as const, error: 'سقف فالوور معتبر نیست' };
  }
  if (!Number.isInteger(maxInstagramAccounts) || maxInstagramAccounts < 1) {
    return { ok: false as const, error: 'سقف حساب معتبر نیست' };
  }
  if (!Number.isInteger(maxMonthlyExecutions) || maxMonthlyExecutions < 1) {
    return { ok: false as const, error: 'سقف اجرا معتبر نیست' };
  }
  const features = record.featuresJson && typeof record.featuresJson === 'object' ? (record.featuresJson as Record<string, unknown>) : {};
  const featuresJson = Object.fromEntries(featureKeys.map((key) => [key, features[key] === true]));
  let code: string | undefined;
  if (withCode) {
    code = typeof record.code === 'string' ? record.code.trim() : '';
    if (!code || code.length > 40) return { ok: false as const, error: 'کد پلن معتبر نیست' };
  }
  return {
    ok: true as const,
    data: {
      code,
      nameFa,
      priceRial: price,
      durationDays,
      minFollowers,
      maxFollowers,
      maxInstagramAccounts,
      maxMonthlyExecutions,
      isActive: record.isActive !== false,
      featuresJson,
    },
  };
}

export async function listPlans() {
  const client = db();
  if (!client) return null;
  const plans = await client.plan.findMany({ orderBy: { priceRial: 'asc' } });
  return plans.map((plan) => ({
    id: plan.id,
    code: plan.code,
    nameFa: plan.nameFa,
    priceRial: plan.priceRial.toString(),
    durationDays: plan.durationDays,
    minFollowers: plan.minFollowers,
    maxFollowers: plan.maxFollowers,
    maxInstagramAccounts: plan.maxInstagramAccounts,
    maxMonthlyExecutions: plan.maxMonthlyExecutions,
    isActive: plan.isActive,
    featuresJson: plan.featuresJson,
  }));
}

export async function savePlan(id: string | null, body: unknown) {
  const parsed = parsePlanInput(body, id === null);
  if (!parsed.ok) return { ok: false as const, status: 400, error: parsed.error };
  const client = db();
  if (!client) return { ok: false as const, status: 500, error: 'داده در دسترس نیست' };
  const data = parsed.data;
  if (id) {
    const plan = await client.plan.update({
      where: { id },
      data: {
        nameFa: data.nameFa,
        priceRial: data.priceRial,
        durationDays: data.durationDays,
        minFollowers: data.minFollowers,
        maxFollowers: data.maxFollowers,
        maxInstagramAccounts: data.maxInstagramAccounts,
        maxMonthlyExecutions: data.maxMonthlyExecutions,
        isActive: data.isActive,
        featuresJson: data.featuresJson,
      },
    });
    return { ok: true as const, data: { id: plan.id } };
  }
  if (!data.code) return { ok: false as const, status: 400, error: 'کد پلن معتبر نیست' };
  const plan = await client.plan.create({ data: { ...data, code: data.code } });
  return { ok: true as const, data: { id: plan.id } };
}

export async function listUsers(query: string) {
  const client = db();
  if (!client) return null;
  const users = await client.user.findMany({
    ...(query
      ? {
          where: {
            OR: [{ displayName: { contains: query, mode: 'insensitive' as const } }, { phoneE164: { contains: query } }],
          },
        }
      : {}),
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: {
      memberships: {
        include: {
          workspace: {
            include: {
              subscriptions: { orderBy: { endsAt: 'desc' }, take: 1, include: { plan: true } },
            },
          },
        },
      },
    },
  });
  return users.map((user) => ({
    id: user.id,
    phoneE164: user.phoneE164,
    displayName: user.displayName,
    isActive: user.isActive,
    isSuperAdmin: user.isSuperAdmin,
    workspaces: user.memberships.map((item) => ({
      id: item.workspace.id,
      name: item.workspace.name,
      role: item.role,
      subscription: item.workspace.subscriptions[0]
        ? {
            status: item.workspace.subscriptions[0].status,
            planName: item.workspace.subscriptions[0].plan.nameFa,
            endsAt: item.workspace.subscriptions[0].endsAt.toISOString(),
          }
        : null,
    })),
  }));
}

export async function setUserActive(actorId: string, userId: string, isActive: boolean) {
  const client = db();
  if (!client) return { ok: false as const, status: 500, error: 'داده در دسترس نیست' };
  const target = await client.user.findUnique({ where: { id: userId } });
  if (!target) return { ok: false as const, status: 404, error: 'کاربر پیدا نشد' };
  if (!isActive && target.id === actorId) {
    return { ok: false as const, status: 400, error: 'نمی‌توانید حساب خود را تعلیق کنید' };
  }
  if (!isActive && target.isSuperAdmin) {
    const others = await client.user.count({
      where: { isSuperAdmin: true, isActive: true, id: { not: target.id } },
    });
    if (others < 1) return { ok: false as const, status: 400, error: 'آخرین مدیر پلتفرم را نمی‌توان تعلیق کرد' };
  }
  await client.user.update({ where: { id: userId }, data: { isActive } });
  return { ok: true as const, data: { isActive } };
}

export async function readSettings() {
  const client = db();
  if (!client) return null;
  const rows = await client.systemSetting.findMany({
    where: { key: { in: ['billing.card_to_card', 'support.contact', 'site.notice'] } },
  });
  return Object.fromEntries(rows.map((row) => [row.key, row.valueJson]));
}

export async function writeSettings(actorId: string, body: unknown) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { ok: false as const, status: 400, error: 'دادهٔ تنظیم معتبر نیست' };
  }
  const entries = Object.entries(body as Record<string, unknown>);
  for (const [key] of entries) {
    const error = settingKeyError(key);
    if (error) return { ok: false as const, status: 400, error };
  }
  const client = db();
  if (!client) return { ok: false as const, status: 500, error: 'داده در دسترس نیست' };
  await client.$transaction(
    entries.map(([key, valueJson]) =>
      client.systemSetting.upsert({
        where: { key },
        create: { key, valueJson: valueJson ?? {}, updatedByUserId: actorId },
        update: { valueJson: valueJson ?? {}, updatedByUserId: actorId },
      }),
    ),
  );
  return { ok: true as const, data: { saved: entries.length } };
}
