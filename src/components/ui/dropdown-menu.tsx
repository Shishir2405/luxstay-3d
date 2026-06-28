'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { cn } from '@/lib/utils/cn';

export interface DropdownItem {
  label: React.ReactNode;
  icon?: React.ReactNode;
  onSelect?: () => void;
  href?: string;
  danger?: boolean;
  disabled?: boolean;
  /** Render a divider above this item. */
  separatorBefore?: boolean;
}

export interface DropdownMenuProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  align?: 'start' | 'end';
  className?: string;
  /** Optional heading shown at the top of the menu. */
  label?: React.ReactNode;
}

export function DropdownMenu({
  trigger,
  items,
  align = 'end',
  className,
  label,
}: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative inline-flex">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex"
      >
        {trigger}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, scale: 0.96, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -4 }}
            transition={{ duration: 0.14, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              'absolute top-full z-50 mt-1.5 min-w-[12rem] overflow-hidden rounded-lg border border-border/70 bg-popover p-1 shadow-lg',
              align === 'end' ? 'right-0' : 'left-0',
              className,
            )}
          >
            {label && (
              <p className="px-2.5 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {label}
              </p>
            )}
            {items.map((item, i) => {
              const content = (
                <>
                  {item.icon && <span className="shrink-0">{item.icon}</span>}
                  <span className="flex-1 text-left">{item.label}</span>
                </>
              );
              const classes = cn(
                'flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors',
                item.disabled && 'pointer-events-none opacity-50',
                item.danger ? 'text-danger hover:bg-danger/10' : 'text-foreground hover:bg-muted',
              );
              return (
                <div key={i}>
                  {item.separatorBefore && <div className="my-1 h-px bg-border/70" />}
                  {item.href ? (
                    <a
                      href={item.href}
                      role="menuitem"
                      className={classes}
                      onClick={() => setOpen(false)}
                    >
                      {content}
                    </a>
                  ) : (
                    <button
                      type="button"
                      role="menuitem"
                      disabled={item.disabled}
                      className={classes}
                      onClick={() => {
                        item.onSelect?.();
                        setOpen(false);
                      }}
                    >
                      {content}
                    </button>
                  )}
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
