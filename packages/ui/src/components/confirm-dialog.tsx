'use client';

import { useId, useRef, useState, type ReactNode } from 'react';
import { Button } from './button';
import { Dialog, DialogContent, DialogTrigger } from './dialog';
import { Input } from './input';

export function ConfirmDialog({
  trigger,
  title,
  consequence,
  confirmLabel,
  confirmText,
  loading = false,
  error,
  onConfirm,
}: {
  trigger: ReactNode;
  title: string;
  consequence: string;
  confirmLabel: string;
  confirmText?: string;
  loading?: boolean;
  error?: string;
  onConfirm: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState('');
  const cancelRef = useRef<HTMLButtonElement>(null);
  const errorId = useId();
  const locked = confirmText !== undefined && typed !== confirmText;
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setTyped('');
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        title={title}
        description={consequence}
        data-testid="confirm-dialog"
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          cancelRef.current?.focus();
        }}
      >
        {confirmText ? (
          <label className="flex flex-col gap-2 text-sm">
            <span>
              برای ادامه، <bdi>{confirmText}</bdi> را بنویسید.
            </span>
            <Input
              value={typed}
              aria-invalid={locked || undefined}
              onChange={(event) => setTyped(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && locked) event.preventDefault();
              }}
            />
          </label>
        ) : null}
        {error ? (
          <p id={errorId} className="text-sm text-danger" role="alert">
            {error}
          </p>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <Button ref={cancelRef} type="button" variant="outline" onClick={() => setOpen(false)}>
            انصراف
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={locked}
            loading={loading}
            aria-describedby={error ? errorId : undefined}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
