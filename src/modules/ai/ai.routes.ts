import { Router } from 'express';
import * as aiController from './ai.controller';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { aiLimiter } from '../../middleware/rateLimiter';
import { summarizeSchema, generateSchema, suggestSchema } from './ai.schema';

const router = Router();

router.post('/summarize', authenticate, aiLimiter, validate(summarizeSchema), aiController.summarize);
router.post('/generate', authenticate, aiLimiter, validate(generateSchema), aiController.generate);
router.post('/suggest', authenticate, aiLimiter, validate(suggestSchema), aiController.suggest);
router.get('/history', authenticate, aiController.getHistory);

export default router;
