import { Router } from 'express';
import * as whiteboardController from './whiteboard.controller';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import {
  createWhiteboardSchema,
  updateWhiteboardSchema,
  createElementSchema,
  updateElementSchema,
  addCollaboratorSchema,
} from './whiteboard.schema';

const router = Router();

// Workspace-scoped whiteboard routes
router.post('/workspaces/:workspaceId/whiteboards', authenticate, validate(createWhiteboardSchema), whiteboardController.create);
router.get('/workspaces/:workspaceId/whiteboards', authenticate, whiteboardController.list);
router.get('/workspaces/:workspaceId/whiteboards/:whiteboardId', authenticate, whiteboardController.get);
router.patch('/workspaces/:workspaceId/whiteboards/:whiteboardId', authenticate, validate(updateWhiteboardSchema), whiteboardController.update);
router.delete('/workspaces/:workspaceId/whiteboards/:whiteboardId', authenticate, whiteboardController.remove);

// Element routes
router.post('/whiteboards/:whiteboardId/elements', authenticate, validate(createElementSchema), whiteboardController.createElement);
router.patch('/whiteboards/:whiteboardId/elements/:elementId', authenticate, validate(updateElementSchema), whiteboardController.updateElement);
router.delete('/whiteboards/:whiteboardId/elements/:elementId', authenticate, whiteboardController.deleteElement);

// Collaborator routes
router.post('/whiteboards/:whiteboardId/collaborators', authenticate, validate(addCollaboratorSchema), whiteboardController.addCollaborator);
router.delete('/whiteboards/:whiteboardId/collaborators/:userId', authenticate, whiteboardController.removeCollaborator);

export default router;
