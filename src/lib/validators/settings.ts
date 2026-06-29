import { z } from 'zod';
import { paginationQuerySchema, isoDateSchema } from './common';
import { ROLES } from '@/lib/constants';

/* ── Settings ──────────────────────────────────────────────────────────── */
/** Settings values are an open key/value bag per namespace. */
export const settingsUpdateSchema = z.object({
  values: z.record(z.unknown()),
});
export type SettingsUpdateInput = z.infer<typeof settingsUpdateSchema>;

/* ── Users admin ───────────────────────────────────────────────────────── */
const roleSchema = z.nativeEnum(ROLES);

export const userCreateSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().toLowerCase().email().max(160),
  password: z.string().min(8).max(200),
  phone: z.string().trim().max(40).default(''),
  role: roleSchema.default(ROLES.GUEST),
  isActive: z.boolean().default(true),
});
export type UserCreateInput = z.infer<typeof userCreateSchema>;

export const userUpdateSchema = z.object({
  role: roleSchema.optional(),
  isActive: z.boolean().optional(),
});
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;

export const userListQuerySchema = paginationQuerySchema.extend({
  role: roleSchema.optional(),
  isActive: z.enum(['true', 'false']).optional(),
});
export type UserListQuery = z.infer<typeof userListQuerySchema>;

/* ── Two-factor auth ───────────────────────────────────────────────────── */
export const twoFactorVerifySchema = z.object({
  token: z
    .string()
    .trim()
    .regex(/^\d{6}$/, 'Enter the 6-digit code'),
});
export type TwoFactorVerifyInput = z.infer<typeof twoFactorVerifySchema>;

/* ── Audit-log viewer ──────────────────────────────────────────────────── */
export const auditLogListQuerySchema = paginationQuerySchema.extend({
  module: z.string().trim().max(60).optional(),
  action: z.string().trim().max(60).optional(),
  actorId: z.string().trim().max(60).optional(),
  dateFrom: isoDateSchema.optional(),
  dateTo: isoDateSchema.optional(),
  format: z.enum(['json', 'csv']).optional(),
});
export type AuditLogListQuery = z.infer<typeof auditLogListQuerySchema>;
