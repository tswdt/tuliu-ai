import sharp from 'sharp';
import { storagePut } from '../storage';

/**
 * 为图片添加水印
 * Trial 版：720p + 中央半透明 "Tuliu Preview" 水印
 * Paid 版：返回无水印原图
 */
export async function addWatermark(
  imageUrl: string,
  tier: string,
  userId: number
): Promise<string> {
  // Paid 版本不添加水印
  if (tier !== 'trial') {
    return imageUrl;
  }

  try {
    // 下载原始图片
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    const imageBuffer = await response.arrayBuffer();

    // 调整大小为 720p 并添加水印
    const watermarkedBuffer = await sharp(imageBuffer)
      .resize(720, 720, {
        fit: 'cover',
        position: 'center',
      })
      .composite([
        {
          input: await createWatermarkSvg(),
          gravity: 'center',
          blend: 'over',
        },
      ])
      .png()
      .toBuffer();

    // 上传到 S3
    const fileKey = `watermarked/${userId}/${Date.now()}-watermarked.png`;
    const { url } = await storagePut(fileKey, watermarkedBuffer, 'image/png');

    return url;
  } catch (error) {
    console.error('[Watermark Service] Failed to add watermark:', error);
    // 如果水印处理失败，返回原始图片 URL
    return imageUrl;
  }
}

/**
 * 创建水印 SVG
 */
async function createWatermarkSvg(): Promise<Buffer> {
  const svg = `
    <svg width="720" height="720" xmlns="http://www.w3.org/2000/svg">
      <!-- 半透明背景 -->
      <rect width="720" height="720" fill="rgba(0, 0, 0, 0)" />
      
      <!-- 水印文字 -->
      <g opacity="0.4">
        <text
          x="360"
          y="360"
          font-family="Arial, sans-serif"
          font-size="48"
          font-weight="bold"
          text-anchor="middle"
          dominant-baseline="middle"
          fill="white"
          letter-spacing="2"
        >
          Tuliu Preview
        </text>
      </g>
    </svg>
  `;

  return Buffer.from(svg);
}

/**
 * 验证图片尺寸是否有效
 */
export function isValidImageSize(width: number, height: number): boolean {
  const validSizes = [
    { w: 800, h: 800 },
    { w: 1024, h: 1024 },
    { w: 2048, h: 2048 },
    { w: 4096, h: 4096 },
  ];
  return validSizes.some(size => size.w === width && size.h === height);
}
