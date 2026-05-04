import { NextResponse } from 'next/server';
import { taskQueue } from '@/app/utils/task-queue';
import { logger } from '@/app/utils/logger';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await params;
    const task = await taskQueue.getTask(taskId);

    if (!task) {
      return NextResponse.json(
        { success: false, error: 'Task not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      task
    });

  } catch (error) {
    logger.error('Failed to get task', { error: (error as Error).message });
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
