'use client';

import { Command } from 'cmdk';
import { Popover } from 'radix-ui';
import { ChevronsUpDown } from 'lucide-react';
import { useState } from 'react';
import { popupClass } from '../lib/controls';
import { cn } from '../lib/cn';

export type ComboboxOption = { value: string; label: string; latin?: string };

export function Combobox({
  options,
  value,
  onValueChange,
  loading = false,
  invalid = false,
  placeholder = 'جستجو',
  label,
}: {
  options: ComboboxOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  loading?: boolean;
  invalid?: boolean;
  placeholder?: string;
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);
  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-label={label}
          aria-invalid={invalid || undefined}
          className="inline-flex min-h-11 w-full items-center justify-between gap-2 rounded-md border border-input bg-surface px-3 text-start text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring aria-[invalid=true]:border-danger"
        >
          <span>{selected?.label ?? placeholder}</span>
          <ChevronsUpDown className="size-4 text-muted" aria-hidden="true" />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content className={cn(popupClass, 'w-72 p-2')} align="start">
          {loading ? (
            <p className="px-2 py-3 text-sm text-muted" role="status">
              در حال جستجو
            </p>
          ) : (
            <Command label={label} className="flex flex-col gap-2">
              <Command.Input
                placeholder={placeholder}
                className="min-h-11 rounded-md border border-input bg-surface px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <Command.List className="max-h-60 overflow-y-auto">
                <Command.Empty className="px-2 py-3 text-sm text-muted">
                  نتیجه‌ای نیست
                </Command.Empty>
                {options.map((option) => (
                  <Command.Item
                    key={option.value}
                    value={option.label}
                    className="flex min-h-11 cursor-pointer items-center justify-between gap-2 rounded-sm px-2 text-sm data-[selected=true]:bg-surface-sunken"
                    onSelect={() => {
                      onValueChange?.(option.value);
                      setOpen(false);
                    }}
                  >
                    <span>{option.label}</span>
                    {option.latin ? <bdi dir="ltr">{option.latin}</bdi> : null}
                  </Command.Item>
                ))}
              </Command.List>
            </Command>
          )}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
