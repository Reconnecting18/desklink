export interface StorageProvider {
  save(key: string, buffer: Buffer, mimeType: string): Promise<string>;
  read(key: string): Promise<Buffer>;
  delete(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
}
