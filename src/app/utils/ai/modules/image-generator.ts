import { logger } from '@/app/utils/logger';
import { PromptResult } from '@/lib/prompt-engine';
import { generateImageWithWanxiang } from '../wanxiang';
import { generateImageWithSuchuang } from '../suchuang-image';

export interface ImageGenInput {
  prompts: PromptResult[];
  referenceImageUrl: string;
  maxConcurrent?: number;
  onProgress?: (completed: number, total: number) => void;
}

export interface GeneratedImage {
  url: string;
  imageType: string;
  imageIndex: number;
  prompt: string;
  size: string;
  contentType: string;
}

export interface ImageGenOutput {
  images: GeneratedImage[];
  successCount: number;
  failCount: number;
}

export async function generateImages(input: ImageGenInput): Promise<ImageGenOutput> {
  const { prompts, referenceImageUrl, maxConcurrent = 3, onProgress } = input;
  const total = prompts.length;
  let completed = 0;

  logger.info('[模块5-图片生成] 开始生成', { total, maxConcurrent });

  const images: GeneratedImage[] = [];
  const batches: PromptResult[][] = [];
  for (let i = 0; i < prompts.length; i += maxConcurrent) {
    batches.push(prompts.slice(i, i + maxConcurrent));
  }

  for (const batch of batches) {
    const batchPromises = batch.map(async (promptResult) => {
      try {
        const imageUrl = await generateSingleImage(promptResult, referenceImageUrl);
        completed++;
        onProgress?.(completed, total);
        return {
          url: imageUrl,
          imageType: promptResult.imageType,
          imageIndex: prompts.indexOf(promptResult),
          prompt: promptResult.prompt,
          size: promptResult.imageSize,
          contentType: promptResult.imageType,
        } as GeneratedImage;
      } catch (error) {
        logger.warn('[模块5-图片生成] 单张图片生成失败', {
          imageType: promptResult.imageType,
          error: (error as Error).message,
        });
        completed++;
        onProgress?.(completed, total);
        return null;
      }
    });

    const batchResults = await Promise.all(batchPromises);
    for (const result of batchResults) {
      if (result) images.push(result);
    }
  }

  const output: ImageGenOutput = {
    images,
    successCount: images.length,
    failCount: total - images.length,
  };

  logger.info('[模块5-图片生成] 完成', {
    success: output.successCount,
    fail: output.failCount,
  });

  return output;
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
      logger.warn('[模块5-图片生成] 速创生图失败，尝试通义万相', { error: (error as Error).message });
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

  throw new Error('未配置任何图片生成API Key');
}
