"use client";

import { useState, useRef, useEffect } from "react";
import {
  ChevronDown,
  Settings,
  Palette,
  FileText,
  Shield,
  Wand2,
} from "lucide-react";

const platforms = [
  { id: "auto", label: "智能匹配" },
  { id: "taobao", label: "淘宝/天猫" },
  { id: "jd", label: "京东" },
  { id: "pdd", label: "拼多多" },
  { id: "douyin", label: "抖音电商" },
  { id: "xiaohongshu", label: "小红书" },
  { id: "amazon", label: "亚马逊" },
  { id: "shopify", label: "Shopify" },
  { id: "temu", label: "Temu" },
  { id: "independent", label: "独立站" },
];

const models = [
  { id: "nano-banana-2", label: "Nano Banana 2" },
  { id: "nano-banana-1", label: "Nano Banana 1" },
];

const sizePresets = [
  { id: "1:1", label: "1:1 商品主图" },
  { id: "3:4", label: "3:4 竖版详情图" },
  { id: "4:5", label: "4:5 电商图" },
  { id: "9:16", label: "9:16 抖音竖图" },
  { id: "750px", label: "750px 淘宝详情页" },
  { id: "800px", label: "800px 京东详情页" },
  { id: "a-plus", label: "亚马逊 A+ 模块" },
];

const qualities = [
  { id: "2k", label: "2K 高清" },
  { id: "1k", label: "1K 标清" },
  { id: "4k", label: "4K 超清" },
];

const languages = [
  { id: "none", label: "无文字(纯视觉)" },
  { id: "zh-cn", label: "简体中文" },
  { id: "zh-tw", label: "繁体中文" },
  { id: "en", label: "English" },
  { id: "ja", label: "日本語" },
  { id: "ko", label: "한국어" },
  { id: "de", label: "Deutsch" },
  { id: "fr", label: "Français" },
  { id: "es", label: "Español" },
  { id: "ru", label: "Русский" },
];

const outputTypeOptions = [
  { id: "main", label: "商品主图" },
  { id: "sub", label: "商品附图" },
  { id: "white-bg", label: "白底图" },
  { id: "scene", label: "场景图" },
  { id: "detail", label: "细节图" },
  { id: "selling-point", label: "卖点图" },
  { id: "params", label: "参数图" },
  { id: "size", label: "尺寸图" },
  { id: "compare", label: "对比图" },
  { id: "detail-long", label: "详情页长图" },
  { id: "a-plus", label: "亚马逊 A+ 模块" },
  { id: "video-cover", label: "短视频封面" },
];

const mainImageCounts = [
  { id: "1", label: "1 张" },
  { id: "2", label: "2 张" },
  { id: "3", label: "3 张" },
  { id: "4", label: "4 张" },
];

const subImageCounts = [
  { id: "1", label: "1 张" },
  { id: "2", label: "2 张" },
  { id: "3", label: "3 张" },
  { id: "4", label: "4 张" },
  { id: "5", label: "5 张" },
  { id: "6", label: "6 张" },
];

const detailImageCounts = [
  { id: "1", label: "1 张" },
  { id: "2", label: "2 张" },
  { id: "3", label: "3 张" },
  { id: "4", label: "4 张" },
  { id: "5", label: "5 张" },
  { id: "6", label: "6 张" },
];

const detailModuleCounts = [
  { id: "3", label: "3 模块" },
  { id: "5", label: "5 模块" },
  { id: "8", label: "8 模块" },
  { id: "12", label: "12 模块" },
];

const visualStyles = [
  { id: "minimal", label: "高级简约" },
  { id: "tech", label: "科技感" },
  { id: "luxury", label: "轻奢美妆" },
  { id: "guochao", label: "国潮风" },
  { id: "nature", label: "清新自然" },
  { id: "baby", label: "母婴温柔" },
  { id: "food", label: "食品食欲感" },
  { id: "jd-quality", label: "京东品质风" },
  { id: "taobao-convert", label: "淘宝转化风" },
  { id: "pdd-promo", label: "拼多多促销风" },
  { id: "a-plus-clean", label: "亚马逊 A+ 简洁风" },
];

const pricePositionings = [
  { id: "premium", label: "高端品质" },
  { id: "mid-range", label: "中端实用" },
  { id: "value", label: "性价比" },
  { id: "promo", label: "促销爆款" },
  { id: "gift", label: "礼品款" },
];

const postProcessingOptions = [
  { id: "remove-bg", label: "自动抠图" },
  { id: "white-bg", label: "白底图" },
  { id: "change-bg", label: "产品换背景" },
  { id: "fix-flaw", label: "瑕疵修复" },
  { id: "hd-upscale", label: "高清放大" },
  { id: "keep-subject", label: "保持主体一致" },
  { id: "text-layout", label: "文字排版优化" },
  { id: "no-watermark", label: "无水印输出" },
];

const copyIntensities = [
  { id: "restrained", label: "克制专业" },
  { id: "clear-sp", label: "卖点清晰" },
  { id: "high-convert", label: "强转化" },
  { id: "promo", label: "促销导向" },
  { id: "param-desc", label: "参数说明型" },
  { id: "xiaohongshu", label: "小红书种草型" },
  { id: "amazon-clean", label: "亚马逊简洁型" },
];

const targetAudienceOptions = [
  { id: "young-female", label: "年轻女性" },
  { id: "young-male", label: "年轻男性" },
  { id: "mom", label: "宝妈" },
  { id: "student", label: "学生" },
  { id: "office", label: "上班族" },
  { id: "middle-aged", label: "中老年" },
  { id: "pet-owner", label: "宠物主人" },
  { id: "outdoor", label: "户外人群" },
  { id: "b2b", label: "企业采购" },
  { id: "gift", label: "礼赠人群" },
  { id: "cross-border", label: "跨境买家" },
];

const usageScenarioOptions = [
  { id: "home", label: "家庭" },
  { id: "office", label: "办公室" },
  { id: "kitchen", label: "厨房" },
  { id: "bedroom", label: "卧室" },
  { id: "outdoor", label: "户外" },
  { id: "travel", label: "旅行" },
  { id: "car", label: "车载" },
  { id: "banquet", label: "宴请" },
  { id: "gift", label: "送礼" },
  { id: "fitness", label: "健身" },
  { id: "baby-care", label: "母婴护理" },
  { id: "pet-care", label: "宠物护理" },
];

const subjectConsistencyOptions = [
  { id: "normal", label: "普通保持" },
  { id: "strong", label: "较强保持" },
  { id: "strict", label: "严格保持" },
];

const subjectLockRuleOptions = [
  { id: "keep-color", label: "保持产品颜色" },
  { id: "keep-package", label: "保持产品包装" },
  { id: "keep-logo", label: "保持 Logo 不变" },
  { id: "keep-shape", label: "保持瓶身/外形不变" },
  { id: "keep-sku", label: "保持 SKU 一致" },
  { id: "no-fake-param", label: "不虚构参数" },
  { id: "no-brand-change", label: "不改变品牌元素" },
];

interface SelectProps {
  label: string;
  value: string;
  options: { id: string; label: string }[];
  onChange: (value: string) => void;
}

function Select({ label, value, options, onChange }: SelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const selectedLabel = options.find((o) => o.id === value)?.label || value;

  return (
    <div ref={ref} className="relative">
      <label className="block text-[13px] text-[#666] mb-1.5 font-medium">{label}</label>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 h-10 rounded-xl bg-white border border-[#e0e0e0] text-[13px] text-[#1d1d1f] hover:border-[#ccc] transition-colors cursor-pointer"
      >
        <span className="truncate">{selectedLabel}</span>
        <ChevronDown
          className={`h-4 w-4 text-[#999] transition-transform flex-shrink-0 ml-1 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="absolute z-50 mt-1.5 w-full bg-white border border-[#e0e0e0] rounded-xl shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150 max-h-60 overflow-y-auto">
          {options.map((opt) => (
            <button
              key={opt.id}
              onClick={() => {
                onChange(opt.id);
                setOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-[13px] transition-colors cursor-pointer hover:bg-[#f5f5f5] ${
                opt.id === value ? "text-[#1d1d1f] font-medium bg-[#f5f5f5]" : "text-[#666]"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface MultiSelectProps {
  label: string;
  options: { id: string; label: string }[];
  value: string[];
  onChange: (value: string[]) => void;
}

function MultiSelect({ label, options, value, onChange }: MultiSelectProps) {
  const toggle = (id: string) => {
    onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);
  };

  return (
    <div>
      <label className="block text-[13px] text-[#666] mb-1.5 font-medium">{label}</label>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => {
          const active = value.includes(opt.id);
          return (
            <button
              key={opt.id}
              onClick={() => toggle(opt.id)}
              className={`px-2.5 py-1.5 rounded-lg text-[12px] border transition-colors cursor-pointer ${
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
  );
}

interface CountSelectProps {
  label: string;
  value: string;
  options: { id: string; label: string }[];
  onChange: (value: string) => void;
}

function CountSelect({ label, value, options, onChange }: CountSelectProps) {
  return (
    <div>
      <label className="block text-[13px] text-[#666] mb-1.5 font-medium">{label}</label>
      <div className="flex gap-1.5">
        {options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => onChange(opt.id)}
            className={`flex-1 py-1.5 rounded-lg text-[12px] border transition-colors cursor-pointer ${
              value === opt.id
                ? "bg-[#1d1d1f] text-white border-[#1d1d1f]"
                : "bg-white text-[#666] border-[#e5e5e5] hover:border-[#ccc]"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

interface SectionProps {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function Section({ title, icon: Icon, children, defaultOpen = true }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="bg-white rounded-2xl border border-[#e5e5e5] overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-3.5 cursor-pointer hover:bg-[#fafafa] transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-[#999]" />
          <span className="text-[14px] font-semibold text-[#1d1d1f]">{title}</span>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-[#999] transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && <div className="px-5 pb-5 space-y-4">{children}</div>}
    </div>
  );
}

export interface GenerationSettingsState {
  platform: string;
  language: string;
  model: string;
  outputTypes: string[];
  mainImageCount: string;
  subImageCount: string;
  detailImageCount: string;
  detailModuleCount: string;
  sizePreset: string;
  quality: string;
  visualStyle: string;
  pricePositioning: string;
  postProcessingOptions: string[];
  copyIntensity: string;
  targetAudiences: string[];
  usageScenarios: string[];
  subjectConsistency: string;
  subjectLockRules: string[];
  detailDesc: string;
}

interface GenerationSettingsProps {
  state: GenerationSettingsState;
  setState: React.Dispatch<React.SetStateAction<GenerationSettingsState>>;
}

export default function GenerationSettings({ state, setState }: GenerationSettingsProps) {
  const update = <K extends keyof GenerationSettingsState>(
    key: K,
    value: GenerationSettingsState[K]
  ) => {
    setState((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-3">
      <Section title="基础设置" icon={Settings} defaultOpen={true}>
        <div className="grid grid-cols-2 gap-3">
          <Select
            label="目标平台"
            value={state.platform}
            options={platforms}
            onChange={(v) => update("platform", v)}
          />
          <Select
            label="目标语言"
            value={state.language}
            options={languages}
            onChange={(v) => update("language", v)}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Select
            label="模型"
            value={state.model}
            options={models}
            onChange={(v) => update("model", v)}
          />
          <Select
            label="清晰度"
            value={state.quality}
            options={qualities}
            onChange={(v) => update("quality", v)}
          />
        </div>

        <MultiSelect
          label="生成内容类型"
          options={outputTypeOptions}
          value={state.outputTypes}
          onChange={(v) => update("outputTypes", v)}
        />

        <div className="grid grid-cols-2 gap-3">
          <CountSelect
            label="主图张数"
            value={state.mainImageCount}
            options={mainImageCounts}
            onChange={(v) => update("mainImageCount", v)}
          />
          <CountSelect
            label="附图张数"
            value={state.subImageCount}
            options={subImageCounts}
            onChange={(v) => update("subImageCount", v)}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <CountSelect
            label="细节图张数"
            value={state.detailImageCount}
            options={detailImageCounts}
            onChange={(v) => update("detailImageCount", v)}
          />
          <CountSelect
            label="详情页模块数"
            value={state.detailModuleCount}
            options={detailModuleCounts}
            onChange={(v) => update("detailModuleCount", v)}
          />
        </div>

        <Select
          label="尺寸/比例"
          value={state.sizePreset}
          options={sizePresets}
          onChange={(v) => update("sizePreset", v)}
        />

        <div>
          <label className="block text-[13px] text-[#666] mb-1.5 font-medium">详情图要求</label>
          <textarea
            value={state.detailDesc}
            onChange={(e) => update("detailDesc", e.target.value)}
            placeholder="建议输入：产品名称、卖点、目标人群、目标电商平台、图片风格等"
            className="w-full h-20 px-3 py-2.5 rounded-xl bg-white border border-[#e5e5e5] text-[13px] text-[#1d1d1f] placeholder:text-[#bbb] resize-none focus:outline-none focus:border-[#ccc] transition-colors leading-[1.6]"
          />
          <div className="flex justify-end mt-1">
            <button className="inline-flex items-center gap-1 text-[12px] text-[#666] hover:text-[#1d1d1f] cursor-pointer transition-colors">
              <Wand2 className="h-3 w-3" />
              AI帮写
            </button>
          </div>
        </div>
      </Section>

      <Section title="视觉设置" icon={Palette} defaultOpen={true}>
        <Select
          label="风格"
          value={state.visualStyle}
          options={visualStyles}
          onChange={(v) => update("visualStyle", v)}
        />
        <Select
          label="价格定位"
          value={state.pricePositioning}
          options={pricePositionings}
          onChange={(v) => update("pricePositioning", v)}
        />
        <MultiSelect
          label="后期处理"
          options={postProcessingOptions}
          value={state.postProcessingOptions}
          onChange={(v) => update("postProcessingOptions", v)}
        />
      </Section>

      <Section title="文案设置" icon={FileText} defaultOpen={false}>
        <Select
          label="文案强度"
          value={state.copyIntensity}
          options={copyIntensities}
          onChange={(v) => update("copyIntensity", v)}
        />
        <MultiSelect
          label="目标人群"
          options={targetAudienceOptions}
          value={state.targetAudiences}
          onChange={(v) => update("targetAudiences", v)}
        />
        <MultiSelect
          label="使用场景"
          options={usageScenarioOptions}
          value={state.usageScenarios}
          onChange={(v) => update("usageScenarios", v)}
        />
      </Section>

      <Section title="安全设置" icon={Shield} defaultOpen={false}>
        <Select
          label="商品主体一致性"
          value={state.subjectConsistency}
          options={subjectConsistencyOptions}
          onChange={(v) => update("subjectConsistency", v)}
        />
        <MultiSelect
          label="主体锁定规则"
          options={subjectLockRuleOptions}
          value={state.subjectLockRules}
          onChange={(v) => update("subjectLockRules", v)}
        />
      </Section>
    </div>
  );
}
