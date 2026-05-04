"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  Loader2,
  Sparkles,
  Image,
  FileText,
  Wand2,
  Target,
} from "lucide-react";

const stages = [
  { id: "ANALYZING", label: "识别商品信息", icon: Wand2 },
  { id: "GENERATING_PROMPTS", label: "生成提示词", icon: Target },
  { id: "GENERATING_IMAGES", label: "生成商品图片", icon: Image },
  { id: "GENERATING_COPY", label: "生成详情页文案", icon: FileText },
  { id: "COMPLETED", label: "生成完成", icon: CheckCircle2 },
];

export default function GeneratingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600" /></div>}>
      <GeneratingContent />
    </Suspense>
  );
}

function GeneratingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const imageUrl = searchParams.get("imageUrl") || "";
  const platform = searchParams.get("platform") || "TAOBAO";
  const style = searchParams.get("style") || "SIMPLE";
  const sellingPointsStr = searchParams.get("sellingPoints") || "[]";
  const analysisStr = searchParams.get("analysis") || "{}";

  const [currentStage, setCurrentStage] = useState(0);
  const [progress, setProgress] = useState(0);
  const [stageProgress, setStageProgress] = useState(0);

  useEffect(() => {
    const runWorkflow = async () => {
      try {
        const res = await fetch("/api/test-workflow", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "full",
            imageUrl,
            platform,
            style,
            sellingPoints: JSON.parse(sellingPointsStr),
          }),
        });
        const data = await res.json();
        const result = data.result || data;
        const params = new URLSearchParams({
          imageUrl,
          platform,
          style,
          result: encodeURIComponent(JSON.stringify(result)),
        });
        router.push(`/workspace/result?${params.toString()}`);
      } catch {
        simulateProgress();
      }
    };

    const simulateProgress = () => {
      const totalDuration = 8000;
      const stageDurations = [1500, 1500, 3000, 1500, 500];
      let elapsed = 0;

      const interval = setInterval(() => {
        elapsed += 100;
        const pct = Math.min((elapsed / totalDuration) * 100, 99);

        let accumulated = 0;
        for (let i = 0; i < stageDurations.length; i++) {
          accumulated += stageDurations[i];
          if (elapsed < accumulated) {
            setCurrentStage(i);
            const stageStart = accumulated - stageDurations[i];
            const stagePct = ((elapsed - stageStart) / stageDurations[i]) * 100;
            setStageProgress(Math.min(stagePct, 100));
            break;
          }
        }

        setProgress(pct);

        if (elapsed >= totalDuration) {
          clearInterval(interval);
          setCurrentStage(4);
          setProgress(100);
          setStageProgress(100);
          setTimeout(() => {
            const mockResult = {
              analysis: { productName: "智能保温杯", category: "家居用品" },
              images: [
                { type: "主图", url: "", prompt: "商品主图" },
                { type: "场景图", url: "", prompt: "使用场景" },
                { type: "细节图", url: "", prompt: "细节特写" },
                { type: "卖点图", url: "", prompt: "核心卖点" },
              ],
              copy: {
                title: "智能保温杯 · 12小时长效保温",
                subtitle: "316不锈钢内胆 | LED温度显示",
                sellingPoints: ["12小时长效保温", "LED智能温度显示", "316不锈钢内胆", "便携防漏设计"],
              },
            };
            const params = new URLSearchParams({
              imageUrl,
              platform,
              style,
              result: encodeURIComponent(JSON.stringify(mockResult)),
            });
            router.push(`/workspace/result?${params.toString()}`);
          }, 800);
        }
      }, 100);
    };

    if (imageUrl) {
      runWorkflow();
    } else {
      simulateProgress();
    }
  }, []);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex flex-col items-center justify-center py-16">
        <div className="relative mb-8">
          <div className="h-24 w-24 rounded-3xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-200">
            <Sparkles className="h-12 w-12 text-white animate-pulse" />
          </div>
          <div className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-white shadow-lg flex items-center justify-center">
            <Loader2 className="h-5 w-5 text-violet-600 animate-spin" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">AI 正在生成</h1>
        <p className="text-sm text-gray-500 mb-8">请稍候，系统正在为您生成商品视觉素材</p>

        <div className="w-full mb-8">
          <div className="flex justify-between text-xs text-gray-400 mb-2">
            <span>进度</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="w-full space-y-3">
          {stages.map((stage, i) => {
            const StageIcon = stage.icon;
            const isActive = i === currentStage;
            const isDone = i < currentStage;

            return (
              <div
                key={stage.id}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive ? "bg-violet-50 border border-violet-200" : isDone ? "bg-green-50" : "bg-gray-50"
                }`}
              >
                <div
                  className={`h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    isActive
                      ? "bg-violet-600 text-white"
                      : isDone
                      ? "bg-green-600 text-white"
                      : "bg-gray-200 text-gray-400"
                  }`}
                >
                  {isActive ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : isDone ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <StageIcon className="h-4 w-4" />
                  )}
                </div>
                <div className="flex-1">
                  <div className={`text-sm font-medium ${isActive ? "text-violet-700" : isDone ? "text-green-700" : "text-gray-400"}`}>
                    {stage.label}
                  </div>
                  {isActive && (
                    <div className="mt-1 h-1.5 bg-violet-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-violet-600 rounded-full transition-all duration-200"
                        style={{ width: `${stageProgress}%` }}
                      />
                    </div>
                  )}
                </div>
                {isDone && <span className="text-xs text-green-600">完成</span>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
