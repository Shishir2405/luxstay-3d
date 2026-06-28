import { defineRoute } from '@/server/http/define-route';
import { roomTypeService } from '@/server/modules/rooms/room-type.service';
import { toCsv, csvResponse, type CsvColumn } from '@/server/utils/csv';
import type { RoomTypeAttrs } from '@/server/models/room-type.model';

export const runtime = 'nodejs';

type Row = RoomTypeAttrs & { _id: unknown; createdAt: Date };

const COLUMNS: CsvColumn<Row>[] = [
  { header: 'id', value: (r) => String(r._id) },
  { header: 'name', value: (r) => r.name },
  { header: 'slug', value: (r) => r.slug },
  { header: 'basePrice', value: (r) => r.basePrice },
  { header: 'currency', value: (r) => r.currency },
  { header: 'maxAdults', value: (r) => r.maxAdults },
  { header: 'maxChildren', value: (r) => r.maxChildren },
  { header: 'bedType', value: (r) => r.bedType },
  { header: 'view', value: (r) => r.view },
  { header: 'sizeSqft', value: (r) => r.sizeSqft },
  { header: 'isActive', value: (r) => r.isActive },
  { header: 'isFeatured', value: (r) => r.isFeatured },
  { header: 'images', value: (r) => r.images?.length ?? 0 },
];

export const GET = defineRoute({
  permission: ['roomTypes', 'export'],
  audit: { module: 'roomTypes', action: 'export' },
  handler: async (ctx) => {
    const rows = (await roomTypeService.exportAll()) as unknown as Row[];
    ctx.audit.record({ summary: `Exported ${rows.length} room types to CSV` });
    return csvResponse(toCsv(rows, COLUMNS), `room-types-${rows.length}.csv`);
  },
});
