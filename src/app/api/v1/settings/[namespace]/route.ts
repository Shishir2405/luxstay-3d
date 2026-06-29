import { z } from 'zod';
import { defineRoute } from '@/server/http/define-route';
import { ok } from '@/server/http/respond';
import { ApiError } from '@/server/utils/api-error';
import {
  getSettings,
  updateSettings,
  SETTINGS_DEFAULTS,
  type SettingsNamespace,
} from '@/server/modules/settings/settings.service';
import { settingsUpdateSchema, type SettingsUpdateInput } from '@/lib/validators/settings';

export const runtime = 'nodejs';

const SECRET_KEY = /secret|key|password/i;

/** Replaces any value whose key looks like a secret with a masked placeholder. */
function maskSecrets(values: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(values)) {
    out[key] = SECRET_KEY.test(key) && value ? '••••' : value;
  }
  return out;
}

const KNOWN_NAMESPACES = Object.keys(SETTINGS_DEFAULTS) as SettingsNamespace[];

const paramsSchema = z.object({ namespace: z.string().trim().min(1).max(60) });
type Params = z.infer<typeof paramsSchema>;

function assertNamespace(value: string): SettingsNamespace {
  if (!(KNOWN_NAMESPACES as string[]).includes(value)) {
    throw ApiError.notFound('Settings namespace not found');
  }
  return value as SettingsNamespace;
}

export const GET = defineRoute<unknown, unknown, Params>({
  permission: ['settings', 'view'],
  paramsSchema,
  handler: async (ctx) => {
    const namespace = assertNamespace(ctx.params.namespace);
    const values = await getSettings(namespace);
    return ok({ namespace, values: maskSecrets(values) });
  },
});

export const PUT = defineRoute<SettingsUpdateInput, unknown, Params>({
  permission: ['settings', 'edit'],
  paramsSchema,
  bodySchema: settingsUpdateSchema,
  audit: { module: 'settings', action: 'update' },
  handler: async (ctx) => {
    const namespace = assertNamespace(ctx.params.namespace);
    const before = maskSecrets(await getSettings(namespace));
    const updated = await updateSettings(namespace, ctx.body.values);
    const after = maskSecrets(updated);
    ctx.audit.record({ targetId: namespace, targetLabel: namespace, before, after });
    return ok({ namespace, values: after }, { message: 'Settings updated' });
  },
});
