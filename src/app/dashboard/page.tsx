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
  Coins
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("generate");

  const stats = [
    { label: "剩余额度", value: "8", icon: <Coins className="h-5 w-5 text-yellow-500" /> },
    { label: "已生成", value: "12", icon: <ImageIcon className="h-5 w-5 text-primary-500" /> },
    { label: "本月生成", value: "8", icon: <Zap className="h-5 w-5 text-green-500" /> },
  ];

  const recentGenerations = [
    { id: "1", name: "连衣裙主图", status: "completed", platform: "淘宝", date: "2024-01-15" },
    { id: "2", name: "运动鞋详情", status: "completed", platform: "抖音", date: "2024-01-14" },
    { id: "3", name: "化妆品套装", status: "processing", platform: "小红书", date: "2024-01-14" },
  ];

  const navItems = [
    { id: "generate", label: "AI生成", icon: <Sparkles className="h-5 w-5" /> },
    { id: "gallery", label: "素材库", icon: <ImageIcon className="h-5 w-5" /> },
    { id: "history", label: "历史记录", icon: <History className="h-5 w-5" /> },
    { id: "pricing", label: "套餐购买", icon: <CreditCard className="h-5 w-5" /> },
    { id: "settings", label: "设置", icon: <Settings className="h-5 w-5" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <Sparkles className="h-6 w-6 text-primary-600" />
              <span className="text-xl font-bold">电商AI生成</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="secondary" className="bg-yellow-50 text-yellow-700 border-yellow-200">
              <Coins className="h-3 w-3 mr-1" />
              剩余 8 次
            </Badge>
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarImage src="https://placehold.co/40" />
                <AvatarFallback>用</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* 侧边栏 */}
        <aside className="w-64 bg-white border-r min-h-[calc(100vh-73px)] hidden md:block">
          <nav className="p-4 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === item.id
                    ? "bg-primary-50 text-primary-700 font-medium"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* 主内容区 */}
        <main className="flex-1 p-6">
          {activeTab === "generate" && (
            <div className="space-y-6">
              {/* 统计卡片 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, index) => (
                  <Card key={index}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-gray-500">{stat.label}</CardTitle>
                      {stat.icon}
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{stat.value}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* 快速操作 */}
              <Card>
                <CardHeader>
                  <CardTitle>开始创建</CardTitle>
                  <CardDescription>选择您想要生成的内容类型</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link href="/dashboard/generate/image">
                      <Card className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardContent className="pt-6">
                          <div className="flex flex-col items-center text-center space-y-3">
                            <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                              <Upload className="h-6 w-6 text-primary-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold">商品主图</h3>
                              <p className="text-sm text-gray-500">生成4K超清商品主图</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                    <Link href="/dashboard/generate/detail">
                      <Card className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardContent className="pt-6">
                          <div className="flex flex-col items-center text-center space-y-3">
                            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                              <Palette className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold">详情页全套</h3>
                              <p className="text-sm text-gray-500">一键生成详情页全套图片</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                    <Link href="/dashboard/generate/copy">
                      <Card className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardContent className="pt-6">
                          <div className="flex flex-col items-center text-center space-y-3">
                            <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                              <Sparkles className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold">AI文案</h3>
                              <p className="text-sm text-gray-500">生成商品营销文案</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* 最近生成 */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>最近生成</CardTitle>
                    <CardDescription>查看您最近的生成记录</CardDescription>
                  </div>
                  <Link href="/dashboard/history">
                    <Button variant="outline">查看全部</Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentGenerations.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center">
                            <ImageIcon className="h-6 w-6 text-gray-400" />
                          </div>
                          <div>
                            <h4 className="font-medium">{item.name}</h4>
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                              <Badge variant="outline">{item.platform}</Badge>
                              <span>{item.date}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant={item.status === "completed" ? "default" : "secondary"}
                            className={item.status === "completed" ? "bg-green-100 text-green-700" : ""}
                          >
                            {item.status === "completed" ? "已完成" : "处理中"}
                          </Badge>
                          <Button variant="ghost" size="sm">
                            查看
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab !== "generate" && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <LayoutDashboard className="h-16 w-16 text-gray-300 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">功能开发中</h3>
                  <p className="text-gray-500">该功能正在紧张开发中，敬请期待</p>
                </div>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}
