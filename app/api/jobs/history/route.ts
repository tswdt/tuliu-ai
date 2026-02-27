import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getUserJobs, getJobState } from '@/lib/services/job';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req.headers.get('cookie'));
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const jobIds = await getUserJobs(user.userId);

  const jobs = await Promise.all(
    jobIds.map(async (jobId) => {
      const { state } = await getJobState(jobId);
      return state;
    })
  );

  return NextResponse.json({ jobs: jobs.filter(Boolean) });
}
