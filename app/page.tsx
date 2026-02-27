'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Eye, Scissors, ImagePlay, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d?.userId) setIsLoggedIn(true); })
      .catch(() => {});
  }, []);

  return (
    <div className="bg-zinc-950 text-zinc-100">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-24 text-center space-y-6">
        <div className="inline-flex items-center gap-2 bg-blue-950/50 border border-blue-800/50 rounded-full px-4 py-1.5 text-xs text-blue-300 mb-4">
          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
          基于腾讯云 AI 驱动
        </div>
        <h1 className="text-5xl md:text-7xl font-light tracking-tight">
          图流 AI
          <span className="block text-zinc-500 mt-2">AI 驱动的电商产品摄影</span>
        </h1>
        <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
          上传产品原图，自动完成视觉分析、智能抠图、场景重绘，一键生成专业级商业大片。
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Link href={isLoggedIn ? '/generate' : '/register'}>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 h-12 text-base">
              {isLoggedIn ? '进入工作台' : '免费试用'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <Link href="/pricing">
            <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 px-8 h-12 text-base">
              查看定价
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <h2 className="text-center text-3xl font-light text-zinc-100 mb-12">核心功能</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: <Eye className="w-8 h-8 text-blue-400" />,
              title: '视觉分析',
              desc: '基于腾讯混元视觉模型，精准识别产品特征，自动生成最优商拍描述。',
            },
            {
              icon: <Scissors className="w-8 h-8 text-blue-400" />,
              title: '智能抠图',
              desc: '集成 Bria AI 专业抠图引擎，精确分离产品主体与背景，边缘细节完美保留。',
            },
            {
              icon: <ImagePlay className="w-8 h-8 text-blue-400" />,
              title: '场景重绘',
              desc: '使用 Flux Fill 场景重绘技术，将产品无缝融入专业商拍场景，生成高质量大片。',
            },
          ].map((f) => (
            <Card key={f.title} className="bg-zinc-900 border-zinc-800 p-8 space-y-4">
              {f.icon}
              <h3 className="text-xl font-semibold text-zinc-100">{f.title}</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">{f.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <h2 className="text-center text-3xl font-light text-zinc-100 mb-12">使用流程</h2>
        <div className="grid md:grid-cols-4 gap-4">
          {[
            { step: '01', title: '上传原图', desc: '上传您的产品照片（支持 JPG/PNG）' },
            { step: '02', title: '智能分析', desc: '混元视觉自动识别产品特征' },
            { step: '03', title: '精准抠图', desc: 'AI 自动分离产品主体' },
            { step: '04', title: '生成大片', desc: '输出专业级商业摄影图' },
          ].map((s, i) => (
            <div key={s.step} className="relative flex flex-col items-center text-center p-6">
              {i < 3 && (
                <ArrowRight className="absolute right-0 top-8 w-5 h-5 text-zinc-600 hidden md:block" />
              )}
              <div className="w-12 h-12 rounded-full bg-blue-600/20 border border-blue-600/40 flex items-center justify-center text-blue-400 font-bold mb-4">
                {s.step}
              </div>
              <h4 className="font-semibold text-zinc-100 mb-2">{s.title}</h4>
              <p className="text-zinc-500 text-sm">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-light text-zinc-100 mb-4">透明定价</h2>
        <p className="text-zinc-400 mb-8">注册即送 3 积分，每次生成消耗 1 积分</p>
        <div className="flex flex-col sm:flex-row gap-6 justify-center mb-10">
          {[
            { name: '体验包', credits: '10 积分', price: '¥9.9' },
            { name: '标准包', credits: '50 积分', price: '¥39.9', highlight: true },
            { name: '专业包', credits: '200 积分', price: '¥99.9' },
          ].map((p) => (
            <Card
              key={p.name}
              className={`p-6 min-w-[160px] ${p.highlight ? 'bg-blue-950/50 border-blue-700' : 'bg-zinc-900 border-zinc-800'}`}
            >
              <p className="text-zinc-400 text-sm mb-1">{p.name}</p>
              <p className="text-2xl font-bold text-zinc-100">{p.price}</p>
              <p className="text-blue-400 text-sm mt-1">{p.credits}</p>
            </Card>
          ))}
        </div>
        <Link href="/pricing">
          <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800">
            查看完整定价方案 <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </section>
    </div>
  );
}
