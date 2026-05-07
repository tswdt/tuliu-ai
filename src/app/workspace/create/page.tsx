"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  X,
  Sparkles,
  ChevronDown,
  ImageIcon,
  Wand2,
  Coins,
  Bell,
  User,
} from "lucide-react";

const steps = [
  { id: 1, label: "输入" },
  { id: 2, label: "分析中" },
  { id: 3, label: "确认规划" },
  { id: 4, label: "生成中" },
  { id: 5, label: "完成" },
];

const platforms = [
  { id: "auto", label: "智能匹配" },
  { id: "taobao", label: "淘宝/天猫" },
  { id: "jd", label: "京东" },
  { id: "pdd", label: "拼多多" },
  { id: "douyin", label: "抖音电商" },
  { id: "xiaohongshu", label: "小红书" },
  { id: "amazon", label: "亚马逊" },
  { id: "shopify", label: "Shopify" },
  { id: "temu", label: "Temu" },
  { id: "independent", label: "独立站" },
];

const models = [
  { id: "nano-banana-2", label: "Nano Banana 2" },
  { id: "nano-banana-1", label: "Nano Banana 1" },
];

const aspectRatios = [
  { id: "3:4", label: "3:4 竖版" },
  { id: "1:1", label: "1:1 方版" },
  { id: "4:3", label: "4:3 横版" },
  { id: "9:16", label: "9:16 竖版" },
];

const qualities = [
  { id: "2k", label: "2K 高清" },
  { id: "1k", label: "1K 标清" },
  { id: "4k", label: "4K 超清" },
];

const quantities = [
  { id: "1", label: "1 张" },
  { id: "3", label: "3 张" },
  { id: "5", label: "5 张" },
  { id: "10", label: "10 张" },
];

const languages = [
  { id: "none", label: "无文字(纯视觉)" },
  { id: "zh-cn", label: "简体中文" },
  { id: "zh-tw", label: "繁体中文" },
  { id: "en", label: "English" },
  { id: "ja", label: "日本語" },
];

interface SelectProps {
  label: string;
  value: string;
  options: { id: string; label: string }[];
  onChange: (value: string) => void;
}

function Select({ label, value, options, onChange }: SelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const selectedLabel = options.find((o) => o.id === value)?.label || value;

  return (
    <div ref={ref} className="relative">
      <label className="block text-[14px] text-[#666] mb-2 font-medium">{label}</label>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 h-11 rounded-xl bg-white border border-[#e0e0e0] text-[14px] text-[#1d1d1f] hover:border-[#ccc] transition-colors cursor-pointer"
      >
        <span>{selectedLabel}</span>
        <ChevronDown className={`h-4 w-4 text-[#999] transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute z-50 mt-1.5 w-full bg-white border border-[#e0e0e0] rounded-xl shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
          {options.map((opt) => (
            <button
              key={opt.id}
              onClick={() => { onChange(opt.id); setOpen(false); }}
              className={`w-full text-left px-4 py-2.5 text-[14px] transition-colors cursor-pointer hover:bg-[#f5f5f5] ${
                opt.id === value ? "text-[#1d1d1f] font-medium bg-[#f5f5f5]" : "text-[#666]"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CreateProjectPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [activeTab, setActiveTab] = useState<"main" | "detail">("detail");
  const [productImages, setProductImages] = useState<{ file: File; preview: string }[]>([]);
  const [platform, setPlatform] = useState("auto");
  const [detailDesc, setDetailDesc] = useState("");
  const [language, setLanguage] = useState("none");
  const [model, setModel] = useState("nano-banana-2");
  const [aspectRatio, setAspectRatio] = useState("3:4");
  const [quality, setQuality] = useState("2k");
  const [quantity, setQuantity] = useState("1");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    if (file.size > 10 * 1024 * 1024) return;
    if (productImages.length >= 6) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setProductImages((prev) => [...prev, { file, preview: e.target?.result as string }]);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    files.forEach((f) => handleFile(f));
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); }, []);

  const removeImage = (index: number) => {
    setProductImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAnalyze = async () => {
    if (productImages.length === 0) return;
    setIsAnalyzing(true);
    setCurrentStep(2);
    await new Promise((r) => setTimeout(r, 2000));
    setCurrentStep(3);
    await new Promise((r) => setTimeout(r, 1000));
    setCurrentStep(4);
    await new Promise((r) => setTimeout(r, 2000));
    setCurrentStep(5);
    setIsAnalyzing(false);
    router.push("/workspace/result");
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <div className="flex justify-between items-center px-4 sm:px-6 pt-3 pb-2">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-[#1d1d1f] flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-[#1d1d1f] text-sm">燎原 AI</span>
          <span className="text-[#e5e5e5]">|</span>
          <span className="text-sm text-[#86868b]">工作台</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#e5e5e5] text-xs font-medium">
            <Coins className="h-3.5 w-3.5 text-[#666]" />
            <span className="text-[#1d1d1f]">100 次</span>
          </div>
          <button className="relative h-8 w-8 rounded-lg hover:bg-white border border-[#e5e5e5] flex items-center justify-center transition-colors cursor-pointer">
            <Bell className="h-4 w-4 text-[#86868b]" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#ff3b30]" />
          </button>
          <div className="h-8 w-8 rounded-full bg-white border border-[#e5e5e5] flex items-center justify-center cursor-pointer">
            <User className="h-4 w-4 text-[#86868b]" />
          </div>
        </div>
      </div>

      <div className="flex justify-center pt-2 pb-3">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#e5e5e5] text-[14px] text-[#666]">
          <Sparkles className="h-4 w-4 text-[#999]" />
          AI 全品类商品图
        </div>
      </div>

      <div className="text-center mb-1">
        <h1 className="text-[28px] font-bold text-[#1d1d1f] tracking-[-0.02em]">一键生成主图 & 详情图组</h1>
      </div>
      <p className="text-center text-[14px] text-[#86868b] mb-5 leading-[1.6]">
        上传产品图，AI 智能分析产品特征，自动生成电商主图及多角度、多场景的详情图组
      </p>

      <div className="flex justify-center mb-5">
        <div className="flex items-center">
          {steps.map((step, index) => {
            const isActive = step.id === currentStep;
            const isCompleted = step.id < currentStep;
            return (
              <div key={step.id} className="flex items-center">
                <div className="flex items-center gap-2">
                  <div
                    className={`h-7 w-7 rounded-full flex items-center justify-center text-[12px] font-medium ${
                      isActive
                        ? "bg-[#1d1d1f] text-white"
                        : isCompleted
                        ? "bg-[#1d1d1f] text-white"
                        : "bg-[#f0f0f0] text-[#999]"
                    }`}
                  >
                    {isCompleted ? (
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      step.id
                    )}
                  </div>
                  <span
                    className={`text-[14px] ${
                      isActive || isCompleted ? "text-[#1d1d1f] font-medium" : "text-[#999]"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-12 h-[2px] mx-2 ${isCompleted ? "bg-[#1d1d1f]" : "bg-[#e5e5e5]"}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-3 sm:px-4 pb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="w-full lg:w-[440px] flex-shrink-0 space-y-4">
            <div className="bg-white rounded-2xl border border-[#e5e5e5] p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-[#999]" />
                  <span className="text-[16px] font-semibold text-[#1d1d1f]">产品图</span>
                </div>
                <span className="text-[12px] text-[#999]">{productImages.length}/6</span>
              </div>
              <p className="text-[14px] text-[#999] mb-4">上传清晰的产品图片</p>

              {productImages.length === 0 ? (
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  className="interactive-upload border-2 border-dashed border-[#d0d0d0] rounded-2xl p-10 text-center cursor-pointer bg-[#fafafa]"
                >
                  <div className="h-12 w-12 rounded-full bg-white border border-[#e5e5e5] flex items-center justify-center mx-auto mb-4">
                    <Upload className="h-6 w-6 text-[#999]" />
                  </div>
                  <p className="text-[14px] text-[#666] mb-1 leading-[1.6]">
                    多图上传时建议仅上传必要的视角或sku图，图片不是越多越好
                  </p>
                  <label className="mt-3 inline-block">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => { Array.from(e.target.files || []).forEach((f) => handleFile(f)); }}
                    />
                    <span className="text-[14px] text-[#007aff] cursor-pointer hover:underline">
                      点击上传
                    </span>
                  </label>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {productImages.map((img, i) => (
                    <div key={i} className="relative group aspect-square rounded-xl overflow-hidden bg-[#f5f5f7] border border-[#e5e5e5]">
                      <img src={img.preview} alt="" className="w-full h-full object-cover" />
                      <button
                        onClick={() => removeImage(i)}
                        className="absolute top-1.5 right-1.5 h-5 w-5 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  {productImages.length < 6 && (
                    <label className="aspect-square rounded-xl border-2 border-dashed border-[#e5e5e5] flex items-center justify-center cursor-pointer hover:border-[#ccc] transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) => { Array.from(e.target.files || []).forEach((f) => handleFile(f)); }}
                      />
                      <Upload className="h-5 w-5 text-[#ccc]" />
                    </label>
                  )}
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-[#e5e5e5] p-1.5">
              <div className="flex gap-1.5">
                <button
                  onClick={() => setActiveTab("main")}
                  className={`flex-1 py-2.5 text-[14px] font-medium rounded-xl cursor-pointer interactive-tab ${
                    activeTab === "main"
                      ? "selected"
                      : "text-[#666]"
                  }`}
                >
                  主图
                </button>
                <button
                  onClick={() => setActiveTab("detail")}
                  className={`flex-1 py-2.5 text-[14px] font-medium rounded-xl cursor-pointer interactive-tab ${
                    activeTab === "detail"
                      ? "selected"
                      : "text-[#666]"
                  }`}
                >
                  详情图
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#e5e5e5] p-5 space-y-4">
              <Select label="目标平台" value={platform} options={platforms} onChange={setPlatform} />

              <div>
                <label className="block text-[14px] text-[#666] mb-2 font-medium">详情图要求</label>
                <textarea
                  value={detailDesc}
                  onChange={(e) => setDetailDesc(e.target.value)}
                  placeholder="建议输入：产品名称、卖点、目标人群、目标电商平台、图片风格等"
                  className="w-full h-24 px-4 py-3 rounded-xl bg-white border border-[#e5e5e5] text-[14px] text-[#1d1d1f] placeholder:text-[#bbb] resize-none focus:outline-none focus:border-[#ccc] transition-colors leading-[1.6]"
                />
                <div className="flex justify-end mt-1.5">
                  <button className="inline-flex items-center gap-1 text-[14px] text-[#666] hover:text-[#1d1d1f] cursor-pointer transition-colors">
                    <Wand2 className="h-3 w-3" />
                    AI帮写
                    <svg className="h-3.5 w-3.5 text-[#999]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                  </button>
                </div>
              </div>

              <Select label="目标语言" value={language} options={languages} onChange={setLanguage} />

              <div className="grid grid-cols-2 gap-4">
                <Select label="模型" value={model} options={models} onChange={setModel} />
                <Select label="尺寸比例" value={aspectRatio} options={aspectRatios} onChange={setAspectRatio} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Select label="清晰度" value={quality} options={qualities} onChange={setQuality} />
                <Select label="生成数量" value={quantity} options={quantities} onChange={setQuantity} />
              </div>
            </div>

            <button
              onClick={handleAnalyze}
              disabled={productImages.length === 0 || isAnalyzing}
              className={`w-full h-12 rounded-xl text-[16px] font-semibold cursor-pointer flex items-center justify-center gap-2 interactive-button ${
                productImages.length > 0 && !isAnalyzing
                  ? "bg-[#1d1d1f] text-white hover:bg-[#333]"
                  : "bg-[#e5e5e5] text-[#999] cursor-not-allowed"
              }`}
            >
              {isAnalyzing ? (
                <>
                  <Sparkles className="h-4 w-4 animate-spin" />
                  分析中...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  分析产品
                </>
              )}
            </button>
          </div>

          <div className="flex-1 bg-white rounded-2xl border border-[#e5e5e5] p-6">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-[#999]" />
              <span className="text-[16px] font-semibold text-[#1d1d1f]">生成结果</span>
            </div>
            <p className="text-[14px] text-[#999] mb-8">上传产品图并点击分析开始</p>

            <div className="h-[420px] flex flex-col items-center justify-center">
              <div className="h-20 w-20 rounded-full bg-[#f8f8f8] flex items-center justify-center mb-5">
                <Sparkles className="h-9 w-9 text-[#c0c0c0]" />
              </div>
              <p className="text-[16px] text-[#999] mb-1">上传产品图并填写要求后</p>
              <p className="text-[16px] text-[#999]">点击"分析产品"开始</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
