'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'motion/react';
import { AdminSidebar } from './admin-sidebar';
import { AdminTopbar } from './admin-topbar';
import { useAuthStore } from '@/store/auth';
import { ROLES } from '@/lib/constants';
import { Spinner } from '@/components/ui/spinner';

/**
 * Authenticated admin frame. Bootstraps the cookie session, guards against
 * unauthenticated/guest access, and lays out the responsive sidebar + topbar.
 */
export function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, status, fetchMe } = useAuthStore();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (status === 'idle') void fetchMe();
  }, [status, fetchMe]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
    } else if (status === 'authenticated' && user?.role === ROLES.GUEST) {
      router.replace('/account');
    }
  }, [status, user, pathname, router]);

  if (status !== 'authenticated' || user?.role === ROLES.GUEST) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Spinner size="lg" className="text-accent" />
          <p className="text-sm">Loading your console…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-sunken/30">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-border/60 bg-surface lg:block">
        <AdminSidebar />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              className="absolute inset-0 bg-primary/40 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
            />
            <motion.aside
              className="absolute inset-y-0 left-0 w-64 bg-surface shadow-xl"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            >
              <AdminSidebar onNavigate={() => setDrawerOpen(false)} />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      <div className="lg:pl-64">
        <AdminTopbar onMenuClick={() => setDrawerOpen(true)} />
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
