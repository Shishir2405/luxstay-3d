import Link from 'next/link';
import { Buildings, Sparkle } from '@phosphor-icons/react/dist/ssr';
import { Providers } from '@/components/providers';

/**
 * Split-screen auth shell: an editorial brand panel on the left, the form on the
 * right. The brand panel collapses on mobile so the form always leads.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
        {/* Brand panel */}
        <aside className="relative hidden overflow-hidden bg-primary text-primary-foreground lg:flex lg:flex-col lg:justify-between lg:p-12">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                'radial-gradient(circle at 20% 20%, hsl(var(--accent)) 0, transparent 45%), radial-gradient(circle at 80% 70%, hsl(var(--accent)) 0, transparent 40%)',
            }}
          />
          <Link href="/" className="relative inline-flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <Buildings size={20} weight="fill" />
            </span>
            <span className="font-display text-xl font-semibold tracking-tight">LuxStay 3D</span>
          </Link>

          <div className="relative max-w-md">
            <Sparkle size={28} weight="fill" className="mb-5 text-accent" />
            <p className="font-display text-3xl font-medium leading-snug tracking-tight text-balance">
              Walk every suite, lounge and rooftop in 3D — then book the moment it feels right.
            </p>
            <p className="mt-5 text-sm text-primary-foreground/70">
              The operations console behind an immersive booking experience: rooms, reservations,
              events and revenue, in one place.
            </p>
          </div>

          <p className="relative text-xs text-primary-foreground/50">
            © {new Date().getFullYear()} LuxStay 3D · Quiet luxury, managed end to end.
          </p>
        </aside>

        {/* Form panel */}
        <main className="flex items-center justify-center px-5 py-12 sm:px-8">
          <div className="w-full max-w-sm">
            <Link
              href="/"
              className="mb-10 inline-flex items-center gap-2 lg:hidden"
              aria-label="LuxStay 3D home"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <Buildings size={18} weight="fill" />
              </span>
              <span className="font-display text-lg font-semibold tracking-tight">LuxStay 3D</span>
            </Link>
            {children}
          </div>
        </main>
      </div>
    </Providers>
  );
}
