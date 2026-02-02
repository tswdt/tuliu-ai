"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { ImageComparison } from "@/components/ImageComparison";
import { generateImage } from "@/server/actions/generate";
import { toast } from "sonner";
import { Loader2, Upload, X } from "lucide-react";
import Image from "next/image";

const PLACEHOLDER_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400'%3E%3Crect fill='%23f5f5f5' width='600' height='400'/%3E%3Ctext x='50%25' y='50%25' font-size='24' fill='%23999' text-anchor='middle' dominant-baseline='middle'%3E%E4%BA%A7%E5%93%81%E5%9B%BE%E7%89%87%3C/text%3E%3C/svg%3E";

export default function Home() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("图片大小不能超过 10MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setUploadedImage(base64);
      toast.success("图片上传成功！");
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setUploadedImage(null);
    setGeneratedImageUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleGenerate = async () => {
    if (!uploadedImage) {
      toast.error("请先上传产品原图");
      return;
    }

    if (!prompt.trim()) {
      toast.error("请输入场景描述");
      return;
    }

    setLoading(true);
    try {
      const result = await generateImage({
        prompt: prompt.trim(),
        base64Image: uploadedImage,
        aspectRatio: "1:1",
      });

      if (result.success && result.url) {
        setGeneratedImageUrl(result.url);
        toast.success("生成成功！✨");
      } else {
        toast.error("生成失败，请重试");
      }
    } catch (error) {
      console.error("Generation error:", error);
      toast.error(
        error instanceof Error ? error.message : "生成过程中出错"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-light tracking-tight">
            图流 AI <span className="text-zinc-500">/ 智能电商摄影</span>
          </h1>
          <p className="text-zinc-400 text-sm mt-2">
            将随手拍的产品照片，一键转化为高级电商大片
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Control */}
          <div className="space-y-6">
            {/* Step 1: Upload Image */}
            <Card className="bg-zinc-900 border-zinc-800 p-6">
              <h2 className="text-lg font-semibold mb-4 text-zinc-100">
                第一步：上传产品原图
              </h2>
              <p className="text-sm text-zinc-400 mb-4">
                支持随手拍、乱背景，我们会自动抠图
              </p>

              {uploadedImage ? (
                <div className="relative mb-4">
                  <img
                    src={uploadedImage}
                    alt="Uploaded product"
                    className="w-full h-40 object-cover rounded-lg border border-zinc-700"
                  />
                  <button
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 p-1 rounded-full"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-zinc-700 rounded-lg p-8 text-center cursor-pointer hover:border-zinc-600 transition-colors"
                >
                  <Upload className="w-8 h-8 text-zinc-500 mx-auto mb-2" />
                  <p className="text-zinc-400 text-sm">
                    点击或拖拽上传图片
                  </p>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </Card>

            {/* Step 2: Prompt Input */}
            <Card className="bg-zinc-900 border-zinc-800 p-6">
              <h2 className="text-lg font-semibold mb-4 text-zinc-100">
                第二步：输入场景描述
              </h2>

              <div className="space-y-3 mb-6">
                <Label htmlFor="prompt" className="text-zinc-300">
                  场景设定
                </Label>
                <Textarea
                  id="prompt"
                  placeholder="例如：放在高级灰的大理石台面上，窗边柔和自然光，背景是简约现代的室内..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  disabled={loading}
                  className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 resize-none h-32"
                />
              </div>

              {/* Generate Button */}
              <Button
                onClick={handleGenerate}
                disabled={loading || !uploadedImage || !prompt.trim()}
                className="w-full bg-zinc-100 text-zinc-950 hover:bg-zinc-200 font-semibold py-2 h-10"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    正在生成...
                  </>
                ) : (
                  "开始生成 (抠图+重绘)"
                )}
              </Button>

              {/* Status Info */}
              {loading && (
                <div className="mt-4 space-y-2">
                  <Skeleton className="h-4 w-full bg-zinc-800" />
                  <Skeleton className="h-4 w-3/4 bg-zinc-800" />
                </div>
              )}
            </Card>

            {/* Tips Card */}
            <Card className="bg-zinc-900 border-zinc-800 p-4">
              <p className="text-sm text-zinc-400">
                <span className="font-semibold text-zinc-300">💡 提示：</span> 场景描述越详细，生成效果越好。可以描述背景、光线、摆放位置等细节。
              </p>
            </Card>
          </div>

          {/* Right Panel - Visual */}
          <div className="space-y-6">
            <Card className="bg-zinc-900 border-zinc-800 p-6">
              <h2 className="text-lg font-semibold mb-4 text-zinc-100">
                原图 vs 大片
              </h2>

              {generatedImageUrl ? (
                <ImageComparison
                  beforeSrc={uploadedImage || PLACEHOLDER_IMAGE}
                  afterSrc={generatedImageUrl}
                  width={500}
                  height={500}
                  className="w-full"
                />
              ) : (
                <div className="w-full bg-zinc-800 rounded-lg aspect-square flex items-center justify-center border border-zinc-700">
                  <div className="text-center">
                    <p className="text-zinc-500 text-sm">
                      {loading ? "正在为您的产品打造大片..." : "生成的高级大片将在这里展示"}
                    </p>
                  </div>
                </div>
              )}
            </Card>

            {/* Process Info */}
            <Card className="bg-zinc-900 border-zinc-800 p-4">
              <p className="text-xs text-zinc-400">
                <span className="font-semibold text-zinc-300">处理流程：</span> 上传原图 → Bria AI 智能抠图 → Flux 场景重绘 → 高级电商大片
              </p>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
