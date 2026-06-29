import { defineRoute } from '@/server/http/define-route';
import { ok, okPaginated } from '@/server/http/respond';
import { tableService } from '@/server/modules/rsvp/table.service';
import {
  tableCreateSchema,
  tableListQuerySchema,
  type TableCreateInput,
  type TableListQuery,
} from '@/lib/validators/rsvp';

export const runtime = 'nodejs';

export const GET = defineRoute<unknown, TableListQuery>({
  permission: ['tables', 'view'],
  querySchema: tableListQuerySchema,
  handler: async (ctx) => okPaginated(await tableService.list(ctx.query)),
});

export const POST = defineRoute<TableCreateInput>({
  permission: ['tables', 'create'],
  bodySchema: tableCreateSchema,
  audit: { module: 'tables', action: 'create' },
  handler: async (ctx) => {
    const created = await tableService.create(ctx.body, ctx.user!.id);
    ctx.audit.record({ targetId: created.id, targetLabel: created.name, after: created.toJSON() });
    return ok(created, { message: 'Table created', status: 201 });
  },
});
