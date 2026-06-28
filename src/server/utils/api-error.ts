import 'server-only';

/**
 * Typed application error. Thrown anywhere in the service/repository layers and
 * translated into a consistent HTTP envelope by `defineRoute`'s error handler.
 */
export type ErrorCode =
  | 'BAD_REQUEST'
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'RATE_LIMITED'
  | 'PAYMENT_REQUIRED'
  | 'UNPROCESSABLE'
  | 'INTERNAL';

const STATUS: Record<ErrorCode, number> = {
  BAD_REQUEST: 400,
  VALIDATION_ERROR: 422,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  RATE_LIMITED: 429,
  PAYMENT_REQUIRED: 402,
  UNPROCESSABLE: 422,
  INTERNAL: 500,
};

export class ApiError extends Error {
  readonly code: ErrorCode;
  readonly status: number;
  readonly details?: unknown;

  constructor(code: ErrorCode, message: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = STATUS[code];
    this.details = details;
  }

  static badRequest(msg = 'Bad request', details?: unknown) {
    return new ApiError('BAD_REQUEST', msg, details);
  }
  static validation(msg = 'Validation failed', details?: unknown) {
    return new ApiError('VALIDATION_ERROR', msg, details);
  }
  static unauthorized(msg = 'Authentication required') {
    return new ApiError('UNAUTHORIZED', msg);
  }
  static forbidden(msg = 'You do not have permission to perform this action') {
    return new ApiError('FORBIDDEN', msg);
  }
  static notFound(msg = 'Resource not found') {
    return new ApiError('NOT_FOUND', msg);
  }
  static conflict(msg = 'Resource conflict', details?: unknown) {
    return new ApiError('CONFLICT', msg, details);
  }
  static rateLimited(msg = 'Too many requests') {
    return new ApiError('RATE_LIMITED', msg);
  }
  static internal(msg = 'Something went wrong') {
    return new ApiError('INTERNAL', msg);
  }
}
