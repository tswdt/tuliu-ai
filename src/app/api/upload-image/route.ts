import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { logger } from '@/app/utils/logger';
import { uploadImageToOSS } from '@/app/utils/oss/upload-image';

export const config = {
  api: {
    bodyParser: false,
  },
};

const OSS_CONFIGURED = !!(
  process.env.ALIYUN_OSS_ACCESS_KEY_ID &&
  process.env.ALIYUN_OSS_ACCESS_KEY_SECRET &&
  process.env.ALIYUN_OSS_BUCKET
);

export async function POST(request: Request) {
  try {
    logger.info('开始处理图片上传');

    const formData = await request.formData();
    const file = formData.get('image') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: '未找到图片文件' },
        { status: 400 }
      );
    }

    logger.info('接收到图片', {
      name: file.name,
      type: file.type,
      size: file.size
    });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    if (OSS_CONFIGURED) {
      try {
        const imageUrl = `data:${file.type};base64,${buffer.toString('base64')}`;

        const ossUrl = await uploadImageToOSS(
          imageUrl,
          `user-uploads/${Date.now()}`,
          undefined
        );

        logger.info('图片上传到OSS成功', { ossUrl: ossUrl.substring(0, 50) + '...' });

        return NextResponse.json({
          success: true,
          imageUrl: ossUrl,
          fileName: file.name,
          fileSize: file.size,
          storage: 'oss',
        });
      } catch (ossError) {
        logger.error('OSS上传失败，尝试本地存储', { error: (ossError as Error).message });
      }
    } else {
      logger.warn('OSS未配置，使用本地临时存储');
    }

    try {
      const tempFileName = `${Date.now()}-${file.name}`;
      const tempPath = join(process.cwd(), 'public', 'temp', tempFileName);

      await writeFile(tempPath, buffer);
      logger.info('图片保存到本地临时文件', { tempPath });

      const localUrl = `/temp/${tempFileName}`;

      return NextResponse.json({
        success: true,
        imageUrl: localUrl,
        fileName: file.name,
        fileSize: file.size,
        storage: 'local',
        warning: OSS_CONFIGURED ? 'OSS上传失败，已回退到本地存储' : 'OSS未配置，图片仅保存在本地临时目录，服务重启后将丢失',
      });
    } catch (localError) {
      logger.error('本地存储也失败', { error: (localError as Error).message });

      const dataUrl = `data:${file.type};base64,${buffer.toString('base64')}`;
      return NextResponse.json({
        success: true,
        imageUrl: dataUrl,
        fileName: file.name,
        fileSize: file.size,
        storage: 'base64',
        warning: '图片仅以base64编码返回，未持久化存储',
      });
    }
  } catch (error) {
    logger.error('图片上传失败', { error: (error as Error).message });
    return NextResponse.json(
      { success: false, error: `图片上传失败：${(error as Error).message}` },
      { status: 500 }
    );
  }
}
