import crypto from 'crypto';
import { logger } from '@/app/utils/logger';

interface CacheEntry {
  imageUrls: string[];
  timestamp: number;
  productName: string;
  style: string;
  platform: string;
}

const CACHE_TTL = 7 * 24 * 60 * 60 * 1000;
const imageCache = new Map<string, CacheEntry>();

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
  const cacheKey = generateCacheKey(imageMD5, style, platform, productName);
  const entry = imageCache.get(cacheKey);

  if (!entry) {
    logger.info(`缓存未命中: ${cacheKey}`);
    return null;
  }

  const now = Date.now();
  if (now - entry.timestamp > CACHE_TTL) {
    logger.info(`缓存已过期: ${cacheKey}`);
    imageCache.delete(cacheKey);
    return null;
  }

  logger.info(`缓存命中: ${cacheKey}, ${entry.imageUrls.length} 张图片`);
  return entry.imageUrls;
}

export async function setCachedImages(
  imageMD5: string,
  style: string,
  platform: string,
  productName: string,
  imageUrls: string[]
): Promise<void> {
  const cacheKey = generateCacheKey(imageMD5, style, platform, productName);

  const entry: CacheEntry = {
    imageUrls,
    timestamp: Date.now(),
    productName,
    style,
    platform
  };

  imageCache.set(cacheKey, entry);
  logger.info(`缓存已保存: ${cacheKey}, ${imageUrls.length} 张图片`);
}

export async function clearExpiredCache(): Promise<number> {
  const now = Date.now();
  let clearedCount = 0;

  for (const [key, entry] of imageCache.entries()) {
    if (now - entry.timestamp > CACHE_TTL) {
      imageCache.delete(key);
      clearedCount++;
    }
  }

  if (clearedCount > 0) {
    logger.info(`已清理过期缓存: ${clearedCount} 条`);
  }

  return clearedCount;
}

export function getCacheStats(): {
  totalEntries: number;
  totalSize: number;
} {
  let totalSize = 0;
  for (const entry of imageCache.values()) {
    totalSize += entry.imageUrls.reduce((sum, url) => sum + url.length, 0);
  }

  return {
    totalEntries: imageCache.size,
    totalSize
  };
}
