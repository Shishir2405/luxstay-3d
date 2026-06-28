'use client';

import { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle, Info, Warning, WarningCircle, X, type Icon } from '@phosphor-icons/react';
import { useToastStore, type Toast, type ToastVariant } from '@/store/toast';
import { cn } from '@/lib/utils/cn';

const ICONS: Record<ToastVariant, Icon> = {
  default: Info,
  success: CheckCircle,
  error: WarningCircle,
  warning: Warning,
  info: Info,
};

const ACCENTS: Record<ToastVariant, string> = {
  default: 'text-foreground',
  success: 'text-success',
  error: 'text-danger',
  warning: 'text-warning',
  info: 'text-info',
};

function ToastCard({ toast }: { toast: Toast }) {
  const dismiss = useToastStore((s) => s.dismiss);
  const Glyph = ICONS[toast.variant];

  useEffect(() => {
    if (toast.duration <= 0) return;
    const t = setTimeout(() => dismiss(toast.id), toast.duration);
    return () => clearTimeout(t);
  }, [toast.id, toast.duration, dismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 24, scale: 0.96 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      className="pointer-events-auto flex w-full items-start gap-3 rounded-xl border border-border/70 bg-popover p-3.5 pr-2.5 shadow-lg"
      role="status"
    >
      <Glyph size={20} weight="fill" className={cn('mt-0.5 shrink-0', ACCENTS[toast.variant])} />
      <div className="flex-1 pt-0.5">
        <p className="text-sm font-semibold leading-snug text-foreground">{toast.title}</p>
        {toast.description && (
          <p className="mt-0.5 text-[0.8125rem] leading-snug text-muted-foreground">
            {toast.description}
          </p>
        )}
      </div>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={() => dismiss(toast.id)}
        className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <X size={15} weight="bold" />
      </button>
    </motion.div>
  );
}

/** Mount once near the app root. Renders the global toast queue. */
export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex flex-col items-center gap-2.5 p-4 sm:inset-x-auto sm:right-0 sm:bottom-0 sm:max-w-sm sm:items-end">
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <ToastCard key={t.id} toast={t} />
        ))}
      </AnimatePresence>
    </div>
  );
}
