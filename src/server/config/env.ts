import 'server-only';

/**
 * Centralized, typed access to environment configuration.
 *
 * Returns the env value, or the provided fallback (default '') when unset. We do
 * NOT throw here: `env` is evaluated at module-eval time (incl. during
 * `next build` page-data collection), so throwing would break builds. Features
 * that truly need a secret (Razorpay, email) validate it at the point of use and
 * surface a friendly runtime error instead.
 */
function read(key: string, fallback = ''): string {
  const value = process.env[key];
  return value && value.length > 0 ? value : fallback;
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
