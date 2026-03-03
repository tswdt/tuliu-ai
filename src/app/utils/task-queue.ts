import { getRedisClient } from './redis';
import { logger } from './logger';
import { 
  Task, 
  TaskStatus, 
  TaskType, 
  TaskProgress,
  WebSocketMessage,
  CreateTaskOptions
} from '@/types/task-queue';
import { v4 as uuidv4 } from 'uuid';

const TASK_CHANNEL = 'task_updates';
const TASK_QUEUE_KEY = 'task_queue';
const TASK_STORE_PREFIX = 'task:';
const USER_TASK_PREFIX = 'user_tasks:';

export class TaskQueue {
  private static instance: TaskQueue;
  private redis: ReturnType<typeof getRedisClient>;
  private pubSubClient: ReturnType<typeof getRedisClient> | null = null;
  private subscribers: Map<string, Set<(message: WebSocketMessage) => void>> = new Map();

  private constructor() {
    this.redis = getRedisClient();
  }

  public static getInstance(): TaskQueue {
    if (!TaskQueue.instance) {
      TaskQueue.instance = new TaskQueue();
    }
    return TaskQueue.instance;
  }

  public async initPubSub(): Promise<void> {
    if (this.pubSubClient) {
      return;
    }

    this.pubSubClient = getRedisClient().duplicate();
    await this.pubSubClient.subscribe(TASK_CHANNEL);

    this.pubSubClient.on('message', (channel, message) => {
      if (channel === TASK_CHANNEL) {
        this.handleTaskUpdate(JSON.parse(message));
      }
    });

    logger.info('TaskQueue Pub/Sub initialized');
  }

  private handleTaskUpdate(message: WebSocketMessage): void {
    if (message.taskId) {
      const taskSubscribers = this.subscribers.get(message.taskId);
      if (taskSubscribers) {
        taskSubscribers.forEach(callback => callback(message));
      }
    }
  }

  public subscribe(taskId: string, callback: (message: WebSocketMessage) => void): () => void {
    if (!this.subscribers.has(taskId)) {
      this.subscribers.set(taskId, new Set());
    }
    this.subscribers.get(taskId)!.add(callback);

    return () => {
      const subscribers = this.subscribers.get(taskId);
      if (subscribers) {
        subscribers.delete(callback);
        if (subscribers.size === 0) {
          this.subscribers.delete(taskId);
        }
      }
    };
  }

  public async createTask(options: CreateTaskOptions): Promise<Task> {
    const taskId = uuidv4();
    const now = Date.now();

    const task: Task = {
      id: taskId,
      type: options.type,
      status: TaskStatus.QUEUED,
      userId: options.userId,
      payload: options.payload,
      createdAt: now,
      updatedAt: now,
    };

    await this.redis.setex(
      `${TASK_STORE_PREFIX}${taskId}`,
      7 * 24 * 60 * 60,
      JSON.stringify(task)
    );

    await this.redis.lpush(TASK_QUEUE_KEY, taskId);
    await this.redis.lpush(`${USER_TASK_PREFIX}${options.userId}`, taskId);

    await this.publishTaskUpdate(taskId, {
      type: 'task_update',
      taskId,
      data: { status: TaskStatus.QUEUED },
      timestamp: now
    });

    logger.info('Task created', { taskId, type: options.type, userId: options.userId });
    return task;
  }

  public async getTask(taskId: string): Promise<Task | null> {
    const data = await this.redis.get(`${TASK_STORE_PREFIX}${taskId}`);
    if (!data) return null;
    return JSON.parse(data);
  }

  public async updateTaskStatus(
    taskId: string, 
    status: TaskStatus, 
    progress?: TaskProgress,
    result?: any,
    error?: string
  ): Promise<void> {
    const task = await this.getTask(taskId);
    if (!task) {
      logger.warn('Task not found for update', { taskId });
      return;
    }

    task.status = status;
    task.updatedAt = Date.now();
    if (progress) task.progress = progress;
    if (result) task.result = result;
    if (error) task.error = error;

    await this.redis.setex(
      `${TASK_STORE_PREFIX}${taskId}`,
      7 * 24 * 60 * 60,
      JSON.stringify(task)
    );

    const messageType = status === TaskStatus.COMPLETED 
      ? 'task_complete' 
      : status === TaskStatus.FAILED 
      ? 'task_error' 
      : 'task_update';

    await this.publishTaskUpdate(taskId, {
      type: messageType,
      taskId,
      data: { status, progress, result, error },
      timestamp: Date.now()
    });

    logger.info('Task updated', { taskId, status });
  }

  private async publishTaskUpdate(taskId: string, message: WebSocketMessage): Promise<void> {
    await this.redis.publish(TASK_CHANNEL, JSON.stringify(message));
  }

  public async getNextTask(): Promise<Task | null> {
    const taskId = await this.redis.rpop(TASK_QUEUE_KEY);
    if (!taskId) return null;
    return this.getTask(taskId);
  }

  public async getUserTasks(userId: string, limit: number = 10): Promise<Task[]> {
    const taskIds = await this.redis.lrange(`${USER_TASK_PREFIX}${userId}`, 0, limit - 1);
    const tasks: Task[] = [];

    for (const taskId of taskIds) {
      const task = await this.getTask(taskId);
      if (task) tasks.push(task);
    }

    return tasks;
  }
}

export const taskQueue = TaskQueue.getInstance();
