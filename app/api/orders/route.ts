import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getJson } from '@/lib/services/cos';

export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req.headers.get('cookie'));
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { data } = await getJson<{ orders: string[] }>(`users/${user.userId}/orders.json`);
    const orderIds = data?.orders ?? [];

    const orders = await Promise.all(
      orderIds.slice(0, 20).map(async (orderId) => {
        const { data: order } = await getJson<Record<string, unknown>>(`orders/${orderId}.json`);
        return order ?? null;
      })
    );

    return NextResponse.json(
      { orders: orders.filter(Boolean) },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error: any) {
    console.error('Orders list error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
