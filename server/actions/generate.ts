'use server';

import { initJob, updateJobState, getJobState } from '@/lib/services/job';
import { callHunyuanVision, callBriaMatting, callFluxFill } from '@/lib/services/ai';
import { validateTurnstile } from '@/lib/services/security';
import { validateText, validateImage } from '@/lib/services/safety';
import { deductCredit } from '@/lib/services/wallet';
import { validateId } from '@/lib/utils';

export async function startGeneration(jobId: string, inputImage: string, userId: string, turnstileToken?: string) {
  // 0. Security Check
  if (!validateId(jobId)) throw new Error('Invalid jobId');
  if (!validateId(userId)) throw new Error('Invalid userId');

  if (turnstileToken) {
    const isValid = await validateTurnstile(turnstileToken);
    if (!isValid) throw new Error('Security validation failed');
  }

  // 1. Idempotency & Resume Check
  let { state } = await getJobState(jobId);
  
  if (state?.status === 'completed') {
    return state;
  }

  // 2. Init if not exists
  if (!state) {
    if (!inputImage.startsWith('https://')) {
      throw new Error('inputImage must be a valid https:// URL');
    }
    state = await initJob(jobId, inputImage);
  }

  const imageUrl = state.inputUrl!;

  try {
    // 3. Real Content Safety & Wallet Check
    if (state.status === 'pending') {
      await updateJobState(jobId, { 
        status: 'analyzing', 
        progress: 10, 
        logs: [`[${new Date().toISOString()}] 开始内容安全校验与扣费`] 
      });

      // 3.1 Image Safety Check
      const isImageSafe = await validateImage(imageUrl);
      if (!isImageSafe) throw new Error('图片内容审核未通过');

      // 3.2 Wallet Deduction (1 credit per generation)
      await deductCredit(userId, 1);
      state = await updateJobState(jobId, { 
        logs: [`[${new Date().toISOString()}] 扣费成功，开始处理任务`] 
      });
    }

    // 4. Vision (Hunyuan) - Skip if already analyzed
    if (state.status === 'analyzing' || !state.analysis) {
      await updateJobState(jobId, { 
        status: 'analyzing', 
        progress: 20, 
        logs: [`[${new Date().toISOString()}] 开始视觉分析 (Hunyuan Vision)`] 
      });
      const analysis = await callHunyuanVision(imageUrl);
      
      // 4.1 Text Safety Check for AI Analysis
      const isTextSafe = await validateText(analysis);
      if (!isTextSafe) throw new Error('生成内容描述审核未通过');

      state = await updateJobState(jobId, { 
        analysis, 
        status: 'matting', // Advance status
        progress: 40, 
        logs: [`[${new Date().toISOString()}] 视觉分析完成`] 
      });
    }

    // 5. Matting (Bria) - Skip if already matted
    if (state.status === 'matting' || !state.maskUrl) {
      await updateJobState(jobId, { 
        status: 'matting', 
        progress: 50, 
        logs: [`[${new Date().toISOString()}] 开始智能抠图 (Bria Matting)`] 
      });
      const maskUrl = await callBriaMatting(imageUrl, jobId);
      state = await updateJobState(jobId, { 
        maskUrl, 
        status: 'styling', // Advance status
        progress: 70, 
        logs: [`[${new Date().toISOString()}] 智能抠图完成`] 
      });
    }

    // 6. Generation (Flux Fill) - Skip if already generating
    if (state.status === 'styling' || state.status === 'generating' || !state.resultUrl) {
      await updateJobState(jobId, { 
        status: 'generating', 
        progress: 80, 
        logs: [`[${new Date().toISOString()}] 开始场景重绘 (Flux Fill)`] 
      });
      const resultUrl = await callFluxFill(imageUrl, state.maskUrl!, state.analysis!, jobId);
      state = await updateJobState(jobId, { 
        status: 'completed', 
        progress: 100, 
        resultUrl, 
        logs: [`[${new Date().toISOString()}] 任务完成，生成结果: ${resultUrl}`] 
      });
    }
    
    return state;

  } catch (error: any) {
    console.error(`Job ${jobId} failed:`, error);
    // Only update if not already failed to avoid loops or redundant updates
    const currentStatus = (await getJobState(jobId)).state?.status;
    if (currentStatus !== 'failed') {
      return await updateJobState(jobId, { 
        status: 'failed', 
        error: error.message || 'Unknown error', 
        logs: [`[${new Date().toISOString()}] 任务失败: ${error.message || 'Unknown error'}`] 
      });
    }
    throw error;
  }
}
