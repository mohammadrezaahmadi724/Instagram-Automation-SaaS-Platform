'use client';

import type { ComponentProps } from 'react';
import { Switch as RadixSwitch } from 'radix-ui';
import { cn } from '../lib/cn';

export function Switch({ className, ...props }: ComponentProps<typeof RadixSwitch.Root>) {
  return (
    <RadixSwitch.Root
      className={cn(
        'inline-flex min-h-11 w-16 shrink-0 items-center rounded-full border border-input bg-surface-sunken p-1 transition-colors duration-[var(--motion-fast)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] data-[state=checked]:bg-primary',
        className,
      )}
      {...props}
    >
      <RadixSwitch.Thumb className="block size-5 rounded-full bg-surface shadow-sm transition-[margin] duration-[var(--motion-fast)] data-[state=checked]:ms-auto" />
    </RadixSwitch.Root>
  );
}
