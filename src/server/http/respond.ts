import 'server-only';
import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import type { FieldError, PaginationMeta, Paginated } from '@/lib/types';
import { ApiError } from '@/server/utils/api-error';
import { logger } from '@/server/utils/logger';

/** Success envelope: { success, message, data, meta? }. */
export function ok<T>(
  data: T,
  init: { message?: string; status?: number; meta?: PaginationMeta | Record<string, unknown> } = {},
) {
  return NextResponse.json(
    {
      success: true as const,
      message: init.message ?? 'OK',
      data,
      ...(init.meta ? { meta: init.meta } : {}),
    },
    { status: init.status ?? 200 },
  );
}

/** Paginated success envelope ({ data: items, meta }). */
export function okPaginated<T>(
  result: Paginated<T>,
  init: { message?: string; status?: number } = {},
) {
  return NextResponse.json(
    {
      success: true as const,
      message: init.message ?? 'OK',
      data: result.items,
      meta: result.meta,
    },
    { status: init.status ?? 200 },
  );
}

/** Builds the standard pagination meta block. */
export function buildPaginationMeta(page: number, limit: number, total: number): PaginationMeta {
  const totalPages = limit > 0 ? Math.ceil(total / limit) : 0;
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

function zodToFieldErrors(error: ZodError): FieldError[] {
  return error.issues.map((issue) => ({
    field: issue.path.join('.') || '_root',
    message: issue.message,
  }));
}

/** Translates any thrown error into the consistent error envelope. */
export function fail(error: unknown) {
  if (error instanceof ApiError) {
    const errors = Array.isArray(error.details) ? (error.details as FieldError[]) : undefined;
    return NextResponse.json(
      {
        success: false as const,
        message: error.message,
        code: error.code,
        ...(errors ? { errors } : {}),
      },
      { status: error.status },
    );
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        success: false as const,
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        errors: zodToFieldErrors(error),
      },
      { status: 422 },
    );
  }

  // Mongoose duplicate-key → conflict
  if (typeof error === 'object' && error !== null && (error as { code?: number }).code === 11000) {
    return NextResponse.json(
      {
        success: false as const,
        message: 'A record with these details already exists',
        code: 'CONFLICT',
      },
      { status: 409 },
    );
  }

  logger.error('http', 'unhandled error', error);
  return NextResponse.json(
    { success: false as const, message: 'Something went wrong', code: 'INTERNAL' },
    { status: 500 },
  );
}
