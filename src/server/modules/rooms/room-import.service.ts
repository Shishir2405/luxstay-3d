import 'server-only';
import Papa from 'papaparse';
import ExcelJS from 'exceljs';
import { RoomTypeModel } from '@/server/models/room-type.model';
import { roomTypeRepository } from './room-type.repository';
import { uniqueSlug } from '@/server/utils/slug';
import { roomTypeCreateSchema, type RoomTypeCreateInput } from '@/lib/validators/rooms';

/** A raw row parsed from CSV/XLSX before validation (all values stringly typed). */
export type RawRow = Record<string, unknown>;

export interface RowError {
  row: number;
  message: string;
}

export interface ValidationResult {
  valid: RoomTypeCreateInput[];
  errors: RowError[];
}

/** Parses CSV text (with a header row) into raw object rows. */
export function parseCsv(text: string): RawRow[] {
  const result = Papa.parse<RawRow>(text, {
    header: true,
    skipEmptyLines: true,
  });
  return result.data ?? [];
}

/** Parses the first sheet of an XLSX buffer (header row → object rows). */
export async function parseXlsx(buf: Buffer): Promise<RawRow[]> {
  const workbook = new ExcelJS.Workbook();
  // exceljs declares its own ambient `Buffer extends ArrayBuffer`, which is not
  // structurally compatible with Node's Buffer; cast at the call boundary.
  await workbook.xlsx.load(buf as unknown as ArrayBuffer);
  const sheet = workbook.worksheets[0];
  if (!sheet) return [];

  const headerRow = sheet.getRow(1);
  const headers: string[] = [];
  headerRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
    headers[colNumber] = String(cell.value ?? '').trim();
  });

  const rows: RawRow[] = [];
  sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber === 1) return; // skip header
    const obj: RawRow = {};
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      const key = headers[colNumber];
      if (!key) return;
      const raw = cell.value;
      obj[key] =
        raw && typeof raw === 'object' && 'text' in raw ? (raw as { text: unknown }).text : raw;
    });
    rows.push(obj);
  });
  return rows;
}

const NUMERIC_FIELDS = [
  'basePrice',
  'maxAdults',
  'maxChildren',
  'extraBeds',
  'extraBedPrice',
  'sizeSqft',
  'sortOrder',
] as const;

const BOOLEAN_FIELDS = ['isActive', 'isFeatured'] as const;

function toNumber(value: unknown): unknown {
  if (value === '' || value === null || value === undefined) return undefined;
  const n = Number(value);
  return Number.isNaN(n) ? value : n;
}

function toBoolean(value: unknown): unknown {
  if (value === '' || value === null || value === undefined) return undefined;
  if (typeof value === 'boolean') return value;
  const s = String(value).trim().toLowerCase();
  if (s === 'true' || s === '1' || s === 'yes') return true;
  if (s === 'false' || s === '0' || s === 'no') return false;
  return value;
}

/** Coerces a raw row's primitive columns so the create schema can validate it. */
function coerceRow(row: RawRow): RawRow {
  const out: RawRow = { ...row };
  for (const field of NUMERIC_FIELDS) {
    if (field in out) out[field] = toNumber(out[field]);
  }
  for (const field of BOOLEAN_FIELDS) {
    if (field in out) out[field] = toBoolean(out[field]);
  }
  // Drop empty strings so schema defaults apply.
  for (const key of Object.keys(out)) {
    if (out[key] === '') delete out[key];
  }
  return out;
}

/** Validates each raw row against the room type create schema. */
export function validateRows(rows: RawRow[]): ValidationResult {
  const valid: RoomTypeCreateInput[] = [];
  const errors: RowError[] = [];

  rows.forEach((row, index) => {
    const parsed = roomTypeCreateSchema.safeParse(coerceRow(row));
    if (parsed.success) {
      valid.push(parsed.data);
    } else {
      const message = parsed.error.issues
        .map((issue) => `${issue.path.join('.') || '_root'}: ${issue.message}`)
        .join('; ');
      errors.push({ row: index + 1, message });
    }
  });

  return { valid, errors };
}

/** Persists validated rows, assigning a unique slug to each. */
export async function commit(
  validRows: RoomTypeCreateInput[],
  actorId: string | null,
): Promise<number> {
  let created = 0;
  for (const input of validRows) {
    const slug = await uniqueSlug(input.name, (s) => roomTypeRepository.slugExists(s));
    await RoomTypeModel.create({ ...input, slug, createdBy: actorId });
    created += 1;
  }
  return created;
}
