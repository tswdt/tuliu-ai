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
  { id: "SIMPLE", name: "简约", desc: "干净留白，突出产品", color: "from-gray-400 to-gray-600" },
  { id: "LUXURY", name: "轻奢", desc: "高级质感，金色点缀", color: "from-amber-400 to-amber-600" },
  { id: "GUOCHAO", name: "国潮", desc: "中国风元素，传统配色", color: "from-red-400 to-red-600" },
  { id: "TECH", name: "科技", desc: "蓝紫渐变，未来感", color: "from-blue-400 to-violet-600" },
  { id: "NATURE", name: "自然", desc: "清新自然，绿色系", color: "from-emerald-400 to-green-600" },
];

export default function ConfigurePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">加载中...</div>}>
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
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">配置生成</h1>
        <p className="text-sm text-gray-500 mt-1">选择目标平台和视觉风格，确认卖点信息</p>
      </div>

      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-full bg-green-600 text-white flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <span className="text-sm font-medium text-green-600">上传图片</span>
          </div>
          <div className="h-px flex-1 bg-green-300" />
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-full bg-green-600 text-white flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <span className="text-sm font-medium text-green-600">AI 识别</span>
          </div>
          <div className="h-px flex-1 bg-violet-300" />
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-full bg-violet-600 text-white flex items-center justify-center text-xs font-bold">3</div>
            <span className="text-sm font-medium text-violet-600">配置生成</span>
          </div>
          <div className="h-px flex-1 bg-gray-200" />
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-full bg-gray-200 text-gray-400 flex items-center justify-center text-xs font-bold">4</div>
            <span className="text-sm text-gray-400">生成结果</span>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Store className="h-5 w-5 text-violet-600" />
            <h2 className="text-lg font-semibold text-gray-900">选择平台</h2>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {platforms.map((p) => (
              <Card
                key={p.id}
                className={`cursor-pointer transition-all ${
                  selectedPlatform === p.id
                    ? "border-2 border-violet-500 shadow-md shadow-violet-100"
                    : "border shadow-sm hover:shadow-md"
                }`}
                onClick={() => setSelectedPlatform(p.id)}
              >
                <CardContent className="py-3 px-4 text-center">
                  <div className="text-2xl mb-1">{p.icon}</div>
                  <div className="text-sm font-medium text-gray-900">{p.name}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{p.desc}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-4">
            <Palette className="h-5 w-5 text-violet-600" />
            <h2 className="text-lg font-semibold text-gray-900">选择风格</h2>
          </div>
          <div className="grid grid-cols-5 gap-3">
            {styles.map((s) => (
              <Card
                key={s.id}
                className={`cursor-pointer transition-all ${
                  selectedStyle === s.id
                    ? "border-2 border-violet-500 shadow-md shadow-violet-100"
                    : "border shadow-sm hover:shadow-md"
                }`}
                onClick={() => setSelectedStyle(s.id)}
              >
                <CardContent className="py-3 px-4 text-center">
                  <div className={`h-8 w-8 rounded-lg bg-gradient-to-br ${s.color} mx-auto mb-2`} />
                  <div className="text-sm font-medium text-gray-900">{s.name}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{s.desc}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-violet-600" />
            <h2 className="text-lg font-semibold text-gray-900">卖点信息</h2>
            <span className="text-xs text-gray-400">（可编辑，AI 已根据识别结果推荐）</span>
          </div>
          <Card className="border-0 shadow-sm">
            <CardContent className="py-4">
              <div className="flex flex-wrap gap-2 mb-3">
                {sellingPoints.map((sp, i) => (
                  <span key={i} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-violet-50 text-violet-700 text-sm">
                    {sp}
                    <button onClick={() => removeSellingPoint(i)} className="hover:text-violet-900">
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
                  className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
                <Button onClick={addSellingPoint} variant="outline" size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex items-center justify-between mt-8">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          上一步
        </Button>
        <Button onClick={handleGenerate} className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
          <Sparkles className="h-4 w-4 mr-2" />
          开始生成
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
