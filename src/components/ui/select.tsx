'use client';

import { forwardRef } from 'react';
import { CaretDown } from '@phosphor-icons/react';
import { cn } from '@/lib/utils/cn';

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
  options?: SelectOption[];
  placeholder?: string;
}

/** Native <select>, styled to match the design system. Reliable + accessible. */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, invalid, options, placeholder, children, ...props },
  ref,
) {
  return (
    <div className="relative">
      <select
        ref={ref}
        aria-invalid={invalid || undefined}
        className={cn(
          'h-10 w-full appearance-none rounded-lg border bg-surface pl-3 pr-9 text-sm text-foreground shadow-xs transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-ring/60 focus:border-ring',
          'disabled:cursor-not-allowed disabled:opacity-60',
          invalid && 'border-danger focus:border-danger focus:ring-danger/40',
          className,
        )}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options
          ? options.map((o) => (
              <option key={o.value} value={o.value} disabled={o.disabled}>
                {o.label}
              </option>
            ))
          : children}
      </select>
      <CaretDown
        weight="bold"
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        size={14}
      />
    </div>
  );
});
