'use server';

import { initJob, updateJobState, getJobState } from '@/lib/services/job';
import { callHunyuanVision, callBriaMatting, callFluxFill } from '@/lib/services/ai';

import { validateTurnstile } from '@/lib/services/security';

export async function startGeneration(jobId: string, imageUrl: string, turnstileToken?: string) {
  // 0. Security Check
  if (turnstileToken) {
    const isValid = await validateTurnstile(turnstileToken);
    if (!isValid) throw new Error('Security validation failed');
  }

  // 1. Idempotency & Resume Check
  let state = await getJobState(jobId);
  
  if (state?.status === 'completed') {
    return state;
  }

  // 2. Init if not exists
  if (!state) {
    state = await initJob(jobId, imageUrl);
  }

  try {
    // 3. Vision (Hunyuan) - Skip if already analyzed
    if (state.status === 'pending' || !state.analysis) {
      await updateJobState(jobId, { status: 'analyzing', progress: 20 });
      const analysis = await callHunyuanVision(imageUrl);
      state = await updateJobState(jobId, { analysis, progress: 40 });
    }

    // 4. Matting (Bria) - Skip if already matted
    if (state.status === 'analyzing' || !state.maskUrl) {
      await updateJobState(jobId, { status: 'matting', progress: 50 });
      const maskUrl = await callBriaMatting(imageUrl, jobId);
      state = await updateJobState(jobId, { maskUrl, progress: 70 });
    }

    // 5. Generation (Flux Fill) - Skip if already generating
    if (state.status === 'matting' || !state.resultUrl) {
      await updateJobState(jobId, { status: 'generating', progress: 80 });
      const resultUrl = await callFluxFill(imageUrl, state.maskUrl!, state.analysis!, jobId);
      state = await updateJobState(jobId, { 
        status: 'completed', 
        progress: 100, 
        resultUrl 
      });
    }
    
    return state;

  } catch (error: any) {
    console.error(`Job ${jobId} failed:`, error);
    return await updateJobState(jobId, { 
      status: 'failed', 
      error: error.message || 'Unknown error' 
    });
  }
}
