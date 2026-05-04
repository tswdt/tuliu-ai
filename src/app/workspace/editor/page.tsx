"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Save,
  Undo2,
  Redo2,
  RefreshCw,
  Download,
  ZoomIn,
  ZoomOut,
  Type,
  Image as ImageIcon,
  Bold,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Crop,
  Move,
  Replace,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Minus,
  CheckCircle2,
  Loader2,
  MousePointer2,
  Hand,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface PageItem {
  id: string;
  label: string;
  type: "main" | "sub" | "scene" | "detail" | "params" | "long";
  gradient: string;
  elements: EditorElement[];
}

interface EditorElement {
  id: string;
  kind: "text" | "image";
  x: number;
  y: number;
  width: number;
  height: number;
  content: string;
  fontSize?: number;
  fontColor?: string;
  bold?: boolean;
  align?: "left" | "center" | "right";
}

const initialPages: PageItem[] = [
  {
    id: "p1",
    label: "主图",
    type: "main",
    gradient: "from-violet-400 to-indigo-400",
    elements: [
      { id: "e1", kind: "image", x: 0, y: 0, width: 400, height: 400, content: "产品主图" },
      { id: "e2", kind: "text", x: 20, y: 340, width: 360, height: 40, content: "纯棉圆领短袖T恤", fontSize: 24, fontColor: "#ffffff", bold: true, align: "center" },
    ],
  },
  {
    id: "p2",
    label: "附图",
    type: "sub",
    gradient: "from-blue-400 to-cyan-400",
    elements: [
      { id: "e3", kind: "image", x: 0, y: 0, width: 400, height: 400, content: "多角度展示" },
      { id: "e4", kind: "text", x: 20, y: 340, width: 360, height: 30, content: "多色可选 · 百搭圆领", fontSize: 18, fontColor: "#ffffff", bold: false, align: "center" },
    ],
  },
  {
    id: "p3",
    label: "场景图",
    type: "scene",
    gradient: "from-emerald-400 to-teal-400",
    elements: [
      { id: "e5", kind: "image", x: 0, y: 0, width: 400, height: 400, content: "使用场景" },
      { id: "e6", kind: "text", x: 20, y: 340, width: 360, height: 30, content: "日常休闲 · 运动健身 · 居家舒适", fontSize: 16, fontColor: "#ffffff", bold: false, align: "center" },
    ],
  },
  {
    id: "p4",
    label: "细节图",
    type: "detail",
    gradient: "from-pink-400 to-rose-400",
    elements: [
      { id: "e7", kind: "image", x: 0, y: 0, width: 400, height: 400, content: "细节展示" },
      { id: "e8", kind: "text", x: 20, y: 340, width: 360, height: 30, content: "100%纯棉 · 亲肤柔软", fontSize: 18, fontColor: "#ffffff", bold: true, align: "center" },
    ],
  },
  {
    id: "p5",
    label: "参数图",
    type: "params",
    gradient: "from-amber-400 to-orange-400",
    elements: [
      { id: "e9", kind: "image", x: 0, y: 0, width: 400, height: 400, content: "参数展示" },
      { id: "e10", kind: "text", x: 20, y: 340, width: 360, height: 30, content: "S / M / L / XL | 180g", fontSize: 16, fontColor: "#ffffff", bold: false, align: "center" },
    ],
  },
  {
    id: "p6",
    label: "详情页长图",
    type: "long",
    gradient: "from-gray-400 to-slate-400",
    elements: [
      { id: "e11", kind: "image", x: 0, y: 0, width: 400, height: 200, content: "详情页头部" },
      { id: "e12", kind: "text", x: 20, y: 220, width: 360, height: 40, content: "纯棉圆领短袖T恤", fontSize: 24, fontColor: "#1f2937", bold: true, align: "left" },
      { id: "e13", kind: "text", x: 20, y: 270, width: 360, height: 60, content: "纯棉透气、圆领百搭、多色可选、亲肤柔软。适合日常休闲、运动健身等多种场景。", fontSize: 14, fontColor: "#6b7280", bold: false, align: "left" },
      { id: "e14", kind: "image", x: 0, y: 350, width: 400, height: 200, content: "卖点展示" },
      { id: "e15", kind: "image", x: 0, y: 570, width: 400, height: 200, content: "细节展示" },
    ],
  },
];

export default function EditorPage() {
  const [pages, setPages] = useState<PageItem[]>(initialPages);
  const [activePageId, setActivePageId] = useState("p1");
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(75);
  const [tool, setTool] = useState<"select" | "hand">("select");
  const [isSaving, setIsSaving] = useState(false);
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);

  const activePage = pages.find((p) => p.id === activePageId)!;
  const selectedElement = activePage?.elements.find((e) => e.id === selectedElementId);

  const updateElement = (elementId: string, updates: Partial<EditorElement>) => {
    setPages(pages.map((p) => {
      if (p.id !== activePageId) return p;
      return {
        ...p,
        elements: p.elements.map((e) =>
          e.id === elementId ? { ...e, ...updates } : e
        ),
      };
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 1000));
    setIsSaving(false);
  };

  const canvasWidth = activePage?.type === "long" ? 790 : 800;
  const canvasHeight = activePage?.type === "long" ? 800 : 800;

  return (
    <div className="flex flex-col h-[calc(100vh-56px)] bg-[#1e1e2e]">
      <div className="flex items-center justify-between px-3 h-11 bg-[#252536] border-b border-[#333350] flex-shrink-0">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-[#333350] h-8 px-2" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="h-4 w-px bg-[#444460] mx-1" />
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-[#333350] h-8 px-2" onClick={handleSave}>
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-[#333350] h-8 px-2">
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-[#333350] h-8 px-2">
            <Redo2 className="h-4 w-4" />
          </Button>
          <div className="h-4 w-px bg-[#444460] mx-1" />
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-[#333350] h-8 px-2 text-xs gap-1">
            <RefreshCw className="h-3.5 w-3.5" />
            重新生成
          </Button>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-500 mr-2">纯棉休闲T恤 · 淘宝</span>
          <Button size="sm" className="bg-violet-600 hover:bg-violet-700 text-white h-8 px-3 text-xs">
            <Download className="h-3.5 w-3.5 mr-1" />
            导出
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className={`${leftCollapsed ? "w-8" : "w-44"} bg-[#252536] border-r border-[#333350] flex flex-col flex-shrink-0 transition-all`}>
          <div className="flex items-center justify-between px-2 h-9 border-b border-[#333350]">
            {!leftCollapsed && <span className="text-[11px] font-medium text-gray-400 uppercase">页面</span>}
            <button
              onClick={() => setLeftCollapsed(!leftCollapsed)}
              className="h-6 w-6 rounded flex items-center justify-center text-gray-500 hover:text-white hover:bg-[#333350]"
            >
              {leftCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
            </button>
          </div>
          {!leftCollapsed && (
            <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
              {pages.map((page, i) => (
                <div
                  key={page.id}
                  onClick={() => { setActivePageId(page.id); setSelectedElementId(null); }}
                  className={`rounded-lg overflow-hidden cursor-pointer transition-all ${
                    activePageId === page.id
                      ? "ring-2 ring-violet-500 ring-offset-1 ring-offset-[#252536]"
                      : "hover:ring-1 hover:ring-gray-600"
                  }`}
                >
                  <div className={`h-20 bg-gradient-to-br ${page.gradient} flex items-center justify-center relative`}>
                    <span className="text-white/70 text-xs font-medium">{page.label}</span>
                    <span className="absolute top-1 left-1.5 text-[10px] text-white/50">{i + 1}</span>
                  </div>
                  <div className="bg-[#2a2a40] px-2 py-1.5">
                    <span className="text-[11px] text-gray-400">{page.label}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-auto flex items-center justify-center bg-[#1a1a2e] relative">
          <div className="absolute top-3 left-3 flex items-center gap-1 z-10">
            <button
              onClick={() => setTool("select")}
              className={`h-8 w-8 rounded-md flex items-center justify-center transition-colors ${
                tool === "select" ? "bg-violet-600 text-white" : "bg-[#252536] text-gray-400 hover:text-white"
              }`}
            >
              <MousePointer2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setTool("hand")}
              className={`h-8 w-8 rounded-md flex items-center justify-center transition-colors ${
                tool === "hand" ? "bg-violet-600 text-white" : "bg-[#252536] text-gray-400 hover:text-white"
              }`}
            >
              <Hand className="h-4 w-4" />
            </button>
          </div>

          <div
            style={{ transform: `scale(${zoom / 100})`, transformOrigin: "center center" }}
            className="bg-white shadow-2xl transition-transform"
          >
            <div
              className="relative"
              style={{ width: canvasWidth, height: canvasHeight }}
              onClick={() => setSelectedElementId(null)}
            >
              {activePage?.elements.map((el) => (
                <div
                  key={el.id}
                  className={`absolute cursor-move ${
                    selectedElementId === el.id
                      ? "ring-2 ring-violet-500 ring-offset-0"
                      : "hover:ring-1 hover:ring-violet-300"
                  }`}
                  style={{
                    left: el.x,
                    top: el.y,
                    width: el.width,
                    height: el.height,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedElementId(el.id);
                  }}
                >
                  {el.kind === "image" ? (
                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center rounded">
                      <div className="text-center">
                        <ImageIcon className="h-6 w-6 text-gray-300 mx-auto mb-1" />
                        <span className="text-xs text-gray-400">{el.content}</span>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="w-full h-full flex items-center px-2"
                      style={{
                        fontSize: `${(el.fontSize || 14) * 0.8}px`,
                        color: el.fontColor || "#1f2937",
                        fontWeight: el.bold ? "bold" : "normal",
                        textAlign: el.align || "left",
                        lineHeight: 1.4,
                      }}
                    >
                      {el.content}
                    </div>
                  )}
                  {selectedElementId === el.id && (
                    <>
                      <div className="absolute -top-1 -left-1 h-2.5 w-2.5 bg-violet-500 rounded-full cursor-nw-resize" />
                      <div className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-violet-500 rounded-full cursor-ne-resize" />
                      <div className="absolute -bottom-1 -left-1 h-2.5 w-2.5 bg-violet-500 rounded-full cursor-sw-resize" />
                      <div className="absolute -bottom-1 -right-1 h-2.5 w-2.5 bg-violet-500 rounded-full cursor-se-resize" />
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={`${rightCollapsed ? "w-8" : "w-56"} bg-[#252536] border-l border-[#333350] flex flex-col flex-shrink-0 transition-all`}>
          <div className="flex items-center justify-between px-2 h-9 border-b border-[#333350]">
            {!rightCollapsed && <span className="text-[11px] font-medium text-gray-400 uppercase">属性</span>}
            <button
              onClick={() => setRightCollapsed(!rightCollapsed)}
              className="h-6 w-6 rounded flex items-center justify-center text-gray-500 hover:text-white hover:bg-[#333350]"
            >
              {rightCollapsed ? <ChevronLeft className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            </button>
          </div>
          {!rightCollapsed && (
            <div className="flex-1 overflow-y-auto p-3">
              {selectedElement ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    {selectedElement.kind === "text" ? <Type className="h-3.5 w-3.5" /> : <ImageIcon className="h-3.5 w-3.5" />}
                    <span>{selectedElement.kind === "text" ? "文字元素" : "图片元素"}</span>
                  </div>

                  {selectedElement.kind === "text" && (
                    <>
                      <div>
                        <label className="text-[11px] text-gray-500 mb-1.5 block">文案内容</label>
                        <Textarea
                          value={selectedElement.content}
                          onChange={(e) => updateElement(selectedElement.id, { content: e.target.value })}
                          className="bg-[#1e1e2e] border-[#444460] text-gray-200 text-xs min-h-[60px] focus:ring-violet-500 resize-none"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-gray-500 mb-1.5 block">字体大小</label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={selectedElement.fontSize || 14}
                            onChange={(e) => updateElement(selectedElement.id, { fontSize: Number(e.target.value) })}
                            className="bg-[#1e1e2e] border-[#444460] text-gray-200 text-xs h-8 w-20 focus:ring-violet-500"
                          />
                          <span className="text-[11px] text-gray-500">px</span>
                        </div>
                      </div>
                      <div>
                        <label className="text-[11px] text-gray-500 mb-1.5 block">字体颜色</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={selectedElement.fontColor || "#1f2937"}
                            onChange={(e) => updateElement(selectedElement.id, { fontColor: e.target.value })}
                            className="h-8 w-8 rounded border border-[#444460] cursor-pointer bg-transparent"
                          />
                          <Input
                            value={selectedElement.fontColor || "#1f2937"}
                            onChange={(e) => updateElement(selectedElement.id, { fontColor: e.target.value })}
                            className="bg-[#1e1e2e] border-[#444460] text-gray-200 text-xs h-8 flex-1 focus:ring-violet-500"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[11px] text-gray-500 mb-1.5 block">加粗</label>
                        <button
                          onClick={() => updateElement(selectedElement.id, { bold: !selectedElement.bold })}
                          className={`h-8 w-8 rounded-md flex items-center justify-center transition-colors ${
                            selectedElement.bold ? "bg-violet-600 text-white" : "bg-[#1e1e2e] text-gray-400 hover:text-white border border-[#444460]"
                          }`}
                        >
                          <Bold className="h-4 w-4" />
                        </button>
                      </div>
                      <div>
                        <label className="text-[11px] text-gray-500 mb-1.5 block">对齐方式</label>
                        <div className="flex gap-1">
                          {[
                            { value: "left" as const, icon: AlignLeft },
                            { value: "center" as const, icon: AlignCenter },
                            { value: "right" as const, icon: AlignRight },
                          ].map((a) => (
                            <button
                              key={a.value}
                              onClick={() => updateElement(selectedElement.id, { align: a.value })}
                              className={`h-8 w-8 rounded-md flex items-center justify-center transition-colors ${
                                selectedElement.align === a.value
                                  ? "bg-violet-600 text-white"
                                  : "bg-[#1e1e2e] text-gray-400 hover:text-white border border-[#444460]"
                              }`}
                            >
                              <a.icon className="h-4 w-4" />
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {selectedElement.kind === "image" && (
                    <>
                      <div>
                        <label className="text-[11px] text-gray-500 mb-1.5 block">图片操作</label>
                        <div className="space-y-1.5">
                          <button className="w-full flex items-center gap-2 px-3 py-2 rounded-md bg-[#1e1e2e] border border-[#444460] text-xs text-gray-300 hover:border-violet-500 hover:text-violet-400 transition-colors">
                            <Replace className="h-3.5 w-3.5" />
                            替换图片
                          </button>
                          <button className="w-full flex items-center gap-2 px-3 py-2 rounded-md bg-[#1e1e2e] border border-[#444460] text-xs text-gray-300 hover:border-violet-500 hover:text-violet-400 transition-colors">
                            <Crop className="h-3.5 w-3.5" />
                            裁剪
                          </button>
                          <button className="w-full flex items-center gap-2 px-3 py-2 rounded-md bg-[#1e1e2e] border border-[#444460] text-xs text-gray-300 hover:border-violet-500 hover:text-violet-400 transition-colors">
                            <Move className="h-3.5 w-3.5" />
                            调整位置
                          </button>
                          <button className="w-full flex items-center gap-2 px-3 py-2 rounded-md bg-violet-600/20 border border-violet-500/30 text-xs text-violet-400 hover:bg-violet-600/30 transition-colors">
                            <Sparkles className="h-3.5 w-3.5" />
                            重新生成这张图
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="text-[11px] text-gray-500 mb-1.5 block">位置</label>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-[10px] text-gray-500">X</span>
                            <Input
                              type="number"
                              value={selectedElement.x}
                              onChange={(e) => updateElement(selectedElement.id, { x: Number(e.target.value) })}
                              className="bg-[#1e1e2e] border-[#444460] text-gray-200 text-xs h-7 focus:ring-violet-500"
                            />
                          </div>
                          <div>
                            <span className="text-[10px] text-gray-500">Y</span>
                            <Input
                              type="number"
                              value={selectedElement.y}
                              onChange={(e) => updateElement(selectedElement.id, { y: Number(e.target.value) })}
                              className="bg-[#1e1e2e] border-[#444460] text-gray-200 text-xs h-7 focus:ring-violet-500"
                            />
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="text-[11px] text-gray-500 mb-1.5 block">尺寸</label>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-[10px] text-gray-500">宽</span>
                            <Input
                              type="number"
                              value={selectedElement.width}
                              onChange={(e) => updateElement(selectedElement.id, { width: Number(e.target.value) })}
                              className="bg-[#1e1e2e] border-[#444460] text-gray-200 text-xs h-7 focus:ring-violet-500"
                            />
                          </div>
                          <div>
                            <span className="text-[10px] text-gray-500">高</span>
                            <Input
                              type="number"
                              value={selectedElement.height}
                              onChange={(e) => updateElement(selectedElement.id, { height: Number(e.target.value) })}
                              className="bg-[#1e1e2e] border-[#444460] text-gray-200 text-xs h-7 focus:ring-violet-500"
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="text-center py-10">
                  <MousePointer2 className="h-6 w-6 text-gray-600 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">点击画布上的元素</p>
                  <p className="text-xs text-gray-600">查看和编辑属性</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between px-4 h-8 bg-[#252536] border-t border-[#333350] flex-shrink-0">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-3 w-3 text-green-500" />
          <span className="text-[11px] text-gray-500">所有任务已完成</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom((z) => Math.max(25, z - 10))}
            className="h-5 w-5 rounded flex items-center justify-center text-gray-500 hover:text-white hover:bg-[#333350]"
          >
            <ZoomOut className="h-3 w-3" />
          </button>
          <span className="text-[11px] text-gray-400 w-8 text-center">{zoom}%</span>
          <button
            onClick={() => setZoom((z) => Math.min(200, z + 10))}
            className="h-5 w-5 rounded flex items-center justify-center text-gray-500 hover:text-white hover:bg-[#333350]"
          >
            <ZoomIn className="h-3 w-3" />
          </button>
          <div className="h-3 w-px bg-[#444460] mx-1" />
          <span className="text-[11px] text-gray-500">
            {activePage?.type === "long" ? "790 × auto" : `${canvasWidth} × ${canvasHeight}`}
          </span>
        </div>
      </div>
    </div>
  );
}
