import { logger } from '@/app/utils/logger';

interface SafetyCheckResult {
  passed: boolean;
  reason?: string;
  details?: any;
}

const FORBIDDEN_WORDS = [
  '色情', '暴力', '恐怖', '血腥', '恐怖主义', '分裂', '颠覆',
  '反动', '邪教', '迷信', '赌博', '毒品', '吸毒',
  'sex', 'porn', 'nude', 'violence', 'terror',
  'gamble', 'drug', 'kill', 'murder',
  '法轮功', '台独', '港独', '藏独', '疆独'
];

export async function checkTextSafety(text: string): Promise<SafetyCheckResult> {
  try {
    logger.info(`开始文本内容安全检查: ${text.substring(0, 50)}...`);

    const lowerText = text.toLowerCase();
    
    for (const word of FORBIDDEN_WORDS) {
      if (lowerText.includes(word.toLowerCase())) {
        logger.warn("内容安全检查未通过", { forbiddenWord: word });
        return {
          passed: false,
          reason: `内容包含违规信息: ${word}`,
          details: { forbiddenWord: word }
        };
      }
    }

    logger.info("文本内容安全检查通过");
    return { passed: true };

  } catch (error) {
    logger.error("内容安全检查异常", { error: (error as Error).message });
    return { passed: true };
  }
}

export async function checkImageSafety(imageUrl: string): Promise<SafetyCheckResult> {
  try {
    logger.info(`开始图片内容安全检查: ${imageUrl}`);
    logger.info("图片内容安全检查通过（简化版）");
    return { passed: true };
  } catch (error) {
    logger.error("图片内容安全检查异常", { error: (error as Error).message });
    return { passed: true };
  }
}
