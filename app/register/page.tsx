'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(8, '密码至少 8 位'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: '两次密码不一致',
  path: ['confirmPassword'],
});

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const parsed = registerSchema.safeParse({ email, password, confirmPassword });
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        if (issue.path[0]) fieldErrors[issue.path[0] as string] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || '注册失败');
        return;
      }
      toast.success('注册成功！已赠送 3 积分');
      router.push('/generate');
    } catch {
      toast.error('网络错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      <Card className="bg-zinc-900 border-zinc-800 p-8 w-full max-w-md space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-100">注册账户</h1>
          <p className="text-zinc-500 text-sm mt-1">注册即送 3 积分，立即开始生成</p>
        </div>

        <div className="flex items-center gap-2 bg-blue-950/30 border border-blue-800/40 rounded-lg px-3 py-2 text-xs text-blue-300">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          注册成功后将自动赠送 3 次免费生成积分
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-300">邮箱</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
              required
            />
            {errors.email && <p className="text-red-400 text-xs">{errors.email}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-300">密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="至少 8 位"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
              required
            />
            {errors.password && <p className="text-red-400 text-xs">{errors.password}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-300">确认密码</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="再次输入密码"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
              required
            />
            {errors.confirmPassword && <p className="text-red-400 text-xs">{errors.confirmPassword}</p>}
          </div>

          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white h-11"
            disabled={loading}
          >
            {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />注册中...</> : '注册'}
          </Button>
        </form>

        <p className="text-center text-sm text-zinc-500">
          已有账户？{' '}
          <Link href="/login" className="text-blue-400 hover:text-blue-300">
            立即登录
          </Link>
        </p>
      </Card>
    </div>
  );
}
