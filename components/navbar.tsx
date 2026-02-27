'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useWalletStore } from '@/lib/stores/wallet-store';
import { Button } from '@/components/ui/button';

export default function Navbar() {
  const { user, isLoading, fetchUser, logout } = useAuthStore();
  const { balance, fetchBalance } = useWalletStore();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (user) {
      fetchBalance();
    }
  }, [user, fetchBalance]);

  return (
    <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-semibold text-zinc-100 hover:text-white transition-colors">
          图流 AI
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm text-zinc-400">
          <Link href="/" className="hover:text-zinc-100 transition-colors">首页</Link>
          <Link href="/pricing" className="hover:text-zinc-100 transition-colors">定价</Link>
          <Link href="/generate" className="hover:text-zinc-100 transition-colors">开始使用</Link>
        </nav>

        <div className="flex items-center gap-3">
          {!isLoading && user ? (
            <>
              <span className="text-sm text-zinc-400 hidden sm:block">
                {balance} 积分
              </span>
              <Link href="/dashboard">
                <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-300 hover:text-zinc-100">
                  仪表盘
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="text-zinc-400 hover:text-zinc-100"
              >
                退出
              </Button>
            </>
          ) : !isLoading ? (
            <Link href="/generate">
              <Button size="sm" className="bg-zinc-100 text-zinc-950 hover:bg-zinc-200">
                登录
              </Button>
            </Link>
          ) : null}
        </div>
      </div>
    </header>
  );
}
