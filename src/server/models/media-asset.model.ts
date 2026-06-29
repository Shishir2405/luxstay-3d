import 'server-only';
import { createSchema, defineModel, type BaseFields, type HydratedDocument } from './base';

const MEDIA_TYPE = ['image', 'video'] as const;

export interface MediaAssetAttrs {
  url: string;
  type: (typeof MEDIA_TYPE)[number];
  alt: string;
  title: string;
  /** Logical folder/grouping, e.g. 'rooms', 'banners'. */
  folder: string;
  sizeBytes: number;
  width: number;
  height: number;
}

const mediaAssetSchema = createSchema<MediaAssetAttrs & BaseFields>({
  url: { type: String, required: true, trim: true },
  type: { type: String, enum: MEDIA_TYPE, default: 'image', index: true },
  alt: { type: String, default: '', trim: true },
  title: { type: String, default: '', trim: true },
  folder: { type: String, default: 'general', index: true },
  sizeBytes: { type: Number, default: 0 },
  width: { type: Number, default: 0 },
  height: { type: Number, default: 0 },
});

export type MediaAssetDoc = HydratedDocument<MediaAssetAttrs & BaseFields>;
export const MediaAssetModel = defineModel<MediaAssetAttrs & BaseFields>(
  'MediaAsset',
  mediaAssetSchema,
);
