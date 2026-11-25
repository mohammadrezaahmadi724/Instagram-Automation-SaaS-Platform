import { cva, type VariantProps } from 'class-variance-authority';
import type { ButtonHTMLAttributes, ReactNode, Ref } from 'react';
import { cn } from '../lib/cn';
import { Spinner } from './spinner';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors duration-fast ease-standard focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground hover:bg-primary-hover',
        secondary: 'bg-surface-sunken text-foreground hover:bg-border',
        ghost: 'bg-transparent text-foreground hover:bg-surface-sunken',
        outline: 'border border-input bg-surface text-foreground hover:bg-surface-sunken',
        destructive: 'bg-danger text-danger-foreground hover:opacity-90',
        link: 'text-link underline-offset-4 hover:underline',
      },
      size: {
        sm: 'min-h-11 px-3 text-sm',
        md: 'min-h-11 px-4 text-base',
        lg: 'min-h-12 px-5 text-lg',
        icon: 'size-11',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  loading?: boolean;
  ref?: Ref<HTMLButtonElement>;
}

export function Button({
  className,
  variant,
  size,
  loading = false,
  disabled,
  children,
  ref,
  ...props
}: ButtonProps) {
  return (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      <span className="inline-grid place-items-center">
        <span
          className={cn(
            'col-start-1 row-start-1 inline-flex items-center gap-2',
            loading && 'invisible',
          )}
        >
          {children}
        </span>
        {loading ? (
          <span className="col-start-1 row-start-1">
            <Spinner />
          </span>
        ) : null}
      </span>
    </button>
  );
}

export function ButtonLabel({ children }: { children: ReactNode }) {
  return children;
}
