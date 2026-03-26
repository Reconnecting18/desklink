import * as whiteboardService from './whiteboard.service';
import { logger } from '../../shared/logger';

export async function handleWhiteboardMessage(
  room: string,
  userId: string,
  type: string,
  payload: any
) {
  const whiteboardId = room.replace('whiteboard:', '');

  try {
    switch (type) {
      case 'element:create':
        await whiteboardService.createElement(whiteboardId, payload);
        break;

      case 'element:update':
        if (payload.id) {
          await whiteboardService.updateElement(payload.id, payload);
        }
        break;

      case 'element:delete':
        if (payload.id) {
          await whiteboardService.deleteElement(payload.id);
        }
        break;

      case 'element:lock':
        if (payload.id) {
          await whiteboardService.lockElement(payload.id, userId);
        }
        break;

      case 'element:unlock':
        if (payload.id) {
          await whiteboardService.unlockElement(payload.id);
        }
        break;

      case 'cursor:move':
        // Cursor moves are broadcast-only, no persistence needed
        break;

      default:
        logger.warn({ type, room }, 'Unknown whiteboard WS message type');
    }
  } catch (err) {
    logger.error(err, 'Error handling whiteboard WS message');
  }
}
