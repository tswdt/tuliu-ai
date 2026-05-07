"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Download,
  Edit3,
  RefreshCw,
  Plus,
  Image,
  FileText,
  CheckCircle2,
  Copy,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const platformNames: Record<string, string> = {
  TAOBAO: "淘宝",
  TMALL: "天猫",
  JD: "京东",
  PDD: "拼多多",
  DOUYIN: "抖音",
  XIAOHONGSHU: "小红书",
  AMAZON: "Amazon",
  TEMU: "Temu",
  SHOPIFY: "Shopify",
};

const styleNames: Record<string, string> = {
  SIMPLE: "简约",
  LUXURY: "轻奢",
  GUOCHAO: "国潮",
  TECH: "科技",
  NATURE: "自然",
};

export default function ResultPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-[#86868b]">加载中...</div>}>
      <ResultContent />
    </Suspense>
  );
}

function ResultContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const platform = searchParams.get("platform") || "TAOBAO";
  const style = searchParams.get("style") || "SIMPLE";

  let result: any = {};
  try {
    const resultStr = searchParams.get("result");
    if (resultStr) result = JSON.parse(decodeURIComponent(resultStr));
  } catch {}

  const images = result.images || [
    { type: "主图", url: "", prompt: "商品主图" },
    { type: "场景图", url: "", prompt: "使用场景" },
    { type: "细节图", url: "", prompt: "细节特写" },
    { type: "卖点图", url: "", prompt: "核心卖点" },
  ];

  const copy = result.copy || {
    title: "智能保温杯 · 12小时长效保温",
    subtitle: "316不锈钢内胆 | LED温度显示",
    sellingPoints: ["12小时长效保温", "LED智能温度显示", "316不锈钢内胆", "便携防漏设计"],
    description: "采用316不锈钢内胆，12小时长效保温，LED智能温度显示，让您随时掌握饮品温度。便携防漏设计，适合办公、户外等多种场景。",
  };

  const imageColors = [
    "from-slate-100 to-gray-200",
    "from-blue-100 to-cyan-100",
    "from-pink-100 to-rose-100",
    "from-amber-100 to-orange-100",
    "from-emerald-100 to-green-100",
    "from-purple-100 to-fuchsia-100",
  ];

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-[24px] font-bold text-[#1d1d1f]">生成结果</h1>
          <p className="text-[14px] text-[#86868b] mt-1">
            {platformNames[platform] || platform} · {styleNames[style] || style} · 共 {images.length} 张图
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.push("/workspace/create")} className="border-[#e5e5e5] text-[#666] hover:text-[#1d1d1f] hover:border-[#ccc] rounded-xl cursor-pointer interactive-button">
            <Plus className="h-4 w-4 mr-2" />
            新建项目
          </Button>
          <Button className="bg-[#1d1d1f] text-white hover:bg-[#333] rounded-xl cursor-pointer interactive-button">
            <Download className="h-4 w-4 mr-2" />
            批量下载
          </Button>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center gap-3">
          {["上传图片", "AI 识别", "配置生成", "生成结果"].map((step, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-full bg-[#1d1d1f] text-white flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <span className="text-[14px] font-medium text-[#1d1d1f]">{step}</span>
              {i < 3 && <div className="h-[1px] w-8 bg-[#1d1d1f]" />}
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[18px] font-semibold text-[#1d1d1f] flex items-center gap-2">
              <Image className="h-5 w-5 text-[#86868b]" />
              生成图片
            </h2>
            <Button variant="outline" size="sm" className="border-[#e5e5e5] text-[#666] hover:text-[#1d1d1f] rounded-xl cursor-pointer">
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
              重新生成
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {images.map((img: any, i: number) => (
              <div key={i} className="bg-white rounded-2xl border border-[#e5e5e5] overflow-hidden group hover:shadow-md transition-shadow">
                <div className={`aspect-square bg-gradient-to-br ${imageColors[i % imageColors.length]} flex items-center justify-center relative`}>
                  {img.url ? (
                    <img src={img.url} alt={img.type} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center text-[#999]">
                      <Image className="h-8 w-8 mx-auto mb-2 opacity-40" />
                      <span className="text-[14px] font-medium opacity-60">{img.type}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex gap-2">
                      <Button size="sm" variant="secondary" className="h-8 rounded-lg">
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="sm" variant="secondary" className="h-8 rounded-lg">
                        <Edit3 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="py-2 px-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-medium text-[#1d1d1f]">{img.type}</span>
                    <Button variant="ghost" size="sm" className="h-6 text-[12px] text-[#86868b] hover:text-[#1d1d1f] cursor-pointer">
                      <Download className="h-3 w-3 mr-1" />
                      下载
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h2 className="text-[18px] font-semibold text-[#1d1d1f] flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-[#86868b]" />
              生成文案
            </h2>
            <div className="bg-white rounded-2xl border border-[#e5e5e5] p-4 space-y-4">
              <div>
                <label className="text-[12px] text-[#86868b]">主标题</label>
                <p className="text-[14px] font-medium text-[#1d1d1f] mt-0.5">{copy.title}</p>
              </div>
              <div>
                <label className="text-[12px] text-[#86868b]">副标题</label>
                <p className="text-[14px] text-[#666] mt-0.5">{copy.subtitle}</p>
              </div>
              <div>
                <label className="text-[12px] text-[#86868b]">核心卖点</label>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {copy.sellingPoints?.map((sp: string, i: number) => (
                    <span key={i} className="px-2 py-0.5 rounded-full bg-[#f5f5f7] text-[#1d1d1f] text-[12px] border border-[#e5e5e5]">{sp}</span>
                  ))}
                </div>
              </div>
              {copy.description && (
                <div>
                  <label className="text-[12px] text-[#86868b]">产品描述</label>
                  <p className="text-[14px] text-[#666] mt-0.5 leading-[1.6]">{copy.description}</p>
                </div>
              )}
              <Button variant="outline" size="sm" className="w-full border-[#e5e5e5] text-[#666] hover:text-[#1d1d1f] hover:border-[#ccc] rounded-xl cursor-pointer">
                <Copy className="h-3.5 w-3.5 mr-1.5" />
                复制文案
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#e5e5e5] p-4 space-y-3">
            <h3 className="text-[14px] font-semibold text-[#1d1d1f]">快捷操作</h3>
            <Button variant="outline" size="sm" className="w-full justify-start border-[#e5e5e5] text-[#666] hover:text-[#1d1d1f] hover:border-[#ccc] rounded-xl cursor-pointer">
              <Edit3 className="h-3.5 w-3.5 mr-2" />
              编辑详情页
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start border-[#e5e5e5] text-[#666] hover:text-[#1d1d1f] hover:border-[#ccc] rounded-xl cursor-pointer">
              <ExternalLink className="h-3.5 w-3.5 mr-2" />
              预览详情页
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start border-[#e5e5e5] text-[#666] hover:text-[#1d1d1f] hover:border-[#ccc] rounded-xl cursor-pointer">
              <Download className="h-3.5 w-3.5 mr-2" />
              导出 HTML
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
