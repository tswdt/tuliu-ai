import { analyzeProductStructured, ProductAnalysisResult } from './qwen-vl';
import { generatePrompt, generateAllPrompts, PromptResult } from '@/lib/prompt-engine';
import { generateCopyContent, CopyContent } from './copy-generator';
import { generateImageWithWanxiang } from './wanxiang';
import { generateImageWithSuchuang } from './suchuang-image';
import { getPlatformRule } from '@/lib/platform-rules';
import { logger } from '@/app/utils/logger';

export type WorkflowStage =
  | 'IDLE'
  | 'ANALYZING'
  | 'GENERATING_PROMPTS'
  | 'GENERATING_IMAGES'
  | 'GENERATING_COPY'
  | 'COMPOSING'
  | 'COMPLETED'
  | 'FAILED';

export interface WorkflowProgress {
  stage: WorkflowStage;
  stageLabel: string;
  progress: number;
  message: string;
  details?: any;
}

export interface GeneratedImage {
  url: string;
  imageType: string;
  imageIndex: number;
  prompt: string;
  size: string;
}

export interface WorkflowResult {
  analysis: ProductAnalysisResult;
  prompts: PromptResult[];
  images: GeneratedImage[];
  copy: CopyContent;
  platform: string;
  style: string;
}

type ProgressCallback = (progress: WorkflowProgress) => void;

const STAGE_LABELS: Record<WorkflowStage, string> = {
  IDLE: '等待开始',
  ANALYZING: 'AI 识别商品',
  GENERATING_PROMPTS: '生成提示词',
  GENERATING_IMAGES: 'AI 生成图片',
  GENERATING_COPY: '生成文案',
  COMPOSING: '合成详情页',
  COMPLETED: '生成完成',
  FAILED: '生成失败',
};

export async function runFullWorkflow(
  imageUrl: string,
  platform: string,
  style: string,
  sellingPoints: string[],
  onProgress?: ProgressCallback
): Promise<WorkflowResult> {
  const updateProgress = (stage: WorkflowStage, progress: number, message: string, details?: any) => {
    const progressData: WorkflowProgress = {
      stage,
      stageLabel: STAGE_LABELS[stage],
      progress,
      message,
      details,
    };
    logger.info(`[工作流] ${STAGE_LABELS[stage]} - ${message}`, { progress });
    onProgress?.(progressData);
  };

  try {
    updateProgress('ANALYZING', 5, '正在识别商品信息...');

    const analysis = await analyzeProductStructured(imageUrl);

    updateProgress('ANALYZING', 20, `识别完成：${analysis.productName}`, {
      productName: analysis.productName,
      category: analysis.category,
      color: analysis.color,
      material: analysis.material,
    });

    const finalSellingPoints = sellingPoints.length > 0
      ? sellingPoints
      : analysis.suggestedSellingPoints;

    updateProgress('GENERATING_PROMPTS', 25, '正在生成平台适配提示词...');

    const prompts = generateAllPrompts(analysis, platform, style, finalSellingPoints);

    updateProgress('GENERATING_PROMPTS', 35, `已生成 ${prompts.length} 条提示词`, {
      promptCount: prompts.length,
    });

    updateProgress('GENERATING_IMAGES', 40, '开始生成商品图片...');

    const images = await generateAllImages(prompts, imageUrl, (completed, total) => {
      const imageProgress = 40 + Math.floor((completed / total) * 40);
      updateProgress('GENERATING_IMAGES', imageProgress, `正在生成图片 (${completed}/${total})...`);
    });

    updateProgress('GENERATING_IMAGES', 80, `图片生成完成，共 ${images.length} 张`);

    updateProgress('GENERATING_COPY', 82, '正在生成详情页文案...');

    const copy = await generateCopyContent(analysis, platform, finalSellingPoints);

    updateProgress('GENERATING_COPY', 92, '文案生成完成');

    updateProgress('COMPOSING', 95, '正在合成详情页...');

    const result: WorkflowResult = {
      analysis,
      prompts,
      images,
      copy,
      platform,
      style,
    };

    updateProgress('COMPLETED', 100, '全部生成完成！', {
      imageCount: images.length,
      productName: analysis.productName,
    });

    return result;

  } catch (error) {
    const errorMessage = (error as Error).message;
    logger.error('[工作流] 执行失败', { error: errorMessage });
    updateProgress('FAILED', 0, `生成失败：${errorMessage}`);
    throw error;
  }
}

async function generateAllImages(
  prompts: PromptResult[],
  referenceImageUrl: string,
  onImageComplete?: (completed: number, total: number) => void
): Promise<GeneratedImage[]> {
  const images: GeneratedImage[] = [];
  const maxConcurrent = 3;
  const total = prompts.length;
  let completed = 0;

  const batches: PromptResult[][] = [];
  for (let i = 0; i < prompts.length; i += maxConcurrent) {
    batches.push(prompts.slice(i, i + maxConcurrent));
  }

  for (const batch of batches) {
    const batchPromises = batch.map(async (promptResult, index) => {
      try {
        const imageUrl = await generateSingleImage(promptResult, referenceImageUrl);
        completed++;
        onImageComplete?.(completed, total);
        return {
          url: imageUrl,
          imageType: promptResult.imageType,
          imageIndex: prompts.indexOf(promptResult),
          prompt: promptResult.prompt,
          size: promptResult.imageSize,
        } as GeneratedImage;
      } catch (error) {
        logger.warn(`[工作流] 图片生成失败，跳过`, {
          imageType: promptResult.imageType,
          error: (error as Error).message,
        });
        completed++;
        onImageComplete?.(completed, total);
        return null;
      }
    });

    const batchResults = await Promise.all(batchPromises);
    for (const result of batchResults) {
      if (result) {
        images.push(result);
      }
    }
  }

  return images;
}

async function generateSingleImage(
  promptResult: PromptResult,
  referenceImageUrl: string
): Promise<string> {
  const suchuangKey = process.env.SUCHUANG_API_KEY;
  const wanxiangKey = process.env.DASHSCOPE_API_KEY;

  if (suchuangKey) {
    try {
      const aspectRatio = promptResult.imageSize === '720*1280' ? '9:16'
        : promptResult.imageSize === '1280*720' ? '16:9'
        : '1:1';

      const imageUrl = await generateImageWithSuchuang({
        imageUrl: referenceImageUrl,
        prompt: promptResult.prompt,
        size: '2K',
        aspectRatio,
      });
      return imageUrl;
    } catch (error) {
      logger.warn('[工作流] 速创生图失败，尝试通义万相', { error: (error as Error).message });
    }
  }

  if (wanxiangKey) {
    const imageUrl = await generateImageWithWanxiang(
      promptResult.prompt,
      'V1',
      promptResult.imageSize,
      promptResult.negativePrompt
    );
    return imageUrl;
  }

  throw new Error('未配置任何图片生成API Key（需要 DASHSCOPE_API_KEY 或 SUCHUANG_API_KEY）');
}

export async function runAnalysisOnly(
  imageUrl: string,
  onProgress?: ProgressCallback
): Promise<ProductAnalysisResult> {
  const updateProgress = (stage: WorkflowStage, progress: number, message: string) => {
    onProgress?.({
      stage,
      stageLabel: STAGE_LABELS[stage],
      progress,
      message,
    });
  };

  updateProgress('ANALYZING', 10, '正在识别商品信息...');
  const analysis = await analyzeProductStructured(imageUrl);
  updateProgress('ANALYZING', 100, `识别完成：${analysis.productName}`);
  return analysis;
}
