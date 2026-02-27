import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function LandingPage() {
  return (
    <div className="text-zinc-100">
      {/* Hero Section */}
      <section className="py-24 px-4 text-center max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
          AI 电商摄影，一键生成大片
        </h1>
        <p className="text-xl text-zinc-400 mb-10 max-w-2xl mx-auto">
          上传产品照片，AI 自动分析、抠图、场景重绘，30秒产出电商级视觉大片
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/generate">
            <Button size="lg" className="bg-zinc-100 text-zinc-950 hover:bg-zinc-200 font-bold px-8">
              免费试用
            </Button>
          </Link>
          <Link href="/pricing">
            <Button size="lg" variant="outline" className="border-zinc-700 text-zinc-300 hover:text-zinc-100 px-8">
              查看定价
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-zinc-900/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">核心功能</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-zinc-900 border-zinc-800 p-8 text-center">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-3">智能视觉分析</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                AI 自动识别产品特征，生成专业商业摄影描述
              </p>
            </Card>
            <Card className="bg-zinc-900 border-zinc-800 p-8 text-center">
              <div className="text-4xl mb-4">✂️</div>
              <h3 className="text-xl font-semibold mb-3">精准智能抠图</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                毫秒级产品主体分离，边缘精度达到像素级
              </p>
            </Card>
            <Card className="bg-zinc-900 border-zinc-800 p-8 text-center">
              <div className="text-4xl mb-4">🎨</div>
              <h3 className="text-xl font-semibold mb-3">场景智能重绘</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                基于 AI 理解，自动生成电商级视觉场景
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">使用步骤</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { step: '01', title: '上传产品原图', desc: '支持 JPG / PNG，最大 10MB' },
              { step: '02', title: 'AI 视觉分析', desc: '自动识别产品类别与特征' },
              { step: '03', title: '智能抠图处理', desc: '毫秒级背景分离' },
              { step: '04', title: '场景重绘输出', desc: '生成电商级大片' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="text-center">
                <div className="text-4xl font-bold text-zinc-700 mb-3">{step}</div>
                <h3 className="font-semibold mb-2">{title}</h3>
                <p className="text-zinc-500 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview Section */}
      <section className="py-20 px-4 bg-zinc-900/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">简单透明的定价</h2>
          <p className="text-zinc-400 mb-10">按积分消耗，无隐藏费用</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {[
              { name: '体验版', price: '免费', credits: '5 积分', desc: '新用户注册即送' },
              { name: '专业版', price: '¥49/月', credits: '100 积分', desc: '适合中小卖家', featured: true },
              { name: '企业版', price: '¥199/月', credits: '500 积分', desc: '适合品牌商' },
            ].map(({ name, price, credits, desc, featured }) => (
              <Card
                key={name}
                className={`p-6 text-center ${featured ? 'bg-zinc-100 text-zinc-950 border-zinc-200' : 'bg-zinc-900 border-zinc-800'}`}
              >
                <h3 className={`font-bold text-lg mb-2 ${featured ? 'text-zinc-950' : 'text-zinc-100'}`}>{name}</h3>
                <p className={`text-3xl font-bold mb-1 ${featured ? 'text-zinc-950' : 'text-zinc-100'}`}>{price}</p>
                <p className={`text-sm mb-2 ${featured ? 'text-zinc-600' : 'text-zinc-400'}`}>{credits}</p>
                <p className={`text-xs ${featured ? 'text-zinc-500' : 'text-zinc-500'}`}>{desc}</p>
              </Card>
            ))}
          </div>
          <Link href="/pricing">
            <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:text-zinc-100">
              查看完整定价方案 →
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
