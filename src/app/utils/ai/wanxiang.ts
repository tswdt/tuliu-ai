import { logger } from '@/app/utils/logger';

const WANXIANG_CONFIG = {
  url: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis',
  key: process.env.DASHSCOPE_API_KEY,
  model: 'wanx-v1',
  name: '通义万相'
};

const ALLOWED_SIZES = ['1024*1024', '720*1280', '1280*720', '768*1152'];

function mapToAllowedSize(size: string): string {
  if (ALLOWED_SIZES.includes(size)) {
    return size;
  }

  const [w, h] = size.replace('x', '*').split('*').map(Number);
  if (!w || !h) {
    return '1024*1024';
  }

  const ratio = w / h;

  if (ratio >= 1.2) {
    return '1280*720';
  } else if (ratio <= 0.8) {
    return '720*1280';
  } else {
    return '1024*1024';
  }
}

export async function generateImageWithWanxiang(
  prompt: string,
  modelVersion: string = "V1",
  imageSize: string = "1024*1024",
  negativePrompt: string = "模糊,变形,商品残缺,色差严重,水印,文字,色情,暴力,低分辨率,模糊边缘"
): Promise<string> {
  if (!WANXIANG_CONFIG.key) {
    throw new Error("通义万相 API Key 未配置，请检查 DASHSCOPE_API_KEY 环境变量");
  }

  const allowedSize = mapToAllowedSize(imageSize);

  try {
    logger.info(`[${WANXIANG_CONFIG.name}] 调用通义万相...`, { 
      prompt, 
      model: WANXIANG_CONFIG.model, 
      originalSize: imageSize,
      mappedSize: allowedSize
    });
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);
    
    try {
      const requestBody = {
        model: WANXIANG_CONFIG.model,
        input: {
          prompt: prompt,
          negative_prompt: negativePrompt
        },
        parameters: {
          size: allowedSize,
          n: 1,
          seed: Math.floor(Math.random() * 2147483647)
        }
      };

      logger.info(`${WANXIANG_CONFIG.name}请求参数`, requestBody);

      const response = await fetch(WANXIANG_CONFIG.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${WANXIANG_CONFIG.key}`,
          "X-DashScope-Async": "enable"
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });

      logger.info(`${WANXIANG_CONFIG.name}响应状态`, { 
        status: response.status, 
        statusText: response.statusText,
        ok: response.ok
      });

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorText = await response.text();
          logger.error(`${WANXIANG_CONFIG.name}错误响应内容`, { errorText });
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.message || errorData.code || errorMessage;
          } catch {
            errorMessage = errorText || errorMessage;
          }
        } catch (e) {
          logger.error("无法解析错误响应", e);
        }
        throw new Error(`${WANXIANG_CONFIG.name}调用失败：${errorMessage}`);
      }

      const responseText = await response.text();
      logger.info(`${WANXIANG_CONFIG.name}成功响应内容`, { responseText });

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        logger.error("响应不是有效的JSON", { responseText });
        throw new Error(`${WANXIANG_CONFIG.name}返回无效的JSON响应`);
      }

      logger.info("解析后的响应数据", data);

      if (data.code && data.code !== 'Success') {
        throw new Error(`${WANXIANG_CONFIG.name}调用失败：${data.message || data.code}`);
      }

      const taskId = data.output?.task_id;
      if (!taskId) {
        logger.error("响应中未找到 task_id", { data });
        throw new Error(`${WANXIANG_CONFIG.name}返回响应中缺少 task_id`);
      }

      logger.info(`开始轮询任务状态，task_id: ${taskId}`);
      const imageUrl = await pollTaskStatus(taskId);

      logger.info(`✅ [${WANXIANG_CONFIG.name}] 调用成功 → ${imageUrl}`);
      return imageUrl;
    } finally {
      clearTimeout(timeoutId);
    }

  } catch (error) {
    logger.error(`❌ [${WANXIANG_CONFIG.name}] 调用失败`, { error });
    throw error;
  }
}

async function pollTaskStatus(taskId: string): Promise<string> {
  const maxPolls = 60;
  const pollInterval = 2000;

  for (let i = 0; i < maxPolls; i++) {
    logger.info(`轮询任务状态 ${i + 1}/${maxPolls}`);
    
    const response = await fetch(`https://dashscope.aliyuncs.com/api/v1/tasks/${taskId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${WANXIANG_CONFIG.key}`
      }
    });

    const data = await response.json();
    logger.info("任务状态响应", data);

    if (data.code && data.code !== 'Success') {
      throw new Error(`任务查询失败：${data.message || data.code}`);
    }

    const taskStatus = data.output?.task_status;
    logger.info(`任务状态: ${taskStatus}`);

    if (taskStatus === 'SUCCEEDED') {
      const imageUrl = data.output?.results?.[0]?.url;
      if (imageUrl) {
        return imageUrl;
      }
      throw new Error("任务成功但未找到图片URL");
    }

    if (taskStatus === 'FAILED') {
      throw new Error(`任务失败：${data.output?.message || '未知错误'}`);
    }

    if (taskStatus !== 'PENDING' && taskStatus !== 'RUNNING') {
      throw new Error(`未知任务状态：${taskStatus}`);
    }

    await new Promise(resolve => setTimeout(resolve, pollInterval));
  }

  throw new Error("任务超时，请重试");
}
