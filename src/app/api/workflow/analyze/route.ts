import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/app/utils/logger';
import { analyzeProductStructured } from '@/app/utils/ai/qwen-vl';

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
    return NextResponse.json({ success: false, error: '请先登录' }, { status: 401 });
  }

  let body: { productImageUrls?: string[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: '请求格式错误' }, { status: 400 });
  }

  const { productImageUrls } = body;

  if (!productImageUrls || productImageUrls.length === 0) {
    return NextResponse.json({ success: false, error: '请上传产品图' }, { status: 400 });
  }

  const hasApiKey = !!process.env.DASHSCOPE_API_KEY;
  if (!hasApiKey) {
    return NextResponse.json({
      success: false,
      error: 'AI 服务未配置',
      detail: '请配置 DASHSCOPE_API_KEY 环境变量',
    }, { status: 503 });
  }

  const primaryImageUrl = productImageUrls[0];

  try {
    logger.info('[Analyze API] 开始识别', { userId });

    const analysis = await analyzeProductStructured(primaryImageUrl);

    logger.info('[Analyze API] 识别完成', { userId, productName: analysis.productName });

    return NextResponse.json({
      success: true,
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
    });
  } catch (error) {
    const errorMessage = (error as Error).message;
    logger.error('[Analyze API] 识别失败', { userId, error: errorMessage });

    return NextResponse.json({
      success: false,
      error: `商品识别失败：${errorMessage}`,
    }, { status: 500 });
  }
}
