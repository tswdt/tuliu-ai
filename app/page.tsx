'use client';

import { useState, useEffect, useRef } from 'react';
import { startGeneration } from '@/server/actions/generate';
import { JobState } from '@/lib/services/job';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, Upload, X, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function Home() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [state, setState] = useState<JobState | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("图片大小不能超过 10MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedImage(event.target?.result as string);
      toast.success("图片上传成功！");
    };
    reader.readAsDataURL(file);
  };

  const handleStart = async () => {
    if (!uploadedImage) return;
    setLoading(true);
    const id = `job_${Date.now()}`;
    setJobId(id);
    
    try {
      // In a real app, we'd upload the base64 to COS first and get a URL
      // For this demo, we'll pass the base64 (though not ideal for large files)
      await startGeneration(id, uploadedImage);
    } catch (err) {
      toast.error("启动任务失败");
      setLoading(false);
    }
  };

  // Polling logic
  useEffect(() => {
    if (!jobId || state?.status === 'completed' || state?.status === 'failed') {
      if (state?.status === 'completed' || state?.status === 'failed') {
        setLoading(false);
      }
      return;
    }

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/poll?jobId=${jobId}`);
        if (res.ok) {
          const data = await res.json();
          setState(data);
        }
      } catch (err) {
        console.error('Polling failed', err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [jobId, state?.status]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800 bg-zinc-950/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-light tracking-tight">
            图流 AI <span className="text-zinc-500">/ 智能电商摄影</span>
          </h1>
          <p className="text-zinc-400 text-sm mt-2">
            基于腾讯云 COS 状态流转的无服务器架构
          </p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12">
        <Card className="bg-zinc-900 border-zinc-800 p-8 space-y-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-zinc-100">上传产品原图</h2>
            
            {uploadedImage ? (
              <div className="relative">
                <img
                  src={uploadedImage}
                  alt="Uploaded product"
                  className="w-full h-64 object-contain rounded-lg border border-zinc-700 bg-zinc-800"
                />
                {!loading && (
                  <button
                    onClick={() => { setUploadedImage(null); setJobId(null); setState(null); }}
                    className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 p-1 rounded-full"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                )}
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-zinc-700 rounded-lg p-12 text-center cursor-pointer hover:border-zinc-600 transition-colors"
              >
                <Upload className="w-12 h-12 text-zinc-500 mx-auto mb-4" />
                <p className="text-zinc-400">点击或拖拽上传产品照片</p>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          <Button 
            className="w-full bg-zinc-100 text-zinc-950 hover:bg-zinc-200 font-bold h-12" 
            onClick={handleStart}
            disabled={loading || !uploadedImage}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                正在处理流水线...
              </>
            ) : '开始生成电商大片'}
          </Button>

          {state && (
            <div className="mt-8 p-6 bg-zinc-800/50 rounded-xl border border-zinc-700 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {state.status === 'completed' ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : state.status === 'failed' ? (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  ) : (
                    <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                  )}
                  <span className="font-medium capitalize">{state.status}</span>
                </div>
                <span className="text-zinc-400 text-sm">{state.progress}%</span>
              </div>

              <div className="w-full bg-zinc-700 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${state.progress}%` }}
                ></div>
              </div>

                            {state.logs && state.logs.length > 0 && (
                <div className="text-xs text-zinc-400 mt-4 pt-4 border-t border-zinc-700 space-y-1">
                  <p className="font-medium text-zinc-300 mb-2">任务日志:</p>
                  {state.logs.map((log, index) => (
                    <p key={index} className="font-mono">{log}</p>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-xs text-zinc-500">
                <div className={state.progress >= 20 ? "text-blue-400" : ""}>● 视觉分析</div>
                <div className={state.progress >= 50 ? "text-blue-400" : ""}>● 智能抠图</div>
                <div className={state.progress >= 80 ? "text-blue-400" : ""}>● 场景重绘</div>
                <div className={state.progress >= 100 ? "text-blue-400" : ""}>● 任务完成</div>
              </div>

              {state.resultUrl && (
                <div className="pt-4 border-t border-zinc-700">
                  <p className="text-sm font-medium mb-3 text-zinc-300">生成结果：</p>
                  <img src={state.resultUrl} alt="Result" className="w-full rounded-lg shadow-2xl border border-zinc-600" />
                  <Button className="w-full mt-4 variant-outline" onClick={() => window.open(state.resultUrl)}>
                    下载高清图
                  </Button>
                </div>
              )}

              {state.error && (
                <div className="p-3 bg-red-900/20 border border-red-900/50 rounded text-red-400 text-sm">
                  错误: {state.error}
                </div>
              )}
            </div>
          )}
        </Card>
      </main>
    </div>
  );
}
