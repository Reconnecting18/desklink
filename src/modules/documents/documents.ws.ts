import * as documentsService from './documents.service';
import { logger } from '../../shared/logger';

export async function handleDocumentMessage(
  room: string,
  _userId: string,
  type: string,
  payload: any
) {
  const documentId = room.replace('document:', '');

  try {
    switch (type) {
      case 'content:update':
        if (payload.content) {
          await documentsService.updateDocument(documentId, { content: payload.content });
        }
        break;

      case 'cursor:move':
        // Cursor moves are broadcast-only, no persistence
        break;

      default:
        logger.warn({ type, room }, 'Unknown document WS message type');
    }
  } catch (err) {
    logger.error(err, 'Error handling document WS message');
  }
}
