import type { Metadata } from 'next';
import { Providers } from '@/components/providers';
import { AdminShell } from '@/components/admin/admin-shell';

export const metadata: Metadata = {
  title: { default: 'Console', template: '%s · LuxStay Admin' },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <AdminShell>{children}</AdminShell>
    </Providers>
  );
}
