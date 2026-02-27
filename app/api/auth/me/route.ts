import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getBalance } from '@/lib/services/wallet';

export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req.headers.get('cookie'));
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { wallet } = await getBalance(user.userId);
  return NextResponse.json({ userId: user.userId, email: user.email, balance: wallet.balance });
}
