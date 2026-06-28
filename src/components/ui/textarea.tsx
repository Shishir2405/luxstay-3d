'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils/cn';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, invalid, rows = 4, ...props },
  ref,
) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      aria-invalid={invalid || undefined}
      className={cn(
        'w-full rounded-lg border bg-surface px-3 py-2 text-sm text-foreground shadow-xs transition-colors',
        'placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-ring/60 focus:border-ring',
        'disabled:cursor-not-allowed disabled:opacity-60 resize-y min-h-[5rem]',
        invalid && 'border-danger focus:border-danger focus:ring-danger/40',
        className,
      )}
      {...props}
    />
  );
});
