'use client';

import { DropdownMenu as RadixMenu } from 'radix-ui';
import type { ComponentProps, ReactNode } from 'react';
import { popupClass } from '../lib/controls';
import { cn } from '../lib/cn';

export const DropdownMenu = RadixMenu.Root;
export const DropdownMenuTrigger = RadixMenu.Trigger;

export function DropdownMenuContent({
  className,
  ...props
}: ComponentProps<typeof RadixMenu.Content>) {
  return (
    <RadixMenu.Portal>
      <RadixMenu.Content
        sideOffset={8}
        className={cn(popupClass, 'min-w-48', className)}
        {...props}
      />
    </RadixMenu.Portal>
  );
}

export function DropdownMenuItem({
  className,
  children,
  ...props
}: ComponentProps<typeof RadixMenu.Item>) {
  return (
    <RadixMenu.Item
      className={cn(
        'flex min-h-11 cursor-pointer items-center rounded-sm px-3 text-sm outline-none data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50 data-[highlighted]:bg-surface-sunken',
        className,
      )}
      {...props}
    >
      {children}
    </RadixMenu.Item>
  );
}

export function SoonMenuItem({ children }: { children: ReactNode }) {
  return (
    <DropdownMenuItem disabled aria-disabled="true">
      {children}
      <span className="ms-auto text-xs text-muted">به‌زودی</span>
    </DropdownMenuItem>
  );
}
