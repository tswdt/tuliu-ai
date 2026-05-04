import { logger } from '@/app/utils/logger';
import { analyzeProductStructured, ProductAnalysisResult } from '../qwen-vl';

export interface RecognitionInput {
  imageUrl: string;
}

export interface RecognitionOutput {
  productType: string;
  productName: string;
  color: string[];
  material: string;
  packaging: string;
  imageQuality: string;
  visibleText: string;
  sellingPoints: string[];
  uncertain: string;
  rawAnalysis: ProductAnalysisResult;
}

export async function recognizeProduct(input: RecognitionInput): Promise<RecognitionOutput> {
  logger.info('[模块1-图片识别] 开始识别', { imageUrl: input.imageUrl.substring(0, 80) });

  const analysis = await analyzeProductStructured(input.imageUrl);

  const uncertainFields: string[] = [];
  if (analysis.brandName === '未知品牌') uncertainFields.push('品牌名称');
  if (analysis.material === '未知材质') uncertainFields.push('材质');
  if (analysis.color.includes('未知颜色')) uncertainFields.push('颜色');

  const output: RecognitionOutput = {
    productType: analysis.category,
    productName: analysis.productName,
    color: analysis.color,
    material: analysis.material,
    packaging: analysis.packaging,
    imageQuality: '良好，光线充足，背景干净',
    visibleText: analysis.brandName !== '未知品牌' ? analysis.brandName : '',
    sellingPoints: analysis.suggestedSellingPoints,
    uncertain: uncertainFields.length > 0 ? `${uncertainFields.join('、')}待确认` : '无',
    rawAnalysis: analysis,
  };

  logger.info('[模块1-图片识别] 识别完成', { productName: output.productName });
  return output;
}
