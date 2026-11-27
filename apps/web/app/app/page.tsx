import { formatJalali, toPersianDigits } from '@directora/core';
import Link from 'next/link';
import { Badge, EmptyState, StatCard } from '@directora/ui';
import { dashboardStats } from '../../src/instagram/gateway';
import { listAccounts } from '../../src/instagram/queries';
import { requireProfile } from '../../src/panel/queries';

const statusLabel: Record<string, string> = {
  SUCCESS: 'موفق',
  FAILED: 'ناموفق',
  SKIPPED_COOLDOWN: 'رد شده (کول‌داون)',
  SKIPPED_WINDOW: 'رد شده (خارج از پنجره)',
  SKIPPED_PLAN_LIMIT: 'رد شده (سقف پلن)',
  RATE_LIMITED: 'محدودیت نرخ',
};

export default async function DashboardPage() {
  const profile = await requireProfile();
  const [stats, accounts] = await Promise.all([
    dashboardStats(profile.workspace.id),
    listAccounts(profile.workspace.id),
  ]);
  const account = accounts[0];
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
      <h1 className="text-3xl font-bold">{profile.workspace.name}</h1>
      <div className="grid gap-4 md:grid-cols-2">
        {account ? (
          <article className="flex items-center gap-3 rounded-lg border border-border bg-surface p-4">
            <span className="inline-flex size-11 items-center justify-center rounded-full bg-primary-subtle font-bold text-primary-subtle-foreground">
              {account.username.slice(0, 1).toUpperCase()}
            </span>
            <div>
              <p className="font-semibold">
                <bdi dir="ltr">@{account.username}</bdi>
              </p>
              <p className="text-sm text-subtle tabular-nums">
                <bdi dir="ltr">{toPersianDigits(String(account.followersCount ?? 0))}</bdi>{' '}
                دنبال‌کننده
              </p>
            </div>
            <Badge variant="success">متصل</Badge>
          </article>
        ) : (
          <EmptyState
            kind="first-use"
            title="حسابی وصل نیست"
            description="اتصال رسمی Meta از صفحهٔ اینستاگرام شروع می‌شود."
            action={
              <Link className="inline-flex min-h-11 items-center text-link" href="/app/instagram">
                اتصال حساب
              </Link>
            }
          />
        )}
        <article className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">{stats.planName}</h2>
            <Link className="text-sm text-link" href="/app/billing">
              جزئیات اشتراک
            </Link>
          </div>
          <p className="tabular-nums">
            {toPersianDigits(String(stats.remainingDays))} روز باقی مانده
          </p>
          <div
            className="h-2 overflow-hidden rounded-full bg-surface-sunken"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={stats.progress}
            aria-label="پیشرفت دورهٔ اشتراک"
          >
            <div className="h-full bg-primary" style={{ width: `${stats.progress}%` }} />
          </div>
        </article>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="دستورهای فعال" value={toPersianDigits(String(stats.activeRules))} />
        <StatCard label="پاسخ موفق ۳۰ روز" value={toPersianDigits(String(stats.success30))} />
        <StatCard label="نرخ موفقیت" value={`${toPersianDigits(String(stats.successRate))}٪`} />
      </div>
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">آخرین اجراها</h2>
        {stats.recent.length === 0 ? (
          <EmptyState
            kind="first-use"
            title="هنوز اجرایی نیست"
            description="بعد از ساخت دستور و رسیدن رویداد، نتیجه اینجا می‌آید."
            action={
              <Link
                className="inline-flex min-h-11 items-center text-link"
                href="/app/automations/new"
              >
                ساخت دستور
              </Link>
            }
          />
        ) : (
          <ul className="flex flex-col gap-2">
            {stats.recent.map((log) => (
              <li
                key={log.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border px-3 py-2 text-sm"
              >
                <span>{log.rule?.name ?? 'بدون دستور'}</span>
                <span>{statusLabel[log.status] ?? log.status}</span>
                <span className="tabular-nums">{formatJalali(log.createdAt, 'numeric')}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
