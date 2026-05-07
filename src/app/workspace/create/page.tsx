"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, AlertCircle, Loader2 } from "lucide-react";
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
  { id: 2, label: "上传中" },
  { id: 3, label: "分析中" },
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

function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token");
}

async function uploadImage(file: File): Promise<string> {
  const token = getAuthToken();

  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch("/api/upload-image", {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  if (res.status === 401) {
    throw new Error("请先登录");
  }

  const err = await res.json().catch(() => ({ error: "上传失败" }));

  if (!res.ok) {
    if (res.status === 503) {
      throw new Error("存储服务未配置，请联系管理员");
    }
    throw new Error(err.error || "上传失败");
  }

  if (!err.success || !err.imageUrl) {
    throw new Error(err.error || "上传失败，未获取到图片地址");
  }

  return err.imageUrl;
}

export default function CreateProjectPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [productImages, setProductImages] = useState<ImageItem[]>([]);
  const [competitorImages, setCompetitorImages] = useState<ImageItem[]>([]);
  const [competitorReferenceModes, setCompetitorReferenceModes] = useState<string[]>([]);
  const [settings, setSettings] = useState<GenerationSettingsState>(defaultSettings);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusText, setStatusText] = useState<string>("");

  const handleAnalyze = async () => {
    if (productImages.length === 0) return;

    const token = getAuthToken();
    if (!token) {
      setError("请先登录后再使用 AI 生成功能");
      setTimeout(() => router.push("/login"), 1500);
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setCurrentStep(1);

    try {
      setCurrentStep(2);
      setStatusText("正在上传产品图...");

      const productImageUrls: string[] = [];
      for (const img of productImages) {
        const url = await uploadImage(img.file);
        productImageUrls.push(url);
      }

      const competitorImageUrls: string[] = [];
      if (competitorImages.length > 0) {
        setStatusText("正在上传竞品参考图...");
        for (const img of competitorImages) {
          try {
            const url = await uploadImage(img.file);
            competitorImageUrls.push(url);
          } catch (uploadErr) {
            setStatusText("竞品图上传失败，将跳过竞品参考...");
          }
        }
      }

      setCurrentStep(3);
      setStatusText("正在提交 AI 分析...");

      const workflowRes = await fetch("/api/workflow/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productImageUrls,
          competitorImageUrls,
          competitorReferenceModes,
          platform: settings.platform,
          language: settings.language,
          model: settings.model,
          outputTypes: settings.outputTypes,
          mainImageCount: settings.mainImageCount,
          subImageCount: settings.subImageCount,
          detailImageCount: settings.detailImageCount,
          detailModuleCount: settings.detailModuleCount,
          sizePreset: settings.sizePreset,
          quality: settings.quality,
          visualStyle: settings.visualStyle,
          pricePositioning: settings.pricePositioning,
          postProcessingOptions: settings.postProcessingOptions,
          copyIntensity: settings.copyIntensity,
          targetAudiences: settings.targetAudiences,
          usageScenarios: settings.usageScenarios,
          subjectConsistency: settings.subjectConsistency,
          subjectLockRules: settings.subjectLockRules,
          detailDesc: settings.detailDesc,
        }),
      });

      if (workflowRes.status === 401) {
        setError("登录已过期，请重新登录");
        setTimeout(() => router.push("/login"), 1500);
        return;
      }

      const workflowData = await workflowRes.json();

      if (!workflowRes.ok || !workflowData.success) {
        if (workflowRes.status === 503) {
          throw new Error("AI 服务未配置：请设置 DASHSCOPE_API_KEY 或 SUCHUANG_API_KEY 环境变量");
        }
        if (workflowRes.status === 402) {
          throw new Error(
            `积分不足：${workflowData.detail || "余额不足，请充值后再试"}`
          );
        }
        throw new Error(workflowData.error || "AI 处理失败，请稍后重试");
      }

      setCurrentStep(4);
      setStatusText("AI 正在生成图片和文案...");

      setCurrentStep(5);
      setStatusText("生成完成！");

      const resultParam = encodeURIComponent(
        JSON.stringify({
          projectId: workflowData.projectId,
          analysis: workflowData.analysis,
          images: workflowData.images,
          copy: workflowData.copy,
          platform: workflowData.platform,
          creditsUsed: workflowData.creditsUsed,
          balance: workflowData.balance,
          config: {
            productImageUrls,
            competitorImageUrls,
            competitorReferenceModes,
            platform: settings.platform,
            language: settings.language,
            model: settings.model,
            outputTypes: settings.outputTypes,
            mainImageCount: settings.mainImageCount,
            subImageCount: settings.subImageCount,
            detailImageCount: settings.detailImageCount,
            detailModuleCount: settings.detailModuleCount,
            sizePreset: settings.sizePreset,
            quality: settings.quality,
            visualStyle: settings.visualStyle,
            pricePositioning: settings.pricePositioning,
            postProcessingOptions: settings.postProcessingOptions,
            copyIntensity: settings.copyIntensity,
            targetAudiences: settings.targetAudiences,
            usageScenarios: settings.usageScenarios,
            subjectConsistency: settings.subjectConsistency,
            subjectLockRules: settings.subjectLockRules,
            detailDesc: settings.detailDesc,
          },
        })
      );

      router.push(`/workspace/result?result=${resultParam}`);
    } catch (err) {
      const message = (err as Error).message || "未知错误";
      setError(message);
      setCurrentStep(1);
      setIsAnalyzing(false);
    }
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

      {error && (
        <div className="max-w-[1400px] mx-auto px-3 sm:px-4 mb-4">
          <div className="bg-[#fef2f2] border border-[#fecaca] rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-[#ef4444] flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-[14px] font-medium text-[#991b1b]">生成失败</p>
              <p className="text-[13px] text-[#b91c1c] mt-1">{error}</p>
              <button
                onClick={() => setError(null)}
                className="mt-2 text-[13px] text-[#991b1b] underline cursor-pointer hover:text-[#7f1d1d]"
              >
                关闭提示
              </button>
            </div>
          </div>
        </div>
      )}

      {isAnalyzing && statusText && (
        <div className="max-w-[1400px] mx-auto px-3 sm:px-4 mb-4">
          <div className="bg-[#eff6ff] border border-[#bfdbfe] rounded-xl p-4 flex items-center gap-3">
            <Loader2 className="h-5 w-5 text-[#3b82f6] animate-spin flex-shrink-0" />
            <p className="text-[14px] text-[#1e40af]">{statusText}</p>
          </div>
        </div>
      )}

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
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {statusText || "处理中..."}
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
