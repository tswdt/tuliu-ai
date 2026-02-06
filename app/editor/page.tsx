"use client";

import React, { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';

export default function EditorPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<fabric.Canvas | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      isDrawingMode: true,
      width: 800,
      height: 600,
    });

    canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
    canvas.freeDrawingBrush.width = 20;
    canvas.freeDrawingBrush.color = "rgba(255, 255, 255, 0.5)";

    setFabricCanvas(canvas);
    return () => canvas.dispose();
  }, []);

  const exportMask = () => {
    if (!fabricCanvas) return;
    // 导出 Mask 逻辑：将笔触渲染为黑白遮罩
    const maskData = fabricCanvas.toDataURL({ format: 'png' });
    console.log("Mask Exported", maskData);
  };

  return (
    <div className="flex flex-col items-center p-8 bg-zinc-950 min-h-screen text-white">
      <h1 className="text-2xl mb-4">Picset AI Editor (Fabric.js)</h1>
      <div className="border border-zinc-800 rounded-lg overflow-hidden bg-zinc-900">
        <canvas ref={canvasRef} />
      </div>
      <div className="mt-4 space-x-4">
        <button onClick={() => fabricCanvas?.clear()} className="px-4 py-2 bg-zinc-800 rounded">清除</button>
        <button onClick={exportMask} className="px-4 py-2 bg-blue-600 rounded">生成遮罩</button>
      </div>
    </div>
  );
}
