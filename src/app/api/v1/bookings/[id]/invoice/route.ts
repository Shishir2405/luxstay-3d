import { z } from 'zod';
import { defineRoute } from '@/server/http/define-route';
import { bookingService } from '@/server/modules/bookings/booking.service';
import { renderInvoiceHtml } from '@/server/modules/invoices/invoice.service';
import { ApiError } from '@/server/utils/api-error';
import { objectIdSchema } from '@/lib/validators/common';
import { hasPermission } from '@/lib/constants';

export const runtime = 'nodejs';

const paramsSchema = z.object({ id: objectIdSchema });
type Params = z.infer<typeof paramsSchema>;

export const GET = defineRoute<unknown, unknown, Params>({
  auth: true,
  paramsSchema,
  handler: async (ctx) => {
    const booking = await bookingService.getById(ctx.params.id);
    const owns = Boolean(booking.user && ctx.user && String(booking.user) === ctx.user.id);
    const staff = Boolean(ctx.user && hasPermission(ctx.user.permissions, 'bookings', 'view'));
    if (!owns && !staff) throw ApiError.forbidden('You cannot view this invoice');

    const html = renderInvoiceHtml(booking);
    return new Response(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  },
});
