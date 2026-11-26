'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { faDigits } from '../lib/digits';
import { cn } from '../lib/cn';

export function Pagination({
  page,
  pageCount,
  onPageChange,
  label = 'صفحه‌بندی',
}: {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  label?: string;
}) {
  const pages = Array.from({ length: pageCount }, (_, index) => index + 1);
  return (
    <nav aria-label={label} className="flex flex-wrap items-center gap-1">
      <button
        type="button"
        className="inline-flex size-11 items-center justify-center rounded-md text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
        aria-label="صفحه‌ی قبلی"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        <ChevronLeft className="size-4 rtl:-scale-x-100" aria-hidden="true" />
      </button>
      {pages.map((item) => (
        <button
          key={item}
          type="button"
          aria-current={item === page ? 'page' : undefined}
          className={cn(
            'inline-flex size-11 items-center justify-center rounded-md text-sm tabular-nums focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            item === page ? 'bg-primary text-primary-foreground' : 'text-foreground',
          )}
          onClick={() => onPageChange(item)}
        >
          {faDigits(item)}
        </button>
      ))}
      <button
        type="button"
        className="inline-flex size-11 items-center justify-center rounded-md text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
        aria-label="صفحه‌ی بعدی"
        disabled={page >= pageCount}
        onClick={() => onPageChange(page + 1)}
      >
        <ChevronRight className="size-4 rtl:-scale-x-100" aria-hidden="true" />
      </button>
    </nav>
  );
}
