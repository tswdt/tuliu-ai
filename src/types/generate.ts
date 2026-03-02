import { z } from "zod";

// 商品品类枚举
export enum ProductCategory {
  CLOTHING = "CLOTHING",
  BEAUTY = "BEAUTY",
  ELECTRONICS = "ELECTRONICS",
  FOOD = "FOOD",
  HOME = "HOME",
  OTHER = "OTHER",
}

// 生成风格枚举
export enum GenerationStyle {
  SIMPLE = "SIMPLE",
  LUXURY = "LUXURY",
  NATIONAL_TREND = "NATIONAL_TREND",
  TECH = "TECH",
  NATURAL = "NATURAL",
}

// 分辨率枚举
export enum Resolution {
  TWO_K = "TWO_K",
  FOUR_K = "FOUR_K",
}

// 平台枚举
export enum Platform {
  TAOBAO = "TAOBAO",
  TMALL = "TMALL",
  JD = "JD",
  PINDUODUO = "PINDUODUO",
  DOUYIN = "DOUYIN",
  XIAOHONGSHU = "XIAOHONGSHU",
  AMAZON = "AMAZON",
  TEMU = "TEMU",
  SHOPIFY = "SHOPIFY",
  CUSTOM = "CUSTOM",
}

// 图片类型枚举
export enum ImageType {
  MAIN_IMAGE = "MAIN_IMAGE",
  SCENE_IMAGE = "SCENE_IMAGE",
  DETAIL_IMAGE = "DETAIL_IMAGE",
  SELLING_POINT_IMAGE = "SELLING_POINT_IMAGE",
  DETAIL_PAGE = "DETAIL_PAGE",
}

// 工作流阶段枚举
export enum WorkflowStage {
  PREPROCESSING = "PREPROCESSING",
  COPY_GENERATION = "COPY_GENERATION",
  IMAGE_GENERATION = "IMAGE_GENERATION",
  COMPOSITION = "COMPOSITION",
  COMPLETED = "COMPLETED",
}

// 生成状态枚举
export enum GenerationStatus {
  QUEUED = "QUEUED",
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

// 商品特征接口 - 从豆包多模态API提取
export interface ProductFeature {
  productSubject: string;      // 商品主体
  material: string;            // 材质
  color: string;               // 颜色
  size: string;                // 尺寸
  style: string;               // 风格
  defectPositions: string[];   // 瑕疵位置
}

// 结构化文案内容接口
export interface CopyContent {
  mainTitle: string;           // 主标题（15-20字）
  subTitle: string;            // 副标题（30-40字）
  coreSellingPoints: string[]; // 核心卖点（3-5条）
  productDetails: string;      // 产品详情（200-300字）
  faq: Array<{                 // 常见问题（3-5条）
    question: string;
    answer: string;
  }>;
}

// 生成结果接口
export interface GenerationResult {
  generationId: string;
  mainImageUrl: string;
  sceneImageUrls: string[];
  detailImageUrls: string[];
  sellingPointImageUrls: string[];
  detailPageUrl: string;
  copyContent: CopyContent;
  copyText: string;
}

// 生成参数校验Schema
export const generateDetailPageSchema = z.object({
  productName: z.string().min(1, "商品名称不能为空"),
  category: z.nativeEnum(ProductCategory, {
    required_error: "请选择商品品类",
  }),
  coreSellingPoints: z.array(z.string()).min(1, "请至少输入1个核心卖点"),
  platform: z.nativeEnum(Platform, {
    required_error: "请选择目标电商平台",
  }),
  style: z.nativeEnum(GenerationStyle, {
    required_error: "请选择生成风格",
  }),
  resolution: z.nativeEnum(Resolution, {
    required_error: "请选择分辨率",
  }),
});

// 生成参数类型
export type GenerateDetailPageParams = z.infer<typeof generateDetailPageSchema>;

// 平台尺寸配置
export interface PlatformDimensions {
  width: number;
  height: number;
  name: string;
}

// 进度更新接口
export interface ProgressUpdate {
  stage: WorkflowStage;
  progress: number; // 0-100
  message: string;
  imageProgress?: {
    current: number;
    total: number;
    type: ImageType;
  };
}

// 错误响应接口
export interface ErrorResponse {
  success: false;
  error: string;
  code: string;
}

// 成功响应接口
export interface SuccessResponse<T> {
  success: true;
  data: T;
}

// API响应类型
export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

// 生成任务状态
export interface GenerationTask {
  id: string;
  status: GenerationStatus;
  stage: WorkflowStage;
  progress: number;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

// 品类显示名称映射
export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  [ProductCategory.CLOTHING]: "服饰",
  [ProductCategory.BEAUTY]: "美妆",
  [ProductCategory.ELECTRONICS]: "3C",
  [ProductCategory.FOOD]: "食品",
  [ProductCategory.HOME]: "家居",
  [ProductCategory.OTHER]: "其他",
};

// 风格显示名称映射
export const STYLE_LABELS: Record<GenerationStyle, string> = {
  [GenerationStyle.SIMPLE]: "简约",
  [GenerationStyle.LUXURY]: "轻奢",
  [GenerationStyle.NATIONAL_TREND]: "国潮",
  [GenerationStyle.TECH]: "科技",
  [GenerationStyle.NATURAL]: "自然",
};

// 平台显示名称映射
export const PLATFORM_LABELS: Record<Platform, string> = {
  [Platform.TAOBAO]: "淘宝",
  [Platform.TMALL]: "天猫",
  [Platform.JD]: "京东",
  [Platform.PINDUODUO]: "拼多多",
  [Platform.DOUYIN]: "抖音",
  [Platform.XIAOHONGSHU]: "小红书",
  [Platform.AMAZON]: "Amazon",
  [Platform.TEMU]: "Temu",
  [Platform.SHOPIFY]: "Shopify",
  [Platform.CUSTOM]: "自定义",
};

// 分辨率显示名称映射
export const RESOLUTION_LABELS: Record<Resolution, string> = {
  [Resolution.TWO_K]: "2K",
  [Resolution.FOUR_K]: "4K",
};
