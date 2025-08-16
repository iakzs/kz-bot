﻿import { S3Client } from '@aws-sdk/client-s3';

export const BUCKET_NAME = process.env.R2_BUCKET_NAME || '';

export const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || ''
  }
});

if (!BUCKET_NAME || !process.env.R2_ACCOUNT_ID || !process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY) {
  console.warn('⚠️ Warning: R2 storage configuration is incomplete. File upload and retrieval features will not work correctly.');
}
