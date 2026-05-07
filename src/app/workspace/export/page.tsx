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
        <Button variant="ghost" size="sm" onClick={() => window.history.back()} className="mb-4 text-[#666] hover:text-[#1d1d1f] cursor-pointer">
          <ArrowLeft className="h-4 w-4 mr-2" />
          返回
        </Button>
        <h1 className="text-[24px] font-bold text-[#1d1d1f]">导出</h1>
        <p className="text-[14px] text-[#86868b] mt-1">选择需要导出的内容格式</p>
      </div>

      <div className="space-y-3 mb-8">
        {exportOptions.map((opt) => {
          const Icon = opt.icon;
          const isSelected = selected.includes(opt.id) || (selected.includes("all") && opt.id !== "all");
          return (
            <Card
              key={opt.id}
              className={`cursor-pointer transition-all rounded-2xl ${
                isSelected ? "border-2 border-[#1d1d1f] shadow-md" : "border border-[#e5e5e5] shadow-sm hover:shadow-md"
              }`}
              onClick={() => toggleSelect(opt.id)}
            >
              <CardContent className="py-4">
                <div className="flex items-center gap-4">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                    isSelected ? "bg-[#f5f5f7] text-[#1d1d1f]" : "bg-[#f5f5f7] text-[#999]"
                  }`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[14px] font-medium text-[#1d1d1f]">{opt.title}</span>
                      <span className="text-[12px] text-[#86868b]">{opt.format}</span>
                      <span className="text-[12px] text-[#ccc]">{opt.size}</span>
                    </div>
                    <p className="text-[12px] text-[#86868b] mt-0.5">{opt.desc}</p>
                  </div>
                  <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                    isSelected ? "border-[#1d1d1f] bg-[#1d1d1f]" : "border-[#ccc]"
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
        <Card className="border border-[#e5e5e5] rounded-2xl bg-[#f0fdf4]">
          <CardContent className="py-6 text-center">
            <CheckCircle2 className="h-10 w-10 text-[#1d1d1f] mx-auto mb-3" />
            <h3 className="text-[16px] font-semibold text-[#1d1d1f] mb-1">导出成功</h3>
            <p className="text-[14px] text-[#86868b] mb-4">文件已开始下载</p>
            <Button variant="outline" size="sm" onClick={() => setExported(false)} className="rounded-xl border-[#e5e5e5] text-[#666] hover:text-[#1d1d1f] cursor-pointer">
              继续导出
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Button
          onClick={handleExport}
          disabled={selected.length === 0 || exporting}
          className="w-full h-12 bg-[#1d1d1f] text-white hover:bg-[#333] rounded-xl cursor-pointer"
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
