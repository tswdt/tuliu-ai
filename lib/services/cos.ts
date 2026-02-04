import COS from 'cos-nodejs-sdk-v5';

const cos = new COS({
  SecretId: process.env.TENCENT_COS_SECRET_ID!,
  SecretKey: process.env.TENCENT_COS_SECRET_KEY!,
});

const Bucket = process.env.TENCENT_COS_BUCKET!;
const Region = process.env.TENCENT_COS_REGION!;

export async function uploadFile(key: string, body: Buffer | string): Promise<string> {
  return new Promise((resolve, reject) => {
    cos.putObject(
      {
        Bucket,
        Region,
        Key: key,
        Body: body,
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
  await uploadFile(key, JSON.stringify(data, null, 2));
}
