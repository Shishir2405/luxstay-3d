import 'server-only';

/**
 * Minimal structured logger. Kept dependency-free; swap for pino/winston later
 * without touching call sites.
 */
type Level = 'debug' | 'info' | 'warn' | 'error';

const COLORS: Record<Level, string> = {
  debug: '\x1b[90m',
  info: '\x1b[36m',
  warn: '\x1b[33m',
  error: '\x1b[31m',
};
const RESET = '\x1b[0m';

function emit(level: Level, scope: string, msg: string, meta?: unknown) {
  if (level === 'debug' && process.env.NODE_ENV === 'production') return;
  const prefix = `${COLORS[level]}[${level}]${RESET} \x1b[2m${scope}\x1b[0m`;
  const line = `${prefix} ${msg}`;
  const fn = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
  if (meta !== undefined) fn(line, meta);
  else fn(line);
}

export const logger = {
  debug: (scope: string, msg: string, meta?: unknown) => emit('debug', scope, msg, meta),
  info: (scope: string, msg: string, meta?: unknown) => emit('info', scope, msg, meta),
  warn: (scope: string, msg: string, meta?: unknown) => emit('warn', scope, msg, meta),
  error: (scope: string, msg: string, meta?: unknown) => emit('error', scope, msg, meta),
};
