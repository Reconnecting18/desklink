import http from 'http';
import { config } from './config';
import { createApp } from './app';
import { setupWebSocket } from './websocket';
import { logger } from './shared/logger';

const app = createApp();
const server = http.createServer(app);

// Initialize WebSocket
setupWebSocket(server);

server.listen(config.PORT, () => {
  logger.info(`DeskLink API running on port ${config.PORT} [${config.NODE_ENV}]`);
  logger.info(`AI Provider: ${config.AI_PROVIDER}`);
  logger.info(`Health check: http://localhost:${config.PORT}/api/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down...');
  server.close(() => process.exit(0));
});
