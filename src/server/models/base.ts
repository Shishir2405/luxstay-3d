import 'server-only';
import mongoose, { Schema, type SchemaDefinition, type Model } from 'mongoose';

export type { HydratedDocument } from 'mongoose';

/**
 * Audit/soft-delete fields present on every collection (per PRD §5).
 * `createdBy`/`updatedBy` reference the acting user; `isDeleted` powers soft
 * deletes so booking/history records are never physically removed.
 */
export interface BaseFields {
  createdBy?: mongoose.Types.ObjectId | null;
  updatedBy?: mongoose.Types.ObjectId | null;
  isDeleted: boolean;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const baseDefinition: SchemaDefinition = {
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  isDeleted: { type: Boolean, default: false, index: true },
  deletedAt: { type: Date, default: null },
};

/**
 * Builds a schema with the shared base fields, timestamps, and a normalized
 * JSON transform (`_id` → `id`, strips `__v`). Pass `definition` for your
 * domain fields and optional schema options.
 */
export function createSchema<T>(
  definition: SchemaDefinition,
  options: { timestamps?: boolean } = {},
): Schema<T> {
  const schema = new Schema(
    { ...definition, ...baseDefinition },
    {
      timestamps: options.timestamps ?? true,
      toJSON: {
        virtuals: true,
        versionKey: false,
        transform(_doc, ret: Record<string, unknown>) {
          ret.id = ret._id?.toString?.() ?? ret._id;
          delete ret._id;
          return ret;
        },
      },
      toObject: { virtuals: true, versionKey: false },
    },
  );
  return schema as unknown as Schema<T>;
}

/** Hot-reload-safe model factory (avoids Mongoose OverwriteModelError in dev). */
export function defineModel<T>(name: string, schema: Schema<T>): Model<T> {
  return (mongoose.models[name] as Model<T>) ?? mongoose.model<T>(name, schema);
}
