"use client";

import { useCallback } from "react";
import { Upload, X, ImageIcon, AlertCircle } from "lucide-react";

interface ImageItem {
  file: File;
  preview: string;
}

interface UploadPanelProps {
  productImages: ImageItem[];
  setProductImages: React.Dispatch<React.SetStateAction<ImageItem[]>>;
  competitorImages: ImageItem[];
  setCompetitorImages: React.Dispatch<React.SetStateAction<ImageItem[]>>;
  competitorReferenceModes: string[];
  setCompetitorReferenceModes: React.Dispatch<React.SetStateAction<string[]>>;
}

const competitorModeOptions = [
  { id: "layout", label: "只参考排版" },
  { id: "color", label: "只参考配色" },
  { id: "mood", label: "只参考氛围" },
  { id: "detail-structure", label: "参考详情页结构" },
  { id: "no-copy-text", label: "不复制竞品文案" },
  { id: "no-copy-logo", label: "不复制品牌 Logo" },
  { id: "no-copy-image", label: "不照搬竞品图片" },
];

function ImageUploader({
  images,
  setImages,
  maxCount,
  title,
  subtitle,
  icon: Icon,
}: {
  images: ImageItem[];
  setImages: React.Dispatch<React.SetStateAction<ImageItem[]>>;
  maxCount: number;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) return;
      if (file.size > 10 * 1024 * 1024) return;
      if (images.length >= maxCount) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        setImages((prev) => [...prev, { file, preview: e.target?.result as string }]);
      };
      reader.readAsDataURL(file);
    },
    [images.length, maxCount, setImages]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      Array.from(e.dataTransfer.files).forEach((f) => handleFile(f));
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-white rounded-2xl border border-[#e5e5e5] p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-[#999]" />
          <span className="text-[15px] font-semibold text-[#1d1d1f]">{title}</span>
        </div>
        <span className="text-[12px] text-[#999]">
          {images.length}/{maxCount}
        </span>
      </div>
      <p className="text-[13px] text-[#999] mb-3">{subtitle}</p>

      {images.length === 0 ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="interactive-upload border-2 border-dashed border-[#d0d0d0] rounded-2xl p-8 text-center cursor-pointer bg-[#fafafa]"
        >
          <div className="h-10 w-10 rounded-full bg-white border border-[#e5e5e5] flex items-center justify-center mx-auto mb-3">
            <Upload className="h-5 w-5 text-[#999]" />
          </div>
          <p className="text-[13px] text-[#666] mb-1 leading-[1.6]">拖拽或点击上传</p>
          <label className="mt-2 inline-block">
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                Array.from(e.target.files || []).forEach((f) => handleFile(f));
              }}
            />
            <span className="text-[13px] text-[#007aff] cursor-pointer hover:underline">选择文件</span>
          </label>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {images.map((img, i) => (
            <div
              key={i}
              className="relative group aspect-square rounded-xl overflow-hidden bg-[#f5f5f7] border border-[#e5e5e5]"
            >
              <img src={img.preview} alt="" className="w-full h-full object-cover" />
              <button
                onClick={() => removeImage(i)}
                className="absolute top-1.5 right-1.5 h-5 w-5 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          {images.length < maxCount && (
            <label className="aspect-square rounded-xl border-2 border-dashed border-[#e5e5e5] flex items-center justify-center cursor-pointer hover:border-[#ccc] transition-colors">
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  Array.from(e.target.files || []).forEach((f) => handleFile(f));
                }}
              />
              <Upload className="h-5 w-5 text-[#ccc]" />
            </label>
          )}
        </div>
      )}
    </div>
  );
}

export default function UploadPanel({
  productImages,
  setProductImages,
  competitorImages,
  setCompetitorImages,
  competitorReferenceModes,
  setCompetitorReferenceModes,
}: UploadPanelProps) {
  const toggleMode = (id: string) => {
    setCompetitorReferenceModes((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-4">
      <ImageUploader
        images={productImages}
        setImages={setProductImages}
        maxCount={6}
        title="产品图"
        subtitle="上传清晰的产品图片，建议仅上传必要的视角或 SKU 图"
        icon={ImageIcon}
      />

      <ImageUploader
        images={competitorImages}
        setImages={setCompetitorImages}
        maxCount={3}
        title="竞品参考图（可选）"
        subtitle="仅用于参考风格、排版、氛围，不直接复制"
        icon={AlertCircle}
      />

      {competitorImages.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#e5e5e5] p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="h-4 w-4 text-[#f59e0b]" />
            <span className="text-[14px] font-semibold text-[#1d1d1f]">竞品参考方式</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {competitorModeOptions.map((opt) => {
              const active = competitorReferenceModes.includes(opt.id);
              return (
                <button
                  key={opt.id}
                  onClick={() => toggleMode(opt.id)}
                  className={`px-3 py-1.5 rounded-lg text-[13px] border transition-colors cursor-pointer ${
                    active
                      ? "bg-[#1d1d1f] text-white border-[#1d1d1f]"
                      : "bg-white text-[#666] border-[#e5e5e5] hover:border-[#ccc]"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
