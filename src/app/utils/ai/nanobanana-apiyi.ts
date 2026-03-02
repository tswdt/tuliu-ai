import { logger } from '@/app/utils/logger';

const APIYI_CONFIG = {
  url: process.env.APIYI_API_URL,
  key: process.env.APIYI_API_KEY,
  model: process.env.APIYI_MODEL || 'nano-banana-2',
  name: 'API易'
};

export async function generateImageWithNanoBanana(
  prompt: string,
  modelVersion: string = "V1",
  imageSize: string = "800x800",
  negativePrompt: string = "模糊,变形,商品残缺,色差严重,水印,文字,色情,暴力,低分辨率,模糊边缘"
): Promise<string> {
  const [width, height] = imageSize.split("x").map(Number);
  if (!width || !height || width < 256 || height < 256) {
    throw new Error("图片尺寸格式错误，需为如800x800的正整数，最小256x256");
  }

  if (!APIYI_CONFIG.url || !APIYI_CONFIG.key) {
    throw new Error("API易 配置不完整，请检查环境变量");
  }

  try {
    logger.info(`[${APIYI_CONFIG.name}] 调用nanobanana...`, { 
      prompt, 
      model: APIYI_CONFIG.model, 
      imageSize,
      apiUrl: APIYI_CONFIG.url
    });
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    
    try {
      const requestBody = {
        prompt: prompt,
        model: APIYI_CONFIG.model,
        size: `${width}x${height}`,
        n: 1
      };

      logger.info(`${APIYI_CONFIG.name}请求参数`, requestBody);

      const response = await fetch(APIYI_CONFIG.url!, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${APIYI_CONFIG.key}`,
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });

      logger.info(`${APIYI_CONFIG.name}响应状态`, { 
        status: response.status, 
        statusText: response.statusText,
        ok: response.ok
      });

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorText = await response.text();
          logger.error(`${APIYI_CONFIG.name}错误响应内容`, { errorText });
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.error?.message || errorData.message || errorData.error || errorMessage;
          } catch {
            errorMessage = errorText || errorMessage;
          }
        } catch (e) {
          logger.error("无法解析错误响应", e);
        }
        throw new Error(`${APIYI_CONFIG.name}调用失败：${errorMessage}`);
      }

      const responseText = await response.text();
      logger.info(`${APIYI_CONFIG.name}成功响应内容`, { responseText });

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        logger.error("响应不是有效的JSON", { responseText });
        throw new Error(`${APIYI_CONFIG.name}返回无效的JSON响应`);
      }

      logger.info("解析后的响应数据", data);

      let imageUrl: string | undefined = data.data?.[0]?.url;

      if (!imageUrl) {
        imageUrl = data.data?.[0]?.b64_json;
      }
      if (!imageUrl) {
        imageUrl = data.images && Array.isArray(data.images) && data.images.length > 0 
          ? data.images[0].url || data.images[0] 
          : undefined;
      }
      if (!imageUrl) {
        imageUrl = data.url;
      }
      if (!imageUrl) {
        imageUrl = data.image;
      }

      if (!imageUrl) {
        logger.error("响应中未找到图片URL", { data });
        throw new Error(`${APIYI_CONFIG.name}生成成功，但未返回图片URL`);
      }

      logger.info(`✅ [${APIYI_CONFIG.name}] 调用成功 → ${imageUrl}`);
      return imageUrl;
    } finally {
      clearTimeout(timeoutId);
    }

  } catch (error) {
    logger.error(`❌ [${APIYI_CONFIG.name}] 调用失败`, { error });
    throw error;
  }
}
