import { z } from 'zod';
import { defineRoute } from '@/server/http/define-route';
import { ok, okPaginated } from '@/server/http/respond';
import { roomUnitService } from '@/server/modules/rooms/room-unit.service';
import { roomUnitCreateSchema, roomUnitListQuerySchema } from '@/lib/validators/rooms';

export const runtime = 'nodejs';

type ListQuery = z.infer<typeof roomUnitListQuerySchema>;
type CreateBody = z.infer<typeof roomUnitCreateSchema>;

export const GET = defineRoute<unknown, ListQuery>({
  permission: ['rooms', 'view'],
  querySchema: roomUnitListQuerySchema,
  handler: async (ctx) => okPaginated(await roomUnitService.list(ctx.query)),
});

export const POST = defineRoute<CreateBody>({
  permission: ['rooms', 'create'],
  bodySchema: roomUnitCreateSchema,
  audit: { module: 'rooms', action: 'create' },
  handler: async (ctx) => {
    const created = await roomUnitService.create(ctx.body, ctx.user!.name, ctx.user!.id);
    ctx.audit.record({
      targetId: created.id,
      targetLabel: `Unit ${created.unitNumber}`,
      after: created.toJSON(),
    });
    return ok(created, { message: 'Room unit added', status: 201 });
  },
});
