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
import { Card, CardContent } from "@/components/ui/card";

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
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">加载中...</div>}>
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
    "from-violet-400 to-indigo-500",
    "from-blue-400 to-cyan-500",
    "from-pink-400 to-rose-500",
    "from-amber-400 to-orange-500",
    "from-emerald-400 to-green-500",
    "from-purple-400 to-fuchsia-500",
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">生成结果</h1>
          <p className="text-sm text-gray-500 mt-1">
            {platformNames[platform] || platform} · {styleNames[style] || style} · 共 {images.length} 张图
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.push("/workspace/new")}>
            <Plus className="h-4 w-4 mr-2" />
            新建项目
          </Button>
          <Button className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
            <Download className="h-4 w-4 mr-2" />
            批量下载
          </Button>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center gap-3">
          {["上传图片", "AI 识别", "配置生成", "生成结果"].map((step, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-full bg-green-600 text-white flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium text-green-600">{step}</span>
              {i < 3 && <div className="h-px w-8 bg-green-300" />}
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Image className="h-5 w-5 text-violet-600" />
              生成图片
            </h2>
            <Button variant="outline" size="sm">
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
              重新生成
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {images.map((img: any, i: number) => (
              <Card key={i} className="border-0 shadow-sm overflow-hidden group">
                <div className={`aspect-square bg-gradient-to-br ${imageColors[i % imageColors.length]} flex items-center justify-center relative`}>
                  {img.url ? (
                    <img src={img.url} alt={img.type} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center text-white">
                      <Image className="h-8 w-8 mx-auto mb-2 opacity-60" />
                      <span className="text-sm font-medium opacity-80">{img.type}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex gap-2">
                      <Button size="sm" variant="secondary" className="h-8">
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="sm" variant="secondary" className="h-8">
                        <Edit3 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
                <CardContent className="py-2 px-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-700">{img.type}</span>
                    <Button variant="ghost" size="sm" className="h-6 text-xs text-gray-400">
                      <Download className="h-3 w-3 mr-1" />
                      下载
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-violet-600" />
              生成文案
            </h2>
            <Card className="border-0 shadow-sm">
              <CardContent className="py-4 space-y-4">
                <div>
                  <label className="text-xs text-gray-400">主标题</label>
                  <p className="text-sm font-medium text-gray-900 mt-0.5">{copy.title}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-400">副标题</label>
                  <p className="text-sm text-gray-700 mt-0.5">{copy.subtitle}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-400">核心卖点</label>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {copy.sellingPoints?.map((sp: string, i: number) => (
                      <span key={i} className="px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 text-xs">{sp}</span>
                    ))}
                  </div>
                </div>
                {copy.description && (
                  <div>
                    <label className="text-xs text-gray-400">产品描述</label>
                    <p className="text-sm text-gray-600 mt-0.5">{copy.description}</p>
                  </div>
                )}
                <Button variant="outline" size="sm" className="w-full">
                  <Copy className="h-3.5 w-3.5 mr-1.5" />
                  复制文案
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card className="border-0 shadow-sm">
            <CardContent className="py-4 space-y-3">
              <h3 className="text-sm font-semibold text-gray-900">快捷操作</h3>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Edit3 className="h-3.5 w-3.5 mr-2" />
                编辑详情页
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <ExternalLink className="h-3.5 w-3.5 mr-2" />
                预览详情页
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Download className="h-3.5 w-3.5 mr-2" />
                导出 HTML
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
