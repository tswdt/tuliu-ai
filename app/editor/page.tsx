"use client";

import React, { Suspense, useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload, Trash2, Download, Eraser, Pencil, Save } from 'lucide-react';
import { toast } from 'sonner';
import { useSearchParams } from 'next/navigation';

export default function EditorPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-zinc-950 text-zinc-400">加载中...</div>}>
      <EditorContent />
    </Suspense>
  );
}

function EditorContent() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<fabric.Canvas | null>(null);
  const [brushSize, setBrushSize] = useState(20);
  const [isDrawing, setIsDrawing] = useState(true);
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      isDrawingMode: true,
      width: 800,
      height: 600,
      backgroundColor: '#18181b',
    });

    // 默认画笔配置
    const brush = new fabric.PencilBrush(canvas);
    brush.width = brushSize;
    brush.color = "rgba(255, 255, 255, 0.5)";
    canvas.freeDrawingBrush = brush;

    setFabricCanvas(canvas);
    return () => { canvas.dispose(); };
  }, []);

  // Load result image from jobId query param
  useEffect(() => {
    const jobId = searchParams.get('jobId');
    if (!jobId || !fabricCanvas) return;

    fetch(`/api/poll?jobId=${jobId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((state) => {
        const url = state?.resultUrl ?? state?.inputUrl;
        if (!url) return;
        fabric.Image.fromURL(url, (img) => {
          const maxWidth = 800;
          const scale = Math.min(maxWidth / (img.width || 800), 1);
          img.scale(scale);
          fabricCanvas.setDimensions({
            width: (img.width || 800) * scale,
            height: (img.height || 600) * scale,
          });
          fabricCanvas.setBackgroundImage(img, fabricCanvas.renderAll.bind(fabricCanvas));
          toast.success('结果图已加载到编辑器');
        }, { crossOrigin: 'anonymous' });
      })
      .catch(() => toast.error('加载结果图失败'));
  }, [fabricCanvas, searchParams]);

  // 同步画笔大小
  useEffect(() => {
    if (fabricCanvas && fabricCanvas.freeDrawingBrush) {
      fabricCanvas.freeDrawingBrush.width = brushSize;
    }
  }, [brushSize, fabricCanvas]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !fabricCanvas) return;

    const objectUrl = URL.createObjectURL(file);
    fabric.Image.fromURL(objectUrl, (img) => {
      // 调整画布大小以适应图片
      const maxWidth = 800;
      const scale = Math.min(maxWidth / (img.width || 800), 1);

      img.scale(scale);
      fabricCanvas.setDimensions({
        width: (img.width || 800) * scale,
        height: (img.height || 600) * scale,
      });

      fabricCanvas.setBackgroundImage(img, fabricCanvas.renderAll.bind(fabricCanvas));
      URL.revokeObjectURL(objectUrl);
      toast.success("背景图已加载");
    });
  };

  const handleDownload = () => {
    if (!fabricCanvas) return;
    const dataUrl = fabricCanvas.toDataURL({ format: 'png', multiplier: 1 });
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `edited_${Date.now()}.png`;
    link.click();
    toast.success('图片已下载');
  };

  const exportMask = () => {
    if (!fabricCanvas) return;
    
    // 导出遮罩逻辑：
    // 1. 隐藏背景图
    // 2. 将所有笔触颜色改为白色
    // 3. 将背景设为黑色
    // 4. 导出 PNG
    
    const originalBackground = fabricCanvas.backgroundImage;
    const objects = fabricCanvas.getObjects();
    
    fabricCanvas.setBackgroundImage(null as any, () => {});
    fabricCanvas.backgroundColor = 'black';
    
    objects.forEach(obj => {
      if (obj instanceof fabric.Path) {
        (obj as any)._originalStroke = obj.stroke;
        obj.set({ stroke: 'white' });
      }
    });
    
    fabricCanvas.renderAll();
    
    const maskData = fabricCanvas.toDataURL({
      format: 'png',
      multiplier: 1,
    });
    
    // 还原画布
    fabricCanvas.setBackgroundImage(originalBackground as any, () => {});
    fabricCanvas.backgroundColor = '#18181b';
    objects.forEach(obj => {
      if (obj instanceof fabric.Path && (obj as any)._originalStroke) {
        obj.set({ stroke: (obj as any)._originalStroke });
      }
    });
    fabricCanvas.renderAll();

    // 触发下载
    const link = document.createElement('a');
    link.href = maskData;
    link.download = `mask_${Date.now()}.png`;
    link.click();
    
    toast.success("遮罩已生成并下载");
  };

  return (
    <div className="flex flex-col items-center p-8 bg-zinc-950 min-h-screen text-zinc-100 font-sans">
      <div className="max-w-4xl w-full space-y-8">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-light tracking-tight">智能遮罩编辑器</h1>
            <p className="text-zinc-500 text-sm mt-1">手动涂抹产品区域，生成精准重绘遮罩</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
              <Upload className="w-4 h-4 mr-2" /> 上传底图
            </Button>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_200px] gap-8">
          <Card className="bg-zinc-900 border-zinc-800 p-4 flex items-center justify-center min-h-[500px] relative overflow-hidden">
            <canvas ref={canvasRef} className="shadow-2xl rounded" />
          </Card>

          <aside className="space-y-6">
            <div className="space-y-4">
              <label className="text-sm font-medium text-zinc-400">画笔设置</label>
              <div className="p-4 bg-zinc-900 rounded-lg border border-zinc-800 space-y-4">
                <div className="flex justify-between text-xs">
                  <span>大小: {brushSize}px</span>
                </div>
                <input 
                  type="range" min="1" max="100" value={brushSize} 
                  onChange={(e) => setBrushSize(parseInt(e.target.value))}
                  className="w-full accent-blue-500"
                />
                <div className="flex gap-2">
                  <Button 
                    variant={isDrawing ? "default" : "outline"} 
                    className="flex-1 h-8" size="sm"
                    onClick={() => {
                      setIsDrawing(true);
                      if (fabricCanvas) fabricCanvas.isDrawingMode = true;
                    }}
                  >
                    <Pencil className="w-3 h-3 mr-1" /> 画笔
                  </Button>
                  <Button 
                    variant={!isDrawing ? "default" : "outline"} 
                    className="flex-1 h-8" size="sm"
                    onClick={() => {
                      setIsDrawing(false);
                      if (fabricCanvas) fabricCanvas.isDrawingMode = false;
                    }}
                  >
                    <Eraser className="w-3 h-3 mr-1" /> 选择
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-zinc-800">
              <Button className="w-full bg-green-700 hover:bg-green-600" onClick={handleDownload}>
                <Download className="w-4 h-4 mr-2" /> 下载图片
              </Button>
              <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={exportMask}>
                <Download className="w-4 h-4 mr-2" /> 导出遮罩
              </Button>
              <Button variant="destructive" className="w-full" onClick={() => fabricCanvas?.clear()}>
                <Trash2 className="w-4 h-4 mr-2" /> 清空画板
              </Button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
