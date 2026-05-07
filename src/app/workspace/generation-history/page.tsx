"use client";

import { useState } from "react";
import {
  Search,
  Filter,
  Download,
  Trash2,
  Eye,
  MoreHorizontal,
  Image,
  Clock,
  CheckCircle2,
  XCircle,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const generationHistory = [
  { id: "1", type: "主图", project: "纯棉休闲T恤", platform: "淘宝", status: "success", time: "2026-05-04 14:30", color: "from-slate-300 to-gray-400" },
  { id: "2", type: "场景图", project: "纯棉休闲T恤", platform: "淘宝", status: "success", time: "2026-05-04 14:31", color: "from-blue-300 to-cyan-300" },
  { id: "3", type: "细节图", project: "玻尿酸精华液", platform: "抖音", status: "success", time: "2026-05-04 13:20", color: "from-pink-300 to-rose-300" },
  { id: "4", type: "卖点图", project: "无线蓝牙耳机", platform: "京东", status: "success", time: "2026-05-04 11:05", color: "from-amber-300 to-orange-300" },
  { id: "5", type: "白底图", project: "有机绿茶礼盒", platform: "拼多多", status: "failed", time: "2026-05-04 10:30", color: "from-emerald-300 to-teal-300" },
  { id: "6", type: "参数图", project: "纯棉休闲T恤", platform: "淘宝", status: "success", time: "2026-05-04 14:32", color: "from-gray-300 to-slate-300" },
  { id: "7", type: "主图", project: "无线蓝牙耳机", platform: "京东", status: "success", time: "2026-05-03 16:45", color: "from-slate-300 to-gray-400" },
  { id: "8", type: "详情页", project: "有机绿茶礼盒", platform: "拼多多", status: "success", time: "2026-05-03 15:20", color: "from-emerald-300 to-green-300" },
  { id: "9", type: "场景图", project: "玻尿酸精华液", platform: "抖音", status: "success", time: "2026-05-03 14:10", color: "from-pink-300 to-fuchsia-300" },
  { id: "10", type: "主图", project: "玻尿酸精华液", platform: "抖音", status: "success", time: "2026-05-03 14:08", color: "from-rose-300 to-pink-300" },
  { id: "11", type: "细节图", project: "纯棉休闲T恤", platform: "淘宝", status: "failed", time: "2026-05-03 09:15", color: "from-blue-300 to-slate-300" },
  { id: "12", type: "卖点图", project: "有机绿茶礼盒", platform: "拼多多", status: "success", time: "2026-05-02 17:30", color: "from-amber-300 to-yellow-300" },
];

const statusFilters = [
  { label: "全部", value: "all" },
  { label: "成功", value: "success" },
  { label: "失败", value: "failed" },
];

export default function GenerationHistoryPage() {
  const [activeStatus, setActiveStatus] = useState("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const filtered = generationHistory.filter((h) => {
    if (activeStatus !== "all" && h.status !== activeStatus) return false;
    return true;
  });

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#1d1d1f]">生成历史</h1>
          <p className="text-sm text-[#86868b] mt-0.5">查看和管理所有 AI 生成记录</p>
        </div>
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-[#86868b]">已选 {selectedIds.length} 项</span>
            <Button variant="outline" size="sm" className="h-8 text-xs">
              <Download className="h-3.5 w-3.5 mr-1" />
              批量下载
            </Button>
            <Button variant="outline" size="sm" className="h-8 text-xs text-red-600 hover:text-red-700">
              <Trash2 className="h-3.5 w-3.5 mr-1" />
              批量删除
            </Button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#999]" />
          <Input placeholder="搜索项目名称..." className="pl-9 h-9 text-sm" />
        </div>
        <div className="flex gap-1">
          {statusFilters.map((s) => (
            <button
              key={s.value}
              onClick={() => setActiveStatus(s.value)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                activeStatus === s.value
                  ? "bg-[#1d1d1f] text-white"
                  : "bg-[#f5f5f7] text-[#666] hover:bg-[#eee]"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {filtered.map((item) => (
          <div key={item.id} className="group relative">
            <div
              className={`aspect-square rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center cursor-pointer relative overflow-hidden ${
                selectedIds.includes(item.id) ? "ring-2 ring-[#1d1d1f] ring-offset-2" : ""
              }`}
              onClick={() => toggleSelect(item.id)}
            >
              <span className="text-white text-xs font-medium">{item.type}</span>
              {item.status === "failed" && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <XCircle className="h-6 w-6 text-red-300" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center gap-1">
                <button className="h-7 w-7 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white">
                  <Eye className="h-3.5 w-3.5 text-gray-700" />
                </button>
                <button className="h-7 w-7 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white">
                  <Download className="h-3.5 w-3.5 text-gray-700" />
                </button>
              </div>
              {selectedIds.includes(item.id) && (
                <div className="absolute top-2 left-2 h-5 w-5 rounded-full bg-[#1d1d1f] flex items-center justify-center">
                  <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                </div>
              )}
            </div>
            <div className="mt-1.5">
              <p className="text-xs font-medium text-[#1d1d1f] truncate">{item.project}</p>
              <p className="text-[11px] text-[#86868b]">{item.platform} · {item.time.split(" ")[1]}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
