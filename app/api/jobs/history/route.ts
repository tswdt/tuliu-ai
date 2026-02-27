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

  const results = await Promise.allSettled(
    jobIds.map(async (jobId) => {
      const { state } = await getJobState(jobId);
      return state;
    })
  );

  const jobs = results
    .filter((r): r is PromiseFulfilledResult<Awaited<ReturnType<typeof getJobState>>['state']> => r.status === 'fulfilled')
    .map((r) => r.value)
    .filter(Boolean);

  return NextResponse.json({ jobs });
}
