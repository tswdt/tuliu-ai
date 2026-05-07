"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  PlusCircle,
  FolderOpen,
  Image,
  Clock,
  LayoutGrid,
  Coins,
  Settings,
  X,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { href: "/workspace/create", label: "新建项目", icon: PlusCircle },
  { href: "/workspace/history", label: "我的项目", icon: FolderOpen },
  { href: "/workspace/assets", label: "素材库", icon: Image },
  { href: "/workspace/generation-history", label: "生成历史", icon: Clock },
  { href: "/workspace/templates", label: "模板中心", icon: LayoutGrid },
  { href: "/workspace/credits", label: "积分余额", icon: Coins },
  { href: "/workspace/credits", label: "账户设置", icon: Settings },
];

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isLandingPage = pathname === "/workspace/new";

  if (isLandingPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      {/* 移动端遮罩 */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <div className="flex">
        {/* 左侧边栏 */}
        <aside className={`fixed md:static inset-y-0 left-0 z-50 w-52 bg-white border-r border-[#e5e5e5] min-h-screen flex flex-col transition-transform ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}>
          <div className="md:hidden flex items-center justify-between p-4 border-b border-[#e5e5e5]">
            <span className="text-sm font-medium text-[#1d1d1f]">导航菜单</span>
            <button onClick={() => setMobileMenuOpen(false)} className="cursor-pointer">
              <X className="h-4 w-4 text-[#86868b] hover:text-[#1d1d1f]" />
            </button>
          </div>
          <nav className="p-3 space-y-1 flex-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all ${
                    isActive
                      ? "bg-[#1d1d1f] text-white font-medium"
                      : "text-[#666] hover:bg-[#f5f5f7] hover:text-[#1d1d1f]"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="p-3 border-t border-[#e5e5e5]">
            <Link
              href="/workspace/credits"
              className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-[#f5f5f7] text-sm"
            >
              <div className="flex items-center gap-2 text-[#1d1d1f]">
                <Coins className="h-4 w-4" />
                <span className="font-medium">剩余 100 次</span>
              </div>
              <span className="text-xs text-[#86868b]">充值</span>
            </Link>
          </div>
        </aside>

        {/* 主内容区 */}
        <main className="flex-1 min-h-screen">{children}</main>
      </div>
    </div>
  );
}
