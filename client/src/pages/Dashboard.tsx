import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Zap, Download } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const [promptCn, setPromptCn] = useState("");
  const [width, setWidth] = useState("1024");
  const [height, setHeight] = useState("1024");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const generateMutation = trpc.generate.generate.useMutation();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="animate-spin text-neon-pink" size={48} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-foreground mb-4">请先登录</p>
          <Button onClick={() => window.location.href = "/login"}>返回登录</Button>
        </div>
      </div>
    );
  }

  const handleGenerate = async () => {
    if (!promptCn.trim()) {
      toast.error("请输入 Prompt");
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateMutation.mutateAsync({
        promptCn,
        width: parseInt(width),
        height: parseInt(height),
      });

      setGeneratedImage(result.imageUrl);
      toast.success("图片生成成功！");
      setPromptCn("");
    } catch (error: any) {
      toast.error(error.message || "生成失败，请稍后重试");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* 顶部导航 */}
      <div className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Zap className="text-neon-pink" size={24} />
            <span className="font-bold text-lg">Tuliu AI</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm">
              <span className="text-muted-foreground">积分余额：</span>
              <span className="font-bold text-neon-cyan">{user.credits}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                trpc.auth.logout.useMutation().mutate();
                window.location.href = "/";
              }}
            >
              登出
            </Button>
          </div>
        </div>
      </div>

      {/* 主容器 */}
      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧参数栏 */}
          <div className="lg:col-span-1">
            <Card className="glass-effect-pink p-6 space-y-6">
              <div>
                <h3 className="font-bold text-lg mb-4 neon-glow">生成参数</h3>
              </div>

              {/* Prompt 输入 */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Prompt (中文)</label>
                <Textarea
                  placeholder="描述你想要生成的图片..."
                  value={promptCn}
                  onChange={(e) => setPromptCn(e.target.value)}
                  className="min-h-24 resize-none"
                />
              </div>

              {/* 尺寸选择 */}
              <div className="space-y-2">
                <label className="text-sm font-medium">图片尺寸</label>
                <Select value={width} onValueChange={setWidth}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="800">Trial (800x800) - 0 积分</SelectItem>
                    <SelectItem value="1024">Standard (1024x1024) - 1 积分</SelectItem>
                    <SelectItem value="2048">HD (2048x2048) - 2 积分</SelectItem>
                    <SelectItem value="4096">Ultra (4096x4096) - 4 积分</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 生成按钮 */}
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !promptCn.trim()}
                className="w-full btn-neon"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={18} />
                    生成中...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2" size={18} />
                    生成图片
                  </>
                )}
              </Button>

              {/* 快速案例 */}
              <div className="pt-4 border-t border-border">
                <p className="text-sm font-medium mb-3">快速案例</p>
                <div className="space-y-2">
                  {[
                    "红色运动鞋，专业摄影，白色背景，产品展示",
                    "高级化妆品，玻璃瓶，金色光线，奢侈感",
                    "苹果手机，科技感，蓝色背景，产品渲染",
                  ].map((prompt, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      size="sm"
                      className="w-full justify-start text-xs"
                      onClick={() => setPromptCn(prompt)}
                    >
                      {prompt.substring(0, 20)}...
                    </Button>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* 右侧画布 */}
          <div className="lg:col-span-2">
            <Card className="glass-effect p-6 min-h-96 flex flex-col items-center justify-center">
              {generatedImage ? (
                <div className="w-full space-y-4">
                  <img
                    src={generatedImage}
                    alt="Generated"
                    className="w-full rounded-lg border border-neon-pink"
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        const link = document.createElement("a");
                        link.href = generatedImage;
                        link.download = `tuliu-ai-${Date.now()}.png`;
                        link.click();
                      }}
                      className="flex-1 btn-neon-cyan"
                    >
                      <Download className="mr-2" size={18} />
                      下载图片
                    </Button>
                    <Button
                      onClick={() => setGeneratedImage(null)}
                      variant="outline"
                      className="flex-1"
                    >
                      继续生成
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <div className="text-6xl">🎨</div>
                  <p className="text-muted-foreground">输入 Prompt 并点击生成按钮</p>
                  <p className="text-sm text-muted-foreground">当前积分：{user.credits}</p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
