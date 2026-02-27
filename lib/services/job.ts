import { getJson, putJson } from './cos';

export type JobStatus = 'pending' | 'analyzing' | 'matting' | 'styling' | 'generating' | 'completed' | 'failed';

export interface JobState {
  id: string;
  status: JobStatus;
  progress: number;
  inputUrl?: string;
  maskUrl?: string;
  resultUrl?: string;
  analysis?: string;
  error?: string;
  logs: string[];
  updatedAt: string;
}

export async function getJobState(jobId: string): Promise<{ state: JobState | null; etag?: string }> {
  const { data, etag } = await getJson<JobState>(`jobs/${jobId}.json`);
  return { state: data, etag };
}

export async function updateJobState(
  jobId: string,
  updates: Partial<JobState>
): Promise<JobState> {
  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
    try {
      const { state: current, etag } = await getJobState(jobId);
      
      const newState: JobState = {
        id: jobId,
        status: 'pending',
        progress: 0,
        ...current,
        ...updates,
        logs: [...(current?.logs || []), ...(updates.logs || [])],
        updatedAt: new Date().toISOString(),
      };
      
      await putJson(`jobs/${jobId}.json`, newState, etag);
      return newState;
    } catch (error: any) {
      if (error.message.includes('Precondition Failed') && attempts < maxAttempts - 1) {
        attempts++;
        // Wait a bit before retrying
        await new Promise(resolve => setTimeout(resolve, 100 * attempts));
        continue;
      }
      throw error;
    }
  }
  throw new Error('Failed to update job state after multiple attempts');
}

export async function initJob(jobId: string, inputUrl: string): Promise<JobState> {
  const initialState: JobState = {
    id: jobId,
    status: 'pending',
    progress: 0,
    inputUrl,
    logs: [],
    updatedAt: new Date().toISOString(),
  };
  
  await putJson(`jobs/${jobId}.json`, initialState);
  return initialState;
}
