/**
 * Compatibility re-export. The canonical API contract types live in
 * `@/lib/types` (shared client/server). This shim keeps `@/types/api` imports
 * working and exposes `PageMeta` as an alias of `PaginationMeta`.
 */
export type {
  ApiSuccess,
  ApiErrorBody,
  FieldError,
  PaginationMeta,
  PaginationMeta as PageMeta,
  Paginated,
  AuthUser,
  AuditLogEntry,
} from '@/lib/types';
