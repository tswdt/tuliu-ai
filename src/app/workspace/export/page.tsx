"use client";

import { useState } from "react";
import {
  Download,
  FileImage,
  FileText,
  Code2,
  Archive,
  CheckCircle2,
  ArrowLeft,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const exportOptions = [
  {
    id: "images",
    title: "图片包",
    desc: "所有生成的商品图片，按类型命名",
    icon: FileImage,
    format: "ZIP (PNG)",
    size: "~15MB",
  },
  {
    id: "html",
    title: "详情页 HTML",
    desc: "可直接上传到电商平台的详情页代码",
    icon: Code2,
    format: "HTML",
    size: "~200KB",
  },
  {
    id: "copy",
    title: "文案包",
    desc: "标题、卖点、描述等所有文案内容",
    icon: FileText,
    format: "TXT / CSV",
    size: "~5KB",
  },
  {
    id: "all",
    title: "完整包",
    desc: "图片 + HTML + 文案，一次性下载",
    icon: Archive,
    format: "ZIP",
    size: "~16MB",
  },
];

export default function ExportPage() {
  const [selected, setSelected] = useState<string[]>(["images"]);
  const [exporting, setExporting] = useState(false);
  const [exported, setExported] = useState(false);

  const toggleSelect = (id: string) => {
    if (id === "all") {
      setSelected(selected.includes("all") ? [] : ["all"]);
      return;
    }
    const filtered = selected.filter((s) => s !== "all");
    if (filtered.includes(id)) {
      setSelected(filtered.filter((s) => s !== id));
    } else {
      setSelected([...filtered, id]);
    }
  };

  const handleExport = () => {
    setExporting(true);
    setTimeout(() => {
      setExporting(false);
      setExported(true);
    }, 2000);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <Button variant="ghost" size="sm" onClick={() => window.history.back()} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          返回
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">导出</h1>
        <p className="text-sm text-gray-500 mt-1">选择需要导出的内容格式</p>
      </div>

      <div className="space-y-3 mb-8">
        {exportOptions.map((opt) => {
          const Icon = opt.icon;
          const isSelected = selected.includes(opt.id) || (selected.includes("all") && opt.id !== "all");
          return (
            <Card
              key={opt.id}
              className={`cursor-pointer transition-all ${
                isSelected ? "border-2 border-violet-500 shadow-md shadow-violet-100" : "border shadow-sm hover:shadow-md"
              }`}
              onClick={() => toggleSelect(opt.id)}
            >
              <CardContent className="py-4">
                <div className="flex items-center gap-4">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                    isSelected ? "bg-violet-100 text-violet-600" : "bg-gray-100 text-gray-400"
                  }`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{opt.title}</span>
                      <span className="text-xs text-gray-400">{opt.format}</span>
                      <span className="text-xs text-gray-300">{opt.size}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{opt.desc}</p>
                  </div>
                  <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                    isSelected ? "border-violet-600 bg-violet-600" : "border-gray-300"
                  }`}>
                    {isSelected && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {exported ? (
        <Card className="border-0 shadow-sm bg-green-50">
          <CardContent className="py-6 text-center">
            <CheckCircle2 className="h-10 w-10 text-green-600 mx-auto mb-3" />
            <h3 className="font-semibold text-green-900 mb-1">导出成功</h3>
            <p className="text-sm text-green-600 mb-4">文件已开始下载</p>
            <Button variant="outline" size="sm" onClick={() => setExported(false)}>
              继续导出
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Button
          onClick={handleExport}
          disabled={selected.length === 0 || exporting}
          className="w-full h-12 bg-gradient-to-r from-violet-600 to-indigo-600 text-white"
        >
          {exporting ? (
            <>
              <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              正在打包...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              导出选中内容
            </>
          )}
        </Button>
      )}
    </div>
  );
}
