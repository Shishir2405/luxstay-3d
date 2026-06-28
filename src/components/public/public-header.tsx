'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { List, X, Buildings } from '@phosphor-icons/react';
import { AnimatePresence, motion } from 'motion/react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils/cn';

const NAV = [
  { label: 'Rooms', href: '/rooms' },
  { label: 'Experiences', href: '/experiences' },
  { label: 'Bar & Lounge', href: '/bar' },
  { label: 'Events', href: '/events' },
  { label: '3D Tour', href: '/tour' },
];

export function PublicHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'sticky top-0 z-40 transition-colors duration-300',
        scrolled ? 'glass border-b border-border/60' : 'bg-transparent',
      )}
    >
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link href="/" className="inline-flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
            <Buildings size={18} weight="fill" />
          </span>
          <span className="font-display text-lg font-semibold tracking-tight">LuxStay 3D</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          <Link href="/login" className="hidden sm:block">
            <Button variant="ghost" size="sm">
              Sign in
            </Button>
          </Link>
          <Link href="/rooms" className="hidden sm:block">
            <Button variant="accent" size="sm">
              Book a stay
            </Button>
          </Link>
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-foreground md:hidden"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={20} weight="bold" /> : <List size={20} weight="bold" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="glass overflow-hidden border-b border-border/60 md:hidden"
          >
            <div className="container flex flex-col gap-1 py-3">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-md px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted/60"
                >
                  {item.label}
                </Link>
              ))}
              <div className="mt-2 flex gap-2 border-t border-border/60 pt-3">
                <Link href="/login" className="flex-1" onClick={() => setMenuOpen(false)}>
                  <Button variant="outline" size="sm" fullWidth>
                    Sign in
                  </Button>
                </Link>
                <Link href="/rooms" className="flex-1" onClick={() => setMenuOpen(false)}>
                  <Button variant="accent" size="sm" fullWidth>
                    Book a stay
                  </Button>
                </Link>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
