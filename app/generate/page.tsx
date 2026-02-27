'use client';

import { useState, useEffect, useRef } from 'react';
import { JobState } from '@/lib/services/job';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, Upload, X, CheckCircle2, AlertCircle, Edit3 } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

type Style = 'white' | 'scene' | 'model';
type Ratio = '1:1' | '4:3' | '3:4' | '16:9';

const STYLES: { value: Style; label: string; desc: string }[] = [
  { value: 'white', label: '白底图', desc: '纯白背景，突出产品' },
  { value: 'scene', label: '场景图', desc: '生活化场景，更有代入感' },
  { value: 'model', label: '模特图', desc: '时尚大片，提升品牌调性' },
];

const RATIOS: { value: Ratio; label: string }[] = [
  { value: '1:1', label: '1:1 正方形' },
  { value: '4:3', label: '4:3' },
  { value: '3:4', label: '3:4 竖版' },
  { value: '16:9', label: '16:9 宽屏' },
];

export default function GeneratePage() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [cosImageUrl, setCosImageUrl] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [state, setState] = useState<JobState | null>(null);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [style, setStyle] = useState<Style>('white');
  const [ratio, setRatio] = useState<Ratio>('1:1');
  const [customPrompt, setCustomPrompt] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.userId) {
          setUserId(data.userId);
          setBalance(data.balance);
        }
      })
      .catch((err) => console.error('Auth check failed:', err));
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error('图片大小不能超过 10MB');
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setUploadedImage(previewUrl);
    setCosImageUrl(null);

    try {
      const presignRes = await fetch('/api/cos/presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name, contentType: file.type }),
      });
      if (!presignRes.ok) throw new Error('Failed to get upload URL');
      const { uploadUrl, publicUrl } = await presignRes.json();

      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });
      if (!uploadRes.ok) throw new Error('Failed to upload to COS');

      setCosImageUrl(publicUrl);
      toast.success('图片上传成功！');
    } catch {
      toast.error('图片上传失败，请重试');
      setUploadedImage(null);
      setCosImageUrl(null);
    }
  };

  const handleStart = async () => {
    if (!cosImageUrl) return;
    setLoading(true);
    const id = `job_${Date.now()}`;
    setJobId(id);
    setState(null);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: id,
          inputImage: cosImageUrl,
          userId: userId ?? 'anonymous',
          style,
          ratio,
          customPrompt: customPrompt.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || '启动失败');
      }
    } catch (err: any) {
      toast.error(err.message || '启动任务失败');
      setLoading(false);
    }
  };

  // Polling logic
  useEffect(() => {
    if (!jobId || state?.status === 'completed' || state?.status === 'failed') {
      if (state?.status === 'completed' || state?.status === 'failed') {
        setLoading(false);
        // Refresh balance
        fetch('/api/auth/me')
          .then((r) => (r.ok ? r.json() : null))
          .then((d) => { if (d?.balance !== undefined) setBalance(d.balance); })
          .catch(() => {});
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
    <div className="bg-zinc-950 text-zinc-100 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 py-12">
        {balance !== null && (
          <p className="text-right text-sm text-zinc-400 mb-4">
            当前余额: <span className="text-blue-400 font-medium">{balance}</span> 积分
          </p>
        )}

        <Card className="bg-zinc-900 border-zinc-800 p-8 space-y-6">
          <h2 className="text-xl font-semibold text-zinc-100">上传产品原图</h2>

          {/* Upload zone */}
          {uploadedImage ? (
            <div className="relative">
              <img
                src={uploadedImage}
                alt="Uploaded product"
                className="w-full h-64 object-contain rounded-lg border border-zinc-700 bg-zinc-800"
              />
              {!loading && (
                <button
                  onClick={() => {
                    setUploadedImage(null);
                    setCosImageUrl(null);
                    setJobId(null);
                    setState(null);
                  }}
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
              <p className="text-zinc-600 text-xs mt-1">支持 JPG/PNG，最大 10MB</p>
            </div>
          )}
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />

          {/* Style selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">选择风格</label>
            <div className="grid grid-cols-3 gap-3">
              {STYLES.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setStyle(s.value)}
                  className={`p-3 rounded-lg border text-left transition-colors ${
                    style === s.value
                      ? 'border-blue-500 bg-blue-950/30 text-zinc-100'
                      : 'border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:border-zinc-600'
                  }`}
                >
                  <p className="font-medium text-sm">{s.label}</p>
                  <p className="text-xs opacity-70 mt-0.5">{s.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Ratio selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">输出比例</label>
            <div className="flex flex-wrap gap-2">
              {RATIOS.map((r) => (
                <button
                  key={r.value}
                  onClick={() => setRatio(r.value)}
                  className={`px-4 py-1.5 rounded-full border text-sm transition-colors ${
                    ratio === r.value
                      ? 'border-blue-500 bg-blue-950/30 text-zinc-100'
                      : 'border-zinc-700 text-zinc-400 hover:border-zinc-600'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom prompt */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">自定义提示词（可选）</label>
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="例如：金属质感、蓝色背景、极简风格..."
              maxLength={200}
              rows={2}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 resize-none"
            />
          </div>

          <Button
            className="w-full bg-zinc-100 text-zinc-950 hover:bg-zinc-200 font-bold h-12"
            onClick={handleStart}
            disabled={loading || !cosImageUrl}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                正在处理流水线...
              </>
            ) : (
              '开始生成电商大片'
            )}
          </Button>

          {/* Job state display */}
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
                />
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
                <div className={state.progress >= 20 ? 'text-blue-400' : ''}>● 视觉分析</div>
                <div className={state.progress >= 50 ? 'text-blue-400' : ''}>● 智能抠图</div>
                <div className={state.progress >= 80 ? 'text-blue-400' : ''}>● 场景重绘</div>
                <div className={state.progress >= 100 ? 'text-blue-400' : ''}>● 任务完成</div>
              </div>

              {state.resultUrl && (
                <div className="pt-4 border-t border-zinc-700 space-y-3">
                  <p className="text-sm font-medium text-zinc-300">生成结果：</p>
                  <img
                    src={state.resultUrl}
                    alt="Result"
                    className="w-full rounded-lg shadow-2xl border border-zinc-600"
                  />
                  <div className="flex gap-3">
                    <Button
                      className="flex-1"
                      variant="outline"
                      onClick={() => window.open(state.resultUrl)}
                    >
                      下载高清图
                    </Button>
                    {jobId && (
                      <Link href={`/editor?jobId=${jobId}`} className="flex-1">
                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                          <Edit3 className="w-4 h-4 mr-2" />
                          编辑结果
                        </Button>
                      </Link>
                    )}
                  </div>
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
      </div>
    </div>
  );
}
