import Link from "next/link";
import { Sparkles, ArrowRight, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const cases = [
  {
    category: "服饰",
    platform: "淘宝",
    productName: "纯棉休闲T恤",
    beforeDesc: "手机拍摄白底图，无设计感",
    afterDesc: "AI 生成 5 张主图 + 4 张场景图 + 3 张细节图 + 4 张卖点图",
    images: ["主图1", "主图2", "场景图", "细节图"],
    color: "from-blue-500 to-cyan-500",
  },
  {
    category: "美妆",
    platform: "小红书",
    productName: "玻尿酸精华液",
    beforeDesc: "产品实物图，无氛围感",
    afterDesc: "AI 生成 ins 风种草图，3:4 竖版构图",
    images: ["种草主图", "质地展示", "上脸效果", "成分展示"],
    color: "from-pink-500 to-rose-500",
  },
  {
    category: "3C数码",
    platform: "京东",
    productName: "无线蓝牙耳机",
    beforeDesc: "产品平铺图，无场景感",
    afterDesc: "AI 生成科技感场景图 + 参数详情图",
    images: ["主图", "使用场景", "细节特写", "参数图"],
    color: "from-slate-500 to-gray-600",
  },
  {
    category: "食品",
    platform: "拼多多",
    productName: "有机坚果礼盒",
    beforeDesc: "包装正面图，无食欲感",
    afterDesc: "AI 生成美食场景图 + 卖点突出图",
    images: ["主图", "摆盘展示", "细节展示", "卖点图"],
    color: "from-amber-500 to-orange-500",
  },
  {
    category: "家居",
    platform: "天猫",
    productName: "北欧风落地灯",
    beforeDesc: "产品白底图，无场景感",
    afterDesc: "AI 生成家居场景图 + 品质感主图",
    images: ["主图", "客厅场景", "细节展示", "氛围图"],
    color: "from-emerald-500 to-teal-500",
  },
  {
    category: "跨境",
    platform: "Amazon",
    productName: "Yoga Mat Pro",
    beforeDesc: "产品平铺图，英文描述缺失",
    afterDesc: "AI 生成白底主图 + 英文文案 + A+ 页面",
    images: ["Main Image", "Lifestyle", "Detail", "Infographic"],
    color: "from-orange-500 to-red-500",
  },
];

const stats = [
  { value: "10,000+", label: "已生成图片" },
  { value: "2,000+", label: "活跃商家" },
  { value: "9", label: "支持平台" },
  { value: "95%", label: "识别准确率" },
];

export default function CasesPage() {
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
              <span className="text-[#1d1d1f] font-medium">案例展示</span>
              <Link href="/pricing" className="text-[#86868b] hover:text-[#1d1d1f] transition-colors">价格套餐</Link>
            </div>
            <Link href="/workspace/create">
              <Button className="bg-[#1d1d1f] text-white hover:bg-[#333] rounded-full text-[14px] font-medium cursor-pointer transition-all hover:shadow-lg hover:shadow-black/10">
                免费开始
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <section className="pt-28 pb-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-[40px] md:text-[48px] font-bold text-[#1d1d1f] mb-4 tracking-[-0.02em]">
            看看 AI 生成的真实效果
          </h1>
          <p className="text-[18px] text-[#86868b]">不同品类、不同平台的生成案例</p>
        </div>
      </section>

      <section className="py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-4 gap-6 mb-16">
            {stats.map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-[32px] font-bold text-[#1d1d1f]">{s.value}</div>
                <div className="text-[14px] text-[#86868b] mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-8 px-4">
        <div className="max-w-6xl mx-auto space-y-6">
          {cases.map((c, i) => (
            <Card key={i} className="border border-[#e5e5e5] rounded-2xl overflow-hidden">
              <CardContent className="p-0">
                <div className="grid md:grid-cols-2">
                  <div className="p-8">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="px-2.5 py-1 rounded-full bg-[#f5f5f7] text-[#1d1d1f] text-[12px] font-medium border border-[#e5e5e5]">{c.category}</span>
                      <span className="px-2.5 py-1 rounded-full bg-[#f5f5f7] text-[#666] text-[12px] font-medium border border-[#e5e5e5]">{c.platform}</span>
                    </div>
                    <h3 className="text-[20px] font-bold text-[#1d1d1f] mb-4">{c.productName}</h3>
                    <div className="space-y-3 mb-6">
                      <div className="flex items-start gap-2">
                        <span className="text-red-400 text-[14px] mt-0.5">✕</span>
                        <p className="text-[14px] text-[#86868b]">{c.beforeDesc}</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-green-500 text-[14px] mt-0.5">✓</span>
                        <p className="text-[14px] text-[#1d1d1f]">{c.afterDesc}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {c.images.map((img, j) => (
                        <span key={j} className="px-2 py-1 rounded-lg bg-[#f5f5f7] text-[12px] text-[#666] border border-[#e5e5e5]">{img}</span>
                      ))}
                    </div>
                  </div>
                  <div className={`bg-gradient-to-br ${c.color} p-8 flex items-center justify-center min-h-[240px]`}>
                    <div className="grid grid-cols-2 gap-3 w-full max-w-[280px]">
                      {c.images.map((img, j) => (
                        <div key={j} className="aspect-square bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                          <span className="text-white/80 text-[12px] font-medium">{img}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-[24px] font-bold text-[#1d1d1f] mb-4">亲自试试效果</h2>
          <p className="text-[#86868b] mb-8 text-[16px]">上传你的产品图，看看 AI 能生成什么</p>
          <Link href="/workspace/create">
            <Button size="lg" className="bg-[#1d1d1f] text-white hover:bg-[#333] px-8 h-12 rounded-full font-medium cursor-pointer transition-all hover:shadow-lg hover:shadow-black/10">
              <Upload className="mr-2 h-5 w-5" />
              上传产品图试试
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
