import 'server-only';
import { createSchema, defineModel, type BaseFields, type HydratedDocument } from './base';

export interface SettingAttrs {
  namespace: string;
  values: Record<string, unknown>;
  description: string;
}

/**
 * Namespaced runtime configuration. Drives the email-provider toggle, Razorpay
 * keys (masked in UI), and site-wide config without redeploy. Read at use-time
 * (never cached at startup) so admin toggles take effect live.
 */
const settingSchema = createSchema<SettingAttrs & BaseFields>({
  namespace: { type: String, required: true, unique: true, index: true },
  values: { type: Object, default: {} },
  description: { type: String, default: '' },
});

export type SettingDoc = HydratedDocument<SettingAttrs & BaseFields>;

export const SettingModel = defineModel<SettingAttrs & BaseFields>('Setting', settingSchema);
