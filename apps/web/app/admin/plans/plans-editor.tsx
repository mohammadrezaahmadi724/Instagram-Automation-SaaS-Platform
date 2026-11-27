'use client';

import { formatRialAsToman } from '@directora/core';
import { Button, Input, Switch, toast } from '@directora/ui';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type Plan = {
  id: string;
  code: string;
  nameFa: string;
  priceRial: string;
  durationDays: number;
  minFollowers: number;
  maxFollowers: number | null;
  maxInstagramAccounts: number;
  maxMonthlyExecutions: number;
  isActive: boolean;
  featuresJson: unknown;
};

const flags = [
  ['aiReply', 'پاسخ هوش مصنوعی'],
  ['smsAddon', 'پیامک'],
  ['formBuilder', 'فرم‌ساز'],
  ['showcase', 'ویترین'],
] as const;

function enabled(value: unknown, key: string) {
  return Boolean(value && typeof value === 'object' && (value as Record<string, unknown>)[key] === true);
}

export function PlansEditor({ plans }: { plans: Plan[] }) {
  const router = useRouter();
  const [rows, setRows] = useState(plans);

  async function save(plan: Plan) {
    const featuresJson = Object.fromEntries(flags.map(([key]) => [key, enabled(plan.featuresJson, key)]));
    const response = await fetch(`/api/admin/plans/${plan.id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ...plan, featuresJson }),
    });
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    if (!response.ok) {
      toast.error(body.error ?? 'ذخیره پلن ممکن نشد');
      return;
    }
    toast.success('پلن ذخیره شد');
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      {rows.map((plan) => (
        <form
          key={plan.id}
          className="grid gap-3 rounded-lg border border-border bg-surface p-4 md:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            void save(plan);
          }}
        >
          <p className="font-semibold md:col-span-2">
            {plan.nameFa} · <bdi dir="ltr">{plan.code}</bdi>
          </p>
          <label className="flex flex-col gap-1 text-sm">
            نام
            <Input
              value={plan.nameFa}
              onChange={(event) =>
                setRows((current) =>
                  current.map((item) => (item.id === plan.id ? { ...item, nameFa: event.target.value } : item)),
                )
              }
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            مبلغ ریال
            <Input
              value={plan.priceRial}
              onChange={(event) =>
                setRows((current) =>
                  current.map((item) =>
                    item.id === plan.id ? { ...item, priceRial: event.target.value } : item,
                  ),
                )
              }
            />
          </label>
          <p className="tabular-nums text-sm text-subtle">{safeToman(plan.priceRial)}</p>
          <label className="flex flex-col gap-1 text-sm">
            کف فالوور
            <Input
              value={String(plan.minFollowers)}
              onChange={(event) =>
                setRows((current) =>
                  current.map((item) =>
                    item.id === plan.id ? { ...item, minFollowers: Number(event.target.value) } : item,
                  ),
                )
              }
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            سقف فالوور
            <Input
              value={plan.maxFollowers === null ? '' : String(plan.maxFollowers)}
              onChange={(event) =>
                setRows((current) =>
                  current.map((item) =>
                    item.id === plan.id
                      ? { ...item, maxFollowers: event.target.value === '' ? null : Number(event.target.value) }
                      : item,
                  ),
                )
              }
            />
          </label>
          {flags.map(([key, label]) => (
            <label key={key} className="flex min-h-11 items-center justify-between gap-3 text-sm">
              {label}
              <Switch
                checked={enabled(plan.featuresJson, key)}
                onCheckedChange={(checked) =>
                  setRows((current) =>
                    current.map((item) =>
                      item.id === plan.id
                        ? {
                            ...item,
                            featuresJson: {
                              ...(item.featuresJson && typeof item.featuresJson === 'object' ? item.featuresJson : {}),
                              [key]: checked,
                            },
                          }
                        : item,
                    ),
                  )
                }
                aria-label={label}
              />
            </label>
          ))}
          <label className="flex min-h-11 items-center justify-between gap-3 text-sm">
            فعال
            <Switch
              checked={plan.isActive}
              onCheckedChange={(checked) =>
                setRows((current) =>
                  current.map((item) => (item.id === plan.id ? { ...item, isActive: checked } : item)),
                )
              }
              aria-label="فعال بودن پلن"
            />
          </label>
          <Button type="submit">ذخیره</Button>
        </form>
      ))}
    </div>
  );
}

function safeToman(value: string) {
  try {
    return formatRialAsToman(BigInt(value));
  } catch {
    return 'مبلغ نامعتبر';
  }
}
