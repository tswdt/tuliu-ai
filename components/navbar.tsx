'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Zap } from 'lucide-react';

interface UserInfo {
  userId: string;
  email: string;
  balance: number;
}

export default function Navbar() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { setUser(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    window.location.href = '/';
  };

  return (
    <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-zinc-100 font-semibold text-lg">
          <Zap className="w-5 h-5 text-blue-400" />
          图流 AI
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm text-zinc-400">
          <Link href="/" className="hover:text-zinc-100 transition-colors">首页</Link>
          <Link href="/generate" className="hover:text-zinc-100 transition-colors">工具</Link>
          <Link href="/dashboard" className="hover:text-zinc-100 transition-colors">仪表盘</Link>
          <Link href="/pricing" className="hover:text-zinc-100 transition-colors">定价</Link>
        </nav>

        <div className="flex items-center gap-3">
          {loading ? null : user ? (
            <>
              <span className="text-xs text-zinc-400 hidden sm:block">
                余额: <span className="text-blue-400 font-medium">{user.balance}</span> 积分
              </span>
              <span className="text-xs text-zinc-500 hidden sm:block">{user.email}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="border-zinc-700 text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 text-xs"
              >
                退出
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-zinc-300 hover:text-zinc-100 text-xs">
                  登录
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-xs">
                  注册
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
