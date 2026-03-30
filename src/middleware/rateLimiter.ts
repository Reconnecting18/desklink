import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { config } from '../config';

export function createRateLimiter(windowMs?: number, max?: number) {
  if (config.NODE_ENV === 'test') {
    return (_req: Request, _res: Response, next: NextFunction) => {
      next();
    };
  }
  return rateLimit({
    windowMs: windowMs ?? config.RATE_LIMIT_WINDOW_MS,
    max: max ?? config.RATE_LIMIT_MAX,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: { message: 'Too many requests', statusCode: 429 } },
  });
}

export const defaultLimiter = createRateLimiter();
export const authLimiter = createRateLimiter(900000, 20);
export const aiLimiter = createRateLimiter(900000, 30);
