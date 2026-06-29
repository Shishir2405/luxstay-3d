import 'server-only';
import { createSchema, defineModel, type BaseFields, type HydratedDocument } from './base';

export interface SeoMetaAttrs {
  /** Route path the metadata applies to, e.g. '/rooms', '/about'. */
  path: string;
  title: string;
  description: string;
  ogImage: string;
  locale: string;
}

const seoMetaSchema = createSchema<SeoMetaAttrs & BaseFields>({
  path: { type: String, required: true, unique: true, index: true, trim: true },
  title: { type: String, default: '', trim: true },
  description: { type: String, default: '' },
  ogImage: { type: String, default: '', trim: true },
  locale: { type: String, default: 'en', index: true },
});

export type SeoMetaDoc = HydratedDocument<SeoMetaAttrs & BaseFields>;
export const SeoMetaModel = defineModel<SeoMetaAttrs & BaseFields>('SeoMeta', seoMetaSchema);
