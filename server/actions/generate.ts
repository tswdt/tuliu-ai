'use server';

import { initJob, updateJobState, getJobState } from '@/lib/services/job';
import { withRetry, withTimeout } from '@/lib/utils/retry';
import { uploadFile } from '@/lib/services/cos';

// --- AI API Wrappers (SiliconFlow / Bria / Hunyuan) ---

async function callHunyuanVision(imageUrl: string) {
  return withTimeout(async () => {
    const response = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SILICONFLOW_KEY}`,
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
    const data = await response.json();
    return data.choices[0].message.content;
  });
}

async function callBriaMatting(imageUrl: string, jobId: string) {
  return withTimeout(async () => {
    const response = await fetch('https://engine.prod.bria-api.com/v1/background/remove', {
      method: 'POST',
      headers: { 'X-API-KEY': process.env.BRIA_API_KEY! },
      body: JSON.stringify({ image_url: imageUrl }),
    });
    const blob = await response.blob();
    const buffer = Buffer.from(await blob.arrayBuffer());
    const maskKey = `jobs/${jobId}/mask.png`;
    return await uploadFile(maskKey, buffer);
  });
}

async function callFluxFill(imageUrl: string, maskUrl: string, prompt: string, jobId: string) {
  return withTimeout(async () => {
    const response = await fetch('https://api.siliconflow.cn/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SILICONFLOW_KEY}`,
      },
      body: JSON.stringify({
        model: "black-forest-labs/FLUX.1-Fill-dev",
        prompt: `Commercial masterpiece, ${prompt}`,
        image_url: imageUrl,
        mask_url: maskUrl,
      }),
    });
    const data = await response.json();
    const resultUrl = data.data[0].url;
    
    // Download and save to COS for persistence
    const imgRes = await fetch(resultUrl);
    const buffer = Buffer.from(await imgRes.arrayBuffer());
    const resultKey = `jobs/${jobId}/result.png`;
    return await uploadFile(resultKey, buffer);
  });
}

// --- Orchestrator ---

export async function startGeneration(jobId: string, imageUrl: string) {
  // 1. Idempotency check
  const existing = await getJobState(jobId);
  if (existing && (existing.status === 'completed' || existing.status === 'generating')) {
    return existing;
  }

  try {
    // 2. Init
    await initJob(jobId, imageUrl);

    // 3. Vision (Hunyuan)
    await updateJobState(jobId, { status: 'analyzing', progress: 20 });
    const analysis = await withRetry(() => callHunyuanVision(imageUrl));
    await updateJobState(jobId, { analysis, progress: 40 });

    // 4. Matting (Bria)
    await updateJobState(jobId, { status: 'matting', progress: 50 });
    const maskUrl = await withRetry(() => callBriaMatting(imageUrl, jobId));
    await updateJobState(jobId, { maskUrl, progress: 70 });

    // 5. Generation (Flux Fill)
    await updateJobState(jobId, { status: 'generating', progress: 80 });
    const resultUrl = await withRetry(() => callFluxFill(imageUrl, maskUrl, analysis, jobId));
    
    // 6. Complete
    return await updateJobState(jobId, { 
      status: 'completed', 
      progress: 100, 
      resultUrl 
    });

  } catch (error: any) {
    console.error('Job failed:', error);
    return await updateJobState(jobId, { 
      status: 'failed', 
      error: error.message || 'Unknown error' 
    });
  }
}
