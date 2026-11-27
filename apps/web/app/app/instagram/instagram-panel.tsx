'use client';

import { toPersianDigits } from '@directora/core';
import { Badge, Button, ConfirmDialog, EmptyState, Input } from '@directora/ui';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type AccountCard = {
  id: string;
  username: string;
  name: string | null;
  followersCount: number | null;
  status: string;
  tokenExpiresAt: string | null;
};

const statusLabel: Record<string, string> = {
  ACTIVE: 'فعال',
  EXPIRED: 'منقضی',
  REVOKED: 'قطع‌شده',
  ERROR: 'خطا',
};

export function InstagramPanel({
  accounts,
  metaConfigured,
  mockMode,
  canManage,
  notice,
}: {
  accounts: AccountCard[];
  metaConfigured: boolean;
  mockMode: boolean;
  canManage: boolean;
  notice: string;
}) {
  const router = useRouter();
  const [text, setText] = useState('قیمت');
  const [message, setMessage] = useState(notice);
  const [pending, setPending] = useState(false);

  async function connectMock() {
    setPending(true);
    const response = await fetch('/api/dev/instagram/connect-mock', { method: 'POST' });
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    setPending(false);
    setMessage(response.ok ? 'پیج آزمایشی وصل شد.' : (body.error ?? 'اتصال آزمایشی ممکن نشد'));
    if (response.ok) router.refresh();
  }

  async function simulate(kind: 'comment' | 'dm') {
    setPending(true);
    const response = await fetch('/api/dev/instagram/simulate-webhook', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ kind, text }),
    });
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    setPending(false);
    setMessage(
      response.ok ? 'رویداد به صف واقعی وب‌هوک رفت.' : (body.error ?? 'شبیه‌ساز پذیرفته نشد'),
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {message ? <p className="text-sm text-subtle">{message}</p> : null}
      {!metaConfigured ? (
        <p className="rounded-lg border border-border bg-surface p-4 text-sm text-subtle">
          برای اتصال رسمی، متغیرهای META_APP_ID، META_APP_SECRET، META_WEBHOOK_VERIFY_TOKEN و
          META_OAUTH_REDIRECT_URI باید در محیط تنظیم شوند. تا آن زمان ورود به Meta ساخته نمی‌شود.
        </p>
      ) : null}
      {canManage && metaConfigured ? (
        <a
          href="/api/instagram/oauth/start"
          className="inline-flex min-h-11 w-fit items-center rounded-md bg-accent px-4 text-accent-foreground"
        >
          اتصال حساب اینستاگرام (Meta رسمی)
        </a>
      ) : null}
      {accounts.length === 0 ? (
        <EmptyState
          kind="first-use"
          title="هنوز حسابی وصل نشده"
          description="اتصال فقط از مسیر رسمی Meta انجام می‌شود."
        />
      ) : (
        <ul className="grid gap-4">
          {accounts.map((account) => (
            <li
              key={account.id}
              className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4 md:flex-row md:items-center md:justify-between"
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex size-11 items-center justify-center rounded-full bg-primary-subtle text-primary-subtle-foreground">
                  {(account.name || account.username).slice(0, 1)}
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
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant={account.status === 'ACTIVE' ? 'success' : 'warning'}>
                  {statusLabel[account.status] ?? account.status}
                </Badge>
                <span className="text-sm text-muted">
                  انقضای توکن:{' '}
                  {account.tokenExpiresAt
                    ? new Date(account.tokenExpiresAt).toLocaleDateString('fa-IR')
                    : 'نامشخص'}
                </span>
                {canManage ? (
                  <ConfirmDialog
                    title="قطع اتصال حساب"
                    consequence="توکن پاک می‌شود و دستورهای فعال این حساب متوقف می‌شوند."
                    confirmLabel="قطع اتصال"
                    onConfirm={() => {
                      void fetch(`/api/instagram/accounts/${account.id}/disconnect`, {
                        method: 'POST',
                      }).then(() => router.refresh());
                    }}
                    trigger={
                      <Button type="button" variant="outline">
                        قطع اتصال
                      </Button>
                    }
                  />
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
      {mockMode && canManage ? (
        <section className="flex flex-col gap-3 rounded-lg border border-dashed border-border p-4">
          <h2 className="text-lg font-semibold">ابزار توسعه</h2>
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            onClick={() => void connectMock()}
          >
            اتصال پیج آزمایشی (فقط محیط توسعه)
          </Button>
          <div className="flex flex-col gap-3">
            <h3 className="text-base font-semibold">شبیه‌ساز تست وب‌هوک</h3>
            <Input
              aria-label="متن رویداد آزمایشی"
              value={text}
              onChange={(event) => setText(event.target.value)}
            />
            <div className="flex flex-wrap gap-3">
              <Button type="button" disabled={pending} onClick={() => void simulate('comment')}>
                تریگر کامنت‌به‌دایرکت
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={pending}
                onClick={() => void simulate('dm')}
              >
                تریگر دایرکت
              </Button>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
