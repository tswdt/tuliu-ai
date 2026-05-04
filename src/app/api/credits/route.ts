import { NextRequest, NextResponse } from 'next/server';
import { checkCredits, deductCredits, addCredits, getCreditLogs, getCreditSummary } from '@/lib/credits';
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
    case 'check': {
      const result = await checkCredits(userId, body.action);
      return NextResponse.json(result);
    }
    case 'deduct': {
      const result = await deductCredits(userId, body.action, { taskId: body.taskId, projectId: body.projectId, description: body.description });
      return NextResponse.json(result, { status: result.success ? 200 : 400 });
    }
    case 'add': {
      const result = await addCredits(userId, body.amount, body.type, body.description);
      return NextResponse.json(result, { status: result.success ? 200 : 400 });
    }
    case 'logs': {
      const result = await getCreditLogs(userId, body.options);
      return NextResponse.json(result);
    }
    case 'summary': {
      const result = await getCreditSummary(userId);
      return NextResponse.json(result);
    }
    default:
      return NextResponse.json({ success: false, error: '未知操作' }, { status: 400 });
  }
}
