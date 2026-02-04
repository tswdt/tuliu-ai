import COS from 'cos-nodejs-sdk-v5';
import { env } from '@/lib/env';

const cos = new COS({
  SecretId: env.TENCENT_COS_SECRET_ID,
  SecretKey: env.TENCENT_COS_SECRET_KEY,
});

const Bucket = env.TENCENT_COS_BUCKET;
const Region = env.TENCENT_COS_REGION;

export async function uploadFile(key: string, body: Buffer | string, contentType?: string): Promise<string> {
  return new Promise((resolve, reject) => {
    cos.putObject(
      {
        Bucket,
        Region,
        Key: key,
        Body: body,
        ContentType: contentType || (key.endsWith('.json') ? 'application/json' : 'image/png'),
      },
      (err, data) => {
        if (err) reject(err);
        else resolve(`https://${data.Location}`);
      }
    );
  });
}

export async function getJson<T>(key: string): Promise<T | null> {
  return new Promise((resolve, reject) => {
    cos.getObject(
      {
        Bucket,
        Region,
        Key: key,
      },
      (err, data) => {
        if (err) {
          if (err.statusCode === 404) resolve(null);
          else reject(err);
        } else {
          try {
            const content = data.Body.toString();
            resolve(JSON.parse(content) as T);
          } catch (e) {
            reject(e);
          }
        }
      }
    );
  });
}

export async function putJson(key: string, data: any): Promise<void> {
  await uploadFile(key, JSON.stringify(data, null, 2), 'application/json');
}
