import { logger } from '@/app/utils/logger';

export interface PromptAdapterOptions {
  productName: string;
  style: string;
  platform?: string;
  additionalPrompt?: string;
  imageSize?: string;
  hasReferenceImage?: boolean;
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
    hasReferenceImage = false,
    visualAnalysis
  } = options;

  logger.info("开始构建电商生图提示词（图像为主模式）", { 
    productName, 
    style, 
    platform,
    hasReferenceImage,
    additionalPrompt: additionalPrompt ? additionalPrompt.substring(0, 50) + '...' : '无'
  });

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

  const productSubject = productName;
  const userInput = additionalPrompt;
  const userEnvironmentPrompt = userInput || "极简电商纯色背景，高级光影";

  const prompt = `【核心商品主体】：${productSubject}。
【背景与场景要求】：${userEnvironmentPrompt}。
【绝对指令】：商品必须是【${productSubject}】，请将它放置在【${userEnvironmentPrompt}】的环境中。无论背景描述是什么，核心商品主体绝对不能被替换或篡改！

【摄影与渲染参数】：${styleDesc}，${platformOpt}${visualAnalysisPart}，${imageSize}分辨率，4K超清细节，商品主体居中突出，完整保留商品的形状、颜色、标签、包装、文字等所有特征，商用无版权，色彩还原真实，光影自然，无水印无文字，符合电商平台上架规范。`;

  const negativePrompt = `模糊，变形，商品残缺，色差严重，水印，文字，色情，暴力，低分辨率，模糊边缘，杂乱背景，多余元素，人物，动物，其他商品，拼接痕迹，PS痕迹，噪点，过曝，欠曝，歪斜，比例失调，卡通风格，手绘风格，抽象风格，非商品图片，替换商品，错误的商品，修改商品主体，改变商品形状，改变商品颜色，不是【${productSubject}】的商品`;

  logger.info("电商生图提示词构建完成", { 
    promptLength: prompt.length, 
    negativePromptLength: negativePrompt.length,
    mode: hasReferenceImage ? '图生图' : '文生图'
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

  const subjectDescription = productName;

  const prompt = `【核心商品主体】：${subjectDescription}。请确保该商品位于画面正中央，保持其原有材质、颜色和形状绝对不变。商品必须是【${subjectDescription}】，绝对不能替换或修改商品主体！

【背景与场景要求】：${backgroundDescription}。请将核心商品放置在此类背景或环境中。

【摄影与渲染参数】：${styleDesc}，${platformOpt}，4K超清细节，商品主体清晰完整，边缘过渡自然，光影协调，色彩真实，无水印无文字，商用无版权，符合电商平台上架规范。

【绝对重点】：商品必须是【${subjectDescription}】，不能是其他商品！`;

  const negativePrompt = "模糊，变形，商品残缺，色差严重，水印，文字，色情，暴力，低分辨率，模糊边缘，商品被遮挡，商品被修改，拼接痕迹，边缘生硬，光影不自然，人物，动物，其他商品，替换商品，改变商品形状，改变商品颜色";

  return { prompt, negativePrompt };
}
