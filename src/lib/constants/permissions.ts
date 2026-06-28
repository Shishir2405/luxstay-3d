/**
 * RBAC permission model — the single source of truth shared between the API
 * route guards (server) and UI gating (client).
 *
 * A permission is a `"<module>:<action>"` string. SuperAdmin holds `"*"`.
 */

export const ROLES = {
  SUPER_ADMIN: 'SuperAdmin',
  HOTEL_MANAGER: 'HotelManager',
  BAR_MANAGER: 'BarManager',
  FRONT_DESK: 'FrontDesk',
  CONTENT_EDITOR: 'ContentEditor',
  GUEST: 'Guest',
} as const;

export type RoleName = (typeof ROLES)[keyof typeof ROLES];

export const ADMIN_ROLES: RoleName[] = [
  ROLES.SUPER_ADMIN,
  ROLES.HOTEL_MANAGER,
  ROLES.BAR_MANAGER,
  ROLES.FRONT_DESK,
  ROLES.CONTENT_EDITOR,
];

export const PERMISSION_MODULES = [
  'rooms',
  'roomTypes',
  'amenities',
  'pricing',
  'promoCodes',
  'bookings',
  'payments',
  'refunds',
  'invoices',
  'rsvps',
  'tables',
  'events',
  'menu',
  'offers',
  'content',
  'media',
  'banners',
  'seo',
  'reviews',
  'loyalty',
  'waitlist',
  'analytics',
  'reports',
  'users',
  'roles',
  'settings',
  'auditLogs',
] as const;

export type PermissionModule = (typeof PERMISSION_MODULES)[number];

export const PERMISSION_ACTIONS = [
  'view',
  'create',
  'edit',
  'delete',
  'import',
  'export',
  'manage', // elevated catch-all (check-in, refund, moderate, …)
] as const;

export type PermissionAction = (typeof PERMISSION_ACTIONS)[number];

export type Permission = `${PermissionModule}:${PermissionAction}` | '*';

const all = (modules: PermissionModule[]): Permission[] =>
  modules.flatMap((m) => PERMISSION_ACTIONS.map((a) => `${m}:${a}` as Permission));

const some = (module: PermissionModule, actions: PermissionAction[]): Permission[] =>
  actions.map((a) => `${module}:${a}` as Permission);

export const ROLE_PERMISSIONS: Record<RoleName, Permission[]> = {
  [ROLES.SUPER_ADMIN]: ['*'],

  [ROLES.HOTEL_MANAGER]: [
    ...all(['rooms', 'roomTypes', 'amenities', 'pricing', 'promoCodes', 'bookings', 'waitlist']),
    ...some('payments', ['view', 'export']),
    ...some('refunds', ['view', 'create', 'manage']),
    ...some('invoices', ['view', 'export']),
    ...some('reviews', ['view', 'edit', 'manage']),
    ...some('media', ['view', 'create', 'edit']),
    ...some('analytics', ['view', 'export']),
    ...some('reports', ['view', 'export']),
    ...some('auditLogs', ['view']),
  ],

  [ROLES.BAR_MANAGER]: [
    ...all(['rsvps', 'tables', 'events', 'menu', 'offers']),
    ...some('reviews', ['view', 'edit', 'manage']),
    ...some('media', ['view', 'create', 'edit']),
    ...some('analytics', ['view', 'export']),
    ...some('reports', ['view', 'export']),
  ],

  [ROLES.FRONT_DESK]: [
    ...some('bookings', ['view', 'edit', 'export', 'manage']),
    ...some('rooms', ['view']),
    ...some('roomTypes', ['view']),
    ...some('rsvps', ['view', 'edit', 'manage']),
    ...some('tables', ['view', 'edit']),
    ...some('invoices', ['view', 'export']),
    ...some('payments', ['view']),
  ],

  [ROLES.CONTENT_EDITOR]: [
    ...all(['content', 'media', 'banners', 'seo']),
    ...some('menu', ['view', 'edit']),
    ...some('offers', ['view', 'create', 'edit']),
    ...some('events', ['view']),
    ...some('reviews', ['view']),
  ],

  [ROLES.GUEST]: [], // Guests are authorized via resource ownership, not module RBAC.
};

/**
 * Does a permission set satisfy a `<module>:<action>` requirement?
 * `"*"` grants everything; `"<module>:manage"` implies all actions on that module.
 */
export function hasPermission(
  permissions: readonly Permission[] | undefined,
  module: PermissionModule,
  action: PermissionAction,
): boolean {
  if (!permissions || permissions.length === 0) return false;
  if (permissions.includes('*')) return true;
  if (permissions.includes(`${module}:manage` as Permission)) return true;
  return permissions.includes(`${module}:${action}` as Permission);
}

export function permissionsForRole(role: RoleName): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}
