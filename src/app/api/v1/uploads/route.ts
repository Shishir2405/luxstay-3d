import { randomBytes } from 'node:crypto';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { defineRoute } from '@/server/http/define-route';
import { ok } from '@/server/http/respond';
import { ApiError } from '@/server/utils/api-error';
import { presignSchema, type PresignInput } from '@/lib/validators/uploads';

export const runtime = 'nodejs';

const PRESIGN_TTL_SEC = 300; // upload URL valid for 5 minutes

/** Builds a collision-resistant, path-safe object key under `uploads/`. */
function buildKey(filename: string): string {
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '-').replace(/-+/g, '-');
  return `uploads/${Date.now()}-${randomBytes(6).toString('hex')}-${safeName}`;
}

export const POST = defineRoute<PresignInput>({
  permission: ['media', 'create'],
  bodySchema: presignSchema,
  audit: { module: 'media', action: 'create' },
  handler: async (ctx) => {
    const {
      S3_ENDPOINT,
      S3_REGION,
      S3_BUCKET,
      S3_ACCESS_KEY_ID,
      S3_SECRET_ACCESS_KEY,
      S3_PUBLIC_BASE_URL,
    } = process.env;

    if (!S3_BUCKET || !S3_ACCESS_KEY_ID || !S3_SECRET_ACCESS_KEY) {
      throw ApiError.badRequest('Object storage not configured');
    }

    const client = new S3Client({
      region: S3_REGION ?? 'auto',
      ...(S3_ENDPOINT ? { endpoint: S3_ENDPOINT, forcePathStyle: true } : {}),
      credentials: {
        accessKeyId: S3_ACCESS_KEY_ID,
        secretAccessKey: S3_SECRET_ACCESS_KEY,
      },
    });

    const key = buildKey(ctx.body.filename);
    const command = new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      ContentType: ctx.body.contentType,
    });
    const uploadUrl = await getSignedUrl(client, command, { expiresIn: PRESIGN_TTL_SEC });

    const base = (S3_PUBLIC_BASE_URL ?? '').replace(/\/+$/, '');
    const publicUrl = base ? `${base}/${key}` : key;

    ctx.audit.record({ summary: `Presigned upload for ${key}`, metadata: { key } });
    return ok({ uploadUrl, key, publicUrl }, { message: 'Upload URL created' });
  },
});
