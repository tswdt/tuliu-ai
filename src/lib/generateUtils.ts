import { 
  Platform, 
  PlatformDimensions, 
  GenerationStyle, 
  ProductCategory,
  ImageType,
  CATEGORY_LABELS,
  STYLE_LABELS,
  PLATFORM_LABELS,
} from "@/types/generate";

// ==================== 平台尺寸配置 ====================
// 内置平台尺寸常量，不要硬编码
export const PLATFORM_DIMENSIONS: Record<Platform, PlatformDimensions> = {
  [Platform.TAOBAO]: { width: 800, height: 800, name: "淘宝主图" },
  [Platform.TMALL]: { width: 800, height: 800, name: "天猫主图" },
  [Platform.JD]: { width: 800, height: 800, name: "京东主图" },
  [Platform.PINDUODUO]: { width: 750, height: 1000, name: "拼多多主图" },
  [Platform.DOUYIN]: { width: 1080, height: 1920, name: "抖音主图" },
  [Platform.XIAOHONGSHU]: { width: 1080, height: 1440, name: "小红书主图" },
  [Platform.AMAZON]: { width: 1000, height: 1000, name: "Amazon主图" },
  [Platform.TEMU]: { width: 800, height: 800, name: "Temu主图" },
  [Platform.SHOPIFY]: { width: 1000, height: 1000, name: "Shopify主图" },
  [Platform.CUSTOM]: { width: 800, height: 800, name: "自定义" },
};

// 详情页场景图/细节图尺寸（竖版）
export const DETAIL_PAGE_DIMENSIONS = {
  width: 750,
  height: 1000,
  name: "详情页竖版图",
};

// ==================== 图片生成配置 ====================
// 图片生成计划：主图1张、场景图3张、细节图2张、卖点图3张
export const IMAGE_GENERATION_PLAN = [
  { type: ImageType.MAIN_IMAGE, count: 1 },
  { type: ImageType.SCENE_IMAGE, count: 3 },
  { type: ImageType.DETAIL_IMAGE, count: 2 },
  { type: ImageType.SELLING_POINT_IMAGE, count: 3 },
];

// 计算总图片数量
export const TOTAL_IMAGES_TO_GENERATE = IMAGE_GENERATION_PLAN.reduce(
  (sum, item) => sum + item.count,
  0
);

// ==================== 提示词模板 ====================

// 文案生成提示词模板
export function buildCopyGenerationPrompt(
  category: ProductCategory,
  platform: Platform,
  productName: string,
  sellingPoints: string[],
  productFeatures: any
): string {
  return `你是专业的电商详情页文案专家，针对${CATEGORY_LABELS[category]}商品，目标平台是${PLATFORM_LABELS[platform]}，请生成一套高转化详情页文案，分模块结构化输出：
1. 主标题（15-20字，突出核心卖点）
2. 副标题（30-40字，补充主标题）
3. 核心卖点（3-5条，每条20字以内）
4. 产品详情（200-300字，介绍产品功能、材质、使用场景）
5. 常见问题（3-5条，针对品类常见疑问）

商品信息：${productName}，核心卖点：${sellingPoints.join("、")}，商品特征：${JSON.stringify(productFeatures)}

请严格以JSON格式输出，不要包含任何markdown标记，格式如下：
{
  "mainTitle": "主标题内容",
  "subTitle": "副标题内容",
  "coreSellingPoints": ["卖点1", "卖点2", "卖点3"],
  "productDetails": "产品详情内容",
  "faq": [
    {"question": "问题1", "answer": "回答1"},
    {"question": "问题2", "answer": "回答2"}
  ]
}`;
}

// 图片生成提示词模板
export function buildImageGenerationPrompt(
  category: ProductCategory,
  productName: string,
  style: GenerationStyle,
  material: string,
  color: string,
  sellingPoints: string[],
  platform: Platform,
  imageType: ImageType
): string {
  const basePrompt = `电商商品摄影图，${CATEGORY_LABELS[category]}，${productName}，${STYLE_LABELS[style]}风格，${material}材质，${color}颜色，核心卖点：${sellingPoints.join("、")}，${PLATFORM_LABELS[platform]}平台风格，4K超清，真实质感，光影自然，无文字，无水印`;

  // 根据图片类型添加特定提示
  let typeSpecificPrompt = "";
  switch (imageType) {
    case ImageType.MAIN_IMAGE:
      typeSpecificPrompt = "，商品主体居中，白色背景，完整展示商品全貌";
      break;
    case ImageType.SCENE_IMAGE:
      typeSpecificPrompt = "，场景化展示，生活使用场景，有氛围感";
      break;
    case ImageType.DETAIL_IMAGE:
      typeSpecificPrompt = "，局部特写，细节展示，材质纹理清晰";
      break;
    case ImageType.SELLING_POINT_IMAGE:
      typeSpecificPrompt = "，突出核心卖点，视觉冲击力强";
      break;
    default:
      typeSpecificPrompt = "";
  }

  return basePrompt + typeSpecificPrompt;
}

// ==================== 图片处理工具 ====================

// 验证图片格式
export function validateImageFormat(fileName: string): boolean {
  const validExtensions = [".jpg", ".jpeg", ".png", ".webp"];
  const ext = fileName.toLowerCase().substring(fileName.lastIndexOf("."));
  return validExtensions.includes(ext);
}

// 验证图片大小（单位：字节，最大10MB）
export function validateImageSize(fileSize: number, maxSize: number = 10 * 1024 * 1024): boolean {
  return fileSize <= maxSize;
}

// 生成Supabase Storage路径
export function generateStoragePath(
  userId: string,
  generationId: string,
  imageType: ImageType,
  index: number = 0
): string {
  const timestamp = Date.now();
  return `users/${userId}/generations/${generationId}/${imageType.toLowerCase()}_${index}_${timestamp}.png`;
}

// 生成临时文件路径
export function generateTempStoragePath(
  userId: string,
  fileName: string
): string {
  const timestamp = Date.now();
  return `temp/${userId}/${timestamp}_${fileName}`;
}

// ==================== 进度计算 ====================

// 工作流阶段权重
const STAGE_WEIGHTS = {
  PREPROCESSING: 15,
  COPY_GENERATION: 20,
  IMAGE_GENERATION: 55,
  COMPOSITION: 10,
};

// 计算总体进度
export function calculateOverallProgress(
  stage: string,
  imageProgress: { current: number; total: number } | null = null
): number {
  let progress = 0;

  // 累加已完成阶段的权重
  const stages = ["PREPROCESSING", "COPY_GENERATION", "IMAGE_GENERATION", "COMPOSITION", "COMPLETED"];
  const currentStageIndex = stages.indexOf(stage);

  for (let i = 0; i < currentStageIndex; i++) {
    if (stages[i] in STAGE_WEIGHTS) {
      progress += STAGE_WEIGHTS[stages[i] as keyof typeof STAGE_WEIGHTS];
    }
  }

  // 计算当前阶段进度
  if (stage === "IMAGE_GENERATION" && imageProgress) {
    const stageWeight = STAGE_WEIGHTS.IMAGE_GENERATION;
    const currentStageProgress = (imageProgress.current / imageProgress.total) * stageWeight;
    progress += currentStageProgress;
  } else if (stage in STAGE_WEIGHTS) {
    // 其他阶段默认完成50%
    progress += STAGE_WEIGHTS[stage as keyof typeof STAGE_WEIGHTS] * 0.5;
  } else if (stage === "COMPLETED") {
    progress = 100;
  }

  return Math.min(Math.round(progress), 100);
}

// ==================== 重试机制 ====================

// 带重试的异步函数执行器
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  retryDelay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      console.warn(`尝试 ${attempt}/${maxRetries} 失败:`, lastError.message);

      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
  }

  throw lastError;
}

// ==================== 超时处理 ====================

// 带超时的Promise包装器
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutMessage: string = "操作超时"
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(timeoutMessage));
    }, timeoutMs);

    promise
      .then((result) => {
        clearTimeout(timeoutId);
        resolve(result);
      })
      .catch((error) => {
        clearTimeout(timeoutId);
        reject(error);
      });
  });
}

// ==================== 文件名工具 ====================

// 生成安全的文件名
export function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/_{2,}/g, "_")
    .substring(0, 100);
}

// 获取文件扩展名
export function getFileExtension(fileName: string): string {
  const lastDot = fileName.lastIndexOf(".");
  return lastDot !== -1 ? fileName.substring(lastDot).toLowerCase() : "";
}

// ==================== 详情页模板 ====================

// 详情页模板配置（按品类分类）
export const DETAIL_PAGE_TEMPLATES = {
  [ProductCategory.CLOTHING]: ["时尚简约", "轻奢高端", "街头潮流"],
  [ProductCategory.BEAUTY]: ["清新自然", "高端奢华", "科技感"],
  [ProductCategory.ELECTRONICS]: ["简约科技", "未来感", "商务专业"],
  [ProductCategory.FOOD]: ["美味诱人", "健康自然", "高端品质"],
  [ProductCategory.HOME]: ["温馨家居", "简约北欧", "中式古典"],
  [ProductCategory.OTHER]: ["通用简约", "现代风格", "创意个性"],
};

// 获取品类对应的模板列表
export function getTemplatesForCategory(category: ProductCategory): string[] {
  return DETAIL_PAGE_TEMPLATES[category] || DETAIL_PAGE_TEMPLATES[ProductCategory.OTHER];
}
