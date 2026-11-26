import type { ReactNode } from 'react';
import { FieldDescription, FieldError, Label } from './input';

export function FormField({
  id,
  label,
  description,
  error,
  children,
}: {
  id: string;
  label: string;
  description?: string;
  error?: string;
  children: (field: { id: string; 'aria-describedby'?: string; invalid: boolean }) => ReactNode;
}) {
  const descriptionId = description ? `${id}-description` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [descriptionId, errorId].filter(Boolean).join(' ');
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      {children({
        id,
        invalid: Boolean(error),
        ...(describedBy ? { 'aria-describedby': describedBy } : {}),
      })}
      {description && descriptionId ? (
        <FieldDescription id={descriptionId}>{description}</FieldDescription>
      ) : null}
      {error && errorId ? <FieldError id={errorId}>{error}</FieldError> : null}
    </div>
  );
}
