import { existsSync } from 'node:fs';
import path from 'node:path';
import Image from 'next/image';
import { formatJalali, formatRelativeTime, formatToman, jalaliYear } from '@directora/core';
import { Badge, ThemeToggle } from '@directora/ui';
import { DesignLab } from './design-lab';

function BrandMark() {
  const logo = path.join(process.cwd(), 'public', 'brand', 'directora-logo.png');
  if (existsSync(logo)) {
    return (
      <span className="inline-flex rounded-lg bg-[var(--ink-0)] p-3">
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

const typeScale = [
  ['display', 'text-5xl font-extrabold', 'دایرکتورا'],
  ['text-4xl', 'text-4xl font-extrabold', 'پاسخ سریع به دایرکت، فروش بیشتر'],
  ['text-3xl', 'text-3xl font-bold', 'پاسخ سریع به دایرکت، فروش بیشتر'],
  ['text-2xl', 'text-2xl font-bold', 'پاسخ سریع به دایرکت، فروش بیشتر'],
  ['text-xl', 'text-xl font-semibold', 'پاسخ سریع به دایرکت، فروش بیشتر'],
  ['text-lg', 'text-lg font-medium', 'پاسخ سریع به دایرکت، فروش بیشتر'],
  ['text-base', 'text-base', 'پاسخ سریع به دایرکت، فروش بیشتر'],
  ['text-sm', 'text-sm', 'پاسخ سریع به دایرکت، فروش بیشتر'],
  ['text-xs', 'text-xs', 'پاسخ سریع به دایرکت، فروش بیشتر'],
] as const;

export default function HomePage() {
  const now = new Date();
  const earlier = new Date(now.getTime() - 3 * 60 * 1000);
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
            className="pointer-events-none absolute inset-0 opacity-[0.12]"
            style={{
              backgroundImage: 'radial-gradient(circle at top, var(--primary), transparent 55%)',
            }}
          />
          <div className="relative flex flex-col gap-4 px-6 py-12 md:px-10">
            <Badge>نسخه‌ی پیش از انتشار · فاز ۱ب</Badge>
            <h1 className="text-5xl font-extrabold tracking-normal text-foreground md:text-6xl">
              دایرکتورا
            </h1>
            <p className="max-w-2xl text-lg text-subtle">
              اتوماسیون رسمی و امن اینستاگرام برای کسب‌وکارهای ایرانی — در حال ساخت
            </p>
          </div>
        </section>
        <DesignLab />
        <section className="flex flex-col gap-4">
          <h2 className="text-2xl font-bold">تایپوگرافی</h2>
          {typeScale.map(([token, className, sentence]) => (
            <p key={token} className={className}>
              <span className="ms-3 font-mono text-xs text-muted">{token}</span>
              {sentence}
            </p>
          ))}
        </section>
        <section className="flex flex-col gap-3">
          <h2 className="text-2xl font-bold">فارسی و راست‌به‌چپ</h2>
          <p>{formatToman(12500000)}</p>
          <p>امروز {formatJalali(now)}</p>
          <p>{formatRelativeTime(earlier, now)}</p>
          <p>
            پیام <bdi>Directora</bdi> در کنار متن فارسی
          </p>
          <p dir="ltr" className="text-start">
            +98 21 000 0000
          </p>
        </section>
      </main>
      <footer className="mx-auto flex w-full max-w-7xl flex-col gap-1 px-4 py-8 text-sm text-muted">
        <p>© {jalaliYear(now)} دایرکتورا</p>
        <p>فونت Vazirmatn تحت مجوز OFL</p>
      </footer>
    </div>
  );
}
