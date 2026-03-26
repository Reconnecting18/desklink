import type { StorageProvider } from './storage.interface';
import { LocalStorage } from './local.storage';
import { S3Storage } from './s3.storage';
import { config } from '../config';

let storageInstance: StorageProvider | null = null;

export function getStorage(): StorageProvider {
  if (!storageInstance) {
    if (config.STORAGE_PROVIDER === 's3') {
      if (!config.S3_BUCKET) {
        throw new Error('S3_BUCKET is required when STORAGE_PROVIDER=s3');
      }
      storageInstance = new S3Storage({
        bucket: config.S3_BUCKET,
        region: config.S3_REGION,
        accessKeyId: config.S3_ACCESS_KEY_ID,
        secretAccessKey: config.S3_SECRET_ACCESS_KEY,
        endpoint: config.S3_ENDPOINT,
      });
    } else {
      storageInstance = new LocalStorage();
    }
  }
  return storageInstance;
}

export type { StorageProvider };
