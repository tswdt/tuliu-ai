import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getJson } from '@/lib/services/cos';
import { getJobState } from '@/lib/services/job';

export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req.headers.get('cookie'));
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { data } = await getJson<{ jobs: Array<{ jobId: string; createdAt: string }> }>(
      `users/${user.userId}/jobs.json`
    );
    const jobRefs = data?.jobs ?? [];

    // Fetch details for each job (limit to 20 most recent)
    const recent = jobRefs.slice(0, 20);
    const jobs = await Promise.all(
      recent.map(async ({ jobId, createdAt }) => {
        const { state } = await getJobState(jobId);
        return state ? { ...state, createdAt: state.createdAt ?? createdAt } : null;
      })
    );

    return NextResponse.json(
      { jobs: jobs.filter(Boolean) },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error: any) {
    console.error('Jobs list error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
