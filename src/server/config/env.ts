import 'server-only';

/**
 * Centralized, typed access to environment configuration.
 *
 * Required secrets fall back to clearly-marked dev defaults so the app still
 * boots locally without a full `.env.local`, while logging a warning. In
 * production (`NODE_ENV=production`) missing required secrets throw at startup.
 */
function read(key: string, fallback?: string): string {
  const value = process.env[key];
  if (value && value.length > 0) return value;
  if (fallback !== undefined) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`[env] Missing required environment variable: ${key}`);
    }
    return fallback;
  }
  return '';
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  isProd: process.env.NODE_ENV === 'production',
  appUrl: read('NEXT_PUBLIC_APP_URL', 'http://localhost:3000'),
  appName: read('NEXT_PUBLIC_APP_NAME', 'LuxStay 3D'),

  mongoUri: read('MONGODB_URI', 'mongodb://127.0.0.1:27017/luxstay'),
  mongoDbName: read('MONGODB_DB_NAME', 'luxstay'),

  jwt: {
    accessSecret: read('JWT_ACCESS_SECRET', 'dev-access-secret-change-me'),
    refreshSecret: read('JWT_REFRESH_SECRET', 'dev-refresh-secret-change-me'),
    accessTtl: read('JWT_ACCESS_TTL', '15m'),
    refreshTtl: read('JWT_REFRESH_TTL', '30d'),
    cookieDomain: read('AUTH_COOKIE_DOMAIN', 'localhost'),
  },

  redisUrl: read('REDIS_URL', 'redis://127.0.0.1:6379'),

  razorpay: {
    keyId: read('RAZORPAY_KEY_ID', ''),
    keySecret: read('RAZORPAY_KEY_SECRET', ''),
    webhookSecret: read('RAZORPAY_WEBHOOK_SECRET', ''),
  },

  seedAdmin: {
    email: read('SEED_ADMIN_EMAIL', 'admin@luxstay.example'),
    password: read('SEED_ADMIN_PASSWORD', 'ChangeMe!2026'),
    name: read('SEED_ADMIN_NAME', 'Property Owner'),
  },
} as const;

export type Env = typeof env;
