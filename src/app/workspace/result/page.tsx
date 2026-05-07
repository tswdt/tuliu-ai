"use client";

import { Suspense, useState } from "react";
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
  AlertCircle,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getOutputTypeLabel,
  getPlatformLabel,
} from "@/lib/prompt-builder";

export default function ResultPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-[#86868b]">加载中...</div>}>
      <ResultContent />
    </Suspense>
  );
}

function ResultContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [regenerateError, setRegenerateError] = useState<string | null>(null);

  let result: any = null;
  let hasRealData = false;

  try {
    const resultStr = searchParams.get("result");
    if (resultStr) {
      result = JSON.parse(decodeURIComponent(resultStr));
      if (result && (result.images?.length > 0 || result.projectId)) {
        hasRealData = true;
      }
    }
  } catch {}

  if (!hasRealData || !result) {
    return (
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-8">
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-[#f5f5f7] mb-5">
            <AlertCircle className="h-8 w-8 text-[#999]" />
          </div>
          <h2 className="text-[20px] font-semibold text-[#1d1d1f] mb-2">暂无生成结果</h2>
          <p className="text-[14px] text-[#86868b] mb-6 max-w-md mx-auto leading-[1.6]">
            您还没有生成任何商品图片。请前往创建页面，上传产品图并配置生成选项。
          </p>
          <Button
            onClick={() => router.push("/workspace/create")}
            className="bg-[#1d1d1f] text-white hover:bg-[#333] rounded-xl cursor-pointer interactive-button"
          >
            <Plus className="h-4 w-4 mr-2" />
            开始生成
          </Button>
        </div>
      </div>
    );
  }

  const images = result.images || [];
  const copy = result.copy || {};
  const analysis = result.analysis || {};
  const platform = result.platform || "TAOBAO";
  const projectId = result.projectId;
  const creditsUsed = result.creditsUsed;
  const balance = result.balance;
  const config = result.config || {};

  const handleDownload = async (imageUrl: string, fileName: string) => {
    if (!imageUrl) return;
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) throw new Error("下载失败");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      window.open(imageUrl, "_blank");
    }
  };

  const handleBatchDownload = async () => {
    for (const img of images) {
      if (img.url) {
        await handleDownload(img.url, `${getOutputTypeLabel(img.type)}-${(img.index || 0) + 1}.jpg`);
      }
    }
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
  };

  const handleRegenerate = async () => {
    if (!config.productImageUrls || config.productImageUrls.length === 0) {
      router.push("/workspace/create");
      return;
    }

    setIsRegenerating(true);
    setRegenerateError(null);

    try {
      const res = await fetch("/api/workflow/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (res.status === 503) {
          throw new Error("AI 服务未配置：请设置 DASHSCOPE_API_KEY 或 SUCHUANG_API_KEY 环境变量");
        }
        if (res.status === 402) {
          throw new Error(`积分不足：${data.detail || "余额不足，请充值后再试"}`);
        }
        throw new Error(data.error || "重新生成失败");
      }

      const newResult = encodeURIComponent(
        JSON.stringify({
          projectId: data.projectId,
          analysis: data.analysis,
          images: data.images,
          copy: data.copy,
          platform: data.platform,
          creditsUsed: data.creditsUsed,
          balance: data.balance,
          config,
        })
      );

      router.replace(`/workspace/result?result=${newResult}`);
    } catch (err) {
      setRegenerateError((err as Error).message);
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4">
      <button
        onClick={() => router.push("/workspace/create")}
        className="flex items-center gap-1.5 text-[14px] text-[#86868b] hover:text-[#1d1d1f] mb-4 cursor-pointer interactive-button"
      >
        <ArrowLeft className="h-4 w-4" />
        返回创建
      </button>

      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-[24px] font-bold text-[#1d1d1f]">生成结果</h1>
          <p className="text-[14px] text-[#86868b] mt-1">
            {analysis.productName || "商品"} · {getPlatformLabel(platform)} · 共 {images.length} 张图
            {creditsUsed !== undefined && (
              <span className="ml-2 text-[#f59e0b]">· 消耗 {creditsUsed} 积分</span>
            )}
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => router.push("/workspace/create")}
            className="border-[#e5e5e5] text-[#666] hover:text-[#1d1d1f] hover:border-[#ccc] rounded-xl cursor-pointer interactive-button"
          >
            <Plus className="h-4 w-4 mr-2" />
            新建项目
          </Button>
          {images.length > 0 && (
            <Button
              onClick={handleBatchDownload}
              className="bg-[#1d1d1f] text-white hover:bg-[#333] rounded-xl cursor-pointer interactive-button"
            >
              <Download className="h-4 w-4 mr-2" />
              批量下载
            </Button>
          )}
        </div>
      </div>

      {regenerateError && (
        <div className="mb-4 bg-[#fef2f2] border border-[#fecaca] rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-[#ef4444] flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-[14px] font-medium text-[#991b1b]">重新生成失败</p>
            <p className="text-[13px] text-[#b91c1c] mt-1">{regenerateError}</p>
            <button
              onClick={() => setRegenerateError(null)}
              className="mt-2 text-[13px] text-[#991b1b] underline cursor-pointer hover:text-[#7f1d1d]"
            >
              关闭提示
            </button>
          </div>
        </div>
      )}

      <div className="mb-4">
        <div className="flex items-center gap-3">
          {["上传图片", "AI 识别", "配置生成", "生成结果"].map((step, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-full bg-[#1d1d1f] text-white flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <span className="text-[14px] font-medium text-[#1d1d1f]">{step}</span>
              {i < 3 && <div className="h-[1px] w-8 bg-[#1d1d1f]" />}
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[18px] font-semibold text-[#1d1d1f] flex items-center gap-2">
              <Image className="h-5 w-5 text-[#86868b]" />
              生成图片
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRegenerate}
              disabled={isRegenerating}
              className="border-[#e5e5e5] text-[#666] hover:text-[#1d1d1f] rounded-xl cursor-pointer"
            >
              {isRegenerating ? (
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
              )}
              {isRegenerating ? "重新生成中..." : "重新生成"}
            </Button>
          </div>

          {images.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#e5e5e5] p-8 text-center">
              <Image className="h-10 w-10 mx-auto mb-3 text-[#ccc]" />
              <p className="text-[14px] text-[#999]">暂无生成图片</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {images.map((img: any, i: number) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl border border-[#e5e5e5] overflow-hidden group hover:shadow-md transition-shadow"
                >
                  <div className="aspect-square bg-gradient-to-br from-[#f5f5f7] to-[#e5e5e5] flex items-center justify-center relative">
                    {img.url ? (
                      <img
                        src={img.url}
                        alt={getOutputTypeLabel(img.type)}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                          (e.target as HTMLImageElement).nextElementSibling?.classList.remove("hidden");
                        }}
                      />
                    ) : null}
                    <div className={`text-center text-[#999] ${img.url ? "hidden" : ""}`}>
                      <Image className="h-8 w-8 mx-auto mb-2 opacity-40" />
                      <span className="text-[14px] font-medium opacity-60">
                        {getOutputTypeLabel(img.type)}
                      </span>
                    </div>
                    {img.url && (
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            className="h-8 rounded-lg"
                            onClick={() =>
                              handleDownload(img.url, `${getOutputTypeLabel(img.type)}-${(img.index || 0) + 1}.jpg`)
                            }
                          >
                            <Download className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="py-2 px-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] font-medium text-[#1d1d1f]">
                        {getOutputTypeLabel(img.type)} {img.index !== undefined ? `#${img.index + 1}` : ""}
                      </span>
                      {img.url && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-[12px] text-[#86868b] hover:text-[#1d1d1f] cursor-pointer"
                          onClick={() =>
                            handleDownload(img.url, `${getOutputTypeLabel(img.type)}-${(img.index || 0) + 1}.jpg`)
                          }
                        >
                          <Download className="h-3 w-3 mr-1" />
                          下载
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <h2 className="text-[18px] font-semibold text-[#1d1d1f] flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-[#86868b]" />
              生成文案
            </h2>
            <div className="bg-white rounded-2xl border border-[#e5e5e5] p-4 space-y-4">
              {copy.mainTitle ? (
                <>
                  <div>
                    <label className="text-[12px] text-[#86868b]">主标题</label>
                    <p className="text-[14px] font-medium text-[#1d1d1f] mt-0.5">{copy.mainTitle}</p>
                  </div>
                  <div>
                    <label className="text-[12px] text-[#86868b]">副标题</label>
                    <p className="text-[14px] text-[#666] mt-0.5">{copy.subTitle}</p>
                  </div>
                  {copy.coreSellingPoints?.length > 0 && (
                    <div>
                      <label className="text-[12px] text-[#86868b]">核心卖点</label>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {copy.coreSellingPoints.map((sp: string, i: number) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-full bg-[#f5f5f7] text-[#1d1d1f] text-[12px] border border-[#e5e5e5]"
                          >
                            {sp}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {copy.productDetails && (
                    <div>
                      <label className="text-[12px] text-[#86868b]">产品描述</label>
                      <p className="text-[14px] text-[#666] mt-0.5 leading-[1.6]">{copy.productDetails}</p>
                    </div>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-[#e5e5e5] text-[#666] hover:text-[#1d1d1f] hover:border-[#ccc] rounded-xl cursor-pointer"
                    onClick={() =>
                      handleCopyText(
                        [copy.mainTitle, copy.subTitle, ...(copy.coreSellingPoints || [])].join("\n")
                      )
                    }
                  >
                    <Copy className="h-3.5 w-3.5 mr-1.5" />
                    复制文案
                  </Button>
                </>
              ) : (
                <div className="text-center py-4">
                  <FileText className="h-8 w-8 mx-auto mb-2 text-[#ccc]" />
                  <p className="text-[14px] text-[#999]">暂无生成文案</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#e5e5e5] p-4 space-y-3">
            <h3 className="text-[14px] font-semibold text-[#1d1d1f]">快捷操作</h3>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start border-[#e5e5e5] text-[#666] hover:text-[#1d1d1f] hover:border-[#ccc] rounded-xl cursor-pointer"
              onClick={handleRegenerate}
              disabled={isRegenerating}
            >
              {isRegenerating ? (
                <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5 mr-2" />
              )}
              {isRegenerating ? "重新生成中..." : "重新生成"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start border-[#e5e5e5] text-[#666] hover:text-[#1d1d1f] hover:border-[#ccc] rounded-xl cursor-pointer"
              onClick={handleBatchDownload}
              disabled={images.length === 0}
            >
              <Download className="h-3.5 w-3.5 mr-2" />
              批量下载
            </Button>
            {projectId && (
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start border-[#e5e5e5] text-[#666] hover:text-[#1d1d1f] hover:border-[#ccc] rounded-xl cursor-pointer"
                onClick={() => router.push(`/workspace/editor?projectId=${projectId}`)}
              >
                <Edit3 className="h-3.5 w-3.5 mr-2" />
                编辑详情页
              </Button>
            )}
          </div>

          {balance !== undefined && (
            <div className="bg-white rounded-2xl border border-[#e5e5e5] p-4">
              <p className="text-[12px] text-[#86868b]">剩余积分</p>
              <p className="text-[18px] font-bold text-[#1d1d1f]">{balance}</p>
              <p className="text-[11px] text-[#999] mt-1">
                * 积分为 mock 预估值，未接入真实支付系统
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
