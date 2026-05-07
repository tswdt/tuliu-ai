"use client";

import { useState } from "react";
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  Copy,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const prompts = [
  { id: "1", name: "淘宝服饰主图提示词", category: "服饰", platform: "淘宝", imageType: "主图", style: "简约", tokens: 156, status: "active" },
  { id: "2", name: "京东3C场景图提示词", category: "3C数码", platform: "京东", imageType: "场景图", style: "科技", tokens: 203, status: "active" },
  { id: "3", name: "小红书美妆种草提示词", category: "美妆", platform: "小红书", imageType: "主图", style: "轻奢", tokens: 178, status: "active" },
  { id: "4", name: "拼多多食品卖点提示词", category: "食品", platform: "拼多多", imageType: "卖点图", style: "自然", tokens: 142, status: "active" },
  { id: "5", name: "Amazon白底主图提示词", category: "通用", platform: "Amazon", imageType: "主图", style: "简约", tokens: 98, status: "active" },
  { id: "6", name: "抖音家居场景提示词", category: "家居", platform: "抖音", imageType: "场景图", style: "自然", tokens: 165, status: "draft" },
  { id: "7", name: "国潮风通用提示词", category: "通用", platform: "通用", imageType: "通用", style: "国潮", tokens: 189, status: "active" },
  { id: "8", name: "跨境英文提示词模板", category: "通用", platform: "Amazon", imageType: "通用", style: "简约", tokens: 210, status: "active" },
];

export default function AdminPromptsPage() {
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = prompts.filter(
    (p) => p.name.includes(search) || p.category.includes(search) || p.platform.includes(search)
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">提示词模板管理</h1>
        <Button className="bg-[#1d1d1f] hover:bg-[#333] text-white">
          <Plus className="h-4 w-4 mr-2" />
          新建提示词
        </Button>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索提示词模板..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((p) => (
          <Card key={p.id} className="border-0 shadow-sm">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-[#f5f5f7] flex items-center justify-center">
                    <FileText className="h-5 w-5 text-[#1d1d1f]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{p.name}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        p.status === "active" ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500"
                      }`}>
                        {p.status === "active" ? "启用" : "草稿"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                      <span>{p.category}</span>
                      <span>{p.platform}</span>
                      <span>{p.imageType}</span>
                      <span>{p.style}风格</span>
                      <span>{p.tokens} tokens</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}>
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm"><Copy className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="sm" className="text-red-400"><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
              {expandedId === p.id && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <label className="text-xs text-gray-400 mb-2 block">提示词内容</label>
                  <textarea
                    className="w-full h-32 px-3 py-2 border rounded-lg text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    defaultValue={`电商商品摄影，${p.category}类目，${p.style}风格，${p.imageType}，高质量，专业摄影，8K分辨率，柔和自然光，浅景深...`}
                  />
                  <div className="flex justify-end gap-2 mt-2">
                    <Button variant="outline" size="sm">取消</Button>
                    <Button size="sm" className="bg-[#1d1d1f] hover:bg-[#333] text-white">保存</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
