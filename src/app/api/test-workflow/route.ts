import { NextRequest, NextResponse } from 'next/server';
import { runFullWorkflow, runAnalysisOnly, WorkflowProgress } from '@/app/utils/ai/workflow';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageUrl, platform, style, sellingPoints, mode } = body;

    if (!imageUrl) {
      return NextResponse.json(
        { error: '缺少 imageUrl 参数' },
        { status: 400 }
      );
    }

    const targetPlatform = platform || 'TAOBAO';
    const targetStyle = style || 'SIMPLE';
    const points = sellingPoints || [];

    if (mode === 'analyze') {
      const analysis = await runAnalysisOnly(imageUrl, (progress: WorkflowProgress) => {
        console.log(`[测试API] ${progress.stageLabel} - ${progress.message}`);
      });

      return NextResponse.json({
        success: true,
        mode: 'analyze',
        analysis,
      });
    }

    const progressLog: WorkflowProgress[] = [];

    const result = await runFullWorkflow(
      imageUrl,
      targetPlatform,
      targetStyle,
      points,
      (progress: WorkflowProgress) => {
        progressLog.push(progress);
        console.log(`[测试API] ${progress.stageLabel} [${progress.progress}%] - ${progress.message}`);
      }
    );

    return NextResponse.json({
      success: true,
      mode: 'full',
      result: {
        analysis: {
          productName: result.analysis.productName,
          category: result.analysis.category,
          color: result.analysis.color,
          material: result.analysis.material,
          style: result.analysis.style,
          features: result.analysis.features,
          suggestedSellingPoints: result.analysis.suggestedSellingPoints,
          usageScenarios: result.analysis.usageScenarios,
          brandName: result.analysis.brandName,
          targetAudience: result.analysis.targetAudience,
        },
        imageCount: result.images.length,
        images: result.images.map(img => ({
          imageType: img.imageType,
          imageIndex: img.imageIndex,
          url: img.url,
          size: img.size,
        })),
        copy: result.copy,
        platform: result.platform,
        style: result.style,
      },
      progressLog: progressLog.map(p => ({
        stage: p.stage,
        label: p.stageLabel,
        progress: p.progress,
        message: p.message,
      })),
    });

  } catch (error) {
    console.error('[测试API] 工作流执行失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'AI 电商工作流测试 API',
    usage: {
      analyze: 'POST { "imageUrl": "...", "mode": "analyze" } - 仅识别商品',
      full: 'POST { "imageUrl": "...", "platform": "TAOBAO", "style": "SIMPLE", "sellingPoints": [], "mode": "full" } - 完整工作流',
    },
    supportedPlatforms: ['TAOBAO', 'TMALL', 'JD', 'PINDUODUO', 'DOUYIN', 'XIAOHONGSHU', 'AMAZON', 'TEMU', 'SHOPIFY', 'CUSTOM'],
    supportedStyles: ['SIMPLE', 'LUXURY', 'NATIONAL_TREND', 'TECH', 'NATURAL'],
  });
}
