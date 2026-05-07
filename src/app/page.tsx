"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Sparkles, ArrowRight, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const showcaseItems = [
  { src: "/showcase/1.jpg", title: "AI 电商案例 01" },
  { src: "/showcase/2.jpg", title: "AI 电商案例 02" },
  { src: "/showcase/3.jpg", title: "AI 电商案例 03" },
  { src: "/showcase/4.jpg", title: "AI 电商案例 04" },
  { src: "/showcase/5.jpg", title: "AI 电商案例 05" },
  { src: "/showcase/6.jpg", title: "AI 电商案例 06" },
  { src: "/showcase/7.jpg", title: "AI 电商案例 07" },
  { src: "/showcase/8.jpg", title: "AI 电商案例 08" },
  { src: "/showcase/9.jpg", title: "AI 电商案例 09" },
  { src: "/showcase/10.jpg", title: "AI 电商案例 10" },
  { src: "/showcase/11.jpg", title: "AI 电商案例 11" },
  { src: "/showcase/12.jpg", title: "AI 电商案例 12" },
  { src: "/showcase/13.jpg", title: "AI 电商案例 13" },
  { src: "/showcase/14.jpg", title: "AI 电商案例 14" },
  { src: "/showcase/15.jpg", title: "AI 电商案例 15" },
  { src: "/showcase/16.jpg", title: "AI 电商案例 16" },
  { src: "/showcase/17.jpg", title: "AI 电商案例 17" },
  { src: "/showcase/18.jpg", title: "AI 电商案例 18" },
  { src: "/showcase/19.jpg", title: "AI 电商案例 19" },
  { src: "/showcase/20.jpg", title: "AI 电商案例 20" },
  { src: "/showcase/21.jpg", title: "AI 电商案例 21" },
  { src: "/showcase/22.jpg", title: "AI 电商案例 22" },
  { src: "/showcase/23.jpg", title: "AI 电商案例 23" },
  { src: "/showcase/24.jpg", title: "AI 电商案例 24" },
];

function Lightbox({
  items,
  currentIndex,
  onClose,
  onPrev,
  onNext,
}: {
  items: { src: string; title: string }[];
  currentIndex: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const item = items[currentIndex];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose, onPrev, onNext]);

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="min-h-full flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-3 bg-black/60 backdrop-blur-md flex-shrink-0">
          <div className="text-center flex-1">
            <p className="text-[14px] font-medium text-white">{item.title}</p>
            <p className="text-[12px] text-white/50 mt-0.5">
              {currentIndex + 1} / {items.length}
            </p>
          </div>
          <button
            onClick={onClose}
            className="absolute right-6 top-3 h-9 w-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 flex items-start justify-center py-6 px-16">
          <div className="flex items-start gap-4 max-w-5xl w-full">
            <button
              onClick={onPrev}
              className="sticky top-1/2 -translate-y-1/2 h-11 w-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors flex-shrink-0 cursor-pointer"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div className="flex-1">
              <Image
                src={item.src}
                alt={item.title}
                width={1200}
                height={1600}
                className="w-full h-auto rounded-2xl"
              />
            </div>

            <button
              onClick={onNext}
              className="sticky top-1/2 -translate-y-1/2 h-11 w-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors flex-shrink-0 cursor-pointer"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    if (lightboxIndex !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [lightboxIndex]);

  const openLightbox = useCallback((index: number) => setLightboxIndex(index), []);
  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const goPrev = useCallback(() => {
    setLightboxIndex((prev) => prev === 0 ? showcaseItems.length - 1 : (prev ?? 0) - 1);
  }, []);
  const goNext = useCallback(() => {
    setLightboxIndex((prev) => prev === showcaseItems.length - 1 ? 0 : (prev ?? 0) + 1);
  }, []);

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f]">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#f5f5f7]/80 backdrop-blur-xl border-b border-black/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            <div className="flex items-center space-x-2">
              <div className="h-7 w-7 rounded-lg bg-black flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="text-[16px] font-semibold tracking-tight">燎原 AI</span>
            </div>
            <Link href="/login">
              <Button variant="ghost" className="text-[14px] font-medium text-[#1d1d1f] hover:bg-black/5 rounded-full px-5 h-9 cursor-pointer">
                登录
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <section className="pt-36 pb-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-[40px] sm:text-[52px] md:text-[64px] lg:text-[72px] font-bold mb-8 leading-[1.05] tracking-[-0.03em] text-[#1d1d1f]">
            燎原 AI：你的<br className="sm:hidden" /> AI 电商视觉专家
          </h1>
          <p className="text-[18px] md:text-[20px] text-[#86868b] mb-14 max-w-2xl mx-auto leading-[1.7] tracking-[-0.01em]">
            让小团队也有大牌设计力。支持智能全品类商品图和风格复刻，让您的商品脱颖而出。
          </p>
          <Link href="/workspace/create">
            <Button className="bg-[#1d1d1f] text-white hover:bg-[#333] rounded-full px-12 h-[52px] text-[16px] font-medium cursor-pointer transition-all hover:shadow-lg hover:shadow-black/10">
              免费试用
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      <section className="px-4 pb-24">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {showcaseItems.map((item, i) => (
              <div
                key={i}
                onClick={() => openLightbox(i)}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer border border-black/[0.04] hover:-translate-y-0.5"
              >
                <div className="relative h-72 overflow-hidden">
                  <div className="absolute inset-0 transition-transform duration-[1500ms] ease-linear group-hover:-translate-y-[calc(100%-18rem)]">
                    <Image
                      src={item.src}
                      alt={item.title}
                      width={400}
                      height={800}
                      loading="lazy"
                      className="w-full h-auto object-cover"
                    />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white/90 to-transparent pt-8 pb-2.5 px-3">
                    <p className="text-[14px] font-semibold text-[#1d1d1f] truncate">{item.title}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-black/5 py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-2">
            <div className="h-6 w-6 rounded-md bg-black flex items-center justify-center">
              <Sparkles className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-[14px] font-semibold text-[#1d1d1f]">燎原 AI</span>
          </div>
          <p className="text-[14px] text-[#86868b]">© 2026 燎原 AI. All rights reserved.</p>
        </div>
      </footer>

      {lightboxIndex !== null && (
        <Lightbox
          items={showcaseItems}
          currentIndex={lightboxIndex}
          onClose={closeLightbox}
          onPrev={goPrev}
          onNext={goNext}
        />
      )}
    </div>
  );
}
