'use client';

import { formatRialAsToman, toPersianDigits } from '@directora/core';
import {
  Badge,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  EmptyState,
  FieldError,
  Input,
  Label,
  Textarea,
  toast,
} from '@directora/ui';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type Plan = {
  id: string;
  code: string;
  nameFa: string;
  priceRial: string;
  durationDays: number;
  maxInstagramAccounts: number;
  maxMonthlyExecutions: number;
  minFollowers: number;
  maxFollowers: number | null;
  featuresJson: unknown;
};

type Receipt = {
  id: string;
  planName: string;
  amountRial: string;
  referenceCode: string;
  payerCardLast4: string | null;
  note: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewNote: string | null;
  createdAt: string;
};

type Subscription = {
  status: string;
  startsAt: string;
  endsAt: string;
  plan: {
    nameFa: string;
    code: string;
    durationDays: number;
    minFollowers: number;
    maxFollowers: number | null;
  };
};

const statusLabel = {
  PENDING: 'در انتظار بررسی',
  APPROVED: 'تأیید شده',
  REJECTED: 'رد شده',
} as const;

function tier(plan: { code: string; minFollowers: number; maxFollowers: number | null }) {
  if (plan.code === 'FREE_TRIAL') return 'آزمایشی';
  if (plan.code === 'AGENCY') return 'آژانس';
  if (plan.maxFollowers !== null && plan.maxFollowers < 25000) return 'زیر ۲۵ هزار فالوور';
  if (plan.minFollowers >= 25000) return 'بالای ۲۵ هزار فالوور';
  return 'پلن فعال';
}

function flags(value: unknown) {
  const record = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  return [
    ['پاسخ هوش مصنوعی', record.aiReply === true],
    ['پیامک', record.smsAddon === true],
    ['فرم‌ساز', record.formBuilder === true],
    ['ویترین', record.showcase === true],
  ] as const;
}

export function BillingPanel({
  subscription,
  plans,
  receipts,
  cardToCard,
  canPay,
}: {
  subscription: Subscription | null;
  plans: Plan[];
  receipts: Receipt[];
  cardToCard: { cardNumber: string; iban: string; accountHolderName: string };
  canPay: boolean;
}) {
  const router = useRouter();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [referenceCode, setReferenceCode] = useState('');
  const [last4, setLast4] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const ends = subscription ? new Date(subscription.endsAt) : null;
  const daysLeft = ends ? Math.max(0, Math.ceil((ends.getTime() - Date.now()) / 86_400_000)) : 0;
  const span = subscription ? subscription.plan.durationDays : 1;
  const progress = Math.min(100, Math.max(0, ((span - daysLeft) / span) * 100));

  async function copy(value: string) {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    toast.success('رونوشت شد');
  }

  async function submit() {
    if (!plan) return;
    setSending(true);
    setError('');
    const response = await fetch('/api/billing/receipts', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        planId: plan.id,
        referenceCode,
        payerCardLast4: last4 || undefined,
        note: note || undefined,
      }),
    });
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    setSending(false);
    if (!response.ok) {
      setError(body.error ?? 'ثبت فیش ممکن نشد');
      toast.error(body.error ?? 'ثبت فیش ممکن نشد');
      return;
    }
    toast.success('فیش ثبت شد و در انتظار بررسی است');
    setPlan(null);
    setReferenceCode('');
    setLast4('');
    setNote('');
    router.refresh();
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <h1 className="text-3xl font-bold">اشتراک</h1>
      {subscription ? (
        <section className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-6">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-semibold">{subscription.plan.nameFa}</h2>
            <Badge variant="primary">{tier(subscription.plan)}</Badge>
            <Badge>{subscription.status === 'ACTIVE' ? 'فعال' : subscription.status}</Badge>
          </div>
          <p className="tabular-nums text-subtle">{toPersianDigits(String(daysLeft))} روز باقی‌مانده</p>
          <div className="h-2 overflow-hidden rounded-full bg-surface-sunken" aria-hidden="true">
            <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
          </div>
        </section>
      ) : (
        <EmptyState
          kind="first-use"
          title="اشتراک فعالی نیست"
          description="پس از واریز کارت‌به‌کارت و تأیید فیش، اشتراک این فضای کاری فعال می‌شود."
        />
      )}
      <div className="grid gap-4 md:grid-cols-2">
        {plans.map((item) => (
          <article key={item.id} className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold">{item.nameFa}</h2>
              <Badge>{tier(item)}</Badge>
            </div>
            <p className="tabular-nums text-xl font-bold">{formatRialAsToman(BigInt(item.priceRial))}</p>
            <p className="text-sm text-subtle">
              {toPersianDigits(String(item.maxInstagramAccounts))} حساب ·{' '}
              {toPersianDigits(String(item.maxMonthlyExecutions))} اجرا در ماه
            </p>
            <ul className="flex flex-col gap-1 text-sm text-subtle">
              {flags(item.featuresJson).map(([label, on]) => (
                <li key={label}>
                  {label}: {on ? 'روشن' : 'خاموش'}
                </li>
              ))}
            </ul>
            {canPay && BigInt(item.priceRial) > 0n ? (
              <Button type="button" onClick={() => setPlan(item)}>
                پرداخت کارت‌به‌کارت
              </Button>
            ) : (
              <Button type="button" disabled>
                {canPay ? 'این پلن رایگان است' : 'فقط مدیر می‌تواند فیش ثبت کند'}
              </Button>
            )}
          </article>
        ))}
      </div>
      <p className="text-sm text-subtle">
        درگاه پرداخت آنلاین (زرین‌پال/زیبال) پس از فعال‌سازی در دسترس خواهد بود.
      </p>
      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">فیش‌ها</h2>
        {receipts.length === 0 ? (
          <EmptyState kind="first-use" title="فیشی ثبت نشده" description="پس از واریز، شماره پیگیری را همین‌جا ثبت کنید." />
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-surface-sunken text-subtle">
                <tr>
                  <th className="px-3 py-3 text-start">پلن</th>
                  <th className="px-3 py-3 text-start">مبلغ</th>
                  <th className="px-3 py-3 text-start">پیگیری</th>
                  <th className="px-3 py-3 text-start">وضعیت</th>
                </tr>
              </thead>
              <tbody>
                {receipts.map((receipt) => (
                  <tr key={receipt.id} className="border-t border-border">
                    <td className="px-3 py-3">{receipt.planName}</td>
                    <td className="px-3 py-3 tabular-nums">{formatRialAsToman(BigInt(receipt.amountRial))}</td>
                    <td className="px-3 py-3">
                      <bdi dir="ltr">{receipt.referenceCode}</bdi>
                    </td>
                    <td className="px-3 py-3">
                      <Badge
                        variant={
                          receipt.status === 'APPROVED'
                            ? 'success'
                            : receipt.status === 'REJECTED'
                              ? 'danger'
                              : 'warning'
                        }
                      >
                        {statusLabel[receipt.status]}
                      </Badge>
                      {receipt.status === 'REJECTED' && receipt.reviewNote ? (
                        <p className="mt-1 text-subtle">{receipt.reviewNote}</p>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <Dialog open={plan !== null} onOpenChange={(open) => !open && setPlan(null)}>
        <DialogContent title="پرداخت کارت‌به‌کارت" description="مبلغ را واریز کنید و شماره پیگیری را ثبت کنید.">
          {plan ? (
            <div className="flex flex-col gap-3">
              <p className="tabular-nums font-bold">{formatRialAsToman(BigInt(plan.priceRial))}</p>
              <p>
                صاحب حساب: {cardToCard.accountHolderName || 'نام صاحب حساب هنوز در تنظیمات ثبت نشده است'}
              </p>
              <p>
                شماره کارت:{' '}
                {cardToCard.cardNumber ? (
                  <bdi dir="ltr">{cardToCard.cardNumber}</bdi>
                ) : (
                  'شماره کارت هنوز ثبت نشده است'
                )}
              </p>
              <p>
                شبا:{' '}
                {cardToCard.iban ? <bdi dir="ltr">{cardToCard.iban}</bdi> : 'شبا هنوز ثبت نشده است'}
              </p>
              <Button
                type="button"
                variant="outline"
                disabled={!cardToCard.cardNumber}
                onClick={() => void copy(cardToCard.cardNumber)}
              >
                رونوشت شماره کارت
              </Button>
              <Label htmlFor="reference">شماره پیگیری</Label>
              <Input
                id="reference"
                value={referenceCode}
                onChange={(event) => setReferenceCode(event.target.value)}
              />
              <Label htmlFor="last4">چهار رقم آخر کارت، اختیاری</Label>
              <Input id="last4" value={last4} inputMode="numeric" onChange={(event) => setLast4(event.target.value)} />
              <Label htmlFor="note">یادداشت، اختیاری</Label>
              <Textarea id="note" value={note} onChange={(event) => setNote(event.target.value)} />
              {error ? <FieldError id="receipt-error">{error}</FieldError> : null}
              <DialogActions>
                <Button type="button" loading={sending} onClick={() => void submit()}>
                  ثبت فیش
                </Button>
              </DialogActions>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
