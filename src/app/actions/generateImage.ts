"use server";

import { generateImageWithWanxiang } from '@/app/utils/ai/wanxiang';
import { uploadMultipleImagesToOSS } from '@/app/utils/oss/upload-image';
import { logger } from '@/app/utils/logger';
import { getCachedImages, setCachedImages } from '@/app/utils/cache/image-cache';
import { checkTextSafety } from '@/app/utils/safety/content-safety';
import { buildWanxiangPrompt } from '@/app/utils/ai/prompt-adapter';

export async function generateProductImages(
  productName: string,
  prompt: string,
  platform: string,
  imageCount: number,
  style: string = "minimal",
  originalImageMD5?: string
) {
  try {
    logger.info("开始生成商品图片", { productName, platform, imageCount, style, hasMD5: !!originalImageMD5 });

    const platformSizeMap: Record<string, string> = {
      TAOBAO: "800x800",
      TMALL: "800x800",
      JD: "800x800",
      PINDUODUO: "750x750",
      DOUYIN: "1080x1920",
      XIAOHONGSHU: "1080x1080",
      AMAZON: "1000x1000",
      TEMU: "800x800",
      SHOPIFY: "1000x1000",
      CUSTOM: "800x800"
    };

    const imageSize = platformSizeMap[platform] || "800x800";
    const wanxiangSize = imageSize.replace('x', '*');

    if (originalImageMD5) {
      logger.info("检查MD5缓存是否命中");
      const cachedImages = await getCachedImages(originalImageMD5, style, platform, productName);
      if (cachedImages && cachedImages.length > 0) {
        logger.info("MD5缓存命中，直接返回历史结果", { count: cachedImages.length });
        return { success: true, images: cachedImages, cached: true };
      }
      logger.info("MD5缓存未命中，开始新的生成流程");
    }

    const { prompt: fullPrompt, negativePrompt } = buildWanxiangPrompt({
      productName,
      style,
      platform,
      additionalPrompt: prompt,
      imageSize
    });

    logger.info("进行内容安全检测");
    const safetyCheck = await checkTextSafety(fullPrompt);
    if (!safetyCheck.passed) {
      logger.warn("内容安全检测未通过", { reason: safetyCheck.reason });
      return {
        success: false,
        error: `内容安全检测未通过: ${safetyCheck.reason || '包含违规内容'}`
      };
    }
    logger.info("内容安全检测通过");

    const images: string[] = [];

    for (let i = 0; i < imageCount; i++) {
      logger.info(`生成第 ${i + 1}/${imageCount} 张图片`);
      const imageUrl = await generateImageWithWanxiang(fullPrompt, "V1", wanxiangSize, negativePrompt);
      images.push(imageUrl);
      logger.info(`第 ${i + 1} 张图片生成成功`, { imageUrl });
    }

    logger.info("商品图片生成完成，开始上传到OSS并裁剪为800x800", { count: images.length });
    
    const uploadedImages = await uploadMultipleImagesToOSS(
      images, 
      `product-images/${productName}`,
      { width: 800, height: 800 }
    );
    
    logger.info("商品图片上传OSS并裁剪完成", { count: uploadedImages.length });

    if (originalImageMD5) {
      logger.info("保存结果到MD5缓存");
      await setCachedImages(originalImageMD5, style, platform, productName, uploadedImages);
    }

    return { success: true, images: uploadedImages, cached: false };

  } catch (error) {
    logger.error("商品图片生成失败", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "生成失败，请重试" 
    };
  }
}
