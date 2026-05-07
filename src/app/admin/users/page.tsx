"use client";

import { useState } from "react";
import {
  Search,
  Plus,
  MoreHorizontal,
  Shield,
  Ban,
  Eye,
  Edit3,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const users = [
  { id: "1", name: "张三", email: "zhangsan@example.com", plan: "专业版", credits: 152, used: 48, status: "active", joinDate: "2026-04-01" },
  { id: "2", name: "李四", email: "lisi@example.com", plan: "免费版", credits: 1, used: 2, status: "active", joinDate: "2026-04-15" },
  { id: "3", name: "王五", email: "wangwu@example.com", plan: "基础版", credits: 35, used: 15, status: "active", joinDate: "2026-03-20" },
  { id: "4", name: "赵六", email: "zhaoliu@example.com", plan: "专业版", credits: 180, used: 20, status: "active", joinDate: "2026-04-10" },
  { id: "5", name: "钱七", email: "qianqi@example.com", plan: "基础版", credits: 0, used: 50, status: "suspended", joinDate: "2026-02-28" },
  { id: "6", name: "孙八", email: "sunba@example.com", plan: "免费版", credits: 3, used: 0, status: "active", joinDate: "2026-05-01" },
];

const planColors: Record<string, string> = {
  "免费版": "bg-gray-100 text-gray-600",
  "基础版": "bg-blue-50 text-blue-600",
  "专业版": "bg-[#f5f5f7] text-[#1d1d1f]",
  "企业版": "bg-amber-50 text-amber-600",
};

const statusColors: Record<string, string> = {
  active: "bg-green-50 text-green-600",
  suspended: "bg-red-50 text-red-600",
};

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");

  const filtered = users.filter(
    (u) => u.name.includes(search) || u.email.includes(search)
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">用户管理</h1>
        <Button className="bg-[#1d1d1f] hover:bg-[#333] text-white">
          <Plus className="h-4 w-4 mr-2" />
          添加用户
        </Button>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索用户名或邮箱..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">用户</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">套餐</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">额度</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">已用</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">状态</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">注册时间</th>
                <th className="text-right text-xs font-medium text-gray-500 px-4 py-3">操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-[#1d1d1f] flex items-center justify-center text-white text-xs font-medium">
                        {u.name[0]}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{u.name}</div>
                        <div className="text-xs text-gray-400">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${planColors[u.plan]}`}>
                      {u.plan}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{u.credits} 次</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{u.used} 次</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[u.status]}`}>
                      {u.status === "active" ? "正常" : "已封禁"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{u.joinDate}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm"><Edit3 className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm" className="text-red-400"><Ban className="h-4 w-4" /></Button>
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
