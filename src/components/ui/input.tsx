'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  /** Adornment rendered inside the field on the right (e.g. a button). */
  trailing?: React.ReactNode;
}

const baseField =
  'h-10 w-full rounded-lg border bg-surface px-3 text-sm text-foreground shadow-xs transition-colors ' +
  'placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-ring/60 focus:border-ring ' +
  'disabled:cursor-not-allowed disabled:opacity-60';

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, invalid, leftIcon, rightIcon, trailing, ...props },
  ref,
) {
  const hasLeft = Boolean(leftIcon);
  const hasRight = Boolean(rightIcon || trailing);

  const field = (
    <input
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(
        baseField,
        invalid && 'border-danger focus:border-danger focus:ring-danger/40',
        hasLeft && 'pl-9',
        hasRight && 'pr-9',
        className,
      )}
      {...props}
    />
  );

  if (!hasLeft && !hasRight) return field;

  return (
    <div className="relative flex items-center">
      {leftIcon && (
        <span className="pointer-events-none absolute left-3 text-muted-foreground">
          {leftIcon}
        </span>
      )}
      {field}
      {(rightIcon || trailing) && (
        <span className="absolute right-2.5 flex items-center text-muted-foreground">
          {trailing ?? rightIcon}
        </span>
      )}
    </div>
  );
});
