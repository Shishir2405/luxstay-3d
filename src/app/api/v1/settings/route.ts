import { defineRoute } from '@/server/http/define-route';
import { ok } from '@/server/http/respond';
import {
  getSettings,
  SETTINGS_DEFAULTS,
  type SettingsNamespace,
} from '@/server/modules/settings/settings.service';

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

/** Returns every known settings namespace with secret values masked. */
export const GET = defineRoute({
  permission: ['settings', 'view'],
  handler: async () => {
    const namespaces = await Promise.all(
      KNOWN_NAMESPACES.map(async (namespace) => ({
        namespace,
        values: maskSecrets(await getSettings(namespace)),
      })),
    );
    return ok(namespaces, { message: 'Settings loaded' });
  },
});
