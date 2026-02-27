import { NextRequest, NextResponse } from 'next/server';
import COS from 'cos-nodejs-sdk-v5';
import { env } from '@/lib/env';
import { checkRateLimit, presignRateLimit } from '@/lib/utils/rate-limit';

const cos = new COS({
  SecretId: env.TENCENT_COS_SECRET_ID,
  SecretKey: env.TENCENT_COS_SECRET_KEY,
});

const Bucket = env.TENCENT_COS_BUCKET;
const Region = env.TENCENT_COS_REGION;

const PRESIGN_URL_EXPIRY_SECONDS = 900;

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
  const rl = checkRateLimit(`presign:${ip}`, presignRateLimit);
  if (!rl.allowed) {
    return NextResponse.json({ error: '请求过于频繁，请稍后再试' }, { status: 429 });
  }

  try {
    const { filename, contentType } = await req.json();

    if (!filename || !contentType) {
      return NextResponse.json({ error: 'Missing filename or contentType' }, { status: 400 });
    }

    // Reject path traversal attempts
    if (filename.includes('..') || filename.startsWith('/') || filename.includes('\\')) {
      return NextResponse.json({ error: 'Invalid filename' }, { status: 400 });
    }

    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    const cosKey = `uploads/${Date.now()}_${Math.random().toString(36).slice(2)}/${sanitizedFilename}`;

    const uploadUrl = await new Promise<string>((resolve, reject) => {
      cos.getObjectUrl(
        {
          Bucket,
          Region,
          Key: cosKey,
          Method: 'PUT',
          Expires: PRESIGN_URL_EXPIRY_SECONDS,
          Sign: true,
        },
        (err, data) => {
          if (err) reject(err);
          else resolve(data.Url);
        }
      );
    });

    const publicUrl = `https://${Bucket}.cos.${Region}.myqcloud.com/${cosKey}`;

    return NextResponse.json({ uploadUrl, cosKey, publicUrl });
  } catch (error: any) {
    console.error('Presign error:', error);
    return NextResponse.json({ error: 'Failed to generate presigned URL' }, { status: 500 });
  }
}
