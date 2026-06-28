'use client';

import { useEffect } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { useThemeStore } from '@/store/theme';

/**
 * Client-side app shell mounted once at the root. Syncs the theme store with the
 * class the pre-paint script applied, and renders the global toast layer.
 * Session bootstrap is intentionally NOT here — only authenticated areas
 * (admin / account) call `useAuthStore.fetchMe()`, so public/3D pages stay anon.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  const hydrate = useThemeStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <>
      {children}
      <Toaster />
    </>
  );
}
