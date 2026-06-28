import 'server-only';
import { NextResponse, type NextRequest } from 'next/server';
import type { ZodType, ZodTypeDef } from 'zod';
import { connectToDatabase } from '@/server/db/mongoose';
import { ApiError } from '@/server/utils/api-error';
import { fail } from '@/server/http/respond';
import { AuditRecorder, type AuthUser, type RouteCtx } from '@/server/http/context';
import { readAccessToken } from '@/server/auth/cookies';
import { verifyAccessToken } from '@/server/auth/jwt';
import { hasPermission, type PermissionAction, type PermissionModule } from '@/lib/constants';
import { checkRateLimit, type RateLimitOptions } from '@/server/http/rate-limit';
import { flushAuditDrafts } from '@/server/modules/audit/audit.service';

type NextRouteParams = { params: Record<string, string> };

interface RouteConfig<TBody, TQuery, TParams> {
  /** `true` requires a valid session; `'optional'` resolves the user if present. */
  auth?: boolean | 'optional';
  /** RBAC guard, e.g. `['rooms', 'edit']`. Implies `auth: true`. */
  permission?: [PermissionModule, PermissionAction];
  // `any` input lets schemas with `.default()`/`.catch()` (input ≠ output) pass.
  bodySchema?: ZodType<TBody, ZodTypeDef, any>;
  querySchema?: ZodType<TQuery, ZodTypeDef, any>;
  paramsSchema?: ZodType<TParams, ZodTypeDef, any>;
  rateLimit?: Omit<RateLimitOptions, 'key'> & { key: string };
  /** Default module/action for audit entries recorded by the handler. */
  audit?: { module: string; action: string };
  handler: (ctx: RouteCtx<TBody, TQuery, TParams>) => Promise<NextResponse | Response>;
}

function clientIp(req: NextRequest): string {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0]!.trim();
  return req.headers.get('x-real-ip') ?? '127.0.0.1';
}

function defaultActionFor(method: string): string {
  switch (method) {
    case 'POST':
      return 'create';
    case 'PUT':
    case 'PATCH':
      return 'update';
    case 'DELETE':
      return 'delete';
    default:
      return 'view';
  }
}

async function resolveUser(req: NextRequest): Promise<AuthUser | null> {
  const token = readAccessToken();
  if (!token) return null;
  try {
    const payload = verifyAccessToken(token);
    return {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      role: payload.role,
      permissions: payload.permissions,
      twoFactorEnabled: payload.twoFactorEnabled,
      avatarUrl: payload.avatarUrl,
    };
  } catch {
    return null;
  }
}

function searchParamsToObject(req: NextRequest): Record<string, string> {
  const out: Record<string, string> = {};
  req.nextUrl.searchParams.forEach((value, key) => {
    out[key] = value;
  });
  return out;
}

/**
 * Wraps a route handler with the full cross-cutting middleware chain:
 * DB connect → validate (params/query/body) → auth → RBAC → rate-limit →
 * handler → audit flush → centralized error envelope.
 */
export function defineRoute<TBody = unknown, TQuery = unknown, TParams = unknown>(
  config: RouteConfig<TBody, TQuery, TParams>,
) {
  return async function routeHandler(
    req: NextRequest,
    ctx?: NextRouteParams,
  ): Promise<NextResponse | Response> {
    const audit = new AuditRecorder();
    try {
      await connectToDatabase();

      // Rate limiting (e.g. login throttle)
      if (config.rateLimit) {
        const result = checkRateLimit(clientIp(req), config.rateLimit);
        if (!result.allowed) {
          return NextResponse.json(
            {
              success: false,
              message: 'Too many requests, please slow down',
              code: 'RATE_LIMITED',
            },
            { status: 429, headers: { 'Retry-After': String(result.retryAfterSec) } },
          );
        }
      }

      // Validate params
      let params = (ctx?.params ?? {}) as TParams;
      if (config.paramsSchema) params = config.paramsSchema.parse(ctx?.params ?? {});

      // Validate query
      let query = searchParamsToObject(req) as TQuery;
      if (config.querySchema) query = config.querySchema.parse(searchParamsToObject(req));

      // Validate body (JSON only; multipart routes omit bodySchema and read formData themselves)
      let body = undefined as TBody;
      if (config.bodySchema) {
        let raw: unknown = {};
        try {
          raw = await req.json();
        } catch {
          raw = {};
        }
        body = config.bodySchema.parse(raw);
      }

      // Auth + RBAC
      const requireAuth = config.auth === true || Boolean(config.permission);
      const user = config.auth === false ? null : await resolveUser(req);
      if (requireAuth && !user) throw ApiError.unauthorized();
      if (config.permission && user) {
        const [module, action] = config.permission;
        if (!hasPermission(user.permissions, module, action)) {
          throw ApiError.forbidden(`Missing permission: ${module}:${action}`);
        }
      }

      const routeCtx: RouteCtx<TBody, TQuery, TParams> = {
        req,
        user,
        body,
        query,
        params,
        ip: clientIp(req),
        userAgent: req.headers.get('user-agent') ?? '',
        audit,
      };

      const response = await config.handler(routeCtx);

      // Flush audit on successful mutation
      const drafts = audit.drain();
      if (drafts.length > 0 && response.status < 400) {
        await flushAuditDrafts(
          drafts,
          user,
          {
            ip: routeCtx.ip,
            userAgent: routeCtx.userAgent,
            method: req.method,
            path: req.nextUrl.pathname,
          },
          config.audit ?? { module: 'general', action: defaultActionFor(req.method) },
        );
      }

      return response;
    } catch (error) {
      return fail(error);
    }
  };
}
