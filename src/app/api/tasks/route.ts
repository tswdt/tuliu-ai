import { NextResponse } from 'next/server';
import { taskQueue } from '@/app/utils/task-queue';
import { TaskType, CreateTaskOptions } from '@/types/task-queue';
import { logger } from '@/app/utils/logger';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, userId, payload } = body;

    if (!type || !userId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: type and userId' },
        { status: 400 }
      );
    }

    await taskQueue.initPubSub();

    const options: CreateTaskOptions = {
      type: type as TaskType,
      userId,
      payload
    };

    const task = await taskQueue.createTask(options);

    return NextResponse.json({
      success: true,
      task
    });

  } catch (error) {
    logger.error('Failed to create task', { error: (error as Error).message });
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
