import {
  SquaresFour,
  Bed,
  CalendarBlank,
  CalendarCheck,
  CreditCard,
  Receipt,
  ArrowsClockwise,
  Confetti,
  Wine,
  Champagne,
  Armchair,
  ForkKnife,
  Tag,
  Users,
  Star,
  Medal,
  Hourglass,
  FileText,
  Images,
  Flag,
  MagnifyingGlass,
  ChartLine,
  ChartBar,
  UserGear,
  Gear,
  ClipboardText,
  Percent,
  Sliders,
  type Icon,
} from '@phosphor-icons/react';
import type { PermissionAction, PermissionModule } from '@/lib/constants';

export interface NavItem {
  label: string;
  href: string;
  icon: Icon;
  /** Hide unless the user holds this `[module, action]`. Omit for always-visible. */
  permission?: [PermissionModule, PermissionAction];
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    title: 'Overview',
    items: [{ label: 'Dashboard', href: '/admin', icon: SquaresFour }],
  },
  {
    title: 'Inventory',
    items: [
      {
        label: 'Rooms & Types',
        href: '/admin/rooms',
        icon: Bed,
        permission: ['roomTypes', 'view'],
      },
      {
        label: 'Availability',
        href: '/admin/availability',
        icon: CalendarBlank,
        permission: ['rooms', 'view'],
      },
      { label: 'Pricing', href: '/admin/pricing', icon: Sliders, permission: ['pricing', 'view'] },
      {
        label: 'Amenities',
        href: '/admin/amenities',
        icon: Armchair,
        permission: ['amenities', 'view'],
      },
      {
        label: 'Promo codes',
        href: '/admin/promo-codes',
        icon: Percent,
        permission: ['promoCodes', 'view'],
      },
    ],
  },
  {
    title: 'Bookings',
    items: [
      {
        label: 'Bookings',
        href: '/admin/bookings',
        icon: CalendarCheck,
        permission: ['bookings', 'view'],
      },
      {
        label: 'Waitlist',
        href: '/admin/waitlist',
        icon: Hourglass,
        permission: ['waitlist', 'view'],
      },
      {
        label: 'Payments',
        href: '/admin/payments',
        icon: CreditCard,
        permission: ['payments', 'view'],
      },
      {
        label: 'Refunds',
        href: '/admin/refunds',
        icon: ArrowsClockwise,
        permission: ['refunds', 'view'],
      },
      {
        label: 'Invoices',
        href: '/admin/invoices',
        icon: Receipt,
        permission: ['invoices', 'view'],
      },
    ],
  },
  {
    title: 'Bar & Events',
    items: [
      { label: 'RSVPs', href: '/admin/rsvps', icon: Champagne, permission: ['rsvps', 'view'] },
      { label: 'Tables', href: '/admin/tables', icon: Wine, permission: ['tables', 'view'] },
      { label: 'Events', href: '/admin/events', icon: Confetti, permission: ['events', 'view'] },
      { label: 'Menu', href: '/admin/menu', icon: ForkKnife, permission: ['menu', 'view'] },
      { label: 'Offers', href: '/admin/offers', icon: Tag, permission: ['offers', 'view'] },
    ],
  },
  {
    title: 'Guests',
    items: [
      { label: 'Customers', href: '/admin/customers', icon: Users, permission: ['users', 'view'] },
      { label: 'Reviews', href: '/admin/reviews', icon: Star, permission: ['reviews', 'view'] },
      { label: 'Loyalty', href: '/admin/loyalty', icon: Medal, permission: ['loyalty', 'view'] },
    ],
  },
  {
    title: 'Content',
    items: [
      { label: 'Pages', href: '/admin/content', icon: FileText, permission: ['content', 'view'] },
      { label: 'Media library', href: '/admin/media', icon: Images, permission: ['media', 'view'] },
      { label: 'Banners', href: '/admin/banners', icon: Flag, permission: ['banners', 'view'] },
      { label: 'SEO', href: '/admin/seo', icon: MagnifyingGlass, permission: ['seo', 'view'] },
    ],
  },
  {
    title: 'Insights',
    items: [
      {
        label: 'Analytics',
        href: '/admin/analytics',
        icon: ChartLine,
        permission: ['analytics', 'view'],
      },
      { label: 'Reports', href: '/admin/reports', icon: ChartBar, permission: ['reports', 'view'] },
    ],
  },
  {
    title: 'System',
    items: [
      {
        label: 'Users & Roles',
        href: '/admin/users',
        icon: UserGear,
        permission: ['users', 'view'],
      },
      {
        label: 'Audit log',
        href: '/admin/audit',
        icon: ClipboardText,
        permission: ['auditLogs', 'view'],
      },
      { label: 'Settings', href: '/admin/settings', icon: Gear, permission: ['settings', 'view'] },
    ],
  },
];
