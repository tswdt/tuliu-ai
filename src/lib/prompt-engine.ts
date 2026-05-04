import { getPlatformRule, getCategoryRule, getImageSizeForPlatform } from './platform-rules';
import { ProductAnalysisResult } from '@/app/utils/ai/qwen-vl';

export type ImageType = 'MAIN_IMAGE' | 'SCENE_IMAGE' | 'DETAIL_IMAGE' | 'SELLING_POINT_IMAGE' | 'DETAIL_PAGE';

export interface PromptResult {
  prompt: string;
  negativePrompt: string;
  imageSize: string;
  imageType: ImageType;
}

export interface PromptEngineInput {
  analysis: ProductAnalysisResult;
  platform: string;
  style: string;
  sellingPoints: string[];
  imageType: ImageType;
  imageIndex?: number;
}

const STYLE_MODIFIERS: Record<string, string> = {
  SIMPLE: '极简构图，留白充足，干净利落，简约不简单',
  LUXURY: '高级质感，金属点缀，光影考究，奢华氛围',
  NATIONAL_TREND: '中国风元素，传统纹样，文化底蕴，国潮设计',
  TECH: '科技感光线，蓝色调，未来感，赛博朋克',
  NATURAL: '自然光线，原木绿植元素，清新自然，温暖色调',
};

const IMAGE_TYPE_MODIFIERS: Record<ImageType, (input: PromptEngineInput) => string> = {
  MAIN_IMAGE: (input) => {
    const categoryRule = getCategoryRule(input.analysis.category);
    const platformRule = getPlatformRule(input.platform);
    const rules = platformRule.mainImageRules.join('，');
    return `商品主体居中，${input.analysis.color.join('')}，完整展示商品全貌，正面视角，${rules}`;
  },
  SCENE_IMAGE: (input) => {
    const categoryRule = getCategoryRule(input.analysis.category);
    const scenarios = input.analysis.usageScenarios;
    const sceneIndex = input.imageIndex || 0;
    const scene = scenarios[sceneIndex % scenarios.length] || categoryRule.sceneKeywords[0];
    return `场景化展示，${scene}，有氛围感，生活化，自然使用状态`;
  },
  DETAIL_IMAGE: (input) => {
    const categoryRule = getCategoryRule(input.analysis.category);
    const features = input.analysis.features;
    const featureIndex = input.imageIndex || 0;
    const feature = features[featureIndex % features.length] || categoryRule.detailKeywords[0];
    return `局部特写，${feature}，细节展示，材质纹理清晰，微距摄影`;
  },
  SELLING_POINT_IMAGE: (input) => {
    const points = input.sellingPoints;
    const pointIndex = input.imageIndex || 0;
    const point = points[pointIndex % points.length] || '核心卖点';
    return `突出核心卖点"${point}"，视觉冲击力强，信息图风格，重点展示`;
  },
  DETAIL_PAGE: (input) => {
    return `详情页排版，商品展示，图文结合，信息层次分明`;
  },
};

export function generatePrompt(input: PromptEngineInput): PromptResult {
  const { analysis, platform, style, imageType } = input;
  const platformRule = getPlatformRule(platform);
  const categoryRule = getCategoryRule(analysis.category);

  const baseParts = [
    '电商商品摄影',
    analysis.productName,
    `${analysis.material}材质`,
    `${analysis.color.join('/')}颜色`,
    `${analysis.style}风格`,
  ];

  const sellingPointStr = input.sellingPoints.length > 0
    ? `核心卖点：${input.sellingPoints.join('、')}`
    : '';

  const platformMod = platformRule.promptModifiers.join('，');
  const typeMod = IMAGE_TYPE_MODIFIERS[imageType](input);
  const styleMod = STYLE_MODIFIERS[style] || STYLE_MODIFIERS.SIMPLE;
  const categoryStyleMod = categoryRule.styleKeywords.join('，');

  const qualityParts = [
    '4K超清',
    '真实质感',
    '光影自然',
    '无文字',
    '无水印',
    '商用级品质',
  ];

  const allParts = [
    ...baseParts,
    sellingPointStr,
    platformMod,
    typeMod,
    styleMod,
    categoryStyleMod,
    ...qualityParts,
  ].filter(Boolean);

  const prompt = allParts.join('，');

  const negativeParts = [
    ...platformRule.negativePrompts,
    ...categoryRule.negativeKeywords,
    '模糊',
    '变形',
    '商品残缺',
    '色差严重',
    '水印',
    '文字',
    '低分辨率',
    '模糊边缘',
    '人物面部特写',
    '竞品logo',
  ];
  const uniqueNegatives = [...new Set(negativeParts)];
  const negativePrompt = uniqueNegatives.join('，');

  const sizeType = imageType === 'MAIN_IMAGE' ? 'main' : 'detail';
  const imageSize = getImageSizeForPlatform(platform, sizeType);

  return {
    prompt,
    negativePrompt,
    imageSize,
    imageType,
  };
}

export function generateAllPrompts(
  analysis: ProductAnalysisResult,
  platform: string,
  style: string,
  sellingPoints: string[]
): PromptResult[] {
  const platformRule = getPlatformRule(platform);
  const prompts: PromptResult[] = [];

  for (let i = 0; i < platformRule.maxMainImages; i++) {
    prompts.push(generatePrompt({
      analysis, platform, style, sellingPoints,
      imageType: 'MAIN_IMAGE',
      imageIndex: i,
    }));
  }

  for (let i = 0; i < platformRule.maxSceneImages; i++) {
    prompts.push(generatePrompt({
      analysis, platform, style, sellingPoints,
      imageType: 'SCENE_IMAGE',
      imageIndex: i,
    }));
  }

  for (let i = 0; i < platformRule.maxDetailImages; i++) {
    prompts.push(generatePrompt({
      analysis, platform, style, sellingPoints,
      imageType: 'DETAIL_IMAGE',
      imageIndex: i,
    }));
  }

  for (let i = 0; i < platformRule.maxSellingPointImages; i++) {
    prompts.push(generatePrompt({
      analysis, platform, style, sellingPoints,
      imageType: 'SELLING_POINT_IMAGE',
      imageIndex: i,
    }));
  }

  return prompts;
}

export function generateCopyPrompt(
  analysis: ProductAnalysisResult,
  platform: string,
  sellingPoints: string[]
): string {
  const platformRule = getPlatformRule(platform);
  const categoryRule = getCategoryRule(analysis.category);

  return `你是专业的电商详情页文案专家。请为以下商品生成一套高转化详情页文案。

商品信息：
- 商品名称：${analysis.productName}
- 品类：${categoryRule.name}
- 材质：${analysis.material}
- 颜色：${analysis.color.join('/')}
- 风格：${analysis.style}
- 核心卖点：${sellingPoints.join('、')}
- 目标人群：${analysis.targetAudience}
- 使用场景：${analysis.usageScenarios.join('、')}

目标平台：${platformRule.name}
文案风格：${platformRule.copyStyle}
品类调性：${categoryRule.copyTone}

请严格以JSON格式输出，不要包含任何markdown标记：
{
  "mainTitle": "主标题（15-20字，突出核心卖点，吸引点击）",
  "subTitle": "副标题（30-40字，补充主标题，强化购买理由）",
  "coreSellingPoints": ["卖点1（20字以内）", "卖点2", "卖点3", "卖点4", "卖点5"],
  "productDetails": "产品详情（200-300字，介绍产品功能、材质、使用场景、优势）",
  "usageScenarios": ["场景描述1", "场景描述2", "场景描述3"],
  "specHighlights": ["规格亮点1", "规格亮点2", "规格亮点3"],
  "faq": [
    {"question": "常见问题1", "answer": "专业回答1"},
    {"question": "常见问题2", "answer": "专业回答2"},
    {"question": "常见问题3", "answer": "专业回答3"}
  ]
}`;
}
