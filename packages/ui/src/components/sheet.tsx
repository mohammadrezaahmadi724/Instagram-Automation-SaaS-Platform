'use client';

import { Dialog as RadixDialog } from 'radix-ui';
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '../lib/cn';

export const Sheet = RadixDialog.Root;
export const SheetTrigger = RadixDialog.Trigger;
export const SheetClose = RadixDialog.Close;

export function SheetContent({
  className,
  children,
  title,
  ...props
}: ComponentProps<typeof RadixDialog.Content> & { title: string }) {
  return (
    <RadixDialog.Portal>
      <RadixDialog.Overlay className="fixed inset-0 z-40 bg-foreground/40" />
      <RadixDialog.Content
        className={cn(
          'fixed inset-y-0 start-0 z-50 flex h-full w-80 translate-x-full flex-col gap-4 border-e border-border bg-surface p-4 text-foreground shadow-sm transition-transform duration-fast ease-standard data-[state=open]:translate-x-0 motion-reduce:transition-none focus-visible:outline-none',
          className,
        )}
        {...props}
      >
        <RadixDialog.Title className="text-lg font-bold">{title}</RadixDialog.Title>
        <RadixDialog.Description className="sr-only">{title}</RadixDialog.Description>
        {children}
      </RadixDialog.Content>
    </RadixDialog.Portal>
  );
}

export function SheetBody({ children }: { children: ReactNode }) {
  return <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">{children}</div>;
}
