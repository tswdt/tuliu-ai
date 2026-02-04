'use server';

import { initJob, updateJobState, getJobState } from '@/lib/services/job';
import { callHunyuanVision, callBriaMatting, callFluxFill, callContentModeration } from '@/lib/services/ai';

import { validateTurnstile } from '@/lib/services/security';

export async function startGeneration(jobId: string, imageUrl: string, turnstileToken?: string) {
  // 0. Security Check
  if (turnstileToken) {
    const isValid = await validateTurnstile(turnstileToken);
    await updateJobState(jobId, { logs: [`[${new Date().toISOString()}] 安全验证完成: ${isValid ? '成功' : '失败'}`] });
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
    await updateJobState(jobId, { logs: [`[${new Date().toISOString()}] 任务初始化成功`] });
    }

  try {
    // 3. Vision (Hunyuan) - Skip if already analyzed
    if (state.status === 'pending' || !state.analysis) {
      await updateJobState(jobId, { status: 'analyzing', progress: 20, logs: [`[${new Date().toISOString()}] 开始视觉分析 (Hunyuan Vision)`] });
      const analysis = await callHunyuanVision(imageUrl);
      state = await updateJobState(jobId, { analysis, progress: 40, logs: [`[${new Date().toISOString()}] 视觉分析完成`] });

      // 3.5. Content Moderation
      await updateJobState(jobId, { logs: [`[${new Date().toISOString()}] 开始内容审核`] });
      const isSafe = await callContentModeration(analysis);
      if (!isSafe) {
        throw new Error('内容审核失败：检测到违禁内容');
      }
      await updateJobState(jobId, { logs: [`[${new Date().toISOString()}] 内容审核通过`] });
    }

    // 4. Matting (Bria) - Skip if already matted
    if (state.status === 'analyzing' || !state.maskUrl) {
      await updateJobState(jobId, { status: 'matting', progress: 50, logs: [`[${new Date().toISOString()}] 开始智能抠图 (Bria Matting)`] });
      const maskUrl = await callBriaMatting(imageUrl, jobId);
      state = await updateJobState(jobId, { maskUrl, progress: 70, logs: [`[${new Date().toISOString()}] 智能抠图完成`] });
    }

    // 5. Generation (Flux Fill) - Skip if already generating
    if (state.status === 'matting' || !state.resultUrl) {
      await updateJobState(jobId, { status: 'generating', progress: 80, logs: [`[${new Date().toISOString()}] 开始场景重绘 (Flux Fill)`] });
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
    return await updateJobState(jobId, { 
      status: 'failed', 
      error: error.message || 'Unknown error', 
      logs: [`[${new Date().toISOString()}] 任务失败: ${error.message || 'Unknown error'}`] 
    });
  }
}
