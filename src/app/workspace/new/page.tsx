"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  X,
  Image as ImageIcon,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  FileImage,
  Camera,
  Layers,
  ZoomIn,
  Square,
  LayoutGrid,
  Eye,
  CheckCircle2,
  Loader2,
  Package,
  Tag,
  Palette,
  Type,
  Ruler,
  Star,
  Users,
  MapPin,
  Ban,
  Store,
  ShoppingCart,
  Globe,
  Wine,
  Shirt,
  Cpu,
  Flower2,
  Home as HomeIcon,
  Zap,
  Leaf,
  Baby,
  BadgePercent,
  Award,
  TrendingUp,
  Minus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const STEPS = [
  "选择生成方式",
  "上传图片",
  "AI 识别结果",
  "确认商品资料",
  "选择平台",
  "选择生成内容",
  "选择风格",
  "生成",
];

const generationModes = [
  { id: "detail", label: "上传产品图生成详情页", desc: "一键生成完整详情页", icon: LayoutGrid, color: "bg-violet-50 text-violet-600 border-violet-200" },
  { id: "competitor", label: "上传竞品图参考风格", desc: "参考竞品视觉风格", icon: Eye, color: "bg-blue-50 text-blue-600 border-blue-200" },
  { id: "main", label: "生成商品主图", desc: "生成平台主图", icon: Camera, color: "bg-amber-50 text-amber-600 border-amber-200" },
  { id: "detail-img", label: "生成产品细节图", desc: "放大展示产品细节", icon: ZoomIn, color: "bg-emerald-50 text-emerald-600 border-emerald-200" },
  { id: "white", label: "生成白底图", desc: "符合平台白底图规范", icon: Square, color: "bg-gray-50 text-gray-600 border-gray-200" },
  { id: "template", label: "从模板开始", desc: "选择品类模板快速开始", icon: FileImage, color: "bg-pink-50 text-pink-600 border-pink-200" },
];

const platforms = [
  { id: "taobao", name: "淘宝", desc: "视觉偏转化，卖点清晰，信息密度中等", color: "#FF4400", icon: ShoppingCart, visualStyle: "转化导向", emphasis: ["产品优势", "使用场景", "细节展示"], defaultTypes: ["main", "sub", "selling", "detail", "params", "long"], recommendedStyle: "taobao-convert" },
  { id: "jd", name: "京东", desc: "品质专业，参数清晰，页面克制", color: "#E4393C", icon: Award, visualStyle: "品质专业", emphasis: ["品牌", "规格", "品质", "售后"], defaultTypes: ["main", "params", "detail", "scene"], recommendedStyle: "jd-quality" },
  { id: "pdd", name: "拼多多", desc: "直接促销，利益点突出，文案醒目", color: "#E02E24", icon: BadgePercent, visualStyle: "直接促销", emphasis: ["价格", "优惠", "卖点强刺激"], defaultTypes: ["main", "selling", "scene", "sub"], recommendedStyle: "pdd-sale" },
  { id: "douyin", name: "抖音", desc: "视觉冲击强，文案短强记忆点", color: "#161823", icon: Zap, visualStyle: "视觉冲击", emphasis: ["短视频封面", "商品卡片", "强记忆点"], defaultTypes: ["main", "scene", "sub", "selling"], recommendedStyle: "taobao-convert" },
  { id: "amazon", name: "亚马逊", desc: "画面简洁，参数规范，少营销文字", color: "#FF9900", icon: Globe, visualStyle: "简洁规范", emphasis: ["白底图", "场景图", "尺寸图", "A+模块"], defaultTypes: ["white", "sub", "params", "scene", "long"], recommendedStyle: "amazon-a" },
  { id: "shopify", name: "Shopify", desc: "品牌调性，专业品质，独立站风格", color: "#95BF47", icon: Store, visualStyle: "品牌调性", emphasis: ["品牌形象", "产品特性", "品质感"], defaultTypes: ["main", "scene", "detail", "selling", "long"], recommendedStyle: "minimal" },
];

const contentTypes = [
  { id: "main", label: "主图", desc: "商品展示主图" },
  { id: "sub", label: "附图", desc: "多角度展示图" },
  { id: "white", label: "白底图", desc: "纯白背景图" },
  { id: "scene", label: "场景图", desc: "使用场景展示" },
  { id: "detail", label: "细节图", desc: "局部细节放大" },
  { id: "selling", label: "卖点图", desc: "核心卖点提炼" },
  { id: "params", label: "参数图", desc: "规格参数展示" },
  { id: "long", label: "详情页长图", desc: "完整详情页" },
];

const styles = [
  { id: "minimal", label: "高级简约", desc: "留白多、字体少、质感强", color: "from-gray-100 to-gray-50" },
  { id: "tech", label: "科技感", desc: "深色背景、光效、数据感", color: "from-blue-900 to-indigo-800" },
  { id: "chinese", label: "中式传统", desc: "国风元素、书法字体", color: "from-red-800 to-amber-700" },
  { id: "fresh", label: "清新自然", desc: "浅色调、自然元素、柔和", color: "from-green-100 to-emerald-50" },
  { id: "baby", label: "母婴温柔", desc: "粉色调、圆润、温暖", color: "from-pink-100 to-rose-50" },
  { id: "pdd-sale", label: "拼多多促销风", desc: "大红大紫、价格突出、紧迫感", color: "from-red-600 to-orange-500" },
  { id: "jd-quality", label: "京东品质风", desc: "简洁大气、品质感、参数清晰", color: "from-slate-700 to-gray-600" },
  { id: "taobao-convert", label: "淘宝转化风", desc: "卖点突出、色彩丰富、引导下单", color: "from-violet-600 to-fuchsia-500" },
  { id: "amazon-a", label: "亚马逊 A+ 简洁风", desc: "白底为主、图文清晰、信息直白", color: "from-gray-50 to-white" },
];

const mockRecognition = {
  productType: "休闲T恤",
  productName: "纯棉圆领短袖T恤",
  color: "白色、黑色、灰色",
  material: "100%纯棉",
  packaging: "独立塑料袋包装",
  imageQuality: "良好，光线充足，背景干净",
  visibleText: "COTTON、100%",
  sellingPoints: "纯棉透气、圆领百搭、多色可选、亲肤柔软",
  uncertain: "具体克重未知、是否有尺码标未知",
};

const generationProgress = [
  { label: "正在识别产品", duration: 3 },
  { label: "正在生成提示词", duration: 2 },
  { label: "正在生成主图", duration: 8 },
  { label: "正在生成细节图", duration: 6 },
  { label: "正在生成详情页", duration: 10 },
  { label: "正在排版", duration: 3 },
];

export default function NewProjectPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [mode, setMode] = useState("");
  const [images, setImages] = useState<{ file: File; preview: string }[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [selectedContents, setSelectedContents] = useState<string[]>(["main", "scene", "detail", "selling", "long"]);
  const [selectedStyle, setSelectedStyle] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [formData, setFormData] = useState({
    productName: "",
    brandName: "",
    category: "",
    specs: "",
    sellingPoints: "",
    targetAudience: "",
    useScene: "",
    forbiddenContent: "",
  });

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setImages((prev) => [...prev, { file, preview: e.target?.result as string }]);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const files = Array.from(e.dataTransfer.files);
      files.forEach(handleFile);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => setIsDragging(false), []);

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleContent = (id: string) => {
    setSelectedContents((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    await new Promise((r) => setTimeout(r, 2000));
    setFormData({
      productName: mockRecognition.productName,
      brandName: "",
      category: mockRecognition.productType,
      specs: "",
      sellingPoints: mockRecognition.sellingPoints,
      targetAudience: "",
      useScene: "",
      forbiddenContent: "",
    });
    setIsAnalyzing(false);
    setStep(4);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    for (let i = 0; i < generationProgress.length; i++) {
      setCurrentProgress(i);
      await new Promise((r) => setTimeout(r, generationProgress[i].duration * 500));
    }
    setIsGenerating(false);
    router.push("/workspace/result/demo");
  };

  const canNext = () => {
    switch (step) {
      case 1: return !!mode;
      case 2: return images.length > 0;
      case 3: return true;
      case 4: return !!formData.productName;
      case 5: return !!selectedPlatform;
      case 6: return selectedContents.length > 0;
      case 7: return !!selectedStyle;
      default: return false;
    }
  };

  return (
    <div className="max-w-[960px] mx-auto">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-gray-900">新建项目</h1>
        <p className="text-sm text-gray-500 mt-0.5">按步骤完成配置，AI 将自动生成电商视觉素材</p>
      </div>

      <div className="mb-8">
        <div className="flex items-center gap-1">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center">
              <div className="flex items-center gap-1.5">
                <div
                  className={`h-6 w-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-colors ${
                    step > i + 1
                      ? "bg-violet-600 text-white"
                      : step === i + 1
                      ? "bg-violet-600 text-white"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {step > i + 1 ? <CheckCircle2 className="h-3.5 w-3.5" /> : i + 1}
                </div>
                <span
                  className={`text-xs hidden lg:inline transition-colors ${
                    step === i + 1 ? "text-violet-600 font-medium" : "text-gray-400"
                  }`}
                >
                  {s}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-px w-4 lg:w-8 mx-1 ${step > i + 1 ? "bg-violet-300" : "bg-gray-200"}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="min-h-[480px]">
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-semibold text-gray-900 mb-1">选择生成方式</h2>
              <p className="text-sm text-gray-500">根据你的需求选择合适的生成模式</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {generationModes.map((m) => {
                const Icon = m.icon;
                const active = mode === m.id;
                return (
                  <Card
                    key={m.id}
                    className={`cursor-pointer transition-all ${
                      active
                        ? "border-2 border-violet-500 shadow-md shadow-violet-100"
                        : "border hover:border-violet-200 hover:shadow-sm"
                    }`}
                    onClick={() => setMode(m.id)}
                  >
                    <CardContent className="p-4">
                      <div className={`h-10 w-10 rounded-lg ${active ? "bg-violet-100" : m.color.split(" ").slice(0, 2).join(" ")} flex items-center justify-center mb-3`}>
                        <Icon className={`h-5 w-5 ${active ? "text-violet-600" : m.color.split(" ")[2]}`} />
                      </div>
                      <h3 className="text-sm font-medium text-gray-900 mb-0.5">{m.label}</h3>
                      <p className="text-xs text-gray-400">{m.desc}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-semibold text-gray-900 mb-1">上传图片</h2>
              <p className="text-sm text-gray-500">上传产品图片，支持多图上传</p>
            </div>
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors ${
                isDragging ? "border-violet-500 bg-violet-50" : "border-gray-200 bg-gray-50 hover:border-violet-300"
              }`}
            >
              <div className="h-12 w-12 rounded-xl bg-violet-100 flex items-center justify-center mx-auto mb-4">
                <Upload className="h-6 w-6 text-violet-600" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">拖拽图片到此处</h3>
              <p className="text-xs text-gray-400 mb-4">支持 JPG、PNG、WEBP 格式，建议 800×800 以上</p>
              <label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    files.forEach(handleFile);
                  }}
                />
                <Button variant="outline" size="sm" className="cursor-pointer text-sm">
                  <ImageIcon className="h-4 w-4 mr-1.5" />
                  选择图片
                </Button>
              </label>
            </div>
            <div className="text-xs text-gray-400 flex flex-wrap gap-x-4 gap-y-1">
              <span>✓ 产品实拍图</span>
              <span>✓ 白底图</span>
              <span>✓ 包装图</span>
              <span>✓ 场景图</span>
              <span>✓ 竞品图</span>
            </div>
            {images.length > 0 && (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                {images.map((img, i) => (
                  <div key={i} className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border">
                      <img src={img.preview} alt="" className="w-full h-full object-cover" />
                    </div>
                    <button
                      onClick={() => removeImage(i)}
                      className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <label className="aspect-square rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer hover:border-violet-300 transition-colors">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      files.forEach(handleFile);
                    }}
                  />
                  <Plus className="h-5 w-5 text-gray-300" />
                </label>
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-semibold text-gray-900 mb-1">AI 识别结果</h2>
              <p className="text-sm text-gray-500">系统已自动识别以下信息，请在下一步确认和补充</p>
            </div>
            {isAnalyzing ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="h-8 w-8 text-violet-600 animate-spin mb-4" />
                <p className="text-sm text-gray-500">AI 正在识别产品信息...</p>
              </div>
            ) : (
              <Card className="border-0 shadow-sm">
                <CardContent className="p-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { label: "产品类型", value: mockRecognition.productType, icon: Package },
                      { label: "产品名称", value: mockRecognition.productName, icon: Tag },
                      { label: "颜色", value: mockRecognition.color, icon: Palette },
                      { label: "材质", value: mockRecognition.material, icon: Layers },
                      { label: "包装", value: mockRecognition.packaging, icon: Square },
                      { label: "图片质量", value: mockRecognition.imageQuality, icon: Camera },
                      { label: "可见文字", value: mockRecognition.visibleText, icon: Type },
                      { label: "可能卖点", value: mockRecognition.sellingPoints, icon: Star },
                    ].map((item, i) => {
                      const Icon = item.icon;
                      return (
                        <div key={i} className="flex items-start gap-3 py-2">
                          <div className="h-7 w-7 rounded-md bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Icon className="h-3.5 w-3.5 text-gray-500" />
                          </div>
                          <div>
                            <div className="text-xs text-gray-400 mb-0.5">{item.label}</div>
                            <div className="text-sm text-gray-900">{item.value}</div>
                          </div>
                        </div>
                      );
                    })}
                    <div className="flex items-start gap-3 py-2 md:col-span-2">
                      <div className="h-7 w-7 rounded-md bg-amber-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Ban className="h-3.5 w-3.5 text-amber-500" />
                      </div>
                      <div>
                        <div className="text-xs text-amber-500 mb-0.5">不确定信息</div>
                        <div className="text-sm text-amber-700">{mockRecognition.uncertain}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-semibold text-gray-900 mb-1">确认商品资料</h2>
              <p className="text-sm text-gray-500">补充和修正商品信息，生成结果将更准确</p>
            </div>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-5 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1.5 block">产品名称 *</label>
                    <Input
                      value={formData.productName}
                      onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                      placeholder="输入产品名称"
                      className="h-9 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1.5 block">品牌名称</label>
                    <Input
                      value={formData.brandName}
                      onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                      placeholder="输入品牌名称"
                      className="h-9 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1.5 block">产品类目</label>
                    <Input
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="如：服装 > T恤"
                      className="h-9 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1.5 block">规格参数</label>
                    <Input
                      value={formData.specs}
                      onChange={(e) => setFormData({ ...formData, specs: e.target.value })}
                      placeholder="如：S/M/L/XL，180g"
                      className="h-9 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1.5 block">核心卖点</label>
                  <Textarea
                    value={formData.sellingPoints}
                    onChange={(e) => setFormData({ ...formData, sellingPoints: e.target.value })}
                    placeholder="每行一个卖点，如：纯棉透气 / 圆领百搭 / 亲肤柔软"
                    className="text-sm min-h-[80px]"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1.5 block">目标人群</label>
                    <Input
                      value={formData.targetAudience}
                      onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                      placeholder="如：18-35岁年轻男女"
                      className="h-9 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1.5 block">使用场景</label>
                    <Input
                      value={formData.useScene}
                      onChange={(e) => setFormData({ ...formData, useScene: e.target.value })}
                      placeholder="如：日常休闲、运动健身"
                      className="h-9 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1.5 block">禁止生成内容</label>
                  <Input
                    value={formData.forbiddenContent}
                    onChange={(e) => setFormData({ ...formData, forbiddenContent: e.target.value })}
                    placeholder="如：不要出现竞品品牌、不要医疗暗示"
                    className="h-9 text-sm"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-semibold text-gray-900 mb-1">选择电商平台</h2>
              <p className="text-sm text-gray-500">不同平台有不同的图片尺寸和风格规范</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {platforms.map((p) => {
                const Icon = p.icon;
                const active = selectedPlatform === p.id;
                return (
                  <Card
                    key={p.id}
                    className={`cursor-pointer transition-all ${
                      active
                        ? "border-2 border-violet-500 shadow-md shadow-violet-100"
                        : "border hover:border-violet-200 hover:shadow-sm"
                    }`}
                    onClick={() => {
                      setSelectedPlatform(p.id);
                      setSelectedContents(p.defaultTypes);
                      setSelectedStyle(p.recommendedStyle);
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className="h-9 w-9 rounded-lg flex items-center justify-center text-white"
                          style={{ backgroundColor: p.color }}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">{p.name}</h3>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">{p.visualStyle}</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 mb-2">{p.desc}</p>
                      <div className="flex flex-wrap gap-1">
                        {p.emphasis.map((e) => (
                          <span key={e} className="text-[10px] px-1.5 py-0.5 rounded bg-violet-50 text-violet-600">{e}</span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-semibold text-gray-900 mb-1">选择生成内容</h2>
              <p className="text-sm text-gray-500">可多选，选择需要生成的图片类型</p>
            </div>
            {selectedPlatform && (() => {
              const pf = platforms.find((p) => p.id === selectedPlatform);
              if (!pf) return null;
              const pfContentLabels = pf.defaultTypes.map((t) => contentTypes.find((c) => c.id === t)?.label).filter(Boolean);
              return (
                <div className="bg-violet-50 border border-violet-100 rounded-lg px-4 py-3 flex items-start gap-2">
                  <div className="h-5 w-5 rounded flex items-center justify-center bg-violet-100 flex-shrink-0 mt-0.5">
                    <Sparkles className="h-3 w-3 text-violet-600" />
                  </div>
                  <div>
                    <p className="text-xs text-violet-700 font-medium">
                      {pf.name}推荐生成：{pfContentLabels.join("、")}
                    </p>
                    <p className="text-[11px] text-violet-500 mt-0.5">
                      视觉风格：{pf.visualStyle} · 强调：{pf.emphasis.join("、")}
                    </p>
                  </div>
                </div>
              );
            })()}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {contentTypes.map((ct) => {
                const active = selectedContents.includes(ct.id);
                const pf = platforms.find((p) => p.id === selectedPlatform);
                const isDefault = pf?.defaultTypes.includes(ct.id);
                return (
                  <Card
                    key={ct.id}
                    className={`cursor-pointer transition-all ${
                      active
                        ? "border-2 border-violet-500 shadow-md shadow-violet-100"
                        : "border hover:border-violet-200 hover:shadow-sm"
                    }`}
                    onClick={() => toggleContent(ct.id)}
                  >
                    <CardContent className="p-4 text-center">
                      <div className={`h-10 w-10 rounded-lg mx-auto mb-2 flex items-center justify-center ${
                        active ? "bg-violet-100" : "bg-gray-100"
                      }`}>
                        {active ? (
                          <CheckCircle2 className="h-5 w-5 text-violet-600" />
                        ) : (
                          <Minus className="h-5 w-5 text-gray-300" />
                        )}
                      </div>
                      <h3 className="text-sm font-medium text-gray-900">
                        {ct.label}
                        {isDefault && <span className="text-[10px] ml-1 text-violet-500">推荐</span>}
                      </h3>
                      <p className="text-xs text-gray-400 mt-0.5">{ct.desc}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {step === 7 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-semibold text-gray-900 mb-1">选择视觉风格</h2>
              <p className="text-sm text-gray-500">不同风格适用于不同品类和平台</p>
            </div>
            {selectedPlatform && (() => {
              const pf = platforms.find((p) => p.id === selectedPlatform);
              const recStyle = styles.find((s) => s.id === pf?.recommendedStyle);
              if (!pf || !recStyle) return null;
              return (
                <div className="bg-violet-50 border border-violet-100 rounded-lg px-4 py-3 flex items-start gap-2">
                  <div className="h-5 w-5 rounded flex items-center justify-center bg-violet-100 flex-shrink-0 mt-0.5">
                    <Sparkles className="h-3 w-3 text-violet-600" />
                  </div>
                  <div>
                    <p className="text-xs text-violet-700 font-medium">
                      {pf.name}推荐风格：<span className="font-semibold">{recStyle.label}</span> — {recStyle.desc}
                    </p>
                  </div>
                </div>
              );
            })()}
            <div className="grid grid-cols-3 md:grid-cols-3 gap-3">
              {styles.map((s) => {
                const active = selectedStyle === s.id;
                const pf = platforms.find((p) => p.id === selectedPlatform);
                const isRecommended = pf?.recommendedStyle === s.id;
                return (
                  <Card
                    key={s.id}
                    className={`cursor-pointer transition-all overflow-hidden ${
                      active
                        ? "border-2 border-violet-500 shadow-md shadow-violet-100"
                        : "border hover:border-violet-200 hover:shadow-sm"
                    }`}
                    onClick={() => setSelectedStyle(s.id)}
                  >
                    <div className={`h-16 bg-gradient-to-br ${s.color} relative`}>
                      {active && (
                        <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-violet-600 flex items-center justify-center">
                          <CheckCircle2 className="h-3 w-3 text-white" />
                        </div>
                      )}
                      {isRecommended && !active && (
                        <div className="absolute top-2 right-2 h-5 px-1.5 rounded-full bg-white/80 flex items-center justify-center">
                          <span className="text-[9px] font-medium text-violet-600">推荐</span>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-3">
                      <h3 className="text-sm font-medium text-gray-900">
                        {s.label}
                        {isRecommended && <span className="text-[10px] ml-1 text-violet-500">平台推荐</span>}
                      </h3>
                      <p className="text-xs text-gray-400 mt-0.5">{s.desc}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {step === 8 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-semibold text-gray-900 mb-1">生成中</h2>
              <p className="text-sm text-gray-500">AI 正在为你生成电商视觉素材</p>
            </div>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {generationProgress.map((p, i) => (
                    <div key={i} className="flex items-center gap-3">
                      {i < currentProgress ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                      ) : i === currentProgress && isGenerating ? (
                        <Loader2 className="h-5 w-5 text-violet-600 animate-spin flex-shrink-0" />
                      ) : (
                        <div className="h-5 w-5 rounded-full border-2 border-gray-200 flex-shrink-0" />
                      )}
                      <span className={`text-sm ${
                        i < currentProgress ? "text-green-600" : i === currentProgress && isGenerating ? "text-violet-600 font-medium" : "text-gray-400"
                      }`}>
                        {p.label}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-6">
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-violet-600 rounded-full transition-all duration-500"
                      style={{ width: `${((currentProgress + 1) / generationProgress.length) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-2 text-center">
                    {isGenerating ? generationProgress[currentProgress]?.label : "生成完成！"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
        <Button
          variant="outline"
          onClick={() => setStep((s) => Math.max(1, s - 1))}
          disabled={step === 1 || isGenerating}
          className="text-sm"
        >
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          上一步
        </Button>

        {step < 8 ? (
          <Button
            onClick={() => {
              if (step === 2 && images.length > 0) {
                setIsAnalyzing(true);
                setStep(3);
                setTimeout(() => {
                  setFormData({
                    productName: mockRecognition.productName,
                    brandName: "",
                    category: mockRecognition.productType,
                    specs: "",
                    sellingPoints: mockRecognition.sellingPoints,
                    targetAudience: "",
                    useScene: "",
                    forbiddenContent: "",
                  });
                  setIsAnalyzing(false);
                  setStep(4);
                }, 2000);
              } else {
                setStep((s) => s + 1);
              }
            }}
            disabled={!canNext()}
            className="bg-gray-900 hover:bg-gray-800 text-white text-sm"
          >
            下一步
            <ArrowRight className="h-4 w-4 ml-1.5" />
          </Button>
        ) : (
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="bg-violet-600 hover:bg-violet-700 text-white text-sm"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                生成中...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-1.5" />
                开始生成
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

function Plus({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}
