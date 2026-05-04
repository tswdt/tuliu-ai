"use client";

import { useState } from "react";
import {
  Search,
  RefreshCw,
  ListTodo,
  Eye,
  Trash2,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const tasks = [
  { id: "T001", user: "张三", product: "纯棉休闲T恤", platform: "淘宝", status: "completed", images: 16, time: "2026-05-04 14:30", duration: "45s" },
  { id: "T002", user: "李四", product: "玻尿酸精华液", platform: "小红书", status: "completed", images: 12, time: "2026-05-03 10:15", duration: "52s" },
  { id: "T003", user: "王五", product: "无线蓝牙耳机", platform: "京东", status: "failed", images: 0, time: "2026-05-02 16:45", duration: "-" },
  { id: "T004", user: "赵六", product: "有机坚果礼盒", platform: "拼多多", status: "completed", images: 14, time: "2026-05-01 11:20", duration: "38s" },
  { id: "T005", user: "钱七", product: "北欧风落地灯", platform: "天猫", status: "processing", images: 8, time: "2026-05-04 15:00", duration: "进行中" },
  { id: "T006", user: "孙八", product: "Yoga Mat Pro", platform: "Amazon", status: "completed", images: 16, time: "2026-04-29 09:30", duration: "61s" },
];

const statusMap: Record<string, { label: string; className: string }> = {
  completed: { label: "已完成", className: "bg-green-50 text-green-600" },
  failed: { label: "失败", className: "bg-red-50 text-red-600" },
  processing: { label: "进行中", className: "bg-amber-50 text-amber-600" },
};

export default function AdminTasksPage() {
  const [search, setSearch] = useState("");
  const filtered = tasks.filter(
    (t) => t.user.includes(search) || t.product.includes(search) || t.id.includes(search)
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">任务管理</h1>
        <Button variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          刷新
        </Button>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索任务ID、用户或产品..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">任务ID</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">用户</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">产品</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">平台</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">状态</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">图片数</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">耗时</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">时间</th>
                <th className="text-right text-xs font-medium text-gray-500 px-4 py-3">操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-mono text-gray-700">{t.id}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{t.user}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{t.product}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{t.platform}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusMap[t.status]?.className}`}>
                      {statusMap[t.status]?.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{t.images}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{t.duration}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{t.time}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button>
                      {t.status === "failed" && (
                        <Button variant="ghost" size="sm"><RotateCcw className="h-4 w-4" /></Button>
                      )}
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
