import { NextRequest, NextResponse } from 'next/server';
import { createTask, updateTask, getTask, listTasks, retryTask, getTaskStats } from '@/lib/task';
import { verifyToken } from '@/lib/auth';

async function getUserId(request: NextRequest): Promise<string | null> {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');
  if (!token) return null;
  const payload = verifyToken(token);
  return payload?.userId || null;
}

export async function POST(request: NextRequest) {
  const userId = await getUserId(request);
  if (!userId) return NextResponse.json({ success: false, error: '未登录' }, { status: 401 });

  const body = await request.json();
  const { action } = body;

  switch (action) {
    case 'create': {
      const result = await createTask({ userId, ...body });
      return NextResponse.json(result, { status: result.success ? 200 : 400 });
    }
    case 'get': {
      const result = await getTask(body.taskId);
      return NextResponse.json(result, { status: result.success ? 200 : 404 });
    }
    case 'list': {
      const result = await listTasks(userId, body.options);
      return NextResponse.json(result);
    }
    case 'update': {
      const result = await updateTask(body.taskId, body.data);
      return NextResponse.json(result, { status: result.success ? 200 : 400 });
    }
    case 'retry': {
      const result = await retryTask(body.taskId, userId);
      return NextResponse.json(result, { status: result.success ? 200 : 400 });
    }
    case 'stats': {
      const result = await getTaskStats(userId);
      return NextResponse.json(result);
    }
    default:
      return NextResponse.json({ success: false, error: '未知操作' }, { status: 400 });
  }
}
