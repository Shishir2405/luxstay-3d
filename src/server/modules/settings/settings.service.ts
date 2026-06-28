import 'server-only';
import { settingsRepository } from './settings.repository';
import { EMAIL_PROVIDER } from '@/lib/constants';

/** Default values per namespace. Admin overrides are merged on top at read-time. */
export const SETTINGS_DEFAULTS = {
  site: {
    name: 'LuxStay 3D',
    tagline: 'Walk the property before you book',
    supportEmail: 'concierge@luxstay.example',
    phone: '+91 00000 00000',
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    maintenanceMode: false,
  },
  email: {
    activeProvider: EMAIL_PROVIDER.GMAIL_SMTP as string,
    fromName: 'LuxStay 3D',
    fromEmail: 'no-reply@luxstay.example',
    fallbackEnabled: true,
  },
  payments: {
    provider: 'razorpay',
    testMode: true,
    depositPercentage: 20, // % collected up-front; balance at check-in
    currency: 'INR',
  },
  booking: {
    requireManualApproval: false,
    cancellationWindowHours: 48,
    fullRefundWindowHours: 72,
    partialRefundPercentage: 50,
    maxRoomsPerBooking: 8,
  },
} as const;

export type SettingsNamespace = keyof typeof SETTINGS_DEFAULTS;

/** Reads a settings namespace with defaults merged. Never cached — reflects live admin changes. */
export async function getSettings<K extends SettingsNamespace>(
  namespace: K,
): Promise<(typeof SETTINGS_DEFAULTS)[K] & Record<string, unknown>> {
  const stored = await settingsRepository.get(namespace);
  return {
    ...SETTINGS_DEFAULTS[namespace],
    ...((stored?.values as Record<string, unknown>) ?? {}),
  } as (typeof SETTINGS_DEFAULTS)[K] & Record<string, unknown>;
}

export async function updateSettings(
  namespace: SettingsNamespace,
  patch: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const current = await getSettings(namespace);
  const merged = { ...current, ...patch };
  await settingsRepository.upsert(namespace, merged);
  return merged;
}
