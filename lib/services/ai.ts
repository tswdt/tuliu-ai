import { env } from '@/lib/env';
import { withRetry, withTimeout } from '@/lib/utils/retry';
import { uploadFile } from './cos';

export async function callHunyuanVision(imageUrl: string): Promise<string> {
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
                { type: "text", text: "Describe this product in detail for a commercial photography prompt." },
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
      
      const blob = await response.blob();
      const buffer = Buffer.from(await blob.arrayBuffer());
      const maskKey = `jobs/${jobId}/mask.png`;
      return await uploadFile(maskKey, buffer, 'image/png');
    }, 45000);
  });
}

export async function callFluxFill(imageUrl: string, maskUrl: string, prompt: string, jobId: string): Promise<string> {
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
          prompt: `Commercial masterpiece, ${prompt}`,
          image_url: imageUrl,
          mask_url: maskUrl,
        }),
      });
      
      if (!response.ok) throw new Error(`Flux Fill API failed: ${response.statusText}`);
      
      const data = await response.json();
      const resultUrl = data.data[0].url;
      
      // Download and save to COS for persistence
      const imgRes = await fetch(resultUrl);
      const buffer = Buffer.from(await imgRes.arrayBuffer());
      const resultKey = `jobs/${jobId}/result.png`;
      return await uploadFile(resultKey, buffer, 'image/png');
    }, 60000);
  });
}
