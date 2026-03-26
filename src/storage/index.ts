import type { StorageProvider } from './storage.interface';
import { LocalStorage } from './local.storage';

let storageInstance: StorageProvider | null = null;

export function getStorage(): StorageProvider {
  if (!storageInstance) {
    // Future: switch on config to use S3, Azure, etc.
    storageInstance = new LocalStorage();
  }
  return storageInstance;
}

export type { StorageProvider };
