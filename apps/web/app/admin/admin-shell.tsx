'use client';

import { AppShell, type ShellNavItem } from '@directora/ui';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

const nav: ShellNavItem[] = [
  { href: '/admin', label: 'داشبورد', group: 'مدیریت', icon: <span aria-hidden="true">د</span> },
  {
    href: '/admin/receipts',
    label: 'فیش‌ها',
    group: 'مدیریت',
    icon: <span aria-hidden="true">ف</span>,
  },
  {
    href: '/admin/plans',
    label: 'پلن‌ها',
    group: 'مدیریت',
    icon: <span aria-hidden="true">پ</span>,
  },
  {
    href: '/admin/users',
    label: 'کاربران',
    group: 'مدیریت',
    icon: <span aria-hidden="true">ک</span>,
  },
  {
    href: '/admin/help',
    label: 'راهنما',
    group: 'مدیریت',
    icon: <span aria-hidden="true">ر</span>,
  },
  {
    href: '/admin/settings',
    label: 'تنظیمات',
    group: 'مدیریت',
    icon: <span aria-hidden="true">ظ</span>,
  },
  {
    href: '/app',
    label: 'بازگشت به پنل',
    group: 'مدیریت',
    icon: <span aria-hidden="true">ب</span>,
  },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <AppShell
      title="مدیریت دایرکتورا"
      nav={nav}
      currentPath={pathname}
      breadcrumb={[{ label: 'مدیریت' }]}
    >
      {children}
    </AppShell>
  );
}
