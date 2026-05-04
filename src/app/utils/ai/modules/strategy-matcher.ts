import { logger } from '@/app/utils/logger';
import { getPlatformRule, getCategoryRule, PlatformRule, CategoryRule } from '@/lib/platform-rules';
import { StructuredProduct } from './structurer';

export interface StrategyInput {
  product: StructuredProduct;
  platformId: string;
  styleId: string;
  contentTypes: string[];
}

export interface GenerationStrategy {
  platform: PlatformRule;
  category: CategoryRule;
  contentTypes: ContentTypeConfig[];
  styleId: string;
  totalPages: number;
}

export interface ContentTypeConfig {
  id: string;
  label: string;
  count: number;
  imageType: 'MAIN_IMAGE' | 'SCENE_IMAGE' | 'DETAIL_IMAGE' | 'SELLING_POINT_IMAGE' | 'DETAIL_PAGE' | 'WHITE_IMAGE' | 'PARAMS_IMAGE' | 'PROMO_IMAGE' | 'COVER_IMAGE' | 'SIZE_IMAGE' | 'A_PLUS_MODULE';
  size: string;
  isDefault: boolean;
}

const CONTENT_TYPE_MAP: Record<string, { label: string; imageType: ContentTypeConfig['imageType']; sizeKey: 'main' | 'detail' }> = {
  main: { label: '主图', imageType: 'MAIN_IMAGE', sizeKey: 'main' },
  sub: { label: '附图', imageType: 'MAIN_IMAGE', sizeKey: 'main' },
  white: { label: '白底图', imageType: 'WHITE_IMAGE', sizeKey: 'main' },
  scene: { label: '场景图', imageType: 'SCENE_IMAGE', sizeKey: 'detail' },
  detail: { label: '细节图', imageType: 'DETAIL_IMAGE', sizeKey: 'detail' },
  selling: { label: '卖点图', imageType: 'SELLING_POINT_IMAGE', sizeKey: 'detail' },
  params: { label: '参数图', imageType: 'PARAMS_IMAGE', sizeKey: 'detail' },
  long: { label: '详情页长图', imageType: 'DETAIL_PAGE', sizeKey: 'detail' },
  promo: { label: '促销图', imageType: 'PROMO_IMAGE', sizeKey: 'main' },
  cover: { label: '封面图', imageType: 'COVER_IMAGE', sizeKey: 'main' },
  size: { label: '尺寸图', imageType: 'SIZE_IMAGE', sizeKey: 'detail' },
  'a-plus': { label: 'A+模块', imageType: 'A_PLUS_MODULE', sizeKey: 'detail' },
};

const PLATFORM_DEFAULT_CONTENT: Record<string, string[]> = {
  taobao: ['main', 'sub', 'selling', 'detail', 'params', 'long'],
  jd: ['main', 'params', 'detail', 'scene'],
  pdd: ['main', 'promo', 'selling', 'sub'],
  douyin: ['main', 'scene', 'cover', 'selling'],
  amazon: ['white', 'sub', 'size', 'scene', 'a-plus'],
  shopify: ['main', 'scene', 'detail', 'selling', 'long'],
};

function getImageSize(platformId: string, sizeKey: 'main' | 'detail'): string {
  const rule = getPlatformRule(platformId.toUpperCase());
  const size = sizeKey === 'main' ? rule.mainImageSize : rule.detailImageSize;
  const ratio = size.w / size.h;
  if (ratio >= 1.2) return '1280*720';
  if (ratio <= 0.8) return '720*1280';
  return '1024*1024';
}

function getContentTypeCount(platform: PlatformRule, imageType: string): number {
  switch (imageType) {
    case 'MAIN_IMAGE': return platform.maxMainImages;
    case 'SCENE_IMAGE': return platform.maxSceneImages;
    case 'DETAIL_IMAGE': return platform.maxDetailImages;
    case 'SELLING_POINT_IMAGE': return platform.maxSellingPointImages;
    default: return 1;
  }
}

export function matchStrategy(input: StrategyInput): GenerationStrategy {
  logger.info('[模块3-平台策略匹配] 开始匹配', { platformId: input.platformId, styleId: input.styleId });

  const platform = getPlatformRule(input.platformId.toUpperCase());
  const category = getCategoryRule(input.product.category);

  const defaultTypes = PLATFORM_DEFAULT_CONTENT[input.platformId] || PLATFORM_DEFAULT_CONTENT.taobao;
  const effectiveContentTypes = input.contentTypes.length > 0 ? input.contentTypes : defaultTypes;

  const contentTypes: ContentTypeConfig[] = effectiveContentTypes.map((typeId) => {
    const mapping = CONTENT_TYPE_MAP[typeId];
    if (!mapping) return null;
    return {
      id: typeId,
      label: mapping.label,
      count: getContentTypeCount(platform, mapping.imageType),
      imageType: mapping.imageType,
      size: getImageSize(input.platformId, mapping.sizeKey),
      isDefault: defaultTypes.includes(typeId),
    };
  }).filter(Boolean) as ContentTypeConfig[];

  const totalPages = contentTypes.reduce((sum, ct) => sum + ct.count, 0);

  const strategy: GenerationStrategy = {
    platform,
    category,
    contentTypes,
    styleId: input.styleId,
    totalPages,
  };

  logger.info('[模块3-平台策略匹配] 匹配完成', {
    platform: platform.name,
    contentCount: contentTypes.length,
    totalPages,
  });

  return strategy;
}
