'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

const PACKAGES = [
  {
    id: 'basic' as const,
    name: '体验包',
    credits: 10,
    price: 9.9,
    features: ['10 次 AI 生成', '白底/场景/模特风格', '高清图片下载', '7天有效期'],
  },
  {
    id: 'standard' as const,
    name: '标准包',
    credits: 50,
    price: 39.9,
    features: ['50 次 AI 生成', '全部风格模板', '高清图片下载', '编辑器功能', '30天有效期'],
    highlight: true,
  },
  {
    id: 'pro' as const,
    name: '专业包',
    credits: 200,
    price: 99.9,
    features: ['200 次 AI 生成', '全部功能解锁', '优先处理队列', 'API 访问权限', '90天有效期'],
  },
];

export default function PricingPage() {
  const router = useRouter();
  const [paying, setPaying] = useState<string | null>(null);

  const handleBuy = async (packageId: 'basic' | 'standard' | 'pro') => {
    setPaying(packageId);
    try {
      // Create order
      const createRes = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId }),
      });
      if (!createRes.ok) {
        const err = await createRes.json();
        if (createRes.status === 401) {
          toast.error('请先登录');
          router.push('/login');
          return;
        }
        throw new Error(err.error || '创建订单失败');
      }
      const { orderId } = await createRes.json();

      // Simulate payment confirmation
      const confirmRes = await fetch('/api/payment/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });
      if (!confirmRes.ok) throw new Error('支付确认失败');
      const { balance } = await confirmRes.json();

      toast.success(`充值成功！当前余额: ${balance} 积分`);
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.message || '购买失败，请重试');
    } finally {
      setPaying(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-light text-zinc-100 mb-4">选择适合您的方案</h1>
        <p className="text-zinc-400">注册即送 3 积分，每次 AI 生成消耗 1 积分</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {PACKAGES.map((pkg) => (
          <Card
            key={pkg.id}
            className={`p-8 space-y-6 relative ${
              pkg.highlight
                ? 'bg-blue-950/30 border-blue-700 ring-1 ring-blue-700/50'
                : 'bg-zinc-900 border-zinc-800'
            }`}
          >
            {pkg.highlight && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs px-3 py-1 rounded-full">
                最受欢迎
              </div>
            )}
            <div>
              <h3 className="text-xl font-semibold text-zinc-100">{pkg.name}</h3>
              <div className="mt-2">
                <span className="text-4xl font-bold text-zinc-100">¥{pkg.price}</span>
              </div>
              <p className="text-blue-400 text-sm mt-1">{pkg.credits} 积分</p>
            </div>

            <ul className="space-y-3">
              {pkg.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-zinc-300">
                  <CheckCircle2 className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>

            <Button
              className={`w-full h-11 ${
                pkg.highlight
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-zinc-100 text-zinc-950 hover:bg-zinc-200'
              }`}
              onClick={() => handleBuy(pkg.id)}
              disabled={paying !== null}
            >
              {paying === pkg.id ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  处理中...
                </>
              ) : (
                '模拟支付购买'
              )}
            </Button>
          </Card>
        ))}
      </div>

      <p className="text-center text-zinc-600 text-sm mt-8">
        * 当前为模拟支付模式，正式支付接口接入中。积分购买后立即到账。
      </p>
    </div>
  );
}
