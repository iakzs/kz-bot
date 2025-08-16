import { r2Client, BUCKET_NAME } from './r2';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';
import path from 'path';
import { logger } from 'robo.js';

function getContentType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  const mimeTypes: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.pdf': 'application/pdf',
    '.txt': 'text/plain'
  };
  return mimeTypes[ext] || 'application/octet-stream';
}

export async function uploadFile(fileBuffer: Buffer, filename = 'image.png'): Promise<string> {
  try {
    const randomId = crypto.randomBytes(8).toString('hex');
    const fileExt = path.extname(filename);
    const baseName = path.basename(filename, fileExt);
    const sanitizedBaseName = baseName.replace(/[^a-zA-Z0-9]/g, '-');
    const key = `uploads/${sanitizedBaseName}-${randomId}${fileExt}`;

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: fileBuffer,
      ContentType: getContentType(filename),
      CacheControl: 'max-age=31536000'
    });

    await r2Client.send(command);

    const url = `https://${BUCKET_NAME}.r2.dev/${key}`;

    logger.info(`File uploaded successfully to R2: ${url}`);
    return url;
  } catch (error) {
    logger.error('Error uploading file to R2:', error);
    throw new Error(`Failed to upload file to R2: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export function getPublicUrl(key: string): string {
  return `https://${BUCKET_NAME}.r2.dev/${key}`;
}
