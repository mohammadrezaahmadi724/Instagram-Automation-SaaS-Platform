import { ShieldOff } from 'lucide-react';

export function NoPermissionState({
  title = 'اجازه‌ی این کار را ندارید',
  description,
}: {
  title?: string;
  description: string;
}) {
  return (
    <div
      className="flex flex-col items-start gap-3 rounded-lg border border-border bg-surface p-6"
      role="status"
    >
      <ShieldOff className="size-6 text-muted" aria-hidden="true" />
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      <p className="max-w-prose text-sm text-subtle">{description}</p>
    </div>
  );
}
