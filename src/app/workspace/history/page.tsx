"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  Image,
  ArrowRight,
  MoreHorizontal,
  Calendar,
  Trash2,
  Copy,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const projects = [
  {
    id: "1",
    name: "纯棉休闲T恤",
    platform: "淘宝",
    status: "completed",
    images: 16,
    date: "2026-05-04",
    color: "from-blue-400 to-cyan-400",
  },
  {
    id: "2",
    name: "玻尿酸精华液",
    platform: "小红书",
    status: "completed",
    images: 12,
    date: "2026-05-03",
    color: "from-pink-400 to-rose-400",
  },
  {
    id: "3",
    name: "无线蓝牙耳机",
    platform: "京东",
    status: "completed",
    images: 16,
    date: "2026-05-02",
    color: "from-slate-400 to-gray-500",
  },
  {
    id: "4",
    name: "有机坚果礼盒",
    platform: "拼多多",
    status: "completed",
    images: 14,
    date: "2026-05-01",
    color: "from-amber-400 to-orange-400",
  },
  {
    id: "5",
    name: "北欧风落地灯",
    platform: "天猫",
    status: "failed",
    images: 0,
    date: "2026-04-30",
    color: "from-emerald-400 to-teal-400",
  },
  {
    id: "6",
    name: "Yoga Mat Pro",
    platform: "Amazon",
    status: "completed",
    images: 16,
    date: "2026-04-29",
    color: "from-orange-400 to-red-400",
  },
];

const statusMap: Record<string, { label: string; className: string }> = {
  completed: { label: "已完成", className: "bg-[#f0fdf4] text-[#1d1d1f] border border-[#e5e5e5]" },
  failed: { label: "失败", className: "bg-red-50 text-red-600 border border-red-200" },
  generating: { label: "生成中", className: "bg-amber-50 text-amber-600 border border-amber-200" },
};

export default function HistoryPage() {
  const [search, setSearch] = useState("");
  const [filterPlatform, setFilterPlatform] = useState("all");

  const filtered = projects.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchPlatform = filterPlatform === "all" || p.platform === filterPlatform;
    return matchSearch && matchPlatform;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[24px] font-bold text-[#1d1d1f]">项目历史</h1>
        <Link href="/workspace/create">
          <Button className="bg-[#1d1d1f] text-white hover:bg-[#333] rounded-xl cursor-pointer">
            新建项目
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#999]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索项目..."
            className="w-full pl-10 pr-4 py-2.5 border border-[#e5e5e5] rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-[#1d1d1f] focus:border-transparent"
          />
        </div>
        <select
          value={filterPlatform}
          onChange={(e) => setFilterPlatform(e.target.value)}
          className="px-3 py-2.5 border border-[#e5e5e5] rounded-xl text-[14px] text-[#1d1d1f] bg-white focus:outline-none focus:ring-2 focus:ring-[#1d1d1f]"
        >
          <option value="all">全部平台</option>
          <option value="淘宝">淘宝</option>
          <option value="天猫">天猫</option>
          <option value="京东">京东</option>
          <option value="拼多多">拼多多</option>
          <option value="小红书">小红书</option>
          <option value="Amazon">Amazon</option>
        </select>
      </div>

      <div className="space-y-3">
        {filtered.map((p) => (
          <Card key={p.id} className="border border-[#e5e5e5] rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`h-12 w-12 rounded-lg bg-gradient-to-br ${p.color} flex items-center justify-center`}>
                    <Image className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="text-[14px] font-medium text-[#1d1d1f]">{p.name}</div>
                    <div className="flex items-center gap-3 text-[12px] text-[#86868b] mt-1">
                      <span>{p.platform}</span>
                      <span>{p.images} 张图</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {p.date}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-1 rounded-full text-[12px] font-medium ${statusMap[p.status]?.className}`}>
                    {statusMap[p.status]?.label}
                  </span>
                  <div className="flex items-center gap-1">
                    <Link href={`/workspace/result?id=${p.id}`}>
                      <Button variant="ghost" size="sm" className="hover:bg-[#f5f5f7] cursor-pointer">
                        <Eye className="h-4 w-4 text-[#86868b]" />
                      </Button>
                    </Link>
                    <Button variant="ghost" size="sm" className="hover:bg-[#f5f5f7] cursor-pointer">
                      <Copy className="h-4 w-4 text-[#86868b]" />
                    </Button>
                    <Button variant="ghost" size="sm" className="hover:bg-[#f5f5f7] text-red-400 cursor-pointer">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <Image className="h-12 w-12 text-[#ccc] mx-auto mb-4" />
            <p className="text-[14px] text-[#86868b]">暂无项目</p>
          </div>
        )}
      </div>
    </div>
  );
}
