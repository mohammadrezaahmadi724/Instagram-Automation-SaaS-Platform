import { getPrisma } from '@directora/db';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { currentProfile, type PublicUser, type PublicWorkspace } from '../auth/service';

export async function requireProfile() {
  const token = (await cookies()).get('directora_session')?.value ?? '';
  const profile = await currentProfile(token);
  if (!profile.ok || !profile.data.workspace) redirect('/api/auth/clear-session');
  return profile.data as {
    user: PublicUser;
    workspace: PublicWorkspace;
    workspaces: PublicWorkspace[];
  };
}

function db() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('database is unavailable');
  return getPrisma(url);
}

export async function dashboardData(workspaceId: string) {
  const client = db();
  const [accounts, activeRules, executions, subscription] = await Promise.all([
    client.instagramAccount.count({ where: { workspaceId } }),
    client.automationRule.count({ where: { workspaceId, status: 'ACTIVE' } }),
    client.automationLog.count({ where: { workspaceId } }),
    client.subscription.findFirst({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
      include: { plan: true },
    }),
  ]);
  return { accounts, activeRules, executions, subscription };
}

export async function instagramAccounts(workspaceId: string) {
  return db().instagramAccount.findMany({
    where: { workspaceId },
    orderBy: { connectedAt: 'desc' },
  });
}

export async function automationRules(workspaceId: string) {
  return db().automationRule.findMany({
    where: { workspaceId },
    orderBy: { updatedAt: 'desc' },
  });
}

export async function automationLogs(workspaceId: string) {
  return db().automationLog.findMany({
    where: { workspaceId },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });
}

export async function billingData(workspaceId: string) {
  const client = db();
  const [subscription, plans] = await Promise.all([
    client.subscription.findFirst({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
      include: { plan: true },
    }),
    client.plan.findMany({ where: { isActive: true }, orderBy: { priceRial: 'asc' } }),
  ]);
  return { subscription, plans };
}
