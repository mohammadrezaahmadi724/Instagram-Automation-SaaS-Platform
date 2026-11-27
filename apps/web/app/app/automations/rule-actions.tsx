'use client';

import { Button, ConfirmDialog, Switch } from '@directora/ui';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export function RuleActions({
  id,
  active,
  canDelete,
}: {
  id: string;
  active: boolean;
  canDelete: boolean;
}) {
  const router = useRouter();
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Switch
        checked={active}
        aria-label={active ? 'متوقف کردن دستور' : 'فعال کردن دستور'}
        onCheckedChange={() => {
          void fetch(`/api/automations/${id}/toggle`, { method: 'POST' }).then(() =>
            router.refresh(),
          );
        }}
      />
      <Link href={`/app/automations/${id}`} className="inline-flex min-h-11 items-center text-link">
        ویرایش
      </Link>
      {canDelete ? (
        <ConfirmDialog
          title="حذف دستور"
          consequence="این دستور پاک می‌شود. گزارش‌های قبلی می‌مانند."
          confirmLabel="حذف"
          onConfirm={() => {
            void fetch(`/api/automations/${id}`, { method: 'DELETE' }).then(() => router.refresh());
          }}
          trigger={
            <Button type="button" variant="outline">
              حذف
            </Button>
          }
        />
      ) : null}
    </div>
  );
}
