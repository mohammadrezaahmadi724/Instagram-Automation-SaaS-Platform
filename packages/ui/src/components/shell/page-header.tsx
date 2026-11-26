import type { ReactNode } from 'react';

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 pb-20 md:flex-row md:items-end md:justify-between md:pb-0">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-foreground">{title}</h1>
        <p className="text-subtle">{description}</p>
      </div>
      {action ? (
        <div className="fixed start-0 end-0 bottom-0 z-30 border-t border-border bg-surface p-3 md:static md:border-0 md:bg-transparent md:p-0">
          {action}
        </div>
      ) : null}
    </div>
  );
}
