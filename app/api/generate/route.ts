import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { initJob } from '@/lib/services/job';
import { validateId } from '@/lib/utils';
import { checkRateLimit, generationRateLimit } from '@/lib/utils/rate-limit';
import { z } from 'zod';

const generateSchema = z.object({
  jobId: z.string().min(1),
  inputImage: z.string().url(),
  userId: z.string().optional(),
  style: z.enum(['white', 'scene', 'model']).optional().default('white'),
  ratio: z.enum(['1:1', '4:3', '3:4', '16:9']).optional().default('1:1'),
  customPrompt: z.string().max(200).optional(),
  turnstileToken: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
  const rl = checkRateLimit(`generate:${ip}`, generationRateLimit);
  if (!rl.allowed) {
    return NextResponse.json({ error: '请求过于频繁，请稍后再试' }, { status: 429 });
  }

  const user = await getCurrentUser(req.headers.get('cookie'));

  try {
    const body = await req.json();
    const parsed = generateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: '参数无效', details: parsed.error.issues }, { status: 400 });
    }

    const { jobId, inputImage, style, ratio, customPrompt, turnstileToken } = parsed.data;
    const userId = user?.userId ?? parsed.data.userId ?? 'anonymous';

    if (!validateId(jobId)) {
      return NextResponse.json({ error: 'Invalid jobId' }, { status: 400 });
    }

    // Initialize job state immediately
    await initJob(jobId, inputImage, userId, style, ratio);

    // Trigger async processing (fire-and-forget)
    const baseUrl = req.nextUrl.origin;
    const internalSecret = process.env.INTERNAL_SECRET;
    fetch(`${baseUrl}/api/generate/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(internalSecret ? { 'x-internal-secret': internalSecret } : {}),
      },
      body: JSON.stringify({ jobId, inputImage, userId, style, ratio, customPrompt, turnstileToken }),
    }).catch((err) => console.error('Failed to trigger process:', err));

    return NextResponse.json({ jobId }, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error: any) {
    console.error('Generate error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
