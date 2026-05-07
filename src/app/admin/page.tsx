"use client";

import {
  Users,
  ListTodo,
  Image,
  CreditCard,
  TrendingUp,
  Activity,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const stats = [
  { label: "总用户", value: "2,156", change: "+12%", icon: Users, color: "text-blue-600 bg-blue-50" },
  { label: "今日任务", value: "89", change: "+8%", icon: ListTodo, color: "text-[#1d1d1f] bg-[#f5f5f7]" },
  { label: "生成图片", value: "10,432", change: "+23%", icon: Image, color: "text-emerald-600 bg-emerald-50" },
  { label: "总收入", value: "¥48,920", change: "+15%", icon: CreditCard, color: "text-amber-600 bg-amber-50" },
];

const recentActivities = [
  { user: "张三", action: "生成了淘宝商品图", time: "2分钟前", status: "success" },
  { user: "李四", action: "注册了新账户", time: "5分钟前", status: "info" },
  { user: "王五", action: "购买了50次额度包", time: "12分钟前", status: "success" },
  { user: "赵六", action: "生成任务失败", time: "18分钟前", status: "error" },
  { user: "钱七", action: "生成了京东商品图", time: "25分钟前", status: "success" },
  { user: "孙八", action: "导出了详情页HTML", time: "30分钟前", status: "success" },
];

const platformStats = [
  { platform: "淘宝", count: 3240, pct: 35 },
  { platform: "京东", count: 1860, pct: 20 },
  { platform: "拼多多", count: 1395, pct: 15 },
  { platform: "小红书", count: 930, pct: 10 },
  { platform: "抖音", count: 744, pct: 8 },
  { platform: "Amazon", count: 558, pct: 6 },
  { platform: "其他", count: 558, pct: 6 },
];

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">管理概览</h1>

      <div className="grid grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <Card key={i} className="border-0 shadow-sm">
            <CardContent className="pt-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-500">{s.label}</span>
                <div className={`h-8 w-8 rounded-lg ${s.color} flex items-center justify-center`}>
                  <s.icon className="h-4 w-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900">{s.value}</div>
              <div className="flex items-center gap-1 mt-1 text-xs text-green-600">
                <TrendingUp className="h-3 w-3" />
                <span>{s.change} 较上周</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-5">
              <h2 className="font-semibold text-gray-900 mb-4">平台使用分布</h2>
              <div className="space-y-3">
                {platformStats.map((p, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-sm text-gray-600 w-16">{p.platform}</span>
                    <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#1d1d1f] rounded-full"
                        style={{ width: `${p.pct}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-500 w-20 text-right">{p.count.toLocaleString()} 次</span>
                    <span className="text-xs text-gray-400 w-10 text-right">{p.pct}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-5">
              <h2 className="font-semibold text-gray-900 mb-4">最近动态</h2>
              <div className="space-y-3">
                {recentActivities.map((a, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className={`h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      a.status === "success" ? "bg-green-100 text-green-600" :
                      a.status === "error" ? "bg-red-100 text-red-600" :
                      "bg-blue-100 text-blue-600"
                    }`}>
                      {a.status === "error" ? (
                        <AlertCircle className="h-3 w-3" />
                      ) : (
                        <Activity className="h-3 w-3" />
                      )}
                    </div>
                    <div>
                      <div className="text-sm text-gray-700">
                        <span className="font-medium">{a.user}</span> {a.action}
                      </div>
                      <div className="text-xs text-gray-400">{a.time}</div>
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
