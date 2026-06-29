import { z } from 'zod';
import { defineRoute } from '@/server/http/define-route';
import { ok } from '@/server/http/respond';
import { publicRoomsService } from '@/server/modules/rooms/public.service';

export const runtime = 'nodejs';

const paramsSchema = z.object({ slug: z.string().min(1).max(120) });
type Params = z.infer<typeof paramsSchema>;

export const GET = defineRoute<unknown, unknown, Params>({
  auth: false,
  paramsSchema,
  handler: async (ctx) => ok(await publicRoomsService.getActiveBySlug(ctx.params.slug)),
});
