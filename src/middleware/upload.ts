import multer from 'multer';
import { config } from '../config';

const storage = multer.memoryStorage();

export function uploadSingle(fieldName: string) {
  return multer({
    storage,
    limits: { fileSize: config.MAX_FILE_SIZE },
  }).single(fieldName);
}

export function uploadMultiple(fieldName: string, maxCount = 10) {
  return multer({
    storage,
    limits: { fileSize: config.MAX_FILE_SIZE },
  }).array(fieldName, maxCount);
}
