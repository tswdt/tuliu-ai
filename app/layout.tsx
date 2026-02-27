import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { Toaster } from "@/components/toaster";

const geistSans = GeistSans;
const geistMono = GeistMono;

export const metadata: Metadata = {
  title: {
    default: '图流 AI - 智能电商摄影平台',
    template: '%s | 图流 AI',
  },
  description: 'AI 驱动的电商产品摄影平台。上传产品照片，30秒生成电商级视觉大片。',
  keywords: ['AI摄影', '电商摄影', '产品图片', '智能抠图', '场景生成', '图流AI'],
  authors: [{ name: '图流 AI' }],
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: 'https://tuliu.ai',
    siteName: '图流 AI',
    title: '图流 AI - 智能电商摄影平台',
    description: 'AI 驱动的电商产品摄影平台。上传产品照片，30秒生成电商级视觉大片。',
  },
  twitter: {
    card: 'summary_large_image',
    title: '图流 AI - 智能电商摄影平台',
    description: 'AI 驱动的电商产品摄影平台。',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
