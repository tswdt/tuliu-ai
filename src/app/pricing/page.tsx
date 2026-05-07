import Link from "next/link";
import { Sparkles, Upload, CheckCircle2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const plans = [
  {
    name: "免费体验",
    price: 0,
    unit: "元",
    period: "永久免费",
    desc: "适合初次体验的用户",
    credits: 3,
    features: [
      "3 次免费生成额度",
      "支持全部 9 大平台",
      "AI 自动识别商品",
      "标准分辨率输出",
      "单张下载",
    ],
    disabled: ["批量下载", "详情页编辑器", "优先队列", "API 接口"],
    cta: "免费开始",
    highlight: false,
  },
  {
    name: "基础版",
    price: 49,
    unit: "元",
    period: "/月",
    desc: "适合小商家和个人卖家",
    credits: 50,
    features: [
      "50 次/月生成额度",
      "支持全部 9 大平台",
      "AI 自动识别商品",
      "4K 高清分辨率输出",
      "批量打包下载",
      "详情页编辑器",
    ],
    disabled: ["优先队列", "API 接口", "专属客服"],
    cta: "立即订阅",
    highlight: true,
  },
  {
    name: "专业版",
    price: 149,
    unit: "元",
    period: "/月",
    desc: "适合电商代运营和品牌方",
    credits: 200,
    features: [
      "200 次/月生成额度",
      "支持全部 9 大平台",
      "AI 自动识别商品",
      "4K 高清分辨率输出",
      "批量打包下载",
      "详情页编辑器",
      "优先生成队列",
      "API 接口调用",
    ],
    disabled: ["专属客服"],
    cta: "立即订阅",
    highlight: false,
  },
  {
    name: "企业版",
    price: 499,
    unit: "元",
    period: "/月",
    desc: "适合大型电商团队",
    credits: 999,
    features: [
      "无限生成额度",
      "支持全部 9 大平台",
      "AI 自动识别商品",
      "4K 高清分辨率输出",
      "批量打包下载",
      "详情页编辑器",
      "优先生成队列",
      "API 接口调用",
      "1 对 1 专属客服",
      "自定义品牌水印",
    ],
    disabled: [],
    cta: "联系我们",
    highlight: false,
  },
];

const faqs = [
  {
    q: "一次生成消耗多少额度？",
    a: "生成一套完整的商品图（主图+场景图+细节图+卖点图+文案）消耗 1 次额度。",
  },
  {
    q: "额度用完了怎么办？",
    a: "可以单独购买额度包，也可以升级套餐。额度包永不过期。",
  },
  {
    q: "生成的图片有版权吗？",
    a: "AI 生成的图片您拥有完整使用权，可商用。系统会进行内容安全审核。",
  },
  {
    q: "支持哪些图片格式？",
    a: "支持上传 JPG、PNG、WebP 格式，输出 PNG 格式，符合各平台上传规范。",
  },
  {
    q: "可以退款吗？",
    a: "月度套餐支持 7 天无理由退款。额度包购买后不支持退款。",
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f]">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-[#e5e5e5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            <div className="flex items-center space-x-2">
              <div className="h-7 w-7 rounded-lg bg-[#1d1d1f] flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="text-[16px] font-semibold tracking-tight">燎原 AI</span>
            </div>
            <div className="hidden md:flex items-center space-x-8 text-[14px]">
              <Link href="/" className="text-[#86868b] hover:text-[#1d1d1f] transition-colors">首页</Link>
              <Link href="/features" className="text-[#86868b] hover:text-[#1d1d1f] transition-colors">功能介绍</Link>
              <Link href="/cases" className="text-[#86868b] hover:text-[#1d1d1f] transition-colors">案例展示</Link>
              <span className="text-[#1d1d1f] font-medium">价格套餐</span>
            </div>
            <Link href="/workspace/create">
              <Button className="bg-[#1d1d1f] text-white hover:bg-[#333] rounded-full text-[14px] font-medium cursor-pointer transition-all hover:shadow-lg hover:shadow-black/10">
                免费开始
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <section className="pt-28 pb-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-[40px] md:text-[48px] font-bold text-[#1d1d1f] mb-4 tracking-[-0.02em]">
            简单透明的价格方案
          </h1>
          <p className="text-[18px] text-[#86868b]">按需选择，随时升级或降级</p>
        </div>
      </section>

      <section className="py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {plans.map((plan, i) => (
              <Card key={i} className={`relative border rounded-2xl ${plan.highlight ? "border-[#1d1d1f] shadow-lg shadow-black/5" : "border-[#e5e5e5] shadow-sm"}`}>
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#1d1d1f] text-white text-[12px] font-medium rounded-full">
                    最受欢迎
                  </div>
                )}
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-[18px]">{plan.name}</CardTitle>
                  <p className="text-[14px] text-[#86868b]">{plan.desc}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <span className="text-[36px] font-bold text-[#1d1d1f]">{plan.price}</span>
                    <span className="text-[#86868b]">{plan.unit}</span>
                    <span className="text-[14px] text-[#86868b]">{plan.period}</span>
                  </div>
                  <div className="text-center text-[14px] text-[#1d1d1f] font-medium">
                    <Zap className="h-3.5 w-3.5 inline mr-1" />
                    {plan.credits === 999 ? "无限额度" : `${plan.credits} 次/月`}
                  </div>
                  <div className="space-y-2">
                    {plan.features.map((f, j) => (
                      <div key={j} className="flex items-center gap-2 text-[14px]">
                        <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-[#666]">{f}</span>
                      </div>
                    ))}
                    {plan.disabled.map((f, j) => (
                      <div key={j} className="flex items-center gap-2 text-[14px]">
                        <span className="h-4 w-4 flex-shrink-0 text-[#ccc]">✕</span>
                        <span className="text-[#86868b]">{f}</span>
                      </div>
                    ))}
                  </div>
                  <Link href={plan.price === 0 ? "/workspace/create" : "/register"} className="block">
                    <Button
                      className={`w-full rounded-xl ${plan.highlight ? "bg-[#1d1d1f] text-white hover:bg-[#333]" : ""}`}
                      variant={plan.highlight ? "default" : "outline"}
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-[24px] font-bold text-center text-[#1d1d1f] mb-8">常见问题</h2>
          <div className="space-y-6">
            {faqs.map((faq, i) => (
              <div key={i}>
                <h3 className="font-medium text-[#1d1d1f] mb-2 text-[16px]">{faq.q}</h3>
                <p className="text-[14px] text-[#86868b]">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
