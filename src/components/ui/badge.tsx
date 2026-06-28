import { cn } from '@/lib/utils/cn';

export type BadgeTone =
  'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'info' | 'outline';

const TONES: Record<BadgeTone, string> = {
  neutral: 'bg-muted text-muted-foreground',
  accent: 'bg-accent/15 text-accent-foreground ring-1 ring-inset ring-accent/30',
  success: 'bg-success/12 text-success ring-1 ring-inset ring-success/25',
  warning: 'bg-warning/15 text-warning ring-1 ring-inset ring-warning/30',
  danger: 'bg-danger/12 text-danger ring-1 ring-inset ring-danger/25',
  info: 'bg-info/12 text-info ring-1 ring-inset ring-info/25',
  outline: 'border border-border text-muted-foreground',
};

export function Badge({
  tone = 'neutral',
  dot,
  className,
  children,
}: {
  tone?: BadgeTone;
  dot?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
        TONES[tone],
        className,
      )}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />}
      {children}
    </span>
  );
}
