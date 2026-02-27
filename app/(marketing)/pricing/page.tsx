import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: '定价方案',
  description: '图流 AI 积分套餐定价，按需选择适合您的方案。',
};

const plans = [
  {
    name: '体验版',
    price: '免费',
    period: '',
    credits: 5,
    description: '新用户注册即送5次生成',
    features: [
      '5 次生成机会',
      '标准分辨率输出',
      '智能视觉分析',
      '精准智能抠图',
      '场景智能重绘',
    ],
    cta: '免费开始',
    href: '/generate',
    featured: false,
  },
  {
    name: '专业版',
    price: '¥49',
    period: '/月',
    credits: 100,
    description: '适合中小卖家，高性价比之选',
    features: [
      '100 积分/月',
      '高分辨率输出',
      '智能视觉分析',
      '精准智能抠图',
      '场景智能重绘',
      '优先处理队列',
    ],
    cta: '即将开放',
    href: '/generate',
    featured: true,
  },
  {
    name: '企业版',
    price: '¥199',
    period: '/月',
    credits: 500,
    description: '适合品牌商和大卖家',
    features: [
      '500 积分/月',
      '超高分辨率输出',
      '智能视觉分析',
      '精准智能抠图',
      '场景智能重绘',
      '优先处理队列',
      '专属客服支持',
    ],
    cta: '即将开放',
    href: '/generate',
    featured: false,
  },
];

export default function PricingPage() {
  return (
    <div className="py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">定价方案</h1>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
            按积分消耗，无隐藏费用。新用户注册即送5积分，立即体验。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`p-8 flex flex-col ${
                plan.featured
                  ? 'bg-zinc-100 border-zinc-200 text-zinc-950 relative'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-100'
              }`}
            >
              {plan.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  推荐
                </div>
              )}
              <div className="mb-6">
                <h2 className={`text-xl font-bold mb-2 ${plan.featured ? 'text-zinc-950' : 'text-zinc-100'}`}>
                  {plan.name}
                </h2>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className={`text-4xl font-bold ${plan.featured ? 'text-zinc-950' : 'text-zinc-100'}`}>
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className={`text-sm ${plan.featured ? 'text-zinc-600' : 'text-zinc-400'}`}>
                      {plan.period}
                    </span>
                  )}
                </div>
                <p className={`text-sm ${plan.featured ? 'text-zinc-600' : 'text-zinc-400'}`}>
                  {plan.credits} 积分 · {plan.description}
                </p>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <CheckCircle2
                      className={`w-4 h-4 flex-shrink-0 ${plan.featured ? 'text-blue-600' : 'text-zinc-500'}`}
                    />
                    <span className={plan.featured ? 'text-zinc-700' : 'text-zinc-300'}>{feature}</span>
                  </li>
                ))}
              </ul>

              <Link href={plan.href}>
                <Button
                  className={`w-full font-bold ${
                    plan.featured
                      ? 'bg-zinc-950 text-zinc-100 hover:bg-zinc-800'
                      : 'bg-zinc-100 text-zinc-950 hover:bg-zinc-200'
                  }`}
                >
                  {plan.cta}
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
