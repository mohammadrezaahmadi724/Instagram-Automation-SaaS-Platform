import { formatRialAsToman, toPersianDigits } from '@directora/core';
import { billingData, requireProfile } from '../../../src/panel/queries';

function followerLabel(minFollowers: number, maxFollowers: number | null) {
  if (maxFollowers === null && minFollowers === 0) return 'بدون سقف دنبال‌کننده';
  if (maxFollowers !== null) return `تا ${toPersianDigits(String(maxFollowers))} دنبال‌کننده`;
  return `از ${toPersianDigits(String(minFollowers))} دنبال‌کننده`;
}

export default async function BillingPage() {
  const profile = await requireProfile();
  const { subscription, plans } = await billingData(profile.workspace.id);
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <h1 className="text-3xl font-bold">اشتراک</h1>
      {subscription ? (
        <p className="text-subtle">
          وضعیت فعلی: {subscription.plan.nameFa} · {subscription.status}
        </p>
      ) : (
        <p className="text-subtle">
          این فضای کاری اشتراک فعالی ندارد. پرداخت در مرحلهٔ بعد فعال می‌شود.
        </p>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        {plans.map((plan) => (
          <article
            key={plan.id}
            className="flex flex-col gap-2 rounded-lg border border-border bg-surface p-4"
          >
            <h2 className="text-lg font-semibold">{plan.nameFa}</h2>
            <p className="tabular-nums">{formatRialAsToman(plan.priceRial)}</p>
            <p className="text-sm text-subtle">
              {followerLabel(plan.minFollowers, plan.maxFollowers)}
            </p>
            <p className="text-sm text-subtle">
              {toPersianDigits(String(plan.maxInstagramAccounts))} حساب اینستاگرام
            </p>
            <button
              type="button"
              disabled
              className="min-h-11 rounded-md border border-border px-3 text-sm text-muted"
            >
              پرداخت در مرحلهٔ بعد فعال می‌شود
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}
