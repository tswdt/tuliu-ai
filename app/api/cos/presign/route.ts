import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getPresignedUploadUrl, Bucket, Region } from '@/lib/services/cos';
import { checkRateLimit, presignRateLimit } from '@/lib/utils/rate-limit';

const ALLOWED_CONTENT_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const MAX_FILENAME_LENGTH = 100;

export async function POST(req: NextRequest) {
  // Auth check: require a valid JWT session
  const user = await getCurrentUser(req.headers.get('cookie'));
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
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

    // Validate content type against whitelist
    if (!ALLOWED_CONTENT_TYPES.has(contentType)) {
      return NextResponse.json({ error: 'Invalid contentType: only image uploads are allowed' }, { status: 400 });
    }

    // Reject path traversal attempts
    if (filename.includes('..') || filename.startsWith('/') || filename.includes('\\')) {
      return NextResponse.json({ error: 'Invalid filename' }, { status: 400 });
    }

    const rawSanitized = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    const dotIndex = rawSanitized.lastIndexOf('.');
    const ext = dotIndex !== -1 ? rawSanitized.slice(dotIndex) : '';
    const base = dotIndex !== -1 ? rawSanitized.slice(0, dotIndex) : rawSanitized;
    const sanitizedFilename = base.slice(0, MAX_FILENAME_LENGTH - ext.length) + ext;
    const cosKey = `uploads/${Date.now()}_${Math.random().toString(36).slice(2)}/${sanitizedFilename}`;

    const uploadUrl = await getPresignedUploadUrl(cosKey);

    const publicUrl = `https://${Bucket}.cos.${Region}.myqcloud.com/${cosKey}`;

    return NextResponse.json({ uploadUrl, cosKey, publicUrl });
  } catch (error: any) {
    console.error('Presign error:', error);
    return NextResponse.json({ error: 'Failed to generate presigned URL' }, { status: 500 });
  }
}
