import { AlertTriangle } from 'lucide-react';
import { Button } from './button';

export function ErrorState({
  title,
  description,
  errorId,
  onRetry,
}: {
  title: string;
  description: string;
  errorId?: string;
  onRetry?: () => void;
}) {
  return (
    <div
      className="flex flex-col items-start gap-3 rounded-lg border border-danger bg-danger-subtle p-6 text-danger-subtle-foreground"
      role="alert"
    >
      <AlertTriangle className="size-6" aria-hidden="true" />
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="text-sm">{description}</p>
      {errorId ? (
        <p className="font-mono text-sm">
          شناسه: <bdi dir="ltr">{errorId}</bdi>
        </p>
      ) : null}
      {onRetry ? (
        <Button type="button" variant="outline" onClick={onRetry}>
          تلاش دوباره
        </Button>
      ) : null}
    </div>
  );
}
