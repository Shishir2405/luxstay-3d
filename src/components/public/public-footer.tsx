import Link from 'next/link';
import { Buildings, InstagramLogo, XLogo, FacebookLogo } from '@phosphor-icons/react/dist/ssr';

const COLUMNS = [
  {
    title: 'Stay',
    links: [
      { label: 'Rooms & Suites', href: '/rooms' },
      { label: 'Offers', href: '/offers' },
      { label: 'Gift a stay', href: '/gift' },
    ],
  },
  {
    title: 'Experience',
    links: [
      { label: '3D Tour', href: '/tour' },
      { label: 'Bar & Lounge', href: '/bar' },
      { label: 'Events', href: '/events' },
    ],
  },
  {
    title: 'Property',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Contact', href: '/contact' },
      { label: 'Careers', href: '/careers' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy', href: '/privacy' },
      { label: 'Terms', href: '/terms' },
      { label: 'Cancellation policy', href: '/policies/cancellation' },
    ],
  },
];

export function PublicFooter() {
  return (
    <footer className="border-t border-border/60 bg-surface-sunken/40">
      <div className="container py-14">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div className="max-w-xs">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <Buildings size={18} weight="fill" />
              </span>
              <span className="font-display text-lg font-semibold tracking-tight">LuxStay 3D</span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              An immersive hotel & bar where every guest walks the property in 3D before they book.
            </p>
            <div className="mt-5 flex gap-2">
              {[InstagramLogo, XLogo, FacebookLogo].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/70 text-muted-foreground transition-colors hover:border-border hover:text-foreground"
                  aria-label="Social link"
                >
                  <Icon size={17} />
                </a>
              ))}
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {col.title}
              </h4>
              <ul className="mt-4 flex flex-col gap-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-foreground/80 transition-colors hover:text-accent"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-border/60 pt-6 text-sm text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} LuxStay 3D. All rights reserved.</p>
          <p>Crafted for the modern hospitality experience.</p>
        </div>
      </div>
    </footer>
  );
}
