import {
  amountFromPlan,
  cardToCardGateway,
  normalizeReceiptFields,
  pendingReceiptLimitError,
} from '@directora/core';
import { getPrisma } from '@directora/db';
import { requireRole } from '../auth/service';

function db() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  return getPrisma(url);
}

function jsonValue(value: unknown) {
  return value && typeof value === 'object' ? value : {};
}

export async function billingOverview(token: string) {
  const profile = await requireRole(token, 'VIEWER');
  if (!profile.ok) return profile;
  const client = db();
  const workspaceId = profile.data.workspace?.id;
  if (!client || !workspaceId) return { ok: false as const, status: 500, error: 'داده در دسترس نیست' };
  const [subscription, plans, receipts, setting] = await Promise.all([
    client.subscription.findFirst({
      where: { workspaceId, status: { in: ['TRIAL', 'ACTIVE', 'PAST_DUE'] } },
      orderBy: { endsAt: 'desc' },
      include: { plan: true },
    }),
    client.plan.findMany({ where: { isActive: true }, orderBy: { priceRial: 'asc' } }),
    client.paymentReceipt.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
      include: { plan: true },
      take: 20,
    }),
    client.systemSetting.findUnique({ where: { key: 'billing.card_to_card' } }),
  ]);
  const card = jsonValue(setting?.valueJson) as {
    cardNumber?: string;
    iban?: string;
    accountHolderName?: string;
  };
  return {
    ok: true as const,
    data: {
      role: profile.data.workspace?.role,
      subscription: subscription
        ? {
            status: subscription.status,
            startsAt: subscription.startsAt.toISOString(),
            endsAt: subscription.endsAt.toISOString(),
            plan: {
              id: subscription.plan.id,
              code: subscription.plan.code,
              nameFa: subscription.plan.nameFa,
              durationDays: subscription.plan.durationDays,
              minFollowers: subscription.plan.minFollowers,
              maxFollowers: subscription.plan.maxFollowers,
            },
          }
        : null,
      plans: plans.map((plan) => ({
        id: plan.id,
        code: plan.code,
        nameFa: plan.nameFa,
        priceRial: plan.priceRial.toString(),
        durationDays: plan.durationDays,
        maxInstagramAccounts: plan.maxInstagramAccounts,
        maxMonthlyExecutions: plan.maxMonthlyExecutions,
        minFollowers: plan.minFollowers,
        maxFollowers: plan.maxFollowers,
        featuresJson: plan.featuresJson,
      })),
      receipts: receipts.map((receipt) => ({
        id: receipt.id,
        planName: receipt.plan.nameFa,
        amountRial: receipt.amountRial.toString(),
        referenceCode: receipt.referenceCode,
        payerCardLast4: receipt.payerCardLast4,
        note: receipt.note,
        status: receipt.status,
        reviewNote: receipt.reviewNote,
        createdAt: receipt.createdAt.toISOString(),
      })),
      cardToCard: {
        cardNumber: card.cardNumber ?? '',
        iban: card.iban ?? '',
        accountHolderName: card.accountHolderName ?? '',
      },
    },
  };
}

export async function submitReceipt(token: string, body: unknown) {
  const profile = await requireRole(token, 'ADMIN');
  if (!profile.ok) return profile;
  const client = db();
  const workspaceId = profile.data.workspace?.id;
  if (!client || !workspaceId) return { ok: false as const, status: 500, error: 'داده در دسترس نیست' };
  const record = body && typeof body === 'object' ? (body as Record<string, unknown>) : {};
  const fields = normalizeReceiptFields(record);
  if (!fields.ok) return { ok: false as const, status: 400, error: fields.error };
  if (typeof record.planId !== 'string') return { ok: false as const, status: 400, error: 'پلن معتبر نیست' };
  const plan = await client.plan.findUnique({ where: { id: record.planId } });
  const priced = amountFromPlan(
    plan ? { isActive: plan.isActive, priceRial: plan.priceRial } : null,
    record.amountRial,
  );
  if (!priced.ok) return { ok: false as const, status: 400, error: priced.error };
  const pending = await client.paymentReceipt.count({ where: { workspaceId, status: 'PENDING' } });
  const limited = pendingReceiptLimitError(pending);
  if (limited) return { ok: false as const, status: 409, error: limited };
  const draft = cardToCardGateway.prepare({
    workspaceId,
    planId: plan!.id,
    amountRial: priced.amountRial,
    referenceCode: fields.value.referenceCode,
    payerCardLast4: fields.value.payerCardLast4,
    note: fields.value.note,
    submittedByUserId: profile.data.user.id,
  });
  const receipt = await client.paymentReceipt.create({
    data: {
      workspaceId: draft.workspaceId,
      planId: draft.planId,
      method: draft.method,
      amountRial: draft.amountRial,
      referenceCode: draft.referenceCode,
      payerCardLast4: draft.payerCardLast4,
      note: draft.note,
      status: draft.status,
      submittedByUserId: draft.submittedByUserId,
    },
  });
  return {
    ok: true as const,
    data: { id: receipt.id, status: receipt.status, amountRial: receipt.amountRial.toString() },
  };
}
