import type { ReactNode } from 'react';
import { Inbox, SearchX } from 'lucide-react';

export function EmptyState({
  kind,
  title,
  description,
  action,
}: {
  kind: 'first-use' | 'filter';
  title: string;
  description: string;
  action?: ReactNode;
}) {
  const Icon = kind === 'first-use' ? Inbox : SearchX;
  return (
    <div className="flex flex-col items-start gap-3 rounded-lg border border-dashed border-border bg-surface p-6">
      <Icon className="size-6 text-muted" aria-hidden="true" />
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      <p className="max-w-prose text-sm text-subtle">{description}</p>
      {action}
    </div>
  );
}
