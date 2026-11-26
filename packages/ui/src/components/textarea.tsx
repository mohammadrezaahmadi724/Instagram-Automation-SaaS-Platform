'use client';

import { useState, type TextareaHTMLAttributes } from 'react';
import { fieldClass } from '../lib/controls';
import { faDigits } from '../lib/digits';
import { cn } from '../lib/cn';

export function Textarea({
  className,
  invalid = false,
  maxBytes,
  value,
  defaultValue,
  onChange,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean; maxBytes?: number }) {
  const [internal, setInternal] = useState(String(defaultValue ?? ''));
  const text = value === undefined ? internal : String(value);
  const bytes = new TextEncoder().encode(text).length;
  const over = maxBytes !== undefined && bytes > maxBytes;
  return (
    <div className="flex flex-col gap-1">
      <textarea
        rows={4}
        value={value}
        defaultValue={value === undefined ? defaultValue : undefined}
        aria-invalid={invalid || over || undefined}
        className={cn(fieldClass, 'min-h-24 py-2', className)}
        onChange={(event) => {
          if (value === undefined) setInternal(event.target.value);
          onChange?.(event);
        }}
        {...props}
      />
      {maxBytes !== undefined ? (
        <p className={cn('text-sm', over ? 'text-danger' : 'text-muted')}>
          {faDigits(bytes)} از {faDigits(maxBytes)} بایت
        </p>
      ) : null}
    </div>
  );
}
