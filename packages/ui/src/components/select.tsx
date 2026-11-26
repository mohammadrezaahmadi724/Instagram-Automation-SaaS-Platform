'use client';

import { Select as RadixSelect } from 'radix-ui';
import { Check, ChevronDown } from 'lucide-react';
import type { ReactNode } from 'react';
import { popupClass } from '../lib/controls';
import { cn } from '../lib/cn';

export function Select({
  value,
  defaultValue,
  onValueChange,
  label,
  placeholder = 'انتخاب کنید',
  invalid = false,
  disabled = false,
  size = 'md',
  children,
  name,
}: {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  label: string;
  placeholder?: string;
  invalid?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md';
  name?: string;
  children: ReactNode;
}) {
  return (
    <RadixSelect.Root
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      disabled={disabled}
      name={name}
      dir="rtl"
    >
      <RadixSelect.Trigger
        aria-label={label}
        aria-invalid={invalid || undefined}
        className={cn(
          'inline-flex min-h-11 w-full items-center justify-between gap-2 rounded-md border border-input bg-surface px-3 text-foreground transition-colors duration-fast ease-standard focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 data-[placeholder]:text-muted aria-[invalid=true]:border-danger',
          size === 'sm' ? 'text-sm' : 'text-base',
        )}
      >
        <RadixSelect.Value placeholder={placeholder} />
        <RadixSelect.Icon>
          <ChevronDown className="size-4 text-muted" aria-hidden="true" />
        </RadixSelect.Icon>
      </RadixSelect.Trigger>
      <RadixSelect.Portal>
        <RadixSelect.Content
          className={cn(popupClass, 'max-h-72 overflow-y-auto')}
          position="popper"
        >
          <RadixSelect.Viewport className="flex flex-col">{children}</RadixSelect.Viewport>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  );
}

export function SelectItem({ value, children }: { value: string; children: ReactNode }) {
  return (
    <RadixSelect.Item
      value={value}
      className="flex min-h-11 cursor-pointer items-center gap-2 rounded-sm px-3 text-sm outline-none data-[highlighted]:bg-surface-sunken"
    >
      <RadixSelect.ItemIndicator>
        <Check className="size-4 text-primary" aria-hidden="true" />
      </RadixSelect.ItemIndicator>
      <RadixSelect.ItemText>{children}</RadixSelect.ItemText>
    </RadixSelect.Item>
  );
}
