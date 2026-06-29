import 'server-only';
import { createSchema, defineModel, type BaseFields, type HydratedDocument } from './base';

export interface ContentBlockAttrs {
  /** Stable identifier, e.g. 'about', 'faq', 'policy'. */
  key: string;
  title: string;
  /** Rich text / markdown body. */
  body: string;
  /** BCP-47 locale; structured to support future i18n. */
  locale: string;
  isPublished: boolean;
}

const contentBlockSchema = createSchema<ContentBlockAttrs & BaseFields>({
  key: { type: String, required: true, trim: true, index: true },
  title: { type: String, default: '', trim: true },
  body: { type: String, default: '' },
  locale: { type: String, default: 'en', index: true },
  isPublished: { type: Boolean, default: false, index: true },
});

// A content block is unique per (key, locale) to support i18n variants.
contentBlockSchema.index({ key: 1, locale: 1 }, { unique: true });

export type ContentBlockDoc = HydratedDocument<ContentBlockAttrs & BaseFields>;
export const ContentBlockModel = defineModel<ContentBlockAttrs & BaseFields>(
  'ContentBlock',
  contentBlockSchema,
);
