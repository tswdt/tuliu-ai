export default function Footer() {
  return (
    <footer className="border-t border-zinc-800 bg-zinc-950 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-zinc-100 font-semibold mb-3">图流 AI</h3>
            <p className="text-zinc-500 text-sm">
              AI 驱动的电商产品摄影平台，让每个卖家都能拥有专业级视觉大片。
            </p>
          </div>
          <div>
            <h3 className="text-zinc-100 font-semibold mb-3">快速导航</h3>
            <ul className="space-y-2 text-sm text-zinc-500">
              <li><a href="/" className="hover:text-zinc-300 transition-colors">首页</a></li>
              <li><a href="/pricing" className="hover:text-zinc-300 transition-colors">定价方案</a></li>
              <li><a href="/generate" className="hover:text-zinc-300 transition-colors">开始生成</a></li>
              <li><a href="/dashboard" className="hover:text-zinc-300 transition-colors">用户仪表盘</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-zinc-100 font-semibold mb-3">技术支持</h3>
            <p className="text-zinc-500 text-sm">
              Powered by<br />
              腾讯云 COS + SiliconFlow AI
            </p>
          </div>
        </div>
        <div className="border-t border-zinc-800 pt-8 text-center text-zinc-600 text-sm">
          <p>© {new Date().getFullYear()} 图流 AI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
