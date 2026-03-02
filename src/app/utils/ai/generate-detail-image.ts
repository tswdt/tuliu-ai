// app/utils/ai/generate-detail-image.ts
import { generateImageWithWanxiang } from './wanxiang';
import { removeProductBackground } from '../oss/remove-background';
import { generateProductPrompt } from './generate-prompt';
import { logger } from '@/app/utils/logger';

/**
 * 完整的商品图生成详情图流程
 * @param userUploadImageUrl 用户上传的商品图URL
 * @param platform 目标电商平台
 * @param mode 生成模式：text-to-image（文生图）/ image-to-image（图生图）
 * @returns 生成的详情图URL
 */
export async function generateDetailImage(
  userUploadImageUrl: string,
  platform: string,
  mode: "text-to-image" | "image-to-image" = "image-to-image"
): Promise<string> {
  try {
    logger.info("开始生成商品详情图", { userUploadImageUrl, platform, mode });

    // 步骤1：抠图去除背景
    logger.info("步骤1/3：开始抠图");
    const cutoutImageUrl = await removeProductBackground(userUploadImageUrl);
    logger.info("步骤1/3：抠图完成", { cutoutImageUrl });

    // 步骤2：生成专属提示词
    logger.info("步骤2/3：开始生成提示词");
    const prompt = await generateProductPrompt(cutoutImageUrl, platform);
    logger.info("步骤2/3：提示词生成完成", { prompt });

    // 步骤3：选择文生图/图生图
    logger.info("步骤3/3：开始生成商品图", { mode });
    
    if (mode === "text-to-image") {
      // 文生图：直接用提示词生成
      const imageUrl = await generateImageWithWanxiang(prompt, "V1", "800*800");
      logger.info("步骤3/3：文生图完成", { imageUrl });
      return imageUrl;
    } else {
      // 图生图：把抠图后的商品图和提示词一起传给大模型
      const enhancedPrompt = `${prompt}，保留商品主体，替换背景为电商场景`;
      const imageUrl = await generateImageWithWanxiang(
        enhancedPrompt,
        "V1",
        "800*800"
      );
      logger.info("步骤3/3：图生图完成", { imageUrl });
      return imageUrl;
    }
  } catch (error) {
    logger.error("生成详情图异常", { error: (error as Error).message, userUploadImageUrl });
    throw error;
  }
}
