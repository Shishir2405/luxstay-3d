import 'server-only';
import { createSchema, defineModel, type BaseFields, type HydratedDocument } from './base';

export interface NotificationTemplateAttrs {
  /** Stable lookup key, e.g. 'booking.confirmation'. */
  key: string;
  name: string;
  subject: string;
  html: string;
  channel: 'email' | 'sms';
  isActive: boolean;
}

const notificationTemplateSchema = createSchema<NotificationTemplateAttrs & BaseFields>({
  key: { type: String, required: true, unique: true, index: true, trim: true },
  name: { type: String, required: true, trim: true },
  subject: { type: String, default: '' },
  html: { type: String, default: '' },
  channel: { type: String, enum: ['email', 'sms'], default: 'email', index: true },
  isActive: { type: Boolean, default: true },
});

export type NotificationTemplateDoc = HydratedDocument<NotificationTemplateAttrs & BaseFields>;
export const NotificationTemplateModel = defineModel<NotificationTemplateAttrs & BaseFields>(
  'NotificationTemplate',
  notificationTemplateSchema,
);
