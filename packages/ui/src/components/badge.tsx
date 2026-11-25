import { cva, type VariantProps } from 'class-variance-authority';
import type { HTMLAttributes } from 'react';
import { cn } from '../lib/cn';

const badgeVariants = cva('inline-flex items-center rounded-full px-3 py-1 text-sm font-medium', {
  variants: {
    variant: {
      neutral: 'bg-surface-sunken text-foreground',
      primary: 'bg-primary-subtle text-primary-subtle-foreground',
      accent: 'bg-accent-subtle text-accent-subtle-foreground',
      success: 'bg-success-subtle text-success-subtle-foreground',
      warning: 'bg-warning-subtle text-warning-subtle-foreground',
      danger: 'bg-danger-subtle text-danger-subtle-foreground',
      info: 'bg-info-subtle text-info-subtle-foreground',
    },
  },
  defaultVariants: { variant: 'neutral' },
});

export function Badge({
  className,
  variant,
  ...props
}: HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
