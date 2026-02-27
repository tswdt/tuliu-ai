import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getJson, putJson } from '@/lib/services/cos';
import { z } from 'zod';

const PACKAGES: Record<string, { credits: number; amount: number; name: string }> = {
  basic: { credits: 10, amount: 9.9, name: '体验包' },
  standard: { credits: 50, amount: 39.9, name: '标准包' },
  pro: { credits: 200, amount: 99.9, name: '专业包' },
};

const createSchema = z.object({
  packageId: z.enum(['basic', 'standard', 'pro']),
});

export async function POST(req: NextRequest) {
  const user = await getCurrentUser(req.headers.get('cookie'));
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: '参数无效' }, { status: 400 });
    }
    const { packageId } = parsed.data;
    const pkg = PACKAGES[packageId];

    const orderId = `order_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`;
    const now = new Date().toISOString();

    const order = {
      orderId,
      userId: user.userId,
      packageId,
      credits: pkg.credits,
      amount: pkg.amount,
      name: pkg.name,
      status: 'pending',
      createdAt: now,
    };

    // Store order
    await putJson(`orders/${orderId}.json`, order);

    // Update user's order list
    const { data: existing } = await getJson<{ orders: string[] }>(`users/${user.userId}/orders.json`);
    const orders = existing?.orders ?? [];
    orders.unshift(orderId);
    await putJson(`users/${user.userId}/orders.json`, { orders: orders.slice(0, 100) });

    return NextResponse.json({ orderId, amount: pkg.amount, packageId, name: pkg.name, credits: pkg.credits });
  } catch (error: any) {
    console.error('Payment create error:', error);
    return NextResponse.json({ error: '创建订单失败' }, { status: 500 });
  }
}
