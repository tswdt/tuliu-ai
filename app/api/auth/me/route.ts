import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req.headers.get('cookie'));
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json({ userId: user.userId, email: user.email });
}
