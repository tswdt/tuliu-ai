// 腾讯云 COS 存储服务
import COS from 'cos-nodejs-sdk-v5';
import { ENV } from './_core/env';

let cosClient: COS | null = null;

function getCOSClient(): COS {
  if (!cosClient) {
    if (!ENV.cosSecretId || !ENV.cosSecretKey) {
      throw new Error('COS credentials not configured');
    }
    cosClient = new COS({
      SecretId: ENV.cosSecretId,
      SecretKey: ENV.cosSecretKey,
    });
  }
  return cosClient;
}

export async function cosUpload(
  key: string,
  data: Buffer,
  contentType: string
): Promise<{ key: string; url: string }> {
  const cos = getCOSClient();
  const bucket = ENV.cosBucket;
  const region = ENV.cosRegion;

  if (!bucket || !region) {
    throw new Error('COS bucket or region not configured');
  }

  return new Promise((resolve, reject) => {
    cos.putObject(
      {
        Bucket: bucket,
        Region: region,
        Key: key,
        Body: data,
        ContentType: contentType,
      },
      (err, data) => {
        if (err) {
          reject(err);
        } else {
          const url = `https://${bucket}.cos.${region}.myqcloud.com/${key}`;
          resolve({ key, url });
        }
      }
    );
  });
}
