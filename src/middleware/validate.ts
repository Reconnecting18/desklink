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
    (req as any)[source] = result.data;
    next();
  };
}
