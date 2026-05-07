"use client";

import { useState } from "react";
import {
  Wine,
  Shirt,
  Cpu,
  Flower2,
  Package,
  Home as HomeIcon,
  ShoppingBag,
  Search,
  Filter,
  ArrowRight,
  Star,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const categories = [
  { label: "全部", value: "all" },
  { label: "食品", value: "food" },
  { label: "酒水", value: "drink" },
  { label: "服装", value: "clothing" },
  { label: "家居", value: "home" },
  { label: "3C", value: "3c" },
  { label: "美妆", value: "beauty" },
  { label: "日用品", value: "daily" },
];

const platforms = [
  { label: "全部平台", value: "all" },
  { label: "淘宝", value: "taobao" },
  { label: "京东", value: "jd" },
  { label: "拼多多", value: "pdd" },
  { label: "抖音", value: "douyin" },
  { label: "亚马逊", value: "amazon" },
];

const templateList = [
  { id: "1", name: "食品详情页模板", category: "food", platform: "淘宝", icon: Wine, color: "bg-orange-50 text-orange-600", useCount: "2.3k", rating: "4.8", desc: "适合零食、茶叶、保健品等食品类目" },
  { id: "2", name: "美妆主图套组", category: "beauty", platform: "抖音", icon: Flower2, color: "bg-pink-50 text-pink-600", useCount: "1.8k", rating: "4.9", desc: "适合护肤品、彩妆等美妆类目" },
  { id: "3", name: "3C场景图模板", category: "3c", platform: "京东", icon: Cpu, color: "bg-blue-50 text-blue-600", useCount: "1.5k", rating: "4.7", desc: "适合数码产品、电子配件等3C类目" },
  { id: "4", name: "服装主图+详情", category: "clothing", platform: "拼多多", icon: Shirt, color: "bg-sky-50 text-sky-600", useCount: "3.1k", rating: "4.6", desc: "适合男装、女装、童装等服装类目" },
  { id: "5", name: "家居场景图套组", category: "home", platform: "淘宝", icon: HomeIcon, color: "bg-emerald-50 text-emerald-600", useCount: "1.2k", rating: "4.5", desc: "适合家具、家纺、装饰等家居类目" },
  { id: "6", name: "日用品白底图模板", category: "daily", platform: "拼多多", icon: Package, color: "bg-amber-50 text-amber-600", useCount: "980", rating: "4.4", desc: "适合清洁、收纳等日用品类目" },
  { id: "7", name: "酒水礼盒详情页", category: "drink", platform: "京东", icon: Wine, color: "bg-red-50 text-red-600", useCount: "860", rating: "4.7", desc: "适合白酒、红酒、礼盒等酒水类目" },
  { id: "8", name: "食品主图5张套", category: "food", platform: "抖音", icon: ShoppingBag, color: "bg-orange-50 text-orange-600", useCount: "1.9k", rating: "4.8", desc: "适合抖音电商食品主图规范" },
];

export default function TemplatesPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [activePlatform, setActivePlatform] = useState("all");

  const filtered = templateList.filter((t) => {
    if (activeCategory !== "all" && t.category !== activeCategory) return false;
    if (activePlatform !== "all" && !t.platform.includes(activePlatform === "taobao" ? "淘宝" : activePlatform === "jd" ? "京东" : activePlatform === "pdd" ? "拼多多" : activePlatform === "douyin" ? "抖音" : "亚马逊")) return false;
    return true;
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[24px] font-bold text-[#1d1d1f]">模板中心</h1>
        <p className="text-[14px] text-[#86868b] mt-1">选择适合你品类的模板，快速开始生成</p>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#999]" />
          <Input placeholder="搜索模板..." className="pl-9 h-10 text-[14px] rounded-xl border-[#e5e5e5]" />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {categories.map((c) => (
          <button
            key={c.value}
            onClick={() => setActiveCategory(c.value)}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors cursor-pointer ${
              activeCategory === c.value
                ? "bg-[#1d1d1f] text-white"
                : "bg-[#f5f5f7] text-[#666] hover:bg-[#eee]"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {platforms.map((p) => (
          <button
            key={p.value}
            onClick={() => setActivePlatform(p.value)}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors cursor-pointer ${
              activePlatform === p.value
                ? "bg-[#1d1d1f] text-white"
                : "bg-[#f5f5f7] text-[#666] hover:bg-[#eee]"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((t) => {
          const Icon = t.icon;
          return (
            <Card key={t.id} className="border border-[#e5e5e5] rounded-2xl shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
              <CardContent className="p-4">
                <div className={`h-28 rounded-xl ${t.color.split(" ")[0]} flex items-center justify-center mb-3 relative overflow-hidden`}>
                  <Icon className={`h-10 w-10 ${t.color.split(" ")[1]} opacity-60`} />
                  <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-white/80 backdrop-blur-sm px-2 py-0.5 rounded-md text-[10px] font-medium text-[#666]">
                    <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                    {t.rating}
                  </div>
                </div>
                <h3 className="text-[14px] font-medium text-[#1d1d1f] group-hover:text-[#1d1d1f] transition-colors">{t.name}</h3>
                <p className="text-[12px] text-[#86868b] mt-1 line-clamp-2">{t.desc}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-[11px] text-[#86868b] flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {t.useCount} 次使用
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded-md bg-[#f5f5f7] text-[#666]">{t.platform}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
