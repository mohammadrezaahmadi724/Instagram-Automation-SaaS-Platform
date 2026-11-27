import { getPrisma } from '@directora/db';

function db() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('database is unavailable');
  return getPrisma(url);
}

export async function listAccounts(workspaceId: string) {
  return db().instagramAccount.findMany({
    where: { workspaceId, status: { not: 'REVOKED' } },
    orderBy: { connectedAt: 'desc' },
  });
}

export async function listRules(workspaceId: string) {
  return db().automationRule.findMany({
    where: { workspaceId },
    orderBy: { updatedAt: 'desc' },
    include: { instagramAccount: true },
  });
}

export async function getRule(workspaceId: string, ruleId: string) {
  return db().automationRule.findFirst({ where: { id: ruleId, workspaceId } });
}

export async function listLogs(
  workspaceId: string,
  filters: {
    status?: string | undefined;
    triggerType?: string | undefined;
    ruleId?: string | undefined;
    accountId?: string | undefined;
    page?: number | undefined;
  },
) {
  const page = Math.max(1, filters.page ?? 1);
  const statuses = [
    'SUCCESS',
    'FAILED',
    'SKIPPED_WINDOW',
    'SKIPPED_COOLDOWN',
    'RATE_LIMITED',
    'SKIPPED_PLAN_LIMIT',
  ];
  const triggers = ['POST_COMMENT', 'LIVE_COMMENT', 'DM', 'STORY_REPLY'];
  const status = statuses.find((item) => item === filters.status);
  const triggerType = triggers.find((item) => item === filters.triggerType);
  const where = {
    workspaceId,
    ...(status ? { status: status as 'SUCCESS' } : {}),
    ...(triggerType ? { triggerType: triggerType as 'DM' } : {}),
    ...(filters.ruleId ? { ruleId: filters.ruleId } : {}),
    ...(filters.accountId ? { instagramAccountId: filters.accountId } : {}),
  };
  const [rows, total] = await Promise.all([
    db().automationLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * 20,
      take: 20,
      include: { rule: true },
    }),
    db().automationLog.count({ where }),
  ]);
  return { rows, total, page };
}
