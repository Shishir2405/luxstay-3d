import { cn } from '@/lib/utils/cn';

const SIZES = { xs: 'h-3 w-3', sm: 'h-4 w-4', md: 'h-5 w-5', lg: 'h-7 w-7' } as const;

export function Spinner({
  size = 'md',
  className,
  label = 'Loading',
}: {
  size?: keyof typeof SIZES;
  className?: string;
  label?: string;
}) {
  return (
    <span
      role="status"
      aria-label={label}
      className={cn(
        'inline-block animate-spin-slow rounded-full border-2 border-current border-r-transparent align-[-0.125em]',
        SIZES[size],
        className,
      )}
    />
  );
}
