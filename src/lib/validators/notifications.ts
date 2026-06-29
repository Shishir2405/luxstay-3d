import { z } from 'zod';
import { paginationQuerySchema } from './common';

const channelSchema = z.enum(['email', 'sms']);

/** Create payload for a notification template. */
export const templateCreateSchema = z.object({
  key: z
    .string()
    .trim()
    .min(2)
    .max(80)
    .regex(/^[A-Za-z0-9._-]+$/, 'Letters, numbers, dot, dash and underscore only'),
  name: z.string().trim().min(2).max(120),
  subject: z.string().trim().max(200).default(''),
  html: z.string().max(50000).default(''),
  channel: channelSchema.default('email'),
  isActive: z.boolean().default(true),
});
export type TemplateCreateInput = z.infer<typeof templateCreateSchema>;

/** Partial update; `key` is immutable post-create. */
export const templateUpdateSchema = templateCreateSchema.partial().omit({ key: true });
export type TemplateUpdateInput = z.infer<typeof templateUpdateSchema>;

/** List query: pagination + channel / active filters. */
export const templateListQuerySchema = paginationQuerySchema.extend({
  channel: channelSchema.optional(),
  isActive: z.enum(['true', 'false']).optional(),
});
export type TemplateListQuery = z.infer<typeof templateListQuerySchema>;
