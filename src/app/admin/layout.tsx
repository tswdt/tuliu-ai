"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Shield,
  Users,
  ListTodo,
  LayoutTemplate,
  FileText,
  Settings,
  CreditCard,
  ArrowLeft,
} from "lucide-react";

const adminNavItems = [
  { href: "/admin", label: "概览", icon: Shield },
  { href: "/admin/users", label: "用户管理", icon: Users },
  { href: "/admin/tasks", label: "任务管理", icon: ListTodo },
  { href: "/admin/templates", label: "模板管理", icon: LayoutTemplate },
  { href: "/admin/prompts", label: "提示词模板", icon: FileText },
  { href: "/admin/platform-rules", label: "平台规则", icon: Settings },
  { href: "/admin/orders", label: "订单积分", icon: CreditCard },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-red-600 to-orange-600 flex items-center justify-center">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-gray-900">后台管理</span>
            </div>
            <span className="text-gray-300">|</span>
            <span className="text-sm text-gray-500">燎原 AI</span>
          </div>
          <Link href="/workspace" className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
            <ArrowLeft className="h-3.5 w-3.5" />
            返回工作台
          </Link>
        </div>
      </header>

      <div className="flex">
        <aside className="w-52 bg-white border-r min-h-[calc(100vh-57px)] hidden md:flex flex-col">
          <nav className="p-3 space-y-1">
            {adminNavItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    isActive
                      ? "bg-red-50 text-red-700 font-medium"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
