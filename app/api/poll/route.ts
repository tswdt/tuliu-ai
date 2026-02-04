import { NextRequest, NextResponse } from 'next/server';
import { getJobState } from '@/lib/services/job';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const jobId = searchParams.get('jobId');

  if (!jobId) {
    return NextResponse.json({ error: 'Missing jobId' }, { status: 400 });
  }

  try {
    const state = await getJobState(jobId);
    if (!state) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    return NextResponse.json(state);
  } catch (error) {
    console.error('Polling error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
