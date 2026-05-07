"use client";

import { Sparkles, Coins } from "lucide-react";
import type { GenerationSettingsState } from "./generation-settings";

interface ImageItem {
  file: File;
  preview: string;
}

interface PreviewSummaryProps {
  productImages: ImageItem[];
  competitorImages: ImageItem[];
  competitorReferenceModes: string[];
  settings: GenerationSettingsState;
}

const outputTypeLabels: Record<string, string> = {
  main: "商品主图",
  sub: "商品附图",
  "white-bg": "白底图",
  scene: "场景图",
  detail: "细节图",
  "selling-point": "卖点图",
  params: "参数图",
  size: "尺寸图",
  compare: "对比图",
  "detail-long": "详情页长图",
  "a-plus": "亚马逊 A+ 模块",
  "video-cover": "短视频封面",
};

const platformLabels: Record<string, string> = {
  auto: "智能匹配",
  taobao: "淘宝/天猫",
  jd: "京东",
  pdd: "拼多多",
  douyin: "抖音电商",
  xiaohongshu: "小红书",
  amazon: "亚马逊",
  shopify: "Shopify",
  temu: "Temu",
  independent: "独立站",
};

const languageLabels: Record<string, string> = {
  none: "无文字(纯视觉)",
  "zh-cn": "简体中文",
  "zh-tw": "繁体中文",
  en: "English",
  ja: "日本語",
  ko: "한국어",
  de: "Deutsch",
  fr: "Français",
  es: "Español",
  ru: "Русский",
};

const visualStyleLabels: Record<string, string> = {
  minimal: "高级简约",
  tech: "科技感",
  luxury: "轻奢美妆",
  guochao: "国潮风",
  nature: "清新自然",
  baby: "母婴温柔",
  food: "食品食欲感",
  "jd-quality": "京东品质风",
  "taobao-convert": "淘宝转化风",
  "pdd-promo": "拼多多促销风",
  "a-plus-clean": "亚马逊 A+ 简洁风",
};

const pricePositioningLabels: Record<string, string> = {
  premium: "高端品质",
  "mid-range": "中端实用",
  value: "性价比",
  promo: "促销爆款",
  gift: "礼品款",
};

const copyIntensityLabels: Record<string, string> = {
  restrained: "克制专业",
  "clear-sp": "卖点清晰",
  "high-convert": "强转化",
  promo: "促销导向",
  "param-desc": "参数说明型",
  xiaohongshu: "小红书种草型",
  "amazon-clean": "亚马逊简洁型",
};

const subjectConsistencyLabels: Record<string, string> = {
  normal: "普通保持",
  strong: "较强保持",
  strict: "严格保持",
};

const postProcessingLabels: Record<string, string> = {
  "remove-bg": "自动抠图",
  "white-bg": "白底图",
  "change-bg": "产品换背景",
  "fix-flaw": "瑕疵修复",
  "hd-upscale": "高清放大",
  "keep-subject": "保持主体一致",
  "text-layout": "文字排版优化",
  "no-watermark": "无水印输出",
};

const targetAudienceLabels: Record<string, string> = {
  "young-female": "年轻女性",
  "young-male": "年轻男性",
  mom: "宝妈",
  student: "学生",
  office: "上班族",
  "middle-aged": "中老年",
  "pet-owner": "宠物主人",
  outdoor: "户外人群",
  b2b: "企业采购",
  gift: "礼赠人群",
  "cross-border": "跨境买家",
};

const usageScenarioLabels: Record<string, string> = {
  home: "家庭",
  office: "办公室",
  kitchen: "厨房",
  bedroom: "卧室",
  outdoor: "户外",
  travel: "旅行",
  car: "车载",
  banquet: "宴请",
  gift: "送礼",
  fitness: "健身",
  "baby-care": "母婴护理",
  "pet-care": "宠物护理",
};

const subjectLockRuleLabels: Record<string, string> = {
  "keep-color": "保持产品颜色",
  "keep-package": "保持产品包装",
  "keep-logo": "保持 Logo 不变",
  "keep-shape": "保持瓶身/外形不变",
  "keep-sku": "保持 SKU 一致",
  "no-fake-param": "不虚构参数",
  "no-brand-change": "不改变品牌元素",
};

function SummaryRow({ label, value }: { label: string; value: string | React.ReactNode }) {
  return (
    <div className="flex items-start justify-between py-1.5">
      <span className="text-[12px] text-[#999] flex-shrink-0">{label}</span>
      <span className="text-[12px] text-[#1d1d1f] text-right ml-3 leading-[1.5]">{value}</span>
    </div>
  );
}

function SummaryTagList({ items, labelMap }: { items: string[]; labelMap: Record<string, string> }) {
  if (items.length === 0) return <span className="text-[12px] text-[#ccc]">未选择</span>;
  return (
    <div className="flex flex-wrap gap-1 justify-end">
      {items.map((id) => (
        <span
          key={id}
          className="inline-block px-1.5 py-0.5 rounded text-[11px] bg-[#f5f5f7] text-[#666]"
        >
          {labelMap[id] || id}
        </span>
      ))}
    </div>
  );
}

export default function PreviewSummary({
  productImages,
  competitorImages,
  settings,
}: PreviewSummaryProps) {
  const totalImages =
    parseInt(settings.mainImageCount || "0") +
    parseInt(settings.subImageCount || "0") +
    parseInt(settings.detailImageCount || "0") +
    parseInt(settings.detailModuleCount || "0");

  const estimatedCredits = totalImages * 2;

  return (
    <div className="bg-white rounded-2xl border border-[#e5e5e5] p-5 sticky top-16">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-4 w-4 text-[#999]" />
        <span className="text-[15px] font-semibold text-[#1d1d1f]">配置摘要</span>
      </div>

      <div className="divide-y divide-[#f0f0f0]">
        <div className="pb-2">
          <SummaryRow label="产品图" value={`${productImages.length} 张`} />
          <SummaryRow
            label="竞品参考图"
            value={competitorImages.length > 0 ? `${competitorImages.length} 张` : "无"}
          />
        </div>

        <div className="py-2">
          <SummaryRow
            label="目标平台"
            value={platformLabels[settings.platform] || settings.platform}
          />
          <SummaryRow
            label="输出语言"
            value={languageLabels[settings.language] || settings.language}
          />
          <SummaryRow
            label="生成内容"
            value={
              <SummaryTagList items={settings.outputTypes} labelMap={outputTypeLabels} />
            }
          />
          <SummaryRow label="预计生成" value={`${totalImages} 张/模块`} />
          <SummaryRow
            label="尺寸/比例"
            value={
              sizePresets.find((s) => s.id === settings.sizePreset)?.label || settings.sizePreset
            }
          />
          <SummaryRow
            label="清晰度"
            value={
              qualities.find((q) => q.id === settings.quality)?.label || settings.quality
            }
          />
        </div>

        <div className="py-2">
          <SummaryRow
            label="风格"
            value={visualStyleLabels[settings.visualStyle] || settings.visualStyle}
          />
          <SummaryRow
            label="价格定位"
            value={pricePositioningLabels[settings.pricePositioning] || settings.pricePositioning}
          />
          <SummaryRow
            label="后期处理"
            value={
              <SummaryTagList
                items={settings.postProcessingOptions}
                labelMap={postProcessingLabels}
              />
            }
          />
        </div>

        <div className="py-2">
          <SummaryRow
            label="文案强度"
            value={copyIntensityLabels[settings.copyIntensity] || settings.copyIntensity}
          />
          <SummaryRow
            label="目标人群"
            value={
              <SummaryTagList items={settings.targetAudiences} labelMap={targetAudienceLabels} />
            }
          />
          <SummaryRow
            label="使用场景"
            value={
              <SummaryTagList items={settings.usageScenarios} labelMap={usageScenarioLabels} />
            }
          />
        </div>

        <div className="py-2">
          <SummaryRow
            label="主体一致性"
            value={subjectConsistencyLabels[settings.subjectConsistency] || settings.subjectConsistency}
          />
          <SummaryRow
            label="锁定规则"
            value={
              <SummaryTagList items={settings.subjectLockRules} labelMap={subjectLockRuleLabels} />
            }
          />
        </div>

        <div className="pt-3">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-[#1d1d1f]">预计消耗积分</span>
            <div className="flex items-center gap-1">
              <Coins className="h-3.5 w-3.5 text-[#f59e0b]" />
              <span className="text-[15px] font-bold text-[#1d1d1f]">{estimatedCredits}</span>
            </div>
          </div>
          <p className="text-[11px] text-[#999] mt-1">* 积分为预估值，实际以生成结果为准</p>
        </div>
      </div>
    </div>
  );
}

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
