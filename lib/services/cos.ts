import COS from 'cos-nodejs-sdk-v5';
import type { Stream } from 'stream';
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
              etag: data.headers?.etag 
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

export const MAX_UPLOAD_SIZE = 20 * 1024 * 1024; // 20MB

export async function uploadStream(stream: Stream, key: string, contentType: string): Promise<string> {
  return new Promise((resolve, reject) => {
    cos.putObject(
      {
        Bucket,
        Region,
        Key: key,
        Body: stream,
        ContentType: contentType,
      },
      (err, data) => {
        if (err) reject(err);
        else resolve(`https://${data.Location}`);
      }
    );
  });
}

export async function uploadFromUrl(url: string, key: string, contentType: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch from URL: ${response.statusText}`);
  if (!response.body) throw new Error('No response body');

  const contentLength = response.headers.get('content-length');
  if (contentLength && parseInt(contentLength, 10) > MAX_UPLOAD_SIZE) {
    throw new Error(`Response size ${contentLength} bytes exceeds 20MB limit`);
  }

  // Stream the response body directly to COS
  const { Readable } = await import('stream');
  const nodeStream = Readable.fromWeb(response.body as any);

  return new Promise((resolve, reject) => {
    cos.putObject(
      {
        Bucket,
        Region,
        Key: key,
        Body: nodeStream,
        ContentType: contentType,
      },
      (err, data) => {
        if (err) reject(err);
        else resolve(`https://${data.Location}`);
      }
    );
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
            ID: 'deleteJobsAfter7Days',
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
