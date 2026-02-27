'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, CheckCircle2, AlertCircle, Clock, CreditCard } from 'lucide-react';

interface JobState {
  id: string;
  status: string;
  progress: number;
  inputUrl?: string;
  resultUrl?: string;
  createdAt?: string;
  updatedAt: string;
}

interface Order {
  orderId: string;
  name: string;
  credits: number;
  amount: number;
  status: string;
  createdAt: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<{ userId: string; email: string; balance: number } | null>(null);
  const [jobs, setJobs] = useState<JobState[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [meRes, jobsRes, ordersRes] = await Promise.all([
          fetch('/api/auth/me'),
          fetch('/api/jobs'),
          fetch('/api/orders'),
        ]);
        if (meRes.ok) setUser(await meRes.json());
        if (jobsRes.ok) {
          const d = await jobsRes.json();
          setJobs(d.jobs ?? []);
        }
        if (ordersRes.ok) {
          const d = await ordersRes.json();
          setOrders(d.orders ?? []);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const statusIcon = (status: string) => {
    if (status === 'completed') return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    if (status === 'failed') return <AlertCircle className="w-4 h-4 text-red-500" />;
    return <Clock className="w-4 h-4 text-zinc-400" />;
  };

  const formatDate = (s?: string) =>
    s ? new Date(s).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-zinc-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-zinc-100">仪表盘</h1>
        <Link href="/generate">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">开始生成</Button>
        </Link>
      </div>

      {/* User info + balance */}
      {user && (
        <div className="grid sm:grid-cols-3 gap-4">
          <Card className="bg-zinc-900 border-zinc-800 p-6 sm:col-span-2">
            <p className="text-zinc-500 text-sm mb-1">账户</p>
            <p className="text-zinc-100 font-medium">{user.email}</p>
            <p className="text-zinc-600 text-xs mt-1">ID: {user.userId}</p>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800 p-6 flex flex-col items-center justify-center text-center">
            <p className="text-zinc-500 text-sm mb-1">可用积分</p>
            <p className="text-4xl font-bold text-blue-400">{user.balance}</p>
            <Link href="/pricing" className="mt-3">
              <Button size="sm" variant="outline" className="border-zinc-700 text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 text-xs">
                <CreditCard className="w-3 h-3 mr-1" />
                充值积分
              </Button>
            </Link>
          </Card>
        </div>
      )}

      {/* Generation history */}
      <div>
        <h2 className="text-lg font-medium text-zinc-100 mb-4">生成记录</h2>
        {jobs.length === 0 ? (
          <Card className="bg-zinc-900 border-zinc-800 p-8 text-center text-zinc-500">
            <p>还没有生成记录</p>
            <Link href="/generate" className="mt-4 inline-block">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white mt-3">去生成</Button>
            </Link>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {jobs.map((job) => (
              <Card key={job.id} className="bg-zinc-900 border-zinc-800 overflow-hidden">
                {(job.resultUrl ?? job.inputUrl) && (
                  <img
                    src={job.resultUrl ?? job.inputUrl}
                    alt="job thumbnail"
                    className="w-full h-40 object-cover bg-zinc-800"
                  />
                )}
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                      {statusIcon(job.status)}
                      <span className="text-zinc-300 capitalize">{job.status}</span>
                    </div>
                    <span className="text-zinc-600 text-xs">{formatDate(job.createdAt ?? job.updatedAt)}</span>
                  </div>
                  {job.status === 'completed' && job.resultUrl && (
                    <div className="flex gap-2 pt-1">
                      <a href={job.resultUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
                        <Button size="sm" variant="outline" className="w-full border-zinc-700 text-xs">下载</Button>
                      </a>
                      <Link href={`/editor?jobId=${job.id}`} className="flex-1">
                        <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs">编辑</Button>
                      </Link>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Orders */}
      {orders.length > 0 && (
        <div>
          <h2 className="text-lg font-medium text-zinc-100 mb-4">充值记录</h2>
          <div className="space-y-2">
            {orders.map((o) => (
              <div key={o.orderId} className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3">
                <div>
                  <p className="text-sm text-zinc-300">{o.name}</p>
                  <p className="text-xs text-zinc-500">{formatDate(o.createdAt)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-blue-400">+{o.credits} 积分</p>
                  <p className="text-xs text-zinc-500">¥{o.amount}</p>
                </div>
                <span className={`ml-4 text-xs px-2 py-0.5 rounded-full ${o.status === 'completed' ? 'bg-green-900/30 text-green-400' : 'bg-zinc-800 text-zinc-400'}`}>
                  {o.status === 'completed' ? '已完成' : '待支付'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
