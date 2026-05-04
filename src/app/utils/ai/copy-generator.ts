import { logger } from '@/app/utils/logger';
import { ProductAnalysisResult } from './qwen-vl';
import { generateCopyPrompt } from '@/lib/prompt-engine';

const LLM_CONFIG = {
  url: process.env.APIYI_LLM_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
  key: process.env.DASHSCOPE_API_KEY || process.env.APIYI_API_KEY,
  model: process.env.APIYI_LLM_MODEL || 'qwen-plus',
  name: '通义千问LLM'
};

export interface CopyContent {
  mainTitle: string;
  subTitle: string;
  coreSellingPoints: string[];
  productDetails: string;
  usageScenarios: string[];
  specHighlights: string[];
  faq: Array<{
    question: string;
    answer: string;
  }>;
}

export async function generateCopyContent(
  analysis: ProductAnalysisResult,
  platform: string,
  sellingPoints: string[]
): Promise<CopyContent> {
  const prompt = generateCopyPrompt(analysis, platform, sellingPoints);

  if (!LLM_CONFIG.key) {
    logger.warn('[文案生成] API Key未配置，返回默认文案');
    return getDefaultCopyContent(analysis, sellingPoints);
  }

  logger.info('[文案生成] 开始生成详情页文案', {
    productName: analysis.productName,
    platform,
    model: LLM_CONFIG.model
  });

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    try {
      const response = await fetch(LLM_CONFIG.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${LLM_CONFIG.key}`
        },
        body: JSON.stringify({
          model: LLM_CONFIG.model,
          messages: [
            {
              role: 'system',
              content: '你是一位资深电商文案专家，擅长撰写高转化率的商品详情页文案。你必须严格按照用户要求的JSON格式输出，不要输出任何其他内容。'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 2000
        }),
        signal: controller.signal
      });

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorText = await response.text();
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.message || errorData.error?.message || errorMessage;
          } catch {
            errorMessage = errorText || errorMessage;
          }
        } catch {
        }
        throw new Error(`文案生成API调用失败：${errorMessage}`);
      }

      const data = await response.json();
      let content = data.choices?.[0]?.message?.content;

      if (!content) {
        throw new Error('文案生成API返回内容为空');
      }

      content = content.trim();

      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        logger.warn('[文案生成] 响应中未找到JSON，使用默认文案', { content: content.substring(0, 200) });
        return getDefaultCopyContent(analysis, sellingPoints);
      }

      const parsed = JSON.parse(jsonMatch[0]);

      const copyContent: CopyContent = {
        mainTitle: parsed.mainTitle || `${analysis.productName} - 品质之选`,
        subTitle: parsed.subTitle || `${analysis.productName}，匠心打造，给您极致体验`,
        coreSellingPoints: Array.isArray(parsed.coreSellingPoints) ? parsed.coreSellingPoints : sellingPoints,
        productDetails: parsed.productDetails || `这是${analysis.productName}的详细介绍。采用${analysis.material}材质，${analysis.style}风格设计，为您带来卓越的使用体验。`,
        usageScenarios: Array.isArray(parsed.usageScenarios) ? parsed.usageScenarios : analysis.usageScenarios,
        specHighlights: Array.isArray(parsed.specHighlights) ? parsed.specHighlights : [`${analysis.material}材质`, `${analysis.color.join('/')}配色`],
        faq: Array.isArray(parsed.faq) ? parsed.faq : [
          { question: '产品尺寸是多少？', answer: '产品为标准尺寸，具体请参考详情页规格表。' },
          { question: '如何保养？', answer: '建议定期清洁，避免阳光直射。' },
          { question: '有质保吗？', answer: '我们提供完善的售后服务，让您购物无忧。' },
        ]
      };

      logger.info('[文案生成] 文案生成成功', { mainTitle: copyContent.mainTitle });
      return copyContent;

    } finally {
      clearTimeout(timeoutId);
    }

  } catch (error) {
    logger.error('[文案生成] 文案生成失败', { error: (error as Error).message });
    return getDefaultCopyContent(analysis, sellingPoints);
  }
}

function getDefaultCopyContent(analysis: ProductAnalysisResult, sellingPoints: string[]): CopyContent {
  return {
    mainTitle: `${analysis.productName} - 品质之选`,
    subTitle: `${analysis.productName}，${analysis.material}材质，${analysis.style}风格，匠心打造`,
    coreSellingPoints: sellingPoints.length > 0 ? sellingPoints : analysis.suggestedSellingPoints,
    productDetails: `这是${analysis.productName}的详细介绍。采用${analysis.material}材质，${analysis.style}风格设计，${analysis.color.join('/')}配色，适用于${analysis.usageScenarios.join('、')}等场景。我们精选优质材料，精湛工艺，为您带来卓越的使用体验。`,
    usageScenarios: analysis.usageScenarios,
    specHighlights: [`${analysis.material}材质`, `${analysis.color.join('/')}配色`, `${analysis.style}风格`],
    faq: [
      { question: '产品尺寸是多少？', answer: '产品为标准尺寸，具体请参考详情页规格表。' },
      { question: '如何保养？', answer: '建议定期清洁，避免阳光直射。' },
      { question: '有质保吗？', answer: '我们提供完善的售后服务，让您购物无忧。' },
    ]
  };
}
