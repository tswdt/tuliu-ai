import { logger } from '@/app/utils/logger';

export interface PromptAdapterOptions {
  productName: string;
  style: string;
  platform?: string;
  additionalPrompt?: string;
  imageSize?: string;
  visualAnalysis?: {
    category?: string;
    color?: string;
    lighting?: string;
    composition?: string;
  };
}

const STYLE_DESCRIPTIONS: Record<string, string> = {
  minimal: "极简风格，白色背景，简洁干净，无冗余元素",
  professional: "专业商品摄影，专业布光，商业质感，高清细节，影棚灯光",
  luxury: "高端奢华风格，高级质感，精致细节，奢华氛围，高级面料质感",
  cyberpunk: "赛博朋克风格，科技感，霓虹灯光，未来感，赛博元素",
  cream: "奶油风，柔和色彩，温馨感觉，自然光线，温暖色调",
  vintage: "复古风格，复古质感，怀旧氛围，胶片质感，年代感"
};

const PLATFORM_OPTIMIZATIONS: Record<string, string> = {
  TAOBAO: "淘宝平台规范，商品主体居中，白底图优先，吸引点击",
  TMALL: "天猫平台规范，高品质展示，品牌调性，专业商业摄影",
  JD: "京东平台规范，真实可信，高清细节，商品完整展示",
  PINDUODUO: "拼多多平台规范，高性价比展示，醒目促销感，主体突出",
  DOUYIN: "抖音电商规范，视觉冲击力强，竖屏构图，吸引眼球",
  XIAOHONGSHU: "小红书风格，种草感，生活场景，真实分享，美感优先",
  AMAZON: "亚马逊平台规范，纯白背景，产品清晰，专业标准",
  TEMU: "Temu平台规范，白底主图，产品清晰，符合国际电商标准",
  SHOPIFY: "Shopify风格，品牌展示，自定义风格，电商转化优化"
};

export function buildWanxiangPrompt(options: PromptAdapterOptions): {
  prompt: string;
  negativePrompt: string;
} {
  const {
    productName,
    style,
    platform = "TAOBAO",
    additionalPrompt = "",
    imageSize = "800x800",
    visualAnalysis
  } = options;

  logger.info("开始构建通义万相提示词", { productName, style, platform });

  const styleDesc = STYLE_DESCRIPTIONS[style] || STYLE_DESCRIPTIONS.minimal;
  const platformOpt = PLATFORM_OPTIMIZATIONS[platform] || PLATFORM_OPTIMIZATIONS.TAOBAO;

  let visualAnalysisPart = "";
  if (visualAnalysis) {
    const parts: string[] = [];
    if (visualAnalysis.category) parts.push(`类目：${visualAnalysis.category}`);
    if (visualAnalysis.color) parts.push(`主色调：${visualAnalysis.color}`);
    if (visualAnalysis.lighting) parts.push(`光影：${visualAnalysis.lighting}`);
    if (visualAnalysis.composition) parts.push(`构图：${visualAnalysis.composition}`);
    if (parts.length > 0) {
      visualAnalysisPart = `，参考分析：${parts.join('，')}`;
    }
  }

  const prompt = `【${productName}】电商商品主图，商品：${productName}，这是一张${productName}的专业商品摄影图片，${styleDesc}，${platformOpt}${visualAnalysisPart}，${additionalPrompt ? additionalPrompt + '，' : ''}${imageSize}分辨率，4K超清细节，8K质感，商品主体居中突出，商用无版权，色彩还原真实，光影自然，无水印无文字，符合电商平台上架规范，必须是【${productName}】这个商品！`;

  const negativePrompt = "模糊，变形，商品残缺，色差严重，水印，文字，色情，暴力，低分辨率，模糊边缘，杂乱背景，多余元素，人物，动物，其他商品，拼接痕迹，PS痕迹，噪点，过曝，欠曝，歪斜，比例失调，卡通风格，手绘风格，抽象风格，非商品图片";

  logger.info("通义万相提示词构建完成", { 
    promptLength: prompt.length, 
    negativePromptLength: negativePrompt.length 
  });

  return { prompt, negativePrompt };
}

export function buildBackgroundReplacementPrompt(options: PromptAdapterOptions & {
  backgroundDescription?: string;
}): {
  prompt: string;
  negativePrompt: string;
} {
  const {
    productName,
    style,
    platform = "TAOBAO",
    additionalPrompt = "",
    backgroundDescription = "纯白干净背景"
  } = options;

  const styleDesc = STYLE_DESCRIPTIONS[style] || STYLE_DESCRIPTIONS.minimal;
  const platformOpt = PLATFORM_OPTIMIZATIONS[platform] || PLATFORM_OPTIMIZATIONS.TAOBAO;

  const prompt = `【${productName}】电商商品主图，商品：${productName}，${styleDesc}，${platformOpt}，背景：${backgroundDescription}，${additionalPrompt ? additionalPrompt + '，' : ''}4K超清细节，商品主体清晰完整，边缘过渡自然，光影协调，色彩真实，无水印无文字，商用无版权，符合电商平台上架规范，必须保留【${productName}】这个商品的完整性！`;

  const negativePrompt = "模糊，变形，商品残缺，色差严重，水印，文字，色情，暴力，低分辨率，模糊边缘，商品被遮挡，商品被修改，拼接痕迹，边缘生硬，光影不自然，人物，动物，其他商品";

  return { prompt, negativePrompt };
}
