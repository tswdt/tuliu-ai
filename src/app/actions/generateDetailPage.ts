"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { generateDetailPageSchema, GenerateDetailPageParams } from "@/types/generate";
import { ProductFeature, CopyContent, WorkflowStage, GenerationStatus, ImageType } from "@/types/generate";
import {
  validateImageFormat,
  validateImageSize,
  buildCopyGenerationPrompt,
  buildImageGenerationPrompt,
  generateStoragePath,
  generateTempStoragePath,
  calculateOverallProgress,
  withRetry,
  withTimeout,
  sanitizeFileName,
  IMAGE_GENERATION_PLAN,
  TOTAL_IMAGES_TO_GENERATE,
} from "@/lib/generateUtils";
import { generateImageWithWanxiang } from '@/app/utils/ai/wanxiang';

// ==================== 全局状态管理（用于演示，生产环境应使用Redis） ====================
const generationProgressMap = new Map<string, {
  stage: WorkflowStage;
  progress: number;
  message: string;
  imageProgress?: { current: number; total: number; type: ImageType };
}>();

const userLastGenerationMap = new Map<string, number>();
const userActiveGenerationMap = new Map<string, string>();

// ==================== 日志工具（简单实现） ====================
const logger = {
  info: (message: string, data?: any) => {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`, data || "");
  },
  error: (message: string, error?: any) => {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, error || "");
  },
  warn: (message: string, data?: any) => {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, data || "");
  },
};

// ==================== 接口限流 ====================
function checkRateLimit(userId: string): { allowed: boolean; message?: string } {
  const now = Date.now();
  const lastGeneration = userLastGenerationMap.get(userId) || 0;
  const oneMinuteAgo = now - 60 * 1000;

  if (lastGeneration > oneMinuteAgo) {
    return { allowed: false, message: "请求过于频繁，请稍后再试" };
  }

  userLastGenerationMap.set(userId, now);
  return { allowed: true };
}

// ==================== 并发控制 ====================
function checkActiveGeneration(userId: string): { allowed: boolean; message?: string } {
  const activeGenerationId = userActiveGenerationMap.get(userId);
  if (activeGenerationId) {
    return { allowed: false, message: "您有一个生成任务正在进行中，请等待完成" };
  }
  return { allowed: true };
}

// ==================== 更新进度 ====================
async function updateProgress(
  generationId: string,
  stage: WorkflowStage,
  message: string,
  imageProgress?: { current: number; total: number; type: ImageType }
) {
  const progress = calculateOverallProgress(stage, imageProgress || null);
  
  generationProgressMap.set(generationId, {
    stage,
    progress,
    message,
    imageProgress,
  });

  await prisma.generation.update({
    where: { id: generationId },
    data: {
      workflowStage: stage,
      progress,
    },
  });

  logger.info(`进度更新: ${generationId} - ${stage} - ${progress}%`);
}

// ==================== 步骤1: 阿里云内容安全审核（模拟） ====================
async function performContentSafetyCheck(
  imageFile: File,
  textContent: string
): Promise<{ passed: boolean; reason?: string }> {
  logger.info("执行内容安全审核");
  
  // 模拟阿里云内容安全API调用
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // 演示：默认通过审核
  return { passed: true };
}

// ==================== 步骤2: 豆包多模态API - 商品特征提取（模拟） ====================
async function extractProductFeatures(imageUrl: string): Promise<ProductFeature> {
  logger.info("提取商品特征");
  
  // 模拟豆包多模态API调用
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // 返回模拟的商品特征
  return {
    productSubject: "示例商品",
    material: "高品质材质",
    color: "经典配色",
    size: "标准尺寸",
    style: "时尚风格",
    defectPositions: [],
  };
}

// ==================== 步骤3: 图像修复和抠图（模拟） ====================
async function processProductImage(
  imageUrl: string,
  userId: string
): Promise<{ whiteBgImageUrl: string; repairedImageUrl: string }> {
  logger.info("处理商品图片");
  
  // 模拟图像修复和抠图
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 返回模拟的处理后图片URL
  return {
    whiteBgImageUrl: "https://placehold.co/800x800/ffffff/000000?text=White+Background",
    repairedImageUrl: "https://placehold.co/800x800/f0f0f0/000000?text=Repaired+Image",
  };
}

// ==================== 步骤4: 通义千问API - 文案生成（模拟） ====================
async function generateCopyContent(
  params: GenerateDetailPageParams,
  productFeatures: ProductFeature
): Promise<CopyContent> {
  logger.info("生成详情页文案");
  
  const prompt = buildCopyGenerationPrompt(
    params.category,
    params.platform,
    params.productName,
    params.coreSellingPoints,
    productFeatures
  );
  
  // 模拟通义千问API调用
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // 返回模拟的文案内容
  return {
    mainTitle: `${params.productName} - 品质之选`,
    subTitle: `${params.productName}，匠心打造，给您极致体验`,
    coreSellingPoints: params.coreSellingPoints,
    productDetails: `这是${params.productName}的详细介绍。我们采用高品质材料，精湛工艺，为您带来卓越的使用体验。适用于多种场景，是您的理想选择。`,
    faq: [
      { question: "产品尺寸是多少？", answer: "产品为标准尺寸，具体请参考详情页规格表。" },
      { question: "如何保养？", answer: "建议定期清洁，避免阳光直射。" },
      { question: "有质保吗？", answer: "我们提供完善的售后服务，让您购物无忧。" },
    ],
  };
}

// ==================== 步骤5: 豆包AI绘画 - 图片生成（真实调用Nano Banana） ====================
async function generateImages(
  params: GenerateDetailPageParams,
  productFeatures: ProductFeature,
  referenceImageUrl: string,
  generationId: string,
  userId: string
): Promise<{
  mainImageUrl: string;
  sceneImageUrls: string[];
  detailImageUrls: string[];
  sellingPointImageUrls: string[];
}> {
  logger.info("开始生成图片");
  
  const result = {
    mainImageUrl: "",
    sceneImageUrls: [] as string[],
    detailImageUrls: [] as string[],
    sellingPointImageUrls: [] as string[],
  };

  let generatedCount = 0;

  for (const plan of IMAGE_GENERATION_PLAN) {
    for (let i = 0; i < plan.count; i++) {
      try {
        await withRetry(
          async () => {
            const prompt = buildImageGenerationPrompt(
              params.category,
              params.productName,
              params.style,
              productFeatures.material,
              productFeatures.color,
              params.coreSellingPoints,
              params.platform,
              plan.type
            );

            logger.info(`生成图片: ${plan.type} - ${i + 1}/${plan.count}`);

            // 调用真实的通义万相 API生成图片
            const imageUrl = await withTimeout(
              generateImageWithWanxiang(prompt, "V1", "800*800"),
              90000,
              "图片生成超时"
            );

            // 根据图片类型存储
            switch (plan.type) {
              case ImageType.MAIN_IMAGE:
                result.mainImageUrl = imageUrl;
                break;
              case ImageType.SCENE_IMAGE:
                result.sceneImageUrls.push(imageUrl);
                break;
              case ImageType.DETAIL_IMAGE:
                result.detailImageUrls.push(imageUrl);
                break;
              case ImageType.SELLING_POINT_IMAGE:
                result.sellingPointImageUrls.push(imageUrl);
                break;
            }

            generatedCount++;

            // 更新进度
            await updateProgress(
              generationId,
              WorkflowStage.IMAGE_GENERATION,
              `正在生成${plan.type}图片 (${i + 1}/${plan.count})`,
              { current: generatedCount, total: TOTAL_IMAGES_TO_GENERATE, type: plan.type }
            );
          },
          2,
          2000
        );
      } catch (error) {
        logger.error(`图片生成失败: ${plan.type} - ${i}`, error);
        // 失败时使用占位图
        const placeholderUrl = `https://placehold.co/800x800/cccccc/666666?text=Failed+to+Generate`;
        
        switch (plan.type) {
          case ImageType.MAIN_IMAGE:
            result.mainImageUrl = placeholderUrl;
            break;
          case ImageType.SCENE_IMAGE:
            result.sceneImageUrls.push(placeholderUrl);
            break;
          case ImageType.DETAIL_IMAGE:
            result.detailImageUrls.push(placeholderUrl);
            break;
          case ImageType.SELLING_POINT_IMAGE:
            result.sellingPointImageUrls.push(placeholderUrl);
            break;
        }
      }
    }
  }

  return result;
}

// ==================== 步骤6: 排版合成（模拟） ====================
async function composeDetailPage(
  copyContent: CopyContent,
  images: {
    mainImageUrl: string;
    sceneImageUrls: string[];
    detailImageUrls: string[];
    sellingPointImageUrls: string[];
  },
  generationId: string,
  userId: string
): Promise<string> {
  logger.info("合成详情页");
  
  await updateProgress(
    generationId,
    WorkflowStage.COMPOSITION,
    "正在合成详情页..."
  );

  // 模拟html2canvas合成过程
  await new Promise(resolve => setTimeout(resolve, 2000));

  // 返回模拟的详情页长图URL
  return "https://placehold.co/750x5000/ffffff/333333?text=Detail+Page";
}

// ==================== 辅助函数 ====================
function getRandomColor(): string {
  const colors = ["3b82f6", "10b981", "f59e0b", "8b5cf6", "ec4899", "06b6d4"];
  return colors[Math.floor(Math.random() * colors.length)];
}

// ==================== 主工作流 ====================
export async function generateDetailPage(
  formData: FormData
): Promise<{ success: boolean; generationId?: string; error?: string }> {
  try {
    // 解析参数
    const params = {
      productName: formData.get("productName") as string,
      category: formData.get("category") as any,
      coreSellingPoints: JSON.parse(formData.get("coreSellingPoints") as string || "[]"),
      platform: formData.get("platform") as any,
      style: formData.get("style") as any,
      resolution: formData.get("resolution") as any,
    };

    const imageFile = formData.get("image") as File;
    const userId = formData.get("userId") as string;

    if (!userId) {
      return { success: false, error: "请先登录" };
    }

    // 参数校验
    const validationResult = generateDetailPageSchema.safeParse(params);
    if (!validationResult.success) {
      return { 
        success: false, 
        error: validationResult.error.errors[0]?.message || "参数校验失败" 
      };
    }

    // 图片校验
    if (!imageFile || imageFile.size === 0) {
      return { success: false, error: "请上传商品图片" };
    }

    if (!validateImageFormat(imageFile.name)) {
      return { success: false, error: "图片格式不支持，请上传JPG、PNG或WebP格式" };
    }

    if (!validateImageSize(imageFile.size)) {
      return { success: false, error: "图片大小超过10MB限制" };
    }

    // 接口限流检查
    const rateLimitCheck = checkRateLimit(userId);
    if (!rateLimitCheck.allowed) {
      return { success: false, error: rateLimitCheck.message };
    }

    // 并发控制检查
    const activeGenerationCheck = checkActiveGeneration(userId);
    if (!activeGenerationCheck.allowed) {
      return { success: false, error: activeGenerationCheck.message };
    }

    // 检查用户额度
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return { success: false, error: "用户不存在" };
    }

    if (user.credits <= 0) {
      return { success: false, error: "额度不足，请购买套餐" };
    }

    // 创建生成记录
    const generation = await prisma.generation.create({
      data: {
        userId,
        productName: params.productName,
        category: params.category,
        style: params.style,
        platform: params.platform,
        resolution: params.resolution,
        sellingPoints: params.coreSellingPoints,
        status: GenerationStatus.PROCESSING,
        workflowStage: WorkflowStage.PREPROCESSING,
        progress: 0,
      },
    });

    // 设置活跃任务
    userActiveGenerationMap.set(userId, generation.id);

    logger.info(`开始生成任务: ${generation.id}`);

    // 异步执行完整工作流
    (async () => {
      let success = false;

      try {
        // 步骤1: 内容安全审核
        await updateProgress(
          generation.id,
          WorkflowStage.PREPROCESSING,
          "正在进行内容安全审核..."
        );

        const safetyCheck = await performContentSafetyCheck(
          imageFile,
          params.productName + " " + params.coreSellingPoints.join(" ")
        );

        if (!safetyCheck.passed) {
          throw new Error(`内容审核未通过: ${safetyCheck.reason}`);
        }

        // 步骤2: 图片预处理和特征提取
        await updateProgress(
          generation.id,
          WorkflowStage.PREPROCESSING,
          "正在分析商品图片..."
        );

        // 模拟上传原图
        const originalImageUrl = "https://placehold.co/800x800/eeeeee/333333?text=Original+Image";
        
        const productFeatures = await extractProductFeatures(originalImageUrl);

        // 步骤3: 图像修复和抠图
        await updateProgress(
          generation.id,
          WorkflowStage.PREPROCESSING,
          "正在处理商品图片..."
        );

        const { whiteBgImageUrl, repairedImageUrl } = await processProductImage(
          originalImageUrl,
          userId
        );

        // 步骤4: 文案生成
        await updateProgress(
          generation.id,
          WorkflowStage.COPY_GENERATION,
          "正在生成详情页文案..."
        );

        const copyContent = await generateCopyContent(params, productFeatures);

        // 步骤5: 图片生成
        const images = await generateImages(
          params,
          productFeatures,
          whiteBgImageUrl,
          generation.id,
          userId
        );

        // 步骤6: 排版合成
        const detailPageUrl = await composeDetailPage(
          copyContent,
          images,
          generation.id,
          userId
        );

        // 使用事务完成数据保存
        await prisma.$transaction(async (tx) => {
          // 扣减额度
          await tx.user.update({
            where: { id: userId },
            data: {
              credits: { decrement: 1 },
              totalGenerations: { increment: 1 },
            },
          });

          // 更新生成记录
          await tx.generation.update({
            where: { id: generation.id },
            data: {
              status: GenerationStatus.COMPLETED,
              workflowStage: WorkflowStage.COMPLETED,
              progress: 100,
              originalImageUrl,
              whiteBgImageUrl,
              mainImageUrl: images.mainImageUrl,
              sceneImageUrls: images.sceneImageUrls,
              detailImageUrls: images.detailImageUrls,
              sellingPointImageUrls: images.sellingPointImageUrls,
              detailPageUrl,
              copyContent: copyContent as any,
              copyText: JSON.stringify(copyContent),
              resultUrls: [
                images.mainImageUrl,
                ...images.sceneImageUrls,
                ...images.detailImageUrls,
                ...images.sellingPointImageUrls,
                detailPageUrl,
              ],
            },
          });

          // 创建素材记录
          const allImages = [
            { url: images.mainImageUrl, type: ImageType.MAIN_IMAGE },
            ...images.sceneImageUrls.map(url => ({ url, type: ImageType.SCENE_IMAGE })),
            ...images.detailImageUrls.map(url => ({ url, type: ImageType.DETAIL_IMAGE })),
            ...images.sellingPointImageUrls.map(url => ({ url, type: ImageType.SELLING_POINT_IMAGE })),
            { url: detailPageUrl, type: ImageType.DETAIL_PAGE },
          ];

          for (const [index, img] of allImages.entries()) {
            await tx.mediaItem.create({
              data: {
                userId,
                generationId: generation.id,
                name: `${params.productName}_${img.type}_${index}`,
                url: img.url,
                type: "image",
                imageType: img.type,
                width: 800,
                height: img.type === ImageType.DETAIL_PAGE ? 5000 : 800,
              },
            });
          }
        });

        success = true;
        logger.info(`生成任务完成: ${generation.id}`);

      } catch (error) {
        logger.error(`生成任务失败: ${generation.id}`, error);

        // 任务失败处理
        await prisma.generation.update({
          where: { id: generation.id },
          data: {
            status: GenerationStatus.FAILED,
            errorMessage: error instanceof Error ? error.message : "生成失败",
          },
        });

        // 非用户违规原因，返还额度
        if (
          error instanceof Error &&
          !error.message.includes("审核") &&
          !error.message.includes("违规")
        ) {
          await prisma.user.update({
            where: { id: userId },
            data: { credits: { increment: 1 } },
          });
          logger.info(`已返还用户额度: ${userId}`);
        }
      } finally {
        // 清理活跃任务标记
        userActiveGenerationMap.delete(userId);
        generationProgressMap.delete(generation.id);
      }
    })();

    revalidatePath("/dashboard");
    revalidatePath(`/generate/${generation.id}`);

    return { success: true, generationId: generation.id };

  } catch (error) {
    logger.error("生成详情页异常", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "服务器错误，请稍后重试" 
    };
  }
}

// ==================== 查询生成进度 ====================
export async function getGenerationProgress(generationId: string) {
  const progress = generationProgressMap.get(generationId);
  if (progress) {
    return progress;
  }

  const generation = await prisma.generation.findUnique({
    where: { id: generationId },
    select: {
      workflowStage: true,
      progress: true,
      status: true,
    },
  });

  if (!generation) {
    return null;
  }

  return {
    stage: generation.workflowStage || WorkflowStage.PREPROCESSING,
    progress: generation.progress,
    message: generation.status === GenerationStatus.COMPLETED 
      ? "生成完成" 
      : generation.status === GenerationStatus.FAILED 
        ? "生成失败" 
        : "处理中...",
  };
}

// ==================== 取消生成任务 ====================
export async function cancelGeneration(generationId: string, userId: string) {
  const generation = await prisma.generation.findUnique({
    where: { id: generationId },
  });

  if (!generation || generation.userId !== userId) {
    return { success: false, error: "无权操作" };
  }

  if (generation.status !== GenerationStatus.PROCESSING) {
    return { success: false, error: "任务已完成或失败，无法取消" };
  }

  // 清理状态
  userActiveGenerationMap.delete(userId);
  generationProgressMap.delete(generationId);

  // 更新状态
  await prisma.generation.update({
    where: { id: generationId },
    data: {
      status: GenerationStatus.FAILED,
      errorMessage: "用户取消",
    },
  });

  // 返还额度
  await prisma.user.update({
    where: { id: userId },
    data: { credits: { increment: 1 } },
  });

  return { success: true };
}

// ==================== 获取生成结果 ====================
export async function getGenerationResult(generationId: string) {
  const generation = await prisma.generation.findUnique({
    where: { id: generationId },
    include: { mediaItems: true }
  });

  if (!generation) {
    return null;
  }

  return {
    generationId: generation.id,
    mainImageUrl: generation.mainImageUrl || "https://placehold.co/800x800/cccccc/666666?text=No+Image",
    sceneImageUrls: generation.sceneImageUrls || [],
    detailImageUrls: generation.detailImageUrls || [],
    sellingPointImageUrls: generation.sellingPointImageUrls || [],
    detailPageUrl: generation.detailPageUrl || "https://placehold.co/750x5000/cccccc/666666?text=No+Detail+Page",
    copyContent: generation.copyContent || {
      mainTitle: "商品详情",
      subTitle: "",
      coreSellingPoints: [],
      productDetails: "",
      faq: []
    },
    copyText: generation.copyText || "{}",
    status: generation.status,
    errorMessage: generation.errorMessage
  };
}

// 生成电商商品主图（对接生成工作台）
export async function generateProductMainImage(
  productName: string,
  sellingPoints: string[],
  platform: string, // 如taobao/douyin/amazon
  userId: string
) {
  // 1. 电商平台尺寸适配（可扩展更多平台）
  const platformSizeMap: Record<string, string> = {
    taobao: "800x800",
    douyin: "1080x1920",
    amazon: "1000x1000",
    pdd: "750x750",
    xhs: "1080x1080"
  };
  const imageSize = platformSizeMap[platform] || "800x800";

  // 2. 构造电商专属提示词（核心：商品信息+平台要求+画质）
  const prompt = `
    电商${platform}平台商品主图，${productName}，${sellingPoints.join("、")}，
    ${imageSize}分辨率，4K超清细节，商品主体居中突出，背景简洁干净，
    商用无版权，色彩还原真实，光影自然，无水印无文字，符合电商平台上架规范
  `.replace(/\n/g, "").trim();

  try {
    // 3. 调用通义万相（阿里官方AI，生成电商图）
    const wanxiangSize = imageSize.replace('x', '*');
    const imageUrl = await generateImageWithWanxiang(prompt, "V1", wanxiangSize);

    // 4. 复用项目逻辑：将生成的图片上传到阿里云OSS（持久化存储）
    // 注意：这里先返回生成的URL，实际项目中需要实现uploadToAliOSS函数
    const ossImageUrl = imageUrl; // 临时直接使用生成的URL

    // 5. 复用项目逻辑：记录到数据库生成记录
    await prisma.generation.create({
      data: {
        userId,
        productName,
        sellingPoints,
        platform: platform.toUpperCase() as any,
        mainImageUrl: ossImageUrl,
        status: GenerationStatus.COMPLETED,
        workflowStage: WorkflowStage.COMPLETED,
        progress: 100,
      },
    });

    return { success: true, imageUrl: ossImageUrl };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}
