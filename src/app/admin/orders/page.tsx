"use client";

import { useState } from "react";
import {
  Search,
  Download,
  CreditCard,
  Gift,
  Zap,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const orders = [
  { id: "ORD001", user: "张三", type: "purchase", desc: "专业版月度订阅", amount: 149, credits: 200, date: "2026-05-01", status: "paid" },
  { id: "ORD002", user: "李四", type: "purchase", desc: "50次额度包", amount: 39, credits: 50, date: "2026-04-28", status: "paid" },
  { id: "ORD003", user: "王五", type: "purchase", desc: "基础版月度订阅", amount: 49, credits: 50, date: "2026-04-25", status: "paid" },
  { id: "ORD004", user: "赵六", type: "purchase", desc: "100次额度包", amount: 69, credits: 100, date: "2026-04-20", status: "paid" },
  { id: "ORD005", user: "钱七", type: "refund", desc: "基础版退款", amount: -49, credits: -50, date: "2026-04-18", status: "refunded" },
  { id: "ORD006", user: "孙八", type: "gift", desc: "新用户注册赠送", amount: 0, credits: 3, date: "2026-04-15", status: "completed" },
  { id: "ORD007", user: "周九", type: "purchase", desc: "企业版月度订阅", amount: 499, credits: 999, date: "2026-04-10", status: "paid" },
  { id: "ORD008", user: "吴十", type: "purchase", desc: "500次额度包", amount: 299, credits: 500, date: "2026-04-05", status: "paid" },
];

const typeMap: Record<string, { label: string; className: string; icon: any }> = {
  purchase: { label: "购买", className: "bg-green-50 text-green-600", icon: CreditCard },
  refund: { label: "退款", className: "bg-red-50 text-red-600", icon: CreditCard },
  gift: { label: "赠送", className: "bg-amber-50 text-amber-600", icon: Gift },
  consume: { label: "消费", className: "bg-blue-50 text-blue-600", icon: Zap },
};

export default function AdminOrdersPage() {
  const [search, setSearch] = useState("");

  const filtered = orders.filter(
    (o) => o.id.includes(search) || o.user.includes(search) || o.desc.includes(search)
  );

  const totalRevenue = orders.filter((o) => o.amount > 0).reduce((sum, o) => sum + o.amount, 0);
  const totalCredits = orders.reduce((sum, o) => sum + o.credits, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">订单和积分管理</h1>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          导出报表
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">总收入</span>
              <CreditCard className="h-4 w-4 text-green-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900">¥{totalRevenue.toLocaleString()}</div>
            <div className="flex items-center gap-1 mt-1 text-xs text-green-600">
              <TrendingUp className="h-3 w-3" />
              <span>+15% 较上月</span>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">发放额度</span>
              <Zap className="h-4 w-4 text-violet-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{totalCredits.toLocaleString()}</div>
            <div className="text-xs text-gray-400 mt-1">次</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">订单数</span>
              <Gift className="h-4 w-4 text-amber-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{orders.length}</div>
            <div className="text-xs text-gray-400 mt-1">笔</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索订单号、用户或描述..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">订单号</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">用户</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">类型</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">描述</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">金额</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">额度</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">日期</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">状态</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-mono text-gray-700">{o.id}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{o.user}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${typeMap[o.type]?.className}`}>
                      {typeMap[o.type]?.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{o.desc}</td>
                  <td className={`px-4 py-3 text-sm font-medium ${o.amount > 0 ? "text-green-600" : o.amount < 0 ? "text-red-500" : "text-gray-500"}`}>
                    {o.amount > 0 ? "+" : ""}¥{o.amount}
                  </td>
                  <td className={`px-4 py-3 text-sm ${o.credits > 0 ? "text-green-600" : "text-red-500"}`}>
                    {o.credits > 0 ? "+" : ""}{o.credits} 次
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{o.date}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      o.status === "paid" ? "bg-green-50 text-green-600" :
                      o.status === "refunded" ? "bg-red-50 text-red-600" :
                      "bg-gray-100 text-gray-500"
                    }`}>
                      {o.status === "paid" ? "已支付" : o.status === "refunded" ? "已退款" : "已完成"}
                    </span>
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
