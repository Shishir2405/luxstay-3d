'use client';

import { CaretDown, CaretUp, CaretUpDown } from '@phosphor-icons/react';
import { cn } from '@/lib/utils/cn';

export function Table({ className, ...props }: React.TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="w-full overflow-x-auto">
      <table className={cn('w-full caption-bottom text-sm', className)} {...props} />
    </div>
  );
}

export function THead({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead
      className={cn('border-b border-border bg-surface-sunken/40 text-left', className)}
      {...props}
    />
  );
}

export function TBody({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={cn('divide-y divide-border/70', className)} {...props} />;
}

export function TR({
  className,
  interactive,
  ...props
}: React.HTMLAttributes<HTMLTableRowElement> & { interactive?: boolean }) {
  return (
    <tr
      className={cn(
        'transition-colors',
        interactive && 'cursor-pointer hover:bg-muted/40',
        className,
      )}
      {...props}
    />
  );
}

export function TH({
  className,
  sortable,
  sortDir,
  onSort,
  children,
  ...props
}: React.ThHTMLAttributes<HTMLTableCellElement> & {
  sortable?: boolean;
  sortDir?: 'asc' | 'desc' | null;
  onSort?: () => void;
}) {
  return (
    <th
      className={cn(
        'h-11 whitespace-nowrap px-4 align-middle text-xs font-semibold uppercase tracking-wide text-muted-foreground',
        className,
      )}
      aria-sort={sortDir === 'asc' ? 'ascending' : sortDir === 'desc' ? 'descending' : undefined}
      {...props}
    >
      {sortable ? (
        <button
          type="button"
          onClick={onSort}
          className="inline-flex items-center gap-1 hover:text-foreground"
        >
          {children}
          {sortDir === 'asc' ? (
            <CaretUp size={12} weight="bold" />
          ) : sortDir === 'desc' ? (
            <CaretDown size={12} weight="bold" />
          ) : (
            <CaretUpDown size={12} className="opacity-50" />
          )}
        </button>
      ) : (
        children
      )}
    </th>
  );
}

export function TD({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn('px-4 py-3 align-middle text-foreground', className)} {...props} />;
}
