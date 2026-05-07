"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Store,
  Palette,
  Sparkles,
  Plus,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const platforms = [
  { id: "TAOBAO", name: "淘宝", icon: "🛒", desc: "5张主图 + 详情页" },
  { id: "TMALL", name: "天猫", icon: "🐱", desc: "5张主图 + 品牌详情" },
  { id: "JD", name: "京东", icon: "🐕", desc: "5张主图 + 参数详情" },
  { id: "PDD", name: "拼多多", icon: "🍊", desc: "10张轮播图 + 详情" },
  { id: "DOUYIN", name: "抖音", icon: "🎵", desc: "5张主图 + 短视频封面" },
  { id: "XIAOHONGSHU", name: "小红书", icon: "📕", desc: "3:4竖版种草图" },
  { id: "AMAZON", name: "Amazon", icon: "📦", desc: "7张主图 + A+页面" },
  { id: "TEMU", name: "Temu", icon: "🌍", desc: "6张主图 + 详情页" },
  { id: "SHOPIFY", name: "Shopify", icon: "🛍️", desc: "自定义尺寸 + 详情页" },
];

const styles = [
  { id: "SIMPLE", name: "简约", desc: "干净留白，突出产品", color: "from-gray-300 to-gray-500" },
  { id: "LUXURY", name: "轻奢", desc: "高级质感，金色点缀", color: "from-amber-300 to-amber-500" },
  { id: "GUOCHAO", name: "国潮", desc: "中国风元素，传统配色", color: "from-red-300 to-red-500" },
  { id: "TECH", name: "科技", desc: "蓝紫渐变，未来感", color: "from-blue-300 to-blue-500" },
  { id: "NATURE", name: "自然", desc: "清新自然，绿色系", color: "from-emerald-300 to-emerald-500" },
];

export default function ConfigurePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-[#86868b]">加载中...</div>}>
      <ConfigureContent />
    </Suspense>
  );
}

function ConfigureContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const imageUrl = searchParams.get("imageUrl") || "";
  const analysisStr = searchParams.get("analysis") || "{}";

  const [selectedPlatform, setSelectedPlatform] = useState("TAOBAO");
  const [selectedStyle, setSelectedStyle] = useState("SIMPLE");
  const [sellingPoints, setSellingPoints] = useState<string[]>([]);
  const [newPoint, setNewPoint] = useState("");

  let analysis: any = {};
  try {
    analysis = JSON.parse(decodeURIComponent(analysisStr));
  } catch {}

  useState(() => {
    if (analysis.suggestedSellingPoints) {
      setSellingPoints(analysis.suggestedSellingPoints);
    }
  });

  const addSellingPoint = () => {
    if (newPoint.trim() && !sellingPoints.includes(newPoint.trim())) {
      setSellingPoints([...sellingPoints, newPoint.trim()]);
      setNewPoint("");
    }
  };

  const removeSellingPoint = (idx: number) => {
    setSellingPoints(sellingPoints.filter((_, i) => i !== idx));
  };

  const handleGenerate = () => {
    const params = new URLSearchParams({
      imageUrl,
      platform: selectedPlatform,
      style: selectedStyle,
      sellingPoints: JSON.stringify(sellingPoints),
      analysis: analysisStr,
    });
    router.push(`/workspace/generating?${params.toString()}`);
  };

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4">
      <div className="mb-5">
        <h1 className="text-[24px] font-bold text-[#1d1d1f]">配置生成</h1>
        <p className="text-[14px] text-[#86868b] mt-1">选择目标平台和视觉风格，确认卖点信息</p>
      </div>

      <div className="mb-5">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-full bg-[#1d1d1f] text-white flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <span className="text-[14px] font-medium text-[#1d1d1f]">上传图片</span>
          </div>
          <div className="h-px flex-1 bg-[#1d1d1f]" />
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-full bg-[#1d1d1f] text-white flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <span className="text-[14px] font-medium text-[#1d1d1f]">AI 识别</span>
          </div>
          <div className="h-px flex-1 bg-[#1d1d1f]" />
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-full bg-[#1d1d1f] text-white flex items-center justify-center text-[12px] font-bold">3</div>
            <span className="text-[14px] font-medium text-[#1d1d1f]">配置生成</span>
          </div>
          <div className="h-px flex-1 bg-[#e5e5e5]" />
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-full bg-[#e5e5e5] text-[#999] flex items-center justify-center text-[12px] font-bold">4</div>
            <span className="text-[14px] text-[#999]">生成结果</span>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Store className="h-5 w-5 text-[#1d1d1f]" />
            <h2 className="text-[18px] font-semibold text-[#1d1d1f]">选择平台</h2>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {platforms.map((p) => (
              <Card
                key={p.id}
                className={`cursor-pointer rounded-2xl interactive-card ${
                  selectedPlatform === p.id
                    ? "selected"
                    : "border border-[#e5e5e5]"
                }`}
                onClick={() => setSelectedPlatform(p.id)}
              >
                <CardContent className="py-3 px-4 text-center">
                  <div className="text-[24px] mb-1">{p.icon}</div>
                  <div className="text-[14px] font-medium text-[#1d1d1f]">{p.name}</div>
                  <div className="text-[12px] text-[#86868b] mt-0.5">{p.desc}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-4">
            <Palette className="h-5 w-5 text-[#1d1d1f]" />
            <h2 className="text-[18px] font-semibold text-[#1d1d1f]">选择风格</h2>
          </div>
          <div className="grid grid-cols-5 gap-3">
            {styles.map((s) => (
              <Card
                key={s.id}
                className={`cursor-pointer rounded-2xl interactive-card ${
                  selectedStyle === s.id
                    ? "selected"
                    : "border border-[#e5e5e5]"
                }`}
                onClick={() => setSelectedStyle(s.id)}
              >
                <CardContent className="py-3 px-4 text-center">
                  <div className={`h-8 w-8 rounded-lg bg-gradient-to-br ${s.color} mx-auto mb-2`} />
                  <div className="text-[14px] font-medium text-[#1d1d1f]">{s.name}</div>
                  <div className="text-[12px] text-[#86868b] mt-0.5">{s.desc}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-[#1d1d1f]" />
            <h2 className="text-[18px] font-semibold text-[#1d1d1f]">卖点信息</h2>
            <span className="text-[12px] text-[#86868b]">（可编辑，AI 已根据识别结果推荐）</span>
          </div>
          <Card className="border border-[#e5e5e5] rounded-2xl shadow-sm">
            <CardContent className="py-4">
              <div className="flex flex-wrap gap-2 mb-3">
                {sellingPoints.map((sp, i) => (
                  <span key={i} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#f5f5f7] text-[#1d1d1f] text-[14px] border border-[#e5e5e5]">
                    {sp}
                    <button onClick={() => removeSellingPoint(i)} className="hover:text-[#999] cursor-pointer">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newPoint}
                  onChange={(e) => setNewPoint(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addSellingPoint()}
                  placeholder="添加卖点..."
                  className="flex-1 px-4 h-12 rounded-xl border border-[#e5e5e5] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#1d1d1f] focus:border-transparent"
                />
                <Button onClick={addSellingPoint} variant="outline" size="sm" className="rounded-xl border-[#e5e5e5]">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex items-center justify-between mt-8">
        <Button variant="outline" onClick={() => router.back()} className="rounded-xl border-[#e5e5e5] text-[#666] hover:text-[#1d1d1f] hover:border-[#ccc] cursor-pointer interactive-button">
          <ArrowLeft className="h-4 w-4 mr-2" />
          上一步
        </Button>
        <Button onClick={handleGenerate} className="bg-[#1d1d1f] text-white hover:bg-[#333] rounded-xl cursor-pointer interactive-button">
          <Sparkles className="h-4 w-4 mr-2" />
          开始生成
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
