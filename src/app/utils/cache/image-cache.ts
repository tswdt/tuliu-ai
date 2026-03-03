import crypto from 'crypto';
import { logger } from '@/app/utils/logger';
import { getRedisClient } from '@/app/utils/redis';

interface CacheEntry {
  imageUrls: string[];
  timestamp: number;
  productName: string;
  style: string;
  platform: string;
}

const CACHE_TTL = 7 * 24 * 60 * 60;

function generateMD5(data: string): string {
  return crypto.createHash('md5').update(data).digest('hex');
}

function generateCacheKey(
  imageMD5: string,
  style: string,
  platform: string,
  productName: string
): string {
  const keyData = `${imageMD5}-${style}-${platform}-${productName}`;
  return `img:${generateMD5(keyData)}`;
}

export async function getCachedImages(
  imageMD5: string,
  style: string,
  platform: string,
  productName: string
): Promise<string[] | null> {
  try {
    const cacheKey = generateCacheKey(imageMD5, style, platform, productName);
    const redis = getRedisClient();
    
    const data = await redis.get(cacheKey);
    
    if (!data) {
      logger.info(`Redis缓存未命中: ${cacheKey}`);
      return null;
    }

    const entry: CacheEntry = JSON.parse(data);
    const now = Math.floor(Date.now() / 1000);
    
    if (now - entry.timestamp > CACHE_TTL) {
      logger.info(`Redis缓存已过期: ${cacheKey}`);
      await redis.del(cacheKey);
      return null;
    }

    logger.info(`Redis缓存命中: ${cacheKey}, ${entry.imageUrls.length} 张图片`);
    return entry.imageUrls;
    
  } catch (error) {
    logger.error('Redis获取缓存失败', { error: (error as Error).message });
    return null;
  }
}

export async function setCachedImages(
  imageMD5: string,
  style: string,
  platform: string,
  productName: string,
  imageUrls: string[]
): Promise<void> {
  try {
    const cacheKey = generateCacheKey(imageMD5, style, platform, productName);
    const redis = getRedisClient();

    const entry: CacheEntry = {
      imageUrls,
      timestamp: Math.floor(Date.now() / 1000),
      productName,
      style,
      platform
    };

    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(entry));
    logger.info(`Redis缓存已保存: ${cacheKey}, ${imageUrls.length} 张图片`);
    
  } catch (error) {
    logger.error('Redis保存缓存失败', { error: (error as Error).message });
  }
}

export async function clearExpiredCache(): Promise<number> {
  try {
    const redis = getRedisClient();
    logger.info('Redis自动清理过期缓存，无需手动操作');
    return 0;
  } catch (error) {
    logger.error('Redis清理缓存失败', { error: (error as Error).message });
    return 0;
  }
}

export async function getCacheStats(): Promise<{
  totalEntries: number;
  totalSize: number;
}> {
  try {
    const redis = getRedisClient();
    const keys = await redis.keys('img:*');
    
    let totalSize = 0;
    for (const key of keys) {
      const data = await redis.get(key);
      if (data) {
        totalSize += data.length;
      }
    }

    return {
      totalEntries: keys.length,
      totalSize
    };
  } catch (error) {
    logger.error('获取Redis缓存统计失败', { error: (error as Error).message });
    return {
      totalEntries: 0,
      totalSize: 0
    };
  }
}
