import type { ComponentProps, InputHTMLAttributes, ReactNode, Ref } from 'react';
import { Label as RadixLabel } from 'radix-ui';
import { fieldClass, fieldSizeClass } from '../lib/controls';
import { cn } from '../lib/cn';

export function Label({ className, ...props }: ComponentProps<typeof RadixLabel.Root>) {
  return (
    <RadixLabel.Root className={cn('text-sm font-medium text-foreground', className)} {...props} />
  );
}

export function FieldDescription({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <p id={id} className="text-sm text-muted">
      {children}
    </p>
  );
}

export function FieldError({ id, children }: { id: string; children: ReactNode }) {
  return (
    <p id={id} className="text-sm text-danger" role="alert">
      {children}
    </p>
  );
}

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  ref?: Ref<HTMLInputElement>;
  invalid?: boolean;
  fieldSize?: keyof typeof fieldSizeClass;
}

export function Input({ className, invalid = false, fieldSize = 'md', ref, ...props }: InputProps) {
  return (
    <input
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(fieldClass, fieldSizeClass[fieldSize], className)}
      {...props}
    />
  );
}
