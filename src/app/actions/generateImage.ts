"use server";

import { generateImageWithSuchuang } from '@/app/utils/ai/suchuang-image';
import { analyzeProductFromImage } from '@/app/utils/ai/qwen-vl';
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
  referenceImageUrl?: string
) {
  console.log("\n========================================");
  console.log("[流程开始] 🚀 商品图片生成流程启动");
  console.log("========================================");
  
  try {
    console.log("\n[Node B] 📥 后端接收到的请求参数");
    console.log("[Node B] 商品名称:", productName);
    console.log("[Node B] 用户提示词:", prompt);
    console.log("[Node B] 接收到的原图 OSS URL:", referenceImageUrl ? referenceImageUrl.substring(0, 80) + '...' : '无');
    console.log("[Node B] 平台:", platform);
    console.log("[Node B] 图片数量:", imageCount);
    console.log("[Node B] 风格:", style);

    logger.info("开始生成商品图片", { productName, platform, imageCount, style, hasReferenceImage: !!referenceImageUrl });

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
    console.log("\n[Node B] 平台尺寸:", imageSize);

    let finalProductName = productName;

    if (referenceImageUrl) {
      console.log("\n[Node Cache] 🔍 检查参考图缓存...");
      logger.info("检查参考图缓存是否命中");
      const cachedImages = await getCachedImages(referenceImageUrl, style, platform, productName);
      if (cachedImages && cachedImages.length > 0) {
        console.log("[Node Cache] ✅ 缓存命中，直接返回历史结果");
        logger.info("缓存命中，直接返回历史结果", { count: cachedImages.length });
        return { success: true, images: cachedImages, cached: true };
      }
      console.log("[Node Cache] ❌ 缓存未命中，开始新的生成流程");
      logger.info("缓存未命中，开始新的生成流程");

      console.log("\n[Node Vision] 🔍 开始视觉识别商品...");
      logger.info("开始视觉识别商品");
      finalProductName = await analyzeProductFromImage(referenceImageUrl);
      console.log("[Node Vision] ✅ 视觉识别完成，商品主体:", finalProductName);
      logger.info("视觉识别完成", { finalProductName });
    }

    console.log("\n[Node E] 📝 开始构建提示词...");
    const { prompt: fullPrompt, negativePrompt } = buildWanxiangPrompt({
      productName: finalProductName,
      style,
      platform,
      additionalPrompt: prompt,
      imageSize,
      hasReferenceImage: !!referenceImageUrl
    });

    const combinedPrompt = `${fullPrompt}\n\n负面提示词：${negativePrompt}`;
    console.log("[Node E] ✅ 提示词构建完成");
    console.log("[Node E] 喂给大模型的完整 Prompt (前200字符):", combinedPrompt.substring(0, 200) + '...');

    console.log("\n[Node Safety] 🔒 进行内容安全检测...");
    logger.info("进行内容安全检测");
    const safetyCheck = await checkTextSafety(fullPrompt);
    if (!safetyCheck.passed) {
      console.log("[Node Safety] ❌ 内容安全检测未通过");
      logger.warn("内容安全检测未通过", { reason: safetyCheck.reason });
      return {
        success: false,
        error: `内容安全检测未通过: ${safetyCheck.reason || '包含违规内容'}`
      };
    }
    console.log("[Node Safety] ✅ 内容安全检测通过");
    logger.info("内容安全检测通过");

    const images: string[] = [];

    console.log("\n[Node F] 🎨 开始图片生成流程...");
    console.log("[Node F] 生成模式:", referenceImageUrl ? '图生图' : '文生图');
    logger.info(`开始生成 ${imageCount} 张图片`, { 
      mode: referenceImageUrl ? '图生图' : '文生图',
      referenceImageUrl: referenceImageUrl ? referenceImageUrl.substring(0, 50) + '...' : '无'
    });
    
    for (let i = 0; i < imageCount; i++) {
      console.log(`\n[Node F] ===== 第 ${i + 1}/${imageCount} 张图片 =====`);
      console.log(`[Node F] 开始生成第 ${i + 1}/${imageCount} 张图片`);
      logger.info(`生成第 ${i + 1}/${imageCount} 张图片`);
      
      try {
        const imageUrl = await generateImageWithSuchuang({
          imageUrl: referenceImageUrl,
          prompt: combinedPrompt,
          size: '2K',
          aspectRatio: '1:1'
        });
        images.push(imageUrl);
        console.log(`[Node F] ✅ 第 ${i + 1} 张图片生成成功`);
        console.log(`[Node F] 图片 URL (前80字符):`, imageUrl.substring(0, 80) + '...');
        logger.info(`第 ${i + 1} 张图片生成成功`, { imageUrl });
      } catch (error) {
        console.log(`[Node F] ❌ 第 ${i + 1} 张图片生成失败:`, (error as Error).message);
        throw error;
      }
    }

    console.log("\n[Node OSS] 📤 开始上传图片到 OSS...");
    logger.info("商品图片生成完成，开始上传到OSS并裁剪为800x800", { count: images.length });
    
    const uploadedImages = await uploadMultipleImagesToOSS(
      images, 
      `product-images/${productName}`,
      { width: 800, height: 800 }
    );
    
    console.log("[Node OSS] ✅ 图片上传 OSS 完成");
    logger.info("商品图片上传OSS并裁剪完成", { count: uploadedImages.length });

    if (referenceImageUrl) {
      console.log("\n[Node Cache] 💾 保存结果到缓存...");
      logger.info("保存结果到缓存");
      await setCachedImages(referenceImageUrl, style, platform, finalProductName, uploadedImages);
      console.log("[Node Cache] ✅ 缓存保存完成");
    }

    console.log("\n========================================");
    console.log("[流程完成] ✅ 商品图片生成流程成功完成");
    console.log("========================================\n");

    return { success: true, images: uploadedImages, cached: false };

  } catch (error) {
    console.log("\n========================================");
    console.log("[流程错误] ❌ 商品图片生成流程失败");
    console.log("[流程错误] 错误信息:", (error as Error).message);
    console.log("========================================\n");
    
    logger.error("商品图片生成失败", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "生成失败，请重试" 
    };
  }
}
