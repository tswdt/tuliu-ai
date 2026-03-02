"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { 
  Upload, 
  Image as ImageIcon, 
  X, 
  Settings, 
  Sparkles,
  CheckCircle2,
  Loader2,
  Download,
  Database
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PLATFORM_SIZES } from "@/lib/utils";
import { generateProductImages } from "@/app/actions/generateImage";

type Platform = keyof typeof PLATFORM_SIZES;

const STYLES = [
  { value: "minimal", label: "极简风格", description: "简洁干净，白色背景" },
  { value: "professional", label: "专业摄影", description: "专业布光，商业质感" },
  { value: "luxury", label: "高端奢华", description: "高端质感，高级感" },
  { value: "cyberpunk", label: "赛博朋克", description: "科技感，霓虹灯光" },
  { value: "cream", label: "奶油风", description: "柔和色彩，温馨感觉" },
  { value: "vintage", label: "复古风格", description: "复古质感，怀旧氛围" }
];

export default function GenerateImagePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>("TAOBAO");
  const [selectedStyle, setSelectedStyle] = useState("minimal");
  const [image, setImage] = useState<string | null>(null);
  const [productName, setProductName] = useState("");
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [imageCount, setImageCount] = useState(4);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageMD5, setImageMD5] = useState<string | null>(null);
  const [usedCache, setUsedCache] = useState(false);

  async function calculateFileMD5(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  }

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = async (e) => {
        setImage(e.target?.result as string);
        const md5 = await calculateFileMD5(file);
        setImageMD5(md5);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const removeImage = () => {
    setImage(null);
    setSelectedFile(null);
    setImageMD5(null);
  };

  const downloadImage = (url: string, index: number) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = `商品主图_${index + 1}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleGenerate = async () => {
    if (!productName.trim()) {
      setError("请输入商品名称");
      return;
    }

    setError(null);
    setUsedCache(false);
    setIsGenerating(true);
    
    try {
      const result = await generateProductImages(
        productName,
        prompt,
        selectedPlatform,
        imageCount,
        selectedStyle,
        imageMD5 || undefined
      );

      if (result.success && result.images) {
        setGeneratedImages(result.images);
        if (result.cached) {
          setUsedCache(true);
        }
        setStep(2);
      } else {
        setError(result.error || "生成失败，请重试");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "生成失败，请重试");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => router.back()}>
              ← 返回
            </Button>
            <div>
              <h1 className="text-xl font-semibold">生成商品主图</h1>
              <p className="text-sm text-gray-500">上传商品图，AI帮您生成4K超清主图</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {step === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 左侧：上传和配置 */}
            <div className="space-y-6">
              {/* 商品名称 */}
              <Card>
                <CardHeader>
                  <CardTitle>商品名称</CardTitle>
                  <CardDescription>
                    输入商品名称，AI会根据名称生成更精准的图片
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Input
                    placeholder="例如：纯棉T恤、运动鞋、护肤套装..."
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                  />
                </CardContent>
              </Card>

              {/* 图片上传 */}
              <Card>
                <CardHeader>
                  <CardTitle>上传商品图片（可选）</CardTitle>
                  <CardDescription>
                    支持 JPG、PNG 格式，建议尺寸不小于 800x800
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!image ? (
                    <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-12 h-12 mb-4 text-gray-400" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">点击上传</span> 或拖拽文件到此处
                        </p>
                        <p className="text-xs text-gray-500">支持 JPG, PNG (最大 10MB)</p>
                      </div>
                      <input
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
                        className="w-full h-64 object-contain rounded-lg border"
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

              {/* 平台选择 */}
              <Card>
                <CardHeader>
                  <CardTitle>选择平台</CardTitle>
                  <CardDescription>
                    选择您要发布的电商平台，我们会自动适配尺寸
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-3">
                    {(Object.entries(PLATFORM_SIZES) as [Platform, typeof PLATFORM_SIZES[Platform]][]).map(([key, value]) => (
                      <button
                        key={key}
                        onClick={() => setSelectedPlatform(key)}
                        className={`p-4 border rounded-lg text-center transition-all ${
                          selectedPlatform === key
                            ? "border-primary-500 bg-primary-50 text-primary-700"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="font-medium mb-1">{value.name}</div>
                        <div className="text-xs text-gray-500">
                          {value.width}x{value.height}
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 风格选择 */}
              <Card>
                <CardHeader>
                  <CardTitle>选择风格</CardTitle>
                  <CardDescription>
                    选择您想要的图片风格
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {STYLES.map((style) => (
                      <button
                        key={style.value}
                        onClick={() => setSelectedStyle(style.value)}
                        className={`p-4 border rounded-lg text-left transition-all ${
                          selectedStyle === style.value
                            ? "border-primary-500 bg-primary-50 text-primary-700"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="font-medium mb-1">{style.label}</div>
                        <div className="text-xs text-gray-500">
                          {style.description}
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 提示词 */}
              <Card>
                <CardHeader>
                  <CardTitle>AI提示词</CardTitle>
                  <CardDescription>
                    描述您想要的效果，越详细越好
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="例如：高品质商品摄影，专业灯光，白色背景，高清细节，商业摄影风格..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={4}
                  />
                  <div className="mt-4 flex flex-wrap gap-2">
                    {[
                      "白色背景",
                      "专业灯光",
                      "高品质",
                      "3D渲染",
                      "极简风格",
                      "高端奢华"
                    ].map((tag) => (
                      <button
                        key={tag}
                        onClick={() => setPrompt(prev => prev ? `${prev}，${tag}` : tag)}
                        className="px-3 py-1 text-sm bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 高级设置 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="w-5 h-5 mr-2" />
                    高级设置
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label>生成数量</Label>
                      <div className="flex items-center space-x-2 mt-2">
                        {[1, 2, 3, 4].map((num) => (
                          <button
                            key={num}
                            onClick={() => setImageCount(num)}
                            className={`px-4 py-2 rounded-lg border transition-all cursor-pointer ${
                              imageCount === num 
                                ? "border-primary-500 bg-primary-50 text-primary-700" 
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            {num}张
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
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
                disabled={!productName.trim() || isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    AI生成中...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    开始生成（消耗 1 额度）
                  </>
                )}
              </Button>
            </div>

            {/* 右侧：预览和参考 */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>效果预览</CardTitle>
                  <CardDescription>
                    生成后将在这里显示结果
                  </CardDescription>
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

        {step === 2 && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <CardTitle>生成完成！</CardTitle>
                  {usedCache && (
                    <div className="flex items-center space-x-1 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
                      <Database className="w-4 h-4" />
                      <span>使用缓存结果</span>
                    </div>
                  )}
                </div>
                <CardDescription>
                  {usedCache ? '从历史缓存中快速获取，为您节省了AI生成额度' : '以下是AI为您生成的图片，请选择满意的下载'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {generatedImages.map((img, index) => (
                    <div key={index} className="group relative">
                      <img
                        src={img}
                        alt={`生成图片 ${index + 1}`}
                        className="w-full aspect-square object-cover rounded-lg border"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center space-x-2">
                        <Button 
                          variant="secondary" 
                          size="sm"
                          onClick={() => downloadImage(img, index)}
                        >
                          <Download className="w-4 h-4 mr-1" />
                          下载
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-center space-x-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setStep(1);
                  setGeneratedImages([]);
                }}
              >
                重新生成
              </Button>
              <Button onClick={() => router.push("/dashboard")}>
                返回控制台
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
