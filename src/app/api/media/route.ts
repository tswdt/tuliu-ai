import { NextRequest, NextResponse } from 'next/server';
import { createMediaItem, listMediaItems, deleteMediaItem, createFolder, listFolders, saveGeneratedImages } from '@/lib/media';
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
    case 'add': {
      const result = await createMediaItem({ userId, ...body });
      return NextResponse.json(result, { status: result.success ? 200 : 400 });
    }
    case 'list': {
      const result = await listMediaItems(userId, body.options);
      return NextResponse.json(result);
    }
    case 'delete': {
      const result = await deleteMediaItem(body.itemId, userId);
      return NextResponse.json(result);
    }
    case 'create-folder': {
      const result = await createFolder(userId, body.name, body.parentId);
      return NextResponse.json(result, { status: result.success ? 200 : 400 });
    }
    case 'list-folders': {
      const result = await listFolders(userId, body.parentId);
      return NextResponse.json(result);
    }
    case 'save-generated': {
      const result = await saveGeneratedImages(userId, body.projectId, body.images);
      return NextResponse.json(result, { status: result.success ? 200 : 400 });
    }
    default:
      return NextResponse.json({ success: false, error: '未知操作' }, { status: 400 });
  }
}
