import { logger } from '@/app/utils/logger';

const APIYI_CONFIG = {
  url: process.env.APIYI_API_URL,
  key: process.env.APIYI_API_KEY,
  model: process.env.APIYI_MODEL || 'nano-banana-2',
  name: 'API易-图像'
};

export enum ImageMode {
  TEXT_TO_IMAGE = 'text_to_image',
  IMAGE_TO_IMAGE = 'image_to_image',
  INPAINTING = 'inpainting'
}

interface GenerateImageOptions {
  prompt: string;
  negativePrompt?: string;
  imageSize?: string;
  mode?: ImageMode;
  referenceImageUrl?: string;
  maskImageUrl?: string;
  denoisingStrength?: number;
  imageCount?: number;
}

export async function generateImageWithApiYi(
  options: GenerateImageOptions
): Promise<string[]> {
  const {
    prompt,
    negativePrompt = "模糊,变形,商品残缺,色差严重,水印,文字,色情,暴力,低分辨率,模糊边缘",
    imageSize = "800x800",
    mode = ImageMode.TEXT_TO_IMAGE,
    referenceImageUrl,
    maskImageUrl,
    denoisingStrength = 0.7,
    imageCount = 1
  } = options;

  if (!APIYI_CONFIG.url || !APIYI_CONFIG.key) {
    throw new Error("API易 配置不完整，请检查环境变量");
  }

  try {
    logger.info(`[${APIYI_CONFIG.name}] 开始生成图像`, {
      mode,
      prompt: prompt.substring(0, 100) + '...',
      model: APIYI_CONFIG.model,
      imageSize,
      hasReferenceImage: !!referenceImageUrl,
      hasMaskImage: !!maskImageUrl
    });

    const [width, height] = imageSize.split('x').map(Number);
    if (!width || !height || width < 256 || height < 256) {
      throw new Error('图片尺寸格式错误，需为如800x800的正整数，最小256x256');
    }

    const requestBody: any = {
      prompt,
      model: APIYI_CONFIG.model,
      size: `${width}x${height}`,
      n: imageCount,
      negative_prompt: negativePrompt
    };

    if (mode === ImageMode.IMAGE_TO_IMAGE && referenceImageUrl) {
      requestBody.image = referenceImageUrl;
      requestBody.strength = denoisingStrength;
      logger.info(`[${APIYI_CONFIG.name}] 使用图生图模式`, { referenceImageUrl, denoisingStrength });
    }

    if (mode === ImageMode.INPAINTING && referenceImageUrl && maskImageUrl) {
      requestBody.image = referenceImageUrl;
      requestBody.mask = maskImageUrl;
      logger.info(`[${APIYI_CONFIG.name}] 使用局部重绘模式`, { referenceImageUrl, maskImageUrl });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000);

    try {
      const response = await fetch(APIYI_CONFIG.url!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${APIYI_CONFIG.key}`
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
          logger.error('无法解析错误响应', e);
        }
        throw new Error(`${APIYI_CONFIG.name}调用失败：${errorMessage}`);
      }

      const responseText = await response.text();
      logger.info(`${APIYI_CONFIG.name}成功响应内容`, { responseText: responseText.substring(0, 500) });

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        logger.error('响应不是有效的JSON', { responseText: responseText.substring(0, 200) });
        throw new Error(`${APIYI_CONFIG.name}返回无效的JSON响应`);
      }

      logger.info('解析后的响应数据', data);

      const imageUrls: string[] = [];

      if (data.data && Array.isArray(data.data)) {
        for (const item of data.data) {
          if (item.url) imageUrls.push(item.url);
          else if (item.b64_json) imageUrls.push(item.b64_json);
        }
      }

      if (data.images && Array.isArray(data.images)) {
        for (const item of data.images) {
          if (typeof item === 'string') imageUrls.push(item);
          else if (item.url) imageUrls.push(item.url);
        }
      }

      if (data.url) imageUrls.push(data.url);
      if (data.image) imageUrls.push(data.image);

      if (imageUrls.length === 0) {
        logger.error('响应中未找到图片URL', { data });
        throw new Error(`${APIYI_CONFIG.name}生成成功，但未返回图片URL`);
      }

      logger.info(`✅ [${APIYI_CONFIG.name}] 调用成功，生成 ${imageUrls.length} 张图片`);
      return imageUrls;

    } finally {
      clearTimeout(timeoutId);
    }

  } catch (error) {
    logger.error(`❌ [${APIYI_CONFIG.name}] 调用失败`, { error: (error as Error).message });
    throw error;
  }
}
