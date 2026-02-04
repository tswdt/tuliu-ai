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
  updatedAt: string;
}

export async function getJobState(jobId: string): Promise<JobState | null> {
  return getJson<JobState>(`jobs/${jobId}.json`);
}

export async function updateJobState(
  jobId: string,
  updates: Partial<JobState>
): Promise<JobState> {
  const current = await getJobState(jobId);
  
  const newState: JobState = {
    id: jobId,
    status: 'pending',
    progress: 0,
    updatedAt: new Date().toISOString(),
    ...current,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  await putJson(`jobs/${jobId}.json`, newState);
  return newState;
}

export async function initJob(jobId: string, inputUrl: string): Promise<JobState> {
  const initialState: JobState = {
    id: jobId,
    status: 'pending',
    progress: 0,
    inputUrl,
    updatedAt: new Date().toISOString(),
  };
  
  await putJson(`jobs/${jobId}.json`, initialState);
  return initialState;
}
