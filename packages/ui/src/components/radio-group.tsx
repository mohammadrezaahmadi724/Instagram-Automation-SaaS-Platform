'use client';

import { RadioGroup as RadixRadio } from 'radix-ui';
import { useId, type ComponentProps, type ReactNode } from 'react';
import { cn } from '../lib/cn';

export function RadioGroup({
  className,
  legend,
  error,
  children,
  ...props
}: ComponentProps<typeof RadixRadio.Root> & { legend: string; error?: string }) {
  const errorId = error ? `${props.name ?? 'radio'}-error` : undefined;
  return (
    <fieldset className="flex flex-col gap-2" aria-describedby={errorId}>
      <legend className="text-sm font-medium text-foreground">{legend}</legend>
      <RadixRadio.Root className={cn('flex flex-col gap-1', className)} {...props}>
        {children}
      </RadixRadio.Root>
      {error ? (
        <p id={errorId} className="text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}

export function RadioItem({
  className,
  label,
  id,
  ...props
}: ComponentProps<typeof RadixRadio.Item> & { label: ReactNode }) {
  const generatedId = useId();
  const controlId = id ?? generatedId;
  return (
    <div className="inline-flex min-h-11 items-center gap-3 text-sm text-foreground">
      <RadixRadio.Item
        id={controlId}
        className={cn(
          'flex size-5 items-center justify-center rounded-full border border-input bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50',
          className,
        )}
        {...props}
      >
        <RadixRadio.Indicator className="size-2.5 rounded-full bg-primary" />
      </RadixRadio.Item>
      <label htmlFor={controlId}>{label}</label>
    </div>
  );
}
