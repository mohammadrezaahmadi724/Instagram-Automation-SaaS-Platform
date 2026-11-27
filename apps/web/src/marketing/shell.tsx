import { existsSync } from 'node:fs';
import path from 'node:path';
import Image from 'next/image';
import Link from 'next/link';
import { jalaliYear } from '@directora/core';
import { ThemeToggle } from '@directora/ui';
import type { ReactNode } from 'react';

export function BrandMark() {
  const logo = path.join(process.cwd(), 'public', 'brand', 'directora-logo.png');
  if (existsSync(logo)) {
    return (
      <span className="inline-flex rounded-lg bg-brand-plate p-3">
        <Image
          src="/brand/directora-logo.png"
          alt="لوگوی دایرکتورا"
          width={160}
          height={48}
          priority
        />
      </span>
    );
  }
  return <span className="text-xl font-extrabold">دایرکتورا</span>;
}

export function MarketingShell({ loggedIn, children }: { loggedIn: boolean; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-surface focus:p-3"
      >
        پرش به محتوا
      </a>
      <header className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4">
        <Link href="/" aria-label="دایرکتورا">
          <BrandMark />
        </Link>
        <nav className="flex flex-wrap items-center gap-3 text-sm">
          <Link href="/#features" className="inline-flex min-h-11 items-center">
            امکانات
          </Link>
          <Link href="/#pricing" className="inline-flex min-h-11 items-center">
            تعرفه‌ها
          </Link>
          <Link href="/#faq" className="inline-flex min-h-11 items-center">
            سوالات متداول
          </Link>
          <Link
            href={loggedIn ? '/app/help' : '/login'}
            className="inline-flex min-h-11 items-center"
          >
            راهنما
          </Link>
          <ThemeToggle />
          <Link
            href={loggedIn ? '/app' : '/login'}
            className="inline-flex min-h-11 items-center rounded-md bg-primary px-4 text-primary-foreground"
          >
            {loggedIn ? 'ورود به پنل' : 'ورود / شروع رایگان'}
          </Link>
        </nav>
      </header>
      <main id="content">{children}</main>
      <footer className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-subtle">
        <BrandMark />
        <nav className="flex flex-wrap gap-4">
          <Link href="/privacy">حریم خصوصی</Link>
          <Link href="/terms">شرایط استفاده</Link>
          <Link href="/data-deletion">حذف داده</Link>
          <Link href="/contact">تماس</Link>
          <Link href="/design">کاتالوگ طراحی</Link>
        </nav>
        <p>© {jalaliYear(new Date())} دایرکتورا</p>
      </footer>
    </div>
  );
}
