import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ThemeToggle } from '@directora/ui';
import { readEnv } from '../../src/env';
import { DesignCatalog } from './catalog';

export const metadata: Metadata = {
  title: 'کاتالوگ طراحی',
  robots: { index: false, follow: false },
};

export default function DesignPage() {
  const env = readEnv();
  if (env.NODE_ENV === 'production' && env.DESIGN_CATALOG !== '1') notFound();
  return (
    <div className="min-h-screen bg-background text-foreground">
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-10 focus:m-3 focus:bg-surface focus:px-3 focus:py-2"
      >
        پرش به محتوا
      </a>
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-5">
        <h1 className="text-2xl font-bold">کاتالوگ طراحی</h1>
        <ThemeToggle />
      </header>
      <main id="content">
        <DesignCatalog />
      </main>
    </div>
  );
}
