'use client';

import { Button, EmptyState, Input, toast } from '@directora/ui';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type UserRow = {
  id: string;
  phoneE164: string;
  displayName: string | null;
  isActive: boolean;
  workspaces: {
    id: string;
    name: string;
    subscription: { status: string; planName: string } | null;
  }[];
};

type Plan = { id: string; nameFa: string };

export function UsersTable({ users, plans }: { users: UserRow[]; plans: Plan[] }) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const firstPlan = plans[0];

  async function toggle(user: UserRow) {
    const response = await fetch(`/api/admin/users/${user.id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ isActive: !user.isActive }),
    });
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    if (!response.ok) {
      toast.error(body.error ?? 'تغییر وضعیت ممکن نشد');
      return;
    }
    toast.success(user.isActive ? 'کاربر غیرفعال شد' : 'کاربر فعال شد');
    router.refresh();
  }

  async function grant(workspaceId: string, planId: string) {
    const response = await fetch(`/api/admin/workspaces/${workspaceId}/grant-subscription`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ planId }),
    });
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    if (!response.ok) {
      toast.error(body.error ?? 'اعطای اشتراک ممکن نشد');
      return;
    }
    toast.success('اشتراک اعطا شد');
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      <form className="flex gap-2" action="/admin/users">
        <Input
          name="q"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          aria-label="جستجوی کاربر"
        />
        <Button type="submit" variant="outline">
          جستجو
        </Button>
      </form>
      {users.length === 0 ? (
        <EmptyState kind="filter" title="کاربری نیست" description="عبارت جستجو را عوض کنید." />
      ) : (
        users.map((user) => (
          <article
            key={user.id}
            className="flex flex-col gap-2 rounded-lg border border-border bg-surface p-4"
          >
            <p>
              {user.displayName || 'بدون نام'} · <bdi dir="ltr">{user.phoneE164}</bdi>
            </p>
            <p className="text-sm text-subtle">{user.isActive ? 'فعال' : 'تعلیق‌شده'}</p>
            <Button type="button" variant="outline" onClick={() => void toggle(user)}>
              {user.isActive ? 'غیرفعال‌سازی' : 'فعال‌سازی'}
            </Button>
            {user.workspaces.map((workspace) => (
              <div key={workspace.id} className="flex flex-wrap items-center gap-2 text-sm">
                <span>{workspace.name}</span>
                <span className="text-subtle">
                  {workspace.subscription
                    ? `${workspace.subscription.planName} · ${workspace.subscription.status}`
                    : 'بدون اشتراک'}
                </span>
                {firstPlan ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => void grant(workspace.id, firstPlan.id)}
                  >
                    اعطای {firstPlan.nameFa}
                  </Button>
                ) : null}
              </div>
            ))}
          </article>
        ))
      )}
    </div>
  );
}
