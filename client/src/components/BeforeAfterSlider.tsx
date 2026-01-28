import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface BeforeAfterSliderProps {
  before: string;
  after: string;
  title?: string;
}

export default function BeforeAfterSlider({ before, after, title }: BeforeAfterSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    setSliderPosition(Math.max(0, Math.min(100, percentage)));
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    setSliderPosition(Math.max(0, Math.min(100, percentage)));
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-square overflow-hidden rounded-lg cursor-col-resize bg-black"
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
    >
      {/* After 图片 (背景) */}
      <img
        src={after}
        alt="After"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Before 图片 (前景) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${sliderPosition}%` }}
      >
        <img
          src={before}
          alt="Before"
          className="absolute inset-0 w-screen h-full object-cover"
          style={{ width: `${(100 / sliderPosition) * 100}%` }}
        />
      </div>

      {/* 滑块线 */}
      <motion.div
        className="absolute top-0 bottom-0 w-1 bg-gradient-to-b from-neon-cyan via-neon-pink to-neon-cyan"
        style={{ left: `${sliderPosition}%` }}
        animate={{
          boxShadow: [
            '0 0 10px rgba(0, 245, 255, 0.5)',
            '0 0 20px rgba(0, 245, 255, 0.8)',
            '0 0 10px rgba(0, 245, 255, 0.5)',
          ],
        }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      {/* 滑块把手 */}
      <motion.div
        className="absolute top-1/2 -translate-y-1/2 w-12 h-12 bg-gradient-to-r from-neon-cyan to-neon-pink rounded-full flex items-center justify-center shadow-lg"
        style={{ left: `${sliderPosition}%`, x: '-50%' }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="flex gap-1">
          <div className="w-0.5 h-4 bg-black rounded" />
          <div className="w-0.5 h-4 bg-black rounded" />
        </div>
      </motion.div>

      {/* 标签 */}
      <div className="absolute top-4 left-4 px-3 py-1 bg-black/60 rounded text-xs font-bold text-neon-cyan">
        原图
      </div>
      <div className="absolute top-4 right-4 px-3 py-1 bg-black/60 rounded text-xs font-bold text-neon-pink">
        AI 生成
      </div>

      {/* 标题 */}
      {title && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/60 rounded text-sm font-bold text-white">
          {title}
        </div>
      )}
    </div>
  );
}
