'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Buildings, X } from '@phosphor-icons/react';
import { NAV_GROUPS } from './admin-nav';
import { useAuthStore } from '@/store/auth';
import { cn } from '@/lib/utils/cn';

function isActive(pathname: string, href: string): boolean {
  if (href === '/admin') return pathname === '/admin';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const can = useAuthStore((s) => s.can);

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center justify-between gap-2 border-b border-border/60 px-5">
        <Link href="/admin" className="inline-flex items-center gap-2.5" onClick={onNavigate}>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
            <Buildings size={18} weight="fill" />
          </span>
          <span className="font-display text-base font-semibold tracking-tight">LuxStay</span>
        </Link>
        {onNavigate && (
          <button
            type="button"
            onClick={onNavigate}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted lg:hidden"
            aria-label="Close menu"
          >
            <X size={18} weight="bold" />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {NAV_GROUPS.map((group) => {
          const visible = group.items.filter(
            (item) => !item.permission || can(item.permission[0], item.permission[1]),
          );
          if (visible.length === 0) return null;
          return (
            <div key={group.title} className="mb-5">
              <p className="px-3 pb-1.5 text-[0.6875rem] font-semibold uppercase tracking-wider text-muted-foreground/70">
                {group.title}
              </p>
              <ul className="flex flex-col gap-0.5">
                {visible.map((item) => {
                  const active = isActive(pathname, item.href);
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onNavigate}
                        aria-current={active ? 'page' : undefined}
                        className={cn(
                          'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                          active
                            ? 'bg-accent/12 text-accent-foreground'
                            : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
                        )}
                      >
                        <Icon
                          size={18}
                          weight={active ? 'fill' : 'regular'}
                          className={active ? 'text-accent' : ''}
                        />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>
    </div>
  );
}
