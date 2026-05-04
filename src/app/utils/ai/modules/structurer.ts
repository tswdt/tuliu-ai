import { logger } from '@/app/utils/logger';
import { RecognitionOutput } from './recognizer';

export interface StructuredProductInput {
  recognition: RecognitionOutput;
  userEdits?: {
    productName?: string;
    brandName?: string;
    category?: string;
    specs?: string;
    sellingPoints?: string;
    targetAudience?: string;
    useScene?: string;
    forbiddenContent?: string;
  };
}

export interface StructuredProduct {
  productName: string;
  brandName: string;
  category: string;
  categoryLabel: string;
  color: string[];
  material: string;
  style: string;
  packaging: string;
  specs: string;
  sellingPoints: string[];
  targetAudience: string;
  usageScenarios: string[];
  features: string[];
  forbiddenContent: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  CLOTHING: '服饰',
  BEAUTY: '美妆',
  ELECTRONICS: '3C数码',
  FOOD: '食品',
  HOME: '家居',
  BABY: '母婴',
  SPORTS: '运动',
  JEWELRY: '珠宝',
  AUTOMOTIVE: '汽车',
  PET: '宠物',
  STATIONERY: '文具',
  OTHER: '其他',
};

export function structureProduct(input: StructuredProductInput): StructuredProduct {
  logger.info('[模块2-商品资料结构化] 开始结构化');

  const { recognition, userEdits } = input;
  const raw = recognition.rawAnalysis;

  const sellingPoints = userEdits?.sellingPoints
    ? userEdits.sellingPoints.split(/[、,，\n]/).filter(Boolean)
    : recognition.sellingPoints;

  const usageScenarios = userEdits?.useScene
    ? userEdits.useScene.split(/[、,，\n]/).filter(Boolean)
    : raw.usageScenarios;

  const product: StructuredProduct = {
    productName: userEdits?.productName || recognition.productName,
    brandName: userEdits?.brandName || raw.brandName,
    category: userEdits?.category || recognition.productType,
    categoryLabel: CATEGORY_LABELS[userEdits?.category || recognition.productType] || '其他',
    color: recognition.color,
    material: recognition.material,
    style: raw.style,
    packaging: recognition.packaging,
    specs: userEdits?.specs || '',
    sellingPoints,
    targetAudience: userEdits?.targetAudience || raw.targetAudience,
    usageScenarios,
    features: raw.features,
    forbiddenContent: userEdits?.forbiddenContent || '',
  };

  logger.info('[模块2-商品资料结构化] 完成', { productName: product.productName });
  return product;
}
