import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  Upload,
  Wand2,
  Target,
  Layers,
  FileText,
  Palette,
  Zap,
  Shield,
  Globe,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const coreFeatures = [
  {
    icon: <Wand2 className="h-7 w-7" />,
    title: "AI 自动识别商品",
    desc: "上传任意产品图，AI 自动识别商品名称、品类、颜色、材质、卖点等 11 项信息，无需手动填写",
    detail: "基于通义千问 VL 多模态大模型，识别准确率高达 95%，支持手机拍摄图片",
  },
  {
    icon: <Target className="h-7 w-7" />,
    title: "9 大电商平台适配",
    desc: "自动匹配淘宝、天猫、京东、拼多多、抖音、小红书、Amazon、Temu、Shopify 的图片尺寸和风格规则",
    detail: "每个平台有独立的图片尺寸、风格偏好、文案调性和排版规则，系统自动适配",
  },
  {
    icon: <Layers className="h-7 w-7" />,
    title: "一键生成全套图片",
    desc: "自动生成商品主图、场景图、细节图、卖点图，按平台规则组合输出",
    detail: "淘宝 5 张主图 + 4 张场景图 + 3 张细节图 + 4 张卖点图，其他平台自动调整数量",
  },
  {
    icon: <FileText className="h-7 w-7" />,
    title: "AI 生成详情页文案",
    desc: "自动生成主标题、副标题、核心卖点、产品详情、FAQ 等完整文案",
    detail: "根据平台调性自动调整文案风格：淘宝感性堆叠、京东参数详实、抖音种草风",
  },
  {
    icon: <Palette className="h-7 w-7" />,
    title: "5 种视觉风格",
    desc: "简约、轻奢、国潮、科技、自然，一键切换不同视觉风格",
    detail: "每种风格有独立的提示词模板、色彩方案和构图规则",
  },
  {
    icon: <Zap className="h-7 w-7" />,
    title: "零门槛，无需提示词",
    desc: "用户不需要懂设计，不需要会写 AI 提示词，系统全自动处理",
    detail: "提示词生成、平台规则匹配、图片生成都由系统在后台完成",
  },
  {
    icon: <Shield className="h-7 w-7" />,
    title: "内容安全审核",
    desc: "全流程内容安全审核，确保生成内容合规，可商用",
    detail: "接入内容安全 API，自动检测敏感内容和版权风险",
  },
  {
    icon: <Download className="h-7 w-7" />,
    title: "一键导出下载",
    desc: "支持单张下载和批量打包下载，直接上传到电商平台",
    detail: "输出格式符合各平台上传规范，无需二次处理",
  },
];

const workflowSteps = [
  {
    step: 1,
    title: "上传产品图",
    desc: "上传任意产品图片，手机拍摄即可",
    icon: <Upload className="h-6 w-6" />,
  },
  {
    step: 2,
    title: "AI 识别商品",
    desc: "自动识别商品名称、品类、材质、颜色、卖点",
    icon: <Wand2 className="h-6 w-6" />,
  },
  {
    step: 3,
    title: "选择平台和风格",
    desc: "选择目标电商平台和视觉风格",
    icon: <Target className="h-6 w-6" />,
  },
  {
    step: 4,
    title: "AI 生成图片和文案",
    desc: "自动生成提示词、调用 AI 生图、生成文案",
    icon: <Sparkles className="h-6 w-6" />,
  },
  {
    step: 5,
    title: "预览和导出",
    desc: "预览生成结果，编辑调整，一键下载",
    icon: <Download className="h-6 w-6" />,
  },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f]">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-[#e5e5e5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            <div className="flex items-center space-x-2">
              <div className="h-7 w-7 rounded-lg bg-[#1d1d1f] flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="text-[16px] font-semibold tracking-tight">图流 AI</span>
            </div>
            <div className="hidden md:flex items-center space-x-8 text-[14px]">
              <Link href="/" className="text-[#86868b] hover:text-[#1d1d1f] transition-colors">首页</Link>
              <span className="text-[#1d1d1f] font-medium">功能介绍</span>
              <Link href="/cases" className="text-[#86868b] hover:text-[#1d1d1f] transition-colors">案例展示</Link>
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

      <section className="pt-28 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-[40px] md:text-[48px] font-bold text-[#1d1d1f] mb-4 tracking-[-0.02em]">
            从上传到导出，
            <br className="sm:hidden" />全流程 AI 自动化
          </h1>
          <p className="text-[18px] text-[#86868b] max-w-2xl mx-auto leading-[1.7]">
            不需要设计经验，不需要会写提示词，上传产品图就能生成整套电商视觉素材
          </p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-[24px] font-bold text-center text-[#1d1d1f] mb-12">工作流程</h2>
          <div className="flex flex-col md:flex-row items-start gap-4">
            {workflowSteps.map((s, i) => (
              <div key={i} className="flex-1 relative">
                <Card className="border border-[#e5e5e5] h-full rounded-2xl">
                  <CardContent className="pt-6 text-center">
                    <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-[#f5f5f7] text-[#1d1d1f] mb-4">
                      {s.icon}
                    </div>
                    <div className="text-[12px] font-bold text-[#86868b] mb-1">步骤 {s.step}</div>
                    <h3 className="font-semibold text-[#1d1d1f] mb-2 text-[16px]">{s.title}</h3>
                    <p className="text-[14px] text-[#86868b]">{s.desc}</p>
                  </CardContent>
                </Card>
                {i < workflowSteps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 text-[#ccc]">
                    <ArrowRight className="h-5 w-5" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-[24px] font-bold text-center text-[#1d1d1f] mb-4">核心功能</h2>
          <p className="text-[#86868b] text-center mb-12 text-[16px]">8 大核心能力，覆盖电商视觉生产全链路</p>
          <div className="grid md:grid-cols-2 gap-5">
            {coreFeatures.map((f, i) => (
              <Card key={i} className="border border-[#e5e5e5] rounded-2xl hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    <div className="h-12 w-12 rounded-xl bg-[#f5f5f7] text-[#1d1d1f] flex items-center justify-center flex-shrink-0">
                      {f.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#1d1d1f] mb-1 text-[16px]">{f.title}</h3>
                      <p className="text-[14px] text-[#666] mb-2">{f.desc}</p>
                      <p className="text-[12px] text-[#86868b]">{f.detail}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-[24px] font-bold text-[#1d1d1f] mb-4">开始体验</h2>
          <p className="text-[#86868b] mb-8 text-[16px]">上传一张产品图，亲自感受 AI 生成的效果</p>
          <Link href="/workspace/create">
            <Button size="lg" className="bg-[#1d1d1f] text-white hover:bg-[#333] px-8 h-12 rounded-full font-medium cursor-pointer transition-all hover:shadow-lg hover:shadow-black/10">
              <Upload className="mr-2 h-5 w-5" />
              免费开始使用
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
