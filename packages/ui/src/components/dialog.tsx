'use client';

import { Dialog as RadixDialog } from 'radix-ui';
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '../lib/cn';

export const Dialog = RadixDialog.Root;
export const DialogTrigger = RadixDialog.Trigger;
export const DialogClose = RadixDialog.Close;

export function DialogContent({
  className,
  children,
  title,
  description,
  ...props
}: ComponentProps<typeof RadixDialog.Content> & { title: string; description?: string }) {
  return (
    <RadixDialog.Portal>
      <RadixDialog.Overlay className="fixed inset-0 z-40 bg-foreground/40" />
      <RadixDialog.Content
        className={cn(
          'fixed start-1/2 top-1/2 z-50 flex w-full max-w-lg -translate-y-1/2 translate-x-1/2 flex-col gap-4 rounded-xl border border-border bg-surface p-6 text-foreground shadow-sm focus-visible:outline-none',
          className,
        )}
        {...props}
      >
        <RadixDialog.Title className="text-xl font-bold">{title}</RadixDialog.Title>
        {description ? (
          <RadixDialog.Description className="text-sm text-subtle">
            {description}
          </RadixDialog.Description>
        ) : (
          <RadixDialog.Description className="sr-only">{title}</RadixDialog.Description>
        )}
        {children}
      </RadixDialog.Content>
    </RadixDialog.Portal>
  );
}

export function DialogActions({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-center gap-2">{children}</div>;
}
