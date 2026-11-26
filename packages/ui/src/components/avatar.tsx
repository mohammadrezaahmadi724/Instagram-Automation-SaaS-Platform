'use client';

import { useState } from 'react';
import { cn } from '../lib/cn';

const sizes = { sm: 'size-8 text-sm', md: 'size-11 text-base', lg: 'size-16 text-xl' };

export function Avatar({
  name,
  src,
  size = 'md',
}: {
  name: string;
  src?: string;
  size?: keyof typeof sizes;
}) {
  const [failed, setFailed] = useState(false);
  const letter = Array.from(name.trim())[0] ?? '؟';
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center overflow-hidden rounded-full bg-primary-subtle font-semibold text-primary-subtle-foreground',
        sizes[size],
      )}
    >
      {src && !failed ? (
        <img
          src={src}
          alt={name}
          className="size-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <span aria-label={name}>{letter}</span>
      )}
    </span>
  );
}
