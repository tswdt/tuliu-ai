import { NextResponse } from 'next/server';
import { generateDetailImage } from '@/app/utils/ai/generate-detail-image';
import { logger } from '@/app/utils/logger';

export async function GET() {
  try {
    logger.info("=== 开始测试完整的电商AI商品详情页生成流程 ===");

    // 测试用的图片URL（使用placehold作为测试图片）
    const testImageUrl = "https://placehold.co/800x800/3b82f6/ffffff?text=Test+Product";
    const testPlatform = "TAOBAO";

    logger.info("测试配置", { 
      testImageUrl, 
      testPlatform 
    });

    // 步骤1-3：完整流程
    const results: any = {};

    // 先测试文生图模式
    logger.info("--- 测试文生图模式 ---");
    try {
      const textToImageUrl = await generateDetailImage(
        testImageUrl, 
        testPlatform, 
        "text-to-image"
      );
      results.textToImage = {
        success: true,
        imageUrl: textToImageUrl
      };
      logger.info("文生图测试成功", { imageUrl: textToImageUrl });
    } catch (error) {
      results.textToImage = {
        success: false,
        error: error instanceof Error ? error.message : "未知错误"
      };
      logger.error("文生图测试失败", error);
    }

    // 再试图生图模式
    logger.info("--- 测试图生图模式 ---");
    try {
      const imageToImageUrl = await generateDetailImage(
        testImageUrl, 
        testPlatform, 
        "image-to-image"
      );
      results.imageToImage = {
        success: true,
        imageUrl: imageToImageUrl
      };
      logger.info("图生图测试成功", { imageUrl: imageToImageUrl });
    } catch (error) {
      results.imageToImage = {
        success: false,
        error: error instanceof Error ? error.message : "未知错误"
      };
      logger.error("图生图测试失败", error);
    }

    // 生成4张不同场景的详情图
    logger.info("--- 生成4张详情图 ---");
    const detailImages: string[] = [];
    const sceneTypes = ["主图", "场景图1", "细节图1", "卖点图1"];
    
    for (let i = 0; i < 4; i++) {
      try {
        logger.info(`生成第 ${i + 1}/4 张详情图: ${sceneTypes[i]}`);
        const imageUrl = await generateDetailImage(
          testImageUrl, 
          testPlatform, 
          i % 2 === 0 ? "text-to-image" : "image-to-image"
        );
        detailImages.push(imageUrl);
        logger.info(`第 ${i + 1} 张详情图生成成功`, { imageUrl });
      } catch (error) {
        logger.error(`第 ${i + 1} 张详情图生成失败`, error);
        detailImages.push(`https://placehold.co/800x800/cccccc/666666?text=Failed+${i + 1}`);
      }
    }

    results.detailImages = {
      success: detailImages.filter(url => !url.includes("Failed")).length > 0,
      images: detailImages,
      count: detailImages.length
    };

    logger.info("=== 完整流程测试完成 ===");

    return NextResponse.json({
      success: true,
      message: "完整流程测试完成",
      testImageUrl,
      testPlatform,
      results,
      summary: {
        textToImage: results.textToImage?.success ? "✅ 成功" : "❌ 失败",
        imageToImage: results.imageToImage?.success ? "✅ 成功" : "❌ 失败",
        detailImages: `${results.detailImages?.images?.filter((url: string) => !url.includes("Failed")).length || 0}/${results.detailImages?.count || 0} 张成功`
      }
    });

  } catch (error) {
    logger.error("完整流程测试异常", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "完整流程测试失败" 
      },
      { status: 500 }
    );
  }
}
