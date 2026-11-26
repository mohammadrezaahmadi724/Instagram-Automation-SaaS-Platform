import { existsSync } from 'node:fs';
import path from 'node:path';
import Image from 'next/image';
import { connection } from 'next/server';
import { jalaliYear } from '@directora/core';
import { Badge, ThemeToggle } from '@directora/ui';

function BrandMark() {
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
  return (
    <span className="inline-flex min-w-24 flex-col">
      <span className="text-2xl font-extrabold text-foreground">دایرکتورا</span>
      <span
        className="mt-2 h-1 w-full rounded-full"
        style={{ backgroundImage: 'var(--gradient-brand)' }}
      />
    </span>
  );
}

export default async function HomePage() {
  await connection();
  const now = new Date();
  return (
    <div className="min-h-screen bg-background text-foreground">
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-10 focus:m-3 focus:bg-surface focus:px-3 focus:py-2"
      >
        پرش به محتوا
      </a>
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-5">
        <BrandMark />
        <ThemeToggle />
      </header>
      <main
        id="content"
        className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 pb-16 md:gap-16"
      >
        <section className="relative overflow-hidden rounded-2xl border border-border bg-surface">
          <div className="h-1 w-full" style={{ backgroundImage: 'var(--gradient-brand)' }} />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-halo"
            style={{
              backgroundImage: 'radial-gradient(circle at top, var(--primary), transparent 55%)',
            }}
          />
          <div className="relative flex flex-col gap-4 px-6 py-12 md:px-10">
            <Badge className="self-start">نسخه‌ی پیش از انتشار · فاز ۱ج</Badge>
            <h1 className="text-5xl font-extrabold tracking-normal text-foreground md:text-6xl">
              دایرکتورا
            </h1>
            <p className="max-w-2xl text-lg text-subtle">
              اتوماسیون رسمی و امن اینستاگرام برای کسب‌وکارهای ایرانی — در حال ساخت
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="/design"
                className="inline-flex min-h-11 items-center rounded-md bg-primary px-4 text-primary-foreground"
              >
                کاتالوگ طراحی
              </a>
              <a
                href="/overview"
                className="inline-flex min-h-11 items-center rounded-md border border-input px-4"
              >
                نمای کلی
              </a>
            </div>
          </div>
        </section>
      </main>
      <footer className="mx-auto flex w-full max-w-7xl flex-col gap-1 px-4 py-8 text-sm text-muted">
        <p>© {jalaliYear(now)} دایرکتورا</p>
        <p>فونت‌های Vazirmatn و JetBrains Mono تحت مجوز OFL</p>
      </footer>
    </div>
  );
}
