import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import { logger } from './shared/logger';
import { errorHandler } from './middleware/errorHandler';
import { defaultLimiter } from './middleware/rateLimiter';

// Module routes
import { authRoutes } from './modules/auth';
import { workspaceRoutes } from './modules/workspace';
import { plannerRoutes } from './modules/planner';
import { filesRoutes } from './modules/files';
import { documentsRoutes } from './modules/documents';
import { whiteboardRoutes } from './modules/whiteboard';
import { mockupsRoutes } from './modules/mockups';
import { aiRoutes } from './modules/ai';

export function createApp() {
  const app = express();

  // Global middleware
  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(pinoHttp({ logger }));
  app.use(defaultLimiter);

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API routes
  app.use('/api/auth', authRoutes);
  app.use('/api/workspaces', workspaceRoutes);
  app.use('/api', plannerRoutes);
  app.use('/api', filesRoutes);
  app.use('/api', documentsRoutes);
  app.use('/api', whiteboardRoutes);
  app.use('/api', mockupsRoutes);
  app.use('/api/ai', aiRoutes);

  // Error handler (must be last)
  app.use(errorHandler);

  return app;
}
