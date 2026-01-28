import { ENV } from '../_core/env';

const SILICONFLOW_API_URL = ENV.siliconflowBaseUrl;
const API_KEY = ENV.siliconflowApiKey;

/**
 * 调用 SiliconFlow Qwen 模型进行中文到英文的 Prompt 翻译
 */
export async function translatePromptToEnglish(chinesePrompt: string): Promise<string> {
  try {
    const response = await fetch(`${SILICONFLOW_API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: 'Qwen/Qwen2.5-7B-Instruct',
        messages: [
          {
            role: 'system',
            content: "Translate user's raw Chinese input into a professional English prompt optimized for Flux.1 image generation. Output only the English prompt, no explanations.",
          },
          {
            role: 'user',
            content: chinesePrompt,
          },
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`SiliconFlow API error: ${response.statusText}`);
    }

    const data = await response.json() as {
      choices: Array<{ message: { content: string } }>;
    };
    const englishPrompt = data.choices[0]?.message.content.trim() || chinesePrompt;
    return englishPrompt;
  } catch (error) {
    console.error('[AI Service] Translation failed:', error);
    throw error;
  }
}

/**
 * 调用 SiliconFlow Flux 模型生成图片
 */
export async function generateImage(
  prompt: string,
  width: number = 1024,
  height: number = 1024
): Promise<string> {
  try {
    const response = await fetch(`${SILICONFLOW_API_URL}/text_to_image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: 'black-forest-labs/FLUX.1-pro',
        prompt: prompt,
        image_size: `${width}x${height}`,
        num_inference_steps: 20,
        guidance_scale: 7.5,
      }),
    });

    if (!response.ok) {
      throw new Error(`SiliconFlow API error: ${response.statusText}`);
    }

    const data = await response.json() as {
      images: Array<{ url: string }>;
    };
    const imageUrl = data.images[0]?.url;
    if (!imageUrl) {
      throw new Error('No image URL returned from API');
    }
    return imageUrl;
  } catch (error) {
    console.error('[AI Service] Image generation failed:', error);
    throw error;
  }
}

/**
 * 根据尺寸获取积分消耗
 */
export function getCreditsForSize(width: number, height: number): number {
  if (width === 800 && height === 800) return 0; // Trial
  if (width === 1024 && height === 1024) return 1; // Standard
  if (width === 2048 && height === 2048) return 2; // HD
  if (width === 4096 && height === 4096) return 4; // Ultra
  return 1; // Default
}

/**
 * 根据尺寸获取套餐名称
 */
export function getTierName(width: number, height: number): string {
  if (width === 800 && height === 800) return 'trial';
  if (width === 1024 && height === 1024) return 'standard';
  if (width === 2048 && height === 2048) return 'hd';
  if (width === 4096 && height === 4096) return 'ultra';
  return 'standard';
}
