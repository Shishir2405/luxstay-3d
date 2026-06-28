import { cn } from '@/lib/utils/cn';

/** Loading placeholder. Uses the `.skeleton` shimmer defined in globals.css. */
export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('skeleton h-4 w-full', className)} {...props} />;
}

/** Convenience: a stack of text-line skeletons. */
export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={cn('h-3.5', i === lines - 1 && 'w-2/3')} />
      ))}
    </div>
  );
}
