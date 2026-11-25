'use client';

import { Moon, Sun, Monitor } from 'lucide-react';
import { ThemeProvider, useTheme } from 'next-themes';
import { useEffect, useState, type ComponentProps } from 'react';
import { cn } from '../lib/cn';

export function AppThemeProvider(props: ComponentProps<typeof ThemeProvider>) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    />
  );
}

const options = [
  { value: 'light', label: 'روشن', icon: Sun },
  { value: 'dark', label: 'تیره', icon: Moon },
  { value: 'system', label: 'سیستم', icon: Monitor },
] as const;

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);
  return (
    <div
      role="group"
      aria-label="تغییر تم"
      className="inline-flex rounded-md border border-border bg-surface p-1"
    >
      {options.map((option) => {
        const Icon = option.icon;
        const selected = mounted && theme === option.value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={selected}
            className={cn(
              'inline-flex min-h-11 min-w-11 items-center justify-center rounded-sm px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]',
              selected ? 'bg-primary text-primary-foreground' : 'text-foreground',
            )}
            onClick={() => setTheme(option.value)}
          >
            <Icon aria-hidden="true" className="size-4" />
            <span className="sr-only">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
