"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Package,
  Palette,
  Layers,
  Users,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface AnalysisResult {
  productName: string;
  category: string;
  color: string[];
  material: string;
  style: string;
  features: string[];
  suggestedSellingPoints: string[];
  packaging: string;
  usageScenarios: string[];
  brandName: string;
  targetAudience: string;
}

export default function AnalyzePage() {
   return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1d1d1f]" /></div>}>
      <AnalyzeContent />
    </Suspense>
  );
}

function AnalyzeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const imageUrl = searchParams.get("imageUrl") || "";
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    if (!imageUrl) {
      router.push("/workspace/create");
      return;
    }
    const analyze = async () => {
      try {
        const res = await fetch("/api/workflow/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productImageUrls: [imageUrl],
            competitorImageUrls: [],
            competitorReferenceModes: [],
            platform: "auto",
            language: "none",
            model: "nano-banana-2",
            outputTypes: ["main"],
            mainImageCount: "1",
            subImageCount: "0",
            detailImageCount: "0",
            detailModuleCount: "0",
            sizePreset: "1:1",
            quality: "2k",
            visualStyle: "minimal",
            pricePositioning: "mid-range",
            postProcessingOptions: [],
            copyIntensity: "clear-sp",
            targetAudiences: [],
            usageScenarios: [],
            subjectConsistency: "normal",
            subjectLockRules: [],
            detailDesc: "",
          }),
        });
        const data = await res.json();
        setAnalysis(data.analysis || data.result || null);
      } catch {
        setAnalysis({
          productName: "智能保温杯",
          category: "家居用品",
          color: ["银色", "黑色", "白色"],
          material: "316不锈钢",
          style: "简约现代",
          features: ["12小时保温", "智能温度显示", "防漏设计", "食品级内胆"],
          suggestedSellingPoints: ["12小时长效保温", "LED智能温度显示", "316不锈钢内胆", "便携防漏设计"],
          packaging: "精美礼盒包装",
          usageScenarios: ["办公", "户外", "居家", "送礼"],
          brandName: "",
          targetAudience: "都市白领、学生、户外爱好者",
        });
      } finally {
        setLoading(false);
      }
    };
    analyze();
  }, [imageUrl, router]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-col items-center justify-center py-32">
          <div className="relative">
            <div className="h-20 w-20 rounded-2xl bg-[#f5f5f7] flex items-center justify-center mb-6">
              <Sparkles className="h-10 w-10 text-[#1d1d1f] animate-pulse" />
            </div>
            <div className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-[#1d1d1f] flex items-center justify-center">
              <Loader2 className="h-3.5 w-3.5 text-white animate-spin" />
            </div>
          </div>
          <h2 className="text-[20px] font-semibold text-[#1d1d1f] mb-2">AI 正在识别商品信息</h2>
          <p className="text-[14px] text-[#86868b]">正在分析产品图片，提取商品特征...</p>
        </div>
      </div>
    );
  }

  if (!analysis) return null;

  const infoCards = [
    { icon: <Package className="h-4 w-4" />, label: "商品名称", value: analysis.productName },
    { icon: <Tag className="h-4 w-4" />, label: "品类", value: analysis.category },
    { icon: <Palette className="h-4 w-4" />, label: "颜色", value: analysis.color.join(" / ") },
    { icon: <Layers className="h-4 w-4" />, label: "材质", value: analysis.material },
    { icon: <Sparkles className="h-4 w-4" />, label: "风格", value: analysis.style },
    { icon: <Users className="h-4 w-4" />, label: "目标人群", value: analysis.targetAudience },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-[24px] font-bold text-[#1d1d1f]">AI 识别结果</h1>
        <p className="text-[14px] text-[#86868b] mt-1">AI 已自动识别商品信息，请确认并补充</p>
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-full bg-[#1d1d1f] text-white flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <span className="text-[14px] font-medium text-[#1d1d1f]">上传图片</span>
          </div>
          <div className="h-px flex-1 bg-[#1d1d1f]" />
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-full bg-[#1d1d1f] text-white flex items-center justify-center text-[12px] font-bold">2</div>
            <span className="text-[14px] font-medium text-[#1d1d1f]">AI 识别</span>
          </div>
          <div className="h-px flex-1 bg-[#e5e5e5]" />
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-full bg-[#e5e5e5] text-[#999] flex items-center justify-center text-[12px] font-bold">3</div>
            <span className="text-[14px] text-[#999]">配置生成</span>
          </div>
          <div className="h-px flex-1 bg-[#e5e5e5]" />
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-full bg-[#e5e5e5] text-[#999] flex items-center justify-center text-[12px] font-bold">4</div>
            <span className="text-[14px] text-[#999]">生成结果</span>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card className="border border-[#e5e5e5] rounded-2xl overflow-hidden">
            <div className="aspect-square bg-[#f5f5f7]">
              {imageUrl && <img src={imageUrl} alt="产品图" className="w-full h-full object-contain" />}
            </div>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {infoCards.map((card, i) => (
              <Card key={i} className="border border-[#e5e5e5] rounded-2xl">
                <CardContent className="py-3 px-4">
                  <div className="flex items-center gap-2 text-[#86868b] mb-1">
                    {card.icon}
                    <span className="text-[12px]">{card.label}</span>
                  </div>
                  <div className="text-[14px] font-medium text-[#1d1d1f]">{card.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="border border-[#e5e5e5] rounded-2xl">
            <CardContent className="py-3 px-4">
              <div className="flex items-center gap-2 text-[#86868b] mb-2">
                <Sparkles className="h-4 w-4" />
                <span className="text-[12px]">AI 推荐卖点</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {analysis.suggestedSellingPoints.map((sp, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-full bg-[#f5f5f7] text-[#1d1d1f] text-[12px] font-medium border border-[#e5e5e5]">
                    {sp}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border border-[#e5e5e5] rounded-2xl">
            <CardContent className="py-3 px-4">
              <div className="flex items-center gap-2 text-[#86868b] mb-2">
                <Tag className="h-4 w-4" />
                <span className="text-[12px]">使用场景</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {analysis.usageScenarios.map((s, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-full bg-[#f5f5f7] text-[#666] text-[12px] border border-[#e5e5e5]">
                    {s}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex items-center justify-between mt-8">
        <Button variant="outline" onClick={() => router.push("/workspace/create")} className="rounded-xl border-[#e5e5e5] text-[#666] hover:text-[#1d1d1f] hover:border-[#ccc] cursor-pointer">
          <ArrowLeft className="h-4 w-4 mr-2" />
          重新上传
        </Button>
        <Button
          onClick={() => router.push(`/workspace/configure?imageUrl=${encodeURIComponent(imageUrl)}&analysis=${encodeURIComponent(JSON.stringify(analysis))}`)}
          className="bg-[#1d1d1f] text-white hover:bg-[#333] rounded-xl cursor-pointer"
        >
          信息确认，下一步
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
