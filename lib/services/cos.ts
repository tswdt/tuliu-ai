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

export async function getJson<T>(key: string): Promise<{ data: T | null; etag?: string }> {
  return new Promise((resolve, reject) => {
    cos.getObject(
      {
        Bucket,
        Region,
        Key: key,
      },
      (err, data) => {
        if (err) {
          if (err.statusCode === 404) resolve({ data: null });
          else reject(err);
        } else {
          try {
            const content = data.Body.toString();
            resolve({ 
              data: JSON.parse(content) as T,
              etag: data.headers.etag 
            });
          } catch (e) {
            reject(e);
          }
        }
      }
    );
  });
}

export async function putJson(key: string, data: any, etag?: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const params: any = {
      Bucket,
      Region,
      Key: key,
      Body: JSON.stringify(data, null, 2),
      ContentType: 'application/json',
    };

    if (etag) {
      params.Headers = {
        'If-Match': etag,
      };
    }

    cos.putObject(params, (err, data) => {
      if (err) {
        if (err.statusCode === 412) {
          reject(new Error('Precondition Failed: Object has been modified (Concurrency Error)'));
        } else {
          reject(err);
        }
      } else {
        resolve();
      }
    });
  });
}

export async function configureBucketLifecycle(): Promise<void> {
  return new Promise((resolve, reject) => {
    cos.putBucketLifecycle(
      {
        Bucket,
        Region,
        Rules: [
          {
            Id: 'deleteJobsAfter7Days',
            Filter: {
              Prefix: 'jobs/', // Apply to objects under the 'jobs/' prefix
            },
            Status: 'Enabled',
            Expiration: {
              Days: 7, // Delete objects after 7 days
            },
          },
        ],
      },
      (err, data) => {
        if (err) reject(err);
        else {
          console.log('COS Bucket lifecycle configured successfully:', data);
          resolve();
        }
      }
    );
  });
}
