import { Request, Response, NextFunction } from 'express';
import { z } from 'zod/v4';
import { ValidationError } from '../shared/errors';

type ValidationSource = 'body' | 'query' | 'params';

export function validate(schema: z.ZodType, source: ValidationSource = 'body') {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const message = z.prettifyError(result.error);
      throw new ValidationError(message);
    }
    const data = result.data;
    if (source === 'query') {
      Object.defineProperty(req, 'query', {
        value: data,
        writable: true,
        enumerable: true,
        configurable: true,
      });
    } else if (source === 'params') {
      Object.defineProperty(req, 'params', {
        value: data,
        writable: true,
        enumerable: true,
        configurable: true,
      });
    } else {
      (req as { body: unknown }).body = data;
    }
    next();
  };
}
