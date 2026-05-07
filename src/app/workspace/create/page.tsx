"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import UploadPanel from "@/components/workspace/upload-panel";
import GenerationSettings, {
  type GenerationSettingsState,
} from "@/components/workspace/generation-settings";
import PreviewSummary from "@/components/workspace/preview-summary";

interface ImageItem {
  file: File;
  preview: string;
}

const steps = [
  { id: 1, label: "输入" },
  { id: 2, label: "分析中" },
  { id: 3, label: "确认规划" },
  { id: 4, label: "生成中" },
  { id: 5, label: "完成" },
];

const defaultSettings: GenerationSettingsState = {
  platform: "auto",
  language: "none",
  model: "nano-banana-2",
  outputTypes: ["main", "detail", "selling-point", "detail-long"],
  mainImageCount: "1",
  subImageCount: "3",
  detailImageCount: "4",
  detailModuleCount: "5",
  sizePreset: "3:4",
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
};

export default function CreateProjectPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [productImages, setProductImages] = useState<ImageItem[]>([]);
  const [competitorImages, setCompetitorImages] = useState<ImageItem[]>([]);
  const [competitorReferenceModes, setCompetitorReferenceModes] = useState<string[]>([]);
  const [settings, setSettings] = useState<GenerationSettingsState>(defaultSettings);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

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
    <div>
      <div className="flex justify-center pt-3 pb-2">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#e5e5e5] text-[14px] text-[#666]">
          <Sparkles className="h-4 w-4 text-[#999]" />
          AI 全品类商品图
        </div>
      </div>

      <div className="text-center mb-1">
        <h1 className="text-[28px] font-bold text-[#1d1d1f] tracking-[-0.02em]">
          一键生成主图 & 详情图组
        </h1>
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
                      <svg
                        className="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
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
                  <div
                    className={`w-12 h-[2px] mx-2 ${isCompleted ? "bg-[#1d1d1f]" : "bg-[#e5e5e5]"}`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-3 sm:px-4 pb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="w-full lg:w-[680px] flex-shrink-0 space-y-4">
            <UploadPanel
              productImages={productImages}
              setProductImages={setProductImages}
              competitorImages={competitorImages}
              setCompetitorImages={setCompetitorImages}
              competitorReferenceModes={competitorReferenceModes}
              setCompetitorReferenceModes={setCompetitorReferenceModes}
            />

            <GenerationSettings state={settings} setState={setSettings} />

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

          <div className="flex-1 min-w-0">
            <PreviewSummary
              productImages={productImages}
              competitorImages={competitorImages}
              competitorReferenceModes={competitorReferenceModes}
              settings={settings}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
