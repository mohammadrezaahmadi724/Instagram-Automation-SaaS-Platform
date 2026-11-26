'use client';

import { Tooltip as RadixTooltip } from 'radix-ui';
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '../lib/cn';

export function TooltipProvider({ children }: { children: ReactNode }) {
  return <RadixTooltip.Provider delayDuration={200}>{children}</RadixTooltip.Provider>;
}

export function Tooltip({ content, children }: { content: ReactNode; children: ReactNode }) {
  return (
    <RadixTooltip.Root>
      <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
      <RadixTooltip.Portal>
        <RadixTooltip.Content
          className={cn(
            'z-50 max-w-64 rounded-md bg-foreground px-3 py-2 text-sm text-inverse shadow-sm',
          )}
        >
          {content}
        </RadixTooltip.Content>
      </RadixTooltip.Portal>
    </RadixTooltip.Root>
  );
}

export function TooltipContent(props: ComponentProps<typeof RadixTooltip.Content>) {
  return <RadixTooltip.Content {...props} />;
}
