import { cn } from '../lib/cn';

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-block size-4 animate-spin rounded-full border-2 border-current border-b-transparent',
        className,
      )}
      aria-hidden="true"
    />
  );
}
