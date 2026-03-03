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

    const tempFileName = `${Date.now()}-${file.name}`;
    const tempPath = join(process.cwd(), 'public', 'temp', tempFileName);

    try {
      await writeFile(tempPath, buffer);
      logger.info('图片保存到临时文件', { tempPath });
    } catch (error) {
      logger.error('保存临时文件失败', { error: (error as Error).message });
    }

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
      fileSize: file.size
    });

  } catch (error) {
    logger.error('图片上传失败', { error: (error as Error).message });
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
