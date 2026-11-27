'use client';

import { Menu, PanelRightClose, PanelRightOpen } from 'lucide-react';
import { Fragment, useEffect, useState, type KeyboardEvent, type ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { Button } from '../button';
import { Sheet, SheetContent, SheetBody } from '../sheet';
import { ThemeToggle } from '../theme-toggle';
import { Tooltip, TooltipProvider } from '../tooltip';
import { Breadcrumb, type BreadcrumbItem } from './breadcrumb';

export type ShellNavItem = {
  href: string;
  label: string;
  group: string;
  icon: ReactNode;
};

const storageKey = 'directora.sidebar.collapsed';

export function AppShell({
  title,
  nav,
  currentPath,
  breadcrumb,
  workspaceControl,
  userControl,
  children,
}: {
  title: string;
  nav: ShellNavItem[];
  currentPath: string;
  breadcrumb?: BreadcrumbItem[];
  workspaceControl?: ReactNode;
  userControl?: ReactNode;
  children: ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => {
    setCollapsed(window.localStorage.getItem(storageKey) === '1');
  }, []);

  function toggleCollapsed() {
    setCollapsed((value) => {
      const next = !value;
      window.localStorage.setItem(storageKey, next ? '1' : '0');
      return next;
    });
  }

  const groups = [...new Set(nav.map((item) => item.group))];

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background text-foreground">
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:m-3 focus:bg-surface focus:px-3 focus:py-2"
        >
          پرش به محتوا
        </a>
        <div className="flex min-h-screen">
          <aside
            data-testid="app-sidebar"
            data-collapsed={collapsed ? 'true' : 'false'}
            className={cn(
              'hidden shrink-0 flex-col border-e border-border bg-surface md:flex',
              collapsed ? 'w-shell' : 'w-64',
            )}
          >
            <SidebarNav
              groups={groups}
              nav={nav}
              currentPath={currentPath}
              collapsed={collapsed}
              onNavigate={() => undefined}
            />
            <div className="mt-auto p-2">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-pressed={collapsed}
                aria-label={collapsed ? 'باز کردن منو' : 'جمع کردن منو'}
                onClick={toggleCollapsed}
              >
                {collapsed ? (
                  <PanelRightOpen className="size-5 rtl:-scale-x-100" aria-hidden="true" />
                ) : (
                  <PanelRightClose className="size-5 rtl:-scale-x-100" aria-hidden="true" />
                )}
              </Button>
            </div>
          </aside>
          <div className="flex min-w-0 flex-1 flex-col">
            <header
              data-testid="app-topbar"
              className="flex min-h-16 flex-wrap items-center gap-3 border-b border-border bg-surface px-4 md:h-16 md:flex-nowrap"
            >
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label="باز کردن منو"
                aria-expanded={mobileOpen}
                onClick={() => setMobileOpen(true)}
              >
                <Menu className="size-5" aria-hidden="true" />
              </Button>
              <p className="min-w-0 flex-1 truncate text-base font-semibold">{title}</p>
              {workspaceControl}
              <ThemeToggle />
              {userControl}
            </header>
            {breadcrumb ? (
              <div className="px-4 pt-4">
                <Breadcrumb items={breadcrumb} />
              </div>
            ) : null}
            <main
              id="content"
              tabIndex={-1}
              className="flex-1 px-4 py-6 focus-visible:outline-none"
            >
              {children}
            </main>
          </div>
        </div>
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent title="منو">
            <SheetBody>
              <SidebarNav
                groups={groups}
                nav={nav}
                currentPath={currentPath}
                collapsed={false}
                onNavigate={() => setMobileOpen(false)}
              />
            </SheetBody>
          </SheetContent>
        </Sheet>
      </div>
    </TooltipProvider>
  );
}

function SidebarNav({
  groups,
  nav,
  currentPath,
  collapsed,
  onNavigate,
}: {
  groups: string[];
  nav: ShellNavItem[];
  currentPath: string;
  collapsed: boolean;
  onNavigate: () => void;
}) {
  function onKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    const items = [...event.currentTarget.querySelectorAll<HTMLAnchorElement>('a[href]')];
    const index = items.indexOf(document.activeElement as HTMLAnchorElement);
    if (index < 0) return;
    event.preventDefault();
    const next = event.key === 'ArrowDown' ? index + 1 : index - 1;
    items[(next + items.length) % items.length]?.focus();
  }

  return (
    <nav aria-label="اصلی" className="flex flex-col gap-4 p-2" onKeyDown={onKeyDown}>
      {groups.map((group) => (
        <div key={group} className="flex flex-col gap-1">
          {collapsed ? null : <p className="px-3 text-xs font-medium text-muted">{group}</p>}
          {nav
            .filter((item) => item.group === group)
            .map((item) => {
              const active = currentPath === item.href;
              const link = (
                <a
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  title={collapsed ? item.label : undefined}
                  onClick={onNavigate}
                  className={cn(
                    'relative flex min-h-11 items-center gap-3 rounded-md px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    active
                      ? 'bg-primary-subtle text-primary-subtle-foreground before:absolute before:inset-y-2 before:start-0 before:w-1 before:rounded-full before:bg-primary'
                      : 'text-foreground hover:bg-surface-sunken',
                    collapsed && 'justify-center px-0',
                  )}
                >
                  <span aria-hidden="true">{item.icon}</span>
                  {collapsed ? <span className="sr-only">{item.label}</span> : item.label}
                </a>
              );
              return collapsed ? (
                <Tooltip key={item.href} content={item.label}>
                  {link}
                </Tooltip>
              ) : (
                <Fragment key={item.href}>{link}</Fragment>
              );
            })}
        </div>
      ))}
    </nav>
  );
}

export function ShellSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true" aria-label="در حال بارگذاری پوسته">
      <div className="h-8 w-48 animate-pulse rounded-md bg-surface-sunken motion-reduce:animate-none" />
      <div className="h-4 w-72 animate-pulse rounded-md bg-surface-sunken motion-reduce:animate-none" />
      <div className="h-40 w-full animate-pulse rounded-lg bg-surface-sunken motion-reduce:animate-none" />
    </div>
  );
}
