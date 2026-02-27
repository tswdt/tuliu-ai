'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useWalletStore } from '@/lib/stores/wallet-store';
import { Button } from '@/components/ui/button';

export default function AppNavbar() {
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
          <Link href="/generate" className="hover:text-zinc-100 transition-colors">生成</Link>
          <Link href="/dashboard" className="hover:text-zinc-100 transition-colors">仪表盘</Link>
          <Link href="/editor" className="hover:text-zinc-100 transition-colors">编辑器</Link>
        </nav>

        <div className="flex items-center gap-3">
          {!isLoading && user ? (
            <>
              <span className="text-sm text-zinc-400 hidden sm:block">
                {balance} 积分
              </span>
              <span className="text-sm text-zinc-500 hidden sm:block">{user.email}</span>
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
