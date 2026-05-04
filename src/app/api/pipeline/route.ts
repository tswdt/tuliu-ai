import { NextRequest, NextResponse } from 'next/server';
import { runPipeline, runRecognitionOnly, PipelineInput } from '@/app/utils/ai/modules/pipeline';
import { logger } from '@/app/utils/logger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageUrl, platformId, styleId, contentTypes, userEdits, exportFormat, mode } = body;

    if (!imageUrl) {
      return NextResponse.json(
        { success: false, error: '缺少图片URL' },
        { status: 400 }
      );
    }

    if (mode === 'recognize') {
      logger.info('[工作流API] 仅识别模式', { imageUrl: imageUrl.substring(0, 80) });

      const recognition = await runRecognitionOnly(imageUrl);
      return NextResponse.json({ success: true, recognition });
    }

    if (!platformId) {
      return NextResponse.json(
        { success: false, error: '缺少平台ID' },
        { status: 400 }
      );
    }

    const input: PipelineInput = {
      imageUrl,
      platformId,
      styleId: styleId || 'taobao-convert',
      contentTypes: contentTypes || [],
      userEdits,
      exportFormat: exportFormat || 'long-image',
    };

    logger.info('[工作流API] 完整工作流模式', {
      imageUrl: imageUrl.substring(0, 80),
      platformId,
      styleId: input.styleId,
      contentTypes: input.contentTypes,
    });

    const result = await runPipeline(input);
    return NextResponse.json({ success: true, result });

  } catch (error) {
    logger.error('[工作流API] 执行失败', { error: (error as Error).message });
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
