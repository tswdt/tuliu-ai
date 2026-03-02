import crypto from 'crypto';
import { logger } from '@/app/utils/logger';

export async function calculateImageMD5(imageBuffer: Buffer): Promise<string> {
  return crypto.createHash('md5').update(imageBuffer).digest('hex');
}

export async function calculateImageMD5FromUrl(imageUrl: string): Promise<string> {
  try {
    logger.info(`正在从URL获取图片计算MD5: ${imageUrl}`);
    
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`无法获取图片: HTTP ${response.status}`);
    }
    
    const buffer = await response.arrayBuffer();
    const md5 = calculateImageMD5(Buffer.from(buffer));
    
    logger.info(`图片MD5计算完成: ${md5}`);
    return md5;
    
  } catch (error) {
    logger.error("计算图片MD5失败", { error: (error as Error).message, imageUrl });
    throw error;
  }
}

export async function calculateImageMD5FromFile(file: File): Promise<string> {
  try {
    logger.info(`正在从文件计算MD5: ${file.name}`);
    
    const arrayBuffer = await file.arrayBuffer();
    const md5 = calculateImageMD5(Buffer.from(arrayBuffer));
    
    logger.info(`图片MD5计算完成: ${md5}`);
    return md5;
    
  } catch (error) {
    logger.error("计算文件MD5失败", { error: (error as Error).message, fileName: file.name });
    throw error;
  }
}
