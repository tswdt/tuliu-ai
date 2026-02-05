import * as tencentcloud from 'tencentcloud-sdk-nodejs';
import { env } from '@/lib/env';

const TmsClient = tencentcloud.tms.v20201229.Client;
const ImsClient = tencentcloud.ims.v20201229.Client;

const clientConfig = {
  credential: {
    secretId: env.TENCENT_CLOUD_SECRET_ID,
    secretKey: env.TENCENT_CLOUD_SECRET_KEY,
  },
  region: env.TENCENT_CLOUD_REGION,
  profile: {
    httpProfile: {
      endpoint: "tms.tencentcloudapi.com",
    },
  },
};

const tmsClient = new TmsClient(clientConfig);
const imsClient = new ImsClient({
  ...clientConfig,
  profile: {
    httpProfile: {
      endpoint: "ims.tencentcloudapi.com",
    },
  },
});

/**
 * 文本内容安全校验 (TMS)
 * 策略：Fail-closed (API 失败则拒绝访问)
 */
export async function validateText(content: string): Promise<boolean> {
  if (!content) return true;

  try {
    const params = {
      Content: Buffer.from(content).toString('base64'),
    };
    
    const data = await tmsClient.TextModeration(params);
    
    // Suggestion 为 Pass 表示通过，Block 表示违规，Review 表示建议人工复审
    // 为了严格安全，我们只允许 Pass
    return data.Suggestion === 'Pass';
  } catch (err) {
    console.error('TMS Validation Error:', err);
    // Fail-closed: API 调用失败，默认不通过
    return false;
  }
}

/**
 * 图片内容安全校验 (IMS)
 * 策略：Fail-closed
 */
export async function validateImage(url: string): Promise<boolean> {
  if (!url) return true;

  try {
    const params = {
      FileUrl: url,
    };
    
    const data = await imsClient.ImageModeration(params);
    
    // 同上，只允许 Pass
    return data.Suggestion === 'Pass';
  } catch (err) {
    console.error('IMS Validation Error:', err);
    // Fail-closed
    return false;
  }
}
