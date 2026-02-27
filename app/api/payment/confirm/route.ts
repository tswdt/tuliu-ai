import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getJson, putJson } from '@/lib/services/cos';
import { addCredit } from '@/lib/services/wallet';
import { z } from 'zod';

const confirmSchema = z.object({
  orderId: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const user = await getCurrentUser(req.headers.get('cookie'));
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = confirmSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: '参数无效' }, { status: 400 });
    }
    const { orderId } = parsed.data;

    const { data: order } = await getJson<{
      orderId: string;
      userId: string;
      credits: number;
      status: string;
    }>(`orders/${orderId}.json`);

    if (!order) {
      return NextResponse.json({ error: '订单不存在' }, { status: 404 });
    }
    if (order.userId !== user.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (order.status !== 'pending') {
      return NextResponse.json({ error: '订单状态无效' }, { status: 400 });
    }

    // Update order status
    await putJson(`orders/${orderId}.json`, { ...order, status: 'completed', completedAt: new Date().toISOString() });

    // Add credits to wallet
    const wallet = await addCredit(user.userId, order.credits);

    return NextResponse.json({ ok: true, balance: wallet.balance });
  } catch (error: any) {
    console.error('Payment confirm error:', error);
    return NextResponse.json({ error: '确认支付失败' }, { status: 500 });
  }
}
