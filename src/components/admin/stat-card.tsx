import type { Icon } from '@phosphor-icons/react';
import { TrendUp, TrendDown } from '@phosphor-icons/react/dist/ssr';
import { cn } from '@/lib/utils/cn';

export interface StatCardProps {
  label: string;
  value: string;
  icon: Icon;
  /** Signed percentage delta vs the prior period, e.g. +12.4. */
  delta?: number;
  hint?: string;
  tone?: 'accent' | 'success' | 'info' | 'warning';
}

const TONES = {
  accent: 'bg-accent/12 text-accent',
  success: 'bg-success/12 text-success',
  info: 'bg-info/12 text-info',
  warning: 'bg-warning/15 text-warning',
} as const;

export function StatCard({
  label,
  value,
  icon: Glyph,
  delta,
  hint,
  tone = 'accent',
}: StatCardProps) {
  const positive = (delta ?? 0) >= 0;
  return (
    <div className="rounded-xl border border-border/70 bg-card p-5">
      <div className="flex items-start justify-between">
        <span className={cn('flex h-10 w-10 items-center justify-center rounded-lg', TONES[tone])}>
          <Glyph size={20} weight="duotone" />
        </span>
        {delta !== undefined && (
          <span
            className={cn(
              'inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold',
              positive ? 'bg-success/12 text-success' : 'bg-danger/12 text-danger',
            )}
          >
            {positive ? <TrendUp size={12} weight="bold" /> : <TrendDown size={12} weight="bold" />}
            {Math.abs(delta)}%
          </span>
        )}
      </div>
      <p className="mt-4 font-display text-2xl font-semibold tracking-tight">{value}</p>
      <p className="mt-0.5 text-sm text-muted-foreground">{label}</p>
      {hint && <p className="mt-2 text-xs text-muted-foreground/80">{hint}</p>}
    </div>
  );
}
