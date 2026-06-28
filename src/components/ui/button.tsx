'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils/cn';
import { Spinner } from './spinner';

export type ButtonVariant =
  'primary' | 'accent' | 'secondary' | 'outline' | 'ghost' | 'subtle' | 'danger' | 'link';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon' | 'icon-sm';

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 active:bg-primary/95',
  accent: 'bg-accent text-accent-foreground shadow-sm hover:brightness-105 active:brightness-95',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/70 border border-border/60',
  outline: 'border border-input bg-surface text-foreground hover:bg-muted/60 hover:border-border',
  ghost: 'text-foreground hover:bg-muted/70',
  subtle: 'bg-muted/60 text-foreground hover:bg-muted',
  danger: 'bg-danger text-danger-foreground shadow-sm hover:bg-danger/90',
  link: 'text-accent underline-offset-4 hover:underline px-0 h-auto',
};

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-[0.8125rem] gap-1.5 rounded-md',
  md: 'h-10 px-4 text-sm gap-2 rounded-lg',
  lg: 'h-12 px-6 text-[0.95rem] gap-2 rounded-lg',
  icon: 'h-10 w-10 rounded-lg',
  'icon-sm': 'h-8 w-8 rounded-md',
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    className,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    leftIcon,
    rightIcon,
    fullWidth,
    children,
    disabled,
    type = 'button',
    ...props
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      className={cn(
        'relative inline-flex select-none items-center justify-center whitespace-nowrap font-medium',
        'transition-[background,color,box-shadow,transform,filter] duration-150 ease-out-expo',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'disabled:pointer-events-none disabled:opacity-55 active:translate-y-px',
        VARIANTS[variant],
        SIZES[size],
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {isLoading && <Spinner size={size === 'lg' ? 'sm' : 'xs'} className="text-current" />}
      {!isLoading && leftIcon}
      {children}
      {!isLoading && rightIcon}
    </button>
  );
});
