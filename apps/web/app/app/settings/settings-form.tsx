'use client';

import { Button, Input, NoPermissionState, toast } from '@directora/ui';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function SettingsForm({
  workspaceName,
  displayName,
  canEditWorkspace,
}: {
  workspaceName: string;
  displayName: string;
  canEditWorkspace: boolean;
}) {
  const router = useRouter();
  const [workspace, setWorkspace] = useState(workspaceName);
  const [name, setName] = useState(displayName);
  const [error, setError] = useState('');

  async function saveWorkspace() {
    setError('');
    const response = await fetch('/api/workspaces/current', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: workspace }),
    });
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    if (!response.ok) {
      setError(body.error ?? 'ذخیره ممکن نشد');
      return;
    }
    toast.success('نام فضای کاری ذخیره شد');
    router.refresh();
  }

  async function saveName() {
    setError('');
    const response = await fetch('/api/account', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ displayName: name }),
    });
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    if (!response.ok) {
      setError(body.error ?? 'ذخیره ممکن نشد');
      return;
    }
    toast.success('نام نمایشی ذخیره شد');
    router.refresh();
  }

  return (
    <div className="flex max-w-xl flex-col gap-6">
      {canEditWorkspace ? (
        <label className="flex flex-col gap-2 text-sm">
          نام فضای کاری
          <Input value={workspace} onChange={(event) => setWorkspace(event.target.value)} />
          <Button type="button" onClick={() => void saveWorkspace()}>
            ذخیره فضای کاری
          </Button>
        </label>
      ) : (
        <NoPermissionState description="تغییر نام فضای کاری فقط برای مدیر و مالک است." />
      )}
      <label className="flex flex-col gap-2 text-sm">
        نام نمایشی
        <Input value={name} onChange={(event) => setName(event.target.value)} />
        <Button type="button" variant="outline" onClick={() => void saveName()}>
          ذخیره نام
        </Button>
      </label>
      {error ? (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
