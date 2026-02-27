import Link from 'next/link';
import { Zap } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-zinc-800 bg-zinc-950 py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-zinc-500">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-blue-400" />
          <span className="text-zinc-300 font-medium">图流 AI</span>
          <span>— AI 驱动的电商产品摄影</span>
        </div>
        <nav className="flex items-center gap-6">
          <Link href="/" className="hover:text-zinc-300 transition-colors">首页</Link>
          <Link href="/pricing" className="hover:text-zinc-300 transition-colors">定价</Link>
          <Link href="/generate" className="hover:text-zinc-300 transition-colors">工具</Link>
        </nav>
        <p className="text-xs">© {new Date().getFullYear()} 图流 AI. All rights reserved.</p>
      </div>
    </footer>
  );
}
