import fs from 'fs/promises';
import path from 'path';
import { config } from '../config';
import type { StorageProvider } from './storage.interface';

export class LocalStorage implements StorageProvider {
  private basePath: string;

  constructor() {
    this.basePath = path.resolve(config.UPLOAD_DIR);
  }

  private fullPath(key: string): string {
    return path.join(this.basePath, key);
  }

  async save(key: string, buffer: Buffer, _mimeType: string): Promise<string> {
    const filePath = this.fullPath(key);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, buffer);
    return key;
  }

  async read(key: string): Promise<Buffer> {
    return fs.readFile(this.fullPath(key));
  }

  async delete(key: string): Promise<void> {
    try {
      await fs.unlink(this.fullPath(key));
    } catch (err: any) {
      if (err.code !== 'ENOENT') throw err;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      await fs.access(this.fullPath(key));
      return true;
    } catch {
      return false;
    }
  }
}
