import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { motion } from "framer-motion";
import { ChevronRight, Zap } from "lucide-react";
import { useState } from "react";
import BeforeAfterSlider from "@/components/BeforeAfterSlider";
import { useLocation } from "wouter";

/**
 * 赛博朋克风格的 AI 电商图片生成平台首页
 */
export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [activeCase, setActiveCase] = useState(0);

  const caseStudies = [
    {
      id: 1,
      title: "运动鞋",
      category: "Fashion",
      before: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop",
      after: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop&q=80&brightness=1.1&contrast=1.2",
    },
    {
      id: 2,
      title: "化妆品",
      category: "Beauty",
      before: "https://images.unsplash.com/photo-1596462502278-af3c4e7db7b5?w=500&h=500&fit=crop",
      after: "https://images.unsplash.com/photo-1596462502278-af3c4e7db7b5?w=500&h=500&fit=crop&q=80&brightness=1.15&contrast=1.1",
    },
    {
      id: 3,
      title: "3C数码",
      category: "Tech",
      before: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop",
      after: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop&q=80&brightness=1.2&contrast=1.15",
    },
    {
      id: 4,
      title: "手表",
      category: "Accessories",
      before: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=500&h=500&fit=crop",
      after: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=500&h=500&fit=crop&q=80&brightness=1.1&contrast=1.2",
    },
    {
      id: 5,
      title: "眼镜",
      category: "Fashion",
      before: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500&h=500&fit=crop",
      after: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500&h=500&fit=crop&q=80&brightness=1.15&contrast=1.1",
    },
    {
      id: 6,
      title: "包包",
      category: "Accessories",
      before: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500&h=500&fit=crop",
      after: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500&h=500&fit=crop&q=80&brightness=1.1&contrast=1.2",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* 背景扫描线效果 */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20" />
        <div className="absolute inset-0 opacity-5">
          <div className="h-full w-full" style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 245, 255, 0.03) 2px, rgba(0, 245, 255, 0.03) 4px)',
            animation: 'scan-line 8s linear infinite'
          }} />
        </div>
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 glass-effect border-b border-neon-cyan/20">
        <div className="container flex items-center justify-between h-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2"
          >
            <Zap className="w-8 h-8 text-neon-pink" />
            <span className="text-2xl font-bold neon-glow">Tuliu AI</span>
          </motion.div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#pricing" className="text-sm font-medium hover:text-neon-cyan transition-colors">
              Pricing
            </a>
            <a href="#features" className="text-sm font-medium hover:text-neon-cyan transition-colors">
              Features
            </a>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            {isAuthenticated ? (
              <Button
                onClick={() => navigate('/dashboard')}
                className="btn-neon text-sm"
              >
                Dashboard
              </Button>
            ) : (
              <Button
                onClick={() => window.location.href = '/login'}
                className="btn-neon text-sm"
              >
                Login
              </Button>
            )}
          </motion.div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4">
        <div className="container max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6 neon-glow">
              AI 电商图片生成
            </h1>
            <p className="text-xl md:text-2xl text-foreground/80 mb-8 max-w-3xl mx-auto">
              使用 AI 技术秒速生成高质量电商产品图，提升转化率
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={() => window.location.href = '/login'}
                  className="btn-neon px-8 py-3 text-lg"
                >
                  立即免费试用 <ChevronRight className="ml-2 w-5 h-5" />
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="outline"
                  className="btn-neon-cyan px-8 py-3 text-lg"
                >
                  查看演示
                </Button>
              </motion.div>
            </div>

            {/* 统计数据 */}
            <div className="grid grid-cols-3 gap-4 md:gap-8 mt-16">
              {[
                { label: "已生成图片", value: "100K+" },
                { label: "用户满意度", value: "98%" },
                { label: "平均耗时", value: "<5s" },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
                  className="glass-effect p-4 rounded-lg border border-neon-cyan/20"
                >
                  <div className="text-2xl md:text-3xl font-bold text-neon-cyan">{stat.value}</div>
                  <div className="text-sm text-foreground/60">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Case Gallery Section */}
      <section id="features" className="relative py-20 px-4 border-t border-neon-cyan/10">
        <div className="container max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 neon-glow">
              案例展示
            </h2>
            <p className="text-lg text-foreground/70">
              原图 vs AI 生成图 - 滑动查看效果对比
            </p>
          </motion.div>

          {/* 主展示区 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <div className="glass-effect-pink rounded-lg overflow-hidden border border-neon-pink/30 p-2">
              <BeforeAfterSlider
                before={caseStudies[activeCase].before}
                after={caseStudies[activeCase].after}
                title={caseStudies[activeCase].title}
              />
            </div>
            <div className="mt-4 text-center">
              <h3 className="text-2xl font-bold text-neon-pink">
                {caseStudies[activeCase].title}
              </h3>
              <p className="text-sm text-foreground/60 mt-1">
                {caseStudies[activeCase].category}
              </p>
            </div>
          </motion.div>

          {/* 案例缩略图网格 */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {caseStudies.map((caseItem, index) => (
              <motion.button
                key={caseItem.id}
                onClick={() => setActiveCase(index)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`relative group rounded-lg overflow-hidden aspect-square transition-all duration-300 ${
                  activeCase === index
                    ? 'ring-2 ring-neon-pink scale-105'
                    : 'ring-1 ring-neon-cyan/30 hover:ring-neon-cyan/60'
                }`}
              >
                <img
                  src={caseItem.before}
                  alt={caseItem.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-white font-bold text-sm">{caseItem.title}</span>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-20 px-4 border-t border-neon-cyan/10">
        <div className="container max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 neon-glow-cyan">
              核心功能
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: "⚡", title: "极速生成", desc: "5秒内生成高质量图片" },
              { icon: "🎨", title: "AI 翻译", desc: "中文 Prompt 自动转英文" },
              { icon: "🔐", title: "安全可靠", desc: "企业级数据加密保护" },
              { icon: "💰", title: "灵活计费", desc: "按需付费，无隐藏费用" },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="glass-effect border border-neon-cyan/20 p-6 rounded-lg hover:border-neon-pink/40 transition-all"
              >
                <div className="text-4xl mb-3">{feature.icon}</div>
                <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                <p className="text-sm text-foreground/70">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 px-4 border-t border-neon-cyan/10">
        <div className="container max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="glass-effect-pink rounded-lg p-12 border border-neon-pink/30"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 neon-glow">
              准备好了吗？
            </h2>
            <p className="text-lg text-foreground/80 mb-8">
              立即开始免费试用，获得 10 积分用于生成图片
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={() => window.location.href = '/login'}
                className="btn-neon px-8 py-3 text-lg"
              >
                开始免费试用 <ChevronRight className="ml-2 w-5 h-5" />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neon-cyan/10 py-8 px-4">
        <div className="container max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold mb-4">Tuliu AI</h3>
              <p className="text-sm text-foreground/60">
                AI 驱动的电商图片生成平台
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">产品</h4>
              <ul className="space-y-2 text-sm text-foreground/60">
                <li><a href="#" className="hover:text-neon-cyan">功能</a></li>
                <li><a href="#" className="hover:text-neon-cyan">定价</a></li>
                <li><a href="#" className="hover:text-neon-cyan">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">公司</h4>
              <ul className="space-y-2 text-sm text-foreground/60">
                <li><a href="#" className="hover:text-neon-cyan">关于</a></li>
                <li><a href="#" className="hover:text-neon-cyan">博客</a></li>
                <li><a href="#" className="hover:text-neon-cyan">联系</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">法律</h4>
              <ul className="space-y-2 text-sm text-foreground/60">
                <li><a href="#" className="hover:text-neon-cyan">隐私</a></li>
                <li><a href="#" className="hover:text-neon-cyan">条款</a></li>
                <li><a href="#" className="hover:text-neon-cyan">Cookie</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-neon-cyan/10 pt-8 text-center text-sm text-foreground/60">
            <p>&copy; 2026 Tuliu AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
