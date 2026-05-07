"use client";

import { useState } from "react";
import {
  Search,
  Upload,
  Image,
  Download,
  Trash2,
  FolderOpen,
  Grid3X3,
  List,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const assets = [
  { id: "1", name: "T恤白底图.jpg", type: "image", size: "2.3MB", date: "2026-05-04", color: "from-blue-300 to-cyan-300" },
  { id: "2", name: "精华液主图.png", type: "image", size: "1.8MB", date: "2026-05-03", color: "from-pink-300 to-rose-300" },
  { id: "3", name: "耳机场景图.jpg", type: "image", size: "3.1MB", date: "2026-05-02", color: "from-slate-300 to-gray-400" },
  { id: "4", name: "坚果礼盒主图.png", type: "image", size: "2.0MB", date: "2026-05-01", color: "from-amber-300 to-orange-300" },
  { id: "5", name: "落地灯细节图.jpg", type: "image", size: "1.5MB", date: "2026-04-30", color: "from-emerald-300 to-green-300" },
  { id: "6", name: "瑜伽垫场景图.jpg", type: "image", size: "2.7MB", date: "2026-04-29", color: "from-orange-300 to-red-300" },
  { id: "7", name: "保温杯卖点图.png", type: "image", size: "1.9MB", date: "2026-04-28", color: "from-cyan-300 to-blue-300" },
  { id: "8", name: "T恤场景图.jpg", type: "image", size: "2.5MB", date: "2026-04-27", color: "from-gray-300 to-slate-400" },
];

export default function AssetsPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>([]);

  const filtered = assets.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[24px] font-bold text-[#1d1d1f]">素材库</h1>
        <Button className="bg-[#1d1d1f] text-white hover:bg-[#333] rounded-xl cursor-pointer">
          <Upload className="h-4 w-4 mr-2" />
          上传素材
        </Button>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#999]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索素材..."
            className="w-full pl-10 pr-4 py-2.5 border border-[#e5e5e5] rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-[#1d1d1f] focus:border-transparent"
          />
        </div>
        <div className="flex items-center border border-[#e5e5e5] rounded-xl overflow-hidden">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2.5 cursor-pointer ${viewMode === "grid" ? "bg-[#f5f5f7] text-[#1d1d1f]" : "text-[#999]"}`}
          >
            <Grid3X3 className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2.5 cursor-pointer ${viewMode === "list" ? "bg-[#f5f5f7] text-[#1d1d1f]" : "text-[#999]"}`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
        {selected.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-[14px] text-[#86868b]">已选 {selected.length} 项</span>
            <Button variant="outline" size="sm" className="rounded-xl border-[#e5e5e5] text-[#666] hover:text-[#1d1d1f]">
              <Download className="h-3.5 w-3.5 mr-1" />
              下载
            </Button>
            <Button variant="outline" size="sm" className="rounded-xl border-[#e5e5e5] text-red-500 hover:text-red-600">
              <Trash2 className="h-3.5 w-3.5 mr-1" />
              删除
            </Button>
          </div>
        )}
      </div>

      {viewMode === "grid" ? (
        <div className="grid grid-cols-4 gap-4">
          {filtered.map((asset) => (
            <Card
              key={asset.id}
              className={`border rounded-2xl shadow-sm overflow-hidden cursor-pointer transition-all ${
                selected.includes(asset.id) ? "ring-2 ring-[#1d1d1f] border-[#1d1d1f]" : "border-[#e5e5e5] hover:shadow-md"
              }`}
              onClick={() => toggleSelect(asset.id)}
            >
              <div className={`aspect-square bg-gradient-to-br ${asset.color} flex items-center justify-center`}>
                <Image className="h-8 w-8 text-white/60" />
              </div>
              <CardContent className="py-2 px-3">
                <div className="text-[12px] font-medium text-[#1d1d1f] truncate">{asset.name}</div>
                <div className="text-[12px] text-[#86868b]">{asset.size}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((asset) => (
            <Card
              key={asset.id}
              className={`border rounded-2xl shadow-sm cursor-pointer transition-all ${
                selected.includes(asset.id) ? "ring-2 ring-[#1d1d1f] border-[#1d1d1f]" : "border-[#e5e5e5] hover:shadow-md"
              }`}
              onClick={() => toggleSelect(asset.id)}
            >
              <CardContent className="py-3">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${asset.color} flex items-center justify-center flex-shrink-0`}>
                    <Image className="h-4 w-4 text-white/60" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-medium text-[#1d1d1f] truncate">{asset.name}</div>
                    <div className="text-[12px] text-[#86868b]">{asset.size} · {asset.date}</div>
                  </div>
                  <Button variant="ghost" size="sm" className="hover:bg-[#f5f5f7] cursor-pointer">
                    <Download className="h-4 w-4 text-[#86868b]" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <FolderOpen className="h-12 w-12 text-[#ccc] mx-auto mb-4" />
          <p className="text-[14px] text-[#86868b]">暂无素材</p>
        </div>
      )}
    </div>
  );
}
