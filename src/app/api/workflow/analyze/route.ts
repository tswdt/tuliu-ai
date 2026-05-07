import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/app/utils/logger';
import { analyzeProductStructured } from '@/app/utils/ai/qwen-vl';
import { generateImageWithSuchuang } from '@/app/utils/ai/suchuang-image';
import { generateImageWithWanxiang } from '@/app/utils/ai/wanxiang';
import { checkCredits, deductCredits } from '@/lib/credits';
import {
  buildImagePrompt,
  buildCopyPrompt,
  type WorkflowConfig,
} from '@/lib/prompt-builder';

const LLM_CONFIG = {
  url: process.env.APIYI_LLM_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
  key: process.env.DASHSCOPE_API_KEY || process.env.APIYI_API_KEY,
  model: process.env.APIYI_LLM_MODEL || 'qwen-plus',
};

function getUserId(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');
  if (!token) return null;
  const payload = verifyToken(token);
  return payload?.userId || null;
}

export async function POST(request: NextRequest) {
  const userId = getUserId(request);
  if (!userId) {
    return NextResponse.json({ success: false, error: '未登录' }, { status: 401 });
  }

  let body: WorkflowConfig;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: '请求格式错误' }, { status: 400 });
  }

  const {
    productImageUrls,
    competitorImageUrls,
    competitorReferenceModes,
    platform,
    language,
    model,
    outputTypes,
    mainImageCount,
    subImageCount,
    detailImageCount,
    detailModuleCount,
    sizePreset,
    quality,
    visualStyle,
    pricePositioning,
    postProcessingOptions,
    copyIntensity,
    targetAudiences,
    usageScenarios,
    subjectConsistency,
    subjectLockRules,
    detailDesc,
  } = body;

  if (!productImageUrls || productImageUrls.length === 0) {
    return NextResponse.json({ success: false, error: '请上传产品图' }, { status: 400 });
  }

  const hasApiKey = !!(process.env.DASHSCOPE_API_KEY || process.env.SUCHUANG_API_KEY);
  if (!hasApiKey) {
    return NextResponse.json({
      success: false,
      error: 'AI 服务未配置',
      detail: '请配置 DASHSCOPE_API_KEY 或 SUCHUANG_API_KEY 环境变量',
    }, { status: 503 });
  }

  const estimatedCredits =
    (parseInt(mainImageCount || '0') +
      parseInt(subImageCount || '0') +
      parseInt(detailImageCount || '0') +
      parseInt(detailModuleCount || '0')) * 2 + 1;

  const creditCheck = await checkCredits(userId, 'full_pipeline');
  if (!creditCheck.sufficient) {
    return NextResponse.json({
      success: false,
      error: '积分不足',
      detail: `需要约 ${estimatedCredits} 积分，当前余额 ${creditCheck.balance}`,
      balance: creditCheck.balance,
      required: estimatedCredits,
    }, { status: 402 });
  }

  const primaryImageUrl = productImageUrls[0];

  const project = await prisma.project.create({
    data: {
      userId,
      name: 'AI 生成项目',
      platform: platform || 'TAOBAO',
      status: 'processing',
      productData: JSON.stringify({
        productImageUrls,
        competitorImageUrls,
        competitorReferenceModes,
        config: body,
      }),
    },
  });

  const task = await prisma.task.create({
    data: {
      userId,
      projectId: project.id,
      type: 'full_pipeline',
      status: 'processing',
      progress: 0,
      stage: 'ANALYZING',
      message: '开始分析产品...',
      payload: JSON.stringify(body),
      creditCost: estimatedCredits,
      startedAt: new Date(),
    },
  });

  logger.info('[工作流API] 开始处理', { projectId: project.id, taskId: task.id, userId });

  try {
    await prisma.task.update({
      where: { id: task.id },
      data: { progress: 5, stage: 'ANALYZING', message: 'AI 识别商品中...' },
    });

    const analysis = await analyzeProductStructured(primaryImageUrl);

    await prisma.task.update({
      where: { id: task.id },
      data: {
        progress: 20,
        stage: 'ANALYZING',
        message: `识别完成：${analysis.productName}`,
      },
    });

    await prisma.project.update({
      where: { id: project.id },
      data: {
        name: analysis.productName || 'AI 生成项目',
        category: analysis.category,
        style: visualStyle,
        recognitionData: JSON.stringify(analysis),
      },
    });

    const imageCountMap: Record<string, number> = {
      main: parseInt(mainImageCount || '1'),
      sub: parseInt(subImageCount || '3'),
      detail: parseInt(detailImageCount || '4'),
      'selling-point': 0,
      white: 0,
      scene: 0,
      params: 0,
      size: 0,
      compare: 0,
      'detail-long': 0,
      'amazon-a-plus': 0,
      'video-cover': 0,
    };

    if (outputTypes.includes('detail-long')) {
      imageCountMap['detail-long'] = parseInt(detailModuleCount || '5');
    }

    const allImageTasks: { type: string; index: number }[] = [];
    for (const type of outputTypes) {
      const count = imageCountMap[type] || 1;
      for (let i = 0; i < count; i++) {
        allImageTasks.push({ type, index: i });
      }
    }

    const totalImages = allImageTasks.length;

    await prisma.task.update({
      where: { id: task.id },
      data: {
        progress: 25,
        stage: 'GENERATING_PROMPTS',
        message: `规划生成 ${totalImages} 张图片...`,
      },
    });

    await prisma.task.update({
      where: { id: task.id },
      data: {
        progress: 30,
        stage: 'GENERATING_IMAGES',
        message: `开始生成图片 (0/${totalImages})...`,
      },
    });

    const generatedImages: { url: string; type: string; index: number; prompt: string }[] = [];
    const maxConcurrent = 2;
    let completed = 0;

    for (let i = 0; i < allImageTasks.length; i += maxConcurrent) {
      const batch = allImageTasks.slice(i, i + maxConcurrent);

      const batchPromises = batch.map(async (imgTask) => {
        try {
          const { prompt, negativePrompt, aspectRatio } = buildImagePrompt(
            analysis,
            body,
            imgTask.type,
            imgTask.index
          );

          const suchuangKey = process.env.SUCHUANG_API_KEY;
          const wanxiangKey = process.env.DASHSCOPE_API_KEY;

          let imageUrl: string;

          if (suchuangKey) {
            try {
              imageUrl = await generateImageWithSuchuang({
                imageUrl: primaryImageUrl,
                prompt,
                size: quality === '4k' ? '4K' : quality === '1k' ? '1K' : '2K',
                aspectRatio,
              });
            } catch {
              if (wanxiangKey) {
                const sizeStr = aspectRatio === '9:16' ? '720*1280'
                  : aspectRatio === '16:9' ? '1280*720'
                  : '1024*1024';
                imageUrl = await generateImageWithWanxiang(prompt, 'V1', sizeStr, negativePrompt);
              } else {
                throw new Error('图片生成失败');
              }
            }
          } else if (wanxiangKey) {
            const sizeStr = aspectRatio === '9:16' ? '720*1280'
              : aspectRatio === '16:9' ? '1280*720'
              : '1024*1024';
            imageUrl = await generateImageWithWanxiang(prompt, 'V1', sizeStr, negativePrompt);
          } else {
            throw new Error('未配置图片生成API');
          }

          return { url: imageUrl, type: imgTask.type, index: imgTask.index, prompt };
        } catch (err) {
          logger.warn('[工作流API] 单张图片生成失败', {
            type: imgTask.type,
            index: imgTask.index,
            error: (err as Error).message,
          });
          return null;
        }
      });

      const batchResults = await Promise.all(batchPromises);
      for (const result of batchResults) {
        if (result) {
          generatedImages.push(result);
        }
        completed++;
      }

      const imgProgress = 30 + Math.floor((completed / totalImages) * 50);
      await prisma.task.update({
        where: { id: task.id },
        data: {
          progress: imgProgress,
          message: `正在生成图片 (${completed}/${totalImages})...`,
        },
      });
    }

    for (const img of generatedImages) {
      await prisma.projectImage.create({
        data: {
          projectId: project.id,
          imageUrl: img.url,
          imageType: img.type,
          label: `${img.type}-${img.index + 1}`,
          sortOrder: img.index,
          prompt: img.prompt,
        },
      });
    }

    await prisma.task.update({
      where: { id: task.id },
      data: {
        progress: 82,
        stage: 'GENERATING_COPY',
        message: '正在生成详情页文案...',
      },
    });

    let copyContent: any = null;
    if (LLM_CONFIG.key) {
      try {
        const copyPrompt = buildCopyPrompt(analysis, body);

        const llmResponse = await fetch(LLM_CONFIG.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${LLM_CONFIG.key}`,
          },
          body: JSON.stringify({
            model: LLM_CONFIG.model,
            messages: [
              {
                role: 'system',
                content: '你是资深电商文案专家。必须严格按JSON格式输出，不要输出其他内容。',
              },
              { role: 'user', content: copyPrompt },
            ],
            temperature: 0.7,
            max_tokens: 2000,
          }),
        });

        if (llmResponse.ok) {
          const llmData = await llmResponse.json();
          const content = llmData.choices?.[0]?.message?.content;
          if (content) {
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              copyContent = JSON.parse(jsonMatch[0]);
            }
          }
        }
      } catch (err) {
        logger.warn('[工作流API] 文案生成失败', { error: (err as Error).message });
      }
    }

    if (!copyContent) {
      copyContent = {
        mainTitle: `${analysis.productName} - 品质之选`,
        subTitle: `${analysis.productName}，${analysis.material}材质，${analysis.style}风格`,
        coreSellingPoints: analysis.suggestedSellingPoints,
        productDetails: `${analysis.productName}，采用${analysis.material}材质，${analysis.style}风格设计，适用于${analysis.usageScenarios.join('、')}等场景。`,
        usageScenarios: analysis.usageScenarios,
        specHighlights: [`${analysis.material}材质`, `${analysis.color.join('/')}配色`],
        faq: [
          { question: '产品规格？', answer: '请参考详情页规格参数。' },
          { question: '如何购买？', answer: '点击页面购买按钮即可下单。' },
        ],
      };
    }

    await prisma.project.update({
      where: { id: project.id },
      data: {
        status: 'completed',
        copyData: JSON.stringify(copyContent),
        thumbnailUrl: generatedImages[0]?.url || null,
      },
    });

    const deductResult = await deductCredits(userId, 'full_pipeline', {
      taskId: task.id,
      projectId: project.id,
      description: `AI生成 ${generatedImages.length} 张图片 + 文案`,
    });

    await prisma.task.update({
      where: { id: task.id },
      data: {
        status: 'completed',
        progress: 100,
        stage: 'COMPLETED',
        message: '全部生成完成',
        result: JSON.stringify({
          images: generatedImages,
          copy: copyContent,
          analysis: {
            productName: analysis.productName,
            category: analysis.category,
            color: analysis.color,
            material: analysis.material,
            style: analysis.style,
          },
        }),
        completedAt: new Date(),
      },
    });

    logger.info('[工作流API] 生成完成', {
      projectId: project.id,
      imageCount: generatedImages.length,
    });

    return NextResponse.json({
      success: true,
      projectId: project.id,
      taskId: task.id,
      analysis: {
        productName: analysis.productName,
        category: analysis.category,
        color: analysis.color,
        material: analysis.material,
        style: analysis.style,
        features: analysis.features,
        suggestedSellingPoints: analysis.suggestedSellingPoints,
        usageScenarios: analysis.usageScenarios,
        brandName: analysis.brandName,
        targetAudience: analysis.targetAudience,
      },
      images: generatedImages.map((img) => ({
        url: img.url,
        type: img.type,
        index: img.index,
        prompt: img.prompt,
      })),
      copy: copyContent,
      platform,
      creditsUsed: estimatedCredits,
      balance: deductResult.balance,
    });
  } catch (error) {
    const errorMessage = (error as Error).message;
    logger.error('[工作流API] 执行失败', { error: errorMessage, projectId: project.id });

    await prisma.project.update({
      where: { id: project.id },
      data: { status: 'failed' },
    });

    await prisma.task.update({
      where: { id: task.id },
      data: {
        status: 'failed',
        stage: 'FAILED',
        message: `生成失败：${errorMessage}`,
        error: errorMessage,
        completedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: false,
      error: errorMessage,
      projectId: project.id,
      taskId: task.id,
    }, { status: 500 });
  }
}
