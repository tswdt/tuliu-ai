
"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ImageComparisonProps {
  beforeSrc: string;
  afterSrc: string;
  width?: number;
  height?: number;
  className?: string;
}

export function ImageComparison({
  beforeSrc,
  afterSrc,
  width = 600,
  height = 400,
  className,
}: ImageComparisonProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSliderMove = (event: React.MouseEvent | React.TouchEvent) => {
    if (!containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    let clientX: number;

    if (
      "touches" in event &&
      event.touches &&
      event.touches.length > 0
    ) {
      clientX = event.touches[0].clientX;
    } else if ("clientX" in event) {
      clientX = event.clientX;
    } else {
      return;
    }

    let newPosition = ((clientX - containerRect.left) / containerRect.width) * 100;
    newPosition = Math.max(0, Math.min(100, newPosition));
    setSliderPosition(newPosition);
  };

  const handleSliderMoveNative = (event: MouseEvent | TouchEvent) => {
    if (!containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    let clientX: number;

    if ("touches" in event && event.touches && event.touches.length > 0) {
      clientX = event.touches[0].clientX;
    } else if ("clientX" in event) {
      clientX = (event as MouseEvent).clientX;
    } else {
      return;
    }

    let newPosition = ((clientX - containerRect.left) / containerRect.width) * 100;
    newPosition = Math.max(0, Math.min(100, newPosition));
    setSliderPosition(newPosition);
  };

  const handleMouseDown = () => {
    window.addEventListener("mousemove", handleSliderMoveNative);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseUp = () => {
    window.removeEventListener("mousemove", handleSliderMoveNative);
    window.removeEventListener("mouseup", handleMouseUp);
  };

  const handleTouchStart = () => {
    window.addEventListener("touchmove", handleSliderMoveNative);
    window.addEventListener("touchend", handleTouchEnd);
  };

  const handleTouchEnd = () => {
    window.removeEventListener("touchmove", handleSliderMoveNative);
    window.removeEventListener("touchend", handleTouchEnd);
  };

  useEffect(() => {
    // Cleanup event listeners on component unmount
    return () => {
      window.removeEventListener("mousemove", handleSliderMoveNative);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleSliderMoveNative);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative overflow-hidden rounded-lg shadow-lg group",
        className
      )}
      style={{ width: `${width}px`, height: `${height}px` }}
    >
      {/* Before Image */}
      <Image
        src={beforeSrc}
        alt="Before"
        layout="fill"
        objectFit="cover"
        className="absolute top-0 left-0 w-full h-full"
      />

      {/* After Image (clipped) */}
      <div
        className="absolute top-0 left-0 h-full overflow-hidden"
        style={{ width: `${sliderPosition}%` }}
      >
        <Image
          src={afterSrc}
          alt="After"
          layout="fill"
          objectFit="cover"
          className="absolute top-0 left-0 w-full h-full"
          style={{ left: `-${100 - sliderPosition}%` }} // Adjust position to keep it aligned
        />
      </div>

      {/* Slider Handle */}
      <div
        className="absolute top-0 h-full w-1 bg-white cursor-ew-resize z-10"
        style={{ left: `calc(${sliderPosition}% - 2px)` }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white border-2 border-gray-400 flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 9l4-4 4 4m0 6l-4 4-4-4"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
