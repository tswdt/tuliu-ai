'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
      <h2 className="text-xl font-semibold text-zinc-100 mb-2">出现了一些错误</h2>
      <p className="text-zinc-400 text-sm mb-6 max-w-md">
        抱歉，页面加载时发生了错误。请尝试刷新页面或稍后再试。
      </p>
      <Button
        onClick={reset}
        className="bg-blue-600 hover:bg-blue-700 text-white"
      >
        重试
      </Button>
    </div>
  );
}
