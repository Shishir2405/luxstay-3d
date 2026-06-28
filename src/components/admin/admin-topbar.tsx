'use client';

import { useRouter } from 'next/navigation';
import {
  List,
  MagnifyingGlass,
  Bell,
  SignOut,
  User as UserIcon,
  Gear,
} from '@phosphor-icons/react';
import { useAuthStore } from '@/store/auth';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { DropdownMenu } from '@/components/ui';
import { toast } from '@/store/toast';

function initials(name: string): string {
  return name
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function AdminTopbar({ onMenuClick }: { onMenuClick: () => void }) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  async function handleLogout() {
    await logout();
    toast.success('Signed out');
    router.replace('/login');
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border/60 bg-surface/80 px-4 backdrop-blur-md sm:px-6">
      <button
        type="button"
        onClick={onMenuClick}
        className="rounded-lg p-2 text-muted-foreground hover:bg-muted lg:hidden"
        aria-label="Open menu"
      >
        <List size={20} weight="bold" />
      </button>

      <div className="relative hidden max-w-sm flex-1 sm:block">
        <MagnifyingGlass
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <input
          type="search"
          placeholder="Search bookings, rooms, guests…"
          className="h-9 w-full rounded-lg border border-border bg-surface-sunken/50 pl-9 pr-3 text-sm placeholder:text-muted-foreground/70 focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50"
        />
      </div>

      <div className="ml-auto flex items-center gap-1">
        <button
          type="button"
          className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Notifications"
        >
          <Bell size={18} weight="bold" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-danger ring-2 ring-surface" />
        </button>
        <ThemeToggle />

        <DropdownMenu
          align="end"
          label={user?.email}
          trigger={
            <span className="ml-1 flex items-center gap-2 rounded-lg py-1 pl-1 pr-2 transition-colors hover:bg-muted">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                {user ? initials(user.name) : '··'}
              </span>
              <span className="hidden text-left sm:block">
                <span className="block text-sm font-medium leading-tight">
                  {user?.name ?? 'Account'}
                </span>
                <span className="block text-xs leading-tight text-muted-foreground">
                  {user?.role}
                </span>
              </span>
            </span>
          }
          items={[
            { label: 'My profile', icon: <UserIcon size={16} />, href: '/admin/profile' },
            { label: 'Settings', icon: <Gear size={16} />, href: '/admin/settings' },
            {
              label: 'Sign out',
              icon: <SignOut size={16} />,
              danger: true,
              separatorBefore: true,
              onSelect: handleLogout,
            },
          ]}
        />
      </div>
    </header>
  );
}
