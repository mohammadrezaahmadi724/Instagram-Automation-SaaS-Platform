'use client';

import {
  AppShell,
  Button,
  Dialog,
  DialogContent,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Input,
  type ShellNavItem,
} from '@directora/ui';
import { usePathname, useRouter } from 'next/navigation';
import { useState, type ReactNode } from 'react';
import { formatIranMobile } from '../../src/auth/phone';
import type { PublicUser, PublicWorkspace } from '../../src/auth/service';

const nav: ShellNavItem[] = [
  { href: '/app', label: 'داشبورد', group: 'کار', icon: <span aria-hidden="true">د</span> },
  {
    href: '/app/instagram',
    label: 'اینستاگرام',
    group: 'کار',
    icon: <span aria-hidden="true">ا</span>,
  },
  {
    href: '/app/automations',
    label: 'دستورها',
    group: 'کار',
    icon: <span aria-hidden="true">ت</span>,
  },
  { href: '/app/logs', label: 'گزارش', group: 'کار', icon: <span aria-hidden="true">گ</span> },
  {
    href: '/app/billing',
    label: 'اشتراک',
    group: 'سامانه',
    icon: <span aria-hidden="true">ش</span>,
  },
  { href: '/app/help', label: 'راهنما', group: 'سامانه', icon: <span aria-hidden="true">ر</span> },
  {
    href: '/app/settings',
    label: 'تنظیمات',
    group: 'سامانه',
    icon: <span aria-hidden="true">ظ</span>,
  },
];

const titles: Record<string, string> = {
  '/app': 'داشبورد',
  '/app/instagram': 'اینستاگرام',
  '/app/automations': 'دستورها',
  '/app/logs': 'گزارش ارسال',
  '/app/billing': 'اشتراک',
  '/app/help': 'راهنما',
  '/app/settings': 'تنظیمات',
};

export function PanelShell({
  user,
  workspace,
  workspaces,
  isSuperAdmin = false,
  children,
}: {
  user: PublicUser;
  workspace: PublicWorkspace;
  workspaces: PublicWorkspace[];
  isSuperAdmin?: boolean;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);
  const title = titles[pathname] ?? 'داشبورد';
  const label = user.displayName || formatIranMobile(user.phoneE164);

  async function createWorkspace() {
    setError('');
    const response = await fetch('/api/workspaces', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    if (!response.ok) {
      setError(body.error ?? 'ساخت فضای کاری ممکن نشد');
      return;
    }
    setName('');
    setCreating(false);
    router.refresh();
  }

  return (
    <>
      <AppShell
        title={workspace.name}
        nav={
          isSuperAdmin
            ? [
                ...nav,
                {
                  href: '/admin',
                  label: 'پنل مدیریت',
                  group: 'سامانه',
                  icon: <span aria-hidden="true">م</span>,
                },
              ]
            : nav
        }
        currentPath={pathname}
        breadcrumb={[{ label: 'پنل', href: '/app' }, { label: title }]}
        workspaceControl={
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="outline">
                {workspace.name}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {workspaces.map((item) => (
                <DropdownMenuItem
                  key={item.id}
                  onSelect={() => {
                    void fetch('/api/workspaces/switch', {
                      method: 'POST',
                      headers: { 'content-type': 'application/json' },
                      body: JSON.stringify({ workspaceId: item.id }),
                    }).then(() => router.refresh());
                  }}
                >
                  {item.name}
                </DropdownMenuItem>
              ))}
              <DropdownMenuItem onSelect={() => setCreating(true)}>
                ساخت فضای کاری جدید
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        }
        userControl={
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="outline">
                <bdi dir="ltr">{label}</bdi>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                onSelect={() => {
                  void fetch('/api/auth/logout', { method: 'POST' }).then(() => {
                    router.push('/login');
                    router.refresh();
                  });
                }}
              >
                خروج
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        }
      >
        {children}
      </AppShell>
      <Dialog open={creating} onOpenChange={setCreating}>
        <DialogContent
          title="فضای کاری جدید"
          description="اشتراک آزمایشی فقط برای اولین فضا ساخته می‌شود."
        >
          <Input
            aria-label="نام فضای کاری جدید"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          {error ? <p className="text-sm text-danger">{error}</p> : null}
          <Button type="button" onClick={() => void createWorkspace()}>
            ساخت
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
