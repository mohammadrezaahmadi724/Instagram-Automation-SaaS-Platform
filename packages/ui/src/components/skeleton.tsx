import { cn } from '../lib/cn';

export function Skeleton({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'block animate-pulse rounded-md bg-surface-sunken motion-reduce:animate-none',
        className,
      )}
    />
  );
}
