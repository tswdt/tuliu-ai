// app/utils/oss/remove-background.ts
import { logger } from '@/app/utils/logger';
import OSS from 'ali-oss';

const ALIYUN_ACCESS_KEY_ID = process.env.ALIYUN_ACCESS_KEY_ID;
const ALIYUN_ACCESS_KEY_SECRET = process.env.ALIYUN_ACCESS_KEY_SECRET;
const ALIYUN_OSS_BUCKET = process.env.ALIYUN_OSS_BUCKET;
const ALIYUN_OSS_REGION = process.env.ALIYUN_OSS_REGION;
const ALIYUN_VISION_REGION = process.env.ALIYUN_VISION_REGION || 'cn-shanghai';

let _ossClient: InstanceType<typeof OSS> | null = null;

function getOssClient(): InstanceType<typeof OSS> {
  if (!_ossClient) {
    _ossClient = new OSS({
      region: ALIYUN_OSS_REGION || 'oss-cn-shanghai',
      accessKeyId: ALIYUN_ACCESS_KEY_ID || '',
      accessKeySecret: ALIYUN_ACCESS_KEY_SECRET || '',
      bucket: ALIYUN_OSS_BUCKET || '',
    });
  }
  return _ossClient;
}

/**
 * 阿里云通用物体抠图（适配全品类商品）
 * @param imageUrl 用户上传的商品图URL
 * @returns 抠图后的透明背景商品图URL
 */
export async function removeProductBackground(imageUrl: string): Promise<string> {
  if (!ALIYUN_ACCESS_KEY_ID || !ALIYUN_ACCESS_KEY_SECRET || !ALIYUN_OSS_BUCKET) {
    throw new Error("未配置阿里云OSS/视觉智能平台AccessKey，请检查.env文件");
  }

  try {
    // 1. 调用阿里云视觉智能开放平台通用抠图API
    const visionResponse = await fetch(`https://imageprocess.${ALIYUN_VISION_REGION}.aliyuncs.com/objectdetect/segment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${await getAliyunVisionToken()}`,
      },
      body: JSON.stringify({
        image_url: imageUrl,
        model_type: "GENERAL", // 通用物体抠图，适配全品类
        return_format: "URL",
      }),
    });

    if (!visionResponse.ok) {
      const errorData = await visionResponse.json().catch(() => ({ message: visionResponse.statusText }));
      throw new Error(`阿里云抠图失败：${errorData.message || "未知错误"}`);
    }

    const visionData = await visionResponse.json();
    const cutoutImageUrl = visionData.data.image_url;

    // 2. 将抠图后的图片上传到阿里云OSS持久化存储
    const cutoutFileName = `cutout/${Date.now()}-${Math.random().toString(36).substring(2, 10)}.png`;
    const response = await fetch(cutoutImageUrl);
    const buffer = await response.arrayBuffer();
    await getOssClient().put(cutoutFileName, Buffer.from(buffer));

    const ossCutoutUrl = getOssClient().signatureUrl(cutoutFileName, { expires: 3600 * 24 * 7 });
    logger.info("商品图抠图并上传OSS成功", { originalUrl: imageUrl, cutoutUrl: ossCutoutUrl });
    return ossCutoutUrl;

  } catch (error) {
    logger.error("商品图抠图异常", { error: (error as Error).message, imageUrl });
    throw error;
  }
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
