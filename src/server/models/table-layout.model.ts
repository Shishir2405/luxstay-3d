import 'server-only';
import { createSchema, defineModel, type BaseFields, type HydratedDocument } from './base';

const TABLE_SHAPE = ['round', 'square', 'rectangle', 'booth'] as const;
type TableShape = (typeof TABLE_SHAPE)[number];

export interface TableLayoutAttrs {
  name: string;
  capacity: number;
  zone: string;
  x: number;
  y: number;
  shape: TableShape;
  isActive: boolean;
}

const tableLayoutSchema = createSchema<TableLayoutAttrs & BaseFields>({
  name: { type: String, required: true, trim: true },
  capacity: { type: Number, default: 2, min: 1 },
  zone: { type: String, default: 'Main', trim: true, index: true },
  x: { type: Number, default: 0 },
  y: { type: Number, default: 0 },
  shape: { type: String, enum: TABLE_SHAPE, default: 'round' },
  isActive: { type: Boolean, default: true },
});

export type TableLayoutDoc = HydratedDocument<TableLayoutAttrs & BaseFields>;
export const TableLayoutModel = defineModel<TableLayoutAttrs & BaseFields>(
  'TableLayout',
  tableLayoutSchema,
);
