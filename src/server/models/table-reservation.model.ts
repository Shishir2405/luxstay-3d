import 'server-only';
import mongoose, { Schema } from 'mongoose';
import { createSchema, defineModel, type BaseFields, type HydratedDocument } from './base';

const TABLE_RESERVATION_STATUS = ['Held', 'Confirmed', 'Seated', 'Released', 'Cancelled'] as const;
type TableReservationStatus = (typeof TABLE_RESERVATION_STATUS)[number];

export interface TableReservationAttrs {
  table: mongoose.Types.ObjectId;
  rsvp: mongoose.Types.ObjectId | null;
  event: mongoose.Types.ObjectId | null;
  date: Date;
  timeSlot: string;
  partySize: number;
  status: TableReservationStatus;
}

const tableReservationSchema = createSchema<TableReservationAttrs & BaseFields>({
  table: { type: Schema.Types.ObjectId, ref: 'TableLayout', required: true, index: true },
  rsvp: { type: Schema.Types.ObjectId, ref: 'Rsvp', default: null, index: true },
  event: { type: Schema.Types.ObjectId, ref: 'Event', default: null, index: true },
  date: { type: Date, required: true, index: true },
  timeSlot: { type: String, default: '', trim: true },
  partySize: { type: Number, default: 2, min: 1 },
  status: {
    type: String,
    enum: TABLE_RESERVATION_STATUS,
    default: 'Confirmed',
    index: true,
  },
});

export type TableReservationDoc = HydratedDocument<TableReservationAttrs & BaseFields>;
export const TableReservationModel = defineModel<TableReservationAttrs & BaseFields>(
  'TableReservation',
  tableReservationSchema,
);
