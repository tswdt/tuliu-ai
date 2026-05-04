"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sparkles,
  PlusCircle,
  FolderOpen,
  Image,
  Clock,
  LayoutGrid,
  Coins,
  Settings,
  ChevronDown,
  Bell,
  Loader2,
  CheckCircle2,
} from "lucide-react";

const navItems = [
  { href: "/workspace/new", label: "新建项目", icon: PlusCircle },
  { href: "/workspace/history", label: "我的项目", icon: FolderOpen },
  { href: "/workspace/assets", label: "素材库", icon: Image },
  { href: "/workspace/generation-history", label: "生成历史", icon: Clock },
  { href: "/workspace/templates", label: "模板中心", icon: LayoutGrid },
  { href: "/workspace/credits", label: "积分余额", icon: Coins },
  { href: "/workspace/settings", label: "账户设置", icon: Settings },
];

const taskStatuses = [
  { label: "纯棉T恤 - 淘宝主图", status: "done", icon: CheckCircle2, color: "text-green-500" },
];

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#f5f6fa]">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 h-14">
        <div className="flex items-center justify-between h-full px-5">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-md bg-gray-900 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-gray-900 text-sm">图流 AI</span>
            </Link>
            <span className="text-gray-200">|</span>
            <span className="text-sm text-gray-500">工作台</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 border border-amber-200">
              <Coins className="h-3.5 w-3.5 text-amber-600" />
              <span className="text-xs font-medium text-amber-700">8 次</span>
            </div>
            <button className="relative h-8 w-8 rounded-md hover:bg-gray-100 flex items-center justify-center transition-colors">
              <Bell className="h-4 w-4 text-gray-500" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
            </button>
            <div className="h-8 w-8 rounded-full bg-gray-900 flex items-center justify-center text-white text-xs font-medium cursor-pointer">
              U
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className="w-52 bg-white border-r border-gray-200 min-h-[calc(100vh-56px)] hidden md:flex flex-col">
          <nav className="p-2.5 space-y-0.5 flex-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors ${
                    isActive
                      ? "bg-violet-50 text-violet-700 font-medium"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="p-2.5 border-t border-gray-100">
            <Link
              href="/workspace/credits"
              className="flex items-center justify-between px-3 py-2 rounded-md bg-violet-50 text-sm"
            >
              <div className="flex items-center gap-2 text-violet-700">
                <Coins className="h-4 w-4" />
                <span className="font-medium">剩余 8 次</span>
              </div>
              <span className="text-xs text-violet-500">充值</span>
            </Link>
          </div>
        </aside>

        <main className="flex-1 min-h-[calc(100vh-56px)]">{children}</main>
      </div>
    </div>
  );
}
