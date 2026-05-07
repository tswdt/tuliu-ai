"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  LayoutDashboard,
  Image as ImageIcon,
  History,
  Settings,
  CreditCard,
  Plus,
  Upload,
  Palette,
  Zap,
  Coins,
  ChevronRight,
  Activity,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("generate");

  const stats = [
    { label: "剩余额度", value: "8", icon: Coins, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
    { label: "已生成", value: "12", icon: ImageIcon, color: "text-[#1d1d1f]", bg: "bg-[#f5f5f7]", border: "border-[#e5e5e5]" },
    { label: "本月生成", value: "8", icon: TrendingUp, color: "text-cyan-600", bg: "bg-cyan-50", border: "border-cyan-200" },
  ];

  const recentGenerations = [
    { id: "1", name: "连衣裙主图", status: "completed", platform: "淘宝", date: "2026-05-04" },
    { id: "2", name: "运动鞋详情", status: "completed", platform: "抖音", date: "2026-05-03" },
    { id: "3", name: "化妆品套装", status: "processing", platform: "小红书", date: "2026-05-03" },
  ];

  const navItems = [
    { id: "generate", label: "AI 生成", icon: Sparkles },
    { id: "gallery", label: "素材库", icon: ImageIcon },
    { id: "history", label: "历史记录", icon: History },
    { id: "pricing", label: "套餐购买", icon: CreditCard },
    { id: "settings", label: "设置", icon: Settings },
  ];

  const quickActions = [
    { label: "商品主图", desc: "生成4K超清商品主图", icon: Upload, href: "/workspace/create", color: "text-[#1d1d1f]" },
    { label: "详情页全套", desc: "一键生成详情页全套图片", icon: Palette, href: "/workspace/create", color: "text-cyan-600" },
    { label: "AI 文案", desc: "生成商品营销文案", icon: Sparkles, href: "/workspace/create", color: "text-blue-600" },
  ];

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f]">
      <header className="bg-white border-b border-[#e5e5e5] sticky top-0 z-40">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2 cursor-pointer">
              <div className="h-8 w-8 rounded-lg bg-[#1d1d1f] flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-[#1d1d1f]">图流 AI</span>
            </Link>
            <div className="hidden sm:flex items-center space-x-1 ml-4 px-3 py-1 rounded-full bg-[#f0fdf4]">
              <Activity className="h-3 w-3 text-green-500" />
              <span className="text-xs text-green-600 font-medium">系统在线</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="rounded-lg px-3 py-1.5 flex items-center space-x-2 bg-amber-50 border border-amber-200">
              <Coins className="h-3.5 w-3.5 text-amber-600" />
              <span className="text-xs font-medium text-amber-700">剩余 8 次</span>
            </div>
            <div className="h-8 w-8 rounded-full bg-[#1d1d1f] flex items-center justify-center text-xs font-bold text-white cursor-pointer">
              U
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className="w-60 bg-white border-r border-[#e5e5e5] min-h-[calc(100vh-65px)] hidden md:flex flex-col">
          <nav className="p-3 space-y-1 flex-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#1d1d1f] text-white font-medium"
                      : "text-[#666] hover:text-[#1d1d1f] hover:bg-[#f5f5f7]"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm">{item.label}</span>
                  {isActive && <ChevronRight className="h-3.5 w-3.5 ml-auto text-white/50" />}
                </button>
              );
            })}
          </nav>
          <div className="p-3 border-t border-[#e5e5e5]">
            <Link href="/workspace/create">
              <Button className="w-full bg-[#1d1d1f] text-white hover:bg-[#333] rounded-xl text-sm h-10 cursor-pointer">
                <Plus className="h-4 w-4 mr-1.5" />
                新建项目
              </Button>
            </Link>
          </div>
        </aside>

        <main className="flex-1 p-6">
          {activeTab === "generate" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div key={index} className="bg-white rounded-2xl border border-[#e5e5e5] p-5 hover:shadow-md transition-shadow cursor-default">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-[#86868b]">{stat.label}</span>
                        <div className={`h-8 w-8 rounded-lg ${stat.bg} border ${stat.border} flex items-center justify-center`}>
                          <Icon className={`h-4 w-4 ${stat.color}`} />
                        </div>
                      </div>
                      <div className="text-3xl font-bold text-[#1d1d1f]">{stat.value}</div>
                    </div>
                  );
                })}
              </div>

              <div className="bg-white rounded-2xl border border-[#e5e5e5] p-6">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-lg font-semibold text-[#1d1d1f]">开始创建</h2>
                    <p className="text-sm text-[#86868b] mt-0.5">选择您想要生成的内容类型</p>
                  </div>
                  <Link href="/workspace/create">
                    <Button className="bg-[#1d1d1f] text-white hover:bg-[#333] rounded-xl text-sm cursor-pointer">
                      <Plus className="h-4 w-4 mr-1.5" />
                      新建项目
                    </Button>
                  </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {quickActions.map((action) => {
                    const Icon = action.icon;
                    return (
                      <Link key={action.label} href={action.href}>
                        <div className="bg-white rounded-2xl border border-[#e5e5e5] p-6 cursor-pointer h-full hover:shadow-md hover:-translate-y-0.5 transition-all">
                          <div className="flex flex-col items-center text-center space-y-3">
                            <div className={`h-12 w-12 rounded-xl bg-[#f5f5f7] border border-[#e5e5e5] flex items-center justify-center`}>
                              <Icon className={`h-6 w-6 ${action.color}`} />
                            </div>
                            <div>
                              <h3 className="font-semibold text-[#1d1d1f]">{action.label}</h3>
                              <p className="text-sm text-[#86868b] mt-0.5">{action.desc}</p>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-[#e5e5e5] p-6">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-lg font-semibold text-[#1d1d1f]">最近生成</h2>
                    <p className="text-sm text-[#86868b] mt-0.5">查看您最近的生成记录</p>
                  </div>
                  <Link href="/workspace/history">
                    <Button variant="outline" className="border-[#e5e5e5] text-[#666] hover:text-[#1d1d1f] hover:border-[#ccc] rounded-xl cursor-pointer">
                      查看全部
                    </Button>
                  </Link>
                </div>
                <div className="space-y-3">
                  {recentGenerations.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 bg-[#f5f5f7] rounded-xl hover:bg-[#eee] transition-colors cursor-pointer">
                      <div className="flex items-center space-x-4">
                        <div className="h-12 w-12 rounded-xl bg-white border border-[#e5e5e5] flex items-center justify-center">
                          <ImageIcon className="h-6 w-6 text-[#ccc]" />
                        </div>
                        <div>
                          <h4 className="font-medium text-[#1d1d1f]">{item.name}</h4>
                          <div className="flex items-center space-x-2 text-sm text-[#86868b] mt-0.5">
                            <span className="px-1.5 py-0.5 rounded bg-white border border-[#e5e5e5] text-xs">{item.platform}</span>
                            <span className="text-xs">{item.date}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          item.status === "completed"
                            ? "bg-green-50 text-green-600 border border-green-200"
                            : "bg-amber-50 text-amber-600 border border-amber-200"
                        }`}>
                          {item.status === "completed" ? "已完成" : "处理中"}
                        </span>
                        <ArrowRight className="h-4 w-4 text-[#ccc]" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab !== "generate" && (
            <div className="bg-white rounded-2xl border border-[#e5e5e5] p-12">
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <LayoutDashboard className="h-16 w-16 text-[#ccc] mb-4" />
                <h3 className="text-xl font-semibold text-[#1d1d1f] mb-2">功能开发中</h3>
                <p className="text-[#86868b]">该功能正在紧张开发中，敬请期待</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
