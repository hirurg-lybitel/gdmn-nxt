import { Client } from 'minio';

const user = process.env['MINIO_ROOT_USER'];
const password = process.env['MINIO_ROOT_PASSWORD'];
const minioHost = process.env['MINIO_HOST'] ?? 'minio';
const minioPort = Number(process.env['MINIO_PORT'] ?? '9000');

export const minioClient = new Client({
  endPoint: minioHost,
  port: minioPort,
  useSSL: false,
  accessKey: user,
  secretKey: password,
});

export enum buckets {
  ticketMessages = 'crm-ticket-messages'
};

async function initBuckets() {
  try {
    for (const bucketName of Object.values(buckets)) {

      const exists = await minioClient.bucketExists(bucketName);
      if (!exists) {
        await minioClient.makeBucket(bucketName);
        console.log(`✅ Bucket ${bucketName} created`);
      } else {
        console.log(`📦 Bucket ${bucketName} already exists`);
      }

    }
    console.log(`📦 Buckets initialized`);
  } catch (error) {
    console.error(error);
  }
}

initBuckets();

export const putBase64MinioFile = async (bucket: buckets, path: string, file: string, size?: number) => {
  const matches = file.match(/^data:(.+);base64,(.+)$/);
  if (!matches) return;
  const mimeType = matches[1];
  const base64Data = matches[2];

  const buffer = Buffer.from(base64Data, 'base64');

  return await minioClient.putObject(bucket, path, buffer, size, {
    'Content-Type': mimeType
  });
};

export const getBase64MinioFile = async (bucket: buckets, path: string) => {
  try {
    const stat = await minioClient.statObject(bucket, path);
    if (!stat) throw new Error('File not found');
    const stream = await minioClient.getObject(bucket, path);
    const mimeType = stat.metaData['content-type'] || 'application/octet-stream';

    const chunks: Buffer[] = [];

    for await (const chunk of stream) {
      chunks.push(chunk as Buffer);
    }

    const buffer = Buffer.concat(chunks);
    const base64 = buffer.toString('base64');

    return {
      fileName: path,
      size: stat.size,
      content: `data:${mimeType};base64,${base64}`,
    };
  } catch (err) {
    console.error(`getBase64MinioFile: ${err}`);
  }
};
