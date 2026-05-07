import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { logger } from '@/app/utils/logger';
import { uploadImageToOSS } from '@/app/utils/oss/upload-image';

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const OSS_CONFIGURED = !!(
  process.env.ALIYUN_OSS_ACCESS_KEY_ID &&
  process.env.ALIYUN_OSS_ACCESS_KEY_SECRET &&
  process.env.ALIYUN_OSS_BUCKET
);

function getUserId(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');
  if (!token) return null;
  const payload = verifyToken(token);
  return payload?.userId || null;
}

export async function POST(request: NextRequest) {
  const userId = getUserId(request);
  if (!userId) {
    return NextResponse.json(
      { success: false, error: '请先登录' },
      { status: 401 }
    );
  }

  if (!OSS_CONFIGURED) {
    logger.error('[上传] OSS未配置，拒绝上传');
    return NextResponse.json(
      { success: false, error: '存储服务未配置，请联系管理员配置 OSS' },
      { status: 503 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get('image') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: '未找到图片文件' },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { success: false, error: `不支持的文件类型：${file.type}，仅支持 JPEG、PNG、WebP` },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: `文件大小超过限制：${(file.size / 1024 / 1024).toFixed(1)}MB，最大允许 10MB` },
        { status: 400 }
      );
    }

    logger.info('[上传] 开始处理', { userId, name: file.name, type: file.type, size: file.size });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const imageUrl = `data:${file.type};base64,${buffer.toString('base64')}`;

    const ossKey = `user-uploads/${userId}/${Date.now()}`;
    const ossUrl = await uploadImageToOSS(imageUrl, ossKey, undefined);

    logger.info('[上传] OSS上传成功', { userId, ossUrl: ossUrl.substring(0, 60) + '...' });

    return NextResponse.json({
      success: true,
      imageUrl: ossUrl,
      fileName: file.name,
      fileSize: file.size,
      storage: 'oss',
    });
  } catch (error) {
    logger.error('[上传] 失败', { userId, error: (error as Error).message });
    return NextResponse.json(
      { success: false, error: `图片上传失败：${(error as Error).message}，请重新上传` },
      { status: 500 }
    );
  }
}
