"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Sparkles, 
  FileText, 
  ArrowLeft,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function GenerateCopyPage() {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回
            </Button>
            <div>
              <h1 className="text-xl font-semibold">AI文案生成</h1>
              <p className="text-sm text-gray-500">智能生成商品营销文案</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-purple-500" />
              功能开发中
            </CardTitle>
            <CardDescription>
              AI文案生成功能正在紧张开发中，敬请期待
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              该功能即将上线
            </h3>
            <p className="text-gray-500 mb-6">
              目前请使用"商品主图"功能生成商品图片
            </p>
            <Button onClick={() => router.push("/dashboard/generate/image")}>
              去生成商品主图
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
