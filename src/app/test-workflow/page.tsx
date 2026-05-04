"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

export default function TestWorkflowPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const runFullWorkflow = async () => {
    setIsRunning(true);
    setError(null);
    setResults(null);

    try {
      const response = await fetch("/api/test-full-workflow");
      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "测试失败");
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">完整电商AI商品详情页生成流程测试</h1>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>流程测试</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">测试流程：</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>用户上传产品图</li>
                  <li>图片上传至阿里云OSS（持久化存储）</li>
                  <li>阿里云通用抠图API去除商品背景</li>
                  <li>阿里云商品识别API识别商品（品类/卖点/材质）</li>
                  <li>AI自动生成全品类专属提示词（适配平台特性）</li>
                  <li>调用OneThingAI的Nano Banana大模型</li>
                  <li>文生图：生成不同场景的详情图</li>
                  <li>图生图：保留商品主体替换电商背景</li>
                  <li>生成的图片上传至阿里云OSS</li>
                  <li>后端返回图片URL数组（4张详情图）</li>
                  <li>前端遍历渲染图片，展示给用户</li>
                </ol>
              </div>

              <Button 
                size="lg" 
                onClick={runFullWorkflow}
                disabled={isRunning}
                className="w-full"
              >
                {isRunning ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    运行完整流程测试中...
                  </>
                ) : (
                  "运行完整流程测试"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {error && (
          <Card className="mb-8 border-red-200">
            <CardHeader className="bg-red-50">
              <CardTitle className="text-red-700 flex items-center">
                <XCircle className="w-5 h-5 mr-2" />
                错误
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-red-600">{error}</p>
            </CardContent>
          </Card>
        )}

        {results && (
          <Card>
            <CardHeader className={results.success ? "bg-green-50" : "bg-yellow-50"}>
              <CardTitle className={`${results.success ? "text-green-700" : "text-yellow-700"} flex items-center`}>
                {results.success ? (
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                ) : (
                  <XCircle className="w-5 h-5 mr-2" />
                )}
                测试结果
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-6">
              <div>
                <h3 className="font-semibold mb-2">摘要：</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-500">文生图</p>
                    <p className="font-mono">{results.summary?.textToImage}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-500">图生图</p>
                    <p className="font-mono">{results.summary?.imageToImage}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-500">详情图</p>
                    <p className="font-mono">{results.summary?.detailImages}</p>
                  </div>
                </div>
              </div>

              {results.results?.detailImages?.images && (
                <div>
                  <h3 className="font-semibold mb-3">生成的详情图：</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {results.results.detailImages.images.map((url: string, index: number) => (
                      <div key={index} className="relative">
                        <img
                          src={url}
                          alt={`详情图 ${index + 1}`}
                          className="w-full aspect-square object-cover rounded-lg border"
                        />
                        <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                          图 {index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="font-semibold mb-2">详细结果：</h3>
                <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-auto max-h-96">
                  {JSON.stringify(results, null, 2)}
                </pre>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
