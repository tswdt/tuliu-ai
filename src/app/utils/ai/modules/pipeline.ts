import { logger } from '@/app/utils/logger';
import { recognizeProduct, RecognitionOutput } from './recognizer';
import { structureProduct, StructuredProduct } from './structurer';
import { matchStrategy, GenerationStrategy } from './strategy-matcher';
import { generatePrompts, PromptGenOutput } from './prompt-generator';
import { generateImages, ImageGenOutput } from './image-generator';
import { composeLayout, LayoutOutput } from './layout-composer';
import { exportLayout, ExportOutput, getExportConfig } from './exporter';
import { generateCopyContent, CopyContent } from '../copy-generator';

export type PipelineStage =
  | 'IDLE'
  | 'RECOGNIZING'
  | 'STRUCTURING'
  | 'MATCHING_STRATEGY'
  | 'GENERATING_PROMPTS'
  | 'GENERATING_IMAGES'
  | 'GENERATING_COPY'
  | 'COMPOSING_LAYOUT'
  | 'EXPORTING'
  | 'COMPLETED'
  | 'FAILED';

export interface PipelineProgress {
  stage: PipelineStage;
  stageIndex: number;
  totalStages: number;
  progress: number;
  message: string;
  details?: any;
}

export interface PipelineInput {
  imageUrl: string;
  platformId: string;
  styleId: string;
  contentTypes: string[];
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
  exportFormat?: 'png' | 'jpg' | 'long-image';
}

export interface PipelineResult {
  recognition: RecognitionOutput;
  product: StructuredProduct;
  strategy: GenerationStrategy;
  promptGen: PromptGenOutput;
  imageGen: ImageGenOutput;
  copy: CopyContent;
  layout: LayoutOutput;
  exportResult: ExportOutput;
}

const STAGE_LABELS: Record<PipelineStage, string> = {
  IDLE: '等待开始',
  RECOGNIZING: 'AI 识别商品',
  STRUCTURING: '结构化商品资料',
  MATCHING_STRATEGY: '匹配平台策略',
  GENERATING_PROMPTS: '生成提示词',
  GENERATING_IMAGES: 'AI 生成图片',
  GENERATING_COPY: '生成文案',
  COMPOSING_LAYOUT: '自动排版',
  EXPORTING: '导出文件',
  COMPLETED: '生成完成',
  FAILED: '生成失败',
};

const PIPELINE_STAGES: PipelineStage[] = [
  'RECOGNIZING',
  'STRUCTURING',
  'MATCHING_STRATEGY',
  'GENERATING_PROMPTS',
  'GENERATING_IMAGES',
  'GENERATING_COPY',
  'COMPOSING_LAYOUT',
  'EXPORTING',
];

type ProgressCallback = (progress: PipelineProgress) => void;

export async function runPipeline(
  input: PipelineInput,
  onProgress?: ProgressCallback
): Promise<PipelineResult> {
  const updateProgress = (stage: PipelineStage, progress: number, message: string, details?: any) => {
    const stageIndex = PIPELINE_STAGES.indexOf(stage);
    const totalStages = PIPELINE_STAGES.length;
    const overallProgress = Math.round(((stageIndex + progress / 100) / totalStages) * 100);

    const progressData: PipelineProgress = {
      stage,
      stageIndex,
      totalStages,
      progress: overallProgress,
      message,
      details,
    };

    logger.info(`[工作流] ${STAGE_LABELS[stage]} - ${message}`, { progress: overallProgress });
    onProgress?.(progressData);
  };

  try {
    updateProgress('RECOGNIZING', 10, '正在识别商品信息...');

    const recognition = await recognizeProduct({ imageUrl: input.imageUrl });

    updateProgress('RECOGNIZING', 100, `识别完成：${recognition.productName}`, {
      productName: recognition.productName,
      category: recognition.productType,
    });

    updateProgress('STRUCTURING', 10, '正在结构化商品资料...');

    const product = structureProduct({
      recognition,
      userEdits: input.userEdits,
    });

    updateProgress('STRUCTURING', 100, `结构化完成：${product.productName}`);

    updateProgress('MATCHING_STRATEGY', 10, '正在匹配平台策略...');

    const strategy = matchStrategy({
      product,
      platformId: input.platformId,
      styleId: input.styleId,
      contentTypes: input.contentTypes,
    });

    updateProgress('MATCHING_STRATEGY', 100, `策略匹配完成：${strategy.platform.name}，共${strategy.totalPages}页`);

    updateProgress('GENERATING_PROMPTS', 10, '正在生成提示词...');

    const promptGen = generatePrompts({ product, strategy });

    updateProgress('GENERATING_PROMPTS', 100, `已生成 ${promptGen.totalCount} 条提示词`);

    updateProgress('GENERATING_IMAGES', 5, '开始生成商品图片...');

    const imageGen = await generateImages({
      prompts: promptGen.prompts,
      referenceImageUrl: input.imageUrl,
      maxConcurrent: 3,
      onProgress: (completed, total) => {
        const imageProgress = Math.round((completed / total) * 100);
        updateProgress('GENERATING_IMAGES', imageProgress, `正在生成图片 (${completed}/${total})...`);
      },
    });

    updateProgress('GENERATING_IMAGES', 100, `图片生成完成，成功 ${imageGen.successCount} 张`);

    updateProgress('GENERATING_COPY', 10, '正在生成详情页文案...');

    const copy = await generateCopyContent(
      {
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
      input.platformId,
      product.sellingPoints,
    );

    updateProgress('GENERATING_COPY', 100, '文案生成完成');

    updateProgress('COMPOSING_LAYOUT', 10, '正在自动排版...');

    const layout = composeLayout({ images: imageGen.images, copy, product, strategy });

    updateProgress('COMPOSING_LAYOUT', 100, `排版完成，共 ${layout.totalPages} 页`);

    updateProgress('EXPORTING', 10, '正在导出...');

    const exportFormat = input.exportFormat || getExportConfig(input.platformId).defaultFormat;
    const exportResult = await exportLayout({
      layout,
      format: exportFormat,
      quality: 0.92,
      scale: 2,
    });

    updateProgress('EXPORTING', 100, '导出完成');

    const result: PipelineResult = {
      recognition,
      product,
      strategy,
      promptGen,
      imageGen,
      copy,
      layout,
      exportResult,
    };

    updateProgress('COMPLETED', 100, '全部生成完成！', {
      imageCount: imageGen.successCount,
      pageCount: layout.totalPages,
      productName: product.productName,
    });

    return result;

  } catch (error) {
    const errorMessage = (error as Error).message;
    logger.error('[工作流] 执行失败', { error: errorMessage });
    updateProgress('FAILED', 0, `生成失败：${errorMessage}`);
    throw error;
  }
}

export async function runRecognitionOnly(
  imageUrl: string,
  onProgress?: ProgressCallback
): Promise<RecognitionOutput> {
  const updateProgress = (stage: PipelineStage, progress: number, message: string) => {
    onProgress?.({
      stage,
      stageIndex: 0,
      totalStages: 1,
      progress,
      message,
    });
  };

  updateProgress('RECOGNIZING', 10, '正在识别商品信息...');
  const recognition = await recognizeProduct({ imageUrl });
  updateProgress('RECOGNIZING', 100, `识别完成：${recognition.productName}`);
  return recognition;
}
