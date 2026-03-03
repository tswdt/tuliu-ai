import { logger } from '@/app/utils/logger';

const APIYI_CONFIG = {
  llmUrl: process.env.APIYI_LLM_URL,
  key: process.env.APIYI_API_KEY,
  model: process.env.APIYI_LLM_MODEL || 'gpt-4o-mini',
  name: 'API易-LLM'
};

interface StructuredPrompt {
  productAttributes: {
    category: string;
    name: string;
    color: string;
    material: string;
    sellingPoints: string[];
  };
  userStyle: string;
  photographyParams: {
    lighting: string;
    composition: string;
    background: string;
    angle: string;
  };
  finalPrompt: string;
}

export async function buildStructuredPrompt(
  productInfo: {
    category?: string;
    name?: string;
    color?: string;
    material?: string;
    sellingPoints?: string[];
  },
  userStyle: string = 'minimal',
  platform: string = 'TAOBAO'
): Promise<StructuredPrompt> {
  if (!APIYI_CONFIG.llmUrl || !APIYI_CONFIG.key) {
    throw new Error("API易 LLM 配置不完整，请检查环境变量");
  }

  try {
    const systemPrompt = `你是一个专业的电商商品图提示词工程师。你的任务是根据商品信息和用户风格偏好，生成高质量的结构化提示词用于AI绘图。

请以JSON格式返回结果，包含以下字段：
{
  "productAttributes": {
    "category": "商品类别",
    "name": "商品名称",
    "color": "商品颜色",
    "material": "商品材质",
    "sellingPoints": ["卖点1", "卖点2", "卖点3"]
  },
  "userStyle": "用户选择的风格",
  "photographyParams": {
    "lighting": "专业布光描述",
    "composition": "构图方式",
    "background": "背景建议",
    "angle": "拍摄角度"
  },
  "finalPrompt": "最终的英文提示词，用于AI绘图"
}

风格说明：
- minimal/极简：简约背景，突出产品，光线柔和
- cyberpunk/赛博朋克：霓虹灯光，科技感，未来城市背景
- cream/奶油风：温暖柔和，浅色系，温馨居家
- luxury/奢华：高端材质，华丽背景，专业影棚
- natural/自然：户外场景，自然光，真实感

平台适配：
- TAOBAO/TMALL：鲜艳色彩，吸引眼球
- AMAZON：简约白底，清晰展示
- DOUYIN：竖版构图，时尚感
- XIAOHONGSHU：ins风格，种草感

最终提示词要求：
- 用英文撰写
- 包含完整的商品描述
- 包含摄影参数
- 包含风格要求
- 包含平台适配
- 100-150个单词`;

    const userPrompt = `商品信息：
- 类别：${productInfo.category || '通用商品'}
- 名称：${productInfo.name || '未知商品'}
- 颜色：${productInfo.color || '多色可选'}
- 材质：${productInfo.material || '优质材质'}
- 卖点：${(productInfo.sellingPoints || ['高品质', '精美设计', '实用耐用']).join('、')}

用户风格：${userStyle}
目标平台：${platform}

请生成结构化提示词。`;

    logger.info(`[${APIYI_CONFIG.name}] 开始构建结构化Prompt`, { 
      productInfo, 
      userStyle, 
      platform 
    });

    const response = await fetch(APIYI_CONFIG.llmUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${APIYI_CONFIG.key}`
      },
      body: JSON.stringify({
        model: APIYI_CONFIG.model,
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error(`${APIYI_CONFIG.name}调用失败`, { error: errorText });
      throw new Error(`API易 LLM 调用失败：HTTP ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('API易 LLM 返回内容为空');
    }

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('无法从响应中提取JSON');
    }

    const structuredPrompt: StructuredPrompt = JSON.parse(jsonMatch[0]);
    logger.info(`[${APIYI_CONFIG.name}] 结构化Prompt构建成功`, { structuredPrompt });

    return structuredPrompt;

  } catch (error) {
    logger.error(`[${APIYI_CONFIG.name}] 构建Prompt失败`, { error: (error as Error).message });
    throw error;
  }
}
