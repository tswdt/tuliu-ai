import { logger } from '@/app/utils/logger';

export class TimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TimeoutError';
  }
}

export class SafetyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SafetyError';
  }
}

export class ParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ParseError';
  }
}

interface GenerateImageOptions {
  imageUrl?: string;
  prompt: string;
  size?: '1K' | '2K' | '4K';
  aspectRatio?: string;
}

interface SuchuangSubmitResponse {
  code: number;
  msg: string;
  data: {
    id?: string;
    task_id?: string;
    count?: string;
  };
  exec_time: number;
  ip: string;
}

interface SuchuangPollResponse {
  code: number;
  msg: string;
  data?: any;
  exec_time: number;
  ip: string;
}

export async function generateImageWithSuchuang(options: GenerateImageOptions): Promise<string> {
  const { imageUrl, prompt, size = '2K', aspectRatio = '1:1' } = options;

  console.log("\n========================================");
  console.log("[Node F] 🎨 速创 API 异步模式启动");
  console.log("========================================");
  console.log("[Node F] 接收到的参数:");
  console.log("[Node F] - imageUrl:", imageUrl);
  console.log("[Node F] - prompt:", prompt.substring(0, 100) + '...');
  console.log("[Node F] - size:", size);
  console.log("[Node F] - aspectRatio:", aspectRatio);

  logger.info('[速创 NanoBanana2] 开始异步生成图片', {
    hasImage: !!imageUrl,
    prompt: prompt.substring(0, 100) + '...',
    size,
    aspectRatio
  });

  const SUBMIT_URL = 'https://api.wuyinkeji.com/api/async/image_nanoBanana2';
  const API_KEY = process.env.SUCHUANG_API_KEY;

  if (!API_KEY) {
    throw new Error('系统错误：未配置速创 API Key (SUCHUANG_API_KEY)');
  }

  const payload: any = {
    prompt,
    size,
    aspectRatio
  };

  if (imageUrl) {
    console.log("[Node F] ✅ 添加参考图到请求");
    payload.urls = [imageUrl];
  }

  console.log("[Node F] 📤 发送给速创的请求参数:", payload);
  console.log("[Suchuang] 发起请求使用 Key (前4位):", API_KEY ? API_KEY.substring(0, 4) : "未定义");

  try {
    logger.info('[速创 NanoBanana2] 第一步：提交任务');

    const submitUrlWithKey = `${SUBMIT_URL}?key=${API_KEY}`;
    console.log("[Node F] 提交任务 URL (含key):", submitUrlWithKey);

    const submitResponse = await fetch(submitUrlWithKey, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    console.log(`[Node F] 📥 提交任务响应状态: ${submitResponse.status}`);

    if (!submitResponse.ok) {
      const errorText = await submitResponse.text();
      console.error(`[Node F] ❌ 提交任务失败:`, errorText);
      throw new Error(`提交任务失败: HTTP ${submitResponse.status}`);
    }

    const submitData: SuchuangSubmitResponse = await submitResponse.json();
    console.log("[Node F] 📋 提交任务响应:", JSON.stringify(submitData, null, 2));

    if (submitData.code !== 200) {
      throw new Error(`速创 API 调用失败: ${submitData.msg} (code: ${submitData.code})`);
    }

    const taskId = submitData.data.id || submitData.data.task_id;
    console.log(`[Node F] 提取到的原始ID字段 - id: ${submitData.data.id}, task_id: ${submitData.data.task_id}`);
    console.log(`[Node F] ✅ 任务提交成功，Task ID: ${taskId}`);
    logger.info('[速创 NanoBanana2] 任务创建成功', { taskId });

    if (!taskId) {
      console.error(`[Node F] ❌ 任务ID为空，无法继续轮询`);
      console.error(`[Node F] 📋 完整提交响应:`, JSON.stringify(submitData, null, 2));
      throw new Error('速创API返回数据中未找到任务ID (id或task_id字段缺失)');
    }

    console.log("\n[Node F] 🔄 第二步：开始轮询任务结果...");
    logger.info('[速创 NanoBanana2] 开始轮询', { taskId });

    const generatedImageUrl = await pollSuchuangResult(taskId, API_KEY);
    
    console.log(`\n[Node F] ✅ 图片生成成功!`);
    console.log(`[Node F] 🖼️ 图片 URL:`, generatedImageUrl);
    logger.info('[速创 NanoBanana2] 图片生成成功', { imageUrl: generatedImageUrl });
    console.log("========================================\n");
    
    return generatedImageUrl;

  } catch (error: any) {
    console.log("\n========================================");
    console.log("[Node F] ❌ 速创 API 调用失败");
    console.log("========================================\n");
    
    logger.error('[速创 NanoBanana2] 生成失败', { error: error.message });

    if (error instanceof TimeoutError || error instanceof SafetyError || error instanceof ParseError) {
      throw error;
    }

    throw new Error(`系统网络或未知错误: ${error.message}`);
  }
}

async function pollSuchuangResult(taskId: string, apiKey: string): Promise<string> {
  const maxRetries = 10;
  const pollInterval = 3000;
  
  console.log(`[轮询] 配置: ${maxRetries} 次, 间隔 ${pollInterval}ms, 总时长约 ${(maxRetries * pollInterval) / 1000} 秒`);

  for (let i = 0; i < maxRetries; i++) {
    try {
      console.log(`\n[轮询] 第 ${i + 1}/${maxRetries} 次查询...`);
      
      const pollUrl = `https://api.wuyinkeji.com/api/async/detail?key=${apiKey}&id=${taskId}`;
      console.log(`[轮询] URL: ${pollUrl}`);
      
      const response = await fetch(pollUrl, {
        method: 'GET'
      });

      console.log(`[轮询] 响应状态码: ${response.status}`);
      
      if (!response.ok) {
        console.warn(`[轮询] ⚠️ 轮询接口非200, 状态码: ${response.status}`);
        console.log(`[轮询] ⏳ 标记为 pending，继续重试...`);
        await new Promise(resolve => setTimeout(resolve, pollInterval));
        continue;
      }

      const contentType = response.headers.get('content-type') || '';
      
      if (contentType.includes('text/html')) {
        const htmlText = await response.text();
        console.warn(`[轮询] ⚠️ 返回 HTML 而非 JSON`);
        console.warn(`[轮询] HTML 内容 (前300字符):`, htmlText.substring(0, 300));
        console.log(`[轮询] ⏳ 继续重试...`);
        await new Promise(resolve => setTimeout(resolve, pollInterval));
        continue;
      }

      let data: SuchuangPollResponse;
      try {
        data = await response.json();
      } catch (jsonError) {
        const rawText = await response.text();
        console.warn(`[轮询] ⚠️ JSON 解析失败`);
        console.warn(`[轮询] 原始响应:`, rawText.substring(0, 300));
        console.log(`[轮询] ⏳ 继续重试...`);
        await new Promise(resolve => setTimeout(resolve, pollInterval));
        continue;
      }

      console.log(`[轮询] 📋 响应数据:`, JSON.stringify(data, null, 2));
      logger.info('[速创 NanoBanana2] 轮询响应', { 
        attempt: i + 1, 
        code: data.code, 
        msg: data.msg 
      });

      if (data.code === 200) {
        console.log(`[轮询] ✅ code === 200，检查任务状态...`);
        
        const taskStatus = data.data?.status;
        console.log(`[轮询] 📊 任务状态: status = ${taskStatus}`);
        
        if (taskStatus === 2) {
          console.log(`[轮询] ✅ status === 2，任务已完成!`);
          
          const resultArray = data.data?.result;
          if (resultArray && Array.isArray(resultArray) && resultArray.length > 0) {
            const imageUrl = resultArray[0];
            console.log(`[轮询] 🎯 提取到图片 URL:`, imageUrl);
            logger.info('[速创 NanoBanana2] 找到图片 URL', { imageUrl });
            return imageUrl;
          } else {
            console.log(`[轮询] ❌ 任务已完成，但 result 字段不存在或为空`);
            console.log(`[轮询] 📋 完整响应:`, JSON.stringify(data, null, 2));
            throw new ParseError('任务已完成 (status=2)，但 result 字段不存在或为空');
          }
          
        } else if (taskStatus === 0 || taskStatus === 1) {
          console.log(`[轮询] ⏳ status === ${taskStatus}，任务处理中... 继续等待`);
          
        } else {
          console.log(`[轮询] ❌ 异常状态: status = ${taskStatus}`);
          console.log(`[轮询] 📋 完整响应:`, JSON.stringify(data, null, 2));
          const realErrorMessage = data.data?.message || data.data?.msg || data.msg || '未知服务器错误';
          console.log(`❌ 任务异常终止，错误原因为: ${realErrorMessage}`);
          throw new Error(`生图任务失败：${realErrorMessage}`);
        }
        
      } else {
        console.log(`[轮询] ⚠️ code !== 200: ${data.code} - ${data.msg}`);
      }

    } catch (error) {
      if (error instanceof ParseError) {
        throw error;
      }
      const errorMessage = (error as Error).message;
      if (errorMessage.includes('生图任务失败')) {
        console.error(`[轮询] ❌ 任务已失败，停止重试`);
        throw error;
      }
      console.error(`[轮询] ❌ 轮询异常:`, errorMessage);
      console.log(`[轮询] ⏳ 继续重试...`);
    }

    await new Promise(resolve => setTimeout(resolve, pollInterval));
  }

  logger.error('[速创 NanoBanana2] 轮询超时', { maxRetries, pollInterval });
  throw new TimeoutError('TimeoutError: 等待图片生成超时，请稍后再试（已等待约5分钟）');
}

function checkTaskCompleted(data: SuchuangPollResponse): boolean {
  if (!data.data) return false;
  
  const status = data.data.status || data.data.state;
  if (status) {
    const statusLower = String(status).toLowerCase();
    return ['success', 'completed', 'finished', 'done'].includes(statusLower);
  }
  
  if (data.data.output || data.data.url || data.data.image) {
    return true;
  }
  
  return false;
}

function extractImageUrl(data: SuchuangPollResponse): string | null {
  if (!data.data) return null;
  
  const candidates: string[] = [];
  
  if (data.data.output && typeof data.data.output === 'string') {
    candidates.push(data.data.output);
  }
  if (data.data.url && typeof data.data.url === 'string') {
    candidates.push(data.data.url);
  }
  if (data.data.image && typeof data.data.image === 'string') {
    candidates.push(data.data.image);
  }
  
  if (data.data.images && Array.isArray(data.data.images)) {
    for (const img of data.data.images) {
      if (typeof img === 'string') candidates.push(img);
      else if (img.url) candidates.push(img.url);
      else if (img.output) candidates.push(img.output);
    }
  }
  
  for (const candidate of candidates) {
    if (candidate && (candidate.startsWith('http://') || candidate.startsWith('https://'))) {
      console.log(`[提取] ✅ 找到有效图片 URL: ${candidate.substring(0, 60)}...`);
      return candidate;
    }
  }
  
  if (candidates.length > 0) {
    console.log(`[提取] ⚠️ 找到候选值但不是有效 URL:`, candidates);
  }
  
  return null;
}
