import { ArrowDown, ArrowUp, Minus } from 'lucide-react';
import type { ReactNode } from 'react';
import { Card, CardContent } from './card';
import { Skeleton } from './skeleton';
import { cn } from '../lib/cn';

const trend = {
  up: { icon: ArrowUp, text: 'بیشتر', className: 'text-success' },
  down: { icon: ArrowDown, text: 'کمتر', className: 'text-danger' },
  flat: { icon: Minus, text: 'بدون تغییر', className: 'text-muted' },
} as const;

export function StatCard({
  label,
  value,
  direction = 'flat',
  delta,
  loading = false,
}: {
  label: string;
  value: ReactNode;
  direction?: keyof typeof trend;
  delta?: string;
  loading?: boolean;
}) {
  const item = trend[direction];
  const Icon = item.icon;
  return (
    <Card data-testid="stat-card">
      <CardContent className="flex flex-col gap-2">
        <p className="text-sm text-subtle">{label}</p>
        {loading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <p className="text-3xl font-bold tabular-nums text-foreground">{value}</p>
        )}
        <p className={cn('inline-flex items-center gap-1 text-sm', item.className)}>
          <Icon className="size-4" aria-hidden="true" />
          <span>{item.text}</span>
          {delta ? <span className="tabular-nums">{delta}</span> : null}
        </p>
      </CardContent>
    </Card>
  );
}
