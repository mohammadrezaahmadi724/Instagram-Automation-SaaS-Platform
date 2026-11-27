import { createHash, randomBytes, randomInt } from 'node:crypto';
import { getPrisma } from '@directora/db';
import { normalizeIranMobile } from './phone';
import { getRedis } from './redis';
import { hashOtp, otpBlockReason, otpHashesMatch, otpTtlMs } from './otp';
import { roleAtLeast, type AppRole } from './roles';
import { rememberTestCode, smsProvider } from './sms';

export type AuthResult<T> = { ok: true; data: T } | { ok: false; status: number; error: string };

export type PublicUser = { id: string; phoneE164: string; displayName: string | null };
export type PublicWorkspace = { id: string; name: string; role: AppRole };

function prisma() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  return getPrisma(url);
}

function pepper(): string | null {
  const value = process.env.AUTH_SECRET;
  if (!value || value.length < 16) return null;
  return value;
}

function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

function ttlDays() {
  const parsed = Number(process.env.SESSION_TTL_DAYS ?? '30');
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 30;
}

function fail(status: number, error: string): AuthResult<never> {
  return { ok: false, status, error };
}

async function limited(key: string, limit: number, seconds: number) {
  const client = await getRedis();
  if (!client) return true;
  const count = await client.incr(key);
  if (count === 1) await client.expire(key, seconds);
  return count > limit;
}

export async function requestOtp(
  rawPhone: string,
  ip: string,
): Promise<AuthResult<{ sent: true }>> {
  const phone = normalizeIranMobile(rawPhone);
  if (!phone) return fail(400, 'شماره موبایل ایران معتبر نیست');
  const secret = pepper();
  const db = prisma();
  if (!secret || !db) return fail(500, 'ورود موقتاً در دسترس نیست');
  const client = await getRedis().catch(() => null);
  if (!client) return fail(503, 'ارسال کد ممکن نشد');
  try {
    const gate = await client.set(`otp:gap:${phone}`, '1', 'EX', 60, 'NX');
    if (gate !== 'OK') return fail(429, 'کمی بعد دوباره کد بخواهید');
    if (await limited(`otp:hour:phone:${phone}`, 5, 3600))
      return fail(429, 'سقف درخواست این شماره پر شده است');
    if (ip && (await limited(`otp:hour:ip:${ip}`, 5, 3600)))
      return fail(429, 'سقف درخواست این شبکه پر شده است');
    const code = randomInt(0, 1_000_000).toString().padStart(6, '0');
    await db.otpCode.create({
      data: {
        phoneE164: phone,
        codeHash: hashOtp(phone, code, secret),
        expiresAt: new Date(Date.now() + otpTtlMs),
      },
    });
    await smsProvider().sendOtp(phone, code);
    await rememberTestCode(phone, code);
    return { ok: true, data: { sent: true } };
  } catch {
    return fail(503, 'ارسال کد ممکن نشد');
  }
}

export async function verifyOtp(
  rawPhone: string,
  code: string,
  meta: { ip?: string; userAgent?: string },
): Promise<AuthResult<{ token: string; maxAge: number }>> {
  const phone = normalizeIranMobile(rawPhone);
  if (!phone || !/^\d{6}$/.test(code)) return fail(400, 'شماره یا کد معتبر نیست');
  const secret = pepper();
  const db = prisma();
  if (!secret || !db) return fail(500, 'ورود موقتاً در دسترس نیست');
  const row = await db.otpCode.findFirst({
    where: { phoneE164: phone, consumedAt: null },
    orderBy: { createdAt: 'desc' },
  });
  if (!row) return fail(400, 'کد منقضی شده است');
  const blocked = otpBlockReason(row, new Date());
  if (blocked) return fail(400, blocked);
  await db.otpCode.update({ where: { id: row.id }, data: { attempts: { increment: 1 } } });
  if (!otpHashesMatch(row.codeHash, phone, code, secret)) return fail(400, 'کد درست نیست');
  const consumed = await db.otpCode.updateMany({
    where: { id: row.id, consumedAt: null },
    data: { consumedAt: new Date() },
  });
  if (consumed.count !== 1) return fail(400, 'این کد قبلاً استفاده شده است');

  const token = randomBytes(32).toString('base64url');
  const maxAge = ttlDays() * 24 * 60 * 60;
  try {
    await db.$transaction(async (tx) => {
      const user = await tx.user.upsert({
        where: { phoneE164: phone },
        create: { phoneE164: phone },
        update: {},
      });
      if (!user.isActive) throw new Error('suspended');
      const memberships = await tx.membership.count({ where: { userId: user.id } });
      let workspaceId: string | null = null;
      if (memberships === 0) {
        const plan = await tx.plan.findUnique({ where: { code: 'FREE_TRIAL' } });
        if (!plan) throw new Error('trial plan missing');
        const workspace = await tx.workspace.create({
          data: { name: 'فضای کاری من', slug: `ws-${randomBytes(4).toString('hex')}` },
        });
        await tx.membership.create({
          data: { workspaceId: workspace.id, userId: user.id, role: 'OWNER' },
        });
        const startsAt = new Date();
        const endsAt = new Date(startsAt.getTime() + plan.durationDays * 24 * 60 * 60 * 1000);
        await tx.subscription.create({
          data: {
            workspaceId: workspace.id,
            planId: plan.id,
            status: 'TRIAL',
            startsAt,
            endsAt,
          },
        });
        workspaceId = workspace.id;
      } else {
        const first = await tx.membership.findFirst({
          where: { userId: user.id },
          orderBy: { createdAt: 'asc' },
        });
        workspaceId = first?.workspaceId ?? null;
      }
      await tx.session.create({
        data: {
          userId: user.id,
          tokenHash: hashToken(token),
          expiresAt: new Date(Date.now() + maxAge * 1000),
          activeWorkspaceId: workspaceId,
          ipHash: meta.ip ? hashToken(meta.ip) : null,
          userAgent: meta.userAgent?.slice(0, 200) ?? null,
        },
      });
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'suspended') {
      return fail(403, 'حساب شما تعلیق شده است');
    }
    return fail(500, 'ورود موقتاً در دسترس نیست');
  }
  return { ok: true, data: { token, maxAge } };
}

export async function loadSession(token: string) {
  const db = prisma();
  if (!db || !token) return null;
  const session = await db.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: true, activeWorkspace: true },
  });
  if (!session || session.revokedAt || session.expiresAt.getTime() <= Date.now()) return null;
  if (!session.user.isActive) return null;
  let role: AppRole | null = null;
  if (session.activeWorkspaceId) {
    const membership = await db.membership.findUnique({
      where: {
        workspaceId_userId: { workspaceId: session.activeWorkspaceId, userId: session.userId },
      },
    });
    role = (membership?.role as AppRole | undefined) ?? null;
    if (!role) return { ...session, activeWorkspace: null, role: null };
  }
  return { ...session, role };
}

export async function revokeSession(token: string) {
  const db = prisma();
  if (!db || !token) return;
  await db.session.updateMany({
    where: { tokenHash: hashToken(token), revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

export async function currentProfile(token: string): Promise<
  AuthResult<{
    user: PublicUser;
    workspace: PublicWorkspace | null;
    workspaces: PublicWorkspace[];
  }>
> {
  const session = await loadSession(token);
  if (!session) return fail(401, 'وارد نشده‌اید');
  const db = prisma();
  if (!db) return fail(500, 'ورود موقتاً در دسترس نیست');
  const memberships = await db.membership.findMany({
    where: { userId: session.userId },
    include: { workspace: true },
    orderBy: { createdAt: 'asc' },
  });
  const workspaces = memberships.map((item) => ({
    id: item.workspace.id,
    name: item.workspace.name,
    role: item.role as AppRole,
  }));
  const active = workspaces.find((item) => item.id === session.activeWorkspaceId) ?? null;
  return {
    ok: true,
    data: {
      user: {
        id: session.user.id,
        phoneE164: session.user.phoneE164,
        displayName: session.user.displayName,
      },
      workspace: active,
      workspaces,
    },
  };
}

export async function requireRole(token: string, minimum: AppRole) {
  const profile = await currentProfile(token);
  if (!profile.ok) return profile;
  if (!profile.data.workspace || !roleAtLeast(profile.data.workspace.role, minimum)) {
    return fail(403, 'اجازه این کار را ندارید');
  }
  return profile;
}

export async function createWorkspace(
  token: string,
  name: string,
): Promise<AuthResult<{ id: string }>> {
  const profile = await currentProfile(token);
  if (!profile.ok) return profile;
  const trimmed = name.trim();
  if (trimmed.length < 2 || trimmed.length > 80) return fail(400, 'نام فضای کاری معتبر نیست');
  const db = prisma();
  if (!db) return fail(500, 'ورود موقتاً در دسترس نیست');
  const workspace = await db.workspace.create({
    data: { name: trimmed, slug: `ws-${randomBytes(4).toString('hex')}` },
  });
  await db.membership.create({
    data: { workspaceId: workspace.id, userId: profile.data.user.id, role: 'OWNER' },
  });
  await db.session.updateMany({
    where: { tokenHash: hashToken(token), revokedAt: null },
    data: { activeWorkspaceId: workspace.id },
  });
  return { ok: true, data: { id: workspace.id } };
}

export async function switchWorkspace(
  token: string,
  workspaceId: string,
): Promise<AuthResult<{ id: string }>> {
  const profile = await currentProfile(token);
  if (!profile.ok) return profile;
  if (!profile.data.workspaces.some((item) => item.id === workspaceId)) {
    return fail(403, 'عضو این فضای کاری نیستید');
  }
  const db = prisma();
  if (!db) return fail(500, 'ورود موقتاً در دسترس نیست');
  await db.session.updateMany({
    where: { tokenHash: hashToken(token), revokedAt: null },
    data: { activeWorkspaceId: workspaceId },
  });
  return { ok: true, data: { id: workspaceId } };
}

export async function renameWorkspace(token: string, name: string) {
  const profile = await requireRole(token, 'ADMIN');
  if (!profile.ok) return profile;
  const trimmed = name.trim();
  if (trimmed.length < 2 || trimmed.length > 80) return fail(400, 'نام فضای کاری معتبر نیست');
  const db = prisma();
  if (!db || !profile.data.workspace) return fail(500, 'ورود موقتاً در دسترس نیست');
  await db.workspace.update({ where: { id: profile.data.workspace.id }, data: { name: trimmed } });
  return { ok: true as const, data: { name: trimmed } };
}

export async function renameUser(token: string, displayName: string) {
  const profile = await currentProfile(token);
  if (!profile.ok) return profile;
  const trimmed = displayName.trim();
  if (trimmed.length < 2 || trimmed.length > 80) return fail(400, 'نام نمایشی معتبر نیست');
  const db = prisma();
  if (!db) return fail(500, 'ورود موقتاً در دسترس نیست');
  await db.user.update({ where: { id: profile.data.user.id }, data: { displayName: trimmed } });
  return { ok: true as const, data: { displayName: trimmed } };
}
