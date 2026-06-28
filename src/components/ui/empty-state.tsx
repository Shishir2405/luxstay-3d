import type { Icon } from '@phosphor-icons/react';
import { cn } from '@/lib/utils/cn';

export function EmptyState({
  icon: Glyph,
  title,
  description,
  action,
  className,
}: {
  icon?: Icon;
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border border-dashed border-border/80 bg-surface-sunken/30 px-6 py-14 text-center',
        className,
      )}
    >
      {Glyph && (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Glyph size={24} />
        </div>
      )}
      <h3 className="font-display text-base font-semibold text-foreground">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
