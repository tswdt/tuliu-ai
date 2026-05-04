"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Upload, 
  Image as ImageIcon, 
  X, 
  Settings, 
  Sparkles,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  Download,
  Plus,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ProductCategory, 
  GenerationStyle, 
  Resolution, 
  Platform,
  CATEGORY_LABELS,
  STYLE_LABELS,
  RESOLUTION_LABELS,
  PLATFORM_LABELS,
  WorkflowStage,
} from "@/types/generate";
import { generateDetailPage, getGenerationProgress, getGenerationResult } from "@/app/actions/generateDetailPage";

// 模拟用户ID（实际项目中应从Supabase Auth获取）
const MOCK_USER_ID = "user_001";

// 图片加载状态管理 Hook
const useImageWithFallback = (src: string, fallbackSrc: string = "https://placehold.co/800x800/cccccc/666666?text=Image+Load+Failed") => {
  const [imgSrc, setImgSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setImgSrc(src);
    setIsLoading(true);
    setHasError(false);
  }, [src]);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    setImgSrc(fallbackSrc);
  };

  return { imgSrc, isLoading, hasError, handleLoad, handleError };
};

// 可复用的图片组件
const ImageWithFallback = ({ src, alt, className, fallbackSrc }: { src: string; alt: string; className?: string; fallbackSrc?: string }) => {
  const { imgSrc, isLoading, hasError, handleLoad, handleError } = useImageWithFallback(src, fallbackSrc);

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      )}
      <img
        src={imgSrc}
        alt={alt}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onLoad={handleLoad}
        onError={handleError}
      />
      {hasError && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg border border-gray-300">
          <div className="text-center text-gray-500">
            <ImageIcon className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm">图片加载失败</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default function GeneratePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // 表单状态
  const [step, setStep] = useState<"form" | "generating" | "result">("form");
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState<ProductCategory>(ProductCategory.OTHER);
  const [platform, setPlatform] = useState<Platform>(Platform.TAOBAO);
  const [style, setStyle] = useState<GenerationStyle>(GenerationStyle.SIMPLE);
  const [resolution, setResolution] = useState<Resolution>(Resolution.FOUR_K);
  const [coreSellingPoints, setCoreSellingPoints] = useState<string[]>([]);
  const [newSellingPoint, setNewSellingPoint] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  // 生成状态
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState<WorkflowStage>(WorkflowStage.PREPROCESSING);
  const [stageMessage, setStageMessage] = useState("准备中...");
  const [error, setError] = useState<string | null>(null);
  
  // 生成结果
  const [resultData, setResultData] = useState<any>(null);

  // 图片上传处理
  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target?.result as string);
        setImageFile(file);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  // 移除图片
  const removeImage = () => {
    setImage(null);
    setImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // 添加卖点
  const addSellingPoint = () => {
    if (newSellingPoint.trim()) {
      setCoreSellingPoints([...coreSellingPoints, newSellingPoint.trim()]);
      setNewSellingPoint("");
    }
  };

  // 移除卖点
  const removeSellingPoint = (index: number) => {
    setCoreSellingPoints(coreSellingPoints.filter((_, i) => i !== index));
  };

  // 开始生成
  const handleGenerate = async () => {
    if (!imageFile) {
      setError("请上传商品图片");
      return;
    }

    if (coreSellingPoints.length === 0) {
      setError("请至少添加一个核心卖点");
      return;
    }

    setError(null);
    setStep("generating");

    try {
      const formData = new FormData();
      formData.append("productName", productName);
      formData.append("category", category);
      formData.append("platform", platform);
      formData.append("style", style);
      formData.append("resolution", resolution);
      formData.append("coreSellingPoints", JSON.stringify(coreSellingPoints));
      formData.append("image", imageFile);
      formData.append("userId", MOCK_USER_ID);

      const result = await generateDetailPage(formData);

      if (!result.success || !result.generationId) {
        throw new Error(result.error || "生成失败");
      }

      setGenerationId(result.generationId);
      
      // 轮询进度
      pollProgress(result.generationId);

    } catch (err) {
      setError(err instanceof Error ? err.message : "生成失败，请重试");
      setStep("form");
    }
  };

  // 获取真实生成结果
  const fetchResultData = async (genId: string) => {
    try {
      const result = await getGenerationResult(genId);
      if (result) {
        setResultData(result);
      }
    } catch (err) {
      console.error("获取生成结果失败:", err);
    }
  };

  // 轮询进度
  const pollProgress = async (genId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const progressData = await getGenerationProgress(genId);
        
        if (progressData) {
          setProgress(progressData.progress);
          setCurrentStage(progressData.stage as WorkflowStage);
          setStageMessage(progressData.message);

          if (progressData.progress >= 100) {
            clearInterval(pollInterval);
            setStep("result");
            // 从数据库获取完整结果
            await fetchResultData(genId);
          }
        }
      } catch (err) {
        console.error("轮询进度失败:", err);
      }
    }, 1000);
  };

  // 下载图片
  const downloadImage = (url: string, name: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 批量下载
  const batchDownload = () => {
    if (!resultData) return;
    
    const allImages = [
      { url: resultData.mainImageUrl, name: "主图" },
      ...resultData.sceneImageUrls.map((url: string, i: number) => ({ url, name: `场景图${i + 1}` })),
      ...resultData.detailImageUrls.map((url: string, i: number) => ({ url, name: `细节图${i + 1}` })),
      ...resultData.sellingPointImageUrls.map((url: string, i: number) => ({ url, name: `卖点图${i + 1}` })),
      { url: resultData.detailPageUrl, name: "详情页" },
    ];

    allImages.forEach((img, i) => {
      setTimeout(() => {
        downloadImage(img.url, `${productName}_${img.name}.png`);
      }, i * 500);
    });
  };

  // 获取阶段显示名称
  const getStageLabel = (stage: WorkflowStage) => {
    const stageLabels: Record<WorkflowStage, string> = {
      [WorkflowStage.PREPROCESSING]: "图片预处理",
      [WorkflowStage.COPY_GENERATION]: "文案生成",
      [WorkflowStage.IMAGE_GENERATION]: "图片生成",
      [WorkflowStage.COMPOSITION]: "排版合成",
      [WorkflowStage.COMPLETED]: "完成",
    };
    return stageLabels[stage] || "处理中";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => router.back()}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回
              </Button>
              <h1 className="text-xl font-semibold">AI详情页生成</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline">剩余 8 次</Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 表单步骤 */}
        {step === "form" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 左侧：表单 */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>商品信息</CardTitle>
                  <CardDescription>请填写商品的基本信息</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="productName">商品名称 *</Label>
                    <Input
                      id="productName"
                      placeholder="请输入商品名称"
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      className="mt-2"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>商品品类 *</Label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as ProductCategory)}
                        className="w-full mt-2 h-10 px-3 rounded-md border border-input bg-background"
                      >
                        {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                          <option key={key} value={key}>{label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label>目标平台 *</Label>
                      <select
                        value={platform}
                        onChange={(e) => setPlatform(e.target.value as Platform)}
                        className="w-full mt-2 h-10 px-3 rounded-md border border-input bg-background"
                      >
                        {Object.entries(PLATFORM_LABELS).map(([key, label]) => (
                          <option key={key} value={key}>{label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>生成风格 *</Label>
                      <select
                        value={style}
                        onChange={(e) => setStyle(e.target.value as GenerationStyle)}
                        className="w-full mt-2 h-10 px-3 rounded-md border border-input bg-background"
                      >
                        {Object.entries(STYLE_LABELS).map(([key, label]) => (
                          <option key={key} value={key}>{label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label>分辨率 *</Label>
                      <select
                        value={resolution}
                        onChange={(e) => setResolution(e.target.value as Resolution)}
                        className="w-full mt-2 h-10 px-3 rounded-md border border-input bg-background"
                      >
                        {Object.entries(RESOLUTION_LABELS).map(([key, label]) => (
                          <option key={key} value={key}>{label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <Label>核心卖点 *</Label>
                    <div className="mt-2 flex gap-2">
                      <Input
                        placeholder="输入卖点后按回车或点击添加"
                        value={newSellingPoint}
                        onChange={(e) => setNewSellingPoint(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSellingPoint())}
                      />
                      <Button onClick={addSellingPoint}>
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {coreSellingPoints.map((point, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-2">
                          {point}
                          <button
                            onClick={() => removeSellingPoint(index)}
                            className="hover:text-red-500"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>商品图片</CardTitle>
                  <CardDescription>请上传商品原图</CardDescription>
                </CardHeader>
                <CardContent>
                  {!image ? (
                    <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-10 h-10 mb-3 text-gray-400" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">点击上传</span> 或拖拽文件到此处
                        </p>
                        <p className="text-xs text-gray-500">支持 JPG, PNG, WebP (最大 10MB)</p>
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                    </label>
                  ) : (
                    <div className="relative">
                      <img
                        src={image}
                        alt="预览"
                        className="w-full h-48 object-contain rounded-lg border"
                      />
                      <button
                        onClick={removeImage}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
                  {error}
                </div>
              )}

              <Button 
                size="lg" 
                className="w-full"
                onClick={handleGenerate}
                disabled={!productName || !imageFile || coreSellingPoints.length === 0}
              >
                <Sparkles className="w-5 h-5 mr-2" />
                开始生成（消耗 1 额度）
              </Button>
            </div>

            {/* 右侧：预览和提示 */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>效果预览</CardTitle>
                  <CardDescription>生成后将在这里显示结果</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center text-gray-400">
                      <ImageIcon className="w-16 h-16 mx-auto mb-4" />
                      <p>生成结果将显示在这里</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>生成技巧</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm text-gray-600">
                    <li className="flex items-start">
                      <CheckCircle2 className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>上传清晰的商品原图，背景简单效果更好</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>详细描述您想要的风格、光线、背景等</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>可以多次生成，选择最满意的效果</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* 生成中步骤 */}
        {step === "generating" && (
          <Card>
            <CardHeader>
              <CardTitle>正在生成详情页...</CardTitle>
              <CardDescription>请耐心等待，这可能需要几分钟时间</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 进度条 */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{getStageLabel(currentStage)}</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary-600 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-500">{stageMessage}</p>
              </div>

              {/* 阶段指示器 */}
              <div className="flex items-center justify-between">
                {[
                  { stage: WorkflowStage.PREPROCESSING, label: "预处理" },
                  { stage: WorkflowStage.COPY_GENERATION, label: "文案" },
                  { stage: WorkflowStage.IMAGE_GENERATION, label: "图片" },
                  { stage: WorkflowStage.COMPOSITION, label: "合成" },
                  { stage: WorkflowStage.COMPLETED, label: "完成" },
                ].map((item, index) => (
                  <div key={item.stage} className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                      progress > index * 20 
                        ? "bg-primary-600 border-primary-600 text-white" 
                        : "bg-white border-gray-300 text-gray-400"
                    }`}>
                      {progress > index * 20 ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <Loader2 className={`w-5 h-5 ${currentStage === item.stage ? "animate-spin" : ""}`} />
                      )}
                    </div>
                    <span className={`text-xs mt-2 ${
                      progress > index * 20 ? "text-primary-600" : "text-gray-400"
                    }`}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 结果步骤 */}
        {step === "result" && resultData && (
          <div className="space-y-6">
            {resultData.status === "FAILED" ? (
              <Card className="border-red-200">
                <CardHeader className="bg-red-50">
                  <CardTitle className="text-red-700">生成失败</CardTitle>
                  <CardDescription className="text-red-600">
                    {resultData.errorMessage || "抱歉，生成过程中发生了错误"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="flex space-x-4">
                    <Button variant="outline" onClick={() => setStep("form")}>
                      重新生成
                    </Button>
                    <Button onClick={() => router.push("/dashboard")}>
                      返回控制台
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>生成完成！</CardTitle>
                      <CardDescription>您的详情页已成功生成</CardDescription>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" onClick={() => setStep("form")}>
                        重新生成
                      </Button>
                      <Button onClick={batchDownload}>
                        <Download className="w-4 h-4 mr-2" />
                        批量下载
                      </Button>
                    </div>
                  </CardHeader>
                </Card>

            {/* 文案部分 */}
            <Card>
              <CardHeader>
                <CardTitle>生成的文案</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>主标题</Label>
                  <p className="mt-1 text-lg font-semibold">{resultData.copyContent.mainTitle}</p>
                </div>
                <div>
                  <Label>副标题</Label>
                  <p className="mt-1 text-gray-600">{resultData.copyContent.subTitle}</p>
                </div>
                <div>
                  <Label>核心卖点</Label>
                  <ul className="mt-1 space-y-1">
                    {resultData.copyContent.coreSellingPoints.map((point: string, i: number) => (
                      <li key={i} className="flex items-center">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mr-2" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <Label>产品详情</Label>
                  <p className="mt-1 text-gray-600">{resultData.copyContent.productDetails}</p>
                </div>
                <div>
                  <Label>常见问题</Label>
                  <div className="mt-1 space-y-2">
                    {resultData.copyContent.faq.map((faq: any, i: number) => (
                      <div key={i} className="p-3 bg-gray-50 rounded-lg">
                        <p className="font-medium">{faq.question}</p>
                        <p className="text-gray-600 text-sm">{faq.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 图片部分 */}
            <Card>
              <CardHeader>
                <CardTitle>生成的图片</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 主图 */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label>主图</Label>
                    <Button variant="ghost" size="sm" onClick={() => downloadImage(resultData.mainImageUrl, `${productName}_主图.png`)}>
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                  <ImageWithFallback
                    src={resultData.mainImageUrl}
                    alt="主图"
                    className="w-full max-w-md mx-auto rounded-lg border"
                  />
                </div>

                {/* 场景图 */}
                <div>
                  <Label className="mb-3 block">场景图</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {resultData.sceneImageUrls.map((url: string, i: number) => (
                      <div key={i} className="group relative">
                        <ImageWithFallback
                          src={url}
                          alt={`场景图${i + 1}`}
                          className="w-full aspect-square object-cover rounded-lg border"
                        />
                        <button
                          onClick={() => downloadImage(url, `${productName}_场景图${i + 1}.png`)}
                          className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center"
                        >
                          <Download className="w-6 h-6 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 细节图 */}
                <div>
                  <Label className="mb-3 block">细节图</Label>
                  <div className="grid grid-cols-2 gap-4">
                    {resultData.detailImageUrls.map((url: string, i: number) => (
                      <div key={i} className="group relative">
                        <ImageWithFallback
                          src={url}
                          alt={`细节图${i + 1}`}
                          className="w-full aspect-square object-cover rounded-lg border"
                        />
                        <button
                          onClick={() => downloadImage(url, `${productName}_细节图${i + 1}.png`)}
                          className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center"
                        >
                          <Download className="w-6 h-6 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 卖点图 */}
                <div>
                  <Label className="mb-3 block">卖点图</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {resultData.sellingPointImageUrls.map((url: string, i: number) => (
                      <div key={i} className="group relative">
                        <ImageWithFallback
                          src={url}
                          alt={`卖点图${i + 1}`}
                          className="w-full aspect-square object-cover rounded-lg border"
                        />
                        <button
                          onClick={() => downloadImage(url, `${productName}_卖点图${i + 1}.png`)}
                          className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center"
                        >
                          <Download className="w-6 h-6 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 详情页长图 */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label>详情页长图</Label>
                    <Button variant="ghost" size="sm" onClick={() => downloadImage(resultData.detailPageUrl, `${productName}_详情页.png`)}>
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                  <ImageWithFallback
                    src={resultData.detailPageUrl}
                    alt="详情页"
                    className="w-full rounded-lg border"
                  />
                </div>
              </CardContent>
            </Card>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
