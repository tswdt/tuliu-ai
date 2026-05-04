import { NextRequest, NextResponse } from 'next/server';
import { createProject, getProject, listProjects, updateProject, duplicateProject, deleteProject, addProjectImage } from '@/lib/project';
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
      const result = await createProject({ userId, ...body });
      return NextResponse.json(result, { status: result.success ? 200 : 400 });
    }
    case 'get': {
      const result = await getProject(body.projectId, userId);
      return NextResponse.json(result, { status: result.success ? 200 : 404 });
    }
    case 'list': {
      const result = await listProjects(userId, body.options);
      return NextResponse.json(result);
    }
    case 'update': {
      const result = await updateProject(body.projectId, userId, body.data);
      return NextResponse.json(result, { status: result.success ? 200 : 400 });
    }
    case 'duplicate': {
      const result = await duplicateProject(body.projectId, userId);
      return NextResponse.json(result, { status: result.success ? 200 : 400 });
    }
    case 'delete': {
      const result = await deleteProject(body.projectId, userId);
      return NextResponse.json(result);
    }
    case 'add-image': {
      const result = await addProjectImage(body.projectId, body.imageData);
      return NextResponse.json(result, { status: result.success ? 200 : 400 });
    }
    default:
      return NextResponse.json({ success: false, error: '未知操作' }, { status: 400 });
  }
}
