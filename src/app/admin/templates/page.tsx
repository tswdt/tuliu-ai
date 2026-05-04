"use client";

import { useState } from "react";
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  Eye,
  LayoutTemplate,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const templates = [
  { id: "1", name: "淘宝服饰主图模板", category: "服饰", platform: "淘宝", type: "主图", status: "active", usage: 1240 },
  { id: "2", name: "京东3C场景图模板", category: "3C数码", platform: "京东", type: "场景图", status: "active", usage: 890 },
  { id: "3", name: "小红书美妆种草图模板", category: "美妆", platform: "小红书", type: "主图", status: "active", usage: 2100 },
  { id: "4", name: "拼多多食品主图模板", category: "食品", platform: "拼多多", type: "主图", status: "active", usage: 650 },
  { id: "5", name: "Amazon通用白底图模板", category: "通用", platform: "Amazon", type: "主图", status: "active", usage: 430 },
  { id: "6", name: "抖音家居场景图模板", category: "家居", platform: "抖音", type: "场景图", status: "draft", usage: 0 },
];

export default function AdminTemplatesPage() {
  const [search, setSearch] = useState("");
  const filtered = templates.filter(
    (t) => t.name.includes(search) || t.category.includes(search) || t.platform.includes(search)
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">模板管理</h1>
        <Button className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
          <Plus className="h-4 w-4 mr-2" />
          新建模板
        </Button>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索模板..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">模板名称</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">品类</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">平台</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">类型</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">状态</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">使用次数</th>
                <th className="text-right text-xs font-medium text-gray-500 px-4 py-3">操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <LayoutTemplate className="h-4 w-4 text-violet-500" />
                      <span className="text-sm font-medium text-gray-900">{t.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{t.category}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{t.platform}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{t.type}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      t.status === "active" ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500"
                    }`}>
                      {t.status === "active" ? "启用" : "草稿"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{t.usage.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm"><Edit3 className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm"><Copy className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm" className="text-red-400"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
