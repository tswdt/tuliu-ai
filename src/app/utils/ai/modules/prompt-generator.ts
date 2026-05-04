import { logger } from '@/app/utils/logger';
import { generatePrompt, PromptResult } from '@/lib/prompt-engine';
import { StructuredProduct } from './structurer';
import { GenerationStrategy, ContentTypeConfig } from './strategy-matcher';

export interface PromptGenInput {
  product: StructuredProduct;
  strategy: GenerationStrategy;
}

export interface PromptGenOutput {
  prompts: PromptResult[];
  totalCount: number;
}

export function generatePrompts(input: PromptGenInput): PromptGenOutput {
  logger.info('[模块4-提示词生成] 开始生成', {
    contentTypes: input.strategy.contentTypes.map(ct => ct.label),
  });

  const { product, strategy } = input;
  const prompts: PromptResult[] = [];

  for (const contentType of strategy.contentTypes) {
    const count = Math.min(contentType.count, getMaxCountForType(contentType, strategy));

    for (let i = 0; i < count; i++) {
      const prompt = generatePrompt({
        analysis: {
          productName: product.productName,
          category: product.category,
          color: product.color,
          material: product.material,
          style: product.style,
          features: product.features,
          suggestedSellingPoints: product.sellingPoints,
          packaging: product.packaging,
          usageScenarios: product.usageScenarios,
          brandName: product.brandName,
          targetAudience: product.targetAudience,
          rawDescription: '',
        },
        platform: strategy.platform.id,
        style: strategy.styleId,
        sellingPoints: product.sellingPoints,
        imageType: mapImageType(contentType.imageType),
        imageIndex: i,
      });

      prompts.push({
        ...prompt,
        imageSize: contentType.size,
      });
    }
  }

  logger.info('[模块4-提示词生成] 完成', { totalCount: prompts.length });
  return { prompts, totalCount: prompts.length };
}

function getMaxCountForType(contentType: ContentTypeConfig, strategy: GenerationStrategy): number {
  switch (contentType.imageType) {
    case 'MAIN_IMAGE': return strategy.platform.maxMainImages;
    case 'SCENE_IMAGE': return strategy.platform.maxSceneImages;
    case 'DETAIL_IMAGE': return strategy.platform.maxDetailImages;
    case 'SELLING_POINT_IMAGE': return strategy.platform.maxSellingPointImages;
    default: return 1;
  }
}

function mapImageType(imageType: string): 'MAIN_IMAGE' | 'SCENE_IMAGE' | 'DETAIL_IMAGE' | 'SELLING_POINT_IMAGE' | 'DETAIL_PAGE' {
  switch (imageType) {
    case 'MAIN_IMAGE':
    case 'WHITE_IMAGE':
    case 'COVER_IMAGE':
    case 'PROMO_IMAGE':
      return 'MAIN_IMAGE';
    case 'SCENE_IMAGE':
      return 'SCENE_IMAGE';
    case 'DETAIL_IMAGE':
    case 'SIZE_IMAGE':
      return 'DETAIL_IMAGE';
    case 'SELLING_POINT_IMAGE':
    case 'PARAMS_IMAGE':
    case 'A_PLUS_MODULE':
      return 'SELLING_POINT_IMAGE';
    case 'DETAIL_PAGE':
    default:
      return 'DETAIL_PAGE';
  }
}
