export enum TaskStatus {
  QUEUED = 'queued',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export enum TaskType {
  IMAGE_GENERATION = 'image_generation',
  COPY_GENERATION = 'copy_generation',
  DETAIL_PAGE = 'detail_page',
  BACKGROUND_REMOVAL = 'background_removal'
}

export interface TaskProgress {
  stage: string;
  progress: number;
  message?: string;
}

export interface Task {
  id: string;
  type: TaskType;
  status: TaskStatus;
  userId: string;
  payload?: any;
  progress?: TaskProgress;
  result?: any;
  error?: string;
  createdAt: number;
  updatedAt: number;
}

export interface WebSocketMessage {
  type: 'task_update' | 'task_complete' | 'task_error' | 'ping' | 'pong';
  taskId?: string;
  data?: any;
  timestamp: number;
}

export interface CreateTaskOptions {
  type: TaskType;
  userId: string;
  payload: any;
}
