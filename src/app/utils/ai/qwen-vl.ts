import { logger } from '@/app/utils/logger';

const QWEN_VL_CONFIG = {
  url: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
  key: process.env.DASHSCOPE_API_KEY,
  model: 'qwen-vl-max',
  name: '通义千问视觉'
};

export async function analyzeProductFromImage(imageUrl: string): Promise<string> {
  if (!QWEN_VL_CONFIG.key) {
    console.error("[视觉识别] ⚠️ 通义千问 API Key 未配置");
    const fallbackDescription = "一件未命名的电商商品";
    logger.info('[通义千问视觉] 使用默认描述（API Key未配置）', { fallbackDescription });
    return fallbackDescription;
  }

  console.log("\n========================================");
  console.log("[视觉识别] 🔍 开始分析图片...");
  console.log("[视觉识别] 🖼️ 图片 URL:", imageUrl.substring(0, 80) + '...');
  console.log("[视觉识别] 🤖 使用模型:", QWEN_VL_CONFIG.model);
  console.log("[视觉识别] 🌐 API Endpoint:", QWEN_VL_CONFIG.url);
  console.log("========================================\n");

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

      logger.info('[通义千问视觉] 发送请求（OpenAI兼容格式）', { model: QWEN_VL_CONFIG.model });

      const response = await fetch(QWEN_VL_CONFIG.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${QWEN_VL_CONFIG.key}`
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });

      logger.info('[通义千问视觉] 收到响应', { status: response.status });

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorText = await response.text();
          logger.error('[通义千问视觉] 错误响应', { errorText: errorText.substring(0, 500) });
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

      const responseText = await response.text();
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        logger.error('[通义千问视觉] 响应不是有效的JSON', { responseText: responseText.substring(0, 200) });
        throw new Error('通义千问视觉返回无效的JSON响应');
      }

      logger.info('[通义千问视觉] 完整响应', { data });
      console.log("[视觉识别] 📋 完整响应:", JSON.stringify(data, null, 2));

      let productDescription = data.choices?.[0]?.message?.content;

      if (!productDescription) {
        logger.error('[通义千问视觉] 响应中未找到商品描述', { data });
        throw new Error('通义千问视觉返回响应中缺少商品描述');
      }

      productDescription = productDescription.trim();

      console.log("\n========================================");
      console.log("[视觉识别] ✅ 识别成功!");
      console.log("[视觉识别] 📝 商品描述:", productDescription);
      console.log("========================================\n");

      logger.info('[通义千问视觉] 识别成功', { productDescription });
      return productDescription;

    } finally {
      clearTimeout(timeoutId);
    }

  } catch (error) {
    console.error("\n========================================");
    console.error("[视觉识别] ❌ 识别失败");
    console.error("[视觉识别] 错误:", (error as Error).message);
    console.error("========================================\n");
    logger.error('[通义千问视觉] 识别失败', { error: (error as Error).message });
    
    console.log("[视觉识别] ⚠️ 使用安全备用方案");
    const fallbackDescription = "一件未命名的电商商品";
    logger.info('[通义千问视觉] 使用安全默认描述', { fallbackDescription });
    return fallbackDescription;
  }
}
