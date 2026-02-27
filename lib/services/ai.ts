import { env } from '@/lib/env';
import { withRetry, withTimeout } from '@/lib/utils/retry';
import { uploadStream, uploadFromUrl, MAX_UPLOAD_SIZE } from './cos';

export async function callHunyuanVision(imageUrl: string, style: string = 'white'): Promise<string> {
  const styleInstructions: Record<string, string> = {
    white: 'Describe this product in detail for a clean white background commercial photography prompt. Focus on product shape, texture, color, and material.',
    scene: 'Describe this product in detail for a lifestyle scene commercial photography prompt. Suggest a contextual environment that matches the product style.',
    model: 'Describe this product in detail for a fashion/lifestyle model shot prompt. Suggest how a model would use or wear this product in an aspirational setting.',
  };
  const instruction = styleInstructions[style] ?? styleInstructions.white;

  return withRetry(async () => {
    return withTimeout(async () => {
      const response = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.SILICONFLOW_KEY}`,
        },
        body: JSON.stringify({
          model: "tencent/Hunyuan-Vision",
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: instruction },
                { type: "image_url", image_url: { url: imageUrl } }
              ]
            }
          ]
        }),
      });
      
      if (!response.ok) throw new Error(`Hunyuan API failed: ${response.statusText}`);
      const data = await response.json();
      return data.choices[0].message.content;
    }, 30000);
  });
}

export async function callBriaMatting(imageUrl: string, jobId: string): Promise<string> {
  return withRetry(async () => {
    return withTimeout(async () => {
      const response = await fetch('https://engine.prod.bria-api.com/v1/background/remove', {
        method: 'POST',
        headers: { 
          'X-API-KEY': env.BRIA_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ image_url: imageUrl }),
      });
      
      if (!response.ok) throw new Error(`Bria API failed: ${response.statusText}`);
      if (!response.body) throw new Error('Bria API returned no body');

      const contentLength = response.headers.get('content-length');
      if (contentLength && parseInt(contentLength, 10) > MAX_UPLOAD_SIZE) {
        throw new Error(`Bria response size exceeds 20MB limit`);
      }

      const { Readable } = await import('stream');
      const nodeStream = Readable.fromWeb(response.body as any);
      const maskKey = `jobs/${jobId}/mask.png`;
      return await uploadStream(nodeStream, maskKey, 'image/png');
    }, 45000);
  });
}

export async function callFluxFill(imageUrl: string, maskUrl: string, prompt: string, jobId: string, customPrompt?: string, style: string = 'white'): Promise<string> {
  const stylePrefix: Record<string, string> = {
    white: 'Clean white background commercial product photo,',
    scene: 'Lifestyle scene commercial product photo,',
    model: 'Fashion lifestyle model shot,',
  };
  const prefix = stylePrefix[style] ?? stylePrefix.white;
  const finalPrompt = customPrompt ? `${prefix} ${prompt}, ${customPrompt}` : `${prefix} ${prompt}`;

  return withRetry(async () => {
    return withTimeout(async () => {
      const response = await fetch('https://api.siliconflow.cn/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.SILICONFLOW_KEY}`,
        },
        body: JSON.stringify({
          model: "black-forest-labs/FLUX.1-Fill-dev",
          prompt: `Commercial masterpiece, ${finalPrompt}`,
          image_url: imageUrl,
          mask_url: maskUrl,
        }),
      });
      
      if (!response.ok) throw new Error(`Flux Fill API failed: ${response.statusText}`);
      
      const data = await response.json();
      const resultUrl = data.data[0].url;
      
      // Stream from temporary URL directly to COS (avoids buffering in Node.js memory)
      const resultKey = `jobs/${jobId}/result.png`;
      return await uploadFromUrl(resultUrl, resultKey, 'image/png');
    }, 60000);
  });
}
