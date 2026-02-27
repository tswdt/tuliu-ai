'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useWalletStore } from '@/lib/stores/wallet-store';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { JobState } from '@/lib/services/job';

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuthStore();
  const { balance, isLoading: walletLoading, fetchBalance } = useWalletStore();
  const [jobs, setJobs] = useState<JobState[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchBalance();
      fetch('/api/jobs/history')
        .then((res) => (res.ok ? res.json() : { jobs: [] }))
        .then((data) => setJobs(data.jobs || []))
        .catch((err) => { console.error('Failed to load job history:', err); setJobs([]); })
        .finally(() => setJobsLoading(false));
    } else if (!authLoading) {
      setJobsLoading(false);
    }
  }, [user, authLoading, fetchBalance]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      <h1 className="text-3xl font-bold">仪表盘</h1>

      {/* Balance Card */}
      <Card className="bg-zinc-900 border-zinc-800 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-zinc-400 text-sm mb-1">当前积分余额</p>
            {walletLoading ? (
              <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
            ) : (
              <p className="text-4xl font-bold text-zinc-100">{balance}</p>
            )}
            <p className="text-zinc-500 text-xs mt-1">每次生成消耗 1 积分</p>
          </div>
          <div className="flex flex-col gap-2">
            <Button
              onClick={() => toast.info('充值功能即将开放')}
              className="bg-zinc-100 text-zinc-950 hover:bg-zinc-200"
            >
              充值
            </Button>
            <Link href="/generate">
              <Button variant="outline" className="w-full border-zinc-700 text-zinc-300 hover:text-zinc-100">
                去生成
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* Job History */}
      <div>
        <h2 className="text-xl font-semibold mb-4">任务历史</h2>
        {jobsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
          </div>
        ) : jobs.length === 0 ? (
          <Card className="bg-zinc-900 border-zinc-800 p-12 text-center">
            <p className="text-zinc-500 mb-4">暂无任务记录</p>
            <Link href="/generate">
              <Button className="bg-zinc-100 text-zinc-950 hover:bg-zinc-200">
                开始第一次生成
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <Card key={job.id} className="bg-zinc-900 border-zinc-800 p-5">
                <div className="flex items-start gap-4">
                  {/* Thumbnail */}
                  {job.inputUrl && (
                    <img
                      src={job.inputUrl}
                      alt="Input"
                      className="w-16 h-16 object-cover rounded-lg border border-zinc-700 flex-shrink-0"
                    />
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      {job.status === 'completed' ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                      ) : job.status === 'failed' ? (
                        <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                      ) : (
                        <Clock className="w-4 h-4 text-blue-400 flex-shrink-0" />
                      )}
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        job.status === 'completed'
                          ? 'bg-green-900/40 text-green-400'
                          : job.status === 'failed'
                          ? 'bg-red-900/40 text-red-400'
                          : 'bg-blue-900/40 text-blue-400'
                      }`}>
                        {job.status}
                      </span>
                      <span className="text-zinc-600 text-xs truncate">{job.id}</span>
                    </div>

                    <div className="w-full bg-zinc-800 rounded-full h-1.5 mb-2">
                      <div
                        className="bg-blue-500 h-1.5 rounded-full"
                        style={{ width: `${job.progress}%` }}
                      />
                    </div>

                    <p className="text-zinc-500 text-xs">
                      {new Date(job.updatedAt).toLocaleString('zh-CN')}
                    </p>
                  </div>

                  {/* Result thumbnail */}
                  {job.resultUrl && (
                    <img
                      src={job.resultUrl}
                      alt="Result"
                      className="w-16 h-16 object-cover rounded-lg border border-zinc-700 flex-shrink-0 cursor-pointer"
                      onClick={() => window.open(job.resultUrl)}
                    />
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
