import { defineRoute } from '@/server/http/define-route';
import { ok } from '@/server/http/respond';
import { ApiError } from '@/server/utils/api-error';
import {
  parseCsv,
  parseXlsx,
  validateRows,
  commit,
  type RawRow,
} from '@/server/modules/rooms/room-import.service';

export const runtime = 'nodejs';

export const POST = defineRoute({
  permission: ['roomTypes', 'import'],
  audit: { module: 'roomTypes', action: 'import' },
  handler: async (ctx) => {
    const form = await ctx.req.formData();
    const file = form.get('file') as File | null;
    if (!file) throw ApiError.badRequest('No file uploaded');

    const name = file.name.toLowerCase();
    const isXlsx =
      name.endsWith('.xlsx') ||
      file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    const isCsv = name.endsWith('.csv') || file.type === 'text/csv';

    let rows: RawRow[];
    if (isXlsx) {
      rows = await parseXlsx(Buffer.from(await file.arrayBuffer()));
    } else if (isCsv) {
      rows = parseCsv(await file.text());
    } else {
      throw ApiError.badRequest('Unsupported file type — upload a .csv or .xlsx file');
    }

    const { valid, errors } = validateRows(rows);

    const preview = ctx.req.nextUrl.searchParams.get('preview') === 'true';
    if (preview) {
      return ok({ valid, errors }, { message: 'Import preview' });
    }

    const created = await commit(valid, ctx.user!.id);
    ctx.audit.record({
      summary: `Imported ${created} room types (${errors.length} rejected)`,
      metadata: { created, rejected: errors.length },
    });
    return ok({ created, errors }, { message: 'Room types imported' });
  },
});
