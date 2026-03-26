import { Server as HttpServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { logger } from '../shared/logger';
import type { JwtPayload } from '../middleware/auth';
import { handleWhiteboardMessage } from '../modules/whiteboard/whiteboard.ws';
import { handleDocumentMessage } from '../modules/documents/documents.ws';

interface AuthenticatedWebSocket extends WebSocket {
  userId?: string;
  email?: string;
  room?: string;
}

const rooms = new Map<string, Set<AuthenticatedWebSocket>>();

export function setupWebSocket(server: HttpServer) {
  const wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws: AuthenticatedWebSocket, req) => {
    const url = new URL(req.url || '', `http://${req.headers.host}`);
    const token = url.searchParams.get('token');

    if (!token) {
      ws.close(4001, 'Authentication required');
      return;
    }

    try {
      const decoded = jwt.verify(token, config.JWT_SECRET) as JwtPayload;
      ws.userId = decoded.userId;
      ws.email = decoded.email;
    } catch {
      ws.close(4001, 'Invalid token');
      return;
    }

    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        const { type, room, payload } = message;

        // Join room
        if (type === 'join') {
          if (ws.room) leaveRoom(ws);
          ws.room = room;
          joinRoom(room, ws);
          broadcastToRoom(room, { type: 'user:join', userId: ws.userId }, ws);
          return;
        }

        // Leave room
        if (type === 'leave') {
          broadcastToRoom(ws.room!, { type: 'user:leave', userId: ws.userId }, ws);
          leaveRoom(ws);
          return;
        }

        if (!ws.room) return;

        // Route to module handlers based on room prefix
        if (ws.room.startsWith('whiteboard:')) {
          await handleWhiteboardMessage(ws.room, ws.userId!, type, payload);
        } else if (ws.room.startsWith('document:')) {
          await handleDocumentMessage(ws.room, ws.userId!, type, payload);
        }

        // Broadcast to other room members
        broadcastToRoom(ws.room, { type, userId: ws.userId, payload }, ws);
      } catch (err) {
        logger.error(err, 'WebSocket message error');
        ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
      }
    });

    ws.on('close', () => {
      if (ws.room) {
        broadcastToRoom(ws.room, { type: 'user:leave', userId: ws.userId }, ws);
        leaveRoom(ws);
      }
    });

    ws.send(JSON.stringify({ type: 'connected', userId: ws.userId }));
  });

  logger.info('WebSocket server initialized');
  return wss;
}

function joinRoom(room: string, ws: AuthenticatedWebSocket) {
  if (!rooms.has(room)) {
    rooms.set(room, new Set());
  }
  rooms.get(room)!.add(ws);
}

function leaveRoom(ws: AuthenticatedWebSocket) {
  if (ws.room && rooms.has(ws.room)) {
    rooms.get(ws.room)!.delete(ws);
    if (rooms.get(ws.room)!.size === 0) {
      rooms.delete(ws.room);
    }
  }
  ws.room = undefined;
}

function broadcastToRoom(room: string, message: any, exclude?: AuthenticatedWebSocket) {
  const members = rooms.get(room);
  if (!members) return;

  const data = JSON.stringify(message);
  for (const client of members) {
    if (client !== exclude && client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  }
}
