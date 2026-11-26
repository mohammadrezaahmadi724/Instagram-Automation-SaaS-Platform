'use client';

import { useTheme } from 'next-themes';
import { Toaster as Sonner, toast } from 'sonner';

export function Toaster() {
  const { resolvedTheme } = useTheme();
  return (
    <Sonner
      theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
      dir="rtl"
      position="bottom-center"
      richColors={false}
      toastOptions={{
        classNames: {
          toast: 'bg-surface text-foreground border border-border',
          success: 'border-success',
          error: 'border-danger',
          warning: 'border-warning',
          info: 'border-info',
        },
      }}
    />
  );
}

export { toast };
