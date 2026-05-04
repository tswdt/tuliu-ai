import { NextResponse } from 'next/server';
import { logger } from '@/app/utils/logger';
import OSS from 'ali-oss';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prefix = 'uploads', fileType = 'image' } = body;

    logger.info('请求OSS直传凭证', { prefix, fileType });

    const ALIYUN_OSS_ACCESS_KEY_ID = process.env.ALIYUN_OSS_ACCESS_KEY_ID;
    const ALIYUN_OSS_ACCESS_KEY_SECRET = process.env.ALIYUN_OSS_ACCESS_KEY_SECRET;
    const ALIYUN_OSS_BUCKET = process.env.ALIYUN_OSS_BUCKET;
    const ALIYUN_OSS_REGION = process.env.ALIYUN_OSS_REGION || 'oss-cn-shanghai';
    const ALIYUN_OSS_ENDPOINT = process.env.ALIYUN_OSS_ENDPOINT;

    if (!ALIYUN_OSS_ACCESS_KEY_ID || !ALIYUN_OSS_ACCESS_KEY_SECRET || !ALIYUN_OSS_BUCKET) {
      return NextResponse.json(
        { success: false, error: 'OSS配置不完整' },
        { status: 500 }
      );
    }

    const fileName = `${prefix}/${Date.now()}-${Math.random().toString(36).substring(2, 10)}.${fileType === 'image' ? 'jpg' : 'png'}`;

    const ossClient = new OSS({
      region: ALIYUN_OSS_REGION,
      accessKeyId: ALIYUN_OSS_ACCESS_KEY_ID,
      accessKeySecret: ALIYUN_OSS_ACCESS_KEY_SECRET,
      bucket: ALIYUN_OSS_BUCKET,
      endpoint: ALIYUN_OSS_ENDPOINT
    });

    const result = await ossClient.calculatePostSignature({
      expiration: new Date(Date.now() + 3600 * 1000),
      conditions: [
        ['content-length-range', 0, 10 * 1024 * 1024]
      ]
    });

    const credentials = {
      accessKeyId: result.OSSAccessKeyId,
      policy: result.policy,
      signature: result.Signature,
      key: fileName,
      host: `https://${ALIYUN_OSS_BUCKET}.${ALIYUN_OSS_REGION}.aliyuncs.com`,
    };

    logger.info('OSS直传凭证生成成功', { fileName });

    return NextResponse.json({
      success: true,
      credentials,
      fileName
    });

  } catch (error) {
    logger.error('生成OSS直传凭证失败', { error: (error as Error).message });
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
