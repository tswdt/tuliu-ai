import { logger } from '@/app/utils/logger';

const QWEN_VL_CONFIG = {
  url: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
  key: process.env.DASHSCOPE_API_KEY,
  model: 'qwen-vl-max',
  name: '通义千问视觉'
};

export interface ProductAnalysisResult {
  productName: string;
  category: string;
  color: string[];
  material: string;
  style: string;
  features: string[];
  suggestedSellingPoints: string[];
  packaging: string;
  usageScenarios: string[];
  brandName: string;
  targetAudience: string;
  rawDescription: string;
}

const ANALYSIS_SYSTEM_PROMPT = `你是一位资深电商商品分析师。请仔细观察这张商品图片，进行全方位的结构化分析。

你必须严格按照以下JSON格式输出，不要输出任何其他内容，不要用markdown代码块包裹：
{
  "productName": "商品名称（如包装上有品牌字样请务必读出，如'汤沟大曲白酒'、'Nike Air Max运动鞋'）",
  "category": "商品品类（必须从以下选择一个：CLOTHING/BEAUTY/ELECTRONICS/FOOD/HOME/BABY/SPORTS/JEWELRY/AUTOMOTIVE/PET/STATIONERY/OTHER）",
  "color": ["主色调1", "辅色调2"],
  "material": "主要材质（如：纯棉、不锈钢、ABS塑料、陶瓷、真皮等）",
  "style": "产品风格（如：休闲简约、商务正装、可爱卡通、科技感、复古风等）",
  "features": ["外观特征1", "外观特征2", "外观特征3"],
  "suggestedSellingPoints": ["建议卖点1", "建议卖点2", "建议卖点3", "建议卖点4", "建议卖点5"],
  "packaging": "包装描述（如：礼盒装、独立包装、散装等，无法判断则填'标准包装'）",
  "usageScenarios": ["使用场景1", "使用场景2", "使用场景3"],
  "brandName": "品牌名称（如能识别则填写，不能则填'未知品牌'）",
  "targetAudience": "目标人群（如：25-35岁都市女性、学生群体、中年男性等）"
}

分析要点：
1. 商品名称要具体，包含品牌+品类+核心属性
2. 品类必须从给定列表中选择最匹配的
3. 颜色要描述准确，如"酒红色"而非"红色"
4. 材质要根据外观合理推断
5. 卖点要从消费者角度出发，突出差异化优势
6. 使用场景要具体，便于后续生成场景图`;

export async function analyzeProductFromImage(imageUrl: string): Promise<string> {
  if (!QWEN_VL_CONFIG.key) {
    console.error("[视觉识别] ⚠️ 通义千问 API Key 未配置");
    const fallbackDescription = "一件未命名的电商商品";
    logger.info('[通义千问视觉] 使用默认描述（API Key未配置）', { fallbackDescription });
    return fallbackDescription;
  }

  logger.info('[通义千问视觉] 开始分析商品图片', {
    imageUrl: imageUrl.substring(0, 80) + '...',
    model: QWEN_VL_CONFIG.model
  });

  const systemPrompt = "作为电商图像分析师，请用极简的一句话精准识别图片里的核心商品。必须包含：商品名称（若包装上有品牌字样请务必读出，如'汤沟大曲白酒'）、材质、主色调。直接输出描述，不要废话。";

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const requestBody = {
        model: QWEN_VL_CONFIG.model,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: { url: imageUrl }
              },
              {
                type: "text",
                text: systemPrompt
              }
            ]
          }
        ]
      };

      const response = await fetch(QWEN_VL_CONFIG.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${QWEN_VL_CONFIG.key}`
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorText = await response.text();
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.message || errorData.error?.message || errorData.code || errorMessage;
          } catch {
            errorMessage = errorText || errorMessage;
          }
        } catch {
        }
        throw new Error(`通义千问视觉调用失败：${errorMessage}`);
      }

      const data = await response.json();
      let productDescription = data.choices?.[0]?.message?.content;

      if (!productDescription) {
        throw new Error('通义千问视觉返回响应中缺少商品描述');
      }

      productDescription = productDescription.trim();
      logger.info('[通义千问视觉] 识别成功', { productDescription });
      return productDescription;

    } finally {
      clearTimeout(timeoutId);
    }

  } catch (error) {
    logger.error('[通义千问视觉] 识别失败', { error: (error as Error).message });
    const fallbackDescription = "一件未命名的电商商品";
    logger.info('[通义千问视觉] 使用安全默认描述', { fallbackDescription });
    return fallbackDescription;
  }
}

export async function analyzeProductStructured(imageUrl: string): Promise<ProductAnalysisResult> {
  if (!QWEN_VL_CONFIG.key) {
    logger.warn('[通义千问视觉] API Key未配置，返回默认识别结果');
    return getDefaultAnalysisResult();
  }

  logger.info('[通义千问视觉] 开始结构化分析商品图片', {
    imageUrl: imageUrl.substring(0, 80) + '...',
    model: QWEN_VL_CONFIG.model
  });

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    try {
      const requestBody = {
        model: QWEN_VL_CONFIG.model,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: { url: imageUrl }
              },
              {
                type: "text",
                text: ANALYSIS_SYSTEM_PROMPT
              }
            ]
          }
        ],
        temperature: 0.1,
        max_tokens: 2000
      };

      const response = await fetch(QWEN_VL_CONFIG.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${QWEN_VL_CONFIG.key}`
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorText = await response.text();
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.message || errorData.error?.message || errorData.code || errorMessage;
          } catch {
            errorMessage = errorText || errorMessage;
          }
        } catch {
        }
        throw new Error(`通义千问视觉结构化分析失败：${errorMessage}`);
      }

      const data = await response.json();
      let content = data.choices?.[0]?.message?.content;

      if (!content) {
        throw new Error('通义千问视觉返回响应中缺少内容');
      }

      content = content.trim();

      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        logger.warn('[通义千问视觉] 响应中未找到JSON，尝试使用原始文本', { content: content.substring(0, 200) });
        return parseUnstructuredResponse(content);
      }

      const parsed = JSON.parse(jsonMatch[0]);
      const result: ProductAnalysisResult = {
        productName: parsed.productName || '未知商品',
        category: normalizeCategory(parsed.category),
        color: Array.isArray(parsed.color) ? parsed.color : [parsed.color || '未知颜色'],
        material: parsed.material || '未知材质',
        style: parsed.style || '通用风格',
        features: Array.isArray(parsed.features) ? parsed.features : [],
        suggestedSellingPoints: Array.isArray(parsed.suggestedSellingPoints) ? parsed.suggestedSellingPoints : ['品质优良'],
        packaging: parsed.packaging || '标准包装',
        usageScenarios: Array.isArray(parsed.usageScenarios) ? parsed.usageScenarios : ['日常使用'],
        brandName: parsed.brandName || '未知品牌',
        targetAudience: parsed.targetAudience || '通用人群',
        rawDescription: content
      };

      logger.info('[通义千问视觉] 结构化分析成功', { result });
      return result;

    } finally {
      clearTimeout(timeoutId);
    }

  } catch (error) {
    logger.error('[通义千问视觉] 结构化分析失败', { error: (error as Error).message });
    return getDefaultAnalysisResult();
  }
}

function normalizeCategory(category: string): string {
  const categoryMap: Record<string, string> = {
    'CLOTHING': 'CLOTHING',
    'BEAUTY': 'BEAUTY',
    'ELECTRONICS': 'ELECTRONICS',
    'FOOD': 'FOOD',
    'HOME': 'HOME',
    'BABY': 'BABY',
    'SPORTS': 'SPORTS',
    'JEWELRY': 'JEWELRY',
    'AUTOMOTIVE': 'AUTOMOTIVE',
    'PET': 'PET',
    'STATIONERY': 'STATIONERY',
    'OTHER': 'OTHER',
    '服装': 'CLOTHING',
    '服饰': 'CLOTHING',
    '美妆': 'BEAUTY',
    '化妆品': 'BEAUTY',
    '3C': 'ELECTRONICS',
    '数码': 'ELECTRONICS',
    '电子': 'ELECTRONICS',
    '食品': 'FOOD',
    '家居': 'HOME',
    '母婴': 'BABY',
    '运动': 'SPORTS',
    '珠宝': 'JEWELRY',
    '汽车': 'AUTOMOTIVE',
    '宠物': 'PET',
    '文具': 'STATIONERY',
  };
  return categoryMap[category] || 'OTHER';
}

function parseUnstructuredResponse(text: string): ProductAnalysisResult {
  return {
    productName: extractField(text, ['商品名称', '产品名称', '名称']) || '未知商品',
    category: 'OTHER',
    color: [extractField(text, ['颜色', '色调', '色彩']) || '未知颜色'],
    material: extractField(text, ['材质', '材料']) || '未知材质',
    style: extractField(text, ['风格', '款式']) || '通用风格',
    features: [],
    suggestedSellingPoints: ['品质优良'],
    packaging: '标准包装',
    usageScenarios: ['日常使用'],
    brandName: extractField(text, ['品牌']) || '未知品牌',
    targetAudience: '通用人群',
    rawDescription: text
  };
}

function extractField(text: string, keywords: string[]): string | null {
  for (const keyword of keywords) {
    const regex = new RegExp(`${keyword}[：:：\\s]*([^，,\\n]+)`, 'i');
    const match = text.match(regex);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  return null;
}

function getDefaultAnalysisResult(): ProductAnalysisResult {
  return {
    productName: '未知商品',
    category: 'OTHER',
    color: ['未知颜色'],
    material: '未知材质',
    style: '通用风格',
    features: [],
    suggestedSellingPoints: ['品质优良', '性价比高', '实用性强'],
    packaging: '标准包装',
    usageScenarios: ['日常使用'],
    brandName: '未知品牌',
    targetAudience: '通用人群',
    rawDescription: ''
  };
}
