import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <p className="text-8xl font-bold text-zinc-800 mb-4">404</p>
      <h2 className="text-2xl font-semibold text-zinc-100 mb-2">页面未找到</h2>
      <p className="text-zinc-400 text-sm mb-8">您访问的页面不存在或已被移除。</p>
      <Link href="/">
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">返回首页</Button>
      </Link>
    </div>
  );
}
