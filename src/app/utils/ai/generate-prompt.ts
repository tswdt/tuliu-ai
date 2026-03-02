// app/utils/ai/generate-prompt.ts
import { logger } from '@/app/utils/logger';

const ALIYUN_ACCESS_KEY_ID = process.env.ALIYUN_ACCESS_KEY_ID;
const ALIYUN_ACCESS_KEY_SECRET = process.env.ALIYUN_ACCESS_KEY_SECRET;
const ALIYUN_VISION_REGION = process.env.ALIYUN_VISION_REGION || 'cn-shanghai';

// 全品类提示词模板（已扩展）
const PROMPT_TEMPLATES = {
  clothing: (productInfo: any, platform: string) => {
    // 平台特性：淘宝鲜艳、亚马逊简约、抖音竖版
    const platformStyle = {
      taobao: "风格鲜艳、色彩饱满，符合淘宝首页风格",
      amazon: "风格简约、白底为主，符合亚马逊主图规范",
      douyin: "竖版1080x1920，风格时尚，符合抖音电商风格",
      default: "风格通用，符合电商平台规范"
    }[platform] || "风格通用，符合电商平台规范";

    return `
      电商${platform}主图，${productInfo.color}${productInfo.style}${productInfo.category}，
      材质：${productInfo.material}，卖点：${productInfo.sellingPoints.join("、")}，
      模特上身展示，背景为简约纯色，4K超清，无水印，${platformStyle}，
      商用无版权，色彩还原真实，光线自然
    `.trim();
  },
  food: (productInfo: any, platform: string) => {
    const platformStyle = {
      jd: "风格清晰、质感突出，符合京东自营风格",
      pdd: "风格亲民、价格醒目，符合拼多多风格",
      default: "风格通用，符合电商平台规范"
    }[platform] || "风格通用，符合电商平台规范";

    return `
      电商${platform}主图，${productInfo.name}，${productInfo.category}，
      卖点：${productInfo.sellingPoints.join("、")}，生产日期新鲜，
      放在干净的桌面场景，搭配餐具/食材，4K超清，无水印，${platformStyle}，
      商用无版权，色彩鲜艳，有食欲
    `.trim();
  },
  electronics: (productInfo: any, platform: string) => {
    const platformStyle = {
      amazon: "风格简约、白底为主，突出产品细节，符合亚马逊规范",
      taobao: "风格科技感、色彩丰富，符合淘宝数码类目风格",
      default: "风格通用，符合电商平台规范"
    }[platform] || "风格通用，符合电商平台规范";

    return `
      电商${platform}主图，${productInfo.name}，${productInfo.category}，
      卖点：${productInfo.sellingPoints.join("、")}，放在科技感桌面，
      展示产品细节（屏幕/接口），4K超清，无水印，${platformStyle}，
      商用无版权，光线柔和，突出科技感
    `.trim();
  },
  beauty: (productInfo: any, platform: string) => {
    const platformStyle = {
      xhs: "风格ins风、质感高级，符合小红书种草风格",
      taobao: "风格鲜艳、卖点突出，符合淘宝美妆类目风格",
      default: "风格通用，符合电商平台规范"
    }[platform] || "风格通用，符合电商平台规范";

    return `
      电商${platform}主图，${productInfo.name}，${productInfo.category}，
      卖点：${productInfo.sellingPoints.join("、")}，质地细腻，无刺激，
      放在ins风化妆台场景，搭配美妆工具，4K超清，无水印，${platformStyle}，
      商用无版权，色彩柔和，突出高级质感
    `.trim();
  },
  baby: (productInfo: any, platform: string) => {
    const platformStyle = {
      pdd: "风格亲民、安全突出，符合拼多多母婴类目风格",
      taobao: "风格温馨、细节丰富，符合淘宝母婴类目风格",
      default: "风格通用，符合电商平台规范"
    }[platform] || "风格通用，符合电商平台规范";

    return `
      电商${platform}主图，${productInfo.name}，${productInfo.category}，
      卖点：${productInfo.sellingPoints.join("、")}，安全无异味，亲肤材质，
      放在温馨的婴儿房场景，搭配婴儿玩具，4K超清，无水印，${platformStyle}，
      商用无版权，色彩柔和，突出安全可靠
    `.trim();
  },
  home: (productInfo: any, platform: string) => {
    const platformStyle = {
      tmall: "风格高端、质感突出，符合天猫家居类目风格",
      jd: "风格清晰、细节丰富，符合京东家居类目风格",
      default: "风格通用，符合电商平台规范"
    }[platform] || "风格通用，符合电商平台规范";

    return `
      电商${platform}主图，${productInfo.name}，${productInfo.category}，
      卖点：${productInfo.sellingPoints.join("、")}，环保材质，简约设计，
      放在现代家居场景（客厅/卧室），搭配其他家居用品，4K超清，无水印，${platformStyle}，
      商用无版权，光线自然，突出家居氛围感
    `.trim();
  },
  default: (productInfo: any, platform: string) => {
    const platformStyle = {
      default: "风格通用，符合电商平台规范"
    }[platform] || "风格通用，符合电商平台规范";

    return `
      电商${platform}主图，${productInfo.name}，${productInfo.category}，
      卖点：${productInfo.sellingPoints.join("、")}，放在适合的使用场景，
      4K超清，无水印，${platformStyle}，商用无版权
    `.trim();
  },
};

/**
 * 用阿里云商品识别API识别商品并生成专属提示词
 * @param cutoutImageUrl 抠图后的商品图URL
 * @param platform 目标电商平台（taobao/jd/amazon等）
 * @returns 生成的电商提示词
 */
export async function generateProductPrompt(cutoutImageUrl: string, platform: string): Promise<string> {
  if (!ALIYUN_ACCESS_KEY_ID || !ALIYUN_ACCESS_KEY_SECRET) {
    throw new Error("未配置阿里云AccessKey，请检查.env文件");
  }

  try {
    // 1. 获取阿里云视觉Token
    const visionToken = await getAliyunVisionToken();

    // 2. 调用阿里云商品识别API
    const response = await fetch(`https://imageprocess.${ALIYUN_VISION_REGION}.aliyuncs.com/objectdetect/recognize`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${visionToken}`,
      },
      body: JSON.stringify({
        image_url: cutoutImageUrl,
        model_type: "PRODUCT", // 商品识别模型，适配全品类
        return_format: "JSON",
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(`阿里云商品识别失败：${errorData.message || "未知错误"}`);
    }

    const data = await response.json();
    const productInfo = formatProductInfo(data.data);
    logger.info("阿里云商品识别成功", { productInfo, platform });

    // 3. 根据品类选择提示词模板并生成提示词
    let templateKey = 'default';
    const category = productInfo.category?.toLowerCase() || 'default';
    
    if (category.includes('服装') || category.includes('clothing') || 
        category.includes('衣服') || category.includes('t恤') || 
        category.includes('衬衫') || category.includes('裤子')) {
      templateKey = 'clothing';
    } else if (category.includes('食品') || category.includes('food') || 
               category.includes('饮料') || category.includes('零食') || 
               category.includes('水果')) {
      templateKey = 'food';
    } else if (category.includes('电子') || category.includes('electronics') || 
               category.includes('手机') || category.includes('电脑') || 
               category.includes('数码')) {
      templateKey = 'electronics';
    } else if (category.includes('美妆') || category.includes('beauty') || 
               category.includes('化妆') || category.includes('护肤') || 
               category.includes('口红') || category.includes('面膜')) {
      templateKey = 'beauty';
    } else if (category.includes('母婴') || category.includes('baby') || 
               category.includes('婴儿') || category.includes('儿童') || 
               category.includes('玩具') || category.includes('奶粉')) {
      templateKey = 'baby';
    } else if (category.includes('家居') || category.includes('home') || 
               category.includes('家具') || category.includes('装饰') || 
               category.includes('家纺') || category.includes('厨具')) {
      templateKey = 'home';
    }
    
    const template = PROMPT_TEMPLATES[templateKey as keyof typeof PROMPT_TEMPLATES];
    const prompt = template(productInfo, platform);
    logger.info("生成专属提示词", { prompt });
    return prompt;

  } catch (error) {
    logger.error("生成提示词异常", { error: (error as Error).message, cutoutImageUrl });
    throw error;
  }
}

/**
 * 格式化阿里云商品识别返回的信息
 */
function formatProductInfo(rawData: any): any {
  // 格式化阿里云返回的商品信息，适配提示词模板
  return {
    category: rawData.category || "default",
    name: rawData.name || "未知商品",
    color: rawData.color || "未知颜色",
    material: rawData.material || "未知材质",
    sellingPoints: rawData.selling_points || ["通用卖点"],
    style: rawData.style || "通用风格",
  };
}

/**
 * 获取阿里云视觉智能平台Token
 */
async function getAliyunVisionToken(): Promise<string> {
  const response = await fetch(`https://sts.aliyuncs.com/?Action=AssumeRole&Version=2015-04-01&RoleArn=acs:ram::1234567890123456:role/aliyunimageprocessrole&RoleSessionName=vision-session&DurationSeconds=3600`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      AccessKeyId: ALIYUN_ACCESS_KEY_ID!,
      AccessKeySecret: ALIYUN_ACCESS_KEY_SECRET!,
      Action: "AssumeRole",
      Version: "2015-04-01",
      RoleArn: `acs:ram::${await getAliyunAccountId()}:role/aliyunimageprocessrole`,
      RoleSessionName: "vision-session",
      DurationSeconds: "3600",
    }),
  });

  if (!response.ok) {
    throw new Error("获取阿里云视觉Token失败");
  }

  const data = await response.json();
  return data.Credentials.AccessKeyId;
}

/**
 * 获取阿里云账号ID
 */
async function getAliyunAccountId(): Promise<string> {
  const response = await fetch(`https://ecs.${ALIYUN_VISION_REGION}.aliyuncs.com/?Action=DescribeInstances&Version=2014-05-26`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      AccessKeyId: ALIYUN_ACCESS_KEY_ID!,
      AccessKeySecret: ALIYUN_ACCESS_KEY_SECRET!,
      Action: "DescribeInstances",
      Version: "2014-05-26",
    }),
  });

  if (!response.ok) {
    throw new Error("获取阿里云账号ID失败");
  }

  const data = await response.json();
  return data.AccountId;
}
