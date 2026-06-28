'use client';

import { cn } from '@/lib/utils/cn';

export interface TabItem {
  value: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  count?: number;
  disabled?: boolean;
}

export interface TabsProps {
  items: TabItem[];
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
  /** `line` (underline) or `pill` (segmented control). */
  variant?: 'line' | 'pill';
}

export function Tabs({ items, value, onValueChange, className, variant = 'line' }: TabsProps) {
  if (variant === 'pill') {
    return (
      <div
        className={cn('inline-flex items-center gap-1 rounded-lg bg-muted/70 p-1', className)}
        role="tablist"
      >
        {items.map((item) => {
          const active = item.value === value;
          return (
            <button
              key={item.value}
              role="tab"
              aria-selected={active}
              disabled={item.disabled}
              onClick={() => onValueChange(item.value)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50',
                active
                  ? 'bg-surface-raised text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {item.icon}
              {item.label}
              {item.count !== undefined && (
                <span className="text-xs text-muted-foreground">{item.count}</span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-1 border-b border-border', className)} role="tablist">
      {items.map((item) => {
        const active = item.value === value;
        return (
          <button
            key={item.value}
            role="tab"
            aria-selected={active}
            disabled={item.disabled}
            onClick={() => onValueChange(item.value)}
            className={cn(
              'relative inline-flex items-center gap-1.5 px-3.5 py-2.5 text-sm font-medium transition-colors disabled:opacity-50',
              active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {item.icon}
            {item.label}
            {item.count !== undefined && (
              <span
                className={cn(
                  'rounded-full px-1.5 py-0.5 text-[0.6875rem] font-semibold',
                  active ? 'bg-accent/15 text-accent-foreground' : 'bg-muted text-muted-foreground',
                )}
              >
                {item.count}
              </span>
            )}
            {active && (
              <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-accent" />
            )}
          </button>
        );
      })}
    </div>
  );
}
