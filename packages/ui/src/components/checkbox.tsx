'use client';

import { Checkbox as RadixCheckbox } from 'radix-ui';
import { Check, Minus } from 'lucide-react';
import { useId, type ComponentProps, type ReactNode } from 'react';
import { cn } from '../lib/cn';

export function Checkbox({
  className,
  label,
  hideLabel = false,
  id,
  ...props
}: ComponentProps<typeof RadixCheckbox.Root> & { label: ReactNode; hideLabel?: boolean }) {
  const generatedId = useId();
  const controlId = id ?? generatedId;
  return (
    <div className="inline-flex min-h-11 min-w-11 items-center gap-3 text-sm text-foreground">
      <RadixCheckbox.Root
        id={controlId}
        className={cn(
          'flex size-5 items-center justify-center rounded-sm border border-input bg-surface text-primary-foreground transition-colors duration-fast ease-standard focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary disabled:opacity-50',
          className,
        )}
        {...props}
      >
        <RadixCheckbox.Indicator>
          {props.checked === 'indeterminate' ? (
            <Minus className="size-3" aria-hidden="true" />
          ) : (
            <Check className="size-3" aria-hidden="true" />
          )}
        </RadixCheckbox.Indicator>
      </RadixCheckbox.Root>
      <label htmlFor={controlId} className={hideLabel ? 'sr-only' : undefined}>
        {label}
      </label>
    </div>
  );
}
