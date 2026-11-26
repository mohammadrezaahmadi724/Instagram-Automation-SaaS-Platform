export const fieldClass =
  'min-h-11 w-full rounded-md border border-input bg-surface px-3 text-base text-foreground transition-colors duration-fast ease-standard focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-danger';

export const fieldSizeClass = {
  sm: 'min-h-11 text-sm',
  md: 'min-h-11 text-base',
  lg: 'min-h-12 text-lg',
} as const;

export const popupClass =
  'z-50 rounded-md border border-border bg-surface p-1 text-foreground shadow-sm';
