import { logger } from '@/app/utils/logger';
import { GeneratedImage } from './image-generator';
import { CopyContent } from '../copy-generator';
import { StructuredProduct } from './structurer';
import { GenerationStrategy } from './strategy-matcher';

export interface LayoutInput {
  images: GeneratedImage[];
  copy: CopyContent;
  product: StructuredProduct;
  strategy: GenerationStrategy;
}

export interface LayoutBlock {
  id: string;
  type: 'hero' | 'selling-point' | 'detail' | 'scene' | 'params' | 'banner' | 'divider' | 'text' | 'image' | 'a-plus';
  x: number;
  y: number;
  width: number;
  height: number;
  content: {
    imageUrl?: string;
    text?: string;
    subtitle?: string;
    items?: string[];
    specs?: Array<{ label: string; value: string }>;
  };
  style: {
    backgroundColor: string;
    textColor: string;
    fontSize: number;
    fontWeight: string;
    textAlign: 'left' | 'center' | 'right';
    padding: number;
  };
}

export interface LayoutPage {
  id: string;
  label: string;
  width: number;
  height: number;
  blocks: LayoutBlock[];
  thumbnail?: string;
}

export interface LayoutOutput {
  pages: LayoutPage[];
  totalPages: number;
  canvasWidth: number;
  platformName: string;
}

const PLATFORM_LAYOUT_CONFIG: Record<string, {
  canvasWidth: number;
  heroHeight: number;
  sectionGap: number;
  padding: number;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
}> = {
  TAOBAO: {
    canvasWidth: 750,
    heroHeight: 750,
    sectionGap: 16,
    padding: 24,
    backgroundColor: '#ffffff',
    textColor: '#333333',
    accentColor: '#FF4400',
  },
  TMALL: {
    canvasWidth: 750,
    heroHeight: 750,
    sectionGap: 16,
    padding: 24,
    backgroundColor: '#ffffff',
    textColor: '#333333',
    accentColor: '#FF0036',
  },
  JD: {
    canvasWidth: 750,
    heroHeight: 750,
    sectionGap: 20,
    padding: 28,
    backgroundColor: '#ffffff',
    textColor: '#333333',
    accentColor: '#E4393C',
  },
  PINDUODUO: {
    canvasWidth: 750,
    heroHeight: 1000,
    sectionGap: 12,
    padding: 20,
    backgroundColor: '#ffffff',
    textColor: '#333333',
    accentColor: '#E02E24',
  },
  DOUYIN: {
    canvasWidth: 1080,
    heroHeight: 1440,
    sectionGap: 16,
    padding: 24,
    backgroundColor: '#ffffff',
    textColor: '#333333',
    accentColor: '#161823',
  },
  AMAZON: {
    canvasWidth: 1000,
    heroHeight: 1000,
    sectionGap: 24,
    padding: 32,
    backgroundColor: '#ffffff',
    textColor: '#333333',
    accentColor: '#FF9900',
  },
  SHOPIFY: {
    canvasWidth: 1000,
    heroHeight: 1000,
    sectionGap: 20,
    padding: 28,
    backgroundColor: '#ffffff',
    textColor: '#333333',
    accentColor: '#95BF47',
  },
};

export function composeLayout(input: LayoutInput): LayoutOutput {
  logger.info('[模块6-自动排版] 开始排版', {
    imageCount: input.images.length,
    platform: input.strategy.platform.id,
  });

  const config = PLATFORM_LAYOUT_CONFIG[input.strategy.platform.id] || PLATFORM_LAYOUT_CONFIG.TAOBAO;
  const { images, copy, product, strategy } = input;

  const pages: LayoutPage[] = [];
  let blockId = 0;
  const nextId = () => `block_${++blockId}`;

  const mainImages = images.filter(img => img.imageType === 'MAIN_IMAGE' || img.contentType === 'MAIN_IMAGE');
  const sceneImages = images.filter(img => img.imageType === 'SCENE_IMAGE');
  const detailImages = images.filter(img => img.imageType === 'DETAIL_IMAGE');
  const sellingPointImages = images.filter(img => img.imageType === 'SELLING_POINT_IMAGE');

  const page1Blocks: LayoutBlock[] = [];
  page1Blocks.push({
    id: nextId(),
    type: 'hero',
    x: 0, y: 0,
    width: config.canvasWidth,
    height: config.heroHeight,
    content: {
      imageUrl: mainImages[0]?.url || '',
      text: copy.mainTitle,
    },
    style: {
      backgroundColor: config.backgroundColor,
      textColor: config.textColor,
      fontSize: 36,
      fontWeight: 'bold',
      textAlign: 'center',
      padding: config.padding,
    },
  });

  let currentY = config.heroHeight + config.sectionGap;

  page1Blocks.push({
    id: nextId(),
    type: 'banner',
    x: 0, y: currentY,
    width: config.canvasWidth,
    height: 120,
    content: {
      text: copy.mainTitle,
      subtitle: copy.subTitle,
    },
    style: {
      backgroundColor: config.accentColor,
      textColor: '#ffffff',
      fontSize: 32,
      fontWeight: 'bold',
      textAlign: 'center',
      padding: config.padding,
    },
  });
  currentY += 120 + config.sectionGap;

  pages.push({
    id: 'page_1',
    label: '主图',
    width: config.canvasWidth,
    height: currentY,
    blocks: page1Blocks,
  });

  if (sellingPointImages.length > 0 || copy.coreSellingPoints.length > 0) {
    const spBlocks: LayoutBlock[] = [];
    let spY = 0;

    spBlocks.push({
      id: nextId(),
      type: 'divider',
      x: 0, y: spY,
      width: config.canvasWidth,
      height: 80,
      content: { text: '核心卖点' },
      style: {
        backgroundColor: config.backgroundColor,
        textColor: config.accentColor,
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        padding: config.padding,
      },
    });
    spY += 80 + config.sectionGap;

    const pointsToShow = copy.coreSellingPoints.slice(0, 5);
    for (let i = 0; i < pointsToShow.length; i++) {
      const hasImage = sellingPointImages[i];
      const blockHeight = hasImage ? 400 : 100;

      spBlocks.push({
        id: nextId(),
        type: 'selling-point',
        x: config.padding,
        y: spY,
        width: config.canvasWidth - config.padding * 2,
        height: blockHeight,
        content: {
          imageUrl: hasImage?.url,
          text: pointsToShow[i],
          items: i === 0 ? copy.coreSellingPoints : undefined,
        },
        style: {
          backgroundColor: config.backgroundColor,
          textColor: config.textColor,
          fontSize: 26,
          fontWeight: 'normal',
          textAlign: 'left',
          padding: config.padding,
        },
      });
      spY += blockHeight + config.sectionGap;
    }

    pages.push({
      id: 'page_2',
      label: '卖点图',
      width: config.canvasWidth,
      height: spY,
      blocks: spBlocks,
    });
  }

  if (detailImages.length > 0) {
    const detailBlocks: LayoutBlock[] = [];
    let detailY = 0;

    detailBlocks.push({
      id: nextId(),
      type: 'divider',
      x: 0, y: detailY,
      width: config.canvasWidth,
      height: 80,
      content: { text: '产品细节' },
      style: {
        backgroundColor: config.backgroundColor,
        textColor: config.accentColor,
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        padding: config.padding,
      },
    });
    detailY += 80 + config.sectionGap;

    for (const img of detailImages) {
      detailBlocks.push({
        id: nextId(),
        type: 'detail',
        x: 0, y: detailY,
        width: config.canvasWidth,
        height: config.canvasWidth,
        content: { imageUrl: img.url },
        style: {
          backgroundColor: config.backgroundColor,
          textColor: config.textColor,
          fontSize: 24,
          fontWeight: 'normal',
          textAlign: 'center',
          padding: 0,
        },
      });
      detailY += config.canvasWidth + config.sectionGap;
    }

    pages.push({
      id: 'page_3',
      label: '细节图',
      width: config.canvasWidth,
      height: detailY,
      blocks: detailBlocks,
    });
  }

  if (sceneImages.length > 0) {
    const sceneBlocks: LayoutBlock[] = [];
    let sceneY = 0;

    sceneBlocks.push({
      id: nextId(),
      type: 'divider',
      x: 0, y: sceneY,
      width: config.canvasWidth,
      height: 80,
      content: { text: '使用场景' },
      style: {
        backgroundColor: config.backgroundColor,
        textColor: config.accentColor,
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        padding: config.padding,
      },
    });
    sceneY += 80 + config.sectionGap;

    for (const img of sceneImages) {
      sceneBlocks.push({
        id: nextId(),
        type: 'scene',
        x: 0, y: sceneY,
        width: config.canvasWidth,
        height: config.canvasWidth,
        content: { imageUrl: img.url },
        style: {
          backgroundColor: config.backgroundColor,
          textColor: config.textColor,
          fontSize: 24,
          fontWeight: 'normal',
          textAlign: 'center',
          padding: 0,
        },
      });
      sceneY += config.canvasWidth + config.sectionGap;
    }

    pages.push({
      id: 'page_4',
      label: '场景图',
      width: config.canvasWidth,
      height: sceneY,
      blocks: sceneBlocks,
    });
  }

  const paramsBlocks: LayoutBlock[] = [];
  let paramsY = 0;

  paramsBlocks.push({
    id: nextId(),
    type: 'divider',
    x: 0, y: paramsY,
    width: config.canvasWidth,
    height: 80,
    content: { text: '产品参数' },
    style: {
      backgroundColor: config.backgroundColor,
      textColor: config.accentColor,
      fontSize: 28,
      fontWeight: 'bold',
      textAlign: 'center',
      padding: config.padding,
    },
  });
  paramsY += 80 + config.sectionGap;

  const specs: Array<{ label: string; value: string }> = [
    { label: '产品名称', value: product.productName },
    { label: '品牌', value: product.brandName },
    { label: '材质', value: product.material },
    { label: '颜色', value: product.color.join('/') },
    { label: '风格', value: product.style },
    { label: '包装', value: product.packaging },
  ];
  if (product.specs) {
    product.specs.split(/[、,，\n]/).filter(Boolean).forEach((s, i) => {
      specs.push({ label: `规格${i + 1}`, value: s });
    });
  }

  paramsBlocks.push({
    id: nextId(),
    type: 'params',
    x: config.padding,
    y: paramsY,
    width: config.canvasWidth - config.padding * 2,
    height: specs.length * 60 + 40,
    content: { specs },
    style: {
      backgroundColor: '#f8f8f8',
      textColor: config.textColor,
      fontSize: 24,
      fontWeight: 'normal',
      textAlign: 'left',
      padding: config.padding,
    },
  });

  pages.push({
    id: 'page_params',
    label: '参数图',
    width: config.canvasWidth,
    height: paramsY + specs.length * 60 + 80,
    blocks: paramsBlocks,
  });

  const output: LayoutOutput = {
    pages,
    totalPages: pages.length,
    canvasWidth: config.canvasWidth,
    platformName: strategy.platform.name,
  };

  logger.info('[模块6-自动排版] 排版完成', { totalPages: output.totalPages });
  return output;
}
