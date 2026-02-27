import { NextRequest, NextResponse } from 'next/server';
import { startGeneration } from '@/server/actions/generate';

// This is an internal endpoint called by /api/generate to process jobs asynchronously
export async function POST(req: NextRequest) {
  // If INTERNAL_SECRET is configured, validate the request comes from within the app
  const internalSecret = process.env.INTERNAL_SECRET;
  if (internalSecret) {
    const providedSecret = req.headers.get('x-internal-secret');
    if (providedSecret !== internalSecret) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  try {
    const { jobId, inputImage, userId, style, ratio, customPrompt, turnstileToken } = await req.json();
    await startGeneration(jobId, inputImage, userId, turnstileToken, style, ratio, customPrompt);
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('Process error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
