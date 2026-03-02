import Link from "next/link";
import { ArrowRight, Sparkles, Zap, Palette, Upload, Shield, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  const features = [
    {
      icon: <Sparkles className="h-8 w-8 text-primary-600" />,
      title: "AI智能生成",
      description: "集成豆包AI和Flux API，一键生成4K超清商品图片"
    },
    {
      icon: <Palette className="h-8 w-8 text-primary-600" />,
      title: "多平台适配",
      description: "支持淘宝、天猫、京东、抖音、小红书、亚马逊等主流平台尺寸"
    },
    {
      icon: <Upload className="h-8 w-8 text-primary-600" />,
      title: "智能文案",
      description: "通义千问AI自动生成高质量商品详情页文案"
    },
    {
      icon: <Zap className="h-8 w-8 text-primary-600" />,
      title: "高效快速",
      description: "秒级生成，批量处理，大幅提升工作效率"
    },
    {
      icon: <Shield className="h-8 w-8 text-primary-600" />,
      title: "版权保障",
      description: "全流程内容安全审核，商用版权声明"
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-primary-600" />,
      title: "数据驱动",
      description: "详细的数据分析，帮助优化商品展示效果"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* 导航栏 */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                电商AI生成
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-gray-600 hover:text-primary-600 transition">
                功能特性
              </Link>
              <Link href="#pricing" className="text-gray-600 hover:text-primary-600 transition">
                价格方案
              </Link>
              <Link href="/dashboard" className="text-gray-600 hover:text-primary-600 transition">
                控制台
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="ghost">登录</Button>
              </Link>
              <Link href="/register">
                <Button>免费注册</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero区域 */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary-50 text-primary-700 mb-6">
            <Sparkles className="h-4 w-4 mr-2" />
            新用户注册即送10次免费生成额度
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            让AI为您打造
            <span className="bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent block">
              完美的电商详情页
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
            上传商品图片，一键生成4K超清主图、详情页全套图，
            自动生成营销文案，支持多平台尺寸适配
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard">
              <Button size="lg" className="text-lg px-8">
                立即开始使用
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline" className="text-lg px-8">
                了解更多
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 功能特性 */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">强大的功能特性</h2>
            <p className="text-xl text-gray-600">一站式AI视觉生产解决方案</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mb-4">{feature.icon}</div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA区域 */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-800">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold text-white mb-6">
            准备好提升您的电商效率了吗？
          </h2>
          <p className="text-xl text-primary-100 mb-10">
            立即注册，免费体验AI生成的强大功能
          </p>
          <Link href="/register">
            <Button size="lg" variant="secondary" className="text-lg px-8">
              免费开始
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* 页脚 */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Sparkles className="h-6 w-6 text-primary-400" />
                <span className="text-xl font-bold text-white">电商AI生成</span>
              </div>
              <p className="text-gray-400">
                专业的电商AI视觉生产SaaS平台
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">产品</h4>
              <ul className="space-y-2">
                <li><Link href="#" className="hover:text-white transition">功能特性</Link></li>
                <li><Link href="#" className="hover:text-white transition">价格方案</Link></li>
                <li><Link href="#" className="hover:text-white transition">API文档</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">公司</h4>
              <ul className="space-y-2">
                <li><Link href="#" className="hover:text-white transition">关于我们</Link></li>
                <li><Link href="#" className="hover:text-white transition">联系我们</Link></li>
                <li><Link href="#" className="hover:text-white transition">新闻动态</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">法律</h4>
              <ul className="space-y-2">
                <li><Link href="#" className="hover:text-white transition">用户协议</Link></li>
                <li><Link href="#" className="hover:text-white transition">隐私政策</Link></li>
                <li><Link href="#" className="hover:text-white transition">服务条款</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2024 电商AI生成平台. 保留所有权利.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
