import { z } from 'zod';

/** Request body to obtain a presigned upload URL for object storage. */
export const presignSchema = z.object({
  filename: z.string().trim().min(1).max(255),
  contentType: z.string().trim().min(1).max(160),
});
export type PresignInput = z.infer<typeof presignSchema>;
