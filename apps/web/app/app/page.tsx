import { toPersianDigits } from '@directora/core';
import { dashboardData, requireProfile } from '../../src/panel/queries';

export default async function DashboardPage() {
  const profile = await requireProfile();
  const data = await dashboardData(profile.workspace.id);
  const plan = data.subscription?.plan.nameFa ?? 'بدون اشتراک';
  const status =
    data.subscription?.status === 'TRIAL' ? 'آزمایشی' : (data.subscription?.status ?? 'ندارد');
  const stats = [
    ['حساب‌های متصل', data.accounts],
    ['دستورهای فعال', data.activeRules],
    ['اجراها', data.executions],
  ] as const;
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">{profile.workspace.name}</h1>
        <p className="text-subtle">
          پلن {plan} · {status}
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map(([label, value]) => (
          <article key={label} className="rounded-lg border border-border bg-surface p-4">
            <p className="text-sm text-subtle">{label}</p>
            <p className="text-3xl font-bold tabular-nums">{toPersianDigits(String(value))}</p>
          </article>
        ))}
      </div>
      <section className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-6">
        <h2 className="text-lg font-semibold">شروع کار</h2>
        <ul className="flex flex-col gap-2 text-sm text-subtle">
          <li>فضای کاری ساخته شد.</li>
          <li>اتصال رسمی Meta API در مرحلهٔ بعد فعال می‌شود.</li>
          <li>تا قبل از اتصال، دستور و گزارش ارسالی وجود ندارد.</li>
        </ul>
      </section>
    </div>
  );
}
