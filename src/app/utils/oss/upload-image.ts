import { logger } from '@/app/utils/logger';
import OSS from 'ali-oss';

const ALIYUN_OSS_ACCESS_KEY_ID = process.env.ALIYUN_OSS_ACCESS_KEY_ID;
const ALIYUN_OSS_ACCESS_KEY_SECRET = process.env.ALIYUN_OSS_ACCESS_KEY_SECRET;
const ALIYUN_OSS_BUCKET = process.env.ALIYUN_OSS_BUCKET;
const ALIYUN_OSS_REGION = process.env.ALIYUN_OSS_REGION;
const ALIYUN_OSS_ENDPOINT = process.env.ALIYUN_OSS_ENDPOINT;

if (!ALIYUN_OSS_ACCESS_KEY_ID || !ALIYUN_OSS_ACCESS_KEY_SECRET || !ALIYUN_OSS_BUCKET) {
  throw new Error("未配置阿里云OSS AccessKey，请检查.env文件");
}

const ossClient = new OSS({
  region: ALIYUN_OSS_REGION || 'oss-cn-shanghai',
  accessKeyId: ALIYUN_OSS_ACCESS_KEY_ID,
  accessKeySecret: ALIYUN_OSS_ACCESS_KEY_SECRET,
  bucket: ALIYUN_OSS_BUCKET,
  endpoint: ALIYUN_OSS_ENDPOINT
});

export async function uploadImageToOSS(
  imageUrl: string,
  fileNamePrefix: string = 'generated',
  targetSize?: { width: number; height: number }
): Promise<string> {
  try {
    logger.info(`开始上传图片到OSS: ${imageUrl}`);
    
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`无法获取图片: HTTP ${response.status}`);
    }
    
    const buffer = await response.arrayBuffer();
    
    const fileName = `${fileNamePrefix}/${Date.now()}-${Math.random().toString(36).substring(2, 10)}.jpg`;
    
    await ossClient.put(fileName, Buffer.from(buffer), {
      headers: {
        'Content-Type': 'image/jpeg'
      }
    });
    
    let signedUrl = ossClient.signatureUrl(fileName, { 
      expires: 3600 * 24 * 365 * 10 
    });
    
    if (targetSize) {
      const resizeProcess = `image/resize,m_lfit,w_${targetSize.width},h_${targetSize.height}`;
      signedUrl = ossClient.signatureUrl(fileName, {
        expires: 3600 * 24 * 365 * 10,
        process: resizeProcess
      });
      logger.info(`图片已裁剪为 ${targetSize.width}x${targetSize.height}`);
    }
    
    logger.info(`图片上传OSS成功: ${signedUrl}`);
    return signedUrl;
    
  } catch (error) {
    logger.error("图片上传OSS失败", { error: (error as Error).message, imageUrl });
    throw error;
  }
}

export async function uploadMultipleImagesToOSS(
  imageUrls: string[],
  fileNamePrefix: string = 'generated',
  targetSize?: { width: number; height: number }
): Promise<string[]> {
  const uploadedUrls: string[] = [];
  
  for (const imageUrl of imageUrls) {
    try {
      const uploadedUrl = await uploadImageToOSS(imageUrl, fileNamePrefix, targetSize);
      uploadedUrls.push(uploadedUrl);
    } catch (error) {
      logger.error("批量上传图片失败", { error: (error as Error).message, imageUrl });
      uploadedUrls.push(imageUrl);
    }
  }
  
  return uploadedUrls;
}
