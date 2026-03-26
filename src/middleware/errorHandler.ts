import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { AppError } from '../shared/errors';
import { logger } from '../shared/logger';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: { message: err.message, statusCode: err.statusCode },
    });
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      res.status(409).json({
        success: false,
        error: { message: 'A record with that value already exists', statusCode: 409 },
      });
      return;
    }
    if (err.code === 'P2025') {
      res.status(404).json({
        success: false,
        error: { message: 'Record not found', statusCode: 404 },
      });
      return;
    }
  }

  logger.error(err, 'Unhandled error');

  const statusCode = 500;
  const message =
    process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message;

  res.status(statusCode).json({
    success: false,
    error: { message, statusCode },
  });
}
