"use client";

import Link from "next/link";
import {
  Plus,
  ArrowRight,
  Clock,
  Image,
  PlayCircle,
  Sparkles,
  Layers,
  ShoppingBag,
  Wine,
  Shirt,
  Home as HomeIcon,
  Cpu,
  Flower2,
  Package,
  CheckCircle2,
  Loader2,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const recentProjects = [
  {
    id: "1",
    name: "纯棉休闲T恤",
    platform: "淘宝",
    status: "已完成",
    images: 16,
    time: "2 小时前",
    category: "服装",
    icon: Shirt,
    color: "bg-blue-500",
  },
  {
    id: "2",
    name: "玻尿酸精华液",
    platform: "抖音",
    status: "生成中",
    images: 8,
    time: "3 小时前",
    category: "美妆",
    icon: Flower2,
    color: "bg-pink-500",
  },
  {
    id: "3",
    name: "无线蓝牙耳机",
    platform: "京东",
    status: "已完成",
    images: 16,
    time: "昨天",
    category: "3C",
    icon: Cpu,
    color: "bg-violet-500",
  },
  {
    id: "4",
    name: "有机绿茶礼盒",
    platform: "拼多多",
    status: "已完成",
    images: 12,
    time: "2 天前",
    category: "食品",
    icon: Wine,
    color: "bg-emerald-500",
  },
];

const recentImages = [
  { id: "1", label: "主图", color: "from-violet-400 to-indigo-400", project: "纯棉T恤" },
  { id: "2", label: "场景图", color: "from-blue-400 to-cyan-400", project: "蓝牙耳机" },
  { id: "3", label: "细节图", color: "from-pink-400 to-rose-400", project: "精华液" },
  { id: "4", label: "卖点图", color: "from-amber-400 to-orange-400", project: "绿茶礼盒" },
  { id: "5", label: "白底图", color: "from-emerald-400 to-teal-400", project: "蓝牙耳机" },
  { id: "6", label: "参数图", color: "from-gray-400 to-slate-400", project: "纯棉T恤" },
];

const templates = [
  {
    id: "1",
    name: "食品详情页",
    category: "食品",
    platform: "淘宝",
    useCount: "2.3k",
    icon: Wine,
    color: "bg-orange-50 text-orange-600",
  },
  {
    id: "2",
    name: "美妆主图套",
    category: "美妆",
    platform: "抖音",
    useCount: "1.8k",
    icon: Flower2,
    color: "bg-pink-50 text-pink-600",
  },
  {
    id: "3",
    name: "3C场景图",
    category: "3C数码",
    platform: "京东",
    useCount: "1.5k",
    icon: Cpu,
    color: "bg-violet-50 text-violet-600",
  },
  {
    id: "4",
    name: "服装主图+详情",
    category: "服装",
    platform: "拼多多",
    useCount: "3.1k",
    icon: Shirt,
    color: "bg-blue-50 text-blue-600",
  },
];

const tutorials = [
  { title: "如何上传产品图获得最佳效果", duration: "2 分钟" },
  { title: "选择适合的电商平台模板", duration: "3 分钟" },
  { title: "编辑和调整生成结果", duration: "4 分钟" },
];

export default function WorkspacePage() {
  return (
    <div className="p-6 space-y-6 max-w-[1200px]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">工作台</h1>
          <p className="text-sm text-gray-500 mt-0.5">欢迎回来，开始创建商品视觉素材</p>
        </div>
        <Link href="/workspace/new">
          <Button className="bg-gray-900 hover:bg-gray-800 text-white h-9 text-sm">
            <Plus className="h-4 w-4 mr-1.5" />
            新建详情页项目
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-gray-900">最近项目</h2>
                <Link href="/workspace/history" className="text-xs text-violet-600 hover:text-violet-700 flex items-center gap-0.5">
                  查看全部 <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="space-y-2">
                {recentProjects.map((p) => {
                  const Icon = p.icon;
                  return (
                    <Link key={p.id} href={`/workspace/result/${p.id}`}>
                      <div className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group">
                        <div className="flex items-center gap-3">
                          <div className={`h-9 w-9 rounded-lg ${p.color} flex items-center justify-center flex-shrink-0`}>
                            <Icon className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900 group-hover:text-violet-600 transition-colors">{p.name}</div>
                            <div className="text-xs text-gray-400 mt-0.5">{p.platform} · {p.images} 张图 · {p.time}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {p.status === "已完成" ? (
                            <span className="flex items-center gap-1 text-xs text-green-600">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              已完成
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-xs text-amber-600">
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              生成中
                            </span>
                          )}
                          <ArrowRight className="h-3.5 w-3.5 text-gray-300 group-hover:text-violet-400 transition-colors" />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-gray-900">最近生成图片</h2>
                <Link href="/workspace/generation-history" className="text-xs text-violet-600 hover:text-violet-700 flex items-center gap-0.5">
                  查看全部 <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {recentImages.map((img) => (
                  <div key={img.id} className="group cursor-pointer">
                    <div className={`aspect-square rounded-lg bg-gradient-to-br ${img.color} flex items-center justify-center mb-1.5 relative overflow-hidden`}>
                      <span className="text-white text-xs font-medium">{img.label}</span>
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <MoreHorizontal className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                    <p className="text-[11px] text-gray-400 truncate text-center">{img.project}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-0 shadow-sm bg-gradient-to-br from-gray-900 to-gray-800">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-4 w-4 text-violet-400" />
                <span className="text-sm font-medium text-white">快速开始</span>
              </div>
              <p className="text-xs text-gray-400 mb-4">上传一张产品图，AI 自动生成整套电商视觉素材</p>
              <Link href="/workspace/new">
                <Button className="w-full bg-violet-600 hover:bg-violet-700 text-white h-9 text-sm">
                  <Plus className="h-4 w-4 mr-1.5" />
                  新建详情页项目
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-gray-900">推荐模板</h2>
                <Link href="/workspace/templates" className="text-xs text-violet-600 hover:text-violet-700 flex items-center gap-0.5">
                  更多 <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="space-y-2">
                {templates.map((t) => {
                  const Icon = t.icon;
                  return (
                    <div key={t.id} className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group">
                      <div className={`h-8 w-8 rounded-lg ${t.color} flex items-center justify-center flex-shrink-0`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 group-hover:text-violet-600 transition-colors truncate">{t.name}</div>
                        <div className="text-[11px] text-gray-400">{t.platform} · {t.useCount} 次使用</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-gray-900">使用教程</h2>
              </div>
              <div className="space-y-2">
                {tutorials.map((t, i) => (
                  <div key={i} className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group">
                    <div className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 group-hover:bg-violet-50 transition-colors">
                      <PlayCircle className="h-4 w-4 text-gray-400 group-hover:text-violet-500 transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-gray-700 group-hover:text-violet-600 transition-colors truncate">{t.title}</div>
                      <div className="text-[11px] text-gray-400">{t.duration}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
