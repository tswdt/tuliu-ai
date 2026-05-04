import { prisma } from '@/lib/prisma';
import { logger } from '@/app/utils/logger';

export interface OnboardingState {
  completed: boolean;
  currentStep: number;
  steps: OnboardingStep[];
}

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  { id: 'welcome', title: '欢迎来到 AI 详情页生成平台', description: '上传产品图，AI 自动生成电商详情页', completed: false },
  { id: 'upload', title: '上传你的第一张产品图', description: '支持 JPG、PNG、WEBP 格式', completed: false },
  { id: 'recognize', title: '查看 AI 识别结果', description: 'AI 自动识别产品信息和卖点', completed: false },
  { id: 'generate', title: '生成你的第一套商品图', description: '选择平台和风格，一键生成', completed: false },
  { id: 'export', title: '导出你的作品', description: '支持 PNG、JPG、详情页长图', completed: false },
];

export async function getOnboardingState(userId: string): Promise<OnboardingState> {
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return { completed: true, currentStep: 0, steps: ONBOARDING_STEPS };

    if (user.onboardingCompleted) {
      return { completed: true, currentStep: ONBOARDING_STEPS.length, steps: ONBOARDING_STEPS.map(s => ({ ...s, completed: true })) };
    }

    const generationCount = await prisma.generation.count({ where: { userId } });
    const projectCount = await prisma.project.count({ where: { userId } });

    const steps = ONBOARDING_STEPS.map(step => {
      let completed = false;
      switch (step.id) {
        case 'welcome': completed = true; break;
        case 'upload': completed = projectCount > 0; break;
        case 'recognize': completed = projectCount > 0; break;
        case 'generate': completed = generationCount > 0; break;
        case 'export': completed = false; break;
      }
      return { ...step, completed };
    });

    const currentStep = steps.findIndex(s => !s.completed);

    return { completed: currentStep === -1, currentStep: Math.max(0, currentStep), steps };
  } catch (error) {
    logger.error('[新手引导] 获取状态失败', { error: (error as Error).message });
    return { completed: false, currentStep: 0, steps: ONBOARDING_STEPS };
  }
}

export async function completeOnboardingStep(userId: string, stepId: string) {
  try {
    const state = await getOnboardingState(userId);
    const allCompleted = state.steps.every(s => s.completed || s.id === stepId);

    if (allCompleted) {
      await prisma.user.update({
        where: { id: userId },
        data: { onboardingCompleted: true },
      });
    }

    logger.info('[新手引导] 完成步骤', { userId, stepId, allCompleted });
    return { success: true, completed: allCompleted };
  } catch (error) {
    logger.error('[新手引导] 更新失败', { error: (error as Error).message });
    return { success: false, error: '更新引导状态失败' };
  }
}

export async function skipOnboarding(userId: string) {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { onboardingCompleted: true },
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: '跳过引导失败' };
  }
}

export function getExampleProjects() {
  return [
    {
      name: '白酒详情页',
      platform: 'TAOBAO',
      category: 'ALCOHOL',
      style: 'taobao-convert',
      description: '酒类商品详情页示例，包含主图、卖点图、参数图',
      thumbnailUrl: '/examples/liquor-thumb.jpg',
    },
    {
      name: '护肤品套装',
      platform: 'JD',
      category: 'BEAUTY',
      style: 'jd-quality',
      description: '美妆护肤品类详情页示例，强调品质和成分',
      thumbnailUrl: '/examples/beauty-thumb.jpg',
    },
    {
      name: '零食大礼包',
      platform: 'PDD',
      category: 'FOOD',
      style: 'pdd-promo',
      description: '食品类拼多多促销风详情页',
      thumbnailUrl: '/examples/snack-thumb.jpg',
    },
    {
      name: '蓝牙耳机',
      platform: 'AMAZON',
      category: 'ELECTRONICS',
      style: 'amazon-clean',
      description: '3C数码亚马逊A+页面示例',
      thumbnailUrl: '/examples/earphone-thumb.jpg',
    },
  ];
}
