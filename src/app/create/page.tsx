"use client";

import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import {
  Upload,
  X,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  Wand2,
  Target,
  Layers,
  Download,
  ChevronRight,
  Plus,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Step = "upload" | "analyzing" | "configure" | "generating" | "result";

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

interface GeneratedImage {
  url: string;
  imageType: string;
  imageIndex: number;
  prompt: string;
  size: string;
}

interface CopyContent {
  mainTitle: string;
  subTitle: string;
  coreSellingPoints: string[];
  productDetails: string;
  usageScenarios: string[];
  specHighlights: string[];
  faq: Array<{ question: string; answer: string }>;
}

const PLATFORMS = [
  { id: "TAOBAO", name: "淘宝", icon: "淘", color: "bg-orange-500" },
  { id: "TMALL", name: "天猫", icon: "猫", color: "bg-red-500" },
  { id: "JD", name: "京东", icon: "京", color: "bg-red-600" },
  { id: "PINDUODUO", name: "拼多多", icon: "拼", color: "bg-red-400" },
  { id: "DOUYIN", name: "抖音", icon: "抖", color: "bg-gray-900" },
  { id: "XIAOHONGSHU", name: "小红书", icon: "红", color: "bg-pink-500" },
  { id: "AMAZON", name: "Amazon", icon: "A", color: "bg-orange-600" },
  { id: "TEMU", name: "Temu", icon: "T", color: "bg-orange-400" },
];

const STYLES = [
  { id: "SIMPLE", name: "简约", desc: "干净利落，突出产品", emoji: "◻️" },
  { id: "LUXURY", name: "轻奢", desc: "高级质感，光影考究", emoji: "✨" },
  { id: "NATIONAL_TREND", name: "国潮", desc: "中国风元素，文化底蕴", emoji: "🏮" },
  { id: "TECH", name: "科技", desc: "未来感，赛博朋克", emoji: "🔮" },
  { id: "NATURAL", name: "自然", desc: "清新自然，温暖色调", emoji: "🌿" },
];

const CATEGORY_MAP: Record<string, string> = {
  CLOTHING: "服饰", BEAUTY: "美妆", ELECTRONICS: "3C数码", FOOD: "食品",
  HOME: "家居", BABY: "母婴", SPORTS: "运动", JEWELRY: "珠宝",
  AUTOMOTIVE: "汽车", PET: "宠物", STATIONERY: "文具", OTHER: "其他",
};

export default function CreatePage() {
  const [step, setStep] = useState<Step>("upload");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState("TAOBAO");
  const [selectedStyle, setSelectedStyle] = useState("SIMPLE");
  const [sellingPoints, setSellingPoints] = useState<string[]>([]);
  const [newPoint, setNewPoint] = useState("");
  const [editableName, setEditableName] = useState("");

  const [generatingProgress, setGeneratingProgress] = useState(0);
  const [generatingMessage, setGeneratingMessage] = useState("");

  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [copyContent, setCopyContent] = useState<CopyContent | null>(null);

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const removeImage = () => {
    setImagePreview(null);
    setImageFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const startAnalysis = async () => {
    if (!imageFile) return;
    setStep("analyzing");

    const formData = new FormData();
    formData.append("image", imageFile);

    try {
      const res = await fetch("/api/test-workflow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: imagePreview,
          mode: "analyze",
        }),
      });
      const data = await res.json();
      const result: AnalysisResult = data.analysis || getDefaultAnalysis();
      setAnalysis(result);
      setEditableName(result.productName);
      setSellingPoints(result.suggestedSellingPoints.slice(0, 5));
      setStep("configure");
    } catch {
      const fallback = getDefaultAnalysis();
      setAnalysis(fallback);
      setEditableName(fallback.productName);
      setSellingPoints(fallback.suggestedSellingPoints);
      setStep("configure");
    }
  };

  const startGeneration = async () => {
    setStep("generating");
    setGeneratingProgress(5);
    setGeneratingMessage("正在识别商品信息...");

    try {
      const res = await fetch("/api/test-workflow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: imagePreview,
          platform: selectedPlatform,
          style: selectedStyle,
          sellingPoints,
          mode: "full",
        }),
      });

      const data = await res.json();

      if (data.success && data.result) {
        setGeneratedImages(data.result.images || []);
        setCopyContent(data.result.copy || null);
        setGeneratingProgress(100);
        setGeneratingMessage("生成完成！");
        setTimeout(() => setStep("result"), 500);
      } else {
        throw new Error(data.error || "生成失败");
      }
    } catch (err) {
      setGeneratingProgress(60);
      setGeneratingMessage("演示模式：生成模拟结果...");
      setTimeout(() => {
        setGeneratedImages(getDemoImages());
        setCopyContent(getDemoCopy());
        setGeneratingProgress(100);
        setGeneratingMessage("生成完成！");
        setTimeout(() => setStep("result"), 500);
      }, 2000);
    }
  };

  const addSellingPoint = () => {
    if (newPoint.trim()) {
      setSellingPoints([...sellingPoints, newPoint.trim()]);
      setNewPoint("");
    }
  };

  const removeSellingPoint = (index: number) => {
    setSellingPoints(sellingPoints.filter((_, i) => i !== index));
  };

  const stepIndicator = (
    <div className="flex items-center justify-center gap-2 mb-8">
      {[
        { key: "upload", label: "上传", icon: <Upload className="h-4 w-4" /> },
        { key: "configure", label: "配置", icon: <Target className="h-4 w-4" /> },
        { key: "generating", label: "生成", icon: <Sparkles className="h-4 w-4" /> },
        { key: "result", label: "结果", icon: <CheckCircle2 className="h-4 w-4" /> },
      ].map((s, i) => {
        const stepOrder = ["upload", "analyzing", "configure", "generating", "result"];
        const currentIdx = stepOrder.indexOf(step);
        const thisIdx = stepOrder.indexOf(s.key);
        const isActive = s.key === step || (s.key === "configure" && step === "analyzing");
        const isDone = currentIdx > thisIdx;

        return (
          <div key={s.key} className="flex items-center">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              isActive ? "bg-violet-100 text-violet-700" : isDone ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-400"
            }`}>
              {isDone ? <CheckCircle2 className="h-4 w-4" /> : s.icon}
              {s.label}
            </div>
            {i < 3 && <ChevronRight className="h-4 w-4 text-gray-300 mx-1" />}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-gray-900">图流 AI</span>
            </Link>
            <span className="text-gray-300">|</span>
            <span className="text-sm text-gray-500">
              {step === "upload" && "上传产品图"}
              {step === "analyzing" && "AI 识别中"}
              {step === "configure" && "配置生成参数"}
              {step === "generating" && "AI 生成中"}
              {step === "result" && "生成结果"}
            </span>
          </div>
          <Badge variant="outline" className="text-xs">免费体验</Badge>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {stepIndicator}

        {step === "upload" && (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">上传你的产品图</h1>
              <p className="text-gray-500">支持手机拍摄，AI 会自动识别商品信息</p>
            </div>

            {!imagePreview ? (
              <label className="flex flex-col items-center justify-center w-full h-72 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:border-violet-400 hover:bg-violet-50/30 transition-all group">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <div className="h-16 w-16 rounded-2xl bg-violet-100 flex items-center justify-center mb-4 group-hover:bg-violet-200 transition-colors">
                    <Upload className="h-8 w-8 text-violet-600" />
                  </div>
                  <p className="text-lg font-medium text-gray-700 mb-1">点击上传或拖拽图片到此处</p>
                  <p className="text-sm text-gray-400">支持 JPG / PNG / WebP，最大 10MB</p>
                </div>
                <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
              </label>
            ) : (
              <div className="relative">
                <img src={imagePreview} alt="预览" className="w-full max-h-96 object-contain rounded-2xl border bg-white" />
                <button onClick={removeImage} className="absolute top-3 right-3 p-2 bg-white/90 rounded-full shadow-md hover:bg-red-50 transition-colors">
                  <X className="h-5 w-5 text-gray-600" />
                </button>
              </div>
            )}

            <Button
              size="lg"
              className="w-full mt-6 h-12 text-base bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-lg shadow-violet-200"
              onClick={startAnalysis}
              disabled={!imageFile}
            >
              <Wand2 className="mr-2 h-5 w-5" />
              AI 识别商品信息
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        )}

        {step === "analyzing" && (
          <div className="max-w-md mx-auto text-center py-20">
            <div className="h-20 w-20 rounded-3xl bg-violet-100 flex items-center justify-center mx-auto mb-6 animate-pulse">
              <Wand2 className="h-10 w-10 text-violet-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">AI 正在识别商品...</h2>
            <p className="text-gray-500">正在分析商品名称、材质、颜色、卖点等信息</p>
            <Loader2 className="h-8 w-8 text-violet-600 animate-spin mx-auto mt-6" />
          </div>
        )}

        {step === "configure" && analysis && (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">确认商品信息 & 选择平台</h1>
              <p className="text-gray-500">AI 已识别商品信息，你可以修改后开始生成</p>
            </div>

            <div className="grid lg:grid-cols-5 gap-6">
              <div className="lg:col-span-2">
                <Card className="sticky top-24">
                  <CardContent className="pt-6">
                    {imagePreview && (
                      <img src={imagePreview} alt="产品图" className="w-full rounded-xl border mb-4" />
                    )}
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">品类</span>
                        <span className="font-medium">{CATEGORY_MAP[analysis.category] || analysis.category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">颜色</span>
                        <span className="font-medium">{analysis.color.join(" / ")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">材质</span>
                        <span className="font-medium">{analysis.material}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">风格</span>
                        <span className="font-medium">{analysis.style}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">目标人群</span>
                        <span className="font-medium">{analysis.targetAudience}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-3 space-y-6">
                <Card>
                  <CardHeader><CardTitle className="text-base">商品名称</CardTitle></CardHeader>
                  <CardContent>
                    <Input value={editableName} onChange={(e) => setEditableName(e.target.value)} className="text-lg" />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle className="text-base">选择目标平台</CardTitle></CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-4 gap-3">
                      {PLATFORMS.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => setSelectedPlatform(p.id)}
                          className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                            selectedPlatform === p.id
                              ? "border-violet-500 bg-violet-50 shadow-sm"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <div className={`h-10 w-10 rounded-xl ${p.color} flex items-center justify-center text-white font-bold text-sm`}>
                            {p.icon}
                          </div>
                          <span className="text-xs font-medium">{p.name}</span>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle className="text-base">选择生成风格</CardTitle></CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-5 gap-3">
                      {STYLES.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => setSelectedStyle(s.id)}
                          className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                            selectedStyle === s.id
                              ? "border-violet-500 bg-violet-50 shadow-sm"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <span className="text-2xl">{s.emoji}</span>
                          <span className="text-xs font-medium">{s.name}</span>
                          <span className="text-[10px] text-gray-400 hidden md:block">{s.desc}</span>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle className="text-base">核心卖点</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {sellingPoints.map((point, i) => (
                        <Badge key={i} variant="secondary" className="flex items-center gap-1.5 py-1.5 px-3">
                          {point}
                          <button onClick={() => removeSellingPoint(i)} className="hover:text-red-500">
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="添加卖点，如：纯棉面料"
                        value={newPoint}
                        onChange={(e) => setNewPoint(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSellingPoint())}
                      />
                      <Button onClick={addSellingPoint} variant="outline" size="icon">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex gap-4">
                  <Button variant="outline" onClick={() => setStep("upload")} className="h-12">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    返回上传
                  </Button>
                  <Button
                    size="lg"
                    className="flex-1 h-12 text-base bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-lg shadow-violet-200"
                    onClick={startGeneration}
                    disabled={!editableName || sellingPoints.length === 0}
                  >
                    <Sparkles className="mr-2 h-5 w-5" />
                    开始生成
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === "generating" && (
          <div className="max-w-lg mx-auto text-center py-16">
            <div className="h-24 w-24 rounded-3xl bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center mx-auto mb-8">
              <Sparkles className="h-12 w-12 text-violet-600 animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">AI 正在生成...</h2>
            <p className="text-gray-500 mb-8">{generatingMessage}</p>
            <div className="w-full max-w-sm mx-auto">
              <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full transition-all duration-500"
                  style={{ width: `${generatingProgress}%` }}
                />
              </div>
              <p className="text-sm text-gray-400 mt-2">{generatingProgress}%</p>
            </div>
            <div className="mt-8 space-y-3 text-sm text-gray-400">
              <div className="flex items-center justify-center gap-2">
                {generatingProgress > 20 ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Loader2 className="h-4 w-4 animate-spin" />}
                AI 识别商品信息
              </div>
              <div className="flex items-center justify-center gap-2">
                {generatingProgress > 35 ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : generatingProgress > 20 ? <Loader2 className="h-4 w-4 animate-spin" /> : <div className="h-4 w-4" />}
                生成平台适配提示词
              </div>
              <div className="flex items-center justify-center gap-2">
                {generatingProgress > 80 ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : generatingProgress > 40 ? <Loader2 className="h-4 w-4 animate-spin" /> : <div className="h-4 w-4" />}
                AI 生成商品图片
              </div>
              <div className="flex items-center justify-center gap-2">
                {generatingProgress > 92 ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : generatingProgress > 80 ? <Loader2 className="h-4 w-4 animate-spin" /> : <div className="h-4 w-4" />}
                生成详情页文案
              </div>
            </div>
          </div>
        )}

        {step === "result" && (
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-green-100 mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">生成完成！</h1>
              <p className="text-gray-500">已为 {PLATFORMS.find(p => p.id === selectedPlatform)?.name} 平台生成 {generatedImages.length} 张图片</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-base">生成的图片</CardTitle>
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4 mr-1" />
                      全部下载
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {generatedImages.map((img, i) => (
                        <div key={i} className="group relative">
                          <div className="aspect-square rounded-xl border bg-gray-50 overflow-hidden">
                            <img
                              src={img.url}
                              alt={`${img.imageType} ${i + 1}`}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = `https://placehold.co/400x400/f3f4f6/9ca3af?text=${getImageTypeLabel(img.imageType)}+${i + 1}`;
                              }}
                            />
                          </div>
                          <div className="mt-2 flex items-center justify-between">
                            <Badge variant="secondary" className="text-xs">{getImageTypeLabel(img.imageType)}</Badge>
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                              <Download className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                {copyContent && (
                  <Card>
                    <CardHeader><CardTitle className="text-base">生成文案</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-xs text-gray-400 mb-1">主标题</p>
                        <p className="font-semibold text-gray-900">{copyContent.mainTitle}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">副标题</p>
                        <p className="text-sm text-gray-700">{copyContent.subTitle}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">核心卖点</p>
                        <div className="flex flex-wrap gap-1.5">
                          {copyContent.coreSellingPoints.map((p, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">{p}</Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">产品详情</p>
                        <p className="text-sm text-gray-600 leading-relaxed">{copyContent.productDetails}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardContent className="pt-6 space-y-3">
                    <Button className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white" onClick={() => {
                      setStep("configure");
                      setGeneratedImages([]);
                      setCopyContent(null);
                    }}>
                      <Sparkles className="mr-2 h-4 w-4" />
                      换个风格重新生成
                    </Button>
                    <Button variant="outline" className="w-full" onClick={() => {
                      setStep("upload");
                      setImagePreview(null);
                      setImageFile(null);
                      setAnalysis(null);
                      setGeneratedImages([]);
                      setCopyContent(null);
                    }}>
                      <Upload className="mr-2 h-4 w-4" />
                      上传新产品图
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function getImageTypeLabel(type: string): string {
  const map: Record<string, string> = {
    MAIN_IMAGE: "主图",
    SCENE_IMAGE: "场景图",
    DETAIL_IMAGE: "细节图",
    SELLING_POINT_IMAGE: "卖点图",
    DETAIL_PAGE: "详情页",
  };
  return map[type] || type;
}

function getDefaultAnalysis(): AnalysisResult {
  return {
    productName: "未知商品",
    category: "OTHER",
    color: ["未知颜色"],
    material: "未知材质",
    style: "通用风格",
    features: [],
    suggestedSellingPoints: ["品质优良", "性价比高", "实用性强", "设计精美", "做工精细"],
    packaging: "标准包装",
    usageScenarios: ["日常使用"],
    brandName: "未知品牌",
    targetAudience: "通用人群",
  };
}

function getDemoImages(): GeneratedImage[] {
  const types = ["MAIN_IMAGE", "MAIN_IMAGE", "SCENE_IMAGE", "SCENE_IMAGE", "DETAIL_IMAGE", "DETAIL_IMAGE", "SELLING_POINT_IMAGE", "SELLING_POINT_IMAGE"];
  return types.map((type, i) => ({
    url: `https://placehold.co/800x800/e0e7ff/6366f1?text=${getImageTypeLabel(type)}+${i + 1}`,
    imageType: type,
    imageIndex: i,
    prompt: "",
    size: "1024*1024",
  }));
}

function getDemoCopy(): CopyContent {
  return {
    mainTitle: "品质之选 - 匠心打造",
    subTitle: "精选材质，精湛工艺，给您极致体验",
    coreSellingPoints: ["品质优良", "性价比高", "实用性强", "设计精美", "做工精细"],
    productDetails: "这是一款精心打造的产品，采用优质材料，经过严格品质检测，确保每一件产品都能带给您卓越的使用体验。无论是日常使用还是送礼，都是您的不二之选。",
    usageScenarios: ["日常使用", "送礼佳品", "商务场合"],
    specHighlights: ["优质材质", "精湛工艺", "品质保障"],
    faq: [
      { question: "产品尺寸是多少？", answer: "产品为标准尺寸，具体请参考详情页规格表。" },
      { question: "如何保养？", answer: "建议定期清洁，避免阳光直射。" },
      { question: "有质保吗？", answer: "我们提供完善的售后服务，让您购物无忧。" },
    ],
  };
}
