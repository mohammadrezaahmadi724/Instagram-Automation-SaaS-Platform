'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { AppShell, type ShellNavItem } from '@directora/ui';

function StrokeIcon({ path }: { path: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-5"
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path d={path} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const nav: ShellNavItem[] = [
  {
    href: '/overview',
    label: 'نمای کلی',
    group: 'کار',
    icon: <StrokeIcon path="M4 10.5 12 4l8 6.5V20H4z" />,
  },
  {
    href: '/design',
    label: 'کاتالوگ طراحی',
    group: 'سامانه',
    icon: <StrokeIcon path="M4 6h16M4 12h16M4 18h10" />,
  },
  {
    href: '/',
    label: 'خانه',
    group: 'سامانه',
    icon: <StrokeIcon path="M12 21s-7-4.4-7-10a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 5.6-7 10-7 10z" />,
  },
];

const titles: Record<string, string> = {
  '/overview': 'نمای کلی',
  '/design': 'کاتالوگ طراحی',
  '/': 'خانه',
};

export function ShellFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <AppShell
      title={titles[pathname] ?? 'دایرکتورا'}
      nav={nav}
      currentPath={pathname}
      breadcrumb={[{ label: 'خانه', href: '/' }, { label: titles[pathname] ?? 'صفحه' }]}
    >
      {children}
    </AppShell>
  );
}
