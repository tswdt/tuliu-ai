"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  Upload,
  Wand2,
  Layers,
  Camera,
  ZoomIn,
  Square,
  FileImage,
  Check,
  X,
  ChevronDown,
  Zap,
  Target,
  Palette,
  Brain,
  Store,
  Globe,
  Award,
  ShoppingCart,
  BadgePercent,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const platforms = [
  { id: "taobao", name: "淘宝", color: "#FF4400", icon: ShoppingCart },
  { id: "jd", name: "京东", color: "#E4393C", icon: Award },
  { id: "pdd", name: "拼多多", color: "#E02E24", icon: BadgePercent },
  { id: "douyin", name: "抖音", color: "#161823", icon: Zap },
  { id: "amazon", name: "亚马逊", color: "#FF9900", icon: Globe },
  { id: "shopify", name: "Shopify", color: "#95BF47", icon: Store },
];

const showcaseItems = [
  { title: "萌宠食品", subtitle: "冻干肉棒", gradient: "from-green-100 to-emerald-50" },
  { title: "美妆护肤", subtitle: "3D 雕塑大师", gradient: "from-rose-100 to-pink-50" },
  { title: "箱包", subtitle: "进口植软牛皮", gradient: "from-stone-100 to-orange-50" },
  { title: "烘焙食品", subtitle: "全麦坚果欧包", gradient: "from-amber-100 to-yellow-50" },
];

const comparisonData = [
  { feature: "出图速度", traditional: "3-7 天", picset: "3 分钟" },
  { feature: "设计成本", traditional: "¥500-2000/套", picset: "¥0 起" },
  { feature: "风格统一性", traditional: "依赖设计师水平", picset: "AI 自动统一风格" },
  { feature: "多平台适配", traditional: "需分别设计", picset: "一键多平台适配" },
  { feature: "修改迭代", traditional: "反复沟通修改", picset: "即时调整即时生成" },
  { feature: "专业门槛", traditional: "需专业设计能力", picset: "零门槛上手" },
];

const advantages = [
  {
    icon: Brain,
    title: "AI 智能识别",
    desc: "上传产品图后，AI 自动识别品类、材质、颜色、卖点，无需手动填写商品信息。",
    bg: "bg-[#f5f5f7]",
    border: "border-[#e5e5e5]",
    iconColor: "text-[#1d1d1f]",
  },
  {
    icon: Target,
    title: "平台规则适配",
    desc: "内置淘宝、京东、拼多多、抖音、亚马逊等平台视觉规范，自动匹配最佳呈现方式。",
    bg: "bg-cyan-50",
    border: "border-cyan-200",
    iconColor: "text-cyan-600",
  },
  {
    icon: Palette,
    title: "多风格一键切换",
    desc: "高级简约、科技感、中式传统、清新自然等 9 种风格，一键切换预览效果。",
    bg: "bg-amber-50",
    border: "border-amber-200",
    iconColor: "text-amber-600",
  },
  {
    icon: Zap,
    title: "全流程自动化",
    desc: "从上传到出图全流程自动化，主图、细节图、参数图、详情页一键生成。",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    iconColor: "text-emerald-600",
  },
];

const faqs = [
  {
    q: "燎原 AI 能生成哪些类型的电商图片？",
    a: "支持生成商品主图、多角度附图、白底图、场景图、细节图、卖点图、参数图、详情页长图等全套电商视觉资产。",
  },
  {
    q: "生成的图片可以直接用于电商平台吗？",
    a: "可以。燎原 AI 内置了淘宝、京东、拼多多、抖音、亚马逊等主流平台的尺寸规范和视觉要求，生成的图片符合各平台上传标准。",
  },
  {
    q: "需要专业设计能力才能使用吗？",
    a: "不需要。只需上传产品图，选择目标平台和风格，AI 会自动完成识别、排版、生成全流程，零门槛上手。",
  },
  {
    q: "生成的图片有水印吗？",
    a: "免费版生成的图片带有水印，付费版本可生成无水印高清图片，支持 4K 分辨率输出。",
  },
  {
    q: "可以指定特定的视觉风格吗？",
    a: "可以。提供 9 种预设风格，也可以上传竞品图让 AI 学习参考风格，实现风格复刻。",
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white rounded-2xl border border-[#e5e5e5] overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left cursor-pointer"
      >
        <span className="text-[14px] font-medium text-[#1d1d1f] pr-4">{q}</span>
        <ChevronDown
          className={`h-4 w-4 text-[#999] flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="px-5 pb-5">
          <p className="text-[14px] text-[#86868b] leading-[1.7]">{a}</p>
        </div>
      )}
    </div>
  );
}

export default function NewProjectPage() {
  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f]">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-[#e5e5e5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            <Link href="/" className="flex items-center space-x-2 cursor-pointer">
              <div className="h-7 w-7 rounded-lg bg-[#1d1d1f] flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="text-[16px] font-semibold tracking-tight">燎原 AI</span>
            </Link>
            <div className="hidden md:flex items-center space-x-8 text-[14px]">
              <Link href="/features" className="text-[#86868b] hover:text-[#1d1d1f] transition cursor-pointer">功能</Link>
              <Link href="/cases" className="text-[#86868b] hover:text-[#1d1d1f] transition cursor-pointer">案例</Link>
              <Link href="/pricing" className="text-[#86868b] hover:text-[#1d1d1f] transition cursor-pointer">价格</Link>
              <Link href="/login" className="text-[#86868b] hover:text-[#1d1d1f] transition cursor-pointer">登录</Link>
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

      <section className="relative pt-20 pb-14 px-4 sm:px-6 lg:px-10">
        <div className="max-w-[1600px] mx-auto relative z-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-1.5 mb-4 border border-[#e5e5e5]">
              <Sparkles className="h-3.5 w-3.5 text-[#999]" />
              <span className="text-[12px] text-[#86868b]">AI 驱动 · 一键生成</span>
            </div>

            <h1 className="text-[28px] sm:text-[36px] md:text-[44px] font-bold mb-4 leading-[1.1] tracking-[-0.02em] text-[#1d1d1f]">
              一键生成主图 & 详情页图
            </h1>
            <p className="text-[14px] md:text-[16px] text-[#86868b] mb-6 max-w-2xl mx-auto leading-[1.7]">
              上传产品图，AI 自动识别商品信息，匹配平台规则，一键生成全套电商视觉资产。
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
              <Link href="/workspace/create">
                <Button size="lg" className="bg-[#1d1d1f] text-white hover:bg-[#333] text-[14px] px-8 h-12 rounded-full font-semibold cursor-pointer transition-all hover:shadow-lg hover:shadow-black/10">
                  免费试用
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/cases">
                <Button size="lg" variant="outline" className="text-[14px] px-8 h-12 rounded-full border-[#e5e5e5] text-[#666] hover:text-[#1d1d1f] hover:border-[#ccc] cursor-pointer">
                  查看案例
                </Button>
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#e5e5e5] p-1 shadow-sm">
            <div className="bg-[#f5f5f7] rounded-xl p-4 lg:p-6">
              <div className="grid grid-cols-1 xl:grid-cols-[minmax(520px,0.9fr)_minmax(680px,1.1fr)] gap-5 lg:gap-6">
                <div className="space-y-4">
                  <div className="bg-white rounded-xl p-5 border border-[#e5e5e5]">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="h-7 w-7 rounded-md bg-[#f5f5f7] border border-[#e5e5e5] flex items-center justify-center">
                        <Upload className="h-4 w-4 text-[#1d1d1f]" />
                      </div>
                      <span className="text-[13px] font-medium text-[#1d1d1f]">上传产品图</span>
                    </div>
                    <div className="aspect-[4/3] rounded-xl bg-[#fafafa] border-2 border-dashed border-[#e5e5e5] flex flex-col items-center justify-center cursor-pointer hover:border-[#ccc] hover:bg-[#f5f5f7] transition-colors">
                      <ImageIcon className="h-10 w-10 text-[#ccc] mb-2" />
                      <span className="text-[12px] text-[#999]">点击或拖拽上传产品图片</span>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-5 border border-[#e5e5e5]">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="h-7 w-7 rounded-md bg-cyan-50 border border-cyan-200 flex items-center justify-center">
                        <Wand2 className="h-4 w-4 text-cyan-600" />
                      </div>
                      <span className="text-[13px] font-medium text-[#1d1d1f]">AI 智能识别</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {["品类：休闲T恤", "材质：100%纯棉", "颜色：白/黑/灰", "卖点：透气舒适"].map((item, i) => (
                        <div key={i} className="flex items-center gap-2 text-[12px]">
                          <Check className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                          <span className="text-[#666]">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-5 border border-[#e5e5e5]">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="h-7 w-7 rounded-md bg-amber-50 border border-amber-200 flex items-center justify-center">
                        <Store className="h-4 w-4 text-amber-600" />
                      </div>
                      <span className="text-[13px] font-medium text-[#1d1d1f]">平台配置</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {platforms.map((p) => (
                        <span key={p.id} className="text-[11px] px-3 py-1.5 rounded-md bg-[#f5f5f7] border border-[#e5e5e5] text-[#666] hover:border-[#ccc] hover:bg-white cursor-pointer transition-colors">
                          {p.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-white rounded-xl p-5 border border-[#e5e5e5] h-full">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-md bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                          <Layers className="h-4 w-4 text-emerald-600" />
                        </div>
                        <span className="text-[13px] font-medium text-[#1d1d1f]">生成预览</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button className="h-7 w-7 rounded-md bg-[#f5f5f7] flex items-center justify-center text-[#999] hover:bg-white hover:text-[#1d1d1f] transition-colors cursor-pointer">
                          <ZoomIn className="h-3.5 w-3.5" />
                        </button>
                        <button className="h-7 w-7 rounded-md bg-[#f5f5f7] flex items-center justify-center text-[#999] hover:bg-white hover:text-[#1d1d1f] transition-colors cursor-pointer">
                          <Square className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { title: "主图", subtitle: "白底图" },
                        { title: "场景图", subtitle: "使用场景" },
                        { title: "细节图", subtitle: "材质特写" },
                        { title: "卖点图", subtitle: "核心卖点" },
                      ].map((item, i) => (
                        <div key={i} className="group">
                          <div className="aspect-[4/3] rounded-lg bg-gradient-to-br from-[#f5f5f7] to-[#e5e5e5] flex flex-col items-center justify-center cursor-pointer hover:shadow-md transition-shadow">
                            <Camera className="h-8 w-8 text-[#ccc] mb-1 group-hover:text-[#999] transition-colors" />
                            <span className="text-[10px] text-[#999]">{item.title}</span>
                          </div>
                          <div className="mt-2 text-[11px] text-[#666]">{item.subtitle}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-[#e5e5e5]">
                    <div className="flex items-center gap-3">
                      <div className="h-2 flex-1 rounded-full bg-[#f5f5f7] overflow-hidden">
                        <div className="h-full w-1/2 rounded-full bg-[#1d1d1f] animate-pulse" />
                      </div>
                      <span className="text-[12px] text-[#86868b] whitespace-nowrap">AI 正在生成中...</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-10 py-14">
        <div className="max-w-[1600px] mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-[24px] md:text-[28px] font-bold mb-3 text-[#1d1d1f]">全品类商品图：从一张原图到全套详情页</h2>
            <p className="text-[14px] text-[#86868b] max-w-xl mx-auto">
              无论食品、美妆、数码、服装还是家居，AI 都能理解产品特性，生成符合品类调性的专业视觉。
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {showcaseItems.map((item, i) => (
              <div key={i} className="group bg-white rounded-2xl overflow-hidden cursor-pointer border border-[#e5e5e5] hover:shadow-lg hover:-translate-y-0.5 transition-all">
                <div className={`aspect-[3/4] bg-gradient-to-br ${item.gradient} flex items-center justify-center relative`}>
                  <ImageIcon className="h-10 w-10 text-[#ccc] group-hover:text-[#999] transition-colors" />
                </div>
                <div className="p-3">
                  <div className="text-[14px] font-semibold text-[#1d1d1f]">{item.subtitle}</div>
                  <div className="text-[12px] text-[#86868b]">{item.title}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-10 py-14">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-[24px] md:text-[28px] font-bold mb-3 text-[#1d1d1f]">燎原 AI vs 传统设计模式</h2>
            <p className="text-[14px] text-[#86868b]">对比传统设计流程，看看 AI 能为你节省多少时间和成本</p>
          </div>
          <div className="bg-white rounded-2xl border border-[#e5e5e5] overflow-hidden">
            <div className="grid grid-cols-3 border-b border-[#e5e5e5]">
              <div className="p-4 text-[12px] font-medium text-[#86868b]">对比项</div>
              <div className="p-4 text-[12px] font-medium text-[#86868b] text-center">传统设计</div>
              <div className="p-4 text-[12px] font-medium text-[#1d1d1f] text-center">燎原 AI</div>
            </div>
            {comparisonData.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 ${i < comparisonData.length - 1 ? "border-b border-[#f5f5f7]" : ""}`}>
                <div className="p-4 text-[12px] text-[#1d1d1f]">{row.feature}</div>
                <div className="p-4 text-[12px] text-[#86868b] text-center flex items-center justify-center">
                  <X className="h-3.5 w-3.5 text-red-400 mr-1.5" />
                  {row.traditional}
                </div>
                <div className="p-4 text-[12px] text-[#1d1d1f] text-center flex items-center justify-center">
                  <Check className="h-3.5 w-3.5 text-emerald-500 mr-1.5" />
                  {row.picset}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-10 py-14">
        <div className="max-w-[1600px] mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-[24px] md:text-[28px] font-bold mb-3 text-[#1d1d1f]">核心竞争优势</h2>
            <p className="text-[14px] text-[#86868b]">为什么越来越多的电商团队选择燎原 AI</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {advantages.map((adv, i) => {
              const Icon = adv.icon;
              return (
                <div key={i} className={`bg-white rounded-2xl p-6 border ${adv.border} hover:shadow-md transition-shadow`}>
                  <div className={`h-12 w-12 rounded-xl ${adv.bg} flex items-center justify-center mb-4`}>
                    <Icon className={`h-6 w-6 ${adv.iconColor}`} />
                  </div>
                  <h3 className="text-[14px] font-semibold text-[#1d1d1f] mb-2">{adv.title}</h3>
                  <p className="text-[12px] text-[#86868b] leading-[1.7]">{adv.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-10 py-14">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-[24px] md:text-[28px] font-bold mb-3 text-[#1d1d1f]">常见问题</h2>
            <p className="text-[14px] text-[#86868b]">关于燎原 AI 的常见疑问解答</p>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <FAQItem key={i} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-10 py-14">
        <div className="max-w-[1200px] mx-auto">
          <div className="bg-white rounded-2xl p-8 md:p-12 border border-[#e5e5e5] text-center">
            <h2 className="text-[24px] md:text-[28px] font-bold mb-4 text-[#1d1d1f]">准备好开始了吗？</h2>
            <p className="text-[14px] text-[#86868b] mb-6 max-w-md mx-auto">
              上传你的产品图，让 AI 为你生成专业级电商视觉资产。
            </p>
            <Link href="/workspace/create">
              <Button size="lg" className="bg-[#1d1d1f] text-white hover:bg-[#333] text-[14px] px-10 h-12 rounded-full font-semibold cursor-pointer transition-all hover:shadow-lg hover:shadow-black/10">
                免费试用
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#e5e5e5] py-6 px-4 sm:px-6 lg:px-10">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-2">
            <div className="h-6 w-6 rounded-md bg-[#1d1d1f] flex items-center justify-center">
              <Sparkles className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-[14px] font-semibold text-[#1d1d1f]">燎原 AI</span>
          </div>
          <p className="text-[12px] text-[#86868b]">© 2026 燎原 AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
