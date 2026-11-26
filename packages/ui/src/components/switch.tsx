'use client';

import type { ComponentProps } from 'react';
import { Switch as RadixSwitch } from 'radix-ui';
import { cn } from '../lib/cn';

export function Switch({
  className,
  loading = false,
  disabled,
  ...props
}: ComponentProps<typeof RadixSwitch.Root> & { loading?: boolean }) {
  return (
    <RadixSwitch.Root
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        'inline-flex min-h-11 w-16 shrink-0 items-center rounded-full border border-input bg-surface-sunken p-1 transition-colors duration-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring data-[state=checked]:bg-primary',
        className,
      )}
      {...props}
    >
      <RadixSwitch.Thumb className="block size-5 rounded-full bg-surface shadow-sm transition-transform duration-fast ease-standard data-[state=checked]:translate-x-9 rtl:data-[state=checked]:-translate-x-9" />
    </RadixSwitch.Root>
  );
}
