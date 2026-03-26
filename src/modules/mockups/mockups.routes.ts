import { Router } from 'express';
import * as mockupsController from './mockups.controller';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import {
  createMockupSchema,
  updateMockupSchema,
  createScreenSchema,
  updateScreenSchema,
  reorderScreensSchema,
  createAnnotationSchema,
  updateAnnotationSchema,
} from './mockups.schema';

const router = Router();

// Workspace-scoped mockup routes
router.post('/workspaces/:workspaceId/mockups', authenticate, validate(createMockupSchema), mockupsController.create);
router.get('/workspaces/:workspaceId/mockups', authenticate, mockupsController.list);
router.get('/workspaces/:workspaceId/mockups/:mockupId', authenticate, mockupsController.get);
router.patch('/workspaces/:workspaceId/mockups/:mockupId', authenticate, validate(updateMockupSchema), mockupsController.update);
router.delete('/workspaces/:workspaceId/mockups/:mockupId', authenticate, mockupsController.remove);

// Screen routes
router.post('/mockups/:mockupId/screens', authenticate, validate(createScreenSchema), mockupsController.createScreen);
router.get('/mockups/:mockupId/screens/:screenId', authenticate, mockupsController.getScreen);
router.patch('/mockups/:mockupId/screens/:screenId', authenticate, validate(updateScreenSchema), mockupsController.updateScreen);
router.delete('/mockups/:mockupId/screens/:screenId', authenticate, mockupsController.deleteScreen);
router.patch('/mockups/:mockupId/screens/reorder', authenticate, validate(reorderScreensSchema), mockupsController.reorderScreens);

// Annotation routes
router.post('/mockups/:mockupId/screens/:screenId/annotations', authenticate, validate(createAnnotationSchema), mockupsController.createAnnotation);
router.patch('/mockups/annotations/:annotationId', authenticate, validate(updateAnnotationSchema), mockupsController.updateAnnotation);
router.delete('/mockups/annotations/:annotationId', authenticate, mockupsController.deleteAnnotation);

export default router;
