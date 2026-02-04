import { z } from 'zod';

const envSchema = z.object({
  TENCENT_COS_SECRET_ID: z.string().min(1),
  TENCENT_COS_SECRET_KEY: z.string().min(1),
  TENCENT_COS_BUCKET: z.string().min(1),
  TENCENT_COS_REGION: z.string().min(1),
  SILICONFLOW_KEY: z.string().min(1),
  BRIA_API_KEY: z.string().min(1),
  COS_LIFECYCLE_CONFIGURED: z.string().optional(), // Used to prevent repeated lifecycle configuration
});

export const env = envSchema.parse({
  TENCENT_COS_SECRET_ID: process.env.TENCENT_COS_SECRET_ID,
  TENCENT_COS_SECRET_KEY: process.env.TENCENT_COS_SECRET_KEY,
  TENCENT_COS_BUCKET: process.env.TENCENT_COS_BUCKET,
  TENCENT_COS_REGION: process.env.TENCENT_COS_REGION,
  SILICONFLOW_KEY: process.env.SILICONFLOW_KEY,
  BRIA_API_KEY: process.env.BRIA_API_KEY,
  COS_LIFECYCLE_CONFIGURED: process.env.COS_LIFECYCLE_CONFIGURED,
});

// Configure COS bucket lifecycle rules once on startup if the environment variable is set
if (env.COS_LIFECYCLE_CONFIGURED === 'true') {
  import("@/lib/services/cos").then(({ configureBucketLifecycle }) => {
    configureBucketLifecycle().catch(console.error);
  });
}
