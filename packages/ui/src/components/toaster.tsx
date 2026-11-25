'use client';

import { useTheme } from 'next-themes';
import { Toaster as Sonner, toast } from 'sonner';

export function Toaster() {
  const { resolvedTheme } = useTheme();
  return (
    <Sonner
      theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
      dir="rtl"
      richColors={false}
      toastOptions={{
        className: 'bg-surface text-foreground border border-border',
      }}
    />
  );
}

export { toast };
