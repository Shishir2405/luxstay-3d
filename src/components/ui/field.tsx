'use client';

import { useId } from 'react';
import { cn } from '@/lib/utils/cn';

export function Label({
  className,
  required,
  children,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement> & { required?: boolean }) {
  return (
    <label className={cn('text-sm font-medium text-foreground', className)} {...props}>
      {children}
      {required && <span className="ml-0.5 text-danger">*</span>}
    </label>
  );
}

export interface FieldProps {
  label?: React.ReactNode;
  htmlFor?: string;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  required?: boolean;
  className?: string;
  children: React.ReactNode | ((ids: { id: string; describedBy?: string }) => React.ReactNode);
}

/**
 * Form field wrapper: label + control + hint/error wiring with proper a11y ids.
 * Pass children as a render fn to receive the generated `id`/`aria-describedby`.
 */
export function Field({ label, htmlFor, hint, error, required, className, children }: FieldProps) {
  const generatedId = useId();
  const id = htmlFor ?? generatedId;
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <Label htmlFor={id} required={required}>
          {label}
        </Label>
      )}
      {typeof children === 'function' ? children({ id, describedBy }) : children}
      {error ? (
        <p id={`${id}-error`} className="text-[0.8125rem] font-medium text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-[0.8125rem] text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
