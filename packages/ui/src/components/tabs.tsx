'use client';

import { Tabs as RadixTabs } from 'radix-ui';
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '../lib/cn';

export function Tabs({ className, ...props }: ComponentProps<typeof RadixTabs.Root>) {
  return <RadixTabs.Root dir="rtl" className={cn('flex flex-col gap-4', className)} {...props} />;
}

export function TabList({ className, ...props }: ComponentProps<typeof RadixTabs.List>) {
  return (
    <RadixTabs.List
      className={cn(
        'flex max-w-full gap-1 overflow-x-auto rounded-md bg-surface-sunken p-1',
        className,
      )}
      {...props}
    />
  );
}

export function TabTrigger({ className, ...props }: ComponentProps<typeof RadixTabs.Trigger>) {
  return (
    <RadixTabs.Trigger
      className={cn(
        'min-h-11 shrink-0 rounded-sm px-4 text-sm text-subtle transition-colors duration-fast ease-standard focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring data-[state=active]:bg-surface data-[state=active]:text-foreground data-[state=active]:shadow-sm',
        className,
      )}
      {...props}
    />
  );
}

export function TabContent({ className, ...props }: ComponentProps<typeof RadixTabs.Content>) {
  return <RadixTabs.Content className={cn('focus-visible:outline-none', className)} {...props} />;
}

export function TabPanel({ value, children }: { value: string; children: ReactNode }) {
  return <TabContent value={value}>{children}</TabContent>;
}
